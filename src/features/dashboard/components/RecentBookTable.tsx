import { Link } from "react-router"; 
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

// Importamos las funciones necesarias de date-fns
import { formatDistanceToNow } from "date-fns";
import { es } from "date-fns/locale";

// Importamos el tipo desde su archivo dedicado
import { type RecentBook } from "@/types/book";

interface RecentBooksTableProps {
  books: RecentBook[];
}

// Usamos la convención de función de flecha que prefieres
export const RecentBooksTable = ({ books }: RecentBooksTableProps) => {
  return (
    <Card className="shadow-none">
      <CardHeader>
        <CardTitle>Estado de Libros Recientes</CardTitle>
        <CardDescription>
          Los últimos libros en los que se ha trabajado y su estado actual.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nombre del Libro</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="text-right">Última Modificación</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {books.map((book) => (
              <TableRow key={book.id}>
                <TableCell>
                  <Link
                    to={book.url}
                    className="font-medium text-primary hover:underline"
                  >
                    {book.name}
                  </Link>
                  <p className="text-xs text-muted-foreground">
                    Modificado por {book.modifiedBy}
                  </p>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      book.status === "FINALIZADO"
                        ? "default"
                        : book.status === "ARCHIVADO"
                        ? "secondary"
                        : "outline"
                    }
                  >
                    {book.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-right text-muted-foreground">
                  {/* --- CÓDIGO AÑADIDO AQUÍ --- */}
                  {formatDistanceToNow(new Date(book.lastModified), {
                    addSuffix: true,
                    locale: es,
                  })}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};