/**
 * Redesigned Investment Service
 * 
 * Main service that orchestrates the new investment system with purchase-based tracking,
 * accurate financial calculations, and enhanced cryptocurrency features.
 */

import { FinancialCalculationEngine, LOG_CATEGORIES } from './financialCalculationEngine.js';
import { 
  DataMigrationService, 
  InvestmentSchemaFactory, 
  InvestmentSchemaValidator,
  INVESTMENT_CATEGORIES 
} from './dataSchemaService.js';
import { EnhancedCryptoService } from './enhancedCryptoService.js';
import { getData, saveData, KEYS } from './storageService.js';

/**
 * Redesigned Investment Service
 */
export class RedesignedInvestmentService {
  constructor() {
    this.cryptoService = new EnhancedCryptoService();
    this.initializeMigration();
    this.fixExistingInvestments(); // Fix any data inconsistencies
  }
  
  /**
   * Initialize and perform data migration if needed
   */
  async initializeMigration() {
    try {
      const existingData = getData(KEYS.INVESTMENTS, []);
      
      // Check if migration is needed
      if (existingData.length > 0 && !this.isNewSchemaFormat(existingData[0])) {
        FinancialCalculationEngine.Logger.log(
          LOG_CATEGORIES.DATA_MIGRATION,
          'migration_needed',
          { existingCount: existingData.length }
        );
        
        // Perform migration
        const migratedData = DataMigrationService.migrateAllInvestments(existingData);
        
        // Validate migration
        const validation = DataMigrationService.validateMigration(existingData, migratedData);
        
        if (validation.isValid) {
          // Save migrated data
          saveData(KEYS.INVESTMENTS, migratedData);
          
          // Backup original data
          saveData('INVESTMENTS_BACKUP_' + Date.now(), existingData);
          
          FinancialCalculationEngine.Logger.log(
            LOG_CATEGORIES.DATA_MIGRATION,
            'migration_complete',
            { 
              originalCount: existingData.length,
              migratedCount: migratedData.length,
              warnings: validation.warnings
            }
          );
        } else {
          FinancialCalculationEngine.Logger.error(
            'migration_failed',
            new Error('Migration validation failed'),
            validation
          );
          throw new Error('Data migration failed validation. Original data preserved.');
        }
      }
    } catch (error) {
      FinancialCalculationEngine.Logger.error('initializeMigration', error);
      throw error;
    }
  }
  
  /**
   * Check if data is in new schema format
   */
  isNewSchemaFormat(investment) {
    return investment && 
           Array.isArray(investment.purchases) && 
           typeof investment.totalInvested === 'number' &&
           typeof investment.currentMarketValue === 'number';
  }
  
  /**
   * Get all investments
   */
  getAllInvestments() {
    try {
      const investments = getData(KEYS.INVESTMENTS, []);
      
      FinancialCalculationEngine.Logger.log(
        LOG_CATEGORIES.UI_ACTION,
        'getAllInvestments',
        { count: investments.length }
      );
      
      return investments;
    } catch (error) {
      FinancialCalculationEngine.Logger.error('getAllInvestments', error);
      return [];
    }
  }
  
