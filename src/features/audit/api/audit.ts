// filepath: src/features/audit/api/audit.ts
// Import updated types using English names
import { type FullActivityLog, type User, type LogAction, type LogTargetType } from "@/types";

// --- Date Helper Function (no changes needed) ---
const now = new Date();
/** Helper to create dates relative to now */
const daysAgo = (days: number, hours: number = 0, minutes: number = 0): Date =>
  new Date(
    now.getTime() -
      days * 24 * 60 * 60 * 1000 - // Milliseconds in a day
      hours * 60 * 60 * 1000 -    // Milliseconds in an hour
      minutes * 60 * 1000       // Milliseconds in a minute
  );

// --- Simulated User Data (no changes needed) ---
// Simplified user objects for associating with logs
const simulatedUsers = {
  elena: { firstName: "Elena", lastName: "Rivera" },
  carlos: { firstName: "Carlos", lastName: "Pérez" },
  jorge: { firstName: "Jorge", lastName: "Lemus" },
  admin: { firstName: "Admin", lastName: "Sistema" },
};

// --- Simulated Log Store (using Window for DEV persistence) ---
declare global {
  interface Window {
    auditLogsStore?: FullActivityLog[];
  }
}

// --- Initial Simulated Audit Data (Expanded & Updated with English Types) ---
const getInitialLogs = (): FullActivityLog[] => [
  // --- TODAY's Logs (most recent first) ---
  {
    id: "log-11",
    user: simulatedUsers.jorge,
    action: "SESSION_LOGIN",
    targetType: "User",      // Corrected type
    targetName: "Jorge Lemus (jorge@sistema.com)",
    targetUrl: "/users",
    timestamp: daysAgo(0, 0, 5).toISOString(), // 5 min ago
  },
  {
    id: "log-12",
    user: simulatedUsers.jorge,
    action: "VIEWED_BOOK",
    targetType: "Book",       // Corrected type
    targetName: "Libro de Actas Municipales 2025", // Data name remains Spanish
    targetUrl: "/books/f4a9b8c7-d6e5-4f3g-2h1i-0j9k8l7m6n5o",
    timestamp: daysAgo(0, 0, 4).toISOString(), // 4 min ago
  },
  {
    id: "log-1",
    user: simulatedUsers.elena,
    action: "UPDATED",
    targetType: "Agreement",  // Corrected type
    targetName: "Acuerdo número Uno (Acta número Dos)", // Data name remains Spanish
    targetUrl: "/books/f4a9b8c7-d6e5-4f3g-2h1i-0j9k8l7m6n5o",
    timestamp: daysAgo(0, 0, 15).toISOString(), // 15 min ago
  },
   {
    id: "log-16",
    user: simulatedUsers.carlos,
    action: "SESSION_LOGOUT",
    targetType: "User",       // Corrected type
    targetName: "Carlos Pérez (carlos@sistema.com)",
    targetUrl: "/users",
    timestamp: daysAgo(0, 0, 30).toISOString(), // 30 min ago
  },
  {
    id: "log-13",
    user: simulatedUsers.admin,
    action: "USER_CREATED",
    targetType: "User",       // Corrected type
    targetName: "Jorge Lemus (jorge@sistema.com)",
    targetUrl: "/users",
    timestamp: daysAgo(0, 0, 45).toISOString(), // 45 min ago
  },
  {
    id: "log-2",
    user: simulatedUsers.carlos,
    action: "CREATED",
    targetType: "Act",         // Corrected type
    targetName: "Acta número Dos", // Data name remains Spanish
    targetUrl: "/books/f4a9b8c7-d6e5-4f3g-2h1i-0j9k8l7m6n5o",
    timestamp: daysAgo(0, 1, 30).toISOString(), // 1h 30m ago
  },
  {
    id: "log-14",
    user: simulatedUsers.elena,
    action: "SESSION_LOGIN",
    targetType: "User",       // Corrected type
    targetName: "Elena Rivera (elena@sistema.com)",
    targetUrl: "/users",
    timestamp: daysAgo(0, 2, 0).toISOString(), // 2h ago
  },

  // --- YESTERDAY's Logs ---
  {
    id: "log-3",
    user: simulatedUsers.admin,
    action: "DELETED",
    targetType: "Agreement",  // Corrected type
    targetName: "Acuerdo número Tres (Temporal)", // Data name remains Spanish
    targetUrl: "#", // No valid URL for deleted items
    timestamp: daysAgo(1, 4, 0).toISOString(), // Yesterday
  },
  {
    id: "log-4",
    user: simulatedUsers.admin,
    action: "FINALIZED",
    targetType: "Book",       // Corrected type
    targetName: "Libro de Acuerdos Varios 2024", // Data name remains Spanish
    targetUrl: "/books/8a7b3c2e-4f5g-6h7i-8j9k-1l2m3n4o5p6q",
    timestamp: daysAgo(1, 10, 0).toISOString(), // Yesterday
  },
  {
    id: "log-9",
    user: simulatedUsers.admin,
    action: "EXPORTED",
    targetType: "Book",       // Corrected type
    targetName: "Libro de Acuerdos Varios 2024", // Data name remains Spanish
    targetUrl: "/books/8a7b3c2e-4f5g-6h7i-8j9k-1l2m3n4o5p6q",
    timestamp: daysAgo(1, 11, 0).toISOString(), // Yesterday
  },

  // --- Logs from 2 DAYS AGO ---
   {
    id: "log-15",
    user: simulatedUsers.admin,
    action: "USER_UPDATED",
    targetType: "User",       // Corrected type
    targetName: "Carlos Pérez (carlos@sistema.com)",
    targetUrl: "/users",
    timestamp: daysAgo(2, 9, 0).toISOString(), // 2 days ago
  },
   {
    id: "log-17",
    user: simulatedUsers.admin,
    action: "SESSION_TERMINATED",
    targetType: "User",           // Corrected type
    targetName: "Usuario Sospechoso (test@sistema.com)", // Example name remains Spanish
    targetUrl: "/users",
    timestamp: daysAgo(2, 15, 0).toISOString(), // 2 days ago
  },

  // --- OLDER Logs ---
  {
    id: "log-5",
    user: simulatedUsers.elena,
    action: "UPDATED",
    targetType: "Act",         // Corrected type
    targetName: "Acta número Uno", // Data name remains Spanish
    targetUrl: "/books/f4a9b8c7-d6e5-4f3g-2h1i-0j9k8l7m6n5o",
    timestamp: daysAgo(5, 8, 0).toISOString(), // 5 days ago
  },
  // ... (any other older logs would follow the same pattern)
];

