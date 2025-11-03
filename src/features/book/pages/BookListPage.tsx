import { PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { DataTable } from "@/components/ui/DataTable";
import { createBook, deleteTome, getTomes, updateTome } from "../api/book";
import { getColumns } from "../components/BookColumns";
import { useEffect, useState } from "react";
import type { Tome } from "@/types";
import { addAuditLog } from "@/features/audit/api/audit";
import { toast } from "sonner";
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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export const BookListPage = () => {
  const navigate = useNavigate();

  const [tomes, setTomes] = useState<Tome[]>([]);
  const [tomeToFinalize, setTomeToFinalize] = useState<Tome | null>(null);
  const [tomeToArchive, setTomeToArchive] = useState<Tome | null>(null);
  const [tomeToRestore, setTomeToRestore] = useState<Tome | null>(null);
  const [tomeToDelete, setTomeToDelete] = useState<Tome | null>(null);
  const [confirmationText, setConfirmationText] = useState("");

  useEffect(() => {
    setTomes(getTomes());
  }, []);

  const updateLocalTome = (updatedTome: Tome) => {
    setTomes((currentTomes) =>
      currentTomes.map((t) => (t.id === updatedTome.id ? updatedTome : t))
    );
  };

  // Elimina un tomo del estado local
  const removeLocalTome = (tomeId: string) => {
    setTomes((currentTomes) => currentTomes.filter((t) => t.id !== tomeId));
  };

  // Simulación de usuario de auditoría (como en otras APIs)
  const auditUser = { firstName: "Admin", lastName: "Sistema" };

  const handleCreateBook = () => {
    const newTome = createBook({
      name: `Nuevo Libro - ${new Date().toLocaleDateString()}`,
    });
    // Añadir al estado local y registrar auditoría
    setTomes((current) => [newTome, ...current]);
    addAuditLog({
      action: "CREATED",
      user: auditUser,
      target: {
        type: "Book", // El log es sobre el "Libro" (aunque trabajemos con Tomo)
        name: newTome.bookName,
        url: `/books/${newTome.id}`,
      },
    });
    navigate(`/books/${newTome.id}`);
  };

  const handleFinalize = () => {
    if (!tomeToFinalize) return;

    const updatedTome = updateTome(tomeToFinalize.id, { status: "FINALIZADO" });
    if (updatedTome) {
      updateLocalTome(updatedTome);
      addAuditLog({
        action: "FINALIZED", // ✅ Auditoría
        user: auditUser,
        target: {
          type: "Book",
          name: updatedTome.name,
          url: `/books/${updatedTome.id}`,
        },
      });
      toast.success(
        `El tomo "${updatedTome.name}" se ha marcado como FINALIZADO.`
      );
    } else {
      toast.error("Error al finalizar el tomo.");
    }
    setTomeToFinalize(null);
    setConfirmationText("");
  };

  const handleArchive = () => {
    if (!tomeToArchive) return;
    const updatedTome = updateTome(tomeToArchive.id, { status: "ARCHIVADO" });
    if (updatedTome) {
      updateLocalTome(updatedTome);
      addAuditLog({
        action: "ARCHIVED", // ✅ Auditoría
        user: auditUser,
        target: {
          type: "Book",
          name: updatedTome.name,
          url: `/books/${updatedTome.id}`,
        },
      });
      toast.success(`El tomo "${updatedTome.name}" se ha movido a ARCHIVADO.`);
    }
    setTomeToArchive(null);
  };

  const handleRestore = () => {
    if (!tomeToRestore) return;
    const updatedTome = updateTome(tomeToRestore.id, { status: "BORRADOR" });
    if (updatedTome) {
      updateLocalTome(updatedTome);
      addAuditLog({
        action: "RESTORED", // ✅ Auditoría
        user: auditUser,
        target: {
          type: "Book",
          name: updatedTome.name,
          url: `/books/${updatedTome.id}`,
        },
      });
      toast.success(
        `El tomo "${updatedTome.name}" se ha restaurado a BORRADOR.`
      );
    }
    setTomeToRestore(null);
  };

  const handleDelete = () => {
    if (!tomeToDelete) return;
    try {
      deleteTome(tomeToDelete.id);
      removeLocalTome(tomeToDelete.id);
      addAuditLog({
        action: "DELETED", // ✅ Auditoría
        user: auditUser,
        target: {
          type: "Book",
          name: tomeToDelete.name,
          url: `#`,
        },
      });
      toast.success(`Tomo "${tomeToDelete.name}" eliminado.`);
    } catch (e) {
      toast.error("Error al eliminar el tomo.");
    }
    setTomeToDelete(null);
  };

  const columns = getColumns({
    onFinalize: (tome) => setTomeToFinalize(tome),
    onArchive: (tome) => setTomeToArchive(tome),
    onRestore: (tome) => setTomeToRestore(tome),
    onDelete: (tome) => setTomeToDelete(tome),
  });

  const statusFilters = [
    {
      columnId: "status",
      title: "Estado",
      options: [
        { label: "Borrador", value: "BORRADOR" },
        { label: "Finalizado", value: "FINALIZADO" },
        { label: "Archivado", value: "ARCHIVADO" },
      ],
    },
  ];

  return (
    <div className="space-y-8 overflow-y-auto p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            Gestión de Libros
          </h1>
          <p className="text-muted-foreground mt-1">
            Libros de Actas y Acuerdos Municipales.
          </p>
        </div>
        <div>
          <Button onClick={handleCreateBook}>
            <PlusCircle className="mr-2 h-4 w-4" /> Añadir Nuevo Libro
          </Button>
        </div>
      </div>
      <DataTable
        columns={columns}
        data={tomes}
        filterColumnId="bookName"
        filterPlaceholder="Filtrar por nombre de libro..."
        facetedFilters={statusFilters}
      />

      <AlertDialog
        open={!!tomeToFinalize}
        onOpenChange={(open) => {
          if (!open) {
            setTomeToFinalize(null);
            setConfirmationText(""); // Limpiar texto al cerrar
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Finalizar este tomo?</AlertDialogTitle>
            <AlertDialogDescription>
              Vas a marcar el tomo <strong>"{tomeToFinalize?.name}"</strong>{" "}
              como FINALIZADO.
              <br />
              Esta acción bloqueará futuras ediciones. Para confirmar, por favor
              escribe <strong>FINALIZAR</strong> en el campo de abajo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <Label htmlFor="confirm-text" className="text-muted-foreground">
              Escribe "FINALIZAR" para confirmar
            </Label>
            <Input
              id="confirm-text"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              className="mt-2"
              autoComplete="off"
              autoFocus
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <Button
              onClick={handleFinalize}
              disabled={confirmationText !== "FINALIZAR"}
            >
              Finalizar Tomo
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal 2: Archivar Tomo (Simple) */}
      <AlertDialog
        open={!!tomeToArchive}
        onOpenChange={(open) => !open && setTomeToArchive(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Archivar este tomo?</AlertDialogTitle>
            <AlertDialogDescription>
              Vas a mover el tomo <strong>"{tomeToArchive?.name}"</strong> a
              ARCHIVADO. Esto lo ocultará de la lista principal. ¿Estás seguro?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleArchive}>
              Sí, archivar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal 3: Restaurar Tomo (Simple) */}
      <AlertDialog
        open={!!tomeToRestore}
        onOpenChange={(open) => !open && setTomeToRestore(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Restaurar este tomo?</AlertDialogTitle>
            <AlertDialogDescription>
              Vas a restaurar el tomo <strong>"{tomeToRestore?.name}"</strong>{" "}
              al estado BORRADOR. Volverá a aparecer en la lista principal.
              ¿Estás seguro?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestore}>
              Sí, restaurar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal 4: Eliminar Tomo (Simple) */}
      <AlertDialog
        open={!!tomeToDelete}
        onOpenChange={(open) => !open && setTomeToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este tomo?</AlertDialogTitle>
            <AlertDialogDescription>
              Vas a eliminar permanentemente el tomo{" "}
              <strong>"{tomeToDelete?.name}"</strong>. Esta acción no se puede
              deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Sí, eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
