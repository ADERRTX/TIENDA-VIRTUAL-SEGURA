# Máquina de estados del sub-pedido

Fuente: docs/funcional.md §8 y docs/tecnico.md §22.2. El estado autoritativo vive en
`sub_pedido`. Este archivo es la fuente de verdad de las transiciones; el código debe coincidir.

## Estados
Normales: PENDIENTE_PAGO, PAGADO, CONFIRMADO, EN_PREPARACION, DESPACHADO, EN_TRANSITO,
EN_REPARTO, ENTREGADO, FINALIZADO.
Excepcionales: CANCELADO, RECLAMADO, DEVUELTO, REEMBOLSADO.
Finales: FINALIZADO, REEMBOLSADO.

## Actores
SISTEMA, COMPRADOR, VENDEDOR, TRANSPORTISTA (simulado), SOPORTE_ADMIN.

## Transiciones permitidas
| Desde | Hacia | Actor | Condición |
|---|---|---|---|
| PENDIENTE_PAGO | PAGADO | SISTEMA | Evento PagoAprobado |
| PENDIENTE_PAGO | CANCELADO | SISTEMA | Pago no confirmado en 30 min. Libera stock |
| PAGADO | CONFIRMADO | VENDEDOR | Confirma que tiene el producto |
| PAGADO | CANCELADO | COMPRADOR / SISTEMA | Antes del despacho; el sistema cancela si el vendedor no confirma en 48 h. Reembolso total |
| CONFIRMADO | EN_PREPARACION | VENDEDOR | Inicia la preparación |
| CONFIRMADO | CANCELADO | COMPRADOR / VENDEDOR | Antes del despacho; el vendedor solo por falta de stock. Reembolso total |
| EN_PREPARACION | CANCELADO | COMPRADOR / VENDEDOR | Antes del despacho; el vendedor solo por falta de stock. Reembolso total |
| EN_PREPARACION | DESPACHADO | VENDEDOR | Registra transportista, código de seguimiento y fecha estimada |
| DESPACHADO | EN_TRANSITO | TRANSPORTISTA | Hito de envío |
| EN_TRANSITO | EN_REPARTO | TRANSPORTISTA | Hito de envío |
| EN_TRANSITO | RECLAMADO | COMPRADOR | Vencido sin entrega (7 días). Custodia pasa a CONGELADO |
| EN_REPARTO | ENTREGADO | TRANSPORTISTA | Registro de entrega. Abre el plazo de reclamo (7 días) |
| EN_REPARTO | RECLAMADO | COMPRADOR | Vencido sin entrega (7 días). Custodia pasa a CONGELADO |
| ENTREGADO | FINALIZADO | COMPRADOR / SISTEMA | Confirmación del comprador o vencimiento del plazo de reclamo. Libera custodia |
| ENTREGADO | RECLAMADO | COMPRADOR | Reclamo dentro del plazo. Custodia pasa a CONGELADO |
| RECLAMADO | FINALIZADO | SOPORTE_ADMIN | Resolución SIN_FUNDAMENTO |
| RECLAMADO | DEVUELTO | SOPORTE_ADMIN | Resolución DEVOLUCION |
| RECLAMADO | REEMBOLSADO | SOPORTE_ADMIN | Resolución REEMBOLSO (total o parcial) |
| RECLAMADO | CONFIRMADO | SOPORTE_ADMIN | Resolución REEMPLAZO |
| DEVUELTO | REEMBOLSADO | SOPORTE_ADMIN / SISTEMA | Producto devuelto y revisado |
| CANCELADO | REEMBOLSADO | SISTEMA | Solo si hubo pago |

Cualquier transición que no figure aquí se rechaza con `ORDER_INVALID_TRANSITION` (HTTP 409).

## Decisiones implementadas

1. **Reclamo por "vencido sin entrega"**: Permitir desde `EN_TRANSITO` y `EN_REPARTO` con plazo de 7 días (mismo que reclamo tras entrega). El comprador puede darse cuenta el pedido nunca llegará y querer reclamar antes de marcar ENTREGADO.

2. **EN_PREPARACION → CANCELADO**: Permitido con reembolso total. El vendedor puede decidir no preparar o no tener stock a último minuto; el comprador puede cancelar. Cumple el funcional "antes del despacho".

3. **REEMPLAZO como resolución**: Vuelve el sub-pedido a estado `CONFIRMADO`. El reemplazo es un nuevo producto que debe prepararse y despacharse, reanudando el flujo normal.

## Estado derivado de la compra (pedido)
Se calcula a partir de los sub-pedidos; nunca se edita.
| Sub-pedidos | Estado de la compra |
|---|---|
| Todos PENDIENTE_PAGO | PENDIENTE_PAGO |
| Todos pagados y ninguno finalizado | PAGADO |
| Mezcla de estados avanzados | EN_CURSO |
| Alguno RECLAMADO | CON_RECLAMO |
| Todos FINALIZADO | FINALIZADO |
| Todos CANCELADO | CANCELADO |

`pedido.estado_pago`: SIN_PAGO, EN_PROCESO, PAGADO, REEMBOLSADO_PARCIAL, REEMBOLSADO_TOTAL.

## Plazos por defecto (config_sistema)
| Plazo | Valor |
|---|---|
| Pago del pedido pendiente (reserva de stock) | 30 min |
| Confirmación del vendedor tras el pago | 48 h |
| Despacho tras confirmar | 72 h |
| Reclamo tras la entrega | 7 días |
| Respuesta del vendedor a un reclamo | 72 h |
| Apelación | 3 días desde la resolución |
| Envío del producto devuelto | 7 días |