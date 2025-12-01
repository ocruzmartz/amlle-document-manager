import { type ColumnDef } from "@tanstack/react-table";
import { type Substituto } from "@/types/council";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Edit, Trash, ArrowUpDown } from "lucide-react";
import { COUNCIL_ROLE_OPTIONS } from "../schemas/participantSchema";

interface GetColumnsProps {
  onEdit: (substituto: Substituto) => void;
  onDelete: (substituto: Substituto) => void;
}

const getRoleLabel = (value: string) => {
  return COUNCIL_ROLE_OPTIONS.find((o) => o.value === value)?.label || value;
};

export const getSubstitutoColumns = ({
  onEdit,
  onDelete,
}: GetColumnsProps): ColumnDef<Substituto>[] => [
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
        <span className="font-medium">{row.original.name}</span>
        <span className="text-xs text-muted-foreground uppercase font-semibold">
          {getRoleLabel(row.original.type || "")}
        </span>
      </div>
    ),
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const substituto = row.original;
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
              <DropdownMenuItem onClick={() => onEdit(substituto)}>
                <Edit className="mr-2 h-4 w-4" />
                <span>Editar</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive focus:text-destructive"
                onClick={() => onDelete(substituto)}
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