import React from 'react';
import { useProgramContent } from '../../../hooks/useProgramContent'; // Adjust path as needed
import LoadingSpinner from '../../ui/LoadingSpinner'; // Adjust path as needed
import ResourceCard from '../../resources/ResourceCard'; // Adjust path as needed
import EmptyState from '../../ui/EmptyState'; // Assuming an EmptyState component exists

// Placeholder function - replace with actual logic
const getSectionTitle = (sectionType) => {
  switch (sectionType) {
    case 'recommended':
      return 'Recommended for You';
    case 'weekFocus':
      return 'This Week\'s Focus';
    case 'quickHelp':
      return 'Quick Help';
    case 'comingUp':
      return 'Coming Up';
    default:
      return 'Content';
  }
};

const ProgramContentSection = ({ programId, sectionType = 'recommended' }) => {
  const { content, loading, markContentComplete } = useProgramContent(programId);
  
  if (loading) return <LoadingSpinner />;
  
  if (!content) {
    return <EmptyState message="No content available for this program" />;
  }
  
  // Assuming content structure from the hook includes currentStage and sections
  const currentStage = content.currentStage; // This might need adjustment based on hook's actual return
  const sectionContent = currentStage?.sections?.[sectionType] || []; // Use optional chaining
  
  if (sectionContent.length === 0) {
      return <EmptyState message={`No ${sectionType} content available for this stage`} />;
  }

  return (
    <div className="program-content-section">
      <h3 className="text-lg font-bold text-gray-900 mb-4">
        {getSectionTitle(sectionType)}
      </h3>
      
      <div className="space-y-4">
        {sectionContent.map(item => (
          <ResourceCard
            key={item.id}
            resource={{
              id: item.id,
              title: item.title,
              description: item.description,
              content_type: item.contentType,
              reading_time_minutes: item.readingTime,
              category: content.category, // Assuming category is available on the main content object
              is_completed: item.isCompleted,
              is_new: item.isNew
            }}
            onComplete={() => markContentComplete(item.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default ProgramContentSection;
