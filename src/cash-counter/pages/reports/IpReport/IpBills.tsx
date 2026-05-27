import React, { useMemo, useRef, useState } from "react";
import { Container, Card, Form, Button, Row, Col, Table } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useReactToPrint } from "react-to-print";
import { RootState } from "../../../../state/store";
import CashCounterApiService, {
  IpCollectionReportRow,
} from "../../../../api/cash-counter/cash-counter-api-service";
import { showErrorToast, showValidationError } from "../../../../utils/alertUtil";
import PrintHeaderReports from "../../../../components/PrintHeaderReports";
import ReportHeader from "../../../../medical-records/components/ReportHeader";
import {
  exportToExcel,
  formatReportDate,
  getDateRangeText,
} from "../../../../medical-records/utils/reportUtils";

const cashCounterApi = new CashCounterApiService();

const formatAmount = (value: number) => value.toFixed(2);

const includesSearchValue = (value: string | number | undefined, search: string) => {
  if (value == null) return false;
  return String(value).toLowerCase().includes(search);
};

const IpBills: React.FC = () => {
  const organization = useSelector((state: RootState) => state.appReducer.organization);
  const printRef = useRef<HTMLDivElement>(null);
  const today = new Date().toISOString().split("T")[0];

  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [ipCollectionData, setIpCollectionData] = useState<IpCollectionReportRow[]>([]);

  const displayedIpCollectionData = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) return ipCollectionData;
    return ipCollectionData.filter((row) =>
      includesSearchValue(row.patientName, search) ||
      includesSearchValue(row.fullName, search) ||
      includesSearchValue(row.dateTime, search) ||
      includesSearchValue(row.displayNumber, search) ||
      includesSearchValue(row.billDisplay, search) ||
      includesSearchValue(row.cashPaid.toFixed(2), search) ||
      includesSearchValue(row.swpPaid.toFixed(2), search) ||
      includesSearchValue((row.cashPaid + row.swpPaid).toFixed(2), search)
    );
  }, [ipCollectionData, searchTerm]);

  const totalCash = displayedIpCollectionData.reduce((sum, row) => sum + row.cashPaid, 0);
  const totalSwipe = displayedIpCollectionData.reduce((sum, row) => sum + row.swpPaid, 0);
  const totalCollection = totalCash + totalSwipe;
  const totalDiscount = displayedIpCollectionData.reduce((sum, row) => sum + row.totDisc, 0);
  const totalPayable = displayedIpCollectionData.reduce((sum, row) => sum + row.pay, 0);
  const totalBalance = displayedIpCollectionData.reduce((sum, row) => sum + row.balance, 0);
  const totalAdvanceAdjust = displayedIpCollectionData.reduce((sum, row) => sum + row.advAdj, 0);

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
      .ip-bills-print-header { display: block !important; margin-bottom: 8px; }
      .ip-bills-print-title { text-align: center; font-weight: 700; margin: 6px 0 2px; }
      .ip-bills-print-subtitle { text-align: center; margin: 0 0 8px; }
      .ip-bills-screen-only { display: block !important; }
      .ip-bills-print-only { display: none !important; }
      table { width: 100%; border-collapse: collapse !important; }
      table, th, td { border: 1px solid #000 !important; }
      .ip-bills-print-table th,
      .ip-bills-print-table td { font-size: 11px !important; padding: 2px 4px !important; line-height: 1.2 !important; }
      .ip-bills-print-summary { display: none !important; }
      .ip-bills-print-summary table { width: auto !important; min-width: 320px; margin-left: auto !important; border-collapse: collapse !important; }
      .ip-bills-print-summary td { border: 1px solid #000 !important; padding: 3px 8px !important; font-size: 10px !important; line-height: 1.2 !important; }
      .ip-bills-print-summary .print-summary-label { font-weight: 600 !important; }
      thead { display: table-header-group; }
      tbody { display: table-row-group; }
      tr { page-break-inside: avoid; }
      @media print {
        .ip-bills-screen-only { display: none !important; }
        .ip-bills-print-only { display: block !important; }
        .ip-bills-print-summary { display: block !important; margin-top: 10px; }
      }
    `,
  });

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!fromDate || !toDate) {
      showValidationError("Please select both From Date and To Date.");
      return;
    }

    if (new Date(fromDate) > new Date(toDate)) {
      showValidationError("From Date cannot be greater than To Date.");
      return;
    }

    setLoading(true);
    try {
      const data = await cashCounterApi.fetchIpCollectionReport(fromDate, toDate);
      setIpCollectionData(data);
      setSubmitted(true);
    } catch {
      setIpCollectionData([]);
      setSubmitted(false);
      showErrorToast("Failed to fetch IP collection report data.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFromDate(today);
    setToDate(today);
    setSearchTerm("");
    setIpCollectionData([]);
    setSubmitted(false);
  };

  const handleExport = () => {
    const exportData = displayedIpCollectionData.map((row, index) => ({
      "S.No": index + 1,
      "OP No": row.displayNumber,
      "Patient Name": row.patientName,
      Date: row.dateTime,
      User: row.fullName,
      "Bill Display": row.billDisplay,
      Total: formatAmount(row.total),
      Discount: formatAmount(row.totDisc),
      "Adv Adj": formatAmount(row.advAdj),
      Pay: formatAmount(row.pay),
      Balance: formatAmount(row.balance),
      "Paid Cash": formatAmount(row.cashPaid),
      "Paid Swipe": formatAmount(row.swpPaid),
    }));

    exportToExcel(
      exportData,
      `IP_Collection_Report_${formatReportDate(new Date(), "DD-MM-YYYY")}`,
      "IP Collection Report"
    );
  };

  const renderIpCollectionTable = () => (
    <div style={{ overflowX: "auto" }}>
      <Table striped bordered hover className="table-hims mb-0 ip-bills-print-table ip-bills-screen-only">
        <thead>
          <tr>
            <th rowSpan={2} style={{ width: "60px" }}>S. No</th>
            <th rowSpan={2}>OP No</th>
            <th rowSpan={2}>Patient Name</th>
            <th rowSpan={2}>Date</th>
            <th rowSpan={2}>User</th>
            <th rowSpan={2}>Bill Display</th>
            <th rowSpan={2}>Total</th>
            <th rowSpan={2}>Discount</th>
            <th rowSpan={2}>Adv Adj</th>
            <th rowSpan={2}>Pay</th>
            <th rowSpan={2}>Balance</th>
            <th colSpan={2} className="text-center">Paid</th>
          </tr>
          <tr>
            <th className="text-center">Cash</th>
            <th className="text-center">Swipe</th>
          </tr>
        </thead>
        <tbody>
          {displayedIpCollectionData.length === 0 ? (
            <tr>
              <td colSpan={13} className="text-center text-muted py-4">
                No records found for the selected date range.
              </td>
            </tr>
          ) : (
            displayedIpCollectionData.map((row, index) => (
              <tr key={`${row.id}-${index}`}>
                <td>{index + 1}</td>
                <td>{row.displayNumber}</td>
                <td>{row.patientName}</td>
                <td>{row.dateTime}</td>
                <td style={{ color: "var(--page-secondary-color)" }} className="fw-bold">
                  {row.fullName}
                </td>
                <td>{row.billDisplay}</td>
                <td>{row.total}</td>
                <td>{row.totDisc}</td>
                <td>{row.advAdj}</td>
                <td>{row.pay}</td>
                <td>{row.balance}</td>
                <td
                  style={{
                    background: "var(--page-primary-color)",
                    color: "var(--page-secondary-color)",
                  }}
                  className="text-center fw-bold"
                >
                  {formatAmount(row.cashPaid)}
                </td>
                <td
                  style={{
                    background: "var(--page-primary-color)",
                    color: "var(--page-secondary-color)",
                  }}
                  className="text-center fw-bold"
                >
                  {formatAmount(row.swpPaid)}
                </td>
              </tr>
            ))
          )}
          <tr
            style={{
              fontWeight: "var(--font-weight-semibold)",
              background: "var(--color-table-header)",
            }}
          >
            <td colSpan={11} className="text-end">Total :</td>
            <td className="text-end">{formatAmount(totalCash)}</td>
            <td className="text-end">{formatAmount(totalSwipe)}</td>
          </tr>
        </tbody>
      </Table>
    </div>
  );

  const renderIpCollectionPrintTable = () => (
    <div className="ip-bills-print-only" style={{ display: "none", overflowX: "auto" }}>
      <Table bordered className="mb-0 ip-bills-print-table">
        <thead>
          <tr>
            <th>Patient Name</th>
            <th>OP No</th>
            <th>Bill Display</th>
            <th>Date Time</th>
            <th className="text-end">Total</th>
            <th className="text-end">Discount</th>
            <th className="text-end">Balance</th>
            <th className="text-end">Advance</th>
            <th className="text-end">Payable</th>
            <th className="text-end">Cash</th>
            <th className="text-end">Swipe</th>
          </tr>
        </thead>
        <tbody>
          {displayedIpCollectionData.length === 0 ? (
            <tr>
              <td colSpan={11} className="text-center text-muted py-4">
                No records found for the selected date range.
              </td>
            </tr>
          ) : (
            displayedIpCollectionData.map((row, index) => (
              <tr key={`print-${row.id}-${index}`}>
                <td>{row.patientName}</td>
                <td>{row.displayNumber}</td>
                <td>{row.billDisplay}</td>
                <td>{row.dateTime}</td>
                <td className="text-end">{formatAmount(row.total)}</td>
                <td className="text-end">{formatAmount(row.totDisc)}</td>
                <td className="text-end">{formatAmount(row.balance)}</td>
                <td className="text-end">{formatAmount(row.advAdj)}</td>
                <td className="text-end">{formatAmount(row.pay)}</td>
                <td className="text-end">{formatAmount(row.cashPaid)}</td>
                <td className="text-end">{formatAmount(row.swpPaid)}</td>
              </tr>
            ))
          )}
          <tr
            style={{
              fontWeight: "var(--font-weight-semibold)",
              background: "var(--color-table-header)",
            }}
          >
            <td colSpan={4} className="text-end">Total :</td>
            <td className="text-end">{formatAmount(displayedIpCollectionData.reduce((sum, row) => sum + row.total, 0))}</td>
            <td className="text-end">{formatAmount(totalDiscount)}</td>
            <td className="text-end">{formatAmount(totalBalance)}</td>
            <td className="text-end">{formatAmount(totalAdvanceAdjust)}</td>
            <td className="text-end">{formatAmount(totalPayable)}</td>
            <td className="text-end">{formatAmount(totalCash)}</td>
            <td className="text-end">{formatAmount(totalSwipe)}</td>
          </tr>
        </tbody>
      </Table>
    </div>
  );

  return (
    <Container fluid className="p-3 d-flex flex-column" style={{ minHeight: "100vh" }}>
      <ReportHeader
        title={`${organization?.name?.toUpperCase() || "HOSPITAL"} - IP Collection Report`}
        subtitle={submitted ? getDateRangeText(fromDate, toDate) : "Select date range and click Submit"}
        onSearch={setSearchTerm}
        showSearch={submitted}
        showSort={true}
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
                    disabled={loading}
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
                    disabled={loading}
                  />
                </Form.Group>
              </Col>
              <Col md={4} className="d-flex gap-2 flex-wrap">
                <Button
                  type="button"
                  className="theme-outline-btn-primary"
                  onClick={handlePrint}
                  disabled={loading || !submitted || displayedIpCollectionData.length === 0}
                >
                  Print
                </Button>
                <Button type="submit" className="theme-btn-primary" disabled={loading}>
                  {loading ? "Loading..." : "Submit"}
                </Button>
                <Button
                  type="button"
                  className="theme-outline-btn-primary"
                  onClick={handleReset}
                  disabled={loading}
                >
                  Reset
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {submitted && (
        <div className="d-flex flex-column gap-3 flex-grow-1">
          <Card className="shadow-sm">
            <Card.Header
              style={{
                fontSize: "var(--font-size-md)",
                fontWeight: "var(--font-weight-semibold)",
              }}
            >
              IP Collection
            </Card.Header>
            <Card.Body className="p-0">
              <div ref={printRef}>
                <div className="ip-bills-print-header" style={{ display: "none" }}>
                  <PrintHeaderReports organization={printOrganization} />
                  <div className="ip-bills-print-title">IP Collection Report</div>
                  <div className="ip-bills-print-subtitle">{getDateRangeText(fromDate, toDate)}</div>
                </div>
                {renderIpCollectionTable()}
                {renderIpCollectionPrintTable()}
                <div className="ip-bills-print-summary" style={{ display: "none" }}>
                  <table>
                    <tbody>
                      <tr>
                        <td className="print-summary-label">Total Collection</td>
                        <td className="text-end">{formatAmount(totalCollection)}</td>
                      </tr>
                      <tr>
                        <td className="print-summary-label">Total Discount</td>
                        <td className="text-end">{formatAmount(totalDiscount)}</td>
                      </tr>
                      <tr>
                        <td className="print-summary-label">Total Payable</td>
                        <td className="text-end">{formatAmount(totalPayable)}</td>
                      </tr>
                      <tr>
                        <td className="print-summary-label">Total Balance</td>
                        <td className="text-end">{formatAmount(totalBalance)}</td>
                      </tr>
                      <tr>
                        <td className="print-summary-label">Total Advance Adjust</td>
                        <td className="text-end">{formatAmount(totalAdvanceAdjust)}</td>
                      </tr>
                      <tr>
                        <td className="print-summary-label">Total Paid</td>
                        <td className="text-end">{formatAmount(totalCollection)}</td>
                      </tr>
                      <tr>
                        <td className="print-summary-label">Total Cash</td>
                        <td className="text-end">{formatAmount(totalCash)}</td>
                      </tr>
                      <tr>
                        <td className="print-summary-label">Total Swipe</td>
                        <td className="text-end">{formatAmount(totalSwipe)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </Card.Body>
            <Card.Footer className="d-flex justify-content-end align-items-center py-2">
              <span
                style={{
                  fontSize: "var(--font-size-md)",
                  fontWeight: "var(--font-weight-semibold)",
                }}
              >
                Total Collection :&nbsp;
                <span style={{ color: "var(--color-primary)" }}>
                  {formatAmount(totalCollection)}
                </span>
              </span>
            </Card.Footer>
          </Card>

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
                        {formatAmount(totalCash)}
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
                        {formatAmount(totalSwipe)}
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
                        {formatAmount(totalCollection)}
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

export default IpBills;

