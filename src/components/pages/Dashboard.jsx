import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import { Bar, Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

import useFinancialData from '../../services/hooks/useFinancialData';

// Import components
import StatsCard from '../molecules/StatsCard';
import ChartCard from '../molecules/ChartCard';
import TransactionList from '../molecules/TransactionList';
import Card from '../atoms/Card';
import Button from '../atoms/Button';
import ProgressBar from '../atoms/ProgressBar';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

const Dashboard = () => {
  const { 
    balance, 
    income, 
    expenses, 
    goalStats, 
    investmentStats, 
    recentTransactions, 
    automatedTransactions,
    isLoading,
    transactionsProcessed,
    processedCount
  } = useFinancialData();
  
  const [isDarkMode, setIsDarkMode] = useState(
    document.documentElement.classList.contains('dark')
  );

  useEffect(() => {
    // Check for dark mode
    const checkDarkMode = () => {
      setIsDarkMode(document.documentElement.classList.contains('dark'));
    };
    
    // Set up an observer to detect class changes
    const observer = new MutationObserver(checkDarkMode);
    observer.observe(document.documentElement, { attributes: true });
    
    // Log if transactions were processed
    if (transactionsProcessed) {
      console.log(`Processed ${processedCount} automated transactions`);
    }
    
    return () => observer.disconnect();
  }, [transactionsProcessed, processedCount]);

  // Income vs Expenses Chart
  const comparisonChartData = {
    labels: ['Income', 'Expenses'],
    datasets: [
      {
        label: 'Amount (€)',
        data: [income, expenses],
        backgroundColor: [
          'rgba(16, 185, 129, 0.7)', // success-500 with opacity
          'rgba(239, 68, 68, 0.7)', // danger-500 with opacity
        ],
        borderColor: [
          'rgb(16, 185, 129)', // success-500
          'rgb(239, 68, 68)', // danger-500
        ],
        borderWidth: 1,
      },
    ],
  };

  const comparisonChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
        labels: {
          font: {
            family: "'Inter', sans-serif",
            size: 12
          },
          color: isDarkMode ? '#d1d5db' : '#6b7280', // dark:text-gray-300 : text-gray-500
        }
      },
      tooltip: {
        backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.9)' : 'rgba(255, 255, 255, 0.9)', // dark:bg-gray-800 : bg-white
        titleColor: isDarkMode ? '#f3f4f6' : '#1f2937', // dark:text-gray-100 : text-gray-800
        bodyColor: isDarkMode ? '#d1d5db' : '#374151', // dark:text-gray-300 : text-gray-700
        borderColor: isDarkMode ? '#4b5563' : '#e5e7eb', // dark:border-gray-600 : border-gray-200
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        bodyFont: {
          family: "'Inter', sans-serif"
        },
        titleFont: {
          family: "'Inter', sans-serif",
          weight: 'bold'
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: isDarkMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.5)', // dark:gray-600 with opacity : gray-200 with opacity
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif"
          },
          color: isDarkMode ? '#d1d5db' : '#6b7280', // dark:text-gray-300 : text-gray-500
          callback: (value) => `€${value}`
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif"
          },
          color: isDarkMode ? '#d1d5db' : '#6b7280' // dark:text-gray-300 : text-gray-500
        }
      }
    }
  };

  // Monthly balance chart (fake data for now)
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'];
  const balanceChartData = {
    labels: months,
    datasets: [
      {
        label: 'Balance',
        data: [1200, 1900, 1700, 2100, 2300, balance],
        borderColor: isDarkMode ? 'rgb(96, 165, 250)' : 'rgb(59, 130, 246)', // dark:primary-400 : primary-500
        backgroundColor: isDarkMode ? 'rgba(96, 165, 250, 0.2)' : 'rgba(59, 130, 246, 0.1)', // dark:primary-400 with opacity : primary-500 with opacity
        tension: 0.3,
        fill: true,
        pointBackgroundColor: isDarkMode ? 'rgb(96, 165, 250)' : 'rgb(59, 130, 246)',
        pointBorderColor: isDarkMode ? '#1f2937' : '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };

  const balanceChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        backgroundColor: isDarkMode ? 'rgba(31, 41, 55, 0.9)' : 'rgba(255, 255, 255, 0.9)', // dark:bg-gray-800 : bg-white
        titleColor: isDarkMode ? '#f3f4f6' : '#1f2937', // dark:text-gray-100 : text-gray-800
        bodyColor: isDarkMode ? '#d1d5db' : '#374151', // dark:text-gray-300 : text-gray-700
        borderColor: isDarkMode ? '#4b5563' : '#e5e7eb', // dark:border-gray-600 : border-gray-200
        borderWidth: 1,
        padding: 12,
        boxPadding: 6,
        usePointStyle: true,
        callbacks: {
          label: function(context) {
            return `Balance: €${context.raw}`;
          }
        },
        bodyFont: {
          family: "'Inter', sans-serif"
        },
        titleFont: {
          family: "'Inter', sans-serif",
          weight: 'bold'
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: isDarkMode ? 'rgba(75, 85, 99, 0.3)' : 'rgba(229, 231, 235, 0.5)', // dark:gray-600 with opacity : gray-200 with opacity
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif"
          },
          color: isDarkMode ? '#d1d5db' : '#6b7280', // dark:text-gray-300 : text-gray-500
          callback: (value) => `€${value}`
        }
      },
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            family: "'Inter', sans-serif"
          },
          color: isDarkMode ? '#d1d5db' : '#6b7280' // dark:text-gray-300 : text-gray-500
        }
      }
    }
  };

  return (
    <div className="p-0">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 p-6 border-b border-gray-200 dark:border-gray-700">Financial Dashboard</h1>
      
      <div className="p-6 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <StatsCard 
            title="Current Balance"
            value={`€${balance.toFixed(2)}`}
            variant={balance >= 0 ? "primary" : "danger"}
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"></path>
              </svg>
            }
          />
          
          <StatsCard 
            title="Total Income"
            value={`€${income.toFixed(2)}`}
            variant="success"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6"></path>
              </svg>
            }
          />
          
          <StatsCard 
            title="Total Expenses"
            value={`€${expenses.toFixed(2)}`}
            variant="danger"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4"></path>
              </svg>
            }
          />
          
          <StatsCard 
            title="Savings Rate"
            value={income > 0 ? `${Math.round((income - expenses) / income * 100)}%` : '0%'}
            variant="warning"
            icon={
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
              </svg>
            }
          />
        </div>
        
        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard 
            title="Balance Trend"
            chart={
              <div className="h-80 text-left">
                <Line data={balanceChartData} options={balanceChartOptions} />
              </div>
            }
          />
          
          <ChartCard 
            title="Income vs Expenses"
            chart={
              <div className="h-80 text-left">
                <Bar data={comparisonChartData} options={comparisonChartOptions} />
              </div>
            }
          />
        </div>
        
        {/* Transactions & Goals Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Recent Transactions */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 text-left">Recent Transactions</h2>
              <div className="flex space-x-2">
                <Link to="/income">
                  <Button variant="tertiary" size="sm">View All</Button>
                </Link>
              </div>
            </div>
            
            <TransactionList 
              transactions={recentTransactions}
            />
          </Card>
          
          {/* Financial Goals Summary */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 text-left">Financial Goals</h2>
              <div className="flex space-x-2">
                <Link to="/goals">
                  <Button variant="tertiary" size="sm">Manage Goals</Button>
                </Link>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="bg-primary-50 p-4 rounded-lg dark:bg-primary-900/30">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Goals</p>
                <p className="text-xl font-bold text-primary-700 dark:text-primary-300">{goalStats.total || 0}</p>
              </div>
              
              <div className="bg-success-50 p-4 rounded-lg dark:bg-success-900/30">
                <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Completed</p>
                <p className="text-xl font-bold text-success-700 dark:text-success-300">{goalStats.completed || 0}</p>
              </div>
            </div>
            
            {/* Progress of active goals would go here */}
            <div className="space-y-4">
              <div>
                <div className="flex justify-between mb-1">
                  <h3 className="text-sm font-medium text-slate-700 dark:text-slate-300">Overall Progress</h3>
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    {goalStats.averageProgress ? goalStats.averageProgress.toFixed(0) : 0}%
                  </span>
                </div>
                <ProgressBar 
                  progress={goalStats.averageProgress || 0} 
                  variant="primary"
                  size="md"
                />
              </div>
            </div>
          </Card>
        </div>
        
        {/* Automated Transactions Section */}
        {automatedTransactions.length > 0 && (
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 text-left">Transacciones Automáticas</h2>
              <div className="flex space-x-2">
                <Link to="/automated">
                  <Button variant="tertiary" size="sm">Administrar</Button>
                </Link>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {automatedTransactions.slice(0, 6).map(transaction => (
                <div key={transaction.id} className={`p-4 rounded-lg border ${
                  transaction.type === 'income' 
                    ? 'border-success-200 bg-success-50 dark:border-success-800/50 dark:bg-success-900/30' 
                    : 'border-danger-200 bg-danger-50 dark:border-danger-800/50 dark:bg-danger-900/30'
                }`}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-medium text-slate-800 dark:text-slate-200">{transaction.name}</h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {transaction.category || transaction.frequency}
                      </p>
                    </div>
                    <span className={`font-semibold ${
                      transaction.type === 'income' 
                        ? 'text-success-600 dark:text-success-400' 
                        : 'text-danger-600 dark:text-danger-400'
                    }`}>
                      {transaction.type === 'income' ? '+' : '-'}€{typeof transaction.amount === 'number' ? transaction.amount.toFixed(2) : parseFloat(transaction.amount).toFixed(2)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
            
            {automatedTransactions.length > 6 && (
              <div className="mt-4 text-center">
                <Link to="/automated">
                  <Button variant="tertiary" size="sm">
                    Ver todas ({automatedTransactions.length})
                  </Button>
                </Link>
              </div>
            )}
          </Card>
        )}
        
        {/* Investments Summary */}
        <Card>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 text-left">Investments</h2>
            <div className="flex space-x-2">
              <Link to="/investments">
                <Button variant="tertiary" size="sm">View Details</Button>
              </Link>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-gray-50 p-4 rounded-lg dark:bg-gray-800/50">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Invested</p>
              <p className="text-xl font-bold text-slate-700 dark:text-slate-200">
                €{investmentStats.totalInvested ? investmentStats.totalInvested.toFixed(2) : '0.00'}
              </p>
            </div>
            
            <div className="bg-primary-50 p-4 rounded-lg dark:bg-primary-900/30">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Value</p>
              <p className="text-xl font-bold text-primary-700 dark:text-primary-300">
                €{investmentStats.currentValue ? investmentStats.currentValue.toFixed(2) : '0.00'}
              </p>
            </div>
            
            <div className="bg-success-50 p-4 rounded-lg dark:bg-success-900/30">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Return</p>
              <p className="text-xl font-bold text-success-700 dark:text-success-300">
                €{investmentStats.totalReturn ? investmentStats.totalReturn.toFixed(2) : '0.00'}
              </p>
            </div>
            
            <div className="bg-warning-50 p-4 rounded-lg dark:bg-warning-900/30">
              <p className="text-sm font-medium text-gray-500 dark:text-gray-400">Return Rate</p>
              <p className="text-xl font-bold text-warning-700 dark:text-warning-300">
                {investmentStats.returnRate ? investmentStats.returnRate.toFixed(2) : '0.00'}%
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard; 