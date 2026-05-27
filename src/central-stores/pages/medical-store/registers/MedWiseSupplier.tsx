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
  Badge,
} from "react-bootstrap";
import ReportHeader from "../../../../medical-records/components/ReportHeader";
import ReportKPICard from "../../../../medical-records/components/ReportKPICard";
import ReportTable from "../../../../medical-records/components/ReportTable";
import {
  searchTableData,
  sortTableData,
  exportToExcel,
  printReport,
  formatReportDate,
} from "../../../../medical-records/utils/reportUtils";
import "../../../../medical-records/styles/reportStyles.css";

// ─── Demo Data ────────────────────────────────────────────────────────────────
const DEMO_PRODUCTS = [
  {
    id: 1,
    productName: "Amoxicillin 250mg",
    groupName: "Antibiotics",
    companyName: "Sun Pharmaceuticals",
    suppliers: [
      { date: "01/01/2026", supplierName: "MedLine Distributors", batchNo: "AMX-001", invoiceNo: "INV-1001", grNo: "GR-201", quantity: 500 },
      { date: "15/11/2025", supplierName: "HealthPlus Traders", batchNo: "AMX-002", invoiceNo: "INV-0895", grNo: "GR-198", quantity: 300 },
    ],
  },
  {
    id: 2,
    productName: "Atorvastatin 10mg",
    groupName: "Lipid Lowering",
    companyName: "Cipla Ltd",
    suppliers: [
      { date: "05/02/2026", supplierName: "PharmaCare Pvt Ltd", batchNo: "ATV-011", invoiceNo: "INV-1102", grNo: "GR-210", quantity: 200 },
    ],
  },
  {
    id: 3,
    productName: "Azithromycin 500mg",
    groupName: "Antibiotics",
    companyName: "Zydus Cadila",
    suppliers: [
      { date: "12/01/2026", supplierName: "MedLine Distributors", batchNo: "AZI-005", invoiceNo: "INV-1050", grNo: "GR-205", quantity: 150 },
      { date: "03/12/2025", supplierName: "Global Med Supplies", batchNo: "AZI-004", invoiceNo: "INV-0940", grNo: "GR-190", quantity: 100 },
    ],
  },
  {
    id: 4,
    productName: "Bandage 10cm",
    groupName: "Surgical Supplies",
    companyName: "Johnson & Johnson",
    suppliers: [
      { date: "20/01/2026", supplierName: "SurgMed Distributors", batchNo: "BND-030", invoiceNo: "INV-1065", grNo: "GR-207", quantity: 250 },
    ],
  },
  {
    id: 5,
    productName: "Ciprofloxacin 500mg",
    groupName: "Antibiotics",
    companyName: "Dr. Reddy's Labs",
    suppliers: [
      { date: "08/02/2026", supplierName: "HealthPlus Traders", batchNo: "CIP-007", invoiceNo: "INV-1120", grNo: "GR-214", quantity: 400 },
      { date: "10/12/2025", supplierName: "PharmaCare Pvt Ltd", batchNo: "CIP-006", invoiceNo: "INV-0970", grNo: "GR-192", quantity: 200 },
    ],
  },
  {
    id: 6,
    productName: "Cotton Roll 500g",
    groupName: "Surgical Supplies",
    companyName: "Romsons Group",
    suppliers: [
      { date: "15/01/2026", supplierName: "SurgMed Distributors", batchNo: "CTN-015", invoiceNo: "INV-1055", grNo: "GR-206", quantity: 100 },
    ],
  },
  {
    id: 7,
    productName: "Dolo 650mg",
    groupName: "Analgesics",
    companyName: "Micro Labs Ltd",
    suppliers: [
      { date: "02/02/2026", supplierName: "MedLine Distributors", batchNo: "DOL-022", invoiceNo: "INV-1088", grNo: "GR-209", quantity: 600 },
      { date: "18/11/2025", supplierName: "Global Med Supplies", batchNo: "DOL-021", invoiceNo: "INV-0860", grNo: "GR-185", quantity: 400 },
    ],
  },
  {
    id: 8,
    productName: "Ibuprofen 400mg",
    groupName: "Analgesics",
    companyName: "Abbott India",
    suppliers: [
      { date: "25/01/2026", supplierName: "PharmaCare Pvt Ltd", batchNo: "IBU-009", invoiceNo: "INV-1072", grNo: "GR-208", quantity: 300 },
    ],
  },
  {
    id: 9,
    productName: "IV Set 20 drops/ml",
    groupName: "IV Supplies",
    companyName: "B. Braun Medical",
    suppliers: [
      { date: "10/02/2026", supplierName: "SurgMed Distributors", batchNo: "IVS-003", invoiceNo: "INV-1130", grNo: "GR-215", quantity: 350 },
      { date: "05/01/2026", supplierName: "HealthPlus Traders", batchNo: "IVS-002", invoiceNo: "INV-1010", grNo: "GR-202", quantity: 200 },
    ],
  },
  {
    id: 10,
    productName: "Metformin 500mg",
    groupName: "Anti-Diabetics",
    companyName: "USV Pvt Ltd",
    suppliers: [
      { date: "01/02/2026", supplierName: "Global Med Supplies", batchNo: "MET-041", invoiceNo: "INV-1085", grNo: "GR-211", quantity: 500 },
      { date: "20/12/2025", supplierName: "MedLine Distributors", batchNo: "MET-040", invoiceNo: "INV-1000", grNo: "GR-195", quantity: 300 },
    ],
  },
  {
    id: 11,
    productName: "Omeprazole 20mg",
    groupName: "Gastro Drugs",
    companyName: "Alkem Laboratories",
    suppliers: [
      { date: "07/02/2026", supplierName: "PharmaCare Pvt Ltd", batchNo: "OMP-018", invoiceNo: "INV-1115", grNo: "GR-213", quantity: 450 },
    ],
  },
  {
    id: 12,
    productName: "Pantoprazole 40mg",
    groupName: "Gastro Drugs",
    companyName: "Sun Pharmaceuticals",
    suppliers: [
      { date: "14/01/2026", supplierName: "HealthPlus Traders", batchNo: "PAN-027", invoiceNo: "INV-1048", grNo: "GR-204", quantity: 250 },
      { date: "08/12/2025", supplierName: "Global Med Supplies", batchNo: "PAN-026", invoiceNo: "INV-0955", grNo: "GR-191", quantity: 180 },
    ],
  },
  {
    id: 13,
    productName: "Paracetamol 500mg",
    groupName: "Analgesics",
    companyName: "GSK Pharmaceuticals",
    suppliers: [
      { date: "03/02/2026", supplierName: "MedLine Distributors", batchNo: "PAR-001", invoiceNo: "INV-1092", grNo: "GR-212", quantity: 800 },
      { date: "25/11/2025", supplierName: "PharmaCare Pvt Ltd", batchNo: "PAR-000", invoiceNo: "INV-0905", grNo: "GR-188", quantity: 500 },
    ],
  },
  {
    id: 14,
    productName: "Surgical Gloves (M)",
    groupName: "Surgical Supplies",
    companyName: "Ansell Healthcare",
    suppliers: [
      { date: "18/01/2026", supplierName: "SurgMed Distributors", batchNo: "SGL-021", invoiceNo: "INV-1060", grNo: "GR-203", quantity: 1000 },
    ],
  },
];
// ─────────────────────────────────────────────────────────────────────────────

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

