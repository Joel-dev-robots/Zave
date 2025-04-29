import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  addInvestment,
  updateInvestment,
  deleteInvestment,
  updateInvestmentValue,
  getAllInvestments,
  getInvestmentStatistics
} from '../../services/investmentService';
import InvestmentForm from '../shared/InvestmentForm';

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
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Investment Portfolio</h1>
        <div className="text-sm text-slate-500">
          {format(new Date(), 'MMMM dd, yyyy')}
        </div>
      </div>
      
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg shadow bg-indigo-50">
          <div className="text-sm font-medium text-slate-500">Total Invested</div>
          <div className="text-2xl font-bold text-indigo-600">
            €{stats.totalInvested?.toFixed(2) || '0.00'}
          </div>
        </div>
        
        <div className="p-4 rounded-lg shadow bg-sky-50">
          <div className="text-sm font-medium text-slate-500">Current Value</div>
          <div className="text-2xl font-bold text-sky-600">
            €{stats.totalCurrent?.toFixed(2) || '0.00'}
          </div>
        </div>
        
        <div className={`p-4 rounded-lg shadow ${
          stats.totalReturns > 0 ? 'bg-green-50' : stats.totalReturns < 0 ? 'bg-red-50' : 'bg-gray-50'
        }`}>
          <div className="text-sm font-medium text-slate-500">Total Returns</div>
          <div className={`text-2xl font-bold ${
            stats.totalReturns > 0 ? 'text-green-600' : stats.totalReturns < 0 ? 'text-red-600' : 'text-gray-600'
          }`}>
            {stats.totalReturns > 0 ? '+' : ''}
            €{stats.totalReturns?.toFixed(2) || '0.00'}
          </div>
        </div>
        
        <div className={`p-4 rounded-lg shadow ${
          stats.averageReturn > 0 ? 'bg-green-50' : stats.averageReturn < 0 ? 'bg-red-50' : 'bg-gray-50'
        }`}>
          <div className="text-sm font-medium text-slate-500">Avg. Return</div>
          <div className={`text-2xl font-bold ${
            stats.averageReturn > 0 ? 'text-green-600' : stats.averageReturn < 0 ? 'text-red-600' : 'text-gray-600'
          }`}>
            {stats.averageReturn > 0 ? '+' : ''}
            {stats.averageReturn?.toFixed(2) || '0.00'}%
          </div>
        </div>
      </div>
      
      {/* Add Investment Button or Form */}
      {!showForm ? (
        <button
          type="button"
          onClick={() => {
            setSelectedInvestment(null);
            setShowForm(true);
          }}
          className="w-full flex justify-center py-2 px-4 border border-transparent shadow-sm 
                     text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          + Add New Investment
        </button>
      ) : (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-slate-700">
              {selectedInvestment ? 'Edit Investment' : 'Add New Investment'}
            </h2>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setSelectedInvestment(null);
              }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
          
          <InvestmentForm
            initialValues={selectedInvestment || {}}
            onSubmit={selectedInvestment ? handleUpdateInvestment : handleAddInvestment}
            buttonText={selectedInvestment ? 'Update Investment' : 'Add Investment'}
          />
        </div>
      )}
      
      {/* Update Investment Value Form */}
      {showUpdateValueForm && selectedInvestment && (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-slate-700">
              Update Current Value: {selectedInvestment.name}
            </h2>
            <button
              type="button"
              onClick={() => {
                setShowUpdateValueForm(false);
                setSelectedInvestment(null);
                setNewValue('');
                setValueError('');
              }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
          
          <form onSubmit={handleUpdateValueSubmit} className="space-y-4">
            <div>
              <label htmlFor="newValue" className="block text-sm font-medium text-gray-700 mb-1">
                Current Market Value
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">€</span>
                </div>
                <input
                  type="number"
                  name="newValue"
                  id="newValue"
                  min="0"
                  step="0.01"
                  value={newValue}
                  onChange={(e) => {
                    setNewValue(e.target.value);
                    setValueError('');
                  }}
                  className={`focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md ${
                    valueError ? 'border-red-300' : ''
                  }`}
                  placeholder="0.00"
                />
              </div>
              {valueError && <p className="mt-1 text-sm text-red-600">{valueError}</p>}
              
              <div className="mt-2 text-sm text-gray-500">
                <div className="flex justify-between">
                  <span>Initial Investment:</span>
                  <span>€{selectedInvestment.initialAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Value:</span>
                  <span>€{selectedInvestment.currentValue.toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div className="pt-2">
              <button
                type="submit"
                className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Update Value
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Investment List */}
      <div>
        <h2 className="text-lg font-semibold text-slate-700 mb-4">Your Investments</h2>
        {investments.length > 0 ? (
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Investment
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Initial Amount
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Current Value
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Return
                    </th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date
                    </th>
                    <th scope="col" className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {investments.map((investment) => (
                    <tr key={investment.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{investment.name}</div>
                        <div className="text-sm text-gray-500">{investment.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">€{investment.initialAmount.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">€{investment.currentValue.toFixed(2)}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className={`text-sm font-semibold ${
                          investment.returns > 0 
                            ? 'text-green-600' 
                            : investment.returns < 0 
                              ? 'text-red-600' 
                              : 'text-gray-600'
                        }`}>
                          {investment.returns > 0 ? '+' : ''}
                          €{investment.returns.toFixed(2)} ({investment.returnsPercentage.toFixed(2)}%)
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">
                          {format(new Date(investment.date), 'MMM dd, yyyy')}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleUpdateValueClick(investment)}
                          className="text-indigo-600 hover:text-indigo-900 mr-4"
                        >
                          Update Value
                        </button>
                        <button
                          onClick={() => handleEditClick(investment)}
                          className="text-blue-600 hover:text-blue-900 mr-4"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => handleDeleteInvestment(investment.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 bg-white rounded-lg shadow">
            No investments yet. Add your first investment!
          </div>
        )}
      </div>
    </div>
  );
};

export default Investments; 