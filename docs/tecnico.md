TIENDA VIRTUAL SEGURA
Plan de negocio, concepto general y diseño funcional (versión 2, ampliada)
Proyecto académico de diseño funcional. No se implementará como negocio real.

Qué cambió en esta versión. Se conserva todo el contenido original. Se amplió con: funcionamiento detallado de cada módulo ("Cómo funciona"), flujo general integrado, actores con responsabilidades y límites, reglas de negocio agrupadas, y una sección nueva de diseño de la tienda basado en psicología humana (sección 23). Lo agregado en esta versión está marcado con (ampliado) o (nuevo).

1. Descripción general
Tienda Virtual Segura es una plataforma de comercio electrónico que conecta compradores y vendedores en un entorno digital controlado, seguro y trazable. Se inspira conceptualmente en Amazon, Mercado Libre y Temu: catálogo, registro de vendedores, carrito, pedidos, pagos, seguimiento de envíos, reputación, protección al comprador, devoluciones, reclamos, administración de vendedores, control de productos e historial de operaciones.

No es solo una página para vender: es un ecosistema basado en la confianza, donde la plataforma controla y registra las etapas de cada operación.

Concepto central. Integra en un solo sistema: publicación de productos, validación de usuarios, pago, seguimiento, entrega, reputación, protección del comprador, reclamos y resolución de problemas.

El comprador no debería preguntarse: ¿será confiable este vendedor? ¿me enviará el producto? ¿qué hago si no llega? ¿cómo recupero mi dinero? ¿dónde está mi pedido?
El vendedor no debería preguntarse: ¿realmente pagó? ¿cómo demuestro que envié? ¿cómo gestiono mis ventas? ¿cómo construyo reputación?
Idea fuerza: "Compra, vende y realiza todo el proceso comercial dentro de un mismo entorno, con seguridad, trazabilidad y mecanismos para resolver los problemas que puedan surgir."

Pilares de la experiencia (ampliado): confianza visible (el usuario siempre ve el estado de su operación), simplicidad (pocas decisiones por pantalla), protección para ambas partes y memoria completa de lo ocurrido (trazabilidad).

2. Alcance, supuestos y limitaciones (nuevo)
Incluye	Se simula o queda fuera
Diseño funcional completo: actores, módulos, estados, reglas, flujos	Pasarela de pago real (el pago se simula con estados)
Los 13 módulos descritos en la sección 7	Courier real (el envío se simula con estados)
Auditoría y roles	Aspectos legales, tributarios y contables reales
Indicadores y modelo de negocio conceptual	Facturación electrónica, lavado de dinero, contracargos
Diseño de experiencia de usuario (sección 23)	Programación, base de datos física, infraestructura
Supuestos: el proyecto es un ejercicio académico; los datos serán de prueba; los pagos y envíos serán simulados pero respetarán los estados y reglas definidos.

3. Problemática actual
Existe una diferencia entre "poder comprar por Internet" y "poder comprar por Internet con confianza". Tienda Virtual Segura resuelve la segunda.

3.1 Para compradores. Los productos se encuentran en redes sociales, marketplace, páginas web, publicidad, WhatsApp, enlaces compartidos y buscadores, pero eso no garantiza una operación segura. Riesgos:

Vendedores falsos: publican productos que no poseen y piden pago anticipado.
Productos diferentes: no coinciden con fotos, descripción, características, marca, modelo o cantidad.
Productos defectuosos: sin mecanismo claro para solicitar solución.
Productos no entregados: se paga y nunca llega.
Pagos inseguros: "deposítame directo a esta cuenta" saca la operación del sistema y dificulta demostrar qué ocurrió.
Falta de seguimiento: ¿lo recibió el vendedor? ¿lo preparó? ¿lo envió? ¿dónde está? ¿cuándo llega?
Falta de mecanismos de reclamo: dependencia de mensajes informales.
3.2 Para vendedores. Un sistema seguro no debe proteger solo al comprador. Riesgos: falsos comprobantes de pago, compradores fraudulentos, reclamos incorrectos, pedidos cancelados después del despacho, devoluciones en condiciones distintas, pérdidas durante la entrega, falta de herramientas administrativas, dificultad para controlar inventario, falta de estadísticas y dificultad para construir reputación.

3.3 Problema central. ¿Cómo permitir que una persona compre a diferentes vendedores reduciendo los riesgos de fraude, incumplimiento, pagos inseguros, productos incorrectos, problemas de entrega y conflictos posteriores?

3.4 Problema de experiencia (nuevo). Muchas tiendas en línea fallan también por diseño: pantallas saturadas de ofertas, botones que no se distinguen, menús confusos y procesos de compra largos. Eso genera abandono del carrito y desconfianza aun cuando el sistema sea técnicamente seguro. Por eso la sección 23 trata el diseño como parte de la seguridad percibida.

4. Solución
La plataforma funciona como intermediario tecnológico de confianza y centraliza y controla el ciclo completo de la operación.

Flujo normal: Registro → Publicación → Búsqueda → Compra → Pago → Confirmación → Preparación → Envío → Seguimiento → Entrega → Confirmación → Calificación

Flujo con problema: Problema → Reclamo → Presentación de evidencias → Revisión → Decisión → Devolución / Reemplazo / Solución

4.1 Flujo general integrado entre actores (ampliado)
Etapa	Comprador	Vendedor	Plataforma	Admin / Soporte
1. Alta	Se registra y verifica su cuenta	Solicita cuenta comercial y envía datos	Valida formato, crea cuentas, registra el evento	Admin verifica al vendedor y lo habilita
2. Publicación	Navega	Publica producto (borrador → activo)	Valida campos obligatorios, aplica reglas de catálogo	Soporte modera si hay reporte
3. Búsqueda	Busca, filtra, compara	Recibe visitas	Ordena resultados, muestra reputación	—
4. Compra	Agrega al carrito, crea pedido	Recibe aviso de pedido pendiente	Congela precios, reserva stock, divide por vendedor	—
5. Pago	Paga con método elegido	Espera confirmación	Valida transacción, retiene dinero (custodia simulada)	Revisa pagos sospechosos
6. Preparación	Ve "pago confirmado"	Confirma y prepara	Cambia estados, notifica	—
7. Envío	Ve código de seguimiento	Registra despacho y transportista	Actualiza línea de tiempo	—
8. Entrega	Confirma recepción	Ve entrega registrada	Abre plazo de reclamo	—
9. Cierre	Califica	Recibe calificación	Libera pago al vendedor y finaliza pedido	—
10. Postventa (si hay problema)	Presenta reclamo con evidencias	Responde en plazo	Congela la liberación del pago y conserva el historial	Soporte/Admin resuelve; una apelación permitida
Regla del flujo: ninguna etapa se salta; cada cambio de estado lo dispara una acción válida de un actor o un plazo vencido, y queda en el registro.

5. Objetivos
General. Desarrollar una plataforma de comercio electrónico que permita a compradores y vendedores realizar operaciones comerciales digitales de forma segura, organizada, transparente y trazable, reduciendo riesgos de fraude, incumplimiento, pagos inseguros, problemas de entrega y conflictos posteriores.

Específicos

