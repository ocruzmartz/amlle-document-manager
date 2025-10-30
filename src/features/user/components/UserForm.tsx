// filepath: src/features/user/components/UserForm.tsx
import { useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form"; // Import SubmitHandler
import { zodResolver } from "@hookform/resolvers/zod";
// Use updated import path for schema and types from the 'schemas' directory
import {
  userFormSchema,
  type UserFormData, // Primary type for validated data
  // type UserFormValues, // We might not need this explicitly if UserFormData works
  getDefaultValues,
} from "../schemas/userFormSchema";
// Import base types
import { type User, type SessionType } from "@/types";
// Import UI components
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
} from "@/components/ui/sheet"; // Side panel component
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
// Use updated API function names
import { createUser, updateUser } from "../api/user";
import { toast } from "sonner"; // For user feedback notifications
import { ScrollArea } from "@/components/ui/scroll-area"; // To make form scrollable if content overflows

// Interface for component props (using English names)
interface UserFormProps {
  isOpen: boolean; // Controls the visibility of the Sheet panel
  onOpenChange: (open: boolean) => void; // Callback to handle opening/closing the Sheet
  userToEdit: User | null; // The user object to edit (if any), null for create mode
  onSave: () => void; // Callback function to execute after saving (e.g., refresh user list)
}

// Predefined options for the temporary session duration dropdown (UI labels in Spanish)
// Using an array of objects for easier mapping
const sessionDurationOptions = [
  { label: "1 Hora", value: 1 },
  { label: "2 Horas", value: 2 },
  { label: "3 Horas", value: 3 },
  { label: "4 Horas", value: 4 },
  { label: "8 Horas", value: 8 },
  { label: "1 Día (24h)", value: 24 },
  { label: "1 Semana (168h)", value: 168 },
];

/**
 * UserForm component: Renders a form within a Sheet (side panel)
 * for creating or editing user details.
 */
