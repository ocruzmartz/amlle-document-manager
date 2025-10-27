// filepath: src/features/book/components/BookEditor.tsx
import { type Book, type Agreement, type Act } from "@/types";
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

interface BookEditorProps {
  book: Book;
  currentView: WorkspaceView;
  setCurrentView: (view: WorkspaceView) => void;
  onUpdateBook: (updatedBookData: Partial<Book>) => void;
  onCreateActa: () => void;
  onUpdateAct: (updatedAct: Act) => void;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
  onReorderAct: (actId: string, direction: "up" | "down") => void;
}

export const BookEditor = ({
  book,
  currentView,
  setCurrentView,
  onUpdateBook,
  onCreateActa,
  setHasUnsavedChanges,
  onReorderAct,
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
      activeAgreementId: newAgreement.id,
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

  const handleReorderAgreement = (
    agreementId: string,
    direction: "up" | "down"
  ) => {
    if (!currentView.activeActId) return;

    const updatedActs = book.acts?.map((act) => {
      if (act.id === currentView.activeActId) {
        const reorderedAgreements = reorderArray(
          act.agreements,
          agreementId,
          direction
        );
        return { ...act, agreements: reorderedAgreements };
      }
      return act;
    });

    setCurrentView({ ...currentView, activeAgreementId: agreementId });
    onUpdateBook({ acts: updatedActs });
    setHasUnsavedChanges(true);
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
              const updatePayload: Partial<Book> = {
                name: data.name,
                tome: data.tome,
                authorizationDate: data.authorizationDate.toISOString(), // Convertir aquí
              };
              onUpdateBook(updatePayload);
              setCurrentView({
                ...currentView,
                main: { type: "act-list" },
                detail: { type: "none" }, // Reset detail view
                activeActId: null, // No act is active when showing the list
                activeAgreementId: null, // ✅ Add this line
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
                activeAgreementId: null,
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

              setCurrentView({
                main: { type: "act-list" },
                detail: { type: "none" },
                activeActId: null,
                activeAgreementId: null, // ✅ Add if navigating
              });
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
                activeAgreementId: null,
              })
            }
            onReorderAct={(actId, direction) => {
              setCurrentView({
                ...currentView,
                activeActId: actId,
                activeAgreementId: null,
              });
              onReorderAct(actId, direction);
            }}
            activeActId={currentView.activeActId}
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
              // ✅ Poner la lógica directamente aquí
              setCurrentView({
                ...currentView,
                detail: { type: "agreement-list" },
                // Mantenemos el activeAgreementId que ya está en currentView
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
                activeAgreementId: agreementId,
              })
            }
            onReorderAgreement={(agreementId, direction) => {
              // ✅ Actualizar vista al reordenar acuerdo
              setCurrentView({
                ...currentView,
                activeAgreementId: agreementId,
              });
              handleReorderAgreement(agreementId, direction);
            }}
            activeAgreementId={currentView.activeAgreementId}
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
            "w-[500px] shrink-0 bg-white overflow-y-auto",
            isAgreementFocusMode && "w-full flex-1"
          )}
        >
          {renderDetailColumn()}
        </div>
      )}
    </div>
  );
};
