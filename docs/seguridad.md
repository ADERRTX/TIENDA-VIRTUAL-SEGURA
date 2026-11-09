# Seguridad — Tienda Virtual Segura (TVS)

Este documento detalla el modelo de amenazas, la arquitectura de controles de seguridad, las pruebas automatizadas que los verifican y las limitaciones conocidas del backend de "Tienda Virtual Segura".

---

## 1. Modelo de Amenazas (STRIDE / OWASP)

| Categoría | Amenaza Identificada | Impacto | Control Implementado |
|---|---|---|---|
| **Spoofing (Suplantación)** | Falsificación de identidad mediante manipulación de JWT o reutilización de sesiones tras cambio de contraseña/logout. | Acceso no autorizado a cuentas de compradores, vendedores o administradores. | JWT firmado con algoritmo HMAC-SHA256 y secreto de 32+ caracteres. Cookies `HttpOnly`, `SameSite=Lax` y `Secure` en producción. Revocación inmediata comparando `iat` contra `tokensValidAfter`. |
| **Tampering (Manipulación)** | Doble pago simultáneo, compra de productos sin stock (race conditions), o saltos indebidos en el ciclo de vida del pedido. | Pérdida financiera del marketplace, inconsistencias en almacén y bypass de custodia. | Transacciones atómicas de PostgreSQL (`$transaction`), bloqueo de stock, deduplicación concurrente por `Idempotency-Key` (restricción única en BD y catch `P2002`), y máquina de estados finitos (`validateTransition`). |
| **Repudiation (Repudio)** | Negación de acciones críticas (aprobación de pagos, bloqueos de usuario, resoluciones de disputas). | Imposibilidad de auditoría y deslinde de responsabilidades forenses. | Interceptor de auditoría global con `AsyncLocalStorage` que registra de forma inmutable cada mutación con `ip`, `userAgent`, `actorId`, `entity`, `entityId` y fecha. Triggers inmutables en tabla `audit_log`. |
| **Information Disclosure (Fuga de Información)** | IDOR/BOLA donde un usuario accede a datos o pedidos ajenos; exposición de trazas de base de datos en errores 500. | Compromiso de privacidad de compradores y exposición de arquitectura interna. | Validación estricta de pertenencia en servicios de dominio (verificación de `buyerId`, `sellerId`, etc.). `AllExceptionsFilter` oculta stack traces y mensajes internos de BD en `NODE_ENV=production`. |
| **Denial of Service (Denegación de Servicio)** | Ataques de fuerza bruta a endpoints de login/reset; subida de archivos gigantescos; saturación de memoria. | Inoperabilidad del servidor y consumo excesivo de disco/memoria. | Throttling global (200 req/min) y estricto en autenticación (5 req/min con bloqueo temporal de cuenta tras 5 fallos, HTTP 423). Límite de subida de 5 MB en Multer y validación de magic bytes. |
| **Elevation of Privilege (Escalada de Privilegios)** | Comprador intentando autorizar vendedores, vendedor editando configuraciones globales, o soporte modificando saldos. | Compromiso administrativo del marketplace. | `RolesGuard` verificando roles canónicos (`BUYER`, `SELLER`, `SUPPORT`, `ADMIN`) de forma estricta. Verificación a nivel de servicio para restringir que `SUPPORT` no gestione usuarios y que `ADMIN` no altere pagos de custodia. |

---

## 2. Controles de Seguridad Implementados

### 2.1 Autenticación y Gestión de Sesiones
- **Algoritmo de Hashing:** Argon2id con parámetros recomendados por OWASP (`memoryCost: 19456`, `timeCost: 2`, `parallelism: 1`).
- **Bloqueo por Fuerza Bruta:** Registro de intentos fallidos (`failedAttempts`). Al quinto intento fallido consecutivo, la cuenta pasa a estado `LOCKED` por 15 minutos (HTTP 423).
- **Almacenamiento de Token:** Cookie `jwt` segura con banderas `HttpOnly`, `SameSite=Lax` y `Secure` (activada automáticamente cuando `NODE_ENV=production`).
- **Revocación de Sesiones:** El campo `tokensValidAfter` en el modelo `User` invalida cualquier token emitido previamente cuando el usuario realiza logout, cambia de contraseña o es bloqueado por un administrador.
- **Recuperación de Contraseña:** Flujo seguro vía `POST /auth/forgot-password` y `POST /auth/reset-password` mediante tokens efímeros unívocos (15 minutos) almacenados con hash criptográfico SHA-256 en la tabla `PasswordReset`.

### 2.2 Protección contra CSRF y Cabeceras de Seguridad
- **Validación de Origen (CSRF):** `AuthGuard` y `main.ts` validan que cada petición de mutación contenga una cabecera `Origin` perteneciente a la lista blanca estricta `CORS_ORIGINS`. Peticiones sin origen o con origen ajeno son rechazadas con HTTP 403 `CSRF_ORIGIN_INVALID`.
- **Cabeceras HTTP:** Implementación de `helmet` con política `crossOriginResourcePolicy: { policy: 'same-site' }`.

### 2.3 Autorización y Prevención de IDOR / BOLA
- Cada endpoint que procesa información privada (`cart`, `orders`, `payments`, `users/addresses`, `notifications`, `claims`, `seller/catalog`) valida programáticamente que la entidad pertenezca al usuario autenticado antes de consultar o mutar los datos. Si la entidad no existe o no pertenece al actor, se responde HTTP 404 `NOT_FOUND` para evitar enumeración.
- Matriz RBAC verificada: `SUPPORT` tiene acceso de solo lectura para auditar y resolver reclamos/envíos, sin facultades para crear administradores, editar usuarios o aprobar vendedores.

