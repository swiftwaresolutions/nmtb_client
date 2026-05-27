import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Container, Card, Form, Button, Row, Col } from "react-bootstrap";
import { useSelector } from "react-redux";
import { RootState } from "../../../state/store";
import ReportHeader from "../../../medical-records/components/ReportHeader";
import ReportTable from "../../../medical-records/components/ReportTable";
import {
  searchTableData,
  sortTableData,
  exportToExcel,
  printReport,
  formatReportDate,
  getDateRangeText
} from "../../../medical-records/utils/reportUtils";
import "../../../medical-records/styles/reportStyles.css";
import { CashCounterApiService } from "../../../api/cash-counter/cash-counter-api-service";
import {
  showErrorToast,
  showSuccessToast,
  showWarningToast,
} from "../../../utils/alertUtil";

interface DueCollectionData {
  patId: number;
  opNo: string;
  patName: string;
  billId: number;
  total: number;
  cashPaid: string;
  bankPaid: string;
}

interface DueCollectionRow {
  patientName: string;
  opNo: string;
  billNo: string;
  total: number;
  cashPaid: string;
  bankPaid: string;
  isTotal?: boolean;
}

function formatAmount(value: number): string {
  return value.toFixed(2);
}

function renderAmountCell(value: number, isTotal?: boolean) {
  return (
    <span className={isTotal ? "fw-bold text-danger" : "fw-semibold text-gray-800"}>
      {formatAmount(value)}
    </span>
  );
}

