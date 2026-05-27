import React, { useMemo, useState } from "react";
import { Badge, Button, Card, Col, Form, Row, Table } from "react-bootstrap";
import PageHeader from "../../../../components/PageHeader";
import { faChartBar } from "@fortawesome/free-solid-svg-icons";
import SearchInput from "../../../../components/SearchInput";
import { useTableSearch } from "../../../../hooks/useTableSearch";
import { showValidationError } from "../../../../utils/alertUtil";

interface BatchRecord {
  batch: string;
  date: string;
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
  date: string;
  qty: number;
  cost: number;
  mrp: number;
  costTotal: number;
  mrpTotal: number;
}

const purchaseData: Record<string, Record<string, BatchRecord[]>> = {
  "ABC Pharma": {
    Paracetamol: [
      { batch: "B001", date: "2026-02-01", qty: 50, cost: 20, mrp: 30 },
      { batch: "B002", date: "2026-02-10", qty: 30, cost: 20, mrp: 30 },
    ],
    "Vitamin C": [
      { batch: "V001", date: "2026-02-05", qty: 40, cost: 25, mrp: 40 },
    ],
  },
  "Sun Medical": {
    ORS: [
      { batch: "O001", date: "2026-02-03", qty: 60, cost: 10, mrp: 20 },
    ],
  },
};

const months = [
  { value: "1", label: "January" },
  { value: "2", label: "February" },
  { value: "3", label: "March" },
  { value: "4", label: "April" },
  { value: "5", label: "May" },
  { value: "6", label: "June" },
  { value: "7", label: "July" },
  { value: "8", label: "August" },
  { value: "9", label: "September" },
  { value: "10", label: "October" },
  { value: "11", label: "November" },
  { value: "12", label: "December" },
];

