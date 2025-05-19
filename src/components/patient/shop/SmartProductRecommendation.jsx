import React from 'react';
import { Sparkles, ArrowRight } from 'lucide-react';

const SmartProductRecommendation = ({ handleViewBundle, handleSkip }) => {
  return (
    <div className="ai-recommendation">
      <div className="ai-recommendation-title">
        <Sparkles />
        <span>AI Recommended for You</span>
      </div>
      <div className="ai-recommendation-content">
        <p className="text-gray-800 font-medium mb-2">Based on your health profile and goals:</p>
        <p className="text-gray-700">Our AI suggests the <strong>Complete Weight Management Bundle</strong> which includes GLP-1 medication, nutrition coaching, and progress tracking.</p>
      </div>
      <div className="ai-recommendation-actions">
        <button onClick={handleViewBundle}>View Bundle</button>
        <button onClick={handleSkip}>Skip</button>
      </div>
    </div>
  );
};

export default SmartProductRecommendation;
