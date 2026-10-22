// Routes réservées aux administrateurs (gestion des utilisateurs)
const router = require('express').Router();
const c = require('../controllers/adminController');
const { authenticate, isAdmin } = require('../middlewares/auth.middleware');

router.use(authenticate, isAdmin);

router.get('/', c.listUsers);
router.post('/', c.createUser);
router.get('/:id', c.getUser);
router.patch('/:id/role', c.updateRole);
router.delete('/:id', c.deleteUser);

module.exports = router;
