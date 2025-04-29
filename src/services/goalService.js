/**
 * Goal Service for managing financial goals
 */
import { v4 as uuidv4 } from 'uuid';
import { KEYS, getData, saveData } from './storageService';
import { getAllTransactions } from './transactionService';

/**
 * Get all financial goals
 * @returns {Array} All goals
 */
const getAllGoals = () => {
  return getData(KEYS.GOALS, []);
};

/**
 * Add a new financial goal
 * @param {Object} goal - Goal data
 * @returns {Object} Added goal with ID
 */
const addGoal = (goal) => {
  const goals = getAllGoals();
  const newGoal = {
    id: uuidv4(),
    createdAt: new Date().toISOString(),
    progress: 0,
    currentAmount: 0,
    ...goal
  };
  
  goals.push(newGoal);
  saveData(KEYS.GOALS, goals);
  
  return newGoal;
};

/**
 * Update an existing goal
 * @param {string} id - Goal ID to update
 * @param {Object} updatedData - New goal data
 * @returns {Object|null} Updated goal or null if not found
 */
const updateGoal = (id, updatedData) => {
  const goals = getAllGoals();
  const index = goals.findIndex(g => g.id === id);
  
  if (index === -1) return null;
  
  goals[index] = { 
    ...goals[index], 
    ...updatedData,
    updatedAt: new Date().toISOString()
  };
  
  saveData(KEYS.GOALS, goals);
  return goals[index];
};

/**
 * Delete a goal
 * @param {string} id - Goal ID to delete
 * @returns {boolean} Success status
 */
const deleteGoal = (id) => {
  const goals = getAllGoals();
  const filteredGoals = goals.filter(g => g.id !== id);
  
  if (filteredGoals.length === goals.length) {
    return false;
  }
  
  saveData(KEYS.GOALS, filteredGoals);
  return true;
};

/**
 * Update goal progress
 * @param {string} id - Goal ID
 * @param {number} amount - Amount to add to current amount
 * @returns {Object|null} Updated goal or null if not found
 */
const updateGoalProgress = (id, amount) => {
  const goals = getAllGoals();
  const index = goals.findIndex(g => g.id === id);
  
  if (index === -1) return null;
  
  const goal = goals[index];
  const newCurrentAmount = goal.currentAmount + Number(amount);
  const newProgress = Math.min(100, Math.round((newCurrentAmount / goal.targetAmount) * 100));
  
  goals[index] = {
    ...goal,
    currentAmount: newCurrentAmount,
    progress: newProgress,
    updatedAt: new Date().toISOString()
  };
  
  saveData(KEYS.GOALS, goals);
  return goals[index];
};

/**
 * Calculate goal statistics
 * @returns {Object} Statistics about goals
 */
const getGoalStatistics = () => {
  const goals = getAllGoals();
  
  return {
    total: goals.length,
    completed: goals.filter(g => g.progress >= 100).length,
    inProgress: goals.filter(g => g.progress > 0 && g.progress < 100).length,
    notStarted: goals.filter(g => g.progress === 0).length,
    averageProgress: goals.length 
      ? goals.reduce((sum, g) => sum + g.progress, 0) / goals.length 
      : 0
  };
};

export {
  getAllGoals,
  addGoal,
  updateGoal,
  deleteGoal,
  updateGoalProgress,
  getGoalStatistics
}; 