/**
 * Storage Service for managing localStorage operations
 */

// Storage keys
const KEYS = {
  TRANSACTIONS: 'zave_transactions',
  INVESTMENTS: 'zave_investments',
  GOALS: 'zave_goals',
  SETTINGS: 'zave_settings'
};

/**
 * Get data from localStorage
 * @param {string} key - Storage key to retrieve
 * @param {any} defaultValue - Default value if key doesn't exist
 * @returns {any} Parsed data from localStorage
 */
const getData = (key, defaultValue = null) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error(`Error retrieving data for key ${key}:`, error);
    return defaultValue;
  }
};

/**
 * Save data to localStorage
 * @param {string} key - Storage key to save under
 * @param {any} data - Data to serialize and save
 * @returns {boolean} Success status
 */
const saveData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error(`Error saving data for key ${key}:`, error);
    return false;
  }
};

/**
 * Initialize all storage with default values if not present
 */
const initializeStorage = () => {
  if (!getData(KEYS.TRANSACTIONS)) {
    saveData(KEYS.TRANSACTIONS, []);
  }
  
  if (!getData(KEYS.INVESTMENTS)) {
    saveData(KEYS.INVESTMENTS, []);
  }
  
  if (!getData(KEYS.GOALS)) {
    saveData(KEYS.GOALS, []);
  }
  
  if (!getData(KEYS.SETTINGS)) {
    saveData(KEYS.SETTINGS, {
      currency: '€',
      theme: 'light',
      categories: {
        income: ['Salary', 'Investments', 'Gifts', 'Other'],
        expense: ['Food', 'Housing', 'Transportation', 'Entertainment', 'Healthcare', 'Other']
      }
    });
  }
};

export {
  KEYS,
  getData,
  saveData,
  initializeStorage
}; 