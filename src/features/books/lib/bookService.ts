// src/features/books/lib/book-service.ts

import { type Book, type Act } from "@/types";

import { booksData as initialBooks, bookContentData as initialContent } from "./dummyData";

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
    actas: contentStore[id]?.actas || [],
  };
};

export const createBook = (data: {
  name: string;
  creationDate: Date;
}): Book => {
  let books = getBooksStore();
  const newBook: Book = {
    id: crypto.randomUUID(), // ✅ Ya está usando crypto
    name: data.name,
    status: "BORRADOR",
    actaCount: 0,
    acuerdoCount: 0,
    pageCount: 1,
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString(),
    modifiedBy: "Usuario Actual",
    actas: [],
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
  return contentStore[bookId]?.actas || [];
};

// Helper function para convertir números a palabras
const numberToWords = (num: number): string => {
  const numbers = [
    "", "Uno", "Dos", "Tres", "Cuatro", "Cinco", "Seis", "Siete", "Ocho", "Nueve", "Diez",
    "Once", "Doce", "Trece", "Catorce", "Quince", "Dieciséis", "Diecisiete", "Dieciocho", "Diecinueve", "Veinte",
    "Veintiuno", "Veintidós", "Veintitrés", "Veinticuatro", "Veinticinco", "Veintiséis", "Veintisiete", "Veintiocho", "Veintinueve", "Treinta"
  ];
  
  if (num <= 30) {
    return numbers[num];
  }
  
  // Para números mayores a 30, usar formato simple
  return num.toString();
};

export const createActaInBook = (
  bookId: string | undefined,
  actaData?: { name?: string } // ✅ Hacer opcional el name
): Act | null => {
  if (!bookId) return null;

  const book = getBookById(bookId);
  if (!book) return null;

  const actNumber = (book.actas?.length || 0) + 1;
  const actNumberInWords = numberToWords(actNumber);

  const newActa: Act = {
    id: crypto.randomUUID(),
    name: actaData?.name ?? `Acta número ${actNumberInWords}`, // Usa actaData.name si está presente
    sessionDate: new Date().toISOString(),
    attendees: {
      sindico: null,
      propietarios: [],
      secretaria: null,
    },
    bodyContent: "",
    agreements: [],
    // Propiedades adicionales
    actNumber: actNumber,
    sessionType: "ordinaria",
    sessionTime: "diez horas",
    sessionPoints: [],
  };

  // Actualizar el store de contenido correctamente
  const contentStore = getContentStore();
  
  if (!contentStore[bookId]) {
    contentStore[bookId] = { actas: [] };
  }
  
  contentStore[bookId].actas.push(newActa);
  setContentStore(contentStore);

  // También actualizar el store de libros para el conteo
  const books = getBooksStore();
  const bookIndex = books.findIndex(b => b.id === bookId);
  if (bookIndex !== -1) {
    books[bookIndex] = {
      ...books[bookIndex],
      actaCount: contentStore[bookId].actas.length,
      lastModified: new Date().toISOString(),
    };
    setBooksStore(books);
  }

  return newActa;
};

