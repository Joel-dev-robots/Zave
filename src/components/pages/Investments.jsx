import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  addInvestment,
  updateInvestment,
  deleteInvestment,
  updateInvestmentValue,
  getAllInvestments,
  getInvestmentStatistics,
  updateCryptoInvestmentValues,
  updateCryptoHoldings,
  getCryptoPriceHistory
} from '../../services/investmentService';
import InvestmentForm from '../shared/InvestmentForm';
import Button from '../atoms/Button';
import Card from '../atoms/Card';
import PriceChart from '../shared/PriceChart';

const Investments = () => {
  const [investments, setInvestments] = useState([]);
  const [stats, setStats] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [showUpdateValueForm, setShowUpdateValueForm] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState(null);
  const [newValue, setNewValue] = useState('');
  const [newTokens, setNewTokens] = useState('');
  const [valueError, setValueError] = useState('');
  const [tokenError, setTokenError] = useState('');
  const [updateMode, setUpdateMode] = useState('value'); // 'value' o 'tokens'
  const [isUpdatingCrypto, setIsUpdatingCrypto] = useState(false);
  const [error, setError] = useState(null);
  const [expandedInvestment, setExpandedInvestment] = useState(null);
  const [priceHistory, setPriceHistory] = useState(null);
  const [priceHistoryDays, setPriceHistoryDays] = useState(7);
  const [successMessage, setSuccessMessage] = useState('');
  const [showSuccessMessage, setShowSuccessMessage] = useState(false);
  
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
  const loadInvestments = () => {
    const data = getAllInvestments();
    // Sort by date descending
    const sortedData = [...data].sort(
      (a, b) => new Date(b.date) - new Date(a.date)
    );
    setInvestments(sortedData);
    setStats(getInvestmentStatistics());
  };
  
  useEffect(() => {
    loadInvestments();
  }, []);
  
  const handleAddInvestment = async (investment) => {
    try {
      setError(null);
      setSuccessMessage('');
      
      const result = await addInvestment(investment);
      
      if (!result.success) {
        throw new Error(result.message || 'Error adding investment');
      }
      
      // Si la operación fue exitosa, mostrar mensaje y actualizar datos
      setSuccessMessage(result.message);
      setShowSuccessMessage(true);
      
      // Ocultar el mensaje después de 5 segundos
      setTimeout(() => {
        setShowSuccessMessage(false);
      }, 5000);
      
      loadInvestments();
      setShowForm(false);
    } catch (error) {
      console.error('Error adding investment:', error);
      setError(error.message || 'Failed to add investment');
      throw error; // Re-lanzar el error para que el formulario lo maneje
    }
  };
  
  const handleUpdateInvestment = (investment) => {
    if (selectedInvestment) {
      updateInvestment(selectedInvestment.id, investment);
      loadInvestments();
      setSelectedInvestment(null);
      setShowForm(false);
    }
  };
  
  const handleDeleteInvestment = (id) => {
    if (window.confirm('Are you sure you want to delete this investment?')) {
      deleteInvestment(id);
      loadInvestments();
    }
  };
  
  const handleEditClick = (investment) => {
    setSelectedInvestment(investment);
    setShowForm(true);
  };
  
  const handleUpdateValueClick = (investment) => {
    setSelectedInvestment(investment);
    setNewValue(investment.currentValue);
    setNewTokens(investment.initialAmount || '');
    setUpdateMode('value');
    setShowUpdateValueForm(true);
  };
  
  const handleUpdateValueSubmit = (e) => {
    e.preventDefault();
    
    if (updateMode === 'value') {
      if (!newValue || isNaN(newValue) || Number(newValue) < 0) {
        setValueError('Please enter a valid amount');
        return;
      }
    } else { // updateMode === 'tokens'
      if (!newTokens || isNaN(newTokens) || Number(newTokens) < 0) {
        setTokenError('Please enter a valid amount of tokens');
        return;
      }
    }
    
    if (selectedInvestment) {
      if (selectedInvestment.category === 'Cryptocurrency') {
        // Para criptomonedas, usar la nueva función de actualización
        const updateData = updateMode === 'value' 
          ? { eurValue: Number(newValue) }
          : { tokenAmount: Number(newTokens) };
          
        updateCryptoHoldings(selectedInvestment.id, updateData);
      } else {
        // Para inversiones normales, usar la función original
        updateInvestmentValue(selectedInvestment.id, Number(newValue));
      }
      
      loadInvestments();
      setSelectedInvestment(null);
      setShowUpdateValueForm(false);
      setNewValue('');
      setNewTokens('');
      setValueError('');
      setTokenError('');
    }
  };
  
  // Nueva función para actualizar criptomonedas
  const handleUpdateCryptoValues = async () => {
    setIsUpdatingCrypto(true);
    try {
      await updateCryptoInvestmentValues();
      loadInvestments();
    } catch (error) {
      console.error('Error updating crypto values:', error);
    } finally {
      setIsUpdatingCrypto(false);
    }
  };
  
  const formatCryptoPrice = (price) => {
    if (price === undefined || price === null) {
      return 'N/A';
    }
    if (price < 1) {
      return price.toFixed(4);
    } else if (price < 10) {
      return price.toFixed(3);
    } else if (price < 100) {
      return price.toFixed(2);
    } else if (price < 1000) {
      return price.toFixed(1);
    } else {
      return price.toLocaleString();
    }
  };
  
  const formatCurrency = (value) => {
    if (value === undefined || value === null) {
      return 'N/A';
    }
    if (value < 1000) {
      return value.toFixed(2);
    } else if (value < 1000000) {
      return (value / 1000).toFixed(2) + 'K';
    } else if (value < 1000000000) {
      return (value / 1000000).toFixed(2) + 'M';
    } else {
      return (value / 1000000000).toFixed(2) + 'B';
    }
  };
  
  const formatPercentage = (percentage) => {
    if (percentage === undefined || percentage === null) {
      return 'N/A';
    }
    if (percentage < 0) {
      return `-${Math.abs(percentage).toFixed(2)}`;
    } else {
      return `${percentage.toFixed(2)}`;
    }
  };
  
  const formatTokenAmount = (amount) => {
    if (amount === undefined || amount === null) {
      return 'N/A';
    }
    return amount.toLocaleString();
  };
  
  const handleExpandInvestment = async (investment) => {
    if (expandedInvestment?.id === investment.id) {
      setExpandedInvestment(null);
      setPriceHistory(null);
    } else {
      setExpandedInvestment(investment);
      if (investment.category === 'Cryptocurrency' && investment.coinId) {
        const history = await getCryptoPriceHistory(investment.coinId, priceHistoryDays);
        setPriceHistory(history);
      }
    }
  };
  
  const handlePriceHistoryDaysChange = async (days) => {
    setPriceHistoryDays(days);
    if (expandedInvestment?.category === 'Cryptocurrency' && expandedInvestment?.coinId) {
      const history = await getCryptoPriceHistory(expandedInvestment.coinId, days);
      setPriceHistory(history);
    }
  };
  
  return (
    <div className="p-0">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 p-6 border-b border-gray-200 dark:border-gray-700">Investments</h1>
      
      <div className="p-6 space-y-6">
        <div className="flex flex-wrap gap-2 justify-end mb-4">
          <Link to="/investment-history">
            <Button 
              variant="secondary"
              className="bg-blue-100 text-blue-800 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:hover:bg-blue-800/60" 
            >
              <svg 
                xmlns="http://www.w3.org/2000/svg" 
                className="h-4 w-4 mr-1" 
                viewBox="0 0 20 20" 
                fill="currentColor"
              >
                <path 
                  fillRule="evenodd" 
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" 
                  clipRule="evenodd" 
                />
              </svg>
              View History
            </Button>
          </Link>
          
          {/* Nuevo botón para actualizar criptomonedas */}
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
                Actualizando...
              </>
            ) : (
              'Actualizar Cripto'
            )}
          </Button>
          
          <Button 
            variant="primary"
            className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800" 
            onClick={() => {
              setSelectedInvestment(null);
              setShowForm(!showForm);
              if (showUpdateValueForm) setShowUpdateValueForm(false);
            }}
          >
            {showForm ? 'Cancel' : 'New Investment'}
          </Button>
        </div>
        
        {/* Success Message */}
        {showSuccessMessage && successMessage && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 px-4 py-3 rounded-md flex items-start justify-between">
            <div className="flex items-center">
              <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"></path>
              </svg>
              <span>{successMessage}</span>
            </div>
            <button 
              onClick={() => setShowSuccessMessage(false)}
              className="text-green-700 dark:text-green-300 hover:text-green-900 dark:hover:text-green-100 ml-auto"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
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
        
        {/* Statistics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg shadow bg-indigo-50 dark:bg-indigo-900/30">
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Invested</div>
            <div className="text-xl md:text-2xl font-bold text-indigo-600 dark:text-indigo-400 truncate">
              €{formatCurrency(stats.totalInvested)}
            </div>
          </div>
          
          <div className="p-4 rounded-lg shadow bg-sky-50 dark:bg-sky-900/30">
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Current Value</div>
            <div className="text-xl md:text-2xl font-bold text-sky-600 dark:text-sky-400 truncate">
              €{formatCurrency(stats.totalCurrent)}
            </div>
          </div>
          
          <div className={`p-4 rounded-lg shadow ${
            stats.totalReturns > 0 ? 'bg-green-50 dark:bg-green-900/30' : stats.totalReturns < 0 ? 'bg-red-50 dark:bg-red-900/30' : 'bg-gray-50 dark:bg-gray-800'
          }`}>
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Returns</div>
            <div className={`text-xl md:text-2xl font-bold ${
              stats.totalReturns > 0 
                ? 'text-green-600 dark:text-green-400' 
                : stats.totalReturns < 0 
                  ? 'text-red-600 dark:text-red-400' 
                  : 'text-gray-600 dark:text-gray-400'
            } truncate`}>
              {stats.totalReturns > 0 ? '+' : ''}
              €{formatCurrency(stats.totalReturns)}
            </div>
          </div>
          
          <div className={`p-4 rounded-lg shadow ${
            stats.averageReturn > 0 ? 'bg-emerald-50 dark:bg-emerald-900/30' : stats.averageReturn < 0 ? 'bg-orange-50 dark:bg-orange-900/30' : 'bg-gray-50 dark:bg-gray-800'
          }`}>
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Avg. Return</div>
            <div className={`text-xl md:text-2xl font-bold ${
              stats.averageReturn > 0 
                ? 'text-emerald-600 dark:text-emerald-400' 
                : stats.averageReturn < 0 
                  ? 'text-orange-600 dark:text-orange-400' 
                  : 'text-gray-600 dark:text-gray-400'
            } truncate`}>
              {stats.averageReturn > 0 ? '+' : ''}
              {formatPercentage(stats.averageReturn)}%
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
              initialValues={selectedInvestment || {}}
              onSubmit={selectedInvestment ? handleUpdateInvestment : handleAddInvestment}
              buttonText={selectedInvestment ? 'Update Investment' : 'Add Investment'}
            />
          </Card>
        )}
        
        {/* Update Holdings Form */}
        {showUpdateValueForm && selectedInvestment && (
          <Card>
            <h2 className="text-xl font-semibold mb-4 text-slate-700 dark:text-slate-200">
              Update Holdings: {selectedInvestment.name}
            </h2>
            
            {selectedInvestment.category === 'Cryptocurrency' && (
              <div className="mb-4">
                <div className="flex space-x-4 mb-3">
                  <button
                    type="button"
                    onClick={() => setUpdateMode('value')}
                    className={`flex-1 py-2 px-3 text-sm font-medium rounded-md ${
                      updateMode === 'value'
                        ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    Update Value (€)
                  </button>
                  <button
                    type="button"
                    onClick={() => setUpdateMode('tokens')}
                    className={`flex-1 py-2 px-3 text-sm font-medium rounded-md ${
                      updateMode === 'tokens'
                        ? 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300'
                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700'
                    }`}
                  >
                    Update Tokens
                  </button>
                </div>
                
                <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md text-sm text-blue-800 dark:text-blue-300 mb-4">
                  <p>
                    <strong>Note:</strong> When you update {updateMode === 'value' ? 'the value' : 'tokens'}, 
                    the {updateMode === 'value' ? 'token amount' : 'value'} will be automatically recalculated 
                    based on the current token price.
                  </p>
                </div>
              </div>
            )}
            
            <form onSubmit={handleUpdateValueSubmit} className="space-y-4">
              {updateMode === 'value' ? (
                <div>
                  <label htmlFor="currentValue" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Current Value
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400 sm:text-sm">€</span>
                    </div>
                    <input
                      type="number"
                      name="currentValue"
                      id="currentValue"
                      min="0"
                      step="0.01"
                      value={newValue}
                      onChange={(e) => {
                        setNewValue(e.target.value);
                        setValueError('');
                      }}
                      className={`focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                        valueError ? 'border-red-300 dark:border-red-500' : ''
                      }`}
                      placeholder="0.00"
                    />
                  </div>
                  {valueError && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{valueError}</p>}
                </div>
              ) : (
                <div>
                  <label htmlFor="tokenAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Token Amount
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 dark:text-gray-400 sm:text-sm">
                        {selectedInvestment.coinSymbol || 'Tokens'}
                      </span>
                    </div>
                    <input
                      type="number"
                      name="tokenAmount"
                      id="tokenAmount"
                      min="0"
                      step="0.000001"
                      value={newTokens}
                      onChange={(e) => {
                        setNewTokens(e.target.value);
                        setTokenError('');
                      }}
                      className={`focus:ring-indigo-500 focus:border-indigo-500 block w-full pr-16 sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                        tokenError ? 'border-red-300 dark:border-red-500' : ''
                      }`}
                      placeholder="0.00"
                    />
                  </div>
                  {tokenError && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{tokenError}</p>}
                </div>
              )}
              
              <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3 mt-3">
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Initial Investment:</div>
                      <div className="font-medium">€{formatCurrency(selectedInvestment?.initialInvestment)}</div>
                    </div>
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Current Value:</div>
                      <div className="font-medium">€{formatCurrency(selectedInvestment?.currentValue)}</div>
                    </div>
                    {selectedInvestment.category === 'Cryptocurrency' && (
                      <>
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Current Token Price:</div>
                          <div className="font-medium">€{formatCryptoPrice(selectedInvestment?.coinPriceEUR)}</div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Token Amount:</div>
                          <div className="font-medium">{formatTokenAmount(selectedInvestment?.initialAmount)} {selectedInvestment.coinSymbol}</div>
                        </div>
                      </>
                    )}
                    <div>
                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Return:</div>
                      <div className={`font-medium ${
                        (selectedInvestment?.returnPercentage || 0) > 0 ? 'text-green-600 dark:text-green-400' : 
                        (selectedInvestment?.returnPercentage || 0) < 0 ? 'text-red-600 dark:text-red-400' : ''
                      }`}>
                        {(selectedInvestment?.returnPercentage || 0) > 0 ? '+' : ''}
                        {(selectedInvestment?.returnPercentage || 0).toFixed(2)}%
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="pt-2">
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800"
                >
                  {selectedInvestment.category === 'Cryptocurrency' 
                    ? `Update ${updateMode === 'value' ? 'Value' : 'Tokens'}`
                    : 'Update Value'}
                </Button>
              </div>
            </form>
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
                const isPositive = investment.returnPercentage > 0;
                const isNegative = investment.returnPercentage < 0;
                const returnColor = isPositive ? 'text-green-600 dark:text-green-400' : 
                                   isNegative ? 'text-red-600 dark:text-red-400' : 
                                   'text-gray-600 dark:text-gray-400';
                const bgColor = isPositive ? 'bg-green-50 dark:bg-green-900/20' : 
                               isNegative ? 'bg-red-50 dark:bg-red-900/20' : 
                               'bg-gray-50 dark:bg-gray-700';
                const isExpanded = expandedInvestment?.id === investment.id;
                               
                return (
                  <Card key={investment.id} className="hover:shadow-md transition-shadow w-full">
                    {/* Cabecera con título e info principal */}
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 flex items-center truncate max-w-[70%]">
                        {investment.coinThumb && (
                          <img 
                            src={investment.coinThumb} 
                            alt={investment.name} 
                            className="w-6 h-6 mr-2 rounded-full"
                          />
                        )}
                        {investment.name}
                        {investment.coinSymbol && (
                          <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                            ({investment.coinSymbol})
                          </span>
                        )}
                      </h3>
                      <div className={`px-3 py-1 rounded-lg ${bgColor}`}>
                        <div className={`text-sm font-bold ${returnColor}`}>
                          {isPositive ? '+' : ''}
                          {(investment.returnPercentage || 0).toFixed(2)}%
                        </div>
                      </div>
                    </div>
                    
                    {/* Metadata y valor actual */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-3">
                      <div className="text-sm text-gray-600 dark:text-gray-400 mb-2 sm:mb-0">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
                            {categoryEmojis[investment.category] || '📦'} {investment.category || 'Other'}
                          </span>
                          <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
                            Since: {new Date(investment.date).toLocaleDateString()}
                          </span>
                          {investment.lastUpdated && (
                            <span className="bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-md">
                              Updated: {new Date(investment.lastUpdated).toLocaleString()}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-sm text-gray-600 dark:text-gray-400">Current Value</div>
                        <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                          €{formatCurrency(investment.currentValue)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Botones de acción */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      <Button
                        variant="tertiary"
                        size="sm"
                        onClick={() => handleUpdateValueClick(investment)}
                        className="text-indigo-800 bg-indigo-100 hover:bg-indigo-200 dark:text-indigo-200 dark:bg-indigo-900/40 dark:hover:bg-indigo-800/60"
                      >
                        {investment.category === 'Cryptocurrency' ? 'Update Holdings' : 'Update Value'}
                      </Button>
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
                    </div>
                    
                    {/* Botón para expandir/colapsar */}
                    <div className="flex justify-end mb-2">
                      <Button
                        variant="tertiary"
                        size="sm"
                        onClick={() => handleExpandInvestment(investment)}
                        className="text-gray-600 hover:text-gray-800 dark:text-gray-400 dark:hover:text-gray-200 flex items-center transition-all duration-200"
                      >
                        <span className={`transform ${isExpanded ? 'rotate-180' : 'rotate-0'} transition-transform duration-200 mr-1`}>
                          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                          </svg>
                        </span>
                        {isExpanded ? 'Hide Details' : 'Show Details'}
                      </Button>
                    </div>
                    
                    {/* Contenido expandible */}
                    <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[2000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                      <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                        {/* Historial de compras */}
                        {investment.purchaseHistory && investment.purchaseHistory.length > 0 && (
                          <div className="mb-6">
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                              Purchase History
                            </h4>
                            <div className="space-y-2">
                              {investment.purchaseHistory.map((purchase) => (
                                <div 
                                  key={purchase.id}
                                  className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-3"
                                >
                                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                    <div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Date</div>
                                      <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                        {new Date(purchase.date).toLocaleDateString()}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Amount</div>
                                      <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                        €{formatCurrency(purchase.amount)}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Tokens</div>
                                      <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                        {formatTokenAmount(purchase.tokens)} {investment.coinSymbol}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Price per Token</div>
                                      <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                        €{formatCryptoPrice(purchase.pricePerToken)}
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                        
                        {/* Gráfico de evolución de precio */}
                        {investment.category === 'Cryptocurrency' && priceHistory && (
                          <div>
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
                                Price Evolution
                              </h4>
                              <div className="flex space-x-2">
                                {[7, 30, 90, 365].map((days) => (
                                  <button
                                    key={days}
                                    onClick={() => handlePriceHistoryDaysChange(days)}
                                    className={`px-2 py-1 text-xs rounded-md ${
                                      priceHistoryDays === days
                                        ? 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300'
                                        : 'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400'
                                    }`}
                                  >
                                    {days === 365 ? '1Y' : `${days}d`}
                                  </button>
                                ))}
                              </div>
                            </div>
                            
                            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4">
                              <div className="h-48">
                                <PriceChart data={priceHistory} />
                              </div>
                            </div>
                          </div>
                        )}
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

export default Investments; 