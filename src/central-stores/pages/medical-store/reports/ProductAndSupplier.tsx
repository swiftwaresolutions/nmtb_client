import React, { useState } from "react";
import { Card, Form, Button, Table, Row, Col } from "react-bootstrap";
import PageHeader from "../../../../components/PageHeader";
import { faFileAlt } from "@fortawesome/free-solid-svg-icons";

interface Supplier {
  name: string;
  address: string;
  city: string;
  pin: string;
  phone: string;
}

interface Product {
  name: string;
  suppliers: Supplier[];
}

export default function ProductAndSupplier() {
  const [selectedLetter, setSelectedLetter] = useState("A");
  const [searchCode, setSearchCode] = useState("");
  const [searchName, setSearchName] = useState("");

  // Sample data - replace with API call
  const products: Product[] = [
    {
      name: "Aspirin",
      suppliers: [
        { name: "ABC Pharma", address: "MG Road", city: "Chennai", pin: "600001", phone: "9876543210" },
        { name: "HealthCorp", address: "Anna Nagar", city: "Chennai", pin: "600040", phone: "9123456789" }
      ]
    },
    {
      name: "Amoxicillin",
      suppliers: [
        { name: "MedLife", address: "Gandhi St", city: "Madurai", pin: "625001", phone: "9988776655" }
      ]
    },
    {
      name: "Betadine",
      suppliers: [
        { name: "CarePlus", address: "Market Rd", city: "Coimbatore", pin: "641001", phone: "9090909090" }
      ]
    }
  ];

  const filteredProducts = products.filter(p =>
    p.name.startsWith(selectedLetter)
  );

  const handleSearch = () => {
    // TODO: Implement search logic with API call
    console.log("Searching with code:", searchCode, "and name:", searchName);
  };

  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", minHeight: 0, overflow: "hidden" }}>
      <PageHeader 
        icon={faFileAlt} 
        title="Product and Supplier Report" 
        subtitle="View products and their supplier details" 
      />
      
      <div className="content-body" style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "1rem" }}>
        {/* Search Section */}
        <Card className="shadow-sm mb-3">
          <Card.Header style={{ background: "linear-gradient(to right, #f8f9fa, #ffffff)", fontWeight: "600" }}>
            Product Search
          </Card.Header>
          <Card.Body>
            <Row className="mb-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Product Code</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter product code"
                    value={searchCode}
                    onChange={(e) => setSearchCode(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Product Name</Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter product name"
                    value={searchName}
                    onChange={(e) => setSearchName(e.target.value)}
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

            {/* Alphabet Filter */}
            <div>
              <Form.Label className="mb-2">
                <strong>Quick Filter by First Letter:</strong>
              </Form.Label>
              <div className="d-flex flex-wrap gap-2">
                {alphabet.map((letter) => (
                  <Button
                    key={letter}
                    variant={selectedLetter === letter ? "primary" : "outline-primary"}
                    size="sm"
                    onClick={() => setSelectedLetter(letter)}
                    style={{ minWidth: "40px" }}
                  >
                    {letter}
                  </Button>
                ))}
              </div>
            </div>
          </Card.Body>
        </Card>

        {/* Results Section */}
        <Card className="shadow-sm">
          <Card.Header style={{ background: "linear-gradient(to right, #f8f9fa, #ffffff)", fontWeight: "600" }}>
            Products starting with <span style={{ color: "#0d6efd", fontWeight: "700" }}>{selectedLetter}</span>
            <span className="badge bg-primary ms-2">{filteredProducts.length} Products</span>
          </Card.Header>
          <Card.Body style={{ padding: 0 }}>
            <div style={{ maxHeight: "calc(100vh - 400px)", overflowY: "auto" }}>
              <Table striped bordered hover className="mb-0">
                <thead style={{ position: "sticky", top: 0, backgroundColor: "#f8f9fa", zIndex: 10 }}>
                  <tr>
                    <th style={{ width: "80px", textAlign: "center" }}>S.No</th>
                    <th style={{ width: "200px" }}>Product Name</th>
                    <th>Supplier Details</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredProducts.length === 0 ? (
                    <tr>
                      <td colSpan={3} style={{ textAlign: "center", padding: "2rem", color: "#6c757d" }}>
                        <i className="fas fa-inbox fa-2x mb-2"></i>
                        <p className="mb-0">No products found starting with "{selectedLetter}"</p>
                      </td>
                    </tr>
                  ) : (
                    filteredProducts.map((product, index) => (
                      <tr key={index}>
                        <td style={{ textAlign: "center", verticalAlign: "top" }}>
                          {index + 1}
                        </td>
                        <td style={{ verticalAlign: "top", fontWeight: "600" }}>
                          {product.name}
                        </td>
                        <td>
                          {product.suppliers.map((supplier, idx) => (
                            <div 
                              key={idx} 
                              style={{ 
                                marginBottom: idx < product.suppliers.length - 1 ? "12px" : "0",
                                paddingBottom: idx < product.suppliers.length - 1 ? "12px" : "0",
                                borderBottom: idx < product.suppliers.length - 1 ? "1px solid #e0e0e0" : "none"
                              }}
                            >
                              <div style={{ marginBottom: "4px" }}>
                                <span style={{ 
                                  background: "#e7f3ff", 
                                  padding: "2px 8px", 
                                  borderRadius: "4px",
                                  fontSize: "12px",
                                  fontWeight: "600",
                                  marginRight: "8px"
                                }}>
                                  Supplier {idx + 1}
                                </span>
                                <strong>{supplier.name}</strong>
                              </div>
                              <div style={{ fontSize: "14px", color: "#495057", lineHeight: "1.6" }}>
                                <div>
                                  <i className="fas fa-map-marker-alt me-2" style={{ color: "#6c757d", width: "16px" }}></i>
                                  {supplier.address}
                                </div>
                                <div>
                                  <i className="fas fa-city me-2" style={{ color: "#6c757d", width: "16px" }}></i>
                                  {supplier.city}, Pincode: {supplier.pin}
                                </div>
                                <div>
                                  <i className="fas fa-phone me-2" style={{ color: "#6c757d", width: "16px" }}></i>
                                  {supplier.phone}
                                </div>
                              </div>
                            </div>
                          ))}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}
