import React, { useMemo, useState } from "react";
import { Container, Card, Form, Button, Table, Modal, Badge } from "react-bootstrap";
import { useNavigate, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import { RootState } from "../../../state/store";
import { showErrorToast } from "../../../utils/alertUtil";
import { faCopy } from "@fortawesome/free-solid-svg-icons";
import PageHeader from "../../../components/PageHeader";
import { MedicalRecordsApiService } from "../../../api/medical-records/medical-records-api-service";
import { SystemAdminApiService } from "../../../api/system-admin/system-admin-api-service";
import { CashCounterApiService } from "../../../api/cash-counter/cash-counter-api-service";
import { routerPathNames } from "../../../routes/routerPathNames";
import DuplicateBillView from "./DuplicateBillView";

interface OpVisit {
  opVisitId: number;
  patId: number;
  doctorId: number;
  doctorName: string;
  datetime: string;
}

interface PatientDetails {
  patId: number;
  displayNumber: string;
  name: string;
  sex: string;
  age: string;
}

interface Bill {
  id: number;
  billDisplay: string;
  dateTime: string;
  userName: string;
  isItReceipt: number;
  billType: number;
  ipId: number;
  total: number;
  totDisc: number;
  paid: number;
  balance: number;
  displayNumber: string;
  name: string;
  secondName?: string;
  accountHeadName?: string;
  billId: number;
}

// CashItem, PharmacyItem, LabItem, IPBillItem re-exported from BillPrintContent

const BILL_TYPE_GROUPS = [
  { label: "Registration",         types: [1],  color: "#7c3aed", icon: "fa-id-card" },
  { label: "Lab",                  types: [2],  color: "#0891b2", icon: "fa-flask" },
  { label: "Pharmacy",             types: [3],  color: "#059669", icon: "fa-pills" },
  { label: "Investigation",        types: [4],  color: "#d97706", icon: "fa-stethoscope" },
  { label: "Advance Collection",   types: [5],  color: "#2563eb", icon: "fa-hand-holding-usd" },
  { label: "IP Bill",              types: [7],  color: "#dc2626", icon: "fa-hospital" },
  { label: "Lab Return",           types: [9],  color: "#0891b2", icon: "fa-undo" },
  { label: "Pharmacy Return",      types: [10], color: "#059669", icon: "fa-undo" },
  { label: "Advance Return",       types: [11], color: "#2563eb", icon: "fa-undo" },
  { label: "Due Collection",       types: [12], color: "#9333ea", icon: "fa-file-invoice-dollar" },
  { label: "Investigation Return", types: [13], color: "#d97706", icon: "fa-undo" },
];

const DuplicateBill: React.FC = () => {
  const loginData = useSelector((state: RootState) => state.loginData);
  const [opNo, setOpNo] = useState("");
  const [patientDetails, setPatientDetails] = useState<PatientDetails | null>(null);
  const [visits, setVisits] = useState<OpVisit[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchPerformed, setSearchPerformed] = useState(false);
  const [bills, setBills] = useState<Bill[]>([]);
  const [selectedVisit, setSelectedVisit] = useState<OpVisit | null>(null);
  const [showBillsModal, setShowBillsModal] = useState(false);
  const [loadingBills, setLoadingBills] = useState(false);
  const [showBillPopup, setShowBillPopup] = useState(false);
  const [billPopupId, setBillPopupId] = useState<number | null>(null);
  const [billViewOnly, setBillViewOnly] = useState(false);
  const [billNoMap, setBillNoMap] = useState<Record<number, string>>({});

  const navigate = useNavigate();
  const location = useLocation();
  const medicalRecordsApi = new MedicalRecordsApiService();
  const systemAdminApi = new SystemAdminApiService();
  const cashCounterApi = new CashCounterApiService();

  const isLabRoute = useMemo(
    () => location.pathname.startsWith(routerPathNames.laboratory.base),
    [location.pathname]
  );

  const isPharmacyRoute = useMemo(
    () => location.pathname.startsWith(routerPathNames.pharmacyStores.base),
    [location.pathname]
  );

  const billingRoute = useMemo(() => {
    if (isPharmacyRoute) {
      return routerPathNames.pharmacyStores.pharmacy.billing.order;
    }
    if (isLabRoute) {
      return routerPathNames.laboratory.billing.billing;
    }
    return routerPathNames.cashCounter.billing.opBilling;
  }, [isLabRoute, isPharmacyRoute]);
  
  const handleSearch = async (e?: React.FormEvent, opNoOverride?: string) => {
    if (e) e.preventDefault();
    const searchNo = opNoOverride ?? opNo;

    if (!searchNo.trim()) {
      showErrorToast("Please enter OP Number");
      return;
    }

    setLoading(true);
    setSearchPerformed(true);
    try {
      // Fetch patient details first
      const patientResponse = await systemAdminApi.fetchPatientDetails(searchNo.trim());
      if (patientResponse) {
        setPatientDetails({
          patId: patientResponse.patId,
          displayNumber: patientResponse.displayNumber,
          name: patientResponse.name,
          sex: patientResponse.sex,
          age: patientResponse.age
        });

        // Then fetch visits
        const visitsResponse = await medicalRecordsApi.fetchOpVisitsByOpNo(searchNo.trim());
        const data = Array.isArray(visitsResponse) ? visitsResponse : [];
        setVisits(data);

        if (data.length === 0) {
          showErrorToast("No visits found for this patient");
        }
      }
    } catch (error: any) {
      console.error("Error loading patient data:", error);
      showErrorToast(error?.response?.data?.error || "Failed to load patient data");
      setPatientDetails(null);
      setVisits([]);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    const state = location.state as { opNo?: string } | null;
    if (state?.opNo) {
      setOpNo(state.opNo);
      handleSearch(undefined, state.opNo);
    }
  }, []);

  const handleReset = () => {
    setOpNo("");
    setPatientDetails(null);
    setVisits([]);
    setSearchPerformed(false);
    setBills([]);
    setSelectedVisit(null);
    setShowBillsModal(false);
  };

  const handleViewBills = async (visit: OpVisit) => {
    setSelectedVisit(visit);
    setShowBillsModal(true);
    setLoadingBills(true);

    try {
      const response = await cashCounterApi.fetchPatientOPIPBills(visit.opVisitId);
      const data = Array.isArray(response) ? response : [];
      setBills(data);

      if (data.length === 0) {
        showErrorToast("No bills found for this visit");
      } else {
        // Fetch billNo for each bill in parallel
        const results = await Promise.allSettled(
          data.map((bill: Bill) => cashCounterApi.fetchPatientDetailsByFinalBillId(bill.id))
        );
        const map: Record<number, string> = {};
        results.forEach((result, idx) => {
          if (result.status === "fulfilled" && result.value?.billNo) {
            map[data[idx].id] = result.value.billNo;
          }
        });
        setBillNoMap(map);
      }
    } catch (error: any) {
      console.error("Error loading bills:", error);
      showErrorToast(error?.response?.data?.error || "Failed to load bills");
      setBills([]);
    } finally {
      setLoadingBills(false);
    }
  };

  const handleCloseBillsModal = () => {
    setShowBillsModal(false);
    setSelectedVisit(null);
    setBills([]);
    setBillNoMap({});
  };

  const formatDateTime = (datetime: string) => {
    try {
      const date = new Date(datetime);
      return date.toLocaleString('en-IN', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true
      });
    } catch {
      return datetime;
    }
  };

  const getBillTypeBadge = (isItReceipt: number) => {
    if (isItReceipt === 1) {
      return <Badge bg="success">Receipt</Badge>;
    }
    return <Badge bg="danger">Return</Badge>;
  };

  const getPatientTypeBadge = (ipId: number) => {
    if (ipId !== 0) {
      return <Badge bg="success">In Patient</Badge>;
    }
    return <Badge bg="secondary">Out Patient</Badge>;
  };

  const handleViewBillOnly = (bill: Bill) => {
    setBillViewOnly(true);
    setBillPopupId(bill.id);
    setShowBillPopup(true);
  };

  const handlePrintBill = (bill: Bill) => {
    setBillViewOnly(false);
    setBillPopupId(bill.id);
    setShowBillPopup(true);
  };

  return (
    <>
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", minHeight: 0, overflow: "hidden" }}>
      <PageHeader
        icon={faCopy}
        title="Duplicate Bill"
        subtitle="Generate duplicate bill for patient visits"
      />

      <div className="content-body" style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "1.5rem" }}>
        <Container fluid>
          {/* ── Search Bar + Patient Info ── */}
          <Card className="shadow-sm mb-3" style={{ borderRadius: "10px", border: "1px solid #e2e8f0" }}>
            <Card.Body className="py-3 px-4">
              <div className="d-flex align-items-center gap-4 flex-wrap">
                {/* Search inputs */}
                <Form onSubmit={handleSearch} className="flex-shrink-0">
                  <div className="d-flex align-items-end gap-2">
                    <div>
                      <Form.Label className="text-muted mb-1" style={{ fontSize: "0.78rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                        OP Number
                      </Form.Label>
                      <div className="input-group" style={{ width: "220px" }}>
                        <span className="input-group-text bg-white" style={{ borderRight: "none", color: "#94a3b8" }}>
                          <i className="fas fa-search"></i>
                        </span>
                        <Form.Control
                          type="text"
                          placeholder="e.g. 26-4"
                          value={opNo}
                          onChange={(e) => setOpNo(e.target.value)}
                          disabled={loading}
                          autoFocus
                          style={{ borderLeft: "none" }}
                        />
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      type="submit"
                      disabled={loading || !opNo.trim()}
                      style={{ padding: "7px 18px" }}
                    >
                      {loading ? (
                        <><span className="spinner-border spinner-border-sm me-2"></span>Searching...</>
                      ) : (
                        <><i className="fas fa-search me-1"></i>Search</>
                      )}
                    </Button>
                    {searchPerformed && (
                      <Button variant="outline-secondary" onClick={handleReset} disabled={loading} style={{ padding: "7px 14px" }}>
                        <i className="fas fa-times"></i>
                      </Button>
                    )}
                    <Button
                      variant="outline-primary"
                      onClick={() => navigate(billingRoute)}
                      style={{ padding: "7px 14px", whiteSpace: "nowrap", background: "var(--page-secondary-color)", color: "white", border: "none" }}
                    >
                      <i className="fas fa-arrow-left me-1"></i>Go to Billing
                    </Button>
                  </div>
                </Form>

                {/* Patient info — shown inline to the right */}
                {searchPerformed && patientDetails && !loading && (
                  <div
                    className="d-flex align-items-center flex-wrap gap-3"
                    style={{ borderLeft: "2px solid #bfdbfe", paddingLeft: "1.25rem", flex: 1, minWidth: 0 }}
                  >
                    <span className="badge bg-primary" style={{ fontSize: "0.82rem", padding: "5px 10px", borderRadius: "6px" }}>
                      {patientDetails.displayNumber}
                    </span>
                    <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "#1e293b", whiteSpace: "nowrap" }}>
                      <i className="fas fa-user-circle me-2 text-primary opacity-75"></i>
                      {patientDetails.name}
                    </span>
                    <span className="text-muted" style={{ fontSize: "0.83rem", whiteSpace: "nowrap" }}>
                      <i className={`fas ${patientDetails.sex === "Male" ? "fa-mars text-primary" : "fa-venus text-danger"} me-1`}></i>
                      {patientDetails.sex}
                    </span>
                    <span className="text-muted" style={{ fontSize: "0.83rem", whiteSpace: "nowrap" }}>
                      <i className="fas fa-birthday-cake me-1 text-warning"></i>
                      {patientDetails.age}
                    </span>
                  </div>
                )}
              </div>
            </Card.Body>
          </Card>

          {/* Visit Table */}
          {searchPerformed && (
            <Card className="shadow-sm" style={{ borderRadius: "10px", border: "1px solid #e2e8f0" }}>
              <Card.Header
                className="d-flex align-items-center justify-content-between py-2 px-3"
                style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", borderRadius: "10px 10px 0 0" }}
              >
                <div className="d-flex align-items-center gap-2">
                  <div style={{ width: "4px", height: "20px", background: "#2563eb", borderRadius: "2px" }}></div>
                  <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "#1e293b" }}>Visit History</span>
                  {visits.length > 0 && (
                    <span className="badge" style={{ fontSize: "0.75rem", padding: "3px 10px", borderRadius: "20px", background: "var(--page-secondary-color)", color: "var(--page-primary-color)" }}>
                      {visits.length} {visits.length === 1 ? "Visit" : "Visits"}
                    </span>
                  )}
                </div>
              </Card.Header>
              <Card.Body className="p-0">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
                    <div className="mt-2 text-muted small">Loading visit details...</div>
                  </div>
                ) : visits.length === 0 ? (
                  <div className="text-center py-4 text-muted">
                    <i className="fas fa-calendar-times opacity-25 mb-2" style={{ fontSize: "2rem", display: "block" }}></i>
                    <div className="small">No visits found for OP Number: <strong>{opNo}</strong></div>
                  </div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <Table className="mb-0" hover>
                      <thead style={{ background: "#f8fafc", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.5px", color: "#64748b" }}>
                        <tr>
                          <th className="ps-4 py-2 border-0" style={{ width: "8%" }}>#</th>
                          <th className="py-2 border-0">Visit Date & Time</th>
                          <th className="py-2 border-0">Doctor</th>
                          <th className="py-2 border-0 text-center" style={{ width: "15%" }}>Action</th>
                        </tr>
                      </thead>
                      <tbody style={{ fontSize: "0.875rem" }}>
                        {visits.map((visit, index) => (
                          <tr key={visit.opVisitId} style={{ borderBottom: "1px solid #f1f5f9" }}>
                            <td className="ps-4 py-2 align-middle text-muted">{index + 1}</td>
                            <td className="py-2 align-middle">
                              <i className="fas fa-calendar-alt me-2 text-info opacity-75"></i>
                              {formatDateTime(visit.datetime)}
                            </td>
                            <td className="py-2 align-middle">
                              <i className="fas fa-user-md me-2 text-primary opacity-75"></i>
                              {visit.doctorName}
                            </td>
                            <td className="py-2 align-middle text-center">
                              <Button
                                size="sm"
                                onClick={() => handleViewBills(visit)}
                                style={{ borderRadius: "20px", padding: "4px 16px", fontSize: "0.78rem", background: "var(--page-secondary-color)", color: "var(--page-primary-color)", border: "none" }}
                              >
                                <i className="fas fa-file-invoice me-1"></i>
                                View Bills
                              </Button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Card.Body>
            </Card>
          )}
        </Container>

        {/* Bills Modal */}
        <Modal show={showBillsModal} onHide={handleCloseBillsModal} size="xl" centered>
          <Modal.Header closeButton style={{ background: "var(--page-primary-color)", borderBottom: "2px solid var(--page-primary-color)" }}>
            <div>
              <Modal.Title style={{ fontSize: "var(--font-size-md)", fontWeight: "var(--font-weight-bold)", color: "var(--page-secondary-color)" }}>
                <i className="fas fa-file-invoice-dollar me-2"></i>
                Bills for Visits
              </Modal.Title>
              {selectedVisit && patientDetails && (
                <div className="d-flex align-items-center gap-2 mt-1 flex-wrap">
                  <span className="badge" style={{ fontSize: "var(--font-size-xs)", background: "var(--page-secondary-color)", color: "var(--page-primary-color)", fontWeight: "var(--font-weight-bold)" }}>{patientDetails.displayNumber}</span>
                  <small style={{ color: "var(--page-secondary-color)", fontWeight: "var(--font-weight-bold)" }}>{patientDetails.name}</small>
                  <small style={{ color: "var(--page-secondary-color)", fontWeight: "var(--font-weight-semibold)" }}>• Visit ID: {selectedVisit.opVisitId}</small>
                  <small style={{ color: "var(--page-secondary-color)", fontWeight: "var(--font-weight-semibold)" }}>• {formatDateTime(selectedVisit.datetime)}</small>
                </div>
              )}
            </div>
          </Modal.Header>
          <Modal.Body style={{ padding: 0 }}>
            {loadingBills ? (
              <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
                <div className="mt-2 small" style={{ color: "var(--color-text)", fontWeight: "var(--font-weight-semibold)" }}>Loading bills...</div>
              </div>
            ) : bills.length === 0 ? (
              <div className="text-center py-5" style={{ color: "var(--color-text)", fontWeight: "var(--font-weight-semibold)" }}>
                <i className="fas fa-file-invoice opacity-25 mb-3" style={{ fontSize: "2.5rem", display: "block" }}></i>
                <div>No bills found for this visit</div>
              </div>
            ) : (
              <div style={{ overflowX: "auto", maxHeight: "65vh", overflowY: "auto", padding: "12px 16px" }}>
                {BILL_TYPE_GROUPS.map(group => {
                  const groupBills = bills.filter(b => group.types.includes(b.billType));
                  if (groupBills.length === 0) return null;
                  return (
                    <div key={group.label} style={{ marginBottom: "16px" }}>
                      <div style={{ padding: "7px 14px", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-bold)", textTransform: "uppercase", letterSpacing: "1px", display: "flex", alignItems: "center", gap: "8px", borderRadius: "4px 4px 0 0", background: "var(--page-primary-color)", color: "var(--page-secondary-color)", border: "1px solid var(--page-primary-color)" }}>
                        <i className={`fas ${group.icon}`}></i>
                        {group.label}
                        <span style={{ marginLeft: "auto", background: "var(--page-secondary-color)", borderRadius: "12px", padding: "1px 10px", color: "var(--page-primary-color)", fontWeight: "var(--font-weight-bold)" }}>
                          {groupBills.length}
                        </span>
                      </div>
                      <Table className="mb-0" hover size="sm" style={{ border: "1px solid #d0d7de", borderTop: "none" }}>
                        <thead style={{ background: "#e8edf2", fontSize: "var(--font-size-xs)", textTransform: "uppercase", letterSpacing: "0.5px" }}>
                          <tr>
                            <th className="ps-3 py-2 border-0" style={{ color: "var(--color-text)", fontWeight: "var(--font-weight-bold)" }}>#</th>
                            <th className="py-2 border-0" style={{ color: "var(--color-text)", fontWeight: "var(--font-weight-bold)" }}>Bill No</th>
                            <th className="py-2 border-0" style={{ color: "var(--color-text)", fontWeight: "var(--font-weight-bold)" }}>Date</th>
                            <th className="py-2 border-0" style={{ color: "var(--color-text)", fontWeight: "var(--font-weight-bold)" }}>Type</th>
                            <th className="py-2 border-0" style={{ color: "var(--color-text)", fontWeight: "var(--font-weight-bold)" }}>User</th>
                            <th className="py-2 border-0 text-end" style={{ color: "var(--color-text)", fontWeight: "var(--font-weight-bold)" }}>Total</th>
                            <th className="py-2 border-0 text-end" style={{ color: "var(--color-text)", fontWeight: "var(--font-weight-bold)" }}>Disc</th>
                            <th className="py-2 border-0 text-end" style={{ color: "var(--color-text)", fontWeight: "var(--font-weight-bold)" }}>Paid</th>
                            <th className="py-2 border-0 text-end pe-3" style={{ color: "var(--color-text)", fontWeight: "var(--font-weight-bold)" }}>Balance</th>
                            <th className="py-2 border-0 text-center" style={{ color: "var(--color-text)", fontWeight: "var(--font-weight-bold)" }}>Action</th>
                          </tr>
                        </thead>
                        <tbody style={{ fontSize: "var(--font-size-sm)" }}>
                          {groupBills.map((bill, i) => (
                            <tr key={bill.id} onClick={() => handlePrintBill(bill)} className="bill-row" style={{ cursor: "pointer", borderBottom: "1px solid #e2e8f0", ...(bill.billId === 0 ? { "--bs-table-bg": "#fff0f0", "--bs-table-hover-bg": "#ffe0e0" } as React.CSSProperties : {}) }}>
                              <td className="ps-3 py-2 align-middle" style={{ color: "var(--color-text)", fontWeight: "var(--font-weight-semibold)" }}>{i + 1}</td>
                              <td className="py-2 align-middle" style={{ color: "var(--color-text)", fontWeight: "var(--font-weight-bold)" }}>{billNoMap[bill.id] || bill.billDisplay}</td>
                              <td className="py-2 align-middle" style={{ color: "var(--color-text)", fontWeight: "var(--font-weight-semibold)" }}>{bill.dateTime}</td>
                              <td className="py-2 align-middle">
                                <span className={`badge ${bill.ipId !== 0 ? "bg-primary" : "bg-secondary"}`} style={{ fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-bold)" }}>
                                  {bill.ipId !== 0 ? "IP" : "OP"}
                                </span>
                              </td>
                              <td className="py-2 align-middle" style={{ color: "var(--color-text)", fontWeight: "var(--font-weight-semibold)" }}>{bill.userName}</td>
                              <td className="py-2 align-middle text-end" style={{ color: "var(--color-text)", fontWeight: "var(--font-weight-bold)" }}>₹{bill.total.toFixed(2)}</td>
                              <td className="py-2 align-middle text-end" style={{ color: "var(--color-text)", fontWeight: "var(--font-weight-semibold)" }}>{bill.totDisc > 0 ? `₹${bill.totDisc.toFixed(2)}` : <span style={{ color: "var(--color-text)" }}>—</span>}</td>
                              <td className="py-2 align-middle text-end" style={{ color: "var(--color-text)", fontWeight: "var(--font-weight-bold)" }}>₹{bill.paid.toFixed(2)}</td>
                              <td className="py-2 align-middle text-end pe-3" style={{ color: "var(--color-text)", fontWeight: "var(--font-weight-bold)" }}>
                                {bill.balance > 0 ? `₹${bill.balance.toFixed(2)}` : `₹0.00`}
                              </td>
                              <td className="py-2 align-middle text-center">
                                <Button
                                  size="sm"
                                  onClick={(e) => { e.stopPropagation(); handleViewBillOnly(bill); }}
                                  style={{ borderRadius: "20px", padding: "3px 14px", fontSize: "var(--font-size-xs)", background: "var(--page-secondary-color)", color: "var(--page-primary-color)", border: "none", fontWeight: "var(--font-weight-bold)" }}
                                >
                                  <i className="fas fa-eye me-1"></i>View
                                </Button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  );
                })}
              </div>
            )}
          </Modal.Body>
          <Modal.Footer style={{ background: "#f8fafc", borderTop: "1px solid #e2e8f0" }}>
            <Button variant="outline-secondary" onClick={handleCloseBillsModal}>
              <i className="fas fa-times me-2"></i>Close
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>

      {showBillPopup && billPopupId != null && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1060,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowBillPopup(false); }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              boxShadow: "0 8px 40px rgba(0,0,0,0.25)",
              width: "min(700px, 96vw)",
              maxHeight: "92vh",
              overflowY: "auto",
              position: "relative",
            }}
          >
            <DuplicateBillView
              billIdProp={billPopupId ?? undefined}
              onClose={() => setShowBillPopup(false)}
              patientNameProp={patientDetails?.name || undefined}
              opNoProp={patientDetails?.displayNumber || undefined}
              viewOnly={billViewOnly}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default DuplicateBill;

