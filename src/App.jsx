import { useEffect } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';

// Layouts
import Layout from './components/layout/Layout';

// Pages
import Dashboard from './components/pages/Dashboard';
import Income from './components/pages/Income';
import Expenses from './components/pages/Expenses';
import Investments from './components/pages/Investments';
import Goals from './components/pages/Goals';

// Services
import { initializeStorage } from './services/storageService';

function App() {
  useEffect(() => {
    // Initialize local storage with default values if needed
    initializeStorage();
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Dashboard />} />
          <Route path="/income" element={<Income />} />
          <Route path="/expenses" element={<Expenses />} />
          <Route path="/investments" element={<Investments />} />
          <Route path="/goals" element={<Goals />} />
          {/* Fallback route */}
          <Route path="*" element={<Dashboard />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
