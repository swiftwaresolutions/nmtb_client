import React, { useRef, useState } from "react";
import { Container, Card, Row, Col, Form, Button, Table } from "react-bootstrap";
import { useSelector } from "react-redux";
import { useReactToPrint } from "react-to-print";
import { RootState } from "../../../../../state/store";
import { showErrorToast, showSuccessToast, showWarningToast } from "../../../../../utils/alertUtil";
import { faCalendarCheck, faPrint, faFileExcel, faRotateRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CashCounterApiService } from "../../../../../api/cash-counter/cash-counter-api-service";
import PrintHeaderReports from "../../../../../components/PrintHeaderReports";

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

// Helper function to format date from YYYY-MM-DD to DD-MM-YYYY
const formatDateForDisplay = (dateString: string): string => {
  const date = new Date(dateString);
  const day = String(date.getDate()).padStart(2, '0');
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const year = date.getFullYear();
  return `${day}-${month}-${year}`;
};

const PhUserDayEnd: React.FC = () => {
  const loginData = useSelector((state: RootState) => state.loginData);
  const organization = useSelector((state: RootState) => state.appReducer.organization);
  const printRef = useRef<HTMLDivElement>(null);
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
        cashCounterApi.fetchDayEndPharmacyCollectionReport(formData.fromDate, formData.toDate),
        cashCounterApi.fetchPhBillTypeWiseCollection(formData.fromDate, formData.toDate),
      ]);

      const mappedSummary = (summaryResponse || []).map((item: any) => ({
        name: item?.name || "",
        cash: Number(item?.cash || 0),
        swipe: Number(item?.swipe || 0),
      }));

      if (!response || response.length === 0) {
        setBillTypeSummary([]);
        showWarningToast("No data found for the selected date range");
        setShowReport(false);
        setReportData([]);
        return;
      }

      setBillTypeSummary(mappedSummary);
      setReportData(response);
      setShowReport(true);
      showSuccessToast("Report generated successfully");
    } catch (error: any) {
      console.error("Error generating report:", error);
      showErrorToast(
        error?.response?.data?.error || "Failed to generate report"
      );
      setBillTypeSummary([]);
      setShowReport(false);
      setReportData([]);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    pageStyle: `
      @page { margin: 0.5in; }
      * { -webkit-print-color-adjust: exact !important; print-color-adjust: exact !important; }
      body { font-family: 'Times New Roman', Times, serif; font-size: 7px; color: #000; }
      .card { box-shadow: none !important; border: none !important; }
      #ude-table th,
      #ude-table td { font-size: 6px !important; padding: 2px 4px !important; line-height: 1.1 !important; }
      .ude-summary-table th,
      .ude-summary-table td { font-size: 6px !important; padding: 2px 8px !important; }
    `,
  });

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
          .ude-print-header { display: block !important; margin-bottom: 8px; }
          .ude-report-header { display: none !important; }
          .ude-bottom-row { display: flex !important; gap: 12px !important; align-items: stretch !important; }
          .ude-bottom-col { flex: 1 1 0 !important; max-width: 50% !important; }
          .ude-final-box {
            background: #fff !important;
            color: #000 !important;
            border: 2px solid #000 !important;
            box-shadow: none !important;
            padding: 14px 12px !important;
          }
          .ude-final-box .fdc-label,
          .ude-final-box .fdc-amount {
            color: #000 !important;
            opacity: 1 !important;
          }
          .ude-signature-wrap {
            margin-top: 16px !important;
            padding-top: 8px !important;
            page-break-inside: avoid !important;
            break-inside: avoid !important;
          }
          .ude-signature-row {
            display: flex !important;
            flex-wrap: nowrap !important;
            gap: 12px !important;
          }
          .ude-signature-col {
            flex: 1 1 0 !important;
            max-width: 33.333% !important;
          }
          .ude-sig-block .sig-line {
            height: 18px !important;
            margin-bottom: 4px !important;
          }
        }

        .ude-print-header {
          display: none;
        }
        .ude-print-title {
          text-align: center;
          font-size: var(--font-size-md);
          font-weight: var(--font-weight-bold);
          margin: 4px 0 2px;
        }
        .ude-print-subtitle {
          text-align: center;
          font-size: var(--font-size-sm);
          margin-bottom: 8px;
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
        .ude-signature-wrap {
          margin-top: 20px;
          padding-top: 12px;
          border-top: 1px solid #dee2e6;
        }
        .ude-signature-row {
          row-gap: 12px;
        }
        .ude-signature-col {
          display: flex;
        }
        .ude-signature-col .ude-sig-block {
          width: 100%;
          margin-top: 0;
        }
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
            Pharmacy User Day End Report
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
        <div ref={printRef}>
          <Card className="shadow-sm">
          <Card.Body id="printable-report">
            <div className="ude-print-header">
              <PrintHeaderReports
                organization={{
                  name: organization?.name || "",
                  code: organization?.code || "",
                  address: organization?.address || "",
                  phone: organization?.phoneNo || "",
                }}
              />
              <div className="ude-print-title">Pharmacy User Day End Report</div>
              <div className="ude-print-subtitle">
                {formatDateForDisplay(formData.fromDate)} - {formatDateForDisplay(formData.toDate)}
              </div>
            </div>

            {/* Hospital Header */}
            <div className="ude-report-header text-center">
              <p className="ude-org-name">{organization?.name?.toUpperCase() || "HOSPITAL NAME"}</p>
              <div className="ude-divider" />
              <p className="ude-report-title">
                Pharmacy User Wise Day End Report
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
                      Pharmacy User Wise Collection Details
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
                      <td>{user.username}</td>
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

            <Row className="mt-4 mb-2 align-items-stretch g-3 ude-bottom-row">
              {billTypeSummary.length > 0 && (
                <Col md={6} className="ude-bottom-col">
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
                <Col md={billTypeSummary.length > 0 ? 6 : 12} className="ude-bottom-col">
                  <div className="ude-final-box">
                    <p className="fdc-label">Final Day Collection</p>
                    <p className="fdc-amount">₹ {totalRow.netCash.toFixed(2)}</p>
                  </div>
                </Col>
              )}
            </Row>

            {/* Verification Footer */}
            <div className="ude-signature-wrap">
              <Row className="ude-signature-row">
                <Col md={4} className="ude-signature-col">
                  <div className="ude-sig-block">
                    <div className="sig-line" />
                    <p className="sig-role mb-0">Verified By</p>
                    <p className="sig-dept">Accounts Department</p>
                  </div>
                </Col>
                <Col md={4} className="ude-signature-col">
                  <div className="ude-sig-block">
                    <div className="sig-line" />
                    <p className="sig-role mb-0">Reviewed By</p>
                    <p className="sig-dept">Senior Accountant</p>
                  </div>
                </Col>
                <Col md={4} className="ude-signature-col">
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
        </div>
      )}
    </Container>
  );
};

export default PhUserDayEnd;
