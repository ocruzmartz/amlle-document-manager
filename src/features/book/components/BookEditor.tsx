import { type Tome, type Agreement, type Act } from "@/types";
import { type WorkspaceView } from "../types";
import { BookCoverForm } from "./BookCoverForm";
import { ActEditor } from "@/features/act/components/ActEditor";
import { AgreementEditor } from "@/features/agreement/components/AgreementEditor";
import { AgreementList } from "@/features/agreement/components/AgreementList";
import { cn, reorderArray } from "@/lib/utils";
import { ActList } from "@/features/act/components/ActList";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { formatDateToISO, numberToWords } from "@/lib/textUtils";
import { BookPdfSettingsForm } from "./BookPdfSettingsForm";
import { capitalize } from "lodash";
import { toast } from "sonner";
import { agreementService } from "@/features/agreement/api/agreementService";
import type { BookCoverFormValues } from "../schemas/bookCoverSchema";

const recalculateAgreementNumbers = (
  act: Act,
  newAgreements: Agreement[]
): Act => {
  const recalculatedAgreements = newAgreements.map(
    (agreement, agreementIndex) => {
      const newAgreementNumber = agreementIndex + 1;
      const newAgreementName = `Acuerdo número ${capitalize(
        numberToWords(newAgreementNumber)
      )}`;
      return { ...agreement, name: newAgreementName };
    }
  );
  return { ...act, agreements: recalculatedAgreements };
};

type SaveHandler = () => Promise<boolean>;

interface BookEditorProps {
  tome: Tome;
  currentView: WorkspaceView;
  setCurrentView: (view: WorkspaceView) => void;
  onUpdateTome: (updatedTomeData: Partial<Tome>) => void;
  onCreateActa: () => void;
  onUpdateAct: (updatedAct: Act) => void;
  setHasUnsavedChanges: (hasChanges: boolean) => void;
  onReorderAct: (actId: string, direction: "up" | "down") => void;
  onRefetchAct: (options?: { showLoadingScreen?: boolean }) => void;
  isReadOnly: boolean;
  isReordering: boolean;
  onRegisterSaveHandler: (handler: SaveHandler | null) => void;
}

