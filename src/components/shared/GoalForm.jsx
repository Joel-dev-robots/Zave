import { useState } from 'react';

const GoalForm = ({
  onSubmit,
  initialValues = {
    name: '',
    targetAmount: '',
    deadline: '',
    description: ''
  },
  buttonText = 'Save Goal'
}) => {
  const [formData, setFormData] = useState(initialValues);
  const [errors, setErrors] = useState({});
  
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
      newErrors.name = 'Goal name is required';
    }
    
    if (!formData.targetAmount || isNaN(formData.targetAmount) || Number(formData.targetAmount) <= 0) {
      newErrors.targetAmount = 'Please enter a valid target amount';
    }
    
    if (!formData.deadline) {
      newErrors.deadline = 'Please enter a deadline';
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const deadlineDate = new Date(formData.deadline);
      
      if (deadlineDate < today) {
        newErrors.deadline = 'Deadline must be in the future';
      }
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
        targetAmount: Number(formData.targetAmount)
      };
      
      onSubmit(finalData);
    }
  };
  
  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
          Goal Name
        </label>
        <input
          type="text"
          name="name"
          id="name"
          value={formData.name}
          onChange={handleChange}
          className={`focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md ${
            errors.name ? 'border-red-300' : ''
          }`}
          placeholder="e.g. Buy a Car, Down Payment, Emergency Fund"
        />
        {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
      </div>
      
      <div>
        <label htmlFor="targetAmount" className="block text-sm font-medium text-gray-700 mb-1">
          Target Amount
        </label>
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">€</span>
          </div>
          <input
            type="number"
            name="targetAmount"
            id="targetAmount"
            min="0"
            step="0.01"
            value={formData.targetAmount}
            onChange={handleChange}
            className={`focus:ring-purple-500 focus:border-purple-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md ${
              errors.targetAmount ? 'border-red-300' : ''
            }`}
            placeholder="0.00"
          />
        </div>
        {errors.targetAmount && <p className="mt-1 text-sm text-red-600">{errors.targetAmount}</p>}
      </div>
      
      <div>
        <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">
          Target Date
        </label>
        <input
          type="date"
          name="deadline"
          id="deadline"
          value={formData.deadline}
          onChange={handleChange}
          className={`focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md ${
            errors.deadline ? 'border-red-300' : ''
          }`}
        />
        {errors.deadline && <p className="mt-1 text-sm text-red-600">{errors.deadline}</p>}
      </div>
      
      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description (Optional)
        </label>
        <textarea
          name="description"
          id="description"
          rows="3"
          value={formData.description}
          onChange={handleChange}
          className="shadow-sm focus:ring-purple-500 focus:border-purple-500 block w-full sm:text-sm border-gray-300 rounded-md"
          placeholder="Additional details about your goal"
        ></textarea>
      </div>
      
      <div className="pt-2">
        <button
          type="submit"
          className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          {buttonText}
        </button>
      </div>
    </form>
  );
};

export default GoalForm; 