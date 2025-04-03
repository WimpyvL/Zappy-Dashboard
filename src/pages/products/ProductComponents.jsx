// Reusable components for the Product Management module

import React from 'react';
import { Search, Plus, Edit, Trash2, Check, X } from 'lucide-react';

// Define badge styles as objects to avoid string interpolation in JSX
const typeBadgeStyles = {
  medication: "bg-blue-100 text-blue-800",
  supplement: "bg-green-100 text-green-800",
  service: "bg-purple-100 text-purple-800"
};

const statusBadgeStyles = {
  active: "bg-green-100 text-green-800",
  inactive: "bg-red-100 text-red-800"
};

// Generic Badge component
export const Badge = ({ className, children }) => (
  <span className={`px-2 py-1 text-xs font-medium rounded-full ${className}`}>
    {children}
  </span>
);

// Tab Button component
export const TabButton = ({ isActive, onClick, children }) => (
  <button
    onClick={onClick}
    className={
      isActive
        ? "py-4 px-6 text-sm font-medium border-b-2 border-indigo-500 text-indigo-600 cursor-pointer"
        : "py-4 px-6 text-sm font-medium text-gray-500 hover:text-gray-700 hover:border-gray-300 cursor-pointer"
    }
  >
    {children}
  </button>
);

// Page Header component
export const PageHeader = ({ title, onAddClick, addButtonText = "Add" }) => (
  <div className="flex justify-between items-center mb-6">
    <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
    {onAddClick && (
      <button
        className="px-4 py-2 bg-indigo-600 text-white rounded-md flex items-center hover:bg-indigo-700 cursor-pointer"
        onClick={onAddClick}
      >
        <Plus className="h-5 w-5 mr-2" />
        {addButtonText}
      </button>
    )}
  </div>
);

