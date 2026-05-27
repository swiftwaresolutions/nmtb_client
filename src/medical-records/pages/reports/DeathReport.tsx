import React, { useMemo, useRef, useState } from "react";
import { Button, Card, Col, Form, Row, Spinner, Table } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch, faSyncAlt } from "@fortawesome/free-solid-svg-icons";
import { useSelector } from "react-redux";
import { useReactToPrint } from "react-to-print";
import ReportHeader from "../../components/ReportHeader";
import PrintHeaderReports from "../../../components/PrintHeaderReports";
import MedicalRecordsApiService, {
  DeathReportDetailsRow,
} from "../../../api/medical-records/medical-records-api-service";
import { exportToExcel, getDateRangeText } from "../../utils/reportUtils";
import { showErrorToast, showValidationError } from "../../../utils/alertUtil";
import { RootState } from "../../../state/store";

interface DeathReportRow {
  opNo: string;
  deathNo: string;
  ipNo: string;
  patientName: string;
  sexAge: string;
  fatherGuardian: string;
  address: string;
  phoneNumber: string;
  diagnosis: string;
  causeOfDeath: string;
  expDate: string;
  expTime: string;
}

const getTodayValue = (): string => new Date().toISOString().split("T")[0];

const formatInputDate = (value: string): string => {
  if (!value) {
    return "-";
  }

  const parts = value.split("-");
  if (parts.length !== 3) {
    return value;
  }

  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
};

const formatPrintDate = (value: string): string => {
  if (!value) {
    return "-";
  }

  const parts = value.split("-");
  if (parts.length !== 3) {
    return value;
  }

  const [year, month, day] = parts;
  return `${day}/${month}/${year}`;
};

const formatDisplayDate = (value: string): string => {
  if (!value) {
    return "-";
  }

  const dateOnly = value.split("T")[0].trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateOnly)) {
    const [yyyy, mm, dd] = dateOnly.split("-");
    return `${dd}/${mm}/${yyyy}`;
  }

  if (/^\d{2}-\d{2}-\d{4}$/.test(dateOnly)) {
    const [dd, mm, yyyy] = dateOnly.split("-");
    return `${dd}/${mm}/${yyyy}`;
  }

  if (/^\d{2}\/\d{2}\/\d{4}$/.test(dateOnly)) {
    return dateOnly;
  }

  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  const dd = String(parsed.getDate()).padStart(2, "0");
  const mm = String(parsed.getMonth() + 1).padStart(2, "0");
  const yyyy = parsed.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
};

const mapDeathRow = (item: DeathReportDetailsRow): DeathReportRow => {
  const sex = item.sex || "";
  const age = item.age || "";

  return {
    opNo: item.opNo || "-",
    deathNo: item.deathNo || "-",
    ipNo: item.ipNo || "-",
    patientName: item.patientName || "-",
    sexAge: `${sex}${sex && age ? " / " : ""}${age}` || "-",
    fatherGuardian: item.guardianName || "-",
    address: item.address || "-",
    phoneNumber: item.phoneNo || "-",
    diagnosis: item.diagnosis || "-",
    causeOfDeath: item.causeOfDeath || "-",
    expDate: formatDisplayDate(item.expdate || ""),
    expTime: item.exptime || "-",
  };
};

