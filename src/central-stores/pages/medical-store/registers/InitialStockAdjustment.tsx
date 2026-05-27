import React, { useState, useRef, useEffect } from "react";
import { Container, Card, Form, Button, Row, Col } from "react-bootstrap";
import ReportHeader from "../../../../medical-records/components/ReportHeader";
import { 
    printReport,
    formatReportDate,
    getDateRangeText
} from "../../../../medical-records/utils/reportUtils";
import "../../../../medical-records/styles/reportStyles.css";

export default function InitialStockAdjustment() {
    // Refs
    const searchInputRef = useRef<HTMLInputElement>(null);

    // Click outside search collapse
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (searchInputRef.current && !searchInputRef.current.contains(event.target as Node)) {
                const searchInput = document.getElementById('headerSearchInput');
                if (searchInput && searchInput.classList.contains('active')) {
                    searchInput.classList.remove('active');
                }
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    // Available products list - Replace with actual API data
    const [allProducts] = useState<any[]>([
        { id: 1, name: "DEXT-5% 500ML" },
        { id: 2, name: "Paracetamol 500mg" },
        { id: 3, name: "Amoxicillin 250mg" },
        { id: 4, name: "Aspirin 75mg" }
    ]);

    // Filter form state
    const [fromDate, setFromDate] = useState<string>("");
    const [toDate, setToDate] = useState<string>("");
    const [selectedProductId, setSelectedProductId] = useState<string>("");

    // On mount, set current date
    useEffect(() => {
        const today = new Date().toISOString().split('T')[0];
        setFromDate(today);
        setToDate(today);
    }, []);

    // Handle form submission
    const handleViewSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!fromDate || !toDate || !selectedProductId) {
            alert("Please fill all fields");
            return;
        }

        // TODO: Call API to fetch initial stock data
        console.log("View report for:", { fromDate, toDate, selectedProductId });
    };

    // Handle sort
    const handleSort = () => {
        // TODO: Implement sort functionality
        console.log("Sort clicked");
    };

    return (
        <React.Fragment>
            <Container fluid className="px-4 py-3">
                {/* Page Title */}
                <div className="mb-4">
                    <h1 style={{ fontWeight: "bold", fontSize: "1.2rem" }}>
                        INITIAL STOCK REPORT
                    </h1>
                </div>

                {/* Filter Form Section */}
                <Row className="justify-content-center">
                    <Col lg={10} xl={9}>
                        <Card className="shadow-sm border" style={{ borderColor: "#ccc" }}>
                            <Card.Body className="p-4">
                                <Form onSubmit={handleViewSubmit}>
                                    {/* Product Name */}
                                    <Form.Group className="mb-3">
                                        <Row>
                                            <Col md={4} className="d-flex align-items-center">
                                                <Form.Label className="mb-0">Product Name :</Form.Label>
                                            </Col>
                                            <Col md={8}>
                                                <Form.Control
                                                    as="select"
                                                    value={selectedProductId}
                                                    onChange={e => setSelectedProductId(e.target.value)}
                                                    required
                                                >
                                                    <option value="">-- Select Product --</option>
                                                    {allProducts.map(product => (
                                                        <option key={product.id} value={product.id}>
                                                            {product.name}
                                                        </option>
                                                    ))}
                                                </Form.Control>
                                            </Col>
                                        </Row>
                                    </Form.Group>

                                    {/* From Date */}
                                    <Form.Group className="mb-3">
                                        <Row>
                                            <Col md={4} className="d-flex align-items-center">
                                                <Form.Label className="mb-0">Select From Date</Form.Label>
                                            </Col>
                                            <Col md={8}>
                                                <Form.Control
                                                    type="date"
                                                    value={fromDate}
                                                    onChange={e => setFromDate(e.target.value)}
                                                    required
                                                />
                                            </Col>
                                        </Row>
                                    </Form.Group>

                                    {/* To Date */}
                                    <Form.Group className="mb-4">
                                        <Row>
                                            <Col md={4} className="d-flex align-items-center">
                                                <Form.Label className="mb-0">Select To Date</Form.Label>
                                            </Col>
                                            <Col md={8}>
                                                <Form.Control
                                                    type="date"
                                                    value={toDate}
                                                    onChange={e => setToDate(e.target.value)}
                                                    required
                                                />
                                            </Col>
                                        </Row>
                                    </Form.Group>

                                    {/* Buttons */}
                                    <Row>
                                        <Col md={4}></Col>
                                        <Col md={8} className="d-flex gap-2 justify-content-end">
                                            <Button 
                                                type="button" 
                                                variant="info" 
                                                onClick={handleSort}
                                                style={{ backgroundColor: "#5B9FC6", borderColor: "#5B9FC6", color: "white", fontWeight: "600" }}
                                            >
                                                Sort
                                            </Button>
                                            <Button 
                                                type="submit" 
                                                variant="info"
                                                style={{ backgroundColor: "#5B9FC6", borderColor: "#5B9FC6", color: "white", fontWeight: "600" }}
                                            >
                                                View
                                            </Button>
                                        </Col>
                                    </Row>
                                </Form>
                            </Card.Body>
                        </Card>
                    </Col>
                </Row>

                {/* TODO: Add results section here */}
                {/* This will display the initial stock data table after clicking View */}
            </Container>
        </React.Fragment>
    );
}
