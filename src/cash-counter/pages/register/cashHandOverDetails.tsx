import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Container, Card, Form, Button, Row, Col, Modal, Table } from "react-bootstrap";
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

interface CashHandoverRow {
  userName: string;
  receiptNo: string;
  startTime: string;
  endTime: string;
  handleTime: string;
  physicalCash: number;
  accountCash: number;
  isTotal?: boolean;
}

interface CashHandoverDetail extends CashHandoverRow {
  denomination: { label: string; count: number; amount: number }[];
}

const CASH_HANDOVER_DATA: CashHandoverRow[] = [
  {
    userName: "Admin",
    receiptNo: "ADMIN-1",
    startTime: "2022-12-06 14:12:00.0",
    endTime: "2025-12-06 14:12:00.0",
    handleTime: "2025-12-06 14:12:50.0",
    physicalCash: 0.0,
    accountCash: 10125.0
  }
];

const CASH_HANDOVER_DETAILS: Record<string, CashHandoverDetail> = {
  "ADMIN-1": {
    userName: "Admin",
    receiptNo: "ADMIN-1",
    startTime: "2022-12-06 14:12:00.0",
    endTime: "2025-12-06 14:12:00.0",
    handleTime: "2025-12-06 14:12:50.0",
    physicalCash: 0.0,
    accountCash: 10125.0,
    denomination: [
      { label: "1000", count: 0, amount: 0.0 },
      { label: "500", count: 0, amount: 0.0 },
      { label: "100", count: 0, amount: 0.0 },
      { label: "50", count: 0, amount: 0.0 },
      { label: "20", count: 0, amount: 0.0 },
      { label: "10", count: 0, amount: 0.0 },
      { label: "5", count: 0, amount: 0.0 },
      { label: "1", count: 0, amount: 0.0 }
    ],
    isTotal: false
  }
};

const initialFromDate = "2022-12-01";
const initialToDate = "2025-12-31";

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

