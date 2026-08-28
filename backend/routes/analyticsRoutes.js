const express = require('express');

const router = express.Router();

const {getAdminStats} = require('../controllers/analyticsController');
const {protected} = require('../middlewares/authMiddleware');
const {admin} = require('../middlewares/adminMiddleware');

router.get('/', protected, admin, getAdminStats);

module.exports = router;