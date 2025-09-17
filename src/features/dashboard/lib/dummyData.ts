// src/features/dashboard/lib/dummy-data.ts

import { type ActivityLog } from "@/types";
import { type RecentBook } from "@/types/book";
// ... otros imports

// --- Actividad Reciente (CON LA NUEVA LÓGICA DE NEGOCIO) ---
export const recentActivities: ActivityLog[] = [
  {
    id: "log-1",
    user: { firstName: "Elena", lastName: "Rivera" },
    action: "UPDATED",
    target: {
      type: "Acuerdo",
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
      type: "Acta",
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
      type: "Libro", // El objetivo de la finalización es el Libro
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
      type: "Libro",
      name: "Libro de Acuerdos 2025",
      url: "/books/47",
    },
    timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // Hace 2 días
  },
];


// --- Libros Modificados Recientemente (AHORA CON ESTADO) ---
export const recentBooks: RecentBook[] = [
  {
    id: "book-47",
    name: "Libro de Acuerdos 2025",
    status: "BORRADOR", // <-- Estado del libro
    lastModified: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(), // Hace 1 hora
    url: "/books/47",
    modifiedBy: "Carlos Pérez",
  },
  {
    id: "book-42",
    name: "Libro de Actas 2024",
    status: "FINALIZADO", // <-- Estado del libro
    lastModified: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(), // Ayer
    url: "/books/42",
    modifiedBy: "Admin Sistema",
  },
  {
    id: "book-45",
    name: "Tomo II - 2024",
    status: "ARCHIVADO", // <-- Estado del libro
    lastModified: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(), // Hace 1 mes
    url: "/books/45",
    modifiedBy: "Elena Rivera",
  },
];