# Mejoras a partir de las pruebas de usabilidad

Fecha de implementación: 10 de noviembre de 2026.

Tres estudiantes sin experiencia previa respondieron diez afirmaciones en escala de 1 a 5 y preguntas abiertas. El promedio global fue 4,67/5. Esta media describe el cuestionario empleado, no una puntuación SUS. La satisfacción y la organización visual promediaron 4/5. No se ha realizado una segunda prueba con participantes tras estos cambios.

| Participante | Observación | Cambio implementado | Evidencia técnica |
|---|---|---|---|
| U1 | Esperaba realizar la evaluación final y no comprendía el requisito de completar las cuatro rutas | Estado bloqueado visible en la navegación. Lista con teoría y práctica pendientes por algoritmo, enlaces a la actividad pendiente y botón que se habilita automáticamente | Bloqueo, cuatro requisitos por módulo y desbloqueo comprobados en pruebas y Edge |
| U2 | Un ejercicio por algoritmo resultaba insuficiente. Solicitó explicación del paso a paso | Tres ejercicios por algoritmo, doce en total. Navegación entre ejercicios, registro de intentos y solución de tres pasos después de responder. Visualizador con valores, posiciones y motivo de cada decisión | Doce respuestas y sus soluciones comprobadas en Edge. Soluciones ocultas antes de responder verificadas por API |
| U3 | Sugirió cambiar colores para facilitar la lectura | Texto secundario y púrpura más oscuros. Bordes de controles más visibles, estado deshabilitado legible y selección identificada por borde y texto además del color | Lectura de colores en navegador, capturas y revisión móvil de 390 píxeles. No equivale a una auditoría completa de accesibilidad |

## Condiciones conservadas

La evaluación final requiere diagnóstico completo, teoría consultada y al menos un ejercicio respondido de cada algoritmo. Los ejercicios adicionales permiten reforzar y repetir la práctica sin invalidar el progreso anterior. Se mantienen los identificadores de las preguntas originales y los intentos guardados. Las seis preguntas de cada evaluación no cambian.

Las soluciones se entregan únicamente después de enviar una respuesta al servidor. El cliente no recibe las soluciones al consultar el banco de preguntas.

## Verificación y capturas

Ejecutar `npm test` para algoritmos, integración y regresiones. Ejecutar `node scripts/usability-browser-test.mjs` para el recorrido en Microsoft Edge con una base independiente en memoria. El segundo comando comprueba las doce prácticas, soluciones, evaluación final, progreso persistido, explicaciones y ausencia de desbordamiento en móvil. Guarda las siguientes capturas en `test-results/usability`:

- `01-final-bloqueada.png`: requisitos pendientes.
- `02-tres-ejercicios.png`: selección de ejercicios.
- `03-solucion-guiada.png`: explicación de la respuesta.
- `04-final-habilitada.png`: evaluación disponible.
- `05-explicacion-visual.png`: decisión con valores reales.
- `06-movil.png`: catálogo y requisitos en móvil.

Las capturas anteriores de la versión inicial permanecen en `docs/evidencias/msedge`. Las comparaciones muestran implementación, no una mejora cuantificada de satisfacción. Una nueva evaluación con usuarios debe comprobar si resuelven las dificultades reportadas.
