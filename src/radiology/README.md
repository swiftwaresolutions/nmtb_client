# Radiology Module

## Overview

The Radiology module manages radiology department operations including scan orders, result entry, inventory management, and reporting.

## Module Structure

```
radiology/
├── RadiologyLayout.tsx          # Main layout wrapper with sidebar
├── README.md                     # This file
├── components/
│   ├── Sidebar.tsx              # Navigation sidebar with menu
│   └── MenuItem.tsx             # Recursive menu item component
├── config/
│   └── menu.config.ts           # Menu structure and access codes
└── pages/
    └── Dashboard.tsx            # Landing page with quick stats
```

## Features

### 1. Order Management
- Investigation Order - Create new radiology orders
- Cancel Order - Cancel existing orders

### 2. Scan Entry
- Scan Entry - Record scan details
- Scan Bold - Bold text formatting for scans
- Scan Edit - Edit existing scan records
- Angiogram Entry - Specialized angiogram recording
- Scan Report - Generate scan reports

### 3. Masters Configuration
- Page Title - Configure page titles for reports
- Main Heading - Define main report headings
- Sub Heading - Define sub headings
- Sub Main Head Mapping - Link subheadings to main headings
- Sub Head Order - Define heading order
- Scan Doctor - Manage radiologist profiles

### 4. Purchase Orders
- Prepare Orders - Create new purchase orders
- PO Approval - Approve pending orders
- Close PO - Close completed orders
- Pending PO - View pending orders
- PO Print - Print purchase orders

### 5. Usages
- Prepare Usage Note - Record material usage
- Approve Note - Approve usage notes

### 6. Receipts
- Goods Receipts - Record incoming materials

### 7. Goods Return
- GR Note Preparation - Prepare goods return notes
- GR Note Approval - Approve return notes

### 8. Registers
- Goods Receipts Register - View all receipts
- Goods Return Register - View all returns
- Usage Register - View usage history
- Goods Receipt Product Wise - Product-based receipt view
- Group Wise Goods Receipt - Group-based receipt view
- Investigation Register - View investigation history

### 9. Reports
- Inv Film Flow - Track film inventory flow
- Stock Register - Current stock levels
- Expiry Check - Check expiring items
- Expiry Products - List expired products
- Group Wise Report - Reports by product group
- Stock Report - Detailed stock report
- Group Wise Collection - Collection by group
- Scan Reports - Patient scan reports
- Scan Report Cancel - Cancel scan reports
- Angiogram Report - Angiogram-specific reports

### 10. Setup
- Inv Film (Add/Edit/Block/Unblock) - Manage inventory films
- Group (Add/Edit) - Manage product groups
- Company (Add/Edit) - Manage supplier companies
- Supplier (Add/Edit/Map/Delete) - Manage suppliers
- Material Code (Add/Edit) - Manage material codes
- Initial Stock - Set initial inventory
- Product Properties - Define product attributes
- Stock Adjustment - Adjust stock levels
- Groups Config (Add/Edit) - Configure investigation groups
- Procedures Config (Add/Edit) - Configure procedures
- Map Product - Map products to investigations

## Access Control

Menu items are controlled by access codes (1201-1270). User permissions determine which menu items are visible.

## Navigation

From the main dashboard:
1. Click the **RADIOLOGY** module card
2. Navigate to `/hims/radiology`
3. Use the sidebar to access different sections

## Development

### Adding New Pages

1. Create component in `pages/` directory
2. Add route to `routerPathNames.tsx`
3. Import and add route to `AppRouter.tsx`
4. Update `menu.config.ts` if adding new menu item

### Menu Configuration

Menu structure is defined in `config/menu.config.ts`:

```typescript
export interface MenuItemConfig {
  id: string;
  label: string;
  icon?: string;
  url?: string;
  accessCode?: number;
  submenus?: MenuItemConfig[];
}
```

### Access Code Range

Radiology module uses access codes: **1201-1270**

- 1201-1210: Order
- 1211-1220: Scan Entry
- 1221-1230: Masters
- 1231-1240: Purchase Orders
- 1241-1245: Usages
- 1246-1250: Receipts
- 1251-1255: Goods Return
- 1256-1260: Registers
- 1261-1265: Reports
- 1266-1270: Setup

## API Integration

TODO: Implement API service for:
- Fetching user menu access rights
- CRUD operations for all features
- Report generation
- Data validation

## Testing Checklist

- [ ] Navigation from dashboard to radiology module
- [ ] Sidebar menu rendering
- [ ] Menu item expansion/collapse
- [ ] Route navigation for each menu item
- [ ] Access control filtering
- [ ] Mobile responsive sidebar
- [ ] Dashboard statistics loading

## Migration Notes

This module was created from legacy `HorizontalFrames_var.js` menu structure. The original JavaScript menu configuration has been converted to TypeScript following the Medical Records module pattern.

## Next Steps

1. Create placeholder page components for each menu item
2. Implement API integration
3. Add form validation and error handling
4. Implement data tables and search functionality
5. Add print/export functionality
6. Implement access control API integration
