import React, { useState, useMemo } from "react";
import { Container, Card, Accordion, Button, Table, Badge, Row, Col, Form } from "react-bootstrap";
import PageHeader from "../../../components/PageHeader";
import SearchInput from "../../../components/SearchInput";
import { useTableSearch } from "../../../hooks/useTableSearch";
import { faTimesCircle, faChevronDown, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface OrderProduct {
    id: number;
    productName: string;
    units: number;
    free: number;
    batchNo: string;
    rate: number;
    total: number;
}

interface PurchaseOrder {
    id: number;
    orderNo: string;
    supplierName: string;
    date: string;
    status: "pending" | "approved" | "rejected";
    products: OrderProduct[];
    totalAmount: number;
}

const ClosePO: React.FC = () => {
    const [activeKey, setActiveKey] = useState<string | null>(null);
    const [selectedSupplier, setSelectedSupplier] = useState<string>("all");

    // Mock data - Replace with API call
    const mockOrders: PurchaseOrder[] = [
        {
            id: 1,
            orderNo: "699",
            supplierName: "",
            date: "23-03-2023",
            status: "pending",
            products: [
                { id: 1, productName: "11X14", units: 50, free: 5, batchNo: "B001", rate: 150, total: 7500 },
                { id: 2, productName: "14X17", units: 30, free: 3, batchNo: "B002", rate: 200, total: 6000 },
            ],
            totalAmount: 13500,
        },
        {
            id: 2,
            orderNo: "701",
            supplierName: "",
            date: "23-03-2023",
            status: "pending",
            products: [
                { id: 3, productName: "Barium Sulfate", units: 100, free: 10, batchNo: "B003", rate: 80, total: 8000 },
            ],
            totalAmount: 8000,
        },
        {
            id: 3,
            orderNo: "744",
            supplierName: "NATIONAL HOSPITAL SUPPLIERS",
            date: "23-02-2024",
            status: "pending",
            products: [
                { id: 4, productName: "CT Film 8x10", units: 40, free: 4, batchNo: "B004", rate: 120, total: 4800 },
                { id: 5, productName: "Lead Apron", units: 10, free: 1, batchNo: "B005", rate: 5000, total: 50000 },
            ],
            totalAmount: 54800,
        },
        {
            id: 4,
            orderNo: "745",
            supplierName: "",
            date: "23-02-2024",
            status: "pending",
            products: [
                { id: 6, productName: "11X14", units: 75, free: 7, batchNo: "B006", rate: 150, total: 11250 },
            ],
            totalAmount: 11250,
        },
        {
            id: 5,
            orderNo: "810",
            supplierName: "SUPPLIER",
            date: "21-01-2026",
            status: "pending",
            products: [
                { id: 7, productName: "14X17", units: 60, free: 6, batchNo: "B007", rate: 200, total: 12000 },
                { id: 8, productName: "Barium Sulfate", units: 50, free: 5, batchNo: "B008", rate: 80, total: 4000 },
            ],
            totalAmount: 16000,
        },
    ];

    const [orders, setOrders] = useState<PurchaseOrder[]>(mockOrders);

    // Search functionality
    const {
        filteredData: searchedOrders,
        searchTerm,
        setSearchTerm,
        resultCount,
        totalCount,
    } = useTableSearch({
        data: orders,
        searchFields: ["orderNo", "supplierName", "date"],
    });

    // Get unique suppliers
    const uniqueSuppliers = useMemo(() => {
        const suppliers = orders
            .map(order => order.supplierName)
            .filter(name => name && name.trim() !== "")
            .filter((name, index, self) => self.indexOf(name) === index)
            .sort();
        return suppliers;
    }, [orders]);

    // Filter by selected supplier
    const displayedOrders = useMemo(() => {
        if (selectedSupplier === "all") return searchedOrders;
        
        return searchedOrders.filter(order => order.supplierName === selectedSupplier);
    }, [searchedOrders, selectedSupplier]);

    const handleClose = (orderId: number) => {
        const order = orders.find((o) => o.id === orderId);
        if (order) {
            const confirmed = window.confirm(
                `Close Purchase Order ${order.orderNo}?\n\n` +
                `Supplier: ${order.supplierName || "N/A"}\n` +
                `Total Amount: ₹${order.totalAmount.toLocaleString()}\n` +
                `Products: ${order.products.length}`
            );
            if (confirmed) {
                setOrders(orders.map((o) => (o.id === orderId ? { ...o, status: "rejected" } : o)));
                alert(`Purchase Order ${order.orderNo} has been closed!`);
            }
        }
    };

    return (
        <Container fluid className="p-4">
            <PageHeader
                icon={faTimesCircle}
                title="Close P.O"
                subtitle="Close completed or cancelled purchase orders"
            />

            {/* Search and Supplier Filter Controls */}
            <div className="d-flex justify-content-between align-items-center mb-3 mt-4">
                <SearchInput
                    searchTerm={searchTerm}
                    onSearchChange={setSearchTerm}
                    placeholder="Search by order no., supplier, or date..."
                    resultCount={resultCount}
                    totalCount={totalCount}
                    className="flex-grow-1 me-3"
                />
                <Form.Group className="d-flex align-items-center" style={{ minWidth: "250px" }}>
                    <Form.Label className="mb-0 me-2 text-nowrap">Filter by Supplier:</Form.Label>
                    <Form.Select
                        size="sm"
                        value={selectedSupplier}
                        onChange={(e) => setSelectedSupplier(e.target.value)}
                    >
                        <option value="all">All Suppliers</option>
                        {uniqueSuppliers.map((supplier) => (
                            <option key={supplier} value={supplier}>
                                {supplier}
                            </option>
                        ))}
                    </Form.Select>
                </Form.Group>
            </div>

            <Card className="shadow-sm">
                {/* Card Header with Column Labels */}
                <Card.Header className="bg-light">
                    <Row className="fw-bold">
                        <Col md={1}>S. No</Col>
                        <Col md={2}>Order No.</Col>
                        <Col md={4}>Supplier Name</Col>
                        <Col md={2}>Date</Col>
                        <Col md={2}>Status</Col>
                        <Col md={1}>Action</Col>
                    </Row>
                </Card.Header>

                {/* Accordion with Purchase Orders */}
                <Accordion activeKey={activeKey} onSelect={(key) => setActiveKey(key as string)}>
                    {displayedOrders.map((order, index) => (
                        <Accordion.Item eventKey={`order-${order.id}`} key={order.id}>
                            {/* Accordion Header with Order Summary */}
                            <Accordion.Header>
                                <Row className="w-100 align-items-center">
                                    <Col md={1} className="text-center">
                                        <FontAwesomeIcon
                                            icon={activeKey === `order-${order.id}` ? faChevronDown : faChevronRight}
                                            className="me-2"
                                            style={{ fontSize: "0.8rem" }}
                                        />
                                        {index + 1}
                                    </Col>
                                    <Col md={2}>
                                        <strong>{order.orderNo}</strong>
                                    </Col>
                                    <Col md={4}>
                                        {order.supplierName || <span className="text-muted">-</span>}
                                    </Col>
                                    <Col md={2}>{order.date}</Col>
                                    <Col md={2}>
                                        <Badge
                                            bg={
                                                order.status === "approved"
                                                    ? "success"
                                                    : order.status === "rejected"
                                                    ? "danger"
                                                    : "warning"
                                            }
                                        >
                                            {order.status.toUpperCase()}
                                        </Badge>
                                    </Col>
                                    <Col md={1}>
                                        <Button
                                            variant={order.status === "rejected" ? "secondary" : "danger"}
                                            size="sm"
                                            disabled={order.status === "rejected"}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleClose(order.id);
                                            }}
                                        >
                                            {order.status === "rejected" ? "Closed" : "Close"}
                                        </Button>
                                    </Col>
                                </Row>
                            </Accordion.Header>

                            {/* Accordion Body with Product Details */}
                            <Accordion.Body>
                                <div className="p-3">
                                    <h6 className="mb-3">Order Details - PO #{order.orderNo}</h6>
                                    <Table bordered hover size="sm">
                                        <thead >
                                            <tr>
                                                <th style={{ width: "5%" }}>S.No</th>
                                                <th style={{ width: "30%" }}>Product Name</th>
                                                <th style={{ width: "10%" }}>Units</th>
                                                <th style={{ width: "10%" }}>Free</th>
                                                <th style={{ width: "15%" }}>Batch No</th>
                                                <th style={{ width: "12%" }}>Rate (₹)</th>
                                                <th style={{ width: "18%" }}>Total (₹)</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {order.products.map((product, idx) => (
                                                <tr key={product.id}>
                                                    <td className="text-center">{idx + 1}</td>
                                                    <td>{product.productName}</td>
                                                    <td className="text-center">{product.units}</td>
                                                    <td className="text-center">{product.free}</td>
                                                    <td>{product.batchNo}</td>
                                                    <td className="text-end">{product.rate.toLocaleString()}</td>
                                                    <td className="text-end">
                                                        <strong>{product.total.toLocaleString()}</strong>
                                                    </td>
                                                </tr>
                                            ))}
                                            <tr className="table-secondary">
                                                <td colSpan={6} className="text-end">
                                                    <strong>Total Amount:</strong>
                                                </td>
                                                <td className="text-end">
                                                    <strong style={{ fontSize: "1.1rem", color: "#0d6efd" }}>
                                                        ₹{order.totalAmount.toLocaleString()}
                                                    </strong>
                                                </td>
                                            </tr>
                                        </tbody>
                                    </Table>

                                    <div className="mt-3 text-end">
                                        <Button variant="outline-secondary" size="sm" className="me-2">
                                            Print
                                        </Button>
                                        <Button
                                            variant={order.status === "rejected" ? "secondary" : "danger"}
                                            size="sm"
                                            disabled={order.status === "rejected"}
                                            onClick={() => handleClose(order.id)}
                                        >
                                            {order.status === "rejected" ? "✓ Closed" : "Close Order"}
                                        </Button>
                                    </div>
                                </div>
                            </Accordion.Body>
                        </Accordion.Item>
                    ))}
                </Accordion>

                {/* Empty State */}
                {displayedOrders.length === 0 && (
                    <Card.Body className="text-center text-muted py-5">
                        <p>
                            {searchTerm || selectedSupplier !== "all"
                                ? "No orders found matching your filters"
                                : "No purchase orders to close"}
                        </p>
                    </Card.Body>
                )}
            </Card>
        </Container>
    );
};

export default ClosePO;
