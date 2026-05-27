import React, { useState } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  Row,
  Col,
  Table,
  Badge,
  Modal,
} from "react-bootstrap";
import ReportHeader from "../../../medical-records/components/ReportHeader";
import {
  printReport,
  exportToExcel,
  formatReportDate,
} from "../../../medical-records/utils/reportUtils";
import { showValidationError } from "../../../utils/alertUtil";
import "../../../medical-records/styles/reportStyles.css";

// ─── Data models ──────────────────────────────────────────────────────────────

interface InvItem {
  slNo: number;
  particulars: string;
  rate: number;
}
interface InvBill {
  id: number;
  billNo: string;
  date: string;
  time: string;
  items: InvItem[];
  total: number;
  disc: number;
  pay: number;
  paid: number;
  bal: number;
}

interface PhItem {
  slNo: number;
  medName: string;
  batch: string;
  mrp: number;
  quantity: number;
  rate: number;
}
interface PhBill {
  id: number;
  billNo: string;
  date: string;
  time: string;
  items: PhItem[];
  total: number;
  disc: number;
  pay: number;
  paid: number;
  bal: number;
  retTotal: number;
  retPay: number;
  retPaid: number;
  totBal: number;
}

interface PhRetBill {
  id: number;
  billNo: string;
  date: string;
  time: string;
  items: PhItem[];
  total: number;
  disc: number;
  pay: number;
  paid: number;
  bal: number;
}

interface LabItem {
  slNo: number;
  testName: string;
  rate: number;
}
interface LabBill {
  id: number;
  billNo: string;
  date: string;
  time: string;
  items: LabItem[];
  total: number;
  disc: number;
  pay: number;
  paid: number;
  bal: number;
}

interface DueBill {
  id: number;
  billNo: string;
  date: string;
  time: string;
  total: number;
  paid: number;
}

interface PatientRecord {
  patientName: string;
  opNo: string;
  age: number;
  sex: "Male" | "Female";
  invBills: InvBill[];
  phBills: PhBill[];
  phRetBills: PhRetBill[];
  labBills: LabBill[];
  dueBills: DueBill[];
  invPay: number;
  pharPay: number;
  pharRetPaid: number;
  labPay: number;
  duePay: number;
  netPay: number;
}

// ─── Demo data ────────────────────────────────────────────────────────────────

