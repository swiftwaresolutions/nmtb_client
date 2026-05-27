import React, { useState } from "react";
import { Container, Card, Form, Button, Row, Col, Table } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPrint, faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import "../../../medical-records/styles/reportStyles.css";

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface PatientInfo {
  opNo: string;
  name: string;
  sex: string;
  age: string;
  dateFrom: string;
  dateTo: string;
}

interface DuplicateBillRow {
  receiptNo: string;
  billDisplay: string;
  amount: number;
  finalAmount: number;
}

// ─── Dummy Data ───────────────────────────────────────────────────────────────

const dummyPatient: PatientInfo = {
  opNo: "514488",
  name: "K.KIRUTHANYA",
  sex: "Female",
  age: "2Yrs 4 Months",
  dateFrom: "01/03/2026",
  dateTo: "07/03/2026",
};

const dummyBills: DuplicateBillRow[] = [
  { receiptNo: "RC10045", billDisplay: "OP Bill", amount: 500.0, finalAmount: 500.0 },
  { receiptNo: "RC10046", billDisplay: "Lab Bill", amount: 350.0, finalAmount: 300.0 },
  { receiptNo: "RC10047", billDisplay: "Pharmacy Bill", amount: 780.0, finalAmount: 780.0 },
];

// ─── Style helpers ────────────────────────────────────────────────────────────

const thStyle: React.CSSProperties = {
  background: "var(--color-table-header, #f1f5f9)",
  fontWeight: "var(--font-weight-semibold)" as any,
  whiteSpace: "nowrap" as any,
};

const totalRowStyle: React.CSSProperties = {
  fontWeight: "var(--font-weight-semibold)" as any,
  background: "var(--color-table-header, #f1f5f9)",
};

const infoLabelStyle: React.CSSProperties = {
  fontWeight: "var(--font-weight-semibold)" as any,
  color: "var(--color-primary, #0d6efd)",
  paddingRight: "0.5rem",
  whiteSpace: "nowrap" as any,
};

const infoValueStyle: React.CSSProperties = {
  paddingRight: "2rem",
};

// ─── Component ────────────────────────────────────────────────────────────────

