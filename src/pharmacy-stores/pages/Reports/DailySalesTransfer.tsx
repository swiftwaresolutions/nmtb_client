import React, { useState } from "react";
import { Container, Card, Form, Button, Table, Badge } from "react-bootstrap";
import { faBoxes } from "@fortawesome/free-solid-svg-icons";
import PageHeader from "../../../components/PageHeader";
import { showValidationError } from "../../../utils/alertUtil";

// ─── Interface ───────────────────────────────────────────────────────────────

interface StockRow {
  sNo: number;
  itemName: string;
  currentStock: number;
  soldQuantity: number;
  monthlyConsumption: number;
  reorderQuantity: number;
}

// ─── Dummy Data ───────────────────────────────────────────────────────────────

const DUMMY_STOCK: StockRow[] = [
  { sNo: 1,  itemName: "Paracetamol 500mg",        currentStock: 240, soldQuantity: 60,  monthlyConsumption: 180, reorderQuantity: 100 },
  { sNo: 2,  itemName: "Amoxicillin 250mg",         currentStock: 120, soldQuantity: 42,  monthlyConsumption: 126, reorderQuantity: 150 },
  { sNo: 3,  itemName: "Metformin 500mg",           currentStock: 310, soldQuantity: 90,  monthlyConsumption: 270, reorderQuantity: 200 },
  { sNo: 4,  itemName: "Atorvastatin 10mg",         currentStock:  85, soldQuantity: 35,  monthlyConsumption: 105, reorderQuantity: 120 },
  { sNo: 5,  itemName: "Amlodipine 5mg",            currentStock:  50, soldQuantity: 28,  monthlyConsumption:  84, reorderQuantity: 100 },
  { sNo: 6,  itemName: "Azithromycin 500mg",        currentStock:  72, soldQuantity: 18,  monthlyConsumption:  54, reorderQuantity:  80 },
  { sNo: 7,  itemName: "Ibuprofen 400mg",           currentStock: 195, soldQuantity: 75,  monthlyConsumption: 225, reorderQuantity: 150 },
  { sNo: 8,  itemName: "Cetirizine 10mg",           currentStock: 160, soldQuantity: 55,  monthlyConsumption: 165, reorderQuantity: 120 },
  { sNo: 9,  itemName: "Omeprazole 20mg",           currentStock: 230, soldQuantity: 80,  monthlyConsumption: 240, reorderQuantity: 200 },
  { sNo: 10, itemName: "Losartan 50mg",             currentStock:  40, soldQuantity: 25,  monthlyConsumption:  75, reorderQuantity: 100 },
  { sNo: 11, itemName: "Pantoprazole 40mg",         currentStock: 175, soldQuantity: 65,  monthlyConsumption: 195, reorderQuantity: 150 },
  { sNo: 12, itemName: "Glimepiride 2mg",           currentStock:  95, soldQuantity: 38,  monthlyConsumption: 114, reorderQuantity: 120 },
  { sNo: 13, itemName: "Vitamin D3 60000 IU",       currentStock:  60, soldQuantity: 20,  monthlyConsumption:  60, reorderQuantity:  80 },
  { sNo: 14, itemName: "Aspirin 75mg",              currentStock: 280, soldQuantity: 95,  monthlyConsumption: 285, reorderQuantity: 200 },
  { sNo: 15, itemName: "Ciprofloxacin 500mg",       currentStock: 115, soldQuantity: 44,  monthlyConsumption: 132, reorderQuantity: 150 },
  { sNo: 16, itemName: "Lisinopril 10mg",           currentStock:  35, soldQuantity: 22,  monthlyConsumption:  66, reorderQuantity: 100 },
  { sNo: 17, itemName: "Rabeprazole 20mg",          currentStock: 140, soldQuantity: 50,  monthlyConsumption: 150, reorderQuantity: 120 },
  { sNo: 18, itemName: "Tinidazole 500mg",          currentStock: 200, soldQuantity: 70,  monthlyConsumption: 210, reorderQuantity: 150 },
  { sNo: 19, itemName: "B-Complex Capsules",        currentStock:  88, soldQuantity: 30,  monthlyConsumption:  90, reorderQuantity: 100 },
  { sNo: 20, itemName: "ORS Powder",                currentStock:  25, soldQuantity: 15,  monthlyConsumption:  45, reorderQuantity:  60 },
];

// ─── Component ────────────────────────────────────────────────────────────────

