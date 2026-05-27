import React, { useEffect, useRef, useState, useMemo } from "react";
import { Row, Col, Spinner } from "react-bootstrap";
import { LaboratoryApiService, PrintHeaderDetails } from "../api/laboratory/laboratory-api-service";

interface PrintPatientInfoProps {
  opno?: string;
  finalBillId?: number;
  onDataLoaded?: (age: number, sex: string) => void;
  className?: string;
}

/**
 * Common patient information component for print layouts
 * Used in printable reports and documents
 * Fetches patient details using opno if provided
 */
const PrintPatientInfo: React.FC<PrintPatientInfoProps> = ({
  opno,
  finalBillId,
  onDataLoaded,
  className = "mb-3 bg-light border rounded p-3"
}) => {
  const [patientData, setPatientData] = useState<PrintHeaderDetails | null>(null);
  const [loading, setLoading] = useState(false);

  const labApiService = useMemo(() => new LaboratoryApiService(), []);

  const onDataLoadedRef = useRef(onDataLoaded);
  useEffect(() => {
    onDataLoadedRef.current = onDataLoaded;
  });

  const formatDateTime = (value?: string): string => {
    if (!value) return "-";
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return value;

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = String(date.getFullYear()).slice(-2);
    const hours24 = date.getHours();
    const hours12 = hours24 % 12 || 12;
    const minutes = String(date.getMinutes()).padStart(2, "0");
    const meridiem = hours24 >= 12 ? "PM" : "AM";

    return `${day}-${month}-${year} ${String(hours12).padStart(2, "0")}:${minutes} ${meridiem}`;
  };

  useEffect(() => {
    if (opno && typeof finalBillId === "number" && !Number.isNaN(finalBillId)) {
      const fetchPatientDetails = async () => {
        setLoading(true);
        try {
          const response = await labApiService.fetchLabPrintHeader(opno, finalBillId);
          const data = Array.isArray(response) ? response[0] || null : null;
          setPatientData(data);
          if (onDataLoadedRef.current && data) {
            onDataLoadedRef.current(parseInt(data.age) || 0, data.gender);
          }
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
        <div className="mt-2">Loading patient details...</div>
      </div>
    );
  }

  if (!patientData) {
    return (
      <div className={className}>
        <div className="text-muted">Patient details not available</div>
      </div>
    );
  }

  const labelStyle: React.CSSProperties = {
    minWidth: "7.5rem",
    fontWeight: "var(--font-weight-semibold)",
    flexShrink: 0,
  };

  const rowStyle: React.CSSProperties = {
    display: "flex",
    alignItems: "flex-start",
    gap: "0.25rem",
    marginBottom: "0.25rem",
    fontWeight: "var(--font-weight-semibold)",
  };

  return (
    <div className={className}>
      <Row className="g-3 align-items-start">
        <Col xs={4}>
          <div style={rowStyle}>
            <span style={labelStyle}>OP No:</span>
            <span>{patientData.opNo || "-"}</span>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Patient Name:</span>
            <span>{patientData.patientName || "-"}</span>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Age / Gender:</span>
            <span>{patientData.age || "-"} / {patientData.gender || "-"}</span>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Visit Type:</span>
            <span>{patientData.isIp ? "IP" : "OP"}</span>
          </div>
        </Col>
        <Col xs={4}>
          <div style={rowStyle} className="justify-content-center">
            <span style={{ whiteSpace: "pre-wrap", wordBreak: "break-word" }}>
              <strong>Address:</strong>
              <br />
              {[patientData.add1, patientData.villageName, patientData.talukName]
                .filter(Boolean)
                .map((line, index) => (
                  <React.Fragment key={`${line}-${index}`}>
                    {line}
                    <br />
                  </React.Fragment>
                ))}
              {patientData.districtName ? (
                <>
                  {patientData.districtName}
                </>
              ) : null}
               - {patientData.pincode || "-"}
            </span>
          </div>
        </Col>
        <Col xs={4}>
          <div style={rowStyle}>
            <span style={labelStyle}>Doctor:</span>
            <span>{patientData.doctorName || "-"}</span>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Department:</span>
            <span>{patientData.departmentName || "-"}</span>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Collected on:</span>
            <span>{formatDateTime(patientData.entDateTime)}</span>
          </div>
          <div style={rowStyle}>
            <span style={labelStyle}>Reported on:</span>
            <span>{formatDateTime(patientData.printedDateTime)}</span>
          </div>
        </Col>
      </Row>
    </div>
  );
};

export default PrintPatientInfo;