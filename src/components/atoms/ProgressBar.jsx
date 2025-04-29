import React from 'react';

/**
 * ProgressBar component for displaying progress
 * @param {Object} props - Component props
 * @param {number} props.progress - Progress percentage (0-100)
 * @param {'primary'|'success'|'warning'|'danger'} [props.variant='primary'] - Color variant
 * @param {'sm'|'md'|'lg'} [props.size='md'] - Size variant
 * @param {boolean} [props.showPercentage=false] - Whether to show percentage text
 * @param {string} [props.className=''] - Additional CSS classes
 */
const ProgressBar = ({ 
  progress, 
  variant = 'primary', 
  size = 'md',
  showPercentage = false,
  className = '',
  ...rest
}) => {
  // Ensure progress is between 0 and 100
  const normalizedProgress = Math.min(Math.max(progress, 0), 100);
  
  // Size-specific classes
  const sizeClasses = {
    sm: 'h-1.5',
    md: 'h-2.5',
    lg: 'h-4',
  };
  
  // Variant-specific classes
  const variantClasses = {
    primary: 'bg-primary-500',
    success: 'bg-success-500',
    warning: 'bg-warning-500',
    danger: 'bg-danger-500',
  };
  
  return (
    <div className={`relative w-full ${className}`} {...rest}>
      {/* Background */}
      <div className={`w-full bg-gray-200 rounded-full overflow-hidden ${sizeClasses[size]}`}>
        {/* Foreground */}
        <div 
          className={`${variantClasses[variant]} rounded-full transition-all duration-500 ease-out ${sizeClasses[size]}`}
          style={{ width: `${normalizedProgress}%` }}
        ></div>
      </div>
      
      {/* Percentage text */}
      {showPercentage && (
        <div className="text-xs font-medium text-gray-500 mt-1">
          {normalizedProgress.toFixed(0)}%
        </div>
      )}
    </div>
  );
};

export default ProgressBar; 