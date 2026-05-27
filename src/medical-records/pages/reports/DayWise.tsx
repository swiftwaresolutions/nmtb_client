import React, { useState } from "react";
import { Card, Container, Row, Col, Form, Button, Table, Badge } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCalendarDays, faSearch } from "@fortawesome/free-solid-svg-icons";
import ReportHeader from "../../components/ReportHeader";
import "../../styles/reportStyles.css";

interface DayWiseRow {
  day: string;
  slot1: number;
  slot2: number;
  slot3: number;
  slot4: number;
  slot5: number;
}

const YEARS = Array.from({ length: 61 }, (_, i) => 1990 + i);
const MONTHS = [
  { id: 1, name: "January" },
  { id: 2, name: "February" },
  { id: 3, name: "March" },
  { id: 4, name: "April" },
  { id: 5, name: "May" },
  { id: 6, name: "June" },
  { id: 7, name: "July" },
  { id: 8, name: "August" },
  { id: 9, name: "September" },
  { id: 10, name: "October" },
  { id: 11, name: "November" },
  { id: 12, name: "December" },
];

const DEPARTMENTS = [
  { id: 0, name: "All Departments" },
  { id: 1, name: "General Medicine" },
  { id: 2, name: "Orthopedics" },
  { id: 3, name: "ENT" },
  { id: 4, name: "Gynecology" },
  { id: 5, name: "Paediatrics" },
  { id: 6, name: "Cardiology" },
  { id: 7, name: "Neurology" },
];

const DOCTORS = [
  { id: 0, name: "All Doctors" },
  { id: 1, name: "Dr. Rajesh Kumar" },
  { id: 2, name: "Dr. Priya Singh" },
  { id: 3, name: "Dr. Amit Patel" },
  { id: 4, name: "Dr. Neha Sharma" },
  { id: 5, name: "Dr. Vikram Desai" },
];

// Demo data for all 6 report types
const DEPT_OP_DATA: DayWiseRow[] = [
  { day: "Sunday", slot1: 15, slot2: 18, slot3: 22, slot4: 19, slot5: 14 },
  { day: "Monday", slot1: 28, slot2: 32, slot3: 35, slot4: 30, slot5: 26 },
  { day: "Tuesday", slot1: 25, slot2: 29, slot3: 31, slot4: 27, slot5: 23 },
  { day: "Wednesday", slot1: 30, slot2: 33, slot3: 36, slot4: 32, slot5: 28 },
  { day: "Thursday", slot1: 26, slot2: 31, slot3: 33, slot4: 29, slot5: 25 },
  { day: "Friday", slot1: 32, slot2: 36, slot3: 38, slot4: 35, slot5: 30 },
  { day: "Saturday", slot1: 18, slot2: 22, slot3: 25, slot4: 21, slot5: 17 },
];

const DOCTOR_OP_DATA: DayWiseRow[] = [
  { day: "Sunday", slot1: 5, slot2: 6, slot3: 7, slot4: 6, slot5: 5 },
  { day: "Monday", slot1: 12, slot2: 14, slot3: 15, slot4: 13, slot5: 11 },
  { day: "Tuesday", slot1: 10, slot2: 12, slot3: 13, slot4: 11, slot5: 9 },
  { day: "Wednesday", slot1: 13, slot2: 15, slot3: 16, slot4: 14, slot5: 12 },
  { day: "Thursday", slot1: 11, slot2: 13, slot3: 14, slot4: 12, slot5: 10 },
  { day: "Friday", slot1: 14, slot2: 16, slot3: 17, slot4: 15, slot5: 13 },
  { day: "Saturday", slot1: 6, slot2: 8, slot3: 9, slot4: 8, slot5: 6 },
];

