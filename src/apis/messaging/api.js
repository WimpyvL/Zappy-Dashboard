import { supabase } from '../../lib/supabase';

/**
 * Ultra-simplified Messaging API service
 * Handles only the most essential messaging functionality
 */
const messagingApi = {
  /**
   * Get all conversations for the current user
   * @returns {Promise<Array>} - Array of conversations
   */
  async getConversations() {
    // Get current user
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user.id;
    
    const { data, error } = await supabase
      .from('conversations')
      .select(`
        *,
        conversation_participants!inner(
          id,
          user_id
        )
      `)
      .eq('conversation_participants.user_id', userId)
      .eq('is_archived', false)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching conversations:', error);
      throw error;
    }

    return data;
  },

  /**
   * Get messages for a conversation
   * @param {string} conversationId - Conversation ID
   * @returns {Promise<Array>} - Array of messages
   */
  async getMessages(conversationId) {
    const { data, error } = await supabase
      .from('messages')
      .select('*')
      .eq('conversation_id', conversationId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }

    return data;
  },

  /**
   * Create a new conversation
   * @param {Object} conversation - Conversation data
   * @param {string} conversation.title - Conversation title
   * @param {Array<string>} conversation.participantIds - Array of participant user IDs
   * @param {string} conversation.initialMessage - Initial message content
   * @returns {Promise<Object>} - Created conversation
   */
  async createConversation({ title, participantIds, initialMessage }) {
    // Get current user
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user.id;
    
    // Create conversation
    const { data: conversation, error: conversationError } = await supabase
      .from('conversations')
      .insert([{ title, is_archived: false }])
      .select()
      .single();

    if (conversationError) {
      console.error('Error creating conversation:', conversationError);
      throw conversationError;
    }

    // Add participants (including current user)
    const allParticipantIds = [...new Set([...participantIds, userId])];
    const participantsToInsert = allParticipantIds.map(participantId => ({
      conversation_id: conversation.id,
      user_id: participantId
    }));

    const { error: participantsError } = await supabase
      .from('conversation_participants')
      .insert(participantsToInsert);

    if (participantsError) {
      console.error('Error adding participants:', participantsError);
      throw participantsError;
    }

    // Add initial message if provided
    if (initialMessage) {
      const { error: messageError } = await supabase
        .from('messages')
        .insert([
          {
            conversation_id: conversation.id,
            sender_id: userId,
            content: initialMessage
          }
        ]);

      if (messageError) {
        console.error('Error adding initial message:', messageError);
        throw messageError;
      }
    }

    return conversation;
  },

  /**
   * Send a message in a conversation
   * @param {string} conversationId - Conversation ID
   * @param {string} content - Message content
   * @returns {Promise<Object>} - Created message
   */
  async sendMessage(conversationId, content) {
    // Get current user
    const { data: userData } = await supabase.auth.getUser();
    const userId = userData.user.id;
    
    // Insert the message
    const { data: message, error: messageError } = await supabase
      .from('messages')
      .insert([
        {
          conversation_id: conversationId,
          sender_id: userId,
          content: content
        }
      ])
      .select()
      .single();

    if (messageError) {
      console.error('Error sending message:', messageError);
      throw messageError;
    }

    // Update conversation's updated_at timestamp
    await supabase
      .from('conversations')
      .update({ updated_at: new Date() })
      .eq('id', conversationId);

    return message;
  },

  /**
   * Archive a conversation
   * @param {string} conversationId - Conversation ID
   * @returns {Promise<void>}
   */
  async archiveConversation(conversationId) {
    const { error } = await supabase
      .from('conversations')
      .update({ is_archived: true })
      .eq('id', conversationId);

    if (error) {
      console.error('Error archiving conversation:', error);
      throw error;
    }
  }
};

export default messagingApi;
