import React, { useState, useMemo } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  Row,
  Col,
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
import { showValidationError } from "../../../utils/alertUtil";
import "../../../medical-records/styles/reportStyles.css";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtAmt = (n: number) =>
  n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const today = () => {
  const d = new Date();
  return d.toISOString().slice(0, 10);
};

// ─── Types ────────────────────────────────────────────────────────────────────
interface MedItem {
  slNo: number;
  medName: string;
  batchNo: string;
  expDate: string;
  units: number;
  mrp: number;
  total: number;
}

interface WardBill {
  id: number;
  billNo: string;
  date: string;
  user: string;
  total: number;
  disc: number;
  pay: number;
  paid: number;
  bal: number;
  items: MedItem[];
}

interface WardData {
  id: number;
  wardName: string;
  bills: WardBill[];
}

// ─── Demo Data ────────────────────────────────────────────────────────────────
const WARDS: WardData[] = [
  {
    id: 1,
    wardName: "General Ward",
    bills: [
      {
        id: 1, billNo: "WB-001", date: "2026-03-01", user: "Nurse Priya",
        total: 850.00, disc: 42.50, pay: 807.50, paid: 807.50, bal: 0.00,
        items: [
          { slNo: 1, medName: "Paracetamol 500mg",   batchNo: "B-001",  expDate: "12/2026", units: 30, mrp: 2.50,  total: 75.00  },
          { slNo: 2, medName: "Amoxicillin 250mg",    batchNo: "B-045",  expDate: "06/2026", units: 28, mrp: 8.50,  total: 238.00 },
          { slNo: 3, medName: "Pantoprazole 40mg",    batchNo: "PZ-008", expDate: "09/2026", units: 30, mrp: 9.00,  total: 270.00 },
          { slNo: 4, medName: "Metformin 500mg",      batchNo: "M-012",  expDate: "03/2027", units: 53, mrp: 5.00,  total: 267.00 },
        ],
      },
      {
        id: 2, billNo: "WB-002", date: "2026-03-03", user: "Nurse Kavitha",
        total: 550.00, disc: 0.00, pay: 550.00, paid: 500.00, bal: 50.00,
        items: [
          { slNo: 1, medName: "Amlodipine 5mg",       batchNo: "AM-031", expDate: "08/2026", units: 30, mrp: 4.75,  total: 142.50 },
          { slNo: 2, medName: "Atorvastatin 10mg",    batchNo: "AT-018", expDate: "11/2026", units: 30, mrp: 12.00, total: 360.00 },
          { slNo: 3, medName: "Ibuprofen 400mg",      batchNo: "IB-005", expDate: "05/2027", units: 15, mrp: 3.00,  total: 45.00  },
          { slNo: 4, medName: "Dolo 650mg",            batchNo: "D-012",  expDate: "02/2027", units: 2,  mrp: 1.25,  total: 2.50   },
        ],
      },
      {
        id: 3, billNo: "WB-003", date: "2026-03-05", user: "Nurse Priya",
        total: 420.00, disc: 21.00, pay: 399.00, paid: 399.00, bal: 0.00,
        items: [
          { slNo: 1, medName: "Ondansetron 4mg Inj.", batchNo: "ON-009", expDate: "07/2026", units: 10, mrp: 18.50, total: 185.00 },
          { slNo: 2, medName: "Pantoprazole 40mg",    batchNo: "PZ-008", expDate: "09/2026", units: 26, mrp: 9.00,  total: 234.00 },
        ],
      },
    ],
  },
  {
    id: 2,
    wardName: "ICU",
    bills: [
      {
        id: 4, billNo: "WB-004", date: "2026-03-02", user: "Sr. Nurse Meena",
        total: 2400.00, disc: 120.00, pay: 2280.00, paid: 2280.00, bal: 0.00,
        items: [
          { slNo: 1, medName: "Ceftriaxone 1g Inj.",      batchNo: "CF-022", expDate: "04/2026", units: 10, mrp: 85.00,  total: 850.00  },
          { slNo: 2, medName: "Dexamethasone 4mg Inj.",   batchNo: "DX-014", expDate: "10/2026", units: 10, mrp: 22.00,  total: 220.00  },
          { slNo: 3, medName: "Ondansetron 4mg Inj.",     batchNo: "ON-009", expDate: "07/2026", units: 20, mrp: 18.50,  total: 370.00  },
          { slNo: 4, medName: "Insulin Regular 10ml",     batchNo: "INS-01", expDate: "01/2027", units: 5,  mrp: 185.00, total: 925.00  },
          { slNo: 5, medName: "Paracetamol 500mg",        batchNo: "B-001",  expDate: "12/2026", units: 14, mrp: 2.50,   total: 35.00   },
        ],
      },
      {
        id: 5, billNo: "WB-005", date: "2026-03-06", user: "Sr. Nurse Meena",
        total: 1750.00, disc: 175.00, pay: 1575.00, paid: 1200.00, bal: 375.00,
        items: [
          { slNo: 1, medName: "Ceftriaxone 1g Inj.",      batchNo: "CF-022", expDate: "04/2026", units: 8,  mrp: 85.00,  total: 680.00  },
          { slNo: 2, medName: "Insulin Regular 10ml",     batchNo: "INS-01", expDate: "01/2027", units: 3,  mrp: 185.00, total: 555.00  },
          { slNo: 3, medName: "Ondansetron 4mg Inj.",     batchNo: "ON-009", expDate: "07/2026", units: 10, mrp: 18.50,  total: 185.00  },
          { slNo: 4, medName: "Dexamethasone 4mg Inj.",   batchNo: "DX-014", expDate: "10/2026", units: 15, mrp: 22.00,  total: 330.00  },
        ],
      },
    ],
  },
  {
    id: 3,
    wardName: "Paediatric Ward",
    bills: [
      {
        id: 6, billNo: "WB-006", date: "2026-03-04", user: "Nurse Anitha",
        total: 320.00, disc: 16.00, pay: 304.00, paid: 304.00, bal: 0.00,
        items: [
          { slNo: 1, medName: "Paracetamol 500mg",   batchNo: "B-001",  expDate: "12/2026", units: 20, mrp: 2.50,  total: 50.00  },
          { slNo: 2, medName: "Amoxicillin 250mg",   batchNo: "B-045",  expDate: "06/2026", units: 14, mrp: 8.50,  total: 119.00 },
          { slNo: 3, medName: "Metronidazole 400mg", batchNo: "MZ-003", expDate: "08/2026", units: 43, mrp: 3.50,  total: 150.50 },
        ],
      },
      {
        id: 7, billNo: "WB-007", date: "2026-03-07", user: "Nurse Saranya",
        total: 465.00, disc: 0.00, pay: 465.00, paid: 465.00, bal: 0.00,
        items: [
          { slNo: 1, medName: "Pantoprazole 40mg",    batchNo: "PZ-008", expDate: "09/2026", units: 20, mrp: 9.00,   total: 180.00 },
          { slNo: 2, medName: "Ondansetron 4mg Inj.", batchNo: "ON-009", expDate: "07/2026", units: 5,  mrp: 18.50,  total: 92.50  },
          { slNo: 3, medName: "Amoxicillin 250mg",    batchNo: "B-045",  expDate: "06/2026", units: 22, mrp: 8.50,   total: 187.00 },
          { slNo: 4, medName: "Dolo 650mg",            batchNo: "D-012",  expDate: "02/2027", units: 2,  mrp: 2.75,   total: 5.50   },
        ],
      },
    ],
  },
  {
    id: 4,
    wardName: "Maternity Ward",
    bills: [
      {
        id: 8, billNo: "WB-008", date: "2026-03-08", user: "Nurse Deepa",
        total: 1100.00, disc: 55.00, pay: 1045.00, paid: 1045.00, bal: 0.00,
        items: [
          { slNo: 1, medName: "Ceftriaxone 1g Inj.",   batchNo: "CF-022", expDate: "04/2026", units: 4,  mrp: 85.00,  total: 340.00 },
          { slNo: 2, medName: "Metronidazole 400mg",   batchNo: "MZ-003", expDate: "08/2026", units: 40, mrp: 3.50,   total: 140.00 },
          { slNo: 3, medName: "Atorvastatin 10mg",     batchNo: "AT-018", expDate: "11/2026", units: 30, mrp: 12.00,  total: 360.00 },
          { slNo: 4, medName: "Ibuprofen 400mg",       batchNo: "IB-005", expDate: "05/2027", units: 20, mrp: 3.00,   total: 60.00  },
          { slNo: 5, medName: "Amlodipine 5mg",        batchNo: "AM-031", expDate: "08/2026", units: 42, mrp: 4.75,   total: 199.50 },
        ],
      },
    ],
  },
];

