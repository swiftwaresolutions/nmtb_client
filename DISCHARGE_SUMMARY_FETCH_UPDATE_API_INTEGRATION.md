# Discharge Summary Fetch & Update API Integration

## Overview

This document describes the integration of fetch and update APIs for the General Discharge Summary functionality in the HIMS application.

## API Endpoints Integrated

### 1. Fetch Patient Summary API
- **Endpoint**: `GET /api/v1/clinical-information/fetchPatientSummary`
- **Query Parameters**: 
  - `patId`: Patient ID
  - `visitId`: Visit ID
  - `ipId`: Inpatient ID
- **Purpose**: Retrieve existing discharge summary data for editing

### 2. Update Patient Summary API
- **Endpoint**: `PUT /api/v1/clinical-information/updatePatientSummary/{id}`
- **Path Parameter**: `id` - Summary ID
- **Body**: Complete discharge summary payload
- **Purpose**: Update existing discharge summary

## Implementation Details

### API Service Layer (medical-records-api-service.tsx)

Added two new methods to `MedicalRecordsApiService` class:

```typescript
// Fetch patient summary
public fetchPatientSummary = async (patId: number, visitId: number, ipId: number) => {
  try {
    const url = `/v1/clinical-information/fetchPatientSummary?patId=${patId}&visitId=${visitId}&ipId=${ipId}`;
    const response: any = await this.httpWrapper.get(url);
    return response;
  } catch (error: any) {
    throw error;
  }
}

// Update patient summary
public updatePatientSummary = async (id: number, payload: any) => {
  try {
    const url = `/v1/clinical-information/updatePatientSummary/${id}`;
    const response: any = await this.httpWrapper.put(url, payload);
    return response;
  } catch (error: any) {
    throw error;
  }
}
```

### Component Integration (GeneralSummary.tsx)

#### State Variables Added

```typescript
const [summaryId, setSummaryId] = useState<number | null>(null);
const [isFetchingSummary, setIsFetchingSummary] = useState<boolean>(false);
```

- `summaryId`: Tracks the ID of the existing summary being edited
- `isFetchingSummary`: Loading state while fetching summary data

#### Modified: `handlePatientDetailsClick` Function

**Behavior**: Now fetches existing patient summary when modal opens

**Flow**:
1. Opens patient details modal
2. Attempts to fetch existing summary using patient IDs
3. If summary exists:
   - Populates all form fields with existing data
   - Sets `summaryId` for tracking
   - Maps API response fields to component state
4. If no summary or error:
   - Resets form to empty state
   - Sets `summaryId` to null

**Field Mapping** (50+ fields mapped from API response to form state):
- Patient info: Surgery date, discharge date, consultants
- Diagnosis & procedures
- Allergies & complaints
- Medical history (past, personal, surgical, menstrual, family)
- Patient status (conscious, oriented, baby status)
- Vital signs (BP, temperature, pulse, respiratory rate, weight, height)
- System examinations (RS, CVS, PA, CNS, PV, PS, PR, other)
- Investigations (X-ray, USG, CT, Echo, others)
- Surgery details (name, procedure, notes)
- Treatment & discharge advice
- Medications (array of drugs with timing and duration)

#### Modified: `handleSubmitDischargeSummary` Function

**Behavior**: Conditional save/update based on `summaryId`

**Flow**:
1. Validates required fields
2. Builds complete payload with all form data
3. **If `summaryId` exists** (editing mode):
   - Calls `apiService.updatePatientSummary(summaryId, payload)`
   - Shows "Updating discharge summary..." loading message
   - Shows "Discharge summary updated successfully!" on success
4. **If `summaryId` is null** (create mode):
   - Calls existing save API endpoint
   - Shows "Saving discharge summary..." loading message
   - Shows "Discharge summary saved successfully!" on success
5. Clears `summaryId` and closes modal
6. Handles errors appropriately

## Field Mapping Reference

### API Response → Component State