Compradores: facilitar la búsqueda; mostrar información clara del producto; conocer al vendedor y su reputación; comprar dentro de la plataforma; registrar cada operación; hacer seguimiento; reclamar; gestionar devoluciones según condiciones; proteger la información de la cuenta.
Vendedores: publicar productos; administrar inventario; gestionar pedidos, ventas y envíos; obtener reputación; atender reclamos; consultar estadísticas; administrar su catálogo.
Administradores: controlar usuarios, vendedores, productos y categorías; supervisar transacciones; gestionar reclamos; detectar comportamientos sospechosos; suspender cuentas; generar reportes; supervisar el funcionamiento general.
De experiencia (nuevo): lograr una tienda limpia, fácil de entender y de usar sin instrucciones, donde el comprador complete su compra en pocos pasos y siempre sepa dónde está y qué sigue.
6. Actores y funciones
Actor	Funciones
Comprador	Registrarse, iniciar sesión, administrar perfil, buscar y filtrar productos, ver detalles, comparar información, agregar al carrito, crear pedidos, pagar, consultar pedidos, seguir envíos, confirmar recepción, calificar productos/vendedores, solicitar devolución, presentar reclamos, consultar historial
Vendedor (persona o empresa)	Registrar cuenta comercial, administrar su información, publicar y editar productos, administrar precios, stock, fotografías y categorías, recibir, confirmar y preparar pedidos, registrar despacho, consultar ventas e ingresos, responder reclamos, administrar devoluciones, consultar reputación
Administrador	Gestiona usuarios, vendedores, productos, categorías, pedidos, pagos, reclamos, devoluciones, reportes, seguridad y configuración. No debe modificar arbitrariamente las operaciones comerciales y sus acciones importantes quedan registradas
Soporte/Moderador (nuevo)	Atiende reclamos, modera publicaciones y reseñas, sin permisos de configuración ni de usuarios
6.1 Matriz de permisos (nuevo)
Acción	Comprador	Vendedor	Soporte	Admin
Comprar, pagar, reclamar, calificar	✔			
Publicar y editar productos propios		✔		
Gestionar pedidos y envíos propios		✔		
Responder reclamos		✔		
Revisar y resolver reclamos			✔	✔
Moderar productos y reseñas			✔	✔
Suspender cuentas, verificar vendedores				✔
Reportes y configuración				✔
6.2 Detalle de cada actor (ampliado)
Comprador

Objetivo: comprar con seguridad y saber siempre qué pasa con su pedido.
Pantallas principales: inicio, resultados, detalle de producto, carrito, pago, "Mis pedidos", seguimiento, reclamos, perfil.
Puede: todo lo listado arriba. No puede: publicar, ver datos de otros compradores, modificar un pedido ya pagado, calificar sin compra válida.
Necesita ver: estado del pedido en lenguaje simple, plazos, a quién acudir.
Vendedor

Objetivo: vender, cobrar y construir reputación con herramientas simples.
Pantallas principales: panel de ventas, mis productos, pedidos por atender, envíos, reclamos, estadísticas, perfil comercial.
Puede: administrar solo lo propio. No puede: cambiar precio de un pedido ya creado, marcar un pago como válido, borrar calificaciones, cobrar fuera de la plataforma, calificarse a sí mismo.
Necesita ver: una lista de "pendientes de hoy" (pedidos por preparar, reclamos por responder, stock bajo).
Administrador

Objetivo: mantener la plataforma segura y justa.
Pantallas principales: tablero de indicadores, solicitudes de vendedores, cola de moderación, reclamos, auditoría, reportes, configuración.
Límite clave: no edita montos, pagos ni historial; solo cambia estados mediante acciones permitidas, y cada acción se audita. Para acciones críticas (suspender, reembolsar manualmente) se recomienda confirmación adicional.
Soporte/Moderador

Objetivo: resolver reclamos y mantener limpio el contenido.
Pantallas principales: cola de reclamos con plazos, cola de reportes de productos y reseñas.
No puede: configurar el sistema, gestionar cuentas de usuarios ni verificar vendedores.
Actor del sistema (automático) (nuevo): tareas programadas que cancelan pedidos sin pago, liberan pagos al vencer el plazo de reclamo, envían recordatorios y marcan vencimientos. Sus acciones también quedan registradas.

7. Módulos
Cada módulo incluye su descripción original y, en (ampliado), cómo funciona: quién interviene, pasos, qué pasa en casos especiales y qué se registra.

M1. Gestión de usuarios
Registro, inicio y cierre de sesión, recuperación y cambio de contraseña, perfil, direcciones, historial, estado de cuenta. Regla: se requiere cuenta identificable antes de operaciones que generen transacción.

Cómo funciona (ampliado)

Registro: el usuario ingresa nombre, correo, teléfono y contraseña; la contraseña muestra indicador de fortaleza. Se envía un código de verificación al correo; la cuenta queda Activa al verificarlo.
Inicio de sesión: correo + contraseña. Tras varios intentos fallidos, la cuenta se bloquea temporalmente y se notifica al dueño.
Recuperación: enlace temporal al correo; tras el cambio se cierran las demás sesiones.
Perfil y direcciones: el usuario guarda varias direcciones y marca una principal. Los cambios sensibles (correo, contraseña) piden reconfirmar identidad.
Navegar sin cuenta: se permite ver el catálogo (invitado), pero se pide cuenta al pagar. Así se reduce la fricción sin romper la regla de identificación.
Estados de cuenta: Pendiente de verificación, Activa, Bloqueada temporalmente, Suspendida, Cerrada.
Se registra: altas, inicios, cambios de datos, bloqueos.
M2. Gestión de vendedores (fundamental para la seguridad)
Flujo: Solicitud de registro → Registro de información → Validación → Cuenta de vendedor → PENDIENTE → VERIFICADO → HABILITADO PARA VENDER. Estados: Pendiente, Verificado, Activo, Suspendido, Bloqueado, Inactivo. Cuando un vendedor se registra, el administrador verifica sus datos antes de habilitarlo.

Cómo funciona (ampliado)

Un usuario ya registrado pulsa "Quiero vender" y elige persona o empresa.
Completa datos comerciales (nombre de tienda, documento, contacto, dirección de despacho, cuenta para cobros simulada).
Queda Pendiente; ve un mensaje claro: "Estamos revisando tus datos, te avisaremos".
El administrador revisa y decide: aprobar (→ Verificado → Activo), pedir correcciones o rechazar con motivo.
Un vendedor Activo puede publicar. Para vender activa la verificación en dos pasos.
Suspendido (por incumplimientos): no publica ni vende nuevo, pero resuelve pedidos pendientes. Bloqueado: caso grave, sin acceso operativo. Inactivo: sin actividad prolongada o cierre voluntario.
Vendedores nuevos pueden tener límites iniciales (ej. cantidad de productos o ventas) que se levantan al construir reputación.
Se registra: solicitud, decisión, motivo, quién decidió y cuándo.
M3. Catálogo de productos (núcleo comercial)
Cada producto tiene: ID, nombre, descripción, categoría, precio, stock, fotografías, marca, características, vendedor, estado y fecha de publicación. Estados: BORRADOR, ACTIVO, AGOTADO, SUSPENDIDO, INACTIVO. Regla: un producto agotado no genera compra normal. Nuevo: soporte de variantes (talla, color, modelo).

