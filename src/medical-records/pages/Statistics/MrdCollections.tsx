import React, { useState } from "react";
import { Card, Table, Badge, Container, Row, Col, Form, Button } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMoneyBillWave, faCalendarDays, faSearch } from "@fortawesome/free-solid-svg-icons";
import { useTableSearch } from "../../../hooks/useTableSearch";
import SearchInput from "../../../components/SearchInput";

interface MrdCollectionRow {
  id: number;
  patientName: string;
  opNo: string;
  visitType: string;
  billNo: string;
  billDate: string;
  paid: number;
  user: string;
}

const demoCollections: MrdCollectionRow[] = [
  { id: 1, patientName: "Rajan Kumar", opNo: "OP1001", visitType: "New", billNo: "BL2001", billDate: "10-02-2026", paid: 500.00, user: "Admin" },
  { id: 2, patientName: "Meena Devi", opNo: "OP1002", visitType: "Review", billNo: "BL2002", billDate: "11-02-2026", paid: 300.00, user: "Cashier1" },
  { id: 3, patientName: "Suresh Babu", opNo: "OP1003", visitType: "New", billNo: "BL2003", billDate: "12-02-2026", paid: 750.00, user: "Admin" },
  { id: 4, patientName: "Kavitha S", opNo: "OP1004", visitType: "Review", billNo: "BL2004", billDate: "13-02-2026", paid: 200.00, user: "Cashier2" },
];

const demoCancellations: MrdCollectionRow[] = [
  { id: 1, patientName: "Anand R", opNo: "OP1010", visitType: "New", billNo: "BL3001", billDate: "10-02-2026", paid: 400.00, user: "Admin" },
  { id: 2, patientName: "Saranya P", opNo: "OP1011", visitType: "Review", billNo: "BL3002", billDate: "11-02-2026", paid: 150.00, user: "Cashier1" },
];

const demoDeparts = ["General Medicine", "Orthopedics", "ENT", "Gynecology", "Paediatrics", "Cardiology"];

const fmt = (n: number) => n.toFixed(2);

