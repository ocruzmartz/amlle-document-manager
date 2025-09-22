// src/features/agreements/components/AgreementWorkspace.tsx

import { useState, useEffect, useRef } from "react";
import { type Agreement } from "@/types";
import { Button } from "@/components/ui/button";
import { RichTextEditor } from "@/components/editor/RichTextEditor";
import { numberToWords, capitalize } from "@/lib/textUtils";

interface AgreementWorkspaceProps {
  agreement: Agreement;
  agreementNumber: number;
  onUpdate: (updatedAgreement: Agreement) => void;
  onBack: () => void;
}

export const AgreementWorkspace = ({
  agreement,
  agreementNumber,
  onUpdate,
  onBack,
}: AgreementWorkspaceProps) => {
  const [localContent, setLocalContent] = useState(agreement.content);
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

  const agreementNumberInWords = capitalize(numberToWords(agreementNumber));

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b">
        <h3 className="text-xl font-bold">
          Acuerdo número {agreementNumberInWords}
        </h3>
        <p className="text-sm text-muted-foreground">
          Edita el contenido del acuerdo. Los cambios se guardan automáticamente.
        </p>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-y-auto p-4">
        <RichTextEditor
          content={localContent}
          onChange={handleContentChange}
        />
      </div>

      {/* Footer */}
      <div className="flex-shrink-0 p-4 border-t bg-white">
        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={onBack}>
            Volver a la lista
          </Button>
        </div>
      </div>
    </div>
  );
};