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
}

export const BookCoverForm = ({ tome, onDone }: BookCoverFormProps) => {
  const form = useForm<BookCoverFormValues>({
    resolver: zodResolver(
      bookCoverSchema
    ) as unknown as Resolver<BookCoverFormValues>,
    defaultValues: {
      name: tome.name,
      authorizationDate: new Date(tome.authorizationDate || tome.createdAt),
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
    <div>
      <div className="flex items-center justify-between pb-4 border-b p-4">
        <div>
          <h3 className="text-2xl font-bold">Libro</h3>
          <p className="text-sm text-muted-foreground">
            Define los detalles del libro.
          </p>
        </div>
      </div>
      <div className="p-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Tomo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Libro de Actas 2025" {...field} />
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="authorizationDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Fecha de Autorización </FormLabel>
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
              {/* ✅ AÑADIDO: Campo para Fecha de Cierre */}
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
            <Button type="submit" disabled={!isDirty || isSaving}>
              {isSaving ? "Guardando..." : "Guardar"}
            </Button>
          </form>
        </Form>
      </div>
    </div>
  );
};
