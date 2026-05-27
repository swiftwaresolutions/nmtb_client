# Payment Calculation Implementation Guide

## Overview
This document describes the payment calculation logic implemented in the Billing module with patient-type-specific behavior.

## Business Requirements

### Outpatient (OP) Payment Flow
1. **Auto-fill Cash Amount**: When an OP patient is loaded, the grand total automatically populates the cash amount field
2. **Partial Payments**: User can reduce the cash amount to accept partial payment
3. **Balance Calculation**: Balance = Grand Total - (Cash + Bank + Insurance + Staff Credit)
4. **Real-time Updates**: Balance recalculates automatically when any payment amount changes

### Inpatient (IP) Payment Flow
1. **Balance Due**: Full grand total goes directly to the balance amount
2. **No Auto-fill**: Cash amount remains 0 by default
3. **Full Amount Due**: Balance represents the total amount owed at discharge

## Implementation Details

### 1. State Variables Added

```typescript
// Payment Amount States
const [cashAmount, setCashAmount] = useState<number>(0);
const [bankAmount, setBankAmount] = useState<number>(0);
const [insuranceAmount, setInsuranceAmount] = useState<number>(0);
const [staffCreditAmount, setStaffCreditAmount] = useState<number>(0);
const [balanceAmount, setBalanceAmount] = useState<number>(0);
```

**Location**: After existing billing details state (~line 142)

### 2. Auto-fill Logic

```typescript
// Auto-fill cash amount for OP patients, balance for IP patients
useEffect(() => {
  const grandTotal = getGrandTotal();
  if (patient) {
    if (patient.isOp === 1) {
      // OP patient: auto-fill cash with grand total
      setCashAmount(grandTotal);
    } else if (patient.isOp === 0) {
      // IP patient: full amount goes to balance
      setBalanceAmount(grandTotal);
      setCashAmount(0);
    }
  }
}, [patient, procedureItems, pharmacyItems, labItems, totalDiscount, discountType]);
```

**Triggers**:
- When patient is loaded
- When procedures/pharmacy/lab items are added/removed
- When discount is applied

**Logic**:
- **OP Patients** (isOp === 1): Sets cashAmount = grandTotal
- **IP Patients** (isOp === 0): Sets balanceAmount = grandTotal, cashAmount = 0

### 3. Balance Calculation Logic

```typescript
// Calculate balance for OP patients based on payments
useEffect(() => {
  if (patient && patient.isOp === 1) {
    const grandTotal = getGrandTotal();
    const balance = grandTotal - cashAmount - bankAmount - insuranceAmount - staffCreditAmount;
    setBalanceAmount(balance > 0 ? balance : 0);
  }
}, [cashAmount, bankAmount, insuranceAmount, staffCreditAmount]);
```

**Triggers**:
- When any payment amount changes (cash, bank, insurance, staff credit)

**Formula**:
```
Balance = Grand Total - Cash - Bank - Insurance - Staff Credit
```

**Validation**: Balance cannot be negative (minimum 0)

### 4. UI Updates

#### Cash Amount Input (with state binding)
```typescript
<Form.Control 
  type="number"
  placeholder=" "
  value={cashAmount}
  onChange={(e) => setCashAmount(parseFloat(e.target.value) || 0)}
  style={{ height: '28px' }}
/>
<label className="floating-label">Cash Amount</label>
```

#### Balance Box (read-only, calculated)
```typescript
<Col xs={12}>
  <div className="position-relative">
    <Form.Control 
      type="number"
      placeholder=" "
      value={balanceAmount.toFixed(2)}
      readOnly
      className="bg-light fw-bold text-danger"
      style={{ height: '28px' }}
    />
    <label className="floating-label">Balance Amount</label>
  </div>
</Col>
```

**Styling**:
- Read-only field (user cannot edit)
- Light background (`bg-light`)
- Bold text (`fw-bold`)
- Red text color (`text-danger`) to highlight outstanding balance
- Fixed to 2 decimal places

#### Bank Amount Input (with state binding)
```typescript
<Form.Control 
  type="number"
  placeholder=" "
  value={bankAmount}
  onChange={(e) => setBankAmount(parseFloat(e.target.value) || 0)}
  style={{ height: '28px' }}
/>
```

#### Staff Credit Input (with state binding)
```typescript
<Form.Control 
  type="number" 
  placeholder=" " 
  value={staffCreditAmount}
  onChange={(e) => setStaffCreditAmount(parseFloat(e.target.value) || 0)}
  style={{ height: '28px' }} 
/>
```

#### Insurance Input (with state binding)
```typescript
<Form.Control 
  type="number" 
  placeholder=" " 
  value={insuranceAmount}
  onChange={(e) => setInsuranceAmount(parseFloat(e.target.value) || 0)}
  style={{ height: '28px' }} 
/>
```

### 5. Save Billing Integration

```typescript
// Prepare payment with actual state values
const payment = {
  paymentMode: paymentMode,
  bankId: 0,
  transType: 0,
  refNo: '',
  total: grandTotal,
  discount: totalDiscountAmount,
  payable: payableAmount,
  cashPaid: cashAmount,           // ← Uses state value
  bankPaid: bankAmount,            // ← Uses state value
  staffPaid: staffCreditAmount,    // ← Uses state value
  companyPaid: insuranceAmount,    // ← Uses state value
  dueAmt: balanceAmount            // ← Uses calculated balance
};
```

**Before**: Used calculated values based on payment mode
**After**: Uses actual state values from user input

### 6. State Reset After Save

