import { supabase } from '../lib/supabase';
import { toast } from 'react-toastify';

/**
 * Notification Service
 * 
 * Handles patient notifications for clinical documentation following EMR best practices.
 * This service implements the EMR-Centric pattern where our application handles all
 * aspects of notification directly.
 */

/**
 * Notifies a patient that a new consultation note is available
 * @param {Object} params - Notification parameters
 * @param {string} params.patientId - Patient ID
 * @param {string} params.noteId - Consultation note ID
 * @param {string} params.templateId - Optional template ID to use for notification content
 * @returns {Promise<Object>} - Result of the notification process
 */
export const notifyPatientOfNewNote = async ({ patientId, noteId, templateId }) => {
  try {
    // 1. Get patient details
    const { data: patient, error: patientError } = await supabase
      .from('patients')
      .select('id, first_name, last_name, email, phone, notification_preferences')
      .eq('id', patientId)
      .single();
    
    if (patientError) {
      console.error(`Error fetching patient ${patientId}:`, patientError);
      throw new Error(`Patient with ID ${patientId} not found`);
    }
    
    // 2. Get consultation note details
    const { data: note, error: noteError } = await supabase
      .from('consultations')
      .select(`
        id,
        provider_id,
        notes,
        status,
        created_at,
        providers:provider_id (first_name, last_name)
      `)
      .eq('id', noteId)
      .single();
      
    if (noteError) {
      console.error(`Error fetching consultation note ${noteId}:`, noteError);
      throw new Error(`Consultation note with ID ${noteId} not found`);
    }
    
    // 3. Mark note as "ready for patient view" in the patient's record
    const { error: updateError } = await supabase
      .from('consultations')
      .update({
        is_published_to_patient: true,
        published_at: new Date().toISOString()
      })
      .eq('id', noteId);
      
    if (updateError) {
      console.error(`Error marking note ${noteId} as published:`, updateError);
      // Continue anyway - we don't want to fail the process just because we couldn't update the flag
    }
    
    // 4. Create notification record
    const { data: notification, error: notificationError } = await supabase
      .from('patient_notifications')
      .insert({
        patient_id: patientId,
        reference_id: noteId,
        reference_type: 'consultation_note',
        type: 'new_note',
        title: 'New Consultation Note Available',
        message: 'Your provider has completed your consultation note. You can view it in your patient portal.',
        is_read: false,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
      
    if (notificationError) {
      console.error('Error creating notification record:', notificationError);
      // Continue anyway - we don't want to fail the process just because we couldn't create the notification
    }
    
    // 5. Determine notification channels based on patient preferences
    const channels = patient.notification_preferences?.channels || ['portal'];
    const notificationResults = {};
    
    // 6. Send notifications through each channel
    
    // Always add to patient portal (in-app notification)
    notificationResults.portal = {
      success: true,
      message: 'Added to patient portal'
    };
    
    // Send email notification if enabled
    if (channels.includes('email') && patient.email) {
      try {
        // In a real implementation, this would call an email service
        console.log(`[MOCK] Sending email notification to ${patient.email}`);
        
        // Log the email delivery attempt
        await supabase.from('notification_deliveries').insert({
          notification_id: notification?.id,
          channel: 'email',
          recipient: patient.email,
          status: 'sent',
          sent_at: new Date().toISOString()
        });
        
        notificationResults.email = {
          success: true,
          recipient: patient.email
        };
      } catch (emailError) {
        console.error('Error sending email notification:', emailError);
        notificationResults.email = {
          success: false,
          error: emailError.message
        };
      }
    }
    
    // Send SMS notification if enabled
    if (channels.includes('sms') && patient.phone) {
      try {
        // In a real implementation, this would call an SMS service
        console.log(`[MOCK] Sending SMS notification to ${patient.phone}`);
        
        // Log the SMS delivery attempt
        await supabase.from('notification_deliveries').insert({
          notification_id: notification?.id,
          channel: 'sms',
          recipient: patient.phone,
          status: 'sent',
          sent_at: new Date().toISOString()
        });
        
        notificationResults.sms = {
          success: true,
          recipient: patient.phone
        };
      } catch (smsError) {
        console.error('Error sending SMS notification:', smsError);
        notificationResults.sms = {
          success: false,
          error: smsError.message
        };
      }
    }
    
    // 7. Return results
    return {
      success: true,
      notificationId: notification?.id,
      channels: notificationResults
    };
  } catch (error) {
    console.error('Error in notifyPatientOfNewNote:', error);
    toast.error('Failed to notify patient of new note');
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Gets notification preferences for a patient
 * @param {string} patientId - Patient ID
 * @returns {Promise<Object>} - Notification preferences
 */
export const getPatientNotificationPreferences = async (patientId) => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .select('notification_preferences')
      .eq('id', patientId)
      .single();
      
    if (error) {
      throw error;
    }
    
    return data.notification_preferences || {
      channels: ['portal'], // Default to portal only
      frequency: 'immediate'
    };
  } catch (error) {
    console.error('Error getting notification preferences:', error);
    throw error;
  }
};

/**
 * Updates notification preferences for a patient
 * @param {string} patientId - Patient ID
 * @param {Object} preferences - Notification preferences
 * @returns {Promise<Object>} - Updated preferences
 */
export const updatePatientNotificationPreferences = async (patientId, preferences) => {
  try {
    const { data, error } = await supabase
      .from('patients')
      .update({
        notification_preferences: preferences,
        updated_at: new Date().toISOString()
      })
      .eq('id', patientId)
      .select('notification_preferences')
      .single();
      
    if (error) {
      throw error;
    }
    
    return data.notification_preferences;
  } catch (error) {
    console.error('Error updating notification preferences:', error);
    throw error;
  }
};

/**
 * Gets all notifications for a patient
 * @param {string} patientId - Patient ID
 * @returns {Promise<Array>} - Array of notifications
 */
export const getPatientNotifications = async (patientId) => {
  try {
    const { data, error } = await supabase
      .from('patient_notifications')
      .select('*')
      .eq('patient_id', patientId)
      .order('created_at', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error getting patient notifications:', error);
    throw error;
  }
};

/**
 * Marks a notification as read
 * @param {string} notificationId - Notification ID
 * @returns {Promise<Object>} - Updated notification
 */
export const markNotificationAsRead = async (notificationId) => {
  try {
    const { data, error } = await supabase
      .from('patient_notifications')
      .update({
        is_read: true,
        read_at: new Date().toISOString()
      })
      .eq('id', notificationId)
      .select()
      .single();
      
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    throw error;
  }
};
