import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Container, Card, Form, Button, Row, Col, Badge } from "react-bootstrap";
import ReportHeader from "../../../../medical-records/components/ReportHeader";
import {
  searchTableData,
  sortTableData,
  exportToExcel,
} from "../../../../medical-records/utils/reportUtils";
import "../../../../medical-records/styles/reportStyles.css";

/**
 * Stock Adjustment Report Interface
 */
interface StockAdjustmentRecord {
  slNo: number;
  // TODO: Add actual columns when provided by user
  productName: string;
  batchNo: string;
  adjustmentType: string;
  adjustedQty: number;
  reason: string;
  adjustedBy: string;
  adjustedDate: string;
}

/**
 * Stock Adjustment Report Component
 * Displays stock adjustment records for the medical store
 * 
 * Menu Config:
 * - id: "stock-adjustment-report"
 * - name: "Stock Adjustment Report"
 * - url: routerPathNames.centralStores.medicalStore.registers.stockAdjustmentReport
 * - icon: "fas fa-file-alt"
 * - accessCode: 509
 * 
 * TODO: This is a placeholder component. 
 * Update with actual data columns when provided by user.
 */
export default function StockAdjustmentReport() {
  const navigate = useNavigate();
  const location = useLocation();
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Get store data from session storage
  const storeData = JSON.parse(sessionStorage.getItem("selectedStore") || "{}");

  // Filter state
  const [fromDate, setFromDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [toDate, setToDate] = useState<string>(
    new Date().toISOString().split("T")[0]
  );
  const [isLoading, setIsLoading] = useState<boolean>(false);

  // Sample placeholder data - TODO: Replace with actual API data
  const [tableData] = useState<StockAdjustmentRecord[]>([
    {
      slNo: 1,
      productName: "PARACETAMOL 500MG",
      batchNo: "BATCH001",
      adjustmentType: "Addition",
      adjustedQty: 50,
      reason: "Stock count correction",
      adjustedBy: "Admin User",
      adjustedDate: "2024-01-10",
    },
    // Add more sample data as needed
  ]);

  // Table state
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [sortConfig, setSortConfig] = useState<{
    key: keyof StockAdjustmentRecord;
    direction: "asc" | "desc";
  } | null>(null);

  // Filtered and sorted data
  const filteredData = searchTableData(tableData, searchTerm, [
    "productName",
    "batchNo",
    "adjustmentType",
    "reason",
    "adjustedBy",
  ]);
  const sortedData = sortConfig
    ? sortTableData(filteredData, sortConfig.key, sortConfig.direction)
    : filteredData;

  // Handle sort
  const handleSort = (key: keyof StockAdjustmentRecord) => {
    setSortConfig((prevConfig) => {
      if (prevConfig?.key === key) {
        return {
          key,
          direction: prevConfig.direction === "asc" ? "desc" : "asc",
        };
      }
      return { key, direction: "asc" };
    });
  };

  // Handle export
  const handleExport = () => {
    exportToExcel(
      sortedData,
      `Stock_Adjustment_Report_${fromDate}_to_${toDate}.xlsx`,
      "Stock Adjustment Report"
    );
  };

  // Handle print
  const handlePrint = () => {
    window.print();
  };

  // Handle search
  const handleSearch = async () => {
    setIsLoading(true);
    // TODO: Implement API call to fetch data based on date range
    setTimeout(() => {
      setIsLoading(false);
    }, 500);
  };

  // Table columns
  const columns = [
    { 
      key: "slNo", 
      label: "Sl No", 
      sortable: true,
      render: (value: any) => <span>{value}</span>
    },
    { 
      key: "productName", 
      label: "Product Name", 
      sortable: true,
      render: (value: any) => <span>{value}</span>
    },
    { 
      key: "batchNo", 
      label: "Batch No", 
      sortable: true,
      render: (value: any) => <span>{value}</span>
    },
    { 
      key: "adjustmentType", 
      label: "Adjustment Type", 
      sortable: true,
      render: (value: any) => (
        <Badge bg={value === "Addition" ? "success" : "danger"} className="fw-normal">
          {value}
        </Badge>
      )
    },
    { 
      key: "adjustedQty", 
      label: "Adjusted Qty", 
      sortable: true,
      render: (value: any) => <span>{value}</span>
    },
    { 
      key: "reason", 
      label: "Reason", 
      sortable: true,
      render: (value: any) => <span>{value}</span>
    },
    { 
      key: "adjustedBy", 
      label: "Adjusted By", 
      sortable: true,
      render: (value: any) => <span>{value}</span>
    },
    { 
      key: "adjustedDate", 
      label: "Adjusted Date", 
      sortable: true,
      render: (value: any) => <span>{value}</span>
    },
  ];

  return (
    <>
      <Container fluid className="p-3" style={{ backgroundColor: "#f8f9fc" }}>
          {/* Report Header */}
          <ReportHeader
            title="Stock Adjustment Report"
            subtitle={`${storeData.subModName || "Medical Store"} - Stock Adjustment Records`}
            onPrint={handlePrint}
            onExport={handleExport}
            onSearch={handleSearch}
            showSearch={true}
            showPrint={true}
            showExport={true}
          />

          {/* Filter Section */}
          <Card className="mb-4">
            <Card.Header>
              <h5 className="mb-0">
                <i className="fas fa-filter me-2"></i>
                Filter Options
              </h5>
            </Card.Header>
            <Card.Body>
              <Row className="g-3">
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
                <Col md={4}>
                  <Form.Group>
                    <Form.Label>&nbsp;</Form.Label>
                    <Button
                      variant="primary"
                      className="w-100"
                      onClick={handleSearch}
                      disabled={isLoading}
                    >
                      {isLoading ? (
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
                  </Form.Group>
                </Col>
              </Row>
            </Card.Body>
          </Card>

          {/* Summary Cards */}
          <Row className="g-3 mb-4">
            <Col md={3}>
              <Card className="text-white bg-primary">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-0">Total Adjustments</h6>
                      <h3 className="mb-0">{tableData.length}</h3>
                    </div>
                    <i className="fas fa-adjust fa-2x opacity-50"></i>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-white bg-success">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-0">Additions</h6>
                      <h3 className="mb-0">{tableData.filter((r) => r.adjustmentType === "Addition").length}</h3>
                    </div>
                    <i className="fas fa-plus-circle fa-2x opacity-50"></i>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-white bg-danger">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-0">Deductions</h6>
                      <h3 className="mb-0">{tableData.filter((r) => r.adjustmentType === "Deduction").length}</h3>
                    </div>
                    <i className="fas fa-minus-circle fa-2x opacity-50"></i>
                  </div>
                </Card.Body>
              </Card>
            </Col>
            <Col md={3}>
              <Card className="text-white bg-info">
                <Card.Body>
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <h6 className="mb-0">Products Affected</h6>
                      <h3 className="mb-0">{new Set(tableData.map((r) => r.productName)).size}</h3>
                    </div>
                    <i className="fas fa-box fa-2x opacity-50"></i>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          </Row>

          {/* Data Table */}
          <Card>
            <Card.Header>
              <Row className="align-items-center">
                <Col>
                  <h5 className="mb-0">
                    <i className="fas fa-table me-2"></i>
                    Adjustment Records
                  </h5>
                </Col>
                <Col md={4}>
                  <Form.Control
                    type="text"
                    placeholder="Search records..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </Col>
              </Row>
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <table className="table table-hover mb-0">
                  <thead >
                    <tr>
                      {columns.map((col) => (
                        <th
                          key={col.key}
                          onClick={() => col.sortable && handleSort(col.key as keyof StockAdjustmentRecord)}
                          style={{ cursor: col.sortable ? "pointer" : "default" }}
                        >
                          {col.label}
                          {col.sortable && sortConfig?.key === col.key && (
                            <i className={`fas fa-sort-${sortConfig.direction === "asc" ? "up" : "down"} ms-2`}></i>
                          )}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {sortedData.length === 0 ? (
                      <tr>
                        <td colSpan={columns.length} className="text-center text-muted py-4">
                          No stock adjustment records found for the selected date range.
                        </td>
                      </tr>
                    ) : (
                      sortedData.map((row, idx) => (
                        <tr key={idx}>
                          {columns.map((col) => (
                            <td key={col.key}>
                              {col.render ? col.render((row as any)[col.key]) : (row as any)[col.key]}
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </Container>
    </>
  );
}
