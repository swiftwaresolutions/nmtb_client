import React, { useRef, useState } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  Row,
  Col,
  Table,
  Spinner,
  Modal,
} from "react-bootstrap";
import { useReactToPrint } from "react-to-print";
import { useSelector } from "react-redux";
import { RootState } from "../../../state/store";
import { showValidationError, showErrorToast } from "../../../utils/alertUtil";
import { MedicalRecordsApiService } from "../../../api/medical-records/medical-records-api-service";
import { CashCounterApiService } from "../../../api/cash-counter/cash-counter-api-service";
import logo from "../../../assets/images/logo.png";

const medicalRecordsApi = new MedicalRecordsApiService();
const cashCounterApi = new CashCounterApiService();

// ─── Types ─────────────────────────────────────────────────────────────────────
interface PhRow {
  billNo: string;
  billDate: string;
  medName: string;
  qty: number;
  total: number;
  discount: number;
  sellingPrice: number;
  tax: number;
  taxAmt: number;
  sortOrder: number;
}

interface InvRow {
  dateTime: string;
  billDisplay: string;
  name: string;
  rate: number;
}

interface PatientInfo {
  visitId: number;
  opNo: string;
  ipNo: string;
  patientName: string;
  admitDateTime: string;
  departmentName: string;
}

// ─── Print Header ──────────────────────────────────────────────────────────────
const SheetHeader: React.FC<{
  org: { name: string; address: string; phoneNo: string; description: string };
  title: string;
}> = ({ org, title }) => (
  <div style={{ borderBottom: "2px solid #000", paddingBottom: 10, marginBottom: 10 }}>
    <div style={{ display: "flex", alignItems: "center" }}>
      {/* Left: Logo */}
      <div style={{ width: 90, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "flex-start" }}>
        <img src={logo} alt="logo" style={{ height: 85, width: 85, objectFit: "contain" }} />
      </div>

      {/* Center: Hospital Info */}
      <div style={{ flex: 1, textAlign: "center" }}>
        <div style={{ fontWeight: "var(--font-weight-bold)", fontSize: "var(--font-size-4xl)", letterSpacing: 2, lineHeight: 1.3 }}>
          {org.name || "NIGHTINGALE"}
        </div>
        {org.address && (
          <div style={{ fontSize: "var(--font-size-lg)", marginTop: 4, fontWeight: "var(--font-weight-medium)" }}>{org.address}</div>
        )}
        {org.phoneNo && (
          <div style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--font-weight-medium)" }}>Phone: {org.phoneNo}</div>
        )}
        {org.description && (
          <div style={{ fontSize: "var(--font-size-md)", marginTop: 2 }}>{org.description}</div>
        )}
        <div style={{
          fontWeight: "var(--font-weight-bold)",
          fontSize: "var(--font-size-2xl)",
          textDecoration: "underline",
          marginTop: 8,
          letterSpacing: 1,
        }}>
          {title}
        </div>
      </div>

      {/* Right: Spacer (same width as logo) */}
      <div style={{ width: 90, flexShrink: 0 }} />
    </div>
  </div>
);

// ─── Patient Info Block ────────────────────────────────────────────────────────
const PatientInfoBlock: React.FC<{ patient: PatientInfo }> = ({ patient }) => (
  <table style={{ width: "100%", fontSize: "0.83rem", marginBottom: 6, borderCollapse: "collapse" }}>
    <tbody>
      <tr>
        <td style={{ width: "15%", fontWeight: "bold" }}>WARD</td>
        <td style={{ width: "2%" }}>:</td>
        <td style={{ width: "33%" }}>{patient.departmentName || "-"}</td>
        <td style={{ width: "12%", fontWeight: "bold" }}>OPNO</td>
        <td style={{ width: "2%" }}>:</td>
        <td>{patient.opNo}</td>
      </tr>
      <tr>
        <td style={{ fontWeight: "bold" }}>PATIENT NAME</td>
        <td>:</td>
        <td style={{ fontWeight: "bold" }}>{patient.patientName}</td>
        <td style={{ fontWeight: "bold" }}>IPNO</td>
        <td>:</td>
        <td>{patient.ipNo || "-"}</td>
      </tr>
    </tbody>
  </table>
);

// ─── Pharmacy Print Content ────────────────────────────────────────────────────
const PharmacyPrintContent = React.forwardRef<
  HTMLDivElement,
  { patient: PatientInfo; rows: PhRow[]; withDiscount: boolean; org: any }
