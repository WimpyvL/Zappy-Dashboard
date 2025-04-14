import React, { useState, useEffect } from 'react';
import {
  X,
  User,
  Mail,
  Phone,
  Calendar,
  Tag,
} from 'lucide-react';
import { toast } from 'react-toastify';
import { useCreatePatient, useUpdatePatient, usePatientById } from '../../apis/patients/hooks';
import { useTags } from '../../apis/tags/hooks';
import { useSubscriptionPlans } from '../../apis/subscriptionPlans/hooks';
import { useGetUsers } from '../../apis/users/hooks';
import { usePharmacies } from '../../apis/pharmacies/hooks'; // Re-import pharmacies hook
import { Select } from 'antd';

// Accept editingPatientId prop
const PatientModal = ({ isOpen, onClose, editingPatientId, onSuccess }) => {
  // Use actual mutation hooks
  const createPatientMutation = useCreatePatient();
  const updatePatientMutation = useUpdatePatient();

  // Fetch patient data if in edit mode
  const { data: patientDataForEdit, isLoading: isLoadingData } = usePatientById(editingPatientId, {
    enabled: !!editingPatientId && isOpen, // Only fetch when modal is open and in edit mode
  });

  // Fetch data for dropdowns
  const { data: tagsData, isLoading: isLoadingTags } = useTags();
  const { data: plansData, isLoading: isLoadingPlans } = useSubscriptionPlans();
  const { data: usersData, isLoading: isLoadingUsers } = useGetUsers({ role: 'practitioner' });
  const { data: pharmaciesData, isLoading: isLoadingPharmacies } = usePharmacies(); // Fetch pharmacies

  const allTags = tagsData || [];
  const allPlans = plansData || [];
  const allDoctors = usersData || [];
  const allPharmacies = pharmaciesData || []; // Get pharmacies data

  // Combined loading state for dropdown data
  const isLoadingDropdownData = isLoadingTags || isLoadingPlans || isLoadingUsers || isLoadingPharmacies; // Add isLoadingPharmacies

  // Use mutation loading state instead of local isSubmitting
  const isSubmitting = createPatientMutation.isPending || updatePatientMutation.isPending;

  const [formData, setFormData] = useState({ // Initial empty state - use snake_case for DB consistency
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    street_address: '',
    city_name: '',
    state: '',
    zip_code: '',
    date_of_birth: '',
    status: 'active',
    related_tags: [],
    subscription_plan_id: null,
    assigned_doctor_id: null,
    preferred_pharmacy_id: null, // Re-add state for pharmacy ID
  });

  const isEditMode = !!editingPatientId;

  // Effect to load patient data in edit mode or reset form in add mode
  useEffect(() => {
    const resetForm = () => {
      setFormData({
        first_name: '', last_name: '', email: '', phone: '', street_address: '', city_name: '',
        state: '', zip_code: '', date_of_birth: '', status: 'active',
        related_tags: [], subscription_plan_id: null, assigned_doctor_id: null, preferred_pharmacy_id: null, // Reset fields including pharmacy ID
      });
    };

    if (isOpen) {
      if (isEditMode) {
        if (patientDataForEdit) {
          // Map fetched data fields to formData state
          let formattedDob = '';
          if (patientDataForEdit.date_of_birth) {
             try {
               formattedDob = new Date(patientDataForEdit.date_of_birth).toISOString().split('T')[0];
               if (!/^\d{4}-\d{2}-\d{2}$/.test(formattedDob)) formattedDob = '';
             } catch { formattedDob = ''; }
          }
          // Populate form data from fetched patient
          setFormData({
            first_name: patientDataForEdit.first_name || '',
            last_name: patientDataForEdit.last_name || '',
            email: patientDataForEdit.email || '',
            phone: patientDataForEdit.mobile_phone || patientDataForEdit.phone || '', // Prefer mobile_phone
            street_address: patientDataForEdit.address || '', // Use address field from DB
            city_name: patientDataForEdit.city || '',       // Use city field from DB
            state: patientDataForEdit.state || '',         // Use state field from DB
            zip_code: patientDataForEdit.zip || '',         // Use zip field from DB
            date_of_birth: formattedDob, // Use formatted DOB
            status: patientDataForEdit.status || 'active',
            related_tags: patientDataForEdit.related_tags || [],
            subscription_plan_id: patientDataForEdit.subscription_plan_id || null,
            assigned_doctor_id: patientDataForEdit.assigned_doctor_id || null,
            preferred_pharmacy_id: patientDataForEdit.preferred_pharmacy_id || null, // Populate pharmacy ID
          });
        } else if (!isLoadingData) {
          toast.error(`Patient data not found for ID: ${editingPatientId}`);
          onClose();
        }
      } else {
        resetForm(); // Reset for Add mode
      }
    }
  }, [isOpen, isEditMode, editingPatientId, patientDataForEdit, isLoadingData, onClose]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Updated handleSubmit to use mutation hooks
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    // Prepare payload - map form fields to DB columns
    const patientPayload = {
      first_name: formData.first_name,
      last_name: formData.last_name,
      email: formData.email,
      phone: formData.phone || null,
      address: formData.street_address || null, // Map form field to DB column
      city: formData.city_name || null,       // Map form field to DB column
      state: formData.state || null,
      zip: formData.zip_code || null,         // Map form field to DB column
      date_of_birth: formData.date_of_birth || null,
      status: formData.status,
      related_tags: formData.related_tags || [],
      subscription_plan_id: formData.subscription_plan_id || null,
      assigned_doctor_id: formData.assigned_doctor_id || null,
      preferred_pharmacy_id: formData.preferred_pharmacy_id || null, // Send pharmacy ID
    };

    // Remove undefined fields before sending
    Object.keys(patientPayload).forEach(key => patientPayload[key] === undefined && delete patientPayload[key]);

    try {
      let result;
      if (isEditMode) {
        result = await updatePatientMutation.mutateAsync({ id: editingPatientId, patientData: patientPayload });
        toast.success('Patient updated successfully');
      } else {
        result = await createPatientMutation.mutateAsync(patientPayload);
        toast.success('Patient created successfully');
      }

      if (onSuccess) {
        onSuccess(result);
      }
      onClose();

    } catch (error) {
      console.error('Error saving patient:', error);
      toast.error(`Failed to save patient: ${error.message}`);
    }
  };

  if (!isOpen) {
    return null;
  }

  const modalTitle = isEditMode ? 'Edit Patient' : 'Add New Patient';
  const submitButtonText = isEditMode ? 'Save Changes' : 'Add Patient';

  return (
    <div className={`fixed inset-0 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      <div className="absolute inset-0 bg-black opacity-50" onClick={!isSubmitting ? onClose : undefined}></div>
      <div className={`bg-white rounded-lg shadow-xl max-w-md w-full relative transition-transform duration-300 ${isOpen ? 'scale-100' : 'scale-95'}`}>
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">{modalTitle}</h3>
          <button className="text-gray-400 hover:text-gray-500" onClick={onClose} type="button" disabled={isSubmitting}>
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className={`p-6 space-y-4 max-h-[70vh] overflow-y-auto ${isLoadingData ? 'opacity-50' : ''}`}>
            {isLoadingData && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10">
                <p>Loading patient data...</p>
              </div>
            )}
            <div className="grid grid-cols-2 gap-4">
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                 <div className="relative">
                   <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><User className="h-4 w-4 text-gray-400" /></div>
                   <input type="text" name="first_name" className="block w-full pl-10 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" value={formData.first_name || ''} onChange={handleChange} placeholder="First Name" required disabled={isLoadingData} />
                 </div>
               </div>
               <div>
                 <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                 <div className="relative">
                   <input type="text" name="last_name" className="block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" value={formData.last_name || ''} onChange={handleChange} placeholder="Last Name" required disabled={isLoadingData} />
                 </div>
               </div>
             </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Mail className="h-4 w-4 text-gray-400" /></div>
                <input type="email" name="email" className="block w-full pl-10 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" value={formData.email || ''} onChange={handleChange} placeholder="patient@example.com" required disabled={isLoadingData} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Phone className="h-4 w-4 text-gray-400" /></div>
                <input type="tel" name="phone" className="block w-full pl-10 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" value={formData.phone || ''} onChange={handleChange} placeholder="(XXX) XXX-XXXX" disabled={isLoadingData} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Calendar className="h-4 w-4 text-gray-400" /></div>
                  <input type="date" name="date_of_birth" className="block w-full pl-10 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" value={formData.date_of_birth || ''} onChange={handleChange} disabled={isLoadingData} />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none"><Tag className="h-4 w-4 text-gray-400" /></div>
                  <select name="status" className="block w-full pl-10 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" value={formData.status || 'active'} onChange={handleChange} disabled={isLoadingData}>
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                    <option value="suspended">Suspended</option>
                    <option value="blacklisted">Blacklisted</option>
                    <option value="pending">Pending</option>
                  </select>
                </div>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Street Address</label>
              <input type="text" name="street_address" className="block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" value={formData.street_address || ''} onChange={handleChange} placeholder="Street Address" disabled={isLoadingData} />
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                <input type="text" name="city_name" className="block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" value={formData.city_name || ''} onChange={handleChange} disabled={isLoadingData} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">State</label>
                <input type="text" name="state" className="block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" value={formData.state || ''} onChange={handleChange} disabled={isLoadingData} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">ZIP Code</label>
                <input type="text" name="zip_code" className="block w-full pl-3 pr-3 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md" value={formData.zip_code || ''} onChange={handleChange} disabled={isLoadingData} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assigned Doctor</label>
              <Select
                style={{ width: '100%' }}
                placeholder="Select Doctor"
                value={formData.assigned_doctor_id}
                onChange={(value) => setFormData(prev => ({ ...prev, assigned_doctor_id: value }))}
                loading={isLoadingUsers}
                disabled={isLoadingData || isLoadingDropdownData}
                allowClear
              >
                {allDoctors.map(doc => (
                  <Select.Option key={doc.id} value={doc.id}>
                    {`${doc.first_name} ${doc.last_name}`}
                  </Select.Option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Subscription Plan</label>
              <Select
                style={{ width: '100%' }}
                placeholder="Select Plan"
                value={formData.subscription_plan_id}
                onChange={(value) => setFormData(prev => ({ ...prev, subscription_plan_id: value }))}
                loading={isLoadingPlans}
                disabled={isLoadingData || isLoadingDropdownData}
                allowClear
              >
                {allPlans.map(plan => (
                  <Select.Option key={plan.id} value={plan.id}>
                    {plan.name} (${plan.price}/{plan.billing_cycle})
                  </Select.Option>
                ))}
              </Select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
              <Select
                mode="multiple"
                style={{ width: '100%' }}
                placeholder="Select Tags"
                value={formData.related_tags}
                onChange={(values) => setFormData(prev => ({ ...prev, related_tags: values }))}
                loading={isLoadingTags}
                disabled={isLoadingData || isLoadingDropdownData}
                allowClear
              >
                {allTags.map(tag => (
                  <Select.Option key={tag.id} value={tag.id}>
                    {tag.name}
                  </Select.Option>
                ))}
              </Select>
            </div>
            {/* Preferred Pharmacy Dropdown (Re-added) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Pharmacy</label>
              <Select
                style={{ width: '100%' }}
                placeholder="Select Preferred Pharmacy"
                value={formData.preferred_pharmacy_id}
                onChange={(value) => setFormData(prev => ({ ...prev, preferred_pharmacy_id: value }))}
                loading={isLoadingPharmacies}
                disabled={isLoadingData || isLoadingDropdownData}
                allowClear
                showSearch // Optional: Allow searching pharmacies
                optionFilterProp="children" // Optional: Filter based on displayed text
                filterOption={(input, option) => // Optional: Custom filter logic
                  (option?.label ?? '').toLowerCase().includes(input.toLowerCase())
                }
                options={allPharmacies.map(pharm => ({ // Use options prop for better performance/structure
                    value: pharm.id,
                    label: pharm.name // Display pharmacy name
                }))}
              />
            </div>
          </div>
          <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 rounded-md text-sm font-medium text-white hover:bg-indigo-700 disabled:bg-indigo-300"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : submitButtonText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PatientModal;
