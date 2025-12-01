import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router";
import {
  ChevronLeft,
  X,
  PlusCircle,
  Trash,
  PenSquare,
  ArchiveIcon,
  FileText,
  BookOpen,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
  SelectSeparator,
} from "@/components/ui/select";
import {
  type Tome,
  type Act,
  type Book,
  type Agreement,
  type CouncilMember,
} from "@/types";
import { type WorkspaceView } from "../types";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { BookSidebarNav } from "../components/BookSidebarNav";
import { BookEditor } from "../components/BookEditor";
import { BookPdfPreview } from "../components/BookPdfPreview";
import { capitalize, formatDateToISO, numberToWords } from "@/lib/textUtils";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { volumeService } from "../api/volumeService";
import { bookService } from "../api/bookService";
import { toast } from "sonner";
import { LoadingScreen } from "@/components/LoadingScreen";
import { actService } from "@/features/act/api/minutesService";
import { reorderArray } from "@/lib/utils";
import { agreementService } from "@/features/agreement/api/agreementService";
import { participantsService } from "@/features/act/api/participantsService";
import { BookPdfDocument } from "../components/BookPdfDocument";
import { calculatePdfPageCount } from "../utils/pdfHelpers";

const recalculateNumbers = (tomeState: Tome): Tome => {
  const recalculatedActs = tomeState.acts?.map((act, actIndex) => {
    const newActNumber = actIndex + 1;
    const newActName = `Acta número ${capitalize(numberToWords(newActNumber))}`;

    const recalculatedAgreements = act.agreements.map(
      (agreement, agreementIndex) => {
        const newAgreementNumber = agreementIndex + 1;
        const newAgreementName = `Acuerdo número ${capitalize(
          numberToWords(newAgreementNumber)
        )}`;
        return { ...agreement, name: newAgreementName };
      }
    );

    return {
      ...act,
      actNumber: newActNumber,
      name: newActName,
      agreements: recalculatedAgreements,
    };
  });

  return { ...tomeState, acts: recalculatedActs };
};