Cómo funciona (ampliado)

El vendedor crea el producto en un formulario por pasos (datos básicos → fotos → precio y stock → variantes → vista previa). Puede guardarlo como Borrador.
Al publicar, el sistema valida: categoría obligatoria, mínimo de fotos, precio mayor que cero, descripción suficiente.
Activo: visible y comprable. Agotado: stock 0 (se muestra, pero sin botón de compra; opción "Avisarme cuando vuelva"). Suspendido: retirado por moderación. Inactivo: pausado por el vendedor.
Cada variante tiene su propio stock y, si aplica, su precio.
Los cambios de precio quedan en un historial; no alteran pedidos ya creados.
Se pueden reportar publicaciones engañosas; Soporte revisa y puede suspender.
Se registra: creación, ediciones relevantes, cambios de precio y stock, suspensiones.
M4. Búsqueda y descubrimiento
Buscar por nombre; filtrar por categoría, precio, disponibilidad y vendedor; ordenar resultados; consultar detalles. Ejemplo: "audífonos" → Electrónica → S/ 50–S/ 200 → Disponible → Resultados.

Cómo funciona (ampliado)

La barra de búsqueda es siempre visible; ofrece sugerencias mientras se escribe y tolera errores simples de escritura.
Los resultados se muestran en tarjetas con foto, nombre, precio, calificación y vendedor.
Filtros (lateral en escritorio, panel desplegable en celular): categoría, rango de precio, disponibilidad, vendedor, calificación mínima, envío.
Orden: relevancia, menor precio, mayor precio, mejor calificados, más recientes.
Sin resultados: el sistema no deja la pantalla vacía; sugiere búsquedas parecidas o categorías.
Las publicaciones destacadas se marcan claramente como "Destacado"; nunca se mezclan sin etiqueta.
Detalle de producto: galería, precio, variantes, stock, vendedor con reputación, condiciones de envío y devolución, reseñas de compras reales.
M5. Carrito de compras
Permite seleccionar productos antes del pedido (ej.: A S/50 + B S/80 + C S/30 = subtotal S/160 + envío S/15 = total S/175). Regla: el precio mostrado queda registrado en el pedido porque el vendedor podría cambiarlo después. Nuevo: si el carrito tiene varios vendedores, se divide en un sub-pedido por vendedor.

Cómo funciona (ampliado)

"Agregar al carrito" muestra una confirmación breve y actualiza el contador del icono del carrito, sin sacar al usuario de la página.
En el carrito se puede cambiar cantidad, quitar, guardar para después, y ver el resumen (subtotal, envío, total) siempre visible.
El carrito agrupa por vendedor y muestra el envío de cada uno.
Si el precio o el stock cambió desde que se agregó, el sistema avisa antes de pagar, nunca después.
El carrito se conserva entre sesiones para usuarios con cuenta.
El stock no se reserva en el carrito; se reserva por un tiempo corto cuando se crea el pedido.
M6. Pedidos
El pedido es la intención formal de compra. Almacena: comprador, productos, cantidades, precio unitario, subtotal, costo de envío, total, dirección de entrega, estado, fecha, información de pago e información de envío.

Cómo funciona (ampliado)

Desde el carrito, el comprador pasa a Finalizar compra en 3 pasos: dirección → envío → pago y revisión.
En la revisión ve todo el detalle y confirma. Recién ahí se crea el pedido en PENDIENTE DE PAGO, con precios congelados y stock reservado por un plazo corto.
Si el pago no se confirma en ese plazo, el pedido pasa a CANCELADO y el stock se libera.
Un carrito con varios vendedores genera sub-pedidos, cada uno con su propio estado, seguimiento y reclamo, bajo un mismo número de compra.
Un pedido pagado no se edita; solo se cancela (antes del despacho) o se reclama (después).
Se registra: cada cambio de estado con fecha, actor y motivo.
M7. Pagos (punto más sensible)
Evita depender de comprobantes por WhatsApp. Flujo: Comprador confirma pedido → selecciona método de pago → pago → validación → transacción registrada → PEDIDO PAGADO. Registra: identificador de transacción, monto, fecha, estado, pedido asociado y resultado. Regla fundamental: una orden no pasa a preparación hasta que el sistema confirme el estado válido del pago; la plataforma confía en el estado de la transacción, no en una captura de pantalla. Nuevo: el dinero queda retenido por la plataforma (modelo de custodia, simulado) hasta la entrega y luego se libera al vendedor; el pago se libera automáticamente si el comprador no reclama dentro del plazo definido.

Cómo funciona (ampliado)

El comprador elige método (tarjeta, billetera digital, transferencia; todos simulados). Se muestra el monto exacto y el vendedor.
Estados de la transacción: Iniciada → En validación → Aprobada / Rechazada / Expirada.
Si es Aprobada, el pedido pasa a PAGADO y el vendedor recibe aviso. Si es Rechazada, se explica el motivo en lenguaje simple y se permite reintentar o cambiar de método sin perder el pedido.
El dinero queda en custodia. Se libera al vendedor cuando el pedido pasa a FINALIZADO.
Si hay reclamo, la liberación se congela hasta la resolución.
Reembolsos: siempre ligados a una transacción existente y nunca mayores a lo pagado; pueden ser totales o parciales.
Los datos sensibles de pago nunca se muestran completos (solo últimos dígitos).
Se registra: cada cambio de estado de la transacción, intentos y resultados.
M8. Envíos
Pedido pagado → vendedor prepara → despacho → transportista → tránsito → entrega. Registra: código de seguimiento, transportista, fecha de despacho, fecha estimada, fecha de entrega y estado.

Cómo funciona (ampliado)

Con el pedido pagado, el vendedor lo confirma (acepta que tiene el producto) y pasa a EN PREPARACIÓN. Si no confirma en el plazo, el pedido se cancela y se reembolsa, con efecto en su reputación.
Al despachar registra transportista, código de seguimiento y fecha estimada; el estado pasa a DESPACHADO.
Los estados de tránsito, reparto y entrega los actualiza el transportista simulado (o el vendedor, en la simulación).
Entrega fallida: se registra el intento, se reprograma o el producto retorna; el comprador es notificado en cada caso.
Se registra: fechas de cada hito, quién lo registró y evidencias (por ejemplo, foto o constancia de entrega).
M9. Seguimiento
El comprador responde "¿dónde está mi pedido?" con una línea de tiempo, por ejemplo: Pedido #000152 ✓ Pago confirmado ✓ Pedido confirmado ✓ Preparando ✓ Despachado ✓ En tránsito ○ En reparto ○ Entregado. Genera trazabilidad.

Cómo funciona (ampliado)

