# Pharmacy Autocomplete Implementation

## Overview
Implemented medicine autocomplete functionality in the billing page with automatic batch selection based on expiry date.

## Features Implemented

### 1. Medicine Search Autocomplete
- **API Endpoint**: `fetchMedicinesForBilling(phModId, searchTerm)`
  - Parameters: 
    - `phModId`: 1 (hardcoded for pharmacy module)
    - `searchTerm`: User input (minimum 2 characters)
  - Response: Array of medicines with `{genericId, genericName, prodsName, prodsId}`

### 2. Automatic Batch Selection
- **API Endpoint**: `fetchBatchDetailsByProdsId(prodsId)`
  - Parameter: `prodsId` from selected medicine
  - Response: Array of batch details with `{batchId, batchNo, expiryDate, mrp, salesPrice, sgstPer, cgstPer, igstPer}`
  
- **Auto-selection Logic**: 
  - Sorts batches by expiry date (ascending)
  - Automatically selects the batch that will expire soon (earliest expiry date)
  - Displays expiry date below batch field for reference

### 3. Auto-populated Fields
When a medicine is selected from autocomplete:
- ✅ **Generic Name** - Auto-filled from medicine data (readonly)
- ✅ **Medicine Name** - Populated with selected medicine name (readonly after selection)
- ✅ **Batch** - Auto-filled with earliest expiring batch (readonly)
- ✅ **Expiry Date** - Displayed below batch field (informational)
- ✅ **MRP** - Auto-filled from batch details (readonly)
- ✅ **Stock** - Auto-filled if available (readonly)
- 🔵 **Unit** - User enters quantity (editable, auto-focused after selection)

## User Workflow

1. **Search Medicine**:
   - User types medicine name (minimum 2 characters)
   - Autocomplete dropdown appears showing matching medicines
   - Each suggestion shows:
     - Medicine product name
     - Generic name

2. **Select Medicine**:
   - Click on suggestion or use arrow keys + Enter
   - System automatically:
     - Fetches all available batches
     - Sorts by expiry date
     - Selects earliest expiring batch
     - Populates all related fields

3. **Enter Quantity**:
   - Focus automatically moves to Unit field
   - User enters desired quantity
   - Click "Add" to add item to billing

4. **Continue Billing**:
   - After adding item, focus returns to medicine search
   - Ready for next medicine entry

## Technical Implementation

### Files Modified

#### 1. API Service (`cash-counter-api-service.tsx`)
Added two new API methods:

```typescript
// Fetch medicines for autocomplete
public fetchMedicinesForBilling = async (phModId: number, searchTerm: string) => {
  const response = await this.httpWrapper.get(
    `v1/cash-counter/fetchMedicinesForBilling?phModId=${phModId}&searchTerm=${encodeURIComponent(searchTerm)}`
  );
  return response?.data || response || [];
};

// Fetch batch details for selected medicine
public fetchBatchDetailsByProdsId = async (prodsId: number) => {
  const response = await this.httpWrapper.get(
    `v1/cash-counter/fetchBatchDetailsByProdsId?prodsId=${prodsId}`
  );
  return response?.data || response || [];
};
```

#### 2. Pharmacy Billing Component (`PharmacyBilling.tsx`)

**State Management**:
```typescript
// Autocomplete state
const [medicineSuggestions, setMedicineSuggestions] = useState<any[]>([]);
const [showMedicineSuggestions, setShowMedicineSuggestions] = useState(false);
const [medicineSearchTerm, setMedicineSearchTerm] = useState('');
const [selectedMedicineIndex, setSelectedMedicineIndex] = useState(-1);

// Extended item state to include batch details
interface PharmacyItem {
  // ... existing fields
  prodsId?: number;
  batchId?: number;
  expiryDate?: string;
  salesPrice?: number;
  sgstPer?: number;
  cgstPer?: number;
  igstPer?: number;
}
```

**Key Handlers**:

1. **handleMedicineSearch**: 
   - Triggers on typing (>= 2 chars)
   - Calls API to fetch matching medicines
   - Shows autocomplete dropdown

2. **handleMedicineSelect**:
   - Fetches batch details for selected medicine
   - Sorts batches by expiry date
   - Auto-selects earliest expiring batch
   - Populates all fields
   - Moves focus to unit input

3. **handleMedicineKeyDown**:
   - Arrow Up/Down: Navigate suggestions
   - Enter: Select highlighted suggestion
   - Escape: Close dropdown

