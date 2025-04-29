/**
 * Investment Service for managing investments
 */
import { v4 as uuidv4 } from 'uuid';
import { KEYS, getData, saveData } from './storageService';

/**
 * Get all investments
 * @returns {Array} All investments
 */
const getAllInvestments = () => {
  return getData(KEYS.INVESTMENTS, []);
};

/**
 * Add a new investment
 * @param {Object} investment - Investment data
 * @returns {Object} Added investment with ID
 */
const addInvestment = (investment) => {
  const investments = getAllInvestments();
  const newInvestment = {
    id: uuidv4(),
    date: new Date().toISOString(),
    currentValue: investment.initialAmount,
    returns: 0,
    returnsPercentage: 0,
    ...investment
  };
  
  investments.push(newInvestment);
  saveData(KEYS.INVESTMENTS, investments);
  
  return newInvestment;
};

/**
 * Update an existing investment
 * @param {string} id - Investment ID to update
 * @param {Object} updatedData - New investment data
 * @returns {Object|null} Updated investment or null if not found
 */
const updateInvestment = (id, updatedData) => {
  const investments = getAllInvestments();
  const index = investments.findIndex(i => i.id === id);
  
  if (index === -1) return null;
  
  investments[index] = { 
    ...investments[index], 
    ...updatedData,
    updatedAt: new Date().toISOString()
  };
  
  saveData(KEYS.INVESTMENTS, investments);
  return investments[index];
};

/**
 * Delete an investment
 * @param {string} id - Investment ID to delete
 * @returns {boolean} Success status
 */
const deleteInvestment = (id) => {
  const investments = getAllInvestments();
  const filteredInvestments = investments.filter(i => i.id !== id);
  
  if (filteredInvestments.length === investments.length) {
    return false;
  }
  
  saveData(KEYS.INVESTMENTS, filteredInvestments);
  return true;
};

/**
 * Update investment value and calculate returns
 * @param {string} id - Investment ID
 * @param {number} newValue - New current value
 * @returns {Object|null} Updated investment or null if not found
 */
const updateInvestmentValue = (id, newValue) => {
  const investments = getAllInvestments();
  const index = investments.findIndex(i => i.id === id);
  
  if (index === -1) return null;
  
  const investment = investments[index];
  const returns = Number(newValue) - Number(investment.initialAmount);
  const returnsPercentage = (returns / Number(investment.initialAmount)) * 100;
  
  investments[index] = {
    ...investment,
    currentValue: Number(newValue),
    returns,
    returnsPercentage,
    updatedAt: new Date().toISOString()
  };
  
  saveData(KEYS.INVESTMENTS, investments);
  return investments[index];
};

/**
 * Calculate investment statistics
 * @returns {Object} Statistics about investments
 */
const getInvestmentStatistics = () => {
  const investments = getAllInvestments();
  
  const totalInvested = investments.reduce((sum, i) => sum + Number(i.initialAmount), 0);
  const totalCurrent = investments.reduce((sum, i) => sum + Number(i.currentValue), 0);
  const totalReturns = totalCurrent - totalInvested;
  const averageReturn = totalInvested > 0 
    ? (totalReturns / totalInvested) * 100
    : 0;
    
  return {
    count: investments.length,
    totalInvested,
    totalCurrent,
    totalReturns,
    averageReturn,
    profitable: investments.filter(i => i.returns > 0).length,
    unprofitable: investments.filter(i => i.returns < 0).length
  };
};

export {
  getAllInvestments,
  addInvestment,
  updateInvestment,
  deleteInvestment,
  updateInvestmentValue,
  getInvestmentStatistics
}; 