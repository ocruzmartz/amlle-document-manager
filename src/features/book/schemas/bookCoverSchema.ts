import { z } from "zod";

export const bookCoverSchema = z.object({
  name: z
    .string()
    .min(5, { message: "El nombre debe tener al menos 5 caracteres." }),
  authorizationDate: z
    .date()
    .refine((val) => val !== null && val !== undefined, {
      message: "La fecha de autorización es requerida.",
    }),
  tome: z.preprocess(
    (val) => (val === "" || val == null ? undefined : Number(val)),
    z
      .number()
      .positive({ message: "El tomo debe ser un número positivo" })
      .optional()
  ),
});

export type BookCoverFormValues = z.infer<typeof bookCoverSchema>;
