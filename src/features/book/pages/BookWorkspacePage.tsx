// filepath: src/features/book/pages/BookWorkspacePage.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import { ChevronLeft, PanelRightOpen, X, RefreshCw } from "lucide-react";
import { createAct, getBookById, updateBook } from "../api/book";
import { type Book, type Act } from "@/types"; // ✅ Se importa el tipo 'Act'
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

const recalculateNumbers = (bookState: Book): Book => {
  const recalculatedActs = bookState.acts?.map((act, actIndex) => {
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

  return { ...bookState, acts: recalculatedActs };
};

export const BookWorkspacePage = () => {
  const navigate = useNavigate();
  const { bookId } = useParams<{ bookId: string }>();
  const location = useLocation();

  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  

  const previewKey = book
    ? book.lastModified + JSON.stringify(book.pdfSettings)
    : "";

  const [currentView, setCurrentView] = useState<WorkspaceView>(() => {
    const initialActId = location.state?.initialActId;
    const initialDetailView = location.state?.initialDetailView;
    const initialAgreementId = initialDetailView?.type === 'agreement-editor'
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
    if (bookId) {
      const foundBook = getBookById(bookId);
      if (foundBook) {
        setBook(foundBook);
      } else {
        navigate("/books");
      }
      setIsLoading(false);
    }
  }, [bookId, navigate]);

  // ✅ FUNCIÓN MEJORADA: Ahora actualiza cualquier parte del libro
  const handleBookUpdate = (updatedBookData: Partial<Book>) => {
    setBook((prevBook) => {
      if (!prevBook) return null;

      let newBook = {
        ...prevBook,
        ...updatedBookData, 
        lastModified: new Date().toISOString(),
      };

      if (updatedBookData.acts) {
        newBook = recalculateNumbers(newBook);
      }

      console.log("=== PAYLOAD COMPLETO DEL LIBRO ===");
      console.log(JSON.stringify(newBook, null, 2));

      // 🔍 Tamaño aproximado del payload
      const payloadSize = new Blob([JSON.stringify(newBook)]).size;
      console.log(
        `📦 Tamaño del payload: ${(payloadSize / 1024).toFixed(2)} KB`
      );

      if (bookId) {
        updateBook(bookId, newBook);
      }
      return newBook;
    });
    setHasUnsavedChanges(true);
  };

  // ✅ NUEVA FUNCIÓN: Actualiza un acta específica dentro del libro en tiempo real
  const handleActUpdate = (updatedAct: Act) => {
    setBook((prevBook) => {
      if (!prevBook || !prevBook.acts) return prevBook;

      const updatedActs = prevBook.acts.map((act) =>
        act.id === updatedAct.id ? updatedAct : act
      );

      const newBook = {
        ...prevBook,
        acts: updatedActs,
        lastModified: new Date().toISOString(),
      };

      if (bookId) {
        updateBook(bookId, newBook);
      }

      return newBook;
    });
    setHasUnsavedChanges(true);
  };

  const handleCreateAct = () => {
    if (!bookId) return;
    const newAct = createAct(bookId);
    if (newAct) {
      const updatedBook = getBookById(bookId);
      if (updatedBook) {
        setBook(updatedBook);
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
    setBook((prevBook) => {
      if (!prevBook || !prevBook.acts) return prevBook;

      // 1. Obtener el orden visual
      const reorderedActs = reorderArray(prevBook.acts, actId, direction);

      // 2. Recalcular números y nombres
      const newState = recalculateNumbers({ ...prevBook, acts: reorderedActs });

      // 3. Guardar en la "API"
      if (bookId) {
        updateBook(bookId, newState);
      }

      // 4. Actualizar la UI
      return newState;
    });
    setHasUnsavedChanges(true);
  };

  if (isLoading || !book) {
    return (
      <div className="flex justify-centers items-center">
        Cargando espacio de trabajo...
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="shrink-0 p-3 border-b bg-background flex justify-between items-center">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" onClick={handleBackClick}>
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <h2 className="text-lg font-semibold truncate" title={book.name}>
            {book.name}
            {hasUnsavedChanges && (
              <span className="text-orange-500 ml-2">•</span>
            )}
          </h2>
        </div>

        <Sheet>
          <SheetTrigger asChild className="gap-0!">
            <Button variant="outline" className="shadow-none">
              <PanelRightOpen className="mr-2 h-4 w-4" />
              Vista Previa (PDF)
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-[800px] p-0 flex flex-col">
            <SheetHeader className="p-4 border-b flex flex-row items-center justify-between">
              <SheetTitle>Vista Previa del Libro (PDF)</SheetTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleBookUpdate({})} // Recarga forzando actualización
              >
                <RefreshCw className="mr-2 h-4 w-4" />
                Recargar
              </Button>
            </SheetHeader>

            <div className="flex-1 overflow-hidden">
              <BookPdfPreview key={previewKey} book={book} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex flex-1 min-h-0">
        <div className="w-[300px] border-r shrink-0 overflow-y-auto bg-white">
          <BookSidebarNav
            acts={book.acts || []}
            currentView={currentView}
            onViewChange={setCurrentView}
          />
        </div>

        <div className="flex-1 flex min-w-0">
          <BookEditor
            book={book}
            currentView={currentView}
            setCurrentView={setCurrentView}
            onUpdateBook={handleBookUpdate}
            onUpdateAct={handleActUpdate} // ✅ Pasa la nueva función al editor
            onCreateActa={handleCreateAct}
            setHasUnsavedChanges={setHasUnsavedChanges}
            onReorderAct={handleReorderAct} // ✅ Pasar la nueva prop
          />
        </div>
      </div>

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
              ¿Deseas salir de <span>{book.name}</span>?
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
