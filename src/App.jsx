import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layout
import Layout from './components/layout/Layout';

// Pages
import Dashboard from './components/pages/Dashboard';
import Income from './components/pages/Income';
import Expenses from './components/pages/Expenses';
import Investments from './components/pages/Investments';
import Goals from './components/pages/Goals';
import AutomatedTransactions from './components/pages/AutomatedTransactions';
import NotFound from './components/pages/NotFound';

// Servicios
import { initializeStorage } from './services/storageService';
import { processAutomatedTransactions } from './services/automationService';

function App() {
  // Inicializar almacenamiento y procesar automatizaciones al cargar
  useEffect(() => {
    initializeStorage();
    
    // Procesar transacciones automáticas pendientes
    const processedTransactions = processAutomatedTransactions();
    if (processedTransactions.length > 0) {
      console.log(`Procesadas ${processedTransactions.length} transacciones automáticas`);
    }
    
    // Configurar procesamiento diario de automatizaciones
    const checkInterval = 1000 * 60 * 60; // Cada hora
    const intervalId = setInterval(() => {
      processAutomatedTransactions();
    }, checkInterval);
    
    return () => clearInterval(intervalId);
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="income" element={<Income />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="investments" element={<Investments />} />
          <Route path="goals" element={<Goals />} />
          <Route path="automated" element={<AutomatedTransactions />} />
          <Route path="404" element={<NotFound />} />
          <Route path="*" element={<Navigate to="/404" replace />} />
        </Route>
      </Routes>
    </Router>
  );
}

export default App;
