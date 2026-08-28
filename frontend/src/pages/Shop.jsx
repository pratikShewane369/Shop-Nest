import React, { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard.jsx';
import '../styles/product.css';

const Shop = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/products`);
        const data = await res.json();
        setProducts(data);
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const filteredProducts = products.filter((p) =>
    p.name?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="shop-page">

      {/* ================= SHOP HEADER ================= */}
      <section className="shop-header">

        <div className="shop-heading">
          <span className="shop-label">
            SHOPNEST COLLECTION
          </span>

          <h1>All Products</h1>

          <p>
            Explore our collection and find something you'll love.
          </p>
        </div>

        {/* ================= SEARCH ================= */}
        <div className="shop-search-wrapper">

          <span className="shop-search-icon">
            ⌕
          </span>

          <input
            type="text"
            placeholder="Search products..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="shop-search-input"
          />

          {search && (
            <button
              className="shop-search-clear"
              onClick={() => setSearch('')}
              type="button"
            >
              ×
            </button>
          )}

        </div>

      </section>


      {/* ================= RESULTS INFO ================= */}

      {!loading && (
        <div className="shop-results-bar">

          <span>
            {search
              ? `${filteredProducts.length} result${
                  filteredProducts.length !== 1 ? 's' : ''
                } found`
              : `${products.length} products`}
          </span>

          {search && (
            <button
              className="shop-clear-filter"
              onClick={() => setSearch('')}
            >
              Clear search
            </button>
          )}

        </div>
      )}


      {/* ================= PRODUCTS ================= */}

      {loading ? (
        <div className="shop-loading">
          <div className="shop-loader"></div>
          <p>Loading products...</p>
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="product-grid">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
            />
          ))}
        </div>
      ) : (
        <div className="shop-empty">

          <div className="shop-empty-icon">
            🔍
          </div>

          <h3>No products found</h3>

          <p>
            We couldn't find anything matching "{search}".
          </p>

          <button
            className="shop-empty-button"
            onClick={() => setSearch('')}
          >
            View All Products
          </button>

        </div>
      )}

    </div>
  );
};

export default Shop;