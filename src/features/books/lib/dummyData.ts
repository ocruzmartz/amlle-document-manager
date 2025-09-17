import { type Book, type CouncilMember } from "@/types";
import { type Act } from "@/types";

// --- DATOS PARA LA LISTA PRINCIPAL DE LIBROS ---
// Usamos UUIDs reales para los IDs para ser consistentes con lo que genera la app
export const booksData: Book[] = [
  {
    id: "f4a9b8c7-d6e5-4f3g-2h1i-0j9k8l7m6n5o",
    name: "Libro de Actas Municipales 2025",
    tome: 1,
    status: 'BORRADOR',
    actaCount: 2,
    acuerdoCount: 3,
    pageCount: 15,
    createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
    lastModified: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // Hace 12 horas
    modifiedBy: 'Carlos Pérez'
  },
  {
    id: "8a7b3c2e-4f5g-6h7i-8j9k-1l2m3n4o5p6q",
    name: "Libro de Acuerdos Varios 2024",
    status: 'FINALIZADO',
    actaCount: 35,
    acuerdoCount: 152,
    pageCount: 210,
    createdAt: new Date(Date.now() - 150 * 24 * 60 * 60 * 1000).toISOString(),
    lastModified: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Hace 1 mes
    modifiedBy: 'Ana Gómez'
  },
];


// --- CONTENIDO INTERNO DE EJEMPLO PARA UN LIBRO ESPECÍFICO ---
// La clave del objeto debe coincidir con el ID de un libro en booksData
export const bookContentData: { [bookId: string]: { actas: Act[] } } = {
  "f4a9b8c7-d6e5-4f3g-2h1i-0j9k8l7m6n5o": {
    actas: [
      {
        id: "acta-101",
        name: "Acta de Sesión Inaugural 2025",
        agreements: [
          { id: "acuerdo-201", title: "Acuerdo N° 1: Nombramiento de Comisiones", content: "<p>Detalles sobre el nombramiento de las comisiones municipales para el nuevo período.</p>" },
          { id: "acuerdo-202", title: "Acuerdo N° 2: Aprobación de Presupuesto Inicial", content: "<p>Se aprueba el presupuesto operativo inicial detallado en el Anexo A.</p>" },
        ],
      },
      {
        id: "acta-102",
        name: "Acta de Revisión de Proyectos",
        agreements: [
          { id: "acuerdo-203", title: "Acuerdo N° 3: Inicio de Proyecto Comunitario", content: "<p>Se autoriza el inicio del proyecto de mejora del parque local.</p>" },
        ],
      },
    ]
  },
  // El libro 'Libro de Acuerdos Varios 2024' por ahora no tiene contenido definido en esta simulación.
};


export const allCouncilMembers: CouncilMember[] = [
  { id: 'cm-1', name: 'Zoila Milagro Navas Quintanilla', role: 'SECRETARIA' },
  { id: 'cm-2', name: 'Edwin Gilberto Orellana Núñez', role: 'SINDICO' },
  { id: 'cm-3', name: 'Sonia Elizabeth Andrade de Jovel', role: 'PROPIETARIO' },
  { id: 'cm-4', name: 'Héctor Rafael Hernández Dale', role: 'PROPIETARIO' },
  { id: 'cm-5', name: 'Francisco Antonio Castellón B.', role: 'PROPIETARIO' },
  { id: 'cm-6', name: 'José Roberto Munguía Palomo', role: 'SUPLENTE' },
  { id: 'cm-7', name: 'Josselin Abigail Torres Burgos', role: 'SUPLENTE' },
  // ...añade todos los miembros aquí
];
