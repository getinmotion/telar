# User Data Architecture - Unified System

## 🎯 Problem Statement

Currently, the application has **multiple overlapping systems** for managing user data:

1. **user_profiles** (Supabase table) - 32 columns with specific business fields
2. **user_master_context** (Supabase table) - 14 columns with flexible JSONB fields
3. **localStorage** (user-namespaced) - Various cached data
4. Multiple hooks accessing different sources inconsistently

This creates:
- Data inconsistency and sync issues
- Confusion about "source of truth"
- Performance issues from redundant queries
- Maintenance complexity

## ✅ Solution: Unified Data Layer

### Data Flow Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    Single Entry Point                        │
│                  useUnifiedUserData()                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Smart Cache Layer                        │
│              (user-namespaced localStorage)                  │
│  - Immediate data access                                     │
│  - Background sync                                           │
│  - Optimistic updates                                        │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌──────────────────────┬──────────────────────────────────────┐
│   user_profiles      │     user_master_context              │
│   (Structured Data)  │     (Flexible Context)               │
│  - brand_name        │  - business_profile (JSONB)          │
│  - business_type     │  - task_generation_context (JSONB)   │
│  - language_pref     │  - conversation_insights (JSONB)     │
│  - Basic identity    │  - Rich metadata                     │
└──────────────────────┴──────────────────────────────────────┘
```

### Data Responsibilities

#### user_profiles (Structured)
**Purpose**: Core identity and frequently queried fields
- User identity (name, email, location)
- Business basics (brand_name, business_type, language)
- RLS-protected personal data

#### user_master_context (Flexible)
**Purpose**: Rich context and evolving data
- Business profile details (JSONB)
- Task generation context
- Conversation insights
- AI learning data

#### localStorage (Cache)
**Purpose**: Performance and offline capability
- User-namespaced keys (`user_{id}_{key}`)
- Immediate data access
- Optimistic UI updates
- Background sync to DB

## 🏗️ Implementation Plan

### Phase 2.1: Create Unified Hook ✅ NEXT
```typescript
// src/hooks/user/useUnifiedUserData.ts
export const useUnifiedUserData = () => {
  // Single source of truth
  // Handles cache, DB sync, optimistic updates
  // Returns consistent interface
}
```

### Phase 2.2: Migrate Components
- Update all components to use `useUnifiedUserData()`
- Remove direct `user_profiles` / `user_master_context` queries
- Deprecate `useUserBusinessProfile` and `useUserBusinessContext`

### Phase 2.3: Create Sync Service
- Background sync between localStorage ↔ DB
- Conflict resolution
- Offline support

## 📊 Data Access Patterns

### Read Pattern (Optimized)
```typescript
const { profile, context, loading } = useUnifiedUserData();
// ✅ Instant return from cache
// ✅ Background DB sync if stale
// ✅ Single hook, complete data
```

### Write Pattern (Optimistic)
```typescript
const { updateProfile } = useUnifiedUserData();
await updateProfile({ brand_name: 'New Name' });
// ✅ UI updates immediately (cache)
// ✅ DB sync in background
// ✅ Rollback on error
```

## 🔒 Security Considerations

- All data operations go through user-namespaced storage
- RLS policies enforce user_id = auth.uid()
- No cross-user data leakage
- Audit trail for sensitive changes

## 📈 Performance Benefits

| Current System | Unified System |
|----------------|----------------|
| 3-5 DB queries per page | 1 query (or 0 with cache) |
| Multiple re-renders | Single coordinated update |
| Manual sync logic | Automatic background sync |
| Inconsistent state | Single source of truth |

## 🚀 Migration Strategy

1. ✅ Phase 1: Security (useUserLocalStorage) - DONE
2. ✅ Phase 1.2: Folder reorganization - DONE
3. 🔄 Phase 2.1: Create useUnifiedUserData - IN PROGRESS
4. ⏳ Phase 2.2: Migrate components gradually
5. ⏳ Phase 2.3: Deprecate old hooks
6. ⏳ Phase 2.4: Remove redundant code

## 📝 Notes

- Backward compatibility maintained during migration
- Old hooks will proxy to new system with deprecation warnings
- Database schema remains unchanged (no migrations needed)
- Can rollback at any point during migration
