import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import LandingPage from './LandingPage';

// Mock the Lucide icons
jest.mock('lucide-react', () => ({
  User: () => <div data-testid="user-icon" />,
  Shield: () => <div data-testid="shield-icon" />
}));

describe('LandingPage', () => {
  const renderWithRouter = (ui) => {
    return render(<BrowserRouter>{ui}</BrowserRouter>);
  };

  test('renders the landing page with logo and title', () => {
    renderWithRouter(<LandingPage />);
    
    expect(screen.getByAltText('Zappy Logo')).toBeInTheDocument();
    expect(screen.getByText('Welcome to Zappy')).toBeInTheDocument();
    expect(screen.getByText('Choose your portal')).toBeInTheDocument();
  });

  test('renders patient login and staff login buttons', () => {
    renderWithRouter(<LandingPage />);
    
    const patientLoginButton = screen.getByText('Patient Login');
    const staffLoginButton = screen.getByText('Staff Login');
    
    expect(patientLoginButton).toBeInTheDocument();
    expect(staffLoginButton).toBeInTheDocument();
  });

  test('renders icons in login buttons', () => {
    renderWithRouter(<LandingPage />);
    
    expect(screen.getByTestId('user-icon')).toBeInTheDocument();
    expect(screen.getByTestId('shield-icon')).toBeInTheDocument();
  });

  test('login buttons have the correct links', () => {
    renderWithRouter(<LandingPage />);
    
    const patientLoginButton = screen.getByText('Patient Login').closest('a');
    const staffLoginButton = screen.getByText('Staff Login').closest('a');
    
    expect(patientLoginButton).toHaveAttribute('href', '/login');
    expect(staffLoginButton).toHaveAttribute('href', '/login');
  });
});