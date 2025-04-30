import { useState, useEffect } from 'react';
import { getData, KEYS } from '../../services/storageService';

const TransactionForm = ({ 
  onSubmit, 
  initialValues = {
    type: 'income',
    amount: '',
    category: '',
    description: '',
    date: new Date().toISOString().split('T')[0]
  },
  buttonText = 'Save',
  transactionType = null // if set, locks the type (income/expense)
}) => {
  const [formData, setFormData] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [categories, setCategories] = useState({
    income: [],
    expense: []
  });
  
  useEffect(() => {
    // Get categories from settings
    const settings = getData(KEYS.SETTINGS);
    if (settings?.categories) {
      setCategories(settings.categories);
    }
  }, []);
  
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
    
    if (!formData.amount || isNaN(formData.amount) || Number(formData.amount) <= 0) {
      newErrors.amount = 'Please enter a valid amount greater than 0';
    }
    
    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }
    
    if (!formData.description || formData.description.trim() === '') {
      newErrors.description = 'Please enter a description';
    }
    
    if (!formData.date) {
      newErrors.date = 'Please enter a valid date';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validate()) {
      // Format data before submission
      const finalData = {
        ...formData,
        type: transactionType || formData.type,
        amount: Number(formData.amount)
      };
      
      onSubmit(finalData);
    }
  };
  
  // Determine which category list to use
  const activeCategoryList = transactionType 
    ? categories[transactionType] 
    : categories[formData.type];
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {!transactionType && (
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Type
          </label>
          <div className="flex space-x-4">
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="type"
                value="income"
                checked={formData.type === 'income'}
                onChange={handleChange}
                className="text-blue-600 focus:ring-blue-500 h-4 w-4 dark:bg-gray-700"
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300">Income</span>
            </label>
            <label className="inline-flex items-center">
              <input
                type="radio"
                name="type"
                value="expense"
                checked={formData.type === 'expense'}
                onChange={handleChange}
                className="text-red-600 focus:ring-red-500 h-4 w-4 dark:bg-gray-700"
              />
              <span className="ml-2 text-gray-700 dark:text-gray-300">Expense</span>
            </label>
          </div>
        </div>
      )}
      
      <div>
        <label htmlFor="amount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Amount
        </label>
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 dark:text-gray-400 sm:text-sm">€</span>
          </div>
          <input
            type="number"
            name="amount"
            id="amount"
            min="0"
            step="0.01"
            value={formData.amount}
            onChange={handleChange}
            className={`focus:ring-blue-500 focus:border-blue-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
              errors.amount ? 'border-red-300 dark:border-red-500' : ''
            }`}
            placeholder="0.00"
          />
        </div>
        {errors.amount && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.amount}</p>}
      </div>
      
      <div>
        <label htmlFor="category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Category
        </label>
        <select
          id="category"
          name="category"
          value={formData.category}
          onChange={handleChange}
          className={`mt-1 block w-full py-2 px-3 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
            errors.category ? 'border-red-300 dark:border-red-500' : ''
          }`}
        >
          <option value="">Select a category</option>
          {activeCategoryList?.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
        {errors.category && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.category}</p>}
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Description
        </label>
        <input
          type="text"
          name="description"
          id="description"
          value={formData.description}
          onChange={handleChange}
          className={`focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
            errors.description ? 'border-red-300 dark:border-red-500' : ''
          }`}
          placeholder="Description"
        />
        {errors.description && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.description}</p>}
      </div>
      
      <div>
        <label htmlFor="date" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
          Date
        </label>
        <input
          type="date"
          name="date"
          id="date"
          value={formData.date}
          onChange={handleChange}
          className={`focus:ring-blue-500 focus:border-blue-500 block w-full sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
            errors.date ? 'border-red-300 dark:border-red-500' : ''
          }`}
        />
        {errors.date && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{errors.date}</p>}
      </div>
      
      <div className="pt-2">
        <button
          type="submit"
          className={`w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white ${
            formData.type === 'expense' || transactionType === 'expense'
              ? 'bg-red-600 hover:bg-red-700 focus:ring-red-500 dark:bg-red-700 dark:hover:bg-red-800'
              : 'bg-blue-600 hover:bg-blue-700 focus:ring-blue-500 dark:bg-blue-700 dark:hover:bg-blue-800'
          } focus:outline-none focus:ring-2 focus:ring-offset-2 dark:focus:ring-offset-gray-800`}
        >
          {buttonText}
        </button>
      </div>
    </form>
  );
};

export default TransactionForm; 