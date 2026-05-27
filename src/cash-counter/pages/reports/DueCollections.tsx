import React, { useState } from "react";
import { Container, Card, Form, Button, Row, Col, Table } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPrint } from "@fortawesome/free-solid-svg-icons";
import "../../../medical-records/styles/reportStyles.css";
import CashCounterApiService, { DueCollectionReportRow } from "../../../api/cash-counter/cash-counter-api-service";
import { showErrorToast } from "../../../utils/alertUtil";

const cashCounterApi = new CashCounterApiService();

const DueCollections: React.FC = () => {
  const today = new Date().toISOString().split("T")[0];

  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [tableData, setTableData] = useState<DueCollectionReportRow[]>([]);

  const totalCollection = tableData.reduce((sum, r) => sum + r.amount, 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const response = await cashCounterApi.fetchDueCollectionReport(fromDate, toDate);
      setTableData(response);
      setSubmitted(true);
    } catch {
      showErrorToast("Failed to fetch due collections report.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFromDate(today);
    setToDate(today);
    setTableData([]);
    setSubmitted(false);
  };

  return (
    <Container fluid className="p-3">
      {/* Filter Section */}
      <Card className="mb-3 shadow-sm no-print">
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="g-3 align-items-end">
              <Col md={4}>
                <Form.Group>
                  <Form.Label style={{ fontWeight: "var(--font-weight-medium)" }}>
                    From Date
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label style={{ fontWeight: "var(--font-weight-medium)" }}>
                    To Date
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={4} className="d-flex gap-2">
                <Button type="submit" variant="primary" disabled={loading}>
                  {loading ? "Loading..." : "Submit"}
                </Button>
                <Button type="button" variant="outline-secondary" onClick={handleReset}>
                  Reset
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {/* Report Section */}
      {submitted && (
        <Card className="report-card shadow-sm">
          {/* Header */}
          <Card.Header
            className="d-flex justify-content-between align-items-center"
            style={{ background: "var(--color-primary, #0d6efd)", color: "#fff" }}
          >
            <div>
              <span style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--font-weight-semibold)" }}>
                Due Collections
              </span>
              <span className="ms-3" style={{ fontSize: "var(--font-size-sm)", opacity: 0.85 }}>
                {fromDate} &nbsp;–&nbsp; {toDate}
              </span>
            </div>
            <Button
              variant="light"
              size="sm"
              className="no-print d-flex align-items-center gap-1"
              onClick={() => window.print()}
            >
              <FontAwesomeIcon icon={faPrint} className="me-1" /> Print
            </Button>
          </Card.Header>

          {/* Table */}
          <div style={{ overflowX: "auto" }}>
            <Table bordered hover className="table-hims mb-0">
              <thead>
                <tr style={{ background: "var(--color-table-header, #f1f5f9)" }}>
                  <th style={{ width: "60px" }}>S. No</th>
                  <th>Patient Name</th>
                  <th>Date</th>
                  <th>OP. No</th>
                  <th>Bill No.</th>
                  <th className="text-end">Amount</th>
                </tr>
              </thead>
              <tbody>
                {tableData.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center text-muted py-4">
                      No records found for the selected date range.
                    </td>
                  </tr>
                ) : (
                  tableData.map((row, idx) => (
                    <tr key={idx}>
                      <td>{idx + 1}</td>
                      <td>{row.patientName}</td>
                      <td>{row.date}</td>
                      <td>{row.opNo}</td>
                      <td>{row.billNo}</td>
                      <td className="text-end">{row.amount.toFixed(2)}</td>
                    </tr>
                  ))
                )}
                {/* Total row */}
                <tr style={{ fontWeight: "var(--font-weight-semibold)", background: "var(--color-table-header, #f1f5f9)" }}>
                  <td colSpan={5} className="text-end">Total :</td>
                  <td className="text-end">{totalCollection.toFixed(2)}</td>
                </tr>
              </tbody>
            </Table>
          </div>

          {/* Footer */}
          <Card.Footer className="d-flex justify-content-end align-items-center py-2">
            <span style={{ fontSize: "var(--font-size-md)", fontWeight: "var(--font-weight-semibold)" }}>
              Total Collection :&nbsp;
              <span style={{ color: "var(--color-primary, #0d6efd)" }}>
                ₹ {totalCollection.toFixed(2)}
              </span>
            </span>
          </Card.Footer>
        </Card>
      )}
    </Container>
  );
};

export default DueCollections;
