import React from 'react';
import Modal from '../ui/Modal';

/**
 * WeightConfirmationModal - A modal component for confirming weight logging
 * 
 * This component shows a confirmation message after a user logs their weight,
 * including a visual representation of their progress.
 */
const WeightConfirmationModal = ({ 
  isOpen, 
  onClose, 
  weight,
  previousWeight = null,
  goalWeight = null
}) => {
  // Calculate weight change
  const weightChange = previousWeight ? (weight - previousWeight).toFixed(1) : null;
  const isWeightLoss = weightChange && weightChange < 0;
  const isWeightGain = weightChange && weightChange > 0;
  
  // Calculate progress towards goal
  let progressPercentage = 0;
  if (goalWeight && previousWeight) {
    const totalNeededLoss = previousWeight - goalWeight;
    const actualLoss = previousWeight - weight;
    progressPercentage = Math.min(100, Math.max(0, (actualLoss / totalNeededLoss) * 100));
  }

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Weight Logged Successfully"
      size="sm"
    >
      <div className="p-4 space-y-4">
        {/* Current Weight */}
        <div className="text-center">
          <div className="text-3xl font-bold text-gray-800">{weight} lbs</div>
          <p className="text-gray-500 text-sm">Logged on {new Date().toLocaleDateString()}</p>
        </div>
        
        {/* Weight Change */}
        {weightChange && (
          <div className="bg-gray-50 p-4 rounded-lg text-center">
            <p className="text-sm text-gray-600 mb-1">Since last weigh-in:</p>
            <div className={`text-xl font-semibold ${isWeightLoss ? 'text-green-600' : isWeightGain ? 'text-red-500' : 'text-gray-700'}`}>
              {isWeightLoss ? '↓' : isWeightGain ? '↑' : ''} {Math.abs(weightChange)} lbs
              {isWeightLoss ? ' lost' : isWeightGain ? ' gained' : ''}
            </div>
          </div>
        )}
        
        {/* Goal Progress */}
        {goalWeight && (
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Goal Weight: {goalWeight} lbs</span>
              <span className="font-medium">{progressPercentage.toFixed(0)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div 
                className="bg-green-600 h-2.5 rounded-full" 
                style={{ width: `${progressPercentage}%` }}
              ></div>
            </div>
          </div>
        )}
        
        {/* Encouragement Message */}
        <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-r-lg">
          <p className="text-blue-700">
            {isWeightLoss ? 
              'Great job on your progress! Keep up the good work.' : 
              isWeightGain ? 
                'Remember, weight fluctuations are normal. Stay consistent with your plan.' : 
                'Consistency is key to reaching your goals. Keep tracking your progress!'}
          </p>
        </div>
        
        {/* Tips */}
        <div>
          <h3 className="text-sm font-medium text-gray-700 mb-2">Tips for Success:</h3>
          <ul className="text-sm text-gray-600 space-y-1 list-disc pl-5">
            <li>Weigh yourself at the same time each day</li>
            <li>Stay hydrated by drinking plenty of water</li>
            <li>Focus on nutritious, whole foods</li>
            <li>Incorporate regular physical activity</li>
          </ul>
        </div>
        
        {/* Action Buttons */}
        <div className="flex justify-end space-x-3 pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm font-medium hover:bg-blue-700"
          >
            Continue
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default WeightConfirmationModal;
