import React, { useMemo, useState } from "react";
import { Container, Card, Form, Button, Row, Col, Spinner, Table, Badge, Nav } from "react-bootstrap";
import ReportHeader from "../../components/ReportHeader";
import ReportTable from "../../components/ReportTable";
import {
  exportToExcel,
  printReport,
  formatReportDate
} from "../../utils/reportUtils";
import { showValidationError } from "../../../utils/alertUtil";
import "../../styles/reportStyles.css";

type VisitType = "op" | "ip";

interface PatientInfo {
  opNo: string;
  name: string;
  age: string;
  sex: "Male" | "Female";
}

interface PatientVisitRow {
  ipNo: string;
  majorToken: string;
  department: string;
  doctor: string;
  visitDate: string;
  isAdmitted: boolean;
  diagnosis: string;
}

interface IpVisitRow {
  ipNumber: string;
  wardName: string;
  roomBed: string;
  admissionDate: string;
  dischargeDate: string;
}

interface DepartmentOption {
  id: number;
  name: string;
}

interface DepartmentVisitRow {
  id: number;
  year: number;
  departmentId: number;
  opNo: string;
  patientName: string;
  sex: "Male" | "Female";
  age: string;
  firstVisitDate: string;
  lastVisitDate: string;
  regVisits: number;
  refVisits: number;
}

