import { z } from "zod";

export const signupFormSchema = z.object({
  name: z
    .string({ message: "Name is required" })
    .trim()
    .min(3, "Name should be at least 3 characters"),
  email: z.string().trim().email({ message: "Please enter a valid email." }),
  password: z.string().min(1, { message: "Password field must not be empty." }),
  image: z.string().optional().nullable(),
});

export type SignupFormSchema = z.infer<typeof signupFormSchema>;

export const signinFormSchema = z.object({
  email: z.string().trim().email({ message: "Please enter a valid email." }),
  password: z.string().min(1, { message: "Password field must not be empty." }),
});

export type SigninFormSchema = z.infer<typeof signinFormSchema>;
