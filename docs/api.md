# Contrato de API — Tienda Virtual Segura (TVS)

- **Base URL:** `/api/v1`
- **Content-Type:** `application/json` (o `multipart/form-data` para subida de imágenes)
- **Autenticación:** Cookie `jwt` (`HttpOnly`, `SameSite=Lax`, `Secure` en producción)
- **Formato de Respuesta Exitosa:**
  - Individual: `{ "data": { ... } }`
  - Colección paginada: `{ "data": [ ... ], "meta": { "page": 1, "pageSize": 10, "total": 42 } }`
- **Formato de Error:**
  - `{ "error": { "code": "ERROR_CODE", "message": "Descripción clara del error", "request_id": "uuid-v4" } }`
- **Moneda:** Todos los montos monetarios se expresan en **céntimos enteros (Int)**. Ejemplo: S/. 50.00 = `5000`.
- **Enums:** En español, consistentes con `schema.prisma`.

---

## Roles y Niveles de Acceso
- `PUBLIC`: Acceso abierto sin autenticación previa.
- `BUYER`: Comprador autenticado (rol predeterminado al registrarse).
- `SELLER`: Vendedor verificado con estado `ACTIVE`.
- `SUPPORT`: Personal de soporte técnico y atención de disputas.
- `ADMIN`: Administrador general del marketplace.

---

## 1. Autenticación y Cuentas (`/auth`)

| Método | Ruta | Rol | Cuerpo (Request Body) | Respuesta Exitosa | Códigos de Error Comunes |
|---|---|---|---|---|---|
| **POST** | `/auth/register` | `PUBLIC` | `{ email, password, fullName }` | `{ data: User }` | `VALIDATION_ERROR`, `USER_ALREADY_EXISTS` |
| **POST** | `/auth/login` | `PUBLIC` | `{ email, password }` | `{ data: User }` + Set-Cookie `jwt` | `INVALID_CREDENTIALS`, `ACCOUNT_LOCKED` (423), `ACCOUNT_BLOCKED` (401) |
| **POST** | `/auth/change-password` | `AUTH` | `{ currentPassword, newPassword }` | `{ data: { ok: true } }` | `INVALID_CREDENTIALS`, `PASSWORD_TOO_SHORT`, `PASSWORD_MUST_BE_DIFFERENT`, `PASSWORD_COMPLEXITY_FAILED` |
| **POST** | `/auth/forgot-password` | `PUBLIC` | `{ email }` | `{ data: { ok: true } }` | `VALIDATION_ERROR` |
| **POST** | `/auth/reset-password` | `PUBLIC` | `{ token, newPassword }` | `{ data: { ok: true } }` | `TOKEN_INVALID_OR_EXPIRED`, `PASSWORD_COMPLEXITY_FAILED` |
| **POST** | `/auth/logout` | `AUTH` | - | `{ data: { ok: true } }` | `UNAUTHORIZED` |
| **GET** | `/auth/me` | `AUTH` | - | `{ data: User }` | `UNAUTHORIZED` |

---

## 2. Usuarios y Direcciones (`/users`)

| Método | Ruta | Rol | Cuerpo | Respuesta Exitosa | Códigos de Error |
|---|---|---|---|---|---|
| **GET** | `/users/profile` | `AUTH` | - | `{ data: UserProfile }` | `UNAUTHORIZED` |
| **PATCH** | `/users/profile` | `AUTH` | `{ fullName? }` | `{ data: UserProfile }` | `VALIDATION_ERROR` |
| **GET** | `/users/addresses` | `AUTH` | - | `{ data: Address[] }` | `UNAUTHORIZED` |
| **POST** | `/users/addresses` | `AUTH` | `{ label, line1, city, province, country?, isDefault? }` | `{ data: Address }` | `VALIDATION_ERROR` |
| **PATCH** | `/users/addresses/:id` | `AUTH` | `{ label?, line1?, city?, province?, isDefault? }` | `{ data: Address }` | `ADDRESS_NOT_FOUND` (IDOR check) |
| **DELETE** | `/users/addresses/:id` | `AUTH` | - | `{ data: { ok: true } }` | `ADDRESS_NOT_FOUND` (Borrado lógico) |

