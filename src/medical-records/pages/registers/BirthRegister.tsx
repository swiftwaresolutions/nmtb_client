import React, { useState, useMemo } from "react";
import { Container, Card, Form, Button, Row, Col, Badge, Spinner, Alert } from "react-bootstrap";
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

// ─── Interface ────────────────────────────────────────────────────────────────
interface BirthRecord {
  sNo: number;
  motherName: string;
  fatherName: string;
  babyGender: string;
  dateOfBirth: string;
  timeOfBirth: string;
  ward: string;
  consultant: string;
  ipNo: string;
  status: string;
}

// ─── Demo data ────────────────────────────────────────────────────────────────
const DEMO_RECORDS: BirthRecord[] = [
  { sNo: 1,  motherName: "Mrs. Lakshmi Ravi",    fatherName: "Mr. Ravi Kumar",     babyGender: "Female", dateOfBirth: "02-02-2026", timeOfBirth: "06:15 AM", ward: "Maternity Ward",  consultant: "Dr. Priya",  ipNo: "IP2001", status: "Alive"      },
  { sNo: 2,  motherName: "Mrs. Kavitha Suresh",   fatherName: "Mr. Suresh Babu",    babyGender: "Male",   dateOfBirth: "05-02-2026", timeOfBirth: "09:30 AM", ward: "Labour Room",     consultant: "Dr. Selvi",  ipNo: "IP2002", status: "Alive"      },
  { sNo: 3,  motherName: "Mrs. Meena Arjun",      fatherName: "Mr. Arjun Raj",      babyGender: "Male",   dateOfBirth: "07-02-2026", timeOfBirth: "11:45 PM", ward: "Maternity Ward",  consultant: "Dr. Priya",  ipNo: "IP2003", status: "Alive"      },
  { sNo: 4,  motherName: "Mrs. Saranya Vijay",    fatherName: "Mr. Vijay Kumar",    babyGender: "Female", dateOfBirth: "10-02-2026", timeOfBirth: "03:20 AM", ward: "Labour Room",     consultant: "Dr. Meena",  ipNo: "IP2004", status: "Still Born" },
  { sNo: 5,  motherName: "Mrs. Divya Mohan",      fatherName: "Mr. Mohan Das",      babyGender: "Male",   dateOfBirth: "12-02-2026", timeOfBirth: "07:00 AM", ward: "Maternity Ward",  consultant: "Dr. Selvi",  ipNo: "IP2005", status: "Alive"      },
  { sNo: 6,  motherName: "Mrs. Padma Krishnan",   fatherName: "Mr. Krishnan Nadar", babyGender: "Female", dateOfBirth: "14-02-2026", timeOfBirth: "01:10 PM", ward: "Labour Room",     consultant: "Dr. Priya",  ipNo: "IP2006", status: "Alive"      },
  { sNo: 7,  motherName: "Mrs. Anitha Selvam",    fatherName: "Mr. Selvam Raj",     babyGender: "Male",   dateOfBirth: "16-02-2026", timeOfBirth: "08:50 AM", ward: "Maternity Ward",  consultant: "Dr. Meena",  ipNo: "IP2007", status: "Death"      },
  { sNo: 8,  motherName: "Mrs. Rekha Senthil",    fatherName: "Mr. Senthil Kumar",  babyGender: "Female", dateOfBirth: "18-02-2026", timeOfBirth: "10:30 PM", ward: "Labour Room",     consultant: "Dr. Selvi",  ipNo: "IP2008", status: "Alive"      },
  { sNo: 9,  motherName: "Mrs. Pooja Ganesh",     fatherName: "Mr. Ganesh Raj",     babyGender: "Male",   dateOfBirth: "20-02-2026", timeOfBirth: "04:15 AM", ward: "Maternity Ward",  consultant: "Dr. Priya",  ipNo: "IP2009", status: "Alive"      },
  { sNo: 10, motherName: "Mrs. Nithya Prasad",    fatherName: "Mr. Prasad Nair",    babyGender: "Female", dateOfBirth: "22-02-2026", timeOfBirth: "12:00 PM", ward: "Labour Room",     consultant: "Dr. Meena",  ipNo: "IP2010", status: "Alive"      },
  { sNo: 11, motherName: "Mrs. Suganya Arun",     fatherName: "Mr. Arun Babu",      babyGender: "Male",   dateOfBirth: "24-02-2026", timeOfBirth: "05:45 AM", ward: "Maternity Ward",  consultant: "Dr. Selvi",  ipNo: "IP2011", status: "Still Born" },
  { sNo: 12, motherName: "Mrs. Geetha Murugan",   fatherName: "Mr. Murugan Raj",    babyGender: "Female", dateOfBirth: "26-02-2026", timeOfBirth: "02:30 PM", ward: "Labour Room",     consultant: "Dr. Priya",  ipNo: "IP2012", status: "Alive"      },
];

