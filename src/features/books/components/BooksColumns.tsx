import { type ColumnDef } from "@tanstack/react-table";
import { type Book } from "@/types/book";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ArrowUpDown, MoreHorizontal, Printer, Edit } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link } from "react-router";

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
    accessorKey: "tome",
    header: () => <div className="text-center">Tomo</div>,
    cell: ({ row }) => {
      const tome = row.getValue("tome");

      // 3. Lógica para manejar el caso en que no hay tomo
      const displayValue = tome ? tome : "Único";

      return <div className="text-center">{String(displayValue)}</div>;
    },
  },

  // --- COLUMNAS DE CONTEO (REINCORPORADAS) ---
  {
    accessorKey: "actaCount",
    header: () => <div className="text-right"># Actas</div>,
    cell: ({ row }) => (
      <div className="text-right font-medium">{row.getValue("actaCount")}</div>
    ),
  },
  {
    accessorKey: "acuerdoCount",
    header: () => <div className="text-right"># Acuerdos</div>,
    cell: ({ row }) => (
      <div className="text-right font-medium">
        {row.getValue("acuerdoCount")}
      </div>
    ),
  },
  {
    accessorKey: "pageCount",
    header: () => <div className="text-right"># Páginas</div>,
    cell: ({ row }) => (
      <div className="text-right font-medium">{row.getValue("pageCount")}</div>
    ),
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
          Fecha de Modificación
          <ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      );
    },
    cell: ({ row }) => {
      const date = new Date(row.getValue("lastModified"));
      const formattedDateTime = date.toLocaleString("es-SV", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      return <div className="font-medium">{formattedDateTime}</div>;
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
                  <span>Ver / Editar</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuItem
                onClick={() =>
                  alert(`Exportando PDF para el libro: ${book.name}`)
                }
              >
                <Printer className="mr-2 h-4 w-4" />
                <span>Exportar a PDF...</span>
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
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
