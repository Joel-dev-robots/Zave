import { useState, useEffect } from 'react';
import { 
  addTransaction, 
  updateTransaction, 
  deleteTransaction, 
  getExpenseTransactions, 
  getTotalExpenses 
} from '../../services/transactionService';
import TransactionForm from '../shared/TransactionForm';
import TransactionList from '../shared/TransactionList';
import Button from '../atoms/Button';
import Card from '../atoms/Card';

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
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Expense Manager</h1>
        <div className="flex items-center justify-between mt-4 md:mt-0">
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
      
      {/* Summary */}
      <div className="p-4 rounded-lg shadow bg-red-50 dark:bg-red-900/30">
        <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Expenses</div>
        <div className="text-2xl font-bold text-red-600 dark:text-red-400">€{totalExpenses.toFixed(2)}</div>
      </div>
      
      {/* Add Expense Form */}
      {showForm && (
        <Card>
          <h2 className="text-xl font-semibold mb-4 text-slate-700 dark:text-slate-200">
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
        <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4">Expense History</h2>
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