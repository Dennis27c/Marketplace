# MarketHub

![MarketHub Logo](./public/package-icon.png)

**MarketHub** es una aplicación web progresiva (PWA) diseñada para gestionar productos y negocios de manera centralizada. Permite a los usuarios administrar múltiples negocios, organizar productos, y prepararlos para su publicación en marketplace de forma rápida y eficiente.

## 🚀 Características Principales

### Gestión de Negocios
- ✅ Crear y gestionar múltiples negocios
- ✅ Cambiar entre negocios activos fácilmente
- ✅ Información detallada de cada negocio (nombre, descripción, logo, contacto)

### Gestión de Productos
- ✅ Crear, editar y eliminar productos
- ✅ Categorización de productos
- ✅ Estados de productos: Disponible, Vendido, Reservado
- ✅ Subida de imágenes para productos
- ✅ Precios y descripciones detalladas
- ✅ Marcar productos como subidos a Marketplace
- ✅ Filtros y búsqueda avanzada
- ✅ Vista dedicada de productos vendidos (todos los negocios)
- ✅ Filtros por categoría y negocio en productos vendidos

### Dashboard Interactivo
- ✅ Resumen general de estadísticas
- ✅ Vista de productos recientes
- ✅ Accesos rápidos a funciones principales
- ✅ Información del negocio activo

### Notificaciones en Tiempo Real
- ✅ Notificaciones automáticas cuando se agregan productos
- ✅ Alertas cuando un producto se marca como vendido
- ✅ Notificaciones de nuevos negocios
- ✅ Sistema de notificaciones no leídas

### Experiencia de Usuario
- ✅ Diseño responsive (móvil y desktop)
- ✅ Interfaz moderna y limpia
- ✅ Navegación intuitiva con breadcrumbs
- ✅ Modales y diálogos accesibles
- ✅ Tema claro/oscuro (preparado)
- ✅ Barra de scroll personalizada con colores del tema
- ✅ Filtros optimizados para desktop y móvil

### Progressive Web App (PWA)
- ✅ Instalable en dispositivos móviles
- ✅ Funcionalidad offline básica
- ✅ Icono personalizado para pantalla de inicio
- ✅ Experiencia tipo app nativa

## 🛠️ Tecnologías Utilizadas

### Frontend
- **React 18.3** - Biblioteca de UI
- **TypeScript** - Tipado estático
- **Vite** - Build tool y dev server
- **React Router** - Navegación
- **Tailwind CSS** - Estilos utility-first
- **Radix UI** - Componentes accesibles
- **Lucide React** - Iconos
- **Sonner** - Notificaciones toast

### Backend y Base de Datos
- **Supabase** - Backend as a Service
  - PostgreSQL para base de datos
  - Realtime subscriptions
  - Storage para imágenes
  - Autenticación

### Estado y Datos
- **TanStack Query (React Query)** - Gestión de estado del servidor
- **Context API** - Estado global de la aplicación

### Herramientas de Desarrollo
- **ESLint** - Linter
- **Vitest** - Framework de testing
- **Sharp** - Procesamiento de imágenes

## 📋 Requisitos Previos

- Node.js 18+ y npm
- Cuenta en Supabase
- Git

## 🔧 Instalación

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd Marketplace
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno**
   
   Crea un archivo `.env` en la raíz del proyecto:
   ```env
   VITE_SUPABASE_URL=tu_url_de_supabase
   VITE_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
   ```

4. **Configurar la base de datos**
   
   Sigue las instrucciones en `DATABASE_SETUP.md` para configurar las tablas, triggers y políticas en Supabase.

5. **Iniciar el servidor de desarrollo**
   ```bash
   npm run dev
   ```

6. **Abrir en el navegador**
   
   La aplicación estará disponible en `http://localhost:5173`

## 📱 Uso como PWA

### En Móvil (Android/iOS)

1. Abre la aplicación en tu navegador móvil
2. Busca la opción "Agregar a la pantalla de inicio" o "Instalar app"
3. Confirma la instalación
4. El icono de MarketHub aparecerá en tu pantalla de inicio

### En Desktop (Chrome/Edge)

1. Abre la aplicación en el navegador
2. Haz clic en el icono de instalación en la barra de direcciones
3. O ve a Configuración > Aplicaciones > Instalar MarketHub

## 🏗️ Estructura del Proyecto

