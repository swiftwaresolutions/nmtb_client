# Central Stores Module - Complete Implementation Guide

## 📋 Overview
The Central Stores module is a fully-featured inventory management system with a unique sub-module architecture that divides operations into **Medical Store** and **Non-Medical Store** categories.

## ✨ Key Features

### 🎨 Modern UI with Google Material Design
- **Gradient Card Design**: Beautiful gradient backgrounds for sub-module cards
  - Medical Store: Purple gradient (#667eea → #764ba2)
  - Non-Medical Store: Pink gradient (#f093fb → #f5576c)
- **Smooth Animations**: Hover effects with transform and shadow transitions
- **Backdrop Filters**: Glass-morphism effects for visual depth
- **Responsive Layout**: Bootstrap grid system for all screen sizes

### 🏗️ Architecture
```
Central Stores (Module ID: 4)
├── Sub-Module Selection (API-driven)
│   ├── Medical Store (modGroupName contains "medical")
│   └── Non-Medical Store (modGroupName does NOT contain "medical")
│
├── Medical Store Dashboard
│   ├── Purchase Management (11 functions)
│   ├── Activities (7 functions)
│   ├── Masters (26 functions across 11 groups)
│   ├── Registers (14 report types)
│   ├── Reports (11 analytical reports)
│   └── Setup (2 functions)
│
└── Non-Medical Store Dashboard
    ├── Purchase Management (10 functions)
    ├── Activities (5 functions)
    ├── Masters (12 functions across 6 groups)
    ├── Registers (7 report types)
    ├── Reports (4 analytical reports)
    └── Setup (2 functions)
```

## 🗂️ File Structure

```
src/
├── api/
│   └── central-stores/
│       └── central-stores-api-service.ts      # API service layer
│
├── central-stores/
│   ├── CentralStoresLayout.tsx               # Main entry point with sub-module selection
│   │
│   ├── pages/
│   │   ├── MedicalStoreDashboard.tsx         # Medical store main page
│   │   └── NonMedicalStoreDashboard.tsx      # Non-medical store main page
│   │
│   ├── components/
│   │   ├── Sidebar.tsx                       # Dynamic sidebar navigation
│   │   └── MenuItem.tsx                      # Recursive menu item component
│   │
│   ├── config/
│   │   └── menu.config.ts                    # Menu configurations for both stores
│   │
│   └── README.md                             # Module-specific documentation
│
├── routes/
│   ├── routerPathNames.tsx                   # 150+ route path definitions
│   └── AppRouter.tsx                         # Router configuration
│
└── hims-info/
    ├── config/
    │   └── modules.config.ts                 # Module link configuration
    └── SelectionArea.tsx                     # Module selection with state passing
```

## 🔄 Data Flow

### 1. Module Selection Flow
```
User clicks "Central Store" card
    ↓
SelectionArea passes moduleId in navigation state
    ↓
CentralStoresLayout receives moduleId (default: 4)
    ↓
Calls API: /v1/fetchSubModule/{moduleId}
    ↓
Receives sub-modules array
    ↓
Groups by modGroupName (medical vs non-medical)
    ↓
Displays Material Design cards for selection
```

### 2. Sub-Module Navigation Flow
```
User clicks sub-module card
    ↓
Navigate to appropriate dashboard:
    - Medical Store → /hims/central-stores/medical-store
    - Non-Medical → /hims/central-stores/non-medical-store
    ↓
Dashboard loads with:
    - Sidebar with category-specific menus
    - Dashboard metrics (Total Stock, Pending Orders, etc.)
    - Quick access cards
```

### 3. API Response Structure
```typescript
interface SubModuleResponse {
  modGroupId: number;
  modGroupName: string;
  subModId: number;
  subModName: string;
  masterId: number;
}
```

## 📊 Menu Structure

### Medical Store Menus (60+ items)

#### 1. Purchase (11 items)
- Prepare Order (141)
- Approve Order (143)
- Purchase Entry Group:
  - Purchase Entry (145)
  - Purchase Entry Approval (147)
- Goods Return Group:
  - Goods Return Prep (149)
  - Goods Return Approval (151)
- Pending Purchase Orders (153)
- Print Purchase Orders (161)
- Close Purchase Orders (167)
- Edit Purchase Orders (169)
- Merge Purchase Orders (171)

#### 2. Activities (7 items)
- Transfer Group:
  - Transfer Prep (176)
  - Transfer Approval (178)
- Consumable Group:
  - Consumable Prep (180)
  - Consumable Approval (182)
- Request Group:
  - Request Process (184)
  - Request Approval (188)
- Medicine Details (190)

#### 3. Masters (26 items across 11 groups)
- Generic Group Master
- Sub-Generic Master
- Generic Master
- Company Master
- Supplier Master
- Product Master
- Batch Master
- Product Min-Max
- Consumable Cause
- Medication
- Receiving Person Master

#### 4. Registers (14 reports)
- Stock Register (192)
- All Stock Register (194)
- Transfer Register (196)
- Goods Receipts Register (198)
- Received Request Register (200)
- And 9 more specialized registers...

#### 5. Reports (11 analytical reports)
- Expiry Date Wise Report (202)
- Expiry Between Dates (204)
- Supplier Between Dates (206)
- Supplier Monthly/Yearly (208/210)
- Transfer Details (212)
- And 5 more reports...

#### 6. Setup (2 items)
- Initial Stock Entry (476)
- Stock Adjustment (478)

### Non-Medical Store Menus (40+ items)

#### 1. Purchase (10 items)
Similar structure but without Merge PO

#### 2. Activities (5 items)
Transfer and Consumable groups, without Medicine Details

#### 3. Masters (12 items across 6 groups)
- Group Master
- Company Master
- Supplier Master
- Product Master
- Batch Master
- Consumable Cause

#### 4. Registers (7 reports)
Simplified register system

#### 5. Reports (4 analytical reports)
- Purchase Order Status (210)
- Product and Supplier (212)
- Supplier Goods Receipt (214)
- Supplier Details (216)

#### 6. Setup (2 items)
Same as Medical Store

## 🔐 Access Control

### Access Code Ranges
- **Medical Store**: 141-506
- **Non-Medical Store**: 141-212

### Implementation
```typescript
// Menu items with access codes are filtered based on user permissions
const filteredMenus = menus.map(menu => ({
  ...menu,
  submenus: menu.submenus?.filter(item => 
    !item.accessCode || userHasAccess(item.accessCode)
  )
}));
```

## 🎯 Route Definitions

### Medical Store Routes (75+ routes)
```typescript
centralStores: {
  base: "/hims/central-stores",
  medicalStore: {
    dashboard: "/hims/central-stores/medical-store",
    purchase: {
      prepareOrder: "/hims/central-stores/medical-store/purchase/prepare-order",
      approveOrder: "/hims/central-stores/medical-store/purchase/approve-order",
      // ... 9 more purchase routes
    },
    activities: {
      transferPrep: "/hims/central-stores/medical-store/activities/transfer-prep",
      // ... 6 more activity routes
    },
    masters: {
      genericGroupAdd: "/hims/central-stores/medical-store/masters/generic-group-add",
      // ... 25 more master routes
    },
    registers: {
      stock: "/hims/central-stores/medical-store/registers/stock",
      // ... 13 more register routes
    },
    reports: {
      expiryDateWise: "/hims/central-stores/medical-store/reports/expiry-date-wise",
      // ... 10 more report routes
    },
    setup: {
      initialStock: "/hims/central-stores/medical-store/setup/initial-stock",
      stockAdjustment: "/hims/central-stores/medical-store/setup/stock-adjustment"
    }
  }
}
```

### Non-Medical Store Routes (60+ routes)
Similar structure but with fewer items in each category.

## 🚀 Getting Started

### 1. Navigate to Central Stores
```
http://localhost:3000/hims/central-stores
```

### 2. API Configuration
Ensure the backend API endpoint is configured in `src/api/api-config.tsx`:
```typescript
baseURL: 'http://your-api-server:port'
```

### 3. Module ID Configuration
The module ID is passed via navigation state from `SelectionArea.tsx`:
```typescript
navigate(routerPathNames.centralStores.base, { 
  state: { moduleId: 4 } 
});
```

### 4. Test Sub-Module API
```bash
# Expected API call
GET /v1/fetchSubModule/4

# Expected response
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

## 🎨 UI Components

### Material Design Card Component
```typescript
<div
  className="card store-card h-100"
  style={{
    background: isMedical 
      ? 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      : 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    border: 'none',
    borderRadius: '15px',
    overflow: 'hidden',
    backdropFilter: 'blur(10px)',
    boxShadow: '0 8px 32px rgba(0, 0, 0, 0.1)'
  }}
  onMouseEnter={(e) => {
    e.currentTarget.style.transform = 'translateY(-8px) scale(1.02)';
    e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.2)';
  }}
  onMouseLeave={(e) => {
    e.currentTarget.style.transform = 'translateY(0) scale(1)';
    e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.1)';
  }}
