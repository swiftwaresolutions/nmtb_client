import React, { useState } from "react";
import { Card, Table, Badge, Form, Row, Col, Button } from "react-bootstrap";
import PageHeader from "../../../../components/PageHeader";
import { faAddressBook } from "@fortawesome/free-solid-svg-icons";
import { useTableSearch } from "../../../../hooks/useTableSearch";
import SearchInput from "../../../../components/SearchInput";

/* ======================= INTERFACES ======================= */
interface Supplier {
  id: number;
  name: string;
  address: string;
  phone: string;
  email: string;
  deliveryTime: string;
  isOutside: boolean;
  isApproved: boolean;
  approvedDate: string;
  approvedBy: string;
}

/* ======================= MAIN COMPONENT ======================= */
export default function SupplierDetails() {
  const [supplierType, setSupplierType] = useState<string>("all");
  const [approvalStatus, setApprovalStatus] = useState<string>("all");

  // Sample data - Replace with API call
  const suppliers: Supplier[] = [
    {
      id: 1,
      name: "ABC Pharmaceuticals Ltd.",
      address: "123, Industrial Area, Delhi - 110001",
      phone: "+91-11-2345-6789",
      email: "contact@abcpharma.com",
      deliveryTime: "3-5 Days",
      isOutside: false,
      isApproved: true,
      approvedDate: "2024-01-15",
      approvedBy: "Admin User"
    },
    {
      id: 2,
      name: "HealthCorp Supplies",
      address: "45, Medical Complex, Mumbai - 400002",
      phone: "+91-22-9876-5432",
      email: "info@healthcorp.com",
      deliveryTime: "2-4 Days",
      isOutside: true,
      isApproved: true,
      approvedDate: "2024-02-10",
      approvedBy: "Manager"
    },
    {
      id: 3,
      name: "MedLife Distributors",
      address: "78, Hospital Road, Bangalore - 560001",
      phone: "+91-80-1234-5678",
      email: "sales@medlife.in",
      deliveryTime: "4-7 Days",
      isOutside: false,
      isApproved: false,
      approvedDate: "-",
      approvedBy: "-"
    },
    {
      id: 4,
      name: "Global Pharma Solutions",
      address: "90, Export Zone, Chennai - 600001",
      phone: "+91-44-5555-6666",
      email: "support@globalpharma.com",
      deliveryTime: "5-10 Days",
      isOutside: true,
      isApproved: true,
      approvedDate: "2024-01-20",
      approvedBy: "Director"
    },
    {
      id: 5,
      name: "City Medical Supplies",
      address: "12, Market Street, Kolkata - 700001",
      phone: "+91-33-7777-8888",
      email: "orders@citymedical.com",
      deliveryTime: "2-3 Days",
      isOutside: false,
      isApproved: true,
      approvedDate: "2023-12-05",
      approvedBy: "Purchase Head"
    },
    {
      id: 6,
      name: "Express Healthcare Pvt Ltd",
      address: "34, Tech Park, Hyderabad - 500001",
      phone: "+91-40-9999-0000",
      email: "contact@expresshealthcare.in",
      deliveryTime: "1-2 Days",
      isOutside: false,
      isApproved: false,
      approvedDate: "-",
      approvedBy: "-"
    }
  ];

  // Filter by supplier type and approval status
  const filteredSuppliers = suppliers.filter(supplier => {
    const matchesType = 
      supplierType === "all" ||
      (supplierType === "local" && !supplier.isOutside) ||
      (supplierType === "outside" && supplier.isOutside);
    
    const matchesApproval = 
      approvalStatus === "all" ||
      (approvalStatus === "approved" && supplier.isApproved) ||
      (approvalStatus === "pending" && !supplier.isApproved);
    
    return matchesType && matchesApproval;
  });

  // Search functionality
  const {
    filteredData: searchedSuppliers,
    searchTerm,
    setSearchTerm,
    resultCount,
    totalCount,
  } = useTableSearch({
    data: filteredSuppliers,
    searchFields: ["name", "address", "email", "phone"],
  });

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", overflow: "hidden" }}>
      <PageHeader 
        icon={faAddressBook} 
        title="Supplier Details" 
        subtitle="Complete supplier information and approval status" 
      />
      
      <div className="content-body" style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
        {/* Filters Card */}
        <Card className="shadow-sm mb-3">
          <Card.Header style={{ background: "linear-gradient(to right, #f8f9fa, #ffffff)", fontWeight: "600" }}>
            <i className="fas fa-filter me-2"></i>
            Filters
          </Card.Header>
          <Card.Body>
            <Row className="align-items-end">
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Supplier Type</Form.Label>
                  <Form.Select 
                    value={supplierType} 
                    onChange={(e) => setSupplierType(e.target.value)}
                  >
                    <option value="all">All Suppliers</option>
                    <option value="local">Local Supplier</option>
                    <option value="outside">Outside Supplier</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Approval Status</Form.Label>
                  <Form.Select 
                    value={approvalStatus} 
                    onChange={(e) => setApprovalStatus(e.target.value)}
                  >
                    <option value="all">All Status</option>
                    <option value="approved">Approved</option>
                    <option value="pending">Pending Approval</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={6}>
                <SearchInput
                  searchTerm={searchTerm}
                  onSearchChange={setSearchTerm}
                  placeholder="Search by name, address, email, or phone..."
                  resultCount={resultCount}
                  totalCount={totalCount}
                  showResultCount={true}
                />
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {/* Supplier Table Card */}
        <Card className="shadow-sm" style={{ display: "flex", flexDirection: "column", minHeight: 0 }}>
          <Card.Header style={{ background: "linear-gradient(to right, #f8f9fa, #ffffff)", fontWeight: "600" }}>
            <i className="fas fa-users me-2"></i>
            Supplier List
            <Badge bg="primary" className="ms-2">{searchedSuppliers.length} Suppliers</Badge>
            {searchedSuppliers.filter(s => s.isApproved).length > 0 && (
              <Badge bg="success" className="ms-2">
                {searchedSuppliers.filter(s => s.isApproved).length} Approved
              </Badge>
            )}
            {searchedSuppliers.filter(s => !s.isApproved).length > 0 && (
              <Badge bg="warning" className="ms-2">
                {searchedSuppliers.filter(s => !s.isApproved).length} Pending
              </Badge>
            )}
          </Card.Header>
          <Card.Body style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: 0 }}>
            <div style={{ overflowY: "auto", maxHeight: "100%" }}>
              <Table striped bordered hover className="mb-0">
                <thead style={{ position: "sticky", top: 0, backgroundColor: "#f8f9fa", zIndex: 10 }}>
                  <tr>
                    <th style={{ width: "50px", textAlign: "center" }}>Sl. No</th>
                    <th style={{ minWidth: "180px" }}>Supplier Name</th>
                    <th style={{ minWidth: "200px" }}>Address</th>
                    <th style={{ minWidth: "180px" }}>Phone</th>
                    <th style={{ minWidth: "220px" }}>Email</th>
                    <th style={{ width: "100px", textAlign: "center" }}>Delivery Time</th>
                    <th style={{ width: "120px", textAlign: "center" }}>Supplier Type</th>
                    <th style={{ width: "100px", textAlign: "center" }}>Is Approved</th>
                    <th style={{ width: "120px", textAlign: "center" }}>Approved Date</th>
                    <th style={{ minWidth: "120px" }}>Approved By</th>
                  </tr>
                </thead>
                <tbody>
                  {searchedSuppliers.length === 0 ? (
                    <tr>
                      <td colSpan={10} style={{ textAlign: "center", padding: "2rem" }}>
                        {searchTerm || supplierType !== "all" || approvalStatus !== "all" 
                          ? "No suppliers match your search criteria." 
                          : "No suppliers available."}
                      </td>
                    </tr>
                  ) : (
                    searchedSuppliers.map((supplier, idx) => (
                      <tr key={supplier.id}>
                        <td style={{ textAlign: "center" }}>{idx + 1}</td>
                        <td>
                          <strong style={{ color: "#0d6efd" }}>{supplier.name}</strong>
                        </td>
                        <td style={{ fontSize: "0.9rem", color: "#666" }}>
                          {supplier.address}
                        </td>
                        <td>
                          <i className="fas fa-phone me-2" style={{ color: "#28a745" }}></i>
                          {supplier.phone}
                        </td>
                        <td>
                          <i className="fas fa-envelope me-2" style={{ color: "#0d6efd" }}></i>
                          <a href={`mailto:${supplier.email}`} style={{ textDecoration: "none" }}>
                            {supplier.email}
                          </a>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          <Badge bg="info" style={{ fontSize: "0.85rem" }}>
                            <i className="fas fa-clock me-1"></i>
                            {supplier.deliveryTime}
                          </Badge>
                        </td>
                        <td style={{ textAlign: "center" }}>
                          {supplier.isOutside ? (
                            <Badge bg="warning" style={{ fontSize: "0.85rem" }}>
                              <i className="fas fa-globe me-1"></i>
                              OUTSIDE
                            </Badge>
                          ) : (
                            <Badge bg="secondary" style={{ fontSize: "0.85rem" }}>
                              <i className="fas fa-map-marker-alt me-1"></i>
                              LOCAL
                            </Badge>
                          )}
                        </td>
                        <td style={{ textAlign: "center" }}>
                          {supplier.isApproved ? (
                            <Badge bg="success">
                              <i className="fas fa-check-circle me-1"></i>
                              YES
                            </Badge>
                          ) : (
                            <Badge bg="danger">
                              <i className="fas fa-times-circle me-1"></i>
                              NO
                            </Badge>
                          )}
                        </td>
                        <td style={{ textAlign: "center", fontSize: "0.9rem" }}>
                          {supplier.approvedDate}
                        </td>
                        <td>{supplier.approvedBy}</td>
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
