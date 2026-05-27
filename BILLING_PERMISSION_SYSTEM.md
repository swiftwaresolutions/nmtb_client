# Billing Permission System Implementation

## Overview

This document explains the role-based permission system implemented in the billing module. The system controls which billing tabs users can access based on their permissions retrieved from the `fetchModuleForUser` API.

## Permission Structure

### Menu IDs
Each billing type is associated with a specific menu ID:
- **586**: Procedure/Investigation Billing
- **587**: Pharmacy Billing
- **588**: Lab Billing
- **589**: IP (In-Patient) Billing

### API Response Structure
Permissions are stored in Redux at `state.appReducer.moduleDetails` with the following hierarchy:
```typescript
Module[] {
  moduleId: number;
  moduleName: string;
  submodule: SubModule[];
}

SubModule {
  submoduleId: number;
  submoduleName: string;
  menuHeader: MenuHeader[];
}

MenuHeader {
  headerId: number;
  headerName: string;
  menuIds: number[]; // Contains billing permission IDs (586-589)
}
```

## Implementation Details

### 1. Permission Utility (`src/utils/permissionUtil.ts`)

Created a centralized utility for checking billing permissions:

```typescript
export const BILLING_MENU_IDS = {
  PROCEDURE: 586,
  PHARMACY: 587,
  LAB: 588,
  IP: 589,
} as const;

export interface BillingTabPermissions {
  hasProcedureAccess: boolean;
  hasPharmacyAccess: boolean;
  hasLabAccess: boolean;
  hasIPAccess: boolean;
}

// Traverse module tree to find menuId
export function hasMenuPermission(modules: Module[], menuId: number): boolean;

// Check all billing permissions at once
export function getBillingTabPermissions(modules: Module[]): BillingTabPermissions;
```

### 2. BillingRedesigned.tsx

Main billing component updated with permission-based rendering:

#### Permission State Management
```typescript
import { getBillingTabPermissions } from '../../utils/permissionUtil';

const permissions = useMemo(() => 
  getBillingTabPermissions(moduleDetails), 
  [moduleDetails]
);
```

#### Initial Tab Selection
```typescript
useEffect(() => {
  if (permissions.hasProcedureAccess) {
    setBillingType('procedure');
  } else if (permissions.hasPharmacyAccess) {
    setBillingType('pharmacy');
  } else if (permissions.hasLabAccess) {
    setBillingType('lab');
  } else if (permissions.hasIPAccess) {
    setBillingType('ip');
  }
}, [permissions]);
```

#### Tab Button Filtering
```typescript
const tabButtons = [
  { type: 'procedure', icon: FaStethoscope, label: 'Procedure', hasAccess: permissions.hasProcedureAccess },
  { type: 'pharmacy', icon: FaPills, label: 'Pharmacy', hasAccess: permissions.hasPharmacyAccess },
  { type: 'lab', icon: FaFlask, label: 'Lab', hasAccess: permissions.hasLabAccess },
  { type: 'ip', icon: FaBed, label: 'IP', hasAccess: permissions.hasIPAccess },
].filter(tab => tab.hasAccess);
```

#### Tab Component Rendering
Each billing tab is conditionally rendered based on permissions:

```typescript
{billingType === 'procedure' && permissions.hasProcedureAccess && (
  <ProcedureBilling {...props} permissions={permissions} />
)}

{billingType === 'pharmacy' && permissions.hasPharmacyAccess && (
  <PharmacyBilling {...props} permissions={permissions} />
)}

{billingType === 'lab' && permissions.hasLabAccess && (
  <LabBilling {...props} permissions={permissions} />
)}

{billingType === 'ip' && permissions.hasIPAccess && (
  <IPBilling {...props} permissions={permissions} />
)}
```

#### Reset Form Logic
Updated to respect permissions when resetting:

```typescript
const handleResetForm = () => {
  // Set billing type to first permitted tab
  if (permissions.hasProcedureAccess) {
    setBillingType('procedure');
  } else if (permissions.hasPharmacyAccess) {
    setBillingType('pharmacy');
  } else if (permissions.hasLabAccess) {
    setBillingType('lab');
  } else if (permissions.hasIPAccess) {
    setBillingType('ip');
  }
  // ... rest of reset logic
};
```

### 3. OrderModal.tsx

Order modal updated to filter orders based on permissions:

#### Interface Update
```typescript
export interface BillingPermissions {
  hasProcedureAccess: boolean;
  hasPharmacyAccess: boolean;
  hasLabAccess: boolean;
  hasIPAccess: boolean;
}

interface OrderModalProps {
  // ... existing props
  permissions?: BillingPermissions;
}
```

#### Default Permissions
```typescript
const OrderModal: React.FC<OrderModalProps> = ({ 
  // ... other props
  permissions = { 
    hasProcedureAccess: true, 
    hasPharmacyAccess: true, 
    hasLabAccess: true, 
    hasIPAccess: true 
  }
}) => {
```

