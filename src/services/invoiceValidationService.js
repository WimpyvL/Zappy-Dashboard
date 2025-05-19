/**
 * Service for validating invoice creation
 */

/**
 * Checks if an invoice should be created for a follow-up
 * 
 * @param {string} patientId - The patient ID
 * @param {string} followUpPeriod - The follow-up period (e.g., '2w', '4w')
 * @returns {Promise<{shouldCreate: boolean, reason?: string}>} - Whether to create an invoice and reason if not
 */
export const shouldCreateInvoice = async (patientId, followUpPeriod) => {
  try {
    // Import required services
    const { getPatientSubscriptions } = await import('./subscriptionService');
    const { getPatientInvoices } = await import('./invoiceService');
    
    // Check if patient has active subscription
    const { data: subscriptions } = await getPatientSubscriptions(patientId);
    const hasActiveSubscription = subscriptions?.some(sub => 
      sub.status === 'active' && sub.includes_followups
    );
    
    if (hasActiveSubscription) {
      return {
        shouldCreate: false,
        reason: 'Patient has active subscription that covers follow-ups'
      };
    }
    
    // Check if patient has pending invoice for this type of follow-up
    const { data: invoices } = await getPatientInvoices(patientId);
    const hasPendingFollowUpInvoice = invoices?.some(inv => 
      inv.status === 'pending' && 
      inv.items.some(item => item.description.includes(followUpPeriod))
    );
    
    if (hasPendingFollowUpInvoice) {
      return {
        shouldCreate: false,
        reason: 'Patient already has pending invoice for this follow-up'
      };
    }
    
    return { shouldCreate: true };
  } catch (error) {
    console.error('Error validating invoice creation:', error);
    return { shouldCreate: true }; // Default to creating invoice if validation fails
  }
};