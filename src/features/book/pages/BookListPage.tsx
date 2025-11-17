import { Loader2, PlusCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router";
import { DataTable } from "@/components/ui/DataTable";
import { bookService } from "../../book/api/bookService";
import { volumeService } from "../api/volumeService";
import { getColumns } from "../components/BookColumns";
import { useEffect, useState } from "react";
import type { Tome } from "@/types";
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
import type { SortingState } from "@tanstack/react-table";

export const BookListPage = () => {
  const navigate = useNavigate();
  const initialSorting: SortingState = [{ id: "createdAt", desc: true }];
  const [tomes, setTomes] = useState<Tome[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const [tomeToFinalize, setTomeToFinalize] = useState<Tome | null>(null);
  const [tomeToArchive, setTomeToArchive] = useState<Tome | null>(null);
  const [tomeToRestore, setTomeToRestore] = useState<Tome | null>(null);
  const [tomeToDelete, setTomeToDelete] = useState<Tome | null>(null);
  const [confirmationText, setConfirmationText] = useState("");

  useEffect(() => {
    const fetchTomes = async () => {
      setIsLoading(true);
      try {
        const data = await volumeService.getAllVolumes(); // Llama a /api/volume/find-all
        setTomes(data); // Establece los datos del backend
      } catch (error) {
        console.error("Error al cargar tomos:", error);
        toast.error("No se pudieron cargar los tomos.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchTomes();
  }, []);

  const updateLocalTome = (updatedTome: Tome) => {
    setTomes((currentTomes) =>
      currentTomes.map((t) => (t.id === updatedTome.id ? updatedTome : t))
    );
  };

  const removeLocalTome = (tomeId: string) => {
    setTomes((currentTomes) => currentTomes.filter((t) => t.id !== tomeId));
  };

  const handleCreateBook = async () => {
    setIsCreating(true);
    try {
      const defaultName = `Nuevo Libro - ${new Date().toLocaleDateString()}`;
      const newBook = await bookService.createBook(defaultName);
      const newTome = await volumeService.createVolume({
        number: 1,
        bookId: newBook.id,
      });
      setTomes((current) => [newTome, ...current]);
      toast.success(`Libro "${newBook.name}" creado exitosamente`);
      navigate(`/books/${newTome.id}`);
    } catch (error) {
      console.error("❌ Error al crear libro:", error);
      toast.error(
        error instanceof Error ? error.message : "No se pudo crear el libro"
      );
    } finally {
      setIsCreating(false);
    }
  };

  const handleFinalize = async () => {
    if (!tomeToFinalize) return;
    try {
      // ✅ Usamos la nueva función específica
      const updatedTome = await volumeService.updateVolumeStatus(
        tomeToFinalize.id,
        "FINALIZADO"
      );
      updateLocalTome(updatedTome);
      toast.success(
        `El tomo "${updatedTome.name || "Tomo"}" se ha marcado como FINALIZADO.`
      );
    } catch (error) {
      toast.error("Error al finalizar el tomo.");
    }
    setTomeToFinalize(null);
    setConfirmationText("");
  };

  const handleArchive = async () => {
    if (!tomeToArchive) return;
    try {
      // ✅ Usamos la nueva función específica
      const updatedTome = await volumeService.updateVolumeStatus(
        tomeToArchive.id,
        "ARCHIVADO"
      );
      updateLocalTome(updatedTome);
      toast.success(
        `El tomo "${updatedTome.name || "Tomo"}" se ha movido a ARCHIVADO.`
      );
    } catch (error) {
      toast.error("Error al archivar el tomo.");
    }
    setTomeToArchive(null);
  };

  const handleRestore = async () => {
    if (!tomeToRestore) return;
    try {
      // ✅ Usamos la nueva función específica
      const updatedTome = await volumeService.updateVolumeStatus(
        tomeToRestore.id,
        "BORRADOR"
      );
      updateLocalTome(updatedTome);
      toast.success(
        `El tomo "${updatedTome.name || "Tomo"}" se ha restaurado a BORRADOR.`
      );
    } catch (error) {
      toast.error("Error al restaurar el tomo.");
    }
    setTomeToRestore(null);
  };

  const handleDelete = async () => {
    if (!tomeToDelete) return;
    try {
      await volumeService.deleteVolume(tomeToDelete.id);
      removeLocalTome(tomeToDelete.id);
      toast.success(`Tomo "${tomeToDelete.name || "Tomo"}" eliminado.`);
    } catch (e) {
      toast.error("Error al eliminar el tomo.");
    }
    setTomeToDelete(null);
    setConfirmationText("");
  };

  const columns = getColumns({
    onFinalize: (tome) => setTomeToFinalize(tome),
    onArchive: (tome) => setTomeToArchive(tome),
    onRestore: (tome) => setTomeToRestore(tome),
    onDelete: (tome) => setTomeToDelete(tome),
    navigate,
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
          <Button onClick={handleCreateBook} disabled={isCreating}>
            <PlusCircle className="mr-2 h-4 w-4" />
            {isCreating ? "Creando..." : "Añadir Nuevo Libro"}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="h-32 flex items-center justify-center">
          <Loader2 className="mr-2 h-5 w-5 animate-spin text-muted-foreground" />
          <p className="text-muted-foreground text-center">Cargando...</p>
        </div>
      ) : (
        <DataTable
          columns={columns}
          data={tomes}
          filterColumnId="name"
          filterPlaceholder="Filtrar por nombre de libro o tomo..."
          facetedFilters={statusFilters}
          initialSorting={initialSorting}
        />
      )}

      {/* ... (Modales de diálogo no cambian) ... */}
      <AlertDialog
        open={!!tomeToFinalize}
        onOpenChange={(open) => {
          if (!open) {
            setTomeToFinalize(null);
            setConfirmationText("");
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

      {/* ... (Resto de modales) ... */}
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

      <AlertDialog
        open={!!tomeToDelete}
        // ✅ 2. Actualizamos onOpenChange para que limpie el texto
        onOpenChange={(open) => {
          if (!open) {
            setTomeToDelete(null);
            setConfirmationText("");
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar este tomo?</AlertDialogTitle>
            <AlertDialogDescription>
              Vas a eliminar permanentemente el tomo{" "}
              <strong>"{tomeToDelete?.name}"</strong>. Esta acción no se puede
              deshacer.
              {/* ✅ 3. Añadimos la instrucción */}
              <br />
              Para confirmar, por favor escribe <strong>ELIMINAR</strong> en el
              campo de abajo.
            </AlertDialogDescription>
          </AlertDialogHeader>

          {/* ✅ 4. Añadimos el campo de Input */}
          <div className="py-2">
            <Label
              htmlFor="confirm-text-delete"
              className="text-muted-foreground"
            >
              Escribe "ELIMINAR" para confirmar
            </Label>
            <Input
              id="confirm-text-delete"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              className="mt-2"
              autoComplete="off"
              autoFocus
            />
          </div>

          {/* ✅ 5. Convertimos AlertDialogAction en Button y añadimos 'disabled' */}
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleDelete}
              disabled={confirmationText !== "ELIMINAR"}
            >
              Sí, eliminar
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
