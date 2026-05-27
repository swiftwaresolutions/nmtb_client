import React, { useState } from "react";
import { Container, Card, Row, Col, Form, Button, Table } from "react-bootstrap";
import { useSelector } from "react-redux";
import { RootState } from "../../../state/store";
import { showErrorToast, showSuccessToast, showWarningToast } from "../../../utils/alertUtil";
import { faCalendarCheck, faPrint, faFileExcel } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { CashCounterApiService } from "../../../api/cash-counter/cash-counter-api-service";

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
      const response = await cashCounterApi.fetchUserDayEndReport(
        formData.fromDate,
        formData.toDate
      );

      const dayEndData = response.dayEndCollectionReport;

      if (!dayEndData || dayEndData.length === 0) {
        showWarningToast("No data found for the selected date range");
        setShowReport(false);
        setReportData([]);
        return;
      }

      setReportData(dayEndData);
      setShowReport(true);
      showSuccessToast("Report generated successfully");
    } catch (error: any) {
      console.error("Error generating report:", error);
      showErrorToast(
        error?.response?.data?.error || "Failed to generate report"
      );
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

  return (
    <Container fluid className="p-4">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          #printable-report, #printable-report * {
            visibility: visible;
          }
          #printable-report {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .card {
            box-shadow: none !important;
            border: none !important;
          }
          @page {
            margin: 0.5in;
          }
          body {
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        }
      `}</style>

      {/* Filter Section */}
      <Card className="shadow-sm mb-4 no-print">
        <Card.Header className="bg-primary text-white">
          <h5 className="mb-0">
            <FontAwesomeIcon icon={faCalendarCheck} className="me-2" />
            User Day End Report - Filter
          </h5>
        </Card.Header>
        <Card.Body>
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
            <div className="text-center mb-4">
              <h3 style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>
                {organization?.name?.toUpperCase() || "HOSPITAL NAME"}
              </h3>
              <h5 style={{ fontWeight: "600", marginBottom: "0.5rem" }}>
                User Day End Report
              </h5>
              <p style={{ marginBottom: "1rem", fontSize: "14px" }}>
                From: {formatDateForDisplay(formData.fromDate)} To: {formatDateForDisplay(formData.toDate)}
              </p>
            </div>

            {/* User Wise Details Table */}
            <div style={{ overflowX: "auto" }}>
              <Table bordered hover size="sm" style={{ fontSize: "12px" }}>
                {/* Multi-row header */}
                <thead>
                  <tr style={{ backgroundColor: "#e8f4f8" }}>
                    <th
                      colSpan={17}
                      className="text-center"
                      style={{ fontSize: "16px", fontWeight: "bold", padding: "12px" }}
                    >
                      User Wise Collection Details
                    </th>
                  </tr>
                  <tr style={{ backgroundColor: "#d0e8f2" }}>
                    <th rowSpan={2} className="text-center align-middle">S No</th>
                    <th rowSpan={2} className="text-center align-middle">User Name</th>
                    <th colSpan={7} className="text-center">Collections</th>
                    <th colSpan={6} className="text-center">Returns</th>
                    <th rowSpan={2} className="text-center align-middle">Net Cash</th>
                    <th rowSpan={2} className="text-center align-middle">Total Returns</th>
                  </tr>
                  <tr style={{ backgroundColor: "#d0e8f2" }}>
                    {/* Collections */}
                    <th className="text-center">Collection</th>
                    <th className="text-center">Cash</th>
                    <th className="text-center">Card</th>
                    <th className="text-center">UPI/NEFT</th>
                    <th className="text-center">Cheque</th>
                    <th className="text-center">Staff</th>
                    <th className="text-center">Discount</th>
                    {/* Returns */}
                    <th className="text-center">Cash</th>
                    <th className="text-center">Company</th>
                    <th className="text-center">Staff</th>
                    <th className="text-center">Adv Adj</th>
                    <th className="text-center">Discount</th>
                    <th className="text-center">Due</th>
                  </tr>
                </thead>
                <tbody>
                  {userCollections.map((user, index) => (
                    <tr key={user.uid || index}>
                      <td className="text-center">{index + 1}</td>
                      <td>{user.username}</td>
                      <td className="text-end">{user.collection.toFixed(2)}</td>
                      <td className="text-end">{user.cash.toFixed(2)}</td>
                      <td className="text-end">{user.bankAmountDetails.cardAmount.toFixed(2)}</td>
                      <td className="text-end">{user.bankAmountDetails.upiNeftAmount.toFixed(2)}</td>
                      <td className="text-end">{user.bankAmountDetails.chequeAmount.toFixed(2)}</td>
                      <td className="text-end">{user.staff.toFixed(2)}</td>
                      <td className="text-end">{user.disc.toFixed(2)}</td>
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
                      <td className="text-end">{totalRow.bankAmountDetails.cardAmount.toFixed(2)}</td>
                      <td className="text-end">{totalRow.bankAmountDetails.upiNeftAmount.toFixed(2)}</td>
                      <td className="text-end">{totalRow.bankAmountDetails.chequeAmount.toFixed(2)}</td>
                      <td className="text-end">{totalRow.staff.toFixed(2)}</td>
                      <td className="text-end">{totalRow.disc.toFixed(2)}</td>
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

            {/* Final Day Collection */}
            {totalRow && (
              <div className="mt-4 mb-4">
                <div
                  style={{
                    textAlign: "center",
                    padding: "15px",
                    backgroundColor: "#e8f4f8",
                    borderRadius: "8px",
                  }}
                >
                  <h5 style={{ marginBottom: "0.5rem", fontWeight: "600" }}>
                    Final Day Collection
                  </h5>
                  <h3 style={{ marginBottom: "0", fontWeight: "bold", color: "var(--page-primary-color)" }}>
                    ₹ {totalRow.netCash.toFixed(2)}
                  </h3>
                </div>
              </div>
            )}

            {/* Verification Footer */}
            <div className="mt-5">
              <Row>
                <Col md={6}>
                  <div style={{ borderTop: "1px solid #000", paddingTop: "8px" }}>
                    <strong>Verified By</strong>
                  </div>
                </Col>
                <Col md={6}>
                  <div style={{ borderTop: "1px solid #000", paddingTop: "8px" }}>
                    <strong>Authorized By</strong>
                  </div>
                </Col>
              </Row>
            </div>
          </Card.Body>
        </Card>
      )}
    </Container>
  );
};

export default UserDayEnd;
