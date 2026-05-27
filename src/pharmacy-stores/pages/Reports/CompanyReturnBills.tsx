import React, { useState } from "react";
import { Container, Card, Form, Button, Table, Modal, Badge } from "react-bootstrap";
import { faUndo } from "@fortawesome/free-solid-svg-icons";
import PageHeader from "../../../components/PageHeader";
import { showValidationError } from "../../../utils/alertUtil";

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface ReturnBill {
  sNo: number;
  returnBillNo: string;
  originalBillNo: string;
  patientName: string;
  opNo: string;
  returnDate: string;
  totalAmount: number;
  refundAmount: number;
  items: ReturnItem[];
}

interface ReturnItem {
  sNo: number;
  medicineName: string;
  batchNo: string;
  expiryDate: string;
  qty: number;
  ratePerUnit: number;
  amount: number;
}

// ─── Dummy Data ───────────────────────────────────────────────────────────────

const DUMMY_RETURNS: Record<string, ReturnBill[]> = {
  "45-12": [
    {
      sNo: 1, returnBillNo: "CPR-10001", originalBillNo: "CPH-10021",
      patientName: "MR. ARJUN KUMAR", opNo: "45-12",
      returnDate: "12-01-2025", totalAmount: 357.14, refundAmount: 357.14,
      items: [
        { sNo: 1, medicineName: "Atorvastatin 10mg", batchNo: "AT1001", expiryDate: "05-2027", qty: 10, ratePerUnit: 12.50, amount: 119.05 },
        { sNo: 2, medicineName: "Metformin 500mg",   batchNo: "MF2201", expiryDate: "11-2026", qty: 10, ratePerUnit: 3.50,  amount: 33.33  },
        { sNo: 3, medicineName: "Amlodipine 5mg",    batchNo: "AML330", expiryDate: "08-2027", qty:  3, ratePerUnit: 56.00, amount: 160.00 },
        { sNo: 4, medicineName: "Pantoprazole 40mg", batchNo: "PAN441", expiryDate: "03-2027", qty:  7, ratePerUnit: 3.38,  amount: 22.67  },
      ],
    },
  ],
  "45-19": [
    {
      sNo: 1, returnBillNo: "CPR-10002", originalBillNo: "CPH-10035",
      patientName: "MRS. PRIYA RAMESH", opNo: "45-19",
      returnDate: "16-01-2025", totalAmount: 131.43, refundAmount: 131.43,
      items: [
        { sNo: 1, medicineName: "Ibuprofen 400mg",     batchNo: "IBU612", expiryDate: "12-2026", qty: 15, ratePerUnit: 3.50,  amount: 50.00 },
        { sNo: 2, medicineName: "Cetirizine 10mg",     batchNo: "CET723", expiryDate: "09-2027", qty: 10, ratePerUnit: 5.00,  amount: 47.62 },
        { sNo: 3, medicineName: "Paracetamol 650mg",   batchNo: "PCT834", expiryDate: "06-2026", qty: 15, ratePerUnit: 2.25,  amount: 33.81 },
      ],
    },
    {
      sNo: 2, returnBillNo: "CPR-10003", originalBillNo: "CPH-10035",
      patientName: "MRS. PRIYA RAMESH", opNo: "45-19",
      returnDate: "18-01-2025", totalAmount: 198.10, refundAmount: 198.10,
      items: [
        { sNo: 1, medicineName: "Vitamin D3 60000 IU", batchNo: "VTD945", expiryDate: "01-2028", qty: 4, ratePerUnit: 52.00, amount: 198.10 },
      ],
    },
  ],
  "62-5": [
    {
      sNo: 1, returnBillNo: "CPR-20001", originalBillNo: "CPH-20011",
      patientName: "MRS. KAVITHA NAIR", opNo: "62-5",
      returnDate: "10-02-2025", totalAmount: 228.57, refundAmount: 228.57,
      items: [
        { sNo: 1, medicineName: "Lisinopril 10mg",    batchNo: "LIS491", expiryDate: "06-2027", qty: 30, ratePerUnit: 8.00,  amount: 228.57 },
      ],
    },
  ],
};

// ─── Component ────────────────────────────────────────────────────────────────

