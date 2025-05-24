import React, { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';

const Layout = () => {
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const toggleDarkMode = () => {
    const newDarkModeState = !isDarkMode;
    setIsDarkMode(newDarkModeState);
    if (newDarkModeState) {
      document.documentElement.classList.add('dark-mode');
      document.body.classList.add('dark-mode');
    } else {
      document.documentElement.classList.remove('dark-mode');
      document.body.classList.remove('dark-mode');
    }
  };

  const toggleMobileSidebar = () => {
    const newState = !isMobileSidebarOpen;
    setIsMobileSidebarOpen(newState);
    window.dispatchEvent(new CustomEvent('toggle-mobile-sidebar', { 
      detail: { isOpen: newState }
    }));
  };

  useEffect(() => {
    // Verificar preferencia de modo oscuro del sistema
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDark) {
      setIsDarkMode(true);
      document.documentElement.classList.add('dark-mode');
      document.body.classList.add('dark-mode');
    }

    // Escuchar eventos de toggle del sidebar móvil
    const handleMobileSidebarToggle = (event) => {
      setIsMobileSidebarOpen(event.detail.isOpen);
    };

    // Escuchar eventos de contraer/expandir sidebar
    const handleSidebarCollapseToggle = (event) => {
      setIsSidebarCollapsed(event.detail.isCollapsed);
    };

    window.addEventListener('toggle-mobile-sidebar', handleMobileSidebarToggle);
    window.addEventListener('sidebar-collapse-toggle', handleSidebarCollapseToggle);
    
    return () => {
      window.removeEventListener('toggle-mobile-sidebar', handleMobileSidebarToggle);
      window.removeEventListener('sidebar-collapse-toggle', handleSidebarCollapseToggle);
    };
  }, []);
  
  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className="lg:block h-full">
        <Sidebar isMobileOpen={isMobileSidebarOpen} onCloseMobile={toggleMobileSidebar} />
      </div>
      
      {/* Mobile sidebar overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="fixed inset-0 bg-gray-900 bg-opacity-50 z-20 lg:hidden dark:bg-opacity-70"
          onClick={toggleMobileSidebar}
        ></div>
      )}
      
      {/* Main content */}
      <div className={`${isSidebarCollapsed ? 'lg:ml-20' : 'lg:ml-72'} flex-1 flex flex-col transition-all duration-300 w-full`}>
        {/* Mobile Menu Button */}
        <button 
          className="fixed top-7 right-6 p-2 z-40 rounded-full bg-primary-500 shadow-lg lg:hidden flex items-center justify-center text-white dark:bg-primary-700"
          onClick={toggleMobileSidebar}
          aria-label={isMobileSidebarOpen ? "Close menu" : "Open menu"}
        >
          <span className="text-xl font-bold">Z</span>
        </button>
        
        <main className="flex-1 overflow-auto h-full w-full">
          <Outlet />
        </main>
      </div>

      {/* Dark mode toggle button */}
      <button 
        className="fixed right-6 bottom-6 p-3 rounded-full bg-white shadow-lg text-gray-700 hover:bg-gray-100 focus:outline-none transition-colors z-50 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
        onClick={toggleDarkMode}
        aria-label={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
      >
        {isDarkMode ? (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path>
          </svg>
        ) : (
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path>
          </svg>
        )}
      </button>
    </div>
  );
};

export default Layout; 