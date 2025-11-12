/**
 * Respuesta genérica de la API
 */
export interface ApiResponse<T> {
  data: T;
  message?: string;
}

/**
 * Respuesta paginada de la API
 */
export interface PaginatedResponse<T> {
  data: T[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

/**
 * Error de la API
 */
export interface ApiError {
  message: string;
  errors?: Record<string, string[]>;
  statusCode?: number;
}

/**
 * Parámetros comunes de paginación
 */
export interface PaginationParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  order?: 'asc' | 'desc';
}