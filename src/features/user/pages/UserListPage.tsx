// filepath: src/features/user/pages/UserListPage.tsx
import { useState, useMemo, useCallback } from "react";
import { PlusCircle } from "lucide-react"; // Icon
import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/DataTable"; // Reusable DataTable component
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"; // Confirmation dialogs
// Use updated API function names (English)
import { getUsers, deleteUser, terminateUserSession } from "../api/user";
// Use updated column definition function name (English)
import { getColumns } from "../components/UserColumns";
import { UserForm } from "../components/UserForm"; // The form component (in Sheet)
import { type User } from "@/types"; // Import the User type
import { toast } from "sonner"; // For user feedback notifications

/**
 * Renders the main page for managing users.
 * Displays a DataTable of users and provides actions like create, edit, delete.
 */
export const UserListPage: React.FC = () => {
  // State variable to trigger data refetching after CUD operations
  // Incrementing this value causes the `users` memo to recalculate
  const [dataVersion, setDataVersion] = useState(0);

  // State to control the visibility of the UserForm Sheet panel
  const [isFormOpen, setIsFormOpen] = useState(false);
  // State to hold the user currently being edited (null if in create mode)
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  // State variables to manage confirmation dialogs
  const [userToDelete, setUserToDelete] = useState<User | null>(null); // Stores the user targeted for deletion
  const [userToTerminate, setUserToTerminate] = useState<User | null>(null); // Stores the user whose session will be terminated

  // --- Data Fetching ---
  // `useMemo` fetches and memoizes the user list. It only refetches when `dataVersion` changes.
  const users = useMemo(() => {
    // eslint-disable-next-line no-console
    console.log("Fetching users - dataVersion:", dataVersion); // Debug log
    return getUsers(); // Calls the simulated API to get user data
  }, [dataVersion]);

  // --- Callback Functions ---
  /** Callback function to refresh the user list by incrementing `dataVersion`. */
  const refreshData = useCallback(() => {
    setDataVersion((currentVersion) => currentVersion + 1);
  }, []); // Empty dependency array means this function reference never changes

  /** Opens the UserForm in edit mode with the specified user's data. */
  const handleEdit = useCallback((user: User) => {
    setSelectedUser(user); // Set the user to be edited
    setIsFormOpen(true); // Open the form panel
  }, []); // Depends only on functions that don't change

  /** Opens the UserForm in create mode (no user data pre-filled). */
  const handleCreate = useCallback(() => {
    setSelectedUser(null); // Ensure no user is selected for editing
    setIsFormOpen(true); // Open the form panel
  }, []); // Depends only on functions that don't change

  /** Sets the user to be deleted, triggering the delete confirmation dialog. */
  const handleDelete = useCallback((user: User) => {
    setUserToDelete(user);
  }, []); // Depends only on functions that don't change

  /** Sets the user whose session will be terminated, triggering the confirmation dialog. */
  const handleTerminateSession = useCallback((user: User) => {
    setUserToTerminate(user);
  }, []); // Depends only on functions that don't change

  // --- Confirmation Action Handlers ---
  /** Confirms and executes the user deletion via the API. */
  const confirmDelete = useCallback(() => {
    if (!userToDelete) return; // Safety check

    // UI Text: Spanish
    const toastId = toast.loading("Eliminando usuario...");
    try {
      deleteUser(userToDelete.id); // Call the delete API function
       // UI Text: Spanish
      toast.success(
        `Usuario "${userToDelete.firstName} ${userToDelete.lastName}" eliminado.`,
        { id: toastId }
      );
      refreshData(); // Refresh the data table to reflect the deletion
    } catch (error) {
      console.error("Error deleting user:", error);
       // UI Text: Spanish
      toast.error(
        error instanceof Error ? error.message : "Error al eliminar el usuario.",
        { id: toastId }
      );
    }
    setUserToDelete(null); // Close the confirmation dialog
  }, [userToDelete, refreshData]); // Depends on userToDelete and refreshData

  /** Confirms and executes the session termination via the API. */
  const confirmTerminate = useCallback(() => {
    if (!userToTerminate) return; // Safety check

    // UI Text: Spanish
    const toastId = toast.loading("Terminando sesión...");
    try {
      terminateUserSession(userToTerminate.id); // Call the terminate session API function
      // UI Text: Spanish
      toast.success(
        `Sesión terminada para "${userToTerminate.firstName}". El usuario deberá volver a iniciar sesión.`,
        { id: toastId, duration: 5000 } // Show toast longer for info
      );
      refreshData(); // Refresh table (e.g., to show INACTIVE status if applicable)
    } catch (error) {
      console.error("Error terminating session:", error);
      // UI Text: Spanish
       toast.error(
        error instanceof Error ? error.message : "Error al terminar la sesión.",
        { id: toastId }
      );
    }
    setUserToTerminate(null); // Close the confirmation dialog
  }, [userToTerminate, refreshData]); // Depends on userToTerminate and refreshData

  // --- Column Definitions ---
  // `useMemo` prevents recreating column definitions on every render unless handlers change.
  const columns = useMemo(
    () => getColumns(handleEdit, handleDelete, handleTerminateSession),
    [handleEdit, handleDelete, handleTerminateSession] // Recalculate if handlers change
  );

  // --- Faceted Filter Definitions ---
  // Define options for DataTable's faceted filters (only created once)
  const facetedFilters = useMemo(() => [
    {
      columnId: "role",
      // UI Text: Spanish
      title: "Permisos", // Filter button title
      options: [
        // UI Text: Spanish (labels for filter options)
        { label: "Admin", value: "ADMIN" },
        { label: "Editor", value: "EDITOR" },
        { label: "Lector", value: "READER" }, // Corrected value
      ],
    },
    {
      columnId: "status",
      // UI Text: Spanish
      title: "Estado", // Filter button title
      options: [
        // UI Text: Spanish
        { label: "Activo", value: "ACTIVE" },
        { label: "Inactivo", value: "INACTIVE" },
      ],
    },
  ], []); // Empty dependency array means this is created only once

  // --- Render Logic ---
  return (
    <>
      {/* Main page container with full height and flex column layout */}
      <div className="flex flex-col h-full overflow-hidden">
        {/* Header Section (fixed height) */}
        <div className="shrink-0 p-4"> {/* Non-scrolling header */}
          <div className="flex items-center justify-between">
            {/* Page Title and Description */}
            <div>
               {/* UI Text: Spanish */}
              <h1 className="text-3xl font-bold tracking-tight">
                Gestión de Usuarios
              </h1>
              <p className="text-muted-foreground mt-1">
                Crear, editar y gestionar los usuarios del sistema y sus permisos.
              </p>
            </div>
            {/* Create User Button */}
            <div>
               {/* UI Text: Spanish */}
              <Button onClick={handleCreate}>
                <PlusCircle className="mr-2 h-4 w-4" /> Crear Usuario
              </Button>
            </div>
          </div>
        </div>

        {/* Data Table Section (scrollable) */}
        {/* Takes remaining vertical space */}
        <div className="flex-1 overflow-y-auto p-4">
          <DataTable
            columns={columns} // Pass column definitions
            data={users} // Pass user data
            // Use 'fullName' derived column for primary text filtering
            filterColumnId="fullName"
            // UI Text: Spanish
            filterPlaceholder="Filtrar por nombre o correo..." // Update placeholder
            facetedFilters={facetedFilters} // Pass faceted filter configurations
          />
        </div>
      </div>


      {/* UserForm Panel (Sheet) - Rendered outside main layout flow */}
      <UserForm
        isOpen={isFormOpen} // Control visibility
        onOpenChange={setIsFormOpen} // Handle closing
        userToEdit={selectedUser}   // Pass user data for editing (or null for creating)
        onSave={refreshData}         // Pass refresh callback for after save
      />

      {/* Confirmation Dialog for Deletion */}
      <AlertDialog
        open={!!userToDelete} // Show dialog if userToDelete is not null
        onOpenChange={(open) => !open && setUserToDelete(null)} // Close dialog logic
      >
        <AlertDialogContent>
          <AlertDialogHeader>
             {/* UI Text: Spanish */}
            <AlertDialogTitle>¿Estás realmente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará permanentemente al usuario{" "}
              <strong>
                {/* Display user info safely */}
                {userToDelete?.firstName} {userToDelete?.lastName} ({userToDelete?.email})
              </strong>
              . Esta acción no se puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
             {/* UI Text: Spanish */}
            <AlertDialogCancel onClick={() => setUserToDelete(null)}>Cancelar</AlertDialogCancel>
             {/* UI Text: Spanish */}
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive hover:bg-destructive/90">
              Sí, eliminar usuario
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Confirmation Dialog for Session Termination */}
      <AlertDialog
        open={!!userToTerminate} // Show dialog if userToTerminate is not null
        onOpenChange={(open) => !open && setUserToTerminate(null)} // Close dialog logic
      >
        <AlertDialogContent>
          <AlertDialogHeader>
             {/* UI Text: Spanish */}
            <AlertDialogTitle>Confirmar Terminación de Sesión</AlertDialogTitle>
            <AlertDialogDescription>
              Esto forzará el cierre de la sesión actual para{" "}
              <strong>
                 {/* Display user info safely */}
                {userToTerminate?.firstName} {userToTerminate?.lastName} ({userToTerminate?.email})
              </strong>
              . El usuario tendrá que volver a iniciar sesión para continuar. ¿Deseas proceder?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
             {/* UI Text: Spanish */}
            <AlertDialogCancel onClick={() => setUserToTerminate(null)}>Cancelar</AlertDialogCancel>
             {/* UI Text: Spanish */}
            <AlertDialogAction onClick={confirmTerminate}>
              Sí, terminar sesión
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};