**UI Components**:
- Medicine name input with autocomplete dropdown
- Autocomplete suggestions styled with hover effects
- Keyboard navigation support
- Click-outside detection to close dropdown
- Expiry date display below batch field

## Benefits

1. **Faster Data Entry**: 
   - No manual typing of medicine names, batches, or prices
   - Autocomplete reduces typing errors

2. **Inventory Management**: 
   - Automatic FEFO (First Expiry First Out) implementation
   - Helps reduce medicine wastage due to expiry

3. **Accuracy**: 
   - Eliminates manual entry errors for medicine names
   - Ensures correct batch information
   - Proper pricing from master data

4. **User Experience**:
   - Keyboard navigation support
   - Auto-focus management for smooth workflow
   - Visual feedback with highlighted suggestions
   - Expiry date visibility

## API Endpoints

### Base URL
```
http://192.168.1.210:9090/api/v1/cash-counter
```

### Endpoints Used

1. **Medicine Search**:
   ```
   GET /fetchMedicinesForBilling
   Query Params:
     - phModId: 1
     - searchTerm: <search text>
   
   Response:
   [
     {
       "genericId": number,
       "genericName": string,
       "prodsName": string,
       "prodsId": number
     }
   ]
   ```

2. **Batch Details**:
   ```
   GET /fetchBatchDetailsByProdsId
   Query Params:
     - prodsId: <product id>
   
   Response:
   [
     {
       "batchId": number,
       "batchNo": string,
       "expiryDate": string,
       "mrp": number,
       "salesPrice": number,
       "sgstPer": number,
       "cgstPer": number,
       "igstPer": number
     }
   ]
   ```

## Testing Checklist

- [ ] Medicine search shows results for partial matches
- [ ] Minimum 2 characters required to trigger search
- [ ] Autocomplete dropdown appears with suggestions
- [ ] Can navigate suggestions with arrow keys
- [ ] Enter key selects highlighted suggestion
- [ ] Click selects suggestion
- [ ] Escape key closes dropdown
- [ ] Clicking outside closes dropdown
- [ ] Selected medicine populates all fields correctly
- [ ] Batch with earliest expiry is auto-selected
- [ ] Expiry date displays correctly below batch
- [ ] Focus moves to unit field after selection
- [ ] Generic name is readonly
- [ ] Batch is readonly
- [ ] MRP is readonly
- [ ] Stock is readonly
- [ ] Unit field is editable and accepts numbers
- [ ] Add button works correctly
- [ ] After adding, focus returns to medicine search
- [ ] Form resets properly after adding item
- [ ] Error handling for no batches available
- [ ] Error handling for API failures
- [ ] Loading states handled gracefully

## Future Enhancements

1. **Stock Validation**: 
   - Fetch actual stock from inventory
   - Warn if requested quantity exceeds available stock
   - Block adding item if stock insufficient

2. **Expiry Warning**: 
   - Highlight batches expiring soon (e.g., within 30 days)
   - Color code expiry dates (red for near expiry, yellow for caution)

3. **Alternative Batches**: 
   - Allow user to see all available batches
   - Option to override auto-selected batch if needed
   - Show stock levels for each batch

4. **Recent Medicines**: 
   - Cache recently used medicines
   - Quick access to frequently prescribed items

5. **Barcode Support**: 
   - Scan medicine barcode for instant selection
   - Bypass search for scanned items

## Pattern Consistency

This implementation follows the same pattern as the existing **Procedure Autocomplete**:
- Same API integration approach
- Similar state management
- Consistent UI/UX patterns
- Keyboard navigation support
- Click-outside detection
- Focus management

## Notes for Developers

- The `phModId` is hardcoded to `1` - update if different pharmacy modules are added
- Batch sorting uses JavaScript `Date` object for expiry date comparison
- All autocomplete fields are made readonly to prevent manual override
- Only the `unit` field remains editable for user input
- Error handling uses the common alert utility functions
- Component follows React hooks pattern with functional components

## Related Files

- `src/api/cash-counter/cash-counter-api-service.tsx` - API methods
- `src/cash-counter/pages/billing/PharmacyBilling.tsx` - Component implementation
- `src/utils/alertUtil.ts` - Alert utilities for error/warning messages

---

**Implementation Date**: December 2024  
**Pattern Reference**: Procedure Autocomplete (Billing.tsx)  
**User Requirement**: "using expiry date.auto select first which is going to expire soon"
