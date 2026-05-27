import React, { useState, useMemo } from "react";
import { Container, Card, Accordion, Button, Table, Badge, Row, Col, Form } from "react-bootstrap";
import PageHeader from "../../../components/PageHeader";
import SearchInput from "../../../components/SearchInput";
import { useTableSearch } from "../../../hooks/useTableSearch";
import { faPrint, faChevronDown, faChevronRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

// Interfaces
interface OrderProduct {
    id: number;
    code: string;
    manufacturer: string;
    productName: string;
    units: number;
    unit: string; // No(s), Gm, etc.
    free?: number;
    batchNo?: string;
    rate?: number;
    total?: number;
}

interface SupplierDetails {
    name: string;
    address: string[];
    gstNo?: string;
}

interface PurchaseOrder {
    id: number;
    orderNo: string;
    supplierName: string;
    supplierDetails?: SupplierDetails;
    date: string;
    status: "pending" | "approved" | "rejected";
    products: OrderProduct[];
    totalAmount: number;
    termsAndConditions?: string[];
}

const POPrint: React.FC = () => {
    const [activeKey, setActiveKey] = useState<string | null>(null);
    const [selectedSupplier, setSelectedSupplier] = useState<string>("all");    const [showPrintModal, setShowPrintModal] = useState<boolean>(false);
    const [selectedOrder, setSelectedOrder] = useState<PurchaseOrder | null>(null);
    // Mock data - Replace with API call
    const mockOrders: PurchaseOrder[] = [
        {
            id: 1,
            orderNo: "699",
            supplierName: "",
            date: "23-03-2023",
            status: "approved",
            products: [
                { id: 1, code: "699-3768", manufacturer: "COMPANY", productName: "11X14", units: 50, unit: "No(s)" },
                { id: 2, code: "699-3769", manufacturer: "TOP PHIL", productName: "14X17", units: 30, unit: "No(s)" },
            ],
            totalAmount: 13500,
            termsAndConditions: ["Invoice in triplicate", "Bills and Invoices are to be sent to the Hospital Administrator, NIGHTINGALE."]
        },
        {
            id: 2,
            orderNo: "701",
            supplierName: "",
            date: "23-03-2023",
            status: "approved",
            products: [
                { id: 3, code: "701-3770", manufacturer: "OAC", productName: "Barium Sulfate", units: 100, unit: "Gm" },
            ],
            totalAmount: 8000,
            termsAndConditions: ["Invoice in triplicate", "Bills and Invoices are to be sent to the Hospital Administrator, NIGHTINGALE."]
        },
        {
            id: 3,
            orderNo: "744",
            supplierName: "NATIONAL HOSPITAL SUPPLIERS",
            supplierDetails: {
                name: "M/s.NATIONAL HOSPITAL SUPPLIERS",
                address: ["1/9 A 1, Vasantham Nagar", "Dindigul"],
                gstNo: "33NZAPS9889D1ZJ"
            },
            date: "21-01-2026",
            status: "approved",
            products: [
                { id: 4, code: "744-3768", manufacturer: "COMPANY", productName: "CUFF AND COLLAR", units: 4, unit: "No(s)" },
                { id: 5, code: "744-3769", manufacturer: "TOP PHIL", productName: "CREPE BANDAGE 6 INCH", units: 20, unit: "No(s)" },
                { id: 6, code: "744-3770", manufacturer: "OAC", productName: "Lumbosacral belt medium", units: 1, unit: "No(s)" },
                { id: 7, code: "744-3771", manufacturer: "OAC", productName: "LUMBOSACRAL BELT XL", units: 3, unit: "No(s)" },
                { id: 8, code: "744-3772", manufacturer: "TYNOR", productName: "ARM SLING XL", units: 3, unit: "No(s)" },
                { id: 9, code: "744-3773", manufacturer: "DINDIGUL HOSPITAL SUPPLIER", productName: "TAYLORS BRACE SHORT", units: 2, unit: "No(s)" },
                { id: 10, code: "744-3774", manufacturer: "DINDIGUL HOSPITAL SUPPLIER", productName: "WALKING STICK 3 LEG", units: 2, unit: "Gm" },
                { id: 11, code: "744-3775", manufacturer: "COMPANY", productName: "WRIST SPLINT MEDIUM", units: 3, unit: "Gm" },
                { id: 12, code: "744-3776", manufacturer: "COMPANY", productName: "WRIST SPLINT LARGE", units: 5, unit: "Gm" },
                { id: 13, code: "744-3777", manufacturer: "MEENATCHI SURGICALS", productName: "LONG LEG U SPLINT", units: 2, unit: "No(s)" },
                { id: 14, code: "744-3778", manufacturer: "TYNOR", productName: "SHORT LEG U SPLINT", units: 2, unit: "No(s)" },
                { id: 15, code: "744-3779", manufacturer: "COMPANY", productName: "SHORT ARM U SPLINT", units: 2, unit: "No(s)" },
                { id: 16, code: "744-3780", manufacturer: "COMPANY", productName: "COMMODE", units: 3, unit: "Gm" },
            ],
            totalAmount: 54800,
            termsAndConditions: ["Invoice in triplicate: aaa", "Bills and Invoices are to be sent to the Hospital Administrator, NIGHTINGALE."]
        },
        {
            id: 4,
            orderNo: "745",
            supplierName: "",
            date: "23-02-2024",
            status: "approved",
            products: [
                { id: 17, code: "745-3781", manufacturer: "SUPPLIER", productName: "11X14", units: 75, unit: "No(s)" },
            ],
            totalAmount: 11250,
            termsAndConditions: ["Invoice in triplicate", "Bills and Invoices are to be sent to the Hospital Administrator, NIGHTINGALE."]
        },
        {
            id: 5,
            orderNo: "810",
            supplierName: "SUPPLIER",
            supplierDetails: {
                name: "M/s.SUPPLIER",
                address: ["123 Medical Street", "Dindigul"],
                gstNo: "33ABCD1234E1ZF"
            },
            date: "21-01-2026",
            status: "approved",
            products: [
                { id: 18, code: "810-3782", manufacturer: "COMPANY", productName: "14X17", units: 60, unit: "No(s)" },
                { id: 19, code: "810-3783", manufacturer: "MEDICAL CORP", productName: "Barium Sulfate", units: 50, unit: "Gm" },
            ],
            totalAmount: 16000,
            termsAndConditions: ["Invoice in triplicate", "Bills and Invoices are to be sent to the Hospital Administrator, NIGHTINGALE."]
        },
    ];

    const [orders] = useState<PurchaseOrder[]>(mockOrders);

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

    const handlePrint = (orderId: number) => {
        const order = orders.find((o) => o.id === orderId);
        if (order) {
            setSelectedOrder(order);
            // Small delay to ensure state updates before printing
            setTimeout(() => {
                window.print();
            }, 100);
        }
    };

    return (
        <Container fluid className="p-4">
            <PageHeader
                icon={faPrint}
                title="P.O Print"
                subtitle="Print purchase orders"
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
                                            variant="primary"
                                            size="sm"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handlePrint(order.id);
                                            }}
                                        >
                                            Print
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
                                                <th style={{ width: "12%" }}>Code</th>
                                                <th style={{ width: "20%" }}>Manufacturer</th>
                                                <th style={{ width: "30%" }}>Product Name</th>
                                                <th style={{ width: "10%" }}>Quantity</th>
                                                <th style={{ width: "8%" }}>Unit</th>
                                                <th style={{ width: "15%" }}>Supplier</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {order.products.map((product, idx) => (
                                                <tr key={product.id}>
                                                    <td className="text-center">{idx + 1}</td>
                                                    <td>{product.code}</td>
                                                    <td>{product.manufacturer}</td>
                                                    <td>{product.productName}</td>
                                                    <td className="text-center">{product.units}</td>
                                                    <td className="text-center">{product.unit}</td>
                                                    <td>{order.supplierName || '-'}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </Table>

                                    <div className="mt-3 text-end">
                                        <Button
                                            variant="primary"
                                            size="sm"
                                            onClick={() => handlePrint(order.id)}
                                        >
                                            <FontAwesomeIcon icon={faPrint} className="me-2" />
                                            Print Order
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
                                : "No purchase orders available to print"}
                        </p>
                    </Card.Body>
                )}
            </Card>

            {/* Hidden Print Container - Only visible when printing */}
            <div className="print-only-container">
                {selectedOrder && (
                    <div className="printable-content" style={{ padding: "20px" }}>
                        {/* Hospital Header */}
                        <div style={{ textAlign: "center", marginBottom: "30px", borderBottom: "2px solid #000", paddingBottom: "15px" }}>
                            <h2 style={{ fontSize: "var(--font-size-2xl)", fontWeight: "var(--font-weight-bold)", marginBottom: "5px" }}>NIGHTINGALE</h2>
                            <p style={{ fontSize: "var(--font-size-base)", margin: 0 }}>Dindigul Main Road, Batlagundu.</p>
                        </div>

                        {/* PO Details */}
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "20px", fontSize: "var(--font-size-base)" }}>
                            <div><strong>Purchase Order No :</strong> {selectedOrder.orderNo}</div>
                            <div><strong>Date:</strong> {selectedOrder.date}</div>
                        </div>
                        

                        {/* Supplier Details Box */}
                        {selectedOrder.supplierDetails && (
                            <div style={{ border: "1px solid #000", padding: "15px", marginBottom: "20px", fontSize: "var(--font-size-base)" }}>
                                <div style={{ marginBottom: "10px" }}><strong>To</strong></div>
                                <div style={{ paddingLeft: "20px" }}>
                                    <div style={{ marginBottom: "5px" }}>{selectedOrder.supplierDetails.name}</div>
                                    {selectedOrder.supplierDetails.address.map((line, idx) => (
                                        <div key={idx} style={{ marginBottom: "5px" }}>{line}</div>
                                    ))}
                                    {selectedOrder.supplierDetails.gstNo && (
                                        <div style={{ marginTop: "10px" }}>{selectedOrder.supplierDetails.gstNo}</div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* Greeting */}
                        <div style={{ marginBottom: "20px", fontSize: "var(--font-size-base)" }}>
                            <p style={{ margin: 0, marginBottom: "10px" }}>Dear Sir,</p>
                            <p style={{ margin: 0, paddingLeft: "100px" }}>Please supply the under mentioned items on our A/C.</p>
                        </div>

                        {/* Products Table */}
                        <Table bordered style={{ marginBottom: "30px", fontSize: "var(--font-size-sm)" }}>
                            <thead style={{ backgroundColor: "#f0f0f0" }}>
                                <tr>
                                    <th style={{ width: "8%", textAlign: "center", padding: "8px" }}>S. No</th>
                                    <th style={{ width: "15%", textAlign: "center", padding: "8px" }}>Code</th>
                                    <th style={{ width: "25%", textAlign: "center", padding: "8px" }}>Manufactured By</th>
                                    <th style={{ width: "37%", textAlign: "center", padding: "8px" }}>Material</th>
                                    <th style={{ width: "15%", textAlign: "center", padding: "8px" }}>Qty.</th>
                                </tr>
                            </thead>
                            <tbody>
                                {selectedOrder.products.map((product, idx) => (
                                    <tr key={product.id}>
                                        <td style={{ textAlign: "center", padding: "6px" }}>{idx + 1}</td>
                                        <td style={{ padding: "6px" }}>{product.code}</td>
                                        <td style={{ padding: "6px" }}>{product.manufacturer}</td>
                                        <td style={{ padding: "6px" }}>{product.productName}</td>
                                        <td style={{ textAlign: "center", padding: "6px" }}>{product.units} {product.unit}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>

                        {/* Terms & Conditions */}
                        {selectedOrder.termsAndConditions && selectedOrder.termsAndConditions.length > 0 && (
                            <div style={{ marginBottom: "30px", fontSize: "var(--font-size-base)" }}>
                                <h5 style={{ marginBottom: "10px", textDecoration: "underline", fontSize: "var(--font-size-lg)" }}>Terms & Conditions:</h5>
                                <ol style={{ paddingLeft: "20px", margin: 0 }}>
                                    {selectedOrder.termsAndConditions.map((term, idx) => (
                                        <li key={idx} style={{ margin: "8px 0" }}>{term}</li>
                                    ))}
                                </ol>
                            </div>
                        )}

                        {/* Footer */}
                        <div style={{ textAlign: "center", marginTop: "60px", fontSize: "var(--font-size-base)" }}>
                            <p style={{ margin: 0 }}><strong>Thanking You!</strong></p>
                        </div>

                        {/* Signature Section */}
                        <div style={{ textAlign: "center", marginTop: "80px", fontSize: "var(--font-size-base)" }}>
                            <p style={{ margin: 0 }}>Authorized Signatory,</p>
                            <div style={{ marginTop: "60px", borderTop: "1px solid #000", display: "inline-block", paddingTop: "5px", minWidth: "200px" }}>
                                <strong>Hospital Administrator</strong>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Print-specific CSS */}
            <style>{`
                /* Hide print container on screen, show only when printing */
                @media screen {
                    .print-only-container {
                        display: none !important;
                    }
                }

                @media print {
                    /* Hide everything except print container */
                    body * {
                        visibility: hidden;
                    }
                    .print-only-container,
                    .print-only-container * {
                        visibility: visible;
                    }
                    .print-only-container {
                        position: absolute;
                        left: 0;
                        top: 0;
                        width: 100%;
                        display: block !important;
                    }
                    .printable-content {
                        padding: 20mm !important;
                    }
                    table {
                        page-break-inside: avoid;
                    }
                    tr {
                        page-break-inside: avoid;
                    }
                }
                @page {
                    size: A4;
                    margin: 15mm;
                }
            `}</style>
        </Container>
    );
};

export default POPrint;
