import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Container, Card, Form, Button, Row, Col } from "react-bootstrap";
import { useSelector } from "react-redux";
import { RootState } from "../../../state/store";
import { CashCounterApiService } from "../../../api/cash-counter/cash-counter-api-service";
import {
  showErrorToast,
  showSuccessToast,
  showWarningToast,
} from "../../../utils/alertUtil";
import ReportHeader from "../../../medical-records/components/ReportHeader";
import ReportTable from "../../../medical-records/components/ReportTable";
import {
  searchTableData,
  sortTableData,
  exportToExcel,
  printReport,
  getDateRangeText
} from "../../../medical-records/utils/reportUtils";
import "../../../medical-records/styles/reportStyles.css";

interface DueRegisterData {
  patId: number;
  opNo: string;
  patName: string;
  billId: number;
  due: number;
}

interface DueRegisterRow {
  patientName: string;
  opNo: string;
  billNo: string;
  due: number;
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

function DueRegister() {
  const organization = useSelector((state: RootState) => state.appReducer.organization);
  const cashCounterApi = new CashCounterApiService();

  const today = new Date().toISOString().split("T")[0];
  const [fromDate, setFromDate] = useState<string>(today);
  const [toDate, setToDate] = useState<string>(today);
  const [dueFiltered, setDueFiltered] = useState<DueRegisterRow[]>([]);
  const [dueDisplayed, setDueDisplayed] = useState<DueRegisterRow[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortKey, setSortKey] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [loading, setLoading] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  const fetchDueRegister = async () => {
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
      const response: DueRegisterData[] = await cashCounterApi.fetchDueRegister(fromDate, toDate);
      
      const transformedData: DueRegisterRow[] = response.map((item) => ({
        patientName: item.patName,
        opNo: item.opNo,
        billNo: item.billId.toString(),
        due: item.due,
      }));

      setDueFiltered(transformedData);
      setDataLoaded(true);
      if (transformedData.length === 0) {
        showWarningToast("No data found for the selected date range");
      } else {
        showSuccessToast(`Loaded ${transformedData.length} due records`);
      }
    } catch (error: any) {
      console.error("Error fetching due register:", error);
      showErrorToast(error?.response?.data?.error || "Failed to fetch due register");
      setDueFiltered([]);
      setDataLoaded(false);
    } finally {
      setLoading(false);
    }
  };

  const updateDueDisplayed = useCallback(
    (records: DueRegisterRow[], search: string, sortK: string, sortDir: "asc" | "desc") => {
      let result: DueRegisterRow[] = records;

      if (search) {
        result = searchTableData(result, search, ["patientName", "opNo", "billNo"]);
      }

      if (sortK) {
        result = sortTableData(result, sortK as keyof DueRegisterRow, sortDir);
      }

      setDueDisplayed(result);
    },
    []
  );

  useEffect(() => {
    updateDueDisplayed(dueFiltered, searchTerm, sortKey, sortDirection);
  }, [dueFiltered, searchTerm, sortKey, sortDirection, updateDueDisplayed]);

  const dueTotals = useMemo(() => {
    return dueDisplayed
      .filter((row) => !row.isTotal)
      .reduce(
        (acc, row) => {
          acc.due += typeof row.due === "string" ? parseFloat(row.due) || 0 : row.due;
          return acc;
        },
        { due: 0 }
      );
  }, [dueDisplayed]);

  const dueTableWithTotal = useMemo<DueRegisterRow[]>(() => {
    if (dueDisplayed.length === 0) return [];
    return [
      ...dueDisplayed,
      {
        patientName: "Total",
        opNo: "",
        billNo: "",
        due: dueTotals.due,
        isTotal: true
      }
    ];
  }, [dueDisplayed, dueTotals]);

  const handleFilterSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    fetchDueRegister();
  };

  const handleReset = () => {
    const today = new Date().toISOString().split("T")[0];
    setFromDate(today);
    setToDate(today);
    setSearchTerm("");
    setSortKey("");
    setSortDirection("asc");
    setDueFiltered([]);
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
    const exportDue = dueDisplayed.map((row: DueRegisterRow, index: number) => ({
      "S.No": index + 1,
      "Patient Name": row.patientName,
      "OP No": row.opNo,
      "Bill No": row.billNo,
      "Due": formatAmount(row.due)
    }));

    exportToExcel(
      [{ sheetName: "Due Register", data: exportDue }],
      `Due_Register_${getDateRangeText(fromDate, toDate)}`
    );
  };

  const dueColumns = [
    { 
      key: "slNo", 
      label: "S. No", 
      sortable: false, 
      render: (_: any, record: DueRegisterRow, index: number) => (record.isTotal ? "" : index + 1) 
    },
    { 
      key: "patientName", 
      label: "Patient Name", 
      sortable: true, 
      render: (value: string, record: DueRegisterRow) => (record.isTotal ? <strong>Total:</strong> : value) 
    },
    { 
      key: "opNo", 
      label: "OP No", 
      sortable: true, 
      render: (value: string, record: DueRegisterRow) => (record.isTotal ? "" : value) 
    },
    { 
      key: "billNo", 
      label: "Bill No", 
      sortable: true, 
      render: (value: string, record: DueRegisterRow) => (record.isTotal ? "" : value) 
    },
    { 
      key: "due", 
      label: "Due", 
      sortable: true, 
      render: (value: number, record: DueRegisterRow) => renderAmountCell(value, record.isTotal) 
    }
  ];

  return (
    <React.Fragment>
      <Container fluid className="px-4 py-3">
        <ReportHeader
          title="Due Register"
          subtitle={
            dataLoaded
              ? `${organization?.name || "Hospital Name"} - ${getDateRangeText(fromDate, toDate)}`
              : "Select date range and click Submit"
          }
          onPrint={printReport}
          onExport={handleExport}
          onSearch={handleSearch}
          showSearch
          showSort={false}
          showPrint
          showExport
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
                data={dueTableWithTotal}
                columns={dueColumns}
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
                  Total Data Rows: <strong>{dueDisplayed.length}</strong>
                  {searchTerm && <span className="ms-2">(Filtered)</span>}
                </small>
              </Col>
              <Col md={6} className="text-md-end mt-2 mt-md-0">
                <strong>Total Due:</strong>{" "}
                <span className="text-danger fw-bold">{formatAmount(dueTotals.due)}</span>
              </Col>
            </Row>
          </div>
        </Card>
      </Container>
    </React.Fragment>
  );
}

export default DueRegister;