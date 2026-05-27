import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    Container,
    Row,
    Col,
    Card,
    Button,
    Table,
    Form,
} from "react-bootstrap";
import { useSelector } from "react-redux";
import { RootState } from "../../../../state/store";
import { routerPathNames } from "../../../../routes/routerPathNames";
import SearchInput from "../../../../components/SearchInput";
import { useTableSearch } from "../../../../hooks/useTableSearch";
import {
    showSuccessToast,
    showErrorToast,
    showValidationError,
    showConfirmDialog,
} from "../../../../utils/alertUtil";
import {
    ChevronLeft,
    CheckCircle,
    Trash,
} from "react-bootstrap-icons";
import PageHeader from "../../../../components/PageHeader";
import { faLink } from "@fortawesome/free-solid-svg-icons";

interface Product {
    id: number;
    code: string;
    name: string;
    selected: boolean;
}

interface Procedure {
    id: number;
    group: string;
    particulars: string;
}

interface ProductProcedureMapping {
    id: number;
    procedureId: number;
    procedureGroup: string;
    procedureName: string;
    products: {
        productId: number;
        productCode: string;
        productName: string;
        quantity: number;
    }[];
    entDateTime: string;
    uid: number;
}

const MapProduct = () => {
    const navigate = useNavigate();
    const loginData = useSelector((state: RootState) => state.loginData);

    // Refs for input fields
    const groupRef = useRef<HTMLSelectElement>(null);
    const procedureRef = useRef<HTMLSelectElement>(null);

    const [selectedGroup, setSelectedGroup] = useState("");
    const [selectedProcedure, setSelectedProcedure] = useState("");

    // Groups for dropdown
    const groups = [
        "X-Ray",
        "CT Scan",
        "MRI",
        "Ultrasound",
        "Mammography",
        "Fluoroscopy",
        "PET Scan",
        "Interventional Radiology",
        "Other",
    ];

    // Sample products with selection state
    const [products, setProducts] = useState<Product[]>([
        { id: 1, code: "PRD001", name: "X-Ray Film 14x17", selected: false },
        { id: 2, code: "PRD002", name: "CT Contrast Media", selected: false },
        { id: 3, code: "PRD003", name: "Ultrasound Gel", selected: false },
        { id: 4, code: "PRD004", name: "Lead Apron Large", selected: false },
        { id: 5, code: "PRD005", name: "MRI Contrast Agent", selected: false },
        { id: 6, code: "PRD006", name: "Developer Solution", selected: false },
        { id: 7, code: "PRD007", name: "Fixer Solution", selected: false },
        { id: 8, code: "PRD008", name: "Sterile Gloves", selected: false },
        { id: 9, code: "PRD009", name: "X-Ray Film 10x12", selected: false },
        { id: 10, code: "PRD010", name: "Barium Sulfate", selected: false },
        { id: 11, code: "PRD011", name: "CT Film 8x10", selected: false },
        { id: 12, code: "PRD012", name: "Lead Apron Medium", selected: false },
        { id: 13, code: "PRD013", name: "Lead Apron Small", selected: false },
        { id: 14, code: "PRD014", name: "Thyroid Shield", selected: false },
        { id: 15, code: "PRD015", name: "Gonad Shield", selected: false },
        { id: 16, code: "PRD016", name: "Positioning Sponges", selected: false },
        { id: 17, code: "PRD017", name: "Sandbags", selected: false },
        { id: 18, code: "PRD018", name: "Alcohol Swabs", selected: false },
        { id: 19, code: "PRD019", name: "Gauze Pads", selected: false },
        { id: 20, code: "PRD020", name: "Medical Tape", selected: false },
        { id: 21, code: "PRD021", name: "Syringes 10ml", selected: false },
        { id: 22, code: "PRD022", name: "Syringes 20ml", selected: false },
        { id: 23, code: "PRD023", name: "Needles 21G", selected: false },
        { id: 24, code: "PRD024", name: "Needles 23G", selected: false },
        { id: 25, code: "PRD025", name: "IV Cannula 20G", selected: false },
        { id: 26, code: "PRD026", name: "IV Cannula 22G", selected: false },
        { id: 27, code: "PRD027", name: "Saline Solution 500ml", selected: false },
        { id: 28, code: "PRD028", name: "Cotton Balls", selected: false },
        { id: 29, code: "PRD029", name: "Surgical Mask", selected: false },
        { id: 30, code: "PRD030", name: "Patient Gown", selected: false },
    ]);

    // Sample procedures (will be filtered by group)
    const [allProcedures] = useState<Procedure[]>([
        { id: 1, group: "X-Ray", particulars: "Chest X-Ray (PA View)" },
        { id: 2, group: "X-Ray", particulars: "Abdomen X-Ray" },
        { id: 3, group: "CT Scan", particulars: "CT Scan - Brain" },
        { id: 4, group: "CT Scan", particulars: "CT Scan - Chest" },
        { id: 5, group: "Ultrasound", particulars: "Ultrasound Abdomen" },
        { id: 6, group: "Ultrasound", particulars: "Ultrasound Pelvis" },
        { id: 7, group: "MRI", particulars: "MRI - Spine" },
        { id: 8, group: "MRI", particulars: "MRI - Brain" },
        { id: 9, group: "Mammography", particulars: "Bilateral Mammography" },
    ]);

    // Filter procedures based on selected group
    const filteredProcedures = selectedGroup
        ? allProcedures.filter((proc) => proc.group === selectedGroup)
        : [];

    const [mappings, setMappings] = useState<ProductProcedureMapping[]>([]);

    // Load mappings from localStorage on mount
    useEffect(() => {
        const savedMappings = localStorage.getItem("radiologyProductProcedureMappings");
        if (savedMappings) {
            setMappings(JSON.parse(savedMappings));
        }
    }, []);

    // Save mappings to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem(
            "radiologyProductProcedureMappings",
            JSON.stringify(mappings)
        );
    }, [mappings]);

    const handleGroupChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedGroup(e.target.value);
        setSelectedProcedure("");
        // Reset all product selections
        setProducts((prev) =>
            prev.map((p) => ({ ...p, selected: false }))
        );
    };

    const handleProcedureChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedProcedure(e.target.value);
        // Reset all product selections
        setProducts((prev) =>
            prev.map((p) => ({ ...p, selected: false }))
        );
    };

    const handleProductToggle = (productId: number) => {
        setProducts((prev) =>
            prev.map((p) =>
                p.id === productId ? { ...p, selected: !p.selected } : p
            )
        );
    };



    const handleSubmit = () => {
        // Validation
        if (!selectedGroup) {
            showValidationError("Please select a group.");
            setTimeout(() => groupRef.current?.focus(), 100);
            return;
        }

        if (!selectedProcedure) {
            showValidationError("Please select a procedure.");
            setTimeout(() => procedureRef.current?.focus(), 100);
            return;
        }

        const selectedProducts = products.filter((p) => p.selected);

        if (selectedProducts.length === 0) {
            showValidationError("Please select at least one product.");
            return;
        }

        const selectedProc = allProcedures.find(
            (p) => p.id === parseInt(selectedProcedure)
        );

        if (!selectedProc) {
            showErrorToast("Selected procedure not found.");
            return;
        }

        // Check if mapping already exists for this procedure
        const existingMapping = mappings.find(
            (m) => m.procedureId === parseInt(selectedProcedure)
        );

        if (existingMapping) {
            showValidationError(
                "This procedure already has product mappings. Please remove the existing mapping first."
            );
            return;
        }

        const newMapping: ProductProcedureMapping = {
            id:
                mappings.length > 0
                    ? Math.max(...mappings.map((m) => m.id)) + 1
                    : 1,
            procedureId: selectedProc.id,
            procedureGroup: selectedProc.group,
            procedureName: selectedProc.particulars,
            products: selectedProducts.map((p) => ({
                productId: p.id,
                productCode: p.code,
                productName: p.name,
                quantity: 1,
            })),
            entDateTime: new Date().toISOString(),
            uid: loginData.id || 0,
        };

        setMappings([...mappings, newMapping]);
        showSuccessToast(
            `Products mapped to "${selectedProc.particulars}" successfully!`
        );

        // Reset form
        setSelectedGroup("");
        setSelectedProcedure("");
        setProducts((prev) =>
            prev.map((p) => ({ ...p, selected: false }))
        );
    };

    const handleUnmap = async (id: number) => {
        const result = await showConfirmDialog(
            "Are you sure you want to remove this product-procedure mapping?",
            "Confirm Delete",
            "Yes, Remove",
            "Cancel"
        );

        if (!result.isConfirmed) return;

        setMappings((prevMappings) => prevMappings.filter((mapping) => mapping.id !== id));
        showSuccessToast("Product-procedure mapping removed successfully");
    };

    const handleSelectAllProducts = () => {
        setProducts((prev) => prev.map((p) => ({ ...p, selected: true })));
    };

    const handleClearSelection = () => {
        setProducts((prev) =>
            prev.map((p) => ({ ...p, selected: false }))
        );
    };

    // Search functionality
    const {
        filteredData: filteredMappings,
        searchTerm,
        setSearchTerm,
        resultCount,
        totalCount,
    } = useTableSearch({
        data: mappings,
        searchFields: ["procedureGroup", "procedureName"],
    });

    return (
        <Container fluid className="p-4">
            <PageHeader
                icon={faLink}
                title="Map Product to Procedure"
                subtitle="Define product requirements for radiology procedures"
                badges={[{ label: "Total Mappings", value: mappings.length }]}
            />

            <Row className="mt-4">
                {/* Left Column - Form */}
                <Col md={5}>
                    <Card className="shadow-sm">
                        <Card.Header className="bg-light">
                            <h5 className="mb-0">Map Products to Procedure</h5>
                        </Card.Header>
                        <Card.Body>
                            <Form>
                                {/* Step 1: Select Group */}
                                <Form.Group className="mb-3">
                                    <Form.Label>
                                        <strong>Step 1:</strong> Select Group{" "}
                                        <span style={{ color: "red" }}>*</span>
                                    </Form.Label>
                                    <Form.Select
                                        value={selectedGroup}
                                        onChange={handleGroupChange}
                                        ref={groupRef}
                                        required
                                    >
                                        <option value="">-- Select Group --</option>
                                        {groups.map((group) => (
                                            <option key={group} value={group}>
                                                {group}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>

                                {/* Step 2: Select Procedure (enabled after group selection) */}
                                <Form.Group className="mb-3">
                                    <Form.Label>
                                        <strong>Step 2:</strong> Select Procedure{" "}
                                        <span style={{ color: "red" }}>*</span>
                                    </Form.Label>
                                    <Form.Select
                                        value={selectedProcedure}
                                        onChange={handleProcedureChange}
                                        ref={procedureRef}
                                        disabled={!selectedGroup}
                                        required
                                    >
                                        <option value="">
                                            {selectedGroup
                                                ? "-- Select Procedure --"
                                                : "-- Select Group First --"}
                                        </option>
                                        {filteredProcedures.map((procedure) => (
                                            <option key={procedure.id} value={procedure.id}>
                                                {procedure.particulars}
                                            </option>
                                        ))}
                                    </Form.Select>
                                    {selectedGroup && filteredProcedures.length === 0 && (
                                        <Form.Text className="text-danger">
                                            No procedures found for this group.
                                        </Form.Text>
                                    )}
                                </Form.Group>

                                {/* Step 3: Select Products (shown after procedure selection) */}
                                {selectedProcedure && (
                                    <div className="mt-4 p-3 border rounded bg-light">
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                            <h6 className="mb-0">
                                                <strong>Step 3:</strong> Select Products{" "}
                                                <span style={{ color: "red" }}>*</span>
                                            </h6>
                                            <div className="d-flex gap-2">
                                                <Button
                                                    size="sm"
                                                    variant="outline-primary"
                                                    onClick={handleSelectAllProducts}
                                                >
                                                    Select All
                                                </Button>
                                                <Button
                                                    size="sm"
                                                    variant="outline-secondary"
                                                    onClick={handleClearSelection}
                                                >
                                                    Clear
                                                </Button>
                                            </div>
                                        </div>

                                        <div
                                            style={{
                                                maxHeight: "300px",
                                                overflowY: "auto",
                                                border: "1px solid #dee2e6",
                                                borderRadius: "4px",
                                                backgroundColor: "white",
                                                padding: "0.5rem",
                                            }}
                                        >
                                            {products.map((product) => (
                                                <div
                                                    key={product.id}
                                                    className="d-flex align-items-center gap-3 p-2 border-bottom"
                                                    style={{
                                                        backgroundColor: product.selected
                                                            ? "#e7f3ff"
                                                            : "transparent",
                                                    }}
                                                >
                                                    <Form.Check
                                                        type="checkbox"
                                                        checked={product.selected}
                                                        onChange={() =>
                                                            handleProductToggle(product.id)
                                                        }
                                                    />
                                                    <div style={{ flex: 1, minWidth: 0 }}>
                                                        <div style={{ fontWeight: "var(--font-weight-medium)" }}>
                                                            {product.name}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>

                                        <Form.Text className="text-muted d-block mt-2">
                                            Selected:{" "}
                                            <strong>
                                                {products.filter((p) => p.selected).length}
                                            </strong>{" "}
                                            of {products.length} products
                                        </Form.Text>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="d-flex gap-2 mt-4">
                                    <Button
                                        variant="outline-secondary"
                                        onClick={() =>
                                            navigate(routerPathNames.radiology.dashboard)
                                        }
                                    >
                                        <ChevronLeft /> Back
                                    </Button>

                                    <div className="ms-auto d-flex gap-2">
                                        <Button
                                            variant="success"
                                            onClick={handleSubmit}
                                            disabled={!selectedProcedure}
                                        >
                                            <CheckCircle /> Submit Mapping
                                        </Button>
                                        <Button
                                            variant="outline-secondary"
                                            onClick={() => {
                                                setSelectedGroup("");
                                                setSelectedProcedure("");
                                                setProducts((prev) =>
                                                    prev.map((p) => ({
                                                        ...p,
                                                        selected: false,
                                                    }))
                                                );
                                            }}
                                        >
                                            Clear All
                                        </Button>
                                    </div>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Right Column - List */}
                <Col md={7}>
                    <Card className="shadow-sm">
                        <Card.Header className="bg-light">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h5 className="mb-0">Product-Procedure Mappings</h5>
                            </div>

                            {/* Search Input */}
                            <SearchInput
                                searchTerm={searchTerm}
                                onSearchChange={setSearchTerm}
                                placeholder="Search by group or procedure..."
                                resultCount={resultCount}
                                totalCount={totalCount}
                                showResultCount={true}
                            />
                        </Card.Header>
                        <Card.Body style={{ maxHeight: "600px", overflowY: "auto" }}>
                            <Table striped bordered hover size="sm">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Group</th>
                                        <th>Procedure</th>
                                        <th>Products</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredMappings.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} style={{ textAlign: "center" }}>
                                                {searchTerm
                                                    ? "No mappings match your search."
                                                    : "No product-procedure mappings. Map products to get started."}
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredMappings.map((mapping, idx) => (
                                            <tr key={mapping.id}>
                                                <td>{idx + 1}</td>
                                                <td>
                                                    <span className="badge bg-primary">
                                                        {mapping.procedureGroup}
                                                    </span>
                                                </td>
                                                <td>
                                                    <strong>{mapping.procedureName}</strong>
                                                </td>
                                                <td>
                                                    <div
                                                        style={{
                                                            maxHeight: "120px",
                                                            overflowY: "auto",
                                                        }}
                                                    >
                                                        {mapping.products.map((product, pIdx) => (
                                                            <div
                                                                key={pIdx}
                                                                className="mb-1 p-1 border-bottom"
                                                                style={{ fontSize: "0.9rem" }}
                                                            >
                                                                • {product.productName}
                                                            </div>
                                                        ))}
                                                    </div>
                                                    <small className="text-muted">
                                                        Total: {mapping.products.length} product
                                                        {mapping.products.length !== 1 ? "s" : ""}
                                                    </small>
                                                </td>
                                                <td>
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={() => handleUnmap(mapping.id)}
                                                    >
                                                        <Trash size={14} /> Remove
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </Table>
                        </Card.Body>
                    </Card>
                </Col>
            </Row>
        </Container>
    );
};

export default MapProduct;