En "Mis pedidos" cada pedido muestra su estado actual con color e icono, y el siguiente paso esperado.
Al abrirlo, la línea de tiempo muestra hitos completados, el actual resaltado y los pendientes atenuados, con fecha y hora.
Muestra fecha estimada de entrega y datos del transportista.
Cada cambio genera una notificación; el comprador no necesita revisar manualmente.
Desde el mismo detalle aparecen las acciones válidas según el estado: Cancelar (antes de despacho), Confirmar recepción, Reclamar.
M10. Reputación
Se muestra, por ejemplo: Vendedor "Tecnología J&J", calificación 4.8/5, 1,250 ventas, 96% de entregas completadas. Debe basarse en operaciones reales, no en datos modificables por el vendedor. Regla: solo se evalúa a un vendedor mediante una compra válida, lo que evita opiniones falsas.

Cómo funciona (ampliado)

Tras la entrega, se invita al comprador a calificar (estrellas + comentario opcional) producto y vendedor.
Solo puede calificar quien compró; una calificación por compra; se puede editar dentro de un plazo corto.
La reputación se calcula con calificaciones, % de entregas completas, tiempo de despacho, tasa de reclamos y respuesta a reclamos.
Los vendedores pueden responder a un comentario, pero no borrarlo ni editarlo. Soporte solo retira reseñas que incumplan normas (insultos, datos personales).
Los vendedores nuevos muestran "Vendedor nuevo" en lugar de una nota vacía.
M11. Reclamos
Motivos: no recibí el producto, recibí un producto diferente, producto dañado, producto incompleto, problema con el pedido, otro. Flujo: Comprador presenta reclamo → adjunta evidencia → vendedor responde → revisión → resolución. Resoluciones: sin fundamento (cerrar caso), reemplazo (nuevo producto), devolución (producto retorna), reembolso (se devuelve el dinero). Nuevo: plazos máximos de respuesta, y posibilidad de apelar la decisión una vez.

Cómo funciona (ampliado)

Desde el pedido entregado (o vencido sin entrega), el comprador pulsa Reclamar, elige motivo, describe y adjunta evidencia (fotos, video).
El pedido pasa a RECLAMADO y el pago queda congelado.
El vendedor es notificado y tiene un plazo para responder con su versión y evidencia (por ejemplo, constancia de entrega). Si no responde, el caso avanza.
Soporte/Admin revisa lo registrado (pedido, pago, envío, mensajes, evidencias) y resuelve.
Resoluciones: sin fundamento, reemplazo, devolución o reembolso (total o parcial).
Cada parte puede apelar una sola vez; la apelación la revisa otro revisor.
Todo el caso queda con línea de tiempo; ambas partes ven el mismo historial.
Los reclamos infundados repetidos afectan la cuenta del comprador, igual que los incumplimientos repetidos afectan al vendedor.
M12. Devoluciones
Operación controlada: no se elimina la venta. Historial: Venta → Reclamo → Devolución aprobada → Producto devuelto → Revisión → Reembolso. Nuevo: política que indica quién asume el envío de retorno y en qué condiciones se acepta el producto.

Cómo funciona (ampliado)

Se genera cuando un reclamo se resuelve con devolución (o por política de arrepentimiento si se define).
El comprador recibe instrucciones y un código de retorno; debe enviar dentro de un plazo.
Quién paga el retorno: el vendedor si el producto fue erróneo o defectuoso; el comprador si es por cambio de opinión (política configurable).
El vendedor recibe y revisa el producto: si cumple condiciones, se aprueba el reembolso; si no, abre una discrepancia que revisa Soporte.
El reembolso se ejecuta sobre la transacción original. Estados: Aprobada → Producto en retorno → Recibido → Reembolsado / Rechazada.
El pedido original no se borra; pasa a DEVUELTO y luego REEMBOLSADO.
M13. Seguridad (transversal, no aislada)
Presente en registro, inicio de sesión, pagos, pedidos, datos personales, administración, reclamos y devoluciones. Medidas: contraseñas almacenadas de forma segura, control de sesiones, roles y permisos, validación de información, protección contra accesos no autorizados, registro de actividades, control de intentos de acceso, validación de operaciones, protección de información sensible. Nuevo: verificación en dos pasos para vendedores y administradores, y alertas por comportamientos sospechosos.

Cómo funciona (ampliado)

Antes de cada acción el sistema verifica: ¿hay sesión?, ¿el rol tiene permiso?, ¿el recurso pertenece al usuario?, ¿el estado actual permite la acción?
Sesiones: vencen por inactividad y se pueden cerrar desde otros dispositivos.
Alertas sospechosas (ejemplos): muchos intentos de acceso, varios pagos rechazados seguidos, cambio de datos de cobro, cuenta nueva con muchos pedidos grandes, vendedor con reclamos repetidos. Generan aviso a Soporte/Admin, y pueden pedir verificación adicional.
Privacidad: cada usuario ve solo lo suyo; el vendedor ve del comprador solo lo necesario para entregar.
Mensajes de error seguros: no revelan si un correo existe o no.
Seguridad visible: el usuario ve señales de protección (sección 23.8) sin saturar la pantalla.
7.1 Módulos de apoyo (nuevos)
Mensajería interna comprador–vendedor, con registro, para que la comunicación no salga del sistema. Cómo funciona: se abre desde el producto o el pedido; detecta y advierte si se intenta compartir teléfonos, enlaces de pago o cuentas bancarias ("Para tu seguridad, pagos y reclamos solo dentro de la plataforma"); los mensajes sirven como evidencia en reclamos.
Notificaciones: cambios de estado del pedido, respuesta a reclamos, pago confirmado. Cómo funciona: aparecen en una campana con contador y en el correo; se agrupan para no saturar; el usuario elige cuáles recibir (las críticas, como pago o seguridad, no se pueden apagar).
Administración y reportes: panel de indicadores (sección 17). Cómo funciona: resume lo que requiere acción hoy (vendedores por aprobar, reclamos por vencer, alertas) antes que las estadísticas.
8. Estados del pedido
Flujo normal: PENDIENTE DE PAGO → PAGADO → CONFIRMADO → EN PREPARACIÓN → DESPACHADO → EN TRÁNSITO → EN REPARTO → ENTREGADO → FINALIZADO

Excepcionales: CANCELADO, RECLAMADO, DEVUELTO, REEMBOLSADO.

Nuevo, transiciones y plazos:

Desde	Hacia	Condición
Pendiente de pago	Cancelado	Pago no confirmado en el plazo definido
Pagado / Confirmado	Cancelado	Cancelación antes del despacho (reembolso total)
Entregado	Finalizado	Confirmación del comprador o vencimiento del plazo de reclamo
Entregado	Reclamado	Reclamo dentro del plazo
Reclamado	Devuelto / Reembolsado	Según la resolución
Ampliado — quién dispara cada transición:

Transición	La dispara
Pendiente de pago → Pagado	Sistema (transacción aprobada)
Pagado → Confirmado	Vendedor
Confirmado → En preparación → Despachado	Vendedor
Despachado → En tránsito → En reparto → Entregado	Transportista (simulado)
Entregado → Finalizado	Comprador o sistema (vence el plazo)
Entregado → Reclamado	Comprador
Reclamado → Devuelto / Reembolsado	Soporte/Admin (resolución)
Cualquiera permitido → Cancelado	Comprador (antes del despacho), vendedor (sin stock) o sistema (plazos)
Los estados se muestran al usuario con nombres simples (ej. "Estamos preparando tu pedido") y un color por tipo: avance, espera, problema, finalizado.

