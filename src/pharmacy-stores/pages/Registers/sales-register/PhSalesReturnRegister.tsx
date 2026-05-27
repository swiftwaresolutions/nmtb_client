import React, { useState, useMemo } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  Row,
  Col,
  Spinner,
  Modal,
  Table,
} from "react-bootstrap";
import ReportHeader from "../../../../medical-records/components/ReportHeader";
import ReportTable from "../../../../medical-records/components/ReportTable";
import {
  searchTableData,
  sortTableData,
  exportToExcel,
  printReport,
  formatReportDate,
  getDateRangeText,
} from "../../../../medical-records/utils/reportUtils";
import "../../../../medical-records/styles/reportStyles.css";
import { showValidationError, showErrorToast } from "../../../../utils/alertUtil";
import {
  PharmacyStoresApiService,
  SalesReturnDetailsResponse,
  SalesMedicineItem,
} from "../../../../api/pharmacy-stores/pharmacy-stores-api-service";

interface ReturnRecord {
  finalBillId: number;
  billNo: string;
  returnBillNo: string;
  opNo: string;
  patientName: string;
  details: string;
  total: number;
  pay: number;
  paid: number;
  discount: number;
  payable: number;
  note: string;
  username: string;
  dateTime: string;
  medicines: SalesMedicineItem[];
}

interface PharmacySessionStoreData {
  masterId?: number;
}

const pharmacyApiService = new PharmacyStoresApiService();

const resolvePharmacyStoreId = (): number | null => {
  try {
    const pharmacyData = sessionStorage.getItem("pharmacySubModuleData");
    if (pharmacyData) {
      const parsed = JSON.parse(pharmacyData) as PharmacySessionStoreData;
      if (typeof parsed.masterId === "number" && parsed.masterId > 0) {
        return parsed.masterId;
      }
    }
  } catch {
    // ignore session parse errors
  }
  return null;
};

const fmt = (n: number) =>
  n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const formatDateTimeDisplay = (value: string): string => {
  if (!value) return "-";

  const dateObj = new Date(value);
  if (Number.isNaN(dateObj.getTime())) {
    return value;
  }

  const datePart = formatReportDate(dateObj, "DD/MM/YYYY");
  const timePart = dateObj.toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  });

  return `${datePart} ${timePart}`;
};

const TABLE_COLUMNS = [
  {
    key: "slNo",
    label: "S. No",
    sortable: false,
    render: (_: any, __: any, idx: number) => idx + 1,
  },
  {
    key: "returnBillNo",
    label: "Bill /Receipt No",
    sortable: true,
    render: (value: any, record: any) =>
      value ? (
        <span
          style={{
            color: "var(--bs-primary)",
            cursor: "pointer",
            fontWeight: "var(--font-weight-semibold)",
            textDecoration: "underline",
          }}
          onClick={(e) => {
            e.stopPropagation();
            (window as any).__viewReturnDetails?.(record);
          }}
        >
          {value}
        </span>
      ) : null,
  },
  { key: "opNo", label: "O. P Number", sortable: true },
  { key: "patientName", label: "Patient Name", sortable: true },
  { key: "details", label: "Details", sortable: false },
  {
    key: "total",
    label: "Total (Rs.)",
    sortable: true,
    render: (value: any) => (
      <span style={{ fontWeight: "var(--font-weight-medium)" }}>{fmt(value)}</span>
    ),
  },
  {
    key: "paid",
    label: "Paid (Rs.)",
    sortable: true,
    render: (value: any) => fmt(value),
  },
  { key: "note", label: "Note", sortable: false },
  {
    key: "username",
    label: "User",
    sortable: true,
    render: (value: any) => (
      <span
        style={{
          textTransform: "uppercase",
          fontWeight: "var(--font-weight-bold)",
          color: "var(--page-secondary-color)",
        }}
      >
        {String(value ?? "-")}
      </span>
    ),
  },
];

