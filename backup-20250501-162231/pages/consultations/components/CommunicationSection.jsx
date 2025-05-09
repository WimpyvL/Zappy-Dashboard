import React from 'react';

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
}) => {
  // State for template visibility (can be managed internally or passed as props)
  const [showPatientMessageTemplates] = React.useState(true); // Removed unused setter
  const [showAssessmentTemplates] = React.useState(true); // Removed unused setter

  return (
    <>
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
              // onClick={() => setExpandedMessage(messageToPatient)} // Example: Expand logic
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
              // onClick={() => setExpandedAssessment(assessmentPlan)} // Example: Expand logic
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
          <select
            className="w-full border border-purple-300 rounded-md p-2 text-sm focus:ring-primary focus:border-primary"
            value={followUpPlan}
            onChange={(e) => onFollowUpChange(e.target.value)}
            disabled={readOnly}
          >
            <option value="2_weeks">2 weeks</option>
            <option value="4_weeks">4 weeks</option>
            <option value="Monthly">Monthly</option>
            <option value="8_weeks">8 weeks</option>
            <option value="12_weeks">12 weeks</option>
          </select>
        </div>
      </div>
    </>
  );
};

export default CommunicationSection;
