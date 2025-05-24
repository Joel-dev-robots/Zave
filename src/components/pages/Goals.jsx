import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import {
  addGoal,
  updateGoal,
  deleteGoal,
  updateGoalProgress,
  getAllGoals,
  getGoalStatistics
} from '../../services/goalService';
import GoalForm from '../shared/GoalForm';
import Button from '../atoms/Button';
import Card from '../atoms/Card';

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
    
    return 'Upcoming';
  };
  
  return (
    <div className="p-0">
      <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 p-6 border-b border-gray-200 dark:border-gray-700">Financial Goals</h1>
      
      <div className="p-6 space-y-6">
        <div className="flex justify-between items-center mb-6">
          <Button 
            variant="primary"
            className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800 ml-auto" 
            onClick={() => {
              setSelectedGoal(null);
              setShowForm(!showForm);
              if (showAddProgressForm) setShowAddProgressForm(false);
            }}
          >
            {showForm ? 'Cancel' : 'New Goal'}
          </Button>
        </div>
        
        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-lg shadow bg-amber-50 dark:bg-amber-900/30">
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Goals</div>
            <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">{stats.total || 0}</div>
          </div>
          
          <div className="p-4 rounded-lg shadow bg-green-50 dark:bg-green-900/30">
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Completed</div>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">{stats.completed || 0}</div>
          </div>
          
          <div className="p-4 rounded-lg shadow bg-blue-50 dark:bg-blue-900/30">
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400">In Progress</div>
            <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{stats.inProgress || 0}</div>
          </div>
          
          <div className="p-4 rounded-lg shadow bg-purple-50 dark:bg-purple-900/30">
            <div className="text-sm font-medium text-slate-500 dark:text-slate-400">Avg. Progress</div>
            <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
              {stats.averageProgress ? stats.averageProgress.toFixed(1) : 0}%
            </div>
          </div>
        </div>
        
        {/* Add Goal Form */}
        {showForm && (
          <Card>
            <h2 className="text-xl font-semibold mb-4 text-slate-700 dark:text-slate-200">
              {selectedGoal ? 'Edit Goal' : 'Add New Goal'}
            </h2>
            
            <GoalForm
              initialValues={selectedGoal || {}}
              onSubmit={selectedGoal ? handleUpdateGoal : handleAddGoal}
              buttonText={selectedGoal ? 'Update Goal' : 'Add Goal'}
            />
          </Card>
        )}
        
        {/* Add Progress Form */}
        {showAddProgressForm && selectedGoal && (
          <Card>
            <h2 className="text-xl font-semibold mb-4 text-slate-700 dark:text-slate-200">
              Add Progress: {selectedGoal.name}
            </h2>
            
            <form onSubmit={handleProgressSubmit} className="space-y-4">
              <div>
                <label htmlFor="progressAmount" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount to Add
                </label>
                <div className="relative rounded-md shadow-sm">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <span className="text-gray-500 dark:text-gray-400 sm:text-sm">€</span>
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
                    className={`focus:ring-purple-500 focus:border-purple-500 block w-full pl-7 pr-12 sm:text-sm border-gray-300 rounded-md dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    progressError ? 'border-red-300 dark:border-red-500' : ''
                  }`}
                    placeholder="0.00"
                  />
                </div>
                {progressError && <p className="mt-1 text-sm text-red-600 dark:text-red-400">{progressError}</p>}
                
                <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
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
                <Button
                  type="submit"
                  variant="primary"
                  className="w-full bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800"
                >
                  Add Progress
                </Button>
              </div>
            </form>
          </Card>
        )}
        
        {/* Goals List */}
        <div>
          <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-200 mb-4">Your Goals</h2>
          
          {goals.length === 0 ? (
            <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow text-center">
              <p className="text-gray-500 dark:text-gray-400">No goals yet. Create your first financial goal!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {goals.map((goal) => {
                const isComplete = goal.progress >= 100;
                const timeLeft = getDeadlineStatus(goal.deadline);
                const isOverdue = timeLeft === 'Overdue' && !isComplete;
                
                return (
                  <Card key={goal.id} className={`hover:shadow-md transition-shadow ${
                    isComplete ? 'bg-green-50 dark:bg-green-900/20' : isOverdue ? 'bg-red-50 dark:bg-red-900/20' : ''
                  }`}>
                    <div className="flex flex-col space-y-4">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-3">
                        <div>
                          <h3 className="text-lg font-medium text-gray-900 dark:text-gray-200">{goal.name}</h3>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                            Status: 
                            <span className={`ml-1 ${
                              isComplete ? 'text-green-500' : isOverdue ? 'text-red-500 font-semibold' : 'text-blue-500'
                            }`}>
                              {isComplete ? 'Completed' : isOverdue ? 'Overdue' : 'In Progress'}
                            </span>
                          </p>
                        </div>
                        <div className="mt-2 md:mt-0 flex md:flex-col md:items-end">
                          <span className="text-sm text-gray-500 dark:text-gray-400 md:mb-1">Target:</span>
                          <span className="ml-2 md:ml-0 text-sm font-medium dark:text-gray-300">€{goal.targetAmount.toFixed(2)}</span>
                        </div>
                      </div>
                      
                      {goal.description && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{goal.description}</p>
                      )}
                      
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between">
                        <div className="mb-4 md:mb-0 w-full md:w-2/3">
                          <div className="flex justify-between mb-1">
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              Progress: {goal.progress}%
                            </span>
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                              €{goal.currentAmount.toFixed(2)} / €{goal.targetAmount.toFixed(2)}
                            </span>
                          </div>
                          <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200 dark:bg-gray-700">
                            <div 
                              style={{ width: `${goal.progress}%` }} 
                              className={`rounded ${
                                goal.progress >= 100 
                                  ? 'bg-green-500 dark:bg-green-600' 
                                  : 'bg-blue-500 dark:bg-blue-600'
                              }`}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="flex space-x-2">
                          {!isComplete && (
                            <Button
                              variant="primary"
                              className="bg-purple-600 hover:bg-purple-700 dark:bg-purple-700 dark:hover:bg-purple-800"
                              onClick={() => handleAddProgressClick(goal)}
                              size="sm"
                            >
                              Add Progress
                            </Button>
                          )}
                          <Button
                            variant="secondary"
                            onClick={() => handleEditClick(goal)}
                            size="sm"
                          >
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() => handleDeleteGoal(goal.id)}
                            size="sm"
                          >
                            Delete
                          </Button>
                        </div>
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

export default Goals; 