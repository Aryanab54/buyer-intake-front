import React from 'react';
import { render, screen, act } from '@testing-library/react';
import { AuthProvider, useAuth } from '../AuthContext';

const TestComponent = () => {
  const { user, login, logout } = useAuth();
  
  return (
    <div>
      <div data-testid="user-status">
        {user ? `Logged in as ${user.name}` : 'Not logged in'}
      </div>
      <button onClick={() => login({ id: '1', name: 'Test User', email: 'test@example.com' })}>
        Login
      </button>
      <button onClick={logout}>Logout</button>
    </div>
  );
};

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  test('provides authentication state', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    expect(screen.getByTestId('user-status')).toHaveTextContent('Not logged in');
  });

  test('handles login', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    act(() => {
      screen.getByText('Login').click();
    });
    
    expect(screen.getByTestId('user-status')).toHaveTextContent('Logged in as Test User');
  });

  test('handles logout', () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );
    
    act(() => {
      screen.getByText('Login').click();
    });
    
    act(() => {
      screen.getByText('Logout').click();
    });
    
    expect(screen.getByTestId('user-status')).toHaveTextContent('Not logged in');
  });
});