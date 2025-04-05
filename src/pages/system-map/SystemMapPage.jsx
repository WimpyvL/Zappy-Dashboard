import React, { useState, useCallback, useRef, useEffect, forwardRef, useImperativeHandle } from 'react'; // Added forwardRef, useImperativeHandle
import { Typography, Divider, Button, Select, Input, Form, Modal, Space } from 'antd';
import { MenuFoldOutlined, MenuUnfoldOutlined, DeleteOutlined, CopyOutlined } from '@ant-design/icons';
import ReactFlow, {
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  MiniMap,
  Controls,
  Background,
  useReactFlow,
} from 'reactflow';
import SystemMapSidebar from './SystemMapSidebar';
import DefaultNode from './customNodes/DefaultNode';
import InputNode from './customNodes/InputNode';

import 'reactflow/dist/style.css';

const { Title, Text } = Typography;
const { Option } = Select;

// Define the node types for the system map
const nodeTypes = {
  input: InputNode,
  default: DefaultNode,
};

// Initial node for demonstration
const initialNodes = [
  {
    id: '1',
    type: 'input',
    data: { label: 'User Action', icon: 'UserOutlined' }, // Added default icon
    position: { x: 250, y: 5 },
  },
];

const initialEdges = [];

let id = 2;
const getId = () => `${id++}`;

// --- Node Configuration Modal ---
const NodeConfigModal = ({ node, isVisible, onSave, onClose, onDelete, onDuplicate }) => { // Added onDelete, onDuplicate
  const [form] = Form.useForm();

  useEffect(() => {
    if (node && isVisible) {
      form.setFieldsValue({
        nodeLabel: node.data?.label || '',
        description: node.data?.description || '',
        link: node.data?.link || '',
      });
    } else {
      form.resetFields();
    }
  }, [node, isVisible, form]);

  const handleOk = () => {
    form
      .validateFields()
      .then((values) => {
        const updatedData = {
          label: values.nodeLabel,
          description: values.description,
          link: values.link,
          icon: node.data?.icon // Preserve existing icon
        };
        onSave(node.id, updatedData);
        onClose();
      })
      .catch((info) => {
        console.log('Validate Failed:', info);
      });
  };

  // Callbacks for quick actions
  const handleDeleteClick = () => onDelete(node.id);
  const handleDuplicateClick = () => onDuplicate(node);


  return (
    <Modal
      title={`Configure: ${node?.data?.label || 'Node'}`}
      visible={isVisible}
      onOk={handleOk}
      onCancel={onClose}
      destroyOnClose // Reset form state when modal is closed
      footer={[
          <Button key="delete" icon={<DeleteOutlined />} onClick={handleDeleteClick} danger>
            Delete
          </Button>,
          <Button key="duplicate" icon={<CopyOutlined />} onClick={handleDuplicateClick}>
            Duplicate
          </Button>,
          <Button key="cancel" onClick={onClose}>
            Cancel
          </Button>,
          <Button key="submit" type="primary" onClick={handleOk}>
            Save Changes
          </Button>,
        ]}
    >
      <Form form={form} layout="vertical" name="node_config_form">
        <Form.Item
          label="Label"
          name="nodeLabel"
          rules={[{ required: true, message: 'Please input the node label!' }]}
        >
           <Input placeholder="Enter node label" />
        </Form.Item>
        <Form.Item label="Description" name="description">
           <Input.TextArea rows={4} placeholder="Enter description or notes" />
        </Form.Item>
         <Form.Item label="Link (Optional)" name="link">
           <Input placeholder="e.g., Link to code file or API doc" />
        </Form.Item>
      </Form>
    </Modal>
  );
};
// --- End Node Configuration Modal ---


