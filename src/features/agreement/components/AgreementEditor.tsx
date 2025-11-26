import { useState, useEffect, useCallback, useMemo } from "react";
import { type Agreement } from "@/types";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/editor/RichTextEditor";
import {
  numberToWords,
  capitalize,
  removeEmptyParagraphsAtStart,
} from "@/lib/textUtils";
import { FileImporter } from "@/components/editor/FileImporter";
import { useSaveAction } from "@/hooks/useSaveAction";
import { transformTableHtml } from "@/components/editor/utils/transformTableHtml";

type SaveHandler = () => Promise<boolean>;

interface AgreementEditorProps {
  agreement: Agreement;
  agreementNumber: number;
  onUpdate: (updatedAgreement: Agreement) => void;
  onBack: () => void;
  onStateChange: (state: { dirty: boolean; saving: boolean }) => void;
  isReadOnly?: boolean;
  onRegisterSaveHandler: (handler: SaveHandler | null) => void;
}

export const AgreementEditor = ({
  agreement,
  agreementNumber,
  onUpdate,
  onBack,
  onStateChange,
  isReadOnly = false,
  onRegisterSaveHandler,
}: AgreementEditorProps) => {
  const [localContent, setLocalContent] = useState(() =>
    removeEmptyParagraphsAtStart(agreement.content)
  );

  const currentCombinedData = useMemo(
    () => ({
      ...agreement,
      content: localContent,
    }),
    [agreement, localContent]
  );

  const onSaveCallback = useCallback(
    async (dataToSave: Agreement) => {
      onUpdate(dataToSave);
    },
    [onUpdate]
  );

  const { handleSave, isDirty, isSaving } = useSaveAction<Agreement>({
    initialData: agreement,
    currentData: currentCombinedData,
    onSave: onSaveCallback,
    onStateChange: onStateChange,
    loadingMessage: "Guardando acuerdo...",
    successMessage: "Acuerdo guardado exitosamente.",
    errorMessage: "Error al guardar el acuerdo.",
  });

  useEffect(() => {
    if (handleSave) {
      onRegisterSaveHandler(handleSave);
    }
  }, [handleSave, onRegisterSaveHandler]);

  useEffect(() => {
    setLocalContent(removeEmptyParagraphsAtStart(agreement.content));
  }, [agreement.content]);

  const handleContentChange = useCallback((newContent: string) => {
    setLocalContent(newContent);
  }, []);

  const handleImportedContent = (importedHtml: string) => {
    const transformedHtml = transformTableHtml(importedHtml);
    const cleanedImport = removeEmptyParagraphsAtStart(transformedHtml);

    if (
      localContent &&
      localContent !== "<p></p>" &&
      localContent.trim() !== ""
    ) {
      const newContent = `${localContent}${cleanedImport}`;
      handleContentChange(newContent);
    } else {
      handleContentChange(cleanedImport);
    }
  };

  const agreementNumberInWords = capitalize(numberToWords(agreementNumber));

  return (
    <div className="h-full flex flex-col overflow-hidden">
      <div className="shrink-0 p-4 border-b">
        <h3 className="text-xl font-bold">
          Acuerdo número {agreementNumberInWords}
        </h3>
      </div>
      <div className="m-4">
        <FileImporter onImport={handleImportedContent} disabled={isReadOnly} />
      </div>
      <div className="flex-1 min-h-0">
        <RichTextEditor
          content={localContent}
          onChange={handleContentChange}
          isReadOnly={isReadOnly}
        />
      </div>
      <div className="shrink-0 p-4 border-t bg-white">
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={onBack}
            disabled={isReadOnly}
          >
            Volver
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isDirty || isSaving || isReadOnly}
          >
            {isSaving ? "Guardando..." : "Guardar Cambios"}
          </Button>
        </div>
      </div>
    </div>
  );
};
