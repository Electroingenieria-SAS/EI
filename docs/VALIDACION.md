# Validación de la primera entrega

## Comprobado durante la preparación

- Análisis sintáctico de los archivos JavaScript propios.
- 12 pruebas de reglas ejecutadas en un runtime JavaScript: todas aprobadas.
- Creación del catálogo de arte con un contexto Canvas simulado: 131 texturas registradas.
- Accesibilidad de todos los NPC, criaturas y objetos de misión mediante búsqueda de rutas desde la aldea.
- Accesibilidad del guardián, altar y salida del santuario.
- Bloqueo del río, paso por el puente y prevención de atravesar obstáculos con movimientos grandes.
- Persistencia y sanitización de inventario, compañeros, runas y progreso.

El contexto Canvas simulado verifica la ejecución del generador; no sustituye una inspección visual de los dibujos.

## Pruebas de navegador incluidas

tests/browser/adventure.spec.cjs incluye:
1. Arranque, movimiento, mapa, guardado y recarga.
2. Diálogo inicial, captura, curación, cambio de compañero, runas, santuario, guardián y recarga.
3. Ajuste del lienzo a una pantalla estrecha.

La ruta entre objetivos se acelera con teletransporte en esas pruebas. La conectividad real del mapa se comprueba en tests/core.test.cjs. La inspección de tacto real, audio y calidad artística requiere una revisión humana.

Consulta GitHub Actions para el resultado de la ejecución de navegador. No se considera aprobada hasta que su ejecución termine correctamente.

## Límites deliberados de v0.1

- Una misión principal; dos mapas.
- Tres especies capturables; un guardián.
- Las casas del pueblo son exteriores.
- Experiencia acumulativa; no hay niveles ni evolución.
- Guardado de una partida por navegador; sin cuenta ni sincronización.
- Sin soporte específico para mando.
- Sin importación Tiled ni editor visual.
- Balance inicial, pendiente de auditoría de juego.