function CashHandOverDetails() {
  const [fromDate, setFromDate] = useState<string>(initialFromDate);
  const [toDate, setToDate] = useState<string>(initialToDate);
  const [filteredData, setFilteredData] = useState<CashHandoverRow[]>(CASH_HANDOVER_DATA);
  const [displayedData, setDisplayedData] = useState<CashHandoverRow[]>(CASH_HANDOVER_DATA);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortKey, setSortKey] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedDetail, setSelectedDetail] = useState<CashHandoverDetail | null>(null);
  const [showModal, setShowModal] = useState(false);

  const updateDisplayedData = useCallback(
    (
      records: CashHandoverRow[],
      search: string,
      sortK: string,
      sortDir: "asc" | "desc"
    ) => {
      let result: CashHandoverRow[] = records;

      if (search) {
        result = searchTableData(result, search, ["userName", "receiptNo"]);
      }

      if (sortK) {
        result = sortTableData(result, sortK as keyof CashHandoverRow, sortDir);
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
        acc.physicalCash += row.physicalCash;
        acc.accountCash += row.accountCash;
        return acc;
      },
      { physicalCash: 0, accountCash: 0 }
    );
  }, [displayedData]);

  const tableWithTotal = useMemo<CashHandoverRow[]>(() => {
    return [
      ...displayedData,
      {
        userName: "Total",
        receiptNo: "",
        startTime: "",
        endTime: "",
        handleTime: "",
        physicalCash: totals.physicalCash,
        accountCash: totals.accountCash,
        isTotal: true
      }
    ];
  }, [displayedData, totals]);

  const handleFilterSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setFilteredData(CASH_HANDOVER_DATA);
  };

  const handleReset = () => {
    setFromDate(initialFromDate);
    setToDate(initialToDate);
    setSearchTerm("");
    setSortKey("");
    setSortDirection("asc");
    setFilteredData(CASH_HANDOVER_DATA);
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

  const handleReceiptClick = (receiptNo: string) => {
    const detail = CASH_HANDOVER_DETAILS[receiptNo];
    if (detail) {
      setSelectedDetail(detail);
      setShowModal(true);
    }
  };

  const handleExport = () => {
    const exportData = displayedData.map((row, index) => ({
      "S.I.No": index + 1,
      "User Name": row.userName,
      "Receipt No": row.receiptNo,
      "Start Time": row.startTime,
      "End Time": row.endTime,
      "Handle Time": row.handleTime,
      "Physical Cash": formatAmount(row.physicalCash),
      "Account Cash": formatAmount(row.accountCash)
    }));

    exportToExcel(
      exportData,
      `Cash_Handover_${fromDate}_to_${toDate}`,
      "Cash Handover"
    );
  };

  const columns = [
    {
      key: "slNo",
      label: "S.I.No",
      sortable: false,
      render: (_: any, record: CashHandoverRow, index: number) => (record.isTotal ? "" : index + 1)
    },
    { key: "userName", label: "User Name", sortable: true, render: (value: string, record: CashHandoverRow) => (record.isTotal ? <strong>Total:</strong> : value) },
    { key: "receiptNo", label: "Receipt No", sortable: true, render: (value: string, record: CashHandoverRow) => (
      record.isTotal ? "" : (
        <Button
          variant="link"
          className="p-0 fw-bold text-primary"
          onClick={() => handleReceiptClick(value)}
          style={{ textDecoration: "none" }}
        >
          {value}
        </Button>
      )
    ) },
    { key: "startTime", label: "Start Time", sortable: true, render: (value: string, record: CashHandoverRow) => (record.isTotal ? "" : value) },
    { key: "endTime", label: "End Time", sortable: true, render: (value: string, record: CashHandoverRow) => (record.isTotal ? "" : value) },
    { key: "handleTime", label: "Handle Time", sortable: true, render: (value: string, record: CashHandoverRow) => (record.isTotal ? "" : value) },
    {
      key: "physicalCash",
      label: "Physical Cash",
      sortable: true,
      render: (value: number, record: CashHandoverRow) => renderAmountCell(value, record.isTotal)
    },
    {
      key: "accountCash",
      label: "Account Cash",
      sortable: true,
      render: (value: number, record: CashHandoverRow) => renderAmountCell(value, record.isTotal)
    }
  ];

  return (
    <React.Fragment>
      <Container fluid className="px-4 py-3">
        <ReportHeader
          title="Cash Handover Details"
          subtitle={getDateRangeText(fromDate, toDate)}
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
                <Form.Control type="date" value={fromDate} onChange={e => setFromDate(e.target.value)} required />
              </Form.Group>
              <Form.Group as={Col} md={4} controlId="toDate">
                <Form.Label style={{ fontWeight: 600 }}>To Date</Form.Label>
                <Form.Control type="date" value={toDate} onChange={e => setToDate(e.target.value)} required />
              </Form.Group>
              <Form.Group as={Col} md={4} className="d-flex align-items-end gap-2">
                <Button type="submit" variant="primary" className="w-50">
                  Submit
                </Button>
                <Button type="button" variant="secondary" className="w-50" onClick={handleReset}>
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
                <strong>Account Cash Total:</strong>{" "}
                <span className="text-danger fw-bold">{formatAmount(totals.accountCash)}</span>
              </Col>
            </Row>
          </div>
        </Card>
      </Container>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Cash Handover Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedDetail ? (
            <div className="d-flex flex-column gap-3">
              <Card className="border-0 shadow-sm">
                <Card.Body>
                  <Row className="mb-2">
                    <Col md={6}><strong>Receipt No:</strong> {selectedDetail.receiptNo}</Col>
                    <Col md={6}><strong>Cashier Name:</strong> {selectedDetail.userName}</Col>
                  </Row>
                  <Row className="mb-2">
                    <Col md={6}><strong>From Time:</strong> {selectedDetail.startTime}</Col>
                    <Col md={6}><strong>To Time:</strong> {selectedDetail.endTime}</Col>
                  </Row>
                  <Row className="mb-2">
                    <Col md={6}><strong>Entry Date Time:</strong> {selectedDetail.handleTime}</Col>
                    <Col md={6}><strong>User:</strong> {selectedDetail.userName}</Col>
                  </Row>
                  <Row>
                    <Col md={6}><strong>Account Cash:</strong> {formatAmount(selectedDetail.accountCash)}</Col>
                  </Row>
                </Card.Body>
              </Card>

              <Card className="border-0 shadow-sm">
                <Card.Header className="fw-bold bg-light">In Denomination</Card.Header>
                <Card.Body className="p-0">
                  <Table bordered hover size="sm" className="mb-0">
                    <thead >
                      <tr>
                        <th className="text-center">Value</th>
                        <th className="text-center">Count</th>
                        <th className="text-end">Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedDetail.denomination.map((d, idx) => (
                        <tr key={idx}>
                          <td className="text-center">{d.label}</td>
                          <td className="text-center">{d.count}</td>
                          <td className="text-end">{formatAmount(d.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot>
                      <tr className="table-secondary fw-bold">
                        <td colSpan={2} className="text-end">Physical Cash</td>
                        <td className="text-end">{formatAmount(selectedDetail.physicalCash)}</td>
                      </tr>
                    </tfoot>
                  </Table>
                </Card.Body>
              </Card>
            </div>
          ) : (
            <div>No details available.</div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </React.Fragment>
  );
}

export default CashHandOverDetails;