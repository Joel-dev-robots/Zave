import React, { useEffect, useRef } from 'react';
import Button from '../atoms/Button';

/**
 * Modal component for dialogs and popups
 * @param {Object} props - Component props
 * @param {boolean} props.isOpen - Whether the modal is open
 * @param {Function} props.onClose - Handler for closing the modal
 * @param {string} props.title - Modal title
 * @param {React.ReactNode} props.children - Modal content
 * @param {React.ReactNode} [props.footer] - Modal footer content (optional)
 * @param {string} [props.size='md'] - Modal size (sm, md, lg, xl)
 */
const Modal = ({ 
  isOpen, 
  onClose, 
  title, 
  children, 
  footer,
  size = 'md',
}) => {
  const modalRef = useRef(null);
  
  // Handle escape key press
  useEffect(() => {
    const handleEscapeKey = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'hidden';
    }
    
    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
      document.body.style.overflow = 'auto';
    };
  }, [isOpen, onClose]);
  
  // Handle clicking outside the modal
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (modalRef.current && !modalRef.current.contains(e.target)) {
        onClose();
      }
    };
    
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen, onClose]);
  
  // Size classes
  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-lg',
    lg: 'max-w-2xl',
    xl: 'max-w-4xl',
  };
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black bg-opacity-25 flex items-center justify-center p-4">
      <div
        ref={modalRef}
        className={`w-full ${sizeClasses[size]} bg-white rounded-lg shadow-xl p-6 transform transition-all duration-300 ease-in-out`}
      >
        {/* Header with title and close button */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold leading-6 text-gray-900">
            {title}
          </h3>
          
          <button
            type="button"
            className="text-gray-400 hover:text-gray-500 focus:outline-none"
            onClick={onClose}
          >
            <span className="sr-only">Close</span>
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        {/* Content */}
        <div className="mt-2">
          {children}
        </div>

        {/* Footer */}
        {footer && (
          <div className="mt-6 flex justify-end space-x-3">
            {footer}
          </div>
        )}
      </div>
    </div>
  );
};

/**
 * Modal.Footer component for standard modal actions
 */
Modal.Footer = ({ 
  onCancel, 
  onConfirm, 
  cancelText = 'Cancel', 
  confirmText = 'Confirm',
  confirmVariant = 'primary',
  isConfirmLoading = false,
  isConfirmDisabled = false,
}) => {
  return (
    <>
      <Button variant="secondary" onClick={onCancel}>
        {cancelText}
      </Button>
      <Button 
        variant={confirmVariant} 
        onClick={onConfirm}
        disabled={isConfirmDisabled || isConfirmLoading}
      >
        {isConfirmLoading ? 'Loading...' : confirmText}
      </Button>
    </>
  );
};

export default Modal; 