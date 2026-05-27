import React, { useMemo, useState } from "react";
import { Badge, Button, Card, Col, Form, Row, Table } from "react-bootstrap";
import PageHeader from "../../../../components/PageHeader";
import { faFileAlt } from "@fortawesome/free-solid-svg-icons";
import SearchInput from "../../../../components/SearchInput";
import { useTableSearch } from "../../../../hooks/useTableSearch";
import { showValidationError } from "../../../../utils/alertUtil";

interface GrnItem {
  name: string;
  batch: string;
  qty: number;
  cost: number;
  mrp: number;
  free: number;
}

interface GrnRecord {
  id: number;
  supplierName: string;
  grnNo: string;
  invoiceNo: string;
  total: number;
  date: string;
  userName: string;
  items: GrnItem[];
}

const grnData: GrnRecord[] = [
  {
    id: 1,
    supplierName: "ABC Pharma",
    grnNo: "GRN1001",
    invoiceNo: "INV9001",
    total: 2450,
    date: "2026-02-01",
    userName: "Admin",
    items: [
      { name: "Paracetamol 500mg", batch: "P01", qty: 20, cost: 30, mrp: 40, free: 2 },
      { name: "Vitamin C", batch: "V11", qty: 15, cost: 45, mrp: 60, free: 1 },
    ],
  },
  {
    id: 2,
    supplierName: "Sun Medical",
    grnNo: "GRN1002",
    invoiceNo: "INV9002",
    total: 1800,
    date: "2026-02-04",
    userName: "Ravi",
    items: [
      { name: "Cough Syrup", batch: "C02", qty: 10, cost: 70, mrp: 95, free: 0 },
    ],
  },
  {
    id: 3,
    supplierName: "Apollo Distributors",
    grnNo: "GRN1003",
    invoiceNo: "INV9003",
    total: 3200,
    date: "2026-02-10",
    userName: "Meena",
    items: [
      { name: "Zinc Tablets", batch: "Z05", qty: 30, cost: 25, mrp: 35, free: 3 },
      { name: "ORS Pack", batch: "O09", qty: 40, cost: 15, mrp: 25, free: 5 },
    ],
  },
];