  /**
   * Add a new investment
   */
  async addInvestment(investmentData) {
    try {
      FinancialCalculationEngine.Logger.log(
        LOG_CATEGORIES.UI_ACTION,
        'addInvestment_start',
        { investmentData }
      );
      
      const {
        name,
        category,
        initialAmount,
        investmentDate = new Date().toISOString(),
        coinId,
        coinSymbol,
        coinThumb
      } = investmentData;
      
      // Validate investment date
      if (!FinancialCalculationEngine.InvestmentDateUtils.isValidInvestmentDate(investmentDate)) {
        throw new Error('Invalid investment date. Date cannot be in the future.');
      }
      
      let result = {
        success: true,
        data: null,
        message: '',
        isExistingInvestment: false
      };
      
      const investments = this.getAllInvestments();
      
      // For cryptocurrencies, check if investment already exists
      if (category === INVESTMENT_CATEGORIES.CRYPTOCURRENCY && coinId) {
        const existingInvestment = investments.find(inv => 
          inv.category === INVESTMENT_CATEGORIES.CRYPTOCURRENCY && 
          inv.coinId === coinId
        );
        
        if (existingInvestment) {
          result.isExistingInvestment = true;
          
          // Get current or historical price
          let priceData;
          const investmentDateTime = new Date(investmentDate);
          const today = new Date();
          today.setHours(0, 0, 0, 0); // Reset to start of today
          investmentDateTime.setHours(0, 0, 0, 0); // Reset to start of investment date
          
          const isHistoricalDate = investmentDateTime < today;
          
          console.log('Investment Date Analysis:', {
            investmentDate,
            investmentDateTime: investmentDateTime.toISOString(),
            today: today.toISOString(),
            isHistoricalDate
          });
          
          if (isHistoricalDate) {
            console.log('Fetching historical price for:', investmentDate);
            priceData = await this.cryptoService.getHistoricalPrice(coinId, investmentDate);
            if (!priceData || !priceData.usd) {
              console.error('Historical price fetch failed for:', { coinId, investmentDate });
              throw new Error(`Could not fetch historical price for ${investmentDate}. Please try a different date or use today's date for current pricing.`);
            }
          } else {
            console.log('Fetching current price for today');
            priceData = await this.cryptoService.getCoinPrice(coinId);
            if (!priceData || !priceData.usd) {
              throw new Error('Could not fetch current price for the cryptocurrency');
            }
          }
          
          const currentPrice = priceData.usd;
          const tokensAcquired = Number(initialAmount) / currentPrice;
          
          // Create purchase record
          const purchaseData = {
            investmentDate,
            amountInvested: Number(initialAmount),
            tokensAcquired,
            pricePerTokenUSD: currentPrice,
          };
          
          // Add purchase to existing investment
          const updatedInvestment = InvestmentSchemaFactory.addPurchaseToInvestment(
            existingInvestment,
            purchaseData
          );
          
          // Update price information
          updatedInvestment.currentPriceUSD = currentPrice;
          updatedInvestment.lastPriceUpdate = new Date().toISOString();
          
          // Recalculate with current price
          const finalInvestment = InvestmentSchemaFactory.recalculateInvestmentTotals(updatedInvestment);
          
          // Save updated investment
          const index = investments.findIndex(inv => inv.id === existingInvestment.id);
          investments[index] = finalInvestment;
          saveData(KEYS.INVESTMENTS, investments);
          
          result.data = finalInvestment;
          result.message = `Added ${tokensAcquired.toFixed(8)} ${updatedInvestment.coinSymbol} to your existing investment. You now have ${finalInvestment.totalTokens.toFixed(8)} ${updatedInvestment.coinSymbol} worth $${finalInvestment.currentMarketValue.toFixed(2)}.`;
          
          FinancialCalculationEngine.Logger.log(
            LOG_CATEGORIES.UI_ACTION,
            'addInvestment_existing_updated',
            { 
              coinId,
              tokensAdded: tokensAcquired,
              totalTokens: finalInvestment.totalTokens,
              newTotalValue: finalInvestment.currentMarketValue
            }
          );
          
          return result;
        }
      }
      
      // Create new investment
      const newInvestment = InvestmentSchemaFactory.createInvestment({
        name,
        category,
        coinId,
        coinSymbol,
        coinThumb
      });
      
      // For cryptocurrencies, get price and create initial purchase
      if (category === INVESTMENT_CATEGORIES.CRYPTOCURRENCY && coinId) {
        let priceData;
        const investmentDateTime = new Date(investmentDate);
        const today = new Date();
        today.setHours(0, 0, 0, 0); // Reset to start of today
        investmentDateTime.setHours(0, 0, 0, 0); // Reset to start of investment date
        
        const isHistoricalDate = investmentDateTime < today;
        
        console.log('New Investment Date Analysis:', {
          investmentDate,
          investmentDateTime: investmentDateTime.toISOString(),
          today: today.toISOString(),
          isHistoricalDate
        });
        
        if (isHistoricalDate) {
          console.log('Fetching historical price for new investment:', investmentDate);
          priceData = await this.cryptoService.getHistoricalPrice(coinId, investmentDate);
          if (!priceData || !priceData.usd) {
            console.error('Historical price fetch failed for new investment:', { coinId, investmentDate });
            throw new Error(`Could not fetch historical price for ${investmentDate}. Please try a different date or use today's date for current pricing.`);
          }
        } else {
          console.log('Fetching current price for new investment');
          priceData = await this.cryptoService.getCoinPrice(coinId);
          if (!priceData || !priceData.usd) {
            throw new Error('Could not fetch current price for the cryptocurrency');
          }
        }
        
        const pricePerToken = priceData.usd;
        const tokensAcquired = Number(initialAmount) / pricePerToken;
        
        // Create purchase record
        const purchaseData = {
          investmentDate,
          amountInvested: Number(initialAmount),
          tokensAcquired,
          pricePerTokenUSD: pricePerToken,
        };
        
        // Add purchase to investment
        const investmentWithPurchase = InvestmentSchemaFactory.addPurchaseToInvestment(
          newInvestment,
          purchaseData
        );
        
        // Update price information
        investmentWithPurchase.currentPriceUSD = pricePerToken;
        investmentWithPurchase.lastPriceUpdate = new Date().toISOString();
        
        investments.push(investmentWithPurchase);
        result.data = investmentWithPurchase;
        result.message = `Successfully purchased ${tokensAcquired.toFixed(8)} ${coinSymbol} at $${pricePerToken.toFixed(4)} per token.`;
      } else {
        // For non-crypto investments, create simple purchase record
        const purchaseData = {
          investmentDate,
          amountInvested: Number(initialAmount),
          tokensAcquired: 1, // Treat as 1 share for traditional investments
          pricePerTokenUSD: 0,
        };
        
        const investmentWithPurchase = InvestmentSchemaFactory.addPurchaseToInvestment(
          newInvestment,
          purchaseData
        );
        
        investments.push(investmentWithPurchase);
        result.data = investmentWithPurchase;
        result.message = `Successfully added investment: ${name}`;
      }
      
      saveData(KEYS.INVESTMENTS, investments);
      
      FinancialCalculationEngine.Logger.log(
        LOG_CATEGORIES.UI_ACTION,
        'addInvestment_complete',
        { 
          investmentId: result.data.id,
          category,
          initialAmount: Number(initialAmount),
          purchaseCount: result.data.purchases.length
        }
      );
      
      return result;
    } catch (error) {
      FinancialCalculationEngine.Logger.error('addInvestment', error, { investmentData });
      return {
        success: false,
        data: null,
        message: error.message || 'Failed to add investment',
        isExistingInvestment: false
      };
    }
  }
  
