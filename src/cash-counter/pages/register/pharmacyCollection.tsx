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
import { CashCounterApiService } from "../../../api/cash-counter/cash-counter-api-service";
import {
  showErrorToast,
  showSuccessToast,
  showWarningToast,
} from "../../../utils/alertUtil";
import "../../../medical-records/styles/reportStyles.css";

interface PharmacyCollectionData {
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

interface PharmacySalesRow {
  patientName: string;
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

interface PharmacyMedicineLine {
  medicineName: string;
  unit: number;
  batchNo: string;
  expiryDate: string;
  mrp: number;
  total: number;
}

interface PharmacyBillDetail {
  header: {
    opNo: string;
    patientName: string;
    billNo: string;
    ageSex: string;
    account: string;
    doctorName: string;
    date: string;
    bankTransNo: string;
    preparedBy: string;
  };
  medicines: PharmacyMedicineLine[];
  totals: {
    medicineTotal: number;
    roundOff: number;
    netTotal: number;
    credit: number;
    charity: number;
    cash: number;
    bank: number;
    insurance: number;
    staff: number;
    paidTotal: number;
  };
}

const PHARMACY_BILL_DETAILS: { [key: string]: PharmacyBillDetail } = {
  "PH : 1": {
    header: {
      opNo: "470816",
      patientName: "Bharat Dandsena",
      billNo: "PH : 1",
      ageSex: "53 Years / MALE",
      account: "General Patient Accounts",
      doctorName: "DR YASHUB",
      date: "15-11-2025 16:39:10",
      bankTransNo: "",
      preparedBy: "Admin"
    },
    medicines: [
      {
        medicineName: "ACETYLCYSTEINE 20%",
        unit: 1,
        batchNo: "887142",
        expiryDate: "11/26",
        mrp: 52.90,
        total: 52.90
      }
    ],
    totals: {
      medicineTotal: 52.90,
      roundOff: 0.10,
      netTotal: 53.00,
      credit: 10.00,
      charity: 3.00,
      cash: 40.00,
      bank: 0.00,
      insurance: 0.00,
      staff: 0.00,
      paidTotal: 40.00
    }
  },
  "PH : 2": {
    header: {
      opNo: "372089",
      patientName: "Shanti Podh",
      billNo: "PH : 2",
      ageSex: "45 Years / FEMALE",
      account: "General Patient Accounts",
      doctorName: "DR SHARMA",
      date: "15-11-2025 17:15:30",
      bankTransNo: "",
      preparedBy: "Admin"
    },
    medicines: [
      {
        medicineName: "TAB PARACETAMOL 500MG",
        unit: 10,
        batchNo: "PAR123",
        expiryDate: "12/26",
        mrp: 0.90,
        total: 9.00
      }
    ],
    totals: {
      medicineTotal: 9.00,
      roundOff: 0.00,
      netTotal: 9.00,
      credit: 0.00,
      charity: 0.00,
      cash: 9.00,
      bank: 0.00,
      insurance: 0.00,
      staff: 0.00,
      paidTotal: 9.00
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

function PharmacyCollection() {
  const organization = useSelector((state: RootState) => state.appReducer.organization);
  const cashCounterApi = new CashCounterApiService();
  
  const today = new Date().toISOString().split('T')[0];
  const [fromDate, setFromDate] = useState<string>(today);
  const [toDate, setToDate] = useState<string>(today);
  const [salesFiltered, setSalesFiltered] = useState<PharmacySalesRow[]>([]);
  const [salesDisplayed, setSalesDisplayed] = useState<PharmacySalesRow[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [dataLoaded, setDataLoaded] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortKey, setSortKey] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");
  const [selectedBill, setSelectedBill] = useState<PharmacyBillDetail | null>(null);
  const [showModal, setShowModal] = useState(false);

  const fetchPharmacyCollection = async () => {
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
      const response: PharmacyCollectionData[] = await cashCounterApi.fetchPharmacyCollection(fromDate, toDate);
      
      if (!response || response.length === 0) {
        showWarningToast("No data found for the selected date range");
        setSalesFiltered([]);
        setDataLoaded(true);
        return;
      }

      // Transform API data to component format
      const transformedData: PharmacySalesRow[] = response.map((item) => ({
        patientName: item.patName,
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

      setSalesFiltered(transformedData);
      setDataLoaded(true);
      showSuccessToast("Report generated successfully");
    } catch (error: any) {
      console.error("Error fetching pharmacy collection:", error);
      showErrorToast(
        error?.response?.data?.error || "Failed to fetch pharmacy collection data"
      );
      setSalesFiltered([]);
      setDataLoaded(false);
    } finally {
      setLoading(false);
    }
  };

  const updateSalesDisplayed = useCallback(
    (records: PharmacySalesRow[], search: string, sortK: string, sortDir: "asc" | "desc") => {
      let result: PharmacySalesRow[] = records;

      if (search) {
        result = searchTableData(result, search, ["patientName", "opNo", "billNo"]);
      }

      if (sortK) {
        result = sortTableData(result, sortK as keyof PharmacySalesRow, sortDir);
      }

      setSalesDisplayed(result);
    },
    []
  );

  useEffect(() => {
    updateSalesDisplayed(salesFiltered, searchTerm, sortKey, sortDirection);
  }, [salesFiltered, searchTerm, sortKey, sortDirection, updateSalesDisplayed]);

  const salesTotals = useMemo(() => {
    return salesDisplayed.reduce(
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
  }, [salesDisplayed]);

  const salesTableWithTotal = useMemo<PharmacySalesRow[]>(() => {
    return [
      ...salesDisplayed,
      {
        patientName: "Total",
        opNo: "",
        billNo: "",
        total: salesTotals.total,
        discount: salesTotals.discount,
        payable: salesTotals.payable,
        paid: salesTotals.paid,
        balance: salesTotals.balance,
        cashPaid: formatAmount(salesTotals.cashPaid),
        bankPaid: formatAmount(salesTotals.bankPaid),
        isTotal: true
      }
    ];
  }, [salesDisplayed, salesTotals]);

  const handleFilterSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    fetchPharmacyCollection();
  };

  const handleReset = () => {
    const today = new Date().toISOString().split('T')[0];
    setFromDate(today);
    setToDate(today);
    setSearchTerm("");
    setSortKey("");
    setSortDirection("asc");
    setSalesFiltered([]);
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
    const exportSales = salesDisplayed.map((row, index) => ({
      "S.No": index + 1,
      "Patient Name": row.patientName,
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
      exportSales,
      `Pharmacy_Collection_${formatReportDate(new Date(), "DD-MM-YYYY")}`,
      "Pharmacy Sales"
    );
  };

  const handleBillClick = (billNo: string) => {
    const details = PHARMACY_BILL_DETAILS[billNo];
    if (details) {
      setSelectedBill(details);
      setShowModal(true);
    } else {
      alert("No details available for this bill.");
    }
  };

  const salesColumns = [
    {
      key: "slNo",
      label: "S. No",
      sortable: false,
      render: (_: any, record: PharmacySalesRow, index: number) => (record.isTotal ? "" : index + 1)
    },
    {
      key: "patientName",
      label: "Patient Name",
      sortable: true,
      render: (value: string, record: PharmacySalesRow) => (record.isTotal ? <strong>Total:</strong> : value)
    },
    { key: "opNo", label: "OPNO", sortable: true, render: (value: string, record: PharmacySalesRow) => (record.isTotal ? "" : value) },
    {
      key: "billNo",
      label: "Bill No",
      sortable: true,
      render: (value: string, record: PharmacySalesRow) =>
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
      render: (value: number, record: PharmacySalesRow) => renderAmountCell(value, record.isTotal)
    },
    {
      key: "discount",
      label: "Discount",
      sortable: true,
      render: (value: number, record: PharmacySalesRow) => renderAmountCell(value, record.isTotal)
    },
    {
      key: "payable",
      label: "Payable",
      sortable: true,
      render: (value: number, record: PharmacySalesRow) => renderAmountCell(value, record.isTotal)
    },
    {
      key: "paid",
      label: "Paid",
      sortable: true,
      render: (value: number, record: PharmacySalesRow) => renderAmountCell(value, record.isTotal)
    },
    {
      key: "balance",
      label: "Balance",
      sortable: true,
      render: (value: number, record: PharmacySalesRow) => renderAmountCell(value, record.isTotal)
    },
    {
      key: "cashPaid",
      label: "Cash Paid",
      sortable: true,
      render: (value: string, record: PharmacySalesRow) => (
        <span className={record.isTotal ? "fw-bold text-danger" : "fw-semibold text-gray-800"}>
          {value}
        </span>
      )
    },
    {
      key: "bankPaid",
      label: "Bank Paid",
      sortable: true,
      render: (value: string, record: PharmacySalesRow) => (
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
          title={`${organization?.name?.toUpperCase() || "HOSPITAL"} - Pharmacy Collection`}
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
                data={salesTableWithTotal}
                columns={salesColumns}
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
                  Total Data Rows: <strong>{salesDisplayed.length}</strong>
                  {searchTerm && <span className="ms-2">(Filtered)</span>}
                </small>
              </Col>
              <Col md={6} className="text-md-end mt-2 mt-md-0">
                <div className="d-flex flex-column align-items-end gap-1">
                  <div>
                    <strong>Cash Paid:</strong>{" "}
                    <span className="text-success fw-bold">{formatAmount(salesTotals.cashPaid)}</span>
                  </div>
                  <div>
                    <strong>Bank Paid:</strong>{" "}
                    <span className="text-primary fw-bold">{formatAmount(salesTotals.bankPaid)}</span>
                  </div>
                  <div>
                    <strong>Total Collection:</strong>{" "}
                    <span className="text-danger fw-bold">{formatAmount(salesTotals.cashPaid + salesTotals.bankPaid)}</span>
                  </div>
                </div>
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
            <Modal.Title>Pharmacy Bill Details</Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ maxHeight: "calc(100vh - 200px)", overflowY: "auto" }}>
            {selectedBill ? (
              <div className="d-flex flex-column gap-3">
                <Card className="border-0 shadow-sm">
                  <Card.Body>
                    <Row className="mb-2">
                      <Col md={4}><strong>OP No:</strong> {selectedBill.header.opNo}</Col>
                      <Col md={4}><strong>Age/Sex:</strong> {selectedBill.header.ageSex}</Col>
                      <Col md={4}><strong>Account:</strong> {selectedBill.header.account}</Col>
                    </Row>
                    <Row className="mb-2">
                      <Col md={4}><strong>Patient Name:</strong> {selectedBill.header.patientName}</Col>
                      <Col md={4}><strong>Bill No:</strong> {selectedBill.header.billNo}</Col>
                      <Col md={4}><strong>Doctor Name:</strong> {selectedBill.header.doctorName}</Col>
                    </Row>
                    <Row>
                      <Col md={4}><strong>Date:</strong> {selectedBill.header.date}</Col>
                      <Col md={4}><strong>Bank Trans No:</strong> {selectedBill.header.bankTransNo || "-"}</Col>
                      <Col md={4}><strong>Prepared By:</strong> {selectedBill.header.preparedBy}</Col>
                    </Row>
                  </Card.Body>
                </Card>

                <Card className="border-0 shadow-sm">
                  <Card.Header className="fw-bold bg-light">Medicine Details</Card.Header>
                  <Card.Body className="p-0">
                    <Table bordered hover size="sm" className="mb-0">
                      <thead >
                        <tr>
                          <th className="py-2 text-center">S.No</th>
                          <th className="py-2">Medicine Name</th>
                          <th className="py-2 text-center">Unit</th>
                          <th className="py-2 text-center">Batch</th>
                          <th className="py-2 text-center">Expiry</th>
                          <th className="py-2 text-end">MRP</th>
                          <th className="py-2 text-end">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedBill.medicines.map((medicine, idx) => (
                          <tr key={idx}>
                            <td className="text-center">{idx + 1}</td>
                            <td>{medicine.medicineName}</td>
                            <td className="text-center">{medicine.unit}</td>
                            <td className="text-center">{medicine.batchNo}</td>
                            <td className="text-center">{medicine.expiryDate}</td>
                            <td className="text-end">{formatAmount(medicine.mrp)}</td>
                            <td className="text-end">{formatAmount(medicine.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        <tr className="table-secondary fw-bold">
                          <td colSpan={6} className="text-end">Medicine Total :</td>
                          <td className="text-end">{formatAmount(selectedBill.totals.medicineTotal)}</td>
                        </tr>
                      </tfoot>
                    </Table>
                  </Card.Body>
                </Card>

                <Card className="border-0 shadow-sm">
                  <Card.Body>
                    <Row className="gy-2">
                      <Col xs={6}><strong>Medicine Total:</strong> {formatAmount(selectedBill.totals.medicineTotal)}</Col>
                      <Col xs={6}><strong>Round Off Amount:</strong> {formatAmount(selectedBill.totals.roundOff)}</Col>
                      <Col xs={12} className="border-top pt-2"><strong>Net Total:</strong> <span className="text-primary">{formatAmount(selectedBill.totals.netTotal)}</span></Col>
                      <Col xs={12} className="border-top pt-2 fw-bold text-decoration-underline">Payment Details:</Col>
                      {selectedBill.totals.credit > 0 && (
                        <Col xs={6}><strong>Credit:</strong> {formatAmount(selectedBill.totals.credit)}</Col>
                      )}
                      {selectedBill.totals.charity > 0 && (
                        <Col xs={6}><strong>Charity:</strong> {formatAmount(selectedBill.totals.charity)}</Col>
                      )}
                      {selectedBill.totals.cash > 0 && (
                        <Col xs={6}><strong>Cash:</strong> {formatAmount(selectedBill.totals.cash)}</Col>
                      )}
                      {selectedBill.totals.bank > 0 && (
                        <Col xs={6}><strong>Bank:</strong> {formatAmount(selectedBill.totals.bank)}</Col>
                      )}
                      {selectedBill.totals.insurance > 0 && (
                        <Col xs={6}><strong>Insurance:</strong> {formatAmount(selectedBill.totals.insurance)}</Col>
                      )}
                      {selectedBill.totals.staff > 0 && (
                        <Col xs={6}><strong>Staff:</strong> {formatAmount(selectedBill.totals.staff)}</Col>
                      )}
                      <Col xs={12} className="border-top pt-2">
                        <strong>Paid Total:</strong> <span className="text-success fw-bold">{formatAmount(selectedBill.totals.paidTotal)}</span>
                        <span className="ms-3 text-muted">(Rupees: {convertToWords(selectedBill.totals.paidTotal)})</span>
                      </Col>
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

function convertToWords(amount: number): string {
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  
  if (amount === 0) return 'Zero';
  
  const num = Math.floor(amount);
  let words = '';
  
  if (num >= 1000) {
    words += ones[Math.floor(num / 1000)] + ' Thousand ';
  }
  
  const remainder = num % 1000;
  if (remainder >= 100) {
    words += ones[Math.floor(remainder / 100)] + ' Hundred ';
  }
  
  const lastTwo = remainder % 100;
  if (lastTwo >= 10 && lastTwo < 20) {
    words += teens[lastTwo - 10];
  } else {
    words += tens[Math.floor(lastTwo / 10)] + ' ';
    words += ones[lastTwo % 10];
  }
  
  return words.trim();
}

export default PharmacyCollection;