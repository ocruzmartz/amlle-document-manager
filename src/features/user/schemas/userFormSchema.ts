// filepath: src/features/user/schemas/userFormSchema.ts
import { z } from "zod";
import { type User } from "@/types";

const uiSessionTypeOptions = ["INDEFINITE", "TEMPORAL"] as const;

/**
 * Esquema simplificado para que coincida SÓLO
 * con los campos que el backend permite crear O editar.
 */
export const userFormSchema = z
  .object({
    id: z.string().optional(),

    // --- Campos de Creación y Edición ---
    nombre: z
      .string()
      .trim()
      .min(3, { message: "El nombre debe tener al menos 3 caracteres." }),

    sessionType: z.enum(uiSessionTypeOptions),

    sessionDuration: z.string().trim().nullable().optional(),

    // --- CAMPOS ELIMINADOS ---
    // email, password, confirmPassword, role, activo
  })
  .refine(
    // Validación de Duración de Sesión (se mantiene)
    (data) => {
      if (
        data.sessionType === "TEMPORAL" &&
        (!data.sessionDuration || data.sessionDuration.length === 0)
      ) {
        return false;
      }
      return true;
    },
    {
      message:
        "La duración es requerida para sesiones temporales (ej: '8h', '1d').",
      path: ["sessionDuration"],
    }
  );
// ⛔️ Eliminados los 'refine' de contraseña

export type UserFormData = z.infer<typeof userFormSchema>;

// Valores por defecto para el formulario
export const getDefaultValues = (user: User | null): UserFormData => {
  if (!user) {
    // Modo Creación (solo los campos de creación)
    return {
      nombre: "",
      sessionType: "INDEFINITE",
      sessionDuration: null,
    };
  }

  // Modo Edición (solo los campos de edición)
  return {
    id: user.id,
    nombre: user.nombre,
    sessionType: user.sessionType === "temporal" ? "TEMPORAL" : "INDEFINITE",
    sessionDuration: user.sessionDuration,
  };
};
