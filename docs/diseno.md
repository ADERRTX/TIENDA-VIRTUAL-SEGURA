# Sistema de Diseño — Tienda Virtual Segura (TVS)

Este documento describe la arquitectura visual, componentes de interfaz y directrices de diseño implementadas y verificadas para **Tienda Virtual Segura (TVS)**, un marketplace con custodia de fondos (escrow) donde la seguridad informática, la calidez comercial y la confianza profesional son los ejes fundamentales de la experiencia de usuario.

---

## 1. Filosofía de Diseño y Justificación Visual

La interfaz de TVS adopta una estética clara, amigable y profesional inspirada en el comercio electrónico moderno y en plataformas de confianza institucional. El objetivo es brindar una navegación nítida y transparente que disipe cualquier incertidumbre en el proceso de compra protegida.

* **Fondo Cálido y Amigable (`bg: #FAF8F3` / `surface: #FFFFFF`):**
  * Fondo crema suave combinado con tarjetas blancas limpias, generando descansos visuales amplios y eliminando el aspecto frío o austero.
* **Bloques de Color Pastel (`mint: #DDF3EE` / `.section-mint`):**
  * Paneles menta luminosos para el hero principal, la franja de compra protegida y bloques de confianza.
* **Verde Petróleo de Ancla (`deep: #0B3B3A` / `.section-deep`):**
  * Bloques oscuros contrastantes para el pie de página institucional (`AppFooter`) y la banda de llamada a la acción para comercios aliados, anclando visualmente el recorrido.
* **Acento Único Institucional (`brand: #0B7A5E`):**
  * Verde esmeralda que comunica respaldo y solidez. Se utiliza con disciplina: **un solo botón con color de marca por zona visual**, guiando la acción principal del usuario.
* **Acento Cálido de Sol (`sun: #F6A623`):**
  * Tono dorado cálido reservado exclusivamente para estrellas de reseñas y calificaciones de productos, avisos suaves y destacados decorativos. Nunca se emplea como botón primario.
* **Tipografía Editorial Combinada:**
  * Mezcla armoniosa de una fuente serif del sistema (`font-display: Georgia, Times New Roman, serif`) para títulos editoriales y el sans-serif moderno del sistema para todo el cuerpo interactivo.

---

## 2. Tokens de Color y Tabla de Contraste Real (WCAG 2.1 AA)

Todos los pares de color han sido auditados matemáticamente mediante el algoritmo estándar de luminancia relativa WCAG 2.1 contra el nivel AA (mínimo 4.5:1 para texto normal, 3.0:1 para elementos de interfaz o texto mayor a 18pt):

