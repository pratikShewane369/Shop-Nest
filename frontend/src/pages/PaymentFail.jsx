import React, { useEffect, useState, useContext } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { FaExclamationTriangle, FaSpinner } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';

const PaymentFail = () => {
  const { user } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const markFailed = async () => {
      if (!orderId) {
        setLoading(false);
        return;
      }
      try {
        const query = new URLSearchParams({ orderId }).toString();
        await fetch(`${process.env.REACT_APP_API_URL}/payments/fail?${query}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        });
      } catch (err) {
        console.error('Failed to mark payment as failed:', err);
      } finally {
        setLoading(false);
      }
    };

    markFailed();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [orderId]);

  const containerStyle = {
    maxWidth: '600px', margin: '50px auto', padding: '50px 30px',
    background: '#18181b', borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    boxShadow: '0 10px 40px rgba(0,0,0,0.5)', textAlign: 'center'
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <FaSpinner className="animate-spin" style={{ fontSize: '3rem', color: '#a1a1aa', marginBottom: '20px' }} />
        <p style={{ color: '#a1a1aa' }}>Updating order status...</p>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <FaExclamationTriangle style={{ fontSize: '3.5rem', color: '#ef4444', marginBottom: '20px' }} />
      <h2 style={{ fontSize: '2.5rem', marginBottom: '20px', color: '#ef4444' }}>Payment Failed</h2>
      <p style={{ color: '#a1a1aa', fontSize: '1.2rem', marginBottom: '40px' }}>
        Your payment could not be completed. No amount has been charged. You can try again from your cart.
      </p>
      <Link to="/cart" className="btn">Back to Cart</Link>
    </div>
  );
};

export default PaymentFail;