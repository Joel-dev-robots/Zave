import { useState, useEffect } from 'react';
import CryptoSearch from './CryptoSearch';

const InvestmentForm = ({
  onSubmit,
  initialValues = {
    name: '',
    initialAmount: '',
    description: '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    coinId: '',
    coinSymbol: '',
    coinThumb: ''
  },
  buttonText = 'Save Investment'
}) => {
  const [formData, setFormData] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [showCryptoSearch, setShowCryptoSearch] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  
  const categories = [
    { value: 'Stocks', label: 'Stocks', emoji: '📈' },
    { value: 'Bonds', label: 'Bonds', emoji: '📊' },
    { value: 'Real Estate', label: 'Real Estate', emoji: '🏠' },
    { value: 'Cryptocurrency', label: 'Cryptocurrency', emoji: '₿' },
    { value: 'ETF', label: 'ETF', emoji: '📑' },
    { value: 'Mutual Funds', label: 'Mutual Funds', emoji: '💼' },
    { value: 'Other', label: 'Other', emoji: '📦' }
  ];
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
    
    // Clear submit error when user makes changes
    if (submitError) {
      setSubmitError(null);
    }
  };
  
  // CoinGecko API limitations for historical data
  const getDateConstraints = () => {
    const today = new Date().toISOString().split('T')[0];
    
    if (formData.category === 'Cryptocurrency') {
      // Limit to 1 year back for cryptocurrency investments
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const earliestDate = oneYearAgo.toISOString().split('T')[0];
      
      return {
        min: earliestDate,
        max: today,
        helpText: 'Cryptocurrency purchases can only be registered within the last year due to API limitations.'
      };
    } else {
      // For non-crypto investments, allow any past date
      return {
        min: '1900-01-01',
        max: today,
        helpText: null
      };
    }
  };
  
  const validate = () => {
    const newErrors = {};
    
    if (!formData.name || formData.name.trim() === '') {
      newErrors.name = 'Investment name is required';
    }
    
    if (!formData.initialAmount || isNaN(formData.initialAmount) || Number(formData.initialAmount) <= 0) {
      newErrors.initialAmount = 'Please enter a valid amount greater than 0';
    }
    
    if (!formData.category || formData.category.trim() === '') {
      newErrors.category = 'Category is required';
    }
    
    if (!formData.date) {
      newErrors.date = 'Please enter a valid date';
    } else {
      // Validate date constraints
      const dateConstraints = getDateConstraints();
      const selectedDate = new Date(formData.date);
      const minDate = new Date(dateConstraints.min);
      const maxDate = new Date(dateConstraints.max);
      
      if (selectedDate > maxDate) {
        newErrors.date = 'Investment date cannot be in the future.';
      } else if (selectedDate < minDate) {
        if (formData.category === 'Cryptocurrency') {
          newErrors.date = 'Cryptocurrency purchases cannot be registered with more than 1 year of historical data due to API limitations.';
        } else {
          newErrors.date = 'Please select a valid date.';
        }
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleCryptoSelect = (coin) => {
    setFormData(prev => ({
      ...prev,
      name: coin.name,
      coinId: coin.id,
      coinSymbol: coin.symbol.toUpperCase(),
      coinThumb: coin.thumb || '',
      category: 'Cryptocurrency'
    }));
    
    // Limpiar errores relacionados
    if (errors.name || errors.category) {
      setErrors(prev => ({
        ...prev,
        name: null,
        category: null
      }));
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitError(null);
    
    if (validate()) {
      setIsSubmitting(true);
      try {
        // Format data before submission
        const finalData = {
          ...formData,
          initialAmount: Number(formData.initialAmount),
          investmentDate: formData.date // Map 'date' field to 'investmentDate'
        };
        
        // Remove the date field to avoid confusion
        delete finalData.date;
        
        console.log('Submitting investment data:', finalData);
        
        await onSubmit(finalData);
      } catch (error) {
        console.error('Error submitting investment:', error);
        setSubmitError(error.message || 'Error al guardar la inversión');
      } finally {
        setIsSubmitting(false);
      }
    }
  };
  
  // Activar/desactivar buscador de cripto cuando la categoría cambie
  useEffect(() => {
    setShowCryptoSearch(formData.category === 'Cryptocurrency');
  }, [formData.category]);
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {submitError && (
        <div className="bg-red-50 dark:bg-red-900/20 p-3 rounded-md text-sm text-red-800 dark:text-red-300">
          {submitError}
        </div>
      )}
      
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Category
        </label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className={`mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
            errors.category ? 'border-red-300 dark:border-red-500' : ''
          }`}
        >
          <option value="">Select a category</option>
          {categories.map(category => (
            <option key={category.value} value={category.value}>
              {category.emoji} {category.label}
            </option>
          ))}
        </select>
        {errors.category && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.category}</p>}
      </div>
      
      {showCryptoSearch ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Search Cryptocurrency
          </label>
          <CryptoSearch onSelect={handleCryptoSelect} />
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
            Search for any cryptocurrency available on CoinGecko
          </p>
        </div>
      ) : (
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Investment Name
          </label>
          <input
            type="text"
            name="name"
            id="name"
            value={formData.name}
            onChange={handleChange}
            className={`focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
              errors.name ? 'border-red-300 dark:border-red-500' : ''
            }`}
            placeholder="e.g. Stock, ETF, Real Estate"
          />
          {errors.name && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.name}</p>}
        </div>
      )}
      
      <div>
        <label htmlFor="initialAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Initial Amount
        </label>
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 dark:text-gray-400 sm:text-sm">$</span>
          </div>
          <input
            type="number"
            name="initialAmount"
            id="initialAmount"
            min="0"
            step="0.01"
            value={formData.initialAmount}
            onChange={handleChange}
            className={`focus:ring-indigo-500 focus:border-indigo-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
              errors.initialAmount ? 'border-red-300 dark:border-red-500' : ''
            }`}
            placeholder="0.00"
          />
        </div>
        {errors.initialAmount && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.initialAmount}</p>}
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description (Optional)
        </label>
        <textarea
          name="description"
          id="description"
          rows="3"
          value={formData.description}
          onChange={handleChange}
          className="shadow-sm focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white"
          placeholder="Additional notes about this investment"
        ></textarea>
      </div>
      
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Investment Date
        </label>
        <input
          type="date"
          name="date"
          id="date"
          value={formData.date}
          onChange={handleChange}
          min={getDateConstraints().min}
          max={getDateConstraints().max}
          className={`focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
            errors.date ? 'border-red-300 dark:border-red-500' : ''
          }`}
        />
        {getDateConstraints().helpText && (
          <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">
            <svg className="inline w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"></path>
            </svg>
            {getDateConstraints().helpText}
          </p>
        )}
        {errors.date && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.date}</p>}
      </div>
      
      <div className="pt-2">
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
            isSubmitting 
              ? 'bg-indigo-400 cursor-not-allowed dark:bg-indigo-600' 
              : 'bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-700 dark:hover:bg-indigo-800'
          } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800`}
        >
          {isSubmitting ? (
            <>
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Guardando...
            </>
          ) : (
            buttonText
          )}
        </button>
      </div>
    </form>
  );
};

export default InvestmentForm; 