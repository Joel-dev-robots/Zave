import { getData, saveData, KEYS } from './storageService';
import { addTransaction } from './transactionService';

// Crear una nueva automatización de transacción
export const createAutomatedTransaction = (data) => {
  const automatedTransactions = getData(KEYS.AUTOMATED_TRANSACTIONS, []);
  
  const newAutomation = {
    id: Date.now().toString(),
    name: data.name,
    amount: parseFloat(data.amount),
    type: data.type, // 'income' o 'expense'
    category: data.category,
    active: true,
    ...data
  };
  
  automatedTransactions.push(newAutomation);
  saveData(KEYS.AUTOMATED_TRANSACTIONS, automatedTransactions);
  
  return newAutomation;
};

// Actualizar los datos de una automatización
export const updateAutomatedTransaction = (id, updates) => {
  const automatedTransactions = getData(KEYS.AUTOMATED_TRANSACTIONS, []);
  const index = automatedTransactions.findIndex(at => at.id === id);
  
  if (index !== -1) {
    automatedTransactions[index] = { ...automatedTransactions[index], ...updates };
    saveData(KEYS.AUTOMATED_TRANSACTIONS, automatedTransactions);
    return automatedTransactions[index];
  }
  
  return null;
};

// Eliminar una automatización
export const deleteAutomatedTransaction = (id) => {
  const automatedTransactions = getData(KEYS.AUTOMATED_TRANSACTIONS, []);
  const updatedList = automatedTransactions.filter(at => at.id !== id);
  
  saveData(KEYS.AUTOMATED_TRANSACTIONS, updatedList);
  return updatedList;
};

// Procesar las transacciones automáticas
export const processAutomatedTransactions = () => {
  const automatedTransactions = getData(KEYS.AUTOMATED_TRANSACTIONS, []);
  const processedTransactions = [];
  
  automatedTransactions.forEach(auto => {
    if (!auto.active) return;
    
    // Crear la transacción
    const transaction = {
      date: new Date().toISOString().slice(0, 10),
      amount: auto.amount,
      description: auto.name,
      category: auto.category,
      type: auto.type,
      automated: true,
      automationId: auto.id
    };
    
    // Añadir la transacción
    addTransaction(transaction);
    processedTransactions.push(transaction);
  });
  
  return processedTransactions;
};

// Obtener todas las automatizaciones
export const getAllAutomatedTransactions = () => {
  return getData(KEYS.AUTOMATED_TRANSACTIONS, []);
};

// Obtener automatizaciones por tipo (income/expense)
export const getAutomatedTransactionsByType = (type) => {
  const automatedTransactions = getData(KEYS.AUTOMATED_TRANSACTIONS, []);
  return automatedTransactions.filter(at => at.type === type);
};

// Activar/desactivar una automatización
export const toggleAutomatedTransaction = (id) => {
  const automatedTransactions = getData(KEYS.AUTOMATED_TRANSACTIONS, []);
  const index = automatedTransactions.findIndex(at => at.id === id);
  
  if (index !== -1) {
    automatedTransactions[index].active = !automatedTransactions[index].active;
    saveData(KEYS.AUTOMATED_TRANSACTIONS, automatedTransactions);
    return automatedTransactions[index];
  }
  
  return null;
};

// Para mantener compatibilidad con el código existente
export const FREQUENCY = {
  MONTHLY: 'monthly',
  WEEKLY: 'weekly',
  BIWEEKLY: 'biweekly',
  QUARTERLY: 'quarterly',
  YEARLY: 'yearly',
}; 