export const BookWorkspacePage = () => {
  const navigate = useNavigate();
  const { bookId: tomeId } = useParams<{ bookId: string }>();
  const [searchParams, setSearchParams] = useSearchParams();
  const [tome, setTome] = useState<Tome | null>(null);
  const [parentBook, setParentBook] = useState<Book | null>(null);
  const [allVolumes, setAllVolumes] = useState<Tome[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [isEditorSaving, setIsEditorSaving] = useState(false);

  type SaveHandler = () => Promise<boolean>;
  const activeSaveHandlerRef = useRef<SaveHandler | null>(null);
  const [isRenameBookDialogOpen, setIsRenameBookDialogOpen] = useState(false);
  const [newBookName, setNewBookName] = useState("");
  const [tomeToDelete, setTomeToDelete] = useState<Tome | null>(null);
  const [actToDelete, setActToDelete] = useState<Act | null>(null);
  const [agreementToDelete, setAgreementToDelete] = useState<Agreement | null>(
    null
  );
  const [isDeletingAgreement, setIsDeletingAgreement] = useState(false);
  const [isActLoading, setIsActLoading] = useState(false);

  const [isCreatingAct, setIsCreatingAct] = useState(false);
  const [isReordering, setIsReordering] = useState(false);
  const [isDeletingAct, setIsDeletingAct] = useState(false);
  const [confirmationText, setConfirmationText] = useState("");

  const [allSigners, setAllSigners] = useState<CouncilMember[]>([]);

  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const [previewMode, setPreviewMode] = useState<"GLOBAL" | "ACT">("GLOBAL");

  // const previewKey = tome
  //   ? tome.updatedAt + JSON.stringify(tome.pdfSettings)
  //   : "";

  const [currentView, setCurrentView] = useState<WorkspaceView>(() => {
    const view = searchParams.get("view") || "cover";
    const actId = searchParams.get("actId") || null;
    const detailView = searchParams.get("detailView") || "none";
    const agreementId = searchParams.get("agreementId") || null;

    if (view === "act-edit" && actId) {
      return {
        main: { type: "act-edit", actId: actId },
        detail:
          detailView === "agreement-editor" && agreementId
            ? { type: "agreement-editor", agreementId: agreementId }
            : { type: "agreement-list" },
        activeActId: actId,
        activeAgreementId: agreementId,
      };
    }
    if (view === "pdf-settings") {
      return {
        main: { type: "pdf-settings" },
        detail: { type: "none" },
        activeActId: null,
        activeAgreementId: null,
      };
    }

    return {
      main: { type: "cover" },
      detail: { type: "none" },
      activeActId: null,
      activeAgreementId: null,
    };
  });

  const setViewAndUrl = useCallback(
    (view: WorkspaceView) => {
      setCurrentView(view);
      const params = new URLSearchParams();
      params.set("view", view.main.type);
      if (view.activeActId) {
        params.set("actId", view.activeActId);
      }
      if (view.detail.type) {
        params.set("detailView", view.detail.type);
      }
      if (view.activeAgreementId) {
        params.set("agreementId", view.activeAgreementId);
      }
      setSearchParams(params, { replace: true });
    },
    [setSearchParams]
  );

  const onRegisterSaveHandler = useCallback((handler: SaveHandler | null) => {
    activeSaveHandlerRef.current = handler;
  }, []);

  const handleEditorStateChange = useCallback(
    (state: { dirty: boolean; saving: boolean }) => {
      setHasUnsavedChanges(state.dirty);
      setIsEditorSaving(state.saving);
    },
    []
  );

  useEffect(() => {
    const loadWorkspace = async () => {
      if (!tomeId) {
        toast.error("ID de tomo no proporcionado");
        navigate("/books");
        return;
      }

      setIsLoading(true);
      try {
        const [foundTome, propietarios] = await Promise.all([
          volumeService.getVolumeById(tomeId!),
          participantsService.getPropietarios(),
        ]);

        const foundActs = await actService.getActsByVolumeId(tomeId!);

        setTome({
          ...foundTome,
          acts: foundActs,
        });

        setAllSigners([...propietarios]);
        const bookId = foundTome.book.id;
        const foundBook = await bookService.getBookById(bookId);

        setParentBook(foundBook);
        setNewBookName(foundBook.name);

        const volumes = await volumeService.getVolumesByBookId(bookId);
        setAllVolumes(volumes);
      } catch (error: unknown) {
        console.error("❌ Error al cargar workspace:", error);
        const errorMessage =
          error instanceof Error ? error.message : "No se pudo cargar el tomo";
        toast.error(errorMessage);
        navigate("/books");
      } finally {
        setIsLoading(false);
      }
    };

    loadWorkspace();
  }, [tomeId, navigate]);

  const handleRenameBookSubmit = async () => {
    if (!parentBook || !newBookName.trim()) {
      toast.error("El nombre del libro no puede estar vacío");
      return;
    }

    try {
      await bookService.updateBook(parentBook.id, { name: newBookName });

      setParentBook((prev) => (prev ? { ...prev, name: newBookName } : null));

      toast.success("Libro renombrado correctamente");
      setIsRenameBookDialogOpen(false);
    } catch (error: unknown) {
      if (error instanceof Error) {
        console.error("❌ Error al renombrar libro:", error.message);
      } else {
        console.error("❌ Error al renombrar libro:", error);
      }
      toast.error("No se pudo renombrar el libro");
    }
  };

  const handleTomeUpdate = useCallback(
    async (updatedTomeData: Partial<Tome>) => {
      if (!tome || !tomeId) return;

      if (updatedTomeData.acts) {
        console.warn(
          "Actualización de ACTS (reordenar, crear, etc.) es solo local por ahora."
        );
        let newTome = {
          ...tome,
          ...updatedTomeData,
          updatedAt: new Date().toISOString(),
        };
        if (updatedTomeData.acts) {
          newTome = recalculateNumbers(newTome);
        }
        setTome(newTome);
        return;
      }

      const toastId = toast.loading("Guardando cambios...");

      try {
        const sanitizedTomeData = {
          ...updatedTomeData,
          authorizationDate:
            updatedTomeData.authorizationDate === null
              ? undefined
              : updatedTomeData.authorizationDate,
        };
        const updatedTome = await volumeService.updateVolume(
          tomeId,
          sanitizedTomeData
        );
        setTome((prevTome) => {
          if (!prevTome) return updatedTome;

          return {
            ...prevTome,
            ...updatedTome,
            acts: prevTome.acts,
          };
        });

        if (updatedTomeData.name) {
          setAllVolumes((vols) =>
            vols.map((v) =>
              v.id === tomeId ? { ...v, name: updatedTome.name } : v
            )
          );
        }

        setHasUnsavedChanges(false);
        setIsEditorSaving(false);
        toast.success("Cambios guardados exitosamente", { id: toastId });
      } catch (error: unknown) {
        console.error("❌ Error al actualizar tomo:", error);
        toast.error("No se pudo actualizar el tomo", { id: toastId });
      }
    },
    [tome, tomeId, setAllVolumes]
  );

  const handleDeleteActClick = (actId: string) => {
    if (isReadOnly) return;
    const act = tome?.acts?.find((a) => a.id === actId);
    if (act) {
      setActToDelete(act);
    }
  };

  const handleConfirmDeleteAct = async () => {
    if (!actToDelete || isDeletingAct) return;

    setIsDeletingAct(true);
    const toastId = toast.loading("Eliminando acta...");

    try {
      await actService.deleteAct(actToDelete.id);
      const actsAfterDelete = tome!.acts!.filter(
        (a) => a.id !== actToDelete.id
      );

      const newState = recalculateNumbers({ ...tome!, acts: actsAfterDelete });
      const updatePromises = newState.acts!.map((act) =>
        actService.updateActNameNumber(act.id, act.name, act.actNumber!)
      );
      await Promise.all(updatePromises);

      setTome(newState);
      toast.success("Acta eliminada y actas restantes actualizadas.", {
        id: toastId,
      });
      setActToDelete(null);
      setConfirmationText("");
    } catch (error: unknown) {
      console.error("❌ Error al eliminar o actualizar actas:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo completar la eliminación",
        { id: toastId }
      );
    } finally {
      setIsDeletingAct(false);
    }
  };

  const handleDeleteAgreementClick = (agreementId: string) => {
    if (isReadOnly || !currentView.activeActId) return;
    const act = tome?.acts?.find((a) => a.id === currentView.activeActId);
    const agreement = act?.agreements.find((a) => a.id === agreementId);
    if (agreement) {
      setAgreementToDelete(agreement);
    }
  };

  const handleConfirmDeleteAgreement = async () => {
    if (!agreementToDelete || !currentView.activeActId || isDeletingAgreement)
      return;

    setIsDeletingAgreement(true);
    const toastId = toast.loading("Eliminando acuerdo...");

    try {
      await agreementService.deleteAgreement(agreementToDelete.id);

      await refetchActiveAct({ showLoadingScreen: false });

      toast.success("Acuerdo eliminado exitosamente.", { id: toastId });
      setAgreementToDelete(null);
      setConfirmationText("");
    } catch (error: unknown) {
      console.error("❌ Error al eliminar acuerdo:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo eliminar el acuerdo",
        {
          id: toastId,
        }
      );
    } finally {
      setIsDeletingAgreement(false);
    }
  };

  useEffect(() => {
    const loadActForEditing = async () => {
      if (currentView.main.type === "act-edit" && currentView.activeActId) {
        setIsActLoading(true);

        try {
          const fetchedAct = await actService.getActById(
            currentView.activeActId
          );

          setTome((prevTome) => {
            if (!prevTome) return null;
            const currentActs = prevTome.acts ?? [];
            return {
              ...prevTome,
              acts: currentActs.map((a) =>
                a.id === fetchedAct.id ? fetchedAct : a
              ),
            };
          });
        } catch (error: unknown) {
          console.error("❌ Error al cargar acta por ID:", error);
          toast.error("No se pudo cargar el acta para edición.");
          setViewAndUrl({
            main: { type: "act-list" },
            detail: { type: "none" },
            activeActId: null,
            activeAgreementId: null,
          });
        } finally {
          setIsActLoading(false);
        }
      }
    };

    loadActForEditing();
  }, [currentView.main.type, currentView.activeActId, setTome, setViewAndUrl]);

  const getInitialPageForAct = useCallback(
    (targetActId: string | null): number => {
      if (!targetActId || !tome || !tome.acts) return 1;
      const sortedActs = [...tome.acts].sort(
        (a, b) => (a.actNumber || 0) - (b.actNumber || 0)
      );

      const currentIndex = sortedActs.findIndex((a) => a.id === targetActId);

      if (currentIndex === 0) {
        const offset = tome.pdfSettings?.pageNumberingOffset || 0;
        return Math.max(1, 2 - offset);
      }
      const prevAct = sortedActs[currentIndex - 1];
      if (prevAct.lastPageNumber) {
        return prevAct.lastPageNumber + 1;
      }
      return 1;
    },
    [tome]
  );

  const handleActUpdate = useCallback(
    async (updatedAct: Act) => {
      if (!tome || !tome.acts) return;

      const toastId = toast.loading("Procesando acta y numeración...");

      try {
        const startPage = getInitialPageForAct(updatedAct.id);
        const tempActs = tome.acts.map((a) =>
          a.id === updatedAct.id ? updatedAct : a
        );
        const tempTome = { ...tome, acts: tempActs };

        const pageCount = await calculatePdfPageCount(
          <BookPdfDocument
            tome={tempTome}
            allSigners={allSigners}
            targetActId={updatedAct.id}
            initialPageNumber={startPage}
          />
        );
        const calculatedLastPage = startPage + pageCount - 1;

        console.log(
          `Acta empieza en: ${startPage}, Longitud: ${pageCount}, Termina en: ${calculatedLastPage}`
        );

        const actToSave = {
          ...updatedAct,
          lastPageNumber: calculatedLastPage,
        };

        await actService.updateAct(actToSave);

        setTome((prevTome) => {
          if (!prevTome) return null;
          const updatedActs = prevTome.acts!.map((act) =>
            act.id === actToSave.id ? actToSave : act
          );
          return { ...prevTome, acts: updatedActs };
        });

        toast.success("Acta guardada y numeración actualizada.", {
          id: toastId,
        });
      } catch (error: unknown) {
        console.error("❌ Error al guardar acta:", error);
        const msg =
          error instanceof Error ? error.message : "Error desconocido";
        toast.error(`Error al guardar: ${msg}`, { id: toastId });
      }
    },
    [tome, allSigners, getInitialPageForAct]
  );

  const handleCreateAct = async () => {
    if (!tome || !tomeId || isCreatingAct) return;

    setIsCreatingAct(true);
    const toastId = toast.loading("Creando nueva acta...");

    try {
      const newActNumber = (tome.acts?.length || 0) + 1;
      const newActName = `Acta número ${capitalize(
        numberToWords(newActNumber)
      )}`;

      const payload = {
        volumeId: tomeId,
        name: newActName,
        actNumber: newActNumber,
        meetingDate: formatDateToISO(new Date()),
        meetingTime: "diez horas",
      };

      const newActFromBackend = await actService.createAct(payload);

      setTome((prevTome) => {
        if (!prevTome) return null;
        return {
          ...prevTome,
          acts: [...(prevTome.acts || []), newActFromBackend],
        };
      });

      setViewAndUrl({
        main: { type: "act-edit", actId: newActFromBackend.id },
        detail: { type: "agreement-list" },
        activeActId: newActFromBackend.id,
        activeAgreementId: null,
      });

      toast.success("Acta creada exitosamente", { id: toastId });
    } catch (error: unknown) {
      console.error("❌ Error al crear acta:", error);
      const errorMessage =
        error instanceof Error ? error.message : "No se pudo crear el acta";
      toast.error(errorMessage, { id: toastId });
    } finally {
      setIsCreatingAct(false);
    }
  };

  const handleBackClick = () => {
    if (hasUnsavedChanges) {
      setShowExitDialog(true);
    } else {
      navigate("/books");
    }
  };

  const handleConfirmExit = () => {
    setShowExitDialog(false);
    navigate("/books");
  };

  const handleSaveAndExit = async () => {
    const saveHandler = activeSaveHandlerRef.current;

    if (!saveHandler) {
      toast.error("Error al guardar: No hay un formulario activo.", {
        description:
          "El formulario que estabas editando ya no está visible. Cierra este diálogo y vuelve a la sección que querías guardar.",
      });
      return;
    }

    try {
      const success = await saveHandler();

      if (success) {
        setShowExitDialog(false);
        navigate("/books");
      } else {
        // El hook useSaveAction ya mostró el toast de error.
      }
    } catch (error) {
      console.error("Error en handleSaveAndExit:", error);
      toast.error("Ocurrió un error inesperado al guardar.");
    }
  };

  const refetchActiveAct = useCallback(
    async (options: { showLoadingScreen?: boolean } = {}) => {
      const { showLoadingScreen = true } = options;

      if (currentView.main.type === "act-edit" && currentView.activeActId) {
        if (showLoadingScreen) {
          setIsActLoading(true);
        }

        try {
          const fetchedAct = await actService.getActById(
            currentView.activeActId
          );
          setTome((prevTome) => {
            if (!prevTome) return null;
            const currentActs = prevTome.acts ?? [];
            return {
              ...prevTome,
              acts: currentActs.map((a) =>
                a.id === fetchedAct.id ? fetchedAct : a
              ),
            };
          });
        } catch (error: unknown) {
          console.error("❌ Error al recargar acta por ID:", error);
          toast.error(
            error instanceof Error
              ? error.message
              : "No se pudo recargar el acta."
          );

          interface ErrorWithResponse extends Error {
            response?: { status?: number };
          }
          if (
            error instanceof Error &&
            (error as ErrorWithResponse).response?.status === 404
          ) {
            setViewAndUrl({
              main: { type: "act-list" },
              detail: { type: "none" },
              activeActId: null,
              activeAgreementId: null,
            });
          }
        } finally {
          if (showLoadingScreen) {
            setIsActLoading(false);
          }
        }
      }
    },
    [currentView.activeActId, currentView.main.type, setViewAndUrl]
  );

  useEffect(() => {
    refetchActiveAct();
  }, [refetchActiveAct]);

  const handleReorderAct = async (actId: string, direction: "up" | "down") => {
    if (!tome || !tome.acts || isReordering) return;

    setIsReordering(true);
    const toastId = toast.loading("Reordenando actas...");

    try {
      const reorderedActs = reorderArray(tome.acts, actId, direction);
      const newState = recalculateNumbers({ ...tome, acts: reorderedActs });
      const updatePromises = newState.acts!.map((act) =>
        actService.updateActNameNumber(act.id, act.name, act.actNumber!)
      );

      await Promise.all(updatePromises);
      setTome(newState);

      toast.success("Actas reordenadas exitosamente.", {
        id: toastId,
        description: "El encabezado del acta debe regenerarse manualmente.",
      });
    } catch (error: unknown) {
      console.error("❌ Error al reordenar actas:", error);
      toast.error(
        error instanceof Error
          ? error.message
          : "No se pudo reordenar las actas",
        {
          id: toastId,
        }
      );
      await refetchActiveAct({ showLoadingScreen: true });
    } finally {
      setIsReordering(false);
    }
  };

  const handleCreateTome = async () => {
    if (!parentBook) return;

    try {
      const newTomeNumber = allVolumes.length + 1;

      const newTome = await volumeService.createVolume({
        number: newTomeNumber,
        bookId: parentBook.id,
      });

      toast.success(`Tomo ${newTomeNumber} creado`);
      navigate(`/books/${newTome.id}`);
    } catch (error: unknown) {
      console.error("❌ Error al crear tomo:", error);
      toast.error("No se pudo crear el tomo");
    }
  };

  const handleConfirmDeleteTome = async () => {
    if (!tomeToDelete) return;

    try {
      await volumeService.deleteVolume(tomeToDelete.id);

      const newVolumesList = allVolumes.filter((v) => v.id !== tomeToDelete.id);
      setAllVolumes(newVolumesList);

      toast.success("Tomo eliminado correctamente");

      if (tomeToDelete.id === tomeId) {
        if (newVolumesList.length > 0) {
          navigate(`/books/${newVolumesList[0].id}`);
        } else {
          navigate("/books");
        }
      }

      setTomeToDelete(null);
    } catch (error: unknown) {
      console.error("❌ Error al eliminar tomo:", error);
      toast.error("No se pudo eliminar el tomo");
    }
  };

  const isReadOnly = tome?.status === "FINALIZADO";
  const isArchived = tome?.status === "ARCHIVADO";

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!tome || !parentBook) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-muted-foreground">Tomo no encontrado</p>
      </div>
    );
  }

  const activeActId =
    currentView.main.type === "act-edit" ? currentView.activeActId : null;

  const handleOpenPreview = (mode: "GLOBAL" | "ACT") => {
    setPreviewMode(mode);
    setIsPreviewOpen(true);
  };

  const renderHeader = () => (
    <div className="shrink-0 p-3 border-b bg-background flex justify-between items-center">
      <div className="flex items-center gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleBackClick}
          className="shrink-0"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <h2 className="text-lg font-semibold truncate" title={parentBook.name}>
          {parentBook.name}
        </h2>
        <Button
          variant="ghost"
          size="icon"
          className="h-7 w-7"
          onClick={() => setIsRenameBookDialogOpen(true)}
          title="Renombrar libro padre"
          disabled={isReadOnly || isArchived}
        >
          <PenSquare className="h-4 w-4" />
        </Button>
        <div className="h-6 w-px bg-border mx-2"></div>
        <Select
          value={tome.id}
          onValueChange={(newTomeId) => navigate(`/books/${newTomeId}`)}
        >
          <SelectTrigger className="w-auto min-w-[120px] h-9 shadow-none">
            <SelectValue placeholder="Seleccionar Tomo..." />
          </SelectTrigger>
          <SelectContent>
            {allVolumes
              .sort((a, b) => a.number - b.number)
              .map((v) => (
                <div key={v.id} className="flex items-center pr-2">
                  <SelectItem value={v.id} className="flex-1">
                    {v.name || `Tomo ${v.number}`}
                  </SelectItem>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6 text-destructive hover:text-destructive"
                    disabled={
                      allVolumes.length <= 1 || isReadOnly || isArchived
                    }
                    title="Eliminar tomo"
                    onClick={(e) => {
                      e.stopPropagation();
                      setTomeToDelete(v);
                    }}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            <SelectSeparator />
            <Button
              variant="ghost"
              className="w-full justify-start h-8 px-2"
              onClick={handleCreateTome}
              disabled={isReadOnly || isArchived}
            >
              <PlusCircle className="mr-2 h-4 w-4" /> Añadir Tomo
            </Button>
          </SelectContent>
        </Select>
        {hasUnsavedChanges && !isReadOnly && (
          <span
            className="text-orange-500 text-2xl"
            title="Cambios sin guardar"
          >
            •
          </span>
        )}
        {isEditorSaving && (
          <span
            className="text-blue-500 font-semibold text-xs ml-2 animate-pulse"
            title="Guardando..."
          >
            (Guardando...)
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        {/* Botón Vista Acta (Condicional) */}
        {activeActId && (
          <Button
            variant="destructive"
            className="shadow-sm border-none"
            onClick={() => handleOpenPreview("ACT")}
            disabled={isEditorSaving}
          >
            <FileText className="mr-2 h-4 w-4" />
            Ver Acta
          </Button>
        )}

        {/* Botón Libro Completo */}
        <Sheet open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
          <Button
            variant="destructive"
            className="shadow-none"
            onClick={() => handleOpenPreview("GLOBAL")}
            disabled={isEditorSaving}
          >
            <BookOpen className="mr-2 h-4 w-4" />
            Ver Libro
          </Button>

          <SheetContent className="w-full sm:max-w-[900px] p-0 flex flex-col sm:duration-300">
            <SheetHeader className="p-4 border-b flex flex-row items-center justify-between bg-muted/10">
              <SheetTitle>
                {previewMode === "ACT"
                  ? "Vista Previa: Acta Actual"
                  : "Vista Previa: Libro Completo"}
              </SheetTitle>
            </SheetHeader>

            {tome && (
              <BookPdfPreview
                key={`${tome.id}-${previewMode}`}
                tome={tome}
                allSigners={allSigners}
                targetActId={previewMode === "ACT" ? activeActId : null}
                initialPageNumber={
                  previewMode === "ACT" ? getInitialPageForAct(activeActId) : 1
                }
              />
            )}
          </SheetContent>
        </Sheet>
      </div>
    </div>
  );

  const renderMainContent = () => {
    if (isArchived) {
      return (
        <div className="flex-1 flex flex-col items-center justify-center text-center p-8">
          <ArchiveIcon className="h-16 w-16 text-muted-foreground/50" />
          <h2 className="mt-4 text-2xl font-semibold">Tomo Archivado</h2>
          <p className="mt-2 text-muted-foreground">
            Este tomo está archivado y no puede ser editado.
            <br />
            Para hacer cambios, primero debe restaurarlo a "Borrador" desde la
            lista de libros.
          </p>
          <Button variant="outline" className="mt-6" onClick={handleBackClick}>
            <ChevronLeft className="mr-2 h-4 w-4" />
            Volver a la lista
          </Button>
        </div>
      );
    }

    if (currentView.main.type === "act-edit" && isActLoading) {
      return <LoadingScreen />;
    }

    return (
      <>
        <div className="w-[300px] border-r shrink-0 overflow-y-auto bg-white">
          <BookSidebarNav
            acts={tome.acts || []}
            currentView={currentView}
            onViewChange={setViewAndUrl}
          />
        </div>
        <div className="flex-1 flex min-w-0">
          <BookEditor
            tome={tome}
            currentView={currentView}
            setCurrentView={setViewAndUrl}
            onUpdateTome={handleTomeUpdate}
            onUpdateAct={handleActUpdate}
            onCreateActa={handleCreateAct}
            onStateChange={handleEditorStateChange}
            onDeleteAgreement={handleDeleteAgreementClick}
            onRefetchAct={refetchActiveAct}
            onReorderAct={handleReorderAct}
            onRegisterSaveHandler={onRegisterSaveHandler}
            isReadOnly={isReadOnly}
            isReordering={isReordering}
            onDeleteAct={handleDeleteActClick}
          />
        </div>
      </>
    );
  };

  return (
    <div className="flex flex-col h-screen">
      {renderHeader()}
      <div className="flex flex-1 min-h-0">{renderMainContent()}</div>
      <AlertDialog
        open={isRenameBookDialogOpen}
        onOpenChange={setIsRenameBookDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Renombrar Libro Padre</AlertDialogTitle>
            <AlertDialogDescription>
              Vas a cambiar el nombre del libro contenedor.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <Label htmlFor="book-name-input" className="mb-2 block">
              Nuevo nombre del libro
            </Label>
            <Input
              id="book-name-input"
              value={newBookName}
              onChange={(e) => setNewBookName(e.target.value)}
              className="mt-1"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleRenameBookSubmit}>
              Renombrar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!tomeToDelete}
        onOpenChange={() => setTomeToDelete(null)}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar Tomo?</AlertDialogTitle>
            <AlertDialogDescription>
              ¿Estás seguro de que quieres eliminar
              <strong> {tomeToDelete?.name}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleConfirmDeleteTome}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Sí, eliminar tomo
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={showExitDialog} onOpenChange={setShowExitDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <Button
              variant="ghost"
              size="sm"
              className="absolute right-2 top-2 h-6 w-6 p-0"
              onClick={() => setShowExitDialog(false)}
            >
              <X className="h-4 w-4" />
            </Button>
            <AlertDialogTitle>
              ¿Deseas salir de <span>{tome.name}</span>?
            </AlertDialogTitle>
            <AlertDialogDescription>
              Tienes cambios sin guardar.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <Button variant="outline" onClick={handleSaveAndExit}>
              Guardar y salir
            </Button>
            <AlertDialogAction
              onClick={handleConfirmExit}
              className="bg-destructive text-white hover:bg-destructive/90"
            >
              Salir sin guardar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!actToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setActToDelete(null);
            setConfirmationText("");
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar Acta?</AlertDialogTitle>
            <AlertDialogDescription>
              Vas a eliminar permanentemente el acta{" "}
              <strong>"{actToDelete?.name}"</strong>. Esta acción no se puede
              deshacer.
              <br />
              Para confirmar, por favor escribe <strong>ELIMINAR</strong> en el
              campo de abajo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <Label
              htmlFor="confirm-text-delete-act"
              className="text-muted-foreground"
            >
              Escribe "ELIMINAR" para confirmar
            </Label>
            <Input
              id="confirm-text-delete-act"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              className="mt-2"
              autoComplete="off"
              autoFocus
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleConfirmDeleteAct}
              disabled={confirmationText !== "ELIMINAR" || isDeletingAct}
            >
              {isDeletingAct ? "Eliminando..." : "Sí, eliminar"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog
        open={!!agreementToDelete}
        onOpenChange={(open) => {
          if (!open) {
            setAgreementToDelete(null);
            setConfirmationText("");
          }
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Eliminar Acuerdo?</AlertDialogTitle>
            <AlertDialogDescription>
              Vas a eliminar permanentemente el acuerdo{" "}
              <strong>"{agreementToDelete?.name}"</strong>. Esta acción no se
              puede deshacer.
              <br />
              Para confirmar, por favor escribe <strong>ELIMINAR</strong> en el
              campo de abajo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <Label
              htmlFor="confirm-text-delete-agreement"
              className="text-muted-foreground"
            >
              Escribe "ELIMINAR" para confirmar
            </Label>
            <Input
              id="confirm-text-delete-agreement"
              value={confirmationText}
              onChange={(e) => setConfirmationText(e.target.value)}
              className="mt-2"
              autoComplete="off"
              autoFocus
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <Button
              variant="destructive"
              onClick={handleConfirmDeleteAgreement}
              disabled={confirmationText !== "ELIMINAR" || isDeletingAgreement}
            >
              {isDeletingAgreement ? "Eliminando..." : "Sí, eliminar"}
            </Button>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};
