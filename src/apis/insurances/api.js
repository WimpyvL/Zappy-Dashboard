// services/patientInsuranceService.js - Refactored for Supabase
import { supabase } from '../../lib/supabaseClient';

const INSURANCE_DOCUMENTS_BUCKET = 'insurance_documents'; // Define bucket name
const ITEMS_PER_PAGE = 10; // Pagination

// Get patient insurance records (potentially filtered by patient_id)
export const getPatientInsurances = async (currentPage = 1, filters = {}) => {
  const page = currentPage > 0 ? currentPage - 1 : 0;
  const start = page * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE - 1;

  let query = supabase
    .from('patient_insurances')
    .select(`
      *,
      insurance:insurances(id, name)
    `, { count: 'exact' }) // Join insurance provider name
    .range(start, end);

  // Apply filters
  if (filters.patientId) {
    query = query.eq('patient_id', filters.patientId);
  }
  if (filters.insuranceId) {
    query = query.eq('insurance_id', filters.insuranceId);
  }
  // Add more filters as needed

  query = query.order('created_at', { ascending: false });

  const { data, error, count } = await query;

  if (error) {
    console.error('Error fetching patient insurances:', error);
    throw error;
  }

  return {
    data,
    pagination: {
      currentPage: currentPage,
      totalPages: Math.ceil(count / ITEMS_PER_PAGE),
      totalCount: count,
      itemsPerPage: ITEMS_PER_PAGE
    },
  };
};

// Get a specific patient insurance record by ID
export const getPatientInsuranceById = async (id) => {
  const { data, error } = await supabase
    .from('patient_insurances')
    .select(`
      *,
      insurance:insurances(id, name)
    `) // Join insurance provider name
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') { return null; }
    console.error(`Error fetching patient insurance with id ${id}:`, error);
    throw error;
  }
  return data;
};

// Create a new patient insurance record
export const createPatientInsurance = async (recordData) => {
  // Ensure patient_id and insurance_id are present
  const { data, error } = await supabase
    .from('patient_insurances')
    .insert(recordData)
    .select()
    .single();

  if (error) {
    console.error('Error creating patient insurance:', error);
    throw error;
  }
  return data;
};

// Update an existing patient insurance record
export const updatePatientInsurance = async (id, recordData) => {
  const { id: _, ...updateData } = recordData;
  const { data, error } = await supabase
    .from('patient_insurances')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating patient insurance with id ${id}:`, error);
    throw error;
  }
  return data;
};

// Delete a patient insurance record
export const deletePatientInsurance = async (id) => {
    const { error } = await supabase
        .from('patient_insurances')
        .delete()
        .eq('id', id);

    if (error) {
        console.error(`Error deleting patient insurance record with id ${id}:`, error);
        throw error;
    }
    return { success: true, id: id };
};


// --- Document Handling ---

// Upload an insurance document
export const uploadInsuranceDocument = async (patientInsuranceId, file) => {
  if (!file) throw new Error("File is required for upload.");

  // Generate a unique path, e.g., patient_insurances/{record_id}/{uuid}_{filename}
  const fileExt = file.name.split('.').pop();
  const uniqueFileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `patient_insurances/${patientInsuranceId}/${uniqueFileName}`;

  // Upload to Supabase Storage
  const { data: uploadData, error: uploadError } = await supabase.storage
    .from(INSURANCE_DOCUMENTS_BUCKET)
    .upload(filePath, file);

  if (uploadError) {
    console.error('Error uploading document:', uploadError);
    throw uploadError;
  }

  // Get current documents array
  const { data: record, error: fetchError } = await supabase
    .from('patient_insurances')
    .select('documents')
    .eq('id', patientInsuranceId)
    .single();

  if (fetchError) {
      console.error('Error fetching record to update documents:', fetchError);
      // Attempt to remove the uploaded file if DB update fails? Consider cleanup strategy.
      await supabase.storage.from(INSURANCE_DOCUMENTS_BUCKET).remove([filePath]);
      throw fetchError;
  }

  // Add new document metadata to the array
  const newDocument = {
      fileName: file.name,
      storagePath: filePath, // Use the actual path used for upload
      uploadedAt: new Date().toISOString(),
      size: file.size,
      type: file.type
  };
  const updatedDocuments = [...(record.documents || []), newDocument];

  // Update the documents column in the patient_insurances table
  const { data: updateData, error: updateError } = await supabase
    .from('patient_insurances')
    .update({ documents: updatedDocuments })
    .eq('id', patientInsuranceId)
    .select('documents') // Return updated documents array
    .single();

  if (updateError) {
    console.error('Error updating documents array in DB:', updateError);
     // Attempt to remove the uploaded file if DB update fails?
    await supabase.storage.from(INSURANCE_DOCUMENTS_BUCKET).remove([filePath]);
    throw updateError;
  }

  return { success: true, documents: updateData.documents };
};

// Delete an insurance document
export const deleteInsuranceDocument = async (patientInsuranceId, storagePath) => {
   if (!storagePath) throw new Error("Storage path is required to delete document.");

   // 1. Remove file from Supabase Storage
   const { error: deleteError } = await supabase.storage
    .from(INSURANCE_DOCUMENTS_BUCKET)
    .remove([storagePath]);

   if (deleteError) {
       console.error(`Error deleting document from storage (${storagePath}):`, deleteError);
       // Decide if you should proceed to update DB even if storage delete failed
       // For now, we'll throw to indicate the operation wasn't fully successful
       throw deleteError;
   }

   // 2. Get current documents array
   const { data: record, error: fetchError } = await supabase
    .from('patient_insurances')
    .select('documents')
    .eq('id', patientInsuranceId)
    .single();

   if (fetchError) {
      console.error('Error fetching record to update documents:', fetchError);
      throw fetchError;
   }

   // 3. Filter out the deleted document metadata
   const updatedDocuments = (record.documents || []).filter(doc => doc.storagePath !== storagePath);

   // 4. Update the documents column in the patient_insurances table
   const { data: updateData, error: updateError } = await supabase
    .from('patient_insurances')
    .update({ documents: updatedDocuments })
    .eq('id', patientInsuranceId)
    .select('documents')
    .single();

   if (updateError) {
       console.error('Error updating documents array in DB after deletion:', updateError);
       // The file is deleted from storage, but the DB record is inconsistent. Manual cleanup might be needed.
       throw updateError;
   }

   return { success: true, documents: updateData.documents };
};
