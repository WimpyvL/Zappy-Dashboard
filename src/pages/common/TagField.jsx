import React, { useState, useRef, useEffect } from 'react';
import { X, Plus } from 'lucide-react';
import Tag from './Tag';
import { useAppContext } from '../../context/AppContext';

const TagField = ({ 
  entityId, 
  entityType, 
  entityTags = [], 
  className = '',
  placeholder = 'Add a tag...' 
}) => {
  const { 
    tags, 
    addTag, 
    addPatientTag, 
    removePatientTag,
    addSessionTag,
    removeSessionTag,
    addOrderTag,
    removeOrderTag,
    addDocumentTag,
    removeDocumentTag,
    addFormTag,
    removeFormTag,
    addInvoiceTag,
    removeInvoiceTag
  } = useAppContext();
  
  const [inputValue, setInputValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  
  // Handle clicks outside the dropdown to close it
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) && 
          inputRef.current && !inputRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Filter available tags based on input and already assigned tags
  const availableTags = tags.filter(tag => 
    !entityTags.includes(tag.id) && 
    tag.name.toLowerCase().includes(inputValue.toLowerCase())
  );
  
  // Add a tag to the entity
  const handleAddTag = (tagId) => {
    switch (entityType) {
      case 'patient':
        addPatientTag(entityId, tagId);
        break;
      case 'session':
        addSessionTag(entityId, tagId);
        break;
      case 'order':
        addOrderTag(entityId, tagId);
        break;
      case 'document':
        addDocumentTag(entityId, tagId);
        break;
      case 'form':
        addFormTag(entityId, tagId);
        break;
      case 'invoice':
        addInvoiceTag(entityId, tagId);
        break;
      default:
        console.error(`Unknown entity type: ${entityType}`);
    }
    setInputValue('');
  };
  
  // Remove a tag from the entity
  const handleRemoveTag = (tagId) => {
    switch (entityType) {
      case 'patient':
        removePatientTag(entityId, tagId);
        break;
      case 'session':
        removeSessionTag(entityId, tagId);
        break;
      case 'order':
        removeOrderTag(entityId, tagId);
        break;
      case 'document':
        removeDocumentTag(entityId, tagId);
        break;
      case 'form':
        removeFormTag(entityId, tagId);
        break;
      case 'invoice':
        removeInvoiceTag(entityId, tagId);
        break;
      default:
        console.error(`Unknown entity type: ${entityType}`);
    }
  };
  
  // Create a new tag
  const handleCreateTag = () => {
    if (inputValue.trim()) {
      const newTag = addTag(inputValue.trim());
      handleAddTag(newTag.id);
      setShowDropdown(false);
    }
  };
  
  // Display existing tags
  const displayTags = entityTags.map(tagId => {
    const tag = tags.find(t => t.id === tagId);
    if (!tag) return null;
    return (
      <Tag 
        key={tag.id} 
        id={tag.id}
        name={tag.name} 
        color={tag.color} 
        removable={true}
        onRemove={() => handleRemoveTag(tag.id)}
      />
    );
  });
  
  return (
    <div className={`${className}`}>
      <div className="flex flex-wrap gap-1 mb-2">
        {displayTags}
      </div>
      
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          className="w-full pl-3 pr-10 py-2 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowDropdown(true);
          }}
          onFocus={() => setShowDropdown(true)}
          placeholder={placeholder}
        />
        
        <button
          type="button"
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
          onClick={handleCreateTag}
        >
          <Plus className="h-4 w-4 text-gray-400 hover:text-gray-500" />
        </button>
      </div>
      
      {showDropdown && (
        <div 
          ref={dropdownRef}
          className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto"
        >
          {availableTags.length > 0 ? (
            <ul className="py-1">
              {availableTags.map(tag => (
                <li 
                  key={tag.id}
                  className="px-3 py-2 hover:bg-gray-100 cursor-pointer flex items-center"
                  onClick={() => {
                    handleAddTag(tag.id);
                    setShowDropdown(false);
                  }}
                >
                  <Tag name={tag.name} color={tag.color} />
                </li>
              ))}
            </ul>
          ) : inputValue.trim() ? (
            <div 
              className="px-3 py-2 hover:bg-gray-100 cursor-pointer" 
              onClick={handleCreateTag}
            >
              Create tag: <span className="font-medium">{inputValue}</span>
            </div>
          ) : (
            <div className="px-3 py-2 text-gray-500">No matching tags</div>
          )}
        </div>
      )}
    </div>
  );
};

export default TagField;