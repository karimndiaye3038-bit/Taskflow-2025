const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { asyncHandler, httpError } = require('../middlewares/error.middleware');

const createToken = (user) =>
  jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '1d',
  });

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) throw httpError(400, 'Nom, email et mot de passe sont obligatoires');
  if (password.length < 6) throw httpError(400, 'Le mot de passe doit avoir au moins 6 caractères');

  const normalizedEmail = email.toLowerCase();
  if (await User.findOne({ email: normalizedEmail })) {
    throw httpError(409, 'Cet email est déjà utilisé');
  }

  const hashed = await bcrypt.hash(password, 10);
  const user = await User.create({ name, email: normalizedEmail, password: hashed });

  res.status(201).json({ success: true, token: createToken(user), user });
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) throw httpError(400, 'Email et mot de passe sont obligatoires');

  const user = await User.findOne({ email: email.toLowerCase() }).select('+password');
  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw httpError(401, 'Email ou mot de passe incorrect');
  }
  res.json({ success: true, token: createToken(user), user });
});

exports.getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user });
});

exports.updateMe = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;
  if (name !== undefined) req.user.name = name;
  if (email !== undefined) req.user.email = email.toLowerCase();
  if (password !== undefined) {
    if (password.length < 6) throw httpError(400, 'Le mot de passe doit avoir au moins 6 caractères');
    req.user.password = await bcrypt.hash(password, 10);
  }
  await req.user.save();
  res.json({ success: true, user: req.user });
});