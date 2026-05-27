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
  exportToExcel,
  printReport,
  formatReportDate,
} from "../../utils/reportUtils";
import "../../styles/reportStyles.css";
import { showValidationError } from "../../../utils/alertUtil";

// ─── Month helpers ─────────────────────────────────────────────────────────
const MONTHS = [
  { id: 1,  name: "January"   },
  { id: 2,  name: "February"  },
  { id: 3,  name: "March"     },
  { id: 4,  name: "April"     },
  { id: 5,  name: "May"       },
  { id: 6,  name: "June"      },
  { id: 7,  name: "July"      },
  { id: 8,  name: "August"    },
  { id: 9,  name: "September" },
  { id: 10, name: "October"   },
  { id: 11, name: "November"  },
  { id: 12, name: "December"  },
];

const getDaysInMonth = (month: number, year: number) =>
  new Date(year, month, 0).getDate();

const currentYear = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 61 }, (_, i) => 1990 + i); // 1990–2050

// ─── Demo data ─────────────────────────────────────────────────────────────
const DEMO_WARDS = [
  { wardName: "General Ward",      beds: 30, totalIp: 520 },
  { wardName: "Male Ward",         beds: 20, totalIp: 340 },
  { wardName: "Female Ward",       beds: 20, totalIp: 310 },
  { wardName: "Paediatric Ward",   beds: 15, totalIp: 210 },
  { wardName: "Maternity Ward",    beds: 12, totalIp: 185 },
  { wardName: "Surgical Ward",     beds: 18, totalIp: 290 },
  { wardName: "ICU",               beds: 10, totalIp: 240 },
  { wardName: "Orthopaedic Ward",  beds: 12, totalIp: 175 },
];
// ──────────────────────────────────────────────────────────────────────────

interface WardRow {
  wardName:    string;
  beds:        number;
  totalIp:     number;
  days:        number;
  dailyAvg:    number; // C / B
  dailyPct:    number; // (C × 100) / (A × B)
}