---

## 3. Vendedores (`/sellers` y `/admin/sellers`)

| Método | Ruta | Rol | Cuerpo | Respuesta Exitosa | Códigos de Error |
|---|---|---|---|---|---|
| **POST** | `/sellers/apply` | `BUYER` | `{ storeName, description? }` | `{ data: Seller }` | `ONLY_BUYERS_CAN_APPLY`, `STORE_NAME_TAKEN` |
| **GET** | `/sellers/me` | `SELLER` | - | `{ data: Seller }` | `SELLER_NOT_FOUND` |
| **PATCH** | `/sellers/me` | `SELLER` | `{ storeName?, description? }` | `{ data: Seller }` | `STORE_NAME_TAKEN` |
| **GET** | `/admin/sellers` | `ADMIN` | Query: `?status&page&pageSize` | `{ data: Seller[], meta }` | `FORBIDDEN` |
| **PATCH** | `/admin/sellers/:id/approve` | `ADMIN` | - | `{ data: Seller }` | `SELLER_NOT_FOUND`, `INVALID_TRANSITION` |
| **PATCH** | `/admin/sellers/:id/reject` | `ADMIN` | `{ reason }` | `{ data: Seller }` | `SELLER_NOT_FOUND`, `REASON_REQUIRED` |
| **PATCH** | `/admin/sellers/:id/suspend` | `ADMIN` | `{ reason }` | `{ data: Seller }` | `SELLER_NOT_FOUND`, `REASON_REQUIRED` |

---

## 4. Catálogo y Productos (`/products`, `/categories`, `/seller/products`)

| Método | Ruta | Rol | Cuerpo | Respuesta Exitosa | Códigos de Error |
|---|---|---|---|---|---|
| **GET** | `/categories` | `PUBLIC` | - | `{ data: Category[] }` | - |
| **GET** | `/products` | `PUBLIC` | Query: `?q&categoryId&minPrice&maxPrice&sort&page&pageSize` | `{ data: Product[], meta }` | - |
| **GET** | `/products/:id` | `PUBLIC` | - | `{ data: ProductDetail }` | `PRODUCT_NOT_FOUND` |
| **POST** | `/seller/products` | `SELLER` | `{ categoryId, title, description, variants }` | `{ data: Product }` | `CATEGORY_NOT_FOUND`, `VALIDATION_ERROR` |
| **GET** | `/seller/products` | `SELLER` | Query: `?status&page&pageSize` | `{ data: Product[], meta }` | - |
| **GET** | `/seller/products/:id` | `SELLER` | - | `{ data: Product }` | `PRODUCT_NOT_FOUND` (IDOR check) |
| **PATCH** | `/seller/products/:id` | `SELLER` | `{ categoryId?, title?, description?, status? }` | `{ data: Product }` | `PRODUCT_NOT_FOUND` (IDOR check) |
| **DELETE** | `/seller/products/:id` | `SELLER` | - | `{ data: { ok: true } }` | `PRODUCT_NOT_FOUND` (IDOR check) |
| **POST** | `/seller/products/:id/images` | `SELLER` | `multipart/form-data` (file) | `{ data: ProductImage }` | `INVALID_FILE_TYPE`, `INVALID_FILE_EXTENSION`, `FILE_TOO_LARGE` |
| **DELETE** | `/seller/products/:id/images/:imageId` | `SELLER` | - | `{ data: { ok: true } }` | `IMAGE_NOT_FOUND` (IDOR check) |
| **POST** | `/seller/products/:id/variants` | `SELLER` | `{ name, price, stock }` | `{ data: Variant }` | `PRODUCT_NOT_FOUND` (IDOR check) |
| **PATCH** | `/seller/products/:id/variants/:variantId` | `SELLER` | `{ name?, price?, stock? }` | `{ data: Variant }` | `VARIANT_NOT_FOUND` (IDOR check) |

---

## 5. Carrito de Compras (`/cart`)

