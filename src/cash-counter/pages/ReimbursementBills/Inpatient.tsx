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

interface IpAdmission {
  id: number;
  ipNo: string;
  billNo: string;
  adDate: string;
  disDate: string; // empty string = not yet discharged
  genPaid: number;
  pharPaid: number;
  labPaid: number;
  procPaid: number;
  totPaid: number;
  ipDisc: number;
}

interface PatientRecord {
  patientName: string;
  opNo: string;
  admissions: IpAdmission[];
}

// ─── Demo data ────────────────────────────────────────────────────────────────

const DEMO_RECORDS: Record<string, PatientRecord> = {
  "OP-2026-0341": {
    patientName: "Anitha Kumari",
    opNo: "OP-2026-0341",
    admissions: [
      {
        id: 1,
        ipNo: "IP-2026-0201",
        billNo: "IPB-3001",
        adDate: "01-03-2026",
        disDate: "07-03-2026",
        genPaid: 8500,
        pharPaid: 3200,
        labPaid: 1800,
        procPaid: 2500,
        totPaid: 16000,
        ipDisc: 1500,
      },
    ],
  },
  "OP-2026-0342": {
    patientName: "Suresh Babu",
    opNo: "OP-2026-0342",
    admissions: [
      {
        id: 2,
        ipNo: "IP-2026-0205",
        billNo: "IPB-3005",
        adDate: "05-03-2026",
        disDate: "10-03-2026",
        genPaid: 12000,
        pharPaid: 5400,
        labPaid: 3200,
        procPaid: 0,
        totPaid: 20600,
        ipDisc: 600,
      },
      {
        id: 3,
        ipNo: "IP-2026-0218",
        billNo: "IPB-3018",
        adDate: "12-03-2026",
        disDate: "",
        genPaid: 0,
        pharPaid: 0,
        labPaid: 0,
        procPaid: 0,
        totPaid: 0,
        ipDisc: 0,
      },
    ],
  },
  "OP-2026-0350": {
    patientName: "Mohammed Iqbal",
    opNo: "OP-2026-0350",
    admissions: [
      {
        id: 4,
        ipNo: "IP-2026-0190",
        billNo: "IPB-2990",
        adDate: "20-02-2026",
        disDate: "28-02-2026",
        genPaid: 15000,
        pharPaid: 7800,
        labPaid: 4500,
        procPaid: 6000,
        totPaid: 33300,
        ipDisc: 2300,
      },
      {
        id: 5,
        ipNo: "IP-2026-0210",
        billNo: "IPB-3010",
        adDate: "08-03-2026",
        disDate: "13-03-2026",
        genPaid: 9500,
        pharPaid: 3100,
        labPaid: 2200,
        procPaid: 1500,
        totPaid: 16300,
        ipDisc: 800,
      },
    ],
  },
  "OP-2026-0355": {
    patientName: "Venkatesh Rao",
    opNo: "OP-2026-0355",
    admissions: [
      {
        id: 6,
        ipNo: "IP-2026-0195",
        billNo: "IPB-2995",
        adDate: "25-02-2026",
        disDate: "05-03-2026",
        genPaid: 22000,
        pharPaid: 9600,
        labPaid: 5800,
        procPaid: 8000,
        totPaid: 45400,
        ipDisc: 3400,
      },
    ],
  },
  "OP-2026-0360": {
    patientName: "Deepa Krishnan",
    opNo: "OP-2026-0360",
    admissions: [
      {
        id: 7,
        ipNo: "IP-2026-0220",
        billNo: "IPB-3020",
        adDate: "10-03-2026",
        disDate: "",
        genPaid: 0,
        pharPaid: 0,
        labPaid: 0,
        procPaid: 0,
        totPaid: 0,
        ipDisc: 0,
      },
    ],
  },
  "OP-2026-0370": {
    patientName: "Rajesh Kumar",
    opNo: "OP-2026-0370",
    admissions: [
      {
        id: 8,
        ipNo: "IP-2026-0175",
        billNo: "IPB-2975",
        adDate: "10-02-2026",
        disDate: "18-02-2026",
        genPaid: 18500,
        pharPaid: 6200,
        labPaid: 3800,
        procPaid: 4500,
        totPaid: 33000,
        ipDisc: 1000,
      },
      {
        id: 9,
        ipNo: "IP-2026-0207",
        billNo: "IPB-3007",
        adDate: "06-03-2026",
        disDate: "12-03-2026",
        genPaid: 11000,
        pharPaid: 4800,
        labPaid: 2900,
        procPaid: 3200,
        totPaid: 21900,
        ipDisc: 900,
      },
    ],
  },
};

