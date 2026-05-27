import React, { useMemo, useState } from "react";
import { Badge, Button, Card, Col, Form, Row, Table } from "react-bootstrap";
import PageHeader from "../../../../components/PageHeader";
import { faFileAlt } from "@fortawesome/free-solid-svg-icons";
import SearchInput from "../../../../components/SearchInput";
import { useTableSearch } from "../../../../hooks/useTableSearch";
import { showValidationError } from "../../../../utils/alertUtil";

interface PurchaseRecord {
  id: number;
  productName: string;
  batchNo: string;
  units: number;
  pack: string;
  quantity: number;
  cost: number;
  mrp: number;
  totalValue: number;
  receivedDate: string;
  supplierName: string;
}

const purchaseData: PurchaseRecord[] = [
  {
    id: 1,
    productName: "Paracetamol",
    batchNo: "B001",
    units: 10,
    pack: "Strip",
    quantity: 100,
    cost: 5,
    mrp: 8,
    totalValue: 500,
    receivedDate: "2026-02-02",
    supplierName: "ABC Pharma",
  },
  {
    id: 2,
    productName: "Vitamin C",
    batchNo: "B002",
    units: 20,
    pack: "Bottle",
    quantity: 50,
    cost: 12,
    mrp: 20,
    totalValue: 600,
    receivedDate: "2026-02-04",
    supplierName: "HealthCare Ltd",
  },
  {
    id: 3,
    productName: "Amoxicillin",
    batchNo: "B010",
    units: 10,
    pack: "Strip",
    quantity: 40,
    cost: 25,
    mrp: 40,
    totalValue: 1000,
    receivedDate: "2026-02-06",
    supplierName: "MedLife",
  },
];

export default function AllProductPurchaseReport() {
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [filteredPurchases, setFilteredPurchases] = useState<PurchaseRecord[]>([]);

  const {
    filteredData: searchedPurchases,
    searchTerm,
    setSearchTerm,
    resultCount,
    totalCount,
  } = useTableSearch({
    data: filteredPurchases,
    searchFields: ["productName", "batchNo", "supplierName", "pack"],
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (!fromDate || !toDate) {
      showValidationError("Please select both From and To dates.");
      return;
    }

    if (new Date(fromDate) > new Date(toDate)) {
      showValidationError("From date cannot be later than To date.");
      return;
    }

    const from = new Date(fromDate);
    const to = new Date(toDate);

    const result = purchaseData.filter((record) => {
      const date = new Date(record.receivedDate);
      return date >= from && date <= to;
    });

    setFilteredPurchases(result);
    setHasSearched(true);
  };

  const handleReset = () => {
    setFromDate("");
    setToDate("");
    setHasSearched(false);
    setFilteredPurchases([]);
    setSearchTerm("");
  };

  const totalValue = useMemo(() => {
    return searchedPurchases.reduce((sum, record) => sum + record.totalValue, 0);
  }, [searchedPurchases]);

  return (
    <div style={{ padding: "1.5rem", height: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}>
      <PageHeader
        icon={faFileAlt}
        title="Product-wise Purchase Between the Date"
        subtitle="View product purchase details between selected dates"
      />

      <Card className="shadow-sm mb-4" style={{ flexShrink: 0 }}>
        <Card.Body>
          <Form onSubmit={handleSearch}>
            <Row className="align-items-end g-3">
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
              <Col md={4} className="d-flex gap-2">
                <Button type="submit" variant="primary">
                  <i className="fas fa-search me-2"></i>
                  Submit
                </Button>
                <Button type="button" variant="outline-secondary" onClick={handleReset}>
                  <i className="fas fa-redo me-2"></i>
                  Reset
                </Button>
              </Col>
            </Row>
          </Form>
        </Card.Body>
      </Card>

      <Card className="shadow-sm" style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Report Table</h5>
          <SearchInput
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            placeholder="Search by product, batch, supplier..."
            resultCount={resultCount}
            totalCount={totalCount}
            showResultCount={true}
            className="w-auto"
          />
        </Card.Header>
        <Card.Body style={{ flex: 1, minHeight: 0, overflow: "auto", padding: 0 }}>
          <div style={{ overflowX: "auto", height: "100%" }}>
            <Table striped bordered hover className="mb-0">
              <thead style={{ position: "sticky", top: 0, backgroundColor: "#f8f9fa", zIndex: 10 }}>
                <tr>
                  <th style={{ width: "60px" }}>S.No</th>
                  <th>Product Name</th>
                  <th style={{ width: "110px" }}>Batch No</th>
                  <th style={{ width: "80px" }} className="text-center">Units</th>
                  <th style={{ width: "100px" }}>Pack</th>
                  <th style={{ width: "90px" }} className="text-center">Quantity</th>
                  <th style={{ width: "90px" }} className="text-end">Cost</th>
                  <th style={{ width: "90px" }} className="text-end">MRP</th>
                  <th style={{ width: "120px" }} className="text-end">Total Value</th>
                  <th style={{ width: "130px" }}>Received Date</th>
                  <th>Supplier</th>
                </tr>
              </thead>
              <tbody>
                {!hasSearched ? (
                  <tr>
                    <td colSpan={11} className="text-center py-4">
                      Use the filters above and click Submit to view report.
                    </td>
                  </tr>
                ) : searchedPurchases.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="text-center py-4">
                      {searchTerm
                        ? `No records match "${searchTerm}".`
                        : "No records found for the selected date range."}
                    </td>
                  </tr>
                ) : (
                  searchedPurchases.map((record, index) => (
                    <tr key={record.id}>
                      <td className="text-center">{index + 1}</td>
                      <td>{record.productName}</td>
                      <td>{record.batchNo}</td>
                      <td className="text-center">{record.units}</td>
                      <td>{record.pack}</td>
                      <td className="text-center">{record.quantity}</td>
                      <td className="text-end">{record.cost.toFixed(2)}</td>
                      <td className="text-end">{record.mrp.toFixed(2)}</td>
                      <td className="text-end">{record.totalValue.toFixed(2)}</td>
                      <td>
                        {new Date(record.receivedDate).toLocaleDateString("en-GB", {
                          day: "2-digit",
                          month: "short",
                          year: "numeric",
                        })}
                      </td>
                      <td>{record.supplierName}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
        {hasSearched && searchedPurchases.length > 0 && (
          <Card.Footer className="bg-light d-flex justify-content-end">
            <Badge bg="warning" text="dark" style={{ fontSize: "0.95rem" }}>
              Total : {totalValue.toFixed(2)}
            </Badge>
          </Card.Footer>
        )}
      </Card>
    </div>
  );
}
