import React from 'react';

const Pagination = ({ currentPage, totalPages, onPageChange }) => {
  const maxDisplayedPages = 5; // Maximum number of page buttons to display

  // Define reusable button classes
  const baseButtonClasses = "relative inline-flex items-center px-4 py-2 border text-sm font-medium";
  const inactivePageClasses = "bg-white border-gray-300 text-gray-700 hover:bg-gray-50";
  const activePageClasses = "z-10 bg-indigo-50 border-indigo-500 text-indigo-600";
  const disabledButtonClasses = "text-gray-300 cursor-not-allowed";
  const enabledButtonClasses = "text-gray-500 hover:bg-gray-50";

  if (totalPages <= 1) return null;

  // Calculate range of pages to show
  let startPage = Math.max(1, currentPage - Math.floor(maxDisplayedPages / 2));
  let endPage = Math.min(totalPages, startPage + maxDisplayedPages - 1);
  
  // Adjust if we're at the end
  if (endPage - startPage + 1 < maxDisplayedPages && startPage > 1) {
    startPage = Math.max(1, endPage - maxDisplayedPages + 1);
  }
  
  // Generate array of pages to display
  const pages = [];
  for (let i = startPage; i <= endPage; i++) {
    pages.push(i);
  }
  
  return (
    <div className="flex justify-center mt-4">
      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
        {/* Previous Page */}
        <button
          onClick={() => onPageChange(Math.max(1, currentPage - 1))}
          disabled={currentPage === 1}
          className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
            currentPage === 1 
              ? 'text-gray-300 cursor-not-allowed' 
              : 'text-gray-500 hover:bg-gray-50'
          }`}
        >
          <span className="sr-only">Previous</span>
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
          </svg>
        </button>
        
        {/* First Page */}
        {startPage > 1 && (
          <>
            <button
              onClick={() => onPageChange(1)}
              className={`${baseButtonClasses} ${inactivePageClasses}`}
            >
              1
            </button>
            {startPage > 2 && (
              <span className={`${baseButtonClasses} text-gray-700`}>
                ...
              </span>
            )}
          </>
        )}
        
        {/* Page Numbers */}
        {pages.map(page => (
          <button
            key={page}
            onClick={() => onPageChange(page)}
            className={`${baseButtonClasses} ${
              page === currentPage
                ? activePageClasses
                : inactivePageClasses
            }`}
          >
            {page}
          </button>
        ))}
        
        {/* Last Page */}
        {endPage < totalPages && (
          <>
            {endPage < totalPages - 1 && (
              <span className={`${baseButtonClasses} text-gray-700`}>
                ...
              </span>
            )}
            <button
              onClick={() => onPageChange(totalPages)}
              className={`${baseButtonClasses} ${inactivePageClasses}`}
            >
              {totalPages}
            </button>
          </>
        )}
        
        {/* Next Page */}
        <button
          onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
          disabled={currentPage === totalPages}
          className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
            currentPage === totalPages 
              ? disabledButtonClasses 
              : enabledButtonClasses
          }`}
        >
          <span className="sr-only">Next</span>
          <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
            <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
          </svg>
        </button>
      </nav>
    </div>
  );
};

export default Pagination;
