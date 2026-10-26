# API Contract — Tienda Virtual Segura

Base URL: `/api/v1` | Content-Type: `application/json`  
Auth: Cookie `jwt` (HttpOnly, SameSite=Lax)  
Success format: `{ data: ... }` | List: `{ data: [...], meta: { page, pageSize, total } }`  
Error format: `{ error: { code, message, request_id } }`  
Money: always in **céntimos (Int)**. Enums in Spanish as in schema.prisma.

## Roles
- `PUBLIC` = sin auth
- `BUYER` = comprador autenticado  
- `SELLER` = vendedor con estado ACTIVE  
- `SUPPORT` = soporte
- `ADMIN` = administrador

---

## Auth & Users

| Method | Path | Rol | Body | Respuesta |
|--------|------|-----|------|-----------|
| POST | /auth/register | PUBLIC | `{email, password, fullName}` | `{ data: User }` |
| POST | /auth/login | PUBLIC | `{email, password}` | `{ data: User }` + Set-Cookie jwt |
| POST | /auth/logout | AUTH | - | `{ data: { ok: true } }` |
| GET | /auth/me | AUTH | - | `{ data: User }` |
| GET | /users/profile | AUTH | - | `{ data: UserProfile }` |
| PATCH | /users/profile | AUTH | `{fullName?}` | `{ data: UserProfile }` |
| GET | /users/addresses | AUTH | - | `{ data: Address[] }` |
| POST | /users/addresses | AUTH | `{label, line1, city, province, country?, isDefault?}` | `{ data: Address }` |
| PATCH | /users/addresses/:id | AUTH | `{label?, line1?, city?, province?, isDefault?}` | `{ data: Address }` |
| DELETE | /users/addresses/:id | AUTH | - | `{ data: { ok: true } }` |

## Sellers

| Method | Path | Rol | Body | Respuesta |
|--------|------|-----|------|-----------|
| POST | /sellers/apply | BUYER | `{storeName, description?}` | `{ data: Seller }` |
| GET | /sellers/me | SELLER/PENDING | - | `{ data: Seller }` |
| PATCH | /sellers/me | SELLER | `{storeName?, description?}` | `{ data: Seller }` |
| GET | /admin/sellers | ADMIN | `?status&page&pageSize` | lista paginada |
| PATCH | /admin/sellers/:id/approve | ADMIN | - | `{ data: Seller }` |
| PATCH | /admin/sellers/:id/reject | ADMIN | `{reason}` | `{ data: Seller }` |
| PATCH | /admin/sellers/:id/suspend | ADMIN | `{reason}` | `{ data: Seller }` |

## Catalog

| Method | Path | Rol | Body | Respuesta |
|--------|------|-----|------|-----------|
| GET | /categories | PUBLIC | - | `{ data: Category[] }` |
| GET | /products | PUBLIC | `?q&categoryId&minPrice&maxPrice&inStock&sort&page&pageSize` | lista paginada |
| GET | /products/:id | PUBLIC | - | `{ data: Product+variants+seller+avgRating }` |
| POST | /seller/products | SELLER | `{categoryId, title, description, variants: [{name, price, stock}]}` | `{ data: Product }` |
| GET | /seller/products | SELLER | `?status&page&pageSize` | lista paginada |
| GET | /seller/products/:id | SELLER | - | `{ data: Product }` |
| PATCH | /seller/products/:id | SELLER | `{categoryId?, title?, description?, status?}` | `{ data: Product }` |
| DELETE | /seller/products/:id | SELLER | - | `{ data: { ok: true } }` |
| POST | /seller/products/:id/images | SELLER | multipart/form-data file | `{ data: ProductImage }` |
| DELETE | /seller/products/:id/images/:imageId | SELLER | - | `{ data: { ok: true } }` |
| POST | /seller/products/:id/variants | SELLER | `{name, price, stock}` | `{ data: Variant }` |
| PATCH | /seller/products/:id/variants/:variantId | SELLER | `{name?, price?, stock?}` | `{ data: Variant }` |

## Cart

| Method | Path | Rol | Body | Respuesta |
|--------|------|-----|------|-----------|
| GET | /cart | BUYER | - | `{ data: CartWithSubtotals }` |
| POST | /cart/items | BUYER | `{variantId, quantity}` | `{ data: CartWithSubtotals }` |
| PATCH | /cart/items/:variantId | BUYER | `{quantity}` | `{ data: CartWithSubtotals }` |
| DELETE | /cart/items/:variantId | BUYER | - | `{ data: CartWithSubtotals }` |

