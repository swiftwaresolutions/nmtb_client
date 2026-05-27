# IP Bill Generation Implementation Guide

## Overview
This guide documents the implementation of IP (Inpatient) bill generation using the `generateIpBillOrder` API endpoint.

## API Endpoint
- **URL**: `POST /api/v1/cash-counter/generateIpBillOrder`
- **Purpose**: Generate comprehensive IP bills including final bill, cash bill, pharmacy bill, lab bill, and IP bill

## Implementation Components

### 1. CashCounterApiService Update
**File**: `src/api/cash-counter/cash-counter-api-service.tsx`

Added new method:
```typescript
public generateIpBillOrder = async (payload: {
  patId: number;
  ipkey: number;
  amt: number;
  discount: number;
  advance: number;
  prevBalance: number;
  uid: number;
  isFinal: number;
  isConstantChargesCalculated: number;
  headId: number;
  details: Array<{
    headId: number;
    rate: number;
    qty: number;
    isConstantCharge: number;
  }>;
}) => {
  return await this.httpWrapper.post("v1/cash-counter/generateIpBillOrder", payload);
};
```

### 2. IPBilling Component Updates
**File**: `src/cash-counter/pages/billing/IPBilling.tsx`

#### New Imports
```typescript
import { CashCounterApiService } from '../../../api/cash-counter/cash-counter-api-service';
import { useSelector } from 'react-redux';
import { RootState } from '../../../state/store';
import { showSuccessToast, showErrorToast, showLoading, closeAlert } from '../../../utils/alertUtil';
```

#### New Props Interface
```typescript
interface IPBillingProps {
  constantCharges?: any[];
  billDateTime?: string;
  showBillDate?: boolean;
  onBillDateTimeChange?: (value: string) => void;
  onShowBillDateChange?: (value: boolean) => void;
  patientId?: number;        // NEW
  ipKey?: number;            // NEW
  advance?: number;          // NEW
  prevBalance?: number;      // NEW
}
```

#### New State Variables
```typescript
const loginData = useSelector((state: RootState) => state.loginData);
const cashCounterApi = new CashCounterApiService();
const [billIds, setBillIds] = useState<any>(null);
const [isGenerating, setIsGenerating] = useState(false);
```

#### Updated handleGenerateBill Function
The function now:
1. Validates patient information (patientId, ipKey)
2. Validates constant charges availability
3. Transforms constant charges into API details array format
4. Builds complete request payload with all required fields
5. Calls the API using `cashCounterApi.generateIpBillOrder()`
6. Handles success/error responses
7. Displays multiple bill IDs returned by API

### 3. Billing.tsx Updates
**File**: `src/cash-counter/pages/billing/Billing.tsx`

Updated IPBilling component usage to pass patient data:
```typescript
{billingType === 'ip' && (
  <IPBilling 
    constantCharges={constantCharges}
    billDateTime={billDateTime}
    showBillDate={showBillDate}
    onBillDateTimeChange={setBillDateTime}
    onShowBillDateChange={setShowBillDate}
    patientId={patient?.patId}
    ipKey={patient?.ipId}
    advance={patient?.ipAdvance || 0}
    prevBalance={patient?.prevBalance || 0}
  />
)}
```

## Request Payload Structure

```typescript
{
  patId: number;                    // Patient ID
  ipkey: number;                    // IP admission ID/key
  amt: number;                      // Total bill amount
  discount: number;                 // Discount amount (if any)
  advance: number;                  // Advance payment already received
  prevBalance: number;              // Previous outstanding balance
  uid: number;                      // User ID (from loginData)
  isFinal: number;                  // 1 if final bill calculation, 0 otherwise
  isConstantChargesCalculated: number; // 1 if constant charges calculated
  headId: number;                   // Account head ID
  details: Array<{
    headId: number;                 // Charge head ID
    rate: number;                   // Rate per unit
    qty: number;                    // Quantity
    isConstantCharge: number;       // 1 if from constant charges
  }>;
}
```

## Response Structure

