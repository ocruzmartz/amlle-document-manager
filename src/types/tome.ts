import type { Act } from "./act";
import type { Book } from "./book";
import type { User } from "./user";

export type BookStatus = "BORRADOR" | "FINALIZADO" | "ARCHIVADO";

export type Tome = {
  id: string;
  name: string | null;
  number: number;
  bookName?: string | null;
  createdByName?: string | null;
  minutesIds?: string[] | null;
  pageCount: number;
  status: BookStatus;
  book: Book;
  tomeNumber: number;
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
    fontSize: number;
    enablePageNumbering?: boolean;
    pageNumberingOffset?: number;
    pageNumberingPosition?: "left" | "center" | "right";
    pageNumberingFormat?: "simple" | "dash" | "page" | "pageTotal";
  } | null;
  authorizationDate: string | null;
  closingDate: string | null;
  createdBy: User;
  createdAt: string;
  updatedAt: string;
  modificationName?: string | null;
  modificationDate?: string | null;
  modificationIds?: string | null;

  modifiedBy?: User | null;
  acts?: Act[];
  actCount?: number;
  agreementCount?: number;
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
