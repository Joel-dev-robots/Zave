/**
 * Investment Service for managing investments
 */
import { v4 as uuidv4 } from 'uuid';
import { KEYS, getData, saveData } from './storageService';
import { getCoinPrice } from './cryptoService';

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
    initialInvestment: Number(investment.initialAmount),
    currentValue: Number(investment.initialAmount),
    returns: 0,
    returnPercentage: 0,
    ...investment
  };
  
  // Si es una criptomoneda y tiene un coinId, intentar establecer el precio de compra
  if (newInvestment.category === 'Cryptocurrency' && newInvestment.coinId) {
    // Si hay un precio inicial proporcionado, usarlo como precio de compra
    if (newInvestment.initialPrice) {
      newInvestment.purchasePriceEUR = newInvestment.initialPrice;
    }
  }
  
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
  const returns = Number(newValue) - Number(investment.initialInvestment);
  const returnPercentage = (returns / Number(investment.initialInvestment)) * 100;
  
  investments[index] = {
    ...investment,
    currentValue: Number(newValue),
    returns,
    returnPercentage,
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
  
  const totalInvested = investments.reduce((sum, i) => sum + Number(i.initialInvestment || 0), 0);
  const totalCurrent = investments.reduce((sum, i) => sum + Number(i.currentValue || 0), 0);
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

/**
 * Updates cryptocurrency values automatically using CoinGecko API
 * @returns {Promise<Array>} Updated crypto investments
 */
const updateCryptoInvestmentValues = async () => {
  const investments = getAllInvestments();
  const cryptoInvestments = investments.filter(inv => 
    inv.category === 'Cryptocurrency' && inv.coinId
  );
  
  if (cryptoInvestments.length === 0) return [];
  
  const updatedInvestments = [];
  
  for (const investment of cryptoInvestments) {
    try {
      const priceData = await getCoinPrice(investment.coinId);
      
      if (priceData && priceData.eur) {
        // Precio actual por unidad en EUR y USD
        const eurPrice = priceData.eur;
        const usdPrice = priceData.usd;
        
        // Preserve existing purchase price or set it if it doesn't exist
        // IMPORTANTE: Nunca sobrescribir el precio de compra original
        if (!investment.purchasePriceEUR && !investment.initialPrice) {
          investment.purchasePriceEUR = eurPrice;
        }
        
        // Cálculo de la cantidad de tokens que posee el usuario
        let tokenAmount = investment.initialAmount;
        if (!tokenAmount && investment.purchasePriceEUR) {
          tokenAmount = investment.initialInvestment / investment.purchasePriceEUR;
        } else if (!tokenAmount && investment.initialPrice) {
          tokenAmount = investment.initialInvestment / investment.initialPrice;
        } else if (!tokenAmount) {
          tokenAmount = investment.initialInvestment / eurPrice;
        }
        
        // Valor actual de la inversión - Calculado basado en la cantidad de tokens y el precio actual
        const currentValue = tokenAmount * eurPrice;
        
        // Cálculo de rentabilidad
        const returns = currentValue - investment.initialInvestment;
        const returnPercentage = (returns / investment.initialInvestment) * 100;
        
        // Update the investment
        const index = investments.indexOf(investment);
        investments[index] = {
          ...investment,
          currentValue,
          returns,
          returnPercentage,
          initialAmount: tokenAmount,
          coinPriceEUR: eurPrice,
          coinPriceUSD: usdPrice,
          // Mantener el precio de compra original, no sobrescribirlo
          purchasePriceEUR: investment.purchasePriceEUR || investment.initialPrice || eurPrice,
          lastUpdated: new Date().toISOString(),
          priceChangePercentage24h: priceData.eur_24h_change || 0
        };
        
        updatedInvestments.push(investments[index]);
      }
    } catch (error) {
      console.error(`Error updating crypto investment ${investment.name}:`, error);
    }
  }
  
  if (updatedInvestments.length > 0) {
    saveData(KEYS.INVESTMENTS, investments);
  }
  
  return updatedInvestments;
};

/**
 * Update crypto holdings (tokens or value)
 * @param {string} id - Investment ID
 * @param {Object} data - Datos de actualización (tokenAmount o eurValue)
 * @returns {Object|null} Updated investment or null if not found
 */
const updateCryptoHoldings = (id, data) => {
  const investments = getAllInvestments();
  const index = investments.findIndex(i => i.id === id);
  
  if (index === -1) return null;
  
  const investment = investments[index];
  
  // Verificar que sea una criptomoneda
  if (investment.category !== 'Cryptocurrency') {
    return updateInvestmentValue(id, data.eurValue || investment.currentValue);
  }
  
  let updatedTokens = investment.initialAmount;
  let updatedValue = investment.currentValue;
  
  // Si se actualizaron los tokens, recalcular el valor en EUR
  if (data.tokenAmount !== undefined) {
    updatedTokens = Number(data.tokenAmount);
    // Usar el precio actual para calcular el nuevo valor
    updatedValue = updatedTokens * (investment.coinPriceEUR || 
      (investment.purchasePriceEUR || investment.initialPrice));
  } 
  // Si se actualizó el valor en EUR, recalcular tokens
  else if (data.eurValue !== undefined) {
    updatedValue = Number(data.eurValue);
    // Calcular tokens basado en el precio actual
    updatedTokens = updatedValue / (investment.coinPriceEUR || 
      (investment.purchasePriceEUR || investment.initialPrice));
  }
  
  // Cálculo de rentabilidad
  const returns = updatedValue - Number(investment.initialInvestment);
  const returnPercentage = (returns / Number(investment.initialInvestment)) * 100;
  
  investments[index] = {
    ...investment,
    currentValue: updatedValue,
    initialAmount: updatedTokens,
    returns,
    returnPercentage,
    updatedAt: new Date().toISOString()
  };
  
  saveData(KEYS.INVESTMENTS, investments);
  return investments[index];
};

export {
  getAllInvestments,
  addInvestment,
  updateInvestment,
  deleteInvestment,
  updateInvestmentValue,
  getInvestmentStatistics,
  updateCryptoInvestmentValues,
  updateCryptoHoldings
}; 