### 2.4 Control Financiero y Custodia (Escrow)
- **Custodia Atómica:** Al procesar un pago exitoso (`tok_ok`), el monto ingresa en estado `RETENIDO` en la tabla `Custody`.
- **Congelamiento por Disputas:** Si el comprador abre un reclamo dentro de los plazos válidos, la custodia pasa inmediatamente a `CONGELADO`.
- **Resolución y Tope de Reembolso:** La resolución por parte de soporte/admin libera la custodia hacia `DEVUELTO` (generando un registro `Refund` atómico) o hacia `LIBERADO` a favor del vendedor. Triggers en BD y comprobaciones de servicio impiden que el reembolso supere el monto originalmente pagado.
- **Idempotencia:** Cabecera `Idempotency-Key` en creación de órdenes y pagos. Respuestas cacheadas en la tabla `idempotency_key` y bloqueo de pagos duplicados para una misma orden vía restricciones únicas en PostgreSQL.

### 2.5 Validación de Archivos y Subidas
- **Magic Bytes:** El validador `file-validator.ts` inspecciona los primeros bytes del búfer para verificar la firma real del formato (JPEG: `FF D8 FF`, PNG: `89 50 4E 47`, WEBP: `52 49 46 46 ... 57 45 42 50`). Se rechaza cualquier archivo cuya extensión declarada no coincida con su firma real.
- **Sanitización y Rollback:** Nombres de archivo generados con UUID v4. Si la transacción de base de datos o el registro de auditoría falla, el archivo guardado temporalmente en disco es eliminado de inmediato.
- **Tamaño Máximo:** 5 MB por archivo.

---

## 3. Pruebas Automatizadas de Seguridad

La suite de pruebas automatizadas en Jest se ejecuta contra una base de datos aislada (`tienda_virtual_segura_test`):

1. **`test/auth-security.spec.ts` (12 pruebas):**
   - Hashing Argon2id en registro.
   - Login con cookie HttpOnly y SameSite.
   - Bloqueo de cuenta tras 5 intentos fallidos (HTTP 423).
   - Rechazo de acceso a usuarios bloqueados (HTTP 401).
   - Bloqueo CSRF sin cabecera `Origin` o con origen no permitido (HTTP 403).
   - Rechazo de tokens manipulados, con firma inválida o expirados.
   - Cambio de contraseña exigiendo longitud mínima (12+), complejidad, verificación de contraseña actual y revocación de sesiones previas.
   - Logout seguro con limpieza de cookie.
   - Ciclo de recuperación `forgot-password` y `reset-password`.
   - Validación estricta del cuerpo con `ZodPipe` (rechazo de parámetros no permitidos).
   - Verificación de limitación de tasa (Throttling / HTTP 429).

2. **`test/authorization-idor.spec.ts` (9 pruebas):**
   - Matriz completa de roles (Anónimo, Buyer, Seller, Support, Admin).
   - Validación IDOR en direcciones (un comprador no puede ver ni modificar direcciones ajenas).
   - Validación IDOR en notificaciones (un usuario no puede marcar ni ver notificaciones de otro).
   - Validación IDOR en pedidos y pagos (un comprador no puede acceder a sub-pedidos ni pagos ajenos).
   - Validación IDOR en catálogo de vendedores (un vendedor no puede consultar ni editar productos de otra tienda).

3. **`test/full-flow-claims-concurrency.spec.ts` (15 pruebas):**
   - Ciclo completo de vida de pedido, pago con tarjeta simulada, despacho y tracking.
   - Restricción de reseñas: solo permitida si el sub-pedido está en estado `ENTREGADO`.
   - Apertura de reclamos y congelación automática de custodia en base de datos.
   - Mensajería multilateral en reclamos y dictamen de resolución con reembolso.
   - Restricción de apelación única (el segundo intento de apelación es rechazado con HTTP 409).
   - Concurrencia de stock: dos órdenes simultáneas compitiendo por stock = 1 (exactamente una triunfa y la otra falla con HTTP 400).
   - Idempotencia de pagos: cobros concurrentes con la misma clave no duplican transacciones.
   - Subida de archivos: rechazo de extensiones falsas, rechazo de discrepancias de magic bytes y rechazo de archivos > 5 MB.

4. **`test/order-state-machine.spec.ts` y `test/critical-business-rules.spec.ts` (30 pruebas):**
   - Integridad de las 13 transiciones legales de la máquina de estados y rechazo de transiciones ilegales.
   - Inmutabilidad de la auditoría y reglas de negocio para cancelación y expiración de pedidos.

---

## 4. Limitaciones Conocidas

1. **Simulación de Correo Electrónico:** No se cuenta con un servidor SMTP externo configurado. Las notificaciones por correo y los enlaces con token de recuperación de contraseña se escriben en los registros del servidor (`console.log`) con fines de prueba y demostración.
2. **Pasarela de Pagos Simulada:** El procesamiento de tarjetas de crédito utiliza tokens simulados (`tok_ok` para transacciones exitosas y `tok_fail` para rechazos) con número de tarjeta de muestra `4242`. No existe integración con pasarelas de pago reales (Stripe, Niubiz, MercadoPago).
3. **Ausencia de Autenticación de Dos Factores (2FA/MFA):** El sistema implementa autenticación robusta mediante contraseñas complejas con Argon2id y revocación de sesiones, pero no dispone de un segundo factor basado en TOTP (Google Authenticator) ni WebAuthn/FIDO2.
