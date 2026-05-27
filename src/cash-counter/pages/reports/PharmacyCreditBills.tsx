import React, { useState } from "react";
import { Container, Card, Form, Button, Row, Col } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPrint } from "@fortawesome/free-solid-svg-icons";
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

interface DiscountTotals {
  payable: number;
  discount: number;
  paid: number;
}

// ─── Dummy Data ───────────────────────────────────────────────────────────────

const dummyPatient: PatientInfo = {
  opNo: "514488",
  name: "K.KIRUTHANYA",
  sex: "Female",
  age: "2Yrs 4 Months",
  dateFrom: "1/3/2026",
  dateTo: "7/3/2026",
};

const dummyTotals: DiscountTotals = {
  payable: 0.0,
  discount: 0.0,
  paid: 0.0,
};

// ─── Style helpers ────────────────────────────────────────────────────────────

const labelStyle: React.CSSProperties = {
  fontWeight: "var(--font-weight-semibold)" as any,
  color: "var(--color-text-muted, #6c757d)",
  fontSize: "var(--font-size-sm)" as any,
};

const valueStyle: React.CSSProperties = {
  fontWeight: "var(--font-weight-medium)" as any,
  fontSize: "var(--font-size-sm)" as any,
};

const totalLabelStyle: React.CSSProperties = {
  fontWeight: "var(--font-weight-semibold)" as any,
  fontSize: "var(--font-size-md)" as any,
  minWidth: "220px",
  display: "inline-block",
};

// ─── Component ────────────────────────────────────────────────────────────────

const PharmacyCreditBills: React.FC = () => {
  const today = new Date().toISOString().split("T")[0];

  const [opNo, setOpNo] = useState("");
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [patient, setPatient] = useState<PatientInfo | null>(null);
  const [totals, setTotals] = useState<DiscountTotals | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      setPatient(dummyPatient);
      setTotals(dummyTotals);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setOpNo("");
    setFromDate(today);
    setToDate(today);
    setPatient(null);
    setTotals(null);
    setSubmitted(false);
  };

  const fmtDisplay = (iso: string) => {
    if (!iso) return "";
    const [y, m, d] = iso.split("-");
    return `${d}/${m}/${y}`;
  };

  return (
    <Container fluid className="p-3">
      {/* Filter Section */}
      <Card className="mb-3 shadow-sm no-print">
        <Card.Header
          style={{
            background: "var(--color-primary, #0d6efd)",
            color: "#fff",
            fontWeight: "var(--font-weight-semibold)" as any,
            fontSize: "var(--font-size-md)" as any,
          }}
        >
          Pharmacy Credit Bills
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
              <Col md={3} className="d-flex gap-2 align-items-end">
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

      {/* Report Section */}
      {submitted && patient && totals && (
        <Card className="shadow-sm">
          {/* Report Header */}
          <Card.Header
            className="d-flex justify-content-between align-items-center"
            style={{ background: "var(--color-primary, #0d6efd)", color: "#fff" }}
          >
            <div>
              <div style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--font-weight-bold)" }}>
                PHARMACY CREDIT BILLS
              </div>
              <div style={{ fontSize: "var(--font-size-sm)", opacity: 0.9 }}>
                Between &quot;{fmtDisplay(fromDate)}&quot; And &quot;{fmtDisplay(toDate)}&quot;
              </div>
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

          {/* Patient Info Block */}
          <Card.Body className="pb-2">
            <Row className="g-2 mb-2">
              <Col md={3}>
                <span style={labelStyle}>OP No</span>
                <span className="mx-2">:</span>
                <span style={valueStyle}>{patient.opNo}</span>
              </Col>
              <Col md={3}>
                <span style={labelStyle}>Name</span>
                <span className="mx-2">:</span>
                <span style={valueStyle}>{patient.name}</span>
              </Col>
              <Col md={3}>
                <span style={labelStyle}>Sex</span>
                <span className="mx-2">:</span>
                <span style={valueStyle}>{patient.sex}</span>
              </Col>
              <Col md={3}>
                <span style={labelStyle}>Age</span>
                <span className="mx-2">:</span>
                <span style={valueStyle}>{patient.age}</span>
              </Col>
            </Row>
            <Row className="g-2">
              <Col md={3}>
                <span style={labelStyle}>Date From</span>
                <span className="mx-2">:</span>
                <span style={valueStyle}>{patient.dateFrom}</span>
              </Col>
              <Col md={3}>
                <span style={labelStyle}>Date To</span>
                <span className="mx-2">:</span>
                <span style={valueStyle}>{patient.dateTo}</span>
              </Col>
            </Row>
          </Card.Body>

          <hr className="my-0" />

          {/* Totals Section */}
          <Card.Body className="pt-3">
            <div className="mb-2">
              <span style={totalLabelStyle}>Total Payable</span>
              <span style={{ fontWeight: "var(--font-weight-medium)" as any }}>
                : {totals.payable.toFixed(1)}
              </span>
            </div>
            <div className="mb-2">
              <span style={totalLabelStyle}>Total Discount</span>
              <span style={{ fontWeight: "var(--font-weight-medium)" as any }}>
                : {totals.discount.toFixed(1)}
              </span>
            </div>
            <div className="mb-2">
              <span style={totalLabelStyle}>Total Paid</span>
              <span style={{ fontWeight: "var(--font-weight-medium)" as any }}>
                : {totals.paid.toFixed(1)}
              </span>
            </div>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default PharmacyCreditBills;
