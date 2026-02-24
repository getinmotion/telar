# User Hooks - Migration Guide

## 🎯 New Unified System (Recommended)

### useUnifiedUserData
**The new single source of truth for all user data.**

```typescript
import { useUnifiedUserData } from '@/hooks/user';

function MyComponent() {
  const { 
    profile,        // All profile fields
    context,        // Rich business context
    loading,        // Loading state
    updateProfile,  // Update profile
    updateContext,  // Update context
    refreshData     // Force refresh
  } = useUnifiedUserData();

  // Access profile data
  const brandName = profile.brandName;
  const businessType = profile.businessType;
  
  // Update profile (optimistic)
  await updateProfile({ 
    brandName: 'New Name' 
  });
  
  // Update context
  await updateContext({
    taskGenerationContext: { ... }
  });
}
```

## 🔄 Migration from Old Hooks

### From useUserBusinessProfile

**OLD:**
```typescript
const { businessProfile, loading } = useUserBusinessProfile();
const brandName = businessProfile?.brandName;
```

**NEW:**
```typescript
const { profile, loading } = useUnifiedUserData();
const brandName = profile.brandName;
```

### From useUserBusinessContext

**OLD:**
```typescript
const { context, updateBusinessProfile } = useUserBusinessContext();
await updateBusinessProfile({ industry: 'tech' });
```

**NEW:**
```typescript
const { context, updateContext } = useUnifiedUserData();
await updateContext({ 
  businessProfile: { industry: 'tech' } 
});
```

### From useProfileSync

**OLD:**
```typescript
const { syncProfileData } = useProfileSync();
await syncProfileData();
```

**NEW:**
```typescript
const { refreshData } = useUnifiedUserData();
await refreshData();
```

## 📊 Benefits of New System

| Feature | Old System | New System |
|---------|-----------|------------|
| **Data Sources** | Multiple hooks, different sources | Single hook, unified data |
| **Queries per page** | 3-5 DB queries | 0-1 (cached) |
| **Cache** | Manual, inconsistent | Automatic, smart TTL |
| **Updates** | Slow, manual sync | Optimistic, instant UI |
| **Type Safety** | Partial | Full TypeScript |
| **Performance** | Multiple re-renders | Single coordinated update |

## 🚀 Migration Checklist

- [ ] Replace `useUserBusinessProfile` with `useUnifiedUserData`
- [ ] Replace `useUserBusinessContext` with `useUnifiedUserData`
- [ ] Replace `useProfileSync` with `refreshData` from `useUnifiedUserData`
- [ ] Update direct Supabase queries to use unified hook
- [ ] Test data consistency
- [ ] Remove deprecated imports

## ⚠️ Deprecated Hooks (Backward Compatible)

These hooks still work but log deprecation warnings:

- `useUserBusinessProfile` - Use `useUnifiedUserData`
- `useUserBusinessContext` - Use `useUnifiedUserData`
- Direct Supabase queries to `user_profiles` or `user_master_context`

## 🔧 Advanced Usage

### Optimistic Updates
```typescript
const { updateProfile } = useUnifiedUserData();

// UI updates immediately, syncs in background
await updateProfile(
  { brandName: 'New Name' },
  { optimistic: true }
);
```

### Force Refresh
```typescript
const { refreshData } = useUnifiedUserData();

// Force fetch from database, bypass cache
await refreshData();
```

### Clear Cache
```typescript
const { clearCache } = useUnifiedUserData();

// Clear cache and force next fetch from DB
clearCache();
```

## 📖 Full API Reference

See `src/hooks/user/useUnifiedUserData.ts` for complete documentation.
