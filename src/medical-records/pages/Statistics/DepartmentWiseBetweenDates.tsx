import React, { useState, useMemo, useEffect } from "react";
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
} from "../../utils/reportUtils";
import "../../styles/reportStyles.css";
import { showValidationError } from "../../../utils/alertUtil";
import MedicalRecordsApiService, {
  DepartmentStatisticsApiItem,
} from "../../../api/medical-records/medical-records-api-service";

const TABLE_COLUMNS = [
  { key: "slNo",          label: "Sl.No",         sortable: false, render: (_: any, __: any, idx: number) => idx + 1 },
  { key: "opNo",          label: "OP No.",         sortable: true  },
  { key: "patientName",   label: "Patient Name",   sortable: true  },
  { key: "deptName",      label: "Department",     sortable: true  },
  { key: "datetime",      label: "Date & Time",    sortable: true  },
  { key: "tokenNoDept",   label: "Token (Dept)",   sortable: false },
  { key: "tokenNoDoctor", label: "Token (Doctor)", sortable: false },
  { key: "masterTokenNo", label: "Master Token",   sortable: false },
];

interface DeptWiseRecord {
  patientName:   string;
  opNo:          string;
  datetime:      string;
  tokenNoDept:   number;
  tokenNoDoctor: number;
  masterTokenNo: number;
  deptName:      string;
}

const normalizeData = (raw: DepartmentStatisticsApiItem[]): DeptWiseRecord[] =>
  raw.map((item) => ({
    patientName:   item.patientName   || "-",
    opNo:          item.opNo          || "-",
    datetime:      item.datetime
      ? (() => {
          const d = new Date(item.datetime);
          const date = d.toLocaleDateString("en-IN", { day: "2-digit", month: "2-digit", year: "numeric" });
          const time = d.toLocaleTimeString("en-IN", { hour: "2-digit", minute: "2-digit", hour12: true });
          return `${date} ${time}`;
        })()
      : "-",
    tokenNoDept:   item.tokenNoDept   ?? 0,
    tokenNoDoctor: item.tokenNoDoctor ?? 0,
    masterTokenNo: item.masterTokenNo ?? 0,
    deptName:      item.deptName      || "-",
  }));