## Orders

| Method | Path | Rol | Body | Respuesta |
|--------|------|-----|------|-----------|
| POST | /orders | BUYER | `{addressId}` + `Idempotency-Key` header | `{ data: Order }` |
| GET | /orders | BUYER | `?page&pageSize` | lista paginada |
| GET | /orders/:id | BUYER | - | `{ data: OrderDetail }` |
| POST | /orders/:id/cancel | BUYER | - | `{ data: SubOrder }` |
| POST | /orders/:id/confirm-delivery | BUYER | - | `{ data: SubOrder }` |
| GET | /seller/orders | SELLER | `?status&page&pageSize` | lista paginada |
| GET | /seller/orders/:subOrderId | SELLER | - | `{ data: SubOrderDetail }` |
| POST | /seller/orders/:subOrderId/confirm | SELLER | - | `{ data: SubOrder }` |
| POST | /seller/orders/:subOrderId/prepare | SELLER | - | `{ data: SubOrder }` |
| POST | /seller/orders/:subOrderId/dispatch | SELLER | `{carrier, trackingCode, estimatedDate}` | `{ data: SubOrder }` |
| POST | /shipments/:subOrderId/events | ADMIN/SUPPORT | `{type: EN_TRANSITO|EN_REPARTO|ENTREGADO, note?}` | `{ data: TrackingEvent }` |

## Payments

| Method | Path | Rol | Body | Respuesta |
|--------|------|-----|------|-----------|
| POST | /payments | BUYER | `{orderId, token}` + `Idempotency-Key` | `{ data: Payment }` |
| GET | /payments/:orderId | BUYER | - | `{ data: Payment }` |

## Tracking

| Method | Path | Rol | Body | Respuesta |
|--------|------|-----|------|-----------|
| GET | /orders/:id/timeline | AUTH | - | `{ data: TimelineEvent[] }` |

## Claims

| Method | Path | Rol | Body | Respuesta |
|--------|------|-----|------|-----------|
| POST | /claims | BUYER | `{subOrderId, reason}` + files | `{ data: Claim }` |
| GET | /claims | BUYER/SELLER/ADMIN | `?page&pageSize` | lista paginada |
| GET | /claims/:id | AUTH | - | `{ data: ClaimDetail }` |
| POST | /claims/:id/messages | AUTH | `{body}` | `{ data: ClaimMessage }` |
| POST | /claims/:id/resolve | ADMIN/SUPPORT | `{resolution, refundAmount?}` | `{ data: Claim }` |
| POST | /claims/:id/appeal | BUYER/SELLER | - | `{ data: Claim }` |

## Reviews

| Method | Path | Rol | Body | Respuesta |
|--------|------|-----|------|-----------|
| POST | /reviews | BUYER | `{orderItemId, stars, comment?}` | `{ data: Review }` |
| GET | /products/:id/reviews | PUBLIC | `?page&pageSize` | lista paginada |

## Notifications

| Method | Path | Rol | Body | Respuesta |
|--------|------|-----|------|-----------|
| GET | /notifications | AUTH | `?page&pageSize` | lista paginada |
| PATCH | /notifications/:id/read | AUTH | - | `{ data: Notification }` |
| PATCH | /notifications/read-all | AUTH | - | `{ data: { count: number } }` |

## Admin

| Method | Path | Rol | Descripción |
|--------|------|-----|-------------|
| GET | /admin/users | ADMIN | Lista usuarios con filtros |
| GET | /admin/audit | ADMIN | Auditoría con filtros |
| GET | /admin/claims | ADMIN/SUPPORT | Cola de reclamos |
| GET | /admin/reports/sales | ADMIN | Reporte ventas |
| GET | /admin/reports/orders | ADMIN | Pedidos por estado |
| GET | /admin/reports/claims | ADMIN | Reclamos |
| GET | /admin/reports/top-products | ADMIN | Top productos |
| GET | /admin/config | ADMIN | SystemConfig actual |
| PATCH | /admin/config | ADMIN | `{key, value}` | Actualizar config |
| POST | /admin/jobs/run | ADMIN | `{job}` | Ejecutar tarea programada |

## Static Files

| Path | Descripción |
|------|-------------|
| GET /uploads/:filename | Imagen de producto (servida con Express static, validación de extensión) |
