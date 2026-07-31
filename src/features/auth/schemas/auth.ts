import { z } from "zod";

export const signInSchema = z.object({
  email: z.string().email("Informe um e-mail válido").trim().toLowerCase(),
  password: z.string().min(1, "Informe a senha"),
});

export const signUpSchema = z
  .object({
    displayName: z.string().trim().min(2, "Informe seu nome").max(80, "Nome muito longo"),
    email: z.string().email("Informe um e-mail válido").trim().toLowerCase(),
    password: z
      .string()
      .min(8, "A senha deve ter pelo menos 8 caracteres")
      .max(72, "Senha muito longa"),
    confirmPassword: z.string().min(1, "Confirme a senha"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "As senhas não coincidem",
    path: ["confirmPassword"],
  });

export type SignInInput = z.infer<typeof signInSchema>;
export type SignUpInput = z.infer<typeof signUpSchema>;
