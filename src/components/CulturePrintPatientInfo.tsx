import React, { useEffect, useState, useMemo } from "react";
import { Spinner } from "react-bootstrap";
import { LaboratoryApiService, PrintHeaderDetails } from "../api/laboratory/laboratory-api-service";

interface CulturePrintPatientInfoProps {
  opno?: string;
  finalBillId?: number;
  specimenName?: string;
  testName?: string;
  cultureId?: string;
  dateOfReceivedOverride?: string;
  dateOfReport?: string;
  className?: string;
}

/**
 * Culture-specific patient information component for culture test print layouts
 * Displays culture test header with patient details and culture-specific fields
 * Fetches patient details using opno and displays in a custom table format
 */
const CulturePrintPatientInfo: React.FC<CulturePrintPatientInfoProps> = ({
  opno,
  finalBillId,
  specimenName,
  testName,
  cultureId,
  dateOfReceivedOverride,
  dateOfReport,
  className = "mb-3 bg-light border rounded p-2",
}) => {
  const [patientData, setPatientData] = useState<PrintHeaderDetails | null>(null);
  const [loading, setLoading] = useState(false);

  const labApiService = useMemo(() => new LaboratoryApiService(), []);

  const formatDateForCulture = (value?: string): string => {
    if (!value) return "—";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear());
    return `${day}-${month}-${year}`;
  };

  useEffect(() => {
    if (opno && typeof finalBillId === "number" && !Number.isNaN(finalBillId)) {
      const fetchPatientDetails = async () => {
        setLoading(true);
        try {
          const response = await labApiService.fetchLabPrintHeader(opno, finalBillId);
          const data = Array.isArray(response) ? response[0] || null : null;
          setPatientData(data);
        } catch (error) {
          console.error("Error fetching patient details:", error);
          setPatientData(null);
        } finally {
          setLoading(false);
        }
      };
      fetchPatientDetails();
    } else {
      setPatientData(null);
    }
  }, [opno, finalBillId, labApiService]);

  if (loading) {
    return (
      <div className={`${className} text-center`}>
        <Spinner animation="border" size="sm" />
        <div className="mt-2" style={{ fontSize: "var(--font-size-base)" }}>
          Loading patient details...
        </div>
      </div>
    );
  }

  if (!patientData) {
    return (
      <div className={className}>
        <div className="text-muted" style={{ fontSize: "var(--font-size-base)" }}>
          Patient details not available
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <table style={{ width: "100%", borderCollapse: "collapse", marginBottom: "0.75rem" }}>
        <tbody>
          <tr>
            <td style={{ padding: "3px 6px", verticalAlign: "top", fontSize: "var(--font-size-base)", fontWeight: "var(--font-weight-semibold)", whiteSpace: "nowrap", width: "1%" }}>
              Patient Name
            </td>
            <td style={{ padding: "3px 6px", verticalAlign: "top", fontSize: "var(--font-size-base)", width: "49%" }}>
              {patientData.patientName || "—"}
            </td>
            <td style={{ padding: "3px 6px", verticalAlign: "top", fontSize: "var(--font-size-base)", fontWeight: "var(--font-weight-semibold)", whiteSpace: "nowrap", width: "1%" }}>
              IP / OP
            </td>
            <td style={{ padding: "3px 6px", verticalAlign: "top", fontSize: "var(--font-size-base)", width: "49%" }}>
              {patientData.isIp ? "IP" : "OP"}
            </td>
          </tr>
          <tr>
            <td style={{ padding: "3px 6px", verticalAlign: "top", fontSize: "var(--font-size-base)", fontWeight: "var(--font-weight-semibold)", whiteSpace: "nowrap", width: "1%" }}>
              Age / Sex
            </td>
            <td style={{ padding: "3px 6px", verticalAlign: "top", fontSize: "var(--font-size-base)", width: "49%" }}>
              {patientData.age || "—"} / {patientData.gender || "—"}
            </td>
            <td style={{ padding: "3px 6px", verticalAlign: "top", fontSize: "var(--font-size-base)", fontWeight: "var(--font-weight-semibold)", whiteSpace: "nowrap", width: "1%" }}>
              OP No
            </td>
            <td style={{ padding: "3px 6px", verticalAlign: "top", fontSize: "var(--font-size-base)", width: "49%" }}>
              {patientData.opNo || "—"}
            </td>
          </tr>
          <tr>
            <td style={{ padding: "3px 6px", verticalAlign: "top", fontSize: "var(--font-size-base)", fontWeight: "var(--font-weight-semibold)", whiteSpace: "nowrap", width: "1%" }}>
              Ref By Dr
            </td>
            <td style={{ padding: "3px 6px", verticalAlign: "top", fontSize: "var(--font-size-base)", width: "49%" }}>
              {patientData.doctorName || "—"}
            </td>
            <td style={{ padding: "3px 6px", verticalAlign: "top", fontSize: "var(--font-size-base)", fontWeight: "var(--font-weight-semibold)", whiteSpace: "nowrap", width: "1%" }}>
              Date of Received
            </td>
            <td style={{ padding: "3px 6px", verticalAlign: "top", fontSize: "var(--font-size-base)", width: "49%" }}>
              {formatDateForCulture(patientData.entDateTime)}
            </td>
          </tr>
          <tr>
            <td style={{ padding: "3px 6px", verticalAlign: "top", fontSize: "var(--font-size-base)", fontWeight: "var(--font-weight-semibold)", whiteSpace: "nowrap", width: "1%" }}>
              Specimen
            </td>
            <td style={{ padding: "3px 6px", verticalAlign: "top", fontSize: "var(--font-size-base)", width: "49%" }}>
              {specimenName || "—"}
            </td>
            <td style={{ padding: "3px 6px", verticalAlign: "top", fontSize: "var(--font-size-base)", fontWeight: "var(--font-weight-semibold)", whiteSpace: "nowrap", width: "1%" }}>
              Date of Report
            </td>
            <td style={{ padding: "3px 6px", verticalAlign: "top", fontSize: "var(--font-size-base)", width: "49%" }}>
              {formatDateForCulture(dateOfReport)}
            </td>
          </tr>
          <tr>
            <td style={{ padding: "3px 6px", verticalAlign: "top", fontSize: "var(--font-size-base)", fontWeight: "var(--font-weight-semibold)", whiteSpace: "nowrap", width: "1%" }}>
              Micro No
            </td>
            <td style={{ padding: "3px 6px", verticalAlign: "top", fontSize: "var(--font-size-base)", width: "49%" }}>
              {cultureId || "—"}
            </td>
            <td style={{ padding: "3px 6px", verticalAlign: "top", fontSize: "var(--font-size-base)", fontWeight: "var(--font-weight-semibold)", whiteSpace: "nowrap", width: "1%" }}>
              Test
            </td>
            <td style={{ padding: "3px 6px", verticalAlign: "top", fontSize: "var(--font-size-base)", width: "49%" }}>
              {testName || "—"}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default CulturePrintPatientInfo;
