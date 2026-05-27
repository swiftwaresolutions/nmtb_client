import React, { useState, useMemo } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  Row,
  Col,
  Spinner,
  Modal,
  Table,
  Nav,
} from "react-bootstrap";
import ReportHeader from "../../../medical-records/components/ReportHeader";
import ReportKPICard from "../../../medical-records/components/ReportKPICard";
import {
  searchTableData,
  exportToExcel,
  printReport,
  formatReportDate,
  getDateRangeText,
} from "../../../medical-records/utils/reportUtils";
import "../../../medical-records/styles/reportStyles.css";
import { showValidationError } from "../../../utils/alertUtil";

// ─── Types ───────────────────────────────────────────────────────────────────
interface AllMedItem {
  slNo: number;
  medicineName: string;
  units: number;
  batchNo: string;
  expiry: string;
  total: number;
  mfg: string;
  mrp: number;
}

interface AllMedBill {
  id: number;
  billNo: string;
  doctor: string;
  opNo: string;
  patientName: string;
  billDate: string;
  items: AllMedItem[];
}

interface ScheduleMedRow {
  id: number;
  billNo: string;
  patientName: string;
  doctorName: string;
  medicineName: string;
  batchNo: string;
  expiryDate: string;
  qty: number;
  companyName: string;
  billDate: string;
  type: string;
}

// ─── Demo Data ────────────────────────────────────────────────────────────────
const ALL_MED_DEMO: AllMedBill[] = [
  {
    id: 1, billNo: "PH-2025-0101", doctor: "Dr. Rajesh Kumar", opNo: "OP-2025-1011",
    patientName: "Arun Prasad", billDate: "03/03/2025",
    items: [
      { slNo: 1, medicineName: "Paracetamol 500mg", units: 10, batchNo: "B001", expiry: "06/2026", total: 47.50, mfg: "Cipla", mrp: 5.00 },
      { slNo: 2, medicineName: "Amoxicillin 500mg", units: 6, batchNo: "B045", expiry: "12/2025", total: 57.00, mfg: "Sun Pharma", mrp: 10.00 },
    ],
  },
  {
    id: 2, billNo: "PH-2025-0102", doctor: "Dr. Meena Kumari", opNo: "OP-2025-1022",
    patientName: "Saranya Devi", billDate: "05/03/2025",
    items: [
      { slNo: 1, medicineName: "Metformin 500mg", units: 30, batchNo: "M012", expiry: "09/2026", total: 90.00, mfg: "Zydus", mrp: 3.00 },
      { slNo: 2, medicineName: "Amlodipine 5mg", units: 30, batchNo: "AM031", expiry: "08/2026", total: 165.00, mfg: "Cipla", mrp: 5.50 },
      { slNo: 3, medicineName: "Atorvastatin 10mg", units: 30, batchNo: "AT018", expiry: "01/2027", total: 240.00, mfg: "Sun Pharma", mrp: 8.00 },
    ],
  },
  {
    id: 3, billNo: "PH-2025-0103", doctor: "Dr. Suresh Babu", opNo: "IP-2025-3011",
    patientName: "Ravi Shankar", billDate: "07/03/2025",
    items: [
      { slNo: 1, medicineName: "Ceftriaxone 1g Inj.", units: 5, batchNo: "CF022", expiry: "12/2026", total: 600.00, mfg: "Aurobindo", mrp: 120.00 },
      { slNo: 2, medicineName: "Pantoprazole 40mg", units: 10, batchNo: "PZ008", expiry: "07/2026", total: 90.00, mfg: "Dr. Reddy's", mrp: 9.00 },
    ],
  },
  {
    id: 4, billNo: "PH-2025-0104", doctor: "Dr. Rajesh Kumar", opNo: "OP-2025-1045",
    patientName: "Kavitha Moorthy", billDate: "09/03/2025",
    items: [
      { slNo: 1, medicineName: "Dolo 650mg", units: 10, batchNo: "D012", expiry: "02/2026", total: 70.00, mfg: "Micro Labs", mrp: 7.00 },
      { slNo: 2, medicineName: "Cetirizine 10mg", units: 10, batchNo: "CZ005", expiry: "06/2026", total: 50.00, mfg: "Cipla", mrp: 5.00 },
    ],
  },
  {
    id: 5, billNo: "PH-2025-0105", doctor: "Dr. Anitha Krishnan", opNo: "OP-2025-2033",
    patientName: "Muthu Kumar", billDate: "11/03/2025",
    items: [
      { slNo: 1, medicineName: "Azithromycin 500mg", units: 5, batchNo: "AZ007", expiry: "10/2025", total: 80.00, mfg: "Sun Pharma", mrp: 16.00 },
      { slNo: 2, medicineName: "Ibuprofen 400mg", units: 10, batchNo: "IB003", expiry: "04/2026", total: 60.00, mfg: "Cipla", mrp: 6.00 },
      { slNo: 3, medicineName: "Omeprazole 20mg", units: 10, batchNo: "OM009", expiry: "11/2025", total: 70.00, mfg: "Zydus", mrp: 7.00 },
    ],
  },
  {
    id: 6, billNo: "PH-2025-0106", doctor: "Dr. Meena Kumari", opNo: "OP-2025-3055",
    patientName: "Balamurugan S", billDate: "13/03/2025",
    items: [
      { slNo: 1, medicineName: "Lisinopril 10mg", units: 30, batchNo: "LS007", expiry: "05/2027", total: 210.00, mfg: "Lupin", mrp: 7.00 },
      { slNo: 2, medicineName: "Aspirin 75mg", units: 30, batchNo: "AS019", expiry: "03/2027", total: 60.00, mfg: "Bayer", mrp: 2.00 },
    ],
  },
];

