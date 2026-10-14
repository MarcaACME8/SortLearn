# Segundo entregable de SortLearn

## Ejecución del software educativo de algoritmos de ordenamiento

Periodo académico: 2026-2. Periodo previsto de ejecución: 5 de octubre al 2 de noviembre de 2026. Fecha de corte: 14 de octubre de 2026.

Este entregable presenta el desarrollo de una versión funcional del software educativo, las iteraciones realizadas, la revisión técnica de los prototipos y el plan de pruebas. El sistema permite iniciar una sesión por nombre, realizar una evaluación diagnóstica, estudiar y practicar cuatro algoritmos de ordenamiento, realizar una evaluación final y comparar ambos resultados.

La implementación corresponde a una versión local de desarrollo. La validación pedagógica con estudiantes y la aprobación del docente se registrarán después de realizarse; no se presentan como actividades terminadas.

## Desarrollo e iteraciones

El trabajo se organizó en una carpeta independiente. La interfaz se implementó con HTML, CSS y módulos JavaScript; el servidor utiliza Node.js y expone una API para las sesiones, contenidos, ejercicios y evaluaciones. Los datos se conservan en tablas PostgreSQL.

El motor de ordenamiento produce una secuencia de estados independientes. Esto permite avanzar y retroceder sin alterar los estados anteriores. Se incorporaron reproducción automática, pausa, reinicio, velocidad y entrada de números. En Merge Sort se explica que la memoria auxiliar conserva los datos mientras se copian los elementos a la lista visible.

Las respuestas correctas y las explicaciones de los ejercicios se evalúan en el servidor. El cliente recibe las preguntas y las opciones, pero no las respuestas correctas de las evaluaciones. El identificador de sesión se conserva en una cookie, y las evaluaciones y los intentos se asocian con esa sesión.

### Cronograma previsto

| Periodo | Actividad prevista | Evidencia esperada |
|---|---|---|
| 5 al 11 de octubre | Revisión de requisitos, arquitectura y prototipos | Matriz de revisión y alcance |
| 12 al 18 de octubre | Sesión, diagnóstico y contenidos | Módulos funcionales y registros de prueba |
| 19 al 25 de octubre | Visualizaciones, controles, ejercicios y retroalimentación | Capturas, pruebas del motor e integración |
| 26 de octubre al 2 de noviembre | Evaluación final, comparación, validación y correcciones | Resultados de prueba y observaciones de revisión |

Estas fechas son planificación. La bitácora siguiente registra únicamente lo realizado el 14 de octubre; no atribuye actividades a días anteriores.

### Iteraciones realizadas

| Iteración | Fecha real | Desarrollo | Verificación |
|---|---|---|---|
| I-01 | 14 de octubre | Estructura independiente y motor de los cuatro algoritmos | Seis pruebas del motor |
| I-02 | 14 de octubre | Lectura de ocho pantallas de Figma, recursos y estilos | Revisión visual de referencias |
| I-03 | 14 de octubre | API, modelo relacional, sesiones, preguntas y resultados | Ocho escenarios de integración |
| I-04 | 14 de octubre | Recorrido web completo, controles y guardado de respuestas | Recorrido automatizado en Edge |
| I-05 | 14 de octubre | Correcciones de rutas Windows, botón final, codificación y móvil | Repetición del recorrido y capturas |

### Decisión sobre el almacenamiento

Se intentó preparar una instancia independiente de PostgreSQL 18. Windows bloqueó el ejecutable inicializador mediante una directiva de Control de aplicaciones. Para disponer de una versión ejecutable se incorporó PGlite, que permite ejecutar PostgreSQL embebido y persistir sus datos en archivos locales. La conexión a PostgreSQL convencional se conserva como opción mediante `DATABASE_URL`.

La aplicación mantiene la separación navegador → servidor → base de datos. La validación de esta iteración corresponde al modo embebido; no acredita una prueba sobre el servicio PostgreSQL convencional.

### Alcance implementado por requisito

| Requisito | Comportamiento implementado | Evidencia |
|---|---|---|
| RF-01 | Nombre obligatorio, identificador de sesión y aislamiento entre estudiantes | Inicio, API y pruebas |
| RF-02 | Seis preguntas diagnósticas; validación y conservación del resultado | Diagnóstico y prueba integrada |
| RF-03 | Catálogo de cuatro algoritmos con filtros | Catálogo |
| RF-04 | Explicaciones, analogías, reglas, ejemplos y complejidad | Contenidos |
| RF-05 | Estados paso a paso para los cuatro algoritmos | Motor y visualizador |
| RF-06 | Avanzar, retroceder, pausar, reiniciar y ajustar velocidad | Pruebas de controles |
| RF-07 | Un ejercicio por algoritmo y registro de intentos | Ejercicios |
| RF-08 | Resultado correcto o incorrecto con explicación | API y retroalimentación |
| RF-09 | Evaluación final tras diagnóstico y práctica de cuatro módulos | Validación de precondiciones |
| RF-10 | Consulta de resultados disponibles y estados pendientes | Resultados |
| RF-11 | Diferencia entre porcentajes diagnóstico y final | Comparación de +50 pp en sesión QA |

