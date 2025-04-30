import React, { useState, useEffect } from 'react';
import { NavLink } from 'react-router-dom';

const Sidebar = () => {
  const [isCollapsed, setIsCollapsed] = useState(false);

  const toggleMobileSidebar = () => {
    window.dispatchEvent(new CustomEvent('toggle-mobile-sidebar', { 
      detail: { isOpen: false }
    }));
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    // Emitir evento para que el Layout pueda ajustar márgenes
    window.dispatchEvent(new CustomEvent('sidebar-collapse-toggle', { 
      detail: { isCollapsed: !isCollapsed }
    }));
  };

  // Al montar el componente, notificar el estado inicial al Layout
  useEffect(() => {
    window.dispatchEvent(new CustomEvent('sidebar-collapse-toggle', { 
      detail: { isCollapsed }
    }));
  }, []);

  const navItems = [
    { 
      path: '/', 
      label: 'Dashboard', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <rect x="3" y="3" width="7" height="7"></rect>
          <rect x="14" y="3" width="7" height="7"></rect>
          <rect x="14" y="14" width="7" height="7"></rect>
          <rect x="3" y="14" width="7" height="7"></rect>
        </svg>
      ),
      end: true 
    },
    { 
      path: '/income', 
      label: 'Income', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="19" x2="12" y2="5"></line>
          <polyline points="5 12 12 5 19 12"></polyline>
        </svg>
      )
    },
    { 
      path: '/expenses', 
      label: 'Expenses', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="5" x2="12" y2="19"></line>
          <polyline points="19 12 12 19 5 12"></polyline>
        </svg>
      )
    },
    { 
      path: '/automated', 
      label: 'Automate', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <polyline points="12 6 12 12 16 14"></polyline>
        </svg>
      )
    },
    { 
      path: '/investments', 
      label: 'Investments', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="12" y1="20" x2="12" y2="10"></line>
          <line x1="18" y1="20" x2="18" y2="4"></line>
          <line x1="6" y1="20" x2="6" y2="16"></line>
        </svg>
      )
    },
    { 
      path: '/goals', 
      label: 'Goals', 
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10"></circle>
          <circle cx="12" cy="12" r="6"></circle>
          <circle cx="12" cy="12" r="2"></circle>
        </svg>
      )
    },
  ];

  return (
    <aside 
      className={`fixed inset-y-0 left-0 ${isCollapsed ? 'w-20' : 'w-72'} bg-white border-r border-gray-200 z-30 transition-all duration-300 transform overflow-y-auto dark:bg-gray-800 dark:border-gray-700`}
    >
      {/* Logo solamente */}
      <div className={`flex items-center justify-between h-20 border-b border-gray-200 dark:border-gray-700 ${isCollapsed ? 'px-4' : 'px-6'}`}>
        {!isCollapsed && (
          <div className="flex items-center">
            <span className="text-3xl font-bold text-primary-500">Zave</span>
            <span className="ml-2 text-lg text-gray-500 dark:text-gray-400">Finance</span>
          </div>
        )}
        {isCollapsed && (
          <span className="text-3xl font-bold text-primary-500 mx-auto">Z</span>
        )}
      </div>
      
      {/* Navigation */}
      <nav className={`px-4 py-6 ${isCollapsed ? 'px-2' : 'px-4'}`}>
        <ul className="space-y-3">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink 
                to={item.path} 
                end={item.end}
                className={({ isActive }) => 
                  `flex items-center ${isCollapsed ? 'justify-center' : 'px-5'} py-4 text-base font-medium rounded-lg transition-colors ${
                    isActive 
                      ? 'bg-primary-50 text-primary-700 dark:bg-primary-900 dark:text-primary-100' 
                      : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700'
                  }`
                }
                title={item.label}
              >
                <span className={isCollapsed ? '' : 'mr-4'}>{item.icon}</span>
                {!isCollapsed && item.label}
              </NavLink>
            </li>
          ))}
          
          {/* Botón para contraer/expandir sidebar */}
          <li className="mt-8">
            <button 
              className={`flex items-center w-full ${isCollapsed ? 'justify-center' : 'px-5'} py-4 text-base font-medium rounded-lg transition-colors text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-700`}
              onClick={toggleCollapse}
              aria-label={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {isCollapsed ? (
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
                </svg>
              ) : (
                <>
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 mr-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
                  </svg>
                  Collapse Menu
                </>
              )}
            </button>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar; 