const SCHEDULE_MED_DEMO: ScheduleMedRow[] = [
  { id: 1, billNo: "SCH-2025-0201", patientName: "Balamurugan S", doctorName: "Dr. K. Ramesh", medicineName: "Morphine Sulphate 10mg", batchNo: "SCH001", expiryDate: "06/2026", qty: 5, companyName: "Ranbaxy", billDate: "03/03/2025", type: "H" },
  { id: 2, billNo: "SCH-2025-0202", patientName: "Meena Selvam", doctorName: "Dr. Priya Nair", medicineName: "Tramadol HCl 50mg", batchNo: "SCH002", expiryDate: "09/2026", qty: 10, companyName: "Sun Pharma", billDate: "03/03/2025", type: "H" },
  { id: 3, billNo: "SCH-2025-0203", patientName: "Ragini Pillai", doctorName: "Dr. K. Ramesh", medicineName: "Codeine Phosphate 30mg", batchNo: "SCH003", expiryDate: "12/2025", qty: 20, companyName: "Cipla", billDate: "05/03/2025", type: "H" },
  { id: 4, billNo: "SCH-2025-0204", patientName: "Arun Kumar", doctorName: "Dr. Suresh Babu", medicineName: "Alprazolam 0.5mg", batchNo: "SCH101", expiryDate: "08/2026", qty: 15, companyName: "Pfizer", billDate: "07/03/2025", type: "H1" },
  { id: 5, billNo: "SCH-2025-0205", patientName: "Kavitha Pillai", doctorName: "Dr. Meena Kumari", medicineName: "Diazepam 5mg", batchNo: "SCH102", expiryDate: "05/2026", qty: 10, companyName: "Cipla", billDate: "09/03/2025", type: "H1" },
  { id: 6, billNo: "SCH-2025-0206", patientName: "Ravi Shankar", doctorName: "Dr. Rajesh Kumar", medicineName: "Clonazepam 0.5mg", batchNo: "SCH103", expiryDate: "07/2026", qty: 30, companyName: "Roche", billDate: "09/03/2025", type: "H1" },
  { id: 7, billNo: "SCH-2025-0207", patientName: "Suresh Babu", doctorName: "Dr. Anitha Krishnan", medicineName: "Buprenorphine 2mg", batchNo: "SCH201", expiryDate: "10/2026", qty: 5, companyName: "Sun Pharma", billDate: "11/03/2025", type: "Other" },
  { id: 8, billNo: "SCH-2025-0208", patientName: "Anitha Devi", doctorName: "Dr. Priya Nair", medicineName: "Pentazocine 50mg Inj.", batchNo: "SCH202", expiryDate: "04/2026", qty: 3, companyName: "Ranbaxy", billDate: "12/03/2025", type: "Other" },
];
// ─────────────────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
  n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

type TabKey = "all" | "schedule";

