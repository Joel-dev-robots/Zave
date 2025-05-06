import { useState, useEffect, useRef } from 'react';
import { searchCryptoCoins } from '../../services/cryptoService';

const CryptoSearch = ({ onSelect }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const searchTimeout = useRef(null);
  const resultsRef = useRef(null);
  
  // Manejar clics fuera del componente para cerrar los resultados
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target)) {
        setShowResults(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Función de búsqueda con debounce
  const handleSearch = (query) => {
    setSearchQuery(query);
    
    // Limpiar el timeout anterior si existe
    if (searchTimeout.current) {
      clearTimeout(searchTimeout.current);
    }
    
    if (!query.trim()) {
      setSearchResults([]);
      setShowResults(false);
      return;
    }
    
    // Crear un nuevo timeout para realizar la búsqueda
    searchTimeout.current = setTimeout(async () => {
      setIsLoading(true);
      setShowResults(true);
      
      try {
        const results = await searchCryptoCoins(query);
        setSearchResults(results.slice(0, 10)); // Límite a 10 resultados para mejor UX
      } catch (error) {
        console.error('Error searching cryptocurrencies:', error);
        setSearchResults([]);
      } finally {
        setIsLoading(false);
      }
    }, 300); // 300ms de debounce
  };
  
  const handleSelectCoin = (coin) => {
    setSearchQuery(coin.name);
    setShowResults(false);
    if (onSelect) onSelect(coin);
  };
  
  return (
    <div className="relative" ref={resultsRef}>
      <div className="flex items-center relative">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearch(e.target.value)}
          placeholder="Buscar criptomoneda..."
          className="w-full px-4 py-2 border rounded-md focus:ring-indigo-500 focus:border-indigo-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
        />
        {isLoading && (
          <div className="absolute right-3">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-indigo-600 dark:border-indigo-400"></div>
          </div>
        )}
      </div>
      
      {showResults && searchResults.length > 0 && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-md max-h-60 overflow-y-auto">
          <ul className="py-1">
            {searchResults.map((coin) => (
              <li
                key={coin.id}
                onClick={() => handleSelectCoin(coin)}
                className="px-4 py-2 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer flex items-center"
              >
                {coin.thumb && (
                  <img 
                    src={coin.thumb} 
                    alt={coin.name} 
                    className="w-6 h-6 mr-2 rounded-full"
                  />
                )}
                <div>
                  <div className="font-medium">{coin.name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">{coin.symbol.toUpperCase()}</div>
                </div>
                {coin.market_cap_rank && (
                  <div className="ml-auto text-xs bg-gray-200 dark:bg-gray-700 px-2 py-1 rounded-full">
                    Rank #{coin.market_cap_rank}
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}
      
      {showResults && searchQuery.trim() && searchResults.length === 0 && !isLoading && (
        <div className="absolute z-10 mt-1 w-full bg-white dark:bg-gray-800 shadow-lg rounded-md py-3 px-4 text-center">
          No se encontraron resultados para "{searchQuery}"
        </div>
      )}
    </div>
  );
};

export default CryptoSearch; 