export default function DepartmentWiseBetweenDates() {
  const today      = new Date().toISOString().split("T")[0];
  const nowTime    = new Date().toTimeString().slice(0, 8);
  const apiService = useMemo(() => new MedicalRecordsApiService(), []);

  // Departments (pre-loaded on mount)
  const [departments,        setDepartments]        = useState<{ id: number; name: string }[]>([]);
  const [departmentsLoading, setDepartmentsLoading] = useState<boolean>(false);

  useEffect(() => {
    const load = async () => {
      setDepartmentsLoading(true);
      try {
        const raw = await apiService.fetchAllDepartments();
        const active = (Array.isArray(raw) ? raw : [])
          .filter((d: any) => d.isActive === 1 || d.isActive === undefined || d.isActive === null)
          .sort((a: any, b: any) => a.id - b.id)
          .map((d: any) => ({ id: d.id, name: d.name }));
        setDepartments(active);
      } catch {
        // non-blocking
      } finally {
        setDepartmentsLoading(false);
      }
    };
    load();
  }, [apiService]);

  // Filter state
  const [selectedDeptId, setSelectedDeptId] = useState<number>(0);
  const [fromDate,       setFromDate]       = useState<string>(today);
  const [fromTime,       setFromTime]       = useState<string>("08:00:00");
  const [toDate,         setToDate]         = useState<string>(today);
  const [toTime,         setToTime]         = useState<string>(nowTime);

  // Data state
  const [allRecords, setAllRecords] = useState<DeptWiseRecord[]>([]);
  const [loading,    setLoading]    = useState(false);
  const [submitted,  setSubmitted]  = useState(false);
  const [error,      setError]      = useState<string | null>(null);

  // Search & sort
  const [searchTerm,    setSearchTerm]    = useState<string>("");
  const [sortKey,       setSortKey]       = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const displayData = useMemo(() => {
    let result = [...allRecords];
    if (searchTerm) {
      result = searchTableData(result, searchTerm, ["opNo", "patientName", "deptName", "datetime"]);
    }
    if (sortKey) {
      result = sortTableData(result, sortKey as keyof DeptWiseRecord, sortDirection);
    }
    return result;
  }, [allRecords, searchTerm, sortKey, sortDirection]);

  const stats = useMemo(() => ({
    total:       displayData.length,
    uniqueDepts: new Set(displayData.map((r) => r.deptName)).size,
  }), [displayData]);

  const selectedDeptName = useMemo(
    () => selectedDeptId === 0
      ? "All Departments"
      : (departments.find((d) => d.id === selectedDeptId)?.name ?? "All Departments"),
    [selectedDeptId, departments]
  );

  const handleSubmit = async (e: React.FormEvent) => {
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
    setSearchTerm("");
    setSortKey("");
    setSortDirection("asc");

    try {
      const raw = await apiService.fetchDepartmentStatistics(
        fromDate, fromTime, toDate, toTime, selectedDeptId
      );
      setAllRecords(normalizeData(raw));
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to load department statistics.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedDeptId(0);
    setFromDate(today);
    setFromTime("08:00:00");
    setToDate(today);
    setToTime(nowTime);
    setSearchTerm("");
    setSortKey("");
    setSortDirection("asc");
    setAllRecords([]);
    setSubmitted(false);
    setError(null);
  };

  const handleSort = (key: string, direction: "asc" | "desc") => {
    setSortKey(key);
    setSortDirection(direction);
  };

  const handleExport = () => {
    const data = displayData.map((r, i) => ({
      "Sl.No":          i + 1,
      "OP No.":         r.opNo,
      "Patient Name":   r.patientName,
      "Department":     r.deptName,
      "Date & Time":    r.datetime,
      "Token (Dept)":   r.tokenNoDept,
      "Token (Doctor)": r.tokenNoDoctor,
      "Master Token":   r.masterTokenNo,
    }));
    exportToExcel(
      data,
      `Dept_Wise_Between_Dates_${formatReportDate(new Date(), "DD-MM-YYYY")}`,
      "Department Statistics"
    );
  };

  const subtitle = submitted
    ? `${selectedDeptName}  |  ${fromDate} ${fromTime} — ${toDate} ${toTime}`
    : "Select filters and click Submit";

  return (
    <React.Fragment>
      <Container fluid className="px-4 py-3">
        <ReportHeader
          title="Department Statistics Between Dates"
          subtitle={subtitle}
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
            <Form className="row g-3 align-items-end" onSubmit={handleSubmit}>

              <Form.Group as={Col} md={2} controlId="department">
                <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>Department</Form.Label>
                <Form.Select
                  value={selectedDeptId}
                  onChange={(e) => setSelectedDeptId(Number(e.target.value))}
                  disabled={departmentsLoading}
                >
                  {departmentsLoading
                    ? <option>Loading...</option>
                    : <>
                        <option value={0}>All Departments</option>
                        {departments.map((d) => (
                          <option key={d.id} value={d.id}>{d.name}</option>
                        ))}
                      </>
                  }
                </Form.Select>
              </Form.Group>

              <Form.Group as={Col} md={2} controlId="fromDate">
                <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>From Date</Form.Label>
                <Form.Control
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  max={today}
                  required
                />
              </Form.Group>

              <Form.Group as={Col} md={2} controlId="fromTime">
                <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>From Time</Form.Label>
                <Form.Control
                  type="time"
                  step="1"
                  value={fromTime}
                  onChange={(e) => setFromTime(e.target.value)}
                />
              </Form.Group>

              <Form.Group as={Col} md={2} controlId="toDate">
                <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>To Date</Form.Label>
                <Form.Control
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  max={today}
                  required
                />
              </Form.Group>

              <Form.Group as={Col} md={2} controlId="toTime">
                <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>To Time</Form.Label>
                <Form.Control
                  type="time"
                  step="1"
                  value={toTime}
                  onChange={(e) => setToTime(e.target.value)}
                />
              </Form.Group>

              <Form.Group as={Col} md={2} className="d-flex align-items-end gap-2">
                <Button type="submit" variant="primary" className="w-50" disabled={loading}>
                  {loading ? "Loading..." : "Submit"}
                </Button>
                <Button type="button" variant="secondary" className="w-50" onClick={handleReset} disabled={loading}>
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
              <ReportKPICard label="Total Patients"     value={stats.total}       variant="primary" />
            </Col>
            <Col md={3}>
              <ReportKPICard label="Unique Departments" value={stats.uniqueDepts} variant="info"    />
            </Col>
          </Row>
        )}

        {/* Table */}
        {loading ? (
          <div className="text-center py-5 text-muted">
            <Spinner animation="border" role="status" />
            <div className="mt-3">Loading department statistics...</div>
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
                data={displayData}
                columns={TABLE_COLUMNS}
                onSort={handleSort}
                responsive={false}
                emptyMessage={
                  !submitted
                    ? "No data loaded. Please select filters and click Submit."
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
                Total Data Rows: <strong>{displayData.length}</strong>
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
