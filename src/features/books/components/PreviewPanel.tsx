import { useState, useEffect } from "react";
import { type Book } from "@/types";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { BookPageRenderer } from "./BookPageRenderer";

interface PreviewPanelProps {
  book: Book;
}

export const PreviewPanel = ({ book }: PreviewPanelProps) => {
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(2); // Mínimo: portada + índice

  console.log("🖼️ PreviewPanel recibió libro:", book);

  // ✅ Calcular total de páginas dinámicamente (estimado)
  useEffect(() => {
    const calculateTotalPages = () => {
      let total = 2; // Portada + Índice
      
      if (book.actas && book.actas.length > 0) {
        // Estimación: cada acta puede ocupar 1-3 páginas dependiendo del contenido
        book.actas.forEach(acta => {
          const contentLength = (acta.bodyContent?.length || 0) + 
                               (acta.agreements?.join('').length || 0);
          
          // Estimación basada en longitud de contenido
          const estimatedPages = Math.max(1, Math.ceil(contentLength / 2000));
          total += estimatedPages;
        });
        
        total += 1; // Página de firmas
      }
      
      return total;
    };

    setTotalPages(calculateTotalPages());
  }, [book]);

  // ✅ Ajustar página actual si se eliminaron páginas
  useEffect(() => {
    if (currentPage >= totalPages && totalPages > 0) {
      setCurrentPage(Math.max(0, totalPages - 1));
    }
  }, [totalPages, currentPage]);

  const goToNextPage = () => setCurrentPage(prev => Math.min(prev + 1, totalPages - 1));
  const goToPrevPage = () => setCurrentPage(prev => Math.max(prev - 1, 0));

  return (
    <section className="hidden lg:flex flex-col bg-muted/40 overflow-hidden h-full">
      <div className="p-4 flex items-center justify-between border-b">
        <h3 className="text-md font-semibold">Vista Previa del Libro</h3>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={goToPrevPage} disabled={currentPage === 0}>
            <ChevronLeft className="h-4 w-4" /> Anterior
          </Button>
          <span className="text-sm text-muted-foreground min-w-[100px] text-center">
            {currentPage + 1} / {totalPages}+
          </span>
          <Button variant="outline" size="sm" onClick={goToNextPage} disabled={false}>
            Siguiente <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-auto p-4 bg-gray-100">
        <BookPageRenderer 
          book={book} 
          currentPageIndex={currentPage}
        />
      </div>
    </section>
  );
};