export default function SupplierGoodaReceiptMonthly() {
  const [selectedYear, setSelectedYear] = useState<string>("2026");
  const [selectedMonth, setSelectedMonth] = useState<string>("2");
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [selectedSupplier, setSelectedSupplier] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  const availableYears = useMemo(() => {
    const years = new Set<string>();
    Object.values(purchaseData).forEach((supplierProducts) => {
      Object.values(supplierProducts).forEach((batches) => {
        batches.forEach((batch) => years.add(String(new Date(batch.date).getFullYear())));
      });
    });
    return Array.from(years).sort();
  }, []);

  const filteredData = useMemo(() => {
    if (!hasSearched) return {} as Record<string, Record<string, BatchRecord[]>>;

    const monthNumber = Number(selectedMonth);
    const yearNumber = Number(selectedYear);
    const result: Record<string, Record<string, BatchRecord[]>> = {};

    Object.entries(purchaseData).forEach(([supplier, products]) => {
      Object.entries(products).forEach(([product, batches]) => {
        const filteredBatches = batches.filter((batch) => {
          const date = new Date(batch.date);
          return date.getFullYear() === yearNumber && date.getMonth() + 1 === monthNumber;
        });

        if (filteredBatches.length > 0) {
          if (!result[supplier]) {
            result[supplier] = {};
          }
          result[supplier][product] = filteredBatches;
        }
      });
    });

    return result;
  }, [hasSearched, selectedMonth, selectedYear]);

  const supplierSummary: SupplierSummary[] = useMemo(() => {
    if (!hasSearched) return [];
    return Object.entries(filteredData).map(([supplier, products], index) => {
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
  }, [filteredData, hasSearched]);

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
    if (!selectedSupplier || !filteredData[selectedSupplier]) return [];
    return Object.entries(filteredData[selectedSupplier]).map(([product, batches], index) => {
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
  }, [filteredData, selectedSupplier]);

  const batchDetails: BatchDetail[] = useMemo(() => {
    if (!selectedSupplier || !selectedProduct) return [];
    const batches = filteredData[selectedSupplier]?.[selectedProduct] ?? [];
    return batches.map((batch, index) => ({
      id: index + 1,
      batch: batch.batch,
      date: batch.date,
      qty: batch.qty,
      cost: batch.cost,
      mrp: batch.mrp,
      costTotal: batch.qty * batch.cost,
      mrpTotal: batch.qty * batch.mrp,
    }));
  }, [filteredData, selectedProduct, selectedSupplier]);

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
    if (!selectedYear || !selectedMonth) {
      showValidationError("Please select both year and month.");
      return;
    }
    setHasSearched(true);
    setSelectedSupplier(null);
    setSelectedProduct(null);
  };

  const handleReset = () => {
    setSelectedYear("2026");
    setSelectedMonth("2");
    setHasSearched(false);
    setSelectedSupplier(null);
    setSelectedProduct(null);
    setSearchTerm("");
  };

  return (
    <div style={{ padding: "1.5rem", height: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}>
      <PageHeader
        icon={faChartBar}
        title="Supplier-wise Purchase Dashboard"
        subtitle="Monthly purchase summary by supplier, product, and batch"
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
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Month</Form.Label>
                  <Form.Select
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                  >
                    {months.map((month) => (
                      <option key={month.value} value={month.value}>
                        {month.label}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={4} className="d-flex gap-2">
                <Button type="submit" variant="primary">
                  <i className="fas fa-search me-2"></i>
                  Search
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
            <h5 className="mb-0">Supplier Summary</h5>
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
                    <th style={{ width: "60px" }}>#</th>
                    <th>Supplier</th>
                    <th className="text-end" style={{ width: "140px" }}>Cost Total</th>
                    <th className="text-end" style={{ width: "140px" }}>MRP Total</th>
                  </tr>
                </thead>
                <tbody>
                  {!hasSearched ? (
                    <tr>
                      <td colSpan={4} className="text-center py-4">
                        Select year/month and click Search to view summary.
                      </td>
                    </tr>
                  ) : searchedSuppliers.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="text-center py-4">
                        {searchTerm
                          ? `No suppliers match "${searchTerm}".`
                          : "No records found for the selected period."}
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
                        <td className="text-end">{supplier.costTotal.toFixed(2)}</td>
                        <td className="text-end">{supplier.mrpTotal.toFixed(2)}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>

        <Card className="shadow-sm" style={{ flexShrink: 0 }}>
          <Card.Header>
            <h5 className="mb-0">
              Product Summary
              {selectedSupplier && (
                <span className="ms-2 text-muted">- {selectedSupplier}</span>
              )}
            </h5>
          </Card.Header>
          <Card.Body>
            {!selectedSupplier ? (
              <div className="text-muted">Select a supplier to view products.</div>
            ) : productSummary.length === 0 ? (
              <div className="text-muted">No product records for this supplier.</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <Table bordered hover size="sm" className="mb-0">
                  <thead>
                    <tr>
                      <th style={{ width: "50px" }}>#</th>
                      <th>Product</th>
                      <th style={{ width: "100px" }} className="text-center">Quantity</th>
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
                        <td className="text-end">{product.costTotal.toFixed(2)}</td>
                        <td className="text-end">{product.mrpTotal.toFixed(2)}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            )}
          </Card.Body>
        </Card>

        <Card className="shadow-sm" style={{ flexShrink: 0 }}>
          <Card.Header>
            <h5 className="mb-0">
              Batch Details
              {selectedSupplier && selectedProduct && (
                <span className="ms-2 text-muted">- {selectedSupplier} / {selectedProduct}</span>
              )}
            </h5>
          </Card.Header>
          <Card.Body>
            {!selectedSupplier || !selectedProduct ? (
              <div className="text-muted">Select a product to view batch details.</div>
            ) : batchDetails.length === 0 ? (
              <div className="text-muted">No batches found for the selected product.</div>
            ) : (
              <div style={{ overflowX: "auto" }}>
                <Table bordered size="sm" className="mb-0">
                  <thead>
                    <tr>
                      <th style={{ width: "50px" }}>#</th>
                      <th style={{ width: "120px" }}>Batch</th>
                      <th style={{ width: "130px" }}>Date</th>
                      <th style={{ width: "90px" }} className="text-center">Qty</th>
                      <th style={{ width: "110px" }} className="text-end">Cost</th>
                      <th style={{ width: "110px" }} className="text-end">MRP</th>
                      <th style={{ width: "140px" }} className="text-end">Cost Total</th>
                      <th style={{ width: "140px" }} className="text-end">MRP Total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {batchDetails.map((batch) => (
                      <tr key={`${batch.batch}-${batch.date}`}>
                        <td className="text-center">{batch.id}</td>
                        <td>{batch.batch}</td>
                        <td>
                          {new Date(batch.date).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td className="text-center">{batch.qty}</td>
                        <td className="text-end">{batch.cost.toFixed(2)}</td>
                        <td className="text-end">{batch.mrp.toFixed(2)}</td>
                        <td className="text-end">{batch.costTotal.toFixed(2)}</td>
                        <td className="text-end">{batch.mrpTotal.toFixed(2)}</td>
                      </tr>
                    ))}
                    <tr className="table-warning" style={{ fontWeight: 600 }}>
                      <td colSpan={6}>TOTAL</td>
                      <td className="text-end">{batchTotals.costTotal.toFixed(2)}</td>
                      <td className="text-end">{batchTotals.mrpTotal.toFixed(2)}</td>
                    </tr>
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