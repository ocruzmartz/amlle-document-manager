import { useState, useEffect, useMemo } from "react";
import { councilService } from "../api/councilService";
import { DataTable } from "@/components/ui/DataTable";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { type Propietario } from "@/types/council";
import { AssignSubstituteDialog } from "./AssignSubstituteDialog";
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
import { getPropietarioColumns } from "./PropietarioColumns";

interface PropietariosListProps {
  refreshTrigger: number;
  onEdit: (propietario: Propietario) => void;
}

export const PropietariosList = ({ refreshTrigger, onEdit }: PropietariosListProps) => {
  const [data, setData] = useState<Propietario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedForAssign, setSelectedForAssign] = useState<Propietario | null>(null);
  const [itemToDelete, setItemToDelete] = useState<Propietario | null>(null);

  const fetchPropietarios = async () => {
    setIsLoading(true);
    try {
      const res = await councilService.getPropietarios();
      setData(res);
    } catch (error) {
      console.error(error);
      toast.error("No se pudieron cargar los propietarios.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPropietarios();
  }, [refreshTrigger]);

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    const toastId = toast.loading("Eliminando...");
    try {
      await councilService.deletePropietario(itemToDelete.id);
      toast.success("Propietario eliminado correctamente", { id: toastId });
      fetchPropietarios();
    } catch (error) {
      console.error(error);
      toast.error("No se pudo eliminar el propietario.", { id: toastId });
    } finally {
      setItemToDelete(null);
    }
  };

  const columns = useMemo(
    () =>
      getPropietarioColumns({
        onEdit,
        onDelete: (item: Propietario) => setItemToDelete(item),
        onAssign: (item: Propietario) => {
          setSelectedForAssign(item);
          setAssignModalOpen(true);
        },
      }),
    [onEdit]
  );

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Cargando propietarios...</span>
      </div>
    );
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        filterColumnId="name"
        filterPlaceholder="Filtrar propietarios..."
      />

      {selectedForAssign && (
        <AssignSubstituteDialog
          open={assignModalOpen}
          onOpenChange={setAssignModalOpen}
          propietario={selectedForAssign}
          onSuccess={fetchPropietarios}
        />
      )}

      <AlertDialog
        open={!!itemToDelete}
        onOpenChange={(open) => !open && setItemToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará al propietario <strong>{itemToDelete?.name}</strong> de la lista.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-destructive hover:bg-destructive/90"
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};