export default function PhSalesReturnRegister() {
  const today = new Date().toISOString().split("T")[0];

  const [fromDate, setFromDate] = useState<string>(today);
  const [toDate, setToDate] = useState<string>(today);
  const [allRecords, setAllRecords] = useState<ReturnRecord[]>([]);
  const [displayedData, setDisplayedData] = useState<ReturnRecord[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortKey, setSortKey] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<ReturnRecord | null>(null);

  (window as any).__viewReturnDetails = (record: ReturnRecord) => {
    setSelectedRecord(record);
    setShowDetailsModal(true);
  };

  React.useEffect(() => {
    let result = [...allRecords];
    if (searchTerm) {
      result = searchTableData(result, searchTerm, [
        "returnBillNo",
        "billNo",
        "opNo",
        "patientName",
        "details",
        "note",
        "username",
      ]);
    }
    if (sortKey) {
      result = sortTableData(result, sortKey as keyof ReturnRecord, sortDirection);
    }
    setDisplayedData(result);
  }, [searchTerm, sortKey, sortDirection, allRecords]);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromDate || !toDate) {
      showValidationError("Please select both From Date and To Date.", "Validation");
      return;
    }
    if (fromDate > toDate) {
      showValidationError("From Date cannot be later than To Date.", "Validation");
      return;
    }

    const storeId = resolvePharmacyStoreId();

    if (!storeId) {
      showValidationError("Pharmacy store context is missing. Please reselect the store.");
      return;
    }

    setLoading(true);
    setSubmitted(false);
    pharmacyApiService
      .fetchSalesReturnDetails(fromDate, toDate, storeId)
      .then((response: SalesReturnDetailsResponse[]) => {
        const mapped: ReturnRecord[] = response.map((item) => ({
          finalBillId: item.finalBillId,
          billNo: item.billNo,
          returnBillNo: item.returnBillNo || item.billNo,
          opNo: item.opNo,
          patientName: `${item.patientName} ${item.secondName ?? ""}`.trim(),
          details: `${item.medicines?.length ?? 0} item(s)`,
          total: item.total,
          pay: item.pay,
          paid: item.paid,
          discount: item.discount,
          payable: item.total - item.discount,
          note: item.note,
          username: item.username,
          dateTime: item.dateTime,
          medicines: item.medicines ?? [],
        }));

        setAllRecords(mapped);
        setDisplayedData(mapped);
        setSubmitted(true);
      })
      .catch(() => {
        showErrorToast("Failed to fetch sales return data. Please try again.");
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const handleReset = () => {
    setFromDate(today);
    setToDate(today);
    setAllRecords([]);
    setDisplayedData([]);
    setSearchTerm("");
    setSortKey("");
    setSortDirection("asc");
    setSubmitted(false);
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
    const exportData = displayedData.map((r, i) => ({
      "S. No": i + 1,
      "Bill /Receipt No": r.returnBillNo,
      "O. P Number": r.opNo,
      "Patient Name": r.patientName,
      Details: r.details,
      "Total (Rs.)": r.total.toFixed(2),
      "Paid (Rs.)": r.paid.toFixed(2),
      Note: r.note,
      User: r.username,
    }));
    exportToExcel(
      exportData,
      `Sales_Return_Register_${formatReportDate(new Date(), "DD-MM-YYYY")}`,
      "Sales Return Register"
    );
  };

  const grandTotals = useMemo(() => {
    return displayedData.reduce(
      (acc, r) => ({
        total: acc.total + r.total,
        discount: acc.discount + r.discount,
        payable: acc.payable + r.payable,
        paid: acc.paid + r.paid,
      }),
      { total: 0, discount: 0, payable: 0, paid: 0 }
    );
  }, [displayedData]);

  const clearSelectedRecord = () => {
    setShowDetailsModal(false);
    setSelectedRecord(null);
  };

  return (
    <React.Fragment>
      <Container fluid className="px-4 pt-3 pb-1">
        <ReportHeader
          title="Sales Return Register"
          subtitle={
            submitted
              ? getDateRangeText(fromDate, toDate)
              : "Select date range and click Submit"
          }
          onPrint={printReport}
          onExport={handleExport}
          onSearch={(term) => setSearchTerm(term)}
          showSearch={submitted}
          showSort={false}
          showPrint={submitted}
          showExport={submitted}
        />

        <Card className="mb-0 shadow-sm report-card" style={{ minHeight: "calc(100vh - 240px)" }}>
          <Card.Header className="no-print">
            <Form className="row g-3 align-items-end" onSubmit={handleFilterSubmit}>
              <Form.Group as={Col} md={4} controlId="fromDate">
                <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>
                  From Date
                </Form.Label>
                <Form.Control
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                  max={today}
                  lang="en-CA"
                  required
                />
              </Form.Group>
              <Form.Group as={Col} md={4} controlId="toDate">
                <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>
                  To Date
                </Form.Label>
                <Form.Control
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                  max={today}
                  lang="en-CA"
                  required
                />
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
          </Card.Header>

          <Card.Body style={{ padding: "0.75rem", display: "flex", flexDirection: "column" }}>
            {loading ? (
              <div className="text-center py-5 text-muted">
                <Spinner animation="border" role="status" />
                <div className="mt-3">Loading sales return register...</div>
              </div>
            ) : (
              <div
                style={{
                  height: "100%",
                  minHeight: "280px",
                  overflowY: "auto",
                  overflowX: "auto",
                  position: "relative",
                }}
              >
                <ReportTable
                  data={displayedData}
                  columns={TABLE_COLUMNS}
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
            )}
          </Card.Body>

          <Card.Footer>
            <div className="d-flex flex-wrap align-items-center justify-content-between gap-2">
              <small className="text-muted" style={{ fontWeight: "var(--font-weight-medium)" }}>
                Total Data Rows: <strong>{displayedData.length}</strong>
                {searchTerm && (
                  <span className="ms-2">(Filtered from {allRecords.length})</span>
                )}
              </small>
              {submitted && displayedData.length > 0 && (
                <div className="d-flex flex-wrap gap-3">
                  <span style={{ fontWeight: "var(--font-weight-medium)", fontSize: "var(--font-size-sm)" }}>
                    Grand Total:&nbsp;<strong>{fmt(grandTotals.total)}</strong>
                  </span>
                  <span style={{ fontWeight: "var(--font-weight-medium)", fontSize: "var(--font-size-sm)" }}>
                    Grand Discount:&nbsp;<strong>{fmt(grandTotals.discount)}</strong>
                  </span>
                  <span style={{ fontWeight: "var(--font-weight-medium)", fontSize: "var(--font-size-sm)" }}>
                    Grand Payable:&nbsp;<strong>{fmt(grandTotals.payable)}</strong>
                  </span>
                  <span style={{ fontWeight: "var(--font-weight-medium)", fontSize: "var(--font-size-sm)" }}>
                    Grand Paid:&nbsp;<strong>{fmt(grandTotals.paid)}</strong>
                  </span>
                </div>
              )}
            </div>
          </Card.Footer>
        </Card>
      </Container>

      <Modal show={showDetailsModal} onHide={clearSelectedRecord} size="xl" centered>
        <Modal.Header closeButton>
          <Modal.Title style={{ fontWeight: "var(--font-weight-semibold)" }}>
            Return Bill Details {selectedRecord ? `- ${selectedRecord.returnBillNo}` : ""}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: "1rem" }}>
          {selectedRecord && (
            <>
              <div
                className="mb-3 p-3"
                style={{
                  background: "#f8f9fa",
                  borderRadius: "6px",
                  border: "1px solid #dee2e6",
                }}
              >
                <Row className="g-2 align-items-center">
                  <Col xs={12} className="mb-1">
                    <span style={{ fontSize: "var(--font-size-sm)" }}>Bill No :&nbsp;</span>
                    <span style={{ fontWeight: "var(--font-weight-semibold)", color: "#000080" }}>
                      {selectedRecord.returnBillNo}
                    </span>
                    <span className="ms-4" style={{ fontSize: "var(--font-size-sm)" }}>Date :&nbsp;</span>
                    <span style={{ fontWeight: "var(--font-weight-medium)" }}>
                      {formatDateTimeDisplay(selectedRecord.dateTime)}
                    </span>
                  </Col>
                  <Col md={4}>
                    <span style={{ fontSize: "var(--font-size-sm)" }}>O.P No :&nbsp;</span>
                    <span style={{ fontWeight: "var(--font-weight-medium)", color: "#000080" }}>
                      {selectedRecord.opNo}
                    </span>
                  </Col>
                  <Col md={4}>
                    <span style={{ fontSize: "var(--font-size-sm)" }}>Patient Name :&nbsp;</span>
                    <span style={{ fontWeight: "var(--font-weight-medium)", color: "#000080" }}>
                      {selectedRecord.patientName}
                    </span>
                  </Col>
                  <Col md={4}>
                    <span style={{ fontSize: "var(--font-size-sm)" }}>User :&nbsp;</span>
                    <span
                      style={{
                        textTransform: "uppercase",
                        fontWeight: "var(--font-weight-bold)",
                        color: "var(--page-secondary-color)",
                      }}
                    >
                      {selectedRecord.username}
                    </span>
                  </Col>
                  <Col md={4}>
                    <span style={{ fontSize: "var(--font-size-sm)" }}>Pay :&nbsp;</span>
                    <span style={{ fontWeight: "var(--font-weight-medium)" }}>
                      {fmt(selectedRecord.pay)}
                    </span>
                  </Col>
                  <Col md={4}>
                    <span style={{ fontSize: "var(--font-size-sm)" }}>Paid :&nbsp;</span>
                    <span style={{ fontWeight: "var(--font-weight-medium)" }}>
                      {fmt(selectedRecord.paid)}
                    </span>
                  </Col>
                  {selectedRecord.note && (
                    <Col xs={12}>
                      <span style={{ fontSize: "var(--font-size-sm)" }}>Return Reason :&nbsp;</span>
                      <span
                        style={{
                          fontWeight: "var(--font-weight-medium)",
                          color: "var(--bs-danger)",
                        }}
                      >
                        {selectedRecord.note}
                      </span>
                    </Col>
                  )}
                </Row>
              </div>

              <div style={{ overflowX: "auto" }}>
                <Table bordered size="sm" className="mb-0">
                  <thead className="table-dark">
                    <tr>
                      <th className="text-center" style={{ width: "5%" }}>S. No.</th>
                      <th style={{ width: "25%" }}>Medicine Name</th>
                      <th className="text-center" style={{ width: "12%" }}>Batch</th>
                      <th className="text-center" style={{ width: "12%" }}>Expiry Date</th>
                      <th className="text-end" style={{ width: "10%" }}>M.R.P</th>
                      <th className="text-end" style={{ width: "11%" }}>Discount (Rs.)</th>
                      <th className="text-end" style={{ width: "8%" }}>Qty</th>
                      <th className="text-end" style={{ width: "13%" }}>Total (Rs.)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRecord.medicines.map((item, idx) => (
                      <tr key={idx}>
                        <td className="text-center">{idx + 1}</td>
                        <td>{item.medicineName}</td>
                        <td className="text-center">{item.batchNo}</td>
                        <td className="text-center">{item.expiryDate}</td>
                        <td className="text-end">{fmt(item.mrp)}</td>
                        <td className="text-end">{fmt(item.discountAmt)}</td>
                        <td className="text-end">{item.units}</td>
                        <td className="text-end">{fmt(item.total)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr style={{ fontWeight: "var(--font-weight-semibold)", background: "#fff8f8" }}>
                      <td colSpan={7} className="text-end">Sub Total (Rs.)</td>
                      <td className="text-end">{fmt(selectedRecord.total)}</td>
                    </tr>
                    <tr>
                      <td colSpan={7} className="text-end">Discount (Rs.)</td>
                      <td className="text-end">{fmt(selectedRecord.discount)}</td>
                    </tr>
                    <tr style={{ fontWeight: "var(--font-weight-bold)", color: "#800000" }}>
                      <td colSpan={7} className="text-end">Net Payable (Rs.)</td>
                      <td className="text-end">{fmt(selectedRecord.payable)}</td>
                    </tr>
                  </tfoot>
                </Table>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={clearSelectedRecord}>Close</Button>
        </Modal.Footer>
      </Modal>
    </React.Fragment>
  );
}
