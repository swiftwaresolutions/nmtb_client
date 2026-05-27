# Auto-Populate Payment Amounts Implementation

## Overview
Implemented automatic population of payment amount fields (Cash Amount / Bank Amount) with the Net Payable value when the corresponding payment mode is selected.

## Implementation Details

### Files Modified
- `src/medical-records/pages/registration/PatientRegistration.tsx`

### Changes Made

#### 1. **Added useEffect for Auto-Population (Lines 806-872)**

This useEffect monitors changes to:
- `selectedPaymentType` - When payment mode changes (Cash/Bank/Split)
- `registrationFee`, `consultationFee`, `discount` - When any fee amount changes
- `paymentTypes`, `paymentModes`, `banks` - When dropdown data loads

**Behavior:**

**When Cash mode is selected:**
- Cash Amount = Net Payable (₹400.00)
- Bank Amount = "" (cleared)
- Insurance = "" (cleared)
- Staff Credit = "" (cleared)
- Balance = "0.00"

**When Bank mode is selected:**
- Bank Amount = Net Payable (₹400.00)
- Cash Amount = "" (cleared)
- Insurance = "" (cleared)
- Staff Credit = "" (cleared)
- Balance = "0.00"
- Auto-selects "UPI" payment mode (if available)
- Auto-selects "SBI" bank (if available)

**When Split mode is selected:**
- All payment fields = "" (cleared)
- Balance = Net Payable (₹400.00)
- User must manually enter amounts

#### 2. **Enhanced Payment Mode Tab onClick Handlers (Lines 2814-2867)**

The tab click handlers were already updated in the previous implementation to include the same auto-population logic, ensuring it works both:
- On component mount/load
- On tab clicks

### How It Works

1. **Net Payable Calculation:**
   ```javascript
   netPayable = registrationFee + consultationFee - discount
   ```

2. **Auto-Population Trigger:**
   - Runs when component first loads with a payment type selected
   - Runs when user clicks a payment mode tab
   - Runs when any fee value changes (registration/consultation/discount)

3. **Smart Defaults for Bank Mode:**
   - Automatically selects "UPI" if available
   - Automatically selects "SBI" bank if available
   - Can be changed by user if needed

## User Experience

### Before Changes:
- User had to manually enter the net payable amount in cash/bank fields
- Easy to make data entry errors
- Extra typing required

### After Changes:
- ✅ Cash Amount auto-fills when Cash mode selected
- ✅ Bank Amount auto-fills when Bank mode selected
- ✅ Balance automatically becomes ₹0.00 when full amount is entered
- ✅ Other payment fields automatically cleared when switching modes
- ✅ Works on page load AND on tab clicks
- ✅ Updates when fees change

## Testing Instructions

### Test Case 1: Cash Payment
1. Enter Registration Fee: ₹100.00
2. Enter Consultation Fee: ₹300.00
3. Net Payable shows: ₹400.00
4. Click "Cash 💵" payment mode tab
5. **Expected:** Cash Amount = ₹400.00, Balance = ₹0.00

### Test Case 2: Bank Payment
1. Enter Registration Fee: ₹100.00
2. Enter Consultation Fee: ₹300.00
3. Net Payable shows: ₹400.00
4. Click "Bank 🏦" payment mode tab
5. **Expected:** 
   - Bank Amount = ₹400.00
   - Balance = ₹0.00
   - Payment Mode = "UPI" (auto-selected)
   - Bank Name = "SBI" (auto-selected)

### Test Case 3: Split Payment
1. Enter Registration Fee: ₹100.00
2. Enter Consultation Fee: ₹300.00
3. Net Payable shows: ₹400.00
4. Click "Split 💰" payment mode tab
5. **Expected:** 
   - All payment fields empty
   - Balance = ₹400.00
   - User can enter amounts manually

### Test Case 4: Fee Changes
1. Select "Cash 💵" payment mode
2. Cash Amount auto-populated with ₹400.00
3. Change Consultation Fee from ₹300.00 to ₹500.00
4. **Expected:** Cash Amount automatically updates to ₹600.00

### Test Case 5: With Discount
1. Registration Fee: ₹100.00
2. Consultation Fee: ₹300.00
3. Discount: ₹50.00
4. Net Payable: ₹350.00
5. Select "Cash 💵" mode
6. **Expected:** Cash Amount = ₹350.00, Balance = ₹0.00

## Balance Calculation Logic

The balance is calculated using a unified formula across all payment fields:

```javascript
Balance = Net Payable - (Cash Amount + Bank Amount + Insurance + Staff Credit)
```

This ensures consistency whether the user:
- Uses auto-populated amounts
- Manually enters amounts
- Uses split payment mode

## Code Location

- **useEffect Hook:** Lines 806-872 in `PatientRegistration.tsx`
- **Tab onClick Handlers:** Lines 2814-2867 in `PatientRegistration.tsx`
- **Payment Field Handlers:** Lines 2903-3160 (Cash, Insurance, Staff Credit, Bank Amount)

## Benefits

1. ✅ **Faster Data Entry** - No need to type the same amount twice
2. ✅ **Fewer Errors** - Eliminates typing mistakes
3. ✅ **Better UX** - Automatically clears other fields when switching modes
4. ✅ **Smart Defaults** - Auto-selects common payment modes (UPI) and banks (SBI)
5. ✅ **Responsive** - Updates when fees change
6. ✅ **Consistent** - Works on load, tab clicks, and fee changes

## Technical Notes

- Uses React `useEffect` hook with proper dependency array
- Prevents infinite loops by checking conditions before setting state
- Follows existing code patterns in the component
- Compatible with all payment modes (Cash, Bank, Split)
- Maintains backward compatibility with manual entry

## Future Enhancements (Optional)

- Could add user preferences for default bank selection
- Could remember last used payment mode per patient
- Could add validation to prevent overpayment in split mode

---

**Status:** ✅ **IMPLEMENTED & READY FOR TESTING**

Last Updated: January 2025
