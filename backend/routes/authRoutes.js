const express = require('express');
const router = express.Router();

const {registerUser, loginUser, getUsers, verifyUser} = require('../controllers/authController');
const {protected} = require('../middlewares/authMiddleware');
const {admin} = require('../middlewares/adminMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/users', protected, admin, getUsers);
router.post('/verify', verifyUser);
module.exports = router;