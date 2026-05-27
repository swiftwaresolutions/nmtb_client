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
} from "react-bootstrap";
import ReportHeader from "../../../medical-records/components/ReportHeader";
import { printReport, exportToExcel } from "../../../medical-records/utils/reportUtils";
import { useTableSearch } from "../../../hooks/useTableSearch";
import SearchInput from "../../../components/SearchInput";
import "../../../medical-records/styles/reportStyles.css";

// ─── Types ────────────────────────────────────────────────────────────────────

interface IpDueRow {
  slNo: number;
  ipNo: string;
  opNo: string;
  patientName: string;
  wardName: string;
  cash: number;
  cashDue: number;
  pharmacy: number;
  pharmacyDue: number;
  lab: number;
  labDue: number;
}

// ─── Demo data ────────────────────────────────────────────────────────────────

const ALL_RECORDS: IpDueRow[] = [
  {
    slNo: 1, ipNo: "IP-2026-0201", opNo: "OP-2026-0341",
    patientName: "Anitha Kumari", wardName: "General Ward",
    cash: 5000, cashDue: 1200, pharmacy: 1780, pharmacyDue: 500, lab: 520, labDue: 0,
  },
  {
    slNo: 2, ipNo: "IP-2026-0205", opNo: "OP-2026-0342",
    patientName: "Suresh Babu", wardName: "Male Surgical Ward",
    cash: 12000, cashDue: 3000, pharmacy: 2775, pharmacyDue: 0, lab: 2350, labDue: 800,
  },
  {
    slNo: 3, ipNo: "IP-2026-0218", opNo: "OP-2026-0342",
    patientName: "Suresh Babu", wardName: "Cardiology Ward",
    cash: 8000, cashDue: 4500, pharmacy: 510, pharmacyDue: 0, lab: 600, labDue: 0,
  },
  {
    slNo: 4, ipNo: "IP-2026-0190", opNo: "OP-2026-0350",
    patientName: "Mohammed Iqbal", wardName: "Diabetic Ward",
    cash: 9500, cashDue: 0, pharmacy: 2630, pharmacyDue: 1200, lab: 1490, labDue: 500,
  },
  {
    slNo: 5, ipNo: "IP-2026-0220", opNo: "OP-2026-0360",
    patientName: "Deepa Krishnan", wardName: "Female Medical Ward",
    cash: 6000, cashDue: 2000, pharmacy: 2730, pharmacyDue: 0, lab: 1260, labDue: 260,
  },
  {
    slNo: 6, ipNo: "IP-2026-0225", opNo: "OP-2026-0355",
    patientName: "Venkatesh Rao", wardName: "Male Medical Ward",
    cash: 15000, cashDue: 0, pharmacy: 4200, pharmacyDue: 0, lab: 3100, labDue: 0,
  },
  {
    slNo: 7, ipNo: "IP-2026-0230", opNo: "OP-2026-0370",
    patientName: "Kavitha Nair", wardName: "Gynaecology Ward",
    cash: 7000, cashDue: 1500, pharmacy: 1850, pharmacyDue: 600, lab: 980, labDue: 200,
  },
  {
    slNo: 8, ipNo: "IP-2026-0235", opNo: "OP-2026-0375",
    patientName: "Ramesh Chandran", wardName: "Orthopaedic Ward",
    cash: 20000, cashDue: 5000, pharmacy: 3600, pharmacyDue: 0, lab: 2400, labDue: 0,
  },
  {
    slNo: 9, ipNo: "IP-2026-0240", opNo: "OP-2026-0380",
    patientName: "Priya Sharma", wardName: "Paediatric Ward",
    cash: 4000, cashDue: 800, pharmacy: 920, pharmacyDue: 0, lab: 750, labDue: 350,
  },
  {
    slNo: 10, ipNo: "IP-2026-0245", opNo: "OP-2026-0385",
    patientName: "Lakshmi Devi", wardName: "General Ward",
    cash: 3500, cashDue: 3500, pharmacy: 1100, pharmacyDue: 1100, lab: 450, labDue: 450,
  },
];

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TH: React.CSSProperties = {
  background: "var(--color-primary, #0d6efd)",
  color: "#fff",
  fontSize: "var(--font-size-sm)",
  whiteSpace: "nowrap",
};

