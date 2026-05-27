import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Container, Card, Button, Form, Row, Col } from "react-bootstrap";
import { ArrowLeft, PencilSquare, Save, XCircle } from "react-bootstrap-icons";
import PageHeader from "../../../../components/PageHeader";
import { faEdit } from "@fortawesome/free-solid-svg-icons";
import { showSuccessToast, showErrorToast } from "../../../../utils/alertUtil";

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

const ProductPropertiesDetails = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const product = (location.state as any)?.product as Product;

    const [isEditing, setIsEditing] = useState(false);
    const [formData, setFormData] = useState<Product>({
        id: 0,
        code: "",
        name: "",
        rack: "",
        shelf: "",
        min: 0,
        max: 0,
        safe: 0,
        eoq: 0,
        usagePercent: 0,
    });

    useEffect(() => {
        if (product) {
            setFormData(product);
        } else {
            // If no product passed, redirect back
            navigate("/hims/radiology/masters/product-properties");
        }
    }, [product, navigate]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "rack" || name === "shelf" ? value : parseFloat(value) || 0,
        }));
    };

    const handleSave = () => {
        try {
            // Load existing products from localStorage
            const savedProducts = localStorage.getItem("radiologyProductProperties");
            let products: Product[] = savedProducts ? JSON.parse(savedProducts) : [];

            // Update the product in the array
            const updatedProducts = products.map((p) =>
                p.id === formData.id ? formData : p
            );

            // If product doesn't exist in array, add it
            if (!products.find((p) => p.id === formData.id)) {
                updatedProducts.push(formData);
            }

            // Save back to localStorage
            localStorage.setItem(
                "radiologyProductProperties",
                JSON.stringify(updatedProducts)
            );

            showSuccessToast("Product properties updated successfully!");
            setIsEditing(false);
        } catch (error) {
            showErrorToast("Failed to save product properties. Please try again.");
        }
    };

    const handleCancel = () => {
        // Reset form data to original product
        if (product) {
            setFormData(product);
        }
        setIsEditing(false);
    };

    const handleBack = () => {
        navigate("/hims/radiology/masters/product-properties");
    };

    if (!product) {
        return (
            <Container fluid className="p-4">
                <div className="text-center">
                    <h5>No product selected</h5>
                    <Button variant="primary" onClick={handleBack}>
                        Back to Product List
                    </Button>
                </div>
            </Container>
        );
    }

    return (
        <Container fluid className="p-4">
            <PageHeader
                icon={faEdit}
                title={`Edit Properties for ${product.name}`}
                subtitle="Update product inventory and storage properties"
                badges={[{ label: "Product Code", value: product.code }]}
            />

            <Card className="shadow-sm mt-4" style={{ maxWidth: "800px", margin: "2rem auto" }}>
                <Card.Header className="bg-light">
                    <div className="d-flex justify-content-between align-items-center">
                        <h5 className="mb-0">
                            <PencilSquare size={20} className="me-2" />
                            Product Properties
                        </h5>
                        <div className="d-flex gap-2">
                            <Button variant="outline-secondary" size="sm" onClick={handleBack}>
                                <ArrowLeft /> Back
                            </Button>
                            {!isEditing ? (
                                <Button
                                    variant="primary"
                                    size="sm"
                                    onClick={() => setIsEditing(true)}
                                >
                                    <PencilSquare /> Edit
                                </Button>
                            ) : (
                                <>
                                    <Button variant="success" size="sm" onClick={handleSave}>
                                        <Save /> Save
                                    </Button>
                                    <Button
                                        variant="outline-secondary"
                                        size="sm"
                                        onClick={handleCancel}
                                    >
                                        <XCircle /> Cancel
                                    </Button>
                                </>
                            )}
                        </div>
                    </div>
                </Card.Header>
                <Card.Body style={{ padding: "2rem" }}>
                    <Form>
                        {/* Product Name - Full Width */}
                        <Form.Group className="mb-4">
                            <Form.Label style={{ fontWeight: "var(--font-weight-semibold)", fontSize: "var(--font-size-base)" }}>
                                Product Name
                            </Form.Label>
                            <Form.Control
                                type="text"
                                name="name"
                                value={formData.name}
                                disabled
                                style={{
                                    backgroundColor: "#f8f9fa",
                                    fontSize: "var(--font-size-lg)",
                                    fontWeight: "var(--font-weight-medium)",
                                }}
                            />
                            <Form.Text className="text-muted">
                                Product name cannot be changed
                            </Form.Text>
                        </Form.Group>

                        {/* Rack and Shelf */}
                        <Row className="mb-4">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label style={{ fontWeight: "var(--font-weight-semibold)", fontSize: "var(--font-size-base)" }}>
                                        Rack
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="rack"
                                        value={formData.rack}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        placeholder="Enter rack location (e.g., A, B, C)"
                                        style={{ fontSize: "var(--font-size-base)" }}
                                    />
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label style={{ fontWeight: "var(--font-weight-semibold)", fontSize: "var(--font-size-base)" }}>
                                        Shelf
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="shelf"
                                        value={formData.shelf}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        placeholder="Enter shelf number (e.g., 1, 2, 3)"
                                        style={{ fontSize: "var(--font-size-base)" }}
                                    />
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* Min and Max */}
                        <Row className="mb-4">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label style={{ fontWeight: "var(--font-weight-semibold)", fontSize: "var(--font-size-base)" }}>
                                        Min Stock Level
                                    </Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="min"
                                        value={formData.min}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        placeholder="Minimum stock"
                                        min="0"
                                        step="1"
                                        style={{ fontSize: "var(--font-size-base)" }}
                                    />
                                    <Form.Text className="text-muted">
                                        Minimum quantity before reorder alert
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label style={{ fontWeight: "var(--font-weight-semibold)", fontSize: "var(--font-size-base)" }}>
                                        Max Stock Level
                                    </Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="max"
                                        value={formData.max}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        placeholder="Maximum stock"
                                        min="0"
                                        step="1"
                                        style={{ fontSize: "var(--font-size-base)" }}
                                    />
                                    <Form.Text className="text-muted">
                                        Maximum quantity to maintain
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* Safe and E.O.Q */}
                        <Row className="mb-4">
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label style={{ fontWeight: "var(--font-weight-semibold)", fontSize: "var(--font-size-base)" }}>
                                        Safe Stock Level
                                    </Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="safe"
                                        value={formData.safe}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        placeholder="Safe stock level"
                                        min="0"
                                        step="1"
                                        style={{ fontSize: "var(--font-size-base)" }}
                                    />
                                    <Form.Text className="text-muted">
                                        Safety stock to prevent stockouts
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                            <Col md={6}>
                                <Form.Group>
                                    <Form.Label style={{ fontWeight: "var(--font-weight-semibold)", fontSize: "var(--font-size-base)" }}>
                                        E.O.Q (Economic Order Quantity)
                                    </Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="eoq"
                                        value={formData.eoq}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        placeholder="Economic order quantity"
                                        min="0"
                                        step="1"
                                        style={{ fontSize: "var(--font-size-base)" }}
                                    />
                                    <Form.Text className="text-muted">
                                        Optimal order quantity
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* Usage Percent */}
                        <Row className="mb-4">
                            <Col md={12}>
                                <Form.Group>
                                    <Form.Label style={{ fontWeight: "var(--font-weight-semibold)", fontSize: "var(--font-size-base)" }}>
                                        Usage Percent (%)
                                    </Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="usagePercent"
                                        value={formData.usagePercent}
                                        onChange={handleInputChange}
                                        disabled={!isEditing}
                                        placeholder="Enter usage percentage"
                                        min="0"
                                        max="100"
                                        step="1"
                                        style={{ fontSize: "var(--font-size-base)" }}
                                    />
                                    <Form.Text className="text-muted">
                                        Average monthly usage rate (0-100%)
                                    </Form.Text>
                                </Form.Group>
                            </Col>
                        </Row>

                        {/* Summary Card */}
                        {!isEditing && (
                            <div
                                style={{
                                    marginTop: "2rem",
                                    padding: "1.5rem",
                                    backgroundColor: "#f8f9fa",
                                    borderRadius: "8px",
                                    border: "1px solid #dee2e6",
                                }}
                            >
                                <h6 style={{ marginBottom: "1rem", fontWeight: "var(--font-weight-semibold)" }}>
                                    Property Summary
                                </h6>
                                <Row>
                                    <Col md={6}>
                                        <div className="mb-2">
                                            <strong>Storage Location:</strong> Rack {formData.rack},{" "}
                                            Shelf {formData.shelf}
                                        </div>
                                        <div className="mb-2">
                                            <strong>Stock Range:</strong> {formData.min} -{" "}
                                            {formData.max} units
                                        </div>
                                    </Col>
                                    <Col md={6}>
                                        <div className="mb-2">
                                            <strong>Safety Stock:</strong> {formData.safe} units
                                        </div>
                                        <div className="mb-2">
                                            <strong>Order Quantity:</strong> {formData.eoq} units
                                        </div>
                                        <div className="mb-2">
                                            <strong>Usage Rate:</strong> {formData.usagePercent}%
                                        </div>
                                    </Col>
                                </Row>
                            </div>
                        )}
                    </Form>
                </Card.Body>
            </Card>
        </Container>
    );
};

export default ProductPropertiesDetails;
