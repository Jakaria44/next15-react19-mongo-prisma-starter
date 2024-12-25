"use server";

import { signIn, signOut } from "@/auth";
import { db } from "@/db";
import { LoginFormSchema, signupFormSchema } from "@/lib/types";
import { saltAndHashPassword } from "@/utils/helper";
import { Prisma } from "@prisma/client";
import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";
import { z } from "zod";

const getUserByEmail = async (email: string) => {
  try {
    return await db.user.findUnique({
      where: {
        email,
      },
    });
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const login = async (provider: string) => {
  await signIn(provider, { redirectTo: "/" });
  revalidatePath("/");
};

export const logout = async () => {
  await signOut({ redirectTo: "/" });
  revalidatePath("/");
};

export const loginWithCreds = async (formData: unknown) => {
  const result = LoginFormSchema.safeParse(formData);

  if (!result.success) {
    let errorMessage = "";

    result.error.issues.forEach((issue) => {
      errorMessage += issue.message + " " + issue.path.join(" ") + " ";
    });

    return { error: errorMessage };
  }

  const existingUser = await getUserByEmail(result.data.email);
  console.log(existingUser);

  try {
    await signIn("credentials", {
      ...result.data,
      redirectTo: "/",
    });
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  } catch (error: any) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin":
          return { error: "Invalid credentials!" };
        default:
          return { error: "Something went wrong!" };
      }
    }

    throw error;
  }
  revalidatePath("/");
};

export const signUp = async (formData: unknown) => {
  console.log("inside signup", formData);

  const result = signupFormSchema.safeParse({ formData });

  console.log("result,", result);
  if (!result.success) {
    let errorMessage = "";

    result.error.issues.forEach((issue) => {
      errorMessage += issue.message + " " + issue.path.join(" ") + " ";
    });

    return { error: errorMessage };
  }

  const existingUser = await getUserByEmail(result.data.email);

  console.log(existingUser);
  if (existingUser) {
    console.log(existingUser);
    return { error: "User already exists!" };
  }

  const user: Prisma.UserCreateInput = {
    name: result.data.name,
    email: result.data.email,
    hashedPassword: saltAndHashPassword(result.data.password),
    role: "MEMBER",
    status: "PENDING",
  };

  console.log(user);
  try {
    await db.user.create({ data: user });

    return {
      success: true,
      message:
        "User created successfully! You will be notified once your account is approved!",
    };
    /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  } catch (error: any) {
    return { error: "Something went wrong!" + error.toString() };
  }
};

export const transformZodErrors = async (error: z.ZodError) => {
  return error.issues.map((issue) => ({
    path: issue.path.join("."),
    message: issue.message,
  }));
};

export async function registerMember(formData: FormData) {
  try {
    console.log(formData);
    console.log(Object.getPrototypeOf(formData.get("image")));

    const validatedFields = signupFormSchema.parse({
      name: formData.get("name"),
      email: formData.get("email"),
      password: formData.get("password"),
      image: formData.get("image") as File,
    });

    console.log({ validatedFields });

    const existingUser = await getUserByEmail(validatedFields.email);

    if (existingUser) {
      return {
        data: null,
        errors: [{ message: "Email already exists" }],
      };
    }

    const hashedPassword = saltAndHashPassword(validatedFields.password);
    const user: Prisma.UserCreateInput = {
      name: validatedFields.name,
      email: validatedFields.email,
      hashedPassword: hashedPassword,
      role: "MEMBER",
      status: "PENDING",
    };

    await db.user.create({ data: user });

    return {
      errors: null,
      data: "success",
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        errors: transformZodErrors(error),
        data: null,
      };
    }

    if (error instanceof Error) {
      return {
        errors: [{ message: error.message }],
        data: null,
      };
    }

    return {
      errors: {
        message: "An unexpected error occurred. Could not create shelf.",
      },
      data: null,
    };
  }
}
