import { useState, useEffect, useCallback, useMemo } from "react";
import { type Agreement } from "@/types";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/editor/RichTextEditor";
import { numberToWords, capitalize } from "@/lib/textUtils";
import { FileImporter } from "@/components/editor/FileImporter";
import { useSaveAction } from "@/hooks/useSaveAction";

interface AgreementEditorProps {
  agreement: Agreement;
  agreementNumber: number;
  onUpdate: (updatedAgreement: Agreement) => void;
  onBack: () => void;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
}

export const AgreementEditor = ({
  agreement,
  agreementNumber,
  onUpdate,
  onBack,
  setHasUnsavedChanges,
}: AgreementEditorProps) => {
  const [localContent, setLocalContent] = useState(agreement.content);

  const currentCombinedData = useMemo(
    () => ({
      ...agreement,
      content: localContent,
    }),
    [agreement, localContent]
  );

  const { handleSave, isDirty, isSaving } = useSaveAction<Agreement>({
    initialData: agreement,
    currentData: currentCombinedData,
    onSave: onUpdate,
    setHasUnsavedChanges: setHasUnsavedChanges,
    loadingMessage: "Guardando acuerdo...",
    successMessage: "Acuerdo guardado exitosamente.",
    errorMessage: "Error al guardar el acuerdo.",
  });

  useEffect(() => {
    setLocalContent(agreement.content);
  }, [agreement.content]);

  const handleContentChange = useCallback((newContent: string) => {
    setLocalContent(newContent);
  }, []);

  const handleImportedContent = (importedHtml: string) => {
    const newContent = `${localContent}${importedHtml}`; 
    handleContentChange(newContent);
  };

  const agreementNumberInWords = capitalize(numberToWords(agreementNumber));

  return (
    <div className="h-full flex flex-col">
      <div className="shrink-0 p-4 border-b">
        <h3 className="text-xl font-bold">
          Acuerdo número {agreementNumberInWords}
        </h3>
      </div>
      <div className="m-4">
        <FileImporter onImport={handleImportedContent} />
      </div>
      <div className="flex-1 overflow-y-auto overflow-hidden">
        <RichTextEditor content={localContent} onChange={handleContentChange} />
      </div>
      <div className="shrink-0 p-4 border-t bg-white">
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onBack}>
            Volver
          </Button>
          <Button onClick={handleSave} disabled={!isDirty || isSaving}>
            {isSaving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </div>
    </div>
  );
};
