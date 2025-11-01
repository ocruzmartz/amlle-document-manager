import { useState, useEffect, useCallback, useMemo } from "react";
import { type Act } from "@/types";
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
import { useSaveAction } from "@/hooks/useSaveAction"; 

interface ActEditorProps {
  act: Act;
  onUpdateAct: (updatedAct: Act) => void;
  onToggleAgreements?: () => void;
  onBackToList: () => void;
  isAgreementsPanelVisible?: boolean;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
}

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
  const [headerExistsInContent, setHeaderExistsInContent] = useState(() =>
    (act.bodyContent || "").includes('data-act-header="true"')
  );

  const currentCombinedData = useMemo(
    () => ({
      ...act,
      ...localActData,
      bodyContent: editorContent,
      clarifyingNote: clarifyingNoteContent,
    }),
    [act, localActData, editorContent, clarifyingNoteContent]
  );

  const { handleSave, isDirty, isSaving } = useSaveAction<Act>({
    initialData: act,
    currentData: currentCombinedData,
    onSave: onUpdateAct,
    setHasUnsavedChanges: setHasUnsavedChanges,
    loadingMessage: "Guardando acta...",
    successMessage: "Acta guardada exitosamente.",
    errorMessage: "Error al guardar el acta.",
  });

  useEffect(() => {
    setLocalActData(act);
    setEditorContent(act.bodyContent);
    setClarifyingNoteContent(act.clarifyingNote || "");
    setHeaderExistsInContent(
      (act.bodyContent || "").includes('data-act-header="true"')
    );
  }, [act]);

  const handlePropertyChange = useCallback(
    <K extends keyof Act>(field: K, value: Act[K]) => {
      setLocalActData((prevState) => ({ ...prevState, [field]: value }));
    },
    []
  );
  const handleBodyContentChange = useCallback((newContent: string) => {
    setEditorContent(newContent);
    setHeaderExistsInContent(
      (newContent || "").includes('data-act-header="true"')
    );
  }, []);
  const handleClarifyingNoteChange = useCallback((newContent: string) => {
    setClarifyingNoteContent(newContent);
  }, []);

  const generateInitialHeader = () => {
    const headerHtml = generateActHeaderHtml(localActData);
    setEditorContent(headerHtml);
    setHeaderExistsInContent(true);
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
    setHeaderExistsInContent(true);
  };
  const needsRegeneration = () => {
    if (!headerExistsInContent) return false;
    const currentGeneratedHeader = generateActHeaderHtml(localActData);
    const headerRegex = /<p data-act-header="true">[\s\S]*?<\/p>/;
    const match = editorContent.match(headerRegex);
    const editorHeaderInContent = match ? match[0] : null;
    return editorHeaderInContent !== currentGeneratedHeader;
  };
  const canGenerateInitial =
    localActData.sessionDate &&
    localActData.attendees?.syndic &&
    localActData.attendees?.secretary;

  return (
    <form onSubmit={(e) => e.preventDefault()} className="flex flex-col h-full">
      <div className="shrink-0 p-3 border-b bg-white flex justify-between items-center sticky top-0 z-10">
        <h2 className="text-lg font-bold truncate" title={act.name}>
          {act.name}
        </h2>
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

      {/* Contenido principal */}
      <div className="flex-1 overflow-y-auto">
        <div className="p-4 space-y-4">
          {/* Sección del Encabezado */}
          <div className="mb-4 p-4 border rounded-lg bg-muted/30 flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">
                {!headerExistsInContent
                  ? "Completa los datos de Sesión y Asistencia para generar el encabezado."
                  : "Si los datos de la sesión o asistencia cambian, puedes regenerar el encabezado."}
              </p>
            </div>
            <div>
              {!headerExistsInContent ? (
                <Button
                  onClick={generateInitialHeader}
                  disabled={!canGenerateInitial}
                  size="sm"
                >
                  <PlayIcon className="mr-2 h-4 w-4" /> Generar Encabezado
                </Button>
              ) : (
                needsRegeneration() && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={regenerateHeader}
                  >
                    <RefreshCcw className="mr-2 h-4 w-4" /> Regenerar Encabezado
                  </Button>
                )
              )}
              {headerExistsInContent && !needsRegeneration() && (
                <p className="text-sm text-green-600 font-medium flex items-center gap-1">
                  <Check className="h-4 w-4" /> Encabezado Sincronizado
                </p>
              )}
            </div>
          </div>

          {/* Collapsibles */}
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
              <h3 className="text-lg font-semibold">Asistencia del Concejo</h3>
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
              {!headerExistsInContent && !editorContent ? (
                <div className="text-center p-8 text-sm text-muted-foreground">
                  Genera el encabezado para empezar a editar o escribe
                  directamente.
                </div>
              ) : (
                <div className="min-h-[400px] overflow-hidden">
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
          <Button onClick={handleSave} disabled={!isDirty || isSaving}>
            {isSaving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </div>
    </form>
  );
};
