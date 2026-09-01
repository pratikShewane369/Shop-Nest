import React from 'react';
import { Link } from 'react-router-dom';
import '../styles/product.css';

const ProductCard = ({ product }) => {

  // Optimize Cloudinary image
  const optimizedImage = product.imageUrl?.replace(
    '/upload/',
    '/upload/f_auto,q_auto,w_500/'
  );

  return (
    <div className="product-card">

      <img
        src={optimizedImage}
        alt={product.name}
        className="product-image"
        loading="lazy"
      />

      <div className="product-info">

        <h3>{product.name}</h3>

        <p className="price">
          ₹{product.price}
        </p>

        <Link
          to={`/product/${product._id}`}
          className="btn"
        >
          View Details
        </Link>

      </div>

    </div>
  );
};

export default ProductCard;