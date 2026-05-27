import React, { useState, useMemo } from "react";
import {
  Container,
  Card,
  Form,
  Button,
  Row,
  Col,
  Table,
} from "react-bootstrap";
import ReportHeader from "../../../medical-records/components/ReportHeader";
import ReportKPICard from "../../../medical-records/components/ReportKPICard";
import {
  printReport,
  exportToExcel,
} from "../../../medical-records/utils/reportUtils";
import "../../../medical-records/styles/reportStyles.css";

// ─── Helpers ──────────────────────────────────────────────────────────────────
const fmtCurrency = (n: number) =>
  n.toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

const fmtQty = (n: number) =>
  Number.isInteger(n) ? n.toString() : n.toFixed(2).replace(/\.?0+$/, "");

const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");
const STORE_NAME = "Main Pharmacy Store";

// ─── Types ────────────────────────────────────────────────────────────────────
interface StockTaxRecord {
  id: number;
  medicineName: string;
  genericName: string;
  stock: number;
  cost: number;       // cost per unit
  taxPercent: number; // Tax %
  costValue: number;  // total cost value (cost × stock, pre-rounded)
  mrpValue: number;   // total MRP value
}

function calcRow(r: StockTaxRecord) {
  const taxAmount   = (r.cost * r.taxPercent) / 100;
  const costWithTax = r.cost + taxAmount;
  return { taxAmount, costWithTax };
}

// ─── Demo Data ────────────────────────────────────────────────────────────────
const DEMO_RECORDS: StockTaxRecord[] = [
  { id: 1,  medicineName: "Amoxicillin 250mg",        genericName: "Amoxicillin",            stock: 500,  cost: 4.50,   taxPercent: 12, costValue: 2250,   mrpValue: 3500  },
  { id: 2,  medicineName: "Amlodipine 5mg",            genericName: "Amlodipine Besylate",    stock: 800,  cost: 3.75,   taxPercent: 12, costValue: 3000,   mrpValue: 4800  },
  { id: 3,  medicineName: "Atorvastatin 10mg",         genericName: "Atorvastatin Calcium",   stock: 300,  cost: 8.00,   taxPercent: 12, costValue: 2400,   mrpValue: 3600  },
  { id: 4,  medicineName: "Azithromycin 500mg",        genericName: "Azithromycin",           stock: 200,  cost: 18.50,  taxPercent: 12, costValue: 3700,   mrpValue: 5600  },
  { id: 5,  medicineName: "Ceftriaxone 1g Inj.",       genericName: "Ceftriaxone Sodium",     stock: 100,  cost: 65.00,  taxPercent: 18, costValue: 6500,   mrpValue: 8500  },
  { id: 6,  medicineName: "Ciprofloxacin 500mg",       genericName: "Ciprofloxacin HCl",      stock: 350,  cost: 6.50,   taxPercent: 12, costValue: 2275,   mrpValue: 3500  },
  { id: 7,  medicineName: "Dexamethasone 4mg Inj.",    genericName: "Dexamethasone Sodium",   stock: 80,   cost: 18.00,  taxPercent: 12, costValue: 1440,   mrpValue: 1760  },
  { id: 8,  medicineName: "Dolo 650mg",                genericName: "Paracetamol",            stock: 1000, cost: 3.50,   taxPercent: 5,  costValue: 3500,   mrpValue: 4500  },
  { id: 9,  medicineName: "Doxycycline 100mg",         genericName: "Doxycycline HCl",        stock: 250,  cost: 7.00,   taxPercent: 12, costValue: 1750,   mrpValue: 2500  },
  { id: 10, medicineName: "Enalapril 5mg",             genericName: "Enalapril Maleate",      stock: 400,  cost: 4.00,   taxPercent: 12, costValue: 1600,   mrpValue: 2400  },
  { id: 11, medicineName: "Glucometer Strips (50ct)",  genericName: "Glucose Test Strips",    stock: 60,   cost: 180.00, taxPercent: 18, costValue: 10800,  mrpValue: 12600 },
  { id: 12, medicineName: "Ibuprofen 400mg",           genericName: "Ibuprofen",              stock: 600,  cost: 3.00,   taxPercent: 5,  costValue: 1800,   mrpValue: 2700  },
  { id: 13, medicineName: "Insulin Regular 10ml",      genericName: "Human Insulin",          stock: 45,   cost: 140.00, taxPercent: 5,  costValue: 6300,   mrpValue: 8325  },
  { id: 14, medicineName: "Metformin 500mg",           genericName: "Metformin HCl",          stock: 900,  cost: 4.00,   taxPercent: 12, costValue: 3600,   mrpValue: 4500  },
  { id: 15, medicineName: "Metronidazole 400mg",       genericName: "Metronidazole",          stock: 450,  cost: 3.50,   taxPercent: 5,  costValue: 1575,   mrpValue: 2250  },
  { id: 16, medicineName: "Omeprazole 20mg",           genericName: "Omeprazole",             stock: 700,  cost: 5.00,   taxPercent: 12, costValue: 3500,   mrpValue: 5250  },
  { id: 17, medicineName: "Ondansetron 4mg Inj.",      genericName: "Ondansetron HCl",        stock: 120,  cost: 14.00,  taxPercent: 12, costValue: 1680,   mrpValue: 2220  },
  { id: 18, medicineName: "Paracetamol 500mg",         genericName: "Paracetamol",            stock: 1200, cost: 1.80,   taxPercent: 5,  costValue: 2160,   mrpValue: 3000  },
  { id: 19, medicineName: "Pantoprazole 40mg",         genericName: "Pantoprazole Sodium",    stock: 500,  cost: 7.00,   taxPercent: 12, costValue: 3500,   mrpValue: 5250  },
  { id: 20, medicineName: "Ramipril 5mg",              genericName: "Ramipril",               stock: 300,  cost: 6.00,   taxPercent: 12, costValue: 1800,   mrpValue: 2700  },
  { id: 21, medicineName: "Sertraline 50mg",           genericName: "Sertraline HCl",         stock: 180,  cost: 12.00,  taxPercent: 12, costValue: 2160,   mrpValue: 3240  },
  { id: 22, medicineName: "Tramadol 50mg",             genericName: "Tramadol HCl",           stock: 200,  cost: 9.00,   taxPercent: 12, costValue: 1800,   mrpValue: 2700  },
];
// ─────────────────────────────────────────────────────────────────────────────

