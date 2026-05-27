# Transfer Order & Consumable Order - Implementation Guide

## 📦 Overview
This document provides implementation details for the newly created **Transfer Order** and **Consumable Order** features in the Medical Store module.

---

## 🔄 Transfer Order System

### Purpose
Facilitate the transfer of medicines from the main medical store to various wards/departments within the hospital.

### Workflow
1. **Select Ward** → User selects destination ward/department
2. **Select Items** → User chooses medicines and quantities to transfer
3. **Submit** → Transfer order is created for approval

### Files Created

#### 1. TransferOrder.tsx
**Location:** `src/central-stores/pages/medical-store/transferOrder/TransferOrder.tsx`

**Features:**
- Professional card-based ward selection interface
- Search functionality across ward names, codes, and departments
- Filter tabs by ward type (IPD, OPD, ICU, Emergency, etc.)
- 13 pre-configured wards with color-coded categories
- Responsive grid layout
- Visual indicators with icons for each ward type

**Key Components:**
- Ward cards with hover effects
- Real-time search filtering
- Category filtering with item counts
- Color-coded ward types

#### 2. PrepareTransfer.tsx
**Location:** `src/central-stores/pages/medical-store/transferOrder/PrepareTransfer.tsx`

**Features:**
- Split-screen interface (available medicines + transfer cart)
- Medicine search by name, generic name, or batch number
- Add items to transfer list with validation
- Real-time stock validation
- Quantity input with min/max validation
- Optional remarks for each item
- Transfer summary with item count and total quantity
- Confirmation dialog before submission

**Key Components:**
- Medicines table with batch details, expiry dates, and locations
- Transfer cart panel with quantity inputs
- Real-time validation
- Responsive split view

---

## 📦 Consumable Order System

### Purpose
Create requisitions for consumable items and medical supplies (non-medicine items like surgical supplies, dressings, syringes, etc.)

### Workflow
1. **Browse Categories** → Select consumable category
2. **View Items** → See available stock with minimum level indicators
3. **Add to Order** → Select items and specify quantities
4. **Set Urgency** → Mark items as Normal, Urgent, or Emergency
5. **Submit** → Order is created for processing

### Files Created

#### 3. ConsumableOrder.tsx
**Location:** `src/central-stores/pages/medical-store/consumableOrder/ConsumableOrder.tsx`

**Features:**
- 8 consumable categories with color-coded icons:
  - Surgical Supplies
  - Dressings & Bandages
  - Syringes & Needles
  - IV Supplies
  - Laboratory Supplies
  - Protective Equipment
  - Catheters & Tubes
  - Cleaning Supplies
- Critical stock alert banner
- Filter for items below minimum stock level
- Category-based filtering
- Search functionality
- Order panel with urgency levels (Normal/Urgent/Emergency)
- Purpose/remarks field for each item
- Color-coded urgency indicators

**Key Components:**
- Category tabs with item counts
- Items table with stock status indicators
- Order items panel with urgency selection
- Critical stock highlighting
- Real-time validation

---

## 🛣️ Routes Configuration

### Added to routerPathNames.tsx

```typescript
transferOrder: {
    selectWard: "/hims/central-stores/medical-store/transfer-order/select-ward",
    prepareTransfer: "/hims/central-stores/medical-store/transfer-order/prepare-transfer"
},
consumableOrder: {
    create: "/hims/central-stores/medical-store/consumable-order/create"
}
```

### Added to AppRouter.tsx

```typescript
// Imports
import TransferOrder from "../central-stores/pages/medical-store/transferOrder/TransferOrder";
import PrepareTransfer from "../central-stores/pages/medical-store/transferOrder/PrepareTransfer";
import ConsumableOrder from "../central-stores/pages/medical-store/consumableOrder/ConsumableOrder";

// Routes
<Route path={routerPathNames.centralStores.medicalStore.transferOrder.selectWard} element={<TransferOrder />} />
<Route path={routerPathNames.centralStores.medicalStore.transferOrder.prepareTransfer} element={<PrepareTransfer />} />
<Route path={routerPathNames.centralStores.medicalStore.consumableOrder.create} element={<ConsumableOrder />} />
```

---

## 🎨 Design Principles

### Visual Design
- **Modern Card-Based UI**: Clean, professional cards with hover effects
- **Color Coding**: Different colors for categories, urgency levels, and status
- **Icons**: Font Awesome icons for visual clarity
- **Gradients**: Subtle gradients for headers and buttons
- **Responsive**: Mobile-friendly layouts with responsive grids

