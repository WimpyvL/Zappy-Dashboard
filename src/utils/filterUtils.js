/**
 * Apply filters to a list of items
 * @param {Array} items - The items to filter
 * @param {string} searchTerm - The search term to filter by
 * @param {string} categoryFilter - The category to filter by
 * @param {string} statusFilter - The status to filter by
 * @returns {Array} The filtered items
 */
export const applyFilters = (items, searchTerm, categoryFilter, statusFilter) => {
  if (!items || !Array.isArray(items)) {
    return [];
  }

  return items.filter(item => {
    // Search term filter
    const searchMatch = !searchTerm || 
      (item.name && item.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.sku && item.sku.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.description && item.description.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.categoryId && item.categoryId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.bundleId && item.bundleId.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.serviceId && item.serviceId.toLowerCase().includes(searchTerm.toLowerCase()));

    // Category filter
    const categoryMatch = categoryFilter === 'all' || 
      (item.category && item.category === categoryFilter);

    // Status filter
    const statusMatch = statusFilter === 'all' || 
      (item.status && item.status === statusFilter);

    return searchMatch && categoryMatch && statusMatch;
  });
};

/**
 * Group items by category
 * @param {Array} items - The items to group
 * @returns {Object} The grouped items
 */
export const groupByCategory = (items) => {
  if (!items || !Array.isArray(items)) {
    return {};
  }

  return items.reduce((acc, item) => {
    const category = item.category || 'Uncategorized';
    if (!acc[category]) {
      acc[category] = [];
    }
    acc[category].push(item);
    return acc;
  }, {});
};

/**
 * Sort items by a specific field
 * @param {Array} items - The items to sort
 * @param {string} field - The field to sort by
 * @param {boolean} ascending - Whether to sort in ascending order
 * @returns {Array} The sorted items
 */
export const sortItems = (items, field, ascending = true) => {
  if (!items || !Array.isArray(items)) {
    return [];
  }

  return [...items].sort((a, b) => {
    let valueA = a[field];
    let valueB = b[field];

    // Handle string comparison
    if (typeof valueA === 'string' && typeof valueB === 'string') {
      valueA = valueA.toLowerCase();
      valueB = valueB.toLowerCase();
    }

    // Handle undefined or null values
    if (valueA === undefined || valueA === null) return ascending ? -1 : 1;
    if (valueB === undefined || valueB === null) return ascending ? 1 : -1;

    // Compare values
    if (valueA < valueB) return ascending ? -1 : 1;
    if (valueA > valueB) return ascending ? 1 : -1;
    return 0;
  });
};
