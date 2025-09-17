import { type Book, type WorkspaceView } from "@/types";
import { BookCoverEditor } from "./BookCoverEditor";
import { ActasManager } from "@/features/acts/components/ActasManager";
import { ActaWorkspace } from "@/features/acts/components/ActasWorkspace";

interface EditorPanelProps {
  book: Book;
  currentView: WorkspaceView;
  setCurrentView: (view: WorkspaceView) => void;
  onUpdateBook: (updatedBook: Book) => void;
  onCreateMinute: () => void;
}

export const EditorPanel = ({
  book,
  currentView,
  setCurrentView,
  onUpdateBook,
  onCreateMinute,
}: EditorPanelProps) => {
  // Función wrapper que maneja la creación Y el cambio de vista
  const handleCreateAndEdit = () => {
    onCreateMinute(); // Crear la nueva acta

    // ✅ Usar setTimeout para asegurar que el estado se actualice
    setTimeout(() => {
      const lastActa = book.actas?.[book.actas.length - 1];
      if (lastActa) {
        // ✅ Usar 'acta-edit' con 'actaId'
        setCurrentView({ type: "acta-edit", actaId: lastActa.id });
      }
    }, 100);
  };

  const renderView = () => {
    switch (currentView.type) {
      case "cover":
        return (
          <BookCoverEditor
            book={book}
            onSave={(data) => {
              const updatedBook = {
                ...book,
                ...data,
                lastModified: new Date().toISOString(),
              };
              onUpdateBook(updatedBook);
              setCurrentView({ type: "acta-list" });
            }}
          />
        );

      case "acta-edit": // ✅ Tipo correcto
        if (currentView.actaId) {
          // ✅ Usar actaId
          const acta = book.actas?.find((a) => a.id === currentView.actaId);
          if (acta) {
            return (
              <ActaWorkspace
                act={acta}
                onUpdateActa={(updatedActa) => {
                  const updatedActas =
                    book.actas?.map((a) =>
                      a.id === updatedActa.id ? updatedActa : a
                    ) || [];

                  const updatedBook = {
                    ...book,
                    actas: updatedActas,
                    lastModified: new Date().toISOString(),
                  };
                  onUpdateBook(updatedBook);
                }}
              />
            );
          }
        }
        return (
          <div className="p-8 text-center">
            <p className="text-gray-500">Acta no encontrada</p>
            <button
              onClick={() => setCurrentView({ type: "acta-list" })}
              className="mt-4 text-blue-600 hover:text-blue-800 underline"
            >
              Volver a la lista de actas
            </button>
          </div>
        );

      case "acta-list":
        return (
          <ActasManager
            acts={book.actas || []} // ✅ Verificar que ActasManager use 'acts'
            onCreateAct={handleCreateAndEdit}
            onEditAct={(actaId: string) => setCurrentView({ type: "acta-edit", actaId })}
          />
        );

      // ✅ Casos adicionales si los necesitas
      case "acta":
        return (
          <div className="p-8">
            <p>Vista de acta: {currentView.data.name}</p>
          </div>
        );

      case "acta-editor":
        return (
          <ActaWorkspace
            act={currentView.data}
            onUpdateActa={(updatedActa) => {
              const updatedActas =
                book.actas?.map((a) =>
                  a.id === updatedActa.id ? updatedActa : a
                ) || [];

              const updatedBook = {
                ...book,
                actas: updatedActas,
                lastModified: new Date().toISOString(),
              };
              onUpdateBook(updatedBook);
            }}
          />
        );

      default:
        return (
          <div className="p-8 text-center">
            <p className="text-gray-500">
              Vista no implementada: {currentView.type}
            </p>
          </div>
        );
    }
  };

  return <div className="h-full">{renderView()}</div>;
};