export const BookEditor = ({
  tome,
  currentView,
  setCurrentView,
  onUpdateTome,
  onCreateActa,
  setHasUnsavedChanges,
  onReorderAct,
  isReadOnly,
  onRefetchAct,
  onUpdateAct,
  isReordering,
  onRegisterSaveHandler,
}: BookEditorProps) => {
  const [isDetailPanelVisible, setIsDetailPanelVisible] = useState(true);
  const [isCreatingAgreement, setIsCreatingAgreement] = useState(false);
  const [isReorderingAgreements, setIsReorderingAgreements] = useState(false);

  const handleCoverFormDone = useCallback(
    (data: BookCoverFormValues) => {
      if (isReadOnly) return;
      const updatePayload: Partial<Tome> = {
        name: data.name,
        number: data.tome,
        authorizationDate: formatDateToISO(data.authorizationDate),
        closingDate: data.closingDate
          ? formatDateToISO(data.closingDate)
          : null,
      };
      onUpdateTome(updatePayload); // Depende de 'onUpdateTome' (ahora estable)
      setCurrentView({
        ...currentView,
        main: { type: "act-list" },
        detail: { type: "none" },
        activeActId: null,
        activeAgreementId: null,
      });
    },
    [isReadOnly, onUpdateTome, setCurrentView, currentView]
  );

  const handleAddAgreement = async (actId: string) => {
    if (isReadOnly || isCreatingAgreement) return;

    setIsCreatingAgreement(true);
    const toastId = toast.loading("Creando acuerdo...");

    const act = tome.acts?.find((a) => a.id === actId);
    if (!act) {
      toast.error("No se encontró el acta de origen.", { id: toastId });
      setIsCreatingAgreement(false);
      return;
    }

    try {
      // ✅ 1. Calcular nombre y número
      const agreementNumber = (act.agreements || []).length + 1;
      const newAgreementName = `Acuerdo número ${capitalize(
        numberToWords(agreementNumber)
      )}`;

      // ✅ 2. Llamar a la API con el DTO completo
      const newAgreement = await agreementService.createAgreement({
        minutesId: actId,
        name: newAgreementName,
        agreementNumber: agreementNumber,
        // No enviamos 'content' (opcional)
      });

      onRefetchAct({ showLoadingScreen: false });

      // ✅ 3. Actualizar el estado local (Tome) con la respuesta de la API
      const updatedActs =
        tome.acts?.map((a) =>
          a.id === actId
            ? {
                ...a,
                agreements: [...(a.agreements || []), newAgreement],
                agreementsCount: (a.agreements || []).length + 1,
              }
            : a
        ) || [];
      onUpdateTome({ acts: updatedActs });

      // ✅ 4. Navegar al nuevo acuerdo
      setCurrentView({
        ...currentView,
        detail: {
          type: "agreement-editor",
          agreementId: newAgreement.id,
        },
        activeAgreementId: newAgreement.id,
      });

      toast.success("Acuerdo creado exitosamente.", { id: toastId });
    } catch (error) {
      console.error("Error al crear acuerdo:", error);
      toast.error("No se pudo crear el acuerdo.", {
        id: toastId,
      });
    } finally {
      setIsCreatingAgreement(false);
    }
  };

  const handleUpdateAgreement = useCallback(
    async (updatedAgreement: Agreement) => {
      if (isReadOnly) return;
      await agreementService.updateAgreement(updatedAgreement.id, {
        content: updatedAgreement.content,
      });
      onRefetchAct({ showLoadingScreen: false });
    },
    [isReadOnly, onRefetchAct]
  );

  const handleReorderAgreement = async (
    agreementId: string,
    direction: "up" | "down"
  ) => {
    if (isReadOnly || isReorderingAgreements || !currentView.activeActId)
      return;

    const act = tome.acts?.find((a) => a.id === currentView.activeActId);
    if (!act || !act.agreements) return;

    const originalAgreements = act.agreements;
    const movingAgreementIndex = originalAgreements.findIndex(
      (a) => a.id === agreementId
    );
    if (movingAgreementIndex === -1) return;

    const targetAgreementIndex =
      direction === "up" ? movingAgreementIndex - 1 : movingAgreementIndex + 1;
    if (
      targetAgreementIndex < 0 ||
      targetAgreementIndex >= originalAgreements.length
    ) {
      return;
    }

    const movingAgreement = originalAgreements[movingAgreementIndex];
    const targetAgreement = originalAgreements[targetAgreementIndex];
    const targetAgreementNumber = targetAgreementIndex + 1;

    setIsReorderingAgreements(true);
    const toastId = toast.loading("Reordenando acuerdos...");

    try {
      await agreementService.updateAgreementNameNumber(movingAgreement.id, {
        name: targetAgreement.name,
        agreementNumber: targetAgreementNumber,
      });

      const reorderedAgreements = reorderArray(
        originalAgreements,
        agreementId,
        direction
      );

      const updatedAct = recalculateAgreementNumbers(act, reorderedAgreements);
      const updatedActs = tome.acts!.map((a) =>
        a.id === updatedAct.id ? updatedAct : a
      );
      onUpdateTome({ acts: updatedActs });
      setCurrentView({ ...currentView, activeAgreementId: agreementId });
      toast.success("Acuerdos reordenados.", { id: toastId });
    } catch (error) {
      console.error("Error al reordenar acuerdos:", error);
      toast.error("No se pudo reordenar.", {
        id: toastId,
      });
    } finally {
      setIsReorderingAgreements(false);
    }
  };

  const isAgreementFocusMode =
    currentView.main.type === "act-edit" &&
    currentView.detail.type === "agreement-editor";
  const renderMainColumn = () => {
    switch (currentView.main.type) {
      case "cover":
        return (
          <BookCoverForm
            tome={tome}
            onDone={handleCoverFormDone}
            isReadOnly={isReadOnly}
            onRegisterSaveHandler={onRegisterSaveHandler}
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
            onUpdateAct={onUpdateAct}
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
            onRegisterSaveHandler={onRegisterSaveHandler}
            isReadOnly={isReadOnly}
          />
        );
      }

      case "pdf-settings":
        return (
          <BookPdfSettingsForm
            tome={tome}
            onUpdateSettings={(settings) => {
              if (isReadOnly) return;
              onUpdateTome({ pdfSettings: settings });
              setCurrentView({
                main: { type: "act-list" },
                detail: { type: "none" },
                activeActId: null,
                activeAgreementId: null,
              });
            }}
            onRegisterSaveHandler={onRegisterSaveHandler}
            isReadOnly={isReadOnly}
          />
        );

      case "act-list":
      default:
        return (
          <ActList
            acts={tome.acts || []}
            onCreateAct={() => {
              if (isReadOnly) return;
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
              if (isReadOnly) return;
              setCurrentView({
                ...currentView,
                activeActId: actId,
                activeAgreementId: null,
              });
              onReorderAct(actId, direction);
            }}
            activeActId={currentView.activeActId}
            isReadOnly={isReadOnly || isReordering}
          />
        );
    }
  };

  const renderDetailColumn = () => {
    const act = tome.acts?.find((a) => a.id === currentView.activeActId);
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
            onRegisterSaveHandler={onRegisterSaveHandler}
            isReadOnly={isReadOnly}
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
            isReadOnly={isReadOnly || isReorderingAgreements}
          />
        );
    }
  };

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
