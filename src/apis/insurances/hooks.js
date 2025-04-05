import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../utils/supabaseClient'; // Import Supabase client
import { toast } from 'react-toastify';

// Removed Mock Data

// Define query keys
const queryKeys = {
  all: ['insuranceRecords'],
  lists: (filters = {}) => [...queryKeys.all, 'list', { filters }],
  details: (id) => [...queryKeys.all, 'detail', id],
};

// Get insurance records hook using Supabase
export const useInsuranceRecords = (filters = {}) => {
  return useQuery({
    queryKey: queryKeys.lists(filters),
    queryFn: async () => {
      let query = supabase
        .from('insurance_records') // ASSUMING table name
        .select(`
          *,
          client_record ( id, first_name, last_name )
        `) // Example join
        .order('created_at', { ascending: false }); // Assuming timestamp column

      // Apply filters
      if (filters.patientId) {
        query = query.eq('client_record_id', filters.patientId); // Adjust column name if needed
      }
      if (filters.status) {
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching insurance records:', error);
        throw new Error(error.message);
      }
       // Map data if needed
       const mappedData = data?.map(rec => ({
           ...rec,
           patientName: rec.client_record ? `${rec.client_record.first_name || ''} ${rec.client_record.last_name || ''}`.trim() : 'N/A',
           // Fetch related documents separately if needed or join if possible
           documents: [], // Placeholder - fetching documents might need another query/hook
       })) || [];

      return { data: mappedData }; // Adjust return structure if pagination/meta needed
    },
  });
};

// Get insurance record by ID hook using Supabase
export const useInsuranceRecordById = (id, options = {}) => {
  return useQuery({
    queryKey: queryKeys.details(id),
    queryFn: async () => {
      if (!id) return null;

      // Fetch main record
      const { data: recordData, error: recordError } = await supabase
        .from('insurance_records') // ASSUMING table name
        .select(`
          *,
          client_record ( id, first_name, last_name )
        `) // Example join
        .eq('id', id)
        .single();

      if (recordError) {
        console.error(`Error fetching insurance record ${id}:`, recordError);
        if (recordError.code === 'PGRST116') return null; // Not found
        throw new Error(recordError.message);
      }

      // Fetch related documents (assuming an 'insurance_documents' table)
      const { data: documentsData, error: documentsError } = await supabase
        .from('insurance_documents') // ASSUMING table name
        .select('*')
        .eq('insurance_record_id', id); // Assuming foreign key column

       if (documentsError) {
         console.error(`Error fetching documents for insurance record ${id}:`, documentsError);
         // Decide how to handle: throw error or return record without documents?
       }

       // Combine and map data
       const mappedData = recordData ? {
           ...recordData,
           patientName: recordData.client_record ? `${recordData.client_record.first_name || ''} ${recordData.client_record.last_name || ''}`.trim() : 'N/A',
           documents: documentsData || [], // Attach fetched documents
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
        ...recordData,
        // Map frontend fields like patientId to DB columns like client_record_id
        client_record_id: recordData.patientId,
        status: recordData.status || 'Pending', // Default status
        created_at: new Date().toISOString(), // Assuming timestamp columns
        updated_at: new Date().toISOString(),
      };
      delete dataToInsert.patientId;
      delete dataToInsert.patientName; // Don't store derived name
      delete dataToInsert.documents; // Documents are handled separately

      const { data, error } = await supabase
        .from('insurance_records') // ASSUMING table name
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
      if (!id) throw new Error("Record ID is required for update.");
      const dataToUpdate = {
        ...recordData,
        client_record_id: recordData.patientId, // Map if needed
        updated_at: new Date().toISOString(),
      };
      delete dataToUpdate.id;
      delete dataToUpdate.created_at;
      delete dataToUpdate.patientId;
      delete dataToUpdate.patientName;
      delete dataToUpdate.documents;

      const { data, error } = await supabase
        .from('insurance_records') // ASSUMING table name
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
      const filePath = `public/insurance/${recordId}/${fileName}`; // Example path structure

      // Upload file to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('insurance-documents') // ASSUMING bucket name is 'insurance-documents'
        .upload(filePath, file);

      if (uploadError) {
        console.error('Error uploading document:', uploadError);
        throw new Error(uploadError.message);
      }

      // Get public URL (adjust if using signed URLs or different access control)
      const { data: urlData } = supabase.storage
        .from('insurance-documents')
        .getPublicUrl(filePath);

      const publicURL = urlData?.publicUrl;

      // Add record to your 'insurance_documents' table
      const docRecord = {
        insurance_record_id: recordId, // Link to the insurance record
        file_name: file.name, // Original file name
        storage_path: filePath, // Store the path in storage
        url: publicURL, // Store the public URL
        // Add other relevant fields like uploaded_by, created_at
      };

      const { data: dbData, error: dbError } = await supabase
        .from('insurance_documents') // ASSUMING table name
        .insert(docRecord)
        .select()
        .single();

      if (dbError) {
        console.error('Error saving document record to DB:', dbError);
        // Attempt to remove the uploaded file if DB insert fails? (Optional cleanup)
        await supabase.storage.from('insurance-documents').remove([filePath]);
        throw new Error(dbError.message);
      }

      return dbData; // Return the database record for the document
    },
    onSuccess: (data, variables, context) => {
      // Invalidate the specific insurance record to refetch documents
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
    mutationFn: async ({ recordId, documentId, storagePath }) => { // Need recordId for invalidation, documentId for DB delete, storagePath for Storage delete
      if (!documentId || !storagePath) throw new Error("Document ID and storage path are required.");

      // 1. Delete file from Supabase Storage
      const { error: storageError } = await supabase.storage
        .from('insurance-documents') // ASSUMING bucket name
        .remove([storagePath]);

      if (storageError) {
        console.error(`Error deleting document from storage (${storagePath}):`, storageError);
        // Decide if you should proceed to delete DB record even if storage fails
        toast.warn(`Could not delete file from storage, but proceeding to delete database record.`);
        // throw new Error(storageError.message); // Option: stop if storage delete fails
      }

      // 2. Delete record from the 'insurance_documents' table
      const { error: dbError } = await supabase
        .from('insurance_documents') // ASSUMING table name
        .delete()
        .eq('id', documentId); // Assuming 'id' is the primary key of insurance_documents

      if (dbError) {
        console.error(`Error deleting document record ${documentId} from DB:`, dbError);
        throw new Error(dbError.message);
      }

      return { success: true, recordId: recordId, documentId: documentId };
    },
    onSuccess: (data, variables, context) => {
      // Invalidate the specific insurance record to refetch documents
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
