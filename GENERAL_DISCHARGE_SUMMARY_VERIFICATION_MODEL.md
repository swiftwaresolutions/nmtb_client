# General Discharge Summary - Verification Model Implementation

## Overview
This document describes the implementation of the verification model pattern for the General Discharge Summary feature. The fetch API is now **only called when the Verify button is clicked**, and all data is properly mapped through a typed verification model.

## Key Changes

### 1. Import Updates
```typescript
import {
  showSuccessToast,
  showErrorToast,
  showValidationError,
  showInfoToast,  // ✅ Added
  showLoading,
  closeAlert,
} from "../../../../utils/alertUtil";
```

### 2. PatientRecord Interface Extension
```typescript
interface PatientRecord {
  ipNo: string;
  ipDate: string;
  uhid: string;
  patientName: string;
  age: string;
  gender: string;
  consultant: string;
  status: string;
  bedNo: string;
  patId?: number;   // ✅ Added for API calls
  visitId?: number; // ✅ Added for API calls
  ipId?: number;    // ✅ Added for API calls
}
```

### 3. New Verification Model Interface
A comprehensive typed interface (`DischargeSummaryVerificationModel`) with ~65 fields including:
- Patient identification (patId, visitId, ipId)
- Discharge details (date, status, consultants)
- Medical history (past, family, menstrual, surgical)
- Vitals (BP, temperature, pulse, respiratory rate, weight, height)
- System examinations (RS, CVS, PA, CNS, PV, PS, PR)
- Investigations (X-Ray, USG, CT, Echo, outside investigations)
- Surgery details (name, procedure, notes)
- Treatment information
- Medications (drugs array with timing and duration)
- Discharge advice (disease-specific, diet, wound care, symptoms)

### 4. Mapping Functions

#### A. API Response → Verification Model
```typescript
const mapApiResponseToVerificationModel = (apiData: any): DischargeSummaryVerificationModel => {
  // Maps raw API response to strongly-typed verification model
  // Handles all 65+ fields with proper type conversions
  // Provides default values for missing fields
}
```

#### B. Verification Model → Form State
```typescript
const mapVerificationModelToForm = (model: DischargeSummaryVerificationModel): PatientFormData => {
  // Transforms verification model to form data structure
  // Converts dates to form-friendly formats
  // Maps drug array to medicines table format
  // Handles boolean conversions for UI controls
}
```

### 5. Handler Function Changes

#### handlePatientDetailsClick (Row Click)
**BEFORE:**
```typescript
const handlePatientDetailsClick = async (record: PatientRecord) => {
  setIsFetchingSummary(true);
  setSelectedPatient(record);
  setShowPatientModal(true);
  setIsEditMode(false);
  
  // ❌ API was called here on row click
  const summaryData = await apiService.fetchPatientSummary(...);
  // ... mapping logic
}
```

**AFTER:**
```typescript
const handlePatientDetailsClick = (record: PatientRecord) => {
  setSelectedPatient(record);
  setShowPatientModal(true);
  setIsEditMode(false);
  setSummaryId(null);
  
  // ✅ NO API call - just reset form to empty state
  setPatientForm({
    // ... default values
  });
};
```

#### handleVerifyClick (Verify Button Click)
**BEFORE:**
```typescript
const handleVerifyClick = async (record: PatientRecord, e: React.MouseEvent) => {
  e.stopPropagation();
  setIsFetchingSummary(true);
  setSelectedPatient(record);
  setIsEditMode(true);
  
  // ❌ Used mock data
  const mockFormData = { ... };
  setPatientForm(mockFormData);
  setShowPatientModal(true);
}
```

