import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import OrderDetailModal from './OrderDetailModal';
import { useOrderById } from '../../apis/orders/hooks';
import { StatusBadge } from '../../pages/orders/PatientOrderHistoryPage';
import ChildishDrawingElement from '../ui/ChildishDrawingElement';

// Mock the dependencies
jest.mock('../../apis/orders/hooks', () => ({
  useOrderById: jest.fn(),
}));

jest.mock('../../pages/orders/PatientOrderHistoryPage', () => ({
  StatusBadge: jest.fn(() => <span data-testid="status-badge">Processing</span>),
}));

jest.mock('../ui/ChildishDrawingElement', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="mock-childish-drawing" />),
}));

describe('OrderDetailModal', () => {
  // Set up common mock data
  const mockOrder = {
    id: 'order-123',
    orderId: 'ORD-123-456',
    created_at: '2025-04-15T10:30:00Z',
    status: 'processing',
    totalAmount: 59.99,
    items: [
      { name: 'Medication A', quantity: 1, price: 29.99 },
      { name: 'Medication B', quantity: 2, price: 15.00 },
    ],
    shipping_address: {
      street: '123 Health St',
      city: 'Wellnessville',
      state: 'CA',
      zip: '90210',
      country: 'USA',
    },
  };

  const mockShippedOrder = {
    ...mockOrder,
    status: 'shipped',
    trackingNumber: 'TRACK123456789',
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('does not render when isOpen is false', () => {
    // Set up the hook mock
    useOrderById.mockReturnValue({
      data: mockOrder,
      isLoading: false,
      error: null,
    });

    render(<OrderDetailModal orderId="order-123" isOpen={false} onClose={() => {}} />);
    
    // Verify the modal is not rendered
    expect(screen.queryByText('Order Details')).not.toBeInTheDocument();
    
    // Verify the hook was not called
    expect(useOrderById).not.toHaveBeenCalled();
  });

  test('shows loading state while fetching order data', () => {
    // Set up the hook mock to return loading state
    useOrderById.mockReturnValue({
      data: null,
      isLoading: true,
      error: null,
    });

    render(<OrderDetailModal orderId="order-123" isOpen={true} onClose={() => {}} />);
    
    // Verify loading state is displayed
    expect(screen.getByText('Loading order details...')).toBeInTheDocument();
    
    // Verify the hook was called with correct parameters
    expect(useOrderById).toHaveBeenCalledWith('order-123', {
      enabled: true, // isOpen && !!orderId
    });
  });

  test('shows error state when there is an API error', () => {
    // Set up the hook mock to return error state
    const mockError = new Error('Failed to fetch order details');
    useOrderById.mockReturnValue({
      data: null,
      isLoading: false,
      error: mockError,
    });

    render(<OrderDetailModal orderId="order-123" isOpen={true} onClose={() => {}} />);
    
    // Verify error state is displayed
    expect(screen.getByText('Error loading order details.')).toBeInTheDocument();
    expect(screen.getByText('Failed to fetch order details')).toBeInTheDocument();
  });

  test('shows "not found" state when order data is null', () => {
    // Set up the hook mock to return null data
    useOrderById.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });

    render(<OrderDetailModal orderId="order-123" isOpen={true} onClose={() => {}} />);
    
    // Verify not found state is displayed
    expect(screen.getByText('Order details not found.')).toBeInTheDocument();
  });

  test('renders order details correctly', () => {
    // Set up the hook mock to return order data
    useOrderById.mockReturnValue({
      data: mockOrder,
      isLoading: false,
      error: null,
    });

    render(<OrderDetailModal orderId="order-123" isOpen={true} onClose={() => {}} />);
    
    // Verify order metadata is displayed
    expect(screen.getByText('ORD-123-456')).toBeInTheDocument();
    expect(screen.getByText(/April 15, 2025/)).toBeInTheDocument();
    expect(screen.getByTestId('status-badge')).toBeInTheDocument();
    expect(screen.getByText('$59.99')).toBeInTheDocument();
    
    // Verify items are displayed
    expect(screen.getByText('Items Ordered')).toBeInTheDocument();
    expect(screen.getByText('Medication A')).toBeInTheDocument();
    expect(screen.getByText('Medication B (x2)')).toBeInTheDocument();
    expect(screen.getByText('$29.99')).toBeInTheDocument();
    expect(screen.getByText('$15.00')).toBeInTheDocument();
    
    // Verify shipping address is displayed
    expect(screen.getByText('Shipping Address')).toBeInTheDocument();
    expect(screen.getByText('123 Health St')).toBeInTheDocument();
    expect(screen.getByText('Wellnessville, CA 90210')).toBeInTheDocument();
    expect(screen.getByText('USA')).toBeInTheDocument();
    
    // Verify tracking information is not shown for non-shipped orders
    expect(screen.queryByText('Tracking Information')).not.toBeInTheDocument();
    
    // Verify ChildishDrawingElement is rendered
    expect(ChildishDrawingElement).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'doodle',
        color: 'accent1',
        position: 'top-right',
      }),
      expect.anything()
    );
  });

  test('renders tracking information for shipped orders', async () => {
    // Set up the hook mock to return a shipped order
    useOrderById.mockReturnValue({
      data: mockShippedOrder,
      isLoading: false,
      error: null,
    });

    render(<OrderDetailModal orderId="order-123" isOpen={true} onClose={() => {}} />);
    
    // Verify tracking information is displayed for shipped orders
    expect(screen.getByText('Tracking Information')).toBeInTheDocument();
    
    const trackingLink = screen.getByRole('link', { name: 'TRACK123456789' });
    expect(trackingLink).toBeInTheDocument();
    expect(trackingLink.href).toContain('https://www.google.com/search?q=TRACK123456789');
    expect(trackingLink).toHaveAttribute('target', '_blank');
    expect(trackingLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('shows empty tracking message when status is shipped but no tracking number', () => {
    // Set up the hook mock to return a shipped order without tracking number
    const orderWithoutTracking = {
      ...mockShippedOrder,
      trackingNumber: null,
    };
    
    useOrderById.mockReturnValue({
      data: orderWithoutTracking,
      isLoading: false,
      error: null,
    });

    render(<OrderDetailModal orderId="order-123" isOpen={true} onClose={() => {}} />);
    
    // Verify tracking section is shown with empty message
    expect(screen.getByText('Tracking Information')).toBeInTheDocument();
    expect(screen.getByText('Tracking information not available yet.')).toBeInTheDocument();
  });

  test('handles orders with fallback item structure', () => {
    // Set up the hook mock to return legacy order format
    const legacyOrder = {
      id: 'order-456',
      created_at: '2025-04-10T14:20:00Z',
      status: 'completed',
      medication: 'Legacy Medication',
      totalAmount: 45.50,
    };
    
    useOrderById.mockReturnValue({
      data: legacyOrder,
      isLoading: false,
      error: null,
    });

    render(<OrderDetailModal orderId="order-456" isOpen={true} onClose={() => {}} />);
    
    // Verify item is displayed using legacy format
    expect(screen.getByText('Legacy Medication')).toBeInTheDocument();
    expect(screen.getByText('$45.50')).toBeInTheDocument();
  });

  test('handles orders with fallback shipping address', () => {
    // Set up the hook mock to return order without shipping address
    const orderWithoutAddress = {
      ...mockOrder,
      shipping_address: null,
    };
    
    useOrderById.mockReturnValue({
      data: orderWithoutAddress,
      isLoading: false,
      error: null,
    });

    render(<OrderDetailModal orderId="order-123" isOpen={true} onClose={() => {}} />);
    
    // Verify fallback address is displayed
    expect(screen.getByText('123 Health St')).toBeInTheDocument();
    expect(screen.getByText('Wellnessville, CA 90210')).toBeInTheDocument();
  });

  test('closes modal when close button is clicked', () => {
    // Set up the hook mock
    useOrderById.mockReturnValue({
      data: mockOrder,
      isLoading: false,
      error: null,
    });

    const handleClose = jest.fn();
    
    render(<OrderDetailModal orderId="order-123" isOpen={true} onClose={handleClose} />);
    
    // Click the close button
    const closeButton = screen.getByRole('button', { name: '' }); // X button has no text
    closeButton.click();
    
    // Verify onClose was called
    expect(handleClose).toHaveBeenCalledTimes(1);
    
    // Click the footer close button
    const footerCloseButton = screen.getByRole('button', { name: 'Close' });
    footerCloseButton.click();
    
    // Verify onClose was called again
    expect(handleClose).toHaveBeenCalledTimes(2);
  });

  test('handles different date and ID field names', () => {
    // Set up the hook mock with alternative field names
    const alternativeOrder = {
      id: null,
      orderId: 'ALT-ORDER-789',
      created_at: null,
      order_date: '2025-04-20T09:15:00Z',
      status: 'processing',
      invoiceAmount: 79.99,
      items: [{ name: 'Alternative Medication', quantity: 1, price: 79.99 }],
    };
    
    useOrderById.mockReturnValue({
      data: alternativeOrder,
      isLoading: false,
      error: null,
    });

    render(<OrderDetailModal orderId="order-789" isOpen={true} onClose={() => {}} />);
    
    // Verify alternative field names are handled
    expect(screen.getByText('ALT-ORDER-789')).toBeInTheDocument();
    expect(screen.getByText(/April 20, 2025/)).toBeInTheDocument();
    expect(screen.getByText('$79.99')).toBeInTheDocument();
  });
});