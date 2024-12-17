'use client';

import React, {useState, useEffect} from "react";
import AuthButton from "./AuthButton";
import {loginWithCreds} from "@/actions/auth";
import {LoginFormSchema} from "@/lib/types";
import {toast} from "@/hooks/use-toast";

const LoginForm = () => {
	const [emailError, setEmailError] = useState<string | null>(null);
	const [passwordError, setPasswordError] = useState<string | null>(null);

	const loginAction = async (formData: FormData) => {
		const newUser = {
			email: formData.get("email") as string,
			password: formData.get("password") as string,
		};

		const result = LoginFormSchema.safeParse(newUser);

		if (!result.success) {
			const formattedErrors = result.error.format();
			setEmailError(formattedErrors.email?._errors.join(", ") || null);
			setPasswordError(formattedErrors.password?._errors.join(", ") || null);
			return;
		}
		setEmailError(null);
		setPasswordError(null);

		const response = await loginWithCreds(result.data);
		if (response?.error) {
			toast({
				variant: "destructive",
				title: "Error while signing in",
				description: response.error,
			})
		}
	};

	useEffect(() => {
		const clearErrors = () => {
			setEmailError(null);
			setPasswordError(null);
		};

		const emailInput = document.getElementById("email");
		const passwordInput = document.getElementById("password");

		emailInput?.addEventListener("input", clearErrors);
		passwordInput?.addEventListener("input", clearErrors);

		return () => {
			emailInput?.removeEventListener("input", clearErrors);
			passwordInput?.removeEventListener("input", clearErrors);
		};
	}, []);

	return (
		<div>
			<form action={loginAction} className="w-full flex flex-col gap-4">
				<div>
					<label htmlFor="email" className="block text-sm font-medium text-gray-200">
						Email
					</label>
					<input
						type="email"
						placeholder="Email"
						id="email"
						name="email"
						className="mt-1 w-full px-4 p-2 h-10 rounded-md border border-gray-200 bg-white text-sm text-gray-700"
					/>
					{emailError && (
						<p className="mt-1 text-xs text-red-500">{emailError}</p>
					)}
				</div>
				<div>
					<label htmlFor="password" className="block text-sm font-medium text-gray-200">
						Password
					</label>
					<input
						type="password"
						placeholder="Password"
						name="password"
						id="password"
						className="mt-1 w-full px-4 p-2 h-10 rounded-md border border-gray-200 bg-white text-sm text-gray-700"
					/>
					{passwordError && (
						<p className="mt-1 text-xs text-red-500">{passwordError}</p>
					)}
				</div>
				<div className="mt-4">
					<AuthButton/>
				</div>
			</form>
		</div>
	);
};

export default LoginForm;

