import React, { useState, useMemo } from "react";
import { Container, Card, Form, Button, Row, Col, Modal, Spinner, Alert } from "react-bootstrap";
import ReportHeader from "../../components/ReportHeader";
import ReportKPICard from "../../components/ReportKPICard";
import ReportTable from "../../components/ReportTable";
import {
  searchTableData,
  sortTableData,
  exportToExcel,
  printReport,
  getDateRangeText,
} from "../../utils/reportUtils";
import "../../styles/reportStyles.css";
import { showValidationError } from "../../../utils/alertUtil";

// ─── Interfaces ───────────────────────────────────────────────────────────────
interface PatientDetail {
  name: string;
  sex: string;
  dob: string;
  fatherName: string;
  address: string;
  occupation: string;
  salary: string;
  religion: string;
  cardType: string;
  ageGroup: string;
}

interface OpRecord {
  slNo: number;
  consultant: string;
  tokMNo: string;
  opNo: string;
  patientName: string;
  village: string;
  hamlet: string;
  head: string;
  dateTime: string;
  details: PatientDetail;
}

// ─── Demo data ────────────────────────────────────────────────────────────────
const DEMO_RECORDS: OpRecord[] = [
  {
    slNo: 1, consultant: "Dr. Kumar",  tokMNo: "12 / 4587", opNo: "OP1001",
    patientName: "Mr. Ravi",      village: "Salem",      hamlet: "East Street",   head: "Self",
    dateTime: "15-02-2026 / 10:30 AM",
    details: { name: "Ravi Kumar",    sex: "Male",   dob: "12-05-1990", fatherName: "Mr. Ramesh",
               address: "12, East Street, Salem",      occupation: "Engineer",    salary: "₹35,000",
               religion: "Hindu",   cardType: "General",       ageGroup: "Adult" },
  },
  {
    slNo: 2, consultant: "Dr. Meena",  tokMNo: "18 / 4599", opNo: "OP1002",
    patientName: "Mrs. Lakshmi",  village: "Madurai",    hamlet: "North Colony",  head: "Husband",
    dateTime: "20-02-2026 / 12:15 PM",
    details: { name: "Lakshmi Raj",   sex: "Female", dob: "08-11-1985", fatherName: "Mr. Suresh",
               address: "45, North Colony, Madurai",   occupation: "Teacher",     salary: "₹28,000",
               religion: "Hindu",   cardType: "General",       ageGroup: "Adult" },
  },
  {
    slNo: 3, consultant: "Dr. Ramesh", tokMNo: "05 / 3210", opNo: "OP1003",
    patientName: "Mr. Arjun",     village: "Trichy",     hamlet: "West Nagar",    head: "Self",
    dateTime: "21-02-2026 / 09:00 AM",
    details: { name: "Arjun Selvan",  sex: "Male",   dob: "22-07-1992", fatherName: "Mr. Selvan",
               address: "88, West Nagar, Trichy",      occupation: "Mechanic",    salary: "₹18,000",
               religion: "Hindu",   cardType: "BPL",           ageGroup: "Adult" },
  },
  {
    slNo: 4, consultant: "Dr. Priya",  tokMNo: "30 / 5012", opNo: "OP1004",
    patientName: "Mrs. Kavitha",  village: "Coimbatore", hamlet: "RS Puram",      head: "Son",
    dateTime: "22-02-2026 / 11:00 AM",
    details: { name: "Kavitha Mohan", sex: "Female", dob: "14-03-1958", fatherName: "Mr. Mohan",
               address: "3, RS Puram, Coimbatore",     occupation: "Housewife",   salary: "N/A",
               religion: "Christian", cardType: "Senior Citizen", ageGroup: "Senior" },
  },
  {
    slNo: 5, consultant: "Dr. Arun",   tokMNo: "09 / 4788", opNo: "OP1005",
    patientName: "Mr. Vignesh",   village: "Chennai",    hamlet: "Anna Nagar",    head: "Self",
    dateTime: "23-02-2026 / 02:30 PM",
    details: { name: "Vignesh Raj",   sex: "Male",   dob: "01-01-2000", fatherName: "Mr. Raj",
               address: "7, Anna Nagar, Chennai",      occupation: "Student",     salary: "N/A",
               religion: "Hindu",   cardType: "General",       ageGroup: "Adult" },
  },
  {
    slNo: 6, consultant: "Dr. Selvi",  tokMNo: "22 / 5234", opNo: "OP1006",
    patientName: "Mrs. Padma",    village: "Erode",      hamlet: "Periyar Nagar", head: "Daughter",
    dateTime: "24-02-2026 / 10:00 AM",
    details: { name: "Padma Krishnan", sex: "Female", dob: "30-06-1950", fatherName: "Mr. Krishnan",
               address: "22, Periyar Nagar, Erode",    occupation: "Retired",     salary: "₹12,000",
               religion: "Hindu",   cardType: "Senior Citizen", ageGroup: "Senior" },
  },
  {
    slNo: 7, consultant: "Dr. Kumar",  tokMNo: "14 / 4901", opNo: "OP1007",
    patientName: "Mr. Suresh",    village: "Vellore",    hamlet: "Gandhi Road",   head: "Self",
    dateTime: "25-02-2026 / 03:00 PM",
    details: { name: "Suresh Babu",   sex: "Male",   dob: "17-09-1988", fatherName: "Mr. Babu",
               address: "56, Gandhi Road, Vellore",    occupation: "Businessman", salary: "₹55,000",
               religion: "Muslim",  cardType: "General",       ageGroup: "Adult" },
  },
  {
    slNo: 8, consultant: "Dr. Meena",  tokMNo: "27 / 5100", opNo: "OP1008",
    patientName: "Baby Ananya",   village: "Tirunelveli", hamlet: "Court Road",  head: "Father",
    dateTime: "26-02-2026 / 09:45 AM",
    details: { name: "Ananya Raj",    sex: "Female", dob: "10-10-2018", fatherName: "Mr. Raj Kumar",
               address: "10, Court Road, Tirunelveli", occupation: "N/A",         salary: "N/A",
               religion: "Hindu",   cardType: "General",       ageGroup: "Child" },
  },
];