  /**
   * Add a purchase to an existing investment
   */
  async addPurchaseToInvestment(investmentId, purchaseData) {
    try {
      const investments = this.getAllInvestments();
      const investmentIndex = investments.findIndex(inv => inv.id === investmentId);
      
      if (investmentIndex === -1) {
        throw new Error('Investment not found');
      }
      
      const investment = investments[investmentIndex];
      
      // For crypto, get price for the purchase date
      if (investment.category === INVESTMENT_CATEGORIES.CRYPTOCURRENCY && investment.coinId) {
        const isHistoricalDate = new Date(purchaseData.investmentDate) < new Date(Date.now() - 24 * 60 * 60 * 1000);
        
        let priceData;
        if (isHistoricalDate) {
          priceData = await this.cryptoService.getHistoricalPrice(investment.coinId, purchaseData.investmentDate);
        } else {
          priceData = await this.cryptoService.getCoinPrice(investment.coinId);
        }
        
        if (!priceData || !priceData.usd) {
          throw new Error('Could not fetch price data for the purchase date');
        }
        
        const tokensAcquired = purchaseData.amountInvested / priceData.usd;
        
        purchaseData.tokensAcquired = tokensAcquired;
        purchaseData.pricePerTokenUSD = priceData.usd;
      }
      
      const updatedInvestment = InvestmentSchemaFactory.addPurchaseToInvestment(investment, purchaseData);
      investments[investmentIndex] = updatedInvestment;
      
      saveData(KEYS.INVESTMENTS, investments);
      
      FinancialCalculationEngine.Logger.log(
        LOG_CATEGORIES.UI_ACTION,
        'addPurchaseToInvestment',
        { 
          investmentId,
          purchaseAmount: purchaseData.amountInvested,
          newPurchaseCount: updatedInvestment.purchases.length
        }
      );
      
      return updatedInvestment;
    } catch (error) {
      FinancialCalculationEngine.Logger.error('addPurchaseToInvestment', error, { investmentId, purchaseData });
      throw error;
    }
  }
  
