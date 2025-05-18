import React, { useState } from 'react';
import SearchBar from '@/components/ui/SearchBar';

export default function SearchBarStoryboard() {
  const [searchTerm, setSearchTerm] = useState('');

  const handleSearch = (term) => {
    setSearchTerm(term);
    console.log('Searching for:', term);
  };

  return (
    <div className="bg-white p-4">
      <div className="mb-4">
        <SearchBar
          placeholder="Search patients..."
          onSearch={handleSearch}
          initialValue={searchTerm}
          delay={500}
        />
      </div>

      <div className="mt-4">
        <p className="text-sm text-gray-600">
          Current search term: {searchTerm || '(empty)'}
        </p>
      </div>
    </div>
  );
}
