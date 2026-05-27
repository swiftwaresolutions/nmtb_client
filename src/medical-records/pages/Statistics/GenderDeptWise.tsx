import React, { useState } from "react";
import { Card, Table, Badge, Container, Row, Col, Form, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faVenusMars, faCalendarDays, faSearch } from "@fortawesome/free-solid-svg-icons";

interface DeptGenderRow {
  id: number;
  department: string;
  newGenMale: number;
  newGenFemale: number;
  newPvtMale: number;
  newPvtFemale: number;
  repGenMale: number;
  repGenFemale: number;
  repPvtMale: number;
  repPvtFemale: number;
}

const demoData: DeptGenderRow[] = [
  { id: 1, department: "General Medicine",  newGenMale: 12, newGenFemale: 9,  newPvtMale: 4, newPvtFemale: 3, repGenMale: 7,  repGenFemale: 5, repPvtMale: 2, repPvtFemale: 1 },
  { id: 2, department: "Orthopedics",       newGenMale: 8,  newGenFemale: 5,  newPvtMale: 3, newPvtFemale: 2, repGenMale: 4,  repGenFemale: 3, repPvtMale: 1, repPvtFemale: 1 },
  { id: 3, department: "ENT",               newGenMale: 5,  newGenFemale: 6,  newPvtMale: 2, newPvtFemale: 1, repGenMale: 3,  repGenFemale: 2, repPvtMale: 0, repPvtFemale: 1 },
  { id: 4, department: "Gynecology",        newGenMale: 0,  newGenFemale: 14, newPvtMale: 0, newPvtFemale: 5, repGenMale: 0,  repGenFemale: 8, repPvtMale: 0, repPvtFemale: 3 },
  { id: 5, department: "Paediatrics",       newGenMale: 6,  newGenFemale: 4,  newPvtMale: 2, newPvtFemale: 2, repGenMale: 3,  repGenFemale: 2, repPvtMale: 1, repPvtFemale: 0 },
  { id: 6, department: "Cardiology",        newGenMale: 9,  newGenFemale: 4,  newPvtMale: 5, newPvtFemale: 2, repGenMale: 5,  repGenFemale: 3, repPvtMale: 2, repPvtFemale: 1 },
];

const displayVal = (n: number) => (n === 0 ? "-" : n);

