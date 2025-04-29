import React from 'react';

/**
 * Badge component for status indicators and labels
 * @param {Object} props - Component props
 * @param {'primary'|'success'|'warning'|'danger'|'info'|'gray'} [props.variant='primary'] - Badge variant
 * @param {'sm'|'md'} [props.size='md'] - Badge size
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {React.ReactNode} props.children - Badge content
 */
const Badge = ({ 
  variant = 'primary', 
  size = 'md', 
  className = '', 
  children,
  ...rest
}) => {
  // Base classes for all badges
  const baseClasses = 'inline-flex items-center justify-center font-medium rounded-full';
  
  // Size-specific classes
  const sizeClasses = {
    sm: 'px-2 py-0.5 text-xs',
    md: 'px-2.5 py-0.5 text-sm',
  };
  
  // Variant-specific classes
  const variantClasses = {
    primary: 'bg-primary-100 text-primary-800',
    success: 'bg-success-100 text-success-800',
    warning: 'bg-warning-100 text-warning-800',
    danger: 'bg-danger-100 text-danger-800',
    info: 'bg-blue-100 text-blue-800',
    gray: 'bg-gray-100 text-gray-800',
  };
  
  // Combined classes
  const combinedClasses = [
    baseClasses,
    sizeClasses[size],
    variantClasses[variant],
    className
  ].join(' ');
  
  return (
    <span
      className={combinedClasses}
      {...rest}
    >
      {children}
    </span>
  );
};

export default Badge; 