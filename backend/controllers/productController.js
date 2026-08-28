const Product = require('../models/productModel');
const cloudinary = require('../config/cloudinary');

const getProduct = async(req, res) => {
    try {
        const allProducts = await Product.find({});
        res.json(allProducts);
    } catch(err) {
        res.status(500).json({
            message : `Server Error in Product Controller ${err}`
        })
    }
}

const getProductById = async(req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if(product) {
            res.json(product);
        } else {
            res.status(500).json({message : 'Product not found'});
        }
    } catch(err) {
        res.status(500).json({
            message : `Server error ${err}`
        })
    }
}

const createProduct = async (req, res) => {
    try {
        const { name, description, price, category, stock } = req.body;

        if (!req.file) {
            return res.status(400).json({
                message: 'Product image is required'
            });
        }

        const result = await cloudinary.uploader.upload(req.file.path);

        const product = new Product({
            name,
            description,
            price,
            category,
            stock,
            imageUrl: result.secure_url
        });

        const savedProduct = await product.save();

        res.status(201).json({
            message: 'Product saved successfully',
            product: savedProduct
        });

    } catch (err) {
        console.error(err);

        res.status(500).json({
            message: 'Error creating product',
            error: err.message
        });
    }
};

const updateProduct = async (req, res) => {
    try {
        const { name, description, price, stock, category } = req.body;
        const productId = req.params.id;

        // 1. Fetch the document from the database first
        const product = await Product.findById(productId);

        if (product) {
            // 2. Update fields on the database document
            product.name = name || product.name;
            product.description = description || product.description;
            product.price = price || product.price;
            product.stock = stock || product.stock;
            product.category = category || product.category;

            if (req.file) {
                const result = await cloudinary.uploader.upload(req.file.path);
                product.imageUrl = result.secure_url;
            }

            // 3. Save the updated Mongoose document
            const updatedProduct = await product.save();
            
            // 4. Send back the updated document
            res.json(updatedProduct);
        } else {
            res.status(404).json({ message: 'Product not found' });
        }
    } catch (err) {
        res.status(500).json({ message: `Error: ${err.message}` });
    }
};

const deleteProduct = async(req, res) => {
    try {
        const product = await Product.findById(req.params.id);
        if(product) {
            await product.deleteOne();
            res.json({message : 'Product removed'});
        } else {
            res.status(404).json({message : 'Product not found'});
        }
    } catch(err) {
        res.status(500).json({message : `Server Error : ${err}`});
    }
}

module.exports = {
    getProduct,
    getProductById,
    createProduct,
    updateProduct,
    deleteProduct
}