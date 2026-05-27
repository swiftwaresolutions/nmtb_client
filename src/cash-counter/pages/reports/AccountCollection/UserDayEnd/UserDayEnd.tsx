import React, { useState } from "react";
import { Container, Card, Row, Col, Form, Button, Table, Modal, Spinner } from "react-bootstrap";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../state/store";
import { showErrorToast, showSuccessToast, showWarningToast } from "../../../../../utils/alertUtil";
import { faCalendarCheck, faPrint, faFileExcel, faRotateRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CashCounterApiService } from "../../../../../api/cash-counter/cash-counter-api-service";

// TypeScript interface matching API response
interface UserDayEndData {
  uid: number | null;
  username: string;
  collection: number;
  cash: number;
  company: number;
  staff: number;
  advAdj: number;
  disc: number;
  due: number;
  cashR: number;
  companyR: number;
  staffR: number;
  advAdjR: number;
  discR: number;
  dueR: number;
  netCash: number;
  bankAmountDetails: {
    cardAmount: number;
    upiNeftAmount: number;
    chequeAmount: number;
  };
  creturns: number;
}

interface BillTypeWiseCollectionData {
  name: string;
  cash: number;
  swipe: number;
}

interface CompanyReceivablesSummary {
  userName: string;
  companyName: string;
  cash: number;
  bank: number;
}

interface BillWiseDetail {
  name: string;
  displayNumber: string;
  billId: string;
  dateTime: string;
  total: number;
  pay: number;
  paid: number;
  cashPaid: number | null;
  bankPaid: number | null;
  companyPaid: number | null;
  compName: string | null;
  staffPaid: number | null;
  discount: number | null;
  staffName: string | null;
  dueAmt: number | null;
  advAdj: number | null;
  totCash: number;
  resolvedBillNo?: string;
}

