import type { Act } from "./act";

export type BookStatus = "BORRADOR" | "PENDIENTE" | "FINALIZADO" | "ARCHIVADO";

export type Tome = {
  id: string;
  bookId: string;
  name: string;
  bookName: string;
  tomeNumber: number;
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
    enablePageNumbering?: boolean;
    pageNumberingOffset?: number;
    pageNumberingPosition?: "left" | "center" | "right";
    pageNumberingFormat?: "simple" | "dash" | "page" | "pageTotal";
  };
  authorizationDate?: string;
  closingDate?: string;
  createdAt: string;
  createdBy: string;
  lastModified: string;
  modifiedBy: string;
};

export type RecentTome = {
  id: string;
  name: string;
  bookName: string;
  status: BookStatus;
  lastModified: string;
  url: string;
  modifiedBy: string;
};
