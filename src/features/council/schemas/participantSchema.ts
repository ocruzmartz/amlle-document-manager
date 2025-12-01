import { z } from "zod";
import { type CouncilMemberType } from "@/types/council";

// Lista maestra de opciones para el Select
export const COUNCIL_ROLE_OPTIONS: {
  label: string;
  value: CouncilMemberType;
}[] = [
  // Autoridades Principales
  { label: "Alcaldesa Municipal", value: "ALCALDESA" },
  { label: "Síndico Municipal", value: "SINDICO" },
  { label: "Secretaria Municipal", value: "SECRETARIA" },

  // Regidores (Propietarios)
  { label: "Primer Regidor propietario", value: "PRIMER_REGIDOR" },
  { label: "Segundo Regidor propietario", value: "SEGUNDO_REGIDOR" },
  { label: "Tercer Regidor propietario", value: "TERCER_REGIDOR" },
  { label: "Cuarto Regidor propietario", value: "CUARTO_REGIDOR" },

  // Suplentes
  { label: "Primer Regidor Suplente", value: "PRIMER_SUPLENTE" },
  { label: "Segundo Regidor Suplente", value: "SEGUNDO_SUPLENTE" },
  { label: "Tercer Regidor Suplente", value: "TERCER_SUPLENTE" },
  { label: "Cuarto Regidor Suplente", value: "CUARTO_SUPLENTE" },
];

const roleValues = COUNCIL_ROLE_OPTIONS.map((o) => o.value) as [
  string,
  ...string[]
];

export const participantSchema = z.object({
  name: z
    .string()
    .trim()
    .min(3, { message: "El nombre debe tener al menos 3 caracteres." }),
  type: z.enum(roleValues, {
    message: "Debes seleccionar un cargo.",
  }),
});

export type ParticipantFormData = z.infer<typeof participantSchema>;

export const getDefaultValues = (
  data?: { name: string; type?: CouncilMemberType | null } | null
): ParticipantFormData => {
  return {
    name: data?.name || "",
    type:
      data?.type && roleValues.includes(data.type) ? data.type : roleValues[0],
  };
};
