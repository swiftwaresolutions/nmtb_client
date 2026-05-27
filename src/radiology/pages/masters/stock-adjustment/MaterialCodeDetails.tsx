import React, { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Container, Card, Button, Table, Alert, Form } from "react-bootstrap";
import { ChevronLeft, PlusCircle } from "react-bootstrap-icons";
import PageHeader from "../../../../components/PageHeader";
import { faBalanceScale } from "@fortawesome/free-solid-svg-icons";

interface Material {
    id: number;
    materialName: string;
    groupName: string;
    companyName: string;
}

interface MaterialCode {
    id: number;
    batchNumber: string;
    stock: number;
    organization: string;
    mfgDate: string;
    expDate: string;
    value: number;
}

interface MaterialCodeHistory {
    id: number;
    code: string;
    mfgDate: string; // DD/MM/YYYY
    expiryDate: string; // DD/MM/YYYY
    entryDate: string; // DD/MM/YYYY
    avgCostPrice: number;
    userName: string;
}

const MaterialCodeDetails = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const material = location.state?.material as Material | undefined;

    // Sample stock data based on material
    const getStockData = (materialName: string): MaterialCode[] => {
        if (materialName === "11X14") {
            return [
                { id: 1, batchNumber: "BATCH-11X14-2024-001", stock: 100, organization: "NIGHTINGALE", mfgDate: "2024-01-05", expDate: "2026-01-05", value: 0 },
                { id: 2, batchNumber: "BATCH-11X14-2024-002", stock: 75, organization: "NIGHTINGALE", mfgDate: "2024-02-15", expDate: "2026-02-15", value: 0 },
                { id: 3, batchNumber: "BATCH-11X14-2024-003", stock: 90, organization: "NIGHTINGALE", mfgDate: "2024-03-20", expDate: "2026-03-20", value: 0 },
            ];
        } else if (materialName === "arm sling") {
            return [
                { id: 1, batchNumber: "BATCH-AS-2024-001", stock: 50, organization: "NIGHTINGALE", mfgDate: "2024-01-15", expDate: "2026-01-15", value: 0 },
                { id: 2, batchNumber: "BATCH-AS-2024-002", stock: 30, organization: "NIGHTINGALE", mfgDate: "2024-02-20", expDate: "2026-02-20", value: 0 },
                { id: 3, batchNumber: "BATCH-AS-2024-003", stock: 45, organization: "NIGHTINGALE", mfgDate: "2024-03-10", expDate: "2026-03-10", value: 0 },
            ];
        } else if (materialName === "CT Contrast Media") {
            return [
                { id: 1, batchNumber: "BATCH-CT-2024-001", stock: 20, organization: "NIGHTINGALE", mfgDate: "2024-06-01", expDate: "2025-12-01", value: 0 },
                { id: 2, batchNumber: "BATCH-CT-2024-002", stock: 15, organization: "NIGHTINGALE", mfgDate: "2024-07-10", expDate: "2026-01-10", value: 0 },
                { id: 3, batchNumber: "BATCH-CT-2024-003", stock: 25, organization: "NIGHTINGALE", mfgDate: "2024-08-15", expDate: "2026-02-15", value: 0 },
            ];
        } else if (materialName === "Ultrasound Gel") {
            return [
                { id: 1, batchNumber: "BATCH-UG-2024-001", stock: 60, organization: "NIGHTINGALE", mfgDate: "2024-04-10", expDate: "2026-04-10", value: 0 },
                { id: 2, batchNumber: "BATCH-UG-2024-002", stock: 40, organization: "NIGHTINGALE", mfgDate: "2024-05-20", expDate: "2026-05-20", value: 0 },
                { id: 3, batchNumber: "BATCH-UG-2024-003", stock: 55, organization: "NIGHTINGALE", mfgDate: "2024-06-25", expDate: "2026-06-25", value: 0 },
            ];
        } else if (materialName === "Lead Apron") {
            return [
                { id: 1, batchNumber: "BATCH-LA-2024-001", stock: 25, organization: "NIGHTINGALE", mfgDate: "2024-01-20", expDate: "2029-01-20", value: 0 },
                { id: 2, batchNumber: "BATCH-LA-2024-002", stock: 18, organization: "NIGHTINGALE", mfgDate: "2024-03-15", expDate: "2029-03-15", value: 0 },
                { id: 3, batchNumber: "BATCH-LA-2024-003", stock: 30, organization: "NIGHTINGALE", mfgDate: "2024-05-10", expDate: "2029-05-10", value: 0 },
            ];
        }
        return [];
    };

    // Sample history data based on material
    const getHistoryData = (materialName: string): MaterialCodeHistory[] => {
        if (materialName === "11X14") {
            return [
                {
                    id: 1,
                    code: "11x14",
                    mfgDate: "27/04/2015",
                    expiryDate: "31/12/2030",
                    entryDate: "27/04/2015",
                    avgCostPrice: 50.0,
                    userName: "Admin",
                },
            ];
        } else if (materialName === "arm sling") {
            return [
                {
                    id: 1,
                    code: "AS001",
                    mfgDate: "15/01/2024",
                    expiryDate: "15/01/2029",
                    entryDate: "20/01/2024",
                    avgCostPrice: 50.0,
                    userName: "Admin",
                },
            ];
        } else if (materialName === "CT Contrast Media") {
            return [
                {
                    id: 1,
                    code: "CT001",
                    mfgDate: "10/03/2024",
                    expiryDate: "10/03/2025",
                    entryDate: "15/03/2024",
                    avgCostPrice: 300.0,
                    userName: "Admin",
                },
            ];
        } else if (materialName === "Ultrasound Gel") {
            return [
                {
                    id: 1,
                    code: "UG001",
                    mfgDate: "05/02/2024",
                    expiryDate: "05/02/2026",
                    entryDate: "10/02/2024",
                    avgCostPrice: 50.0,
                    userName: "Admin",
                },
            ];
        } else if (materialName === "Lead Apron") {
            return [
                {
                    id: 1,
                    code: "LA001",
                    mfgDate: "01/01/2024",
                    expiryDate: "01/01/2034",
                    entryDate: "05/01/2024",
                    avgCostPrice: 3500.0,
                    userName: "Admin",
                },
            ];
        }
        return [];
    };

    const [stockData] = useState<MaterialCode[]>(
        material ? getStockData(material.materialName) : []
    );
    const [historyData] = useState<MaterialCodeHistory[]>(
        material ? getHistoryData(material.materialName) : []
    );

    // State for input values and action types
    const [adjustmentValues, setAdjustmentValues] = useState<Record<number, string>>({});
    const [adjustmentActions, setAdjustmentActions] = useState<Record<number, string>>({});

    // Handle value input change
    const handleValueChange = (id: number, value: string) => {
        setAdjustmentValues(prev => ({
            ...prev,
            [id]: value
        }));
    };

    // Handle action dropdown change
    const handleActionChange = (id: number, action: string) => {
        setAdjustmentActions(prev => ({
            ...prev,
            [id]: action
        }));
    };

    // Handle back navigation
    const handleBack = () => {
        navigate("/hims/radiology/masters/stock-adjustment");
    };

    // Handle common submit for all adjustments
    const handleSubmitAll = () => {
        // Collect all adjustments
        const adjustments = stockData
            .filter(item => {
                const value = parseFloat(adjustmentValues[item.id] || "0");
                return value > 0;
            })
            .map(item => ({
                batchNumber: item.batchNumber,
                value: parseFloat(adjustmentValues[item.id]),
                action: adjustmentActions[item.id] || "addition",
                currentStock: item.stock
            }));

        if (adjustments.length === 0) {
            alert("Please enter adjustment values for at least one batch.");
            return;
        }

        // Validate all adjustments
        for (const adj of adjustments) {
            if (adj.action === "subtraction" && adj.value > adj.currentStock) {
                alert(`Cannot subtract ${adj.value} from Batch ${adj.batchNumber}. Current stock: ${adj.currentStock}`);
                return;
            }
        }

        // Build confirmation message
        const message = `Submit the following stock adjustments?\n\n${adjustments
            .map(adj => `Batch ${adj.batchNumber}: ${adj.action === "addition" ? "+" : "-"}${adj.value}`)
            .join("\n")}`;

        if (window.confirm(message)) {
            // Here you would typically make an API call
            alert(`All stock adjustments submitted successfully!\nTotal batches adjusted: ${adjustments.length}`);
            // Reset all values
            setAdjustmentValues({});
            setAdjustmentActions({});
        }
    };

    // Handle adding new code (placeholder)
    const handleAddNewCode = () => {
        alert("Add new code functionality will be implemented here");
    };

    // Redirect if no material data
    if (!material) {
        return (
            <Container fluid className="p-4">
                <Alert variant="warning">
                    <Alert.Heading>No Material Selected</Alert.Heading>
                    <p>Please select a material from the Stock Adjustment page.</p>
                    <Button variant="primary" onClick={handleBack}>
                        <ChevronLeft /> Back to Materials
                    </Button>
                </Alert>
            </Container>
        );
    }

    return (
        <Container fluid className="p-4">
            {/* Page Header */}
            <PageHeader
                icon={faBalanceScale}
                title={`Code Details for the Material (${material.materialName})`}
                subtitle={`${material.groupName} - ${material.companyName}`}
                badges={[
                    { label: "Stock Items", value: stockData.length },
                    { label: "History Records", value: historyData.length },
                ]}
            />

            {/* Action Buttons */}
            <div className="d-flex justify-content-between align-items-center mb-3 mt-4">
                <Button variant="outline-secondary" onClick={handleBack}>
                    <ChevronLeft /> Back to Materials
                </Button>
                <Button variant="success" onClick={handleAddNewCode}>
                    <PlusCircle className="me-2" />
                    Add new Code
                </Button>
            </div>

            {/* Batch Details Table */}
            <Card className="shadow-sm mb-4">
                <Card.Header className="bg-light">
                    <h5 className="mb-0">
                        <i className="fas fa-boxes me-2"></i>
                        Batch Details - Stock Adjustment
                    </h5>
                </Card.Header>
                <Card.Body>
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th style={{ width: "60px" }}>S.No</th>
                                <th>Batch Number</th>
                                <th style={{ width: "110px" }}>Mfg Date</th>
                                <th style={{ width: "110px" }}>Exp Date</th>
                                <th style={{ width: "100px" }}>Stock</th>
                                <th style={{ width: "160px" }}>Organization</th>
                                <th style={{ width: "150px" }}>Adjustment Value</th>
                                <th style={{ width: "160px" }}>Action</th>
                            </tr>
                        </thead>
                        <tbody>
                            {stockData.length === 0 ? (
                                <tr>
                                    <td colSpan={8} style={{ textAlign: "center" }}>
                                        No batch data available.
                                    </td>
                                </tr>
                            ) : (
                                <>
                                    {stockData.map((item, idx) => (
                                        <tr key={item.id}>
                                            <td>{idx + 1}</td>
                                            <td><strong>{item.batchNumber}</strong></td>
                                            <td>{item.mfgDate}</td>
                                            <td>{item.expDate}</td>
                                            <td className="text-end"><strong>{item.stock}</strong></td>
                                            <td>{item.organization}</td>
                                            <td>
                                                <Form.Control
                                                    type="number"
                                                    size="sm"
                                                    placeholder="Enter value"
                                                    value={adjustmentValues[item.id] || ""}
                                                    onChange={(e) => handleValueChange(item.id, e.target.value)}
                                                    min="0"
                                                    step="1"
                                                />
                                            </td>
                                            <td>
                                                <Form.Select
                                                    size="sm"
                                                    value={adjustmentActions[item.id] || "addition"}
                                                    onChange={(e) => handleActionChange(item.id, e.target.value)}
                                                >
                                                    <option value="addition">Addition (+)</option>
                                                    <option value="subtraction">Subtraction (-)</option>
                                                </Form.Select>
                                            </td>
                                        </tr>
                                    ))}

                                </>
                            )}
                        </tbody>
                    </Table>
                </Card.Body>
            </Card>

            {/* Common Submit Button */}
            <div className="d-flex justify-content-center my-4">
                <Button 
                    variant="primary" 
                    size="lg"
                    onClick={handleSubmitAll}
                    style={{ minWidth: "200px" }}
                >
                    <PlusCircle className="me-2" />
                    Submit All Adjustments
                </Button>
            </div>

            {/* Material Code History Table */}
            <Card className="shadow-sm">
                <Card.Header className="bg-light">
                    <h5 className="mb-0">
                        <i className="fas fa-history me-2"></i>
                        Material Code History
                    </h5>
                </Card.Header>
                <Card.Body>
                    <Table striped bordered hover responsive>
                        <thead>
                            <tr>
                                <th style={{ width: "80px" }}>S.No</th>
                                <th>Material Code</th>
                                <th style={{ width: "120px" }}>Mfg. Date</th>
                                <th style={{ width: "120px" }}>Expiry Date</th>
                                <th style={{ width: "120px" }}>Entry Date</th>
                                <th style={{ width: "150px" }}>Avg. Cost Price</th>
                                <th style={{ width: "150px" }}>User</th>
                            </tr>
                        </thead>
                        <tbody>
                            {historyData.length === 0 ? (
                                <tr>
                                    <td colSpan={7} style={{ textAlign: "center" }}>
                                        No history data available.
                                    </td>
                                </tr>
                            ) : (
                                historyData.map((item, idx) => (
                                    <tr key={item.id}>
                                        <td>{idx + 1}</td>
                                        <td>{item.code}</td>
                                        <td>{item.mfgDate}</td>
                                        <td>{item.expiryDate}</td>
                                        <td>{item.entryDate}</td>
                                        <td className="text-end">
                                            ₹{item.avgCostPrice.toFixed(2)}
                                        </td>
                                        <td>{item.userName}</td>
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

export default MaterialCodeDetails;