// --- Store Access Functions (logic remains the same) ---
/** Gets the current log store, initializing if needed in DEV mode */
const getLogsStore = (): FullActivityLog[] => {
  if (import.meta.env.DEV) {
    if (!window.auditLogsStore) {
      // Initialize with potentially updated initial logs
      window.auditLogsStore = getInitialLogs();
    }
    // Return a mutable copy from the store in DEV mode
    return window.auditLogsStore;
  }
  // Return fresh copy in prod simulation
  return getInitialLogs();
};

/** Updates the log store (DEV mode only) */
const setLogsStore = (logs: FullActivityLog[]) => {
  if (import.meta.env.DEV) {
    window.auditLogsStore = logs;
  }
};

// --- Exported API Functions ---

/**
 * Retrieves all audit log entries from the system.
 * @returns An array of all log entries, sorted by timestamp descending.
 */
export const getAllLogs = (): FullActivityLog[] => {
    const logs = getLogsStore();
    // Ensure consistent sorting: most recent first
    const sortedLogs = [...logs].sort(
      (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
    return sortedLogs; // Return the sorted array
};

/**
 * Adds a new audit log entry to the simulated store.
 * This function would be called internally by other API functions (createUser, updateBook, etc.)
 * in a real backend implementation. It's exported here for simulation purposes.
 * @param logData - The data for the new log entry.
 */
export const addAuditLog = (logData: {
  user: Pick<User, "firstName" | "lastName">; // User performing the action
  action: LogAction;                           // Action performed (using English enum)
  target: {
    type: LogTargetType;                       // Target type (using English enum)
    name: string;                              // Target name (can be Spanish data)
    url: string;                               // Target URL
  };
}): void => { // Return void as it just modifies the store
  const currentLogs = getLogsStore();

  const newLogEntry: FullActivityLog = {
    id: crypto.randomUUID(), // Generate unique ID
    user: logData.user,
    action: logData.action,
    targetType: logData.target.type,
    targetName: logData.target.name,
    targetUrl: logData.target.url,
    timestamp: new Date().toISOString(), // Record the exact time of logging
  };

  // Prepend the new log entry to the array and update the store
  const updatedLogs = [newLogEntry, ...currentLogs];
  setLogsStore(updatedLogs);

  // Optional: Log to console for debugging during development
  // eslint-disable-next-line no-console
  console.log("Audit Log Added:", newLogEntry);
};