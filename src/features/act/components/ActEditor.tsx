// filepath: src/features/act/components/ActEditor.tsx
import { useState, useEffect, useRef, useCallback } from "react";
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
import { ActAttendeesForm } from "./ActAttendeesForm";
import { ActSessionForm } from "./ActSessionForm";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  ChevronsUpDown,
  EyeOff,
  EyeIcon,
  RefreshCcw,
  PlayIcon,
  Check,
} from "lucide-react";
import { generateActHeaderHtml } from "../lib/actHelpers";


const actSchema = z.object({
  name: z.string().min(3, "El nombre es requerido"),
});

type ActFormValues = z.infer<typeof actSchema>;

interface ActEditorProps {
  act: Act;
  onUpdateAct: (updatedAct: Act) => void;
  onToggleAgreements?: () => void;
  onBackToList: () => void;
  isAgreementsPanelVisible?: boolean;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
}

const hasGeneratedHeader = (content: string): boolean => {
  const headerRegex = /<p data-act-header="true">[\s\S]*?<\/p>/;
  return headerRegex.test(content);
};

const isHeaderManuallyEdited = (
  editorContent: string,
  localActData: Partial<Act>
): boolean => {
  if (!hasGeneratedHeader(editorContent)) return false;
  const currentHeaderRegex = /<p data-act-header="true">[\s\S]*?<\/p>/;
  const match = editorContent.match(currentHeaderRegex);
  const currentHeaderText = match ? match[0] : null;
  const generatedHeaderHtml = generateActHeaderHtml(localActData);
  return currentHeaderText !== generatedHeaderHtml;
};

