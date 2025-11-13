// filepath: src/features/search/api/searchService.ts
import { apiGetDirect } from "@/lib/apiHelpers";
import { 
  type BookStatus, 
  type ActSessionType,
  type Tome, 
  type Book, 
  type Act, 
  type Agreement 
} from "@/types";

/**
 * Define los parámetros de consulta para GET /api/search
 */
export interface SearchQueryDto {
  keyword: string;
  entityType?: 'books' | 'volumes' | 'minutes' | 'agreements' | 'propietarios';
  bookStatus?: BookStatus;
  minutesStatus?: ActSessionType;
  dateFrom?: string;
  dateTo?: string;
  [key: string]: unknown; // Index signature added for compatibility
}

/**
 * ✅ 1. ESTA ES LA RESPUESTA REAL DEL BACKEND
 * (Basado en tu JSON)
 */
export interface ApiSearchResponse {
  books: Book[];
  volumes: Tome[];
  minutes: Act[];
  agreements: Agreement[];
  // propietarios: any[];
  
}

export const searchService = {
  /**
   * Realiza la búsqueda unificada y devuelve los resultados categorizados.
   */
  searchUnified: async (params: SearchQueryDto): Promise<ApiSearchResponse> => { // ✅ 2. Devolver el tipo real
    try {
      const response = await apiGetDirect<ApiSearchResponse>(
        "/search",
        params
      );
      
      // ✅ 3. Devolver la respuesta cruda. El mapeo se hace en la UI.
      return response;

    } catch (error) {
      console.error("Error en la búsqueda unificada:", error);
      throw new Error("No se pudieron obtener los resultados de búsqueda.");
    }
  },
};