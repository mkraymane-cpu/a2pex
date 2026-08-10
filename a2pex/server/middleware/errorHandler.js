const multer = require('multer');

// 404 handler — must be mounted after all routes.
function notFound(req, res, next) {
  res.status(404).json({ message: `Route not found: ${req.method} ${req.originalUrl}` });
}

// Centralized error handler — must be mounted last, with 4 arguments.
function errorHandler(err, req, res, next) {
  if (err instanceof multer.MulterError) {
    return res.status(400).json({ message: `Upload error: ${err.message}` });
  }

  if (err.code === 'ER_DUP_ENTRY') {
    return res.status(409).json({ message: 'A record with these details already exists.' });
  }

  if (err.code === 'ER_NO_REFERENCED_ROW_2' || err.code === 'ER_NO_REFERENCED_ROW') {
    return res.status(400).json({ message: 'Referenced record does not exist.' });
  }

  if (err.code === 'ECONNREFUSED' || err.code === 'PROTOCOL_CONNECTION_LOST') {
    return res.status(503).json({ message: 'Database is unreachable. Check the MySQL connection.' });
  }

  const status = err.statusCode || 500;
  const message =
    status === 500 && process.env.NODE_ENV === 'production'
      ? 'Internal server error.'
      : err.message || 'Internal server error.';

  if (status === 500) {
    console.error(err);
  }

  res.status(status).json({ message });
}

module.exports = { notFound, errorHandler };
