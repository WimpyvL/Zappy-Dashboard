import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-toastify';
import { calculateFollowUpDate } from '../../utils/dateUtils';

// Define query keys
const queryKeys = {
  all: ['followUps'],
  lists: (params = {}) => [...queryKeys.all, 'list', { params }],
  details: (id) => [...queryKeys.all, 'detail', id],
  patientFollowUps: (patientId) => [...queryKeys.all, 'patient', patientId],
  templates: ['followUpTemplates'],
  templateDetails: (id) => ['followUpTemplates', id],
};

// Fetch all follow-up templates
export const useFollowUpTemplates = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.templates,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('follow_up_templates')
        .select('*')
        .order('name', { ascending: true });

      if (error) {
        console.error('Error fetching follow-up templates:', error);
        toast.error(`Error fetching follow-up templates: ${error.message}`);
        throw new Error(error.message);
      }
      
      return data || [];
    },
    ...options,
  });
};

// Fetch a single follow-up template by ID
export const useFollowUpTemplateById = (id, options = {}) => {
  return useQuery({
    queryKey: queryKeys.templateDetails(id),
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('follow_up_templates')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Error fetching follow-up template ${id}:`, error);
        if (error.code === 'PGRST116') return null; // Not found
        toast.error(`Error fetching follow-up template details: ${error.message}`);
        throw new Error(error.message);
      }
      
      return data;
    },
    enabled: !!id,
    ...options,
  });
};

// Fetch follow-up templates by category and period
export const useFollowUpTemplatesByCategoryAndPeriod = (category, period, options = {}) => {
  return useQuery({
    queryKey: [...queryKeys.templates, category, period],
    queryFn: async () => {
      if (!category || !period) return [];
      
      const { data, error } = await supabase
        .from('follow_up_templates')
        .select('*')
        .eq('category', category)
        .eq('period', period);

      if (error) {
        console.error(`Error fetching follow-up templates for ${category}/${period}:`, error);
        toast.error(`Error fetching follow-up templates: ${error.message}`);
        throw new Error(error.message);
      }
      
      return data || [];
    },
    enabled: !!category && !!period,
    ...options,
  });
};

// Create a new follow-up template
export const useCreateFollowUpTemplate = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (templateData) => {
      const { data, error } = await supabase
        .from('follow_up_templates')
        .insert(templateData)
        .select()
        .single();

      if (error) {
        console.error('Error creating follow-up template:', error);
        toast.error(`Error creating follow-up template: ${error.message}`);
        throw new Error(error.message);
      }
      
      return data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.templates });
      toast.success('Follow-up template created successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error creating follow-up template: ${error.message}`);
      options.onError?.(error, variables, context);
    },
    ...options,
  });
};

// Update a follow-up template
export const useUpdateFollowUpTemplate = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, templateData }) => {
      const { data, error } = await supabase
        .from('follow_up_templates')
        .update(templateData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`Error updating follow-up template ${id}:`, error);
        toast.error(`Error updating follow-up template: ${error.message}`);
        throw new Error(error.message);
      }
      
      return data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.templates });
      queryClient.invalidateQueries({ queryKey: queryKeys.templateDetails(variables.id) });
      toast.success('Follow-up template updated successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error updating follow-up template: ${error.message}`);
      options.onError?.(error, variables, context);
    },
    ...options,
  });
};

// Delete a follow-up template
export const useDeleteFollowUpTemplate = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id) => {
      const { error } = await supabase
        .from('follow_up_templates')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(`Error deleting follow-up template ${id}:`, error);
        toast.error(`Error deleting follow-up template: ${error.message}`);
        throw new Error(error.message);
      }
      
      return { id };
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.templates });
      queryClient.removeQueries({ queryKey: queryKeys.templateDetails(variables) });
      toast.success('Follow-up template deleted successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error deleting follow-up template: ${error.message}`);
      options.onError?.(error, variables, context);
    },
    ...options,
  });
};

