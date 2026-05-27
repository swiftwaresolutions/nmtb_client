# IP Constant Charges - Testing Guide

## Quick Test Scenarios

### 1. Test IP Patient Charges Loading

**Steps:**
1. Open Cash Counter → Billing page
2. Select "IP Billing" tab
3. Enter an IP patient's OP number (e.g., patient with ipId > 0)
4. Press Enter or Tab

**Expected Result:**
- ✅ Patient details load in right panel
- ✅ Console shows: "IP patient detected, fetching constant charges..."
- ✅ Console shows IP ID and Admit DateTime
- ✅ Console shows: "Constant charges response: [...]"
- ✅ IP Stay Details section shows ward(s) with charges
- ✅ Total displayed in header matches sum of all charges
- ✅ Each ward has a numbered badge and charges listed below

**Screenshot Indicators:**
- Ward header with blue badge
- Charges table with serial numbers
- Total amount in header

---

### 2. Test OP Patient (No Charges)

**Steps:**
1. Open Cash Counter → Billing page
2. Select "IP Billing" tab
3. Enter an OP patient's OP number (patient with ipId = 0 or null)
4. Press Enter or Tab

**Expected Result:**
- ✅ Patient details load
- ✅ Console shows: "OP patient - no constant charges to fetch"
- ✅ IP Stay Details shows "No IP Charges" message
- ✅ No API call to fetchConstantCharges endpoint

---

### 3. Test Bill Date Change

**Steps:**
1. Load an IP patient (as in Test 1)
2. Check the "BILL DATE & TIME" checkbox
3. Select a past date (e.g., 3 days ago)
4. Observe the changes

**Expected Result:**
- ✅ Console shows new API call with updated dischargeDate parameter
- ✅ Charges may update based on date range
- ✅ Console logs: "Constant charges response: [...]"
- ✅ Table refreshes with new data

**Network Tab Verification:**
- Check browser Network tab
- Look for GET request to `/api/v1/cash-counter/fetchConstantCharges`
- Verify parameters:
  - `ipId`: Patient's IP ID
  - `admissionDate`: Patient's admission date (YYYY-MM-DD)
  - `dischargeDate`: Selected bill date or current date (YYYY-MM-DD)

---

### 4. Test Bill Date Uncheck

**Steps:**
1. Have an IP patient loaded with BILL DATE checked
2. Uncheck the "BILL DATE & TIME" checkbox
3. Observe the changes

**Expected Result:**
- ✅ New API call with current date as dischargeDate
- ✅ Charges update automatically
- ✅ Console shows updated response

---

### 5. Test Multiple Wards

**Steps:**
1. Load an IP patient who has been transferred between wards
2. Check the displayed charges

**Expected Result:**
- ✅ Multiple ward headers displayed (WARD 1, WARD 2, etc.)
- ✅ Each ward shows its charges separately
- ✅ Serial numbers continue sequentially across wards
- ✅ Total includes all charges from all wards

**Example Display:**
```
[1] WARD: General Ward
  1. Admission Fees              100.00
  2. Bed Charges                 500.00
  3. Nursing Charges             300.00

[2] WARD: ICU
  4. ICU Bed Charges            2000.00
  5. Monitoring Charges          500.00
```

---

### 6. Test Empty Charges Response

**Steps:**
1. Load an IP patient with no charges (newly admitted)
2. Check the display

**Expected Result:**
- ✅ Shows "No IP Charges" message
- ✅ No ward headers displayed
- ✅ Console shows: "Constant charges response: []"

---

### 7. Test Error Handling

**Steps:**
1. Disconnect network or stop backend server
2. Load an IP patient
3. Observe error handling

**Expected Result:**
- ✅ Error toast appears: "Failed to fetch IP charges"
- ✅ Console shows error details
- ✅ Patient details still load (if cached)
- ✅ IP Stay Details shows "No IP Charges" fallback

---

## Browser Console Checks

### Expected Console Logs (IP Patient):

```
Patient API Response: {ipId: 123, admitDateTime: "2025-01-15T10:30:00", ...}
Patient visitId: 0
Patient isInOp: false
IP patient detected, fetching constant charges...
IP ID: 123
Admit DateTime: 2025-01-15T10:30:00
Constant charges response: [
  {
    wardName: "General Ward",
    charges: [
      {chargeName: "Admission Fees", totalAmount: 100},
      {chargeName: "Bed Charges", totalAmount: 500}
    ]
  }
]
```

### Expected Console Logs (OP Patient):

```
Patient API Response: {ipId: 0, ...}
Patient visitId: 456
Patient isInOp: true
OP patient - no constant charges to fetch
```

---

## Network Tab Verification

### Request Details:

**URL:** `http://192.168.1.210:9090/api/v1/cash-counter/fetchConstantCharges`

**Method:** GET

**Query Parameters:**
- `ipId`: 123 (example)
- `admissionDate`: 2025-01-15
- `dischargeDate`: 2025-01-20

**Request Headers:**
- `Authorization`: Bearer [token]
- `Content-Type`: application/json

### Response Structure:

