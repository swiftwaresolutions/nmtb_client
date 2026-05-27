import React, { useMemo, useRef, useState } from "react";
import { Container, Card, Form, Button, Row, Col, Table } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useReactToPrint } from "react-to-print";
import { RootState } from "../../../../../state/store";
import "../../../../../medical-records/styles/reportStyles.css";
import CashCounterApiService, {
  AdvanceReportRow,
  AdvanceReturnReportRow,
} from "../../../../../api/cash-counter/cash-counter-api-service";
import { showErrorToast } from "../../../../../utils/alertUtil";
import PrintHeaderReports from "../../../../../components/PrintHeaderReports";
import ReportHeader from "../../../../../medical-records/components/ReportHeader";
import { exportToExcel, formatReportDate, getDateRangeText } from "../../../../../medical-records/utils/reportUtils";

const cashCounterApi = new CashCounterApiService();

const AdvanceRefund: React.FC = () => {
  const organization = useSelector((state: RootState) => state.appReducer.organization);
  const printRef = useRef<HTMLDivElement>(null);
  const today = new Date().toISOString().split("T")[0];

  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [advanceReportData, setAdvanceReportData] = useState<AdvanceReportRow[]>([]);
  const [advanceReturnData, setAdvanceReturnData] = useState<AdvanceReturnReportRow[]>([]);

  const displayedAdvanceReportData = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) {
      return advanceReportData;
    }

    return advanceReportData.filter((row) => {
      return (
        (row.fullName || row.patientName)?.toLowerCase().includes(search) ||
        row.dateTime?.toLowerCase().includes(search) ||
        row.displayNumber?.toLowerCase().includes(search) ||
        row.billDisplay?.toLowerCase().includes(search) ||
        row.cashPaid.toFixed(2).includes(search) ||
        row.swpPaid.toFixed(2).includes(search) ||
        (row.cashPaid + row.swpPaid).toFixed(2).includes(search)
      );
    });
  }, [advanceReportData, searchTerm]);

  const displayedAdvanceReturnData = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) {
      return advanceReturnData;
    }

    return advanceReturnData.filter((row) => {
      return (
        row.patientName?.toLowerCase().includes(search) ||
        row.date?.toLowerCase().includes(search) ||
        row.opNo?.toLowerCase().includes(search) ||
        row.billDisplay?.toLowerCase().includes(search) ||
        row.total.toFixed(2).includes(search)
      );
    });
  }, [advanceReturnData, searchTerm]);

  
  const totalCashCollection = displayedAdvanceReportData.reduce((sum, row) => sum + row.cashPaid, 0);
  const totalSwipeCollection = displayedAdvanceReportData.reduce((sum, row) => sum + row.swpPaid, 0);
  const totalAdvanceRefund = displayedAdvanceReturnData.reduce((sum, row) => sum + row.total, 0);

  const totalAdvanceCashCollection = displayedAdvanceReportData.reduce(
    (sum, row) => sum + row.cashPaid,
    0
  );

  const totalAdvanceSwipeCollection = displayedAdvanceReportData.reduce(
    (sum, row) => sum + row.swpPaid,
    0
  );

  const totalAdvanceCollection = totalAdvanceCashCollection + totalAdvanceSwipeCollection;

  const netCollection = totalAdvanceCashCollection + totalAdvanceSwipeCollection - totalAdvanceRefund;

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
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      body { font-family: 'Times New Roman', Times, serif; font-size: 11px; color: #000; }
      .advance-refund-print-header { display: block !important; margin-bottom: 8px; }
      .advance-refund-print-title { text-align: center; font-weight: 700; margin: 4px 0 2px; font-size: 11px; }
      .advance-refund-print-subtitle { text-align: center; margin: 0 0 6px; font-size: 9px; }
      table { width: 100%; border-collapse: collapse !important; }
      table, th, td { border: 1px solid #000 !important; }
      .advance-refund-print-table th,
      .advance-refund-print-table td {
        font-size: 11px !important;
        padding: 1px 3px !important;
        line-height: 1.05 !important;
      }
      .advance-refund-print-table thead th {
        padding: 2px 3px !important;
      }
      thead { display: table-header-group; }
      tbody { display: table-row-group; }
      tr { page-break-inside: avoid; }
      .advance-refund-print-table .print-hide { display: none !important; }
      .advance-refund-print-summary { display: block !important; margin-top: 10px; }
      .advance-refund-print-summary table { width: auto !important; min-width: 260px; margin-left: auto !important; border-collapse: collapse !important; }
      .advance-refund-print-summary td { border: 1px solid #000 !important; padding: 2px 8px !important; font-size: 9px !important; line-height: 1.3 !important; }
      .advance-refund-print-summary .print-summary-label { font-weight: 600 !important; }
    `,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const [advanceReportResponse, advanceReturnResponse] = await Promise.all([
        cashCounterApi.fetchAdvanceReport(fromDate, toDate),
        cashCounterApi.fetchAdvanceReturnReport(fromDate, toDate),
      ]);
      setAdvanceReportData(advanceReportResponse);
      setAdvanceReturnData(advanceReturnResponse);
      setSubmitted(true);
    } catch {
      showErrorToast("Failed to fetch advance report data.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFromDate(today);
    setToDate(today);
    setSearchTerm("");
    setAdvanceReportData([]);
    setAdvanceReturnData([]);
    setSubmitted(false);
  };

  const handleExport = () => {
    const exportData = [
      ...displayedAdvanceReportData.map((row, index) => ({
        "Report Type": "Advance Collection",
        "S.No": index + 1,
        "OP No": row.displayNumber,
        "Patient Name": row.patientName,
        Date: row.dateTime,
        User: row.fullName,
        "Bill Display": row.billDisplay,
        Cash: row.cashPaid.toFixed(2),
        Swipe: row.swpPaid.toFixed(2),
      })),
      ...displayedAdvanceReturnData.map((row, index) => ({
        "Report Type": "Advance Refund",
        "S.No": index + 1,
        "OP No": row.opNo,
        "Patient Name": row.patientName,
        Date: row.date,
        User: row.userName,
        "Bill Display": row.billDisplay,
        Amount: row.total.toFixed(2),
      })),
    ];

    exportToExcel(
      exportData,
      `Advance_Report_${formatReportDate(new Date(), "DD-MM-YYYY")}`,
      "Advance Report"
    );
  };

  const renderAdvanceCollectionTable = () => (
    <div style={{ overflowX: "auto" }}>
      <Table striped bordered hover className="table-hims mb-0 advance-refund-print-table">
        <thead>
          <tr>
            <th rowSpan={2} style={{ width: "60px" }} className="print-hide">S. No</th>
            <th rowSpan={2} >OP No</th>
            <th rowSpan={2}>Patient Name</th>
            <th rowSpan={2}>Date</th>
            <th rowSpan={2} className="print-hide">User</th>
            <th rowSpan={2}>Bill Display</th>
            <th colSpan={2} className="text-center">Amount</th>
          </tr>
          <tr>
            <th className="text-center">Cash</th>
            <th className="text-center">Swipe</th>
          </tr>
        </thead>
        <tbody>
          {displayedAdvanceReportData.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center text-muted py-4">
                No records found for the selected date range.
              </td>
            </tr>
          ) : (
            displayedAdvanceReportData.map((row, idx) => (
              <tr key={idx}>
                <td className="print-hide">{idx + 1}</td>
                <td>{row.displayNumber}</td>
                <td>{row.patientName}</td>
                <td>{row.dateTime}</td>
                <td style={{ color: "var(--page-secondary-color)" }} className="fw-bold print-hide">{row.fullName}</td>
                <td>{row.billDisplay}</td>
                <td style={{background: 'var(--page-primary-color)', color: 'var(--page-secondary-color)'}} className="text-center fw-bold">{row.cashPaid.toFixed(2)}</td>
                <td style={{background: 'var(--page-primary-color)', color: 'var(--page-secondary-color)'}} className="text-center fw-bold">{row.swpPaid.toFixed(2)}</td>
              </tr>
            ))
          )}
          <tr
            style={{
              fontWeight: "var(--font-weight-semibold)",
              background: "var(--color-table-header)",
            }}
          >
            <td colSpan={4} className="text-end">
              Total :
            </td>
            <td className="text-end">{totalAdvanceCashCollection.toFixed(2)}</td>
            <td className="text-end">{totalAdvanceSwipeCollection.toFixed(2)}</td>
          </tr>
        </tbody>
      </Table>
    </div>
  );

  const renderAdvanceRefundTable = () => (
    <div style={{ overflowX: "auto" }}>
      <Table striped bordered hover className="table-hims mb-0 advance-refund-print-table">
        <thead>
          <tr style={{ background: "var(--color-table-header)" }}>
            <th style={{ width: "60px" }} className="print-hide">S. No</th>
            <th>OP. No</th>
            <th>Patient Name</th>
            <th>Date</th>
            <th className="print-hide">User</th>
            <th>Bill Display</th>
            <th className="text-end">Amount</th>
          </tr>
        </thead>
        <tbody>
          {displayedAdvanceReturnData.length === 0 ? (
            <tr>
              <td colSpan={5} className="text-center text-muted py-4">
                No records found for the selected date range.
              </td>
            </tr>
          ) : (
            displayedAdvanceReturnData.map((row, idx) => (
              <tr key={idx}>
                <td className="print-hide">{idx + 1}</td>
                <td>{row.opNo}</td>
                <td>{row.patientName}</td>
                <td>{row.date}</td>
                <td style={{ color: "var(--page-secondary-color)" }} className="fw-bold print-hide">{row.userName}</td>
                <td>{row.billDisplay}</td>
                <td style={{color: 'var(--page-secondary-color)'}} className="text-end fw-bold">{row.total.toFixed(2)}</td>
              </tr>
            ))
          )}
          <tr
            style={{
              fontWeight: "var(--font-weight-semibold)",
              background: "var(--color-table-header)",
            }}
          >
            <td colSpan={4} className="text-end">
              Total :
            </td>
            <td className="text-end">{totalAdvanceRefund.toFixed(2)}</td>
          </tr>
        </tbody>
      </Table>
    </div>
  );

  return (
    <Container fluid className="p-3 d-flex flex-column" style={{ minHeight: "100vh" }}>
      <ReportHeader
        title={`${organization?.name?.toUpperCase() || "HOSPITAL"} - Advance Report`}
        subtitle={submitted ? getDateRangeText(fromDate, toDate) : "Select date range and click Submit"}
        onExport={handleExport}
        onSearch={setSearchTerm}
        showSearch={submitted}
        showSort={false}
        showPrint={false}
        showExport={submitted}
      />

      <Card className="mb-3 shadow-sm no-print">
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="g-3 align-items-end">
              <Col md={4}>
                <Form.Group>
                  <Form.Label style={{ fontWeight: "var(--font-weight-medium)" }}>
                    From Date
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label style={{ fontWeight: "var(--font-weight-medium)" }}>
                    To Date
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={4} className="d-flex gap-2 flex-wrap">
                <Button
                  type="button"
                  className="theme-outline-btn-primary"
                  onClick={handlePrint}
                  disabled={loading || !submitted || (displayedAdvanceReportData.length === 0 && displayedAdvanceReturnData.length === 0)}
                >
                  Print
                </Button>
                <Button type="submit" className="theme-btn-primary" disabled={loading}>
                  {loading ? "Loading..." : "Submit"}
                </Button>
                <Button type="button" className="theme-outline-btn-primary" onClick={handleReset}>
                  Reset
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {submitted && (
        <div className="d-flex flex-column gap-3 flex-grow-1">
          <div ref={printRef}>
            <div className="advance-refund-print-header" style={{ display: "none" }}>
              <PrintHeaderReports organization={printOrganization} />
              <div className="advance-refund-print-title">Advance Report</div>
              <div className="advance-refund-print-subtitle">{getDateRangeText(fromDate, toDate)}</div>
            </div>

            <Card className="shadow-sm">
              <Card.Header
                style={{
                  fontSize: "var(--font-size-md)",
                  fontWeight: "var(--font-weight-semibold)",
                }}
              >
                Advance Collection
              </Card.Header>
              <Card.Body className="p-0">{renderAdvanceCollectionTable()}</Card.Body>
              <Card.Footer className="d-flex justify-content-end align-items-center py-2">
                <span
                  style={{
                    fontSize: "var(--font-size-md)",
                    fontWeight: "var(--font-weight-semibold)",
                  }}
                >
                  Total Collection :&nbsp;
                  <span style={{ color: "var(--color-primary)" }}>
                    ₹ {totalAdvanceCollection.toFixed(2)}
                  </span>
                </span>
              </Card.Footer>
            </Card>

            <Card className="shadow-sm mt-3">
              <Card.Header
                style={{
                  fontSize: "var(--font-size-md)",
                  fontWeight: "var(--font-weight-semibold)",
                }}
              >
                Advance Refund
              </Card.Header>
              <Card.Body className="p-0">{renderAdvanceRefundTable()}</Card.Body>
              <Card.Footer className="d-flex justify-content-end align-items-center py-2">
                <span
                  style={{
                    fontSize: "var(--font-size-md)",
                    fontWeight: "var(--font-weight-semibold)",
                  }}
                >
                  Total Refund :&nbsp;
                  <span style={{ color: "var(--color-primary)" }}>₹ {totalAdvanceRefund.toFixed(2)}</span>
                </span>
              </Card.Footer>
            </Card>

            {/* Print-only summary */}
            <div className="advance-refund-print-summary" style={{ display: "none" }}>
              <table>
                <tbody>
                  <tr>
                    <td className="print-summary-label">Cash Collection (Cash - Return)</td>
                    <td className="text-end">&#8377; {(totalCashCollection - totalAdvanceRefund).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="print-summary-label">Swipe Collection</td>
                    <td className="text-end">&#8377; {totalSwipeCollection.toFixed(2)}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <Row className="justify-content-center">
            <Col xs={7} lg={5} xl={4}>
              <div
                style={{
                  background: "var(--page-primary-color)",
                  border: "1px solid var(--page-secondary-color)",
                  borderRadius: "var(--border-radius-sm)",
                  padding: "1rem",
                }}
              >
                <Row className="g-0 align-items-center">
                  <Col xs={12}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "0.75rem",
                        padding: "0.5rem 0",
                        borderBottom: "1px solid var(--border-color)",
                        fontSize: "var(--font-size-sm)",
                        fontWeight: "var(--font-weight-medium)",
                      }}
                    >
                      <span>Total Cash Collection</span>
                      <span style={{ fontWeight: "var(--font-weight-semibold)" }}>
                        ₹ {totalCashCollection.toFixed(2)}
                      </span>
                    </div>
                  </Col>
                  <Col xs={12}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "0.75rem",
                        padding: "0.5rem 0",
                        borderBottom: "1px solid var(--border-color)",
                        fontSize: "var(--font-size-sm)",
                        fontWeight: "var(--font-weight-medium)",
                      }}
                    >
                      <span>Total Swipe Collection</span>
                      <span style={{ fontWeight: "var(--font-weight-semibold)" }}>
                        ₹ {totalSwipeCollection.toFixed(2)}
                      </span>
                    </div>
                  </Col>
                  <Col xs={12}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "0.75rem",
                        padding: "0.5rem 0",
                        borderBottom: "1px solid var(--border-color)",
                        fontSize: "var(--font-size-sm)",
                        fontWeight: "var(--font-weight-medium)",
                      }}
                    >
                      <span>Total QR Collection</span>
                      <span style={{ fontWeight: "var(--font-weight-semibold)" }}>
                        ₹ 0.00
                      </span>
                    </div>
                  </Col>
                  <Col xs={12}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "0.75rem",
                        padding: "0.5rem 0",
                        borderBottom: "1px solid var(--border-color)",
                        fontSize: "var(--font-size-sm)",
                        fontWeight: "var(--font-weight-medium)",
                      }}
                    >
                      <span>Total Return</span>
                      <span style={{ fontWeight: "var(--font-weight-semibold)" }}>
                        ₹ {totalAdvanceRefund.toFixed(2)}
                      </span>
                    </div>
                  </Col>
                  <Col xs={12}>
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: "0.75rem",
                        paddingTop: "0.75rem",
                        fontSize: "var(--font-size-md)",
                        fontWeight: "var(--font-weight-bold)",
                      }}
                    >
                      <span>Total Collection</span>
                      <span style={{ color: "var(--page-secondary-color)" }}>
                        ₹ {netCollection.toFixed(2)}
                      </span>
                    </div>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
        </div>
      )}
    </Container>
  );
};

export default AdvanceRefund;
