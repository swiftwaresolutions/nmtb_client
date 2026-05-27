# New and Repeat OP Register - Implementation Guide

## Overview
This document describes the implementation of the **New and Repeat OP Register** report in the Medical Records module.

## 📍 Location
- **Module**: Medical Records
- **Submenu**: Registers
- **Page Name**: New and Repeat OP
- **Route**: `/hims/medical-records/registers/op`

---

## ✨ Features Implemented

### 1. **Filter Criteria**
- **From Date** (Required) - Start date for the report
- **To Date** (Required) - End date for the report
- **Patient Type** (Required) - Dropdown to select:
  - New (New patients)
  - Repeat (Repeat/returning patients)

### 2. **Report Columns**
The report displays the following columns:

| Column | Description |
|--------|-------------|
| Sl. No | Serial Number |
| OP NO | Outpatient Number |
| Patient Name | Full name of the patient |
| Age | Patient's age |
| Sex | Patient's gender |
| Regn. Date | Registration date |
| Regn. Time | Registration time |
| Department | Department name |
| Dr. Name | Doctor's name |
| Pat. Type | Patient type (New/Repeat) |
| Registered By | Username of the person who registered |

### 3. **Search Functionality**
- Real-time search across multiple fields:
  - OP Number
  - Patient Name
  - Department
  - Doctor Name
  - Registered By
- Shows result count (e.g., "Showing 5 of 10 results")
- Clear button to reset search

### 4. **Actions**
- **Submit** - Fetch data based on filters
- **Reset** - Clear all filters and results
- **Print** - Print the report in landscape A4 format
- **Export** - Export to Excel (ready for implementation)

### 5. **Validation**
- All three fields (From Date, To Date, Patient Type) are mandatory
- From Date cannot be greater than To Date
- Dates cannot be future dates

---

## 📁 Files Created/Modified

### Created Files:
1. **Component**: `src/medical-records/pages/registers/NewRepeatOPRegister.tsx`
   - Main report page with filters, table, search, and print functionality

### Modified Files:
1. **Routes**: `src/routes/AppRouter.tsx`
   - Added import for NewRepeatOPRegister component
   - Added route mapping

2. **API Service**: `src/api/medical-records/medical-records-api-service.tsx`
   - Added `fetchOPRegister()` method for fetching register data

---

## 🔧 Technical Implementation

### Component Structure
```
NewRepeatOPRegister
├── Filter Card (From Date, To Date, Patient Type)
├── Results Card (shown after submit)
│   ├── Action Bar (Search + Print/Export buttons)
│   ├── Report Summary (Report period, patient type, total records)
│   └── Data Table (with all columns)
```

### State Management
```typescript
- fromDate: string          // Filter: From date
- toDate: string            // Filter: To date
- patientType: string       // Filter: 'new' or 'repeat'
- registerData: array       // Fetched data
- loading: boolean          // Loading state
- hasSearched: boolean      // Whether search has been performed
- searchTerm: string        // Search input value
```

### API Integration
```typescript
// API Endpoint (to be implemented on backend)
POST /v1/medical-records/fetchOPRegister

// Request Payload
{
  fromDate: "2024-12-01",
  toDate: "2024-12-30",
  patientType: "new"  // or "repeat"
}

// Response Format
[
  {
    slNo: 1,
    opNo: "OP2024001",
    patientName: "John Doe",
    age: 45,
    sex: "Male",
    regnDate: "30-Dec-2024",
    regnTime: "10:30 AM",
    department: "Cardiology",
    drName: "Dr. Smith",
    patType: "New",
    registeredBy: "Admin User"
  },
  // ... more records
]
```

---

## 🎨 Design Features

### Modern UI Components
- **Gradient Cards**: Professional gradient backgrounds
- **Sticky Table Headers**: Header remains visible while scrolling
- **Responsive Layout**: Adapts to different screen sizes
- **Loading Indicators**: Shows loading state during API calls
- **Empty States**: Clear messages when no data is available

### Print Functionality
- **Landscape A4 Format**: Optimized for printing
- **Print Header**: Shows report title, period, and print date
- **Clean Layout**: Removes search bars and action buttons
- **Optimized Font Sizes**: Smaller fonts for better fit
- **Border Styling**: Clear borders for printed tables

