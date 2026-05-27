import React, { useState } from "react";
import { Container, Card, Form, Button, Row, Col, Table } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPrint } from "@fortawesome/free-solid-svg-icons";
import "../../../medical-records/styles/reportStyles.css";

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface CollectionRow {
  patientName: string;
  opNo: string;
  receiptNo: string;
  date: string;
  time: string;
  total: number;
  discount: number;
  pay: number;
  balance: number;
  paid: number;
  user: string;
}

interface IPBillRow extends CollectionRow {
  ipNo: string;
}

interface AdvanceRow {
  patientName: string;
  opNo: string;
  ipNo: string;
  receiptNo: string;
  date: string;
  time: string;
  amount: number;
  user: string;
}

// ─── Dummy Data ───────────────────────────────────────────────────────────────

const dummyInvestigation: CollectionRow[] = [
  { patientName: "MR. RAJESH KUMAR", opNo: "321873", receiptNo: "RC1001", date: "24/02/2026", time: "09:15:00", total: 1500, discount: 0, pay: 1500, balance: 0, paid: 1500, user: "CASHIER1" },
  { patientName: "MRS. PRIYA DEVI", opNo: "514488", receiptNo: "RC1002", date: "24/02/2026", time: "10:30:00", total: 2200, discount: 200, pay: 2000, balance: 0, paid: 2000, user: "CASHIER1" },
  { patientName: "MR. SURESH", opNo: "570829", receiptNo: "RC1003", date: "24/02/2026", time: "11:45:00", total: 800, discount: 0, pay: 800, balance: 0, paid: 800, user: "CASHIER2" },
];

const dummyLab: CollectionRow[] = [
  { patientName: "MRS. KAVITHA", opNo: "265587", receiptNo: "RC2001", date: "24/02/2026", time: "08:30:00", total: 600, discount: 0, pay: 600, balance: 0, paid: 600, user: "CASHIER1" },
  { patientName: "MR. ANANDAN", opNo: "293605", receiptNo: "RC2002", date: "24/02/2026", time: "09:00:00", total: 1200, discount: 100, pay: 1100, balance: 0, paid: 1100, user: "CASHIER2" },
  { patientName: "MRS. SELVI", opNo: "293606", receiptNo: "RC2003", date: "24/02/2026", time: "10:00:00", total: 450, discount: 0, pay: 450, balance: 0, paid: 450, user: "CASHIER1" },
];

const dummyPharmacy: CollectionRow[] = [
  { patientName: "MR. KARTHICK", opNo: "570863", receiptNo: "RC3001", date: "24/02/2026", time: "09:50:00", total: 3200, discount: 0, pay: 3200, balance: 0, paid: 3200, user: "CASHIER1" },
  { patientName: "MRS. PONNUTHAI", opNo: "570872", receiptNo: "RC3002", date: "24/02/2026", time: "11:00:00", total: 780, discount: 0, pay: 780, balance: 0, paid: 780, user: "CASHIER2" },
  { patientName: "MR. NAGARAJAN", opNo: "502179", receiptNo: "RC3003", date: "24/02/2026", time: "14:20:00", total: 1560, discount: 60, pay: 1500, balance: 0, paid: 1500, user: "CASHIER1" },
];

const dummyIPBill: IPBillRow[] = [
  { patientName: "SR. JERALD", opNo: "341570", ipNo: "IP2025001", receiptNo: "RC4001", date: "24/02/2026", time: "10:00:00", total: 25371, discount: 0, pay: 25371, balance: 0, paid: 25371, user: "CASHIER1" },
  { patientName: "SR. AROCKIA MARY", opNo: "302152", ipNo: "IP2025002", receiptNo: "RC4002", date: "24/02/2026", time: "11:30:00", total: 18720, discount: 1000, pay: 17720, balance: 0, paid: 17720, user: "CASHIER2" },
  { patientName: "MRS. NAGAJOTHI", opNo: "453973", ipNo: "IP2025003", receiptNo: "RC4003", date: "24/02/2026", time: "14:00:00", total: 4305, discount: 0, pay: 4305, balance: 0, paid: 4305, user: "CASHIER1" },
];