export default function BedOccupied() {
  const now = new Date();

  // Filter state
  const [selectedMonth, setSelectedMonth] = useState<number>(now.getMonth() + 1);
  const [selectedYear,  setSelectedYear]  = useState<number>(now.getFullYear());

  // Data state
  const [rows,      setRows]      = useState<WardRow[]>([]);
  const [loading,   setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error,     setError]     = useState<string | null>(null);

  // Totals
  const totals = useMemo(() => {
    const totalBeds   = rows.reduce((s, r) => s + r.beds, 0);
    const totalIp     = rows.reduce((s, r) => s + r.totalIp, 0);
    const totalDailyA = rows.reduce((s, r) => s + r.dailyAvg, 0);
    const totalDailyP = rows.reduce((s, r) => s + r.dailyPct, 0);
    return { totalBeds, totalIp, totalDailyA, totalDailyP };
  }, [rows]);

  // Subtitle string
  const monthLabel = MONTHS.find((m) => m.id === selectedMonth)?.name ?? "";
  const subtitle   = submitted ? `${monthLabel} - ${selectedYear}` : "Select month & year and click Submit";

  // Handle submit
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMonth || !selectedYear) {
      showValidationError("Please select both Month and Year.", "Validation");
      return;
    }
    setError(null);
    setLoading(true);
    setSubmitted(false);

    setTimeout(() => {
      const days = getDaysInMonth(selectedMonth, selectedYear);
      const computed: WardRow[] = DEMO_WARDS.map((w) => ({
        wardName: w.wardName,
        beds:     w.beds,
        totalIp:  w.totalIp,
        days,
        dailyAvg: w.totalIp / days,
        dailyPct: (w.totalIp * 100) / (w.beds * days),
      }));
      setRows(computed);
      setSubmitted(true);
      setLoading(false);
    }, 600);
  };

  const handleReset = () => {
    setSelectedMonth(now.getMonth() + 1);
    setSelectedYear(now.getFullYear());
    setRows([]);
    setSubmitted(false);
    setError(null);
  };

  const handleExport = () => {
    const data = rows.map((r, i) => ({
      "S.No":                    i + 1,
      "Ward Name":               r.wardName,
      "No. Of Beds (A)":         r.beds,
      "No. Of Days (B)":         r.days,
      "Total No. Of IP (C)":     r.totalIp,
      "Daily Avg. (C/B)":        r.dailyAvg.toFixed(2),
      "Daily (Cx100)/(AxB)":     r.dailyPct.toFixed(2),
    }));
    exportToExcel(
      data,
      `Bed_Occupancy_${monthLabel}_${selectedYear}_${formatReportDate(new Date(), "DD-MM-YYYY")}`,
      "Bed Occupancy"
    );
  };

  return (
    <React.Fragment>
      <Container fluid className="px-4 py-3">
        {/* Report Header */}
        <ReportHeader
          title="Bed Occupancy"
          subtitle={subtitle}
          onPrint={printReport}
          onExport={handleExport}
          showSearch={false}
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
              <Form.Group as={Col} md={4} controlId="selMonth">
                <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>Month</Form.Label>
                <Form.Select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(Number(e.target.value))}
                  required
                >
                  {MONTHS.map((m) => (
                    <option key={m.id} value={m.id}>
                      {m.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>

              <Form.Group as={Col} md={4} controlId="selYear">
                <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>Year</Form.Label>
                <Form.Select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(Number(e.target.value))}
                  required
                >
                  {YEAR_OPTIONS.map((y) => (
                    <option key={y} value={y}>
                      {y}
                    </option>
                  ))}
                </Form.Select>
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
              <ReportKPICard label="Total Wards"    value={rows.length}        variant="primary"  />
            </Col>
            <Col md={3}>
              <ReportKPICard label="Total Beds"     value={totals.totalBeds}   variant="info"     />
            </Col>
            <Col md={3}>
              <ReportKPICard label="Total IP"       value={totals.totalIp}     variant="success"  />
            </Col>
            <Col md={3}>
              <ReportKPICard label="Avg Daily Occ." value={`${totals.totalDailyA.toFixed(2)}`} variant="warning" />
            </Col>
          </Row>
        )}

        {/* Table */}
        {loading ? (
          <div className="text-center py-5 text-muted">
            <Spinner animation="border" role="status" />
            <div className="mt-3">Loading bed occupancy...</div>
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
                    <th style={{ whiteSpace: "nowrap" }}>S.No</th>
                    <th>Ward Name</th>
                    <th style={{ whiteSpace: "nowrap" }}>No. Of Beds (A)</th>
                    <th style={{ whiteSpace: "nowrap" }}>No. Of Days (B)</th>
                    <th style={{ whiteSpace: "nowrap" }}>Total No. Of IP (C)</th>
                    <th style={{ whiteSpace: "nowrap" }}>Daily Avg. (C/B)</th>
                    <th style={{ whiteSpace: "nowrap" }}>Daily (C×100)/(A×B)</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center text-muted py-4">
                        {!submitted
                          ? "No data loaded. Please select month & year and click Submit."
                          : "No records found."}
                      </td>
                    </tr>
                  ) : (
                    <>
                      {rows.map((r, i) => (
                        <tr key={r.wardName}>
                          <td className="text-center">{i + 1}</td>
                          <td>{r.wardName}</td>
                          <td className="text-center">{r.beds}</td>
                          <td className="text-center">{r.days}</td>
                          <td className="text-center">{r.totalIp}</td>
                          <td className="text-center">{r.dailyAvg.toFixed(2)}</td>
                          <td className="text-center">{r.dailyPct.toFixed(2)}</td>
                        </tr>
                      ))}
                      {/* Totals row */}
                      <tr className="fw-bold" style={{ backgroundColor: "#222", color: "#fbfdee" }}>
                        <td colSpan={2} className="text-end">Total</td>
                        <td className="text-center">{totals.totalBeds}</td>
                        <td className="text-center">—</td>
                        <td className="text-center">{totals.totalIp}</td>
                        <td className="text-center">{totals.totalDailyA.toFixed(2)}</td>
                        <td className="text-center">{totals.totalDailyP.toFixed(2)}</td>
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
                Total Data Rows: <strong>{rows.length}</strong>
              </small>
            </div>
          </Card>
        )}
      </Container>
    </React.Fragment>
  );
}
