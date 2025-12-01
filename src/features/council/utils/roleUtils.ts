const ROLE_HIERARCHY: Record<string, number> = {
  ALCALDESA: 1,
  SINDICO: 2,
  SECRETARIA: 3,
  PRIMER_REGIDOR: 4,
  SEGUNDO_REGIDOR: 5,
  TERCER_REGIDOR: 6,
  CUARTO_REGIDOR: 7,
  PRIMER_SUPLENTE: 20,
  SEGUNDO_SUPLENTE: 21,
  TERCER_SUPLENTE: 22,
  CUARTO_SUPLENTE: 23,
};

const ROLE_LABELS: Record<string, string> = {
  ALCALDESA: "Alcaldesa Municipal",
  SINDICO: "Síndico Municipal",
  SECRETARIA: "Secretaria Municipal",
  PRIMER_REGIDOR: "Primer Regidor propietario",
  SEGUNDO_REGIDOR: "Segundo Regidor propietario",
  TERCER_REGIDOR: "Tercer Regidor propietario",
  CUARTO_REGIDOR: "Cuarto Regidor propietario",
  PRIMER_SUPLENTE: "Primer Regidor Suplente",
  SEGUNDO_SUPLENTE: "Segundo Regidor Suplente",
  TERCER_SUPLENTE: "Tercer Regidor Suplente",
  CUARTO_SUPLENTE: "Cuarto Regidor Suplente",
};

export const getRoleLabel = (type?: string | null) => {
  if (!type) return "Concejal / Miembro";
  return ROLE_LABELS[type] || type.replace(/_/g, " ");
};

export const sortCouncilMembers = <T extends { type?: string | null; role?: string | null; name: string }>(members: T[]): T[] => {
  return [...members].sort((a, b) => {
    const typeA = a.type || a.role || "";
    const typeB = b.type || b.role || "";

    const orderA = ROLE_HIERARCHY[typeA] || 999;
    const orderB = ROLE_HIERARCHY[typeB] || 999;
    
    if (orderA === orderB) {
      return (a.name || "").localeCompare(b.name || "");
    }
    return orderA - orderB;
  });
};
