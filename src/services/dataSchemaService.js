/**
 * Data Schema Service for Investment System
 * 
 * Defines the new investment data structures and provides migration utilities
 * to convert existing data to the new purchase-based schema.
 */

import { FinancialCalculationEngine, LOG_CATEGORIES } from './financialCalculationEngine.js';
import { v4 as uuidv4 } from 'uuid';

/**
 * Investment Categories
 */
export const INVESTMENT_CATEGORIES = {
  STOCKS: 'Stocks',
  BONDS: 'Bonds', 
  REAL_ESTATE: 'Real Estate',
  CRYPTOCURRENCY: 'Cryptocurrency',
  ETF: 'ETF',
  MUTUAL_FUNDS: 'Mutual Funds',
  OTHER: 'Other'
};

/**
 * New Investment Schema Validation
 */
export class InvestmentSchemaValidator {
  /**
   * Validate a purchase record
   */
  static validatePurchase(purchase) {
    const errors = [];
    
    if (!purchase.id) errors.push('Purchase ID is required');
    if (!purchase.investmentDate) errors.push('Investment date is required');
    if (!purchase.createdAt) errors.push('Created at timestamp is required');
    if (typeof purchase.amountInvested !== 'number' || purchase.amountInvested <= 0) {
      errors.push('Amount invested must be a positive number');
    }
    if (typeof purchase.tokensAcquired !== 'number' || purchase.tokensAcquired <= 0) {
      errors.push('Tokens acquired must be a positive number');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
  
  /**
   * Validate an investment record
   */
  static validateInvestment(investment) {
    const errors = [];
    
    if (!investment.id) errors.push('Investment ID is required');
    if (!investment.name || typeof investment.name !== 'string') {
      errors.push('Investment name is required and must be a string');
    }
    if (!Object.values(INVESTMENT_CATEGORIES).includes(investment.category)) {
      errors.push('Invalid investment category');
    }
    if (!investment.createdAt) errors.push('Created at timestamp is required');
    if (!Array.isArray(investment.purchases)) errors.push('Purchases must be an array');
    
    // Validate each purchase
    investment.purchases?.forEach((purchase, index) => {
      const purchaseValidation = this.validatePurchase(purchase);
      if (!purchaseValidation.isValid) {
        errors.push(`Purchase ${index}: ${purchaseValidation.errors.join(', ')}`);
      }
    });
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

/**
 * Investment Schema Factory
 */
export class InvestmentSchemaFactory {
  /**
   * Create a new investment with the new schema
   */
  static createInvestment(data) {
    const {
      name,
      category,
      coinId = null,
      coinSymbol = null, 
      coinThumb = null
    } = data;
    
    const investment = {
      id: crypto.randomUUID(),
      name: String(name).trim(),
      category,
      totalInvested: 0,
      currentMarketValue: 0,
      realizedGains: 0, // For future sales tracking
      unrealizedGains: 0,
      createdAt: new Date().toISOString(),
      lastPriceUpdate: null,
      
      // Crypto-specific fields
      ...(category === INVESTMENT_CATEGORIES.CRYPTOCURRENCY && {
        coinId,
        coinSymbol: coinSymbol?.toUpperCase(),
        coinThumb,
        currentPriceUSD: 0,
        totalTokens: 0
      }),
      
      purchases: []
    };
    
    const validation = InvestmentSchemaValidator.validateInvestment(investment);
    if (!validation.isValid) {
      throw new Error(`Invalid investment data: ${validation.errors.join(', ')}`);
    }
    
    FinancialCalculationEngine.Logger.log(
      LOG_CATEGORIES.DATA_MIGRATION,
      'createInvestment',
      { input: data, output: investment }
    );
    
    return investment;
  }
  
  /**
   * Add a purchase to an existing investment
   */
  static addPurchaseToInvestment(investment, purchaseData) {
    const purchase = FinancialCalculationEngine.createPurchaseRecord(purchaseData);
    
    const updatedInvestment = {
      ...investment,
      purchases: [...investment.purchases, purchase]
    };
    
    // Recalculate totals
    return this.recalculateInvestmentTotals(updatedInvestment);
  }
  
  /**
   * Recalculate investment totals based on purchases
   */
  static recalculateInvestmentTotals(investment) {
    if (!investment.purchases || investment.purchases.length === 0) {
      return {
        ...investment,
        totalInvested: 0,
        currentMarketValue: 0,
        unrealizedGains: 0,
        totalTokens: 0
      };
    }
    
    // Use standard JavaScript for more reliable calculations
    const totalInvested = investment.purchases.reduce((sum, purchase) => 
      sum + (purchase.amountInvested || 0), 0);
    
    const totalTokens = investment.purchases.reduce((sum, purchase) => 
      sum + (purchase.tokensAcquired || 0), 0);
    
    // Current market value calculation
    let currentMarketValue = 0;
    if (investment.category === INVESTMENT_CATEGORIES.CRYPTOCURRENCY) {
      // For crypto, use current price if available, otherwise use purchase price
      if (investment.currentPriceUSD && investment.currentPriceUSD > 0) {
        currentMarketValue = totalTokens * investment.currentPriceUSD;
      } else {
        // If no current price, use the total invested as current value (no gain/loss)
        currentMarketValue = totalInvested;
      }
    } else {
      // For non-crypto investments, current value equals total invested until updated
      currentMarketValue = totalInvested;
    }
    
    const unrealizedGains = currentMarketValue - totalInvested;
    
    const updatedInvestment = {
      ...investment,
      totalInvested,
      currentMarketValue,
      unrealizedGains,
      ...(investment.category === INVESTMENT_CATEGORIES.CRYPTOCURRENCY && {
        totalTokens
      })
    };
    
    FinancialCalculationEngine.Logger.log(
      LOG_CATEGORIES.CALCULATION,
      'recalculateInvestmentTotals',
      { 
        investmentId: investment.id,
        purchaseCount: investment.purchases.length,
        totalInvested,
        totalTokens,
        currentMarketValue
      }
    );
    
    return updatedInvestment;
  }
}

/**
 * Data Migration Service
 */
export class DataMigrationService {
  /**
   * Convert old investment format to new schema
   */
  static migrateOldInvestment(oldInvestment) {
    try {
      FinancialCalculationEngine.Logger.log(
        LOG_CATEGORIES.DATA_MIGRATION,
        'migrateOldInvestment_start',
        { oldInvestment }
      );
      
      // Create new investment structure
      const newInvestment = {
        id: oldInvestment.id || crypto.randomUUID(),
        name: oldInvestment.name || 'Unknown Investment',
        category: oldInvestment.category || INVESTMENT_CATEGORIES.OTHER,
        totalInvested: 0,
        currentMarketValue: 0,
        realizedGains: 0,
        unrealizedGains: 0,
        createdAt: oldInvestment.date || oldInvestment.createdAt || new Date().toISOString(),
        lastPriceUpdate: oldInvestment.lastUpdated || null,
        
        // Handle cryptocurrency-specific fields
        ...(oldInvestment.category === INVESTMENT_CATEGORIES.CRYPTOCURRENCY && {
          coinId: oldInvestment.coinId || null,
          coinSymbol: oldInvestment.coinSymbol || null,
          coinThumb: oldInvestment.coinThumb || null,
          currentPriceUSD: oldInvestment.coinPriceUSD || 0,
          totalTokens: 0
        }),
        
        purchases: []
      };
      
      // Convert existing data to initial purchase record
      const initialInvestment = oldInvestment.initialInvestment || oldInvestment.currentValue || 0;
      const tokensAmount = oldInvestment.initialAmount || 1; // For non-crypto, treat as 1 share
      const pricePerToken = tokensAmount > 0 ? initialInvestment / tokensAmount : initialInvestment;
      
      if (initialInvestment > 0) {
        const initialPurchase = {
          id: crypto.randomUUID(),
          investmentDate: oldInvestment.date || oldInvestment.createdAt || new Date().toISOString(),
          createdAt: new Date().toISOString(),
          amountInvested: Number(initialInvestment),
          tokensAcquired: Number(tokensAmount),
          pricePerTokenUSD: oldInvestment.coinPriceUSD || 0,
          investmentDate: oldInvestment.date || new Date().toISOString().split('T')[0]
        };
        
        newInvestment.purchases.push(initialPurchase);
      }
      
      // Migrate purchase history if it exists
      if (oldInvestment.purchaseHistory && Array.isArray(oldInvestment.purchaseHistory)) {
        const additionalPurchases = oldInvestment.purchaseHistory.map(oldPurchase => ({
          id: oldPurchase.id || crypto.randomUUID(),
          investmentDate: oldPurchase.date || new Date().toISOString(),
          createdAt: new Date().toISOString(),
          amountInvested: Number(oldPurchase.amount || 0),
          tokensAcquired: Number(oldPurchase.tokens || oldPurchase.amount || 0),
          pricePerTokenUSD: Number(oldPurchase.pricePerToken || 1)
        }));
        
        // Replace initial purchase if we have detailed history
        if (additionalPurchases.length > 0) {
          newInvestment.purchases = additionalPurchases;
        }
      }
      
      // Recalculate totals
      const finalInvestment = InvestmentSchemaFactory.recalculateInvestmentTotals(newInvestment);
      
      FinancialCalculationEngine.Logger.log(
        LOG_CATEGORIES.DATA_MIGRATION,
        'migrateOldInvestment_complete',
        { 
          oldId: oldInvestment.id,
          newId: finalInvestment.id,
          purchasesCreated: finalInvestment.purchases.length,
          totalInvested: finalInvestment.totalInvested
        }
      );
      
      return finalInvestment;
    } catch (error) {
      FinancialCalculationEngine.Logger.error('migrateOldInvestment', error, { oldInvestment });
      throw error;
    }
  }
  
  /**
   * Migrate all investments from old format
   */
  static migrateAllInvestments(oldInvestments) {
    if (!Array.isArray(oldInvestments)) {
      FinancialCalculationEngine.Logger.log(
        LOG_CATEGORIES.DATA_MIGRATION,
        'migrateAllInvestments_noData',
        { provided: typeof oldInvestments }
      );
      return [];
    }
    
    const startTime = performance.now();
    const migratedInvestments = [];
    const errors = [];
    
    FinancialCalculationEngine.Logger.log(
      LOG_CATEGORIES.DATA_MIGRATION,
      'migrateAllInvestments_start',
      { investmentCount: oldInvestments.length }
    );
    
    oldInvestments.forEach((oldInvestment, index) => {
      try {
        const migrated = this.migrateOldInvestment(oldInvestment);
        migratedInvestments.push(migrated);
      } catch (error) {
        errors.push({
          index,
          investmentName: oldInvestment.name || 'Unknown',
          error: error.message
        });
        FinancialCalculationEngine.Logger.error(
          'migrateAllInvestments_itemError', 
          error, 
          { index, oldInvestment }
        );
      }
    });
    
    const endTime = performance.now();
    
    FinancialCalculationEngine.Logger.log(
      LOG_CATEGORIES.DATA_MIGRATION,
      'migrateAllInvestments_complete',
      {
        originalCount: oldInvestments.length,
        migratedCount: migratedInvestments.length,
        errorCount: errors.length,
        errors,
        performanceMs: endTime - startTime
      }
    );
    
    return migratedInvestments;
  }
  
  /**
   * Validate migration results
   */
  static validateMigration(originalData, migratedData) {
    const validation = {
      isValid: true,
      warnings: [],
      errors: []
    };
    
    // Check counts
    if (originalData.length !== migratedData.length) {
      validation.warnings.push(
        `Investment count mismatch: ${originalData.length} original vs ${migratedData.length} migrated`
      );
    }
    
    // Validate each migrated investment
    migratedData.forEach((investment, index) => {
      const schemaValidation = InvestmentSchemaValidator.validateInvestment(investment);
      if (!schemaValidation.isValid) {
        validation.isValid = false;
        validation.errors.push({
          investmentIndex: index,
          investmentName: investment.name,
          errors: schemaValidation.errors
        });
      }
    });
    
    FinancialCalculationEngine.Logger.log(
      LOG_CATEGORIES.DATA_MIGRATION,
      'validateMigration',
      validation
    );
    
    return validation;
  }
} 