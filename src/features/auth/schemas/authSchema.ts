import { z } from "zod";

export const loginFormSchema = z.object({
  username: z
    .string()
    .min(1, { message: "El nombre de usuario es requerido." }),
  password: z.string().min(1, { message: "La contraseña es requerida." }),
});

export const activateFormSchema = z.object({
  nombre: z.string().min(1, { message: "El nombre es requerido." }),
});
export const setPasswordFormSchema = z
  .object({
    password: z
      .string()
      .min(8, { message: "La contraseña debe tener al menos 8 caracteres." }),
    confirmPassword: z
      .string()
      .min(1, { message: "Debes confirmar la contraseña." }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Las contraseñas no coinciden.",
    path: ["confirmPassword"],
  });

export type LoginFormData = z.infer<typeof loginFormSchema>;
export type ActivateFormData = z.infer<typeof activateFormSchema>;
export type SetPasswordFormData = z.infer<typeof setPasswordFormSchema>;
