import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Container, Card, Form, Button, Row, Col } from "react-bootstrap";
import { useSelector } from "react-redux";
import { RootState } from "../../../state/store";
import { CashCounterApiService } from "../../../api/cash-counter/cash-counter-api-service";
import { showErrorToast, showSuccessToast, showWarningToast } from "../../../utils/alertUtil";
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

interface InvestigationCollectionData {
  billNo: string;
  patName: string;
  opNo: string;
  total: number;
  disc: number;
  pay: number;
  paid: number;
  balance: number;
  cashPaid: string;
  bankPaid: string;
}

interface InvestigationRow {
  billNo: string;
  patientName: string;
  opNo: string;
  amount: number;
  discount: number;
  payable: number;
  paid: number;
  balance: number;
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

function InvestigationCollection() {
  const organization = useSelector((state: RootState) => state.appReducer.organization);
  const cashCounterApi = new CashCounterApiService();
  
  const today = new Date().toISOString().split('T')[0];
  const [fromDate, setFromDate] = useState<string>(today);
  const [toDate, setToDate] = useState<string>(today);
  const [filteredData, setFilteredData] = useState<InvestigationRow[]>([]);
  const [displayedData, setDisplayedData] = useState<InvestigationRow[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortKey, setSortKey] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [loading, setLoading] = useState<boolean>(false);
  const [dataLoaded, setDataLoaded] = useState<boolean>(false);

  const updateDisplayedData = useCallback(
    (
      records: InvestigationRow[],
      search: string,
      sortK: string,
      sortDir: "asc" | "desc"
    ) => {
      let result: InvestigationRow[] = records;

      if (search) {
        result = searchTableData(result, search, ["billNo", "patientName", "opNo"]);
      }

      if (sortK) {
        result = sortTableData(result, sortK as keyof InvestigationRow, sortDir);
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
        acc.amount += row.amount;
        acc.discount += row.discount;
        acc.payable += row.payable;
        acc.paid += row.paid;
        acc.balance += row.balance;
        // Parse cashPaid and bankPaid strings to numbers (ignore "-" values)
        const cashPaidValue = row.cashPaid !== "-" ? parseFloat(row.cashPaid) || 0 : 0;
        const bankPaidValue = row.bankPaid !== "-" ? parseFloat(row.bankPaid) || 0 : 0;
        acc.cashPaid += cashPaidValue;
        acc.bankPaid += bankPaidValue;
        return acc;
      },
      { amount: 0, discount: 0, payable: 0, paid: 0, balance: 0, cashPaid: 0, bankPaid: 0 }
    );
  }, [displayedData]);

  const tableWithTotal = useMemo<InvestigationRow[]>(() => {
    return [
      ...displayedData,
      {
        billNo: "",
        patientName: "Total",
        opNo: "",
        amount: totals.amount,
        discount: totals.discount,
        payable: totals.payable,
        paid: totals.paid,
        balance: totals.balance,
        cashPaid: formatAmount(totals.cashPaid),
        bankPaid: formatAmount(totals.bankPaid),
        isTotal: true
      }
    ];
  }, [displayedData, totals]);

  const fetchInvestigationCollection = async () => {
    if (!fromDate || !toDate) {
      showErrorToast("Please select both From Date and To Date");
      return;
    }

    if (new Date(fromDate) > new Date(toDate)) {
      showErrorToast("From Date cannot be greater than To Date");
      return;
    }

    setLoading(true);

    try {
      const response: InvestigationCollectionData[] = await cashCounterApi.fetchInvestigationCollection(
        fromDate,
        toDate
      );

      if (!response || response.length === 0) {
        showWarningToast("No data found for the selected date range");
        setFilteredData([]);
        setDataLoaded(true);
        return;
      }

      // Transform API data to component format
      const transformedData: InvestigationRow[] = response.map((item) => ({
        billNo: item.billNo,
        patientName: item.patName,
        opNo: item.opNo,
        amount: item.total,
        discount: item.disc,
        payable: item.pay,
        paid: item.paid,
        balance: item.balance,
        cashPaid: item.cashPaid,
        bankPaid: item.bankPaid
      }));

      setFilteredData(transformedData);
      setDataLoaded(true);
      showSuccessToast("Report generated successfully");
    } catch (error: any) {
      console.error("Error fetching investigation collection:", error);
      showErrorToast(
        error?.response?.data?.error || "Failed to fetch investigation collection data"
      );
      setFilteredData([]);
      setDataLoaded(false);
    } finally {
      setLoading(false);
    }
  };

