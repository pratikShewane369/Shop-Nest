const express = require('express');

const router = express.Router();

const {getAdminStats} = require('../controllers/analyticsController');
const {authMiddleware } = require('../middlewares/authMiddleware');
const {admin} = require('../middlewares/adminMiddleware');

router.get('/', authMiddleware , admin, getAdminStats);

module.exports = router;