export const ActEditor = ({
  act,
  onUpdateAct,
  onToggleAgreements,
  onBackToList,
  isAgreementsPanelVisible = true,
  setHasUnsavedChanges,
}: ActEditorProps) => {
  const [localActData, setLocalActData] = useState<Partial<Act>>(act);
  const [editorContent, setEditorContent] = useState<string>(act.bodyContent);
  const [clarifyingNoteContent, setClarifyingNoteContent] = useState<string>(
    act.clarifyingNote || ""
  );
  const [isHeaderInitiallyGenerated, setIsHeaderInitiallyGenerated] = useState(
    hasGeneratedHeader(act.bodyContent)
  );
  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const form = useForm<ActFormValues>({
    resolver: zodResolver(actSchema),
    defaultValues: { name: act.name },
  });

  useEffect(() => {
    setLocalActData(act);
    setEditorContent(act.bodyContent);
    setClarifyingNoteContent(act.clarifyingNote || "");
    setIsHeaderInitiallyGenerated(hasGeneratedHeader(act.bodyContent));
    form.reset({ name: act.name });
    setHasUnsavedChanges(false);
  }, [act, form, setHasUnsavedChanges]);

  const handlePropertyChange = useCallback(
    <K extends keyof Act>(field: K, value: Act[K]) => {
      setLocalActData((prevState) => ({ ...prevState, [field]: value }));
      setHasUnsavedChanges(true);
    },
    [setHasUnsavedChanges]
  );

  const handleBodyContentChange = useCallback(
    (newContent: string) => {
      setEditorContent(newContent);
      setHasUnsavedChanges(true);
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = setTimeout(() => {
        onUpdateAct({
          ...act,
          ...localActData,
          bodyContent: newContent,
          clarifyingNote: clarifyingNoteContent,
        } as Act);
      }, 500);
    },
    [
      act,
      localActData,
      onUpdateAct,
      setHasUnsavedChanges,
      clarifyingNoteContent,
    ]
  );

  const handleClarifyingNoteChange = useCallback(
    (newContent: string) => {
      setClarifyingNoteContent(newContent);
      setHasUnsavedChanges(true);
      if (debounceTimeoutRef.current) clearTimeout(debounceTimeoutRef.current);
      debounceTimeoutRef.current = setTimeout(() => {
        onUpdateAct({
          ...act,
          ...localActData,
          bodyContent: editorContent,
          clarifyingNote: newContent,
        } as Act);
      }, 500);
    },
    [act, localActData, onUpdateAct, setHasUnsavedChanges, editorContent]
  );

  const generateInitialHeader = () => {
    const headerHtml = generateActHeaderHtml(localActData);
    setEditorContent(headerHtml);
    setIsHeaderInitiallyGenerated(true);
    setHasUnsavedChanges(true);
    onUpdateAct({
      ...act,
      ...localActData,
      bodyContent: headerHtml,
      clarifyingNote: clarifyingNoteContent,
    } as Act);
  };

  const regenerateHeader = () => {
    const newHeaderHtml = generateActHeaderHtml(localActData);
    const headerRegex = /<p data-act-header="true">[\s\S]*?<\/p>/;
    let newBodyContent = editorContent;

    if (headerRegex.test(editorContent)) {
      newBodyContent = editorContent.replace(headerRegex, newHeaderHtml);
    } else {
      newBodyContent = newHeaderHtml + "\n" + editorContent;
    }
    setEditorContent(newBodyContent);
    setHasUnsavedChanges(true);
    onUpdateAct({
      ...act,
      ...localActData,
      bodyContent: newBodyContent,
      clarifyingNote: clarifyingNoteContent,
    } as Act);
  };

const needsRegeneration = () => {
      if (!isHeaderInitiallyGenerated) return false;
      const currentGeneratedHeader = generateActHeaderHtml(localActData);
      const headerRegex = /<p data-act-header="true">[\s\S]*?<\/p>/;
      const match = editorContent.match(headerRegex);
      const editorHeader = match ? match[0] : null;
      // Necesita regeneración si el encabezado actual es diferente al que se generaría AHORA
      return editorHeader !== currentGeneratedHeader;
  };

  const canGenerateInitial =
    localActData.name &&
    localActData.sessionDate &&
    localActData.attendees?.syndic &&
    localActData.attendees?.secretary;

  return (
    <Form {...form}>
      <form
        onSubmit={(e) => e.preventDefault()}
        className="flex flex-col h-full"
      >
        {/* Header */}
        <div className="shrink-0 p-3 border-b bg-white flex justify-between items-center sticky top-0 z-10">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem className="flex-1">
                <FormControl>
                  <Input
                    {...field}
                    className="text-lg! font-bold border-none shadow-none focus-visible:ring-0 p-0"
                    onChange={(e) => {
                      field.onChange(e);
                      handlePropertyChange("name", e.target.value);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button onClick={onToggleAgreements} variant="ghost" size="sm">
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

        {/* Contenido principal con scroll */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-4 space-y-4">
           <div className="mb-4 p-4 border rounded-lg bg-muted/30 flex items-center justify-between">
                <div>
                    <p className="text-sm text-muted-foreground">
                        {isHeaderInitiallyGenerated
                         ? "Puedes regenerar el encabezado si cambiaste datos de sesión o asistencia."
                         : "Completa los datos de Sesión y Asistencia para generar el encabezado."}
                    </p>
                </div>
                <div>
                    {!isHeaderInitiallyGenerated ? (
                         <Button onClick={generateInitialHeader} disabled={!canGenerateInitial} size="sm">
                           <PlayIcon className="mr-2 h-4 w-4"/> Generar Encabezado
                         </Button>
                    ) : (
                         needsRegeneration() && ( // Solo muestra el botón si es necesario regenerar
                            <Button variant="outline" size="sm" onClick={regenerateHeader}>
                                <RefreshCcw className="mr-2 h-4 w-4" />
                                Regenerar Encabezado
                            </Button>
                         )
                    )}
                     {/* Mensaje de encabezado actualizado (opcional) */}
                    {isHeaderInitiallyGenerated && !needsRegeneration() && (
                         <p className="text-sm text-green-600 font-medium flex items-center gap-1">
                             <Check className="h-4 w-4"/> Encabezado actualizado
                         </p>
                    )}
                 </div>
            </div>

            {/* Resto de Collapsibles sin cambios */}
            <Collapsible defaultOpen className="border rounded-lg">
              <CollapsibleTrigger className="w-full flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50">
                <h3 className="text-lg font-semibold">Datos de la Sesión</h3>
                <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
              </CollapsibleTrigger>
              <CollapsibleContent className="p-4 border-t">
                <ActSessionForm
                  act={localActData as Act}
                  onActChange={handlePropertyChange}
                />
              </CollapsibleContent>
            </Collapsible>
            <Collapsible defaultOpen className="border rounded-lg">
              <CollapsibleTrigger className="w-full flex items-center justify-between p-4 cursor-pointer hover:bg-muted/50">
                <h3 className="text-lg font-semibold">
                  Asistencia del Concejo
                </h3>
                <ChevronsUpDown className="h-4 w-4 text-muted-foreground" />
              </CollapsibleTrigger>
              <CollapsibleContent className="p-4 border-t">
                <ActAttendeesForm
                  attendees={localActData.attendees}
                  onAttendeesChange={(attendees) =>
                    handlePropertyChange("attendees", attendees)
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
                {!isHeaderInitiallyGenerated && !editorContent ? (
                  <div className="text-center p-8 border-t text-sm text-muted-foreground">
                    Genera el encabezado para empezar a editar o escribe
                    directamente.
                  </div>
                ) : (
                  <div className="min-h-[400px] overflow-hidden border-t">
                    <RichTextEditor
                      key={act.id}
                      content={editorContent}
                      onChange={handleBodyContentChange}
                    />
                  </div>
                )}
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
                <div className="min-h-[400px] overflow-hidden">
                  <RichTextEditor
                    key={`${act.id}-note`}
                    content={clarifyingNoteContent}
                    onChange={handleClarifyingNoteChange}
                  />
                </div>
              </CollapsibleContent>
            </Collapsible>
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 p-4 border-t bg-white sticky bottom-0 z-10">
          <div className="flex justify-end gap-4">
            <Button type="button" variant="outline" onClick={onBackToList}>
              Volver
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
};
