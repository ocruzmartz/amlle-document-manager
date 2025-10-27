// src/features/agreements/components/AgreementWorkspace.tsx

import { useState, useEffect, useRef } from "react";
import { type Agreement } from "@/types";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/editor/RichTextEditor";
import { numberToWords, capitalize } from "@/lib/textUtils";
import { FileImporter } from "@/components/editor/FileImporter";
import { Check, Save } from "lucide-react";

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
  const [isDirty, setIsDirty] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved">(
    "idle"
  );

  const debounceTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    setLocalContent(agreement.content);
  }, [agreement.content]);

  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  const handleContentChange = (newContent: string) => {
    // 1. Actualiza la UI del editor al instante
    setLocalContent(newContent);

    if (!isDirty) {
      setIsDirty(true);
      setHasUnsavedChanges(true);
    }

    // 2. Limpia el temporizador anterior para reiniciar la espera
    if (debounceTimeoutRef.current) {
      clearTimeout(debounceTimeoutRef.current);
    }

    // 3. Envía la actualización al padre después de una breve pausa
    debounceTimeoutRef.current = setTimeout(() => {
      const updatedAgreement = {
        ...agreement,
        content: newContent,
      };
      onUpdate(updatedAgreement);
    }, 500); // Espera 500ms después de la última pulsación
  };

  const handleImportedContent = (importedHtml: string) => {
    // Reemplaza el contenido actual del editor con el HTML importado
    const newContent = `${localContent} ${importedHtml}`;
    handleContentChange(newContent);
  };

  const handleSave = () => {
    setSaveStatus("saving");
    const updatedAgreement = { ...agreement, content: localContent };
    onUpdate(updatedAgreement);

    setTimeout(() => {
      setSaveStatus("saved");
      setIsDirty(false);
      setHasUnsavedChanges(false); // ✅ Notifica al padre que los cambios se guardaron
      setTimeout(() => setSaveStatus("idle"), 2000);
    }, 1000);
  };

  const agreementNumberInWords = capitalize(numberToWords(agreementNumber));

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="shrink-0 p-4 border-b">
        <h3 className="text-xl font-bold">
          Acuerdo número {agreementNumberInWords}
        </h3>
      </div>

      <div className="m-4">
        <FileImporter onImport={handleImportedContent} />
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto overflow-hidden">
        <RichTextEditor content={localContent} onChange={handleContentChange} />
      </div>

      {/* Footer */}
      <div className="shrink-0 p-4 border-t bg-white">
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onBack}>
            Volver
          </Button>
          <Button
            onClick={handleSave}
            disabled={!isDirty || saveStatus !== "idle"}
          >
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
    </div>
  );
};
