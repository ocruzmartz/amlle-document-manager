// filepath: src/features/user/api/user.ts
import { type User } from "@/types"; // Import the main User type
// Import schema types and validation schema from the schemas directory
import { type UserFormData } from "@/features/user/schemas/userFormSchema";
// Import the (simulated) function to add audit logs
import { addAuditLog } from "@/features/audit/api/audit";
import { type SessionType } from "@/types"; // Import SessionType

// --- Simulated User Store ---
declare global {
  interface Window {
    usersStore?: User[];
  }
}

// Function to get initial demo users (corrected enum values and added createdAt)
const getInitialUsers = (): User[] => [
  {
    id: "user-1",
    firstName: "Admin",
    lastName: "Sistema",
    email: "admin@sistema.com",
    role: "ADMIN",
    status: "ACTIVE",
    sessionType: "INDEFINITE",
    sessionExpiresAt: null,
    lastLogin: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2h ago
    createdAt: new Date("2024-01-01T10:00:00Z").toISOString(), // Added createdAt
  },
  {
    id: "user-2",
    firstName: "Elena",
    lastName: "Rivera",
    email: "elena@sistema.com",
    role: "EDITOR",
    status: "ACTIVE",
    sessionType: "INDEFINITE",
    sessionExpiresAt: null,
    lastLogin: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // 10m ago
    createdAt: new Date("2024-05-10T09:00:00Z").toISOString(), // Added createdAt
  },
  {
    id: "user-3",
    firstName: "Jorge",
    lastName: "Lemus",
    email: "jorge@sistema.com",
    role: "LECTOR", // Corrected enum value
    status: "ACTIVE",
    sessionType: "TEMPORAL", // Corrected enum value
    sessionExpiresAt: new Date(Date.now() + 4 * 60 * 60 * 1000).toISOString(), // Expires in 4h
    lastLogin: new Date(Date.now() - 5 * 60 * 1000).toISOString(), // 5m ago
    createdAt: new Date("2024-10-01T11:00:00Z").toISOString(), // Added createdAt
  },
  {
    id: "user-4",
    firstName: "Carlos",
    lastName: "Pérez",
    email: "carlos@sistema.com",
    role: "EDITOR",
    status: "INACTIVE", // In "Stand-by"
    sessionType: "TEMPORAL", // Corrected enum value
    sessionExpiresAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // Expired 2 days ago
    lastLogin: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    createdAt: new Date("2024-03-15T14:30:00Z").toISOString(), // Added createdAt
  },
];

// Function to get the current user store (persists in DEV mode)
const getUsersStore = (): User[] => {
  if (import.meta.env.DEV) {
    if (!window.usersStore) {
      window.usersStore = getInitialUsers();
    }
    return window.usersStore;
  }
  // In production simulation, return a fresh copy each time
  return getInitialUsers();
};

// Function to update the user store (only works in DEV mode)
const setUsersStore = (users: User[]) => {
  if (import.meta.env.DEV) {
    window.usersStore = users;
  }
};

// --- Simulated CRUD Functions ---

/**
 * Gets all users from the system.
 * @returns An array of users, sorted by creation date descending.
 */
