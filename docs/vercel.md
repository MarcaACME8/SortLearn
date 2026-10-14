# Despliegue en Vercel

- Importar MarcaACME8/SortLearn, rama main, directorio raíz, preset Other.
- La entrada api/index.js reutiliza el manejador HTTP y mantiene la conexión entre solicitudes.
- Configurar DATABASE_URL con una conexión PostgreSQL externa (por ejemplo Neon con pooling y TLS). No usar PGlite en Vercel.
- La configuración vercel.json incluye los recursos y dirige las rutas a la función.
- No configurar npm start como comando de compilación. La aplicación no necesita compilación.
- Después del despliegue, comprobar /api/health y realizar diagnóstico, ejercicios y evaluación final.
- La base de datos local no se migra automáticamente.

Estado: adaptación y pruebas locales completadas; conexión y validación del despliegue pendientes.
