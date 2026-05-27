import React, { useMemo, useState } from "react";
import { Badge, Button, Card, Col, Form, Row, Table } from "react-bootstrap";
import PageHeader from "../../../../components/PageHeader";
import { faChartLine } from "@fortawesome/free-solid-svg-icons";
import SearchInput from "../../../../components/SearchInput";
import { useTableSearch } from "../../../../hooks/useTableSearch";
import { showValidationError } from "../../../../utils/alertUtil";

interface BatchRecord {
  batch: string;
  qty: number;
  cost: number;
  mrp: number;
}

interface SupplierSummary {
  id: number;
  supplierName: string;
  costTotal: number;
  mrpTotal: number;
}

interface ProductSummary {
  id: number;
  productName: string;
  qtyTotal: number;
  costTotal: number;
  mrpTotal: number;
}

interface BatchDetail {
  id: number;
  batch: string;
  qty: number;
  cost: number;
  mrp: number;
  costTotal: number;
  mrpTotal: number;
}

const yearlyData: Record<string, Record<string, BatchRecord[]>> = {
  "ABC Pharma": {
    Paracetamol: [
      { batch: "BATCH-001", qty: 50, cost: 10, mrp: 15 },
      { batch: "BATCH-002", qty: 50, cost: 10, mrp: 15 },
    ],
    "Vitamin C": [
      { batch: "VIT-001", qty: 200, cost: 20, mrp: 30 },
    ],
  },
  "MedLife Traders": {
    "Pain Relief": [
      { batch: "PAIN-001", qty: 100, cost: 12, mrp: 18 },
      { batch: "PAIN-002", qty: 120, cost: 12, mrp: 18 },
    ],
  },
};

