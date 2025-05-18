import React, { useState } from 'react';
import PatientInfoSection from '@/pages/consultations/components/PatientInfoSection';

export default function PatientInfoSectionStoryboard() {
  // State for the component
  const [hpi, setHpi] = useState(
    'Patient is a 45-year-old male presenting with a 2-week history of intermittent headaches, primarily in the morning. Describes pain as "throbbing" and rates it 6/10 on pain scale. No previous history of migraines. Headaches sometimes accompanied by mild nausea but no vomiting. No visual disturbances reported.'
  );

  const [pmh, setPmh] = useState(
    'Hypertension (diagnosed 2018)\nType 2 Diabetes (diagnosed 2020)\nNo known allergies\nNo previous surgeries'
  );

  const [contraindications, setContraindications] = useState(
    'Patient reports adverse reaction to NSAIDs (stomach upset)\nCurrently taking lisinopril 10mg daily and metformin 500mg twice daily'
  );

  return (
    <div className="bg-white p-4">
      <div className="mb-4">
        <h2 className="text-xl font-bold mb-4">Read-only Mode</h2>
        <PatientInfoSection
          hpi={hpi}
          pmh={pmh}
          contraindications={contraindications}
          onHpiChange={() => {}}
          onPmhChange={() => {}}
          onContraindicationsChange={() => {}}
          readOnly={true}
        />
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Editable Mode</h2>
        <PatientInfoSection
          hpi={hpi}
          pmh={pmh}
          contraindications={contraindications}
          onHpiChange={setHpi}
          onPmhChange={setPmh}
          onContraindicationsChange={setContraindications}
          readOnly={false}
        />
      </div>
    </div>
  );
}
