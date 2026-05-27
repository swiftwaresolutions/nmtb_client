import React, { useState } from "react";
import { Card, Table, Nav, Button, Badge, Form, Row, Col } from "react-bootstrap";
import PageHeader from "../../../../components/PageHeader";
import { faFileInvoice } from "@fortawesome/free-solid-svg-icons";

/* ======================= INTERFACES ======================= */
interface GRNItem {
  name: string;
  batch: string;
  qty: number;
  cost: number;
  mrp: number;
  free: number;
}

interface GRN {
  id: number;
  grnNo: string;
  invoice: string;
  amount: number;
  date: string;
  user: string;
  items: GRNItem[];
}

interface Supplier {
  id: number;
  name: string;
  cost: number;
  mrp: number;
}

/* ======================= MAIN PAGE ======================= */
export default function SupplierGoodReceipt() {
  const [activeTab, setActiveTab] = useState("between");

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", minHeight: 0, overflow: "hidden" }}>
      <PageHeader 
        icon={faFileInvoice} 
        title="Supplier Goods Receipt" 
        subtitle="View GRN, purchase totals, and supplier reports" 
      />
      
      <div className="content-body" style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "1rem" }}>
        {/* Tab Navigation */}
        <Card className="shadow-sm mb-3">
          <Card.Body style={{ padding: "0.5rem 1rem" }}>
            <Nav variant="tabs" activeKey={activeTab} onSelect={(k) => setActiveTab(k || "between")}>
              <Nav.Item>
                <Nav.Link eventKey="between">
                  <i className="fas fa-calendar-alt me-2"></i>
                  Between Dates
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="monthly">
                  <i className="fas fa-calendar-day me-2"></i>
                  Monthly
                </Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="yearly">
                  <i className="fas fa-calendar me-2"></i>
                  Yearly
                </Nav.Link>
              </Nav.Item>
            </Nav>
          </Card.Body>
        </Card>

        {/* Tab Content */}
        {activeTab === "between" && <BetweenDates />}
        {activeTab === "monthly" && <MonthlyReport />}
        {activeTab === "yearly" && <YearlyReport />}
      </div>
    </div>
  );
}

