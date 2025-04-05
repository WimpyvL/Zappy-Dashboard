import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Tooltip, Popover, Button } from 'antd'; // Import Popover, Button
import * as Icons from '@ant-design/icons'; // Import all icons

// Helper to get icon component by name, defaulting to a generic one
const getIcon = (iconName) => {
  const IconComponent = Icons[iconName] || Icons.AppstoreOutlined;
  // Apply style directly in the helper
  return <IconComponent style={{ color: '#595959', marginRight: '8px' }} />;
};

// Content for the Popover
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

      {/* Wrap node content with Popover */}
      <Popover
        content={<PopoverContent data={data} />}
        title={data.label || 'System Element'}
        trigger="click" // Show on click
        placement="bottom" // Position below the node
        // overlayStyle={{ maxWidth: '300px' }} // Optional: constrain width
      >
        {/* Node Content - Add cursor pointer */}
        <div className="react-flow__node-default" style={{ padding: '10px 15px', background: '#fafafa', border: '1px solid #d9d9d9', cursor: 'pointer' }}>
          <div style={{ display: 'flex', alignItems: 'center' }}>
              {NodeIcon} {/* Render the dynamic icon */}
              <span style={{ fontWeight: 500 }}>{data.label || 'System Element'}</span>
           </div>
           {/* Description removed from direct display */}
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

export default DefaultNode; // Updated export
