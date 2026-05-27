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
    Clock,
    CheckCircle,
    ChevronLeft,
    Link45deg,
    Trash,
    XCircle,
} from "react-bootstrap-icons";
import PageHeader from "../../../../components/PageHeader";
import { faLink } from "@fortawesome/free-solid-svg-icons";

interface Product {
    id: number;
    name: string;
    code: string;
}

interface Supplier {
    id: number;
    name: string;
    shortName: string;
}

interface SupplierMapping {
    id: number;
    productId: number;
    productName: string;
    productCode: string;
    supplierId: number;
    supplierName: string;
    supplierShortName: string;
    entDateTime: string;
    uid: number;
}

const SupplierMapping = () => {
    const navigate = useNavigate();
    const loginData = useSelector((state: RootState) => state.loginData);

    // Refs for input fields
    const productRef = useRef<HTMLSelectElement>(null);
    const supplierRef = useRef<HTMLSelectElement>(null);

    const [form, setForm] = useState({
        productId: "",
        supplierId: "",
    });

    // Sample data for products
    const [products] = useState<Product[]>([
        { id: 1, name: "X-Ray Film 14x17", code: "XRF001" },
        { id: 2, name: "CT Contrast Medium", code: "CTM002" },
        { id: 3, name: "MRI Coil", code: "MRC003" },
        { id: 4, name: "Ultrasound Gel", code: "USG004" },
        { id: 5, name: "Developer Solution", code: "DEV005" },
        { id: 6, name: "Fixer Solution", code: "FIX006" },
    ]);

    // Sample data for suppliers
    const [suppliers] = useState<Supplier[]>([
        { id: 1, name: "MedEquip Suppliers", shortName: "MES" },
        { id: 2, name: "XRay Films Ltd", shortName: "XFL" },
        { id: 3, name: "RadChem Solutions", shortName: "RCS" },
        { id: 4, name: "Imaging Supplies Co", shortName: "ISC" },
    ]);

    const [mappings, setMappings] = useState<SupplierMapping[]>([
        {
            id: 1,
            productId: 1,
            productName: "X-Ray Film 14x17",
            productCode: "XRF001",
            supplierId: 2,
            supplierName: "XRay Films Ltd",
            supplierShortName: "XFL",
            entDateTime: new Date().toISOString(),
            uid: 0,
        },
        {
            id: 2,
            productId: 2,
            productName: "CT Contrast Medium",
            productCode: "CTM002",
            supplierId: 1,
            supplierName: "MedEquip Suppliers",
            supplierShortName: "MES",
            entDateTime: new Date().toISOString(),
            uid: 0,
        },
        {
            id: 3,
            productId: 5,
            productName: "Developer Solution",
            productCode: "DEV005",
            supplierId: 3,
            supplierName: "RadChem Solutions",
            supplierShortName: "RCS",
            entDateTime: new Date().toISOString(),
            uid: 0,
        },
    ]);

    const [loading, setLoading] = useState(false);

    // Load mappings from localStorage on mount
    useEffect(() => {
        const savedMappings = localStorage.getItem("supplierMappings");
        if (savedMappings) {
            setMappings(JSON.parse(savedMappings));
        }
    }, []);

    // Save mappings to localStorage whenever mappings change
    useEffect(() => {
        localStorage.setItem("supplierMappings", JSON.stringify(mappings));
    }, [mappings]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleMapSupplier = () => {
        // Validation
        if (!form.productId) {
            showValidationError("Please select a dealer.");
            setTimeout(() => productRef.current?.focus(), 100);
            return;
        }

        if (!form.supplierId) {
            showValidationError("Please select a company.");
            setTimeout(() => supplierRef.current?.focus(), 100);
            return;
        }

        // Check if mapping already exists
        const existingMapping = mappings.find(
            (m) => m.productId === parseInt(form.productId) && 
                   m.supplierId === parseInt(form.supplierId)
        );

        if (existingMapping) {
            showValidationError("This dealer-company mapping already exists.");
            return;
        }

        setLoading(true);

        try {
            const product = products.find((p) => p.id === parseInt(form.productId));
            const supplier = suppliers.find((s) => s.id === parseInt(form.supplierId));

            if (!product || !supplier) {
                showErrorToast("Invalid dealer or company selection.");
                return;
            }

            const newMapping: SupplierMapping = {
                id: mappings.length > 0 ? Math.max(...mappings.map((m) => m.id)) + 1 : 1,
                productId: product.id,
                productName: product.name,
                productCode: product.code,
                supplierId: supplier.id,
                supplierName: supplier.name,
                supplierShortName: supplier.shortName,
                entDateTime: new Date().toISOString(),
                uid: loginData.id || 0,
            };

            setMappings([...mappings, newMapping]);
            showSuccessToast("Dealer-company mapping created successfully!");

            // Reset form
            setForm({
                productId: "",
                supplierId: "",
            });
        } catch (error) {
            showErrorToast("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleUnmap = async (id: number) => {
        const result = await showConfirmDialog(
            "Are you sure you want to remove this mapping?",
            "Confirm Unmapping",
            "Yes, Remove",
            "Cancel"
        );

        if (!result.isConfirmed) return;

        setMappings((prevMappings) => prevMappings.filter((m) => m.id !== id));
        showSuccessToast("Dealer-company mapping removed successfully");
    };

    // Search functionality for mappings
    const {
        filteredData: filteredMappings,
        searchTerm,
        setSearchTerm,
        resultCount,
        totalCount,
    } = useTableSearch({
        data: mappings,
        searchFields: ["productName", "productCode", "supplierName", "supplierShortName"],
    });

    return (
        <Container fluid className="p-4">
            <PageHeader
                icon={faLink}
                title="Supplier Mapping"
                subtitle="Map products to their suppliers for radiology inventory management"
                badges={[
                    { label: "Total Mappings", value: mappings.length },
                ]}
            />

            <Row className="mt-4">
                {/* Left Column - Mapping Form */}
                <Col md={5}>
                    <Card className="shadow-sm">
                        <Card.Header className="bg-light">
                            <h5 className="mb-0">
                                <Link45deg size={22} className="me-2" />
                                Create New Mapping
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <Form>
                                {/* Product Selection */}
                                <Form.Group className="mb-3">
                                    <Form.Label>
                                        Dealers Name <span style={{ color: "red" }}>*</span>
                                    </Form.Label>
                                    <Form.Select
                                        name="productId"
                                        value={form.productId}
                                        onChange={handleInputChange}
                                        ref={productRef}
                                        required
                                    >
                                        <option value="">-- Select Dealer --</option>
                                        {products.map((product) => (
                                            <option key={product.id} value={product.id}>
                                                {product.code} - {product.name}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>

                                {/* Supplier Selection */}
                                <Form.Group className="mb-3">
                                    <Form.Label>
                                        Company Name <span style={{ color: "red" }}>*</span>
                                    </Form.Label>
                                    <Form.Select
                                        name="supplierId"
                                        value={form.supplierId}
                                        onChange={handleInputChange}
                                        ref={supplierRef}
                                        required
                                    >
                                        <option value="">-- Select Company --</option>
                                        {suppliers.map((supplier) => (
                                            <option key={supplier.id} value={supplier.id}>
                                                {supplier.shortName} - {supplier.name}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>

                                {/* Action Buttons */}
                                <div className="d-flex gap-2 mt-4">
                                    <Button
                                        variant="outline-secondary"
                                        onClick={() => navigate(routerPathNames.radiology.dashboard)}
                                    >
                                        <ChevronLeft /> Back
                                    </Button>

                                    <div className="ms-auto d-flex gap-2">
                                        <Button
                                            variant="success"
                                            onClick={handleMapSupplier}
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <Clock /> Processing...
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle /> Map Supplier
                                                </>
                                            )}
                                        </Button>
                                        <Button
                                            variant="outline-secondary"
                                            onClick={() =>
                                                setForm({ productId: "", supplierId: "" })
                                            }
                                        >
                                            <XCircle /> Clear
                                        </Button>
                                    </div>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Right Column - Mappings List */}
                <Col md={7}>
                    <Card className="shadow-sm">
                        <Card.Header className="bg-light">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <h5 className="mb-0">
                                    Existing Mappings
                                    <span
                                        className="badge bg-primary ms-2"
                                        style={{
                                            fontSize: "var(--font-size-xs)",
                                            padding: "4px 8px",
                                        }}
                                    >
                                        {filteredMappings.length}
                                    </span>
                                </h5>
                            </div>

                            {/* Search Input */}
                            <SearchInput
                                searchTerm={searchTerm}
                                onSearchChange={setSearchTerm}
                                placeholder="Search by dealer or company..."
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
                                        <th>Dealer Code</th>
                                        <th>Dealer Name</th>
                                        <th>Company</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredMappings.length === 0 ? (
                                        <tr>
                                            <td colSpan={5} style={{ textAlign: "center" }}>
                                                {searchTerm
                                                    ? "No mappings match your search."
                                                    : "No dealer-company mappings found. Create a new mapping to get started."}
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredMappings.map((mapping, idx) => (
                                            <tr key={mapping.id}>
                                                <td>{idx + 1}</td>
                                                <td>{mapping.productCode}</td>
                                                <td>{mapping.productName}</td>
                                                <td>
                                                    {mapping.supplierShortName} - {mapping.supplierName}
                                                </td>
                                                <td>
                                                    <Button
                                                        variant="outline-danger"
                                                        size="sm"
                                                        onClick={() => handleUnmap(mapping.id)}
                                                    >
                                                        <Trash size={14} /> Unmap
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

export default SupplierMapping;
