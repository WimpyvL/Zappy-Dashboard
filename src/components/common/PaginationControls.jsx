import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

const PaginationControls = ({
  paginationMeta,
  paginationLinks,
  onPageChange,
  onGoToLink,
}) => {
  if (!paginationMeta || paginationMeta.total_pages <= 1) {
    return null; // Don't render if only one page or no data
  }

  const { total, total_pages, current_page, per_page } = paginationMeta;

  // Generate page numbers with ellipsis logic
  const renderPageNumbers = () => {
    let pages = [];
    if (total_pages <= 5) {
      pages = Array.from({ length: total_pages }, (_, i) => i + 1);
    } else {
      pages.push(1);
      if (current_page > 3) pages.push('...');
      for (let i = Math.max(2, current_page - 1); i <= Math.min(total_pages - 1, current_page + 1); i++) {
        pages.push(i);
      }
      if (current_page < total_pages - 2) pages.push('...');
      if (total_pages > 1) pages.push(total_pages);
    }

    return pages.map((page, index) =>
      page === '...' ? (
        <span key={`ellipsis-${index}`} className="relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700">...</span>
      ) : (
        <button
          key={page}
          onClick={() => onPageChange(page)}
          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
            current_page === page ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600' : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50'
          }`}
          aria-current={current_page === page ? 'page' : undefined}
        >
          {page}
        </button>
      )
    );
  };

  const fromItem = total > 0 ? (current_page - 1) * per_page + 1 : 0;
  const toItem = Math.min(current_page * per_page, total);

  return (
    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6 rounded-b-lg">
      {/* Mobile Pagination */}
      <div className="flex-1 flex justify-between sm:hidden">
        <button
          className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${!paginationLinks?.prev ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => onGoToLink('prev')}
          disabled={!paginationLinks?.prev}
        >
          Previous
        </button>
        <button
          className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${!paginationLinks?.next ? 'opacity-50 cursor-not-allowed' : ''}`}
          onClick={() => onGoToLink('next')}
          disabled={!paginationLinks?.next}
        >
          Next
        </button>
      </div>

      {/* Desktop Pagination */}
      <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p className="text-sm text-gray-700">
            Showing <span className="font-medium">{fromItem}</span>{' '}
            to <span className="font-medium">{toItem}</span>{' '}
            of <span className="font-medium">{total || 0}</span> results
          </p>
        </div>
        <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
          <button
            onClick={() => onGoToLink('prev')}
            disabled={!paginationLinks?.prev}
            className={`relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium ${
              paginationLinks?.prev ? 'text-gray-500 hover:bg-gray-50' : 'text-gray-300 cursor-not-allowed'
            }`}
          >
            <span className="sr-only">Previous</span>
            <ChevronLeft className="h-5 w-5" />
          </button>
          {renderPageNumbers()}
          <button
            onClick={() => onGoToLink('next')}
            disabled={!paginationLinks?.next}
            className={`relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium ${
              paginationLinks?.next ? 'text-gray-500 hover:bg-gray-50' : 'text-gray-300 cursor-not-allowed'
            }`}
          >
            <span className="sr-only">Next</span>
            <ChevronRight className="h-5 w-5" />
          </button>
        </nav>
      </div>
    </div>
  );
};

export default PaginationControls;
