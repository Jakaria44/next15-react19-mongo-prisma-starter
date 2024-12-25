"use server";

import { signIn, signOut } from "@/auth";
import { db } from "@/db";
import { signinFormSchema, signupFormSchema } from "@/lib/types";
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

export async function signinWithCreds(formData: FormData) {
  try {
    const validatedFields = signinFormSchema.parse({
      email: formData.get("email"),
      password: formData.get("password"),
    });

    try {
      const result = await signIn("credentials", {
        ...validatedFields,
        redirect: false,
      });

      if (result?.error) {
        return {
          data: null,
          errors: [{ message: result.error }],
        };
      }

      return {
        errors: null,
        data: "success",
      };
    } catch (error) {
      if (error instanceof AuthError) {
        return {
          data: null,
          errors: [{ message: error.message }],
        };
      }
      throw error;
    }
  } catch (error: unknown) {
    if (error instanceof z.ZodError) {
      return {
        errors: transformZodErrors(error),
        data: null,
      };
    }
    return {
      errors: [{ message: "An unexpected error occurred" }],
      data: null,
    };
  }
}

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
