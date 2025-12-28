import * as z from "zod"

export const loginSchema = z.object({
  email: z.string().email("Email da xatolik"),
  password: z.string().min(4, "Parol 4 ta belgidan iborat bo'lishi kerak"),
});

export type LoginFormData = z.infer<typeof loginSchema>;


export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  first_name: z
    .string()
    .min(4, "First name must be at least 4 characters long"),
  last_name: z.string().min(4, "First name must be at least 4 characters long"),
  password: z.string().min(4, "Password must be at least 6 characters long"),
});

export type RegisterFormData = z.infer<typeof registerSchema>;
