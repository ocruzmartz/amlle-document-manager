// filepath: src/features/books/pages/BookWorkspacePage.tsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { ChevronLeft, PanelRightOpen, X } from "lucide-react";
import { createActaInBook, getBookById } from "../lib/bookService";
import { type Book } from "@/types";
import { type WorkspaceView } from "../types/index";
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
import { BookStructureNav } from "../components/BookStructureNav";
import { EditorPanel } from "../components/EditorPanel";
import { PreviewPanel } from "../components/PreviewPanel";

export const BookWorkspacePage = () => {
  const navigate = useNavigate();
  const { bookId } = useParams<{ bookId: string }>();

  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [currentView, setCurrentView] = useState<WorkspaceView>({
    main: { type: "cover" },
    detail: { type: "none" },
    activeActId: null,
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

  const handleBookUpdate = (updatedBookData: Partial<Book>) => {
    setBook((prevBook) => {
      if (!prevBook) return null;
      const newBook = {
        ...prevBook,
        ...updatedBookData,
        lastModified: new Date().toISOString(),
      };
      return newBook;
    });
    // Marcar que hay cambios sin guardar
    setHasUnsavedChanges(true);
  };

  const handleCreateActa = () => {
    if (!bookId) return;
    const newActa = createActaInBook(bookId);
    if (newActa) {
      const updatedBook = getBookById(bookId);
      if (updatedBook) {
        setBook(updatedBook);
        setCurrentView({
          main: { type: "acta-edit", actaId: newActa.id },
          detail: { type: "agreement-list" },
          activeActId: newActa.id,
        });
        // Marcar que hay cambios sin guardar
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

  const handleCancelExit = () => {
    setShowExitDialog(false);
  };

  // Guardar cambios automáticamente (opcional)
  const handleSaveAndExit = () => {
    // Aquí puedes agregar lógica para guardar automáticamente
    // Por ejemplo, llamar a una función de guardado
    setHasUnsavedChanges(false);
    setShowExitDialog(false);
    navigate("/books");
  };

  if (isLoading || !book) {
    return <div>Cargando espacio de trabajo...</div>;
  }

  return (
    <div className="flex flex-col h-screen">
      {/* Header */}
      <div className="flex-shrink-0 p-3 border-b bg-background flex justify-between items-center">
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
          <SheetTrigger asChild>
            <Button variant="outline" className="shadow-none">
              <PanelRightOpen className="mr-2 h-4 w-4" />
              Vista Previa (PDF
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-[800px] p-0 flex flex-col">
            <SheetHeader className="p-4 border-b">
              <SheetTitle>Vista Previa del Libro (PDF)</SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-hidden">
              <PreviewPanel key={book.lastModified} book={book} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      {/* ✅ 2. Contenedor de las 3 columnas. `min-h-0` es la clave para que el flexbox
          respete los límites de altura y permita el scroll en los hijos. */}
      <div className="flex flex-1 min-h-0">
        {/* --- Columna 1: Navegación con su propio scroll --- */}
        <div className="w-[300px] border-r flex-shrink-0 overflow-y-auto bg-white">
          <BookStructureNav
            acts={book.acts || []}
            currentView={currentView}
            onViewChange={setCurrentView}
          />
        </div>

        {/* --- Contenedor para Columnas 2 y 3 --- */}
        <div className="flex-1 flex min-w-0">
          <EditorPanel
            book={book}
            currentView={currentView}
            setCurrentView={setCurrentView}
            onUpdateBook={handleBookUpdate}
            onCreateActa={handleCreateActa}
          />
        </div>
      </div>

      {/* Modal de confirmación para salir */}
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
