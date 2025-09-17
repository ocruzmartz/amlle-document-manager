import type { Book } from "./book";

declare module 'numero-a-letras';


declare global {
  interface Window {
    // Le decimos a TypeScript que el objeto 'window' puede tener
    // una propiedad opcional llamada 'booksStore' que es un array de 'Book'.
    booksStore?: Book[];
  }
}