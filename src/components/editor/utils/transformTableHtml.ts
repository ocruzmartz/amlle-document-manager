import { elevateCellInlineStyles } from "./elevateCellInLineStyles";
import { removeWordEndOfCellMarkers } from "./removeWordEndOfCellMarkers";

export function transformTableHtml(html: string): string {
  let cleaned = html;

  cleaned = cleaned.replace(/<\/?\\w+:[^>]*>/g, "");
  cleaned = cleaned.replace(/<o:p>.*?<\/o:p>/g, "");

  try {
    cleaned = elevateCellInlineStyles(cleaned);

    const tempDiv = document.createElement("div");
    tempDiv.innerHTML = cleaned;
    const firstCell = tempDiv.querySelector("td, th");
    if (firstCell) {
      console.log(
        "DESPUÉS DE ELEVATE - width attr:",
        firstCell.getAttribute("width")
      );
      console.log(
        "DESPUÉS DE ELEVATE - celda:",
        firstCell.outerHTML.substring(0, 200)
      );
    }
  } catch (err) {
    console.warn("elevateCellInlineStyles falló:", err);
  }
  try {
    cleaned = removeWordEndOfCellMarkers(cleaned);
  } catch (err) {
    console.warn("removeWordEndOfCellMarkers falló:", err);
  }
  cleaned = cleaned.replace(/^(<p><\/p>|<p>\s*<\/p>)+/, "");

  return cleaned;
}
