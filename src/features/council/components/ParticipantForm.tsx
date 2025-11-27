import { useEffect } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  participantSchema,
  type ParticipantFormData,
  getDefaultValues,
} from "../schemas/participantSchema";
import { councilService } from "../api/councilService"; // Importamos el servicio aquí
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
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetFooter,
  SheetClose,
} from "@/components/ui/sheet";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface ParticipantFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  entityToEdit: { id: string; name: string } | null;
  entityType: "PROPIETARIO" | "SUBSTITUTO";
  onSave: () => void;
}

export const ParticipantForm = ({
  isOpen,
  onOpenChange,
  entityToEdit,
  entityType,
  onSave,
}: ParticipantFormProps) => {
  const isEditMode = !!entityToEdit;
  const title = isEditMode
    ? `Editar ${entityType === "PROPIETARIO" ? "Propietario" : "Suplente"}`
    : `Crear ${entityType === "PROPIETARIO" ? "Propietario" : "Suplente"}`;

  const form = useForm<ParticipantFormData>({
    resolver: zodResolver(participantSchema),
    defaultValues: getDefaultValues(entityToEdit),
  });

  useEffect(() => {
    if (isOpen) {
      form.reset(getDefaultValues(entityToEdit));
    }
  }, [isOpen, entityToEdit, form]);

  const onSubmit: SubmitHandler<ParticipantFormData> = async (formData) => {
    const toastId = toast.loading(
      isEditMode ? "Actualizando..." : "Creando registro..."
    );

    try {
      if (entityType === "PROPIETARIO") {
        if (isEditMode && entityToEdit) {
          await councilService.updatePropietario(entityToEdit.id, formData);
        } else {
          await councilService.createPropietario(formData);
        }
      } else {
        if (isEditMode && entityToEdit) {
          await councilService.updateSubstituto(entityToEdit.id, formData);
        } else {
          await councilService.createSubstituto(formData);
        }
      }

      toast.success(
        isEditMode ? "Actualizado exitosamente" : "Creado exitosamente",
        { id: toastId }
      );
      onSave();
      onOpenChange(false);
    } catch (error) {
      console.error("Error saving participant:", error);
      toast.error("No se pudo guardar el registro.", { id: toastId });
    }
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent className="sm:max-w-lg p-0 flex flex-col h-full">
        <SheetHeader className="p-6">
          <SheetTitle>{title}</SheetTitle>
        </SheetHeader>

        <Form {...form}>
          <form
            id="participant-form"
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 p-6"
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre Completo</FormLabel>
                  <FormControl>
                    <Input placeholder="Ej: Juan Pérez" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </form>
        </Form>

        <SheetFooter className="p-4 border-t bg-muted/50">
          <SheetClose asChild>
            <Button type="button" variant="outline">
              Cancelar
            </Button>
          </SheetClose>
          <Button
            type="submit"
            form="participant-form"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Guardando...
              </>
            ) : isEditMode ? (
              "Guardar Cambios"
            ) : (
              "Crear"
            )}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
};
