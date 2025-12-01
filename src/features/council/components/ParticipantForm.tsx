// src/features/council/components/ParticipantForm.tsx
import { useEffect, useMemo } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  participantSchema,
  type ParticipantFormData,
  getDefaultValues,
  COUNCIL_ROLE_OPTIONS,
} from "../schemas/participantSchema";
import { councilService } from "../api/councilService";
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
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import type { CouncilMemberType, Propietario, Substituto } from "@/types/council";

interface ParticipantFormProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  // entityToEdit puede ser Propietario o Substituto (ambos tienen id, name, type)
  entityToEdit: (Partial<Propietario | Substituto> & { id: string; name: string }) | null;
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

  // Filtramos las opciones según el tipo de entidad que estamos creando
  const filteredOptions = useMemo(() => {
    if (entityType === "SUBSTITUTO") {
      return COUNCIL_ROLE_OPTIONS.filter((opt) => opt.value.includes("SUPLENTE"));
    }
    // Para propietarios mostramos el resto (Alcalde, Sindico, Regidores)
    return COUNCIL_ROLE_OPTIONS.filter((opt) => !opt.value.includes("SUPLENTE"));
  }, [entityType]);

  const onSubmit: SubmitHandler<ParticipantFormData> = async (formData) => {
    const toastId = toast.loading(
      isEditMode ? "Actualizando..." : "Creando registro..."
    );

    try {
      const payload = {
        name: formData.name,
        type: (formData.type || null) as CouncilMemberType | null, 
      };

      if (entityType === "PROPIETARIO") {
        if (isEditMode && entityToEdit) {
          await councilService.updatePropietario(entityToEdit.id, payload);
        } else {
          await councilService.createPropietario(payload);
        }
      } else {
        if (isEditMode && entityToEdit) {
          await councilService.updateSubstituto(entityToEdit.id, payload);
        } else {
          await councilService.createSubstituto(payload);
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

            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cargo / Rol</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                    value={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecciona el cargo" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {filteredOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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