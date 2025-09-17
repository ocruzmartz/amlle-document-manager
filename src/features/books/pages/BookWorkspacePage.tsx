import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router";
import { createActaInBook, getBookById } from "../lib/bookService";
import { type Book } from "@/types";
import { type WorkspaceView } from "@/types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

import { BookStructureNav } from "../components/BookStructureNav";
import { EditorPanel } from "../components/EditorPanel"; // <-- La pieza clave
import { PreviewPanel } from "../components/PreviewPanel";

export const BookWorkspacePage = () => {
  const navigate = useNavigate();
  const { bookId } = useParams<{ bookId: string }>();

  const [book, setBook] = useState<Book | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [currentView, setCurrentView] = useState<WorkspaceView>({
    type: "cover",
  });
  // const [isIndexOpen, setIsIndexOpen] = useState(false);

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

  const handleBookUpdate = (updatedBook: Book) => {
    console.log("📖 Actualizando libro en página principal:", updatedBook);
    console.log("📖 Actas en el libro:", updatedBook.actas);
    setBook(updatedBook);
  };

  const handleCreateMinute = () => {
    if (!bookId) return;

    // ✅ Ya no necesitamos pasar name, se genera automáticamente
    const newActa = createActaInBook(bookId);
    if (newActa) {
      const updatedBook = getBookById(bookId);
      if (updatedBook) {
        setBook(updatedBook);
      }
    }
  };

  if (isLoading || !book) {
    return <div>Cargando espacio de trabajo...</div>;
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex-shrink-0 p-4 border-b bg-background">
        <div className="flex justify-between items-center gap-2">
          <h2 className="text-lg font-semibold truncate" title={book.name}>
            {book.name}
          </h2>
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" className="flex-shrink-0 cursor-pointer">
                  Ver Indice
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[350px] p-0">
                <SheetHeader className="p-4 border-b text-left">
                  <SheetTitle>Contenido</SheetTitle>
                </SheetHeader>
                <div className="p-4">
                  <BookStructureNav
                    acts={book.actas || []}
                    currentView={currentView}
                    onViewChange={setCurrentView}
                  />
                </div>
              </SheetContent>
            </Sheet>
        </div>
      </div>

      {/* Main content area */}
      <div className="flex flex-1 min-h-0">
        {/* Editor Panel */}
        <div className="flex-1 min-h-0">
          <EditorPanel
            currentView={currentView}
            setCurrentView={setCurrentView}
            book={book} // ✅ El libro actualizado
            onUpdateBook={handleBookUpdate}
            onCreateMinute={handleCreateMinute}
          />
        </div>

        <PreviewPanel book={book} /> {/* ✅ Esto debe recibir el libro actualizado */}
      </div>
    </div>
  );
};
