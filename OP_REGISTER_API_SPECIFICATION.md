# Backend API Specification - OP Register

## Endpoint Details

### Fetch OP Register Data

**Endpoint**: `POST /v1/medical-records/fetchOPRegister`

**Authentication**: Required (Bearer Token)

**Request Headers**:
```json
{
  "Authorization": "Bearer <token>",
  "Content-Type": "application/json"
}
```

---

## Request Payload

```typescript
{
  fromDate: string;      // Format: "YYYY-MM-DD"
  toDate: string;        // Format: "YYYY-MM-DD"
  patientType: string;   // Values: "new" or "repeat"
}
```

**Example**:
```json
{
  "fromDate": "2024-12-01",
  "toDate": "2024-12-30",
  "patientType": "new"
}
```

---

## Response Format

### Success Response (200 OK)

```typescript
{
  success: true;
  data: Array<{
    slNo: number;           // Auto-generated serial number
    opNo: string;           // OP Number (e.g., "OP2024001")
    patientName: string;    // Full patient name
    age: number;            // Patient age in years
    sex: string;            // "Male" or "Female"
    regnDate: string;       // Format: "DD-MMM-YYYY" (e.g., "30-Dec-2024")
    regnTime: string;       // Format: "HH:MM AM/PM" (e.g., "10:30 AM")
    department: string;     // Department name
    drName: string;         // Doctor's full name with prefix (e.g., "Dr. Smith")
    patType: string;        // "New" or "Repeat"
    registeredBy: string;   // Username of registration clerk
  }>;
}
```

**Example Response**:
```json
{
  "success": true,
  "data": [
    {
      "slNo": 1,
      "opNo": "OP2024001",
      "patientName": "John Doe",
      "age": 45,
      "sex": "Male",
      "regnDate": "30-Dec-2024",
      "regnTime": "10:30 AM",
      "department": "Cardiology",
      "drName": "Dr. Smith",
      "patType": "New",
      "registeredBy": "admin.user"
    },
    {
      "slNo": 2,
      "opNo": "OP2024002",
      "patientName": "Jane Smith",
      "age": 32,
      "sex": "Female",
      "regnDate": "30-Dec-2024",
      "regnTime": "11:15 AM",
      "department": "Pediatrics",
      "drName": "Dr. Johnson",
      "patType": "New",
      "registeredBy": "admin.user"
    }
  ]
}
```

### Error Response (400 Bad Request)

```json
{
  "success": false,
  "error": "Invalid date range",
  "message": "From date cannot be greater than to date"
}
```

### Error Response (500 Internal Server Error)

```json
{
  "success": false,
  "error": "Database error",
  "message": "Failed to fetch OP register data"
}
```

---

## Database Schema Reference

### Expected Tables/Columns

**Table: op_registrations** (or similar)

| Column | Type | Description |
|--------|------|-------------|
| id | INT | Primary key |
| op_number | VARCHAR | OP Number |
| patient_id | INT | Foreign key to patients table |
| patient_name | VARCHAR | Patient full name |
| age | INT | Patient age |
| sex | ENUM('Male','Female') | Patient gender |
| regn_date | DATE | Registration date |
| regn_time | TIME | Registration time |
| dept_id | INT | Foreign key to departments |
| dept_name | VARCHAR | Department name |
| doctor_id | INT | Foreign key to doctors |
| doctor_name | VARCHAR | Doctor name |
| is_new_patient | TINYINT | 1=New, 0=Repeat |
| registered_by | VARCHAR | Username who registered |
| created_at | TIMESTAMP | Record creation time |

---

## SQL Query Example

### For New Patients

```sql
SELECT 
  ROW_NUMBER() OVER (ORDER BY r.regn_date, r.regn_time) AS slNo,
  r.op_number AS opNo,
  CONCAT(p.first_name, ' ', p.last_name) AS patientName,
  TIMESTAMPDIFF(YEAR, p.date_of_birth, CURDATE()) AS age,
  p.sex AS sex,
  DATE_FORMAT(r.regn_date, '%d-%b-%Y') AS regnDate,
  DATE_FORMAT(r.regn_time, '%h:%i %p') AS regnTime,
  d.dept_name AS department,
  CONCAT('Dr. ', doc.first_name, ' ', doc.last_name) AS drName,
  CASE 
    WHEN r.is_new_patient = 1 THEN 'New'
    ELSE 'Repeat'
  END AS patType,
  u.username AS registeredBy
FROM op_registrations r
INNER JOIN patients p ON r.patient_id = p.id
INNER JOIN departments d ON r.dept_id = d.id
INNER JOIN doctors doc ON r.doctor_id = doc.id
INNER JOIN users u ON r.registered_by_uid = u.id
WHERE r.regn_date BETWEEN :fromDate AND :toDate
  AND r.is_new_patient = 1
  AND r.is_deleted = 0
ORDER BY r.regn_date, r.regn_time;
```

### For Repeat Patients

```sql
-- Same query as above, but change:
AND r.is_new_patient = 0
```

---

## Business Logic

### Patient Type Determination

**New Patient**: 
- First time visiting the hospital
- `is_new_patient = 1` in database

**Repeat Patient**:
- Previously registered patient returning for new OP
- `is_new_patient = 0` in database

