import React, { useState, useEffect } from "react";
import { Container, Card, Button, Table, Nav, Spinner } from "react-bootstrap";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPrint } from "@fortawesome/free-solid-svg-icons";
import "../../../medical-records/styles/reportStyles.css";
import CashCounterApiService from "../../../api/cash-counter/cash-counter-api-service";
import { showErrorToast } from "../../../utils/alertUtil";

const cashCounterApi = new CashCounterApiService();

// ─── Interfaces ──────────────────────────────────────────────────────────────

interface PharmacyPendingOrder {
  orderId: number;
  orderNo: string;
  patientName: string;
  opNo: string;
  date: string;
}

interface LabPendingOrder {
  orderId: number;
  orderNo: string;
  patientName: string;
  opNo: string;
  date: string;
}

interface IpFinalBillRow {
  patientName: string;
  opNumber: string;
  orderNo: string;
  date: string;
  amount: number;
}

// ─── Sub-table helpers ────────────────────────────────────────────────────────

const thStyle: React.CSSProperties = {
  background: "var(--color-table-header, #f1f5f9)",
  fontWeight: "var(--font-weight-semibold)" as any,
};

// ─── Component ────────────────────────────────────────────────────────────────

const WaitingOrders: React.FC = () => {
  const [activeTab, setActiveTab] = useState("pharmacy");
  const [pharmacyOrders, setPharmacyOrders] = useState<PharmacyPendingOrder[]>([]);
  const [isLoadingPharmacy, setIsLoadingPharmacy] = useState(false);
  const [labOrders, setLabOrders] = useState<LabPendingOrder[]>([]);
  const [isLoadingLab, setIsLoadingLab] = useState(false);
  const [ipFinalBillOrders, setIpFinalBillOrders] = useState<IpFinalBillRow[]>([]);
  const [isLoadingIpBill, setIsLoadingIpBill] = useState(false);

  useEffect(() => {
    setIsLoadingPharmacy(true);
    cashCounterApi
      .fetchAllPharmacyPendingOrders()
      .then((data: any[]) => setPharmacyOrders(data))
      .catch(() => showErrorToast("Failed to fetch pharmacy pending orders."))
      .finally(() => setIsLoadingPharmacy(false));

    setIsLoadingLab(true);
    cashCounterApi
      .fetchAllLabPendingOrders()
      .then((data: any[]) => setLabOrders(data))
      .catch(() => showErrorToast("Failed to fetch lab pending orders."))
      .finally(() => setIsLoadingLab(false));

    setIsLoadingIpBill(true);
    cashCounterApi
      .fetchIPFinalBillOrders()
      .then((data: any[]) => setIpFinalBillOrders(data))
      .catch(() => showErrorToast("Failed to fetch IP final bill orders."))
      .finally(() => setIsLoadingIpBill(false));
  }, []);

  return (
    <Container fluid className="p-3">
      <Card className="shadow-sm">
        {/* Card Header */}
        <Card.Header
          className="d-flex justify-content-between align-items-center"
          style={{ background: "var(--color-primary, #0d6efd)", color: "#fff" }}
        >
          <span style={{ fontSize: "var(--font-size-lg)", fontWeight: "var(--font-weight-semibold)" }}>
            Waiting Orders Details
          </span>
          <Button
            variant="light"
            size="sm"
            className="no-print d-flex align-items-center gap-1"
            onClick={() => window.print()}
          >
            <FontAwesomeIcon icon={faPrint} className="me-1" /> Print
          </Button>
        </Card.Header>

        {/* Tabs Nav */}
        <div className="px-3 pt-3">
          <Nav
            variant="tabs"
            activeKey={activeTab}
            onSelect={(k) => k && setActiveTab(k)}
          >
            <Nav.Item>
              <Nav.Link eventKey="pharmacy">
                Pharmacy Orders
                <span
                  className="ms-2 badge"
                  style={{
                    background: activeTab === "pharmacy" ? "var(--color-primary, #0d6efd)" : "var(--color-secondary, #6c757d)",
                    color: "#fff",
                    fontSize: "var(--font-size-xs)",
                    fontWeight: "var(--font-weight-semibold)",
                  }}
                >
                  {pharmacyOrders.length}
                </span>
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="lab">
                Laboratory Orders
                <span
                  className="ms-2 badge"
                  style={{
                    background: activeTab === "lab" ? "var(--color-primary, #0d6efd)" : "var(--color-secondary, #6c757d)",
                    color: "#fff",
                    fontSize: "var(--font-size-xs)",
                    fontWeight: "var(--font-weight-semibold)",
                  }}
                >
                  {labOrders.length}
                </span>
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="ipbill">
                IP Final Bill Orders
                <span
                  className="ms-2 badge"
                  style={{
                    background: activeTab === "ipbill" ? "var(--color-primary, #0d6efd)" : "var(--color-secondary, #6c757d)",
                    color: "#fff",
                    fontSize: "var(--font-size-xs)",
                    fontWeight: "var(--font-weight-semibold)",
                  }}
                >
                  {ipFinalBillOrders.length}
                </span>
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </div>

        <Card.Body className="p-0">

          {/* ── Pharmacy Orders ── */}
          {activeTab === "pharmacy" && (
            isLoadingPharmacy ? (
              <div className="d-flex justify-content-center align-items-center py-5">
                <Spinner animation="border" variant="primary" />
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <Table bordered hover className="table-hims mb-0">
                  <thead>
                    <tr>
                      <th style={{ ...thStyle, width: "60px" }}>S. No</th>
                      <th style={thStyle}>Patient Name</th>
                      <th style={thStyle}>OP No</th>
                      <th style={thStyle}>Order No</th>
                      <th style={thStyle}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pharmacyOrders.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center text-muted py-4">No records found.</td>
                      </tr>
                    ) : (
                      pharmacyOrders.map((row, idx) => (
                        <tr key={row.orderId ?? idx}>
                          <td>{idx + 1}</td>
                          <td>{row.patientName}</td>
                          <td>{row.opNo}</td>
                          <td>{row.orderNo}</td>
                          <td>{row.date}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            )
          )}

          {/* ── Laboratory Orders ── */}
          {activeTab === "lab" && (
            isLoadingLab ? (
              <div className="d-flex justify-content-center align-items-center py-5">
                <Spinner animation="border" variant="primary" />
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <Table bordered hover className="table-hims mb-0">
                  <thead>
                    <tr>
                      <th style={{ ...thStyle, width: "60px" }}>S. No</th>
                      <th style={thStyle}>Patient Name</th>
                      <th style={thStyle}>OP No</th>
                      <th style={thStyle}>Order No</th>
                      <th style={thStyle}>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {labOrders.length === 0 ? (
                      <tr>
                        <td colSpan={5} className="text-center text-muted py-4">No records found.</td>
                      </tr>
                    ) : (
                      labOrders.map((row, idx) => (
                        <tr key={row.orderId ?? idx}>
                          <td>{idx + 1}</td>
                          <td>{row.patientName}</td>
                          <td>{row.opNo}</td>
                          <td>{row.orderNo}</td>
                          <td>{row.date}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            )
          )}

          {/* ── IP Final Bill Orders ── */}
          {activeTab === "ipbill" && (
            isLoadingIpBill ? (
              <div className="d-flex justify-content-center align-items-center py-5">
                <Spinner animation="border" variant="primary" />
              </div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <Table bordered hover className="table-hims mb-0">
                  <thead>
                    <tr>
                      <th style={{ ...thStyle, width: "60px" }}>S. No</th>
                      <th style={thStyle}>Patient Name</th>
                      <th style={thStyle}>OP Number</th>
                      <th style={thStyle}>Order No</th>
                      <th style={thStyle}>Date</th>
                      <th style={{ ...thStyle, textAlign: "right" }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ipFinalBillOrders.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-center text-muted py-4">No records found.</td>
                      </tr>
                    ) : (
                      ipFinalBillOrders.map((row, idx) => (
                        <tr key={idx}>
                          <td>{idx + 1}</td>
                          <td>{row.patientName}</td>
                          <td>{row.opNumber}</td>
                          <td>{row.orderNo}</td>
                          <td>{row.date}</td>
                          <td className="text-end">{row.amount.toFixed(2)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </Table>
              </div>
            )
          )}

        </Card.Body>
      </Card>
    </Container>
  );
};

export default WaitingOrders;