>
  {/* Card content */}
</div>
```

### Sidebar Menu Component
```typescript
<Sidebar 
  moduleType={isMedical ? 'medical' : 'nonMedical'} 
  userAccessCodes={userAccessCodes}
/>
```

## 📝 Next Steps for Development

### Phase 1: Core Pages (High Priority)
1. **Purchase Order Entry Page**
   - Form for creating new purchase orders
   - Product selection with autocomplete
   - Quantity and rate input
   - Supplier selection

2. **Stock Entry Page**
   - GRN (Goods Receipt Note) entry
   - Batch details input
   - Expiry date management
   - Stock verification

3. **Transfer Order Page**
   - Inter-department transfer
   - Approval workflow
   - Transfer tracking

### Phase 2: Master Data Forms (Medium Priority)
1. **Product Master**
   - Add/Edit products
   - Category mapping
   - Unit of measurement

2. **Supplier Master**
   - Supplier registration
   - Contact management
   - Credit terms

3. **Company Master**
   - Manufacturer details
   - License information

### Phase 3: Reports & Registers (Medium Priority)
1. **Stock Register**
   - Current stock levels
   - Batch-wise stock
   - Expiry tracking

2. **Purchase Reports**
   - Order status
   - Supplier performance
   - Purchase analysis

3. **Transfer Reports**
   - Department-wise transfers
   - Pending transfers
   - Transfer history

### Phase 4: Advanced Features (Low Priority)
1. **Dashboard Analytics**
   - Real-time metrics
   - Charts and graphs
   - Trend analysis

2. **Approval Workflows**
   - Multi-level approvals
   - Email notifications
   - Approval history

3. **Integration**
   - Cash counter integration
   - Accounting integration
   - Reports export

## 🧪 Testing Checklist

- [ ] Module link works from dashboard
- [ ] Module ID passed correctly (default: 4)
- [ ] Sub-module API call successful
- [ ] Material Design cards render correctly
- [ ] Card animations work smoothly
- [ ] Navigation to Medical Store works
- [ ] Navigation to Non-Medical Store works
- [ ] Sidebar menus load correctly
- [ ] Access code filtering works
- [ ] Menu items navigate to correct routes
- [ ] Dashboard metrics display properly
- [ ] Responsive design on mobile/tablet
- [ ] TypeScript compilation successful
- [ ] No console errors

## 🐛 Troubleshooting

### Issue: TypeScript errors after changes
**Solution**: Restart TypeScript server
```
Ctrl+Shift+P → TypeScript: Restart TS Server
```

### Issue: Module link not working
**Solution**: Check modules.config.ts uses React route
```typescript
link: routerPathNames.centralStores.base
```

### Issue: Module ID incorrect
**Solution**: Verify navigation state in SelectionArea.tsx
```typescript
navigate(module.link, { state: { moduleId: module.id } });
```

### Issue: API call fails
**Solution**: Check API configuration and endpoint availability
```typescript
// In api-config.tsx
baseURL: 'http://correct-server:port'
```

### Issue: Sub-modules not categorizing correctly
**Solution**: Verify modGroupName contains "medical" for medical store
```typescript
const isMedical = groupName.toLowerCase().includes('medical');
```

## 📚 Reference Files

### Legacy System References
- **Medical Store Menu**: `Stores/Menu/HorizontalFrames_var.js`
- **Non-Medical Store Menu**: `Stores/Menu/HorizontalFrames_var_stationary.js`

### Implementation Documentation
- **Flow Documentation**: `FLOW_DOCUMENTATION.md`
- **Implementation Summary**: `IMPLEMENTATION_SUMMARY.md`
- **Medical Records Reference**: `MEDICAL_RECORDS_IMPLEMENTATION.md`
- **Central Stores README**: `src/central-stores/README.md`

## 🎉 Features Implemented

✅ Sub-module architecture with API integration  
✅ Dynamic sub-module loading based on API response  
✅ Category-based routing (medical vs non-medical)  
✅ Google Material Design card implementation  
✅ Gradient backgrounds with smooth animations  
✅ Comprehensive menu structures (100+ menu items)  
✅ 150+ route path definitions  
✅ Access code-based filtering  
✅ Recursive menu component with nested submenus  
✅ Dashboard layouts with metrics  
✅ Sidebar navigation  
✅ Module link configuration  
✅ Dynamic module ID handling  
✅ TypeScript type safety  
✅ Responsive Bootstrap layouts  

## 📞 Support

For issues or questions:
1. Check this documentation
2. Review reference implementation in Medical Records module
3. Check console for error messages
4. Verify API responses in Network tab
5. Restart TypeScript server if type errors persist

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Module ID**: 4  
**Access Codes**: Medical (141-506), Non-Medical (141-212)
