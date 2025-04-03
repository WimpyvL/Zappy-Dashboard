import React from "react";

const EmptyState = ({
  icon,
  title = "No data found",
  message = "There are no items to display at this time.",
  actionText,
  onAction,
}) => {
  const Icon = icon;

  return (
    <div className="text-center py-12 bg-white rounded-lg shadow">
      {Icon && <Icon className="h-12 w-12 mx-auto text-gray-400" />}
      <h3 className="mt-2 text-lg font-medium text-gray-900">{title}</h3>
      <p className="mt-1 text-sm text-gray-500">{message}</p>
      {actionText && onAction && (
        <div className="mt-6">
          <button
            onClick={onAction}
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          >
            {actionText}
          </button>
        </div>
      )}
    </div>
  );
};

export default EmptyState;
