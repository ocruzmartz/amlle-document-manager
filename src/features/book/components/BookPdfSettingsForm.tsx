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
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

interface BookPdfSettingsFormProps {
  tome: Tome;
  onUpdateSettings: (settings: Tome["pdfSettings"]) => void;
}

export const BookPdfSettingsForm = ({
  tome,
  onUpdateSettings,
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
    });

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
    <div>
      <div className="flex items-center justify-between pb-4 border-b p-4 ">
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
                  PDF. Para cambiar el tamaño de la letra del contenido a
                  insertar, se hace desde el editor.
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

              <div className="space-y-6">
                <Separator />
                <h4 className="text-base font-semibold">
                  Numeración de Página
                </h4>
                <FormField
                  control={form.control}
                  name="enablePageNumbering"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">
                          Activar numeración de página
                        </FormLabel>
                        <FormDescription>
                          Añade números de página al pie del documento PDF.
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
                  <div className="space-y-6 pl-4 border-l-2 ml-4">
                    {/* ... (Campo 'pageNumberingOffset' sin cambios) ... */}
                    <FormField
                      control={form.control}
                      name="pageNumberingOffset"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Páginas sin numerar al inicio</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              min="0"
                              {...field}
                              onChange={(e) =>
                                field.onChange(Number(e.target.value))
                              }
                            />
                          </FormControl>
                          <FormDescription>
                            Ej: Escriba '2' para omitir la Portada y el Índice.
                            La página 3 mostrará el número "1".
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {/* ✅ CORREGIDO: Campo 'pageNumberingPosition' */}
                    <FormField
                      control={form.control}
                      name="pageNumberingPosition"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Posición del número</FormLabel>
                          {/* El <FormControl> envuelve al <RadioGroup> */}
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="flex flex-row gap-4"
                            >
                              {/* Esta es la estructura plana correcta */}
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                  value="left"
                                  id={`pos-left-${field.name}`}
                                />
                                <Label
                                  htmlFor={`pos-left-${field.name}`}
                                  className="font-normal cursor-pointer"
                                >
                                  Izquierda
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                  value="center"
                                  id={`pos-center-${field.name}`}
                                />
                                <Label
                                  htmlFor={`pos-center-${field.name}`}
                                  className="font-normal cursor-pointer"
                                >
                                  Centro
                                </Label>
                              </div>
                              <div className="flex items-center space-x-2">
                                <RadioGroupItem
                                  value="right"
                                  id={`pos-right-${field.name}`}
                                />
                                <Label
                                  htmlFor={`pos-right-${field.name}`}
                                  className="font-normal cursor-pointer"
                                >
                                  Derecha
                                </Label>
                              </div>
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
              <Separator />
              <div className="shrink-0 p-4  bg-white sticky bottom-0 z-10">
                <div className="flex justify-end gap-4">
                  <Button type="submit" disabled={!isDirty || isSaving}>
                    {isSaving ? "Guardando..." : "Guardar"}
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
