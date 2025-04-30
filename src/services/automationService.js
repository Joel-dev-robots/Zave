import { getData, saveData, KEYS } from './storageService';
import { addTransaction } from './transactionService';
import { addDays, addWeeks, addMonths, addYears, isBefore } from 'date-fns';

// Constantes de frecuencia
export const FREQUENCY = {
  DAILY: 'daily',
  WEEKLY: 'weekly',
  BIWEEKLY: 'biweekly',
  MONTHLY: 'monthly',
  QUARTERLY: 'quarterly',
  YEARLY: 'yearly',
};

// Crear una nueva automatización de transacción
export const createAutomatedTransaction = (data) => {
  const automatedTransactions = getData(KEYS.AUTOMATED_TRANSACTIONS, []);
  
  // Asegurarnos de que tenemos una frecuencia y fecha válidas
  const frequency = data.frequency || FREQUENCY.MONTHLY;
  const startDate = data.startDate || new Date().toISOString().slice(0, 10);
  
  const newAutomation = {
    id: Date.now().toString(),
    name: data.name,
    amount: parseFloat(data.amount),
    type: data.type, // 'income' o 'expense'
    category: data.category,
    active: true,
    frequency: frequency,
    startDate: startDate,
    lastExecuted: null, // Nueva propiedad para rastrear la última ejecución
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

// Calcular la próxima fecha de ejecución basada en la frecuencia
const getNextExecutionDate = (lastDate, frequency) => {
  const date = new Date(lastDate);
  
  switch (frequency) {
    case FREQUENCY.DAILY:
      return addDays(date, 1);
    case FREQUENCY.WEEKLY:
      return addWeeks(date, 1);
    case FREQUENCY.BIWEEKLY:
      return addWeeks(date, 2);
    case FREQUENCY.MONTHLY:
      return addMonths(date, 1);
    case FREQUENCY.QUARTERLY:
      return addMonths(date, 3);
    case FREQUENCY.YEARLY:
      return addYears(date, 1);
    default:
      return addMonths(date, 1); // Mensual por defecto
  }
};

// Verificar si una automatización debe ejecutarse hoy
const shouldExecuteToday = (automation) => {
  if (!automation.active) return false;
  
  const today = new Date();
  const startDate = new Date(automation.startDate);
  
  // Si nunca se ha ejecutado y la fecha de inicio es hoy o antes
  if (!automation.lastExecuted && isBefore(startDate, today)) {
    return true;
  }
  
  // Si ya se ha ejecutado, verificar si es tiempo de ejecutarla nuevamente
  if (automation.lastExecuted) {
    const lastExecuted = new Date(automation.lastExecuted);
    const nextExecution = getNextExecutionDate(lastExecuted, automation.frequency);
    return isBefore(nextExecution, today);
  }
  
  return false;
};

// Procesar las transacciones automáticas
export const processAutomatedTransactions = () => {
  const automatedTransactions = getData(KEYS.AUTOMATED_TRANSACTIONS, []);
  const processedTransactions = [];
  const today = new Date().toISOString().slice(0, 10);
  
  // Automatizaciones actualizadas para guardar
  const updatedAutomations = [...automatedTransactions];
  
  automatedTransactions.forEach((auto, index) => {
    // Comprobar si debe ejecutarse hoy
    if (shouldExecuteToday(auto)) {
      // Crear la transacción
      const transaction = {
        date: today,
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
      
      // Actualizar la fecha de última ejecución
      updatedAutomations[index] = {
        ...auto,
        lastExecuted: today
      };
    }
  });
  
  // Guardar las automatizaciones actualizadas
  if (processedTransactions.length > 0) {
    saveData(KEYS.AUTOMATED_TRANSACTIONS, updatedAutomations);
  }
  
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