// ─── Table Columns ────────────────────────────────────────────────────────────
const TABLE_COLUMNS = [
  { key: "slNo",        label: "S.No",        sortable: false },
  { key: "consultant",  label: "Consultant",  sortable: true  },
  { key: "tokMNo",      label: "Tok / M.No",  sortable: false },
  { key: "opNo",        label: "OP No",       sortable: true  },
  { key: "patientName", label: "Patient Name",sortable: true  },
  { key: "village",     label: "Village",     sortable: true  },
  { key: "hamlet",      label: "Hamlet",      sortable: false },
  { key: "head",        label: "Head",        sortable: false },
  { key: "dateTime",    label: "Date / Time", sortable: false },
];

// ─── Component ────────────────────────────────────────────────────────────────
const OldOpRegisterRegular: React.FC = () => {
  const today = new Date().toISOString().split("T")[0];

  const [fromDate, setFromDate]   = useState<string>(today);
  const [toDate, setToDate]       = useState<string>(today);
  const [allRecords, setAllRecords]       = useState<OpRecord[]>([]);
  const [displayedData, setDisplayedData] = useState<OpRecord[]>([]);
  const [loading, setLoading]     = useState<boolean>(false);
  const [error, setError]         = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const [searchTerm, setSearchTerm]       = useState<string>("");
  const [sortConfig, setSortConfig]       = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

  const [showModal, setShowModal]         = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<PatientDetail | null>(null);

  // ── Processed display data ────────────────────────────────────────────────
  const processedData = useMemo(() => {
    let data = [...displayedData];
    if (searchTerm) {
      data = searchTableData(data, searchTerm, ["opNo", "patientName", "consultant", "village"]);
    }
    if (sortConfig) {
      data = sortTableData(data, sortConfig.key as keyof OpRecord, sortConfig.direction);
    }
    return data;
  }, [displayedData, searchTerm, sortConfig]);

  // ── KPIs ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:  allRecords.length,
    male:   allRecords.filter((r) => r.details.sex === "Male").length,
    female: allRecords.filter((r) => r.details.sex === "Female").length,
  }), [allRecords]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromDate || !toDate) {
      showValidationError("Please select both From Date and To Date.", "Validation");
      return;
    }
    if (fromDate > toDate) {
      showValidationError("From Date cannot be later than To Date.", "Validation");
      return;
    }
    setError(null);
    setLoading(true);
    setSubmitted(false);
    setTimeout(() => {
      setAllRecords(DEMO_RECORDS);
      setDisplayedData(DEMO_RECORDS);
      setSubmitted(true);
      setLoading(false);
    }, 600);
  };

  const handleReset = () => {
    setFromDate(today);
    setToDate(today);
    setAllRecords([]);
    setDisplayedData([]);
    setSearchTerm("");
    setSortConfig(null);
    setError(null);
    setSubmitted(false);
  };

  const handleSort = (key: string, direction: "asc" | "desc") => {
    setSortConfig({ key, direction });
  };

  const handleRowClick = (record: OpRecord) => {
    setSelectedPatient(record.details);
    setShowModal(true);
  };

  const handleExport = () => {
    const exportData = processedData.map((r) => ({
      "S.No":         r.slNo,
      "Consultant":   r.consultant,
      "Tok / M.No":   r.tokMNo,
      "OP No":        r.opNo,
      "Patient Name": r.patientName,
      "Village":      r.village,
      "Hamlet":       r.hamlet,
      "Head":         r.head,
      "Date / Time":  r.dateTime,
    }));
    exportToExcel(exportData, "OPRegister_Regular");
  };

  return (
    <React.Fragment>
      <Container fluid className="px-4 py-3">
        {/* Report Header */}
        <ReportHeader
          title="Repeat O.P Patient Register"
          subtitle={
            submitted
              ? getDateRangeText(fromDate, toDate)
              : "Select date range and click Submit"
          }
          onPrint={printReport}
          onExport={handleExport}
          onSearch={(term) => setSearchTerm(term)}
          showSearch={submitted}
          showSort={false}
          showPrint={submitted}
          showExport={submitted}
        />

        {error && (
          <Alert variant="danger" className="mt-3">
            {error}
          </Alert>
        )}

        {/* Filter Form */}
        <Card className="mb-4 shadow-sm no-print">
          <Card.Body>
            <Form className="row g-3 align-items-end" onSubmit={handleFilterSubmit}>
              <Form.Group as={Col} md={4} controlId="fromDate">
                <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>From Date</Form.Label>
                <Form.Control
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group as={Col} md={4} controlId="toDate">
                <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>To Date</Form.Label>
                <Form.Control
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group as={Col} md={4} className="d-flex align-items-end gap-2">
                <Button type="submit" variant="primary" className="w-50" disabled={loading}>
                  {loading ? "Loading..." : "Submit"}
                </Button>
                <Button type="button" variant="secondary" className="w-50" onClick={handleReset}>
                  Reset
                </Button>
              </Form.Group>
            </Form>
          </Card.Body>
        </Card>

        {/* KPI Cards */}
        {submitted && (
          <Row className="mb-4">
            <Col md={4}>
              <ReportKPICard label="Total Records" value={stats.total} variant="primary" />
            </Col>
            <Col md={4}>
              <ReportKPICard label="Male Patients" value={stats.male} variant="info" />
            </Col>
            <Col md={4}>
              <ReportKPICard label="Female Patients" value={stats.female} variant="danger" />
            </Col>
          </Row>
        )}

        {/* Table */}
        {loading ? (
          <div className="text-center py-5 text-muted">
            <Spinner animation="border" role="status" />
            <div className="mt-3">Loading register data...</div>
          </div>
        ) : (
          <Card className="report-card" style={{ padding: "0.75rem" }}>
            <div
              style={{
                maxHeight: "calc(115vh - 500px)",
                minHeight: "350px",
                overflowY: "auto",
                overflowX: "auto",
                position: "relative",
              }}
            >
              <ReportTable
                data={processedData}
                columns={TABLE_COLUMNS}
                onSort={handleSort}
                onRowClick={handleRowClick}
                responsive={false}
                emptyMessage={
                  !submitted
                    ? "No data loaded. Please select date range and click Submit."
                    : searchTerm
                    ? "No records match your search criteria."
                    : "No records found."
                }
              />
            </div>
            <div
              style={{
                padding: "0.5rem 1rem",
                borderTop: "2px solid #e0e0e0",
                background: "linear-gradient(to right, #f8f9fa, #ffffff)",
                textAlign: "start",
              }}
            >
              <small className="text-muted" style={{ fontWeight: "var(--font-weight-medium)" }}>
                Total Data Rows: <strong>{processedData.length}</strong>
                {searchTerm && (
                  <span className="ms-2">(Filtered from {allRecords.length})</span>
                )}
              </small>
            </div>
          </Card>
        )}
      </Container>

      {/* Patient Details Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} centered size="lg">
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="h5">Patient Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPatient && (
            <div className="p-2">
              <Row className="mb-3">
                <Col md={6}>
                  <label className="small text-muted d-block">Name</label>
                  <span className="fw-bold">{selectedPatient.name}</span>
                </Col>
                <Col md={6}>
                  <label className="small text-muted d-block">Sex</label>
                  <span>{selectedPatient.sex}</span>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={6}>
                  <label className="small text-muted d-block">Date of Birth</label>
                  <span>{selectedPatient.dob}</span>
                </Col>
                <Col md={6}>
                  <label className="small text-muted d-block">Father Name</label>
                  <span>{selectedPatient.fatherName}</span>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={12}>
                  <label className="small text-muted d-block">Address</label>
                  <span>{selectedPatient.address}</span>
                </Col>
              </Row>
              <hr className="my-3" />
              <Row className="mb-3">
                <Col md={4}>
                  <label className="small text-muted d-block">Occupation</label>
                  <span>{selectedPatient.occupation}</span>
                </Col>
                <Col md={4}>
                  <label className="small text-muted d-block">Salary</label>
                  <span>{selectedPatient.salary}</span>
                </Col>
                <Col md={4}>
                  <label className="small text-muted d-block">Religion</label>
                  <span>{selectedPatient.religion}</span>
                </Col>
              </Row>
              <Row className="mb-3">
                <Col md={4}>
                  <label className="small text-muted d-block">Card Type</label>
                  <span>{selectedPatient.cardType}</span>
                </Col>
                <Col md={4}>
                  <label className="small text-muted d-block">Age Group</label>
                  <span>{selectedPatient.ageGroup}</span>
                </Col>
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </React.Fragment>
  );
};

export default OldOpRegisterRegular;
