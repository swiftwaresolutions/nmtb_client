import React, { useState } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  Row,
  Col,
  Alert,
  Spinner,
  Nav,
} from "react-bootstrap";
import ReportHeader from "../../components/ReportHeader";
import ReportKPICard from "../../components/ReportKPICard";
import ReportTable from "../../components/ReportTable";
import {
  sortTableData,
  exportToExcel,
  printReport,
  formatReportDate,
  getDateRangeText,
} from "../../utils/reportUtils";
import "../../styles/reportStyles.css";
import { showValidationError } from "../../../utils/alertUtil";
import MedicalRecordsApiService, { IpCensusReportApiItem } from "../../../api/medical-records/medical-records-api-service";

const BETWEEN_COLUMNS = [
  { key: "slNo",            label: "S.No",               sortable: false, render: (_: any, __: any, idx: number) => idx + 1 },
  { key: "date",            label: "Date",                sortable: true  },
  { key: "previousCensus",  label: "Previous Census",     sortable: true  },
  { key: "admissionOnDate", label: "Admission on Date",   sortable: true  },
  { key: "dischargeOnDate", label: "Discharge on Date",   sortable: true  },
  {
    key: "totalIp",
    label: "Total IP",
    sortable: true,
  },
];

type ReportMode = "ondate" | "between";