  /**
   * Update investment metadata (name, category, etc.) - NOT values
   */
  updateInvestmentMetadata(investmentId, metadataUpdates) {
    try {
      const investments = this.getAllInvestments();
      const investmentIndex = investments.findIndex(inv => inv.id === investmentId);
      
      if (investmentIndex === -1) {
        throw new Error('Investment not found');
      }
      
      // Only allow safe metadata updates
      const allowedUpdates = ['name'];
      const safeUpdates = {};
      
      for (const [key, value] of Object.entries(metadataUpdates)) {
        if (allowedUpdates.includes(key)) {
          safeUpdates[key] = value;
        }
      }
      
      investments[investmentIndex] = {
        ...investments[investmentIndex],
        ...safeUpdates,
        updatedAt: new Date().toISOString()
      };
      
      saveData(KEYS.INVESTMENTS, investments);
      
      FinancialCalculationEngine.Logger.log(
        LOG_CATEGORIES.UI_ACTION,
        'updateInvestmentMetadata',
        { investmentId, updates: safeUpdates }
      );
      
      return investments[investmentIndex];
    } catch (error) {
      FinancialCalculationEngine.Logger.error('updateInvestmentMetadata', error, { investmentId, metadataUpdates });
      throw error;
    }
  }
  
  /**
   * Delete an investment
   */
  deleteInvestment(investmentId) {
    try {
      const investments = this.getAllInvestments();
      const filteredInvestments = investments.filter(inv => inv.id !== investmentId);
      
      if (filteredInvestments.length === investments.length) {
        throw new Error('Investment not found');
      }
      
      saveData(KEYS.INVESTMENTS, filteredInvestments);
      
      FinancialCalculationEngine.Logger.log(
        LOG_CATEGORIES.UI_ACTION,
        'deleteInvestment',
        { investmentId, remainingCount: filteredInvestments.length }
      );
      
      return true;
    } catch (error) {
      FinancialCalculationEngine.Logger.error('deleteInvestment', error, { investmentId });
      throw error;
    }
  }
  
  /**
   * Delete a specific purchase from an investment
   */
  deletePurchase(investmentId, purchaseId) {
    try {
      const investments = this.getAllInvestments();
      const investmentIndex = investments.findIndex(inv => inv.id === investmentId);
      
      if (investmentIndex === -1) {
        throw new Error('Investment not found');
      }
      
      const investment = investments[investmentIndex];
      const updatedPurchases = investment.purchases.filter(p => p.id !== purchaseId);
      
      if (updatedPurchases.length === investment.purchases.length) {
        throw new Error('Purchase not found');
      }
      
      const updatedInvestment = {
        ...investment,
        purchases: updatedPurchases
      };
      
      // Recalculate totals
      const finalInvestment = InvestmentSchemaFactory.recalculateInvestmentTotals(updatedInvestment);
      investments[investmentIndex] = finalInvestment;
      
      saveData(KEYS.INVESTMENTS, investments);
      
      FinancialCalculationEngine.Logger.log(
        LOG_CATEGORIES.UI_ACTION,
        'deletePurchase',
        { 
          investmentId, 
          purchaseId,
          remainingPurchases: finalInvestment.purchases.length
        }
      );
      
      return finalInvestment;
    } catch (error) {
      FinancialCalculationEngine.Logger.error('deletePurchase', error, { investmentId, purchaseId });
      throw error;
    }
  }
  
  /**
   * Update cryptocurrency prices
   */
  async updateCryptoPrices() {
    try {
      const investments = this.getAllInvestments();
      const cryptoInvestments = investments.filter(inv => 
        inv.category === INVESTMENT_CATEGORIES.CRYPTOCURRENCY && inv.coinId
      );
      
      if (cryptoInvestments.length === 0) {
        return [];
      }
      
      const coinIds = cryptoInvestments.map(inv => inv.coinId);
      const priceData = await this.cryptoService.batchUpdatePrices(coinIds);
      
      const updatedInvestments = cryptoInvestments.map(investment => {
        const prices = priceData[investment.coinId];
        
        if (prices) {
          const updatedInvestment = {
            ...investment,
            currentPriceUSD: prices.usd || investment.currentPriceUSD,
            lastPriceUpdate: new Date().toISOString()
          };
          
          // Recalculate market values with new prices
          return InvestmentSchemaFactory.recalculateInvestmentTotals(updatedInvestment);
        }
        
        return investment;
      });
      
      // Update the investments array
      updatedInvestments.forEach(updatedInv => {
        const index = investments.findIndex(inv => inv.id === updatedInv.id);
        if (index !== -1) {
          investments[index] = updatedInv;
        }
      });
      
      saveData(KEYS.INVESTMENTS, investments);
      
      FinancialCalculationEngine.Logger.log(
        LOG_CATEGORIES.API,
        'updateCryptoPrices_complete',
        { 
          cryptoCount: cryptoInvestments.length,
          updatedCount: updatedInvestments.length,
          priceDataKeys: Object.keys(priceData)
        }
      );
      
      return updatedInvestments;
    } catch (error) {
      FinancialCalculationEngine.Logger.error('updateCryptoPrices', error);
      return [];
    }
  }
  
