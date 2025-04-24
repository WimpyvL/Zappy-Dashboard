# Session Hooks Implementation Plan

## Overview
This document outlines the implementation plan for converting mocked session creation hooks to real Supabase implementations.

## Single Session Creation (useCreateSession)

```mermaid
sequenceDiagram
    participant UI as UI Component
    participant Hook as useCreateSession Hook
    participant Supabase as Supabase Client
    participant Tasks as Tasks Table
    participant Sessions as Sessions Table
    
    UI->>Hook: Invoke mutation(taskId)
    Hook->>Supabase: Get task details (Tasks table)
    Supabase-->>Hook: Task data
    Hook->>Supabase: Create session (Sessions table)
    Supabase-->>Hook: New session ID
    Hook->>Supabase: Update task status (optional)
    Supabase-->>Hook: Confirmation
    Hook-->>UI: Success notification
```

### Implementation Details:
1. Fetch task details first (to get patient_id, etc.)
2. Create session with:
   ```javascript
   {
     patient_id: task.patient_id,
     scheduled_date: new Date().toISOString(),
     duration_minutes: 30,
     status: 'scheduled',
     type: 'follow_up',
     notes: `Created from task ${taskId}`
   }
   ```
3. Optionally update task status to 'converted_to_session'

## Bulk Session Creation (useCreateBulkSessions)

```mermaid
flowchart TD
    A[Start] --> B[Get all task IDs]
    B --> C[Loop through tasks]
    C --> D[Create session for each]
    D --> E[Update task status if needed]
    E --> F{More tasks?}
    F -->|Yes| C
    F -->|No| G[Return success count]
```

### Implementation Details:
1. Process in transaction
2. Return count of successful creations
3. Handle partial failures gracefully

## Next Steps
1. Implement single session creation hook
2. Implement bulk session creation hook
3. Test both implementations
4. Update documentation