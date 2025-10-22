// filepath: src/features/book/components/BookPdfSettingsForm.tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type Book } from "@/types";
import { Check, Save } from "lucide-react";
import { useState } from "react";

const pdfSettingsSchema = z.object({
  pageSize: z.enum(["A4", "LETTER"]),
  orientation: z.enum(["portrait", "landscape"]),
  marginTop: z.number().min(0),
  marginBottom: z.number().min(0),
  marginLeft: z.number().min(0),
  marginRight: z.number().min(0),
  lineHeight: z.number().min(1),
  fontSize: z.number().min(8).max(16),
});

type PdfSettingsFormValues = z.infer<typeof pdfSettingsSchema>;

interface BookPdfSettingsFormProps {
  book: Book;
  onUpdateSettings: (settings: Book["pdfSettings"]) => void;
}

export const BookPdfSettingsForm = ({
  book,
  onUpdateSettings,
}: BookPdfSettingsFormProps) => {
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle"
  );
  const form = useForm<PdfSettingsFormValues>({
    resolver: zodResolver(pdfSettingsSchema),
    defaultValues: {
      pageSize: book.pdfSettings?.pageSize || "A4",
      orientation: book.pdfSettings?.orientation || "portrait",
      marginTop: book.pdfSettings?.margins?.top || 50,
      marginBottom: book.pdfSettings?.margins?.bottom || 50,
      marginLeft: book.pdfSettings?.margins?.left || 60,
      marginRight: book.pdfSettings?.margins?.right || 60,
      lineHeight: book.pdfSettings?.lineHeight || 1.5,
      fontSize: book.pdfSettings?.fontSize || 11,
    },
  });

  const onSubmit = (data: PdfSettingsFormValues) => {
    setSaveStatus("saving");
    onUpdateSettings({
      pageSize: data.pageSize,
      orientation: data.orientation,
      margins: {
        top: data.marginTop,
        bottom: data.marginBottom,
        left: data.marginLeft,
        right: data.marginRight,
      },
      lineHeight: data.lineHeight,
      fontSize: data.fontSize,
    });
    setSaveStatus("saved");
    setTimeout(() => setSaveStatus("idle"), 2000);
  };

  return (
    <div>
      <div className="flex items-center justify-between pb-4 border-b p-4">
        <div>
          <h3 className="text-2xl font-bold">Configuración de PDF</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Ajuste las preferencias de formato para la generación de PDF.
          </p>
        </div>
      </div>
      <div className="p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <div className="grid grid-cols-1 gap-6">
              <div>
                <FormLabel className="text-base font-semibold">
                  Márgenes
                </FormLabel>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2 border p-4 rounded-lg">
                  <FormField
                    control={form.control}
                    name="marginTop"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Superior</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="marginBottom"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Inferior</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="marginLeft"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Izquierdo</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="marginRight"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Derecho</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            {...field}
                            onChange={(e) =>
                              field.onChange(Number(e.target.value))
                            }
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>
              </div>
              <FormField
                control={form.control}
                name="pageSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tamaño de Página</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="A4">A4</SelectItem>
                        <SelectItem value="LETTER">Carta (Letter)</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="orientation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Orientación</FormLabel>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="portrait">Vertical</SelectItem>
                        <SelectItem value="landscape">Horizontal</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <div>
                <FormField
                  control={form.control}
                  name="fontSize"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tamaño de Fuente</FormLabel>
                      <Select
                        onValueChange={(value) => field.onChange(Number(value))}
                        defaultValue={String(field.value)}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="10">10 pt</SelectItem>
                          <SelectItem value="11">11 pt</SelectItem>
                          <SelectItem value="12">12 pt</SelectItem>
                          <SelectItem value="14">14 pt</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <p className="text-gray-500 text-xs mt-2">
                  Este valor cambia el contenido generado directamente en el
                  PDF. Para cambiar el tamaño de la letra del contenido a insertar, se hace desde el editor.
                </p>
              </div>

              <FormField
                control={form.control}
                name="lineHeight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Interlineado</FormLabel>
                    <Select
                      onValueChange={(value) => field.onChange(Number(value))}
                      defaultValue={String(field.value)}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="1.0">Sencillo (1.0)</SelectItem>
                        <SelectItem value="1.5">1.5 líneas (1.5)</SelectItem>
                        <SelectItem value="2.0">Doble (2.0)</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="flex-shrink-0 p-4 border-t bg-white sticky bottom-0 z-10">
                <div className="flex justify-end gap-4">
                  <Button type="submit" disabled={saveStatus !== "idle"}>
                    {saveStatus === "saving" && (
                      <>
                        <Save className="mr-2 h-4 w-4 animate-spin" />{" "}
                        Guardando...
                      </>
                    )}
                    {saveStatus === "saved" && (
                      <>
                        <Check className="mr-2 h-4 w-4" /> ¡Guardado!
                      </>
                    )}
                    {saveStatus === "idle" && <>Guardar Cambios</>}
                  </Button>
                </div>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};
