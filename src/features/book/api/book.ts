// src/features/books/lib/book-service.ts

import { type Book, type Act, type Agreement } from "@/types";

import {
  allCouncilMembers,
  booksData as initialBooks,
  bookContentData as initialContent,
} from "@/features/book/data/mock";
import { numberToWords } from "@/lib/textUtils";
import { generateActHeaderHtml } from "@/features/act/lib/actHelpers"; // ✅ 1. Importar el nuevo ayudante

declare global {
  interface Window {
    booksStore?: Book[];
    bookContentStore?: typeof initialContent;
  }
}

// --- Almacenes en Memoria (sin cambios) ---
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

// --- Funciones Exportadas (solo createAct tiene cambios) ---

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

  return {
    ...bookData,
    acts: contentStore[id]?.acts || [],
  };
};

export const createBook = (data: {
  name: string;
  creationDate: Date; // Mantenemos creationDate aquí como el momento de la creación
}): Book => {
  let books = getBooksStore();
  const now = new Date().toISOString();
  const newBook: Book = {
    id: crypto.randomUUID(),
    name: data.name,
    status: "BORRADOR",
    actCount: 0,
    agreementCount: 0,
    pageCount: 1,
    createdAt: now, // Fecha real de creación
    authorizationDate: data.creationDate.toISOString(), // Fecha seleccionada como autorización inicial
    createdBy: "Usuario Actual",
    lastModified: now,
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

export const updateBook = (
  bookId: string,
  updatedData: Partial<Book>
): Book | undefined => {
  const books = getBooksStore();
  const contentStore = getContentStore();

  const bookIndex = books.findIndex((b) => b.id === bookId);
  if (bookIndex === -1) {
    console.error("No se pudo actualizar: Libro no encontrado");
    return undefined;
  }

  const existingBook = books[bookIndex];
  books[bookIndex] = {
    ...existingBook,
    ...updatedData,
    lastModified: new Date().toISOString(),
    modifiedBy: "Usuario Actual (editado)",
  };
  setBooksStore(books);

  if (updatedData.acts) {
    const newBookContent = {
      ...(contentStore[bookId] || {}),
      acts: updatedData.acts,
    };
    const newContentStore = {
      ...contentStore,
      [bookId]: newBookContent,
    };
    setContentStore(newContentStore);
  }

  return getBookById(bookId);
};

// ✅ 2. Lógica de `createAct` actualizada
// ✅ 2. Lógica de `createAct` actualizada
export const createAct = (
  bookId: string | undefined,
  actData?: { name?: string }
): Act | null => {
  if (!bookId) return null;

  const books = getBooksStore();
  const contentStore = getContentStore();
  const bookIndex = books.findIndex((b) => b.id === bookId);
  const book = books[bookIndex];
  if (!book) return null;

  const actNumber = (contentStore[bookId]?.acts.length || 0) + 1;
  const actNumberInWords = numberToWords(actNumber);
  const now = new Date().toISOString();
  const currentUser = "Usuario Actual";

  // Se mantiene el nombre por defecto
  const actName: string = actData?.name ?? `Acta número ${actNumberInWords}`;

  // ❌ Se eliminan 'defaultAttendees' y 'partialAct'

  const newAct: Act = {
    id: crypto.randomUUID(),
    bookId: book.id,
    bookName: book.name,
    agreements: [],
    sessionPoints: [],
    clarifyingNote: "",
    name: actName,
    actNumber,
    createdAt: now,
    createdBy: currentUser,
    lastModified: now,
    modifiedBy: currentUser,

    // --- ✅ CAMBIOS CLAVE: Iniciar el acta vacía ---
    
    // Dejamos la fecha actual como base para el calendario
    sessionDate: now, 
    
    // Todos los demás campos de sesión y contenido inician vacíos
    sessionType: undefined,
    sessionTime: undefined,
    attendees: undefined,
    bodyContent: "", // <-- ¡El cambio más importante!
  };

  // (El resto de la función para guardar el acta no cambia)
  const newBookContent = contentStore[bookId]
    ? { ...contentStore[bookId], acts: [...contentStore[bookId].acts, newAct] }
    : { acts: [newAct] };

  const newContentStore = { ...contentStore, [bookId]: newBookContent };
  setContentStore(newContentStore);

  const updatedBooks = [...books];
  updatedBooks[bookIndex] = {
    ...book,
    actCount: newBookContent.acts.length,
    lastModified: new Date().toISOString(),
  };
  setBooksStore(updatedBooks);

  return newAct;
};

export const getAllActs = (): Act[] => {
  const allActs = initialBooks.flatMap((book) => {
    const content = initialContent[book.id];
    if (!content || !content.acts) {
      return [];
    }
    return content.acts.map((act) => ({
      ...act,
      bookId: book.id,
      bookName: book.name,
    }));
  });

  return allActs.sort(
    (a, b) =>
      new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
  );
};

export const getAllAgreements = (): Agreement[] => {
  const allAgreements = initialBooks.flatMap((book) => {
    const content = initialContent[book.id];
    if (!content || !content.acts) {
      return [];
    }

    return content.acts.flatMap((act) => {
      if (!act.agreements || act.agreements.length === 0) {
        return [];
      }

      return act.agreements.map((agreement) => ({
        ...agreement,
        actId: act.id,
        actName: act.name,
        bookId: book.id,
        bookName: book.name,
      }));
    });
  });

  return allAgreements.sort(
    (a, b) =>
      new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
  );
};
