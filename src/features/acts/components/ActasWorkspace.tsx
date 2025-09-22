// src/features/acts/components/ActasWorkspace.tsx

import { useState, useEffect, useRef } from "react";
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ArrowRight, ChevronsUpDown } from "lucide-react";

const actSchema = z.object({
  // ✅ Renamed from actaSchema
  name: z.string().min(3, "El nombre es requerido"),
});

type ActFormValues = z.infer<typeof actSchema>; // ✅ Renamed from ActaFormValues

interface ActWorkspaceProps {
  // ✅ Renamed from ActaWorkspaceProps
  act: Act;
  onUpdateAct?: (updatedAct: Act) => void;
  onDoneEditing?: () => void;
  onManageAgreements: (actId: string) => void;
}

export const ActWorkspace = ({
  act,
  onUpdateAct,
  onDoneEditing,
  onManageAgreements
}: ActWorkspaceProps) => {
  // ✅ Renamed from ActaWorkspace
  const [localActState, setLocalActState] = useState<Act>(act); // ✅ Renamed from localAct
  const [bodyContentState, setBodyContentState] = useState(act.bodyContent); // ✅ Renamed from bodyContent
  const [clarifyingNoteState, setClarifyingNoteState] = useState(
    act.clarifyingNote || ""
  ); // ✅ Renamed from notaAclaratoria

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const form = useForm<ActFormValues>({
    resolver: zodResolver(actSchema),
    defaultValues: {
      name: act.name,
    },
  });

  useEffect(() => {
    console.log("🔄 ActWorkspace received new act:", act);
    setLocalActState(act);
    setBodyContentState(act.bodyContent);
    setClarifyingNoteState(act.clarifyingNote || "");

    form.reset({
      name: act.name,
    });
  }, [act, form]);

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const handleActPropertyChange = <K extends keyof Act>(
    field: K,
    value: Act[K]
  ) => {
    // A. Actualizar el estado local al instante para una UI fluida
    const updatedAct = { ...localActState, [field]: value };
    setLocalActState(updatedAct);

    if (field === "bodyContent") setBodyContentState(value as string);
    if (field === "clarifyingNote") setClarifyingNoteState(value as string);

    // B. Limpiar cualquier temporizador pendiente
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // C. Crear un nuevo temporizador para notificar al padre después de 500ms
    debounceTimeoutRef.current = setTimeout(() => {
      if (onUpdateAct) {
        console.log(
          "📤 Debounced: Enviando actualización al padre:",
          updatedAct
        );
        onUpdateAct(updatedAct);
      }
    }, 500);
  };

  const handleNameInputChange = (name: string) => {
    // ✅ Renamed from handleNameChange
    handleActPropertyChange("name", name);
  };

  const handleFormSubmit = (data: ActFormValues) => {
    // ✅ Renamed from onSubmit
    const finalAct = {
      ...localActState,
      name: data.name,
      bodyContent: bodyContentState,
      clarifyingNote: clarifyingNoteState,
    };

    console.log("💾 Saving act:", finalAct);

    if (onUpdateAct) {
      onUpdateAct(finalAct);
    }
    if (onDoneEditing) {
      onDoneEditing();
    }
  };

  return (
    <div className="h-full w-full">
      <div className="overflow-y-auto h-full">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleFormSubmit)}
            className="flex flex-col h-full"
          >
            {/* Header */}
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
                          handleNameInputChange(e.target.value);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Main content */}
            <div className="flex-1 overflow-y-auto">
              <div className="p-4 space-y-4">
                {/* Template Editor */}
                <div className="border rounded-lg p-4">
                  <ActTemplateEditor
                    act={localActState}
                    onActChange={handleActPropertyChange}
                  />
                </div>

                {/* Attendees Manager */}
                <div className="border rounded-lg p-4">
                  <AttendeesManager
                    attendees={localActState.attendees}
                    onAttendeesChange={(attendees) =>
                      handleActPropertyChange("attendees", attendees)
                    }
                  />
                </div>

                {/* Rich Text Editor */}
                <div className="border rounded-lg p-4">
                  <h3 className="text-lg font-semibold mb-4">
                    Puntos del Acta
                  </h3>

                  <div className="min-h-[400px] ">
                    <RichTextEditor
                      content={bodyContentState}
                      onChange={(content) => {
                        setBodyContentState(content);
                        handleActPropertyChange("bodyContent", content);
                      }}
                    />
                  </div>
                </div>

                {/* Agreements Section */}
                <div className="border rounded-lg">
                  <div
                    className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50"
                    onClick={() => onManageAgreements(localActState.id)}
                  >
                    <div>
                      <h3 className="text-lg font-semibold">
                        Acuerdos del Acta
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {localActState.agreements?.length || 0} acuerdos
                        definidos. Haz clic para gestionar.
                      </p>
                    </div>
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <span>Gestionar</span>
                      <ArrowRight className="h-4 w-4" />
                    </div>
                  </div>
                </div>

                {/* Clarifying Note Section */}
                <div className="border rounded-lg">
                  <Collapsible>
                    <CollapsibleTrigger className="w-full">
                      <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50">
                        <h3 className="text-lg font-semibold">
                          Nota Aclaratoria (Opcional)
                        </h3>
                        <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-4 border-t">
                      <RichTextEditor
                        content={clarifyingNoteState}
                        onChange={(content) => {
                          setClarifyingNoteState(content);
                          handleActPropertyChange("clarifyingNote", content);
                        }}
                      />
                    </CollapsibleContent>
                  </Collapsible>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="flex-shrink-0 p-4 border-t bg-white">
              <div className="flex justify-end gap-4">
                <Button type="submit">Guardar Cambios</Button>
              </div>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};