// ─── Table Columns ────────────────────────────────────────────────────────────
const STATUS_VARIANT: Record<string, string> = {
  Alive:       "success",
  Death:       "danger",
  "Still Born":"warning",
};

const TABLE_COLUMNS = [
  { key: "sNo",         label: "S.No",           sortable: false },
  { key: "ipNo",        label: "IP No",          sortable: true  },
  { key: "motherName",  label: "Mother's Name",  sortable: true  },
  { key: "fatherName",  label: "Father's Name",  sortable: true  },
  { key: "babyGender",  label: "Baby Gender",    sortable: true  },
  { key: "dateOfBirth", label: "Date of Birth",  sortable: true  },
  { key: "timeOfBirth", label: "Time of Birth",  sortable: false },
  { key: "ward",        label: "Ward",           sortable: true  },
  { key: "consultant",  label: "Consultant",     sortable: true  },
  {
    key: "status",
    label: "Status",
    sortable: true,
    render: (val: string) => (
      <Badge bg={STATUS_VARIANT[val] ?? "secondary"}>{val}</Badge>
    ),
  },
];

// ─── Component ────────────────────────────────────────────────────────────────
const BirthRegister: React.FC = () => {
  const today = new Date().toISOString().split("T")[0];

  const [fromDate, setFromDate]   = useState<string>(today);
  const [toDate, setToDate]       = useState<string>(today);
  const [status, setStatus]       = useState<string>("all");
  const [gender, setGender]       = useState<string>("all");

  const [allRecords, setAllRecords]       = useState<BirthRecord[]>([]);
  const [baseFiltered, setBaseFiltered]   = useState<BirthRecord[]>([]);
  const [loading, setLoading]             = useState<boolean>(false);
  const [error, setError]                 = useState<string | null>(null);
  const [submitted, setSubmitted]         = useState<boolean>(false);

  const [searchTerm, setSearchTerm]       = useState<string>("");
  const [sortConfig, setSortConfig]       = useState<{ key: string; direction: "asc" | "desc" } | null>(null);

  // ── Processed data (search + sort on top of status/gender filtered) ───────
  const processedData = useMemo(() => {
    let data = [...baseFiltered];
    if (searchTerm) {
      data = searchTableData(data, searchTerm, ["ipNo", "motherName", "fatherName", "consultant", "ward"]);
    }
    if (sortConfig) {
      data = sortTableData(data, sortConfig.key as keyof BirthRecord, sortConfig.direction);
    }
    return data;
  }, [baseFiltered, searchTerm, sortConfig]);

  // ── KPIs ─────────────────────────────────────────────────────────────────
  const stats = useMemo(() => ({
    total:     allRecords.length,
    male:      allRecords.filter((r) => r.babyGender === "Male").length,
    female:    allRecords.filter((r) => r.babyGender === "Female").length,
    alive:     allRecords.filter((r) => r.status === "Alive").length,
    death:     allRecords.filter((r) => r.status === "Death").length,
    stillBorn: allRecords.filter((r) => r.status === "Still Born").length,
  }), [allRecords]);

  // ── Handlers ─────────────────────────────────────────────────────────────
  const applyDropdownFilters = (records: BirthRecord[], stat: string, gen: string) => {
    return records.filter((r) => {
      const statusMatch = stat === "all" || r.status === stat;
      const genderMatch = gen  === "all" || r.babyGender.toLowerCase() === gen.toLowerCase();
      return statusMatch && genderMatch;
    });
  };

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
      setBaseFiltered(applyDropdownFilters(DEMO_RECORDS, status, gender));
      setSubmitted(true);
      setLoading(false);
    }, 600);
  };

  const handleReset = () => {
    setFromDate(today);
    setToDate(today);
    setStatus("all");
    setGender("all");
    setAllRecords([]);
    setBaseFiltered([]);
    setSearchTerm("");
    setSortConfig(null);
    setError(null);
    setSubmitted(false);
  };

  const handleSort = (key: string, direction: "asc" | "desc") => {
    setSortConfig({ key, direction });
  };

  const handleExport = () => {
    const exportData = processedData.map((r) => ({
      "S.No":          r.sNo,
      "IP No":         r.ipNo,
      "Mother's Name": r.motherName,
      "Father's Name": r.fatherName,
      "Baby Gender":   r.babyGender,
      "Date of Birth": r.dateOfBirth,
      "Time of Birth": r.timeOfBirth,
      "Ward":          r.ward,
      "Consultant":    r.consultant,
      "Status":        r.status,
    }));
    exportToExcel(exportData, "Birth_Register");
  };

  return (
    <React.Fragment>
      <Container fluid className="px-4 py-3">
        {/* Report Header */}
        <ReportHeader
          title="Birth Register"
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
              <Form.Group as={Col} md={3} controlId="fromDate">
                <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>From Date</Form.Label>
                <Form.Control
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group as={Col} md={3} controlId="toDate">
                <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>To Date</Form.Label>
                <Form.Control
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group as={Col} md={2} controlId="status">
                <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>Status</Form.Label>
                <Form.Select value={status} onChange={(e) => setStatus(e.target.value)}>
                  <option value="all">All</option>
                  <option value="Alive">Alive</option>
                  <option value="Death">Death</option>
                  <option value="Still Born">Still Born</option>
                </Form.Select>
              </Form.Group>
              <Form.Group as={Col} md={2} controlId="gender">
                <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>Gender</Form.Label>
                <Form.Select value={gender} onChange={(e) => setGender(e.target.value)}>
                  <option value="all">All</option>
                  <option value="male">Male</option>
                  <option value="Female">Female</option>
                </Form.Select>
              </Form.Group>
              <Form.Group as={Col} md={2} className="d-flex align-items-end gap-2">
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
            <Col md={2}>
              <ReportKPICard label="Total Births"  value={stats.total}     variant="primary" />
            </Col>
            <Col md={2}>
              <ReportKPICard label="Male"          value={stats.male}      variant="info"    />
            </Col>
            <Col md={2}>
              <ReportKPICard label="Female"        value={stats.female}    variant="warning" />
            </Col>
            <Col md={2}>
              <ReportKPICard label="Alive"         value={stats.alive}     variant="success" />
            </Col>
            <Col md={2}>
              <ReportKPICard label="Death"         value={stats.death}     variant="danger"  />
            </Col>
            <Col md={2}>
              <ReportKPICard label="Still Born"    value={stats.stillBorn} variant="warning" />
            </Col>
          </Row>
        )}

        {/* Table */}
        {loading ? (
          <div className="text-center py-5 text-muted">
            <Spinner animation="border" role="status" />
            <div className="mt-3">Loading birth register...</div>
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
    </React.Fragment>
  );
};

export default BirthRegister;
