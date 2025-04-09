-- Create the notifications table
CREATE TABLE public.notifications (
    id bigint PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
    user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE, -- Link to the user who should see the notification
    message text NOT NULL,                                   -- The notification content
    is_read boolean DEFAULT false NOT NULL,                  -- Read status, defaults to unread
    created_at timestamptz DEFAULT now() NOT NULL,           -- Timestamp of creation
    link_url text                                            -- Optional URL for navigation on click
);

-- Add comments to clarify column purposes
COMMENT ON COLUMN public.notifications.user_id IS 'The user who should receive this notification.';
COMMENT ON COLUMN public.notifications.message IS 'The content/text of the notification.';
COMMENT ON COLUMN public.notifications.is_read IS 'Indicates whether the user has marked the notification as read.';
COMMENT ON COLUMN public.notifications.created_at IS 'Timestamp when the notification was generated.';
COMMENT ON COLUMN public.notifications.link_url IS 'Optional URL to navigate to when the notification is clicked.';

-- Optional: Add indexes for performance, especially on user_id and is_read
CREATE INDEX idx_notifications_user_id_is_read ON public.notifications(user_id, is_read);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

-- Enable Row Level Security (RLS) for the table
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
-- Policy: Allow users to select their own notifications
CREATE POLICY "Allow users to select their own notifications"
ON public.notifications
FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Allow users to update the is_read status of their own notifications
CREATE POLICY "Allow users to update read status for their own notifications"
ON public.notifications
FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Note: Inserting notifications should likely be handled by backend functions or triggers
-- based on application events, rather than direct client-side inserts.
-- Therefore, an INSERT policy for users is generally not recommended here.
