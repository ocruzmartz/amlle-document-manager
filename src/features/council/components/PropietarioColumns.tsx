import { type ColumnDef } from "@tanstack/react-table";
import { type Propietario } from "@/types/council";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Edit,
  Trash,
  UserPlus,
  ArrowUpDown,
} from "lucide-react";
import { COUNCIL_ROLE_OPTIONS } from "../schemas/participantSchema";

interface GetColumnsProps {
  onEdit: (propietario: Propietario) => void;
  onDelete: (propietario: Propietario) => void;
  onAssign: (propietario: Propietario) => void;
}

// Helper para obtener el label bonito
const getRoleLabel = (value: string) => {
  return COUNCIL_ROLE_OPTIONS.find((o) => o.value === value)?.label || value;
};

// 1. Definimos los roles restringidos
const ROLES_WITHOUT_SUBSTITUTES = ["ALCALDESA", "SINDICO", "SECRETARIA"];

export const getPropietarioColumns = ({
  onEdit,
  onDelete,
  onAssign,
}: GetColumnsProps): ColumnDef<Propietario>[] => [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Nombre y Cargo
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => (
      <div className="flex flex-col py-1">
        <span className="font-medium text-base">{row.original.name}</span>
        <span className="text-xs text-muted-foreground uppercase font-semibold tracking-wider">
          {getRoleLabel(row.original.type ?? "")}
        </span>
      </div>
    ),
  },
  {
    accessorKey: "substitutos",
    header: "Suplentes Asignados",
    cell: ({ row }) => {
      if (ROLES_WITHOUT_SUBSTITUTES.includes(row.original.type || "")) {
        return (
          <span className="text-muted-foreground/30 italic">No aplica</span>
        );
      }

      const subs = row.original.substitutos || [];
      return (
        <div className="flex flex-wrap gap-1">
          {subs.length > 0 ? (
            subs.map((sub) => (
              <Badge key={sub.id}  className="text-sm bg-gray-200 text-gray-800">
                {sub.name}
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground italic">Sin asignar</span>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const propietario = row.original;

      const canHaveSubstitutes = !ROLES_WITHOUT_SUBSTITUTES.includes(
        propietario.type || ""
      );

      return (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <span className="sr-only">Abrir menú</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Acciones</DropdownMenuLabel>

              {/* Solo mostramos la opción si el rol lo permite */}
              {canHaveSubstitutes && (
                <DropdownMenuItem onClick={() => onAssign(propietario)}>
                  <UserPlus className="mr-2 h-4 w-4" />
                  <span>Gestionar Suplentes</span>
                </DropdownMenuItem>
              )}

              <DropdownMenuItem onClick={() => onEdit(propietario)}>
                <Edit className="mr-2 h-4 w-4" />
                <span>Editar Nombre</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(propietario)}
              >
                <Trash className="mr-2 h-4 w-4" />
                <span>Eliminar</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
