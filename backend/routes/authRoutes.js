const express = require('express');
const router = express.Router();

const {registerUser, loginUser, getUsers, verifyUser} = require('../controllers/authController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const {admin} = require('../middlewares/adminMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.get('/users', authMiddleware , admin, getUsers);
router.post('/verify', verifyUser);
module.exports = router;