9. Reglas de negocio
Cuenta: el usuario debe tener cuenta válida para operaciones que requieran identificación.
Vendedor: solo un vendedor habilitado puede publicar productos.
Producto: todo producto pertenece a una categoría y a un vendedor.
Stock: no se compra más que el stock disponible.
Precio: el precio del pedido queda registrado aunque el vendedor lo cambie después.
Pago: un pedido no está pagado por declaración del usuario; requiere confirmación válida de la transacción.
Pedido: cada pedido tiene un comprador y uno o más productos.
Seguimiento: el pedido avanza por estados definidos y no cambia arbitrariamente.
Entrega: un pedido no finaliza antes de existir registro de entrega o confirmación definida por las reglas.
Reputación: solo una compra válida genera una evaluación.
Reclamos: solo se reclama sobre operaciones realizadas dentro de la plataforma.
Evidencia: los reclamos se asocian con evidencias y eventos de la operación.
Devolución: relacionada con un pedido y un motivo registrado.
Reembolso: asociado a una transacción existente y sin superar el importe de la operación.
Auditoría: las operaciones administrativas sensibles quedan registradas.
(nueva) Plazos: cada etapa (despacho, entrega, reclamo, respuesta del vendedor) tiene un plazo máximo definido.
(nueva) Suspensión: una cuenta suspendida no puede publicar ni vender, pero conserva sus operaciones pendientes hasta resolverlas.
Reglas adicionales (ampliado)

Comunicación: comunicación y acuerdos comerciales deben darse dentro de la plataforma para valer como evidencia.
Custodia: el dinero no se libera al vendedor hasta que el pedido finalice sin reclamos pendientes.
Autocompra: un vendedor no puede comprar ni calificar sus propios productos.
Inmutabilidad: pagos, estados y calificaciones no se editan ni se borran; se corrigen con un nuevo registro que referencia al anterior.
Cancelación: antes del despacho se cancela con reembolso total; después, solo vía reclamo o devolución.
Reclamo único: un pedido admite un reclamo abierto a la vez por producto y una apelación por parte.
Variantes: el stock se controla por variante, no solo por producto.
Roles separados: quien resuelve un reclamo no puede ser parte del mismo (ej. un vendedor-comprador); una apelación la revisa otra persona.
Mínimo necesario: cada rol accede únicamente a la información necesaria para su función.
Mensajes sospechosos: intentos de llevar la operación fuera de la plataforma se advierten y registran.
Clasificación de las reglas (ampliado): Identidad (1, 2, 20, 25) · Catálogo (3, 4, 24) · Dinero (5, 6, 14, 19, 21) · Pedido y entrega (7, 8, 9, 16, 22) · Postventa (11, 12, 13, 23) · Confianza y control (10, 15, 17, 18, 26, 27).

10. Registro de auditoría
Se guardan las acciones relevantes. Ejemplos:

Usuario vendedor_25 modificó el precio del producto Laptop XYZ de S/ 2500 a S/ 2300 (03/10/2026).
Administrador suspendió a un vendedor por incumplimiento de políticas (03/10/2026).
Permite investigar posteriormente qué ocurrió.

Ampliado: cada registro guarda quién (usuario y rol), qué (acción), sobre qué (pedido, producto, cuenta), valor anterior y nuevo, cuándo y motivo si aplica. Los registros no se pueden editar ni borrar. Se consultan con filtros por fecha, usuario, tipo de acción y entidad.

11. Principios del sistema
11.1 No sacar la operación fuera del sistema. Contacto → Producto → Pedido → Pago → Envío → Reclamo → Solución, todo dentro de la plataforma. Si el pago o el reclamo ocurren por WhatsApp, la trazabilidad se fragmenta y la plataforma pierde capacidad de verificar lo sucedido.

11.2 Protección para ambas partes. Seguridad no significa favorecer al comprador.

Comprador: fraude, productos inexistentes, no recibidos o incorrectos, problemas de pago.
Vendedor: falsos pagos, reclamos sin fundamento, manipulación de pedidos, operaciones fuera del sistema, disputas sin evidencia.
La plataforma trabaja con registros + estados + evidencias + reglas, no solo con declaraciones de usuarios.

11.3 Modelo de confianza. Tres pilares: Identidad (quién vende), Transacción (qué se pagó) y Trazabilidad (qué ocurrió), que dan Protección y generan Confianza. La confianza se construye con información verificable de cada operación.

11.4 Simplicidad como principio (nuevo). Una plataforma segura pero difícil de usar no se usa. Cada pantalla tiene una acción principal clara, y la complejidad (reglas, plazos, estados) se muestra de forma progresiva, solo cuando el usuario la necesita.

12. Arquitectura funcional general
Actores: Comprador, Vendedor, Administrador (y Soporte).
Plataforma: Catálogo (productos, categorías, búsqueda), Pedidos (pagos, envíos, seguimiento), Usuarios (compradores, vendedores).
Seguridad: validación, auditoría, permisos.
Postventa: reclamos y devoluciones.
Resultado: reputación.
Ampliado — capas: Experiencia (tienda del comprador, panel del vendedor, panel de administración) → Operación (catálogo, carrito, pedidos, pagos, envíos, postventa) → Control (seguridad, permisos, auditoría, notificaciones) → Datos (usuarios, productos, pedidos, transacciones, evidencias, registros).

13. Flujos completos
13.1 Compra de una laptop.

Registro. 2. Búsqueda "Laptop". 3. Comparación (precio, características, stock, vendedor, reputación, condiciones). 4. Carrito. 5. Pedido (producto, cantidad, dirección, método de pago). 6. Pago. 7. Validación de la transacción. 8. Preparación por el vendedor. 9. Despacho al transportista. 10. Seguimiento. 11. Entrega. 12. Confirmación de la entrega. 13. Calificación. 14. Finalización según las reglas.
13.2 Si algo sale mal (llega una laptop diferente): Pedido → Entregado → Comprador detecta problema → Reclamo → Evidencia → Vendedor responde → Revisión → Resolución. El sistema conserva qué se compró, cuánto costó, quién vendió y compró, cuándo se compró, pagó, envió y entregó, qué debía entregarse, qué reclamó el comprador, qué respondió el vendedor y cómo terminó el caso. Eso es trazabilidad.

13.3 Alta y primera venta de un vendedor (nuevo). Usuario se registra → "Quiero vender" → envía datos → Pendiente → Admin verifica → Activo → crea producto (borrador → activo) → recibe pedido pagado → confirma → prepara → despacha con código → entrega → pago liberado al finalizar → recibe calificación.

13.4 Cancelación antes del despacho (nuevo). Comprador pulsa Cancelar en un pedido Pagado/Confirmado → el sistema verifica que no esté despachado → estado CANCELADO → reembolso total sobre la transacción → stock liberado → vendedor notificado → registro de auditoría.

13.5 Pedido con varios vendedores (nuevo). Carrito con productos de A y B → un solo pago → se generan dos sub-pedidos → cada vendedor prepara y despacha por separado → el comprador ve dos líneas de tiempo bajo una misma compra → puede reclamar solo sobre el sub-pedido afectado.