**AFTER:**
```typescript
const handleVerifyClick = async (record: PatientRecord, e: React.MouseEvent) => {
  e.stopPropagation();
  
  // ✅ Validate required fields
  if (!record.patId || !record.visitId || !record.ipId) {
    showValidationError("Patient ID, Visit ID, and IP ID are required");
    return;
  }
  
  setIsFetchingSummary(true);
  setSelectedPatient(record);
  setIsEditMode(true);
  
  try {
    // ✅ Fetch real data from API
    const apiResponse = await apiService.fetchPatientSummary(
      record.patId,
      record.visitId,
      record.ipId
    );
    
    if (apiResponse && apiResponse.id) {
      // ✅ Map through verification model
      const verificationModel = mapApiResponseToVerificationModel(apiResponse);
      setSummaryId(verificationModel.id || null);
      
      // ✅ Map to form
      const formData = mapVerificationModelToForm(verificationModel);
      setPatientForm(formData);
      
      showSuccessToast("Discharge summary loaded successfully");
    } else {
      // ✅ No existing summary - reset to default
      setSummaryId(null);
      setPatientForm({ /* default values */ });
      showInfoToast("No existing summary found. You can create a new one.");
    }
    
    setShowPatientModal(true);
  } catch (error: any) {
    // ✅ Proper error handling
    console.error("Error fetching discharge summary:", error);
    handleError(dispatch, error);
    showErrorToast(
      error?.response?.data?.error || "Failed to fetch discharge summary. Please try again."
    );
    
    // ✅ Reset form on error
    setSummaryId(null);
    setPatientForm({ /* default values */ });
  } finally {
    setIsFetchingSummary(false);
  }
};
```

## Workflow

### User Flow
1. **User clicks on a patient row** → Modal opens with **empty form** (no API call)
2. **User clicks "Verify" button** → 
   - Validates required fields (patId, visitId, ipId)
   - Fetches data from API
   - Maps through verification model
   - Populates form
   - Shows success/info/error message

### Data Flow
```
API Response (raw JSON)
  ↓
mapApiResponseToVerificationModel()
  ↓
DischargeSummaryVerificationModel (typed, validated)
  ↓
mapVerificationModelToForm()
  ↓
PatientFormData (UI-ready)
  ↓
setPatientForm() → Form Updates
```

## Benefits

1. **Clear Separation of Concerns**
   - Row click = UI only (no API)
   - Verify click = API fetch + data mapping

2. **Type Safety**
   - Strongly typed verification model
   - Compile-time validation
   - IntelliSense support

3. **Data Validation**
   - Required field checks before API call
   - Null/undefined handling
   - Default values for missing fields

4. **Better User Experience**
   - Fast modal opening (no waiting for API)
   - Clear messaging (success/info/error toasts)
   - Proper loading states

5. **Maintainability**
   - Single source of truth (verification model)
   - Reusable mapping functions
   - Easy to extend/modify

## API Contract

### Endpoint
```
GET /v1/clinical-information/fetchPatientSummary
```

### Parameters
- `patId`: Patient ID (number)
- `visitId`: Visit ID (number)
- `ipId`: Inpatient ID (number)

### Response Structure
Returns `DischargeSummaryVerificationModel` with 65+ fields (see interface definition in code)

### Medications Structure
```typescript
drugs: [
  {
    prodsName: string,
    quantity: number,
    timing: string,
    duration: string
  }
]
```

## Error Handling

1. **Missing Required Fields**: Shows validation error, prevents API call
2. **API Error**: Shows error toast, resets form to default, logs error
3. **No Summary Found**: Shows info toast, allows creating new summary
4. **Success**: Shows success toast, populates form with data

## Testing Checklist

- [ ] Click patient row → Modal opens with empty form (no API call)
- [ ] Click Verify without patId/visitId/ipId → Validation error shown
- [ ] Click Verify with valid IDs → API called, form populated
- [ ] Verify with existing summary → Data loaded correctly
- [ ] Verify with no summary → Info message, empty form
- [ ] API error handling → Error message, form reset
- [ ] All 65+ fields mapped correctly
- [ ] Medications array mapped to table format
- [ ] Date fields formatted properly
- [ ] Boolean fields (DOS/DOD enabled) working

## Related Files

- **Component**: `src/medical-records/pages/activities/dischargeSummary/GeneralSummary.tsx`
- **API Service**: `src/api/medical-records/medical-records-api-service.tsx`
- **Alert Utility**: `src/utils/alertUtil.ts`
- **Error Utility**: `src/utils/errorUtil.ts`

## Version
- **Date**: February 5, 2026
- **Author**: Development Team
- **Status**: ✅ Completed
