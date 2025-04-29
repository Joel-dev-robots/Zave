import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  addTransaction, 
  updateTransaction, 
  deleteTransaction, 
  getIncomeTransactions, 
  getTotalIncome 
} from '../../services/transactionService';
import TransactionForm from '../shared/TransactionForm';
import TransactionList from '../shared/TransactionList';

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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Income Manager</h1>
        <div className="text-sm text-slate-500">
          {format(new Date(), 'MMMM dd, yyyy')}
        </div>
      </div>
      
      {/* Summary */}
      <div className="p-4 rounded-lg shadow bg-blue-50">
        <div className="text-sm font-medium text-slate-500">Total Income</div>
        <div className="text-2xl font-bold text-blue-600">€{totalIncome.toFixed(2)}</div>
      </div>
      
      {/* Add Income Button or Form */}
      {!showForm ? (
        <button
          type="button"
          onClick={() => {
            setEditTransaction(null);
            setShowForm(true);
          }}
          className="w-full flex justify-center py-2 px-4 border border-transparent shadow-sm 
                     text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          + Add New Income
        </button>
      ) : (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-slate-700">
              {editTransaction ? 'Edit Income' : 'Add New Income'}
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
            initialValues={editTransaction || { type: 'income' }}
            onSubmit={editTransaction ? handleUpdateIncome : handleAddIncome}
            buttonText={editTransaction ? 'Update Income' : 'Add Income'}
            transactionType="income"
          />
        </div>
      )}
      
      {/* Income List */}
      <div>
        <h2 className="text-lg font-semibold text-slate-700 mb-4">Income History</h2>
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