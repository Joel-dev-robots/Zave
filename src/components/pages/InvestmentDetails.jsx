import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { RedesignedInvestmentService } from '../../services/redesignedInvestmentService.js';
import Button from '../atoms/Button';
import Card from '../atoms/Card';

const InvestmentDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [investment, setInvestment] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [investmentService] = useState(() => new RedesignedInvestmentService());

  useEffect(() => {
    const loadInvestmentDetails = async () => {
      try {
        setLoading(true);
        const details = investmentService.getInvestmentDetails(id);
        setInvestment(details);
      } catch (error) {
        console.error('Error loading investment details:', error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      loadInvestmentDetails();
    }
  }, [id, investmentService]);

  const formatCurrency = (value) => {
    if (value === undefined || value === null) return 'N/A';
    
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const formatPercentage = (percentage) => {
    if (percentage === undefined || percentage === null) return 'N/A';
    const sign = percentage > 0 ? '+' : '';
    return `${sign}${percentage.toFixed(2)}%`;
  };

  const formatTokenAmount = (amount, decimals = 8) => {
    if (amount === undefined || amount === null) return 'N/A';
    return amount.toFixed(decimals);
  };

  const getReturnColorClass = (value) => {
    if (value > 0) return 'text-green-600 dark:text-green-400';
    if (value < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const handleDeleteInvestment = async () => {
    if (window.confirm('Are you sure you want to delete this investment? This action cannot be undone.')) {
      try {
        await investmentService.deleteInvestment(id);
        navigate('/investments');
      } catch (error) {
        setError('Failed to delete investment');
      }
    }
  };

  if (loading) {
    return (
      <div className="p-6 flex justify-center items-center min-h-96">
        <div className="text-center">
          <svg className="animate-spin -ml-1 mr-3 h-8 w-8 text-indigo-600 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <p className="mt-2 text-gray-600 dark:text-gray-400">Loading investment details...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 px-4 py-3 rounded-md">
          <div className="flex">
            <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"></path>
            </svg>
            <span>{error}</span>
          </div>
        </div>
        <div className="mt-4">
          <Link to="/investments">
            <Button variant="secondary">Back to Investments</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!investment) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-600 dark:text-gray-400">Investment not found</p>
        <div className="mt-4">
          <Link to="/investments">
            <Button variant="secondary">Back to Investments</Button>
          </Link>
        </div>
      </div>
    );
  }

  const returnValue = investment.unrealizedGains || 0;
  const returnPercentage = investment.unrealizedGains && investment.totalInvested ? 
    (investment.unrealizedGains / investment.totalInvested) * 100 : 0;

  return (
    <div className="p-0">
      <div className="p-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center">
            <Link to="/investments" className="mr-4">
              <Button variant="tertiary" size="sm">
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Back
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 flex items-center">
                {investment.coinThumb && (
                  <img 
                    src={investment.coinThumb} 
                    alt={investment.name} 
                    className="w-8 h-8 mr-3 rounded-full"
                  />
                )}
                {investment.name}
                {investment.coinSymbol && (
                  <span className="ml-2 text-lg text-gray-500 dark:text-gray-400">
                    ({investment.coinSymbol})
                  </span>
                )}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">{investment.category}</p>
            </div>
          </div>
          
          <div className="mt-4 sm:mt-0 flex items-center space-x-3">
            <Button
              variant="tertiary"
              size="sm"
              onClick={handleDeleteInvestment}
              className="text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20"
            >
              Delete Investment
            </Button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-6">
        {/* Performance Overview */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Invested</div>
            <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {formatCurrency(investment.totalInvested)}
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Current Value</div>
            <div className="text-2xl font-bold text-sky-600 dark:text-sky-400">
              {formatCurrency(investment.currentMarketValue)}
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Unrealized Gain</div>
            <div className={`text-2xl font-bold ${getReturnColorClass(returnValue)}`}>
              {formatCurrency(returnValue)}
            </div>
          </Card>
          
          <Card className="p-4">
            <div className="text-sm font-medium text-gray-500 dark:text-gray-400">Return</div>
            <div className={`text-2xl font-bold ${getReturnColorClass(returnValue)}`}>
              {formatPercentage(returnPercentage)}
            </div>
          </Card>
        </div>

        {/* Cryptocurrency Specific Info */}
        {investment.category === 'Cryptocurrency' && (
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Cryptocurrency Details</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Total Tokens</div>
                <div className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {formatTokenAmount(investment.totalTokens, 4)} {investment.coinSymbol}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Current Price (USD)</div>
                <div className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {formatCurrency(investment.currentPriceUSD)}
                </div>
              </div>
              <div>
                <div className="text-sm text-gray-500 dark:text-gray-400">Last Updated</div>
                <div className="text-lg font-medium text-gray-900 dark:text-gray-100">
                  {investment.lastPriceUpdate 
                    ? new Date(investment.lastPriceUpdate).toLocaleString()
                    : 'Never'
                  }
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Purchase History */}
        {investment.purchases && investment.purchases.length > 0 && (
          <Card>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Purchase History</h3>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Amount Invested
                    </th>
                    {investment.category === 'Cryptocurrency' && (
                      <>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Tokens Acquired
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                          Price per Token
                        </th>
                      </>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Current Value
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Gain/Loss
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {investment.purchases.map((purchase) => {
                    const currentPrice = investment.currentPriceUSD;
                    const currentValue = investment.category === 'Cryptocurrency' 
                      ? purchase.tokensAcquired * currentPrice
                      : investment.currentMarketValue / investment.purchases.length; // Simple division for non-crypto
                    const gainLoss = currentValue - purchase.amountInvested;
                    const gainLossPercentage = purchase.amountInvested > 0 ? (gainLoss / purchase.amountInvested) * 100 : 0;
                    
                    return (
                      <tr key={purchase.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {new Date(purchase.investmentDate).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {formatCurrency(purchase.amountInvested)}
                        </td>
                        {investment.category === 'Cryptocurrency' && (
                          <>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                              {formatTokenAmount(purchase.tokensAcquired, 6)} {investment.coinSymbol}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                              {formatCurrency(purchase.pricePerTokenUSD)}
                            </td>
                          </>
                        )}
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100">
                          {formatCurrency(currentValue)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                          <div className={getReturnColorClass(gainLoss)}>
                            <div>{formatCurrency(gainLoss)}</div>
                            <div className="text-xs">({formatPercentage(gainLossPercentage)})</div>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {/* Investment Timeline */}
        <Card>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">Investment Timeline</h3>
          <div className="space-y-3">
            <div className="flex items-center text-sm">
              <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
              <div className="text-gray-600 dark:text-gray-400">
                Investment created: {new Date(investment.createdAt).toLocaleString()}
              </div>
            </div>
            {investment.purchases && investment.purchases.map((purchase, index) => (
              <div key={purchase.id} className="flex items-center text-sm">
                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                <div className="text-gray-600 dark:text-gray-400">
                  Purchase #{index + 1}: {formatCurrency(purchase.amountInvested)} on {new Date(purchase.investmentDate).toLocaleDateString()}
                </div>
              </div>
            ))}
            {investment.lastPriceUpdate && (
              <div className="flex items-center text-sm">
                <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                <div className="text-gray-600 dark:text-gray-400">
                  Last price update: {new Date(investment.lastPriceUpdate).toLocaleString()}
                </div>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default InvestmentDetails; 