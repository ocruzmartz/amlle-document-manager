import { type ColumnDef } from "@tanstack/react-table";
import { type Act } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { Link } from "react-router";
import { formatDateTime } from "@/lib/textUtils";

export const columns: ColumnDef<Act>[] = [
  {
    accessorKey: "name",
    header: "Nombre del Acta",
    cell: ({ row }) => {
      const act = row.original;
      return (
        <Link
          to={`/books/${act.volumeId}`}
          state={{ initialActId: act.id }}
          className="font-medium text-primary hover:underline"
        >
          {act.name}
        </Link>
      );
    },
  },
  {
    accessorKey: "volumeName",
    header: "Tomo de Origen",
    cell: ({ row }) => {
      const act = row.original;
      return (
        <Link
          to={`/books/${act.volumeId}`}
          className="font-medium text-primary hover:underline flex items-center gap-2"
        >
          {act.volumeName}
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
    accessorKey: "agreementCount",
    header: () => <div className="text-right"># Acuerdos</div>,
    cell: ({ row }) => {
      const count = row.getValue("agreementCount") as number;
      return <div className="text-center">{count}</div>;
    },
  },
  {
    accessorKey: "createdByName",
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
      <div className="font-medium">
        {formatDateTime(row.getValue("createdAt"))} {/* ✅ Usar helper */}
      </div>;
    },
  },
  {
    accessorKey: "latestModifierName",
    header: "Modificado por",
    cell: ({ row }) => {
      const modifierName = row.getValue("latestModifierName") as string | null;
      return (
        <div className="font-medium">{modifierName ? modifierName : "-"}</div>
      );
    },
  },
  {
    accessorKey: "latestModificationDate",
    header: "Última Modificación",
    cell: ({ row }) => {
      <div className="font-medium">
        {formatDateTime(row.getValue("latestModificationDate"))}{" "}
      </div>;
    },
  },
];
