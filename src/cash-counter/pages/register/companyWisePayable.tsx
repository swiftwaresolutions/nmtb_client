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

interface CompanyPayableRow {
  accountType: string;
  amount: number;
  returnAmount: number;
  isTotal?: boolean;
}

interface CompanyPayableDetail {
  accountType: string;
  amount: number;
  returnAmount: number;
  lines: { label: string; value: number }[];
  patientName?: string;
  hospitalNumber?: string;
  employeeNumber?: string;
  items?: {
    slNo: number;
    billNo: string;
    billDate: string;
    name: string;
    mrp: number;
    unit: number;
    amount: number;
  }[];
  summary?: {
    netTotal: number;
    totalCashPaid: number;
    advanceAdjustment: number;
    totalDue: number;
    totalCharity: number;
    grandTotal: number;
  };
}

const COMPANY_PAYABLE_DATA: CompanyPayableRow[] = [
  { accountType: "NA", amount: 450.0, returnAmount: 0.0 },
  { accountType: "BAGI", amount: 250654.0, returnAmount: 0.0 },
  { accountType: "CARE", amount: 20542.0, returnAmount: 0.0 }
];

const COMPANY_PAYABLE_DETAILS: Record<string, CompanyPayableDetail> = {
  NA: {
    accountType: "NA",
    amount: 450.0,
    returnAmount: 0.0,
    lines: [
      { label: "Total Amount", value: 450.0 },
      { label: "Return Amount", value: 0.0 }
    ],
    patientName: "Chandran",
    hospitalNumber: "126639",
    employeeNumber: "",
    items: [
      {
        slNo: 1,
        billNo: "51817",
        billDate: "17/09/2025",
        name: "SKULL AP",
        mrp: 150,
        unit: 1,
        amount: 150
      },
      {
        slNo: 2,
        billNo: "51817",
        billDate: "17/09/2025",
        name: "RT WRIST AP/LAT",
        mrp: 300,
        unit: 1,
        amount: 300
      }
    ],
    summary: {
      netTotal: 450,
      totalCashPaid: 0,
      advanceAdjustment: 0,
      totalDue: 0,
      totalCharity: 0,
      grandTotal: 450
    }
  },
  BAGI: {
    accountType: "BAGI",
    amount: 250654.0,
    returnAmount: 0.0,
    lines: [
      { label: "Total Amount", value: 250654.0 },
      { label: "Return Amount", value: 0.0 }
    ]
  },
  CARE: {
    accountType: "CARE",
    amount: 20542.0,
    returnAmount: 0.0,
    lines: [
      { label: "Total Amount", value: 20542.0 },
      { label: "Return Amount", value: 0.0 }
    ]
  }
};

const initialFromDate = "2025-12-01";
const initialToDate = "2025-12-31";

function formatAmount(value: number): string {
  return value.toFixed(2);
}

function renderAmountCell(value: number, isTotal?: boolean, onClick?: () => void) {
  const content = (
    <span className={isTotal ? "fw-bold text-danger" : "fw-semibold text-primary"}>
      {formatAmount(value)}
    </span>
  );

  if (isTotal || !onClick) return content;

  return (
    <Button variant="link" className="p-0 text-decoration-none" onClick={onClick}>
      {content}
    </Button>
  );
}