export const getUsers = (): User[] => {
  const users = getUsersStore();
  // Return a sorted copy, newest first (using createdAt)
  return [...users].sort(
    (a, b) =>
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
};

/**
 * Calculates the session expiration date based on type and duration.
 * @param sessionType - The type of session ('INDEFINITE' or 'TEMPORAL').
 * @param sessionDuration - The duration in hours (if temporary). Optional.
 * @returns The ISO expiration date string or null.
 */
const calculateExpiry = (
  sessionType: SessionType,
  sessionDuration: number | null | undefined // Accept undefined from form
): string | null => {
  if (sessionType === "INDEFINITE") {
    return null; // Indefinite sessions never expire
  }
  // Default to 1 hour if type is temporary but duration is missing or invalid
  const durationInHours = (sessionDuration && sessionDuration > 0) ? sessionDuration : 1;
  const expiryTime = Date.now() + durationInHours * 60 * 60 * 1000;
  return new Date(expiryTime).toISOString();
};

/**
 * Creates a new user in the system.
 * @param formData - The validated form data for the new user.
 * @returns The newly created user object.
 */
export const createUser = (formData: UserFormData): User => {
  const users = getUsersStore();
  const nowISO = new Date().toISOString();

  const newUser: User = {
    id: crypto.randomUUID(), // Generate unique ID
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email,
    role: formData.role,
    status: "ACTIVE", // New users are active by default
    sessionType: formData.sessionType,
    sessionExpiresAt: calculateExpiry(formData.sessionType, formData.sessionDuration),
    lastLogin: null, // User hasn't logged in yet
    createdAt: nowISO, // Include createdAt
  };

  // Simulate secure password handling
  // eslint-disable-next-line no-console
  console.log(`Simulando creación de contraseña segura para: ${formData.email}`);

  const updatedUsers = [newUser, ...users];
  setUsersStore(updatedUsers);

  // --- Audit Logging ---
  addAuditLog({
    action: "USER_CREATED",
    user: { firstName: "Admin", lastName: "Sistema" },
    target: {
      type: "User",
      name: `${newUser.firstName} ${newUser.lastName} (${newUser.email})`,
      url: `/users`,
    },
  });

  return newUser;
};

/**
 * Updates an existing user.
 * @param userId - The ID of the user to update.
 * @param formData - The validated new form data.
 * @returns The updated user object.
 * @throws If the user with the given ID is not found.
 */
export const updateUser = (userId: string, formData: UserFormData): User => {
  const users = getUsersStore();
  const userIndex = users.findIndex((u) => u.id === userId);

  if (userIndex === -1) {
    throw new Error(`User with ID ${userId} not found for update.`);
  }

  const existingUser = users[userIndex];

  // Recalculate expiry only if session type or duration actually changed
  let newExpiry: string | null = existingUser.sessionExpiresAt;
  // Use TEMPORAL here for comparison
  if (existingUser.sessionType !== formData.sessionType || (formData.sessionType === 'TEMPORAL')) {
      newExpiry = calculateExpiry(formData.sessionType, formData.sessionDuration);
  }

  const updatedUser: User = {
    ...existingUser, // Keep existing properties like id, createdAt, lastLogin
    firstName: formData.firstName,
    lastName: formData.lastName,
    email: formData.email,
    role: formData.role,
    status: formData.status,
    sessionType: formData.sessionType,
    sessionExpiresAt: newExpiry,
  };

  // Simulate updating password if a new one was provided
  if (formData.password) {
    // eslint-disable-next-line no-console
    console.log(`Simulando actualización de contraseña segura para user ID: ${userId}`);
  }

  users[userIndex] = updatedUser;
  setUsersStore([...users]); // Update store with a new array reference

  // --- Audit Logging ---
  addAuditLog({
    action: "USER_UPDATED",
    user: { firstName: "Admin", lastName: "Sistema" },
    target: {
      type: "User",
      name: `${updatedUser.firstName} ${updatedUser.lastName} (${updatedUser.email})`,
      url: `/users`,
    },
  });

  return updatedUser;
};

/**
 * Deletes a user from the system.
 * @param userId - The ID of the user to delete.
 * @throws If the user with the given ID is not found.
 */
export const deleteUser = (userId: string): void => {
  let users = getUsersStore();
  const userToDelete = users.find((u) => u.id === userId);

  if (!userToDelete) {
    throw new Error(`User with ID ${userId} not found for deletion.`);
  }

  users = users.filter((u) => u.id !== userId);
  setUsersStore(users);

  // --- Audit Logging ---
  addAuditLog({
    action: "USER_DELETED",
    user: { firstName: "Admin", lastName: "Sistema" },
    target: {
      type: "User",
      name: `${userToDelete.firstName} ${userToDelete.lastName} (${userToDelete.email})`,
      url: "#",
    },
  });
};

/**
 * Simulates forcefully terminating a user's session.
 * @param userId - The ID of the user whose session to terminate.
 */
export const terminateUserSession = (userId: string): void => {
  const users = getUsersStore();
  const userIndex = users.findIndex(u => u.id === userId);
  if (userIndex === -1) {
     console.warn(`User ${userId} not found for session termination.`);
     return;
  }
  const user = users[userIndex];

  // Simulate the action
  // eslint-disable-next-line no-console
  console.log(`Simulando terminación forzada de sesión para ${user.email}`);

  // Update user state locally: set to inactive
  users[userIndex] = { ...user, status: 'INACTIVE' };
  setUsersStore([...users]); // Update store

  // --- Audit Logging ---
  addAuditLog({
    action: "SESSION_TERMINATED",
    user: { firstName: "Admin", lastName: "Sistema" },
    target: {
      type: "User",
      name: `${user.firstName} ${user.lastName} (${user.email})`,
      url: `/users`,
    },
  });
};