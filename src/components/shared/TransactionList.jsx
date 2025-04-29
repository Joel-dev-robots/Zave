import { useState } from 'react';
import { format } from 'date-fns';

const TransactionList = ({
  transactions = [],
  onEdit,
  onDelete,
  emptyMessage = 'No transactions found'
}) => {
  const [expandedId, setExpandedId] = useState(null);
  
  if (transactions.length === 0) {
    return (
      <div className="text-center py-8 text-slate-500 bg-white rounded-lg shadow">
        {emptyMessage}
      </div>
    );
  }
  
  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };
  
  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="divide-y divide-gray-200">
        {transactions.map((transaction) => (
          <div key={transaction.id} className="transition">
            <div 
              className={`p-4 cursor-pointer hover:bg-gray-50 ${
                transaction.type === 'income' ? 'hover:bg-green-50' : 'hover:bg-red-50'
              }`}
              onClick={() => toggleExpand(transaction.id)}
            >
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-sm md:text-base font-medium text-gray-900">
                    {transaction.description}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1">
                    {format(new Date(transaction.date), 'MMM dd, yyyy')} · {transaction.category}
                  </p>
                </div>
                <div className="flex items-center">
                  <span className={`text-sm md:text-base font-semibold ${
                    transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {transaction.type === 'income' ? '+' : '-'}€{Number(transaction.amount).toFixed(2)}
                  </span>
                  <svg 
                    className={`ml-2 h-5 w-5 text-gray-400 transform transition-transform ${
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
              <div className={`p-4 border-t ${
                transaction.type === 'income' ? 'bg-green-50' : 'bg-red-50'
              }`}>
                <div className="flex flex-wrap justify-between mb-4">
                  <div className="w-full sm:w-auto mb-2 sm:mb-0">
                    <span className="text-xs text-gray-500">ID:</span>
                    <span className="text-xs ml-1">{transaction.id.substring(0, 8)}...</span>
                  </div>
                  {transaction.updatedAt && (
                    <div>
                      <span className="text-xs text-gray-500">Last updated:</span>
                      <span className="text-xs ml-1">
                        {format(new Date(transaction.updatedAt), 'MMM dd, yyyy HH:mm')}
                      </span>
                    </div>
                  )}
                </div>
                
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onEdit(transaction);
                    }}
                    className="py-1 px-3 bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm rounded-md"
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
                    className="py-1 px-3 bg-red-100 hover:bg-red-200 text-red-700 text-sm rounded-md"
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