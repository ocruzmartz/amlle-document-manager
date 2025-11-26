import { type User } from "@/types";
import { type UserFormData } from "@/features/user/schemas/userFormSchema";
import {
  apiGetDirect,
  apiPostDirect,
  apiPatchDirect,
  apiDelete,
} from "@/lib/apiHelpers";
import { toast } from "sonner";

interface CreateUserDto {
  nombre: string;
  sessionType: "indefinida" | "temporal";
  sessionDuration?: string | null;
}
interface UpdateProfileDto {
  nombre: string;
}
interface UpdateSessionSpecsDto {
  sessionType: "indefinida" | "temporal";
  sessionDuration?: string | null;
}

export const getUsers = async (): Promise<User[]> => {
  try {
    const backendUsers = await apiGetDirect<User[]>("/users/all");
    return backendUsers.sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  } catch (error) {
    console.error("Error al obtener usuarios:", error);
    toast.error("No se pudieron cargar los usuarios desde el backend.");
    return [];
  }
};

export const createUser = async (formData: UserFormData): Promise<User> => {
  const payload: CreateUserDto = {
    nombre: formData.nombre,
    sessionType:
      formData.sessionType === "TEMPORAL" ? "temporal" : "indefinida",
    sessionDuration:
      formData.sessionType === "TEMPORAL" ? formData.sessionDuration : null,
  };

  try {
    return await apiPostDirect<CreateUserDto, User>("/users/create", payload);
  } catch (error) {
    console.error("Error al crear usuario:", error);
    throw error;
  }
};

export const updateUser = async (
  userId: string,
  formData: UserFormData,
  originalUser: User
): Promise<void> => {
  const updatePromises: Promise<any>[] = [];

  if (formData.nombre !== originalUser.nombre) {
    const profilePayload: UpdateProfileDto = {
      nombre: formData.nombre,
    };
    updatePromises.push(
      apiPatchDirect(`/users/update/profile/${userId}`, profilePayload)
    );
  }

  const formSessionType =
    formData.sessionType === "TEMPORAL" ? "temporal" : "indefinida";
  const formSessionDuration =
    formData.sessionType === "TEMPORAL" ? formData.sessionDuration : null;

  if (
    formSessionType !== originalUser.sessionType ||
    formSessionDuration !== originalUser.sessionDuration
  ) {
    const sessionPayload: UpdateSessionSpecsDto = {
      sessionType: formSessionType,
      sessionDuration: formSessionDuration,
    };
    updatePromises.push(
      apiPatchDirect(`/users/update-session-specs/${userId}`, sessionPayload)
    );
  }

  if (updatePromises.length === 0) {
    toast.info("No se detectaron cambios para guardar.");
    return;
  }
  try {
    await Promise.all(updatePromises);
  } catch (error) {
    console.error("Error al orquestar la actualización del usuario:", error);
    throw new Error("Falló una o más actualizaciones del perfil de usuario.");
  }
};

export const deleteUser = async (userId: string): Promise<void> => {
  try {
    await apiDelete(`/users/remove/${userId}`); //
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    throw error;
  }
};

export const terminateUserSession = async (userId: string): Promise<void> => {
  try {
    await apiPatchDirect(`/users/deactivate/${userId}`, {}); //
  } catch (error) {
    console.error("Error al desactivar (terminar sesión) usuario:", error);
    throw error;
  }
};
