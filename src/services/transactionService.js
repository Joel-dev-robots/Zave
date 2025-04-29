/**
 * Transaction Service for managing income and expenses
 */
import { v4 as uuidv4 } from 'uuid';
import { KEYS, getData, saveData } from './storageService';

/**
 * Get all transactions
 * @returns {Array} All transactions
 */
const getAllTransactions = () => {
  return getData(KEYS.TRANSACTIONS, []);
};

/**
 * Add a new transaction
 * @param {Object} transaction - Transaction data
 * @returns {Object} Added transaction with ID
 */
const addTransaction = (transaction) => {
  const transactions = getAllTransactions();
  const newTransaction = {
    id: uuidv4(),
    date: new Date().toISOString(),
    ...transaction
  };
  
  transactions.push(newTransaction);
  saveData(KEYS.TRANSACTIONS, transactions);
  
  return newTransaction;
};

/**
 * Update an existing transaction
 * @param {string} id - Transaction ID to update
 * @param {Object} updatedData - New transaction data
 * @returns {Object|null} Updated transaction or null if not found
 */
const updateTransaction = (id, updatedData) => {
  const transactions = getAllTransactions();
  const index = transactions.findIndex(t => t.id === id);
  
  if (index === -1) return null;
  
  transactions[index] = { 
    ...transactions[index], 
    ...updatedData,
    updatedAt: new Date().toISOString()
  };
  
  saveData(KEYS.TRANSACTIONS, transactions);
  return transactions[index];
};

/**
 * Delete a transaction
 * @param {string} id - Transaction ID to delete
 * @returns {boolean} Success status
 */
const deleteTransaction = (id) => {
  const transactions = getAllTransactions();
  const filteredTransactions = transactions.filter(t => t.id !== id);
  
  if (filteredTransactions.length === transactions.length) {
    return false;
  }
  
  saveData(KEYS.TRANSACTIONS, filteredTransactions);
  return true;
};

/**
 * Get all income transactions
 * @returns {Array} Income transactions
 */
const getIncomeTransactions = () => {
  return getAllTransactions().filter(t => t.type === 'income');
};

/**
 * Get all expense transactions
 * @returns {Array} Expense transactions
 */
const getExpenseTransactions = () => {
  return getAllTransactions().filter(t => t.type === 'expense');
};

/**
 * Calculate total income
 * @returns {number} Total income amount
 */
const getTotalIncome = () => {
  return getIncomeTransactions().reduce((sum, t) => sum + Number(t.amount), 0);
};

/**
 * Calculate total expenses
 * @returns {number} Total expense amount
 */
const getTotalExpenses = () => {
  return getExpenseTransactions().reduce((sum, t) => sum + Number(t.amount), 0);
};

/**
 * Calculate current balance
 * @returns {number} Current balance (income - expenses)
 */
const getCurrentBalance = () => {
  return getTotalIncome() - getTotalExpenses();
};

export {
  getAllTransactions,
  addTransaction,
  updateTransaction,
  deleteTransaction,
  getIncomeTransactions,
  getExpenseTransactions,
  getTotalIncome,
  getTotalExpenses,
  getCurrentBalance
}; 