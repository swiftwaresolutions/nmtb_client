import React, { useState } from "react";
import { Button, Card, Col, Form, Row, Table } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileInvoiceDollar, faSearch, faFileExcel } from "@fortawesome/free-solid-svg-icons";
import { showValidationError, showErrorToast } from "../../../../../utils/alertUtil";
import CentralStoresApiService, { Gstr3BPerWiseSummary } from "../../../../../api/central-stores/central-stores-api-service";

// ─── Types ────────────────────────────────────────────────────────────────────

interface GstrReportData {
  fromDate: string;
  toDate: string;
  taxable: number;
  cgstAmt: number;
  sgstAmt: number;
  igstAmt: number;
  outwardNil: number;
  itcTaxable: number;
  itcCgst: number;
  itcSgst: number;
  itcIgst: number;
  itcNonEligibleTaxable: number;
  itcNonEligibleCgst: number;
  itcNonEligibleSgst: number;
  itcNonEligibleIgst: number;
  perWiseSummary: Gstr3BPerWiseSummary[];
}

interface ReturnGSTData {
  cGst : number;
  sGst : number;
  iGst : number
}

// ─── Style helpers ────────────────────────────────────────────────────────────

const thStyle: React.CSSProperties = {
  background: "var(--color-table-header, #cce5ff)",
  fontWeight: "var(--font-weight-semibold)" as any,
  fontSize: "var(--font-size-sm)" as any,
  whiteSpace: "nowrap" as any,
  textAlign: "center",
};

const sectionHeaderStyle: React.CSSProperties = {
  background: "var(--color-table-header, #e8f4fd)",
  fontWeight: "var(--font-weight-semibold)" as any,
  fontSize: "var(--font-size-sm)" as any,
};

const totalRowStyle: React.CSSProperties = {
  fontWeight: "var(--font-weight-semibold)" as any,
  background: "var(--color-table-header, #f1f5f9)",
  fontSize: "var(--font-size-sm)" as any,
};

const normalCellStyle: React.CSSProperties = {
  fontSize: "var(--font-size-sm)" as any,
};

// ─── Format helpers ───────────────────────────────────────────────────────────

const fmt = (val?: number | null) =>
  val != null ? val.toFixed(2) : "";

const formatDisplayDate = (iso: string) => {
  if (!iso) return "";
  const [y, m, d] = iso.split("-");
  return `${d}-${m}-${y}`;
};

const apiService = new CentralStoresApiService();

// ─── Component ────────────────────────────────────────────────────────────────

const today = new Date().toISOString().split("T")[0];

