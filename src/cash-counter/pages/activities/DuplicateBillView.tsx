import React, { useState, useRef, useEffect } from "react";
import { Container, Card, Button, Spinner } from "react-bootstrap";
import { useParams, useNavigate } from "react-router-dom";
import { useReactToPrint } from "react-to-print";
import { showErrorToast } from "../../../utils/alertUtil";
import { faArrowLeft, faPrint, faCopy } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import BillPrintContent, { BillPrintData } from "../../../components/BillPrintContent";
import logo from "../../../assets/images/logo.png";
import nabh from "../../../assets/images/nabh.jpg";
import { NAVY, BORDER, thStyle, tdStyle, formatDateTime } from "../../../components/print/printTokens";
import { CashCounterApiService, BillPatientDetails } from "../../../api/cash-counter/cash-counter-api-service";
import PageHeader from "../../../components/PageHeader";

interface BillDetails extends BillPrintData {
  finalBillId: number;
  previousDue: number;
  finalDue: number;
  visitId: number;
  patientName: string;
  opNo: string;
}

interface DueCollectionDetail {
  dueCollectionId: number;
  finalBillId: number;
  billDisplay: string;
  dateTime: string;
  collectedAmount: number;
  cashPaid: number;
  bankPaid: number;
  discount: number;
  userName: string;
  bankPayments?: any[];
}

interface CashItemDetail {
  particularName: string;
  groupName: string;
  unit: number;
  unitRate: number;
  baseRate: number;
  totalRate: number;
  discount: number;
}

interface PharmacyItemDetail {
  prodsName: string;
  genericName: string;
  batchNo: string;
  expiryDate: string;
  mrp: number;
  units: number;
  total: number;
  gross: number;
  taxable: number;
  sgst: number;
  cgst: number;
  igst: number;
  gst: number;
  taxType: number;
  hsnCode: string;
  sgstPer: number;
  cgstPer: number;
  igstPer: number;
  discountAmount: number;
}

interface LabItemDetail {
  testName: string;
  units: number;
  rate: number;
  totalAmount: number;
}

interface DueBillGroupDetails {
  billId: number;
  billDisplay: string;
  amount: number;
}

interface CashBillGroup {
  itemDetails: CashItemDetail[];
  billDetails: DueBillGroupDetails;
  currentCollectionDetails: DueCollectionDetail | null;
  previousCollectionDetails: DueCollectionDetail[];
}

interface PharmacyBillGroup {
  itemDetails: PharmacyItemDetail[];
  billDetails: DueBillGroupDetails;
  currentCollectionDetails: DueCollectionDetail | null;
  previousCollectionDetails: DueCollectionDetail[];
}

interface LabBillGroup {
  itemDetails: LabItemDetail[];
  billDetails: DueBillGroupDetails;
  currentCollectionDetails: DueCollectionDetail | null;
  previousCollectionDetails: DueCollectionDetail[];
}

interface OriginalBillEntry {
  originalBill: {
    finalBillId: number;
    billDisplay: string;
    dateTime: string;
    total: number;
    paid: number;
    balance: number;
    userName: string;
    patientId: number;
    patientName: string;
    opNo: string;
  };
  cashItems: CashBillGroup[];
  pharmacyItems: PharmacyBillGroup[];
  labItems: LabBillGroup[];
  ipItems: CashBillGroup[];
}

interface DueHistoryData {
  originalBills: OriginalBillEntry[];
  totalDue: number;
  totalCollected: number;
  pendingAmount: number;
  paymentDetails: Array<{ accountType: string; amount: number }>;
}

const PRINT_PAGE_STYLE =
  "@page { size: 148mm 210mm portrait; margin: 5mm; } @media print { html { -webkit-print-color-adjust: exact; print-color-adjust: exact; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; width: 148mm; margin: 0; } }";

interface DuplicateBillViewProps {
  billIdProp?: string | number;
  onClose?: () => void;
  patientNameProp?: string;
  opNoProp?: string;
  viewOnly?: boolean;
}

