import { type ColumnDef } from "@tanstack/react-table";
import { type Agreement } from "@/types";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { Link } from "react-router";
import { formatDateTime } from "@/lib/textUtils";

export const columns: ColumnDef<Agreement>[] = [
  {
    accessorKey: "name",
    header: "Nombre del Acuerdo",
    cell: ({ row }) => {
      const agreement = row.original;
      return (
        <Link
          to={`/books/${agreement.volumeId}`}
          state={{
            initialActId: agreement.minutesId,
            initialDetailView: {
              type: "agreement-editor",
              agreementId: agreement.id,
            },
          }}
          className="font-medium text-primary hover:underline"
        >
          {agreement.name}
        </Link>
      );
    },
  },
  {
    accessorKey: "minutesName",
    header: "Acta de Origen",
    cell: ({ row }) => {
      const agreement = row.original;
      return (
        <Link
          to={`/books/${agreement.volumeId}`}
          state={{ initialActId: agreement.minutesId }}
          className="font-medium text-primary hover:underline flex items-center gap-2"
        >
          {agreement.minutesName}
        </Link>
      );
    },
  },
  {
    accessorKey: "volumeName",
    header: "Tomo de Origen",
    cell: ({ row }) => {
      const agreement = row.original;

      return (
        <Link
          to={`/books/${agreement.tomeId}`}
          className="font-medium text-primary hover:underline flex items-center gap-2"
        >
          {agreement.volumeName}
        </Link>
      );
    },
  },
  {
    accessorKey: "createdByName",
    header: "Creado por",
    cell: ({ row }) => {
      const createdBy = row.getValue("createdByName") as string;
      return <div className="font-medium">{createdBy || "-"}</div>;
    },
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
        {formatDateTime(row.getValue("createdAt"))}
      </div>;
    },
  },
  {
    accessorKey: "latestModifierName",
    header: "Modificado por",
    cell: ({ row }) => {
      const latestModifier = row.getValue("latestModifierName") as string;
      return <div className="font-medium">{latestModifier || "-"}</div>;
    },
  },
  {
    accessorKey: "latestModificationDate",
    header: "Última Modificación",
    cell: ({ row }) => {
      <div className="font-medium">
        {formatDateTime(row.getValue("latestModificationDate"))}
      </div>;
    },
  },
];
