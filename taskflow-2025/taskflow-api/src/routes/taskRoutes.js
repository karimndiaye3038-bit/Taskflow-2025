const router = require('express').Router();
const t = require('../controllers/taskController');
const { authenticate } = require('../middlewares/auth.middleware');

router.use(authenticate);

router.get('/', t.listMyTasks);
router.get('/:id', t.getTask);
router.patch('/:id', t.updateTask);
router.delete('/:id', t.deleteTask);

module.exports = router;