export default function SupplierGoodaReceiptDates() {
  const [selectedSupplier, setSelectedSupplier] = useState<string>("All");
  const [fromDate, setFromDate] = useState<string>("");
  const [toDate, setToDate] = useState<string>("");
  const [filteredGrns, setFilteredGrns] = useState<GrnRecord[]>([]);
  const [selectedGrnId, setSelectedGrnId] = useState<number | null>(null);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const suppliers = useMemo(() => {
    const unique = Array.from(new Set(grnData.map((g) => g.supplierName)));
    return ["All", ...unique];
  }, []);

  const {
    filteredData: searchedGrns,
    searchTerm,
    setSearchTerm,
    resultCount,
    totalCount,
  } = useTableSearch({
    data: filteredGrns,
    searchFields: ["grnNo", "invoiceNo", "userName", "supplierName"],
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (fromDate && toDate && new Date(fromDate) > new Date(toDate)) {
      showValidationError("From date cannot be later than To date.");
      return;
    }

    let result = [...grnData];

    if (selectedSupplier !== "All") {
      result = result.filter((g) => g.supplierName === selectedSupplier);
    }

    if (fromDate) {
      const from = new Date(fromDate);
      result = result.filter((g) => new Date(g.date) >= from);
    }

    if (toDate) {
      const to = new Date(toDate);
      result = result.filter((g) => new Date(g.date) <= to);
    }

    setFilteredGrns(result);
    setSelectedGrnId(null);
    setHasSearched(true);
  };

  const handleReset = () => {
    setSelectedSupplier("All");
    setFromDate("");
    setToDate("");
    setFilteredGrns([]);
    setSelectedGrnId(null);
    setHasSearched(false);
    setSearchTerm("");
  };

  const selectedGrn = searchedGrns.find((g) => g.id === selectedGrnId) || null;

  const totals = selectedGrn
    ? selectedGrn.items.reduce(
        (acc, item) => {
          acc.totalQty += item.qty;
          acc.totalAmount += item.qty * item.cost;
          return acc;
        },
        { totalQty: 0, totalAmount: 0 }
      )
    : { totalQty: 0, totalAmount: 0 };

  return (
    <div style={{ padding: "1.5rem", height: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}>
      <PageHeader
        icon={faFileAlt}
        title="Supplier Goods Receipt (GRN)"
        subtitle="Filter GRN by supplier and date range, then view item details"
      />

      <Card className="shadow-sm mb-4" style={{ flexShrink: 0 }}>
        <Card.Body>
          <Form onSubmit={handleSearch}>
            <Row className="align-items-end g-3">
              <Col md={4}>
                <Form.Group>
                  <Form.Label>Supplier</Form.Label>
                  <Form.Select
                    value={selectedSupplier}
                    onChange={(e) => setSelectedSupplier(e.target.value)}
                  >
                    {suppliers.map((supplier) => (
                      <option key={supplier} value={supplier}>
                        {supplier}
                      </option>
                    ))}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>From Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>To Date</Form.Label>
                  <Form.Control
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                  />
                </Form.Group>
              </Col>
              <Col md={2} className="d-flex gap-2">
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

      <div style={{ display: "flex", gap: "1rem", flex: 1, minHeight: 0, flexDirection: "column" }}>
        <Card className="shadow-sm" style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
          <Card.Header className="d-flex justify-content-between align-items-center">
            <h5 className="mb-0">GRN List</h5>
            <SearchInput
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              placeholder="Search by GRN, invoice, user, supplier..."
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
                    <th>GRN No</th>
                    <th>Invoice</th>
                    <th style={{ width: "120px" }} className="text-end">Total</th>
                    <th style={{ width: "130px" }}>Date</th>
                    <th>User</th>
                  </tr>
                </thead>
                <tbody>
                  {!hasSearched ? (
                    <tr>
                      <td colSpan={6} className="text-center py-4">
                        Use the filters above and click Search to view GRNs.
                      </td>
                    </tr>
                  ) : searchedGrns.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="text-center py-4">
                        {searchTerm
                          ? `No GRN records match "${searchTerm}".`
                          : "No GRN records found for the selected filters."}
                      </td>
                    </tr>
                  ) : (
                    searchedGrns.map((g, index) => (
                      <tr
                        key={g.id}
                        onClick={() => setSelectedGrnId(g.id)}
                        style={{
                          cursor: "pointer",
                          backgroundColor: selectedGrnId === g.id ? "#fff3cd" : "transparent",
                        }}
                      >
                        <td className="text-center">{index + 1}</td>
                        <td>
                          {g.grnNo}
                          {selectedGrnId === g.id && (
                            <Badge bg="warning" text="dark" className="ms-2">
                              Selected
                            </Badge>
                          )}
                        </td>
                        <td>{g.invoiceNo}</td>
                        <td className="text-end">{g.total.toFixed(2)}</td>
                        <td>
                          {new Date(g.date).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })}
                        </td>
                        <td>{g.userName}</td>
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
            <h5 className="mb-0">GRN Details</h5>
          </Card.Header>
          <Card.Body>
            {!selectedGrn ? (
              <div className="text-muted">Click any GRN to view items.</div>
            ) : (
              <>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <div>
                    <strong>{selectedGrn.grnNo}</strong>
                    <span className="ms-2 text-muted">Invoice: {selectedGrn.invoiceNo}</span>
                  </div>
                  <Badge bg="info">{selectedGrn.supplierName}</Badge>
                </div>
                <div style={{ overflowX: "auto" }}>
                  <Table bordered size="sm" className="mb-0">
                    <thead>
                      <tr>
                        <th style={{ width: "50px" }}>#</th>
                        <th>Product</th>
                        <th style={{ width: "120px" }}>Batch</th>
                        <th style={{ width: "90px" }} className="text-end">Qty</th>
                        <th style={{ width: "110px" }} className="text-end">Cost</th>
                        <th style={{ width: "110px" }} className="text-end">MRP</th>
                        <th style={{ width: "80px" }} className="text-center">Free</th>
                        <th style={{ width: "130px" }} className="text-end">Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedGrn.items.map((item, idx) => (
                        <tr key={`${selectedGrn.id}-${idx}`}>
                          <td className="text-center">{idx + 1}</td>
                          <td>{item.name}</td>
                          <td>{item.batch}</td>
                          <td className="text-end">{item.qty}</td>
                          <td className="text-end">{item.cost.toFixed(2)}</td>
                          <td className="text-end">{item.mrp.toFixed(2)}</td>
                          <td className="text-center">{item.free}</td>
                          <td className="text-end">{(item.qty * item.cost).toFixed(2)}</td>
                        </tr>
                      ))}
                      <tr className="table-warning" style={{ fontWeight: 600 }}>
                        <td colSpan={3}>TOTAL</td>
                        <td className="text-end">{totals.totalQty}</td>
                        <td colSpan={3}></td>
                        <td className="text-end">{totals.totalAmount.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </Table>
                </div>
              </>
            )}
          </Card.Body>
        </Card>
      </div>
    </div>
  );
}
