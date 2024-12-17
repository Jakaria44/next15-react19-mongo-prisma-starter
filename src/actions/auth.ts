"use server";

import {signIn, signOut} from "@/auth";
import {db} from "@/db";
import {AuthError} from "next-auth";
import {revalidatePath} from "next/cache";
import {LoginFormSchema} from "@/lib/types";

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
	await signIn(provider, {redirectTo: "/"});
	revalidatePath("/");
};

export const logout = async () => {
	await signOut({redirectTo: "/"});
	revalidatePath("/");
};

export const loginWithCreds = async (formData: unknown) => {

	const result = LoginFormSchema.safeParse(formData);

	if (!result.success) {
		let errorMessage = "";

		result.error.issues.forEach((issue) => {
			errorMessage += issue.message + " " + issue.path.join(" ") + " ";

		})

		return {error: errorMessage};

	}


	const existingUser = await getUserByEmail(result.data.email);
	console.log(existingUser);

	try {
		await signIn("credentials",
			{
				...result.data,
				redirectTo: "/"
			});
		/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
	} catch (error: any) {
		if (error instanceof AuthError) {
			switch (error.type) {
				case "CredentialsSignin":
					return {error: "Invalid credentials!"};
				default:
					return {error: "Something went wrong!"};
			}
		}

		throw error;
	}
	revalidatePath("/");
};
