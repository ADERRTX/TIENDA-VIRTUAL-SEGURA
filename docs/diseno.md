# Sistema de Diseño — Tienda Virtual Segura (TVS)

Este documento describe la arquitectura visual, componentes de interfaz y directrices de diseño para **Tienda Virtual Segura (TVS)**, un marketplace con custodia de pagos simulada (escrow) donde la seguridad informática, la transparencia y la confianza son los ejes fundamentales del producto.

---

## 1. Filosofía de Diseño y Justificación Psicológica

La interfaz de TVS está inspirada en las herramientas SaaS de alta seguridad, terminales financieras y plataformas bancarias modernas. Su propósito no es abrumar con colores estridentes ni elementos decorativos superfluos, sino transmitir solidez, tranquilidad y control absoluto al usuario.

- **Tema Oscuro Marino Profundo (`#0A1020` / `#0F1A2E`)**:
  - Evoca estabilidad, blindaje institucional y rigor técnico.
  - Reduce la fatiga visual durante jornadas prolongadas de administración y supervisión.
- **Acento Único Turquesa (`#2DD4BF` - Brand)**:
  - El turquesa/cian representa seguridad moderna, verificación criptográfica y fluidez operativa.
  - Se utiliza de manera disciplinada: **un único acento visual por pantalla**, guiando la mirada hacia la acción principal (CTA, estado activo o indicador de verificación).
- **Semántica Estricta y Discreta**:
  - Los colores de estado (`success`, `warning`, `danger`, `info`) no se usan como decoración, sino exclusivamente para comunicar el estado real de transacciones, cuentas o paquetes en tránsito.
  - Se aplican en variantes *soft* (12% de opacidad de fondo con texto pleno y borde al 25%) para no competir con el acento de marca.

---

## 2. Tokens de Color y Tabla de Contraste (WCAG AA)

Todos los pares de color han sido auditados matemáticamente contra las directrices de accesibilidad web **WCAG 2.1 nivel AA** (ratio $\ge$ 4.5:1 para texto estándar y $\ge$ 3.0:1 para componentes de UI o texto de gran tamaño):

| Token Semántico | Valor Hexadecimal | Uso Principal | Ratio sobre Fondo | Cumplimiento WCAG |
| :--- | :--- | :--- | :---: | :---: |
| `bg` | `#0A1020` | Fondo base de la aplicación (60% del lienzo) | — | — |
| `surface` | `#0F1A2E` | Tarjetas principales, contenedores, popovers | — | — |
| `surface-2` | `#14233B` | Elementos elevados, campos de entrada, cabeceras | — | — |
| `surface-3` | `#1B2D4A` | Hover de filas en tablas y tarjetas | — | — |
| `line` | `#24385A` | Bordes estructurales de 1px | — | — |
| **`ink`** | `#E8EEF7` | Texto principal, encabezados, cifras | **16.25 : 1** (sobre `bg`) | **AA / AAA** |
| **`ink`** | `#E8EEF7` | Texto principal | **14.91 : 1** (sobre `surface`) | **AA / AAA** |
| **`ink`** | `#E8EEF7` | Texto en campos de formulario | **13.50 : 1** (sobre `surface-2`) | **AA / AAA** |
| **`ink-muted`** | `#9FB0C8` | Texto secundario, descripciones, labels | **7.14 : 1** (sobre `surface-2`) | **AA** |
| **`ink-faint`** | `#6F819C` | Elementos decorativos o texto grande | **4.39 : 1** (sobre `surface`) | **AA (UI/Grande)** |
| **`brand`** | `#2DD4BF` | Acento principal, enlaces activos, botones primarios | **10.18 : 1** (sobre `bg`) | **AA / AAA** |
| **`brand-ink`** | `#04121F` | Texto oscuro sobre botón turquesa pleno | **10.15 : 1** (sobre `brand`) | **AA / AAA** |
| **`success`** | `#4ADE80` | Entrega conforme, pedidos finalizados, comercio activo | **9.98 : 1** (sobre `surface`) | **AA** |
| **`warning`** | `#FBBF24` | Fondos retenidos en custodia, pendientes, disputas | **10.42 : 1** (sobre `surface`) | **AA** |
| **`danger`** | `#F87171` | Rechazos, cuentas bloqueadas, cancelaciones | **6.29 : 1** (sobre `surface`) | **AA** |
| **`info`** | `#60A5FA` | Envíos en tránsito, soporte, guías | **6.84 : 1** (sobre `surface`) | **AA** |

---

## 3. Tipografía

La aplicación utiliza la pila sans-serif del sistema operativo optimizada para rendimiento y nitidez (`ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif`).

