import { useState, useEffect } from 'react';
import {
  addInvestment,
  updateInvestment,
  deleteInvestment,
  updateInvestmentValue,
  getAllInvestments,
  getInvestmentStatistics
} from '../../services/investmentService';
import InvestmentForm from '../shared/InvestmentForm';
import Button from '../atoms/Button';
import Card from '../atoms/Card';

const Investments = () => {
  const [investments, setInvestments] = useState([]);
  const [stats, setStats] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [showUpdateValueForm, setShowUpdateValueForm] = useState(false);
  const [selectedInvestment, setSelectedInvestment] = useState(null);
  const [newValue, setNewValue] = useState('');
  const [valueError, setValueError] = useState('');
  
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
  
  const handleAddInvestment = (investment) => {
    addInvestment(investment);
    loadInvestments();
    setShowForm(false);
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
    setShowUpdateValueForm(true);
  };
  
  const handleUpdateValueSubmit = (e) => {
    e.preventDefault();
    
    if (!newValue || isNaN(newValue) || Number(newValue) < 0) {
      setValueError('Please enter a valid amount');
      return;
    }
    
    if (selectedInvestment) {
      updateInvestmentValue(selectedInvestment.id, Number(newValue));
      loadInvestments();
      setSelectedInvestment(null);
      setShowUpdateValueForm(false);
      setNewValue('');
      setValueError('');
    }
  };
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Investment Portfolio</h1>
        <div className="flex items-center justify-between mt-4 md:mt-0">
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
      </div>
      
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg shadow bg-indigo-50 dark:bg-indigo-900/30">
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Invested</div>
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            €{stats.totalInvested?.toFixed(2) || '0.00'}
          </div>
        </div>
        
        <div className="p-4 rounded-lg shadow bg-sky-50 dark:bg-sky-900/30">
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Current Value</div>
          <div className="text-2xl font-bold text-sky-600 dark:text-sky-400">
            €{stats.totalCurrent?.toFixed(2) || '0.00'}
          </div>
        </div>
        
        <div className={`p-4 rounded-lg shadow ${
          stats.totalReturns > 0 ? 'bg-green-50 dark:bg-green-900/30' : stats.totalReturns < 0 ? 'bg-red-50 dark:bg-red-900/30' : 'bg-gray-50 dark:bg-gray-800'
        }`}>
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Returns</div>
          <div className={`text-2xl font-bold ${
            stats.totalReturns > 0 
              ? 'text-green-600 dark:text-green-400' 
              : stats.totalReturns < 0 
                ? 'text-red-600 dark:text-red-400' 
                : 'text-gray-600 dark:text-gray-400'
          }`}>
            {stats.totalReturns > 0 ? '+' : ''}
            €{stats.totalReturns?.toFixed(2) || '0.00'}
          </div>
        </div>
        
        <div className={`p-4 rounded-lg shadow ${
          stats.averageReturn > 0 ? 'bg-green-50 dark:bg-green-900/30' : stats.averageReturn < 0 ? 'bg-red-50 dark:bg-red-900/30' : 'bg-gray-50 dark:bg-gray-800'
        }`}>
          <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Avg. Return</div>
          <div className={`text-2xl font-bold ${
            stats.averageReturn > 0 
              ? 'text-green-600 dark:text-green-400' 
              : stats.averageReturn < 0 
                ? 'text-red-600 dark:text-red-400' 
                : 'text-gray-600 dark:text-gray-400'
          }`}>
            {stats.averageReturn > 0 ? '+' : ''}
            {stats.averageReturn?.toFixed(2) || '0.00'}%
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
      
      {/* Update Investment Value Form */}
      {showUpdateValueForm && selectedInvestment && (
        <Card>
          <h2 className="text-xl font-semibold mb-4 text-slate-700 dark:text-slate-200">
            Update Current Value: {selectedInvestment.name}
          </h2>
          
          <form onSubmit={handleUpdateValueSubmit} className="space-y-4">
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
              
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                <div className="flex justify-between">
                  <span>Initial Investment:</span>
                  <span>€{selectedInvestment.initialInvestment.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Previous Value:</span>
                  <span>€{selectedInvestment.currentValue.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Return:</span>
                  <span className={
                    selectedInvestment.returnPercentage > 0 ? 'text-green-600 dark:text-green-400' : 
                    selectedInvestment.returnPercentage < 0 ? 'text-red-600 dark:text-red-400' : ''
                  }>
                    {selectedInvestment.returnPercentage > 0 ? '+' : ''}
                    {selectedInvestment.returnPercentage.toFixed(2)}%
                  </span>
                </div>
              </div>
            </div>
            
            <div className="pt-2">
              <Button
                type="submit"
                variant="primary"
                className="w-full bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800"
              >
                Update Value
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
                             
              return (
                <Card key={investment.id} className="hover:shadow-md transition-shadow">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                    <div className="mb-4 md:mb-0">
                      <h3 className="text-lg font-medium text-gray-800 dark:text-gray-200">{investment.name}</h3>
                      <div className="flex flex-col sm:flex-row sm:items-center mt-1 text-sm text-gray-600 dark:text-gray-400">
                        <span>Type: {investment.type || 'Other'}</span>
                        <span className="hidden sm:block mx-2">•</span>
                        <span>Since: {investment.date}</span>
                      </div>
                    </div>
                    
                    <div className="flex flex-col items-end">
                      <div className="flex items-center">
                        <div className="text-right mr-2">
                          <div className="text-sm text-gray-600 dark:text-gray-400">Current Value</div>
                          <div className="text-lg font-semibold text-gray-800 dark:text-gray-200">
                            €{investment.currentValue.toFixed(2)}
                          </div>
                        </div>
                        <div className={`px-3 py-2 rounded-lg ${bgColor}`}>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Return</div>
                          <div className={`text-sm font-bold ${returnColor}`}>
                            {isPositive ? '+' : ''}
                            {investment.returnPercentage.toFixed(2)}%
                          </div>
                        </div>
                      </div>
                      <div className="flex space-x-2 mt-3">
                        <Button
                          variant="tertiary"
                          size="sm"
                          onClick={() => handleUpdateValueClick(investment)}
                          className="text-indigo-800 bg-indigo-100 hover:bg-indigo-200 dark:text-indigo-200 dark:bg-indigo-900/40 dark:hover:bg-indigo-800/60"
                        >
                          Update Value
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
                    </div>
                  </div>
                  
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Initial Investment</div>
                        <div className="text-sm font-medium text-gray-800 dark:text-gray-200">
                          €{investment.initialInvestment.toFixed(2)}
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-gray-500 dark:text-gray-400">Profit/Loss</div>
                        <div className={`text-sm font-medium ${returnColor}`}>
                          {isPositive ? '+' : ''}
                          €{(investment.currentValue - investment.initialInvestment).toFixed(2)}
                        </div>
                      </div>
                      {investment.dividends !== undefined && (
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Dividends</div>
                          <div className="text-sm font-medium text-green-600 dark:text-green-400">
                            {investment.dividends > 0 ? '+' : ''}
                            €{investment.dividends.toFixed(2)}
                          </div>
                        </div>
                      )}
                      {investment.fees !== undefined && (
                        <div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">Fees</div>
                          <div className="text-sm font-medium text-red-600 dark:text-red-400">
                            -€{investment.fees.toFixed(2)}
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
  );
};

export default Investments; 