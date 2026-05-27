# Purchase Entry Save & Confirm Implementation

## Overview
Modified the Purchase Entry page to have two separate actions:
1. **Save** - Allows saving purchase entry without requiring invoice number (optional)
2. **Confirm** - Requires invoice number and finalizes the purchase entry

## Changes Made

### 1. API Service Updates (`central-stores-api-service.tsx`)

#### Added Interfaces:
```typescript
// New interface for confirm purchase entry detail
export interface ConfirmPurchaseEntryDetail {
  preGoodsId: number;
  prodsId: number;
  batchNo: string;
  expiryDate: string;
  qty: number;
  pack: number;
  freeQty: number;
  freePack: number;
  taxOnFree: number;
  cost: number;
  mrp: number;
  salesPrice: number;
  unitPrice: number;
  disc: number;
  discPer: number;
  discWithoutTaxPer: number;
  discWithoutTaxAmt: number;
  sgstPer: number;
  cgstPer: number;
  igstPer: number;
  sgstAmt: number;
  cgstAmt: number;
  igstAmt: number;
  tax: number;
  taxAmt: number;
  taxType: number;
  mrpVatAmt: number;
  totalAmt: number;
  netAmt: number;
  poDetId: number;
  hsnCode: string;
}

// New interface for confirm purchase entry request
export interface ConfirmPurchaseEntryRequest {
  orderId: number;
  confirmingUserId: number;
  invoiceNo: string;
  invoiceDate: string;
  dealId: number;
  storeId: number;
  remark: string;
  total: number;
  net: number;
  details: ConfirmPurchaseEntryDetail[];
}
```

#### Added API Method:
```typescript
public confirmPurchaseEntry = async (data: ConfirmPurchaseEntryRequest): Promise<any> => {
  try {
    const response = await this.httpClient.post('v1/central-store/confirmPurchaseEntry', data);
    return response;
  } catch (error) {
    console.error('Error confirming purchase entry:', error);
    throw error;
  }
};
```

### 2. PurchaseEntry.tsx Updates

#### Modified `handleSubmitEntry` Function (Save Operation):
- **Removed invoice number validation** - Invoice is now optional for Save
- Updated confirmation dialog title to "Save Purchase Entry?"
- Changed button text from "Submit" to "Save"
- Shows "Not provided" if invoice number is empty

Key Changes:
```typescript
// Before:
if (!invoiceNo || !invoiceDate) {
  Swal.fire('Validation Error', 'Please fill invoice details', 'error');
  return;
}

// After:
// Invoice number is optional for Save operation
```

#### Added `handleConfirmEntry` Function (Confirm Operation):
- **Requires invoice number and date** - Validation enforced
- Transforms data to `ConfirmPurchaseEntryRequest` format
- Calls new `confirmPurchaseEntry` API endpoint
- Shows detailed confirmation dialog with invoice details

Key Features:
```typescript
// Validation - Invoice IS REQUIRED for Confirm
if (!invoiceNo || !invoiceDate) {
  Swal.fire('Validation Error', 'Invoice number and date are required for confirmation', 'error');
  return;
}

// Data transformation to ConfirmPurchaseEntryDetail format
const confirmEntryDetails = purchaseItems.map(item => ({
  preGoodsId: item.preGoodsId || 0,
  prodsId: item.prodId,
  batchNo: item.batchNo,
  expiryDate: item.expiryDate,
  // ... all required fields
}));

// API call
const response = await centralStoresApi.confirmPurchaseEntry(confirmData);
```

#### UI Changes:
```tsx
{/* Save Button - Icon changed to save */}
<Button 
  variant="success"
  className="flex-fill"
  onClick={handleSubmitEntry}
  disabled={purchaseItems.length === 0 || !selectedVendor}
>
  <i className="fas fa-save me-2"></i>
  Save
</Button>

{/* New Confirm Button */}
<Button 
  variant="primary"
  className="flex-fill"
  onClick={handleConfirmEntry}
  disabled={purchaseItems.length === 0 || !selectedVendor}
>
  <i className="fas fa-check-double me-2"></i>
  Confirm
</Button>
```

## User Workflow

### Save Flow (Invoice Optional):
1. User fills in purchase entry details
2. Invoice number is **optional**
3. Clicks "Save" button
4. Confirmation dialog shows:
   - Vendor name
   - Invoice No (shows "Not provided" if empty)
   - Total items
   - Grand total
5. Data saved with existing `savePurchaseEntry` API

### Confirm Flow (Invoice Required):
1. User fills in purchase entry details
2. Invoice number and date are **mandatory**
3. Clicks "Confirm" button
4. Validation ensures invoice details are present
5. Confirmation dialog shows:
   - Vendor name
   - Invoice No
   - Invoice Date
   - Total items
   - Grand total
   - Warning message: "This action will finalize the purchase entry"
6. Data sent to new `confirmPurchaseEntry` API endpoint

## API Endpoint

### POST `/api/v1/central-store/confirmPurchaseEntry`

