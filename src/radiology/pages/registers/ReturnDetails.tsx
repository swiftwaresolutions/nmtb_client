import React from "react";
import { Container, Card, Row, Col, Table, Button, Badge } from "react-bootstrap";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { ArrowLeft, Printer } from "react-bootstrap-icons";
import PageHeader from "../../../components/PageHeader";
import { faUndo } from "@fortawesome/free-solid-svg-icons";

export default function ReturnDetails() {
    const { returnNo } = useParams<{ returnNo: string }>();
    const location = useLocation();
    const navigate = useNavigate();
    const returnData = location.state?.returnData;

    if (!returnData) {
        return (
            <Container className="py-1">
                <Card>
                    <Card.Body className="text-center py-5">
                        <h4 className="text-muted">No Return data found</h4>
                        <Button variant="primary" onClick={() => navigate(-1)} className="mt-3">
                            <ArrowLeft className="me-2" />
                            Go Back
                        </Button>
                    </Card.Body>
                </Card>
            </Container>
        );
    }

    // Sample line items data - This would come from API in real implementation
    const lineItems = [
        {
            slNo: 1,
            productName: "X-Ray Film 14x17",
            hsnCode: "37024100",
            batchNo: "XR2024-001",
            expiryDate: "12/2026",
            qty: 10,
            unit: "Pack",
            rate: 850.00,
            amount: 8500.00,
            reason: "Damaged packaging"
        },
        {
            slNo: 2,
            productName: "CT Contrast Media 100ml",
            hsnCode: "30063000",
            batchNo: "CT2024-045",
            expiryDate: "06/2026",
            qty: 5,
            unit: "Bottle",
            rate: 1200.00,
            amount: 6000.00,
            reason: "Near expiry"
        },
        {
            slNo: 3,
            productName: "Ultrasound Gel 5L",
            hsnCode: "33079090",
            batchNo: "USG2024-078",
            expiryDate: "03/2027",
            qty: 2,
            unit: "Can",
            rate: 450.00,
            amount: 900.00,
            reason: "Quality issue"
        }
    ];

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "Completed":
                return <Badge bg="success" style={{ fontSize: "0.9rem", padding: "0.5rem 1rem" }}>{status}</Badge>;
            case "Pending":
                return <Badge bg="warning" text="dark" style={{ fontSize: "0.9rem", padding: "0.5rem 1rem" }}>{status}</Badge>;
            case "In Progress":
                return <Badge bg="info" style={{ fontSize: "0.9rem", padding: "0.5rem 1rem" }}>{status}</Badge>;
            default:
                return <Badge bg="secondary" style={{ fontSize: "0.9rem", padding: "0.5rem 1rem" }}>{status}</Badge>;
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const totalQty = lineItems.reduce((sum, item) => sum + item.qty, 0);
    const totalAmount = lineItems.reduce((sum, item) => sum + item.amount, 0);

    return (
        <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", minHeight: 0, overflow: "hidden" }}>
            <PageHeader
                icon={faUndo}
                title={`Goods Return - ${returnNo}`}
                subtitle="View complete return details"
            />
            
            <div className="content-body" style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "0" }}>
                <Container fluid>
                    {/* Action Buttons */}
                    <div className="d-flex justify-content-between align-items-center p-3 bg-light rounded shadow-sm">
                        <Button variant="outline-primary" onClick={() => navigate(-1)} className="d-flex align-items-center">
                            <ArrowLeft className="me-2" size={18} />
                            <span>Back to Register</span>
                        </Button>
                        <div>
                            <Button variant="primary" onClick={handlePrint} className="d-flex align-items-center">
                                <Printer className="me-2" size={18} />
                                <span>Print</span>
                            </Button>
                        </div>
                    </div>

                    {/* Return Information */}
                    <Card className="mb-3 shadow-sm">
                        <Card.Header className="bg-danger text-white py-2">
                            <strong>Return Information</strong>
                        </Card.Header>
                        <Card.Body className="py-3">
                            <Row className="g-3">
                                <Col md={3} sm={6}>
                                    <div className="mb-2">
                                        <small className="text-muted">Return No</small>
                                        <div><strong>{returnData.returnNo}</strong></div>
                                    </div>
                                </Col>
                                <Col md={3} sm={6}>
                                    <div className="mb-2">
                                        <small className="text-muted">Return Date</small>
                                        <div><strong>{returnData.returnDate}</strong></div>
                                    </div>
                                </Col>
                                <Col md={3} sm={6}>
                                    <div className="mb-2">
                                        <small className="text-muted">Supplier Name</small>
                                        <div><strong>{returnData.supplierName}</strong></div>
                                    </div>
                                </Col>
                                <Col md={3} sm={6}>
                                    <div className="mb-2">
                                        <small className="text-muted">Status</small>
                                        <div>{getStatusBadge(returnData.status)}</div>
                                    </div>
                                </Col>
                                <Col md={3} sm={6}>
                                    <div className="mb-2">
                                        <small className="text-muted">Return Amount</small>
                                        <div><strong className="text-danger" style={{ fontSize: "1.1rem" }}>₹{returnData.returnAmount.toFixed(2)}</strong></div>
                                    </div>
                                </Col>
                                <Col md={3} sm={6}>
                                    <div className="mb-2">
                                        <small className="text-muted">Created By</small>
                                        <div><strong>{returnData.user}</strong></div>
                                    </div>
                                </Col>
                            </Row>
                        </Card.Body>
                    </Card>

                    {/* Line Items Section */}
                    <Card className="mb-4 shadow">
                        <Card.Header className="bg-secondary text-white py-2">
                            <strong>Returned Items</strong>
                        </Card.Header>
                        <Card.Body className="p-0">
                            <div style={{ overflowX: "auto" }}>
                                <Table bordered hover size="sm" className="mb-0">
                                    <thead style={{ background: "#e9ecef", position: "sticky", top: 0, zIndex: 1 }}>
                                        <tr>
                                            <th style={{ minWidth: "50px" }}>S.No</th>
                                            <th style={{ minWidth: "200px" }}>Product Name</th>
                                            <th style={{ minWidth: "100px" }}>HSN Code</th>
                                            <th style={{ minWidth: "100px" }}>Batch No</th>
                                            <th style={{ minWidth: "100px" }}>Expiry Date</th>
                                            <th style={{ minWidth: "80px" }}>Qty</th>
                                            <th style={{ minWidth: "80px" }}>Unit</th>
                                            <th style={{ minWidth: "100px" }}>Rate</th>
                                            <th style={{ minWidth: "120px" }}>Amount</th>
                                            <th style={{ minWidth: "150px" }}>Reason</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {lineItems.map((item) => (
                                            <tr key={item.slNo}>
                                                <td className="text-center">{item.slNo}</td>
                                                <td>{item.productName}</td>
                                                <td>{item.hsnCode}</td>
                                                <td>{item.batchNo}</td>
                                                <td className="text-center">{item.expiryDate}</td>
                                                <td className="text-end">{item.qty}</td>
                                                <td className="text-center">{item.unit}</td>
                                                <td className="text-end">₹{item.rate.toFixed(2)}</td>
                                                <td className="text-end">₹{item.amount.toFixed(2)}</td>
                                                <td>{item.reason}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                    <tfoot>
                                        <tr className="fw-bold" style={{ background: "#f8f9fa" }}>
                                            <td colSpan={5} className="text-end">TOTAL</td>
                                            <td className="text-end text-danger">{totalQty}</td>
                                            <td></td>
                                            <td></td>
                                            <td className="text-end text-danger">₹{totalAmount.toFixed(2)}</td>
                                            <td></td>
                                        </tr>
                                    </tfoot>
                                </Table>
                            </div>
                        </Card.Body>
                    </Card>
                </Container>
            </div>

            {/* Summary - Bottom Bar */}
            <div style={{ padding: "1rem", background: "#e9ecef", borderTop: "1px solid #dee2e6" }}>
                <Container fluid>
                    <div className="d-flex flex-wrap gap-4 align-items-center justify-content-between" style={{ fontSize: "0.95rem" }}>
                        <div className="d-flex gap-4 flex-wrap">
                            <div>
                                <strong>Total Items:</strong> <span className="fw-bold">{lineItems.length}</span>
                            </div>
                            <div>
                                <strong>Total Qty:</strong> <span className="fw-bold">{totalQty}</span>
                            </div>
                            <div>
                                <strong>Total Return Amount:</strong> <span className="text-danger fw-bold" style={{ fontSize: "1.1rem" }}>₹{totalAmount.toFixed(2)}</span>
                            </div>
                        </div>
                        <div className="d-flex align-items-center gap-2">
                            <strong>Status:</strong> {getStatusBadge(returnData.status)}
                        </div>
                    </div>
                </Container>
            </div>
        </div>
    );
}
