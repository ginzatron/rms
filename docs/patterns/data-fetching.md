# Data Fetching Patterns

This document explains how data fetching works in the RMS frontend application.

## Overview

The application uses a simple, custom hook-based approach for data fetching:

```
Component → useSpecificHook() → useApi() → fetch() → API
```

## The `useApi` Hook

Located at: `frontend/src/hooks/useApi.ts`

This is the core data fetching primitive that all other hooks build upon.

### Interface

```typescript
function useApi<T>(url: string | null): {
  data: T | null       // The fetched data, or null if loading/error/not fetched
  loading: boolean     // True while the request is in flight
  error: Error | null  // Error object if the request failed
  refetch: () => void  // Call to manually re-fetch the data
}
```

### How It Works

```
1. Component calls useApi('/api/endpoint')
   ↓
2. Hook sets loading=true
   ↓
3. Hook calls fetch(API_BASE_URL + url)
   ↓
4. On success: { data: response, loading: false, error: null }
   On failure: { data: null, loading: false, error: Error }
   ↓
5. If url changes, automatically re-fetches
```

### Basic Usage

```typescript
import { useApi } from '../hooks/useApi'
import type { User } from '../types/api'

function UserList() {
  const { data: users, loading, error } = useApi<User[]>('/api/users')

  if (loading) return <Spinner />
  if (error) return <ErrorMessage error={error} />
  if (!users || users.length === 0) return <EmptyState />

  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.first_name} {user.last_name}</li>
      ))}
    </ul>
  )
}
```

### Conditional Fetching

Pass `null` as the URL to skip fetching. Useful when you don't have required parameters yet:

```typescript
function ResidentDashboard({ residentId }: { residentId: string | null }) {
  // Won't fetch until residentId is provided
  const { data } = useApi<ResidentProgress>(
    residentId ? `/api/residents/${residentId}/progress` : null
  )

  if (!residentId) return <SelectResidentPrompt />
  // ...
}
```

### Manual Refetch

Use `refetch()` after mutations to update the displayed data:

```typescript
function AssessmentList({ residentId }) {
  const { data, refetch } = useUnacknowledgedAssessments(residentId)

  const handleAcknowledge = async (assessmentId: string) => {
    await patchApi(`/api/assessments/${assessmentId}/acknowledge`)
    refetch() // Refresh the list after acknowledging
  }

  // ...
}
```

## Domain-Specific Hooks

We create thin wrapper hooks for specific API endpoints. This provides:
1. Type safety (return type is explicit)
2. Encapsulated URL construction
3. Consistent documentation

### Hook File Structure

Each hook is in its own file under `frontend/src/hooks/`:

```
hooks/
├── useApi.ts                        # Core fetching primitive
├── useResidents.ts                  # GET /api/residents
├── useResidentProgress.ts           # GET /api/residents/:id/progress
├── useUnacknowledgedAssessments.ts  # GET /api/residents/:id/unacknowledged
├── useAssessments.ts                # GET /api/assessments
├── useUsers.ts                      # GET /api/users
├── useEpas.ts                       # GET /api/epas
├── useFacultyList.ts                # GET /api/faculty
└── useClinicalSites.ts              # GET /api/clinical-sites
```

### Creating a New Hook

```typescript
// hooks/useMyData.ts
import { useApi } from './useApi'
import type { MyDataType } from '../types/api'

/**
 * Hook to fetch my data.
 *
 * @param id - The ID to fetch, or null to skip fetching
 * @returns { data: MyDataType, loading, error, refetch }
 *
 * @example
 * const { data, loading } = useMyData(someId)
 */
export function useMyData(id: string | null) {
  return useApi<MyDataType>(
    id ? `/api/my-endpoint/${id}` : null
  )
}
```

## Mutation Helpers

For POST, PATCH, DELETE operations, use the helper functions:

### `postApi`

```typescript
import { postApi } from '../hooks/useApi'

const handleSubmit = async () => {
  try {
    const result = await postApi<AssessmentPayload, { id: string }>(
      '/api/assessments',
      payload
    )
    console.log('Created:', result.id)
  } catch (error) {
    console.error('Failed:', error)
  }
}
```

### `patchApi`

```typescript
import { patchApi } from '../hooks/useApi'

const handleAcknowledge = async (id: string) => {
  await patchApi(`/api/assessments/${id}/acknowledge`)
}
```

## Error Handling Pattern

Always handle loading, error, and empty states:

```typescript
function MyComponent({ id }) {
  const { data, loading, error } = useMyData(id)

  // 1. Loading state
  if (loading) {
    return <LoadingSpinner />
  }

  // 2. Error state
  if (error) {
    return <ErrorMessage message={error.message} />
  }

  // 3. Empty/null state
  if (!data) {
    return <EmptyState message="No data found" />
  }

  // 4. Success state
  return <DataDisplay data={data} />
}
```

## Configuration

The API base URL is configured via environment variable:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'
```

For production, set `VITE_API_URL` in your `.env` file.

## Common Patterns

### Filtering with Query Parameters

```typescript
export function useAssessments(residentId: string | null, epaId?: string) {
  const params = new URLSearchParams()
  if (residentId) params.set('resident_id', residentId)
  if (epaId) params.set('epa_id', epaId)

  return useApi<Assessment[]>(
    residentId ? `/api/assessments?${params.toString()}` : null
  )
}
```

### Computed Values from Fetched Data

```typescript
function ProgressSummary({ residentId }) {
  const { data: progress } = useResidentProgress(residentId)

  // Compute derived values
  const deficientEpas = progress?.progress.filter(
    epa => epa.requirement && !epa.requirement.is_met
  ) ?? []

  const completionPercent = progress
    ? (progress.stats.requirements_met / progress.stats.requirements_total * 100)
    : 0

  // ...
}
```

## Testing Hooks

Hooks can be tested using React Testing Library:

```typescript
import { renderHook, waitFor } from '@testing-library/react'
import { useResidentProgress } from './useResidentProgress'

test('fetches resident progress', async () => {
  const { result } = renderHook(() => useResidentProgress('resident-123'))

  await waitFor(() => {
    expect(result.current.loading).toBe(false)
  })

  expect(result.current.data).toBeDefined()
  expect(result.current.data?.stats.total_assessments).toBeGreaterThan(0)
})
```
