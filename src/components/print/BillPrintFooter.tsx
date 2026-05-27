import React from "react";
import himsConfig from "../../himsConfig";
import { BORDER } from "./printTokens";

export interface BillPrintFooterProps {
    total: number;
    discount: number;
    payable: number;
    paid: number;
    balance: number;
    isReturn?: boolean;
    previousAdvance?: number;
    finalAdvance?: number;
    /** When true, skips rendering the payment summary table (used when rendered inline by parent). */
    hidePaymentTable?: boolean;
    /** Signature labels shown at the bottom. Override as needed. */
    signatories?: string[];
    /** Footer note. Defaults to a generic computer-generated note. Pass empty string to hide. */
    footerText?: string;
}

const DEFAULT_SIGNATORIES = ["Patient / Attendant", "Cashier", "Authorised Signatory"];

const BillPrintFooter: React.FC<BillPrintFooterProps> = ({
    total,
    discount,
    payable,
    paid,
    balance,
    isReturn = false,
    previousAdvance = 0,
    finalAdvance = 0,
    hidePaymentTable = false,
    signatories = DEFAULT_SIGNATORIES,
    footerText,
}) => {
    const defaultFooter = `This is a computer-generated bill. No signature required. — ${himsConfig.hospitalFullName}`;
    const resolvedFooter = footerText === undefined ? defaultFooter : footerText;

    const totalLabel   = isReturn ? "Total Return Amount" : "Total Amount";
    const payableLabel = isReturn ? "Net Refund"          : "Net Payable";
    const paidLabel    = isReturn ? "Amount to Return"     : "Paid Amount";

    return (
        <>
            {/* ── Payment Summary ── */}
            {!hidePaymentTable && <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "10px", marginBottom: "20px" }}>
                <table
                    style={{
                        minWidth: "300px",
                        borderCollapse: "collapse",
                        fontSize: "0.85rem",
                        border: BORDER,
                    }}
                >
                    <tbody>
                        <tr style={{ background: "#f8fafc" }}>
                            <td style={{ padding: "7px 14px", color: "#64748b", borderBottom: BORDER, borderRight: BORDER }}>
                                {totalLabel}
                            </td>
                            <td style={{ padding: "7px 14px", textAlign: "right", borderBottom: BORDER }}>
                                ₹{total.toFixed(2)}
                            </td>
                        </tr>
                        {discount > 0 && (
                            <tr style={{ background: "#fff5f5" }}>
                                <td style={{ padding: "7px 14px", color: "#dc2626", borderBottom: BORDER, borderRight: BORDER }}>
                                    Discount
                                </td>
                                <td style={{ padding: "7px 14px", textAlign: "right", color: "#dc2626", borderBottom: BORDER }}>
                                    - ₹{discount.toFixed(2)}
                                </td>
                            </tr>
                        )}
                        <tr style={{ background: "#eff6ff" }}>
                            <td
                                style={{
                                    padding: "8px 14px",
                                    fontWeight: 700,
                                    color: "#1d4ed8",
                                    borderBottom: BORDER,
                                    borderRight: BORDER,
                                }}
                            >
                                {payableLabel}
                            </td>
                            <td
                                style={{
                                    padding: "8px 14px",
                                    textAlign: "right",
                                    fontWeight: 800,
                                    color: "#1d4ed8",
                                    fontSize: "1rem",
                                    borderBottom: BORDER,
                                }}
                            >
                                ₹{payable.toFixed(2)}
                            </td>
                        </tr>
                        <tr style={{ background: "#f0fdf4" }}>
                            <td
                                style={{
                                    padding: "7px 14px",
                                    color: "#15803d",
                                    borderBottom: balance !== 0 ? BORDER : undefined,
                                    borderRight: BORDER,
                                }}
                            >
                                {paidLabel}
                            </td>
                            <td
                                style={{
                                    padding: "7px 14px",
                                    textAlign: "right",
                                    color: "#15803d",
                                    borderBottom: balance !== 0 ? BORDER : undefined,
                                }}
                            >
                                ₹{paid.toFixed(2)}
                            </td>
                        </tr>
                        {balance !== 0 && (
                            <tr style={{ background: balance > 0 ? "#fff5f5" : "#f0fdf4" }}>
                                <td
                                    style={{
                                        padding: "8px 14px",
                                        fontWeight: 700,
                                        color: balance > 0 ? "#dc2626" : "#15803d",
                                        borderRight: BORDER,
                                    }}
                                >
                                    {balance > 0 ? "Balance Due" : "Credit Balance"}
                                </td>
                                <td
                                    style={{
                                        padding: "8px 14px",
                                        textAlign: "right",
                                        fontWeight: 700,
                                        color: balance > 0 ? "#dc2626" : "#15803d",
                                    }}
                                >
                                    ₹{Math.abs(balance).toFixed(2)}
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>}

            {/* ── Advance Details ── */}
            {(previousAdvance > 0 || finalAdvance > 0) && (
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: "16px" }}>
                    <table
                        style={{
                            minWidth: "300px",
                            borderCollapse: "collapse",
                            fontSize: "0.8rem",
                            border: BORDER,
                        }}
                    >
                        <thead>
                            <tr style={{ background: "#f8fafc" }}>
                                <th
                                    colSpan={2}
                                    style={{
                                        padding: "5px 14px",
                                        textAlign: "left",
                                        fontSize: "0.66rem",
                                        textTransform: "uppercase",
                                        letterSpacing: "0.8px",
                                        color: "#94a3b8",
                                        fontWeight: 600,
                                    }}
                                >
                                    Advance Details
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {previousAdvance > 0 && (
                                <tr>
                                    <td
                                        style={{
                                            padding: "6px 14px",
                                            color: "#64748b",
                                            borderTop: BORDER,
                                            borderRight: BORDER,
                                        }}
                                    >
                                        Previous Advance
                                    </td>
                                    <td style={{ padding: "6px 14px", textAlign: "right", borderTop: BORDER }}>
                                        ₹{previousAdvance.toFixed(2)}
                                    </td>
                                </tr>
                            )}
                            {finalAdvance > 0 && (
                                <tr>
                                    <td
                                        style={{
                                            padding: "6px 14px",
                                            color: "#64748b",
                                            borderTop: BORDER,
                                            borderRight: BORDER,
                                        }}
                                    >
                                        Final Advance
                                    </td>
                                    <td style={{ padding: "6px 14px", textAlign: "right", borderTop: BORDER }}>
                                        ₹{finalAdvance.toFixed(2)}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ── Signature Row ── */}
            {signatories.length > 0 && (
                <div
                    style={{
                        display: "grid",
                        gridTemplateColumns: `repeat(${signatories.length}, 1fr)`,
                        gap: "32px",
                        marginTop: "28px",
                        marginBottom: "12px",
                    }}
                >
                    {signatories.map((label) => (
                        <div key={label} style={{ textAlign: "center" }}>
                            <div
                                style={{
                                    borderTop: "1px solid #94a3b8",
                                    paddingTop: "6px",
                                    fontSize: "0.72rem",
                                    color: "#64748b",
                                }}
                            >
                                {label}
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* ── Footer ── */}
            {resolvedFooter && (
                <div
                    style={{
                        borderTop: BORDER,
                        paddingTop: "8px",
                        textAlign: "center",
                        fontSize: "0.68rem",
                        color: "#94a3b8",
                        letterSpacing: "0.3px",
                    }}
                >
                    {resolvedFooter}
                </div>
            )}
        </>
    );
};

export default BillPrintFooter;