const dummyAdvance: AdvanceRow[] = [
  { patientName: "FR. LEONARD", opNo: "463543", ipNo: "IP2025010", receiptNo: "ADV001", date: "24/02/2026", time: "08:00:00", amount: 5000, user: "CASHIER1" },
  { patientName: "MRS. PRUMALAKKAL", opNo: "545479", ipNo: "IP2025011", receiptNo: "ADV002", date: "24/02/2026", time: "09:00:00", amount: 3000, user: "CASHIER2" },
  { patientName: "SR. SIRON", opNo: "372540", ipNo: "IP2025012", receiptNo: "ADV003", date: "24/02/2026", time: "10:00:00", amount: 2000, user: "CASHIER1" },
];

const dummyPharmacyReturn: CollectionRow[] = [
  { patientName: "MR. RAJESH KUMAR", opNo: "321873", receiptNo: "RET001", date: "24/02/2026", time: "15:00:00", total: 500, discount: 0, pay: 500, balance: 0, paid: 500, user: "CASHIER1" },
  { patientName: "MRS. PRIYA", opNo: "514488", receiptNo: "RET002", date: "24/02/2026", time: "16:00:00", total: 300, discount: 0, pay: 300, balance: 0, paid: 300, user: "CASHIER2" },
];

const dummyInvestigationReturn: CollectionRow[] = [
  { patientName: "MR. SURESH", opNo: "570829", receiptNo: "IRET001", date: "24/02/2026", time: "13:00:00", total: 200, discount: 0, pay: 200, balance: 0, paid: 200, user: "CASHIER1" },
];

const dummyRegistration: CollectionRow[] = [
  { patientName: "MR. VIJAY", opNo: "600101", receiptNo: "REG001", date: "24/02/2026", time: "08:15:00", total: 150, discount: 0, pay: 150, balance: 0, paid: 150, user: "CASHIER1" },
  { patientName: "MRS. LAKSHMI", opNo: "600102", receiptNo: "REG002", date: "24/02/2026", time: "08:45:00", total: 150, discount: 0, pay: 150, balance: 0, paid: 150, user: "CASHIER1" },
];

const dummyIPReturn: CollectionRow[] = [
  { patientName: "SR. ELIZABETH", opNo: "407888", receiptNo: "IPRET001", date: "24/02/2026", time: "12:00:00", total: 1000, discount: 0, pay: 1000, balance: 0, paid: 1000, user: "CASHIER2" },
];

// ─── Style helpers ────────────────────────────────────────────────────────────

const sectionHeaderStyle: React.CSSProperties = {
  background: "var(--color-primary, #0d6efd)",
  color: "#fff",
  fontWeight: "var(--font-weight-semibold)" as any,
  fontSize: "var(--font-size-md)" as any,
  padding: "0.5rem 1rem",
  marginTop: "1rem",
};

const thStyle: React.CSSProperties = {
  background: "var(--color-table-header, #f1f5f9)",
  fontWeight: "var(--font-weight-semibold)" as any,
  whiteSpace: "nowrap" as any,
};

const totalRowStyle: React.CSSProperties = {
  fontWeight: "var(--font-weight-semibold)" as any,
  background: "var(--color-table-header, #f1f5f9)",
};

// ─── Render helpers ───────────────────────────────────────────────────────────

function renderCollectionTable(
  data: CollectionRow[],
  paidLabel: "Paid" | "Repaid"
) {
  const totals = data.reduce(
    (acc, r) => ({
      total: acc.total + r.total,
      discount: acc.discount + r.discount,
      pay: acc.pay + r.pay,
      balance: acc.balance + r.balance,
      paid: acc.paid + r.paid,
    }),
    { total: 0, discount: 0, pay: 0, balance: 0, paid: 0 }
  );

  return (
    <div style={{ overflowX: "auto" }}>
      <Table bordered hover className="table-hims mb-0" size="sm">
        <thead>
          <tr>
            <th style={{ ...thStyle, width: "50px" }}>S. No</th>
            <th style={thStyle}>Patient Name</th>
            <th style={thStyle}>OP No</th>
            <th style={thStyle}>Receipt No</th>
            <th style={thStyle}>Date</th>
            <th style={thStyle}>Time</th>
            <th style={{ ...thStyle, textAlign: "right" }}>Total</th>
            <th style={{ ...thStyle, textAlign: "right" }}>Discount</th>
            <th style={{ ...thStyle, textAlign: "right" }}>Pay</th>
            <th style={{ ...thStyle, textAlign: "right" }}>Balance</th>
            <th style={{ ...thStyle, textAlign: "right" }}>{paidLabel}</th>
            <th style={thStyle}>User</th>
          </tr>
        </thead>
        <tbody>
          {data.map((r, idx) => (
            <tr key={idx}>
              <td className="text-center">{idx + 1}</td>
              <td>{r.patientName}</td>
              <td className="text-center">{r.opNo}</td>
              <td className="text-center">{r.receiptNo}</td>
              <td className="text-center">{r.date}</td>
              <td className="text-center">{r.time}</td>
              <td className="text-end">{r.total.toFixed(2)}</td>
              <td className="text-end">{r.discount.toFixed(2)}</td>
              <td className="text-end">{r.pay.toFixed(2)}</td>
              <td className="text-end">{r.balance.toFixed(2)}</td>
              <td className="text-end">{r.paid.toFixed(2)}</td>
              <td className="text-center">{r.user}</td>
            </tr>
          ))}
          <tr style={totalRowStyle}>
            <td colSpan={6} className="text-end">Total :</td>
            <td className="text-end">{totals.total.toFixed(2)}</td>
            <td className="text-end">{totals.discount.toFixed(2)}</td>
            <td className="text-end">{totals.pay.toFixed(2)}</td>
            <td className="text-end">{totals.balance.toFixed(2)}</td>
            <td className="text-end">{totals.paid.toFixed(2)}</td>
            <td></td>
          </tr>
        </tbody>
      </Table>
    </div>
  );
}

