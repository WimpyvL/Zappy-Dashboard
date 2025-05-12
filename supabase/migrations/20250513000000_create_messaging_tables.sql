-- Create messaging tables for the application
-- This migration adds support for conversations, participants, and messages

-- Create conversations table
CREATE TABLE IF NOT EXISTS public.conversations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  title TEXT,
  category TEXT CHECK (category IN ('clinical', 'billing', 'general', 'support')),
  is_archived BOOLEAN DEFAULT FALSE NOT NULL
);

-- Create conversation_participants table
CREATE TABLE IF NOT EXISTS public.conversation_participants (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  participant_type TEXT NOT NULL CHECK (participant_type IN ('patient', 'provider', 'admin')),
  is_read BOOLEAN DEFAULT FALSE NOT NULL,
  last_read_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create messages table
CREATE TABLE IF NOT EXISTS public.messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  sender_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  sender_type TEXT NOT NULL CHECK (sender_type IN ('patient', 'provider', 'admin')),
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  is_system_message BOOLEAN DEFAULT FALSE NOT NULL,
  attachment_url TEXT,
  attachment_type TEXT,
  is_encrypted BOOLEAN DEFAULT FALSE NOT NULL
);

-- Create message_templates table for common responses
CREATE TABLE IF NOT EXISTS public.message_templates (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT NOT NULL,
  category TEXT CHECK (category IN ('clinical', 'billing', 'general', 'support')),
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  is_global BOOLEAN DEFAULT FALSE NOT NULL
);

-- Create message_attachments table
CREATE TABLE IF NOT EXISTS public.message_attachments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE NOT NULL,
  file_name TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create message_mentions table for @mentions