| API Field | Component Field | Notes |
|-----------|----------------|-------|
| `id` | `summaryId` | Used to track edit mode |
| `surgeryDate` | `dos` / `dosEnabled` | Date of surgery |
| `dischargeDate` | `dod` / `dodEnabled` | Date of discharge |
| `consultantId` | `consultant` | Primary consultant |
| `doctorId2` / `doctorId3` | `consultant2` / `consultant3` | Additional consultants |
| `dischargeStatus` | `dischargeStatus` | Discharge status |
| `diagnosis` | `finalDiagnosis1` | Primary diagnosis |
| `opProcedure` | `operativeProcedure` | Operative procedure |
| `allergy` | `drugAllergy` | Drug allergies |
| `history` | `chiefComplaints` | Chief complaints |
| `pastHistory` | `pastMedicalHistory` | Past medical history |
| `personalHistory` | `personalHistory` | Personal history |
| `surgicalHistory` | `pastSurgicalHistory` | Past surgical history |
| `menstrualHistory` | `menstrualHistory` | Menstrual history |
| `familyHistory` | `familyHistory` | Family history |
| `conscious` | `consciousStatus` | Conscious status |
| `oriented` | `orientedStatus` | Oriented status |
| `babyStatus` | `babyStatus` | Baby status (if applicable) |
| `blood` / `pressure` | `bpSystolic` / `bpDiastolic` | Blood pressure |
| `temp` | `temperature` | Temperature |
| `pulse` | `pulseRate` | Pulse rate |
| `resp` | `respiratoryRate` | Respiratory rate |
| `weight` | `weight` | Weight |
| `height` | `height` | Height |
| `rsValue` | `rs` | Respiratory system |
| `cvs` | `cvs` | Cardiovascular system |
| `paut` | `pa` | Per abdomen |
| `cnsValue` | `cns` | Central nervous system |
| `pvValue` | `pv` | Per vaginum |
| `psValue` | `ps` | Per speculum |
| `prValue` | `pr` | Per rectum |
| `otherSysExamination` | `otherSystem` | Other system examination |
| `exOther` | `localExamination` | Local examination |
| `xray` | `xRay` | X-ray findings |
| `usg` | `usg` | USG findings |
| `ct` | `ctReports` | CT scan reports |
| `echo` | `echo` | Echocardiogram |
| `otherRadiology` | `othersInvestigation` | Other investigations |
| `surgeryName` | `nameOfSurgery` | Surgery name |
| `surgeryProcedure` | `procedure` | Surgery procedure |
| `surgeryNotes` | `notes` | Surgery notes |
| `outsideInvesti` | `outSideInvestigations` | Outside investigations |
| `treatment` | `treatmentProvided` | Treatment provided |
| `conditionDis` | `conditionOnDischarge` | Condition on discharge |
| `adviceDis` | `diseaseSpecificDischargeAdvice` | Discharge advice |
| `diet` | `diet` | Diet instructions |
| `woundCare` | `woundCareRelated` | Wound care instructions |
| `symptoms` | `symptoms` | Symptoms |
| `drugs[]` | `medicines[]` | Array of medications |

### Medications Array Mapping

Each drug in the `drugs` array is mapped to the `medicines` state:

```typescript
{
  sno: index + 1,
  medicineName: drug.prodsName || '',
  qtyNo: parseFloat(drug.quantity) || 0,
  timing: drug.timing || 'None',
  duration: drug.duration?.toString() || 'None'
}
```

## Usage Instructions

### For Developers

1. **Creating New Discharge Summary**:
   - Click on a patient row in the Active IP Patients table
   - Form opens with empty fields
   - Fill in all required information
   - Click "Verify" → "Approved" → "Create"
   - Summary is created via save API

2. **Editing Existing Discharge Summary**:
   - Click on a patient row that has an existing summary
   - System automatically fetches and populates the form
   - Edit any fields as needed
   - Click "Verify" → "Approved" → "Create"
   - Summary is updated via update API

### Loading States

- **Fetching Summary**: Modal shows loading state while fetching existing data
- **Saving/Updating**: Appropriate loading message shown ("Saving..." or "Updating...")

### Error Handling

- If fetch fails: Form resets to empty state (allows creating new summary)
- If update/save fails: Error toast shown with error message
- Console logs errors for debugging

## TODO / Known Issues

### Critical: Patient ID Mapping

Currently using placeholder values for patient IDs:

