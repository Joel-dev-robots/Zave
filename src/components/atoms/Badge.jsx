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
  
  // Variant-specific classes (usando las clases disponibles en Tailwind)
  const variantClasses = {
    primary: 'bg-primary-100 text-primary-800 dark:bg-primary-900/30 dark:text-primary-300',
    success: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
    warning: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
    danger: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
    info: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
    gray: 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300',
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