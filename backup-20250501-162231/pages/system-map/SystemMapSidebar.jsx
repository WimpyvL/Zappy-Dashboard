import React from 'react';
import { Typography } from 'antd';
import { FileOutlined, ApiOutlined, UserOutlined, DatabaseOutlined, InteractionOutlined, AppstoreOutlined } from '@ant-design/icons'; // Added AppstoreOutlined

const { Title, Text } = Typography;

// Renamed from AutomationSidebar to SystemMapSidebar
const SystemMapSidebar = () => {
  // Function to handle drag start event - now includes icon info
  const onDragStart = (event, nodeType, nodeLabel, iconName) => {
    // Set data to be transferred during drag
    event.dataTransfer.setData('application/reactflow', JSON.stringify({ nodeType, nodeLabel, iconName })); // Add iconName
    event.dataTransfer.effectAllowed = 'move';
  };

  return (
    <aside className="border-l border-gray-200 p-4 w-64 bg-white shadow flex-shrink-0"> {/* Keep fixed width */}
      <Title level={5} style={{ marginBottom: '1rem' }}>Add Elements</Title>

      <Text type="secondary" style={{ display: 'block', marginBottom: '0.5rem' }}>Core Components</Text>
      <div
        className="flex items-center gap-2 p-2 border rounded bg-blue-50 text-blue-700 cursor-grab mb-2"
        onDragStart={(event) => onDragStart(event, 'page', 'Page/View', 'FileOutlined')} // Specific type 'page'
        draggable
      >
        <FileOutlined /> Page/View
      </div>
       <div
        className="flex items-center gap-2 p-2 border rounded bg-blue-50 text-blue-700 cursor-grab mb-2"
        onDragStart={(event) => onDragStart(event, 'component', 'Component', 'AppstoreOutlined')} // Specific type 'component'
        draggable
      >
        <AppstoreOutlined /> Component {/* Changed icon */}
      </div>

      <Text type="secondary" style={{ display: 'block', marginBottom: '0.5rem', marginTop: '1rem' }}>Data & APIs</Text>
      <div
        className="flex items-center gap-2 p-2 border rounded bg-green-50 text-green-700 cursor-grab mb-2"
        onDragStart={(event) => onDragStart(event, 'api', 'API Endpoint', 'ApiOutlined')} // Specific type 'api'
        draggable
      >
        <ApiOutlined /> API Endpoint
      </div>
       <div
        className="flex items-center gap-2 p-2 border rounded bg-green-50 text-green-700 cursor-grab mb-2"
        onDragStart={(event) => onDragStart(event, 'dataModel', 'Data Model', 'DatabaseOutlined')} // Specific type 'dataModel'
        draggable
      >
        <DatabaseOutlined /> Data Model
      </div>

       <Text type="secondary" style={{ display: 'block', marginBottom: '0.5rem', marginTop: '1rem' }}>Interactions</Text>
       <div
        className="flex items-center gap-2 p-2 border rounded bg-purple-50 text-purple-700 cursor-grab mb-2"
        onDragStart={(event) => onDragStart(event, 'userInput', 'User Input', 'UserOutlined')} // Specific type 'userInput'
        draggable
      >
        <UserOutlined /> User Input
      </div>
       <div
        className="flex items-center gap-2 p-2 border rounded bg-purple-50 text-purple-700 cursor-grab mb-2"
        onDragStart={(event) => onDragStart(event, 'event', 'System Event', 'InteractionOutlined')} // Specific type 'event'
        draggable
      >
        <InteractionOutlined /> System Event
      </div>

      {/* Add more draggable element types here */}

    </aside>
  );
};

export default SystemMapSidebar; // Updated export
