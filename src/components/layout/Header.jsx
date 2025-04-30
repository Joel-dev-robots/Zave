import React from 'react';

const Header = () => {
  const toggleMobileSidebar = () => {
    window.dispatchEvent(new CustomEvent('toggle-mobile-sidebar', { 
      detail: { isOpen: true }
    }));
  };

  return (
    <header className="sticky top-0 z-40 flex items-center h-16 bg-white border-b border-gray-200 px-4 dark:bg-gray-800 dark:border-gray-700 lg:hidden">
      <button 
        className="p-2 rounded-md text-gray-500 hover:bg-gray-100 focus:outline-none dark:text-gray-300 dark:hover:bg-gray-700"
        onClick={toggleMobileSidebar}
        aria-label="Open menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>
      
      <div className="flex items-center ml-4">
        <span className="text-xl font-bold text-primary-500">Zave</span>
        <span className="ml-1 text-base text-gray-500 dark:text-gray-400">Finance</span>
      </div>
    </header>
  );
};

export default Header; 