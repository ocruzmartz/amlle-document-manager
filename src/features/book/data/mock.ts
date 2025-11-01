// filepath: src/features/book/data/mock.ts
import { type Book, type Tome, type CouncilMember, type Act } from "@/types";

// --- Helpers de Fecha y Usuarios (sin cambios) ---
const now = new Date();
const daysAgo = (days: number) =>
  new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

const users = {
  elena: "Elena Rivera",
  carlos: "Carlos Pérez",
  jorge: "Jorge Lemus",
  admin: "Admin Sistema",
};

// --- CouncilMembers (sin cambios) ---
export const allCouncilMembers: CouncilMember[] = [
  { id: "cm-1", name: "Zoila Milagro Navas Quintanilla", role: "SECRETARY" },
  { id: "cm-2", name: "Edwin Gilberto Orellana Núñez", role: "SYNDIC" },
  { id: "cm-3", name: "Sonia Elizabeth Andrade de Jovel", role: "OWNER" },
  { id: "cm-4", name: "Héctor Rafael Hernández Dale", role: "OWNER" },
  { id: "cm-5", name: "Francisco Antonio Castellón Belloso", role: "OWNER" },
  { id: "cm-6", name: "José Roberto Munguía Palomo", role: "OWNER" },
  { id: "cm-7", name: "Josselin Abigail Torres Burgos", role: "OWNER" },
  { id: "cm-8", name: "Ana Lucía Martínez de la O", role: "OWNER" },
  { id: "cm-9", name: "Carlos Alberto Godoy", role: "OWNER" },
  { id: "cm-10", name: "David Ernesto Reyes", role: "OWNER" },
  { id: "cm-11", name: "María Isabel Lemus", role: "SUBSTITUTE" },
  { id: "cm-12", name: "Ricardo José López", role: "SUBSTITUTE" },
  { id: "cm-13", name: "Ana Sofía Rivas", role: "SUBSTITUTE" },
  { id: "cm-14", name: "Marcos Antonio Henríquez", role: "SUBSTITUTE" },
];

// --- DATOS PARA LOS LIBROS (CONTENEDORES) ---
export const booksData: Book[] = [
  {
    id: "book-2025",
    name: "Libro de Actas Municipales 2025",
    createdAt: daysAgo(30).toISOString(),
    createdBy: users.jorge,
    lastModified: daysAgo(1).toISOString(),
    modifiedBy: users.carlos,
    tomos: [], // Se llenará dinámicamente por la API
  },
  {
    id: "book-2024",
    name: "Libro de Acuerdos Varios 2024",
    createdAt: daysAgo(150).toISOString(),
    createdBy: users.admin,
    lastModified: daysAgo(45).toISOString(),
    modifiedBy: users.elena,
    tomos: [],
  },
  {
    id: "book-proyectos",
    name: "Tomo II - Proyectos Especiales 2025", // Nombre antiguo, lo mantenemos por ahora
    createdAt: daysAgo(200).toISOString(),
    createdBy: users.admin,
    lastModified: daysAgo(180).toISOString(),
    modifiedBy: users.admin,
    tomos: [],
  },
];

// --- DATOS PARA LOS TOMOS (LO QUE ANTES ERAN LIBROS) ---
export const tomesData: Tome[] = [
  {
    id: "tome-2025-1", // ID del Tomo (antes f4a9b8c7...)
    bookId: "book-2025", // ID del Libro padre
    name: "Tomo 1 - 2025", // Nombre del Tomo
    tomeNumber: 1, // Número de Tomo
    status: "BORRADOR",
    actCount: 2,
    agreementCount: 3,
    pageCount: 15,
    createdAt: daysAgo(30).toISOString(),
    createdBy: users.jorge,
    lastModified: daysAgo(1).toISOString(),
    modifiedBy: users.carlos,
  },
  {
    id: "tome-2024-1", // ID del Tomo (antes 8a7b3c2e...)
    bookId: "book-2024",
    name: "Tomo 1 - 2024",
    tomeNumber: 1,
    status: "FINALIZADO",
    actCount: 1,
    agreementCount: 2,
    pageCount: 210,
    createdAt: daysAgo(150).toISOString(),
    createdBy: users.admin,
    lastModified: daysAgo(45).toISOString(),
    modifiedBy: users.elena,
  },
  {
    id: "tome-proyectos-1", // ID del Tomo (antes 9b8c7d6e...)
    bookId: "book-proyectos",
    name: "Tomo 1 - Proyectos Especiales",
    tomeNumber: 1,
    status: "ARCHIVADO",
    actCount: 0,
    agreementCount: 0,
    pageCount: 1,
    createdAt: daysAgo(200).toISOString(),
    createdBy: users.admin,
    lastModified: daysAgo(180).toISOString(),
    modifiedBy: users.admin,
  },
];