export const UserForm: React.FC<UserFormProps> = ({
  isOpen,
  onOpenChange,
  userToEdit,
  onSave,
}) => {
  // Determine if the form is in edit mode based on whether userToEdit is provided
  const isEditMode = !!userToEdit;

  // Initialize react-hook-form with Zod resolver and default values
  // CORRECTION: Use UserFormData as the generic type for useForm
  const form = useForm<UserFormData>({
    resolver: zodResolver(userFormSchema),
    // Use the helper function to get appropriate default values for create/edit mode
    // getDefaultValues now returns UserFormValues, but zodResolver handles the conversion
    defaultValues: getDefaultValues(userToEdit),
  });

  // Watch the 'sessionType' field to conditionally render the 'sessionDuration' field
  const sessionType = form.watch("sessionType");

  // Effect to reset the form whenever the 'userToEdit' prop changes or the sheet opens.
  useEffect(() => {
    if (isOpen) {
      // Reset the form using the helper function
      form.reset(getDefaultValues(userToEdit));
    }
  }, [userToEdit, isOpen, form]);

  /**
   * Handles the form submission after successful validation.
   * Calls either the createUser or updateUser API function.
   * CORRECTION: onSubmit now directly receives UserFormData due to useForm<UserFormData>
   * @param formData - The validated form data, matching the UserFormData type.
   */
  const onSubmit: SubmitHandler<UserFormData> = async (formData) => {
    const toastId = toast.loading(
      isEditMode ? "Actualizando usuario..." : "Creando usuario..."
    );
    try {
      if (isEditMode && userToEdit) {
        await updateUser(userToEdit.id, formData);
        toast.success("Usuario actualizado exitosamente", { id: toastId });
      } else {
        await createUser(formData);
        toast.success("Usuario creado exitosamente", { id: toastId });
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

  // --- Render Logic ---
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg p-0 flex flex-col h-full">
        <SheetHeader className="p-6 border-b">
          <SheetTitle>
            {isEditMode ? "Editar Usuario" : "Crear Nuevo Usuario"}
          </SheetTitle>
        </SheetHeader>

        <ScrollArea className="flex-1 overflow-y-auto">
          <Form {...form}>
            <form
              id="user-form"
              onSubmit={form.handleSubmit(onSubmit)} // handleSubmit correctly passes UserFormData to onSubmit
              className="space-y-6 p-6"
            >
              {/* --- Basic Information Section --- */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* First Name Field */}
                <FormField
                  control={form.control} // Now correctly typed
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre del usuario" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                {/* Last Name Field */}
                <FormField
                  control={form.control} // Now correctly typed
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Apellido</FormLabel>
                      <FormControl>
                        <Input placeholder="Apellido del usuario" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              {/* Email Field */}
              <FormField
                control={form.control} // Now correctly typed
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo Electrónico (Usuario)</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="usuario@ejemplo.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* --- Password Fields --- */}
              <FormField
                control={form.control} // Now correctly typed
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {isEditMode
                        ? "Nueva Contraseña (Opcional)"
                        : "Contraseña"}
                    </FormLabel>
                    <FormControl>
                      {/* Use value={field.value ?? ''} to handle potential null/undefined from form state */}
                      <Input
                        type="password"
                        placeholder="Mínimo 8 caracteres"
                        {...field}
                        value={field.value ?? ""}
                      />
                    </FormControl>
                    <FormDescription>
                      {isEditMode
                        ? "Dejar en blanco para no cambiar la contraseña actual."
                        : ""}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {/* Confirm Password Field (conditionally rendered) */}
              {form.watch("password") && (
                <FormField
                  control={form.control} // Now correctly typed
                  name="confirmPassword"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Confirmar Contraseña</FormLabel>
                      <FormControl>
                        {/* Use value={field.value ?? ''} */}
                        <Input
                          type="password"
                          placeholder="Repetir contraseña"
                          {...field}
                          value={field.value ?? ""}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* --- Permissions and Access Section --- */}
              <div className="border-t pt-6 space-y-6">
                <h4 className="text-sm font-medium text-muted-foreground">
                  Permisos y Acceso
                </h4>

                {/* Role / Permissions Field */}
                <FormField
                  control={form.control} // Now correctly typed
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Permisos (Rol)</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Seleccionar un rol..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="LECTOR">
                            Lector (Solo ver)
                          </SelectItem>
                          <SelectItem value="EDITOR">
                            Editor (Ver y escribir)
                          </SelectItem>
                          <SelectItem value="ADMIN">
                            Administrador (Control total)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Status Field (Only in Edit Mode) */}
                {isEditMode && (
                  <FormField
                    control={form.control} // Now correctly typed
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado de la Cuenta</FormLabel>
                        <Select
                          onValueChange={field.onChange}
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar estado..." />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="ACTIVE">Activo</SelectItem>
                            <SelectItem value="INACTIVE">
                              Inactivo (Stand-by)
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          "Inactivo" deshabilita la cuenta temporalmente sin
                          eliminarla.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {/* Session Type Field (Radio Group) */}
                <FormField
                  control={form.control} // Now correctly typed
                  name="sessionType"
                  render={({ field }) => (
                    <FormItem className="space-y-3">
                      <FormLabel>Tipo de Sesión</FormLabel>
                      <FormControl>
                        <RadioGroup
                          onValueChange={(value: SessionType) => {
                            field.onChange(value);
                            if (value === "INDEFINITE") {
                              form.setValue("sessionDuration", null, {
                                shouldValidate: true,
                              });
                            } else if (
                              form.getValues("sessionDuration") === null ||
                              form.getValues("sessionDuration") === undefined
                            ) {
                              // Check for null/undefined specifically
                              form.setValue("sessionDuration", 1, {
                                shouldValidate: true,
                              });
                            }
                          }}
                          defaultValue={field.value}
                          className="flex flex-col sm:flex-row gap-4"
                        >
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="INDEFINITE" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              Indefinida{" "}
                              <span className="text-xs text-muted-foreground">
                                (No expira)
                              </span>
                            </FormLabel>
                          </FormItem>
                          <FormItem className="flex items-center space-x-3 space-y-0">
                            <FormControl>
                              <RadioGroupItem value="TEMPORAL" />
                            </FormControl>
                            <FormLabel className="font-normal cursor-pointer">
                              Temporal{" "}
                              <span className="text-xs text-muted-foreground">
                                (Expira después de un tiempo)
                              </span>
                            </FormLabel>
                          </FormItem>
                        </RadioGroup>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Session Duration Field (Conditional) */}
                {/* CORRECTION: Use TEMPORAL for comparison */}
                {sessionType === "TEMPORAL" && (
                  <FormField
                    control={form.control} // Now correctly typed
                    name="sessionDuration"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>
                          Duración de la Sesión Temporal (Horas)
                        </FormLabel>
                        <Select
                          // Pass field.value directly (string | number | undefined)
                          // Convert incoming number|null|undefined to string for Select
                          onValueChange={(value) =>
                            field.onChange(value ? Number(value) : null)
                          }
                          value={field.value ? String(field.value) : undefined}
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
                                value={String(option.value)}
                              >
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          La sesión del usuario expirará después de este tiempo
                          desde su creación/actualización o último inicio de
                          sesión (según defina el backend).
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
