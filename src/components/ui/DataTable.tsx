import * as React from "react";
import {
  type ColumnDef,
  type Column,
  type ColumnFiltersState,
  type SortingState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
} from "@tanstack/react-table";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, PlusCircle, X } from "lucide-react"; // ✅ Importar X
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel, // ✅ Importar Label
  DropdownMenuSeparator, // ✅ Importar Separator
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

// ✅ Interfaz movida fuera
interface FacetedFilterOption {
  label: string;
  value: string;
}

// ✅ Nueva interfaz para la prop
interface FacetedFilterProps {
  columnId: string;
  title: string;
  options: FacetedFilterOption[];
}

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  filterColumnId: string;
  filterPlaceholder?: string;
  // ✅ Prop actualizada para aceptar un array de filtros
  facetedFilters?: FacetedFilterProps[];
}

// ✅ Componente interno para el botón de filtro (lógica actualizada)
function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options,
}: {
  column?: Column<TData, TValue>;
  title?: string;
  options: FacetedFilterOption[];
}) {
  // ✅ Adaptado para manejar un array de valores seleccionados
  const selectedValues = (column?.getFilterValue() as string[]) || [];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="border-dashed">
          <PlusCircle className="mr-2 h-4 w-4" />
          {title}
          {selectedValues.length > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              {selectedValues.length > 2 ? (
                <Badge
                  variant="secondary"
                  className="rounded-sm px-1 font-normal"
                >
                  {selectedValues.length} seleccionados
                </Badge>
              ) : (
                <div className="flex space-x-1">
                  {options
                    .filter((option) => selectedValues.includes(option.value))
                    .map((option) => (
                      <Badge
                        variant="secondary"
                        key={option.value}
                        className="rounded-sm px-1 font-normal"
                      >
                        {option.label}
                      </Badge>
                    ))}
                </div>
              )}
            </>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        {/* ✅ Botón para limpiar filtros */}
        {selectedValues.length > 0 && (
          <>
            <DropdownMenuLabel>
              <Button
                variant="ghost"
                onClick={() => column?.setFilterValue(undefined)}
                className="w-full h-auto justify-start p-1 text-xs"
              >
                <X className="mr-2 h-3 w-3" />
                Limpiar filtros
              </Button>
            </DropdownMenuLabel>
            <DropdownMenuSeparator />
          </>
        )}
        {options.map((option) => {
          const isSelected = selectedValues.includes(option.value);
          return (
            <DropdownMenuCheckboxItem
              key={option.value}
              className="capitalize"
              checked={isSelected}
              onCheckedChange={(value) => {
                // ✅ Lógica actualizada para manejar múltiples selecciones
                if (value) {
                  column?.setFilterValue([...selectedValues, option.value]);
                } else {
                  column?.setFilterValue(
                    selectedValues.filter((v) => v !== option.value)
                  );
                }
              }}
            >
              {option.label}
            </DropdownMenuCheckboxItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export const DataTable = <TData, TValue>({
  columns,
  data,
  filterColumnId,
  filterPlaceholder = "Filtrar...",
  facetedFilters, // ✅ Prop actualizada
}: DataTableProps<TData, TValue>) => {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getSortedRowModel: getSortedRowModel(),
    onColumnFiltersChange: setColumnFilters,
    getFilteredRowModel: getFilteredRowModel(),
    state: {
      sorting,
      columnFilters,
    },
  });

  return (
    <div>
      <div className="flex items-center justify-between py-4">
        <div className="flex items-center gap-4 w-full">
          <div className="relative w-full max-w-sm">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={filterPlaceholder}
              value={
                (table.getColumn(filterColumnId)?.getFilterValue() as string) ??
                ""
              }
              onChange={(event) =>
                table
                  .getColumn(filterColumnId)
                  ?.setFilterValue(event.target.value)
              }
              className="pl-8 shadow-none"
            />
          </div>
          {/* ✅ Lógica actualizada para renderizar múltiples filtros */}
          {facetedFilters &&
            facetedFilters.map((filter) => (
              <DataTableFacetedFilter
                key={filter.columnId}
                column={table.getColumn(filter.columnId)}
                title={filter.title}
                options={filter.options}
              />
            ))}
        </div>
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <TableHead key={header.id}>
                    {flexRender(
                      header.column.columnDef.header,
                      header.getContext()
                    )}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id}>
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No hay resultados.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex items-center justify-end space-x-2 py-4">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Anterior
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Siguiente
        </Button>
      </div>
    </div>
  );
};