const DuplicateBillView: React.FC<DuplicateBillViewProps> = ({ billIdProp, onClose, patientNameProp, opNoProp, viewOnly }) => {
  const params = useParams<{ billId: string }>();
  const billId = billIdProp != null ? String(billIdProp) : params.billId;
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [billDetails, setBillDetails] = useState<BillDetails | null>(null);
  const [dueHistoryData, setDueHistoryData] = useState<DueHistoryData | null>(null);
  const [isDueHistory, setIsDueHistory] = useState(false);
  const [selectedBillType, setSelectedBillType] = useState<number>(0);
  const [patientDetails, setPatientDetails] = useState<BillPatientDetails | null>(null);

  const cashCounterApi = new CashCounterApiService();
  const printRef = useRef<any>(null);

  const handlePrint = useReactToPrint({
    content: () => printRef.current,
    pageStyle: PRINT_PAGE_STYLE,
    onAfterPrint: () => { if (onClose) onClose(); },
  });

  useEffect(() => {
    if (!billId) return;

    const loadBill = async () => {
      setLoading(true);
      try {
        const response = await cashCounterApi.fetchBillViewWithType(Number(billId));
        const patDetails = await cashCounterApi.fetchPatientDetailsByFinalBillId(Number(billId));
        setPatientDetails(patDetails);
        if (response) {
          setIsDueHistory(response.isDueHistory === true);
          setSelectedBillType((response.data as any).billType ?? 0);
          if (response.isDueHistory) {
            setDueHistoryData(response.data as DueHistoryData);
            setBillDetails(null);
          } else {
            setDueHistoryData(null);
            const d = response.data as any;
            const rawName = patientNameProp || d.patientName || d.name || "";
            const secName = patientNameProp ? "" : (d.secName || d.secondName || "");
            setBillDetails({
              ...d,
              patientName: secName ? `${rawName} ${secName}`.trim() : rawName,
              opNo: opNoProp || d.opNo || d.displayNumber || "",
              category: d.category || "",
            } as BillDetails);
          }
        }
      } catch (error: any) {
        console.error("Error loading bill details:", error);
        showErrorToast(error?.response?.data?.error || "Failed to load bill details");
      } finally {
        setLoading(false);
      }
    };

    loadBill();
  }, [billId]);

  // Auto-print once data is loaded (skipped in viewOnly mode)
  useEffect(() => {
    if (viewOnly) return;
    if (!loading && (billDetails || dueHistoryData)) {
      const timer = setTimeout(() => {
        handlePrint();
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [loading, billDetails, dueHistoryData, viewOnly]);

  const titleLabel = (() => {
    if (isDueHistory) {
      const e0 = dueHistoryData?.originalBills?.[0];
      const col =
        e0?.cashItems?.[0]?.currentCollectionDetails ??
        e0?.pharmacyItems?.[0]?.currentCollectionDetails ??
        e0?.labItems?.[0]?.currentCollectionDetails ??
        null;
      return `Due Collection — ${col?.billDisplay ?? ""}`;
    }
    return `Bill Preview — ${billDetails?.billDisplay ?? ""}`;
  })();

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", minHeight: 0, overflow: "hidden" }}>
      <PageHeader icon={faCopy} title="Duplicate Bill" subtitle="Bill Preview" />

      <div className="content-body" style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "1.5rem" }}>
        <Container fluid>
          {/* Toolbar */}
          <div className="d-flex align-items-center gap-2 mb-3 no-print">
            <Button variant="outline-secondary" size="sm" onClick={() => onClose ? onClose() : navigate(-1)}>
              <FontAwesomeIcon icon={faArrowLeft} className="me-1" />
              {onClose ? "Close" : "Back"}
            </Button>
            <div style={{ flex: 1 }} />
            <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "#374151" }}>{titleLabel}</span>
            <div style={{ flex: 1 }} />
            <Button
              variant="primary"
              size="sm"
              disabled={loading || (!billDetails && !dueHistoryData)}
              onClick={() => handlePrint()}
            >
              <FontAwesomeIcon icon={faPrint} className="me-1" />
              Print Bill
            </Button>
          </div>

          {/* Bill Content */}
          <Card className="shadow-sm" style={{ borderRadius: "10px" }}>
            <Card.Body style={{ padding: "16px", background: "#fff" }}>
              {loading ? (
                <div className="text-center py-5">
                  <Spinner animation="border" variant="primary" />
                  <div className="mt-2 text-muted small">Loading bill details...</div>
                </div>
              ) : isDueHistory && dueHistoryData ? (
                <table
                  ref={printRef}
                  style={{
                    fontFamily: "'Segoe UI', Arial, sans-serif",
                    color: "#1e293b",
                    fontSize: "var(--font-size-sm)",
                    lineHeight: 1.3,
                    
                    width: "100%",
                    maxWidth: "600px",
                    margin: "0 auto",
                    background: "#fff",
                    borderCollapse: "collapse",
                  }}
                >
                  <thead>
                    <tr>
                      <td style={{ padding: 0 }}>
                  {(() => {
                    const e0 = dueHistoryData.originalBills?.[0];
                    const col =
                      e0?.cashItems?.[0]?.currentCollectionDetails ??
                      e0?.pharmacyItems?.[0]?.currentCollectionDetails ??
                      e0?.labItems?.[0]?.currentCollectionDetails ??
                      null;
                    const isPharmacyBill = (dueHistoryData.originalBills ?? []).some(
                      (b) => (b.pharmacyItems?.length ?? 0) > 0
                    );
                    const dateTime = col?.dateTime ?? "";
                    return (
                      <div style={{ fontFamily: "'Segoe UI', Arial, sans-serif", background: "#fff" }}>
                        {/* ── Letterhead ── */}
                        <div style={{ display: "flex", alignItems: "center", paddingBottom: "6px", borderBottom: "1px solid #000" }}>
                          <div style={{ flexShrink: 0, display: "flex", alignItems: "center", marginLeft: "10px" }}>
                            <img src={logo} alt="Logo" style={{ height: "75px", width: "auto", objectFit: "contain", display: "block" }} />
                          </div>
                          <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "5px", padding: "4px 0" }}>
                            <div style={{ fontSize: "var(--font-size-4xl)", fontWeight: "var(--font-weight-bold)", letterSpacing: "1.5px", textTransform: "uppercase", color: "#000", lineHeight: 1.15 }}>
                              NIGHTINGALE
                            </div>
                            <div style={{ fontSize: "var(--font-size-base)", color: "#000", lineHeight: 1.5 }}>
                              BATLAGUNDU - 624202, DINDUGAL DIST<br />TAMILNADU
                            </div>
                            <div style={{ fontSize: "var(--font-size-base)", color: "#000" }}>
                              ✆&nbsp;04543-262041
                            </div>
                            {isPharmacyBill && ( 
                              <div style={{ fontSize: "var(--font-size-base)", color: "#000" }}>
                                <span style={{ fontWeight: "var(--font-weight-semibold)" }}>D.L No MDU/1597/20 & 21&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;GST:&nbsp;</span>33AAATT3603J1ZP
                              </div>
                            )}
                          </div>
                          <div style={{ flexShrink: 0, display: "flex", alignItems: "center", marginRight: "10px" }}>
                            <img src={nabh} alt="NABH" style={{ height: "75px", width: "auto", objectFit: "contain", display: "block" }} />
                          </div>
                        </div>
                        {/* ── Bill type ── */}
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", margin: "4px 0 6px", padding: "3px 0" }}>
                          <span style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--font-weight-bold)", letterSpacing: "3px", textTransform: "uppercase", color: "#000" }}>
                            DUE COLLECTION
                          </span>
                        </div>
                        {/* ── Patient Info ── */}
                        {patientDetails && (() => {
                          const isIP = !!(patientDetails.ipNo);
                          const displayBillNo = patientDetails.billNo?.includes(",")
                            ? patientDetails.billNo.split(",").slice(1).join(",").trim()
                            : (patientDetails.billNo ?? "");
                          const rows: [string, string][] = [
                            ["Patient", patientDetails.patientName || "N/A"],
                            ["OP No", patientDetails.opNo || "N/A"],
                            ...(isIP ? [
                              ["IP No", patientDetails.ipNo],
                              ["Admit Date", formatDateTime(patientDetails.admitDateTime)],
                              ["Doctor", patientDetails.admitDoctor || ""],
                              ["Department", patientDetails.admitDepartment || ""],
                              ["Ward / Bed", `${patientDetails.wardName} / ${patientDetails.bedName}`],
                            ] as [string, string][] : [
                              ["Doctor", patientDetails.regDoctor || ""],
                              ["Department", patientDetails.regDepartment || ""],
                            ] as [string, string][]),
                            ["Bill No", displayBillNo],
                            ["Date", formatDateTime(dateTime)],
                            ...(patientDetails.accountHead ? [["Account", patientDetails.accountHead]] as [string, string][] : []),
                          ];
                          return (
                            <div style={{ borderTop: "1px solid #000", padding: "5px 10px", marginBottom: "8px" }}>
                              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: "10px" }}>
                                {rows.map(([label, value]) => (
                                  <div key={label} style={{ display: "flex", alignItems: "baseline", marginBottom: "3px" }}>
                                    <span style={{ fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-semibold)", color: "#000", textTransform: "uppercase", letterSpacing: "0.5px", flexShrink: 0, width: "70px" }}>{label}</span>
                                    <span style={{ fontSize: "var(--font-size-xs)", color: "#000", marginRight: "3px", flexShrink: 0 }}>:</span>
                                    <span style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-bold)", color: "#000", lineHeight: 1.2 }}>{value}</span>
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })()}
                      </div>
                    );
                  })()}
                      </td>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{ padding: 0 }}>

                  {(dueHistoryData.originalBills ?? []).map((entry, entryIdx) => (
                    <div key={entryIdx} style={{ marginBottom: "14px" }}>
                      <div
                        style={{
                          background: "#e0f2fe",
                          padding: "3px 8px",
                          fontSize: "0.7rem",
                          fontWeight: 700,
                          color: "#0369a1",
                          display: "flex",
                          justifyContent: "space-between",
                          border: BORDER,
                          borderBottom: "none",
                        }}
                      >
                        <span>
                          Bill Total: ₹{(entry.originalBill?.total ?? 0).toFixed(2)}&nbsp;&nbsp; Coll.: ₹
                          {(
                            [...(entry.cashItems ?? []), ...(entry.pharmacyItems ?? []), ...(entry.labItems ?? []), ...(entry.ipItems ?? [])] as any[]
                          )
                            .reduce((s: number, g: any) => s + (g.currentCollectionDetails?.collectedAmount ?? 0), 0)
                            .toFixed(2)}
                        </span>
                      </div>

                      {(entry.cashItems?.length ?? 0) > 0 && (
                        <div style={{ marginBottom: "6px" }}>
                          <div style={{ color: "#1e293b", padding: "2px 8px", fontSize: "var(--font-size-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", borderBottom: "1px solid #000" }}>
                            Investigation
                          </div>
                          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem", borderTop: "none", borderBottom: BORDER }}>
                            <thead>
                              <tr>
                                <th style={{ ...thStyle, width: "4%" }}>#</th>
                                <th style={thStyle}>Particular</th>
                                <th style={{ ...thStyle, textAlign: "center", width: "6%" }}>Qty</th>
                                <th style={{ ...thStyle, textAlign: "right", width: "10%" }}>Rate</th>
                                <th style={{ ...thStyle, textAlign: "right", width: "10%" }}>Disc.</th>
                                <th style={{ ...thStyle, textAlign: "right", width: "11%", borderRight: "none" }}>Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {entry.cashItems.flatMap((g) => g.itemDetails ?? []).map((item, idx) => (
                                <tr key={idx}>
                                  <td style={{ ...tdStyle }}>{idx + 1}</td>
                                  <td style={tdStyle}>{item.particularName}</td>
                                  <td style={{ ...tdStyle, textAlign: "center" }}>{item.unit}</td>
                                  <td style={{ ...tdStyle, textAlign: "right" }}>₹{(item.unitRate ?? 0).toFixed(2)}</td>
                                  <td style={{ ...tdStyle, textAlign: "right" }}>
                                    {(item.discount ?? 0) > 0 ? `₹${(item.discount ?? 0).toFixed(2)}` : "—"}
                                  </td>
                                  <td style={{ ...tdStyle, textAlign: "right", fontWeight: 600, borderRight: "none" }}>₹{(item.totalRate ?? 0).toFixed(2)}</td>
                                </tr>
                              ))}
                              <tr style={{ borderTop: "1px solid #cbd5e1" }}>
                                <td colSpan={4} style={{ ...tdStyle, borderRight: "none" }}></td>
                                <td style={{ ...tdStyle, fontWeight: 700, textAlign: "right" }}>Sub-total</td>
                                <td style={{ ...tdStyle, textAlign: "right", fontWeight: 700, borderRight: "none" }}>
                                  ₹{entry.cashItems.flatMap((g) => g.itemDetails ?? []).reduce((s, i) => s + (i.totalRate ?? 0), 0).toFixed(2)}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      )}

                      {(entry.pharmacyItems?.length ?? 0) > 0 && (
                        <div style={{ marginBottom: "6px" }}>
                          <div style={{ color: "#1e293b", padding: "2px 8px", fontSize: "var(--font-size-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", borderBottom: "1px solid #000" }}>
                            Pharmacy
                          </div>
                          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem", borderTop: "none", borderBottom: BORDER }}>
                            <thead>
                              <tr>
                                <th style={{ ...thStyle, width: "4%" }}>#</th>
                                <th style={thStyle}>Medicine</th>
                                <th style={{ ...thStyle, width: "9%" }}>HSN</th>
                                <th style={{ ...thStyle, width: "9%" }}>Batch</th>
                                <th style={{ ...thStyle, width: "7%" }}>Expiry</th>
                                <th style={{ ...thStyle, textAlign: "right", width: "8%" }}>MRP</th>
                                <th style={{ ...thStyle, textAlign: "right", width: "8%" }}>Rate</th>
                                <th style={{ ...thStyle, textAlign: "center", width: "5%" }}>Qty</th>
                                <th style={{ ...thStyle, textAlign: "right", width: "7%" }}>Disc.</th>
                                <th style={{ ...thStyle, textAlign: "right", width: "7%" }}>GST</th>
                                <th style={{ ...thStyle, textAlign: "right", width: "8%", borderRight: "none" }}>Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {entry.pharmacyItems.flatMap((g) => g.itemDetails ?? []).map((item, idx) => (
                                <tr key={idx}>
                                  <td style={{ ...tdStyle }}>{idx + 1}</td>
                                  <td style={tdStyle}>{item.prodsName}</td>
                                  <td style={{ ...tdStyle, fontSize: "var(--font-size-sm)" }}>{item.hsnCode || "—"}</td>
                                  <td style={{ ...tdStyle, fontSize: "var(--font-size-sm)" }}>{item.batchNo}</td>
                                  <td style={{ ...tdStyle, fontSize: "var(--font-size-sm)" }}>{item.expiryDate}</td>
                                  <td style={{ ...tdStyle, textAlign: "right" }}>₹{(item.mrp ?? 0).toFixed(2)}</td>
                                  <td style={{ ...tdStyle, textAlign: "right" }}>
                                    ₹{item.units ? ((item.mrp ?? 0) - (item.discountAmount ?? 0) / item.units).toFixed(2) : "0.00"}
                                  </td>
                                  <td style={{ ...tdStyle, textAlign: "center" }}>{item.units}</td>
                                  <td style={{ ...tdStyle, textAlign: "right" }}>
                                    {(item.discountAmount ?? 0) > 0 ? `₹${(item.discountAmount ?? 0).toFixed(2)}` : "—"}
                                  </td>
                                  <td style={{ ...tdStyle, textAlign: "right" }}>
                                    {(item.sgstPer ?? 0) + (item.cgstPer ?? 0) + (item.igstPer ?? 0) > 0
                                      ? `${(item.sgstPer ?? 0) + (item.cgstPer ?? 0) + (item.igstPer ?? 0)}%`
                                      : "—"}
                                  </td>
                                  <td style={{ ...tdStyle, textAlign: "right", fontWeight: 600, borderRight: "none" }}>
                                    ₹{((item.mrp ?? 0) * item.units - (item.discountAmount ?? 0)).toFixed(2)}
                                  </td>
                                </tr>
                              ))}
                              <tr style={{ borderTop: "1px solid #cbd5e1" }}>
                                <td colSpan={4} style={{ ...tdStyle, borderRight: "none" }}></td>
                                <td style={{ ...tdStyle, fontWeight: 700 }}>Total</td>
                                <td style={{ ...tdStyle, textAlign: "right", fontWeight: 600 }}>
                                  ₹{entry.pharmacyItems.flatMap((g) => g.itemDetails ?? []).reduce((s, i) => s + (i.mrp ?? 0), 0).toFixed(2)}
                                </td>
                                <td style={{ ...tdStyle, textAlign: "right", fontWeight: 600 }}>
                                  ₹{entry.pharmacyItems.flatMap((g) => g.itemDetails ?? []).reduce((s, i) => s + (i.units ? (i.mrp ?? 0) - (i.discountAmount ?? 0) / i.units : 0), 0).toFixed(2)}
                                </td>
                                <td style={{ ...tdStyle, textAlign: "center", fontWeight: 600 }}>
                                  {entry.pharmacyItems.flatMap((g) => g.itemDetails ?? []).reduce((s, i) => s + i.units, 0)}
                                </td>
                                <td style={{ ...tdStyle, textAlign: "right", fontWeight: 600 }}>
                                  {(() => {
                                    const d = entry.pharmacyItems.flatMap((g) => g.itemDetails ?? []).reduce((s, i) => s + (i.discountAmount ?? 0), 0);
                                    return d > 0 ? `₹${d.toFixed(2)}` : "—";
                                  })()}
                                </td>
                                <td style={tdStyle}></td>
                                <td style={{ ...tdStyle, textAlign: "right", fontWeight: 700, borderRight: "none" }}>
                                  ₹{entry.pharmacyItems.flatMap((g) => g.itemDetails ?? []).reduce((s, i) => s + ((i.mrp ?? 0) * i.units - (i.discountAmount ?? 0)), 0).toFixed(2)}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      )}

                      {(entry.labItems?.length ?? 0) > 0 && (
                        <div style={{ marginBottom: "6px" }}>
                          <div style={{ color: "#1e293b", padding: "2px 8px", fontSize: "var(--font-size-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", borderBottom: "1px solid #000" }}>
                            Laboratory
                          </div>
                          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem", borderTop: "none", borderBottom: BORDER }}>
                            <thead>
                              <tr>
                                <th style={{ ...thStyle, width: "4%" }}>#</th>
                                <th style={thStyle}>Test Name</th>
                                <th style={{ ...thStyle, textAlign: "center", width: "8%" }}>Units</th>
                                <th style={{ ...thStyle, textAlign: "right", width: "12%" }}>Rate</th>
                                <th style={{ ...thStyle, textAlign: "right", width: "12%", borderRight: "none" }}>Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {entry.labItems.flatMap((g) => g.itemDetails ?? []).map((item, idx) => (
                                <tr key={idx}>
                                  <td style={{ ...tdStyle }}>{idx + 1}</td>
                                  <td style={tdStyle}>{item.testName}</td>
                                  <td style={{ ...tdStyle, textAlign: "center" }}>{item.units}</td>
                                  <td style={{ ...tdStyle, textAlign: "right" }}>₹{(item.rate ?? 0).toFixed(2)}</td>
                                  <td style={{ ...tdStyle, textAlign: "right", fontWeight: 600, borderRight: "none" }}>₹{(item.totalAmount ?? 0).toFixed(2)}</td>
                                </tr>
                              ))}
                              <tr style={{ borderTop: "1px solid #cbd5e1" }}>
                                <td colSpan={3} style={{ ...tdStyle, borderRight: "none" }}></td>
                                <td style={{ ...tdStyle, fontWeight: 700, textAlign: "right" }}>Sub-total</td>
                                <td style={{ ...tdStyle, textAlign: "right", fontWeight: 700, borderRight: "none" }}>
                                  ₹{entry.labItems.flatMap((g) => g.itemDetails ?? []).reduce((s, i) => s + (i.totalAmount ?? 0), 0).toFixed(2)}
                                </td>
                              </tr>
                            </tbody>
                          </table>
                        </div>
                      )}

                      {(entry.ipItems?.length ?? 0) > 0 && (
                        <div style={{ marginBottom: "6px" }}>
                          <div style={{ color: "#1e293b", padding: "2px 8px", fontSize: "var(--font-size-xs)", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", borderBottom: "1px solid #000" }}>
                            IP Bill
                          </div>
                          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem", borderTop: "none", borderBottom: BORDER }}>
                            <thead>
                              <tr>
                                <th style={{ ...thStyle, width: "4%" }}>#</th>
                                <th style={thStyle}>Particular</th>
                                <th style={thStyle}>Group</th>
                                <th style={{ ...thStyle, textAlign: "center", width: "6%" }}>Qty</th>
                                <th style={{ ...thStyle, textAlign: "right", width: "10%" }}>Rate</th>
                                <th style={{ ...thStyle, textAlign: "right", width: "10%" }}>Disc.</th>
                                <th style={{ ...thStyle, textAlign: "right", width: "11%", borderRight: "none" }}>Total</th>
                              </tr>
                            </thead>
                            <tbody>
                              {entry.ipItems.flatMap((g) => g.itemDetails ?? []).map((item, idx) => (
                                <tr key={idx}>
                                  <td style={{ ...tdStyle }}>{idx + 1}</td>
                                  <td style={tdStyle}>{item.particularName}</td>
                                  <td style={{ ...tdStyle, color: "#64748b" }}>{item.groupName}</td>
                                  <td style={{ ...tdStyle, textAlign: "center" }}>{item.unit}</td>
                                  <td style={{ ...tdStyle, textAlign: "right" }}>₹{(item.unitRate ?? 0).toFixed(2)}</td>
                                  <td style={{ ...tdStyle, textAlign: "right", color: (item.discount ?? 0) > 0 ? "#dc2626" : "#94a3b8" }}>
                                    {(item.discount ?? 0) > 0 ? `₹${(item.discount ?? 0).toFixed(2)}` : "—"}
                                  </td>
                                  <td style={{ ...tdStyle, textAlign: "right", fontWeight: 600, borderRight: "none" }}>₹{(item.totalRate ?? 0).toFixed(2)}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      )}
                    </div>
                  ))}

                  {/* Payment Summary */}
                  <div style={{ display: "flex", alignItems: "flex-start", marginBottom: "10px", marginTop: "10px" }}>
                    <div style={{ flex: "0 0 50%" }}></div>
                    <div style={{ flex: "0 0 50%", paddingLeft: "8px", fontSize: "0.85rem" }}>
                      {(() => {
                        const allPayments = dueHistoryData.paymentDetails ?? [];
                        const discountItems = allPayments.filter((pd) => pd.accountType?.toLowerCase() === "discount");
                        const discountTotal = discountItems.reduce((s, pd) => s + (pd.amount ?? 0), 0);
                        const netPayable = (dueHistoryData.totalDue ?? 0) - discountTotal;
                        const paid = allPayments
                          .filter((pd) => pd.accountType?.toLowerCase() !== "discount")
                          .reduce((s, pd) => s + (pd.amount ?? 0), 0);
                        const balance = dueHistoryData.pendingAmount ?? 0;
                        return (
                          <>
                            {/* 1. Bill Total */}
                            <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 4px" }}>
                              <span>Bill Total</span>
                              <span>₹{(dueHistoryData.totalDue ?? 0).toFixed(2)}</span>
                            </div>
                            {/* 2. Discount if any */}
                            {discountTotal > 0 && discountItems.map((pd, i) => (
                              <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 4px" }}>
                                <span>Discount</span>
                                <span>- ₹{(pd.amount ?? 0).toFixed(2)}</span>
                              </div>
                            ))}
                            {/* 3. Net Payable */}
                            <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 4px", fontWeight: 700, borderTop: "1px solid #000" }}>
                              <span>Net Payable</span>
                              <span style={{ fontSize: "1rem", fontWeight: 800 }}>₹{netPayable.toFixed(2)}</span>
                            </div>
                            {/* 4. Paid */}
                            <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 4px" }}>
                              <span>Paid</span>
                              <span>₹{paid.toFixed(2)}</span>
                            </div>
                            {/* 5. Balance (only if non-zero) */}
                            {balance !== 0 && (
                              <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 4px", fontWeight: 700, borderTop: "1px solid #000" }}>
                                <span>Balance</span>
                                <span>₹{Math.abs(balance).toFixed(2)}</span>
                              </div>
                            )}
                          </>
                        );
                      })()}
                    </div>
                  </div>
                  {/* ── Cashier ── */}
                  {patientDetails?.userName && (
                    <div style={{ borderTop: "1px solid #e2e8f0", marginTop: "8px", padding: "5px 8px", textAlign: "left" }}>
                      <span style={{ fontSize: "var(--font-size-xs)", color: "#64748b" }}>
                        Cashier :&nbsp;<span style={{ fontWeight: "var(--font-weight-semibold)", color: "#1e293b" }}>{patientDetails.userName}</span>
                      </span>
                    </div>
                  )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              ) : billDetails ? (
                <div ref={printRef} style={{ maxWidth: "600px", margin: "0 auto", fontFamily: "'Segoe UI', Arial, sans-serif", background: "#fff", border: BORDER, borderCollapse: "collapse" as any }}>
                  {/* ── Inline Letterhead ── */}
                  <div style={{ display: "flex", alignItems: "center", paddingBottom: "6px", borderBottom: "1px solid #000" }}>
                    <div style={{ flexShrink: 0, display: "flex", alignItems: "center", marginLeft: "10px" }}>
                      <img src={logo} alt="Logo" style={{ height: "75px", width: "auto", objectFit: "contain", display: "block" }} />
                    </div>
                    <div style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "5px", padding: "4px 0" }}>
                      <div style={{ fontSize: "var(--font-size-4xl)", fontWeight: "var(--font-weight-bold)", letterSpacing: "1.5px", textTransform: "uppercase", color: "#000", lineHeight: 1.15 }}>
                        NIGHTINGALE
                      </div>
                      <div style={{ fontSize: "var(--font-size-base)", color: "#000", lineHeight: 1.5 }}>
                        BATLAGUNDU , DINDUGAL DIST, TAMILNADU - 624202
                      </div>
                      <div style={{ fontSize: "var(--font-size-base)", color: "#000" }}>
                        ✆&nbsp;04543-262041
                      </div>
                      {((billDetails.pharmacyItems?.length ?? 0) > 0 || (billDetails.pharmacyReturnItems?.length ?? 0) > 0) && (
                        <div style={{ fontSize: "var(--font-size-base)", color: "#000" }}>
                          <span style={{ fontWeight: "var(--font-weight-semibold)" }}>D.L No </span> MDU/1597/20 & 21&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
                          <span style={{ fontWeight: "var(--font-weight-semibold)" }}>GST:&nbsp;</span>33AAATT3603J1ZP
                        </div>
                      )}
                    </div>
                    <div style={{ flexShrink: 0, display: "flex", alignItems: "center", marginRight: "10px" }}>
                      <img src={nabh} alt="NABH" style={{ height: "75px", width: "auto", objectFit: "contain", display: "block" }} />
                    </div>
                  </div>
                  {/* ── Patient Info ── */}
                  {patientDetails && (() => {
                    const isIP = !!(patientDetails.ipNo);
                    const displayBillNo = patientDetails.billNo?.includes(",")
                      ? patientDetails.billNo.split(",").slice(1).join(",").trim()
                      : (patientDetails.billNo ?? "");
                    const rows: [string, string][] = [
                      ["Patient", patientDetails.patientName || "N/A"],
                      ["OP No", patientDetails.opNo || "N/A"],
                      ...(isIP ? [
                        ["IP No", patientDetails.ipNo],
                        ["Admit Date", formatDateTime(patientDetails.admitDateTime)],
                        ["Doctor", patientDetails.admitDoctor || ""],
                        ["Department", patientDetails.admitDepartment || ""],
                        ["Ward / Bed", `${patientDetails.wardName} / ${patientDetails.bedName}`],
                      ] as [string, string][] : [
                        ["Doctor", patientDetails.regDoctor || ""],
                        ["Department", patientDetails.regDepartment || ""],
                      ] as [string, string][]),
                      ["Bill No", displayBillNo],
                      ["Date", formatDateTime(billDetails.dateTime ?? "")],
                      ...(patientDetails.accountHead ? [["Account", patientDetails.accountHead]] as [string, string][] : []),
                    ];
                    return (
                      <div style={{ borderTop: "1px solid #000", padding: "5px 10px", marginBottom: "8px" }}>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", columnGap: "10px" }}>
                          {rows.map(([label, value]) => (
                            <div key={label} style={{ display: "flex", alignItems: "baseline", marginBottom: "3px" }}>
                              <span style={{ fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-semibold)", color: "#000", textTransform: "uppercase", letterSpacing: "0.5px", flexShrink: 0, width: "70px" }}>{label}</span>
                              <span style={{ fontSize: "var(--font-size-xs)", color: "#000", marginRight: "3px", flexShrink: 0 }}>:</span>
                              <span style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-bold)", color: "#000", lineHeight: 1.2 }}>{value}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })()}
                  <BillPrintContent bill={billDetails} isPharmacy={[3, 10].includes(selectedBillType)} hideHeader />
                  {/* ── Cashier ── */}
                  {patientDetails?.userName && (
                    <div style={{ borderTop: "1px solid #e2e8f0", marginTop: "8px", padding: "5px 8px", textAlign: "left" }}>
                      <span style={{ fontSize: "var(--font-size-xs)", color: "#64748b" }}>
                        Cashier :&nbsp;<span style={{ fontWeight: "var(--font-weight-semibold)", color: "#1e293b" }}>{patientDetails.userName}</span>
                      </span>
                    </div>
                  )}
                </div>
              ) : !loading ? (
                <div className="text-center py-5 text-muted">
                  <i className="fas fa-file-slash opacity-25 mb-3" style={{ fontSize: "2.5rem", display: "block" }}></i>
                  <div>Bill details could not be loaded.</div>
                </div>
              ) : null}
            </Card.Body>
          </Card>
        </Container>
      </div>
    </div>
  );
};

export default DuplicateBillView;
