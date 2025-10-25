import { AuditTable } from "@/features/audit/components/AuditTable";
import { useAuditLogs } from "@/hooks/useAuditLogs"; 
//import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { dummyAuditLogs } from "../lib/dummyData";

export default function AuditPage() {
  /*const { logs, loading, error } = useAuditLogs();

  if (loading) {
    return <p className="text-center mt-8">Cargando registros de auditoría...</p>;
  }

  if (error) {
    return (
      <Alert variant="destructive" className="mt-8">
        <AlertTitle>Error de Carga</AlertTitle>
        <AlertDescription>No se pudo acceder al registro: {error}</AlertDescription>
      </Alert>
    );
  }
  
  if (logs.length === 0) {
    return <p className="text-center mt-8 text-muted-foreground">No se encontraron registros de auditoría.</p>
  }*/

  return (
    <AuditTable logs={dummyAuditLogs} />
  );
}