const DEMO_RECORDS: Record<string, PatientRecord> = {
  "OP-2026-0341": {
    patientName: "Anitha Kumari",
    opNo: "OP-2026-0341",
    age: 42,
    sex: "Female",
    invBills: [
      {
        id: 1,
        billNo: "INV-1001",
        date: "10-03-2026",
        time: "09:15 AM",
        items: [
          { slNo: 1, particulars: "Consultation Fee", rate: 200 },
          { slNo: 2, particulars: "ECG", rate: 300 },
        ],
        total: 500,
        disc: 50,
        pay: 450,
        paid: 450,
        bal: 0,
      },
    ],
    phBills: [
      {
        id: 1,
        billNo: "PH-1021",
        date: "10-03-2026",
        time: "09:45 AM",
        items: [
          { slNo: 1, medName: "Metformin 500mg", batch: "MF221", mrp: 45, quantity: 30, rate: 1260 },
          { slNo: 2, medName: "Amlodipine 5mg", batch: "AM331", mrp: 12, quantity: 30, rate: 330 },
        ],
        total: 1590,
        disc: 0,
        pay: 1590,
        paid: 1590,
        bal: 0,
        retTotal: 330,
        retPay: 330,
        retPaid: 330,
        totBal: 1260,
      },
    ],
    phRetBills: [
      {
        id: 1,
        billNo: "PHR-0101",
        date: "11-03-2026",
        time: "10:00 AM",
        items: [
          { slNo: 1, medName: "Amlodipine 5mg", batch: "AM331", mrp: 12, quantity: 30, rate: 330 },
        ],
        total: 330,
        disc: 0,
        pay: 330,
        paid: 330,
        bal: 0,
      },
    ],
    labBills: [],
    dueBills: [],
    invPay: 450,
    pharPay: 1590,
    pharRetPaid: 330,
    labPay: 0,
    duePay: 0,
    netPay: 1710,
  },
  "OP-2026-0342": {
    patientName: "Suresh Babu",
    opNo: "OP-2026-0342",
    age: 55,
    sex: "Male",
    invBills: [],
    phBills: [
      {
        id: 2,
        billNo: "PH-1022",
        date: "11-03-2026",
        time: "10:10 AM",
        items: [
          { slNo: 1, medName: "Atorvastatin 10mg", batch: "AT101", mrp: 25, quantity: 30, rate: 675 },
          { slNo: 2, medName: "Aspirin 75mg", batch: "AS222", mrp: 5, quantity: 30, rate: 135 },
          { slNo: 3, medName: "Losartan 50mg", batch: "LO441", mrp: 18, quantity: 28, rate: 470 },
        ],
        total: 1280,
        disc: 80,
        pay: 1200,
        paid: 600,
        bal: 600,
        retTotal: 0,
        retPay: 0,
        retPaid: 0,
        totBal: 600,
      },
    ],
    phRetBills: [],
    labBills: [
      {
        id: 1,
        billNo: "LAB-2041",
        date: "11-03-2026",
        time: "10:30 AM",
        items: [
          { slNo: 1, testName: "Complete Blood Count", rate: 250 },
          { slNo: 2, testName: "Lipid Profile", rate: 400 },
          { slNo: 3, testName: "HbA1c", rate: 350 },
        ],
        total: 1000,
        disc: 100,
        pay: 900,
        paid: 900,
        bal: 0,
      },
    ],
    dueBills: [],
    invPay: 0,
    pharPay: 1200,
    pharRetPaid: 0,
    labPay: 900,
    duePay: 0,
    netPay: 2100,
  },
  "OP-2026-0345": {
    patientName: "Kavitha Nair",
    opNo: "OP-2026-0345",
    age: 35,
    sex: "Female",
    invBills: [
      {
        id: 3,
        billNo: "INV-1005",
        date: "12-03-2026",
        time: "09:20 AM",
        items: [
          { slNo: 1, particulars: "Consultation Fee", rate: 300 },
        ],
        total: 300,
        disc: 0,
        pay: 300,
        paid: 300,
        bal: 0,
      },
    ],
    phBills: [
      {
        id: 4,
        billNo: "PH-1025",
        date: "12-03-2026",
        time: "10:00 AM",
        items: [
          { slNo: 1, medName: "Folic Acid 5mg", batch: "FA881", mrp: 4, quantity: 30, rate: 90 },
          { slNo: 2, medName: "Iron Sucrose", batch: "IS991", mrp: 85, quantity: 5, rate: 400 },
        ],
        total: 490,
        disc: 0,
        pay: 490,
        paid: 490,
        bal: 0,
        retTotal: 0,
        retPay: 0,
        retPaid: 0,
        totBal: 0,
      },
    ],
    phRetBills: [],
    labBills: [
      {
        id: 2,
        billNo: "LAB-2045",
        date: "12-03-2026",
        time: "10:20 AM",
        items: [
          { slNo: 1, testName: "Haemoglobin", rate: 100 },
          { slNo: 2, testName: "Blood Group & Rh Type", rate: 150 },
        ],
        total: 250,
        disc: 0,
        pay: 250,
        paid: 250,
        bal: 0,
      },
    ],
    dueBills: [
      { id: 1, billNo: "DUE-0055", date: "12-03-2026", time: "11:00 AM", total: 150, paid: 150 },
    ],
    invPay: 300,
    pharPay: 490,
    pharRetPaid: 0,
    labPay: 250,
    duePay: 150,
    netPay: 1190,
  },
  "OP-2026-0350": {
    patientName: "Mohammed Iqbal",
    opNo: "OP-2026-0350",
    age: 63,
    sex: "Male",
    invBills: [
      {
        id: 5,
        billNo: "INV-1010",
        date: "13-03-2026",
        time: "08:45 AM",
        items: [
          { slNo: 1, particulars: "Consultation Fee", rate: 300 },
          { slNo: 2, particulars: "Dressing", rate: 150 },
          { slNo: 3, particulars: "Injection Administration", rate: 100 },
        ],
        total: 550,
        disc: 50,
        pay: 500,
        paid: 500,
        bal: 0,
      },
    ],
    phBills: [
      {
        id: 5,
        billNo: "PH-1030",
        date: "13-03-2026",
        time: "09:15 AM",
        items: [
          { slNo: 1, medName: "Amoxicillin 500mg", batch: "AX553", mrp: 22, quantity: 21, rate: 420 },
          { slNo: 2, medName: "Ibuprofen 400mg", batch: "IB772", mrp: 8, quantity: 20, rate: 150 },
          { slNo: 3, medName: "Pantoprazole 40mg", batch: "PT662", mrp: 15, quantity: 14, rate: 190 },
        ],
        total: 760,
        disc: 0,
        pay: 760,
        paid: 760,
        bal: 0,
        retTotal: 0,
        retPay: 0,
        retPaid: 0,
        totBal: 0,
      },
    ],
    phRetBills: [],
    labBills: [
      {
        id: 3,
        billNo: "LAB-2050",
        date: "13-03-2026",
        time: "09:30 AM",
        items: [
          { slNo: 1, testName: "Blood Urea", rate: 180 },
          { slNo: 2, testName: "Serum Creatinine", rate: 200 },
          { slNo: 3, testName: "Random Blood Sugar", rate: 120 },
        ],
        total: 500,
        disc: 0,
        pay: 500,
        paid: 500,
        bal: 0,
      },
    ],
    dueBills: [],
    invPay: 500,
    pharPay: 760,
    pharRetPaid: 0,
    labPay: 500,
    duePay: 0,
    netPay: 1760,
  },
  "OP-2026-0351": {
    patientName: "Priya Sharma",
    opNo: "OP-2026-0351",
    age: 29,
    sex: "Female",
    invBills: [
      {
        id: 6,
        billNo: "INV-1011",
        date: "13-03-2026",
        time: "10:00 AM",
        items: [
          { slNo: 1, particulars: "Consultation Fee", rate: 200 },
          { slNo: 2, particulars: "Ultrasound Obstetric", rate: 900 },
        ],
        total: 1100,
        disc: 100,
        pay: 1000,
        paid: 1000,
        bal: 0,
      },
    ],
    phBills: [
      {
        id: 6,
        billNo: "PH-1031",
        date: "13-03-2026",
        time: "10:45 AM",
        items: [
          { slNo: 1, medName: "Folic Acid 5mg", batch: "FA881", mrp: 4, quantity: 90, rate: 270 },
          { slNo: 2, medName: "Calcium + Vit D3", batch: "CA330", mrp: 12, quantity: 60, rate: 660 },
          { slNo: 3, medName: "Iron Sucrose 100mg", batch: "IS991", mrp: 85, quantity: 3, rate: 240 },
        ],
        total: 1170,
        disc: 170,
        pay: 1000,
        paid: 500,
        bal: 500,
        retTotal: 0,
        retPay: 0,
        retPaid: 0,
        totBal: 500,
      },
    ],
    phRetBills: [],
    labBills: [
      {
        id: 4,
        billNo: "LAB-2051",
        date: "13-03-2026",
        time: "11:00 AM",
        items: [
          { slNo: 1, testName: "Complete Blood Count", rate: 250 },
          { slNo: 2, testName: "Blood Glucose (F)", rate: 120 },
          { slNo: 3, testName: "Urine Routine", rate: 150 },
        ],
        total: 520,
        disc: 20,
        pay: 500,
        paid: 500,
        bal: 0,
      },
    ],
    dueBills: [],
    invPay: 1000,
    pharPay: 1000,
    pharRetPaid: 0,
    labPay: 500,
    duePay: 0,
    netPay: 2500,
  },
  "OP-2026-0355": {
    patientName: "Venkatesh Rao",
    opNo: "OP-2026-0355",
    age: 58,
    sex: "Male",
    invBills: [
      {
        id: 7,
        billNo: "INV-1015",
        date: "12-03-2026",
        time: "11:30 AM",
        items: [
          { slNo: 1, particulars: "Consultation Fee", rate: 300 },
          { slNo: 2, particulars: "ECG", rate: 300 },
          { slNo: 3, particulars: "2D Echo", rate: 1500 },
        ],
        total: 2100,
        disc: 100,
        pay: 2000,
        paid: 2000,
        bal: 0,
      },
    ],
    phBills: [
      {
        id: 7,
        billNo: "PH-1035",
        date: "12-03-2026",
        time: "12:10 PM",
        items: [
          { slNo: 1, medName: "Atorvastatin 20mg", batch: "AT201", mrp: 30, quantity: 30, rate: 810 },
          { slNo: 2, medName: "Metoprolol 25mg", batch: "MT551", mrp: 18, quantity: 60, rate: 990 },
          { slNo: 3, medName: "Aspirin 75mg", batch: "AS222", mrp: 5, quantity: 30, rate: 135 },
          { slNo: 4, medName: "Ramipril 5mg", batch: "RM661", mrp: 22, quantity: 30, rate: 600 },
        ],
        total: 2535,
        disc: 135,
        pay: 2400,
        paid: 1200,
        bal: 1200,
        retTotal: 0,
        retPay: 0,
        retPaid: 0,
        totBal: 1200,
      },
    ],
    phRetBills: [],
    labBills: [
      {
        id: 5,
        billNo: "LAB-2055",
        date: "12-03-2026",
        time: "12:30 PM",
        items: [
          { slNo: 1, testName: "Lipid Profile", rate: 400 },
          { slNo: 2, testName: "HbA1c", rate: 350 },
          { slNo: 3, testName: "Troponin I", rate: 800 },
          { slNo: 4, testName: "ECG Interpretation", rate: 200 },
        ],
        total: 1750,
        disc: 250,
        pay: 1500,
        paid: 1500,
        bal: 0,
      },
    ],
    dueBills: [
      { id: 2, billNo: "DUE-0060", date: "12-03-2026", time: "13:00 PM", total: 500, paid: 500 },
    ],
    invPay: 2000,
    pharPay: 2400,
    pharRetPaid: 0,
    labPay: 1500,
    duePay: 500,
    netPay: 6400,
  },
  "OP-2026-0360": {
    patientName: "Deepa Krishnan",
    opNo: "OP-2026-0360",
    age: 44,
    sex: "Female",
    invBills: [],
    phBills: [
      {
        id: 8,
        billNo: "PH-1040",
        date: "11-03-2026",
        time: "14:30 PM",
        items: [
          { slNo: 1, medName: "Levothyroxine 50mcg", batch: "LV330", mrp: 30, quantity: 30, rate: 810 },
          { slNo: 2, medName: "Metformin 500mg", batch: "MF221", mrp: 45, quantity: 30, rate: 1260 },
        ],
        total: 2070,
        disc: 70,
        pay: 2000,
        paid: 2000,
        bal: 0,
        retTotal: 810,
        retPay: 810,
        retPaid: 810,
        totBal: 1190,
      },
    ],
    phRetBills: [
      {
        id: 2,
        billNo: "PHR-0105",
        date: "13-03-2026",
        time: "09:00 AM",
        items: [
          { slNo: 1, medName: "Levothyroxine 50mcg", batch: "LV330", mrp: 30, quantity: 30, rate: 810 },
        ],
        total: 810,
        disc: 0,
        pay: 810,
        paid: 810,
        bal: 0,
      },
    ],
    labBills: [
      {
        id: 6,
        billNo: "LAB-2060",
        date: "11-03-2026",
        time: "15:00 PM",
        items: [
          { slNo: 1, testName: "TSH", rate: 350 },
          { slNo: 2, testName: "Free T3", rate: 280 },
          { slNo: 3, testName: "Free T4", rate: 280 },
          { slNo: 4, testName: "HbA1c", rate: 350 },
        ],
        total: 1260,
        disc: 60,
        pay: 1200,
        paid: 1200,
        bal: 0,
      },
    ],
    dueBills: [],
    invPay: 0,
    pharPay: 2000,
    pharRetPaid: 810,
    labPay: 1200,
    duePay: 0,
    netPay: 2390,
  },
};

