# 🏛️ Sistema de Gestión de Actas y Acuerdos Municipales (Frontend)

Este repositorio contiene el código fuente del **Frontend** para el Sistema de Gestión Documental Municipal**.  
Es una aplicación web moderna diseñada para administrar el ciclo de vida completo de los libros de actas,  
sesiones del concejo, acuerdos y generación de documentos legales en PDF.

---

## 🚀 Tecnologías Principales

El proyecto está construido sobre un stack robusto y moderno, optimizado para rendimiento y mantenibilidad:

- **Core:** React 18 + TypeScript + Vite.  
- **Estilos:** Tailwind CSS + shadcn/ui (Radix UI).  
- **Estado y Formularios:** React Hook Form + Zod (validación estricta).  
- **Navegación:** React Router v6.  
- **Cliente HTTP:** Axios (con interceptores para manejo de JWT y errores 401).  
- **Editor de Texto:** Tiptap (personalizado para tablas complejas, listas romanas e importación de HTML).  
- **PDF:** @react-pdf/renderer (generación dinámica en el cliente, sin latencia de servidor).  
- **Utilidades:** date-fns (fechas), mammoth.js (importar Word), xlsx (importar Excel).

---

## 🛠️ Instalación y Configuración

### **Prerrequisitos**
- Node.js (v18 o superior recomendado)
- npm o yarn

### **Pasos de Instalación**

1. **Clonar el repositorio:**
   ```bash
   git clone <URL_DEL_REPOSITORIO>
   cd <NOMBRE_DEL_PROYECTO>
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar Variables de Entorno:**  
   Crea un archivo `.env` en la raíz del proyecto:

   ```
   VITE_API_URL=http://localhost:3000/api
   ```

4. **Ejecutar en Desarrollo:**
   ```bash
   npm run dev
   ```

   La aplicación estará disponible en:  
   **http://localhost:5173**

---

## 📂 Arquitectura del Proyecto

El proyecto sigue una arquitectura modular basada en **Features (Características)**, donde cada dominio
del negocio tiene su propia carpeta con sus componentes, servicios y tipos.

```
src/
├── components/        # UI compartida (Botones, Modales, Inputs, Layouts)
│   └── editor/        # Configuración del Editor Tiptap y extensiones
├── config/            # Menús de navegación y constantes globales
├── features/          # Módulos de Negocio (Core del Sistema)
│   ├── act/           # Gestión de Actas (Editor, Asistencia, Lógica de Sesiones)
│   ├── agreement/     # Gestión de Acuerdos (ABM y listados)
│   ├── auth/          # Autenticación, Login, Guardas de Rutas, Contexto
│   ├── book/          # Libros, Tomos, Workspace Principal, PDF Engine
│   ├── council/       # Gestión de Miembros del Concejo (Propietarios/Suplentes)
│   ├── dashboard/     # Vista principal, estadísticas y actividad reciente
│   ├── search/        # Búsqueda global unificada
│   ├── audit/         # Visualización de logs de auditoría
│   └── user/          # Administración de usuarios del sistema
├── hooks/             # Hooks personalizados (useSaveAction, useMobile)
├── lib/               # Utilidades (formateadores, apiHelpers)
├── routes/            # Definición de rutas y protección por roles
└── types/             # Definiciones de tipos TypeScript globales (DTOs)
```

---

## 🧩 Funcionalidades Clave y Detalles Técnicos

### **1. Espacio de Trabajo (Book Workspace)**
**Ubicación:** `src/features/book/pages/BookWorkspacePage.tsx`  

**Funcionalidad:** Interfaz principal para la edición. Permite navegar entre Portada, Actas y Acuerdos  
sin recargar la página.

**Lógica Avanzada:**
- **Paginación Continua:** Calcula automáticamente la página inicial del acta según la anterior (`lastPageNumber`),
  asegurando continuidad perfecta en el PDF final del libro.
- **Bloqueo de Estado:** Si el tomo está **FINALIZADO** o **ARCHIVADO**, se bloquean todas las acciones de escritura.

---

### **2. Motor de PDF (BookPdfRenderer)**  
**Ubicación:** `src/features/book/components/`  
**Tecnología:** `@react-pdf/renderer`

**Características:**
- **Firmas Dinámicas:** Calcula automáticamente las firmas al pie del acta.  
- **Filtrado de Suplentes:** Oculta suplentes si el propietario asistió.  
- **Orden Jerárquico:**  
  - Alcaldesa (Centro Arriba)  
  - Síndico (Columna 1)  
  - Regidores (Columnas)  
  - Secretaria (Centro Abajo)
- **Vista Previa Contextual:** Renderiza el final del acta previa para mostrar continuidad.
- **Cierre de Libro:** Genera la página final con firmas del concejo propietario (solo titulares, sin suplentes).

---

### **3. Editor de Texto Rico (RichTextEditor)**

Extensiones personalizadas:

- **RomanOrderedList:** Listas numeradas con números romanos (I, II, III).  
- **ExtendedTable:** Tablas avanzadas con bordes, tamaños personalizados y celdas combinadas.  
- **Importador de Archivos:**  
  - Permite cargar `.docx` y `.xlsx`.  
  - Limpia el HTML sucio de Word (`removeWordEndOfCellMarkers`).  
  - Normaliza estilos (`elevateCellInLineStyles`) para compatibilidad con el editor web.

---

### **4. Gestión de Asistencia (Attendance)**

- Control granular para propietarios y suplentes.  
- Distingue:
  - **Suplente por derecho propio** (oyente)  
  - **Suplente supliendo al propietario** (con voto)

---

### **5. Seguridad y Roles**


**Protección del Sistema:**
- `RoleProtectedRoute` para proteger rutas sensibles.  
- Módulo de **auditoría**, registrando creación, modificación y eliminación de:
  - Actas  
  - Acuerdos  
  - Libros  

---

### **6. Administración de Usuarios y Concejo**

- ABM completo de usuarios.  
- Tipos de sesión:
  - **Indefinida**
  - **Temporal** (con expiración automática)
- Gestión de "Lista Maestra" del concejo, incluyendo asignación de suplentes por propietario.

---

## 📦 Scripts Disponibles

- `npm run dev` — Inicia el servidor de desarrollo.  
- `npm run build` — Construye la aplicación para producción.  
- `npm run lint` — Analiza el código en busca de errores.  
- `npm run preview` — Sirve la versión de producción para pruebas.

---

## 🤝 Estilo de Código

- TypeScript en modo estricto.  
- Componentes basados en funciones usando Hooks.  
- Uso extensivo de **shadcn/ui** como base UI.  
- Manejo de errores mediante **ErrorBoundary** global y notificaciones con **Sonner**.

---

**Sistema de Gestión Documental – Alcaldía Municipal 2025**
