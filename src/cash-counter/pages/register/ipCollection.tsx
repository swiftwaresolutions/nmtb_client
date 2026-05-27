import React, { useCallback, useEffect, useMemo, useState } from "react";
import { Container, Card, Form, Button, Row, Col, Modal, Table } from "react-bootstrap";
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
import {
  showSuccessToast,
  showErrorToast,
  showWarningToast
} from "../../../utils/alertUtil";
import CashCounterApiService from "../../../api/cash-counter/cash-counter-api-service";
import "../../../medical-records/styles/reportStyles.css";

interface IpBillCollectionData {
  patId: number;
  opNo: string;
  patName: string;
  billId: number;
  total: number;
  pay: number;
  disc: number;
  paid: number;
  balance: number;
  cashPaid: string;
  bankPaid: string;
}

interface BillDetailLine {
  particulars: string;
  amount: number;
  unit?: number;
  category?: string;
  serviceRate?: number;
  genCharity?: number;
  fcCharity?: number;
}

interface PharmacyDetailLine {
  medicineName: string;
  batchNo: string;
  expiryDate: string;
  mrp: number;
  unit: number;
  amount: number;
}

interface BillDetailData {
  header: {
    patientName: string;
    opNo: string;
    billNo: string;
    dateTime: string;
  };
  investigation: BillDetailLine[];
  pharmacy?: PharmacyDetailLine[];
  ip: BillDetailLine[];
  due?: BillDetailLine[];
  totals: {
    investigationTotal: number;
    pharmacyTotal?: number;
    ipTotal: number;
    dueTotal: number;
    total: number;
    totalReturns: number;
    netTotal: number;
    previousAdvance: number;
    previousBalance: number;
    finalAdvance: number;
    finalDue: number;
  };
}

interface IPCollectionRow {
  patientName: string;
  ipNo: string;
  opNo: string;
  billNo: string;
  total: number;
  discount: number;
  payable: number;
  paid: number;
  balance: number;
  cashPaid: string;
  bankPaid: string;
  isTotal?: boolean;
}

const BILL_DETAILS: { [key: string]: BillDetailData } = {
  "393860": {
    header: {
      patientName: "Santala Durga",
      opNo: "848037",
      billNo: "393860",
      dateTime: "28-12-2024 12:48 PM"
    },
    investigation: [
      { particulars: "CBC", amount: 150, unit: 1, category: "Hematology", serviceRate: 150, genCharity: 0, fcCharity: 0 },
      { particulars: "Blood Sugar (F)", amount: 100, unit: 1, category: "Biochemistry", serviceRate: 100, genCharity: 0, fcCharity: 0 },
      { particulars: "Blood Sugar (PP)", amount: 100, unit: 1, category: "Biochemistry", serviceRate: 100, genCharity: 0, fcCharity: 0 },
      { particulars: "HbA1c", amount: 450, unit: 1, category: "Biochemistry", serviceRate: 450, genCharity: 0, fcCharity: 0 },
      { particulars: "Urine R/E", amount: 80, unit: 1, category: "Urine", serviceRate: 80, genCharity: 0, fcCharity: 0 }
    ],
    ip: [
      { particulars: "Bed Charges", amount: 1200 },
      { particulars: "Nursing Charges", amount: 500 },
      { particulars: "Doctor Visit", amount: 300 }
    ],
    due: [
      { particulars: "Previous Due", amount: 322 }
    ],
    totals: {
      investigationTotal: 880,
      ipTotal: 2000,
      dueTotal: 322,
      total: 2202,
      totalReturns: 0,
      netTotal: 2202,
      previousAdvance: 0,
      previousBalance: 0,
      finalAdvance: 0,
      finalDue: 0
    }
  },
  "209236": {
    header: {
      patientName: "Akash Takri",
      opNo: "424036",
      billNo: "209236",
      dateTime: "30-12-2024 01:40 PM"
    },
    investigation: [
      { particulars: "CBC", amount: 150, unit: 1, category: "Hematology", serviceRate: 150, genCharity: 0, fcCharity: 0 },
      { particulars: "KFT", amount: 350, unit: 1, category: "Biochemistry", serviceRate: 350, genCharity: 0, fcCharity: 0 },
      { particulars: "LFT", amount: 400, unit: 1, category: "Biochemistry", serviceRate: 400, genCharity: 0, fcCharity: 0 }
    ],
    pharmacy: [
      { medicineName: "INJ.PAN 40MG", batchNo: "PAN001", expiryDate: "12/2025", mrp: 45.50, unit: 5, amount: 227.50 },
      { medicineName: "INJ.CEFTRIAXONE 1GM", batchNo: "CEF123", expiryDate: "06/2026", mrp: 85.00, unit: 6, amount: 510.00 },
      { medicineName: "INJ.METRONIDAZOLE 100ML", batchNo: "MET456", expiryDate: "03/2026", mrp: 32.00, unit: 4, amount: 128.00 },
      { medicineName: "TAB.DOLO 650MG", batchNo: "DOL789", expiryDate: "09/2025", mrp: 2.50, unit: 30, amount: 75.00 },
      { medicineName: "INJ.EMESET 4MG", batchNo: "EME234", expiryDate: "11/2025", mrp: 18.00, unit: 8, amount: 144.00 },
      { medicineName: "IV FLUID RL 500ML", batchNo: "IVF567", expiryDate: "08/2026", mrp: 45.00, unit: 10, amount: 450.00 },
      { medicineName: "IV FLUID NS 500ML", batchNo: "IVF890", expiryDate: "07/2026", mrp: 42.00, unit: 8, amount: 336.00 },
      { medicineName: "SYRUP TAXIM-O 50ML", batchNo: "TAX321", expiryDate: "04/2026", mrp: 125.00, unit: 2, amount: 250.00 }
    ],
    ip: [
      { particulars: "Bed Charges (General Ward)", amount: 800 },
      { particulars: "Nursing Charges", amount: 400 },
      { particulars: "Doctor Visit", amount: 200 }
    ],
    totals: {
      investigationTotal: 900,
      pharmacyTotal: 2120.50,
      ipTotal: 1400,
      dueTotal: 0,
      total: 3875,
      totalReturns: 0,
      netTotal: 3875,
      previousAdvance: 500,
      previousBalance: 0,
      finalAdvance: 0,
      finalDue: 3375
    }
  }
};

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

