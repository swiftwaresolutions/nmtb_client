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
  Table,
} from "react-bootstrap";
import ReportHeader from "../../components/ReportHeader";
import ReportKPICard from "../../components/ReportKPICard";
import {
  searchTableData,
  exportToExcel,
  printReport,
  formatReportDate,
  getDateRangeText,
} from "../../utils/reportUtils";
import "../../styles/reportStyles.css";
import { showValidationError, showErrorToast } from "../../../utils/alertUtil";
import MedicalRecordsApiService, { MRDCollectionApiItem } from "../../../api/medical-records/medical-records-api-service";

export default function DeptWiseRegisters() {
  const today = new Date().toISOString().split("T")[0];
  const apiService = new MedicalRecordsApiService();

  // Filter state
  const [fromDate,    setFromDate]    = useState<string>(today);
  const [toDate,      setToDate]      = useState<string>(today);
  const [deptId,      setDeptId]      = useState<number>(-1);

  // Departments list
  const [departments, setDepartments] = useState<{ id: number; name: string }[]>([]);

  // Data state
  const [allRecords,  setAllRecords]  = useState<MRDCollectionApiItem[]>([]);
  const [displayData, setDisplayData] = useState<MRDCollectionApiItem[]>([]);
  const [loading,     setLoading]     = useState(false);
  const [submitted,   setSubmitted]   = useState(false);
  const [error,       setError]       = useState<string | null>(null);
  const [searchTerm,  setSearchTerm]  = useState<string>("");

  const deptLabel = departments.find((d) => d.id === deptId)?.name ?? "";

  // Load departments on mount
  React.useEffect(() => {
    apiService.fetchAllDepartments().then((data) => {
      setDepartments(
        data.map((d: any) => ({ id: d.id, name: d.name }))
      );
    }).catch(() => {});
  }, []);

  // Recompute displayed data when search changes
  React.useEffect(() => {
    if (!searchTerm) {
      setDisplayData(allRecords);
    } else {
      setDisplayData(
        searchTableData(allRecords, searchTerm, ["patientName", "opNo", "age", "sex", "date", "regBillNo"])
      );
    }
  }, [searchTerm, allRecords]);

  // Totals
  const totals = useMemo(() => ({
    pay:     displayData.reduce((s, r) => s + (r.pay     ?? 0), 0),
    disc:    displayData.reduce((s, r) => s + (r.disc    ?? 0), 0),
    paid:    displayData.reduce((s, r) => s + (r.paid    ?? 0), 0),
    balance: displayData.reduce((s, r) => s + (r.balance ?? 0), 0),
  }), [displayData]);

  // Stats
  const stats = useMemo(() => ({
    total:  allRecords.length,
    male:   allRecords.filter((r) => r.sex === "Male").length,
    female: allRecords.filter((r) => r.sex === "Female").length,
  }), [allRecords]);

  // Handle submit
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
    if (deptId === -1) {
      showValidationError("Please select a Department.", "Validation");
      return;
    }
    setError(null);
    setLoading(true);
    setSubmitted(false);
    setSearchTerm("");

    try {
      const data = await apiService.fetchMRDCollections(fromDate, toDate, deptId);
      setAllRecords(data);
      setDisplayData(data);
      setSubmitted(true);
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || "Failed to fetch department wise register";
      showErrorToast(msg);
      setAllRecords([]);
      setDisplayData([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFromDate(today);
    setToDate(today);
    setDeptId(-1);
    setAllRecords([]);
    setDisplayData([]);
    setSearchTerm("");
    setSubmitted(false);
    setError(null);
  };

  const handleExport = () => {
    const data = displayData.map((r, i) => ({
      "Sl.No":       i + 1,
      "Patient Name": r.patientName,
      "OP No.":      r.opNo,
      "Reg Bill No": r.regBillNo,
      "Age":         r.age,
      "Sex":         r.sex,
      "Date":        r.date,
      "Pay (₹)":     r.pay.toFixed(2),
      "Disc (₹)":    r.disc.toFixed(2),
      "Paid (₹)":    r.paid.toFixed(2),
      "Balance (₹)": r.balance.toFixed(2),
    }));
    exportToExcel(
      data,
      `Dept_Register_${formatReportDate(new Date(), "DD-MM-YYYY")}`,
      "Department Wise Register"
    );
  };

  const subtitle = submitted
    ? `${deptLabel}  |  ${getDateRangeText(fromDate, toDate)}`
    : "Select filters and click Submit";

  return (
    <React.Fragment>
      <Container fluid className="px-4 py-3">
        {/* Report Header */}
        <ReportHeader
          title="Department Wise Patient's Register"
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
              <Form.Group as={Col} md={3} controlId="fromDate">
                <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>From Date</Form.Label>
                <Form.Control
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  max={today}
                  required
                />
              </Form.Group>
              <Form.Group as={Col} md={3} controlId="toDate">
                <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>To Date</Form.Label>
                <Form.Control
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  max={today}
                  required
                />
              </Form.Group>
              <Form.Group as={Col} md={3} controlId="department">
                <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>Department</Form.Label>
                <Form.Select
                  value={deptId}
                  onChange={(e) => setDeptId(Number(e.target.value))}
                  required
                >
                  <option value={-1}>Select Department</option>
                  {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group as={Col} md={3} className="d-flex align-items-end gap-2">
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
              <ReportKPICard label="Total Patients" value={stats.total}                       variant="primary" />
            </Col>
            <Col md={3}>
              <ReportKPICard label="Male"           value={stats.male}                        variant="info"    />
            </Col>
            <Col md={3}>
              <ReportKPICard label="Female"         value={stats.female}                      variant="danger"  />
            </Col>
            <Col md={3}>
              <ReportKPICard label="Net Paid Amt"   value={`₹ ${totals.paid.toFixed(2)}`}     variant="success" />
            </Col>
          </Row>
        )}

        {/* Table */}
        {loading ? (
          <div className="text-center py-5 text-muted">
            <Spinner animation="border" role="status" />
            <div className="mt-3">Loading department wise register...</div>
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
              <Table bordered hover size="sm" className="mb-0" style={{ fontSize: "0.875rem" }}>
                <thead className="table-dark">
                  <tr>
                    <th style={{ whiteSpace: "nowrap" }}>Sl.No</th>
                    <th>Patient Name</th>
                    <th style={{ whiteSpace: "nowrap" }}>OP No.</th>
                    <th style={{ whiteSpace: "nowrap" }}>Reg Bill No.</th>
                    <th>Age</th>
                    <th>Sex</th>
                    <th>Date</th>
                    <th className="text-end" style={{ whiteSpace: "nowrap" }}>Pay (₹)</th>
                    <th className="text-end" style={{ whiteSpace: "nowrap" }}>Disc (₹)</th>
                    <th className="text-end" style={{ whiteSpace: "nowrap" }}>Paid (₹)</th>
                    <th className="text-end" style={{ whiteSpace: "nowrap" }}>Bal (₹)</th>
                  </tr>
                </thead>
                <tbody>
                  {displayData.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="text-center text-muted py-4">
                        {!submitted
                          ? "No data loaded. Please select filters and click Submit."
                          : searchTerm
                          ? "No records match your search criteria."
                          : "No records found for the selected department and date range."}
                        
                      </td>
                    </tr>
                  ) : (
                    <>
                      {displayData.map((r, i) => (
                        <tr key={`${r.opNo}-${i}`}>
                          <td className="text-center">{i + 1}</td>
                          <td>{r.patientName}</td>
                          <td>{r.opNo}</td>
                          <td>{r.regBillNo}</td>
                          <td>{r.age}</td>
                          <td>{r.sex}</td>
                          <td className="text-center">{r.date}</td>
                          <td className="text-end">{r.pay.toFixed(2)}</td>
                          <td className="text-end">{r.disc.toFixed(2)}</td>
                          <td className="text-end">{r.paid.toFixed(2)}</td>
                          <td className="text-end">{r.balance.toFixed(2)}</td>
                        </tr>
                      ))}
                      {/* Net Amount totals row */}
                      <tr className="fw-bold" style={{ backgroundColor: "#222", color: "#fbfdee" }}>
                        <td colSpan={7} className="text-end pe-3">Net Amount :</td>
                        <td className="text-end">{totals.pay.toFixed(2)}</td>
                        <td className="text-end">{totals.disc.toFixed(2)}</td>
                        <td className="text-end">{totals.paid.toFixed(2)}</td>
                        <td className="text-end">{totals.balance.toFixed(2)}</td>
                      </tr>
                    </>
                  )}
                </tbody>
              </Table>
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