export default function Gstr3B() {
  const [fromDate, setFromDate] = useState<string>(today);
  const [toDate, setToDate] = useState<string>(today);
  const [reportData, setReportData] = useState<GstrReportData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [ITCCgst, setITCCgst] = useState<number>(0);
  const [ITCSgst, setITCSgst] = useState<number>(0);
  const [ITCTaxableValue, setITCTaxableValue] = useState<number>(0);
  const [purchaseTax, setPurchaseTax] = useState<number>(0);
  const [PayableGst, setPayableGst] = useState<number>(0);
  const [salesReturnGst , setSalesReturnGst] = useState<ReturnGSTData>({cGst : 0 , sGst : 0 , iGst : 0})
  const [totalReturnTaxableValue , setTotalReturnTaxableValue] = useState<number>(0);

  const handleShow = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromDate || !toDate) {
      showValidationError("Please select both From and To dates.");
      return;
    }
    if (new Date(fromDate) > new Date(toDate)) {
      showValidationError("From date cannot be later than To date.");
      return;
    }
    setIsLoading(true);
    try {
      const res = await apiService.fetchGstr3bDetails(fromDate, toDate);
      setReportData({
        fromDate,
        toDate,
        taxable: res.outwardTaxableSupplies.taxable,
        cgstAmt: res.outwardTaxableSupplies.cgstAmt,
        sgstAmt: res.outwardTaxableSupplies.sgstAmt,
        igstAmt: res.outwardTaxableSupplies.igstAmt,
        outwardNil: res.outwardNil,
        itcTaxable: res.itcOthers.taxable,
        itcCgst: res.itcOthers.cgstAmt,
        itcSgst: res.itcOthers.sgstAmt,
        itcIgst: res.itcOthers.igstAmt,
        itcNonEligibleTaxable: res.itcNonEligible.taxable,
        itcNonEligibleCgst: res.itcNonEligible.cgstAmt,
        itcNonEligibleSgst: res.itcNonEligible.sgstAmt,
        itcNonEligibleIgst: res.itcNonEligible.igstAmt,
        perWiseSummary: res.perWiseSummary ?? [],
      });
      computeITCIPIneligibility(res);
    } catch {
      showErrorToast("Failed to fetch GSTR 3B details.");
    } finally {
      setIsLoading(false);
    }
  };

  const computeITCIPIneligibility = (res: Awaited<ReturnType<typeof apiService.fetchGstr3bDetails>>) => {
    const itcNonEligibleTaxable = res.itcNonEligible.taxable ?? 0;
    const itcNonEligibleCgst = res.itcNonEligible.cgstAmt ?? 0;
    const itcNonEligibleSgst = res.itcNonEligible.sgstAmt ?? 0;
    const itcNonEligibleIgst = res.itcNonEligible.igstAmt ?? 0;
    const totalReturn = res.salesReturn.reduce((acc, curr) => acc + (curr.taxableValue ?? 0), 0);
    const totalExempted = itcNonEligibleTaxable + itcNonEligibleCgst + itcNonEligibleSgst + itcNonEligibleIgst;
    const totalSales = (res.outwardTaxableSupplies.taxable ?? 0) + (res.outwardNil ?? 0);
    const grossSales = (res.outwardTaxableSupplies.taxable ?? 0) + itcNonEligibleTaxable - totalReturn;
    const percentIneligible = grossSales > 0 ? Number(((itcNonEligibleTaxable / grossSales) * 100).toFixed(6)) : 0;
    const purchaseTax = (res.itcOthers.cgstAmt ?? 0) + (res.itcOthers.sgstAmt ?? 0) + (res.itcOthers.igstAmt ?? 0);
    const ITCIneligibility = purchaseTax * (percentIneligible / 100);
    const taxableValueIneligibility = res.itcOthers.taxable * (percentIneligible / 100);  
    setITCCgst(ITCIneligibility / 2);
    setITCSgst(ITCIneligibility / 2);
    setITCTaxableValue(taxableValueIneligibility);
    setPurchaseTax(purchaseTax);
    const ITCTaken = purchaseTax-taxableValueIneligibility;
    const salesGST = (res.outwardTaxableSupplies.cgstAmt ?? 0) + (res.outwardTaxableSupplies.sgstAmt ?? 0) + (res.outwardTaxableSupplies.igstAmt ?? 0);
    const salesReturnGST = res.salesReturn.reduce((acc, curr) => acc + (curr.cgstAmt ?? 0) + (curr.sgstAmt ?? 0) + (curr.igstAmt ?? 0), 0); 
    const salesReturnCGST = res.salesReturn.reduce((acc, curr) => acc + (curr.cgstAmt ?? 0), 0); 
    const salesReturnSGST = res.salesReturn.reduce((acc, curr) => acc + (curr.sgstAmt ?? 0) , 0); 
    const salesReturnIGST = res.salesReturn.reduce((acc, curr) => acc + (curr.igstAmt ?? 0), 0); 
    console.log("cgst"+ salesReturnCGST)
    console.log("Sgst"+ salesReturnSGST)
    console.log("Igst"+ salesReturnIGST)
    console.log("totalReturn "+ totalReturn)
    const netGST = salesGST - salesReturnGST;
    const payableGST = netGST - ITCTaken;
    setPayableGst(payableGST);
    setSalesReturnGst((prev: ReturnGSTData) => ({...prev, cGst : salesReturnCGST , sGst : salesReturnSGST , iGst : salesReturnIGST}))
    setTotalReturnTaxableValue(totalReturn)

  };

  const handleReset = () => {
    setFromDate(today);
    setToDate(today);
    setReportData(null);
    setITCCgst(0);
    setITCSgst(0);
    setITCTaxableValue(0);
    setPurchaseTax(0);
  };

  return (
    <div style={{ padding: "1.25rem", height: "100%", overflowY: "auto" }}>
      {/* ── Filter Card ── */}
      <Card className="shadow-sm mb-3">
        <Card.Header
          style={{
            background: "var(--color-primary, #0d6efd)",
            color: "#fff",
            fontWeight: "var(--font-weight-semibold)" as any,
            fontSize: "var(--font-size-md)" as any,
          }}
        >
          <FontAwesomeIcon icon={faFileInvoiceDollar} className="me-2" />
          GSTR 3B Details
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleShow}>
            <Row className="align-items-end g-3">
              <Col md={3} sm={6}>
                <Form.Group>
                  <Form.Label
                    style={{
                      fontWeight: "var(--font-weight-medium)" as any,
                      fontSize: "var(--font-size-sm)" as any,
                    }}
                  >
                    From Date
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    style={{ fontSize: "var(--font-size-sm)" as any }}
                  />
                </Form.Group>
              </Col>
              <Col md={3} sm={6}>
                <Form.Group>
                  <Form.Label
                    style={{
                      fontWeight: "var(--font-weight-medium)" as any,
                      fontSize: "var(--font-size-sm)" as any,
                    }}
                  >
                    To Date
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    style={{ fontSize: "var(--font-size-sm)" as any }}
                  />
                </Form.Group>
              </Col>
              <Col md="auto">
                <Button
                  type="submit"
                  variant="primary"
                  disabled={isLoading}
                  style={{ fontSize: "var(--font-size-sm)" as any }}
                >
                  <FontAwesomeIcon icon={faSearch} className="me-1" />
                  {isLoading ? "Loading..." : "Show"}
                </Button>
                <Button
                  type="button"
                  variant="outline-secondary"
                  className="ms-2"
                  onClick={handleReset}
                  style={{ fontSize: "var(--font-size-sm)" as any }}
                >
                  Reset
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {/* ── Report ── */}
      {reportData && (
        <Card className="shadow-sm">
          <Card.Body style={{ padding: "1rem" }}>
            {/* Title */}
            <div className="text-center mb-2">
              <div
                style={{
                  fontSize: "var(--font-size-sm)" as any,
                  fontWeight: "var(--font-weight-semibold)" as any,
                  color: "#c0392b",
                }}
              >
                GSTR 3B DETAILS BETWEEN{" "}
                <span style={{ color: "#c0392b" }}>
                  &apos;{formatDisplayDate(reportData.fromDate)}&apos;
                </span>{" "}
                AND{" "}
                <span style={{ color: "#c0392b" }}>
                  &apos;{formatDisplayDate(reportData.toDate)}&apos;
                </span>
              </div>
            </div>

            {/* Hospital Name */}
            <div
              className="text-center mb-3"
              style={{
                fontWeight: "var(--font-weight-bold)" as any,
                fontSize: "var(--font-size-lg)" as any,
                letterSpacing: "0.05em",
              }}
            >
              NIGHTINGALE
            </div>

            {/* ── Main GSTR table ── */}
            <div style={{ overflowX: "auto", marginBottom: "1.5rem" }}>
              <Table
                bordered
                size="sm"
                className="mb-0"
                style={{ fontSize: "var(--font-size-sm)" as any }}
              >
                <thead>
                  <tr>
                    <th style={{ ...thStyle, width: "60px" }}>S.No</th>
                    <th style={thStyle}>Particulars</th>
                    <th style={{ ...thStyle, width: "140px", textAlign: "right" }}>Taxable Value</th>
                    <th style={{ ...thStyle, width: "120px", textAlign: "right" }}>CGST</th>
                    <th style={{ ...thStyle, width: "120px", textAlign: "right" }}>SGST</th>
                    <th style={{ ...thStyle, width: "120px", textAlign: "right" }}>IGST</th>
                  </tr>
                </thead>
                <tbody>
                  {/* Section A - Tax Liability */}
                  <tr style={sectionHeaderStyle}>
                    <td style={{ ...sectionHeaderStyle, textAlign: "center" }}>(A)</td>
                    <td colSpan={5} style={sectionHeaderStyle}>Computation of Tax Liability</td>
                  </tr>
                  <tr>
                    <td style={{ ...normalCellStyle, textAlign: "center" }}>1</td>
                    <td style={normalCellStyle}>Outward Taxable Supplies - Intra state</td>
                    <td style={{ ...normalCellStyle, textAlign: "right" }}>{fmt(reportData.taxable - totalReturnTaxableValue)}</td>
                    <td style={{ ...normalCellStyle, textAlign: "right" }}>{fmt(reportData.cgstAmt - salesReturnGst.cGst)}</td>
                    <td style={{ ...normalCellStyle, textAlign: "right" }}>{fmt(reportData.sgstAmt - salesReturnGst.sGst)}</td>
                    <td style={{ ...normalCellStyle, textAlign: "right" }}>{fmt(reportData.igstAmt - salesReturnGst.iGst)}</td>
                  </tr>
                  <tr>
                    <td style={{ ...normalCellStyle, textAlign: "center" }}>2</td>
                    <td style={normalCellStyle}>Outward Taxable Supplies - Inter Co</td>
                    <td /><td /><td /><td />
                  </tr>
                  <tr>
                    <td style={{ ...normalCellStyle, textAlign: "center" }}>3</td>
                    <td style={normalCellStyle}>Outward Taxable Supplies - Inter State</td>
                    <td /><td /><td /><td />
                  </tr>
                  <tr>
                    <td style={{ ...normalCellStyle, textAlign: "center" }}>4</td>
                    <td style={normalCellStyle}>Outward - Zero rated</td>
                    <td /><td /><td /><td />
                  </tr>
                  <tr>
                    <td style={{ ...normalCellStyle, textAlign: "center" }}>5</td>
                    <td style={normalCellStyle}>Outward - Nil or Exempt</td>
                    <td style={{ ...normalCellStyle, textAlign: "right" }}>{fmt(reportData.outwardNil)}</td>
                    <td /><td /><td />
                  </tr>
                  <tr>
                    <td style={{ ...normalCellStyle, textAlign: "center" }}>6</td>
                    <td style={normalCellStyle}>Inward supplies - RCM</td>
                    <td /><td /><td /><td />
                  </tr>
                  <tr>
                    <td />
                    <td style={{ ...normalCellStyle, paddingLeft: "2rem" }}>Imports</td>
                    <td /><td /><td /><td />
                  </tr>
                  <tr>
                    <td />
                    <td style={{ ...normalCellStyle, paddingLeft: "2rem" }}>Domestic - Inter State</td>
                    <td /><td /><td /><td />
                  </tr>
                  <tr>
                    <td />
                    <td style={{ ...normalCellStyle, paddingLeft: "2rem" }}>Domestic - Intra state</td>
                    <td /><td /><td /><td />
                  </tr>
                  <tr style={totalRowStyle}>
                    <td />
                    <td style={totalRowStyle}>Total tax liability</td>
                    <td style={{ ...totalRowStyle, textAlign: "right" }}>{fmt((reportData.taxable ?? 0) + (reportData.itcNonEligibleTaxable ?? 0) - totalReturnTaxableValue)}</td>
                    <td style={{ ...totalRowStyle, textAlign: "right" }}>{fmt(reportData.cgstAmt - salesReturnGst.cGst )}</td>
                    <td style={{ ...totalRowStyle, textAlign: "right" }}>{fmt(reportData.sgstAmt - salesReturnGst.sGst)}</td>
                    <td style={{ ...totalRowStyle, textAlign: "right" }}>{fmt(reportData.igstAmt - salesReturnGst.iGst)}</td>
                  </tr>

                  {/* Section B - ITC */}
                  <tr style={sectionHeaderStyle}>
                    <td style={{ ...sectionHeaderStyle, textAlign: "center" }}>(B)</td>
                    <td colSpan={5} style={sectionHeaderStyle}>Computation of ITC on Inward supplies</td>
                  </tr>
                  {[
                    { sNo: "5", label: "Opening Balance of ITC" },
                    { sNo: "6", label: "ITC-Import of goods" },
                    { sNo: "7", label: "ITC-Import of services" },
                    { sNo: "8", label: "ITC-Other RCM" },
                    { sNo: "9", label: "ITC-ISD" },
                  ].map((row) => (
                    <tr key={row.sNo}>
                      <td style={{ ...normalCellStyle, textAlign: "center" }}>{row.sNo}</td>
                      <td style={normalCellStyle}>{row.label}</td>
                      <td /><td /><td /><td />
                    </tr>
                  ))}
                  <tr>
                    <td style={{ ...normalCellStyle, textAlign: "center" }}>10</td>
                    <td style={normalCellStyle}>ITC Others</td>
                    <td style={{ ...normalCellStyle, textAlign: "right" }}>{fmt(reportData.itcTaxable)}</td>
                    <td style={{ ...normalCellStyle, textAlign: "right" }}>{fmt(reportData.itcCgst)}</td>
                    <td style={{ ...normalCellStyle, textAlign: "right" }}>{fmt(reportData.itcSgst)}</td>
                    <td style={{ ...normalCellStyle, textAlign: "right" }}>{fmt(reportData.itcIgst)}</td>
                  </tr>
                  <tr>
                    <td style={{ ...normalCellStyle, textAlign: "center" }}>11</td>
                    <td style={{ ...normalCellStyle, fontWeight: "bold" }}>ITC Available</td>
                    <td />
                    <td style={{ ...normalCellStyle, textAlign: "right" }}>{fmt(reportData.itcCgst)}</td>
                    <td style={{ ...normalCellStyle, textAlign: "right" }}>{fmt(reportData.itcSgst)}</td>
                    <td style={{ ...normalCellStyle, textAlign: "right" }}>{fmt(reportData.itcIgst)}</td>
                  </tr>
                  <tr><td colSpan={6} style={{ padding: "4px" }} /></tr>
                  <tr>
                    <td style={{ ...normalCellStyle, textAlign: "center" }}>12</td>
                    <td style={normalCellStyle}>ITC Non-eligible</td>
                    <td style={{ ...normalCellStyle, textAlign: "right" }}>{fmt(reportData.itcNonEligibleTaxable)}</td>
                    <td style={{ ...normalCellStyle, textAlign: "right" }}>{fmt(reportData.itcNonEligibleCgst)}</td>
                    <td style={{ ...normalCellStyle, textAlign: "right" }}>{fmt(reportData.itcNonEligibleSgst)}</td>
                    <td style={{ ...normalCellStyle, textAlign: "right" }}>{fmt(reportData.itcNonEligibleIgst)}</td>
                  </tr>
                  <tr>
                    <td style={{ ...normalCellStyle, textAlign: "center" }}>13</td>
                    <td style={normalCellStyle}>ITC IP ineligibility</td>
                    <td style={{ ...normalCellStyle, textAlign: "right" }}>{fmt(ITCTaxableValue)}</td>
                    <td style={{ ...normalCellStyle, textAlign: "right" }}>{fmt(ITCCgst)}</td>
                    <td style={{ ...normalCellStyle, textAlign: "right" }}>{fmt(ITCSgst)}</td>
                    <td />
                  </tr>
                  <tr style={totalRowStyle}>
                    <td />
                    <td style={totalRowStyle}>Net ITC Available</td>
                    <td style={{ ...totalRowStyle, textAlign: "right" }}>{fmt((reportData.itcTaxable ?? 0) - ITCTaxableValue)}</td>
                    <td style={{ ...totalRowStyle, textAlign: "right" }}>{fmt((reportData.itcCgst ?? 0) - ITCCgst)}</td>
                    <td style={{ ...totalRowStyle, textAlign: "right" }}>{fmt((reportData.itcSgst ?? 0) - ITCSgst)}</td>
                    <td style={{ ...totalRowStyle, textAlign: "right" }}>{fmt(reportData.itcIgst ?? 0)}</td>
                  </tr>
                  <tr><td colSpan={6} style={{ padding: "4px" }} /></tr>
                  <tr>
                    <td />
                    <td style={normalCellStyle}>Liability Payable in cash</td>
                    <td /><td /><td /><td />
                  </tr>
                  <tr><td colSpan={6} style={{ padding: "4px" }} /></tr>
                  <tr>
                    <td />
                    <td style={normalCellStyle}>GST Payable in Hospital </td>
                    <td style={{ ...normalCellStyle, textAlign: "right" }}>
                      {fmt(PayableGst)}
                    </td>
                    <td /><td /><td />
                  </tr>
                  <tr><td colSpan={6} style={{ padding: "4px" }} /></tr>
                  <tr>
                    <td />
                    <td style={normalCellStyle}>Total input</td>
                    <td /><td /><td /><td />
                  </tr>
                </tbody>
              </Table>
            </div>

            {/* ── Tax Breakdown Table ── */}
            <div style={{ overflowX: "auto", marginBottom: "1.5rem" }}>
              <Table
                bordered
                size="sm"
                className="mb-0"
                style={{ fontSize: "var(--font-size-sm)" as any }}
              >
                <thead>
                  <tr>
                    <th style={{ background: "#2c3e50", color: "#fff", fontWeight: "var(--font-weight-semibold)" as any, fontSize: "var(--font-size-sm)" as any, whiteSpace: "nowrap" as any, textAlign: "center", width: "120px" }}>Tax%</th>
                    <th style={{ background: "#2c3e50", color: "#fff", fontWeight: "var(--font-weight-semibold)" as any, fontSize: "var(--font-size-sm)" as any, textAlign: "right" as any }}>Taxable Value</th>
                    <th style={{ background: "#2c3e50", color: "#fff", fontWeight: "var(--font-weight-semibold)" as any, fontSize: "var(--font-size-sm)" as any, width: "130px", textAlign: "right" as any }}>CGST</th>
                    <th style={{ background: "#2c3e50", color: "#fff", fontWeight: "var(--font-weight-semibold)" as any, fontSize: "var(--font-size-sm)" as any, width: "130px", textAlign: "right" as any }}>SGST</th>
                    <th style={{ background: "#2c3e50", color: "#fff", fontWeight: "var(--font-weight-semibold)" as any, fontSize: "var(--font-size-sm)" as any, width: "140px", textAlign: "right" as any }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {reportData.perWiseSummary.map((row) => (
                    <tr key={row.totalTaxPer}>
                      <td style={{ ...normalCellStyle, textAlign: "right" }}>{row.totalTaxPer.toFixed(2)}</td>
                      <td style={{ ...normalCellStyle, textAlign: "right" }}>{fmt(row.taxable)}</td>
                      <td style={{ ...normalCellStyle, textAlign: "right" }}>{fmt(row.sgstAmt)}</td>
                      <td style={{ ...normalCellStyle, textAlign: "right" }}>{fmt(row.cgstAmt)}</td>
                      <td style={{ ...normalCellStyle, textAlign: "right" }}>{fmt((row.taxable ?? 0) + (row.cgstAmt ?? 0) + (row.sgstAmt ?? 0) + (row.igstAmt ?? 0))}</td>
                    </tr>
                  ))}
                  <tr>
                    <td style={{ ...normalCellStyle, textAlign: "right" }}>Exempt</td>
                    <td style={{ ...normalCellStyle, textAlign: "right" }}>{fmt(reportData.outwardNil)}</td>
                    <td /><td /><td />
                  </tr>
                  <tr style={totalRowStyle}>
                    <td style={{ ...totalRowStyle, textAlign: "right" }}>Grand Total</td>
                    <td style={{ ...totalRowStyle, textAlign: "right" }}>{fmt((reportData.taxable ?? 0) + (reportData.outwardNil ?? 0))}</td>
                    <td style={{ ...totalRowStyle, textAlign: "right" }}>{fmt(reportData.sgstAmt)}</td>
                    <td style={{ ...totalRowStyle, textAlign: "right" }}>{fmt(reportData.cgstAmt)}</td>
                    <td style={{ ...totalRowStyle, textAlign: "right" }}>{fmt((reportData.taxable ?? 0) + (reportData.outwardNil ?? 0) + (reportData.cgstAmt ?? 0) + (reportData.sgstAmt ?? 0) + (reportData.igstAmt ?? 0))}</td>
                  </tr>
                </tbody>
              </Table>
            </div>

            {/* ── B2C Summary Table ── */}
            <div style={{ overflowX: "auto", marginBottom: "1rem" }}>
              <Table
                bordered
                size="sm"
                className="mb-0"
                style={{ fontSize: "var(--font-size-sm)" as any }}
              >
                <tbody>
                  <tr>
                    <td style={{ ...normalCellStyle, width: "200px", textAlign: "right" }}>B2C - Taxable</td>
                    <td style={{ ...normalCellStyle, textAlign: "right" }}>{fmt(reportData.taxable)}</td>
                    <td style={{ ...normalCellStyle, textAlign: "right" }}>{fmt(reportData.sgstAmt)}</td>
                    <td style={{ ...normalCellStyle, textAlign: "right" }}>{fmt(reportData.cgstAmt)}</td>
                    <td style={{ ...normalCellStyle, textAlign: "right" }}>{fmt((reportData.taxable ?? 0) + (reportData.cgstAmt ?? 0) + (reportData.sgstAmt ?? 0) + (reportData.igstAmt ?? 0))}</td>
                  </tr>
                  <tr>
                    <td style={{ ...normalCellStyle, textAlign: "right" }}>B2C - Exempt</td>
                    <td style={{ ...normalCellStyle, textAlign: "right" }}>{fmt(reportData.outwardNil)}</td>
                    <td /><td />
                    <td style={{ ...normalCellStyle, textAlign: "right" }}>{fmt(reportData.outwardNil)}</td>
                  </tr>
                  <tr style={totalRowStyle}>
                    <td style={{ ...totalRowStyle, textAlign: "right" }}>Grand Total</td>
                    <td style={{ ...totalRowStyle, textAlign: "right" }}>{fmt((reportData.taxable ?? 0) + (reportData.outwardNil ?? 0))}</td>
                    <td style={{ ...totalRowStyle, textAlign: "right" }}>{fmt(reportData.sgstAmt)}</td>
                    <td style={{ ...totalRowStyle, textAlign: "right" }}>{fmt(reportData.cgstAmt)}</td>
                    <td style={{ ...totalRowStyle, textAlign: "right" }}>{fmt((reportData.taxable ?? 0) + (reportData.outwardNil ?? 0) + (reportData.cgstAmt ?? 0) + (reportData.sgstAmt ?? 0) + (reportData.igstAmt ?? 0))}</td>
                  </tr>
                </tbody>
              </Table>
            </div>
            <div
              style={{
                fontSize: "var(--font-size-sm)" as any,
                marginBottom: "0.25rem",
              }}
            >
              {(() => {
                const grandTaxable = (reportData.taxable ?? 0) + (reportData.outwardNil ?? 0);
                const salesPercent = grandTaxable > 0 ? ((reportData.taxable / grandTaxable) * 100).toFixed(2) : "100.00";
                const ipPercent = grandTaxable > 0 ? ((reportData.outwardNil / grandTaxable) * 100).toFixed(2) : "0.00";
                return <>{salesPercent} % OPSales &nbsp;&nbsp; {ipPercent} % IPSales</>;
              })()}
            </div>
            <div
              style={{
                fontSize: "var(--font-size-sm)" as any,
                marginBottom: "0.5rem",
              }}
            >
              Date between &apos;{formatDisplayDate(reportData.fromDate)}&apos; and &apos;{formatDisplayDate(reportData.toDate)}&apos;
              &nbsp;&nbsp;Tax Amount: Rs. {fmt(
                PayableGst
              )}
            </div>

            {/* ── Export button ── */}
            <div className="text-center">
              <Button
                variant="success"
                style={{ fontSize: "var(--font-size-sm)" as any }}
              >
                <FontAwesomeIcon icon={faFileExcel} className="me-2" />
                Export to Excel
              </Button>
            </div>
          </Card.Body>
        </Card>
      )}
    </div>
  );
}
