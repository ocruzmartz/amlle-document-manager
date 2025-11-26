import { z } from "zod";

const preprocessEmptyAsUndefined = (val: unknown) => {
  if (val === "") return undefined;
  if (val == null) return undefined;
  const num = Number(val);
  return isNaN(num) ? val : num;
};

export const pdfSettingsSchema = z.object({
  pageSize: z.enum(["A4", "LETTER"]),
  orientation: z.enum(["portrait", "landscape"]),

  marginTop: z.preprocess(
    preprocessEmptyAsUndefined,
    z.number().min(0, { message: "El margen es requerido." })
  ),
  marginBottom: z.preprocess(
    preprocessEmptyAsUndefined,
    z.number().min(0, { message: "El margen es requerido." })
  ),
  marginLeft: z.preprocess(
    preprocessEmptyAsUndefined,
    z.number().min(0, { message: "El margen es requerido." })
  ),
  marginRight: z.preprocess(
    preprocessEmptyAsUndefined,
    z.number().min(0, { message: "El margen es requerido." })
  ),
  lineHeight: z.preprocess(
    preprocessEmptyAsUndefined,
    z.number().min(1, { message: "El interlineado es requerido." })
  ),
  fontSize: z.preprocess(
    preprocessEmptyAsUndefined,
    z.number().min(8, { message: "El tamaño es requerido." }).max(16)
  ),

  enablePageNumbering: z.boolean().default(false).optional(),

  pageNumberingOffset: z.preprocess(
    (val) => (val === "" || val == null ? 0 : Number(val)),
    z.number().min(0).default(0).optional()
  ),
  pageNumberingPosition: z
    .enum(["left", "center", "right"])
    .default("center")
    .optional(),
  pageNumberingFormat: z
    .enum(["simple", "dash", "page", "pageTotal"])
    .default("simple")
    .optional(),
});

export type PdfSettingsFormValues = z.infer<typeof pdfSettingsSchema>;
