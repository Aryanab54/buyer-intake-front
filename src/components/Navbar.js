import React from 'react';
import { Navbar as BSNavbar, Nav, Container, Button } from 'react-bootstrap';
import { LinkContainer } from 'react-router-bootstrap';
import { useAuth } from '../contexts/AuthContext';

const Navbar = () => {
  const { user, logout } = useAuth();

  return (
    <BSNavbar bg="primary" variant="dark" expand="lg" sticky="top">
      <Container>
        <BSNavbar.Brand href="/buyers">
          Buyer Lead Intake
        </BSNavbar.Brand>
        
        <BSNavbar.Toggle aria-controls="basic-navbar-nav" />
        
        <BSNavbar.Collapse id="basic-navbar-nav">
          <Nav className="me-auto">
            <LinkContainer to="/buyers">
              <Nav.Link>All Leads</Nav.Link>
            </LinkContainer>
            <LinkContainer to="/buyers/new">
              <Nav.Link>Add Lead</Nav.Link>
            </LinkContainer>
          </Nav>
          
          <Nav>
            <BSNavbar.Text className="me-3">
              Welcome, {user?.name || user?.email}
            </BSNavbar.Text>
            <Button variant="outline-light" size="sm" onClick={logout}>
              Logout
            </Button>
          </Nav>
        </BSNavbar.Collapse>
      </Container>
    </BSNavbar>
  );
};

export default Navbar;