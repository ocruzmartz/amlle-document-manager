export type WorkspaceView =
  | { type: "cover" }
  | { type: "acta-list" }
  | { type: "acta-edit"; actaId: string }
  | { type: "agreement-list"; actId: string }
  | { type: "agreement-editor"; actId: string; agreementId: string };
