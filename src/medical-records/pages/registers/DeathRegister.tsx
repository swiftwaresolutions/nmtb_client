import React, { useState, useMemo } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  Row,
  Col,
  Alert,
  Spinner,
} from "react-bootstrap";
import ReportHeader from "../../components/ReportHeader";
import ReportKPICard from "../../components/ReportKPICard";
import ReportTable from "../../components/ReportTable";
import {
  searchTableData,
  sortTableData,
  exportToExcel,
  printReport,
  formatReportDate,
  getDateRangeText,
} from "../../utils/reportUtils";
import "../../styles/reportStyles.css";
import { showValidationError } from "../../../utils/alertUtil";

// ─── Demo data ────────────────────────────────────────────────────────────────
const DEMO_RECORDS = [
  {
    slNo: 1,
    opNo: "OP-20241",
    deathNo: "D-001",
    ipNo: "IP-10231",
    patientName: "Ramesh Kumar",
    sex: "Male",
    age: "58 Y",
    fatherGuardian: "Suresh Kumar",
    address: "12, Gandhi Nagar, Coimbatore [Taluk], Coimbatore [Dist]",
    phone: "9876543210",
    diagnosis: "Acute Myocardial Infarction",
    causeOfDeath: "Cardiac Arrest",
    expDate: "10/01/2025",
    expTime: "03:45 AM",
  },
  {
    slNo: 2,
    opNo: "OP-20255",
    deathNo: "D-002",
    ipNo: "IP-10245",
    patientName: "Meena Devi",
    sex: "Female",
    age: "72 Y",
    fatherGuardian: "Murugan S",
    address: "45, Anna Street, Tirupur [Taluk], Tirupur [Dist]",
    phone: "9823456780",
    diagnosis: "Cerebrovascular Accident",
    causeOfDeath: "Brain Stroke",
    expDate: "12/01/2025",
    expTime: "11:20 PM",
  },
  {
    slNo: 3,
    opNo: "OP-20300",
    deathNo: "D-003",
    ipNo: "IP-10290",
    patientName: "Arun Selvam",
    sex: "Male",
    age: "45 Y",
    fatherGuardian: "Selvam R",
    address: "78, Nehru Road, Erode [Taluk], Erode [Dist]",
    phone: "9712345678",
    diagnosis: "Septicemia",
    causeOfDeath: "Multi-Organ Failure",
    expDate: "15/01/2025",
    expTime: "06:10 AM",
  },
  {
    slNo: 4,
    opNo: "OP-20350",
    deathNo: "D-004",
    ipNo: "IP-10310",
    patientName: "Lakshmi Bai",
    sex: "Female",
    age: "65 Y",
    fatherGuardian: "Balasubramanian V",
    address: "23, Temple Street, Salem [Taluk], Salem [Dist]",
    phone: "9600112233",
    diagnosis: "Chronic Kidney Disease",
    causeOfDeath: "Renal Failure",
    expDate: "18/01/2025",
    expTime: "02:30 PM",
  },
  {
    slNo: 5,
    opNo: "OP-20401",
    deathNo: "D-005",
    ipNo: "IP-10360",
    patientName: "Karthik Raj",
    sex: "Male",
    age: "34 Y",
    fatherGuardian: "Rajendran P",
    address: "56, Market Road, Namakkal [Taluk], Namakkal [Dist]",
    phone: "9585001122",
    diagnosis: "Road Traffic Accident",
    causeOfDeath: "Traumatic Brain Injury",
    expDate: "20/01/2025",
    expTime: "08:55 PM",
  },
];
// ─────────────────────────────────────────────────────────────────────────────

