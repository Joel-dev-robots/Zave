import React from 'react';
import { format } from 'date-fns';
import Badge from '../atoms/Badge';

/**
 * TransactionList component for displaying transaction history
 * @param {Object} props - Component props
 * @param {Array} props.transactions - Array of transaction objects
 * @param {boolean} [props.showEmptyState=true] - Whether to show empty state
 * @param {Function} [props.onTransactionClick] - Optional click handler
 * @param {string} [props.className=''] - Additional CSS classes
 */
const TransactionList = ({ 
  transactions = [], 
  showEmptyState = true,
  onTransactionClick,
  className = '',
  ...rest
}) => {
  if (transactions.length === 0 && showEmptyState) {
    return (
      <div className={`py-12 text-center ${className}`} {...rest}>
        <svg className="mx-auto h-12 w-12 text-gray-400 dark:text-gray-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
        <h3 className="mt-2 text-sm font-medium text-gray-900 dark:text-gray-100">No transactions</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">Add your first transaction to get started.</p>
      </div>
    );
  }

  return (
    <div className={`divide-y divide-gray-200 dark:divide-gray-700 ${className}`} {...rest}>
      {transactions.map((transaction) => {
        // Determine if this is income or expense
        const isIncome = transaction.type === 'income';
        const variantColor = isIncome ? 'success' : 'danger';
        
        return (
          <div 
            key={transaction.id}
            onClick={() => onTransactionClick && onTransactionClick(transaction)}
            className={`py-4 px-2 ${onTransactionClick ? 'cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800' : ''}`}
          >
            <div className="flex justify-between items-center">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                  {transaction.description}
                </p>
                <div className="flex items-center mt-1">
                  <p className="text-xs text-gray-500 dark:text-gray-400 mr-2">
                    {format(new Date(transaction.date), 'MMM dd, yyyy')}
                  </p>
                  <Badge variant={isIncome ? 'success' : 'danger'} size="sm">
                    {transaction.category}
                  </Badge>
                </div>
              </div>
              <div className={`text-base font-semibold ${isIncome ? 'text-success-600 dark:text-success-400' : 'text-danger-600 dark:text-danger-400'}`}>
                {isIncome ? '+' : '-'}€{Number(transaction.amount).toFixed(2)}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default TransactionList; 