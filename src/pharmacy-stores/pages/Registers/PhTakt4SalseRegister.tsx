import React, { useState, useMemo } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  Row,
  Col,
  Modal,
  Table,
} from "react-bootstrap";
import ReportHeader from "../../../medical-records/components/ReportHeader";
import ReportKPICard from "../../../medical-records/components/ReportKPICard";
import {
  printReport,
  exportToExcel,
  formatReportDate,
} from "../../../medical-records/utils/reportUtils";
import { showValidationError } from "../../../utils/alertUtil";
import "../../../medical-records/styles/reportStyles.css";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtAmt = (n: number) =>
  n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

// ─── Types ────────────────────────────────────────────────────────────────────
interface MedItem {
  slNo: number;
  medName: string;
  batchNo: string;
  expDate: string;
  units: number;
  mrp: number;
  total: number;
}

interface SalesRecord {
  id: number;
  billNo: string;
  date: string;
  patientName: string;
  ageSex: string;
  address: string;
  phoneNo: string;
  disc: number;
  paid: number;
  bal: number;
  items: MedItem[];
}

interface MedicineOption {
  id: number;
  name: string;
  records: SalesRecord[];
}

// ─── Demo Data ────────────────────────────────────────────────────────────────
const MEDICINES: MedicineOption[] = [
  {
    id: 1,
    name: "Tramadol 50mg",
    records: [
      {
        id: 1, billNo: "AK-001", date: "2026-03-01",
        patientName: "Ravi Kumar",     ageSex: "45/M",
        address: "12, Gandhi Nagar, Chennai - 600 012", phoneNo: "9876543210",
        disc: 12.50, paid: 237.50, bal: 0.00,
        items: [
          { slNo: 1, medName: "Tramadol 50mg", batchNo: "TR-042", expDate: "06/2027", units: 10, mrp: 9.00,  total: 90.00  },
          { slNo: 2, medName: "Pantoprazole 40mg", batchNo: "PZ-008", expDate: "09/2026", units: 10, mrp: 9.00,  total: 90.00  },
          { slNo: 3, medName: "Paracetamol 500mg", batchNo: "B-001",  expDate: "12/2026", units: 28, mrp: 2.50,  total: 70.00  },
        ],
      },
      {
        id: 2, billNo: "AK-002", date: "2026-03-03",
        patientName: "Meena Devi",       ageSex: "52/F",
        address: "34, Nehru Street, Coimbatore - 641 001", phoneNo: "9845678901",
        disc: 0.00, paid: 180.00, bal: 0.00,
        items: [
          { slNo: 1, medName: "Tramadol 50mg",   batchNo: "TR-042", expDate: "06/2027", units: 20, mrp: 9.00,  total: 180.00 },
        ],
      },
      {
        id: 3, billNo: "AK-003", date: "2026-03-06",
        patientName: "Suresh Babu",      ageSex: "38/M",
        address: "8, Anna Salai, Madurai - 625 001", phoneNo: "9901234567",
        disc: 9.00, paid: 171.00, bal: 0.00,
        items: [
          { slNo: 1, medName: "Tramadol 50mg",    batchNo: "TR-042", expDate: "06/2027", units: 10, mrp: 9.00,  total: 90.00  },
          { slNo: 2, medName: "Amoxicillin 250mg", batchNo: "B-045", expDate: "06/2026", units: 10, mrp: 8.50,  total: 85.00  },
          { slNo: 3, medName: "Dolo 650mg",        batchNo: "D-012", expDate: "02/2027", units: 10, mrp: 4.50,  total: 5.00   },
        ],
      },
      {
        id: 4, billNo: "AK-004", date: "2026-03-09",
        patientName: "Lakshmi S.",       ageSex: "60/F",
        address: "22, Kamarajar Road, Salem - 636 001", phoneNo: "9812345670",
        disc: 18.00, paid: 162.00, bal: 0.00,
        items: [
          { slNo: 1, medName: "Tramadol 50mg", batchNo: "TR-042", expDate: "06/2027", units: 20, mrp: 9.00,  total: 180.00 },
        ],
      },
    ],
  },
  {
    id: 2,
    name: "Alprazolam 0.25mg",
    records: [
      {
        id: 5, billNo: "AK-005", date: "2026-03-02",
        patientName: "Anandan R.",       ageSex: "47/M",
        address: "5, Rajaji Bhavan, Tiruchy - 620 001", phoneNo: "9788901234",
        disc: 0.00, paid: 120.00, bal: 0.00,
        items: [
          { slNo: 1, medName: "Alprazolam 0.25mg", batchNo: "AL-011", expDate: "04/2027", units: 30, mrp: 4.00, total: 120.00 },
        ],
      },
      {
        id: 6, billNo: "AK-006", date: "2026-03-04",
        patientName: "Kavitha M.",       ageSex: "35/F",
        address: "16, Bharathi Nagar, Erode - 638 001", phoneNo: "9700123456",
        disc: 10.00, paid: 110.00, bal: 0.00,
        items: [
          { slNo: 1, medName: "Alprazolam 0.25mg", batchNo: "AL-011", expDate: "04/2027", units: 30, mrp: 4.00, total: 120.00 },
        ],
      },
      {
        id: 7, billNo: "AK-007", date: "2026-03-08",
        patientName: "Murugan P.",       ageSex: "55/M",
        address: "3, Periyar Road, Tirunelveli - 627 001", phoneNo: "9677654321",
        disc: 0.00, paid: 200.00, bal: 40.00,
        items: [
          { slNo: 1, medName: "Alprazolam 0.25mg", batchNo: "AL-011", expDate: "04/2027", units: 60, mrp: 4.00, total: 240.00 },
        ],
      },
    ],
  },
  {
    id: 3,
    name: "Codeine Phosphate 10mg",
    records: [
      {
        id: 8, billNo: "AK-008", date: "2026-03-01",
        patientName: "Priya N.",         ageSex: "29/F",
        address: "11, Sivaji Street, Vellore - 632 001", phoneNo: "9566789012",
        disc: 15.00, paid: 285.00, bal: 0.00,
        items: [
          { slNo: 1, medName: "Codeine Phosphate 10mg", batchNo: "CD-005", expDate: "03/2027", units: 20, mrp: 15.00, total: 300.00 },
        ],
      },
      {
        id: 9, billNo: "AK-009", date: "2026-03-05",
        patientName: "Balamurugan S.",   ageSex: "63/M",
        address: "7, Indira Nagar, Cuddalore - 607 001", phoneNo: "9445678901",
        disc: 30.00, paid: 270.00, bal: 0.00,
        items: [
          { slNo: 1, medName: "Codeine Phosphate 10mg", batchNo: "CD-005", expDate: "03/2027", units: 20, mrp: 15.00, total: 300.00 },
        ],
      },
      {
        id: 10, billNo: "AK-010", date: "2026-03-10",
        patientName: "Ranjitha K.",      ageSex: "41/F",
        address: "19, Kalaimagal Nagar, Nagercoil - 629 001", phoneNo: "9342345678",
        disc: 0.00, paid: 225.00, bal: 75.00,
        items: [
          { slNo: 1, medName: "Codeine Phosphate 10mg", batchNo: "CD-005", expDate: "03/2027", units: 20, mrp: 15.00, total: 300.00 },
        ],
      },
    ],
  },
  {
    id: 4,
    name: "Morphine 10mg Inj.",
    records: [
      {
        id: 11, billNo: "AK-011", date: "2026-03-03",
        patientName: "Vijay K.",         ageSex: "58/M",
        address: "25, Patel Road, Thanjavur - 613 001", phoneNo: "9234567890",
        disc: 50.00, paid: 950.00, bal: 0.00,
        items: [
          { slNo: 1, medName: "Morphine 10mg Inj.", batchNo: "MO-002", expDate: "08/2026", units: 5, mrp: 200.00, total: 1000.00 },
        ],
      },
      {
        id: 12, billNo: "AK-012", date: "2026-03-07",
        patientName: "Saranya V.",       ageSex: "44/F",
        address: "2, Rajiv Gandhi Salai, Kancheepuram - 631 501", phoneNo: "9123456789",
        disc: 0.00, paid: 500.00, bal: 500.00,
        items: [
          { slNo: 1, medName: "Morphine 10mg Inj.", batchNo: "MO-002", expDate: "08/2026", units: 5, mrp: 200.00, total: 1000.00 },
        ],
      },
    ],
  },
  {
    id: 5,
    name: "Diazepam 5mg",
    records: [
      {
        id: 13, billNo: "AK-013", date: "2026-03-02",
        patientName: "Deepa M.",         ageSex: "33/F",
        address: "14, Sarojini Nagar, Tiruppur - 641 601", phoneNo: "9012345678",
        disc: 5.00, paid: 55.00, bal: 0.00,
        items: [
          { slNo: 1, medName: "Diazepam 5mg", batchNo: "DZ-019", expDate: "11/2027", units: 30, mrp: 2.00,  total: 60.00  },
        ],
      },
      {
        id: 14, billNo: "AK-014", date: "2026-03-06",
        patientName: "Karthik S.",       ageSex: "50/M",
        address: "9, Nehru Park, Dindigul - 624 001", phoneNo: "8901234567",
        disc: 0.00, paid: 90.00, bal: 0.00,
        items: [
          { slNo: 1, medName: "Diazepam 5mg",       batchNo: "DZ-019", expDate: "11/2027", units: 30, mrp: 2.00,  total: 60.00  },
          { slNo: 2, medName: "Pantoprazole 40mg",   batchNo: "PZ-008", expDate: "09/2026", units: 10, mrp: 9.00,  total: 90.00  },
        ],
      },
      {
        id: 15, billNo: "AK-015", date: "2026-03-09",
        patientName: "Selvi P.",         ageSex: "67/F",
        address: "31, Anna Nagar, Virudhunagar - 626 001", phoneNo: "8812345678",
        disc: 3.00, paid: 57.00, bal: 0.00,
        items: [
          { slNo: 1, medName: "Diazepam 5mg", batchNo: "DZ-019", expDate: "11/2027", units: 30, mrp: 2.00,  total: 60.00  },
        ],
      },
    ],
  },
];
// ─────────────────────────────────────────────────────────────────────────────

