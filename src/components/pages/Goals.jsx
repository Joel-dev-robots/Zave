import { useState, useEffect } from 'react';
import { format, formatDistanceToNow } from 'date-fns';
import {
  addGoal,
  updateGoal,
  deleteGoal,
  updateGoalProgress,
  getAllGoals,
  getGoalStatistics
} from '../../services/goalService';
import GoalForm from '../shared/GoalForm';

const Goals = () => {
  const [goals, setGoals] = useState([]);
  const [stats, setStats] = useState({});
  const [showForm, setShowForm] = useState(false);
  const [showAddProgressForm, setShowAddProgressForm] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [progressAmount, setProgressAmount] = useState('');
  const [progressError, setProgressError] = useState('');
  
  // Load goal data
  const loadGoals = () => {
    const data = getAllGoals();
    // Sort by progress (completed last) then by deadline
    const sortedData = [...data].sort((a, b) => {
      // First sort by completion status
      if (a.progress >= 100 && b.progress < 100) return 1;
      if (a.progress < 100 && b.progress >= 100) return -1;
      // Then sort by deadline
      return new Date(a.deadline) - new Date(b.deadline);
    });
    setGoals(sortedData);
    setStats(getGoalStatistics());
  };
  
  useEffect(() => {
    loadGoals();
  }, []);
  
  const handleAddGoal = (goal) => {
    addGoal(goal);
    loadGoals();
    setShowForm(false);
  };
  
  const handleUpdateGoal = (goal) => {
    if (selectedGoal) {
      updateGoal(selectedGoal.id, goal);
      loadGoals();
      setSelectedGoal(null);
      setShowForm(false);
    }
  };
  
  const handleDeleteGoal = (id) => {
    if (window.confirm('Are you sure you want to delete this goal?')) {
      deleteGoal(id);
      loadGoals();
    }
  };
  
  const handleEditClick = (goal) => {
    setSelectedGoal(goal);
    setShowForm(true);
  };
  
  const handleAddProgressClick = (goal) => {
    setSelectedGoal(goal);
    setProgressAmount('');
    setProgressError('');
    setShowAddProgressForm(true);
  };
  
  const handleProgressSubmit = (e) => {
    e.preventDefault();
    
    if (!progressAmount || isNaN(progressAmount) || Number(progressAmount) <= 0) {
      setProgressError('Please enter a valid amount');
      return;
    }
    
    if (selectedGoal) {
      updateGoalProgress(selectedGoal.id, Number(progressAmount));
      loadGoals();
      setSelectedGoal(null);
      setShowAddProgressForm(false);
      setProgressAmount('');
      setProgressError('');
    }
  };
  
  const calculateRemainingAmount = (goal) => {
    return Math.max(0, goal.targetAmount - goal.currentAmount);
  };
  
  const getDeadlineStatus = (deadline) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    
    if (deadlineDate < today) {
      return 'Overdue';
    }
    
    return formatDistanceToNow(deadlineDate, { addSuffix: true });
  };
  
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-slate-800">Financial Goals</h1>
        <div className="text-sm text-slate-500">
          {format(new Date(), 'MMMM dd, yyyy')}
        </div>
      </div>
      
      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-lg shadow bg-amber-50">
          <div className="text-sm font-medium text-slate-500">Total Goals</div>
          <div className="text-2xl font-bold text-amber-600">{stats.total || 0}</div>
        </div>
        
        <div className="p-4 rounded-lg shadow bg-green-50">
          <div className="text-sm font-medium text-slate-500">Completed</div>
          <div className="text-2xl font-bold text-green-600">{stats.completed || 0}</div>
        </div>
        
        <div className="p-4 rounded-lg shadow bg-blue-50">
          <div className="text-sm font-medium text-slate-500">In Progress</div>
          <div className="text-2xl font-bold text-blue-600">{stats.inProgress || 0}</div>
        </div>
        
        <div className="p-4 rounded-lg shadow bg-purple-50">
          <div className="text-sm font-medium text-slate-500">Avg. Progress</div>
          <div className="text-2xl font-bold text-purple-600">
            {stats.averageProgress ? stats.averageProgress.toFixed(1) : 0}%
          </div>
        </div>
      </div>
      
      {/* Add Goal Button or Form */}
      {!showForm ? (
        <button
          type="button"
          onClick={() => {
            setSelectedGoal(null);
            setShowForm(true);
          }}
          className="w-full flex justify-center py-2 px-4 border border-transparent shadow-sm 
                     text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 
                     focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
        >
          + Add New Goal
        </button>
      ) : (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-slate-700">
              {selectedGoal ? 'Edit Goal' : 'Add New Goal'}
            </h2>
            <button
              type="button"
              onClick={() => {
                setShowForm(false);
                setSelectedGoal(null);
              }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
          
          <GoalForm
            initialValues={selectedGoal || {}}
            onSubmit={selectedGoal ? handleUpdateGoal : handleAddGoal}
            buttonText={selectedGoal ? 'Update Goal' : 'Add Goal'}
          />
        </div>
      )}
      
      {/* Add Progress Form */}
      {showAddProgressForm && selectedGoal && (
        <div className="bg-white p-4 rounded-lg shadow">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-slate-700">
              Add Progress: {selectedGoal.name}
            </h2>
            <button
              type="button"
              onClick={() => {
                setShowAddProgressForm(false);
                setSelectedGoal(null);
                setProgressAmount('');
                setProgressError('');
              }}
              className="text-sm text-gray-500 hover:text-gray-700"
            >
              Cancel
            </button>
          </div>
          
          <form onSubmit={handleProgressSubmit} className="space-y-4">
            <div>
              <label htmlFor="progressAmount" className="block text-sm font-medium text-gray-700 mb-1">
                Amount to Add
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">€</span>
                </div>
                <input
                  type="number"
                  name="progressAmount"
                  id="progressAmount"
                  min="0"
                  step="0.01"
                  value={progressAmount}
                  onChange={(e) => {
                    setProgressAmount(e.target.value);
                    setProgressError('');
                  }}
                  className={`focus:ring-purple-500 focus:border-purple-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md ${
                    progressError ? 'border-red-300' : ''
                  }`}
                  placeholder="0.00"
                />
              </div>
              {progressError && <p className="mt-1 text-sm text-red-600">{progressError}</p>}
              
              <div className="mt-2 text-sm text-gray-500">
                <div className="flex justify-between">
                  <span>Target Amount:</span>
                  <span>€{selectedGoal.targetAmount.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Current Progress:</span>
                  <span>€{selectedGoal.currentAmount.toFixed(2)} ({selectedGoal.progress}%)</span>
                </div>
                <div className="flex justify-between">
                  <span>Remaining:</span>
                  <span>€{calculateRemainingAmount(selectedGoal).toFixed(2)}</span>
                </div>
              </div>
            </div>
            
            <div className="pt-2">
              <button
                type="submit"
                className="w-full inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Add Progress
              </button>
            </div>
          </form>
        </div>
      )}
      
      {/* Goals List */}
      <div>
        <h2 className="text-lg font-semibold text-slate-700 mb-4">Your Goals</h2>
        {goals.length > 0 ? (
          <div className="space-y-4">
            {goals.map((goal) => (
              <div 
                key={goal.id} 
                className={`bg-white p-4 rounded-lg shadow ${
                  goal.progress >= 100 ? 'border-2 border-green-400' : ''
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">{goal.name}</h3>
                    <p className="text-sm text-gray-500 mt-1">
                      Deadline: 
                      <span className={`ml-1 ${
                        new Date(goal.deadline) < new Date() && goal.progress < 100 
                          ? 'text-red-500 font-semibold' 
                          : ''
                      }`}>
                        {format(new Date(goal.deadline), 'MMM dd, yyyy')}
                        {' '}
                        ({getDeadlineStatus(goal.deadline)})
                      </span>
                    </p>
                  </div>
                  <div className="mt-2 md:mt-0 flex md:flex-col md:items-end">
                    <span className="text-sm text-gray-500 md:mb-1">Target:</span>
                    <span className="ml-2 md:ml-0 text-sm font-medium">€{goal.targetAmount.toFixed(2)}</span>
                  </div>
                </div>
                
                {goal.description && (
                  <p className="text-sm text-gray-600 mb-3">{goal.description}</p>
                )}
                
                <div className="mb-2">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>{goal.progress}% completed</span>
                    <span>€{goal.currentAmount.toFixed(2)} of €{goal.targetAmount.toFixed(2)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${
                        goal.progress >= 100 
                          ? 'bg-green-600' 
                          : goal.progress > 50 
                            ? 'bg-blue-600' 
                            : 'bg-purple-600'
                      }`}
                      style={{ width: `${Math.min(100, goal.progress)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex space-x-3 mt-4">
                  {goal.progress < 100 && (
                    <button
                      type="button"
                      onClick={() => handleAddProgressClick(goal)}
                      className="py-1 px-3 bg-purple-100 hover:bg-purple-200 text-purple-700 text-sm rounded-md"
                    >
                      Add Progress
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleEditClick(goal)}
                    className="py-1 px-3 bg-blue-100 hover:bg-blue-200 text-blue-700 text-sm rounded-md"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteGoal(goal.id)}
                    className="py-1 px-3 bg-red-100 hover:bg-red-200 text-red-700 text-sm rounded-md"
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-slate-500 bg-white rounded-lg shadow">
            No goals yet. Add your first financial goal!
          </div>
        )}
      </div>
    </div>
  );
};

export default Goals; 