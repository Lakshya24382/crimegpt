const router = require('express').Router();
const auth = require('../middleware/auth');
const c = require('../controllers/casesController');

router.get('/', auth, c.getAllCases);
router.get('/:id', auth, c.getCaseById);
router.post('/', auth, c.createCase);
router.put('/:id', auth, c.updateCase);

module.exports = router;