#### Load All Buttons Filtering
```typescript
{permissions.hasProcedureAccess && filteredOrders?.investigationOrders?.length > 0 && (
  <Button onClick={handleLoadAllInvestigationOrders}>
    Load All Procedure Orders
  </Button>
)}

{permissions.hasLabAccess && filteredOrders?.labOrders?.length > 0 && (
  <Button onClick={handleLoadAllLabOrders}>
    Load All Lab Orders
  </Button>
)}

{permissions.hasPharmacyAccess && filteredOrders?.pharmacyOrders?.length > 0 && (
  <Button onClick={handleLoadAllPharmacyOrders}>
    Load All Pharmacy Orders
  </Button>
)}
```

#### Order Section Rendering
```typescript
const renderInvestigationOrders = () => {
  if (!permissions.hasProcedureAccess) return null;
  // ... render logic
};

const renderLabOrders = () => {
  if (!permissions.hasLabAccess) return null;
  // ... render logic
};

const renderPharmacyOrders = () => {
  if (!permissions.hasPharmacyAccess) return null;
  // ... render logic
};
```

### 4. Individual Billing Components

All billing components updated to accept and pass permissions:

#### ProcedureBilling.tsx
```typescript
import { BillingPermissions } from '../modals/OrderModal';

interface ProcedureBillingProps {
  // ... existing props
  permissions?: BillingPermissions;
}

const ProcedureBilling: React.FC<ProcedureBillingProps> = ({
  // ... other props
  permissions,
}) => {
  // ...
  <OrderModal
    // ... other props
    permissions={permissions}
  />
};
```

#### PharmacyBilling.tsx
```typescript
import { BillingPermissions } from '../modals/OrderModal';

interface PharmacyBillingProps {
  // ... existing props
  permissions?: BillingPermissions;
}

const PharmacyBilling: React.FC<PharmacyBillingProps> = ({
  // ... other props
  permissions,
}) => {
  // ...
  <OrderModal
    // ... other props
    permissions={permissions}
  />
};
```

#### LabBilling.tsx
```typescript
import { BillingPermissions } from '../modals/OrderModal';

interface LabBillingProps {
  // ... existing props
  permissions?: BillingPermissions;
}

const LabBilling: React.FC<LabBillingProps> = ({
  // ... other props
  permissions,
}) => {
  // ...
  <OrderModal
    // ... other props
    permissions={permissions}
  />
};
```

### 5. Due Bills Modal (Collect Outstanding Dues)

The "Collect Outstanding Dues" modal filters dues based on user permissions:

#### Permission Filtering in fetchDueBills()
```typescript
const fetchDueBills = async (patId: number, lastVisitId: number) => {
  const response = await cashCounterApi.fetchDueDetails(patId);
  
  const mappedDueBills = (response || []).map((item: any) => {
    let billNo = '';
    let type: 'procedure' | 'lab' | 'pharmacy' | 'ip' | null = null;
    
    // Determine type based on which bill number field is populated
    if (item.invBillNo && item.invBillNo !== '-') {
      billNo = item.invBillNo;
      type = 'procedure';
    } else if (item.labBillNo && item.labBillNo !== '-') {
      billNo = item.labBillNo;
      type = 'lab';
    } else if (item.phBillNo && item.phBillNo !== '-') {
      billNo = item.phBillNo;
      type = 'pharmacy';
    } else if (item.ipBillNo && item.ipBillNo !== '-') {
      billNo = item.ipBillNo;
      type = 'ip';
    }
    
    return {
      id: item.id,
      date: item.dateTime || '',
      billNo: billNo,
      amount: item.due || 0,
      balance: item.due || 0,
      type: type,
    };
  });

  // Filter dues based on permissions
  const filteredDueBills = mappedDueBills.filter((bill: any) => {
    if (bill.type === 'procedure') return permissions.hasProcedureAccess;
    if (bill.type === 'pharmacy') return permissions.hasPharmacyAccess;
    if (bill.type === 'lab') return permissions.hasLabAccess;
    if (bill.type === 'ip') return permissions.hasIPAccess;
    return false;
  });

  setDueBills(filteredDueBills);
};
```

#### Type Badge Display in DueBillsModal
Each due bill now displays a colored badge indicating its type:
- **Procedure**: Blue badge (`bg-primary`)
- **Pharmacy**: Green badge (`bg-success`)
- **Lab**: Cyan badge (`bg-info`)
- **IP**: Yellow badge (`bg-warning`)

```typescript
<td>
  {bill.type === 'procedure' && <Badge bg="primary">Procedure</Badge>}
  {bill.type === 'pharmacy' && <Badge bg="success">Pharmacy</Badge>}
  {bill.type === 'lab' && <Badge bg="info">Lab</Badge>}
  {bill.type === 'ip' && <Badge bg="warning" text="dark">IP</Badge>}
</td>
```

