import { useState } from 'react';

const TransactionList = ({
  transactions = [],
  onEdit,
  onDelete,
  emptyMessage = 'No transactions found'
}) => {
  const [expandedId, setExpandedId] = useState(null);
  
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 bg-white rounded-lg shadow dark:bg-gray-800">
        {emptyMessage}
      </div>
    );
  }
  
  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };
  
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
      <div className="divide-y divide-gray-200 dark:divide-gray-700">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="transition">
            <div 
              className={`p-4 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 ${
                transaction.type === 'income' 
                  ? 'hover:bg-green-50 dark:hover:bg-green-900/20' 
                  : 'hover:bg-red-50 dark:hover:bg-red-900/20'
              }`}
              onClick={() => toggleExpand(transaction.id)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm md:text-base font-medium text-gray-900 dark:text-gray-100">
                    {transaction.description}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    {transaction.category}
                  </p>
                </div>
                <div className="flex items-center">
                  <span className={`text-sm md:text-base font-semibold ${
                    transaction.type === 'income' 
                      ? 'text-green-600 dark:text-green-400' 
                      : 'text-red-600 dark:text-red-400'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}€{Number(transaction.amount).toFixed(2)}
                  </span>
                  <svg 
                    className={`ml-2 h-5 w-5 text-gray-400 dark:text-gray-500 transform transition-transform ${
                      expandedId === transaction.id ? 'rotate-180' : ''
                    }`} 
                    xmlns="http://www.w3.org/2000/svg" 
                    viewBox="0 0 20 20" 
                    fill="currentColor"
                  >
                    <path 
                      fillRule="evenodd" 
                      d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 011.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" 
                      clipRule="evenodd" 
                    />
                  </svg>
                </div>
              </div>
            </div>
            
            {expandedId === transaction.id && (
              <div className={`p-4 border-t dark:border-gray-700 ${
                transaction.type === 'income' 
                  ? 'bg-green-50 dark:bg-green-900/20' 
                  : 'bg-red-50 dark:bg-red-900/20'
              }`}>
                <div className="flex flex-wrap justify-between mb-4">
                  <div className="w-full sm:w-auto mb-2 sm:mb-0">
                    <span className="text-xs text-gray-500 dark:text-gray-400">ID:</span>
                    <span className="text-xs ml-1 dark:text-gray-300">{transaction.id.substring(0, 8)}...</span>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(transaction);
                    }}
                    className="py-1 px-3 bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm rounded-md dark:bg-blue-900/40 dark:hover:bg-blue-800/60 dark:text-blue-300"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (window.confirm('Are you sure you want to delete this transaction?')) {
                        onDelete(transaction.id);
                      }
                    }}
                    className="py-1 px-3 bg-red-100 hover:bg-red-200 text-red-700 text-sm rounded-md dark:bg-red-900/40 dark:hover:bg-red-800/60 dark:text-red-300"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default TransactionList; 