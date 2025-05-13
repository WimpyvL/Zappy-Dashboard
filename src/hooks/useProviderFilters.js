import { useState, useMemo } from 'react';

const useProviderFilters = (providers) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [specialtyFilter, setSpecialtyFilter] = useState('all');

  // Filter providers based on search and specialty
  const filteredProviders = useMemo(() => {
    return providers.filter((provider) => {
      const matchesSearch =
        provider.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        provider.email?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesSpecialty =
        specialtyFilter === 'all' || provider.specialty === specialtyFilter;

      return matchesSearch && matchesSpecialty;
    });
  }, [providers, searchTerm, specialtyFilter]);

  // Get unique specialties for filter dropdown
  const specialties = useMemo(() => {
    return [
      ...new Set(providers.map((provider) => provider.specialty).filter(Boolean)),
    ];
  }, [providers]);

  return {
    searchTerm,
    setSearchTerm,
    specialtyFilter,
    setSpecialtyFilter,
    filteredProviders,
    specialties,
  };
};

export default useProviderFilters;
