// filepath: src/features/book/components/BookCoverForm.tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type SubmitHandler, type Resolver } from "react-hook-form";
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
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { type Book } from "@/types";

// ✅ Esquema corregido y simplificado
const formSchema = z.object({
  name: z
    .string()
    .min(5, { message: "El nombre debe tener al menos 5 caracteres." }),
  // ✅ Validación de fecha requerida simplificada con refine
  authorizationDate: z
    .date()
    .refine((val) => val !== null && val !== undefined, {
      message: "La fecha de autorización es requerida.",
    }),
  // ✅ Preprocess para 'tome' simplificado
  tome: z.preprocess(
    (val) => (val === "" || val == null ? undefined : Number(val)),
    z
      .number()
      .positive({ message: "El tomo debe ser un número positivo" })
      .optional()
  ),
});

type FormValues = z.infer<typeof formSchema>;

interface BookCoverFormProps {
  book: Book;
  onDone: (data: FormValues) => void;
}

export const BookCoverForm = ({ book, onDone }: BookCoverFormProps) => {
  // ✅ Tipado explícito de useForm
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema) as unknown as Resolver<FormValues>,
    defaultValues: {
      name: book.name,
      authorizationDate: new Date(book.authorizationDate || book.createdAt),
      tome: book.tome,
    },
  });

  // ✅ Tipado explícito de onSubmit
  const onSubmit: SubmitHandler<FormValues> = (data) => {
    onDone(data);
  };

  return (
    <div>
      <div className="flex items-center justify-between pb-4 border-b p-4">
        <div>
          <h3 className="text-2xl font-bold">Portada del Libro</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Define el nombre, tomo (opcional) y fecha de autorización oficial.
          </p>
        </div>
      </div>
      <div className="p-4">
        {/* Usar form directamente, tipo inferido correctamente */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Libro</FormLabel>
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
                  <FormLabel>Tomo (Opcional)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      placeholder="Ej: 1"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => {
                        const value = e.target.value;
                        // Pasar undefined si está vacío, sino el número
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
                        onSelect={field.onChange} // Calendar pasa Date | undefined
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Guardar Portada</Button>
          </form>
        </Form>
      </div>
    </div>
  );
};
