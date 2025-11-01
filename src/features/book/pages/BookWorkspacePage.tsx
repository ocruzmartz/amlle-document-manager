// filepath: src/features/book/pages/BookWorkspacePage.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import {
  ChevronLeft,
  PanelRightOpen,
  X,
  RefreshCw,
  PlusCircle,
  Trash,
  PenSquare,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
} from "@/components/ui/select";
import {
  createAct,
  getTomeById,
  updateTome,
  getBookById,
  createTome,
  deleteTome,
  updateBook,
} from "../api/book";
import { type Tome, type Act, type Book } from "@/types";
// ... (resto de imports sin cambios)
import { type WorkspaceView } from "../types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
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
import { Button } from "@/components/ui/button";
import { BookSidebarNav } from "../components/BookSidebarNav";
import { BookEditor } from "../components/BookEditor";
import { BookPdfPreview } from "../components/BookPdfPreview";
import { capitalize, numberToWords } from "@/lib/textUtils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

// ... (helpers reorderArray y recalculateNumbers sin cambios)
const reorderArray = <T extends { id: string }>(
  list: T[],
  itemId: string,
  direction: "up" | "down"
): T[] => {
  const index = list.findIndex((item) => item.id === itemId);
  if (index === -1) return list;

  const newIndex = direction === "up" ? index - 1 : index + 1;
  if (newIndex < 0 || newIndex >= list.length) return list;

  const result = Array.from(list);
  const [removed] = result.splice(index, 1);
  result.splice(newIndex, 0, removed);

  return result;
};

const recalculateNumbers = (tomeState: Tome): Tome => {
  const recalculatedActs = tomeState.acts?.map((act, actIndex) => {
    const newActNumber = actIndex + 1;
    const newActName = `Acta número ${capitalize(numberToWords(newActNumber))}`;

    const recalculatedAgreements = act.agreements.map(
      (agreement, agreementIndex) => {
        const newAgreementNumber = agreementIndex + 1;
        const newAgreementName = `Acuerdo número ${capitalize(
          numberToWords(newAgreementNumber)
        )}`;
        return { ...agreement, name: newAgreementName };
      }
    );

    return {
      ...act,
      actNumber: newActNumber,
      name: newActName,
      agreements: recalculatedAgreements,
    };
  });

  return { ...tomeState, acts: recalculatedActs };
};

