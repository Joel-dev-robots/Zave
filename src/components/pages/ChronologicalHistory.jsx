import { useState, useEffect } from 'react';
import { 
  getChronologicalHistory, 
  filterHistoryByCategory,
  filterHistoryByDateRange,
  filterHistoryByAmount,
  groupHistoryByPeriod
} from '../../services/chronologicalHistoryService';
import Card from '../atoms/Card';
import Button from '../atoms/Button';

const ChronologicalHistory = () => {
  const [history, setHistory] = useState([]);
  const [filteredHistory, setFilteredHistory] = useState([]);
  const [expandedTransaction, setExpandedTransaction] = useState(null);
  
  // Filtros
  const [categoryFilter, setCategoryFilter] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");
  const [viewMode, setViewMode] = useState("table"); // "table" o "timeline"
  const [periodType, setPeriodType] = useState("month"); // "month", "quarter", "year"
  const [showGrouped, setShowGrouped] = useState(false);
  
  // Categorías disponibles (extraídas de las transacciones)
  const [availableCategories, setAvailableCategories] = useState([]);
  
  // Datos agrupados por período
  const [groupedData, setGroupedData] = useState({});
  
  // Emojis de categorías
  const categoryEmojis = {
    'Stocks': '📈',
    'Bonds': '📊',
    'Real Estate': '🏠',
    'Cryptocurrency': '₿',
    'ETF': '📑',
    'Mutual Funds': '💼',
    'Other': '📦'
  };
  
  useEffect(() => {
    loadHistory();
  }, []);
  
  const loadHistory = () => {
    const chronologicalHistory = getChronologicalHistory();
    setHistory(chronologicalHistory);
    setFilteredHistory(chronologicalHistory);
    
    // Extraer categorías únicas
    const categories = [...new Set(chronologicalHistory.map(item => item.category))];
    setAvailableCategories(categories);
    
    // Agrupar datos por período (por defecto, mensual)
    setGroupedData(groupHistoryByPeriod(chronologicalHistory, periodType));
  };
  
  // Aplicar filtros
  const applyFilters = () => {
    let filtered = history;
    
    // Filtro por categoría
    if (categoryFilter) {
      filtered = filterHistoryByCategory(filtered, categoryFilter);
    }
    
    // Filtro por rango de fechas
    if (startDate || endDate) {
      const start = startDate ? new Date(startDate) : null;
      const end = endDate ? new Date(endDate) : null;
      filtered = filterHistoryByDateRange(filtered, start, end);
    }
    
    // Filtro por monto
    if (minAmount || maxAmount) {
      const min = minAmount ? Number(minAmount) : null;
      const max = maxAmount ? Number(maxAmount) : null;
      filtered = filterHistoryByAmount(filtered, min, max);
    }
    
    setFilteredHistory(filtered);
    
    // Actualizar datos agrupados con la nueva lista filtrada
    setGroupedData(groupHistoryByPeriod(filtered, periodType));
  };
  
  // Cambiar el tipo de período para agrupación
  const handlePeriodTypeChange = (type) => {
    setPeriodType(type);
    setGroupedData(groupHistoryByPeriod(filteredHistory, type));
  };
  
  // Limpiar todos los filtros
  const clearFilters = () => {
    setCategoryFilter("");
    setStartDate("");
    setEndDate("");
    setMinAmount("");
    setMaxAmount("");
    setFilteredHistory(history);
    setGroupedData(groupHistoryByPeriod(history, periodType));
  };
  
  // Formato para montos
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
  
  // Formato para porcentajes
  const formatPercentage = (percentage) => {
    if (percentage === undefined || percentage === null) {
      return 'N/A';
    }
    return percentage.toFixed(2);
  };
  
  // Formato para tokens
  const formatTokenAmount = (amount) => {
    if (amount === undefined || amount === null) {
      return 'N/A';
    }
    return amount.toLocaleString(undefined, { maximumFractionDigits: 8 });
  };
  
  // Formato para precios de criptomonedas
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
  
  return (
    <div className="p-0">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 p-6 border-b border-gray-200 dark:border-gray-700">
        Investment History
      </h1>
      
      <div className="p-6 space-y-6">
        {/* Filtros */}
        <Card>
          <div className="mb-4">
            <h2 className="text-lg font-semibold text-gray-700 dark:text-gray-300 mb-3 text-left">
              Filters
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Filtro por categoría */}
              <div>
                <label htmlFor="categoryFilter" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Category
                </label>
                <select
                  id="categoryFilter"
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                >
                  <option value="">All Categories</option>
                  {availableCategories.map(category => (
                    <option key={category} value={category}>
                      {categoryEmojis[category] || '📦'} {category}
                    </option>
                  ))}
                </select>
              </div>
              
              {/* Filtro por fecha inicial */}
              <div>
                <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  id="startDate"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              {/* Filtro por fecha final */}
              <div>
                <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  End Date
                </label>
                <input
                  type="date"
                  id="endDate"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                />
              </div>
              
              {/* Filtro por monto mínimo */}
              <div>
                <label htmlFor="minAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Min Amount (€)
                </label>
                <input
                  type="number"
                  id="minAmount"
                  value={minAmount}
                  onChange={(e) => setMinAmount(e.target.value)}
                  className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                  placeholder="0"
                  min="0"
                  step="1"
                />
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2 mt-4">
              <Button
                variant="primary"
                className="bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800"
                onClick={applyFilters}
              >
                Apply Filters
              </Button>
              <Button
                variant="secondary"
                className="border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                onClick={clearFilters}
              >
                Clear Filters
              </Button>
              
              <div className="ml-auto flex gap-2">
                <Button
                  variant={viewMode === 'table' ? 'primary' : 'secondary'}
                  className={viewMode === 'table' 
                    ? 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800'
                  }
                  onClick={() => setViewMode('table')}
                >
                  Table View
                </Button>
                <Button
                  variant={viewMode === 'timeline' ? 'primary' : 'secondary'}
                  className={viewMode === 'timeline' 
                    ? 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800'
                    : 'border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800'
                  }
                  onClick={() => setViewMode('timeline')}
                >
                  Timeline
                </Button>
              </div>
            </div>
            
            {/* Opciones de agrupación */}
            <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex flex-wrap items-center gap-3">
                <div className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Group by:
                </div>
                <div className="flex gap-2">
                  <Button
                    variant={periodType === 'month' ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => handlePeriodTypeChange('month')}
                    className={periodType === 'month' 
                      ? 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800'
                    }
                  >
                    Month
                  </Button>
                  <Button
                    variant={periodType === 'quarter' ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => handlePeriodTypeChange('quarter')}
                    className={periodType === 'quarter' 
                      ? 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800'
                    }
                  >
                    Quarter
                  </Button>
                  <Button
                    variant={periodType === 'year' ? 'primary' : 'secondary'}
                    size="sm"
                    onClick={() => handlePeriodTypeChange('year')}
                    className={periodType === 'year' 
                      ? 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800'
                      : 'border-gray-300 text-gray-700 hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800'
                    }
                  >
                    Year
                  </Button>
                </div>
                
                <div className="ml-auto">
                  <button
                    type="button"
                    onClick={() => setShowGrouped(!showGrouped)}
                    className="text-sm font-medium text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300"
                  >
                    {showGrouped ? 'Show All Transactions' : 'Show Grouped Summary'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Card>
        
        {/* Contenido principal */}
        <div>
          {showGrouped ? (
            /* Vista agrupada */
            <div className="space-y-6">
              {Object.keys(groupedData).sort().reverse().map(periodKey => {
                const period = groupedData[periodKey];
                
                return (
                  <Card key={periodKey}>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                        {/* Formatear el período para mostrar */}
                        {periodType === 'month' 
                          ? new Date(periodKey + '-01').toLocaleDateString(undefined, { year: 'numeric', month: 'long' })
                          : periodType === 'quarter'
                            ? `${periodKey.split('-')[0]} Q${periodKey.split('-Q')[1]}`
                            : periodKey
                        }
                      </h3>
                      <div className="text-right">
                        <div className="text-sm text-gray-600 dark:text-gray-400">
                          Total Invested
                        </div>
                        <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                          €{formatCurrency(period.totalInvested)}
                        </div>
                      </div>
                    </div>
                    
                    {/* Resumen de categorías */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 mb-4">
                      {Object.keys(period.categories).map(category => (
                        <div 
                          key={category}
                          className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg"
                        >
                          <div className="flex justify-between items-center">
                            <span className="font-medium">
                              {categoryEmojis[category] || '📦'} {category}
                            </span>
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {period.categories[category].count} transaction{period.categories[category].count !== 1 ? 's' : ''}
                            </span>
                          </div>
                          <div className="mt-1 font-medium text-gray-800 dark:text-gray-200">
                            €{formatCurrency(period.categories[category].totalInvested)}
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Retorno para este período */}
                    <div className="mt-3 border-t border-gray-200 dark:border-gray-700 pt-3">
                      <div className="flex justify-between items-center">
                        <div className="text-sm font-medium text-gray-600 dark:text-gray-400">
                          Current value: €{formatCurrency(period.totalCurrentValue)}
                        </div>
                        <div className={`font-medium ${period.totalReturn >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {period.totalReturn >= 0 ? '+' : ''}
                          €{formatCurrency(period.totalReturn)} ({formatPercentage(period.totalReturnPercentage)}%)
                        </div>
                      </div>
                    </div>
                  </Card>
                );
              })}
            </div>
          ) : (
            /* Vista de transacciones individuales */
            <div>
              {filteredHistory.length === 0 ? (
                <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center">
                  <p className="text-gray-500 dark:text-gray-400">No transactions match your filters.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Encabezado de tabla */}
                  <div className="hidden md:grid md:grid-cols-5 gap-3 mb-2 px-3">
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Investment</div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Date</div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Amount</div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Value</div>
                    <div className="text-sm font-medium text-gray-500 dark:text-gray-400 text-right">Return</div>
                  </div>
                  
                  {filteredHistory.map((transaction) => {
                    const isExpanded = expandedTransaction === transaction.id;
                    const isPositive = transaction.currentReturnPercentage > 0;
                    const isNegative = transaction.currentReturnPercentage < 0;
                    const returnColor = isPositive ? 'text-green-600 dark:text-green-400' : 
                                        isNegative ? 'text-red-600 dark:text-red-400' : 
                                        'text-gray-600 dark:text-gray-400';
                    
                    return (
                      <Card key={transaction.id} className="hover:shadow-md transition-shadow">
                        {/* Cabecera de la transacción - versión móvil */}
                        <div className="md:hidden mb-3">
                          <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200 flex items-center truncate max-w-full">
                            {transaction.coinThumb && (
                              <img 
                                src={transaction.coinThumb} 
                                alt={transaction.investmentName} 
                                className="w-6 h-6 mr-2 rounded-full"
                              />
                            )}
                            {transaction.investmentName}
                            {transaction.symbol && (
                              <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                                ({transaction.symbol})
                              </span>
                            )}
                          </h3>
                          
                          <div className="flex justify-between mt-2">
                            <div className="text-sm text-gray-600 dark:text-gray-400">
                              {new Date(transaction.date).toLocaleDateString()}
                            </div>
                            <div className={`text-sm font-medium ${returnColor}`}>
                              {isPositive ? '+' : ''}
                              {formatPercentage(transaction.currentReturnPercentage)}%
                            </div>
                          </div>
                        </div>
                        
                        {/* Cabecera de la transacción - versión desktop (grid) */}
                        <div className="hidden md:grid md:grid-cols-5 gap-3 items-center">
                          <div className="flex items-center">
                            {transaction.coinThumb && (
                              <img 
                                src={transaction.coinThumb} 
                                alt={transaction.investmentName} 
                                className="w-6 h-6 mr-2 rounded-full"
                              />
                            )}
                            <div>
                              <h3 className="font-medium text-gray-800 dark:text-gray-200 truncate">
                                {transaction.investmentName}
                              </h3>
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {categoryEmojis[transaction.category] || '📦'} {transaction.category}
                                {transaction.symbol && ` • ${transaction.symbol}`}
                              </div>
                            </div>
                          </div>
                          
                          <div className="text-sm text-gray-700 dark:text-gray-300">
                            {new Date(transaction.date).toLocaleDateString(undefined, { 
                              year: 'numeric', 
                              month: 'short', 
                              day: 'numeric' 
                            })}
                          </div>
                          
                          <div className="text-sm text-gray-700 dark:text-gray-300">
                            €{formatCurrency(transaction.amount)}
                            {transaction.tokens && (
                              <div className="text-xs text-gray-500 dark:text-gray-400">
                                {formatTokenAmount(transaction.tokens)} {transaction.symbol}
                              </div>
                            )}
                          </div>
                          
                          <div className="text-sm text-gray-700 dark:text-gray-300">
                            €{formatCurrency(transaction.currentValue)}
                          </div>
                          
                          <div className={`text-sm font-medium text-right ${returnColor}`}>
                            {isPositive ? '+' : ''}
                            €{formatCurrency(transaction.currentReturn)}
                            <div className="text-xs">
                              {isPositive ? '+' : ''}
                              {formatPercentage(transaction.currentReturnPercentage)}%
                            </div>
                          </div>
                        </div>
                        
                        {/* Información principal para móvil */}
                        <div className="grid grid-cols-2 gap-3 mb-3 md:hidden">
                          <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                              Amount Invested
                            </div>
                            <div className="font-medium text-gray-800 dark:text-gray-200">
                              €{formatCurrency(transaction.amount)}
                            </div>
                          </div>
                          
                          <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                              Current Value
                            </div>
                            <div className="font-medium text-gray-800 dark:text-gray-200">
                              €{formatCurrency(transaction.currentValue)}
                            </div>
                          </div>
                        </div>
                        
                        {/* Botón para expandir/colapsar */}
                        <div className="flex justify-end">
                          <Button
                            variant="tertiary"
                            size="sm"
                            onClick={() => setExpandedTransaction(isExpanded ? null : transaction.id)}
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
                        
                        {/* Contenido expandido */}
                        <div className={`overflow-hidden transition-all duration-300 ease-in-out ${isExpanded ? 'max-h-[1000px] opacity-100' : 'max-h-0 opacity-0'}`}>
                          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                              Transaction Details
                            </h4>
                            
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                              {/* Detalles de la compra */}
                              <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                  Transaction Date
                                </div>
                                <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                  {new Date(transaction.date).toLocaleString()}
                                </div>
                              </div>
                              
                              <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                  Amount Invested
                                </div>
                                <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                  €{formatCurrency(transaction.amount)}
                                </div>
                              </div>
                              
                              {/* Información de compra de criptomoneda */}
                              {transaction.category === 'Cryptocurrency' && transaction.tokens && (
                                <>
                                  <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                      Tokens Purchased
                                    </div>
                                    <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                      {formatTokenAmount(transaction.tokens)} {transaction.symbol}
                                    </div>
                                  </div>
                                  
                                  <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg">
                                    <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                      Purchase Price per Token
                                    </div>
                                    <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                      €{formatCryptoPrice(transaction.pricePerToken)}
                                    </div>
                                  </div>
                                </>
                              )}
                              
                              {/* Información de precio actual vs precio de compra */}
                              {transaction.category === 'Cryptocurrency' && transaction.pricePerToken && transaction.currentPricePerToken && (
                                <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg col-span-1 sm:col-span-2">
                                  <div className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                                    Price Change
                                  </div>
                                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                                    <div>
                                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                        Purchase Price:
                                      </div>
                                      <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                        €{formatCryptoPrice(transaction.pricePerToken)}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                        Current Price:
                                      </div>
                                      <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                        €{formatCryptoPrice(transaction.currentPricePerToken)}
                                      </div>
                                    </div>
                                    <div>
                                      <div className="text-xs font-medium text-gray-500 dark:text-gray-400">
                                        Price Change:
                                      </div>
                                      <div className={`text-sm font-medium ${
                                        transaction.currentPricePerToken > transaction.pricePerToken 
                                          ? 'text-green-600 dark:text-green-400' 
                                          : transaction.currentPricePerToken < transaction.pricePerToken 
                                            ? 'text-red-600 dark:text-red-400' 
                                            : 'text-gray-800 dark:text-gray-200'
                                      }`}>
                                        {transaction.currentPricePerToken > transaction.pricePerToken ? '+' : ''}
                                        {((transaction.currentPricePerToken - transaction.pricePerToken) / transaction.pricePerToken * 100).toFixed(2)}%
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                              
                              {/* Retorno total */}
                              <div className="bg-gray-50 dark:bg-gray-800/50 p-3 rounded-lg col-span-1 sm:col-span-2">
                                <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">
                                  Current Return
                                </div>
                                <div className="flex justify-between items-center">
                                  <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                    Original: €{formatCurrency(transaction.amount)}
                                  </div>
                                  <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                                    Current: €{formatCurrency(transaction.currentValue)}
                                  </div>
                                  <div className={`text-sm font-medium ${returnColor}`}>
                                    {isPositive ? '+' : ''}
                                    €{formatCurrency(transaction.currentReturn)} ({formatPercentage(transaction.currentReturnPercentage)}%)
                                  </div>
                                </div>
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
          )}
        </div>
      </div>
    </div>
  );
};

export default ChronologicalHistory; 