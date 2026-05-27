import React, { useRef, useState } from "react";
import { Container, Card, Form, Button, Row, Col, Table, Modal, Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPrint } from "@fortawesome/free-solid-svg-icons";
import { useReactToPrint } from "react-to-print";
import { useSelector } from "react-redux";
import { RootState } from "../../../state/store";
import { showValidationError, showErrorToast } from "../../../utils/alertUtil";
import { CashCounterApiService } from "../../../api/cash-counter/cash-counter-api-service";
import logo from "../../../assets/images/logo.png";
import "../../../medical-records/styles/reportStyles.css";

const cashCounterApi = new CashCounterApiService();

// ── Interfaces ──────────────────────────────────────────────────────────────────
interface ReceiptDetail {
  finalBillId: number;
  patientName: string;
  opNumber: string;
  billDisplay: string;
  paidAmount: number;
  discAmount: number;
}

interface RecBill {
  billId: number;
  billDisplay: string;
  total: number;
  regCharge: number;
  consulCharge: number;
  pay: number;
  paid: number;
  disc: number;
  balance: number;
}
interface LabTest { testName: string; units: number; rate: number; }
interface LabBill { billId: number; billDisplay: string; tests: LabTest[]; }
interface Medicine { prodsId: number; batchId: number; units: number; mrp: number; sp: number; total: number; discountAmt: number; taxType: number; medicineName: string; batchNo: string; }
interface PharmacyBill { billId: number; billDisplay: string; medicines: Medicine[]; }
interface Procedure { particularId: number; procedureName: string; rate: number; unit: number; }
interface CashBill { billId: number; billDisplay: string; procedures: Procedure[]; }
interface IpItem { particulars: string; amt: number; numberOfDays: number; sno: number; }
interface IpBill { billId: number; billDisplay: string; items: IpItem[]; }
interface FinalBillDetails {
  finalBillId: number;
  dateTime: string;
  total: number;
  pay: number;
  paid: number;
  totDisc: number;
  balance: number;
  userName: string;
  recBills: RecBill[];
  labBills: LabBill[];
  pharmacyBills: PharmacyBill[];
  cashBills: CashBill[];
  ipBills: IpBill[];
}

interface Receipt {
  receiptId: number;
  dateTime: string;
  billDisplay: string;
  totalAmount: number;
  discount: number;
  additionalAmount: number;
  finalAmount: number;
  isBank: number;
  userName: string;
  notes: string;
  details: ReceiptDetail[];
}

interface CompanyGroup {
  headId: number;
  headName: string;
  receipts: Receipt[];
}



// ── Helpers ─────────────────────────────────────────────────────────────────────
const formatDate = (dt: string) => {
  if (!dt) return "-";
  const d = new Date(dt);
  return `${String(d.getDate()).padStart(2, "0")}-${String(d.getMonth() + 1).padStart(2, "0")}-${d.getFullYear()}`;
};
const formatTime = (dt: string) => {
  if (!dt) return "-";
  const d = new Date(dt);
  let h = d.getHours(), m = d.getMinutes(), s = d.getSeconds();
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")} ${ampm}`;
};

