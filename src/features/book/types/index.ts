export type MainView =
  | { type: "cover" }
  | { type: "act-list" }
  | { type: "act-edit"; actId: string }
  | { type: "pdf-settings" };

export type DetailView =
  | { type: "none" }
  | { type: "agreement-list" }
  | { type: "agreement-editor"; agreementId: string };

export type WorkspaceView = {
  main: MainView;
  detail: DetailView;
  activeActId: string | null;
};
