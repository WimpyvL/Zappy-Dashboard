import React, {
  useState,
  useCallback,
  useRef,
  useEffect,
  forwardRef,
  useImperativeHandle,
  // useMemo, // Removed unused import
} from 'react';
import { Typography, Button, Select } from 'antd'; // Removed Divider, Input, Form, Modal, Space
import { MenuFoldOutlined, MenuUnfoldOutlined } from '@ant-design/icons'; // Removed Modal icons
import ReactFlow, {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant, // Import BackgroundVariant
  useReactFlow,
} from 'reactflow';
import SystemMapSidebar from './SystemMapSidebar'; // Correct path
import DefaultNode from './customNodes/DefaultNode'; // Correct path
import InputNode from './customNodes/InputNode'; // Correct path

import 'reactflow/dist/style.css';

const { Title, Text } = Typography;
// const { Option } = Select; // Removed unused Option

// Define the node types for the system map outside the component to prevent recreation on each render
const NODE_TYPES = {
  input: InputNode,
  default: DefaultNode,
};

// Initial node for demonstration
const initialNodes = [
  {
    id: '1',
    type: 'input',
    data: { label: 'User Action', icon: 'UserOutlined' },
    position: { x: 250, y: 5 },
  },
];

const initialEdges = [];

let id = 2;
const getId = () => `${id++}`;

// Removed NodeConfigModal component definition

// Renamed from AutomationEditor to SystemMapEditor
// Use forwardRef to allow parent to call methods
const SystemMapEditor = forwardRef(
  ({ onSaveCallback, onLoadCallback, onReset }, ref) => {
    // Removed onNodeEdit
    const reactFlowWrapper = useRef(null);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    // Removed unused deleteElements
    const { screenToFlowPosition, toObject } = useReactFlow();

    const onConnect = useCallback(
      // Add dashed style to new edges
      (params) => setEdges((eds) => addEdge({ ...params, style: { strokeDasharray: '5 5' } }, eds)),
      [setEdges]
    );

    const onDragOver = useCallback((event) => {
      event.preventDefault();
      event.dataTransfer.dropEffect = 'move';
    }, []);

    const onDrop = useCallback(
      (event) => {
        event.preventDefault();
        const typeDataString = event.dataTransfer.getData(
          'application/reactflow'
        );
        if (typeof typeDataString === 'undefined' || !typeDataString) return;

        const { nodeType, nodeLabel, iconName } = JSON.parse(typeDataString);
        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        });
        const newNode = {
          id: getId(),
          type: nodeType || 'default',
          position,
          data: { label: `${nodeLabel}`, icon: iconName },
        };
        setNodes((nds) => nds.concat(newNode));
      },
      [screenToFlowPosition, setNodes]
    );

    const handleSave = useCallback(() => {
      const flowData = toObject();
      onSaveCallback(flowData);
    }, [toObject, onSaveCallback]);

    const handleLoad = useCallback(() => {
      onLoadCallback();
    }, [onLoadCallback]);

    // Removed internalUpdateNodeData, internalDeleteNode, internalDuplicateNode

    const handleReset = useCallback(() => {
      setNodes(initialNodes);
      setEdges(initialEdges);
      console.log('System map canvas reset.');
    }, [setNodes, setEdges]);

    // Expose only reset function via ref
    useImperativeHandle(ref, () => ({
      reset: handleReset,
    }));

    // Expose reset via onReset prop as well (for the New Map button)
    useEffect(() => {
      if (onReset) onReset.current = handleReset;
    }, [onReset, handleReset]);

    // Removed onNodeClick and onNodeDoubleClick handlers

    // Handle deletion via React Flow's mechanism (e.g., Backspace key)
    const onNodesDelete = useCallback((deletedNodes) => {
      console.log('Nodes deleted via keypress:', deletedNodes);
    }, []);

    return (
      <div className="flex flex-col flex-grow h-full">
        <div className="flex justify-end space-x-2 mb-2 p-2 border-b flex-shrink-0">
          <Button onClick={handleLoad}>Load Map (Placeholder)</Button>
          <Button type="primary" onClick={handleSave}>
            Save Map (Log to Console)
          </Button>
        </div>
        <div className="flex flex-grow" ref={reactFlowWrapper}>
          {/* Removed border style from this div */}
          <div className="flex-grow h-full">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onDragOver={onDragOver}
              onDrop={onDrop}
              // Removed onNodeClick, onNodeDoubleClick props
              onNodesDelete={onNodesDelete}
              nodeTypes={NODE_TYPES}
              fitView
              attributionPosition="top-right"
              className="bg-gray-50"
            >
              <MiniMap />
              <Controls />
              {/* Changed background to dots */}
              <Background variant={BackgroundVariant.Dots} gap={12} size={1} />
            </ReactFlow>
          </div>
          {/* Sidebar is always rendered */}
          <SystemMapSidebar />
        </div>
      </div>
    );
  }
); // Close forwardRef

