import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { toast } from 'react-toastify';
import { AuthContext } from '../context/AuthContext';
import '../styles/auth.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email,
            password
          })
        }
      );

      const data = await res.json();

      if (res.ok) {
        // Verified user
        login(data);
        toast.success('Login successful!');
        navigate('/');
      } else if (data.needsVerification) {
        // User exists but hasn't verified OTP
        toast.info(
          'Your account is not verified. A new OTP has been sent to your email.'
        );

        navigate('/verify-otp', {
          state: {
            email: data.email || email
          }
        });
      } else {
        toast.error(data.message || 'Login failed');
      }

    } catch (error) {
      console.error('Login error:', error);

      toast.error(
        `Something went wrong. Please try again. ${error.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <form onSubmit={handleSubmit} className="auth-form">

        <h2>Login</h2>

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        <button
          type="submit"
          className="btn"
          disabled={loading}
        >
          {loading ? 'Logging in...' : 'Login'}
        </button>

        <p>
          Don't have an account?{' '}
          <Link to="/register">Register</Link>
        </p>

      </form>
    </div>
  );
};

export default Login;