### Escala Tipográfica
- **Display / Hero**: 40px a 48px (`text-3xl sm:text-5xl font-black`), tracking ligeramente negativo (`tracking-tight`), interlineado 1.15. Exclusivo de la página de inicio.
- **Títulos de Vista (H1)**: 24px (`text-2xl font-bold sm:font-extrabold`).
- **Títulos de Sección (H2 / H3)**: 16px a 18px (`text-base sm:text-lg font-bold`).
- **Cuerpo Normal (Body)**: 14px (`text-sm font-normal text-ink`), interlineado 1.5.
- **Texto Auxiliar / Labels**: 12px (`text-xs text-ink-muted`).
- **Microtexto / Metadatos**: 10px a 11px (`text-[10px] / text-[11px] uppercase tracking-wider`).

### Precios y Cifras Monetarias
- Se utiliza siempre la clase utilitaria `.tabular` (`font-variant-numeric: tabular-nums`) para evitar el temblor o desalineación de columnas numéricas en tablas, carritos y resúmenes de pedidos.

---

## 4. Espaciado, Forma y Elevación

### Escala de Espaciado (múltiplos de 4px)
- `4px` (`gap-1`), `8px` (`gap-2`), `12px` (`gap-3`), `16px` (`gap-4`), `24px` (`gap-6`), `32px` (`gap-8`), `48px` (`gap-12`).
- Contenedor estándar de vistas: `max-w-6xl` centrado, con padding horizontal `px-4 sm:px-6`.

### Radios de Borde (Border Radius)
- **Inputs, Botones y Selectores**: `8px` (`rounded-lg`), altura estándar táctil de 44px (`min-h-[44px]` o `h-11`).
- **Tarjetas y Paneles**: `12px` (`rounded-xl` / `rounded-2xl`).
- **Modales y Diálogos**: `16px` (`rounded-2xl`).
- **Badges, Chips y Avatares**: `9999px` (`rounded-full`).

### Sombras y Elevación
En entornos de tema oscuro, la elevación se logra principalmente mediante el contraste sutil entre `surface` (`#0F1A2E`), `surface-2` (`#14233B`) y un borde fino de 1px en `line` (`#24385A`), evitando sombras negras artificiales.
- `shadow-sm`: Microelevación en hover de tarjetas.
- `shadow-xl` / `shadow-2xl`: Modales, popover de notificaciones y dropdowns flotantes.

---

## 5. Movimiento y Animaciones

- **Duraciones**:
  - `150ms`: Microinteracciones (cambio de color en botones, foco de inputs).
  - `200ms`: Transiciones de hover en tarjetas (`-translate-y-1`), apertura de menús desplegables.
  - `250ms`: Entradas de modales y drawers laterales (`fade-in`, `slide-up`, `scale-in`).
- **Curva**: `ease-out` en todas las transiciones.
- **Accesibilidad**: `@media (prefers-reduced-motion: reduce)` desactiva animaciones y transiciones de traslación para usuarios con sensibilidad vestibular.

---

## 6. Catálogo de Componentes UI Base

| Componente | Cuándo Usarlo | Cuándo NO Usarlo |
| :--- | :--- | :--- |
| **`Button`** | Acciones principales (`primary`), secundarias (`secondary`), destructivas (`danger`) o sin marco (`ghost`). | Enlaces puros de navegación entre páginas (usar `Link` o `NavLink`). |
| **`Badge`** | Etiquetas semánticas compactas (roles, stock, verificación). | Mensajes extensos de alerta o errores de formulario. |
| **`StatusBadge`** | Mapeo oficial y canónico de estados (pedidos, reclamos, comercios, usuarios). | Etiquetas de texto libre no estandarizadas. |
| **`Card`** | Agrupación visual de contenidos relacionados (artículos, pedidos, paneles). | Como envoltorio innecesario dentro de otro contenedor idéntico. |
| **`Input` / `Select` / `Textarea`** | Captura accesible de datos de usuario con altura de 44px y labels visibles. | Campos ocultos o entradas no interactivas. |
| **`Modal`** | Confirmaciones críticas (cancelar pedido, bloquear usuario, dictamen de mediación). | Contenidos principales de navegación que merecen su propia URL. |
| **`Skeleton`** | Indicador de carga estructural con efecto shimmer mientras llegan datos de la API. | Bloqueos de pantalla completa o peticiones que tardan menos de 100ms. |
| **`EmptyState`** | Pantallas o listados sin elementos (carrito vacío, sin pedidos, sin reclamos). | Estados de error técnico o caídas de servidor. |
| **`ErrorState`** | Fallos de conexión o errores HTTP con botón de reintento (`onRetry`). | Mensajes informativos rutinarios o advertencias de validación. |
| **`PageHeader`** | Encabezado superior de cada vista con título, descripción y migas de pan. | Sub-bloques o encabezados secundarios dentro de una tarjeta. |
| **`Stat`** | Tarjetas KPI de métricas clave con cifras monoespaciadas y variaciones. | Texto descriptivo largo o listas de datos no numéricos. |
| **`Pagination`** | Paginación accesible con conteo numérico ("Página X de Y"). | Listas infinitas o colecciones con menos de 10 elementos. |

