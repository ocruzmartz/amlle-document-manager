import { useState, useMemo, useCallback, useEffect } from "react";
import { PlusCircle, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/DataTable";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { getUsers, deleteUser, terminateUserSession } from "../api/user";
import { getColumns } from "../components/UserColumns";
import { UserForm } from "../components/UserForm";
import { type User } from "@/types";
import { toast } from "sonner";
import type { SortingState } from "@tanstack/react-table";
import { useAuth } from "@/features/auth/context/AuthContext";

export const UserListPage: React.FC = () => {
  const { user: currentUser } = useAuth();
  const [dataVersion, setDataVersion] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);
  const [userToTerminate, setUserToTerminate] = useState<User | null>(null);

  const initialSorting: SortingState = [{ id: "createdAt_exact", desc: true }];

  useEffect(() => {
    const fetchUsers = async () => {
      setIsLoading(true);
      try {
        const userData = await getUsers();
        setUsers(userData);
      } catch (error) {
        console.error("Error en UserListPage al cargar usuarios:", error);
        toast.error("No se pudieron cargar los usuarios.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchUsers();
  }, [dataVersion]);

  const refreshData = useCallback(() => {
    setDataVersion((currentVersion) => currentVersion + 1);
  }, []);

  const handleEdit = useCallback((user: User) => {
    setSelectedUser(user);
    setIsFormOpen(true);
  }, []);

  const handleCreate = useCallback(() => {
    setSelectedUser(null);
    setIsFormOpen(true);
  }, []);

  const handleDelete = useCallback((user: User) => {
    setUserToDelete(user);
  }, []);

  const handleTerminateSession = useCallback((user: User) => {
    setUserToTerminate(user);
  }, []);

  const confirmDelete = useCallback(async () => {
    if (!userToDelete) return;
    const toastId = toast.loading("Eliminando usuario...");
    try {
      await deleteUser(userToDelete.id);
      toast.success(`Usuario "${userToDelete.nombre}" eliminado.`, {
        id: toastId,
      });
      refreshData();
    } catch (error) {
      console.error("Error deleting user:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al eliminar el usuario.",
        { id: toastId }
      );
    }
    setUserToDelete(null);
  }, [userToDelete, refreshData]);

  const confirmTerminate = useCallback(async () => {
    if (!userToTerminate) return;
    const toastId = toast.loading("Desactivando usuario...");
    try {
      await terminateUserSession(userToTerminate.id);
      toast.success(`Usuario "${userToTerminate.nombre}" desactivado.`, {
        id: toastId,
      });
      refreshData();
    } catch (error) {
      console.error("Error terminating session:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "Error al desactivar el usuario.",
        { id: toastId }
      );
    }
    setUserToTerminate(null);
  }, [userToTerminate, refreshData]);

  const columns = useMemo(
    () =>
      getColumns(
        handleEdit,
        handleDelete,
        handleTerminateSession,
        currentUser?.id
      ),
    [handleEdit, handleDelete, handleTerminateSession, currentUser?.id]
  );

  const facetedFilters = useMemo(
    () => [
      {
        columnId: "rol",
        title: "Permisos",
        options: [
          { label: "Admin", value: "admin" },
          { label: "Editor", value: "editor" },
          { label: "Lector", value: "lector" },
        ],
      },
      {
        columnId: "activo",
        title: "Estado",
        options: [
          { label: "Activo", value: "true" },
          { label: "Inactivo", value: "false" },
        ],
      },
    ],
    []
  );

  return (
    <>
      <div className="flex flex-col h-full overflow-hidden">
        <div className="shrink-0 p-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">
                Gestión de Usuarios
              </h1>
              <p className="text-muted-foreground mt-1">
                Crear, editar y gestionar los usuarios del sistema y sus
                permisos.
              </p>
            </div>
            <div>
              <Button onClick={handleCreate}>
                <PlusCircle className="mr-2 h-4 w-4" /> Crear Usuario
              </Button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {isLoading ? (
            <div className="flex h-64 items-center justify-center">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              <span className="ml-2 text-muted-foreground">
                Cargando lista de usuarios...
              </span>
            </div>
          ) : (
            <DataTable
              columns={columns}
              data={users}
              filterColumnId="nombre"
              filterPlaceholder="Filtrar por nombre..."
              facetedFilters={facetedFilters}
              initialSorting={initialSorting}
            />
          )}
        </div>
      </div>

      <UserForm
        isOpen={isFormOpen}
        onOpenChange={setIsFormOpen}
        userToEdit={selectedUser}
        onSave={refreshData}
      />

      <AlertDialog
        open={!!userToDelete}
        onOpenChange={(open) => !open && setUserToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás realmente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente al usuario{" "}
              <strong>{userToDelete?.nombre}</strong>. Esta acción no se puede
              deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToDelete(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              className="bg-destructive hover:bg-destructive/90"
            >
              Sí, eliminar usuario
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!userToTerminate}
        onOpenChange={(open) => !open && setUserToTerminate(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Desactivación</AlertDialogTitle>
            <AlertDialogDescription>
              Esto establecerá el estado de{" "}
              <strong>{userToTerminate?.nombre}</strong> como "Inactivo" y
              cerrará su sesión. ¿Deseas proceder?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setUserToTerminate(null)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmTerminate}>
              Sí, desactivar usuario
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};
