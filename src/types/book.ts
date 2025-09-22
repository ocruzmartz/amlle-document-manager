import type { Act } from "./act";

export type BookStatus = "BORRADOR" | "PENDIENTE" | "FINALIZADO" | "ARCHIVADO";

export type Book = {
  id: string;
  name: string;
  tome?: number;
  status: BookStatus;
  actaCount: number;
  acuerdoCount: number;
  pageCount: number;
  acts?: Act[];
  bookId?: string;
  createdAt: string;
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
