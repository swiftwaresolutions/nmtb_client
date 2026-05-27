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

interface PhDiscountCollectionRow {
  date: string;
  total: number;
  discount: number;
  pay: number;
  paid: number;
  balance: number;
}

const DUMMY_BETWEEN_DATES_DATA: PhDiscountCollectionRow[] = [
  {
    date: "10-03-2026",
    total: 1500,
    discount: 100,
    pay: 1400,
    paid: 1400,
    balance: 0,
  },
  {
    date: "10-03-2026",
    total: 2200,
    discount: 200,
    pay: 2000,
    paid: 1800,
    balance: 200,
  },
  {
    date: "10-03-2026",
    total: 800,
    discount: 50,
    pay: 750,
    paid: 750,
    balance: 0,
  },
];

const columns = [
  {
    key: "slNo",
    label: "S.No",
    sortable: false,
    render: (_: any, __: any, idx: number) => idx + 1,
  },
  { key: "date", label: "Date", sortable: true },
  { key: "total", label: "TOTAL", sortable: true, render: (v: number) => v.toFixed(2) },
  {
    key: "discount",
    label: "DISCOUNT",
    sortable: true,
    render: (v: number) => v.toFixed(2),
  },
  { key: "pay", label: "PAY", sortable: true, render: (v: number) => v.toFixed(2) },
  { key: "paid", label: "PAID", sortable: true, render: (v: number) => v.toFixed(2) },
  {
    key: "balance",
    label: "BALANCE",
    sortable: true,
    render: (v: number) => v.toFixed(2),
  },
];

const PhDiscountCollection: React.FC = () => {
  const today = new Date().toISOString().split("T")[0];

  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [dateFilterType, setDateFilterType] = useState("betweenDates");
  const [loading, setLoading] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [allData, setAllData] = useState<PhDiscountCollectionRow[]>([]);
  const [displayedData, setDisplayedData] = useState<PhDiscountCollectionRow[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [sortKey, setSortKey] = useState("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const updateDisplayedData = (
    records: PhDiscountCollectionRow[],
    search: string,
    sKey: string,
    sDir: "asc" | "desc"
  ) => {
    let result = records;
    if (search) {
      result = searchTableData(result, search, ["date"]);
    }
    if (sKey) {
      result = sortTableData(result, sKey as keyof PhDiscountCollectionRow, sDir);
    }
    setDisplayedData(result);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // TODO: Replace with actual API call
      const response: PhDiscountCollectionRow[] =
        dateFilterType === "betweenDates" ? DUMMY_BETWEEN_DATES_DATA : [];
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
    setDateFilterType("betweenDates");
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
      "S.No": i + 1,
      Date: r.date,
      TOTAL: r.total,
      DISCOUNT: r.discount,
      PAY: r.pay,
      PAID: r.paid,
      BALANCE: r.balance,
    }));
    exportToExcel(
      exportData,
      `PH_Discount_Collection_${formatReportDate(new Date(), "DD-MM-YYYY")}`,
      "PH Discount Collection"
    );
  };

  const totalDiscount = displayedData.reduce((sum, row) => sum + row.discount, 0);

  return (
    <Container fluid className="p-3">
      <Card className="mb-3 shadow-sm no-print">
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="g-3 align-items-end">
              <Col md={3}>
                <Form.Group>
                  <Form.Label style={{ fontWeight: "var(--font-weight-medium)" }}>
                    Date Filter
                  </Form.Label>
                  <Form.Select
                    value={dateFilterType}
                    onChange={(e) => setDateFilterType(e.target.value)}
                  >
                    <option value="betweenDates">Between Dates</option>
                  </Form.Select>
                </Form.Group>
              </Col>
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
              <Col md={3}>
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
              <Col md={2} className="d-flex gap-2">
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
          title="PH Discount Collection"
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
          {submitted && displayedData.length > 0 && (
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                borderTop: "1px solid var(--color-border)",
                padding: "0.5rem 0.75rem",
                fontWeight: "var(--font-weight-medium)",
                backgroundColor: "var(--color-table-header)",
              }}
            >
              <span>Total Discount</span>
              <span>{totalDiscount.toFixed(2)}</span>
            </div>
          )}
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

export default PhDiscountCollection;