const TABLE_COLUMNS = [
  { key: "slNo", label: "Sl.No", sortable: false, render: (_: any, __: any, idx: number) => idx + 1 },
  { key: "opNo", label: "OP No.", sortable: true },
  { key: "deathNo", label: "Death No.", sortable: true },
  { key: "ipNo", label: "IP No.", sortable: true },
  { key: "patientName", label: "Patient Name", sortable: true },
  { key: "sexAge", label: "Sex / Age", sortable: false, render: (r: any) => r ? `${r.sex} / ${r.age}` : "" },
  { key: "fatherGuardian", label: "Father / Guardian", sortable: true },
  { key: "address", label: "Address", sortable: false },
  { key: "phone", label: "Phone Number", sortable: false },
  { key: "diagnosis", label: "Diagnosis", sortable: true },
  { key: "causeOfDeath", label: "Cause of Death", sortable: true },
  { key: "expDate", label: "Exp. Date", sortable: true },
  { key: "expTime", label: "Exp. Time", sortable: false },
];

export default function DeathRegister() {
  const today = new Date().toISOString().split("T")[0];

  // Filter state
  const [fromDate, setFromDate] = useState<string>(today);
  const [toDate, setToDate] = useState<string>(today);

  // Data state
  const [allRecords, setAllRecords] = useState<any[]>([]);
  const [displayedData, setDisplayedData] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);

  // Search & sort state
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortKey, setSortKey] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Stats
  const stats = useMemo(() => {
    const male = allRecords.filter((r) => r.sex === "Male").length;
    const female = allRecords.filter((r) => r.sex === "Female").length;
    return { total: allRecords.length, male, female };
  }, [allRecords]);

  // Refresh displayed data on search/sort change
  React.useEffect(() => {
    let result = [...allRecords];
    if (searchTerm) {
      result = searchTableData(result, searchTerm, [
        "opNo", "deathNo", "ipNo", "patientName", "fatherGuardian",
        "address", "phone", "diagnosis", "causeOfDeath",
      ]);
    }
    if (sortKey) {
      result = sortTableData(result, sortKey, sortDirection);
    }
    setDisplayedData(result);
  }, [searchTerm, sortKey, sortDirection, allRecords]);

  // Handle form submit (uses demo data)
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

    // Simulate API delay with demo data
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
    setSortKey("");
    setSortDirection("asc");
    setError(null);
    setSubmitted(false);
  };

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const handleExport = () => {
    const exportData = displayedData.map((r, i) => ({
      "S.No": i + 1,
      "OP No.": r.opNo,
      "Death No.": r.deathNo,
      "IP No.": r.ipNo,
      "Patient Name": r.patientName,
      "Sex": r.sex,
      "Age": r.age,
      "Father / Guardian": r.fatherGuardian,
      "Address": r.address,
      "Phone Number": r.phone,
      "Diagnosis": r.diagnosis,
      "Cause of Death": r.causeOfDeath,
      "Exp. Date": r.expDate,
      "Exp. Time": r.expTime,
    }));
    exportToExcel(
      exportData,
      `Death_Register_${formatReportDate(new Date(), "DD-MM-YYYY")}`,
      "Death Register"
    );
  };

  return (
    <React.Fragment>
      <Container fluid className="px-4 py-3">
        {/* Report Header */}
        <ReportHeader
          title="Death Register"
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
                  max={today}
                  required
                />
              </Form.Group>
              <Form.Group as={Col} md={4} controlId="toDate">
                <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>To Date</Form.Label>
                <Form.Control
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  max={today}
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
            <Col md={3}>
              <ReportKPICard label="Total Deaths" value={stats.total} variant="primary" />
            </Col>
            <Col md={3}>
              <ReportKPICard label="Male" value={stats.male} variant="info" />
            </Col>
            <Col md={3}>
              <ReportKPICard label="Female" value={stats.female} variant="danger" />
            </Col>
          </Row>
        )}

        {/* Table */}
        {loading ? (
          <div className="text-center py-5 text-muted">
            <Spinner animation="border" role="status" />
            <div className="mt-3">Loading death register...</div>
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
                data={displayedData}
                columns={TABLE_COLUMNS}
                onSort={handleSort}
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
                Total Data Rows: <strong>{displayedData.length}</strong>
                {searchTerm && (
                  <span className="ms-2">(Filtered from {allRecords.length})</span>
                )}
              </small>
            </div>
          </Card>
        )}
      </Container>
    </React.Fragment>
  );
}
