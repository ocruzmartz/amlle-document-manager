import { type Book } from "@/types";
import { BookPageRenderer } from "./BookPageRenderer";
import { ErrorBoundary } from "@/components/ErrorBoundary";

interface PreviewPanelProps {
  book: Book;
}

export const PreviewPanel = ({ book }: PreviewPanelProps) => {
  console.log("🖼️ PreviewPanel - Libro actualizado:", book);

  return (
    <section className="hidden lg:flex flex-col bg-muted/40 overflow-hidden h-full min-w-[700px]">
      <div className="p-3 border-b bg-white/50">
        <h3 className="text-md font-semibold">Vista Previa del Libro</h3>
        <p className="text-xs text-muted-foreground mt-1">
          Vista previa en tiempo real del documento PDF • {book.acts?.length || 0} actas
        </p>
      </div>

      <div className="flex-1 overflow-hidden">
        <ErrorBoundary
          fallback={
            <div className="flex items-center justify-center h-full bg-gray-50">
              <div className="text-center p-8">
                <div className="text-red-500 mb-4">
                  <svg className="w-12 h-12 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-lg font-semibold">Error en la vista previa</h3>
                </div>
                <p className="text-gray-600 mb-4">
                  No se pudo cargar la vista previa del PDF
                </p>
                <button 
                  onClick={() => window.location.reload()}
                  className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
                >
                  Recargar página
                </button>
              </div>
            </div>
          }
        >
          <BookPageRenderer book={book} />
        </ErrorBoundary>
      </div>
    </section>
  );
};