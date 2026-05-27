import React, { useState } from "react";
import { Card, Table, Form, Row, Col, Button, Badge, InputGroup } from "react-bootstrap";
import PageHeader from "../../../../components/PageHeader";
import { faCalendarAlt } from "@fortawesome/free-solid-svg-icons";
import { useTableSearch } from "../../../../hooks/useTableSearch";
import SearchInput from "../../../../components/SearchInput";

/* ======================= INTERFACES ======================= */
interface ExpiryProduct {
  id: number;
  productName: string;
  batchNo: string;
  expiryDate: string;
  supplierName: string;
  storeName: string;
  stock: number;
}

/* ======================= MAIN COMPONENT ======================= */
export default function ExpiryBetweenDates() {
  const [periodNumber, setPeriodNumber] = useState<string>("");
  const [periodType, setPeriodType] = useState<string>("Days");
  const [showResults, setShowResults] = useState<boolean>(false);

  // Sample data - Replace with API call
  const expiryProducts: ExpiryProduct[] = [
    {
      id: 1,
      productName: "Paracetamol 500mg",
      batchNo: "B001",
      expiryDate: "2026-02-20",
      supplierName: "ABC Pharma",
      storeName: "Main Store",
      stock: 120
    },
    {
      id: 2,
      productName: "Vitamin C Tablets",
      batchNo: "B002",
      expiryDate: "2026-03-10",
      supplierName: "Health Corp",
      storeName: "Branch 1",
      stock: 60
    },
    {
      id: 3,
      productName: "Amoxicillin 250mg",
      batchNo: "B003",
      expiryDate: "2026-04-15",
      supplierName: "MedLife Distributors",
      storeName: "Main Store",
      stock: 200
    },
    {
      id: 4,
      productName: "Ibuprofen 400mg",
      batchNo: "B004",
      expiryDate: "2026-05-20",
      supplierName: "Global Pharma Solutions",
      storeName: "Branch 2",
      stock: 150
    },
    {
      id: 5,
      productName: "Aspirin 75mg",
      batchNo: "B005",
      expiryDate: "2026-03-05",
      supplierName: "City Medical Supplies",
      storeName: "Main Store",
      stock: 90
    },
    {
      id: 6,
      productName: "Metformin 500mg",
      batchNo: "B006",
      expiryDate: "2026-06-30",
      supplierName: "Express Healthcare",
      storeName: "Branch 1",
      stock: 180
    },
    {
      id: 7,
      productName: "Azithromycin 500mg",
      batchNo: "B007",
      expiryDate: "2026-02-28",
      supplierName: "ABC Pharma",
      storeName: "Branch 2",
      stock: 75
    }
  ];

  // Search functionality
  const {
    filteredData: filteredProducts,
    searchTerm,
    setSearchTerm,
    resultCount,
    totalCount,
  } = useTableSearch({
    data: expiryProducts,
    searchFields: ["productName", "batchNo", "supplierName", "storeName"],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!periodNumber || parseInt(periodNumber) <= 0) {
      alert("Please enter a valid period number");
      return;
    }
    setShowResults(true);
  };

  const handleReset = () => {
    setPeriodNumber("");
    setPeriodType("Days");
    setShowResults(false);
    setSearchTerm("");
  };

  // Calculate days until expiry
  const getDaysUntilExpiry = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  // Get status badge based on days until expiry
  const getStatusBadge = (expiryDate: string) => {
    const daysUntilExpiry = getDaysUntilExpiry(expiryDate);
    
    if (daysUntilExpiry < 0) {
      return <Badge bg="danger">Expired</Badge>;
    } else if (daysUntilExpiry <= 7) {
      return <Badge bg="danger">Critical ({daysUntilExpiry}d)</Badge>;
    } else if (daysUntilExpiry <= 30) {
      return <Badge bg="warning">Warning ({daysUntilExpiry}d)</Badge>;
    } else if (daysUntilExpiry <= 90) {
      return <Badge bg="info">Alert ({daysUntilExpiry}d)</Badge>;
    } else {
      return <Badge bg="success">Valid ({daysUntilExpiry}d)</Badge>;
    }
  };

  // Calculate the period range display
  const getPeriodDisplay = () => {
    if (!periodNumber) return "";
    const num = parseInt(periodNumber);
    return `Next ${num} ${periodType.toLowerCase()}`;
  };

  return (
    <div style={{ padding: "1.5rem", height: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}>
      <PageHeader
        icon={faCalendarAlt}
        title="Expiry Check - Period Wise"
        subtitle="View products expiring within a specified time period"
      />

      {/* Search Form */}
      <Card className="shadow-sm mb-4" style={{ flexShrink: 0 }}>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="align-items-end">
              <Col md={5}>
                <Form.Group>
                  <Form.Label><strong>Enter the Period:</strong></Form.Label>
                  <InputGroup>
                    <Form.Control
                      type="number"
                      placeholder="Enter number"
                      value={periodNumber}
                      onChange={(e) => setPeriodNumber(e.target.value)}
                      min="1"
                      required
                      autoFocus
                    />
                    <Form.Select
                      value={periodType}
                      onChange={(e) => setPeriodType(e.target.value)}
                      style={{ maxWidth: "120px" }}
                    >
                      <option>Days</option>
                      <option>Months</option>
                      <option>Years</option>
                    </Form.Select>
                  </InputGroup>
                  <Form.Text className="text-muted">
                    Products expiring within the specified period
                  </Form.Text>
                </Form.Group>
              </Col>
              <Col md={7}>
                <div className="d-flex gap-2">
                  <Button type="submit" variant="primary">
                    <i className="fas fa-search me-2"></i>
                    Submit
                  </Button>
                  <Button type="button" variant="outline-secondary" onClick={handleReset}>
                    <i className="fas fa-redo me-2"></i>
                    Reset
                  </Button>
                </div>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      {/* Results Section */}
      {showResults && (
        <Card className="shadow-sm" style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
          <Card.Header style={{ background: "#dc3545", color: "white" }}>
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="fas fa-list me-2"></i>
                Expiry Details Report
                {periodNumber && (
                  <Badge bg="light" text="dark" className="ms-2">
                    {getPeriodDisplay()}
                  </Badge>
                )}
              </h5>
              <SearchInput
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                placeholder="Search by product, batch, supplier, or store..."
                resultCount={resultCount}
                totalCount={totalCount}
                showResultCount={true}
                className="w-auto"
              />
            </div>
          </Card.Header>
          <Card.Body style={{ flex: 1, minHeight: 0, overflow: "auto", padding: 0 }}>
            <div style={{ overflowX: "auto", height: "100%" }}>
              <Table striped bordered hover className="mb-0">
                <thead style={{ position: "sticky", top: 0, backgroundColor: "#f8f9fa", zIndex: 10 }}>
                  <tr>
                    <th style={{ width: "60px" }}>Sl. No</th>
                    <th>Product Name</th>
                    <th style={{ width: "120px" }}>Batch No</th>
                    <th style={{ width: "130px" }}>Expiry Date</th>
                    <th>Supplier Name</th>
                    <th>Store Name</th>
                    <th style={{ width: "90px" }}>Stock</th>
                    <th style={{ width: "140px" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center py-4">
                        {searchTerm 
                          ? `No products found matching "${searchTerm}"` 
                          : "No products found for the specified period"}
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product, index) => (
                      <tr key={product.id}>
                        <td className="text-center">{index + 1}</td>
                        <td>{product.productName}</td>
                        <td className="text-center">{product.batchNo}</td>
                        <td className="text-center">
                          {new Date(product.expiryDate).toLocaleDateString('en-GB', { 
                            day: '2-digit', 
                            month: 'short', 
                            year: 'numeric' 
                          })}
                        </td>
                        <td>{product.supplierName}</td>
                        <td>{product.storeName}</td>
                        <td className="text-center">
                          <Badge bg={product.stock < 50 ? "warning" : product.stock < 100 ? "info" : "success"}>
                            {product.stock}
                          </Badge>
                        </td>
                        <td className="text-center">
                          {getStatusBadge(product.expiryDate)}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </Card.Body>
          {filteredProducts.length > 0 && (
            <Card.Footer className="bg-light">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <small className="text-muted">
                    Total Products: <strong>{filteredProducts.length}</strong>
                  </small>
                  <span className="mx-2">|</span>
                  <small className="text-muted">
                    Period: <strong>{getPeriodDisplay()}</strong>
                  </small>
                </div>
                <Button variant="outline-primary" size="sm">
                  <i className="fas fa-print me-2"></i>
                  Print Report
                </Button>
              </div>
            </Card.Footer>
          )}
        </Card>
      )}
    </div>
  );
}
