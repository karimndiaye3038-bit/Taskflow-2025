const router = require('express').Router();
const p = require('../controllers/projectController');
const t = require('../controllers/taskController');
const { authenticate } = require('../middlewares/auth.middleware');

router.use(authenticate);

router.post('/', p.createProject);
router.get('/', p.listProjects);
router.get('/:id', p.getProject);
router.patch('/:id', p.updateProject);
router.delete('/:id', p.deleteProject);

router.post('/:id/members', p.addMember);
router.get('/:id/members', p.listMembers);
router.delete('/:id/members/:userId', p.removeMember);

router.post('/:id/tasks', t.createTask);
router.get('/:id/tasks', t.listProjectTasks);

module.exports = router;
