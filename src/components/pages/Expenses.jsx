import { useState, useEffect } from 'react';
import { 
  addTransaction, 
  updateTransaction, 
  deleteTransaction, 
  getExpenseTransactions
} from '../../services/transactionService';
import useFinancialData from '../../services/hooks/useFinancialData';
import TransactionForm from '../shared/TransactionForm';
import TransactionList from '../shared/TransactionList';
import Button from '../atoms/Button';
import Card from '../atoms/Card';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editTransaction, setEditTransaction] = useState(null);
  
  // Use our financial data hook to get synchronized data
  const { expenses: totalExpenses, refreshData } = useFinancialData();
  
  // Load expense data
  const loadExpenses = () => {
    // Refresh all financial data first
    refreshData();
    
    const expenseData = getExpenseTransactions();
    // Sort by date descending
    const sortedExpenses = [...expenseData].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
    setExpenses(sortedExpenses);
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
    <div className="p-0">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 p-6 border-b border-gray-200 dark:border-gray-700">Expense Manager</h1>
      
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="p-4 rounded-lg shadow bg-red-50 dark:bg-red-900/30 flex-grow">
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Expenses</div>
            <div className="text-2xl font-bold text-red-600 dark:text-red-400">€{totalExpenses.toFixed(2)}</div>
          </div>
          <div className="ml-4">
            <Button 
              variant="danger" 
              onClick={() => {
                setEditTransaction(null);
                setShowForm(!showForm);
              }}
            >
              {showForm ? 'Cancel' : 'New Expense'}
            </Button>
          </div>
        </div>
        
        {/* Add Expense Form */}
        {showForm && (
          <Card>
            <h2 className="text-xl font-semibold mb-4 text-slate-700 dark:text-slate-200 text-left">
              {editTransaction ? 'Edit Expense' : 'Add New Expense'}
            </h2>
            
            <TransactionForm
              initialValues={editTransaction || { type: 'expense' }}
              onSubmit={editTransaction ? handleUpdateExpense : handleAddExpense}
              buttonText={editTransaction ? 'Update Expense' : 'Add Expense'}
              transactionType="expense"
            />
          </Card>
        )}
        
        {/* Expense List */}
        <div>
          <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4 text-left">Expense History</h2>
          <TransactionList
            transactions={expenses}
            onEdit={handleEditClick}
            onDelete={handleDeleteExpense}
            emptyMessage="No expense transactions yet. Add your first expense!"
          />
        </div>
      </div>
    </div>
  );
};

export default Expenses; 