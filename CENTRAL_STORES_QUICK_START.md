# Central Stores Module - Quick Start Guide

## Overview
The Central Stores module is now implemented and ready for use. This guide will help you understand how to access and use the module.

## Accessing the Module

### From Main Dashboard
1. Log in to the HIMS application
2. Click on the "Central Stores" module card (Module ID: 6)
3. The system will fetch available sub-modules from the API
4. Select either "Medical Store" or "Non-Medical Store"

## Module Structure

```
Central Stores (Main Entry)
│
├── Medical Store Sub-Module
│   ├── Stock Management
│   │   ├── Stock Entry
│   │   ├── Stock Adjustment
│   │   ├── Stock Transfer
│   │   └── View Stock
│   │
│   ├── Issue & Return
│   │   ├── Issue to Department
│   │   ├── Stock Return
│   │   └── Issue History
│   │
│   ├── Purchase
│   │   ├── Purchase Order
│   │   ├── Goods Receipt Note (GRN)
│   │   └── Supplier Management
│   │
│   ├── Masters
│   │   ├── Item Master
│   │   ├── Category Master
│   │   └── Unit Master
│   │
│   └── Reports
│       ├── Stock Report
│       ├── Expiry Report
│       ├── Consumption Report
│       └── Purchase Report
│
└── Non-Medical Store Sub-Module
    ├── Stock Management
    ├── Issue & Return
    ├── Purchase
    ├── Masters
    └── Reports
```

## API Configuration

### Required API Endpoint
The module requires the following API endpoint to be implemented:

**Endpoint:** `GET /v1/fetchSubModule/{moduleId}`

**Request:**
- Method: GET
- Path Parameter: `moduleId` (use 6 for Central Stores)

**Expected Response:**
```json
[
  {
    "modGroupId": 1,
    "modGroupName": "Medical Store",
    "subModId": 101,
    "subModName": "Main Medical Store",
    "masterId": 1
  },
  {
    "modGroupId": 2,
    "modGroupName": "Non-Medical Store",
    "subModId": 102,
    "subModName": "General Store",
    "masterId": 2
  }
]
```

### Important Notes:
- The `modGroupName` field determines routing:
  - If it contains "medical" (case-insensitive) → routes to Medical Store
  - Otherwise → routes to Non-Medical Store
- Multiple sub-modules can be returned for each type
- Each sub-module can have its own unique configuration

## URL Structure

### Direct URLs
You can access stores directly using these URLs:

- **Central Stores Landing:** `/hims/central-stores`
- **Medical Store:** `/hims/central-stores/medical-store`
- **Non-Medical Store:** `/hims/central-stores/non-medical-store`

### Example Feature URLs (Medical Store)
- Stock Entry: `/hims/central-stores/medical-store/stock-management/entry`
- Issue to Dept: `/hims/central-stores/medical-store/issue/department`
- Purchase Order: `/hims/central-stores/medical-store/purchase/order`
- Item Master: `/hims/central-stores/medical-store/masters/item`
- Stock Report: `/hims/central-stores/medical-store/reports/stock`

## User Permissions

### Access Codes

**Medical Store (600 series):**
- 601-604: Stock Management
- 605-607: Issue & Return
- 608-610: Purchase
- 611-613: Masters
- 614-617: Reports

**Non-Medical Store (700 series):**
- 701-704: Stock Management
- 705-707: Issue & Return
- 708-710: Purchase
- 711-713: Masters
- 714-716: Reports

### Setting Up Access
To grant users access to specific features:
1. Assign appropriate access codes to user roles
2. The system will automatically filter menus based on user permissions
3. Menu items without access codes are always visible (parent containers)

## Development Guide

### Adding New Pages

1. **Create Page Component:**
```typescript
// src/central-stores/pages/medical-store/StockEntry.tsx
import React from 'react';
import { useLocation } from 'react-router-dom';

const StockEntry: React.FC = () => {
  const location = useLocation();
  const subModuleData = location.state;
  
  return (
    <div className="stock-entry-page">
      <h2>Stock Entry - {subModuleData?.subModName}</h2>
      {/* Your form/content here */}
    </div>
  );
};

export default StockEntry;
```

2. **Import in AppRouter:**
```typescript
import StockEntry from "../central-stores/pages/medical-store/StockEntry";
```

3. **Add Route:**
```typescript
<Route 
  path={routerPathNames.centralStores.medicalStore.stockManagement.entry} 
  element={<StockEntry />} 
/>
```

### Adding New Menu Items

1. **Edit Menu Config:**
```typescript
// src/central-stores/config/menu.config.ts
{
  id: "new-feature",
  name: "New Feature",
  url: routerPathNames.centralStores.medicalStore.newFeature,
  icon: "fas fa-star",
  accessCode: 618
}
```

2. **Add Route Path:**
```typescript
// src/routes/routerPathNames.tsx
medicalStore: {
  // ... existing paths
  newFeature: "/hims/central-stores/medical-store/new-feature"
}
```

### Creating API Services

```typescript
// src/api/central-stores/central-stores-api-service.ts
export class CentralStoresApiService {
  // ... existing methods
  
  public getStockItems = async (subModId: number) => {
    try {
      let url = `/v1/stock/items/${subModId}`;
      const response: any = await this.httpWrapper.get(url);
      return response;
    } catch (error: any) {
      throw error;
    }
  }
}
```

## Testing

### Manual Testing Checklist

1. **Module Access:**
   - [ ] Can access Central Stores from main dashboard
   - [ ] Sub-modules load correctly
   - [ ] Can select Medical Store
   - [ ] Can select Non-Medical Store

2. **Navigation:**
   - [ ] Sidebar menus display correctly
   - [ ] Can navigate between menu items
   - [ ] Browser back/forward works
   - [ ] Direct URL access works

3. **Responsive Design:**
   - [ ] Works on desktop
   - [ ] Works on tablet
   - [ ] Works on mobile
   - [ ] Sidebar collapses on mobile

4. **State Management:**
   - [ ] Sub-module context is preserved
   - [ ] Can refresh page without errors
   - [ ] Login state is checked properly

## Troubleshooting

### Sub-modules not loading
- Check API endpoint is available
- Verify API returns correct JSON structure
- Check browser console for errors
- Verify moduleId is correct (should be 6)

### Menu items not showing
- Check access codes are assigned to user
- Verify menu.config.ts has correct structure
- Check browser console for errors

### Routing issues
- Verify routerPathNames.tsx has all paths
- Check AppRouter.tsx has corresponding routes
- Ensure nested routes are under correct parent

### TypeScript errors
- Run `npm run build` to see all compile errors
- Check import paths are correct
- Verify all interfaces match expected data

## Support

For issues or questions:
1. Check `src/central-stores/README.md` for detailed documentation
2. Review `CENTRAL_STORES_IMPLEMENTATION.md` for implementation details
3. Check similar patterns in Medical Records module
4. Contact development team

## Next Steps

After testing the basic structure:
1. Implement individual page components
2. Connect to real APIs for data
3. Add form validation
4. Implement data tables
5. Add export functionality
6. Create print templates
7. Add analytics and reporting