// Renamed from AutomationEditor to SystemMapEditor
// Use forwardRef to allow parent to call methods like updateNodeData
const SystemMapEditor = forwardRef(({ onSaveCallback, onLoadCallback, onReset, onNodeEdit }, ref) => {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const { screenToFlowPosition, toObject, deleteElements } = useReactFlow();

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      const typeDataString = event.dataTransfer.getData('application/reactflow');
      if (typeof typeDataString === 'undefined' || !typeDataString) return;

       const { nodeType, nodeLabel, iconName } = JSON.parse(typeDataString);
       const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
       const newNode = {
         id: getId(),
         type: nodeType || 'default', // Ensure a type is set
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

  // Function to update node data internally, exposed via ref
  const internalUpdateNodeData = useCallback((nodeId, updatedData) => {
    setNodes((nds) =>
      nds.map((node) =>
        node.id === nodeId ? { ...node, data: { ...node.data, ...updatedData } } : node
      )
    );
  }, [setNodes]);

  // Function to delete node internally, exposed via ref
  const internalDeleteNode = useCallback((nodeId) => {
     deleteElements({ nodes: [{ id: nodeId }] });
  }, [deleteElements]);

   // Function to duplicate node internally, exposed via ref
  const internalDuplicateNode = useCallback((nodeToDuplicate) => {
     const newNode = {
       id: getId(),
       type: nodeToDuplicate.type,
       position: {
         x: nodeToDuplicate.position.x + 50, // Offset position slightly
         y: nodeToDuplicate.position.y + 50,
       },
       data: { ...nodeToDuplicate.data }, // Copy data
     };
     setNodes((nds) => nds.concat(newNode));
  }, [setNodes]);


  const handleReset = useCallback(() => {
    setNodes(initialNodes);
    setEdges(initialEdges);
    console.log('System map canvas reset.');
  }, [setNodes, setEdges]);

  // Expose internal functions via the ref passed from the parent
  useImperativeHandle(ref, () => ({
    updateNodeData: internalUpdateNodeData,
    deleteNode: internalDeleteNode,
    duplicateNode: internalDuplicateNode,
    reset: handleReset // Expose reset if needed by parent directly
  }));

  // Expose reset via onReset prop as well (for the New Map button)
  useEffect(() => {
    if (onReset) onReset.current = handleReset;
  }, [onReset, handleReset]);

  // Trigger the modal open via callback
  const onNodeClick = useCallback((event, node) => {
    onNodeEdit(node);
  }, [onNodeEdit]);

  const onNodeDoubleClick = useCallback((event, node) => {
     onNodeEdit(node);
  }, [onNodeEdit]);

  // Handle deletion via React Flow's mechanism (e.g., Backspace key)
  const onNodesDelete = useCallback(
    (deletedNodes) => {
      console.log('Nodes deleted via keypress:', deletedNodes);
    },
    []
  );

  return (
    <div className="flex flex-col flex-grow h-full">
      <div className="flex justify-end space-x-2 mb-2 p-2 border-b flex-shrink-0">
         <Button onClick={handleLoad}>Load Map (Placeholder)</Button>
         <Button type="primary" onClick={handleSave}>Save Map (Log to Console)</Button>
      </div>
      <div className="flex flex-grow" ref={reactFlowWrapper}>
        <div className="flex-grow h-full" style={{ border: '1px solid #eee' }}>
          <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            onDragOver={onDragOver}
            onDrop={onDrop}
            onNodeClick={onNodeClick}
            onNodeDoubleClick={onNodeDoubleClick}
            onNodesDelete={onNodesDelete}
            nodeTypes={nodeTypes}
            fitView
            attributionPosition="top-right"
            className="bg-gray-50"
          >
            <MiniMap />
            <Controls />
            <Background />
          </ReactFlow>
        </div>
        <SystemMapSidebar />
      </div>
    </div>
  );
}); // Close forwardRef

// Renamed from AutomationsPage to SystemMapPage
const SystemMapPage = () => {
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingNode, setEditingNode] = useState(null);
  const editorRef = useRef(null); // Ref to access editor methods
  const editorResetRef = useRef(null);
  const [isMapListCollapsed, setIsMapListCollapsed] = useState(false);

  const handleNodeEdit = useCallback((node) => {
    setEditingNode(node);
    setIsModalVisible(true);
  }, []);

  const handleModalClose = useCallback(() => {
    setIsModalVisible(false);
    setEditingNode(null);
  }, []);

  // Save data from modal by calling editor's internal update function
  const handleModalSave = useCallback((nodeId, updatedData) => {
     if (editorRef.current?.updateNodeData) {
        editorRef.current.updateNodeData(nodeId, updatedData);
     } else {
        console.error("Editor update function not available via ref.");
     }
  }, []); // No dependencies needed as editorRef is stable

  // Delete node by calling editor's internal delete function
  const handleModalDelete = useCallback((nodeId) => {
     if (editorRef.current?.deleteNode) {
        editorRef.current.deleteNode(nodeId);
        handleModalClose(); // Close modal after delete
     } else {
        console.error("Editor delete function not available via ref.");
     }
  }, [handleModalClose]); // Depend on handleModalClose

  // Duplicate node by calling editor's internal duplicate function
  const handleModalDuplicate = useCallback((node) => {
     if (editorRef.current?.duplicateNode) {
        editorRef.current.duplicateNode(node);
        handleModalClose(); // Close modal after duplicate
     } else {
        console.error("Editor duplicate function not available via ref.");
     }
  }, [handleModalClose]); // Depend on handleModalClose


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
    else console.error("Editor reset function not available.");
  }, []);

  return (
    <ReactFlowProvider>
      <div className="p-4 flex flex-col h-[calc(100vh-80px)]">
        <div className="flex justify-between items-center flex-shrink-0 pb-3 border-b border-gray-200">
           <div>
             <Title level={3} style={{ margin: 0 }}>System Map</Title>
             <Text type="secondary">Visualize system architecture and flows</Text>
           </div>
           <Button onClick={handleNewMapClick}>New Map</Button>
        </div>
        <div className="flex flex-grow mt-3 space-x-4 overflow-hidden">
           {/* Map List (Collapsible) */}
           <div className={`bg-white rounded shadow flex-shrink-0 transition-all duration-300 ease-in-out ${isMapListCollapsed ? 'w-16' : 'w-64'}`}>
              <div className="p-4 flex justify-between items-center border-b">
                 <Title level={4} style={{ marginBottom: 0, display: isMapListCollapsed ? 'none' : 'block' }}>Maps</Title>
                 <Button
                    type="text"
                    icon={isMapListCollapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
                    onClick={() => setIsMapListCollapsed(!isMapListCollapsed)}
                 />
              </div>
              <div className={`p-4 space-y-2 overflow-y-auto ${isMapListCollapsed ? 'hidden' : 'block'}`}>
                 <div className="p-2 border rounded hover:bg-gray-100 cursor-pointer">User Flow Map</div>
                 <div className="p-2 border rounded hover:bg-gray-100 cursor-pointer">Data Model Diagram</div>
                 <Text type="secondary">List placeholder...</Text>
              </div>
           </div>
           {/* Map Editor */}
           <div className="bg-white p-4 rounded shadow flex-grow flex flex-col">
             <SystemMapEditor
               ref={editorRef} // Pass ref to editor
               onSaveCallback={onSaveCallback}
               onLoadCallback={onLoadCallback}
               onReset={editorResetRef}
               onNodeEdit={handleNodeEdit}
             />
           </div>
         </div>
       </div>
       {/* Render the Modal */}
       <NodeConfigModal
         isVisible={isModalVisible}
         node={editingNode}
         onClose={handleModalClose}
         onSave={handleModalSave}
         onDelete={handleModalDelete} // Pass delete handler
         onDuplicate={handleModalDuplicate} // Pass duplicate handler
       />
    </ReactFlowProvider>
  );
};

export default SystemMapPage;
