import { type ColumnDef } from "@tanstack/react-table";
import { type Act } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { Link } from "react-router";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const columns: ColumnDef<Act>[] = [
  {
    accessorKey: "name",
    header: "Nombre del Acta",
    cell: ({ row }) => {
      const act = row.original;
      return (
        <Link
          to={`/books/${act.bookId}`}
          state={{ initialActId: act.id }}
          className="font-medium text-primary hover:underline"
        >
          {act.name}
        </Link>
      );
    },
  },
  {
    accessorKey: "bookName",
    header: "Libro de Origen",
    cell: ({ row }) => {
      const act = row.original;
      return (
        <Link
          to={`/books/${act.bookId}`}
          className="font-medium text-primary hover:underline flex items-center gap-2"
        >
          {act.bookName}
        </Link>
      );
    },
  },

  {
    accessorKey: "agreementsCount",
    header: () => <div className="text-right"># Acuerdos</div>,
    cell: ({ row }) => {
      const count = row.getValue("agreementsCount") as number;
      return <div className="text-center">{count}</div>;
    },
  },
  {
    accessorKey: "createdBy",
    header: "Creado por",
  },
  {
    accessorKey: "createdAt",
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
      const date = new Date(row.getValue("createdAt"));
      return (
        <div className="font-medium">
          {format(date, "dd/MM/yyyy 'a las' HH:mm", { locale: es })}
        </div>
      );
    },
  },
  {
    accessorKey: "modifiedBy",
    header: "Modificado por",
  },
  {
    accessorKey: "lastModified",
    header: "Última Modificación",
    cell: ({ row }) => {
      const date = new Date(row.getValue("lastModified"));
      return (
        <div className="font-medium">
          {format(date, "dd/MM/yyyy 'a las' HH:mm", { locale: es })}
        </div>
      );
    },
  },
];