// Helper function to format date from YYYY-MM-DD to DD-MM-YYYY
const formatDateForDisplay = (dateString: string): string => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const UserDayEnd: React.FC = () => {
  const loginData = useSelector((state: RootState) => state.loginData);
  const organization = useSelector((state: RootState) => state.appReducer.organization);
  console.log("Organization Details in UserDayEnd:", organization);  
  const cashCounterApi = new CashCounterApiService();

  const [formData, setFormData] = useState({
    fromDate: new Date().toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0],
  });

  const [loading, setLoading] = useState(false);
  const [showReport, setShowReport] = useState(false);
  const [reportData, setReportData] = useState<UserDayEndData[]>([]);
  const [billTypeSummary, setBillTypeSummary] = useState<BillTypeWiseCollectionData[]>([]);
  const [companyReceivables, setCompanyReceivables] = useState<CompanyReceivablesSummary[]>([]);

  const [detailModal, setDetailModal] = useState<{ show: boolean; userName: string; details: BillWiseDetail[]; loading: boolean }>({
    show: false,
    userName: "",
    details: [],
    loading: false,
  });

  const handleOpenUserDetail = async (user: UserDayEndData) => {
    if (!user.uid) return;
    setDetailModal({ show: true, userName: user.username, details: [], loading: true });
    try {
      const data: BillWiseDetail[] = await cashCounterApi.fetchBillWiseCollectionDetails(
        formData.fromDate,
        formData.toDate,
        user.uid
      );
      const withBillNos = await Promise.all(
        data.map(async (row) => {
          try {
            const patientDetails = await cashCounterApi.fetchPatientDetailsByFinalBillId(Number(row.billId));
            return { ...row, resolvedBillNo: patientDetails?.billNo ?? row.billId };
          } catch {
            return { ...row, resolvedBillNo: row.billId };
          }
        })
      );
      setDetailModal((prev) => ({ ...prev, details: withBillNos, loading: false }));
    } catch {
      showErrorToast("Failed to fetch bill details");
      setDetailModal((prev) => ({ ...prev, loading: false }));
    }
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleGenerateReport = async () => {
    if (!formData.fromDate || !formData.toDate) {
      showErrorToast("Please select date range");
      return;
    }

    if (new Date(formData.fromDate) > new Date(formData.toDate)) {
      showErrorToast("From date cannot be greater than To date");
      return;
    }

    setLoading(true);

    try {
      const [response, summaryResponse] = await Promise.all([
        cashCounterApi.fetchUserDayEndReport(formData.fromDate, formData.toDate),
        cashCounterApi.fetchBillTypeWiseCollection(formData.fromDate, formData.toDate),
      ]);

      const mappedSummary = (summaryResponse || []).map((item: any) => ({
        name: item?.name || "",
        cash: Number(item?.cash || 0),
        swipe: Number(item?.swipe || 0),
      }));

      const dayEndData = response.dayEndCollectionReport;
      const companyReceivablesData = response.companyReceivablesSummary;

      if (!dayEndData || dayEndData.length === 0) {
        setBillTypeSummary([]);
        setCompanyReceivables([]);
        showWarningToast("No data found for the selected date range");
        setShowReport(false);
        setReportData([]);
        return;
      }

      setBillTypeSummary(mappedSummary);
      setCompanyReceivables(companyReceivablesData);
      setReportData(dayEndData);
      setShowReport(true);
      showSuccessToast("Report generated successfully");
    } catch (error: any) {
      console.error("Error generating report:", error);
      showErrorToast(
        error?.response?.data?.error || "Failed to generate report"
      );
      setBillTypeSummary([]);
      setCompanyReceivables([]);
      setShowReport(false);
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    // TODO: Implement Excel export functionality
    showSuccessToast("Export functionality to be implemented");
  };

  // Separate user collections from total
  const userCollections = reportData.filter((item) => item.uid !== null);
  const totalRow = reportData.find((item) => item.uid === null);
  const summaryTotalCash = billTypeSummary.reduce((sum, item) => sum + item.cash, 0);
  const summaryTotalSwipe = billTypeSummary.reduce((sum, item) => sum + item.swipe, 0);

  return (
    <Container fluid className="p-4">
      <style>{`
        @media print {
          .no-print { display: none !important; }
          body * { visibility: hidden; }
          #printable-report, #printable-report * { visibility: visible; }
          #printable-report { position: absolute; left: 0; top: 0; width: 100%; }
          .card { box-shadow: none !important; border: none !important; }
          @page { margin: 0.5in; }
          body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
        }

        /* ── Table base ── */
        #ude-table thead th {
          vertical-align: middle;
          white-space: nowrap;
          padding: 6px 8px;
          font-size: var(--font-size-xs, 11px);
        }
        #ude-table tbody tr.col-row td {
          padding: 5px 8px;
          font-size: var(--font-size-xs, 11px);
          transition: filter 0.12s;
        }
        #ude-table tbody tr.col-row:hover td { filter: brightness(0.93); }

        /* Collections columns (3-11) */
        #ude-table tbody tr.col-row td:nth-child(3),
        #ude-table tbody tr.col-row td:nth-child(4),
        #ude-table tbody tr.col-row td:nth-child(5),
        #ude-table tbody tr.col-row td:nth-child(6),
        #ude-table tbody tr.col-row td:nth-child(7),
        #ude-table tbody tr.col-row td:nth-child(8),
        #ude-table tbody tr.col-row td:nth-child(9),
        #ude-table tbody tr.col-row td:nth-child(10),
        #ude-table tbody tr.col-row td:nth-child(11) { background-color: #edf7ed; }

        /* Returns columns (12-17) */
        #ude-table tbody tr.col-row td:nth-child(12),
        #ude-table tbody tr.col-row td:nth-child(13),
        #ude-table tbody tr.col-row td:nth-child(14),
        #ude-table tbody tr.col-row td:nth-child(15),
        #ude-table tbody tr.col-row td:nth-child(16),
        #ude-table tbody tr.col-row td:nth-child(17) { background-color: #fff5e6; }

        /* Net Cash / Total Returns columns (18-19) */
        #ude-table tbody tr.col-row td:nth-child(18),
        #ude-table tbody tr.col-row td:nth-child(19) {
          background-color: #e8f0fc;
          font-weight: var(--font-weight-semibold, 600);
        }

        /* ── Report header block ── */
        .ude-report-header {
          background: linear-gradient(135deg, #f0f7ff 0%, #e3f0fb 100%);
          border-left: 5px solid var(--page-primary-color, #1976d2);
          border-radius: 8px;
          padding: 20px 28px;
          margin-bottom: 24px;
        }
        .ude-org-name {
          font-size: var(--font-size-xl, 1.25rem);
          font-weight: var(--font-weight-bold, 700);
          color: #1a237e;
          letter-spacing: 0.04em;
          margin-bottom: 6px;
        }
        .ude-divider {
          width: 56px; height: 3px;
          background: var(--page-primary-color, #1976d2);
          margin: 0 auto 12px;
          border-radius: 2px;
        }
        .ude-report-title {
          font-size: var(--font-size-base, 1rem);
          font-weight: var(--font-weight-semibold, 600);
          color: #37474f;
          margin-bottom: 0;
        }
        .ude-date-badge {
          display: inline-block;
          margin-left: 14px;
          background: var(--page-primary-color, #1976d2);
          color: #fff;
          border-radius: 20px;
          padding: 2px 14px;
          font-size: var(--font-size-sm, 0.875rem);
          font-weight: var(--font-weight-normal, 400);
          vertical-align: middle;
        }

        /* ── Summary table ── */
        .ude-summary-table th,
        .ude-summary-table td {
          padding: 6px 14px;
          white-space: nowrap;
          font-size: var(--font-size-sm, 0.875rem);
        }

        /* ── Final collection box ── */
        .ude-final-box {
          background: linear-gradient(135deg, var(--page-primary-color, #1976d2) 0%, #42a5f5 100%);
          border-radius: 12px;
          padding: 28px 20px;
          color: #fff;
          text-align: center;
          box-shadow: 0 6px 20px rgba(25, 118, 210, 0.25);
          height: 100%;
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .ude-final-box .fdc-label {
          font-size: var(--font-size-sm, 0.875rem);
          letter-spacing: 0.06em;
          text-transform: uppercase;
          opacity: 0.88;
          margin-bottom: 8px;
        }
        .ude-final-box .fdc-amount {
          font-size: var(--font-size-3xl, 1.75rem);
          font-weight: var(--font-weight-bold, 700);
          line-height: 1.1;
        }

        /* ── Signature footer ── */
        .ude-sig-block { margin-top: 12px; }
        .ude-sig-block .sig-line {
          border-bottom: 1px dashed #adb5bd;
          height: 30px;
          margin-bottom: 6px;
        }
        .ude-sig-block .sig-role {
          font-weight: var(--font-weight-semibold, 600);
          color: #495057;
          font-size: var(--font-size-sm, 0.875rem);
        }
        .ude-sig-block .sig-dept {
          color: #868e96;
          font-size: var(--font-size-xs, 0.75rem);
        }
      `}</style>

      {/* Filter Section */}
      <Card className="shadow mb-4 no-print" style={{ borderRadius: "10px", overflow: "hidden", border: "none" }}>
        <Card.Header style={{ background: "linear-gradient(90deg, var(--page-primary-color, #1976d2) 0%, #42a5f5 100%)", padding: "14px 20px" }}>
          <h5 className="mb-0 text-white">
            <FontAwesomeIcon icon={faCalendarCheck} className="me-2" />
            All User Day End Report
          </h5>
        </Card.Header>
        <Card.Body style={{ backgroundColor: "#f8fbff", padding: "20px" }}>
          <Row className="g-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label>From Date</Form.Label>
                <Form.Control
                  type="date"
                  name="fromDate"
                  value={formData.fromDate}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>To Date</Form.Label>
                <Form.Control
                  type="date"
                  name="toDate"
                  value={formData.toDate}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Col>
            <Col md={6} className="d-flex align-items-end gap-2">
              <Button
                variant="primary"
                onClick={handleGenerateReport}
                disabled={loading}
                size="lg"
              >
                {loading ? "Generating..." : "Generate Report"}
              </Button>
              <Button
                variant="outline-secondary"
                onClick={() => window.location.reload()}
                size="lg"
                title="Reset"
              >
                <FontAwesomeIcon icon={faRotateRight} className="me-1" />
                Reset
              </Button>
              {showReport && (
                <>
                  <Button variant="secondary" onClick={handlePrint} size="lg">
                    <FontAwesomeIcon icon={faPrint} className="me-2" />
                    Print
                  </Button>
                  <Button variant="success" onClick={handleExport} size="lg">
                    <FontAwesomeIcon icon={faFileExcel} className="me-2" />
                    Export
                  </Button>
                </>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Report Section */}
      {showReport && (
        <Card className="shadow-sm">
          <Card.Body id="printable-report">
            {/* Hospital Header */}
            <div className="ude-report-header text-center">
              <p className="ude-org-name">{organization?.name?.toUpperCase() || "HOSPITAL NAME"}</p>
              <div className="ude-divider" />
              <p className="ude-report-title">
                All User Day End Report
                <span className="ude-date-badge">
                  {formatDateForDisplay(formData.fromDate)} → {formatDateForDisplay(formData.toDate)}
                </span>
              </p>
            </div>

            {/* User Wise Details Table */}
            <div style={{ overflowX: "auto" }}>
              <Table bordered hover size="sm" id="ude-table" style={{ fontSize: "12px" }}>
                {/* Multi-row header */}
                <thead>
                  <tr style={{ backgroundColor: "#e8f4f8" }}>
                    <th
                      colSpan={19}
                      className="text-center"
                      style={{ fontSize: "16px", fontWeight: "bold", padding: "12px" }}
                    >
                      All User Wise Collection Details
                    </th>
                  </tr>
                  <tr style={{ backgroundColor: "#d0e8f2" }}>
                    <th rowSpan={2} className="text-center align-middle">S No</th>
                    <th rowSpan={2} className="text-center align-middle">User Name</th>
                    <th colSpan={9} className="text-center" style={{ backgroundColor: "#4caf50", color: "#fff" }}>Collections</th>
                    <th colSpan={6} className="text-center" style={{ backgroundColor: "#ff9800", color: "#fff" }}>Returns</th>
                    <th rowSpan={2} className="text-center align-middle" style={{ backgroundColor: "#1976d2", color: "#fff" }}>Net Cash</th>
                    <th rowSpan={2} className="text-center align-middle" style={{ backgroundColor: "#1976d2", color: "#fff" }}>Total Returns</th>
                  </tr>
                  <tr style={{ backgroundColor: "#d0e8f2" }}>
                    {/* Collections */}
                    <th className="text-center" style={{ backgroundColor: "#c8e6c9" }}>Collection</th>
                    <th className="text-center" style={{ backgroundColor: "#c8e6c9" }}>Cash</th>
                    <th className="text-center" style={{ backgroundColor: "#c8e6c9" }}>Company</th>
                    <th className="text-center" style={{ backgroundColor: "#c8e6c9" }}>Swipe</th>
                    <th className="text-center" style={{ backgroundColor: "#c8e6c9" }}>Cheque</th>
                    <th className="text-center" style={{ backgroundColor: "#c8e6c9" }}>Staff</th>
                    <th className="text-center" style={{ backgroundColor: "#c8e6c9" }}>Adv Adj</th>
                    <th className="text-center" style={{ backgroundColor: "#c8e6c9" }}>Discount</th>
                    <th className="text-center" style={{ backgroundColor: "#c8e6c9" }}>Due</th>
                    {/* Returns */}
                    <th className="text-center" style={{ backgroundColor: "#ffe0b2" }}>Cash</th>
                    <th className="text-center" style={{ backgroundColor: "#ffe0b2" }}>Company</th>
                    <th className="text-center" style={{ backgroundColor: "#ffe0b2" }}>Staff</th>
                    <th className="text-center" style={{ backgroundColor: "#ffe0b2" }}>Adv Adj</th>
                    <th className="text-center" style={{ backgroundColor: "#ffe0b2" }}>Discount</th>
                    <th className="text-center" style={{ backgroundColor: "#ffe0b2" }}>Due</th>
                  </tr>
                </thead>
                <tbody>
                  {userCollections.map((user, index) => (
                    <tr key={user.uid || index} className="col-row">
                      <td className="text-center">{index + 1}</td>
                      <td
                        style={{ cursor: "pointer", color: "#1565c0", fontWeight: "var(--font-weight-medium)", textDecoration: "underline" }}
                        onClick={() => handleOpenUserDetail(user)}
                        title="Click to view bill details"
                      >
                        {user.username}
                      </td>
                      <td className="text-end">{user.collection.toFixed(2)}</td>
                      <td className="text-end">{user.cash.toFixed(2)}</td>
                      <td className="text-end">{user.company.toFixed(2)}</td>
                      <td className="text-end">
                        {(
                          user.bankAmountDetails.cardAmount +
                          user.bankAmountDetails.upiNeftAmount
                        ).toFixed(2)}
                      </td>
                      <td className="text-end">{user.bankAmountDetails.chequeAmount.toFixed(2)}</td>
                      <td className="text-end">{user.staff.toFixed(2)}</td>
                      <td className="text-end">{user.advAdj.toFixed(2)}</td>
                      <td className="text-end">{user.disc.toFixed(2)}</td>
                      <td className="text-end">{user.due.toFixed(2)}</td>
                      <td className="text-end">{user.cashR.toFixed(2)}</td>
                      <td className="text-end">{user.companyR.toFixed(2)}</td>
                      <td className="text-end">{user.staffR.toFixed(2)}</td>
                      <td className="text-end">{user.advAdjR.toFixed(2)}</td>
                      <td className="text-end">{user.discR.toFixed(2)}</td>
                      <td className="text-end">{user.dueR.toFixed(2)}</td>
                      <td className="text-end" style={{ fontWeight: "bold" }}>
                        {user.netCash.toFixed(2)}
                      </td>
                      <td className="text-end">{user.creturns.toFixed(2)}</td>
                    </tr>
                  ))}
                  {/* Grand Total Row */}
                  {totalRow && (
                    <tr style={{ backgroundColor: "var(--page-primary-color)", color: "white", fontWeight: "bold" }}>
                      <td></td>
                      <td>{totalRow.username}</td>
                      <td className="text-end">{totalRow.collection.toFixed(2)}</td>
                      <td className="text-end">{totalRow.cash.toFixed(2)}</td>
                      <td className="text-end">{totalRow.company.toFixed(2)}</td>
                      <td className="text-end">
                        {(
                          totalRow.bankAmountDetails.cardAmount +
                          totalRow.bankAmountDetails.upiNeftAmount
                        ).toFixed(2)}
                      </td>
                      <td className="text-end">{totalRow.bankAmountDetails.chequeAmount.toFixed(2)}</td>
                      <td className="text-end">{totalRow.staff.toFixed(2)}</td>
                      <td className="text-end">{totalRow.advAdj.toFixed(2)}</td>
                      <td className="text-end">{totalRow.disc.toFixed(2)}</td>
                      <td className="text-end">{totalRow.due.toFixed(2)}</td>
                      <td className="text-end">{totalRow.cashR.toFixed(2)}</td>
                      <td className="text-end">{totalRow.companyR.toFixed(2)}</td>
                      <td className="text-end">{totalRow.staffR.toFixed(2)}</td>
                      <td className="text-end">{totalRow.advAdjR.toFixed(2)}</td>
                      <td className="text-end">{totalRow.discR.toFixed(2)}</td>
                      <td className="text-end">{totalRow.dueR.toFixed(2)}</td>
                      <td className="text-end">{totalRow.netCash.toFixed(2)}</td>
                      <td className="text-end">{totalRow.creturns.toFixed(2)}</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>

            {/* Company Receivables Summary Table */}
            {companyReceivables.length > 0 && (
              <div className="mt-4" style={{ overflowX: "auto" }}>
                <Table bordered size="sm" style={{ fontSize: "var(--font-size-xs)" }}>
                  <thead>
                    <tr style={{ backgroundColor: "#e8f4f8" }}>
                      <th
                        colSpan={4}
                        className="text-center"
                        style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-semibold)", padding: "10px" }}
                      >
                        Company Receivables Summary
                      </th>
                    </tr>
                    <tr style={{ backgroundColor: "#d0e8f2" }}>
                      <th>User Name</th>
                      <th>Company Name</th>
                      <th className="text-end" style={{ backgroundColor: "#c8e6c9" }}>Cash</th>
                      <th className="text-end" style={{ backgroundColor: "#c8e6c9" }}>Bank</th>
                    </tr>
                  </thead>
                  <tbody>
                    {companyReceivables.map((item, index) => (
                      <tr key={index}>
                        <td>{item.userName}</td>
                        <td>{item.companyName}</td>
                        <td className="text-end">{item.cash.toFixed(2)}</td>
                        <td className="text-end">{item.bank.toFixed(2)}</td>
                      </tr>
                    ))}
                    <tr style={{ backgroundColor: "var(--page-primary-color)", color: "white", fontWeight: "bold" }}>
                      <td colSpan={2}>Total</td>
                      <td className="text-end">
                        {companyReceivables.reduce((sum, i) => sum + i.cash, 0).toFixed(2)}
                      </td>
                      <td className="text-end">
                        {companyReceivables.reduce((sum, i) => sum + i.bank, 0).toFixed(2)}
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            )}

            <Row className="mt-4 mb-2 align-items-stretch g-3">
              {billTypeSummary.length > 0 && (
                <Col md={6}>
                  <div style={{ background: "#fff", border: "1px solid #e0e7ef", borderRadius: "10px", padding: "16px 18px", height: "100%" }}>
                    <p style={{ fontWeight: "var(--font-weight-semibold, 600)", marginBottom: "12px", color: "#37474f", borderBottom: "2px solid #e0e7ef", paddingBottom: "8px" }}>
                      Bill Type Wise Summary
                    </p>
                    <Table bordered size="sm" className="w-auto mb-0 ude-summary-table">
                      <thead>
                        <tr style={{ backgroundColor: "#d0e8f2" }}>
                          <th>Bill Type</th>
                          <th className="text-end" style={{ backgroundColor: "#c8e6c9" }}>Cash</th>
                          <th className="text-end" style={{ backgroundColor: "#c8e6c9" }}>Swipe</th>
                        </tr>
                      </thead>
                      <tbody>
                        {billTypeSummary.map((item) => (
                          <tr key={item.name}>
                            <td>{item.name}</td>
                            <td className="text-end">{item.cash.toFixed(2)}</td>
                            <td className="text-end">{item.swipe.toFixed(2)}</td>
                          </tr>
                        ))}
                        <tr style={{ backgroundColor: "#4caf50", color: "#fff", fontWeight: "bold" }}>
                          <th>Total</th>
                          <th className="text-end">{summaryTotalCash.toFixed(2)}</th>
                          <th className="text-end">{summaryTotalSwipe.toFixed(2)}</th>
                        </tr>
                      </tbody>
                    </Table>
                  </div>
                </Col>
              )}
              {totalRow && (
                <Col md={billTypeSummary.length > 0 ? 6 : 12}>
                  <div className="ude-final-box">
                    <p className="fdc-label">Final Day Collection</p>
                    <p className="fdc-amount">₹ {totalRow.netCash.toFixed(2)}</p>
                  </div>
                </Col>
              )}
            </Row>

            {/* Verification Footer */}
            <div className="mt-5 pt-3" style={{ borderTop: "1px solid #dee2e6" }}>
              <Row>
                <Col md={4}>
                  <div className="ude-sig-block">
                    <div className="sig-line" />
                    <p className="sig-role mb-0">Verified By</p>
                    <p className="sig-dept">Accounts Department</p>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="ude-sig-block">
                    <div className="sig-line" />
                    <p className="sig-role mb-0">Reviewed By</p>
                    <p className="sig-dept">Senior Accountant</p>
                  </div>
                </Col>
                <Col md={4}>
                  <div className="ude-sig-block">
                    <div className="sig-line" />
                    <p className="sig-role mb-0">Authorized By</p>
                    <p className="sig-dept">Finance Manager</p>
                  </div>
                </Col>
              </Row>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* ── Bill Wise Detail Modal ── */}
      <Modal
        show={detailModal.show}
        onHide={() => setDetailModal((prev) => ({ ...prev, show: false }))}
        size="xl"
        centered
        scrollable
      >
        <Modal.Header
          closeButton
          style={{ background: "linear-gradient(90deg, var(--page-primary-color, #1976d2) 0%, #42a5f5 100%)", color: "#fff" }}
        >
          <Modal.Title style={{ fontSize: "var(--font-size-base)", fontWeight: "var(--font-weight-semibold)" }}>
            Bill Wise Collection — {detailModal.userName}
            <span style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-normal)", marginLeft: "12px", opacity: 0.85 }}>
              {formatDateForDisplay(formData.fromDate)} → {formatDateForDisplay(formData.toDate)}
            </span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: "1rem" }}>
          {detailModal.loading ? (
            <div className="text-center py-4">
              <Spinner animation="border" variant="primary" />
            </div>
          ) : detailModal.details.length === 0 ? (
            <p className="text-center text-muted mb-0" style={{ fontSize: "var(--font-size-sm)" }}>No records found.</p>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <Table bordered hover size="sm" style={{ fontSize: "var(--font-size-xs)", whiteSpace: "nowrap" }}>
                <thead>
                  <tr style={{ backgroundColor: "#d0e8f2" }}>
                    <th className="text-center">S No</th>
                    <th>Name</th>
                    <th className="text-center">OP No</th>
                    <th className="text-center">Bill No</th>
                    <th className="text-center">Bill Date</th>
                    <th className="text-end">Total</th>
                    <th className="text-end">Disc.</th>
                    <th className="text-end">Poor Disc.</th>
                    <th className="text-end">Payable</th>
                    <th className="text-end">Paid</th>
                    <th className="text-end">Balance</th>
                    <th className="text-end">Cash</th>
                    <th className="text-end">Bank</th>
                    <th className="text-end">Company</th>
                    <th className="text-end">Staff</th>
                  </tr>
                </thead>
                <tbody>
                  {detailModal.details.map((row, idx) => {
                    const disc = row.discount ?? 0;
                    const payable = (row.total ?? 0) - disc;
                    const balance = payable - (row.paid ?? 0);
                    const bank = row.bankPaid ?? 0;
                    const company = row.companyPaid ?? 0;
                    const staff = row.staffPaid ?? 0;
                    const billDate = row.dateTime
                      ? row.dateTime.replace("T", " ").substring(0, 19)
                      : "";
                    return (
                      <tr key={idx}>
                        <td className="text-center">{idx + 1}</td>
                        <td>{row.name}</td>
                        <td className="text-center">{row.displayNumber}</td>
                        <td className="text-center">{row.resolvedBillNo ?? row.billId}</td>
                        <td className="text-center">{billDate}</td>
                        <td className="text-end">{(row.total ?? 0).toFixed(2)}</td>
                        <td className="text-end">{disc.toFixed(2)}</td>
                        <td className="text-end">{(row.advAdj ?? 0).toFixed(2)}</td>
                        <td className="text-end">{payable.toFixed(2)}</td>
                        <td className="text-end">{(row.paid ?? 0).toFixed(2)}</td>
                        <td className="text-end">{balance.toFixed(2)}</td>
                        <td className="text-end">{(row.cashPaid ?? 0).toFixed(2)}</td>
                        <td className="text-end">{bank.toFixed(2)}</td>
                        <td className="text-end">{company.toFixed(2)}</td>
                        <td className="text-end">{staff.toFixed(2)}</td>
                      </tr>
                    );
                  })}
                  {/* Total row */}
                  <tr style={{ backgroundColor: "var(--page-primary-color)", color: "white", fontWeight: "bold" }}>
                    <td colSpan={5} className="text-end">Total</td>
                    <td className="text-end">{detailModal.details.reduce((s, r) => s + (r.total ?? 0), 0).toFixed(2)}</td>
                    <td className="text-end">{detailModal.details.reduce((s, r) => s + (r.discount ?? 0), 0).toFixed(2)}</td>
                    <td className="text-end">{detailModal.details.reduce((s, r) => s + (r.advAdj ?? 0), 0).toFixed(2)}</td>
                    <td className="text-end">{detailModal.details.reduce((s, r) => s + (r.total ?? 0) - (r.discount ?? 0), 0).toFixed(2)}</td>
                    <td className="text-end">{detailModal.details.reduce((s, r) => s + (r.paid ?? 0), 0).toFixed(2)}</td>
                    <td className="text-end">{detailModal.details.reduce((s, r) => s + ((r.total ?? 0) - (r.discount ?? 0) - (r.paid ?? 0)), 0).toFixed(2)}</td>
                    <td className="text-end">{detailModal.details.reduce((s, r) => s + (r.cashPaid ?? 0), 0).toFixed(2)}</td>
                    <td className="text-end">{detailModal.details.reduce((s, r) => s + (r.bankPaid ?? 0), 0).toFixed(2)}</td>
                    <td className="text-end">{detailModal.details.reduce((s, r) => s + (r.companyPaid ?? 0), 0).toFixed(2)}</td>
                    <td className="text-end">{detailModal.details.reduce((s, r) => s + (r.staffPaid ?? 0), 0).toFixed(2)}</td>
                  </tr>
                </tbody>
              </Table>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setDetailModal((prev) => ({ ...prev, show: false }))}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default UserDayEnd;
