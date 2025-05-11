import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';
import Button from './Button';

/**
 * AccessibleModal component
 * 
 * An accessible modal dialog with proper focus management and keyboard navigation
 * 
 * @param {object} props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {function} props.onClose - Function to call when modal is closed
 * @param {string} props.title - Modal title
 * @param {node} props.children - Modal content
 * @param {string} props.className - Additional CSS classes for the modal
 * @param {string} props.size - Modal size (small, medium, large, full)
 * @param {boolean} props.closeOnEsc - Whether to close modal on ESC key
 * @param {boolean} props.closeOnOutsideClick - Whether to close modal when clicking outside
 */
const AccessibleModal = ({ 
  isOpen, 
  onClose, 
  title, 
  children,
  className = '',
  size = 'medium',
  closeOnEsc = true,
  closeOnOutsideClick = true
}) => {
  const modalRef = useRef(null);
  const previousFocusRef = useRef(null);
  
  // Size classes
  const sizeClasses = {
    small: 'max-w-sm',
    medium: 'max-w-md',
    large: 'max-w-lg',
    xl: 'max-w-xl',
    '2xl': 'max-w-2xl',
    full: 'max-w-full mx-4'
  };
  
  // Handle modal open/close effects
  useEffect(() => {
    if (isOpen) {
      // Store the element that had focus before opening the modal
      previousFocusRef.current = document.activeElement;
      
      // Focus the modal when it opens
      if (modalRef.current) {
        modalRef.current.focus();
      }
      
      // Prevent scrolling on the body
      document.body.style.overflow = 'hidden';
      
      // Add event listener for ESC key
      if (closeOnEsc) {
        const handleKeyDown = (e) => {
          if (e.key === 'Escape') {
            onClose();
          }
        };
        
        document.addEventListener('keydown', handleKeyDown);
        return () => {
          document.removeEventListener('keydown', handleKeyDown);
        };
      }
    } else {
      // Restore focus when modal closes
      if (previousFocusRef.current) {
        previousFocusRef.current.focus();
      }
      
      // Restore scrolling
      document.body.style.overflow = '';
    }
    
    // Clean up
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen, closeOnEsc, onClose]);
  
  // Handle click outside modal
  const handleBackdropClick = (e) => {
    if (closeOnOutsideClick && e.target === e.currentTarget) {
      onClose();
    }
  };
  
  if (!isOpen) return null;
  
  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity"
      onClick={handleBackdropClick}
      aria-modal="true"
      role="dialog"
      aria-labelledby="modal-title"
    >
      <div 
        ref={modalRef}
        className={`bg-white rounded-lg shadow-xl w-full ${sizeClasses[size]} max-h-[90vh] overflow-auto ${className}`}
        tabIndex={-1}
      >
        <div className="flex justify-between items-center p-4 border-b border-border-gray">
          <h2 id="modal-title" className="text-lg font-bold text-text-dark">{title}</h2>
          <button
            onClick={onClose}
            aria-label="Close modal"
            className="rounded-full w-8 h-8 p-0 flex items-center justify-center text-gray-500 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-4">
          {children}
        </div>
      </div>
    </div>
  );
};

AccessibleModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  title: PropTypes.string.isRequired,
  children: PropTypes.node.isRequired,
  className: PropTypes.string,
  size: PropTypes.oneOf(['small', 'medium', 'large', 'xl', '2xl', 'full']),
  closeOnEsc: PropTypes.bool,
  closeOnOutsideClick: PropTypes.bool
};

export default AccessibleModal;
