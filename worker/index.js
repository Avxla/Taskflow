const Redis = require('ioredis');
const mongoose = require('mongoose');
const Request = require('./models/Request'); // Ruta ajustada hacia la carpeta models interna

const REDIS_HOST = process.env.REDIS_HOST || 'redisserver';
const REDIS_PORT = process.env.REDIS_PORT || 6379;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongoserver:27017/taskflow';

// 1. Conexión a MongoDB
mongoose.connect(MONGO_URI)
  .then(() => console.log('🍃 Worker conectado a MongoDB exitosamente'))
  .catch((err) => console.error('❌ Error del Worker conectando a MongoDB:', err));

// 2. Conexión a Redis
const redis = new Redis({
  host: REDIS_HOST,
  port: REDIS_PORT
});

redis.on('connect', () => {
  console.log('👷 Worker conectado a Redis, esperando tareas en la cola...');
  processQueue();
});

redis.on('error', (err) => {
  console.error('❌ Error de conexión del Worker a Redis:', err);
});

// 3. Función recursiva para procesar la cola en tiempo real
async function processQueue() {
  try {
    // BRPOP espera bloqueado hasta que haya un elemento en la lista 'taskQueue'
    const result = await redis.brpop('taskQueue', 0);
    
    if (result && result[1]) {
      const taskData = JSON.parse(result[1]);
      console.log(`⚙️ Procesando solicitud ID: ${taskData._id} - Título: "${taskData.title}"`);

      // Paso A: Cambiar estado a 'Procesando'
      await Request.findByIdAndUpdate(taskData._id, { status: 'Procesando' });

      // Simular un tiempo de procesamiento pesado (ej. 4 segundos)
      await new Promise((resolve) => setTimeout(resolve, 4000));

      // Paso B: Cambiar estado a 'Completado'
      await Request.findByIdAndUpdate(taskData._id, { status: 'Completado' });
      console.log(`✅ Solicitud ${taskData._id} completada y actualizada en la BD.`);
    }
  } catch (error) {
    console.error('❌ Error procesando la tarea en el worker:', error);
  }

  // Continuar escuchando la cola de manera continua
  setImmediate(processQueue);
}