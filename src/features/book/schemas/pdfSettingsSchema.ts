import { z } from "zod";

export const pdfSettingsSchema = z.object({
  pageSize: z.enum(["A4", "LETTER"]),
  orientation: z.enum(["portrait", "landscape"]),
  marginTop: z.number().min(0),
  marginBottom: z.number().min(0),
  marginLeft: z.number().min(0),
  marginRight: z.number().min(0),
  lineHeight: z.number().min(1),
  fontSize: z.number().min(8).max(16),
});

export type PdfSettingsFormValues = z.infer<typeof pdfSettingsSchema>;
