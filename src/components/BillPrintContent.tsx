import React from "react";
import BillPrintHeader from "./print/BillPrintHeader";
import PharmacyBillPrintHeader from "./print/PharmacyBillPrintHeader";
import BillPrintFooter from "./print/BillPrintFooter";
import { NAVY, BORDER, thStyle, tdStyle } from "./print/printTokens";

// ── Amount to Words (Indian system) ──────────────────────────────────────────
const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine',
  'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

function numberToWords(n: number): string {
  if (n === 0) return 'Zero';
  if (n < 20) return ones[n];
  if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 ? ' ' + ones[n % 10] : '');
  if (n < 1000) return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 ? ' ' + numberToWords(n % 100) : '');
  if (n < 100000) return numberToWords(Math.floor(n / 1000)) + ' Thousand' + (n % 1000 ? ' ' + numberToWords(n % 1000) : '');
  if (n < 10000000) return numberToWords(Math.floor(n / 100000)) + ' Lakh' + (n % 100000 ? ' ' + numberToWords(n % 100000) : '');
  return numberToWords(Math.floor(n / 10000000)) + ' Crore' + (n % 10000000 ? ' ' + numberToWords(n % 10000000) : '');
}

function amountToWords(amount: number): string {
  if (amount <= 0) return 'Zero Rupees Only';
  const rounded = Math.round(amount * 100) / 100;
  const rupees = Math.floor(rounded);
  const paise = Math.round((rounded - rupees) * 100);
  let result = numberToWords(rupees) + ' Rupee' + (rupees !== 1 ? 's' : '');
  if (paise > 0) result += ' and ' + numberToWords(paise) + ' Paise';
  return result + ' Only';
}

// ── Shared interfaces ─────────────────────────────────────────────────────────

export interface CashItem {
    particularName: string;
    totalRate: number;
    unit: number;
    baseRate: number;
    groupName: string;
    unitRate: number;
    discount: number;
    particularBillNo?: string;
}

export interface PharmacyItem {
    prodsName: string;
    batchNo: string;
    expiryDate: string;
    mrp: number;
    units: number;
    total: number;
    sgst: number;
    cgst: number;
    taxable: number;
    gross: number;
    genericName: string;
    taxType: number;
    igst: number;
    gst: number;
    particularBillNo?: string;
    hsnCode?: string;
    sgstPer?: number;
    cgstPer?: number;
    igstPer?: number;
    discountAmount?: number;
    discountAmt?: number;
    discount?: number;
}

export interface LabItem {
    testName: string;
    totalAmount: number;
    units: number;
    rate: number;
    particularBillNo?: string;
}

export interface RegistrationItem {
    chargeType: string;
    amount: number;
}

export interface IPBillItem {
    particulars: string;
    numberOfDays: number;
    amount: number;
    particularBillNo?: string;
}

export interface BillPrintData {
    billDisplay: string;
    dateTime: string;
    total: number;
    discount: number;
    payable: number;
    paid: number;
    balance: number;
    userName: string;
    isReceipt: boolean;
    previousAdvance: number;
    finalAdvance: number;
    tokenNo: number;
    category?: string;
    patientName?: string;
    opNo?: string;
    // IP-specific (absent for OP bills)
    ipId?: number;
    ipNo?: string;
    admittedAt?: string;
    admittedDoctor?: string;
    admittedWard?: string;
    cashItems: CashItem[];
    cashReturnItems?: CashItem[];
    pharmacyReturnItems?: PharmacyItem[];
    pharmacyItems: PharmacyItem[];
    labItems: LabItem[];
    labReturnItems?: LabItem[];
    registrationDetails?: RegistrationItem[];
    ipBillItems: IPBillItem[];
    advanceAmount?: number;
    advanceReturnAmount?: number;
    dueCollectedAmount?: number;
    paymentDetails?: Array<{ accountType: string; amount: number }>;
}

// ── Section title helper (local—only used for item tables) ───────────────────

const sectionTitle = (label: string, billNos?: string[]) => (
    <div
        style={{
            color: "#1e293b",
            padding: "2px 8px",
            fontSize: "var(--font-size-xs)",
            fontWeight: 700,
            textTransform: "uppercase",
            letterSpacing: "1px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid #000",
        }}
    >
        <span>{label}</span>
        {billNos && billNos.length > 0 && (
            <span style={{ fontWeight: 900, textTransform: "none", letterSpacing: "0", opacity: 0.85, fontSize: "var(--font-size-xs)" }}>
                Bill No: {billNos.join(", ")}
            </span>
        )}
    </div>
);

// ── Component ─────────────────────────────────────────────────────────────────

interface BillPrintContentProps {
    bill: BillPrintData;
    isPharmacy?: boolean;
    hideHeader?: boolean;
}

const toNumber = (value: unknown): number => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : 0;
};

const calculatePharmacyGstSummary = (items: PharmacyItem[] = []) => {
    return items.reduce(
        (acc, item) => {
            const taxable = toNumber(item.taxable) > 0
                ? toNumber(item.taxable)
                : Math.max(toNumber(item.total) - toNumber(item.gst), 0);
            const cgst = toNumber(item.cgst);
            const sgst = toNumber(item.sgst);
            const igst = toNumber(item.igst);
            const gst = toNumber(item.gst) > 0 ? toNumber(item.gst) : cgst + sgst + igst;

            return {
                taxable: acc.taxable + taxable,
                cgst: acc.cgst + cgst,
                sgst: acc.sgst + sgst,
                igst: acc.igst + igst,
                gst: acc.gst + gst,
            };
        },
        { taxable: 0, cgst: 0, sgst: 0, igst: 0, gst: 0 }
    );
};

const MIN_ROWS = 15;

const getUniqueBillNos = (billNos: Array<string | undefined> = []) =>
    billNos.filter((billNo): billNo is string => !!billNo).filter((value, index, arr) => arr.indexOf(value) === index);

const getPharmacyLineTotal = (item: PharmacyItem) => {
    if (!item.units) {
        return 0;
    }
    const disc = item.discountAmount ?? item.discountAmt ?? item.discount ?? 0;
    return (item.mrp - disc / item.units) * item.units;
};

