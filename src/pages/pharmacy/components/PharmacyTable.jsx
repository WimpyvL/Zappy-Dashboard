import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import StatusBadge from '../../common/StatusBadge';
import TypeBadge from './TypeBadge';

const PharmacyTable = ({ pharmacies, onEdit, onDelete }) => {
  if (!pharmacies.length) {
    return (
      <div className="text-center py-8 text-gray-500">
        No pharmacies found matching your search criteria.
      </div>
    );
  }

  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Pharmacy Name
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Type
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Contact
          </th>
          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            States Served
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
        {pharmacies.map((pharmacy) => (
          <tr key={pharmacy.id} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm font-medium text-gray-900">
                {pharmacy.name}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <TypeBadge type={pharmacy.pharmacy_type} />
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-gray-900">
                {pharmacy.contact_name}
              </div>
              <div className="text-sm text-gray-500">
                {pharmacy.contact_email}
              </div>
              <div className="text-sm text-gray-500">
                {pharmacy.contact_phone}
              </div>
            </td>
            <td className="px-6 py-4">
              <div className="flex flex-wrap gap-1 max-w-xs">
                {(Array.isArray(pharmacy.served_state_codes) ? pharmacy.served_state_codes : (typeof pharmacy.served_state_codes === 'string' && pharmacy.served_state_codes.length > 0 ? pharmacy.served_state_codes.split(',').map(s => s.trim()).filter(Boolean) : [])).map((state) => (
                  <span
                    key={state}
                    className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-800"
                  >
                    {state}
                  </span>
                ))}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <StatusBadge active={pharmacy.active} />
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button
                className="text-indigo-600 hover:text-indigo-900 mr-3 cursor-pointer"
                onClick={() => onEdit(pharmacy)}
                aria-label={`Edit ${pharmacy.name}`}
              >
                <Edit className="h-5 w-5" />
              </button>
              <button
                className="text-red-600 hover:text-red-900 cursor-pointer"
                onClick={() => onDelete(pharmacy.id)}
                aria-label={`Delete ${pharmacy.name}`}
              >
                <Trash2 className="h-5 w-5" />
              </button>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};

export default PharmacyTable;
