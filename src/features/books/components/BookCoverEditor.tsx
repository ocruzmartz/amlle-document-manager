// filepath: src/features/books/components/BookCoverEditor.tsx
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

const formSchema = z.object({
  name: z
    .string()
    .min(5, { message: "El nombre debe tener al menos 5 caracteres." }),
  creationDate: z.date(),
  tome: z.number().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface BookCoverEditorProps {
  book: Book;
  onDone: (data: FormValues) => void; // ✅ Renombrado de 'onSave' a 'onDone'
}

export const BookCoverEditor = ({ book, onDone }: BookCoverEditorProps) => { // ✅ Prop renombrada
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: book.name,
      creationDate: new Date(book.createdAt),
      tome: book.tome,
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between pb-4 border-b p-4">
        <div>
          <h3 className="text-2xl font-bold">Portada</h3>
          <p className="text-muted-foreground text-sm mt-1">
            Modifica la portada de este libro.
          </p>
        </div>
      </div>
      <div className="p-4">
        <Form {...form}>
          {/* ✅ El submit ahora llama a la nueva prop 'onDone' */}
          <form onSubmit={form.handleSubmit(onDone)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Libro (Identificador)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="creationDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fecha de Autorización</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={"outline"}
                          className={cn(
                            "pl-3 text-left font-normal",
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
            <Button type="submit">Continuar</Button>
          </form>
        </Form>
      </div>
    </div>
  );
};