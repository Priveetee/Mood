import { z } from "zod";

export const loginSchema = z.object({
  email: z.string().email({ message: "Adresse email invalide" }),
  password: z.string().min(1, { message: "Le mot de passe est requis" }),
});

export const registerSchema = z
  .object({
    email: z.string().email({ message: "Adresse email invalide" }),
    name: z
      .string()
      .min(3, { message: "Le nom doit faire au moins 3 caractères" }),
    password: z
      .string()
      .min(8, { message: "Le mot de passe doit faire au moins 8 caractères" }),
    confirmPassword: z.string(),
    invitationKey: z.string().optional(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Les mots de passe ne correspondent pas",
    path: ["confirmPassword"],
  });

export type LoginFormData = z.infer<typeof loginSchema>;
export type RegisterFormData = z.infer<typeof registerSchema>;