// Search and Filters component
export const SearchAndFilters = ({ 
  searchTerm,
  onSearchChange,
  placeholder = "Search...",
  filters = [],
}) => (
  <div className="bg-white p-4 rounded-lg shadow mb-6 flex flex-col md:flex-row md:items-center space-y-4 md:space-y-0 md:space-x-4">
    <div className="flex-1 relative">
      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <Search className="h-5 w-5 text-gray-400" />
      </div>
      <input
        type="text"
        placeholder={placeholder}
        className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        value={searchTerm}
        onChange={(e) => onSearchChange(e.target.value)}
      />
    </div>
    
    {filters.map((filter, index) => (
      <div key={index} className="flex items-center space-x-2">
        {filter.icon && <filter.icon className="h-5 w-5 text-gray-400" />}
        <select
          className="block pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
          value={filter.value}
          onChange={(e) => filter.onChange(e.target.value)}
        >
          {filter.options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>
    ))}
  </div>
);

// Product Table component
export const ProductTable = ({ products, onEdit, onDelete }) => (
  <div className="bg-white shadow overflow-hidden rounded-lg">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Product Name
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Type
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Description
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Price
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Status
          </th>
          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {products.length > 0 ? (
          products.map((product) => (
            <tr key={product.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {product.name}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge className={typeBadgeStyles[product.type]}>
                  {product.type.charAt(0).toUpperCase() + product.type.slice(1)}
                </Badge>
              </td>
              <td className="px-6 py-4 max-w-xs">
                <div className="text-sm text-gray-500 truncate">
                  {product.description}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900 font-medium">
                  ${product.price}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge
                  className={
                    product.active
                      ? statusBadgeStyles.active
                      : statusBadgeStyles.inactive
                  }
                >
                  {product.active ? "Active" : "Inactive"}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  className="text-indigo-600 hover:text-indigo-900 mr-3 cursor-pointer"
                  onClick={() => onEdit(product)}
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button
                  className="text-red-600 hover:text-red-900 cursor-pointer"
                  onClick={() => onDelete(product.id)}
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
              No products found matching your search criteria.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

// Subscription Plans Table component
export const SubscriptionPlansTable = ({
  plans,
  onEdit,
  onDelete,
  getProductNameById,
}) => (
  <div className="bg-white shadow overflow-hidden rounded-lg">
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Plan Name
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Description
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Billing
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Price
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Status
          </th>
          <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
            Actions
          </th>
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {plans.length > 0 ? (
          plans.map((plan) => (
            <tr key={plan.id} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm font-medium text-gray-900">
                  {plan.name}
                </div>
              </td>
              <td className="px-6 py-4 max-w-xs">
                <div className="text-sm text-gray-500 truncate">
                  {plan.description}
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge className="bg-blue-100 text-blue-800">
                  {plan.billingFrequency?.charAt(0).toUpperCase() +
                    plan.billingFrequency?.slice(1)}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="text-sm text-gray-900 font-medium">
                  ${plan?.price}
                </div>
                {plan.discount > 0 && (
                  <div className="text-xs text-green-600">
                    {plan.discount}% discount
                  </div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <Badge
                  className={
                    plan.active
                      ? statusBadgeStyles.active
                      : statusBadgeStyles.inactive
                  }
                >
                  {plan.active ? "Active" : "Inactive"}
                </Badge>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  className="text-indigo-600 hover:text-indigo-900 mr-3 cursor-pointer"
                  onClick={() => onEdit(plan)}
                >
                  <Edit className="h-5 w-5" />
                </button>
                <button
                  className="text-red-600 hover:text-red-900 cursor-pointer"
                  onClick={() => onDelete(plan.id)}
                >
                  <Trash2 className="h-5 w-5" />
                </button>
              </td>
            </tr>
          ))
        ) : (
          <tr>
            <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
              No subscription plans found matching your search criteria.
            </td>
          </tr>
        )}
      </tbody>
    </table>
  </div>
);

// Form Input component
export const FormInput = ({ label, name, type = "text", value, onChange, placeholder = "", required = false }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <input
      type={type}
      name={name}
      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
    />
  </div>
);

// Form Select component
export const FormSelect = ({ label, name, value, onChange, options, required = false }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <select
      name={name}
      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
      value={value}
      onChange={onChange}
      required={required}
    >
      {options.map((option) => (
        <option key={option.value} value={option.value}>
          {option.label}
        </option>
      ))}
    </select>
  </div>
);

// Form Textarea component
export const FormTextarea = ({ label, name, value, onChange, rows = 3, placeholder = "", required = false }) => (
  <div className="mb-4">
    <label className="block text-sm font-medium text-gray-700 mb-1">
      {label} {required && <span className="text-red-500">*</span>}
    </label>
    <textarea
      name={name}
      rows={rows}
      className="block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      required={required}
    />
  </div>
);

// Form Checkbox component
export const FormCheckbox = ({ label, name, checked, onChange }) => (
  <div className="flex items-center mb-4">
    <input
      id={name}
      name={name}
      type="checkbox"
      className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
      checked={checked}
      onChange={onChange}
    />
    <label htmlFor={name} className="ml-2 block text-sm text-gray-700">
      {label}
    </label>
  </div>
);

// Modal component
export const Modal = ({ title, isOpen, onClose, onSubmit, submitText = "Submit", children }) => {
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-[#00000066] bg-opacity-50 flex items-center justify-center p-4 z-50">
      {/* Changed max-w-md to max-w-2xl */}
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full">
        <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
          <h3 className="text-lg font-medium text-gray-900">{title}</h3>
          <button
            className="text-gray-400 hover:text-gray-500 cursor-pointer"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(100vh-12rem)]"> {/* Added overflow-y-auto and max-height */}
          {children}
        </div>
        
        <div className="px-6 py-4 border-t border-gray-200 flex justify-end space-x-3 sticky bottom-0 bg-white z-10">
          <button
            className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50 cursor-pointer"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="cursor-pointer px-4 py-2 bg-indigo-600 rounded-md text-sm font-medium text-white hover:bg-indigo-700"
            onClick={onSubmit}
          >
            {submitText}
          </button>
        </div>
      </div>
    </div>
  );
};

// Product Selection Item for subscription plans
export const ProductSelectionItem = ({ product, isSelected, onSelect }) => (
  <div
    className={`flex items-center p-2 rounded cursor-pointer ${
      isSelected ? "bg-indigo-100" : "hover:bg-gray-100"
    }`}
    onClick={onSelect}
  >
    <div className="flex items-center gap-x-2">
      <div
        className={`w-5 h-5 aspect-square flex items-center justify-center rounded-full border ${
          isSelected ? "bg-indigo-600 border-indigo-600" : "border-gray-300"
        }`}
      >
        {isSelected && <Check className="h-3 w-3 text-white" />}
      </div>
      <div>
        <div className="flex items-center gap-x-2">
          <span className="text-sm font-medium text-nowrap">
            {product.name}
          </span>
          <span
            className={`px-2 py-0.5 text-xs font-medium rounded-full ${
              typeBadgeStyles[product.type]
            }`}
          >
            {product.type.charAt(0).toUpperCase() + product.type.slice(1)}
          </span>
        </div>
        <div className="text-xs text-gray-500">${product.price}</div>
      </div>
    </div>
  </div>
);
