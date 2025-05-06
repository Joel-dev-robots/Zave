import { useState, useEffect } from 'react';
import CryptoSearch from './CryptoSearch';

const InvestmentForm = ({
  onSubmit,
  initialValues = {
    name: '',
    initialAmount: '',
    description: '',
    category: '',
    expectedReturn: '',
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
    }
    
    if (formData.expectedReturn && (isNaN(formData.expectedReturn) || Number(formData.expectedReturn) < 0)) {
      newErrors.expectedReturn = 'Expected return must be a positive number or zero';
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
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validate()) {
      // Format data before submission
      const finalData = {
        ...formData,
        initialAmount: Number(formData.initialAmount),
        expectedReturn: formData.expectedReturn ? Number(formData.expectedReturn) : 0
      };
      
      onSubmit(finalData);
    }
  };
  
  // Activar/desactivar buscador de cripto cuando la categoría cambie
  useEffect(() => {
    setShowCryptoSearch(formData.category === 'Cryptocurrency');
  }, [formData.category]);
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
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
          <option value="Stocks">Stocks</option>
          <option value="Bonds">Bonds</option>
          <option value="Real Estate">Real Estate</option>
          <option value="Cryptocurrency">Cryptocurrency</option>
          <option value="ETF">ETF</option>
          <option value="Mutual Funds">Mutual Funds</option>
          <option value="Other">Other</option>
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
            <span className="text-gray-500 dark:text-gray-400 sm:text-sm">€</span>
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
        <label htmlFor="expectedReturn" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Expected Annual Return (%)
        </label>
        <div className="relative rounded-md shadow-sm">
          <input
            type="number"
            name="expectedReturn"
            id="expectedReturn"
            min="0"
            step="0.1"
            value={formData.expectedReturn}
            onChange={handleChange}
            className={`focus:ring-indigo-500 focus:border-indigo-500 block w-full pr-8 sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
              errors.expectedReturn ? 'border-red-300 dark:border-red-500' : ''
            }`}
            placeholder="0.0"
          />
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-500 dark:text-gray-400 sm:text-sm">%</span>
          </div>
        </div>
        {errors.expectedReturn && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.expectedReturn}</p>}
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
          className={`focus:ring-indigo-500 focus:border-indigo-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
            errors.date ? 'border-red-300 dark:border-red-500' : ''
          }`}
        />
        {errors.date && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.date}</p>}
      </div>
      
      <div className="pt-2">
        <button
          type="submit"
          className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:bg-indigo-700 dark:hover:bg-indigo-800 dark:focus:ring-offset-gray-800"
        >
          {buttonText}
        </button>
      </div>
    </form>
  );
};

export default InvestmentForm; 