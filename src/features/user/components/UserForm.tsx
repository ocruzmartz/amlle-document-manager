import { useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  userFormSchema,
  type UserFormData,
  getDefaultValues,
} from "../schemas/userFormSchema";
import { type User } from "@/types";
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
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { createUser, updateUser } from "../api/user";
import { toast } from "sonner";
import { ScrollArea } from "@/components/ui/scroll-area";

const sessionDurationOptions = [
  { label: "1 Hora", value: "1h" },
  { label: "4 Horas", value: "4h" },
  { label: "8 Horas", value: "8h" },
  { label: "1 Día", value: "1d" },
  { label: "1 Semana", value: "7d" },
];

interface UserFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  userToEdit: User | null;
  onSave: () => void;
}

export const UserForm: React.FC<UserFormProps> = ({
  isOpen,
  onOpenChange,
  userToEdit,
  onSave,
}) => {
  const isEditMode = !!userToEdit;

  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    defaultValues: getDefaultValues(userToEdit),
  });

  const sessionType = form.watch("sessionType");

  useEffect(() => {
    if (isOpen) {
      form.reset(getDefaultValues(userToEdit));
    }
  }, [userToEdit, isOpen, form]);

  const onSubmit: SubmitHandler<UserFormData> = async (formData) => {
    const toastId = toast.loading(
      isEditMode ? "Actualizando usuario..." : "Creando usuario..."
    );
    try {
      if (isEditMode && userToEdit) {
        // ✅ CAMBIO AQUÍ: Pasamos 'userToEdit' como el tercer argumento
        await updateUser(userToEdit.id, formData, userToEdit);
        toast.success("Usuario actualizado exitosamente", { id: toastId });
      } else {
        await createUser(formData);
        toast.success(
          "Usuario creado. La contraseña debe asignarse por separado.",
          { id: toastId }
        );
      }
      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving user:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo guardar el usuario.",
        { id: toastId }
      );
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg p-0 flex flex-col h-full">
        <SheetHeader className="p-6 ">
          <SheetTitle>
            {isEditMode ? "Editar Usuario" : "Crear Nuevo Usuario"}
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 overflow-y-auto">
          <Form {...form}>
            <form
              id="user-form"
              onSubmit={form.handleSubmit(onSubmit)}
              className="space-y-6 p-6"
            >
              {/* --- CAMPO 'NOMBRE' (SIEMPRE VISIBLE) --- */}
              <FormField
                control={form.control}
                name="nombre"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre Completo</FormLabel>
                    <FormControl>
                      <Input placeholder="Nombre y Apellido" {...field} />
                    </FormControl>
                    <FormDescription>
                      {isEditMode
                        ? "Actualiza el nombre del perfil."
                        : "Nombre para el nuevo usuario."}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="border-t pt-6 space-y-6">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Configuración de Sesión
                </h4>
                <FormField
                  control={form.control}
                  name="sessionType"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Tipo de Sesión</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={(value: "INDEFINITE" | "TEMPORAL") => {
                            field.onChange(value);
                            if (value === "INDEFINITE") {
                              form.setValue("sessionDuration", null);
                            } else {
                              form.setValue("sessionDuration", "8h"); // Default
                            }
                          }}
                          value={field.value}
                          className="flex flex-col sm:flex-row gap-4"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="INDEFINITE" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              Indefinida
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="TEMPORAL" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              Temporal
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {sessionType === "TEMPORAL" && (
                  <FormField
                    control={form.control}
                    name="sessionDuration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Duración de la Sesión Temporal</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value ?? undefined}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar duración..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {sessionDurationOptions.map((option) => (
                              <SelectItem
                                key={option.value}
                                value={option.value}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          La sesión expirará después de este tiempo.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </form>
          </Form>
        </ScrollArea>

        <SheetFooter className="p-4 border-t bg-muted/50">
          <SheetClose asChild>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </SheetClose>
          <Button
            type="submit"
            form="user-form"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting
              ? "Guardando..."
              : isEditMode
              ? "Guardar Cambios"
              : "Crear Usuario"}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
