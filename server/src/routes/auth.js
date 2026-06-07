const router = require('express').Router();
const auth = require('../middleware/auth');
const { register, login } = require('../controllers/authController');

router.post('/login', login);
// Only authenticated officers (SHO/admin) can register new officers
router.post('/register', auth, register);

module.exports = router;