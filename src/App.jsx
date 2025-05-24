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

function App() {
  // Inicializar almacenamiento y configuraciones al cargar
  useEffect(() => {
    initializeStorage();
    initializeSettings(); // Inicializar las categorías y configuraciones
    
    // Note: We've moved the automated transaction processing to the Dashboard component
    // to ensure financial data is always in sync with processed transactions
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
