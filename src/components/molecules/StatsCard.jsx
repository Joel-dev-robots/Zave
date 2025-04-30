import React from 'react';
import Card from '../atoms/Card';

/**
 * StatsCard component for displaying summary statistics
 * @param {Object} props - Component props
 * @param {string} props.title - Card title
 * @param {string|number} props.value - Main value to display
 * @param {React.ReactNode} [props.icon] - Optional icon to display
 * @param {'default'|'primary'|'success'|'warning'|'danger'} [props.variant='default'] - Card variant
 * @param {string} [props.trend] - Optional trend indicator (e.g., '+10%')
 * @param {boolean} [props.isTrendUp] - Whether the trend is positive
 * @param {string} [props.className=''] - Additional CSS classes
 */
const StatsCard = ({ 
  title, 
  value, 
  icon, 
  variant = 'default',
  trend,
  isTrendUp,
  className = '',
  ...rest
}) => {
  return (
    <Card 
      variant={variant}
      className={`flex items-center ${className}`}
      {...rest}
    >
      {/* Icon container */}
      {icon && (
        <div className={`
          flex-shrink-0 p-3 rounded-lg mr-4
          ${variant === 'primary' ? 'bg-primary-100 text-primary-600 dark:bg-primary-900/50 dark:text-primary-300' : ''}
          ${variant === 'success' ? 'bg-success-100 text-success-600 dark:bg-success-900/50 dark:text-success-300' : ''}
          ${variant === 'warning' ? 'bg-warning-100 text-warning-600 dark:bg-warning-900/50 dark:text-warning-300' : ''}
          ${variant === 'danger' ? 'bg-danger-100 text-danger-600 dark:bg-danger-900/50 dark:text-danger-300' : ''}
          ${variant === 'default' ? 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-300' : ''}
        `}>
          {icon}
        </div>
      )}
      
      {/* Content */}
      <div className="flex-1">
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">{title}</h3>
        <div className="flex items-end">
          <div className={`text-2xl font-bold ${
            variant === 'primary' ? 'text-primary-700 dark:text-primary-300' : 
            variant === 'success' ? 'text-success-700 dark:text-success-300' : 
            variant === 'warning' ? 'text-warning-700 dark:text-warning-300' : 
            variant === 'danger' ? 'text-danger-700 dark:text-danger-300' : 
            'text-gray-900 dark:text-gray-100'
          }`}>
            {value}
          </div>
          
          {/* Optional trend indicator */}
          {trend && (
            <div className={`
              ml-2 text-sm font-medium flex items-center
              ${isTrendUp ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'}
            `}>
              {isTrendUp ? (
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18"></path>
                </svg>
              ) : (
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3"></path>
                </svg>
              )}
              {trend}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default StatsCard; 