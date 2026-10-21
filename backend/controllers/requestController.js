const Request = require('../models/Request');

// 1. Obtener todas las solicitudes
const getRequests = async (req, res, next) => {
  try {
    const requests = await Request.find().sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (error) {
    next(error);
  }
};

// 2. Obtener una solicitud por ID
const getRequestById = async (req, res, next) => {
  try {
    const request = await Request.findById(req.params.id);
    if (!request) {
      return res.status(404).json({ error: 'Solicitud no encontrada' });
    }
    res.status(200).json(request);
  } catch (error) {
    next(error);
  }
};

// 3. Crear una nueva solicitud (con validación de campos)
const createRequest = async (req, res, next) => {
  try {
    const { title, description } = req.body;

    // Validación básica
    if (!title || !description) {
      return res.status(400).json({ error: 'El título y la descripción son obligatorios' });
    }

    const newRequest = new Request({ title, description });
    await newRequest.save();

    // Encolar en Redis si está disponible
    const redis = req.app.locals.redis;
    if (redis) {
      await redis.lpush('taskQueue', JSON.stringify(newRequest));
    }

    res.status(201).json({
      message: 'Solicitud creada con éxito y encolada en Redis',
      data: newRequest
    });
  } catch (error) {
    next(error);
  }
};

// 4. Eliminar una solicitud por ID
const deleteRequest = async (req, res, next) => {
  try {
    const deletedRequest = await Request.findByIdAndDelete(req.params.id);
    if (!deletedRequest) {
      return res.status(404).json({ error: 'Solicitud no encontrada para eliminar' });
    }
    res.status(200).json({ message: 'Solicitud eliminada con éxito', data: deletedRequest });
  } catch (error) {
    next(error);
  }
};

// 5. Actualizar una solicitud por ID
const updateRequest = async (req, res, next) => {
  try {
    const updatedRequest = await Request.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!updatedRequest) {
      return res.status(404).json({ error: 'Solicitud no encontrada para actualizar' });
    }
    
    res.status(200).json({ 
      message: 'Solicitud actualizada con éxito', 
      data: updatedRequest 
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getRequests,
  getRequestById,
  createRequest,
  deleteRequest,
  updateRequest // <- Añadir aquí
};

