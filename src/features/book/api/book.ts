// src/features/books/lib/book-service.ts

import { type Book, type Act, type Agreement } from "@/types";

import {
  allCouncilMembers,
  bookContentData,
  booksData,
  booksData as initialBooks,
  bookContentData as initialContent,
} from "@/features/book/data/mock";
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
    actCount: 0,
    agreementCount: 0,
    pageCount: 1,
    createdAt: new Date().toISOString(),
    createdBy: "Usuario Actual",
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

  // Actualizar metadatos del libro (ej. fecha de modificación)
  const existingBook = books[bookIndex];
  books[bookIndex] = {
    ...existingBook,
    ...updatedData,
    lastModified: new Date().toISOString(),
    modifiedBy: "Usuario Actual (editado)",
  };
  setBooksStore(books);

  // Guardar el contenido (actas y acuerdos) si se proporcionó
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

  const defaultAttendees = {
    syndic: allCouncilMembers.find((m) => m.role === "SYNDIC") || null,
    owners: allCouncilMembers.filter((m) => m.role === "OWNER"),
    secretary: allCouncilMembers.find((m) => m.role === "SECRETARY") || null,
  };

  const now = new Date().toISOString();
  const currentUser = "Usuario Actual"; // Esto será dinámico con un sistema de login

  const newAct: Act = {
    id: crypto.randomUUID(),
    name: actData?.name ?? `Acta número ${actNumberInWords}`,
    bookId: book.id,
    bookName: book.name,
    sessionDate: now,
    attendees: defaultAttendees,
    bodyContent: "",
    agreements: [],
    actNumber: actNumber,
    sessionType: "Ordinary",
    sessionTime: "diez horas",
    sessionPoints: [],

    // ✅ INICIALIZANDO CAMPOS DE RASTREO
    createdAt: now,
    createdBy: currentUser,
    lastModified: now,
    modifiedBy: currentUser,
  };

  // --- INICIO DE CAMBIOS ---

  // 1. Clonamos el contenido del libro para no mutarlo
  const newBookContent = contentStore[bookId]
    ? { ...contentStore[bookId], acts: [...contentStore[bookId].acts, newAct] }
    : { acts: [newAct] };

  const newContentStore = {
    ...contentStore,
    [bookId]: newBookContent,
  };
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
  const allActs = booksData.flatMap((book) => {
    const content = bookContentData[book.id];
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
  const allAgreements = booksData.flatMap((book) => {
    const content = bookContentData[book.id];
    if (!content || !content.acts) {
      return []; // Si el libro no tiene actas, no puede tener acuerdos.
    }

    // Ahora, para cada acta, extraemos sus acuerdos
    return content.acts.flatMap((act) => {
      if (!act.agreements || act.agreements.length === 0) {
        return [];
      }

      // Para cada acuerdo, crea un nuevo objeto que incluye los datos del acta y el libro.
      return act.agreements.map((agreement) => ({
        ...agreement,
        actId: act.id,
        actName: act.name,
        bookId: book.id,
        bookName: book.name,
      }));
    });
  });

  // Ordenar por fecha de modificación más reciente
  return allAgreements.sort(
    (a, b) =>
      new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
  );
};