const TYPE_BADGE: Record<string, React.CSSProperties> = {
  H:     { background: "#fff3cd", color: "#664d03" },
  H1:    { background: "#cff4fc", color: "#055160" },
  Other: { background: "#d1e7dd", color: "#0a3622" },
};

export default function PhPrescriptionRegister() {
  const today = new Date().toISOString().split("T")[0];
  const [activeTab, setActiveTab] = useState<TabKey>("all");

  // ─── Tab 1: All Medicine ────────────────────────────────────────────────────
  const [allFromDate, setAllFromDate] = useState(today);
  const [allToDate, setAllToDate] = useState(today);
  const [allBills, setAllBills] = useState<AllMedBill[]>(ALL_MED_DEMO);
  const [allSearchTerm, setAllSearchTerm] = useState("");
  const [allLoading, setAllLoading] = useState(false);
  const [allSubmitted, setAllSubmitted] = useState(true);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState<AllMedBill | null>(null);

  // ─── Tab 2: Schedule Medicine ───────────────────────────────────────────────
  const nowDT = (() => {
    const n = new Date();
    const pad = (x: number) => String(x).padStart(2, "0");
    return `${today}T${pad(n.getHours())}:${pad(n.getMinutes())}`;
  })();
  const [schFromDateTime, setSchFromDateTime] = useState(nowDT);
  const [schToDateTime, setSchToDateTime] = useState(nowDT);
  const [schType, setSchType] = useState("2");
  const [schPrintType, setSchPrintType] = useState("2");
  const [schPageLimit, setSchPageLimit] = useState("0");
  const [schRows, setSchRows] = useState<ScheduleMedRow[]>(SCHEDULE_MED_DEMO);
  const [schSearchTerm, setSchSearchTerm] = useState("");
  const [schLoading, setSchLoading] = useState(false);
  const [schSubmitted, setSchSubmitted] = useState(true);

  // ─── Computed ───────────────────────────────────────────────────────────────
  const filteredAllBills = useMemo(() => {
    if (!allSearchTerm) return allBills;
    const term = allSearchTerm.toLowerCase();
    return allBills.filter(
      (b) =>
        b.billNo.toLowerCase().includes(term) ||
        b.doctor.toLowerCase().includes(term) ||
        b.opNo.toLowerCase().includes(term) ||
        b.patientName.toLowerCase().includes(term) ||
        b.items.some(
          (i) =>
            i.medicineName.toLowerCase().includes(term) ||
            i.mfg.toLowerCase().includes(term) ||
            i.batchNo.toLowerCase().includes(term)
        )
    );
  }, [allBills, allSearchTerm]);

  const filteredSchRows = useMemo(() => {
    if (!schSearchTerm) return schRows;
    return searchTableData(schRows, schSearchTerm, [
      "billNo", "patientName", "doctorName", "medicineName", "batchNo", "companyName", "type",
    ]);
  }, [schRows, schSearchTerm]);

  const allStats = useMemo(
    () => ({
      totalBills: allBills.length,
      totalItems: allBills.reduce((s, b) => s + b.items.length, 0),
      grandTotal: allBills.reduce(
        (s, b) => s + b.items.reduce((ss, i) => ss + i.total, 0),
        0
      ),
    }),
    [allBills]
  );

  const schStats = useMemo(
    () => ({
      totalRecords: schRows.length,
      totalQty: schRows.reduce((s, r) => s + r.qty, 0),
    }),
    [schRows]
  );

  const isSubmitted = activeTab === "all" ? allSubmitted : schSubmitted;
  const subtitle =
    activeTab === "all"
      ? allSubmitted
        ? getDateRangeText(allFromDate, allToDate)
        : "Select date range and click Submit"
      : schSubmitted
      ? getDateRangeText(schFromDateTime.split("T")[0], schToDateTime.split("T")[0])
      : "Select date range and click Submit";

  // ─── Handlers ───────────────────────────────────────────────────────────────
  const handleTabChange = (k: string | null) => {
    if (!k) return;
    setActiveTab(k as TabKey);
    setAllSearchTerm("");
    setSchSearchTerm("");
  };

  const handleAllSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!allFromDate || !allToDate) {
      showValidationError("Please select both From Date and To Date.", "Validation");
      return;
    }
    if (allFromDate > allToDate) {
      showValidationError("From Date cannot be later than To Date.", "Validation");
      return;
    }
    setAllLoading(true);
    setAllSubmitted(false);
    setTimeout(() => {
      setAllBills(ALL_MED_DEMO);
      setAllSubmitted(true);
      setAllLoading(false);
    }, 600);
  };

  const handleAllReset = () => {
    setAllFromDate(today);
    setAllToDate(today);
    setAllBills([]);
    setAllSearchTerm("");
    setAllSubmitted(false);
  };

  const handleSchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!schFromDateTime || !schToDateTime) {
      showValidationError("Please select both From Date and To Date.", "Validation");
      return;
    }
    if (schFromDateTime > schToDateTime) {
      showValidationError("From Date/Time cannot be later than To Date/Time.", "Validation");
      return;
    }
    setSchLoading(true);
    setSchSubmitted(false);
    setTimeout(() => {
      const typeMap: Record<string, string> = { "1": "H1", "2": "H", "3": "Other" };
      const filtered = SCHEDULE_MED_DEMO.filter((r) => r.type === typeMap[schType]);
      setSchRows(filtered);
      setSchSubmitted(true);
      setSchLoading(false);
    }, 600);
  };

  const handleSchReset = () => {
    const n = new Date();
    const pad = (x: number) => String(x).padStart(2, "0");
    const dt = `${today}T${pad(n.getHours())}:${pad(n.getMinutes())}`;
    setSchFromDateTime(dt);
    setSchToDateTime(dt);
    setSchType("2");
    setSchPrintType("2");
    setSchPageLimit("0");
    setSchRows([]);
    setSchSearchTerm("");
    setSchSubmitted(false);
  };

  const handleExport = () => {
    if (activeTab === "all") {
      const rows: any[] = [];
      filteredAllBills.forEach((b, bi) => {
        b.items.forEach((item, ii) => {
          rows.push({
            "S. No": ii === 0 ? bi + 1 : "",
            "Bill No": ii === 0 ? b.billNo : "",
            Doctor: ii === 0 ? b.doctor : "",
            "OP. No.": ii === 0 ? b.opNo : "",
            "Patient Name": ii === 0 ? b.patientName : "",
            "Medicine Name": item.medicineName,
            Units: item.units,
            "Batch No": item.batchNo,
            Expiry: item.expiry,
            "Total (Rs.)": item.total.toFixed(2),
            Mfg: item.mfg,
          });
        });
      });
      exportToExcel(
        rows,
        `Prescription_Register_${formatReportDate(new Date(), "DD-MM-YYYY")}`,
        "Prescription Register"
      );
    } else {
      const rows = filteredSchRows.map((r, i) => ({
        "S. No": i + 1,
        "Bill No": r.billNo,
        "Patient Name": r.patientName,
        "Doctor Name": r.doctorName,
        "Medicine Name": r.medicineName,
        "Batch No": r.batchNo,
        "Expiry Date": r.expiryDate,
        Qty: r.qty,
        "Company Name": r.companyName,
        Date: r.billDate,
        Type: r.type,
      }));
      exportToExcel(
        rows,
        `Schedule_Prescription_Register_${formatReportDate(new Date(), "DD-MM-YYYY")}`,
        "Schedule Prescription Register"
      );
    }
  };

  const handleSearch = (term: string) => {
    if (activeTab === "all") setAllSearchTerm(term);
    else setSchSearchTerm(term);
  };

  // ─────────────────────────────────────────────────────────────────────────────
  return (
    <React.Fragment>
      <Container fluid className="px-4 py-3">
        <ReportHeader
          key={activeTab}
          title="Prescription Register"
          subtitle={subtitle}
          onPrint={printReport}
          onExport={handleExport}
          onSearch={handleSearch}
          showSearch={isSubmitted}
          showSort={false}
          showPrint={isSubmitted}
          showExport={isSubmitted}
        />

        {/* ─── Tab Strip ─────────────────────────────────────────────────────── */}
        <Nav
          variant="tabs"
          activeKey={activeTab}
          onSelect={handleTabChange}
          className="no-print mb-0"
        >
          <Nav.Item>
            <Nav.Link eventKey="all" style={{ fontWeight: "var(--font-weight-medium)" }}>
              All Medicine
            </Nav.Link>
          </Nav.Item>
          <Nav.Item>
            <Nav.Link eventKey="schedule" style={{ fontWeight: "var(--font-weight-medium)" }}>
              Schedule Medicine
            </Nav.Link>
          </Nav.Item>
        </Nav>

        {/* ─── Tab 1: All Medicine ──────────────────────────────────────────── */}
        {activeTab === "all" && (
          <>
            <Card className="mb-4 shadow-sm no-print" style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
              <Card.Body>
                <Form className="row g-3 align-items-end" onSubmit={handleAllSubmit}>
                  <Form.Group as={Col} md={4} controlId="allFromDate">
                    <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>From Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={allFromDate}
                      onChange={(e) => setAllFromDate(e.target.value)}
                      max={today}
                      lang="en-CA"
                      required
                    />
                  </Form.Group>
                  <Form.Group as={Col} md={4} controlId="allToDate">
                    <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>To Date</Form.Label>
                    <Form.Control
                      type="date"
                      value={allToDate}
                      onChange={(e) => setAllToDate(e.target.value)}
                      max={today}
                      lang="en-CA"
                      required
                    />
                  </Form.Group>
                  <Form.Group as={Col} md={4} className="d-flex align-items-end gap-2">
                    <Button type="submit" variant="primary" className="w-50" disabled={allLoading}>
                      {allLoading ? "Loading..." : "Submit"}
                    </Button>
                    <Button type="button" variant="secondary" className="w-50" onClick={handleAllReset}>
                      Reset
                    </Button>
                  </Form.Group>
                </Form>
              </Card.Body>
            </Card>

            {allSubmitted && (
              <Row className="mb-4">
                <Col md={4}>
                  <ReportKPICard label="Total Bills" value={allStats.totalBills} variant="primary" />
                </Col>
                <Col md={4}>
                  <ReportKPICard label="Total Medicine Items" value={allStats.totalItems} variant="info" />
                </Col>
                <Col md={4}>
                  <ReportKPICard label="Grand Total (Rs.)" value={`₹ ${fmt(allStats.grandTotal)}`} variant="success" />
                </Col>
              </Row>
            )}

            {allLoading ? (
              <div className="text-center py-5 text-muted">
                <Spinner animation="border" role="status" />
                <div className="mt-3">Loading prescription register...</div>
              </div>
            ) : (
              <Card className="report-card" style={{ padding: "0.75rem" }}>
                <div
                  style={{
                    maxHeight: "calc(115vh - 500px)",
                    minHeight: "350px",
                    overflowY: "auto",
                    overflowX: "auto",
                    position: "relative",
                  }}
                >
                  <Table bordered size="sm" className="mb-0" style={{ minWidth: "950px" }}>
                    <thead className="table-dark">
                      <tr>
                        <th className="text-center" style={{ width: "5%", whiteSpace: "nowrap" }}>S. No</th>
                        <th style={{ width: "10%", whiteSpace: "nowrap" }}>Bill No</th>
                        <th style={{ width: "15%", whiteSpace: "nowrap" }}>Doctor</th>
                        <th style={{ width: "10%", whiteSpace: "nowrap" }}>OP. No.</th>
                        <th style={{ width: "13%", whiteSpace: "nowrap" }}>Patient Name</th>
                        <th style={{ width: "22%", whiteSpace: "nowrap" }}>Medicine Name</th>
                        <th className="text-center" style={{ width: "5%", whiteSpace: "nowrap" }}>Units</th>
                        <th style={{ width: "8%", whiteSpace: "nowrap" }}>Batch No</th>
                        <th style={{ width: "6%", whiteSpace: "nowrap" }}>Expiry</th>
                        <th className="text-end" style={{ width: "7%", whiteSpace: "nowrap" }}>Total</th>
                        <th style={{ width: "9%", whiteSpace: "nowrap" }}>Mfg</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredAllBills.length === 0 ? (
                        <tr>
                          <td colSpan={11} className="text-center py-4 text-muted">
                            {!allSubmitted
                              ? "No data loaded. Please select date range and click Submit."
                              : allSearchTerm
                              ? "No records match your search criteria."
                              : "No records found."}
                          </td>
                        </tr>
                      ) : (
                        filteredAllBills.map((bill, bIdx) =>
                          bill.items.map((item, iIdx) => (
                            <tr
                              key={`${bill.id}-${item.slNo}`}
                              style={{ background: bIdx % 2 === 0 ? "#f8f9fa" : "#ffffff" }}
                            >
                              {iIdx === 0 ? (
                                <>
                                  <td className="text-center" style={{ fontWeight: "var(--font-weight-medium)" }}>
                                    {bIdx + 1}
                                  </td>
                                  <td>
                                    <span
                                      style={{
                                        color: "var(--bs-primary, #0d6efd)",
                                        cursor: "pointer",
                                        fontWeight: "var(--font-weight-semibold)",
                                        textDecoration: "underline",
                                      }}
                                      onClick={() => {
                                        setSelectedBill(bill);
                                        setShowDetailModal(true);
                                      }}
                                    >
                                      {bill.billNo}
                                    </span>
                                  </td>
                                  <td>{bill.doctor}</td>
                                  <td>{bill.opNo}</td>
                                  <td style={{ fontWeight: "var(--font-weight-medium)" }}>{bill.patientName}</td>
                                </>
                              ) : (
                                <>
                                  <td></td>
                                  <td></td>
                                  <td></td>
                                  <td></td>
                                  <td></td>
                                </>
                              )}
                              <td>{item.medicineName}</td>
                              <td className="text-center">{item.units}</td>
                              <td>{item.batchNo}</td>
                              <td>{item.expiry}</td>
                              <td className="text-end">{fmt(item.total)}</td>
                              <td>{item.mfg}</td>
                            </tr>
                          ))
                        )
                      )}
                    </tbody>
                  </Table>
                </div>
                <div
                  style={{
                    padding: "0.5rem 1rem",
                    borderTop: "2px solid #e0e0e0",
                    background: "linear-gradient(to right, #f8f9fa, #ffffff)",
                    textAlign: "start",
                  }}
                >
                  <small className="text-muted" style={{ fontWeight: "var(--font-weight-medium)" }}>
                    Total Bills: <strong>{filteredAllBills.length}</strong>
                    {allSearchTerm && (
                      <span className="ms-2">(Filtered from {allBills.length})</span>
                    )}
                  </small>
                </div>
              </Card>
            )}
          </>
        )}

        {/* ─── Tab 2: Schedule Medicine ─────────────────────────────────────── */}
        {activeTab === "schedule" && (
          <>
            <Card className="mb-4 shadow-sm no-print" style={{ borderTopLeftRadius: 0, borderTopRightRadius: 0 }}>
              <Card.Body>
                <Form onSubmit={handleSchSubmit}>
                  <Row className="g-3 align-items-end">
                    {/* Date From + time (datetime-local) */}
                    <Form.Group as={Col} md={12} lg={5} controlId="schFromDateTime">
                      <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>
                        Date From
                      </Form.Label>
                      <Form.Control
                        type="datetime-local"
                        value={schFromDateTime}
                        onChange={(e) => setSchFromDateTime(e.target.value)}
                        required
                      />
                    </Form.Group>

                    {/* Date To + time (datetime-local) */}
                    <Form.Group as={Col} md={12} lg={5} controlId="schToDateTime">
                      <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>
                        Date To
                      </Form.Label>
                      <Form.Control
                        type="datetime-local"
                        value={schToDateTime}
                        onChange={(e) => setSchToDateTime(e.target.value)}
                        required
                      />
                    </Form.Group>

                    {/* Select Type */}
                    <Form.Group as={Col} md={4} lg={2} controlId="schType">
                      <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>Select Type</Form.Label>
                      <Form.Select value={schType} onChange={(e) => setSchType(e.target.value)}>
                        <option value="2">H</option>
                        <option value="1">H1</option>
                        <option value="3">Other</option>
                      </Form.Select>
                    </Form.Group>
                  </Row>

                  <Row className="g-3 align-items-end mt-1">
                    {/* Select Print Type */}
                    <Form.Group as={Col} md={4} lg={3} controlId="schPrintType">
                      <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>Select Print Type</Form.Label>
                      <Form.Select value={schPrintType} onChange={(e) => setSchPrintType(e.target.value)}>
                        <option value="2">Select</option>
                        <option value="1">ODD</option>
                        <option value="0">EVEN</option>
                      </Form.Select>
                    </Form.Group>

                    {/* Page Limit */}
                    <Form.Group as={Col} md={4} lg={3} controlId="schPageLimit">
                      <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>Page Limit</Form.Label>
                      <Form.Control
                        type="number"
                        min="0"
                        value={schPageLimit}
                        onChange={(e) => setSchPageLimit(e.target.value)}
                        placeholder="0"
                      />
                    </Form.Group>

                    {/* Buttons */}
                    <Col md={4} lg={3} className="d-flex align-items-end gap-2">
                      <Button type="submit" variant="primary" className="w-50" disabled={schLoading}>
                        {schLoading ? "Loading..." : "Submit"}
                      </Button>
                      <Button type="button" variant="secondary" className="w-50" onClick={handleSchReset}>
                        Reset
                      </Button>
                    </Col>
                  </Row>
                </Form>
              </Card.Body>
            </Card>

            {schSubmitted && (
              <Row className="mb-4">
                <Col md={6}>
                  <ReportKPICard label="Total Records" value={schStats.totalRecords} variant="primary" />
                </Col>
                <Col md={6}>
                  <ReportKPICard label="Total Quantity" value={schStats.totalQty} variant="info" />
                </Col>
              </Row>
            )}

            {schLoading ? (
              <div className="text-center py-5 text-muted">
                <Spinner animation="border" role="status" />
                <div className="mt-3">Loading schedule prescription register...</div>
              </div>
            ) : (
              <Card className="report-card" style={{ padding: "0.75rem" }}>
                <div
                  style={{
                    maxHeight: "calc(115vh - 500px)",
                    minHeight: "350px",
                    overflowY: "auto",
                    overflowX: "auto",
                    position: "relative",
                  }}
                >
                  <Table bordered size="sm" className="mb-0" style={{ minWidth: "950px" }}>
                    <thead className="table-dark">
                      <tr>
                        <th className="text-center" style={{ width: "5%", whiteSpace: "nowrap" }}>S. No</th>
                        <th style={{ width: "11%", whiteSpace: "nowrap" }}>Bill No</th>
                        <th style={{ width: "13%", whiteSpace: "nowrap" }}>Patient Name</th>
                        <th style={{ width: "15%", whiteSpace: "nowrap" }}>Doctor Name</th>
                        <th style={{ width: "22%", whiteSpace: "nowrap" }}>Medicine Name</th>
                        <th style={{ width: "9%", whiteSpace: "nowrap" }}>Batch No</th>
                        <th style={{ width: "8%", whiteSpace: "nowrap" }}>Expiry Date</th>
                        <th className="text-center" style={{ width: "5%", whiteSpace: "nowrap" }}>Qty</th>
                        <th style={{ width: "14%", whiteSpace: "nowrap" }}>Company Name</th>
                        <th className="text-center" style={{ width: "8%", whiteSpace: "nowrap" }}>Type</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredSchRows.length === 0 ? (
                        <tr>
                          <td colSpan={10} className="text-center py-4 text-muted">
                            {!schSubmitted
                              ? "No data loaded. Please select date range and click Submit."
                              : schSearchTerm
                              ? "No records match your search criteria."
                              : "No records found."}
                          </td>
                        </tr>
                      ) : (
                        filteredSchRows.map((row, idx) => (
                          <tr
                            key={row.id}
                            style={{ background: idx % 2 === 0 ? "#f8f9fa" : "#ffffff" }}
                          >
                            <td className="text-center">{idx + 1}</td>
                            <td
                              style={{
                                fontWeight: "var(--font-weight-semibold)",
                                color: "var(--bs-primary, #0d6efd)",
                              }}
                            >
                              {row.billNo}
                            </td>
                            <td style={{ fontWeight: "var(--font-weight-medium)" }}>{row.patientName}</td>
                            <td>{row.doctorName}</td>
                            <td>{row.medicineName}</td>
                            <td>{row.batchNo}</td>
                            <td>{row.expiryDate}</td>
                            <td className="text-center">{row.qty}</td>
                            <td>{row.companyName}</td>
                            <td className="text-center">
                              <span
                                style={{
                                  ...TYPE_BADGE[row.type],
                                  padding: "2px 8px",
                                  borderRadius: "4px",
                                  fontSize: "var(--font-size-xs)",
                                  fontWeight: "var(--font-weight-semibold)",
                                }}
                              >
                                {row.type}
                              </span>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </div>
                <div
                  style={{
                    padding: "0.5rem 1rem",
                    borderTop: "2px solid #e0e0e0",
                    background: "linear-gradient(to right, #f8f9fa, #ffffff)",
                    textAlign: "start",
                  }}
                >
                  <small className="text-muted" style={{ fontWeight: "var(--font-weight-medium)" }}>
                    Total Data Rows: <strong>{filteredSchRows.length}</strong>
                    {schSearchTerm && (
                      <span className="ms-2">(Filtered from {schRows.length})</span>
                    )}
                  </small>
                </div>
              </Card>
            )}
          </>
        )}
      </Container>

      {/* ─── Bill Detail Modal (All Medicine tab) ─────────────────────────── */}
      <Modal show={showDetailModal} onHide={() => setShowDetailModal(false)} size="lg" centered>
        <Modal.Header closeButton style={{ borderBottom: "2px solid #dee2e6" }}>
          <Modal.Title
            style={{
              fontSize: "var(--font-size-lg)",
              fontWeight: "var(--font-weight-semibold)",
            }}
          >
            Bill / Receipt
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: "1.25rem" }}>
          {selectedBill && (
            <>
              {/* Hospital Header */}
              <div
                className="text-center mb-3 pb-2"
                style={{ borderBottom: "2px solid #dee2e6" }}
              >
                <div
                  style={{
                    fontSize: "var(--font-size-xl)",
                    fontWeight: "var(--font-weight-bold)",
                    letterSpacing: "0.5px",
                  }}
                >
                  NIGHTINGALE
                </div>
                <div style={{ fontSize: "var(--font-size-sm)", color: "#555" }}>
                  Batlagundu-624 202, Dindigul District.
                </div>
                <div style={{ fontSize: "var(--font-size-sm)", color: "#000080" }}>
                  Phone: 04543-262 670 &nbsp;&nbsp; E-Mail: holyleonard@bsnl.in
                </div>
              </div>

              {/* Bill Meta */}
              <div
                className="mb-3 p-3"
                style={{
                  background: "#f8f9fa",
                  borderRadius: "6px",
                  border: "1px solid #dee2e6",
                }}
              >
                <Row className="g-2">
                  <Col md={6}>
                    <span style={{ fontSize: "var(--font-size-sm)" }}>OP Number :&nbsp;</span>
                    <span style={{ fontWeight: "var(--font-weight-medium)", color: "#000080" }}>
                      {selectedBill.opNo}
                    </span>
                  </Col>
                  <Col md={6}>
                    <span style={{ fontSize: "var(--font-size-sm)" }}>Patient Name :&nbsp;</span>
                    <span style={{ fontWeight: "var(--font-weight-medium)", color: "#000080" }}>
                      {selectedBill.patientName}
                    </span>
                  </Col>
                  <Col md={6}>
                    <span style={{ fontSize: "var(--font-size-sm)" }}>Bill No :&nbsp;</span>
                    <span style={{ fontWeight: "var(--font-weight-semibold)", color: "#000080" }}>
                      {selectedBill.billNo}
                    </span>
                  </Col>
                  <Col md={6}>
                    <span style={{ fontSize: "var(--font-size-sm)" }}>Doctor :&nbsp;</span>
                    <span style={{ fontWeight: "var(--font-weight-medium)", color: "#000080" }}>
                      {selectedBill.doctor}
                    </span>
                  </Col>
                </Row>
              </div>

              {/* Items Table */}
              <Table bordered size="sm" className="mb-0">
                <thead className="table-dark">
                  <tr>
                    <th className="text-center" style={{ width: "8%" }}>S. No.</th>
                    <th style={{ width: "45%" }}>Medicine Name</th>
                    <th className="text-center" style={{ width: "17%" }}>Batch</th>
                    <th className="text-center" style={{ width: "15%" }}>Expiry Date</th>
                    <th className="text-end" style={{ width: "15%" }}>M. R. P</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedBill.items.map((item) => (
                    <tr key={item.slNo}>
                      <td className="text-center">{item.slNo}</td>
                      <td>{item.medicineName}</td>
                      <td className="text-center">{item.batchNo}</td>
                      <td className="text-center">{item.expiry}</td>
                      <td className="text-end">{fmt(item.mrp)}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowDetailModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </React.Fragment>
  );
}
