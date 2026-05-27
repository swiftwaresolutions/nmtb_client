import React, { useState, useMemo } from "react";
import { Container, Card, Form, Button, Row, Col, Table, Spinner } from "react-bootstrap";
import ReportHeader from "../../components/ReportHeader";
import ReportKPICard from "../../components/ReportKPICard";
import MedicalRecordsApiService from "../../../api/medical-records/medical-records-api-service";
import {
  exportToExcel,
  printReport,
  formatReportDate,
  getDateRangeText,
} from "../../utils/reportUtils";
import "../../styles/reportStyles.css";
import { showValidationError } from "../../../utils/alertUtil";

interface GenderRow {
  gender: string;
  count:  number;
}

interface WardItem {
  wardName:   string;
  noOfBeds:   number;
  ipTotal:    number;
  genderRows: GenderRow[];
}

const TH_STYLE: React.CSSProperties = {
  background: "var(--color-primary, #0d6efd)",
  color: "#fff",
  textAlign: "center",
  position: "sticky",
  top: 0,
  zIndex: 1,
};

const apiService = new MedicalRecordsApiService();

export default function GenderwiseWard() {
  const today = new Date().toISOString().split("T")[0];

  const [fromDate,  setFromDate]  = useState<string>(today);
  const [toDate,    setToDate]    = useState<string>(today);
  const [submitted, setSubmitted] = useState(false);
  const [loading,   setLoading]   = useState(false);
  const [wards,     setWards]     = useState<WardItem[]>([]);

  const stats = useMemo(() => ({
    totalWards: wards.length,
    totalBeds:  wards.reduce((s, w) => s + w.noOfBeds, 0),
    totalIP:    wards.reduce((s, w) => s + w.ipTotal,  0),
  }), [wards]);

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
    setLoading(true);
    setSubmitted(false);
    try {
      const data = await apiService.fetchWardStatistics(fromDate, toDate);
      setWards(
        data.map((item) => ({
          wardName: item.wardName,
          noOfBeds: item.bedCount,
          ipTotal:  item.ipTotal,
          genderRows: [
            { gender: "Male",   count: item.separateTotal.male   },
            { gender: "Female", count: item.separateTotal.female },
            { gender: "Others", count: item.separateTotal.others },
          ],
        }))
      );
      setSubmitted(true);
    } catch {
      setSubmitted(false);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFromDate(today);
    setToDate(today);
    setWards([]);
    setSubmitted(false);
  };

  const handleExport = () => {
    const rows: any[] = [];
    wards.forEach((ward, wi) => {
      ward.genderRows.forEach((gr, gi) => {
        rows.push({
          "Sl.No":           gi === 0 ? wi + 1 : "",
          "Ward Name":       gi === 0 ? ward.wardName : "",
          "No. of Beds":     gi === 0 ? ward.noOfBeds : "",
          "Gender":          gr.gender,
          "Total No. of IP": gr.count,
        });
      });
      rows.push({
        "Sl.No":           "",
        "Ward Name":       "",
        "No. of Beds":     "",
        "Gender":          "Sub Total",
        "Total No. of IP": ward.ipTotal,
      });
    });
    exportToExcel(
      rows,
      `Ward_Gender_Statistics_${formatReportDate(new Date(), "DD-MM-YYYY")}`,
      "Ward Gender Statistics"
    );
  };

  return (
    <React.Fragment>
      <Container fluid className="px-4 py-3">
        <ReportHeader
          title="Ward Statistics Between Dates"
          subtitle={submitted ? getDateRangeText(fromDate, toDate) : "Select date range and click Submit"}
          onPrint={printReport}
          onExport={handleExport}
          showSearch={false}
          showSort={false}
          showPrint={submitted}
          showExport={submitted}
        />

        {/* Filter Form */}
        <Card className="mb-4 shadow-sm no-print">
          <Card.Body>
            <Form className="row g-3 align-items-end" onSubmit={handleSubmit}>
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
            <Col md={4}>
              <ReportKPICard label="Total Wards" value={stats.totalWards} variant="primary" />
            </Col>
            <Col md={4}>
              <ReportKPICard label="Total Beds"  value={stats.totalBeds}  variant="info"    />
            </Col>
            <Col md={4}>
              <ReportKPICard label="Total IP"    value={stats.totalIP}    variant="success" />
            </Col>
          </Row>
        )}

        {/* Table */}
        {loading ? (
          <div className="text-center py-5 text-muted">
            <Spinner animation="border" role="status" />
            <div className="mt-3">Loading ward statistics...</div>
          </div>
        ) : (
          <Card className="report-card" style={{ padding: "0.75rem" }}>
            <div style={{ maxHeight: "450px", overflowY: "auto", overflowX: "auto", position: "relative" }}>
              <Table bordered hover size="sm" className="mb-0">
                <thead>
                  <tr>
                    <th style={TH_STYLE}>Sl.No</th>
                    <th style={TH_STYLE}>Ward Name</th>
                    <th style={TH_STYLE}>No. of Beds</th>
                    <th style={TH_STYLE}>Gender</th>
                    <th style={TH_STYLE}>Total No. of IP</th>
                  </tr>
                </thead>
                <tbody>
                  {!submitted || wards.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="text-center text-muted py-4">
                        {!submitted
                          ? "No data loaded. Please select date range and click Submit."
                          : "No records found."}
                      </td>
                    </tr>
                  ) : (
                    wards.map((ward, wi) => (
                      <React.Fragment key={wi}>
                        {ward.genderRows.map((gr, gi) => (
                          <tr key={gi}>
                            <td className="text-center">{gi === 0 ? wi + 1 : ""}</td>
                            <td>&nbsp;{gi === 0 ? ward.wardName : ""}</td>
                            <td className="text-center">{gi === 0 ? ward.noOfBeds : ""}</td>
                            <td className="text-center">{gr.gender}</td>
                            <td className="text-center">{gr.count}</td>
                          </tr>
                        ))}
                        <tr>
                          <td
                            colSpan={5}
                            style={{
                              background: "var(--color-teal, #008080)",
                              color: "#fff",
                              fontWeight: "var(--font-weight-bold)",
                              textAlign: "right",
                              paddingRight: "1rem",
                            }}
                          >
                            Sub Total IP: {ward.ipTotal}
                          </td>
                        </tr>
                      </React.Fragment>
                    ))
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
                Total Data Rows: <strong>{wards.length}</strong>
              </small>
            </div>
          </Card>
        )}
      </Container>
    </React.Fragment>
  );
}