function renderIPBillTable(data: IPBillRow[]) {
  const totals = data.reduce(
    (acc, r) => ({
      total: acc.total + r.total,
      discount: acc.discount + r.discount,
      pay: acc.pay + r.pay,
      balance: acc.balance + r.balance,
      paid: acc.paid + r.paid,
    }),
    { total: 0, discount: 0, pay: 0, balance: 0, paid: 0 }
  );

  return (
    <div style={{ overflowX: "auto" }}>
      <Table bordered hover className="table-hims mb-0" size="sm">
        <thead>
          <tr>
            <th style={{ ...thStyle, width: "50px" }}>S. No</th>
            <th style={thStyle}>Patient Name</th>
            <th style={thStyle}>OP No</th>
            <th style={thStyle}>Receipt No</th>
            <th style={thStyle}>IP No</th>
            <th style={thStyle}>Date</th>
            <th style={thStyle}>Time</th>
            <th style={{ ...thStyle, textAlign: "right" }}>Total</th>
            <th style={{ ...thStyle, textAlign: "right" }}>Discount</th>
            <th style={{ ...thStyle, textAlign: "right" }}>Pay</th>
            <th style={{ ...thStyle, textAlign: "right" }}>Balance</th>
            <th style={{ ...thStyle, textAlign: "right" }}>Paid</th>
            <th style={thStyle}>User</th>
          </tr>
        </thead>
        <tbody>
          {data.map((r, idx) => (
            <tr key={idx}>
              <td className="text-center">{idx + 1}</td>
              <td>{r.patientName}</td>
              <td className="text-center">{r.opNo}</td>
              <td className="text-center">{r.receiptNo}</td>
              <td className="text-center">{r.ipNo}</td>
              <td className="text-center">{r.date}</td>
              <td className="text-center">{r.time}</td>
              <td className="text-end">{r.total.toFixed(2)}</td>
              <td className="text-end">{r.discount.toFixed(2)}</td>
              <td className="text-end">{r.pay.toFixed(2)}</td>
              <td className="text-end">{r.balance.toFixed(2)}</td>
              <td className="text-end">{r.paid.toFixed(2)}</td>
              <td className="text-center">{r.user}</td>
            </tr>
          ))}
          <tr style={totalRowStyle}>
            <td colSpan={7} className="text-end">Total :</td>
            <td className="text-end">{totals.total.toFixed(2)}</td>
            <td className="text-end">{totals.discount.toFixed(2)}</td>
            <td className="text-end">{totals.pay.toFixed(2)}</td>
            <td className="text-end">{totals.balance.toFixed(2)}</td>
            <td className="text-end">{totals.paid.toFixed(2)}</td>
            <td></td>
          </tr>
        </tbody>
      </Table>
    </div>
  );
}