export const BookWorkspacePage = () => {
  // ... (toda la lógica de estado y handlers sin cambios)
  const navigate = useNavigate();
  const { bookId: tomeId } = useParams<{ bookId: string }>();
  const location = useLocation();

  const [tome, setTome] = useState<Tome | null>(null);
  const [parentBook, setParentBook] = useState<Book | null>(null);

  const [isLoading, setIsLoading] = useState(true);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [isRenameBookDialogOpen, setIsRenameBookDialogOpen] = useState(false);
  const [newBookName, setNewBookName] = useState("");
  const [tomeToDelete, setTomeToDelete] = useState<Tome | null>(null);

  const previewKey = tome
    ? tome.lastModified + JSON.stringify(tome.pdfSettings)
    : "";

  const [currentView, setCurrentView] = useState<WorkspaceView>(() => {
    const initialActId = location.state?.initialActId;
    const initialDetailView = location.state?.initialDetailView;
    const initialAgreementId =
      initialDetailView?.type === "agreement-editor"
        ? initialDetailView.agreementId
        : null;
    if (initialActId) {
      return {
        main: { type: "act-edit", actId: initialActId },
        detail: initialDetailView || { type: "agreement-list" },
        activeActId: initialActId,
        activeAgreementId: initialAgreementId,
      };
    }
    return {
      main: { type: "cover" },
      detail: { type: "none" },
      activeActId: null,
      activeAgreementId: null,
    };
  });

  useEffect(() => {
    if (tomeId) {
      setIsLoading(true);
      const foundTome = getTomeById(tomeId);

      if (foundTome) {
        setTome(foundTome);

        const foundBook = getBookById(foundTome.bookId);
        if (foundBook) {
          setParentBook(foundBook);
          setNewBookName(foundBook.name);
        } else {
          console.error("Error: Tomo encontrado pero sin Libro padre.");
          navigate("/books");
        }
      } else {
        console.error("Error: Tomo no encontrado.");
        navigate("/books");
      }
      setIsLoading(false);
    }
  }, [tomeId, navigate]);

  const handleRenameBookSubmit = () => {
    if (!parentBook || !newBookName) return;

    updateBook(parentBook.id, { name: newBookName });

    setParentBook((prev) => (prev ? { ...prev, name: newBookName } : null));

    setParentBook((prev) =>
      prev
        ? {
            ...prev,
            name: newBookName,
            tomos: prev.tomos?.map((t) => ({ ...t, bookName: newBookName })),
          }
        : null
    );

    setIsRenameBookDialogOpen(false);
  };

  const handleTomeUpdate = (updatedTomeData: Partial<Tome>) => {
    setTome((prevTome) => {
      if (!prevTome) return null;

      let newTome = {
        ...prevTome,
        ...updatedTomeData,
        lastModified: new Date().toISOString(),
      };

      if (updatedTomeData.acts) {
        newTome = recalculateNumbers(newTome);
      }

      if (tomeId) {
        updateTome(tomeId, newTome);
      }
      return newTome;
    });
    setHasUnsavedChanges(true);
  };

  const handleActUpdate = (updatedAct: Act) => {
    setTome((prevTome) => {
      if (!prevTome || !prevTome.acts) return prevTome;

      const updatedActs = prevTome.acts.map((act) =>
        act.id === updatedAct.id ? updatedAct : act
      );
      handleTomeUpdate({ acts: updatedActs });
      return prevTome;
    });
  };

  const handleCreateAct = () => {
    if (!tomeId) return;
    const newAct = createAct(tomeId);
    if (newAct) {
      const updatedTome = getTomeById(tomeId);
      if (updatedTome) {
        setTome(updatedTome);
        setCurrentView({
          main: { type: "act-edit", actId: newAct.id },
          detail: { type: "agreement-list" },
          activeActId: newAct.id,
          activeAgreementId: null,
        });
        setHasUnsavedChanges(true);
      }
    }
  };

  const handleBackClick = () => {
    if (hasUnsavedChanges) {
      setShowExitDialog(true);
    } else {
      navigate("/books");
    }
  };

  const handleConfirmExit = () => {
    setShowExitDialog(false);
    navigate("/books");
  };

  const handleSaveAndExit = () => {
    setHasUnsavedChanges(false);
    setShowExitDialog(false);
    navigate("/books");
  };

  const handleReorderAct = (actId: string, direction: "up" | "down") => {
    setTome((prevTome) => {
      if (!prevTome || !prevTome.acts) return prevTome;

      const reorderedActs = reorderArray(prevTome.acts, actId, direction);
      const newState = recalculateNumbers({ ...prevTome, acts: reorderedActs });

      if (tomeId) {
        updateTome(tomeId, newState);
      }

      return newState;
    });
    setHasUnsavedChanges(true);
  };

  const handleCreateTome = () => {
    if (!parentBook) return;
    const newTomeNumber = (parentBook.tomos?.length || 0) + 1;
    const newTome = createTome(parentBook.id, {
      name: `Tomo ${newTomeNumber}`,
      tomeNumber: newTomeNumber,
    });
    navigate(`/books/${newTome.id}`);
  };

  const handleConfirmDeleteTome = () => {
    if (!tomeToDelete || !parentBook || !parentBook.tomos) return;

    // 1. Llamar a la API para eliminar
    deleteTome(tomeToDelete.id);

    // 2. Actualizar estado local
    const newTomesList = parentBook.tomos.filter(
      (t) => t.id !== tomeToDelete.id
    );
    setParentBook({ ...parentBook, tomos: newTomesList });

    // 3. Decidir a dónde navegar
    if (tomeToDelete.id === tomeId) {
      if (newTomesList.length > 0) {
        navigate(`/books/${newTomesList[0].id}`);
      } else {
        navigate("/books"); // No quedan tomos, ir a la lista
      }
    }

    setTomeToDelete(null); // Cerrar el diálogo
  };

  if (isLoading || !tome || !parentBook) {
    return (
      <div className="flex justify-center items-center h-screen">
        Cargando espacio de trabajo...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="shrink-0 p-3 border-b bg-background flex justify-between items-center">
        {/* ✅ ACTUALIZADO: Cabecera con Nombre de Libro y Selector de Tomos */}
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBackClick}
            className="shrink-0"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          {/* Nombre del Libro Padre (estático) */}
          <h2
            className="text-lg font-semibold truncate"
            title={parentBook.name}
          >
            {parentBook.name}
          </h2>

          {/* Botón para Renombrar Libro Padre */}
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7"
            onClick={() => setIsRenameBookDialogOpen(true)}
            title="Renombrar libro padre"
          >
            <PenSquare className="h-4 w-4" />
          </Button>

          {/* Separador Visual */}
          <div className="h-6 w-px bg-border mx-2"></div>

          {/* Selector de Tomos */}
          <Select
            value={tome.id}
            onValueChange={(newTomeId) => navigate(`/books/${newTomeId}`)}
          >
            <SelectTrigger className="w-auto min-w-[120px] h-9 shadow-none">
              <SelectValue placeholder="Seleccionar Tomo..." />
            </SelectTrigger>
            <SelectContent>
              {/* ✅ ACTUALIZADO: Lista de Tomos con botón de eliminar */}
              {parentBook.tomos
                ?.sort((a, b) => a.tomeNumber - b.tomeNumber)
                .map((t) => (
                  <div key={t.id} className="flex items-center pr-2">
                    <SelectItem value={t.id} className="flex-1">
                      {t.name}
                    </SelectItem>
                    {/* Botón para eliminar Tomo */}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive hover:text-destructive"
                      // Deshabilitado si es el último tomo
                      disabled={
                        parentBook.tomos && parentBook.tomos.length <= 1
                      }
                      title={
                        parentBook.tomos && parentBook.tomos.length <= 1
                          ? "No se puede eliminar el último tomo"
                          : "Eliminar tomo"
                      }
                      onClick={(e) => {
                        e.stopPropagation(); // Evitar que el select se cierre
                        setTomeToDelete(t);
                      }}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              <SelectSeparator />
              {/* Botón para añadir nuevo tomo */}
              <Button
                variant="ghost"
                className="w-full justify-start h-8 px-2"
                onClick={handleCreateTome}
              >
                <PlusCircle className="mr-2 h-4 w-4" /> Añadir Tomo
              </Button>
            </SelectContent>
          </Select>

          {hasUnsavedChanges && (
            <span
              className="text-orange-500 text-2xl"
              title="Cambios sin guardar"
            >
              •
            </span>
          )}
        </div>

        {/* ... (Resto del JSX de la cabecera sin cambios) ... */}
        <Sheet>
          <SheetTrigger asChild className="gap-0!">
            <Button variant="outline" className="shadow-none">
              <PanelRightOpen className="mr-2 h-4 w-4" />
              Vista Previa (PDF)
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-[800px] p-0 flex flex-col">
            <SheetHeader className="p-4 border-b flex flex-row items-center justify-between">
              <SheetTitle>Vista Previa del Tomo (PDF)</SheetTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleTomeUpdate({})}
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Recargar
              </Button>
            </SheetHeader>

            <div className="flex-1 overflow-hidden">
              <BookPdfPreview key={previewKey} tome={tome} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* ... (Resto del JSX del componente sin cambios) ... */}
      <div className="flex flex-1 min-h-0">
        <div className="w-[300px] border-r shrink-0 overflow-y-auto bg-white">
          <BookSidebarNav
            acts={tome.acts || []}
            currentView={currentView}
            onViewChange={setCurrentView}
          />
        </div>

        <div className="flex-1 flex min-w-0">
          <BookEditor
            tome={tome}
            currentView={currentView}
            setCurrentView={setCurrentView}
            onUpdateTome={handleTomeUpdate}
            onUpdateAct={handleActUpdate}
            onCreateActa={handleCreateAct}
            setHasUnsavedChanges={setHasUnsavedChanges}
            onReorderAct={handleReorderAct}
          />
        </div>
      </div>

      <AlertDialog
        open={isRenameBookDialogOpen}
        onOpenChange={setIsRenameBookDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Renombrar Libro Padre</AlertDialogTitle>
            <AlertDialogDescription>
              Vas a cambiar el nombre del libro contenedor (ej. "Libro de Actas
              2025"). Este cambio afectará a todos sus tomos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <Label htmlFor="book-name-input" className="mb-2 block">
              Nuevo nombre del libro
            </Label>
            <Input
              id="book-name-input"
              value={newBookName}
              onChange={(e) => setNewBookName(e.target.value)}
              className="mt-1"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRenameBookSubmit}>
              Renombrar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* ✅ AÑADIDO: Diálogo para Eliminar Tomo */}
      <AlertDialog
        open={!!tomeToDelete}
        onOpenChange={() => setTomeToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar Tomo?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres eliminar
              <strong> {tomeToDelete?.name}</strong>? Todas las actas y acuerdos
              dentro de este tomo se perderán permanentemente. Esta acción no se
              puede deshacer.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeleteTome}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Sí, eliminar tomo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-2 h-6 w-6 p-0"
              onClick={() => setShowExitDialog(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            <AlertDialogTitle>
              ¿Deseas salir de <span>{tome.name}</span>?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tienes cambios sin guardar. Si sales ahora, estos cambios se
              perderán.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={handleSaveAndExit}>
              Guardar y salir
            </Button>
            <AlertDialogAction
              onClick={handleConfirmExit}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Salir sin guardar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
