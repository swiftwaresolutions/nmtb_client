# Central Stores Module - Testing Guide

## 🧪 Quick Test Steps

### Test 1: Module Access
**Purpose**: Verify Central Store module link works

1. Start the application
2. Navigate to dashboard: `http://localhost:3000/hims`
3. Find "Central Store" card
4. **Expected**: Card displays with proper icon and title
5. Click on the card
6. **Expected**: Navigate to `/hims/central-stores`

**Pass Criteria**: ✅ Navigation works without errors

---

### Test 2: Sub-Module API Call
**Purpose**: Verify API integration and data loading

1. Open browser DevTools (F12)
2. Go to Network tab
3. Navigate to `/hims/central-stores`
4. **Expected**: See API call to `/v1/fetchSubModule/4`
5. Check Response tab
6. **Expected**: JSON array with sub-modules

**Sample Response**:
```json
[
  {
    "modGroupId": 1,
    "modGroupName": "Medical Store",
    "subModId": 1,
    "subModName": "Medical Store Main",
    "masterId": 1
  },
  {
    "modGroupId": 2,
    "modGroupName": "Non-Medical Store",
    "subModId": 2,
    "subModName": "Stationary Store",
    "masterId": 2
  }
]
```

**Pass Criteria**: ✅ API call successful, data received

---

### Test 3: Material Design Cards
**Purpose**: Verify UI rendering and animations

1. At `/hims/central-stores`
2. **Expected**: See gradient cards for sub-modules
   - Medical Store: Purple gradient
   - Non-Medical Store: Pink gradient
3. Hover over each card
4. **Expected**: 
   - Card lifts up (translateY)
   - Card scales slightly (scale 1.02)
   - Shadow deepens
   - Smooth animation (300ms)
5. Move mouse away
6. **Expected**: Card returns to original position smoothly

**Pass Criteria**: ✅ Cards display correctly with working animations

---

### Test 4: Medical Store Navigation
**Purpose**: Verify Medical Store dashboard access

1. Click "Medical Store" card
2. **Expected**: Navigate to `/hims/central-stores/medical-store`
3. **Expected**: See dashboard with:
   - Left sidebar with menus
   - Main content area with metrics
   - Quick access cards
4. Check sidebar menus
5. **Expected**: 7 main menu sections:
   - 📦 Purchase
   - ⚡ Activities
   - 📋 Masters
   - 📊 Registers
   - 📈 Reports
   - ⚙️ Setup
   - 🏠 Go to

**Pass Criteria**: ✅ Dashboard loads with all UI elements

---

### Test 5: Non-Medical Store Navigation
**Purpose**: Verify Non-Medical Store dashboard access

1. Return to `/hims/central-stores`
2. Click "Non-Medical Store" card
3. **Expected**: Navigate to `/hims/central-stores/non-medical-store`
4. **Expected**: See dashboard with:
   - Left sidebar with menus
   - Main content area with metrics
   - Quick access cards
5. Check sidebar menus
6. **Expected**: 6 main menu sections:
   - 📦 Purchase
   - ⚡ Activities
   - 📋 Masters
   - 📊 Registers
   - 📈 Reports
   - ⚙️ Setup

**Pass Criteria**: ✅ Dashboard loads with correct menu structure

---

### Test 6: Menu Navigation (Medical Store)
**Purpose**: Verify menu items navigate correctly

1. At `/hims/central-stores/medical-store`
2. Click "Purchase" menu
3. **Expected**: Submenu expands
4. Click "Prepare Order"
5. **Expected**: Navigate to `/hims/central-stores/medical-store/purchase/prepare-order`
6. **Expected**: URL changes, no errors in console

**Test Additional Menu Items**:
- Purchase → Purchase Entry → Purchase Entry
- Activities → Transfer → Transfer Prep
- Masters → Product Master → Product Add
- Registers → Stock Register
- Reports → Expiry Date Wise Report

**Pass Criteria**: ✅ All menu items navigate to correct routes

---

### Test 7: Menu Navigation (Non-Medical Store)
**Purpose**: Verify non-medical menu items navigate correctly

1. At `/hims/central-stores/non-medical-store`
2. Click "Purchase" menu
3. **Expected**: Submenu expands
4. Click "Prepare Order"
5. **Expected**: Navigate to `/hims/central-stores/non-medical-store/purchase/prepare-order`

