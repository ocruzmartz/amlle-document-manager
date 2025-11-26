import { z } from "zod";
import { type User } from "@/types";

const uiSessionTypeOptions = ["INDEFINITE", "TEMPORAL"] as const;

export const userFormSchema = z
  .object({
    id: z.string().optional(),
    nombre: z
      .string()
      .trim()
      .min(3, { message: "El nombre debe tener al menos 3 caracteres." }),
    sessionType: z.enum(uiSessionTypeOptions),
    sessionDuration: z.string().trim().nullable().optional(),
  })
  .refine(
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

export type UserFormData = z.infer<typeof userFormSchema>;

export const getDefaultValues = (user: User | null): UserFormData => {
  if (!user) {
    return {
      nombre: "",
      sessionType: "INDEFINITE",
      sessionDuration: null,
    };
  }

  return {
    id: user.id,
    nombre: user.nombre,
    sessionType: user.sessionType === "temporal" ? "TEMPORAL" : "INDEFINITE",
    sessionDuration: user.sessionDuration,
  };
};
