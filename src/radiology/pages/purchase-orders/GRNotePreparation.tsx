import React, { useState, useMemo } from "react";
import { Container, Card, Row, Col, Button, Form, Table, InputGroup, Modal } from "react-bootstrap";
import PageHeader from "../../../components/PageHeader";
import { faFileAlt, faBoxes, faSearch } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface Medicine {
    id: number;
    code: string;
    name: string;
    availableStock: number;
    unit: string;
    suppliers: string[];
}

interface Bill {
    id: number;
    billNo: string;
    billDate: string;
    medicineId: number;
    supplier: string;
    quantity: number;
    rate: number;
}

interface ReturnFormData {
    billsFromDate: string;
    sortSuppliers: string;
    returnUnits: string;
    cost: string;
}

const GRNotePreparation: React.FC = () => {
    const [selectedLetter, setSelectedLetter] = useState<string>("All");
    const [selectedMedicine, setSelectedMedicine] = useState<Medicine | null>(null);
    const [searchTerm, setSearchTerm] = useState<string>("");
    const [showBillsModal, setShowBillsModal] = useState<boolean>(false);
    const [formData, setFormData] = useState<ReturnFormData>({
        billsFromDate: "",
        sortSuppliers: "",
        returnUnits: "",
        cost: "",
    });
    const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

    // Mock medicine data - replace with API call
    const mockMedicines: Medicine[] = [
        { id: 1, code: "123", name: "17X14", availableStock: 1500, unit: "Box", suppliers: ["Supplier A", "Supplier B"] },
        { id: 2, code: "124", name: "14X17", availableStock: 800, unit: "Box", suppliers: ["Supplier A", "Supplier C"] },
        { id: 3, code: "125", name: "Aspirin 500mg", availableStock: 2000, unit: "Tablet", suppliers: ["Supplier B", "Supplier D"] },
        { id: 4, code: "126", name: "Barium Sulfate", availableStock: 500, unit: "Packet", suppliers: ["Supplier C"] },
        { id: 5, code: "127", name: "CT Film 8x10", availableStock: 300, unit: "Box", suppliers: ["Supplier A", "Supplier E"] },
        { id: 6, code: "128", name: "Dextrose 5%", availableStock: 1200, unit: "Bottle", suppliers: ["Supplier B", "Supplier F"] },
        { id: 7, code: "129", name: "Enalapril 10mg", availableStock: 600, unit: "Tablet", suppliers: ["Supplier D"] },
        { id: 8, code: "130", name: "Furosemide 40mg", availableStock: 900, unit: "Tablet", suppliers: ["Supplier A", "Supplier B", "Supplier C"] },
        { id: 9, code: "131", name: "Gauze Roll", availableStock: 400, unit: "Roll", suppliers: ["Supplier E"] },
        { id: 10, code: "132", name: "Heparin 5000IU", availableStock: 250, unit: "Vial", suppliers: ["Supplier F"] },
        { id: 11, code: "133", name: "Insulin 100IU", availableStock: 180, unit: "Vial", suppliers: ["Supplier A", "Supplier D"] },
        { id: 12, code: "134", name: "Lisinopril 5mg", availableStock: 700, unit: "Tablet", suppliers: ["Supplier B"] },
        { id: 13, code: "135", name: "Metformin 500mg", availableStock: 1800, unit: "Tablet", suppliers: ["Supplier C", "Supplier F"] },
        { id: 14, code: "136", name: "Omeprazole 20mg", availableStock: 950, unit: "Capsule", suppliers: ["Supplier D", "Supplier E"] },
        { id: 15, code: "137", name: "Paracetamol 500mg", availableStock: 3000, unit: "Tablet", suppliers: ["Supplier A", "Supplier B"] },
        { id: 16, code: "138", name: "Ranitidine 150mg", availableStock: 650, unit: "Tablet", suppliers: ["Supplier C"] },
        { id: 17, code: "139", name: "Saline 0.9%", availableStock: 2200, unit: "Bottle", suppliers: ["Supplier E", "Supplier F"] },
        { id: 18, code: "140", name: "Tramadol 50mg", availableStock: 420, unit: "Tablet", suppliers: ["Supplier A", "Supplier D"] },
        { id: 19, code: "141", name: "Warfarin 5mg", availableStock: 330, unit: "Tablet", suppliers: ["Supplier B", "Supplier C"] },
        { id: 20, code: "142", name: "X-Ray Film 14x17", availableStock: 1100, unit: "Box", suppliers: ["Supplier E"] },
    ];

    // Mock bills data
    const mockBills: Bill[] = [
        { id: 1, billNo: "BILL001", billDate: "2026-01-15", medicineId: 1, supplier: "Supplier A", quantity: 500, rate: 50 },
        { id: 2, billNo: "BILL002", billDate: "2026-01-18", medicineId: 1, supplier: "Supplier B", quantity: 300, rate: 48 },
        { id: 3, billNo: "BILL003", billDate: "2026-01-20", medicineId: 1, supplier: "Supplier A", quantity: 700, rate: 52 },
    ];

    const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("");

    // Filter medicines
    const filteredMedicines = useMemo(() => {
        let medicines = mockMedicines;

        // Filter by selected letter
        if (selectedLetter !== "All") {
            medicines = medicines.filter(m => m.name.toUpperCase().startsWith(selectedLetter));
        }

        // Filter by search term
        if (searchTerm.trim()) {
            const search = searchTerm.toLowerCase();
            medicines = medicines.filter(m =>
                m.name.toLowerCase().includes(search) ||
                m.code.toLowerCase().includes(search)
            );
        }

        // Sort alphabetically
        return medicines.sort((a, b) => a.name.localeCompare(b.name));
    }, [selectedLetter, searchTerm]);

    const handleMedicineSelect = (medicine: Medicine) => {
        setSelectedMedicine(medicine);
        // Reset form when selecting new medicine
        setFormData({
            billsFromDate: "",
            sortSuppliers: "",
            returnUnits: "",
            cost: "",
        });
        setFormErrors({});
    };

    const handleFormChange = (field: keyof ReturnFormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error for this field
        if (formErrors[field]) {
            setFormErrors(prev => {
                const updated = { ...prev };
                delete updated[field];
                return updated;
            });
        }
    };

    const validateForm = (): boolean => {
        const errors: { [key: string]: string } = {};

        if (!formData.billsFromDate) {
            errors.billsFromDate = "Bills From Date is required";
        }

        if (!formData.returnUnits || Number(formData.returnUnits) <= 0) {
            errors.returnUnits = "Return Units must be greater than 0";
        } else if (selectedMedicine && Number(formData.returnUnits) > selectedMedicine.availableStock) {
            errors.returnUnits = `Cannot exceed available stock (${selectedMedicine.availableStock})`;
        }

        if (!formData.cost || Number(formData.cost) <= 0) {
            errors.cost = "Cost must be greater than 0";
        }

        setFormErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = () => {
        if (!selectedMedicine) return;

        if (validateForm()) {
            console.log("Submitting Goods Return Note:");
            console.log("Medicine:", selectedMedicine);
            console.log("Form Data:", formData);
            alert(`Goods Return Note submitted successfully!\nProduct: ${selectedMedicine.name}\nReturn Units: ${formData.returnUnits}\nCost: ₹${formData.cost}`);
            
            // Reset form after successful submission
            setSelectedMedicine(null);
            setFormData({
                billsFromDate: "",
                sortSuppliers: "",
                returnUnits: "",
                cost: "",
            });
            setFormErrors({});
        }
    };

    const handleViewBills = () => {
        setShowBillsModal(true);
    };

    const getFilteredBills = () => {
        if (!selectedMedicine) return [];
        
        let bills = mockBills.filter(b => b.medicineId === selectedMedicine.id);
        
        // Filter by date if provided
        if (formData.billsFromDate) {
            bills = bills.filter(b => new Date(b.billDate) >= new Date(formData.billsFromDate));
        }
        
        // Filter by supplier if provided
        if (formData.sortSuppliers.trim()) {
            const search = formData.sortSuppliers.toLowerCase();
            bills = bills.filter(b => b.supplier.toLowerCase().includes(search));
        }
        
        return bills;
    };

    return (
        <Container fluid className="p-4">
            <PageHeader
                icon={faFileAlt}
                title="G.R Note Preparation"
                subtitle="Prepare goods return notes"
            />

            <Row className="mt-4">
                {/* Left Column: Medicine Selection */}
                <Col md={7} lg={8}>
                    <Card className="shadow-sm h-100">
                        <Card.Header className="bg-light">
                            <h5 className="mb-0">Select Medicine</h5>
                        </Card.Header>
                <Card.Body>
                    {/* Search Input */}
                    <div className="mb-3">
                        <InputGroup>
                            <InputGroup.Text>
                                <FontAwesomeIcon icon={faSearch} />
                            </InputGroup.Text>
                            <Form.Control
                                type="text"
                                placeholder="Search medicines by name or code..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                            {searchTerm && (
                                <Button
                                    variant="outline-secondary"
                                    onClick={() => setSearchTerm("")}
                                >
                                    Clear
                                </Button>
                            )}
                        </InputGroup>
                    </div>

                    {/* Alphabet Selector */}
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

                    {/* Medicines Table */}
                    <div style={{ maxHeight: "40vh", overflowY: "auto" }}>
                        <Table bordered hover>
                            <thead style={{ position: "sticky", top: 0, backgroundColor: "#f8f9fa", zIndex: 10 }}>
                                <tr>
                                    <th style={{ width: "5%" }} className="text-center">Select</th>
                                    <th style={{ width: "8%" }}>SI.No</th>
                                    <th style={{ width: "12%" }}>Code</th>
                                    <th style={{ width: "40%" }}>Medicine Name</th>
                                    <th style={{ width: "20%" }}>Available Stock</th>
                                    <th style={{ width: "15%" }}>Unit</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredMedicines.length === 0 ? (
                                    <tr>
                                        <td colSpan={6} className="text-center text-muted py-4">
                                            {searchTerm
                                                ? "No medicines found matching your search"
                                                : selectedLetter !== "All"
                                                ? `No medicines found for letter "${selectedLetter}"`
                                                : "No medicines available"}
                                        </td>
                                    </tr>
                                ) : (
                                    filteredMedicines.map((medicine, index) => (
                                        <tr
                                            key={medicine.id}
                                            style={{
                                                backgroundColor: selectedMedicine?.id === medicine.id ? "#e7f3ff" : "transparent"
                                            }}
                                        >
                                            <td className="text-center">
                                                <Form.Check
                                                    type="checkbox"
                                                    checked={selectedMedicine?.id === medicine.id}
                                                    onChange={(e) => {
                                                        if (e.target.checked) {
                                                            handleMedicineSelect(medicine);
                                                        } else {
                                                            setSelectedMedicine(null);
                                                        }
                                                    }}
                                                />
                                            </td>
                                            <td className="text-center">{index + 1}</td>
                                            <td>{medicine.code}</td>
                                            <td><strong>{medicine.name}</strong></td>
                                            <td className="text-end">{medicine.availableStock}</td>
                                            <td>{medicine.unit}</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Card.Body>
            </Card>
            </Col>

            {/* Right Column: Goods Return Note Form */}
            <Col md={5} lg={4}>
                <Card className="shadow-sm h-100">
                    <Card.Header className="bg-primary text-white">
                        <h5 className="mb-0">GOODS RETURN NOTE</h5>
                    </Card.Header>
                    <Card.Body className="p-4">
                        {!selectedMedicine ? (
                            <div className="text-center text-muted py-5">
                                <FontAwesomeIcon icon={faBoxes} size="3x" className="mb-3" style={{ opacity: 0.3 }} />
                                <p className="mb-0" style={{ fontSize: "1.1rem" }}>Select a medicine from the left to begin</p>
                            </div>
                        ) : (
                            <Form>
                                {/* Product Name */}
                                <Row className="mb-4">
                                <Col md={12}>
                                    <div className="d-flex align-items-center">
                                        <strong style={{ minWidth: "180px" }}>Product Name:</strong>
                                        <span className="fs-5 text-primary">
                                            {selectedMedicine.name} [ {selectedMedicine.code} ]
                                        </span>
                                    </div>
                                </Col>
                            </Row>

                            {/* View Bills Button */}
                            <Row className="mb-3">
                                <Col md={12}>
                                    <Button
                                        variant="outline-info"
                                        onClick={handleViewBills}
                                        className="mb-2"
                                    >
                                        <FontAwesomeIcon icon={faBoxes} className="me-2" />
                                        View Bills
                                    </Button>
                                </Col>
                            </Row>

                            {/* Bills From Date */}
                            <Row className="mb-3">
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>
                                            Bills From Date <span className="text-danger">*</span>
                                        </Form.Label>
                                        <Form.Control
                                            type="date"
                                            value={formData.billsFromDate}
                                            onChange={(e) => handleFormChange("billsFromDate", e.target.value)}
                                            isInvalid={!!formErrors.billsFromDate}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {formErrors.billsFromDate}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>

                                {/* Sort Suppliers */}
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>Sort Suppliers</Form.Label>
                                        <Form.Control
                                            type="text"
                                            placeholder="Enter supplier name to filter"
                                            value={formData.sortSuppliers}
                                            onChange={(e) => handleFormChange("sortSuppliers", e.target.value)}
                                        />
                                        <Form.Text className="text-muted">
                                            Available: {selectedMedicine.suppliers.join(", ")}
                                        </Form.Text>
                                    </Form.Group>
                                </Col>
                            </Row>

                            {/* Available Stock and Return Units */}
                            <Row className="mb-3">
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>Available Stock</Form.Label>
                                        <Form.Control
                                            type="text"
                                            value={`${selectedMedicine.availableStock} ${selectedMedicine.unit}`}
                                            disabled
                                            style={{ fontWeight: "bold", backgroundColor: "#f8f9fa" }}
                                        />
                                    </Form.Group>
                                </Col>

                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>
                                            Return Units <span className="text-danger">*</span>
                                        </Form.Label>
                                        <Form.Control
                                            type="number"
                                            placeholder="Enter quantity to return"
                                            value={formData.returnUnits}
                                            onChange={(e) => handleFormChange("returnUnits", e.target.value)}
                                            isInvalid={!!formErrors.returnUnits}
                                            min="1"
                                            max={selectedMedicine.availableStock}
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {formErrors.returnUnits}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>
                            </Row>

                            {/* Cost */}
                            <Row className="mb-4">
                                <Col md={6}>
                                    <Form.Group>
                                        <Form.Label>
                                            Cost (Rs.) <span className="text-danger">*</span>
                                        </Form.Label>
                                        <Form.Control
                                            type="number"
                                            placeholder="Enter cost per unit"
                                            value={formData.cost}
                                            onChange={(e) => handleFormChange("cost", e.target.value)}
                                            isInvalid={!!formErrors.cost}
                                            min="0.01"
                                            step="0.01"
                                        />
                                        <Form.Control.Feedback type="invalid">
                                            {formErrors.cost}
                                        </Form.Control.Feedback>
                                    </Form.Group>
                                </Col>

                                {/* Total Cost Display */}
                                {formData.returnUnits && formData.cost && (
                                    <Col md={6}>
                                        <Form.Group>
                                            <Form.Label>Total Cost</Form.Label>
                                            <Form.Control
                                                type="text"
                                                value={`₹ ${(Number(formData.returnUnits) * Number(formData.cost)).toFixed(2)}`}
                                                disabled
                                                style={{ fontWeight: "bold", fontSize: "1.1rem", backgroundColor: "#e7f3ff" }}
                                            />
                                        </Form.Group>
                                    </Col>
                                )}
                            </Row>

                            {/* Submit Button */}
                            <Row>
                                <Col md={12} className="text-center">
                                    <Button
                                        variant="success"
                                        size="lg"
                                        onClick={handleSubmit}
                                        style={{ minWidth: "200px", fontWeight: "var(--font-weight-semibold)" }}
                                    >
                                        SUBMIT
                                    </Button>
                                </Col>
                            </Row>
                            </Form>
                        )}
                    </Card.Body>
                </Card>
            </Col>
        </Row>

        {/* Bills Modal */}
            <Modal show={showBillsModal} onHide={() => setShowBillsModal(false)} size="lg">
                <Modal.Header closeButton>
                    <Modal.Title>Bills for {selectedMedicine?.name}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <Table bordered hover>
                        <thead>
                            <tr>
                                <th>Bill No</th>
                                <th>Bill Date</th>
                                <th>Supplier</th>
                                <th>Quantity</th>
                                <th>Rate (Rs.)</th>
                                <th>Total (Rs.)</th>
                            </tr>
                        </thead>
                        <tbody>
                            {getFilteredBills().length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="text-center text-muted py-3">
                                        No bills found matching the criteria
                                    </td>
                                </tr>
                            ) : (
                                getFilteredBills().map(bill => (
                                    <tr key={bill.id}>
                                        <td>{bill.billNo}</td>
                                        <td>{new Date(bill.billDate).toLocaleDateString()}</td>
                                        <td>{bill.supplier}</td>
                                        <td className="text-end">{bill.quantity}</td>
                                        <td className="text-end">{bill.rate.toFixed(2)}</td>
                                        <td className="text-end"><strong>{(bill.quantity * bill.rate).toFixed(2)}</strong></td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </Table>
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowBillsModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>
        </Container>
    );
};

export default GRNotePreparation;
