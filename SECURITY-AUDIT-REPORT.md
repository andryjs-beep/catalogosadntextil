# 🛡️ REPORTE DE AUDITORÍA DE SEGURIDAD Y PENTESTING (SECURE CODE REVIEW)

**Proyecto:** Catálogos ADN Textil & Plataforma Multi-Tenant E-Commerce  
**Fecha:** Noviembre 2026  
**Auditor:** Senior Security Researcher & Penetration Tester (Bug Hunter)  
**Alcance:** Código Fuente Completo (Next.js 15, App Router, MongoDB/Mongoose, JWT Auth, API Endpoints, Roles y Control de Acceso)  
**Estándar:** OWASP Top 10 (2021/2025) & OWASP API Security Top 10  

---

## 📊 RESUMEN EJECUTIVO

Se ejecutó un análisis estático de seguridad (SAST) y revisión manual exhaustiva del código fuente. Se identificaron **6 vulnerabilidades clave**, clasificadas por criticidad según el estándar CVSS v3.1:

| Criticidad | Cantidad | Vulnerabilidades Detectadas |
|---|---|---|
| 🔴 **CRÍTICO** | **1** | BOLA / IDOR en API Routes de Client-Admin (`requireClientAdmin` sin verificación de Tenant ID) |
| 🟠 **ALTO** | **2** | Ausencia de Rate Limiting en Endpoints Críticos (Fuerza Bruta en Login y DoS en AI/Uploads) + XSS Almacenado vía `dangerouslySetInnerHTML` |
| 🟡 **MEDIO** | **2** | Exposición de Secretos / Falta de Rotación & Configuración de Cookies JWT sin protección `SameSite=Strict` |
| 🟢 **BAJO** | **1** | Falta de Sanitización Estricta en Consultas Regex (Posible ReDoS en Búsqueda) |

---

## 🔎 HALLAZGOS DETALLADOS Y PRUEBAS DE CONCEPTO (PoC)

### 🔴 HALLAZGO 1: BOLA / IDOR (Broken Object Level Authorization) en Rutas Client-Admin
* **Categoría OWASP:** A01:2021 – Broken Access Control / API1:2023 – Broken Object Level Authorization
* **Severidad:** **CRÍTICA (CVSS: 9.1)**
* **Archivos afectados:** 
  * `app/api/client-admin/collections/[colId]/landing/route.ts`
  * `app/api/client-admin/products/route.ts`
  * `lib/auth.ts` (función `requireClientAdmin`)

#### 📝 Descripción de la Vulnerabilidad
En `lib/auth.ts`, la función `requireClientAdmin(tenantId?: string)` define un parámetro opcional `tenantId`. Cuando se invoca sin argumentos en endpoints como `requireClientAdmin()`, la función únicamente valida que el usuario tenga el rol `client-admin` y que la cookie sea válida, pero **NO verifica automáticamente si el recurso que se intenta modificar pertenece al tenant del usuario autenticado**.

Si un usuario malicioso que administra el tenant "B" envía una solicitud manipulando el `tenantId` en el payload JSON o modificando el `colId` de una colección que pertenece al tenant "A", la base de datos permite la lectura o actualización no autorizada de productos, banners y textos de otros clientes.

#### 💥 Impacto
Cualquier cliente con acceso a su panel puede alterar, secuestrar o espiar la información comercial de los demás clientes alojados en la plataforma.

#### 🛠️ Mitigación Sugerida
Forzar que todas las consultas de base de datos dentro de `/api/client-admin/*` utilicen estrictamente `session.tenantId` extraído del token JWT validado, y rechazar de inmediato si el recurso consultado no coincide:
```typescript
const session = await requireClientAdmin();
const tenantCollection = await TenantCollection.findOne({
    tenantId: session.tenantId, // Forzar pertenencia al tenant de la sesión
    collectionId: colId
});
if (!tenantCollection) {
    return NextResponse.json({ error: 'Recurso no encontrado o no autorizado' }, { status: 403 });
}
```

---

### 🟠 HALLAZGO 2: Ausencia de Rate Limiting y Protección Anti-Fuerza Bruta en Login
* **Categoría OWASP:** A07:2021 – Identification and Authentication Failures
* **Severidad:** **ALTA (CVSS: 7.8)**
* **Archivos afectados:**
  * `app/api/auth/login/route.ts`
  * `app/api/ai/generate-copy/route.ts`
  * `app/api/upload/route.ts`

#### 📝 Descripción de la Vulnerabilidad
El endpoint `POST /api/auth/login` permite un número ilimitado de intentos de autenticación sin ningún tipo de retardo progresivo, CAPTCHA, bloqueo de IP ni limitación de tasa (Rate Limiting). Un atacante con una lista de diccionarios (RockYou, credenciales filtradas) puede ejecutar ataques automatizados de fuerza bruta para comprometer cuentas de Super-Admin o administradores de tiendas.

Asimismo, los endpoints `/api/ai/generate-copy` y `/api/upload` no tienen límite de peticiones por minuto, lo que expone a la plataforma a:
1. Agotamiento de créditos en Google Gemini / OpenRouter / Cloudinary.
2. Ataques de denegación de servicio (DoS) por sobrecarga de procesamiento.

#### 🛠️ Mitigación Sugerida
Implementar una biblioteca de rate limiting en memoria o mediante Redis (por ejemplo `@upstash/ratelimit` o un middleware con mapa en memoria para IPs):
* Máximo 5 intentos fallidos de login por IP cada 15 minutos.
* Máximo 10 uploads por minuto por sesión autenticada.

---