| Par de Contraste | Colores HEX | Ratio Calculado | Requisito WCAG | Estado |
| :--- | :--- | :---: | :---: | :---: |
| **`ink` sobre `bg`** | `#12211F` / `#FAF8F3` | **15.67 : 1** | $\ge 4.5:1$ (Texto base sobre crema) | CUMPLE (AAA) |
| **`ink` sobre `surface`** | `#12211F` / `#FFFFFF` | **16.63 : 1** | $\ge 4.5:1$ (Texto sobre tarjetas) | CUMPLE (AAA) |
| **`ink` sobre `mint`** | `#12211F` / `#DDF3EE` | **14.35 : 1** | $\ge 4.5:1$ (Texto sobre paneles menta) | CUMPLE (AAA) |
| **`ink-muted` sobre `bg`** | `#4B5E5A` / `#FAF8F3` | **6.49 : 1** | $\ge 4.5:1$ (Secundario en fondo) | CUMPLE (AA) |
| **`ink-muted` sobre `surface`** | `#4B5E5A` / `#FFFFFF` | **6.89 : 1** | $\ge 4.5:1$ (Secundario en tarjetas) | CUMPLE (AA) |
| **`ink-muted` sobre `surface-2`** | `#4B5E5A` / `#F1EEE6` | **5.94 : 1** | $\ge 4.5:1$ (Etiquetas en campos) | CUMPLE (AA) |
| **`ink-muted` sobre `mint`** | `#4B5E5A` / `#DDF3EE` | **5.95 : 1** | $\ge 4.5:1$ (Metadatos en menta) | CUMPLE (AA) |
| **`brand` sobre `bg`** | `#0B7A5E` / `#FAF8F3` | **5.00 : 1** | $\ge 4.5:1$ (Acento sobre crema) | CUMPLE (AA) |
| **`brand` sobre `surface`** | `#0B7A5E` / `#FFFFFF` | **5.30 : 1** | $\ge 4.5:1$ (Acento sobre tarjeta) | CUMPLE (AA) |
| **`blanco` sobre `brand`** | `#FFFFFF` / `#0B7A5E` | **5.30 : 1** | $\ge 4.5:1$ (Texto en botón primario) | CUMPLE (AA) |
| **`blanco` sobre `deep`** | `#FFFFFF` / `#0B3B3A` | **12.35 : 1** | $\ge 4.5:1$ (Texto en footer y deep) | CUMPLE (AAA) |
| **`deep-muted` sobre `deep`** | `#B9D4CF` / `#0B3B3A` | **7.87 : 1** | $\ge 4.5:1$ (Secundario en footer) | CUMPLE (AA) |
| **`sun-ink` sobre `sun`** | `#2A1700` / `#F6A623` | **8.52 : 1** | $\ge 4.5:1$ (Texto sobre dorado) | CUMPLE (AAA) |

> [!NOTE]
> El token `ink-faint` (`#8A9B97`) se clasifica exclusivamente como decorativo (separadores y líneas tenues); nunca se utiliza para texto legible o etiquetas esenciales.

---

## 3. Tipografía

### Familias Tipográficas
* **Sans-serif Principal:** `ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`. Usado en el 95% de la interfaz para máxima nitidez y rendimiento nativo sin descargas externas.
* **Serif Display (`font-display`):** `Georgia, 'Times New Roman', serif`. Usada exclusivamente con peso 600 (`font-semibold`) en:
  1. El titular H1 del hero principal (`HomePage.tsx`).
  2. Los títulos de sección destacados de Inicio y Catálogo (`HomePage.tsx`, `CatalogPage.tsx`).
  3. El título del producto en la vista de detalle (`ProductDetailPage.tsx`).
  4. El titular de confirmación de compra exitosa (`CheckoutPage.tsx`).

### Pesos Tipográficos Permitidos
Estrictamente limitados a tres valores:
1. `font-normal` (400): Texto corrido, párrafos descriptivos y especificaciones.
2. `font-medium` (500): Elementos interactivos secundarios, opciones de filtro, migas de pan y metadatos.
3. `font-semibold` (600): Encabezados, títulos de sección, llamadas a la acción primarias y precios destacados.
*(Prohibidos: `font-bold` [700], `font-extrabold` [800] y `font-black` [900]).*

### Escala de Tamaños
* **Hero Display:** `text-4xl sm:text-5xl` (36px a 48px, `font-semibold font-display`).
* **Título de Página / H1:** `text-2xl sm:text-3xl` (24px a 30px, `font-semibold`).
* **Subtítulo / H2:** `text-xl` (20px, `font-semibold`).
* **Encabezados de Tarjetas / H3:** `text-base` (16px, `font-semibold`).
* **Cuerpo de Texto / Body:** `text-sm` (14px, `font-normal`).
* **Metadatos y Etiquetas / Caption:** `text-xs` (12px, `font-medium` o `font-normal`).
*(Prohibidos: `text-[10px]` y `text-[11px]`).*

### Formato Numérico
Todos los precios, saldos de cuenta, identificadores de orden abreviados y contadores numéricos utilizan la clase utilitaria `.tabular` (`font-variant-numeric: tabular-nums`) para garantizar alineación exacta de columnas.

---

## 4. Forma, Elevación y Espaciado

