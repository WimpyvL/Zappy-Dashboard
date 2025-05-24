-- Create carts table for storing user cart data
create table public.carts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  items jsonb not null default '[]'::jsonb,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Add RLS policies for carts
alter table public.carts enable row level security;

-- Users can only view their own cart
create policy "Users can view their own cart" on public.carts
  for select using (auth.uid() = user_id);

-- Users can insert their own cart
create policy "Users can insert their own cart" on public.carts
  for insert with check (auth.uid() = user_id);

-- Users can update their own cart
create policy "Users can update their own cart" on public.carts
  for update using (auth.uid() = user_id);

-- Users can delete their own cart
create policy "Users can delete their own cart" on public.carts
  for delete using (auth.uid() = user_id);

-- Create index on user_id for faster lookups
create index carts_user_id_idx on public.carts(user_id);

-- Add updated_at trigger
create trigger handle_updated_at before update on public.carts
  for each row execute procedure moddatetime('updated_at');