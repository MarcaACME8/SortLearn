# SortLearn

Software educativo de Bubble Sort, Insertion Sort, Merge Sort y Quick Sort, basado en el primer entregable y los mockups de Figma. Proyecto independiente del trabajo de perceptrones.

## Ejecutar

Requiere Node.js 22 o posterior.

```powershell
npm install
npm start
```

Abrir http://127.0.0.1:3100. Si el servidor ya está ejecutándose, basta con abrir la dirección.

El modo predeterminado usa PostgreSQL embebido mediante PGlite y guarda los datos en `.local/pglite`. No requiere contraseña ni instalación adicional de un servicio. No ejecutar dos servidores simultáneamente sobre el mismo directorio de datos.

## Recorrido

1. Ingresar un nombre, sin contraseña.
2. Completar las seis preguntas del diagnóstico.
3. Consultar los cuatro algoritmos y controlar sus visualizaciones.
4. Responder un ejercicio de cada algoritmo, con retroalimentación.
5. Completar las seis preguntas de la evaluación final.
6. Consultar ambos porcentajes y su diferencia en puntos porcentuales.

Cada evaluación se registra una sola vez por sesión. Los ejercicios se pueden repetir. Cambiar de estudiante inicia un recorrido independiente; cerrar la sesión no borra sus registros, pero no hay recuperación manual de sesiones anteriores. El navegador recuerda la sesión mediante una cookie durante 30 días.

## PostgreSQL como servicio

La capa de datos también soporta PostgreSQL convencional mediante el paquete `pg`. Crear una base independiente y definir `DATABASE_URL` en un archivo local `.env`, siguiendo [.env.example](.env.example). El arranque crea las tablas y carga los contenidos. No hay cambio automático de motor cuando una conexión configurada falla.

Los scripts `npm run db:start` y `npm run db:stop` preparan una instancia local independiente en el puerto 55432 usando PostgreSQL 18 instalado en Windows. Son opcionales: en este equipo, una directiva de Control de aplicaciones bloqueó `initdb.exe`. Por ese motivo, el modo de servicio queda pendiente de comprobación. La configuración de confianza de ese script está limitada a localhost y es solo para desarrollo.

## Pruebas

```powershell
npm test
node scripts/browser-test.mjs
```

El segundo comando requiere que la aplicación esté iniciada y usa Microsoft Edge. Genera capturas y un resumen en `test-results/msedge`.

Para Firefox de pruebas:

```powershell
npx playwright install firefox
$env:TEST_BROWSER = 'firefox'
node scripts/browser-test.mjs
Remove-Item Env:TEST_BROWSER
```

Las pruebas de integración usan una base PostgreSQL embebida en memoria y no modifican los datos de la aplicación. Las pruebas de navegador crean sesiones claramente identificadas como QA.

## Estructura

- [Servidor y API](server.js).
- [Motor de algoritmos](src/algorithms.js).
- [Contenidos y preguntas](src/content.js).
- [Adaptador de datos](src/database.js).
- [Modelo relacional](db/schema.sql).
- [Interfaz](public/app.js) y [estilos](public/styles.css).
- [Segundo entregable](docs/segundo-entregable.md).
- [Plan y casos de prueba](docs/pruebas.md).

## Límites actuales

Aplicación local, todavía sin despliegue público. Pendientes la evaluación con estudiantes, aprobación del docente, pruebas en Google Chrome y medición formal de rendimiento bajo condiciones acordadas. El banco inicial contiene seis preguntas por evaluación y un ejercicio por algoritmo. Las marcas para revisar preguntas se mantienen durante la vista actual; las respuestas sí se guardan en base de datos.

Las fuentes y los recursos gráficos se sirven localmente. Los nombres, porcentajes, avance y retroalimentación son datos reales de la sesión, no los valores de muestra de los mockups.
