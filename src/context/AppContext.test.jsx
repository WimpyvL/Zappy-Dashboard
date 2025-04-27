import React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AppProvider, useAppContext } from './AppContext';

// Create a test component that uses the context
const TestComponent = () => {
  const { viewMode, setViewMode } = useAppContext();
  
  return (
    <div>
      <div data-testid="view-mode">{viewMode}</div>
      <button onClick={() => setViewMode('admin')}>Set Admin Mode</button>
      <button onClick={() => setViewMode('patient')}>Set Patient Mode</button>
      <button onClick={() => setViewMode('invalid')}>Set Invalid Mode</button>
    </div>
  );
};

describe('AppContext', () => {
  // Mock localStorage
  const localStorageMock = {
    getItem: jest.fn(),
    setItem: jest.fn(),
    clear: jest.fn(),
  };
  
  beforeEach(() => {
    // Setup mock for localStorage
    Object.defineProperty(window, 'localStorage', { value: localStorageMock });
    
    // Clear mock calls before each test
    jest.clearAllMocks();
    
    // Silence console warnings for the invalid mode test
    jest.spyOn(console, 'warn').mockImplementation(() => {});
  });
  
  afterEach(() => {
    // Restore console.warn
    console.warn.mockRestore();
  });

  test('provides default view mode as admin', () => {
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );
    
    // Check that viewMode is 'admin' by default
    expect(screen.getByTestId('view-mode')).toHaveTextContent('admin');
    
    // Verify localStorage was updated with the default view mode
    expect(localStorageMock.setItem).toHaveBeenCalledWith('appViewMode', 'admin');
  });

  test('allows changing view mode to patient', async () => {
    const user = userEvent.setup();
    
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );
    
    // Click the button to set patient mode
    await user.click(screen.getByText('Set Patient Mode'));
    
    // Check that viewMode has changed to 'patient'
    expect(screen.getByTestId('view-mode')).toHaveTextContent('patient');
    
    // Verify localStorage was updated
    expect(localStorageMock.setItem).toHaveBeenCalledWith('appViewMode', 'patient');
  });

  test('allows changing view mode to admin', async () => {
    const user = userEvent.setup();
    
    // Setup initial state as 'patient' mode
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );
    
    // First change to patient mode
    await user.click(screen.getByText('Set Patient Mode'));
    
    // Then change back to admin mode
    await user.click(screen.getByText('Set Admin Mode'));
    
    // Check that viewMode has changed to 'admin'
    expect(screen.getByTestId('view-mode')).toHaveTextContent('admin');
    
    // Verify localStorage was updated
    expect(localStorageMock.setItem).toHaveBeenCalledWith('appViewMode', 'admin');
  });

  test('ignores invalid view mode', async () => {
    const user = userEvent.setup();
    
    render(
      <AppProvider>
        <TestComponent />
      </AppProvider>
    );
    
    // Try to set an invalid mode
    await user.click(screen.getByText('Set Invalid Mode'));
    
    // View mode should remain as 'admin'
    expect(screen.getByTestId('view-mode')).toHaveTextContent('admin');
    
    // Verify console warning was issued
    expect(console.warn).toHaveBeenCalledWith(expect.stringContaining('Invalid view mode attempted: invalid'));
  });

  test('throws error when useAppContext is used outside provider', () => {
    // Mock console.error to prevent error logging during test
    const originalError = console.error;
    console.error = jest.fn();
    
    // Expect the render to throw an error
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAppContext must be used within an AppProvider');
    
    // Restore console.error
    console.error = originalError;
  });

  test('persists view mode to localStorage', () => {
    // Render with AppProvider
    render(
      <AppProvider>
        <div>Test</div>
      </AppProvider>
    );
    
    // Should set the default view mode in localStorage
    expect(localStorageMock.setItem).toHaveBeenCalledWith('appViewMode', 'admin');
  });

  test('handles localStorage errors gracefully', () => {
    // Mock console.error to verify it's called
    const originalError = console.error;
    console.error = jest.fn();
    
    // Make localStorage.setItem throw an error
    localStorageMock.setItem.mockImplementation(() => {
      throw new Error('localStorage is not available');
    });
    
    // Render should not throw despite localStorage error
    render(
      <AppProvider>
        <div>Test</div>
      </AppProvider>
    );
    
    // Verify the error was logged
    expect(console.error).toHaveBeenCalledWith(
      "Error writing viewMode to localStorage", 
      expect.any(Error)
    );
    
    // Restore console.error
    console.error = originalError;
  });
});