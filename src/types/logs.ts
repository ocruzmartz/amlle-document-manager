import { type User } from "./user";

export type ActivityLog = {
  id: string;
  user: Pick<User, "firstName" | "lastName">;
  action: "CREATED" | "UPDATED" | "DELETED" | "EXPORTED" | "FINALIZED";
  target: {
    type: "Libro" | "Acta" | "Acuerdo";
    name: string;
    url: string;
  };

  timestamp: string;
};