### Radios de Borde (Border Radius)
* **`rounded-lg` (8px):** Controles interactivos (inputs, selectores, botones y áreas de texto).
* **`rounded-xl` (12px):** Tarjetas (`Card`), tablas (`DataTable`), rejillas de producto (`ProductCard`) y menús flotantes.
* **`rounded-2xl` (16px):** Reservado estrictamente para diálogos modales (`Modal`) y los paneles grandes de fondo (`.section-mint`, `.section-deep`). *(Prohibido: `rounded-3xl`).*
* **`rounded-full` (9999px):** Insignias (`Badge`, `StatusBadge`), buscador en forma de píldora y avatares.

### Sombras y Elevación
* **`shadow-sm`:** Elevación leve al interactuar con tarjetas clickeables (`hover:shadow-sm`).
* **`shadow-lg`:** Elevación para capas superpuestas: menús desplegables (`NavDropdown`, `UserMenu`), menú móvil (`MobileMenu`) y diálogos (`Modal`).
*(Prohibidos: `shadow-md`, `shadow-xl` y `shadow-2xl`).*

### Utilidades de Fondo
* `.container-page`: `max-w-7xl mx-auto px-4 sm:px-6 lg:px-8`.
* `.section-mint`: Fondo menta pastel (`bg-mint`), bordes redondeados `rounded-2xl` y padding generoso.
* `.section-deep`: Bloque verde petróleo oscuro (`bg-deep text-brand-ink`), bordes redondeados `rounded-2xl`.

---

## 5. Catálogo de Componentes Centralizados (`src/components/ui/`)

1. **`Button`:**
   * `primary`: Fondo verde `brand`, texto blanco, hover `brand-hover`. Único CTA principal por zona.
   * `secondary`: Borde `line` sobre fondo `surface` con hover `surface-2`.
   * `ghost`: Sin borde ni fondo base, con hover `surface-2` o `brand-soft`.
   * `danger`: Fondo suave de peligro `danger-soft` con hover `bg-danger text-white`.
   * Altura ergonómica mínima de 44 px en acciones operativas.
2. **`Badge` y `StatusBadge`:**
   * Formato de píldora `rounded-full` con texto semántico y contraste verificado.
3. **`Card`:**
   * Superficie blanca `bg-surface`, borde perimetral `border border-line`, esquinas `rounded-xl`.
4. **`DataTable`:**
   * Contenedor `rounded-xl border border-line`, cabecera `bg-surface-2`, filas con hover interactivo `hover:bg-surface-2`.
5. **`EmptyState` y `ErrorState`:**
   * Contenedores informativos con icono semántico, mensaje claro en español y acción de reintento.
6. **`Input`, `Select`, `Textarea`:**
   * Altura base de 44 px (`min-h-[44px]`), fondo `surface`, borde `line`, anillo de foco turquesa `focus:ring-2 focus:ring-brand`.
7. **`Modal`:**
   * Contenedor con radio `rounded-2xl`, sombra `shadow-lg`, trampa completa de foco por teclado (Tab/Shift+Tab), listener de cierre con `Escape` y retorno de foco al elemento previo.
8. **`PageHeader`:**
   * Título, descripción y migas de pan con soporte para tipografía editorial.
9. **`Pagination`:**
   * Navegación numérica con botones táctiles de 44 px y estado activo resaltado.
10. **`Skeleton` y `Spinner`:**
    * Animaciones suaves con shimmer de onda limpia para retroalimentación durante la carga.
11. **`Stat`:**
    * Tarjeta de indicador clave (KPI) con cifras tabulares y recuadro de icono en color suave (`mint`, `sun-soft`, `brand-soft`, `info-soft`).
12. **`ProductCard` (`src/components/ProductCard.tsx`):**
    * Tarjeta de producto estandarizada y reutilizable: imagen con relación de aspecto 4:3 sobre marco limpio, categoría en texto pequeño, título truncado a 2 líneas, nombre de la tienda vendedora, precio tabular de 20 px y botón primario de acción directa.

---

## 6. Patrones de Pantalla Implementados

