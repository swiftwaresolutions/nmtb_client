import React, { useMemo, useState } from "react";
import { Container, Card, Form, Button, Row, Col, Spinner, Table } from "react-bootstrap";
import ReportHeader from "../../components/ReportHeader";
import {
  exportToExcel,
  formatReportDate,
  printReport,
} from "../../utils/reportUtils";
import "../../styles/reportStyles.css";

const monthLabels = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export default function YearwiseAllDetailsReport() {
  const currentYear = new Date().getFullYear();
  const yearOptions = useMemo(
    () => Array.from({ length: 2060 - 1998 }, (_, idx) => 1998 + idx),
    []
  );

  const [selectedYear, setSelectedYear] = useState<string>(String(currentYear));
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [monthTotals, setMonthTotals] = useState<number[]>([]);

  const totalCount = useMemo(
    () => monthTotals.reduce((sum, value) => sum + value, 0),
    [monthTotals]
  );

  const buildDummyTotals = (year: string): number[] => {
    const yearSeed = Number(year) % 10;
    return monthLabels.map((_, idx) => (idx + 1) * 7 + yearSeed * 3);
  };

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsSubmitted(true);
    setMonthTotals(buildDummyTotals(selectedYear));
    setIsLoading(false);
  };

  const handleReset = () => {
    setSelectedYear(String(currentYear));
    setIsSubmitted(false);
    setMonthTotals([]);
  };

  const handlePrint = () => {
    printReport();
  };

  const handleExport = () => {
    const exportData = [
      {
        Year: selectedYear,
        Jan: monthTotals[0] ?? 0,
        Feb: monthTotals[1] ?? 0,
        Mar: monthTotals[2] ?? 0,
        Apr: monthTotals[3] ?? 0,
        May: monthTotals[4] ?? 0,
        Jun: monthTotals[5] ?? 0,
        Jul: monthTotals[6] ?? 0,
        Aug: monthTotals[7] ?? 0,
        Sep: monthTotals[8] ?? 0,
        Oct: monthTotals[9] ?? 0,
        Nov: monthTotals[10] ?? 0,
        Dec: monthTotals[11] ?? 0,
        Total: totalCount,
      },
    ];

    exportToExcel(
      exportData,
      `Yearwise_All_Details_${formatReportDate(new Date(), "DD-MM-YYYY")}`,
      "Yearwise All Details"
    );
  };

  return (
    <React.Fragment>
      <Container fluid className="px-4 py-3">
        <ReportHeader
          title="Yearwise All Details"
          subtitle={isSubmitted ? `Selected Year: ${selectedYear}` : "Select a year and click Submit"}
          onPrint={handlePrint}
          onExport={handleExport}
          showSearch={false}
          showSort={false}
          showPrint={isSubmitted}
          showExport={isSubmitted}
        />

        <Card className="mb-4 shadow-sm no-print">
          <Card.Body>
            <Form className="row g-3 align-items-end" onSubmit={handleFilterSubmit}>
              <Form.Group as={Col} md={6} controlId="selectedYear">
                <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>Select The Year</Form.Label>
                <Form.Select
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  required
                >
                  <option value="">Select year</option>
                  {yearOptions.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <Form.Group as={Col} md={6} className="d-flex align-items-end gap-2">
                <Button type="submit" variant="primary" className="w-50" disabled={isLoading}>
                  {isLoading ? "Submitting..." : "Submit"}
                </Button>
                <Button type="button" variant="secondary" className="w-50" onClick={handleReset} disabled={isLoading}>
                  Reset
                </Button>
              </Form.Group>
            </Form>
          </Card.Body>
        </Card>

        {isLoading ? (
          <div className="text-center py-5 text-muted">
            <Spinner animation="border" role="status" />
            <div className="mt-3">Loading yearwise report...</div>
          </div>
        ) : (
          <React.Fragment>
            {isSubmitted && (
              <Card className="report-card mb-4" style={{ padding: "0.75rem" }}>
                <div style={{ overflowX: "auto" }}>
                  <Table bordered className="mb-0 text-center" style={{ minWidth: "900px" }}>
                    <thead>
                      <tr>
                        {monthLabels.map((label) => (
                          <th key={label}>{label}</th>
                        ))}
                        <th className="text-danger">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        {monthTotals.map((value, idx) => (
                          <td key={`${idx}-${value}`} className="text-end">
                            {value}
                          </td>
                        ))}
                        <td className="text-end text-danger fw-bold">{totalCount}</td>
                      </tr>
                    </tbody>
                  </Table>
                </div>
              </Card>
            )}

            {isSubmitted && (
              <Card className="report-card" style={{ padding: "0.75rem" }}>
                <Row className="g-3">
                  <Col md={6}>
                    <div className="text-primary text-decoration-underline">
                      Department Wise OP
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="text-primary text-decoration-underline">
                      Department Wise IP
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="text-primary text-decoration-underline">
                      Doctor Wise OP
                    </div>
                  </Col>
                  <Col md={6}>
                    <div className="text-primary text-decoration-underline">
                      Doctor Wise IP
                    </div>
                  </Col>
                </Row>
              </Card>
            )}
          </React.Fragment>
        )}
      </Container>
    </React.Fragment>
  );
}
