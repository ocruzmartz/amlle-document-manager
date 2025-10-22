import type { Book } from "./book";

declare global {
  interface Window {
    booksStore?: Book[];
  }
}
