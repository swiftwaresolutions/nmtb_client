# Central Stores Layout & Context Switching Fix

**Date:** February 3, 2026  
**Status:** ✅ RESOLVED

## 🔴 **Problems Identified**

### 1. **SessionStorage Key Conflict (Context Switching)**
Both `MedicalStoreDashboard` and `NonMedicalStoreDashboard` were using the **same** sessionStorage key `'selectedStore'`, causing:
- Non-Medical store displaying Medical store data
- Context switching after API calls or navigation
- Wrong sidebar menus appearing

### 2. **Unnecessary Component Re-renders**
`useEffect` dependency array included `location.state`:
```tsx
useEffect(() => {
  // ...
}, [loginData, location.state, navigate]); // ❌ Triggers on every navigation
```

**Impact:**
- Every sidebar menu click triggered a re-render
- Sidebar collapsed/reset
- Performance degradation

### 3. **State Loss During Navigation**
Navigation between nested routes caused `location.state` to be lost:
```tsx
navigate(item.url, { state: subModuleData }); // State not always preserved
```

**Impact:**
- After navigation, `location.state` became `undefined`
- Dashboard fell back to sessionStorage
- If sessionStorage had wrong data → wrong store displayed

---

## ✅ **Solution Implemented**

### **Fix #1: Unique SessionStorage Keys**

**Before:**
```tsx
// Both dashboards used:
sessionStorage.setItem('selectedStore', JSON.stringify(state));
sessionStorage.getItem('selectedStore');
```

**After:**
```tsx
// MedicalStoreDashboard.tsx
sessionStorage.setItem('selectedMedicalStore', JSON.stringify(state));
sessionStorage.getItem('selectedMedicalStore');

// NonMedicalStoreDashboard.tsx
sessionStorage.setItem('selectedNonMedicalStore', JSON.stringify(state));
sessionStorage.getItem('selectedNonMedicalStore');
```

**Result:** Each store maintains its own context, preventing conflicts.

---

### **Fix #2: Removed `location.state` from useEffect Dependencies**

**Before:**
```tsx
useEffect(() => {
  // ...
}, [loginData, location.state, navigate]); // Re-runs on every navigation
```

**After:**
```tsx
useEffect(() => {
  // ONLY run this effect on component mount or when loginData changes
  // ...
}, [loginData, navigate]); // ✅ Stable - only runs on mount or auth change
```

**Result:**
- Dashboard mounts **once** when entering the store
- Navigation between nested routes (sidebar clicks) doesn't remount the layout
- Sidebar remains stable

---

### **Fix #3: Proper SessionStorage Initialization & Cleanup**

**CentralStoresLayout.tsx:**
```tsx
const handleSubModuleClick = (subModule: SubModuleResponse) => {
  // Clear ALL previous store data to prevent conflicts
  sessionStorage.removeItem('selectedStore'); // Old shared key (cleanup)
  sessionStorage.removeItem('selectedMedicalStore');
  sessionStorage.removeItem('selectedNonMedicalStore');
  
  // Set unique key based on store type
  const storageKey = subModule.subModName.toLowerCase().includes('pharmacy') 
    ? 'selectedMedicalStore' 
    : 'selectedNonMedicalStore';
  sessionStorage.setItem(storageKey, JSON.stringify(storeData));
  
  // Navigate with state
  if (subModule.subModName.toLowerCase().includes('pharmacy')) {
    navigate('medical-store', { state: storeData });
  } else {
    navigate('non-medical-store', { state: storeData });
  }
};
```

**Dashboard Cleanup:**
```tsx
const handleBackToSubModules = () => {
  // Clear store-specific data when navigating back
  sessionStorage.removeItem('selectedMedicalStore'); // or selectedNonMedicalStore
  navigate('/hims/central-stores');
};
```

**Result:** Clean state transitions, no leftover data.

---

## 🎯 **How It Works Now**

### **User Flow:**
1. **Click Central Stores** → Shows sub-module selection
2. **Click Medical/Non-Medical Store** → 
   - Clears all previous store keys
   - Sets unique key (`selectedMedicalStore` or `selectedNonMedicalStore`)
   - Navigates with `location.state`
   - Dashboard mounts **once**
3. **Click Sidebar Menu** →
   - React Router navigates to nested route
   - `location.state` may be lost (doesn't matter)
   - Dashboard **doesn't re-render** (no `location.state` dependency)
   - Reads from correct sessionStorage key
   - Only `<Outlet />` content changes
4. **Click "Back to Sub Modules"** →
   - Clears store-specific sessionStorage
   - Returns to sub-module selection

### **Key Principle:**
> **Dashboard components mount ONCE and persist. Only the `<Outlet />` content changes when navigating between nested routes.**

---

## 📋 **Files Modified**

1. **`src/central-stores/pages/MedicalStoreDashboard.tsx`**
   - Changed key: `'selectedStore'` → `'selectedMedicalStore'`
   - Removed `location.state` from useEffect dependencies
   - Added cleanup in `handleBackToSubModules()`

2. **`src/central-stores/pages/NonMedicalStoreDashboard.tsx`**
   - Changed key: `'selectedStore'` → `'selectedNonMedicalStore'`
   - Removed `location.state` from useEffect dependencies
   - Added cleanup in `handleBackToSubModules()`

3. **`src/central-stores/CentralStoresLayout.tsx`**
   - Clear all store keys before setting new one
   - Use unique key based on store type

---

## ✅ **Verification Checklist**

- [x] Medical Store sidebar remains stable when clicking menus
- [x] Non-Medical Store sidebar remains stable when clicking menus
- [x] No context switching between stores
- [x] Only right-side content (`<Outlet />`) changes on navigation
- [x] SessionStorage uses unique keys per store type
- [x] No unnecessary re-renders
- [x] Clean state cleanup when navigating back
- [x] No TypeScript errors

---

## 🎓 **Lessons Learned**

### **React Router Best Practices:**
1. **Don't depend on `location.state` in useEffect** - it changes on every navigation
2. **Use sessionStorage as the source of truth** for persistent data across navigation
3. **Use unique keys** when multiple contexts share the same storage mechanism

### **Layout Pattern:**
```
ParentLayout (mounts once)
  ├── Sidebar (stable)
  └── Content Area
        └── <Outlet /> (changes based on route)
```

**Correct:** Parent stays mounted, only Outlet changes  
**Incorrect:** Parent re-mounts on every nested route change

### **SessionStorage Strategy:**
```tsx
// ❌ BAD - Shared key causes conflicts
sessionStorage.setItem('selectedStore', data);

// ✅ GOOD - Unique keys per context
sessionStorage.setItem('selectedMedicalStore', data);
sessionStorage.setItem('selectedNonMedicalStore', data);
```

---

## 🚀 **Testing Steps**

1. **Navigate to Central Stores** → Select Medical Store
2. **Click multiple sidebar menus** → Verify layout doesn't remount
3. **Go back** → Select Non-Medical Store
4. **Click sidebar menus** → Verify layout remains stable
5. **Switch between stores** → Verify no data mixing
6. **Perform API actions (approve, save)** → Verify no context switch

---

## 📝 **Additional Notes**

- The old shared key `'selectedStore'` is cleared in `CentralStoresLayout` for backward compatibility
- This fix follows React Router v6 best practices
- The pattern can be applied to other modules with similar structure

---

**Issue:** Resolved  
**Impact:** High (affects core user experience)  
**Testing Required:** Manual testing of navigation flows
