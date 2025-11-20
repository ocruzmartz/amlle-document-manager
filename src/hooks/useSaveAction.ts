import { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import { isEqual } from "lodash";

interface UseSaveActionProps<TData> {
  initialData: TData;
  currentData: TData;
  onSave: (dataToSave: TData) => Promise<void> | void;
  onSuccess?: (savedData: TData) => void;
  setHasUnsavedChanges?: (hasChanges: boolean) => void;
  onStateChange?: (state: { dirty: boolean; saving: boolean }) => void;
  loadingMessage?: string;
  successMessage?: string;
  errorMessage?: string;
}

export const useSaveAction = <TData>({
  initialData,
  currentData,
  onSave,
  onSuccess,
  onStateChange,
  loadingMessage = "Guardando...",
  successMessage = "Guardado exitosamente.",
  errorMessage = "Error al guardar.",
}: UseSaveActionProps<TData>) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  const initialDataRef = useRef(initialData);
  const currentDataRef = useRef(currentData);
  const isSavingRef = useRef(isSaving);
  const isDirtyRef = useRef(isDirty);

  useEffect(() => {
    currentDataRef.current = currentData;
  }, [currentData]);

  useEffect(() => {
    isSavingRef.current = isSaving;
  }, [isSaving]);

  useEffect(() => {
    isDirtyRef.current = isDirty;
  }, [isDirty]);

  useEffect(() => {
    initialDataRef.current = initialData;
    const hasChanged = !isEqual(currentData, initialDataRef.current);
    setIsDirty(hasChanged);
   if (onStateChange) {
      onStateChange({ dirty: hasChanged, saving: isSavingRef.current });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]);

  useEffect(() => {
    const hasChanged = !isEqual(currentData, initialDataRef.current);
    setIsDirty(hasChanged);
    if (onStateChange) {
      onStateChange({ dirty: hasChanged, saving: isSavingRef.current });
    }
  }, [currentData, onStateChange]);

  useEffect(() => {
    return () => {
      if (onStateChange) {
        onStateChange({ dirty: false, saving: false });
      }
    };
  }, [onStateChange]);

  const handleSave = useCallback(async (): Promise<boolean> => {
    if (!isDirtyRef.current || isSavingRef.current) return false;

    setIsSaving(true);
    if (onStateChange) {
      onStateChange({ dirty: isDirtyRef.current, saving: true });
    }
    const toastId = toast.loading(loadingMessage);

    try {
      await onSave(currentDataRef.current);

      initialDataRef.current = currentDataRef.current;
      setIsDirty(false);
      if (onStateChange) {
        onStateChange({ dirty: false, saving: false });
      }
      toast.success(successMessage, { id: toastId });
      setIsSaving(false);
      if (onSuccess) {
        onSuccess(currentDataRef.current);
      }
      return true;
    } catch (error) {
      console.error("Error en useSaveAction:", error);
      toast.error(errorMessage, { id: toastId });
      setIsSaving(false);
      return false;
    }
  }, [
    onSave,
    onSuccess,
    onStateChange,
    loadingMessage,
    successMessage,
    errorMessage,
  ]);

  return {
    handleSave,
    isDirty,
    isSaving,
  };
};