```typescript
{
  finalBillId: number;
  finalBillDisplay: string;         // Main bill number to show user
  cashBillId: number;
  cashBillDisplay: string;          // Cash component bill number
  phBillId: number;
  phBillDisplay: string;            // Pharmacy bill number
  labBillId: number;
  labBillDisplay: string;           // Lab bill number
  ipBillId: number;
  ipBillDisplay: string;            // IP specific bill number
}
```

## User Workflow

1. **Search Patient**: User enters OP/IP number to load patient details
2. **Verify IP Status**: System checks if patient is admitted (ipId exists)
3. **Load Constant Charges**: System automatically fetches IP charges based on admission date
4. **Configure Options**:
   - Check "Calculate IP Charges" if needed
   - Check "Final Bill Calculation" for discharge billing
   - Optionally set custom bill date/time
5. **Generate Bill**: Click "GENERATE" button
6. **View Results**: System displays all generated bill numbers:
   - Final Bill Number (primary)
   - Cash Bill Number
   - IP Bill Number
   - (Plus Pharmacy and Lab bill numbers if applicable)

## Validation Rules

### Pre-generation Validation
- ✅ Patient ID must be present
- ✅ IP Key (ipId) must be present
- ✅ Constant charges must be available (array not empty)

### API Validation
- Backend validates all numeric fields are positive
- Backend ensures user has permission to generate bills
- Backend validates patient admission status

## Error Handling

### Client-Side Errors
```typescript
// Missing patient data
"Patient information is missing. Please search patient first."

// No constant charges
"No constant charges available. Please calculate charges first."
```

### Server Errors
```typescript
// API error response
error?.response?.data?.error || "Failed to generate IP bill. Please try again."
```

## UI Updates

### Generate Button
- Shows "GENERATING..." during API call
- Disabled while processing
- Re-enabled after success/error

### Bill Display Section
Shows multiple bill numbers in organized format:
```
Generated Bills
Final Bill:  FB-2025-001234
Cash Bill:   CB-2025-001235
IP Bill:     IP-2025-001236
```

## Testing Checklist

- [ ] Patient search loads IP patient data correctly
- [ ] Constant charges are fetched for IP patients
- [ ] Generate button validates patient information
- [ ] Generate button validates constant charges
- [ ] API payload includes all required fields
- [ ] API call shows loading indicator
- [ ] Success response displays all bill numbers
- [ ] Error responses show appropriate error messages
- [ ] Final Bill Calculation checkbox affects isFinal flag
- [ ] Calculate IP Charges checkbox affects isConstantChargesCalculated flag
- [ ] Custom bill date/time is included in payload if set

## Future Enhancements

1. **Discount Support**: Add discount input and pass to API
2. **Account Head Selection**: Allow user to select account head
3. **Bill Printing**: Integrate with print functionality
4. **Bill History**: Show previously generated bills
5. **Edit/Cancel Bills**: Support bill modification/cancellation
6. **Payment Integration**: Link to payment processing

## Common Issues & Solutions

### Issue: "Patient information is missing"
**Solution**: Ensure patient is searched and loaded before clicking Generate

### Issue: "No constant charges available"
**Solution**: 
- Verify patient has ipId (is admitted)
- Check constant charges API is returning data
- Verify date range is correct

### Issue: API returns empty bill IDs
**Solution**: 
- Check backend logs for validation errors
- Verify user has required permissions
- Ensure details array is properly formatted

### Issue: Bills generated but not displayed
**Solution**: 
- Check API response structure matches expected format
- Verify `finalBillDisplay` field exists in response
- Check browser console for errors

## Related Documentation

- [API Specification](./IP_BILL_GENERATION_API.md)
- [Alert Utility Guide](./src/utils/ALERT_UTILITY_GUIDE.md)
- [Cash Counter Implementation](./CASH_COUNTER_IMPLEMENTATION.md)

## Change Log

### 2025-01-XX - Initial Implementation
- Added `generateIpBillOrder` method to CashCounterApiService
- Updated IPBilling component to accept patient data props
- Implemented actual API call in handleGenerateBill
- Added validation and error handling
- Updated UI to display multiple bill numbers
- Integrated loading states and success/error alerts

---

**Last Updated**: 2025-01-XX
**Implementation Status**: ✅ Complete
**Testing Status**: ⏳ Pending