export default function SupplierGoodaReceiptYearly() {
  const [selectedYear, setSelectedYear] = useState<string>("2026");
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  const availableYears = ["2024", "2025", "2026"];

  const supplierSummary: SupplierSummary[] = useMemo(() => {
    if (!hasSearched) return [];
    return Object.entries(yearlyData).map(([supplier, products], index) => {
      let costTotal = 0;
      let mrpTotal = 0;

      Object.values(products).forEach((batches) => {
        batches.forEach((batch) => {
          costTotal += batch.qty * batch.cost;
          mrpTotal += batch.qty * batch.mrp;
        });
      });

      return {
        id: index + 1,
        supplierName: supplier,
        costTotal,
        mrpTotal,
      };
    });
  }, [hasSearched]);

  const {
    filteredData: searchedSuppliers,
    searchTerm,
    setSearchTerm,
    resultCount,
    totalCount,
  } = useTableSearch({
    data: supplierSummary,
    searchFields: ["supplierName"],
  });

  const productSummary: ProductSummary[] = useMemo(() => {
    if (!selectedSupplier) return [];
    const products = yearlyData[selectedSupplier] ?? {};
    return Object.entries(products).map(([product, batches], index) => {
      let qtyTotal = 0;
      let costTotal = 0;
      let mrpTotal = 0;

      batches.forEach((batch) => {
        qtyTotal += batch.qty;
        costTotal += batch.qty * batch.cost;
        mrpTotal += batch.qty * batch.mrp;
      });

      return {
        id: index + 1,
        productName: product,
        qtyTotal,
        costTotal,
        mrpTotal,
      };
    });
  }, [selectedSupplier]);

  const batchDetails: BatchDetail[] = useMemo(() => {
    if (!selectedSupplier || !selectedProduct) return [];
    const batches = yearlyData[selectedSupplier]?.[selectedProduct] ?? [];
    return batches.map((batch, index) => ({
      id: index + 1,
      batch: batch.batch,
      qty: batch.qty,
      cost: batch.cost,
      mrp: batch.mrp,
      costTotal: batch.qty * batch.cost,
      mrpTotal: batch.qty * batch.mrp,
    }));
  }, [selectedProduct, selectedSupplier]);

  const supplierTotals = supplierSummary.reduce(
    (acc, supplier) => {
      acc.costTotal += supplier.costTotal;
      acc.mrpTotal += supplier.mrpTotal;
      return acc;
    },
    { costTotal: 0, mrpTotal: 0 }
  );

  const productTotals = productSummary.reduce(
    (acc, product) => {
      acc.costTotal += product.costTotal;
      acc.mrpTotal += product.mrpTotal;
      return acc;
    },
    { costTotal: 0, mrpTotal: 0 }
  );

  const batchTotals = batchDetails.reduce(
    (acc, batch) => {
      acc.costTotal += batch.costTotal;
      acc.mrpTotal += batch.mrpTotal;
      return acc;
    },
    { costTotal: 0, mrpTotal: 0 }
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedYear) {
      showValidationError("Please select a year.");
      return;
    }
    setHasSearched(true);
    setSelectedSupplier(null);
    setSelectedProduct(null);
  };

  const handleReset = () => {
    setSelectedYear("2026");
    setHasSearched(false);
    setSelectedSupplier(null);
    setSelectedProduct(null);
    setSearchTerm("");
  };

  return (
    <div style={{ padding: "1.5rem", height: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}>
      <PageHeader
        icon={faChartLine}
        title="Supplier-wise Purchase Total"
        subtitle="Yearly purchase totals with supplier, product, and batch breakdown"
      />

      <Card className="shadow-sm mb-4" style={{ flexShrink: 0 }}>
        <Card.Body>
          <Form onSubmit={handleSearch}>
            <Row className="align-items-end g-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Year</Form.Label>
                  <Form.Select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(e.target.value)}
                  >
                    {availableYears.map((year) => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={8} className="d-flex gap-2">
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

      <div style={{ display: "flex", flex: 1, minHeight: 0, gap: "1rem", flexDirection: "column" }}>
        <Card className="shadow-sm" style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Year : {selectedYear}</h5>
            <SearchInput
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              placeholder="Search supplier..."
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
                    <th style={{ width: "60px" }}>Sl.No</th>
                    <th>Supplier Name</th>
                    <th className="text-end" style={{ width: "160px" }}>Cost Total</th>
                    <th className="text-end" style={{ width: "160px" }}>MRP Total</th>
                  </tr>
                </thead>
                <tbody>
                  {!hasSearched ? (
                    <tr>
                      <td colSpan={4} className="text-center py-4">
                        Select a year and click Submit to view totals.
                      </td>
                    </tr>
                  ) : searchedSuppliers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-4">
                        {searchTerm
                          ? `No suppliers match "${searchTerm}".`
                          : "No records found for the selected year."}
                      </td>
                    </tr>
                  ) : (
                    searchedSuppliers.map((supplier, index) => (
                      <tr
                        key={supplier.id}
                        onClick={() => {
                          setSelectedSupplier(supplier.supplierName);
                          setSelectedProduct(null);
                        }}
                        style={{
                          cursor: "pointer",
                          backgroundColor:
                            selectedSupplier === supplier.supplierName ? "#fff3cd" : "transparent",
                        }}
                      >
                        <td className="text-center">{index + 1}</td>
                        <td>
                          {supplier.supplierName}
                          {selectedSupplier === supplier.supplierName && (
                            <Badge bg="warning" text="dark" className="ms-2">
                              Selected
                            </Badge>
                          )}
                        </td>
                        <td className="text-end">₹ {supplier.costTotal.toFixed(2)}</td>
                        <td className="text-end">₹ {supplier.mrpTotal.toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                  {hasSearched && searchedSuppliers.length > 0 && (
                    <tr className="table-warning" style={{ fontWeight: 700 }}>
                      <td colSpan={2}>TOTAL</td>
                      <td className="text-end">₹ {supplierTotals.costTotal.toFixed(2)}</td>
                      <td className="text-end">₹ {supplierTotals.mrpTotal.toFixed(2)}</td>
                    </tr>
                  )}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>

        <Card className="shadow-sm" style={{ flexShrink: 0 }}>
          <Card.Header>
            <h5 className="mb-0">
              Supplier : {selectedSupplier ?? "Select a supplier"}
            </h5>
          </Card.Header>
          <Card.Body>
            {!selectedSupplier ? (
              <div className="text-muted">Select a supplier to view product totals.</div>
            ) : productSummary.length === 0 ? (
              <div className="text-muted">No product records for the selected supplier.</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <Table bordered hover size="sm" className="mb-0">
                  <thead>
                    <tr>
                      <th style={{ width: "60px" }}>Sl.No</th>
                      <th>Product</th>
                      <th style={{ width: "100px" }} className="text-center">Qty</th>
                      <th style={{ width: "110px" }} className="text-end">Cost</th>
                      <th style={{ width: "110px" }} className="text-end">MRP</th>
                      <th style={{ width: "140px" }} className="text-end">Cost Total</th>
                      <th style={{ width: "140px" }} className="text-end">MRP Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {productSummary.map((product, index) => (
                      <tr
                        key={product.id}
                        onClick={() => setSelectedProduct(product.productName)}
                        style={{
                          cursor: "pointer",
                          backgroundColor:
                            selectedProduct === product.productName ? "#fff3cd" : "transparent",
                        }}
                      >
                        <td className="text-center">{index + 1}</td>
                        <td>
                          {product.productName}
                          {selectedProduct === product.productName && (
                            <Badge bg="warning" text="dark" className="ms-2">
                              Selected
                            </Badge>
                          )}
                        </td>
                        <td className="text-center">{product.qtyTotal}</td>
                        <td className="text-end">{productSummary.length > 0 ? product.costTotal.toFixed(2) : "0.00"}</td>
                        <td className="text-end">{productSummary.length > 0 ? product.mrpTotal.toFixed(2) : "0.00"}</td>
                        <td className="text-end">{product.costTotal.toFixed(2)}</td>
                        <td className="text-end">{product.mrpTotal.toFixed(2)}</td>
                      </tr>
                    ))}
                    {productSummary.length > 0 && (
                      <tr className="table-warning" style={{ fontWeight: 700 }}>
                        <td colSpan={5}>TOTAL</td>
                        <td className="text-end">{productTotals.costTotal.toFixed(2)}</td>
                        <td className="text-end">{productTotals.mrpTotal.toFixed(2)}</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>

        <Card className="shadow-sm" style={{ flexShrink: 0 }}>
          <Card.Header>
            <h5 className="mb-0">
              Batch Details : {selectedProduct ?? "Select a product"}
            </h5>
          </Card.Header>
          <Card.Body>
            {!selectedSupplier || !selectedProduct ? (
              <div className="text-muted">Select a product to view batch details.</div>
            ) : batchDetails.length === 0 ? (
              <div className="text-muted">No batch records for the selected product.</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <Table bordered size="sm" className="mb-0">
                  <thead>
                    <tr>
                      <th style={{ width: "60px" }}>Sl.No</th>
                      <th style={{ width: "140px" }}>Batch No</th>
                      <th style={{ width: "100px" }} className="text-center">Qty</th>
                      <th style={{ width: "110px" }} className="text-end">Cost</th>
                      <th style={{ width: "110px" }} className="text-end">MRP</th>
                      <th style={{ width: "140px" }} className="text-end">Cost Total</th>
                      <th style={{ width: "140px" }} className="text-end">MRP Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batchDetails.map((batch) => (
                      <tr key={`${batch.batch}-${batch.id}`}>
                        <td className="text-center">{batch.id}</td>
                        <td>{batch.batch}</td>
                        <td className="text-center">{batch.qty}</td>
                        <td className="text-end">{batch.cost.toFixed(2)}</td>
                        <td className="text-end">{batch.mrp.toFixed(2)}</td>
                        <td className="text-end">{batch.costTotal.toFixed(2)}</td>
                        <td className="text-end">{batch.mrpTotal.toFixed(2)}</td>
                      </tr>
                    ))}
                    {batchDetails.length > 0 && (
                      <tr className="table-warning" style={{ fontWeight: 700 }}>
                        <td colSpan={5}>TOTAL</td>
                        <td className="text-end">{batchTotals.costTotal.toFixed(2)}</td>
                        <td className="text-end">{batchTotals.mrpTotal.toFixed(2)}</td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}

