import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';
import { toast } from 'react-toastify';

// Mock Data
const mockInsuranceRecords = [
  {
    id: 'ins-001',
    patient_id: '1',
    provider_name: 'Blue Cross Blue Shield',
    policy_number: 'BCBS123456',
    group_number: 'GRP7890',
    subscriber_name: 'John Doe',
    subscriber_dob: '1985-05-15',
    status: 'Active',
    notes: 'Primary insurance',
    created_at: '2025-01-10T08:30:00Z',
    updated_at: '2025-01-10T08:30:00Z',
    patients: {
      id: '1',
      first_name: 'John',
      last_name: 'Doe'
    },
    insurance_documents: [
      {
        id: 'doc-001',
        file_name: 'insurance_card.jpg',
        storage_path: 'public/insurance/ins-001/insurance_card.jpg',
        url: 'https://example.com/insurance/ins-001/insurance_card.jpg'
      }
    ]
  },
  {
    id: 'ins-002',
    patient_id: '2',
    provider_name: 'Aetna',
    policy_number: 'AET789012',
    group_number: 'GRP4567',
    subscriber_name: 'Jane Smith',
    subscriber_dob: '1990-11-22',
    status: 'Pending Verification',
    notes: 'Secondary insurance',
    created_at: '2025-01-15T09:45:00Z',
    updated_at: '2025-01-15T09:45:00Z',
    patients: {
      id: '2',
      first_name: 'Jane',
      last_name: 'Smith'
    },
    insurance_documents: []
  },
  {
    id: 'ins-003',
    patient_id: '3',
    provider_name: 'Medicare',
    policy_number: 'MC456789',
    group_number: '',
    subscriber_name: 'Robert Johnson',
    subscriber_dob: '1978-03-30',
    status: 'Active',
    notes: 'Primary insurance with Part D coverage',
    created_at: '2025-02-01T10:15:00Z',
    updated_at: '2025-02-01T10:15:00Z',
    patients: {
      id: '3',
      first_name: 'Robert',
      last_name: 'Johnson'
    },
    insurance_documents: [
      {
        id: 'doc-002',
        file_name: 'medicare_card.pdf',
        storage_path: 'public/insurance/ins-003/medicare_card.pdf',
        url: 'https://example.com/insurance/ins-003/medicare_card.pdf'
      },
      {
        id: 'doc-003',
        file_name: 'part_d_coverage.pdf',
        storage_path: 'public/insurance/ins-003/part_d_coverage.pdf',
        url: 'https://example.com/insurance/ins-003/part_d_coverage.pdf'
      }
    ]
  }
];

// Define query keys
const queryKeys = {
  all: ['insuranceRecords'],
  lists: (filters = {}) => [...queryKeys.all, 'list', { filters }],
  details: (id) => [...queryKeys.all, 'detail', id],
};

