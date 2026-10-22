const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { asyncHandler, httpError } = require('./error.middleware');

// Vérifie le token JWT et charge l'utilisateur dans req.user
const authenticate = asyncHandler(async (req, res, next) => {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    throw httpError(401, 'Token manquant : utilisez "Authorization: Bearer <token>"');
  }
  let decoded;
  try {
    decoded = jwt.verify(header.split(' ')[1], process.env.JWT_SECRET);
  } catch (e) {
    throw httpError(401, 'Token invalide ou expiré');
  }
  const user = await User.findById(decoded.id);
  if (!user) throw httpError(401, "L'utilisateur de ce token n'existe plus");
  req.user = user;
  next();
});

// Réserve une route aux administrateurs
const isAdmin = (req, res, next) => {
  if (req.user.role !== 'ADMIN') {
    return next(httpError(403, 'Accès réservé aux administrateurs'));
  }
  next();
};

module.exports = { authenticate, isAdmin };