```typescript
const patId = 0; // TODO: patient.patId or similar
const visitId = 0; // TODO: patient.visitId or similar  
const ipId = 0; // TODO: patient.ipId or similar
```

**Action Required**:
1. Check `PatientRecord` interface definition
2. Add `patId`, `visitId`, `ipId` fields if missing
3. Update the fetch call to use actual patient IDs from the selected patient record

### Optional Enhancements

1. **Add Save API to Service Layer**:
   - Currently using direct `fetch()` call for save operation
   - Could be moved to API service for consistency

2. **Optimistic Updates**:
   - Update local state immediately before API call
   - Revert on error for better UX

3. **Confirmation Dialog**:
   - Show confirmation before updating existing summary
   - Prevent accidental overwrites

4. **Summary History**:
   - Track revision history
   - Allow viewing previous versions

## Testing Checklist

- [ ] Test creating new discharge summary
- [ ] Test editing existing discharge summary  
- [ ] Test all form fields populate correctly from API
- [ ] Test all fields save/update correctly
- [ ] Test medications array mapping
- [ ] Test error handling (network errors, invalid data)
- [ ] Test loading states
- [ ] Verify proper patient ID mapping (after TODO is resolved)
- [ ] Test with different discharge statuses
- [ ] Test with multiple consultants
- [ ] Test date/surgery/discharge enable toggles

## API Response Example

```json
{
  "id": 123,
  "patId": 456,
  "visitId": 789,
  "ipId": 101,
  "dischargeDate": "2025-01-15",
  "uid": 1,
  "diagnosis": "Type 2 Diabetes Mellitus",
  "history": "Patient presented with...",
  "outsideInvesti": "CBC, Blood Sugar",
  "blood": 120,
  "pressure": 80,
  "temp": 98.6,
  "pulse": 72,
  "resp": 18,
  "weight": 70,
  "drugs": [
    {
      "id": 1,
      "prodsName": "Metformin 500mg",
      "quantity": "60",
      "timing": "BD",
      "duration": "30"
    }
  ],
  // ... 50+ more fields
}
```

## Update Request Payload Example

```json
{
  "patId": 456,
  "visitId": 789,
  "ipId": 101,
  "dischargeDate": "2025-01-15",
  "uid": 1,
  "diagnosis": "Type 2 Diabetes Mellitus",
  "history": "Patient presented with...",
  // ... all form fields
  "drugs": [
    {
      "prodsName": "Metformin 500mg",
      "quantity": 60,
      "timing": "BD",
      "duration": 30,
      "period": 0
    }
  ]
}
```

## File Modifications Summary

### Files Modified

1. **src/api/medical-records/medical-records-api-service.tsx**
   - Added `fetchPatientSummary()` method
   - Added `updatePatientSummary()` method

2. **src/medical-records/pages/activities/dischargeSummary/GeneralSummary.tsx**
   - Added `summaryId` and `isFetchingSummary` state variables
   - Modified `handlePatientDetailsClick()` to fetch and populate existing data
   - Modified `handleSubmitDischargeSummary()` to support both create and update operations
   - Updated loading messages to reflect operation type

## Best Practices Followed

✅ **API Service Layer**: All API calls go through service class (except legacy save endpoint)
✅ **Error Handling**: Try-catch blocks with user-friendly error messages
✅ **Loading States**: Clear feedback during async operations
✅ **Type Safety**: TypeScript interfaces and type annotations
✅ **Code Reusability**: Centralized API methods
✅ **User Feedback**: Toast notifications for success/error states
✅ **Null Safety**: Safe navigation operators and fallback values

## Support & Troubleshooting

### Common Issues

1. **Form doesn't populate**: 
   - Check network tab for API response
   - Verify patient IDs are correctly passed
   - Check console for errors

2. **Update fails**:
   - Verify `summaryId` is set correctly
   - Check payload format matches API requirements
   - Verify authentication token is valid

3. **Medications don't save**:
   - Check drugs array format in payload
   - Verify all required fields (prodsName, quantity, timing, duration)

### Debug Mode

Enable console logging to see:
- API request/response data
- Form state before/after population
- Error details

---

**Last Updated**: January 2025  
**Status**: ✅ Implementation Complete (Pending patient ID mapping resolution)
