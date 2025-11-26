export type Agreement = {
  id: string;
  name: string;
  agreementNumber?: number;
  content: string;

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
