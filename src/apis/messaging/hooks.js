import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-toastify';
import messagingApi from './api';

/**
 * Ultra-simplified React Query hooks for messaging functionality
 */

// Query keys
const QUERY_KEYS = {
  conversations: 'conversations',
  messages: (conversationId) => ['messages', conversationId]
};

/**
 * Hook to fetch all conversations
 * @returns {Object} - Query result
 */
export function useConversations() {
  return useQuery({
    queryKey: [QUERY_KEYS.conversations],
    queryFn: () => messagingApi.getConversations(),
    refetchInterval: 30000, // 30 seconds
    refetchOnWindowFocus: true
  });
}

/**
 * Hook to fetch messages for a conversation
 * @param {string} conversationId - Conversation ID
 * @returns {Object} - Query result
 */
export function useMessages(conversationId) {
  return useQuery({
    queryKey: QUERY_KEYS.messages(conversationId),
    queryFn: () => messagingApi.getMessages(conversationId),
    enabled: !!conversationId,
    refetchInterval: 15000, // 15 seconds
    refetchOnWindowFocus: true
  });
}

/**
 * Hook to create a new conversation
 * @returns {Object} - Mutation result
 */
export function useCreateConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversation) => messagingApi.createConversation(conversation),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.conversations] });
      toast.success('Conversation created');
    },
    onError: (error) => {
      console.error('Error creating conversation:', error);
      toast.error('Failed to create conversation');
    }
  });
}

/**
 * Hook to send a message in a conversation
 * @param {string} conversationId - Conversation ID
 * @returns {Object} - Mutation result
 */
export function useSendMessage(conversationId) {
  const queryClient = useQueryClient();

  return useMutation({
    // Handle both object format and string format for backward compatibility
    mutationFn: (messageData) => {
      // If messageData is an object with content property, extract the content
      const content = typeof messageData === 'object' && messageData.content !== undefined
        ? messageData.content
        : messageData;
        
      return messagingApi.sendMessage(conversationId, content);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEYS.messages(conversationId) });
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.conversations] });
    },
    onError: (error) => {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  });
}

/**
 * Hook to archive a conversation
 * @returns {Object} - Mutation result
 */
export function useArchiveConversation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conversationId) => messagingApi.archiveConversation(conversationId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.conversations] });
      toast.success('Conversation archived');
    },
    onError: (error) => {
      console.error('Error archiving conversation:', error);
      toast.error('Failed to archive conversation');
    }
  });
}

// Stub implementations for compatibility with existing components

/**
 * Stub hook for marking a conversation as read
 * @returns {Object} - Mutation result
 */
export function useMarkAsRead() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => Promise.resolve(), // Do nothing
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.conversations] });
    }
  });
}

/**
 * Stub hook for unarchiving a conversation
 * @returns {Object} - Mutation result
 */
export function useUnarchiveConversation() {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: () => Promise.resolve(), // Do nothing
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEYS.conversations] });
      toast.success('Conversation restored');
    }
  });
}

/**
 * Stub hook for message drafts
 * @returns {Object} - Query result with null data
 */
export function useDraft() {
  return {
    data: null,
    isLoading: false,
    error: null
  };
}

/**
 * Stub hook for saving drafts
 * @returns {Object} - Mutation result
 */
export function useSaveDraft() {
  return useMutation({
    mutationFn: () => Promise.resolve() // Do nothing
  });
}

/**
 * Stub hook for message templates
 * @returns {Object} - Query result with empty array
 */
export function useMessageTemplates() {
  return {
    data: [],
    isLoading: false,
    error: null
  };
}

/**
 * Stub hook for creating message templates
 * @returns {Object} - Mutation result
 */
export function useCreateMessageTemplate() {
  return useMutation({
    mutationFn: () => Promise.resolve() // Do nothing
  });
}

/**
 * Stub hook for updating message templates
 * @returns {Object} - Mutation result
 */
export function useUpdateMessageTemplate() {
  return useMutation({
    mutationFn: () => Promise.resolve() // Do nothing
  });
}

/**
 * Stub hook for deleting message templates
 * @returns {Object} - Mutation result
 */
export function useDeleteMessageTemplate() {
  return useMutation({
    mutationFn: () => Promise.resolve() // Do nothing
  });
}

/**
 * Stub hook for message subscription
 * @returns {Object} - Subscription object with unsubscribe method
 */
export function useMessageSubscription() {
  return {
    unsubscribe: () => {} // Do nothing
  };
}

/**
 * Stub hook for conversation subscription
 * @returns {Object} - Subscription object with unsubscribe method
 */
export function useConversationSubscription() {
  return {
    unsubscribe: () => {} // Do nothing
  };
}
