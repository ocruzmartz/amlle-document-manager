import type { Act } from "./act";

export type BookStatus = "BORRADOR" | "PENDIENTE" | "FINALIZADO" | "ARCHIVADO";

export type Book = {
  id: string;
  name: string;
  tome?: number;
  status: BookStatus;
  agreementCount: number;
  pageCount: number;
  acts?: Act[];
  actCount: number;
  pdfSettings?: {
    pageSize: "A4" | "LETTER";
    orientation: "portrait" | "landscape";
    margins: {
      top: number;
      bottom: number;
      left: number;
      right: number;
    };
    lineHeight: number;
    fontSize?: number;
  };
  createdAt: string;
  createdBy: string;
  lastModified: string;
  modifiedBy: string;
};

export type RecentBook = {
  id: string;
  name: string;
  status: BookStatus;
  lastModified: string;
  url: string;
  modifiedBy: string;
};
