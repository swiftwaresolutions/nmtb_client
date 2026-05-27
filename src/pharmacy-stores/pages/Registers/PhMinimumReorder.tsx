import React, { useMemo } from "react";
import { Container, Card, Row, Col, Table, Badge } from "react-bootstrap";
import ReportHeader from "../../../medical-records/components/ReportHeader";
import ReportKPICard from "../../../medical-records/components/ReportKPICard";
import { useTableSearch } from "../../../hooks/useTableSearch";
import SearchInput from "../../../components/SearchInput";
import {
  printReport,
  exportToExcel,
} from "../../../medical-records/utils/reportUtils";
import "../../../medical-records/styles/reportStyles.css";

// ─── Types ────────────────────────────────────────────────────────────────────
interface ReorderRecord {
  id: number;
  medicineName: string;
  stock: number;
  min: number;
}

// ─── Demo Data ────────────────────────────────────────────────────────────────
const DEMO_RECORDS: ReorderRecord[] = [
  { id: 1,  medicineName: "Amoxicillin 250mg",        stock: 18,   min: 50  },
  { id: 2,  medicineName: "Amlodipine 5mg",            stock: 800,  min: 100 },
  { id: 3,  medicineName: "Atorvastatin 10mg",         stock: 42,   min: 100 },
  { id: 4,  medicineName: "Azithromycin 500mg",        stock: 200,  min: 75  },
  { id: 5,  medicineName: "Ceftriaxone 1g Inj.",       stock: 8,    min: 30  },
  { id: 6,  medicineName: "Ciprofloxacin 500mg",       stock: 350,  min: 100 },
  { id: 7,  medicineName: "Dexamethasone 4mg Inj.",    stock: 12,   min: 20  },
  { id: 8,  medicineName: "Diazepam 5mg",              stock: 5,    min: 50  },
  { id: 9,  medicineName: "Dolo 650mg",                stock: 1200, min: 200 },
  { id: 10, medicineName: "Doxycycline 100mg",         stock: 60,   min: 100 },
  { id: 11, medicineName: "Enalapril 5mg",             stock: 400,  min: 150 },
  { id: 12, medicineName: "Glucometer Strips (50ct)",  stock: 4,    min: 20  },
  { id: 13, medicineName: "Ibuprofen 400mg",           stock: 600,  min: 100 },
  { id: 14, medicineName: "Insulin Regular 10ml",      stock: 7,    min: 25  },
  { id: 15, medicineName: "Metformin 500mg",           stock: 900,  min: 200 },
  { id: 16, medicineName: "Metronidazole 400mg",       stock: 38,   min: 100 },
  { id: 17, medicineName: "Morphine 10mg Inj.",        stock: 3,    min: 15  },
  { id: 18, medicineName: "Omeprazole 20mg",           stock: 700,  min: 150 },
  { id: 19, medicineName: "Ondansetron 4mg Inj.",      stock: 9,    min: 30  },
  { id: 20, medicineName: "Paracetamol 500mg",         stock: 1500, min: 300 },
  { id: 21, medicineName: "Pantoprazole 40mg",         stock: 45,   min: 100 },
  { id: 22, medicineName: "Ramipril 5mg",              stock: 300,  min: 100 },
  { id: 23, medicineName: "Sertraline 50mg",           stock: 14,   min: 50  },
  { id: 24, medicineName: "Tramadol 50mg",             stock: 22,   min: 50  },
];
// ─────────────────────────────────────────────────────────────────────────────

function getStockStatus(stock: number, min: number) {
  if (stock === 0)        return { label: "Out of Stock", bg: "#f8d7da", color: "#58151c", badge: "danger"  };
  if (stock <= min)       return { label: "Reorder Now",  bg: "#fff3cd", color: "#664d03", badge: "warning" };
  return                         { label: "Adequate",     bg: "inherit", color: "inherit", badge: "success" };
}

