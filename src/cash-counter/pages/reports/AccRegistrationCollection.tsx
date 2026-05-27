import React, { useState } from "react";
import { Container, Card, Form, Button, Row, Col, Table } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPrint } from "@fortawesome/free-solid-svg-icons";
import "../../../medical-records/styles/reportStyles.css";

// ── Interfaces ──────────────────────────────────────────────────────────────────
interface RegCollectionRow {
  slNo: number;
  opNo: string;
  name: string;
  age: number;
  sex: string;
  department: string;
  billNo: string;
  doctorName: string;
  fees: number;
  concession: number;
  paid: number;
  sw: number;
  qr: number;
}

interface RegDueRow {
  slNo: number;
  date: string;
  time: string;
  billNo: string;
  opNo: string;
  patientName: string;
  swipe: number;
  cash: number;
  trNo: string;
  user: string;
}

// ── Dummy data ──────────────────────────────────────────────────────────────────
const DUMMY_REG: RegCollectionRow[] = [
  { slNo: 1,  opNo: "OP1001", name: "Rajan Kumar",     age: 45, sex: "M", department: "General",    billNo: "RG001", doctorName: "Dr. Menon",    fees: 200, concession: 0,  paid: 200, sw: 200, qr: 0   },
  { slNo: 2,  opNo: "OP1002", name: "Meena Devi",      age: 32, sex: "F", department: "Cardiology", billNo: "RG002", doctorName: "Dr. Sharma",   fees: 300, concession: 50, paid: 250, sw: 0,   qr: 0   },
  { slNo: 3,  opNo: "OP1003", name: "Suresh Nair",     age: 60, sex: "M", department: "Ortho",      billNo: "RG003", doctorName: "Dr. Pillai",   fees: 150, concession: 0,  paid: 150, sw: 150, qr: 0   },
  { slNo: 4,  opNo: "OP1004", name: "Lakshmi Pillai",  age: 28, sex: "F", department: "Derma",      billNo: "RG004", doctorName: "Dr. Varma",    fees: 200, concession: 0,  paid: 200, sw: 0,   qr: 200 },
  { slNo: 5,  opNo: "OP1005", name: "Pradeep Menon",   age: 52, sex: "M", department: "ENT",        billNo: "RG005", doctorName: "Dr. Nair",     fees: 250, concession: 25, paid: 225, sw: 225, qr: 0   },
  { slNo: 6,  opNo: "OP1006", name: "Anitha Varma",    age: 37, sex: "F", department: "Gynaec",     billNo: "RG006", doctorName: "Dr. George",   fees: 300, concession: 0,  paid: 300, sw: 0,   qr: 0   },
  { slNo: 7,  opNo: "OP1007", name: "Gopinath R",      age: 41, sex: "M", department: "Neuro",      billNo: "RG007", doctorName: "Dr. Jose",     fees: 350, concession: 0,  paid: 350, sw: 350, qr: 0   },
  { slNo: 8,  opNo: "OP1008", name: "Bindhu S",        age: 25, sex: "F", department: "Paediatric", billNo: "RG008", doctorName: "Dr. Thomas",   fees: 200, concession: 0,  paid: 200, sw: 0,   qr: 200 },
  { slNo: 9,  opNo: "OP1009", name: "Vinod Thomas",    age: 55, sex: "M", department: "Urology",    billNo: "RG009", doctorName: "Dr. Kumar",    fees: 400, concession: 50, paid: 350, sw: 350, qr: 0   },
  { slNo: 10, opNo: "OP1010", name: "Seetha Krishnan", age: 48, sex: "F", department: "General",    billNo: "RG010", doctorName: "Dr. Menon",    fees: 200, concession: 0,  paid: 200, sw: 0,   qr: 0   },
];

const DUMMY_DUE: RegDueRow[] = [
  { slNo: 1, date: "12/03/2026", time: "09:30", billNo: "RD001", opNo: "OP2001", patientName: "Ravi Varma",   swipe: 500, cash: 0,   trNo: "TXN201", user: "Admin"  },
  { slNo: 2, date: "12/03/2026", time: "10:15", billNo: "RD002", opNo: "OP2002", patientName: "Sunitha P",    swipe: 0,   cash: 300, trNo: "",        user: "Staff1" },
  { slNo: 3, date: "12/03/2026", time: "11:00", billNo: "RD003", opNo: "OP2003", patientName: "Haridas K",    swipe: 750, cash: 0,   trNo: "TXN202", user: "Admin"  },
  { slNo: 4, date: "12/03/2026", time: "12:30", billNo: "RD004", opNo: "OP2004", patientName: "Nalini Menon", swipe: 0,   cash: 400, trNo: "",        user: "Staff2" },
  { slNo: 5, date: "12/03/2026", time: "14:00", billNo: "RD005", opNo: "OP2005", patientName: "Manoj Kumar",  swipe: 600, cash: 0,   trNo: "TXN203", user: "Admin"  },
];

