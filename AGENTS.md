# Tienda Virtual Segura: reglas para agentes

## Qué es
Marketplace académico seguro. Pagos y envíos SIMULADOS. Monolito TypeScript:
NestJS 11 + Prisma + PostgreSQL (backend/). El frontend se construirá después.
Fuente de verdad: docs/funcional.md, docs/tecnico.md, docs/maquina-estados.md.
Si algo contradice esos documentos, DETENTE y pregunta.

## Prototipo visual
"MODELO DE PRUEBA/Tienda-Virtual-Segura.html" es solo un prototipo visual de SOLO LECTURA.
No se edita, no se mueve, no se copia al frontend ni entra al build. Si contradice
los docs, mandan los docs.

## Entorno de trabajo
- Sistema: Windows con PowerShell 5.x. NO uses `&&`, `grep`, `cat`, `ls -la`, `head`, `tail`,
  ni `rm -rf`. Usa `;`, `Select-String`, `Get-Content`, `Get-ChildItem`, `Remove-Item -Recurse -Force`.
- Rama de trabajo: jhoel. No hagas push, merge ni rebase.
- No se usa GitHub Actions. No crees .github/. La verificación es local.
- Commits pequeños por bloque, Conventional Commits en inglés. Nunca --no-verify.

## Comandos
- Instalar: `pnpm install` (en backend/)
- Servicios de apoyo: `pnpm db:up` (docker compose: solo PostgreSQL)
- Migrar: `pnpm db:migrate`
- Seed: `pnpm db:seed`
- Reset: `pnpm db:reset`
- Dev: `pnpm dev`
- Tests: `pnpm test`

## Reglas no negociables
1. El cliente NUNCA envía precios, totales, estados ni IDs de propietario.
2. Los estados solo cambian por la máquina de estados (un único archivo). No existe
   endpoint que reciba "el nuevo estado".
3. Dinero en enteros (céntimos, Int). Nunca float.
4. Cada endpoint valida: sesión, rol, propiedad del recurso, estado permitido y entrada (Zod).
5. Recursos ajenos responden 404, no 403.
6. Todo cambio sensible escribe auditoría en la MISMA transacción.
7. Controladores delgados; reglas en servicios; solo repositorios usan Prisma.
8. Estados, roles y motivos viven en un único archivo de constantes; nunca cadenas sueltas.
9. Cero secretos en código. Variables validadas con Zod al arrancar.
10. Archivos ≤ 300 líneas, funciones ≤ 40.
11. Textos de UI/errores en español (es-PE); código, commits y nombres técnicos en inglés.
12. El tiempo se obtiene del servicio Clock inyectable, nunca de `new Date()` en reglas de plazos.

## Prohibido
- `git push`, `git reset --hard`, borrar migraciones ya aplicadas, editar `.env` reales.
- Añadir dependencias que no sean necesarias para el sistema.
- Desactivar lint o tests para "hacer pasar" algo.
- Usar `latest` en imágenes o versiones sin fijar.
- Cambiar reglas funcionales: si hace falta, proponer cambio en docs primero.

## Definición de terminado
Compila; pruebas nuevas (felices + de abuso) en verde; auditoría añadida si es sensible;
sin secretos; resumen de qué cambió y cómo verificarlo.

## Forma de trabajar
Planifica antes de editar, cambios pequeños por módulo, pruebas primero en máquina de
estados, pagos y permisos. Termina cada tarea con: archivos tocados, comandos ejecutados,
resultados y riesgos. Actualiza docs/progreso.md al cerrar cada fase.