>(({ patient, rows, withDiscount, org }, ref) => {
  // Group by billNo preserving order
  const groups: { billNo: string; billDate: string; items: PhRow[] }[] = [];
  rows.forEach((row) => {
    const last = groups[groups.length - 1];
    if (last && last.billNo === row.billNo) {
      last.items.push(row);
    } else {
      groups.push({ billNo: row.billNo, billDate: row.billDate, items: [row] });
    }
  });

  const TH: React.CSSProperties = {
    background: "#b0c4de",
    border: "1px solid #555",
    padding: "4px 6px",
    fontWeight: "bold",
    fontSize: "0.78rem",
    textAlign: "center",
  };
  const TD: React.CSSProperties = {
    border: "1px solid #555",
    padding: "3px 6px",
    fontSize: "0.78rem",
  };

  return (
    <div ref={ref} style={{ fontFamily: "Arial, sans-serif", padding: 16, background: "#fff" }}>
      <SheetHeader org={org} title="PHARMACY SHEET" />
      <PatientInfoBlock patient={patient} />
      <Table bordered style={{ fontSize: "0.78rem", borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th style={{ ...TH, width: 40 }}>Sl.No</th>
            <th style={TH}>Date</th>
            <th style={TH}>Bill No</th>
            <th style={{ ...TH, width: "30%" }}>Drug</th>
            <th style={TH}>Qty</th>
            {withDiscount ? (
              <>
                <th style={TH}>Total (Rs)</th>
                <th style={TH}>Discount (Rs)</th>
                <th style={TH}>Selling Price (Rs)</th>
                <th style={TH}>Tax %</th>
                <th style={TH}>Tax (Rs)</th>
              </>
            ) : (
              <th style={TH}>Cost(Rs)</th>
            )}
            <th style={TH}>Dispensed</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group, gi) => {
            const displaySubTotal = group.items.reduce((s, i) => s + (withDiscount ? i.sellingPrice * i.qty : i.total), 0);
            return (
              <React.Fragment key={gi}>
                {group.items.map((item, ii) => (
                  <tr key={ii} style={{ background: gi % 2 === 0 ? "#f0f7ff" : "#fff" }}>
                    {ii === 0 ? (
                      <>
                        <td style={{ ...TD, textAlign: "center", verticalAlign: "middle" }} rowSpan={group.items.length + 1}>
                          {gi + 1}
                        </td>
                        <td style={{ ...TD, verticalAlign: "middle" }} rowSpan={group.items.length}>
                          {group.billDate ? group.billDate.split("T")[0].split("-").reverse().join("-") : "-"}
                        </td>
                        <td style={{ ...TD, verticalAlign: "middle" }} rowSpan={group.items.length}>
                          {group.billNo}
                        </td>
                      </>
                    ) : null}
                    <td style={TD}>{item.medName}</td>
                    <td style={{ ...TD, textAlign: "center" }}>{item.qty}</td>
                    {withDiscount ? (
                      <>
                        <td style={{ ...TD, textAlign: "right" }}>{item.total.toFixed(2)}</td>
                        <td style={{ ...TD, textAlign: "right" }}>{item.discount.toFixed(2)}</td>
                        <td style={{ ...TD, textAlign: "right" }}>{item.sellingPrice.toFixed(2)}</td>
                        <td style={{ ...TD, textAlign: "right" }}>{item.tax.toFixed(2)}</td>
                        <td style={{ ...TD, textAlign: "right" }}>{item.taxAmt.toFixed(4)}</td>
                      </>
                    ) : (
                      <td style={{ ...TD, textAlign: "right" }}>{item.total.toFixed(2)}</td>
                    )}
                    <td style={{ ...TD, textAlign: "center" }}>✓</td>
                  </tr>
                ))}
                {/* Sub Total row */}
                <tr style={{ background: gi % 2 === 0 ? "#f0f7ff" : "#fff" }}>
                  {withDiscount ? (
                    <>
                      <td colSpan={4} style={{ ...TD, textAlign: "right", fontWeight: "bold" }}>Sub Total:</td>
                      <td style={{ ...TD, textAlign: "right", fontWeight: "bold" }}>{group.items.reduce((s, i) => s + i.total, 0).toFixed(2)}</td>
                      <td style={{ ...TD, textAlign: "right", fontWeight: "bold" }}>{group.items.reduce((s, i) => s + i.discount, 0).toFixed(2)}</td>
                      <td style={{ ...TD, textAlign: "right", fontWeight: "bold" }}>{displaySubTotal.toFixed(2)}</td>
                      <td colSpan={3} style={TD}></td>
                    </>
                  ) : (
                    <>
                      <td colSpan={4} style={{ ...TD, textAlign: "right", fontWeight: "bold" }}>Sub Total:</td>
                      <td style={{ ...TD, textAlign: "right", fontWeight: "bold" }}>{displaySubTotal.toFixed(2)}</td>
                      <td style={TD}></td>
                    </>
                  )}
                </tr>
              </React.Fragment>
            );
          })}
        </tbody>
      </Table>
    </div>
  );
});

