# ADR-006: Offline Data Capture

## Status
ACCEPTED (deferred implementation)

## Context
Faculty submit EPA assessments in clinical environments with unreliable connectivity (ORs, patient rooms). Need offline-first data capture.

## Decision
When implemented, use **Service Worker + IndexedDB** for offline capability.

### Architecture
```
┌─────────────────────────────────────────────────────────┐
│                      Browser                             │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐  │
│  │   React     │───▶│  IndexedDB  │───▶│   Service   │  │
│  │    App      │    │  (local DB) │    │   Worker    │  │
│  └─────────────┘    └─────────────┘    └─────────────┘  │
│                            │                   │         │
└────────────────────────────│───────────────────│─────────┘
                             │                   │
                             ▼                   ▼
                      ┌─────────────┐    ┌─────────────┐
                      │   Sync to   │    │   Cache     │
                      │   Server    │    │   Assets    │
                      └─────────────┘    └─────────────┘
```

### Sync Strategy
1. **Save locally first** - Assessment saved to IndexedDB immediately
2. **Queue for sync** - Marked as "pending" with timestamp
3. **Sync when online** - Background sync to server
4. **Conflict resolution** - Last-write-wins (assessments are immutable once synced)
5. **UI feedback** - Show sync status (pending/synced/failed)

### Implementation Notes
- Use `idb` library for IndexedDB (cleaner Promise API)
- Service Worker handles asset caching
- Background Sync API for reliable uploads
- Fallback to manual sync button if Background Sync unavailable

## Consequences

### Positive
- Works in low/no connectivity environments
- No data loss if connection drops mid-submission
- Familiar web technology (no native app)

### Negative
- More complex than online-only
- Need to handle sync conflicts
- Browser support variations (though modern browsers are fine)

### Neutral
- Can be implemented incrementally
- Start online-only, add offline later
