const router = require('express').Router();
const auth = require('../middleware/auth');
const aiController = require('../controllers/aiController');

router.post('/suggest-sections', auth, aiController.suggestSections);
router.post('/suggest-judgments', auth, aiController.suggestJudgments);

module.exports = router;