const router = require('express').Router({ mergeParams: true });
const auth = require('../middleware/auth');
const c = require('../controllers/evidenceController');

router.get('/', auth, c.getEvidence);
router.post('/', auth, c.addEvidence);

module.exports = router;