#### Benefits
- Users only see dues they have permission to collect
- Clear visual indication of due type
- Prevents unauthorized payment collection
- Consistent with tab-level permissions

## Permission Flow

```
1. User logs in
   ↓
2. fetchModuleForUser API returns moduleDetails
   ↓
3. moduleDetails stored in Redux (state.appReducer.moduleDetails)
   ↓
4. BillingRedesigned reads moduleDetails from Redux
   ↓
5. getBillingTabPermissions() processes moduleDetails
   ↓
6. Permissions object created with hasProcedureAccess, etc.
   ↓
7. Tab buttons filtered based on permissions
   ↓
8. Initial billing type set to first permitted tab
   ↓
9. Tab components receive permissions prop
   ↓
10. OrderModal receives permissions and filters orders
   ↓
11. fetchDueBills() filters outstanding dues by permission
   ↓
12. DueBillsModal displays only permitted dues with type badges
```

## Benefits

1. **Centralized Control**: Single source of truth for permissions in Redux
2. **Reusable Pattern**: `permissionUtil.ts` can be extended for other modules
3. **Type Safety**: TypeScript interfaces ensure type checking
4. **Graceful Handling**: Default permissions prevent breaking if prop missing
5. **Consistent UX**: Tabs/buttons seamlessly hide for unauthorized users
6. **Order Filtering**: Order modal respects permissions for bulk loading
7. **Reset Safety**: Form reset respects permissions when selecting default tab
8. **Due Bills Filtering**: Outstanding dues modal shows only permitted billing types
9. **Visual Clarity**: Type badges in due bills help users identify billing category

## Testing Scenarios

### Test Case 1: User with All Permissions
- **User has**: menuIds [586, 587, 588, 589]
- **Expected**: 
  - All 4 tabs visible
  - All order types in modal
  - Default tab = Procedure
  - Due Bills modal shows all types (Procedure, Pharmacy, Lab, IP) with colored badges

### Test Case 2: User with Only Lab Access
- **User has**: menuId [588]
- **Expected**: 
  - Only Lab tab visible
  - Only lab orders in Order modal
  - Default tab = Lab
  - Due Bills modal shows only Lab dues (cyan badges)

### Test Case 3: User with Pharmacy + Lab Access
- **User has**: menuIds [587, 588]
- **Expected**: 
  - Only Pharmacy and Lab tabs visible
  - No procedure orders in modal
  - Default tab = Pharmacy
  - Due Bills modal shows only Pharmacy (green) and Lab (cyan) dues

### Test Case 4: User with No Billing Access
- **User has**: menuIds []
- **Expected**: 
  - All tabs hidden
  - Order modal empty (but won't crash due to defaults)
  - Due Bills modal shows no dues

### Test Case 5: Order Modal from Lab Tab
- **Active Tab**: Lab
- **User has**: menuIds [586, 587, 588]
- **Expected**: Lab orders appear first, then procedure, then pharmacy orders

### Test Case 6: Pharmacy User Collecting Dues
- **User has**: menuId [587]
- **Patient has**: ₹500 procedure due, ₹300 pharmacy due, ₹200 lab due
- **Expected**: 
  - Only Pharmacy tab visible
  - Due Bills modal shows only ₹300 pharmacy due with green badge
  - Cannot see or collect procedure/lab dues

## Future Enhancements

1. **Permission Messages**: Display message when user has no billing access
2. **Audit Logging**: Track permission-based access attempts
3. **Dynamic Menu IDs**: Load BILLING_MENU_IDS from config/API instead of hardcoded
4. **Sub-Module Permissions**: Granular control (e.g., can add but not delete)
5. **Time-Based Permissions**: Different permissions for different shifts/times

## Migration Notes

If upgrading from a previous version:

1. No database changes required (uses existing moduleDetails)
2. No API changes required (uses existing fetchModuleForUser)
3. Components remain backward compatible (permissions prop is optional)
4. Users without proper permissions will see limited UI (no errors)

## Files Modified

- `src/utils/permissionUtil.ts` (NEW)
- `src/cash-counter/pages/billing-sample/BillingRedesigned.tsx`
- `src/cash-counter/pages/billing-sample/modals/OrderModal.tsx`
- `src/cash-counter/pages/billing-sample/tabs/ProcedureBilling.tsx`
- `src/cash-counter/pages/billing-sample/tabs/PharmacyBilling.tsx`
- `src/cash-counter/pages/billing-sample/tabs/LabBilling.tsx`

## Related Documentation

- [src/utils/ALERT_UTILITY_GUIDE.md](src/utils/ALERT_UTILITY_GUIDE.md)
- [src/SEARCH_PATTERN_GUIDE.md](src/SEARCH_PATTERN_GUIDE.md)
- [.github/copilot-instructions.md](.github/copilot-instructions.md)