const DailySalesTransfer: React.FC = () => {
  const today = new Date().toISOString().split("T")[0];
  const [fromDate, setFromDate] = useState(today);
  const [toDate, setToDate] = useState(today);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [rows, setRows] = useState<StockRow[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fromDate || !toDate) { showValidationError("Please select both From Date and To Date."); return; }
    if (new Date(fromDate) > new Date(toDate)) { showValidationError("From Date cannot be later than To Date."); return; }
    setLoading(true);
    setTimeout(() => {
      setRows(DUMMY_STOCK);
      setSearched(true);
      setLoading(false);
    }, 400);
  };

  const handleReset = () => {
    setFromDate(today); setToDate(today); setRows([]); setSearched(false);
  };

  const isLowStock = (row: StockRow) => row.currentStock < row.reorderQuantity;

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", minHeight: 0, overflow: "hidden" }}>
      <PageHeader
        icon={faBoxes}
        title="Daily Stock Flow Report"
        subtitle="View item-wise stock movement by date range"
      />

      <div className="content-body" style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "1.5rem" }}>
        <Container fluid>

          {/* ── Filter Card ── */}
          <Card className="shadow-sm mb-3" style={{ borderRadius: "10px", border: "1px solid #e2e8f0" }}>
            <Card.Body className="py-3 px-4">
              <Form onSubmit={handleSubmit}>
                <div className="d-flex align-items-end gap-3 flex-wrap">
                  <div>
                    <Form.Label className="text-muted mb-1" style={{ fontSize: "0.78rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      From Date
                    </Form.Label>
                    <Form.Control
                      type="date"
                      value={fromDate}
                      onChange={(e) => setFromDate(e.target.value)}
                      disabled={loading}
                      style={{ width: "180px" }}
                    />
                  </div>
                  <div>
                    <Form.Label className="text-muted mb-1" style={{ fontSize: "0.78rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      To Date
                    </Form.Label>
                    <Form.Control
                      type="date"
                      value={toDate}
                      onChange={(e) => setToDate(e.target.value)}
                      disabled={loading}
                      style={{ width: "180px" }}
                    />
                  </div>
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={loading}
                    style={{ padding: "7px 18px" }}
                  >
                    {loading ? (
                      <><span className="spinner-border spinner-border-sm me-2"></span>Loading...</>
                    ) : (
                      <><i className="fas fa-search me-1"></i>Submit</>
                    )}
                  </Button>
                  {searched && (
                    <Button variant="outline-secondary" onClick={handleReset} disabled={loading} style={{ padding: "7px 14px" }}>
                      <i className="fas fa-times"></i>
                    </Button>
                  )}
                </div>
              </Form>
            </Card.Body>
          </Card>

          {/* ── Results Table ── */}
          {searched && (
            <Card className="shadow-sm" style={{ borderRadius: "10px", border: "1px solid #e2e8f0" }}>
              <Card.Header
                className="d-flex align-items-center justify-content-between py-2 px-3"
                style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", borderRadius: "10px 10px 0 0" }}
              >
                <div className="d-flex align-items-center gap-2">
                  <div style={{ width: "4px", height: "20px", background: "#2563eb", borderRadius: "2px" }}></div>
                  <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "#1e293b" }}>Stock Flow Report</span>
                  <Badge bg="primary" style={{ fontSize: "0.75rem", padding: "3px 10px", borderRadius: "20px", opacity: 0.85 }}>
                    {rows.length} Items
                  </Badge>
                  <Badge bg="danger" style={{ fontSize: "0.75rem", padding: "3px 10px", borderRadius: "20px", opacity: 0.85 }}>
                    {rows.filter(isLowStock).length} Low Stock
                  </Badge>
                </div>
                <small className="text-muted" style={{ fontSize: "0.78rem" }}>
                  {fromDate} — {toDate}
                </small>
              </Card.Header>
              <Card.Body className="p-0">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
                    <div className="mt-2 text-muted small">Loading stock data...</div>
                  </div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <Table className="mb-0" hover>
                      <thead style={{ background: "#f8fafc", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.5px", color: "#64748b", position: "sticky", top: 0, zIndex: 1 }}>
                        <tr>
                          <th className="ps-4 py-2 border-0" style={{ width: "6%" }}>S. No.</th>
                          <th className="py-2 border-0">Item Name</th>
                          <th className="py-2 border-0 text-center" style={{ width: "13%" }}>Current Stock</th>
                          <th className="py-2 border-0 text-center" style={{ width: "13%" }}>Sold Quantity</th>
                          <th className="py-2 border-0 text-center" style={{ width: "16%" }}>Monthly Consumption</th>
                          <th className="py-2 border-0 text-center pe-4" style={{ width: "14%" }}>Reorder Quantity</th>
                        </tr>
                      </thead>
                      <tbody style={{ fontSize: "0.875rem" }}>
                        {rows.map((row) => {
                          const low = isLowStock(row);
                          return (
                            <tr key={row.sNo} style={{ borderBottom: "1px solid #f1f5f9", background: low ? "#fff5f5" : undefined }}>
                              <td className="ps-4 py-2 align-middle text-muted">{row.sNo}</td>
                              <td className="py-2 align-middle" style={{ fontWeight: 500 }}>
                                {row.itemName}
                                {low && (
                                  <span className="badge bg-danger ms-2" style={{ fontSize: "0.68rem", opacity: 0.85 }}>Low Stock</span>
                                )}
                              </td>
                              <td className="py-2 align-middle text-center">
                                <span style={{
                                  fontWeight: 600,
                                  color: low ? "#dc2626" : "#16a34a",
                                }}>
                                  {row.currentStock}
                                </span>
                              </td>
                              <td className="py-2 align-middle text-center">{row.soldQuantity}</td>
                              <td className="py-2 align-middle text-center">{row.monthlyConsumption}</td>
                              <td className="py-2 align-middle text-center pe-4">{row.reorderQuantity}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot style={{ background: "#f8fafc", fontWeight: 600, borderTop: "2px solid #dee2e6", fontSize: "0.875rem" }}>
                        <tr>
                          <td colSpan={2} className="ps-4 py-2">Total</td>
                          <td className="py-2 text-center">{rows.reduce((s, r) => s + r.currentStock, 0)}</td>
                          <td className="py-2 text-center">{rows.reduce((s, r) => s + r.soldQuantity, 0)}</td>
                          <td className="py-2 text-center">{rows.reduce((s, r) => s + r.monthlyConsumption, 0)}</td>
                          <td className="py-2 text-center pe-4">{rows.reduce((s, r) => s + r.reorderQuantity, 0)}</td>
                        </tr>
                      </tfoot>
                    </Table>
                  </div>
                )}
              </Card.Body>
            </Card>
          )}

          {!searched && !loading && (
            <div className="text-center py-5 text-muted">
              <i className="fas fa-boxes opacity-25 mb-2" style={{ fontSize: "2.5rem", display: "block" }}></i>
              <div>Select a date range and click <strong>Submit</strong> to view the stock flow report.</div>
            </div>
          )}

        </Container>
      </div>
    </div>
  );
};

export default DailySalesTransfer;