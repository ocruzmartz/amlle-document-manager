// src/components/editor/FileImporter.tsx

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UploadCloud } from "lucide-react";
import mammoth from "mammoth";

interface FileImporterProps {
  onImport: (htmlContent: string) => void;
  acceptedFormats?: string;
}

export const FileImporter = ({
  onImport,
  acceptedFormats = ".docx",
}: FileImporterProps) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFileChange = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setError(null);

    // Lógica para archivos de Word (.docx)
    if (file.name.endsWith(".docx")) {
      try {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ arrayBuffer });
        console.log("HTML generado por Mammoth:", result.value);
        onImport(result.value); // 'result.value' contiene el HTML
      } catch (err) {
        console.error("Error al convertir el archivo de Word:", err);
        setError("No se pudo procesar el archivo .docx.");
      }
    } else {
      setError(
        `Formato de archivo no soportado. Por favor, sube un ${acceptedFormats}`
      );
    }

    setIsLoading(false);
    // Resetea el input para poder subir el mismo archivo de nuevo
    event.target.value = "";
  };

  return (
    <div>
      <label htmlFor="file-importer" className="cursor-pointer">
        <Button asChild variant="outline" className="w-auto">
          <div>
            <UploadCloud className="mr-2 h-4 w-4" />
            {isLoading ? "Procesando..." : "Importar desde .docx"}
          </div>
        </Button>
      </label>
      <input
        id="file-importer"
        type="file"
        className="hidden"
        accept={acceptedFormats}
        onChange={handleFileChange}
        disabled={isLoading}
      />
      {error && <p className="text-sm text-destructive mt-2">{error}</p>}
    </div>
  );
};