13.6 Vendedor no responde un reclamo (nuevo). Reclamo abierto → vence el plazo sin respuesta → el caso pasa a revisión con la evidencia del comprador → resolución a su favor si está sustentado → incidente registrado en la reputación del vendedor.

14. Requisitos (nuevo, resumen)
Funcionales. RF-01 Registro e inicio de sesión · RF-02 Verificación y habilitación de vendedores · RF-03 Gestión de productos y stock · RF-04 Búsqueda con filtros · RF-05 Carrito · RF-06 Creación de pedidos con precio congelado · RF-07 Pago con confirmación de transacción · RF-08 Gestión de envíos y seguimiento · RF-09 Calificaciones ligadas a compras válidas · RF-10 Reclamos con evidencias · RF-11 Devoluciones y reembolsos · RF-12 Auditoría de acciones sensibles · RF-13 Panel de administración y reportes · RF-14 Mensajería y notificaciones.

Agregados: RF-15 Variantes de producto · RF-16 División de carrito por vendedor · RF-17 Custodia y liberación de pagos · RF-18 Apelación de reclamos · RF-19 Verificación en dos pasos · RF-20 Alertas de comportamiento sospechoso · RF-21 Lista de deseos y "avisarme cuando haya stock".

No funcionales. Seguridad (roles, contraseñas protegidas, control de sesiones) · Trazabilidad (todo evento queda registrado) · Disponibilidad y rendimiento razonables · Usabilidad y diseño adaptable a celular · Integridad de datos (no alterar historial de precios, pagos ni estados) · Privacidad de datos personales.

Agregados: Accesibilidad (contraste suficiente, navegación con teclado, textos alternativos, tamaños legibles) · Rendimiento percibido (páginas principales cargan rápido, imágenes optimizadas, indicadores de carga) · Consistencia visual (mismo estilo y componentes en toda la plataforma, sección 23) · Idioma y formato local (español, moneda S/, fechas día/mes/año).

15. Modelo de negocio
Comisión por venta: ej. venta S/ 100, comisión 5% → ingreso S/ 5 (el porcentaje dependerá del modelo comercial).
Publicaciones destacadas: mayor visibilidad pagada, claramente diferenciada de cualquier manipulación de calificaciones o información.
Planes para vendedores: Básico (catálogo, productos, pedidos, ventas), Profesional (estadísticas, herramientas comerciales, mayor capacidad), Empresarial (reportes avanzados, integraciones, gestión avanzada).
Ampliado: el ingreso se calcula y registra al finalizar el pedido, no al pagar, para no cobrar comisión por ventas canceladas o reembolsadas. En un reembolso total no se cobra comisión; en uno parcial se ajusta proporcionalmente.

16. Servicios futuros
Sistema logístico propio, integración con transportistas, facturación, publicidad, almacenamiento, herramientas empresariales, analítica de ventas, integración con otros comercios, aplicación móvil y programa de fidelización.

17. Indicadores
Comerciales: usuarios registrados, vendedores activos, productos publicados, pedidos, ventas, ingresos, ticket promedio.
Seguridad: reclamos, operaciones canceladas, intentos fraudulentos detectados, cuentas suspendidas, operaciones con problemas.
Experiencia: tiempo promedio de entrega, calificaciones, devoluciones, reclamos resueltos, tiempo de resolución.
Nuevo, metas de ejemplo: ≥ 95% de pedidos entregados · reclamos < 5% de los pedidos · resolución de reclamos en ≤ 5 días.

Ampliado — indicadores de diseño y conversión: tasa de abandono del carrito, pasos y tiempo promedio para completar una compra, porcentaje de búsquedas sin resultados, tasa de clics en el botón principal de cada pantalla, errores de formulario por pantalla, satisfacción (pregunta corta al terminar la compra).

18. Propuesta de valor
Comprador: comprar con más información, control y protección: productos, vendedores identificables, reputación, pagos, seguimiento, reclamos y devoluciones.
Vendedor: vender desde una plataforma que centraliza sus operaciones: catálogo digital, clientes, pedidos, pagos, inventario, seguimiento, reputación y estadísticas.
Plataforma: un mercado digital donde la confianza es parte de la infraestructura del negocio.
Ventaja conceptual. No se presenta como "una tienda online" sino como "una plataforma segura de intermediación comercial digital": identifica → publica → conecta → cobra → registra → envía → rastrea → protege → resuelve → genera reputación.

19. Glosario (nuevo)
Pedido: registro formal de una compra, con productos, precios y estado.
Transacción: registro del pago asociado a un pedido.
Trazabilidad: capacidad de reconstruir todo lo ocurrido en una operación.
Reclamo: solicitud del comprador por un problema posterior a la compra.
Reembolso: devolución del dinero, total o parcial, sin superar lo pagado.
Custodia: retención del pago por la plataforma hasta la entrega.
Auditoría: registro de acciones sensibles de usuarios y administradores.
Finalizado: pedido entregado y sin reclamos pendientes.
Agregados: Sub-pedido (parte de una compra correspondiente a un solo vendedor) · Variante (versión de un producto: talla, color, modelo) · Evidencia (fotos, videos, mensajes o registros que respaldan un reclamo) · Apelación (segunda revisión de una decisión, una sola vez) · Borrador (producto guardado sin publicar) · Jerarquía visual (orden de importancia de los elementos de una pantalla) · Llamada a la acción (CTA) (botón principal que guía al usuario al siguiente paso).

20. Resumen ejecutivo
Problema. El comercio electrónico permite comprar rápido, pero hay riesgos de fraude, vendedores no confiables, pagos inseguros, productos distintos a lo ofrecido, entregas incumplidas, falta de seguimiento y dificultad para resolver conflictos. Los vendedores también sufren falsos pagos, compradores fraudulentos, reclamos y falta de herramientas.

Solución. Una plataforma que centraliza todo el proceso: Usuario → Vendedor → Producto → Carrito → Pedido → Pago → Envío → Seguimiento → Entrega → Calificación → Finalización, y ante un problema: Reclamo → Evidencia → Revisión → Devolución / Reemplazo / Reembolso.

Experiencia (nuevo). Una interfaz limpia, ordenada y fácil de entender, diseñada con principios de psicología humana para que comprar sea simple y transmita confianza.

21. Justificación y conclusión (nuevo)
Justificación. El comercio digital crece, pero la desconfianza limita su uso. Un sistema que registre y controle cada etapa reduce el riesgo para compradores y vendedores, y permite practicar el diseño de un sistema real con actores, reglas, estados y trazabilidad.

Conclusión. Tienda Virtual Segura propone un modelo donde la confianza se construye con información verificable: identidad de los participantes, pagos confirmados, estados definidos, evidencias en los reclamos y auditoría de las acciones sensibles.

22. Definición final
Tienda Virtual Segura es una plataforma de comercio electrónico que conecta compradores y vendedores dentro de un entorno digital seguro, organizado y trazable. Resuelve los problemas de confianza de las compras por Internet: fraudes, pagos inseguros, vendedores no confiables, productos que no llegan o no corresponden con lo publicado, dificultades de seguimiento y falta de mecanismos formales para resolver reclamos.

