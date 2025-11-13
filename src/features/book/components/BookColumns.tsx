import { type ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowUpDown,
  MoreHorizontal,
  Edit,
  Trash,
  ArchiveRestore,
  Archive,
  CheckCircle2,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Link, type useNavigate } from "react-router";
import { format, isValid } from "date-fns";
import { es } from "date-fns/locale";
import type { Tome } from "@/types";
import { numberToRoman } from "@/lib/textUtils"; // ✅ Importar helper

interface GetColumnsProps {
  onFinalize: (tome: Tome) => void;
  onArchive: (tome: Tome) => void;
  onRestore: (tome: Tome) => void;
  onDelete: (tome: Tome) => void;
  navigate: ReturnType<typeof useNavigate>;
}

export const getColumns = ({
  onFinalize,
  onArchive,
  onRestore,
  onDelete,
  navigate,
}: GetColumnsProps): ColumnDef<Tome>[] => [
  {
    // ✅ 1. Cambiar accessorKey a 'name'
    accessorKey: "name",
    header: "Nombre del Tomo",
    cell: ({ row }) => {
      const tome = row.original;

      // ✅ 2. Ser defensivo con los nombres
      const bookName = tome.bookName || "Libro sin asignar";
      // Si el nombre es 'null' (como en tu JSON), genera uno
      const tomeName = tome.name || `Tomo ${numberToRoman(tome.number)}`;

      return (
        <Link
          to={`/books/${tome.id}`}
          onClick={(e) => {
            e.preventDefault();
            navigate(`/books/${tome.id}`);
          }}
          className="font-medium text-primary hover:underline"
        >
          {bookName}
          <p className="text-xs text-muted-foreground">{tomeName}</p>
        </Link>
      );
    },
    // ✅ 3. Actualizar filtro para que busque en los nombres generados
    filterFn: (row, id, value) => {
      const tome = row.original;
      const bookName = tome.book?.name || "";
      const tomeName = tome.name || `Tomo ${numberToRoman(tome.number)}`;

      const combined = `${bookName} ${tomeName}`;
      return combined.toLowerCase().includes(String(value).toLowerCase());
    },
  },
  {
    accessorKey: "number",
    header: () => <div className="text-center">Tomo #</div>,
    cell: ({ row }) => {
      const tomeNum = row.getValue("number");
      return <div className="text-center">{String(tomeNum)}</div>;
    },
  },
  {
    accessorKey: "minutesIds",
    header: () => <div className="text-center"># Actas</div>,
    cell: ({ row }) => {
      const ids = row.getValue("minutesIds") as string[] | undefined;
      const count = ids ? ids.length : 0;
      return <div className="text-center">{count}</div>;
    },
  },
  {
    accessorKey: "agreementCount",
    header: () => <div className="text-center"># Acuerdos</div>,
    cell: ({ row }) => {
      // ✅ 5. Standby: 'agreementCount' SÍ viene (es 0)
      const count = row.getValue("agreementCount") as number | undefined;
      // Mostrará 0 (ya que 0 no es 'falsy' para '||')
      return <div className="text-center">{count ?? "—"}</div>;
    },
  },
  {
    accessorKey: "pageCount",
    header: () => <div className="text-center"># Páginas</div>,
    cell: ({ row }) => {
      // ✅ 5. Standby: 'pageCount' SÍ viene (es 0)
      const count = row.getValue("pageCount") as number | undefined;
      return <div className="text-center">{count ?? "—"}</div>;
    },
  },
  {
    accessorKey: "createdBy.nombre",
    header: "Creado por",
    cell: ({ row }) => {
      const createdBy = row.original.createdByName;
      return <div>{createdBy || "—"}</div>;
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
      // ✅ 7. Validar fecha (SÍ viene)
      const dateValue = row.getValue("createdAt") as string | undefined;
      if (!dateValue || !isValid(new Date(dateValue))) return "—";
      return (
        <div className="font-medium">
          {format(new Date(dateValue), "dd/MM/yyyy 'a las' HH:mm", {
            locale: es,
          })}
        </div>
      );
    },
  },
  {
    accessorKey: "modificiationName",
    header: "Modificado por",
    cell: ({ row }) => {
      const tome = row.original;
      const modifiedBy =
        tome.modificationName && tome.modificationName.length > 0
          ? tome.modificationName[0]
          : "—";
      return <div>{modifiedBy}</div>;
    },
  },
  {
    accessorKey: "updatedAt",
    header: ({ column }) => (
      <Button
        variant="ghost"
        onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
      >
        Última Modificación
        <ArrowUpDown className="ml-2 h-4 w-4" />
      </Button>
    ),
    cell: ({ row }) => {
      // ✅ 7. Validar fecha (SÍ viene)
      const dateValue = row.getValue("updatedAt") as string | undefined;
      if (!dateValue || !isValid(new Date(dateValue))) return "—";
      return (
        <div className="font-medium">
          {format(new Date(dateValue), "dd/MM/yyyy 'a las' HH:mm", {
            locale: es,
          })}
        </div>
      );
    },
  },
  {
    accessorKey: "status",
    header: "Estado",
    cell: ({ row }) => {
      // ✅ 7. SÍ viene
      const status = row.getValue("status") as Tome["status"];
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
      // ... (El menú de acciones funcionará sin cambios)
      const tome = row.original;
      const isBorrador = tome.status === "BORRADOR";
      const isFinalizado = tome.status === "FINALIZADO";
      const isArchivado = tome.status === "ARCHIVADO";

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
              <Link
                to={`/books/${tome.id}`}
                onClick={(e) => {
                  if (!isBorrador) e.preventDefault();
                  else navigate(`/books/${tome.id}`);
                }}
              >
                <DropdownMenuItem
                  onSelect={(e) => e.preventDefault()}
                  disabled={!isBorrador}
                >
                  <Edit className="mr-2 h-4 w-4" />
                  <span>Editar</span>
                </DropdownMenuItem>
              </Link>
              <DropdownMenuSeparator />
              {isBorrador && (
                <DropdownMenuItem onClick={() => onFinalize(tome)}>
                  <CheckCircle2 className="mr-2 h-4 w-4" />
                  <span>Finalizar Tomo</span>
                </DropdownMenuItem>
              )}
              {isFinalizado && (
                <DropdownMenuItem onClick={() => onArchive(tome)}>
                  <Archive className="mr-2 h-4 w-4" />
                  <span>Archivar Tomo</span>
                </DropdownMenuItem>
              )}
              {isArchivado && (
                <DropdownMenuItem onClick={() => onRestore(tome)}>
                  <ArchiveRestore className="mr-2 h-4 w-4" />
                  <span>Restaurar a Borrador</span>
                </DropdownMenuItem>
              )}
              {!isFinalizado && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    className="text-destructive focus:text-destructive"
                    onClick={() => onDelete(tome)}
                  >
                    <Trash className="mr-2 h-4 w-4 text-destructive" />
                    <span>Eliminar</span>
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      );
    },
  },
];
