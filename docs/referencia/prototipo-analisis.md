# Análisis del prototipo visual: Tienda Virtual Segura

## Pantallas mostradas
El prototipo es una SPA monopágina con JavaScript que simula enrutamiento interno. Las pantallas incluyen:
- **Inicio**: Banner principal, categorías destacadas, productos recomendados, bloque de confianza
- **Catálogo**: Vista de tarjetas de productos con filtros laterales
- **Detalle de producto**: Galería de fotos, variantes, precio, botón de compra
- **Carrito**: Drawer lateral con resumen de compra
- **Pago**: Pantalla de checkout con selección de método de pago
- **Seguimiento**: Línea de tiempo de pedidos con hitos
- **Panel de vendedor**: Productos, pedidos, envíos, reclamos
- **Panel de administración**: Solicitudes de vendedores, cola de moderación, reportes
- **Login/Registro**: Pantalla de acceso con selección de rol

## Paleta, tipografía y componentes
- **Paleta**: Tema oscuro premium con fondo `#090F1E`, superficie `#111A30`, texto principal `#E9F0FA`, acentos teal `#2DD4BF` y ámbar `#FFB020`
- **Tipografía**: Inter/Segoe UI/Calibri, sans-serif, tamaños 12-14px para cuerpo, títulos con letter-spacing negativo
- **Componentes**: Botones con gradiente y glow (primario teal, secundario ámbar, peligro rojo), tarjetas con sombra y bordes, drawer lateral, modales, toasts, tabs, badges de estado, barra de progreso de envío

## Categorías y productos de ejemplo
- **Categorías**: Electrónica, Hogar, Moda, Deportes, Belleza, Juguetes
- **Ejemplos de productos**: Laptop XYZ, Audífonos inalámbricos, Smartwatch, Televisor 55", etc.
- Los productos incluyen nombre, precio, calificación, vendedor y etiquetas de disponibilidad

## Divergencias respecto a docs/funcional.md §23 y docs/tecnico.md §10.3
1. **Scripts en línea**: El prototipo usa JavaScript embebido en el HTML, no separado en módulos
2. **localStorage**: Los datos de usuario y carrito se almacenan en localStorage, no en sesiones del lado del servidor
3. **CDN externos**: Usa CDN para fuentes y componentes, no assets locales
4. **Datos o escasez falsos**: Muestra datos estáticos y temporizadores de "oferta por tiempo limitado" que no reflejan stock real
5. **Varias acciones principales por pantalla**: Tiene múltiples botones de igual jerarquía visual en lugar de uno solo principal
6. **Precios o estados calculados en el cliente**: Los precios y totales se calculan en JavaScript, no en el servidor
7. **Fuentes externas**: Usa fuentes de CDN, no assets locales empaquetados

## Qué conservar como inspiración visual
- Paleta de colores (teal/ámbar sobre fondo oscuro)
- Estructura general de la barra de navegación
- Disposición de tarjetas de producto
- Uso de iconos y badges de estado
- Barra de progreso de seguimiento
- Diseño responsive (mobile first)

## Qué descartar
- Datos estáticos y simulados
- Scripts embebidos (usar módulos separados)
- localStorage para estado crítico
- Temporizadores falsos de escasez
- Múltiples botones principales por pantalla
- Precios calculados en el cliente
- CDN externo para assets críticos
- Fuentes de CDN (usar fuentes locales empaquetadas)