const mongoose = require('mongoose');
const Request = require('./models/Request'); // Asegúrate de que apunte a tu modelo

// Conexión a MongoDB (usa tu URI actual)
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/taskflow';

mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('Conectado a MongoDB exitosamente');

    // Auto-seed: Inserta las peticiones si la colección está vacía
    try {
      const count = await Request.countDocuments();
      if (count === 0) {
        const initialRequests = [
          { title: "Optimización de índices en MongoDB", description: "Revisar y crear índices en las colecciones para mejorar el tiempo de respuesta.", status: "Activo" },
          { title: "Configuración de CORS en el backend", description: "Restringir los orígenes permitidos en Express para mayor seguridad de la API.", status: "Pendiente" },
          { title: "Despliegue en Docker Compose", description: "Sincronizar Node.js, Redis, MongoDB y Vue en un arranque unificado.", status: "Respondido" },
          { title: "Diseño antiguo de la barra lateral", description: "Versión preliminar del menú que fue reemplazada por el panel superior.", status: "Inactivo" },
          { title: "Conexión de caché con Redis", description: "Almacenar sesiones temporales y respuestas frecuentes usando Redis.", status: "Activo" },
          { title: "Actualización de dependencias NPM", description: "Auditar y actualizar paquetes de Node.js en backend y frontend para evitar vulnerabilidades.", status: "Pendiente" },
          { title: "Implementación de JWT en Rutas", description: "Proteger los endpoints de la API mediante JSON Web Tokens.", status: "Activo" },
          { title: "Diseño responsive en móviles", description: "Ajustar las tablas y formularios para que se adapten a pantallas pequeñas.", status: "Respondido" },
          { title: "Limpieza de volúmenes en Docker", description: "Eliminar volúmenes huérfanos para liberar espacio en disco duro.", status: "Inactivo" },
          { title: "Manejo centralizado de errores", description: "Crear un middleware global en Express para estandarizar las respuestas de error.", status: "Activo" },
          { title: "Pruebas unitarias con Jest", description: "Agregar tests automatizados para los controladores principales del backend.", status: "Pendiente" },
          { title: "Configuración de variables de entorno", description: "Asegurar que los archivos .env estén bien ocultos y documentados.", status: "Respondido" },
          { title: "Migración de base de datos a v7", description: "Actualizar la versión de MongoDB en el contenedor de docker-compose.", status: "Inactivo" },
          { title: "Documentación de la API en Swagger", description: "Generar documentación interactiva para los endpoints del backend.", status: "Pendiente" },
          { title: "Sistema de logs con Winston", description: "Registrar eventos y errores del sistema en archivos de texto persistentes.", status: "Activo" },
          { title: "Optimización de imágenes en Vue", description: "Comprimir recursos estáticos para mejorar la velocidad de carga del frontend.", status: "Respondido" },
          { title: "Revisión de permisos de red", description: "Verificar la comunicación interna entre los contenedores de Docker.", status: "Pendiente" },
          { title: "Implementación de rate limiting", description: "Evitar ataques de fuerza bruta limitando peticiones por IP con Redis.", status: "Activo" },
          { title: "Corrección de estilos CSS globales", description: "Eliminar márgenes por defecto y unificar la tipografía en todo el sitio.", status: "Respondido" },
          { title: "Backup automático de datos", description: "Programar respaldos diarios de las colecciones críticas de MongoDB.", status: "Pendiente" },
          { title: "Integración de Axios Interceptors", description: "Manejar tokens de autenticación y errores de red de forma global en el cliente.", status: "Activo" },
          { title: "Refactorización de modelos Mongoose", description: "Limpiar esquemas y agregar validaciones estrictas en los campos.", status: "Respondido" },
          { title: "Soporte para modo oscuro", description: "Agregar un selector de temas visuales en la interfaz de Vue.", status: "Inactivo" },
          { title: "Monitoreo de memoria RAM en Docker", description: "Revisar el consumo de recursos de los contenedores activos.", status: "Pendiente" },
          { title: "Validación de formularios en frontend", description: "Evitar envío de campos vacíos mediante validaciones reactivas.", status: "Activo" },
          { title: "Mejora de tiempos de compilación Vite", description: "Optimizar la configuración de vite.config.js para desarrollo rápido.", status: "Respondido" },
          { title: "Creación de índices compuestos", description: "Acelerar búsquedas cruzadas por título y estado en la base de datos.", status: "Pendiente" },
          { title: "Desactivación de registros antiguos", description: "Mover solicitudes inactivas a una colección histórica.", status: "Inactivo" },
          { title: "Prueba de estrés con Artillery", description: "Simular múltiples usuarios concurrentes consumiendo la API.", status: "Activo" },
          { title: "Revisión final de entrega", description: "Comprobar que todos los requerimientos funcionales operen correctamente.", status: "Respondido" }
        ];
        await Request.insertMany(initialRequests);
        console.log('¡Base de datos poblada automáticamente con las 30 peticiones!');
      }
    } catch (seedErr) {
      console.error('Error al poblar automáticamente:', seedErr);
    }
  })
  .catch(err => console.error('Error al conectar a MongoDB:', err));