# Central Stores Module

## Overview
The Central Stores module manages inventory for both medical and non-medical supplies. Unlike other modules, it features a sub-module architecture where users select between Medical Store and Non-Medical Store upon entering the module.

## Module Structure

```
central-stores/
├── CentralStoresLayout.tsx          # Main layout with sub-module selection
├── components/
│   ├── Sidebar.tsx                  # Store-specific sidebar navigation
│   └── MenuItem.tsx                 # Menu item component
├── config/
│   └── menu.config.ts               # Menu configurations for both stores
├── pages/
│   ├── MedicalStoreDashboard.tsx    # Medical store dashboard
│   └── NonMedicalStoreDashboard.tsx # Non-medical store dashboard
└── README.md                         # This file
```

## Features

### Sub-Module Architecture
- When clicking the Central Stores module (Module ID: 6), the system:
  1. Calls the `getSubModules` API with the module ID
  2. Displays available sub-modules based on the API response
  3. Routes to the appropriate store layout when a sub-module is selected

### API Integration

#### Sub-Module API
**Endpoint:** `/v1/fetchSubModule/{moduleId}`

**Response Structure:**
```typescript
[
  {
    modGroupId: number;      // Module group identifier
    modGroupName: string;    // "Medical" or "Non-Medical"
    subModId: number;        // Sub-module identifier
    subModName: string;      // Sub-module display name
    masterId: number;        // Master record ID
  }
]
```

### Store Types

#### 1. Medical Store
- Manages pharmaceutical and medical supplies
- Features: Stock entry, issue to departments, purchase orders, expiry tracking
- Icon: Pills (fas fa-pills)
- Color Theme: Blue (#007bff)

#### 2. Non-Medical Store
- Manages non-medical supplies and equipment
- Features: Stock management, purchase orders, consumption tracking
- Icon: Box (fas fa-box)
- Color Theme: Green (#28a745)

## Routes

### Base Routes
- `/hims/central-stores` - Sub-module selection screen
- `/hims/central-stores/medical-store` - Medical store dashboard
- `/hims/central-stores/non-medical-store` - Non-medical store dashboard

### Medical Store Routes
- **Stock Management:**
  - `/hims/central-stores/medical-store/stock-management/entry`
  - `/hims/central-stores/medical-store/stock-management/adjustment`
  - `/hims/central-stores/medical-store/stock-management/transfer`
  - `/hims/central-stores/medical-store/stock-management/view`

- **Issue & Return:**
  - `/hims/central-stores/medical-store/issue/department`
  - `/hims/central-stores/medical-store/issue/return`
  - `/hims/central-stores/medical-store/issue/history`

- **Purchase:**
  - `/hims/central-stores/medical-store/purchase/order`
  - `/hims/central-stores/medical-store/purchase/grn`
  - `/hims/central-stores/medical-store/purchase/supplier`

- **Masters:**
  - `/hims/central-stores/medical-store/masters/item`
  - `/hims/central-stores/medical-store/masters/category`
  - `/hims/central-stores/medical-store/masters/unit`

- **Reports:**
  - `/hims/central-stores/medical-store/reports/stock`
  - `/hims/central-stores/medical-store/reports/expiry`
  - `/hims/central-stores/medical-store/reports/consumption`
  - `/hims/central-stores/medical-store/reports/purchase`

### Non-Medical Store Routes
Similar structure to Medical Store with same menu categories.

## Menu Configuration

### Access Control
Each menu item has an `accessCode` property that determines user access:
- Medical Store: Access codes 601-617
- Non-Medical Store: Access codes 701-716

### Menu Categories
Both stores include the following menu categories:
1. **Stock Management** - Entry, adjustment, transfer, and viewing
2. **Issue & Return** - Department issues, returns, and history
3. **Purchase** - Purchase orders, GRN, supplier management
4. **Masters** - Item, category, and unit masters
5. **Reports** - Various inventory and consumption reports

## Implementation Details

### CentralStoresLayout Component
- Fetches sub-modules on mount using `CentralStoresApiService`
- Displays sub-module selection cards at base route
- Routes to appropriate dashboard based on `modGroupName`
- Passes sub-module context via React Router state

### Dashboard Components
- Display key metrics (stock items, value, low stock, etc.)
- Quick action buttons for common tasks
- Sub-module information display
- Store-specific sidebar navigation

### State Management
Sub-module information is passed through React Router state:
```typescript
{
  subModId: number;
  subModName: string;
  modGroupId: number;
  modGroupName: string;
  masterId: number;
}
```

## Reference Implementation

The module follows patterns from:
- **Medical Records Module** - Layout and routing structure
- **Login.jsp & deflect.jsp** - Sub-module selection logic
- **submenu.js** - Dynamic sub-module rendering
- **Stores/Menu** - Horizontal frame patterns for medical/non-medical separation

## Usage

1. User clicks "Central Stores" module from main dashboard
2. System fetches sub-modules via `getSubModules(6)` API
3. User sees available sub-modules (e.g., "Medical Store", "Non-Medical Store")
4. User selects a sub-module
5. System routes to appropriate store dashboard with context
6. Store-specific sidebar menu loads based on `moduleType`

## Future Enhancements

- [ ] Implement individual menu pages (stock entry, issue, etc.)
- [ ] Add real-time stock updates via WebSocket
- [ ] Implement barcode scanning for stock management
- [ ] Add analytics dashboard with charts
- [ ] Implement batch management for medical items
- [ ] Add mobile-responsive views for warehouse operations

## API Services

### CentralStoresApiService
Located in `src/api/central-stores/central-stores-api-service.ts`

**Methods:**
- `getSubModules(moduleId: number)` - Fetches sub-modules for Central Stores

Additional service methods should be added as features are implemented.
