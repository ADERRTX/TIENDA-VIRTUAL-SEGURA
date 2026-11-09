# Sistema de Diseño — Tienda Virtual Segura (TVS)

Este documento describe la arquitectura visual, componentes de interfaz y directrices de diseño implementadas y verificadas para **Tienda Virtual Segura (TVS)**, un marketplace con custodia de pagos simulada (escrow) donde la seguridad informática, la transparencia y la confianza son los ejes fundamentales del producto.

---

## 1. Filosofía de Diseño y Justificación Visual

La interfaz de TVS sigue los principios de aplicaciones SaaS de alta seguridad, terminales financieras y plataformas bancarias modernas. Su propósito es transmitir solidez, transparencia operativa y control absoluto al usuario, eliminando saturación visual o artificios decorativos innecesarios.

- **Tema Oscuro Marino Profundo (`#0A1020` / `#0F1A2E`)**:
  - Evoca rigor técnico, blindaje institucional y confidencialidad.
  - Minimiza la fatiga visual en sesiones prolongadas de auditoría, gestión comercial y compras.
- **Acento Único Turquesa (`#2DD4BF` - Brand)**:
  - Comunica verificación criptográfica, modernidad y fluidez operativa.
  - Se utiliza de manera disciplinada: **un único acento visual dominante por pantalla**, guiando al usuario hacia la acción principal (CTA primario, enlace activo o confirmación).
- **Semántica Estricta y Discreta**:
  - Los colores de estado (`success`, `warning`, `danger`, `info`) se reservan exclusivamente para comunicar el estado real de transacciones, cuentas, productos o disputas.
  - Se presentan en variantes *soft* (fondo con opacidad al 12%, texto legible y borde sutil) para no competir con el acento turquesa institucional.

---

## 2. Tokens de Color y Tabla de Contraste Real (WCAG 2.1 AA)

Todos los pares de color han sido calculados matemáticamente mediante algoritmo de luminancia relativa estándar WCAG 2.1 contra el nivel AA (mínimo 4.5:1 para texto normal, 3.0:1 para elementos de interfaz o texto mayor a 18pt):

| Par (Primer Plano / Fondo) | Valores HEX | Ratio Calculado | Requisito WCAG AA | Evaluación |
| :--- | :--- | :---: | :---: | :---: |
| **`ink` sobre `bg`** | `#E8EEF7` / `#0A1020` | **16.25 : 1** | $\ge 4.5:1$ (Texto base) | **CUMPLE (AAA)** |
| **`ink` sobre `surface`** | `#E8EEF7` / `#0F1A2E` | **14.91 : 1** | $\ge 4.5:1$ (Texto en tarjetas) | **CUMPLE (AAA)** |
| **`ink` sobre `surface-2`** | `#E8EEF7` / `#14233B` | **13.50 : 1** | $\ge 4.5:1$ (Texto en inputs y cabeceras) | **CUMPLE (AAA)** |
| **`ink-muted` sobre `bg`** | `#9FB0C8` / `#0A1020` | **8.59 : 1** | $\ge 4.5:1$ (Texto secundario en base) | **CUMPLE (AA)** |
| **`ink-muted` sobre `surface`** | `#9FB0C8` / `#0F1A2E` | **7.88 : 1** | $\ge 4.5:1$ (Texto secundario en tarjetas) | **CUMPLE (AA)** |
| **`ink-muted` sobre `surface-2`** | `#9FB0C8` / `#14233B` | **7.14 : 1** | $\ge 4.5:1$ (Etiquetas en campos elevados) | **CUMPLE (AA)** |
| **`brand-ink` sobre `brand`** | `#04121F` / `#2DD4BF` | **10.15 : 1** | $\ge 4.5:1$ (Texto sobre botón primario) | **CUMPLE (AAA)** |
| **`brand` sobre `bg`** | `#2DD4BF` / `#0A1020` | **10.18 : 1** | $\ge 4.5:1$ (Acento sobre fondo base) | **CUMPLE (AAA)** |
| **`brand` sobre `surface`** | `#2DD4BF` / `#0F1A2E` | **9.34 : 1** | $\ge 4.5:1$ (Acento sobre tarjeta) | **CUMPLE (AAA)** |
| **`brand` sobre `surface-2`** | `#2DD4BF` / `#14233B` | **8.46 : 1** | $\ge 4.5:1$ (Acento en inputs/hover) | **CUMPLE (AAA)** |
| **`success` sobre `surface`** | `#4ADE80` / `#0F1A2E` | **9.98 : 1** | $\ge 3.0:1$ (Indicador de éxito) | **CUMPLE (AA)** |
| **`warning` sobre `surface`** | `#FBBF24` / `#0F1A2E` | **10.42 : 1** | $\ge 3.0:1$ (Indicador de custodia/espera) | **CUMPLE (AA)** |
| **`danger` sobre `surface`** | `#F87171` / `#0F1A2E` | **6.29 : 1** | $\ge 4.5:1$ (Texto/icono de peligro/error) | **CUMPLE (AA)** |
| **`info` sobre `surface`** | `#60A5FA` / `#0F1A2E` | **6.84 : 1** | $\ge 3.0:1$ (Indicador de tránsito/soporte) | **CUMPLE (AA)** |

