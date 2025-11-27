import { z } from "zod";

export const participantSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, { message: "El nombre debe tener al menos 3 caracteres." }),
});

export type ParticipantFormData = z.infer<typeof participantSchema>;

export const getDefaultValues = (
  data?: { name: string } | null
): ParticipantFormData => {
  return {
    name: data?.name || "",
  };
};