const router = require('express').Router();
const { getStats } = require('../controllers/statsController');
const { authenticate } = require('../middlewares/auth.middleware');

router.get('/stats', authenticate, getStats);

module.exports = router;
