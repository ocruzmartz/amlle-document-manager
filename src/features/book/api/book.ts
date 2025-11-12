import { type Book, type Tome, type Act, type Agreement } from "@/types";

import {
  booksData as initialBooks,
  tomesData as initialTomes, // <-- NUEVO: Usar tomesData
  bookContentData as initialContent,
} from "@/features/book/data/mock";
import { numberToRoman, numberToWords } from "@/lib/textUtils";

declare global {
  interface Window {
    booksStore?: Book[];
    tomesStore?: Tome[]; // <-- NUEVO: Almacén para Tomos
    bookContentStore?: typeof initialContent;
  }
}

// --- Almacenes en Memoria (Actualizados) ---
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
  if (import.meta.env.DEV) window.booksStore = books;
};

// Nuevo almacén para Tomos
const getTomesStore = (): Tome[] => {
  if (import.meta.env.DEV) {
    if (!window.tomesStore) {
      window.tomesStore = [...initialTomes];
    }
    return window.tomesStore;
  }
  return [...initialTomes];
};
const setTomesStore = (tomes: Tome[]) => {
  if (import.meta.env.DEV) window.tomesStore = tomes;
};

// Almacén de contenido (sin cambios, ya que usa ID)
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
  if (import.meta.env.DEV) window.bookContentStore = content;
};

export const getBooks = (): Book[] => {
  const books = getBooksStore();
  return [...books].sort(
    (a, b) =>
      new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
  );
};

export const getTomes = (): Tome[] => {
  const tomes = getTomesStore();
  const books = getBooksStore();

  const tomesWithBookNames = tomes.map((tome) => {
    const parentBook = books.find((b) => b.id === tome.bookId);
    return {
      ...tome,
      bookName: parentBook ? parentBook.name : "Libro Desconocido",
    };
  });

  return [...tomesWithBookNames].sort(
    (a, b) =>
      new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
  );
};

export const getBookById = (id: string | undefined): Book | undefined => {
  if (!id) return undefined;
  const books = getBooksStore();
  const tomes = getTomesStore();

  const bookData = books.find((book) => book.id === id);
  if (!bookData) return undefined;

  // Poblar los tomos del libro
  bookData.tomos = tomes.filter((tome) => tome.bookId === id);
  return bookData;
};

export const getTomeById = (id: string | undefined): Tome | undefined => {
  if (!id) return undefined;
  const tomes = getTomesStore();
  const contentStore = getContentStore();

  const tomeData = tomes.find((tome) => tome.id === id);
  if (!tomeData) return undefined;

  return {
    ...tomeData,
    acts: contentStore[id]?.acts || [],
  };
};

export const createBook = (data: { name: string }): Tome => {
  let books = getBooksStore();
  const now = new Date().toISOString();
  const newBook: Book = {
    id: crypto.randomUUID(),
    name: data.name,
    createdAt: now,
    createdBy: "Usuario Actual",
    lastModified: now,
    modifiedBy: "Usuario Actual",
    tomos: [],
  };
  books = [newBook, ...books];
  setBooksStore(books);

  const newTome = createTome(newBook.id, {
    tomeNumber: 1,
  });

  return newTome;
};

export const createTome = (
  bookId: string,
  data: { name?: string; tomeNumber: number }
): Tome => {
  let tomes = getTomesStore();
  const books = getBooksStore();
  const parentBook = books.find((b) => b.id === bookId);
  if (!parentBook) throw new Error("Libro padre no encontrado");

  const now = new Date().toISOString();
  const romanNumeral = numberToRoman(data.tomeNumber);

  const newTome: Tome = {
    id: crypto.randomUUID(),
    book: Book.bookId,
    name: data.name || `Tomo ${romanNumeral}`,
    number: data.tomeNumber,
    status: "BORRADOR",
    actCount: 0,
    agreementCount: 0,
    pageCount: 1,
    createdAt: now,
    authorizationDate: now,
    updatedAt: "Usuario Actual",
    modifiedBy: "Usuario Actual",
    acts: [],
  };
  tomes = [newTome, ...tomes];
  setTomesStore(tomes);
  return newTome;
};

export const updateBook = (
  bookId: string,
  updatedData: Partial<Book>
): Book | undefined => {
  const books = getBooksStore();
  const bookIndex = books.findIndex((b) => b.id === bookId);

  if (bookIndex === -1) {
    console.error("No se pudo actualizar: Libro no encontrado");
    return undefined;
  }

  const existingBook = books[bookIndex];
  const newName = updatedData.name || existingBook.name;

  books[bookIndex] = {
    ...existingBook,
    ...updatedData, // Aplicar los cambios (ej. nuevo 'name')
    name: newName,
    lastModified: new Date().toISOString(),
    modifiedBy: "Usuario Actual (editado)",
  };
  setBooksStore(books);

  // También actualizamos el 'bookName' en todos los tomos hijos
  let tomes = getTomesStore();
  tomes = tomes.map((tome) =>
    tome.bookId === bookId ? { ...tome, bookName: newName } : tome
  );
  setTomesStore(tomes);

  console.log(
    "Libro padre actualizado y tomos sincronizados:",
    books[bookIndex]
  );
  return books[bookIndex];
};

