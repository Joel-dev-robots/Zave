import React from 'react';
import Card from '../atoms/Card';

/**
 * ChartCard component for displaying charts with consistent styling
 * @param {Object} props - Component props
 * @param {string} props.title - Chart title
 * @param {React.ReactNode} props.chart - Chart component
 * @param {React.ReactNode} [props.toolbar] - Optional toolbar/actions
 * @param {React.ReactNode} [props.footer] - Optional footer content
 * @param {string} [props.className=''] - Additional CSS classes
 */
const ChartCard = ({ 
  title, 
  chart, 
  toolbar, 
  footer,
  className = '',
  ...rest
}) => {
  return (
    <Card 
      className={`overflow-hidden ${className}`}
      {...rest}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200">{title}</h2>
        {toolbar && (
          <div className="flex items-center">
            {toolbar}
          </div>
        )}
      </div>
      
      {/* Chart content */}
      <div className="relative">
        {chart}
      </div>
      
      {/* Optional footer */}
      {footer && (
        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-700">
          {footer}
        </div>
      )}
    </Card>
  );
};

export default ChartCard; 