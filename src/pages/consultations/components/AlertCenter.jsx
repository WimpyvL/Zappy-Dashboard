import React from 'react';
import PropTypes from 'prop-types';

/**
 * AlertCenter
 * Displays AI-flagged alerts and monitoring recommendations.
 * Accepts an array of alerts and a callback for adjusting follow-up.
 */
const AlertCenter = ({
  alerts = [],
  onAdjustFollowUp = () => {},
  adjustFollowUpChecked = false,
  readOnly = false,
}) => {
  return (
    <div className="card bg-yellow-50 rounded-lg shadow mb-4">
      <div className="card-header flex justify-between items-center px-4 py-2 border-b border-yellow-200">
        <span className="font-semibold text-sm">Alert Center</span>
        <span className="text-xs text-yellow-700 opacity-70">AI-flagged</span>
      </div>
      <div className="card-body p-4">
        {alerts.length === 0 && (
          <div className="text-xs text-gray-500">No alerts.</div>
        )}
        {alerts.map((alert, idx) => (
          <div
            key={idx}
            className={`alert-center-item flex items-start mb-2 text-xs ${alert.type === 'warning' ? 'text-yellow-800' : 'text-blue-800'}`}
          >
            {alert.type === 'warning' ? (
              <svg width="14" height="14" viewBox="0 0 24 24" className="mr-1 flex-shrink-0" fill="none" stroke="currentColor"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeWidth="2"/></svg>
            ) : (
              <svg width="14" height="14" viewBox="0 0 24 24" className="mr-1 flex-shrink-0" fill="none" stroke="currentColor"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2"/></svg>
            )}
            <span>
              <strong>{alert.title}:</strong> {alert.message}
            </span>
          </div>
        ))}
        {/* Adjust follow-up option */}
        <div className="flex items-center mt-3 pt-3 border-t border-yellow-200">
          <input
            type="checkbox"
            id="adjustFollowUp"
            checked={adjustFollowUpChecked}
            onChange={e => onAdjustFollowUp(e.target.checked)}
            disabled={readOnly}
            className="mr-2"
          />
          <label htmlFor="adjustFollowUp" className="text-xs">
            Adjust f/u to 2 wks.
          </label>
        </div>
      </div>
    </div>
  );
};

AlertCenter.propTypes = {
  alerts: PropTypes.arrayOf(
    PropTypes.shape({
      type: PropTypes.oneOf(['warning', 'info']).isRequired,
      title: PropTypes.string.isRequired,
      message: PropTypes.string.isRequired,
    })
  ),
  onAdjustFollowUp: PropTypes.func,
  adjustFollowUpChecked: PropTypes.bool,
  readOnly: PropTypes.bool,
};

export default AlertCenter;