Integra registro de usuarios, verificación de vendedores, catálogo, búsqueda, carrito, pedidos, pagos, inventario, envíos, seguimiento, reputación, protección del comprador, reclamos, devoluciones, reembolsos, auditoría y administración. Su principio fundamental es que la operación comercial permanezca registrada dentro de la plataforma, desde la publicación hasta la finalización de la compra.

"Tienda Virtual Segura: compra, vende y realiza todo el proceso comercial dentro de un mismo entorno, con seguridad, trazabilidad y mecanismos para resolver los problemas que puedan surgir."

23. Diseño de la tienda basado en psicología humana (nuevo)
Objetivo: que la tienda se vea limpia, no se sienta saturada a simple vista, sea fácil de entender, con botones, barra de navegación y menús fáciles de identificar, y que además transmita confianza. Las ideas siguientes se apoyan en principios conocidos de psicología y usabilidad; son criterios de diseño, no reglas absolutas, y conviene validarlos con usuarios de prueba.

23.1 Principios psicológicos y cómo se aplican
Principio	Idea	Aplicación en la tienda
Carga cognitiva	El cerebro se cansa si recibe demasiada información a la vez	Pocas cosas por pantalla; una acción principal; información secundaria en pestañas o "ver más"
Ley de Hick	Más opciones = más tiempo para decidir	Menú principal con 5–7 opciones; filtros agrupados; pocos botones de igual peso
Número mágico (memoria de trabajo)	Recordamos pocos elementos a la vez	Bloques de 3–5 elementos; pasos de compra limitados a 3
Jerarquía visual	Lo más grande, contrastado o arriba se ve primero	El botón principal es el elemento más llamativo; el precio y el nombre del producto destacan sobre lo demás
Leyes de proximidad y agrupación (Gestalt)	Lo cercano se percibe como relacionado	Precio junto al botón de compra; envío junto al total; espacios para separar secciones
Ley de Fitts	Los objetivos grandes y cercanos se alcanzan más rápido	Botones grandes, sobre todo en celular; el botón de pagar siempre al alcance del pulgar
Ley de Jakob	Los usuarios prefieren lo que ya conocen de otros sitios	Logo arriba a la izquierda, buscador arriba al centro, carrito arriba a la derecha, como en las tiendas conocidas
Efecto estético-usabilidad	Lo que se ve ordenado se percibe como más fácil y confiable	Estilo consistente, buena alineación, mucho espacio en blanco
Prueba social	Nos guiamos por lo que otros hicieron	Calificaciones, número de ventas, reseñas de compras reales
Aversión a la pérdida	Pesa más no perder que ganar	Garantías visibles ("Compra protegida"), política de devolución clara, "recuperas tu dinero si no llega"
Escasez y urgencia (con ética)	Lo limitado atrae	Solo con datos reales ("Quedan 3"); nunca temporizadores falsos ni presión engañosa. Coherente con una plataforma de confianza
Reciprocidad y hábito	Lo conocido y predecible genera comodidad	Mismo flujo siempre, avisos de progreso, lista de deseos, historial
Efecto de meta gradual / progreso	Ver avance motiva a terminar	Barra de pasos en la compra; línea de tiempo en el seguimiento
Principio de "anclaje"	El primer precio visto condiciona la percepción	Mostrar precio anterior solo si es real; destacar el precio final con envío incluido
Efecto de primacía y recencia	Se recuerda lo primero y lo último	Poner lo más importante al inicio y al final de listas y pantallas
23.2 Estructura general de la pantalla
La tienda se organiza en tres zonas fáciles de reconocer:

Cabecera (navbar): orientación y acceso rápido.
Zona de contenido: lo que el usuario vino a hacer.
Pie de página: información de apoyo, ayuda y confianza.
Regla de oro: una sola cosa importante por pantalla. Todo lo demás es apoyo.

23.3 Barra de navegación superior (navbar)
Distribución (escritorio):

[ Logo ]   [ ☰ Categorías ]   [ ______ Buscar productos ______ 🔍 ]   [ Ayuda ] [ 👤 Mi cuenta ] [ 🛒 Carrito (2) ]
Logo (izquierda): lleva siempre al inicio.
Categorías: menú desplegable con máximo 8–10 categorías principales y subcategorías al pasar el cursor o tocar.
Buscador: el elemento más ancho y central; con sugerencias, es la herramienta principal. Texto de ayuda: "Busca productos, marcas o categorías".
Cuenta y carrito (derecha): iconos con texto; el carrito con contador visible.
Fija al desplazarse (pero delgada) para no perder la orientación.
Aviso de confianza discreto sobre o bajo la barra: "Compra protegida · Envíos con seguimiento". Una sola línea, sin saturar.
En celular: barra compacta con menú (☰), logo, buscador y carrito; barra inferior fija con 4–5 accesos: Inicio, Categorías, Buscar, Pedidos, Cuenta (zona del pulgar).

Navbar por rol: el comprador ve la tienda; el vendedor tiene un acceso claro "Vender / Mi tienda"; el administrador entra a su panel por separado, no mezclado con la tienda.

23.4 Barra lateral (sidebar)
En la tienda (comprador): se usa para filtros en la página de resultados (categoría, precio, disponibilidad, vendedor, calificación). Cada filtro es un grupo plegable; los más usados abiertos, el resto cerrados. En celular se convierte en un panel que se abre con el botón "Filtrar".
En el panel del vendedor y del administrador: sidebar izquierda fija con iconos + texto: Resumen, Productos, Pedidos, Envíos, Reclamos, Estadísticas, Configuración. El elemento activo se destaca con color y barra lateral. Máximo 7–8 ítems; lo secundario se agrupa. Se puede colapsar a solo iconos.
En "Mi cuenta" del comprador: sidebar corta: Mis pedidos, Reclamos y devoluciones, Direcciones, Lista de deseos, Datos personales, Seguridad.
23.5 Pantalla de inicio (limpia y con intención)
Orden recomendado de arriba hacia abajo:

Banner principal simple: un mensaje y un botón (no varios banners en competencia).
Categorías destacadas: 6–8 iconos o tarjetas grandes.
Productos recomendados / ofertas: una fila horizontal con 4–6 productos.
Bloque de confianza: 3 iconos con mensajes cortos (Compra protegida · Seguimiento de tu pedido · Devoluciones claras).
Vendedores destacados verificados.
Pie de página.
Se evita: carruseles que cambian solos, más de 3 bloques promocionales a la vez, textos largos, ventanas emergentes al entrar.

23.6 Tarjeta de producto (en listados)
Contenido, en este orden: foto grande → nombre (máx. 2 líneas) → calificación y cantidad de reseñas → precio (destacado) → etiqueta de envío / disponibilidad → botón secundario (corazón de deseos). Toda la tarjeta es clicable. Solo una etiqueta promocional por tarjeta. Fondo blanco, buen espacio entre tarjetas, misma proporción de foto en todas.

23.7 Página de detalle de producto
Izquierda: galería de fotos con miniaturas (la principal grande).
Derecha: nombre, calificación, precio, variantes (talla, color) como botones visibles, stock, y un botón principal grande "Agregar al carrito" (y uno secundario "Comprar ahora").
Bloque de vendedor: nombre, reputación, entregas completadas, botón "Ver tienda".
Bloque de protección: "Tu compra está protegida: si no llega o no es lo ofrecido, puedes reclamar".
Más abajo, en pestañas: descripción, características, reseñas, preguntas.
Móvil: el botón de compra queda fijo en la parte inferior.
23.8 Confianza visible y seguridad percibida
Señales discretas, siempre coherentes con la realidad del sistema:

