import { getData, saveData, KEYS } from './storageService';

// Default categories
const DEFAULT_CATEGORIES = {
  income: [
    'Salary',
    'Freelance',
    'Investments',
    'Gift',
    'Other'
  ],
  expense: [
    'Food',
    'Housing',
    'Transportation',
    'Entertainment',
    'Health',
    'Education',
    'Shopping',
    'Utilities',
    'Travel',
    'Other'
  ]
};

/**
 * Get user settings
 * @returns {Object} User settings
 */
export const getSettings = () => {
  const settings = getData(KEYS.USER_SETTINGS);
  
  if (!settings) {
    // Initialize settings with defaults if not present
    const defaultSettings = {
      currency: '€',
      theme: 'light',
      locale: 'es-ES',
      categories: DEFAULT_CATEGORIES
    };
    saveData(KEYS.USER_SETTINGS, defaultSettings);
    return defaultSettings;
  }
  
  // Ensure categories exist
  if (!settings.categories) {
    settings.categories = DEFAULT_CATEGORIES;
    saveData(KEYS.USER_SETTINGS, settings);
  }
  
  return settings;
};

/**
 * Save user settings
 * @param {Object} settings - Updated settings object
 */
export const saveSettings = (settings) => {
  return saveData(KEYS.USER_SETTINGS, settings);
};

/**
 * Get transaction categories
 * @returns {Object} Object with income and expense categories
 */
export const getCategories = () => {
  const settings = getSettings();
  return settings.categories || DEFAULT_CATEGORIES;
};

/**
 * Save transaction categories
 * @param {Object} categories - Object with income and expense categories
 */
export const saveCategories = (categories) => {
  const settings = getSettings();
  settings.categories = categories;
  return saveData(KEYS.USER_SETTINGS, settings);
};

/**
 * Add a new category
 * @param {string} type - Category type: 'income' or 'expense'
 * @param {string} category - New category name
 */
export const addCategory = (type, category) => {
  if (type !== 'income' && type !== 'expense') {
    throw new Error('Invalid category type. Must be income or expense.');
  }
  
  const settings = getSettings();
  const categories = settings.categories || DEFAULT_CATEGORIES;
  
  if (!categories[type].includes(category)) {
    categories[type].push(category);
    settings.categories = categories;
    saveData(KEYS.USER_SETTINGS, settings);
  }
  
  return categories;
};

/**
 * Remove a category
 * @param {string} type - Category type: 'income' or 'expense'
 * @param {string} category - Category name to remove
 */
export const removeCategory = (type, category) => {
  if (type !== 'income' && type !== 'expense') {
    throw new Error('Invalid category type. Must be income or expense.');
  }
  
  const settings = getSettings();
  const categories = settings.categories || DEFAULT_CATEGORIES;
  
  categories[type] = categories[type].filter(c => c !== category);
  settings.categories = categories;
  saveData(KEYS.USER_SETTINGS, settings);
  
  return categories;
};

// Initialize the settings
export const initializeSettings = () => {
  getSettings();
}; 