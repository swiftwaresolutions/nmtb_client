# Consumable Approval Implementation

## ✅ Completed Implementation

### 1. **ApproveConsumable Component Created**
   - **Location**: `src/central-stores/pages/medical-store/consumableOrder/ApproveConsumable.tsx`
   - **Pattern**: Follows the same structure as `ApproveTransfer.tsx`
   
### 2. **Features Implemented**
   - ✅ Two-tab interface (Pending/Approved)
   - ✅ Store information from session storage
   - ✅ Pending consumables table with action buttons
   - ✅ Approved consumables table with view option
   - ✅ View Details functionality
   - ✅ Approve with confirmation dialog
   - ✅ Reject with reason input
   - ✅ Loading states and empty states
   - ✅ Responsive design with Bootstrap 5
   - ✅ Badge counters for pending/approved items
   - ✅ Sticky table headers for scrolling

### 3. **Routing Integration**
   - ✅ Added import in `AppRouter.tsx`
   - ✅ Added route for medical-store: `path="activities/consumable-approval"`
   - ✅ Added route for non-medical-store: `path="activities/consumable-approval"`
   - ✅ Routes match menu configuration (accessCode: 154)

---

## 🔄 Pending API Integration

The following API methods need to be implemented in `central-stores-api-service.tsx`:

### 1. **Fetch Pending Consumables**
```typescript
async fetchAllUnapprovedConsumables(storeId: number): Promise<PendingConsumable[]> {
  const response = await this.httpClient.get<PendingConsumable[]>(
    `v1/central-store/fetchAllUnapprovedConsumables/${storeId}`
  );
  return response.data;
}
```

**Expected Response Interface:**
```typescript
interface PendingConsumable {
  id: number;
  consumableNo: string;
  storeName: string;
  dateTimeEntry: string;
  entryUser: string;
  totalItems: number;
  totalQuantity: number;
}
```

### 2. **Fetch Approved Consumables**
```typescript
async fetchAllApprovedConsumables(storeId: number): Promise<PendingConsumable[]> {
  const response = await this.httpClient.get<PendingConsumable[]>(
    `v1/central-store/fetchAllApprovedConsumables/${storeId}`
  );
  return response.data;
}
```

### 3. **Fetch Consumable Details**
```typescript
interface ConsumableDetailsResponse {
  id: number;
  consumableNo: string;
  storeId: number;
  storeName: string;
  dateTimeEntry: string;
  entryUser: string;
  approvedBy?: string;
  approvedDate?: string;
  status: string;
  details: ConsumableItem[];
}

interface ConsumableItem {
  id: number;
  waysId: number;
  wayName: string;
  batchId: number;
  batchNo: string;
  qty: number;
  productName: string;
  expiryDate: string;
  unitPrice: number;
  mrp: number;
  tax: number;
}

async fetchConsumableDetailsById(id: number): Promise<ConsumableDetailsResponse> {
  const response = await this.httpClient.get<ConsumableDetailsResponse>(
    `v1/central-store/fetchConsumableDetailsById/${id}`
  );
  return response.data;
}
```

### 4. **Approve Consumable**
```typescript
interface ApproveConsumableResponse {
  success: boolean;
  message: string;
  consumableId: number;
}

async approveConsumable(consumableId: number, uid: number): Promise<ApproveConsumableResponse> {
  const response = await this.httpClient.post<ApproveConsumableResponse>(
    'v1/central-store/approveConsumable',
    { id: consumableId, uid }
  );
  return response.data;
}
```

### 5. **Reject Consumable**
```typescript
interface RejectConsumableRequest {
  id: number;
  uid: number;
  reason: string;
}

interface RejectConsumableResponse {
  success: boolean;
  message: string;
}

async rejectConsumable(consumableId: number, uid: number, reason: string): Promise<RejectConsumableResponse> {
  const response = await this.httpClient.post<RejectConsumableResponse>(
    'v1/central-store/rejectConsumable',
    { id: consumableId, uid, reason }
  );
  return response.data;
}
```

---

## 📝 Implementation Steps

### Step 1: Add Interfaces to API Service
Add all the interfaces above to `central-stores-api-service.tsx`:

