import { type Tome, type Agreement, type Act } from "@/types";
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

// ... (helper reorderArray NO CAMBIA)
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
  tome: Tome;
  currentView: WorkspaceView;
  setCurrentView: (view: WorkspaceView) => void;
  onUpdateTome: (updatedTomeData: Partial<Tome>) => void;
  onCreateActa: () => void;
  onUpdateAct: (updatedAct: Act) => void;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
  onReorderAct: (actId: string, direction: "up" | "down") => void;
  isReadOnly: boolean; // ✅ AÑADIR PROP
}

export const BookEditor = ({
  tome,
  currentView,
  setCurrentView,
  onUpdateTome,
  onCreateActa,
  setHasUnsavedChanges,
  onReorderAct,
  isReadOnly, // ✅ RECIBIR PROP
}: BookEditorProps) => {
  const [isDetailPanelVisible, setIsDetailPanelVisible] = useState(true);

  // --- MANEJADORES DE ACCIONES (Deshabilitar si es read-only) ---
  const handleAddAgreement = (actId: string) => {
    if (isReadOnly) return; // ✅ Bloquear
    // ... (resto de la función)
    const act = tome.acts?.find((a) => a.id === actId);
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
      tomeId: tome.id,
      tomeName: tome.name,
      createdAt: now,
      createdBy: currentUser,
      lastModified: now,
      modifiedBy: currentUser,
    };
    const updatedAgreements = [...(act.agreements || []), newAgreement];
    const updatedActs =
      tome.acts?.map((a) =>
        a.id === actId
          ? {
              ...a,
              agreements: updatedAgreements,
              agreementsCount: updatedAgreements.length,
            }
          : a
      ) || [];
    onUpdateTome({ acts: updatedActs });
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
    if (isReadOnly) return; // ✅ Bloquear
    // ... (resto de la función)
    if (!currentView.activeActId) return;
    const now = new Date().toISOString();
    const currentUser = "Usuario Actual";
    const agreementWithTracking: Agreement = {
      ...updatedAgreement,
      lastModified: now,
      modifiedBy: currentUser,
    };
    const updatedActs = tome.acts?.map((act) => {
      if (act.id === currentView.activeActId) {
        const updatedAgreements = act.agreements.map((agr) =>
          agr.id === agreementWithTracking.id ? agreementWithTracking : agr
        );
        return { ...act, agreements: updatedAgreements };
      }
      return act;
    });
    onUpdateTome({ acts: updatedActs });
  };

  const handleReorderAgreement = (
    agreementId: string,
    direction: "up" | "down"
  ) => {
    if (isReadOnly) return; // ✅ Bloquear
    // ... (resto de la función)
    if (!currentView.activeActId) return;
    const updatedActs = tome.acts?.map((act) => {
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
    onUpdateTome({ acts: updatedActs });
    setHasUnsavedChanges(true);
  };

  const isAgreementFocusMode =
    currentView.main.type === "act-edit" &&
    currentView.detail.type === "agreement-editor";

  // --- RENDERIZADO DE COLUMNAS (Pasando isReadOnly) ---
  const renderMainColumn = () => {
    switch (currentView.main.type) {
      case "cover":
        return (
          <BookCoverForm
            tome={tome}
            onDone={(data) => {
              if (isReadOnly) return; // ✅ Bloquear
              const updatePayload: Partial<Tome> = {
                name: data.name,
                tomeNumber: data.tome,
                authorizationDate: data.authorizationDate.toISOString(),
                closingDate: data.closingDate
                  ? data.closingDate.toISOString()
                  : undefined,
              };
              onUpdateTome(updatePayload);
              setCurrentView({
                ...currentView,
                main: { type: "act-list" },
                detail: { type: "none" },
                activeActId: null,
                activeAgreementId: null,
              });
            }}
            isReadOnly={isReadOnly} // ✅ Pasar prop
          />
        );

      case "act-edit": {
        const { actId } = currentView.main;
        const act = tome.acts?.find((a) => a.id === actId);
        if (!act) return <div className="p-4">Acta no encontrada.</div>;
        return (
          <ActEditor
            key={act.id}
            act={act}
            onUpdateAct={(updatedActa) => {
              if (isReadOnly) return; // ✅ Bloquear
              const updatedActs =
                tome.acts?.map((a) =>
                  a.id === updatedActa.id ? updatedActa : a
                ) || [];
              onUpdateTome({ acts: updatedActs });
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
            isReadOnly={isReadOnly} // ✅ Pasar prop
          />
        );
      }

      case "pdf-settings":
        return (
          <BookPdfSettingsForm
            tome={tome}
            onUpdateSettings={(settings) => {
              if (isReadOnly) return; // ✅ Bloquear
              onUpdateTome({ pdfSettings: settings });
              setCurrentView({
                main: { type: "act-list" },
                detail: { type: "none" },
                activeActId: null,
                activeAgreementId: null,
              });
            }}
            isReadOnly={isReadOnly} // ✅ Pasar prop
          />
        );

      case "act-list":
      default:
        return (
          <ActList
            acts={tome.acts || []}
            onCreateAct={() => {
              if (isReadOnly) return; // ✅ Bloquear
              onCreateActa();
            }}
            onEditAct={(actId) =>
              setCurrentView({
                main: { type: "act-edit", actId },
                detail: { type: "agreement-list" },
                activeActId: actId,
                activeAgreementId: null,
              })
            }
            onReorderAct={(actId, direction) => {
              if (isReadOnly) return; // ✅ Bloquear
              setCurrentView({
                ...currentView,
                activeActId: actId,
                activeAgreementId: null,
              });
              onReorderAct(actId, direction);
            }}
            activeActId={currentView.activeActId}
            isReadOnly={isReadOnly} // ✅ Pasar prop
          />
        );
    }
  };

  const renderDetailColumn = () => {
    // ... (sin cambios)
    const act = tome.acts?.find((a) => a.id === currentView.activeActId);
    if (!act) return null;
    switch (currentView.detail.type) {
      case "agreement-editor": {
        // ... (sin cambios)
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
            isReadOnly={isReadOnly} // ✅ Pasar prop
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
              handleReorderAgreement(agreementId, direction);
            }}
            activeAgreementId={currentView.activeAgreementId}
            isReadOnly={isReadOnly} // ✅ Pasar prop
          />
        );
    }
  };

  // ... (JSX de renderizado final NO CAMBIA)
  return (
    <div className="flex flex-1 min-h-0">
      <div
        className={cn(
          "flex-1 min-w-0 border-r",
          isAgreementFocusMode && "hidden"
        )}
      >
        {renderMainColumn()}
      </div>

      {currentView.activeActId && isDetailPanelVisible && (
        <div
          className={cn(
            "w-[500px] shrink-0 bg-white",
            isAgreementFocusMode && "w-full flex-1"
          )}
        >
          {renderDetailColumn()}
        </div>
      )}
    </div>
  );
};