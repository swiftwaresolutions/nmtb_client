import React from 'react';
import PrintHeader from '../../components/PrintHeader';

interface OrganizationInfo {
  name: string;
  code: string;
  address: string;
  phone: string;
  itNo: string;
  salesTax: string;
}

interface PatientDetails {
  patId?: number;
  displayNumber?: string;
  ipNo?: string;
  name?: string;
  secName?: string;
  age?: string | number;
  sex?: string;
  dob?: string;
  gname?: string;
  guardianType?: string;
  phone?: string;
  email?: string;
  add1?: string;
  add2?: string;
  village?: string;
  post?: string;
  district?: string;
  state?: string;
  pincode?: string;
  doctorName?: string;
  departmentName?: string;
  complaintName?: string;
  lastVisitDate?: string;
  admitDateTime?: string;
  wardName?: string;
  bedNo?: string;
  accountCategory?: string;
  debitHead?: string;
  advBalance?: number;
  dueBalance?: number;
  govIdType?: string;
  govIdNo?: string;
}

interface Props {
  organization: OrganizationInfo;
  patientDetails: PatientDetails;
}

const OccupiedBedPatientPrint: React.FC<Props> = ({
  organization,
  patientDetails,
}) => {
  return (
    <div
      style={{
        width: "210mm",
        minHeight: "297mm",
        padding: "15mm",
        backgroundColor: "#ffffff",
        fontFamily: "Arial, sans-serif",
      }}
    >
      {/* Print Header */}
      <PrintHeader organization={organization} gstNumber={organization.itNo} />

      {/* Title */}
      <div
        style={{
          textAlign: "center",
          margin: "12px 0 20px 0",
          borderBottom: "3px solid #2c3e50",
          paddingBottom: "10px",
        }}
      >
        <h4
          style={{
            margin: 0,
            fontSize: "var(--font-size-xl)",
            fontWeight: "var(--font-weight-bold)",
            letterSpacing: "1.5px",
            color: "#2c3e50",
            textTransform: "uppercase",
          }}
        >
          PATIENT DETAILS
        </h4>
      </div>

      {/* Content Table */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "var(--font-size-sm)",
          border: "2px solid #2c3e50",
        }}
      >
        <tbody>
          {/* IP NO and OP NO */}
          <tr>
            <td
              style={{
                borderBottom: "2px solid #2c3e50",
                padding: "12px 15px",
                width: "25%",
                fontWeight: "var(--font-weight-bold)",
                color: "#495057",
                fontSize: "var(--font-size-sm)",
                backgroundColor: "#f8f9fa",
              }}
            >
              IP NO
            </td>
            <td
              style={{
                borderBottom: "2px solid #2c3e50",
                padding: "12px 15px",
                width: "25%",
                color: "#2c3e50",
                fontWeight: "var(--font-weight-semibold)",
                backgroundColor: "#f8f9fa",
              }}
            >
              {patientDetails.ipNo || 'N/A'}
            </td>
            <td
              style={{
                borderBottom: "2px solid #2c3e50",
                padding: "12px 15px",
                width: "25%",
                fontWeight: "var(--font-weight-bold)",
                color: "#495057",
                fontSize: "var(--font-size-sm)",
                backgroundColor: "#f8f9fa",
              }}
            >
              OP NO
            </td>
            <td
              style={{
                borderBottom: "2px solid #2c3e50",
                padding: "12px 15px",
                width: "25%",
                color: "#2c3e50",
                fontWeight: "var(--font-weight-semibold)",
                backgroundColor: "#f8f9fa",
              }}
            >
              {patientDetails.displayNumber || 'N/A'}
            </td>
          </tr>

          {/* Patient Name and Age/Sex */}
          <tr>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "12px 15px",
                fontWeight: "var(--font-weight-bold)",
                color: "#495057",
                fontSize: "var(--font-size-sm)",
              }}
            >
              PATIENT NAME
            </td>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "12px 15px",
                color: "#2c3e50",
                fontWeight: "var(--font-weight-semibold)",
              }}
            >
              {`${patientDetails.name || ''} ${patientDetails.secName || ''}`.trim() || 'N/A'}
            </td>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "12px 15px",
                fontWeight: "var(--font-weight-bold)",
                color: "#495057",
                fontSize: "var(--font-size-sm)",
              }}
            >
              AGE & SEX
            </td>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "12px 15px",
                color: "#2c3e50",
                fontWeight: "var(--font-weight-semibold)",
              }}
            >
              {`${patientDetails.age || 'N/A'} / ${patientDetails.sex || 'N/A'}`}
            </td>
          </tr>

          {/* DOB and Guardian Name */}
          <tr>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "12px 15px",
                fontWeight: "var(--font-weight-bold)",
                color: "#495057",
                fontSize: "var(--font-size-sm)",
              }}
            >
              DATE OF BIRTH
            </td>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "12px 15px",
                color: "#2c3e50",
                fontWeight: "var(--font-weight-semibold)",
              }}
            >
              {patientDetails.dob || 'N/A'}
            </td>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "12px 15px",
                fontWeight: "var(--font-weight-bold)",
                color: "#495057",
                fontSize: "var(--font-size-sm)",
              }}
            >
              GUARDIAN NAME
            </td>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "12px 15px",
                color: "#2c3e50",
                fontWeight: "var(--font-weight-semibold)",
              }}
            >
              {patientDetails.gname || 'N/A'} ({patientDetails.guardianType || 'N/A'})
            </td>
          </tr>

          {/* Phone and Email */}
          <tr>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "12px 15px",
                fontWeight: "var(--font-weight-bold)",
                color: "#495057",
                fontSize: "var(--font-size-sm)",
              }}
            >
              PHONE
            </td>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "12px 15px",
                color: "#2c3e50",
                fontWeight: "var(--font-weight-semibold)",
              }}
            >
              {patientDetails.phone || 'N/A'}
            </td>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "12px 15px",
                fontWeight: "var(--font-weight-bold)",
                color: "#495057",
                fontSize: "var(--font-size-sm)",
              }}
            >
              EMAIL
            </td>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "12px 15px",
                color: "#2c3e50",
                fontWeight: "var(--font-weight-semibold)",
              }}
            >
              {patientDetails.email || 'N/A'}
            </td>
          </tr>

          {/* Address */}
          <tr>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "12px 15px",
                fontWeight: "var(--font-weight-bold)",
                color: "#495057",
                fontSize: "var(--font-size-sm)",
              }}
            >
              ADDRESS
            </td>
            <td
              colSpan={3}
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "12px 15px",
                color: "#2c3e50",
                fontWeight: "var(--font-weight-semibold)",
              }}
            >
              {[patientDetails.add1, patientDetails.add2, patientDetails.village, patientDetails.post]
                .filter(Boolean)
                .join(', ') || 'N/A'}
            </td>
          </tr>

          {/* District, State, Pincode */}
          <tr>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "12px 15px",
                fontWeight: "var(--font-weight-bold)",
                color: "#495057",
                fontSize: "var(--font-size-sm)",
              }}
            >
              DISTRICT
            </td>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "12px 15px",
                color: "#2c3e50",
                fontWeight: "var(--font-weight-semibold)",
              }}
            >
              {patientDetails.district || 'N/A'}
            </td>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "12px 15px",
                fontWeight: "var(--font-weight-bold)",
                color: "#495057",
                fontSize: "var(--font-size-sm)",
              }}
            >
              STATE / PINCODE
            </td>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "12px 15px",
                color: "#2c3e50",
                fontWeight: "var(--font-weight-semibold)",
              }}
            >
              {patientDetails.state || 'N/A'} / {patientDetails.pincode || 'N/A'}
            </td>
          </tr>

          {/* Doctor and Department */}
          <tr>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "12px 15px",
                fontWeight: "var(--font-weight-bold)",
                color: "#495057",
                fontSize: "var(--font-size-sm)",
              }}
            >
              DOCTOR
            </td>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "12px 15px",
                color: "#2c3e50",
                fontWeight: "var(--font-weight-semibold)",
              }}
            >
              {patientDetails.doctorName || 'N/A'}
            </td>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "12px 15px",
                fontWeight: "var(--font-weight-bold)",
                color: "#495057",
                fontSize: "var(--font-size-sm)",
              }}
            >
              DEPARTMENT
            </td>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "12px 15px",
                color: "#2c3e50",
                fontWeight: "var(--font-weight-semibold)",
              }}
            >
              {patientDetails.departmentName || 'N/A'}
            </td>
          </tr>

          {/* Complaint and Last Visit Date */}
          <tr>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "12px 15px",
                fontWeight: "var(--font-weight-bold)",
                color: "#495057",
                fontSize: "var(--font-size-sm)",
              }}
            >
              COMPLAINT
            </td>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "12px 15px",
                color: "#2c3e50",
                fontWeight: "var(--font-weight-semibold)",
              }}
            >
              {patientDetails.complaintName || 'N/A'}
            </td>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "12px 15px",
                fontWeight: "var(--font-weight-bold)",
                color: "#495057",
                fontSize: "var(--font-size-sm)",
              }}
            >
              LAST VISIT DATE
            </td>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "12px 15px",
                color: "#2c3e50",
                fontWeight: "var(--font-weight-semibold)",
              }}
            >
              {patientDetails.lastVisitDate || 'N/A'}
            </td>
          </tr>

          {/* Admission Date & Time and Ward */}
          <tr>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "12px 15px",
                fontWeight: "var(--font-weight-bold)",
                color: "#495057",
                fontSize: "var(--font-size-sm)",
              }}
            >
              ADMISSION DATE & TIME
            </td>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "12px 15px",
                color: "#2c3e50",
                fontWeight: "var(--font-weight-semibold)",
              }}
            >
              {patientDetails.admitDateTime || 'N/A'}
            </td>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "12px 15px",
                fontWeight: "var(--font-weight-bold)",
                color: "#495057",
                fontSize: "var(--font-size-sm)",
              }}
            >
              WARD
            </td>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "12px 15px",
                color: "#2c3e50",
                fontWeight: "var(--font-weight-semibold)",
              }}
            >
              {patientDetails.wardName || 'N/A'}
            </td>
          </tr>

          {/* Bed Number and Account Category */}
          <tr>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "12px 15px",
                fontWeight: "var(--font-weight-bold)",
                color: "#495057",
                fontSize: "var(--font-size-sm)",
              }}
            >
              BED NUMBER
            </td>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "12px 15px",
                color: "#2c3e50",
                fontWeight: "var(--font-weight-semibold)",
              }}
            >
              {patientDetails.bedNo || 'N/A'}
            </td>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "12px 15px",
                fontWeight: "var(--font-weight-bold)",
                color: "#495057",
                fontSize: "var(--font-size-sm)",
              }}
            >
              ACCOUNT CATEGORY
            </td>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "12px 15px",
                color: "#2c3e50",
                fontWeight: "var(--font-weight-semibold)",
              }}
            >
              {patientDetails.accountCategory || 'N/A'}
            </td>
          </tr>

          {/* Account Head and Advance Balance */}
          <tr>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "12px 15px",
                fontWeight: "var(--font-weight-bold)",
                color: "#495057",
                fontSize: "var(--font-size-sm)",
              }}
            >
              ACCOUNT HEAD
            </td>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "12px 15px",
                color: "#2c3e50",
                fontWeight: "var(--font-weight-semibold)",
              }}
            >
              {patientDetails.debitHead || 'N/A'}
            </td>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "12px 15px",
                fontWeight: "var(--font-weight-bold)",
                color: "#495057",
                fontSize: "var(--font-size-sm)",
              }}
            >
              ADVANCE BALANCE
            </td>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "12px 15px",
                color: "#2c3e50",
                fontWeight: "var(--font-weight-semibold)",
              }}
            >
              ₹{patientDetails.advBalance?.toFixed(2) || '0.00'}
            </td>
          </tr>

          {/* Due Balance and Government ID */}
          <tr>
            <td
              style={{
                padding: "12px 15px",
                fontWeight: "var(--font-weight-bold)",
                color: "#495057",
                fontSize: "var(--font-size-sm)",
              }}
            >
              DUE BALANCE
            </td>
            <td
              style={{
                padding: "12px 15px",
                color: "#2c3e50",
                fontWeight: "var(--font-weight-semibold)",
              }}
            >
              ₹{patientDetails.dueBalance?.toFixed(2) || '0.00'}
            </td>
            <td
              style={{
                padding: "12px 15px",
                fontWeight: "var(--font-weight-bold)",
                color: "#495057",
                fontSize: "var(--font-size-sm)",
              }}
            >
              {patientDetails.govIdType ? 'GOVERNMENT ID' : ''}
            </td>
            <td
              style={{
                padding: "12px 15px",
                color: "#2c3e50",
                fontWeight: "var(--font-weight-semibold)",
              }}
            >
              {patientDetails.govIdType ? `${patientDetails.govIdType}: ${patientDetails.govIdNo || 'N/A'}` : ''}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Print Styles */}
      <style>{`
        @media print {
          @page {
            size: A4;
            margin: 0;
          }
          body {
            margin: 0;
            padding: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default OccupiedBedPatientPrint;