const MrdCollections: React.FC = () => {
  const today = new Date().toISOString().split("T")[0];
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [department, setDepartment] = useState(demoDeparts[0]);
  const [submitted, setSubmitted] = useState(true);

  const collTotPaid = demoCollections.reduce((s, r) => s + r.paid, 0);
  const canTotPaid = demoCancellations.reduce((s, r) => s + r.paid, 0);

  const {
    filteredData: filteredColl,
    searchTerm: collSearch,
    setSearchTerm: setCollSearch,
    resultCount: collResult,
    totalCount: collTotal,
  } = useTableSearch({ data: demoCollections, searchFields: ["patientName", "opNo", "visitType", "billNo", "user"] });

  const {
    filteredData: filteredCanc,
    searchTerm: cancSearch,
    setSearchTerm: setCancSearch,
    resultCount: cancResult,
    totalCount: cancTotal,
  } = useTableSearch({ data: demoCancellations, searchFields: ["patientName", "opNo", "visitType", "billNo", "user"] });

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
                <FontAwesomeIcon icon={faMoneyBillWave} />
              </div>
              <div>
                <h5 className="mb-0 fw-bold text-dark">MRD Collections</h5>
                <small className="text-muted">Department wise collection and cancellation details</small>
              </div>
            </div>
            <Badge bg="light" text="dark" className="border px-3 py-2">
              <span className="text-muted me-2">Department:</span>
              <span className="fw-bold text-primary">{department}</span>
            </Badge>
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
                  <Form.Label className="fw-semibold small mb-1">Department Name</Form.Label>
                  <Form.Select size="sm" value={department} onChange={(e) => setDepartment(e.target.value)}>
                    {demoDeparts.map((d) => (
                      <option key={d} value={d}>{d}</option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="fw-semibold small mb-1">
                    <FontAwesomeIcon icon={faCalendarDays} className="me-1 text-primary" />
                    From Date
                  </Form.Label>
                  <Form.Control
                    type="date"
                    size="sm"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="fw-semibold small mb-1">
                    <FontAwesomeIcon icon={faCalendarDays} className="me-1 text-primary" />
                    To Date
                  </Form.Label>
                  <Form.Control
                    type="date"
                    size="sm"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
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
          <>
            {/* MRD Collection Details */}
            <Card className="shadow-sm border-0 mb-3">
              <Card.Header className="bg-white border-bottom py-2 px-3 d-flex justify-content-between align-items-center">
                <span className="fw-bold text-dark" style={{ fontSize: "0.9rem" }}>MRD Collection Details</span>
                <SearchInput
                  searchTerm={collSearch}
                  onSearchChange={setCollSearch}
                  placeholder="Search collection..."
                  resultCount={collResult}
                  totalCount={collTotal}
                />
              </Card.Header>
              <Card.Body className="p-0">
                <div style={{ maxHeight: "320px", overflowY: "auto" }}>
                  <Table bordered hover size="sm" className="mb-0" style={{ fontSize: "0.82rem" }}>
                    <thead className="table-primary" style={{ position: "sticky", top: 0, zIndex: 1 }}>
                      <tr>
                        <th className="text-center">S.No</th>
                        <th>Patient Name</th>
                        <th>OPNO</th>
                        <th>Visit Type</th>
                        <th>Bill No</th>
                        <th className="text-center">Bill Date</th>
                        <th className="text-end">Paid</th>
                        <th>User</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredColl.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center text-muted py-4">No records found.</td>
                        </tr>
                      ) : (
                        filteredColl.map((row, i) => (
                          <tr key={row.id}>
                            <td className="text-center">{i + 1}</td>
                            <td>&nbsp;&nbsp;{row.patientName}</td>
                            <td>&nbsp;&nbsp;{row.opNo}</td>
                            <td>&nbsp;&nbsp;{row.visitType}</td>
                            <td>&nbsp;&nbsp;{row.billNo}</td>
                            <td className="text-center">{row.billDate}</td>
                            <td className="text-end">{fmt(row.paid)}&nbsp;&nbsp;</td>
                            <td>&nbsp;&nbsp;{row.user}</td>
                          </tr>
                        ))
                      )}
                      <tr className="table-light fw-bold">
                        <td colSpan={6} className="text-end pe-3">Total Amount</td>
                        <td className="text-end text-primary">{fmt(collTotPaid)}&nbsp;&nbsp;</td>
                        <td></td>
                      </tr>
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>

            {/* MRD Cancellation Details */}
            <Card className="shadow-sm border-0">
              <Card.Header className="bg-white border-bottom py-2 px-3 d-flex justify-content-between align-items-center">
                <span className="fw-bold text-dark" style={{ fontSize: "0.9rem" }}>MRD Cancellation Details</span>
                <SearchInput
                  searchTerm={cancSearch}
                  onSearchChange={setCancSearch}
                  placeholder="Search cancellation..."
                  resultCount={cancResult}
                  totalCount={cancTotal}
                />
              </Card.Header>
              <Card.Body className="p-0">
                <div style={{ maxHeight: "320px", overflowY: "auto" }}>
                  <Table bordered hover size="sm" className="mb-0" style={{ fontSize: "0.82rem" }}>
                    <thead className="table-primary" style={{ position: "sticky", top: 0, zIndex: 1 }}>
                      <tr>
                        <th className="text-center">S.No</th>
                        <th>Patient Name</th>
                        <th>OPNO</th>
                        <th>Visit Type</th>
                        <th>Bill No</th>
                        <th className="text-center">Bill Date</th>
                        <th className="text-end">Paid</th>
                        <th>User</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredCanc.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center text-muted py-4">No cancellation records found.</td>
                        </tr>
                      ) : (
                        filteredCanc.map((row, i) => (
                          <tr key={row.id}>
                            <td className="text-center">{i + 1}</td>
                            <td>&nbsp;&nbsp;{row.patientName}</td>
                            <td>&nbsp;&nbsp;{row.opNo}</td>
                            <td>&nbsp;&nbsp;{row.visitType}</td>
                            <td>&nbsp;&nbsp;{row.billNo}</td>
                            <td className="text-center">{row.billDate}</td>
                            <td className="text-end">{fmt(row.paid)}&nbsp;&nbsp;</td>
                            <td>&nbsp;&nbsp;{row.user}</td>
                          </tr>
                        ))
                      )}
                      <tr className="table-light fw-bold">
                        <td colSpan={6} className="text-end pe-3">Total Amount</td>
                        <td className="text-end text-danger">{fmt(canTotPaid)}&nbsp;&nbsp;</td>
                        <td></td>
                      </tr>
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </>
        )}
      </div>
    </div>
  );
};

export default MrdCollections;