const GENERAL_OP_DATA: DayWiseRow[] = [
  { day: "Sunday", slot1: 42, slot2: 48, slot3: 52, slot4: 46, slot5: 38 },
  { day: "Monday", slot1: 65, slot2: 72, slot3: 78, slot4: 70, slot5: 62 },
  { day: "Tuesday", slot1: 58, slot2: 65, slot3: 70, slot4: 63, slot5: 55 },
  { day: "Wednesday", slot1: 68, slot2: 76, slot3: 82, slot4: 74, slot5: 66 },
  { day: "Thursday", slot1: 62, slot2: 70, slot3: 75, slot4: 68, slot5: 60 },
  { day: "Friday", slot1: 75, slot2: 85, slot3: 92, slot4: 83, slot5: 72 },
  { day: "Saturday", slot1: 45, slot2: 52, slot3: 58, slot4: 50, slot5: 42 },
];

const DEPT_IP_DATA: DayWiseRow[] = [
  { day: "Sunday", slot1: 5, slot2: 4, slot3: 3, slot4: 4, slot5: 5 },
  { day: "Monday", slot1: 8, slot2: 7, slot3: 6, slot4: 7, slot5: 8 },
  { day: "Tuesday", slot1: 6, slot2: 6, slot3: 5, slot4: 6, slot5: 6 },
  { day: "Wednesday", slot1: 9, slot2: 8, slot3: 7, slot4: 8, slot5: 9 },
  { day: "Thursday", slot1: 7, slot2: 7, slot3: 6, slot4: 7, slot5: 7 },
  { day: "Friday", slot1: 10, slot2: 9, slot3: 8, slot4: 9, slot5: 10 },
  { day: "Saturday", slot1: 4, slot2: 3, slot3: 2, slot4: 3, slot5: 4 },
];

const DOCTOR_IP_DATA: DayWiseRow[] = [
  { day: "Sunday", slot1: 1, slot2: 1, slot3: 0, slot4: 1, slot5: 1 },
  { day: "Monday", slot1: 2, slot2: 2, slot3: 2, slot4: 2, slot5: 2 },
  { day: "Tuesday", slot1: 1, slot2: 2, slot3: 1, slot4: 2, slot5: 1 },
  { day: "Wednesday", slot1: 2, slot2: 2, slot3: 2, slot4: 2, slot5: 2 },
  { day: "Thursday", slot1: 1, slot2: 2, slot3: 1, slot4: 2, slot5: 1 },
  { day: "Friday", slot1: 3, slot2: 2, slot3: 2, slot4: 2, slot5: 3 },
  { day: "Saturday", slot1: 1, slot2: 0, slot3: 0, slot4: 0, slot5: 1 },
];

const GENERAL_IP_DATA: DayWiseRow[] = [
  { day: "Sunday", slot1: 28, slot2: 26, slot3: 24, slot4: 26, slot5: 28 },
  { day: "Monday", slot1: 35, slot2: 33, slot3: 31, slot4: 33, slot5: 35 },
  { day: "Tuesday", slot1: 32, slot2: 30, slot3: 28, slot4: 30, slot5: 32 },
  { day: "Wednesday", slot1: 38, slot2: 36, slot3: 34, slot4: 36, slot5: 38 },
  { day: "Thursday", slot1: 34, slot2: 32, slot3: 30, slot4: 32, slot5: 34 },
  { day: "Friday", slot1: 42, slot2: 40, slot3: 38, slot4: 40, slot5: 42 },
  { day: "Saturday", slot1: 25, slot2: 23, slot3: 21, slot4: 23, slot5: 25 },
];