const BillPrintContent: React.FC<BillPrintContentProps> = ({ bill, isPharmacy = false, hideHeader = false }) => {
    const saleGstSummary = calculatePharmacyGstSummary(bill.pharmacyItems || []);
    const returnGstSummary = calculatePharmacyGstSummary(bill.pharmacyReturnItems || []);
    const netGstSummary = {
        taxable: saleGstSummary.taxable - returnGstSummary.taxable,
        cgst: saleGstSummary.cgst - returnGstSummary.cgst,
        sgst: saleGstSummary.sgst - returnGstSummary.sgst,
        igst: saleGstSummary.igst - returnGstSummary.igst,
        gst: saleGstSummary.gst - returnGstSummary.gst,
    };

    const shouldShowGstSummary =
        Math.abs(netGstSummary.taxable) > 0 ||
        Math.abs(netGstSummary.cgst) > 0 ||
        Math.abs(netGstSummary.sgst) > 0 ||
        Math.abs(netGstSummary.igst) > 0 ||
        Math.abs(netGstSummary.gst) > 0;

    const sectionSummary = [
        {
            key: "investigation",
            label: "Investigation",
            count: bill.cashItems?.length ?? 0,
            subtotal: bill.cashItems?.reduce((sum, item) => sum + item.totalRate, 0) ?? 0,
            isReturn: false,
        },
        {
            key: "pharmacy",
            label: "Pharmacy",
            count: bill.pharmacyItems?.length ?? 0,
            subtotal: bill.pharmacyItems?.reduce((sum, item) => sum + getPharmacyLineTotal(item), 0) ?? 0,
            isReturn: false,
        },
        {
            key: "laboratory",
            label: "Laboratory",
            count: bill.labItems?.length ?? 0,
            subtotal: bill.labItems?.reduce((sum, item) => sum + item.totalAmount, 0) ?? 0,
            isReturn: false,
        },
        {
            key: "ip-bill",
            label: "IP Bill",
            count: bill.ipBillItems?.length ?? 0,
            subtotal: bill.ipBillItems?.reduce((sum, item) => sum + item.amount, 0) ?? 0,
            isReturn: false,
        },
        {
            key: "registration",
            label: "Registration",
            count: bill.registrationDetails?.length ?? 0,
            subtotal: bill.registrationDetails?.reduce((sum, item) => sum + item.amount, 0) ?? 0,
            isReturn: false,
        },
        {
            key: "investigation-return",
            label: "Investigation Return",
            count: bill.cashReturnItems?.length ?? 0,
            subtotal: bill.cashReturnItems?.reduce((sum, item) => sum + item.totalRate, 0) ?? 0,
            isReturn: true,
        },
        {
            key: "pharmacy-return",
            label: "Pharmacy Return",
            count: bill.pharmacyReturnItems?.length ?? 0,
            subtotal: bill.pharmacyReturnItems?.reduce((sum, item) => sum + getPharmacyLineTotal(item), 0) ?? 0,
            isReturn: true,
        },
        {
            key: "lab-return",
            label: "Lab Return",
            count: bill.labReturnItems?.length ?? 0,
            subtotal: bill.labReturnItems?.reduce((sum, item) => sum + item.totalAmount, 0) ?? 0,
            isReturn: true,
        },
    ].filter((section) => section.count > 0);

    const hasMultipleDetailSections = sectionSummary.length > 1;
    const hasIpItems = (bill.ipBillItems?.length ?? 0) > 0;
    const useMergedIpTable = hasIpItems && hasMultipleDetailSections;
    const detailMinRows = hasMultipleDetailSections ? 6 : MIN_ROWS;
    const registrationMinRows = hasMultipleDetailSections ? 2 : 4;

    const totalSalesAmount = sectionSummary.filter((section) => !section.isReturn).reduce((sum, section) => sum + section.subtotal, 0);
    const totalReturnAmount = sectionSummary.filter((section) => section.isReturn).reduce((sum, section) => sum + section.subtotal, 0);
    const netDetailAmount = totalSalesAmount - totalReturnAmount;
    let mergedSerial = 1;

    return (
        <div
            style={{
                fontFamily: "'Segoe UI', Arial, sans-serif",
                color: "#1e293b",
                fontSize: "var(--font-size-base)",
                lineHeight: 1.3,
                border: BORDER,
                maxWidth: "100%",
                margin: "0 auto",
                background: "#fff",
            }}
        >
            {!hideHeader && (isPharmacy ? (
                <PharmacyBillPrintHeader
                    isReceipt={bill.isReceipt}
                    patientName={bill.patientName}
                    opNo={bill.opNo}
                    tokenNo={bill.tokenNo}
                    billDisplay={bill.billDisplay}
                    dateTime={bill.dateTime}
                    userName={bill.userName}
                    ipNo={bill.ipNo}
                    admittedAt={bill.admittedAt}
                    admittedDoctor={bill.admittedDoctor}
                    admittedWard={bill.admittedWard}
                    extraPatientRows={bill.category ? [['Category', bill.category]] : []}
                />
            ) : (
                <BillPrintHeader
                    isReceipt={bill.isReceipt}
                    patientName={bill.patientName}
                    opNo={bill.opNo}
                    tokenNo={bill.tokenNo}
                    billDisplay={bill.billDisplay}
                    dateTime={bill.dateTime}
                    userName={bill.userName}
                    ipNo={bill.ipNo}
                    admittedAt={bill.admittedAt}
                    admittedDoctor={bill.admittedDoctor}
                    admittedWard={bill.admittedWard}
                    extraPatientRows={bill.category ? [['Category', bill.category]] : []}
                />
            ))}

            {/* ── Merged IP Bill table (multi-section with IP items) ── */}
            {useMergedIpTable && (
                <div style={{ marginBottom: "12px" }}>
                    {sectionTitle("IP Bill", getUniqueBillNos(bill.ipBillItems.map(i => i.particularBillNo)))}
                    <table
                        style={{
                            width: "100%",
                            borderCollapse: "collapse",
                            fontSize: "0.8rem",
                            border: BORDER,
                            borderTop: "none",
                        }}
                    >
                        <thead>
                            <tr>
                                <th style={{ ...thStyle, width: "5%" }}>#</th>
                                <th style={thStyle}>Particulars</th>
                                <th style={{ ...thStyle, textAlign: "center", width: "12%" }}>Days/Qty</th>
                                <th style={{ ...thStyle, textAlign: "right", width: "14%", borderRight: "none" }}>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            {/* IP Bill rows */}
                            {bill.ipBillItems.map((item, index) => (
                                <tr key={`ip-${index}`}>
                                    <td style={tdStyle}>{mergedSerial++}</td>
                                    <td style={tdStyle}>{item.particulars}</td>
                                    <td style={{ ...tdStyle, textAlign: "center" }}>{item.numberOfDays}</td>
                                    <td style={{ ...tdStyle, textAlign: "right", fontWeight: 600, borderRight: "none" }}>
                                        ₹{item.amount.toFixed(2)}
                                    </td>
                                </tr>
                            ))}

                            {/* ── Investigation section inside IP table ── */}
                            {bill.cashItems && bill.cashItems.length > 0 && (() => {
                                return (
                                    <>
                                        {bill.cashItems.map((item, index) => (
                                            <tr key={`cash-${index}`}>
                                                <td style={tdStyle}>{mergedSerial++}</td>
                                                <td style={tdStyle}>{item.particularName}</td>
                                                <td style={{ ...tdStyle, textAlign: "center" }}>{item.unit}</td>
                                                <td style={{ ...tdStyle, textAlign: "right", fontWeight: 600, borderRight: "none" }}>₹{item.totalRate.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </>
                                );
                            })()}

                            {/* ── Pharmacy section inside IP table ── */}
                            {bill.pharmacyItems && bill.pharmacyItems.length > 0 && (() => {
                                return (
                                    <>
                                        {bill.pharmacyItems.map((item, index) => (
                                            <tr key={`ph-${index}`}>
                                                <td style={tdStyle}>{mergedSerial++}</td>
                                                <td style={tdStyle}>{item.prodsName}{item.batchNo ? <span style={{ fontSize: "var(--font-size-xs)" }}> – Batch: {item.batchNo}</span> : null}</td>
                                                <td style={{ ...tdStyle, textAlign: "center" }}>{item.units}</td>
                                                <td style={{ ...tdStyle, textAlign: "right", fontWeight: 600, borderRight: "none" }}>₹{getPharmacyLineTotal(item).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </>
                                );
                            })()}

                            {/* ── Laboratory section inside IP table ── */}
                            {bill.labItems && bill.labItems.length > 0 && (() => {
                                return (
                                    <>
                                        {bill.labItems.map((item, index) => (
                                            <tr key={`lab-${index}`}>
                                                <td style={tdStyle}>{mergedSerial++}</td>
                                                <td style={tdStyle}>{item.testName}</td>
                                                <td style={{ ...tdStyle, textAlign: "center" }}>{item.units}</td>
                                                <td style={{ ...tdStyle, textAlign: "right", fontWeight: 600, borderRight: "none" }}>₹{item.totalAmount.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </>
                                );
                            })()}

                            {/* ── Registration section inside IP table ── */}
                            {bill.registrationDetails && bill.registrationDetails.length > 0 && (() => {
                                return (
                                    <>
                                        {bill.registrationDetails!.map((item, index) => (
                                            <tr key={`reg-${index}`}>
                                                <td style={tdStyle}>{mergedSerial++}</td>
                                                <td style={tdStyle}>{item.chargeType}</td>
                                                <td style={{ ...tdStyle, textAlign: "center" }}>—</td>
                                                <td style={{ ...tdStyle, textAlign: "right", fontWeight: 600, borderRight: "none" }}>₹{item.amount.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </>
                                );
                            })()}

                            {/* ── Investigation Return section inside IP table ── */}
                            {bill.cashReturnItems && bill.cashReturnItems.length > 0 && (() => {
                                return (
                                    <>
                                        {bill.cashReturnItems.map((item, index) => (
                                            <tr key={`cashret-${index}`}>
                                                <td style={tdStyle}>{mergedSerial++}</td>
                                                <td style={tdStyle}>{item.particularName}{item.groupName ? <span style={{ fontSize: "var(--font-size-xs)" }}> – {item.groupName}</span> : null}</td>
                                                <td style={{ ...tdStyle, textAlign: "center" }}>{item.unit}</td>
                                                <td style={{ ...tdStyle, textAlign: "right", fontWeight: 600, color: "#dc2626", borderRight: "none" }}>- ₹{item.totalRate.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </>
                                );
                            })()}

                            {/* ── Pharmacy Return section inside IP table ── */}
                            {bill.pharmacyReturnItems && bill.pharmacyReturnItems.length > 0 && (() => {
                                return (
                                    <>
                                        {bill.pharmacyReturnItems!.map((item, index) => (
                                            <tr key={`phret-${index}`}>
                                                <td style={tdStyle}>{mergedSerial++}</td>
                                                <td style={tdStyle}>{item.prodsName}{item.batchNo ? <span style={{ fontSize: "var(--font-size-xs)" }}> – Batch: {item.batchNo}</span> : null}</td>
                                                <td style={{ ...tdStyle, textAlign: "center" }}>{item.units}</td>
                                                <td style={{ ...tdStyle, textAlign: "right", fontWeight: 600, color: "#dc2626", borderRight: "none" }}>- ₹{getPharmacyLineTotal(item).toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </>
                                );
                            })()}

                            {/* ── Lab Return section inside IP table ── */}
                            {bill.labReturnItems && bill.labReturnItems.length > 0 && (() => {
                                return (
                                    <>
                                        {bill.labReturnItems!.map((item, index) => (
                                            <tr key={`labret-${index}`}>
                                                <td style={tdStyle}>{mergedSerial++}</td>
                                                <td style={tdStyle}>{item.testName}</td>
                                                <td style={{ ...tdStyle, textAlign: "center" }}>{item.units}</td>
                                                <td style={{ ...tdStyle, textAlign: "right", fontWeight: 600, color: "#dc2626", borderRight: "none" }}>- ₹{item.totalAmount.toFixed(2)}</td>
                                            </tr>
                                        ))}
                                    </>
                                );
                            })()}

                            {/* Grand total row */}
                            <tr style={{ borderTop: "2px solid #334155", background: "#f1f5f9" }}>
                                <td colSpan={2} style={{ ...tdStyle, borderRight: "none", fontWeight: 700 }}>Grand Total</td>
                                <td style={{ ...tdStyle, fontWeight: 700 }}></td>
                                <td style={{ ...tdStyle, textAlign: "right", fontWeight: 800, fontSize: "var(--font-size-base)", borderRight: "none" }}>
                                    ₹{netDetailAmount.toFixed(2)}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}

            {/* ── Standalone Due Collected (shown even in merged mode) ── */}
            {bill.dueCollectedAmount != null && (bill.dueCollectedAmount as number) > 0 && (
                <div style={{ marginBottom: "12px" }}>
                    {sectionTitle("Due Collected")}
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem", borderTop: "none", borderBottom: BORDER }}>
                        <tbody>
                            <tr>
                                <td style={tdStyle}>Due Amount Collected</td>
                                <td style={{ ...tdStyle, textAlign: "right", fontWeight: 700, borderRight: "none" }}>
                                    ₹{(bill.dueCollectedAmount as number).toFixed(2)}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}

            {/* ── Standalone Advance Collection (shown even in merged mode) ── */}
            {bill.advanceAmount != null && bill.advanceAmount > 0 && (
                <div style={{ marginBottom: "12px" }}>
                    {sectionTitle("Advance Collection")}
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem", borderTop: "none", borderBottom: BORDER }}>
                        <tbody>
                            <tr>
                                <td style={tdStyle}>Advance Received</td>
                                <td style={{ ...tdStyle, textAlign: "right", fontWeight: 700, borderRight: "none" }}>
                                    ₹{bill.advanceAmount.toFixed(2)}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}

            {/* ── Standalone Advance Return (shown even in merged mode) ── */}
            {bill.advanceReturnAmount != null && bill.advanceReturnAmount > 0 && (
                <div style={{ marginBottom: "12px" }}>
                    {sectionTitle("Advance Return")}
                    <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem", borderTop: "none", borderBottom: BORDER }}>
                        <tbody>
                            <tr>
                                <td style={tdStyle}>Amount Returned</td>
                                <td style={{ ...tdStyle, textAlign: "right", fontWeight: 700, borderRight: "none" }}>
                                    ₹{bill.advanceReturnAmount.toFixed(2)}
                                </td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            )}

            {/* ── Individual section tables (only when NOT in merged IP mode) ── */}
            {!useMergedIpTable && (
                <>
                    {/* ── Investigation ── */}
                    {bill.cashItems && bill.cashItems.length > 0 && (
                        <div style={{ marginBottom: "12px" }}>
                            {sectionTitle("Investigation", getUniqueBillNos(bill.cashItems.map(i => i.particularBillNo)))}
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem", borderTop: "none", borderBottom: BORDER }}>
                                <thead>
                                    <tr>
                                        <th style={{ ...thStyle, width: "5%" }}>#</th>
                                        <th style={thStyle}>Particular</th>
                                        <th style={{ ...thStyle, textAlign: "center", width: "6%" }}>Qty</th>
                                        <th style={{ ...thStyle, textAlign: "right", width: "10%" }}>Rate</th>
                                        <th style={{ ...thStyle, textAlign: "right", width: "10%" }}>Disc.</th>
                                        <th style={{ ...thStyle, textAlign: "right", width: "11%", borderRight: "none" }}>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bill.cashItems.map((item, index) => (
                                        <tr key={index}>
                                            <td style={tdStyle}>{index + 1}</td>
                                            <td style={tdStyle}><div>{item.particularName}</div></td>
                                            <td style={{ ...tdStyle, textAlign: "center" }}>{item.unit}</td>
                                            <td style={{ ...tdStyle, textAlign: "right" }}>₹{item.unitRate.toFixed(2)}</td>
                                            <td style={{ ...tdStyle, textAlign: "right" }}>
                                                {item.discount > 0 ? `₹${item.discount.toFixed(2)}` : "—"}
                                            </td>
                                            <td style={{ ...tdStyle, textAlign: "right", fontWeight: 600, borderRight: "none" }}>₹{item.totalRate.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                    {Array.from({ length: Math.max(0, detailMinRows - bill.cashItems.length) }).map((_, i) => (
                                        <tr key={`filler-${i}`} style={{ height: "14px" }}>
                                            <td style={tdStyle}>&nbsp;</td><td style={tdStyle}>&nbsp;</td>
                                            <td style={{ ...tdStyle, textAlign: "center" }}>&nbsp;</td><td style={{ ...tdStyle, textAlign: "right" }}>&nbsp;</td>
                                            <td style={{ ...tdStyle, textAlign: "right" }}>&nbsp;</td><td style={{ ...tdStyle, borderRight: "none" }}>&nbsp;</td>
                                        </tr>
                                    ))}
                                    <tr style={{ borderTop: "1px solid #cbd5e1" }}>
                                        <td colSpan={2} style={{ ...tdStyle, borderRight: "none" }}></td>
                                        <td style={{ ...tdStyle, textAlign: "center", fontWeight: 600 }}>{bill.cashItems.reduce((s, i) => s + i.unit, 0)}</td>
                                        <td style={tdStyle}></td>
                                        <td style={{ ...tdStyle, textAlign: "right" }}>
                                            {(() => { const d = bill.cashItems.reduce((s, i) => s + i.discount, 0); return d > 0 ? `₹${d.toFixed(2)}` : "—"; })()}
                                        </td>
                                        <td style={{ ...tdStyle, textAlign: "right", fontWeight: 700, borderRight: "none" }}>
                                            ₹{bill.cashItems.reduce((s, i) => s + i.totalRate, 0).toFixed(2)}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* ── Pharmacy ── */}
                    {bill.pharmacyItems && bill.pharmacyItems.length > 0 && (
                        <div style={{ marginBottom: "12px" }}>
                            {sectionTitle("Pharmacy", getUniqueBillNos(bill.pharmacyItems.map(i => i.particularBillNo)))}
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem", borderTop: "none", borderBottom: BORDER }}>
                                <thead>
                                    <tr>
                                        <th style={{ ...thStyle, width: "3%", padding: "2px 2px" }}>#</th>
                                        <th style={{ ...thStyle, padding: "2px 2px" }}>Medicine</th>
                                        <th style={{ ...thStyle, width: "8%", padding: "2px 2px" }}>HSN</th>
                                        <th style={{ ...thStyle, width: "8%", padding: "2px 2px" }}>Batch</th>
                                        <th style={{ ...thStyle, width: "6%", padding: "2px 2px" }}>Expiry</th>
                                        <th style={{ ...thStyle, textAlign: "right", width: "6%", padding: "2px 2px" }}>MRP</th>
                                        <th style={{ ...thStyle, textAlign: "right", width: "6%", padding: "2px 2px" }}>Rate</th>
                                        <th style={{ ...thStyle, textAlign: "center", width: "5%", padding: "2px 2px" }}>Qty</th>
                                        <th style={{ ...thStyle, textAlign: "right", width: "5%", padding: "2px 2px" }}>Disc.</th>
                                        <th style={{ ...thStyle, textAlign: "right", width: "5%", padding: "2px 2px" }}>GST</th>
                                        <th style={{ ...thStyle, textAlign: "right", width: "7%", borderRight: "none", padding: "2px 2px" }}>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bill.pharmacyItems.map((item, index) => (
                                        <tr key={index}>
                                            <td style={{ ...tdStyle, color: "#94a3b8", padding: "1px 2px" }}>{index + 1}</td>
                                            <td style={{ ...tdStyle, padding: "1px 2px" }}><div>{item.prodsName}</div></td>
                                            <td style={{ ...tdStyle, fontSize: "var(--font-size-sm)", color: "#000", padding: "1px 2px" }}>{item.hsnCode || "—"}</td>
                                            <td style={{ ...tdStyle, fontSize: "var(--font-size-sm)", color: "#000", padding: "1px 2px" }}>{item.batchNo}</td>
                                            <td style={{ ...tdStyle, fontSize: "var(--font-size-sm)", color: "#000", padding: "1px 2px" }}>{item.expiryDate}</td>
                                            <td style={{ ...tdStyle, textAlign: "right", padding: "1px 2px" }}>{item.mrp.toFixed(2)}</td>
                                            <td style={{ ...tdStyle, textAlign: "right", padding: "1px 2px" }}>{item.units ? (item.mrp - (item.discountAmount ?? item.discountAmt ?? item.discount ?? 0) / item.units).toFixed(2) : "0.00"}</td>
                                            <td style={{ ...tdStyle, textAlign: "center", padding: "1px 2px" }}>{item.units}</td>
                                            <td style={{ ...tdStyle, textAlign: "right", padding: "1px 2px" }}>
                                                {(item.discountAmount ?? item.discountAmt ?? item.discount ?? 0) > 0 ? (item.discountAmount ?? item.discountAmt ?? item.discount ?? 0).toFixed(2) : "—"}
                                            </td>
                                            <td style={{ ...tdStyle, textAlign: "right", padding: "1px 2px" }}>
                                                {((item.sgstPer || 0) + (item.cgstPer || 0) + (item.igstPer || 0)) > 0
                                                    ? `${(item.sgstPer || 0) + (item.cgstPer || 0) + (item.igstPer || 0)}%` : "—"}
                                            </td>
                                            <td style={{ ...tdStyle, textAlign: "right", fontWeight: 600, borderRight: "none", padding: "1px 2px" }}>{getPharmacyLineTotal(item).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                    {Array.from({ length: Math.max(0, detailMinRows - bill.pharmacyItems.length) }).map((_, i) => (
                                        <tr key={`filler-${i}`} style={{ height: "14px" }}>
                                            <td style={{ ...tdStyle, padding: "1px 2px" }}>&nbsp;</td><td style={{ ...tdStyle, padding: "1px 2px" }}>&nbsp;</td><td style={{ ...tdStyle, padding: "1px 2px" }}>&nbsp;</td><td style={{ ...tdStyle, padding: "1px 2px" }}>&nbsp;</td><td style={{ ...tdStyle, padding: "1px 2px" }}>&nbsp;</td>
                                            <td style={{ ...tdStyle, textAlign: "right", padding: "1px 2px" }}>&nbsp;</td><td style={{ ...tdStyle, textAlign: "right", padding: "1px 2px" }}>&nbsp;</td>
                                            <td style={{ ...tdStyle, textAlign: "right", padding: "1px 2px" }}>&nbsp;</td><td style={{ ...tdStyle, textAlign: "center", padding: "1px 2px" }}>&nbsp;</td>
                                            <td style={{ ...tdStyle, textAlign: "right", padding: "1px 2px" }}>&nbsp;</td><td style={{ ...tdStyle, borderRight: "none", padding: "1px 2px" }}>&nbsp;</td>
                                        </tr>
                                    ))}
                                    <tr style={{ borderTop: "1px solid #cbd5e1" }}>
                                        <td colSpan={4} style={{ ...tdStyle, borderRight: "none", padding: "1px 2px" }}></td>
                                        <td style={{ ...tdStyle, fontWeight: 700, padding: "1px 2px" }}>Total</td>
                                        <td style={{ ...tdStyle, textAlign: "right", fontWeight: 600, padding: "1px 2px" }}>{bill.pharmacyItems.reduce((s, i) => s + i.mrp, 0).toFixed(2)}</td>
                                        <td style={{ ...tdStyle, textAlign: "right", fontWeight: 600, padding: "1px 2px" }}>{bill.pharmacyItems.reduce((s, i) => s + (i.units ? (i.mrp - (i.discountAmount ?? i.discountAmt ?? i.discount ?? 0) / i.units) : 0), 0).toFixed(2)}</td>
                                        <td style={{ ...tdStyle, textAlign: "center", fontWeight: 600, padding: "1px 2px" }}>{bill.pharmacyItems.reduce((s, i) => s + i.units, 0)}</td>
                                        <td style={{ ...tdStyle, textAlign: "right", fontWeight: 600, padding: "1px 2px" }}>
                                            {(() => { const d = bill.pharmacyItems.reduce((s, i) => s + (i.discountAmount ?? i.discountAmt ?? i.discount ?? 0), 0); return d > 0 ? d.toFixed(2) : "—"; })()}
                                        </td>
                                        <td style={{ ...tdStyle, padding: "1px 2px" }}></td>
                                        <td style={{ ...tdStyle, textAlign: "right", fontWeight: 700, borderRight: "none", padding: "1px 2px" }}>{bill.pharmacyItems.reduce((s, i) => s + getPharmacyLineTotal(i), 0).toFixed(2)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* ── Laboratory ── */}
                    {bill.labItems && bill.labItems.length > 0 && (
                        <div style={{ marginBottom: "12px" }}>
                            {sectionTitle("Laboratory", getUniqueBillNos(bill.labItems.map(i => i.particularBillNo)))}
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem", borderTop: "none", borderBottom: BORDER }}>
                                <thead>
                                    <tr>
                                        <th style={{ ...thStyle, width: "5%" }}>#</th>
                                        <th style={thStyle}>Test Name</th>
                                        <th style={{ ...thStyle, textAlign: "center", width: "8%" }}>Qty</th>
                                        <th style={{ ...thStyle, textAlign: "right", width: "13%" }}>Rate</th>
                                        <th style={{ ...thStyle, textAlign: "right", width: "13%", borderRight: "none" }}>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bill.labItems.map((item, index) => (
                                        <tr key={index}>
                                            <td style={tdStyle}>{index + 1}</td>
                                            <td style={tdStyle}><div>{item.testName}</div></td>
                                            <td style={{ ...tdStyle, textAlign: "center" }}>{item.units}</td>
                                            <td style={{ ...tdStyle, textAlign: "right" }}>₹{item.rate.toFixed(2)}</td>
                                            <td style={{ ...tdStyle, textAlign: "right", fontWeight: 600, borderRight: "none" }}>₹{item.totalAmount.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                    {Array.from({ length: Math.max(0, detailMinRows - bill.labItems.length) }).map((_, i) => (
                                        <tr key={`filler-${i}`} style={{ height: "14px" }}>
                                            <td style={tdStyle}>&nbsp;</td><td style={tdStyle}>&nbsp;</td>
                                            <td style={{ ...tdStyle, textAlign: "center" }}>&nbsp;</td><td style={{ ...tdStyle, textAlign: "right" }}>&nbsp;</td>
                                            <td style={{ ...tdStyle, borderRight: "none" }}>&nbsp;</td>
                                        </tr>
                                    ))}
                                    <tr style={{ borderTop: "1px solid #cbd5e1" }}>
                                        <td style={tdStyle}></td>
                                        <td style={{ ...tdStyle, fontWeight: 700 }}>Total</td>
                                        <td style={{ ...tdStyle, textAlign: "center", fontWeight: 600 }}>{bill.labItems.reduce((s, i) => s + i.units, 0)}</td>
                                        <td style={tdStyle}></td>
                                        <td style={{ ...tdStyle, textAlign: "right", fontWeight: 700, borderRight: "none" }}>₹{bill.labItems.reduce((s, i) => s + i.totalAmount, 0).toFixed(2)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* ── Investigation Return ── */}
                    {bill.cashReturnItems && bill.cashReturnItems.length > 0 && (
                        <div style={{ marginBottom: "12px" }}>
                            {sectionTitle("Return", getUniqueBillNos(bill.cashReturnItems.map(i => i.particularBillNo)))}
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem", borderTop: "none", borderBottom: BORDER }}>
                                <thead>
                                    <tr>
                                        <th style={{ ...thStyle, width: "5%" }}>#</th>
                                        <th style={thStyle}>Particular</th>
                                        <th style={{ ...thStyle, textAlign: "center", width: "6%" }}>Qty</th>
                                        <th style={{ ...thStyle, textAlign: "right", width: "10%" }}>Rate</th>
                                        <th style={{ ...thStyle, textAlign: "right", width: "10%" }}>Disc.</th>
                                        <th style={{ ...thStyle, textAlign: "right", width: "11%", borderRight: "none" }}>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bill.cashReturnItems.map((item, index) => (
                                        <tr key={index}>
                                            <td style={tdStyle}>{index + 1}</td>
                                            <td style={tdStyle}><div>{item.particularName}</div></td>
                                            <td style={{ ...tdStyle, textAlign: "center" }}>{item.unit}</td>
                                            <td style={{ ...tdStyle, textAlign: "right" }}>₹{item.unitRate.toFixed(2)}</td>
                                            <td style={{ ...tdStyle, textAlign: "right", color: item.discount > 0 ? "#dc2626" : "#94a3b8" }}>
                                                {item.discount > 0 ? `₹${item.discount.toFixed(2)}` : "—"}
                                            </td>
                                            <td style={{ ...tdStyle, textAlign: "right", fontWeight: 600, borderRight: "none" }}>₹{item.totalRate.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                    {Array.from({ length: Math.max(0, detailMinRows - bill.cashReturnItems.length) }).map((_, i) => (
                                        <tr key={`filler-${i}`} style={{ height: "14px" }}>
                                            <td style={tdStyle}>&nbsp;</td><td style={tdStyle}>&nbsp;</td>
                                            <td style={{ ...tdStyle, textAlign: "center" }}>&nbsp;</td><td style={{ ...tdStyle, textAlign: "right" }}>&nbsp;</td>
                                            <td style={{ ...tdStyle, textAlign: "right" }}>&nbsp;</td><td style={{ ...tdStyle, borderRight: "none" }}>&nbsp;</td>
                                        </tr>
                                    ))}
                                    <tr style={{ borderTop: "1px solid #cbd5e1" }}>
                                        <td style={{ ...tdStyle, borderRight: "none" }}></td>
                                        <td style={{ ...tdStyle, fontWeight: 700 }}>Total</td>
                                        <td style={{ ...tdStyle, textAlign: "center", fontWeight: 600 }}>{bill.cashReturnItems.reduce((s, i) => s + i.unit, 0)}</td>
                                        <td style={tdStyle}></td>
                                        <td style={{ ...tdStyle, textAlign: "right", color: "#dc2626" }}>
                                            {(() => { const d = bill.cashReturnItems.reduce((s, i) => s + i.discount, 0); return d > 0 ? `₹${d.toFixed(2)}` : "—"; })()}
                                        </td>
                                        <td style={{ ...tdStyle, textAlign: "right", fontWeight: 700, borderRight: "none" }}>₹{bill.cashReturnItems.reduce((s, i) => s + i.totalRate, 0).toFixed(2)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* ── Pharmacy Return ── */}
                    {bill.pharmacyReturnItems && bill.pharmacyReturnItems.length > 0 && (
                        <div style={{ marginBottom: "12px" }}>
                            {sectionTitle("Pharmacy Return", getUniqueBillNos(bill.pharmacyReturnItems.map(i => i.particularBillNo)))}
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem", borderTop: "none", borderBottom: BORDER }}>
                                <thead>
                                    <tr>
                                        <th style={{ ...thStyle, width: "3%", padding: "2px 2px" }}>#</th>
                                        <th style={{ ...thStyle, padding: "2px 2px" }}>Medicine</th>
                                        <th style={{ ...thStyle, width: "8%", padding: "2px 2px" }}>HSN</th>
                                        <th style={{ ...thStyle, width: "8%", padding: "2px 2px" }}>Batch</th>
                                        <th style={{ ...thStyle, width: "6%", padding: "2px 2px" }}>Expiry</th>
                                        <th style={{ ...thStyle, textAlign: "right", width: "6%", padding: "2px 2px" }}>MRP</th>
                                        <th style={{ ...thStyle, textAlign: "right", width: "6%", padding: "2px 2px" }}>Rate</th>
                                        <th style={{ ...thStyle, textAlign: "center", width: "5%", padding: "2px 2px" }}>Qty</th>
                                        <th style={{ ...thStyle, textAlign: "right", width: "5%", padding: "2px 2px" }}>Disc.</th>
                                        <th style={{ ...thStyle, textAlign: "right", width: "5%", padding: "2px 2px" }}>GST</th>
                                        <th style={{ ...thStyle, textAlign: "right", width: "7%", borderRight: "none", padding: "2px 2px" }}>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bill.pharmacyReturnItems!.map((item, index) => (
                                        <tr key={index}>
                                            <td style={{ ...tdStyle, color: "#94a3b8", padding: "1px 2px" }}>{index + 1}</td>
                                            <td style={{ ...tdStyle, padding: "1px 2px" }}><div>{item.prodsName}</div></td>
                                            <td style={{ ...tdStyle, fontSize: "var(--font-size-sm)", color: "#000", padding: "1px 2px" }}>{item.hsnCode || "—"}</td>
                                            <td style={{ ...tdStyle, fontSize: "var(--font-size-sm)", color: "#000", padding: "1px 2px" }}>{item.batchNo}</td>
                                            <td style={{ ...tdStyle, fontSize: "var(--font-size-sm)", color: "#000", padding: "1px 2px" }}>{item.expiryDate}</td>
                                            <td style={{ ...tdStyle, textAlign: "right", padding: "1px 2px" }}>{item.mrp.toFixed(2)}</td>
                                            <td style={{ ...tdStyle, textAlign: "right", padding: "1px 2px" }}>{item.units ? (item.mrp - (item.discountAmount ?? item.discountAmt ?? item.discount ?? 0) / item.units).toFixed(2) : "0.00"}</td>
                                            <td style={{ ...tdStyle, textAlign: "center", padding: "1px 2px" }}>{item.units}</td>
                                            <td style={{ ...tdStyle, textAlign: "right", padding: "1px 2px" }}>
                                                {(item.discountAmount ?? item.discountAmt ?? item.discount ?? 0) > 0 ? (item.discountAmount ?? item.discountAmt ?? item.discount ?? 0).toFixed(2) : "—"}
                                            </td>
                                            <td style={{ ...tdStyle, textAlign: "right", padding: "1px 2px" }}>
                                                {((item.sgstPer || 0) + (item.cgstPer || 0) + (item.igstPer || 0)) > 0
                                                    ? `${(item.sgstPer || 0) + (item.cgstPer || 0) + (item.igstPer || 0)}%` : "—"}
                                            </td>
                                            <td style={{ ...tdStyle, textAlign: "right", fontWeight: 600, borderRight: "none", padding: "1px 2px" }}>{getPharmacyLineTotal(item).toFixed(2)}</td>
                                        </tr>
                                    ))}
                                    {Array.from({ length: Math.max(0, detailMinRows - bill.pharmacyReturnItems!.length) }).map((_, i) => (
                                        <tr key={`filler-${i}`} style={{ height: "14px" }}>
                                            <td style={{ ...tdStyle, padding: "1px 2px" }}>&nbsp;</td><td style={{ ...tdStyle, padding: "1px 2px" }}>&nbsp;</td><td style={{ ...tdStyle, padding: "1px 2px" }}>&nbsp;</td><td style={{ ...tdStyle, padding: "1px 2px" }}>&nbsp;</td><td style={{ ...tdStyle, padding: "1px 2px" }}>&nbsp;</td>
                                            <td style={{ ...tdStyle, textAlign: "right", padding: "1px 2px" }}>&nbsp;</td><td style={{ ...tdStyle, textAlign: "right", padding: "1px 2px" }}>&nbsp;</td>
                                            <td style={{ ...tdStyle, textAlign: "right", padding: "1px 2px" }}>&nbsp;</td><td style={{ ...tdStyle, textAlign: "center", padding: "1px 2px" }}>&nbsp;</td>
                                            <td style={{ ...tdStyle, textAlign: "right", padding: "1px 2px" }}>&nbsp;</td><td style={{ ...tdStyle, borderRight: "none", padding: "1px 2px" }}>&nbsp;</td>
                                        </tr>
                                    ))}
                                    <tr style={{ borderTop: "1px solid #cbd5e1" }}>
                                        <td colSpan={4} style={{ ...tdStyle, borderRight: "none", padding: "1px 2px" }}></td>
                                        <td style={{ ...tdStyle, fontWeight: 700, padding: "1px 2px" }}>Total</td>
                                        <td style={{ ...tdStyle, textAlign: "right", fontWeight: 600, padding: "1px 2px" }}>{bill.pharmacyReturnItems!.reduce((s, i) => s + i.mrp, 0).toFixed(2)}</td>
                                        <td style={{ ...tdStyle, textAlign: "right", fontWeight: 600, padding: "1px 2px" }}>{bill.pharmacyReturnItems!.reduce((s, i) => s + (i.units ? (i.mrp - (i.discountAmount ?? i.discountAmt ?? i.discount ?? 0) / i.units) : 0), 0).toFixed(2)}</td>
                                        <td style={{ ...tdStyle, textAlign: "center", fontWeight: 600, padding: "1px 2px" }}>{bill.pharmacyReturnItems!.reduce((s, i) => s + i.units, 0)}</td>
                                        <td style={{ ...tdStyle, textAlign: "right", fontWeight: 600, padding: "1px 2px" }}>
                                            {(() => { const d = bill.pharmacyReturnItems!.reduce((s, i) => s + (i.discountAmount ?? i.discountAmt ?? i.discount ?? 0), 0); return d > 0 ? d.toFixed(2) : "—"; })()}
                                        </td>
                                        <td style={{ ...tdStyle, padding: "1px 2px" }}></td>
                                        <td style={{ ...tdStyle, textAlign: "right", fontWeight: 700, borderRight: "none", padding: "1px 2px" }}>{bill.pharmacyReturnItems!.reduce((s, i) => s + getPharmacyLineTotal(i), 0).toFixed(2)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* ── Lab Return ── */}
                    {bill.labReturnItems && bill.labReturnItems.length > 0 && (
                        <div style={{ marginBottom: "12px" }}>
                            {sectionTitle("Lab Return", getUniqueBillNos(bill.labReturnItems.map(i => i.particularBillNo)))}
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem", borderTop: "none", borderBottom: BORDER }}>
                                <thead>
                                    <tr>
                                        <th style={{ ...thStyle, width: "5%" }}>#</th>
                                        <th style={thStyle}>Test Name</th>
                                        <th style={{ ...thStyle, textAlign: "center", width: "8%" }}>Qty</th>
                                        <th style={{ ...thStyle, textAlign: "right", width: "13%" }}>Rate</th>
                                        <th style={{ ...thStyle, textAlign: "right", width: "13%", borderRight: "none" }}>Total</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bill.labReturnItems!.map((item, index) => (
                                        <tr key={index}>
                                            <td style={tdStyle}>{index + 1}</td>
                                            <td style={tdStyle}><div>{item.testName}</div></td>
                                            <td style={{ ...tdStyle, textAlign: "center" }}>{item.units}</td>
                                            <td style={{ ...tdStyle, textAlign: "right" }}>₹{item.rate.toFixed(2)}</td>
                                            <td style={{ ...tdStyle, textAlign: "right", fontWeight: 600, borderRight: "none" }}>₹{item.totalAmount.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                    {Array.from({ length: Math.max(0, detailMinRows - bill.labReturnItems!.length) }).map((_, i) => (
                                        <tr key={`filler-${i}`} style={{ height: "14px" }}>
                                            <td style={tdStyle}>&nbsp;</td><td style={tdStyle}>&nbsp;</td>
                                            <td style={{ ...tdStyle, textAlign: "center" }}>&nbsp;</td><td style={{ ...tdStyle, textAlign: "right" }}>&nbsp;</td>
                                            <td style={{ ...tdStyle, borderRight: "none" }}>&nbsp;</td>
                                        </tr>
                                    ))}
                                    <tr style={{ borderTop: "1px solid #cbd5e1" }}>
                                        <td style={tdStyle}></td>
                                        <td style={{ ...tdStyle, fontWeight: 700 }}>Total</td>
                                        <td style={{ ...tdStyle, textAlign: "center", fontWeight: 600 }}>{bill.labReturnItems!.reduce((s, i) => s + i.units, 0)}</td>
                                        <td style={tdStyle}></td>
                                        <td style={{ ...tdStyle, textAlign: "right", fontWeight: 700, borderRight: "none" }}>₹{bill.labReturnItems!.reduce((s, i) => s + i.totalAmount, 0).toFixed(2)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* ── Registration ── */}
                    {bill.registrationDetails && bill.registrationDetails.length > 0 && (
                        <div style={{ marginBottom: "12px" }}>
                            {sectionTitle("Registration")}
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem", borderTop: "none", borderBottom: BORDER }}>
                                <thead>
                                    <tr>
                                        <th style={{ ...thStyle, width: "5%" }}>#</th>
                                        <th style={thStyle}>Charge Type</th>
                                        <th style={{ ...thStyle, textAlign: "right", width: "15%", borderRight: "none" }}>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bill.registrationDetails!.map((item, index) => (
                                        <tr key={index}>
                                            <td style={tdStyle}>{index + 1}</td>
                                            <td style={tdStyle}>{item.chargeType}</td>
                                            <td style={{ ...tdStyle, textAlign: "right", fontWeight: 600, borderRight: "none" }}>₹{item.amount.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                    {Array.from({ length: Math.max(0, registrationMinRows - bill.registrationDetails!.length) }).map((_, i) => (
                                        <tr key={`filler-${i}`} style={{ height: "14px" }}>
                                            <td style={tdStyle}>&nbsp;</td><td style={tdStyle}>&nbsp;</td><td style={{ ...tdStyle, borderRight: "none" }}>&nbsp;</td>
                                        </tr>
                                    ))}
                                    <tr style={{ borderTop: "1px solid #cbd5e1" }}>
                                        <td colSpan={2} style={{ ...tdStyle, fontWeight: 700 }}>Total</td>
                                        <td style={{ ...tdStyle, textAlign: "right", fontWeight: 700, borderRight: "none" }}>₹{bill.registrationDetails!.reduce((s, i) => s + i.amount, 0).toFixed(2)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}

                    {/* ── IP Bill (standalone, single-section) ── */}
                    {bill.ipBillItems && bill.ipBillItems.length > 0 && (
                        <div style={{ marginBottom: "12px" }}>
                            {sectionTitle("IP Bill", getUniqueBillNos(bill.ipBillItems.map(i => i.particularBillNo)))}
                            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.8rem", borderTop: "none", borderBottom: BORDER }}>
                                <thead>
                                    <tr>
                                        <th style={{ ...thStyle, width: "5%" }}>#</th>
                                        <th style={thStyle}>Particulars</th>
                                        <th style={{ ...thStyle, textAlign: "center", width: "12%" }}>Days</th>
                                        <th style={{ ...thStyle, textAlign: "right", width: "14%", borderRight: "none" }}>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bill.ipBillItems.map((item, index) => (
                                        <tr key={index}>
                                            <td style={tdStyle}>{index + 1}</td>
                                            <td style={tdStyle}><div>{item.particulars}</div></td>
                                            <td style={{ ...tdStyle, textAlign: "center" }}>{item.numberOfDays}</td>
                                            <td style={{ ...tdStyle, textAlign: "right", fontWeight: 600, borderRight: "none" }}>₹{item.amount.toFixed(2)}</td>
                                        </tr>
                                    ))}
                                    {Array.from({ length: Math.max(0, detailMinRows - bill.ipBillItems.length) }).map((_, i) => (
                                        <tr key={`filler-${i}`} style={{ height: "14px" }}>
                                            <td style={tdStyle}>&nbsp;</td><td style={tdStyle}>&nbsp;</td>
                                            <td style={{ ...tdStyle, textAlign: "center" }}>&nbsp;</td><td style={{ ...tdStyle, borderRight: "none" }}>&nbsp;</td>
                                        </tr>
                                    ))}
                                    <tr style={{ borderTop: "1px solid #cbd5e1" }}>
                                        <td colSpan={2} style={{ ...tdStyle, borderRight: "none" }}></td>
                                        <td style={{ ...tdStyle, fontWeight: 700 }}>Total</td>
                                        <td style={{ ...tdStyle, textAlign: "right", fontWeight: 700, borderRight: "none" }}>₹{bill.ipBillItems.reduce((s, i) => s + i.amount, 0).toFixed(2)}</td>
                                    </tr>
                                </tbody>
                            </table>
                        </div>
                    )}
                </>
            )}

            {/* ── GST Summary (left) + Payment Summary (right) side by side ── */}
            <div style={{ display: "flex", alignItems: "flex-start", marginBottom: "10px", marginTop: "10px" }}>
                {/* Left: GST Summary */}
                <div style={{ flex: "0 0 50%", width: "50%" }}>
                    {shouldShowGstSummary && (
                        <>
                            {sectionTitle("GST Summary")}
                            <table
                                style={{
                                    width: "100%",
                                    borderCollapse: "collapse",
                                    fontSize: "0.8rem",
                                    border: BORDER,
                                    borderTop: "none",
                                }}
                            >
                                <colgroup>
                                    <col style={{ width: "50%" }} />
                                    <col style={{ width: "50%" }} />
                                </colgroup>
                                <tbody>
                                    <tr>
                                        <td style={tdStyle}>Taxable Value</td>
                                        <td style={{ ...tdStyle, textAlign: "right", borderRight: "none" }}>
                                            ₹{netGstSummary.taxable.toFixed(2)}
                                        </td>
                                    </tr>
                                    <tr style={{}}>
                                        <td style={tdStyle}>CGST</td>
                                        <td style={{ ...tdStyle, textAlign: "right", borderRight: "none" }}>
                                            ₹{netGstSummary.cgst.toFixed(2)}
                                        </td>
                                    </tr>
                                    <tr style={{}}>
                                        <td style={tdStyle}>SGST</td>
                                        <td style={{ ...tdStyle, textAlign: "right", borderRight: "none" }}>
                                            ₹{netGstSummary.sgst.toFixed(2)}
                                        </td>
                                    </tr>
                                    <tr style={{}}>
                                        <td style={tdStyle}>IGST</td>
                                        <td style={{ ...tdStyle, textAlign: "right", borderRight: "none" }}>
                                            ₹{netGstSummary.igst.toFixed(2)}
                                        </td>
                                    </tr>
                                    <tr style={{ borderTop: "1px solid #cbd5e1" }}>
                                        <td style={{ ...tdStyle, fontWeight: 700 }}>Total GST</td>
                                        <td style={{ ...tdStyle, textAlign: "right", fontWeight: 700, borderRight: "none" }}>
                                            ₹{netGstSummary.gst.toFixed(2)}
                                        </td>
                                    </tr>
                                </tbody>
                            </table>
                        </>
                    )}
                </div>

                {/* Right: Payment Summary */}
                <div style={{ flex: "0 0 50%", width: "50%", paddingLeft: "8px", fontSize: "0.85rem" }}>
                    {(() => {
                        const allPayments = bill.paymentDetails ?? [];
                        const discountItems = allPayments.filter((pd) => pd.accountType?.toLowerCase() === 'discount');
                        const discountTotal = discountItems.reduce((s, pd) => s + (pd.amount ?? 0), 0);
                        const fallbackDiscount = allPayments.length === 0 ? bill.discount : 0;
                        const advanceItems = allPayments.filter((pd) => pd.accountType?.toLowerCase() === 'advance adj');
                        const advanceTotal = advanceItems.reduce((s, pd) => s + (pd.amount ?? 0), 0);
                        const netPayable = bill.total - discountTotal - fallbackDiscount - advanceTotal;
                        // Amount Paid = Cash + Bank only
                        const cashBankTotal = allPayments
                            .filter((pd) => {
                                const t = pd.accountType?.toLowerCase() ?? '';
                                return t === 'cash' || t === 'bank';
                            })
                            .reduce((s, pd) => s + (pd.amount ?? 0), 0);
                        const effectivePaid = allPayments.length > 0 ? cashBankTotal : bill.paid;
                        // Balance in Company
                        const companyTotal = allPayments
                            .filter((pd) => pd.accountType?.toLowerCase() === 'company')
                            .reduce((s, pd) => s + (pd.amount ?? 0), 0);
                        return (
                            <>
                                {/* 1. Bill Total */}
                                <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 4px" }}>
                                    <span>Bill Total</span>
                                    <span>₹{bill.total.toFixed(2)}</span>
                                </div>
                                {/* 2. Discount if any */}
                                {discountTotal > 0 ? discountItems.map((pd, i) => (
                                    <div key={i} style={{ display: "flex", justifyContent: "space-between", padding: "4px 4px" }}>
                                        <span>Discount</span>
                                        <span>- ₹{(pd.amount ?? 0).toFixed(2)}</span>
                                    </div>
                                )) : fallbackDiscount > 0 && (
                                    <div style={{ display: "flex", justifyContent: "space-between", padding: "5px 4px" }}>
                                        <span>Discount</span>
                                        <span>- ₹{fallbackDiscount.toFixed(2)}</span>
                                    </div>
                                )}
                                {/* 3. Advance if any */}
                                {advanceTotal > 0 && (
                                    <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 4px" }}>
                                        <span>Advance</span>
                                        <span>- ₹{advanceTotal.toFixed(2)}</span>
                                    </div>
                                )}
                                {/* 4. Net Payable */}
                                <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 4px", fontWeight: 700, borderTop: "1px solid #000" }}>
                                    <span>Net Payable</span>
                                    <span style={{ fontSize: "1rem", fontWeight: 800 }}>₹{netPayable.toFixed(2)}</span>
                                </div>
                                {/* 5. Amount Paid (Cash + Bank only) */}
                                <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 4px" }}>
                                    <span>Amount Paid</span>
                                    <span>₹{effectivePaid.toFixed(2)}</span>
                                </div>
                                {/* 6. Balance in Company (only if non-zero) */}
                                {companyTotal > 0 && (
                                    <div style={{ display: "flex", justifyContent: "space-between", padding: "4px 4px" }}>
                                        <span>Balance in Company</span>
                                        <span>₹{companyTotal.toFixed(2)}</span>
                                    </div>
                                )}
                                {/* 7. Balance (only if non-zero) */}
                                {bill.balance !== 0 && (
                                    <div style={{ display: "flex", justifyContent: "space-between", padding: "6px 4px", fontWeight: 700, borderTop: "1px solid #000" }}>
                                        <span>Balance</span>
                                        <span>₹{Math.abs(bill.balance).toFixed(2)}</span>
                                    </div>
                                )}
                            </>
                        );
                    })()}
                </div>
            </div>


        </div>
    );
};

export default BillPrintContent;
