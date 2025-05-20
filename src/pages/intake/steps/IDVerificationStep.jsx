import React from 'react';
import PropTypes from 'prop-types';
import { Camera, Upload, Check, AlertTriangle } from 'lucide-react';
import { ErrorBoundary } from '../../../components/common/ErrorBoundary';
import { FormError } from '../../../components/common/FormError';
import useMediaCapture from '../../../hooks/useMediaCapture';
import useIDVerification from '../../../hooks/useIDVerification';

/**
 * IDVerificationStep component - Handles ID verification process
 */
const IDVerificationStep = ({ 
  formData, 
  updateFormData, 
  onNext,
  onPrevious
}) => {
  const { idVerification = {} } = formData;
  
  // Initialize media capture hook
  const {
    file,
    previewUrl,
    error: captureError,
    captureMethod,
    isCameraActive,
    fileInputRef,
    videoRef,
    handleFileUpload,
    triggerFileInput,
    startCamera,
    stopCamera,
    captureFromCamera,
    clearMedia,
    switchMethod
  } = useMediaCapture({
    allowedFileTypes: ['image/jpeg', 'image/png', 'image/gif'],
    maxFileSizeMB: 5,
    onCapture: (captureData) => {
      updateFormData('idVerification', {
        file: captureData.file,
        previewUrl: captureData.previewUrl,
        status: captureData.file ? 'pending' : 'not_started'
      });
    }
  });
  
  // Initialize ID verification hook
  const {
    verificationStatus,
    isVerifying,
    error: verificationError,
    verifiedAt,
    verifyID,
    isIDVerified
  } = useIDVerification({
    onVerificationSuccess: (data) => {
      updateFormData('idVerification', {
        status: 'verified',
        verifiedAt: data.verifiedAt
      });
    },
    onVerificationFailure: (error) => {
      console.error('Verification failed:', error);
    }
  });
  
  // Handle verification submission
  const handleVerify = async () => {
    if (!file) return;
    
    await verifyID({ file, previewUrl });
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (verificationStatus !== 'verified') {
      return;
    }
    
    // Proceed to next step
    onNext();
  };
  
  return (
    <ErrorBoundary>
      <div>
        <h2 className="text-xl font-semibold mb-4">ID Verification</h2>
        <p className="text-gray-600 mb-6">
          Please provide a government-issued photo ID for verification. This is required for prescription medications.
        </p>
        
        <form onSubmit={handleSubmit}>
          {/* ID Verification Status */}
          {verificationStatus === 'verified' && (
            <div className="mb-6 p-4 bg-green-50 rounded-md" role="status" aria-live="polite">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <Check className="h-5 w-5 text-green-600" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-green-800">ID Verification Successful</h3>
                  <p className="mt-2 text-sm text-green-700">
                    Your ID has been verified successfully. You can now proceed to the next step.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {verificationStatus === 'failed' && (
            <div className="mb-6 p-4 bg-red-50 rounded-md" role="alert">
              <div className="flex items-start">
                <div className="flex-shrink-0">
                  <AlertTriangle className="h-5 w-5 text-red-600" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-red-800">ID Verification Failed</h3>
                  <p className="mt-2 text-sm text-red-700">
                    {verificationError || "We couldn't verify your ID. Please try again with a clearer image."}
                  </p>
                </div>
              </div>
            </div>
          )}
          
          {/* ID Capture Methods */}
          {verificationStatus !== 'verified' && (
            <div className="mb-6">
              <div className="flex space-x-4 mb-4">
                <button
                  type="button"
                  className={`flex-1 py-2 px-4 rounded-md ${
                    captureMethod === 'upload' 
                      ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                      : 'bg-gray-100 text-gray-700 border border-gray-300'
                  }`}
                  onClick={() => switchMethod('upload')}
                  aria-pressed={captureMethod === 'upload'}
                >
                  <div className="flex items-center justify-center">
                    <Upload className="w-4 h-4 mr-2" aria-hidden="true" />
                    Upload ID
                  </div>
                </button>
                
                <button
                  type="button"
                  className={`flex-1 py-2 px-4 rounded-md ${
                    captureMethod === 'camera' 
                      ? 'bg-blue-100 text-blue-700 border border-blue-300' 
                      : 'bg-gray-100 text-gray-700 border border-gray-300'
                  }`}
                  onClick={() => switchMethod('camera')}
                  aria-pressed={captureMethod === 'camera'}
                >
                  <div className="flex items-center justify-center">
                    <Camera className="w-4 h-4 mr-2" aria-hidden="true" />
                    Use Camera
                  </div>
                </button>
              </div>
              
              {/* File Upload UI */}
              {captureMethod === 'upload' && (
                <div className="mt-4">
                  <div 
                    className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
                    onClick={triggerFileInput}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        triggerFileInput();
                      }
                    }}
                    tabIndex={0}
                    role="button"
                    aria-label="Upload ID image"
                  >
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileUpload}
                      aria-hidden="true"
                    />
                    <Upload className="mx-auto h-12 w-12 text-gray-400" aria-hidden="true" />
                    <p className="mt-2 text-sm text-gray-600">
                      Click to upload or drag and drop
                    </p>
                    <p className="mt-1 text-xs text-gray-500">
                      PNG, JPG, GIF up to 5MB
                    </p>
                  </div>
                  {captureError && (
                    <FormError error={captureError} className="mt-2" />
                  )}
                </div>
              )}
              
              {/* Camera UI */}
              {captureMethod === 'camera' && (
                <div className="mt-4">
                  <div className="relative rounded-md overflow-hidden bg-black aspect-video">
                    <video
                      ref={videoRef}
                      autoPlay
                      playsInline
                      className="w-full h-full object-cover"
                      aria-label="Camera preview"
                    />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="absolute inset-0 border-2 border-white border-dashed opacity-70 m-8 rounded-md"></div>
                      <p className="text-white text-sm bg-black bg-opacity-50 p-2 rounded">
                        Position your ID within the frame
                      </p>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-center">
                    <button
                      type="button"
                      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                      onClick={captureFromCamera}
                      disabled={!isCameraActive}
                      aria-label="Capture ID photo"
                    >
                      Capture Photo
                    </button>
                  </div>
                  {captureError && (
                    <FormError error={captureError} className="mt-2" />
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Preview Image */}
          {previewUrl && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-gray-700 mb-2">ID Preview</h3>
              <div className="relative rounded-md overflow-hidden border border-gray-300">
                <img 
                  src={previewUrl} 
                  alt="ID Preview" 
                  className="w-full h-auto max-h-64 object-contain"
                />
                {verificationStatus !== 'verified' && (
                  <button
                    type="button"
                    className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition-colors"
                    onClick={clearMedia}
                    aria-label="Remove ID image"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )}
          
          {/* Verification Button */}
          {previewUrl && verificationStatus !== 'verified' && (
            <div className="mb-6">
              <button
                type="button"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
                onClick={handleVerify}
                disabled={isVerifying}
                aria-busy={isVerifying}
              >
                {isVerifying ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" aria-hidden="true">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Verifying ID...
                  </>
                ) : (
                  'Verify ID'
                )}
              </button>
              {verificationError && (
                <FormError error={verificationError} className="mt-2" />
              )}
            </div>
          )}
          
          {/* ID Requirements */}
          <div className="mb-6 p-4 bg-gray-50 rounded-md">
            <h3 className="text-sm font-medium text-gray-700 mb-2">ID Requirements</h3>
            <ul className="text-sm text-gray-600 space-y-1" aria-label="ID requirements list">
              <li className="flex items-start">
                <span className="text-green-500 mr-2" aria-hidden="true">✓</span>
                <span>Government-issued photo ID (driver's license, passport, etc.)</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2" aria-hidden="true">✓</span>
                <span>ID must be valid and not expired</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2" aria-hidden="true">✓</span>
                <span>All four corners of the ID must be visible</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2" aria-hidden="true">✓</span>
                <span>Information must be clearly readable</span>
              </li>
              <li className="flex items-start">
                <span className="text-green-500 mr-2" aria-hidden="true">✓</span>
                <span>No glare or shadows covering important information</span>
              </li>
            </ul>
          </div>
          
          {/* Privacy Notice */}
          <div className="mb-6">
            <p className="text-xs text-gray-500">
              Your ID is securely processed and stored in compliance with HIPAA regulations. We use industry-standard encryption to protect your personal information. Your ID will only be used for verification purposes and will not be shared with third parties.
            </p>
          </div>
          
          <div className="flex justify-between mt-8">
            <button
              type="button"
              onClick={onPrevious}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              disabled={isVerifying}
            >
              Back
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              disabled={isVerifying || verificationStatus !== 'verified'}
              aria-disabled={isVerifying || verificationStatus !== 'verified'}
            >
              Continue
            </button>
          </div>
        </form>
      </div>
    </ErrorBoundary>
  );
};

IDVerificationStep.propTypes = {
  formData: PropTypes.object.isRequired,
  updateFormData: PropTypes.func.isRequired,
  onNext: PropTypes.func.isRequired,
  onPrevious: PropTypes.func.isRequired
};

export default IDVerificationStep;
