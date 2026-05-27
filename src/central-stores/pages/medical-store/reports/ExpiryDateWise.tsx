import React, { useState } from "react";
import { Card, Table, Form, Row, Col, Button, Badge } from "react-bootstrap";
import PageHeader from "../../../../components/PageHeader";
import { faCalendarCheck } from "@fortawesome/free-solid-svg-icons";
import { useTableSearch } from "../../../../hooks/useTableSearch";
import SearchInput from "../../../../components/SearchInput";

/* ======================= INTERFACES ======================= */
interface ExpiryProduct {
  id: number;
  productName: string;
  batchNo: string;
  expiryDate: string;
  supplierName: string;
  stock: number;
}

/* ======================= MAIN COMPONENT ======================= */
export default function ExpiryDateWise() {
  const [selectedDate, setSelectedDate] = useState<string>("");
  const [showResults, setShowResults] = useState<boolean>(false);

  // Sample data - Replace with API call
  const expiryProducts: ExpiryProduct[] = [
    {
      id: 1,
      productName: "Paracetamol 500mg",
      batchNo: "BATCH001",
      expiryDate: "2026-02-15",
      supplierName: "ABC Pharma",
      stock: 120
    },
    {
      id: 2,
      productName: "Vitamin C Tablets",
      batchNo: "BATCH002",
      expiryDate: "2026-02-20",
      supplierName: "Health Corp",
      stock: 75
    },
    {
      id: 3,
      productName: "Amoxicillin 250mg",
      batchNo: "BATCH003",
      expiryDate: "2026-02-18",
      supplierName: "MedLife Distributors",
      stock: 200
    },
    {
      id: 4,
      productName: "Ibuprofen 400mg",
      batchNo: "BATCH004",
      expiryDate: "2026-02-25",
      supplierName: "Global Pharma Solutions",
      stock: 150
    },
    {
      id: 5,
      productName: "Aspirin 75mg",
      batchNo: "BATCH005",
      expiryDate: "2026-02-12",
      supplierName: "City Medical Supplies",
      stock: 90
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
    searchFields: ["productName", "batchNo", "supplierName"],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedDate) {
      alert("Please select a date");
      return;
    }
    setShowResults(true);
  };

  const handleReset = () => {
    setSelectedDate("");
    setShowResults(false);
    setSearchTerm("");
  };

  // Check if product is expiring soon (within 7 days)
  const isExpiringSoon = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 7 && diffDays >= 0;
  };

  // Check if product is expired
  const isExpired = (expiryDate: string) => {
    const expiry = new Date(expiryDate);
    const today = new Date();
    return expiry < today;
  };

  return (
    <div style={{ padding: "1.5rem", height: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}>
      <PageHeader
        icon={faCalendarCheck}
        title="Expiry Check - Date Wise"
        subtitle="View products expiring on a specific date"
      />

      {/* Search Form */}
      <Card className="shadow-sm mb-4" style={{ flexShrink: 0 }}>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="align-items-end">
              <Col md={4}>
                <Form.Group>
                  <Form.Label><strong>Select Date:</strong></Form.Label>
                  <Form.Control
                    type="date"
                    value={selectedDate}
                    onChange={(e) => setSelectedDate(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={8}>
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
          <Card.Header className="bg-light">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="fas fa-list me-2"></i>
                Date-wise Product Expiry Details
                {selectedDate && (
                  <Badge bg="info" className="ms-2">
                    {new Date(selectedDate).toLocaleDateString('en-GB', { 
                      day: '2-digit', 
                      month: 'short', 
                      year: 'numeric' 
                    })}
                  </Badge>
                )}
              </h5>
              <SearchInput
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                placeholder="Search by product, batch, or supplier..."
                resultCount={resultCount}
                totalCount={totalCount}
                showResultCount={true}
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
                    <th style={{ width: "150px" }}>Batch No</th>
                    <th style={{ width: "150px" }}>Expiry Date</th>
                    <th>Supplier Name</th>
                    <th style={{ width: "100px" }}>Stock</th>
                    <th style={{ width: "100px" }}>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="text-center py-4">
                        {searchTerm 
                          ? `No products found matching "${searchTerm}"` 
                          : "No products found for the selected date"}
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
                        <td className="text-center">
                          <Badge bg={product.stock < 50 ? "warning" : "success"}>
                            {product.stock}
                          </Badge>
                        </td>
                        <td className="text-center">
                          {isExpired(product.expiryDate) ? (
                            <Badge bg="danger">Expired</Badge>
                          ) : isExpiringSoon(product.expiryDate) ? (
                            <Badge bg="warning">Expiring Soon</Badge>
                          ) : (
                            <Badge bg="success">Valid</Badge>
                          )}
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
                <small className="text-muted">
                  Total Products: <strong>{filteredProducts.length}</strong>
                </small>
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
