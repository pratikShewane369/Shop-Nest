const express = require('express');

const {protected} = require('../middlewares/authMiddleware');
const {admin} = require('../middlewares/adminMiddleware');
const {getProduct, createProduct, getProductById, updateProduct, deleteProduct} = require('../controllers/productController');

const multer = require('multer');
const upload = multer({dest : 'uploads/'});

const router = express.Router();

// all products
router.route('/').get(getProduct).post(protected, admin, upload.single('image'), createProduct);    

// specific product
router.route('/:id').get(getProductById).put(protected, admin, upload.single('image'), updateProduct).delete(protected, admin, deleteProduct);

module.exports = router;