| Método | Ruta | Rol | Cuerpo | Respuesta Exitosa | Códigos de Error |
|---|---|---|---|---|---|
| **GET** | `/cart` | `BUYER` | - | `{ data: CartGrouped }` | `UNAUTHORIZED` |
| **POST** | `/cart/items` | `BUYER` | `{ variantId, quantity }` | `{ data: CartGrouped }` | `VARIANT_NOT_FOUND`, `OUT_OF_STOCK` |
| **PATCH** | `/cart/items/:variantId` | `BUYER` | `{ quantity }` | `{ data: CartGrouped }` | `CART_ITEM_NOT_FOUND` |
| **DELETE** | `/cart/items/:variantId` | `BUYER` | - | `{ data: CartGrouped }` | `CART_ITEM_NOT_FOUND` |

---

## 6. Pedidos y Envíos (`/orders`, `/seller/orders`, `/shipments`)

| Método | Ruta | Rol | Cabecera / Cuerpo | Respuesta Exitosa | Códigos de Error |
|---|---|---|---|---|---|
| **POST** | `/orders` | `BUYER` | Header: `Idempotency-Key`<br>Body: `{ addressId }` | `{ data: Order }` | `CART_EMPTY`, `ADDRESS_DELETED`, `STOCK_INSUFFICIENT` |
| **GET** | `/orders` | `BUYER` | Query: `?page&pageSize` | `{ data: Order[], meta }` | `UNAUTHORIZED` |
| **GET** | `/orders/:id` | `BUYER` | - | `{ data: OrderDetail }` | `ORDER_NOT_FOUND` (IDOR check) |
| **POST** | `/orders/:id/cancel` | `BUYER` | - | `{ data: Order }` | `ORDER_CANNOT_BE_CANCELLED` |
| **POST** | `/orders/:id/confirm-delivery`| `BUYER` | - | `{ data: SubOrder }` | `CANNOT_CONFIRM_DELIVERY` |
| **GET** | `/seller/orders` | `SELLER` | Query: `?status&page&pageSize` | `{ data: SubOrder[], meta }` | `UNAUTHORIZED` |
| **GET** | `/seller/orders/:id` | `SELLER` | - | `{ data: SubOrderDetail }` | `ORDER_NOT_FOUND` (IDOR check) |
| **POST** | `/seller/orders/:id/confirm` | `SELLER` | - | `{ data: SubOrder }` | `INVALID_TRANSITION` |
| **POST** | `/seller/orders/:id/prepare` | `SELLER` | - | `{ data: SubOrder }` | `INVALID_TRANSITION` |
| **POST** | `/seller/orders/:id/dispatch`| `SELLER` | `{ carrier, trackingCode, estimatedDate }` | `{ data: SubOrder }` | `INVALID_TRANSITION`, `TRACKING_CODE_DUPLICATE` |
| **POST** | `/shipments/:id/events` | `ADMIN`, `SUPPORT` | `{ type, note? }` | `{ data: SubOrder }` | `SHIPMENT_NOT_FOUND`, `INVALID_TRANSITION` |

---

## 7. Pagos y Custodia (`/payments`)

| Método | Ruta | Rol | Cabecera / Cuerpo | Respuesta Exitosa | Códigos de Error |
|---|---|---|---|---|---|
| **POST** | `/payments` | `BUYER` | Header: `Idempotency-Key`<br>Body: `{ orderId, token, method }` | `{ data: Payment }` | `ORDER_NOT_FOUND`, `PAYMENT_EXPIRED`, `ORDER_ALREADY_PAID` |
| **GET** | `/payments/:orderId` | `BUYER` | - | `{ data: Payment }` | `ORDER_NOT_FOUND` (IDOR check) |

---

## 8. Reclamos y Disputas (`/claims`)