// ─── Style helpers ────────────────────────────────────────────────────────────

const TH: React.CSSProperties = {
  background: "var(--color-primary, #0d6efd)",
  color: "#fff",
  fontSize: "var(--font-size-sm)",
  whiteSpace: "nowrap",
};

const FMT = (n: number) => n.toFixed(2);

// ─── Section heading ──────────────────────────────────────────────────────────

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

// ─── Main component ───────────────────────────────────────────────────────────

export default function Inpatient() {
  const today = new Date().toISOString().split("T")[0];

  const [dateFrom, setDateFrom] = useState<string>(today);
  const [dateTo, setDateTo] = useState<string>(today);
  const [opNo, setOpNo] = useState<string>("");
  const [record, setRecord] = useState<PatientRecord | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [selectedAdmission, setSelectedAdmission] = useState<IpAdmission | null>(null);
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
    setSelectedAdmission(null);
    setSubmitted(true);
  };

  const handleBillClick = (admission: IpAdmission) => {
    setSelectedAdmission(admission);
    setShowDetail(true);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setSelectedAdmission(null);
  };

  return (
    <Container fluid className="report-container">
      <ReportHeader
        title="In Patient Reimbursement Bill"
        subtitle="Search and view in-patient reimbursement bill details by OP number"
        onPrint={() => printReport()}
        onExport={() => {
          if (!record) return;
          exportToExcel(
            record.admissions.map((a, i) => ({
              "Sl.No": i + 1,
              "IP No": a.ipNo,
              "Bill No": a.billNo,
              "Admission Date": a.adDate,
              "Discharge Date": a.disDate || "Not Discharged",
              "General Bill": a.genPaid,
              "Pharmacy Bill": a.pharPaid,
              "Lab Bill": a.labPaid,
              "IP Procedure": a.procPaid,
              "Total": a.totPaid,
              "Discount": a.ipDisc,
              "Net Amount": a.totPaid - a.ipDisc,
            })),
            `IP_Reimb_${record.opNo}`
          );
        }}
      />

      {/* ── Filter Card ──────────────────────────────────────────────────── */}
      <Card className="report-filter-card mb-3">
        <Card.Body>
          <Row className="align-items-end g-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label
                  className="fw-semibold"
                  style={{ fontSize: "var(--font-size-sm)" }}
                >
                  Date From
                </Form.Label>
                <Form.Control
                  type="date"
                  value={dateFrom}
                  onChange={(e) => {
                    setDateFrom(e.target.value);
                    setSubmitted(false);
                  }}
                  style={{ fontSize: "var(--font-size-sm)" }}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label
                  className="fw-semibold"
                  style={{ fontSize: "var(--font-size-sm)" }}
                >
                  Date To
                </Form.Label>
                <Form.Control
                  type="date"
                  value={dateTo}
                  onChange={(e) => {
                    setDateTo(e.target.value);
                    setSubmitted(false);
                  }}
                  style={{ fontSize: "var(--font-size-sm)" }}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label
                  className="fw-semibold"
                  style={{ fontSize: "var(--font-size-sm)" }}
                >
                  OP Number
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g. OP-2026-0341"
                  value={opNo}
                  onChange={(e) => {
                    setOpNo(e.target.value);
                    setSubmitted(false);
                  }}
                  onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
                  style={{ fontSize: "var(--font-size-sm)" }}
                />
              </Form.Group>
            </Col>
            <Col md="auto">
              <Button
                variant="primary"
                onClick={handleSubmit}
                style={{ fontSize: "var(--font-size-sm)" }}
              >
                <i className="fas fa-search me-1" />
                Submit
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* ── Results ──────────────────────────────────────────────────────── */}
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
                  <strong style={{ color: "var(--color-primary, #0d6efd)" }}>
                    Name :{" "}
                  </strong>
                  <span className="text-danger fw-semibold">
                    {record.patientName}
                  </span>
                </span>
                <span>
                  <strong style={{ color: "var(--color-primary, #0d6efd)" }}>
                    OP No :{" "}
                  </strong>
                  <span className="text-danger fw-semibold">{record.opNo}</span>
                </span>
              </Card.Body>
            </Card>

            {/* IP Admissions table */}
            <Card className="mb-3">
              <Card.Header
                className="py-2"
                style={{
                  background: "var(--color-primary, #0d6efd)",
                  color: "#fff",
                }}
              >
                <strong style={{ fontSize: "var(--font-size-sm)" }}>
                  In-Patient Admissions
                </strong>
              </Card.Header>
              <Card.Body className="p-0">
                <div className="table-responsive">
                  <Table
                    bordered
                    hover
                    className="mb-0"
                    style={{ fontSize: "var(--font-size-sm)" }}
                  >
                    <thead>
                      <tr>
                        <th style={{ ...TH, width: 55 }}>S No</th>
                        <th style={TH}>IP No</th>
                        <th style={TH}>Bill No</th>
                        <th style={TH}>Ad. Date</th>
                        <th style={TH}>Dis. Date</th>
                        <th style={TH}>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {record.admissions.map((adm, i) => (
                        <tr
                          key={adm.id}
                          style={{
                            background: i % 2 === 0 ? "#fff" : "#f8f9fa",
                          }}
                        >
                          <td className="text-center">{i + 1}</td>
                          <td>{adm.ipNo}</td>
                          <td>
                            {adm.disDate ? (
                              <span
                                role="button"
                                className="text-primary text-decoration-underline"
                                style={{ cursor: "pointer" }}
                                onClick={() => handleBillClick(adm)}
                              >
                                {adm.billNo}
                              </span>
                            ) : (
                              <span className="text-muted">{adm.billNo}</span>
                            )}
                          </td>
                          <td className="text-center">{adm.adDate}</td>
                          <td className="text-center">
                            {adm.disDate || (
                              <span className="text-muted fst-italic">
                                Ongoing
                              </span>
                            )}
                          </td>
                          <td>
                            {adm.disDate ? (
                              <Badge
                                bg="success"
                                style={{ fontSize: "var(--font-size-xs)" }}
                              >
                                Discharged
                              </Badge>
                            ) : (
                              <Badge
                                bg="warning"
                                text="dark"
                                style={{ fontSize: "var(--font-size-xs)" }}
                              >
                                Admitted
                              </Badge>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </>
        ) : (
          <Card>
            <Card.Body
              className="text-center text-muted py-5"
              style={{ fontSize: "var(--font-size-sm)" }}
            >
              <i className="fas fa-search fa-2x mb-3 d-block" />
              No record found for OP Number <strong>{opNo}</strong> in the
              selected date range.
            </Card.Body>
          </Card>
        )
      )}

      {/* ── Bill Detail Modal ─────────────────────────────────────────────── */}
      {selectedAdmission && (
        <Modal
          show={showDetail}
          onHide={handleCloseDetail}
          size="lg"
          scrollable
        >
          <Modal.Header
            closeButton
            style={{
              background: "var(--color-primary, #0d6efd)",
              color: "#fff",
            }}
          >
            <Modal.Title style={{ fontSize: "var(--font-size-md)" }}>
              In Patient Reimbursement Bill
            </Modal.Title>
          </Modal.Header>
          <Modal.Body style={{ fontSize: "var(--font-size-sm)" }}>
            {/* Patient & admission info */}
            <Row className="mb-2">
              <Col>
                <strong style={{ color: "var(--color-primary, #0d6efd)" }}>
                  Name :{" "}
                </strong>
                <span className="text-danger">{record?.patientName}</span>
              </Col>
              <Col>
                <strong style={{ color: "var(--color-primary, #0d6efd)" }}>
                  OP No :{" "}
                </strong>
                <span className="text-danger">{record?.opNo}</span>
              </Col>
            </Row>
            <Row className="mb-3">
              <Col>
                <strong style={{ color: "var(--color-primary, #0d6efd)" }}>
                  Ad. Date :{" "}
                </strong>
                <span className="text-danger">
                  {selectedAdmission.adDate}
                </span>
              </Col>
              <Col>
                <strong style={{ color: "var(--color-primary, #0d6efd)" }}>
                  Dis. Date :{" "}
                </strong>
                <span className="text-danger">
                  {selectedAdmission.disDate}
                </span>
              </Col>
            </Row>

            <SectionHeading title="Bill Summary" />

            {/* Bill summary table */}
            <Table bordered size="sm" className="mb-3">
              <thead>
                <tr>
                  <th style={{ ...TH, width: 55 }}>S No</th>
                  <th style={TH} colSpan={2}>
                    Particulars
                  </th>
                  <th style={{ ...TH, textAlign: "right", width: 160 }}>
                    Amount (₹)
                  </th>
                </tr>
              </thead>
              <tbody>
                {[
                  { label: "General Bill Amount", val: selectedAdmission.genPaid },
                  { label: "Pharmacy Bill Amount", val: selectedAdmission.pharPaid },
                  { label: "Lab Bill Amount", val: selectedAdmission.labPaid },
                  { label: "IP Procedure Amount", val: selectedAdmission.procPaid },
                ].map((row, i) => (
                  <tr
                    key={i}
                    style={{ background: i % 2 === 0 ? "#fff" : "#f8f9fa" }}
                  >
                    <td className="text-center">{i + 1}</td>
                    <td colSpan={2}>&nbsp;&nbsp;{row.label}</td>
                    <td
                      className="text-end text-danger"
                      style={{ fontWeight: "var(--font-weight-medium)" }}
                    >
                      {FMT(row.val)}&nbsp;&nbsp;&nbsp;
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td />
                  <td
                    colSpan={2}
                    className="text-end fw-semibold"
                  >
                    Total Amount :&nbsp;&nbsp;&nbsp;
                  </td>
                  <td className="text-end text-danger fw-semibold">
                    {FMT(selectedAdmission.totPaid)}&nbsp;&nbsp;&nbsp;
                  </td>
                </tr>
                <tr style={{ background: "#e8f5e9" }}>
                  <td />
                  <td
                    colSpan={2}
                    className="text-end fw-semibold"
                    style={{ color: "#2e7d32" }}
                  >
                    Total Discount :&nbsp;&nbsp;&nbsp;
                  </td>
                  <td
                    className="text-end fw-semibold"
                    style={{ color: "#2e7d32" }}
                  >
                    {FMT(selectedAdmission.ipDisc)}&nbsp;&nbsp;&nbsp;
                  </td>
                </tr>
                <tr style={{ background: "#e8eaf6" }}>
                  <td />
                  <td
                    colSpan={2}
                    className="text-end"
                    style={{
                      color: "var(--color-primary, #0d6efd)",
                      fontWeight: "var(--font-weight-bold)",
                    }}
                  >
                    Net Amount :&nbsp;&nbsp;&nbsp;
                  </td>
                  <td
                    className="text-end text-danger"
                    style={{ fontWeight: "var(--font-weight-bold)" }}
                  >
                    {FMT(
                      selectedAdmission.totPaid - selectedAdmission.ipDisc
                    )}
                    &nbsp;&nbsp;&nbsp;
                  </td>
                </tr>
              </tfoot>
            </Table>

            {/* KPI cards */}
            <Row className="g-2 mt-1">
              {[
                { label: "General", val: selectedAdmission.genPaid, color: "#0d6efd" },
                { label: "Pharmacy", val: selectedAdmission.pharPaid, color: "#6f42c1" },
                { label: "Laboratory", val: selectedAdmission.labPaid, color: "#198754" },
                { label: "IP Procedure", val: selectedAdmission.procPaid, color: "#fd7e14" },
              ].map((k) => (
                <Col key={k.label} xs={6} md={3}>
                  <div
                    className="p-2 rounded text-white text-center"
                    style={{
                      background: k.color,
                      fontSize: "var(--font-size-xs)",
                    }}
                  >
                    <div style={{ fontWeight: "var(--font-weight-semibold)" }}>
                      {k.label}
                    </div>
                    <div
                      style={{
                        fontSize: "var(--font-size-md)",
                        fontWeight: "var(--font-weight-bold)",
                      }}
                    >
                      ₹{FMT(k.val)}
                    </div>
                  </div>
                </Col>
              ))}
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button
              variant="outline-secondary"
              size="sm"
              onClick={handleCloseDetail}
            >
              Close
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={() => printReport()}
            >
              <i className="fas fa-print me-1" />
              Print
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </Container>
  );
}

