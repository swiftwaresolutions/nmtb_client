# Central Stores - Session Management Guide

## Overview

This document explains the centralized sessionStorage management for Central Stores module to ensure consistent store ID handling across all components.

## SessionStorage Key

**Key Name:** `selectedStore`

**Data Structure:**
```typescript
{
  subModId: number;      // Sub-module ID
  subModName: string;    // Store display name (e.g., "Pharmacy Store")
  modGroupId: number;    // Module group ID
  modGroupName: string;  // Module group name
  masterId: number;      // Store ID (used as storeId in API calls)
}
```

## User Flow

### 1. Store Selection (CentralStoresLayout.tsx)

**When:** User clicks on a store card (e.g., Pharmacy Store, Lab Store)

**What Happens:**
```typescript
// Clear any previous store data
sessionStorage.removeItem('selectedStore');

// Store new store information
const storeData = {
  subModId: subModule.subModId,
  subModName: subModule.subModName,
  modGroupId: subModule.modGroupId,
  modGroupName: subModule.modGroupName,
  masterId: subModule.masterId
};
sessionStorage.setItem('selectedStore', JSON.stringify(storeData));
```

**Route:** Navigate to appropriate dashboard with state

### 2. Using Store Data (All Store Components)

**Example:** PrepareOrderFilter.tsx

```typescript
useEffect(() => {
  // Always retrieve from centralized sessionStorage
  try {
    const storedData = sessionStorage.getItem('selectedStore');
    if (storedData) {
      const parsed = JSON.parse(storedData) as SubModuleState;
      setSubModuleData(parsed);
      // Now use parsed.masterId as storeId in API calls
    } else {
      // No store selected, navigate back
      navigate(routerPathNames.centralStores.base);
    }
  } catch (error) {
    console.error('Error retrieving selectedStore:', error);
    navigate(routerPathNames.centralStores.base);
  }
}, [loginData, navigate]);
```

### 3. Navigation Back to Home

**When:** User clicks "Back to Modules" or navigates to home dashboard

**What Happens:**
```typescript
const handleBackToModules = () => {
  // Clear store information from session
  sessionStorage.removeItem('selectedStore');
  navigate(routerPathNames.hims.dashboard);
};
```

### 4. Switching Stores

**When:** User goes back to Central Stores and selects a different store

**What Happens:**
- Previous store data is automatically removed in `handleSubModuleClick`
- New store data is stored
- Components using sessionStorage will automatically get new store data

## Benefits

✅ **Single Source of Truth:** All components read from same sessionStorage key
✅ **Automatic Cleanup:** Store data cleared when navigating home or switching stores
✅ **Persistence:** Data survives page refreshes and navigation within store module
✅ **Validation:** Easy to validate if store is selected before API calls
✅ **Consistency:** No need to pass state through multiple navigation layers

## Validation Pattern

Before making API calls that require storeId:

```typescript
// Retrieve store data
const storedData = sessionStorage.getItem('selectedStore');
if (!storedData) {
  Swal.fire({
    icon: 'error',
    title: 'Invalid Store',
    text: 'Please go back and select a valid store.',
  });
  return;
}

const storeData = JSON.parse(storedData);
if (!storeData.masterId || storeData.masterId === 0) {
  Swal.fire({
    icon: 'error',
    title: 'Invalid Store',
    text: 'Store information is missing. Please go back and select a valid store.',
  });
  return;
}

// Safe to use storeData.masterId as storeId
const payload = {
  storeId: storeData.masterId,
  // ... other fields
};
```

## Components Updated

- ✅ **CentralStoresLayout.tsx** - Stores data on store selection, clears on back to home
- ✅ **PrepareOrderFilter.tsx** - Uses centralized sessionStorage instead of component-specific key

## Migration Notes

**Old Approach (Component-Specific):**
```typescript
// Each component had its own sessionStorage key
sessionStorage.setItem('prepareOrderFilter_subModuleData', ...);
sessionStorage.setItem('approveOrder_subModuleData', ...);
// This caused data duplication and inconsistency
```

**New Approach (Centralized):**
```typescript
// All components use same key
sessionStorage.getItem('selectedStore');
// Single source of truth, automatic synchronization
```

## Testing Checklist

- [ ] Select a store → Verify sessionStorage has 'selectedStore' key
- [ ] Navigate within store module → Verify store name displays correctly
- [ ] Navigate to home → Verify sessionStorage 'selectedStore' is removed
- [ ] Select different store → Verify old data removed, new data stored
- [ ] Refresh page while in store module → Verify store data persists
- [ ] Try to prepare order without selecting store → Verify validation error

## Future Enhancements

- Consider adding store expiration timestamp to sessionStorage
- Add store validation middleware at route level
- Create a custom hook `useSelectedStore()` for easier access

---

**Last Updated:** January 28, 2026
**Author:** Development Team