/* ======================= 1) BETWEEN DATES ======================= */
function BetweenDates() {
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [selectedGRN, setSelectedGRN] = useState<GRN | null>(null);

  // Sample data - replace with API call
  const grns: GRN[] = [
    {
      id: 1,
      grnNo: "GRN001",
      invoice: "INV101",
      amount: 2500,
      date: "02/02/2026",
      user: "Admin",
      items: [
        { name: "Paracetamol", batch: "B01", qty: 10, cost: 50, mrp: 60, free: 1 },
        { name: "Aspirin", batch: "B02", qty: 20, cost: 30, mrp: 40, free: 2 }
      ]
    },
    {
      id: 2,
      grnNo: "GRN002",
      invoice: "INV102",
      amount: 3500,
      date: "03/02/2026",
      user: "Admin",
      items: [
        { name: "Amoxicillin", batch: "B03", qty: 15, cost: 100, mrp: 120, free: 0 }
      ]
    }
  ];

  const handleSearch = () => {
    // TODO: Implement API call with date range
    console.log("Searching from", fromDate, "to", toDate);
  };

  return (
    <>
      {/* Date Filter */}
      <Card className="shadow-sm mb-3">
        <Card.Header style={{ background: "linear-gradient(to right, #f8f9fa, #ffffff)", fontWeight: "600" }}>
          <i className="fas fa-filter me-2"></i>
          Select Date Range
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label>From Date</Form.Label>
                <Form.Control
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>To Date</Form.Label>
                <Form.Control
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4} className="d-flex align-items-end">
              <Button variant="primary" onClick={handleSearch}>
                <i className="fas fa-search me-2"></i>
                Search
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* GRN List */}
      <Card className="shadow-sm mb-3">
        <Card.Header style={{ background: "linear-gradient(to right, #f8f9fa, #ffffff)", fontWeight: "600" }}>
          Goods Receipt Notes (GRN)
          <Badge bg="primary" className="ms-2">{grns.length} Records</Badge>
        </Card.Header>
        <Card.Body style={{ padding: 0 }}>
          <div style={{ maxHeight: "300px", overflowY: "auto" }}>
            <Table striped bordered hover className="mb-0">
              <thead style={{ position: "sticky", top: 0, backgroundColor: "#f8f9fa", zIndex: 10 }}>
                <tr>
                  <th style={{ width: "80px", textAlign: "center" }}>Sl No</th>
                  <th>GRN Number</th>
                  <th>Invoice No</th>
                  <th>Date</th>
                  <th>User</th>
                  <th style={{ textAlign: "right" }}>Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {grns.map((grn, index) => (
                  <tr 
                    key={grn.id} 
                    onClick={() => setSelectedGRN(grn)}
                    style={{ 
                      cursor: "pointer",
                      backgroundColor: selectedGRN?.id === grn.id ? "#e7f3ff" : "transparent"
                    }}
                  >
                    <td style={{ textAlign: "center" }}>{index + 1}</td>
                    <td>
                      <strong style={{ color: "#0d6efd" }}>{grn.grnNo}</strong>
                    </td>
                    <td>{grn.invoice}</td>
                    <td>{grn.date}</td>
                    <td>{grn.user}</td>
                    <td style={{ textAlign: "right", fontWeight: "600" }}>
                      ₹{grn.amount.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </Card.Body>
      </Card>

      {/* GRN Items Detail */}
      {selectedGRN && (
        <Card className="shadow-sm">
          <Card.Header style={{ background: "linear-gradient(to right, #e7f3ff, #ffffff)", fontWeight: "600" }}>
            <i className="fas fa-box me-2"></i>
            Items in {selectedGRN.grnNo}
            <Badge bg="success" className="ms-2">{selectedGRN.items.length} Items</Badge>
          </Card.Header>
          <Card.Body style={{ padding: 0 }}>
            <Table striped bordered hover className="mb-0">
              <thead style={{ backgroundColor: "#f8f9fa" }}>
                <tr>
                  <th style={{ width: "60px" }}>Sl</th>
                  <th>Product Name</th>
                  <th>Batch No</th>
                  <th style={{ textAlign: "center" }}>Quantity</th>
                  <th style={{ textAlign: "center" }}>Free</th>
                  <th style={{ textAlign: "right" }}>Cost/Unit</th>
                  <th style={{ textAlign: "right" }}>MRP</th>
                  <th style={{ textAlign: "right" }}>Total Cost</th>
                </tr>
              </thead>
              <tbody>
                {selectedGRN.items.map((item, index) => (
                  <tr key={index}>
                    <td style={{ textAlign: "center" }}>{index + 1}</td>
                    <td><strong>{item.name}</strong></td>
                    <td>
                      <Badge bg="secondary">{item.batch}</Badge>
                    </td>
                    <td style={{ textAlign: "center" }}>{item.qty}</td>
                    <td style={{ textAlign: "center" }}>
                      {item.free > 0 ? (
                        <Badge bg="success">{item.free}</Badge>
                      ) : (
                        "-"
                      )}
                    </td>
                    <td style={{ textAlign: "right" }}>₹{item.cost}</td>
                    <td style={{ textAlign: "right" }}>₹{item.mrp}</td>
                    <td style={{ textAlign: "right", fontWeight: "600" }}>
                      ₹{(item.qty * item.cost).toLocaleString()}
                    </td>
                  </tr>
                ))}
                <tr style={{ backgroundColor: "#f8f9fa", fontWeight: "600" }}>
                  <td colSpan={7} style={{ textAlign: "right" }}>Grand Total:</td>
                  <td style={{ textAlign: "right", color: "#0d6efd", fontSize: "1.1rem" }}>
                    ₹{selectedGRN.amount.toLocaleString()}
                  </td>
                </tr>
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </>
  );
}

/* ======================= 2) MONTHLY ======================= */
function MonthlyReport() {
  const [selectedMonth, setSelectedMonth] = useState("");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);

  // Sample data - replace with API call
  const suppliers: Supplier[] = [
    { id: 1, name: "ABC Pharma", cost: 12000, mrp: 15000 },
    { id: 2, name: "HealthCorp", cost: 8500, mrp: 10200 },
    { id: 3, name: "MedLife Supplies", cost: 15600, mrp: 18900 }
  ];

  const handleSearch = () => {
    // TODO: Implement API call with month and year
    console.log("Searching for", selectedMonth, selectedYear);
  };

  const months = [
    { value: "01", label: "January" },
    { value: "02", label: "February" },
    { value: "03", label: "March" },
    { value: "04", label: "April" },
    { value: "05", label: "May" },
    { value: "06", label: "June" },
    { value: "07", label: "July" },
    { value: "08", label: "August" },
    { value: "09", label: "September" },
    { value: "10", label: "October" },
    { value: "11", label: "November" },
    { value: "12", label: "December" }
  ];

  return (
    <>
      {/* Month/Year Filter */}
      <Card className="shadow-sm mb-3">
        <Card.Header style={{ background: "linear-gradient(to right, #f8f9fa, #ffffff)", fontWeight: "600" }}>
          <i className="fas fa-filter me-2"></i>
          Select Month and Year
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Month</Form.Label>
                <Form.Select
                  value={selectedMonth}
                  onChange={(e) => setSelectedMonth(e.target.value)}
                >
                  <option value="">-- Select Month --</option>
                  {months.map(m => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Year</Form.Label>
                <Form.Control
                  type="number"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  min="2020"
                  max="2030"
                />
              </Form.Group>
            </Col>
            <Col md={4} className="d-flex align-items-end">
              <Button variant="primary" onClick={handleSearch}>
                <i className="fas fa-search me-2"></i>
                Search
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      <Card className="shadow-sm">
        <Card.Header style={{ background: "linear-gradient(to right, #f8f9fa, #ffffff)", fontWeight: "600" }}>
          Monthly Supplier Report
          <Badge bg="primary" className="ms-2">{suppliers.length} Suppliers</Badge>
        </Card.Header>
        <Card.Body style={{ padding: 0 }}>
          <Table striped bordered hover className="mb-0">
            <thead style={{ backgroundColor: "#f8f9fa" }}>
              <tr>
                <th style={{ width: "80px", textAlign: "center" }}>Sl No</th>
                <th>Supplier Name</th>
                <th style={{ textAlign: "right" }}>Total Cost</th>
                <th style={{ textAlign: "right" }}>Total MRP</th>
                <th style={{ textAlign: "right" }}>Margin</th>
              </tr>
            </thead>
            <tbody>
              {suppliers.map((supplier, index) => {
                const margin = supplier.mrp - supplier.cost;
                const marginPercent = ((margin / supplier.cost) * 100).toFixed(2);
                
                return (
                  <tr 
                    key={supplier.id} 
                    onClick={() => setSelectedSupplier(supplier)}
                    style={{ 
                      cursor: "pointer",
                      backgroundColor: selectedSupplier?.id === supplier.id ? "#e7f3ff" : "transparent"
                    }}
                  >
                    <td style={{ textAlign: "center" }}>{index + 1}</td>
                    <td>
                      <strong style={{ color: "#0d6efd" }}>{supplier.name}</strong>
                    </td>
                    <td style={{ textAlign: "right", fontWeight: "600" }}>
                      ₹{supplier.cost.toLocaleString()}
                    </td>
                    <td style={{ textAlign: "right", fontWeight: "600" }}>
                      ₹{supplier.mrp.toLocaleString()}
                    </td>
                    <td style={{ textAlign: "right" }}>
                      <Badge bg="success">
                        ₹{margin.toLocaleString()} ({marginPercent}%)
                      </Badge>
                    </td>
                  </tr>
                );
              })}
              <tr style={{ backgroundColor: "#f8f9fa", fontWeight: "600" }}>
                <td colSpan={2} style={{ textAlign: "right" }}>Total:</td>
                <td style={{ textAlign: "right", color: "#0d6efd" }}>
                  ₹{suppliers.reduce((sum, s) => sum + s.cost, 0).toLocaleString()}
                </td>
                <td style={{ textAlign: "right", color: "#28a745" }}>
                  ₹{suppliers.reduce((sum, s) => sum + s.mrp, 0).toLocaleString()}
                </td>
                <td></td>
              </tr>
            </tbody>
          </Table>
        </Card.Body>
      </Card>

      {selectedSupplier && (
        <Card className="shadow-sm mt-3" style={{ borderLeft: "4px solid #28a745" }}>
          <Card.Body>
            <h5 className="mb-0">
              <i className="fas fa-check-circle text-success me-2"></i>
              Selected Supplier: <strong style={{ color: "#28a745" }}>{selectedSupplier.name}</strong>
            </h5>
          </Card.Body>
        </Card>
      )}
    </>
  );
}

/* ======================= 3) YEARLY ======================= */
function YearlyReport() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = () => {
    setLoading(true);
    // TODO: Implement API call with year
    console.log("Searching for year", selectedYear);
    
    setTimeout(() => {
      // For demo purposes, set sample data
      setSuppliers([
        { id: 1, name: "ABC Pharma", cost: 145000, mrp: 180000 },
        { id: 2, name: "HealthCorp", cost: 98500, mrp: 125000 },
        { id: 3, name: "MedLife Supplies", cost: 210000, mrp: 265000 }
      ]);
      setLoading(false);
    }, 500);
  };

  return (
    <>
      {/* Year Filter */}
      <Card className="shadow-sm mb-3">
        <Card.Header style={{ background: "linear-gradient(to right, #f8f9fa, #ffffff)", fontWeight: "600" }}>
          <i className="fas fa-filter me-2"></i>
          Select Year
        </Card.Header>
        <Card.Body>
          <Row>
            <Col md={4}>
              <Form.Group>
                <Form.Label>Year</Form.Label>
                <Form.Control
                  type="number"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                  min="2020"
                  max="2030"
                />
              </Form.Group>
            </Col>
            <Col md={4} className="d-flex align-items-end">
              <Button 
                variant="primary" 
                onClick={handleSearch}
                disabled={loading}
              >
                {loading ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Loading...
                  </>
                ) : (
                  <>
                    <i className="fas fa-search me-2"></i>
                    Search
                  </>
                )}
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {suppliers.length > 0 && (
        <Card className="shadow-sm">
          <Card.Header style={{ background: "linear-gradient(to right, #f8f9fa, #ffffff)", fontWeight: "600" }}>
            Yearly Supplier Report - {selectedYear}
            <Badge bg="success" className="ms-2">{suppliers.length} Records</Badge>
          </Card.Header>
          <Card.Body style={{ padding: 0 }}>
            <Table striped bordered hover className="mb-0">
              <thead style={{ backgroundColor: "#f8f9fa" }}>
                <tr>
                  <th style={{ width: "80px", textAlign: "center" }}>Sl No</th>
                  <th>Supplier Name</th>
                  <th style={{ textAlign: "right" }}>Total Cost</th>
                  <th style={{ textAlign: "right" }}>Total MRP</th>
                </tr>
              </thead>
              <tbody>
                {suppliers.map((supplier, index) => (
                  <tr key={supplier.id}>
                    <td style={{ textAlign: "center" }}>{index + 1}</td>
                    <td>{supplier.name}</td>
                    <td style={{ textAlign: "right", fontWeight: "600" }}>
                      ₹{supplier.cost.toLocaleString()}
                    </td>
                    <td style={{ textAlign: "right", fontWeight: "600" }}>
                      ₹{supplier.mrp.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </Card.Body>
        </Card>
      )}
    </>
  );
}
