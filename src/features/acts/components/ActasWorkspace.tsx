import { useState, useEffect } from "react";
import { type Act } from "@/types";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Form,
  FormField,
  FormItem,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/editor/RichTextEditor";
import { AttendeesManager } from "./AttendeesManager";
import { ActTemplateEditor } from "./ActTemplateEditor";

const actaSchema = z.object({
  name: z.string().min(3, "El nombre es requerido"),
});

type ActaFormValues = z.infer<typeof actaSchema>;

interface ActaWorkspaceProps {
  act: Act;
  onUpdateActa?: (updatedActa: Act) => void;
}

export const ActaWorkspace = ({ act, onUpdateActa }: ActaWorkspaceProps) => {
  const [localAct, setLocalAct] = useState<Act>(act);
  const [bodyContent, setBodyContent] = useState(act.bodyContent);

  const form = useForm<ActaFormValues>({
    resolver: zodResolver(actaSchema),
    defaultValues: {
      name: act.name,
    },
  });

  // ✅ Sincronizar cuando cambie el prop
  useEffect(() => {
    console.log("🔄 ActaWorkspace recibió nueva acta:", act);
    setLocalAct(act);
    setBodyContent(act.bodyContent);

    // ✅ Actualizar también el formulario
    form.reset({
      name: act.name,
    });
  }, [act, form]);

  // ✅ Función para manejar cambios en el acta
  const handleActChange = <K extends keyof Act>(field: K, value: Act[K]) => {
    console.log(`🔄 Actualizando ${field}:`, value);

    const updatedAct = {
      ...localAct,
      [field]: value,
    };

    setLocalAct(updatedAct);

    // ✅ Actualizar bodyContent si es necesario
    if (field === "bodyContent") {
      setBodyContent(value as string);
    }

    // ✅ Notificar inmediatamente al componente padre
    if (onUpdateActa) {
      console.log("📤 Enviando acta actualizada al padre:", updatedAct);
      onUpdateActa(updatedAct);
    }
  };

  const handleNameChange = (name: string) => {
    handleActChange("name", name);
  };

  const onSubmit = (data: ActaFormValues) => {
    const finalAct = {
      ...localAct,
      name: data.name,
      bodyContent,
    };

    console.log("💾 Guardando acta:", finalAct);

    if (onUpdateActa) {
      onUpdateActa(finalAct);
    }
  };

  return (
    <div className="h-full w-full">
      <div className="overflow-y-auto h-full">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="flex flex-col h-full"
          >
            {/* Cabecera - Fija */}
            <div
              className="flex-shrink-0  border-b bg-white p-3
            "
            >
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <Input
                        {...field}
                        className="text-lg! font-bold border-none shadow-none focus-visible:ring-0 p-0"
                        onChange={(e) => {
                          field.onChange(e);
                          handleNameChange(e.target.value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Contenido principal - Scrolleable */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-4">
                {/* Editor de plantilla */}
                <div className="border rounded-lg p-4">
                  <ActTemplateEditor
                    act={localAct}
                    onActChange={handleActChange}
                  />
                </div>

                {/* Gestión de asistentes */}
                <div className="border rounded-lg p-4">
                  <AttendeesManager
                    attendees={localAct.attendees}
                    onAttendeesChange={(attendees) =>
                      handleActChange("attendees", attendees)
                    }
                  />
                </div>

                {/* Editor de Texto Enriquecido */}
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">
                    Puntos del Acta
                  </h3>

                  <div className="min-h-[400px] ">
                    <RichTextEditor
                      content={bodyContent}
                      onChange={(content) => {
                        setBodyContent(content);
                        handleActChange("bodyContent", content);
                      }}
                    />
                  </div>
                </div>

                {/* Sección de Acuerdos */}
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-2">Acuerdos</h3>
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-8 text-center text-gray-500">
                    <p className="text-sm">
                      Próximamente: Lista de acuerdos y botón para añadir uno
                      nuevo.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Footer con botones - Fijo */}
            <div className="flex-shrink-0 p-4 border-t bg-white">
              <div className="flex justify-end gap-4">
                <Button type="button" variant="outline">
                  Guardar Borrador
                </Button>
                <Button type="submit">Guardar Cambios</Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};
