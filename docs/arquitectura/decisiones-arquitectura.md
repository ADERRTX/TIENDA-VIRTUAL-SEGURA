# Decisiones de Arquitectura

## ADR-001: Versiones exactas y fecha de verificación
**Estado**: Aceptado
**Fecha**: 2026-10-05

| Tecnología | Versión | Nota |
|---|---|---|
| Node.js | 20.11.0 | LTS, fijado en .nvmrc |
| pnpm | 9.5.1 | packageManager en package.json |
| TypeScript | 5.5.x | strict mode |
| React | 19 | latest stable |
| Vite | 5.x | latest stable |
| NestJS | 11 | latest stable |
| Prisma | 5.x | latest stable |
| PostgreSQL | 17 | latest stable |
| Docker | latest | con tag exacto, no latest |

**Razón**: Evitar breaking changes y garantizar reproducibilidad. Los lockfiles y tags de imagen Docker deben ser exactos.

## ADR-002: Nombres de tablas en inglés
**Estado**: Aceptado
**Fecha**: 2026-10-05

**Decisión**: Todas las tablas y columnas en inglés para coherencia con el código TypeScript.

**Razón**: Los enums y tipos TypeScript usan inglés. Mantener español en la BD generaría fricción. Si el equipo prefiere español, aplicar un ADR y renombrar de forma uniforme.

## ADR-003: Compatibilidad Zod
**Estado**: Aceptado
**Fecha**: 2026-10-05

**Decisión**: Usar Zod 3 en todo el monorepo. Verificar que `@hookform/resolvers` y `nestjs-zod` comparten major con Zod 3. Si no, migrar a Zod 3.

**Razón**: Zod 3 es el estándar de facto. Compatibilidad entre librerías es crítica para validación compartida.

## ADR-004: Prototipo HTML como referencia visual
**Estado**: Aceptado
**Fecha**: 2026-10-05

**Decisión**: `MODELO DE PRUEBA/Tienda-Virtual-Segura.html` es un prototipo visual de solo lectura. No se edita, mueve, copia al frontend ni entra en el build.

**Razón**: Sirve como referencia visual y punto de partida para el diseño, pero no implementa reglas de negocio. Los documentos (funcional.md, tecnico.md) tienen prioridad.

## ADR-005: Sin GitHub Actions
**Estado**: Aceptado
**Fecha**: 2026-10-05

**Decisión**: No usar GitHub Actions. La verificación se hace local con Husky + scripts pnpm.

**Razón**: Proyecto académico. Simplifica el flujo de trabajo y evita dependencia de GitHub. Los escaneos de seguridad externos (Semgrep, Trivy, etc.) son optionales y se ejecutan con el script `scripts/security-scan.mjs`.

## ADR-006: Entorno Windows/PowerShell
**Estado**: Aceptado
**Fecha**: 2026-10-05

**Decisión**: Scripts de utilidad en `.ps1` o Node multiplataforma (`.mjs`). No usar `.sh`.

**Razón**: El entorno es Windows con PowerShell 5.x. Los scripts `.sh` no son nativos. Los scripts Node son multiplataforma y se invocan con `pnpm run`.