import React, { useState, useEffect } from 'react';

const SearchBar = ({ placeholder, onSearch, initialValue = '', delay = 500 }) => {
  const [searchTerm, setSearchTerm] = useState(initialValue);
  
  // Use debounce to avoid triggering search on every keystroke
  useEffect(() => {
    const handler = setTimeout(() => {
      if (searchTerm !== initialValue) {
        onSearch(searchTerm);
      }
    }, delay);
    
    return () => {
      clearTimeout(handler);
    };
  }, [searchTerm, delay, onSearch, initialValue]);
  
  const handleSubmit = (e) => {
    e.preventDefault();
    onSearch(searchTerm);
  };
  
  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="text"
        className="w-full p-2 pl-10 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        placeholder={placeholder || "Search..."}
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />
      <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
        <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"></path>
        </svg>
      </div>
      {searchTerm && (
        <button
          type="button"
          className="absolute inset-y-0 right-0 flex items-center pr-3"
          onClick={() => {
            setSearchTerm('');
            onSearch('');
          }}
        >
          <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd"></path>
          </svg>
        </button>
      )}
    </form>
  );
};

export default SearchBar;