  const handleFilterSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    fetchInvestigationCollection();
  };

  const handleReset = () => {
    setFromDate(new Date().toISOString().split('T')[0]);
    setToDate(new Date().toISOString().split('T')[0]);
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
      "Bill No": row.billNo,
      "Patient Name": row.patientName,
      "OP No": row.opNo,
      Amount: formatAmount(row.amount),
      Discount: formatAmount(row.discount),
      Payable: formatAmount(row.payable),
      Paid: formatAmount(row.paid),
      Balance: formatAmount(row.balance),
      "Cash Paid": row.cashPaid,
      "Bank Paid": row.bankPaid
    }));

    exportToExcel(
      exportData,
      `Investigation_Collection_${formatReportDate(new Date(), "DD-MM-YYYY")}`,
      "Investigation Collection"
    );
  };

  const columns = [
    {
      key: "slNo",
      label: "S. No",
      sortable: false,
      render: (_: any, record: InvestigationRow, index: number) => (record.isTotal ? "" : index + 1)
    },
    {
      key: "billNo",
      label: "Bill No",
      sortable: true,
      render: (value: string, record: InvestigationRow) =>
        record.isTotal ? (
          ""
        ) : (
          <span className="fw-bold text-primary">{value}</span>
        )
    },
    {
      key: "patientName",
      label: "Patient Name",
      sortable: true,
      render: (value: string, record: InvestigationRow) => (record.isTotal ? <strong>Total:</strong> : value)
    },
    {
      key: "opNo",
      label: "OP No",
      sortable: true,
      render: (value: string, record: InvestigationRow) => (record.isTotal ? "" : value)
    },
    {
      key: "amount",
      label: "Amount",
      sortable: true,
      render: (value: number, record: InvestigationRow) => renderAmountCell(value, record.isTotal)
    },
    {
      key: "discount",
      label: "Discount",
      sortable: true,
      render: (value: number, record: InvestigationRow) => renderAmountCell(value, record.isTotal)
    },
    {
      key: "payable",
      label: "Payable",
      sortable: true,
      render: (value: number, record: InvestigationRow) => renderAmountCell(value, record.isTotal)
    },
    {
      key: "paid",
      label: "Paid",
      sortable: true,
      render: (value: number, record: InvestigationRow) => renderAmountCell(value, record.isTotal)
    },
    {
      key: "balance",
      label: "Balance",
      sortable: true,
      render: (value: number, record: InvestigationRow) => renderAmountCell(value, record.isTotal)
    },
    {
      key: "cashPaid",
      label: "Cash Paid",
      sortable: true,
      render: (value: string, record: InvestigationRow) => (
        <span className={record.isTotal ? "fw-bold text-danger" : "fw-semibold text-gray-800"}>
          {value}
        </span>
      )
    },
    {
      key: "bankPaid",
      label: "Bank Paid",
      sortable: true,
      render: (value: string, record: InvestigationRow) => (
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
          title={`${organization?.name?.toUpperCase() || "HOSPITAL"} - Investigation Collection`}
          subtitle={dataLoaded ? getDateRangeText(fromDate, toDate) : "Select date range and click Submit"}
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
                  required 
                  disabled={loading}
                />
              </Form.Group>
              <Form.Group as={Col} md={4} controlId="toDate">
                <Form.Label style={{ fontWeight: 600 }}>To Date</Form.Label>
                <Form.Control 
                  type="date" 
                  value={toDate} 
                  onChange={e => setToDate(e.target.value)} 
                  required 
                  disabled={loading}
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
              height: "calc(100vh - 320px)",
              overflowY: "auto",
              overflowX: "auto",
              position: "relative"
            }}
          >
            <ReportTable
              data={tableWithTotal}
              columns={columns}
              onSort={handleSort}
              responsive={false}
              emptyMessage={
                loading
                  ? "Loading data..."
                  : searchTerm
                  ? "No records match your search criteria."
                  : dataLoaded
                  ? "No investigation collection data found for the selected date range."
                  : "No data loaded. Please select date range and click Submit."
              }
            />
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
              <Col md={4}>
                <small className="text-muted" style={{ fontWeight: 500 }}>
                  Total Data Rows: <strong>{displayedData.length}</strong>
                  {searchTerm && <span className="ms-2">(Filtered)</span>}
                </small>
              </Col>
              <Col md={8} className="text-md-end mt-2 mt-md-0">
                <strong>Cash Paid:</strong>{" "}
                <span className="text-success fw-bold">{formatAmount(totals.cashPaid)}</span>
                <span className="mx-3">|</span>
                <strong>Bank Paid:</strong>{" "}
                <span className="text-primary fw-bold">{formatAmount(totals.bankPaid)}</span>
                <span className="mx-3">|</span>
                <strong>Total Collection:</strong>{" "}
                <span className="text-danger fw-bold">{formatAmount(totals.paid)}</span>
              </Col>
            </Row>
          </div>
        </Card>
      </Container>
    </React.Fragment>
  );
}

export default InvestigationCollection;