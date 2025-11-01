// filepath: src/types/logs.ts
// Import the full User type to structure the 'user' field in log entries
import { type User } from "./user";

/**
 * Defines all possible actions that can be recorded in the audit log.
 * Includes generic CRUD, book-specific actions, user management actions,
 * session actions, and access/view actions. All identifiers are in English.
 */
export type LogAction =
  // Generic CRUD actions
  | "CREATED"           // Creation of Book, Act, Agreement
  | "UPDATED"           // Modification of Book, Act, Agreement
  | "DELETED"           // Deletion of Book, Act, Agreement

  // Book/Content specific actions
  | "EXPORTED"          // PDF Export action (likely for Book)
  | "FINALIZED"         // Marking a Book as finalized

  // User Management actions
  | "USER_CREATED"      // Creation of a new user account
  | "USER_UPDATED"      // Modification of user data or permissions
  | "USER_DELETED"      // Deletion of a user account

  // Session (Authentication) actions
  | "SESSION_LOGIN"       // Successful user login event
  | "SESSION_LOGOUT"      // Voluntary user logout event
  | "SESSION_TERMINATED"  // Session forcefully terminated by an admin
  // | "SESSION_EXPIRED"     // (Optional) Session expired automatically

  // Access/Read actions (for enhanced auditing)
  | "VIEWED_BOOK"         // User accessed/viewed a book's workspace
  | "VIEWED_ACT";        // User accessed/viewed a specific act (more granular)

/**
 * Defines the types of objects that can be the target of an audit log action.
 * Identifiers are in English.
 */
export type LogTargetType =
  | "Book"      // Corrected: Represents a Book object
  | "Act"       // Corrected: Represents an Act object
  | "Agreement" // Corrected: Represents an Agreement object
  | "User";     // Represents a user account object

/**
 * Basic structure for an activity log entry. This might be used in simpler
 * displays like a dashboard feed. Kept for potential backward compatibility or
 * specific use cases, but FullActivityLog is preferred for the main audit module.
 */
export type ActivityLog = {
  id: string;
  user: Pick<User, "firstName" | "lastName">; // User who performed the action
  action: LogAction;                           // The action performed
  target: {
    type: LogTargetType;                       // Type of the target object
    name: string;                              // Name of the target object at the time of action
    url: string;                               // URL to access the object (if applicable)
  };
  timestamp: string;                           // ISO 8601 timestamp of when the action occurred
};

/**
 * Flattened and comprehensive structure designed for the main Audit Log table/display.
 * Uses the updated LogAction and LogTargetType definitions.
 */
export type FullActivityLog = {
  id: string;                                  // Unique identifier for the log entry
  user: Pick<User, "firstName" | "lastName">; // User who performed the action
  action: LogAction;                           // The action performed (enum value)
  targetType: LogTargetType;                   // Type of the target object (enum value)
  targetName: string;                          // Name of the target object (captured at the time)
  targetUrl: string;                           // URL for navigation (e.g., '#', '/books/xyz')
  timestamp: string;                           // Precise ISO 8601 timestamp of the event
};