**Test Additional Menu Items**:
- Purchase → Purchase Entry
- Activities → Transfer Prep
- Masters → Group Master → Group Add
- Registers → Stock Register
- Reports → Purchase Order Status

**Pass Criteria**: ✅ All menu items navigate to correct routes

---

### Test 8: Sidebar Menu Interactions
**Purpose**: Verify menu expand/collapse functionality

1. At any store dashboard
2. Find a menu with submenus (e.g., "Purchase")
3. Click the menu item
4. **Expected**: Submenu expands with smooth transition
5. Click again
6. **Expected**: Submenu collapses
7. Click different menu
8. **Expected**: Previous menu collapses, new menu expands

**Pass Criteria**: ✅ Menu expansion/collapse works smoothly

---

### Test 9: Module ID Handling
**Purpose**: Verify dynamic module ID from navigation state

1. Open browser console
2. Navigate to `/hims/central-stores`
3. Check console logs (if logging enabled)
4. **Expected**: Module ID = 4 (from navigation state or default)
5. Verify API call uses correct module ID
6. **Expected**: `/v1/fetchSubModule/4`

**Pass Criteria**: ✅ Correct module ID used in API calls

---

### Test 10: Responsive Design
**Purpose**: Verify mobile/tablet compatibility

1. Open browser DevTools (F12)
2. Toggle device toolbar (Ctrl+Shift+M)
3. Test different screen sizes:
   - Mobile (375px)
   - Tablet (768px)
   - Desktop (1920px)
4. **Expected**: 
   - Cards stack properly on mobile
   - Sidebar responsive or collapsible
   - No horizontal scrolling
   - Text remains readable

**Pass Criteria**: ✅ UI adapts to all screen sizes

---

### Test 11: Error Handling
**Purpose**: Verify graceful error handling

**Test API Failure**:
1. Stop backend server (if running)
2. Navigate to `/hims/central-stores`
3. **Expected**: 
   - Loading state shown
   - Error message displayed
   - No application crash
4. **Console**: Error logged but handled

**Test Invalid Route**:
1. Navigate to `/hims/central-stores/invalid-route`
2. **Expected**: 
   - 404 or redirect to valid page
   - No white screen

**Pass Criteria**: ✅ Errors handled gracefully

---

### Test 12: TypeScript Compilation
**Purpose**: Verify no type errors

1. Open terminal in project root
2. Run: `npm run build` or `npm run type-check`
3. **Expected**: 
   - No TypeScript errors
   - Compilation successful
4. Check output for warnings
5. **Expected**: No critical warnings

**Pass Criteria**: ✅ Clean TypeScript compilation

---

### Test 13: Access Code Filtering
**Purpose**: Verify menu filtering based on user permissions

**Note**: Requires actual user data with access codes

1. Login with different user accounts
2. Navigate to Central Stores
3. **Expected**: 
   - Users see only menu items they have access to
   - Items without required access codes hidden
4. Check menu counts for different users
5. **Expected**: Menu items vary based on permissions

**Pass Criteria**: ✅ Access control working (if implemented)

---

### Test 14: Dashboard Metrics
**Purpose**: Verify dashboard data displays

1. At Medical Store dashboard
2. Check metric cards:
   - Total Stock
   - Pending Orders
   - Low Stock Items
   - Expired Items
3. **Expected**: 
   - Placeholder or real data shown
   - Numbers formatted correctly
   - Icons display properly

**Pass Criteria**: ✅ Dashboard metrics render correctly

---

### Test 15: Browser Compatibility
**Purpose**: Verify cross-browser support

**Test in**:
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari (if available)

**Check**:
1. All animations work
2. Gradients display correctly
3. Navigation functions
4. No console errors specific to browser

**Pass Criteria**: ✅ Works in all major browsers

---

## 📊 Test Results Template

```markdown
## Test Execution Date: [DATE]

| Test # | Test Name | Status | Notes |
|--------|-----------|--------|-------|
| 1 | Module Access | ⬜ | |
| 2 | Sub-Module API Call | ⬜ | |
| 3 | Material Design Cards | ⬜ | |
| 4 | Medical Store Navigation | ⬜ | |
| 5 | Non-Medical Store Navigation | ⬜ | |
| 6 | Menu Navigation (Medical) | ⬜ | |
| 7 | Menu Navigation (Non-Medical) | ⬜ | |
| 8 | Sidebar Menu Interactions | ⬜ | |
| 9 | Module ID Handling | ⬜ | |
| 10 | Responsive Design | ⬜ | |
| 11 | Error Handling | ⬜ | |
| 12 | TypeScript Compilation | ⬜ | |
| 13 | Access Code Filtering | ⬜ | |
| 14 | Dashboard Metrics | ⬜ | |
| 15 | Browser Compatibility | ⬜ | |

**Legend**: ✅ Pass | ❌ Fail | ⚠️ Warning | ⬜ Not Tested

**Overall Status**: [PASS/FAIL/PARTIAL]

**Issues Found**:
1. [Issue description]
2. [Issue description]
```

