import React, { useState } from "react";
import { Container, Card, Form, Button, Table, Modal, Badge } from "react-bootstrap";
import { faHospital } from "@fortawesome/free-solid-svg-icons";
import PageHeader from "../../../components/PageHeader";
import { showValidationError } from "../../../utils/alertUtil";

// ─── Interfaces ───────────────────────────────────────────────────────────────

interface IPAdmission {
  sNo: number;
  ipNo: string;
  admissionDate: string;
  dischargeDate: string;
  bills: IPBill[];
}

interface IPBill {
  billNo: string;
  dateTime: string;
  items: BillItem[];
  total: number;
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

const DUMMY_DATA: Record<string, IPAdmission[]> = {
  "26-4": [
    {
      sNo: 1,
      ipNo: "IP-10023",
      admissionDate: "15-01-2025",
      dischargeDate: "20-01-2025",
      bills: [
        {
          billNo: "IPPH-33486",
          dateTime: "17-01-2025 & 22:11:29",
          items: [
            { sNo: 1, medicineName: "Bracelet ( adult )",   batchNo: "MOTHER",     expiryDate: "09-06-2026", qty: 1, ratePerUnit: 40.00,  amount: 35.71 },
            { sNo: 2, medicineName: "I.Levilex 100mg/ml",   batchNo: "GTF2829A",   expiryDate: "09-08-2027", qty: 2, ratePerUnit: 128.85, amount: 230.09 },
          ],
          total: 295.00,
        },
        {
          billNo: "IPPH-33509",
          dateTime: "18-01-2025 & 11:21:19",
          items: [
            { sNo: 1, medicineName: "D.Cap",        batchNo: "DCAKC01",      expiryDate: "23-03-2027", qty: 5, ratePerUnit: 10.00, amount: 47.62 },
            { sNo: 2, medicineName: "D.Mask",       batchNo: "DMASK123",     expiryDate: "31-03-2050", qty: 5, ratePerUnit: 6.00,  amount: 28.57 },
            { sNo: 3, medicineName: "3 LAYER MASK", batchNo: "MMA/01/24-25", expiryDate: "12-04-2027", qty: 5, ratePerUnit: 10.00, amount: 47.62 },
          ],
          total: 123.81,
        },
      ],
    },
    {
      sNo: 2,
      ipNo: "IP-10047",
      admissionDate: "02-02-2025",
      dischargeDate: "05-02-2025",
      bills: [
        {
          billNo: "IPPH-34120",
          dateTime: "03-02-2025 & 09:45:00",
          items: [
            { sNo: 1, medicineName: "Paracetamol 500mg", batchNo: "PCT1234", expiryDate: "01-12-2026", qty: 10, ratePerUnit: 2.50, amount: 23.81 },
            { sNo: 2, medicineName: "Amoxicillin 250mg", batchNo: "AMX9901", expiryDate: "06-09-2027", qty: 21, ratePerUnit: 8.00, amount: 160.00 },
          ],
          total: 183.81,
        },
      ],
    },
  ],
  "30-1": [
    {
      sNo: 1,
      ipNo: "IP-10085",
      admissionDate: "10-03-2025",
      dischargeDate: "15-03-2025",
      bills: [
        {
          billNo: "IPPH-35001",
          dateTime: "11-03-2025 & 08:30:00",
          items: [
            { sNo: 1, medicineName: "Metformin 500mg",  batchNo: "MFM2201", expiryDate: "11-11-2026", qty: 30, ratePerUnit: 3.50, amount: 100.00 },
            { sNo: 2, medicineName: "Glibenclamide 5mg",batchNo: "GLB4401", expiryDate: "07-04-2027", qty: 30, ratePerUnit: 5.00, amount: 142.86 },
          ],
          total: 242.86,
        },
      ],
    },
  ],
};

// ─── Component ────────────────────────────────────────────────────────────────

const IpPharmacyBills: React.FC = () => {
  const [opNo, setOpNo] = useState("");
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [admissions, setAdmissions] = useState<IPAdmission[]>([]);
  const [selectedAdmission, setSelectedAdmission] = useState<IPAdmission | null>(null);
  const [showBillsModal, setShowBillsModal] = useState(false);

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!opNo.trim()) { showValidationError("Please enter OP Number."); return; }
    setLoading(true);
    setTimeout(() => {
      const result = DUMMY_DATA[opNo.trim()] ?? [];
      setAdmissions(result);
      setSearched(true);
      setLoading(false);
    }, 400);
  };

  const handleReset = () => {
    setOpNo(""); setAdmissions([]); setSearched(false); setSelectedAdmission(null); setShowBillsModal(false);
  };

  const handleViewBills = (admission: IPAdmission) => {
    setSelectedAdmission(admission);
    setShowBillsModal(true);
  };

  const fmt = (n: number) => n.toFixed(2);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", minHeight: 0, overflow: "hidden" }}>
      <PageHeader
        icon={faHospital}
        title="IP Pharmacy Bills"
        subtitle="View inpatient pharmacy bills by OP number"
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
                        placeholder="e.g. 26-4"
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

          {/* ── Admissions Table ── */}
          {searched && (
            <Card className="shadow-sm" style={{ borderRadius: "10px", border: "1px solid #e2e8f0" }}>
              <Card.Header
                className="d-flex align-items-center justify-content-between py-2 px-3"
                style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0", borderRadius: "10px 10px 0 0" }}
              >
                <div className="d-flex align-items-center gap-2">
                  <div style={{ width: "4px", height: "20px", background: "#2563eb", borderRadius: "2px" }}></div>
                  <span style={{ fontWeight: 600, fontSize: "0.9rem", color: "#1e293b" }}>IP Admissions</span>
                  {admissions.length > 0 && (
                    <Badge bg="primary" style={{ fontSize: "0.75rem", padding: "3px 10px", borderRadius: "20px", opacity: 0.85 }}>
                      {admissions.length} Record{admissions.length !== 1 ? "s" : ""}
                    </Badge>
                  )}
                </div>
              </Card.Header>
              <Card.Body className="p-0">
                {loading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status"><span className="visually-hidden">Loading...</span></div>
                    <div className="mt-2 text-muted small">Loading admissions...</div>
                  </div>
                ) : admissions.length === 0 ? (
                  <div className="text-center py-4 text-muted">
                    <i className="fas fa-hospital opacity-25 mb-2" style={{ fontSize: "2rem", display: "block" }}></i>
                    <div className="small">No IP admissions found for OP Number: <strong>{opNo}</strong></div>
                  </div>
                ) : (
                  <div style={{ overflowX: "auto" }}>
                    <Table className="mb-0" hover>
                      <thead style={{ background: "#f8fafc", fontSize: "0.78rem", textTransform: "uppercase", letterSpacing: "0.5px", color: "#64748b" }}>
                        <tr>
                          <th className="ps-4 py-2 border-0" style={{ width: "8%" }}>S. No.</th>
                          <th className="py-2 border-0">IP. No</th>
                          <th className="py-2 border-0">Admission Date</th>
                          <th className="py-2 border-0">Discharge Date</th>
                        </tr>
                      </thead>
                      <tbody style={{ fontSize: "0.875rem" }}>
                        {admissions.map((row) => (
                          <tr key={row.ipNo} style={{ borderBottom: "1px solid #f1f5f9" }}>
                            <td className="ps-4 py-2 align-middle text-muted">{row.sNo}</td>
                            <td className="py-2 align-middle">
                              <span
                                onClick={() => handleViewBills(row)}
                                style={{ color: "#2563eb", cursor: "pointer", textDecoration: "underline", fontWeight: 600 }}
                              >
                                {row.ipNo}
                              </span>
                            </td>
                            <td className="py-2 align-middle">
                              <i className="fas fa-calendar-alt me-2 text-info opacity-75"></i>
                              {row.admissionDate}
                            </td>
                            <td className="py-2 align-middle">
                              <i className="fas fa-calendar-check me-2 text-success opacity-75"></i>
                              {row.dischargeDate}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                )}
              </Card.Body>
            </Card>
          )}

        </Container>

        {/* ── Bills Modal ── */}
        <Modal show={showBillsModal} onHide={() => setShowBillsModal(false)} size="xl" centered scrollable>
          <Modal.Header closeButton style={{ background: "#f8fafc", borderBottom: "1px solid #e2e8f0" }}>
            <div>
              <Modal.Title style={{ fontSize: "1rem", fontWeight: 600 }}>
                <i className="fas fa-file-invoice-dollar me-2 text-primary"></i>
                Pharmacy Bills — {selectedAdmission?.ipNo}
              </Modal.Title>
              {selectedAdmission && (
                <div className="d-flex align-items-center gap-3 mt-1">
                  <small className="text-muted">Admitted: <strong>{selectedAdmission.admissionDate}</strong></small>
                  <small className="text-muted">Discharged: <strong>{selectedAdmission.dischargeDate}</strong></small>
                  <Badge bg="primary" style={{ fontSize: "0.75rem", opacity: 0.85 }}>
                    {selectedAdmission.bills.length} Bill{selectedAdmission.bills.length !== 1 ? "s" : ""}
                  </Badge>
                </div>
              )}
            </div>
          </Modal.Header>
          <Modal.Body style={{ padding: "1.25rem" }}>
            {selectedAdmission?.bills.length === 0 ? (
              <div className="text-center py-4 text-muted">
                <i className="fas fa-file-invoice opacity-25 mb-2" style={{ fontSize: "2rem", display: "block" }}></i>
                <div className="small">No bills found for this admission.</div>
              </div>
            ) : (
              selectedAdmission?.bills.map((bill, bIdx) => (
                <div key={bill.billNo} style={{ marginBottom: bIdx < (selectedAdmission?.bills.length ?? 1) - 1 ? "28px" : 0 }}>
                  {/* Bill header */}
                  <div
                    className="d-flex align-items-center gap-3 flex-wrap mb-2 px-3 py-2"
                    style={{ background: "#eff6ff", borderRadius: "8px", border: "1px solid #bfdbfe" }}
                  >
                    <span style={{ fontWeight: 700, fontSize: "0.88rem", color: "#1e40af" }}>
                      <i className="fas fa-file-invoice me-2"></i>Bill No : {bill.billNo}
                    </span>
                    <span className="text-muted" style={{ fontSize: "0.83rem" }}>
                      Date &amp; Time : {bill.dateTime}
                    </span>
                  </div>

                  {/* Bill items table */}
                  <div style={{ overflowX: "auto" }}>
                    <Table bordered size="sm" className="mb-0" style={{ fontSize: "0.855rem" }}>
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
                        {bill.items.map((item) => (
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
                          <td className="py-2 text-end pe-3" style={{ fontSize: "0.9rem", color: "#1e293b" }}>{fmt(bill.total)}</td>
                        </tr>
                      </tfoot>
                    </Table>
                  </div>
                </div>
              ))
            )}
          </Modal.Body>
          <Modal.Footer style={{ background: "#f8fafc", borderTop: "1px solid #e2e8f0" }}>
            <Button variant="outline-secondary" onClick={() => setShowBillsModal(false)}>
              <i className="fas fa-times me-2"></i>Close
            </Button>
          </Modal.Footer>
        </Modal>

      </div>
    </div>
  );
};

export default IpPharmacyBills;