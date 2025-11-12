// filepath: src/features/user/api/user.ts
import { type User } from "@/types";
import { type UserFormData } from "@/features/user/schemas/userFormSchema";
import { apiGetDirect, apiPostDirect, apiPatchDirect, apiDelete } from "@/lib/apiHelpers";
import { toast } from "sonner";

// --- DTOs (Definiciones) ---
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
// --- Fin DTOs ---

/**
 * Obtiene todos los usuarios del backend. (Conectado)
 */
export const getUsers = async (): Promise<User[]> => {
  try {
    const backendUsers = await apiGetDirect<User[]>("/users/all");
    console.log("Usuarios obtenidos del backend:", backendUsers);
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

/**
 * Crea un nuevo usuario. (Conectado)
 */
export const createUser = async (formData: UserFormData): Promise<User> => {
  const payload: CreateUserDto = {
    nombre: formData.nombre,
    sessionType: formData.sessionType === "TEMPORAL" ? "temporal" : "indefinida",
    sessionDuration:
      formData.sessionType === "TEMPORAL" ? formData.sessionDuration : null,
  };

  try {
    return await apiPostDirect<CreateUserDto, User>(
      "/users/create",
      payload
    );
  } catch (error) {
    console.error("Error al crear usuario:", error);
    throw error;
  }
};

/**
 * Actualiza un usuario existente. (Conectado y con lógica de cambios)
 * Orquesta llamadas PATCH solo para los campos que cambiaron.
 */
export const updateUser = async (
  userId: string,
  formData: UserFormData,
  originalUser: User // ✅ 1. Recibimos el usuario original
): Promise<void> => {
  
  const updatePromises: Promise<any>[] = [];

  // 2. Comparar Nombre (Profile)
  if (formData.nombre !== originalUser.nombre) {
    const profilePayload: UpdateProfileDto = {
      nombre: formData.nombre,
    };
    console.log("Detectado cambio de nombre, enviando a /update/profile:", profilePayload);
    updatePromises.push(
      apiPatchDirect(`/users/update/profile/${userId}`, profilePayload)
    );
  }

  // 3. Comparar Sesión
  const formSessionType = formData.sessionType === "TEMPORAL" ? "temporal" : "indefinida";
  const formSessionDuration = formData.sessionType === "TEMPORAL" ? formData.sessionDuration : null;

  if (
    formSessionType !== originalUser.sessionType ||
    formSessionDuration !== originalUser.sessionDuration
  ) {
    const sessionPayload: UpdateSessionSpecsDto = {
      sessionType: formSessionType,
      sessionDuration: formSessionDuration,
    };
    console.log("Detectado cambio de sesión, enviando a /update-session-specs:", sessionPayload);
    updatePromises.push(
      apiPatchDirect(`/users/update-session-specs/${userId}`, sessionPayload)
    );
  }
  
  // 4. Si no hay cambios, no hacer nada
  if (updatePromises.length === 0) {
    console.log("No se detectaron cambios, omitiendo actualización.");
    toast.info("No se detectaron cambios para guardar.");
    return; // No hay nada que guardar
  }

  // 5. Ejecutar solo las promesas necesarias
  try {
    await Promise.all(updatePromises);
  } catch (error) {
    console.error("Error al orquestar la actualización del usuario:", error);
    throw new Error("Falló una o más actualizaciones del perfil de usuario.");
  }
};

/**
 * Elimina un usuario. (Conectado)
 */
export const deleteUser = async (userId: string): Promise<void> => {
  try {
    await apiDelete(`/users/remove/${userId}`); //
  } catch (error) {
    console.error("Error al eliminar usuario:", error);
    throw error;
  }
};

/**
 * Desactiva un usuario. (Conectado)
 */
export const terminateUserSession = async (userId: string): Promise<void> => {
   try {
    await apiPatchDirect(`/users/deactivate/${userId}`, {}); //
  } catch (error) {
    console.error("Error al desactivar (terminar sesión) usuario:", error);
    throw error;
  }
};