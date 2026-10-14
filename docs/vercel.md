# Despliegue en Vercel

- Importar MarcaACME8/SortLearn, rama main, directorio raíz, preset Other.
- La entrada api/index.js reutiliza el manejador HTTP y mantiene la conexión entre solicitudes.
- Configurar DATABASE_URL con una conexión PostgreSQL externa (por ejemplo Neon con pooling y TLS). No usar PGlite en Vercel.
- La configuración vercel.json incluye los recursos y dirige las rutas a la función.
- No configurar npm start como comando de compilación. La aplicación no necesita compilación.
- Después del despliegue, comprobar /api/health y realizar diagnóstico, ejercicios y evaluación final.
- La base de datos local no se migra automáticamente.

Estado documentado al 14 de octubre de 2026: proyecto sort-learn creado en Vercel (equipo WarIII) y base sortlearn-db de Neon conectada con plan Free. Se aprobaron 20 pruebas locales tras corregir navegación asíncrona, resaltado de pseudocódigo y consultas de sesión. Pendiente: comprobar la configuración actual, aplicar la conexión mediante un nuevo despliegue y validar el recorrido público.

Dirección asignada: https://sort-learn.vercel.app. La integración administra DATABASE_URL como variable sensible; las credenciales no se guardan en el repositorio.
