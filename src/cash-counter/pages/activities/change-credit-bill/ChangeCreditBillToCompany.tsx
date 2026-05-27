import React, { useState } from "react";
import { Row, Col, Card, Form, Table, Button, Badge } from "react-bootstrap";
import { Search, XCircle } from "react-bootstrap-icons";
import { faExchangeAlt } from "@fortawesome/free-solid-svg-icons";
import PageHeader from "../../../../components/PageHeader";
import { CashCounterApiService } from "../../../../api/cash-counter/cash-counter-api-service";
import { MedicalRecordsApiService } from "../../../../api/medical-records/medical-records-api-service";
import { showErrorToast, showValidationError, showSuccessToast, showConfirmDialog } from "../../../../utils/alertUtil";

interface PatientDetails {
  patId: number;
  displayNumber: string;
  name: string;
  secName: string;
  sex: string;
  age: string;
  phone: string;
  debitHead: string;
  debitId: number;
  lastVisitId: number;
}

interface DueBill {
  id: number;
  dateTime: string;
  billDisplay: string;
  due: number;
  finalBillId: number;
  invBillNo: string;
  labBillNo: string;
  phBillNo: string;
  ipBillNo: string;
}

const ChangeCreditBillToCompany: React.FC = () => {
  const themePrimary = "var(--page-primary-color)";
  const themeSecondary = "var(--page-secondary-color)";

  const cashCounterApi = new CashCounterApiService();
  const medicalRecordsApi = new MedicalRecordsApiService();

  const [opNumber, setOpNumber] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const [searchPerformed, setSearchPerformed] = useState<boolean>(false);
  const [patientDetails, setPatientDetails] = useState<PatientDetails | null>(null);
  const [dueBills, setDueBills] = useState<DueBill[]>([]);
  const [isChanging, setIsChanging] = useState<boolean>(false);

  const handleSearch = async () => {
    if (!opNumber.trim()) {
      showValidationError("Please enter OP Number");
      return;
    }

    setSearchPerformed(true);
    setLoading(true);

    try {
      // Fetch patient details by OP Number
      const patientResponse = await medicalRecordsApi.fetchPatientDetails(opNumber.trim());
      const patientData = patientResponse?.data || patientResponse;

      if (!patientData || !patientData.patId) {
        showErrorToast("Patient not found");
        setPatientDetails(null);
        setDueBills([]);
        setLoading(false);
        return;
      }

      setPatientDetails({
        patId: patientData.patId,
        displayNumber: patientData.displayNumber || opNumber,
        name: `${patientData.name || ""} ${patientData.secName || ""}`.trim(),
        secName: patientData.secName || "",
        sex: patientData.sex || "",
        age: patientData.age || "",
        phone: patientData.phone || "",
        debitHead: patientData.debitHead || "General",
        debitId: Number(patientData.debitId) || 1,
        lastVisitId: Number(patientData.lastVisitId) || 0,
      });

      // Fetch due bills using patId
      const dueResponse = await cashCounterApi.fetchDueDetails(patientData.patId);
      const dueData = dueResponse?.data || dueResponse || [];
      
      const mappedDueBills: DueBill[] = Array.isArray(dueData)
        ? dueData.map((item: any, index: number) => ({
            id: index + 1,
            dateTime: String(item?.dateTime || item?.date || "-"),
            billDisplay: String(item?.billDisplay || item?.billNo || "-"),
            due: Number(item?.due || 0),
            finalBillId: Number(item?.finalBillId || 0),
            invBillNo: String(item?.invBillNo || "-"),
            labBillNo: String(item?.labBillNo || "-"),
            phBillNo: String(item?.phBillNo || "-"),
            ipBillNo: String(item?.ipBillNo || "-"),
          }))
        : [];

      setDueBills(mappedDueBills);

      if (mappedDueBills.length === 0) {
        showValidationError("No due bills found for this patient");
      }
    } catch (error: any) {
      console.error("Error fetching patient/due details:", error);
      const errorMsg =
        error?.response?.data?.error ||
        error?.response?.data?.message ||
        "Failed to fetch patient details";
      showErrorToast(errorMsg);
      setPatientDetails(null);
      setDueBills([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setOpNumber("");
    setSearchPerformed(false);
    setPatientDetails(null);
    setDueBills([]);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSearch();
    }
  };

  const handleChangeClick = async (bill: DueBill) => {
    if (!patientDetails) return;

    // Check if patient is under debitId = 1 (General)
    if (patientDetails.debitId === 1) {
      showValidationError(
        "Patient is under General account. Credit bill change is not allowed for General account patients."
      );
      return;
    }

    // Confirm action
    const confirmed = await showConfirmDialog(
      `Change bill ${bill.billDisplay} (₹${bill.due.toFixed(2)}) to company billing?`,
      "This action will transfer the bill to the company account"
    );

    if (!confirmed) return;

    setIsChanging(true);
    try {
      const payload = {
        headId: patientDetails.debitId, // Use patient's debitId as headId
        finalBillId: bill.finalBillId,
        amt: bill.due,
        patId: patientDetails.patId,
        visitId: patientDetails.lastVisitId,
        note: `Changed from General account to ${patientDetails.debitHead} company billing`,
      };

      await cashCounterApi.changeCreditBills(payload);
      showSuccessToast("Credit bill changed to company successfully");
      // Refresh due bills
      await handleSearch();
    } catch (error: any) {
      console.error("Error changing credit bill:", error);
      const errorMsg =
        error?.response?.data?.message ||
        error?.response?.data?.error ||
        "Failed to change credit bill";
      showErrorToast(errorMsg);
    } finally {
      setIsChanging(false);
    }
  };

  const totalDue = dueBills.reduce((sum, bill) => sum + bill.due, 0);

  return (
    <>
      <PageHeader
        icon={faExchangeAlt}
        title="Change Credit Bill to Company"
        subtitle="Convert patient credit bills to company billing"
      />

      <div
        className="content-body"
        style={{
          display: "flex",
          flex: 1,
          minHeight: 0,
          flexDirection: "column",
          gap: "1rem",
          overflowY: "auto",
        }}
      >
        {/* Search Section and Patient Information */}
        <Card className="shadow-sm bg-light" style={{ flexShrink: 0 }}>
          <Card.Body>
            <Row className="align-items-center mb-3">
              <Col md={3}>
                <Form.Group className="mb-0">
                  <Form.Label
                    style={{
                      fontSize: "var(--font-size-sm)",
                      fontWeight: "var(--font-weight-medium)",
                    }}
                  >
                    OP Number <span style={{ color: "#c2185b" }}>*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter OP Number (e.g., 26-4)"
                    value={opNumber}
                    onChange={(e) => setOpNumber(e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={loading}
                    autoFocus
                  />
                </Form.Group>
              </Col>

              <Col md={3}>
                <div className="d-flex gap-2" style={{ marginTop: "1.5rem" }}>
                  <Button
                    size="sm"
                    className="theme-btn-primary"
                    onClick={handleSearch}
                    disabled={loading || !opNumber.trim()}
                  >
                    <Search size={16} className="me-1" />
                    {loading ? "Searching..." : "Search"}
                  </Button>
                  <Button
                    size="sm"
                    className="theme-outline-btn-secondary"
                    onClick={handleClear}
                    disabled={loading}
                  >
                    <XCircle size={16} className="me-1" />
                    Clear
                  </Button>
                </div>
              </Col>

              {patientDetails && (
                <Col md={6}>
                  <div 
                    style={{
                      backgroundColor: "#e3f2fd",
                      padding: "0.75rem 1rem",
                      borderRadius: "var(--border-radius-md)",
                      border: "1px solid #90caf9",
                    }}
                  >
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <h6 
                        className="mb-0" 
                        style={{ 
                          fontWeight: "var(--font-weight-semibold)",
                          fontSize: "var(--font-size-sm)",
                          color: "#1565c0"
                        }}
                      >
                        Patient Information
                      </h6>
                      <Badge
                        bg="" 
                        style={{
                          backgroundColor: "#c8e6c9",
                          color: "#2e7d32",
                          fontSize: "var(--font-size-xs)",
                          fontWeight: "var(--font-weight-medium)"
                        }}
                      >
                        {patientDetails.debitHead}
                      </Badge>
                    </div>
                    <Row className="g-2">
                      <Col md={6}>
                        <div>
                          <small style={{ fontSize: "var(--font-size-xs)", color: "#616161" }}>
                            Name:
                          </small>
                          <span className="fw-bold ms-1" style={{ fontSize: "var(--font-size-sm)" }}>
                            {patientDetails.name}
                          </span>
                        </div>
                      </Col>
                      <Col md={3}>
                        <div>
                          <small style={{ fontSize: "var(--font-size-xs)", color: "#616161" }}>
                            Age/Sex:
                          </small>
                          <span className="fw-bold ms-1" style={{ fontSize: "var(--font-size-sm)" }}>
                            {patientDetails.age}/{patientDetails.sex}
                          </span>
                        </div>
                      </Col>
                      <Col md={3}>
                        <div>
                          <small style={{ fontSize: "var(--font-size-xs)", color: "#616161" }}>
                            Phone:
                          </small>
                          <span className="fw-bold ms-1" style={{ fontSize: "var(--font-size-sm)" }}>
                            {patientDetails.phone || "-"}
                          </span>
                        </div>
                      </Col>
                    </Row>
                  </div>
                </Col>
              )}
            </Row>
          </Card.Body>
        </Card>

        {/* Due Bills Table */}
        <Card
          className="shadow-sm"
          style={{
            flex: 1,
            minHeight: 0,
            display: "flex",
            flexDirection: "column",
            border: `1px solid ${themePrimary}`,
          }}
        >
          <Card.Header
            style={{
              backgroundColor: themePrimary,
              color: themeSecondary,
              borderBottom: `2px solid ${themePrimary}`,
              flexShrink: 0,
            }}
          >
            <div className="d-flex justify-content-between align-items-center">
              <h5
                className="mb-0"
                style={{
                  fontWeight: "var(--font-weight-semibold)",
                  fontSize: "var(--font-size-lg)",
                }}
              >
                Due Bills
              </h5>
              <div className="d-flex gap-2 align-items-center">
                <Badge
                  bg=""
                  style={{
                    backgroundColor: dueBills.length > 0 ? "#c8e6c9" : "var(--color-neutral-200)",
                    color: dueBills.length > 0 ? "#2e7d32" : "var(--color-text-secondary)",
                    fontSize: "var(--font-size-sm)",
                    fontWeight: "var(--font-weight-medium)"
                  }}
                >
                  {dueBills.length} Bill(s)
                </Badge>
                {dueBills.length > 0 && (
                  <Badge
                    bg="" 
                    style={{
                      backgroundColor: "#ffcdd2",
                      color: "#c62828",
                      fontSize: "var(--font-size-sm)",
                      fontWeight: "var(--font-weight-medium)"
                    }}
                  >
                    Total Due: ₹{totalDue.toFixed(2)}
                  </Badge>
                )}  
              </div>
            </div>
          </Card.Header>

          <Card.Body style={{ flex: 1, minHeight: 0, padding: 0, overflow: "auto" }}>
            <Table striped bordered hover responsive>
              <thead
                style={{
                  position: "sticky",
                  top: 0,
                  backgroundColor: themeSecondary,
                  color: themePrimary,
                  zIndex: 10,
                }}
              >
                <tr>
                  <th>#</th>
                  <th>Date & Time</th>
                  <th>Bill Display</th>
                  <th>Investigation Bill No</th>
                  <th>Lab Bill No</th>
                  <th>Pharmacy Bill No</th>
                  <th>IP Bill No</th>
                  <th className="text-end">Due Amount</th>
                  <th className="text-center">Action</th>
                </tr>
              </thead>

              <tbody>
                {dueBills.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="text-center p-5 text-muted">
                      {loading ? (
                        <div>
                          <div
                            className="spinner-border mb-2"
                            style={{ color: themePrimary }}
                            role="status"
                          >
                            <span className="visually-hidden">Loading...</span>
                          </div>
                          <p className="mb-0">Loading due bills...</p>
                        </div>
                      ) : (
                        <div>
                          <Search size={42} className="mb-2" />
                          <p className="mb-0">
                            {searchPerformed
                              ? "No due bills found for this patient."
                              : "Enter OP Number and search to view due bills."}
                          </p>
                        </div>
                      )}
                    </td>
                  </tr>
                ) : (
                  dueBills.map((bill, index) => (
                    <tr key={bill.id}>
                      <td>{index + 1}</td>
                      <td>{bill.dateTime}</td>
                      <td>{bill.billDisplay}</td>
                      <td>{bill.invBillNo}</td>
                      <td>{bill.labBillNo}</td>
                      <td>{bill.phBillNo}</td>
                      <td>{bill.ipBillNo}</td>
                      <td className="text-end">
                        <span 
                          className="fw-bold"
                          style={{ color: "#c2185b" }}
                        >
                          ₹{bill.due.toFixed(2)}
                        </span>
                      </td>
                      <td className="text-center">
                        <Button 
                          size="sm" 
                          className="theme-btn-primary"
                          onClick={() => handleChangeClick(bill)}
                          disabled={isChanging}
                        >
                          {isChanging ? "Changing..." : "Change"}
                        </Button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      </div>
    </>
  );
};

export default ChangeCreditBillToCompany;
