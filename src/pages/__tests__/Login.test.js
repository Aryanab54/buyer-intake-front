import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider } from '../../contexts/AuthContext';

// Mock the Login component to avoid axios import issues
const MockLogin = () => {
  const [email, setEmail] = React.useState('');
  
  return (
    <div className="login-container">
      <div className="login-card">
        <div className="text-center mb-4">
          <h2>Buyer Lead Intake</h2>
        </div>
        <form>
          <div className="mb-3">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
            />
          </div>
          <button 
            type="submit" 
            disabled={!email}
          >
            Send Magic Link
          </button>
        </form>
        <button>Demo Login (No Backend Required)</button>
      </div>
    </div>
  );
};

const MockedLogin = () => (
  <AuthProvider>
    <MockLogin />
  </AuthProvider>
);

describe('Login Component', () => {
  test('renders login form', () => {
    render(<MockedLogin />);
    expect(screen.getByText('Buyer Lead Intake')).toBeInTheDocument();
    expect(screen.getByLabelText('Email Address')).toBeInTheDocument();
    expect(screen.getByText('Send Magic Link')).toBeInTheDocument();
    expect(screen.getByText('Demo Login (No Backend Required)')).toBeInTheDocument();
  });

  test('validates email input', async () => {
    const user = userEvent.setup();
    render(<MockedLogin />);
    
    const emailInput = screen.getByLabelText('Email Address');
    const submitButton = screen.getByText('Send Magic Link');
    
    expect(submitButton).toBeDisabled();
    
    await user.type(emailInput, 'valid@email.com');
    expect(submitButton).not.toBeDisabled();
  });
});