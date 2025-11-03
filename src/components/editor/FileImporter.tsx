import { useState } from "react";
import { Button } from "@/components/ui/button";
import { UploadCloud } from "lucide-react";
import mammoth from "mammoth";
import * as XLSX from "xlsx";

interface FileImporterProps {
  onImport: (htmlContent: string) => void;
  acceptedFormats?: string;
  disabled?: boolean;
}

// ✅ Función mejorada para convertir Excel preservando celdas combinadas Y anchos de columna
const excelToHtml = (worksheet: XLSX.WorkSheet): string => {
  const range = XLSX.utils.decode_range(worksheet["!ref"] || "A1");

  // ✅ Obtener anchos de columna
  const cols = worksheet["!cols"] || [];

  // Calcular el ancho total en píxeles
  let totalWidth = 0;
  const colWidths: number[] = [];

  for (let col = range.s.c; col <= range.e.c; col++) {
    const colInfo = cols[col];
    const width = colInfo?.wpx || 64; // Ancho por defecto si no existe
    colWidths.push(width);
    totalWidth += width;
  }

  // ✅ Obtener información de celdas combinadas
  const merges = worksheet["!merges"] || [];

  // ✅ Crear un mapa para rastrear qué celdas están combinadas y cuáles omitir
  const mergeMap = new Map<
    string,
    { colspan: number; rowspan: number; skip: boolean }
  >();

  merges.forEach((merge) => {
    const startRow = merge.s.r;
    const startCol = merge.s.c;
    const endRow = merge.e.r;
    const endCol = merge.e.c;

    const colspan = endCol - startCol + 1;
    const rowspan = endRow - startRow + 1;

    const startAddress = XLSX.utils.encode_cell({ r: startRow, c: startCol });
    mergeMap.set(startAddress, { colspan, rowspan, skip: false });

    for (let r = startRow; r <= endRow; r++) {
      for (let c = startCol; c <= endCol; c++) {
        if (r === startRow && c === startCol) continue;
        const address = XLSX.utils.encode_cell({ r, c });
        mergeMap.set(address, { colspan: 1, rowspan: 1, skip: true });
      }
    }
  });

  let html = '<table style="border-collapse: collapse;">';

  // ✅ Agregar colgroup con anchos en porcentaje
  html += "<colgroup>";
  colWidths.forEach((width) => {
    const widthPercent = ((width / totalWidth) * 100).toFixed(2);
    html += `<col style="width: ${widthPercent}%;">`;
  });
  html += "</colgroup>";

  for (let row = range.s.r; row <= range.e.r; row++) {
    html += "<tr>";
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellAddress = XLSX.utils.encode_cell({ r: row, c: col });
      const mergeInfo = mergeMap.get(cellAddress);

      if (mergeInfo?.skip) {
        continue;
      }

      const cell = worksheet[cellAddress];
      let cellValue = cell ? XLSX.utils.format_cell(cell) : "";

      cellValue = cellValue.replace(/\n/g, "<br>");

      const tag = row === range.s.r ? "th" : "td";

      // ✅ Calcular ancho de esta celda (sumando si hay colspan)
      const colspan = mergeInfo?.colspan || 1;
      const rowspan = mergeInfo?.rowspan || 1;

      let cellWidthPercent = 0;
      for (let i = col; i < col + colspan; i++) {
        cellWidthPercent += (colWidths[i] / totalWidth) * 100;
      }

      // ✅ Estilos sin bordes (se manejan en PdfTable)
      const baseStyle =
        row === range.s.r
          ? "padding: 8px; vertical-align: top; font-weight: bold; background-color: #f8f9fa;"
          : "padding: 8px; vertical-align: top;";

      const style = `${baseStyle} width: ${cellWidthPercent.toFixed(2)}%;`;

      const colspanAttr = colspan > 1 ? ` colspan="${colspan}"` : "";
      const rowspanAttr = rowspan > 1 ? ` rowspan="${rowspan}"` : "";

      const content = cellValue ? `<p>${cellValue}</p>` : "<p>&nbsp;</p>";
      html += `<${tag} style="${style}"${colspanAttr}${rowspanAttr}>${content}</${tag}>`;
    }
    html += "</tr>";
  }
  html += "</table>";

  console.log("HTML generado desde Excel:", html);
  return html;
};

// ✅ Función mejorada para normalizar HTML preservando estructura Y anchos
const normalizeHtml = (html: string): string => {
  const parser = new DOMParser();
  const doc = parser.parseFromString(html, "text/html");

  // 1. Normalizar tablas preservando anchos
  const tables = doc.querySelectorAll("table");
  tables.forEach((table) => {
    // Solo agregar border-collapse, NO sobrescribir width
    const currentStyle = table.getAttribute("style") || "";
    if (!currentStyle.includes("border-collapse")) {
      table.setAttribute("style", currentStyle + " border-collapse: collapse;");
    }

    const cells = table.querySelectorAll("td, th");
    cells.forEach((cell) => {
      const htmlCell = cell as HTMLElement;
      const isHeader = cell.tagName === "TH";

      // Preservar width si existe
      const currentCellStyle = htmlCell.getAttribute("style") || "";
      const hasWidth = /width\s*:/i.test(currentCellStyle);

      let newStyle = "padding: 8px; vertical-align: top;";
      if (isHeader) {
        newStyle += " font-weight: bold; background-color: #f8f9fa;";
      }

      // Combinar estilos preservando width
      if (hasWidth) {
        const widthMatch = currentCellStyle.match(/width\s*:\s*([^;]+)/i);
        if (widthMatch) {
          newStyle += ` width: ${widthMatch[1]};`;
        }
      }

      htmlCell.setAttribute("style", newStyle);
    });
  });

  return doc.body.innerHTML;
};

export const FileImporter = ({
  onImport,
  acceptedFormats = ".docx, .xlsx, .xls",
  disabled = false,
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
        setError(
          `Formato de archivo no soportado. Por favor, sube un ${acceptedFormats}`
        );
        setIsLoading(false);
        return;
      }

      // ✅ Solo normalizar tablas, preservar todo lo demás
      const normalizedHtml = normalizeHtml(rawHtml);
      console.log("HTML normalizado:", normalizedHtml);
      onImport(normalizedHtml);
    } catch (err) {
      console.error("Error al procesar el archivo:", err);
      setError(
        "No se pudo procesar el archivo. Verifica que sea un formato válido."
      );
    }

    setIsLoading(false);
    event.target.value = "";
  };

  return (
    <div className="float-right">
      <label htmlFor="file-importer" className="cursor-pointer">
        <Button
          asChild
          variant="outline"
          className="w-auto shadow-none"
          disabled={disabled}
        >
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
