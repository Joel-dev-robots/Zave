import { useState, useEffect } from 'react';
import { 
  addTransaction, 
  updateTransaction, 
  deleteTransaction, 
  getIncomeTransactions, 
  getTotalIncome 
} from '../../services/transactionService';
import TransactionForm from '../shared/TransactionForm';
import TransactionList from '../shared/TransactionList';
import Button from '../atoms/Button';
import Card from '../atoms/Card';

const Income = () => {
  const [incomes, setIncomes] = useState([]);
  const [totalIncome, setTotalIncome] = useState(0);
  const [showForm, setShowForm] = useState(false);
  const [editTransaction, setEditTransaction] = useState(null);
  
  // Load income data
  const loadIncomes = () => {
    const incomeData = getIncomeTransactions();
    // Sort by date descending
    const sortedIncomes = [...incomeData].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
    setIncomes(sortedIncomes);
    setTotalIncome(getTotalIncome());
  };
  
  useEffect(() => {
    loadIncomes();
  }, []);
  
  const handleAddIncome = (transaction) => {
    addTransaction({ ...transaction, type: 'income' });
    loadIncomes();
    setShowForm(false);
  };
  
  const handleUpdateIncome = (transaction) => {
    if (editTransaction) {
      updateTransaction(editTransaction.id, transaction);
      loadIncomes();
      setEditTransaction(null);
      setShowForm(false);
    }
  };
  
  const handleDeleteIncome = (id) => {
    deleteTransaction(id);
    loadIncomes();
  };
  
  const handleEditClick = (transaction) => {
    setEditTransaction(transaction);
    setShowForm(true);
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Income Manager</h1>
        <div className="mt-4 md:mt-0">
          <Button 
            variant="primary" 
            onClick={() => {
              setEditTransaction(null);
              setShowForm(!showForm);
            }}
          >
            {showForm ? 'Cancel' : 'New Income'}
          </Button>
        </div>
      </div>
      
      {/* Summary */}
      <div className="p-4 rounded-lg shadow bg-blue-50 dark:bg-blue-900/30">
        <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Income</div>
        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">€{totalIncome.toFixed(2)}</div>
      </div>
      
      {/* Add Income Form */}
      {showForm && (
        <Card>
          <h2 className="text-xl font-semibold mb-4 text-slate-700 dark:text-slate-200">
            {editTransaction ? 'Edit Income' : 'Add New Income'}
          </h2>
          
          <TransactionForm
            initialValues={editTransaction || { type: 'income' }}
            onSubmit={editTransaction ? handleUpdateIncome : handleAddIncome}
            buttonText={editTransaction ? 'Update Income' : 'Add Income'}
            transactionType="income"
          />
        </Card>
      )}
      
      {/* Income List */}
      <div>
        <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4">Income History</h2>
        <TransactionList
          transactions={incomes}
          onEdit={handleEditClick}
          onDelete={handleDeleteIncome}
          emptyMessage="No income transactions yet. Add your first income!"
        />
      </div>
    </div>
  );
};

export default Income; 