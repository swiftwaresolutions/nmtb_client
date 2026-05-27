import React, { useState, useMemo } from "react";
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
import ReportKPICard from "../../../medical-records/components/ReportKPICard";
import {
  printReport,
  exportToExcel,
  formatReportDate,
} from "../../../medical-records/utils/reportUtils";
import { showValidationError } from "../../../utils/alertUtil";
import { useTableSearch } from "../../../hooks/useTableSearch";
import SearchInput from "../../../components/SearchInput";
import "../../../medical-records/styles/reportStyles.css";

// ─── Data model ───────────────────────────────────────────────────────────────

interface InvItem {
  slNo: number;
  particulars: string;
  rate: number;
}
interface InvBill {
  id: number;
  billNo: string;
  billTime: string;
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
  billTime: string;
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
  billTime: string;
  items: LabItem[];
  total: number;
  disc: number;
  pay: number;
  paid: number;
  bal: number;
}

interface PatientRecord {
  id: number;
  patientName: string;
  opNo: string;
  age: number;
  sex: "Male" | "Female";
  isNew: boolean;
  invBills: InvBill[];
  phBills: PhBill[];
  labBills: LabBill[];
}

// ─── Demo data ────────────────────────────────────────────────────────────────

const DEMO_DATA: Record<string, PatientRecord[]> = {
  "2026-03-13": [
    {
      id: 1,
      patientName: "Anitha Kumari",
      opNo: "OP-2026-0341",
      age: 42,
      sex: "Female",
      isNew: false,
      invBills: [
        {
          id: 1,
          billNo: "INV-1001",
          billTime: "09:15 AM",
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
          billTime: "09:45 AM",
          items: [
            { slNo: 1, medName: "Metformin 500mg", batch: "MF221", mrp: 45, quantity: 30, rate: 1260 },
            { slNo: 2, medName: "Amlodipine 5mg", batch: "AM331", mrp: 12, quantity: 30, rate: 330 },
          ],
          total: 1590,
          disc: 0,
          pay: 1590,
          paid: 1590,
          bal: 0,
        },
      ],
      labBills: [],
    },
    {
      id: 2,
      patientName: "Suresh Babu",
      opNo: "OP-2026-0342",
      age: 55,
      sex: "Male",
      isNew: false,
      invBills: [],
      phBills: [
        {
          id: 2,
          billNo: "PH-1022",
          billTime: "10:10 AM",
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
        },
      ],
      labBills: [
        {
          id: 1,
          billNo: "LAB-2041",
          billTime: "10:30 AM",
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
    },
    {
      id: 3,
      patientName: "Pooja Reddy",
      opNo: "OP-2026-0343",
      age: 28,
      sex: "Female",
      isNew: true,
      invBills: [
        {
          id: 3,
          billNo: "INV-1003",
          billTime: "11:00 AM",
          items: [
            { slNo: 1, particulars: "Consultation Fee", rate: 200 },
            { slNo: 2, particulars: "Ultrasound Abdomen", rate: 800 },
          ],
          total: 1000,
          disc: 0,
          pay: 1000,
          paid: 1000,
          bal: 0,
        },
      ],
      phBills: [],
      labBills: [
        {
          id: 2,
          billNo: "LAB-2042",
          billTime: "11:25 AM",
          items: [
            { slNo: 1, testName: "Urine Routine", rate: 150 },
            { slNo: 2, testName: "Blood Glucose (F)", rate: 120 },
          ],
          total: 270,
          disc: 0,
          pay: 270,
          paid: 270,
          bal: 0,
        },
      ],
    },
    {
      id: 4,
      patientName: "Mohammed Iqbal",
      opNo: "OP-2026-0344",
      age: 63,
      sex: "Male",
      isNew: false,
      invBills: [
        {
          id: 4,
          billNo: "INV-1004",
          billTime: "12:15 PM",
          items: [
            { slNo: 1, particulars: "Consultation Fee", rate: 300 },
            { slNo: 2, particulars: "Dressing", rate: 150 },
          ],
          total: 450,
          disc: 0,
          pay: 450,
          paid: 450,
          bal: 0,
        },
      ],
      phBills: [
        {
          id: 3,
          billNo: "PH-1024",
          billTime: "12:45 PM",
          items: [
            { slNo: 1, medName: "Amoxicillin 500mg", batch: "AX553", mrp: 22, quantity: 21, rate: 420 },
            { slNo: 2, medName: "Ibuprofen 400mg", batch: "IB772", mrp: 8, quantity: 20, rate: 150 },
          ],
          total: 570,
          disc: 0,
          pay: 570,
          paid: 570,
          bal: 0,
        },
      ],
      labBills: [],
    },
    {
      id: 5,
      patientName: "Kavitha Nair",
      opNo: "OP-2026-0345",
      age: 35,
      sex: "Female",
      isNew: true,
      invBills: [],
      phBills: [
        {
          id: 4,
          billNo: "PH-1025",
          billTime: "14:00 PM",
          items: [
            { slNo: 1, medName: "Folic Acid 5mg", batch: "FA881", mrp: 4, quantity: 30, rate: 90 },
            { slNo: 2, medName: "Iron Sucrose", batch: "IS991", mrp: 85, quantity: 5, rate: 400 },
          ],
          total: 490,
          disc: 0,
          pay: 490,
          paid: 490,
          bal: 0,
        },
      ],
      labBills: [
        {
          id: 3,
          billNo: "LAB-2045",
          billTime: "14:20 PM",
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
    },
  ],
  "2026-03-12": [
    {
      id: 6,
      patientName: "Rajesh Kumar",
      opNo: "OP-2026-0335",
      age: 47,
      sex: "Male",
      isNew: false,
      invBills: [
        {
          id: 5,
          billNo: "INV-0994",
          billTime: "09:00 AM",
          items: [
            { slNo: 1, particulars: "Consultation Fee", rate: 200 },
            { slNo: 2, particulars: "X-Ray Chest", rate: 500 },
          ],
          total: 700,
          disc: 0,
          pay: 700,
          paid: 700,
          bal: 0,
        },
      ],
      phBills: [
        {
          id: 5,
          billNo: "PH-1015",
          billTime: "09:30 AM",
          items: [
            { slNo: 1, medName: "Salbutamol Inhaler", batch: "SL110", mrp: 180, quantity: 1, rate: 160 },
            { slNo: 2, medName: "Montelukast 10mg", batch: "MN220", mrp: 35, quantity: 30, rate: 945 },
          ],
          total: 1105,
          disc: 105,
          pay: 1000,
          paid: 1000,
          bal: 0,
        },
      ],
      labBills: [],
    },
    {
      id: 7,
      patientName: "Latha Devi",
      opNo: "OP-2026-0336",
      age: 52,
      sex: "Female",
      isNew: false,
      invBills: [],
      phBills: [
        {
          id: 6,
          billNo: "PH-1016",
          billTime: "10:40 AM",
          items: [
            { slNo: 1, medName: "Levothyroxine 50mcg", batch: "LV330", mrp: 30, quantity: 30, rate: 810 },
          ],
          total: 810,
          disc: 0,
          pay: 810,
          paid: 400,
          bal: 410,
        },
      ],
      labBills: [
        {
          id: 4,
          billNo: "LAB-2036",
          billTime: "11:00 AM",
          items: [
            { slNo: 1, testName: "TSH", rate: 350 },
            { slNo: 2, testName: "Free T3 & T4", rate: 500 },
          ],
          total: 850,
          disc: 50,
          pay: 800,
          paid: 800,
          bal: 0,
        },
      ],
    },
    {
      id: 8,
      patientName: "Arun Prasad",
      opNo: "OP-2026-0337",
      age: 31,
      sex: "Male",
      isNew: true,
      invBills: [
        {
          id: 6,
          billNo: "INV-0996",
          billTime: "11:30 AM",
          items: [
            { slNo: 1, particulars: "Consultation Fee", rate: 200 },
            { slNo: 2, particulars: "Wound Dressing", rate: 100 },
            { slNo: 3, particulars: "Injection Fee", rate: 50 },
          ],
          total: 350,
          disc: 0,
          pay: 350,
          paid: 350,
          bal: 0,
        },
      ],
      phBills: [
        {
          id: 7,
          billNo: "PH-1018",
          billTime: "11:55 AM",
          items: [
            { slNo: 1, medName: "Cefixime 200mg", batch: "CF551", mrp: 28, quantity: 10, rate: 250 },
            { slNo: 2, medName: "Pantoprazole 40mg", batch: "PT662", mrp: 15, quantity: 14, rate: 190 },
          ],
          total: 440,
          disc: 0,
          pay: 440,
          paid: 440,
          bal: 0,
        },
      ],
      labBills: [],
    },
  ],
};

// ─── Bill tfoot helper ────────────────────────────────────────────────────────

interface BillSummary {
  total: number;
  disc: number;
  pay: number;
  paid: number;
  bal: number;
}

function BillTfoot({ s, cols }: { s: BillSummary; cols: number }) {
  const span = cols - 1;
  return (
    <tfoot>
      {s.total !== 0 && (
        <tr>
          <td colSpan={span} className="text-end fw-semibold">
            Total :
          </td>
          <td className="text-end">{s.total.toFixed(2)}</td>
        </tr>
      )}
      {s.disc !== 0 && (
        <tr style={{ background: "#e8f5e9" }}>
          <td colSpan={span} className="text-end fw-semibold" style={{ color: "#2e7d32" }}>
            Discount :
          </td>
          <td className="text-end" style={{ color: "#2e7d32" }}>
            {s.disc.toFixed(2)}
          </td>
        </tr>
      )}
      {s.pay !== 0 && (
        <tr>
          <td colSpan={span} className="text-end fw-semibold">
            Pay :
          </td>
          <td className="text-end">{s.pay.toFixed(2)}</td>
        </tr>
      )}
      {s.paid !== 0 && (
        <tr style={{ background: "#fff9c4" }}>
          <td colSpan={span} className="text-end fw-semibold" style={{ color: "#f57f17" }}>
            Paid :
          </td>
          <td className="text-end" style={{ color: "#f57f17" }}>
            {s.paid.toFixed(2)}
          </td>
        </tr>
      )}
      {s.bal !== 0 && (
        <tr style={{ background: "#fce4ec" }}>
          <td colSpan={span} className="text-end fw-semibold" style={{ color: "#c62828" }}>
            Balance :
          </td>
          <td className="text-end" style={{ color: "#c62828" }}>
            {s.bal.toFixed(2)}
          </td>
        </tr>
      )}
    </tfoot>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────

const TH: React.CSSProperties = {
  background: "var(--color-primary, #0d6efd)",
  color: "#fff",
  fontSize: "var(--font-size-sm)",
};

// ─── Main component ───────────────────────────────────────────────────────────

export default function OutPatientDateWise() {
  const today = new Date().toISOString().split("T")[0];

  const [selectedDate, setSelectedDate] = useState<string>(today);
  const [submitted, setSubmitted] = useState(false);
  const [activePatient, setActivePatient] = useState<PatientRecord | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  const patients: PatientRecord[] = useMemo(
    () => (submitted ? DEMO_DATA[selectedDate] ?? [] : []),
    [submitted, selectedDate]
  );

  const { filteredData, searchTerm, setSearchTerm, resultCount, totalCount } =
    useTableSearch({ data: patients, searchFields: ["patientName", "opNo"] });

  const kpiNew = patients.filter((p) => p.isNew).length;
  const kpiMale = patients.filter((p) => p.sex === "Male").length;
  const kpiFemale = patients.filter((p) => p.sex === "Female").length;

  const handleSubmit = () => {
    if (!selectedDate) {
      showValidationError("Please select a date.", "Validation");
      return;
    }
    setSubmitted(true);
    setSearchTerm("");
  };

  const handlePatientClick = (patient: PatientRecord) => {
    setActivePatient(patient);
    setShowDetail(true);
  };

  const handleCloseDetail = () => {
    setShowDetail(false);
    setActivePatient(null);
  };

  return (
    <Container fluid className="report-container">
      <ReportHeader
        title="Out Patient Reimbursement Bill"
        subtitle="Date-wise patient reimbursement bill register"
        onPrint={() => printReport()}
        onExport={() =>
          exportToExcel(
            patients.map((p, i) => ({
              "Sl.No": i + 1,
              "Patient Name": p.patientName,
              "OP No": p.opNo,
              "Age": p.age,
              "Sex": p.sex,
              "New Patient": p.isNew ? "Yes" : "No",
            })),
            `OP_Reimbursement_${selectedDate}`
          )
        }
      />

      {/* Filter */}
      <Card className="report-filter-card mb-3">
        <Card.Body>
          <Row className="align-items-end g-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label
                  className="fw-semibold"
                  style={{ fontSize: "var(--font-size-sm)" }}
                >
                  Select Date
                </Form.Label>
                <Form.Control
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    setSubmitted(false);
                  }}
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

      {submitted && (
        <>
          {/* KPI cards */}
          <Row className="g-3 mb-3">
            <Col md={3} sm={6}>
              <ReportKPICard
                label="Total Patients"
                value={patients.length}
                variant="primary"
                icon={<i className="fas fa-users" />}
              />
            </Col>
            <Col md={3} sm={6}>
              <ReportKPICard
                label="New Patients"
                value={kpiNew}
                variant="success"
                icon={<i className="fas fa-user-plus" />}
              />
            </Col>
            <Col md={3} sm={6}>
              <ReportKPICard
                label="Male"
                value={kpiMale}
                variant="info"
                icon={<i className="fas fa-mars" />}
              />
            </Col>
            <Col md={3} sm={6}>
              <ReportKPICard
                label="Female"
                value={kpiFemale}
                variant="warning"
                icon={<i className="fas fa-venus" />}
              />
            </Col>
          </Row>

          {/* Search */}
          <Card className="mb-3">
            <Card.Body className="py-2">
              <SearchInput
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                placeholder="Search by patient name or OP No..."
                resultCount={resultCount}
                totalCount={totalCount}
              />
            </Card.Body>
          </Card>

          {/* Patient list */}
          <Card>
            <Card.Header
              className="py-2"
              style={{
                background: "var(--color-primary, #0d6efd)",
                color: "#fff",
              }}
            >
              <strong style={{ fontSize: "var(--font-size-sm)" }}>
                Out Patient Reimbursement Bill —{" "}
                {formatReportDate(selectedDate)}
              </strong>
            </Card.Header>
            <Card.Body className="p-0">
              <div id="op-reimb-date-wise" className="table-responsive">
                <Table
                  bordered
                  hover
                  className="mb-0"
                  style={{ fontSize: "var(--font-size-sm)" }}
                >
                  <thead>
                    <tr>
                      <th style={{ ...TH, width: "60px" }}>S No</th>
                      <th style={TH}>Patient Name</th>
                      <th style={{ ...TH, width: "140px" }}>OP No</th>
                      <th style={{ ...TH, width: "70px" }}>Age</th>
                      <th style={{ ...TH, width: "90px" }}>Sex</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.length === 0 ? (
                      <tr>
                        <td
                          colSpan={5}
                          className="text-center text-muted py-4"
                        >
                          {patients.length === 0
                            ? "No patients found for the selected date."
                            : "No records match your search."}
                        </td>
                      </tr>
                    ) : (
                      filteredData.map((patient, idx) => (
                        <tr
                          key={patient.id}
                          style={{
                            background: idx % 2 === 0 ? "#fff" : "#f8f9fa",
                          }}
                        >
                          <td className="text-center">{idx + 1}</td>
                          <td>
                            {patient.patientName}
                            {patient.isNew && (
                              <Badge
                                bg="success"
                                className="ms-2"
                                style={{ fontSize: "var(--font-size-xs)" }}
                              >
                                New
                              </Badge>
                            )}
                          </td>
                          <td>
                            <span
                              role="button"
                              className="text-primary text-decoration-underline"
                              style={{ cursor: "pointer" }}
                              onClick={() => handlePatientClick(patient)}
                            >
                              {patient.opNo}
                            </span>
                          </td>
                          <td className="text-center">{patient.age}</td>
                          <td>{patient.sex}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </>
      )}

      {/* Bill Details Modal */}
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
            Out Patient Reimbursement Bill Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {activePatient && (
            <>
              {/* Patient meta */}
              <Row className="mb-3 g-2" style={{ fontSize: "var(--font-size-sm)" }}>
                <Col md={6}>
                  <strong>Patient Name : </strong>
                  <span style={{ color: "#800080" }}>
                    {activePatient.patientName}
                  </span>
                </Col>
                <Col md={6}>
                  <strong>OP No : </strong>
                  <span style={{ color: "#800080" }}>{activePatient.opNo}</span>
                </Col>
                <Col md={6}>
                  <strong>Age : </strong>
                  <span style={{ color: "#800080" }}>{activePatient.age}</span>
                </Col>
                <Col md={6}>
                  <strong>Sex : </strong>
                  <span style={{ color: "#800080" }}>{activePatient.sex}</span>
                </Col>
                <Col md={12}>
                  <strong>Bills Date : </strong>
                  <strong style={{ color: "#c00" }}>
                    {formatReportDate(selectedDate)}
                  </strong>
                </Col>
              </Row>

              {/* Investigation Bills */}
              {activePatient.invBills.length > 0 && (
                <div className="mb-3">
                  <h6
                    style={{
                      color: "#800080",
                      fontSize: "var(--font-size-sm)",
                    }}
                    className="fw-semibold"
                  >
                    Investigation Bill Details
                  </h6>
                  {activePatient.invBills.map((bill) => (
                    <div key={bill.id} className="mb-3">
                      <div
                        className="d-flex justify-content-between mb-1"
                        style={{ fontSize: "var(--font-size-sm)" }}
                      >
                        <span>
                          Bill No :{" "}
                          <strong style={{ color: "#c00" }}>
                            {bill.billNo}
                          </strong>
                        </span>
                        <span>
                          Bill Time :{" "}
                          <strong style={{ color: "#c00" }}>
                            {bill.billTime}
                          </strong>
                        </span>
                      </div>
                      <Table
                        bordered
                        size="sm"
                        style={{ fontSize: "var(--font-size-sm)" }}
                      >
                        <thead>
                          <tr>
                            <th style={{ ...TH, width: "55px" }}>S No</th>
                            <th style={TH}>Particulars</th>
                            <th style={{ ...TH, width: "120px" }}>Rate</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bill.items.map((item) => (
                            <tr key={item.slNo}>
                              <td className="text-center">{item.slNo}</td>
                              <td>{item.particulars}</td>
                              <td className="text-end">
                                {item.rate.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <BillTfoot s={bill} cols={3} />
                      </Table>
                    </div>
                  ))}
                </div>
              )}

              {/* Pharmacy Bills */}
              {activePatient.phBills.length > 0 && (
                <div className="mb-3">
                  <h6
                    style={{
                      color: "#800080",
                      fontSize: "var(--font-size-sm)",
                    }}
                    className="fw-semibold"
                  >
                    Pharmacy Bill Details
                  </h6>
                  {activePatient.phBills.map((bill) => (
                    <div key={bill.id} className="mb-3">
                      <div
                        className="d-flex justify-content-between mb-1"
                        style={{ fontSize: "var(--font-size-sm)" }}
                      >
                        <span>
                          Bill No :{" "}
                          <strong style={{ color: "#c00" }}>
                            {bill.billNo}
                          </strong>
                        </span>
                        <span>
                          Bill Time :{" "}
                          <strong style={{ color: "#c00" }}>
                            {bill.billTime}
                          </strong>
                        </span>
                      </div>
                      <Table
                        bordered
                        size="sm"
                        style={{ fontSize: "var(--font-size-sm)" }}
                      >
                        <thead>
                          <tr>
                            <th style={{ ...TH, width: "45px" }}>S No</th>
                            <th style={TH}>Med Name</th>
                            <th style={{ ...TH, width: "85px" }}>Batch</th>
                            <th style={{ ...TH, width: "75px" }}>MRP</th>
                            <th style={{ ...TH, width: "70px" }}>Qty</th>
                            <th style={{ ...TH, width: "90px" }}>Rate</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bill.items.map((item) => (
                            <tr key={item.slNo}>
                              <td className="text-center">{item.slNo}</td>
                              <td>{item.medName}</td>
                              <td>{item.batch}</td>
                              <td className="text-end">
                                {item.mrp.toFixed(2)}
                              </td>
                              <td className="text-end">{item.quantity}</td>
                              <td className="text-end">
                                {item.rate.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <BillTfoot s={bill} cols={6} />
                      </Table>
                    </div>
                  ))}
                </div>
              )}

              {/* Laboratory Bills */}
              {activePatient.labBills.length > 0 && (
                <div className="mb-3">
                  <h6
                    style={{
                      color: "#800080",
                      fontSize: "var(--font-size-sm)",
                    }}
                    className="fw-semibold"
                  >
                    Laboratory Bill Details
                  </h6>
                  {activePatient.labBills.map((bill) => (
                    <div key={bill.id} className="mb-3">
                      <div
                        className="d-flex justify-content-between mb-1"
                        style={{ fontSize: "var(--font-size-sm)" }}
                      >
                        <span>
                          Bill No :{" "}
                          <strong style={{ color: "#c00" }}>
                            {bill.billNo}
                          </strong>
                        </span>
                        <span>
                          Bill Time :{" "}
                          <strong style={{ color: "#c00" }}>
                            {bill.billTime}
                          </strong>
                        </span>
                      </div>
                      <Table
                        bordered
                        size="sm"
                        style={{ fontSize: "var(--font-size-sm)" }}
                      >
                        <thead>
                          <tr>
                            <th style={{ ...TH, width: "55px" }}>S No</th>
                            <th style={TH}>Test Name</th>
                            <th style={{ ...TH, width: "120px" }}>Rate</th>
                          </tr>
                        </thead>
                        <tbody>
                          {bill.items.map((item) => (
                            <tr key={item.slNo}>
                              <td className="text-center">{item.slNo}</td>
                              <td>{item.testName}</td>
                              <td className="text-end">
                                {item.rate.toFixed(2)}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <BillTfoot s={bill} cols={3} />
                      </Table>
                    </div>
                  ))}
                </div>
              )}

              {activePatient.invBills.length === 0 &&
                activePatient.phBills.length === 0 &&
                activePatient.labBills.length === 0 && (
                  <p
                    className="text-muted text-center py-3"
                    style={{ fontSize: "var(--font-size-sm)" }}
                  >
                    No bill details available for this patient.
                  </p>
                )}
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCloseDetail}
          >
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}

