# Supabase RLS Policy Setup Guide

## Required Policies for Zappy Dashboard

1. **Tasks Table**:
   ```sql
   CREATE POLICY "Allow anon select on tasks" 
   ON public.tasks
   FOR SELECT
   TO anon
   USING (true);
   ```

2. **Tags Table**:
   ```sql
   CREATE POLICY "Allow anon select on tags" 
   ON public.tags
   FOR SELECT
   TO anon
   USING (true);
   ```

3. **Patients Table**:
   ```sql
   CREATE POLICY "Allow anon select on patients" 
   ON public.patients
   FOR SELECT
   TO anon
   USING (true);
   ```

## Setup Instructions

1. Open Supabase Dashboard → Database → Tables
2. For each table (tasks, tags, patients, etc.):
   - Click "Policies" tab
   - Click "New Policy"
   - Use the SQL templates above
   - Name: "Allow anon select"
   - Action: SELECT
   - Role: anon
   - Definition: TRUE
   - Click "Save"

## Verification

After setting up policies:
1. Restart your React dev server
2. Check network requests in browser dev tools
3. Verify you get 200 OK responses from Supabase
4. Confirm data loads without 403 errors