```json
[
  {
    "wardName": "General Ward",
    "charges": [
      {
        "chargeName": "Admission Fees",
        "totalAmount": 100.00
      },
      {
        "chargeName": "Bed Charges (5 days)",
        "totalAmount": 2500.00
      },
      {
        "chargeName": "Nursing Charges",
        "totalAmount": 1500.00
      }
    ]
  },
  {
    "wardName": "ICU",
    "charges": [
      {
        "chargeName": "ICU Bed (2 days)",
        "totalAmount": 4000.00
      },
      {
        "chargeName": "Monitoring",
        "totalAmount": 1000.00
      }
    ]
  }
]
```

---

## Visual Verification

### IP Stay Details Table:

```
┌──────────────────────────────────────────────────────────────┐
│ STAY DETAILS                              Grand Total: ₹8,600│
├──────────────────────────────────────────────────────────────┤
│ #  | Particulars          | Days | Rate    | Total           │
├──────────────────────────────────────────────────────────────┤
│ [1] WARD: General Ward                                       │
│ 1  | Admission Fees       |  —   |   —     | 100.00          │
│ 2  | Bed Charges (5 days) |  —   |   —     | 2,500.00        │
│ 3  | Nursing Charges      |  —   |   —     | 1,500.00        │
├──────────────────────────────────────────────────────────────┤
│ [2] WARD: ICU                                                │
│ 4  | ICU Bed (2 days)     |  —   |   —     | 4,000.00        │
│ 5  | Monitoring           |  —   |   —     | 1,000.00        │
└──────────────────────────────────────────────────────────────┘
```

### Key Visual Elements:
- ✅ Ward headers with blue background and badge
- ✅ Sequential numbering starting from 1
- ✅ Charges indented under ward headers
- ✅ Total column shows amounts
- ✅ Days and Rate columns show "—" (not provided by API)
- ✅ Header shows Grand Total

---

## Common Issues & Solutions

### Issue 1: Charges Not Loading

**Symptoms:**
- "No IP Charges" message appears for IP patient
- No console logs about IP detection

**Check:**
1. Is `ipId > 0` in patient response?
2. Does patient have `admitDateTime`?
3. Check browser console for errors
4. Verify backend API is running

**Solution:**
- Ensure patient is actually admitted (ipId should be set)
- Check database for admission record

---

### Issue 2: Bill Date Not Updating Charges

**Symptoms:**
- Changing bill date doesn't refresh charges
- No new API call in Network tab

**Check:**
1. Is useEffect dependency array correct?
2. Console logs for API call
3. Network tab for request

**Solution:**
- Verify `billDateTime` and `showBillDate` states are updating
- Check useEffect at lines 263-267 in Billing.tsx

---

### Issue 3: Wrong Date Format in API Call

**Symptoms:**
- API returns error about invalid date format
- 400 Bad Request in Network tab

**Check:**
1. Console log the date parameters
2. Verify format is YYYY-MM-DD

**Solution:**
- Check date conversion: `new Date(admitDateTime).toISOString().split('T')[0]`
- Ensure `admitDateTime` is valid ISO string

---

### Issue 4: Duplicate Admission Fees

**Symptoms:**
- Admission fees appear twice
- Total is higher than expected

**Check:**
1. Look for hardcoded admission fee in IPBilling.tsx
2. Check if API includes admission fees

**Solution:**
- API now includes admission fees in charges array
- No separate addition needed
- Verify lines 82-86 in IPBilling.tsx

---

## Backend API Testing

### Using Postman/cURL:

```bash
curl -X GET "http://192.168.1.210:9090/api/v1/cash-counter/fetchConstantCharges?ipId=123&admissionDate=2025-01-15&dischargeDate=2025-01-20" \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### Expected Response:

```json
[
  {
    "wardName": "General Ward",
    "charges": [
      {
        "chargeName": "Admission Fees",
        "totalAmount": 100.00
      }
    ]
  }
]
```

---

## Performance Testing

1. **Load Time:** Charges should load within 1-2 seconds of patient fetch
2. **Date Change:** Charges should refresh within 1 second of date change
3. **Large Dataset:** Should handle 50+ charges across multiple wards smoothly
4. **Memory:** No memory leaks on repeated patient loads

---

## Accessibility Testing

- [ ] Keyboard navigation works (Tab key)
- [ ] Screen reader announces ward changes
- [ ] Table headers are properly labeled
- [ ] Focus indicators are visible
- [ ] Color contrast meets WCAG standards

---

## Sign-off Checklist

- [ ] IP patient charges load automatically ✅
- [ ] OP patient shows "No IP Charges" ✅
- [ ] Bill date changes refresh charges ✅
- [ ] Multiple wards display correctly ✅
- [ ] Serial numbering is sequential ✅
- [ ] Totals calculate correctly ✅
- [ ] Error handling works ✅
- [ ] Console logs provide debugging info ✅
- [ ] Network requests use correct parameters ✅
- [ ] No hardcoded admission fees ✅

---

**Testing Completed By:** _________________
**Date:** _________________
**Version:** 1.0
**Status:** ⬜ Pass | ⬜ Fail | ⬜ Need Revision