```typescript
// Add these exports at the top with other interfaces
export interface PendingConsumable { ... }
export interface ConsumableDetailsResponse { ... }
export interface ConsumableItem { ... }
export interface ApproveConsumableResponse { ... }
export interface RejectConsumableRequest { ... }
export interface RejectConsumableResponse { ... }
```

### Step 2: Add API Methods
Add all 5 API methods to the `CentralStoresApiService` class.

### Step 3: Update ApproveConsumable.tsx
Replace the TODO comments with actual API calls:

```typescript
// In fetchPendingConsumables():
const response = await centralStoresApi.fetchAllUnapprovedConsumables(storeId);
setPendingConsumables(response);

// In fetchApprovedConsumables():
const response = await centralStoresApi.fetchAllApprovedConsumables(storeId);
setApprovedConsumables(response);

// In handleViewDetails():
const details = await centralStoresApi.fetchConsumableDetailsById(consumable.id);
// Then display details in Swal

// In handleApprove():
await centralStoresApi.approveConsumable(consumable.id, loginData.uid);

// In handleReject():
await centralStoresApi.rejectConsumable(consumable.id, loginData.uid, result.value);
```

---

## 🚀 Testing Checklist

Once APIs are implemented:

- [ ] Navigate to Consumable Approval from menu
- [ ] Verify pending consumables load correctly
- [ ] Click "View Details" and verify details display
- [ ] Test approve functionality with confirmation
- [ ] Test reject functionality with reason required
- [ ] Switch to "Approved Orders" tab
- [ ] Verify approved consumables display
- [ ] Test view details on approved consumables
- [ ] Verify store information displays correctly
- [ ] Test with both medical and non-medical stores

---

## 🎯 Component Structure

```
ApproveConsumable.tsx
├── State Management
│   ├── pendingConsumables (PendingConsumable[])
│   ├── approvedConsumables (PendingConsumable[])
│   ├── selectedConsumable (PendingConsumable | null)
│   ├── loading (boolean)
│   └── activeTab ('pending' | 'approved')
│
├── Data Fetching
│   ├── fetchPendingConsumables()
│   ├── fetchApprovedConsumables()
│   └── useEffect hooks for loading
│
├── User Actions
│   ├── handleViewDetails()
│   ├── handleApprove()
│   └── handleReject()
│
└── UI Components
    ├── PageHeader with store badge
    ├── Tab buttons (Pending/Approved)
    ├── Pending consumables table
    │   ├── View Details button
    │   ├── Approve button
    │   └── Reject button
    └── Approved consumables table
        └── View Details button
```

---

## 📋 Menu Configuration

The menu configuration in `menu.config.ts` is already set up:

```typescript
{
  id: "consumable-approval",
  name: "Approval",
  url: "activities/consumable-approval",
  icon: "fas fa-check-circle",
  accessCode: 154
}
```

---

## 🔗 Related Files

1. **Component**: `src/central-stores/pages/medical-store/consumableOrder/ApproveConsumable.tsx`
2. **Routing**: `src/routes/AppRouter.tsx`
3. **API Service**: `src/api/central-stores/central-stores-api-service.tsx` (needs updates)
4. **Menu Config**: `src/central-stores/config/menu.config.ts`
5. **Reference Pattern**: `src/central-stores/pages/medical-store/transferOrder/ApproveTransfer.tsx`

---

## 💡 Key Features

### Empty States
- Displays friendly messages when no data is available
- Different messages for pending vs approved tabs

### Loading States
- Spinner shown while loading data
- Disabled buttons during operations

### Confirmation Dialogs
- Approve: Shows consumable details before confirmation
- Reject: Requires reason input validation

### Error Handling
- Try-catch blocks on all API calls
- User-friendly error messages via Swal
- Console logging for debugging

### Responsive Design
- Sticky table headers for long lists
- Scrollable table area
- Bootstrap responsive utilities
- Button groups for compact action buttons

---

## 📌 Next Steps

1. **Backend Development**: Create the 5 API endpoints listed above
2. **Frontend Integration**: Add the API methods to `central-stores-api-service.tsx`
3. **Update Component**: Replace TODO comments with actual API calls
4. **Testing**: Follow the testing checklist
5. **Optional Enhancements**:
   - Add search/filter functionality
   - Add date range picker
   - Add export to Excel/PDF
   - Add print functionality
   - Show detailed consumable items in modal table
