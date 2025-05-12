import React, { useState, useEffect, useRef } from 'react';
import { Layout, Typography, Button, Avatar, Input, Spin, Empty, Dropdown, Menu, Badge, Tabs, Tooltip, Popover } from 'antd';
import { 
  QuestionCircleOutlined, 
  SendOutlined, 
  UserOutlined, 
  TeamOutlined,
  PlusOutlined,
  MessageOutlined,
  SearchOutlined,
  MoreOutlined,
  FileOutlined,
  PaperClipOutlined,
  SmileOutlined,
  DownloadOutlined,
  FilterOutlined,
  InboxOutlined,
  SettingOutlined,
  EllipsisOutlined
} from '@ant-design/icons';
import { format } from 'date-fns';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import NewConversationModal from './components/NewConversationModal';
import MessageTemplateModal from './components/MessageTemplateModal';
import MessageAttachmentModal from './components/MessageAttachmentModal';
import ConversationList from './components/ConversationList';
import MessageView from './components/MessageView';
import { 
  useConversations, 
  useMessages, 
  useSendMessage, 
  useMarkAsRead,
  useArchiveConversation,
  useUnarchiveConversation,
  useDraft,
  useSaveDraft,
  useMessageSubscription,
  useConversationSubscription
} from '../../apis/messaging/hooks';
import { isEncryptionAvailable } from '../../utils/encryption';

const { Content } = Layout;
const { Title } = Typography;
const { TabPane } = Tabs;

