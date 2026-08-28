import React, { useEffect, useState } from 'react';
import ProductCard from '../components/ProductCard.jsx';

const Home = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const res = await fetch(`${process.env.REACT_APP_API_URL}/products`);
        const data = await res.json();
        setProducts(data.slice(0, 12));
      } catch (error) {
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  return (
    <div className="home-container">

      {/* ================= HERO SECTION ================= */}
      <section className="shopnest-hero">

        {/* Background decoration */}
        <div className="shopnest-hero-glow shopnest-glow-one"></div>
        <div className="shopnest-hero-glow shopnest-glow-two"></div>

        <div className="shopnest-hero-content">

          <div className="shopnest-hero-badge">
            <span className="shopnest-badge-dot"></span>
            NEW COLLECTION IS HERE
          </div>

          <h1 className="shopnest-hero-title">
            Everything You Need.
            <br />
            <span>All in One Place.</span>
          </h1>

          <p className="shopnest-hero-description">
            Discover products you'll love at prices you'll appreciate.
            Shop smarter with ShopNest and find everything you need
            without the hassle.
          </p>

          <div className="shopnest-hero-actions">
            <a href="#featured-products" className="shopnest-primary-btn">
              Explore Products
              <span>→</span>
            </a>

            <a href="#featured-products" className="shopnest-secondary-btn">
              View Collection
            </a>
          </div>

          {/* Trust information */}
          <div className="shopnest-hero-trust">

            <div className="shopnest-trust-item">
              <strong>100+</strong>
              <span>Products</span>
            </div>

            <div className="shopnest-trust-divider"></div>

            <div className="shopnest-trust-item">
              <strong>24/7</strong>
              <span>Support</span>
            </div>

            <div className="shopnest-trust-divider"></div>

            <div className="shopnest-trust-item">
              <strong>100%</strong>
              <span>Secure</span>
            </div>

          </div>

        </div>

        {/* ================= HERO VISUAL ================= */}
        <div className="shopnest-hero-visual">

          <div className="shopnest-orbit shopnest-orbit-one"></div>
          <div className="shopnest-orbit shopnest-orbit-two"></div>

          <div className="shopnest-product-showcase">

            <div className="shopnest-showcase-icon">
              🛍️
            </div>

            <span className="shopnest-showcase-small">
              SHOP SMART
            </span>

            <h3>
              Your Shopping
              <br />
              Starts Here.
            </h3>

            <div className="shopnest-showcase-line"></div>

            <p>
              Quality products.
              <br />
              Great prices.
            </p>

          </div>

          {/* Floating cards */}
          <div className="shopnest-floating-card shopnest-card-top">
            <span className="shopnest-floating-icon">✦</span>
            <div>
              <strong>Premium</strong>
              <small>Quality Products</small>
            </div>
          </div>

          <div className="shopnest-floating-card shopnest-card-bottom">
            <span className="shopnest-floating-icon">✓</span>
            <div>
              <strong>Secure Shopping</strong>
              <small>Shop with confidence</small>
            </div>
          </div>

        </div>

      </section>


      {/* ================= FEATURED PRODUCTS ================= */}

      <section
        className="shopnest-featured-section"
        id="featured-products"
      >

        <div className="shopnest-section-header">
          <div>
            <span className="shopnest-section-label">
              OUR COLLECTION
            </span>

            <h2>
              Featured Products
            </h2>
          </div>

          <p>
            Discover some of our most popular products.
          </p>
        </div>

        {loading ? (
          <div className="shopnest-loading">
            <div className="shopnest-loader"></div>
            <span>Loading products...</span>
          </div>
        ) : (
          <div className="product-grid">
            {products.map((product) => (
              <ProductCard
                key={product._id}
                product={product}
              />
            ))}
          </div>
        )}

      </section>

    </div>
  );
};

export default Home;