const DeathReport: React.FC = () => {
  const apiService = useMemo(() => new MedicalRecordsApiService(), []);
  const today = getTodayValue();
  const printRef = useRef<HTMLDivElement>(null);
  const organization = useSelector((state: RootState) => state.appReducer.organization);

  const [fromDate, setFromDate] = useState<string>(today);
  const [toDate, setToDate] = useState<string>(today);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [searched, setSearched] = useState<boolean>(false);
  const [rows, setRows] = useState<DeathReportRow[]>([]);

  const printOrganization = useMemo(
    () => ({
      name: organization?.name || "",
      code: organization?.code || "",
      address: organization?.address || "",
      phone: organization?.phoneNo || "",
    }),
    [organization]
  );

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    pageStyle: `
      @page { margin: 1cm; }
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      body { font-family: 'Times New Roman', Times, serif; font-size: 10px; color: #000; }
      .prt-sheet { border: 1px solid #000 !important; padding: 8px; }
      .prt-table { width: 100%; border-collapse: collapse !important; border: 1px solid #000 !important; border-spacing: 0 !important; font-family: 'Times New Roman', Times, serif; font-size: 10px; }
      .prt-table thead,
      .prt-table tbody,
      .prt-table tr,
      .prt-table th,
      .prt-table td { border-right: 1px solid #000 !important; }
      .prt-table th,
      .prt-table td { padding: 1px 3px; vertical-align: top; line-height: 1.1; }
      .prt-table th { text-align: center; font-weight: bold; background: #f5f5f5 !important; }
      .prt-title { text-align: center; font-weight: bold; text-transform: uppercase; font-size: 13px; margin: 8px 0 10px; letter-spacing: 0.3px; }
      thead { display: table-header-group; }
      tbody { display: table-row-group; }
      tr { page-break-inside: auto; }
    `,
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!fromDate || !toDate) {
      showValidationError("Please select both From Date and To Date.");
      return;
    }

    if (new Date(fromDate) > new Date(toDate)) {
      showValidationError("From Date cannot be later than To Date.");
      return;
    }

    try {
      setIsLoading(true);
      const response = await apiService.fetchDeathReport(fromDate, toDate);
      const mappedRows = response.map(mapDeathRow);
      setRows(mappedRows);
      setSearched(true);
    } catch (error: any) {
      const msg = error?.response?.data?.message || error?.message || "Failed to load death report";
      showErrorToast(msg);
      setRows([]);
      setSearched(true);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFromDate(today);
    setToDate(today);
    setRows([]);
    setSearched(false);
  };

  const handleExport = () => {
    const exportData = rows.map((row) => ({
      "OP No.": row.opNo,
      "Death No.": row.deathNo,
      IPNO: row.ipNo,
      "Patient Name": row.patientName,
      "Sex/Age": row.sexAge,
      "Father / Guardian": row.fatherGuardian,
      Address: row.address,
      "Phone Number": row.phoneNumber,
      Diagnosis: row.diagnosis,
      "Cause of Death": row.causeOfDeath,
      "Exp. Date": row.expDate,
      "Exp. Time": row.expTime,
    }));

    exportToExcel(exportData, "Death_Report", "Death Report");
  };

  return (
    <div className="d-flex flex-column">
      <ReportHeader
        title="Death Report"
        subtitle={searched ? getDateRangeText(fromDate, toDate) : "Select date range and click Submit"}
        onPrint={handlePrint}
        onExport={handleExport}
        showSearch={false}
        showSort={false}
        showPrint={searched && rows.length > 0}
        showExport={searched && rows.length > 0}
      />

      <Card className="shadow-sm d-flex flex-column flex-grow-1">
        <Card.Header>
          <Form onSubmit={handleSubmit}>
            <Row className="g-3 align-items-end">
              <Col md={3}>
                <Form.Group>
                  <Form.Label>From Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={fromDate}
                    onChange={(event) => setFromDate(event.target.value)}
                    disabled={isLoading}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>To Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={toDate}
                    onChange={(event) => setToDate(event.target.value)}
                    disabled={isLoading}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <div className="d-flex gap-2 justify-content-md-end flex-wrap">
                  <Button type="submit" disabled={isLoading} className="d-flex align-items-center gap-2">
                    {isLoading ? <Spinner animation="border" size="sm" /> : <FontAwesomeIcon icon={faSearch} />}
                    {isLoading ? "Loading..." : "Submit"}
                  </Button>
                  <Button
                    variant="outline-secondary"
                    type="button"
                    onClick={handleReset}
                    disabled={isLoading}
                    className="d-flex align-items-center gap-2"
                  >
                    <FontAwesomeIcon icon={faSyncAlt} />
                    Reset
                  </Button>
                </div>
              </Col>
            </Row>
          </Form>
        </Card.Header>

        <Card.Body className="p-0 d-flex flex-column">
          <div style={{ display: "none" }}>
            <div ref={printRef} className="prt-sheet">
              <PrintHeaderReports organization={printOrganization} />
              <div className="prt-title">
                {`DEATH REPORT BETWEEN ${formatPrintDate(fromDate)} AND ${formatPrintDate(toDate)}`}
              </div>
              <table className="prt-table">
                <thead>
                  <tr>
                    <th>OP No.</th>
                    <th>Death No.</th>
                    <th>IPNO</th>
                    <th>Patient Name</th>
                    <th>Sex/Age</th>
                    <th>Father / Guardian</th>
                    <th>Address</th>
                    <th>Phone Number</th>
                    <th>Diagnosis</th>
                    <th>Cause of Death</th>
                    <th>Exp. Date</th>
                    <th>Exp. Time</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={`prt-${row.deathNo}-${row.opNo}-${index}`}>
                      <td>{row.opNo}</td>
                      <td>{row.deathNo}</td>
                      <td>{row.ipNo}</td>
                      <td>{row.patientName}</td>
                      <td>{row.sexAge}</td>
                      <td>{row.fatherGuardian}</td>
                      <td style={{ whiteSpace: "pre-wrap" }}>{row.address?.replace(/,/g, "\n")}</td>
                      <td>{row.phoneNumber}</td>
                      <td style={{ whiteSpace: "pre-wrap" }}>{row.diagnosis}</td>
                      <td style={{ whiteSpace: "pre-wrap" }}>{row.causeOfDeath}</td>
                      <td>{row.expDate}</td>
                      <td>{row.expTime}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-5">
              <Spinner animation="border" />
              <div className="mt-2 text-muted">Loading death report...</div>
            </div>
          ) : !searched ? (
            <div className="text-center py-5 text-muted">
              Select the report filters and click Submit to view death report.
            </div>
          ) : rows.length === 0 ? (
            <div className="text-center py-5 text-muted">
              No death report records found for the selected date range.
            </div>
          ) : (
            <>
              <div className="px-3 py-3 border-bottom">
                <Row className="g-2 align-items-center">
                  <Col md={8}>
                    <div className="text-muted" style={{ fontSize: "var(--font-size-sm)" }}>
                      Period: {formatInputDate(fromDate)} - {formatInputDate(toDate)}
                    </div>
                  </Col>
                  <Col md={4} className="text-md-end">
                    <div className="text-muted" style={{ fontSize: "var(--font-size-sm)" }}>
                      Total Records: {rows.length}
                    </div>
                  </Col>
                </Row>
              </div>

              <div className="table-responsive flex-grow-1">
              <Table className="mb-0 align-middle">
                <thead style={{ position: "sticky", top: 0, zIndex: 10 }}>
                  <tr>
                    <th>OP No.</th>
                    <th>Death No.</th>
                    <th>IPNO</th>
                    <th>Patient Name</th>
                    <th>Sex/Age</th>
                    <th>Father / Guardian</th>
                    <th>Address</th>
                    <th>Phone Number</th>
                    <th>Diagnosis</th>
                    <th>Cause of Death</th>
                    <th>Exp. Date</th>
                    <th>Exp. Time</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((row, index) => (
                    <tr key={`${row.deathNo}-${row.opNo}-${index}`}>
                      <td>{row.opNo}</td>
                      <td>{row.deathNo}</td>
                      <td>{row.ipNo}</td>
                      <td>{row.patientName}</td>
                      <td>{row.sexAge}</td>
                      <td>{row.fatherGuardian}</td>
                      <td style={{ whiteSpace: "pre-wrap" }}>{row.address?.replace(/,/g, "\n")}</td>
                      <td>{row.phoneNumber}</td>
                      <td style={{ whiteSpace: "pre-wrap" }}>{row.diagnosis}</td>
                      <td style={{ whiteSpace: "pre-wrap" }}>{row.causeOfDeath}</td>
                      <td>{row.expDate}</td>
                      <td>{row.expTime}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
              </div>
            </>
          )}
        </Card.Body>
      </Card>
    </div>
  );
};

export default DeathReport;
