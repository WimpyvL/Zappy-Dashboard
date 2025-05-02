import React, { useState } from 'react';
import { X, Plus } from 'lucide-react';

export const FormInput = ({ 
  label, 
  name, 
  value, 
  onChange, 
  type = 'text', 
  placeholder = '', 
  required = false,
  prefix,
  suffix,
  className = '',
  error = '',
  ...props 
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <div className={`relative rounded-md ${error ? 'shadow-sm ring-1 ring-red-500' : ''}`}>
        {prefix && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">{prefix}</span>
          </div>
        )}
        <input
          type={type}
          name={name}
          id={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm
            ${prefix ? 'pl-7' : ''}
            ${suffix ? 'pr-7' : ''}
            ${error ? 'border-red-300 text-red-900 placeholder-red-300' : ''}
          `}
          {...props}
        />
        {suffix && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
            <span className="text-gray-500 sm:text-sm">{suffix}</span>
          </div>
        )}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export const FormSelect = ({ 
  label, 
  name, 
  value, 
  onChange, 
  options = [], 
  required = false,
  placeholder = 'Select an option',
  className = '',
  error = '',
  ...props 
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm
          ${error ? 'border-red-300 text-red-900' : ''}
        `}
        required={required}
        {...props}
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export const FormTextarea = ({ 
  label, 
  name, 
  value, 
  onChange, 
  rows = 3, 
  placeholder = '', 
  required = false,
  className = '',
  error = '',
  ...props 
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      <label htmlFor={name} className="block text-sm font-medium text-gray-700 mb-1">
        {label} {required && <span className="text-red-500">*</span>}
      </label>
      <textarea
        id={name}
        name={name}
        rows={rows}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        required={required}
        className={`block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm
          ${error ? 'border-red-300 text-red-900 placeholder-red-300' : ''}
        `}
        {...props}
      />
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export const FormCheckbox = ({ 
  label, 
  name, 
  checked, 
  onChange,
  className = '',
  ...props 
}) => {
  return (
    <div className={`flex items-center ${className}`}>
      <input
        id={name}
        name={name}
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        {...props}
      />
      <label htmlFor={name} className="ml-2 block text-sm text-gray-700">
        {label}
      </label>
    </div>
  );
};

export const FormRadioGroup = ({ 
  label, 
  name, 
  value, 
  onChange, 
  options = [],
  className = '',
  error = '',
  ...props 
}) => {
  return (
    <div className={`mb-4 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <div className="space-y-2">
        {options.map((option) => (
          <div key={option.value} className="flex items-center">
            <input
              id={`${name}-${option.value}`}
              name={name}
              type="radio"
              value={option.value}
              checked={value === option.value}
              onChange={onChange}
              className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
              {...props}
            />
            <label htmlFor={`${name}-${option.value}`} className="ml-2 block text-sm text-gray-700">
              {option.label}
            </label>
          </div>
        ))}
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export const FormSection = ({ title, children, className = '' }) => {
  return (
    <div className={`mb-6 ${className}`}>
      {title && <h3 className="text-lg font-medium text-gray-900 mb-3">{title}</h3>}
      <div className="bg-white border border-gray-200 rounded-md p-4">
        {children}
      </div>
    </div>
  );
};

export const TagInput = ({ 
  label, 
  value = [], 
  onChange,
  placeholder = 'Add a tag...',
  className = '',
  error = '',
}) => {
  const [inputValue, setInputValue] = React.useState('');

  const handleAddTag = () => {
    if (inputValue.trim() !== '' && !value.includes(inputValue.trim())) {
      const newTags = [...value, inputValue.trim()];
      onChange(newTags);
      setInputValue('');
    }
  };

  const handleRemoveTag = (tagToRemove) => {
    const newTags = value.filter(tag => tag !== tagToRemove);
    onChange(newTags);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div className={`mb-4 ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-1">{label}</label>
      <div className="flex flex-wrap gap-2 p-2 border border-gray-300 rounded-md bg-white">
        {value.map((tag, index) => (
          <div key={index} className="flex items-center bg-blue-100 text-blue-800 text-sm px-2 py-1 rounded-md">
            {tag}
            <button
              type="button"
              onClick={() => handleRemoveTag(tag)}
              className="ml-1 text-blue-600 hover:text-blue-800"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        ))}
        <div className="flex-1 min-w-[150px]">
          <div className="flex">
            <input
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className="block w-full border-0 p-0 text-sm focus:ring-0"
            />
            <button
              type="button"
              onClick={handleAddTag}
              className="ml-2 text-blue-600 hover:text-blue-800"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
      {error && <p className="mt-1 text-sm text-red-600">{error}</p>}
    </div>
  );
};

export const DosesFormSection = ({ doses = [], onChange }) => {
  const [newDose, setNewDose] = useState({ 
    value: '', 
    description: '', 
    allowOneTimePurchase: false, 
    stripePriceId: '',
    form: 'tablet'
  });

  const handleAddDose = () => {
    if (newDose.value.trim() === '') return;
    const updatedDoses = [
      ...doses,
      {
        id: `temp_${Date.now()}`,
        value: newDose.value,
        description: newDose.description,
        allowOneTimePurchase: newDose.allowOneTimePurchase,
        stripePriceId: newDose.stripePriceId,
        form: newDose.form
      }
    ];
    onChange(updatedDoses);
    setNewDose({ 
      value: '', 
      description: '', 
      allowOneTimePurchase: false, 
      stripePriceId: '',
      form: 'tablet'
    });
  };

  const handleRemoveDose = (doseId) => {
    onChange(doses.filter((dose) => dose.id !== doseId));
  };

  const handleDoseChange = (e, field, doseId) => {
    const target = e.target;
    const value = target.type === 'checkbox' ? target.checked : target.value;
    
    if (doseId) {
      onChange(
        doses.map((dose) =>
          dose.id === doseId ? { ...dose, [field]: value } : dose
        )
      );
    } else {
      setNewDose((prev) => ({ ...prev, [field]: value }));
    }
  };

  const formOptions = [
    { value: 'tablet', label: 'Tablet' },
    { value: 'capsule', label: 'Capsule' },
    { value: 'liquid', label: 'Liquid' },
    { value: 'cream', label: 'Cream' },
    { value: 'solution', label: 'Solution' },
    { value: 'gel', label: 'Gel' },
    { value: 'patch', label: 'Patch' },
  ];

  return (
    <div className="border rounded-md p-4 mb-4">
      <h4 className="text-md font-medium mb-4">Available Doses</h4>
      {doses.length > 0 ? (
        <div className="mb-4 space-y-4">
          {doses.map((dose) => (
            <div
              key={dose.id}
              className="flex items-start bg-gray-50 p-3 rounded-md"
            >
              <div className="flex-grow grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Dose
                  </label>
                  <input
                    type="text"
                    value={dose.value}
                    onChange={(e) => handleDoseChange(e, 'value', dose.id)}
                    placeholder="e.g., 10mg"
                    className="block w-full pl-3 pr-3 py-2 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Form
                  </label>
                  <select
                    value={dose.form || 'tablet'}
                    onChange={(e) => handleDoseChange(e, 'form', dose.id)}
                    className="block w-full pl-3 pr-3 py-2 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                  >
                    {formOptions.map(option => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Description (optional)
                  </label>
                  <input
                    type="text"
                    value={dose.description || ''}
                    onChange={(e) => handleDoseChange(e, 'description', dose.id)}
                    placeholder="Description for this dose"
                    className="block w-full pl-3 pr-3 py-2 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
                  />
                </div>
                <div className="col-span-2 flex items-center pt-1">
                  <input
                    type="checkbox"
                    id={`allowOneTime-${dose.id}`}
                    checked={!!dose.allowOneTimePurchase}
                    onChange={(e) => handleDoseChange(e, 'allowOneTimePurchase', dose.id)}
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                  />
                  <label
                    htmlFor={`allowOneTime-${dose.id}`}
                    className="ml-2 text-xs text-gray-700"
                  >
                    Allow One-Time Purchase
                  </label>
                </div>
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-gray-500 mb-1">
                    Stripe Price ID (Subscription)
                  </label>
                  <input
                    type="text"
                    value={dose.stripePriceId || ''}
                    onChange={(e) => handleDoseChange(e, 'stripePriceId', dose.id)}
                    placeholder="price_..."
                    className="block w-full pl-3 pr-3 py-2 text-xs border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md bg-gray-100"
                  />
                </div>
              </div>
              <button
                type="button"
                onClick={() => handleRemoveDose(dose.id)}
                className="ml-3 p-1 text-red-500 hover:text-red-700"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-sm text-gray-500 mb-4 p-3 bg-gray-50 rounded-md">
          No doses added yet.
        </p>
      )}
      
      {/* Add New Dose Section */}
      <div className="mt-3 pt-4 border-t">
        <h5 className="text-sm font-medium mb-3">Add New Dose</h5>
        <div className="bg-gray-50 p-3 rounded-md">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Dose
              </label>
              <input
                type="text"
                value={newDose.value}
                onChange={(e) => handleDoseChange(e, 'value')}
                placeholder="e.g., 10mg"
                className="block w-full pl-3 pr-3 py-2 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Form
              </label>
              <select
                value={newDose.form}
                onChange={(e) => handleDoseChange(e, 'form')}
                className="block w-full pl-3 pr-3 py-2 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
              >
                {formOptions.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Description (optional)
              </label>
              <input
                type="text"
                value={newDose.description}
                onChange={(e) => handleDoseChange(e, 'description')}
                placeholder="Description for this dose"
                className="block w-full pl-3 pr-3 py-2 text-sm border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
              />
            </div>
            <div className="col-span-2 flex items-center pt-1">
              <input
                type="checkbox"
                id="allowOneTime-new"
                checked={newDose.allowOneTimePurchase}
                onChange={(e) => handleDoseChange(e, 'allowOneTimePurchase')}
                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
              />
              <label
                htmlFor="allowOneTime-new"
                className="ml-2 text-xs text-gray-700"
              >
                Allow One-Time Purchase
              </label>
            </div>
            <div className="col-span-2">
              <label className="block text-xs font-medium text-gray-500 mb-1">
                Stripe Price ID (Subscription)
              </label>
              <input
                type="text"
                value={newDose.stripePriceId}
                onChange={(e) => handleDoseChange(e, 'stripePriceId')}
                placeholder="price_..."
                className="block w-full pl-3 pr-3 py-2 text-xs border-gray-300 focus:outline-none focus:ring-blue-500 focus:border-blue-500 rounded-md"
              />
            </div>
            <div className="col-span-2 flex justify-end mt-3">
              <button
                type="button"
                onClick={handleAddDose}
                className="px-4 py-2 bg-blue-600 text-white rounded-md flex items-center text-sm hover:bg-blue-700"
                disabled={!newDose.value.trim()}
              >
                <Plus className="h-4 w-4 mr-1" /> Add Dose
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
