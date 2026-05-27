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
  getDateRangeText,
} from "../../utils/reportUtils";
import "../../styles/reportStyles.css";
import { showValidationError } from "../../../utils/alertUtil";
import MedicalRecordsApiService, { DoctorStatisticsApiItem } from "../../../api/medical-records/medical-records-api-service";

const REPORT_TYPES = [
  { label: "All Patients",    opType: 0 },
  { label: "New Patients",    opType: 1 },
  { label: "Repeat Patients", opType: 2 },
];

const TABLE_COLUMNS = [
  { key: "slNo",          label: "Sl.No",          sortable: false, render: (_: any, __: any, idx: number) => idx + 1 },
  { key: "opNo",          label: "OP No.",          sortable: true  },
  { key: "patientName",   label: "Patient Name",    sortable: true  },
  { key: "docName",       label: "Doctor",          sortable: true  },
  { key: "datetime",      label: "Date & Time",     sortable: true  },
  { key: "tokenNoDept",   label: "Token (Dept)",    sortable: false },
  { key: "tokenNoDoctor", label: "Token (Doctor)",  sortable: false },
  { key: "masterTokenNo", label: "Master Token",    sortable: false },
];

interface DoctorWiseRecord {
  patientName:   string;
  opNo:          string;
  datetime:      string;
  tokenNoDept:   number;
  tokenNoDoctor: number;
  masterTokenNo: number;
  docName:       string;
}

const normalizeData = (raw: DoctorStatisticsApiItem[]): DoctorWiseRecord[] =>
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
    docName:       item.docName       || "-",
  }));

export default function DoctorWiseOp() {
  const today      = new Date().toISOString().split("T")[0];
  const apiService = useMemo(() => new MedicalRecordsApiService(), []);

  // Consultants
  const [consultants,        setConsultants]        = useState<{ id: number; name: string }[]>([]);
  const [consultantsLoading, setConsultantsLoading] = useState<boolean>(false);

  useEffect(() => {
    const load = async () => {
      setConsultantsLoading(true);
      try {
        const raw = await apiService.fetchAllConsultants();
        const active = (Array.isArray(raw) ? raw : [])
          .filter((c: any) => c.isActive === 1)
          .map((c: any) => ({ id: c.id ?? c.docId ?? c.consultantId, name: c.name ?? c.docName ?? c.consultantName ?? "-" }))
          .sort((a: any, b: any) => a.name.localeCompare(b.name));
        setConsultants(active);
      } catch {
        // non-blocking — form still works
      } finally {
        setConsultantsLoading(false);
      }
    };
    load();
  }, [apiService]);

  // Filter state
  const [reportType,    setReportType]    = useState<string>("All Patients");
  const [fromDate,      setFromDate]      = useState<string>(today);
  const [toDate,        setToDate]        = useState<string>(today);
  const [doctorFilter,  setDoctorFilter]  = useState<string>("All Doctors");

  // Data state
  const [allRecords,  setAllRecords]  = useState<DoctorWiseRecord[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [submitted,   setSubmitted]   = useState(false);
  const [error,       setError]       = useState<string | null>(null);

  // Search & sort
  const [searchTerm,    setSearchTerm]    = useState<string>("");
  const [sortKey,       setSortKey]       = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Doctor options from pre-loaded consultants (isActive = 1)
  const doctorOptions = useMemo(
    () => ["All Doctors", ...consultants.map((c) => c.name)],
    [consultants]
  );

  // Apply doctor client-side filter, then search & sort
  const displayData = useMemo(() => {
    let result = doctorFilter === "All Doctors"
      ? [...allRecords]
      : allRecords.filter((r) => r.docName === doctorFilter);
    if (searchTerm) {
      result = searchTableData(result, searchTerm, ["opNo", "patientName", "docName", "datetime"]);
    }
    if (sortKey) {
      result = sortTableData(result, sortKey as keyof DoctorWiseRecord, sortDirection);
    }
    return result;
  }, [allRecords, doctorFilter, searchTerm, sortKey, sortDirection]);

  const stats = useMemo(() => ({
    total:        displayData.length,
    uniqueDoctors: new Set(displayData.map((r) => r.docName)).size,
  }), [displayData]);

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

    const opType = REPORT_TYPES.find((t) => t.label === reportType)?.opType ?? 0;

    setError(null);
    setLoading(true);
    setSubmitted(false);
    setSearchTerm("");

    try {
      const raw = await apiService.fetchDoctorStatistics(fromDate, toDate, opType);
      const normalized = normalizeData(raw);
      setAllRecords(normalized);
      setSubmitted(true);
    } catch (err: any) {
      setError(err?.response?.data?.message || err?.message || "Failed to load doctor statistics.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setReportType("All Patients");
    setFromDate(today);
    setToDate(today);
    setDoctorFilter("All Doctors");
    setSearchTerm("");
    setAllRecords([]);
    setSearchTerm("");
    setSortKey("");
    setSortDirection("asc");
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
      "Doctor":         r.docName,
      "Date & Time":    r.datetime,
      "Token (Dept)":   r.tokenNoDept,
      "Token (Doctor)": r.tokenNoDoctor,
      "Master Token":   r.masterTokenNo,
    }));
    exportToExcel(
      data,
      `Doctor_Wise_OP_${formatReportDate(new Date(), "DD-MM-YYYY")}`,
      "Doctor Wise OP"
    );
  };

  const subtitle = submitted
    ? `${reportType}  |  ${doctorFilter}  |  ${getDateRangeText(fromDate, toDate)}`
    : "Select filters and click Submit";

  return (
    <React.Fragment>
      <Container fluid className="px-4 py-3">
        <ReportHeader
          title="Doctor Wise OP Statistics"
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
              <Form.Group as={Col} md={2} controlId="reportType">
                <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>Report Type</Form.Label>
                <Form.Select
                  value={reportType}
                  onChange={(e) => setReportType(e.target.value)}
                >
                  {REPORT_TYPES.map((t) => (
                    <option key={t.label} value={t.label}>{t.label}</option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group as={Col} md={3} controlId="doctorFilter">
                <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>Doctor</Form.Label>
                <Form.Select
                  value={doctorFilter}
                  onChange={(e) => setDoctorFilter(e.target.value)}
                  disabled={consultantsLoading}
                >
                  {consultantsLoading
                    ? <option>Loading...</option>
                    : doctorOptions.map((d) => (
                        <option key={d} value={d}>{d}</option>
                      ))
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
              <ReportKPICard label="Total Patients"   value={stats.total}         variant="primary" />
            </Col>
            <Col md={3}>
              <ReportKPICard label="Unique Doctors"   value={stats.uniqueDoctors} variant="info"    />
            </Col>
          </Row>
        )}

        {/* Table */}
        {loading ? (
          <div className="text-center py-5 text-muted">
            <Spinner animation="border" role="status" />
            <div className="mt-3">Loading doctor wise OP statistics...</div>
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
                {(searchTerm || doctorFilter !== "All Doctors") && (
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
