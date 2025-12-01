import { useCallback, useEffect, useMemo } from "react";
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
import { numberToRoman, parseDateSafely } from "@/lib/textUtils";

type SaveHandler = () => Promise<boolean>;

interface BookCoverFormProps {
  tome: Tome;
  onSaveCover: (data: BookCoverFormValues) => void;
  onSkip: () => void;
  isReadOnly?: boolean;
  onRegisterSaveHandler: (handler: SaveHandler | null) => void;
  onStateChange: (state: { dirty: boolean; saving: boolean }) => void;
}

export const BookCoverForm = ({
  tome,
  onSaveCover,
  onSkip,
  isReadOnly = false,
  onRegisterSaveHandler,
  onStateChange,
}: BookCoverFormProps) => {
  const defaultTomeName = tome.name || `Tomo ${numberToRoman(tome.number)}`;

  const form = useForm<BookCoverFormValues>({
    resolver: zodResolver(
      bookCoverSchema
    ) as unknown as Resolver<BookCoverFormValues>,
    defaultValues: {
      name: defaultTomeName,
      authorizationDate: parseDateSafely(
        tome.authorizationDate || tome.createdAt
      ),
      closingDate: parseDateSafely(tome.closingDate ?? undefined),
      tome: tome.number,
    },
  });

  const currentFormData = form.watch();

  const initialHookData = useMemo(
    () => ({
      name: tome.name || `Tomo ${numberToRoman(tome.number)}`,
      authorizationDate:
        parseDateSafely(tome.authorizationDate || tome.createdAt) ?? new Date(),
      closingDate: parseDateSafely(tome.closingDate ?? undefined),
      tome: tome.number,
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

  const onSaveCallback = useCallback(
    async (dataToSave: BookCoverFormValues) => {
      onSaveCover(dataToSave);
    },
    [onSaveCover]
  );

  const onSuccessCallback = useCallback(
    (savedData: BookCoverFormValues) => {
      form.reset(savedData);
    },
    [form]
  );

  const { handleSave, isDirty, isSaving } = useSaveAction<BookCoverFormValues>({
    initialData: initialHookData,
    currentData: currentHookData,
    onSave: onSaveCallback,
    onSuccess: onSuccessCallback,
    loadingMessage: "Guardando portada...",
    successMessage: "Portada guardada exitosamente.",
    errorMessage: "Error al guardar la portada.",
    onStateChange: onStateChange,
  });

  useEffect(() => {
    if (handleSave) {
      onRegisterSaveHandler(handleSave);
    }
  }, [handleSave, onRegisterSaveHandler]);

  useEffect(() => {
    form.reset({
      name: tome.name || `Tomo ${numberToRoman(tome.number)}`,
      authorizationDate: parseDateSafely(
        tome.authorizationDate || tome.createdAt
      ),
      closingDate: parseDateSafely(tome.closingDate ?? undefined),
      tome: tome.number,
    });
  }, [tome, form]);

  const onSubmit: SubmitHandler<BookCoverFormValues> = () => {
    handleSave();
  };

  return (
    // ... (El JSX del formulario no cambia, solo la lógica de inicialización)
    <div className="h-full flex flex-col">
      <div className="flex items-center justify-between pb-4 border-b p-4 shrink-0">
        <div>
          <h3 className="text-2xl font-bold">Inicio del Tomo</h3>
          <p className="text-sm text-muted-foreground">
            Define los detalles de la portada y el tomo.
          </p>
        </div>
      </div>

      <Form {...form}>
        <form
          id="book-cover-form"
          onSubmit={form.handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto"
        >
          <fieldset disabled={isReadOnly} className="p-4 space-y-6">
            <div className="p-4 space-y-6">
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
                              selected={field.value || undefined}
                              onSelect={(date) => field.onChange(date || null)}
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
                              selected={field.value || undefined}
                              onSelect={(date) => field.onChange(date || null)}
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

      <div className="shrink-0 p-4 border-t bg-white sticky bottom-0 z-10">
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onSkip}
            disabled={isReadOnly}
          >
            Ir a la lista de actas
          </Button>
          <Button
            type="submit"
            form="book-cover-form"
            disabled={!isDirty || isSaving || isReadOnly}
          >
            {isSaving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </div>
    </div>
  );
};