// ─── Style helpers ─────────────────────────────────────────────────────────────

const TH: React.CSSProperties = {
  background: "var(--color-primary, #0d6efd)",
  color: "#fff",
  fontSize: "var(--font-size-sm)",
  whiteSpace: "nowrap",
};

const FMT = (n: number) => n.toFixed(2);

// ─── Bill Tfoot ───────────────────────────────────────────────────────────────

function BillTfoot({
  total, disc, pay, paid, bal, cols,
}: {
  total: number; disc: number; pay: number; paid: number; bal: number; cols: number;
}) {
  return (
    <tfoot>
      {total !== 0 && (
        <tr>
          <td colSpan={cols - 1} className="text-end fw-semibold">Total :</td>
          <td className="text-end">{FMT(total)}</td>
        </tr>
      )}
      {disc !== 0 && (
        <tr style={{ background: "#e8f5e9" }}>
          <td colSpan={cols - 1} className="text-end fw-semibold" style={{ color: "#2e7d32" }}>Discount :</td>
          <td className="text-end" style={{ color: "#2e7d32" }}>{FMT(disc)}</td>
        </tr>
      )}
      {pay !== 0 && (
        <tr>
          <td colSpan={cols - 1} className="text-end fw-semibold">Pay :</td>
          <td className="text-end">{FMT(pay)}</td>
        </tr>
      )}
      {paid !== 0 && (
        <tr style={{ background: "#fff9c4" }}>
          <td colSpan={cols - 1} className="text-end fw-semibold" style={{ color: "#f57f17" }}>Paid :</td>
          <td className="text-end" style={{ color: "#f57f17" }}>{FMT(paid)}</td>
        </tr>
      )}
      {bal !== 0 && (
        <tr style={{ background: "#fce4ec" }}>
          <td colSpan={cols - 1} className="text-end fw-semibold" style={{ color: "#c62828" }}>Balance :</td>
          <td className="text-end" style={{ color: "#c62828" }}>{FMT(bal)}</td>
        </tr>
      )}
    </tfoot>
  );
}

// ─── Section header ───────────────────────────────────────────────────────────

