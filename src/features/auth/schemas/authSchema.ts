import { z } from "zod";

// Esquema para el Flujo 2: Iniciar Sesión Estándar
export const loginFormSchema = z.object({
  username: z
    .string()
    .min(1, { message: "El nombre de usuario es requerido." }), // CAMBIADO de email a string
  password: z.string().min(1, { message: "La contraseña es requerida." }),
});

// Esquema para el Flujo 1, Paso A: Activar Cuenta
export const activateFormSchema = z.object({
  nombre: z.string().min(1, { message: "El nombre es requerido." }), // Ya no valida email
});

// Esquema para el Flujo 1, Paso B: Establecer Contraseña
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

// Exportamos los tipos
export type LoginFormData = z.infer<typeof loginFormSchema>;
export type ActivateFormData = z.infer<typeof activateFormSchema>;
export type SetPasswordFormData = z.infer<typeof setPasswordFormSchema>;
