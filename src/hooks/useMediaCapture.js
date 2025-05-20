import { useState, useRef, useCallback } from 'react';

/**
 * Custom hook for handling file uploads and camera captures
 * @param {Object} options - Configuration options
 * @param {string[]} options.allowedFileTypes - Array of allowed MIME types
 * @param {number} options.maxFileSizeMB - Maximum file size in MB
 * @param {Function} options.onCapture - Callback function when media is captured
 * @returns {Object} - Media capture state and handlers
 */
const useMediaCapture = ({
  allowedFileTypes = ['image/jpeg', 'image/png', 'image/gif'],
  maxFileSizeMB = 5,
  onCapture
} = {}) => {
  // State
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [error, setError] = useState(null);
  const [captureMethod, setCaptureMethod] = useState('upload'); // 'upload' or 'camera'
  const [isCameraActive, setIsCameraActive] = useState(false);
  
  // Refs
  const fileInputRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  
  /**
   * Validates a file
   * @param {File} file - The file to validate
   * @returns {string|null} - Error message or null if valid
   */
  const validateFile = useCallback((file) => {
    if (!file) return 'No file selected';
    
    // Check file type
    if (!allowedFileTypes.includes(file.type)) {
      return `File type not supported. Please upload one of: ${allowedFileTypes.join(', ')}`;
    }
    
    // Check file size
    const maxSizeBytes = maxFileSizeMB * 1024 * 1024;
    if (file.size > maxSizeBytes) {
      return `File size must be less than ${maxFileSizeMB}MB`;
    }
    
    return null;
  }, [allowedFileTypes, maxFileSizeMB]);
  
  /**
   * Handles file upload
   * @param {Event} e - The file input change event
   */
  const handleFileUpload = useCallback((e) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;
    
    const validationError = validateFile(selectedFile);
    if (validationError) {
      setError(validationError);
      return;
    }
    
    // Create preview URL
    const objectUrl = URL.createObjectURL(selectedFile);
    setPreviewUrl(objectUrl);
    setFile(selectedFile);
    setError(null);
    
    if (onCapture) {
      onCapture({
        file: selectedFile,
        previewUrl: objectUrl,
        method: 'upload'
      });
    }
    
    // Reset file input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  }, [validateFile, onCapture]);
  
  /**
   * Opens the file selector dialog
   */
  const triggerFileInput = useCallback(() => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  }, []);
  
  /**
   * Starts the camera
   * @returns {Promise<boolean>} - Whether the camera was successfully started
   */
  const startCamera = useCallback(async () => {
    try {
      setCaptureMethod('camera');
      
      // Request camera access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'environment' } // Use back camera if available
      });
      
      // Store the stream reference for later cleanup
      streamRef.current = stream;
      
      // Set the video source
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      
      setIsCameraActive(true);
      setError(null);
      return true;
      
    } catch (error) {
      console.error('Error accessing camera:', error);
      setError('Could not access camera. Please check permissions or use file upload.');
      setCaptureMethod('upload');
      setIsCameraActive(false);
      return false;
    }
  }, []);
  
  /**
   * Stops the camera
   */
  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      const tracks = streamRef.current.getTracks();
      tracks.forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsCameraActive(false);
    setCaptureMethod('upload');
  }, []);
  
  /**
   * Captures an image from the camera
   */
  const captureFromCamera = useCallback(async () => {
    try {
      if (!videoRef.current || !isCameraActive) {
        setError('Camera is not active');
        return;
      }
      
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
      const capturedFile = new File([blob], 'captured-image.jpg', { type: 'image/jpeg' });
      
      // Create preview URL
      const objectUrl = URL.createObjectURL(blob);
      setPreviewUrl(objectUrl);
      setFile(capturedFile);
      setError(null);
      
      if (onCapture) {
        onCapture({
          file: capturedFile,
          previewUrl: objectUrl,
          method: 'camera'
        });
      }
      
      // Stop the camera stream
      stopCamera();
      
    } catch (error) {
      console.error('Error capturing image:', error);
      setError('Failed to capture image. Please try again or use file upload.');
    }
  }, [isCameraActive, onCapture, stopCamera]);
  
  /**
   * Clears the captured media
   */
  const clearMedia = useCallback(() => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    
    setFile(null);
    setPreviewUrl(null);
    setError(null);
    
    if (onCapture) {
      onCapture({
        file: null,
        previewUrl: null,
        method: null
      });
    }
  }, [previewUrl, onCapture]);
  
  /**
   * Switches between camera and upload methods
   * @param {string} method - The method to switch to ('upload' or 'camera')
   */
  const switchMethod = useCallback(async (method) => {
    if (method === 'camera') {
      await startCamera();
    } else {
      stopCamera();
      setCaptureMethod('upload');
    }
  }, [startCamera, stopCamera]);
  
  return {
    file,
    previewUrl,
    error,
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
  };
};

export default useMediaCapture;