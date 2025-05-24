/**
 * Service for CoinGecko API integration
 */

const COINGECKO_API_BASE_URL = 'https://api.coingecko.com/api/v3';

/**
 * Search for cryptocurrencies by query
 * @param {string} query - Search term
 * @returns {Promise<Array>} - Search results
 */
export const searchCryptoCoins = async (query) => {
  try {
    const response = await fetch(`${COINGECKO_API_BASE_URL}/search?query=${encodeURIComponent(query)}`);
    
    if (!response.ok) {
      throw new Error('CoinGecko API error: ' + response.status);
    }
    
    const data = await response.json();
    return data.coins || [];
  } catch (error) {
    console.error('Error searching for coins:', error);
    return [];
  }
};

/**
 * Get current price for a specific coin
 * @param {string} coinId - CoinGecko coin ID
 * @returns {Promise<Object>} - Price data
 */
export const getCoinPrice = async (coinId) => {
  try {
    const response = await fetch(
      `${COINGECKO_API_BASE_URL}/simple/price?ids=${coinId}&vs_currencies=usd&include_24hr_change=true`
    );
    const data = await response.json();
    
    if (!data[coinId]) {
      throw new Error(`Price data not found for ${coinId}`);
    }
    
    return data[coinId];
  } catch (error) {
    console.error('Error fetching coin price:', error);
    throw error;
  }
};

/**
 * Get detailed information about a coin
 * @param {string} coinId - CoinGecko coin ID
 * @returns {Promise<Object>} - Coin details
 */
export const getCoinDetails = async (coinId) => {
  try {
    const response = await fetch(
      `${COINGECKO_API_BASE_URL}/coins/${coinId}?localization=false&tickers=false&market_data=true&community_data=false&developer_data=false`
    );
    
    if (!response.ok) {
      throw new Error('CoinGecko API error: ' + response.status);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching coin details:', error);
    return null;
  }
};

/**
 * Get historical market data for a coin
 * @param {string} coinId - Coin ID
 * @param {number} days - Number of days
 * @param {string} currency - Currency (default: usd)
 * @returns {Promise<Object>} Market chart data
 */
export const getCoinMarketChart = async (coinId, days = 30, currency = 'usd') => {
  try {
    const response = await fetch(
      `${COINGECKO_API_BASE_URL}/coins/${coinId}/market_chart?vs_currency=${currency}&days=${days}`
    );
    
    if (!response.ok) {
      throw new Error('CoinGecko API error: ' + response.status);
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching market chart:', error);
    return null;
  }
}; 