// Fetch all follow-ups
export const useFollowUps = (options = {}) => {
  return useQuery({
    queryKey: queryKeys.lists(),
    queryFn: async () => {
      const { data, error } = await supabase
        .from('patient_follow_ups')
        .select(`
          *,
          patients:patient_id (id, first_name, last_name, email),
          templates:template_id (id, name, category, period)
        `)
        .order('scheduled_date', { ascending: true });

      if (error) {
        console.error('Error fetching follow-ups:', error);
        toast.error(`Error fetching follow-ups: ${error.message}`);
        throw new Error(error.message);
      }
      
      return data || [];
    },
    ...options,
  });
};

// Fetch follow-ups for a patient
export const usePatientFollowUps = (patientId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.patientFollowUps(patientId),
    queryFn: async () => {
      if (!patientId) return [];
      
      const { data, error } = await supabase
        .from('patient_follow_ups')
        .select(`
          *,
          templates:template_id (id, name, category, period, intake_form_schema)
        `)
        .eq('patient_id', patientId)
        .order('scheduled_date', { ascending: true });

      if (error) {
        console.error(`Error fetching follow-ups for patient ${patientId}:`, error);
        toast.error(`Error fetching follow-ups: ${error.message}`);
        throw new Error(error.message);
      }
      
      return data || [];
    },
    enabled: !!patientId,
    ...options,
  });
};

// Fetch a single follow-up by ID
export const useFollowUpById = (id, options = {}) => {
  return useQuery({
    queryKey: queryKeys.details(id),
    queryFn: async () => {
      if (!id) return null;
      
      const { data, error } = await supabase
        .from('patient_follow_ups')
        .select(`
          *,
          patients:patient_id (id, first_name, last_name, email),
          templates:template_id (id, name, category, period, intake_form_schema),
          form_submissions:intake_form_submission_id (id, form_data, submitted_at)
        `)
        .eq('id', id)
        .single();

      if (error) {
        console.error(`Error fetching follow-up ${id}:`, error);
        if (error.code === 'PGRST116') return null; // Not found
        toast.error(`Error fetching follow-up details: ${error.message}`);
        throw new Error(error.message);
      }
      
      return data;
    },
    enabled: !!id,
    ...options,
  });
};

// Schedule a follow-up
export const useScheduleFollowUp = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (followUpData) => {
      // Calculate the follow-up date based on the period
      const scheduledDate = calculateFollowUpDate(followUpData.period);
      
      // Create the follow-up record
      const { data, error } = await supabase
        .from('patient_follow_ups')
        .insert({
          patient_id: followUpData.patientId,
          consultation_id: followUpData.consultationId,
          template_id: followUpData.templateId,
          scheduled_date: scheduledDate.toISOString(),
          status: 'scheduled',
          payment_status: followUpData.paymentStatus || 'pending',
          invoice_id: followUpData.invoiceId
        })
        .select()
        .single();

      if (error) {
        console.error('Error scheduling follow-up:', error);
        toast.error(`Error scheduling follow-up: ${error.message}`);
        throw new Error(error.message);
      }
      
      // Schedule a notification for the patient
      if (data) {
        const notificationDate = new Date(scheduledDate);
        notificationDate.setDate(notificationDate.getDate() - 2); // 2 days before
        
        const { error: notificationError } = await supabase
          .from('scheduled_notifications')
          .insert({
            patient_id: followUpData.patientId,
            reference_id: data.id,
            reference_type: 'follow_up',
            scheduled_date: notificationDate.toISOString(),
            type: 'follow_up_reminder',
            title: 'Upcoming Follow-up',
            message: 'Your follow-up is scheduled in 2 days. Please complete the intake form before your appointment.',
            status: 'scheduled'
          });
          
        if (notificationError) {
          console.error('Error scheduling notification:', notificationError);
          // Don't throw error, just log it
        }
      }
      
      return data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.patientFollowUps(variables.patientId) });
      toast.success('Follow-up scheduled successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error scheduling follow-up: ${error.message}`);
      options.onError?.(error, variables, context);
    },
    ...options,
  });
};