export default function PhTakt4SalseRegister() {
  const [fromDate,      setFromDate]      = useState<string>("2026-03-01");
  const [toDate,        setToDate]        = useState<string>("2026-03-12");
  const [medicineId,    setMedicineId]    = useState<number>(0);
  const [submitted,     setSubmitted]     = useState<boolean>(false);
  const [activeMed,     setActiveMed]     = useState<MedicineOption | null>(null);

  // Bill detail modal
  const [showModal,     setShowModal]     = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<SalesRecord | null>(null);

  const filteredRecords = useMemo(() => {
    if (!activeMed) return [];
    return activeMed.records.filter(
      (r) => r.date >= fromDate && r.date <= toDate
    );
  }, [activeMed, fromDate, toDate]);

  const stats = useMemo(() => ({
    total:     filteredRecords.length,
    totalAmt:  filteredRecords.reduce((s, r) => s + r.paid + r.bal, 0),
    totalPaid: filteredRecords.reduce((s, r) => s + r.paid, 0),
    totalBal:  filteredRecords.reduce((s, r) => s + r.bal,  0),
  }), [filteredRecords]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromDate || !toDate) {
      showValidationError("Please select both From Date and To Date.");
      return;
    }
    if (fromDate > toDate) {
      showValidationError("From Date cannot be after To Date.");
      return;
    }
    if (medicineId === 0) {
      showValidationError("Please select a Medicine.");
      return;
    }
    const med = MEDICINES.find((m) => m.id === medicineId) ?? null;
    setActiveMed(med);
    setSubmitted(true);
  };

  const handleReset = () => {
    setFromDate("2026-03-01");
    setToDate("2026-03-12");
    setMedicineId(0);
    setSubmitted(false);
    setActiveMed(null);
  };

  const handleRowClick = (record: SalesRecord) => {
    setSelectedRecord(record);
    setShowModal(true);
  };

  const handleExport = () => {
    if (!activeMed || filteredRecords.length === 0) return;
    const data = filteredRecords.map((r, i) => ({
      "Sl. No":       i + 1,
      "Name":         r.patientName,
      "Age/Sex":      r.ageSex,
      "Address":      r.address,
      "Ph. No":       r.phoneNo,
      "Bill No":      r.billNo,
      "Date":         r.date,
      "Paid":         fmtAmt(r.paid),
      "Balance":      fmtAmt(r.bal),
    }));
    exportToExcel(
      data,
      `T_AKT4_${activeMed.name}_${formatReportDate(new Date(), "DD-MM-YYYY")}`,
      "Medicine Sales Register (T.AKT-4)"
    );
  };

  return (
    <React.Fragment>
      <Container fluid className="px-4 py-3">
        <ReportHeader
          title="Medicine Sales Register (T.AKT-4)"
          subtitle={
            submitted && activeMed
              ? `${activeMed.name} — ${fromDate} to ${toDate}`
              : "Select date range and medicine, then click Submit"
          }
          onPrint={printReport}
          onExport={handleExport}
          onSearch={() => {}}
          showSearch={false}
          showSort={false}
          showPrint={submitted}
          showExport={submitted}
        />

        {/* Filter Card */}
        <Card className="mb-4 shadow-sm no-print">
          <Card.Body>
            <Form onSubmit={handleSubmit}>
              <Row className="g-3 align-items-end">
                <Form.Group as={Col} md={3} controlId="fromDate">
                  <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>
                    From Date
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </Form.Group>

                <Form.Group as={Col} md={3} controlId="toDate">
                  <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>
                    To Date
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </Form.Group>

                <Form.Group as={Col} md={3} controlId="medicine">
                  <Form.Label style={{ fontWeight: "var(--font-weight-semibold)" }}>
                    Medicine
                  </Form.Label>
                  <Form.Select
                    value={medicineId}
                    onChange={(e) => setMedicineId(Number(e.target.value))}
                  >
                    <option value={0}>Select Medicine</option>
                    {MEDICINES.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>

                <Form.Group as={Col} md={3} className="d-flex gap-2 align-items-end">
                  <Button type="submit" variant="primary" className="w-50">
                    Submit
                  </Button>
                  <Button
                    type="button"
                    variant="secondary"
                    className="w-50"
                    onClick={handleReset}
                  >
                    Reset
                  </Button>
                </Form.Group>
              </Row>
            </Form>
          </Card.Body>
        </Card>

        {/* KPI Cards */}
        {submitted && (
          <Row className="mb-4">
            <Col md={3}>
              <ReportKPICard label="Total Patients"  value={stats.total}                      variant="primary" />
            </Col>
            <Col md={3}>
              <ReportKPICard label="Total Amount"    value={`₹ ${fmtAmt(stats.totalAmt)}`}   variant="info"    />
            </Col>
            <Col md={3}>
              <ReportKPICard label="Total Paid"      value={`₹ ${fmtAmt(stats.totalPaid)}`}  variant="success" />
            </Col>
            <Col md={3}>
              <ReportKPICard label="Total Balance"   value={`₹ ${fmtAmt(stats.totalBal)}`}   variant="warning" />
            </Col>
          </Row>
        )}

        {/* Patient List Table */}
        {submitted && (
          <Card className="report-card">
            <div
              style={{
                padding: "0.6rem 1rem",
                borderBottom: "1px solid #dee2e6",
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <span
                style={{
                  fontSize: "var(--font-size-sm)",
                  fontWeight: "var(--font-weight-semibold)",
                }}
              >
                Medicine Sales Register (T.AKT-4) between{" "}
                <span style={{ color: "#9c27b0" }}>{fromDate}</span>
                {" — "}
                <span style={{ color: "#9c27b0" }}>{toDate}</span>
              </span>
              <span
                className="text-muted"
                style={{ fontSize: "var(--font-size-xs)" }}
              >
                Click a row to view bill details
              </span>
            </div>

            <div style={{ overflowX: "auto" }}>
              <Table bordered hover size="sm" className="mb-0">
                <thead className="table-dark">
                  <tr>
                    <th className="text-center" style={{ width: "5%"  }}>Sl. No</th>
                    <th                         style={{ width: "22%" }}>Name</th>
                    <th className="text-center" style={{ width: "9%"  }}>Age / Sex</th>
                    <th                         style={{ width: "38%" }}>Address</th>
                    <th className="text-center" style={{ width: "14%" }}>Ph. No</th>
                    <th className="text-center" style={{ width: "12%" }}>Bill No</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredRecords.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-4 text-muted">
                        No records found for the selected medicine and date range.
                      </td>
                    </tr>
                  ) : (
                    filteredRecords.map((record, idx) => (
                      <tr
                        key={record.id}
                        style={{
                          cursor: "pointer",
                          background: idx % 2 === 0 ? "#fdfdfd" : "#f5f5f5",
                        }}
                        onClick={() => handleRowClick(record)}
                      >
                        <td className="text-center">{idx + 1}</td>
                        <td>
                          <span
                            style={{
                              color: "#800080",
                              fontWeight: "var(--font-weight-semibold)",
                              textDecoration: "underline",
                            }}
                          >
                            &nbsp;&nbsp;{record.patientName}
                          </span>
                        </td>
                        <td className="text-center">{record.ageSex}</td>
                        <td>&nbsp;&nbsp;{record.address}</td>
                        <td className="text-center">{record.phoneNo}</td>
                        <td className="text-center">
                          <span
                            style={{
                              color: "#800080",
                              fontWeight: "var(--font-weight-semibold)",
                            }}
                          >
                            {record.billNo}
                          </span>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </Card>
        )}
      </Container>

      {/* ── Bill Detail Modal ─────────────────────────────────────────────────── */}
      <Modal
        show={showModal}
        onHide={() => setShowModal(false)}
        size="lg"
        centered
      >
        <Modal.Header closeButton style={{ borderBottom: "2px solid #dee2e6" }}>
          <Modal.Title
            style={{
              fontSize: "var(--font-size-lg)",
              fontWeight: "var(--font-weight-semibold)",
            }}
          >
            Used Medicine Details — Bill No{" "}
            <span style={{ color: "#800080" }}>{selectedRecord?.billNo}</span>
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ padding: "1.25rem" }}>
          {selectedRecord && (
            <>
              {/* Patient meta */}
              <div
                className="mb-3 p-2 px-3"
                style={{
                  background: "#f8f9fa",
                  borderRadius: "6px",
                  border: "1px solid #dee2e6",
                }}
              >
                <Row className="g-1">
                  <Col md={4}>
                    <span style={{ fontSize: "var(--font-size-sm)" }}>Patient :&nbsp;</span>
                    <span
                      style={{
                        fontWeight: "var(--font-weight-semibold)",
                        color: "#800080",
                      }}
                    >
                      {selectedRecord.patientName}
                    </span>
                  </Col>
                  <Col md={2}>
                    <span style={{ fontSize: "var(--font-size-sm)" }}>Age/Sex :&nbsp;</span>
                    <span style={{ fontWeight: "var(--font-weight-medium)" }}>
                      {selectedRecord.ageSex}
                    </span>
                  </Col>
                  <Col md={3}>
                    <span style={{ fontSize: "var(--font-size-sm)" }}>Date :&nbsp;</span>
                    <span style={{ fontWeight: "var(--font-weight-medium)" }}>
                      {selectedRecord.date}
                    </span>
                  </Col>
                  <Col md={3}>
                    <span style={{ fontSize: "var(--font-size-sm)" }}>Ph :&nbsp;</span>
                    <span style={{ fontWeight: "var(--font-weight-medium)" }}>
                      {selectedRecord.phoneNo}
                    </span>
                  </Col>
                  <Col md={12} className="mt-1">
                    <span style={{ fontSize: "var(--font-size-sm)" }}>Address :&nbsp;</span>
                    <span style={{ fontSize: "var(--font-size-sm)" }}>
                      {selectedRecord.address}
                    </span>
                  </Col>
                </Row>
              </div>

              {/* Items table */}
              <Table bordered size="sm" className="mb-0">
                <thead className="table-dark">
                  <tr>
                    <th className="text-center" style={{ width: "6%"  }}>Sl. No</th>
                    <th                         style={{ width: "34%" }}>Med. Name</th>
                    <th className="text-center" style={{ width: "13%" }}>Batch No</th>
                    <th className="text-center" style={{ width: "11%" }}>Exp. Date</th>
                    <th className="text-end"    style={{ width: "10%" }}>Units</th>
                    <th className="text-end"    style={{ width: "10%" }}>M.R.P</th>
                    <th className="text-end"    style={{ width: "16%" }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedRecord.items.map((item) => (
                    <tr key={item.slNo}>
                      <td className="text-center">{item.slNo}</td>
                      <td>&nbsp;&nbsp;&nbsp;{item.medName}</td>
                      <td className="text-center">{item.batchNo}</td>
                      <td className="text-center">{item.expDate}</td>
                      <td className="text-end pe-3">{fmtAmt(item.units)}</td>
                      <td className="text-end pe-3">{fmtAmt(item.mrp)}</td>
                      <td className="text-end pe-3">{fmtAmt(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr
                    style={{
                      background: "#e8f5e9",
                      fontWeight: "var(--font-weight-semibold)",
                      fontSize: "var(--font-size-sm)",
                    }}
                  >
                    <td colSpan={6} className="text-center" style={{ color: "#198754" }}>
                      Discount Amount
                    </td>
                    <td className="text-end pe-3" style={{ color: "#198754" }}>
                      {fmtAmt(selectedRecord.disc)}
                    </td>
                  </tr>
                  <tr
                    style={{
                      background: "#fff9c4",
                      fontWeight: "var(--font-weight-semibold)",
                      fontSize: "var(--font-size-sm)",
                    }}
                  >
                    <td colSpan={6} className="text-center" style={{ color: "#856404" }}>
                      Paid Amount
                    </td>
                    <td className="text-end pe-3" style={{ color: "#856404" }}>
                      {fmtAmt(selectedRecord.paid)}
                    </td>
                  </tr>
                  <tr
                    style={{
                      background: selectedRecord.bal > 0 ? "#f8d7da" : "#f8f9fa",
                      fontWeight: "var(--font-weight-semibold)",
                      fontSize: "var(--font-size-sm)",
                    }}
                  >
                    <td
                      colSpan={6}
                      className="text-center"
                      style={{
                        color: selectedRecord.bal > 0 ? "#800080" : "#6c757d",
                      }}
                    >
                      Balance Amount
                    </td>
                    <td
                      className="text-end pe-3"
                      style={{
                        color: selectedRecord.bal > 0 ? "#800080" : "#6c757d",
                      }}
                    >
                      {fmtAmt(selectedRecord.bal)}
                    </td>
                  </tr>
                </tfoot>
              </Table>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </React.Fragment>
  );
}
