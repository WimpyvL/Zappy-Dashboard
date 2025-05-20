import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Search, Star, Clock, Tag } from 'lucide-react';

const CommunicationSection = ({
  messageToPatient,
  assessmentPlan,
  followUpPlan,
  messageTemplates,
  assessmentTemplates,
  onMessageChange,
  onAssessmentChange,
  onFollowUpChange,
  readOnly,
  medicationsSummary = [],
  resources = [],
  onResourceToggle = () => {},
  selectedResources = [],
  followUpOptions = ['2 weeks', '4 weeks', 'Monthly', '8 weeks', '12 weeks'],
}) => {
  // State for template management
  const [templateFilter, setTemplateFilter] = useState('');
  const [templateCategory, setTemplateCategory] = useState('all');
  const [showTemplatePreview, setShowTemplatePreview] = useState(null);
  
  // Filter templates based on search and category
  const filteredMessageTemplates = messageTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(templateFilter.toLowerCase()) ||
                          template.text.toLowerCase().includes(templateFilter.toLowerCase());
    const matchesCategory = templateCategory === 'all' || template.category === templateCategory;
    return matchesSearch && matchesCategory;
  });
  
  const filteredAssessmentTemplates = assessmentTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(templateFilter.toLowerCase()) ||
                          template.text.toLowerCase().includes(templateFilter.toLowerCase());
    const matchesCategory = templateCategory === 'all' || template.category === templateCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      {/* Medications Summary */}
      {medicationsSummary.length > 0 && (
        <div className="card bg-white rounded-lg shadow mb-4">
          <div className="card-header px-4 py-2 border-b border-gray-200 font-semibold text-sm">
            Medications Summary
          </div>
          <div className="card-body p-4 text-xs">
            {medicationsSummary.map((med, idx) => (
              <div key={idx} className="flex justify-between mb-1">
                <span>
                  <strong>{med.name}</strong> {med.dose} {med.frequency}
                  {med.duration && (
                    <span className="text-gray-500 ml-1">({med.duration})</span>
                  )}
                </span>
                <span className="text-gray-500">{med.category}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Message to Patient Section */}
      <div className="border border-blue-200 rounded-xl overflow-hidden mb-4 bg-blue-50">
        <div className="bg-blue-100 px-4 py-3 border-b border-blue-200 flex justify-between items-center">
          <h3 className="text-base font-medium text-blue-800">Message to Patient</h3>
          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-0.5 rounded-full">Communication</span>
        </div>
        <div className="p-4">
          <textarea
            className="w-full border border-blue-300 rounded-md p-2 text-sm focus:ring-primary focus:border-primary"
            rows={4}
            value={messageToPatient}
            onChange={(e) => onMessageChange(e.target.value)}
            disabled={readOnly}
            placeholder="Enter message to patient..."
          ></textarea>
          
          {!readOnly && (
            <div className="mt-3 border-t border-blue-200 pt-3">
              <div className="flex justify-between items-center mb-2">
                <h4 className="text-sm font-medium text-blue-800">Message Templates</h4>
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <Search size={14} className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search templates..."
                      className="pl-8 pr-2 py-1 text-xs border border-gray-300 rounded-md"
                      value={templateFilter}
                      onChange={(e) => setTemplateFilter(e.target.value)}
                    />
                  </div>
                  <select
                    className="text-xs border border-gray-300 rounded-md py-1 px-2"
                    value={templateCategory}
                    onChange={(e) => setTemplateCategory(e.target.value)}
                  >
                    <option value="all">All Categories</option>
                    <option value="general">General</option>
                    <option value="wm">Weight Management</option>
                    <option value="ed">ED</option>
                  </select>
                </div>
              </div>
              
              <div className="template-grid grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                {filteredMessageTemplates.map(template => (
                  <div
                    key={template.id}
                    className="template-item relative border border-gray-200 rounded p-2 hover:bg-blue-50 cursor-pointer"
                    onClick={() => onMessageChange(template.text)}
                    onMouseEnter={() => setShowTemplatePreview(template.id)}
                    onMouseLeave={() => setShowTemplatePreview(null)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">{template.name}</span>
                      <div className="flex items-center space-x-1">
                        {template.isFrequent && <Star size={12} className="text-yellow-500" />}
                        {template.category && <Tag size={12} className="text-gray-400" />}
                      </div>
                    </div>
                    
                    {/* Preview popup */}
                    {showTemplatePreview === template.id && (
                      <div className="absolute z-10 left-full ml-2 top-0 w-64 bg-white border border-gray-200 rounded-md shadow-lg p-2 text-xs">
                        <div className="font-medium mb-1">{template.name}</div>
                        <div className="text-gray-600">{template.text.substring(0, 150)}...</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Assessment & Plan Section */}
      <div className="border border-green-200 rounded-xl overflow-hidden mb-4 bg-green-50">
        <div className="bg-green-100 px-4 py-3 border-b border-green-200 flex justify-between items-center">
          <h3 className="text-base font-medium text-green-800">Assessment & Plan</h3>
          <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">Clinical Notes</span>
        </div>
        <div className="p-4">
          <textarea
            className="w-full border border-green-300 rounded-md p-2 text-sm focus:ring-primary focus:border-primary"
            rows={4}
            value={assessmentPlan}
            onChange={(e) => onAssessmentChange(e.target.value)}
            placeholder="Enter assessment and plan..."
            disabled={readOnly}
          ></textarea>
          
          {!readOnly && (
            <div className="mt-3 border-t border-green-200 pt-3">
              <h4 className="text-sm font-medium text-green-800 mb-2">Assessment Templates</h4>
              <div className="template-grid grid grid-cols-2 gap-2 max-h-40 overflow-y-auto">
                {filteredAssessmentTemplates.map(template => (
                  <div
                    key={template.id}
                    className="template-item relative border border-gray-200 rounded p-2 hover:bg-green-50 cursor-pointer"
                    onClick={() => onAssessmentChange(template.text)}
                    onMouseEnter={() => setShowTemplatePreview(template.id)}
                    onMouseLeave={() => setShowTemplatePreview(null)}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium">{template.name}</span>
                      <div className="flex items-center space-x-1">
                        {template.isFrequent && <Star size={12} className="text-yellow-500" />}
                        {template.category && <Tag size={12} className="text-gray-400" />}
                      </div>
                    </div>
                    
                    {/* Preview popup */}
                    {showTemplatePreview === template.id && (
                      <div className="absolute z-10 left-full ml-2 top-0 w-64 bg-white border border-gray-200 rounded-md shadow-lg p-2 text-xs">
                        <div className="font-medium mb-1">{template.name}</div>
                        <div className="text-gray-600">{template.text.substring(0, 150)}...</div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Follow-up Plan Section */}
      <div className="border border-purple-200 rounded-xl overflow-hidden mb-4 bg-purple-50">
        <div className="bg-purple-100 px-4 py-3 border-b border-purple-200">
          <h3 className="text-base font-medium text-purple-800">Follow-up Plan</h3>
        </div>
        <div className="p-4">
          <div className="followup-options flex flex-wrap gap-2 mb-2">
            {followUpOptions.map(option => (
              <button
                key={option}
                type="button"
                className={`followup-option px-3 py-1 rounded-full flex items-center ${followUpPlan === option ? 'bg-purple-200 border-purple-400 text-purple-900' : 'bg-white border border-gray-300 text-gray-700'}`}
                onClick={() => onFollowUpChange(option)}
                disabled={readOnly}
              >
                <Clock size={12} className="mr-1" />
                {option}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Patient Education Resources */}
      {resources.length > 0 && (
        <div className="card bg-white rounded-lg shadow mb-4">
          <div className="card-header px-4 py-2 border-b border-gray-200 font-semibold text-sm">
            Patient Education
          </div>
          <div className="card-body p-4 grid grid-cols-2 gap-2">
            {resources.map(resource => (
              <button
                key={resource.id}
                type="button"
                className={`resource-button flex items-center justify-between px-3 py-2 rounded ${selectedResources.includes(resource.id) ? 'bg-blue-100 border border-blue-400 text-blue-800' : 'bg-gray-50 border border-gray-200 text-gray-700'}`}
                onClick={() => onResourceToggle(resource.id)}
                disabled={readOnly}
              >
                <span className="text-sm">{resource.title}</span>
                {selectedResources.includes(resource.id) ? (
                  <span className="text-xs bg-blue-200 px-2 py-0.5 rounded-full">Selected</span>
                ) : (
                  <span className="text-xs">Add</span>
                )}
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};

CommunicationSection.propTypes = {
  messageToPatient: PropTypes.string.isRequired,
  assessmentPlan: PropTypes.string.isRequired,
  followUpPlan: PropTypes.string.isRequired,
  messageTemplates: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
      category: PropTypes.string,
      isFrequent: PropTypes.bool,
    })
  ).isRequired,
  assessmentTemplates: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
      category: PropTypes.string,
      isFrequent: PropTypes.bool,
    })
  ).isRequired,
  onMessageChange: PropTypes.func.isRequired,
  onAssessmentChange: PropTypes.func.isRequired,
  onFollowUpChange: PropTypes.func.isRequired,
  readOnly: PropTypes.bool,
  medicationsSummary: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string,
      dose: PropTypes.string,
      frequency: PropTypes.string,
      duration: PropTypes.string,
      category: PropTypes.string,
    })
  ),
  resources: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      title: PropTypes.string.isRequired,
    })
  ),
  onResourceToggle: PropTypes.func,
  selectedResources: PropTypes.arrayOf(PropTypes.string),
  followUpOptions: PropTypes.arrayOf(PropTypes.string),
};

export default CommunicationSection;
