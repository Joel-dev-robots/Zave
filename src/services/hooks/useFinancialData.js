import { useState, useEffect } from 'react';
import { 
  getCurrentBalance, 
  getTotalIncome, 
  getTotalExpenses, 
  getAllTransactions 
} from '../transactionService';
import { processAutomatedTransactions, getAllAutomatedTransactions } from '../automationService';
import { getGoalStatistics } from '../goalService';
import { getInvestmentStatistics } from '../investmentService';

/**
 * Custom hook for managing financial data across the application
 * Processes automated transactions and provides up-to-date financial information
 */
const useFinancialData = () => {
  const [financialData, setFinancialData] = useState({
    balance: 0,
    income: 0,
    expenses: 0,
    recentTransactions: [],
    automatedTransactions: [],
    goalStats: {},
    investmentStats: {},
  });
  const [isLoading, setIsLoading] = useState(true);

  // Function to refresh all financial data
  const refreshData = () => {
    setIsLoading(true);
    
    // Process any pending automated transactions
    const result = processAutomatedTransactions();
    
    // Get all financial data
    const balance = getCurrentBalance();
    const income = getTotalIncome();
    const expenses = getTotalExpenses();
    const goalStats = getGoalStatistics();
    const investmentStats = getInvestmentStatistics();
    const automatedTransactions = getAllAutomatedTransactions().filter(at => at.active);
    
    // Get recent transactions
    const allTransactions = getAllTransactions();
    const recentTransactions = [...allTransactions]
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 5);
    
    setFinancialData({
      balance,
      income,
      expenses,
      recentTransactions,
      automatedTransactions,
      goalStats,
      investmentStats,
      transactionsProcessed: result.processed,
      processedCount: result.transactions.length
    });
    
    setIsLoading(false);
    
    return result.processed;
  };

  // Load data on mount
  useEffect(() => {
    refreshData();
  }, []);

  return {
    ...financialData,
    isLoading,
    refreshData
  };
};

export default useFinancialData; 