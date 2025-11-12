import { apiClient } from "@/services/apiClient";
import type { ApiResponse, PaginatedResponse } from "@/types/index";
import { AxiosError } from "axios";

/**
 * Maneja errores de API de forma consistente
 */
export const handleApiError = (
  error: unknown,
  defaultMessage: string
): never => {
  if (error instanceof AxiosError && error.response?.data?.message) {
    throw new Error(error.response.data.message);
  }
  throw new Error(defaultMessage);
};

/**
 * GET genérico con estructura estándar { data: { data: T } }
 */
export const apiGet = async <T>(
  endpoint: string,
  params?: Record<string, unknown>
): Promise<T> => {
  try {
    const response = await apiClient.get<ApiResponse<T>>(endpoint, {
      params,
    });
    return response.data.data;
  } catch (error) {
    throw handleApiError(error, `Error al obtener datos de ${endpoint}`);
  }
};

/**
 * GET directo - cuando el backend devuelve los datos sin envolver
 * Ejemplo: response.data = "string" o response.data = { id: "..." }
 */
export const apiGetDirect = async <T>(
  endpoint: string,
  params?: Record<string, unknown>
): Promise<T> => {
  try {
    const response = await apiClient.get<T>(endpoint, { params });
    return response.data;
  } catch (error) {
    throw handleApiError(error, `Error al obtener datos de ${endpoint}`);
  }
};

/**
 * GET con paginación
 */
export const apiGetPaginated = async <T>(
  endpoint: string,
  params?: Record<string, unknown>
): Promise<PaginatedResponse<T>> => {
  try {
    const response = await apiClient.get<PaginatedResponse<T>>(endpoint, {
      params,
    });
    return response.data;
  } catch (error) {
    throw handleApiError(
      error,
      `Error al obtener datos paginados de ${endpoint}`
    );
  }
};

/**
 * POST genérico con estructura estándar { data: { data: T } }
 */
export const apiPost = async <TData, TResponse>(
  endpoint: string,
  data: TData
): Promise<TResponse> => {
  try {
    const response = await apiClient.post<ApiResponse<TResponse>>(
      endpoint,
      data
    );
    return response.data.data;
  } catch (error) {
    throw handleApiError(error, `Error al crear en ${endpoint}`);
  }
};

/**
 * POST directo - cuando el backend devuelve los datos sin envolver
 */
export const apiPostDirect = async <TData, TResponse>(
  endpoint: string,
  data: TData
): Promise<TResponse> => {
  try {
    const response = await apiClient.post<TResponse>(endpoint, data);
    return response.data;
  } catch (error) {
    throw handleApiError(error, `Error al crear en ${endpoint}`);
  }
};

/**
 * PATCH genérico
 */
export const apiPatch = async <TData, TResponse>(
  endpoint: string,
  data: TData
): Promise<TResponse> => {
  try {
    const response = await apiClient.patch<ApiResponse<TResponse>>(
      endpoint,
      data
    );
    return response.data.data;
  } catch (error) {
    throw handleApiError(error, `Error al actualizar en ${endpoint}`);
  }
};

/**
 * PATCH directo
 */
export const apiPatchDirect = async <TData, TResponse>(
  endpoint: string,
  data: TData
): Promise<TResponse> => {
  try {
    const response = await apiClient.patch<TResponse>(endpoint, data);
    return response.data;
  } catch (error) {
    throw handleApiError(error, `Error al actualizar en ${endpoint}`);
  }
};

/**
 * PUT genérico con estructura estándar
 */
export const apiPut = async <TData, TResponse>(
  endpoint: string,
  data: TData
): Promise<TResponse> => {
  try {
    const response = await apiClient.put<ApiResponse<TResponse>>(
      endpoint,
      data
    );
    return response.data.data;
  } catch (error) {
    throw handleApiError(error, `Error al actualizar en ${endpoint}`);
  }
};

/**
 * PUT directo
 */
export const apiPutDirect = async <TData, TResponse>(
  endpoint: string,
  data: TData
): Promise<TResponse> => {
  try {
    const response = await apiClient.put<TResponse>(endpoint, data);
    return response.data;
  } catch (error) {
    throw handleApiError(error, `Error al actualizar en ${endpoint}`);
  }
};

/**
 * DELETE genérico
 */
export const apiDelete = async (endpoint: string): Promise<void> => {
  try {
    await apiClient.delete(endpoint);
  } catch (error) {
    throw handleApiError(error, `Error al eliminar en ${endpoint}`);
  }
};
