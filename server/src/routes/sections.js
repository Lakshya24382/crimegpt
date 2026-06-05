const router = require('express').Router({ mergeParams: true });
const auth = require('../middleware/auth');
const c = require('../controllers/sectionsController');

router.get('/', auth, c.getSections);
router.post('/', auth, c.addSection);
router.delete('/:sectionId', auth, c.deleteSection);

module.exports = router;