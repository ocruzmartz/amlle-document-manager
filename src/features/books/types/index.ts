// filepath: src/features/books/types/index.ts
// ✅ 1. Definimos los tipos para las columnas principales
export type MainView =
  | { type: "cover" }
  | { type: "acta-list" }
  | { type: "acta-edit"; actaId: string };

// ✅ 2. Definimos los tipos para la columna de detalle (la tercera columna)
export type DetailView =
  | { type: "none" } // No hay nada seleccionado
  | { type: "agreement-list" }
  | { type: "agreement-editor"; agreementId: string };

// ✅ 3. Combinamos todo en un único tipo para el estado del workspace
export type WorkspaceView = {
  main: MainView;
  detail: DetailView;
  // Guardamos el ID del acta activa para que la columna de detalle sepa a qué pertenece
  activeActId: string | null;
};