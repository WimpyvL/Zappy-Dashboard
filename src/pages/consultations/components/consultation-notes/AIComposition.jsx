import React, { useState } from 'react';
import { RefreshCw, Check, X } from 'lucide-react';

const AIComposition = ({ 
  onGenerate, 
  onAccept, 
  placeholder = "AI will generate content here...",
  buttonText = "AI Compose",
  buttonIcon = <RefreshCw size={14} className="mr-1" />,
  buttonClass = "bg-purple-500 hover:bg-purple-600"
}) => {
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');
  const [showContent, setShowContent] = useState(false);
  
  const handleGenerate = async () => {
    setIsGenerating(true);
    setShowContent(true);
    
    try {
      // Call the onGenerate function passed as prop
      const content = await onGenerate();
      setGeneratedContent(content);
    } catch (error) {
      console.error('Error generating content:', error);
      setGeneratedContent('Failed to generate content. Please try again.');
    } finally {
      setIsGenerating(false);
    }
  };
  
  const handleAccept = () => {
    if (onAccept && generatedContent) {
      onAccept(generatedContent);
      setShowContent(false);
    }
  };
  
  const handleCancel = () => {
    setShowContent(false);
  };
  
  return (
    <div className="ai-composition">
      {/* AI Compose Button */}
      <button
        className={`px-2 py-1 ${buttonClass} text-white text-xs rounded flex items-center`}
        onClick={handleGenerate}
        disabled={isGenerating}
      >
        {isGenerating ? (
          <RefreshCw size={14} className="mr-1 animate-spin" />
        ) : (
          buttonIcon
        )}
        {buttonText}
      </button>
      
      {/* Generated Content Panel */}
      {showContent && (
        <div className="mt-2 border border-purple-200 rounded-md bg-purple-50 p-3">
          <div className="flex justify-between items-center mb-2">
            <h4 className="text-sm font-medium text-purple-700">AI Generated Content</h4>
            <div className="flex gap-2">
              <button
                className="p-1 bg-green-100 text-green-700 rounded-md hover:bg-green-200"
                onClick={handleAccept}
                disabled={isGenerating || !generatedContent}
                title="Accept"
              >
                <Check size={16} />
              </button>
              <button
                className="p-1 bg-red-100 text-red-700 rounded-md hover:bg-red-200"
                onClick={handleCancel}
                title="Cancel"
              >
                <X size={16} />
              </button>
            </div>
          </div>
          
          <div className="bg-white border border-purple-100 rounded-md p-2 min-h-[80px] text-sm">
            {isGenerating ? (
              <div className="flex items-center justify-center h-full text-purple-500">
                <RefreshCw size={20} className="animate-spin mr-2" />
                <span>Generating content...</span>
              </div>
            ) : (
              <div className="prose prose-sm max-w-none">
                {generatedContent || placeholder}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AIComposition;
