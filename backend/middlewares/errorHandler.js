const errorHandler = (err, req, res, next) => {
  console.error('❌ Error capturado:', err.stack);
  res.status(500).json({
    error: 'Ocurrió un error interno en el servidor',
    details: err.message
  });
};

module.exports = errorHandler;