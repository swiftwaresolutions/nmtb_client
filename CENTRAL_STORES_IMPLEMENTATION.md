# Central Stores Module Implementation Summary

## Overview
Successfully implemented a Central Stores module with sub-module architecture for managing Medical and Non-Medical store inventories.

## Files Created

### 1. API Service
- **File:** `src/api/central-stores/central-stores-api-service.ts`
- **Purpose:** Handles API calls to fetch sub-modules
- **Key Method:** `getSubModules(moduleId: number)` - Fetches sub-modules from `/v1/fetchSubModule/{moduleId}`

### 2. Main Layout
- **File:** `src/central-stores/CentralStoresLayout.tsx`
- **Purpose:** Main layout component that displays sub-module selection
- **Features:**
  - Fetches and displays sub-modules on mount
  - Routes to Medical Store or Non-Medical Store based on `modGroupName`
  - Passes sub-module context via React Router state
  - Shows loading state while fetching data

### 3. Dashboard Components
- **Files:** 
  - `src/central-stores/pages/MedicalStoreDashboard.tsx`
  - `src/central-stores/pages/NonMedicalStoreDashboard.tsx`
- **Features:**
  - Display key metrics (stock items, value, low stock alerts)
  - Quick action buttons
  - Sub-module information display
  - Store-specific sidebar navigation

### 4. Navigation Components
- **Files:**
  - `src/central-stores/components/Sidebar.tsx`
  - `src/central-stores/components/MenuItem.tsx`
- **Purpose:** Provides store-specific navigation menus
- **Features:**
  - Dynamic menu loading based on store type
  - Access code-based filtering
  - Collapsible sidebar
  - Mobile responsive

### 5. Menu Configuration
- **File:** `src/central-stores/config/menu.config.ts`
- **Purpose:** Defines menu structure for both store types
- **Configurations:**
  - Medical Store Menu (access codes 601-617)
  - Non-Medical Store Menu (access codes 701-716)
- **Categories:** Stock Management, Issue & Return, Purchase, Masters, Reports

## Router Updates

### Path Names (`src/routes/routerPathNames.tsx`)
Added comprehensive route definitions:
```typescript
centralStores: {
  base: "/hims/central-stores",
  medicalStore: { dashboard, stockManagement, issue, purchase, masters, reports },
  nonMedicalStore: { dashboard, stockManagement, issue, purchase, masters, reports }
}
```

### App Router (`src/routes/AppRouter.tsx`)
Added Central Stores routes:
- Base route for sub-module selection
- Medical Store dashboard route
- Non-Medical Store dashboard route
- Nested under MainLayout with AuthGuard protection

## Key Features Implemented

### 1. Sub-Module Architecture
- Unique among all modules - shows sub-module selection first
- API-driven sub-module loading
- Dynamic routing based on module group type
- State preservation across navigation

### 2. Store Differentiation
**Medical Store:**
- Icon: Pills (fas fa-pills)
- Color: Blue (#007bff)
- Focus: Pharmaceutical and medical supplies
- Additional features: Expiry tracking

**Non-Medical Store:**
- Icon: Box (fas fa-box)
- Color: Green (#28a745)
- Focus: General supplies and equipment
- Additional features: General inventory management

### 3. API Integration
Follows the existing API pattern with proper error handling:
```typescript
interface SubModuleResponse {
  modGroupId: number;
  modGroupName: string;
  subModId: number;
  subModName: string;
  masterId: number;
}
```

### 4. Access Control
- Menu items have access codes
- Access filtering system in place
- Ready for integration with user permissions API

## User Flow

1. User clicks "Central Stores" (Module ID: 6) from main dashboard
2. System calls `getSubModules(6)` API
3. API returns list of sub-modules with structure details
4. User sees cards for each sub-module (Medical Store, Non-Medical Store)
5. User clicks a sub-module card
6. System determines store type from `modGroupName` (contains "medical")
7. Routes to appropriate dashboard with sub-module context
8. Dashboard displays with store-specific sidebar menu
9. User navigates through store-specific menus

## Design Patterns Used

### 1. Component Composition
- Layout → Dashboard → Sidebar → MenuItem
- Clean separation of concerns

### 2. Context Passing
- Uses React Router state for sub-module data
- Avoids global state pollution
- Easy to test and maintain

### 3. Configuration-Driven Menus
- Menu structure defined in config file
- Easy to modify without code changes
- Supports nested menus and access control

### 4. Responsive Design
- Mobile-friendly sidebar
- Collapsible navigation
- Touch-optimized interactions

## Reference Implementation Sources

### 1. Medical Records Module
- Used as primary template for layout structure
- Sidebar and menu item patterns
- Dashboard organization

### 2. Login copy/deflect.jsp
- Sub-module selection logic
- Module ID routing patterns

### 3. Login copy/js/submenu.js
- Dynamic sub-module rendering
- Icon and color assignment logic
- Module type differentiation

### 4. Stores/Menu Structure (Old JSP)
- Horizontal frame patterns for medical/non-medical separation
- Menu organization concepts

## Technical Details

### Dependencies
- React Router v6 for routing and navigation
- Redux for global state (login data)
- FontAwesome for icons
- Bootstrap classes for styling

### TypeScript Interfaces
All components are strongly typed:
- SubModuleResponse
- SubModuleState
- MenuItemConfig
- ModuleMenuConfig
- SidebarProps
- MenuItemProps

### Error Handling
- API call error catching
- User authentication checks
- Loading states
- Empty state handling

## Testing Recommendations

1. **Sub-Module API Testing:**
   - Test with different module IDs
   - Test empty response
   - Test API errors
   - Test timeout scenarios

2. **Routing Testing:**
   - Verify all route paths work
   - Test navigation between stores
   - Test browser back/forward buttons
   - Test direct URL access

3. **Access Control Testing:**
   - Test with different access code sets
   - Verify menu filtering works
   - Test with no access codes

4. **UI Testing:**
   - Test on mobile devices
   - Test sidebar collapse/expand
   - Test menu navigation
   - Test card hover effects

## Future Enhancements

### Immediate Next Steps
1. Implement individual page components (Stock Entry, Issue, etc.)
2. Connect to actual APIs for stock data
3. Implement user permission checking
4. Add error boundaries

### Long-term Features
1. Real-time stock updates via WebSocket
2. Barcode scanning integration
3. Analytics dashboard with charts
4. Mobile app for warehouse operations
5. Batch management for medical items
6. Integration with procurement system

## Documentation Files
- `src/central-stores/README.md` - Module documentation
- `IMPLEMENTATION_SUMMARY.md` - This file

## Module ID Reference
- Module ID: 6 (STORE)
- Module Name: "Central Stores" / "STORE"
- Icon: fas fa-warehouse (as per FLOW_DOCUMENTATION.md)
- Description: Main Store with Sub-stores

## Notes
- The module follows the exact API structure specified by the user
- Sub-module detection is based on `modGroupName` containing "medical" (case-insensitive)
- All menus are placeholders ready for actual page implementation
- The structure is extensible for adding more store types in the future
