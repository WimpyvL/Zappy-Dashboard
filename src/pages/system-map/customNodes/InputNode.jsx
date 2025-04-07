import React, { memo } from 'react';
import { Handle, Position } from 'reactflow';
import { Popover, Button } from 'antd'; // Removed Tooltip
import * as Icons from '@ant-design/icons'; // Import all icons


// Helper to get icon component by name, defaulting to UserOutlined for inputs
const getIcon = (iconName) => {
  const IconComponent = Icons[iconName] || Icons.UserOutlined;
  // Use Tailwind classes
  return <IconComponent className="text-gray-600 mr-2" />; // Adjusted styling
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
  const NodeIcon = getIcon(data.icon); // Get the icon component

  // Define common handle style (same as DefaultNode)
  const handleStyle = {
    width: '8px',
    height: '8px',
    background: '#4f46e5', // Indigo color
    border: 'none',
  };

  return (
    <>
      {/* Node Card Styling (Consistent with DefaultNode) */}
      <div className="bg-white rounded-md shadow-md border border-gray-200 overflow-hidden">
        {/* Header */}
        <div className="p-3 border-b border-gray-100 flex items-center bg-gray-50">
          {NodeIcon}
          <span className="font-medium text-sm text-gray-700">{data.label || 'Input Node'}</span>
        </div>

        {/* Body/Content - Using Popover for details */}
        <Popover
          content={<PopoverContent data={data} />}
          title={data.label || 'Input Node'}
          trigger="click"
          placement="bottom"
        >
          <div className="p-3 text-xs text-gray-600 cursor-pointer min-h-[30px]">
            {/* Display a snippet or placeholder text */}
            {data.description ? `${data.description.substring(0, 50)}...` : 'Click for details'}
          </div>
        </Popover>
      </div>

      {/* Output handle (bottom) - Input nodes typically only have source handles */}
      <Handle
        type="source"
        position={Position.Bottom}
        id="b"
        style={handleStyle}
        isConnectable={isConnectable}
      />
      {/* Note: Input nodes usually don't have a target handle, but if needed, add one similarly */}
    </>
  );
});

export default InputNode; // Updated export
