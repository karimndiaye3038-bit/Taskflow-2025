const router = require('express').Router();
const { register, login, getMe, updateMe } = require('../controllers/authController');
const { authenticate } = require('../middlewares/auth.middleware');

// Comme server.js fait app.use('/api', ...), 
// ces chemins vont donner /api/auth/register et /api/auth/login
router.post('/auth/register', register);
router.post('/auth/login', login);

// Pour /api/users/me, comme server.js fait app.use('/api', ...),
// il faut que le chemin commence par /users/me :
router.get('/users/me', authenticate, getMe);
router.patch('/users/me', authenticate, updateMe);

module.exports = router;