---

## 🚨 Common Issues & Solutions

### Issue: "Cannot read property of undefined"
**Cause**: API response structure mismatch  
**Solution**: Check API response format matches SubModuleResponse interface

### Issue: Cards not displaying gradients
**Cause**: CSS not loading or browser cache  
**Solution**: Clear browser cache, check inline styles

### Issue: Menu items not navigating
**Cause**: Route paths mismatch  
**Solution**: Verify routerPathNames structure matches menu.config.ts

### Issue: Sidebar not showing menus
**Cause**: Menu config not loading  
**Solution**: Check import paths in Sidebar.tsx

### Issue: API call returns 404
**Cause**: Backend endpoint not available  
**Solution**: Verify backend server running and endpoint exists

### Issue: TypeScript errors persist
**Cause**: Cached type definitions  
**Solution**: Restart TypeScript server (Ctrl+Shift+P → TypeScript: Restart TS Server)

---

## 📸 Visual Verification Checklist

### Sub-Module Selection Page
- [ ] Page title "Central Stores" visible
- [ ] Subtitle "Please select a store type" visible
- [ ] Loading state shows during API call
- [ ] Error message shows if API fails
- [ ] Cards display in grid (2 columns on desktop)
- [ ] Purple gradient on Medical Store card
- [ ] Pink gradient on Non-Medical Store card
- [ ] Icons centered in circular containers
- [ ] Card titles bold and white
- [ ] Card descriptions visible
- [ ] Hover animation smooth
- [ ] Shadow effect on hover

### Dashboard Pages
- [ ] Sidebar visible on left
- [ ] Sidebar has white background
- [ ] Sidebar has subtle shadow
- [ ] Main content area fills remaining space
- [ ] Header with store name visible
- [ ] Metric cards in grid layout
- [ ] Metric cards have colored borders
- [ ] Icons in metric cards visible
- [ ] Numbers formatted correctly
- [ ] Quick access section visible
- [ ] Footer visible (if applicable)

### Sidebar Menus
- [ ] Menu items have icons
- [ ] Menu items have labels
- [ ] Chevron icon indicates expandable menus
- [ ] Hover effect on menu items (background change)
- [ ] Active menu item highlighted
- [ ] Submenu items indented
- [ ] Submenu items have different styling
- [ ] Nested submenus supported
- [ ] Transition animations smooth

---

## 🎯 Performance Testing

### Page Load Time
- [ ] Initial page load < 2 seconds
- [ ] Sub-module selection page < 1 second
- [ ] Dashboard load < 1.5 seconds
- [ ] Navigation between pages < 0.5 seconds

### API Response Time
- [ ] getSubModules API < 500ms
- [ ] Dashboard data APIs < 1 second

### Animation Performance
- [ ] Card hover animation 60fps
- [ ] Menu expand animation smooth
- [ ] No lag or stuttering

### Bundle Size
- [ ] Check bundle size: `npm run build`
- [ ] Ensure reasonable bundle size
- [ ] No unnecessary dependencies

---

## ✅ Pre-Production Checklist

Before deploying to production:

- [ ] All tests pass (15/15)
- [ ] No TypeScript errors
- [ ] No console errors
- [ ] No console warnings (critical ones)
- [ ] Tested on Chrome
- [ ] Tested on Firefox
- [ ] Tested on mobile devices
- [ ] API endpoints configured correctly
- [ ] Module ID correct (4)
- [ ] Access codes configured
- [ ] Error handling implemented
- [ ] Loading states implemented
- [ ] Responsive design verified
- [ ] Accessibility checked
- [ ] Performance acceptable
- [ ] Documentation complete
- [ ] Code reviewed
- [ ] Security review done

---

**Version**: 1.0.0  
**Module**: Central Stores  
**Last Updated**: 2024
