import React from 'react';
import Modal from '../ui/Modal';

/**
 * MedicationInstructionsModal - A modal component for displaying detailed medication instructions
 * 
 * This component shows comprehensive information about a medication including
 * dosage, frequency, side effects, and other important details.
 */
const MedicationInstructionsModal = ({ 
  isOpen, 
  onClose, 
  medication 
}) => {
  if (!medication) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`${medication.name} Instructions`}
      size="md"
    >
      <div className="p-4 space-y-4">
        {/* Medication Image */}
        {medication.imageUrl && (
          <div className="flex justify-center mb-4">
            <div className="h-32 w-32 rounded-lg overflow-hidden">
              <img 
                src={medication.imageUrl} 
                alt={medication.name} 
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        )}
        
        {/* Basic Information */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Dosage & Administration</h3>
          <p className="text-gray-700">{medication.instructions || 'No specific instructions provided.'}</p>
        </div>
        
        {/* Detailed Instructions */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Important Information</h3>
          <div className="bg-blue-50 p-4 rounded-lg">
            <ul className="list-disc pl-5 space-y-2 text-gray-700">
              <li>Take this medication exactly as prescribed by your healthcare provider.</li>
              <li>Do not stop taking this medication without consulting your provider.</li>
              {medication.specialInstructions && medication.specialInstructions.map((instruction, index) => (
                <li key={index}>{instruction}</li>
              ))}
            </ul>
          </div>
        </div>
        
        {/* Side Effects */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Possible Side Effects</h3>
          <div className="bg-yellow-50 p-4 rounded-lg">
            <p className="text-gray-700 mb-2">Common side effects may include:</p>
            <ul className="list-disc pl-5 space-y-1 text-gray-700">
              {medication.sideEffects ? (
                medication.sideEffects.map((effect, index) => (
                  <li key={index}>{effect}</li>
                ))
              ) : (
                <>
                  <li>Headache</li>
                  <li>Nausea</li>
                  <li>Dizziness</li>
                  <li>Fatigue</li>
                </>
              )}
            </ul>
            <p className="mt-3 text-red-600 font-medium">
              Contact your healthcare provider immediately if you experience severe side effects.
            </p>
          </div>
        </div>
        
        {/* Refill Information */}
        <div>
          <h3 className="text-lg font-semibold mb-2">Refill Information</h3>
          <div className="bg-gray-50 p-4 rounded-lg">
            <div className="flex justify-between">
              <span className="text-gray-600">Last Refill:</span>
              <span className="font-medium">{medication.lastRefill || 'N/A'}</span>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-gray-600">Next Refill Available:</span>
              <span className="font-medium">{medication.nextRefill || 'N/A'}</span>
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-gray-600">Refills Remaining:</span>
              <span className="font-medium">{medication.refillsRemaining || 'N/A'}</span>
            </div>
          </div>
        </div>
        
        {/* Provider Notes */}
        {medication.providerNotes && (
          <div>
            <h3 className="text-lg font-semibold mb-2">Provider Notes</h3>
            <div className="bg-purple-50 p-4 rounded-lg">
              <p className="text-gray-700 italic">"{medication.providerNotes}"</p>
            </div>
          </div>
        )}
        
        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg text-sm font-medium hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default MedicationInstructionsModal;