```
Marketplace/
├── public/
│   ├── manifest.json          # Configuración PWA
│   ├── sw.js                  # Service Worker
│   ├── package-icon.png       # Icono de la aplicación
│   └── package-icon.svg       # Icono SVG
├── src/
│   ├── components/
│   │   ├── layout/           # Componentes de layout (Header, Sidebar, MainLayout)
│   │   └── ui/               # Componentes UI reutilizables (shadcn/ui)
│   ├── context/
│   │   └── AppContext.tsx     # Contexto global de la aplicación
│   ├── pages/                # Páginas principales
│   │   ├── Dashboard.tsx
│   │   ├── Products.tsx
│   │   ├── ProductDetail.tsx
│   │   ├── ProductForm.tsx
│   │   ├── Businesses.tsx
│   │   └── Login.tsx
│   ├── lib/
│   │   ├── supabase.ts       # Cliente de Supabase
│   │   ├── storage.ts         # Utilidades de almacenamiento
│   │   └── utils.ts           # Utilidades generales
│   ├── App.tsx               # Componente raíz
│   └── main.tsx               # Punto de entrada
├── DATABASE_SETUP.md          # Guía de configuración de BD
└── README.md                   # Este archivo
```

## 🎨 Características de Diseño

- **Diseño Responsive**: Optimizado para móvil, tablet y desktop
- **Componentes Accesibles**: Usa Radix UI para componentes accesibles
- **Iconos Consistentes**: Lucide React para iconografía uniforme
- **Navegación Clara**: Breadcrumbs y navegación intuitiva
- **Feedback Visual**: Toasts y notificaciones para acciones del usuario

## 🔐 Autenticación

Actualmente la aplicación usa un sistema de autenticación simplificado. Para producción, se recomienda implementar:

- Autenticación completa con Supabase Auth
- Roles y permisos de usuario
- Protección de rutas

## 📊 Funcionalidades por Página

### Dashboard
- Estadísticas generales (total negocios, productos, disponibles)
- Accesos rápidos a funciones principales
- Vista de productos recientes
- Información del negocio activo

### Productos
- Lista de todos los productos del negocio activo
- Filtros por categoría, estado y búsqueda
- Paginación
- Acciones rápidas (editar, eliminar, marcar como vendido)
- Navegación al detalle con un clic

### Productos Vendidos
- Vista consolidada de todos los productos vendidos
- Muestra productos de todos los negocios (sin importar el negocio activo)
- Filtros por categoría y negocio
- Búsqueda de productos vendidos
- Badge con nombre del negocio en cada card
- Paginación para mejor rendimiento
- Diseño responsive (2 columnas en móvil)

### Detalle de Producto
- Información completa del producto
- Botones de acción (editar, eliminar)
- Compartir enlace del producto
- Copiar información al portapapeles
- Marcar como subido a Marketplace

### Formulario de Producto
- Crear nuevo producto
- Editar producto existente
- Subida de imágenes
- Validación de formularios
- Navegación con breadcrumbs

### Negocios
- Lista de todos los negocios
- Crear, editar y eliminar negocios
- Cambiar negocio activo
- Información detallada de cada negocio

## 🚀 Scripts Disponibles

```bash
# Desarrollo
npm run dev              # Inicia servidor de desarrollo

# Producción
npm run build            # Construye para producción
npm run build:dev        # Construye en modo desarrollo
npm run preview          # Previsualiza build de producción

# Calidad de código
npm run lint             # Ejecuta ESLint

# Testing
npm run test             # Ejecuta tests
npm run test:watch       # Ejecuta tests en modo watch
```

## 📝 Notas de Desarrollo

### Service Worker
El service worker (`sw.js`) proporciona funcionalidad offline básica. Para producción, considera implementar estrategias de caché más avanzadas.

### Imágenes
Las imágenes se almacenan en Supabase Storage. Asegúrate de configurar el bucket `marketplace-images` con las políticas correctas.

### Realtime
La aplicación usa suscripciones en tiempo real de Supabase para notificaciones. Asegúrate de que Realtime esté habilitado en tu proyecto.

### Estilos Personalizados
- La barra de scroll está personalizada con los colores del tema (primary y muted)
- Los estilos se adaptan automáticamente al modo claro/oscuro
- Compatible con Chrome, Safari, Edge (Webkit) y Firefox

### Página de Productos Vendidos
- La página `/products/sold` muestra todos los productos vendidos de todos los negocios
- Útil para tener una vista consolidada de ventas sin cambiar el negocio activo
- Los filtros en desktop están siempre visibles en la misma línea que la búsqueda

## 🤝 Contribuir

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📄 Licencia

Este proyecto es privado y de uso interno.

## 👥 Autor

Desarrollado para gestión de productos y negocios.

## 🙏 Agradecimientos

- [Supabase](https://supabase.com) por el excelente backend
- [shadcn/ui](https://ui.shadcn.com) por los componentes UI
- [Lucide](https://lucide.dev) por los iconos
- [Vite](https://vitejs.dev) por el build tool

---

**MarketHub** - Gestiona tus productos para Marketplace de forma centralizada y eficiente.
