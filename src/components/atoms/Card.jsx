import React from 'react';

/**
 * Card component with multiple variants
 * @param {Object} props - Component props
 * @param {'default'|'primary'|'success'|'warning'|'danger'} [props.variant='default'] - Card variant
 * @param {string} [props.className=''] - Additional CSS classes
 * @param {React.ReactNode} props.children - Card content
 */
const Card = ({ 
  variant = 'default', 
  className = '', 
  children,
  ...rest
}) => {
  // Variant-specific classes
  const variantClasses = {
    default: 'bg-white border border-gray-200 dark:bg-gray-800 dark:border-gray-700',
    primary: 'bg-primary-50 border border-primary-200 dark:bg-primary-900/30 dark:border-primary-800/50',
    success: 'bg-success-50 border border-success-200 dark:bg-success-900/30 dark:border-success-800/50',
    warning: 'bg-warning-50 border border-warning-200 dark:bg-warning-900/30 dark:border-warning-800/50',
    danger: 'bg-danger-50 border border-danger-200 dark:bg-danger-900/30 dark:border-danger-800/50',
  };
  
  // Combined classes
  const combinedClasses = [
    'rounded-lg shadow-md p-5 text-left',
    variantClasses[variant],
    className
  ].join(' ');
  
  return (
    <div
      className={combinedClasses}
      {...rest}
    >
      {children}
    </div>
  );
};

export default Card; 