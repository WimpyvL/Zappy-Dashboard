import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Tooltip, Popover, Button } from 'antd'; // Import Popover, Button
import * as Icons from '@ant-design/icons'; // Import all icons


// Helper to get icon component by name, defaulting to UserOutlined for inputs
const getIcon = (iconName) => {
  const IconComponent = Icons[iconName] || Icons.UserOutlined;
  // Apply style directly in the helper
  return <IconComponent style={{ color: '#c41d7f', marginRight: '8px' }} />;
};

// Content for the Popover (Can reuse or customize)
const PopoverContent = ({ data }) => (
  <div style={{ maxWidth: '250px' }}>
    {data.description && <p style={{ marginBottom: data.link ? '8px' : '0' }}>{data.description}</p>}
    {data.link && (
      <Button type="link" href={data.link} target="_blank" rel="noopener noreferrer" style={{ padding: 0 }}>
        More Info
      </Button>
    )}
    {!data.description && !data.link && <p style={{ color: '#888', margin: 0 }}>No details provided.</p>}
  </div>
);

// Renamed from TriggerNode to InputNode
const InputNode = memo(({ data, isConnectable }) => {
  const NodeIcon = getIcon(data.icon); // Get the icon component based on data.icon

  return (
    <>
      {/* Wrap node content with Popover */}
      <Popover
        content={<PopoverContent data={data} />}
        title={data.label || 'Input Node'}
        trigger="click" // Show on click
        placement="bottom" // Position below the node
      >
        {/* Node Content - Add cursor pointer */}
        <div className="react-flow__node-input" style={{ padding: '10px 15px', background: '#fff0f6', border: '1px solid #ffadd2', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
              {NodeIcon} {/* Render the dynamic icon */}
              <span style={{ fontWeight: 500 }}>{data.label || 'Input Node'}</span>
           </div>
           {/* Removed description display from here */}
        </div>
      </Popover>

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
