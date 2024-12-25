import { z } from "zod";

// Define the file size limit and accepted file types as constants
const MAX_FILE_SIZE = 30 * 1024 * 1024; // 3MB in bytes
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png"];

export const signupFormSchema = z.object({
  name: z
    .string({ message: "Name is required" })
    .trim()
    .min(3, "Name should be at least 3 characters"),
  email: z.string().trim().email({ message: "Please enter a valid email." }),
  password: z.string().min(1, { message: "Password field must not be empty." }),
  image: z
    .any()
    .refine(
      (file) => file instanceof File && file.size <= MAX_FILE_SIZE,
      `Image size must be less than ${MAX_FILE_SIZE / 1024 / 1024}MB.`
    )
    .refine(
      (file) =>
        file instanceof File && ACCEPTED_IMAGE_TYPES.includes(file.type),
      `Only the following image types are allowed: ${ACCEPTED_IMAGE_TYPES.join(
        ", "
      )}.`
    )
    .optional()
    .nullable(),
});

export type SignupFormSchema = z.infer<typeof signupFormSchema>;

// export const SignupFormSchema = z.object({
//     name: z
//         .string()
//         .trim()
//         .min(2, { message: 'Name must be at least 2 characters long.' }),
//     email: z.string().trim().email({ message: 'Please enter a valid email.' }),
//     password: z
//         .string()
//         // .min(8, { message: 'Be at least 8 characters long' })
//         // .regex(/[a-zA-Z]/, { message: 'Contain at least one letter.' })
//         // .regex(/[0-9]/, { message: 'Contain at least one number.' })
//         // .regex(/[^a-zA-Z0-9]/, {
//         //   message: 'Contain at least one special character.',
//         // })
//         .trim(),
// });
// export type SignupFormValues = z.infer<typeof SignupFormSchema>;
export const LoginFormSchema = z.object({
  email: z.string().trim().email({ message: "Please enter a valid email." }),
  password: z.string().min(1, { message: "Password field must not be empty." }),
});

export type FormState =
  | {
      errors?: {
        name?: string[];
        email?: string[];
        password?: string[];
      };
      message?: string;
    }
  | undefined;

export type SessionPayload = {
  userId: string | number;
  role: "user" | "admin";
  expiresAt: Date;
};
