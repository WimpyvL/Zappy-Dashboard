import React from 'react';
import PropTypes from 'prop-types';
import { Avatar, Badge, Tooltip } from 'antd';
import { UserOutlined, TeamOutlined, CheckCircleOutlined } from '@ant-design/icons';
import { formatDistanceToNow } from 'date-fns';

/**
 * ConversationList component
 * 
 * Displays a list of conversations with their basic information
 * 
 * @param {Array} conversations - Array of conversation objects
 * @param {string} selectedId - ID of the currently selected conversation
 * @param {Function} onSelectConversation - Function to call when a conversation is selected
 * @param {string} currentUserId - ID of the current user
 */
const ConversationList = ({ conversations, selectedId, onSelectConversation, currentUserId }) => {
  // Helper function to get the last message from a conversation
  const getLastMessage = (conversation) => {
    if (!conversation.last_message) {
      return 'No messages yet';
    }
    
    // Truncate long messages
    const maxLength = 50;
    let text = conversation.last_message.content;
    if (text.length > maxLength) {
      text = text.substring(0, maxLength) + '...';
    }
    
    return text;
  };
  
  // Helper function to get the timestamp for a conversation
  const getTimestamp = (conversation) => {
    if (!conversation.last_message?.created_at) {
      return 'New';
    }
    
    return formatDistanceToNow(new Date(conversation.last_message.created_at), { addSuffix: true });
  };
  
  // Helper function to get the other participant's name
  const getParticipantName = (conversation) => {
    // Find the other participant (not the current user)
    const otherParticipant = conversation.participants?.find(p => p.user_id !== currentUserId);
    
    if (otherParticipant?.name) {
      return otherParticipant.name;
    }
    
    return conversation.title || 'Unnamed Conversation';
  };
  
  // Helper function to determine if a conversation is unread
  const isUnread = (conversation) => {
    const userParticipant = conversation.participants?.find(p => p.user_id === currentUserId);
    return userParticipant && !userParticipant.is_read;
  };
  
  // Helper function to get the participant type (patient, provider, admin)
  const getParticipantType = (conversation) => {
    const otherParticipant = conversation.participants?.find(p => p.user_id !== currentUserId);
    return otherParticipant?.participant_type || 'unknown';
  };

  // Helper function to get category color
  const getCategoryColor = (category) => {
    switch (category) {
      case 'clinical':
        return { bg: 'bg-blue-100', text: 'text-blue-800' };
      case 'billing':
        return { bg: 'bg-yellow-100', text: 'text-yellow-800' };
      case 'support':
        return { bg: 'bg-purple-100', text: 'text-purple-800' };
      default:
        return { bg: 'bg-gray-100', text: 'text-gray-800' };
    }
  };

  return (
    <div className="conversation-list">
      {conversations.map((conversation) => {
        const isSelected = selectedId === conversation.id;
        const unread = isUnread(conversation);
        const participantType = getParticipantType(conversation);
        const categoryColors = conversation.category ? getCategoryColor(conversation.category) : null;
        
        return (
          <div
            key={conversation.id}
            className={`p-3 cursor-pointer hover:bg-gray-100 border-b border-gray-100 transition-colors ${
              isSelected ? 'bg-indigo-50 border-l-4 border-l-indigo-500' : ''
            }`}
            onClick={() => onSelectConversation(conversation.id)}
          >
            <div className="flex items-start">
              <div className="relative">
                <Badge dot={unread} color="blue" offset={[-2, 2]}>
                  <Avatar 
                    icon={participantType === 'provider' ? <TeamOutlined /> : <UserOutlined />} 
                    className={participantType === 'provider' ? "bg-blue-500" : "bg-green-500"}
                    size="large"
                  />
                </Badge>
                {conversation.is_archived && (
                  <Tooltip title="Archived">
                    <div className="absolute -bottom-1 -right-1 bg-gray-200 rounded-full p-0.5">
                      <CheckCircleOutlined className="text-xs text-gray-500" />
                    </div>
                  </Tooltip>
                )}
              </div>
              <div className="ml-3 flex-grow overflow-hidden">
                <div className="flex justify-between items-center">
                  <span className={`font-medium text-sm truncate max-w-[70%] ${unread ? 'text-gray-900 font-bold' : 'text-gray-800'}`}>
                    {getParticipantName(conversation)}
                  </span>
                  <span className="text-xs text-gray-400 whitespace-nowrap">
                    {getTimestamp(conversation)}
                  </span>
                </div>
                <div className={`text-xs truncate mt-1 ${unread ? 'text-gray-700 font-medium' : 'text-gray-500'}`}>
                  {getLastMessage(conversation)}
                </div>
                <div className="mt-1 flex items-center justify-between">
                  {conversation.category && (
                    <span className={`text-xs px-2 py-0.5 rounded-full ${categoryColors.bg} ${categoryColors.text}`}>
                      {conversation.category}
                    </span>
                  )}
                  {unread && (
                    <span className="ml-auto bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                      !
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};

ConversationList.propTypes = {
  conversations: PropTypes.array.isRequired,
  selectedId: PropTypes.string,
  onSelectConversation: PropTypes.func.isRequired,
  currentUserId: PropTypes.string
};

export default ConversationList;
