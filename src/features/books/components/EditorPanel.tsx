// filepath: src/features/books/components/EditorPanel.tsx
import { type Book, type Agreement } from "@/types";
import { type WorkspaceView } from "../types";
import { BookCoverEditor } from "./BookCoverEditor";
import { ActWorkspace } from "@/features/acts/components/ActasWorkspace";
import { AgreementWorkspace } from "@/features/agreements/components/AgreementWorkspace";
import { AgreementsManager } from "@/features/agreements/components/AgreementsManager";
import { capitalize, numberToWords } from "@/lib/textUtils";
import { cn } from "@/lib/utils";
import { ActsManager } from "@/features/acts/components/ActasManager";
import { useState } from "react";
import { Button } from "@/components/ui/button";
interface EditorPanelProps {
  book: Book;
  currentView: WorkspaceView;
  setCurrentView: (view: WorkspaceView) => void;
  onUpdateBook: (updatedBookData: Partial<Book>) => void;
  onCreateActa: () => void;
}

export const EditorPanel = ({
  book,
  currentView,
  setCurrentView,
  onUpdateBook,
  onCreateActa,
}: EditorPanelProps) => {
  const [isDetailPanelVisible, setIsDetailPanelVisible] = useState(true);

  const handleAddAgreement = (actId: string) => {
    const act = book.acts?.find((a) => a.id === actId);
    if (!act) return;

    const newAgreement: Agreement = {
      id: crypto.randomUUID(),
      content: "",
    };

    const updatedAgreements = [...(act.agreements || []), newAgreement];

    const updatedActs =
      book.acts?.map((a) =>
        a.id === actId ? { ...a, agreements: updatedAgreements } : a
      ) || [];

    onUpdateBook({
      acts: updatedActs,
    });

    setCurrentView({
      ...currentView,
      detail: {
        type: "agreement-editor",
        agreementId: newAgreement.id,
      },
    });
  };

  const handleUpdateAgreement = (updatedAgreement: Agreement) => {
    if (!currentView.activeActId) return;

    const updatedActs = book.acts?.map((act) => {
      if (act.id === currentView.activeActId) {
        const updatedAgreements = act.agreements.map((agr) =>
          agr.id === updatedAgreement.id ? updatedAgreement : agr
        );
        return { ...act, agreements: updatedAgreements };
      }
      return act;
    });
    onUpdateBook({ acts: updatedActs });
  };

  const isAgreementFocusMode =
    currentView.main.type === "acta-edit" &&
    currentView.detail.type === "agreement-editor";

  const renderMainColumn = () => {
    switch (currentView.main.type) {
      case "cover":
        return (
          <BookCoverEditor
            book={book}
            onDone={(data) => {
              onUpdateBook(data);
              setCurrentView({
                ...currentView,
                main: { type: "acta-list" },
              });
            }}
          />
        );

      case "acta-edit": {
        const acta = book.acts?.find((a) => a.id === currentView.main.actaId);
        if (!acta) return <div className="p-4">Acta no encontrada.</div>;
        return (
          <ActWorkspace
            key={acta.id}
            act={acta}
            onUpdateAct={(updatedActa) => {
              const updatedActs =
                book.acts?.map((a) =>
                  a.id === updatedActa.id ? updatedActa : a
                ) || [];
              onUpdateBook({ acts: updatedActs });
            }}
            onToggleAgreements={() =>
              setIsDetailPanelVisible(!isDetailPanelVisible)
            }
            isAgreementsPanelVisible={isDetailPanelVisible}
          />
        );
      }

      case "acta-list":
      default:
        return (
          <ActsManager
            acts={book.acts || []}
            onCreateAct={onCreateActa}
            onEditAct={(actaId) =>
              setCurrentView({
                main: { type: "acta-edit", actaId },
                detail: { type: "agreement-list" },
                activeActId: actaId,
              })
            }
          />
        );
    }
  };

  const renderDetailColumn = () => {
    const act = book.acts?.find((a) => a.id === currentView.activeActId);
    if (!act) return null;

    switch (currentView.detail.type) {
      case "agreement-editor": {
        const agreement = act.agreements.find(
          (agr) => agr.id === currentView.detail.agreementId
        );
        const agreementIndex = act.agreements.findIndex(
          (agr) => agr.id === currentView.detail.agreementId
        );
        if (agreement === undefined || agreementIndex === -1) {
          return (
            <div className="flex flex-col mt-70 justify-center items-center gap-2 ">
              <h1 className="text-lg font-semibold text-center">
                Parece que hubo un error.
              </h1>
              <h2 className="mb-4">
                El acuerdo podría haber sido eliminado o no estar disponible.
              </h2>
              <Button
                variant="outline"
                onClick={() =>
                  setCurrentView({
                    ...currentView,
                    detail: { type: "agreement-list" },
                  })
                }
              >
                Regresar
              </Button>
            </div>
          );
        }
        return (
          <AgreementWorkspace
            key={agreement.id}
            agreement={agreement}
            agreementNumber={agreementIndex + 1}
            onUpdate={handleUpdateAgreement}
            onBack={() =>
              setCurrentView({
                ...currentView,
                detail: { type: "agreement-list" },
              })
            }
          />
        );
      }
      case "agreement-list":
      default:
        return (
          <AgreementsManager
            act={act}
            onAddAgreement={() => handleAddAgreement(act.id)}
            onEditAgreement={(agreementId) =>
              setCurrentView({
                ...currentView,
                detail: {
                  type: "agreement-editor",
                  agreementId: agreementId,
                },
              })
            }
          />
        );
    }
  };

  return (
    <div className="flex flex-1 min-h-0">
      <div
        className={cn(
          "flex-1 min-w-0 border-r overflow-y-auto",
          isAgreementFocusMode && "hidden"
        )}
      >
        {renderMainColumn()}
      </div>

      {currentView.activeActId && isDetailPanelVisible && (
        <div
          className={cn(
            "w-[500px] flex-shrink-0 bg-white overflow-y-auto",
            isAgreementFocusMode && "w-full flex-1"
          )}
        >
          {renderDetailColumn()}
        </div>
      )}
    </div>
  );
};
