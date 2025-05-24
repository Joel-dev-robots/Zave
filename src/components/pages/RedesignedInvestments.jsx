import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { RedesignedInvestmentService } from '../../services/redesignedInvestmentService.js';
import InvestmentForm from '../shared/InvestmentForm';
import Button from '../atoms/Button';
import Card from '../atoms/Card';

const RedesignedInvestments = () => {
  const [investments, setInvestments] = useState([]);
  const [stats, setStats] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState(null);
  const [isUpdatingCrypto, setIsUpdatingCrypto] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  const [investmentService] = useState(() => new RedesignedInvestmentService());
  
  const categoryEmojis = {
    'Stocks': '📈',
    'Bonds': '📊',
    'Real Estate': '🏠',
    'Cryptocurrency': '₿',
    'ETF': '📑',
    'Mutual Funds': '💼',
    'Other': '📦'
  };
  
  // Load investment data
  const loadInvestments = async () => {
    try {
      const data = investmentService.getAllInvestments();
      // Sort by creation date descending
      const sortedData = [...data].sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
      setInvestments(sortedData);
      setStats(investmentService.getInvestmentStatistics());
    } catch (error) {
      console.error('Error loading investments:', error);
      setError(error.message);
    }
  };
  
  useEffect(() => {
    loadInvestments();
  }, []);
  
  const handleAddInvestment = async (investment) => {
    try {
      setError(null);
      setSuccessMessage('');
      
      const result = await investmentService.addInvestment(investment);
      
      if (!result.success) {
        throw new Error(result.message || 'Error adding investment');
      }
      
      // Show success message
      setSuccessMessage(result.message);
      setShowSuccessMessage(true);
      
      // Hide message after 5 seconds
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
      
      await loadInvestments();
      setShowForm(false);
      
      // Auto-update crypto prices if it's a cryptocurrency investment
      if (investment.category === 'Cryptocurrency') {
        setTimeout(async () => {
          try {
            await handleUpdateCryptoValues();
          } catch (error) {
            console.error('Error auto-updating crypto prices:', error);
          }
        }, 1000); // Small delay to let the investment save properly
      }
      
    } catch (error) {
      console.error('Error adding investment:', error);
      setError(error.message || 'Failed to add investment');
      throw error;
    }
  };
  
  const handleUpdateInvestment = async (investment) => {
    if (selectedInvestment) {
      try {
        await investmentService.updateInvestmentMetadata(selectedInvestment.id, investment);
        await loadInvestments();
        setSelectedInvestment(null);
        setShowForm(false);
        setSuccessMessage('Investment updated successfully');
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 5000);
      } catch (error) {
        setError(error.message || 'Failed to update investment');
      }
    }
  };
  
  const handleDeleteInvestment = async (id) => {
    if (window.confirm('Are you sure you want to delete this investment? This will also delete all purchase history.')) {
      try {
        await investmentService.deleteInvestment(id);
        await loadInvestments();
        setSuccessMessage('Investment deleted successfully');
        setShowSuccessMessage(true);
        setTimeout(() => setShowSuccessMessage(false), 5000);
      } catch (error) {
        setError(error.message || 'Failed to delete investment');
      }
    }
  };
  
  const handleEditClick = (investment) => {
    setSelectedInvestment(investment);
    setShowForm(true);
  };
  
  const handleUpdateCryptoValues = async () => {
    setIsUpdatingCrypto(true);
    try {
      // Clear cache first to ensure fresh data
      const cryptoService = investmentService.cryptoService;
      if (cryptoService && cryptoService.clearAllCache) {
        const cacheResult = cryptoService.clearAllCache();
        console.log('Cache cleared:', cacheResult);
      }
      
      // Get fresh Bitcoin price and update directly
      const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=bitcoin&vs_currencies=usd');
      const priceData = await response.json();
      const freshPrice = priceData.bitcoin;
      
      // Update investment service
      await investmentService.updateCryptoPrices();
      
      // Force update any Bitcoin investments with correct price
      const storedInvestments = localStorage.getItem('investments');
      if (storedInvestments) {
        const investments = JSON.parse(storedInvestments);
        let updated = false;
        
        investments.forEach(inv => {
          if (inv.coinId === 'bitcoin' || inv.name.toLowerCase().includes('bitcoin')) {
            inv.currentPriceUSD = freshPrice.usd;
            inv.lastPriceUpdate = new Date().toISOString();
            
            // Recalculate market value using USD
            if (inv.totalTokens) {
              inv.currentMarketValue = inv.totalTokens * freshPrice.usd;
              inv.unrealizedGains = inv.currentMarketValue - inv.totalInvested;
            }
            updated = true;
          }
        });
        
        if (updated) {
          localStorage.setItem('investments', JSON.stringify(investments));
        }
      }
      
      await loadInvestments();
      setSuccessMessage(`Cryptocurrency prices updated successfully. Bitcoin: $${freshPrice.usd.toFixed(2)}`);
      setShowSuccessMessage(true);
      setTimeout(() => setShowSuccessMessage(false), 5000);
    } catch (error) {
      console.error('Error updating crypto values:', error);
      setError('Failed to update cryptocurrency prices');
    } finally {
      setIsUpdatingCrypto(false);
    }
  };
  
  const formatCurrency = (value, investment = null) => {
    if (value === undefined || value === null) {
      return 'N/A';
    }
    
    // Always show values in USD
    let adjustedValue = value;
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(adjustedValue);
  };
  
  const formatPercentage = (percentage) => {
    if (percentage === undefined || percentage === null) {
      return 'N/A';
    }
    const sign = percentage > 0 ? '+' : '';
    return `${sign}${percentage.toFixed(2)}%`;
  };
  
  const formatTokenAmount = (amount, decimals = 8) => {
    if (amount === undefined || amount === null) {
      return 'N/A';
    }
    return amount.toFixed(decimals);
  };
  
  const getReturnColorClass = (value) => {
    if (value > 0) return 'text-green-600 dark:text-green-400';
    if (value < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };
  
  const getReturnBgClass = (value) => {
    if (value > 0) return 'bg-green-50 dark:bg-green-900/20';
    if (value < 0) return 'bg-red-50 dark:bg-red-900/20';
    return 'bg-gray-50 dark:bg-gray-700';
  };

  return (
    <div className="p-0">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 p-6 border-b border-gray-200 dark:border-gray-700">
        Investments
      </h1>
      
      <div className="p-6 space-y-6">
        {/* Action Buttons */}
        <div className="flex flex-wrap gap-2 justify-end mb-4">
          <Button 
            variant="secondary"
            className="bg-emerald-100 text-emerald-800 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:hover:bg-emerald-800/60" 
            onClick={handleUpdateCryptoValues}
            disabled={isUpdatingCrypto}
          >
            {isUpdatingCrypto ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </>
            ) : (
              'Update Prices'
            )}
          </Button>
          
          <Button 
            variant="primary"
            className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800" 
            onClick={() => {
              setSelectedInvestment(null);
              setShowForm(!showForm);
            }}
          >
            {showForm ? 'Cancel' : 'New Investment'}
          </Button>
        </div>
        
        {/* Success Message */}
        {showSuccessMessage && successMessage && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-3 rounded-md">
            <div className="flex items-start justify-between">
              <div className="flex items-center">
                <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
                </svg>
                <span className="flex-1">{successMessage}</span>
              </div>
              <button 
                onClick={() => setShowSuccessMessage(false)}
                className="flex-shrink-0 ml-4 text-green-700 dark:text-green-300 hover:text-green-900 dark:hover:text-green-100"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </button>
            </div>
          </div>
        )}
        
        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-md flex items-start justify-between">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
              </svg>
              <span>{error}</span>
            </div>
            <button 
              onClick={() => setError(null)}
              className="text-red-700 dark:text-red-300 hover:text-red-900 dark:hover:text-red-100 ml-auto"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>
        )}
        
        {/* Portfolio Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg shadow bg-indigo-50 dark:bg-indigo-900/30">
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Invested</div>
            <div className="text-xl md:text-2xl font-bold text-indigo-600 dark:text-indigo-400 truncate">
              {formatCurrency(stats.totalInvested)}
            </div>
          </div>
          
          <div className="p-4 rounded-lg shadow bg-sky-50 dark:bg-sky-900/30">
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Current Value</div>
            <div className="text-xl md:text-2xl font-bold text-sky-600 dark:text-sky-400 truncate">
              {formatCurrency(stats.totalCurrent)}
            </div>
          </div>
          
          <div className={`p-4 rounded-lg shadow ${getReturnBgClass(stats.totalReturns)}`}>
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Returns</div>
            <div className={`text-xl md:text-2xl font-bold ${getReturnColorClass(stats.totalReturns)} truncate`}>
              {formatCurrency(stats.totalReturns)}
            </div>
          </div>
          
          <div className={`p-4 rounded-lg shadow ${getReturnBgClass(stats.averageReturn)}`}>
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Avg. Return</div>
            <div className={`text-xl md:text-2xl font-bold ${getReturnColorClass(stats.averageReturn)} truncate`}>
              {formatPercentage(stats.averageReturn)}
            </div>
          </div>
        </div>
        
        {/* Add Investment Form */}
        {showForm && (
          <Card>
            <h2 className="text-xl font-semibold mb-4 text-slate-700 dark:text-slate-200">
              {selectedInvestment ? 'Edit Investment' : 'Add New Investment'}
            </h2>
            
            <InvestmentForm
              onSubmit={selectedInvestment ? handleUpdateInvestment : handleAddInvestment}
              initialValues={selectedInvestment || {}}
              buttonText={selectedInvestment ? 'Update Investment' : 'Add Investment'}
            />
          </Card>
        )}
        
        {/* Investments List */}
        <div>
          <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4">Your Investments</h2>
          
          {investments.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center">
              <p className="text-gray-500 dark:text-gray-400">No investments yet. Add your first investment!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {investments.map((investment) => {
                const returnValue = investment.unrealizedGains || 0;
                const returnPercentage = investment.unrealizedGains && investment.totalInvested ? 
                  (investment.unrealizedGains / investment.totalInvested) * 100 : 0;
                               
                return (
                  <Card key={investment.id} className="hover:shadow-md transition-shadow w-full">
                    {/* Header with title and main info */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex flex-col">
                        <div className="flex items-center">
                          {investment.coinThumb && (
                            <img 
                              src={investment.coinThumb} 
                              alt={investment.name} 
                              className="w-6 h-6 mr-2 rounded-full"
                            />
                          )}
                          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">
                            {investment.name}
                            {investment.coinSymbol && (
                              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                                ({investment.coinSymbol})
                              </span>
                            )}
                          </h3>
                        </div>
                        {investment.category === 'Cryptocurrency' && investment.currentPriceUSD && (
                          <div className="flex items-center mt-1">
                            <span className="text-sm text-gray-500 dark:text-gray-400 mr-2">Price:</span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              {formatCurrency(investment.currentPriceUSD)}
                            </span>
                          </div>
                        )}
                      </div>
                      <div className={`px-3 py-1 rounded-lg ${getReturnBgClass(returnValue)}`}>
                        <div className={`text-sm font-bold ${getReturnColorClass(returnValue)}`}>
                          {formatPercentage(returnPercentage)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Investment metadata and current value */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-0">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
                            {categoryEmojis[investment.category] || '📦'} {investment.category || 'Other'}
                          </span>
                          <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
                            Since: {new Date(investment.createdAt).toLocaleDateString()}
                          </span>
                          {investment.lastPriceUpdate && (
                            <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
                              Updated: {new Date(investment.lastPriceUpdate).toLocaleString()}
                            </span>
                          )}
                          {investment.purchases && investment.purchases.length > 0 && (
                            <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
                              Purchases: {investment.purchases.length}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm text-gray-600 dark:text-gray-400">Current Value</div>
                        <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                          {formatCurrency(investment.currentMarketValue)}
                        </div>
                        {investment.category === 'Cryptocurrency' && investment.totalTokens && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {formatTokenAmount(investment.totalTokens, 4)} {investment.coinSymbol}
                          </div>
                        )}
                      </div>
                    </div>
                    
                    {/* Action buttons */}
                    <div className="flex flex-wrap gap-2 mb-2">
                      <Button
                        variant="tertiary"
                        size="sm"
                        onClick={() => handleEditClick(investment)}
                        className="text-blue-800 bg-blue-100 hover:bg-blue-200 dark:text-blue-200 dark:bg-blue-900/40 dark:hover:bg-blue-800/60"
                      >
                        Edit
                      </Button>
                      <Button
                        variant="tertiary"
                        size="sm"
                        onClick={() => handleDeleteInvestment(investment.id)}
                        className="text-red-800 bg-red-100 hover:bg-red-200 dark:text-red-200 dark:bg-red-900/40 dark:hover:bg-red-800/60"
                      >
                        Delete
                      </Button>
                      <Link to={`/investment-details/${investment.id}`}>
                        <Button
                          variant="tertiary"
                          size="sm"
                          className="text-gray-600 bg-gray-100 hover:bg-gray-200 dark:text-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600"
                        >
                          View Details
                        </Button>
                      </Link>
                    </div>
                    
                    {/* Quick stats */}
                    <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 mt-3">
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-sm">
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Total Invested</div>
                          <div className="font-medium">{formatCurrency(investment.totalInvested)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Unrealized Gain</div>
                          <div className={`font-medium ${getReturnColorClass(returnValue)}`}>
                            {formatCurrency(returnValue)}
                          </div>
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RedesignedInvestments; 