**Request Body:**
```json
{
  "orderId": 123,
  "confirmingUserId": 45,
  "invoiceNo": "INV-2024-001",
  "invoiceDate": "2024-01-15",
  "dealId": 67,
  "storeId": 89,
  "remark": "Additional notes",
  "total": 50000.00,
  "net": 48500.00,
  "details": [
    {
      "preGoodsId": 1,
      "prodsId": 101,
      "batchNo": "BATCH001",
      "expiryDate": "2025-12-31",
      "qty": 100,
      "pack": 10,
      "freeQty": 5,
      "freePack": 0,
      "taxOnFree": 1,
      "cost": 450.00,
      "mrp": 500.00,
      "salesPrice": 480.00,
      "unitPrice": 45.00,
      "disc": 50.00,
      "discPer": 10.00,
      "discWithoutTaxPer": 8.00,
      "discWithoutTaxAmt": 40.00,
      "sgstPer": 6.00,
      "cgstPer": 6.00,
      "igstPer": 0.00,
      "sgstAmt": 27.00,
      "cgstAmt": 27.00,
      "igstAmt": 0.00,
      "tax": 12.00,
      "taxAmt": 54.00,
      "taxType": 1,
      "mrpVatAmt": 30.00,
      "totalAmt": 500.00,
      "netAmt": 485.00,
      "poDetId": 201,
      "hsnCode": "30049099"
    }
  ]
}
```

**Response:**
```json
{
  "success": true,
  "message": "Purchase entry confirmed successfully"
}
```

## Validation Rules

### Save Operation:
- ✅ Vendor must be selected
- ❌ Invoice number is **optional**
- ✅ At least one item must be added
- ✅ All items must have valid Order ID

### Confirm Operation:
- ✅ Vendor must be selected
- ✅ Invoice number is **required**
- ✅ Invoice date is **required**
- ✅ At least one item must be added
- ✅ All items must have valid Order ID

## Data Transformation

The `handleConfirmEntry` function transforms PurchaseItem data to match the API schema:

| UI Field | API Field | Notes |
|----------|-----------|-------|
| `preGoodsId` | `preGoodsId` | Pre-goods receipt ID |
| `prodId` | `prodsId` | Product ID |
| `batchNo` | `batchNo` | Batch number |
| `expiryDate` | `expiryDate` | Expiry date |
| `quantity` | `qty` | Quantity |
| `pack` | `pack` | Pack size |
| `freeQty` | `freeQty` | Free quantity |
| `freePack` | `freePack` | Free pack |
| `taxOnFree` | `taxOnFree` | Tax on free (boolean → 1/0) |
| `cost` | `cost` | Cost price |
| `mrp` | `mrp` | MRP |
| `salesPrice` | `salesPrice` | Sales price |
| `unitPrice` | `unitPrice` | Unit price |
| `discount` | `disc` | Discount amount |
| `discountPercent` | `discPer` | Discount percentage |
| `discWithoutTaxPer` | `discWithoutTaxPer` | Discount without tax % |
| `discWithoutTaxAmt` | `discWithoutTaxAmt` | Discount without tax amount |
| `sgstPer` | `sgstPer` | SGST percentage |
| `cgstPer` | `cgstPer` | CGST percentage |
| `igstPer` | `igstPer` | IGST percentage |
| `sgstAmt` | `sgstAmt` | SGST amount |
| `cgstAmt` | `cgstAmt` | CGST amount |
| `igstAmt` | `igstAmt` | IGST amount |
| `tax` | `tax` | Tax |
| `taxAmount` | `taxAmt` | Tax amount |
| `taxType` | `taxType` | Tax type |
| `mrpVatAmount` | `mrpVatAmt` | MRP VAT amount |
| `totalAmount` | `totalAmt` | Total amount |
| `netAmount` | `netAmt` | Net amount |
| `detId` | `poDetId` | PO detail ID |
| `hsnCode` | `hsnCode` | HSN code |

## Testing Checklist

### Save Operation:
- [ ] Can save without invoice number
- [ ] Can save with invoice number
- [ ] Validation shows for missing vendor
- [ ] Validation shows for empty items list
- [ ] Success message displays after save
- [ ] Form does not clear after successful save

### Confirm Operation:
- [ ] Cannot confirm without invoice number
- [ ] Cannot confirm without invoice date
- [ ] Validation message shows for missing invoice
- [ ] Confirmation dialog displays all details
- [ ] Warning message visible in dialog
- [ ] Success message displays after confirm
- [ ] API receives correctly formatted data

### UI/UX:
- [ ] Save button has save icon
- [ ] Confirm button has check-double icon
- [ ] Both buttons are flex-fill (equal width)
- [ ] Buttons disabled when no items or vendor
- [ ] Loading state shows during API calls

## Notes

1. **Invoice Number Handling:**
   - Save: Shows "Not provided" in confirmation dialog if empty
   - Confirm: Required field with validation

2. **User ID:**
   - Confirming user ID is taken from `loginData.id` in Redux state

3. **Store ID:**
   - Retrieved from session storage (`selectedStore.masterId`)

4. **Order ID:**
   - Taken from first item in `purchaseItems` array
   - All items should have same order ID

5. **Totals:**
   - Calculated using existing `calculateTotals()` function
   - `total` and `net` (grandTotal) sent to API

## Files Modified

1. ✅ `src/api/central-stores/central-stores-api-service.tsx`
   - Added `ConfirmPurchaseEntryDetail` interface
   - Added `ConfirmPurchaseEntryRequest` interface
   - Added `confirmPurchaseEntry()` method

2. ✅ `src/central-stores/pages/medical-store/purchase/purchaseEntry/PurchaseEntry.tsx`
   - Modified `handleSubmitEntry()` - removed invoice validation
   - Added `handleConfirmEntry()` - new confirm functionality
   - Updated Save button UI
   - Added Confirm button UI

## Implementation Complete ✅

All changes have been successfully implemented:
- ✅ Submit button renamed to Save
- ✅ Invoice number made optional for Save operation
- ✅ New Confirm button added with icon
- ✅ New `handleConfirmEntry` function created
- ✅ API service method added
- ✅ Proper validation for both operations
- ✅ Data transformation for confirm operation