const GenderDeptWise: React.FC = () => {
  const today = new Date().toISOString().split("T")[0];
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [submitted, setSubmitted] = useState(false);

  // Totals
  const totals = demoData.reduce(
    (acc, r) => ({
      newGenMale:   acc.newGenMale   + r.newGenMale,
      newGenFemale: acc.newGenFemale + r.newGenFemale,
      newPvtMale:   acc.newPvtMale   + r.newPvtMale,
      newPvtFemale: acc.newPvtFemale + r.newPvtFemale,
      repGenMale:   acc.repGenMale   + r.repGenMale,
      repGenFemale: acc.repGenFemale + r.repGenFemale,
      repPvtMale:   acc.repPvtMale   + r.repPvtMale,
      repPvtFemale: acc.repPvtFemale + r.repPvtFemale,
    }),
    { newGenMale: 0, newGenFemale: 0, newPvtMale: 0, newPvtFemale: 0, repGenMale: 0, repGenFemale: 0, repPvtMale: 0, repPvtFemale: 0 }
  );

  const newTotal    = (r: DeptGenderRow) => r.newGenMale + r.newGenFemale + r.newPvtMale + r.newPvtFemale;
  const repTotal    = (r: DeptGenderRow) => r.repGenMale + r.repGenFemale + r.repPvtMale + r.repPvtFemale;
  const grandTotal  = (r: DeptGenderRow) => newTotal(r) + repTotal(r);

  const totNewTotal   = totals.newGenMale + totals.newGenFemale + totals.newPvtMale + totals.newPvtFemale;
  const totRepTotal   = totals.repGenMale + totals.repGenFemale + totals.repPvtMale + totals.repPvtFemale;
  const totGrandTotal = totNewTotal + totRepTotal;

  return (
    <div className="content-wrapper">
      {/* Header */}
      <div className="bg-white shadow-sm mb-3">
        <Container fluid className="py-3">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-2">
              <div
                className="bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                style={{ width: "40px", height: "40px" }}
              >
                <FontAwesomeIcon icon={faVenusMars} />
              </div>
              <div>
                <h5 className="mb-0 fw-bold text-dark">Gender Wise New &amp; Repeat OP Details</h5>
                <small className="text-muted">Department wise gender breakdown of outpatients</small>
              </div>
            </div>
            {submitted && (
              <Badge bg="light" text="dark" className="border px-3 py-2">
                <span className="text-muted me-2">Grand Total:</span>
                <span className="fw-bold text-danger">{totGrandTotal}</span>
              </Badge>
            )}
          </div>
        </Container>
      </div>

      <div className="content-body">
        {/* Filter Card */}
        <Card className="shadow-sm border-0 mb-3">
          <Card.Body className="p-3">
            <Row className="align-items-end g-3">
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="fw-semibold small mb-1">
                    <FontAwesomeIcon icon={faCalendarDays} className="me-1 text-primary" />
                    From Date
                  </Form.Label>
                  <Form.Control type="date" size="sm" value={fromDate} onChange={(e) => setFromDate(e.target.value)} />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="fw-semibold small mb-1">
                    <FontAwesomeIcon icon={faCalendarDays} className="me-1 text-primary" />
                    To Date
                  </Form.Label>
                  <Form.Control type="date" size="sm" value={toDate} onChange={(e) => setToDate(e.target.value)} />
                </Form.Group>
              </Col>
              <Col md={2}>
                <Button variant="primary" size="sm" className="w-100" onClick={() => setSubmitted(true)}>
                  <FontAwesomeIcon icon={faSearch} className="me-1" />
                  Submit
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {submitted && (
          <Card className="shadow-sm border-0">
            <Card.Body className="p-0">
              <div style={{ overflowX: "auto" }}>
                <Table bordered size="sm" className="mb-0" style={{ fontSize: "var(--font-size-md)", minWidth: "900px" }}>
                  <thead>
                    <tr className="table-primary text-center">
                      <th rowSpan={3} className="align-middle">Department</th>
                      <th colSpan={5} className="text-center">New OP</th>
                      <th colSpan={5} className="text-center">Repeat OP</th>
                      <th rowSpan={3} className="align-middle text-center">Grand Total</th>
                    </tr>
                    <tr className="table-primary text-center">
                      <th>General</th>
                      <th>General</th>
                      <th>Private</th>
                      <th>Private</th>
                      <th style={{ background: "#638CBB", color: "#fff" }}>Total</th>
                      <th>General</th>
                      <th>General</th>
                      <th>Private</th>
                      <th>Private</th>
                      <th style={{ background: "#638CBB", color: "#fff" }}>Total</th>
                    </tr>
                    <tr className="table-primary text-center">
                      <th style={{ color: "#000099" }}>Male</th>
                      <th style={{ color: "#008080" }}>Female</th>
                      <th style={{ color: "#000099" }}>Male</th>
                      <th style={{ color: "#008080" }}>Female</th>
                      <th style={{ background: "#638CBB", color: "#fff" }}>—</th>
                      <th style={{ color: "#000099" }}>Male</th>
                      <th style={{ color: "#008080" }}>Female</th>
                      <th style={{ color: "#000099" }}>Male</th>
                      <th style={{ color: "#008080" }}>Female</th>
                      <th style={{ background: "#638CBB", color: "#fff" }}>—</th>
                    </tr>
                  </thead>
                  <tbody>
                    {demoData.map((row) => {
                      const nt = newTotal(row);
                      const rt = repTotal(row);
                      const gt = grandTotal(row);
                      return (
                        <tr key={row.id}>
                          <td>&nbsp;&nbsp;{row.department}</td>
                          <td className="text-center" style={{ color: "#000099" }}>{displayVal(row.newGenMale)}</td>
                          <td className="text-center" style={{ color: "#008080" }}>{displayVal(row.newGenFemale)}</td>
                          <td className="text-center" style={{ color: "#000099" }}>{displayVal(row.newPvtMale)}</td>
                          <td className="text-center" style={{ color: "#008080" }}>{displayVal(row.newPvtFemale)}</td>
                          <td className="text-center fw-bold" style={{ background: "#e8f0fb" }}>{displayVal(nt)}</td>
                          <td className="text-center" style={{ color: "#000099" }}>{displayVal(row.repGenMale)}</td>
                          <td className="text-center" style={{ color: "#008080" }}>{displayVal(row.repGenFemale)}</td>
                          <td className="text-center" style={{ color: "#000099" }}>{displayVal(row.repPvtMale)}</td>
                          <td className="text-center" style={{ color: "#008080" }}>{displayVal(row.repPvtFemale)}</td>
                          <td className="text-center fw-bold" style={{ background: "#e8f0fb" }}>{displayVal(rt)}</td>
                          <td className="text-end fw-bold pe-3" style={{ color: "#800080" }}>{displayVal(gt)}</td>
                        </tr>
                      );
                    })}
                    {/* Totals Row */}
                    <tr className="table-light fw-bold">
                      <td className="text-end pe-2" style={{ color: "#800080" }}>Total</td>
                      <td className="text-center" style={{ color: "#800080" }}>{displayVal(totals.newGenMale)}</td>
                      <td className="text-center" style={{ color: "#800080" }}>{displayVal(totals.newGenFemale)}</td>
                      <td className="text-center" style={{ color: "#800080" }}>{displayVal(totals.newPvtMale)}</td>
                      <td className="text-center" style={{ color: "#800080" }}>{displayVal(totals.newPvtFemale)}</td>
                      <td className="text-center fw-bold" style={{ background: "#638CBB", color: "#fff" }}>{displayVal(totNewTotal)}</td>
                      <td className="text-center" style={{ color: "#800080" }}>{displayVal(totals.repGenMale)}</td>
                      <td className="text-center" style={{ color: "#800080" }}>{displayVal(totals.repGenFemale)}</td>
                      <td className="text-center" style={{ color: "#800080" }}>{displayVal(totals.repPvtMale)}</td>
                      <td className="text-center" style={{ color: "#800080" }}>{displayVal(totals.repPvtFemale)}</td>
                      <td className="text-center fw-bold" style={{ background: "#638CBB", color: "#fff" }}>{displayVal(totRepTotal)}</td>
                      <td className="text-end fw-bold pe-3" style={{ color: "#ff0000" }}>{displayVal(totGrandTotal)}</td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        )}
      </div>
    </div>
  );
};

export default GenderDeptWise;