function DueCollection() {
  const organization = useSelector((state: RootState) => state.appReducer.organization);
  const cashCounterApi = new CashCounterApiService();
  
  const today = new Date().toISOString().split('T')[0];
  const [fromDate, setFromDate] = useState<string>(today);
  const [toDate, setToDate] = useState<string>(today);
  const [filteredData, setFilteredData] = useState<DueCollectionRow[]>([]);
  const [displayedData, setDisplayedData] = useState<DueCollectionRow[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortKey, setSortKey] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [loading, setLoading] = useState<boolean>(false);
  const [dataLoaded, setDataLoaded] = useState<boolean>(false);

  const fetchDueCollection = async () => {
    if (!fromDate || !toDate) {
      showWarningToast("Please select both From Date and To Date");
      return;
    }

    if (new Date(fromDate) > new Date(toDate)) {
      showWarningToast("From Date cannot be greater than To Date");
      return;
    }

    setLoading(true);
    try {
      const response: DueCollectionData[] = await cashCounterApi.fetchDueCollectionRegister(
        fromDate,
        toDate
      );

      if (!response || response.length === 0) {
        showWarningToast("No data found for the selected date range");
        setFilteredData([]);
        setDataLoaded(true);
        return;
      }

      const transformedData: DueCollectionRow[] = response.map((item) => ({
        patientName: item.patName,
        opNo: item.opNo,
        billNo: item.billId.toString(),
        total: item.total,
        cashPaid: item.cashPaid,
        bankPaid: item.bankPaid,
      }));

      setFilteredData(transformedData);
      setDataLoaded(true);
      showSuccessToast("Report generated successfully");
    } catch (error: any) {
      console.error("Error fetching due collection:", error);
      showErrorToast(
        error?.response?.data?.error || "Failed to fetch due collection data"
      );
      setFilteredData([]);
      setDataLoaded(false);
    } finally {
      setLoading(false);
    }
  };

  const updateDisplayedData = useCallback(
    (
      records: DueCollectionRow[],
      search: string,
      sortK: string,
      sortDir: "asc" | "desc"
    ) => {
      let result: DueCollectionRow[] = records;

      if (search) {
        result = searchTableData(result, search, ["patientName", "opNo", "billNo"]);
      }

      if (sortK) {
        result = sortTableData(result, sortK as keyof DueCollectionRow, sortDir);
      }

      setDisplayedData(result);
    },
    []
  );

  useEffect(() => {
    updateDisplayedData(filteredData, searchTerm, sortKey, sortDirection);
  }, [filteredData, searchTerm, sortKey, sortDirection, updateDisplayedData]);

  const totals = useMemo(() => {
    return displayedData.reduce(
      (acc, row) => {
        acc.total += row.total;
        
        const cashPaidValue = row.cashPaid !== "-" ? parseFloat(row.cashPaid) || 0 : 0;
        const bankPaidValue = row.bankPaid !== "-" ? parseFloat(row.bankPaid) || 0 : 0;
        acc.cashPaid += cashPaidValue;
        acc.bankPaid += bankPaidValue;
        
        return acc;
      },
      { total: 0, cashPaid: 0, bankPaid: 0 }
    );
  }, [displayedData]);

  const tableWithTotal = useMemo<DueCollectionRow[]>(() => {
    return [
      ...displayedData,
      {
        patientName: "Total",
        opNo: "",
        billNo: "",
        total: totals.total,
        cashPaid: formatAmount(totals.cashPaid),
        bankPaid: formatAmount(totals.bankPaid),
        isTotal: true
      }
    ];
  }, [displayedData, totals]);

  const handleFilterSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    fetchDueCollection();
  };

  const handleReset = () => {
    const today = new Date().toISOString().split('T')[0];
    setFromDate(today);
    setToDate(today);
    setSearchTerm("");
    setSortKey("");
    setSortDirection("asc");
    setFilteredData([]);
    setDataLoaded(false);
  };

  const handleSearch = (term: string) => {
    setSearchTerm(term);
  };

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const handleExport = () => {
    const exportData = displayedData.map((row, index) => ({
      "S.No": index + 1,
      "Patient Name": row.patientName,
      "OP No": row.opNo,
      "Bill No": row.billNo,
      Total: formatAmount(row.total),
      "Cash Paid": row.cashPaid,
      "Bank Paid": row.bankPaid
    }));

    exportToExcel(
      exportData,
      `Due_Collection_${formatReportDate(new Date(), "DD-MM-YYYY")}`,
      "Due Collection"
    );
  };

  const columns = [
    {
      key: "slNo",
      label: "S. No",
      sortable: false,
      render: (_: any, record: DueCollectionRow, index: number) => (record.isTotal ? "" : index + 1)
    },
    {
      key: "patientName",
      label: "Patient Name",
      sortable: true,
      render: (value: string, record: DueCollectionRow) => (record.isTotal ? <strong>{value}</strong> : value)
    },
    { key: "opNo", label: "OP No", sortable: true, render: (value: string, record: DueCollectionRow) => (record.isTotal ? "" : value) },
    { key: "billNo", label: "Bill No", sortable: true, render: (value: string, record: DueCollectionRow) => (record.isTotal ? "" : value) },
    {
      key: "total",
      label: "Total",
      sortable: true,
      render: (value: number, record: DueCollectionRow) => renderAmountCell(value, record.isTotal)
    },
    {
      key: "cashPaid",
      label: "Cash Paid",
      sortable: true,
      render: (value: string, record: DueCollectionRow) => (
        <span className={record.isTotal ? "fw-bold text-danger" : "fw-semibold text-gray-800"}>
          {value}
        </span>
      )
    },
    {
      key: "bankPaid",
      label: "Bank Paid",
      sortable: true,
      render: (value: string, record: DueCollectionRow) => (
        <span className={record.isTotal ? "fw-bold text-danger" : "fw-semibold text-gray-800"}>
          {value}
        </span>
      )
    }
  ];

  return (
    <React.Fragment>
      <Container fluid className="px-4 py-3">
        <ReportHeader
          title={`${organization?.name?.toUpperCase() || "HOSPITAL"} - Due Collection`}
          subtitle={getDateRangeText(fromDate, toDate)}
          onPrint={printReport}
          onExport={handleExport}
          onSearch={handleSearch}
          showSearch={dataLoaded}
          showSort={false}
          showPrint={dataLoaded}
          showExport={dataLoaded}
        />

        <Card className="mb-4 shadow-sm no-print">
          <Card.Body>
            <Form className="row g-3 align-items-end" onSubmit={handleFilterSubmit}>
              <Form.Group as={Col} md={4} controlId="fromDate">
                <Form.Label style={{ fontWeight: 600 }}>From Date</Form.Label>
                <Form.Control 
                  type="date" 
                  value={fromDate} 
                  onChange={e => setFromDate(e.target.value)} 
                  disabled={loading}
                  required 
                />
              </Form.Group>
              <Form.Group as={Col} md={4} controlId="toDate">
                <Form.Label style={{ fontWeight: 600 }}>To Date</Form.Label>
                <Form.Control 
                  type="date" 
                  value={toDate} 
                  onChange={e => setToDate(e.target.value)} 
                  disabled={loading}
                  required 
                />
              </Form.Group>
              <Form.Group as={Col} md={4} className="d-flex align-items-end gap-2">
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
                  disabled={loading}
                >
                  Reset
                </Button>
              </Form.Group>
            </Form>
          </Card.Body>
        </Card>

        <Card className="report-card" style={{ padding: "0.75rem" }}>
          <div
            style={{
              maxHeight: "calc(115vh - 500px)",
              minHeight: "350px",
              overflowY: "auto",
              overflowX: "auto",
              position: "relative"
            }}
          >
            {loading ? (
              <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "350px" }}>
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
              </div>
            ) : (
              <ReportTable
                data={tableWithTotal}
                columns={columns}
                onSort={handleSort}
                responsive={false}
                emptyMessage={
                  searchTerm
                    ? "No records match your search criteria."
                    : "No data loaded. Please select date range and click Submit."
                }
              />
            )}
          </div>

          <div
            style={{
              padding: "0.5rem 1rem",
              borderTop: "2px solid #e0e0e0",
              background: "linear-gradient(to right, #f8f9fa, #ffffff)",
              textAlign: "start"
            }}
          >
            <Row className="align-items-center">
              <Col md={6}>
                <small className="text-muted" style={{ fontWeight: 500 }}>
                  Total Data Rows: <strong>{displayedData.length}</strong>
                  {searchTerm && <span className="ms-2">(Filtered)</span>}
                </small>
              </Col>
              <Col md={6} className="text-md-end mt-2 mt-md-0">
                <div className="d-flex flex-column align-items-end gap-1">
                  <div>
                    <strong>Cash Paid:</strong>{" "}
                    <span className="text-success fw-bold">{formatAmount(totals.cashPaid)}</span>
                  </div>
                  <div>
                    <strong>Bank Paid:</strong>{" "}
                    <span className="text-primary fw-bold">{formatAmount(totals.bankPaid)}</span>
                  </div>
                  <div>
                    <strong>Total Collection:</strong>{" "}
                    <span className="text-danger fw-bold">{formatAmount(totals.cashPaid + totals.bankPaid)}</span>
                  </div>
                </div>
              </Col>
            </Row>
          </div>
        </Card>
      </Container>
    </React.Fragment>
  );
}

export default DueCollection;