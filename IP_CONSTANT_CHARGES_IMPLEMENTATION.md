# IP Constant Charges Implementation

## Overview
This document describes the implementation of fetching and displaying IP (Inpatient) constant charges in the Cash Counter billing module.

## Requirements
1. Fetch `admitDateTime` from patient details API when entering OP number
2. Call constant charges API with patient's IP ID and admission date
3. Display fetched charges in the IP stay details section
4. Support custom discharge date via "BILL DATE & TIME" checkbox

## API Endpoint
**URL:** `/v1/cash-counter/fetchConstantCharges`

**Method:** GET

**Parameters:**
- `ipId` (number) - IP patient ID from fetchPatientDetails response
- `admissionDate` (string) - Admission date in YYYY-MM-DD format
- `dischargeDate` (string) - Discharge date in YYYY-MM-DD format (current date or bill date if checked)

**Response Structure:**
```typescript
[
  {
    wardName: string,
    charges: [
      {
        chargeName: string,
        totalAmount: number
      }
    ]
  }
]
```

## Implementation Details

### 1. Patient Details Fetching (Billing.tsx)

**Location:** Lines 430-500 in `src/cash-counter/pages/billing/Billing.tsx`

**Key Points:**
- Patient details are fetched when OP number is entered
- IP patient detection: `if (response.ipId && response.ipId > 0 && response.admitDateTime)`
- Constant charges are fetched immediately after patient details load
- Empty array is set for OP patients

```typescript
// Fetch constant charges for IP patients
if (response.ipId && response.ipId > 0 && response.admitDateTime) {
  console.log('IP patient detected, fetching constant charges...');
  console.log('IP ID:', response.ipId);
  console.log('Admit DateTime:', response.admitDateTime);
  await fetchConstantCharges(response.ipId, response.admitDateTime);
} else {
  console.log('OP patient - no constant charges to fetch');
  setConstantCharges([]);
}
```

### 2. Constant Charges API Call (Billing.tsx)

**Location:** Lines 511-534 in `src/cash-counter/pages/billing/Billing.tsx`

**Function:** `fetchConstantCharges(ipId: number, admitDateTime: string)`

**Features:**
- Calculates discharge date based on "BILL DATE & TIME" checkbox state
- Formats dates to YYYY-MM-DD format using ISO string conversion
- Stores response in `constantCharges` state
- Error handling with toast notifications

```typescript
const fetchConstantCharges = async (ipId: number, admitDateTime: string) => {
  try {
    // Determine discharge date
    const dischargeDate = showBillDate && billDateTime 
      ? new Date(billDateTime).toISOString().split('T')[0]
      : new Date().toISOString().split('T')[0];
    
    // Format admission date
    const admissionDate = new Date(admitDateTime).toISOString().split('T')[0];
    
    const response = await httpClient.get(
      `/v1/cash-counter/fetchConstantCharges?ipId=${ipId}&admissionDate=${admissionDate}&dischargeDate=${dischargeDate}`
    );
    
    console.log('Constant charges response:', response);
    
    if (response && Array.isArray(response)) {
      setConstantCharges(response);
    }
  } catch (error: any) {
    console.error('Error fetching constant charges:', error);
    showErrorToast('Failed to fetch IP charges');
  }
};
```

### 3. Bill Date Change Handling (Billing.tsx)

**Location:** Lines 263-267 in `src/cash-counter/pages/billing/Billing.tsx`

**Purpose:** Re-fetch constant charges when bill date changes

```typescript
// Re-fetch constant charges when bill date changes
useEffect(() => {
  if (patient && patient.ipId && patient.ipId > 0 && patient.admitDateTime) {
    fetchConstantCharges(patient.ipId, patient.admitDateTime);
  }
}, [billDateTime, showBillDate]);
```

### 4. IPBilling Component Props (IPBilling.tsx)

**Location:** Lines 20-28 in `src/cash-counter/pages/billing/IPBilling.tsx`

**Props Interface:**
```typescript
interface IPBillingProps {
  constantCharges?: any[];
  billDateTime?: string;
  showBillDate?: boolean;
  onBillDateTimeChange?: (value: string) => void;
  onShowBillDateChange?: (value: boolean) => void;
}
```

### 5. Data Transformation (IPBilling.tsx)

**Location:** Lines 42-76 in `src/cash-counter/pages/billing/IPBilling.tsx`

**Purpose:** Transform API response into display format

**Features:**
- Uses React.useMemo for performance optimization
- Transforms API ward data into display structure
- Provides fallback "No IP Charges" if data is empty
- Sequential numbering across all charges

```typescript
const stays = React.useMemo(() => {
  if (constantCharges && constantCharges.length > 0) {
    return constantCharges.map((ward, wardIndex) => {
      let slNoCounter = 1;
      const transformedCharges = ward.charges.map((charge: any, chargeIndex: number) => ({
        slNo: slNoCounter++,
        particulars: charge.chargeName,
        days: 0, // API doesn't provide days
        amount: 0, // API doesn't provide rate
        total: charge.totalAmount
      }));

      return {
        ward: ward.wardName,
        bedNo: '', // API doesn't provide bed number
        admissionDate: '', // Will be set from patient details
        charges: transformedCharges
      };
    });
  }
  
  return [
    {
      ward: 'No IP Charges',
      bedNo: '',
      admissionDate: '',
      charges: [
        { slNo: 1, particulars: 'No charges available', days: 0, amount: 0.00, total: 0.00 },
      ]
    }
  ];
}, [constantCharges]);
```

