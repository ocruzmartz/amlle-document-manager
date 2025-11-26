import { apiClient } from "@/services/apiClient";
import type { ApiResponse, PaginatedResponse } from "@/types/index";
import { AxiosError } from "axios";

export const handleApiError = (
  error: unknown,
  defaultMessage: string
): never => {
  if (error instanceof AxiosError && error.response?.data?.message) {
    throw new Error(error.response.data.message);
  }
  throw new Error(defaultMessage);
};

export const apiGet = async <T, TParams = Record<string, unknown>>(
  endpoint: string,
  params?: TParams
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

export const apiGetDirect = async <T, TParams = Record<string, unknown>>(
  endpoint: string,
  params?: TParams
): Promise<T> => {
  try {
    const response = await apiClient.get<T>(endpoint, { params });
    return response.data;
  } catch (error) {
    throw handleApiError(error, `Error al obtener datos de ${endpoint}`);
  }
};

export const apiGetPaginated = async <T, TParams = Record<string, unknown>>(
  endpoint: string,
  params?: TParams
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

export const apiDelete = async (endpoint: string): Promise<void> => {
  try {
    await apiClient.delete(endpoint);
  } catch (error) {
    throw handleApiError(error, `Error al eliminar en ${endpoint}`);
  }
};
