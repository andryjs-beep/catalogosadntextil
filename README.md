# Catálogo Multi-Tenant ADN Textil

Aplicación web multi-tenant de catálogos de productos con Next.js 14+, TypeScript, Tailwind CSS, shadcn/ui, MongoDB Atlas y Cloudinary.

## 🚀 Características

- **Multi-tenant por subdominios**: Cada cliente tiene su propio subdominio (cliente.tudominio.com)
- **Panel Super-Admin**: Gestión completa de productos, colecciones y tenants
- **Panel Cliente-Admin**: Personalización de branding, textos y precios
- **WhatsApp integrado**: Botones de contacto con tracking de clicks
- **Analytics**: Tracking de vistas y conversiones por tenant
- **Branding dinámico**: Colores, logos y fuentes personalizables por cliente

## 📋 Requisitos Previos

- Node.js 18+
- MongoDB Atlas (o MongoDB local)
- Cuenta de Cloudinary
- Dominio con wildcard DNS (*.tudominio.com)

## ⚙️ Configuración

### 1. Clonar e instalar dependencias

```bash
git clone <tu-repositorio>
cd catalogo-multi-tenant
npm install
```

### 2. Configurar variables de entorno

Copia `.env.example` a `.env.local` y completa los valores:

```bash
cp .env.example .env.local
```

Variables requeridas:
- `MONGODB_URI`: Connection string de MongoDB Atlas
- `CLOUDINARY_CLOUD_NAME`: Cloud name de Cloudinary
- `CLOUDINARY_API_KEY`: API Key de Cloudinary
- `CLOUDINARY_API_SECRET`: API Secret de Cloudinary
- `JWT_SECRET`: Secreto para JWT (mínimo 32 caracteres)
- `NEXT_PUBLIC_BASE_DOMAIN`: Tu dominio base (ej: tudominio.com)

### 3. Ejecutar seed (datos iniciales)

```bash
npm run seed
```

Esto crea:
- Super Admin: `admin@catalogo.com` / `admin123456`
- Cliente Demo: `cliente@demo.com` / `cliente123456`
- 10 productos de ejemplo
- 3 colecciones (gorras, mugs, llaveros)

### 4. Ejecutar en desarrollo

```bash
npm run dev
```

Accede a:
- Panel Admin: http://localhost:3000/admin
- Login: http://localhost:3000/login

## 🌐 Deploy en Vercel

### 1. Conectar repositorio

```bash
vercel link
```

### 2. Configurar variables de entorno en Vercel

En el dashboard de Vercel → Settings → Environment Variables, agrega todas las variables de `.env.local`.

### 3. Configurar Wildcard Domain

1. Ve a Settings → Domains
2. Agrega tu dominio: `tudominio.com`
3. Agrega wildcard: `*.tudominio.com`
4. Configura DNS según instrucciones de Vercel

### 4. Deploy

```bash
vercel --prod
```

## 📁 Estructura del Proyecto

```
├── app/
│   ├── admin/            # Super-Admin UI
│   ├── api/              # API Routes
│   │   ├── admin/        # APIs Super-Admin
│   │   ├── client-admin/ # APIs Cliente-Admin
│   │   ├── auth/         # Autenticación
│   │   └── analytics/    # Tracking
│   ├── login/            # Página de login
│   └── t/[tenantSlug]/   # Páginas públicas tenant
├── components/           # Componentes React
├── lib/                  # Utilidades y modelos
│   ├── models/           # Mongoose schemas
│   ├── auth.ts           # Autenticación
│   ├── cloudinary.ts     # Upload de imágenes
│   └── validations.ts    # Schemas Zod
├── middleware.ts         # Multi-tenant routing
└── scripts/
    └── seed.ts           # Datos iniciales
```

## 👤 Roles y Accesos

### Super-Admin
- Acceso: `/admin`
- Funciones:
  - Gestionar productos master
  - Gestionar colecciones
  - Crear y gestionar tenants
  - Asignar colecciones a tenants
  - Ver analytics global

### Cliente-Admin
- Acceso: `cliente.tudominio.com/admin`
- Funciones:
  - Editar branding (colores, logo, fuente)
  - Configurar redes sociales
  - Personalizar nombres, precios y descripciones
  - Ver analytics propio

## 🔧 Desarrollo Local con Subdominios

Para probar subdominios localmente:

### Opción 1: Modificar hosts

Agrega a tu archivo hosts:
```
127.0.0.1 demo.localhost
127.0.0.1 cliente.localhost
```

### Opción 2: Usar ngrok

```bash
ngrok http 3000 --subdomain=tu-subdominio
```

## 📊 Stack Tecnológico

- **Frontend**: Next.js 14+, React 19, TypeScript
- **Estilos**: Tailwind CSS 4, shadcn/ui
- **Backend**: Next.js API Routes
- **Base de datos**: MongoDB + Mongoose
- **Autenticación**: bcryptjs + JWT
- **Imágenes**: Cloudinary
- **Gráficos**: Recharts
- **Validación**: Zod + React Hook Form

## 📝 Licencia

MIT

---

Desarrollado con ❤️ para ADN Textil