---

## 7. Mapeo Canónico de Estados del Negocio

### Estados de Pedidos (`order`)
- `PENDIENTE_PAGO` $\rightarrow$ `warning` (En espera de abono).
- `PAGADO` $\rightarrow$ `info` (Fondos en custodia TVS).
- `CONFIRMADO` $\rightarrow$ `info` (Aceptado por el comercio).
- `EN_PREPARACION` $\rightarrow$ `info` (Embalaje de mercadería).
- `DESPACHADO` / `EN_TRANSITO` / `EN_REPARTO` $\rightarrow$ `info` (En curso con transportista).
- `ENTREGADO` $\rightarrow$ `success` (Paquete recibido por el comprador).
- `FINALIZADO` $\rightarrow$ `success` (Fondos liberados al vendedor tras conformidad).
- `CANCELADO` / `DEVUELTO` / `REEMBOLSADO` $\rightarrow$ `neutral` (Transacción cerrada).

### Estados de Reclamos (`claim`)
- `ABIERTO` $\rightarrow$ `warning` (Controversia ingresada, fondos congelados).
- `EN_RESPUESTA` $\rightarrow$ `info` (Esperando alegatos de comercio o comprador).
- `RESUELTO` $\rightarrow$ `success` (Dictamen oficial emitido por mediación).
- `APELADO` $\rightarrow$ `warning` (Revisión de segunda instancia).
- `CERRADO` $\rightarrow$ `neutral` (Caso concluido).

### Estados de Comercios (`seller`)
- `PENDING` $\rightarrow$ `warning` (Solicitud de afiliación en revisión administrativa).
- `ACTIVE` $\rightarrow$ `success` (Comercio acreditado y habilitado para vender).
- `SUSPENDED` / `REJECTED` $\rightarrow$ `danger` (Acceso comercial revocado).

### Estados de Usuarios (`user`)
- `ACTIVE` $\rightarrow$ `success` (Cuenta operativa).
- `BLOCKED` $\rightarrow$ `danger` (Bloqueo administrativo permanente con revocación de tokens).
- `LOCKED` $\rightarrow$ `warning` (Bloqueo temporal de 15 minutos por reintento de contraseña).

---

## 8. Reglas de Accesibilidad y Teclado

1. **Navegación Secuencial con Tab**: Todos los elementos interactivos cuentan con un contorno de foco de 2px turquesa (`focus-visible:ring-2 focus-visible:ring-brand focus-visible:outline-none`).
2. **Cierre Inmediato con `Escape`**: Modales, menús de usuario, drawer móvil y el popover de notificaciones se cierran de forma instantánea al pulsar la tecla `Esc` o hacer clic fuera del contenedor.
3. **Bloqueo de Scroll**: Al desplegar modales o el drawer lateral en dispositivos móviles, se desactiva el scroll del cuerpo (`overflow: hidden`) para prevenir desorientación visual.
4. **Etiquetas y Roles Semánticos**:
   - Botones de iconos incluyen siempre `aria-label`.
   - Modales y diálogos implementan `role="dialog"` y `aria-modal="true"`.
   - Alertas críticas de error implementan `role="alert"`.

---

## 9. Checklist para Nuevas Pantallas

Antes de declarar una nueva pantalla o módulo listo para producción:
- [ ] ¿Usa `PageHeader` con título, descripción y migas de pan adecuadas?
- [ ] ¿Los botones primarios tienen acento `brand` y solo existe uno prominente por vista?
- [ ] ¿Los precios o cifras numéricas usan la clase `.tabular` (`tabular-nums`)?
- [ ] ¿Se manejan explícitamente los 3 estados: carga (`Skeleton`), error (`ErrorState`) y vacío (`EmptyState`)?
- [ ] ¿Los textos y labels están completamente en español con tildes correctas?
- [ ] ¿No quedan alertas nativas (`alert()`) ni texto plano "Cargando..." desestructurado?
- [ ] ¿El diseño es fluido y legible a 360px (móvil), 768px (tablet) y 1280px (escritorio) sin desbordamiento horizontal?
- [ ] ¿La compilación TypeScript pasa limpia con `pnpm exec tsc --noEmit` (0 errores)?