const WARD_OPTIONS = WARDS.map((w) => ({ id: w.id, name: w.wardName }));
// ─────────────────────────────────────────────────────────────────────────────

export default function PhWardWiseBillRegister() {
  const [fromDate,  setFromDate]  = useState<string>("2026-03-01");
  const [toDate,    setToDate]    = useState<string>(today());
  const [wardId,    setWardId]    = useState<number>(0);
  const [submitted, setSubmitted] = useState<boolean>(false);

  // Ward bills modal
  const [showBillsModal,  setShowBillsModal]  = useState(false);
  const [activeWard,      setActiveWard]      = useState<WardData | null>(null);

  // Bill items modal
  const [showItemsModal,  setShowItemsModal]  = useState(false);
  const [selectedBill,    setSelectedBill]    = useState<WardBill | null>(null);

  const selectedWardData = useMemo(
    () => WARDS.find((w) => w.id === wardId) ?? null,
    [wardId]
  );

  // Bills filtered by date range for the active ward
  const filteredBills = useMemo(() => {
    if (!activeWard) return [];
    return activeWard.bills.filter((b) => {
      return b.date >= fromDate && b.date <= toDate;
    });
  }, [activeWard, fromDate, toDate]);

  const billTotals = useMemo(
    () =>
      filteredBills.reduce(
        (acc, b) => ({
          total: acc.total + b.total,
          disc:  acc.disc  + b.disc,
          pay:   acc.pay   + b.pay,
          paid:  acc.paid  + b.paid,
          bal:   acc.bal   + b.bal,
        }),
        { total: 0, disc: 0, pay: 0, paid: 0, bal: 0 }
      ),
    [filteredBills]
  );

  // KPI stats across all wards for date range
  const allFilteredBills = useMemo(
    () =>
      WARDS.flatMap((w) =>
        w.bills.filter((b) => b.date >= fromDate && b.date <= toDate)
      ),
    [fromDate, toDate]
  );

  const stats = useMemo(() => ({
    totalBills:  allFilteredBills.length,
    totalAmount: allFilteredBills.reduce((s, b) => s + b.total, 0),
    totalPaid:   allFilteredBills.reduce((s, b) => s + b.paid,  0),
    totalBal:    allFilteredBills.reduce((s, b) => s + b.bal,   0),
  }), [allFilteredBills]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromDate || !toDate) {
      showValidationError("Please select both From Date and To Date.");
      return;
    }
    if (fromDate > toDate) {
      showValidationError("From Date cannot be after To Date.");
      return;
    }
    if (wardId === 0) {
      showValidationError("Please select a Ward / Department.");
      return;
    }
    setSubmitted(true);
    const ward = WARDS.find((w) => w.id === wardId) ?? null;
    setActiveWard(ward);
    setShowBillsModal(true);
  };

  const handleReset = () => {
    setFromDate("2026-03-01");
    setToDate(today());
    setWardId(0);
    setSubmitted(false);
    setActiveWard(null);
  };

  const handleBillClick = (bill: WardBill) => {
    setSelectedBill(bill);
    setShowBillsModal(false);
    setShowItemsModal(true);
  };

  const handleItemsBack = () => {
    setShowItemsModal(false);
    setShowBillsModal(true);
  };

  const handleExport = () => {
    if (!activeWard || filteredBills.length === 0) return;
    const data = filteredBills.map((b, i) => ({
      "Sl. No":    i + 1,
      "Bill No":   b.billNo,
      "Date":      b.date,
      "User":      b.user,
      "Total":     fmtAmt(b.total),
      "Disc":      fmtAmt(b.disc),
      "Pay":       fmtAmt(b.pay),
      "Paid":      fmtAmt(b.paid),
      "Balance":   fmtAmt(b.bal),
    }));
    exportToExcel(
      data,
      `Ward_Bill_Register_${activeWard.wardName}_${formatReportDate(new Date(), "DD-MM-YYYY")}`,
      `Ward Bill Register`
    );
  };

  return (
    <React.Fragment>
      <Container fluid className="px-4 py-3">
        <ReportHeader
          title="Ward Wise Medicine Collection Register"
          subtitle={
            submitted && activeWard
              ? `${activeWard.wardName} — ${fromDate} to ${toDate}`
              : "Select date range and ward, then click Submit"
          }
          onPrint={printReport}
          onExport={handleExport}
          onSearch={() => {}}
          showSearch={false}
          showSort={false}
          showPrint={submitted}
          showExport={submitted}
        />

        {/* Filter Card */}
        <Card className="mb-4 shadow-sm no-print">
          <Card.Body>
            <Form onSubmit={handleSubmit}>
              <Row className="g-3 align-items-end">
                <Form.Group as={Col} md={3} controlId="fromDate">
                  <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>
                    From Date
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </Form.Group>

                <Form.Group as={Col} md={3} controlId="toDate">
                  <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>
                    To Date
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </Form.Group>

                <Form.Group as={Col} md={3} controlId="ward">
                  <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>
                    Department / Ward
                  </Form.Label>
                  <Form.Select
                    value={wardId}
                    onChange={(e) => setWardId(Number(e.target.value))}
                  >
                    <option value={0}>Select Ward</option>
                    {WARD_OPTIONS.map((w) => (
                      <option key={w.id} value={w.id}>
                        {w.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group as={Col} md={3} className="d-flex gap-2 align-items-end">
                  <Button type="submit" variant="primary" className="w-50">
                    Submit
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-50"
                    onClick={handleReset}
                  >
                    Reset
                  </Button>
                </Form.Group>
              </Row>
            </Form>
          </Card.Body>
        </Card>

        {/* KPI Cards (summary across all wards in date range) */}
        <Row className="mb-4">
          <Col md={3}>
            <ReportKPICard
              label="Total Bills"
              value={stats.totalBills}
              variant="primary"
            />
          </Col>
          <Col md={3}>
            <ReportKPICard
              label="Total Amount"
              value={`₹ ${fmtAmt(stats.totalAmount)}`}
              variant="info"
            />
          </Col>
          <Col md={3}>
            <ReportKPICard
              label="Total Paid"
              value={`₹ ${fmtAmt(stats.totalPaid)}`}
              variant="success"
            />
          </Col>
          <Col md={3}>
            <ReportKPICard
              label="Total Balance"
              value={`₹ ${fmtAmt(stats.totalBal)}`}
              variant="warning"
            />
          </Col>
        </Row>

        {/* Ward Summary Table */}
        <Card className="report-card">
          <div
            style={{
              padding: "0.6rem 1rem",
              borderBottom: "1px solid #dee2e6",
              fontSize: "var(--font-size-sm)",
              fontWeight: "var(--font-weight-semibold)",
            }}
          >
            Ward Overview — {fromDate} to {toDate}
            <span className="text-muted ms-2" style={{ fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-normal)" }}>
              Click a ward row to view its bills
            </span>
          </div>
          <div style={{ overflowX: "auto" }}>
            <Table bordered hover size="sm" className="mb-0">
              <thead className="table-dark">
                <tr>
                  <th className="text-center" style={{ width: "5%"  }}>Sl. No</th>
                  <th                         style={{ width: "35%" }}>Ward / Department</th>
                  <th className="text-center" style={{ width: "10%" }}>Bills</th>
                  <th className="text-end"    style={{ width: "13%" }}>Total Amt</th>
                  <th className="text-end"    style={{ width: "12%" }}>Discount</th>
                  <th className="text-end"    style={{ width: "12%" }}>Paid</th>
                  <th className="text-end"    style={{ width: "13%" }}>Balance</th>
                </tr>
              </thead>
              <tbody>
                {WARDS.map((ward, idx) => {
                  const wBills = ward.bills.filter(
                    (b) => b.date >= fromDate && b.date <= toDate
                  );
                  const wTotal = wBills.reduce((s, b) => s + b.total, 0);
                  const wDisc  = wBills.reduce((s, b) => s + b.disc,  0);
                  const wPaid  = wBills.reduce((s, b) => s + b.paid,  0);
                  const wBal   = wBills.reduce((s, b) => s + b.bal,   0);
                  return (
                    <tr
                      key={ward.id}
                      style={{
                        cursor: wBills.length > 0 ? "pointer" : "default",
                        background: idx % 2 === 0 ? "#fdfdfd" : "#f5f5f5",
                        opacity: wBills.length === 0 ? 0.45 : 1,
                      }}
                      onClick={() => {
                        if (wBills.length > 0) {
                          setActiveWard(ward);
                          setFromDate(fromDate);
                          setToDate(toDate);
                          setShowBillsModal(true);
                        }
                      }}
                    >
                      <td className="text-center">{idx + 1}</td>
                      <td>
                        {wBills.length > 0 ? (
                          <span
                            style={{
                              color: "#0d6efd",
                              textDecoration: "underline",
                              fontWeight: "var(--font-weight-semibold)",
                            }}
                          >
                            {ward.wardName}
                          </span>
                        ) : (
                          ward.wardName
                        )}
                      </td>
                      <td className="text-center">
                        {wBills.length > 0 ? (
                          <span
                            style={{
                              display: "inline-block",
                              padding: "1px 8px",
                              borderRadius: "10px",
                              background: "#cfe2ff",
                              color: "#084298",
                              fontSize: "var(--font-size-xs)",
                              fontWeight: "var(--font-weight-semibold)",
                            }}
                          >
                            {wBills.length}
                          </span>
                        ) : (
                          <span className="text-muted" style={{ fontSize: "var(--font-size-xs)" }}>—</span>
                        )}
                      </td>
                      <td className="text-end pe-3">{wBills.length > 0 ? fmtAmt(wTotal) : "—"}</td>
                      <td className="text-end pe-3">{wBills.length > 0 ? fmtAmt(wDisc)  : "—"}</td>
                      <td className="text-end pe-3">{wBills.length > 0 ? fmtAmt(wPaid)  : "—"}</td>
                      <td
                        className="text-end pe-3"
                        style={{ color: wBal > 0 ? "#dc3545" : "inherit" }}
                      >
                        {wBills.length > 0 ? fmtAmt(wBal) : "—"}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </Table>
          </div>
        </Card>
      </Container>

      {/* ── Ward Bill List Modal ─────────────────────────────────────────────── */}
      <Modal
        show={showBillsModal}
        onHide={() => setShowBillsModal(false)}
        size="xl"
        centered
      >
        <Modal.Header closeButton style={{ borderBottom: "2px solid #dee2e6" }}>
          <Modal.Title
            style={{
              fontSize: "var(--font-size-lg)",
              fontWeight: "var(--font-weight-semibold)",
            }}
          >
            Ward Wise Medicine Usage Details in{" "}
            <span style={{ color: "#9c27b0" }}>{activeWard?.wardName}</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: "1.25rem" }}>
          <Table bordered size="sm" className="mb-0">
            <thead className="table-dark">
              <tr>
                <th className="text-center" style={{ width: "5%"  }}>Sl. No</th>
                <th className="text-center" style={{ width: "11%" }}>Date</th>
                <th className="text-center" style={{ width: "14%" }}>Bill No</th>
                <th className="text-center" style={{ width: "14%" }}>User</th>
                <th className="text-end"    style={{ width: "11%" }}>Total</th>
                <th className="text-end"    style={{ width: "11%" }}>Disc</th>
                <th className="text-end"    style={{ width: "11%" }}>Pay</th>
                <th className="text-end"    style={{ width: "11%" }}>Paid</th>
                <th className="text-end"    style={{ width: "12%" }}>Bal</th>
              </tr>
            </thead>
            <tbody>
              {filteredBills.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-4 text-muted">
                    No bills found for this ward in the selected date range.
                  </td>
                </tr>
              ) : (
                filteredBills.map((bill, idx) => (
                  <tr
                    key={bill.id}
                    style={{ background: idx % 2 === 0 ? "#fdfdfd" : "#f5f5f5" }}
                  >
                    <td className="text-center">{idx + 1}</td>
                    <td className="text-center">{bill.date}</td>
                    <td className="text-center">
                      <span
                        style={{
                          color: "#9c27b0",
                          cursor: "pointer",
                          textDecoration: "underline",
                          fontWeight: "var(--font-weight-semibold)",
                        }}
                        onClick={() => handleBillClick(bill)}
                      >
                        {bill.billNo}
                      </span>
                    </td>
                    <td className="text-center">{bill.user}</td>
                    <td className="text-end pe-3">{fmtAmt(bill.total)}</td>
                    <td className="text-end pe-3">{fmtAmt(bill.disc)}</td>
                    <td className="text-end pe-3">{fmtAmt(bill.pay)}</td>
                    <td className="text-end pe-3">{fmtAmt(bill.paid)}</td>
                    <td
                      className="text-end pe-3"
                      style={{ color: bill.bal > 0 ? "#dc3545" : "inherit" }}
                    >
                      {fmtAmt(bill.bal)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
            {filteredBills.length > 0 && (
              <tfoot>
                <tr
                  style={{
                    background: "#fff9c4",
                    fontWeight: "var(--font-weight-bold)",
                    fontSize: "var(--font-size-sm)",
                  }}
                >
                  <td colSpan={4} className="text-center">
                    Total Amount
                  </td>
                  <td className="text-end pe-3">{fmtAmt(billTotals.total)}</td>
                  <td className="text-end pe-3">{fmtAmt(billTotals.disc)}</td>
                  <td className="text-end pe-3">{fmtAmt(billTotals.pay)}</td>
                  <td className="text-end pe-3">{fmtAmt(billTotals.paid)}</td>
                  <td
                    className="text-end pe-3"
                    style={{ color: billTotals.bal > 0 ? "#dc3545" : "inherit" }}
                  >
                    {fmtAmt(billTotals.bal)}
                  </td>
                </tr>
              </tfoot>
            )}
          </Table>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowBillsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ── Bill Items Modal ─────────────────────────────────────────────────── */}
      <Modal
        show={showItemsModal}
        onHide={() => setShowItemsModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton style={{ borderBottom: "2px solid #dee2e6" }}>
          <Modal.Title
            style={{
              fontSize: "var(--font-size-lg)",
              fontWeight: "var(--font-weight-semibold)",
            }}
          >
            Used Medicine Details — Bill No{" "}
            <span style={{ color: "#9c27b0" }}>{selectedBill?.billNo}</span>
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
                  <Col md={4}>
                    <span style={{ fontSize: "var(--font-size-sm)" }}>Ward :&nbsp;</span>
                    <span style={{ fontWeight: "var(--font-weight-semibold)", color: "#9c27b0" }}>
                      {activeWard?.wardName}
                    </span>
                  </Col>
                  <Col md={3}>
                    <span style={{ fontSize: "var(--font-size-sm)" }}>Date :&nbsp;</span>
                    <span style={{ fontWeight: "var(--font-weight-medium)" }}>
                      {selectedBill.date}
                    </span>
                  </Col>
                  <Col md={5}>
                    <span style={{ fontSize: "var(--font-size-sm)" }}>User :&nbsp;</span>
                    <span style={{ fontWeight: "var(--font-weight-medium)" }}>
                      {selectedBill.user}
                    </span>
                  </Col>
                </Row>
              </div>

              {/* Items table */}
              <Table bordered size="sm" className="mb-0">
                <thead className="table-dark">
                  <tr>
                    <th className="text-center" style={{ width: "6%"  }}>Sl. No</th>
                    <th                         style={{ width: "34%" }}>Med. Name</th>
                    <th className="text-center" style={{ width: "13%" }}>Batch No</th>
                    <th className="text-center" style={{ width: "11%" }}>Exp. Date</th>
                    <th className="text-end"    style={{ width: "10%" }}>Units</th>
                    <th className="text-end"    style={{ width: "10%" }}>M.R.P</th>
                    <th className="text-end"    style={{ width: "16%" }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedBill.items.map((item) => (
                    <tr key={item.slNo}>
                      <td className="text-center">{item.slNo}</td>
                      <td>&nbsp;&nbsp;&nbsp;{item.medName}</td>
                      <td className="text-center">{item.batchNo}</td>
                      <td className="text-center">{item.expDate}</td>
                      <td className="text-end pe-3">{fmtAmt(item.units)}</td>
                      <td className="text-end pe-3">{fmtAmt(item.mrp)}</td>
                      <td className="text-end pe-3">{fmtAmt(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr
                    style={{
                      background: "#e8f5e9",
                      fontWeight: "var(--font-weight-semibold)",
                      fontSize: "var(--font-size-sm)",
                    }}
                  >
                    <td colSpan={6} className="text-center" style={{ color: "#198754" }}>
                      Discount Amount
                    </td>
                    <td className="text-end pe-3" style={{ color: "#198754" }}>
                      {fmtAmt(selectedBill.disc)}
                    </td>
                  </tr>
                  <tr
                    style={{
                      background: "#fff9c4",
                      fontWeight: "var(--font-weight-semibold)",
                      fontSize: "var(--font-size-sm)",
                    }}
                  >
                    <td colSpan={6} className="text-center" style={{ color: "#856404" }}>
                      Paid Amount
                    </td>
                    <td className="text-end pe-3" style={{ color: "#856404" }}>
                      {fmtAmt(selectedBill.paid)}
                    </td>
                  </tr>
                  <tr
                    style={{
                      background: selectedBill.bal > 0 ? "#f8d7da" : "#f8f9fa",
                      fontWeight: "var(--font-weight-semibold)",
                      fontSize: "var(--font-size-sm)",
                    }}
                  >
                    <td
                      colSpan={6}
                      className="text-center"
                      style={{ color: selectedBill.bal > 0 ? "#9c27b0" : "#6c757d" }}
                    >
                      Balance Amount
                    </td>
                    <td
                      className="text-end pe-3"
                      style={{ color: selectedBill.bal > 0 ? "#9c27b0" : "#6c757d" }}
                    >
                      {fmtAmt(selectedBill.bal)}
                    </td>
                  </tr>
                </tfoot>
              </Table>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="outline-secondary" onClick={handleItemsBack}>
            ← Back
          </Button>
          <Button variant="secondary" onClick={() => setShowItemsModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </React.Fragment>
  );
}