function SectionHeading({ title }: { title: string }) {
  return (
    <div
      className="px-3 py-2 mb-2 rounded"
      style={{
        background: "var(--color-secondary-bg, #f0f4ff)",
        borderLeft: "4px solid var(--color-primary, #0d6efd)",
        fontSize: "var(--font-size-sm)",
        fontWeight: "var(--font-weight-semibold)",
        color: "var(--color-primary, #0d6efd)",
      }}
    >
      {title}
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function OutPatientOpNoWise() {
  const today = new Date().toISOString().split("T")[0];

  const [dateFrom, setDateFrom] = useState<string>(today);
  const [dateTo, setDateTo] = useState<string>(today);
  const [opNo, setOpNo] = useState<string>("");
  const [record, setRecord] = useState<PatientRecord | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [showDetail, setShowDetail] = useState(false);

  const handleSubmit = () => {
    if (!dateFrom || !dateTo) {
      showValidationError("Please select both From and To dates.", "Validation");
      return;
    }
    if (!opNo.trim()) {
      showValidationError("Please enter an OP Number.", "Validation");
      return;
    }
    const found = DEMO_RECORDS[opNo.trim().toUpperCase()] ?? null;
    setRecord(found);
    setSubmitted(true);
  };

  // ── Summary row totals ────────────────────────────────────────────────────

  const invTotals = record
    ? record.invBills.reduce(
        (acc, b) => ({
          total: acc.total + b.total,
          disc: acc.disc + b.disc,
          pay: acc.pay + b.pay,
          paid: acc.paid + b.paid,
          bal: acc.bal + b.bal,
        }),
        { total: 0, disc: 0, pay: 0, paid: 0, bal: 0 }
      )
    : null;

  const phTotals = record
    ? record.phBills.reduce(
        (acc, b) => ({
          total: acc.total + b.total,
          disc: acc.disc + b.disc,
          pay: acc.pay + b.pay,
          paid: acc.paid + b.paid,
          bal: acc.bal + b.bal,
          retTotal: acc.retTotal + b.retTotal,
          retPay: acc.retPay + b.retPay,
          retPaid: acc.retPaid + b.retPaid,
          totBal: acc.totBal + b.totBal,
        }),
        { total: 0, disc: 0, pay: 0, paid: 0, bal: 0, retTotal: 0, retPay: 0, retPaid: 0, totBal: 0 }
      )
    : null;

  const labTotals = record
    ? record.labBills.reduce(
        (acc, b) => ({
          total: acc.total + b.total,
          disc: acc.disc + b.disc,
          pay: acc.pay + b.pay,
          paid: acc.paid + b.paid,
          bal: acc.bal + b.bal,
        }),
        { total: 0, disc: 0, pay: 0, paid: 0, bal: 0 }
      )
    : null;

  const dueTotals = record
    ? record.dueBills.reduce(
        (acc, b) => ({ total: acc.total + b.total, paid: acc.paid + b.paid }),
        { total: 0, paid: 0 }
      )
    : null;

  return (
    <Container fluid className="report-container">
      <ReportHeader
        title="Out Patient Reimbursement Bill — OP No. Wise"
        subtitle="Search and view out-patient reimbursement bill details by OP number"
        onPrint={() => printReport()}
        onExport={() => {
          if (!record) return;
          exportToExcel(
            [
              { Category: "Investigation Amount", Amount: record.invPay },
              { Category: "Pharmacy Amount", Amount: record.pharPay },
              { Category: "Pharmacy Return Amount", Amount: record.pharRetPaid },
              { Category: "Laboratory Amount", Amount: record.labPay },
              { Category: "Due Collection Amount", Amount: record.duePay },
              { Category: "Net Total", Amount: record.netPay },
            ],
            `OP_Reimb_${record.opNo}`
          );
        }}
      />

      {/* ── Filter Card ────────────────────────────────────────────────────── */}
      <Card className="report-filter-card mb-3">
        <Card.Body>
          <Row className="align-items-end g-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-semibold" style={{ fontSize: "var(--font-size-sm)" }}>
                  Date From
                </Form.Label>
                <Form.Control
                  type="date"
                  value={dateFrom}
                  onChange={(e) => { setDateFrom(e.target.value); setSubmitted(false); }}
                  style={{ fontSize: "var(--font-size-sm)" }}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-semibold" style={{ fontSize: "var(--font-size-sm)" }}>
                  Date To
                </Form.Label>
                <Form.Control
                  type="date"
                  value={dateTo}
                  onChange={(e) => { setDateTo(e.target.value); setSubmitted(false); }}
                  style={{ fontSize: "var(--font-size-sm)" }}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-semibold" style={{ fontSize: "var(--font-size-sm)" }}>
                  OP Number
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g. OP-2026-0341"
                  value={opNo}
                  onChange={(e) => { setOpNo(e.target.value); setSubmitted(false); }}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  style={{ fontSize: "var(--font-size-sm)" }}
                />
              </Form.Group>
            </Col>
            <Col md="auto">
              <Button variant="primary" onClick={handleSubmit} style={{ fontSize: "var(--font-size-sm)" }}>
                <i className="fas fa-search me-1" />
                Submit
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* ── Results ─────────────────────────────────────────────────────────── */}
      {submitted && (
        record ? (
          <>
            {/* Patient info bar */}
            <Card className="mb-3">
              <Card.Body
                className="py-2 px-3 d-flex flex-wrap gap-4 align-items-center"
                style={{ fontSize: "var(--font-size-sm)" }}
              >
                <span>
                  <strong style={{ color: "var(--color-primary, #0d6efd)" }}>Name : </strong>
                  <span className="text-danger fw-semibold">{record.patientName}</span>
                </span>
                <span>
                  <strong style={{ color: "var(--color-primary, #0d6efd)" }}>OP No : </strong>
                  <span className="text-danger fw-semibold">{record.opNo}</span>
                </span>
                <span>
                  <strong style={{ color: "var(--color-primary, #0d6efd)" }}>Age : </strong>
                  {record.age}
                </span>
                <span>
                  <strong style={{ color: "var(--color-primary, #0d6efd)" }}>Sex : </strong>
                  <Badge bg={record.sex === "Male" ? "info" : "warning"} style={{ fontSize: "var(--font-size-xs)" }}>
                    {record.sex}
                  </Badge>
                </span>
                <Button
                  size="sm"
                  variant="outline-primary"
                  className="ms-auto"
                  style={{ fontSize: "var(--font-size-xs)" }}
                  onClick={() => setShowDetail(true)}
                >
                  <i className="fas fa-file-alt me-1" />
                  View Detailed Bill
                </Button>
              </Card.Body>
            </Card>

            {/* ── Investigation Bill Summary ─────────────────────────────── */}
            {record.invBills.length > 0 && (
              <Card className="mb-3">
                <Card.Body className="p-0">
                  <div className="px-3 pt-3 pb-1">
                    <SectionHeading title="Investigation Bill Details" />
                  </div>
                  <div className="table-responsive px-3 pb-3">
                    <Table bordered size="sm" style={{ fontSize: "var(--font-size-sm)" }}>
                      <thead>
                        <tr>
                          <th style={{ ...TH, width: 55 }}>S No</th>
                          <th style={TH}>Bill No</th>
                          <th style={TH}>Date</th>
                          <th style={TH}>Time</th>
                          <th style={{ ...TH, textAlign: "right" }}>Total</th>
                          <th style={{ ...TH, textAlign: "right" }}>Discount</th>
                          <th style={{ ...TH, textAlign: "right" }}>Pay</th>
                          <th style={{ ...TH, textAlign: "right" }}>Paid</th>
                          <th style={{ ...TH, textAlign: "right" }}>Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {record.invBills.map((b, i) => (
                          <tr key={b.id} style={{ background: i % 2 === 0 ? "#fff" : "#f8f9fa" }}>
                            <td className="text-center">{i + 1}</td>
                            <td>{b.billNo}</td>
                            <td className="text-center">{b.date}</td>
                            <td className="text-center">{b.time}</td>
                            <td className="text-end">{FMT(b.total)}</td>
                            <td className="text-end">{FMT(b.disc)}</td>
                            <td className="text-end">{FMT(b.pay)}</td>
                            <td className="text-end">{FMT(b.paid)}</td>
                            <td className="text-end">{FMT(b.bal)}</td>
                          </tr>
                        ))}
                      </tbody>
                      {invTotals && (
                        <tfoot>
                          <tr style={{ background: "#e3f2fd" }}>
                            <td colSpan={4} className="text-center" />
                            <td className="text-end fw-bold text-danger">{FMT(invTotals.total)}</td>
                            <td className="text-end fw-bold text-danger">{FMT(invTotals.disc)}</td>
                            <td className="text-end fw-bold text-danger">{FMT(invTotals.pay)}</td>
                            <td className="text-end fw-bold text-danger">{FMT(invTotals.paid)}</td>
                            <td className="text-end fw-bold text-danger">{FMT(invTotals.bal)}</td>
                          </tr>
                        </tfoot>
                      )}
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            )}

            {/* ── Pharmacy Bill Summary ──────────────────────────────────── */}
            {record.phBills.length > 0 && (
              <Card className="mb-3">
                <Card.Body className="p-0">
                  <div className="px-3 pt-3 pb-1">
                    <SectionHeading title="Pharmacy Bill Details" />
                  </div>
                  <div className="table-responsive px-3 pb-3">
                    <Table bordered size="sm" style={{ fontSize: "var(--font-size-sm)" }}>
                      <thead>
                        <tr>
                          <th style={{ ...TH, width: 55 }}>S No</th>
                          <th style={TH}>Bill No</th>
                          <th style={TH}>Date</th>
                          <th style={TH}>Time</th>
                          <th style={{ ...TH, textAlign: "right" }}>Total</th>
                          <th style={{ ...TH, textAlign: "right" }}>Discount</th>
                          <th style={{ ...TH, textAlign: "right" }}>Pay</th>
                          <th style={{ ...TH, textAlign: "right" }}>Paid</th>
                          <th style={{ ...TH, textAlign: "right" }}>Balance</th>
                          <th style={{ ...TH, textAlign: "right" }}>R.Total</th>
                          <th style={{ ...TH, textAlign: "right" }}>R.Pay</th>
                          <th style={{ ...TH, textAlign: "right" }}>R.Paid</th>
                          <th style={{ ...TH, textAlign: "right" }}>Tot Bal</th>
                        </tr>
                      </thead>
                      <tbody>
                        {record.phBills.map((b, i) => (
                          <tr key={b.id} style={{ background: i % 2 === 0 ? "#fff" : "#f8f9fa" }}>
                            <td className="text-center">{i + 1}</td>
                            <td>{b.billNo}</td>
                            <td className="text-center">{b.date}</td>
                            <td className="text-center">{b.time}</td>
                            <td className="text-end">{FMT(b.total)}</td>
                            <td className="text-end">{FMT(b.disc)}</td>
                            <td className="text-end">{FMT(b.pay)}</td>
                            <td className="text-end">{FMT(b.paid)}</td>
                            <td className="text-end">{FMT(b.bal)}</td>
                            <td className="text-end">{FMT(b.retTotal)}</td>
                            <td className="text-end">{FMT(b.retPay)}</td>
                            <td className="text-end">{FMT(b.retPaid)}</td>
                            <td className="text-end">{FMT(b.totBal)}</td>
                          </tr>
                        ))}
                      </tbody>
                      {phTotals && (
                        <tfoot>
                          <tr style={{ background: "#e3f2fd" }}>
                            <td colSpan={4} className="text-center" />
                            <td className="text-end fw-bold text-danger">{FMT(phTotals.total)}</td>
                            <td className="text-end fw-bold text-danger">{FMT(phTotals.disc)}</td>
                            <td className="text-end fw-bold text-danger">{FMT(phTotals.pay)}</td>
                            <td className="text-end fw-bold text-danger">{FMT(phTotals.paid)}</td>
                            <td className="text-end fw-bold text-danger">{FMT(phTotals.bal)}</td>
                            <td className="text-end fw-bold text-danger">{FMT(phTotals.retTotal)}</td>
                            <td className="text-end fw-bold text-danger">{FMT(phTotals.retPay)}</td>
                            <td className="text-end fw-bold text-danger">{FMT(phTotals.retPaid)}</td>
                            <td className="text-end fw-bold text-danger">{FMT(phTotals.totBal)}</td>
                          </tr>
                        </tfoot>
                      )}
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            )}

            {/* ── Laboratory Bill Summary ────────────────────────────────── */}
            {record.labBills.length > 0 && (
              <Card className="mb-3">
                <Card.Body className="p-0">
                  <div className="px-3 pt-3 pb-1">
                    <SectionHeading title="Laboratory Bill Details" />
                  </div>
                  <div className="table-responsive px-3 pb-3">
                    <Table bordered size="sm" style={{ fontSize: "var(--font-size-sm)" }}>
                      <thead>
                        <tr>
                          <th style={{ ...TH, width: 55 }}>S No</th>
                          <th style={TH}>Bill No</th>
                          <th style={TH}>Date</th>
                          <th style={TH}>Time</th>
                          <th style={{ ...TH, textAlign: "right" }}>Total</th>
                          <th style={{ ...TH, textAlign: "right" }}>Discount</th>
                          <th style={{ ...TH, textAlign: "right" }}>Pay</th>
                          <th style={{ ...TH, textAlign: "right" }}>Paid</th>
                          <th style={{ ...TH, textAlign: "right" }}>Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {record.labBills.map((b, i) => (
                          <tr key={b.id} style={{ background: i % 2 === 0 ? "#fff" : "#f8f9fa" }}>
                            <td className="text-center">{i + 1}</td>
                            <td>{b.billNo}</td>
                            <td className="text-center">{b.date}</td>
                            <td className="text-center">{b.time}</td>
                            <td className="text-end">{FMT(b.total)}</td>
                            <td className="text-end">{FMT(b.disc)}</td>
                            <td className="text-end">{FMT(b.pay)}</td>
                            <td className="text-end">{FMT(b.paid)}</td>
                            <td className="text-end">{FMT(b.bal)}</td>
                          </tr>
                        ))}
                      </tbody>
                      {labTotals && (
                        <tfoot>
                          <tr style={{ background: "#e3f2fd" }}>
                            <td colSpan={4} className="text-center" />
                            <td className="text-end fw-bold text-danger">{FMT(labTotals.total)}</td>
                            <td className="text-end fw-bold text-danger">{FMT(labTotals.disc)}</td>
                            <td className="text-end fw-bold text-danger">{FMT(labTotals.pay)}</td>
                            <td className="text-end fw-bold text-danger">{FMT(labTotals.paid)}</td>
                            <td className="text-end fw-bold text-danger">{FMT(labTotals.bal)}</td>
                          </tr>
                        </tfoot>
                      )}
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            )}

            {/* ── Due Collection Summary ─────────────────────────────────── */}
            {record.dueBills.length > 0 && (
              <Card className="mb-3">
                <Card.Body className="p-0">
                  <div className="px-3 pt-3 pb-1">
                    <SectionHeading title="Due Collection Bill Details" />
                  </div>
                  <div className="table-responsive px-3 pb-3" style={{ maxWidth: 700 }}>
                    <Table bordered size="sm" style={{ fontSize: "var(--font-size-sm)" }}>
                      <thead>
                        <tr>
                          <th style={{ ...TH, width: 55 }}>S No</th>
                          <th style={TH}>Bill No</th>
                          <th style={TH}>Date</th>
                          <th style={TH}>Time</th>
                          <th style={{ ...TH, textAlign: "right" }}>Total</th>
                          <th style={{ ...TH, textAlign: "right" }}>Paid</th>
                        </tr>
                      </thead>
                      <tbody>
                        {record.dueBills.map((b, i) => (
                          <tr key={b.id} style={{ background: i % 2 === 0 ? "#fff" : "#f8f9fa" }}>
                            <td className="text-center">{i + 1}</td>
                            <td>{b.billNo}</td>
                            <td className="text-center">{b.date}</td>
                            <td className="text-center">{b.time}</td>
                            <td className="text-end">{FMT(b.total)}</td>
                            <td className="text-end">{FMT(b.paid)}</td>
                          </tr>
                        ))}
                      </tbody>
                      {dueTotals && (
                        <tfoot>
                          <tr style={{ background: "#e3f2fd" }}>
                            <td colSpan={4} className="text-center" />
                            <td className="text-end fw-bold text-danger">{FMT(dueTotals.total)}</td>
                            <td className="text-end fw-bold text-danger">{FMT(dueTotals.paid)}</td>
                          </tr>
                        </tfoot>
                      )}
                    </Table>
                  </div>
                </Card.Body>
              </Card>
            )}

            {/* ── Net Summary ────────────────────────────────────────────── */}
            <Card className="mb-3">
              <Card.Body className="p-0">
                <div className="table-responsive">
                  <Table bordered size="sm" style={{ fontSize: "var(--font-size-sm)", maxWidth: 550 }} className="mb-0">
                    <tbody>
                      <tr>
                        <td style={{ width: 55 }} className="text-center">1</td>
                        <td style={{ color: "var(--color-primary, #0d6efd)", fontWeight: "var(--font-weight-semibold)" }}>
                          &nbsp;&nbsp;&nbsp;Investigation Amount
                        </td>
                        <td style={{ width: 133, color: "#000080", textAlign: "right", fontWeight: "var(--font-weight-bold)" }}>
                          {FMT(record.invPay)}&nbsp;&nbsp;&nbsp;
                        </td>
                      </tr>
                      <tr>
                        <td className="text-center">2</td>
                        <td style={{ color: "var(--color-primary, #0d6efd)", fontWeight: "var(--font-weight-semibold)" }}>
                          &nbsp;&nbsp;&nbsp;Pharmacy Amount
                        </td>
                        <td style={{ width: 133, color: "#000080", textAlign: "right", fontWeight: "var(--font-weight-bold)" }}>
                          {FMT(record.pharPay)}&nbsp;&nbsp;&nbsp;
                        </td>
                      </tr>
                      <tr>
                        <td className="text-center">3</td>
                        <td style={{ color: "var(--color-primary, #0d6efd)", fontWeight: "var(--font-weight-semibold)" }}>
                          &nbsp;&nbsp;&nbsp;Pharmacy Return Amount
                        </td>
                        <td style={{ width: 133, color: "#000080", textAlign: "right", fontWeight: "var(--font-weight-bold)" }}>
                          {FMT(record.pharRetPaid)}&nbsp;&nbsp;&nbsp;
                        </td>
                      </tr>
                      <tr>
                        <td className="text-center">4</td>
                        <td style={{ color: "var(--color-primary, #0d6efd)", fontWeight: "var(--font-weight-semibold)" }}>
                          &nbsp;&nbsp;&nbsp;Laboratory Amount
                        </td>
                        <td style={{ width: 133, color: "#000080", textAlign: "right", fontWeight: "var(--font-weight-bold)" }}>
                          {FMT(record.labPay)}&nbsp;&nbsp;&nbsp;
                        </td>
                      </tr>
                      <tr>
                        <td className="text-center">5</td>
                        <td style={{ color: "var(--color-primary, #0d6efd)", fontWeight: "var(--font-weight-semibold)" }}>
                          &nbsp;&nbsp;&nbsp;Due Collection Amount
                        </td>
                        <td style={{ width: 133, color: "#000080", textAlign: "right", fontWeight: "var(--font-weight-bold)" }}>
                          {FMT(record.duePay)}&nbsp;&nbsp;&nbsp;
                        </td>
                      </tr>
                      <tr style={{ background: "#e8eaf6" }}>
                        <td colSpan={2} className="text-end" style={{ color: "var(--color-primary, #0d6efd)", fontWeight: "var(--font-weight-bold)" }}>
                          Net Total :&nbsp;&nbsp;&nbsp;
                        </td>
                        <td style={{ width: 133, textAlign: "right", fontWeight: "var(--font-weight-bold)" }} className="text-danger">
                          {FMT(record.netPay)}&nbsp;&nbsp;&nbsp;
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </>
        ) : (
          <Card>
            <Card.Body className="text-center text-muted py-5" style={{ fontSize: "var(--font-size-sm)" }}>
              <i className="fas fa-search fa-2x mb-3 d-block" />
              No record found for OP Number <strong>{opNo}</strong> in the selected date range.
            </Card.Body>
          </Card>
        )
      )}

      {/* ── Detailed Bill Modal ──────────────────────────────────────────────── */}
      {record && (
        <Modal show={showDetail} onHide={() => setShowDetail(false)} size="lg" scrollable>
          <Modal.Header closeButton style={{ background: "var(--color-primary, #0d6efd)", color: "#fff" }}>
            <Modal.Title style={{ fontSize: "var(--font-size-md)" }}>
              Out Patient Reimbursement Bill Details
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ fontSize: "var(--font-size-sm)" }}>
            {/* Patient info */}
            <Row className="mb-3">
              <Col>
                <strong style={{ color: "var(--color-primary, #0d6efd)" }}>Patient Name : </strong>
                <span className="text-danger">{record.patientName}</span>
              </Col>
              <Col>
                <strong style={{ color: "var(--color-primary, #0d6efd)" }}>OP No : </strong>
                <span className="text-danger">{record.opNo}</span>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col>
                <strong style={{ color: "var(--color-primary, #0d6efd)" }}>Age : </strong>
                {record.age}
              </Col>
              <Col>
                <strong style={{ color: "var(--color-primary, #0d6efd)" }}>Sex : </strong>
                {record.sex}
              </Col>
            </Row>

            {/* Investigation detail */}
            {record.invBills.length > 0 && (
              <>
                <SectionHeading title="Investigation Bill Details" />
                {record.invBills.map((b) => (
                  <div key={b.id} className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span>Bill No : <strong className="text-danger">{b.billNo}</strong></span>
                      <span>Bill Time : <strong className="text-danger">{b.time}</strong></span>
                    </div>
                    <Table bordered size="sm">
                      <thead>
                        <tr>
                          <th style={{ ...TH, width: 55 }}>S No</th>
                          <th style={TH}>Particulars</th>
                          <th style={{ ...TH, textAlign: "right", width: 120 }}>Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {b.items.map((it) => (
                          <tr key={it.slNo}>
                            <td className="text-center">{it.slNo}</td>
                            <td>{it.particulars}</td>
                            <td className="text-end">{FMT(it.rate)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <BillTfoot total={b.total} disc={b.disc} pay={b.pay} paid={b.paid} bal={b.bal} cols={3} />
                    </Table>
                  </div>
                ))}
              </>
            )}

            {/* Pharmacy detail */}
            {record.phBills.length > 0 && (
              <>
                <SectionHeading title="Pharmacy Bill Details" />
                {record.phBills.map((b) => (
                  <div key={b.id} className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span>Bill No : <strong className="text-danger">{b.billNo}</strong></span>
                      <span>Bill Time : <strong className="text-danger">{b.time}</strong></span>
                    </div>
                    <Table bordered size="sm">
                      <thead>
                        <tr>
                          <th style={{ ...TH, width: 45 }}>S No</th>
                          <th style={TH}>Med Name</th>
                          <th style={TH}>Batch</th>
                          <th style={{ ...TH, textAlign: "right" }}>MRP</th>
                          <th style={{ ...TH, textAlign: "right" }}>Qty</th>
                          <th style={{ ...TH, textAlign: "right" }}>Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {b.items.map((it) => (
                          <tr key={it.slNo}>
                            <td className="text-center">{it.slNo}</td>
                            <td>{it.medName}</td>
                            <td>{it.batch}</td>
                            <td className="text-end">{FMT(it.mrp)}</td>
                            <td className="text-end">{it.quantity}</td>
                            <td className="text-end">{FMT(it.rate)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <BillTfoot total={b.total} disc={b.disc} pay={b.pay} paid={b.paid} bal={b.bal} cols={6} />
                    </Table>
                  </div>
                ))}
              </>
            )}

            {/* Pharmacy Return detail */}
            {record.phRetBills.length > 0 && (
              <>
                <SectionHeading title="Pharmacy Return Details" />
                {record.phRetBills.map((b) => (
                  <div key={b.id} className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span>Bill No : <strong className="text-danger">{b.billNo}</strong></span>
                      <span>Bill Time : <strong className="text-danger">{b.time}</strong></span>
                    </div>
                    <Table bordered size="sm">
                      <thead>
                        <tr>
                          <th style={{ ...TH, width: 45 }}>S No</th>
                          <th style={TH}>Med Name</th>
                          <th style={TH}>Batch</th>
                          <th style={{ ...TH, textAlign: "right" }}>MRP</th>
                          <th style={{ ...TH, textAlign: "right" }}>Qty</th>
                          <th style={{ ...TH, textAlign: "right" }}>Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {b.items.map((it) => (
                          <tr key={it.slNo}>
                            <td className="text-center">{it.slNo}</td>
                            <td>{it.medName}</td>
                            <td>{it.batch}</td>
                            <td className="text-end">{FMT(it.mrp)}</td>
                            <td className="text-end">{it.quantity}</td>
                            <td className="text-end">{FMT(it.rate)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot>
                        {b.total !== 0 && (
                          <tr>
                            <td colSpan={5} className="text-end fw-semibold">Total :</td>
                            <td className="text-end">{FMT(b.total)}</td>
                          </tr>
                        )}
                        {b.pay !== 0 && (
                          <tr>
                            <td colSpan={5} className="text-end fw-semibold">Repay :</td>
                            <td className="text-end">{FMT(b.pay)}</td>
                          </tr>
                        )}
                        {b.paid !== 0 && (
                          <tr style={{ background: "#fff9c4" }}>
                            <td colSpan={5} className="text-end fw-semibold" style={{ color: "#f57f17" }}>Repaid :</td>
                            <td className="text-end" style={{ color: "#f57f17" }}>{FMT(b.paid)}</td>
                          </tr>
                        )}
                        {b.bal !== 0 && (
                          <tr style={{ background: "#fce4ec" }}>
                            <td colSpan={5} className="text-end fw-semibold" style={{ color: "#c62828" }}>Balance :</td>
                            <td className="text-end" style={{ color: "#c62828" }}>{FMT(b.bal)}</td>
                          </tr>
                        )}
                      </tfoot>
                    </Table>
                  </div>
                ))}
              </>
            )}

            {/* Lab detail */}
            {record.labBills.length > 0 && (
              <>
                <SectionHeading title="Laboratory Bill Details" />
                {record.labBills.map((b) => (
                  <div key={b.id} className="mb-3">
                    <div className="d-flex justify-content-between mb-1">
                      <span>Bill No : <strong className="text-danger">{b.billNo}</strong></span>
                      <span>Bill Time : <strong className="text-danger">{b.time}</strong></span>
                    </div>
                    <Table bordered size="sm">
                      <thead>
                        <tr>
                          <th style={{ ...TH, width: 55 }}>S No</th>
                          <th style={TH}>Test Name</th>
                          <th style={{ ...TH, textAlign: "right", width: 120 }}>Rate</th>
                        </tr>
                      </thead>
                      <tbody>
                        {b.items.map((it) => (
                          <tr key={it.slNo}>
                            <td className="text-center">{it.slNo}</td>
                            <td>{it.testName}</td>
                            <td className="text-end">{FMT(it.rate)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <BillTfoot total={b.total} disc={b.disc} pay={b.pay} paid={b.paid} bal={b.bal} cols={3} />
                    </Table>
                  </div>
                ))}
              </>
            )}

            {/* Due Collection detail */}
            {record.dueBills.length > 0 && (
              <>
                <SectionHeading title="Due Collection Bill Details" />
                <Table bordered size="sm" className="mb-3">
                  <thead>
                    <tr>
                      <th style={{ ...TH, width: 55 }}>S No</th>
                      <th style={TH}>Bill No</th>
                      <th style={TH}>Date</th>
                      <th style={TH}>Time</th>
                      <th style={{ ...TH, textAlign: "right" }}>Total</th>
                      <th style={{ ...TH, textAlign: "right" }}>Paid</th>
                    </tr>
                  </thead>
                  <tbody>
                    {record.dueBills.map((b, i) => (
                      <tr key={b.id}>
                        <td className="text-center">{i + 1}</td>
                        <td>{b.billNo}</td>
                        <td className="text-center">{b.date}</td>
                        <td className="text-center">{b.time}</td>
                        <td className="text-end">{FMT(b.total)}</td>
                        <td className="text-end">{FMT(b.paid)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </>
            )}

            {/* Net Summary */}
            <SectionHeading title="Bill Summary" />
            <Table bordered size="sm" style={{ maxWidth: 450 }}>
              <tbody>
                {[
                  { label: "Investigation Amount", val: record.invPay },
                  { label: "Pharmacy Amount", val: record.pharPay },
                  { label: "Pharmacy Return Amount", val: record.pharRetPaid },
                  { label: "Laboratory Amount", val: record.labPay },
                  { label: "Due Collection Amount", val: record.duePay },
                ].map((row, i) => (
                  <tr key={i}>
                    <td className="text-center" style={{ width: 45 }}>{i + 1}</td>
                    <td style={{ color: "var(--color-primary, #0d6efd)", fontWeight: "var(--font-weight-semibold)" }}>
                      &nbsp;&nbsp;{row.label}
                    </td>
                    <td className="text-end" style={{ width: 120, color: "#000080", fontWeight: "var(--font-weight-bold)" }}>
                      {FMT(row.val)}&nbsp;&nbsp;
                    </td>
                  </tr>
                ))}
                <tr style={{ background: "#e8eaf6" }}>
                  <td colSpan={2} className="text-end" style={{ color: "var(--color-primary, #0d6efd)", fontWeight: "var(--font-weight-bold)" }}>
                    Net Total :&nbsp;&nbsp;
                  </td>
                  <td className="text-end text-danger fw-bold">{FMT(record.netPay)}&nbsp;&nbsp;</td>
                </tr>
              </tbody>
            </Table>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="outline-secondary" size="sm" onClick={() => setShowDetail(false)}>
              Close
            </Button>
            <Button variant="primary" size="sm" onClick={() => printReport()}>
              <i className="fas fa-print me-1" /> Print
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </Container>
  );
}