> [!NOTE]
> El token `ink-faint` (`#6F819C`) tiene un ratio de 4.39:1 sobre `surface` y está clasificado **exclusivamente como decorativo** (separadores, bordes tenues, marcas de agua); queda estrictamente prohibido su uso para texto legible o etiquetas esenciales.

---

## 3. Tipografía

La aplicación utiliza la tipografía sans-serif nativa del sistema operativo optimizada para legibilidad, nitidez y cero retardo de carga de red (`ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`).

### Pesos Permitidos
Solo se permiten **tres pesos tipográficos** en toda la interfaz:
1. `font-normal` (400): Texto de párrafo, descripciones y cuerpo general.
2. `font-medium` (500): Elementos interactivos secundarios, etiquetas de tabla, migas de pan y metadatos.
3. `font-semibold` (600): Encabezados, títulos de página, títulos de sección, llamadas a la acción y cifras destacadas.
*(Quedan completamente excluidos `font-bold` [700], `font-extrabold` [800] y `font-black` [900]).*

### Escala de Tamaños (12px - 40px)
- **Display / Hero**: `text-4xl sm:text-5xl` (36px a 48px, `font-semibold`, tracking ajustado). Exclusivo del hero principal de la página de inicio.
- **Título de Página / H1**: `text-2xl sm:text-3xl` (24px a 30px, `font-semibold`). Implementado vía `PageHeader`.
- **Subtítulo / H2**: `text-xl` (20px, `font-semibold`).
- **Encabezados de Tarjetas / H3**: `text-base` (16px, `font-semibold`).
- **Cuerpo de Texto / Body**: `text-sm` (14px, `font-normal`, interlineado 1.5).
- **Metadatos y Etiquetas / Caption**: `text-xs` (12px, `font-medium` o `font-normal`).
*(Quedan prohibidos tamaños arbitrarios como `text-[10px]` o `text-[11px]`).*

### Formato Numérico
- Todos los precios, saldos de cuenta, identificadores UUID abreviados y contadores numéricos utilizan la clase utilitaria `tabular-nums` (`.tabular`) para alinear uniformemente las columnas en tablas y resúmenes.

---

## 4. Espaciado, Forma y Elevación

### Sistema de Espaciado (múltiplos de 4px)
- `gap-1` (4px), `gap-2` (8px), `gap-3` (12px), `gap-4` (16px), `gap-6` (24px), `gap-8` (32px), `gap-12` (48px).
- Contenedores de vista principales: ancho máximo `max-w-6xl` centrado horizontalmente con `px-4 sm:px-6`.

