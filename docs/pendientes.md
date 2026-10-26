# Pendientes

## Base de datos
- Añadir tabla `IdempotencyKey` con migración nueva (requerida en Fase 2.5)
- Índice parcial `payment_approved_per_order` (un solo APROBADO por Order): actualmente el schema no lo tiene, se controla en la capa de servicio
- Índices de performance en `order(buyerId, createdAt)`, `sub_order(sellerId, status)`, `product(status, categoryId)` - anotar para optimización posterior

## Funcionalidades no implementadas aún
- Búsqueda full-text en productos (actualmente ILIKE)
- Email de notificación (simulado: solo notificación en BD)
- REEMPLAZO como acción tras resolución de reclamo (reusa flujo CONFIRMADO → despacho)

## Decisiones tomadas
- vendedor2@tvs.pe tiene rol BUYER hasta ser aprobado (PENDING solo es estado del Seller, no del User)
- Custodia: se crea por SubOrder al momento del pago aprobado
- Idempotency-Key: se guarda en tabla nueva que se añadirá con migración en Fase 2.5
- SubOrderStatus.PAGADO vs OrderStatus.PAGADO: son enums distintos para subpedido y pedido
