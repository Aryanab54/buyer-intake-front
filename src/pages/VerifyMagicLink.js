import React, { useEffect, useState } from 'react';
import { useSearchParams, Navigate } from 'react-router-dom';
import { Container, Alert, Spinner } from 'react-bootstrap';
import { authAPI } from '../services/api';
import { useAuth } from '../contexts/AuthContext';

const VerifyMagicLink = () => {
  const [searchParams] = useSearchParams();
  const { login } = useAuth();
  const [status, setStatus] = useState('verifying');
  const [error, setError] = useState('');
  
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      setStatus('error');
      setError('No token provided');
      return;
    }

    const verifyToken = async () => {
      try {
        const response = await authAPI.verifyMagicLink(token);
        login(response.data.data);
        setStatus('success');
      } catch (err) {
        setStatus('error');
        setError(err.response?.data?.message || 'Verification failed');
      }
    };

    verifyToken();
  }, [token, login]);

  if (status === 'success') {
    return <Navigate to="/buyers" replace />;
  }

  return (
    <Container className="mt-5">
      <div className="text-center">
        {status === 'verifying' && (
          <>
            <Spinner animation="border" />
            <p className="mt-3">Verifying magic link...</p>
          </>
        )}
        {status === 'error' && (
          <Alert variant="danger">
            <h4>Verification Failed</h4>
            <p>{error}</p>
          </Alert>
        )}
      </div>
    </Container>
  );
};

export default VerifyMagicLink;