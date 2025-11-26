import { apiGetDirect } from "@/lib/apiHelpers";
import {
  type BookStatus,
  type ActSessionType,
  type Tome,
  type Book,
  type Act,
  type Agreement,
} from "@/types";

export interface SearchQueryDto {
  keyword: string;
  entityType?: "books" | "volumes" | "minutes" | "agreements" | "propietarios";
  bookStatus?: BookStatus;
  minutesStatus?: ActSessionType;
  dateFrom?: string;
  dateTo?: string;
  [key: string]: unknown;
}

export interface ApiSearchResponse {
  books: Book[];
  volumes: Tome[];
  minutes: Act[];
  agreements: Agreement[];
}

export const searchService = {
  searchUnified: async (params: SearchQueryDto): Promise<ApiSearchResponse> => {
    try {
      const response = await apiGetDirect<ApiSearchResponse>("/search", params);

      return response;
    } catch (error) {
      console.error("Error en la búsqueda unificada:", error);
      throw new Error("No se pudieron obtener los resultados de búsqueda.");
    }
  },
};
