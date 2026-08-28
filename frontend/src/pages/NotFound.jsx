import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  const containerStyle = {
    minHeight: '70vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    padding: '40px 20px',
  };

  const codeStyle = {
    fontSize: '6rem',
    fontWeight: '800',
    color: '#f97316',
    lineHeight: '1',
    marginBottom: '10px',
  };

  const titleStyle = {
    fontSize: '1.8rem',
    color: '#fff',
    marginBottom: '15px',
  };

  const textStyle = {
    color: '#a1a1aa',
    fontSize: '1.1rem',
    maxWidth: '500px',
    marginBottom: '35px',
    lineHeight: '1.6',
  };

  return (
    <div style={containerStyle}>
      <div style={codeStyle}>404</div>
      <h2 style={titleStyle}>Page Not Found</h2>
      <p style={textStyle}>
        The page you're looking for doesn't exist or may have been moved.
        Let's get you back on track.
      </p>
      <Link to="/" className="btn">Back to Home</Link>
    </div>
  );
};

export default NotFound;