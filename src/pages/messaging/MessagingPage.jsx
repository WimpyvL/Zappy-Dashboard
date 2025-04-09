import React, { useState } from 'react';
import { Layout, Typography, Button, Space, Avatar, Input, Badge } from 'antd'; // Added components
import { 
  QuestionCircleOutlined, 
  SendOutlined, 
  UserOutlined, 
  TeamOutlined,
  PlusOutlined,
  MessageOutlined
} from '@ant-design/icons'; // Added icons
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
    {
      id: 'conv1',
      participants: 'Patient Alice',
      lastMessage: 'Okay, thank you!',
      timestamp: '10:30 AM',
    },
    {
      id: 'conv2',
      participants: 'Dr. Bob (Team)',
      lastMessage: 'Please review the chart.',
      timestamp: 'Yesterday',
    },
    {
      id: 'conv3',
      participants: 'Patient Charlie',
      lastMessage: 'I have a question about...',
      timestamp: 'Tuesday',
    },
  ];

  const messages = {
    conv1: [
      {
        id: 'msg1',
        sender: 'Provider',
        text: 'Your prescription is ready.',
        timestamp: '10:25 AM',
      },
      {
        id: 'msg2',
        sender: 'Patient Alice',
        text: 'Okay, thank you!',
        timestamp: '10:30 AM',
      },
    ],
    conv2: [
      {
        id: 'msg3',
        sender: 'Dr. Bob (Team)',
        text: 'Please review the chart.',
        timestamp: 'Yesterday',
      },
    ],
    conv3: [
      {
        id: 'msg4',
        sender: 'Patient Charlie',
        text: 'I have a question about my side effects.',
        timestamp: 'Tuesday',
      },
    ],
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
    console.log('New conversation started/message sent - Refresh list');
  };

  return (
    <Layout className="min-h-screen">
      <Content className="p-6">
        <div className="flex justify-between items-center mb-6">
          <Title level={3} className="mb-0 text-gray-800">
            Messages
          </Title>
           {/* Placeholder Customer Service Button */}
           <Button 
             type="default"
             icon={<QuestionCircleOutlined />}
             onClick={() => alert('Customer Service link/page not yet implemented.')}
             className="border-indigo-500 text-indigo-600 hover:text-indigo-700 hover:border-indigo-700"
           >
             Help / Customer Service
           </Button>
        </div>
        <div className="flex border border-gray-200 rounded-lg overflow-hidden shadow-sm h-[calc(100vh-14rem)]"> {/* Added shadow */}
          {/* Left Pane: Conversation List */}
          <div className="w-1/3 border-r border-gray-200 flex flex-col bg-gray-50"> {/* Changed background */}
            <div className="p-4 border-b border-gray-200 bg-white shadow-sm"> {/* Added shadow */}
              <Button
                type="primary"
                icon={<PlusOutlined />}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                onClick={showNewConversationModal}
              >
                New Message
              </Button>
            </div>
            <div className="overflow-y-auto flex-grow">
              {conversations.map((conv) => (
                <div
                  key={conv.id}
                  className={`p-4 cursor-pointer hover:bg-gray-100 border-b border-gray-100 transition-colors ${
                    selectedConversationId === conv.id ? 'bg-indigo-50 border-l-4 border-l-indigo-500' : ''
                  }`}
                  onClick={() => handleSelectConversation(conv.id)}
                >
                  <div className="flex items-start">
                    <Avatar 
                      icon={conv.participants.includes('Team') ? <TeamOutlined /> : <UserOutlined />} 
                      className={conv.participants.includes('Team') ? "bg-blue-500" : "bg-green-500"}
                    />
                    <div className="ml-3 flex-grow">
                      <div className="flex justify-between">
                        <span className="font-medium text-sm text-gray-800">{conv.participants}</span>
                        <span className="text-xs text-gray-400">{conv.timestamp}</span>
                      </div>
                      <div className="text-xs text-gray-500 truncate mt-1">
                        {conv.lastMessage}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {/* <ConversationList onSelectConversation={handleSelectConversation} selectedId={selectedConversationId} /> */}
          </div>
          {/* Right Pane: Message View */}
          <div className="w-2/3 flex flex-col bg-white">
            {selectedConversationId ? (
              <>
                {/* Chat Header */}
                <div className="p-4 border-b border-gray-200 bg-white shadow-sm">
                  <div className="flex items-center">
                    <Avatar 
                      icon={messages[selectedConversationId][0].sender.includes('Team') ? <TeamOutlined /> : <UserOutlined />} 
                      className={messages[selectedConversationId][0].sender.includes('Team') ? "bg-blue-500" : "bg-green-500"}
                    />
                    <div className="ml-3">
                      <div className="font-medium text-gray-800">
                        {conversations.find(c => c.id === selectedConversationId)?.participants}
                      </div>
                      <div className="text-xs text-gray-500">
                        {messages[selectedConversationId].length} messages
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Messages Area */}
                <div className="flex-grow overflow-y-auto p-6 space-y-4 bg-gray-50">
                  {(messages[selectedConversationId] || []).map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex ${msg.sender === 'Provider' ? 'justify-end' : 'justify-start'}`}
                    >
                      {msg.sender !== 'Provider' && (
                        <Avatar 
                          size="small"
                          icon={<UserOutlined />} 
                          className="mr-2 mt-1 bg-green-500"
                        />
                      )}
                      <div
                        className={`p-3 rounded-lg max-w-[70%] shadow-sm ${
                          msg.sender === 'Provider' 
                            ? 'bg-indigo-500 text-white rounded-tr-none' 
                            : 'bg-white border border-gray-200 rounded-tl-none'
                        }`}
                      >
                        <p className={`text-sm ${msg.sender === 'Provider' ? 'text-white' : 'text-gray-800'}`}>
                          {msg.text}
                        </p>
                        <p className={`text-xs mt-1 text-right ${msg.sender === 'Provider' ? 'text-indigo-100' : 'text-gray-500'}`}>
                          {msg.timestamp}
                        </p>
                      </div>
                      {msg.sender === 'Provider' && (
                        <Avatar 
                          size="small"
                          icon={<TeamOutlined />} 
                          className="ml-2 mt-1 bg-blue-500"
                        />
                      )}
                    </div>
                  ))}
                </div>
                
                {/* Input Area */}
                <div className="p-4 border-t border-gray-200 bg-white">
                  <div className="flex">
                    <Input.TextArea
                      className="flex-grow border border-gray-300 rounded-l-md p-2 text-sm focus:border-indigo-500 focus:outline-none"
                      rows={2}
                      placeholder="Type your message..."
                      autoSize={{ minRows: 1, maxRows: 4 }}
                    />
                    <Button
                      type="primary"
                      icon={<SendOutlined />}
                      className="bg-indigo-600 hover:bg-indigo-700 rounded-l-none"
                    >
                      Send
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center text-gray-500 bg-gray-50">
                <Avatar size={64} icon={<MessageOutlined />} className="bg-gray-200 text-gray-400 mb-4" />
                <p>Select a conversation to view messages</p>
                <Button 
                  type="default" 
                  className="mt-4 border-indigo-500 text-indigo-600"
                  onClick={showNewConversationModal}
                >
                  Start a new conversation
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