### Radios de Borde (Border Radius)
La asignación de radios es semántica y jerárquica:
- **`rounded-lg` (8px)**: Inputs, selectores, botones y cajas de formulario.
- **`rounded-xl` (12px)**: Tarjetas (`Card`), paneles de contenido, tablas y contenedores de sección.
- **`rounded-2xl` (16px)**: Exclusivo de modales centrados (`Modal`).
- **`rounded-full` (9999px)**: Badges (`Badge`, `StatusBadge`), avatares e indicadores de estado circular.

### Sombras y Elevación
En un tema oscuro profundo, la jerarquía espacial se consigue mediante capas de color (`surface`, `surface-2`, `surface-3`) y bordes nítidos de 1px en `line` (`#24385A`), evitando sombras negras difusas:
- **`shadow-sm`**: Sutil elevación al hacer hover sobre tarjetas clickeables (`hover:shadow-sm`).
- **`shadow-lg`**: Exclusivo para capas flotantes que se superponen a la interfaz: menús desplegables (`NavDropdown`, `UserMenu`), cajón móvil (`MobileMenu`) y diálogos (`Modal`).
*(Las sombras `shadow-md`, `shadow-xl` y `shadow-2xl` han sido eliminadas).*

---

## 5. Movimiento y Animaciones

- **Duraciones**:
  - `150ms`: Microinteracciones inmediatas (hover de enlaces, foco de botón, cambio de color).
  - `200ms`: Transiciones de componentes flotantes (apertura de dropdowns, colapso de acordeón).
  - `250ms`: Entradas de diálogos y drawer móvil (`fade-in`, escala o desplazamiento).
- **Curva Temporal**: `ease-out` en todas las transiciones.
- **Animaciones Infinitas**:
  - Estrictamente restringidas al efecto *shimmer* de carga en `Skeleton` y al giro de `Spinner`.
  - Queda prohibido el uso de `animate-pulse` arbitrario en iconos, footer o textos de advertencia.
- **Accesibilidad Motriz**:
  - Regla `@media (prefers-reduced-motion: reduce)` activa para deshabilitar animaciones complejas en usuarios con sensibilidad vestibular.

---

## 6. Catálogo de Componentes UI Base

| Componente | Cuándo Usarlo | Cuándo NO Usarlo |
| :--- | :--- | :--- |
| **`Button`** | Acciones principales (`primary`), secundarias (`secondary`), de contorno (`outline`), destructivas (`danger`) o fantasma (`ghost`). | Enlaces de navegación entre pantallas (usar `<Link>` o `<NavLink>`). |
| **`Badge`** | Etiquetas semánticas compactas de información, roles o atributos complementarios. | Estados dinámicos de entidades de base de datos (usar `StatusBadge`). |
| **`StatusBadge`** | Mapeo canónico y centralizado de estados del modelo de datos (`order`, `claim`, `seller`, `user`, `product`). | Texto arbitrario o descripciones largas. |
| **`Card`** | Agrupación visual y contenedores de artículos, paneles de configuración y secciones. | Envoltorios redundantes dentro de otro contenedor idéntico. |
| **`PageHeader`** | Encabezado principal superior de todas las vistas con título, descripción opcional, acciones y migas de pan. | Subencabezados internos dentro de tarjetas o modales. |
| **`Input`** | Campos de texto de una sola línea, correos, contraseñas y búsquedas con label accesible o aria-label. | Entradas multilínea (usar `Textarea`) o selección de opciones fijas. |
| **`Select`** | Selección de opciones dentro de un conjunto cerrado (ordenamientos, filtros, categorías). | Formularios donde haya menos de 3 opciones simples (usar radio buttons o Tabs). |
| **`Textarea`** | Entradas de texto extensas, justificaciones de reclamo, motivos de devolución o descripciones de producto. | Campos de entrada simples de una línea. |
| **`Tabs`** | Filtros de navegación por vista o conmutación de paneles de estado en la misma página. | Paginación secuencial de colecciones de datos. |
| **`DataTable`** | Presentación tabular de colecciones en vistas administrativas (usuarios, auditoría, comercios, envíos). | Tarjetas de presentación en catálogos de comercio electrónico. |
| **`Stat`** | Tarjetas KPI de métricas en paneles de administración e informes financieros. | Párrafos descriptivos o bloques de texto no cuantitativo. |
| **`Pagination`** | Navegación paginada accesible con controles de página anterior, siguiente y conteo visual. | Listas infinitas o colecciones con menos de 10 elementos. |
| **`Modal`** | Confirmaciones críticas destructivas (eliminar producto, dictamen arbitral, anular dirección). | Navegación primaria que requiere URL propia indexable. |
| **`EmptyState`** | Pantallas o listados vacíos (sin pedidos, carrito vacío, sin reclamos registrados). | Errores de conexión o caídas del servidor. |
| **`ErrorState`** | Fallos de red o errores de API con botón de reintento conectado a `onRetry`. | Estados normales vacíos o advertencias de validación de campos. |
| **`Skeleton`** | Pantallas de carga previa respetando el espacio del contenido definitivo. | Spinners de botón o peticiones instantáneas (< 100ms). |
| **`Spinner`** | Indicadores de procesamiento dentro de botones activos o carga perezosa de rutas. | Carga de listas completas (usar `Skeleton`). |

