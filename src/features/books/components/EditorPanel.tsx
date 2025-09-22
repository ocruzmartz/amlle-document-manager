// src/features/books/components/EditorPanel.tsx

import { type Book, type Act, type Agreement } from "@/types";
import { type WorkspaceView } from "@/features/books/types"; // ✅ 1. Ruta de importación corregida
import { BookCoverEditor } from "./BookCoverEditor";
import { ActsManager } from "@/features/acts/components/ActasManager"; // ✅ 2. Nombre corregido
import { ActWorkspace } from "@/features/acts/components/ActasWorkspace"; // ✅ 2. Nombre corregido
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AgreementWorkspace } from "@/features/agreements/components/AgreementWorkspace";
import { capitalize, numberToWords } from "@/lib/textUtils";
import { AgreementsManager } from "@/features/agreements/components/AgreementsManager";

interface EditorPanelProps {
  book: Book;
  currentView: WorkspaceView;
  setCurrentView: (view: WorkspaceView) => void;
  onUpdateBook: (updatedBookData: Partial<Book>) => void;
  onCreateMinute: () => void;
}

export const EditorPanel = ({
  book,
  currentView,
  setCurrentView,
  onUpdateBook,
  onCreateMinute,
}: EditorPanelProps) => {
  const handleCreateAndEdit = () => {
    onCreateMinute();

    setTimeout(() => {
      const lastActa = book.acts?.[book.acts.length - 1];
      if (lastActa) {
        setCurrentView({ type: "acta-edit", actaId: lastActa.id });
      }
    }, 100);
  };

  const handleAddAgreement = (actId: string) => {
    const act = book.acts?.find((a) => a.id === actId);
    if (!act) return;

    const newAgreementNumber = (act.agreements?.length || 0) + 1;
    const newAgreement: Agreement = {
      id: crypto.randomUUID(),
      content: `<p><strong>Acuerdo número ${capitalize(
        numberToWords(newAgreementNumber)
      )}:</strong></p>`,
    };

    const updatedAgreements = [...(act.agreements || []), newAgreement];

    const updatedActs =
      book.acts?.map((a) =>
        a.id === actId ? { ...a, agreements: updatedAgreements } : a
      ) || [];

    onUpdateBook({
      ...book,
      acts: updatedActs,
      lastModified: new Date().toISOString(),
    });

    // Navegar directamente al editor del nuevo acuerdo
    setCurrentView({
      type: "agreement-editor",
      actId: actId,
      agreementId: newAgreement.id,
    });
  };

  const handleUpdateAgreement = (
    actId: string,
    updatedAgreement: Agreement
  ) => {
    const updatedActs = book.acts?.map((act) => {
      if (act.id === actId) {
        const updatedAgreements = act.agreements.map((agr) =>
          agr.id === updatedAgreement.id ? updatedAgreement : agr
        );
        return { ...act, agreements: updatedAgreements };
      }
      return act;
    });

    onUpdateBook({ acts: updatedActs });
  };

  const renderView = () => {
    switch (currentView.type) {
      case "cover":
        return (
          <BookCoverEditor
            book={book}
            onSave={(data) => {
              onUpdateBook(data);
              setCurrentView({ type: "acta-list" });
            }}
          />
        );

      case "acta-edit":
        if (currentView.actaId) {
          const acta = book.acts?.find((a) => a.id === currentView.actaId);
          if (acta) {
            return (
              <ErrorBoundary>
                <ActWorkspace // ✅ 2. Nombre de componente corregido
                  act={acta}
                  onUpdateAct={(updatedActa: Act) => {
                    const updatedActs =
                      book.acts?.map((a) =>
                        a.id === updatedActa.id ? updatedActa : a
                      ) || [];
                    // ✅ Actualizado para pasar solo los cambios
                    onUpdateBook({ acts: updatedActs });
                  }}
                  onDoneEditing={() => setCurrentView({ type: "acta-list" })}
                  onManageAgreements={(actId) =>
                    setCurrentView({ type: "agreement-list", actId })
                  }
                />
              </ErrorBoundary>
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
          <ActsManager // ✅ 2. Nombre de componente corregido
            acts={book.acts || []}
            onCreateAct={handleCreateAndEdit}
            onEditAct={(actaId: string) =>
              setCurrentView({ type: "acta-edit", actaId })
            }
          />
        );

      case "agreement-list": {
        const act = book.acts?.find((a) => a.id === currentView.actId);
        if (!act) return <div>Acta no encontrada...</div>;

        return (
          <AgreementsManager
            act={act}
            onAddAgreement={() => handleAddAgreement(act.id)}
            onEditAgreement={(agreementId) =>
              setCurrentView({
                type: "agreement-editor",
                actId: act.id,
                agreementId,
              })
            }
            onBackToAct={() =>
              setCurrentView({ type: "acta-edit", actaId: act.id })
            }
          />
        );
      }

      case "agreement-editor": {
        const act = book.acts?.find((a) => a.id === currentView.actId);
        const agreement = act?.agreements.find(
          (agr) => agr.id === currentView.agreementId
        );
        const agreementIndex = act?.agreements.findIndex(
          (agr) => agr.id === currentView.agreementId
        );

        if (!act || !agreement || agreementIndex === undefined) {
          return <div>Acuerdo no encontrado...</div>;
        }

        return (
          <AgreementWorkspace
            agreement={agreement}
            agreementNumber={agreementIndex + 1}
            // ✅ Conectado a la nueva lógica de actualización en tiempo real
            onUpdate={(updatedAgreement) =>
              handleUpdateAgreement(act.id, updatedAgreement)
            }
            onBack={() =>
              setCurrentView({ type: "agreement-list", actId: act.id })
            }
          />
        );
      }

      default:
        return (
          <div className="p-8 text-center">
            <p className="text-gray-500">Vista no implementada...</p>
          </div>
        );
    }
  };

  return <div className="h-full">{renderView()}</div>;
};
