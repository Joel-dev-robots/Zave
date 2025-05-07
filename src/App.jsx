import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';

// Layout
import Layout from './components/layout/Layout';

// Pages
import Dashboard from './components/pages/Dashboard';
import Income from './components/pages/Income';
import Expenses from './components/pages/Expenses';
import Investments from './components/pages/Investments';
import ChronologicalHistory from './components/pages/ChronologicalHistory';
import Goals from './components/pages/Goals';
import AutomatedTransactions from './components/pages/AutomatedTransactions';
import NotFound from './components/pages/NotFound';

// Servicios
import { initializeStorage } from './services/storageService';
import { initializeSettings } from './services/settingsService';
import { processAutomatedTransactions } from './services/automationService';

function App() {
  // Inicializar almacenamiento y configuraciones al cargar
  useEffect(() => {
    initializeStorage();
    initializeSettings(); // Inicializar las categorías y configuraciones
    
    // Verificar transacciones automáticas una vez al día
    // Solo comprobamos una vez al día para no procesar múltiples veces
    const lastProcessed = localStorage.getItem('last_auto_processed');
    const today = new Date().toDateString();
    
    if (!lastProcessed || lastProcessed !== today) {
      // Procesar transacciones automáticas pendientes
      const processedTransactions = processAutomatedTransactions();
      if (processedTransactions.length > 0) {
        console.log(`Procesadas ${processedTransactions.length} transacciones automáticas`);
      }
      
      // Guardar la fecha de último procesamiento
      localStorage.setItem('last_auto_processed', today);
    }
    
    // No configuramos un intervalo para no crear bucles infinitos
    // Las automatizaciones se verificarán cada vez que el usuario cargue la aplicación
  }, []);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="income" element={<Income />} />
          <Route path="expenses" element={<Expenses />} />
          <Route path="investments" element={<Investments />} />
          <Route path="investments/history" element={<ChronologicalHistory />} />
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
