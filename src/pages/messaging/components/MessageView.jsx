import React from 'react';
import PropTypes from 'prop-types';
import { Avatar, Tooltip, Typography, Spin } from 'antd';
import { UserOutlined, TeamOutlined, PaperClipOutlined, DownloadOutlined, LockOutlined, InfoCircleOutlined } from '@ant-design/icons';
import { format } from 'date-fns';

const { Text } = Typography;

/**
 * MessageView component
 * 
 * Displays messages in a conversation
 * 
 * @param {Array} messages - Array of message objects
 * @param {string} currentUserId - ID of the current user
 * @param {Object} messagesEndRef - React ref for scrolling to the bottom
 */
const MessageView = ({ messages, currentUserId, messagesEndRef }) => {
  // Helper function to format the timestamp
  const formatTimestamp = (timestamp) => {
    if (!timestamp) return '';
    
    const date = new Date(timestamp);
    return format(date, 'h:mm a');
  };
  
  // Helper function to determine if a message is from the current user
  const isCurrentUser = (message) => {
    return message.sender_id === currentUserId;
  };
  
  // Helper function to determine the sender type (patient, provider, admin)
  const getSenderType = (message) => {
    return message.sender_type || 'unknown';
  };
  
  // Helper function to group messages by date
  const groupMessagesByDate = (messages) => {
    const groups = {};
    
    messages.forEach(message => {
      if (!message.created_at) return;
      
      const date = new Date(message.created_at);
      const dateKey = format(date, 'yyyy-MM-dd');
      
      if (!groups[dateKey]) {
        groups[dateKey] = {
          date,
          messages: []
        };
      }
      
      groups[dateKey].messages.push(message);
    });
    
    return Object.values(groups);
  };
  
  // Group messages by date
  const messageGroups = groupMessagesByDate(messages);

  return (
    <div className="flex-grow overflow-y-auto p-4 space-y-4 bg-gray-50">
      {messageGroups.map((group, groupIndex) => (
        <div key={groupIndex} className="space-y-3">
          <div className="flex justify-center my-2">
            <div className="bg-gray-200 text-gray-600 text-xs px-3 py-1 rounded-full shadow-sm">
              {format(group.date, 'EEEE, MMMM d, yyyy')}
            </div>
          </div>
          
          {group.messages.map((message) => {
            const fromCurrentUser = isCurrentUser(message);
            const senderType = getSenderType(message);
            const hasAttachments = message.message_attachments && message.message_attachments.length > 0;
            
            return (
              <div
                key={message.id}
                className={`flex ${fromCurrentUser ? 'justify-end' : 'justify-start'} mb-2`}
              >
                {!fromCurrentUser && (
                  <Avatar 
                    size="small"
                    icon={senderType === 'provider' ? <TeamOutlined /> : <UserOutlined />} 
                    className={`mr-2 mt-1 ${senderType === 'provider' ? 'bg-blue-500' : 'bg-green-500'}`}
                  />
                )}
                
                <div
                  className={`p-3 rounded-lg max-w-[75%] shadow-sm ${
                    fromCurrentUser 
                      ? 'bg-indigo-500 text-white rounded-tr-none' 
                      : 'bg-white border border-gray-200 rounded-tl-none'
                  }`}
                >
                  {message.is_system_message && (
                    <div className="mb-1 flex items-center">
                      <InfoCircleOutlined className={fromCurrentUser ? 'text-indigo-200' : 'text-gray-400'} />
                      <span className={`ml-1 text-xs ${fromCurrentUser ? 'text-indigo-200' : 'text-gray-500'}`}>
                        System Message
                      </span>
                    </div>
                  )}
                  
                  {message.is_encrypted && (
                    <div className="mb-1 flex items-center">
                      <LockOutlined className={fromCurrentUser ? 'text-indigo-200' : 'text-gray-400'} />
                      <span className={`ml-1 text-xs ${fromCurrentUser ? 'text-indigo-200' : 'text-gray-500'}`}>
                        Encrypted
                      </span>
                    </div>
                  )}
                  
                  <Text className={`text-sm whitespace-pre-wrap ${fromCurrentUser ? 'text-white' : 'text-gray-800'}`}>
                    {message.content}
                  </Text>
                  
                  {hasAttachments && (
                    <div className={`mt-2 pt-2 ${fromCurrentUser ? 'border-t border-indigo-400' : 'border-t border-gray-200'}`}>
                      {message.message_attachments.map((attachment, index) => (
                        <div 
                          key={index} 
                          className={`flex items-center text-xs ${fromCurrentUser ? 'text-indigo-100' : 'text-gray-600'} mb-1`}
                        >
                          <PaperClipOutlined className="mr-1" />
                          <span className="flex-grow truncate">{attachment.file_name}</span>
                          <Tooltip title="Download">
                            <DownloadOutlined 
                              className={`ml-2 cursor-pointer ${fromCurrentUser ? 'text-indigo-100 hover:text-white' : 'text-gray-500 hover:text-gray-700'}`} 
                            />
                          </Tooltip>
                        </div>
                      ))}
                    </div>
                  )}
                  
                  <div className={`text-xs mt-1 text-right ${fromCurrentUser ? 'text-indigo-100' : 'text-gray-500'}`}>
                    {formatTimestamp(message.created_at)}
                  </div>
                </div>
                
                {fromCurrentUser && (
                  <Avatar 
                    size="small"
                    icon={<TeamOutlined />} 
                    className="ml-2 mt-1 bg-blue-500"
                  />
                )}
              </div>
            );
          })}
        </div>
      ))}
      
      {/* Empty state */}
      {messages.length === 0 && (
        <div className="flex justify-center items-center h-full">
          <div className="text-center">
            <Spin className="mb-4" />
            <p className="text-gray-500">No messages yet</p>
          </div>
        </div>
      )}
      
      {/* Div for scrolling to the bottom */}
      <div ref={messagesEndRef} />
    </div>
  );
};

MessageView.propTypes = {
  messages: PropTypes.array.isRequired,
  currentUserId: PropTypes.string,
  messagesEndRef: PropTypes.object
};

export default MessageView;