function IPCollection() {
  const organization = useSelector((state: RootState) => state.appReducer.organization);
  const cashCounterApi = new CashCounterApiService();
  
  const [fromDate, setFromDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [toDate, setToDate] = useState<string>(new Date().toISOString().split('T')[0]);
  const [filteredData, setFilteredData] = useState<IPCollectionRow[]>([]);
  const [displayedData, setDisplayedData] = useState<IPCollectionRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [dataLoaded, setDataLoaded] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortKey, setSortKey] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedBill, setSelectedBill] = useState<BillDetailData | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchIpBillCollection = async () => {
    // Validate dates
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
      const response: IpBillCollectionData[] = await cashCounterApi.fetchIpBillCollection(fromDate, toDate);
      
      if (!response || response.length === 0) {
        showWarningToast("No data found for the selected date range");
        setFilteredData([]);
        setDataLoaded(true);
        return;
      }

      // Transform API data to component format
      const transformedData: IPCollectionRow[] = response.map((item) => ({
        patientName: item.patName,
        ipNo: item.billId.toString(), // Using billId as ipNo since API doesn't have ipNo
        opNo: item.opNo,
        billNo: item.billId.toString(),
        total: item.total,
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
      console.error("Error fetching IP bill collection:", error);
      showErrorToast(
        error?.response?.data?.error || "Failed to fetch IP bill collection data"
      );
      setFilteredData([]);
      setDataLoaded(false);
    } finally {
      setLoading(false);
    }
  };

  const updateDisplayedData = useCallback(
    (
      records: IPCollectionRow[],
      search: string,
      sortK: string,
      sortDir: "asc" | "desc"
    ) => {
      let result: IPCollectionRow[] = records;

      if (search) {
        result = searchTableData(result, search, ["patientName", "ipNo", "opNo", "billNo"]);
      }

      if (sortK) {
        result = sortTableData(result, sortK as keyof IPCollectionRow, sortDir);
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
      { total: 0, discount: 0, payable: 0, paid: 0, balance: 0, cashPaid: 0, bankPaid: 0 }
    );
  }, [displayedData]);

  const tableWithTotal = useMemo<IPCollectionRow[]>(() => {
    return [
      ...displayedData,
      {
        patientName: "Total",
        ipNo: "",
        opNo: "",
        billNo: "",
        total: totals.total,
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

  const handleFilterSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    fetchIpBillCollection();
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
      "IP NO": row.ipNo,
      "OP No": row.opNo,
      "Bill No": row.billNo,
      Total: formatAmount(row.total),
      Discount: formatAmount(row.discount),
      Payable: formatAmount(row.payable),
      Paid: formatAmount(row.paid),
      Balance: formatAmount(row.balance),
      "Cash Paid": row.cashPaid,
      "Bank Paid": row.bankPaid
    }));

    exportToExcel(
      exportData,
      `IP_Collection_${formatReportDate(new Date(), "DD-MM-YYYY")}`,
      "IP Collection"
    );
  };

  const handleBillClick = (billNo: string) => {
    const details = BILL_DETAILS[billNo];
    if (details) {
      setSelectedBill(details);
      setShowModal(true);
    } else {
      alert("No details available for this bill.");
    }
  };

  const TableSection: React.FC<{
    headers: string[];
    rows: (string | number)[][];
    footerLabel: string;
    footerValue: string;
  }> = ({ headers, rows, footerLabel, footerValue }) => (
    <Table bordered hover size="sm" className="mb-0">
      <thead >
        <tr>
          {headers.map((header, idx) => (
            <th key={idx} className="py-2 text-center">{header}</th>
          ))}
        </tr>
      </thead>
      <tbody>
        {rows.map((row, idx) => (
          <tr key={idx}>
            {row.map((cell, cellIdx) => (
              <td key={cellIdx} className={cellIdx === 0 ? "text-center" : cellIdx === row.length - 1 ? "text-end" : ""}>
                {cell}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
      <tfoot>
        <tr className="table-secondary fw-bold">
          <td colSpan={headers.length - 1} className="text-end">{footerLabel}</td>
          <td className="text-end">{footerValue}</td>
        </tr>
      </tfoot>
    </Table>
  );

  const columns = [
    {
      key: "slNo",
      label: "S. No",
      sortable: false,
      render: (_: any, record: IPCollectionRow, index: number) => (record.isTotal ? "" : index + 1)
    },
    {
      key: "patientName",
      label: "Patient Name",
      sortable: true,
      render: (value: string, record: IPCollectionRow) => (record.isTotal ? <strong>Total:</strong> : value)
    },
    { key: "ipNo", label: "IP NO", sortable: true, render: (value: string, record: IPCollectionRow) => (record.isTotal ? "" : value) },
    { key: "opNo", label: "OPNO", sortable: true, render: (value: string, record: IPCollectionRow) => (record.isTotal ? "" : value) },
    {
      key: "billNo",
      label: "Bill No",
      sortable: true,
      render: (value: string, record: IPCollectionRow) =>
        record.isTotal ? "" : (
          <Button
            variant="link"
            className="p-0 fw-bold text-primary"
            onClick={() => handleBillClick(value)}
            style={{ textDecoration: "none" }}
          >
            {value}
          </Button>
        )
    },
    {
      key: "total",
      label: "Total",
      sortable: true,
      render: (value: number, record: IPCollectionRow) => renderAmountCell(value, record.isTotal)
    },
    {
      key: "discount",
      label: "Discount",
      sortable: true,
      render: (value: number, record: IPCollectionRow) => renderAmountCell(value, record.isTotal)
    },
    {
      key: "payable",
      label: "Payable",
      sortable: true,
      render: (value: number, record: IPCollectionRow) => renderAmountCell(value, record.isTotal)
    },
    {
      key: "paid",
      label: "Paid",
      sortable: true,
      render: (value: number, record: IPCollectionRow) => renderAmountCell(value, record.isTotal)
    },
    {
      key: "balance",
      label: "Balance",
      sortable: true,
      render: (value: number, record: IPCollectionRow) => renderAmountCell(value, record.isTotal)
    },
    {
      key: "cashPaid",
      label: "Cash Paid",
      sortable: true,
      render: (value: string, record: IPCollectionRow) => (
        <span className={record.isTotal ? "fw-bold text-danger" : "fw-semibold text-gray-800"}>
          {value}
        </span>
      )
    },
    {
      key: "bankPaid",
      label: "Bank Paid",
      sortable: true,
      render: (value: string, record: IPCollectionRow) => (
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
          title={`${organization?.name?.toUpperCase() || "HOSPITAL"} - IP Collection`}
          subtitle={dataLoaded ? getDateRangeText(fromDate, toDate) : ""}
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
              height: "calc(100vh - 320px)",
              minHeight: "350px",
              overflowY: "auto",
              overflowX: "auto",
              position: "relative"
            }}
          >
            {loading ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-2 text-muted">Searching for IP bill collection data...</p>
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
                    : dataLoaded
                    ? "No data available for the selected date range."
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

        <Modal
          show={showModal}
          onHide={() => setShowModal(false)}
          size="lg"
          centered
          backdrop="static"
        >
          <Modal.Header closeButton>
            <Modal.Title>Bill Details</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}>
            {selectedBill ? (
              <div className="d-flex flex-column gap-3">
                <Card className="border-0 shadow-sm">
                  <Card.Body>
                    <Row className="mb-2">
                      <Col md={6}><strong>Patient Name:</strong> {selectedBill.header.patientName}</Col>
                      <Col md={6}><strong>OPNO:</strong> {selectedBill.header.opNo}</Col>
                    </Row>
                    <Row>
                      <Col md={6}><strong>Bill No:</strong> {selectedBill.header.billNo}</Col>
                      <Col md={6}><strong>Date & Time:</strong> {selectedBill.header.dateTime}</Col>
                    </Row>
                  </Card.Body>
                </Card>

                <Card className="border-0 shadow-sm">
                  <Card.Header className="fw-bold bg-light">Investigation Bill Details</Card.Header>
                  <Card.Body className="p-0">
                    <TableSection
                      headers={["Sl.No", "Particulars", "Unit", "Category", "Service Rate", "Gen.Charity", "Fc.Charity", "Amount"]}
                      rows={selectedBill.investigation.map((line, idx) => ([
                        idx + 1,
                        line.particulars,
                        line.unit ?? "",
                        line.category ?? "",
                        formatAmount(line.serviceRate ?? 0),
                        formatAmount(line.genCharity ?? 0),
                        formatAmount(line.fcCharity ?? 0),
                        formatAmount(line.amount)
                      ]))}
                      footerLabel="Investigation Total :"
                      footerValue={formatAmount(selectedBill.totals.investigationTotal)}
                    />
                  </Card.Body>
                </Card>

                {selectedBill.pharmacy && selectedBill.pharmacy.length > 0 && (
                  <Card className="border-0 shadow-sm">
                    <Card.Header className="fw-bold bg-light">Pharmacy Bill Details</Card.Header>
                    <Card.Body className="p-0">
                      <TableSection
                        headers={["Sl.No", "Medicine Name", "Batch no", "Expiry date", "M.R.P", "Unit", "Amount"]}
                        rows={selectedBill.pharmacy.map((line, idx) => ([
                          idx + 1,
                          line.medicineName,
                          line.batchNo,
                          line.expiryDate,
                          formatAmount(line.mrp),
                          line.unit,
                          formatAmount(line.amount)
                        ]))}
                        footerLabel="Medicine Total :"
                        footerValue={formatAmount(selectedBill.totals.pharmacyTotal ?? 0)}
                      />
                    </Card.Body>
                  </Card>
                )}

                <Card className="border-0 shadow-sm">
                  <Card.Header className="fw-bold bg-light">IP Bill Details</Card.Header>
                  <Card.Body className="p-0">
                    <TableSection
                      headers={["Sl.No", "Particulars", "Amount"]}
                      rows={selectedBill.ip.map((line, idx) => ([
                        idx + 1,
                        line.particulars,
                        formatAmount(line.amount)
                      ]))}
                      footerLabel="IP Bill Total :"
                      footerValue={formatAmount(selectedBill.totals.ipTotal)}
                    />
                  </Card.Body>
                </Card>

                {selectedBill.due && selectedBill.due.length > 0 && (
                  <Card className="border-0 shadow-sm">
                    <Card.Header className="fw-bold bg-light">Due Bill Details</Card.Header>
                    <Card.Body className="p-0">
                      <TableSection
                        headers={["Sl.No", "Particulars", "Amount"]}
                        rows={selectedBill.due.map((line, idx) => ([
                          idx + 1,
                          line.particulars,
                          formatAmount(line.amount)
                        ]))}
                        footerLabel="Due Bill Total :"
                        footerValue={formatAmount(selectedBill.totals.dueTotal)}
                      />
                    </Card.Body>
                  </Card>
                )}

                <Card className="border-0 shadow-sm">
                  <Card.Body>
                    <Row className="gy-2">
                      <Col xs={6}><strong>Total :</strong> {formatAmount(selectedBill.totals.total)}</Col>
                      <Col xs={6}><strong>Total Returns :</strong> {formatAmount(selectedBill.totals.totalReturns)}</Col>
                      <Col xs={6}><strong>Net Total :</strong> {formatAmount(selectedBill.totals.netTotal)}</Col>
                      <Col xs={6}><strong>Previous Advance :</strong> {formatAmount(selectedBill.totals.previousAdvance)}</Col>
                      <Col xs={6}><strong>Previous Balance :</strong> {formatAmount(selectedBill.totals.previousBalance)}</Col>
                      <Col xs={6}><strong>Final Advance :</strong> {formatAmount(selectedBill.totals.finalAdvance)}</Col>
                      <Col xs={6}><strong>Final Due :</strong> {formatAmount(selectedBill.totals.finalDue)}</Col>
                    </Row>
                  </Card.Body>
                </Card>
              </div>
            ) : (
              <div>No bill details available.</div>
            )}
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShowModal(false)}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </Container>
    </React.Fragment>
  );
}

export default IPCollection;