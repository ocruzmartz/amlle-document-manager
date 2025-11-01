// filepath: src/features/user/components/UserColumns.tsx
import { type ColumnDef } from "@tanstack/react-table";
import { type User, type UserRole, type UserStatus } from "@/types"; // Import updated User types
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ArrowUpDown, Edit, Trash, Ban } from "lucide-react"; // Icons
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"; // Dropdown components
// Import date-fns functions for formatting dates and relative times
import { format, formatDistanceToNow, isValid, parseISO } from "date-fns";
import { es } from "date-fns/locale"; // Spanish locale for date formatting

// Type definition for mapping roles/statuses to UI elements
type UIMap<T extends string> = Record<
  T,
  {
    label: string;
    variant: "default" | "secondary" | "outline" | "destructive";
  }
>;

// Mapping from UserRole enum to display text (Spanish) and Badge variant
const roleMap: UIMap<UserRole> = {
  ADMIN: { label: "Admin", variant: "default" },
  EDITOR: { label: "Editor", variant: "secondary" },
  LECTOR: { label: "Lector", variant: "outline" }, // Corrected enum value, UI Text: Spanish
};

// Mapping from UserStatus enum to display text (Spanish) and Badge variant
const statusMap: UIMap<UserStatus> = {
  ACTIVE: { label: "Activo", variant: "default" }, // UI Text: Spanish
  INACTIVE: { label: "Inactivo", variant: "secondary" }, // UI Text: Spanish
};

/**
 * Generates the column definitions for the user data table.
 * @param onEdit - Callback function invoked when the 'Edit' action is clicked.
 * @param onDelete - Callback function invoked when the 'Delete' action is clicked.
 * @param onTerminateSession - Callback function invoked when the 'Terminate Session' action is clicked.
 * @returns An array of ColumnDef objects for react-table.
 */