### Date Range Handling

- Inclusive of both start and end dates
- Should handle same-day queries (fromDate = toDate)
- Maximum date range: No limit (but consider performance)

### Serial Number Generation

- Auto-generated starting from 1
- Based on query result order (date, time ascending)
- Not stored in database, calculated on-the-fly

---

## Performance Considerations

1. **Indexing**:
   ```sql
   CREATE INDEX idx_regn_date ON op_registrations(regn_date);
   CREATE INDEX idx_patient_type ON op_registrations(is_new_patient);
   CREATE INDEX idx_regn_combined ON op_registrations(regn_date, is_new_patient);
   ```

2. **Pagination** (future enhancement):
   - Add LIMIT and OFFSET for large datasets
   - Return total count separately

3. **Caching**:
   - Consider caching for current day's data
   - Invalidate cache on new registration

---

## Validation Rules

### Backend Validation

1. **Date Validation**:
   ```javascript
   - fromDate and toDate are required
   - fromDate must be <= toDate
   - Dates should be valid calendar dates
   - Dates should not be in future
   ```

2. **Patient Type Validation**:
   ```javascript
   - patientType must be "new" or "repeat"
   - Case-insensitive comparison
   ```

3. **Authorization**:
   ```javascript
   - User must be authenticated
   - User must have access to Medical Records module
   - Access code 51 required
   ```

---

## Error Handling

### Expected Error Scenarios

1. **Invalid Date Range**:
   - HTTP 400: "From date cannot be greater than to date"

2. **Future Dates**:
   - HTTP 400: "Cannot query future dates"

3. **Invalid Patient Type**:
   - HTTP 400: "Invalid patient type. Must be 'new' or 'repeat'"

4. **Unauthorized Access**:
   - HTTP 401: "Unauthorized"
   - HTTP 403: "Insufficient permissions"

5. **Database Error**:
   - HTTP 500: "Failed to fetch OP register data"

---

## Testing Scenarios

### Test Case 1: Valid Request
```json
Request: {
  "fromDate": "2024-12-01",
  "toDate": "2024-12-30",
  "patientType": "new"
}
Expected: HTTP 200 with data array
```

### Test Case 2: Same Date Range
```json
Request: {
  "fromDate": "2024-12-30",
  "toDate": "2024-12-30",
  "patientType": "repeat"
}
Expected: HTTP 200 with data for single day
```

### Test Case 3: Invalid Date Range
```json
Request: {
  "fromDate": "2024-12-30",
  "toDate": "2024-12-01",
  "patientType": "new"
}
Expected: HTTP 400 with error message
```

### Test Case 4: No Data Found
```json
Request: {
  "fromDate": "2024-01-01",
  "toDate": "2024-01-31",
  "patientType": "new"
}
Expected: HTTP 200 with empty data array
```

### Test Case 5: Invalid Patient Type
```json
Request: {
  "fromDate": "2024-12-01",
  "toDate": "2024-12-30",
  "patientType": "invalid"
}
Expected: HTTP 400 with error message
```

---

## Sample Postman Collection

### Request
```
POST http://localhost:3000/v1/medical-records/fetchOPRegister
Headers:
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
  Content-Type: application/json

Body (JSON):
{
  "fromDate": "2024-12-01",
  "toDate": "2024-12-30",
  "patientType": "new"
}
```

---

## Frontend Integration

The frontend is already set up to call this API. Once backend is ready:

1. **Remove mock data** from `NewRepeatOPRegister.tsx`:
   ```typescript
   // In handleSubmit(), replace mock data with:
   const response = await medicalRecordsApi.fetchOPRegister({
     fromDate,
     toDate,
     patientType,
   });
   setRegisterData(response.data || response);
   ```

2. **Error handling** is already in place
3. **Loading states** are managed
4. **Search and display** logic is ready

---

## Security Considerations

1. **SQL Injection Prevention**:
   - Use parameterized queries
   - Sanitize all inputs

2. **Access Control**:
   - Verify user has medical records access
   - Check access code 51

3. **Data Privacy**:
   - Log all data access
   - Implement audit trail

4. **Rate Limiting**:
   - Consider limiting requests per user
   - Prevent data scraping

---

## Deployment Checklist

- [ ] Create database migrations
- [ ] Add necessary indexes
- [ ] Implement endpoint in backend
- [ ] Add unit tests
- [ ] Add integration tests
- [ ] Update API documentation
- [ ] Test with sample data
- [ ] Performance test with large datasets
- [ ] Security review
- [ ] Deploy to staging
- [ ] Frontend team test integration
- [ ] Deploy to production
- [ ] Monitor for errors

---

## Future Enhancements

1. **Filters**:
   - Add department filter
   - Add doctor filter
   - Add age range filter

2. **Performance**:
   - Add pagination support
   - Implement caching strategy

3. **Features**:
   - Add export endpoint (Excel/PDF)
   - Add email report functionality
   - Add scheduled reports

---

## Contact

For questions or clarifications:
- Frontend Team: [Contact Info]
- Backend Team: [Contact Info]
- Database Team: [Contact Info]

---

**Document Version**: 1.0
**Last Updated**: December 30, 2024
**Status**: Pending Backend Implementation
