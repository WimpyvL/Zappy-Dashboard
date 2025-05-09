import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase, supabaseStorage } from '../../lib/supabase';
import { toast } from 'react-toastify';

// Define query keys for patient documents
const queryKeys = {
  all: ['patientDocuments'],
  lists: (filters = {}) => [...queryKeys.all, 'list', { filters }],
  details: (id) => [...queryKeys.all, 'detail', id],
  byPatient: (patientId) => [...queryKeys.all, 'byPatient', patientId],
};

// Default bucket for patient documents - use this bucket name in Supabase Storage
const DOCUMENTS_BUCKET = 'patient-documents';

// S3 endpoint from Supabase
const S3_ENDPOINT = 'https://thchapjdflpjhtvlagke.supabase.co/storage/v1/s3';

/**
 * Hook to get patient documents
 */
export const usePatientDocuments = (patientId, options = {}) => {
  return useQuery({
    queryKey: queryKeys.byPatient(patientId),
    queryFn: async () => {
      if (!patientId) return { data: [] };

      const { data, error } = await supabase
        .from('patient_documents')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching patient documents:', error);
        throw new Error(error.message);
      }

      return { data: data || [] };
    },
    enabled: !!patientId,
    ...options,
  });
};

/**
 * Hook to upload a patient document
 */
export const useUploadPatientDocument = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ patientId, file, documentType, notes = '' }) => {
      if (!patientId || !file) {
        throw new Error("Patient ID and file are required.");
      }

      // Generate a file path that includes patient ID and keeps original file extension
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}_${Math.random().toString(36).substring(2, 10)}.${fileExt}`;
      const filePath = `${patientId}/${fileName}`;
      
      // Upload the file directly with Supabase storage
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from(DOCUMENTS_BUCKET)
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
          contentType: file.type
        });

      if (uploadError) {
        console.error('Error uploading document:', uploadError);
        throw new Error(uploadError.message);
      }

      // Get public URL for the uploaded file
      const { data: urlData } = supabase.storage
        .from(DOCUMENTS_BUCKET)
        .getPublicUrl(filePath);

      const publicURL = urlData?.publicUrl;

      // Create document record in database
      const docRecord = {
        patient_id: patientId,
        file_name: file.name,
        document_type: documentType,
        storage_path: filePath,
        url: publicURL,
        notes: notes,
        status: 'pending', // Default status
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data: dbData, error: dbError } = await supabase
        .from('patient_documents')
        .insert(docRecord)
        .select()
        .single();

      if (dbError) {
        console.error('Error saving document record to DB:', dbError);
        // Clean up the uploaded file if DB insert fails
        await supabase.storage
          .from(DOCUMENTS_BUCKET)
          .remove([filePath]);
        throw new Error(dbError.message);
      }

      return dbData;
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: queryKeys.byPatient(variables.patientId) });
      toast.success('Document uploaded successfully');
      options.onSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      toast.error(`Error uploading document: ${error.message || 'Unknown error'}`);
      options.onError?.(error, variables);
    },
    onSettled: options.onSettled,
  });
};

/**
 * Hook to delete a patient document
 */
export const useDeletePatientDocument = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ documentId, patientId, storagePath }) => {
      if (!documentId || !storagePath) {
        throw new Error("Document ID and storage path are required.");
      }

      // Delete file from storage
      const { error: storageError } = await supabase.storage
        .from(DOCUMENTS_BUCKET)
        .remove([storagePath]);

      if (storageError) {
        console.error(`Error deleting document from storage (${storagePath}):`, storageError);
        toast.warn(`Could not delete file from storage, but proceeding to delete database record.`);
      }

      // Delete document record from database
      const { error: dbError } = await supabase
        .from('patient_documents')
        .delete()
        .eq('id', documentId);

      if (dbError) {
        console.error(`Error deleting document record ${documentId} from DB:`, dbError);
        throw new Error(dbError.message);
      }

      return { success: true, documentId, patientId };
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: queryKeys.byPatient(variables.patientId) });
      toast.success('Document deleted successfully');
      options.onSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      toast.error(`Error deleting document: ${error.message || 'Unknown error'}`);
      options.onError?.(error, variables);
    },
    onSettled: options.onSettled,
  });
};

/**
 * Hook to update a patient document's metadata
 */
export const useUpdatePatientDocument = (options = {}) => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ documentId, patientId, updateData }) => {
      if (!documentId) {
        throw new Error("Document ID is required.");
      }

      const dataToUpdate = {
        ...updateData,
        updated_at: new Date().toISOString()
      };

      // Don't allow updating these fields
      delete dataToUpdate.id;
      delete dataToUpdate.patient_id;
      delete dataToUpdate.created_at;
      delete dataToUpdate.storage_path;
      delete dataToUpdate.url;

      const { data, error } = await supabase
        .from('patient_documents')
        .update(dataToUpdate)
        .eq('id', documentId)
        .select()
        .single();

      if (error) {
        console.error(`Error updating document ${documentId}:`, error);
        throw new Error(error.message);
      }

      return data;
    },
    onSuccess: (data, variables) => {
      // Invalidate relevant queries to refresh the UI
      queryClient.invalidateQueries({ queryKey: queryKeys.byPatient(variables.patientId) });
      toast.success('Document updated successfully');
      options.onSuccess?.(data, variables);
    },
    onError: (error, variables) => {
      toast.error(`Error updating document: ${error.message || 'Unknown error'}`);
      options.onError?.(error, variables);
    },
    onSettled: options.onSettled,
  });
};