// ── Component ───────────────────────────────────────────────────────────────────
const AccCompanyReceipt: React.FC = () => {
  const today = new Date().toISOString().split("T")[0];
  const organization = useSelector((state: RootState) => state.appReducer.organization);

  const [fromDate,  setFromDate]  = useState(today);
  const [toDate,    setToDate]    = useState(today);
  const [loading,   setLoading]   = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [data,      setData]      = useState<CompanyGroup[]>([]);

  // Modal state
  const [modalReceipt, setModalReceipt] = useState<Receipt | null>(null);
  const [modalHead,    setModalHead]    = useState("");
  const [showModal,    setShowModal]    = useState(false);

  const printRef = useRef<HTMLDivElement>(null);
  const handlePrint = useReactToPrint({ content: () => printRef.current });

  const detailPrintRef = useRef<HTMLDivElement>(null);
  const handleDetailPrint = useReactToPrint({ content: () => detailPrintRef.current });

  const [billDetails,        setBillDetails]        = useState<FinalBillDetails[]>([]);
  const [billDetailsLoading, setBillDetailsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromDate || !toDate) {
      showValidationError("Please select both From Date and To Date.");
      return;
    }
    setLoading(true);
    try {
      const result = await cashCounterApi.fetchCompanyPaidDetailsBetweenDates(fromDate, toDate);
      setData(result);
      setSubmitted(true);
    } catch (error: any) {
      showErrorToast(error?.response?.data?.message || "Failed to fetch data.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setFromDate(today);
    setToDate(today);
    setData([]);
    setSubmitted(false);
  };

  const openModal = (receipt: Receipt, headName: string) => {
    setModalReceipt(receipt);
    setModalHead(headName);
    setBillDetails([]);
    setShowModal(true);
  };

  const handleDetailPrintClick = async () => {
    if (!modalReceipt) return;
    const ids = (modalReceipt.details ?? []).map(d => d.finalBillId).filter(Boolean);
    if (ids.length === 0) return;
    setBillDetailsLoading(true);
    try {
      const result = await cashCounterApi.fetchAllBillDetailsByFinalBillId(ids);
      setBillDetails(result);
      setTimeout(() => handleDetailPrint(), 300);
    } catch {
      showErrorToast("Failed to fetch bill details.");
    } finally {
      setBillDetailsLoading(false);
    }
  };

  const fmt = (n: number) => (n ?? 0).toFixed(2);

  // ── Grand totals across all groups ──────────────────────────────────────────
  const allReceipts = data.flatMap(g => g.receipts);
  const grandTotal     = allReceipts.reduce((s, r) => s + (r.totalAmount ?? 0), 0);
  const grandDiscount  = allReceipts.reduce((s, r) => s + (r.discount    ?? 0), 0);
  const grandNet       = allReceipts.reduce((s, r) => s + (r.finalAmount  ?? 0), 0);
  const grandCash      = allReceipts.filter(r => !r.isBank).reduce((s, r) => s + (r.finalAmount ?? 0), 0);
  const grandCheque    = allReceipts.filter(r =>  r.isBank).reduce((s, r) => s + (r.finalAmount ?? 0), 0);

  const TH: React.CSSProperties = {
    background: "var(--page-primary-color)",
    color: "#fff",
    fontSize: "var(--font-size-sm)",
    whiteSpace: "nowrap",
    fontWeight: "var(--font-weight-semibold)",
  };

  return (
    <>
    <Container fluid className="p-3">

      {/* ── Filter Card ──────────────────────────────────────────────────────── */}
      <Card className="mb-3">
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="g-3 align-items-end">
              <Col xs={12} md={3}>
                <Form.Group>
                  <Form.Label className="fw-bold" style={{ fontSize: "var(--font-size-sm)" }}>From Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    style={{ fontSize: "var(--font-size-sm)" }}
                    required
                  />
                </Form.Group>
              </Col>
              <Col xs={12} md={3}>
                <Form.Group>
                  <Form.Label className="fw-bold" style={{ fontSize: "var(--font-size-sm)" }}>To Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    style={{ fontSize: "var(--font-size-sm)" }}
                    required
                  />
                </Form.Group>
              </Col>
              <Col xs={12} md="auto" className="d-flex gap-2">
                <Button
                  type="submit"
                  disabled={loading}
                  style={{ backgroundColor: "var(--page-secondary-color)", color: "var(--page-primary-color)", border: "none", fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-semibold)" }}
                >
                  {loading ? <Spinner animation="border" size="sm" /> : "Show"}
                </Button>
                <Button type="button" variant="outline-secondary" onClick={handleReset} style={{ fontSize: "var(--font-size-sm)" }}>
                  Reset
                </Button>
                {submitted && data.length > 0 && (
                  <Button type="button" variant="outline-secondary" onClick={handlePrint} style={{ fontSize: "var(--font-size-sm)" }}>
                    <FontAwesomeIcon icon={faPrint} className="me-1" />Print
                  </Button>
                )}
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {/* ── Results ──────────────────────────────────────────────────────────── */}
      {submitted && (
        <div ref={printRef}>
          {data.length === 0 ? (
            <Card>
              <Card.Body className="text-center py-5 text-muted" style={{ fontSize: "var(--font-size-sm)" }}>
                No records found for the selected date range.
              </Card.Body>
            </Card>
          ) : (
            <>
              {/* ── Title ── */}
              <div className="fw-bold mb-3" style={{ fontSize: "var(--font-size-lg)" }}>ACCOUNT-WISE RECEIPT DETAILS</div>

              {/* ── Per-company group ── */}
              {data.filter(group => (group.receipts?.length ?? 0) > 0).map((group) => {
                const groupTotal    = group.receipts.reduce((s, r) => s + (r.totalAmount ?? 0), 0);
                const groupDiscount = group.receipts.reduce((s, r) => s + (r.discount    ?? 0), 0);
                const groupNet      = group.receipts.reduce((s, r) => s + (r.finalAmount  ?? 0), 0);
                return (
                  <div key={group.headId} className="mb-4">
                    <div
                      className="fw-bold mb-2"
                      style={{ fontSize: "var(--font-size-md)", color: "var(--page-secondary-color)", cursor: "pointer", textDecoration: "underline" }}
                    >
                      {group.headName}
                    </div>
                    <div className="table-responsive">
                      <Table bordered size="sm" className="mb-0" style={{ fontSize: "var(--font-size-sm)" }}>
                        <thead>
                          <tr>
                            <th style={{ ...TH, width: 55 }}>S. No</th>
                            <th style={TH}>Date</th>
                            <th style={TH}>Time</th>
                            <th style={TH}>Receipt Number</th>
                            <th style={{ ...TH, textAlign: "right" }}>Total</th>
                            <th style={{ ...TH, textAlign: "right" }}>Discount</th>
                            <th style={{ ...TH, textAlign: "right" }}>Net Amount</th>
                            <th style={TH}>Cheque / Cash</th>
                            <th style={TH}>User</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.receipts.map((r, idx) => (
                            <tr key={r.receiptId}>
                              <td className="text-center">{idx + 1}</td>
                              <td>{formatDate(r.dateTime)}</td>
                              <td>{formatTime(r.dateTime)}</td>
                              <td>
                                <Button
                                  variant="link"
                                  className="p-0"
                                  style={{ fontSize: "var(--font-size-sm)", color: "var(--page-secondary-color)" }}
                                  onClick={() => openModal(r, group.headName)}
                                >
                                  {r.billDisplay}
                                </Button>
                              </td>
                              <td className="text-end">{fmt(r.totalAmount)}</td>
                              <td className="text-end">{fmt(r.discount)}</td>
                              <td className="text-end">{fmt(r.finalAmount)}</td>
                              <td>{r.isBank ? "Cheque" : "Cash"}</td>
                              <td>{r.userName}</td>
                            </tr>
                          ))}
                          <tr style={{ background: "#fff3cd", fontWeight: "var(--font-weight-bold)" }}>
                            <td colSpan={4} className="text-end">Total :</td>
                            <td className="text-end" style={{ color: "#dc3545" }}>{fmt(groupTotal)}</td>
                            <td className="text-end" style={{ color: "#dc3545" }}>{fmt(groupDiscount)}</td>
                            <td className="text-end" style={{ color: "#dc3545" }}>{fmt(groupNet)}</td>
                            <td colSpan={2} />
                          </tr>
                        </tbody>
                      </Table>
                    </div>
                  </div>
                );
              })}

              {/* ── Grand Summary ── */}
              <Card className="mb-4">
                <Card.Body>
                  <div className="d-flex justify-content-end">
                    <Table size="sm" borderless className="mb-0" style={{ width: "auto", fontSize: "var(--font-size-sm)" }}>
                      <tbody>
                        <tr>
                          <td className="fw-bold pe-5" style={{ borderBottom: "1px solid #dee2e6" }}>Grand Total</td>
                          <td className="text-end fw-bold" style={{ borderBottom: "1px solid #dee2e6" }}>{fmt(grandTotal)}</td>
                          <td className="text-end fw-bold" style={{ borderBottom: "1px solid #dee2e6" }}>{fmt(grandDiscount)}</td>
                          <td className="text-end fw-bold" style={{ borderBottom: "1px solid #dee2e6" }}>{fmt(grandNet)}</td>
                        </tr>
                        <tr><td colSpan={4} style={{ paddingTop: 8 }} /></tr>
                        <tr>
                          <td className="fw-semibold pe-5">Amount Received By Cash :</td>
                          <td colSpan={3} className="text-end">{fmt(grandCash)}</td>
                        </tr>
                        <tr>
                          <td className="fw-semibold pe-5">Amount Received By Cheque :</td>
                          <td colSpan={3} className="text-end">{fmt(grandCheque)}</td>
                        </tr>
                        <tr>
                          <td colSpan={4}><hr className="my-1" /></td>
                        </tr>
                        <tr>
                          <td className="fw-bold pe-5">Final Amount Received :</td>
                          <td colSpan={3} className="text-end fw-bold">{fmt(grandCash + grandCheque)}</td>
                        </tr>
                      </tbody>
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            </>
          )}
        </div>
      )}

      {/* ── Receipt Detail Modal ──────────────────────────────────────────────── */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton style={{ background: "var(--page-primary-color)" }}>
          <Modal.Title style={{ color: "var(--page-secondary-color)", fontSize: "var(--font-size-md)", fontWeight: "var(--font-weight-bold)" }}>
            Receipt Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {modalReceipt && (
            <>
              <Row className="mb-3" style={{ fontSize: "var(--font-size-sm)" }}>
                <Col md={6}><strong>Account :</strong> {modalHead}</Col>
                <Col md={6}><strong>Receipt No :</strong> {modalReceipt.billDisplay}</Col>
              </Row>
              <Table bordered hover size="sm" responsive style={{ fontSize: "var(--font-size-sm)" }}>
                <thead>
                  <tr>
                    <th style={TH}>S.No</th>
                    <th style={TH}>OP Number</th>
                    <th style={TH}>Patient Name</th>
                    <th style={TH}>Bill Number</th>
                    <th style={{ ...TH, textAlign: "right" }}>Paid Amount</th>
                    <th style={{ ...TH, textAlign: "right" }}>Discount</th>
                  </tr>
                </thead>
                <tbody>
                  {(modalReceipt.details ?? []).length === 0 ? (
                    <tr><td colSpan={6} className="text-center text-muted py-3">No details available.</td></tr>
                  ) : (
                    modalReceipt.details.map((d, idx) => (
                      <tr key={idx}>
                        <td className="text-center">{idx + 1}</td>
                        <td>{d.opNumber}</td>
                        <td>{d.patientName}</td>
                        <td>{d.billDisplay}</td>
                        <td className="text-end">{fmt(d.paidAmount)}</td>
                        <td className="text-end">{fmt(d.discAmount)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
              <div className="d-flex justify-content-between align-items-end mt-2">
                {/* Bottom Left: Additional Amount & Notes */}
                <div style={{ fontSize: "var(--font-size-sm)" }}>
                  {(modalReceipt.additionalAmount ?? 0) !== 0 && (
                    <div><span className="fw-semibold">Old Application Amount : </span>{fmt(modalReceipt.additionalAmount)}</div>
                  )}
                  {modalReceipt.notes && (
                    <div><span className="fw-semibold">Notes : </span>{modalReceipt.notes}</div>
                  )}
                </div>
                {/* Bottom Right: Summary */}
                <Table size="sm" borderless style={{ width: "auto", fontSize: "var(--font-size-sm)" }}>
                  <tbody>
                    <tr>
                      <td className="fw-semibold pe-4">Total Amount :</td>
                      <td className="text-end">{fmt(modalReceipt.totalAmount)}</td>
                    </tr>
                    <tr>
                      <td className="fw-semibold pe-4">Discount :</td>
                      <td className="text-end">{fmt(modalReceipt.discount)}</td>
                    </tr>
                    <tr>
                      <td colSpan={2}><hr className="my-1" /></td>
                    </tr>
                    <tr>
                      <td className="fw-bold pe-4">Net Amount :</td>
                      <td className="text-end fw-bold">{fmt(modalReceipt.finalAmount)}</td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer style={{ background: "#f8fafc" }}>
          <Button
            variant="outline-primary"
            onClick={handleDetailPrintClick}
            disabled={billDetailsLoading}
            style={{ fontSize: "var(--font-size-sm)", backgroundColor: "var(--page-secondary-color)", color: "var(--page-primary-color)", border: "none" }}
          >
            {billDetailsLoading ? <Spinner animation="border" size="sm" className="me-1" /> : <FontAwesomeIcon icon={faPrint} className="me-1" />}
            {billDetailsLoading ? "Loading..." : "Print"}
          </Button>
          <Button
            variant="outline-secondary"
            onClick={() => setShowModal(false)}
            style={{ fontSize: "var(--font-size-sm)", backgroundColor: "var(--page-secondary-color)", color: "var(--page-primary-color)", border: "none" }}
          >Close</Button>
        </Modal.Footer>
      </Modal>

    </Container>

      {/* ── Hidden printable bill details ──────────────────────────────────── */}
      <div style={{ display: "none" }}>
        <div ref={detailPrintRef} style={{ padding: 24, fontFamily: "Arial, sans-serif", color: "#000" }}>
          {modalReceipt && (() => {
            // Bills that have IP items: their cash-bill procedures go INTO the IP section
            const billsWithIp    = billDetails.filter(b => (b.ipBills ?? []).length > 0);
            const billsWithoutIp = billDetails.filter(b => (b.ipBills ?? []).length === 0);

            const allRecBills   = billDetails.flatMap(b => b.recBills      ?? []);
            const allTests      = billDetails.flatMap(b => b.labBills      ?? []).flatMap(lb => lb.tests     ?? []);
            const allMedicines  = billDetails.flatMap(b => b.pharmacyBills ?? []).flatMap(pb => pb.medicines ?? []);

            // Cash-only procedures: from bills that have NO ipBills
            const allProcedures = billsWithoutIp.flatMap(b => b.cashBills ?? []).flatMap(cb => cb.procedures ?? []);

            // IP rows: ip items + procedures from bills that ALSO have ipBills
            const allIpItems        = billsWithIp.flatMap(b => b.ipBills   ?? []).flatMap(ib => ib.items ?? []);
            const ipLinkedProcedures = billsWithIp.flatMap(b => b.cashBills ?? []).flatMap(cb => cb.procedures ?? []);

            const recTotal   = allRecBills.reduce((s, r) => s + (r.total   ?? 0), 0);
            const recPaid    = allRecBills.reduce((s, r) => s + (r.paid    ?? 0), 0);
            const recDisc    = allRecBills.reduce((s, r) => s + (r.disc    ?? 0), 0);
            const recBalance = allRecBills.reduce((s, r) => s + (r.balance ?? 0), 0);

            const labTotal   = allTests.reduce((s, t) => s + (t.rate * t.units), 0);
            const labPaid    = billDetails.filter(b => (b.labBills ?? []).length > 0 && (b.ipBills ?? []).length === 0)
                                           .reduce((s, b) => s + (b.pay ?? 0), 0);

            const pharmTotal = allMedicines.reduce((s, m) => s + (m.total       ?? 0), 0);
            const pharmDisc  = allMedicines.reduce((s, m) => s + (m.discountAmt ?? 0), 0);
            const pharmPaid  = billDetails.filter(b => (b.pharmacyBills ?? []).length > 0 && (b.ipBills ?? []).length === 0)
                                           .reduce((s, b) => s + (b.pay ?? 0), 0);

            const cashTotal  = allProcedures.reduce((s, p) => s + (p.rate * p.unit), 0);
            const cashPaid   = billsWithoutIp.filter(b => (b.cashBills ?? []).length > 0)
                                              .reduce((s, b) => s + (b.pay ?? 0), 0);

            const ipTotal    = allIpItems.reduce((s, it) => s + (it.amt ?? 0), 0)
                             + ipLinkedProcedures.reduce((s, p) => s + (p.rate * p.unit), 0);
            const ipPaid     = billsWithIp.reduce((s, b) => s + (b.pay ?? 0), 0);

            const grandTotal   = billDetails.reduce((s, b) => s + (b.total   ?? 0), 0);
            const grandPaid    = billDetails.reduce((s, b) => s + (b.pay     ?? 0), 0);
            const grandDisc    = billDetails.reduce((s, b) => s + (b.totDisc ?? 0), 0);
            const grandBalance = billDetails.reduce((s, b) => s + (b.balance ?? 0), 0);

            const TH: React.CSSProperties = { padding: "3px 8px", borderBottom: "1px solid #000", fontWeight: "bold", background: "transparent" };
            const TR: React.CSSProperties = { padding: "3px 8px", textAlign: "right" };
            const TL: React.CSSProperties = { padding: "3px 8px" };
            const FTR: React.CSSProperties = { ...TR, fontWeight: "bold", borderTop: "1px solid #000" };
            const FTL: React.CSSProperties = { ...TL, fontWeight: "bold", borderTop: "1px solid #000" };

            const SectionTitle = ({ children }: { children: React.ReactNode }) => (
              <div style={{ fontWeight: "bold", fontSize: "var(--font-size-sm)", marginBottom: 4 }}>{children}</div>
            );

            return (
              <>
                {/* Header */}
                <div style={{ borderBottom: "2px solid #000", paddingBottom: 10, marginBottom: 10 }}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <div style={{ width: 90, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "flex-start" }}>
                      <img src={logo} alt="logo" style={{ height: 85, width: 85, objectFit: "contain" }} />
                    </div>
                    <div style={{ flex: 1, textAlign: "center" }}>
                      <div style={{ fontWeight: "var(--font-weight-bold)", fontSize: "var(--font-size-4xl)", letterSpacing: 2, lineHeight: 1.3 }}>
                        {organization?.name || "NIGHTINGALE"}
                      </div>
                      {organization?.address && (
                        <div style={{ fontSize: "var(--font-size-lg)", marginTop: 4, fontWeight: "var(--font-weight-medium)" }}>{organization.address}</div>
                      )}
                      {!organization?.address && (
                        <div style={{ fontSize: "var(--font-size-lg)", marginTop: 4, fontWeight: "var(--font-weight-medium)" }}>BATLAGUNDU - 624202, DINDUGAL DIST, TAMILNADU</div>
                      )}
                      {organization?.phoneNo && (
                        <div style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--font-weight-medium)" }}>Phone: {organization.phoneNo}</div>
                      )}
                      {!organization?.phoneNo && (
                        <div style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--font-weight-medium)" }}>Phone: 04543-262670 ,262041</div>
                      )}
                      <div style={{ fontWeight: "var(--font-weight-bold)", fontSize: "var(--font-size-2xl)", textDecoration: "underline", marginTop: 8, letterSpacing: 1 }}>
                        RECEIPT BILL DETAILS
                      </div>
                    </div>
                    <div style={{ width: 90, flexShrink: 0 }} />
                  </div>
                </div>

                {/* Receipt Info */}
                <div style={{ fontSize: "var(--font-size-sm)", marginBottom: 8 }}>
                  <strong>Account:</strong> {modalHead} &nbsp;|&nbsp;
                  <strong>Receipt No:</strong> {modalReceipt!.billDisplay} &nbsp;|&nbsp;
                  <strong>Date:</strong> {formatDate(modalReceipt!.dateTime)}
                </div>

                {/* Patient Info */}
                {(modalReceipt!.details ?? []).length > 0 && (
                  <div style={{ fontSize: "var(--font-size-sm)", marginBottom: 8 }}>
                    <strong>Patient Name:</strong> {modalReceipt!.details[0].patientName} &nbsp;|&nbsp;
                    <strong>OP Number:</strong> {modalReceipt!.details[0].opNumber}
                  </div>
                )}
                <hr style={{ marginBottom: 12 }} />

                {/* Registration Bills */}
                {allRecBills.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <SectionTitle>Registration Bills</SectionTitle>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--font-size-xs)" }}>
                      <thead>
                        <tr>
                          <th style={TH}>Bill No</th>
                          <th style={{ ...TH, textAlign: "right" }}>Total</th>
                          <th style={{ ...TH, textAlign: "right" }}>Reg Charge</th>
                          <th style={{ ...TH, textAlign: "right" }}>Consult Charge</th>
                          <th style={{ ...TH, textAlign: "right" }}>Pay</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allRecBills.map(rb => (
                          <tr key={rb.billId}>
                            <td style={TL}>{rb.billDisplay}</td>
                            <td style={TR}>{fmt(rb.total)}</td>
                            <td style={TR}>{fmt(rb.regCharge)}</td>
                            <td style={TR}>{fmt(rb.consulCharge)}</td>
                            <td style={TR}>{fmt(rb.pay)}</td>
                          </tr>
                        ))}
                        <tr>
                          <td colSpan={4} style={{ ...FTL, textAlign: "right" }}>Total</td>
                          <td style={FTR}>{fmt(recPaid)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Lab Bills */}
                {allTests.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <SectionTitle>Lab Bills</SectionTitle>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--font-size-xs)" }}>
                      <thead>
                        <tr>
                          <th style={TH}>Test Name</th>
                          <th style={{ ...TH, textAlign: "right" }}>Units</th>
                          <th style={{ ...TH, textAlign: "right" }}>Rate</th>
                          <th style={{ ...TH, textAlign: "right" }}>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allTests.map((t, ti) => (
                          <tr key={ti}>
                            <td style={TL}>{t.testName}</td>
                            <td style={TR}>{t.units}</td>
                            <td style={TR}>{fmt(t.rate)}</td>
                            <td style={TR}>{fmt(t.rate * t.units)}</td>
                          </tr>
                        ))}
                        <tr>
                          <td colSpan={3} style={{ ...FTL, textAlign: "right" }}>Total</td>
                          <td style={FTR}>{fmt(labPaid)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Pharmacy Bills */}
                {allMedicines.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <SectionTitle>Pharmacy Bills</SectionTitle>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--font-size-xs)" }}>
                      <thead>
                        <tr>
                          <th style={TH}>Medicine</th>
                          <th style={TH}>Batch No</th>
                          <th style={{ ...TH, textAlign: "right" }}>Units</th>
                          <th style={{ ...TH, textAlign: "right" }}>MRP</th>
                          <th style={{ ...TH, textAlign: "right" }}>SP</th>
                          <th style={{ ...TH, textAlign: "right" }}>Total</th>
                          <th style={{ ...TH, textAlign: "right" }}>Discount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allMedicines.map((m, mi) => (
                          <tr key={mi}>
                            <td style={TL}>{m.medicineName}</td>
                            <td style={TL}>{m.batchNo}</td>
                            <td style={TR}>{m.units}</td>
                            <td style={TR}>{fmt(m.mrp)}</td>
                            <td style={TR}>{fmt(m.sp)}</td>
                            <td style={TR}>{fmt(m.total)}</td>
                            <td style={TR}>{fmt(m.discountAmt)}</td>
                          </tr>
                        ))}
                        <tr>
                          <td colSpan={6} style={{ ...FTL, textAlign: "right" }}>Total</td>
                          <td style={FTR}>{fmt(pharmPaid)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Cash Bills */}
                {allProcedures.length > 0 && (
                  <div style={{ marginBottom: 16 }}>
                    <SectionTitle>Cash Bills</SectionTitle>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--font-size-xs)" }}>
                      <thead>
                        <tr>
                          <th style={TH}>Procedure</th>
                          <th style={{ ...TH, textAlign: "right" }}>Unit</th>
                          <th style={{ ...TH, textAlign: "right" }}>Rate</th>
                          <th style={{ ...TH, textAlign: "right" }}>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allProcedures.map((p, pi) => (
                          <tr key={pi}>
                            <td style={TL}>{p.procedureName}</td>
                            <td style={TR}>{p.unit}</td>
                            <td style={TR}>{fmt(p.rate)}</td>
                            <td style={TR}>{fmt(p.rate * p.unit)}</td>
                          </tr>
                        ))}
                        <tr>
                          <td colSpan={3} style={{ ...FTL, textAlign: "right" }}>Total</td>
                          <td style={FTR}>{fmt(cashPaid)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {/* IP Bills */}
                {(allIpItems.length > 0 || ipLinkedProcedures.length > 0) && (
                  <div style={{ marginBottom: 16 }}>
                    <SectionTitle>IP Bills</SectionTitle>
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "var(--font-size-xs)" }}>
                      <thead>
                        <tr>
                          <th style={{ ...TH, width: 40 }}>S.No</th>
                          <th style={TH}>Particulars</th>
                          <th style={{ ...TH, textAlign: "right" }}>Days / Unit</th>
                          <th style={{ ...TH, textAlign: "right" }}>Amount</th>
                        </tr>
                      </thead>
                      <tbody>
                        {allIpItems.map((it, ii) => (
                          <tr key={`ip-${ii}`}>
                            <td style={TL}>{it.sno}</td>
                            <td style={TL}>{it.particulars}</td>
                            <td style={TR}>{it.numberOfDays}</td>
                            <td style={TR}>{fmt(it.amt)}</td>
                          </tr>
                        ))}
                        {ipLinkedProcedures.map((p, pi) => (
                          <tr key={`proc-${pi}`}>
                            <td style={TL}>{allIpItems.length + pi + 1}</td>
                            <td style={TL}>{p.procedureName}</td>
                            <td style={TR}>{p.unit}</td>
                            <td style={TR}>{fmt(p.rate * p.unit)}</td>
                          </tr>
                        ))}
                        <tr>
                          <td colSpan={3} style={{ ...FTL, textAlign: "right" }}>Total</td>
                          <td style={FTR}>{fmt(ipPaid)}</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                )}

                {/* Overall Summary */}
                <hr style={{ margin: "12px 0" }} />
                <div style={{ display: "flex", justifyContent: "flex-end" }}>
                  <table style={{ borderCollapse: "collapse", fontSize: "var(--font-size-sm)", minWidth: 240 }}>
                    <tbody>
                      <tr>
                        <td style={TL}>Total Amount :</td>
                        <td style={TR}>{fmt(modalReceipt!.totalAmount)}</td>
                      </tr>
                      <tr>
                        <td style={TL}>Discount :</td>
                        <td style={TR}>{fmt(modalReceipt!.discount)}</td>
                      </tr>
                      <tr>
                        <td colSpan={2}><hr style={{ margin: "4px 0" }} /></td>
                      </tr>
                      <tr>
                        <td style={FTL}>Net Amount :</td>
                        <td style={FTR}>{fmt(modalReceipt!.finalAmount)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </>
            );
          })()}
        </div>
      </div>
    </>
  );
};

export default AccCompanyReceipt;