const DayWise: React.FC = () => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth() + 1;

  const [reportType, setReportType] = useState<string>("departmentOp");
  const [year, setYear] = useState<number>(currentYear);
  const [month, setMonth] = useState<number>(currentMonth);
  const [department, setDepartment] = useState<number>(0);
  const [doctor, setDoctor] = useState<number>(0);
  const [submitted, setSubmitted] = useState(false);
  const [selectedLabel, setSelectedLabel] = useState("");

  const getReportData = () => {
    switch (reportType) {
      case "departmentOp":
        return DEPT_OP_DATA;
      case "doctorOp":
        return DOCTOR_OP_DATA;
      case "generalOp":
        return GENERAL_OP_DATA;
      case "departmentIp":
        return DEPT_IP_DATA;
      case "doctorIp":
        return DOCTOR_IP_DATA;
      case "generalIp":
        return GENERAL_IP_DATA;
      default:
        return DEPT_OP_DATA;
    }
  };

  const getReportTitle = () => {
    switch (reportType) {
      case "departmentOp":
        return "Department [OP] - Day Wise";
      case "doctorOp":
        return "Doctor [OP] - Day Wise";
      case "generalOp":
        return "General [OP] - Day Wise";
      case "departmentIp":
        return "Department [IP] - Day Wise";
      case "doctorIp":
        return "Doctor [IP] - Day Wise";
      case "generalIp":
        return "General [IP] - Day Wise";
      default:
        return "Day Wise Report";
    }
  };

  const getReportSubtitle = () => {
    switch (reportType) {
      case "departmentOp":
      case "departmentIp":
        return `Department: ${DEPARTMENTS.find((d) => d.id === department)?.name || "Select"}`;
      case "doctorOp":
      case "doctorIp":
        return `Doctor: ${DOCTORS.find((d) => d.id === doctor)?.name || "Select"}`;
      default:
        return "General Statistics";
    }
  };

  const handleSubmit = () => {
    setSubmitted(true);
    const monthName = MONTHS.find((m) => m.id === month)?.name || "";
    const subtitle = getReportSubtitle();
    setSelectedLabel(`${monthName} ${year} - ${subtitle}`);
  };

  const handleReset = () => {
    setYear(currentYear);
    setMonth(currentMonth);
    setDepartment(0);
    setDoctor(0);
    setSubmitted(false);
    setSelectedLabel("");
  };

  const reportData = getReportData();
  const totalRecords = reportData.reduce(
    (sum, row) => sum + row.slot1 + row.slot2 + row.slot3 + row.slot4 + row.slot5,
    0
  );

  return (
    <div className="content-wrapper">
      {/* Header */}
      <ReportHeader
        title="Day Wise Reports"
        subtitle="View daily statistics by department, doctor, or general"
      />

      {/* Report Type Selection */}
      <Container fluid className="py-3">
        <Card className="shadow-sm border-0 mb-3">
          <Card.Body className="p-3">
            <Form.Label className="fw-semibold mb-3">Select Report Type:</Form.Label>
            <div className="d-flex flex-wrap gap-3">
              {[
                { value: "departmentOp", label: "Department [OP]" },
                { value: "doctorOp", label: "Doctor [OP]" },
                { value: "generalOp", label: "General [OP]" },
                { value: "departmentIp", label: "Department [IP]" },
                { value: "doctorIp", label: "Doctor [IP]" },
                { value: "generalIp", label: "General [IP]" },
              ].map((type) => (
                <Form.Check
                  key={type.value}
                  id={`report-${type.value}`}
                  inline
                  type="radio"
                  label={type.label}
                  value={type.value}
                  checked={reportType === type.value}
                  onChange={(e) => {
                    setReportType(e.target.value);
                    setSubmitted(false);
                  }}
                  className="fw-semibold"
                  style={{ cursor: "pointer" }}
                />
              ))}
            </div>
          </Card.Body>
        </Card>
      </Container>

      {/* Filter Form */}
      <Container fluid className="px-3">
        <Card className="shadow-sm border-0 mb-3">
          <Card.Body className="p-3">
            <Row className="g-3 align-items-end">
              <Col md={2}>
                <Form.Group>
                  <Form.Label className="fw-semibold small mb-1">Year</Form.Label>
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
              <Col md={2}>
                <Form.Group>
                  <Form.Label className="fw-semibold small mb-1">Month</Form.Label>
                  <Form.Select
                    size="sm"
                    value={month}
                    onChange={(e) => setMonth(parseInt(e.target.value))}
                  >
                    {MONTHS.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>

              {(reportType === "departmentOp" || reportType === "departmentIp") && (
                <Col md={2}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small mb-1">Department</Form.Label>
                    <Form.Select
                      size="sm"
                      value={department}
                      onChange={(e) => setDepartment(parseInt(e.target.value))}
                    >
                      {DEPARTMENTS.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              )}

              {(reportType === "doctorOp" || reportType === "doctorIp") && (
                <Col md={2}>
                  <Form.Group>
                    <Form.Label className="fw-semibold small mb-1">Doctor</Form.Label>
                    <Form.Select
                      size="sm"
                      value={doctor}
                      onChange={(e) => setDoctor(parseInt(e.target.value))}
                    >
                      {DOCTORS.map((d) => (
                        <option key={d.id} value={d.id}>
                          {d.name}
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              )}

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
      </Container>

      {/* Results */}
      {submitted && (
        <Container fluid className="px-3">
          <Card className="shadow-sm border-0">
            <Card.Header className="bg-white border-bottom py-3 px-3">
              <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                <div>
                  <h6 className="mb-1 fw-bold text-dark">{getReportTitle()}</h6>
                  <small className="text-muted">
                    <FontAwesomeIcon icon={faCalendarDays} className="me-1" />
                    {selectedLabel}
                  </small>
                </div>
                <Badge bg="primary" text="white" className="px-3 py-2">
                  Total: <span className="fw-bold">{totalRecords}</span>
                </Badge>
              </div>
            </Card.Header>
            <Card.Body className="p-0">
              <div style={{ maxHeight: "500px", overflowY: "auto" }}>
                <Table bordered hover size="sm" className="mb-0" style={{ fontSize: "0.85rem" }}>
                  <thead className="table-primary" style={{ position: "sticky", top: 0, zIndex: 1 }}>
                    <tr>
                      <th className="text-center" style={{ minWidth: "120px" }}>
                        Day
                      </th>
                      <th className="text-center">1st Day</th>
                      <th className="text-center">2nd Day</th>
                      <th className="text-center">3rd Day</th>
                      <th className="text-center">4th Day</th>
                      <th className="text-center">5th Day</th>
                    </tr>
                  </thead>
                  <tbody>
                    {reportData.map((row, index) => (
                      <tr key={index} style={{ backgroundColor: index % 2 === 0 ? "#fbfbfb" : "#ffffff" }}>
                        <td className="fw-semibold text-primary">{row.day}</td>
                        <td className="text-center">{row.slot1}</td>
                        <td className="text-center">{row.slot2}</td>
                        <td className="text-center">{row.slot3}</td>
                        <td className="text-center">{row.slot4}</td>
                        <td className="text-center">{row.slot5}</td>
                      </tr>
                    ))}
                    <tr
                      style={{
                        backgroundColor: "#222",
                        color: "#fbfdee",
                        fontWeight: "bold",
                      }}
                    >
                      <td>Total</td>
                      <td className="text-center">
                        {reportData.reduce((sum, row) => sum + row.slot1, 0)}
                      </td>
                      <td className="text-center">
                        {reportData.reduce((sum, row) => sum + row.slot2, 0)}
                      </td>
                      <td className="text-center">
                        {reportData.reduce((sum, row) => sum + row.slot3, 0)}
                      </td>
                      <td className="text-center">
                        {reportData.reduce((sum, row) => sum + row.slot4, 0)}
                      </td>
                      <td className="text-center">
                        {reportData.reduce((sum, row) => sum + row.slot5, 0)}
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            </Card.Body>
            <Card.Footer className="bg-light px-3 py-2 text-muted small">
              Total Records: <span className="fw-bold text-primary">{totalRecords}</span>
            </Card.Footer>
          </Card>
        </Container>
      )}
    </div>
  );
};

export default DayWise;
