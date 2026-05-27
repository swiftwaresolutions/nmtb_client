import React from "react";
import PrintHeader from "../../components/PrintHeader";

interface OrganizationInfo {
  name?: string;
  code?: string;
  address?: string;
  phone?: string;
  itNo?: string;        // Hospital GST No
  salesTax?: string;    // Pharmacy GST No
}

interface BillData {
  tokenNo: string;
  date: string;
  patientName: string;
  age: string;
  sex: string;
  department: string;
  consultant: string;
  registrationCharge: number;
  consultationCharge: number;
  payable: number;
  paid: number;
}

interface RegistrationBillPrintProps {
  billData: BillData;
  organization: OrganizationInfo;
}

const RegistrationBillPrint: React.FC<RegistrationBillPrintProps> = ({
  billData,
  organization,
}) => {
  return (
    <div
      className="registration-bill-print"
      style={{
        width: "210mm",
        maxWidth: "210mm",
        minHeight: "148mm",
        maxHeight: "148mm",
        margin: "0 auto",
        padding: "8mm",
        backgroundColor: "white",
        fontFamily: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
        boxSizing: "border-box",
      }}
    >
      {/* Professional Print Header */}
      <PrintHeader organization={organization} gstNumber={organization.itNo} />

      {/* Bill Title Section */}
      <div
        style={{
          textAlign: "center",
          margin: "6px 0",
          padding: "6px",
          backgroundColor: "#f8f9fa",
          border: "2px solid #dee2e6",
          borderRadius: "4px",
        }}
      >
        <h4
          style={{
            margin: 0,
            fontSize: "var(--font-size-base)",
            fontWeight: "var(--font-weight-bold)",
            color: "#2c3e50",
            letterSpacing: "0.5px",
            textTransform: "uppercase",
          }}
        >
          NEW REGISTRATION AND CONSULTATION BILL
        </h4>
        <div
          style={{
            fontSize: "var(--font-size-xs)",
            color: "#6c757d",
            marginTop: "3px",
            fontWeight: "500",
          }}
        >
          {billData.date}
        </div>
      </div>

      {/* Bill Content */}
      <div
        style={{
          border: "2px solid #333",
          borderRadius: "6px",
          padding: "10px",
          backgroundColor: "#ffffff",
        }}
      >
        {/* Patient Information Section */}
        <div
          style={{
            backgroundColor: "#f8f9fa",
            padding: "8px",
            borderRadius: "4px",
            marginBottom: "8px",
            border: "1px solid #dee2e6",
          }}
        >
          <div style={{ display: "flex", marginBottom: "6px" }}>
            <div style={{ flex: 1 }}>
              <div style={{ marginBottom: "6px" }}>
                <span
                  style={{
                    fontWeight: "var(--font-weight-semibold)",
                    color: "#495057",
                    fontSize: "var(--font-size-xs)",
                  }}
                >
                  Token No:
                </span>
                <span
                  style={{
                    marginLeft: "6px",
                    fontSize: "var(--font-size-sm)",
                    fontWeight: "var(--font-weight-bold)",
                    color: "#2c3e50",
                  }}
                >
                  {billData.tokenNo}
                </span>
              </div>
              <div style={{ marginBottom: "6px" }}>
                <span
                  style={{
                    fontWeight: "var(--font-weight-semibold)",
                    color: "#495057",
                    fontSize: "var(--font-size-xs)",
                  }}
                >
                  Patient Name:
                </span>
                <span
                  style={{
                    marginLeft: "6px",
                    fontSize: "var(--font-size-sm)",
                    fontWeight: "var(--font-weight-bold)",
                    color: "#2c3e50",
                  }}
                >
                  {billData.patientName}
                </span>
              </div>
              <div style={{ marginBottom: "6px" }}>
                <span
                  style={{
                    fontWeight: "var(--font-weight-semibold)",
                    color: "#495057",
                    fontSize: "var(--font-size-xs)",
                  }}
                >
                  Age:
                </span>
                <span
                  style={{
                    marginLeft: "6px",
                    fontSize: "var(--font-size-xs)",
                    color: "#2c3e50",
                  }}
                >
                  {billData.age}
                </span>
              </div>
            </div>
            <div style={{ flex: 1, textAlign: "right" }}>
              <div style={{ marginBottom: "6px" }}>
                <span
                  style={{
                    fontWeight: "var(--font-weight-semibold)",
                    color: "#495057",
                    fontSize: "var(--font-size-xs)",
                  }}
                >
                  Sex:
                </span>
                <span
                  style={{
                    marginLeft: "6px",
                    fontSize: "var(--font-size-xs)",
                    color: "#2c3e50",
                  }}
                >
                  {billData.sex}
                </span>
              </div>
              <div style={{ marginBottom: "6px" }}>
                <span
                  style={{
                    fontWeight: "var(--font-weight-semibold)",
                    color: "#495057",
                    fontSize: "var(--font-size-xs)",
                  }}
                >
                  Department:
                </span>
                <span
                  style={{
                    marginLeft: "6px",
                    fontSize: "var(--font-size-xs)",
                    fontWeight: "var(--font-weight-semibold)",
                    color: "#2c3e50",
                  }}
                >
                  {billData.department}
                </span>
              </div>
              <div style={{ marginBottom: "6px" }}>
                <span
                  style={{
                    fontWeight: "var(--font-weight-semibold)",
                    color: "#495057",
                    fontSize: "var(--font-size-xs)",
                  }}
                >
                  Consultant:
                </span>
                <span
                  style={{
                    marginLeft: "6px",
                    fontSize: "var(--font-size-xs)",
                    fontWeight: "var(--font-weight-semibold)",
                    color: "#2c3e50",
                  }}
                >
                  {billData.consultant}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Charges Section */}
        <div
          style={{
            paddingTop: "8px",
          }}
        >
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              marginBottom: "8px",
            }}
          >
            <tbody>
              <tr>
                <td
                  style={{
                    padding: "6px 10px",
                    fontSize: "var(--font-size-sm)",
                    fontWeight: "var(--font-weight-semibold)",
                    color: "#495057",
                    borderBottom: "1px solid #e9ecef",
                  }}
                >
                  Registration Charge
                </td>
                <td
                  style={{
                    padding: "6px 10px",
                    fontSize: "var(--font-size-sm)",
                    fontWeight: "var(--font-weight-semibold)",
                    textAlign: "right",
                    color: "#2c3e50",
                    borderBottom: "1px solid #e9ecef",
                  }}
                >
                  ₹ {billData.registrationCharge.toFixed(2)}
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    padding: "6px 10px",
                    fontSize: "var(--font-size-sm)",
                    fontWeight: "var(--font-weight-semibold)",
                    color: "#495057",
                    borderBottom: "1px solid #e9ecef",
                  }}
                >
                  Consultation Charge
                </td>
                <td
                  style={{
                    padding: "6px 10px",
                    fontSize: "var(--font-size-sm)",
                    fontWeight: "var(--font-weight-semibold)",
                    textAlign: "right",
                    color: "#2c3e50",
                    borderBottom: "1px solid #e9ecef",
                  }}
                >
                  ₹ {billData.consultationCharge.toFixed(2)}
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    padding: "8px 10px",
                    fontSize: "var(--font-size-sm)",
                    fontWeight: "var(--font-weight-bold)",
                    color: "#2c3e50",
                    backgroundColor: "#f8f9fa",
                  }}
                >
                  Total Payable
                </td>
                <td
                  style={{
                    padding: "8px 10px",
                    fontSize: "var(--font-size-base)",
                    fontWeight: "var(--font-weight-bold)",
                    textAlign: "right",
                    color: "#2c3e50",
                    backgroundColor: "#f8f9fa",
                  }}
                >
                  ₹ {billData.payable.toFixed(2)}
                </td>
              </tr>
              <tr>
                <td
                  style={{
                    padding: "6px 10px",
                    fontSize: "var(--font-size-sm)",
                    fontWeight: "var(--font-weight-semibold)",
                    color: "#28a745",
                  }}
                >
                  Amount Paid
                </td>
                <td
                  style={{
                    padding: "6px 10px",
                    fontSize: "var(--font-size-sm)",
                    fontWeight: "var(--font-weight-bold)",
                    textAlign: "right",
                    color: "#28a745",
                  }}
                >
                  ₹ {billData.paid.toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Signature Section */}
        <div
          style={{
            marginTop: "12px",
            paddingTop: "10px",
            borderTop: "1px dashed #dee2e6",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "flex-end",
          }}
        >
          <div style={{ textAlign: "left" }}>
            <div
              style={{
                fontSize: "var(--font-size-xs)",
                color: "#6c757d",
                marginBottom: "3px",
              }}
            >
              Generated on: {billData.date}
            </div>
          </div>
          <div style={{ textAlign: "center", minWidth: "150px" }}>
            <div
              style={{
                borderTop: "2px solid #333",
                paddingTop: "5px",
                fontSize: "var(--font-size-xs)",
                fontWeight: "var(--font-weight-semibold)",
                color: "#495057",
              }}
            >
              Cashier Signature
            </div>
          </div>
        </div>
      </div>

      {/* Footer Note */}
      <div
        style={{
          marginTop: "6px",
          textAlign: "center",
          fontSize: "var(--font-size-xs)",
          color: "#6c757d",
          fontStyle: "italic",
        }}
      >
        This is a computer-generated bill and does not require a signature.
      </div>

      {/* Print Styles */}
      <style>{`
        @media print {
          .registration-bill-print {
            width: 210mm;
            max-width: 210mm;
            height: 148mm;
            max-height: 148mm;
            padding: 6mm;
            margin: 0;
            box-sizing: border-box;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          @page {
            size: 210mm 148mm;
            margin: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default RegistrationBillPrint;
