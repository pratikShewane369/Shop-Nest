import React, { useEffect, useState, useContext } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { FaSpinner } from 'react-icons/fa';
import { AuthContext } from '../context/AuthContext';
import { clearCart } from '../redux/cartSlice';

const PaymentSuccess = () => {
  const { user } = useContext(AuthContext);
  const [searchParams] = useSearchParams();
  const dispatch = useDispatch();

  const sessionId = searchParams.get('session_id');
  const orderId = searchParams.get('orderId');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const confirmPayment = async () => {
      if (!sessionId || !orderId) {
        setError('Missing payment confirmation details in the URL.');
        setLoading(false);
        return;
      }

      try {
        const query = new URLSearchParams({ session_id: sessionId, orderId }).toString();
        const res = await fetch(`${process.env.REACT_APP_API_URL}/payments/confirm?${query}`, {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${user?.token}`,
          },
        });

        const data = await res.json();

        if (!res.ok) {
          setError(data?.message || 'Could not verify payment status.');
        } else {
          dispatch(clearCart());
        }
      } catch (err) {
        console.error('Failed to confirm payment:', err);
        setError('Could not verify payment status.');
      } finally {
        setLoading(false);
      }
    };

    confirmPayment();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sessionId, orderId]);

  const containerStyle = {
    maxWidth: '600px', margin: '50px auto', padding: '50px 30px',
    background: '#18181b', borderRadius: '16px',
    border: '1px solid rgba(255, 255, 255, 0.05)',
    boxShadow: '0 10px 40px rgba(0,0,0,0.5)', textAlign: 'center'
  };

  if (loading) {
    return (
      <div style={containerStyle}>
        <FaSpinner className="animate-spin" style={{ fontSize: '3rem', color: '#10b981', marginBottom: '20px' }} />
        <p style={{ color: '#a1a1aa' }}>Confirming your payment...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div style={containerStyle}>
        <h2 style={{ color: '#ef4444', fontSize: '2rem', marginBottom: '20px' }}>Verification Issue</h2>
        <p style={{ color: '#a1a1aa', marginBottom: '30px' }}>{error}</p>
        <Link to="/orders" className="btn">Check My Orders</Link>
      </div>
    );
  }

  return (
    <div style={containerStyle}>
      <h2 style={{ fontSize: '2.5rem', marginBottom: '20px', color: '#10b981' }}>Payment Successful!</h2>
      <p style={{ color: '#a1a1aa', fontSize: '1.2rem', marginBottom: '40px' }}>
        Thank you for your order. We have securely received your payment and will process your shipment shortly.
      </p>
      <Link to="/shop" className="btn">Continue Shopping</Link>
    </div>
  );
};

export default PaymentSuccess;