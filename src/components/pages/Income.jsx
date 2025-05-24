import { useState, useEffect } from 'react';
import { 
  addTransaction, 
  updateTransaction, 
  deleteTransaction, 
  getIncomeTransactions
} from '../../services/transactionService';
import useFinancialData from '../../services/hooks/useFinancialData';
import TransactionForm from '../shared/TransactionForm';
import TransactionList from '../shared/TransactionList';
import Button from '../atoms/Button';
import Card from '../atoms/Card';

const Income = () => {
  const [incomes, setIncomes] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editTransaction, setEditTransaction] = useState(null);
  
  // Use our financial data hook to get synchronized data
  const { income: totalIncome, refreshData } = useFinancialData();
  
  // Load income data
  const loadIncomes = () => {
    // Refresh all financial data first
    refreshData();
    
    const incomeData = getIncomeTransactions();
    // Sort by date descending
    const sortedIncomes = [...incomeData].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
    setIncomes(sortedIncomes);
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
    <div className="p-0">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 p-6 border-b border-gray-200 dark:border-gray-700">Income Manager</h1>
      
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center">
          <div className="p-4 rounded-lg shadow bg-blue-50 dark:bg-blue-900/30 flex-grow">
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Income</div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">€{totalIncome.toFixed(2)}</div>
          </div>
          <div className="ml-4">
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
        
        {/* Add Income Form */}
        {showForm && (
          <Card>
            <h2 className="text-xl font-semibold mb-4 text-slate-700 dark:text-slate-200 text-left">
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
          <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4 text-left">Income History</h2>
          <TransactionList
            transactions={incomes}
            onEdit={handleEditClick}
            onDelete={handleDeleteIncome}
            emptyMessage="No income transactions yet. Add your first income!"
          />
        </div>
      </div>
    </div>
  );
};

export default Income; 