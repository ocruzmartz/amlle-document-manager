import { type ColumnDef } from "@tanstack/react-table";
import { type Book } from "@/types/book";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowUpDown,
  MoreHorizontal,
  Printer,
  Edit,
  Trash,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const columns: ColumnDef<Book>[] = [
  {
    accessorKey: "name",
    header: "Nombre del Libro",
    cell: ({ row }) => {
      const book = row.original;
      return (
        <Link
          to={`/books/${book.id}`}
          className="font-medium text-primary hover:underline"
        >
          {book.name}
        </Link>
      );
    },
  },
  {
    accessorKey: "tome",
    header: () => <div className="text-center">Tomo</div>,
    cell: ({ row }) => {
      const tome = row.getValue("tome");
      const displayValue = tome ? tome : "Único";

      return <div className="text-center">{String(displayValue)}</div>;
    },
  },

  {
    accessorKey: "actCount",
    header: () => <div className="text-right"># Actas</div>,
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("actCount")}</div>
    ),
  },
  {
    accessorKey: "agreementCount",
    header: () => <div className="text-right"># Acuerdos</div>,
    cell: ({ row }) => (
      <div className="text-center">
        {row.getValue("agreementCount")}
      </div>
    ),
  },
  {
    accessorKey: "pageCount",
    header: () => <div className="text-right"># Páginas</div>,
    cell: ({ row }) => (
      <div className="text-center">{row.getValue("pageCount")}</div>
    ),
  },
  {
    accessorKey: "createdBy",
    header: "Creado por",
  },
  {
    accessorKey: "createdAt",
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Fecha de Creación
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
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
    header: ({ column }) => {
      return (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
        >
          Última Modificación
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("lastModified"));
      const formattedDateTime = format(date, "dd/MM/yyyy 'a las' HH:mm", {
        locale: es,
      });
      return <div className="font-medium">{formattedDateTime}</div>;
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      const status = row.getValue("status") as Book["status"];
      return (
        <Badge
          className="capitalize"
          variant={
            status === "FINALIZADO"
              ? "default"
              : status === "ARCHIVADO"
              ? "secondary"
              : "outline"
          }
        >
          {status.toLowerCase()}
        </Badge>
      );
    },
  },
  {
    id: "actions",
    cell: ({ row }) => {
      const book = row.original;
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
              <Link to={`/books/${book.id}`}>
                <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Editar</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem
                onClick={() =>
                  alert(`Exportando PDF para el libro: ${book.name}`)
                }
              >
                <Printer className="mr-2 h-4 w-4" />
                <span>Exportar a PDF</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                className="text-destructive"
                onClick={() =>
                  confirm(
                    `¿Estás seguro de que quieres eliminar el libro: ${book.name}?`
                  )
                }
              >
                <Trash className="mr-2 h-4 w-4 text-destructive" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
