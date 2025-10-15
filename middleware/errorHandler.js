const logger = require('../config/logger');

const errorHandler = (err, req, res, next) => {
  let error = { ...err };
  error.message = err.message;

  // Log do erro
  logger.error(err);

  // Erro de validação do Mongoose
  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors).map(val => val.message);
    error = {
      message: 'Dados inválidos',
      details: message
    };
    return res.status(400).json({
      success: false,
      error: error.message,
      details: error.details
    });
  }

  // Erro de duplicação do Mongoose
  if (err.code === 11000) {
    const message = 'Recurso duplicado';
    error = { message };
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }

  // Erro de cast do Mongoose
  if (err.name === 'CastError') {
    const message = 'ID inválido';
    error = { message };
    return res.status(400).json({
      success: false,
      error: error.message
    });
  }

  // Erro JWT
  if (err.name === 'JsonWebTokenError') {
    const message = 'Token inválido';
    error = { message };
    return res.status(401).json({
      success: false,
      error: error.message
    });
  }

  // Erro JWT expirado
  if (err.name === 'TokenExpiredError') {
    const message = 'Token expirado';
    error = { message };
    return res.status(401).json({
      success: false,
      error: error.message
    });
  }

  // Erro padrão
  res.status(error.statusCode || 500).json({
    success: false,
    error: error.message || 'Erro interno do servidor'
  });
};

module.exports = errorHandler;