## Revisión de prototipos

Se revisaron los ocho marcos del archivo de Figma. Se conservaron la paleta azul, fondos claros, tarjetas, tipografías, recursos gráficos y organización general del recorrido. Se adaptaron los diseños para datos variables y pantallas pequeñas.

La [matriz de prototipos](prototipos.md) identifica los nodos y ajustes. Entre los cambios funcionales se encuentran el uso de un nombre real, progreso calculado, resultados consistentes, una evaluación final diferenciada y bloqueo del acceso prematuro. La interfaz no copia certificados, experiencia ni tiempos ficticios de los ejemplos.

## Plan y casos de prueba

El [plan de pruebas](pruebas.md) describe alcance, condiciones, pasos, resultados esperados y estado de ejecución. Se cubren pruebas unitarias, integración con la base de datos y recorrido en navegador. Las pruebas de usabilidad y aceptación requieren participantes reales y permanecen pendientes.

### Resultados comprobados

El ejecutor Node reportó 15 pruebas aprobadas: seis pruebas del motor, ocho escenarios de integración y la prueba contenedora del recorrido integrado. Se verificaron entradas vacías, duplicados, negativos, decimales, inmutabilidad de los estados, controles y límites.

La prueba de Edge recorrió el diagnóstico, los cuatro algoritmos y sus ejercicios, la evaluación final y los resultados. Una sesión QA obtuvo 3 de 6 respuestas correctas en el diagnóstico y 6 de 6 en el final. La aplicación mostró 50 %, 100 % y una variación de +50 puntos porcentuales. Se recargó la página y se conservaron los resultados.

Se comprobó pausa estable, avance, retroceso, ingreso de números, filtros y ausencia de desbordamiento horizontal en el catálogo y el visualizador a 390 píxeles. Esta ejecución no sustituye una prueba de usabilidad con estudiantes.

### Incidencias y correcciones

| ID | Hallazgo | Corrección o decisión | Estado |
|---|---|---|---|
| INC-01 | Figma no permitía acceder con las cuentas iniciales | Reconexión con cuenta autorizada | Resuelto |
| INC-02 | Windows bloqueó el inicializador PostgreSQL | Modo embebido y adaptador para servicio externo | Modo local operativo; servicio pendiente |
| INC-03 | Rutas de recursos rechazadas por separadores Windows | Normalización de la carpeta pública | Resuelto |
| INC-04 | Botón final deshabilitado tras guardar la última respuesta | Liberar estado de guardado antes de reconstruir la vista | Resuelto |
| INC-05 | Reescritura de JavaScript alteró caracteres españoles | Restaurar UTF-8 y lecturas con codificación explícita | Resuelto |
| INC-06 | Controles del visualizador excedían el ancho móvil | Ajuste de rejilla, espaciado y controles | Resuelto |
| INC-07 | Faltaban recursos específicos del catálogo | Descargar y vincular los originales del marco correspondiente | Resuelto |

## Actividades pendientes hasta el cierre

Realizar una revisión con estudiantes, registrar observaciones y corregir dificultades de comprensión. Ejecutar la aceptación en Google Chrome, documentar la comprobación adicional de Firefox y medir las acciones principales con las condiciones de rendimiento acordadas. Verificar la conexión con PostgreSQL como servicio cuando el entorno permita iniciarlo o se facilite una base existente. Revisar con el docente el banco de preguntas y la equivalencia de dificultad entre diagnóstico y final.

## Evidencias y fuentes

- [Guía de ejecución](../README.md).
- [Plan de pruebas](pruebas.md).
- [Bitácora de ejecución](ejecucion.md).
- [Revisión de prototipos](prototipos.md).
- [Resumen del recorrido en Edge](evidencias/msedge/summary.json).
- [Inicio](evidencias/msedge/01-inicio.png), [catálogo](evidencias/msedge/03-catalogo.png), [visualizador](evidencias/msedge/05-visualizador.png) y [resultados](evidencias/msedge/08-resultados.png).
- [Mockups en Figma](https://www.figma.com/design/NaqdYDmO3qemgFLxjEBolH/Firmes-por-la-vida?node-id=0-1).
- [Documentación oficial de PGlite](https://pglite.dev/docs/api).
