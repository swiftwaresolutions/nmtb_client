import React, { useState, useMemo } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  Row,
  Col,
  Spinner,
  Modal,
  Table,
} from "react-bootstrap";
import ReportHeader from "../../../medical-records/components/ReportHeader";
import ReportKPICard from "../../../medical-records/components/ReportKPICard";
import {
  printReport,
  exportToExcel,
  formatReportDate,
} from "../../../medical-records/utils/reportUtils";
import "../../../medical-records/styles/reportStyles.css";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtCurrency = (n: number) =>
  n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function daysInMonth(month: number, year: number): number {
  return new Date(year, month, 0).getDate(); // month is 1-based
}

// ─── Types ────────────────────────────────────────────────────────────────────
interface BillItem {
  slNo: number;
  medicineName: string;
  batchNo: string;
  units: number;
  mrp: number;
  total: number;
}

interface BillRecord {
  id: number;
  billNo: string;
  time: string;
  opNo: string;
  patientName: string;
  paidAmount: number;
  isCancelled: boolean;
  items: BillItem[];
}

// ─── Demo Data (key = "month/day" for DEMO_YEAR) ─────────────────────────────
const DEMO_YEAR = 2025;

const DEMO_BILLS: Record<string, BillRecord[]> = {
  "1/15": [
    {
      id: 1, billNo: "PH-2025-001", time: "09:15 AM", opNo: "OP-0421",
      patientName: "Ravi Kumar", paidAmount: 279.00, isCancelled: false,
      items: [
        { slNo: 1, medicineName: "Paracetamol 500mg", batchNo: "B-001",  units: 10, mrp: 2.50, total: 25.00  },
        { slNo: 2, medicineName: "Amoxicillin 250mg", batchNo: "B-045",  units: 14, mrp: 8.50, total: 119.00 },
        { slNo: 3, medicineName: "Pantoprazole 40mg", batchNo: "PZ-008", units: 15, mrp: 9.00, total: 135.00 },
      ],
    },
    {
      id: 2, billNo: "PH-2025-002", time: "11:30 AM", opNo: "OP-0422",
      patientName: "Meena Devi", paidAmount: 292.50, isCancelled: false,
      items: [
        { slNo: 1, medicineName: "Metformin 500mg", batchNo: "M-012",  units: 30, mrp: 5.00,  total: 150.00 },
        { slNo: 2, medicineName: "Amlodipine 5mg",  batchNo: "AM-031", units: 30, mrp: 4.75,  total: 142.50 },
      ],
    },
  ],
  "3/3": [
    {
      id: 3, billNo: "PH-2025-003", time: "08:45 AM", opNo: "OP-0501",
      patientName: "Suresh Babu", paidAmount: 517.50, isCancelled: false,
      items: [
        { slNo: 1, medicineName: "Ceftriaxone 1g Inj.",  batchNo: "CF-022", units: 5, mrp: 85.00, total: 425.00 },
        { slNo: 2, medicineName: "Ondansetron 4mg Inj.", batchNo: "ON-009", units: 5, mrp: 18.50, total: 92.50  },
      ],
    },
    {
      id: 4, billNo: "PH-2025-004", time: "10:00 AM", opNo: "OP-0502",
      patientName: "Lakshmi S.", paidAmount: 280.00, isCancelled: false,
      items: [
        { slNo: 1, medicineName: "Atorvastatin 10mg", batchNo: "AT-018", units: 15, mrp: 12.00, total: 180.00 },
        { slNo: 2, medicineName: "Metformin 500mg",   batchNo: "M-012",  units: 20, mrp: 5.00,  total: 100.00 },
      ],
    },
    {
      id: 5, billNo: "PH-2025-005", time: "02:30 PM", opNo: "OP-0503",
      patientName: "Anandan R.", paidAmount: 0.00, isCancelled: true,
      items: [
        { slNo: 1, medicineName: "Dolo 650mg", batchNo: "D-012", units: 10, mrp: 4.50, total: 45.00 },
      ],
    },
  ],
  "3/12": [
    {
      id: 6, billNo: "PH-2025-006", time: "09:00 AM", opNo: "OP-0601",
      patientName: "Kavitha M.", paidAmount: 560.00, isCancelled: false,
      items: [
        { slNo: 1, medicineName: "Insulin Regular 10ml", batchNo: "INS-01", units: 2,  mrp: 185.00, total: 370.00 },
        { slNo: 2, medicineName: "Glucometer Strips",    batchNo: "GS-010", units: 25, mrp: 7.60,   total: 190.00 },
      ],
    },
    {
      id: 7, billNo: "PH-2025-007", time: "04:15 PM", opNo: "OP-0602",
      patientName: "Murugan P.", paidAmount: 190.50, isCancelled: false,
      items: [
        { slNo: 1, medicineName: "Pantoprazole 40mg",    batchNo: "PZ-008", units: 15, mrp: 9.00,  total: 135.00 },
        { slNo: 2, medicineName: "Ondansetron 4mg Inj.", batchNo: "ON-009", units: 3,  mrp: 18.50, total: 55.50  },
      ],
    },
  ],
  "5/20": [
    {
      id: 8, billNo: "PH-2025-008", time: "11:00 AM", opNo: "OP-0801",
      patientName: "Priya N.", paidAmount: 776.50, isCancelled: false,
      items: [
        { slNo: 1, medicineName: "Ceftriaxone 1g Inj.",      batchNo: "CF-022", units: 6,  mrp: 85.00, total: 510.00 },
        { slNo: 2, medicineName: "Dexamethasone 4mg Inj.",   batchNo: "DX-014", units: 4,  mrp: 22.00, total: 88.00  },
        { slNo: 3, medicineName: "Amoxicillin 250mg",        batchNo: "B-045",  units: 21, mrp: 8.50,  total: 178.50 },
      ],
    },
    {
      id: 9, billNo: "PH-2025-009", time: "03:45 PM", opNo: "OP-0802",
      patientName: "Saranya V.", paidAmount: 322.50, isCancelled: false,
      items: [
        { slNo: 1, medicineName: "Amlodipine 5mg",    batchNo: "AM-031", units: 30, mrp: 4.75,  total: 142.50 },
        { slNo: 2, medicineName: "Atorvastatin 10mg", batchNo: "AT-018", units: 15, mrp: 12.00, total: 180.00 },
      ],
    },
  ],
  "7/7": [
    {
      id: 10, billNo: "PH-2025-010", time: "10:30 AM", opNo: "OP-1001",
      patientName: "Balamurugan S.", paidAmount: 1203.00, isCancelled: false,
      items: [
        { slNo: 1, medicineName: "Insulin Regular 10ml", batchNo: "INS-01", units: 5,  mrp: 185.00, total: 925.00 },
        { slNo: 2, medicineName: "Glucometer Strips",    batchNo: "GS-010", units: 30, mrp: 7.60,   total: 228.00 },
        { slNo: 3, medicineName: "Paracetamol 500mg",    batchNo: "B-001",  units: 20, mrp: 2.50,   total: 50.00  },
      ],
    },
  ],
  "8/15": [
    {
      id: 11, billNo: "PH-2025-011", time: "08:30 AM", opNo: "OP-1101",
      patientName: "Ranjitha K.", paidAmount: 485.00, isCancelled: false,
      items: [
        { slNo: 1, medicineName: "Metformin 500mg",   batchNo: "M-012",  units: 60, mrp: 5.00, total: 300.00 },
        { slNo: 2, medicineName: "Amlodipine 5mg",    batchNo: "AM-031", units: 20, mrp: 4.75, total: 95.00  },
        { slNo: 3, medicineName: "Pantoprazole 40mg", batchNo: "PZ-008", units: 10, mrp: 9.00, total: 90.00  },
      ],
    },
    {
      id: 12, billNo: "PH-2025-012", time: "12:00 PM", opNo: "OP-1102",
      patientName: "Anitha S.", paidAmount: 336.00, isCancelled: false,
      items: [
        { slNo: 1, medicineName: "Atorvastatin 10mg", batchNo: "AT-018", units: 28, mrp: 12.00, total: 336.00 },
      ],
    },
    {
      id: 13, billNo: "PH-2025-013", time: "05:00 PM", opNo: "OP-1103",
      patientName: "Ramesh T.", paidAmount: 0.00, isCancelled: true,
      items: [
        { slNo: 1, medicineName: "Dolo 650mg",        batchNo: "D-012", units: 20, mrp: 4.50, total: 90.00 },
        { slNo: 2, medicineName: "Paracetamol 500mg", batchNo: "B-001", units: 10, mrp: 2.50, total: 25.00 },
      ],
    },
  ],
  "10/5": [
    {
      id: 14, billNo: "PH-2025-014", time: "09:45 AM", opNo: "OP-1401",
      patientName: "Selvi P.", paidAmount: 620.00, isCancelled: false,
      items: [
        { slNo: 1, medicineName: "Ceftriaxone 1g Inj.",    batchNo: "CF-022", units: 4, mrp: 85.00, total: 340.00 },
        { slNo: 2, medicineName: "Ondansetron 4mg Inj.",   batchNo: "ON-009", units: 8, mrp: 18.50, total: 148.00 },
        { slNo: 3, medicineName: "Dexamethasone 4mg Inj.", batchNo: "DX-014", units: 6, mrp: 22.00, total: 132.00 },
      ],
    },
    {
      id: 15, billNo: "PH-2025-015", time: "02:00 PM", opNo: "OP-1402",
      patientName: "Vijay K.", paidAmount: 169.00, isCancelled: false,
      items: [
        { slNo: 1, medicineName: "Amoxicillin 250mg", batchNo: "B-045", units: 14, mrp: 8.50, total: 119.00 },
        { slNo: 2, medicineName: "Paracetamol 500mg", batchNo: "B-001", units: 20, mrp: 2.50, total: 50.00  },
      ],
    },
  ],
  "12/10": [
    {
      id: 16, billNo: "PH-2025-016", time: "10:15 AM", opNo: "OP-1601",
      patientName: "Deepa M.", paidAmount: 705.00, isCancelled: false,
      items: [
        { slNo: 1, medicineName: "Insulin Regular 10ml", batchNo: "INS-01", units: 3,  mrp: 185.00, total: 555.00 },
        { slNo: 2, medicineName: "Metformin 500mg",      batchNo: "M-012",  units: 30, mrp: 5.00,   total: 150.00 },
      ],
    },
    {
      id: 17, billNo: "PH-2025-017", time: "03:30 PM", opNo: "OP-1602",
      patientName: "Karthik S.", paidAmount: 445.50, isCancelled: false,
      items: [
        { slNo: 1, medicineName: "Atorvastatin 10mg", batchNo: "AT-018", units: 30, mrp: 12.00, total: 360.00 },
        { slNo: 2, medicineName: "Amlodipine 5mg",    batchNo: "AM-031", units: 18, mrp: 4.75,  total: 85.50  },
      ],
    },
  ],
};
// ─────────────────────────────────────────────────────────────────────────────

