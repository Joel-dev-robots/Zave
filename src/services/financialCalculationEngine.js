/**
 * Advanced Financial Calculation Engine
 * 
 * This engine provides accurate financial calculations for investment portfolios
 * with purchase-based tracking and proper decimal handling.
 */

/**
 * Debug logging categories for financial operations
 */
export const LOG_CATEGORIES = {
  CALCULATION: 'CALCULATION',
  API: 'API', 
  UI_ACTION: 'UI_ACTION',
  DATA_MIGRATION: 'DATA_MIGRATION',
  ERROR: 'ERROR'
};

/**
 * Structured logger for financial operations
 */
class FinancialLogger {
  static log(category, operation, data, performanceMs = null) {
    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      category,
      operation,
      data,
      ...(performanceMs && { performanceMs })
    };
    
    console.log(`[${category}] ${operation}:`, logEntry);
    return logEntry;
  }
  
  static error(operation, error, context = {}) {
    this.log(LOG_CATEGORIES.ERROR, operation, { error: error.message, stack: error.stack, context });
  }
}

/**
 * Precise decimal arithmetic to avoid floating-point issues
 */
class DecimalCalculator {
  /**
   * Convert currency value to cents to avoid floating-point errors
   */
  static toCents(value) {
    return Math.round(Number(value) * 100);
  }
  
  /**
   * Convert cents back to currency value
   */
  static fromCents(cents) {
    return Number(cents) / 100;
  }
  
  /**
   * Precise addition with cents
   */
  static add(a, b) {
    const aCents = this.toCents(a);
    const bCents = this.toCents(b);
    return this.fromCents(aCents + bCents);
  }
  
  /**
   * Precise subtraction with cents
   */
  static subtract(a, b) {
    const aCents = this.toCents(a);
    const bCents = this.toCents(b);
    return this.fromCents(aCents - bCents);
  }
  
  /**
   * Precise multiplication with cents
   */
  static multiply(a, b) {
    const aCents = this.toCents(a);
    const bCents = this.toCents(b);
    return this.fromCents((aCents * bCents) / 100);
  }
  
  /**
   * Precise division with cents
   */
  static divide(a, b) {
    const aCents = this.toCents(a);
    const bCents = this.toCents(b);
    return this.fromCents((aCents * 100) / bCents);
  }
  
  /**
   * Precise percentage calculation
   */
  static percentage(value, total) {
    if (total === 0) return 0;
    return this.multiply(this.divide(value, total), 100);
  }
}

/**
 * Purchase-based profit calculation engine
 */
class PurchaseCalculator {
  /**
   * Calculate current value and unrealized gain for a single purchase
   * @param {Object} purchase - Purchase record
   * @param {number} currentPrice - Current market price
   * @returns {Object} Calculated values
   */
  static calculatePurchasePerformance(purchase, currentPrice) {
    const startTime = performance.now();
    
    try {
      const { amountInvested, tokensAcquired, pricePerTokenUSD } = purchase;
      
      // Current value = tokens * current price
      const currentValue = DecimalCalculator.multiply(tokensAcquired, currentPrice);
      
      // Unrealized gain = current value - amount invested
      const unrealizedGain = DecimalCalculator.subtract(currentValue, amountInvested);
      
      // Unrealized gain percentage
      const unrealizedGainPercentage = DecimalCalculator.percentage(unrealizedGain, amountInvested);
      
      const result = {
        currentValue,
        unrealizedGain,
        unrealizedGainPercentage,
        originalPurchasePrice: pricePerTokenUSD,
        priceChange: DecimalCalculator.subtract(currentPrice, pricePerTokenUSD),
        priceChangePercentage: DecimalCalculator.percentage(
          DecimalCalculator.subtract(currentPrice, pricePerTokenUSD), 
          pricePerTokenUSD
        )
      };
      
      const endTime = performance.now();
      FinancialLogger.log(
        LOG_CATEGORIES.CALCULATION, 
        'calculatePurchasePerformance',
        {
          input: { amountInvested, tokensAcquired, pricePerTokenUSD, currentPrice },
          output: result
        },
        endTime - startTime
      );
      
      return result;
    } catch (error) {
      FinancialLogger.error('calculatePurchasePerformance', error, { purchase, currentPrice });
      throw error;
    }
  }
  