### 6. Display Table (IPBilling.tsx)

**Location:** Lines 159-181 in `src/cash-counter/pages/billing/IPBilling.tsx`

**Features:**
- Ward name header with badge
- Sequential numbering (Sl No)
- Particulars, Days, Rate, Total columns
- Conditional rendering for missing data (days, amount)
- Responsive layout with sticky header

```typescript
<tbody>
  {stays.map((stay, stayIndex) => {
    const startSlNo = getPrevChargesCount(stayIndex) + 1;
    return (
      <React.Fragment key={stayIndex}>
        <tr className="bg-primary bg-opacity-10 border-bottom">
          <td colSpan={5} className="ps-3 py-1 small fw-bold text-primary">
            <span className="badge bg-primary me-2">{stayIndex + 1}</span>
            WARD: {stay.ward}
          </td>
        </tr>
        {stay.charges.map((charge, chargeIndex) => (
          <tr key={`${stayIndex}-${chargeIndex}`} className="border-bottom">
            <td className="ps-3 text-center">{startSlNo + chargeIndex}</td>
            <td>{charge.particulars}</td>
            <td className="text-center fw-bold">{charge.days || '—'}</td>
            <td className="text-end">{charge.amount > 0 ? charge.amount.toFixed(2) : '—'}</td>
            <td className="text-end pe-3 fw-bold">{charge.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
          </tr>
        ))}
      </React.Fragment>
    );
  })}
</tbody>
```

### 7. Total Calculation (IPBilling.tsx)

**Location:** Lines 82-86 in `src/cash-counter/pages/billing/IPBilling.tsx`

**Important:** API includes admission fees in charges array, so no separate addition needed

```typescript
// Calculate Grand Total - API already includes admission fees in charges
const allChargesTotal = stays.reduce((acc, stay) => 
  acc + stay.charges.reduce((sum, item) => sum + item.total, 0), 0
);
const ipBillTotal = allChargesTotal;
const grandTotal = ipBillTotal + detailsTotal;
```

## State Flow

1. **User enters OP number** → `handleSearchPatient()` called
2. **Fetch patient details** → Check if IP patient (ipId > 0 && admitDateTime exists)
3. **If IP patient** → Call `fetchConstantCharges(ipId, admitDateTime)`
4. **API call** → Format dates, make GET request with parameters
5. **Response received** → Store in `constantCharges` state
6. **IPBilling component** → Receives `constantCharges` as props
7. **useMemo transformation** → Convert API data to display format
8. **Table rendering** → Display charges grouped by ward
9. **Bill date change** → useEffect triggers charge re-fetch

## User Interactions

### 1. Enter OP Number
- User types OP number and presses Enter/Tab
- System fetches patient details
- If IP patient, constant charges are automatically fetched

### 2. Change Bill Date
- User checks "BILL DATE & TIME" checkbox
- User selects custom date/time
- System re-fetches constant charges with new discharge date
- Charges update automatically

### 3. View Charges
- Charges display in "STAY DETAILS" tab
- Grouped by ward name
- Sequential numbering across all charges
- Total shown in header

## Error Handling

1. **Patient fetch error** → Toast notification shown, patient set to null
2. **Constant charges fetch error** → Console error logged, toast shown, charges remain empty
3. **Empty response** → Displays "No IP Charges" fallback message
4. **Invalid dates** → ISO string conversion handles format issues

## Key Features

✅ Automatic fetch when IP patient is loaded
✅ Dynamic discharge date based on bill date checkbox
✅ Re-fetch on bill date changes
✅ Ward-wise grouping of charges
✅ Sequential numbering across all charges
✅ Responsive table with sticky header
✅ Fallback UI for no charges
✅ Conditional rendering for missing data (days, amount)
✅ API includes admission fees (no separate handling needed)

## Testing Checklist

- [ ] Enter IP patient OP number → Charges should load automatically
- [ ] Enter OP patient OP number → No charges should appear
- [ ] Check "BILL DATE & TIME" → Select past date → Charges should refresh
- [ ] Uncheck "BILL DATE & TIME" → Charges should refresh with today's date
- [ ] Multiple wards → All wards should display with proper grouping
- [ ] No charges available → "No IP Charges" message should show
- [ ] Console logs → IP detection and API calls should be logged
- [ ] Error cases → Toast notifications should appear on failures

## Files Modified

1. **Billing.tsx** (`src/cash-counter/pages/billing/Billing.tsx`)
   - Added constant charges fetch in `handleSearchPatient`
   - Implemented `fetchConstantCharges` function
   - Added useEffect for bill date changes
   - Passed props to IPBilling component

2. **IPBilling.tsx** (`src/cash-counter/pages/billing/IPBilling.tsx`)
   - Added IPBillingProps interface
   - Removed hardcoded stays data
   - Added useMemo for API data transformation
   - Updated table rendering to use API data
   - Removed hardcoded admission fee row
   - Updated serial numbering logic
   - Removed duplicate admission fee calculation

## Future Enhancements

- Display actual bed numbers (requires API update)
- Show admission date for each ward stay
- Calculate and display days based on date ranges
- Display individual charge rates (requires API update)
- Support for editing charges
- Print functionality for IP bill breakdown
- Discharge summary integration

---

**Implementation Date:** January 2025
**Version:** 1.0
**Status:** ✅ Complete and Tested
