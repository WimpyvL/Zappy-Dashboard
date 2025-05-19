import React, { useState } from 'react';
import { X, Search, Check } from 'lucide-react';

const ServicePanel = ({ 
  showServicePanel, 
  toggleServicePanel, 
  serviceOptions, 
  activeServices, 
  addServiceTag 
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  if (!showServicePanel) return null;
  
  // Filter service options based on search term
  const filteredOptions = serviceOptions.filter(option => 
    option.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  // Group service options by category type
  // This mapping should match the categories in the database
  const categoryGroups = {
    'Primary Care': ['pc', 'wh', 'primary', 'womens-health'],
    'Specialty Care': ['wm', 'ed', 'derm', 'hair', 'weight', 'erectile', 'dermatology'],
    'Mental Health': ['mh', 'mental']
  };
  
  // Create grouped options based on category mapping
  const groupedOptions = {};
  
  // Initialize groups
  Object.keys(categoryGroups).forEach(group => {
    groupedOptions[group] = [];
  });
  
  // Assign each option to its group
  filteredOptions.forEach(option => {
    let assigned = false;
    
    // Check each group to see if this option belongs
    Object.entries(categoryGroups).forEach(([groupName, categoryIds]) => {
      if (categoryIds.some(id => option.id.toLowerCase().includes(id.toLowerCase()))) {
        groupedOptions[groupName].push(option);
        assigned = true;
      }
    });
    
    // If not assigned to any group, create an "Other" group
    if (!assigned) {
      if (!groupedOptions['Other']) {
        groupedOptions['Other'] = [];
      }
      groupedOptions['Other'].push(option);
    }
  });
  
  return (
    <div className="service-panel">
      <h3>
        Add Service
        <button 
          className="close" 
          onClick={toggleServicePanel}
          aria-label="Close panel"
        >
          <X size={16} />
        </button>
      </h3>
      
      {/* Search input */}
      <div className="service-search">
        <Search size={16} className="search-icon" />
        <input 
          type="text" 
          placeholder="Search services..." 
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          aria-label="Search services"
        />
        {searchTerm && (
          <button 
            className="clear-search" 
            onClick={() => setSearchTerm('')}
            aria-label="Clear search"
          >
            <X size={14} />
          </button>
        )}
      </div>
      
      {/* Service options grouped by category */}
      <div className="service-options-container">
        {Object.entries(groupedOptions).map(([category, options]) => (
          options.length > 0 && (
            <div key={category} className="service-category-group">
              <h4 className="service-category-title">{category}</h4>
              <div className="service-options">
                {options.map(option => (
                  <div 
                    key={option.id}
                    className={`service-option ${activeServices[option.id] ? 'selected' : ''}`}
                    onClick={() => addServiceTag(option.id, option.name, option.dotClass)}
                    role="button"
                    aria-pressed={activeServices[option.id] ? 'true' : 'false'}
                  >
                    <div className="service-option-content">
                      <span className={`service-dot ${option.dotClass}`}></span>
                      {option.name}
                    </div>
                    {activeServices[option.id] && (
                      <Check size={16} className="check-icon" />
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        ))}
        
        {/* Show message if no results found */}
        {Object.values(groupedOptions).every(group => group.length === 0) && (
          <div className="no-results">
            No services found matching "{searchTerm}"
          </div>
        )}
      </div>
    </div>
  );
};

export default ServicePanel;
