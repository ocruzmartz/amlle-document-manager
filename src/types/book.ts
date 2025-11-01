import type { Tome, RecentTome, BookStatus } from "./tome";

export type { BookStatus, RecentTome };

export type Book = {
  id: string;
  name: string;
  tomos?: Tome[];
  createdAt: string;
  createdBy: string;
  lastModified: string;
  modifiedBy: string;
};

export type RecentBook = RecentTome;