const CompanyReturnBills: React.FC = () => {
  const [opNo, setOpNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [bills, setBills] = useState<ReturnBill[]>([]);
  const [selectedBill, setSelectedBill] = useState<ReturnBill | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!opNo.trim()) { showValidationError("Please enter OP Number."); return; }
    setLoading(true);
    setTimeout(() => {
      setBills(DUMMY_RETURNS[opNo.trim()] ?? []);
      setSearched(true);
      setLoading(false);
    }, 400);
  };

  const handleReset = () => {
    setOpNo(""); setBills([]); setSearched(false); setSelectedBill(null); setShowModal(false);
  };

  const handleViewBill = (bill: ReturnBill) => {
    setSelectedBill(bill);
    setShowModal(true);
  };

  const fmt = (n: number) => n.toFixed(2);

  const grandTotal  = bills.reduce((s, b) => s + b.totalAmount, 0);
  const grandRefund = bills.reduce((s, b) => s + b.refundAmount, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", minHeight: 0, overflow: "hidden" }}>
      <PageHeader
        icon={faUndo}
        title="Company Return Bills"
        subtitle="View pharmacy return bills by OP number"
      />

      <div className="content-body" style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "1.5rem" }}>
        <Container fluid>

          {/* ── Search Bar ── */}
          <Card className="shadow-sm mb-3" style={{ borderRadius: "10px", border: "1px solid #e2e8f0" }}>
            <Card.Body className="py-3 px-4">
              <Form onSubmit={handleSearch}>
                <div className="d-flex align-items-end gap-2">
                  <div>
                    <Form.Label className="text-muted mb-1" style={{ fontSize: "0.78rem", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.5px" }}>
                      OP Number
                    </Form.Label>
                    <div className="input-group" style={{ width: "220px" }}>
                      <span className="input-group-text bg-white" style={{ borderRight: "none", color: "#94a3b8" }}>
                        <i className="fas fa-search"></i>
                      </span>
                      <Form.Control
                        type="text"
                        placeholder="e.g. 45-12"
                        value={opNo}
                        onChange={(e) => setOpNo(e.target.value)}
                        disabled={loading}
                        autoFocus
                        style={{ borderLeft: "none" }}
                      />
                    </div>
                  </div>
                  <Button
                    variant="primary"
                    type="submit"
                    disabled={loading || !opNo.trim()}
                    style={{ padding: "7px 18px" }}
                  >
                    {loading ? (
                      <><span className="spinner-border spinner-border-sm me-2"></span>Searching...</>
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

          {/* ── Return Bills Table ── */}
          {searched && (
            <Card className="shadow-sm" style={{ borderRadius: "10px", border: "1px solid #e2e8f0" }}>
              <Card.Header
                className="d-flex align-items-center justify-content-between py-2 px-3"
                style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", borderRadius: "10px 10px 0 0" }}
              >
                <div className="d-flex align-items-center gap-2">
                  <div style={{ width: "4px", height: "20px", background: "#2563eb", borderRadius: "2px" }}></div>
                  <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "#1e293b" }}>OP No: {opNo}</span>
                  {bills.length > 0 && (
                    <Badge bg="danger" style={{ fontSize: "0.75rem", padding: "3px 10px", borderRadius: "20px", opacity: 0.85 }}>
                      {bills.length} Return{bills.length !== 1 ? "s" : ""}
                    </Badge>
                  )}
                </div>
              </Card.Header>
              <Card.Body className="p-0">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
                    <div className="mt-2 text-muted small">Loading return bills...</div>
                  </div>
                ) : bills.length === 0 ? (
                  <div className="text-center py-4 text-muted">
                    <i className="fas fa-undo opacity-25 mb-2" style={{ fontSize: "2rem", display: "block" }}></i>
                    <div className="small">No return bills found for OP Number: <strong>{opNo}</strong></div>
                  </div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <Table className="mb-0" hover>
                      <thead style={{ background: "#f8fafc", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.5px", color: "#64748b" }}>
                        <tr>
                          <th className="ps-4 py-2 border-0" style={{ width: "6%" }}>S. No.</th>
                          <th className="py-2 border-0">Return Bill No</th>
                          <th className="py-2 border-0">Original Bill No</th>
                          <th className="py-2 border-0">Patient Name</th>
                          <th className="py-2 border-0">OP No</th>
                          <th className="py-2 border-0">Return Date</th>
                          <th className="py-2 border-0 text-end">Total (₹)</th>
                          <th className="py-2 border-0 text-end pe-4">Refund (₹)</th>
                        </tr>
                      </thead>
                      <tbody style={{ fontSize: "0.875rem" }}>
                        {bills.map((bill) => (
                          <tr key={bill.returnBillNo} style={{ borderBottom: "1px solid #f1f5f9" }}>
                            <td className="ps-4 py-2 align-middle text-muted">{bill.sNo}</td>
                            <td className="py-2 align-middle">
                              <span
                                onClick={() => handleViewBill(bill)}
                                style={{ color: "#2563eb", cursor: "pointer", textDecoration: "underline", fontWeight: 600 }}
                              >
                                {bill.returnBillNo}
                              </span>
                            </td>
                            <td className="py-2 align-middle text-muted">{bill.originalBillNo}</td>
                            <td className="py-2 align-middle" style={{ fontWeight: 500 }}>{bill.patientName}</td>
                            <td className="py-2 align-middle">{bill.opNo}</td>
                            <td className="py-2 align-middle">
                              <i className="fas fa-calendar-alt me-2 text-info opacity-75"></i>
                              {bill.returnDate}
                            </td>
                            <td className="py-2 align-middle text-end">{fmt(bill.totalAmount)}</td>
                            <td className="py-2 align-middle text-end pe-4 fw-semibold text-danger">{fmt(bill.refundAmount)}</td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot style={{ background: "#f8fafc", fontWeight: 600, borderTop: "2px solid #dee2e6", fontSize: "0.875rem" }}>
                        <tr>
                          <td colSpan={6} className="ps-4 py-2">Grand Total</td>
                          <td className="py-2 text-end">{fmt(grandTotal)}</td>
                          <td className="py-2 text-end pe-4 text-danger">{fmt(grandRefund)}</td>
                        </tr>
                      </tfoot>
                    </Table>
                  </div>
                )}
              </Card.Body>
            </Card>
          )}

        </Container>

        {/* ── Return Detail Modal ── */}
        <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" centered scrollable>
          <Modal.Header closeButton style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
            <div>
              <Modal.Title style={{ fontSize: "1rem", fontWeight: 600 }}>
                <i className="fas fa-undo me-2 text-danger"></i>
                Return Details — {selectedBill?.returnBillNo}
              </Modal.Title>
              {selectedBill && (
                <div className="d-flex align-items-center gap-3 mt-1 flex-wrap">
                  <span className="badge bg-primary" style={{ fontSize: "0.78rem" }}>{selectedBill.opNo}</span>
                  <small className="text-muted fw-medium">{selectedBill.patientName}</small>
                  <small className="text-muted">• Original: {selectedBill.originalBillNo}</small>
                  <small className="text-muted">• Return Date: {selectedBill.returnDate}</small>
                </div>
              )}
            </div>
          </Modal.Header>
          <Modal.Body style={{ padding: "1.25rem" }}>
            {selectedBill && (
              <>
                <div style={{ overflowX: "auto" }}>
                  <Table bordered size="sm" className="mb-3" style={{ fontSize: "0.855rem" }}>
                    <thead style={{ background: "#f8fafc", fontSize: "0.77rem", textTransform: "uppercase", letterSpacing: "0.5px", color: "#64748b" }}>
                      <tr>
                        <th className="ps-3 py-2" style={{ width: "5%" }}>S.No</th>
                        <th className="py-2">Medicine Name</th>
                        <th className="py-2">Batch No</th>
                        <th className="py-2">Expiry Date</th>
                        <th className="py-2 text-center" style={{ width: "8%" }}>Qty</th>
                        <th className="py-2 text-end" style={{ width: "11%" }}>Rate/Unit</th>
                        <th className="py-2 text-end pe-3" style={{ width: "11%" }}>Amount</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedBill.items.map((item) => (
                        <tr key={item.sNo}>
                          <td className="ps-3 py-2 align-middle text-muted">{item.sNo}</td>
                          <td className="py-2 align-middle" style={{ fontWeight: 500 }}>{item.medicineName}</td>
                          <td className="py-2 align-middle">{item.batchNo}</td>
                          <td className="py-2 align-middle">{item.expiryDate}</td>
                          <td className="py-2 align-middle text-center">{item.qty}</td>
                          <td className="py-2 align-middle text-end">{fmt(item.ratePerUnit)}</td>
                          <td className="py-2 align-middle text-end pe-3">{fmt(item.amount)}</td>
                        </tr>
                      ))}
                    </tbody>
                    <tfoot style={{ background: "#f8fafc", fontWeight: 600, borderTop: "2px solid #dee2e6" }}>
                      <tr>
                        <td colSpan={6} className="ps-3 py-2 text-end" style={{ fontSize: "0.83rem", color: "#64748b" }}>Refund Total</td>
                        <td className="py-2 text-end pe-3 text-danger fw-semibold">{fmt(selectedBill.refundAmount)}</td>
                      </tr>
                    </tfoot>
                  </Table>
                </div>

                {/* Summary */}
                <div className="d-flex justify-content-end">
                  <table style={{ fontSize: "0.875rem", borderCollapse: "collapse", minWidth: 260 }}>
                    <tbody>
                      {[
                        { label: "Total Amount:",  value: fmt(selectedBill.totalAmount),  cls: "" },
                        { label: "Refund Amount:", value: fmt(selectedBill.refundAmount), cls: "text-danger fw-semibold" },
                      ].map(({ label, value, cls }) => (
                        <tr key={label}>
                          <td style={{ padding: "4px 20px 4px 0", color: "#64748b" }}>{label}</td>
                          <td className={`text-end ${cls}`} style={{ padding: "4px 0" }}>{value}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </Modal.Body>
          <Modal.Footer style={{ background: "#f8fafc", borderTop: "1px solid #e2e8f0" }}>
            <Button variant="outline-secondary" onClick={() => setShowModal(false)}>
              <i className="fas fa-times me-2"></i>Close
            </Button>
          </Modal.Footer>
        </Modal>

      </div>
    </div>
  );
};

export default CompanyReturnBills;