export default function PhStockTaxWise() {
  const [activeLetter, setActiveLetter] = useState<string | null>(null);
  const [searchInput,  setSearchInput]  = useState<string>("");
  const [searchText,   setSearchText]   = useState<string>("");

  const lettersWithData = useMemo(
    () => new Set(DEMO_RECORDS.map((r) => r.medicineName[0].toUpperCase())),
    []
  );

  const filteredData = useMemo(() => {
    let data = DEMO_RECORDS;
    if (activeLetter) {
      data = data.filter((r) =>
        r.medicineName.toUpperCase().startsWith(activeLetter)
      );
    }
    if (searchText.trim()) {
      const q = searchText.trim().toLowerCase();
      data = data.filter(
        (r) =>
          r.medicineName.toLowerCase().includes(q) ||
          r.genericName.toLowerCase().includes(q)
      );
    }
    return data;
  }, [activeLetter, searchText]);

  const totals = useMemo(
    () => ({
      stock:     filteredData.reduce((s, r) => s + r.stock, 0),
      costValue: filteredData.reduce((s, r) => s + r.costValue, 0),
      mrpValue:  filteredData.reduce((s, r) => s + r.mrpValue, 0),
    }),
    [filteredData]
  );

  const handleLetterClick = (letter: string) => {
    setActiveLetter((prev) => (prev === letter ? null : letter));
    setSearchInput("");
    setSearchText("");
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchText(searchInput);
    setActiveLetter(null);
  };

  const handleReset = () => {
    setActiveLetter(null);
    setSearchInput("");
    setSearchText("");
  };

  const handleExport = () => {
    const exportData = filteredData.map((r, i) => {
      const { taxAmount, costWithTax } = calcRow(r);
      return {
        "S. No":          i + 1,
        "Medicine Name":  r.medicineName,
        "Generic Name":   r.genericName,
        "Stock":          r.stock,
        "Cost":           fmtCurrency(r.cost),
        "Tax %":          r.taxPercent,
        "Tax Amt":        fmtCurrency(taxAmount),
        "Cost with Tax":  fmtCurrency(costWithTax),
        "Cost Value":     fmtCurrency(Math.round(r.costValue)),
        "MRP Value":      fmtCurrency(Math.round(r.mrpValue)),
      };
    });
    exportToExcel(
      exportData,
      `Stock_Tax_Wise_${new Date().toISOString().slice(0, 10)}`,
      "Stock Tax Wise"
    );
  };

  const tableTitle = activeLetter
    ? `Medicines Starting with '${activeLetter}' — ${STORE_NAME}`
    : searchText
    ? `Search results for: "${searchText}" — ${STORE_NAME}`
    : `All Medicines — ${STORE_NAME}`;

  return (
    <React.Fragment>
      <Container fluid className="px-4 py-3">
        <ReportHeader
          title="Stock Report of Medicines - Tax Wise"
          subtitle={tableTitle}
          onPrint={printReport}
          onExport={handleExport}
          onSearch={() => {}}
          showSearch={false}
          showSort={false}
          showPrint={true}
          showExport={true}
        />

        {/* Filter Card */}
        <Card className="mb-4 shadow-sm no-print">
          <Card.Body>
            {/* Text Search */}
            <Form
              onSubmit={handleSearchSubmit}
              className="row g-2 align-items-end mb-4"
            >
              <Form.Group as={Col} md={5} controlId="stockSearch">
                <Form.Label
                  style={{ fontWeight: "var(--font-weight-semibold)" }}
                >
                  Search Medicine
                </Form.Label>
                <Form.Control
                  type="text"
                  placeholder="Medicine name or generic name..."
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                />
              </Form.Group>
              <Form.Group
                as={Col}
                md="auto"
                className="d-flex gap-2 align-items-end"
              >
                <Button type="submit" variant="primary">
                  Search
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={handleReset}
                >
                  Reset
                </Button>
              </Form.Group>
            </Form>

            {/* A–Z Alphabet Strip */}
            <div>
              <div
                style={{
                  fontSize: "var(--font-size-sm)",
                  fontWeight: "var(--font-weight-semibold)",
                  color: "#555",
                  marginBottom: "0.5rem",
                }}
              >
                Alphabetical Listing
              </div>
              <div className="d-flex flex-wrap gap-1">
                {ALPHABET.map((letter) => {
                  const hasData = lettersWithData.has(letter);
                  const isActive = activeLetter === letter;
                  return (
                    <Button
                      key={letter}
                      size="sm"
                      variant={
                        isActive
                          ? "primary"
                          : hasData
                          ? "outline-primary"
                          : "outline-secondary"
                      }
                      style={{
                        minWidth: "30px",
                        padding: "2px 5px",
                        fontSize: "var(--font-size-sm)",
                        fontWeight: isActive
                          ? "var(--font-weight-bold)"
                          : "var(--font-weight-normal)",
                        opacity: hasData ? 1 : 0.35,
                      }}
                      disabled={!hasData}
                      onClick={() => handleLetterClick(letter)}
                    >
                      {letter}
                    </Button>
                  );
                })}
                {(activeLetter || searchText) && (
                  <Button
                    size="sm"
                    variant="outline-danger"
                    style={{ fontSize: "var(--font-size-sm)" }}
                    onClick={handleReset}
                  >
                    ✕ Clear
                  </Button>
                )}
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* KPI Cards */}
        <Row className="mb-4">
          <Col md={3}>
            <ReportKPICard
              label="Total Medicines"
              value={filteredData.length}
              variant="primary"
            />
          </Col>
          <Col md={3}>
            <ReportKPICard
              label="Total Stock Qty"
              value={fmtQty(totals.stock)}
              variant="info"
            />
          </Col>
          <Col md={3}>
            <ReportKPICard
              label="Total Cost Value"
              value={`₹ ${fmtCurrency(Math.round(totals.costValue))}`}
              variant="warning"
            />
          </Col>
          <Col md={3}>
            <ReportKPICard
              label="Total MRP Value"
              value={`₹ ${fmtCurrency(Math.round(totals.mrpValue))}`}
              variant="success"
            />
          </Col>
        </Row>

        {/* Main Table */}
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
              {tableTitle}
            </span>
            <span
              className="text-muted"
              style={{ fontSize: "var(--font-size-xs)" }}
            >
              Showing {filteredData.length} of {DEMO_RECORDS.length} records
            </span>
          </div>

          <div style={{ overflowX: "auto" }}>
            <Table
              bordered
              size="sm"
              className="mb-0"
              style={{ minWidth: "900px" }}
            >
              <colgroup>
                <col style={{ width: "4%"  }} />
                <col style={{ width: "19%" }} />
                <col style={{ width: "22%" }} />
                <col style={{ width: "7%"  }} />
                <col style={{ width: "7%"  }} />
                <col style={{ width: "5%"  }} />
                <col style={{ width: "7%"  }} />
                <col style={{ width: "10%" }} />
                <col style={{ width: "9%"  }} />
                <col style={{ width: "10%" }} />
              </colgroup>
              <thead className="table-dark">
                <tr>
                  <th className="text-center">S. No</th>
                  <th>Medicine Name</th>
                  <th>Generic Name</th>
                  <th className="text-end">Stock</th>
                  <th className="text-end">Cost</th>
                  <th className="text-end">Tax %</th>
                  <th className="text-end">Tax Amt</th>
                  <th className="text-end">Cost with Tax</th>
                  <th className="text-end">Cost Value</th>
                  <th className="text-end">MRP Value</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={10} className="text-center py-4 text-muted">
                      No records found.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((record, idx) => {
                    const { taxAmount, costWithTax } = calcRow(record);
                    return (
                      <tr
                        key={record.id}
                        style={{
                          background: idx % 2 === 0 ? "#fdfdfd" : "#f1f1f1",
                        }}
                      >
                        <td className="text-center">{idx + 1}</td>
                        <td>&nbsp;&nbsp;{record.medicineName}</td>
                        <td>&nbsp;&nbsp;{record.genericName}</td>
                        <td className="text-end pe-3">{fmtQty(record.stock)}</td>
                        <td className="text-end pe-3">{fmtCurrency(record.cost)}</td>
                        <td className="text-end pe-3">{record.taxPercent}</td>
                        <td className="text-end pe-3">{fmtCurrency(taxAmount)}</td>
                        <td className="text-end pe-3">{fmtCurrency(costWithTax)}</td>
                        <td className="text-end pe-3">
                          {fmtCurrency(Math.round(record.costValue))}
                        </td>
                        <td className="text-end pe-3">
                          {fmtCurrency(Math.round(record.mrpValue))}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
              {filteredData.length > 0 && (
                <tfoot>
                  <tr
                    style={{
                      background: "#fff8f8",
                      fontWeight: "var(--font-weight-bold)",
                    }}
                  >
                    <td
                      colSpan={8}
                      className="text-end pe-3 text-danger"
                    >
                      Total Value :
                    </td>
                    <td className="text-end pe-3 text-danger">
                      {fmtCurrency(Math.round(totals.costValue))}
                    </td>
                    <td className="text-end pe-3 text-danger">
                      {fmtCurrency(Math.round(totals.mrpValue))}
                    </td>
                  </tr>
                </tfoot>
              )}
            </Table>
          </div>
        </Card>
      </Container>
    </React.Fragment>
  );
}
