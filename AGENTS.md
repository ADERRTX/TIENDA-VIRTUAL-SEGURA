# Tienda Virtual Segura: reglas para agentes

## Qué es
Marketplace académico seguro. Pagos y envíos SIMULADOS. Monolito modular TypeScript:
React 19 + Vite (frontend/), NestJS 11 + Prisma + PostgreSQL (backend/), paquete compartido shared/.
Fuente de verdad: docs/funcional.md, docs/tecnico.md, docs/maquina-estados.md.
Si algo contradice esos documentos, DETENTE y pregunta.

## Prototipo visual
"MODELO DE PRUEBA/Tienda-Virtual-Segura.html" es solo un prototipo visual de SOLO LECTURA.
No se edita, no se mueve, no se copia al frontend ni entra al build. Si contradice
docs/funcional.md o docs/tecnico.md, mandan los docs.

## Entorno de trabajo
- Sistema: Windows con PowerShell 5.x. NO uses `&&` en comandos: usa una instrucción por línea
  o `;`. Los scripts de utilidad deben ser `.ps1` o scripts Node multiplataforma invocados por pnpm
  (no `.sh`).
- Rama de trabajo: jhoel. No cambies de rama, no hagas push, merge ni rebase.
- No se usa GitHub Actions. No crees .github/. La verificación es local.
- Commits pequeños por bloque, Conventional Commits en inglés. Nunca --no-verify.

## Comandos (no adivines otros)
- Instalar: `pnpm install`
- Servicios de apoyo: `docker compose up -d db storage mailpit`
- Migrar: `pnpm --filter backend prisma migrate dev` + SQL manual en database/sql
- Lint/tipos: `pnpm lint` y `pnpm typecheck`
- Tests: `pnpm test` (unit), `pnpm test:int` (Testcontainers), `pnpm test:e2e`
- Verificación local: `pnpm verify` (lint + typecheck + test); `pnpm verify:full` (completa)
- Escaneo de seguridad local: `pnpm security:scan`
- Seeds: `pnpm db:seed`

## Reglas no negociables
1. El cliente NUNCA envía precios, totales, estados ni IDs de propietario.
2. Los estados solo cambian por la máquina de estados (backend/src/modules/orders/state-machine).
   No existe endpoint que reciba "el nuevo estado".
3. Dinero en enteros (céntimos, BIGINT, PEN). Nunca float.
4. Cada endpoint valida: sesión, rol, propiedad del recurso, estado permitido y entrada (Zod strict).
5. Recursos ajenos responden 404, no 403.
6. Todo cambio sensible escribe auditoría en la MISMA transacción.
7. Controladores delgados; reglas en servicios; solo repositorios usan Prisma.
8. Un módulo no consulta tablas de otro: usa su fachada o eventos (outbox).
9. Estados, roles y motivos viven en shared/enums; nunca cadenas sueltas.
10. Cero secretos en código. Variables validadas con Zod al arrancar.
11. Archivos ≤ 300 líneas, funciones ≤ 40.
12. Textos de UI en español (es-PE); código, commits y nombres técnicos en inglés.
13. El tiempo se obtiene del servicio Clock, nunca de new Date() en reglas de plazos.

## Prohibido
- `git push`, `git reset --hard`, borrar migraciones ya aplicadas, editar `.env*`.
- Añadir dependencias sin justificarlas en un ADR.
- Desactivar lint, tests, reglas de seguridad o CSP para "hacer pasar" algo.
- Usar `latest` en imágenes o versiones sin fijar.
- Cambiar reglas funcionales: si hace falta, proponer cambio en docs primero.

## Definición de terminado
Compila; lint y tipos en verde; pruebas nuevas (felices + de abuso) en verde; auditoría añadida si
es sensible; docs/OpenAPI actualizados; sin secretos; resumen de qué cambió y cómo verificarlo.

## Forma de trabajar
Planifica antes de editar, cambios pequeños por módulo, pruebas primero en state-machine, pagos y
permisos. Termina cada tarea con: archivos tocados, comandos ejecutados, resultados y riesgos.
Actualiza docs/progreso.md al cerrar cada fase.