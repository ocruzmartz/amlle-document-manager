// filepath: src/features/audit/components/AuditLogColumns.tsx
import { type ColumnDef } from "@tanstack/react-table";
import { type FullActivityLog, type ActivityLog, type User } from "@/types";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown } from "lucide-react";
import { Link } from "react-router";
// 👇 VERIFICA ESTA IMPORTACIÓN
import { formatDateTime } from "@/lib/textUtils";

const actionVariantMap: Partial<
  Record<
    ActivityLog["action"],
    "default" | "secondary" | "destructive" | "outline"
  >
> = {
  CREATED: "default",
  UPDATED: "outline",
  DELETED: "destructive",
  EXPORTED: "secondary",
  FINALIZED: "default",
  ARCHIVED: "secondary",
  RESTORED: "outline",
};

const actionTextMap: Partial<Record<ActivityLog["action"], string>> = {
  CREATED: "Creado",
  UPDATED: "Modificado",
  DELETED: "Eliminado",
  EXPORTED: "Exportado",
  FINALIZED: "Finalizado",
  ARCHIVED: "Archivado",
  RESTORED: "Restaurado",
};

export const columns: ColumnDef<FullActivityLog>[] = [
  {
    accessorKey: "timestamp",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Fecha y Hora
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      const rawDate = row.original.timestamp;

      return <div className="font-medium">{formatDateTime(rawDate)}</div>;
    },
  },
  {
    accessorKey: "user",
    header: "Usuario",
    cell: ({ row }) => {
      const user = row.getValue("user") as FullActivityLog["user"];
      return <div className="font-medium">{user?.nombre || "—"}</div>;
    },
    filterFn: (row, id, value) => {
      const user = row.getValue(id) as Pick<User, "nombre">;
      const fullName = user?.nombre?.toLowerCase() || "";
      return fullName.includes(String(value).toLowerCase());
    },
  },
  {
    accessorKey: "action",
    header: "Acción",
    cell: ({ row }) => {
      const action = row.getValue("action") as ActivityLog["action"];
      return (
        <Badge
          variant={actionVariantMap[action] || "secondary"}
          className="capitalize"
        >
          {actionTextMap[action] || action}
        </Badge>
      );
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "targetType",
    header: "Tipo de Objeto",
    cell: ({ row }) => {
      return <div>{row.getValue("targetType")}</div>;
    },
    filterFn: (row, id, value) => {
      return value.includes(row.getValue(id));
    },
  },
  {
    accessorKey: "targetName",
    header: "Objeto Modificado",
    cell: ({ row }) => {
      const log = row.original;
      if (log.targetUrl === "#") {
        return <div className="font-medium">{log.targetName}</div>;
      }
      return (
        <Link
          to={log.targetUrl}
          state={log.targetState}
          className="font-medium text-primary hover:underline"
        >
          {log.targetName}
        </Link>
      );
    },
  },
];
