import { useState, useEffect, useCallback, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router";
import {
  ChevronLeft,
  PanelRightOpen,
  X,
  RefreshCw,
  PlusCircle,
  Trash,
  PenSquare,
  ArchiveIcon,
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
  SheetTrigger,
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
import {
  OFFICIAL_SYNDIC,
  OFFICIAL_SECRETARY,
} from "@/features/act/lib/officials";

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
  const location = useLocation();

  const [tome, setTome] = useState<Tome | null>(null);
  const [parentBook, setParentBook] = useState<Book | null>(null);
  const [allVolumes, setAllVolumes] = useState<Tome[]>([]); // ✅ Agregado

  const [isLoading, setIsLoading] = useState(true);
  const [showExitDialog, setShowExitDialog] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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

  const previewKey = tome
    ? tome.updatedAt + JSON.stringify(tome.pdfSettings)
    : "";

  const [currentView, setCurrentView] = useState<WorkspaceView>(() => {
    const initialActId = location.state?.initialActId;
    const initialDetailView = location.state?.initialDetailView;
    const initialAgreementId =
      initialDetailView?.type === "agreement-editor"
        ? initialDetailView.agreementId
        : null;
    if (initialActId) {
      return {
        main: { type: "act-edit", actId: initialActId },
        detail: initialDetailView || { type: "agreement-list" },
        activeActId: initialActId,
        activeAgreementId: initialAgreementId,
      };
    }
    return {
      main: { type: "cover" },
      detail: { type: "none" },
      activeActId: null,
      activeAgreementId: null,
    };
  });

  const onRegisterSaveHandler = useCallback((handler: SaveHandler | null) => {
    activeSaveHandlerRef.current = handler;
  }, []);

  useEffect(() => {
    const loadWorkspace = async () => {
      if (!tomeId) {
        toast.error("ID de tomo no proporcionado");
        navigate("/books");
        return;
      }

      setIsLoading(true);
      try {
        console.log("🔍 Cargando tomo:", tomeId);

        const [foundTome, propietarios] = await Promise.all([
          volumeService.getVolumeById(tomeId!),
          participantsService.getPropietarios(), // <-- Cargar concejales
        ]);

        console.log("✅ Tomo cargado:", foundTome);
        console.log("✅ Propietarios cargados:", propietarios);

        const foundActs = await actService.getActsByVolumeId(tomeId!);
        console.log("✅ Actas cargadas:", foundActs);

        setTome({
          ...foundTome,
          acts: foundActs,
        });

        setAllSigners([OFFICIAL_SECRETARY, OFFICIAL_SYNDIC, ...propietarios]);

        const bookId = foundTome.book.id;
        const foundBook = await bookService.getBookById(bookId);
        console.log("✅ Libro padre cargado:", foundBook);

        setParentBook(foundBook);
        setNewBookName(foundBook.name);

        const volumes = await volumeService.getVolumesByBookId(bookId);
        console.log("✅ Volúmenes del libro:", volumes);
        setAllVolumes(volumes);
      } catch (error: any) {
        console.error("❌ Error al cargar workspace:", error);
        toast.error(
          error.response?.data?.message || "No se pudo cargar el tomo"
        );
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
    } catch (error: any) {
      console.error("❌ Error al renombrar libro:", error);
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
        const updatedTome = await volumeService.updateVolume(
          tomeId,
          updatedTomeData
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
        toast.success("Cambios guardados exitosamente", { id: toastId });
      } catch (error: any) {
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
      // Llamar al servicio
      await actService.deleteAct(actToDelete.id);

      // Actualizar estado local (Tome)
      setTome((prevTome) => {
        if (!prevTome || !prevTome.acts) return prevTome;
        const updatedActs = prevTome.acts.filter(
          (a) => a.id !== actToDelete.id
        );
        // Recalcular números después de eliminar
        return recalculateNumbers({ ...prevTome, acts: updatedActs });
      });

      toast.success("Acta eliminada exitosamente.", { id: toastId });
      setActToDelete(null); // Cerrar modal
      setConfirmationText("");
    } catch (error: any) {
      console.error("❌ Error al eliminar acta:", error);
      toast.error(error.message || "No se pudo eliminar el acta", {
        id: toastId,
      });
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

  // ✅ 5. Lógica para confirmar la eliminación (Acuerdo)
  const handleConfirmDeleteAgreement = async () => {
    if (!agreementToDelete || !currentView.activeActId || isDeletingAgreement)
      return;

    setIsDeletingAgreement(true);
    const toastId = toast.loading("Eliminando acuerdo...");

    try {
      // 1. Llamar al servicio API
      await agreementService.deleteAgreement(agreementToDelete.id);

      // 2. Refrescar el acta actual para actualizar la lista
      // (Esto es más limpio que manipular el estado local)
      await refetchActiveAct({ showLoadingScreen: false });

      toast.success("Acuerdo eliminado exitosamente.", { id: toastId });
      setAgreementToDelete(null); // Cerrar modal
      setConfirmationText("");
    } catch (error: any) {
      console.error("❌ Error al eliminar acuerdo:", error);
      toast.error(error.message || "No se pudo eliminar el acuerdo", {
        id: toastId,
      });
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
        } catch (error: any) {
          console.error("❌ Error al cargar acta por ID:", error);
          toast.error("No se pudo cargar el acta para edición.");
          setCurrentView({
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
  }, [currentView.main.type, currentView.activeActId, setTome]);

  const handleActUpdate = useCallback(
    async (updatedAct: Act) => {
      if (!tome || !tome.acts) return;
      try {
        await actService.updateAct(updatedAct);
        setTome((prevTome) => {
          if (!prevTome) return null;
          const updatedActs = prevTome.acts!.map((act) =>
            act.id === updatedAct.id ? updatedAct : act
          );
          return { ...prevTome, acts: updatedActs };
        });
      } catch (error: any) {
        console.error("❌ Error al guardar acta:", error);
        throw new Error(error.message || "No se pudo guardar el acta");
      }
    },
    [tome]
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
      };

      const newActFromBackend = await actService.createAct(payload);

      setTome((prevTome) => {
        if (!prevTome) return null;
        return {
          ...prevTome,
          acts: [...(prevTome.acts || []), newActFromBackend],
        };
      });

      setCurrentView({
        main: { type: "act-edit", actId: newActFromBackend.id },
        detail: { type: "agreement-list" },
        activeActId: newActFromBackend.id,
        activeAgreementId: null,
      });

      toast.success("Acta creada exitosamente", { id: toastId });
    } catch (error: any) {
      console.error("❌ Error al crear acta:", error);
      toast.error(error.message || "No se pudo crear el acta", { id: toastId });
    } finally {
      setIsCreatingAct(false);
    }
  };

  // ✅ Sin cambios
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
    // Leemos el handler MÁS RECIENTE directamente desde el Ref
    const saveHandler = activeSaveHandlerRef.current;

    if (!saveHandler) {
      // Esta es la validación que evita el crash.
      // Ocurre si saliste del formulario (ActEditor)
      // antes de presionar "Guardar y Salir".
      toast.error("Error al guardar: No hay un formulario activo.", {
        description:
          "El formulario que estabas editando ya no está visible. Cierra este diálogo y vuelve a la sección que querías guardar.",
      });
      return; // Salir
    }

    try {
      // Si llegamos aquí, saveHandler ES una función.
      const success = await saveHandler(); // ¡Llamar a la función del Ref!

      if (success) {
        // El 'useSaveAction' (dentro del hijo) ya habrá llamado
        // a setHasUnsavedChanges(false) a través de su 'onSuccess'.
        setShowExitDialog(false);
        navigate("/books");
      } else {
        // El hook useSaveAction ya mostró el toast de error.
        // Mantenemos el modal abierto.
      }
    } catch (error) {
      // Esto captura cualquier error DENTRO de la función de guardado
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
        } catch (error: Error) {
          console.error("❌ Error al recargar acta por ID:", error);
          toast.error(error.message || "No se pudo recargar el acta.");
        } finally {
          if (showLoadingScreen) {
            setIsActLoading(false);
          }
        }
      }
    },
    [currentView.activeActId, currentView.main.type]
  );

  useEffect(() => {
    refetchActiveAct();
  }, [refetchActiveAct]);

  const handleReorderAct = async (actId: string, direction: "up" | "down") => {
    if (!tome || !tome.acts || isReordering) return;

    const originalActs = tome.acts;
    const movingActIndex = originalActs.findIndex((a) => a.id === actId);
    if (movingActIndex === -1) return;

    const targetActIndex =
      direction === "up" ? movingActIndex - 1 : movingActIndex + 1;
    if (targetActIndex < 0 || targetActIndex >= originalActs.length) {
      return;
    }

    const movingAct = originalActs[movingActIndex];
    const targetAct = originalActs[targetActIndex];

    setIsReordering(true);
    const toastId = toast.loading("Reordenando actas...");

    try {
      await actService.updateActNameNumber(
        movingAct.id,
        targetAct.name,
        targetAct.actNumber!
      );

      const reorderedActs = reorderArray(originalActs, actId, direction);
      const newState = recalculateNumbers({ ...tome, acts: reorderedActs });

      setTome(newState);
      toast.success("Actas reordenadas exitosamente", { id: toastId });
    } catch (error: any) {
      console.error("❌ Error al reordenar actas:", error);
      toast.error(error.message || "No se pudo reordenar las actas", {
        id: toastId,
      });
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
    } catch (error: any) {
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
    } catch (error: any) {
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
        {isReadOnly && (
          <span
            className="text-purple-600 font-semibold text-xs ml-2"
            title="Finalizado"
          >
            (FINALIZADO - SOLO LECTURA)
          </span>
        )}
      </div>

      <Sheet>
        <SheetTrigger asChild className="gap-0!">
          <Button variant="outline" className="shadow-none">
            <PanelRightOpen className="mr-2 h-4 w-4" />
            Vista Previa (PDF)
          </Button>
        </SheetTrigger>
        <SheetContent className="w-full sm:max-w-[800px] p-0 flex flex-col">
          <SheetHeader className="p-4 border-b flex flex-row items-center justify-between">
            <SheetTitle>Vista Previa del Tomo (PDF)</SheetTitle>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleTomeUpdate({})}
            >
              <RefreshCw className="mr-2 h-4 w-4" />
              Recargar
            </Button>
          </SheetHeader>
          <div className="flex-1 overflow-hidden">
            <BookPdfPreview
              key={previewKey}
              tome={tome}
              allSigners={allSigners}
            />
          </div>
        </SheetContent>
      </Sheet>
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
            onViewChange={setCurrentView}
          />
        </div>
        <div className="flex-1 flex min-w-0">
          <BookEditor
            tome={tome}
            currentView={currentView}
            setCurrentView={setCurrentView}
            onUpdateTome={handleTomeUpdate}
            onUpdateAct={handleActUpdate}
            onCreateActa={handleCreateAct}
            setHasUnsavedChanges={setHasUnsavedChanges}
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