function renderAdvanceTable(data: AdvanceRow[]) {
  const totalAmount = data.reduce((sum, r) => sum + r.amount, 0);

  return (
    <div style={{ overflowX: "auto" }}>
      <Table bordered hover className="table-hims mb-0" size="sm">
        <thead>
          <tr>
            <th style={{ ...thStyle, width: "50px" }}>S. No</th>
            <th style={thStyle}>Patient Name</th>
            <th style={thStyle}>OP No</th>
            <th style={thStyle}>IP No</th>
            <th style={thStyle}>Receipt No</th>
            <th style={thStyle}>Date</th>
            <th style={thStyle}>Time</th>
            <th style={{ ...thStyle, textAlign: "right" }}>Amount</th>
            <th style={thStyle}>User</th>
          </tr>
        </thead>
        <tbody>
          {data.map((r, idx) => (
            <tr key={idx}>
              <td className="text-center">{idx + 1}</td>
              <td>{r.patientName}</td>
              <td className="text-center">{r.opNo}</td>
              <td className="text-center">{r.ipNo}</td>
              <td className="text-center">{r.receiptNo}</td>
              <td className="text-center">{r.date}</td>
              <td className="text-center">{r.time}</td>
              <td className="text-end">{r.amount.toFixed(2)}</td>
              <td className="text-center">{r.user}</td>
            </tr>
          ))}
          <tr style={totalRowStyle}>
            <td colSpan={7} className="text-end">Total :</td>
            <td className="text-end">{totalAmount.toFixed(2)}</td>
            <td></td>
          </tr>
        </tbody>
      </Table>
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

const TotalCollections: React.FC = () => {
  const today = new Date().toISOString().split("T")[0];

  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Section data (populated on submit – using dummy here)
  const [invData, setInvData] = useState<CollectionRow[]>([]);
  const [labData, setLabData] = useState<CollectionRow[]>([]);
  const [phData, setPhData] = useState<CollectionRow[]>([]);
  const [ipData, setIpData] = useState<IPBillRow[]>([]);
  const [advData, setAdvData] = useState<AdvanceRow[]>([]);
  const [phRetData, setPhRetData] = useState<CollectionRow[]>([]);
  const [invRetData, setInvRetData] = useState<CollectionRow[]>([]);
  const [regData, setRegData] = useState<CollectionRow[]>([]);
  const [ipRetData, setIpRetData] = useState<CollectionRow[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // TODO: Replace with actual API calls
      setInvData(dummyInvestigation);
      setLabData(dummyLab);
      setPhData(dummyPharmacy);
      setIpData(dummyIPBill);
      setAdvData(dummyAdvance);
      setPhRetData(dummyPharmacyReturn);
      setInvRetData(dummyInvestigationReturn);
      setRegData(dummyRegistration);
      setIpRetData(dummyIPReturn);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFromDate(today);
    setToDate(today);
    setInvData([]); setLabData([]); setPhData([]); setIpData([]);
    setAdvData([]); setPhRetData([]); setInvRetData([]); setRegData([]); setIpRetData([]);
    setSubmitted(false);
  };

  // Footer totals (matches JSP logic)
  const sumPaid = (rows: CollectionRow[]) => rows.reduce((s, r) => s + r.paid, 0);
  const sumAdv  = advData.reduce((s, r) => s + r.amount, 0);
  const sumReg  = regData.reduce((s, r) => s + r.paid, 0);

  const totalCollection  = sumPaid(invData) + sumPaid(labData) + sumPaid(phData) + sumPaid(ipData) + sumAdv + sumReg;
  const totalReturn      = sumPaid(phRetData) + sumPaid(invRetData);
  const finalCollection  = totalCollection - totalReturn;

  // Format display dates (dd-mm-yyyy)
  const fmtDisplay = (iso: string) => {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    return `${d}-${m}-${y}`;
  };

  return (
    <Container fluid className="p-3">
      {/* Filter Section */}
      <Card className="mb-3 shadow-sm no-print">
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="g-3 align-items-end">
              <Col md={4}>
                <Form.Group>
                  <Form.Label style={{ fontWeight: "var(--font-weight-medium)" }}>
                    From Date
                  </Form.Label>
                  <Form.Control type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label style={{ fontWeight: "var(--font-weight-medium)" }}>
                    To Date
                  </Form.Label>
                  <Form.Control type="date" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                </Form.Group>
              </Col>
              <Col md={4} className="d-flex gap-2">
                <Button type="submit" variant="primary" disabled={loading}>
                  {loading ? "Loading..." : "Submit"}
                </Button>
                <Button type="button" variant="outline-secondary" onClick={handleReset}>
                  Reset
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {/* Report */}
      {submitted && (
        <Card className="shadow-sm">
          {/* Page Header */}
          <Card.Header
            className="d-flex justify-content-between align-items-center"
            style={{ background: "var(--color-primary, #0d6efd)", color: "#fff" }}
          >
            <div>
              <span style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--font-weight-semibold)" }}>
                Total Collection
              </span>
              <span className="ms-3" style={{ fontSize: "var(--font-size-sm)", opacity: 0.85 }}>
                {fmtDisplay(fromDate)} &nbsp;–&nbsp; {fmtDisplay(toDate)}
              </span>
            </div>
            <Button
              variant="light"
              size="sm"
              className="no-print d-flex align-items-center gap-1"
              onClick={() => window.print()}
            >
              <FontAwesomeIcon icon={faPrint} className="me-1" /> Print
            </Button>
          </Card.Header>

          <Card.Body className="p-2">

            {/* 1. Investigation Collection */}
            {invData.length > 0 && (
              <>
                <div style={sectionHeaderStyle}>Investigation Collection</div>
                {renderCollectionTable(invData, "Paid")}
              </>
            )}

            {/* 2. Lab Collection */}
            {labData.length > 0 && (
              <>
                <div style={sectionHeaderStyle}>Lab Collection</div>
                {renderCollectionTable(labData, "Paid")}
              </>
            )}

            {/* 3. Pharmacy Collection */}
            {phData.length > 0 && (
              <>
                <div style={sectionHeaderStyle}>Pharmacy Collection</div>
                {renderCollectionTable(phData, "Paid")}
              </>
            )}

            {/* 4. IP Bill Collection */}
            {ipData.length > 0 && (
              <>
                <div style={sectionHeaderStyle}>IP Bill Collection</div>
                {renderIPBillTable(ipData)}
              </>
            )}

            {/* 5. Advance Collection */}
            {advData.length > 0 && (
              <>
                <div style={sectionHeaderStyle}>Advance Collection</div>
                {renderAdvanceTable(advData)}
              </>
            )}

            {/* 6. Pharmacy Return */}
            {phRetData.length > 0 && (
              <>
                <div style={sectionHeaderStyle}>Pharmacy Return</div>
                {renderCollectionTable(phRetData, "Repaid")}
              </>
            )}

            {/* 7. Investigation Return */}
            {invRetData.length > 0 && (
              <>
                <div style={sectionHeaderStyle}>Investigation Return</div>
                {renderCollectionTable(invRetData, "Repaid")}
              </>
            )}

            {/* 8. Registration Collection */}
            {regData.length > 0 && (
              <>
                <div style={sectionHeaderStyle}>Registration Collection</div>
                {renderCollectionTable(regData, "Paid")}
              </>
            )}

            {/* 9. IP Return */}
            {ipRetData.length > 0 && (
              <>
                <div style={sectionHeaderStyle}>IP Return</div>
                {renderCollectionTable(ipRetData, "Repaid")}
              </>
            )}

          </Card.Body>

          {/* Footer Summary */}
          <Card.Footer className="py-3">
            <div className="d-flex justify-content-end">
              <table style={{ minWidth: "320px" }}>
                <tbody>
                  <tr>
                    <td style={{ fontWeight: "var(--font-weight-semibold)", fontSize: "var(--font-size-md)", paddingRight: "1rem", color: "var(--color-primary, #0d6efd)" }}>
                      TOTAL COLLECTION :
                    </td>
                    <td style={{ fontWeight: "var(--font-weight-bold)", fontSize: "var(--font-size-md)", textAlign: "right", color: "#dc3545" }}>
                      {totalCollection.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ fontWeight: "var(--font-weight-semibold)", fontSize: "var(--font-size-md)", paddingRight: "1rem", color: "var(--color-primary, #0d6efd)" }}>
                      TOTAL RETURN :
                    </td>
                    <td style={{ fontWeight: "var(--font-weight-bold)", fontSize: "var(--font-size-md)", textAlign: "right", color: "#dc3545" }}>
                      {totalReturn.toFixed(2)}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ borderTop: "2px solid var(--color-border, #dee2e6)", fontWeight: "var(--font-weight-semibold)", fontSize: "var(--font-size-md)", paddingRight: "1rem", paddingTop: "0.4rem", color: "var(--color-primary, #0d6efd)" }}>
                      FINAL COLLECTION :
                    </td>
                    <td style={{ borderTop: "2px solid var(--color-border, #dee2e6)", fontWeight: "var(--font-weight-bold)", fontSize: "var(--font-size-md)", textAlign: "right", paddingTop: "0.4rem", color: "#dc3545" }}>
                      {finalCollection.toFixed(2)}
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </Card.Footer>
        </Card>
      )}
    </Container>
  );
};

export default TotalCollections;