1. **Hero Dividido (`HomePage.tsx`):**
   * Panel grande en `.section-mint`: columna izquierda con titular editorial en `font-display`, subtítulo explicativo y llamada a la acción; columna derecha con mosaico visual de 4 productos reales en tarjetas blancas `rounded-xl`.
2. **Franja de Confianza:**
   * Tres tarjetas de respaldo bajo el hero ("Compra protegida", "Seguimiento del envío", "Reclamos y mediación") con iconos enmarcados en cajas menta.
3. **Buscador en Forma de Píldora (`AppHeader.tsx`):**
   * Barra de búsqueda con radio completo `rounded-full` en la cabecera fija, con acceso directo a `/catalogo`.
4. **Catálogo con Filtros Laterales y Chips (`CatalogPage.tsx`):**
   * En escritorio: barra lateral de 240 px con selector de categorías y switch de disponibilidad; en móvil: chips de desplazamiento horizontal continuo. Rejilla responsiva adaptable (2, 3 o 4 columnas).
5. **Detalle de Producto (`ProductDetailPage.tsx`):**
   * Vista en dos columnas: galería de miniaturas a la izquierda con visor ampliado, y a la derecha título editorial, precio destacado, selector de variantes, control de cantidad y botón principal de compra. Pestañas inferiores de descripción y opiniones con estrellas doradas (`sun`). Barra de compra pegajosa en móvil.
6. **Proceso de Compra en Pasos Numerados (`CheckoutPage.tsx`):**
   * Indicador superior de 3 pasos conectados por línea continua, panel de resumen de orden siempre visible y pantalla de confirmación exitosa con círculo menta e icono de verificación de 64 px.
7. **Navegación Móvil Fija (`MobileBottomNav.tsx`):**
   * Barra inferior fijada a la base de la pantalla en dispositivos móviles (`md:hidden`) con objetivos táctiles ergonómicos $\ge 44$ px y contador reactivo de carrito.

---

## 7. Lista de Comprobación para Pantallas Nuevas

Al desarrollar o incorporar una nueva vista en el frontend de TVS, verificar estrictamente los siguientes puntos:

- [ ] **Paleta:** Utiliza únicamente tokens semánticos de Tailwind (`bg-bg`, `bg-surface`, `text-ink`, `text-ink-muted`, `border-line`, `text-brand`, etc.). Cero colores hexadecimales directos en componentes.
- [ ] **Tipografía:** Pesos limitados exclusivamente a `font-normal` (400), `font-medium` (500) y `font-semibold` (600). La fuente `font-display` se reserva únicamente para títulos principales.
- [ ] **Acciones Primarias:** Solo existe **un único botón primario** (`variant="primary"`) por zona visual de la pantalla.
- [ ] **Radios:** `rounded-lg` para controles, `rounded-xl` para tarjetas y tablas, `rounded-2xl` solo para modales y paneles de sección, `rounded-full` para badges.
- [ ] **Sombras:** Solo `shadow-sm` para interacción en tarjetas y `shadow-lg` para modales y menús flotantes.
- [ ] **Precios y Números:** Toda cifra monetaria, cantidad o identificador numérico utiliza la clase `.tabular`.
- [ ] **Iconografía:** Todos los iconos provienen exclusivamente de `lucide-react`, con `aria-hidden="true"` si son decorativos o `aria-label` descriptivo si son el único contenido de un botón interactivo.
- [ ] **Accesibilidad:** Todos los elementos interactivos cuentan con objetivo táctil $\ge 44$ px y anillo de foco visible (`focus-visible:ring-2 focus-visible:ring-brand`).
- [ ] **Tres Estados Obligatorios:** La pantalla gestiona formalmente: carga con `Skeleton`, fallo con `ErrorState` y ausencia de datos con `EmptyState`.
- [ ] **Verificación de Compilación:** Ejecutar `pnpm exec tsc --noEmit` sin errores y verificar que el chunk resultante en `vite build` sea óptimo.
