# Revisión técnica de prototipos

Fecha: 14 de octubre de 2026. Acceso al archivo confirmado con la cuenta autorizada. Revisión técnica realizada; aprobación del docente y validación con estudiantes pendientes.

| Pantalla de Figma | Nodo | Requisitos | Adaptación implementada |
|---|---|---|---|
| Inicio con ingreso de nombre | 1:309 | RF-01 | Validación del nombre, creación de sesión y continuación |
| Selección de algoritmos | 1:2 | RF-03 | Filtros y avance real de módulos practicados |
| Contenido educativo | 1:466 | RF-04 | Contenido específico para los cuatro algoritmos |
| Visualización paso a paso | 1:748 | RF-05, RF-06 | Estados calculados, controles, velocidad y datos personalizados |
| Ejercicios prácticos | 1:1035 | RF-07 | Pregunta por algoritmo y respuesta validada |
| Evaluación diagnóstica | 1:1222 | RF-02, RF-09 | Plantilla reutilizada para diagnóstico y final, con bancos separados |
| Retroalimentación didáctica | 1:1454 | RF-08 | Correcto e incorrecto según respuesta real |
| Resultados y comparación | 1:1690 | RF-10, RF-11 | Porcentajes reales y variación en puntos porcentuales |

## Hallazgos y decisiones

1. El inicio menciona Selección aunque los requisitos especifican Merge Sort. Se muestra Mezcla para mantener el alcance.
2. El ejemplo de resultados presenta 90 puntos con 5 aciertos de 6. Se calcula la puntuación real: 83,33 % en ese caso.
3. El diagnóstico contiene una pista que revela la respuesta. Se reemplazó por una indicación neutral para no condicionar la medición inicial.
4. El archivo no presenta un marco separado para evaluación final. Se reutiliza la estructura de evaluación con título, preguntas y precondiciones específicas.
5. Los mockups contienen valores estáticos de nombre, nivel, experiencia, tiempo y certificación. Se muestran nombre, progreso y resultados reales; no se emiten certificados ni reconocimientos sin criterio definido.
6. La complejidad espacial de Quick Sort se aclara: O(log n) promedio y O(n) en el peor caso para la pila de esta versión recursiva.
7. El diseño de 1280 píxeles se adapta a 390 píxeles mediante tarjetas en una columna y controles ajustados.
8. El resumen se puede imprimir o guardar como PDF mediante el diálogo del navegador.
9. Se evita repetir la evaluación diagnóstica dentro de una sesión para preservar la referencia inicial. Los ejercicios se pueden repetir; cambiar de estudiante crea una nueva sesión.
10. El prototipo no muestra un formulario de acceso con contraseña, en concordancia con RF-01.

## Recursos y verificación

Fuentes Plus Jakarta Sans y JetBrains Mono descargadas para uso local. Imágenes y SVG obtenidos del contexto de Figma, sin dependencias de sus URL temporales en ejecución. Se revisaron las capturas de escritorio y móvil generadas durante el recorrido de Edge. La adaptación funcional no constituye una certificación de igualdad píxel a píxel.

Referencias: [Figma](https://www.figma.com/design/NaqdYDmO3qemgFLxjEBolH/Firmes-por-la-vida?node-id=0-1), [evidencias Edge](evidencias/msedge/summary.json).
