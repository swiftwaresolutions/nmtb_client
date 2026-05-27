import React, { useState } from "react";
import { Container, Card, Form, Button, Table, Modal, Badge } from "react-bootstrap";
import { faBuilding } from "@fortawesome/free-solid-svg-icons";
import PageHeader from "../../../components/PageHeader";
import { showValidationError } from "../../../utils/alertUtil";

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface DueBill {
  sNo: number;
  billNo: string;
  patientName: string;
  opNo: string;
  billDate: string;
  totalAmount: number;
  paidAmount: number;
  dueAmount: number;
  items: BillItem[];
}

interface BillItem {
  sNo: number;
  medicineName: string;
  batchNo: string;
  expiryDate: string;
  qty: number;
  ratePerUnit: number;
  amount: number;
}

// ─── Dummy Data ───────────────────────────────────────────────────────────────

const DUMMY_BILLS: Record<string, DueBill[]> = {
  "45-12": [
    {
      sNo: 1, billNo: "CPH-10021", patientName: "MR. ARJUN KUMAR", opNo: "45-12",
      billDate: "10-01-2025", totalAmount: 1250.00, paidAmount: 0.00, dueAmount: 1250.00,
      items: [
        { sNo: 1, medicineName: "Atorvastatin 10mg",   batchNo: "AT1001",  expiryDate: "05-2027", qty: 30, ratePerUnit: 12.50, amount: 357.14 },
        { sNo: 2, medicineName: "Metformin 500mg",      batchNo: "MF2201",  expiryDate: "11-2026", qty: 30, ratePerUnit: 3.50,  amount: 100.00 },
        { sNo: 3, medicineName: "Amlodipine 5mg",       batchNo: "AML330",  expiryDate: "08-2027", qty: 14, ratePerUnit: 56.00, amount: 745.24 },
        { sNo: 4, medicineName: "Pantoprazole 40mg",    batchNo: "PAN441",  expiryDate: "03-2027", qty: 14, ratePerUnit: 3.38,  amount: 47.62 },
      ],
    },
  ],
  "45-19": [
    {
      sNo: 1, billNo: "CPH-10035", patientName: "MRS. PRIYA RAMESH", opNo: "45-19",
      billDate: "14-01-2025", totalAmount: 630.00, paidAmount: 200.00, dueAmount: 430.00,
      items: [
        { sNo: 1, medicineName: "Azithromycin 500mg",  batchNo: "AZI551",  expiryDate: "07-2027", qty: 3,  ratePerUnit: 28.50, amount: 81.43 },
        { sNo: 2, medicineName: "Ibuprofen 400mg",     batchNo: "IBU612",  expiryDate: "12-2026", qty: 15, ratePerUnit: 3.50,  amount: 50.00 },
        { sNo: 3, medicineName: "Cetirizine 10mg",     batchNo: "CET723",  expiryDate: "09-2027", qty: 10, ratePerUnit: 5.00,  amount: 47.62 },
        { sNo: 4, medicineName: "Paracetamol 650mg",   batchNo: "PCT834",  expiryDate: "06-2026", qty: 20, ratePerUnit: 2.25,  amount: 42.86 },
        { sNo: 5, medicineName: "Vitamin D3 60000 IU", batchNo: "VTD945",  expiryDate: "01-2028", qty:  4, ratePerUnit: 52.00, amount: 198.10 },
        { sNo: 6, medicineName: "Rabeprazole 20mg",    batchNo: "RAB051",  expiryDate: "04-2027", qty: 14, ratePerUnit: 15.00, amount: 200.00 },
      ],
    },
  ],
  "45-31": [
    {
      sNo: 1, billNo: "CPH-10058", patientName: "MR. SURESH BABU", opNo: "45-31",
      billDate: "20-01-2025", totalAmount: 450.00, paidAmount: 450.00, dueAmount: 0.00,
      items: [
        { sNo: 1, medicineName: "Omeprazole 20mg",     batchNo: "OMP162",  expiryDate: "10-2026", qty: 30, ratePerUnit: 5.00,  amount: 142.86 },
        { sNo: 2, medicineName: "Losartan 50mg",       batchNo: "LOS273",  expiryDate: "02-2028", qty: 30, ratePerUnit: 9.50,  amount: 271.43 },
        { sNo: 3, medicineName: "Aspirin 75mg",        batchNo: "ASP384",  expiryDate: "07-2027", qty:  7, ratePerUnit: 1.50,  amount: 10.00  },
      ],
    },
  ],
  "62-5": [
    {
      sNo: 1, billNo: "CPH-20011", patientName: "MRS. KAVITHA NAIR", opNo: "62-5",
      billDate: "08-02-2025", totalAmount: 980.00, paidAmount: 500.00, dueAmount: 480.00,
      items: [
        { sNo: 1, medicineName: "Lisinopril 10mg",     batchNo: "LIS491",  expiryDate: "06-2027", qty: 30, ratePerUnit: 8.00,  amount: 228.57 },
        { sNo: 2, medicineName: "Glimepiride 2mg",     batchNo: "GLM502",  expiryDate: "11-2027", qty: 30, ratePerUnit: 25.00, amount: 714.29 },
        { sNo: 3, medicineName: "B-Complex Capsules",  batchNo: "BCX613",  expiryDate: "08-2026", qty:  5, ratePerUnit: 7.50,  amount: 35.71  },
      ],
    },
  ],
  "62-17": [
    {
      sNo: 1, billNo: "CPH-20024", patientName: "MR. DIVAKAR RAO", opNo: "62-17",
      billDate: "15-02-2025", totalAmount: 320.00, paidAmount: 0.00, dueAmount: 320.00,
      items: [
        { sNo: 1, medicineName: "Ciprofloxacin 500mg", batchNo: "CIP724",  expiryDate: "03-2028", qty: 10, ratePerUnit: 12.00, amount: 114.29 },
        { sNo: 2, medicineName: "Tinidazole 500mg",    batchNo: "TIN835",  expiryDate: "09-2027", qty: 10, ratePerUnit: 18.00, amount: 171.43 },
        { sNo: 3, medicineName: "ORS Powder",          batchNo: "ORS946",  expiryDate: "12-2026", qty:  2, ratePerUnit: 17.14, amount: 32.65  },
      ],
    },
  ],
};