const YEAR_OPTIONS = Array.from({ length: 7 }, (_, i) => 2020 + i); // 2020–2026

export default function PhBillRegister() {
  const [selectedYear, setSelectedYear] = useState<number>(DEMO_YEAR);
  const [loadedYear,   setLoadedYear]   = useState<number>(DEMO_YEAR);
  const [submitted,    setSubmitted]    = useState<boolean>(true);
  const [loading,      setLoading]      = useState<boolean>(false);

  // Day bills modal
  const [showDayModal,   setShowDayModal]   = useState(false);
  const [dayModalKey,    setDayModalKey]    = useState<string>("");
  const [dayModalLabel,  setDayModalLabel]  = useState<string>("");

  // Bill items modal
  const [showBillModal,    setShowBillModal]    = useState(false);
  const [selectedBill,     setSelectedBill]     = useState<BillRecord | null>(null);
  const [fromDayModal,     setFromDayModal]     = useState(false);

  const allBills = useMemo(() => Object.values(DEMO_BILLS).flat(), []);

  const stats = useMemo(() => ({
    total:     allBills.length,
    active:    allBills.filter((b) => !b.isCancelled).length,
    cancelled: allBills.filter((b) =>  b.isCancelled).length,
    amount:    allBills.filter((b) => !b.isCancelled).reduce((s, b) => s + b.paidAmount, 0),
  }), [allBills]);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setSubmitted(false);
    setTimeout(() => {
      setLoadedYear(selectedYear);
      setSubmitted(true);
      setLoading(false);
    }, 600);
  };

  const handleReset = () => {
    setSelectedYear(DEMO_YEAR);
    setLoadedYear(DEMO_YEAR);
    setSubmitted(false);
  };

  const handleDateClick = (month: number, day: number) => {
    const key = `${month}/${day}`;
    if ((DEMO_BILLS[key]?.length ?? 0) > 0) {
      const pad = (n: number) => String(n).padStart(2, "0");
      setDayModalKey(key);
      setDayModalLabel(`${pad(day)}/${pad(month)}/${loadedYear}`);
      setShowDayModal(true);
    }
  };

  const handleBillClick = (bill: BillRecord) => {
    setSelectedBill(bill);
    setFromDayModal(true);
    setShowDayModal(false);
    setShowBillModal(true);
  };

  const handleBillModalBack = () => {
    setShowBillModal(false);
    setShowDayModal(true);
  };

  const handleExport = () => {
    const exportData = allBills.map((b, i) => ({
      "Sl. No":       i + 1,
      "Bill No":      b.billNo,
      "Time":         b.time,
      "OP No":        b.opNo,
      "Patient Name": b.patientName,
      "Paid Amount":  fmtCurrency(b.paidAmount),
      "Is Cancelled": b.isCancelled ? "Yes" : "No",
    }));
    exportToExcel(
      exportData,
      `Bill_Register_${loadedYear}_${formatReportDate(new Date(), "DD-MM-YYYY")}`,
      `Bill Register ${loadedYear}`
    );
  };

  const dayBills = dayModalKey ? (DEMO_BILLS[dayModalKey] ?? []) : [];

  return (
    <React.Fragment>
      <Container fluid className="px-4 py-3">
        <ReportHeader
          title="Date Wise Bill Register"
          subtitle={submitted ? `Year : ${loadedYear}` : "Select year and click Submit"}
          onPrint={printReport}
          onExport={handleExport}
          onSearch={() => {}}
          showSearch={false}
          showSort={false}
          showPrint={submitted}
          showExport={submitted}
        />

        {/* Filter Form */}
        <Card className="mb-4 shadow-sm no-print">
          <Card.Body>
            <Form className="row g-3 align-items-end" onSubmit={handleFilterSubmit}>
              <Form.Group as={Col} md={4} controlId="year">
                <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>
                  Select the Year
                </Form.Label>
                <Form.Select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                >
                  {YEAR_OPTIONS.map((y) => (
                    <option key={y} value={y}>{y}</option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group as={Col} md={4} className="d-flex align-items-end gap-2">
                <Button type="submit" variant="primary" className="w-50" disabled={loading}>
                  {loading ? "Loading..." : "Submit"}
                </Button>
                <Button type="button" variant="secondary" className="w-50" onClick={handleReset}>
                  Reset
                </Button>
              </Form.Group>
            </Form>
          </Card.Body>
        </Card>

        {/* KPI Cards */}
        {submitted && (
          <Row className="mb-4">
            <Col md={3}>
              <ReportKPICard label="Total Bills"   value={stats.total}                        variant="primary" />
            </Col>
            <Col md={3}>
              <ReportKPICard label="Active Bills"  value={stats.active}                       variant="success" />
            </Col>
            <Col md={3}>
              <ReportKPICard label="Cancelled"     value={stats.cancelled}                    variant="danger"  />
            </Col>
            <Col md={3}>
              <ReportKPICard label="Total Amount"  value={`₹ ${fmtCurrency(stats.amount)}`}  variant="info"    />
            </Col>
          </Row>
        )}

        {/* Calendar Grid */}
        {loading ? (
          <div className="text-center py-5 text-muted">
            <Spinner animation="border" role="status" />
            <div className="mt-3">Loading bill register...</div>
          </div>
        ) : submitted && (
          <Card className="report-card" style={{ padding: "0.75rem" }}>
            <div
              style={{
                fontSize: "var(--font-size-sm)",
                fontWeight: "var(--font-weight-medium)",
                color: "#333",
                marginBottom: "0.5rem",
              }}
            >
              Bills for the Year :{" "}
              <strong>{loadedYear}</strong>
              <small className="text-muted ms-3">
                Click a count to view bills for that day
              </small>
            </div>

            <div style={{ overflowX: "auto" }}>
              <Table
                bordered
                size="sm"
                className="mb-0"
                style={{ minWidth: "1050px" }}
              >
                <thead>
                  <tr style={{ background: "#343a40", color: "#fff" }}>
                    <th
                      style={{
                        minWidth: "110px",
                        padding: "5px 8px",
                        fontSize: "var(--font-size-sm)",
                        fontWeight: "var(--font-weight-semibold)",
                        position: "sticky",
                        left: 0,
                        background: "#343a40",
                        zIndex: 1,
                      }}
                    >
                      Month Name
                    </th>
                    {Array.from({ length: 31 }, (_, i) => (
                      <th
                        key={i + 1}
                        className="text-center"
                        style={{
                          minWidth: "30px",
                          padding: "5px 2px",
                          fontSize: "var(--font-size-xs)",
                          fontWeight: "var(--font-weight-semibold)",
                        }}
                      >
                        {i + 1}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {MONTH_NAMES.map((monthName, mIdx) => {
                    const month = mIdx + 1;
                    const maxDay = daysInMonth(month, loadedYear);
                    return (
                      <tr key={month}>
                        <td
                          style={{
                            padding: "4px 8px",
                            fontWeight: "var(--font-weight-medium)",
                            fontSize: "var(--font-size-sm)",
                            whiteSpace: "nowrap",
                            background: "#f8f9fa",
                            position: "sticky",
                            left: 0,
                            zIndex: 1,
                          }}
                        >
                          {monthName}
                        </td>
                        {Array.from({ length: 31 }, (_, dIdx) => {
                          const day = dIdx + 1;
                          if (day > maxDay) {
                            return (
                              <td
                                key={day}
                                style={{ background: "#ebebeb", padding: "4px 2px" }}
                              />
                            );
                          }
                          const key = `${month}/${day}`;
                          const count = DEMO_BILLS[key]?.length ?? 0;
                          return (
                            <td
                              key={day}
                              className="text-center"
                              style={{ padding: "4px 2px" }}
                            >
                              {count > 0 ? (
                                <span
                                  style={{
                                    color: "#0d6efd",
                                    cursor: "pointer",
                                    textDecoration: "underline",
                                    fontWeight: "var(--font-weight-semibold)",
                                    fontSize: "var(--font-size-sm)",
                                  }}
                                  onClick={() => handleDateClick(month, day)}
                                >
                                  {count}
                                </span>
                              ) : (
                                <span style={{ color: "#ccc", fontSize: "var(--font-size-xs)" }}>
                                  –
                                </span>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </Table>
            </div>
          </Card>
        )}
      </Container>

      {/* ── Day Bills Modal ─────────────────────────────────────────────────── */}
      <Modal show={showDayModal} onHide={() => setShowDayModal(false)} size="lg" centered>
        <Modal.Header closeButton style={{ borderBottom: "2px solid #dee2e6" }}>
          <Modal.Title
            style={{
              fontSize: "var(--font-size-lg)",
              fontWeight: "var(--font-weight-semibold)",
            }}
          >
            Bill Details as on{" "}
            <span style={{ color: "#000080" }}>{dayModalLabel}</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: "1.25rem" }}>
          <Table bordered size="sm" className="mb-0">
            <thead className="table-dark">
              <tr>
                <th className="text-center" style={{ width: "6%"  }}>Sl. No.</th>
                <th className="text-center" style={{ width: "11%" }}>Time</th>
                <th className="text-center" style={{ width: "14%" }}>OP No</th>
                <th                         style={{ width: "28%" }}>Patient Name</th>
                <th                         style={{ width: "22%" }}>Bill No.</th>
                <th className="text-end"    style={{ width: "13%" }}>Paid Amount</th>
                <th className="text-center" style={{ width: "10%" }}>Is Cancelled</th>
              </tr>
            </thead>
            <tbody>
              {dayBills.map((bill, idx) => (
                <tr
                  key={bill.id}
                  style={{ background: idx % 2 === 0 ? "#fdfdfd" : "#f5f5f5" }}
                >
                  <td className="text-center">{idx + 1}</td>
                  <td className="text-center">{bill.time}</td>
                  <td className="text-center">{bill.opNo}</td>
                  <td>&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;{bill.patientName}</td>
                  <td>
                    &nbsp;&nbsp;&nbsp;&nbsp;
                    <span
                      style={{
                        color: "#0d6efd",
                        cursor: "pointer",
                        textDecoration: "underline",
                        fontWeight: "var(--font-weight-semibold)",
                      }}
                      onClick={() => handleBillClick(bill)}
                    >
                      {bill.billNo}
                    </span>
                  </td>
                  <td
                    className="text-end pe-3"
                    style={{ color: bill.isCancelled ? "#999" : "inherit" }}
                  >
                    {fmtCurrency(bill.paidAmount)}
                  </td>
                  <td className="text-center">
                    <span
                      style={{
                        padding: "2px 8px",
                        borderRadius: "4px",
                        background: bill.isCancelled ? "#f8d7da" : "#d1e7dd",
                        color:      bill.isCancelled ? "#58151c" : "#0a3622",
                        fontSize:   "var(--font-size-xs)",
                        fontWeight: "var(--font-weight-semibold)",
                      }}
                    >
                      {bill.isCancelled ? "Yes" : "No"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDayModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── Bill Items Modal ────────────────────────────────────────────────── */}
      <Modal show={showBillModal} onHide={() => setShowBillModal(false)} size="lg" centered>
        <Modal.Header closeButton style={{ borderBottom: "2px solid #dee2e6" }}>
          <Modal.Title
            style={{
              fontSize: "var(--font-size-lg)",
              fontWeight: "var(--font-weight-semibold)",
            }}
          >
            Details of Bill No :{" "}
            <span style={{ color: "#000080" }}>{selectedBill?.billNo}</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: "1.25rem" }}>
          {selectedBill && (
            <>
              {/* Bill meta */}
              <div
                className="mb-3 p-2 px-3"
                style={{
                  background: "#f8f9fa",
                  borderRadius: "6px",
                  border: "1px solid #dee2e6",
                }}
              >
                <Row className="g-1">
                  <Col md={3}>
                    <span style={{ fontSize: "var(--font-size-sm)" }}>OP No :&nbsp;</span>
                    <span style={{ fontWeight: "var(--font-weight-semibold)", color: "#000080" }}>
                      {selectedBill.opNo}
                    </span>
                  </Col>
                  <Col md={4}>
                    <span style={{ fontSize: "var(--font-size-sm)" }}>Patient :&nbsp;</span>
                    <span style={{ fontWeight: "var(--font-weight-semibold)", color: "#000080" }}>
                      {selectedBill.patientName}
                    </span>
                  </Col>
                  <Col md={3}>
                    <span style={{ fontSize: "var(--font-size-sm)" }}>Time :&nbsp;</span>
                    <span style={{ fontWeight: "var(--font-weight-medium)" }}>
                      {selectedBill.time}
                    </span>
                  </Col>
                  <Col md={2} className="text-end">
                    <span
                      style={{
                        padding: "2px 10px",
                        borderRadius: "4px",
                        background: selectedBill.isCancelled ? "#f8d7da" : "#d1e7dd",
                        color:      selectedBill.isCancelled ? "#58151c" : "#0a3622",
                        fontSize:   "var(--font-size-xs)",
                        fontWeight: "var(--font-weight-semibold)",
                      }}
                    >
                      {selectedBill.isCancelled ? "Cancelled" : "Active"}
                    </span>
                  </Col>
                </Row>
              </div>

              {/* Items table */}
              <Table bordered size="sm" className="mb-0">
                <thead className="table-dark">
                  <tr>
                    <th className="text-center" style={{ width: "6%"  }}>S. No.</th>
                    <th                         style={{ width: "44%" }}>Medicine Name</th>
                    <th                         style={{ width: "14%" }}>Batch No</th>
                    <th className="text-end"    style={{ width: "12%" }}>Units</th>
                    <th className="text-end"    style={{ width: "10%" }}>M. R. P</th>
                    <th className="text-end"    style={{ width: "14%" }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedBill.items.map((item) => (
                    <tr key={item.slNo}>
                      <td className="text-center">{item.slNo}</td>
                      <td>&nbsp;&nbsp;&nbsp;{item.medicineName}</td>
                      <td>&nbsp;&nbsp;&nbsp;{item.batchNo}</td>
                      <td className="text-end pe-3">{item.units}</td>
                      <td className="text-end pe-3">{fmtCurrency(item.mrp)}</td>
                      <td className="text-end pe-3" style={{ fontWeight: "var(--font-weight-semibold)" }}>
                        {fmtCurrency(item.total)}
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr
                    style={{
                      background: "#f1f3f5",
                      fontWeight: "var(--font-weight-bold)",
                      fontSize: "var(--font-size-sm)",
                    }}
                  >
                    <td colSpan={5} className="text-end pe-2">Paid Amount</td>
                    <td className="text-end pe-3">{fmtCurrency(selectedBill.paidAmount)}</td>
                  </tr>
                </tfoot>
              </Table>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          {fromDayModal && (
            <Button variant="outline-secondary" onClick={handleBillModalBack}>
              ← Back
            </Button>
          )}
          <Button variant="secondary" onClick={() => setShowBillModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </React.Fragment>
  );
}