// --- CONTENIDO INTERNO (ACTAS) AHORA USANDO ID DEL TOMO ---
export const bookContentData: { [tomeId: string]: { acts: Act[] } } = {
  // Contenido para "Tomo 1 - 2025" (tome-2025-1)
  "tome-2025-1": {
    acts: [
      {
        id: "acta-101",
        tomeId: "tome-2025-1", // <-- CAMBIADO
        tomeName: "Tomo 1 - 2025", // <-- CAMBIADO
        name: "Acta número Uno",
        actNumber: 1,
        sessionDate: daysAgo(15).toISOString(),
        sessionType: "Ordinary",
        bodyContent:
          "<h3>Punto Primero: Verificación del Quórum</h3><p>Se verifica la asistencia de los miembros del concejo, encontrándose presentes la totalidad de sus miembros propietarios, por lo que se declara abierta la sesión.</p><h3>Punto Segundo: Aprobación de Agenda</h3><p>Se somete a votación la agenda propuesta para la presente sesión, siendo aprobada por unanimidad.</p>",
        agreementsCount: 2,
        agreements: [
          {
            id: "acuerdo-201",
            actId: "acta-101",
            actName: "Acta número Uno",
            tomeId: "tome-2025-1", // <-- CAMBIADO
            tomeName: "Tomo 1 - 2025", // <-- CAMBIADO
            name: "Acuerdo número Uno",
            content:
              "<p><strong>Acuerdo número Uno:</strong> Visto el dictamen de la Comisión de Obras Públicas, se aprueba por unanimidad el inicio del proyecto de remodelación del parque central, según los planos y presupuesto presentados.</p>",
            createdAt: daysAgo(15).toISOString(),
            createdBy: users.elena,
            lastModified: daysAgo(14).toISOString(),
            modifiedBy: users.carlos,
          },
          {
            id: "acuerdo-202",
            actId: "acta-101",
            actName: "Acta número Uno",
            tomeId: "tome-2025-1", // <-- CAMBIADO
            tomeName: "Tomo 1 - 2025", // <-- CAMBIADO
            name: "Acuerdo número Dos",
            content:
              "<p><strong>Acuerdo número Dos:</strong> Se autoriza al departamento de tesorería para que realice las gestiones pertinentes para la transferencia de fondos necesarios para el proyecto aprobado en el acuerdo anterior.</p>",
            createdAt: daysAgo(15).toISOString(),
            createdBy: users.elena,
            lastModified: daysAgo(15).toISOString(),
            modifiedBy: users.elena,
          },
        ],
        createdAt: daysAgo(15).toISOString(),
        createdBy: users.elena,
        lastModified: daysAgo(14).toISOString(),
        modifiedBy: users.carlos,
      },
      {
        id: "acta-102",
        tomeId: "tome-2025-1", // <-- CAMBIADO
        tomeName: "Tomo 1 - 2025", // <-- CAMBIADO
        name: "Acta número Dos",
        actNumber: 2,
        sessionDate: daysAgo(2).toISOString(),
        sessionType: "Extraordinary",
        bodyContent:
          "<h3>Punto Único: Solicitud de la Comunidad</h3><p>Se discute la solicitud presentada por los vecinos de la Colonia La Esperanza para la instalación de nuevas luminarias. Se anexa documento con firmas.</p>",
        agreementsCount: 1,
        agreements: [
          {
            id: "acuerdo-203",
            actId: "acta-102",
            actName: "Acta número Dos",
            tomeId: "tome-2025-1", // <-- CAMBIADO
            tomeName: "Tomo 1 - 2025", // <-- CAMBIADO
            name: "Acuerdo número Uno",
            content:
              "<p><strong>Acuerdo número Uno:</strong> Se acuerda instruir a la gerencia de servicios municipales para que realice un estudio de factibilidad técnica y financiera para la instalación de luminarias en la Colonia La Esperanza, debiendo presentar un informe en la próxima sesión ordinaria.</p>",
            createdAt: daysAgo(2).toISOString(),
            createdBy: users.carlos,
            lastModified: daysAgo(1).toISOString(),
            modifiedBy: users.carlos,
          },
        ],
        createdAt: daysAgo(2).toISOString(),
        createdBy: users.carlos,
        lastModified: daysAgo(1).toISOString(),
        modifiedBy: users.carlos,
      },
    ],
  },
  // Contenido para "Tomo 1 - 2024" (tome-2024-1)
  "tome-2024-1": {
    acts: [
      {
        id: "acta-301",
        tomeId: "tome-2024-1", // <-- CAMBIADO
        tomeName: "Tomo 1 - 2024", // <-- CAMBIADO
        name: "Acta número Treinta y cinco",
        actNumber: 35,
        sessionDate: daysAgo(50).toISOString(),
        sessionType: "Ordinary",
        bodyContent:
          "<p>Contenido del acta de cierre del libro del año 2024.</p>",
        agreementsCount: 2,
        agreements: [
          {
            id: "acuerdo-401",
            actId: "acta-301",
            actName: "Acta número Treinta y cinco",
            tomeId: "tome-2024-1", // <-- CAMBIADO
            tomeName: "Tomo 1 - 2024", // <-- CAMBIADO
            name: "Acuerdo número Ciento cincuenta y uno",
            content:
              "<p><strong>Acuerdo número Ciento cincuenta y uno:</strong> Se aprueba el informe financiero final del ejercicio fiscal 2024.</p>",
            createdAt: daysAgo(50).toISOString(),
            createdBy: users.admin,
            lastModified: daysAgo(50).toISOString(),
            modifiedBy: users.admin,
          },
          {
            id: "acuerdo-402",
            actId: "acta-301",
            actName: "Acta número Treinta y cinco",
            tomeId: "tome-2024-1", // <-- CAMBIADO
            tomeName: "Tomo 1 - 2024", // <-- CAMBIADO
            name: "Acuerdo número Ciento cincuenta y dos",
            content:
              "<p><strong>Acuerdo número Ciento cincuenta y dos:</strong> Se da por cerrado y finalizado el presente libro de actas.</p>",
            createdAt: daysAgo(45).toISOString(),
            createdBy: users.elena,
            lastModified: daysAgo(45).toISOString(),
            modifiedBy: users.elena,
          },
        ],
        createdAt: daysAgo(50).toISOString(),
        createdBy: users.admin,
        lastModified: daysAgo(45).toISOString(),
        modifiedBy: users.elena,
      },
    ],
  },
};
