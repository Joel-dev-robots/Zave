import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  addTransaction, 
  updateTransaction, 
  deleteTransaction, 
  getExpenseTransactions, 
  getTotalExpenses 
} from '../../services/transactionService';
import TransactionForm from '../shared/TransactionForm';
import TransactionList from '../shared/TransactionList';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editTransaction, setEditTransaction] = useState(null);
  
  // Load expense data
  const loadExpenses = () => {
    const expenseData = getExpenseTransactions();
    // Sort by date descending
    const sortedExpenses = [...expenseData].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
    setExpenses(sortedExpenses);
    setTotalExpenses(getTotalExpenses());
  };
  
  useEffect(() => {
    loadExpenses();
  }, []);
  
  const handleAddExpense = (transaction) => {
    addTransaction({ ...transaction, type: 'expense' });
    loadExpenses();
    setShowForm(false);
  };
  
  const handleUpdateExpense = (transaction) => {
    if (editTransaction) {
      updateTransaction(editTransaction.id, transaction);
      loadExpenses();
      setEditTransaction(null);
      setShowForm(false);
    }
  };
  
  const handleDeleteExpense = (id) => {
    deleteTransaction(id);
    loadExpenses();
  };
  
  const handleEditClick = (transaction) => {
    setEditTransaction(transaction);
    setShowForm(true);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Expense Manager</h1>
        <div className="text-sm text-slate-500">
          {format(new Date(), 'MMMM dd, yyyy')}
        </div>
      </div>
      
      {/* Summary */}
      <div className="p-4 rounded-lg shadow bg-red-50">
        <div className="text-sm font-medium text-slate-500">Total Expenses</div>
        <div className="text-2xl font-bold text-red-600">€{totalExpenses.toFixed(2)}</div>
      </div>
      
      {/* Add Expense Button or Form */}
      {!showForm ? (
        <button
          type="button"
          onClick={() => {
            setEditTransaction(null);
            setShowForm(true);
          }}
          className="w-full flex justify-center py-2 px-4 border border-transparent shadow-sm 
                     text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
        >
          + Add New Expense
        </button>
      ) : (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-slate-700">
              {editTransaction ? 'Edit Expense' : 'Add New Expense'}
            </h2>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setEditTransaction(null);
              }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
          
          <TransactionForm
            initialValues={editTransaction || { type: 'expense' }}
            onSubmit={editTransaction ? handleUpdateExpense : handleAddExpense}
            buttonText={editTransaction ? 'Update Expense' : 'Add Expense'}
            transactionType="expense"
          />
        </div>
      )}
      
      {/* Expense List */}
      <div>
        <h2 className="text-lg font-semibold text-slate-700 mb-4">Expense History</h2>
        <TransactionList
          transactions={expenses}
          onEdit={handleEditClick}
          onDelete={handleDeleteExpense}
          emptyMessage="No expense transactions yet. Add your first expense!"
        />
      </div>
    </div>
  );
};

export default Expenses; 