import { apiPostDirect, apiGetDirect, apiPatchDirect } from "@/lib/apiHelpers";
import { type Book } from "@/types";

export const bookService = {
  createBook: async (name: string): Promise<Book> => {
    const newBook = await apiPostDirect<{ name: string }, Book>(
      "/book/create",
      { name }
    );

    return newBook;
  },

  getBooks: async (): Promise<Book[]> => {
    return apiGetDirect<Book[]>("/book/management/find-all");
  },

  getBookById: async (id: string): Promise<Book> => {
    return apiGetDirect<Book>(`/book/find/${id}`);
  },

  updateBook: async (id: string, data: Partial<Book>): Promise<Book> => {
    const updatedBook = await apiPatchDirect<Partial<Book>, Book>(
      `/book/update/${id}`,
      data
    );

    return updatedBook;
  },

  getAllAgreementsContent: async (bookId: string): Promise<any[]> => {
    const endpoint = `/book/build/all-agreements-content/${bookId}`;

    const data = await apiGetDirect<any>(endpoint);

    return data;
  },
};
