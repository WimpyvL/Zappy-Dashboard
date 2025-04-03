import React, { useState, useEffect } from "react";
import { X, Check } from "lucide-react";
import { US_STATES } from "../../constants/states";
import { PHARMACY_TYPES } from "../../constants/pharmacy";

const INITIAL_FORM_DATA = {
  name: "",
  pharmacy_type: "Compounding",
  contact_name: "",
  contact_email: "",
  contact_phone: "",
  active: true,
  served_state_codes: [],
};

const PharmacyFormModal = ({
  onClose,
  onSubmit,
  title,
  submitText,
  initialData = null,
}) => {
  const [formData, setFormData] = useState(INITIAL_FORM_DATA);
  const [stateSearchTerm, setStateSearchTerm] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState("");

  // Initialize form data with initial data if provided
  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name || "",
        pharmacy_type: initialData.pharmacy_type || "Compounding",
        contact_name: initialData.contact_name || "",
        contact_email: initialData.contact_email || "",
        contact_phone: initialData.contact_phone || "",
        active: initialData.active !== undefined ? initialData.active : true,
        served_state_codes: initialData.served_state_codes
          ? [...initialData.served_state_codes]
          : [],
      });
    }
  }, [initialData]);

  // Filter states based on search term
  const filteredStates = US_STATES.filter(
    (state) =>
      state.name.toLowerCase().includes(stateSearchTerm.toLowerCase()) ||
      state.code.toLowerCase().includes(stateSearchTerm.toLowerCase())
  );

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    setValidationError("");
  };

  // Handle state selection
  const handleStateSelection = (stateCode) => {
    if (formData.served_state_codes.includes(stateCode)) {
      setFormData({
        ...formData,
        served_state_codes: formData.served_state_codes.filter(
          (code) => code !== stateCode
        ),
      });
    } else {
      setFormData({
        ...formData,
        served_state_codes: [...formData.served_state_codes, stateCode],
      });
    }
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Basic validation
    if (!formData.name.trim()) {
      setValidationError("Pharmacy name is required");
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await onSubmit(formData);
      if (success) {
        onClose();
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-[#00000066] bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <button
            className="text-gray-400 hover:text-gray-500 cursor-pointer"
            onClick={onClose}
            disabled={isSubmitting}
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {validationError && (
            <div className="mx-6 mt-4 p-2 text-sm text-red-600 bg-red-50 rounded">
              {validationError}
            </div>
          )}

          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <div className="mb-4">
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="pharmacy-name"
                >
                  Pharmacy Name *
                </label>
                <input
                  id="pharmacy-name"
                  type="text"
                  name="name"
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="pharmacy-type"
                >
                  Pharmacy Type
                </label>
                <select
                  id="pharmacy-type"
                  name="pharmacy_type"
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={formData.pharmacy_type}
                  onChange={handleInputChange}
                >
                  {PHARMACY_TYPES.map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="contact-name"
                >
                  Contact Name
                </label>
                <input
                  id="contact-name"
                  type="text"
                  name="contact_name"
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={formData.contact_name}
                  onChange={handleInputChange}
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="contact-email"
                >
                  Contact Email
                </label>
                <input
                  id="contact-email"
                  type="email"
                  name="contact_email"
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={formData.contact_email}
                  onChange={handleInputChange}
                />
              </div>

              <div className="mb-4">
                <label
                  className="block text-sm font-medium text-gray-700 mb-1"
                  htmlFor="contact-phone"
                >
                  Contact Phone
                </label>
                <input
                  id="contact-phone"
                  type="text"
                  name="contact_phone"
                  className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  value={formData.contact_phone}
                  onChange={handleInputChange}
                />
              </div>

              <div className="mb-4">
                <label className="flex items-center">
                  <input
                    type="checkbox"
                    name="active"
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                    checked={formData.active}
                    onChange={handleInputChange}
                  />
                  <span className="ml-2 text-sm text-gray-700">Active</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                States Served
              </label>
              <div className="border border-gray-300 rounded-md p-2 h-64 overflow-y-auto">
                <div className="mb-2">
                  <input
                    type="text"
                    placeholder="Search states..."
                    className="block w-full pl-3 pr-10 py-1 text-sm border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 rounded-md"
                    value={stateSearchTerm}
                    onChange={(e) => setStateSearchTerm(e.target.value)}
                  />
                </div>
                <div className="grid grid-cols-2 gap-1">
                  {filteredStates.map((state) => (
                    <div
                      key={state.code}
                      className={`flex items-center p-2 rounded cursor-pointer ${
                        formData.served_state_codes.includes(state.code)
                          ? "bg-indigo-100"
                          : "hover:bg-gray-100"
                      }`}
                      onClick={() => handleStateSelection(state.code)}
                    >
                      <div
                        className={`w-5 h-5 flex items-center justify-center rounded-full border ${
                          formData.served_state_codes.includes(state.code)
                            ? "bg-indigo-600 border-indigo-600"
                            : "border-gray-300"
                        }`}
                      >
                        {formData.served_state_codes.includes(state.code) && (
                          <Check className="h-3 w-3 text-white" />
                        )}
                      </div>
                      <span className="ml-2 text-sm">
                        {state.code} - {state.name}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {formData.served_state_codes.length} states selected
              </p>
            </div>
          </div>

          <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3">
            <button
              type="button"
              className="cursor-pointer px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="cursor-pointer px-4 py-2 bg-indigo-600 rounded-md text-sm font-medium text-white hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={isSubmitting || !formData.name}
            >
              {isSubmitting ? "Saving..." : submitText}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default PharmacyFormModal;
