import {
  apiPostDirect,
  apiGetDirect,
  apiPatchDirect,
} from "@/lib/apiHelpers";
import { type Book } from "@/types";

/**
 * Servicio para operaciones de libros con el backend
 */
export const bookService = {
  /**
   * Crear un nuevo libro
   */
  createBook: async (name: string): Promise<Book> => {
    const newBook = await apiPostDirect<{ name: string }, Book>(
      "/book/create",
      { name }
    );

    return newBook;
  },

  /**
   * Obtener todos los libros
   */
  getBooks: async (): Promise<Book[]> => {
    return apiGetDirect<Book[]>("/book/all");
  },

  /**
   * Obtener un libro por ID
   */
  getBookById: async (id: string): Promise<Book> => {
    return apiGetDirect<Book>(`/book/find/${id}`);
  },

  /**
   * Actualizar un libro
   */
  updateBook: async (id: string, data: Partial<Book>): Promise<Book> => {
    const updatedBook = await apiPatchDirect<Partial<Book>, Book>(
      `/book/update/${id}`,
      data
    );

    return updatedBook;
  },

  /**
   * Eliminar un libro
   */
  //   deleteBook: async (id: string): Promise<void> => {
  //     await apiDeleteDirect(`/book/${id}`);

  //     // ✅ Registrar en auditoría
  //     addAuditLog({
  //       action: "DELETED",
  //       user: { firstName: "Admin", lastName: "Sistema" },
  //       target: {
  //         type: "Book",
  //         name: "Libro eliminado",
  //         url: "#",
  //       },
  //     });
  //   },
};
