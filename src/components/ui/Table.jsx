import React from 'react';
import PropTypes from 'prop-types';
import './Table.css';
import EmptyState from './EmptyState';
import { FileX } from 'lucide-react';

/**
 * Table Component
 * 
 * A reusable table component with enhanced styling, category indicators,
 * and support for loading/empty/error states.
 * 
 * @param {Object} props
 * @param {string} props.title - Optional title for the table
 * @param {React.ReactNode} props.action - Optional action element (button, link, etc.) to display in the header
 * @param {Array} props.columns - Array of column definitions with title and key
 * @param {Array} props.data - Array of data objects
 * @param {string} props.categoryKey - Key in data objects that determines the category
 * @param {Function} props.onRowClick - Function to call when a row is clicked
 * @param {boolean} props.isLoading - Whether the table is in a loading state
 * @param {boolean} props.isEmpty - Whether the table has no data
 * @param {string} props.error - Error message to display
 * @param {string} props.emptyMessage - Message to display when table is empty
 * @param {string} props.emptyTitle - Title to display when table is empty
 * @param {React.ReactNode} props.emptyIcon - Icon to display when table is empty
 * @param {React.ReactNode} props.emptyAction - Action button to display when table is empty
 * @param {string} props.loadingMessage - Message to display when table is loading
 * @param {React.ReactNode} props.footer - Custom footer content
 * @param {string} props.className - Additional CSS classes
 */
const Table = ({
  title = null,
  action = null,
  columns = [],
  data = [],
  categoryKey = null,
  onRowClick = null,
  isLoading = false,
  isEmpty = false,
  error = null,
  emptyMessage = 'No data available',
  emptyTitle = 'No data found',
  emptyIcon = <FileX />,
  emptyAction = null,
  loadingMessage = 'Loading data...',
  footer = null,
  className = '',
}) => {
  // Handle loading state
  if (isLoading) {
    return (
      <div className="table-loading">
        <p>{loadingMessage}</p>
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="table-error">
        <p>{error}</p>
      </div>
    );
  }

  // Handle empty state
  if (isEmpty || data.length === 0) {
    return (
      <div className="table-empty">
        <EmptyState
          icon={emptyIcon}
          title={emptyTitle}
          message={emptyMessage}
          action={emptyAction}
        />
      </div>
    );
  }

  // Get category class for a row
  const getCategoryClass = (item) => {
    if (!categoryKey || !item[categoryKey]) return '';
    
    // Convert to kebab case and lowercase
    const category = item[categoryKey]
      .toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^a-z0-9-]/g, '');
    
    return category;
  };

  // Determine if we need a header
  const hasHeader = title || action;

  return (
    <div className={`table-container ${className}`}>
      {hasHeader && (
        <div className="table-header">
          {title && <h3 className="table-title">{title}</h3>}
          {action && <div className="table-action">{action}</div>}
        </div>
      )}
      <table className="table">
        <thead>
          <tr>
            {columns.map((column, index) => (
              <th key={index} style={column.width ? { width: column.width } : {}}>
                {column.title}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((item, rowIndex) => (
            <tr
              key={rowIndex}
              className={getCategoryClass(item)}
              onClick={onRowClick ? () => onRowClick(item) : undefined}
              style={onRowClick ? { cursor: 'pointer' } : {}}
            >
              {columns.map((column, colIndex) => (
                <td key={colIndex}>
                  {column.render ? (
                    column.render(item)
                  ) : (
                    item[column.key]
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      
      {footer && (
        <div className="table-footer">
          {footer}
        </div>
      )}
    </div>
  );
};

Table.propTypes = {
  title: PropTypes.node,
  action: PropTypes.node,
  columns: PropTypes.arrayOf(
    PropTypes.shape({
      title: PropTypes.string.isRequired,
      key: PropTypes.string,
      render: PropTypes.func,
      width: PropTypes.string,
    })
  ).isRequired,
  data: PropTypes.array.isRequired,
  categoryKey: PropTypes.string,
  onRowClick: PropTypes.func,
  isLoading: PropTypes.bool,
  isEmpty: PropTypes.bool,
  error: PropTypes.string,
  emptyMessage: PropTypes.string,
  emptyTitle: PropTypes.string,
  emptyIcon: PropTypes.element,
  emptyAction: PropTypes.node,
  loadingMessage: PropTypes.string,
  footer: PropTypes.node,
  className: PropTypes.string,
};

export default Table;
