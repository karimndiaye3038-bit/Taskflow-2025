// Crée une erreur avec un code HTTP : throw httpError(404, 'Introuvable')
const httpError = (status, message) => {
  const error = new Error(message);
  error.status = status;
  return error;
};

// Évite d'écrire try/catch dans chaque contrôleur
const asyncHandler = (fn) => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next);

const notFound = (req, res) => {
  res.status(404).json({ success: false, message: `Route introuvable : ${req.method} ${req.originalUrl}` });
};

// Format unique des erreurs : { success: false, message: "..." }
const errorHandler = (err, req, res, next) => {
  let status = err.status || 500;
  let message = err.message;

  if (err.name === 'ValidationError') {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(', ');
  } else if (err.name === 'CastError') {
    status = 400;
    message = `Valeur invalide pour le champ "${err.path}"`;
  } else if (err.code === 11000) {
    status = 409;
    message = 'Cette valeur existe déjà (doublon)';
  } else if (err instanceof SyntaxError && err.status === 400) {
    message = 'JSON invalide dans le corps de la requête';
  }

  if (status === 500) {
    console.error(err);
    message = 'Erreur interne du serveur';
  }
  res.status(status).json({ success: false, message });
};

module.exports = { httpError, asyncHandler, notFound, errorHandler };
