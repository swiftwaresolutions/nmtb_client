import React, { useState } from "react";
import { Container, Card, Row, Col, Button, Form, Table, Modal, InputGroup } from "react-bootstrap";
import PageHeader from "../../../components/PageHeader";
import { faFileInvoice, faBoxes, faListAlt } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface Product {
    id: number;
    code: string;
    name: string;
    stock: number;
    reorderLevel: number;
    economicOrderQty: number;
    unit: string;
    suppliers: string[];
}

interface OrderItem {
    productId: number;
    units: string;
    supplier: string;
    deliveryDate: string;
}

const PrepareOrders: React.FC = () => {
    const [selectionMode, setSelectionMode] = useState<"initial" | "belowReorder" | "allProducts">("initial");
    const [selectedLetter, setSelectedLetter] = useState<string>("All");
    const [orderItems, setOrderItems] = useState<{ [key: number]: OrderItem }>({});
    const [selectedProducts, setSelectedProducts] = useState<Set<number>>(new Set());
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [showPOModal, setShowPOModal] = useState<boolean>(false);
    const [poDetails, setPODetails] = useState<{ [key: number]: { free: string; batchNo: string; prRate: string } }>({});

    // Mock product data - replace with API call
    const mockProducts: Product[] = [
        { id: 1, code: "PRD001", name: "11X14", stock: 50, reorderLevel: 100, economicOrderQty: 0, unit: "Box", suppliers: ["Supplier A", "Supplier B", "Supplier C"] },
        { id: 2, code: "PRD002", name: "14X17", stock: 30, reorderLevel: 80, economicOrderQty: 0, unit: "Box", suppliers: ["Supplier A", "Supplier D"] },
        { id: 3, code: "PRD003", name: "Barium Sulfate", stock: 120, reorderLevel: 50, economicOrderQty: 0, unit: "Packet", suppliers: ["Supplier B", "Supplier C"] },
        { id: 4, code: "PRD004", name: "CT Film 8x10", stock: 15, reorderLevel: 40, economicOrderQty: 0, unit: "Box", suppliers: ["Supplier A", "Supplier E"] },
        { id: 5, code: "PRD005", name: "Lead Apron", stock: 5, reorderLevel: 10, economicOrderQty: 0, unit: "Piece", suppliers: ["Supplier C", "Supplier F"] },
    ];

    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

    const handleSelectionClick = (mode: "belowReorder" | "allProducts") => {
        setSelectionMode(mode);
    };

    const handleBackToSelection = () => {
        setSelectionMode("initial");
        setSelectedLetter("All");
        setOrderItems({});
        setSelectedProducts(new Set());
    };

    const handleProductSelect = (productId: number, checked: boolean) => {
        setSelectedProducts(prev => {
            const newSet = new Set(prev);
            if (checked) {
                newSet.add(productId);
            } else {
                newSet.delete(productId);
                // Clear order items for unselected product
                setOrderItems(current => {
                    const updated = { ...current };
                    delete updated[productId];
                    return updated;
                });
            }
            return newSet;
        });
    };

    const getSelectedCount = () => selectedProducts.size;

    const handleOrderItemChange = (productId: number, field: keyof OrderItem, value: string) => {
        setOrderItems(prev => ({
            ...prev,
            [productId]: {
                ...prev[productId],
                productId,
                [field]: value,
            }
        }));
    };

    const handlePODetailChange = (productId: number, field: 'free' | 'batchNo' | 'prRate', value: string) => {
        setPODetails(prev => ({
            ...prev,
            [productId]: {
                ...prev[productId],
                free: prev[productId]?.free || "",
                batchNo: prev[productId]?.batchNo || "",
                prRate: prev[productId]?.prRate || "",
                [field]: value
            }
        }));
    };

    const handleDeletePOItem = (productId: number) => {
        setOrderItems(prev => {
            const updated = { ...prev };
            delete updated[productId];
            return updated;
        });
        setPODetails(prev => {
            const updated = { ...prev };
            delete updated[productId];
            return updated;
        });
        setSelectedProducts(prev => {
            const newSet = new Set(prev);
            newSet.delete(productId);
            return newSet;
        });
    };

    const handleConfirmSupplierOrder = (supplier: string) => {
        const supplierOrders = Object.entries(orderItems).filter(
            ([_, item]) => item.supplier === supplier
        );
        alert(`Order confirmed for ${supplier}!\nProducts: ${supplierOrders.length}`);
        console.log("Supplier:", supplier);
        console.log("Orders:", supplierOrders);
        console.log("PO Details:", poDetails);
    };

    const filteredProducts = () => {
        let products = mockProducts;

        // Filter by reorder level if needed
        if (selectionMode === "belowReorder") {
            products = products.filter(p => p.stock < p.reorderLevel);
        }

        // Filter by selected letter
        if (selectedLetter !== "All") {
            products = products.filter(p => p.name.toUpperCase().startsWith(selectedLetter));
        }

        // Filter by search term
        if (searchTerm.trim()) {
            const search = searchTerm.toLowerCase();
            products = products.filter(p => 
                p.name.toLowerCase().includes(search) || 
                p.code.toLowerCase().includes(search)
            );
        }

        return products;
    };

    // Group orders by supplier
    const getOrdersBySupplier = () => {
        const supplierGroups: { [supplier: string]: Array<{ product: Product; order: OrderItem }> } = {};
        
        Object.entries(orderItems).forEach(([productId, order]) => {
            const product = mockProducts.find(p => p.id === Number(productId));
            if (product && order.supplier) {
                if (!supplierGroups[order.supplier]) {
                    supplierGroups[order.supplier] = [];
                }
                supplierGroups[order.supplier].push({ product, order });
            }
        });
        
        return supplierGroups;
    };

    const handleSubmitOrder = () => {
        // Check if any products have supplier selected
        const hasSuppliers = Object.values(orderItems).some(item => item.supplier);
        if (!hasSuppliers) {
            alert("Please select supplier for at least one product");
            return;
        }
        setShowPOModal(true);
    };

    // Initial Selection View
    if (selectionMode === "initial") {
        return (
            <Container fluid className="p-4">
                <PageHeader
                    icon={faFileInvoice}
                    title="Purchase Order Preparation"
                    subtitle="General Store"
                />

                <Card className="shadow-sm mt-4">
                    <Card.Body className="p-5">
                        <h5 className="text-center mb-4" style={{ color: "#666" }}>
                            (Click the below links to prepare Purchase Order)
                        </h5>

                        <Row className="justify-content-center mt-5">
                            <Col md={8}>
                                <div className="d-flex flex-column gap-4">
                                    <Button
                                        variant="outline-primary"
                                        size="lg"
                                        onClick={() => handleSelectionClick("belowReorder")}
                                        style={{
                                            padding: "1.5rem",
                                            fontSize: "1.2rem",
                                            borderRadius: "12px",
                                            border: "2px solid #0d6efd",
                                            transition: "all 0.3s",
                                        }}
                                        className="d-flex align-items-center justify-content-center gap-3"
                                    >
                                        <FontAwesomeIcon icon={faBoxes} style={{ fontSize: "1.5rem" }} />
                                        <span>1. Product Below Reorder Level</span>
                                    </Button>

                                    <Button
                                        variant="outline-success"
                                        size="lg"
                                        onClick={() => handleSelectionClick("allProducts")}
                                        style={{
                                            padding: "1.5rem",
                                            fontSize: "1.2rem",
                                            borderRadius: "12px",
                                            border: "2px solid #198754",
                                            transition: "all 0.3s",
                                        }}
                                        className="d-flex align-items-center justify-content-center gap-3"
                                    >
                                        <FontAwesomeIcon icon={faListAlt} style={{ fontSize: "1.5rem" }} />
                                        <span>2. All the Product</span>
                                    </Button>
                                </div>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    // Product List View
    return (
        <Container fluid className="p-4">
            <PageHeader
                icon={faFileInvoice}
                title="Purchase Order Preparation"
                subtitle={selectionMode === "belowReorder" ? "Products Below Reorder Level" : "All Products"}
            />

            <Card className="shadow-sm mt-4">
                <Card.Header className="bg-light d-flex justify-content-between align-items-center">
                    <div>
                        <h5 className="mb-0">Select Products</h5>
                        <small className="text-muted">Selected: <strong>{getSelectedCount()}</strong> product(s)</small>
                    </div>
                    <Button variant="outline-secondary" size="sm" onClick={handleBackToSelection}>
                        ← Back to Selection
                    </Button>
                </Card.Header>

                <Card.Body>
                    {/* Search Input */}
                    <div className="mb-3">
                        <InputGroup>
                            <InputGroup.Text>
                                <FontAwesomeIcon icon={faBoxes} />
                            </InputGroup.Text>
                            <Form.Control
                                type="text"
                                placeholder="Search products by name or code..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <Button 
                                    variant="outline-secondary" 
                                    onClick={() => setSearchTerm("")}>
                                    Clear
                                </Button>
                            )}
                        </InputGroup>
                    </div>

                    <div className="mb-4 p-3 bg-light rounded">
                        <div className="d-flex flex-wrap gap-2 justify-content-center">
                            <Button
                                variant={selectedLetter === "All" ? "primary" : "outline-primary"}
                                size="sm"
                                onClick={() => setSelectedLetter("All")}
                                style={{ minWidth: "45px" }}
                            >
                                All
                            </Button>
                            {alphabet.map(letter => (
                                <Button
                                    key={letter}
                                    variant={selectedLetter === letter ? "primary" : "outline-primary"}
                                    size="sm"
                                    onClick={() => setSelectedLetter(letter)}
                                    style={{ minWidth: "45px" }}
                                >
                                    {letter}
                                </Button>
                            ))}
                        </div>
                    </div>

                    {/* Products Table */}
                    <div style={{ maxHeight: "60vh", overflowY: "auto" }}>
                        <Table bordered hover>
                            <thead style={{ position: "sticky", top: 0, backgroundColor: "#f8f9fa", zIndex: 10 }}>
                                <tr>
                                    <th style={{ width: "5%" }}>SI.No</th>
                                    <th style={{ width: "5%" }}>Select</th>
                                    <th style={{ width: "15%" }}>Product Name</th>
                                    <th style={{ width: "8%" }}>Stock</th>
                                    <th style={{ width: "10%" }}>Reorder Level</th>
                                    <th style={{ width: "15%" }}>Suppliers</th>
                                    <th style={{ width: "12%" }}>Select Supplier</th>
                                    <th style={{ width: "12%" }}>Delivery Date</th>
                                    <th style={{ width: "8%" }}>Units</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredProducts().length === 0 ? (
                                    <tr>
                                        <td colSpan={9} className="text-center text-muted py-4">
                                            No products found for letter "{selectedLetter}"
                                        </td>
                                    </tr>
                                ) : (
                                    filteredProducts().map((product, index) => {
                                        const isSelected = selectedProducts.has(product.id);
                                        return (
                                            <tr key={product.id} style={{ opacity: isSelected ? 1 : 0.6 }}>
                                                {/* SI.No */}
                                                <td className="text-center">
                                                    {index + 1}
                                                </td>

                                                {/* Select Checkbox */}
                                                <td className="text-center">
                                                    <Form.Check
                                                        type="checkbox"
                                                        checked={isSelected}
                                                        onChange={(e) => handleProductSelect(product.id, e.target.checked)}
                                                    />
                                                </td>

                                                {/* Product Name */}
                                                <td>
                                                    {product.name}
                                                </td>

                                                {/* Stock */}
                                                <td>
                                                    <div>{product.stock}</div>
                                                </td>

                                                {/* Reorder Level */}
                                                <td>
                                                    {product.reorderLevel}
                                                    {product.stock < product.reorderLevel && (
                                                        <span className="badge bg-danger ms-2">Below</span>
                                                    )}
                                                </td>

                                                {/* Suppliers */}
                                                <td>
                                                    <Form.Select
                                                        size="sm"
                                                        disabled={!isSelected}
                                                        value={orderItems[product.id]?.supplier || ""}
                                                        onChange={(e) => handleOrderItemChange(product.id, "supplier", e.target.value)}
                                                    >
                                                        <option value="">All Suppliers</option>
                                                        {product.suppliers.map((supplier, idx) => (
                                                            <option key={idx} value={supplier}>{supplier}</option>
                                                        ))}
                                                    </Form.Select>
                                                </td>

                                                {/* Select Supplier */}
                                                <td>
                                                    <Form.Select
                                                        size="sm"
                                                        disabled={!isSelected}
                                                        value={orderItems[product.id]?.supplier || ""}
                                                        onChange={(e) => handleOrderItemChange(product.id, "supplier", e.target.value)}
                                                    >
                                                        <option value="">Select a Supplier</option>
                                                        {product.suppliers.map((supplier, idx) => (
                                                            <option key={idx} value={supplier}>{supplier}</option>
                                                        ))}
                                                    </Form.Select>
                                                </td>

                                                {/* Delivery Date */}
                                                <td>
                                                    <Form.Control
                                                        type="date"
                                                        size="sm"
                                                        disabled={!isSelected}
                                                        value={orderItems[product.id]?.deliveryDate || ""}
                                                        onChange={(e) => handleOrderItemChange(product.id, "deliveryDate", e.target.value)}
                                                    />
                                                </td>

                                                {/* Units */}
                                                <td>
                                                    <Form.Control
                                                        type="number"
                                                        size="sm"
                                                        placeholder="0"
                                                        disabled={!isSelected}
                                                        value={orderItems[product.id]?.units || ""}
                                                        onChange={(e) => handleOrderItemChange(product.id, "units", e.target.value)}
                                                    />
                                                </td>
                                            </tr>
                                        );
                                    })
                                )}
                            </tbody>
                        </Table>
                    </div>

                    {/* Submit Button */}
                    {filteredProducts().length > 0 && (
                        <div className="mt-4 d-flex justify-content-end gap-2">
                            <Button variant="secondary" onClick={handleBackToSelection}>
                                Cancel
                            </Button>
                            <Button 
                                variant="success" 
                                onClick={handleSubmitOrder}
                                disabled={getSelectedCount() === 0}>
                                View Purchase Orders
                            </Button>
                        </div>
                    )}
                </Card.Body>
            </Card>

            {/* Purchase Order Modal - Supplier-wise */}
            <Modal show={showPOModal} onHide={() => setShowPOModal(false)} size="xl">
                <Modal.Header closeButton>
                    <Modal.Title>
                        <FontAwesomeIcon icon={faListAlt} className="me-2" />
                        Purchase Orders - Supplier-wise
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body style={{ maxHeight: "70vh", overflowY: "auto" }}>
                    {Object.entries(getOrdersBySupplier()).map(([supplier, items]) => (
                        <Card key={supplier} className="mb-3">
                            <Card.Header className="bg-primary text-white d-flex justify-content-between align-items-center">
                                <h5 className="mb-0">Supplier: {supplier}</h5>
                                <Button 
                                    variant="light" 
                                    size="sm"
                                    onClick={() => handleConfirmSupplierOrder(supplier)}>
                                    Confirm Order
                                </Button>
                            </Card.Header>
                            <Card.Body className="p-0">
                                <Table bordered hover size="sm" className="mb-0">
                                    <thead>
                                        <tr>
                                            <th style={{ width: "8%" }}>S. No</th>
                                            <th style={{ width: "25%" }}>Product</th>
                                            <th style={{ width: "10%" }}>Units</th>
                                            <th style={{ width: "15%" }}>Free</th>
                                            <th style={{ width: "15%" }}>Pr.Batch No</th>
                                            <th style={{ width: "15%" }}>Pr.Rate unit</th>
                                            <th style={{ width: "12%" }}>Delete</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map(({ product, order }, index) => {
                                            const details = poDetails[product.id] || { free: "", batchNo: "", prRate: "" };
                                            return (
                                                <tr key={product.id}>
                                                    <td className="text-center">{index + 1}</td>
                                                    <td>{product.name}</td>
                                                    <td className="text-center">{order.units || "0"}</td>
                                                    <td>
                                                        <Form.Control
                                                            type="number"
                                                            size="sm"
                                                            placeholder="0"
                                                            value={details.free}
                                                            onChange={(e) => handlePODetailChange(product.id, 'free', e.target.value)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <Form.Control
                                                            type="text"
                                                            size="sm"
                                                            placeholder="Batch No"
                                                            value={details.batchNo}
                                                            onChange={(e) => handlePODetailChange(product.id, 'batchNo', e.target.value)}
                                                        />
                                                    </td>
                                                    <td>
                                                        <Form.Control
                                                            type="number"
                                                            size="sm"
                                                            placeholder="Rate"
                                                            value={details.prRate}
                                                            onChange={(e) => handlePODetailChange(product.id, 'prRate', e.target.value)}
                                                        />
                                                    </td>
                                                    <td className="text-center">
                                                        <Button
                                                            variant="outline-danger"
                                                            size="sm"
                                                            onClick={() => handleDeletePOItem(product.id)}>
                                                            Delete
                                                        </Button>
                                                    </td>
                                                </tr>
                                            );
                                        })}
                                    </tbody>
                                </Table>
                            </Card.Body>
                        </Card>
                    ))}

                    {Object.keys(getOrdersBySupplier()).length === 0 && (
                        <div className="text-center text-muted py-5">
                            <p>No products with suppliers selected</p>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowPOModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default PrepareOrders;
