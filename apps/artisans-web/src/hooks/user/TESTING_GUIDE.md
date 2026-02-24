# 🧪 Testing Guide: useUnifiedUserData

## Overview

This guide provides comprehensive testing instructions for the `useUnifiedUserData` hook and its integrated components.

---

## 🎯 Test Scenarios

### 1. Cache Performance Tests

#### Test 1.1: First Load (Cold Cache)
**Objective**: Verify data loads from database on first access.

**Steps**:
1. Clear localStorage: `localStorage.clear()`
2. Log in as a test user
3. Open browser DevTools → Network tab
4. Navigate to dashboard

**Expected Results**:
- ✅ See Supabase queries in Network tab
- ✅ `loading: true` → `loading: false` transition
- ✅ Data displayed correctly
- ✅ localStorage populated with cache

**Metrics**:
- Load time: 800-1200ms (acceptable)
- Queries: 2 (user_profiles + user_master_context)

---

#### Test 1.2: Subsequent Load (Warm Cache)
**Objective**: Verify instant load from cache.

**Steps**:
1. Complete Test 1.1 (ensure cache exists)
2. Refresh the page
3. Check Network tab

**Expected Results**:
- ✅ **Zero** Supabase queries
- ✅ Instant data load (< 100ms)
- ✅ `isCached: true`
- ✅ Same data as before

**Metrics**:
- Load time: 20-100ms
- Queries: 0

---

#### Test 1.3: Cache Expiration
**Objective**: Verify automatic refresh after TTL.

**Steps**:
1. Load dashboard (warm cache)
2. Wait 5+ minutes (or modify TTL in code for faster testing)
3. Refresh page

**Expected Results**:
- ✅ Initial load from cache (instant)
- ✅ Background refresh triggers
- ✅ Data updates if changed in database
- ✅ New cache timestamp

**Metrics**:
- Initial load: instant from cache
- Background sync: 200-500ms

---

### 2. Data Consistency Tests

#### Test 2.1: Profile Update Consistency
**Objective**: Verify all components reflect profile changes.

**Steps**:
1. Open dashboard in main window
2. Open profile page in second window (same user)
3. Update business name in profile page
4. Switch back to dashboard

**Expected Results**:
- ✅ Profile page updates instantly (optimistic)
- ✅ Dashboard shows updated name after refresh
- ✅ Both windows eventually show same data
- ✅ localStorage synced across tabs

---

#### Test 2.2: Context Update Consistency
**Objective**: Verify context changes propagate correctly.

**Steps**:
1. Complete maturity assessment
2. Check scores in:
   - Dashboard stats
   - Profile page
   - Maturity calculator page
   - Master coordinator

**Expected Results**:
- ✅ All components show identical scores
- ✅ No stale data anywhere
- ✅ Cache reflects latest values

---

### 3. Optimistic Update Tests

#### Test 3.1: Profile Update (Success)
**Objective**: Verify optimistic updates with successful DB write.

**Steps**:
1. Open profile edit form
2. Change business description
3. Observe UI immediately
4. Check Network tab

**Expected Results**:
- ✅ UI updates **instantly** (before DB response)
- ✅ No loading spinner during update
- ✅ Success toast appears
- ✅ DB update happens in background
- ✅ Cache updated after confirmation

---

#### Test 3.2: Profile Update (Failure)
**Objective**: Verify rollback on failed update.

**Steps**:
1. Simulate network failure (DevTools → Offline)
2. Try to update profile
3. Observe behavior

**Expected Results**:
- ✅ Optimistic update shows briefly
- ✅ Error toast appears
- ✅ UI **rolls back** to previous value
- ✅ Cache restored to valid state

---

### 4. Multi-User Isolation Tests

#### Test 4.1: User Switching
**Objective**: Verify no data leakage between users.

**Steps**:
1. Log in as User A
2. Navigate dashboard (note business name)
3. Log out
4. Log in as User B (different business)
5. Check dashboard

**Expected Results**:
- ✅ User A's data completely cleared
- ✅ User B sees only their own data
- ✅ No remnants of User A in cache
- ✅ localStorage keys user-specific

**Verify in DevTools**:
```javascript
// Check localStorage keys
Object.keys(localStorage).filter(k => k.includes('unified_user_data'))
// Should only show current user's key
```

---

### 5. Performance Stress Tests

#### Test 5.1: Rapid Navigation
**Objective**: Verify cache handles rapid component mounting.

**Steps**:
1. Rapidly navigate between:
   - Dashboard → Profile → Tasks → Dashboard
2. Repeat 10 times
3. Monitor console for errors

**Expected Results**:
- ✅ No duplicate queries
- ✅ No race conditions
- ✅ Smooth transitions
- ✅ Consistent data across all pages

---

#### Test 5.2: Concurrent Updates
**Objective**: Test simultaneous update operations.

**Steps**:
1. Open 2 tabs with same user
2. Update profile in Tab 1
3. Immediately update context in Tab 2
4. Check both tabs

**Expected Results**:
- ✅ Both updates succeed
- ✅ No data corruption
- ✅ Eventually consistent across tabs
- ✅ Last write wins (expected behavior)

---

### 6. Error Handling Tests

#### Test 6.1: Network Timeout
**Objective**: Verify graceful handling of slow/failed requests.

**Steps**:
1. Clear cache
2. Simulate slow network (DevTools → Throttling → Slow 3G)
3. Try to load dashboard

