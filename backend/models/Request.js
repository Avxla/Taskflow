const mongoose = require('mongoose');

const RequestSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
  type: String,
  required: true,
  default: 'activo'
  // Elimina o comente la línea de 'enum: [...]' para que no rechace ningún valor
},
category: { type: String, default: 'Desarrollo' },
  priority: { type: String, enum: ['Baja', 'Media', 'Alta', 'Crítica'], default: 'Media' },
  clientName: { type: String, default: 'Anónimo' },
  estimatedDays: { type: Number, default: 3 },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Request', RequestSchema);