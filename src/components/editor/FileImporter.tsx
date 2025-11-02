import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UploadCloud } from "lucide-react";
import mammoth from "mammoth";
import * as XLSX from "xlsx";

interface FileImporterProps {
  onImport: (htmlContent: string) => void;
  acceptedFormats?: string;
}

// ✅ Función mejorada para normalizar HTML preservando estructura
const normalizeHtml = (html: string): string => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");
  
  // 1. Normalizar tablas con estilos inline
  const tables = doc.querySelectorAll("table");
  tables.forEach((table) => {
    table.setAttribute("style", "width: 100%; border-collapse: collapse; border: 1px solid #ddd;");
    
    const cells = table.querySelectorAll("td, th");
    cells.forEach((cell) => {
      const htmlCell = cell as HTMLElement;
      const isHeader = cell.tagName === "TH";
      
      htmlCell.setAttribute(
        "style",
        `border: 1px solid #ddd; padding: 8px; vertical-align: top;${
          isHeader ? " font-weight: bold; background-color: #f8f9fa;" : ""
        }`
      );
      
      // NO modificar el contenido interno, preservar tal cual
    });
  });
  
  return doc.body.innerHTML;
};

// ✅ Función mejorada para convertir Excel preservando celdas combinadas
const excelToHtml = (worksheet: XLSX.WorkSheet): string => {
  const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");
  
  // ✅ Obtener información de celdas combinadas
  const merges = worksheet["!merges"] || [];
  
  // ✅ Crear un mapa para rastrear qué celdas están combinadas y cuáles omitir
  const mergeMap = new Map<string, { colspan: number; rowspan: number; skip: boolean }>();
  
  merges.forEach((merge) => {
    const startRow = merge.s.r;
    const startCol = merge.s.c;
    const endRow = merge.e.r;
    const endCol = merge.e.c;
    
    const colspan = endCol - startCol + 1;
    const rowspan = endRow - startRow + 1;
    
    // La celda inicial (top-left) tendrá colspan/rowspan
    const startAddress = XLSX.utils.encode_cell({ r: startRow, c: startCol });
    mergeMap.set(startAddress, { colspan, rowspan, skip: false });
    
    // Las demás celdas en el rango se marcan para omitir
    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        if (r === startRow && c === startCol) continue; // Skip la celda inicial
        const address = XLSX.utils.encode_cell({ r, c });
        mergeMap.set(address, { colspan: 1, rowspan: 1, skip: true });
      }
    }
  });
  
  let html = '<table style="width: 100%; border-collapse: collapse; border: 1px solid #ddd;">';
  
  for (let row = range.s.r; row <= range.e.r; row++) {
    html += "<tr>";
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
      const mergeInfo = mergeMap.get(cellAddress);
      
      // ✅ Omitir celdas que son parte de una combinación (excepto la inicial)
      if (mergeInfo?.skip) {
        continue;
      }
      
      const cell = worksheet[cellAddress];
      let cellValue = cell ? XLSX.utils.format_cell(cell) : "";
      
      // Preservar saltos de línea de Excel
      cellValue = cellValue.replace(/\n/g, '<br>');
      
      const tag = row === range.s.r ? "th" : "td";
      const style = row === range.s.r
        ? 'border: 1px solid #ddd; padding: 8px; vertical-align: top; font-weight: bold; background-color: #f8f9fa;'
        : 'border: 1px solid #ddd; padding: 8px; vertical-align: top;';
      
      // ✅ Agregar atributos colspan y rowspan si existen
      const colspan = mergeInfo?.colspan || 1;
      const rowspan = mergeInfo?.rowspan || 1;
      const colspanAttr = colspan > 1 ? ` colspan="${colspan}"` : '';
      const rowspanAttr = rowspan > 1 ? ` rowspan="${rowspan}"` : '';
      
      // Envolver en <p> solo si no está vacío
      const content = cellValue ? `<p>${cellValue}</p>` : "<p>&nbsp;</p>";
      html += `<${tag} style="${style}"${colspanAttr}${rowspanAttr}>${content}</${tag}>`;
    }
    html += "</tr>";
  }
  html += "</table>";
  
  console.log("HTML generado desde Excel:", html); // ✅ Debug
  return html;
};

export const FileImporter = ({
  onImport,
  acceptedFormats = ".docx, .xlsx, .xls",
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

    try {
      let rawHtml = "";
      
      if (file.name.endsWith(".docx")) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.convertToHtml({ 
          arrayBuffer,
        });
        rawHtml = result.value;
        
      } else if (file.name.endsWith(".xlsx") || file.name.endsWith(".xls")) {
        const data = await file.arrayBuffer();
        const workbook = XLSX.read(data);
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];
        rawHtml = excelToHtml(worksheet);
        
      } else {
        setError(`Formato de archivo no soportado. Por favor, sube un ${acceptedFormats}`);
        setIsLoading(false);
        return;
      }
      
      // ✅ Solo normalizar tablas, preservar todo lo demás
      const normalizedHtml = normalizeHtml(rawHtml);
      console.log("HTML normalizado:", normalizedHtml);
      onImport(normalizedHtml);
      
    } catch (err) {
      console.error("Error al procesar el archivo:", err);
      setError("No se pudo procesar el archivo. Verifica que sea un formato válido.");
    }

    setIsLoading(false);
    event.target.value = "";
  };

  return (
    <div className="float-right">
      <label htmlFor="file-importer" className="cursor-pointer">
        <Button asChild variant="outline" className="w-auto shadow-none">
          <div>
            <UploadCloud className="mr-2 h-4 w-4" />
            {isLoading ? "Procesando..." : "Importar archivo"}
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