// Get insurance policies hook using Supabase
export const useInsuranceRecords = (filters = {}) => { // Keep hook name for now, but it fetches policies
  return useQuery({
    queryKey: queryKeys.lists(filters),
    queryFn: async () => {
      if (process.env.NODE_ENV === 'development') {
        // Return mock data in development
        let filteredRecords = [...mockInsuranceRecords];
        
        if (filters.patientId) {
          filteredRecords = filteredRecords.filter(rec => rec.patient_id === filters.patientId);
        }
        if (filters.status) {
          filteredRecords = filteredRecords.filter(rec => rec.status === filters.status);
        }

        return { 
          data: filteredRecords.map(rec => ({
            ...rec,
            patientName: rec.patients ? `${rec.patients.first_name || ''} ${rec.patients.last_name || ''}`.trim() : 'N/A',
            documents: rec.insurance_documents || []
          }))
        };
      }

      let query = supabase
        .from('insurance_records') // Ensure correct table name
        .select(`
          *,
          patients ( id, first_name, last_name )
        `) // Ensure correct join table name
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.patientId) {
        query = query.eq('patient_id', filters.patientId); // Assuming FK is patient_id
      }
      if (filters.status) {
        // Use the 'status' column from insurance_records table
        query = query.eq('status', filters.status);
      }

      const { data, error } = await query;

      if (error) {
        console.error('Error fetching insurance records:', error);
        throw new Error(error.message);
      }
       // Map data if needed (patientName is now joined)
       const mappedData = data?.map(rec => ({
           ...rec,
           patientName: rec.patients ? `${rec.patients.first_name || ''} ${rec.patients.last_name || ''}`.trim() : 'N/A', // Corrected join table name
           // Documents might need separate fetching or a different join structure
           documents: rec.insurance_documents || [], // Corrected relation name
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

      if (process.env.NODE_ENV === 'development') {
        // Return mock record in development
        const record = mockInsuranceRecords.find(rec => rec.id === id);
        if (!record) return null;
        
        return {
          ...record,
          patientName: record.patients ? `${record.patients.first_name || ''} ${record.patients.last_name || ''}`.trim() : 'N/A',
          documents: record.insurance_documents || []
        };
      }

      // Fetch main insurance record
      const { data: recordData, error: recordError } = await supabase
        .from('insurance_records') 
        .select(`
          *,
          patients ( id, first_name, last_name ),
          insurance_documents (*) 
        `) // Join patients and insurance_documents
        .eq('id', id)
        .single();

      if (recordError) {
        console.error(`Error fetching insurance record ${id}:`, recordError);
        if (recordError.code === 'PGRST116') return null; // Not found
        throw new Error(recordError.message);
      }

      // Documents are now fetched via the join in the main query

       // Combine and map data
       const mappedData = recordData ? {
           ...recordData,
           patientName: recordData.patients ? `${recordData.patients.first_name || ''} ${recordData.patients.last_name || ''}`.trim() : 'N/A', // Corrected join table name
           documents: recordData.insurance_documents || [], // Use joined documents
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
      // Map frontend fields to DB columns
      const dataToInsert = {
        patient_id: recordData.patientId, // Assuming FK is patient_id
        provider_name: recordData.provider_name, // Use DB column name
        policy_number: recordData.policy_number,
        group_number: recordData.group_number,
        subscriber_name: recordData.subscriber_name, // Add if available in form data
        subscriber_dob: recordData.subscriber_dob,   // Add if available in form data
        status: recordData.status || 'Pending', // Use DB column name
        notes: recordData.notes,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };
      // Remove frontend-specific fields if they exist in recordData
      delete dataToInsert.patientId; 
      delete dataToInsert.provider; 
      delete dataToInsert.verification_status;
      // delete dataToInsert.documents; // Handled separately

      const { data, error } = await supabase
        .from('insurance_records') // Corrected table name
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
      // Map frontend fields to DB columns
      const dataToUpdate = {
        patient_id: recordData.patientId, // Assuming FK is patient_id
        provider_name: recordData.provider_name, // Use DB column name
        policy_number: recordData.policy_number,
        group_number: recordData.group_number,
        subscriber_name: recordData.subscriber_name, // Add if available
        subscriber_dob: recordData.subscriber_dob,   // Add if available
        status: recordData.status, // Use DB column name
        notes: recordData.notes,
        // prior_auth_status: recordData.prior_auth_status, // Add if exists
        // prior_auth_expiry_date: recordData.prior_auth_expiry_date, // Add if exists
        // verification_history: recordData.verification_history, // Add if exists and handled correctly
        updated_at: new Date().toISOString(),
      };
      // Remove fields not in the table or not meant to be updated this way
      delete dataToUpdate.id;
      delete dataToUpdate.created_at;
      delete dataToUpdate.patientId; 
      delete dataToUpdate.provider; 
      delete dataToUpdate.verification_status;
      // delete dataToUpdate.documents; // Handled separately

      const { data, error } = await supabase
        .from('insurance_records') // Corrected table name
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
        insurance_record_id: recordId, // Correct foreign key name
        file_name: file.name,
        storage_path: filePath,
        url: publicURL, // Store the public URL
        // Add other relevant fields like uploaded_by, created_at
      };

      const { data: dbData, error: dbError } = await supabase
        .from('insurance_documents') // Corrected table name
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
        .from('insurance_documents') // Corrected table name
        .delete()
        .eq('id', documentId);

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
