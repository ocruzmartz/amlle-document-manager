# 🏛️ Sistema de Gestión de Actas y Acuerdos Municipales (Frontend)

Este repositorio contiene el código fuente del Frontend para el Sistema de Gestión Documental Municipal. Es una aplicación web moderna diseñada para administrar el ciclo de vida completo de los libros de actas, sesiones del concejo, acuerdos y generación de documentos legales en PDF.

## 🚀 Tecnologías Principales

El proyecto está construido sobre un stack robusto y moderno, optimizado para rendimiento y mantenibilidad:

Core: React 18 + TypeScript + Vite.
Estilos: Tailwind CSS + shadcn/ui (Radix UI).
Estado y Formularios: React Hook Form + Zod (validación estricta).
Navegación: React Router v6.
Cliente HTTP: Axios (con interceptores para manejo de JWT y errores 401).
Editor de Texto: Tiptap (Personalizado para tablas complejas, listas romanas e importación de HTML).
PDF: @react-pdf/renderer (Generación dinámica en el cliente, sin latencia de servidor).
Utilidades: date-fns (fechas), mammoth.js (importar Word), xlsx (importar Excel).

## 🛠️ Instalación y Configuración

Prerrequisitos  
Node.js (v18 o superior recomendado)  
npm o yarn  

Pasos de Instalación  
Clonar el repositorio:  
git clone <URL_DEL_REPOSITORIO>  
cd <NOMBRE_DEL_PROYECTO>  

Instalar dependencias:  
npm install  

Configurar Variables de Entorno:  
Crea un archivo .env en la raíz del proyecto basándote en el siguiente ejemplo:  
VITE_API_URL=http://localhost:3000/api  

Ejecutar en Desarrollo:  
npm run dev  
La aplicación estará disponible en http://localhost:5173.

## 📂 Arquitectura del Proyecto

El proyecto sigue una arquitectura modular basada en Features (Características), donde cada dominio del negocio tiene su propia carpeta con sus componentes, servicios y tipos.

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

## 🧩 Funcionalidades Clave y Detalles Técnicos

1. **Espacio de Trabajo (Book Workspace)**  
Ubicación: src/features/book/pages/BookWorkspacePage.tsx  
Funcionalidad: Interfaz principal para la edición. Permite navegar entre Portada, Actas y Acuerdos sin recargar la página.

Lógica Avanzada:  
- Paginación Continua: Calcula automáticamente el número de página inicial de un acta basándose en dónde terminó la anterior (lastPageNumber), asegurando una secuencia perfecta en el PDF del libro completo.  
- Bloqueo de Estado: Si el tomo está FINALIZADO o ARCHIVADO, bloquea todas las acciones de escritura.

2. **Motor de PDF (BookPdfRenderer)**  
Ubicación: src/features/book/components/  
Tecnología: @react-pdf/renderer para renderizado en cliente.

Características:  
- Firmas Dinámicas: Calcula automáticamente las firmas al pie del acta.  
- Filtra suplentes si el propietario asistió.  
- Ordena jerárquicamente: Alcaldesa (Centro Arriba), Síndico (Columna 1), Regidores (Columnas), Secretaria (Centro Abajo).  
- Vista Previa Contextual: Al previsualizar un acta, renderiza también el final del acta anterior para mostrar visualmente la continuidad del texto.  
- Cierre de Libro: Genera la página final de cierre con las firmas de todo el concejo propietario (sin suplentes).

3. **Editor de Texto Rico (RichTextEditor)**

Extensiones Personalizadas:  
- RomanOrderedList: Listas con números romanos (I, II, III).  
- ExtendedTable: Soporte avanzado para tablas (bordes, anchos, celdas combinadas).  

Importador de Archivos:  
Permite cargar archivos .docx y .xlsx. El sistema limpia el HTML sucio de Word (removeWordEndOfCellMarkers) y normaliza estilos (elevateCellInLineStyles) para que sean compatibles con el editor web.

4. **Gestión de Asistencia (Attendance)**  
Control Granular: Permite marcar asistencia de propietarios y suplentes simultáneamente.  
Lógica de Suplencia: Distingue visualmente y en datos cuando un suplente asiste "por derecho propio" (oyente) vs. "supliendo al propietario" (con voto).

5. **Seguridad y Roles**  
Protección: RoleProtectedRoute envuelve las rutas sensibles.  
Auditoría: El módulo audit registra quién creó, modificó o eliminó cada registro (Actas, Acuerdos, Libros).

6. **Administración de Usuarios y Concejo**  
Usuarios: ABM completo con tipos de sesión (Indefinida o Temporal con expiración automática).  
Concejo: Gestión de la "Lista Maestra" de cargos. Permite asignar suplentes específicos a cada propietario.

## 📦 Scripts Disponibles

npm run dev: Inicia el servidor de desarrollo.  
npm run build: Genera la versión de producción en la carpeta dist.  
npm run lint: Analiza el código en busca de errores.  
npm run preview: Sirve la versión de producción localmente para pruebas.

## 🤝 Estilo de Código

TypeScript: Modo estricto activado.  
Se utilizan interfaces y tipos para todos los DTOs (src/types/).  
Componentes: Basados en funciones (Hooks). Uso extensivo de shadcn/ui para componentes base.  
Manejo de Errores: ErrorBoundary global para vistas previas y toast (Sonner) para notificaciones al usuario.

---

Sistema de Gestión Documental - Alcaldía Municipal 2025