export const getColumns = (
  onEdit: (user: User) => void,
  onDelete: (user: User) => void,
  onTerminateSession: (user: User) => void
): ColumnDef<User>[] => [
  // --- Column: Full Name ---
  {
    // Combine firstName and lastName for sorting and display logic
    accessorFn: (row) => `${row.firstName} ${row.lastName}`,
    id: "fullName", // Unique ID for this derived column
    // UI Text: Spanish
    header: (
      { column } // Make header clickable for sorting
    ) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Nombre Completo
        <ArrowUpDown className="ml-2 h-4 w-4" /> {/* Sort icon */}
      </Button>
    ),
    cell: ({ row }) => (
      // Display first and last name in the cell
      <div className="font-medium">
        {row.original.firstName} {row.original.lastName}
      </div>
    ),
    enableHiding: false, // Prevent users from hiding this essential column
  },

  // --- Column: Email ---
  {
    accessorKey: "email",
    // UI Text: Spanish
    header: "Correo Electrónico",
    // Default cell rendering is sufficient
  },

  // --- Column: Permissions (Role) ---
  {
    accessorKey: "role",
    // UI Text: Spanish
    header: "Permisos",
    cell: ({ row }) => {
      const role = row.getValue("role") as UserRole;
      // Get display label (Spanish) and badge variant from the map
      const { label, variant } = roleMap[role] || {
        label: role,
        variant: "secondary",
      }; // Fallback
      return <Badge variant={variant}>{label}</Badge>;
    },
    // Custom filter function for faceted filtering
    filterFn: (row, columnId, filterValue: string[]) => {
      // Check if the row's role value is included in the array of selected filter values
      // Ensure filterValue is treated as an array
      const value = filterValue || [];
      return value.includes(row.getValue(columnId));
    },
    enableSorting: false, // Sorting is usually less useful for role/status columns
  },

  // --- Column: Status ---
  {
    accessorKey: "status",
    // UI Text: Spanish
    header: "Estado",
    cell: ({ row }) => {
      const status = row.getValue("status") as UserStatus;
      // Get display label (Spanish) and badge variant from the map
      const { label, variant } = statusMap[status] || {
        label: status,
        variant: "secondary",
      }; // Fallback
      return <Badge variant={variant}>{label}</Badge>;
    },
    // Custom filter function for faceted filtering
    filterFn: (row, columnId, filterValue: string[]) => {
      const value = filterValue || [];
      return value.includes(row.getValue(columnId));
    },
    enableSorting: false,
  },

  // --- Column: Session Expiration ---
  {
    accessorKey: "sessionExpiresAt",
    // UI Text: Spanish
    header: "Vencimiento de Sesión",
    cell: ({ row }) => {
      const sessionType = row.original.sessionType;
      const expiresAtISO = row.getValue("sessionExpiresAt") as string | null;

      // Display "Indefinido" if session type is INDEFINITE
      if (sessionType === "INDEFINITE") {
        // UI Text: Spanish
        return <div className="text-muted-foreground italic">Indefinido</div>;
      }
      // Display placeholder if date is missing (shouldn't happen if TEMPORARY, but good practice)
      if (!expiresAtISO) {
        return <div className="text-muted-foreground">-</div>;
      }

      // Parse the ISO string into a Date object
      const expiryDate = parseISO(expiresAtISO);
      // Validate the parsed date
      if (!isValid(expiryDate)) {
        // UI Text: Spanish
        return <div className="text-destructive">Fecha inválida</div>;
      }

      // Check if the session has already expired
      const hasExpired = expiryDate.getTime() < Date.now();
      // Calculate relative time string (e.g., "in 2 hours", "hace 3 días") using Spanish locale
      const relativeTime = formatDistanceToNow(expiryDate, {
        addSuffix: true,
        locale: es,
      });

      // Render the relative time, adding a red color if expired.
      // Use the 'title' attribute to show the exact date/time on hover.
      return (
        <div
          className={hasExpired ? "text-destructive" : ""}
          title={format(expiryDate, "PPP p", { locale: es })} // Format: Oct 28, 2025 4:16 PM
        >
          {relativeTime}
        </div>
      );
    },
    // Enable sorting based on the date/time value
    sortingFn: "datetime", // Use react-table's built-in datetime sorter
    enableSorting: true,
  },

  // --- Column: Last Login ---
  {
    accessorKey: "lastLogin",
    // UI Text: Spanish
    header: "Último Inicio",
    cell: ({ row }) => {
      const lastLoginISO = row.getValue("lastLogin") as string | null;
      // Display "Nunca" if lastLogin is null
      if (!lastLoginISO) {
        // UI Text: Spanish
        return <div className="text-muted-foreground italic">Nunca</div>;
      }
      // Parse and validate the date
      const loginDate = parseISO(lastLoginISO);
      if (!isValid(loginDate)) {
        // UI Text: Spanish
        return <div className="text-destructive">Fecha inválida</div>;
      }
      // Calculate relative time string in Spanish
      const relativeTime = formatDistanceToNow(loginDate, {
        addSuffix: true,
        locale: es,
      });

      // Render relative time with exact date/time in tooltip
      return (
        <div title={format(loginDate, "PPP p", { locale: es })}>
          {relativeTime}
        </div>
      );
    },
    // Enable date/time sorting
    sortingFn: "datetime",
    enableSorting: true,
  },

  // --- Column: Actions ---
  {
    id: "actions", // Unique ID for the actions column
    cell: ({ row }) => {
      const user = row.original;
      const isActive = user.status === "ACTIVE"; // Check user status for disabling terminate action

      return (
        // Center the dropdown trigger button
        <div className="text-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              {/* Trigger button (three dots) */}
              <Button variant="ghost" className="h-8 w-8 p-0">
                {/* Screen reader text (Spanish) */}
                <span className="sr-only">Abrir menú de acciones</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            {/* Align dropdown menu content to the end (right) */}
            <DropdownMenuContent align="end">
              {/* UI Text: Spanish */}
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              {/* Edit User Action */}
              {/* UI Text: Spanish */}
              <DropdownMenuItem onClick={() => onEdit(user)}>
                <Edit className="mr-2 h-4 w-4" />
                <span>Editar</span>
              </DropdownMenuItem>
              {/* Terminate Session Action */}
              {/* UI Text: Spanish */}
              <DropdownMenuItem
                onClick={() => onTerminateSession(user)}
                disabled={!isActive} // Disable if user is already INACTIVE
              >
                <Ban className="mr-2 h-4 w-4" />
                Terminar Sesión
              </DropdownMenuItem>
              <DropdownMenuSeparator /> {/* Visual separator */}
              {/* Delete User Action (with destructive styling) */}
              {/* UI Text: Spanish */}
              <DropdownMenuItem
                className="text-destructive focus:text-destructive focus:bg-destructive/10" // Apply red color for delete
                onClick={() => onDelete(user)}
              >
                <Trash className="mr-2 h-4 w-4 text-destructive" />
                 <span>Eliminar</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
    enableSorting: false, // Actions column shouldn't be sortable
    enableHiding: false, // Actions column should always be visible
  },
];
