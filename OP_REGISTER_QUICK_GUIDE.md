# New and Repeat OP Register - Quick Reference

## 🎯 Quick Access
**Navigation**: Medical Records → Registers → New and Repeat OP

## 📋 Page Layout

```
┌─────────────────────────────────────────────────────────────┐
│                New and Repeat OP Register                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  FILTER SECTION                                             │
│  ┌──────────┐  ┌──────────┐  ┌─────────────┐  ┌─────────┐ │
│  │From Date │  │ To Date  │  │Patient Type │  │ Submit  │ │
│  │          │  │          │  │ [New/Repeat]│  │ Reset   │ │
│  └──────────┘  └──────────┘  └─────────────┘  └─────────┘ │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  RESULTS SECTION (After Submit)                             │
│                                                              │
│  [Search Box]          [Print] [Export]                     │
│                                                              │
│  Report Period: DD-MM-YYYY to DD-MM-YYYY                    │
│  Patient Type: New/Repeat | Total Records: XX               │
│                                                              │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Sl. │ OPNO │ Name │ Age │ Sex │ Date │ Time │ ...  │   │
│  ├─────┼──────┼──────┼─────┼─────┼──────┼──────┼──────┤   │
│  │  1  │OP001 │ John │ 45  │  M  │30-12 │10:30 │ ...  │   │
│  │  2  │OP002 │ Jane │ 32  │  F  │30-12 │11:15 │ ...  │   │
│  └─────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 📊 All Columns (Left to Right)

1. **Sl. No** - Serial Number (auto-generated)
2. **OP NO** - Outpatient Number
3. **Patient Name** - Full name
4. **Age** - Patient age
5. **Sex** - Male/Female
6. **Regn. Date** - Registration date (DD-MMM-YYYY)
7. **Regn. Time** - Registration time (HH:MM AM/PM)
8. **Department** - Department name
9. **Dr. Name** - Doctor name
10. **Pat. Type** - New/Repeat
11. **Registered By** - Username

## 🔍 Search Works On
- OP Number
- Patient Name
- Department
- Doctor Name
- Registered By

## ⚙️ Features

### ✅ Validation
- ✓ From Date is required
- ✓ To Date is required
- ✓ Patient Type is required
- ✓ From Date ≤ To Date
- ✓ No future dates allowed

### 🖨️ Print Features
- Landscape A4 format
- Clean layout (removes filters & buttons)
- Shows report header with details
- Optimized font sizes
- Print date/time included

### 📤 Export (Ready to implement)
- Excel format (.xlsx)
- Includes all visible columns
- Filtered data only
- Named with date range

## 🎨 Color Coding

```
Buttons:
├── Submit      → Blue (#0d6efd)
├── Reset       → Gray (outline)
├── Print       → Blue (outline)
└── Export      → Green (outline)

Table:
├── Header      → Light gray sticky
├── Rows        → Striped (hover effect)
└── Border      → Subtle gray
```

## ⌨️ Keyboard Shortcuts (Browser Default)
- `Ctrl+P` - Print
- `Ctrl+F` - Search in page
- `Tab` - Navigate between fields

## 📱 Responsive Behavior
- Desktop: Full 11-column table
- Tablet: Horizontal scroll enabled
- Mobile: Horizontal scroll + reduced padding

## 🚀 User Workflow

```
1. Select From Date
   ↓
2. Select To Date
   ↓
3. Choose Patient Type (New/Repeat)
   ↓
4. Click Submit
   ↓
5. View Results
   ↓
6. Optional: Search, Print, or Export
   ↓
7. Click Reset to start over
```

## ⚡ Quick Tips

1. **Fast Date Selection**
   - Use keyboard arrows in date picker
   - Or type date directly (YYYY-MM-DD)

2. **Quick Search**
   - Start typing immediately after results load
   - Clear with X button

3. **Better Printing**
   - Use landscape orientation
   - Check print preview first
   - Margins: 10mm

4. **Excel Export** (when implemented)
   - Click Export → Download starts
   - File named: `OP_Register_YYYY-MM-DD_to_YYYY-MM-DD.xlsx`

## 🔄 Common Scenarios

### Scenario 1: Today's New Patients
```
From Date: 2024-12-30
To Date:   2024-12-30
Type:      New
→ Submit
```

### Scenario 2: This Month's Repeat Patients
```
From Date: 2024-12-01
To Date:   2024-12-30
Type:      Repeat
→ Submit
```

### Scenario 3: Search Specific Doctor
```
1. Submit with date range
2. Type doctor name in search
3. View filtered results
```

## ❗ Common Errors & Solutions

| Error | Solution |
|-------|----------|
| "Please select From Date" | Fill in From Date field |
| "From Date cannot be greater than To Date" | Swap dates or adjust |
| No data showing | Check if data exists for that date range |
| Print not working | Check browser permissions |
| Search not finding | Check spelling or try partial name |

## 📞 Need Help?

1. Check validation error messages
2. Verify date range has data
3. Try resetting and starting over
4. Contact IT support if issue persists

---

**Last Updated**: December 30, 2024
