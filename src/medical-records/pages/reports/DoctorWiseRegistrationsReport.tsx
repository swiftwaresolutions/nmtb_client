import React, { useEffect, useMemo, useState } from "react";
import { Container, Card, Form, Button, Row, Col, Spinner } from "react-bootstrap";
import ReportHeader from "../../components/ReportHeader";
import ReportTable from "../../components/ReportTable";
import SearchInput from "../../../components/SearchInput";
import { useTableSearch } from "../../../hooks/useTableSearch";
import {
  exportToExcel,
  formatReportDate,
  getDateRangeText,
  printReport,
  sortTableData,
} from "../../utils/reportUtils";
import "../../styles/reportStyles.css";

interface DoctorWiseRegistrationsRow {
  slNo: number;
}

export default function DoctorWiseRegistrationsReport() {
  const today = new Date().toISOString().split("T")[0];

  const [fromDate, setFromDate] = useState<string>(today);
  const [toDate, setToDate] = useState<string>(today);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const [tableData, setTableData] = useState<DoctorWiseRegistrationsRow[]>([]);
  const [displayedData, setDisplayedData] = useState<DoctorWiseRegistrationsRow[]>([]);
  const [sortKey, setSortKey] = useState<keyof DoctorWiseRegistrationsRow | "">("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const { filteredData, searchTerm, setSearchTerm, resultCount, totalCount } = useTableSearch({
    data: tableData,
    searchFields: ["slNo"],
  });

  useEffect(() => {
    const sorted = sortKey ? sortTableData(filteredData, sortKey, sortDirection) : filteredData;
    setDisplayedData(sorted);
  }, [filteredData, sortKey, sortDirection]);

  const columns = useMemo(
    () => [
      {
        key: "slNo",
        label: "S.No",
        sortable: true,
        render: (_: DoctorWiseRegistrationsRow, __: DoctorWiseRegistrationsRow, idx: number) => idx + 1,
      },
    ],
    []
  );

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setIsSubmitted(true);
    setTableData([]);
    setSortKey("");
    setSortDirection("asc");
    setIsLoading(false);
  };

  const handleReset = () => {
    setFromDate(today);
    setToDate(today);
    setIsSubmitted(false);
    setTableData([]);
    setDisplayedData([]);
    setSearchTerm("");
    setSortKey("");
    setSortDirection("asc");
  };

  const handleSort = (key: string, direction: "asc" | "desc") => {
    setSortKey(key as keyof DoctorWiseRegistrationsRow);
    setSortDirection(direction);
  };

  const handlePrint = () => {
    printReport();
  };

  const handleExport = () => {
    const exportData = displayedData.map((_, index) => ({
      "S.No": index + 1,
    }));

    exportToExcel(
      exportData,
      `Doctor_Wise_Registrations_${formatReportDate(new Date(), "DD-MM-YYYY")}`,
      "Doctor Wise Registrations"
    );
  };

  const emptyMessage = !isSubmitted
    ? "No data loaded. Please select date range and click Submit."
    : searchTerm
      ? "No records match your search criteria."
      : "No records found.";

  return (
    <React.Fragment>
      <Container fluid className="px-4 py-3">
        <ReportHeader
          title="Doctor Wise Registrations"
          subtitle={isSubmitted ? getDateRangeText(fromDate, toDate) : "Select date range and click Submit"}
          onPrint={handlePrint}
          onExport={handleExport}
          showSearch={false}
          showSort={false}
          showPrint={displayedData.length > 0}
          showExport={displayedData.length > 0}
        />

        <Card className="mb-4 shadow-sm no-print">
          <Card.Body>
            <Form className="row g-3 align-items-end" onSubmit={handleFilterSubmit}>
              <Form.Group as={Col} md={4} controlId="fromDate">
                <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>From Date</Form.Label>
                <Form.Control
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group as={Col} md={4} controlId="toDate">
                <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>To Date</Form.Label>
                <Form.Control
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  required
                />
              </Form.Group>
              <Form.Group as={Col} md={4} className="d-flex align-items-end gap-2">
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

        {isSubmitted && (
          <Row className="mb-3 no-print">
            <Col>
              <SearchInput
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                placeholder="Search by S.No"
                resultCount={resultCount}
                totalCount={totalCount}
              />
            </Col>
          </Row>
        )}

        {isLoading ? (
          <div className="text-center py-5 text-muted">
            <Spinner animation="border" role="status" />
            <div className="mt-3">Loading doctor wise report...</div>
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
                columns={columns}
                onSort={handleSort}
                responsive={false}
                emptyMessage={emptyMessage}
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
                {searchTerm && <span className="ms-2">(Filtered from {filteredData.length})</span>}
              </small>
            </div>
          </Card>
        )}
      </Container>
    </React.Fragment>
  );
}
