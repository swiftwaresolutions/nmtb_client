import React, { useMemo } from "react";
import { Badge, Button, Card, Col, Row, Table } from "react-bootstrap";
import PageHeader from "../../../../components/PageHeader";
import { faBoxesStacked } from "@fortawesome/free-solid-svg-icons";

interface StockCostItem {
  id: number;
  productName: string;
  stock: number;
  cost: number;
}

interface StockMrpItem {
  id: number;
  productName: string;
  stock: number;
  mrp: number;
}

const sectionAData: StockCostItem[] = [
  { id: 1, productName: "Paracetamol", stock: 120, cost: 5.0 },
  { id: 2, productName: "Amoxicillin", stock: 80, cost: 12.0 },
];

const sectionBData: StockMrpItem[] = [
  { id: 1, productName: "Vitamin C", stock: 60, mrp: 15.0 },
  { id: 2, productName: "Cough Syrup", stock: 40, mrp: 55.0 },
];

export default function StockValue() {
  const stockValueDate = useMemo(() => {
    return new Date().toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }, []);

  const totalCostValue = useMemo(() => {
    return sectionAData.reduce((sum, item) => sum + item.stock * item.cost, 0);
  }, []);

  const totalMrpValue = useMemo(() => {
    return sectionBData.reduce((sum, item) => sum + item.stock * item.mrp, 0);
  }, []);

  return (
    <div style={{ padding: "1.5rem", height: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}>
      <PageHeader
        icon={faBoxesStacked}
        title="Stock Value Report"
        subtitle={`Date: ${stockValueDate}`}
      />

      <div style={{ flex: 1, minHeight: 0 }}>
        <Row className="g-4">
          <Col lg={6}>
            <Card className="shadow-sm h-100">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Pharmacy Store</h5>
                <Badge bg="info">Cost Value</Badge>
              </Card.Header>
              <Card.Body style={{ padding: 0 }}>
                <div style={{ overflowX: "auto" }}>
                  <Table bordered hover className="mb-0">
                    <thead style={{ backgroundColor: "#f8f9fa" }}>
                      <tr>
                        <th style={{ width: "60px" }}>Sl</th>
                        <th>Product</th>
                        <th style={{ width: "100px" }} className="text-center">Stock</th>
                        <th style={{ width: "100px" }} className="text-end">Cost</th>
                        <th style={{ width: "120px" }} className="text-end">Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sectionAData.map((item, index) => (
                        <tr key={item.id}>
                          <td className="text-center">{index + 1}</td>
                          <td>{item.productName}</td>
                          <td className="text-center">{item.stock}</td>
                          <td className="text-end">{item.cost.toFixed(2)}</td>
                          <td className="text-end">{(item.stock * item.cost).toFixed(2)}</td>
                        </tr>
                      ))}
                      <tr className="table-light" style={{ fontWeight: 700 }}>
                        <td colSpan={4}>Total</td>
                        <td className="text-end">{totalCostValue.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </Col>

          <Col lg={6}>
            <Card className="shadow-sm h-100">
              <Card.Header className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">Pharmacy </h5>
                <Badge bg="warning" text="dark">MRP Value</Badge>
              </Card.Header>
              <Card.Body style={{ padding: 0 }}>
                <div style={{ overflowX: "auto" }}>
                  <Table bordered hover className="mb-0">
                    <thead style={{ backgroundColor: "#f8f9fa" }}>
                      <tr>
                        <th style={{ width: "60px" }}>Sl</th>
                        <th>Product</th>
                        <th style={{ width: "100px" }} className="text-center">Stock</th>
                        <th style={{ width: "100px" }} className="text-end">MRP</th>
                        <th style={{ width: "120px" }} className="text-end">MRP Value</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sectionBData.map((item, index) => (
                        <tr key={item.id}>
                          <td className="text-center">{index + 1}</td>
                          <td>{item.productName}</td>
                          <td className="text-center">{item.stock}</td>
                          <td className="text-end">{item.mrp.toFixed(2)}</td>
                          <td className="text-end">{(item.stock * item.mrp).toFixed(2)}</td>
                        </tr>
                      ))}
                      <tr className="table-light" style={{ fontWeight: 700 }}>
                        <td colSpan={4}>Total</td>
                        <td className="text-end">{totalMrpValue.toFixed(2)}</td>
                      </tr>
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </div>

      <div className="text-center mt-4">
        <Button variant="outline-primary" onClick={() => window.print()}>
          <i className="fas fa-print me-2"></i>
          Print
        </Button>
      </div>
    </div>
  );
}
