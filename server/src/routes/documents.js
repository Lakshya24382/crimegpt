const router = require('express').Router({ mergeParams: true });
const auth = require('../middleware/auth');
const { generateDocument, getDocumentHistory } = require('../controllers/documentsController');

router.get('/history', auth, getDocumentHistory);
router.post('/generate/:docType', auth, generateDocument);

module.exports = router;