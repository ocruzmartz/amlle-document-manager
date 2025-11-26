import { apiPostDirect, apiGetDirect, apiPatchDirect } from "@/lib/apiHelpers";
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

export const checkUserForActivation = async (
  data: ActivateFormData
): Promise<CheckUserResponse> => {
  const encodedName = encodeURIComponent(data.nombre);
  const userId = await apiGetDirect<string>(
    `/users/find-by-name/${encodedName}`
  );
  return { id: userId };
};

export const setPasswordForUser = async (
  userId: string,
  password: string
): Promise<void> => {
  await apiPatchDirect<{ id: string; contrasena: string }, unknown>(
    "/users/set-password",
    {
      id: userId,
      contrasena: password,
    }
  );
};

export const login = async (data: LoginFormData): Promise<string> => {
  const response = await apiPostDirect<
    { name: string; password: string },
    TokenResponse
  >("/auth/login", {
    name: data.username,
    password: data.password,
  });
  return response.accessToken;
};

export const getUserById = async (userId: string): Promise<User> => {
  const response = await apiGetDirect<User>(`/users/find/${userId}`);
  return response;
};
