// filepath: src/types/user.ts
/**
 * Defines the possible roles a user can have within the system.
 * (Using Spanish values as indicated by TypeScript errors)
 */
export type UserRole = "ADMIN" | "EDITOR" | "LECTOR"; // Reverted to LECTOR

/**
 * Defines the possible statuses of a user account.
 * INACTIVE represents the "stand-by" state.
 */
export type UserStatus = "ACTIVE" | "INACTIVE";

/**
 * Defines the type of session duration for a user.
 * (Using Spanish values as indicated by TypeScript errors)
 */
export type SessionType = "INDEFINITE" | "TEMPORAL"; // Reverted to TEMPORAL

/**
 * Represents a user within the application.
 */
export type User = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  sessionType: SessionType;
  sessionExpiresAt: string | null; // ISO date string if temporary, null if indefinite
  lastLogin: string | null; // ISO date string of the last login
  createdAt: string; // ISO date string when the user was created - ADDED BACK
};

/**
 * Represents a simplified user structure, potentially for logs or dropdowns.
 */
export type SimpleUser = {
  id: string;
  firstName: string;
  lastName: string;
  username: string; // Likely the user's email
};