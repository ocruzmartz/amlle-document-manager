import { useState, useEffect, useMemo } from "react";
import { councilService } from "../api/councilService";
import { DataTable } from "@/components/ui/DataTable";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
import { type Substituto } from "@/types/council";
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
import { getSubstitutoColumns } from "./SubstitutoColumns";

interface SubstitutosListProps {
  refreshTrigger: number;
  onEdit: (substituto: Substituto) => void;
}

export const SubstitutosList = ({ refreshTrigger, onEdit }: SubstitutosListProps) => {
  const [data, setData] = useState<Substituto[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [itemToDelete, setItemToDelete] = useState<Substituto | null>(null);

  const fetchSubstitutos = async () => {
    setIsLoading(true);
    try {
      const res = await councilService.getSubstitutos();
      setData(res);
    } catch (error) {
      console.error(error);
      toast.error("No se pudieron cargar los suplentes.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSubstitutos();
  }, [refreshTrigger]);

  const handleDeleteConfirm = async () => {
    if (!itemToDelete) return;
    const toastId = toast.loading("Eliminando...");
    try {
      await councilService.deleteSubstituto(itemToDelete.id);
      toast.success("Suplente eliminado correctamente", { id: toastId });
      fetchSubstitutos();
    } catch (error) {
      console.error(error);
      toast.error("No se pudo eliminar (posiblemente esté asignado).", { id: toastId });
    } finally {
      setItemToDelete(null);
    }
  };

  const columns = useMemo(
    () =>
      getSubstitutoColumns({
        onEdit,
        onDelete: (item) => setItemToDelete(item),
      }),
    [onEdit]
  );

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        <span className="ml-2 text-muted-foreground">Cargando suplentes...</span>
      </div>
    );
  }

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        filterColumnId="name"
        filterPlaceholder="Filtrar suplentes..."
      />

      <AlertDialog
        open={!!itemToDelete}
        onOpenChange={(open) => !open && setItemToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Estás completamente seguro?</AlertDialogTitle>
            <AlertDialogDescription>
              Esta acción eliminará al suplente <strong>{itemToDelete?.name}</strong> de la lista maestra.
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