export default function IpCensus() {
  const apiService = new MedicalRecordsApiService();
  const today = new Date().toISOString().split("T")[0];

  // Tab / mode
  const [mode, setMode] = useState<ReportMode>("ondate");

  // "On Date" state
  const [onDate, setOnDate] = useState<string>(today);
  const [onDateResult, setOnDateResult] = useState<IpCensusReportApiItem | null>(null);
  const [onDateLoading, setOnDateLoading] = useState(false);
  const [onDateSubmitted, setOnDateSubmitted] = useState(false);

  // "Between Dates" state
  const [fromDate, setFromDate] = useState<string>(today);
  const [toDate, setToDate] = useState<string>(today);
  const [betweenRecords, setBetweenRecords] = useState<IpCensusReportApiItem[]>([]);
  const [displayedData, setDisplayedData] = useState<IpCensusReportApiItem[]>([]);
  const [betweenLoading, setBetweenLoading] = useState(false);
  const [betweenSubmitted, setBetweenSubmitted] = useState(false);
  const [sortKey, setSortKey] = useState<keyof IpCensusReportApiItem | "">("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const [error, setError] = useState<string | null>(null);

  const formatDisplayDate = (value: string) => {
    if (!value) return value;
    return value;
  };

  // ── On Date handlers ──────────────────────────────────────────────────────
  const handleOnDateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!onDate) {
      showValidationError("Please select a date.", "Validation");
      return;
    }
    setError(null);
    setOnDateLoading(true);
    setOnDateSubmitted(false);

    try {
      const response: IpCensusReportApiItem[] = await apiService.fetchIpcensusReport(onDate, onDate);
      if (!Array.isArray(response) || response.length === 0) {
        setOnDateResult(null);
        setOnDateSubmitted(false);
        setError("No IP census data found for selected date.");
        return;
      }

      setOnDateResult(response[0]);
      setOnDateSubmitted(true);
    } catch (err: any) {
      console.error("Failed to fetch IP census (on date)", err);
      const status = err?.response?.status;
      if (status === 500 || status === 404) {
        setOnDateResult(null);
        setOnDateSubmitted(false);
        setError("No IP census data found for selected date.");
      } else {
        setError(err?.response?.data?.message || err?.message || "Failed to load IP census data. Please try again.");
      }
    } finally {
      setOnDateLoading(false);
    }
  };

  const handleOnDateReset = () => {
    setOnDate(today);
    setOnDateResult(null);
    setOnDateSubmitted(false);
    setError(null);
  };

  const totalIpOnDate = onDateResult ? onDateResult.totalIp : 0;

  // ── Between Dates handlers ────────────────────────────────────────────────
  const updateDisplayed = (records: IpCensusReportApiItem[], sk: keyof IpCensusReportApiItem | "", sd: "asc" | "desc") => {
    setDisplayedData(sk ? sortTableData(records, sk, sd) : [...records]);
  };

  const handleBetweenSubmit = async (e: React.FormEvent) => {
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
    setBetweenLoading(true);
    setBetweenSubmitted(false);

    try {
      const response: IpCensusReportApiItem[] = await apiService.fetchIpcensusReport(fromDate, toDate);
      const records = Array.isArray(response) ? response : [];

      if (records.length === 0) {
        setBetweenRecords([]);
        setDisplayedData([]);
        setBetweenSubmitted(false);
        setError("No IP census data found for selected date range.");
        return;
      }

      setBetweenRecords(records);
      updateDisplayed(records, sortKey, sortDirection);
      setBetweenSubmitted(true);
    } catch (err: any) {
      console.error("Failed to fetch IP census (between dates)", err);
      const status = err?.response?.status;
      if (status === 500 || status === 404) {
        setBetweenRecords([]);
        setDisplayedData([]);
        setBetweenSubmitted(false);
        setError("No IP census data found for selected date range.");
      } else {
        setError(err?.response?.data?.message || err?.message || "Failed to load IP census data. Please try again.");
      }
    } finally {
      setBetweenLoading(false);
    }
  };

  const handleBetweenReset = () => {
    setFromDate(today);
    setToDate(today);
    setBetweenRecords([]);
    setDisplayedData([]);
    setSortKey("");
    setSortDirection("asc");
    setBetweenSubmitted(false);
    setError(null);
  };

  const handleSort = (key: string) => {
    const typedKey = key as keyof IpCensusReportApiItem;
    const newDir = sortKey === key && sortDirection === "asc" ? "desc" : "asc";
    setSortKey(typedKey);
    setSortDirection(newDir);
    updateDisplayed(betweenRecords, typedKey, newDir);
  };

  const handleBetweenExport = () => {
    const data = displayedData.map((r, i) => ({
      "S.No": i + 1,
      Date: r.date,
      "Previous Census": r.previousCensus,
      "Admission on Date": r.admissionOnDate,
      "Discharge on Date": r.dischargeOnDate,
      "Total IP": r.totalIp,
    }));
    exportToExcel(
      data,
      `IP_Census_Between_${formatReportDate(new Date(), "DD-MM-YYYY")}`,
      "IP Census Between Dates"
    );
  };

  const handleOnDateExport = () => {
    if (!onDateResult) return;
    exportToExcel(
      [
        {
          Date: onDateResult.date,
          "Previous Census": onDateResult.previousCensus,
          "Today's Admission": onDateResult.admissionOnDate,
          "Today's Discharge": onDateResult.dischargeOnDate,
          "Total IP": totalIpOnDate,
        },
      ],
      `IP_Census_OnDate_${formatReportDate(new Date(), "DD-MM-YYYY")}`,
      "IP Census On Date"
    );
  };

  // ── Mode switch resets error ──────────────────────────────────────────────
  const switchMode = (m: ReportMode) => {
    setMode(m);
    setError(null);
  };

  return (
    <React.Fragment>
      <Container fluid className="px-4 py-3">
        {/* Report Header */}
        <ReportHeader
          title="IP Census"
          subtitle={
            mode === "ondate"
              ? onDateSubmitted
                ? `Date: ${formatDisplayDate(onDate)}`
                : "Select a date and click Submit"
              : betweenSubmitted
              ? getDateRangeText(fromDate, toDate)
              : "Select date range and click Submit"
          }
          onPrint={printReport}
          onExport={mode === "ondate" ? handleOnDateExport : handleBetweenExport}
          showSearch={false}
          showSort={false}
          showPrint={mode === "ondate" ? onDateSubmitted : betweenSubmitted}
          showExport={mode === "ondate" ? onDateSubmitted : betweenSubmitted}
        />

        {error && (
          <Alert variant="danger" className="mt-3">
            {error}
          </Alert>
        )}

        {/* Mode Tabs */}
        <Nav
          variant="tabs"
          className="mb-0 no-print"
          activeKey={mode}
          onSelect={(k) => switchMode((k as ReportMode) || "ondate")}
        >
          <Nav.Item>
            <Nav.Link eventKey="ondate">On Date</Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="between">Between Dates</Nav.Link>
          </Nav.Item>
        </Nav>

        {/* ── ON DATE MODE ─────────────────────────────────────────────── */}
        {mode === "ondate" && (
          <>
            <Card className="mb-4 shadow-sm no-print" style={{ borderTopLeftRadius: 0 }}>
              <Card.Body>
                <Form className="row g-3 align-items-end" onSubmit={handleOnDateSubmit}>
                  <Form.Group as={Col} md={4} controlId="onDate">
                    <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={onDate}
                      onChange={(e) => setOnDate(e.target.value)}
                      max={today}
                      lang="en-CA"
                      required
                    />
                  </Form.Group>
                  <Form.Group as={Col} md={4} className="d-flex align-items-end gap-2">
                    <Button type="submit" variant="primary" className="w-50" disabled={onDateLoading}>
                      {onDateLoading ? "Loading..." : "Submit"}
                    </Button>
                    <Button type="button" variant="secondary" className="w-50" onClick={handleOnDateReset}>
                      Reset
                    </Button>
                  </Form.Group>
                </Form>
              </Card.Body>
            </Card>

            {onDateLoading ? (
              <div className="text-center py-5 text-muted">
                <Spinner animation="border" role="status" />
                <div className="mt-3">Loading IP census...</div>
              </div>
            ) : onDateSubmitted && onDateResult ? (
              <Row className="mb-4">
                <Col md={3}>
                  <ReportKPICard
                    label="Previous Census"
                    value={onDateResult.previousCensus}
                    variant="warning"
                  />
                </Col>
                <Col md={3}>
                  <ReportKPICard
                    label="Today's Admission"
                    value={onDateResult.admissionOnDate}
                    variant="success"
                  />
                </Col>
                <Col md={3}>
                  <ReportKPICard
                    label="Today's Discharge"
                    value={onDateResult.dischargeOnDate}
                    variant="danger"
                  />
                </Col>
                <Col md={3}>
                  <ReportKPICard
                    label="Total IP"
                    value={totalIpOnDate}
                    variant="primary"
                  />
                </Col>
              </Row>
            ) : null}
          </>
        )}

        {/* ── BETWEEN DATES MODE ───────────────────────────────────────── */}
        {mode === "between" && (
          <>
            <Card className="mb-4 shadow-sm no-print" style={{ borderTopLeftRadius: 0 }}>
              <Card.Body>
                <Form className="row g-3 align-items-end" onSubmit={handleBetweenSubmit}>
                  <Form.Group as={Col} md={4} controlId="fromDate">
                    <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>From Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      max={today}
                      lang="en-CA"
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
                      lang="en-CA"
                      required
                    />
                  </Form.Group>
                  <Form.Group as={Col} md={4} className="d-flex align-items-end gap-2">
                    <Button type="submit" variant="primary" className="w-50" disabled={betweenLoading}>
                      {betweenLoading ? "Loading..." : "Submit"}
                    </Button>
                    <Button type="button" variant="secondary" className="w-50" onClick={handleBetweenReset}>
                      Reset
                    </Button>
                  </Form.Group>
                </Form>
              </Card.Body>
            </Card>

            {betweenLoading ? (
              <div className="text-center py-5 text-muted">
                <Spinner animation="border" role="status" />
                <div className="mt-3">Loading IP census...</div>
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
                    columns={BETWEEN_COLUMNS}
                    onSort={handleSort}
                    responsive={false}
                    emptyMessage={
                      !betweenSubmitted
                        ? "No data loaded. Please select date range and click Submit."
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
                  </small>
                </div>
              </Card>
            )}
          </>
        )}
      </Container>
    </React.Fragment>
  );
}
