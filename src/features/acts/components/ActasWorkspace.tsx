// filepath: src/features/acts/components/ActasWorkspace.tsx
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
import { ChevronsUpDown, Save, Check, EyeOff, EyeIcon } from "lucide-react";

const actSchema = z.object({
  name: z.string().min(3, "El nombre es requerido"),
});

type ActFormValues = z.infer<typeof actSchema>;

interface ActWorkspaceProps {
  act: Act;
  onUpdateAct?: (updatedAct: Act) => void;
  onDoneEditing?: () => void;
  onToggleAgreements?: () => void;
  isAgreementsPanelVisible?: boolean;
}

export const ActWorkspace = ({
  act,
  onUpdateAct,
  onDoneEditing,
  onToggleAgreements,
  isAgreementsPanelVisible = true,
}: ActWorkspaceProps) => {
  const [localActState, setLocalActState] = useState<Act>(act);
  const [bodyContentState, setBodyContentState] = useState(act.bodyContent);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle"
  );

  const [clarifyingNoteState, setClarifyingNoteState] = useState(
    act.clarifyingNote || ""
  );

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const form = useForm<ActFormValues>({
    resolver: zodResolver(actSchema),
    defaultValues: { name: act.name },
  });

  useEffect(() => {
    setLocalActState(act);
    setBodyContentState(act.bodyContent);
    setClarifyingNoteState(act.clarifyingNote || "");
    form.reset({ name: act.name });
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
    const updatedAct = { ...localActState, [field]: value };
    setLocalActState(updatedAct);

    if (field === "bodyContent") setBodyContentState(value as string);
    if (field === "clarifyingNote") setClarifyingNoteState(value as string);

    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    debounceTimeoutRef.current = setTimeout(() => {
      if (onUpdateAct) {
        onUpdateAct(updatedAct);
      }
    }, 500);
  };

  const handleHideAgreements = () => {
    if (onToggleAgreements) {
      onToggleAgreements();
    }
  };

  const handleNameInputChange = (name: string) => {
    handleActPropertyChange("name", name);
  };

  const handleFormSubmit = (data: ActFormValues) => {
    setSaveStatus("saving"); // ✅ Inicia el estado de guardado
    const finalAct = {
      ...localActState,
      name: data.name,
      bodyContent: bodyContentState,
      clarifyingNote: clarifyingNoteState,
    };
    if (onUpdateAct) onUpdateAct(finalAct);
    if (onDoneEditing) onDoneEditing();

    // ✅ Simular guardado y dar feedback
    setTimeout(() => {
      setSaveStatus("saved");
      setTimeout(() => setSaveStatus("idle"), 2000);
    }, 1000);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)}>
        {/* Header */}
        <div className="flex flex-shrink-0 items-center justify-between border-b bg-white p-3 sticky top-0 z-10">
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
          <Button onClick={handleHideAgreements} variant={"ghost"} size="sm">
            {isAgreementsPanelVisible ? (
              <>
                <EyeOff className="mr-1 h-4 w-4" />
                Ocultar Acuerdos
              </>
            ) : (
              <>
                <EyeIcon className="mr-1 h-4 w-4" />
                Mostrar Acuerdos
              </>
            )}
          </Button>
        </div>

        {/* ✅ 2. El contenido principal ahora usa un div simple con espaciado */}
        <div className="p-4 space-y-4">
          {/* ✅ 3. Cada sección es ahora un bloque colapsable */}
          <Collapsible defaultOpen className="border rounded-lg">
            <CollapsibleTrigger className="w-full flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50">
              <h3 className="text-lg font-semibold">Datos de la Sesión</h3>
              <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
            </CollapsibleTrigger>
            <CollapsibleContent className="p-4 border-t">
              <ActTemplateEditor
                act={localActState}
                onActChange={handleActPropertyChange}
              />
            </CollapsibleContent>
          </Collapsible>

          <Collapsible defaultOpen className="border rounded-lg">
            <CollapsibleTrigger className="w-full flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50">
              <h3 className="text-lg font-semibold">Asistencia del Concejo</h3>
              <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
            </CollapsibleTrigger>
            <CollapsibleContent className="p-4 border-t">
              <AttendeesManager
                attendees={localActState.attendees}
                onAttendeesChange={(attendees) =>
                  handleActPropertyChange("attendees", attendees)
                }
              />
            </CollapsibleContent>
          </Collapsible>

          <Collapsible defaultOpen className="border rounded-lg">
            <CollapsibleTrigger className="w-full flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50">
              <h3 className="text-lg font-semibold">Cuerpo del Acta</h3>
              <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
            </CollapsibleTrigger>
            <CollapsibleContent>
              <div className="min-h-[400px]">
                <RichTextEditor
                  content={bodyContentState}
                  onChange={(content) => {
                    setBodyContentState(content);
                    handleActPropertyChange("bodyContent", content);
                  }}
                />
              </div>
            </CollapsibleContent>
          </Collapsible>

          <Collapsible className="border rounded-lg">
            <CollapsibleTrigger className="w-full flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50">
              <h3 className="text-lg font-semibold">
                Nota Aclaratoria (Opcional)
              </h3>
              <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
            </CollapsibleTrigger>
            <CollapsibleContent>
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

        {/* Footer */}
        <div className="flex-shrink-0 p-4 border-t bg-white sticky bottom-0 z-10">
          <div className="flex justify-end gap-4">
            <Button type="submit" disabled={saveStatus !== "idle"}>
              {saveStatus === "saving" && (
                <>
                  <Save className="mr-2 h-4 w-4 animate-spin" /> Guardando...
                </>
              )}
              {saveStatus === "saved" && (
                <>
                  <Check className="mr-2 h-4 w-4" /> ¡Guardado!
                </>
              )}
              {saveStatus === "idle" && <>Guardar Cambios</>}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};
