import React, { useMemo, useRef, useState } from "react";
import { Container, Card, Form, Button, Row, Col, Table } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useReactToPrint } from "react-to-print";
import { RootState } from "../../../../../state/store";
import CashCounterApiService, {
  RegistrationCollectionRow,
  RegistrationDueCollectionRow,
} from "../../../../../api/cash-counter/cash-counter-api-service";
import { showErrorToast, showValidationError } from "../../../../../utils/alertUtil";
import PrintHeaderReports from "../../../../../components/PrintHeaderReports";
import ReportHeader from "../../../../../medical-records/components/ReportHeader";
import {
  exportToExcel,
  formatReportDate,
  getDateRangeText,
} from "../../../../../medical-records/utils/reportUtils";


const cashCounterApi = new CashCounterApiService();

const formatAmount = (value: number | string) =>
  typeof value === "number" ? value.toFixed(2) : value;

const includesSearchValue = (value: string | number | undefined, search: string) => {
  if (value == null) return false;
  return String(value).toLowerCase().includes(search);
};

const RegistrationReport: React.FC = () => {
  const organization = useSelector((state: RootState) => state.appReducer.organization);
  const printRef = useRef<HTMLDivElement>(null);
  const today = new Date().toISOString().split("T")[0];

  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [collectionData, setCollectionData] = useState<RegistrationCollectionRow[]>([]);
  const [dueCollectionData, setDueCollectionData] = useState<RegistrationDueCollectionRow[]>([]);

  const displayedCollectionData = useMemo(() => {
    const search = searchTerm.trim().toLowerCase();
    if (!search) return collectionData;
    return collectionData.filter((row) =>
      includesSearchValue(row.opNo, search) ||
      includesSearchValue(row.patName, search) ||
      includesSearchValue(row.total, search) ||
      includesSearchValue(row.pay, search) ||
      includesSearchValue(row.disc, search) ||
      includesSearchValue(row.paid, search) ||
      includesSearchValue(row.balance, search) ||
      includesSearchValue(row.cashPaid, search) ||
      includesSearchValue(row.bankPaid, search)
    );
  }, [collectionData, searchTerm]);

  const totalCash = displayedCollectionData.reduce(
    (sum, row) => sum + (parseFloat(row.cashPaid) || 0),
    0
  );
  const totalBank = displayedCollectionData.reduce((sum, row) => {
    const val = parseFloat(row.bankPaid);
    return sum + (isNaN(val) ? 0 : val);
  }, 0);
  const totalCollection = totalCash + totalBank;
  const totalColTotal = displayedCollectionData.reduce((sum, row) => sum + (parseFloat(String(row.total)) || 0), 0);
  const totalColDisc = displayedCollectionData.reduce((sum, row) => sum + (parseFloat(String(row.disc)) || 0), 0);
  const totalColBalance = displayedCollectionData.reduce((sum, row) => sum + (parseFloat(String(row.balance)) || 0), 0);

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
      .registration-print-header { display: block !important; margin-bottom: 8px; }
      .registration-print-title { text-align: center; font-weight: 700; margin: 4px 0 2px; font-size: 11px; }
      .registration-print-subtitle { text-align: center; margin: 0 0 6px; font-size: 9px; }
      .registration-screen-only { display: block !important; }
      .registration-print-only { display: none !important; }
      .registration-print-summary { display: none !important; }
      table { width: 100%; border-collapse: collapse !important; }
      table, th, td { border: 1px solid #000 !important; }
      .registration-print-table th,
      .registration-print-table td {
        font-size: 11px !important;
        padding: 1px 3px !important;
        line-height: 1.05 !important;
      }
      .registration-print-table thead th {
        padding: 2px 3px !important;
      }
      .registration-print-summary table {
        width: auto !important;
        min-width: 260px;
        margin-left: auto !important;
        border-collapse: collapse !important;
      }
      .registration-print-summary td {
        border: 1px solid #000 !important;
        padding: 2px 8px !important;
        font-size: 9px !important;
        line-height: 1.15 !important;
      }
      .registration-print-summary .print-summary-label {
        font-weight: 600 !important;
      }
      thead { display: table-header-group; }
      tbody { display: table-row-group; }
      tr { page-break-inside: avoid; }
      @media print {
        .registration-screen-only { display: none !important; }
        .registration-print-only { display: block !important; }
        .registration-print-summary { display: block !important; margin-top: 10px; }
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
      const [response, dueResponse] = await Promise.all([
        cashCounterApi.fetchRegistrationCollection(fromDate, toDate),
        cashCounterApi.fetchRegistrationDueCollection(fromDate, toDate),
      ]);
      setCollectionData(response);
      setDueCollectionData(dueResponse);
      setSubmitted(true);
    } catch {
      setCollectionData([]);
      setDueCollectionData([]);
      setSubmitted(false);
      showErrorToast("Failed to fetch registration collection data.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFromDate(today);
    setToDate(today);
    setSearchTerm("");
    setCollectionData([]);
    setDueCollectionData([]);
    setSubmitted(false);
  };

  const handleExport = () => {
    const exportData = displayedCollectionData.map((row, index) => ({
      "S.No": index + 1,
      "OP No": row.opNo,
      "Patient Name": row.patName,
      Total: row.total,
      Discount: row.disc,
      Pay: row.pay,
      Paid: row.paid,
      Balance: row.balance,
      "Cash Paid": row.cashPaid,
      "Bank Paid": row.bankPaid,
    }));
    exportToExcel(
      exportData,
      `Registration_Collection_${formatReportDate(new Date(), "DD-MM-YYYY")}`,
      "Registration Collection"
    );
  };

  const renderCollectionTable = () => (
    <div style={{ overflowX: "auto" }}>
      <Table striped bordered hover className="table-hims mb-0 registration-print-table registration-screen-only">
        <thead>
          <tr>
            <th rowSpan={2} style={{ width: "60px" }}>S. No</th>
            <th rowSpan={2}>OP No</th>
            <th rowSpan={2}>Patient Name</th>
            <th rowSpan={2}>Total</th>
            <th rowSpan={2}>Discount</th>
            <th rowSpan={2}>Pay</th>
            <th rowSpan={2}>Paid</th>
            <th rowSpan={2}>Balance</th>
            <th colSpan={2} className="text-center">Paid</th>
          </tr>
          <tr>
            <th className="text-center">Cash</th>
            <th className="text-center">Bank</th>
          </tr>
        </thead>
        <tbody>
          {displayedCollectionData.length === 0 ? (
            <tr>
              <td colSpan={10} className="text-center text-muted py-4">
                No records found for the selected date range.
              </td>
            </tr>
          ) : (
            displayedCollectionData.map((row, index) => (
              <tr key={`${row.patId}-${row.billId}-${index}`}>
                <td>{index + 1}</td>
                <td>{row.opNo}</td>
                <td>{row.patName}</td>
                <td>{formatAmount(row.total)}</td>
                <td>{formatAmount(row.disc)}</td>
                <td>{formatAmount(row.pay)}</td>
                <td>{formatAmount(row.paid)}</td>
                <td>{formatAmount(row.balance)}</td>
                <td
                  style={{
                    background: "var(--page-primary-color)",
                    color: "var(--page-secondary-color)",
                  }}
                  className="text-center fw-bold"
                >
                  {row.cashPaid}
                </td>
                <td
                  style={{
                    background: "var(--page-primary-color)",
                    color: "var(--page-secondary-color)",
                  }}
                  className="text-center fw-bold"
                >
                  {row.bankPaid}
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
            <td colSpan={8} className="text-end">
              Total :
            </td>
            <td className="text-end">{totalCash.toFixed(2)}</td>
            <td className="text-end">{totalBank.toFixed(2)}</td>
          </tr>
        </tbody>
      </Table>
    </div>
  );

  const dueTotalCash = dueCollectionData.reduce((s, r) => s + (r.cashPaid ?? 0), 0);
  const dueTotalSwipe = dueCollectionData.reduce((s, r) => s + (r.swpPaid ?? 0), 0);
  const totalDueCollection = dueTotalCash + dueTotalSwipe;

  const renderDueCollectionTable = () => (
    <div style={{ overflowX: "auto" }}>
      <Table striped bordered hover className="table-hims mb-0 registration-print-table registration-screen-only">
        <thead>
          <tr>
            <th rowSpan={2} style={{ width: "60px" }}>S. No</th>
            <th rowSpan={2}>OP No</th>
            <th rowSpan={2}>Patient Name</th>
            <th rowSpan={2}>Date</th>
            <th rowSpan={2}>User</th>
            <th rowSpan={2}>Bill Display</th>
            <th colSpan={2} className="text-center">Paid</th>
            <th rowSpan={2}>TransNo</th>
          </tr>
          <tr>
            <th className="text-center">Cash</th>
            <th className="text-center">Swipe</th>
          </tr>
        </thead>
        <tbody>
          {dueCollectionData.length === 0 ? (
            <tr>
              <td colSpan={9} className="text-center text-muted py-4">
                No records found for the selected date range.
              </td>
            </tr>
          ) : (
            dueCollectionData.map((row, index) => (
              <tr key={`${row.id}-${index}`}>
                <td>{index + 1}</td>
                <td>{row.displayNumber}</td>
                <td>{row.patientName}</td>
                <td>{row.dateTime ? row.dateTime.split("T")[0] : ""}</td>
                <td style={{ color: "var(--page-secondary-color)" }} className="fw-bold">{row.fullName}</td>
                <td>{row.billDisplay}</td>
                <td
                  style={{
                    background: "var(--page-primary-color)",
                    color: "var(--page-secondary-color)",
                  }}
                  className="text-center fw-bold"
                >
                  {row.cashPaid.toFixed(2)}
                </td>
                <td
                  style={{
                    background: "var(--page-primary-color)",
                    color: "var(--page-secondary-color)",
                  }}
                  className="text-center fw-bold"
                >
                  {row.swpPaid.toFixed(2)}
                </td>
                <td>{row.refNo}</td>
              </tr>
            ))
          )}
          <tr
            style={{
              fontWeight: "var(--font-weight-semibold)",
              background: "var(--color-table-header)",
            }}
          >
            <td colSpan={6} className="text-end">Total :</td>
            <td className="text-end">{dueTotalCash.toFixed(2)}</td>
            <td className="text-end">{dueTotalSwipe.toFixed(2)}</td>
            <td />
          </tr>
        </tbody>
      </Table>
    </div>
  );

  const renderCollectionPrintTable = () => (
    <div className="registration-print-only" style={{ display: "none", overflowX: "auto" }}>
      <Table bordered className="mb-0 registration-print-table">
        <thead>
          <tr>
            <th rowSpan={2}>Name</th>
            <th rowSpan={2}>OP No</th>
            <th rowSpan={2} className="text-end">Total</th>
            <th rowSpan={2} className="text-end">Discount</th>
            <th colSpan={2} className="text-center">Paid</th>
            <th rowSpan={2} className="text-end">Balance</th>
          </tr>
          <tr>
            <th className="text-center">Cash</th>
            <th className="text-center">Swipe</th>
          </tr>
        </thead>
        <tbody>
          {displayedCollectionData.length === 0 ? (
            <tr>
              <td colSpan={7} className="text-center text-muted py-4">
                No records found for the selected date range.
              </td>
            </tr>
          ) : (
            displayedCollectionData.map((row, index) => (
              <tr key={`print-reg-${row.patId}-${row.billId}-${index}`}>
                <td>{row.patName}</td>
                <td>{row.opNo}</td>
                <td className="text-end">{formatAmount(row.total)}</td>
                <td className="text-end">{formatAmount(row.disc)}</td>
                <td className="text-end">{row.cashPaid}</td>
                <td className="text-end">{row.bankPaid}</td>
                <td className="text-end">{formatAmount(row.balance)}</td>
              </tr>
            ))
          )}
          <tr style={{ fontWeight: "var(--font-weight-semibold)", background: "var(--color-table-header)" }}>
            <td colSpan={2} className="text-end">Total :</td>
            <td className="text-end">{totalColTotal.toFixed(2)}</td>
            <td className="text-end">{totalColDisc.toFixed(2)}</td>
            <td className="text-end">{totalCash.toFixed(2)}</td>
            <td className="text-end">{totalBank.toFixed(2)}</td>
            <td className="text-end">{totalColBalance.toFixed(2)}</td>
          </tr>
        </tbody>
      </Table>
    </div>
  );

  const renderDueCollectionPrintTable = () => (
    <div className="registration-print-only" style={{ display: "none", overflowX: "auto" }}>
      <Table bordered className="mb-0 registration-print-table">
        <thead>
          <tr>
            <th rowSpan={2}>Name</th>
            <th rowSpan={2}>OP No</th>
            <th rowSpan={2}>Bill No</th>
            <th rowSpan={2}>Date Time</th>
            <th colSpan={2} className="text-center">Paid</th>
          </tr>
          <tr>
            <th className="text-center">Cash</th>
            <th className="text-center">Swipe</th>
          </tr>
        </thead>
        <tbody>
          {dueCollectionData.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center text-muted py-4">
                No records found for the selected date range.
              </td>
            </tr>
          ) : (
            dueCollectionData.map((row, index) => (
              <tr key={`print-due-${row.id}-${index}`}>
                <td>{row.patientName}</td>
                <td>{row.displayNumber}</td>
                <td>{row.billDisplay}</td>
                <td>{row.dateTime ? row.dateTime.split("T")[0] : ""}</td>
                <td className="text-end">{row.cashPaid.toFixed(2)}</td>
                <td className="text-end">{row.swpPaid.toFixed(2)}</td>
              </tr>
            ))
          )}
          <tr style={{ fontWeight: "var(--font-weight-semibold)", background: "var(--color-table-header)" }}>
            <td colSpan={4} className="text-end">Total :</td>
            <td className="text-end">{dueTotalCash.toFixed(2)}</td>
            <td className="text-end">{dueTotalSwipe.toFixed(2)}</td>
          </tr>
        </tbody>
      </Table>
    </div>
  );

  return (
    <Container fluid className="p-3 d-flex flex-column" style={{ minHeight: "100vh" }}>
      <ReportHeader
        title={`${organization?.name?.toUpperCase() || "HOSPITAL"} - Registration Collection Report`}
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
                  disabled={loading || !submitted || (displayedCollectionData.length === 0 && dueCollectionData.length === 0)}
                >
                  Print
                </Button>
                <Button type="submit" className="theme-btn-primary" disabled={loading}>
                  {loading ? "Loading..." : "Submit"}
                </Button>
                <Button type="button" className="theme-outline-btn-primary" onClick={handleReset} disabled={loading}>
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
            <div className="registration-print-header" style={{ display: "none" }}>
              <PrintHeaderReports organization={printOrganization} />
              <div className="registration-print-title">Registration Collection Report</div>
              <div className="registration-print-subtitle">{getDateRangeText(fromDate, toDate)}</div>
            </div>

            <Card className="shadow-sm">
              <Card.Header
                style={{
                  fontSize: "var(--font-size-md)",
                  fontWeight: "var(--font-weight-semibold)",
                }}
              >
                Registration Collection
              </Card.Header>
              <Card.Body className="p-0">
                {renderCollectionTable()}
                {renderCollectionPrintTable()}
              </Card.Body>
              <Card.Footer className="d-flex justify-content-end align-items-center py-2 registration-screen-only">
                <span
                  style={{
                    fontSize: "var(--font-size-md)",
                    fontWeight: "var(--font-weight-semibold)",
                  }}
                >
                  Total Collection :&nbsp;
                  <span style={{ color: "var(--color-primary)" }}>
                    ₹ {totalCollection.toFixed(2)}
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
                Due Collections
              </Card.Header>
              <Card.Body className="p-0">
                {renderDueCollectionTable()}
                {renderDueCollectionPrintTable()}
              </Card.Body>
              <Card.Footer className="d-flex justify-content-end align-items-center py-2 registration-screen-only">
                <span
                  style={{
                    fontSize: "var(--font-size-md)",
                    fontWeight: "var(--font-weight-semibold)",
                  }}
                >
                  Total Due Collection :&nbsp;
                  <span style={{ color: "var(--color-primary)" }}>₹ {totalDueCollection.toFixed(2)}</span>
                </span>
              </Card.Footer>
            </Card>

            <div className="registration-print-summary" style={{ display: "none" }}>
              <table>
                <tbody>
                  <tr>
                    <td className="print-summary-label">Total Cash</td>
                    <td className="text-end">&#8377; {(totalCash + dueTotalCash).toFixed(2)}</td>
                  </tr>
                  <tr>
                    <td className="print-summary-label">Total Swipe</td>
                    <td className="text-end">&#8377; {(totalBank + dueTotalSwipe).toFixed(2)}</td>
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
                  {[
                    { label: "Registration Cash", value: totalCash + dueTotalCash },
                    { label: "Registration Bank", value: totalBank + dueTotalSwipe },
                  ].map(({ label, value }) => (
                    <Col xs={12} key={label}>
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
                        <span>{label}</span>
                        <span style={{ fontWeight: "var(--font-weight-semibold)" }}>
                          ₹ {value.toFixed(2)}
                        </span>
                      </div>
                    </Col>
                  ))}
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
                        ₹ {(totalCollection + totalDueCollection).toFixed(2)}
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

export default RegistrationReport;
