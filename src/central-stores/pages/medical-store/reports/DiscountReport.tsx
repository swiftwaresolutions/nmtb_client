import React, { useMemo, useState } from "react";
import { Card, Table } from "react-bootstrap";
import PageHeader from "../../../../components/PageHeader";
import { faTags } from "@fortawesome/free-solid-svg-icons";
import SearchInput from "../../../../components/SearchInput";
import { useTableSearch } from "../../../../hooks/useTableSearch";

interface BatchDetail {
  batchNo: string;
  expiryDate: string;
  discountPercent: number;
}

interface DiscountProduct {
  id: number;
  productName: string;
  genericName: string;
  batches: BatchDetail[];
}

const discountData: DiscountProduct[] = [
  {
    id: 1,
    productName: "Paracetamol 500mg",
    genericName: "Acetaminophen",
    batches: [
      { batchNo: "B001", expiryDate: "2026-06-15", discountPercent: 10 },
      { batchNo: "B002", expiryDate: "2026-08-20", discountPercent: 5 },
    ],
  },
  {
    id: 2,
    productName: "Vitamin C",
    genericName: "Ascorbic Acid",
    batches: [
      { batchNo: "V010", expiryDate: "2026-07-10", discountPercent: 8 },
    ],
  },
  {
    id: 3,
    productName: "Amoxicillin",
    genericName: "Amoxicillin Trihydrate",
    batches: [
      { batchNo: "A021", expiryDate: "2026-05-30", discountPercent: 12 },
      { batchNo: "A022", expiryDate: "2026-09-05", discountPercent: 7 },
    ],
  },
];

export default function DiscountReport() {
  const {
    filteredData: filteredProducts,
    searchTerm,
    setSearchTerm,
    resultCount,
    totalCount,
  } = useTableSearch({
    data: discountData,
    searchFields: ["productName", "genericName"],
  });

  const totalBatches = useMemo(() => {
    return filteredProducts.reduce((sum, product) => sum + product.batches.length, 0);
  }, [filteredProducts]);

  return (
    <div style={{ padding: "1.5rem", height: "100%", display: "flex", flexDirection: "column", minHeight: 0 }}>
      <PageHeader
        icon={faTags}
        title="Discount Batch Details"
        subtitle="View batch-wise discount details for products"
      />

      <Card className="shadow-sm" style={{ flex: 1, minHeight: 0, display: "flex", flexDirection: "column" }}>
        <Card.Header className="d-flex justify-content-between align-items-center">
          <h6 className="mb-0">Discount Batch Details</h6>
          <SearchInput
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            placeholder="Search product or generic name..."
            resultCount={resultCount}
            totalCount={totalCount}
            showResultCount={true}
            className="w-auto"
          />
        </Card.Header>
        <Card.Body style={{ flex: 1, minHeight: 0, overflow: "auto", padding: 0 }}>
          <div style={{ overflowX: "auto", height: "100%" }}>
            <Table bordered hover className="mb-0" style={{ fontSize: "0.875rem" }}>
              <thead className="table-primary" style={{ position: "sticky", top: 0, zIndex: 10 }}>
                <tr>
                  <th style={{ width: "5%" }}>Sl. No</th>
                  <th style={{ width: "20%" }}>Product Name</th>
                  <th style={{ width: "20%" }}>Generic Name</th>
                  <th style={{ width: "55%" }}>Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="text-center py-4">
                      {searchTerm
                        ? `No products match "${searchTerm}".`
                        : "No discount batch details available."}
                    </td>
                  </tr>
                ) : (
                  filteredProducts.map((product, index) => (
                    <tr key={product.id}>
                      <td>{index + 1}</td>
                      <td>{product.productName}</td>
                      <td>{product.genericName}</td>
                      <td>
                        <Table bordered hover size="sm" className="mb-1">
                          <thead className="table-light">
                            <tr>
                              <th>Batch No</th>
                              <th>Expiry Date</th>
                              <th>Disc %</th>
                            </tr>
                          </thead>
                          <tbody>
                            {product.batches.map((batch, batchIndex) => (
                              <tr key={`${product.id}-${batchIndex}`}>
                                <td>{batch.batchNo}</td>
                                <td>
                                  {new Date(batch.expiryDate).toLocaleDateString("en-GB", {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                  })}
                                </td>
                                <td>{batch.discountPercent}%</td>
                              </tr>
                            ))}
                          </tbody>
                        </Table>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </Table>
          </div>
        </Card.Body>
        {filteredProducts.length > 0 && (
          <Card.Footer className="bg-light text-end">
            <span className="text-muted">
              Total Products: <strong>{filteredProducts.length}</strong> | Total Batches: <strong>{totalBatches}</strong>
            </span>
          </Card.Footer>
        )}
      </Card>
    </div>
  );
}
