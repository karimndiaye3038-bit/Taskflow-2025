const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Project = require('../models/Project');
const Task = require('../models/Task');
const { asyncHandler, httpError } = require('../middlewares/error.middleware');
const { escapeRegex, getPagination, paginationInfo, sameId } = require('../utils/helpers');

// GET /api/users?search=&role=&page=&limit=
exports.listUsers = asyncHandler(async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const filter = {};
  if (req.query.role) {
    if (!['ADMIN', 'USER'].includes(req.query.role)) throw httpError(400, 'Rôle invalide (ADMIN, USER)');
    filter.role = req.query.role;
  }
  if (req.query.search) {
    const regex = new RegExp(escapeRegex(req.query.search), 'i');
    filter.$or = [{ name: regex }, { email: regex }];
  }
  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);
  res.json({ success: true, data: users, pagination: paginationInfo(page, limit, total) });
});

// POST /api/users  (l'admin crée un utilisateur avec le rôle de son choix)
exports.createUser = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  if (!name || !email || !password) throw httpError(400, 'Nom, email et mot de passe sont obligatoires');
  if (password.length < 6) throw httpError(400, 'Le mot de passe doit avoir au moins 6 caractères');
  if (role && !['ADMIN', 'USER'].includes(role)) throw httpError(400, 'Rôle invalide (ADMIN, USER)');
  if (await User.findOne({ email: email.toLowerCase() })) throw httpError(409, 'Cet email est déjà utilisé');

  const user = await User.create({ name, email, password: await bcrypt.hash(password, 10), role: role || 'USER' });
  res.status(201).json({ success: true, user });
});

// GET /api/users/:id
exports.getUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw httpError(404, 'Utilisateur introuvable');
  res.json({ success: true, user });
});

// PATCH /api/users/:id/role
exports.updateRole = asyncHandler(async (req, res) => {
  const { role } = req.body;
  if (!['ADMIN', 'USER'].includes(role)) throw httpError(400, 'Rôle invalide (ADMIN, USER)');
  const user = await User.findById(req.params.id);
  if (!user) throw httpError(404, 'Utilisateur introuvable');
  if (sameId(user, req.user) && role !== 'ADMIN') throw httpError(409, 'Vous ne pouvez pas retirer votre propre rôle ADMIN');
  user.role = role;
  await user.save();
  res.json({ success: true, user });
});

// DELETE /api/users/:id
exports.deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) throw httpError(404, 'Utilisateur introuvable');
  if (sameId(user, req.user)) throw httpError(409, 'Vous ne pouvez pas supprimer votre propre compte');
  if (await Project.exists({ owner: user._id })) {
    throw httpError(409, "Cet utilisateur est responsable d'un projet : supprimez-le d'abord");
  }
  // Nettoyage : retirer des projets et désassigner ses tâches
  await Project.updateMany({ members: user._id }, { $pull: { members: user._id } });
  await Task.updateMany({ assignedTo: user._id }, { assignedTo: null });
  await user.deleteOne();
  res.json({ success: true, message: 'Utilisateur supprimé' });
});