Insignia "Vendedor verificado" (solo si el administrador lo verificó).
Calificaciones basadas en compras reales (etiqueta "Compra verificada" en reseñas).
Sello "Compra protegida" cerca del botón de pagar.
Información de envío y devoluciones antes de pagar, no escondida.
Mensajes claros y humanos, sin tecnicismos.
Indicadores del seguimiento y de la custodia: "Tu dinero está protegido hasta que recibas tu pedido".
Nunca insignias falsas, contadores inventados ni escasez ficticia.
23.9 Botones: cómo identificarlos fácilmente
Tipo	Uso	Estilo
Primario	La acción principal de la pantalla (Agregar al carrito, Pagar, Confirmar)	Color de marca sólido, texto blanco, grande; uno solo por pantalla
Secundario	Acciones alternativas (Comprar ahora, Ver detalles)	Borde de color, fondo claro
Terciario / enlace	Acciones menores (Cancelar, Volver, Ver más)	Texto subrayado o simple
Peligro	Acciones destructivas o irreversibles (Cancelar pedido, Eliminar)	Rojo, siempre con confirmación
Deshabilitado	Acción no disponible aún	Gris, con una frase que explique por qué
Buenas prácticas: verbos claros ("Agregar al carrito", no "Aceptar"); tamaño mínimo cómodo para el dedo (≈44 px de alto); esquinas redondeadas y apariencia "clicable"; estados visibles (al pasar el cursor, al presionar, cargando); mismo color para la misma función en toda la tienda; botones principales alineados en el mismo lugar en cada pantalla.

23.10 Colores, tipografía y espacio
Paleta limitada: 1 color de marca (acciones principales), 1 color de apoyo, neutros (blanco, grises suaves, texto oscuro). Regla orientativa 60-30-10: 60% neutros, 30% apoyo, 10% acento.
Significado de color consistente: azul/verde = confianza y avance, naranja = atención/promoción (poco), rojo = error o peligro, verde = éxito, gris = inactivo. El color nunca es el único indicador (se acompaña de texto o icono).
Fondo claro y limpio; modo oscuro opcional más adelante.
Tipografía: una sola familia sans-serif legible; texto base de 16 px o más; títulos claramente más grandes; interlineado cómodo; evitar bloques largos de texto y mayúsculas continuas.
Espacio en blanco: es parte del diseño. Márgenes amplios entre secciones, tarjetas con aire. Un diseño con aire se percibe como ordenado, premium y confiable.
Contraste suficiente entre texto y fondo (accesibilidad).
Imágenes: fotos de calidad, mismo estilo y proporción; fondos limpios para productos; iconografía simple y de un mismo estilo.
23.11 Carrito y proceso de pago (donde más se abandona)
Carrito: lista clara con foto, nombre, variante, cantidad editable, precio y botón de quitar; resumen fijo a la derecha (subtotal, envío, total) con un botón primario "Continuar con la compra".
Pago en 3 pasos con barra de progreso: 1. Dirección → 2. Envío → 3. Pago y revisión. Solo se pide lo indispensable; se recuerdan direcciones; formularios cortos, con validación inmediata y mensajes de error amables junto al campo.
Sin sorpresas: el costo de envío y el total se muestran desde el carrito, no al final.
Compra como invitado a revisar: permitir crear la cuenta al terminar mejora la conversión, pero la regla del sistema exige cuenta identificable; se resuelve con un registro mínimo (solo correo y contraseña) dentro del propio flujo.
Distracciones mínimas: en el pago se simplifica la cabecera (menos enlaces) para que el usuario no se vaya.
Confirmación final clara: pantalla de "¡Listo! Tu pedido fue recibido" con número de pedido, resumen, fecha estimada y botón "Ver seguimiento".
23.12 Paneles del vendedor y del administrador
Tablero con lo urgente primero: "Pedidos por preparar (3)", "Reclamos por responder (1)", "Stock bajo (2)", y debajo las estadísticas.
Tarjetas de resumen (KPI) arriba, con un número grande y una pequeña etiqueta; gráficos simples (líneas y barras), no más de 3–4 por pantalla.
Tablas legibles: pocas columnas visibles, filtros y búsqueda arriba, estado con etiqueta de color, acciones al final de cada fila.
Formularios por pasos para crear productos, con vista previa de cómo se verá en la tienda.
Mensajes vacíos útiles: cuando no hay datos, explicar qué hacer ("Aún no tienes productos. Crea el primero").
23.13 Seguimiento, notificaciones y estados vacíos/de error
Línea de tiempo vertical con íconos, fecha y estado actual resaltado.
Notificaciones agrupadas, con texto breve y acción directa.
Errores humanos: explicar qué pasó y cómo solucionarlo, sin culpar al usuario ("No pudimos procesar tu pago. Prueba con otro método").
Estados de carga (esqueletos o indicadores) para que el usuario sepa que algo ocurre.
Confirmación de acciones importantes (cancelar, reclamar, pagar), con resumen de lo que ocurrirá.
23.14 Diseño para celular
Más del tráfico del comercio electrónico llega desde teléfonos, por lo que el diseño parte de mobile first: una columna, botones grandes, menú inferior, filtros en panel, botón de compra fijo, texto legible sin hacer zoom, formularios con el teclado adecuado (numérico para teléfono, correo para email).

23.15 Accesibilidad e inclusión
Contraste adecuado, tamaños de texto ajustables, textos alternativos en imágenes, navegación con teclado, etiquetas claras en formularios, no depender solo del color, lenguaje sencillo.

23.16 Checklist de diseño limpio (para evaluar cada pantalla)
 ¿Se entiende en 5 segundos qué es y qué puedo hacer?
 ¿Hay una sola acción principal bien visible?
 ¿Hay espacio en blanco suficiente y poca información simultánea?
 ¿Los botones se distinguen entre sí y de los textos?
 ¿La navegación (navbar/sidebar) es la misma y está en el mismo lugar en todas las pantallas?
 ¿Sé dónde estoy, cómo volver y qué sigue?
 ¿Los mensajes y errores son claros y amables?
 ¿Las señales de confianza son reales y discretas?
 ¿Funciona bien y se ve ordenado en celular?
 ¿Se puede usar sin instrucciones?
23.17 Cómo validar el diseño (en esta etapa académica)
Pruebas sencillas con 3–5 personas: pedirles que busquen un producto, lo compren y reclamen un problema, observando dónde dudan; "prueba de 5 segundos" (mostrar una pantalla y preguntar qué recuerdan); comparar con tiendas conocidas; y medir con los indicadores de diseño de la sección 17.

24. Siguiente etapa
A partir de este documento: requisitos del sistema (detallar la sección 14), casos de uso por actor, mapa de pantallas y navegación (basado en la sección 23), maquetas (wireframes) de las pantallas clave, entidades de base de datos y, más adelante, la implementación.