CREATE TABLE IF NOT EXISTS public.message_mentions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_id UUID REFERENCES public.messages(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create message_drafts table
CREATE TABLE IF NOT EXISTS public.message_drafts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create message_analytics table
CREATE TABLE IF NOT EXISTS public.message_analytics (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  conversation_id UUID REFERENCES public.conversations(id) ON DELETE CASCADE NOT NULL,
  first_response_time INTEGER, -- Time in seconds
  resolution_time INTEGER, -- Time in seconds
  message_count INTEGER DEFAULT 0 NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_conversation_participants_conversation_id ON public.conversation_participants(conversation_id);
CREATE INDEX IF NOT EXISTS idx_conversation_participants_user_id ON public.conversation_participants(user_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON public.messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_messages_sender_id ON public.messages(sender_id);
CREATE INDEX IF NOT EXISTS idx_message_mentions_message_id ON public.message_mentions(message_id);
CREATE INDEX IF NOT EXISTS idx_message_mentions_user_id ON public.message_mentions(user_id);
CREATE INDEX IF NOT EXISTS idx_message_drafts_conversation_id ON public.message_drafts(conversation_id);
CREATE INDEX IF NOT EXISTS idx_message_drafts_user_id ON public.message_drafts(user_id);

-- Add updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at columns
CREATE TRIGGER update_conversations_updated_at
BEFORE UPDATE ON public.conversations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_message_templates_updated_at
BEFORE UPDATE ON public.message_templates
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_message_drafts_updated_at
BEFORE UPDATE ON public.message_drafts
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_message_analytics_updated_at
BEFORE UPDATE ON public.message_analytics
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Enable Row Level Security
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversation_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_mentions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_drafts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.message_analytics ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for conversations
CREATE POLICY "Users can view conversations they are participants in"
ON public.conversations
FOR SELECT
USING (
  id IN (
    SELECT conversation_id 
    FROM public.conversation_participants 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Providers and admins can create conversations"
ON public.conversations
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND (role = 'provider' OR role = 'admin')
  )
);

CREATE POLICY "Users can update conversations they are participants in"
ON public.conversations
FOR UPDATE
USING (
  id IN (
    SELECT conversation_id 
    FROM public.conversation_participants 
    WHERE user_id = auth.uid()
  )
);

-- Create RLS policies for conversation_participants
CREATE POLICY "Users can view conversation participants for their conversations"
ON public.conversation_participants
FOR SELECT
USING (
  conversation_id IN (
    SELECT conversation_id 
    FROM public.conversation_participants 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Providers and admins can add participants"
ON public.conversation_participants
FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND (role = 'provider' OR role = 'admin')
  )
);

CREATE POLICY "Users can update their own participant status"
ON public.conversation_participants
FOR UPDATE
USING (
  user_id = auth.uid()
);

-- Create RLS policies for messages
CREATE POLICY "Users can view messages in conversations they are participants in"
ON public.messages
FOR SELECT
USING (
  conversation_id IN (
    SELECT conversation_id 
    FROM public.conversation_participants 
    WHERE user_id = auth.uid()
  )
);

CREATE POLICY "Users can send messages in conversations they are participants in"
ON public.messages
FOR INSERT
WITH CHECK (
  conversation_id IN (
    SELECT conversation_id 
    FROM public.conversation_participants 
    WHERE user_id = auth.uid()
  )
);

-- Create RLS policies for message_templates
CREATE POLICY "All users can view global message templates"
ON public.message_templates
FOR SELECT
USING (
  is_global = true
);

CREATE POLICY "Users can view their own message templates"
ON public.message_templates
FOR SELECT
USING (
  created_by = auth.uid()
);

CREATE POLICY "Users can create their own message templates"
ON public.message_templates
FOR INSERT
WITH CHECK (
  created_by = auth.uid()
);

CREATE POLICY "Users can update their own message templates"
ON public.message_templates
FOR UPDATE
USING (
  created_by = auth.uid()
);

CREATE POLICY "Users can delete their own message templates"
ON public.message_templates
FOR DELETE
USING (
  created_by = auth.uid()
);

-- Create RLS policies for message_attachments
CREATE POLICY "Users can view attachments in conversations they are participants in"
ON public.message_attachments
FOR SELECT
USING (
  message_id IN (
    SELECT id FROM public.messages
    WHERE conversation_id IN (
      SELECT conversation_id 
      FROM public.conversation_participants 
      WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can add attachments to messages they send"
ON public.message_attachments
FOR INSERT
WITH CHECK (
  message_id IN (
    SELECT id FROM public.messages
    WHERE sender_id = auth.uid()
  )
);

-- Create RLS policies for message_mentions
CREATE POLICY "Users can view mentions in conversations they are participants in"
ON public.message_mentions
FOR SELECT
USING (
  message_id IN (
    SELECT id FROM public.messages
    WHERE conversation_id IN (
      SELECT conversation_id 
      FROM public.conversation_participants 
      WHERE user_id = auth.uid()
    )
  )
);

CREATE POLICY "Users can create mentions in messages they send"
ON public.message_mentions
FOR INSERT
WITH CHECK (
  message_id IN (
    SELECT id FROM public.messages
    WHERE sender_id = auth.uid()
  )
);

-- Create RLS policies for message_drafts
CREATE POLICY "Users can view their own drafts"
ON public.message_drafts
FOR SELECT
USING (
  user_id = auth.uid()
);

CREATE POLICY "Users can create their own drafts"
ON public.message_drafts
FOR INSERT
WITH CHECK (
  user_id = auth.uid()
);

CREATE POLICY "Users can update their own drafts"
ON public.message_drafts
FOR UPDATE
USING (
  user_id = auth.uid()
);

CREATE POLICY "Users can delete their own drafts"
ON public.message_drafts
FOR DELETE
USING (
  user_id = auth.uid()
);

-- Create RLS policies for message_analytics
CREATE POLICY "Providers and admins can view message analytics"
ON public.message_analytics
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.users 
    WHERE id = auth.uid() 
    AND (role = 'provider' OR role = 'admin')
  )
);

-- Add comments for documentation
COMMENT ON TABLE public.conversations IS 'Stores messaging conversations between users';
COMMENT ON TABLE public.conversation_participants IS 'Links users to conversations they are part of';
COMMENT ON TABLE public.messages IS 'Individual messages within conversations';
COMMENT ON TABLE public.message_templates IS 'Reusable message templates for common responses';
COMMENT ON TABLE public.message_attachments IS 'Files attached to messages';
COMMENT ON TABLE public.message_mentions IS 'User mentions within messages';
COMMENT ON TABLE public.message_drafts IS 'Saved message drafts';
COMMENT ON TABLE public.message_analytics IS 'Analytics data for conversations';