// ─── Investigation Print Content ───────────────────────────────────────────────
const InvestigationPrintContent = React.forwardRef<
  HTMLDivElement,
  { patient: PatientInfo; rows: InvRow[]; org: any }
>(({ patient, rows, org }, ref) => {
  const TH: React.CSSProperties = {
    background: "#b0c4de",
    border: "1px solid #555",
    padding: "4px 6px",
    fontWeight: "bold",
    fontSize: "0.78rem",
    textAlign: "center",
  };
  const TD: React.CSSProperties = {
    border: "1px solid #555",
    padding: "3px 6px",
    fontSize: "0.78rem",
  };

  // Group by billDisplay
  const groups: { billDisplay: string; dateTime: string; items: InvRow[] }[] = [];
  rows.forEach((row) => {
    const last = groups[groups.length - 1];
    if (last && last.billDisplay === row.billDisplay) {
      last.items.push(row);
    } else {
      groups.push({ billDisplay: row.billDisplay, dateTime: row.dateTime, items: [row] });
    }
  });

  return (
    <div ref={ref} style={{ fontFamily: "Arial, sans-serif", padding: 16, background: "#fff" }}>
      <SheetHeader org={org} title="INVESTIGATION SHEET" />
      <PatientInfoBlock patient={patient} />
      <Table bordered style={{ fontSize: "0.78rem", borderCollapse: "collapse", width: "100%" }}>
        <thead>
          <tr>
            <th style={{ ...TH, width: 40 }}>Sl.No</th>
            <th style={TH}>Date</th>
            <th style={TH}>Bill No</th>
            <th style={{ ...TH, width: "40%" }}>Drug</th>
            <th style={{ ...TH }}>Cost(Rs)</th>
            <th style={TH}>Dispensed</th>
          </tr>
        </thead>
        <tbody>
          {groups.map((group, gi) => (
            <React.Fragment key={gi}>
              {group.items.map((item, ii) => (
                <tr key={ii} style={{ background: gi % 2 === 0 ? "#f0f7ff" : "#fff" }}>
                  {ii === 0 ? (
                    <>
                      <td style={{ ...TD, textAlign: "center", verticalAlign: "middle" }} rowSpan={group.items.length}>
                        {gi + 1}
                      </td>
                      <td style={{ ...TD, verticalAlign: "middle" }} rowSpan={group.items.length}>
                        {group.dateTime ? group.dateTime.split("T")[0].split("-").reverse().join("-") : "-"}
                      </td>
                      <td style={{ ...TD, verticalAlign: "middle" }} rowSpan={group.items.length}>
                        {group.billDisplay}
                      </td>
                    </>
                  ) : null}
                  <td style={TD}>{item.name}</td>
                  <td style={{ ...TD, textAlign: "right" }}>{item.rate.toFixed(2)}</td>
                  <td style={{ ...TD, textAlign: "center" }}>✓</td>
                </tr>
              ))}
            </React.Fragment>
          ))}
        </tbody>
      </Table>
    </div>
  );
});

// ─── Sheet Modal ───────────────────────────────────────────────────────────────
const SheetModal: React.FC<{
  show: boolean;
  onHide: () => void;
  title: string;
  loading: boolean;
  children: React.ReactNode;
  onPrint: () => void;
}> = ({ show, onHide, title, loading, children, onPrint }) => (
  <Modal show={show} onHide={onHide} size="xl" centered>
    <Modal.Header closeButton style={{ background: "var(--page-primary-color)" }}>
      <Modal.Title style={{ color: "var(--page-secondary-color)", fontSize: "var(--font-size-md)", fontWeight: "var(--font-weight-bold)" }}>
        {title}
      </Modal.Title>
    </Modal.Header>
    <Modal.Body style={{ padding: 0, maxHeight: "75vh", overflowY: "auto" }}>
      {loading ? (
        <div className="text-center py-5">
          <Spinner animation="border" variant="primary" />
          <div className="mt-2 small text-muted">Loading...</div>
        </div>
      ) : children}
    </Modal.Body>
    <Modal.Footer style={{ background: "#f8fafc", borderTop: "1px solid #e2e8f0" }}>
      <Button
        onClick={onPrint}
        disabled={loading}
        style={{ background: "var(--page-secondary-color)", color: "var(--page-primary-color)", border: "none", fontWeight: "var(--font-weight-semibold)" }}
      >
        <i className="fas fa-print me-1"></i>Print
      </Button>
      <Button variant="outline-secondary" onClick={onHide}>
        <i className="fas fa-times me-1"></i>Close
      </Button>
    </Modal.Footer>
  </Modal>
);

