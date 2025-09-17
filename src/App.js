import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import Navbar from './components/Navbar';
import BuyersList from './pages/BuyersList';
import CreateBuyer from './pages/CreateBuyer';
import ViewEditBuyer from './pages/ViewEditBuyer';
import Login from './pages/Login';
import VerifyMagicLink from './pages/VerifyMagicLink';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import './App.css';

function ProtectedRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" />;
}

function AppContent() {
  const { user } = useAuth();

  return (
    <div className="App">
      {user && <Navbar />}
      <Container fluid className={user ? "mt-4" : ""}>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/auth/verify" element={<VerifyMagicLink />} />
          <Route path="/buyers" element={
            <ProtectedRoute>
              <BuyersList />
            </ProtectedRoute>
          } />
          <Route path="/buyers/new" element={
            <ProtectedRoute>
              <CreateBuyer />
            </ProtectedRoute>
          } />
          <Route path="/buyers/:id" element={
            <ProtectedRoute>
              <ViewEditBuyer />
            </ProtectedRoute>
          } />
          <Route path="/" element={<Navigate to="/buyers" />} />
        </Routes>
      </Container>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <Router>
          <AppContent />
        </Router>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;