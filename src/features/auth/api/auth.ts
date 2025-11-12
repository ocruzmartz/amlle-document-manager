import {
  apiPostDirect,
  apiGetDirect,
  apiPatchDirect,
} from "@/lib/apiHelpers";
import {
  type LoginFormData,
  type ActivateFormData,
} from "../schemas/authSchema";
import type { User } from "@/types";

interface TokenResponse {
  accessToken: string;
}

interface CheckUserResponse {
  id: string;
  message?: string;
}

/**
 * Verificar si el usuario necesita establecer contraseña
 * Usa apiGetDirect porque el backend devuelve solo el ID como string
 */
export const checkUserForActivation = async (
  data: ActivateFormData
): Promise<CheckUserResponse> => {
  const encodedName = encodeURIComponent(data.nombre);
  const userId = await apiGetDirect<string>(
    `/users/find-by-name/${encodedName}`
  );
  return { id: userId };
};

/**
 * Establecer contraseña para un usuario nuevo
 * PATCH /api/users/set-password
 */
export const setPasswordForUser = async (
  userId: string,
  password: string
): Promise<void> => {
  // ✅ 1. Cambiado de Promise<string> a Promise<void>

  await apiPatchDirect<
    { id: string; contrasena: string },
    unknown // ✅ 2. No esperamos un tipo de respuesta específico
  >("/users/set-password", {
    // ⚠️ Asumo que este es el endpoint
    id: userId,
    contrasena: password,
  });

  // ✅ 3. No hay 'return', la función termina
};

/**
 * Login estándar
 * El backend devuelve: { "accessToken": "..." }
 */
export const login = async (data: LoginFormData): Promise<string> => {
  const response = await apiPostDirect<
    { name: string; password: string },
    TokenResponse
  >("/auth/login", {
    name: data.username,
    password: data.password,
  });
  console.log("Respuesta de login:", response);
  // El backend devuelve { "accessToken": "..." } directamente
  return response.accessToken;
};

/**
 * Obtener datos del usuario por ID
 * GET /api/users/find/:id
 * El backend devuelve el usuario directamente sin envolver en { data: {...} }
 */
export const getUserById = async (userId: string): Promise<User> => {
  const response = await apiGetDirect<User>(`/users/find/${userId}`);
  console.log("Respuesta de obtener usuario por ID:", response);
  return response;
};
