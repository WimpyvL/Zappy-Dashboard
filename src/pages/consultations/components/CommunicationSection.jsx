import React from 'react';
import PropTypes from 'prop-types';

const CommunicationSection = ({
  messageToPatient,
  assessmentPlan,
  followUpPlan,
  expandedMessage,
  expandedAssessment,
  messageTemplates,
  assessmentTemplates,
  onMessageChange,
  onAssessmentChange,
  onFollowUpChange,
  onExpandedMessageChange,
  onExpandedAssessmentChange,
  readOnly,
  medicationsSummary = [],
  resources = [],
  onResourceToggle = () => {},
  selectedResources = [],
  followUpOptions = ['2 weeks', '4 weeks', 'Monthly', '8 weeks', '12 weeks'],
}) => {
  // State for template visibility (can be managed internally or passed as props)
  const [showPatientMessageTemplates] = React.useState(true); // Removed unused setter
  const [showAssessmentTemplates] = React.useState(true); // Removed unused setter

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
          <div className="flex mb-2">
            <input
              type="text"
              className="flex-1 border border-blue-300 rounded-l-md p-2 text-sm focus:ring-primary focus:border-primary"
              value={messageToPatient}
              onChange={(e) => onMessageChange(e.target.value)}
              disabled={readOnly}
            />
            <button
              className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-r-md text-xs font-medium"
              disabled={readOnly}
            >
              Expand
            </button>
          </div>
          {showPatientMessageTemplates && !readOnly && (
            <div className="mt-2 space-x-2">
              <span className="text-xs font-medium text-gray-600">Templates:</span>
              {messageTemplates.map(template => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => {
                    onMessageChange(template.text); // Update short message
                    onExpandedMessageChange(template.text); // Update expanded message
                  }}
                  className="px-2 py-0.5 text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 rounded"
                >
                  {template.name}
                </button>
              ))}
            </div>
          )}
          <textarea
            className="w-full bg-white p-3 border border-blue-300 rounded-md text-sm italic min-h-32 mt-2 focus:ring-primary focus:border-primary"
            value={expandedMessage}
            onChange={(e) => onExpandedMessageChange(e.target.value)}
            disabled={readOnly}
          ></textarea>
        </div>
      </div>

      {/* Assessment & Plan Section */}
      <div className="border border-green-200 rounded-xl overflow-hidden mb-4 bg-green-50">
        <div className="bg-green-100 px-4 py-3 border-b border-green-200 flex justify-between items-center">
          <h3 className="text-base font-medium text-green-800">Assessment & Plan</h3>
          <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full">Clinical Notes</span>
        </div>
        <div className="p-4">
          <div className="flex mb-2">
            <input
              type="text"
              className="flex-1 border border-green-300 rounded-l-md p-2 text-sm focus:ring-primary focus:border-primary"
              value={assessmentPlan}
              onChange={(e) => onAssessmentChange(e.target.value)}
              placeholder="Enter brief assessment and plan..."
              disabled={readOnly}
            />
            <button
              className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-r-md text-xs font-medium"
              disabled={readOnly}
            >
              Expand
            </button>
          </div>
          {showAssessmentTemplates && !readOnly && (
            <div className="mt-2 space-x-2">
              <span className="text-xs font-medium text-gray-600">Templates:</span>
              {assessmentTemplates.map(template => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => {
                    onAssessmentChange(template.text); // Update short assessment
                    onExpandedAssessmentChange(template.text); // Update expanded assessment
                  }}
                  className="px-2 py-0.5 text-xs bg-gray-200 hover:bg-gray-300 text-gray-800 rounded"
                >
                  {template.name}
                </button>
              ))}
            </div>
          )}
          <textarea
            className="w-full bg-white p-3 border border-green-300 rounded-md text-sm italic min-h-32 mt-2 focus:ring-primary focus:border-primary"
            value={expandedAssessment}
            onChange={(e) => onExpandedAssessmentChange(e.target.value)}
            disabled={readOnly}
          ></textarea>
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
                className={`followup-option px-2 py-0.5 rounded ${followUpPlan === option ? 'bg-blue-200 border-blue-400 text-blue-900' : 'bg-white border border-gray-300 text-gray-700'}`}
                onClick={() => onFollowUpChange(option)}
                disabled={readOnly}
              >
                {option}
              </button>
            ))}
          </div>
          <select
            className="w-full border border-purple-300 rounded-md p-2 text-sm focus:ring-primary focus:border-primary"
            value={followUpPlan}
            onChange={(e) => onFollowUpChange(e.target.value)}
            disabled={readOnly}
          >
            {followUpOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
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
                className={`resource-button flex items-center justify-between px-2 py-1 rounded ${selectedResources.includes(resource.id) ? 'bg-blue-100 border-blue-400' : 'bg-gray-50 border border-gray-200'}`}
                onClick={() => onResourceToggle(resource.id)}
                disabled={readOnly}
              >
                <span>{resource.title}</span>
                <svg width="10" height="10" viewBox="0 0 24 24"><path d="M12 6v12M6 12h12" stroke="currentColor" strokeWidth="2"/></svg>
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
  expandedMessage: PropTypes.string.isRequired,
  expandedAssessment: PropTypes.string.isRequired,
  messageTemplates: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
    })
  ).isRequired,
  assessmentTemplates: PropTypes.arrayOf(
    PropTypes.shape({
      id: PropTypes.string.isRequired,
      name: PropTypes.string.isRequired,
      text: PropTypes.string.isRequired,
    })
  ).isRequired,
  onMessageChange: PropTypes.func.isRequired,
  onAssessmentChange: PropTypes.func.isRequired,
  onFollowUpChange: PropTypes.func.isRequired,
  onExpandedMessageChange: PropTypes.func.isRequired,
  onExpandedAssessmentChange: PropTypes.func.isRequired,
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