// Update a follow-up
export const useUpdateFollowUp = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, followUpData }) => {
      const { data, error } = await supabase
        .from('patient_follow_ups')
        .update(followUpData)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`Error updating follow-up ${id}:`, error);
        toast.error(`Error updating follow-up: ${error.message}`);
        throw new Error(error.message);
      }
      
      return data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.details(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.patientFollowUps(data.patient_id) });
      toast.success('Follow-up updated successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error updating follow-up: ${error.message}`);
      options.onError?.(error, variables, context);
    },
    ...options,
  });
};

// Cancel a follow-up
export const useCancelFollowUp = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id) => {
      const { data, error } = await supabase
        .from('patient_follow_ups')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`Error cancelling follow-up ${id}:`, error);
        toast.error(`Error cancelling follow-up: ${error.message}`);
        throw new Error(error.message);
      }
      
      // Cancel any scheduled notifications
      const { error: notificationError } = await supabase
        .from('scheduled_notifications')
        .update({ status: 'cancelled', updated_at: new Date().toISOString() })
        .eq('reference_id', id)
        .eq('reference_type', 'follow_up')
        .eq('status', 'scheduled');
        
      if (notificationError) {
        console.error('Error cancelling notifications:', notificationError);
        // Don't throw error, just log it
      }
      
      return data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.details(variables) });
      queryClient.invalidateQueries({ queryKey: queryKeys.patientFollowUps(data.patient_id) });
      toast.success('Follow-up cancelled successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error cancelling follow-up: ${error.message}`);
      options.onError?.(error, variables, context);
    },
    ...options,
  });
};

// Complete a follow-up
export const useCompleteFollowUp = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, providerNotes }) => {
      const { data, error } = await supabase
        .from('patient_follow_ups')
        .update({ 
          status: 'completed', 
          provider_notes: providerNotes,
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`Error completing follow-up ${id}:`, error);
        toast.error(`Error completing follow-up: ${error.message}`);
        throw new Error(error.message);
      }
      
      return data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.details(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.patientFollowUps(data.patient_id) });
      toast.success('Follow-up completed successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error completing follow-up: ${error.message}`);
      options.onError?.(error, variables, context);
    },
    ...options,
  });
};

// Update follow-up payment status
export const useUpdateFollowUpPaymentStatus = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, paymentStatus, invoiceId }) => {
      const { data, error } = await supabase
        .from('patient_follow_ups')
        .update({ 
          payment_status: paymentStatus,
          invoice_id: invoiceId,
          updated_at: new Date().toISOString() 
        })
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`Error updating follow-up payment status ${id}:`, error);
        toast.error(`Error updating follow-up payment status: ${error.message}`);
        throw new Error(error.message);
      }
      
      return data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.details(variables.id) });
      queryClient.invalidateQueries({ queryKey: queryKeys.patientFollowUps(data.patient_id) });
      toast.success(`Follow-up payment status updated to ${variables.paymentStatus}`);
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error updating follow-up payment status: ${error.message}`);
      options.onError?.(error, variables, context);
    },
    ...options,
  });
};

// Associate an intake form submission with a follow-up
export const useAssociateIntakeFormWithFollowUp = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ followUpId, formSubmissionId }) => {
      const { data, error } = await supabase
        .from('patient_follow_ups')
        .update({ 
          intake_form_submission_id: formSubmissionId,
          updated_at: new Date().toISOString() 
        })
        .eq('id', followUpId)
        .select()
        .single();

      if (error) {
        console.error(`Error associating intake form with follow-up ${followUpId}:`, error);
        toast.error(`Error associating intake form with follow-up: ${error.message}`);
        throw new Error(error.message);
      }
      
      return data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.details(variables.followUpId) });
      queryClient.invalidateQueries({ queryKey: queryKeys.patientFollowUps(data.patient_id) });
      toast.success('Intake form associated with follow-up successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error associating intake form with follow-up: ${error.message}`);
      options.onError?.(error, variables, context);
    },
    ...options,
  });
};
