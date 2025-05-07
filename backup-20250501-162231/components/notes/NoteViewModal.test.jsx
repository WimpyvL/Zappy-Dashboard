import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import '@testing-library/jest-dom';
import NoteViewModal from './NoteViewModal';
import ChildishDrawingElement from '../ui/ChildishDrawingElement';

// Mock the ChildishDrawingElement component
jest.mock('../ui/ChildishDrawingElement', () => ({
  __esModule: true,
  default: jest.fn(() => <div data-testid="mock-childish-drawing" />),
}));

// Mock URL.createObjectURL and URL.revokeObjectURL
URL.createObjectURL = jest.fn(() => 'mock-url');
URL.revokeObjectURL = jest.fn();

describe('NoteViewModal', () => {
  const mockNote = {
    id: '123',
    title: 'Test Note Title',
    description: 'This is a test note description.\nWith multiple lines.',
    created_at: '2025-04-20T14:30:00Z',
    authorName: 'Dr. Test User',
  };

  // Mock document.createElement and related functions for download testing
  const mockAnchor = {
    href: '',
    download: '',
    click: jest.fn(),
  };

  const originalCreateElement = document.createElement;
  const originalAppendChild = document.body.appendChild;
  const originalRemoveChild = document.body.removeChild;

  beforeEach(() => {
    // Reset mocks before each test
    jest.clearAllMocks();
    
    // Mock document methods for download functionality
    document.createElement = jest.fn().mockImplementation((tag) => {
      if (tag === 'a') return mockAnchor;
      return originalCreateElement.call(document, tag);
    });
    document.body.appendChild = jest.fn();
    document.body.removeChild = jest.fn();
  });

  afterEach(() => {
    // Restore original document methods
    document.createElement = originalCreateElement;
    document.body.appendChild = originalAppendChild;
    document.body.removeChild = originalRemoveChild;
  });

  test('does not render when isOpen is false', () => {
    render(<NoteViewModal note={mockNote} isOpen={false} onClose={() => {}} />);
    expect(screen.queryByText('Test Note Title')).not.toBeInTheDocument();
  });

  test('does not render when note is null', () => {
    render(<NoteViewModal note={null} isOpen={true} onClose={() => {}} />);
    expect(screen.queryByText('Test Note Title')).not.toBeInTheDocument();
  });

  test('renders correctly with note data', () => {
    render(<NoteViewModal note={mockNote} isOpen={true} onClose={() => {}} />);

    // Check that title is displayed
    expect(screen.getByText('Test Note Title')).toBeInTheDocument();
    
    // Check that date is formatted and displayed
    expect(screen.getByText(/April 20, 2025/)).toBeInTheDocument();
    
    // Check that author name is displayed
    expect(screen.getByText(/By: Dr. Test User/)).toBeInTheDocument();
    
    // Check that description is displayed and preserves whitespace
    const description = screen.getByText('This is a test note description.', { exact: false });
    expect(description).toBeInTheDocument();
    expect(description).toHaveClass('whitespace-pre-wrap');
    
    // Check that decorative elements are rendered
    expect(ChildishDrawingElement).toHaveBeenCalledTimes(2);
    
    // Check that buttons are displayed
    expect(screen.getByText('Download')).toBeInTheDocument();
    expect(screen.getByText('Close')).toBeInTheDocument();
  });

  test('handles missing note fields gracefully', () => {
    const incompleteNote = {
      id: '456',
      // No title
      // No description
      // No created_at
      // No authorName
    };

    render(
      <NoteViewModal note={incompleteNote} isOpen={true} onClose={() => {}} />
    );

    // Check that defaults are used
    expect(screen.getByText('Session Note')).toBeInTheDocument(); // Default title
    expect(screen.getByText('No content available.')).toBeInTheDocument(); // Default content
    expect(screen.getByText('-')).toBeInTheDocument(); // Default date format
    
    // Author section should not be rendered
    const authorElements = screen.queryAllByText(/By:/);
    expect(authorElements.length).toBe(0);
  });

  test('handles date from note.date when created_at is missing', () => {
    const noteWithDate = {
      ...mockNote,
      created_at: null,
      date: '2025-03-15T10:00:00Z',
    };

    render(
      <NoteViewModal note={noteWithDate} isOpen={true} onClose={() => {}} />
    );

    // Check that date from note.date is used and formatted
    expect(screen.getByText(/March 15, 2025/)).toBeInTheDocument();
  });

  test('calls onClose when close button is clicked', () => {
    const handleClose = jest.fn();
    render(
      <NoteViewModal note={mockNote} isOpen={true} onClose={handleClose} />
    );

    // Click the X button
    const closeButton = screen.getAllByRole('button')[0];
    fireEvent.click(closeButton);
    expect(handleClose).toHaveBeenCalledTimes(1);

    // Click the Close button in footer
    const footerCloseButton = screen.getByText('Close');
    fireEvent.click(footerCloseButton);
    expect(handleClose).toHaveBeenCalledTimes(2);
  });

  test('downloads note content when Download button is clicked', () => {
    render(
      <NoteViewModal note={mockNote} isOpen={true} onClose={() => {}} />
    );

    // Click the Download button
    const downloadButton = screen.getByText('Download');
    fireEvent.click(downloadButton);

    // Check that the download functionality was triggered correctly
    expect(document.createElement).toHaveBeenCalledWith('a');
    expect(mockAnchor.href).toBe('mock-url');
    expect(mockAnchor.download).toContain('test_note_title_');
    expect(mockAnchor.click).toHaveBeenCalled();
    expect(document.body.appendChild).toHaveBeenCalled();
    expect(document.body.removeChild).toHaveBeenCalled();
    expect(URL.createObjectURL).toHaveBeenCalled();
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('mock-url');
    
    // Verify the blob content format
    const blobCall = URL.createObjectURL.mock.calls[0][0];
    expect(blobCall).toBeInstanceOf(Blob);
  });

  test('sanitizes filename for download', () => {
    const noteWithSpecialChars = {
      ...mockNote,
      title: 'Special@#$%^&*()_+Chars!',
    };

    render(
      <NoteViewModal note={noteWithSpecialChars} isOpen={true} onClose={() => {}} />
    );

    // Click the Download button
    const downloadButton = screen.getByText('Download');
    fireEvent.click(downloadButton);

    // Check that the filename is sanitized
    expect(mockAnchor.download).toMatch(/^special_________chars_\d{4}-\d{2}-\d{2}\.txt$/);
  });
});