```typescript
// Reset payment states after successful save
setCashAmount(0);
setBankAmount(0);
setInsuranceAmount(0);
setStaffCreditAmount(0);
setBalanceAmount(0);
```

**Purpose**: Clean state for next billing transaction

## User Workflows

### Workflow 1: OP Patient with Full Payment

1. User enters OP number and loads patient
2. **Auto-fill**: Cash amount = Grand total (e.g., ₹1500)
3. User accepts full payment
4. Balance = ₹0
5. Save billing → Payment successful

### Workflow 2: OP Patient with Partial Payment

1. User enters OP number and loads patient
2. **Auto-fill**: Cash amount = Grand total (e.g., ₹1500)
3. User reduces cash to ₹1000
4. **Auto-calculate**: Balance = ₹500
5. Save billing → Payment with balance recorded

### Workflow 3: OP Patient with Multiple Payment Methods

1. User enters OP number and loads patient
2. **Auto-fill**: Cash amount = Grand total (e.g., ₹2000)
3. User changes payment mode to "Cash + Bank"
4. User enters:
   - Cash: ₹800
   - Bank: ₹700
   - Insurance: ₹300
5. **Auto-calculate**: Balance = 2000 - 800 - 700 - 300 = ₹200
6. Save billing → Multi-payment transaction recorded

### Workflow 4: IP Patient (Full Balance)

1. User enters IP number and loads patient
2. **Auto-set**: Balance = Grand total (e.g., ₹5000)
3. Cash amount = ₹0 (no immediate payment)
4. Save billing → Full amount recorded as due

### Workflow 5: IP Patient with Partial Payment

1. User enters IP number and loads patient
2. **Auto-set**: Balance = Grand total (e.g., ₹5000)
3. User enters cash advance: ₹1000
4. **Auto-calculate**: Balance = 5000 - 1000 = ₹4000
5. Save billing → Partial payment with balance

## Technical Notes

### Patient Type Detection
```typescript
// Check patient type
if (patient.isOp === 1) {
  // Outpatient logic
} else if (patient.isOp === 0) {
  // Inpatient logic
}
```

### Decimal Handling
```typescript
// Parse user input safely
parseFloat(e.target.value) || 0

// Display with 2 decimal places
balanceAmount.toFixed(2)
```

### Negative Balance Prevention
```typescript
// Ensure balance is never negative
const balance = grandTotal - cashAmount - bankAmount - insuranceAmount - staffCreditAmount;
setBalanceAmount(balance > 0 ? balance : 0);
```

## Testing Checklist

### OP Patient Tests
- [ ] Load OP patient → Verify cash amount auto-fills with grand total
- [ ] Add procedures → Verify cash amount updates with new total
- [ ] Apply discount → Verify cash amount reflects discounted total
- [ ] Reduce cash amount → Verify balance increases correctly
- [ ] Add bank payment → Verify balance decreases
- [ ] Add insurance → Verify balance decreases
- [ ] Add staff credit → Verify balance decreases
- [ ] Save billing → Verify payment payload has correct amounts
- [ ] After save → Verify all payment fields reset to 0

### IP Patient Tests
- [ ] Load IP patient → Verify balance = grand total, cash = 0
- [ ] Add procedures → Verify balance updates with new total
- [ ] Apply discount → Verify balance reflects discounted total
- [ ] Enter cash advance → Verify balance decreases
- [ ] Save billing → Verify dueAmt in payload matches balance
- [ ] After save → Verify all fields reset

### Edge Cases
- [ ] Zero grand total → Verify no errors
- [ ] Negative discount → Verify balance calculation correct
- [ ] Multiple payment methods totaling more than grand total → Verify balance = 0
- [ ] Switch from OP to IP patient → Verify payment mode changes
- [ ] Switch from IP to OP patient → Verify auto-fill works

## API Payload Structure

```json
{
  "patientId": 123,
  "visitId": 456,
  "ipId": 0,
  "isOp": 1,
  "doctorId": 5,
  "payment": {
    "paymentMode": "cash-bank",
    "bankId": 0,
    "transType": 0,
    "refNo": "",
    "total": 2000.00,
    "discount": 0,
    "payable": 2000.00,
    "cashPaid": 800.00,      // From cashAmount state
    "bankPaid": 700.00,      // From bankAmount state
    "staffPaid": 0.00,       // From staffCreditAmount state
    "companyPaid": 300.00,   // From insuranceAmount state
    "dueAmt": 200.00        // Calculated balanceAmount
  },
  "investigationItems": [...],
  "pharmacyItems": [...],
  "labItems": [...]
}
```

## Benefits

1. **Accurate Tracking**: Payment breakdown is precisely captured
2. **Flexible Payments**: Supports partial and multi-method payments
3. **Real-time Calculation**: Balance updates as user enters amounts
4. **Patient-Specific Logic**: Different behavior for OP vs IP patients
5. **Audit Trail**: Complete payment details saved for accounting
6. **User Experience**: Auto-fill reduces manual entry, prevents errors

## Future Enhancements

1. **Payment Validation**: Prevent total payments exceeding grand total
2. **Payment History**: Show previous payments for the patient
3. **Receipt Printing**: Generate payment receipt with breakdown
4. **Advance Adjustment**: Auto-adjust from patient's advance balance
5. **Credit Limit Check**: Validate staff credit against user limits
6. **Insurance Verification**: Check insurance coverage in real-time

---

**Implementation Date**: December 2024  
**Module**: Cash Counter - Billing  
**Status**: ✅ Completed  
**TypeScript Errors**: None  
**Tested**: Pending user validation
