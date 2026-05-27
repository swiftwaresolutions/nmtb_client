import React from "react";
import PrintHeader from "../../components/PrintHeader";

interface OrganizationInfo {
  name?: string;
  code?: string;
  address?: string;
  phone?: string;
  itNo?: string;
  salesTax?: string;
}

interface AdmissionData {
  patientCategory: string;
  ipNo: string;
  opNo: string;
  patientName: string;
  ageAndSex: string;
  religion: string;
  maritalStatus: string;
  occupation: string;
  telephone: string;
  guardianName: string;
  nationality: string;
  address: string;
  admissionDate: string;
  dischargeDate?: string;
  prevAdmissionNo?: string;
  hospitalDays?: string;
  referredTo: string;
  department: string;
  wardName: string;
  wardType: string;
  roomNo: string;
  accountType: string;
}

interface AdmissionRecordPrintProps {
  admissionData: AdmissionData;
  organization: OrganizationInfo;
}

const AdmissionRecordPrint: React.FC<AdmissionRecordPrintProps> = ({
  admissionData,
  organization,
}) => {
  return (
    <div
      className="admission-record-print"
      style={{
        width: "210mm",
        maxWidth: "210mm",
        minHeight: "297mm",
        margin: "0 auto",
        padding: "10mm",
        backgroundColor: "white",
        fontFamily: "'Arial', 'Helvetica', sans-serif",
        boxSizing: "border-box",
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
            fontSize: "20px",
            fontWeight: "700",
            letterSpacing: "1.5px",
            color: "#2c3e50",
            textTransform: "uppercase",
          }}
        >
          ADMISSION RECORD
        </h4>
      </div>

      {/* Content Table */}
      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          fontSize: "13px",
          border: "2px solid #2c3e50",
        }}
      >
        <tbody>
          {/* Patient Category */}
          <tr>
            <td
              colSpan={4}
              style={{
                borderBottom: "2px solid #2c3e50",
                padding: "10px 12px",
                fontWeight: "700",
                backgroundColor: "#f8f9fa",
                fontSize: "14px",
              }}
            >
              <span style={{ minWidth: "180px", display: "inline-block", color: "#495057" }}>
                PATIENT CATEGORY
              </span>
              <span style={{ color: "#2c3e50" }}>{admissionData.patientCategory}</span>
            </td>
          </tr>

          {/* IP NO and OP NO */}
          <tr>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "10px 12px",
                width: "25%",
                fontWeight: "700",
                color: "#495057",
                fontSize: "12px",
              }}
            >
              IP NO
            </td>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "10px 12px",
                width: "25%",
                color: "#2c3e50",
                fontWeight: "600",
              }}
            >
              {admissionData.ipNo}
            </td>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "10px 12px",
                width: "25%",
                fontWeight: "700",
                color: "#495057",
                fontSize: "12px",
              }}
            >
              OP NO
            </td>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "10px 12px",
                width: "25%",
                color: "#2c3e50",
                fontWeight: "600",
              }}
            >
              {admissionData.opNo}
            </td>
          </tr>

          {/* Patient Name and Age & Sex */}
          <tr>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "10px 12px",
                fontWeight: "700",
                color: "#495057",
                fontSize: "12px",
              }}
            >
              PATIENT NAME
            </td>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "10px 12px",
                color: "#2c3e50",
                fontWeight: "600",
              }}
            >
              {admissionData.patientName}
            </td>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "10px 12px",
                fontWeight: "700",
                color: "#495057",
                fontSize: "12px",
              }}
            >
              AGE & SEX
            </td>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "10px 12px",
                color: "#2c3e50",
                fontWeight: "600",
              }}
            >
              {admissionData.ageAndSex}
            </td>
          </tr>

          {/* Religion and Marital Status */}
          <tr>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "10px 12px",
                fontWeight: "700",
                color: "#495057",
                fontSize: "12px",
              }}
            >
              RELIGION
            </td>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "10px 12px",
                color: "#2c3e50",
                fontWeight: "600",
              }}
            >
              {admissionData.religion}
            </td>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "10px 12px",
                fontWeight: "700",
                color: "#495057",
                fontSize: "12px",
              }}
            >
              MARITAL STATUS
            </td>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "10px 12px",
                color: "#2c3e50",
                fontWeight: "600",
              }}
            >
              {admissionData.maritalStatus}
            </td>
          </tr>

          {/* Occupation and Telephone */}
          <tr>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "10px 12px",
                fontWeight: "700",
                color: "#495057",
                fontSize: "12px",
              }}
            >
              OCCUPATION
            </td>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "10px 12px",
                color: "#2c3e50",
                fontWeight: "600",
              }}
            >
              {admissionData.occupation}
            </td>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "10px 12px",
                fontWeight: "700",
                color: "#495057",
                fontSize: "12px",
              }}
            >
              TELEPHONE
            </td>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "10px 12px",
                color: "#2c3e50",
                fontWeight: "600",
              }}
            >
              {admissionData.telephone}
            </td>
          </tr>

          {/* Guardian Name and Nationality */}
          <tr>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "10px 12px",
                fontWeight: "700",
                color: "#495057",
                fontSize: "12px",
              }}
            >
              GUARDIAN NAME
            </td>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "10px 12px",
                color: "#2c3e50",
                fontWeight: "600",
              }}
            >
              {admissionData.guardianName}
            </td>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "10px 12px",
                fontWeight: "700",
                color: "#495057",
                fontSize: "12px",
              }}
            >
              NATIONALITY
            </td>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "10px 12px",
                color: "#2c3e50",
                fontWeight: "600",
              }}
            >
              {admissionData.nationality}
            </td>
          </tr>

          {/* Address */}
          <tr>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "10px 12px",
                fontWeight: "700",
                color: "#495057",
                fontSize: "12px",
              }}
            >
              ADDRESS
            </td>
            <td
              colSpan={3}
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "10px 12px",
                color: "#2c3e50",
                fontWeight: "600",
              }}
            >
              {admissionData.address}
            </td>
          </tr>

          {/* Admission Date and Discharge Date */}
          <tr>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "10px 12px",
                fontWeight: "700",
                color: "#495057",
                fontSize: "12px",
              }}
            >
              ADMISSION DATE
            </td>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "10px 12px",
                color: "#2c3e50",
                fontWeight: "600",
              }}
            >
              {admissionData.admissionDate}
            </td>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "10px 12px",
                fontWeight: "700",
                color: "#495057",
                fontSize: "12px",
              }}
            >
              DISCHARGE DATE
            </td>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "10px 12px",
                color: "#2c3e50",
                fontWeight: "600",
              }}
            >
              {admissionData.dischargeDate || ""}
            </td>
          </tr>

          {/* Prev Admission No and Hospital Days */}
          <tr>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "10px 12px",
                fontWeight: "700",
                color: "#495057",
                fontSize: "12px",
              }}
            >
              PREV.ADMISSION NO
            </td>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "10px 12px",
                color: "#2c3e50",
                fontWeight: "600",
              }}
            >
              {admissionData.prevAdmissionNo || ""}
            </td>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "10px 12px",
                fontWeight: "700",
                color: "#495057",
                fontSize: "12px",
              }}
            >
              HOSPITAL DAYS
            </td>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "10px 12px",
                color: "#2c3e50",
                fontWeight: "600",
              }}
            >
              {admissionData.hospitalDays || ""}
            </td>
          </tr>

          {/* Referred To and Department */}
          <tr>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "10px 12px",
                fontWeight: "700",
                color: "#495057",
                fontSize: "12px",
              }}
            >
              REFFERED TO
            </td>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "10px 12px",
                color: "#2c3e50",
                fontWeight: "600",
              }}
            >
              {admissionData.referredTo}
            </td>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "10px 12px",
                fontWeight: "700",
                color: "#495057",
                fontSize: "12px",
              }}
            >
              DEPARTMENT
            </td>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "10px 12px",
                color: "#2c3e50",
                fontWeight: "600",
              }}
            >
              {admissionData.department}
            </td>
          </tr>

          {/* Ward Name and Ward Type */}
          <tr>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "10px 12px",
                fontWeight: "700",
                color: "#495057",
                fontSize: "12px",
              }}
            >
              WARD NAME
            </td>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "10px 12px",
                color: "#2c3e50",
                fontWeight: "600",
              }}
            >
              {admissionData.wardName}
            </td>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "10px 12px",
                fontWeight: "700",
                color: "#495057",
                fontSize: "12px",
              }}
            >
              WARD TYPE
            </td>
            <td
              style={{
                borderBottom: "1px solid #dee2e6",
                padding: "10px 12px",
                color: "#2c3e50",
                fontWeight: "600",
              }}
            >
              {admissionData.wardType}
            </td>
          </tr>

          {/* Room No and Account Type */}
          <tr>
            <td
              style={{
                padding: "10px 12px",
                fontWeight: "700",
                color: "#495057",
                fontSize: "12px",
              }}
            >
              ROOM NO
            </td>
            <td
              style={{
                padding: "10px 12px",
                color: "#2c3e50",
                fontWeight: "600",
              }}
            >
              {admissionData.roomNo}
            </td>
            <td
              style={{
                padding: "10px 12px",
                fontWeight: "700",
                color: "#495057",
                fontSize: "12px",
              }}
            >
              ACCOUNT TYPE
            </td>
            <td
              style={{
                padding: "10px 12px",
                color: "#2c3e50",
                fontWeight: "600",
              }}
            >
              {admissionData.accountType}
            </td>
          </tr>
        </tbody>
      </table>

      {/* Print Styles */}
      <style>{`
        @media print {
          .admission-record-print {
            width: 210mm;
            max-width: 210mm;
            min-height: 297mm;
            padding: 10mm;
            margin: 0;
            box-sizing: border-box;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          @page {
            size: A4;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default AdmissionRecordPrint;
