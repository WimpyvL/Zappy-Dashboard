import React, { useState } from 'react';
import Pagination from '@/components/ui/Pagination';

export default function PaginationStoryboard() {
  const [currentPage, setCurrentPage] = useState(5);
  const totalPages = 20;

  return (
    <div className="bg-white p-4">
      <div className="mb-4">
        <p className="text-sm text-gray-600">Current Page: {currentPage}</p>
      </div>

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setCurrentPage}
      />
    </div>
  );
}
