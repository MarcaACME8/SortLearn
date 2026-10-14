# Plan y casos de prueba

## Objetivo y alcance

Verificar los requisitos RF-01 a RF-11 y RNF-01 a RNF-03. Separar pruebas del motor, integración con PostgreSQL y pruebas de extremo a extremo. La aprobación de pruebas unitarias no acredita el cumplimiento completo de un requisito de interfaz.

Entorno actual: Node.js en Windows para pruebas unitarias. Entorno previsto de aceptación: aplicación y PostgreSQL con datos de prueba, en Chrome, Edge y Firefox; registrar versiones, equipo y conexión reales al ejecutar.

Responsables: equipo de desarrollo para ejecución y registro; docente y estudiantes participantes para revisión educativa y usabilidad, sujetos a coordinación.

Criterio de entrada: módulo ejecutable y datos de prueba identificados.
Criterio de salida: casos críticos aprobados, sin fallos que impidan el recorrido educativo, evidencia de rendimiento de hasta tres segundos para acciones principales y compatibilidad en los tres navegadores.

## Casos funcionales planificados

La matriz define los casos de aceptación. Su estado y evidencia se registran al final; una comprobación parcial no equivale a aprobación completa.

| ID | Requisito | Precondición y pasos | Resultado esperado |
|---|---|---|---|
| CP-01 | RF-01 | Sin sesión; ingresar Ana y continuar | Sesión con identificador propio y nombre asociado |
| CP-02 | RF-01 | Sin sesión; enviar nombre vacío o espacios | Mensaje obligatorio; no crear sesión |
| CP-03 | RF-02 | Sesión activa; responder diagnóstico y finalizar | Calificación correcta conservada en la sesión |
| CP-04 | RF-02 | Dejar pregunta obligatoria sin responder y finalizar | Solicitar completar; no cerrar evaluación |
| CP-05 | RF-03, RF-04 | Abrir catálogo y cada algoritmo | Cuatro algoritmos con explicación y ejemplo correspondiente |
| CP-06 | RF-05 | Ejecutar cada algoritmo sobre 3,1,2 | Mostrar pasos reales y terminar en 1,2,3 |
| CP-07 | RF-06 | Avanzar, retroceder, pausar, esperar y reiniciar | Estado anterior correcto; pausa estable; restaurar inicio |
| CP-08 | RF-06 | Retroceder en inicio y avanzar al final | Mantener los estados límite |
| CP-09 | RF-07, RF-08 | Abrir contenido y ejercicio; responder correcta e incorrectamente | Guardar cada intento y explicar el resultado |
| CP-10 | RF-07 | Confirmar ejercicio sin respuesta | Solicitar una respuesta |
| CP-11 | RF-09 | Intentar final sin diagnóstico; luego completar recorrido y final | Impedir acceso prematuro; guardar final válido |
| CP-12 | RF-09 | Intentar finalizar con preguntas pendientes | Conservar respuestas y solicitar completar |
| CP-13 | RF-10 | Consultar con solo diagnóstico, luego con ambas evaluaciones | Mostrar disponibles; señalar evaluación aún no realizada |
| CP-14 | RF-11 | Diagnóstico 3/6 (50%), final 6/6 (100%); comparar | Mostrar aumento de 50 puntos porcentuales |
| CP-15 | RF-11 | Probar resultados iguales, disminución y final ausente | Mostrar 0, diferencia negativa o comparación pendiente |
| CP-16 | RF-01, RF-10 | Crear dos sesiones distintas y consultar resultados | No mezclar actividades ni resultados |
| CP-17 | RF-02, RF-09 | Guardar evaluación, recargar y consultar | Recuperar resultado persistido sin duplicación |
| CP-18 | RF-01, RF-08 | Simular fallo del servidor al guardar sesión o ejercicio | Informar error y permitir reintentar sin falso éxito |

## Casos no funcionales

