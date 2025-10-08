import { useState, useEffect } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import { ChevronLeft, PanelRightOpen, X } from "lucide-react";
import { createAct, getBookById } from "../api/book";
import { type Book } from "@/types";
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

export const BookWorkspacePage = () => {
  const navigate = useNavigate();
  const { bookId } = useParams<{ bookId: string }>();
  const location = useLocation();

  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [currentView, setCurrentView] = useState<WorkspaceView>(() => {
    const initialActId = location.state?.initialActId;
    const initialDetailView = location.state?.initialDetailView;
    if (initialActId) {
      return {
        main: { type: "act-edit", actId: initialActId },
        detail: initialDetailView || { type: "agreement-list" },
        activeActId: initialActId,
      };
    }
    return {
      main: { type: "cover" },
      detail: { type: "none" },
      activeActId: null,
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
          <SheetTrigger asChild className="gap-0!">
            <Button variant="outline" className="shadow-none">
              <PanelRightOpen className="mr-2 h-4 w-4" />
              Vista Previa (PDF)
            </Button>
          </SheetTrigger>
          <SheetContent className="w-full sm:max-w-[800px] p-0 flex flex-col">
            <SheetHeader className="border-b">
              <SheetTitle>Vista Previa del Libro (PDF)</SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-hidden">
              <BookPdfPreview key={book.lastModified} book={book} />
            </div>
          </SheetContent>
        </Sheet>
      </div>

      <div className="flex flex-1 min-h-0">
        <div className="w-[300px] border-r flex-shrink-0 overflow-y-auto bg-white">
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
            onCreateActa={handleCreateAct}
            setHasUnsavedChanges={setHasUnsavedChanges}
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
