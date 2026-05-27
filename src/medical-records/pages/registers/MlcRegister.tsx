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
import { showValidationError, showErrorToast } from "../../../utils/alertUtil";
import MedicalRecordsApiService, { MlcReportItem } from "../../../api/medical-records/medical-records-api-service";

const TABLE_COLUMNS = [
  {
    key: "slNo",
    label: "S.No",
    sortable: false,
    render: (_: any, __: any, idx: number) => idx + 1,
  },
  { key: "opNo", label: "OP No.", sortable: true },
  { key: "tokenNoDoctor", label: "Token No. (Doctor)", sortable: true },
  { key: "tokenNoDept", label: "Token No. (Dept)", sortable: true },
  {
    key: "patientName",
    label: "Patient Name",
    sortable: true,
    render: (_: any, record: MlcReportItem) =>
      [record.firstName, record.secondName].filter(Boolean).join(" "),
  },
  { key: "dob", label: "Date of Birth", sortable: true },
  { key: "sexName", label: "Sex", sortable: true },
  {
    key: "ipNo",
    label: "IP No.",
    sortable: true,
    render: (_: any, record: MlcReportItem) => record.ipNo ?? "Not Admitted",
  },
];

export default function MlcRegister() {
  const today = new Date().toISOString().split("T")[0];
  const apiService = new MedicalRecordsApiService();

  // Filter state
  const [fromDate, setFromDate] = useState<string>(today);
  const [toDate, setToDate] = useState<string>(today);

  // Data state
  const [allRecords, setAllRecords] = useState<MlcReportItem[]>([]);
  const [displayedData, setDisplayedData] = useState<MlcReportItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState<boolean>(false);

  // Search & sort state
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortKey, setSortKey] = useState<keyof MlcReportItem | "">("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Stats
  const stats = useMemo(() => {
    const male = allRecords.filter((r) => r.sex === 1).length;
    const female = allRecords.filter((r) => r.sex === 2).length;
    const admitted = allRecords.filter((r) => r.ipNo !== null).length;
    return { total: allRecords.length, male, female, admitted };
  }, [allRecords]);

  // Refresh displayed data on search/sort change
  React.useEffect(() => {
    let result = [...allRecords];
    if (searchTerm) {
      result = searchTableData(result, searchTerm, [
        "opNo",
        "tokenNoDoctor",
        "tokenNoDept",
        "firstName",
        "secondName",
        "sexName",
        "ipNo",
      ]);
    }
    if (sortKey) {
      result = sortTableData(result, sortKey as keyof MlcReportItem, sortDirection);
    }
    setDisplayedData(result);
  }, [searchTerm, sortKey, sortDirection, allRecords]);

  // Handle form submit
  const handleFilterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!fromDate || !toDate) {
      showValidationError(
        "Please select both From Date and To Date.",
        "Validation"
      );
      return;
    }
    if (fromDate > toDate) {
      showValidationError(
        "From Date cannot be later than To Date.",
        "Validation"
      );
      return;
    }

    setError(null);
    setLoading(true);
    setSubmitted(false);
    setSearchTerm("");

    try {
      const data = await apiService.fetchMlcReports(fromDate, toDate);
      setAllRecords(data);
      setDisplayedData(data);
      setSubmitted(true);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to fetch MLC Register";
      showErrorToast(msg);
      setAllRecords([]);
      setDisplayedData([]);
    } finally {
      setLoading(false);
    }
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
      setSortKey(key as keyof MlcReportItem);
      setSortDirection("asc");
    }
  };

  const handleExport = () => {
    const exportData = displayedData.map((r, i) => ({
      "S.No": i + 1,
      "OP No.": r.opNo,
      "Token No. (Doctor)": r.tokenNoDoctor,
      "Token No. (Dept)": r.tokenNoDept,
      "Patient Name": [r.firstName, r.secondName].filter(Boolean).join(" "),
      "Date of Birth": r.dob,
      Sex: r.sexName,
      "IP No.": r.ipNo ?? "Not Admitted",
    }));
    exportToExcel(
      exportData,
      `MLC_Register_${formatReportDate(new Date(), "DD-MM-YYYY")}`,
      "MLC Register"
    );
  };

  return (
    <React.Fragment>
      <Container fluid className="px-4 py-3">
        {/* Report Header */}
        <ReportHeader
          title="MLC Register"
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
            <Form
              className="row g-3 align-items-end"
              onSubmit={handleFilterSubmit}
            >
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
              <Form.Group
                as={Col}
                md={4}
                className="d-flex align-items-end gap-2"
              >
                <Button
                  type="submit"
                  variant="primary"
                  className="w-50"
                  disabled={loading}
                >
                  {loading ? "Loading..." : "Submit"}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  className="w-50"
                  onClick={handleReset}
                >
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
              <ReportKPICard
                label="Total MLC Cases"
                value={stats.total}
                variant="primary"
              />
            </Col>
            <Col md={3}>
              <ReportKPICard
                label="Male"
                value={stats.male}
                variant="info"
              />
            </Col>
            <Col md={3}>
              <ReportKPICard
                label="Female"
                value={stats.female}
                variant="danger"
              />
            </Col>
            <Col md={3}>
              <ReportKPICard
                label="Admitted"
                value={stats.admitted}
                variant="success"
              />
            </Col>
          </Row>
        )}

        {/* Table */}
        {loading ? (
          <div className="text-center py-5 text-muted">
            <Spinner animation="border" role="status" />
            <div className="mt-3">Loading MLC register...</div>
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
                  <span className="ms-2">
                    (Filtered from {allRecords.length})
                  </span>
                )}
              </small>
            </div>
          </Card>
        )}
      </Container>
    </React.Fragment>
  );
}