### Color Scheme
- Primary Action: `#0d6efd` (Blue)
- Success: `#28a745` (Green)
- Danger: `#dc3545` (Red)
- Info Background: `#f8f9fa` to `#e9ecef` gradient

---

## 🚀 How to Use

### For Users:
1. Navigate to **Medical Records > Registers > New and Repeat OP**
2. Select **From Date** and **To Date**
3. Choose **Patient Type** (New or Repeat)
4. Click **Submit** to fetch the data
5. Use the **search box** to filter results
6. Click **Print** to print the report
7. Click **Export** to download as Excel
8. Click **Reset** to clear and start over

### For Developers:
1. **Backend Integration**:
   ```typescript
   // Replace mock data in handleSubmit() with:
   const response = await medicalRecordsApi.fetchOPRegister({
     fromDate,
     toDate,
     patientType,
   });
   setRegisterData(response);
   ```

2. **Excel Export Implementation**:
   ```typescript
   // Add library: npm install xlsx
   import * as XLSX from 'xlsx';
   
   const handleExport = () => {
     const worksheet = XLSX.utils.json_to_sheet(filteredData);
     const workbook = XLSX.utils.book_new();
     XLSX.utils.book_append_sheet(workbook, worksheet, "OP Register");
     XLSX.writeFile(workbook, `OP_Register_${fromDate}_to_${toDate}.xlsx`);
   };
   ```

---

## 🔐 Access Control

The menu item already has access code configured:
- **Access Code**: 51
- Controlled via the Medical Records menu configuration
- Only users with proper permissions can access this report

---

## 📊 Sample Data Structure

### Backend Database Query (Example)
```sql
SELECT 
  ROW_NUMBER() OVER (ORDER BY regn_date, regn_time) AS slNo,
  op_number AS opNo,
  patient_name AS patientName,
  age,
  sex,
  DATE_FORMAT(regn_date, '%d-%b-%Y') AS regnDate,
  DATE_FORMAT(regn_time, '%h:%i %p') AS regnTime,
  dept_name AS department,
  doctor_name AS drName,
  CASE 
    WHEN is_new_patient = 1 THEN 'New'
    ELSE 'Repeat'
  END AS patType,
  registered_by AS registeredBy
FROM op_registrations
WHERE regn_date BETWEEN ? AND ?
  AND is_new_patient = ?
ORDER BY regn_date, regn_time;
```

---

## ✅ Testing Checklist

- [ ] Filter validation works correctly
- [ ] Date range validation prevents invalid dates
- [ ] Data fetches correctly for both New and Repeat types
- [ ] Search functionality works across all fields
- [ ] Table displays all columns properly
- [ ] Print function works and formats correctly
- [ ] Export to Excel generates proper file
- [ ] Empty state messages display correctly
- [ ] Loading states show during API calls
- [ ] Reset button clears all data and filters
- [ ] Responsive design works on different screen sizes
- [ ] Print preview shows proper landscape format

---

## 🛠 Future Enhancements

1. **Additional Filters**:
   - Department filter
   - Doctor filter
   - Age range filter
   - Gender filter

2. **Advanced Features**:
   - Date range presets (Today, This Week, This Month, etc.)
   - Sort by columns
   - Pagination for large datasets
   - PDF export option
   - Email report functionality

3. **Analytics**:
   - Summary statistics (total new vs repeat)
   - Department-wise breakdown
   - Doctor-wise patient count
   - Peak registration times

---

## 📝 Notes

- Currently using **mock data** for demonstration
- Replace mock data with actual API call when backend is ready
- Excel export requires `xlsx` library installation
- Print styles are embedded in the component for easy maintenance

---

## 🐛 Troubleshooting

### Issue: Data not fetching
**Solution**: Check if API endpoint is implemented and accessible

### Issue: Print not formatting correctly
**Solution**: Check browser print preview settings (should be landscape)

### Issue: Search not working
**Solution**: Ensure search fields match the data property names

### Issue: Dates showing incorrectly
**Solution**: Verify date format matches the expected format from backend

---

## 📞 Support

For issues or questions, contact the development team or refer to:
- Main documentation: `MEDICAL_RECORDS_IMPLEMENTATION.md`
- Search pattern guide: `SEARCH_PATTERN_GUIDE.md`
- Alert utility guide: `src/utils/ALERT_UTILITY_GUIDE.md`

---

**Implementation Date**: December 30, 2024
**Version**: 1.0.0
**Status**: Ready for backend integration
