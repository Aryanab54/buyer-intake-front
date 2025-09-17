import React, { useState } from 'react';
import { Form, Button, Card, Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '../contexts/AuthContext';
import { authAPI } from '../services/api';

const Login = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setMessage('');

    try {
      await authAPI.login(email);
      setMessage('Magic link sent to your email! Check your inbox.');
    } catch (err) {
      const errorMessage = err.message || err.response?.data?.message || 'Failed to send magic link';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleDemoLogin = () => {
    const demoUser = {
      id: 'demo-user',
      email: 'demo@example.com',
      name: 'Demo User',
      token: 'demo-token'
    };
    login(demoUser);
  };

  return (
    <div className="login-container">
      <Card className="login-card">
        <Card.Body>
          <div className="text-center mb-4">
            <h2 className="fw-bold text-primary">Buyer Lead Intake</h2>
            <p className="text-muted">Sign in to manage your leads</p>
          </div>

          {error && <Alert variant="danger">{error}</Alert>}
          {message && <Alert variant="success">{message}</Alert>}

          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label>Email Address</Form.Label>
              <Form.Control
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
                disabled={loading}
                aria-describedby="email-help"
              />
              <Form.Text id="email-help" className="text-muted">
                We'll send you a magic link to sign in
              </Form.Text>
            </Form.Group>

            <Button 
              variant="primary" 
              type="submit" 
              className="w-100 mb-3"
              disabled={loading || !email}
            >
              {loading ? (
                <>
                  <Spinner size="sm" className="me-2" />
                  Sending Magic Link...
                </>
              ) : (
                'Send Magic Link'
              )}
            </Button>
          </Form>

          <hr />

          <Button 
            variant="outline-primary" 
            className="w-100"
            onClick={handleDemoLogin}
            disabled={loading}
          >
            Demo Login (No Backend Required)
          </Button>
        </Card.Body>
      </Card>
    </div>
  );
};

export default Login;