// ─── Component ────────────────────────────────────────────────────────────────

const CompanyDueBills: React.FC = () => {
  const [opNo, setOpNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [bills, setBills] = useState<DueBill[]>([]);
  const [selectedBill, setSelectedBill] = useState<DueBill | null>(null);
  const [showModal, setShowModal] = useState(false);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!opNo.trim()) { showValidationError("Please enter OP Number."); return; }
    setLoading(true);
    setTimeout(() => {
      setBills(DUMMY_BILLS[opNo.trim()] ?? []);
      setSearched(true);
      setLoading(false);
    }, 400);
  };

  const handleReset = () => {
    setOpNo(""); setBills([]); setSearched(false); setSelectedBill(null); setShowModal(false);
  };

  const handleViewBill = (bill: DueBill) => {
    setSelectedBill(bill);
    setShowModal(true);
  };

  const fmt = (n: number) => n.toFixed(2);

  const totalDue   = bills.reduce((s, b) => s + b.dueAmount, 0);
  const totalPaid  = bills.reduce((s, b) => s + b.paidAmount, 0);
  const grandTotal = bills.reduce((s, b) => s + b.totalAmount, 0);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", minHeight: 0, overflow: "hidden" }}>
      <PageHeader
        icon={faBuilding}
        title="Company Due Bills"
        subtitle="View outstanding pharmacy bills by company"
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

          {/* ── Bills Table ── */}
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
                    <Badge bg="primary" style={{ fontSize: "0.75rem", padding: "3px 10px", borderRadius: "20px", opacity: 0.85 }}>
                      {bills.length} Bill{bills.length !== 1 ? "s" : ""}
                    </Badge>
                  )}
                </div>
              </Card.Header>
              <Card.Body className="p-0">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
                    <div className="mt-2 text-muted small">Loading bills...</div>
                  </div>
                ) : bills.length === 0 ? (
                  <div className="text-center py-4 text-muted">
                    <i className="fas fa-file-invoice opacity-25 mb-2" style={{ fontSize: "2rem", display: "block" }}></i>
                    <div className="small">No due bills found for OP Number: <strong>{opNo}</strong></div>
                  </div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <Table className="mb-0" hover>
                      <thead style={{ background: "#f8fafc", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.5px", color: "#64748b" }}>
                        <tr>
                          <th className="ps-4 py-2 border-0" style={{ width: "6%" }}>S. No.</th>
                          <th className="py-2 border-0">Bill No</th>
                          <th className="py-2 border-0">Patient Name</th>
                          <th className="py-2 border-0">OP No</th>
                          <th className="py-2 border-0">Bill Date</th>
                          <th className="py-2 border-0 text-end">Total (₹)</th>
                          <th className="py-2 border-0 text-end">Paid (₹)</th>
                          <th className="py-2 border-0 text-end pe-4">Due (₹)</th>
                        </tr>
                      </thead>
                      <tbody style={{ fontSize: "0.875rem" }}>
                        {bills.map((bill) => (
                          <tr key={bill.billNo} style={{ borderBottom: "1px solid #f1f5f9" }}>
                            <td className="ps-4 py-2 align-middle text-muted">{bill.sNo}</td>
                            <td className="py-2 align-middle">
                              <span
                                onClick={() => handleViewBill(bill)}
                                style={{ color: "#2563eb", cursor: "pointer", textDecoration: "underline", fontWeight: 600 }}
                              >
                                {bill.billNo}
                              </span>
                            </td>
                            <td className="py-2 align-middle" style={{ fontWeight: 500 }}>{bill.patientName}</td>
                            <td className="py-2 align-middle">{bill.opNo}</td>
                            <td className="py-2 align-middle">
                              <i className="fas fa-calendar-alt me-2 text-info opacity-75"></i>
                              {bill.billDate}
                            </td>
                            <td className="py-2 align-middle text-end">{fmt(bill.totalAmount)}</td>
                            <td className="py-2 align-middle text-end text-success">{fmt(bill.paidAmount)}</td>
                            <td className={`py-2 align-middle text-end pe-4 fw-semibold ${bill.dueAmount > 0 ? "text-danger" : "text-success"}`}>
                              {fmt(bill.dueAmount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                      <tfoot style={{ background: "#f8fafc", fontWeight: 600, borderTop: "2px solid #dee2e6", fontSize: "0.875rem" }}>
                        <tr>
                          <td colSpan={5} className="ps-4 py-2">Grand Total</td>
                          <td className="py-2 text-end">{fmt(grandTotal)}</td>
                          <td className="py-2 text-end text-success">{fmt(totalPaid)}</td>
                          <td className={`py-2 text-end pe-4 ${totalDue > 0 ? "text-danger" : "text-success"}`}>{fmt(totalDue)}</td>
                        </tr>
                      </tfoot>
                    </Table>
                  </div>
                )}
              </Card.Body>
            </Card>
          )}

        </Container>

        {/* ── Bill Detail Modal ── */}
        <Modal show={showModal} onHide={() => setShowModal(false)} size="xl" centered scrollable>
          <Modal.Header closeButton style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
            <div>
              <Modal.Title style={{ fontSize: "1rem", fontWeight: 600 }}>
                <i className="fas fa-file-invoice-dollar me-2 text-primary"></i>
                Bill Details — {selectedBill?.billNo}
              </Modal.Title>
              {selectedBill && (
                <div className="d-flex align-items-center gap-3 mt-1 flex-wrap">
                  <span className="badge bg-primary" style={{ fontSize: "0.78rem" }}>{selectedBill.opNo}</span>
                  <small className="text-muted fw-medium">{selectedBill.patientName}</small>
                  <small className="text-muted">• Date: {selectedBill.billDate}</small>
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
                        <td colSpan={6} className="ps-3 py-2 text-end" style={{ fontSize: "0.83rem", color: "#64748b" }}>Total</td>
                        <td className="py-2 text-end pe-3">{fmt(selectedBill.totalAmount)}</td>
                      </tr>
                    </tfoot>
                  </Table>
                </div>

                {/* Summary */}
                <div className="d-flex justify-content-end">
                  <table style={{ fontSize: "0.875rem", borderCollapse: "collapse", minWidth: 260 }}>
                    <tbody>
                      {[
                        { label: "Total:",   value: fmt(selectedBill.totalAmount),  cls: "" },
                        { label: "Paid:",    value: fmt(selectedBill.paidAmount),   cls: "text-success" },
                        { label: "Balance:", value: fmt(selectedBill.dueAmount),    cls: selectedBill.dueAmount > 0 ? "text-danger fw-semibold" : "text-success" },
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

export default CompanyDueBills;