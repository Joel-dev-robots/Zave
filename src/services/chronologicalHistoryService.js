import { getAllInvestments } from './investmentService';
import { getCoinPrice } from './cryptoService';

/**
 * Genera un historial cronológico de todas las inversiones
 * @returns {Array} Historial ordenado cronológicamente
 */
const getChronologicalHistory = () => {
  const investments = getAllInvestments();
  let allTransactions = [];
  
  // Recorrer todas las inversiones
  investments.forEach(investment => {
    // Para criptomonedas con historial de compras
    if (investment.category === 'Cryptocurrency' && investment.purchaseHistory && investment.purchaseHistory.length > 0) {
      // Añadir cada compra como una transacción separada
      investment.purchaseHistory.forEach(purchase => {
        // Calcular el valor actual de esta compra específica
        const currentTokenPrice = investment.coinPriceUSD || 0;
        const currentValueOfPurchase = purchase.tokens * currentTokenPrice;
        const returnAmount = currentValueOfPurchase - purchase.amount;
        const returnPercentage = (returnAmount / purchase.amount) * 100;
        
        allTransactions.push({
          id: purchase.id,
          date: purchase.date,
          investmentId: investment.id,
          investmentName: investment.name,
          category: investment.category,
          amount: purchase.amount,
          tokens: purchase.tokens,
          pricePerToken: purchase.pricePerToken,
          currentPricePerToken: currentTokenPrice,
          symbol: investment.coinSymbol,
          coinThumb: investment.coinThumb,
          currentValue: currentValueOfPurchase,
          currentReturn: returnAmount,
          currentReturnPercentage: returnPercentage
        });
      });
    } else {
      // Para inversiones normales o criptos sin historial detallado
      allTransactions.push({
        id: investment.id,
        date: investment.date,
        investmentId: investment.id,
        investmentName: investment.name,
        category: investment.category,
        amount: investment.initialInvestment,
        currentValue: investment.currentValue,
        currentReturn: investment.returns,
        currentReturnPercentage: investment.returnPercentage,
        // Datos específicos de cripto si aplica
        tokens: investment.category === 'Cryptocurrency' ? investment.initialAmount : null,
        pricePerToken: investment.category === 'Cryptocurrency' ? investment.purchasePriceUSD : null,
        currentPricePerToken: investment.category === 'Cryptocurrency' ? investment.coinPriceUSD : null,
        symbol: investment.category === 'Cryptocurrency' ? investment.coinSymbol : null,
        coinThumb: investment.category === 'Cryptocurrency' ? investment.coinThumb : null
      });
    }
  });
  
  // Ordenar por fecha descendente (más reciente primero)
  return allTransactions.sort((a, b) => new Date(b.date) - new Date(a.date));
};

/**
 * Filtra el historial cronológico por categoría
 * @param {Array} history - Historial cronológico
 * @param {string} category - Categoría a filtrar
 * @returns {Array} Historial filtrado
 */
const filterHistoryByCategory = (history, category) => {
  if (!category) return history;
  return history.filter(transaction => transaction.category === category);
};

/**
 * Filtra el historial cronológico por rango de fechas
 * @param {Array} history - Historial cronológico
 * @param {Date} startDate - Fecha inicial
 * @param {Date} endDate - Fecha final
 * @returns {Array} Historial filtrado
 */
const filterHistoryByDateRange = (history, startDate, endDate) => {
  if (!startDate && !endDate) return history;
  
  return history.filter(transaction => {
    const transactionDate = new Date(transaction.date);
    if (startDate && endDate) {
      return transactionDate >= startDate && transactionDate <= endDate;
    } else if (startDate) {
      return transactionDate >= startDate;
    } else if (endDate) {
      return transactionDate <= endDate;
    }
    return true;
  });
};

/**
 * Filtra el historial cronológico por monto invertido
 * @param {Array} history - Historial cronológico
 * @param {number} minAmount - Monto mínimo
 * @param {number} maxAmount - Monto máximo
 * @returns {Array} Historial filtrado
 */
const filterHistoryByAmount = (history, minAmount, maxAmount) => {
  if (!minAmount && !maxAmount) return history;
  
  return history.filter(transaction => {
    if (minAmount && maxAmount) {
      return transaction.amount >= minAmount && transaction.amount <= maxAmount;
    } else if (minAmount) {
      return transaction.amount >= minAmount;
    } else if (maxAmount) {
      return transaction.amount <= maxAmount;
    }
    return true;
  });
};

/**
 * Agrupa el historial por períodos (mes, trimestre, año)
 * @param {Array} history - Historial cronológico
 * @param {string} periodType - Tipo de período ('month', 'quarter', 'year')
 * @returns {Object} Historial agrupado por período
 */
const groupHistoryByPeriod = (history, periodType = 'month') => {
  const groupedData = {};
  
  history.forEach(transaction => {
    const date = new Date(transaction.date);
    let periodKey;
    
    if (periodType === 'month') {
      // Formato YYYY-MM
      periodKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
    } else if (periodType === 'quarter') {
      // Trimestre (Q1, Q2, Q3, Q4)
      const quarter = Math.floor(date.getMonth() / 3) + 1;
      periodKey = `${date.getFullYear()}-Q${quarter}`;
    } else { // year
      periodKey = `${date.getFullYear()}`;
    }
    
    if (!groupedData[periodKey]) {
      groupedData[periodKey] = {
        period: periodKey,
        transactions: [],
        totalInvested: 0,
        totalCurrentValue: 0,
        totalReturn: 0,
        categories: {}
      };
    }
    
    groupedData[periodKey].transactions.push(transaction);
    groupedData[periodKey].totalInvested += transaction.amount;
    groupedData[periodKey].totalCurrentValue += transaction.currentValue;
    
    // Agrupar por categoría dentro del período
    if (!groupedData[periodKey].categories[transaction.category]) {
      groupedData[periodKey].categories[transaction.category] = {
        totalInvested: 0,
        count: 0
      };
    }
    
    groupedData[periodKey].categories[transaction.category].totalInvested += transaction.amount;
    groupedData[periodKey].categories[transaction.category].count += 1;
  });
  
  // Calcular retornos totales para cada período
  Object.keys(groupedData).forEach(key => {
    const period = groupedData[key];
    period.totalReturn = period.totalCurrentValue - period.totalInvested;
    period.totalReturnPercentage = (period.totalReturn / period.totalInvested) * 100;
  });
  
  return groupedData;
};

export {
  getChronologicalHistory,
  filterHistoryByCategory,
  filterHistoryByDateRange,
  filterHistoryByAmount,
  groupHistoryByPeriod
}; 