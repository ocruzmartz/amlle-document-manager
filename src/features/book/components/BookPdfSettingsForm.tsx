import { useMemo, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler, type Resolver } from "react-hook-form";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
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
import { type Tome } from "@/types";
import { useSaveAction } from "@/hooks/useSaveAction";
import {
  pdfSettingsSchema,
  type PdfSettingsFormValues,
} from "../schemas/pdfSettingsSchema";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type SaveHandler = () => Promise<boolean>;

interface BookPdfSettingsFormProps {
  tome: Tome;
  onUpdateSettings: (settings: Tome["pdfSettings"]) => void;
  isReadOnly?: boolean;
  onRegisterSaveHandler: (handler: SaveHandler | null) => void;
  onStateChange: (state: { dirty: boolean; saving: boolean }) => void;
}

export const BookPdfSettingsForm = ({
  tome,
  onUpdateSettings,
  isReadOnly = false,
  onRegisterSaveHandler,
  onStateChange,
}: BookPdfSettingsFormProps) => {
  const form = useForm<PdfSettingsFormValues>({
    resolver: zodResolver(
      pdfSettingsSchema
    ) as unknown as Resolver<PdfSettingsFormValues>,
    defaultValues: {
      pageSize: tome.pdfSettings?.pageSize || "A4",
      orientation: tome.pdfSettings?.orientation || "portrait",
      marginTop: tome.pdfSettings?.margins?.top || 50,
      marginBottom: tome.pdfSettings?.margins?.bottom || 50,
      marginLeft: tome.pdfSettings?.margins?.left || 60,
      marginRight: tome.pdfSettings?.margins?.right || 60,
      lineHeight: tome.pdfSettings?.lineHeight || 1.5,
      fontSize: tome.pdfSettings?.fontSize || 11,
      enablePageNumbering: tome.pdfSettings?.enablePageNumbering || false,
      pageNumberingOffset: tome.pdfSettings?.pageNumberingOffset || 0,
      pageNumberingPosition:
        tome.pdfSettings?.pageNumberingPosition || "center",
      pageNumberingFormat: tome.pdfSettings?.pageNumberingFormat || "simple",
    },
  });

  const currentFormData = form.watch();
  const enableNumbering = form.watch("enablePageNumbering");

  const initialHookData = useMemo(
    () => ({
      pageSize: tome.pdfSettings?.pageSize || "A4",
      orientation: tome.pdfSettings?.orientation || "portrait",
      marginTop: tome.pdfSettings?.margins?.top || 50,
      marginBottom: tome.pdfSettings?.margins?.bottom || 50,
      marginLeft: tome.pdfSettings?.margins?.left || 60,
      marginRight: tome.pdfSettings?.margins?.right || 60,
      lineHeight: tome.pdfSettings?.lineHeight || 1.5,
      fontSize: tome.pdfSettings?.fontSize || 11,
      enablePageNumbering: tome.pdfSettings?.enablePageNumbering || false,
      pageNumberingOffset: tome.pdfSettings?.pageNumberingOffset || 0,
      pageNumberingPosition:
        tome.pdfSettings?.pageNumberingPosition || "center",
      pageNumberingFormat: tome.pdfSettings?.pageNumberingFormat || "simple",
    }),
    [tome.pdfSettings]
  );
  const currentHookData = useMemo(() => currentFormData, [currentFormData]);

  const { handleSave, isDirty, isSaving } =
    useSaveAction<PdfSettingsFormValues>({
      initialData: initialHookData,
      currentData: currentHookData,
      onSave: async (dataToSave) => {
        onUpdateSettings({
          pageSize: dataToSave.pageSize,
          orientation: dataToSave.orientation,
          margins: {
            top: dataToSave.marginTop,
            bottom: dataToSave.marginBottom,
            left: dataToSave.marginLeft,
            right: dataToSave.marginRight,
          },
          lineHeight: dataToSave.lineHeight,
          fontSize: dataToSave.fontSize,
          enablePageNumbering: dataToSave.enablePageNumbering,
          pageNumberingOffset: dataToSave.pageNumberingOffset,
          pageNumberingPosition: dataToSave.pageNumberingPosition,
          pageNumberingFormat: dataToSave.pageNumberingFormat,
        });
      },
      onSuccess: (savedData) => {
        form.reset(savedData);
      },
      loadingMessage: "Guardando configuración...",
      successMessage: "Configuración guardada.",
      errorMessage: "Error al guardar la configuración.",
      onStateChange: onStateChange,
    });

  useEffect(() => {
    if (handleSave) {
      onRegisterSaveHandler(handleSave);
    }
  }, [handleSave, onRegisterSaveHandler]);

  useEffect(() => {
    form.reset({
      pageSize: tome.pdfSettings?.pageSize || "A4",
      orientation: tome.pdfSettings?.orientation || "portrait",
      marginTop: tome.pdfSettings?.margins?.top || 50,
      marginBottom: tome.pdfSettings?.margins?.bottom || 50,
      marginLeft: tome.pdfSettings?.margins?.left || 60,
      marginRight: tome.pdfSettings?.margins?.right || 60,
      lineHeight: tome.pdfSettings?.lineHeight || 1.5,
      fontSize: tome.pdfSettings?.fontSize || 11,
      enablePageNumbering: tome.pdfSettings?.enablePageNumbering || false,
      pageNumberingOffset: tome.pdfSettings?.pageNumberingOffset || 0,
      pageNumberingPosition:
        tome.pdfSettings?.pageNumberingPosition || "center",
      pageNumberingFormat: tome.pdfSettings?.pageNumberingFormat || "simple",
    });
  }, [tome.pdfSettings, form]);

  const onSubmit: SubmitHandler<PdfSettingsFormValues> = () => {
    handleSave();
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between pb-4 border-b p-4 shrink-0">
        <div>
          <h3 className="text-2xl font-bold">Configuración de PDF</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Ajuste las preferencias de formato para la generación de PDF.
          </p>
        </div>
      </div>
      <Form {...form}>
        <div className="flex-1 overflow-y-auto">
          <fieldset
            disabled={isReadOnly}
            className="p-4 space-y-6 flex-1 min-h-0"
          >
            <form
              id="pdf-settings-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="flex-1 overflow-y-auto min-h-0"
            >
              <div className="p-4 space-y-6">
                <div className="border rounded-lg">
                  <h4 className="font-semibold p-4 border-b">
                    Formato de Página
                  </h4>
                  <div className="p-4 space-y-6">
                    <FormLabel className="text-base">Márgenes (mm)</FormLabel>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <FormField
                        control={form.control}
                        name="marginTop"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Superior</FormLabel>
                            <FormControl>
                              <Input
                                type="number"
                                value={field.value ?? ""}
                                onChange={field.onChange}
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
                                value={field.value ?? ""}
                                onChange={field.onChange}
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
                                value={field.value ?? ""}
                                onChange={field.onChange}
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
                                value={field.value ?? ""}
                                onChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
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
                                <SelectItem value="LETTER">
                                  Carta (Letter)
                                </SelectItem>
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
                                <SelectItem value="portrait">
                                  Vertical
                                </SelectItem>
                                <SelectItem value="landscape">
                                  Horizontal
                                </SelectItem>
                              </SelectContent>
                            </Select>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                {/* --- GRUPO 2: Tipografía (Minimalista) --- */}
                <div className="border rounded-lg">
                  <h4 className="font-semibold p-4 border-b">Tipografía</h4>
                  <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="fontSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Tamaño de Fuente</FormLabel>
                          <Select
                            onValueChange={(value) =>
                              field.onChange(Number(value))
                            }
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
                          <FormDescription>
                            Tamaño base para el texto del PDF.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="lineHeight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Interlineado</FormLabel>
                          <Select
                            onValueChange={(value) =>
                              field.onChange(Number(value))
                            }
                            defaultValue={String(field.value)}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="1.0">
                                Sencillo (1.0)
                              </SelectItem>
                              <SelectItem value="1.5">
                                1.5 líneas (1.5)
                              </SelectItem>
                              <SelectItem value="2.0">Doble (2.0)</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormDescription>
                            Espacio vertical entre líneas.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* --- GRUPO 3: Numeración (Minimalista) --- */}
                <div className="border rounded-lg">
                  <h4 className="font-semibold p-4 border-b">
                    Numeración de Página
                  </h4>
                  <div className="p-4 space-y-6">
                    <FormField
                      control={form.control}
                      name="enablePageNumbering"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center justify-between rounded-lg p-0">
                          <div className="space-y-0.5">
                            <FormLabel className="text-base">
                              Activar numeración de página
                            </FormLabel>
                            <FormDescription>
                              Añade números al pie del documento PDF.
                            </FormDescription>
                          </div>
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />

                    {enableNumbering && (
                      <div className="space-y-6 pt-6 border-t">
                        <FormField
                          control={form.control}
                          name="pageNumberingOffset"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>
                                Páginas sin numerar al inicio
                              </FormLabel>
                              <FormControl>
                                <Input
                                  type="number"
                                  min="0"
                                  value={field.value ?? ""}
                                  onChange={(e) => {
                                    const value = e.target.value;
                                    field.onChange(
                                      value === "" ? undefined : Number(value)
                                    );
                                  }}
                                />
                              </FormControl>
                              <FormDescription>
                                Ej: '2' para omitir Portada e Índice.
                              </FormDescription>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="pageNumberingPosition"
                          render={({ field }) => (
                            <FormItem className="space-y-3">
                              <FormLabel>Posición del número</FormLabel>
                              <FormControl>
                                <RadioGroup
                                  onValueChange={field.onChange}
                                  defaultValue={field.value}
                                  className="flex flex-row gap-4"
                                >
                                  <FormItem className="flex items-center space-x-2">
                                    <FormControl>
                                      <RadioGroupItem value="left" />
                                    </FormControl>
                                    <Label className="font-normal cursor-pointer">
                                      Izquierda
                                    </Label>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-2">
                                    <FormControl>
                                      <RadioGroupItem value="center" />
                                    </FormControl>
                                    <Label className="font-normal cursor-pointer">
                                      Centro
                                    </Label>
                                  </FormItem>
                                  <FormItem className="flex items-center space-x-2">
                                    <FormControl>
                                      <RadioGroupItem value="right" />
                                    </FormControl>
                                    <Label className="font-normal cursor-pointer">
                                      Derecha
                                    </Label>
                                  </FormItem>
                                </RadioGroup>
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="pageNumberingFormat"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Formato del número</FormLabel>
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
                                  <SelectItem value="simple">
                                    Simple (ej: 1)
                                  </SelectItem>
                                  <SelectItem value="dash">
                                    Con guiones (ej: - 1 -)
                                  </SelectItem>
                                  <SelectItem value="page">
                                    Página X (ej: Página 1)
                                  </SelectItem>
                                  <SelectItem value="pageTotal">
                                    Página X de Y (ej: Página 1 de 45)
                                  </SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </form>
          </fieldset>
        </div>
      </Form>

      <div className="shrink-0 p-4 border-t bg-white sticky bottom-0 z-10">
        <div className="flex justify-end gap-4">
          <Button
            type="submit"
            form="pdf-settings-form"
            disabled={!isDirty || isSaving || isReadOnly}
          >
            {isSaving ? "Guardando..." : "Guardar"}
          </Button>
        </div>
      </div>
    </div>
  );
};
