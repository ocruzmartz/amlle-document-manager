import { useState, useCallback, useEffect, useRef } from 'react';
import { toast } from 'sonner';
import { isEqual } from 'lodash'; // ✅ Importar desde la librería principal

interface UseSaveActionProps<TData> {
  initialData: TData; // Los datos originales al cargar
  currentData: TData; // Los datos actuales en el estado local
  onSave: (dataToSave: TData) => Promise<void> | void; // La función que guarda (puede ser async)
  onSuccess?: (savedData: TData) => void; // Callback opcional post-guardado exitoso
  setHasUnsavedChanges?: (hasChanges: boolean) => void; // Para el flag global
  loadingMessage?: string;
  successMessage?: string;
  errorMessage?: string;
}

export const useSaveAction = <TData>({
  initialData,
  currentData,
  onSave,
  onSuccess,
  setHasUnsavedChanges,
  loadingMessage = 'Guardando...',
  successMessage = 'Guardado exitosamente.',
  errorMessage = 'Error al guardar.',
}: UseSaveActionProps<TData>) => {
  const [isSaving, setIsSaving] = useState(false);
  const [isDirty, setIsDirty] = useState(false);
  // Usamos una ref para la data inicial para que no cambie en cada render
  const initialDataRef = useRef(initialData);

  // Actualizar la ref inicial si el prop `initialData` cambia (ej. al cargar nueva acta)
  // y recalcular isDirty inmediatamente
  useEffect(() => {
    initialDataRef.current = initialData;
    const hasChanged = !isEqual(currentData, initialDataRef.current);
    setIsDirty(hasChanged);
    if (setHasUnsavedChanges) {
      setHasUnsavedChanges(hasChanged);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialData]); // Dependencia solo de initialData

  // Comprobar si hay cambios cuando currentData se actualiza
  useEffect(() => {
    const hasChanged = !isEqual(currentData, initialDataRef.current);
    setIsDirty(hasChanged);
    if (setHasUnsavedChanges) {
      setHasUnsavedChanges(hasChanged);
    }
  }, [currentData, setHasUnsavedChanges]); // Dependencia correcta

  const handleSave = useCallback(async () => {
    if (!isDirty || isSaving) return;

    setIsSaving(true);
    const toastId = toast.loading(loadingMessage);

    try {
      // Llamamos a la función onSave que nos pasaron
      await onSave(currentData);

      // Actualizamos la ref inicial AHORA, después del guardado exitoso
      initialDataRef.current = currentData;
      setIsDirty(false); // Reiniciar dirty state local
      if (setHasUnsavedChanges) {
        setHasUnsavedChanges(false); // Reiniciar flag global
      }
      toast.success(successMessage, { id: toastId });
      setIsSaving(false); // Marcar como no guardando ANTES de onSuccess
      if (onSuccess) {
        onSuccess(currentData); // Ejecutar callback post-guardado (ej: form.reset)
      }
    } catch (error) {
      console.error('Error en useSaveAction:', error);
      toast.error(errorMessage, { id: toastId });
      setIsSaving(false);
    }
  }, [ // Dependencias correctas
    isDirty,
    isSaving,
    currentData,
    onSave,
    onSuccess,
    setHasUnsavedChanges,
    loadingMessage,
    successMessage,
    errorMessage,
  ]);

  return {
    handleSave, // La función para llamar desde el botón
    isDirty,    // Para habilitar/deshabilitar el botón
    isSaving,   // Para mostrar estado de carga en el botón
  };
};