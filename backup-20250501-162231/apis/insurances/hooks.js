import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-toastify';

// Define query keys
const queryKeys = {
  all: ['insuranceRecords'],
  lists: (filters = {}) => [...queryKeys.all, 'list', { filters }],
  details: (id) => [...queryKeys.all, 'detail', id],
};

// Get insurance policies hook using Supabase
export const useInsuranceRecords = (filters = {}) => {
  return useQuery({
    queryKey: queryKeys.lists(filters),
    queryFn: async () => {
      let query = supabase
        .from('insurance_policy')
        .select(`
          *,
          patients ( id, first_name, last_name )
        `)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.patientId) {
        query = query.eq('patient_id', filters.patientId);
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching insurance records:', error);
        throw new Error(error.message);
      }

      const mappedData = data?.map(rec => ({
        ...rec,
        patientName: rec.patients ? `${rec.patients.first_name || ''} ${rec.patients.last_name || ''}`.trim() : 'N/A',
        documents: rec.insurance_documents || [],
      })) || [];

      return { data: mappedData };
    },
  });
};

// Get insurance record by ID hook using Supabase
export const useInsuranceRecordById = (id, options = {}) => {
  return useQuery({
    queryKey: queryKeys.details(id),
    queryFn: async () => {
      if (!id) return null;

      const { data: recordData, error: recordError } = await supabase
        .from('insurance_policy')
        .select(`
          *,
          patients ( id, first_name, last_name ),
          insurance_documents (*)
        `)
        .eq('id', id)
        .single();

      if (recordError) {
        console.error(`Error fetching insurance record ${id}:`, recordError);
        if (recordError.code === 'PGRST116') return null;
        throw new Error(recordError.message);
      }

      const mappedData = recordData ? {
        ...recordData,
        patientName: recordData.patients ? `${recordData.patients.first_name || ''} ${recordData.patients.last_name || ''}`.trim() : 'N/A',
        documents: recordData.insurance_documents || [],
      } : null;

      return mappedData;
    },
    enabled: !!id,
    ...options,
  });
};

// Create insurance record hook using Supabase
export const useCreateInsuranceRecord = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (recordData) => {
      const dataToInsert = {
        patient_id: recordData.patientId,
        provider_name: recordData.provider_name,
        policy_number: recordData.policy_number,
        group_number: recordData.group_number,
        subscriber_name: recordData.subscriber_name,
        subscriber_dob: recordData.subscriber_dob,
        status: recordData.status || 'Pending',
        notes: recordData.notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      
      delete dataToInsert.patientId;
      delete dataToInsert.provider;
      delete dataToInsert.verification_status;

      const { data, error } = await supabase
        .from('insurance_policy')
        .insert(dataToInsert)
        .select()
        .single();

      if (error) {
        console.error('Error creating insurance record:', error);
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      toast.success('Insurance record created successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error creating insurance record: ${error.message || 'Unknown error'}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Update insurance record hook using Supabase
export const useUpdateInsuranceRecord = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, recordData }) => {
      if (!id) throw new Error("Policy ID is required for update.");
      
      const dataToUpdate = {
        patient_id: recordData.patientId,
        provider_name: recordData.provider_name,
        policy_number: recordData.policy_number,
        group_number: recordData.group_number,
        subscriber_name: recordData.subscriber_name,
        subscriber_dob: recordData.subscriber_dob,
        status: recordData.status,
        notes: recordData.notes,
        updated_at: new Date().toISOString(),
      };

      delete dataToUpdate.id;
      delete dataToUpdate.created_at;
      delete dataToUpdate.patientId;
      delete dataToUpdate.provider;
      delete dataToUpdate.verification_status;

      const { data, error } = await supabase
        .from('insurance_policy')
        .update(dataToUpdate)
        .eq('id', id)
        .select()
        .single();

      if (error) {
        console.error(`Error updating insurance record ${id}:`, error);
        throw new Error(error.message);
      }
      return data;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.lists() });
      queryClient.invalidateQueries({ queryKey: queryKeys.details(variables.id) });
      toast.success('Insurance record updated successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error updating insurance record: ${error.message || 'Unknown error'}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Upload insurance document hook using Supabase Storage
export const useUploadInsuranceDocument = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ recordId, file }) => {
      if (!recordId || !file) throw new Error("Record ID and file are required.");

      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `public/insurance/${recordId}/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('insurance-documents')
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading document:', uploadError);
        throw new Error(uploadError.message);
      }

      const { data: urlData } = supabase.storage
        .from('insurance-documents')
        .getPublicUrl(filePath);

      const publicURL = urlData?.publicUrl;

      const docRecord = {
        insurance_record_id: recordId,
        file_name: file.name,
        storage_path: filePath,
        url: publicURL,
      };

      const { data: dbData, error: dbError } = await supabase
        .from('insurance_documents')
        .insert(docRecord)
        .select()
        .single();

      if (dbError) {
        console.error('Error saving document record to DB:', dbError);
        await supabase.storage.from('insurance-documents').remove([filePath]);
        throw new Error(dbError.message);
      }

      return dbData;
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.details(variables.recordId) });
      toast.success('Document uploaded successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error uploading document: ${error.message || 'Unknown error'}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};

// Delete insurance document hook using Supabase Storage
export const useDeleteInsuranceDocument = (options = {}) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ recordId, documentId, storagePath }) => {
      if (!documentId || !storagePath) throw new Error("Document ID and storage path are required.");

      const { error: storageError } = await supabase.storage
        .from('insurance-documents')
        .remove([storagePath]);

      if (storageError) {
        console.error(`Error deleting document from storage (${storagePath}):`, storageError);
        toast.warn(`Could not delete file from storage, but proceeding to delete database record.`);
      }

      const { error: dbError } = await supabase
        .from('insurance_documents')
        .delete()
        .eq('id', documentId);

      if (dbError) {
        console.error(`Error deleting document record ${documentId} from DB:`, dbError);
        throw new Error(dbError.message);
      }

      return { success: true, recordId: recordId, documentId: documentId };
    },
    onSuccess: (data, variables, context) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.details(variables.recordId) });
      toast.success('Document deleted successfully');
      options.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      toast.error(`Error deleting document: ${error.message || 'Unknown error'}`);
      options.onError?.(error, variables, context);
    },
    onSettled: options.onSettled,
  });
};
