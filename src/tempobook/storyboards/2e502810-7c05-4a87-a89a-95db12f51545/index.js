import React, { useState } from 'react';
import CommunicationSection from '@/pages/consultations/components/CommunicationSection';

export default function CommunicationSectionStoryboard() {
  // State for the component
  const [messageToPatient, setMessageToPatient] = useState(
    'Follow up in 2 weeks'
  );
  const [assessmentPlan, setAssessmentPlan] = useState(
    'Patient presents with mild hypertension'
  );
  const [followUpPlan, setFollowUpPlan] = useState('2_weeks');
  const [expandedMessage, setExpandedMessage] = useState(
    'Dear Patient,\n\nThank you for your visit today. Based on our consultation, I recommend you follow up in 2 weeks to reassess your progress.\n\nBest regards,\nDr. Smith'
  );
  const [expandedAssessment, setExpandedAssessment] = useState(
    'Patient presents with mild hypertension (140/90). Currently on lisinopril 10mg daily. Recommended lifestyle modifications including reduced sodium intake and regular exercise. Will reassess in 2 weeks.'
  );

  // Mock templates
  const messageTemplates = [
    {
      id: 1,
      name: 'Follow-up',
      text: 'Please schedule a follow-up appointment in the recommended timeframe.',
    },
    {
      id: 2,
      name: 'Medication',
      text: 'Please take your medication as prescribed and report any side effects.',
    },
    {
      id: 3,
      name: 'Lab Results',
      text: 'Your lab results have been reviewed. Please see the attached report.',
    },
  ];

  const assessmentTemplates = [
    {
      id: 1,
      name: 'Hypertension',
      text: 'Patient presents with hypertension. BP readings above normal range. Recommend lifestyle modifications and medication.',
    },
    {
      id: 2,
      name: 'Diabetes',
      text: 'Patient presents with elevated blood glucose levels consistent with Type 2 Diabetes. HbA1c: 7.2%.',
    },
    {
      id: 3,
      name: 'Anxiety',
      text: 'Patient reports symptoms consistent with generalized anxiety disorder. Recommend CBT and consider medication.',
    },
  ];

  return (
    <div className="bg-white p-4">
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-4">Communication Section</h2>
        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700">
            Read-only Mode:
          </label>
          <div className="mt-1">
            <CommunicationSection
              messageToPatient={messageToPatient}
              assessmentPlan={assessmentPlan}
              followUpPlan={followUpPlan}
              expandedMessage={expandedMessage}
              expandedAssessment={expandedAssessment}
              messageTemplates={messageTemplates}
              assessmentTemplates={assessmentTemplates}
              onMessageChange={() => {}}
              onAssessmentChange={() => {}}
              onFollowUpChange={() => {}}
              onExpandedMessageChange={() => {}}
              onExpandedAssessmentChange={() => {}}
              readOnly={true}
            />
          </div>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Editable Mode</h2>
        <CommunicationSection
          messageToPatient={messageToPatient}
          assessmentPlan={assessmentPlan}
          followUpPlan={followUpPlan}
          expandedMessage={expandedMessage}
          expandedAssessment={expandedAssessment}
          messageTemplates={messageTemplates}
          assessmentTemplates={assessmentTemplates}
          onMessageChange={setMessageToPatient}
          onAssessmentChange={setAssessmentPlan}
          onFollowUpChange={setFollowUpPlan}
          onExpandedMessageChange={setExpandedMessage}
          onExpandedAssessmentChange={setExpandedAssessment}
          readOnly={false}
        />
      </div>
    </div>
  );
}
