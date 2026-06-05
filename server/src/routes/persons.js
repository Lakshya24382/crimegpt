const router = require('express').Router({ mergeParams: true });
const auth = require('../middleware/auth');
const c = require('../controllers/personsController');

router.get('/', auth, c.getPersons);
router.post('/', auth, c.addPerson);
router.put('/:personId', auth, c.updatePerson);

module.exports = router;