---

## 7. Mapeo Canónico de Estados del Negocio (`schema.prisma`)

El componente `StatusBadge` mapea exclusivamente los enums definidos en la base de datos real:

### 1. Estados de Comercios (`SellerStatus`)
- `PENDING` $\rightarrow$ Variante `warning` ("En revisión"). Solicitud de afiliación pendiente de verificación administrativa.
- `ACTIVE` $\rightarrow$ Variante `success` ("Activo"). Comercio acreditado y habilitado para publicar y vender.
- `SUSPENDED` $\rightarrow$ Variante `danger` ("Suspendido"). Acceso comercial revocado temporal o definitivamente por incumplimiento.

### 2. Estados de Usuarios (`UserStatus`)
- `ACTIVE` $\rightarrow$ Variante `success` ("Activo"). Cuenta de usuario habilitada para operar.
- `BLOCKED` $\rightarrow$ Variante `danger` ("Bloqueado"). Cuenta inhabilitada administrativamente con tokens revocados.

### 3. Estados de Pedidos (`OrderStatus` y `SubOrderStatus`)
- `PENDIENTE_PAGO` $\rightarrow$ Variante `warning` ("Pendiente de pago"). Esperando transferencia o pasarela.
- `PAGADO` $\rightarrow$ Variante `info` ("Pagado"). Fondos retenidos bajo custodia TVS.
- `CONFIRMADO` $\rightarrow$ Variante `info` ("Confirmado"). Aceptado por el comercio.
- `EN_PREPARACION` $\rightarrow$ Variante `info` ("En preparación"). Embalaje de mercadería en bodega.
- `DESPACHADO` / `EN_TRANSITO` / `EN_REPARTO` $\rightarrow$ Variante `info` ("En tránsito"). En curso con transportista.
- `ENTREGADO` $\rightarrow$ Variante `success` ("Entregado"). Recibido físicamente por el comprador.
- `FINALIZADO` $\rightarrow$ Variante `success` ("Finalizado"). Custodia liberada al comercio tras conformidad.
- `CANCELADO` / `DEVUELTO` / `REEMBOLSADO` $\rightarrow$ Variante `neutral` ("Cancelado"). Ciclo comercial cerrado.
- `CON_RECLAMO` $\rightarrow$ Variante `warning` ("Con reclamo"). En disputa abierta.

### 4. Estados de Reclamos (`ClaimStatus`)
- `ABIERTO` $\rightarrow$ Variante `warning` ("Abierto"). Disputa iniciada, fondos en custodia congelados.
- `EN_RESPUESTA` $\rightarrow$ Variante `info` ("En respuesta"). Plazo abierto para descargos y pruebas.
- `RESUELTO` $\rightarrow$ Variante `success` ("Resuelto"). Dictamen emitido por soporte arbitral.
- `APELADO` $\rightarrow$ Variante `warning` ("Apelado"). En segunda instancia de revisión.
- `CERRADO` $\rightarrow$ Variante `neutral` ("Cerrado"). Expediente concluido.

