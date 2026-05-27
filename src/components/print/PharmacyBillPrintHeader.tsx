import React, { useEffect, useState } from "react";
import PrintHeader from "../PrintHeader";
import { AppApiService } from "../../api/app/app-api-service";
import { BORDER, formatDateTime } from "./printTokens";

export interface PharmacyBillPrintHeaderProps {
    /** Controls the bill-type badge label. Pass `customBillType` to override. */
    isReceipt: boolean;
    /** Override the auto badge text (e.g. "Final Bill", "Advance Receipt") */
    customBillType?: string;
    /** Label shown below the bill type. Pass empty string to hide. Default: "DUPLICATE COPY" */
    copyLabel?: string;
    patientName?: string;
    opNo?: string;
    tokenNo?: number;
    billDisplay: string;
    dateTime: string;
    userName: string;
    /** IP-specific fields — only rendered when provided */
    ipNo?: string;
    admittedAt?: string;
    admittedDoctor?: string;
    admittedWard?: string;
    /** Extra rows to show in the patient info column, e.g. [["Ward", "B-12"]] */
    extraPatientRows?: [string, string][];
    /** Extra rows to show in the bill info column, e.g. [["IP No", "IP-001"]] */
    extraBillRows?: [string, string][];
}

interface OrgData {
    name: string;
    code: string;
    address: string;
    phoneNo: string;
    salesTax: string;
}

const PharmacyBillPrintHeader: React.FC<PharmacyBillPrintHeaderProps> = ({
    isReceipt,
    customBillType,
    copyLabel = "DUPLICATE COPY",
    patientName,
    opNo,
    tokenNo = 0,
    billDisplay,
    dateTime,
    userName,
    ipNo,
    admittedAt,
    admittedDoctor,
    admittedWard,
    extraPatientRows = [],
    extraBillRows = [],
}) => {
    const [orgData, setOrgData] = useState<OrgData>({
        name: "",
        code: "",
        address: "",
        phoneNo: "",
        salesTax: "",
    });

    useEffect(() => {
        const appApi = new AppApiService();
        appApi.fetchOrganizationDetails()
            .then((data: any) => {
                if (data) {
                    setOrgData({
                        name: data.name || "",
                        code: data.code || "",
                        address: data.address || "",
                        phoneNo: data.phoneNo || "",
                        salesTax: data.salesTax || "",
                    });
                }
            })
            .catch(() => {});
    }, []);

    const badgeLabel = customBillType ?? (isReceipt ? "RECEIPT" : "Return Bill");

    const organization = {
        name: orgData.name,
        code: orgData.code,
        address: orgData.address,
        phone: orgData.phoneNo,
    };

    const gstNumber = orgData.salesTax || undefined;

    return (
        <>
            {/* ── Organisation header (logo + name + address + phone + salesTax) ── */}
            <PrintHeader organization={organization} gstNumber={gstNumber} />

            {/* ── Bill type title ── */}
            <div
                style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    gap: "8px",
                    margin: "4px 0 6px",
                    padding: "3px 0",
                }}
            >
                <span
                    style={{
                        fontSize: "0.62rem",
                        fontWeight: 700,
                        letterSpacing: "2px",
                        textTransform: "uppercase",
                        color: "#0f172a",
                    }}
                >
                    {badgeLabel}
                </span>

            </div>

            {/* ── Patient + Bill Info ── */}
            {(() => {
                const patientFields: [string, string][] = [
                    ["Patient",  patientName || "N/A"],
                    ["OP No",    opNo        || "N/A"],

                    ...(ipNo           ? [["IP No",    ipNo]                      ] as [string,string][] : []),
                    ...(admittedAt     ? [["Admitted", formatDateTime(admittedAt)] ] as [string,string][] : []),
                    ...(admittedDoctor ? [["Doctor",   admittedDoctor]             ] as [string,string][] : []),
                    ...(admittedWard   ? [["Ward",     admittedWard]               ] as [string,string][] : []),
                    ...extraPatientRows,
                ];

                const billFields: [string, string][] = [
                    ["Date",    formatDateTime(dateTime)],
                    ["Cashier", userName],
                    ...extraBillRows,
                ];

                const allFields = [...patientFields, ...billFields];

                const Field = ({ label, value }: { label: string; value: string }) => (
                    <div style={{ display: "flex", alignItems: "baseline", gap: "0", marginBottom: "3px" }}>
                        <span style={{
                            fontSize: "0.58rem",
                            fontWeight: 600,
                            color: "#171a1e",
                            textTransform: "uppercase",
                            letterSpacing: "0.5px",
                            flexShrink: 0,
                            width: "46px",
                        }}>
                            {label}
                        </span>
                        <span style={{ fontSize: "0.58rem", color: "#64748b", marginRight: "3px", flexShrink: 0 }}>:</span>
                        <span style={{ fontSize: "0.62rem", fontWeight: 700, color: "#0f172a", lineHeight: 1.2 }}>
                            {value}
                        </span>
                    </div>
                );

                return (
                    <div
                        style={{
                            display: "grid",
                            gridTemplateColumns: "1fr 1fr 1fr",
                            columnGap: "10px",
                            borderTop: "1px solid #000",
                            padding: "5px 10px",
                            marginBottom: "8px",
                        }}
                    >
                        {allFields.map(([label, value]) => (
                            <Field key={label} label={label} value={value} />
                        ))}
                    </div>
                );
            })()}
        </>
    );
};

export default PharmacyBillPrintHeader;