export default function PhMinimumReorder() {
  const { filteredData, searchTerm, setSearchTerm, resultCount, totalCount } =
    useTableSearch({
      data: DEMO_RECORDS,
      searchFields: ["medicineName"],
    });

  const stats = useMemo(() => ({
    total:      DEMO_RECORDS.length,
    outOfStock: DEMO_RECORDS.filter((r) => r.stock === 0).length,
    belowMin:   DEMO_RECORDS.filter((r) => r.stock > 0 && r.stock <= r.min).length,
    adequate:   DEMO_RECORDS.filter((r) => r.stock > r.min).length,
  }), []);

  const handleExport = () => {
    const data = filteredData.map((r, i) => ({
      "S. No":          i + 1,
      "Medicine Name":  r.medicineName,
      "Stock":          r.stock,
      "Min":            r.min,
      "Status":         getStockStatus(r.stock, r.min).label,
    }));
    exportToExcel(data, "Minimum_Reorder_Level", "Minimum Reorder Level");
  };

  return (
    <React.Fragment>
      <Container fluid className="px-4 py-3">
        <ReportHeader
          title="Minimum Reorder Level"
          subtitle="Medicines at or below minimum stock level"
          onPrint={printReport}
          onExport={handleExport}
          onSearch={() => {}}
          showSearch={false}
          showSort={false}
          showPrint={true}
          showExport={true}
        />

        {/* KPI Cards */}
        <Row className="mb-4">
          <Col md={3}>
            <ReportKPICard label="Total Medicines"  value={stats.total}      variant="primary" />
          </Col>
          <Col md={3}>
            <ReportKPICard label="Out of Stock"     value={stats.outOfStock} variant="danger"  />
          </Col>
          <Col md={3}>
            <ReportKPICard label="Reorder Now"      value={stats.belowMin}   variant="warning" />
          </Col>
          <Col md={3}>
            <ReportKPICard label="Adequate Stock"   value={stats.adequate}   variant="success" />
          </Col>
        </Row>

        {/* Table Card */}
        <Card className="report-card">
          <div
            style={{
              padding: "0.6rem 1rem",
              borderBottom: "1px solid #dee2e6",
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              flexWrap: "wrap",
              gap: "0.5rem",
            }}
          >
            <span
              style={{
                fontSize: "var(--font-size-sm)",
                fontWeight: "var(--font-weight-semibold)",
              }}
            >
              Stock vs Minimum Reorder Level
            </span>
            <div style={{ minWidth: "280px" }}>
              <SearchInput
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                placeholder="Search medicine name..."
                resultCount={resultCount}
                totalCount={totalCount}
              />
            </div>
          </div>

          {/* Legend */}
          <div
            className="no-print"
            style={{
              padding: "0.4rem 1rem",
              borderBottom: "1px solid #f0f0f0",
              display: "flex",
              gap: "1.25rem",
              alignItems: "center",
            }}
          >
            <span style={{ fontSize: "var(--font-size-xs)", color: "#666" }}>
              Legend:
            </span>
            {[
              { bg: "#f8d7da", color: "#58151c", label: "Out of Stock" },
              { bg: "#fff3cd", color: "#664d03", label: "Reorder Now (Stock ≤ Min)" },
              { bg: "#d1e7dd", color: "#0a3622", label: "Adequate Stock" },
            ].map((item) => (
              <span
                key={item.label}
                style={{
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "5px",
                  fontSize: "var(--font-size-xs)",
                }}
              >
                <span
                  style={{
                    width: "14px",
                    height: "14px",
                    borderRadius: "3px",
                    background: item.bg,
                    border: "1px solid #ccc",
                    display: "inline-block",
                  }}
                />
                <span style={{ color: item.color, fontWeight: "var(--font-weight-medium)" }}>
                  {item.label}
                </span>
              </span>
            ))}
          </div>

          <div style={{ overflowX: "auto" }}>
            <Table bordered size="sm" className="mb-0" style={{ minWidth: "480px" }}>
              <colgroup>
                <col style={{ width: "6%"  }} />
                <col style={{ width: "55%" }} />
                <col style={{ width: "13%" }} />
                <col style={{ width: "13%" }} />
                <col style={{ width: "13%" }} />
              </colgroup>
              <thead className="table-dark">
                <tr>
                  <th className="text-center">S. No</th>
                  <th>Medicine Name</th>
                  <th className="text-end">Stock</th>
                  <th className="text-end">Min</th>
                  <th className="text-center">Status</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-center py-4 text-muted">
                      No records found.
                    </td>
                  </tr>
                ) : (
                  filteredData.map((record, idx) => {
                    const status = getStockStatus(record.stock, record.min);
                    const needsAttention = record.stock <= record.min;
                    return (
                      <tr
                        key={record.id}
                        style={{
                          background: needsAttention
                            ? status.bg
                            : idx % 2 === 0
                            ? "#fdfdfd"
                            : "#f1f1f1",
                        }}
                      >
                        <td className="text-center">{idx + 1}</td>
                        <td
                          style={{
                            fontWeight: needsAttention
                              ? "var(--font-weight-semibold)"
                              : "var(--font-weight-normal)",
                          }}
                        >
                          &nbsp;&nbsp;{record.medicineName}
                        </td>
                        <td
                          className="text-end pe-3"
                          style={{
                            color: needsAttention ? status.color : "inherit",
                            fontWeight: needsAttention
                              ? "var(--font-weight-bold)"
                              : "var(--font-weight-normal)",
                          }}
                        >
                          {record.stock}
                        </td>
                        <td className="text-end pe-3">{record.min}</td>
                        <td className="text-center">
                          <Badge
                            bg={status.badge as any}
                            style={{
                              fontSize: "var(--font-size-xs)",
                              fontWeight: "var(--font-weight-semibold)",
                              padding: "3px 8px",
                            }}
                          >
                            {status.label}
                          </Badge>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </Table>
          </div>
        </Card>
      </Container>
    </React.Fragment>
  );
}
