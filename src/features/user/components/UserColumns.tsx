// filepath: src/features/user/components/UserColumns.tsx
import { type ColumnDef } from "@tanstack/react-table";
import { type User, type UserRole } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MoreHorizontal, ArrowUpDown, Edit, Ban } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { format, formatDistanceToNow, isValid, parseISO } from "date-fns";
import { es } from "date-fns/locale";

type RoleUIMap = Record<
  UserRole,
  {
    label: string;
    variant: "default" | "secondary" | "outline" | "destructive";
  }
>;

const roleMap: RoleUIMap = {
  admin: { label: "Admin", variant: "default" },
  editor: { label: "Editor", variant: "secondary" },
  lector: { label: "Lector", variant: "outline" },
  regular: { label: "Regular", variant: "outline" },
};

export const getColumns = (
  onEdit: (user: User) => void,
  //onDelete: (user: User) => void,
  onTerminateSession: (user: User) => void
): ColumnDef<User>[] => [
  // ... (Columnas 'nombre', 'rol', 'activo', 'sessionType' sin cambios) ...
  {
    accessorKey: "nombre",
    id: "nombre",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Nombre Completo
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="font-medium">{row.getValue("nombre")}</div>
    ),
    enableHiding: false,
  },
  {
    accessorKey: "rol",
    header: "Permisos",
    cell: ({ row }) => {
      const rol = row.getValue("rol") as UserRole;
      const { label, variant } = roleMap[rol] || {
        label: rol,
        variant: "secondary",
      };
      return <Badge variant={variant}>{label}</Badge>;
    },
    filterFn: (row, columnId, filterValue: string[]) => {
      const value = filterValue || [];
      return value.includes(row.getValue(columnId));
    },
  },
  {
    accessorKey: "activo",
    header: "Estado",
    cell: ({ row }) => {
      const activo = row.getValue("activo") as boolean;
      return (
        <Badge variant={activo ? "default" : "secondary"}>
          {activo ? "Activo" : "Inactivo"}
        </Badge>
      );
    },
    filterFn: (row, columnId, filterValue: boolean[]) => {
      const value = filterValue || [];
      return value.includes(row.getValue(columnId));
    },
  },
  {
    accessorKey: "sessionType",
    header: "Vencimiento de Sesión",
    cell: ({ row }) => {
      const sessionType = row.original.sessionType;
      const sessionDuration = row.original.sessionDuration;
      if (sessionType === "indefinida") {
        return <div className="text-muted-foreground italic">Indefinido</div>;
      }
      if (sessionType === "temporal") {
        return (
          <div className="font-medium">{sessionDuration || "Temporal"}</div>
        );
      }
      return <div className="text-muted-foreground">-</div>;
    },
  },
  {
    // 1. Columna "Fecha de Creación" (Exacta)
    accessorKey: "createdAt",
    // ❗️ Esta columna usará 'createdAt' como su ID por defecto,
    // lo cual coincide con el 'initialSorting' de la página.
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Fecha de Creación
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const createdAtISO = row.getValue("createdAt") as string | null;
      if (!createdAtISO) {
        return <div className="text-muted-foreground italic">N/A</div>;
      }
      const date = parseISO(createdAtISO);
      if (!isValid(date)) {
        return <div className="text-destructive">Fecha inválida</div>;
      }
      const exactTime = format(date, "dd/MM/yyyy HH:mm", { locale: es });
      return <div className="font-medium">{exactTime}</div>;
    },
    sortingFn: "datetime",
  },
  {
    // 2. Columna "Antigüedad" (Relativa)
    accessorKey: "createdAt", // Ambas usan el mismo accesor
    id: "antiguedad", // ✅ PERO esta tiene un ID personalizado
    header: "Antigüedad",
    cell: ({ row }) => {
      // Usamos 'row.getValue'
      const createdAtISO = row.getValue("createdAt") as string | null;
      if (!createdAtISO) {
        return <div className="text-muted-foreground italic">N/A</div>;
      }
      const date = parseISO(createdAtISO);
      if (!isValid(date)) {
        return <div className="text-destructive">Fecha inválida</div>;
      }
      const relativeTime = formatDistanceToNow(date, {
        addSuffix: true,
        locale: es,
      });
      return (
        <div title={format(date, "PPP p", { locale: es })}>{relativeTime}</div>
      );
    },
    sortingFn: "datetime",
  },

  // --- ✅ FIN DE LA CORRECCIÓN ---

  {
    id: "actions",
    cell: ({ row }) => {
      const user = row.original;
      const isActive = user.activo;

      return (
        <div className="text-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>
              <DropdownMenuItem onClick={() => onEdit(user)}>
                <Edit className="mr-2 h-4 w-4" />
                <span>Editar</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onTerminateSession(user)}
                disabled={!isActive}
              >
                <Ban className="mr-2 h-4 w-4" />
                Desactivar (Cerrar Sesión)
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {/* <DropdownMenuItem
                className="text-destructive focus:text-destructive focus:bg-destructive/10"
                onClick={() => onDelete(user)}
              >
                <Trash className="mr-2 h-4 w-4 text-destructive" />
                <span>Eliminar</span>
              </DropdownMenuItem> */}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
    enableSorting: false,
    enableHiding: false,
  },
];
