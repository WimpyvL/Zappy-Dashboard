import React, { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { X, Loader2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { useApi } from '../../hooks/useApi'; // Import the generic API hook
import errorHandling from '../../utils/errorHandling'; // Import error handling utils

/**
 * A reusable modal component for Create/Read/Update operations.
 *
 * Props:
 * - isOpen (boolean): Controls modal visibility.
 * - onClose (function): Function to call when closing the modal.
 * - entityId (string | null): The ID of the entity being edited, or null for creation.
 * - resourceName (string): The name of the resource (e.g., "Patient", "Order") for labels/messages.
 * - fetchById (function): Async function to fetch entity data by ID (e.g., `patientsApi.getById`).
 * - useCreateHook (function): React Query mutation hook for creating the entity (e.g., `useCreatePatient`).
 * - useUpdateHook (function): React Query mutation hook for updating the entity (e.g., `useUpdatePatient`).
 * - formFields (Array<object>): Configuration array for form fields. Each object should define:
 *   - name (string): Field name (used for state and API).
 *   - label (string): Display label for the field.
 *   - type (string): Input type (e.g., 'text', 'email', 'date', 'select', 'textarea').
 *   - required (boolean | string): Whether the field is required (can be a message string).
 *   - validation (object): Additional react-hook-form validation rules.
 *   - options (Array<object>): For 'select' type, array of { value, label }.
 *   - defaultValue (any): Default value for the field.
 *   - placeholder (string): Placeholder text.
 *   - gridCols (number): Optional number of columns the field should span in a grid (default 1).
 * - onSuccess (function): Callback function executed after successful creation or update, receives the created/updated data.
 * - formGridCols (number): Number of columns for the form grid layout (default 1 or 2 based on fields).
 */
const CrudModal = ({
  isOpen,
  onClose,
  entityId,
  resourceName = 'Item',
  fetchById,
  useCreateHook,
  useUpdateHook,
  formFields = [],
  onSuccess,
  formGridCols, // Auto-calculate if not provided?
}) => {
  const isEditMode = !!entityId;
  const modalTitle = isEditMode ? `Edit ${resourceName}` : `Add New ${resourceName}`;
  const submitButtonText = isEditMode ? 'Save Changes' : `Add ${resourceName}`;

  // == Hooks ==
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting: isFormSubmitting },
    setValue,
    setError: setFormError, // To set errors from API response
    clearErrors: clearFormErrors, // To clear errors
  } = useForm();

  // Instantiate mutation hooks unconditionally
  // Provide dummy hooks if props are not passed, though typically they should be.
  const dummyMutationHook = () => ({ mutateAsync: async () => { console.warn("Dummy mutation called"); throw new Error("Mutation hook not provided"); }, isPending: false });
  const createMutation = (useCreateHook || dummyMutationHook)();
  const updateMutation = (useUpdateHook || dummyMutationHook)();


  // API hook for fetching data in edit mode
  const {
    execute: executeFetch,
    loading: isLoadingData,
    error: fetchError,
    reset: resetFetchApi,
  } = useApi(fetchById, `Fetch ${resourceName}`);

  // API hook for handling the submission (create or update)
  // We pass a dummy function here; the actual mutation is called inside onSubmit
  const {
    execute: executeSubmit,
    // loading: isSubmittingApi, // <-- Removed duplicate declaration
    error: submitError,
    reset: resetSubmitApi,
  } = useApi(async () => {}, `Submit ${resourceName}`); // Dummy async function

  // Combine form state loading and API loading
  // Use the isPending state from the actual mutation hooks
  const isSubmittingApi = isEditMode ? updateMutation.isPending : createMutation.isPending;
  const isBusy = isFormSubmitting || isSubmittingApi || isLoadingData;

  // == Effects ==
  // Fetch data when modal opens in edit mode
  useEffect(() => {
    const loadData = async () => {
      if (isEditMode && isOpen && fetchById) {
        console.log(`[CrudModal] Fetching ${resourceName} data for ID: ${entityId}`);
        const { success, data, error } = await executeFetch(entityId);
        if (success && data) {
          // Populate form fields
          formFields.forEach((field) => {
            // Handle potential nested data structures if needed later
            const value = data[field.name];
            if (value !== undefined) {
              // Format date fields correctly for input type="date"
              if (field.type === 'date' && value) {
                 try {
                   const formattedDate = new Date(value).toISOString().split('T')[0];
                   if (/^\d{4}-\d{2}-\d{2}$/.test(formattedDate)) {
                     setValue(field.name, formattedDate);
                   } else {
                     setValue(field.name, ''); // Set empty if invalid date format
                   }
                 } catch {
                   setValue(field.name, ''); // Set empty on error
                 }
              } else {
                setValue(field.name, value);
              }
            }
          });
          clearFormErrors(); // Clear any previous validation errors
        } else {
          console.error(`[CrudModal] Failed to fetch ${resourceName}:`, error);
          toast.error(`Failed to load ${resourceName} data: ${errorHandling.getErrorMessage(error)}`);
          // Optionally close modal if fetch fails critically?
          // onClose();
        }
      } else if (!isEditMode && isOpen) {
        // Reset form for add mode
        console.log(`[CrudModal] Resetting form for Add New ${resourceName}`);
        reset(); // Reset form state
        formFields.forEach(field => {
           if (field.defaultValue !== undefined) {
               setValue(field.name, field.defaultValue);
           }
        });
        clearFormErrors();
      }
    };

    loadData();

    // Reset API states when modal closes or entityId changes
    return () => {
      resetFetchApi();
      resetSubmitApi();
    };
  }, [
    isOpen,
    isEditMode,
    entityId,
    fetchById,
    executeFetch,
    formFields,
    setValue,
    reset,
    onClose,
    resourceName,
    resetFetchApi,
    resetSubmitApi,
    clearFormErrors,
  ]);

  // == Event Handlers ==
  const handleClose = () => {
    if (!isBusy) {
      reset(); // Reset form state on close
      onClose();
    }
  };

  const onSubmit = async (formData) => {
    console.log(`[CrudModal] Form submitted. Mode: ${isEditMode ? 'Edit' : 'Create'}. Data:`, formData);
    clearFormErrors('apiError'); // Clear previous API errors

    // Choose the correct mutation function
    const mutationFn = isEditMode ? updateMutation?.mutateAsync : createMutation?.mutateAsync;
    if (!mutationFn) {
      console.error('[CrudModal] Missing mutation hook for the current mode.');
      toast.error('Configuration error: Cannot submit form.');
      return;
    }

    // Prepare payload - ensure only defined fields are sent? Or let API handle?
    // Consider cleaning formData here if necessary (e.g., removing empty strings, formatting)

    const apiArgs = isEditMode ? { id: entityId, ...formData } : formData; // Adjust based on hook expectations
    // Correction: Update hooks often expect { id, dataObject }
    const payload = isEditMode ? { id: entityId, [resourceName.toLowerCase() + 'Data']: formData } : formData; // Match PatientModal structure? Needs confirmation based on actual hooks. Let's assume { id, data } for update for now.
    const submitPayload = isEditMode ? { id: entityId, data: formData } : formData;


    // Wrap the actual mutation call with executeSubmit
    const { success, data: resultData, error, formErrors } = await executeSubmit(
      () => mutationFn(submitPayload) // Pass the actual mutation call here
    );

    if (success) {
      toast.success(`${resourceName} ${isEditMode ? 'updated' : 'created'} successfully!`);
      if (onSuccess) {
        onSuccess(resultData); // Pass back the result
      }
      handleClose(); // Close modal on success
    } else {
      console.error(`[CrudModal] Failed to ${isEditMode ? 'update' : 'create'} ${resourceName}:`, error);
      const errorMessage = errorHandling.getErrorMessage(error);
      toast.error(`Failed: ${errorMessage}`);

      // Set form-level errors if available
      if (formErrors) {
        Object.entries(formErrors).forEach(([field, message]) => {
          // 'form' is a general error key from getFormErrors fallback
          const fieldName = field === 'form' ? 'apiError' : field;
          setFormError(fieldName, { type: 'manual', message });
        });
      } else {
        // Set a generic API error if no specific field errors
        setFormError('apiError', { type: 'manual', message: errorMessage });
      }
    }
  };

  // == Rendering ==
  if (!isOpen) {
    return null;
  }

  // Determine grid columns
  const gridCols = formGridCols || (formFields.length > 4 ? 2 : 1); // Simple heuristic

  const renderField = (field) => {
    const { name, label, type = 'text', required, validation = {}, options = [], placeholder, gridCols: fieldGridCols } = field;
    const colSpan = fieldGridCols ? `md:col-span-${fieldGridCols}` : '';
    const error = errors[name];

    const commonProps = {
      id: name,
      ...register(name, {
        required: required || false,
        ...validation,
      }),
      className: `block w-full px-3 py-2 text-base border ${error ? 'border-red-500' : 'border-gray-300'} focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md disabled:opacity-50`,
      placeholder: placeholder || label,
      disabled: isBusy,
      'aria-invalid': error ? 'true' : 'false',
    };

    return (
      <div key={name} className={colSpan}>
        <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
          {label} {required && <span className="text-red-500">*</span>}
        </label>
        {type === 'textarea' ? (
          <textarea {...commonProps} rows={3}></textarea>
        ) : type === 'select' ? (
          <select {...commonProps}>
            <option value="">{placeholder || `Select ${label}`}</option>
            {options.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <input type={type} {...commonProps} />
        )}
        {error && <p className="mt-1 text-xs text-red-600">{error.message}</p>}
      </div>
    );
  };


  return (
    <div className={`fixed inset-0 flex items-center justify-center p-4 z-50 transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black opacity-50" onClick={handleClose}></div>

      {/* Modal Content */}
      <div className={`bg-white rounded-lg shadow-xl max-w-lg w-full relative transition-transform duration-300 ${isOpen ? 'scale-100' : 'scale-95'}`}>
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">{modalTitle}</h3>
          <button className="text-gray-400 hover:text-gray-500" onClick={handleClose} type="button" disabled={isBusy}>
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className={`p-6 max-h-[70vh] overflow-y-auto relative ${isLoadingData ? 'opacity-50 pointer-events-none' : ''}`}>
            {isLoadingData && (
              <div className="absolute inset-0 flex items-center justify-center bg-white bg-opacity-75 z-10 rounded-t-lg">
                 <Loader2 className="h-8 w-8 animate-spin text-indigo-600" />
                 <span className="ml-2">Loading data...</span>
              </div>
            )}

            {/* API Error Display */}
            {errors.apiError && (
              <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
                <p className="text-sm font-medium">Error:</p>
                <p className="text-sm">{errors.apiError.message}</p>
              </div>
            )}

            {/* Dynamic Form Fields */}
            <div className={`grid grid-cols-1 md:grid-cols-${gridCols} gap-4`}>
              {formFields.map(renderField)}
            </div>
          </div>

          {/* Footer Actions */}
          <div className="px-6 py-4 border-t border-gray-200 bg-gray-50 rounded-b-lg flex justify-end space-x-3">
            <button
              type="button"
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
              onClick={handleClose}
              disabled={isBusy}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 rounded-md text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:bg-indigo-300 flex items-center justify-center"
              disabled={isBusy}
            >
              {isBusy ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                submitButtonText
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CrudModal;
