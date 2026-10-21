const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Request = require('./models/Request');

const app = express();
app.use(cors());
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongoserver:27017/taskflow';

// Conexión y Auto-seed
mongoose.connect(MONGO_URI)
  .then(async () => {
    console.log('✅ Conectado correctamente a MongoDB');

    try {
      // Limpiamos y re-insertamos para asegurar que siempre estén las 30 peticiones en desarrollo
      await Request.deleteMany({});
      
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
      console.log('✨ Base de datos poblada exitosamente con las 30 peticiones.');
    } catch (seedError) {
      console.error('Error al poblar la base de datos:', seedError);
    }
  })
  .catch(err => {
    console.error('❌ Error al conectar a MongoDB:', err);
  });

// ==========================================
// RUTA OBLIGATORIA PARA EL FRONTEND
// ==========================================
app.get('/api/requests', async (req, res) => {
  try {
    const requests = await Request.find({}).lean();
    res.json(requests);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Ruta para crear nuevas solicitudes desde el formulario de la UI
// Ruta para actualizar una solicitud por ID (PUT)
app.put('/api/requests/:id', async (req, res) => {
  try {
    const updatedRequest = await Request.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedRequest) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }
    
    res.status(200).json(updatedRequest);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Ruta para actualizar de forma parcial (PATCH - opcional pero recomendado)
app.patch('/api/requests/:id', async (req, res) => {
  try {
    const updatedRequest = await Request.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedRequest) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }
    
    res.status(200).json(updatedRequest);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Servidor ejecutándose en el puerto ${PORT}`);
});