import React, { useState } from 'react';
import { Layout, Typography, Button } from 'antd'; // Added Button
import NewConversationModal from './components/NewConversationModal'; // Import the modal
// import ConversationList from './components/ConversationList';
// import MessageView from './components/MessageView';

const { Content } = Layout;
const { Title } = Typography;

const MessagingPage = () => {
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false); // State for modal visibility

  // Mock data for now
  const conversations = [
    { id: 'conv1', participants: 'Patient Alice', lastMessage: 'Okay, thank you!', timestamp: '10:30 AM' },
    { id: 'conv2', participants: 'Dr. Bob (Team)', lastMessage: 'Please review the chart.', timestamp: 'Yesterday' },
    { id: 'conv3', participants: 'Patient Charlie', lastMessage: 'I have a question about...', timestamp: 'Tuesday' },
  ];

  const messages = {
    conv1: [ { id: 'msg1', sender: 'Provider', text: 'Your prescription is ready.', timestamp: '10:25 AM'}, { id: 'msg2', sender: 'Patient Alice', text: 'Okay, thank you!', timestamp: '10:30 AM'} ],
    conv2: [ { id: 'msg3', sender: 'Dr. Bob (Team)', text: 'Please review the chart.', timestamp: 'Yesterday'} ],
    conv3: [ { id: 'msg4', sender: 'Patient Charlie', text: 'I have a question about my side effects.', timestamp: 'Tuesday'} ],
  };

  const handleSelectConversation = (id) => {
    setSelectedConversationId(id);
  };

  const showNewConversationModal = () => {
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  const handleMessageSent = () => {
    // TODO: Refresh conversation list after a new message/conversation is created
    console.log("New conversation started/message sent - Refresh list");
  };

  return (
    <Layout className="min-h-screen">
      <Content className="p-6">
        <Title level={3} className="mb-6">Messages</Title>
        <div className="flex border border-gray-200 rounded-lg overflow-hidden h-[calc(100vh-12rem)]"> {/* Adjust height as needed */}
          {/* Left Pane: Conversation List */}
          <div className="w-1/3 border-r border-gray-200 overflow-y-auto">
            <div className="p-4 border-b border-gray-200">
                {/* Updated button to use Ant Design Button and trigger modal */}
                <Button
                  type="primary"
                  className="w-full bg-indigo-600 hover:bg-indigo-700"
                  onClick={showNewConversationModal}
                 >
                    New Message
                </Button>
            </div>
            {conversations.map(conv => (
                <div
                    key={conv.id}
                    className={`p-4 cursor-pointer hover:bg-gray-100 ${selectedConversationId === conv.id ? 'bg-indigo-50' : ''}`}
                    onClick={() => handleSelectConversation(conv.id)}
                >
                    <div className="font-medium text-sm">{conv.participants}</div>
                    <div className="text-xs text-gray-500 truncate">{conv.lastMessage}</div>
                    <div className="text-xs text-gray-400 text-right">{conv.timestamp}</div>
                </div>
            ))}
            {/* <ConversationList onSelectConversation={handleSelectConversation} selectedId={selectedConversationId} /> */}
          </div>

          {/* Right Pane: Message View */}
          <div className="w-2/3 flex flex-col">
            {selectedConversationId ? (
                <div className="flex-grow overflow-y-auto p-4 space-y-4">
                    {(messages[selectedConversationId] || []).map(msg => (
                        <div key={msg.id} className={`p-2 rounded max-w-[70%] ${msg.sender === 'Provider' ? 'bg-indigo-100 ml-auto' : 'bg-gray-100 mr-auto'}`}>
                            <p className="text-sm">{msg.text}</p>
                            <p className="text-xs text-gray-500 mt-1 text-right">{msg.timestamp}</p>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex-grow flex items-center justify-center text-gray-500">
                    Select a conversation to view messages.
                </div>
            )}
            {selectedConversationId && (
                <div className="p-4 border-t border-gray-200">
                    <textarea className="w-full border border-gray-300 rounded p-2 mb-2 text-sm" rows="3" placeholder="Type your message..."></textarea>
                    <Button type="primary" className="bg-indigo-600 hover:bg-indigo-700 float-right">
                        Send
                    </Button>
                </div>
            )}
            {/* <MessageView conversationId={selectedConversationId} /> */}
          </div>
        </div>
      </Content>
      {/* Render the modal */}
      <NewConversationModal
        visible={isModalVisible}
        onClose={handleModalClose}
        onSubmitSuccess={handleMessageSent}
      />
    </Layout>
  );
};

export default MessagingPage;
