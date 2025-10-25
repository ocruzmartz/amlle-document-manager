import {
  Card,
  CardContent,
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
import { formatDistanceToNow, format } from "date-fns";
import { es } from "date-fns/locale";

import { type AuditLogEntry } from "@/types/audit"; 

interface AuditTableProps {
  logs: AuditLogEntry[]; 
}

export const AuditTable = ({ logs }: AuditTableProps) => {
    
    // Función de utilidad para renderizar el color de la acción
    const getActionBadgeVariant = (action: AuditLogEntry['action']) => {
        switch (action) {
            case 'CREATE': return 'default'; // Verde o azul
            case 'UPDATE': return 'secondary'; // Gris o azul claro
            case 'DELETE': return 'destructive'; // Rojo (Importante)
            case 'LOGIN': return 'outline'; // Amarillo (Seguridad)
            default: return 'outline';
        }
    };

    return (
        <div className="space-y-8 overflow-y-auto p-4">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">
                    Registro de Auditoría
                </h1>
                <p className="text-muted-foreground mt-1">
                    Historial detallado de todas las acciones realizadas por usuarios en el sistema.
                </p>
            </div>
            
            <Card className="shadow-none">
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead className="w-[100px]">ID de Entidad</TableHead> {/* Clave de la entidad */}
                                <TableHead>Acción / Entidad</TableHead>
                                <TableHead>Realizada por</TableHead>
                                <TableHead className="text-right">Tiempo de modificación</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {logs.map((log) => (
                                <TableRow key={log.id}>
                                    
                                    {/* ID de la entidad afectada */}
                                    <TableCell className="font-mono text-xs text-muted-foreground">
                                        {log.entityId.substring(0, 8)}
                                    </TableCell>
                                    
                                    <TableCell>
                                        <div className="flex flex-col space-y-1">
                                            <div className="flex items-center space-x-2">
                                                {/* ⬇️ Tipo de acción y Entidad */}
                                                <Badge variant={getActionBadgeVariant(log.action)}>
                                                    {log.action} {log.entityType}
                                                </Badge>
                                                <span className="font-semibold text-sm">
                                                    {log.entityName}
                                                </span>
                                            </div>
                                            
                                        </div>
                                    </TableCell>
                                    
                                    {/* Quién lo hizo */}
                                    <TableCell className="font-medium">
                                            {log.actorName}
                                    </TableCell>

                                    {/* Marca de tiempo con más detalle */}
                                    <TableCell className="text-right">
                                        <div className="flex flex-col items-end">
                                            {/* Tiempo legible (hace cuánto) */}
                                            <span className="font-medium">
                                                {formatDistanceToNow(new Date(log.timestamp), {
                                                    addSuffix: true,
                                                    locale: es,
                                                })}
                                            </span>
                                            {/* Hora exacta (tooltip o texto pequeño) */}
                                            <span className="text-xs text-muted-foreground" title={format(new Date(log.timestamp), 'PPpp', { locale: es })}>
                                                {format(new Date(log.timestamp), 'HH:mm')}
                                            </span>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
        </div>
    );
};