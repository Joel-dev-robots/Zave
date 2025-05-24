import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

import { 
  getAllAutomatedTransactions, 
  createAutomatedTransaction, 
  updateAutomatedTransaction, 
  deleteAutomatedTransaction,
  toggleAutomatedTransaction,
  processAutomatedTransactions,
  FREQUENCY
} from '../../services/automationService';

import useFinancialData from '../../services/hooks/useFinancialData';
import Card from '../atoms/Card';
import Button from '../atoms/Button';

const AutomatedTransactions = () => {
  const [automatedTransactions, setAutomatedTransactions] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    type: 'income',
    category: '',
    frequency: FREQUENCY.MONTHLY,
    startDate: new Date().toISOString().slice(0, 10),
  });
  const [isEditing, setIsEditing] = useState(false);
  const [editId, setEditId] = useState(null);
  const [typeFilter, setTypeFilter] = useState('all');
  const [selectedCategory, setSelectedCategory] = useState('all');
  
  // Use our financial data hook to ensure data is synchronized
  const { refreshData } = useFinancialData();

  useEffect(() => {
    loadAutomatedTransactions();
  }, []);

  const loadAutomatedTransactions = () => {
    // Process any pending automated transactions and refresh financial data
    refreshData();
    
    // Then load the updated list
    const transactions = getAllAutomatedTransactions();
    setAutomatedTransactions(transactions);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleTypeChange = (type) => {
    setFormData({
      ...formData,
      type
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (isEditing) {
      updateAutomatedTransaction(editId, formData);
    } else {
      createAutomatedTransaction(formData);
    }
    
    resetForm();
    loadAutomatedTransactions();
  };

  const handleEdit = (transaction) => {
    setFormData({
      name: transaction.name,
      amount: transaction.amount,
      type: transaction.type,
      category: transaction.category,
      frequency: transaction.frequency || FREQUENCY.MONTHLY,
      startDate: transaction.startDate || new Date().toISOString().slice(0, 10),
    });
    
    setIsEditing(true);
    setEditId(transaction.id);
    setShowForm(true);
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to delete this automation?')) {
      deleteAutomatedTransaction(id);
      loadAutomatedTransactions();
    }
  };

  const handleToggle = (id) => {
    toggleAutomatedTransaction(id);
    loadAutomatedTransactions();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      amount: '',
      type: 'income',
      category: '',
      frequency: FREQUENCY.MONTHLY,
      startDate: new Date().toISOString().slice(0, 10),
    });
    setIsEditing(false);
    setEditId(null);
    setShowForm(false);
  };

  const categories = [...new Set(automatedTransactions.map(t => t.category).filter(Boolean))];

  const filteredTransactions = () => {
    return automatedTransactions.filter(t => {
      if (typeFilter !== 'all' && t.type !== typeFilter) return false;
      if (selectedCategory !== 'all' && t.category !== selectedCategory) return false;
      return true;
    });
  };

  return (
    <div className="p-0">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 p-6 border-b border-gray-200 dark:border-gray-700">Automated Transactions</h1>
      
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center mb-6">
          <Button 
            variant="primary"
            className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800 ml-auto" 
            onClick={() => {
              if (showForm) {
                resetForm();
              } else {
                setShowForm(true);
              }
            }}
          >
            {showForm ? 'Cancel' : 'New Automation'}
          </Button>
        </div>

        {showForm && (
          <Card>
            <h2 className="text-xl font-semibold mb-4 text-slate-700 dark:text-slate-200">
              {isEditing ? 'Edit Automation' : 'Add New Automation'}
            </h2>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  className="focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Ex: Salary, Netflix, etc."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 dark:text-gray-400 sm:text-sm">€</span>
                  </div>
                  <input
                    type="number"
                    name="amount"
                    value={formData.amount}
                    onChange={handleInputChange}
                    required
                    step="0.01"
                    min="0.01"
                    className="focus:ring-purple-500 focus:border-purple-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                    placeholder="0.00"
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Type
                </label>
                <div className="flex space-x-4">
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="type"
                      checked={formData.type === 'income'}
                      onChange={() => handleTypeChange('income')}
                      className="text-purple-600 focus:ring-purple-500 h-4 w-4 dark:bg-gray-700"
                    />
                    <span className="ml-2 text-gray-700 dark:text-gray-300">Income</span>
                  </label>
                  <label className="inline-flex items-center">
                    <input
                      type="radio"
                      name="type"
                      checked={formData.type === 'expense'}
                      onChange={() => handleTypeChange('expense')}
                      className="text-red-600 focus:ring-red-500 h-4 w-4 dark:bg-gray-700"
                    />
                    <span className="ml-2 text-gray-700 dark:text-gray-300">Expense</span>
                  </label>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <input
                  type="text"
                  name="category"
                  value={formData.category}
                  onChange={handleInputChange}
                  className="focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="Ex: Salary, Entertainment, etc."
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Frequency
                </label>
                <select
                  name="frequency"
                  value={formData.frequency}
                  onChange={handleInputChange}
                  required
                  className="focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value={FREQUENCY.DAILY}>Daily</option>
                  <option value={FREQUENCY.WEEKLY}>Weekly</option>
                  <option value={FREQUENCY.BIWEEKLY}>Biweekly</option>
                  <option value={FREQUENCY.MONTHLY}>Monthly</option>
                  <option value={FREQUENCY.QUARTERLY}>Quarterly</option>
                  <option value={FREQUENCY.YEARLY}>Yearly</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={formData.startDate}
                  onChange={handleInputChange}
                  required
                  className="focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              <div className="pt-4">
                <Button 
                  type="submit" 
                  variant={formData.type === 'income' ? 'primary' : 'danger'}
                  className={`w-full ${formData.type === 'income' ? 'bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800' : 'bg-red-600 hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800'}`}
                >
                  {isEditing ? 'Update Automation' : 'Create Automation'}
                </Button>
              </div>
            </form>
          </Card>
        )}

        <div className="flex flex-wrap justify-end gap-3">
          <div className="relative">
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white py-2 px-3"
            >
              <option value="all">All Transactions</option>
              <option value="income">Income</option>
              <option value="expense">Expenses</option>
            </select>
          </div>
          
          {categories.length > 0 && (
            <div className="relative">
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white py-2 px-3"
              >
                <option value="all">All Categories</option>
                {categories.map(category => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Transactions List */}
        {filteredTransactions().length === 0 ? (
          <Card>
            <div className="text-center text-gray-500 dark:text-gray-400 py-8">
              <p>No automated transactions found.</p>
            </div>
          </Card>
        ) : (
          <div className="space-y-4">
            {filteredTransactions().map((transaction) => {
              const isActive = transaction.active;
              const typeColor = transaction.type === 'income' 
                ? 'text-green-600 dark:text-green-400' 
                : 'text-red-600 dark:text-red-400';
              
              return (
                <Card 
                  key={transaction.id} 
                  className={`hover:shadow-md transition-shadow ${
                    !isActive ? 'bg-gray-50 dark:bg-gray-800/50 opacity-75' : transaction.type === 'income' ? 'bg-green-50 dark:bg-green-900/30' : 'bg-red-50 dark:bg-red-900/30'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100">
                          {transaction.name}
                        </h3>
                        {transaction.category && (
                          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                            {transaction.category}
                          </span>
                        )}
                      </div>
                      <div className="mt-1 flex items-center">
                        <span className={`text-lg font-semibold ${typeColor}`}>
                          {transaction.type === 'income' ? '+' : '-'}€{typeof transaction.amount === 'number' ? transaction.amount.toFixed(2) : parseFloat(transaction.amount).toFixed(2)}
                        </span>
                        <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                          {isActive ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex space-x-2">
                      <Button
                        variant="secondary"
                        className="py-1 px-2 bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                        onClick={() => handleToggle(transaction.id)}
                      >
                        {isActive ? 'Disable' : 'Enable'}
                      </Button>
                      <Button
                        variant="secondary"
                        className="py-1 px-2 bg-white text-gray-700 border-gray-300 hover:bg-gray-50 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:hover:bg-gray-600"
                        onClick={() => handleEdit(transaction)}
                      >
                        Edit
                      </Button>
                      <Button
                        variant="danger"
                        className="py-1 px-2 bg-red-600 text-white hover:bg-red-700 dark:bg-red-700 dark:hover:bg-red-800"
                        onClick={() => handleDelete(transaction.id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default AutomatedTransactions; 