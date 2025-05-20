import React from 'react';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import MainLayout from './MainLayout';
import { useAppContext } from '../contexts/app/AppContext';
import { patientSidebarItems } from '../constants/SidebarItems';

// Mock dependencies
jest.mock('./components/Headers', () => () => <div data-testid="mock-header">Header</div>);
jest.mock('./components/Sidebar', () => () => <div data-testid="mock-sidebar">Sidebar</div>);
jest.mock('../pages/shop/components/ShoppingCart', () => ({ isOpen, onClose }) => (
  <div data-testid="mock-shopping-cart" data-is-open={isOpen}>
    Shopping Cart
  </div>
));

jest.mock('../contexts/app/AppContext', () => ({
  useAppContext: jest.fn(),
}));

jest.mock('../constants/SidebarItems', () => ({
  patientSidebarItems: [
    { path: '/dashboard', title: 'Dashboard', icon: () => <div>DashboardIcon</div>, color: 'primary' },
    { path: '/appointments', title: 'Appointments', icon: () => <div>AppointmentsIcon</div>, color: 'accent2' },
    { path: '/profile', title: 'Profile', icon: () => <div>ProfileIcon</div>, color: 'accent3' },
  ],
}));

// Mock useLocation hook
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useLocation: () => ({ pathname: '/dashboard' }),
}));

describe('MainLayout Component', () => {
  beforeEach(() => {
    // Default mock implementation for useAppContext
    useAppContext.mockReturnValue({ viewMode: 'standard' });
  });

  test('renders the layout with header and sidebar', () => {
    render(
      <BrowserRouter>
        <MainLayout>
          <div data-testid="test-content">Test Content</div>
        </MainLayout>
      </BrowserRouter>
    );
    
    // Check that the main components are rendered
    expect(screen.getByTestId('mock-header')).toBeInTheDocument();
    expect(screen.getByTestId('mock-sidebar')).toBeInTheDocument();
    expect(screen.getByTestId('mock-shopping-cart')).toBeInTheDocument();
    
    // Check that the cart is initially closed
    expect(screen.getByTestId('mock-shopping-cart')).toHaveAttribute('data-is-open', 'false');
    
    // Check that children are rendered
    expect(screen.getByTestId('test-content')).toBeInTheDocument();
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });
  
  test('renders mobile navigation when in patient view mode', () => {
    // Mock patient view mode
    useAppContext.mockReturnValue({ viewMode: 'patient' });
    
    render(
      <BrowserRouter>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </BrowserRouter>
    );
    
    // Check that patient navigation items are rendered
    expect(screen.getByText('Dashboard')).toBeInTheDocument();
    expect(screen.getByText('Appointments')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
  });
  
  test('does not render mobile navigation when not in patient view mode', () => {
    // Mock provider view mode
    useAppContext.mockReturnValue({ viewMode: 'provider' });
    
    render(
      <BrowserRouter>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </BrowserRouter>
    );
    
    // Check that patient navigation items are not rendered
    expect(screen.queryByText('Dashboard')).not.toBeInTheDocument();
    expect(screen.queryByText('Appointments')).not.toBeInTheDocument();
    expect(screen.queryByText('Profile')).not.toBeInTheDocument();
  });
  
  test('applies correct gradient background classes', () => {
    const { container } = render(
      <BrowserRouter>
        <MainLayout>
          <div>Test Content</div>
        </MainLayout>
      </BrowserRouter>
    );
    
    // Check for gradient classes
    const mainDiv = container.firstChild;
    expect(mainDiv).toHaveClass('bg-gradient-to-br');
    expect(mainDiv).toHaveClass('from-accent1/5');
    expect(mainDiv).toHaveClass('via-white');
    expect(mainDiv).toHaveClass('to-accent2/5');
  });
});