  /**
   * Calculate aggregated performance for multiple purchases of same investment
   * @param {Array} purchases - Array of purchase records
   * @param {number} currentPrice - Current market price
   * @returns {Object} Aggregated performance
   */
  static calculateInvestmentPerformance(purchases, currentPrice) {
    const startTime = performance.now();
    
    try {
      if (!purchases || purchases.length === 0) {
        return {
          totalInvested: 0,
          totalTokens: 0,
          currentMarketValue: 0,
          unrealizedGains: 0,
          unrealizedGainPercentage: 0,
          averagePurchasePrice: 0,
          purchasePerformances: []
        };
      }
      
      // Calculate individual purchase performances
      const purchasePerformances = purchases.map(purchase => ({
        ...purchase,
        performance: this.calculatePurchasePerformance(purchase, currentPrice)
      }));
      
      // Aggregate totals
      const totalInvested = purchases.reduce((sum, p) => 
        DecimalCalculator.add(sum, p.amountInvested), 0);
      
      const totalTokens = purchases.reduce((sum, p) => 
        DecimalCalculator.add(sum, p.tokensAcquired), 0);
      
      const currentMarketValue = DecimalCalculator.multiply(totalTokens, currentPrice);
      
      const unrealizedGains = DecimalCalculator.subtract(currentMarketValue, totalInvested);
      
      const unrealizedGainPercentage = DecimalCalculator.percentage(unrealizedGains, totalInvested);
      
      // Weighted average purchase price
      const averagePurchasePrice = totalTokens > 0 ? 
        DecimalCalculator.divide(totalInvested, totalTokens) : 0;
      
      const result = {
        totalInvested,
        totalTokens,
        currentMarketValue,
        unrealizedGains,
        unrealizedGainPercentage,
        averagePurchasePrice,
        purchasePerformances
      };
      
      const endTime = performance.now();
      FinancialLogger.log(
        LOG_CATEGORIES.CALCULATION,
        'calculateInvestmentPerformance',
        {
          input: { purchasesCount: purchases.length, currentPrice },
          output: result
        },
        endTime - startTime
      );
      
      return result;
    } catch (error) {
      FinancialLogger.error('calculateInvestmentPerformance', error, { purchases, currentPrice });
      throw error;
    }
  }
  
  /**
   * Calculate portfolio-wide performance from multiple investments
   * @param {Array} investments - Array of investment records with calculated performances
   * @returns {Object} Portfolio performance
   */
  static calculatePortfolioPerformance(investments) {
    const startTime = performance.now();
    
    try {
      if (!investments || investments.length === 0) {
        return {
          totalInvested: 0,
          totalCurrentValue: 0,
          totalUnrealizedGains: 0,
          totalUnrealizedGainPercentage: 0,
          profitableInvestments: 0,
          unprofitableInvestments: 0,
          investmentCount: 0
        };
      }
      
      const totalInvested = investments.reduce((sum, inv) => 
        DecimalCalculator.add(sum, inv.totalInvested || 0), 0);
      
      const totalCurrentValue = investments.reduce((sum, inv) => 
        DecimalCalculator.add(sum, inv.currentMarketValue || 0), 0);
      
      const totalUnrealizedGains = DecimalCalculator.subtract(totalCurrentValue, totalInvested);
      
      const totalUnrealizedGainPercentage = DecimalCalculator.percentage(
        totalUnrealizedGains, 
        totalInvested
      );
      
      const profitableInvestments = investments.filter(inv => 
        (inv.unrealizedGains || 0) > 0).length;
      
      const unprofitableInvestments = investments.filter(inv => 
        (inv.unrealizedGains || 0) < 0).length;
      
      const result = {
        totalInvested,
        totalCurrentValue,
        totalUnrealizedGains,
        totalUnrealizedGainPercentage,
        profitableInvestments,
        unprofitableInvestments,
        investmentCount: investments.length
      };
      
      const endTime = performance.now();
      FinancialLogger.log(
        LOG_CATEGORIES.CALCULATION,
        'calculatePortfolioPerformance',
        {
          input: { investmentCount: investments.length },
          output: result
        },
        endTime - startTime
      );
      
      return result;
    } catch (error) {
      FinancialLogger.error('calculatePortfolioPerformance', error, { investments });
      throw error;
    }
  }
}

/**
 * Date handling utilities for investment tracking
 */
class InvestmentDateUtils {
  /**
   * Validate investment date
   * @param {string|Date} date - Date to validate
   * @returns {boolean} Is valid
   */
  static isValidInvestmentDate(date) {
    try {
      const parsedDate = new Date(date);
      const now = new Date();
      
      // Check if date is valid and not in the future
      return parsedDate instanceof Date && 
             !isNaN(parsedDate) && 
             parsedDate <= now;
    } catch (error) {
      FinancialLogger.error('isValidInvestmentDate', error, { date });
      return false;
    }
  }
  
  /**
   * Format date for display
   * @param {string|Date} date - Date to format
   * @returns {string} Formatted date
   */
  static formatDisplayDate(date) {
    try {
      return new Date(date).toLocaleDateString();
    } catch (error) {
      FinancialLogger.error('formatDisplayDate', error, { date });
      return 'Invalid Date';
    }
  }
  
