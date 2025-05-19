import { useState, useMemo } from 'react';

const useResourceFilters = () => {
  const [activeTab, setActiveTab] = useState('product_information');
  const [activeCategory, setActiveCategory] = useState('all');
  const [activeStatus, setActiveStatus] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filters = useMemo(() => ({
    contentType: activeTab,
    category: activeCategory !== 'all' ? activeCategory : undefined,
    status: activeStatus !== 'all' ? activeStatus : undefined,
    searchTerm: searchTerm || undefined,
  }), [activeTab, activeCategory, activeStatus, searchTerm]);

  return {
    activeTab,
    setActiveTab,
    activeCategory,
    setActiveCategory,
    activeStatus,
    setActiveStatus,
    searchTerm,
    setSearchTerm,
    filters,
  };
};

export default useResourceFilters;
