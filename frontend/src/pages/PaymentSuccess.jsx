import React, { useEffect, useState, useContext } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FaCheckCircle, FaSpinner } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import { clearCart } from '../redux/cartSlice';

const PaymentSuccess = () => {
  const { user } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  const sessionId = searchParams.get('session_id');
  const orderId = searchParams.get('orderId');

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const clearCartAfterPayment = async () => {
      if (!sessionId || !orderId) {
        setLoading(false);
        return;
      }

      // Stripe webhook handles the actual payment confirmation.
      // This page only clears the local cart after Stripe redirects
      // the user back successfully.
      dispatch(clearCart());

      setLoading(false);
    };

    clearCartAfterPayment();
  }, [sessionId, orderId, dispatch]);

  if (loading) {
    return (
      <div
        style={{
          maxWidth: '600px',
          margin: '50px auto',
          padding: '50px 30px',
          background: '#18181b',
          borderRadius: '16px',
          textAlign: 'center'
        }}
      >
        <FaSpinner
          className="animate-spin"
          style={{
            fontSize: '3rem',
            color: '#10b981',
            marginBottom: '20px'
          }}
        />

        <p style={{ color: '#a1a1aa' }}>
          Processing your order...
        </p>
      </div>
    );
  }

  return (
    <div
      style={{
        maxWidth: '600px',
        margin: '50px auto',
        padding: '50px 30px',
        background: '#18181b',
        borderRadius: '16px',
        border: '1px solid rgba(255, 255, 255, 0.05)',
        boxShadow: '0 10px 40px rgba(0,0,0,0.5)',
        textAlign: 'center'
      }}
    >
      <FaCheckCircle
        style={{
          fontSize: '4rem',
          color: '#10b981',
          marginBottom: '20px'
        }}
      />

      <h2
        style={{
          fontSize: '2.5rem',
          marginBottom: '20px',
          color: '#10b981'
        }}
      >
        Payment Successful!
      </h2>

      <p
        style={{
          color: '#a1a1aa',
          fontSize: '1.2rem',
          marginBottom: '15px'
        }}
      >
        Your payment has been successfully received.
      </p>

      <p
        style={{
          color: '#a1a1aa',
          marginBottom: '40px'
        }}
      >
        Your order is now being processed.
      </p>

      <Link to="/profile" className="btn">
        View My Orders
      </Link>
    </div>
  );
};

export default PaymentSuccess;