// ── Component ───────────────────────────────────────────────────────────────────
const AccRegistrationCollection: React.FC = () => {
  const today = new Date().toISOString().split("T")[0];

  const [fromDate,   setFromDate]   = useState(today);
  const [toDate,     setToDate]     = useState(today);
  const [selectType, setSelectType] = useState("");
  const [pageLimit,  setPageLimit]  = useState("");
  const [loading,    setLoading]    = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const [regData,    setRegData]    = useState<RegCollectionRow[]>([]);
  const [dueData,    setDueData]    = useState<RegDueRow[]>([]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const limit = pageLimit ? parseInt(pageLimit, 10) : undefined;
      setRegData(limit ? DUMMY_REG.slice(0, limit) : DUMMY_REG);
      setDueData(limit ? DUMMY_DUE.slice(0, limit) : DUMMY_DUE);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFromDate(today);
    setToDate(today);
    setSelectType("");
    setPageLimit("");
    setRegData([]);
    setDueData([]);
    setSubmitted(false);
  };

  const handlePrint = () => window.print();

  // ── Totals ──────────────────────────────────────────────────────────────────
  const regTotalFees       = regData.reduce((s, r) => s + r.fees,       0);
  const regTotalConcession = regData.reduce((s, r) => s + r.concession, 0);
  const regTotalPaid       = regData.reduce((s, r) => s + r.paid,       0);
  const regTotalSw         = regData.reduce((s, r) => s + r.sw,         0);
  const regTotalQr         = regData.reduce((s, r) => s + r.qr,         0);

  const dueTotalSwipe = dueData.reduce((s, r) => s + r.swipe, 0);
  const dueTotalCash  = dueData.reduce((s, r) => s + r.cash,  0);

  const fmt = (n: number) => n.toFixed(2);

  return (
    <Container fluid className="p-3">

      {/* ── Filter Card ──────────────────────────────────────────────────────── */}
      <Card className="mb-3">
        <Card.Header className="bg-primary text-white">
          <h5 className="mb-0">Registration Collection Report</h5>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="g-3">
              <Col xs={12} md={3}>
                <Form.Group>
                  <Form.Label>Date From</Form.Label>
                  <Form.Control
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col xs={12} md={3}>
                <Form.Group>
                  <Form.Label>Date To</Form.Label>
                  <Form.Control
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col xs={12} md={3}>
                <Form.Group>
                  <Form.Label>Select Type</Form.Label>
                  <Form.Select
                    value={selectType}
                    onChange={(e) => setSelectType(e.target.value)}
                    required
                  >
                    <option value="">-- Select --</option>
                    <option value="ODD">ODD</option>
                    <option value="EVEN">EVEN</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col xs={12} md={3}>
                <Form.Group>
                  <Form.Label>Page Limit</Form.Label>
                  <Form.Control
                    type="number"
                    min={1}
                    placeholder="e.g. 50"
                    value={pageLimit}
                    onChange={(e) => setPageLimit(e.target.value)}
                  />
                </Form.Group>
              </Col>
            </Row>
            <Row className="mt-3">
              <Col xs={12} className="d-flex gap-2">
                <Button type="submit" variant="primary" disabled={loading}>
                  {loading ? "Loading..." : "Show"}
                </Button>
                <Button type="button" variant="secondary" onClick={handleReset}>
                  Reset
                </Button>
                {submitted && (
                  <Button type="button" variant="outline-secondary" onClick={handlePrint}>
                    <FontAwesomeIcon icon={faPrint} className="me-1" />
                    Print
                  </Button>
                )}
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {submitted && (
        <>
          {/* ── Registration Collection ────────────────────────────────────── */}
          <Card className="mb-3">
            <Card.Header className="bg-secondary text-white">
              <h6 className="mb-0">Registration Collection</h6>
            </Card.Header>
            <Card.Body className="p-0">
              <Table bordered hover responsive size="sm" className="mb-0">
                <thead className="table-dark">
                  <tr>
                    <th rowSpan={2} className="align-middle text-center">No</th>
                    <th rowSpan={2} className="align-middle text-center">OP No</th>
                    <th rowSpan={2} className="align-middle text-center">Name</th>
                    <th rowSpan={2} className="align-middle text-center">Age</th>
                    <th rowSpan={2} className="align-middle text-center">Sex</th>
                    <th rowSpan={2} className="align-middle text-center">Department</th>
                    <th rowSpan={2} className="align-middle text-center">Bill No</th>
                    <th rowSpan={2} className="align-middle text-center">Doctor Name</th>
                    <th rowSpan={2} className="align-middle text-center">Fees</th>
                    <th rowSpan={2} className="align-middle text-center">Concession</th>
                    <th rowSpan={2} className="align-middle text-center">Paid</th>
                    <th rowSpan={2} className="align-middle text-center">Sw</th>
                    <th rowSpan={2} className="align-middle text-center">QR</th>
                  </tr>
                  <tr />
                </thead>
                <tbody>
                  {regData.length === 0 ? (
                    <tr>
                      <td colSpan={13} className="text-center text-muted py-3">
                        No records found.
                      </td>
                    </tr>
                  ) : (
                    regData.map((row) => (
                      <tr key={row.slNo}>
                        <td>{row.slNo}</td>
                        <td>{row.opNo}</td>
                        <td>{row.name}</td>
                        <td>{row.age}</td>
                        <td>{row.sex}</td>
                        <td>{row.department}</td>
                        <td>{row.billNo}</td>
                        <td>{row.doctorName}</td>
                        <td className="text-end">{fmt(row.fees)}</td>
                        <td className="text-end">{fmt(row.concession)}</td>
                        <td className="text-end">{fmt(row.paid)}</td>
                        <td className="text-end">{fmt(row.sw)}</td>
                        <td className="text-end">{fmt(row.qr)}</td>
                      </tr>
                    ))
                  )}
                  {regData.length > 0 && (
                    <tr className="fw-bold table-secondary">
                      <td colSpan={8} className="text-end">Total</td>
                      <td className="text-end">{fmt(regTotalFees)}</td>
                      <td className="text-end">{fmt(regTotalConcession)}</td>
                      <td className="text-end">{fmt(regTotalPaid)}</td>
                      <td className="text-end">{fmt(regTotalSw)}</td>
                      <td className="text-end">{fmt(regTotalQr)}</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

          {/* ── Due Collection Details ─────────────────────────────────────── */}
          <Card className="mb-3">
            <Card.Header className="bg-secondary text-white">
              <h6 className="mb-0">Due Collection Details</h6>
            </Card.Header>
            <Card.Body className="p-0">
              <Table bordered hover responsive size="sm" className="mb-0">
                <thead className="table-dark">
                  <tr>
                    <th rowSpan={2} className="align-middle text-center">Date</th>
                    <th rowSpan={2} className="align-middle text-center">Time</th>
                    <th rowSpan={2} className="align-middle text-center">Bill No</th>
                    <th rowSpan={2} className="align-middle text-center">OP No</th>
                    <th rowSpan={2} className="align-middle text-center">Patient Name</th>
                    <th colSpan={2} className="text-center">Paid Amount</th>
                    <th rowSpan={2} className="align-middle text-center">Tr.No</th>
                    <th rowSpan={2} className="align-middle text-center">User</th>
                  </tr>
                  <tr>
                    <th className="text-center">Swipe</th>
                    <th className="text-center">Cash</th>
                  </tr>
                </thead>
                <tbody>
                  {dueData.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center text-muted py-3">
                        No records found.
                      </td>
                    </tr>
                  ) : (
                    dueData.map((row) => (
                      <tr key={row.slNo}>
                        <td>{row.date}</td>
                        <td>{row.time}</td>
                        <td>{row.billNo}</td>
                        <td>{row.opNo}</td>
                        <td>{row.patientName}</td>
                        <td className="text-end">{fmt(row.swipe)}</td>
                        <td className="text-end">{fmt(row.cash)}</td>
                        <td>{row.trNo}</td>
                        <td>{row.user}</td>
                      </tr>
                    ))
                  )}
                  {dueData.length > 0 && (
                    <tr className="fw-bold table-secondary">
                      <td colSpan={5} className="text-end">Total</td>
                      <td className="text-end">{fmt(dueTotalSwipe)}</td>
                      <td className="text-end">{fmt(dueTotalCash)}</td>
                      <td colSpan={2} />
                    </tr>
                  )}
                </tbody>
              </Table>
            </Card.Body>
          </Card>

        </>
      )}

    </Container>
  );
};

export default AccRegistrationCollection;