export default function PatientVisitDetails() {
  const currentYear = new Date().getFullYear();

  const [opNo, setOpNo] = useState<string>("");
  const [visitType, setVisitType] = useState<VisitType>("op");
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [patientInfo, setPatientInfo] = useState<PatientInfo | null>(null);
  const [opVisitRows, setOpVisitRows] = useState<PatientVisitRow[]>([]);
  const [ipVisitRows, setIpVisitRows] = useState<IpVisitRow[]>([]);

  const [yearlyDeptYear, setYearlyDeptYear] = useState<number>(currentYear);
  const [yearlyDeptId, setYearlyDeptId] = useState<number>(1);
  const [yearlyDeptSubmitted, setYearlyDeptSubmitted] = useState<boolean>(false);
  const [activeMainTab, setActiveMainTab] = useState<"patient" | "department">("patient");

  const departmentOptions = useMemo<DepartmentOption[]>(
    () => [
      { id: 1, name: "General Medicine" },
      { id: 2, name: "Orthopedics" },
      { id: 3, name: "ENT" },
      { id: 4, name: "Gynecology" },
      { id: 5, name: "Cardiology" },
    ],
    []
  );

  const yearOptions = useMemo<number[]>(() => {
    const values: number[] = [];
    for (let year = 2006; year <= currentYear; year++) {
      values.push(year);
    }
    return values;
  }, [currentYear]);

  const dummyDepartmentVisits = useMemo<DepartmentVisitRow[]>(
    () => [
      {
        id: 1,
        year: currentYear,
        departmentId: 1,
        opNo: "OP10231",
        patientName: "Ravi Kumar",
        sex: "Male",
        age: "34",
        firstVisitDate: "10-01-2026",
        lastVisitDate: "28-02-2026",
        regVisits: 4,
        refVisits: 1,
      },
      {
        id: 2,
        year: currentYear,
        departmentId: 1,
        opNo: "OP10745",
        patientName: "Saranya Devi",
        sex: "Female",
        age: "29",
        firstVisitDate: "04-01-2026",
        lastVisitDate: "20-02-2026",
        regVisits: 3,
        refVisits: 2,
      },
      {
        id: 3,
        year: currentYear,
        departmentId: 2,
        opNo: "OP11008",
        patientName: "Kannan P",
        sex: "Male",
        age: "46",
        firstVisitDate: "15-01-2026",
        lastVisitDate: "01-03-2026",
        regVisits: 5,
        refVisits: 1,
      },
      {
        id: 4,
        year: currentYear,
        departmentId: 3,
        opNo: "OP11287",
        patientName: "Latha R",
        sex: "Female",
        age: "40",
        firstVisitDate: "09-01-2026",
        lastVisitDate: "18-02-2026",
        regVisits: 2,
        refVisits: 1,
      },
      {
        id: 5,
        year: currentYear,
        departmentId: 4,
        opNo: "OP11564",
        patientName: "Maha Lakshmi",
        sex: "Female",
        age: "31",
        firstVisitDate: "06-01-2026",
        lastVisitDate: "26-02-2026",
        regVisits: 6,
        refVisits: 2,
      },
      {
        id: 6,
        year: currentYear,
        departmentId: 5,
        opNo: "OP11720",
        patientName: "Arul Das",
        sex: "Male",
        age: "52",
        firstVisitDate: "11-01-2026",
        lastVisitDate: "03-03-2026",
        regVisits: 4,
        refVisits: 3,
      },
      {
        id: 7,
        year: currentYear - 1,
        departmentId: 1,
        opNo: "OP09520",
        patientName: "Nirmala",
        sex: "Female",
        age: "38",
        firstVisitDate: "03-02-2025",
        lastVisitDate: "20-12-2025",
        regVisits: 7,
        refVisits: 2,
      },
    ],
    [currentYear]
  );

  const dummyOpVisits = useMemo<PatientVisitRow[]>(() => ([
    {
      ipNo: "IP-1023",
      majorToken: "MT-221",
      department: "General Medicine",
      doctor: "Dr. Priya",
      visitDate: "12-02-2026",
      isAdmitted: false,
      diagnosis: "Not Entered"
    },
    {
      ipNo: "IP-2044",
      majorToken: "MT-239",
      department: "Orthopedics",
      doctor: "Dr. Arun",
      visitDate: "22-01-2026",
      isAdmitted: true,
      diagnosis: "Not Entered"
    },
    {
      ipNo: "-",
      majorToken: "MT-305",
      department: "Dermatology",
      doctor: "Dr. Leela",
      visitDate: "08-12-2025",
      isAdmitted: false,
      diagnosis: "Not Entered"
    }
  ]), []);

  const dummyIpVisits = useMemo<IpVisitRow[]>(() => ([
    {
      ipNumber: "IP-4102",
      wardName: "Ward A",
      roomBed: "Room 12 / Bed 3",
      admissionDate: "02-02-2026",
      dischargeDate: "05-02-2026"
    },
    {
      ipNumber: "IP-4128",
      wardName: "Ward B",
      roomBed: "Room 8 / Bed 1",
      admissionDate: "18-01-2026",
      dischargeDate: "22-01-2026"
    }
  ]), []);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!opNo.trim()) {
      showValidationError("Enter OP Number");
      return;
    }

    setIsLoading(true);
    setIsSubmitted(true);

    setPatientInfo({
      opNo: opNo.trim(),
      name: "Ravi Kumar",
      age: "34",
      sex: "Male"
    });

    if (visitType === "ip") {
      setIpVisitRows(dummyIpVisits);
      setOpVisitRows([]);
    } else {
      setOpVisitRows(dummyOpVisits);
      setIpVisitRows([]);
    }
    setIsLoading(false);
  };

  const handleReset = () => {
    setOpNo("");
    setVisitType("op");
    setIsSubmitted(false);
    setPatientInfo(null);
    setOpVisitRows([]);
    setIpVisitRows([]);
  };

  const handleDepartmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setYearlyDeptSubmitted(true);
  };

  const handleDepartmentReset = () => {
    setYearlyDeptYear(currentYear);
    setYearlyDeptId(1);
    setYearlyDeptSubmitted(false);
  };

  const yearlyDepartmentRows = useMemo(() => {
    if (!yearlyDeptSubmitted) {
      return [];
    }

    return dummyDepartmentVisits.filter(
      (row) => row.year === yearlyDeptYear && row.departmentId === yearlyDeptId
    );
  }, [dummyDepartmentVisits, yearlyDeptYear, yearlyDeptId, yearlyDeptSubmitted]);

  const selectedDepartmentName = useMemo(() => {
    const department = departmentOptions.find((item) => item.id === yearlyDeptId);
    return department?.name ?? "-";
  }, [departmentOptions, yearlyDeptId]);

  const finRegTotal = yearlyDepartmentRows.reduce((sum, row) => sum + row.regVisits, 0);
  const finRefTotal = yearlyDepartmentRows.reduce((sum, row) => sum + row.refVisits, 0);

  const handlePrint = () => {
    printReport();
  };

  const handleExport = () => {
    if (visitType === "ip") {
      const exportData = ipVisitRows.map((record, index) => ({
        "S.No": index + 1,
        "IP Number": record.ipNumber,
        "Ward Name": record.wardName,
        "Room/Bed": record.roomBed,
        "Admission Date": record.admissionDate,
        "Discharge Date": record.dischargeDate
      }));

      exportToExcel(
        exportData,
        `Patient_Visit_Details_${formatReportDate(new Date(), "DD-MM-YYYY")}`,
        "Patient Visit Details"
      );
      return;
    }

    const exportData = opVisitRows.map((record, index) => ({
      "S.No": index + 1,
      "IP No": record.ipNo,
      "Major Token": record.majorToken,
      Department: record.department,
      Doctor: record.doctor,
      "Visit Date": record.visitDate,
      "Is Admitted": record.isAdmitted ? "Yes" : "No",
      Diagnosis: record.diagnosis
    }));

    exportToExcel(
      exportData,
      `Patient_Visit_Details_${formatReportDate(new Date(), "DD-MM-YYYY")}`,
      "Patient Visit Details"
    );
  };

  const opColumns = useMemo(() => ([
    {
      key: "slNo",
      label: "S No.",
      sortable: false,
      headerClassName: "text-center",
      className: "text-center",
      render: (_: any, __: PatientVisitRow, idx: number) => idx + 1
    },
    { key: "ipNo", label: "IP No", sortable: false, headerClassName: "text-center", className: "text-center" },
    { key: "majorToken", label: "Major Token", sortable: false, headerClassName: "text-center", className: "text-center" },
    { key: "department", label: "Department", sortable: false, headerClassName: "text-center", className: "text-center" },
    { key: "doctor", label: "Doctor", sortable: false, headerClassName: "text-center", className: "text-center" },
    { key: "visitDate", label: "Visit Date", sortable: false, headerClassName: "text-center", className: "text-center" },
    {
      key: "isAdmitted",
      label: "Is Admitted",
      sortable: false,
      headerClassName: "text-center",
      className: "text-center",
      render: (value: boolean) => (value ? "Yes" : "No")
    },
    { key: "diagnosis", label: "Diagnosis", sortable: false, headerClassName: "text-center", className: "text-center" }
  ]), []);

  const ipColumns = useMemo(() => ([
    {
      key: "slNo",
      label: "Sl.No",
      sortable: false,
      headerClassName: "text-center",
      className: "text-center",
      render: (_: any, __: IpVisitRow, idx: number) => idx + 1
    },
    { key: "ipNumber", label: "IP Number", sortable: false, headerClassName: "text-center", className: "text-center" },
    { key: "wardName", label: "Ward Name", sortable: false, headerClassName: "text-center", className: "text-center" },
    { key: "roomBed", label: "Room/Bed", sortable: false, headerClassName: "text-center", className: "text-center" },
    { key: "admissionDate", label: "Admission Date", sortable: false, headerClassName: "text-center", className: "text-center" },
    { key: "dischargeDate", label: "Discharge Date", sortable: false, headerClassName: "text-center", className: "text-center" }
  ]), []);

  const hasData = isSubmitted && (visitType === "ip" ? ipVisitRows.length > 0 : opVisitRows.length > 0);

  return (
    <React.Fragment>
      <Container fluid className="px-4 py-3">
        <ReportHeader
          title="Patient Visit Details"
          subtitle={
            hasData
              ? `OP No: ${patientInfo?.opNo || "-"}`
              : "Enter OP Number and choose visit type"
          }
          onPrint={handlePrint}
          onExport={handleExport}
          showSearch={false}
          showSort={false}
          showPrint={hasData}
          showExport={hasData}
        />

        <Card className="mb-4 shadow-sm no-print">
          <Card.Body className="py-2">
            <Nav variant="tabs" activeKey={activeMainTab}>
              <Nav.Item>
                <Nav.Link eventKey="patient" onClick={() => setActiveMainTab("patient")}>
                  Patient Visit Details
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="department" onClick={() => setActiveMainTab("department")}>
                  Department OP
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Body>
        </Card>

        {activeMainTab === "patient" && (
          <>
            <Card className="mb-4 shadow-sm no-print">
              <Card.Body>
                <Form className="row g-3 align-items-end" onSubmit={handleFilterSubmit}>
                  <Form.Group as={Col} md={4} controlId="visitType">
                    <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>Visit Type</Form.Label>
                    <Form.Select
                      value={visitType}
                      onChange={(e) => setVisitType(e.target.value as VisitType)}
                    >
                      <option value="op">OP Visit</option>
                      <option value="ip">IP Visit</option>
                    </Form.Select>
                  </Form.Group>
                  <Form.Group as={Col} md={4} controlId="opNo">
                    <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>Enter OP No</Form.Label>
                    <Form.Control
                      type="text"
                      value={opNo}
                      onChange={(e) => setOpNo(e.target.value)}
                      placeholder="OP Number"
                    />
                  </Form.Group>
                  <Form.Group as={Col} md={4} className="d-flex align-items-end gap-2">
                    <Button type="submit" variant="primary" className="w-50" disabled={isLoading}>
                      {isLoading ? "Submitting..." : "Submit"}
                    </Button>
                    <Button type="button" variant="secondary" className="w-50" onClick={handleReset} disabled={isLoading}>
                      Reset
                    </Button>
                  </Form.Group>
                </Form>
              </Card.Body>
            </Card>

            {isLoading ? (
              <div className="text-center py-5 text-muted">
                <Spinner animation="border" role="status" />
                <div className="mt-3">Loading patient visit details...</div>
              </div>
            ) : (
              <>
                {patientInfo && (
                  <Card className="report-card mb-3" style={{ padding: "0.75rem" }}>
                    <Row className="g-3">
                      <Col md={4}>
                        <strong>Patient's Name:</strong> {patientInfo.name}
                      </Col>
                      <Col md={4}>
                        <strong>Age:</strong> {patientInfo.age}
                      </Col>
                      <Col md={4}>
                        <strong>Sex:</strong> {patientInfo.sex}
                      </Col>
                    </Row>
                  </Card>
                )}

                <Card className="report-card" style={{ padding: "0.75rem" }}>
                  <div
                    style={{
                      maxHeight: "calc(115vh - 500px)",
                      minHeight: "350px",
                      overflowY: "auto",
                      overflowX: "auto",
                      position: "relative"
                    }}
                  >
                    {visitType === "ip" ? (
                      <ReportTable<IpVisitRow>
                        data={ipVisitRows}
                        columns={ipColumns}
                        responsive={false}
                        emptyMessage={
                          !isSubmitted
                            ? "No data loaded. Please enter OP Number and click Submit."
                            : "No records found."
                        }
                      />
                    ) : (
                      <ReportTable<PatientVisitRow>
                        data={opVisitRows}
                        columns={opColumns}
                        responsive={false}
                        emptyMessage={
                          !isSubmitted
                            ? "No data loaded. Please enter OP Number and click Submit."
                            : "No records found."
                        }
                      />
                    )}
                  </div>

                  <div
                    style={{
                      padding: "0.5rem 1rem",
                      borderTop: "2px solid #e0e0e0",
                      background: "linear-gradient(to right, #f8f9fa, #ffffff)",
                      textAlign: "start"
                    }}
                  >
                    <small className="text-muted" style={{ fontWeight: "var(--font-weight-medium)" }}>
                      Total Data Rows: <strong>{visitType === "ip" ? ipVisitRows.length : opVisitRows.length}</strong>
                    </small>
                  </div>
                </Card>
              </>
            )}
          </>
        )}

        {activeMainTab === "department" && (
          <>
            <Card className="report-card mt-4 no-print" style={{ padding: "0.75rem" }}>
              <h5 className="mb-3">Yearly Department wise Patient Visits</h5>
              <Form className="row g-3 align-items-end" onSubmit={handleDepartmentSubmit}>
                <Form.Group as={Col} md={4} controlId="yearlyDeptYear">
                  <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>
                    Select Year
                  </Form.Label>
                  <Form.Select
                    value={yearlyDeptYear}
                    onChange={(e) => setYearlyDeptYear(Number(e.target.value))}
                  >
                    {yearOptions.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group as={Col} md={4} controlId="yearlyDeptId">
                  <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>
                    Select Department
                  </Form.Label>
                  <Form.Select
                    value={yearlyDeptId}
                    onChange={(e) => setYearlyDeptId(Number(e.target.value))}
                  >
                    {departmentOptions.map((department) => (
                      <option key={department.id} value={department.id}>
                        {department.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group as={Col} md={4} className="d-flex align-items-end gap-2">
                  <Button type="submit" variant="primary" className="w-50">
                    Submit
                  </Button>
                  <Button type="button" variant="secondary" className="w-50" onClick={handleDepartmentReset}>
                    Reset
                  </Button>
                </Form.Group>
              </Form>
            </Card>

            {yearlyDeptSubmitted && (
              <Card className="report-card mt-3" style={{ padding: "0.75rem" }}>
                <Row className="g-3 mb-2">
                  <Col md={6}>
                    <strong>Year : </strong>
                    <span className="text-primary">{yearlyDeptYear}</span>
                  </Col>
                  <Col md={6}>
                    <strong>Department : </strong>
                    <span className="text-primary">{selectedDepartmentName}</span>
                  </Col>
                </Row>

                <div style={{ maxHeight: "420px", overflowY: "auto", overflowX: "auto" }}>
                  <Table bordered hover className="reportTable mb-0">
                    <thead className="table-dark" style={{ position: "sticky", top: 0, zIndex: 1 }}>
                      <tr>
                        <th className="text-center">Sl.No</th>
                        <th className="text-center">OP No</th>
                        <th>Patient Name</th>
                        <th className="text-center">Sex</th>
                        <th className="text-center">Age</th>
                        <th className="text-center">First Visit Date</th>
                        <th className="text-center">Last Visit Date</th>
                        <th className="text-center">Reg. Visits</th>
                        <th className="text-center">Ref. Visits</th>
                        <th className="text-center">Total Visits</th>
                      </tr>
                    </thead>
                    <tbody>
                      {yearlyDepartmentRows.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="text-center text-muted py-4">
                            No records found.
                          </td>
                        </tr>
                      ) : (
                        yearlyDepartmentRows.map((row, index) => (
                          <tr key={row.id}>
                            <td className="text-center">{index + 1}</td>
                            <td className="text-center">{row.opNo}</td>
                            <td>{row.patientName}</td>
                            <td className="text-center">{row.sex}</td>
                            <td className="text-center">{row.age}</td>
                            <td className="text-center">{row.firstVisitDate}</td>
                            <td className="text-center">{row.lastVisitDate}</td>
                            <td className="text-center">{row.regVisits}</td>
                            <td className="text-center">{row.refVisits}</td>
                            <td className="text-center">{row.regVisits + row.refVisits}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                    {yearlyDepartmentRows.length > 0 && (
                      <tfoot>
                        <tr style={{ backgroundColor: "#336699", color: "#ffffff" }}>
                          <td colSpan={7} className="text-end fw-bold">
                            Total :
                          </td>
                          <td className="text-center fw-bold">{finRegTotal}</td>
                          <td className="text-center fw-bold">{finRefTotal}</td>
                          <td className="text-center fw-bold">{finRegTotal + finRefTotal}</td>
                        </tr>
                      </tfoot>
                    )}
                  </Table>
                </div>

                <div className="mt-2">
                  <Badge bg="primary">Rows: {yearlyDepartmentRows.length}</Badge>
                </div>
              </Card>
            )}
          </>
        )}
      </Container>
    </React.Fragment>
  );
}
