// filepath: src/features/book/components/BookEditor.tsx
import { type Book, type Agreement } from "@/types";
import { type WorkspaceView } from "../types";
import { BookCoverForm } from "./BookCoverForm";
import { ActEditor } from "@/features/act/components/ActEditor";
import { AgreementEditor } from "@/features/agreement/components/AgreementEditor";
import { AgreementList } from "@/features/agreement/components/AgreementList";
import { cn } from "@/lib/utils";
import { ActList } from "@/features/act/components/ActList";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { numberToWords } from "@/lib/textUtils";
import { BookPdfSettingsForm } from "./BookPdfSettingsForm";

interface BookEditorProps {
  book: Book;
  currentView: WorkspaceView;
  setCurrentView: (view: WorkspaceView) => void;
  onUpdateBook: (updatedBookData: Partial<Book>) => void;
  onCreateActa: () => void;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
}

export const BookEditor = ({
  book,
  currentView,
  setCurrentView,
  onUpdateBook,
  onCreateActa,
  setHasUnsavedChanges,
}: BookEditorProps) => {
  const [isDetailPanelVisible, setIsDetailPanelVisible] = useState(true);

  const handleAddAgreement = (actId: string) => {
    const act = book.acts?.find((a) => a.id === actId);
    if (!act) return;

    const now = new Date().toISOString();
    const currentUser = "Usuario Actual";
    const agreementNumber = (act.agreements || []).length + 1;

    const newAgreement: Agreement = {
      id: crypto.randomUUID(),
      name: `Acuerdo número ${numberToWords(agreementNumber)}`,
      content: "",
      actId: act.id,
      actName: act.name,
      bookId: book.id,
      bookName: book.name,
      createdAt: now,
      createdBy: currentUser,
      lastModified: now,
      modifiedBy: currentUser,
    };

    const updatedAgreements = [...(act.agreements || []), newAgreement];

    const updatedActs =
      book.acts?.map((a) =>
        a.id === actId
          ? {
              ...a,
              agreements: updatedAgreements,
              agreementsCount: updatedAgreements.length,
            }
          : a
      ) || [];
    onUpdateBook({ acts: updatedActs });

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

    const now = new Date().toISOString();
    const currentUser = "Usuario Actual";

    const agreementWithTracking: Agreement = {
      ...updatedAgreement,
      // ✅ ACTUALIZANDO CAMPOS DE RASTREO
      lastModified: now,
      modifiedBy: currentUser,
    };

    const updatedActs = book.acts?.map((act) => {
      if (act.id === currentView.activeActId) {
        const updatedAgreements = act.agreements.map((agr) =>
          agr.id === agreementWithTracking.id ? agreementWithTracking : agr
        );
        return { ...act, agreements: updatedAgreements };
      }
      return act;
    });
    onUpdateBook({ acts: updatedActs });
  };

  const isAgreementFocusMode =
    currentView.main.type === "act-edit" &&
    currentView.detail.type === "agreement-editor";

  const renderMainColumn = () => {
    switch (currentView.main.type) {
      case "cover":
        return (
          <BookCoverForm
            book={book}
            onDone={(data) => {
              onUpdateBook(data);
              setCurrentView({
                ...currentView,
                main: { type: "act-list" },
              });
            }}
          />
        );

      case "act-edit": {
        const { actId } = currentView.main;
        const act = book.acts?.find((a) => a.id === actId);
        if (!act) return <div className="p-4">Acta no encontrada.</div>;
        return (
          <ActEditor
            key={act.id}
            act={act}
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
            onBackToList={() => {
              setCurrentView({
                main: { type: "act-list" },
                detail: { type: "none" },
                activeActId: null,
              });
            }}
            isAgreementsPanelVisible={isDetailPanelVisible}
            setHasUnsavedChanges={setHasUnsavedChanges}
          />
        );
      }

      case "pdf-settings":
        return (
          <BookPdfSettingsForm
            book={book}
            onUpdateSettings={(settings) => {
              onUpdateBook({ pdfSettings: settings });
            }}
          />
        );

      case "act-list":
      default:
        return (
          <ActList
            acts={book.acts || []}
            onCreateAct={onCreateActa}
            onEditAct={(actId) =>
              setCurrentView({
                main: { type: "act-edit", actId },
                detail: { type: "agreement-list" },
                activeActId: actId,
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
        const { agreementId } = currentView.detail;
        const agreement = act.agreements.find((agr) => agr.id === agreementId);
        const agreementIndex = act.agreements.findIndex(
          (agr) => agr.id === agreementId
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
          <AgreementEditor
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
            setHasUnsavedChanges={setHasUnsavedChanges}
          />
        );
      }
      case "agreement-list":
      default:
        return (
          <AgreementList
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