const AllDuplicateBills: React.FC = () => {
  const navigate = useNavigate();
  const today = new Date().toISOString().split("T")[0];

  const [opNo, setOpNo] = useState(dummyPatient.opNo);
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(true);
  const [patient, setPatient] = useState<PatientInfo | null>(dummyPatient);
  const [tableData, setTableData] = useState<DuplicateBillRow[]>(dummyBills);

  const totalAmount      = tableData.reduce((s, r) => s + r.amount, 0);
  const totalFinalAmount = tableData.reduce((s, r) => s + r.finalAmount, 0);
  const discount         = totalAmount - totalFinalAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // TODO: Replace with actual API call using opNo, fromDate, toDate
      setPatient(dummyPatient);
      setTableData(dummyBills);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    setSubmitted(false);
    setPatient(null);
    setTableData([]);
    setOpNo("");
    setFromDate(today);
    setToDate(today);
  };

  const fmtDisplay = (iso: string) => {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
  };

  return (
    <Container fluid className="p-3">

      {/* ── Filter Section ── */}
      {!submitted && (
        <Card className="mb-3 shadow-sm">
          <Card.Header
            style={{ background: "var(--color-primary, #0d6efd)", color: "#fff",
              fontWeight: "var(--font-weight-semibold)" as any,
              fontSize: "var(--font-size-md)" as any }}
          >
            All Duplicate Bills
          </Card.Header>
          <Card.Body>
            <Form onSubmit={handleSubmit}>
              <Row className="g-3 align-items-end">
                <Col md={3}>
                  <Form.Group>
                    <Form.Label style={{ fontWeight: "var(--font-weight-medium)" }}>
                      OP No
                    </Form.Label>
                    <Form.Control
                      type="text"
                      placeholder="Enter OP No"
                      value={opNo}
                      onChange={(e) => setOpNo(e.target.value)}
                      required
                    />
                  </Form.Group>
                </Col>
                <Col md={3}>
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
                <Col md={3}>
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
                <Col md={3} className="d-flex gap-2">
                  <Button type="submit" variant="primary" disabled={loading}>
                    {loading ? "Loading..." : "Submit"}
                  </Button>
                </Col>
              </Row>
            </Form>
          </Card.Body>
        </Card>
      )}

      {/* ── Result Section ── */}
      {submitted && patient && (
        <Card className="shadow-sm">
          {/* Page Header */}
          <Card.Header
            className="d-flex justify-content-between align-items-center"
            style={{ background: "var(--color-primary, #0d6efd)", color: "#fff" }}
          >
            <span style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--font-weight-semibold)" }}>
              All Duplicate Bills
            </span>
            <div className="d-flex gap-2 no-print">
              <Button
                variant="light"
                size="sm"
                className="d-flex align-items-center gap-1"
                onClick={() => window.print()}
              >
                <FontAwesomeIcon icon={faPrint} className="me-1" /> Print
              </Button>
              <Button
                variant="outline-light"
                size="sm"
                className="d-flex align-items-center gap-1"
                onClick={handleBack}
              >
                <FontAwesomeIcon icon={faArrowLeft} className="me-1" /> Back
              </Button>
            </div>
          </Card.Header>

          <Card.Body>
            {/* Patient Info Block */}
            <div
              className="mb-3 p-3"
              style={{
                border: "1px solid var(--color-border, #dee2e6)",
                borderRadius: "6px",
                background: "var(--color-bg-light, #f8f9fa)",
              }}
            >
              <table style={{ width: "100%", borderCollapse: "collapse" }}>
                <tbody>
                  <tr>
                    <td style={infoLabelStyle}>OP No</td>
                    <td style={infoValueStyle}>{patient.opNo}</td>
                    <td style={infoLabelStyle}>Name</td>
                    <td style={infoValueStyle}>{patient.name}</td>
                  </tr>
                  <tr>
                    <td style={{ ...infoLabelStyle, paddingTop: "0.5rem" }}>Sex</td>
                    <td style={{ ...infoValueStyle, paddingTop: "0.5rem" }}>{patient.sex}</td>
                    <td style={{ ...infoLabelStyle, paddingTop: "0.5rem" }}>Age</td>
                    <td style={{ ...infoValueStyle, paddingTop: "0.5rem" }}>{patient.age}</td>
                  </tr>
                  <tr>
                    <td style={{ ...infoLabelStyle, paddingTop: "0.5rem" }}>Date From</td>
                    <td style={{ ...infoValueStyle, paddingTop: "0.5rem" }}>{fmtDisplay(fromDate)}</td>
                    <td style={{ ...infoLabelStyle, paddingTop: "0.5rem" }}>Date To</td>
                    <td style={{ ...infoValueStyle, paddingTop: "0.5rem" }}>{fmtDisplay(toDate)}</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Bills Table */}
            <div style={{ overflowX: "auto" }}>
              <Table bordered hover className="table-hims mb-0">
                <thead>
                  <tr>
                    <th style={{ ...thStyle, width: "60px" }}>Sl. No</th>
                    <th style={thStyle}>Receipt No</th>
                    <th style={thStyle}>Bill Display</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>Amount</th>
                    <th style={{ ...thStyle, textAlign: "right" }}>Final Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {tableData.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center text-muted py-4">
                        No duplicate bills found for the given criteria.
                      </td>
                    </tr>
                  ) : (
                    tableData.map((row, idx) => (
                      <tr key={idx}>
                        <td className="text-center">{idx + 1}</td>
                        <td>{row.receiptNo}</td>
                        <td>{row.billDisplay}</td>
                        <td className="text-end">{row.amount.toFixed(2)}</td>
                        <td className="text-end">{row.finalAmount.toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </Card.Body>

          {/* Footer Totals */}
          <Card.Footer className="py-3">
            <div className="d-flex justify-content-end">
              <table style={{ minWidth: "280px" }}>
                <tbody>
                  <tr>
                    <td style={{ ...infoLabelStyle, fontSize: "var(--font-size-md)" as any }}>
                      TOTAL :
                    </td>
                    <td style={{ textAlign: "right", fontWeight: "var(--font-weight-semibold)" as any,
                      fontSize: "var(--font-size-md)" as any, minWidth: "100px" }}>
                      {totalAmount.toFixed(1)}
                    </td>
                  </tr>
                  <tr>
                    <td style={{ ...infoLabelStyle, fontSize: "var(--font-size-md)" as any, paddingTop: "0.3rem" }}>
                      DISCOUNT :
                    </td>
                    <td style={{ textAlign: "right", fontWeight: "var(--font-weight-semibold)" as any,
                      fontSize: "var(--font-size-md)" as any, paddingTop: "0.3rem" }}>
                      {discount.toFixed(1)}
                    </td>
                  </tr>
                  <tr style={{ borderTop: "2px solid var(--color-border, #dee2e6)" }}>
                    <td style={{ ...infoLabelStyle, fontSize: "var(--font-size-md)" as any, paddingTop: "0.4rem",
                      color: "#dc3545" }}>
                      TOTAL :
                    </td>
                    <td style={{ textAlign: "right", fontWeight: "var(--font-weight-bold)" as any,
                      fontSize: "var(--font-size-md)" as any, paddingTop: "0.4rem", color: "#dc3545" }}>
                      {totalFinalAmount.toFixed(1)}
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

export default AllDuplicateBills;