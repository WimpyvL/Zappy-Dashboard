import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Tooltip } from 'antd';
import * as Icons from '@ant-design/icons'; // Import all icons

// Helper to get icon component by name, defaulting to UserOutlined for inputs
const getIcon = (iconName) => {
  const IconComponent = Icons[iconName] || Icons.UserOutlined;
  // Apply style directly in the helper
  return <IconComponent style={{ color: '#c41d7f', marginRight: '8px' }} />;
};

// Renamed from TriggerNode to InputNode
const InputNode = memo(({ data, isConnectable }) => {
  const NodeIcon = getIcon(data.icon); // Get the icon component based on data.icon

  return (
    <>
      {/* Node Content - Reverted styling */}
      <div className="react-flow__node-input" style={{ padding: '10px 15px', background: '#fff0f6', border: '1px solid #ffadd2' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
            {NodeIcon} {/* Render the dynamic icon */}
            <span style={{ fontWeight: 500 }}>{data.label || 'Input Node'}</span>
         </div>
         {/* Description can optionally be shown here again if needed, or kept for modal */}
         {/* {data.description && (
           <div style={{ fontSize: '10px', color: '#555', marginTop: '4px', whiteSpace: 'pre-wrap' }}>
             {data.description}
           </div>
         )} */}
       </div>

      {/* Output handle (bottom) */}
      <Tooltip title="Output">
        <Handle
          type="source"
          position={Position.Bottom}
          id="b" // Unique ID for the handle
          style={{ background: '#555' }}
          isConnectable={isConnectable}
        />
      </Tooltip>
    </>
  );
});

export default InputNode; // Updated export
