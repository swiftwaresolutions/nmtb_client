import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Container, Card, Button, Table } from "react-bootstrap";
import { useSelector } from "react-redux";
import { RootState } from "../../../../state/store";
import SearchInput from "../../../../components/SearchInput";
import { useTableSearch } from "../../../../hooks/useTableSearch";
import { ListCheck } from "react-bootstrap-icons";
import PageHeader from "../../../../components/PageHeader";
import { faClipboardCheck } from "@fortawesome/free-solid-svg-icons";

interface Product {
    id: number;
    code: string;
    name: string;
    rack: string;
    shelf: string;
    min: number;
    max: number;
    safe: number;
    eoq: number;
    usagePercent: number;
}

const ProductProperties = () => {
    const navigate = useNavigate();
    const loginData = useSelector((state: RootState) => state.loginData);

    const [selectedLetter, setSelectedLetter] = useState<string>("All");

    // Sample products with properties
    const [products] = useState<Product[]>([
        {
            id: 1,
            code: "PRD001",
            name: "11X14",
            rack: "A",
            shelf: "1",
            min: 0,
            max: 0,
            safe: 0,
            eoq: 0,
            usagePercent: 0,
        },
        {
            id: 2,
            code: "PRD002",
            name: "arm sling",
            rack: "B",
            shelf: "2",
            min: 10,
            max: 100,
            safe: 20,
            eoq: 50,
            usagePercent: 15,
        },
        {
            id: 3,
            code: "PRD003",
            name: "CT Contrast Media",
            rack: "C",
            shelf: "1",
            min: 20,
            max: 100,
            safe: 30,
            eoq: 50,
            usagePercent: 25,
        },
        {
            id: 4,
            code: "PRD004",
            name: "Developer Solution",
            rack: "D",
            shelf: "3",
            min: 5,
            max: 50,
            safe: 10,
            eoq: 25,
            usagePercent: 10,
        },
        {
            id: 5,
            code: "PRD005",
            name: "Lead Apron",
            rack: "A",
            shelf: "4",
            min: 2,
            max: 10,
            safe: 3,
            eoq: 5,
            usagePercent: 5,
        },
        {
            id: 6,
            code: "PRD006",
            name: "MRI Contrast Agent",
            rack: "C",
            shelf: "2",
            min: 15,
            max: 80,
            safe: 25,
            eoq: 40,
            usagePercent: 20,
        },
        {
            id: 7,
            code: "PRD007",
            name: "Ultrasound Gel",
            rack: "B",
            shelf: "1",
            min: 50,
            max: 200,
            safe: 75,
            eoq: 100,
            usagePercent: 30,
        },
        {
            id: 8,
            code: "PRD008",
            name: "X-Ray Film 14x17",
            rack: "A",
            shelf: "2",
            min: 30,
            max: 150,
            safe: 50,
            eoq: 75,
            usagePercent: 18,
        },
        {
            id: 9,
            code: "PRD009",
            name: "Ultrasound Gel",
            rack: "B",
            shelf: "1",
            min: 50,
            max: 200,
            safe: 75,
            eoq: 100,
            usagePercent: 30,
        },
        {
            id: 10,
            code: "PRD0010",
            name: "X-Ray Film 14x17",
            rack: "A",
            shelf: "2",
            min: 30,
            max: 150,
            safe: 50,
            eoq: 75,
            usagePercent: 18,
        },
    ]);

    // Alphabet filtering
    const alphabetFilteredProducts =
        selectedLetter === "All"
            ? products
            : products.filter((p) =>
                  p.name.toUpperCase().startsWith(selectedLetter)
              );

    const handleProductClick = (product: Product) => {
        navigate("/hims/radiology/masters/product-properties/details", {
            state: { product },
        });
    };

    // Search functionality
    const {
        filteredData: filteredProducts,
        searchTerm,
        setSearchTerm,
        resultCount,
        totalCount,
    } = useTableSearch({
        data: alphabetFilteredProducts,
        searchFields: ["name", "code"],
    });

    return (
        <Container fluid className="p-4">
            <PageHeader
                icon={faClipboardCheck}
                title="Product Properties - Product List"
                subtitle="Select a product to edit its properties"
                badges={[{ label: "Total Products", value: products.length }]}
            />

            {/* Alphabet Filter */}
            <Card className="shadow-sm mt-4">
                <Card.Body className="p-3">
                    <div className="d-flex flex-wrap gap-2 align-items-center">
                        <strong className="me-2">Filter by:</strong>
                        <Button
                            variant={selectedLetter === "All" ? "primary" : "outline-primary"}
                            size="sm"
                            onClick={() => setSelectedLetter("All")}
                        >
                            All
                        </Button>
                        {"ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").map((letter) => (
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
                </Card.Body>
            </Card>

            {/* Products Table */}
            <Card className="shadow-sm mt-3">
                <Card.Header className="bg-light d-flex justify-content-between align-items-center">
                    <h5 className="mb-0">
                        <ListCheck size={22} className="me-2" />
                        Products
                    </h5>
                    <SearchInput
                        searchTerm={searchTerm}
                        onSearchChange={setSearchTerm}
                        placeholder="Search products by name or code..."
                        resultCount={resultCount}
                        totalCount={totalCount}
                        showResultCount={true}
                    />
                </Card.Header>
                <Card.Body>
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th style={{ width: "80px" }}>S.No</th>
                                <th>Product Name</th>
                                <th style={{ width: "120px" }}>Rack</th>
                                <th style={{ width: "120px" }}>Shelf</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProducts.length === 0 ? (
                                <tr>
                                    <td colSpan={4} style={{ textAlign: "center" }}>
                                        {searchTerm
                                            ? "No products match your search."
                                            : "No products available."}
                                    </td>
                                </tr>
                            ) : (
                                filteredProducts.map((product, idx) => (
                                    <tr key={product.id}>
                                        <td>{idx + 1}</td>
                                        <td>
                                            <Button
                                                variant="link"
                                                className="p-0 text-start"
                                                style={{
                                                    textDecoration: "none",
                                                    fontWeight: "var(--font-weight-semibold)",
                                                    color: "#0d6efd",
                                                }}
                                                onClick={() => handleProductClick(product)}
                                            >
                                                {product.name}
                                            </Button>
                                        </td>
                                        <td>{product.rack}</td>
                                        <td>{product.shelf}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default ProductProperties;
