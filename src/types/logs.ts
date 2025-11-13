// filepath: src/types/logs.ts
import { type User } from "./user";

export type LogAction =
  | "CREATED"
  | "UPDATED"
  | "DELETED"
  | "EXPORTED"
  | "FINALIZED"
  | "ARCHIVED"
  | "RESTORED"
  | "USER_CREATED"
  | "USER_UPDATED"
  | "USER_DELETED"
  | "SESSION_LOGIN"
  | "SESSION_LOGOUT"
  | "SESSION_TERMINATED"
  | "VIEWED_BOOK"
  | "VIEWED_ACT";

export type LogTargetType = "Book" | "Act" | "Agreement" | "User";

export type ActivityLog = {
  id: string;
  user: Pick<User, "nombre">; // ✅ CORREGIDO
  action: LogAction;
  target: {
    type: LogTargetType;
    name: string;
    url: string;
    state?: Record<string, unknown>;
  };
  timestamp: string;
};

export type FullActivityLog = {
  id: string;
  user: Pick<User, "nombre">; // ✅ CORREGIDO
  action: LogAction;
  targetType: LogTargetType;
  targetName: string;
  targetUrl: string;
  targetState?: Record<string, unknown>;
  timestamp: string;
};
