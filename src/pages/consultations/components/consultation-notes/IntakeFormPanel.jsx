import React from 'react';
import { usePatientFormSubmissions } from '../../../../apis/formSubmissions/hooks';
import { Pill } from 'lucide-react';

const IntakeFormPanel = ({ patientId, showIntakeForm, toggleIntakeForm }) => {
  // Fetch patient's form submissions
  const { data: formSubmissions, isLoading } = usePatientFormSubmissions(patientId);
  
  // Get the latest submission for each category
  const latestSubmissions = React.useMemo(() => {
    if (!formSubmissions) return {};
    
    const submissions = {};
    formSubmissions.forEach(submission => {
      const categoryId = submission.category_id;
      if (!submissions[categoryId] || 
          new Date(submission.submitted_at) > new Date(submissions[categoryId].submitted_at)) {
        submissions[categoryId] = submission;
      }
    });
    
    return submissions;
  }, [formSubmissions]);

  // Recursive function to render form data
  const renderFormData = (data) => {
    if (typeof data !== 'object' || data === null) {
      return <p>{String(data)}</p>;
    }

    if (Array.isArray(data)) {
      return (
        <ul>
          {data.map((item, index) => (
            <li key={index}>{renderFormData(item)}</li>
          ))}
        </ul>
      );
    }

    return (
      <div>
        {Object.entries(data).map(([key, value]) => (
          <div key={key} style={{ marginBottom: '8px' }}>
            <span style={{ fontWeight: 600 }}>{key.replace(/([A-Z])/g, ' $1').trim()}:</span> {renderFormData(value)}
          </div>
        ))}
      </div>
    );
  };

  // Render product preference
  const renderProductPreference = (submission) => {
    if (!submission.preferred_product_id) return null;

    return (
      <div className="mt-4 p-3 bg-blue-50 rounded-md border border-blue-100">
        <h4 className="text-sm font-medium text-blue-800">Preferred Medication</h4>
        <div className="flex items-center mt-2">
          <div className="w-10 h-10 bg-white rounded-md flex items-center justify-center mr-3">
            <Pill className="w-6 h-6 text-blue-500" />
          </div>
          <div>
            <p className="font-medium">{submission.product_name || 'Selected medication'}</p>
            <p className="text-sm text-gray-600">Patient's preferred treatment option</p>
          </div>
        </div>
      </div>
    );
  };

  // Early return if panel is not shown
  if (!showIntakeForm) return null;

  return (
    <div className="ai-panel" style={{ display: 'flex' }}>
      <div className="ai-panel-content">
        <div className="panel-header">
          <h3>View Intake Form</h3>
          <button className="close-button" onClick={toggleIntakeForm}>×</button>
        </div>
        <div>
          {isLoading ? (
            <p>Loading intake form data...</p>
          ) : Object.keys(latestSubmissions).length > 0 ? (
            <div>
              {Object.values(latestSubmissions).map(submission => (
                <div key={submission.id} className="mb-6">
                  <h4 style={{ fontSize: '16px', marginBottom: '8px' }}>{submission.category_id.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Intake</h4>
                  {renderFormData(submission.form_data)}

                  {/* Render the product preference */}
                  {renderProductPreference(submission)}
                </div>
              ))}

              <div style={{ marginTop: '16px', fontSize: '14px', color: '#666' }}>
                <p>Submitted on: {new Date(Object.values(latestSubmissions)[0].submitted_at).toLocaleDateString()}</p>
              </div>
            </div>
          ) : (
            <div>
              <p>No intake form data available for this patient.</p>

              {/* Fallback static data */}
              <div style={{ marginTop: '12px' }}>
                <h4 style={{ fontSize: '16px', marginBottom: '8px' }}>Patient Information</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '15px' }}>
                  <div><strong>Name:</strong> Sarah Johnson</div>
                  <div><strong>DOB:</strong> 05/12/1982 (43y)</div>
                  <div><strong>Gender:</strong> Female</div>
                  <div><strong>MRN:</strong> 12345678</div>
                </div>
              </div>

              <div style={{ marginTop: '16px' }}>
                <h4 style={{ fontSize: '16px', marginBottom: '8px' }}>Vitals</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '15px' }}>
                  <div><strong>BP:</strong> 118/76</div>
                  <div><strong>HR:</strong> 72 bpm</div>
                  <div><strong>Weight:</strong> 182 lbs</div>
                  <div><strong>Height:</strong> 5'3"</div>
                  <div><strong>BMI:</strong> 32.4</div>
                  <div><strong>A1C:</strong> 5.6%</div>
                </div>
              </div>

              <div style={{ marginTop: '16px' }}>
                <h4 style={{ fontSize: '16px', marginBottom: '8px' }}>Medical History</h4>
                <ul style={{ fontSize: '15px', paddingLeft: '20px', margin: '0' }}>
                  <li>Hypothyroidism (controlled on levothyroxine)</li>
                  <li>Pre-diabetes (new diagnosis)</li>
                  <li>Seasonal allergies</li>
                </ul>
              </div>

              <div style={{ marginTop: '16px' }}>
                <h4 style={{ fontSize: '16px', marginBottom: '8px' }}>Current Medications</h4>
                <ul style={{ fontSize: '15px', paddingLeft: '20px', margin: '0' }}>
                  <li>Levothyroxine 75mcg daily</li>
                  <li>OTC Cetirizine 10mg PRN for allergies</li>
                </ul>
              </div>

              <div style={{ marginTop: '16px' }}>
                <h4 style={{ fontSize: '16px', marginBottom: '8px' }}>Allergies</h4>
                <ul style={{ fontSize: '15px', paddingLeft: '20px', margin: '0' }}>
                  <li>Penicillin (hives)</li>
                  <li>Sulfa drugs (rash)</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default IntakeFormPanel;
