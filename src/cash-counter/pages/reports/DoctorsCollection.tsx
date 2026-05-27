import React, { useState } from "react";
import { Container, Card, Form, Button, Row, Col } from "react-bootstrap";
import ReportHeader from "../../../medical-records/components/ReportHeader";
import ReportTable from "../../../medical-records/components/ReportTable";
import {
  searchTableData,
  sortTableData,
  exportToExcel,
  printReport,
  formatReportDate,
  getDateRangeText,
} from "../../../medical-records/utils/reportUtils";
import "../../../medical-records/styles/reportStyles.css";

interface DoctorsCollectionRow {
  diptName: string;
  total: number;
  discount: number;
  payable: number;
  paid: number;
  balance: number;
  returnPaid: number;
  netAmount: number;
}

const DUMMY_BETWEEN_DATES_DATA: DoctorsCollectionRow[] = [
  {
    diptName: "General",
    total: 0,
    discount: 0,
    payable: 0,
    paid: 0,
    balance: 0,
    returnPaid: 0,
    netAmount: 0,
  },
];

const columns = [
  {
    key: "slNo",
    label: "SS No",
    sortable: false,
    render: (_: any, __: any, idx: number) => idx + 1,
  },
  { key: "diptName", label: "Dipt Name", sortable: true },
  { key: "total", label: "Collection's Total", sortable: true },
  { key: "discount", label: "Collection's Discount", sortable: true },
  { key: "payable", label: "Collection's Payable", sortable: true },
  { key: "paid", label: "Collection's Paid", sortable: true },
  { key: "balance", label: "Collection's Balance", sortable: true },
  { key: "returnPaid", label: "Return's Paid", sortable: true },
  { key: "netAmount", label: "Net Amount", sortable: true },
];

const DoctorsCollection: React.FC = () => {
  const today = new Date().toISOString().split("T")[0];

  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [allData, setAllData] = useState<DoctorsCollectionRow[]>([]);
  const [displayedData, setDisplayedData] = useState<DoctorsCollectionRow[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const updateDisplayedData = (
    records: DoctorsCollectionRow[],
    search: string,
    sKey: string,
    sDir: "asc" | "desc"
  ) => {
    let result = records;
    if (search) {
      result = searchTableData(result, search, ["diptName"]);
    }
    if (sKey) {
      result = sortTableData(result, sKey as keyof DoctorsCollectionRow, sDir);
    }
    setDisplayedData(result);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      const response: DoctorsCollectionRow[] = DUMMY_BETWEEN_DATES_DATA;
      setAllData(response);
      updateDisplayedData(response, searchTerm, sortKey, sortDirection);
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFromDate(today);
    setToDate(today);
    setAllData([]);
    setDisplayedData([]);
    setSearchTerm("");
    setSubmitted(false);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
    updateDisplayedData(allData, term, sortKey, sortDirection);
  };

  const handleSort = (key: string, direction: "asc" | "desc") => {
    setSortKey(key);
    setSortDirection(direction);
    updateDisplayedData(allData, searchTerm, key, direction);
  };

  const handlePrint = () => printReport();

  const handleExport = () => {
    const exportData = displayedData.map((r, i) => ({
      "SS No": i + 1,
      "Dipt Name": r.diptName,
      "Collection's Total": r.total,
      "Collection's Discount": r.discount,
      "Collection's Payable": r.payable,
      "Collection's Paid": r.paid,
      "Collection's Balance": r.balance,
      "Return's Paid": r.returnPaid,
      "Net Amount": r.netAmount,
    }));
    exportToExcel(
      exportData,
      `Doctors_Collection_${formatReportDate(new Date(), "DD-MM-YYYY")}`,
      "Doctors Collection"
    );
  };

  return (
    <Container fluid className="p-3">
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

      <Card className="report-card">
        <ReportHeader
          title="Doctors Collection"
          subtitle={
            submitted
              ? getDateRangeText(fromDate, toDate)
              : "Select date range and click Submit"
          }
          onPrint={handlePrint}
          onExport={handleExport}
          onSearch={handleSearch}
          showSearch={submitted}
          showPrint={submitted}
          showExport={submitted}
        />
        <div
          style={{
            maxHeight: "calc(115vh - 500px)",
            minHeight: "350px",
            overflowY: "auto",
            overflowX: "auto",
          }}
        >
          <ReportTable
            data={displayedData}
            columns={columns}
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
            borderTop: "2px solid var(--color-border)",
            fontSize: "var(--font-size-sm)",
          }}
        >
          Total Rows: <strong>{displayedData.length}</strong>
        </div>
      </Card>
    </Container>
  );
};

export default DoctorsCollection;