| Método | Ruta | Rol | Cuerpo | Respuesta Exitosa | Códigos de Error |
|---|---|---|---|---|---|
| **POST** | `/claims` | `BUYER` | `{ subOrderId, reason, evidence }` | `{ data: Claim }` | `CANNOT_OPEN_CLAIM`, `CLAIM_WINDOW_EXPIRED` |
| **GET** | `/claims` | `AUTH` | Query: `?page&pageSize` | `{ data: Claim[], meta }` | `UNAUTHORIZED` |
| **GET** | `/claims/:id` | `AUTH` | - | `{ data: ClaimDetail }` | `CLAIM_NOT_FOUND` (IDOR check) |
| **POST** | `/claims/:id/messages` | `AUTH` | `{ body }` | `{ data: ClaimMessage }` | `CLAIM_NOT_FOUND`, `CLAIM_IS_CLOSED` |
| **POST** | `/claims/:id/resolve` | `ADMIN`, `SUPPORT` | `{ resolution, notes?, refundAmount? }` | `{ data: Claim }` | `CLAIM_ALREADY_RESOLVED`, `REFUND_EXCEEDS_PAYMENT` |
| **POST** | `/claims/:id/appeal` | `BUYER`, `SELLER` | - | `{ data: Claim }` | `CLAIM_CANNOT_APPEAL`, `CLAIM_ALREADY_APPEALED` (409) |

---

## 9. Reseñas (`/reviews`)

| Método | Ruta | Rol | Cuerpo | Respuesta Exitosa | Códigos de Error |
|---|---|---|---|---|---|
| **POST** | `/reviews` | `BUYER` | `{ orderItemId, stars, comment? }` | `{ data: Review }` | `SUBORDER_NOT_DELIVERED` (Solo `ENTREGADO`), `REVIEW_ALREADY_EXISTS` (409) |
| **GET** | `/products/:id/reviews` | `PUBLIC` | Query: `?page&pageSize` | `{ data: Review[], meta }` | `PRODUCT_NOT_FOUND` |

---

## 10. Notificaciones (`/notifications`)

| Método | Ruta | Rol | Cuerpo | Respuesta Exitosa | Códigos de Error |
|---|---|---|---|---|---|
| **GET** | `/notifications` | `AUTH` | Query: `?page&pageSize` | `{ data: Notification[], meta }` | `UNAUTHORIZED` |
| **PATCH** | `/notifications/:id/read` | `AUTH` | - | `{ data: Notification }` | `NOTIFICATION_NOT_FOUND` (IDOR check) |
| **PATCH** | `/notifications/read-all` | `AUTH` | - | `{ data: { count: number } }` | `UNAUTHORIZED` |

---

## 11. Administración y Salud del Sistema (`/admin`, `/health`)

| Método | Ruta | Rol | Cuerpo | Respuesta Exitosa | Códigos de Error |
|---|---|---|---|---|---|
| **GET** | `/health` | `PUBLIC` | - | `{ data: { status: "ok", timestamp } }` | `503` si BD o disco degradado |
| **GET** | `/admin/users` | `ADMIN` | Query: `?role&status&search&page&pageSize` | `{ data: User[], meta }` | `FORBIDDEN` |
| **PATCH** | `/admin/users/:id/block` | `ADMIN` | `{ reason }` | `{ data: User }` | `CANNOT_BLOCK_SELF`, `CANNOT_BLOCK_ADMIN`, `REASON_REQUIRED` |
| **PATCH** | `/admin/users/:id/unblock` | `ADMIN` | `{ reason }` | `{ data: User }` | `USER_NOT_FOUND`, `REASON_REQUIRED` |
| **GET** | `/admin/audit` | `ADMIN` | Query: `?actorId&action&entity&page&pageSize` | `{ data: AuditLog[], meta }` | `FORBIDDEN` |
| **GET** | `/admin/reports/sales` | `ADMIN` | Query: `?from&to` | `{ data: ReportSales }` | `FORBIDDEN` |
| **GET** | `/admin/config` | `ADMIN` | - | `{ data: SystemConfig[] }` | `FORBIDDEN` |
| **PATCH** | `/admin/config` | `ADMIN` | `{ key, value }` | `{ data: SystemConfig }` | `VALIDATION_ERROR` |
| **POST** | `/admin/jobs/run` | `ADMIN` | `{ job }` | `{ data: { executed: true, job } }` | `UNKNOWN_JOB` |
