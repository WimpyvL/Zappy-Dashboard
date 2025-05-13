// Reusable function to apply filtering based on search term, category, and status
export const applyFilters = (items, searchTerm, categoryFilter, statusFilter) => {
  let filteredItems = items;

  // Filter by category
  if (categoryFilter !== 'all') {
    filteredItems = filteredItems.filter(item => item.category?.toLowerCase() === categoryFilter.toLowerCase());
  }

  // Filter by status
  if (statusFilter !== 'all') {
    filteredItems = filteredItems.filter(item => item.status?.toLowerCase() === statusFilter.toLowerCase());
  }

  // Filter by search term
  if (searchTerm) {
    const lowerSearch = searchTerm.toLowerCase();
    filteredItems = filteredItems.filter(item =>
      (item.name && item.name.toLowerCase().includes(lowerSearch)) ||
      (item.sku && item.sku.toLowerCase().includes(lowerSearch)) ||
      (item.planId && item.planId.toLowerCase().includes(lowerSearch)) ||
      (item.bundleId && item.bundleId.toLowerCase().includes(lowerSearch)) ||
      (item.serviceId && item.serviceId.toLowerCase().includes(lowerSearch)) ||
      (item.categoryId && item.categoryId.toLowerCase().includes(lowerSearch)) // Added categoryId for category search
    );
  }

  return filteredItems;
};