// Renamed from AutomationsPage to SystemMapPage
const SystemMapPage = () => {
  // Removed modal state (isModalVisible, editingNode)
  // Removed editorRef (only reset ref needed now)
  const editorResetRef = useRef(null);
  const [isMapListCollapsed, setIsMapListCollapsed] = useState(false);

  // Removed modal handlers (handleNodeEdit, handleModalClose, handleModalSave, etc.)

  const onSaveCallback = useCallback((flowData) => {
    console.log('--- System Map Save Data ---');
    console.log('Nodes:', flowData.nodes);
    console.log('Edges:', flowData.edges);
    console.log('Full JSON:', JSON.stringify(flowData, null, 2));
    alert('System Map data logged to console.');
  }, []);

  const onLoadCallback = useCallback(() => {
    console.log('Load map placeholder clicked.');
    alert('Load map functionality not implemented yet.');
  }, []);

  const handleNewMapClick = useCallback(() => {
    if (editorResetRef.current) editorResetRef.current();
    else console.error('Editor reset function not available.');
  }, []);

  return (
    <ReactFlowProvider>
      <div className="p-4 flex flex-col h-[calc(100vh-80px)]">
        <div className="flex justify-between items-center flex-shrink-0 pb-3 border-b border-gray-200">
          <div>
            <Title level={3} style={{ margin: 0 }}>
              System Map
            </Title>
            <Text type="secondary">
              Visualize system architecture and flows
            </Text>
          </div>
          <Button onClick={handleNewMapClick}>New Map</Button>
        </div>
        <div className="flex flex-grow mt-3 space-x-4 overflow-hidden">
          {/* Map List (Collapsible) */}
          <div
            className={`bg-white rounded shadow flex-shrink-0 transition-all duration-300 ease-in-out ${isMapListCollapsed ? 'w-16' : 'w-64'}`}
          >
            <div className="p-4 flex justify-between items-center border-b">
              <Title
                level={4}
                style={{
                  marginBottom: 0,
                  display: isMapListCollapsed ? 'none' : 'block',
                }}
              >
                Maps
              </Title>
              <Button
                type="text"
                icon={
                  isMapListCollapsed ? (
                    <MenuUnfoldOutlined />
                  ) : (
                    <MenuFoldOutlined />
                  )
                }
                onClick={() => setIsMapListCollapsed(!isMapListCollapsed)}
              />
            </div>
            <div
              className={`p-4 space-y-2 overflow-y-auto ${isMapListCollapsed ? 'hidden' : 'block'}`}
            >
              <div className="p-2 border rounded hover:bg-gray-100 cursor-pointer">
                User Flow Map
              </div>
              <div className="p-2 border rounded hover:bg-gray-100 cursor-pointer">
                Data Model Diagram
              </div>
              <Text type="secondary">List placeholder...</Text>
            </div>
          </div>
          {/* Map Editor */}
          <div className="bg-white p-4 rounded shadow flex-grow flex flex-col">
            <SystemMapEditor
              // Removed ref={editorRef}
              onSaveCallback={onSaveCallback}
              onLoadCallback={onLoadCallback}
              onReset={editorResetRef}
              // Removed onNodeEdit prop
            />
          </div>
        </div>
      </div>
      {/* Removed Modal Rendering */}
    </ReactFlowProvider>
  );
};

export default SystemMapPage;
