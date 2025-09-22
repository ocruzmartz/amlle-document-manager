// src/features/books/lib/book-service.ts

import { type Book, type Act } from "@/types";

import {
  allCouncilMembers,
  booksData as initialBooks,
  bookContentData as initialContent,
} from "./dummyData";
import { numberToWords } from "@/lib/textUtils";

declare global {
  interface Window {
    booksStore?: Book[];
    bookContentStore?: typeof initialContent;
  }
}

// --- Almacenes en Memoria (resistentes a HMR) ---
const getBooksStore = (): Book[] => {
  if (import.meta.env.DEV) {
    if (!window.booksStore) {
      window.booksStore = [...initialBooks];
    }
    return window.booksStore;
  }
  return [...initialBooks];
};

const setBooksStore = (books: Book[]) => {
  if (import.meta.env.DEV) {
    window.booksStore = books;
  }
};

const getContentStore = (): typeof initialContent => {
  if (import.meta.env.DEV) {
    if (!window.bookContentStore) {
      window.bookContentStore = { ...initialContent };
    }
    return window.bookContentStore;
  }
  return { ...initialContent };
};

const setContentStore = (content: typeof initialContent) => {
  if (import.meta.env.DEV) {
    window.bookContentStore = content;
  }
};

// --- Funciones Exportadas ---

export const getBooks = (): Book[] => {
  const books = getBooksStore();
  return [...books].sort(
    (a, b) =>
      new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
  );
};

export const getBookById = (id: string | undefined): Book | undefined => {
  if (!id) return undefined;
  const books = getBooksStore();
  const contentStore = getContentStore();

  const bookData = books.find((book) => book.id === id);
  if (!bookData) return undefined;

  // Unimos los datos del libro con su contenido de actas
  return {
    ...bookData,
    acts: contentStore[id]?.acts || [],
  };
};

export const createBook = (data: {
  name: string;
  creationDate: Date;
}): Book => {
  let books = getBooksStore();
  const newBook: Book = {
    id: crypto.randomUUID(),
    name: data.name,
    status: "BORRADOR",
    actaCount: 0,
    acuerdoCount: 0,
    pageCount: 1,
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    modifiedBy: "Usuario Actual",
    acts: [],
  };
  books = [newBook, ...books];
  setBooksStore(books);
  return newBook;
};

export const updateBookDetails = (
  bookId: string,
  updatedData: { name: string; creationDate: Date; tome?: number }
): Book | undefined => {
  const books = getBooksStore();
  const bookIndex = books.findIndex((b) => b.id === bookId);

  if (bookIndex === -1) {
    console.error("No se pudo actualizar: Libro no encontrado");
    return undefined;
  }

  const existingBook = books[bookIndex];
  const updatedBook = {
    ...existingBook,
    name: updatedData.name,
    createdAt: updatedData.creationDate.toISOString(),
    tome: updatedData.tome,
    lastModified: new Date().toISOString(),
    modifiedBy: "Usuario Actual (editado)",
  };
  books[bookIndex] = updatedBook;
  setBooksStore(books);
  return updatedBook;
};

export const getActasByBookId = (bookId: string | undefined): Act[] => {
  if (!bookId) return [];
  const contentStore = getContentStore();
  return contentStore[bookId]?.acts || [];
};

export const createActaInBook = (
  bookId: string | undefined,
  actaData?: { name?: string }
): Act | null => {
  if (!bookId) return null;

  const books = getBooksStore();
  const contentStore = getContentStore();

  const bookIndex = books.findIndex((b) => b.id === bookId);
  const book = books[bookIndex];

  if (!book) return null;

  const actNumber = (contentStore[bookId]?.acts.length || 0) + 1; // Corregido a 'acts'
  const actNumberInWords = numberToWords(actNumber);

  // --- 👇 INICIO DE CAMBIOS 👇 ---

  // ✅ 2. Lógica para obtener los asistentes por defecto
  const defaultAttendees = {
    sindico: allCouncilMembers.find((m) => m.role === "SINDICO") || null,
    propietarios: allCouncilMembers.filter((m) => m.role === "PROPIETARIO"),
    secretaria: allCouncilMembers.find((m) => m.role === "SECRETARIA") || null,
  };

  const newActa: Act = {
    id: crypto.randomUUID(),
    name: actaData?.name ?? `Acta número ${actNumberInWords}`,
    sessionDate: new Date().toISOString(),
    // ✅ 3. Usar los asistentes por defecto en la creación
    attendees: defaultAttendees,
    bodyContent: `<p><strong>Acta número ${actNumberInWords}</strong></p>`,
    agreements: [],
    actNumber: actNumber,
    sessionType: "ordinaria",
    sessionTime: "diez horas",
    sessionPoints: [],
  };

  // --- INICIO DE CAMBIOS ---

  // 1. Clonamos el contenido del libro para no mutarlo
  const newBookContent = contentStore[bookId]
    ? { ...contentStore[bookId], acts: [...contentStore[bookId].acts, newActa] }
    : { acts: [newActa] };

  // 2. Creamos un nuevo objeto para el contentStore
  const newContentStore = {
    ...contentStore,
    [bookId]: newBookContent,
  };
  setContentStore(newContentStore);

  // 3. Creamos un nuevo array de libros y actualizamos el libro modificado
  const updatedBooks = [...books];
  updatedBooks[bookIndex] = {
    ...book,
    actaCount: newBookContent.acts.length,
    lastModified: new Date().toISOString(),
  };
  setBooksStore(updatedBooks);

  // --- FIN DE CAMBIOS ---

  return newActa;
};