const MessagingPage = () => {
  const { user } = useAuth();
  const [selectedConversationId, setSelectedConversationId] = useState(null);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isTemplateModalVisible, setIsTemplateModalVisible] = useState(false);
  const [isAttachmentModalVisible, setIsAttachmentModalVisible] = useState(false);
  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState(null);
  const [includeArchived, setIncludeArchived] = useState(false);
  const [attachments, setAttachments] = useState([]);
  const [encryptMessages, setEncryptMessages] = useState(false);
  const [showFilterOptions, setShowFilterOptions] = useState(false);
  const messagesEndRef = useRef(null);
  
  // Fetch conversations
  const { 
    data: conversations = [], 
    isLoading: isLoadingConversations,
    refetch: refetchConversations
  } = useConversations({
    includeArchived,
    category: categoryFilter,
    searchTerm: searchTerm.length > 2 ? searchTerm : null
  });
  
  // Fetch messages for selected conversation
  const { 
    data: messages = [], 
    isLoading: isLoadingMessages,
    refetch: refetchMessages
  } = useMessages(selectedConversationId);
  
  // Fetch draft for selected conversation
  const { data: draft } = useDraft(selectedConversationId);
  
  // Mutations
  const sendMessage = useSendMessage(selectedConversationId);
  const markAsRead = useMarkAsRead();
  const archiveConversation = useArchiveConversation();
  const unarchiveConversation = useUnarchiveConversation();
  const saveDraft = useSaveDraft();
  
  // Subscribe to new messages
  useMessageSubscription(selectedConversationId, (newMessage) => {
    // Auto-scroll to bottom when new message arrives
    scrollToBottom();
    
    // Play notification sound if message is from someone else
    if (newMessage.sender_id !== user?.id) {
      playNotificationSound();
    }
  });
  
  // Subscribe to conversation updates
  useConversationSubscription();
  
  // Effect to mark conversation as read when selected
  useEffect(() => {
    if (selectedConversationId) {
      markAsRead.mutate(selectedConversationId);
    }
  }, [selectedConversationId]);
  
  // Effect to load draft when conversation changes
  useEffect(() => {
    if (draft?.content) {
      setMessageText(draft.content);
    } else {
      setMessageText('');
    }
  }, [draft]);
  
  // Effect to auto-save draft when typing
  useEffect(() => {
    const draftTimer = setTimeout(() => {
      if (messageText && selectedConversationId) {
        saveDraft.mutate({
          conversationId: selectedConversationId,
          content: messageText
        });
      }
    }, 1000);
    
    return () => clearTimeout(draftTimer);
  }, [messageText, selectedConversationId]);
  
  // Effect to scroll to bottom when messages change
  useEffect(() => {
    scrollToBottom();
  }, [messages]);
  
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };
  
  const playNotificationSound = () => {
    // Play a notification sound
    const audio = new Audio('/notification.mp3');
    audio.play().catch(e => console.log('Error playing notification sound:', e));
  };

  const handleSelectConversation = (id) => {
    setSelectedConversationId(id);
    setAttachments([]);
  };

  const showNewConversationModal = () => {
    setIsModalVisible(true);
  };

  const handleModalClose = () => {
    setIsModalVisible(false);
  };

  const handleMessageSent = () => {
    refetchConversations();
    if (selectedConversationId) {
      refetchMessages();
    }
  };
  
  const handleSendMessage = () => {
    if (!selectedConversationId) {
      toast.error('Please select a conversation first');
      return;
    }
    
    if (!messageText.trim() && attachments.length === 0) {
      toast.error('Please enter a message or add an attachment');
      return;
    }
    
    sendMessage.mutate({
      content: messageText.trim(),
      encrypt: encryptMessages,
      attachments,
      mentions: [] // TODO: Implement @mentions
    }, {
      onSuccess: () => {
        setMessageText('');
        setAttachments([]);
      }
    });
  };
  
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey && selectedConversationId) {
      e.preventDefault();
      handleSendMessage();
    }
  };
  
  const handleArchiveConversation = () => {
    if (!selectedConversationId) return;
    
    const conversation = conversations.find(c => c.id === selectedConversationId);
    if (conversation?.is_archived) {
      unarchiveConversation.mutate(selectedConversationId, {
        onSuccess: () => {
          toast.success('Conversation restored');
        }
      });
    } else {
      archiveConversation.mutate(selectedConversationId, {
        onSuccess: () => {
          toast.success('Conversation archived');
        }
      });
    }
  };
  
  const handleTemplateSelect = (templateContent) => {
    setMessageText(templateContent);
    setIsTemplateModalVisible(false);
  };
  
  const handleAttachmentSelect = (selectedAttachments) => {
    setAttachments([...attachments, ...selectedAttachments]);
    setIsAttachmentModalVisible(false);
  };

  const renderConversationHeader = () => {
    if (!selectedConversationId || isLoadingConversations) return null;
    
    const conversation = conversations.find(c => c.id === selectedConversationId);
    if (!conversation) return null;
    
    // Find the other participant (not the current user)
    const otherParticipant = conversation.participants?.find(p => p.user_id !== user?.id);
    
    return (
      <div className="p-4 border-b border-gray-200 bg-white shadow-sm flex justify-between items-center">
        <div className="flex items-center">
          <Avatar 
            icon={otherParticipant?.participant_type === 'provider' ? <TeamOutlined /> : <UserOutlined />} 
            className={otherParticipant?.participant_type === 'provider' ? "bg-blue-500" : "bg-green-500"}
            size="large"
          />
          <div className="ml-3">
            <div className="font-semibold text-gray-800 text-base">
              {otherParticipant?.name || conversation.title || 'Conversation'}
            </div>
            <div className="text-xs text-gray-500 flex items-center">
              <Badge status={conversation.is_archived ? "default" : "success"} />
              <span className="ml-1">
                {conversation.is_archived ? 'Archived' : 'Active'}
                {conversation.category ? ` • ${conversation.category}` : ''}
              </span>
            </div>
          </div>
        </div>
        
        <div className="flex items-center">
          <Dropdown
            overlay={
              <Menu>
                <Menu.Item key="archive" icon={conversation.is_archived ? <InboxOutlined /> : <InboxOutlined />} onClick={handleArchiveConversation}>
                  {conversation.is_archived ? 'Restore Conversation' : 'Archive Conversation'}
                </Menu.Item>
                <Menu.Item key="export" icon={<DownloadOutlined />}>
                  Export Conversation
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item key="delete" danger>
                  Delete Conversation
                </Menu.Item>
              </Menu>
            }
            trigger={['click']}
            placement="bottomRight"
          >
            <Button type="text" icon={<EllipsisOutlined />} />
          </Dropdown>
        </div>
      </div>
    );
  };

  // Compose button content for the message input toolbar
  const composeButtonContent = (
    <div className="p-2">
      <div className="mb-2 font-medium">Add to message</div>
      <div className="grid grid-cols-3 gap-2">
        <Button 
          className="flex flex-col items-center justify-center h-16"
          onClick={() => setIsAttachmentModalVisible(true)}
        >
          <PaperClipOutlined className="text-lg mb-1" />
          <span className="text-xs">Attachment</span>
        </Button>
        <Button 
          className="flex flex-col items-center justify-center h-16"
          onClick={() => setIsTemplateModalVisible(true)}
        >
          <FileOutlined className="text-lg mb-1" />
          <span className="text-xs">Template</span>
        </Button>
        <Button 
          className="flex flex-col items-center justify-center h-16"
          onClick={() => toast.info('Emoji picker coming soon')}
        >
          <SmileOutlined className="text-lg mb-1" />
          <span className="text-xs">Emoji</span>
        </Button>
      </div>
    </div>
  );

  // Filter options content
  const filterOptionsContent = (
    <div className="p-2 w-64">
      <div className="mb-2 font-medium">Filter Conversations</div>
      <div className="mb-3">
        <div className="text-xs text-gray-500 mb-1">Category</div>
        <div className="grid grid-cols-2 gap-2">
          <Button 
            size="small" 
            type={categoryFilter === 'clinical' ? 'primary' : 'default'}
            onClick={() => setCategoryFilter(categoryFilter === 'clinical' ? null : 'clinical')}
            className="text-xs"
          >
            Clinical
          </Button>
          <Button 
            size="small" 
            type={categoryFilter === 'billing' ? 'primary' : 'default'}
            onClick={() => setCategoryFilter(categoryFilter === 'billing' ? null : 'billing')}
            className="text-xs"
          >
            Billing
          </Button>
          <Button 
            size="small" 
            type={categoryFilter === 'general' ? 'primary' : 'default'}
            onClick={() => setCategoryFilter(categoryFilter === 'general' ? null : 'general')}
            className="text-xs"
          >
            General
          </Button>
          <Button 
            size="small" 
            type={categoryFilter === 'support' ? 'primary' : 'default'}
            onClick={() => setCategoryFilter(categoryFilter === 'support' ? null : 'support')}
            className="text-xs"
          >
            Support
          </Button>
        </div>
      </div>
      <Button 
        size="small" 
        type="default" 
        onClick={() => setCategoryFilter(null)}
        block
      >
        Clear Filters
      </Button>
    </div>
  );

  return (
    <Layout className="min-h-screen bg-gray-50">
      <Content className="p-4 md:p-6">
        <div className="flex justify-between items-center mb-4">
          <Title level={3} className="mb-0 text-gray-800">
            Messages
          </Title>
          <Button 
            type="default"
            icon={<QuestionCircleOutlined />}
            onClick={() => toast.info('Help feature coming soon')}
            className="border-indigo-500 text-indigo-600 hover:text-indigo-700 hover:border-indigo-700"
          >
            Help
          </Button>
        </div>
        
        <div className="flex border border-gray-200 rounded-lg overflow-hidden shadow-sm h-[calc(100vh-14rem)]">
          {/* Left Pane: Conversation List - Adjusted to 2/5 width */}
          <div className="w-2/5 border-r border-gray-200 flex flex-col bg-gray-50">
            <div className="p-4 border-b border-gray-200 bg-white shadow-sm">
              <Button
                type="primary"
                icon={<PlusOutlined />}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
                onClick={showNewConversationModal}
              >
                New Message
              </Button>
              
              <div className="mt-3 flex items-center">
                <Input 
                  prefix={<SearchOutlined className="text-gray-400" />}
                  placeholder="Search messages..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="mr-2"
                />
                <Popover
                  content={filterOptionsContent}
                  title={null}
                  trigger="click"
                  visible={showFilterOptions}
                  onVisibleChange={setShowFilterOptions}
                  placement="bottomRight"
                >
                  <Button 
                    icon={<FilterOutlined />} 
                    type={categoryFilter ? "primary" : "default"}
                  />
                </Popover>
              </div>
            </div>
            
            <Tabs defaultActiveKey="active" className="px-2 pt-2" onChange={(key) => setIncludeArchived(key === 'archived')}>
              <TabPane tab="Active" key="active" />
              <TabPane tab="Archived" key="archived" />
            </Tabs>
            
            <div className="overflow-y-auto flex-grow">
              {isLoadingConversations ? (
                <div className="flex justify-center items-center h-full">
                  <Spin />
                </div>
              ) : conversations.length === 0 ? (
                <Empty 
                  description={
                    <span>
                      {searchTerm 
                        ? 'No conversations match your search' 
                        : includeArchived 
                          ? 'No archived conversations' 
                          : 'No active conversations'}
                    </span>
                  }
                  className="mt-8"
                />
              ) : (
                <ConversationList 
                  conversations={conversations}
                  selectedId={selectedConversationId}
                  onSelectConversation={handleSelectConversation}
                  currentUserId={user?.id}
                />
              )}
            </div>
          </div>
          
          {/* Right Pane: Message View - Adjusted to 3/5 width */}
          <div className="w-3/5 flex flex-col bg-white">
            {selectedConversationId ? (
              <>
                {/* Chat Header */}
                {renderConversationHeader()}
                
                {/* Messages Area */}
                {isLoadingMessages ? (
                  <div className="flex-grow flex justify-center items-center">
                    <Spin />
                  </div>
                ) : (
                  <MessageView 
                    messages={messages}
                    currentUserId={user?.id}
                    messagesEndRef={messagesEndRef}
                  />
                )}
                
                {/* Input Area - Simplified */}
                <div className="p-4 border-t border-gray-200 bg-white">
                  {attachments.length > 0 && (
                    <div className="mb-2 flex flex-wrap gap-2">
                      {attachments.map((attachment, index) => (
                        <Badge 
                          key={index}
                          count="×"
                          onClick={() => setAttachments(attachments.filter((_, i) => i !== index))}
                        >
                          <div className="bg-gray-100 px-2 py-1 rounded text-xs flex items-center">
                            <FileOutlined className="mr-1" />
                            {attachment.fileName}
                          </div>
                        </Badge>
                      ))}
                    </div>
                  )}
                  
                  <div className="flex">
                    <Popover
                      content={composeButtonContent}
                      title={null}
                      trigger="click"
                      placement="topLeft"
                    >
                      <Button
                        type="default"
                        icon={<PlusOutlined />}
                        className="rounded-r-none border-r-0"
                      />
                    </Popover>
                    <Input.TextArea
                      className="flex-grow border border-gray-300 rounded-none p-2 text-sm focus:border-indigo-500 focus:outline-none"
                      rows={2}
                      placeholder="Type your message..."
                      autoSize={{ minRows: 1, maxRows: 4 }}
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      onKeyPress={handleKeyPress}
                    />
                    <Dropdown
                      overlay={
                        <Menu>
                          {isEncryptionAvailable() && (
                            <Menu.Item 
                              key="encrypt" 
                              onClick={() => setEncryptMessages(!encryptMessages)}
                              icon={encryptMessages ? <SettingOutlined className="text-green-500" /> : <SettingOutlined />}
                            >
                              {encryptMessages ? "Encryption Enabled" : "Enable Encryption"}
                            </Menu.Item>
                          )}
                        </Menu>
                      }
                      trigger={['click']}
                      placement="topRight"
                    >
                      <Button
                        type="default"
                        icon={<SettingOutlined />}
                        className="rounded-l-none border-l-0 border-r-0"
                      />
                    </Dropdown>
                    <Button
                      type="primary"
                      icon={<SendOutlined />}
                      className="bg-indigo-600 hover:bg-indigo-700 rounded-l-none"
                      onClick={handleSendMessage}
                      loading={sendMessage.isLoading}
                      disabled={!selectedConversationId}
                    >
                      Send
                    </Button>
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-grow flex flex-col items-center justify-center text-gray-500 bg-gray-50">
                <Avatar size={64} icon={<MessageOutlined />} className="bg-gray-200 text-gray-400 mb-4" />
                <p className="text-lg mb-2">No conversation selected</p>
                <p className="text-sm text-gray-400 mb-4">Select a conversation from the list or start a new one</p>
                <Button 
                  type="primary" 
                  className="bg-indigo-600 hover:bg-indigo-700"
                  onClick={showNewConversationModal}
                  icon={<PlusOutlined />}
                >
                  Start a new conversation
                </Button>
              </div>
            )}
          </div>
        </div>
      </Content>
      
      {/* Modals */}
      <NewConversationModal
        visible={isModalVisible}
        onClose={handleModalClose}
        onSubmitSuccess={handleMessageSent}
      />
      
      <MessageTemplateModal
        visible={isTemplateModalVisible}
        onClose={() => setIsTemplateModalVisible(false)}
        onSelect={handleTemplateSelect}
      />
      
      <MessageAttachmentModal
        visible={isAttachmentModalVisible}
        onClose={() => setIsAttachmentModalVisible(false)}
        onSelect={handleAttachmentSelect}
      />
    </Layout>
  );
};

export default MessagingPage;