export const updateTome = (
  tomeId: string,
  updatedData: Partial<Tome>
): Tome | undefined => {
  const tomes = getTomesStore();
  const contentStore = getContentStore();

  const tomeIndex = tomes.findIndex((t) => t.id === tomeId);
  if (tomeIndex === -1) {
    console.error("No se pudo actualizar: Tomo no encontrado");
    return undefined;
  }

  const existingTome = tomes[tomeIndex];
  tomes[tomeIndex] = {
    ...existingTome,
    ...updatedData,
    lastModified: new Date().toISOString(),
    modifiedBy: "Usuario Actual (editado)",
  };
  setTomesStore(tomes);

  if (updatedData.acts) {
    const newTomeContent = {
      ...(contentStore[tomeId] || {}),
      acts: updatedData.acts,
    };
    const newContentStore = {
      ...contentStore,
      [tomeId]: newTomeContent,
    };
    setContentStore(newContentStore);
  }

  return getTomeById(tomeId);
};

export const deleteTome = (tomeId: string): boolean => {
  const tomes = getTomesStore();
  const content = getContentStore();

  const tomeIndex = tomes.findIndex((t) => t.id === tomeId);
  if (tomeIndex === -1) {
    console.error("No se pudo eliminar: Tomo no encontrado");
    return false;
  }

  // Eliminar el tomo de la lista
  tomes.splice(tomeIndex, 1);
  setTomesStore(tomes);

  // Eliminar el contenido (actas) asociado
  if (content[tomeId]) {
    delete content[tomeId];
    setContentStore(content);
  }

  console.log("Tomo eliminado:", tomeId);
  return true;
};

export const getActasByTomeId = (tomeId: string | undefined): Act[] => {
  if (!tomeId) return [];
  const contentStore = getContentStore();
  return contentStore[tomeId]?.acts || [];
};

/**
 * Crea una nueva Acta dentro de un Tomo.
 */
export const createAct = (
  tomeId: string | undefined,
  actData?: { name?: string }
): Act | null => {
  if (!tomeId) return null;

  const tomes = getTomesStore();
  const contentStore = getContentStore();
  const tomeIndex = tomes.findIndex((t) => t.id === tomeId);
  const tome = tomes[tomeIndex];
  if (!tome) return null;

  const actNumber = (contentStore[tomeId]?.acts.length || 0) + 1;
  const actNumberInWords = numberToWords(actNumber);
  const now = new Date().toISOString();
  const currentUser = "Usuario Actual";

  const actName: string = actData?.name ?? `Acta número ${actNumberInWords}`;

  const newAct: Act = {
    id: crypto.randomUUID(),
    tomeId: tome.id, // <-- CAMBIADO
    tomeName: tome.name, // <-- CAMBIADO
    agreements: [],
    sessionPoints: [],
    clarifyingNote: "",
    name: actName,
    actNumber,
    createdAt: now,
    createdBy: currentUser,
    lastModified: now,
    modifiedBy: currentUser,
    sessionDate: now,
    sessionType: undefined,
    sessionTime: undefined,
    attendees: undefined,
    bodyContent: "",
  };

  const newTomeContent = contentStore[tomeId]
    ? { ...contentStore[tomeId], acts: [...contentStore[tomeId].acts, newAct] }
    : { acts: [newAct] };

  const newContentStore = { ...contentStore, [tomeId]: newTomeContent };
  setContentStore(newContentStore);

  // Actualizar el contador de actas en el Tomo
  const updatedTomes = [...tomes];
  updatedTomes[tomeIndex] = {
    ...tome,
    actCount: newTomeContent.acts.length,
    lastModified: new Date().toISOString(),
  };
  setTomesStore(updatedTomes);

  return newAct;
};

/**
 * Obtiene TODAS las actas de TODOS los tomos.
 */
export const getAllActs = (): Act[] => {
  const allTomes = getTomesStore();
  const allActs = allTomes.flatMap((tome) => {
    const content = initialContent[tome.id];
    if (!content || !content.acts) {
      return [];
    }
    return content.acts.map((act) => ({
      ...act,
      tomeId: tome.id,
      tomeName: tome.name,
    }));
  });

  return allActs.sort(
    (a, b) =>
      new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
  );
};

/**
 * Obtiene TODOS los acuerdos de TODAS las actas.
 */
export const getAllAgreements = (): Agreement[] => {
  const allTomes = getTomesStore();
  const allAgreements = allTomes.flatMap((tome) => {
    const content = initialContent[tome.id];
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
        tomeId: tome.id,
        tomeName: tome.name,
      }));
    });
  });

  return allAgreements.sort(
    (a, b) =>
      new Date(b.lastModified).getTime() - new Date(a.lastModified).getTime()
  );
};
