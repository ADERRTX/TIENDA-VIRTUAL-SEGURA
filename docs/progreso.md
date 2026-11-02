# Progreso del proyecto

Rama de trabajo: jhoel · Sin GitHub Actions · Verificación local con `pnpm verify`.
Entorno: Windows con PowerShell 5.x (sin `&&`).

## Mapeo de nombres originales
| Nombre original | Nombre actual |
|---|---|
| plan_de_funciones_especificas.md | docs/funcional.md |
| plan_de_modelo.md | docs/tecnico.md |
| MODELO DE PRUEBA/Tienda-Virtual-Segura.html | (sin cambios, prototipo visual de solo lectura) |

## Fases
- [x] Fases 0-1: Fundaciones y máquina de estados (Prompt 1)
- [ ] Fase 2: BD, infraestructura, auth y auditoría (Prompt 2)
- [ ] Fase 3 y parte de 4: vendedores, catálogo, archivos, búsqueda, carrito (Prompt 3)
- [ ] Fases 4-6: pedidos, pagos, envíos, tareas programadas (Prompt 4)
- [ ] Fases 7-8: postventa y módulos de apoyo (Prompt 5)
- [ ] Fases 9-10: frontend y endurecimiento (Prompt 6)

## Decisiones
- Sin GitHub Actions (el ADR-005 se escribe en el Prompt 1).
- El prototipo HTML es referencia visual de solo lectura.
- Scripts de utilidad en `.ps1` o Node multiplataforma, no `.sh`.

## Puntos abiertos de la máquina de estados
Ver la sección "Puntos abiertos" de docs/maquina-estados.md (reclamo por no entrega,
cancelación en EN_PREPARACION y destino de REEMPLAZO). Resolver antes de los Prompts 4 y 5.

## Notas por sesión
(El agente añade aquí, al cerrar cada fase: qué se hizo, qué falta y riesgos.)