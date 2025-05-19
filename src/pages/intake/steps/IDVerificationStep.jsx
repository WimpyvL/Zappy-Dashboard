import React, { useState, useRef } from 'react';
import { Camera, Upload, Check, AlertTriangle } from 'lucide-react';

const IDVerificationStep = ({ 
  formData, 
  updateFormData, 
  onNext,
  onPrevious
}) => {
  const { idVerification = {} } = formData;
  
  // Local state
  const [errors, setErrors] = useState({});
  const [isVerifying, setIsVerifying] = useState(false);
  const [captureMethod, setCaptureMethod] = useState('upload'); // 'upload' or 'camera'
  const [previewImage, setPreviewImage] = useState(idVerification.previewUrl || null);
  const [verificationStatus, setVerificationStatus] = useState(idVerification.status || 'not_started'); // 'not_started', 'pending', 'verified', 'failed'
  
  // Refs
  const fileInputRef = useRef(null);
  const cameraRef = useRef(null);
  const videoRef = useRef(null);
  
  // Handle file upload
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Check file type
    if (!file.type.includes('image/')) {
      setErrors({ file: 'Please upload an image file (JPG, PNG, etc.)' });
      return;
    }
    
    // Check file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setErrors({ file: 'File size must be less than 5MB' });
      return;
    }
    
    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setPreviewImage(previewUrl);
    
    // Update form data
    updateFormData('idVerification', { 
      file,
      previewUrl,
      status: 'pending'
    });
    
    setVerificationStatus('pending');
    setErrors({});
  };
  
  // Handle camera capture
  const handleCameraCapture = async () => {
    try {
      if (!videoRef.current) return;
      
      // Create a canvas element to capture the image
      const canvas = document.createElement('canvas');
      canvas.width = videoRef.current.videoWidth;
      canvas.height = videoRef.current.videoHeight;
      
      // Draw the video frame to the canvas
      const ctx = canvas.getContext('2d');
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      
      // Convert canvas to blob
      const blob = await new Promise(resolve => canvas.toBlob(resolve, 'image/jpeg', 0.8));
      
      // Create a file from the blob
      const file = new File([blob], 'id-photo.jpg', { type: 'image/jpeg' });
      
      // Create preview URL
      const previewUrl = URL.createObjectURL(blob);
      setPreviewImage(previewUrl);
      
      // Update form data
      updateFormData('idVerification', { 
        file,
        previewUrl,
        status: 'pending'
      });
      
      setVerificationStatus('pending');
      setErrors({});
      
      // Stop the camera stream
      stopCamera();
      
    } catch (error) {
      console.error('Error capturing image:', error);
      setErrors({ camera: 'Failed to capture image. Please try again or use file upload.' });
    }
  };
  
  // Start camera
  const startCamera = async () => {
    try {
      setCaptureMethod('camera');
      
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera if available
      });
      
      // Set the video source
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
    } catch (error) {
      console.error('Error accessing camera:', error);
      setErrors({ camera: 'Could not access camera. Please check permissions or use file upload.' });
      setCaptureMethod('upload');
    }
  };
  
  // Stop camera
  const stopCamera = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const tracks = videoRef.current.srcObject.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setCaptureMethod('upload');
  };
  
  // Handle verification submission
  const handleVerify = async () => {
    if (!idVerification.file) {
      setErrors({ file: 'Please upload or capture an ID image first' });
      return;
    }
    
    setIsVerifying(true);
    
    try {
      // In a real implementation, this would be an API call to Stripe's verification service
      // For now, we'll simulate a delay and success
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful verification
      updateFormData('idVerification', { 
        ...idVerification,
        status: 'verified',
        verifiedAt: new Date().toISOString()
      });
      
      setVerificationStatus('verified');
      
    } catch (error) {
      console.error('Error verifying ID:', error);
      setErrors({ verification: 'ID verification failed. Please try again with a clearer image.' });
      setVerificationStatus('failed');
    } finally {
      setIsVerifying(false);
    }
  };
  
  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validate form
    if (verificationStatus !== 'verified') {
      setErrors({ verification: 'Please complete ID verification before continuing' });
      return;
    }
    
    // Proceed to next step
    onNext();
  };
  
  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">ID Verification</h2>
      <p className="text-gray-600 mb-6">
        Please provide a government-issued photo ID for verification. This is required for prescription medications.
      </p>
      
      <form onSubmit={handleSubmit}>
        {/* ID Verification Status */}
        {verificationStatus === 'verified' && (
          <div className="mb-6 p-4 bg-green-50 rounded-md">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <Check className="h-5 w-5 text-green-600" />
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
          <div className="mb-6 p-4 bg-red-50 rounded-md">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <AlertTriangle className="h-5 w-5 text-red-600" />
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-red-800">ID Verification Failed</h3>
                <p className="mt-2 text-sm text-red-700">
                  We couldn't verify your ID. Please try again with a clearer image.
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
                onClick={() => {
                  stopCamera();
                  setCaptureMethod('upload');
                }}
              >
                <div className="flex items-center justify-center">
                  <Upload className="w-4 h-4 mr-2" />
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
                onClick={startCamera}
              >
                <div className="flex items-center justify-center">
                  <Camera className="w-4 h-4 mr-2" />
                  Use Camera
                </div>
              </button>
            </div>
            
            {/* File Upload UI */}
            {captureMethod === 'upload' && (
              <div className="mt-4">
                <div 
                  className="border-2 border-dashed border-gray-300 rounded-md p-6 text-center cursor-pointer hover:border-blue-500 transition-colors"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <input
                    type="file"
                    ref={fileInputRef}
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileUpload}
                  />
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">
                    Click to upload or drag and drop
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    PNG, JPG, GIF up to 5MB
                  </p>
                </div>
                {errors.file && (
                  <p className="mt-2 text-sm text-red-600">{errors.file}</p>
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
                    onClick={handleCameraCapture}
                  >
                    Capture Photo
                  </button>
                </div>
                {errors.camera && (
                  <p className="mt-2 text-sm text-red-600">{errors.camera}</p>
                )}
              </div>
            )}
          </div>
        )}
        
        {/* Preview Image */}
        {previewImage && (
          <div className="mb-6">
            <h3 className="text-sm font-medium text-gray-700 mb-2">ID Preview</h3>
            <div className="relative rounded-md overflow-hidden border border-gray-300">
              <img 
                src={previewImage} 
                alt="ID Preview" 
                className="w-full h-auto max-h-64 object-contain"
              />
              {verificationStatus !== 'verified' && (
                <button
                  type="button"
                  className="absolute top-2 right-2 bg-red-600 text-white p-1 rounded-full hover:bg-red-700 transition-colors"
                  onClick={() => {
                    setPreviewImage(null);
                    updateFormData('idVerification', { 
                      file: null,
                      previewUrl: null,
                      status: 'not_started'
                    });
                    setVerificationStatus('not_started');
                  }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              )}
            </div>
          </div>
        )}
        
        {/* Verification Button */}
        {previewImage && verificationStatus !== 'verified' && (
          <div className="mb-6">
            <button
              type="button"
              className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors flex items-center justify-center"
              onClick={handleVerify}
              disabled={isVerifying}
            >
              {isVerifying ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Verifying ID...
                </>
              ) : (
                'Verify ID'
              )}
            </button>
            {errors.verification && (
              <p className="mt-2 text-sm text-red-600">{errors.verification}</p>
            )}
          </div>
        )}
        
        {/* ID Requirements */}
        <div className="mb-6 p-4 bg-gray-50 rounded-md">
          <h3 className="text-sm font-medium text-gray-700 mb-2">ID Requirements</h3>
          <ul className="text-sm text-gray-600 space-y-1">
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Government-issued photo ID (driver's license, passport, etc.)</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>ID must be valid and not expired</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>All four corners of the ID must be visible</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
              <span>Information must be clearly readable</span>
            </li>
            <li className="flex items-start">
              <span className="text-green-500 mr-2">✓</span>
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
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  );
};

export default IDVerificationStep;
