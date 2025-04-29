import React from 'react';

/**
 * Button component with multiple variants
 * @param {Object} props - Component props
 * @param {'primary'|'secondary'|'tertiary'|'danger'|'success'|'warning'} [props.variant='primary'] - Button variant
 * @param {'sm'|'md'|'lg'} [props.size='md'] - Button size
 * @param {boolean} [props.fullWidth=false] - Whether button takes full width
 * @param {React.ReactNode} props.children - Button content
 */
const Button = ({ 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false, 
  className = '', 
  disabled = false,
  type = 'button',
  onClick,
  children,
  ...rest
}) => {
  // Base classes for all buttons
  const baseClasses = 'inline-flex items-center justify-center font-medium transition-colors rounded focus:outline-none focus:ring-2 focus:ring-offset-2';
  
  // Size-specific classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-6 py-3 text-lg',
  };
  
  // Variant-specific classes
  const variantClasses = {
    primary: 'bg-primary-500 text-white hover:bg-primary-600 focus:ring-primary-500 disabled:bg-primary-300',
    secondary: 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-primary-500 disabled:bg-gray-100 disabled:text-gray-400',
    tertiary: 'bg-transparent text-primary-500 hover:bg-primary-50 focus:ring-primary-500 disabled:text-primary-300',
    success: 'bg-success-500 text-white hover:bg-success-600 focus:ring-success-500 disabled:bg-success-300',
    warning: 'bg-warning-500 text-white hover:bg-warning-600 focus:ring-warning-500 disabled:bg-warning-300',
    danger: 'bg-danger-500 text-white hover:bg-danger-600 focus:ring-danger-500 disabled:bg-danger-300',
  };
  
  // Combined classes
  const combinedClasses = [
    baseClasses,
    sizeClasses[size],
    variantClasses[variant],
    fullWidth ? 'w-full' : '',
    disabled ? 'cursor-not-allowed' : 'cursor-pointer',
    className
  ].join(' ');
  
  return (
    <button
      type={type}
      className={combinedClasses}
      disabled={disabled}
      onClick={onClick}
      {...rest}
    >
      {children}
    </button>
  );
};

export default Button; 