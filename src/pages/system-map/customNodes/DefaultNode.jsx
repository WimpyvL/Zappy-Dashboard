import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Tooltip } from 'antd';
import * as Icons from '@ant-design/icons'; // Import all icons

// Helper to get icon component by name, defaulting to a generic one
const getIcon = (iconName) => {
  const IconComponent = Icons[iconName] || Icons.AppstoreOutlined;
  // Apply style directly in the helper
  return <IconComponent style={{ color: '#595959', marginRight: '8px' }} />;
};

// Renamed from ActionNode to DefaultNode
const DefaultNode = memo(({ data, isConnectable }) => {
  const NodeIcon = getIcon(data.icon); // Get the icon component based on data.icon

  return (
    <>
      {/* Input handle (top) */}
      <Tooltip title="Input">
         <Handle
           type="target"
           position={Position.Top}
           id="a" // Unique ID for the handle
           style={{ background: '#555' }}
           isConnectable={isConnectable}
         />
      </Tooltip>

      {/* Node Content - Reverted styling */}
      <div className="react-flow__node-default" style={{ padding: '10px 15px', background: '#fafafa', border: '1px solid #d9d9d9' }}>
        <div style={{ display: 'flex', alignItems: 'center' }}>
            {NodeIcon} {/* Render the dynamic icon */}
            <span style={{ fontWeight: 500 }}>{data.label || 'System Element'}</span>
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

export default DefaultNode; // Updated export
