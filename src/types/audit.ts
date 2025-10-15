export type ActionStatus = "CREO ACTA" | "EDITO ACUERDO" | "ELIMINO USUARIO" | "ELIMINO ACTA";

export type Audit = {
    modifiedBy: string;
    createdAt: string;
    lastModified: string;
    status: ActionStatus;
    module: string;
}