const FMT = (n: number) =>
  n === 0 ? (
    <span style={{ color: "#aaa" }}>—</span>
  ) : (
    <>{n.toFixed(2)}</>
  );

const DUE_BADGE = (n: number) =>
  n > 0 ? (
    <Badge
      bg="danger"
      style={{ fontSize: "var(--font-size-xs)", fontWeight: "var(--font-weight-semibold)" }}
    >
      {n.toFixed(2)}
    </Badge>
  ) : (
    <span style={{ color: "#aaa" }}>—</span>
  );

// ─── Component ────────────────────────────────────────────────────────────────

export default function IpCollection() {
  const [patientName, setPatientName] = useState("");
  const [ipNumber, setIpNumber] = useState("");
  const [wardSearch, setWardSearch] = useState("");
  const [searched, setSearched] = useState(false);
  const [results, setResults] = useState<IpDueRow[]>([]);

  const { filteredData, searchTerm, setSearchTerm, resultCount, totalCount } =
    useTableSearch({
      data: results,
      searchFields: ["patientName", "ipNo", "opNo", "wardName"],
    });

  const handleSearch = () => {
    const filtered = ALL_RECORDS.filter((row) => {
      const nameMatch = !patientName.trim() ||
        row.patientName.toLowerCase().includes(patientName.trim().toLowerCase());
      const ipMatch = !ipNumber.trim() ||
        row.ipNo.toLowerCase().includes(ipNumber.trim().toLowerCase());
      const wardMatch = !wardSearch.trim() ||
        row.wardName.toLowerCase().includes(wardSearch.trim().toLowerCase());
      return nameMatch && ipMatch && wardMatch;
    });
    setResults(filtered);
    setSearched(true);
  };

  const totalCash = filteredData.reduce((s, r) => s + r.cash, 0);
  const totalCashDue = filteredData.reduce((s, r) => s + r.cashDue, 0);
  const totalPh = filteredData.reduce((s, r) => s + r.pharmacy, 0);
  const totalPhDue = filteredData.reduce((s, r) => s + r.pharmacyDue, 0);
  const totalLab = filteredData.reduce((s, r) => s + r.lab, 0);
  const totalLabDue = filteredData.reduce((s, r) => s + r.labDue, 0);

  return (
    <Container fluid className="report-container">
      <ReportHeader
        title="IP Due & Collection Report"
        subtitle="View inpatient due and collection details by patient, IP number, or ward"
        onPrint={() => printReport()}
        onExport={() =>
          exportToExcel(
            filteredData.map((r, i) => ({
              "Sl.No": i + 1,
              "I.P No": r.ipNo,
              "Op No": r.opNo,
              "Patient Name": r.patientName,
              "Ward Name": r.wardName,
              "Cash (₹)": r.cash,
              "Cash Due (₹)": r.cashDue,
              "Pharmacy (₹)": r.pharmacy,
              "Pharmacy Due (₹)": r.pharmacyDue,
              "Lab (₹)": r.lab,
              "Lab Due (₹)": r.labDue,
            })),
            "IP_Due_Collection_Report"
          )
        }
      />

      {/* ── Filter card ───────────────────────────────────────────────── */}
      <Card className="report-filter-card mb-3">
        <Card.Body>
          <Row className="align-items-end g-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-semibold)" }}>
                  Patient's Name
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Search by patient name"
                  value={patientName}
                  onChange={(e) => setPatientName(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  style={{ fontSize: "var(--font-size-sm)" }}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-semibold)" }}>
                  I.P Number
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g. IP-2026-0201"
                  value={ipNumber}
                  onChange={(e) => setIpNumber(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  style={{ fontSize: "var(--font-size-sm)" }}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label style={{ fontSize: "var(--font-size-sm)", fontWeight: "var(--font-weight-semibold)" }}>
                  I.P Ward
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="e.g. General Ward"
                  value={wardSearch}
                  onChange={(e) => setWardSearch(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  style={{ fontSize: "var(--font-size-sm)" }}
                />
              </Form.Group>
            </Col>
            <Col md="auto">
              <Button
                variant="primary"
                onClick={handleSearch}
                style={{ fontSize: "var(--font-size-sm)" }}
              >
                <i className="fas fa-search me-1" />
                Search
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* ── Results ───────────────────────────────────────────────────── */}
      {searched && (
        results.length === 0 ? (
          <Card>
            <Card.Body
              className="text-center text-muted py-5"
              style={{ fontSize: "var(--font-size-sm)" }}
            >
              <i className="fas fa-search fa-2x mb-3 d-block" />
              No records found for the given search criteria.
            </Card.Body>
          </Card>
        ) : (
          <Card>
            <Card.Header
              className="d-flex align-items-center justify-content-between py-2"
              style={{ background: "var(--color-primary, #0d6efd)", color: "#fff" }}
            >
              <strong style={{ fontSize: "var(--font-size-sm)" }}>
                IP Due &amp; Collection Report
              </strong>
              <SearchInput
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                placeholder="Filter results..."
                resultCount={resultCount}
                totalCount={totalCount}
              />
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive" id="printablediv">
                <Table
                  bordered
                  hover
                  className="mb-0"
                  style={{ fontSize: "var(--font-size-sm)" }}
                >
                  <thead>
                    <tr>
                      <th style={{ ...TH, textAlign: "center" }}>Sl.No.</th>
                      <th style={TH}>I.P No</th>
                      <th style={TH}>Op No</th>
                      <th style={TH}>Patient Name</th>
                      <th style={TH}>Ward Name</th>
                      <th style={{ ...TH, textAlign: "right" }}>Cash (₹)</th>
                      <th style={{ ...TH, textAlign: "right" }}>Cash Due (₹)</th>
                      <th style={{ ...TH, textAlign: "right" }}>Pharmacy (₹)</th>
                      <th style={{ ...TH, textAlign: "right" }}>Ph. Due (₹)</th>
                      <th style={{ ...TH, textAlign: "right" }}>Lab (₹)</th>
                      <th style={{ ...TH, textAlign: "right" }}>Lab Due (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredData.map((row, i) => (
                      <tr
                        key={row.ipNo}
                        style={{ background: i % 2 === 0 ? "#fff" : "#f8f9fa" }}
                      >
                        <td className="text-center">{i + 1}</td>
                        <td>{row.ipNo}</td>
                        <td>{row.opNo}</td>
                        <td>{row.patientName}</td>
                        <td>{row.wardName}</td>
                        <td className="text-end">{FMT(row.cash)}</td>
                        <td className="text-end">{DUE_BADGE(row.cashDue)}</td>
                        <td className="text-end">{FMT(row.pharmacy)}</td>
                        <td className="text-end">{DUE_BADGE(row.pharmacyDue)}</td>
                        <td className="text-end">{FMT(row.lab)}</td>
                        <td className="text-end">{DUE_BADGE(row.labDue)}</td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot>
                    <tr
                      style={{
                        background: "var(--color-secondary-bg, #f0f4ff)",
                        fontWeight: "var(--font-weight-bold)",
                        fontSize: "var(--font-size-sm)",
                      }}
                    >
                      <td colSpan={5} className="text-end pe-3">
                        Total ({filteredData.length} records)
                      </td>
                      <td className="text-end">{totalCash.toFixed(2)}</td>
                      <td className="text-end" style={{ color: "var(--bs-danger, #dc3545)" }}>
                        {totalCashDue > 0 ? totalCashDue.toFixed(2) : "—"}
                      </td>
                      <td className="text-end">{totalPh.toFixed(2)}</td>
                      <td className="text-end" style={{ color: "var(--bs-danger, #dc3545)" }}>
                        {totalPhDue > 0 ? totalPhDue.toFixed(2) : "—"}
                      </td>
                      <td className="text-end">{totalLab.toFixed(2)}</td>
                      <td className="text-end" style={{ color: "var(--bs-danger, #dc3545)" }}>
                        {totalLabDue > 0 ? totalLabDue.toFixed(2) : "—"}
                      </td>
                    </tr>
                  </tfoot>
                </Table>
              </div>
            </Card.Body>
          </Card>
        )
      )}
    </Container>
  );
}

