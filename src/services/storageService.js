/**
 * Storage Service for managing localStorage operations
 */

// Keys para el almacenamiento local
export const KEYS = {
  TRANSACTIONS: 'zave_transactions',
  CATEGORIES: 'zave_categories',
  GOALS: 'zave_goals',
  INVESTMENTS: 'zave_investments',
  AUTOMATED_TRANSACTIONS: 'zave_automated_transactions',
  USER_SETTINGS: 'zave_settings'
};

/**
 * Get data from localStorage
 * @param {string} key - Storage key to retrieve
 * @param {any} defaultValue - Default value if key doesn't exist
 * @returns {any} Parsed data from localStorage
 */
export const getData = (key, defaultValue = null) => {
  try {
    const data = localStorage.getItem(key);
    return data ? JSON.parse(data) : defaultValue;
  } catch (error) {
    console.error('Error retrieving data:', error);
    return defaultValue;
  }
};

/**
 * Save data to localStorage
 * @param {string} key - Storage key to save under
 * @param {any} data - Data to serialize and save
 * @returns {boolean} Success status
 */
export const saveData = (key, data) => {
  try {
    localStorage.setItem(key, JSON.stringify(data));
    return true;
  } catch (error) {
    console.error('Error saving data:', error);
    return false;
  }
};

/**
 * Initialize all storage with default values if not present
 */
export const initializeStorage = () => {
  if (!getData(KEYS.TRANSACTIONS)) {
    saveData(KEYS.TRANSACTIONS, []);
  }
  
  if (!getData(KEYS.INVESTMENTS)) {
    saveData(KEYS.INVESTMENTS, []);
  }
  
  if (!getData(KEYS.GOALS)) {
    saveData(KEYS.GOALS, []);
  }
  
  if (!getData(KEYS.AUTOMATED_TRANSACTIONS)) {
    saveData(KEYS.AUTOMATED_TRANSACTIONS, []);
  }
  
  if (!getData(KEYS.USER_SETTINGS)) {
    saveData(KEYS.USER_SETTINGS, {
      currency: '€',
      theme: 'light',
      locale: 'es-ES'
    });
  }
};

// Eliminar datos de localStorage
export const removeData = (key) => {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.error('Error removing data:', error);
    return false;
  }
};

// Limpiar todos los datos de localStorage
export const clearAllData = () => {
  try {
    Object.values(KEYS).forEach(key => localStorage.removeItem(key));
    return true;
  } catch (error) {
    console.error('Error clearing all data:', error);
    return false;
  }
}; 