// filepath: src/features/user/schemas/userFormSchema.ts
import { z } from "zod";
// Import base types directly from `types` using correct English names
import { type User, type UserRole, type UserStatus, type SessionType } from "@/types";

// Zod validation schema definition
export const userFormSchema = z
  .object({
    // --- Basic Info ---
    id: z.string().optional(), // ID is optional (present only in edit mode)
    firstName: z
      .string()
      .trim() // Remove leading/trailing whitespace
      .min(2, { message: "First name must be at least 2 characters long." }),
    lastName: z
      .string()
      .trim()
      .min(2, { message: "Last name must be at least 2 characters long." }),
    email: z
      .string()
      .email({ message: "Must be a valid email address." })
      .trim(),

    // --- Password ---
    // Password: required on create, optional on edit. Allows empty string for edit case.
    password: z
      .string()
      .min(8, { message: "Password must be at least 8 characters long." })
      .optional()
      .or(z.literal("")), // Allows empty string if user is not changing password during edit
    confirmPassword: z.string().optional(), // Confirmation field

    // --- Permissions & Status ---
    // Use correct enum values
    role: z.enum(["ADMIN", "EDITOR", "LECTOR"] as const, {
      error: "A permission level (role) must be selected.", // Error if no role selected
    }),
    status: z.enum(["ACTIVE", "INACTIVE"] as const), // For 'active' or 'stand-by' state

    // --- Session Control ---
    // Use correct enum values
    sessionType: z.enum(["INDEFINITE", "TEMPORAL"]),
    sessionDuration: z
      .number({ error: "Duration must be a number." }) // Error if not a number
      .positive({ message: "Duration must be greater than zero." }) // Must be positive
      .int({ message: "Duration must be a whole number (integer)." }) // Must be an integer
      .nullable() // Allows null if sessionType is INDEFINITE
      .optional(), // Make the field itself optional in the base object
  })
  // --- Refinements (Cross-field Validations) ---

  // Refinement #1: Duration is required if sessionType is TEMPORAL
  .refine(
    (data) => {
      // If type is TEMPORAL, duration must be provided and valid (> 0)
      // Use TEMPORAL here for comparison
      if (data.sessionType === "TEMPORAL" && (data.sessionDuration === null || data.sessionDuration === undefined || data.sessionDuration <= 0)) {
        return false; // Validation fails
      }
      return true; // Validation passes
    },
    {
      // Error message specifically for temporary sessions missing duration
      message: "A valid duration (in hours, greater than 0) must be selected or entered for temporary sessions.",
      path: ["sessionDuration"], // Associate the error with the sessionDuration field
    }
  )
  // Refinement #2: Password confirmation must match password
  .refine(
    (data) => {
       // If a password was entered (not empty or undefined), the confirmation must match
      if (data.password && data.password.length > 0 && data.password !== data.confirmPassword) {
        return false; // Passwords don't match
      }
      return true; // Passwords match or password wasn't being changed
    },
    {
      message: "Passwords do not match.",
      path: ["confirmPassword"], // Associate the error with the confirmPassword field
    }
  )
   // Refinement #3: Password is required when creating a new user (no ID present)
   .refine(
    (data) => {
       // If it's a new user (no data.id), password cannot be empty or just whitespace
      if (!data.id && (!data.password || data.password.trim().length === 0)) {
        return false; // Password is required for new users
      }
      return true; // Password provided or it's an existing user
    },
    {
      message: "Password is required for new users.",
      path: ["password"], // Associate the error with the password field
    }
  );


/**
 * Type inferred automatically from the Zod schema.
 * Represents the shape of the data after successful validation,
 * often used in the form's `onSubmit` handler.
 */
export type UserFormData = z.infer<typeof userFormSchema>;

/**
 * Type definition for the values managed by the react-hook-form state.
 * This might differ slightly from UserFormData (e.g., password optionality).
 */
export type UserFormValues = {
  id?: string;
  firstName: string;
  lastName: string;
  email: string;
  password?: string; // Optional during edit if not changing
  confirmPassword?: string;
  role: UserRole;
  status: UserStatus;
  sessionType: SessionType;
  sessionDuration: number | null | undefined; // Can be null (Indefinite) or undefined initially
};

/**
 * Helper function to generate default values for the user form.
 * Handles both create (user is null) and edit (user object provided) modes.
 * @param user - The user object to edit, or null to get defaults for creation.
 * @returns Default values suitable for `useForm`'s `defaultValues`.
 */
export const getDefaultValues = (user: User | null): UserFormValues => {
  // --- Create Mode Defaults ---
  if (!user) {
    return {
      firstName: "",
      lastName: "",
      email: "",
      password: "", // Start empty for creation
      confirmPassword: "", // Start empty
      role: "LECTOR", // Corrected default role
      status: "ACTIVE", // New users are active by default
      sessionType: "INDEFINITE", // Default session type
      sessionDuration: null, // No duration needed for indefinite
    };
  }

  // --- Edit Mode Defaults ---
  // Calculate initial duration based on expiry date, only if temporary
  let initialDuration: number | null = null;
  // Use TEMPORAL here for comparison
  if (user.sessionType === "TEMPORAL" && user.sessionExpiresAt) {
    try {
        const expiryDate = new Date(user.sessionExpiresAt);
        const now = Date.now();
        // Calculate difference in hours, rounding up
        const diffHours = Math.ceil((expiryDate.getTime() - now) / (1000 * 60 * 60));
        // Ensure duration is at least 1 hour, even if expired, for editing convenience
        initialDuration = Math.max(1, diffHours);
    } catch (e) {
        console.error("Error parsing sessionExpiresAt date:", user.sessionExpiresAt, e);
        initialDuration = 1; // Fallback to 1 hour on error
    }
  }

  return {
    id: user.id, // Include ID for edit mode identification
    firstName: user.firstName,
    lastName: user.lastName,
    email: user.email,
    password: "", // Password field is always cleared on load for editing
    confirmPassword: "", // Confirmation is also cleared
    role: user.role,
    status: user.status, // Load the user's current status
    sessionType: user.sessionType,
    sessionDuration: initialDuration, // Use calculated duration or null
  };
};