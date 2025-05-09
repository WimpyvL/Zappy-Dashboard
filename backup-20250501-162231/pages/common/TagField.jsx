import React, { useState, useRef, useEffect } from 'react';
import { X, Plus, Loader2 } from 'lucide-react';
import Tag from './Tag';
// Removed useAppContext import
import { useTags, useCreateTag } from '../../apis/tags/hooks'; // Fetch all tags and create new ones
// Import mutation hooks for adding/removing tags for each entity type
// Note: These hooks are assumed to exist in the respective entity's hooks file
// e.g., useAddPatientTag in src/apis/patients/hooks.js
import {
  useAddPatientTag,
  useRemovePatientTag,
} from '../../apis/patients/hooks';
import {
  useAddSessionTag,
  useRemoveSessionTag,
} from '../../apis/sessions/hooks';
import { useAddOrderTag, useRemoveOrderTag } from '../../apis/orders/hooks';
// TODO: Import hooks for document, form, invoice tags when available

const TagField = ({
  entityId,
  entityType,
  entityTags = [], // This prop likely holds the IDs of currently assigned tags
  className = '',
  placeholder = 'Add a tag...',
}) => {
  // Fetch all available tags
  const {
    data: tagsData,
    isLoading: isLoadingTags,
    error: errorTags,
  } = useTags();
  const allTags = tagsData?.data || tagsData || []; // Adapt based on API response

  // Mutation hook for creating a new tag
  const createTagMutation = useCreateTag({
    onSuccess: (newTag) => {
      // After creating, automatically add it to the current entity
      if (newTag?.id) {
        handleAddTag(newTag.id);
      }
      setInputValue('');
      setShowDropdown(false);
    },
    onError: (error) => {
      console.error('Failed to create tag:', error);
      // TODO: Show error notification
    },
  });

  // Get the correct add/remove mutation hooks based on entityType
  // This is verbose; a more dynamic approach might be possible but less explicit
  const addPatientTagMutation = useAddPatientTag();
  const removePatientTagMutation = useRemovePatientTag();
  const addSessionTagMutation = useAddSessionTag();
  const removeSessionTagMutation = useRemoveSessionTag();
  const addOrderTagMutation = useAddOrderTag();
  const removeOrderTagMutation = useRemoveOrderTag();
  // TODO: Add mutations for document, form, invoice

  const [inputValue, setInputValue] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  // Handle clicks outside the dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        inputRef.current &&
        !inputRef.current.contains(event.target)
      ) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter available tags
  const availableTags = allTags.filter(
    (tag) =>
      !entityTags.includes(tag.id) && // Check if tag ID is already in the entity's list
      tag.name.toLowerCase().includes(inputValue.toLowerCase())
  );

  // Add a tag to the entity using the appropriate mutation
  const handleAddTag = (tagId) => {
    const mutationPayload = { entityId, tagId }; // Adjust payload based on hook needs
    switch (entityType) {
      case 'patient':
        addPatientTagMutation.mutate(mutationPayload);
        break;
      case 'session':
        addSessionTagMutation.mutate(mutationPayload);
        break;
      case 'order':
        addOrderTagMutation.mutate(mutationPayload);
        break;
      // TODO: Add cases for document, form, invoice
      default:
        console.error(`Unknown entity type for adding tag: ${entityType}`);
    }
    setInputValue(''); // Clear input after adding
  };

  // Remove a tag from the entity using the appropriate mutation
  const handleRemoveTag = (tagId) => {
    const mutationPayload = { entityId, tagId }; // Adjust payload based on hook needs
    switch (entityType) {
      case 'patient':
        removePatientTagMutation.mutate(mutationPayload);
        break;
      case 'session':
        removeSessionTagMutation.mutate(mutationPayload);
        break;
      case 'order':
        removeOrderTagMutation.mutate(mutationPayload);
        break;
      // TODO: Add cases for document, form, invoice
      default:
        console.error(`Unknown entity type for removing tag: ${entityType}`);
    }
  };

  // Create a new tag using the mutation
  const handleCreateTag = () => {
    if (inputValue.trim() && !createTagMutation.isLoading) {
      // Assuming the mutation hook expects an object like { name: 'new tag name' }
      createTagMutation.mutate({ name: inputValue.trim() });
    }
  };

  // Display existing tags based on the passed entityTags (IDs)
  const displayTags = entityTags
    .map((tagId) => allTags.find((t) => t.id === tagId)) // Find tag object from allTags
    .filter(Boolean) // Remove nulls if a tag ID doesn't match
    .map((tag) => (
      <Tag
        key={tag.id}
        id={tag.id}
        name={tag.name}
        color={tag.color}
        removable={true}
        // Disable remove button while a remove mutation is pending for this tag
        disabled={
          (removePatientTagMutation.isLoading &&
            removePatientTagMutation.variables?.tagId === tag.id) ||
          (removeSessionTagMutation.isLoading &&
            removeSessionTagMutation.variables?.tagId === tag.id) ||
          (removeOrderTagMutation.isLoading &&
            removeOrderTagMutation.variables?.tagId === tag.id)
          // TODO: Add checks for other entity types
        }
        onRemove={() => handleRemoveTag(tag.id)}
      />
    ));

  // Handle loading state for tags list
  if (isLoadingTags) {
    return (
      <div className={`${className} flex items-center text-gray-500`}>
        <Loader2 className="h-4 w-4 animate-spin mr-2" /> Loading tags...
      </div>
    );
  }

  // Handle error state for tags list
  if (errorTags) {
    return (
      <div className={`${className} text-red-500`}>Error loading tags.</div>
    );
  }

  return (
    <div className={`${className}`}>
      <div className="flex flex-wrap gap-1 mb-2">{displayTags}</div>

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
          disabled={createTagMutation.isLoading} // Disable input while creating tag
        />

        <button
          type="button"
          className="absolute inset-y-0 right-0 pr-3 flex items-center"
          onClick={handleCreateTag}
          disabled={createTagMutation.isLoading || !inputValue.trim()}
        >
          {createTagMutation.isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin text-gray-400" />
          ) : (
            <Plus className="h-4 w-4 text-gray-400 hover:text-gray-500" />
          )}
        </button>
      </div>

      {showDropdown && (
        <div
          ref={dropdownRef}
          className="absolute z-10 mt-1 w-full bg-white shadow-lg rounded-md border border-gray-200 max-h-60 overflow-auto"
        >
          {availableTags.length > 0 ? (
            <ul className="py-1">
              {availableTags.map((tag) => (
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
          ) : null}
          {/* Option to create new tag */}
          {inputValue.trim() &&
            !availableTags.some(
              (tag) =>
                tag.name.toLowerCase() === inputValue.trim().toLowerCase()
            ) && (
              <div
                className="px-3 py-2 hover:bg-gray-100 cursor-pointer border-t border-gray-100"
                onClick={handleCreateTag}
              >
                {createTagMutation.isLoading ? (
                  <span className="flex items-center text-gray-500">
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />{' '}
                    Creating...
                  </span>
                ) : (
                  <>
                    Create tag:{' '}
                    <span className="font-medium">{inputValue}</span>
                  </>
                )}
              </div>
            )}
          {/* Show 'No matching tags' only if input is empty or no results and not creating */}
          {!availableTags.length && !inputValue.trim() && (
            <div className="px-3 py-2 text-gray-500">
              Type to search or create tags
            </div>
          )}
          {!availableTags.length &&
            inputValue.trim() &&
            availableTags.some(
              (tag) =>
                tag.name.toLowerCase() === inputValue.trim().toLowerCase()
            ) && (
              <div className="px-3 py-2 text-gray-500">
                No matching tags found
              </div>
            )}
        </div>
      )}
    </div>
  );
};

export default TagField;
