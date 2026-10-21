const express = require('express');
const router = express.Router();
const {
  getRequests,
  getRequestById,
  createRequest,
  deleteRequest,
  updateRequest // <- Importar aquí
} = require('../controllers/requestController');

router.get('/', getRequests);
router.get('/:id', getRequestById);
router.post('/', createRequest);
router.patch('/:id', updateRequest); // <- Ruta PATCH para actualizaciones parciales
router.put('/:id', updateRequest);   // <- Ruta PUT para actualizaciones completas
router.delete('/:id', deleteRequest);

module.exports = router;