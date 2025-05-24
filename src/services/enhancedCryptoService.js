/**
 * Enhanced Cryptocurrency Service
 * 
 * Provides intelligent caching, rate limiting, historical price fetching,
 * and robust error handling for cryptocurrency data.
 */

import { FinancialCalculationEngine, LOG_CATEGORIES } from './financialCalculationEngine.js';

const COINGECKO_API_BASE_URL = 'https://api.coingecko.com/api/v3';
const CACHE_PREFIX = 'crypto_cache_';
const CACHE_DURATION = {
  CURRENT_PRICES: 60 * 60 * 1000, // 1 hour
  HISTORICAL_PRICES: 24 * 60 * 60 * 1000, // 24 hours
  COIN_SEARCH: 30 * 60 * 1000, // 30 minutes
  RATE_LIMIT: 60 * 1000 // 1 minute rate limit window
};

/**
 * Intelligent cache system for API data
 */
class CryptoCache {
  constructor() {
    this.memoryCache = new Map();
    this.rateLimitTracker = new Map();
  }
  
  /**
   * Generate cache key
   */
  generateKey(endpoint, params = {}) {
    const sortedParams = Object.keys(params).sort().map(key => `${key}=${params[key]}`).join('&');
    return `${CACHE_PREFIX}${endpoint}_${sortedParams}`;
  }
  
  /**
   * Get cached data if valid
   */
  get(key) {
    // Try memory cache first
    const memoryData = this.memoryCache.get(key);
    if (memoryData && Date.now() < memoryData.expiry) {
      FinancialCalculationEngine.Logger.log(
        LOG_CATEGORIES.API,
        'cache_hit_memory',
        { key, age: Date.now() - memoryData.cached }
      );
      return memoryData.data;
    }
    
    // Try localStorage
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsedData = JSON.parse(stored);
        if (Date.now() < parsedData.expiry) {
          // Restore to memory cache
          this.memoryCache.set(key, parsedData);
          FinancialCalculationEngine.Logger.log(
            LOG_CATEGORIES.API,
            'cache_hit_storage',
            { key, age: Date.now() - parsedData.cached }
          );
          return parsedData.data;
        } else {
          // Clean expired data
          localStorage.removeItem(key);
        }
      }
    } catch (error) {
      FinancialCalculationEngine.Logger.error('cache_get_error', error, { key });
    }
    
    return null;
  }
  
  /**
   * Store data in cache
   */
  set(key, data, duration = CACHE_DURATION.CURRENT_PRICES) {
    const cacheData = {
      data,
      cached: Date.now(),
      expiry: Date.now() + duration
    };
    
    // Store in memory
    this.memoryCache.set(key, cacheData);
    
    // Store in localStorage
    try {
      localStorage.setItem(key, JSON.stringify(cacheData));
      FinancialCalculationEngine.Logger.log(
        LOG_CATEGORIES.API,
        'cache_set',
        { key, duration, dataSize: JSON.stringify(data).length }
      );
    } catch (error) {
      FinancialCalculationEngine.Logger.error('cache_set_error', error, { key });
    }
  }
  
  /**
   * Check rate limit
   */
  checkRateLimit(endpoint) {
    const now = Date.now();
    const key = `rateLimit_${endpoint}`;
    const lastCall = this.rateLimitTracker.get(key) || 0;
    
    if (now - lastCall < CACHE_DURATION.RATE_LIMIT) {
      return false; // Rate limited
    }
    
    this.rateLimitTracker.set(key, now);
    return true;
  }
  
  /**
   * Clear expired cache entries
   */
  cleanup() {
    const now = Date.now();
    
    // Clean memory cache
    for (const [key, data] of this.memoryCache.entries()) {
      if (now >= data.expiry) {
        this.memoryCache.delete(key);
      }
    }
    
    // Clean localStorage cache
    try {
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (key && key.startsWith(CACHE_PREFIX)) {
          try {
            const data = JSON.parse(localStorage.getItem(key));
            if (now >= data.expiry) {
              localStorage.removeItem(key);
            }
          } catch (error) {
            // Remove corrupted cache entries
            localStorage.removeItem(key);
          }
        }
      }
    } catch (error) {
      FinancialCalculationEngine.Logger.error('cache_cleanup_error', error);
    }
  }
}

