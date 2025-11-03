import { useEffect, useMemo } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler, type Resolver } from "react-hook-form";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { type Tome } from "@/types";
import { useSaveAction } from "@/hooks/useSaveAction";
import {
  bookCoverSchema,
  type BookCoverFormValues,
} from "../schemas/bookCoverSchema";

interface BookCoverFormProps {
  tome: Tome;
  onDone: (data: BookCoverFormValues) => void;
  isReadOnly?: boolean;
}

export const BookCoverForm = ({
  tome,
  onDone,
  isReadOnly = false,
}: BookCoverFormProps) => {
  const form = useForm<BookCoverFormValues>({
    resolver: zodResolver(
      bookCoverSchema
    ) as unknown as Resolver<BookCoverFormValues>,
    defaultValues: {
      name: tome.name,
      authorizationDate: new Date(tome.authorizationDate || tome.createdAt),
      closingDate: tome.closingDate ? new Date(tome.closingDate) : undefined,
      tome: tome.tomeNumber,
    },
  });

  const currentFormData = form.watch();

  const initialHookData = useMemo(
    () => ({
      name: tome.name,
      authorizationDate: new Date(tome.authorizationDate || tome.createdAt),
      closingDate: tome.closingDate ? new Date(tome.closingDate) : undefined,
      tome: tome.tomeNumber,
    }),
    [tome]
  );
  const currentHookData = useMemo(
    () => ({
      name: currentFormData.name,
      authorizationDate: currentFormData.authorizationDate,
      closingDate: currentFormData.closingDate,
      tome: currentFormData.tome,
    }),
    [currentFormData]
  );

  const { handleSave, isDirty, isSaving } = useSaveAction<BookCoverFormValues>({
    initialData: initialHookData,
    currentData: currentHookData,
    onSave: async (dataToSave) => {
      onDone(dataToSave);
    },
    onSuccess: (savedData) => {
      form.reset(savedData);
    },
    loadingMessage: "Guardando portada...",
    successMessage: "Portada guardada exitosamente.",
    errorMessage: "Error al guardar la portada.",
  });

  useEffect(() => {
    form.reset({
      name: tome.name,
      authorizationDate: new Date(tome.authorizationDate || tome.createdAt),
      closingDate: tome.closingDate ? new Date(tome.closingDate) : undefined,
      tome: tome.tomeNumber,
    });
  }, [tome, form]);

  const onSubmit: SubmitHandler<BookCoverFormValues> = () => {
    handleSave();
  };

  return (
    // ✅ 1. Contenedor raíz con layout flex-col
    <div className="h-full flex flex-col">
      {/* ✅ 2. Cabecera (no se desplaza) */}
      <div className="flex items-center justify-between pb-4 border-b p-4 shrink-0">
        <div>
          <h3 className="text-2xl font-bold">Inicio del Tomo</h3>
          <p className="text-sm text-muted-foreground">
            Define los detalles de la portada y el tomo.
          </p>
        </div>
      </div>

      {/* ✅ 3. El <Form> ahora es el contenedor principal y el área de scroll */}
      <Form {...form}>
        <form
          id="book-cover-form" // ID para el botón del footer
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto" // Ocupa espacio restante y se desplaza
        >
          <fieldset disabled={isReadOnly} className="p-4 space-y-6">
            {/* ✅ 4. Grupos de campos minimalistas */}
            <div className="p-4 space-y-6">
              {/* --- GRUPO 1: Detalles del Tomo --- */}
              <div className="border rounded-lg">
                <h4 className="font-semibold p-4 border-b">
                  Detalles del Tomo
                </h4>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem className="md:col-span-2">
                        {" "}
                        {/* Nombre ocupa todo el ancho */}
                        <FormLabel>Nombre del Tomo</FormLabel>
                        <FormControl>
                          <Input placeholder="Ej: Tomo 1 - 2025" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="tome"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Número de Tomo</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Ej: 1"
                            {...field}
                            value={field.value ?? ""}
                            onChange={(e) => {
                              const value = e.target.value;
                              field.onChange(
                                value === "" ? undefined : Number(value)
                              );
                            }}
                            min="1"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* --- GRUPO 2: Fechas Clave --- */}
              <div className="border rounded-lg">
                <h4 className="font-semibold p-4 border-b">Fechas Clave</h4>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="authorizationDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Fecha de Autorización</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "pl-3 text-left font-normal shadow-none",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP", { locale: es })
                                ) : (
                                  <span>Elige una fecha</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                              initialFocus
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="closingDate"
                    render={({ field }) => (
                      <FormItem className="flex flex-col">
                        <FormLabel>Fecha de Cierre</FormLabel>
                        <Popover>
                          <PopoverTrigger asChild>
                            <FormControl>
                              <Button
                                variant={"outline"}
                                className={cn(
                                  "pl-3 text-left font-normal shadow-none",
                                  !field.value && "text-muted-foreground"
                                )}
                              >
                                {field.value ? (
                                  format(field.value, "PPP", { locale: es })
                                ) : (
                                  <span>Elige una fecha</span>
                                )}
                                <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                              </Button>
                            </FormControl>
                          </PopoverTrigger>
                          <PopoverContent className="w-auto p-0" align="start">
                            <Calendar
                              mode="single"
                              selected={field.value}
                              onSelect={field.onChange}
                            />
                          </PopoverContent>
                        </Popover>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </div>
          </fieldset>
        </form>
      </Form>

      {/* ✅ 5. Pie de página fijo (no se desplaza) */}
      <div className="shrink-0 p-4 border-t bg-white sticky bottom-0 z-10">
        <div className="flex justify-end gap-4">
          <Button
            type="submit"
            form="book-cover-form" // Vinculado al ID del formulario
            disabled={!isDirty || isSaving || isReadOnly}
          >
            {isSaving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </div>
    </div>
  );
};
