import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';

// Mock data for form submissions
const mockFormSubmissions = [
  {
    id: 'fs1',
    patient_id: 'p1',
    category_id: 'weight_management',
    form_data: {
      basicInfo: {
        height: '5\'10"',
        weight: '210',
        weightUnit: 'lbs',
        goalWeight: '180',
        bmi: '30.1'
      },
      healthHistory: {
        medicalConditions: ['Hypertension', 'High Cholesterol'],
        previousTreatments: ['Diet', 'Exercise'],
        medicationsText: 'Lisinopril 10mg daily',
        allergiesText: 'None'
      },
      treatmentPreferences: {
        selectedProductId: 'semaglutide_product'
      }
    },
    preferred_product_id: 'semaglutide_product',
    product_name: 'Semaglutide (Wegovy)',
    submitted_at: '2025-05-15T14:30:00Z'
  },
  {
    id: 'fs2',
    patient_id: 'p2',
    category_id: 'ed',
    form_data: {
      basicInfo: {
        height: '5\'9"',
        weight: '185',
        weightUnit: 'lbs'
      },
      healthHistory: {
        edDuration: 'less_than_6_months',
        medicationsText: 'None',
        allergiesText: 'Penicillin'
      },
      treatmentPreferences: {
        selectedProductId: 'sildenafil_product'
      }
    },
    preferred_product_id: 'sildenafil_product',
    product_name: 'Sildenafil (Viagra)',
    submitted_at: '2025-05-16T10:15:00Z'
  },
  {
    id: 'fs3',
    patient_id: 'p3',
    category_id: 'hair_loss',
    form_data: {
      basicInfo: {
        height: '6\'0"',
        weight: '190',
        weightUnit: 'lbs',
        hairLossPattern: 'receding_hairline'
      },
      healthHistory: {
        medicationsText: 'None',
        allergiesText: 'None'
      },
      treatmentPreferences: {
        selectedProductId: 'finasteride_product'
      }
    },
    preferred_product_id: 'finasteride_product',
    product_name: 'Finasteride',
    submitted_at: '2025-05-17T16:45:00Z'
  }
];

// Fetch all form submissions for a patient
export const usePatientFormSubmissions = (patientId) => {
  return useQuery({
    queryKey: ['formSubmissions', patientId],
    queryFn: async () => {
      // In a real implementation, this would be an API call
      // For now, we'll simulate a delay and return mock data
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Filter submissions for this patient
      return mockFormSubmissions.filter(submission => 
        submission.patient_id === patientId
      );
    },
    enabled: !!patientId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    onError: (error) => {
      console.error('Error fetching form submissions:', error);
      toast.error('Failed to load patient form submissions');
    }
  });
};

// Submit a new form
export const useSubmitForm = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (formData) => {
      // In a real implementation, this would be an API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Generate a new submission ID
      const newSubmission = {
        id: `fs${Date.now()}`,
        patient_id: formData.patientId,
        category_id: formData.categoryId,
        form_data: formData.formData,
        preferred_product_id: formData.formData.treatmentPreferences?.selectedProductId,
        product_name: getProductName(formData.formData.treatmentPreferences?.selectedProductId),
        submitted_at: new Date().toISOString()
      };
      
      // In a real implementation, this would be saved to the database
      mockFormSubmissions.push(newSubmission);
      
      return newSubmission;
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries(['formSubmissions', data.patient_id]);
      toast.success('Form submitted successfully');
    },
    onError: (error) => {
      console.error('Error submitting form:', error);
      toast.error('Failed to submit form');
    }
  });
};

// Helper function to get product name from ID
const getProductName = (productId) => {
  const productNames = {
    'semaglutide_product': 'Semaglutide (Wegovy)',
    'metformin_product': 'Metformin',
    'sildenafil_product': 'Sildenafil (Viagra)',
    'tadalafil_product': 'Tadalafil (Cialis)',
    'finasteride_product': 'Finasteride'
  };
  
  return productNames[productId] || 'Unknown Product';
};
