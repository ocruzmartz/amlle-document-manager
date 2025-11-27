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
import { MoreHorizontal, Edit, Trash, UserPlus, ArrowUpDown } from "lucide-react";

interface GetColumnsProps {
  onEdit: (propietario: Propietario) => void;
  onDelete: (propietario: Propietario) => void;
  onAssign: (propietario: Propietario) => void;
}

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
        Nombre
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
  },
  {
    accessorKey: "substitutos",
    header: "Suplentes Asignados",
    cell: ({ row }) => {
      const subs = row.original.substitutos || [];
      return (
        <div className="flex flex-wrap gap-1">
          {subs.length > 0 ? (
            subs.map((sub) => (
              <Badge key={sub.id} variant="secondary" className="font-normal">
                {sub.name}
              </Badge>
            ))
          ) : (
            <span className="text-muted-foreground text-xs italic">
              Sin asignar
            </span>
          )}
        </div>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const propietario = row.original;
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
              <DropdownMenuItem onClick={() => onAssign(propietario)}>
                <UserPlus className="mr-2 h-4 w-4" />
                <span>Gestionar Suplentes</span>
              </DropdownMenuItem>
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