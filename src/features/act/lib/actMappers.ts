import { type ActSessionType } from "@/types";

export const SessionTypeMapper = {
  fromBackend: (backendStatus: string): ActSessionType => {
    switch (backendStatus) {
      case "ORDINARIA":
        return "Ordinaria";
      case "EXTRAORDINARIA":
        return "Extraordinaria";
      case "ESPECIAL":
        return "Especial";
      default:
        return "Ordinaria";
    }
  },

  toBackend: (frontendType: ActSessionType | undefined): string => {
    if (!frontendType) return "ORDINARIA";

    switch (frontendType) {
      case "Ordinaria":
        return "ORDINARIA";
      case "Extraordinaria":
        return "EXTRAORDINARIA";
      case "Especial":
        return "ESPECIAL";
      default:
        return "ORDINARIA";
    }
  },

  toDisplayText: (type: ActSessionType | undefined): string => {
    if (!type) return "ordinaria";

    switch (type) {
      case "Ordinaria":
        return "ordinaria";
      case "Extraordinaria":
        return "extraordinaria";
      case "Especial":
        return "especial";
      default:
        return "ordinaria";
    }
  },
};
