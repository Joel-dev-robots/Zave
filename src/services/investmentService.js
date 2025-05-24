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
const addInvestment = async (investment) => {
  const investments = getAllInvestments();
  
  let result = {
    success: true,
    data: null,
    message: "",
    isExistingInvestment: false
  };
  
  try {
    // Si es una criptomoneda, buscar si ya existe una inversión para esa moneda
    if (investment.category === 'Cryptocurrency' && investment.coinId) {
      const existingInvestment = investments.find(inv => 
        inv.category === 'Cryptocurrency' && 
        inv.coinId === investment.coinId
      );
      
      if (existingInvestment) {
        result.isExistingInvestment = true;
        
        // Obtener el precio actual de la criptomoneda
        const priceData = await getCoinPrice(investment.coinId);
        if (!priceData || !priceData.usd) {
          throw new Error('Could not fetch current price for the cryptocurrency');
        }
        
        const currentPrice = priceData.usd;
        const newTokens = Number(investment.initialAmount) / currentPrice;
        
        // Crear un nuevo registro de compra
        const purchaseRecord = {
          id: uuidv4(),
          date: new Date().toISOString(),
          amount: Number(investment.initialAmount),
          tokens: newTokens,
          pricePerToken: currentPrice
        };
        
        // Calcular estadísticas importantes para la respuesta
        const previousTokenAmount = existingInvestment.initialAmount;
        const newTotalTokens = Number(existingInvestment.initialAmount) + newTokens;
        const newTotalInvested = Number(existingInvestment.initialInvestment) + Number(investment.initialAmount);
        
        // Actualizar la inversión existente
        const updatedInvestment = {
          ...existingInvestment,
          initialInvestment: newTotalInvested,
          initialAmount: newTotalTokens,
          currentValue: newTotalTokens * currentPrice,
          lastUpdated: new Date().toISOString(),
          coinPriceUSD: currentPrice,
          purchaseHistory: [...(existingInvestment.purchaseHistory || []), purchaseRecord]
        };
        
        // Update return values
        const returns = updatedInvestment.currentValue - updatedInvestment.initialInvestment;
        const returnPercentage = (returns / updatedInvestment.initialInvestment) * 100;
        updatedInvestment.returns = returns;
        updatedInvestment.returnPercentage = returnPercentage;
        
        const index = investments.indexOf(existingInvestment);
        investments[index] = updatedInvestment;
        saveData(KEYS.INVESTMENTS, investments);
        
        result.data = updatedInvestment;
        result.message = `Added ${newTokens.toFixed(8)} ${updatedInvestment.coinSymbol} to your existing investment. You now have ${newTotalTokens.toFixed(8)} ${updatedInvestment.coinSymbol} worth $${updatedInvestment.currentValue.toFixed(2)}.`;
        
        return result;
      }
    }
    
    // Si no es una criptomoneda o no existe una inversión previa, crear una nueva
    const newInvestment = {
      id: uuidv4(),
      date: new Date().toISOString(),
      initialInvestment: Number(investment.initialAmount),
      currentValue: Number(investment.initialAmount),
      returns: 0,
      returnPercentage: 0,
      purchaseHistory: [],
      ...investment
    };
    
    // Si es una criptomoneda, calcular la cantidad de tokens
    if (newInvestment.category === 'Cryptocurrency' && newInvestment.coinId) {
      const priceData = await getCoinPrice(newInvestment.coinId);
      if (!priceData || !priceData.usd) {
        throw new Error('Could not fetch current price for the cryptocurrency');
      }
      
      newInvestment.coinPriceUSD = priceData.usd;
      newInvestment.initialAmount = newInvestment.initialInvestment / priceData.usd;
      newInvestment.purchasePriceUSD = priceData.usd;
      
      // Añadir el primer registro de compra
      newInvestment.purchaseHistory = [{
        id: uuidv4(),
        date: new Date().toISOString(),
        amount: Number(investment.initialAmount),
        tokens: newInvestment.initialAmount,
        pricePerToken: priceData.usd
      }];
      
      result.message = `Successfully purchased ${newInvestment.initialAmount.toFixed(8)} ${newInvestment.coinSymbol} at $${priceData.usd.toFixed(2)} per token.`;
    } else {
      result.message = `Successfully added investment: ${newInvestment.name}`;
    }
    
    investments.push(newInvestment);
    saveData(KEYS.INVESTMENTS, investments);
    
    result.data = newInvestment;
    return result;
  } catch (error) {
    console.error('Error in addInvestment:', error);
    return {
      success: false,
      data: null,
      message: error.message || 'Failed to add investment',
      isExistingInvestment: false
    };
  }
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
      
      if (priceData && priceData.usd) {
        // Precio actual por unidad en USD
        const usdPrice = priceData.usd;
        
        // Preserve existing purchase price or set it if it doesn't exist
        // IMPORTANTE: Nunca sobrescribir el precio de compra original
        if (!investment.purchasePriceUSD && !investment.initialPrice) {
          investment.purchasePriceUSD = usdPrice;
        }
        
        // Cálculo de la cantidad de tokens que posee el usuario
        let tokenAmount = investment.initialAmount;
        if (!tokenAmount && investment.purchasePriceUSD) {
          tokenAmount = investment.initialInvestment / investment.purchasePriceUSD;
        } else if (!tokenAmount && investment.initialPrice) {
          tokenAmount = investment.initialInvestment / investment.initialPrice;
        } else if (!tokenAmount) {
          tokenAmount = investment.initialInvestment / usdPrice;
        }
        
        // Valor actual de la inversión - Calculado basado en la cantidad de tokens y el precio actual
        const currentValue = tokenAmount * usdPrice;
        
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
          coinPriceUSD: usdPrice,
          // Mantener el precio de compra original, no sobrescribirlo
          purchasePriceUSD: investment.purchasePriceUSD || investment.initialPrice || usdPrice,
          lastUpdated: new Date().toISOString(),
          priceChangePercentage24h: priceData.usd_24h_change || 0
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
 * @param {Object} data - Datos de actualización (tokenAmount o usdValue)
 * @returns {Object|null} Updated investment or null if not found
 */
const updateCryptoHoldings = (id, data) => {
  const investments = getAllInvestments();
  const index = investments.findIndex(i => i.id === id);
  
  if (index === -1) return null;
  
  const investment = investments[index];
  
  // Verificar que sea una criptomoneda
  if (investment.category !== 'Cryptocurrency') {
    return updateInvestmentValue(id, data.usdValue || investment.currentValue);
  }
  
  let updatedTokens = investment.initialAmount;
  let updatedValue = investment.currentValue;
  
  // Si se actualizaron los tokens, recalcular el valor en USD
  if (data.tokenAmount !== undefined) {
    updatedTokens = Number(data.tokenAmount);
    // Usar el precio actual para calcular el nuevo valor
    updatedValue = updatedTokens * (investment.coinPriceUSD || 
      (investment.purchasePriceUSD || investment.initialPrice));
  } 
  // Si se actualizó el valor en USD, recalcular tokens
  else if (data.usdValue !== undefined) {
    updatedValue = Number(data.usdValue);
    // Calcular tokens basado en el precio actual
    updatedTokens = updatedValue / (investment.coinPriceUSD || 
      (investment.purchasePriceUSD || investment.initialPrice));
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

/**
 * Get price history for a cryptocurrency
 * @param {string} coinId - Coin ID
 * @param {number} days - Number of days of history
 * @returns {Promise<Array>} Price history data
 */
const getCryptoPriceHistory = async (coinId, days = 90) => {
  try {
    const response = await fetch(
      `https://api.coingecko.com/api/v3/coins/${coinId}/market_chart?vs_currency=usd&days=${days}&interval=daily`
    );
    const data = await response.json();
    
    return data.prices.map(([timestamp, price]) => ({
      date: new Date(timestamp),
      price
    }));
  } catch (error) {
    console.error('Error fetching price history:', error);
    return [];
  }
};

export {
  getAllInvestments,
  addInvestment,
  updateInvestment,
  deleteInvestment,
  updateInvestmentValue,
  getInvestmentStatistics,
  updateCryptoInvestmentValues,
  updateCryptoHoldings,
  getCryptoPriceHistory
}; 