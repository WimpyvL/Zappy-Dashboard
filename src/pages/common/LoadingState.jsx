import React from 'react';

// LoadingState component for full-screen or inline loading
export const LoadingState = ({
  message = 'Loading...',
  fullScreen = false,
}) => {
  console.log('LoadingState rendering:', { message, fullScreen });
  return (
    <div className={`loading-container ${fullScreen ? 'full-screen' : ''}`}>
      <div className="spinner"></div>
      <p className="loading-message">{message}</p>
    </div>
  );
};

// TableSkeleton component for tables in loading state
export const TableSkeleton = ({ rows = 5, columns = 4 }) => {
  console.log('TableSkeleton rendering:', { rows, columns });
  return (
    <div className="table-skeleton">
      <div className="skeleton-header">
        {Array(columns)
          .fill(0)
          .map((_, index) => (
            <div key={`header-${index}`} className="skeleton-cell header"></div>
          ))}
      </div>
      <div className="skeleton-body">
        {Array(rows)
          .fill(0)
          .map((_, rowIndex) => (
            <div key={`row-${rowIndex}`} className="skeleton-row">
              {Array(columns)
                .fill(0)
                .map((_, colIndex) => (
                  <div
                    key={`cell-${rowIndex}-${colIndex}`}
                    className="skeleton-cell"
                  ></div>
                ))}
            </div>
          ))}
      </div>
    </div>
  );
};

// CardSkeleton component for dashboard cards in loading state
export const CardSkeleton = ({ count = 1 }) => {
  console.log('CardSkeleton rendering:', { count });
  return (
    <div className="card-skeleton-container">
      {Array(count)
        .fill(0)
        .map((_, index) => (
          <div key={`card-${index}`} className="card-skeleton">
            <div className="skeleton-header"></div>
            <div className="skeleton-body">
              <div className="skeleton-line"></div>
              <div className="skeleton-line"></div>
              <div className="skeleton-line short"></div>
            </div>
          </div>
        ))}
    </div>
  );
};

// Export components as both named exports and default export
export default LoadingState;
