// filepath: src/types/agreement.ts

// El objeto completo (cuando se carga un acuerdo O en una lista)
export type Agreement = {
  id: string;
  name: string;
  agreementNumber?: number;
  content: string; // <-- Ahora siempre está presente

  // Campos que pueden o no estar en la lista (hacer opcionales)
  actId?: string;
  actName?: string;
  minutesName?: string;
  volumeName?: string;
  volumeId?: string;
  minutesId?: string;
  tomeId?: string;
  tomeName?: string | null;
  createdAt: string;
  createdBy?: string;
  createdByName?: string;
  lastModified?: string;
  latestModifierName?: string;
  latestModificationDate?: string;
  updatedAt?: string;
};
