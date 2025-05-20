import React from 'react';
import PropTypes from 'prop-types';
import { X } from 'lucide-react';

/**
 * AlertCenter
 * Displays AI-flagged alerts and monitoring recommendations.
 * Includes a dismiss button for each alert.
 */
const AlertCenter = ({
  alerts = [],
  onDismissAlert = () => {},
  readOnly = false,
}) => {
  return (
    <div style={{ 
      background: 'linear-gradient(135deg, #fffbeb, #fef3c7)',
      borderRadius: '6px',
      boxShadow: '0 1px 2px rgba(0,0,0,0.05)',
      overflow: 'hidden',
      marginBottom: '8px',
      borderLeft: '3px solid #f59e0b'
    }}>
      <div style={{ 
        padding: '10px 14px',
        borderBottom: '1px solid #e5e7eb',
        fontWeight: 600,
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '15px',
        backgroundColor: '#f9fafb'
      }}>
        Alert Center
      </div>
      <div style={{ padding: '10px 14px', fontSize: '14px' }}>
        {alerts.length === 0 && (
          <div style={{ fontSize: '13px', color: '#6b7280' }}>No alerts.</div>
        )}
        {alerts.map((alert, idx) => (
          <div
            key={idx}
            style={{ 
              display: 'flex', 
              alignItems: 'flex-start', 
              justifyContent: 'space-between', 
              marginBottom: '8px', 
              fontSize: '14px',
              color: alert.type === 'warning' ? '#92400e' : '#1e40af'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'flex-start' }}>
              {alert.type === 'warning' ? (
                <svg width="14" height="14" viewBox="0 0 24 24" style={{ marginRight: '6px', flexShrink: 0 }} fill="none" stroke="currentColor"><path d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" strokeWidth="2"/></svg>
              ) : (
                <svg width="14" height="14" viewBox="0 0 24 24" style={{ marginRight: '6px', flexShrink: 0 }} fill="none" stroke="currentColor"><path d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" strokeWidth="2"/></svg>
              )}
              <span>
                <strong>{alert.title}:</strong> {alert.message}
              </span>
            </div>
            {!readOnly && (
              <button
                style={{ 
                  marginLeft: '8px', 
                  color: '#6b7280', 
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: 0
                }}
                onClick={() => onDismissAlert(idx)}
                aria-label="Dismiss alert"
              >
                <X size={14} />
              </button>
            )}
          </div>
        ))}
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
  onDismissAlert: PropTypes.func,
  readOnly: PropTypes.bool,
};

export default AlertCenter;