  /**
   * Get ISO string for storage
   * @param {string|Date} date - Date to convert
   * @returns {string} ISO string
   */
  static toISOString(date) {
    try {
      return new Date(date).toISOString();
    } catch (error) {
      FinancialLogger.error('toISOString', error, { date });
      throw new Error('Invalid date provided');
    }
  }
}

/**
 * Main Financial Calculation Engine
 */
export class FinancialCalculationEngine {
  static DecimalCalculator = DecimalCalculator;
  static PurchaseCalculator = PurchaseCalculator;
  static InvestmentDateUtils = InvestmentDateUtils;
  static Logger = FinancialLogger;
  
  /**
   * Add a new purchase to an investment
   * @param {Object} purchaseData - Purchase data
   * @returns {Object} Formatted purchase record
   */
  static createPurchaseRecord(purchaseData) {
    const startTime = performance.now();
    
    try {
      const {
        investmentDate,
        amountInvested,
        tokensAcquired,
        pricePerTokenUSD
      } = purchaseData;
      
      // Validate input data
      if (!InvestmentDateUtils.isValidInvestmentDate(investmentDate)) {
        throw new Error('Invalid investment date provided');
      }
      
      if (amountInvested <= 0 || tokensAcquired <= 0) {
        throw new Error('Amount invested and tokens acquired must be positive');
      }
      
      const purchase = {
        id: crypto.randomUUID(), // Use modern UUID generation
        investmentDate: InvestmentDateUtils.toISOString(investmentDate),
        createdAt: new Date().toISOString(),
        amountInvested: Number(amountInvested),
        tokensAcquired: Number(tokensAcquired),
        pricePerTokenUSD: Number(pricePerTokenUSD || 0),
        currentValue: 0, // Will be calculated
        unrealizedGain: 0, // Will be calculated
        unrealizedGainPercentage: 0 // Will be calculated
      };
      
      const endTime = performance.now();
      FinancialLogger.log(
        LOG_CATEGORIES.CALCULATION,
        'createPurchaseRecord',
        {
          input: purchaseData,
          output: purchase
        },
        endTime - startTime
      );
      
      return purchase;
    } catch (error) {
      FinancialLogger.error('createPurchaseRecord', error, purchaseData);
      throw error;
    }
  }
  
  /**
   * Update purchase records with current market data
   * @param {Array} purchases - Purchase records
   * @param {number} currentPrice - Current market price
   * @returns {Array} Updated purchase records
   */
  static updatePurchasePerformances(purchases, currentPrice) {
    const startTime = performance.now();
    
    try {
      const updatedPurchases = purchases.map(purchase => {
        const performance = PurchaseCalculator.calculatePurchasePerformance(purchase, currentPrice);
        
        return {
          ...purchase,
          currentValue: performance.currentValue,
          unrealizedGain: performance.unrealizedGain,
          unrealizedGainPercentage: performance.unrealizedGainPercentage
        };
      });
      
      const endTime = performance.now();
      FinancialLogger.log(
        LOG_CATEGORIES.CALCULATION,
        'updatePurchasePerformances',
        {
          input: { purchaseCount: purchases.length, currentPrice },
          output: { updatedCount: updatedPurchases.length }
        },
        endTime - startTime
      );
      
      return updatedPurchases;
    } catch (error) {
      FinancialLogger.error('updatePurchasePerformances', error, { purchases, currentPrice });
      throw error;
    }
  }

  static calculatePurchaseMetrics(
    amountInvested, 
    tokensAcquired, 
    pricePerTokenUSD
  ) {
    const calculationId = crypto.randomUUID();
    
    this.Logger.log(
      LOG_CATEGORIES.CALCULATIONS,
      'calculatePurchaseMetrics_start',
      { 
        calculationId, 
        amountInvested, 
        tokensAcquired, 
        pricePerTokenUSD
      }
    );
    
    try {
      // Validate inputs
      if (typeof amountInvested !== 'number' || amountInvested <= 0) {
        throw new Error('Amount invested must be a positive number');
      }
      
      if (typeof tokensAcquired !== 'number' || tokensAcquired <= 0) {
        throw new Error('Tokens acquired must be a positive number');
      }
      
      if (typeof pricePerTokenUSD !== 'number' || pricePerTokenUSD <= 0) {
        throw new Error('Price per token must be a positive number');
      }
      
      const result = {
        id: calculationId,
        timestamp: new Date().toISOString(),
        amountInvested: Number(amountInvested),
        tokensAcquired: Number(tokensAcquired),
        pricePerTokenUSD: Number(pricePerTokenUSD || 0),
        calculatedAt: new Date().toISOString()
      };
      
      // ... existing code ...
      
      return result;
    } catch (error) {
      FinancialLogger.error('calculatePurchaseMetrics', error, { amountInvested, tokensAcquired, pricePerTokenUSD });
      throw error;
    }
  }
} 