import { useState, useCallback } from 'react';

/**
 * Custom hook for handling ID verification logic
 * @param {Object} options - Configuration options
 * @param {Function} options.onVerificationSuccess - Callback when verification succeeds
 * @param {Function} options.onVerificationFailure - Callback when verification fails
 * @returns {Object} - ID verification state and handlers
 */
const useIDVerification = ({
  onVerificationSuccess,
  onVerificationFailure
} = {}) => {
  // State
  const [verificationStatus, setVerificationStatus] = useState('not_started'); // 'not_started', 'pending', 'verified', 'failed'
  const [isVerifying, setIsVerifying] = useState(false);
  const [error, setError] = useState(null);
  const [verifiedAt, setVerifiedAt] = useState(null);
  
  /**
   * Initiates the ID verification process
   * @param {Object} idData - The ID data to verify
   * @param {File} idData.file - The ID image file
   * @returns {Promise<boolean>} - Whether the verification was successful
   */
  const verifyID = useCallback(async (idData) => {
    if (!idData?.file) {
      const errorMessage = 'Please upload or capture an ID image first';
      setError(errorMessage);
      return false;
    }
    
    setIsVerifying(true);
    setVerificationStatus('pending');
    setError(null);
    
    try {
      // In a real implementation, this would be an API call to a verification service
      // For now, we'll simulate a delay and success
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Simulate successful verification
      const timestamp = new Date().toISOString();
      setVerifiedAt(timestamp);
      setVerificationStatus('verified');
      
      if (onVerificationSuccess) {
        onVerificationSuccess({
          status: 'verified',
          verifiedAt: timestamp,
          idData
        });
      }
      
      return true;
      
    } catch (error) {
      console.error('Error verifying ID:', error);
      const errorMessage = error.message || 'ID verification failed. Please try again with a clearer image.';
      setError(errorMessage);
      setVerificationStatus('failed');
      
      if (onVerificationFailure) {
        onVerificationFailure(error);
      }
      
      return false;
      
    } finally {
      setIsVerifying(false);
    }
  }, [onVerificationSuccess, onVerificationFailure]);
  
  /**
   * Resets the verification state
   */
  const resetVerification = useCallback(() => {
    setVerificationStatus('not_started');
    setIsVerifying(false);
    setError(null);
    setVerifiedAt(null);
  }, []);
  
  /**
   * Checks if the ID is verified
   * @returns {boolean} - Whether the ID is verified
   */
  const isIDVerified = useCallback(() => {
    return verificationStatus === 'verified' && verifiedAt !== null;
  }, [verificationStatus, verifiedAt]);
  
  return {
    verificationStatus,
    isVerifying,
    error,
    verifiedAt,
    verifyID,
    resetVerification,
    isIDVerified
  };
};

export default useIDVerification;