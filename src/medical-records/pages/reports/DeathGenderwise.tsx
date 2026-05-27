import React, { useState } from "react";
import { Card, Container, Row, Col, Form, Button, Table, Badge } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSearch } from "@fortawesome/free-solid-svg-icons";
import ReportHeader from "../../components/ReportHeader";
import "../../styles/reportStyles.css";

interface DeathPatient {
  slNo: number;
  patientName: string;
  patientNo: string;
  age: string;
  ageType: "Neonatal" | "Infant" | "Child" | "Adult";
  gender: "M" | "F";
}

const YEARS = Array.from({ length: 62 }, (_, i) => 1998 + i);

// Demo data for patients who died
const DEMO_PATIENTS: DeathPatient[] = [
  { slNo: 1, patientName: "Ravi Kumar", patientNo: "OP-2026-001", age: "2 days", ageType: "Neonatal", gender: "M" },
  { slNo: 2, patientName: "Sunita Devi", patientNo: "OP-2026-002", age: "8 months", ageType: "Infant", gender: "F" },
  { slNo: 3, patientName: "Ajay Singh", patientNo: "OP-2026-003", age: "5 years", ageType: "Child", gender: "M" },
  { slNo: 4, patientName: "Meena Sharma", patientNo: "OP-2026-004", age: "45 years", ageType: "Adult", gender: "F" },
  { slNo: 5, patientName: "Rajesh Patel", patientNo: "OP-2026-005", age: "62 years", ageType: "Adult", gender: "M" },
  { slNo: 6, patientName: "Lakshmi N", patientNo: "OP-2026-006", age: "3 months", ageType: "Infant", gender: "F" },
  { slNo: 7, patientName: "Vikram Desai", patientNo: "OP-2026-007", age: "58 years", ageType: "Adult", gender: "M" },
  { slNo: 8, patientName: "Priya Gupta", patientNo: "OP-2026-008", age: "12 years", ageType: "Child", gender: "F" },
  { slNo: 9, patientName: "Suresh Kumar", patientNo: "OP-2026-009", age: "70 years", ageType: "Adult", gender: "M" },
  { slNo: 10, patientName: "Ananya Roy", patientNo: "OP-2026-010", age: "1 day", ageType: "Neonatal", gender: "F" },
  { slNo: 11, patientName: "Mohan Singh", patientNo: "OP-2026-011", age: "55 years", ageType: "Adult", gender: "M" },
  { slNo: 12, patientName: "Divya Reddy", patientNo: "OP-2026-012", age: "6 months", ageType: "Infant", gender: "F" },
];