const TABLE_COLUMNS = [
  {
    key: "slNo",
    label: "Sl.No",
    sortable: false,
    render: (_: any, __: any, idx: number) => idx + 1,
  },
  {
    key: "productName",
    label: "Product Name",
    sortable: true,
    render: (value: any, record: any) =>
      value ? (
        <span
          style={{
            color: "var(--bs-primary, #0d6efd)",
            cursor: "pointer",
            fontWeight: "var(--font-weight-semibold)",
            textDecoration: "underline",
          }}
          onClick={(e) => {
            e.stopPropagation();
            (window as any).__viewSupplierDetails?.(record);
          }}
        >
          {value}
        </span>
      ) : null,
  },
  { key: "groupName", label: "Group Name", sortable: true },
  { key: "companyName", label: "Company Name", sortable: true },
];

export default function MedWiseSupplier() {
  const [searchText, setSearchText] = useState<string>("");
  const [activeLetter, setActiveLetter] = useState<string>("");
  const [allRecords] = useState<any[]>(DEMO_PRODUCTS);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortKey, setSortKey] = useState<string>("");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("asc");

  // Detail modal
  const [showModal, setShowModal] = useState(false);
  const [selectedRecord, setSelectedRecord] = useState<any>(null);

  (window as any).__viewSupplierDetails = (record: any) => {
    setSelectedRecord(record);
    setShowModal(true);
  };

  const filteredByLetter = useMemo(() => {
    let result = [...allRecords];
    if (activeLetter) {
      result = result.filter((r) =>
        r.productName.toUpperCase().startsWith(activeLetter)
      );
    }
    if (searchText.trim()) {
      const lower = searchText.toLowerCase();
      result = result.filter(
        (r) =>
          r.productName.toLowerCase().includes(lower) ||
          r.groupName.toLowerCase().includes(lower) ||
          r.companyName.toLowerCase().includes(lower)
      );
    }
    return result;
  }, [activeLetter, searchText, allRecords]);

  const displayedData = useMemo(() => {
    let result = [...filteredByLetter];
    if (searchTerm) {
      result = searchTableData(result, searchTerm, [
        "productName",
        "groupName",
        "companyName",
      ]);
    }
    if (sortKey) {
      result = sortTableData(result, sortKey, sortDirection);
    }
    return result;
  }, [filteredByLetter, searchTerm, sortKey, sortDirection]);

  const stats = useMemo(() => {
    const supplierNames = new Set(
      allRecords.flatMap((r) => r.suppliers.map((s: any) => s.supplierName))
    );
    const companyNames = new Set(allRecords.map((r) => r.companyName));
    return {
      products: allRecords.length,
      suppliers: supplierNames.size,
      companies: companyNames.size,
    };
  }, [allRecords]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDirection("asc");
    }
  };

  const handleLetterClick = (letter: string) => {
    setActiveLetter((prev) => (prev === letter ? "" : letter));
    setSearchText("");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveLetter("");
  };

  const handleReset = () => {
    setSearchText("");
    setActiveLetter("");
    setSearchTerm("");
    setSortKey("");
    setSortDirection("asc");
  };

  const handleExport = () => {
    const exportData = displayedData.map((r, i) => ({
      "Sl.No": i + 1,
      "Product Name": r.productName,
      "Group Name": r.groupName,
      "Company Name": r.companyName,
    }));
    exportToExcel(
      exportData,
      `MedWiseSupplier_${formatReportDate(new Date(), "DD-MM-YYYY")}`,
      "Product Wise Supplier"
    );
  };

  return (
    <React.Fragment>
      <Container fluid className="px-4 py-3">
        <ReportHeader
          title="Product Wise Supplier Details"
          subtitle={
            activeLetter
              ? `Products starting with '${activeLetter}'`
              : searchText
              ? `Search results for "${searchText}"`
              : "All Products"
          }
          onPrint={printReport}
          onExport={handleExport}
          onSearch={(term) => setSearchTerm(term)}
          showSearch={true}
          showSort={false}
          showPrint={true}
          showExport={true}
        />

        {/* Search + Alphabet Filter */}
        <Card className="mb-4 shadow-sm no-print">
          <Card.Body>
            <Form onSubmit={handleSearchSubmit}>
              {/* Top row: Alphabetical Listing label (left) + Search input + Button (right) */}
              <Row className="g-3 align-items-end mb-3">
                <Col md={4} className="d-flex align-items-center">
                  <span
                    style={{
                      fontWeight: "var(--font-weight-semibold)",
                      fontSize: "var(--font-size-base)",
                      color: "#000",
                    }}
                  >
                    Alphabetical Listing
                  </span>
                </Col>
                <Col md={5}>
                  <Form.Control
                    type="text"
                    placeholder="Search product, group or company..."
                    value={searchText}
                    onChange={(e) => {
                      setSearchText(e.target.value);
                      setActiveLetter("");
                    }}
                  />
                </Col>
                <Col md={3} className="d-flex gap-2">
                  <Button type="submit" variant="primary" className="w-50">
                    Submit
                  </Button>
                  <Button type="button" variant="secondary" className="w-50" onClick={handleReset}>
                    Reset
                  </Button>
                </Col>
              </Row>

              {/* A–Z Alphabet Buttons — full width, centered */}
              <div className="d-flex flex-wrap justify-content-center gap-1 pt-2">
                {ALPHABET.map((letter) => (
                  <Button
                    key={letter}
                    variant={activeLetter === letter ? "primary" : "outline-secondary"}
                    size="sm"
                    style={{
                      minWidth: "32px",
                      fontWeight: "var(--font-weight-semibold)",
                      fontSize: "var(--font-size-sm)",
                    }}
                    onClick={() => handleLetterClick(letter)}
                  >
                    {letter}
                  </Button>
                ))}
              </div>
            </Form>
          </Card.Body>
        </Card>

        {/* KPI Cards */}
        <Row className="mb-4">
          <Col md={4}>
            <ReportKPICard label="Total Products" value={stats.products} variant="primary" />
          </Col>
          <Col md={4}>
            <ReportKPICard label="Suppliers" value={stats.suppliers} variant="info" />
          </Col>
          <Col md={4}>
            <ReportKPICard label="Companies" value={stats.companies} variant="warning" />
          </Col>
        </Row>

        {/* Table */}
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
            <ReportTable
              data={displayedData}
              columns={TABLE_COLUMNS}
              onSort={handleSort}
              responsive={false}
              emptyMessage={
                searchText || activeLetter
                  ? "No products match the selected filter."
                  : "No data available."
              }
            />
          </div>

          {/* Result count */}
          {displayedData.length > 0 && (
            <div
              style={{
                padding: "0.5rem 1rem",
                borderTop: "2px solid #e0e0e0",
                background: "linear-gradient(to right, #fff8e1, #ffffff)",
              }}
            >
              <small className="text-muted" style={{ fontWeight: "var(--font-weight-medium)" }}>
                Showing: <strong>{displayedData.length}</strong> of{" "}
                <strong>{allRecords.length}</strong> products
              </small>
            </div>
          )}
        </Card>
      </Container>

      {/* Detail Modal — Medicine Wise Supplier Details */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton>
          <Modal.Title
            style={{
              fontSize: "var(--font-size-lg)",
              fontWeight: "var(--font-weight-semibold)",
            }}
          >
            Medicine Wise Supplier Details of &lsquo;
            <span style={{ color: "#0d6efd" }}>{selectedRecord?.productName}</span>&rsquo;
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedRecord && (
            <>
              {/* Product info strip */}
              <div
                className="mb-3 p-2 d-flex gap-4 flex-wrap"
                style={{
                  background: "#f8f9fa",
                  borderRadius: "6px",
                  border: "1px solid #dee2e6",
                }}
              >
                <small>
                  <span className="text-muted" style={{ fontWeight: "var(--font-weight-medium)" }}>
                    Group:{" "}
                  </span>
                  <Badge bg="secondary">{selectedRecord.groupName}</Badge>
                </small>
                <small>
                  <span className="text-muted" style={{ fontWeight: "var(--font-weight-medium)" }}>
                    Company:{" "}
                  </span>
                  <Badge bg="info">{selectedRecord.companyName}</Badge>
                </small>
              </div>

              {/* Supplier table */}
              <div style={{ overflowX: "auto" }}>
                <Table bordered size="sm">
                  <thead className="table-dark">
                    <tr>
                      <th className="text-center">Date</th>
                      <th>Supplier Name</th>
                      <th className="text-center">Batch No</th>
                      <th className="text-center">Invoice No</th>
                      <th className="text-center">GR No</th>
                      <th className="text-end">Quantity</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRecord.suppliers.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center text-muted py-3">
                          No supplier records found.
                        </td>
                      </tr>
                    ) : (
                      selectedRecord.suppliers.map((s: any, idx: number) => (
                        <tr key={idx}>
                          <td className="text-center">{s.date}</td>
                          <td>{s.supplierName}</td>
                          <td className="text-center">{s.batchNo}</td>
                          <td className="text-center">{s.invoiceNo}</td>
                          <td className="text-center">{s.grNo}</td>
                          <td className="text-end" style={{ fontWeight: "var(--font-weight-medium)" }}>
                            {s.quantity}
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
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