function CompanyWisePayable() {
  const [fromDate, setFromDate] = useState<string>(initialFromDate);
  const [toDate, setToDate] = useState<string>(initialToDate);
  const [filteredData, setFilteredData] = useState<CompanyPayableRow[]>(COMPANY_PAYABLE_DATA);
  const [displayedData, setDisplayedData] = useState<CompanyPayableRow[]>(COMPANY_PAYABLE_DATA);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortKey, setSortKey] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedDetail, setSelectedDetail] = useState<CompanyPayableDetail | null>(null);
  const [showModal, setShowModal] = useState(false);

  const updateDisplayedData = useCallback(
    (records: CompanyPayableRow[], search: string, sortK: string, sortDir: "asc" | "desc") => {
      let result: CompanyPayableRow[] = records;

      if (search) {
        result = searchTableData(result, search, ["accountType"]);
      }

      if (sortK) {
        result = sortTableData(result, sortK as keyof CompanyPayableRow, sortDir);
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
        acc.returnAmount += row.returnAmount;
        return acc;
      },
      { amount: 0, returnAmount: 0 }
    );
  }, [displayedData]);

  const tableWithTotal = useMemo<CompanyPayableRow[]>(() => {
    return [
      ...displayedData,
      {
        accountType: "Total",
        amount: totals.amount,
        returnAmount: totals.returnAmount,
        isTotal: true
      }
    ];
  }, [displayedData, totals]);

  const handleFilterSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setFilteredData(COMPANY_PAYABLE_DATA);
  };

  const handleReset = () => {
    setFromDate(initialFromDate);
    setToDate(initialToDate);
    setSearchTerm("");
    setSortKey("");
    setSortDirection("asc");
    setFilteredData(COMPANY_PAYABLE_DATA);
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
      "S No": index + 1,
      "Type of Account": row.accountType,
      Amount: formatAmount(row.amount),
      "Return Amount": formatAmount(row.returnAmount)
    }));

    exportToExcel(
      exportData,
      `Company_Wise_Payable_${fromDate}_to_${toDate}`,
      "Company Wise Payable"
    );
  };

  const openDetail = (accountType: string) => {
    const detail = COMPANY_PAYABLE_DETAILS[accountType];
    if (detail) {
      setSelectedDetail(detail);
      setShowModal(true);
    }
  };

  const columns = [
    {
      key: "slNo",
      label: "S No",
      sortable: false,
      render: (_: any, record: CompanyPayableRow, index: number) => (record.isTotal ? "" : index + 1)
    },
    {
      key: "accountType",
      label: "Type of Account",
      sortable: true,
      render: (value: string, record: CompanyPayableRow) => (record.isTotal ? <strong>Total</strong> : value)
    },
    {
      key: "amount",
      label: "Amount",
      sortable: true,
      render: (value: number, record: CompanyPayableRow) => renderAmountCell(value, record.isTotal, record.isTotal ? undefined : () => openDetail(record.accountType))
    },
    {
      key: "returnAmount",
      label: "Return Amount",
      sortable: true,
      render: (value: number, record: CompanyPayableRow) => renderAmountCell(value, record.isTotal, record.isTotal ? undefined : () => openDetail(record.accountType))
    }
  ];

  return (
    <React.Fragment>
      <Container fluid className="px-4 py-3">
        <ReportHeader
          title="Company Wise Payable"
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
                <strong>Amount Total:</strong>{" "}
                <span className="text-danger fw-bold">{formatAmount(totals.amount)}</span>
                <span className="ms-3">
                  <strong>Return Total:</strong>{" "}
                  <span className="text-danger fw-bold">{formatAmount(totals.returnAmount)}</span>
                </span>
              </Col>
            </Row>
          </div>
        </Card>
      </Container>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered backdrop="static">
        <Modal.Header closeButton>
          <Modal.Title>Company Payable Details</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedDetail ? (
            <div className="d-flex flex-column gap-3">
              <Card className="border-0 shadow-sm">
                <Card.Body>
                  <Row className="mb-2">
                    <Col md={6}><strong>Type of Account:</strong> {selectedDetail.accountType}</Col>
                    <Col md={6}><strong>Amount:</strong> {formatAmount(selectedDetail.amount)}</Col>
                  </Row>
                  <Row className="mb-2">
                    <Col md={6}><strong>Return Amount:</strong> {formatAmount(selectedDetail.returnAmount)}</Col>
                  </Row>
                  {selectedDetail.patientName || selectedDetail.hospitalNumber || selectedDetail.employeeNumber ? (
                    <Row className="mt-2">
                      {selectedDetail.patientName && (
                        <Col md={4}><strong>Patient Name:</strong> {selectedDetail.patientName}</Col>
                      )}
                      {selectedDetail.hospitalNumber && (
                        <Col md={4}><strong>Hospital Number:</strong> {selectedDetail.hospitalNumber}</Col>
                      )}
                      {selectedDetail.employeeNumber !== undefined && (
                        <Col md={4}><strong>Employee Number:</strong> {selectedDetail.employeeNumber || "-"}</Col>
                      )}
                    </Row>
                  ) : null}
                </Card.Body>
              </Card>

              {selectedDetail.items ? (
                <Card className="border-0 shadow-sm">
                  <Card.Header className="fw-bold bg-light">Bill Details</Card.Header>
                  <Card.Body className="p-0">
                    <Table bordered hover size="sm" className="mb-0">
                      <thead >
                        <tr>
                          <th>S.I.No</th>
                          <th>Bill No</th>
                          <th>Bill Date</th>
                          <th>Particulars/Medicine Name</th>
                          <th className="text-end">M.R.P</th>
                          <th className="text-end">Unit</th>
                          <th className="text-end">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedDetail.items.map(item => (
                          <tr key={`${item.billNo}-${item.slNo}`}>
                            <td>{item.slNo}</td>
                            <td>{item.billNo}</td>
                            <td>{item.billDate}</td>
                            <td>{item.name}</td>
                            <td className="text-end">{formatAmount(item.mrp)}</td>
                            <td className="text-end">{item.unit}</td>
                            <td className="text-end">{formatAmount(item.amount)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              ) : (
                <Card className="border-0 shadow-sm">
                  <Card.Header className="fw-bold bg-light">Breakup</Card.Header>
                  <Card.Body className="p-0">
                    <Table bordered hover size="sm" className="mb-0">
                      <thead >
                        <tr>
                          <th>Particular</th>
                          <th className="text-end">Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedDetail.lines.map((line, idx) => (
                          <tr key={idx}>
                            <td>{line.label}</td>
                            <td className="text-end">{formatAmount(line.value)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              )}

              {selectedDetail.summary ? (
                <Card className="border-0 shadow-sm">
                  <Card.Header className="fw-bold bg-light">Totals</Card.Header>
                  <Card.Body className="p-0">
                    <Table bordered hover size="sm" className="mb-0">
                      <tbody>
                        <tr>
                          <td><strong>NET TOTAL</strong></td>
                          <td className="text-end">{formatAmount(selectedDetail.summary.netTotal)}</td>
                        </tr>
                        <tr>
                          <td><strong>TOTAL CASH PAID</strong></td>
                          <td className="text-end">{formatAmount(selectedDetail.summary.totalCashPaid)}</td>
                        </tr>
                        <tr>
                          <td><strong>ADVANCE ADJUSTMENT</strong></td>
                          <td className="text-end">{formatAmount(selectedDetail.summary.advanceAdjustment)}</td>
                        </tr>
                        <tr>
                          <td><strong>TOTAL DUE</strong></td>
                          <td className="text-end">{formatAmount(selectedDetail.summary.totalDue)}</td>
                        </tr>
                        <tr>
                          <td><strong>TOTAL CHARITY</strong></td>
                          <td className="text-end">{formatAmount(selectedDetail.summary.totalCharity)}</td>
                        </tr>
                        <tr>
                          <td><strong>GRAND TOTAL</strong></td>
                          <td className="text-end">{formatAmount(selectedDetail.summary.grandTotal)}</td>
                        </tr>
                      </tbody>
                    </Table>
                  </Card.Body>
                </Card>
              ) : null}
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

export default CompanyWisePayable;