### 5. Estados de Productos (`ProductStatus`)
- `DRAFT` $\rightarrow$ Variante `neutral` ("Borrador"). Edición preliminar no publicada.
- `ACTIVE` $\rightarrow$ Variante `success` ("Publicado"). Visible en el catálogo y listo para la compra.
- `PAUSED` $\rightarrow$ Variante `warning` ("Pausado"). Sin stock temporal o pausado por el comercio.
- `REMOVED` $\rightarrow$ Variante `danger` ("Eliminado"). Dado de baja del catálogo.

---

## 8. Reglas de Accesibilidad Implementadas

1. **Enlace de Salto al Contenido ("Skip Link")**:
   - Implementado en [PublicLayout.tsx](file:///C:/Users/USER/Desktop/TVS/TIENDA-VIRTUAL-SEGURA/frontend/src/layouts/PublicLayout.tsx) mediante un enlace accesible posicionado fuera de pantalla que aparece al recibir foco (`sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-50`), dirigiendo al usuario a `<main id="main-content" tabIndex={-1}>`.
2. **Anillo Global de Foco**:
   - Todo elemento interactivo (`<a>`, `<button>`, `<input>`, `<select>`, `<textarea>`) posee un contorno de foco de 2px turquesa (`focus-visible:ring-2 focus-visible:ring-brand focus-visible:ring-offset-2 focus-visible:ring-offset-bg focus-visible:outline-none`) configurable globalmente en [index.css](file:///C:/Users/USER/Desktop/TVS/TIENDA-VIRTUAL-SEGURA/frontend/src/index.css).
3. **Cierre por Teclado (`Escape`) y Clic Exterior**:
   - Implementado en modales (`Modal.tsx`), menús desplegables (`NavDropdown.tsx`, `UserMenu.tsx`), campana de notificaciones (`NotificationBell.tsx`) y cajón móvil (`MobileMenu.tsx`).
4. **Atrapado y Restauración de Foco**:
   - En modales y menú móvil el foco queda confinado al diálogo mientras está visible y retorna automáticamente al elemento disparador cuando se cierra.
5. **Bloqueo del Desplazamiento del Cuerpo**:
   - Al desplegar modales o el menú móvil se aplica `document.body.style.overflow = 'hidden'` para prevenir scroll de fondo no deseado.
6. **Objetivos Táctiles**:
   - Todos los botones, enlaces de navegación e inputs cumplen con el estándar de accesibilidad para objetivos táctiles con un mínimo de **44px de altura** (`min-h-[44px]` o `h-11`).
7. **Semántica de Color**:
   - Ningún estado se comunica únicamente mediante color; todos los indicadores incluyen icono distintivo y texto descriptivo explícito.

---

## 9. Lista de Comprobación para Nuevas Pantallas

Antes de considerar una nueva vista o módulo completado:
- [ ] ¿El encabezado principal utiliza el componente `PageHeader` con título, descripción y migas de pan?
- [ ] ¿Existe únicamente **un botón con acento turquesa primario (`brand`)** por vista?
- [ ] ¿Los precios o cifras numéricas implementan la clase utilitaria `tabular-nums`?
- [ ] ¿Están contemplados los tres estados asíncronos: carga (`Skeleton`), error con reintento (`ErrorState`) y lista vacía (`EmptyState`)?
- [ ] ¿Los campos de formulario usan `Input`, `Select` y `Textarea` con su respectiva etiqueta visible o `aria-label`?
- [ ] ¿Los diálogos críticos de confirmación usan `Modal` con botón de peligro y foco inicial en "Cancelar"?
- [ ] ¿Las imágenes incluyen `loading="lazy"`, `decoding="async"` y dimensiones proporcionales para evitar CLS?
- [ ] ¿Todos los textos están en español correcto con tildes y sin términos en inglés?
- [ ] ¿La compilación TypeScript pasa limpia ejecutando `pnpm exec tsc --noEmit` con 0 errores?
