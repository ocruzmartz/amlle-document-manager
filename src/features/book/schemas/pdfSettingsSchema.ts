import { z } from "zod";

// ✅ 1. Definir un helper de pre-procesamiento
// Convierte un string vacío o nulo a 'undefined' para que Zod lo valide.
const preprocessEmptyAsUndefined = (val: unknown) => {
  if (val === "") return undefined;
  if (val == null) return undefined;
  // Intenta convertir el valor a número
  const num = Number(val);
  // Devuelve el número si es válido, o el valor original si no lo es (ej. "abc")
  return isNaN(num) ? val : num;
};

export const pdfSettingsSchema = z.object({
  pageSize: z.enum(["A4", "LETTER"]),
  orientation: z.enum(["portrait", "landscape"]),

  // ✅ 2. Aplicar el pre-procesamiento a todos los campos numéricos
  //     y añadir un mensaje de error si el campo es requerido.
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

  // ✅ 3. Ajustar pageNumberingOffset (este es opcional, así que lo convertimos a 0)
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