  /**
   * Get investment statistics
   */
  getInvestmentStatistics() {
    try {
      const investments = this.getAllInvestments();
      
      const stats = FinancialCalculationEngine.PurchaseCalculator.calculatePortfolioPerformance(investments);
      
      FinancialCalculationEngine.Logger.log(
        LOG_CATEGORIES.CALCULATION,
        'getInvestmentStatistics',
        { investmentCount: investments.length, stats }
      );
      
      return {
        count: investments.length,
        totalInvested: stats.totalInvested,
        totalCurrent: stats.totalCurrentValue,
        totalReturns: stats.totalUnrealizedGains,
        averageReturn: stats.totalUnrealizedGainPercentage,
        profitable: stats.profitableInvestments,
        unprofitable: stats.unprofitableInvestments
      };
    } catch (error) {
      FinancialCalculationEngine.Logger.error('getInvestmentStatistics', error);
      return {
        count: 0,
        totalInvested: 0,
        totalCurrent: 0,
        totalReturns: 0,
        averageReturn: 0,
        profitable: 0,
        unprofitable: 0
      };
    }
  }
  
  /**
   * Get detailed investment performance with purchase breakdown
   */
  getInvestmentDetails(investmentId) {
    try {
      const investments = this.getAllInvestments();
      const investment = investments.find(inv => inv.id === investmentId);
      
      if (!investment) {
        throw new Error('Investment not found');
      }
      
      // Calculate detailed performance for each purchase
      const currentPrice = investment.currentPriceUSD || 0;
      
      const detailedPerformance = FinancialCalculationEngine.PurchaseCalculator.calculateInvestmentPerformance(
        investment.purchases,
        currentPrice
      );
      
      FinancialCalculationEngine.Logger.log(
        LOG_CATEGORIES.UI_ACTION,
        'getInvestmentDetails',
        { investmentId, purchaseCount: investment.purchases.length }
      );
      
      return {
        ...investment,
        detailedPerformance
      };
    } catch (error) {
      FinancialCalculationEngine.Logger.error('getInvestmentDetails', error, { investmentId });
      throw error;
    }
  }
  
  /**
   * Search cryptocurrencies
   */
  async searchCryptocurrencies(query) {
    return await this.cryptoService.searchCryptoCoins(query);
  }
  
  /**
   * Get historical price chart data
   */
  async getPriceHistory(coinId, days = 30) {
    return await this.cryptoService.getCoinMarketChart(coinId, days);
  }
  
  /**
   * Fix existing investments by recalculating totals
   */
  fixExistingInvestments() {
    try {
      const investments = this.getAllInvestments();
      let needsUpdate = false;
      
      const fixedInvestments = investments.map(investment => {
        // Recalculate totals for all investments
        const recalculated = InvestmentSchemaFactory.recalculateInvestmentTotals(investment);
        
        // Check if anything changed
        if (investment.totalTokens !== recalculated.totalTokens || 
            investment.currentMarketValue !== recalculated.currentMarketValue) {
          needsUpdate = true;
          console.log(`Fixed investment ${investment.name}: tokens ${investment.totalTokens} → ${recalculated.totalTokens}`);
        }
        
        return recalculated;
      });
      
      if (needsUpdate) {
        saveData(KEYS.INVESTMENTS, fixedInvestments);
        console.log('Investment data fixed and saved');
      }
    } catch (error) {
      console.error('Error fixing investments:', error);
    }
  }
} 