### 🟠 HALLAZGO 3: Potencial XSS Almacenado (Cross-Site Scripting) vía `dangerouslySetInnerHTML`
* **Categoría OWASP:** A03:2021 – Injection
* **Severidad:** **ALTA (CVSS: 7.2)**
* **Archivos afectados:**
  * `app/t/[tenantSlug]\[collectionSlug]\[productId]\page.tsx`
  * `components/HeroSection.tsx`
  * `components/TermsAndConditions.tsx`

#### 📝 Descripción de la Vulnerabilidad
En la página del producto y componentes de landing, se utiliza `dangerouslySetInnerHTML` para renderizar descripciones y textos personalizados (`customization.landingContent.subheadline`, `finalDescription`, etc.):
```tsx
<div dangerouslySetInnerHTML={{ __html: customization.landingContent.subheadline }} />
```
Si un atacante logra comprometer una cuenta de client-admin o inyectar etiquetas `<script>` o eventos `onerror` en el campo de descripción/subheadline mediante una petición a la API, cualquier visitante o comprador que entre a la tienda ejecutará código JavaScript malicioso en su navegador (robo de cookies no-httpOnly, redirecciones a sitios de phishing bancario, etc.).

#### 🛠️ Mitigación Sugerida
Sanitizar todo HTML antes de renderizar utilizando librerías robustas como `isomorphic-dompurify` o `sanitize-html`:
```typescript
import DOMPurify from 'isomorphic-dompurify';

<div dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(finalDescription) }} />
```

---

### 🟡 HALLAZGO 4: Duración Prolongada de Sesión y Configuración de Cookies JWT
* **Categoría OWASP:** A07:2021 – Identification and Authentication Failures
* **Severidad:** **MEDIA (CVSS: 5.3)**
* **Archivos afectados:**
  * `lib/auth.ts`

#### 📝 Descripción de la Vulnerabilidad
1. **Expiración de Token:** El token JWT se firma con `expiresIn: '7d'` (7 días completos) y no existe un mecanismo de lista negra (Revocation List / Token Invalidation). Si un atacante intercepta o extrae el token del dispositivo de un usuario, dicho token seguirá siendo válido durante toda la semana incluso si el usuario cambia su contraseña.
2. **Atributo SameSite:** La cookie `auth_token` se configura con `sameSite: 'lax'`. Para paneles administrativos de alta criticidad (`/admin`), se recomienda `sameSite: 'strict'` o esquemas CSRF tokens dedicados si se realizan peticiones cruzadas.

#### 🛠️ Mitigación Sugerida
* Reducir la validez del token de acceso a 1 o 2 días.
* Al cambiar la contraseña en `PATCH /api/admin/tenants/[id]/password`, añadir un campo `tokenVersion` en el modelo `User` para invalidar inmediatamente todos los JWTs emitidos previamente.

---

### 🟡 HALLAZGO 5: Subida de Archivos Sin Validación de Magic Bytes (MIME Spoofing)
* **Categoría OWASP:** A04:2021 – Insecure Design
* **Severidad:** **MEDIA (CVSS: 4.8)**
* **Archivos afectados:**
  * `app/api/upload/route.ts`

#### 📝 Descripción de la Vulnerabilidad
En `POST /api/upload`, la validación del archivo se basa en `file.type`:
```typescript
const validTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
if (!validTypes.includes(file.type)) { ... }
```
La propiedad `file.type` es un encabezado enviado por el cliente que puede ser fácilmente falsificado mediante herramientas como Postman o Burp Suite (enviar un archivo `.exe` o `.svg` con `Content-Type: image/jpeg`). Aunque Cloudinary procesa las imágenes en la nube, archivos con extensiones no deseadas o scripts embebidos en SVGs podrían ser almacenados si la configuración de Cloudinary no fuerza el re-encodeo.

#### 🛠️ Mitigación Sugerida
1. Utilizar una librería de análisis de firmas de cabecera binaria (Magic Bytes) como `file-type` antes de procesar el buffer.
2. Configurar la subida a Cloudinary con `resource_type: 'image'` y sanitización automática de SVGs activada.

---

### 🟢 HALLAZGO 6: Potencial Inyección en Consultas de Búsqueda / ReDoS
* **Categoría OWASP:** A03:2021 – Injection
* **Severidad:** **BAJA (CVSS: 3.5)**
* **Archivos afectados:**
  * `app/api/admin/products/route.ts`
  * `app/api/admin/collections/route.ts`

#### 📝 Descripción de la Vulnerabilidad
Cuando se realizan búsquedas en el catálogo con expresiones regulares en MongoDB (`$regex`), caracteres especiales como `.*.*.*` o `(a+)+` enviados por usuarios pueden provocar expresiones regulares catastróficas (ReDoS) que consumen el 100% de la CPU de la instancia de MongoDB.

#### 🛠️ Mitigación Sugerida
Escapar todos los caracteres especiales en búsquedas con regex mediante una función helper:
```typescript
function escapeRegex(text: string) {
    return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
}
```

---

## 📋 PLAN DE ACCIÓN RECOMENDADO (ROADMAP DE REMEDIACIÓN)

1. **Fase Inmediata (Día 1):**
   * Incorporar `DOMPurify` en todos los puntos que usan `dangerouslySetInnerHTML`.
   * Reforzar la verificación de `session.tenantId` en todos los endpoints de `/api/client-admin/`.

2. **Fase a Corto Plazo (Semana 1):**
   * Configurar Rate Limiting en `/api/auth/login` y `/api/upload`.
   * Añadir `tokenVersion` al modelo de usuario para revocación de sesiones al cambiar contraseñas.

3. **Fase de Mantenimiento:**
   * Configurar alertas de uso anómalo en Cloudinary y Gemini API.

---
*Reporte generado por Bug Hunter & Security Researcher — Código seguro para producción.*
