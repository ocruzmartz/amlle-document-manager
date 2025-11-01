import { type ActivityLog, type RecentTome } from "@/types";

export const recentActivities: ActivityLog[] = [
  {
    id: "log-1",
    user: { firstName: "Elena", lastName: "Rivera" },
    action: "UPDATED",
    target: {
      type: "Agreement",
      name: "Acuerdo #15-A del Acta 028-2025",
      // La URL ahora apunta al libro en modo edición, anclando al acta específica
      url: "/books/47/edit#acta-105",
    },
    timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(), // Hace 10 minutos
  },
  {
    id: "log-2",
    user: { firstName: "Carlos", lastName: "Pérez" },
    action: "CREATED",
    target: {
      type: "Act",
      name: "Acta de Cierre en 'Libro de Acuerdos 2025'",
      url: "/books/47/edit#acta-106",
    },
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // Hace 1 hora
  },
  {
    id: "log-3",
    user: { firstName: "Admin", lastName: "Sistema" },
    action: "FINALIZED", // <-- ¡LA ACCIÓN CLAVE!
    target: {
      type: "Book", // El objetivo de la finalización es el Libro
      name: "Libro de Actas 2024",
      url: "/books/42",
    },
    timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Ayer
  },
  {
    id: "log-4",
    user: { firstName: "Jorge", lastName: "Lemus" },
    action: "CREATED",
    target: {
      type: "Book",
      name: "Libro de Acuerdos 2025",
      url: "/books/47",
    },
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // Hace 2 días
  },
];

// --- Libros Modificados Recientemente (AHORA CON ESTADO) ---
export const recentBooks: RecentTome[] = [
  {
    id: "tome-2025-1", // ID del Tomo
    name: "Tomo 1 - 2025", // Nombre del Tomo
    bookName: "Libro de Acuerdos 2025", // Nombre del Libro Padre
    status: "BORRADOR",
    lastModified: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    url: "/books/tome-2025-1", // URL apunta al Tomo
    modifiedBy: "Carlos Pérez",
  },
  {
    id: "tome-2024-1",
    name: "Tomo 1 - 2024",
    bookName: "Libro de Actas 2024",
    status: "FINALIZADO",
    lastModified: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    url: "/books/tome-2024-1",
    modifiedBy: "Admin Sistema",
  },
  {
    id: "tome-proyectos-1",
    name: "Tomo 1 - Proyectos Especiales",
    bookName: "Tomo II - Proyectos Especiales 2025",
    status: "ARCHIVADO",
    lastModified: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
    url: "/books/tome-proyectos-1",
    modifiedBy: "Elena Rivera",
  },
];