const DeathGenderwise: React.FC = () => {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState<number>(currentYear);
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = () => {
    setSubmitted(true);
  };

  const handleReset = () => {
    setYear(currentYear);
    setSubmitted(false);
  };

  // Calculate gender-wise statistics
  const maleCount = DEMO_PATIENTS.filter((p) => p.gender === "M").length;
  const femaleCount = DEMO_PATIENTS.filter((p) => p.gender === "F").length;
  const totalCount = DEMO_PATIENTS.length;

  return (
    <div className="content-wrapper">
      {/* Header */}
      <ReportHeader
        title="Death Details"
        subtitle="Gender-wise death statistics and patient details"
      />

      <Container fluid className="px-3 py-3">
        {/* Filter Form */}
        <Card className="shadow-sm border-0 mb-3">
          <Card.Body className="p-3">
            <Row className="g-3 align-items-end">
              <Col md={3}>
                <Form.Group>
                  <Form.Label className="fw-semibold small mb-1">Select Year</Form.Label>
                  <Form.Select
                    size="sm"
                    value={year}
                    onChange={(e) => setYear(parseInt(e.target.value))}
                  >
                    {YEARS.map((y) => (
                      <option key={y} value={y}>
                        {y}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md="auto" className="d-flex gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  onClick={handleSubmit}
                  className="d-flex align-items-center gap-1"
                >
                  <FontAwesomeIcon icon={faSearch} />
                  Submit
                </Button>
                <Button variant="outline-secondary" size="sm" onClick={handleReset}>
                  Reset
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {submitted && (
          <>
            {/* Gender-wise Summary Section */}
            <Card className="shadow-sm border-0 mb-3">
              <Card.Header className="bg-white border-bottom py-3 px-3">
                <h6 className="mb-0 fw-bold text-dark">Death Details - Year {year}</h6>
              </Card.Header>
              <Card.Body className="p-0">
                <div style={{ maxHeight: "300px", overflowY: "auto" }}>
                  <Table bordered size="sm" className="mb-0" style={{ fontSize: "0.9rem" }}>
                    <thead className="table-primary">
                      <tr>
                        <th className="text-center" style={{ minWidth: "300px" }}>
                          Gender
                        </th>
                        <th className="text-end pe-3" style={{ minWidth: "200px" }}>
                          No of Deaths
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr style={{ backgroundColor: "#fbfbfb" }}>
                        <td className="ps-3" style={{ color: "#000000" }}>
                          Male
                        </td>
                        <td className="text-end pe-3 fw-semibold text-primary">{maleCount}</td>
                      </tr>
                      <tr style={{ backgroundColor: "#ffffff" }}>
                        <td className="ps-3" style={{ color: "#000000" }}>
                          Female
                        </td>
                        <td className="text-end pe-3 fw-semibold text-primary">{femaleCount}</td>
                      </tr>
                      <tr style={{ backgroundColor: "#222", color: "#fbfdee" }}>
                        <td className="ps-3 fw-bold">Total</td>
                        <td className="text-end pe-3 fw-bold" style={{ color: "#ff0000" }}>
                          {totalCount}
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>

            {/* Male Patient Details */}
            <Card className="shadow-sm border-0 mb-3">
              <Card.Header className="bg-white border-bottom py-3 px-3">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                  <h6 className="mb-0 fw-bold text-dark">
                    <span style={{ color: "#0066cc" }}>Male</span> Death Patient Details
                  </h6>
                  <Badge bg="primary" text="white" className="px-3 py-2">
                    Male Patients: <span className="fw-bold">{maleCount}</span>
                  </Badge>
                </div>
              </Card.Header>
              <Card.Body className="p-0">
                <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                  {DEMO_PATIENTS.filter((p) => p.gender === "M").length > 0 ? (
                    <Table bordered hover size="sm" className="mb-0" style={{ fontSize: "0.85rem" }}>
                      <thead className="table-primary" style={{ position: "sticky", top: 0, zIndex: 1 }}>
                        <tr>
                          <th className="text-center" style={{ minWidth: "80px" }}>
                            S.No
                          </th>
                          <th style={{ minWidth: "200px" }}>Patient Name</th>
                          <th className="text-center" style={{ minWidth: "120px" }}>
                            Patient No
                          </th>
                          <th className="text-center" style={{ minWidth: "100px" }}>
                            Age
                          </th>
                          <th className="text-center" style={{ minWidth: "120px" }}>
                            Age Type
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {DEMO_PATIENTS.filter((p) => p.gender === "M").map((patient, index) => (
                          <tr
                            key={index}
                            style={{ backgroundColor: index % 2 === 0 ? "#fbfbfb" : "#ffffff" }}
                          >
                            <td className="text-center fw-semibold text-primary">{index + 1}</td>
                            <td>&nbsp;&nbsp;{patient.patientName}</td>
                            <td className="text-center">{patient.patientNo}</td>
                            <td className="text-center">{patient.age}</td>
                            <td className="text-center">
                              <Badge
                                bg={
                                  patient.ageType === "Neonatal"
                                    ? "danger"
                                    : patient.ageType === "Infant"
                                    ? "warning"
                                    : patient.ageType === "Child"
                                    ? "info"
                                    : "success"
                                }
                                style={{ fontSize: "0.75rem" }}
                              >
                                {patient.ageType}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  ) : (
                    <div className="text-center text-muted py-4">No male patients found</div>
                  )}
                </div>
              </Card.Body>
              <Card.Footer className="bg-light px-3 py-2 text-muted small">
                Total Male Records: <span className="fw-bold text-primary">{maleCount}</span>
              </Card.Footer>
            </Card>

            {/* Female Patient Details */}
            <Card className="shadow-sm border-0">
              <Card.Header className="bg-white border-bottom py-3 px-3">
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                  <h6 className="mb-0 fw-bold text-dark">
                    <span style={{ color: "#cc0066" }}>Female</span> Death Patient Details
                  </h6>
                  <Badge bg="danger" text="white" className="px-3 py-2">
                    Female Patients: <span className="fw-bold">{femaleCount}</span>
                  </Badge>
                </div>
              </Card.Header>
              <Card.Body className="p-0">
                <div style={{ maxHeight: "400px", overflowY: "auto" }}>
                  {DEMO_PATIENTS.filter((p) => p.gender === "F").length > 0 ? (
                    <Table bordered hover size="sm" className="mb-0" style={{ fontSize: "0.85rem" }}>
                      <thead className="table-primary" style={{ position: "sticky", top: 0, zIndex: 1 }}>
                        <tr>
                          <th className="text-center" style={{ minWidth: "80px" }}>
                            S.No
                          </th>
                          <th style={{ minWidth: "200px" }}>Patient Name</th>
                          <th className="text-center" style={{ minWidth: "120px" }}>
                            Patient No
                          </th>
                          <th className="text-center" style={{ minWidth: "100px" }}>
                            Age
                          </th>
                          <th className="text-center" style={{ minWidth: "120px" }}>
                            Age Type
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {DEMO_PATIENTS.filter((p) => p.gender === "F").map((patient, index) => (
                          <tr
                            key={index}
                            style={{ backgroundColor: index % 2 === 0 ? "#fbfbfb" : "#ffffff" }}
                          >
                            <td className="text-center fw-semibold text-primary">{index + 1}</td>
                            <td>&nbsp;&nbsp;{patient.patientName}</td>
                            <td className="text-center">{patient.patientNo}</td>
                            <td className="text-center">{patient.age}</td>
                            <td className="text-center">
                              <Badge
                                bg={
                                  patient.ageType === "Neonatal"
                                    ? "danger"
                                    : patient.ageType === "Infant"
                                    ? "warning"
                                    : patient.ageType === "Child"
                                    ? "info"
                                    : "success"
                                }
                                style={{ fontSize: "0.75rem" }}
                              >
                                {patient.ageType}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  ) : (
                    <div className="text-center text-muted py-4">No female patients found</div>
                  )}
                </div>
              </Card.Body>
              <Card.Footer className="bg-light px-3 py-2 text-muted small">
                Total Female Records: <span className="fw-bold text-primary">{femaleCount}</span>
              </Card.Footer>
            </Card>
          </>
        )}
      </Container>
    </div>
  );
};

export default DeathGenderwise;
