# Zappy Dashboard Database Guide

## Database Schema
- Uses Supabase PostgreSQL
- Primary tables: `client_record`, `consultations`, `products`, `services`, etc.
- All tables follow naming convention: `snake_case`
- RLS (Row Level Security) enabled on all tables

## Connection Best Practices
1. **Client Initialization**
```js
// src/lib/supabase.js
import { createClient } from '@supabase/supabase-js'

export const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASE_ANON_KEY,
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true
    }
  }
)
```

2. **Query Patterns**
- Always use `.single()` when expecting one result
- Apply proper error handling
- Use TypeScript types for responses
```ts
interface ClientRecord {
  id: string
  first_name: string
  last_name: string
  // ... other fields
}
```

3. **Hooks Standardization**
```js
// Example standardized query hook
export const useClients = () => {
  const [data, setData] = useState<ClientRecord[]>([])
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const { data, error } = await supabase
          .from('client_record')
          .select('*')
          .order('last_name', { ascending: true })
        
        if (error) throw error
        setData(data)
      } catch (err) {
        setError(err)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  return { data, error, loading }
}
```

## Migration Strategy
1. All schema changes must go through migrations
2. Migrations are stored in `supabase/migrations/`
3. Production migrations must be applied via:
```bash
npx supabase db push
```

## API Layer Standards
1. **Data Access Layer**
- All database access goes through `src/apis/` modules
- Each resource has:
  - `api.js`: Raw queries
  - `hooks.js`: React hooks for data fetching

2. **Error Handling**
- Centralized in `src/utils/errorHandling.js`
- All API calls must handle errors consistently

## Recommended Improvements
1. Complete migration to TypeScript
2. Implement React Query for caching
3. Add comprehensive API documentation
4. Set up database monitoring