/**
 * Enhanced HTTP client with retry logic
 */
class RobustHttpClient {
  static async fetchWithRetry(url, options = {}, maxRetries = 3) {
    const startTime = performance.now();
    
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        FinancialCalculationEngine.Logger.log(
          LOG_CATEGORIES.API,
          'api_request_attempt',
          { url, attempt, maxRetries }
        );
        
        const response = await fetch(url, {
          ...options,
          headers: {
            'Accept': 'application/json',
            ...options.headers
          }
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        const endTime = performance.now();
        
        FinancialCalculationEngine.Logger.log(
          LOG_CATEGORIES.API,
          'api_request_success',
          { url, attempt, performanceMs: endTime - startTime }
        );
        
        return data;
      } catch (error) {
        const isLastAttempt = attempt === maxRetries;
        
        FinancialCalculationEngine.Logger.log(
          LOG_CATEGORIES.API,
          'api_request_error',
          { 
            url, 
            attempt, 
            maxRetries, 
            error: error.message,
            willRetry: !isLastAttempt
          }
        );
        
        if (isLastAttempt) {
          throw error;
        }
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }
}

/**
 * Enhanced Cryptocurrency Service
 */
export class EnhancedCryptoService {
  constructor() {
    this.cache = new CryptoCache();
    
    // Auto-cleanup cache every hour
    setInterval(() => this.cache.cleanup(), 60 * 60 * 1000);
  }
  
  /**
   * Search for cryptocurrencies with caching
   */
  async searchCryptoCoins(query) {
    try {
      if (!query || query.trim().length < 2) {
        return [];
      }
      
      const cacheKey = this.cache.generateKey('search', { query: query.toLowerCase() });
      const cached = this.cache.get(cacheKey);
      
      if (cached) {
        return cached;
      }
      
      if (!this.cache.checkRateLimit('search')) {
        FinancialCalculationEngine.Logger.log(
          LOG_CATEGORIES.API,
          'rate_limited',
          { endpoint: 'search', query }
        );
        return cached || []; // Return stale data if available
      }
      
      const url = `${COINGECKO_API_BASE_URL}/search?query=${encodeURIComponent(query)}`;
      const data = await RobustHttpClient.fetchWithRetry(url);
      
      const results = data.coins || [];
      this.cache.set(cacheKey, results, CACHE_DURATION.COIN_SEARCH);
      
      return results;
    } catch (error) {
      FinancialCalculationEngine.Logger.error('searchCryptoCoins', error, { query });
      return [];
    }
  }
  
  /**
   * Get current price for a cryptocurrency with caching
   */
  async getCoinPrice(coinId) {
    try {
      const cacheKey = this.cache.generateKey('price', { coinId });
      const cached = this.cache.get(cacheKey);
      
      if (cached) {
        return cached;
      }
      
      if (!this.cache.checkRateLimit('price')) {
        FinancialCalculationEngine.Logger.log(
          LOG_CATEGORIES.API,
          'rate_limited',
          { endpoint: 'price', coinId }
        );
        return cached; // Return stale data if available
      }
      
      const url = `${COINGECKO_API_BASE_URL}/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`;
      const data = await RobustHttpClient.fetchWithRetry(url);
      
      const priceData = data[coinId];
      if (!priceData) {
        throw new Error(`No price data found for ${coinId}`);
      }
      
      // Add metadata
      const enrichedData = {
        ...priceData,
        lastUpdated: new Date().toISOString(),
        coinId
      };
      
      this.cache.set(cacheKey, enrichedData, CACHE_DURATION.CURRENT_PRICES);
      
      return enrichedData;
    } catch (error) {
      FinancialCalculationEngine.Logger.error('getCoinPrice', error, { coinId });
      
      // Try to return stale cached data as fallback
      const cacheKey = this.cache.generateKey('price', { coinId });
      const staleData = this.cache.get(cacheKey);
      if (staleData) {
        FinancialCalculationEngine.Logger.log(
          LOG_CATEGORIES.API,
          'fallback_to_stale_data',
          { coinId, staleAge: Date.now() - new Date(staleData.lastUpdated).getTime() }
        );
        return staleData;
      }
      
      return null;
    }
  }
  
  /**
   * Get historical price for a specific date
   */
  async getHistoricalPrice(coinId, date) {
    try {
      // Convert date to DD-MM-YYYY format required by CoinGecko
      const dateObj = new Date(date);
      const day = dateObj.getDate().toString().padStart(2, '0');
      const month = (dateObj.getMonth() + 1).toString().padStart(2, '0');
      const year = dateObj.getFullYear();
      const dateStr = `${day}-${month}-${year}`;
      
      const cacheKey = this.cache.generateKey('historical', { coinId, date: dateStr });
      const cached = this.cache.get(cacheKey);
      
      if (cached) {
        FinancialCalculationEngine.Logger.log(
          LOG_CATEGORIES.API,
          'cache_hit_historical',
          { coinId, date: dateStr }
        );
        return cached;
      }
      
      if (!this.cache.checkRateLimit('historical')) {
        FinancialCalculationEngine.Logger.log(
          LOG_CATEGORIES.API,
          'rate_limited',
          { endpoint: 'historical', coinId, date: dateStr }
        );
        return cached;
      }
      
      const url = `${COINGECKO_API_BASE_URL}/coins/${coinId}/history?date=${dateStr}`;
      
      FinancialCalculationEngine.Logger.log(
        LOG_CATEGORIES.API,
        'fetching_historical_price',
        { coinId, date: dateStr, url }
      );
      
      const data = await RobustHttpClient.fetchWithRetry(url);
      
      const priceData = {
        usd: data.market_data?.current_price?.usd || 0,
        usd_24h_change: data.market_data?.price_change_percentage_24h || 0,
        last_updated: data.last_updated || new Date().toISOString()
      };
      
      FinancialCalculationEngine.Logger.log(
        LOG_CATEGORIES.API,
        'historical_price_fetched',
        { coinId, date: dateStr, priceUSD: priceData.usd }
      );
      
      this.cache.set(cacheKey, priceData, CACHE_DURATION.HISTORICAL_PRICES);
      
      return priceData;
    } catch (error) {
      FinancialCalculationEngine.Logger.error('getHistoricalPrice', error, { coinId, date });
      return null;
    }
  }
  
  /**
   * Get price chart data with caching
   */
  async getCoinMarketChart(coinId, days = 30, currency = 'usd') {
    try {
      const cacheKey = this.cache.generateKey('chart', { coinId, days, currency });
      const cached = this.cache.get(cacheKey);
      
      if (cached) {
        return cached;
      }
      
      if (!this.cache.checkRateLimit('chart')) {
        FinancialCalculationEngine.Logger.log(
          LOG_CATEGORIES.API,
          'rate_limited',
          { endpoint: 'chart', coinId, days, currency }
        );
        return cached;
      }
      
      const url = `${COINGECKO_API_BASE_URL}/coins/${coinId}/market_chart?vs_currency=${currency}&days=${days}`;
      const data = await RobustHttpClient.fetchWithRetry(url);
      
      const chartData = {
        coinId,
        currency,
        days,
        prices: data.prices || [],
        lastUpdated: new Date().toISOString()
      };
      
      // Cache for different durations based on the data range
      const cacheDuration = days <= 7 ? CACHE_DURATION.CURRENT_PRICES : CACHE_DURATION.HISTORICAL_PRICES;
      this.cache.set(cacheKey, chartData, cacheDuration);
      
      return chartData;
    } catch (error) {
      FinancialCalculationEngine.Logger.error('getCoinMarketChart', error, { coinId, days, currency });
      return null;
    }
  }
  
  /**
   * Batch update multiple cryptocurrency prices
   */
  async batchUpdatePrices(coinIds) {
    try {
      if (!coinIds || coinIds.length === 0) {
        return {};
      }
      
      const uniqueCoinIds = [...new Set(coinIds)];
      const prices = {};
      const uncachedIds = [];
      
      // Check cache for each coin
      for (const coinId of uniqueCoinIds) {
        const cacheKey = this.cache.generateKey('price', { coinId });
        const cached = this.cache.get(cacheKey);
        
        if (cached) {
          prices[coinId] = cached;
        } else {
          uncachedIds.push(coinId);
        }
      }
      
      // Fetch uncached prices in batches
      if (uncachedIds.length > 0) {
        const batchSize = 50; // CoinGecko limit
        
        for (let i = 0; i < uncachedIds.length; i += batchSize) {
          const batch = uncachedIds.slice(i, i + batchSize);
          
          try {
            const url = `${COINGECKO_API_BASE_URL}/simple/price?ids=${batch.join(',')}&vs_currencies=usd&include_24hr_change=true`;
            const batchData = await RobustHttpClient.fetchWithRetry(url);
            
            for (const [coinId, priceData] of Object.entries(batchData)) {
              const enrichedData = {
                ...priceData,
                lastUpdated: new Date().toISOString(),
                coinId
              };
              
              prices[coinId] = enrichedData;
              
              // Cache individual results
              const cacheKey = this.cache.generateKey('price', { coinId });
              this.cache.set(cacheKey, enrichedData, CACHE_DURATION.CURRENT_PRICES);
            }
          } catch (error) {
            FinancialCalculationEngine.Logger.error('batchUpdatePrices_batch', error, { batch });
          }
          
          // Small delay between batches to respect rate limits
          if (i + batchSize < uncachedIds.length) {
            await new Promise(resolve => setTimeout(resolve, 1000));
          }
        }
      }
      
      FinancialCalculationEngine.Logger.log(
        LOG_CATEGORIES.API,
        'batchUpdatePrices_complete',
        { 
          totalCoins: uniqueCoinIds.length,
          cachedCoins: uniqueCoinIds.length - uncachedIds.length,
          fetchedCoins: uncachedIds.length,
          successfulFetches: Object.keys(prices).length
        }
      );
      
      return prices;
    } catch (error) {
      FinancialCalculationEngine.Logger.error('batchUpdatePrices', error, { coinIds });
      return {};
    }
  }
  
  /**
   * Force refresh cache for a specific coin
   */
  async forceRefreshPrice(coinId) {
    try {
      // Clear existing cache
      const cacheKey = this.cache.generateKey('price', { coinId });
      this.cache.memoryCache.delete(cacheKey);
      
      try {
        localStorage.removeItem(cacheKey);
      } catch (error) {
        // Ignore localStorage errors
      }
      
      // Fetch fresh data
      return await this.getCoinPrice(coinId);
    } catch (error) {
      FinancialCalculationEngine.Logger.error('forceRefreshPrice', error, { coinId });
      return null;
    }
  }
  
  /**
   * Clear all cache data
   */
  clearAllCache() {
    try {
      // Clear memory cache
      this.cache.memoryCache.clear();
      
      // Clear localStorage cache
      const keysToRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(CACHE_PREFIX)) {
          keysToRemove.push(key);
        }
      }
      
      keysToRemove.forEach(key => localStorage.removeItem(key));
      
      FinancialCalculationEngine.Logger.log(
        LOG_CATEGORIES.API,
        'cache_cleared',
        { clearedKeys: keysToRemove.length }
      );
      
      return { success: true, clearedKeys: keysToRemove.length };
    } catch (error) {
      FinancialCalculationEngine.Logger.error('clearAllCache', error);
      return { success: false, error: error.message };
    }
  }
  
  /**
   * Get cache statistics
   */
  getCacheStats() {
    const memoryEntries = this.cache.memoryCache.size;
    let storageEntries = 0;
    let storageSize = 0;
    
    try {
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(CACHE_PREFIX)) {
          storageEntries++;
          storageSize += localStorage.getItem(key).length;
        }
      }
    } catch (error) {
      // Ignore localStorage errors
    }
    
    return {
      memoryEntries,
      storageEntries,
      storageSizeBytes: storageSize,
      rateLimitTrackers: this.cache.rateLimitTracker.size
    };
  }
} 