| ID | Requisito | Procedimiento | Criterio |
|---|---|---|---|
| CP-19 | RNF-01 | Estudiantes realizan recorrido sin capacitación; registrar ayudas y dificultades | Acceso comprensible a contenidos, controles y evaluaciones; revisar obstáculos observados |
| CP-20 | RNF-02 | Medir carga de contenido, inicio, avance y ejercicios; registrar condiciones y repeticiones | Cada acción medida tarda como máximo 3 segundos en condiciones normales definidas |
| CP-21 | RNF-03 | Repetir recorrido en Chrome, Edge y Firefox | Todas las funciones educativas disponibles en cada navegador |

## Pruebas automatizadas del motor

Ejecutar `npm test`. Se comprueban los cuatro algoritmos con entradas vacías, unitarias, ordenadas, invertidas, duplicadas, negativas y decimales; 29 conjuntos deterministas adicionales por algoritmo; entrada intacta e instantáneas independientes. Se comprueban índices, entradas inválidas y límites de navegación.

## Registro de ejecución

Para cada caso guardar fecha, versión del código, entorno, datos utilizados, resultado obtenido, aprobado o fallido, evidencia e incidencia relacionada. Los casos sin evidencia se mantienen pendientes. El resultado automatizado de la iteración se registra en [resultado-motor.txt](resultado-motor.txt).



## Estado de ejecución al 14 de octubre de 2026

Entorno comprobado: Windows, Node.js 24.19.0, PostgreSQL embebido con PGlite y Microsoft Edge automatizado. La versión exacta de Edge se registra en el resumen del navegador. Ventanas de 1280 × 900 y 390 × 844 píxeles. Servidor en localhost; no se usó una red de producción.

| Caso | Estado | Resultado y alcance de evidencia |
|---|---|---|
| CP-01 | Aprobado | Creación de sesión y recorrido con nombre mediante API e interfaz |
| CP-02 | Aprobado | Vacío, espacios y longitud inválida rechazados; mensaje visible para vacío |
| CP-03 | Aprobado | Diagnóstico 3/6 en navegador y 6/6 en integración; guardado correcto |
| CP-04 | Parcial | API rechaza diagnóstico incompleto; revisión específica del mensaje UI pendiente |
| CP-05 | Aprobado | Cuatro módulos abiertos y filtros del catálogo comprobados |
| CP-06 | Parcial | Resultado de los cuatro motores verificado; vista inicial de los cuatro comprobada, recorrido visual hasta el último paso de cada uno pendiente |
| CP-07 | Aprobado | Avance, retroceso y pausa comprobados en navegador; reinicio comprobado en motor |
| CP-08 | Aprobado en motor | Estados límite verificados automáticamente |
| CP-09 | Aprobado | Respuestas correctas e incorrectas y explicaciones comprobadas en API; cuatro respuestas correctas en UI |
| CP-10 | Pendiente | Hay validación implementada; falta ejecutar el caso UI sin selección |
| CP-11 | Aprobado | Acceso prematuro rechazado por API; final completado tras recorrer los cuatro módulos |
| CP-12 | Parcial | API rechaza final incompleto; revisión específica del mensaje UI pendiente |
| CP-13 | Aprobado | Vistas con diagnóstico solamente y con ambas evaluaciones |
| CP-14 | Aprobado | 50 % inicial, 100 % final y +50 puntos porcentuales |
| CP-15 | Parcial | Final pendiente comprobado; disminución creada por integración; presentación de igualdad y disminución pendiente |
| CP-16 | Aprobado | Dos sesiones mantienen resultados independientes |
| CP-17 | Aprobado | Resultados conservados al recargar; envíos simultáneos no duplican evaluaciones |
| CP-18 | Pendiente | Falta simulación de caída del servidor durante guardado |
| CP-19 | Pendiente | Requiere estudiantes participantes y registro de observación |
| CP-20 | Pendiente | Falta protocolo de medición acordado y ejecución de rendimiento |
| CP-21 | Parcial | Recorrido Edge aprobado; Chrome y Firefox pendientes |

Evidencias: [salida automatizada](resultado-pruebas.txt), [script de integración](../tests/integration.test.js), [script de navegador](../scripts/browser-test.mjs) y [resumen Edge](evidencias/msedge/summary.json).

La descarga del navegador de pruebas Firefox se interrumpió al reiniciarse el entorno. No se declara aprobada su compatibilidad. El cumplimiento total de los requisitos no funcionales queda pendiente de sus pruebas de aceptación.