// ─── Main Component ────────────────────────────────────────────────────────────
export default function PharmacySheet() {
  const organization = useSelector((state: RootState) => state.appReducer.organization);

  const [opNo, setOpNo] = useState("");
  const [patients, setPatients] = useState<PatientInfo[]>([]);
  const [selectedPatient, setSelectedPatient] = useState<PatientInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);

  // Modal states
  const [showPh, setShowPh] = useState(false);
  const [showPhDisc, setShowPhDisc] = useState(false);
  const [showInv, setShowInv] = useState(false);
  const [phRows, setPhRows] = useState<PhRow[]>([]);
  const [invRows, setInvRows] = useState<InvRow[]>([]);
  const [loadingModal, setLoadingModal] = useState(false);

  // Print refs
  const phRef = useRef<HTMLDivElement>(null);
  const phDiscRef = useRef<HTMLDivElement>(null);
  const invRef = useRef<HTMLDivElement>(null);

  const printPh = useReactToPrint({ content: () => phRef.current });
  const printPhDisc = useReactToPrint({ content: () => phDiscRef.current });
  const printInv = useReactToPrint({ content: () => invRef.current });

  const handleSubmit = async () => {
    const trimmed = opNo.trim();
    if (!trimmed) {
      showValidationError("Please enter an OP Number.", "Validation");
      return;
    }
    setLoading(true);
    setSearched(false);
    setPatients([]);
    try {
      const res = await medicalRecordsApi.fetchPatientDetailsForIpVisit(trimmed);
      const ipVisits = res
        .filter((v) => v.ipNo && v.ipId)
        .map((v) => ({
          visitId: v.visitId,
          opNo: v.opNo,
          ipNo: v.ipNo,
          patientName: v.patientName,
          admitDateTime: v.admitDateTime,
          departmentName: v.departmentName,
        }));
      setPatients(ipVisits);
    } catch (error: any) {
      showErrorToast(error?.response?.data?.message || "Failed to fetch patient details.");
    } finally {
      setLoading(false);
      setSearched(true);
    }
  };

  const openPh = async (withDiscount: boolean, pat: PatientInfo) => {
    setSelectedPatient(pat);
    if (withDiscount) setShowPhDisc(true); else setShowPh(true);
    setLoadingModal(true);
    try {
      const data = await cashCounterApi.fetchReimburshmentPhDetails(pat.visitId);
      setPhRows((data ?? []).map((d: any) => ({
        ...d,
        qty: Number(d.qty ?? 0),
        total: Number(d.total ?? 0),
        discount: Number(d.discount ?? 0),
        sellingPrice: Number(d.sellingPrice ?? 0),
        tax: Number(d.tax ?? 0),
        taxAmt: Number(d.taxAmt ?? 0),
      })));
    } catch (error: any) {
      showErrorToast(error?.response?.data?.message || "Failed to fetch pharmacy details.");
    } finally {
      setLoadingModal(false);
    }
  };

  const openInv = async (pat: PatientInfo) => {
    setSelectedPatient(pat);
    setShowInv(true);
    setLoadingModal(true);
    try {
      const data = await cashCounterApi.fetchReimburshmentInvLabDetails(pat.visitId);
      setInvRows((data ?? []).map((d: any) => ({
        ...d,
        rate: Number(d.rate ?? 0),
      })));
    } catch (error: any) {
      showErrorToast(error?.response?.data?.message || "Failed to fetch investigation details.");
    } finally {
      setLoadingModal(false);
    }
  };

  const TH: React.CSSProperties = {
    background: "var(--page-primary-color)",
    color: "#fff",
    fontSize: "var(--font-size-sm)",
    whiteSpace: "nowrap",
    fontWeight: "var(--font-weight-semibold)",
  };

  return (
    <Container fluid className="p-3">
      {/* ─ Filter ─ */}
      <Card className="mb-3">
        <Card.Body>
          <Row className="align-items-end g-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-bold text-dark" style={{ fontSize: "var(--font-size-sm)" }}>
                  OP Number
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Enter OP Number"
                  value={opNo}
                  onChange={(e) => { setOpNo(e.target.value); setSearched(false); }}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  style={{ fontSize: "var(--font-size-sm)" }}
                />
              </Form.Group>
            </Col>
            <Col md="auto">
              <Button
                onClick={handleSubmit}
                disabled={loading}
                style={{
                  backgroundColor: "var(--page-secondary-color)",
                  color: "var(--page-primary-color)",
                  border: "none",
                  fontSize: "var(--font-size-sm)",
                  fontWeight: "var(--font-weight-semibold)",
                }}
              >
                {loading ? <Spinner animation="border" size="sm" /> : "Submit"}
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* ─ Results ─ */}
      {searched && (
        patients.length > 0 ? (
          <Card>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table bordered hover className="mb-0" style={{ fontSize: "var(--font-size-sm)" }}>
                  <thead>
                    <tr>
                      <th style={{ ...TH, width: 55 }}>Sl.No</th>
                      <th style={TH}>OP No</th>
                      <th style={TH}>IP No</th>
                      <th style={TH}>Admit Date</th>
                      <th style={{ ...TH, textAlign: "center" }} colSpan={3}>Sheet</th>
                      <th style={TH}>Patient Name</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patients.map((pat, idx) => (
                      <tr key={pat.visitId}>
                        <td className="text-center fw-bold text-dark">{idx + 1}</td>
                        <td className="fw-bold text-dark">{pat.opNo}</td>
                        <td className="fw-bold text-dark">{pat.ipNo || "-"}</td>
                        <td className="fw-bold text-dark">{pat.admitDateTime || "-"}</td>
                        <td className="text-center">
                          <Button
                            size="sm"
                            onClick={() => openPh(false, pat)}
                            style={{ backgroundColor: "var(--page-secondary-color)", color: "#fff", border: "none", fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-semibold)" }}
                          >
                            Pharmacy
                          </Button>
                        </td>
                        <td className="text-center">
                          <Button
                            size="sm"
                            onClick={() => openPh(true, pat)}
                            style={{ backgroundColor: "var(--page-secondary-color)", color: "#fff", border: "none", fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-semibold)" }}
                          >
                            Pharmacy with Discount
                          </Button>
                        </td>
                        <td className="text-center">
                          <Button
                            size="sm"
                            onClick={() => openInv(pat)}
                            style={{ backgroundColor: "var(--page-secondary-color)", color: "#fff", border: "none", fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-semibold)" }}
                          >
                            Investigation
                          </Button>
                        </td>
                        <td className="fw-bold text-dark">{pat.patientName}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        ) : (
          <Card>
            <Card.Body className="text-center py-5 fw-bold text-dark" style={{ fontSize: "var(--font-size-sm)" }}>
              No IP visit records found for OP Number <strong>{opNo}</strong>.
            </Card.Body>
          </Card>
        )
      )}

      {/* ─ Pharmacy Modal ─ */}
      <SheetModal
        show={showPh}
        onHide={() => { setShowPh(false); setPhRows([]); }}
        title="Pharmacy Sheet"
        loading={loadingModal}
        onPrint={printPh}
      >
        {selectedPatient && (
          <PharmacyPrintContent
            ref={phRef}
            patient={selectedPatient}
            rows={phRows}
            withDiscount={false}
            org={organization}
          />
        )}
      </SheetModal>

      {/* ─ Pharmacy with Discount Modal ─ */}
      <SheetModal
        show={showPhDisc}
        onHide={() => { setShowPhDisc(false); setPhRows([]); }}
        title="Pharmacy Sheet (with Discount)"
        loading={loadingModal}
        onPrint={printPhDisc}
      >
        {selectedPatient && (
          <PharmacyPrintContent
            ref={phDiscRef}
            patient={selectedPatient}
            rows={phRows}
            withDiscount={true}
            org={organization}
          />
        )}
      </SheetModal>

      {/* ─ Investigation Modal ─ */}
      <SheetModal
        show={showInv}
        onHide={() => { setShowInv(false); setInvRows([]); }}
        title="Investigation Sheet"
        loading={loadingModal}
        onPrint={printInv}
      >
        {selectedPatient && (
          <InvestigationPrintContent
            ref={invRef}
            patient={selectedPatient}
            rows={invRows}
            org={organization}
          />
        )}
      </SheetModal>
    </Container>
  );
}