### User Experience
- **Progressive Flow**: Step-by-step guided workflows
- **Real-time Feedback**: Immediate validation and feedback
- **Search & Filter**: Quick access to items
- **Visual Indicators**: Color-coded status and urgency levels
- **Confirmation Dialogs**: Prevent accidental submissions
- **Loading States**: Spinner animations for data loading

### Professional Features
- **Stock Validation**: Prevents over-transfer
- **Critical Stock Alerts**: Highlights items below minimum levels
- **Batch Tracking**: Displays batch numbers and expiry dates
- **Location Tracking**: Shows rack/bin locations
- **Urgency Management**: Three-level urgency system
- **Remarks System**: Optional notes for each item

---

## 🔧 Technical Stack

### Dependencies
- React 18+
- React Router DOM (navigation)
- Redux (state management)
- SweetAlert2 (beautiful alerts)
- Font Awesome (icons)

### Key Patterns
- **Custom Hooks**: useSidebar context
- **Type Safety**: Full TypeScript interfaces
- **State Management**: Local state with useState
- **Side Effects**: useEffect for data loading and filtering
- **Conditional Rendering**: Loading states and empty states
- **Inline Styles**: Scoped CSS-in-JS for component-specific styling

---

## 📊 Data Models

### Ward Interface
```typescript
interface Ward {
  id: number;
  name: string;
  code: string;
  department: string;
  type: 'IPD' | 'OPD' | 'ICU' | 'Emergency' | 'Operation Theatre' | 'Laboratory' | 'Radiology';
  icon: string;
  color: string;
}
```

### Medicine Interface
```typescript
interface Medicine {
  id: number;
  itemName: string;
  genericName: string;
  batchNo: string;
  expiryDate: string;
  manufacturer: string;
  unit: string;
  availableQty: number;
  rackLocation: string;
  schedule: string;
}
```

### Consumable Item Interface
```typescript
interface ConsumableItem {
  id: number;
  itemName: string;
  category: string;
  unit: string;
  availableQty: number;
  minimumStockLevel: number;
  rackLocation: string;
  manufacturer: string;
  lastPurchaseDate: string;
}
```

---

## 🚀 Next Steps (API Integration)

### Transfer Order
1. Replace mock ward data with API call to fetch wards
2. Replace mock medicine data with API call to fetch available stock
3. Implement POST endpoint for transfer order submission
4. Add transfer order approval workflow

### Consumable Order
1. Replace mock category data with API call
2. Replace mock consumable data with API call
3. Implement POST endpoint for consumable order submission
4. Add order approval and fulfillment workflow
5. Implement stock level monitoring and alerts

### Additional Enhancements
1. Add print functionality for transfer orders
2. Implement barcode scanning for item selection
3. Add history/audit trail for transfers
4. Create reports for consumable usage trends
5. Add email/SMS notifications for critical stock levels

---

## 📝 Usage Examples

### Accessing Transfer Order
```typescript
navigate(routerPathNames.centralStores.medicalStore.transferOrder.selectWard, {
  state: {
    subModId: 123,
    subModName: "Transfer Order",
    modGroupId: 456,
    modGroupName: "Medical Store",
    masterId: 789
  }
});
```

### Accessing Consumable Order
```typescript
navigate(routerPathNames.centralStores.medicalStore.consumableOrder.create, {
  state: {
    subModId: 124,
    subModName: "Consumable Order",
    modGroupId: 456,
    modGroupName: "Medical Store",
    masterId: 789
  }
});
```

---

## ✅ Compliance with Medical Store Guidelines

All pages follow the **MEDICAL_STORE_DEVELOPMENT_GUIDELINES.md**:

✅ Uses pharmacy terminology (Item, Vendor, Batch, etc.)
✅ Imports commonStyle.css
✅ Shows essentials on main page, details in modals/panels
✅ Professional, clean UI design
✅ Proper error handling and validation
✅ Loading states and empty states
✅ Mobile-responsive design

---

## 📞 Support

For questions or issues with these features, refer to:
- [MEDICAL_STORE_DEVELOPMENT_GUIDELINES.md](../MEDICAL_STORE_DEVELOPMENT_GUIDELINES.md)
- Contact the development team

---

**Created:** December 2024  
**Version:** 1.0  
**Status:** ✅ Production Ready (Pending API Integration)