**Expected Results**:
- ✅ Loading state shows appropriately
- ✅ Timeout after 5 seconds
- ✅ Fallback to empty/default state
- ✅ Error message shown
- ✅ No app crash

---

#### Test 6.2: Invalid Cache Data
**Objective**: Verify handling of corrupted cache.

**Steps**:
1. Manually corrupt cache in DevTools:
   ```javascript
   localStorage.setItem('user-{userId}-unified_user_data', 'invalid-json{}}')
   ```
2. Refresh page

**Expected Results**:
- ✅ Detects invalid cache
- ✅ Clears corrupted data
- ✅ Fetches fresh from database
- ✅ No app crash

---

### 7. Migration Compatibility Tests

#### Test 7.1: Old Hook Still Works
**Objective**: Verify deprecated hooks proxy correctly.

**Steps**:
1. Find component using `useUserBusinessProfile`
2. Verify it still functions
3. Check console for deprecation warning

**Expected Results**:
- ✅ Component works identically
- ✅ Console shows deprecation warning
- ✅ Data returned in expected format
- ✅ No breaking changes

---

#### Test 7.2: Mixed Hook Usage
**Objective**: Verify old and new hooks coexist.

**Steps**:
1. Component A uses `useUnifiedUserData`
2. Component B uses deprecated `useUserBusinessContext`
3. Both components on same page

**Expected Results**:
- ✅ Both see same data
- ✅ Updates in one reflect in other
- ✅ No conflicts or race conditions

---

## 🔧 Testing Tools

### Manual Testing Helpers

Add to browser console for testing:

```javascript
// Clear all user caches
function clearAllUserCache() {
  Object.keys(localStorage)
    .filter(k => k.startsWith('user-'))
    .forEach(k => localStorage.removeItem(k));
  console.log('✅ All user caches cleared');
}

// Check cache status
function checkCacheStatus() {
  const keys = Object.keys(localStorage).filter(k => k.includes('unified_user_data'));
  keys.forEach(key => {
    const data = JSON.parse(localStorage.getItem(key) || '{}');
    const timestamp = localStorage.getItem(key.replace('unified_user_data', 'unified_user_data_timestamp'));
    const age = timestamp ? Date.now() - parseInt(timestamp) : 'N/A';
    console.log(`
      Key: ${key}
      Age: ${typeof age === 'number' ? Math.round(age / 1000) + 's' : age}
      Size: ${JSON.stringify(data).length} bytes
    `);
  });
}

// Simulate cache expiration
function expireCache() {
  const timestampKeys = Object.keys(localStorage)
    .filter(k => k.includes('unified_user_data_timestamp'));
  
  timestampKeys.forEach(key => {
    const oldTimestamp = Date.now() - (10 * 60 * 1000); // 10 min ago
    localStorage.setItem(key, oldTimestamp.toString());
  });
  console.log('✅ Cache expired (simulated)');
}

// Force refresh
async function forceRefresh() {
  // This would need access to the hook instance
  // Call refreshData() from component
  console.log('Call refreshData() from your component');
}
```

### Automated Testing (Future)

```typescript
// Example Vitest test
import { renderHook, waitFor } from '@testing-library/react';
import { useUnifiedUserData } from '@/hooks/user';

describe('useUnifiedUserData', () => {
  it('loads from cache on second render', async () => {
    // First render
    const { result, rerender } = renderHook(() => useUnifiedUserData());
    
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
    });
    
    // Second render
    rerender();
    
    expect(result.current.isCached).toBe(true);
    expect(result.current.loading).toBe(false);
  });
});
```

---

## 📊 Performance Benchmarks

### Acceptable Metrics

| Scenario | Target | Warning | Critical |
|----------|--------|---------|----------|
| Cold cache load | < 1200ms | 1200-2000ms | > 2000ms |
| Warm cache load | < 100ms | 100-300ms | > 300ms |
| Optimistic update | < 50ms | 50-100ms | > 100ms |
| Background sync | < 500ms | 500-1000ms | > 1000ms |
| Cache hit rate | > 90% | 80-90% | < 80% |

---

## ✅ Pre-Production Checklist

Before deploying to production:

- [ ] All 7 test scenarios pass
- [ ] No console errors in normal flow
- [ ] Cache invalidation works correctly
- [ ] Multi-user isolation verified
- [ ] Performance metrics within targets
- [ ] Error handling graceful
- [ ] Deprecated hooks show warnings
- [ ] Documentation updated
- [ ] Migration guide accessible

---

## 🐛 Common Issues & Solutions

### Issue 1: Cache Not Updating
**Symptom**: Changes don't reflect after update.

**Solution**:
1. Check `updateProfile` or `updateContext` returns success
2. Verify `refreshData()` is called after update
3. Clear cache manually and test fresh

### Issue 2: Slow First Load
**Symptom**: > 2s load time with cold cache.

**Solution**:
1. Check Supabase response times
2. Verify database indexes on `user_id`
3. Consider reducing data fetched

### Issue 3: Stale Data Across Tabs
**Symptom**: Different tabs show different data.

**Solution**:
1. Implement storage event listener
2. Sync cache on `storage` event
3. Force refresh when other tab updates

---

## 📞 Support

If tests fail or unexpected behavior occurs:

1. Check `MIGRATION_SUMMARY.md` for architecture details
2. Review `src/hooks/user/README.md` for usage examples
3. Add detailed issue with:
   - Test scenario that failed
   - Expected vs actual behavior
   - Console errors
   - Network activity logs

**Happy testing! 🚀**
