import { pdf } from "@react-pdf/renderer";
import React from "react";
import type { DocumentProps } from "@react-pdf/renderer";

export const calculatePdfPageCount = async (
  docElement: React.ReactElement<DocumentProps>
): Promise<number> => {
  try {
    const blob = await pdf(docElement).toBlob();
    const text = await blob.text();
    const pageCount = (text.match(/\/Type\s*\/Page\b/g) || []).length;
    return pageCount || 1;
  } catch (error) {
    console.error("Error calculando páginas del PDF:", error);
    return 1;
  }
};
