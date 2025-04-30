import React from 'react';

const TabGroup = ({ tabs, activeTab, onChange }) => {
  return (
    <div className="flex justify-between bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 my-4">
      <div className="flex flex-1 p-1" aria-label="Tabs">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={`
              flex-1 py-2 px-4 text-sm font-medium rounded-md transition-all duration-200 ease-in-out
              ${activeTab === tab.id
                ? 'bg-primary-50 text-primary-600 shadow-sm dark:bg-primary-900/50 dark:text-primary-300'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900 dark:text-gray-300 dark:hover:bg-gray-700 dark:hover:text-white'
              }
            `}
            aria-current={activeTab === tab.id ? 'page' : undefined}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default TabGroup; 