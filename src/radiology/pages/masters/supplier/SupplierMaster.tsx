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
} from "../../../../utils/alertUtil";
import {
    PencilSquare,
    Clock,
    CheckCircle,
    ChevronLeft,
    ListCheck,
    ShieldX,
    ArrowRepeat,
    XCircle,
} from "react-bootstrap-icons";
import PageHeader from "../../../../components/PageHeader";
import { faTruck } from "@fortawesome/free-solid-svg-icons";

interface SupplierItem {
    id: number;
    name: string;
    isLocalSupplier: boolean;
    address: string;
    pin: string;
    city: string;
    state: string;
    phoneNo: string;
    fax: string;
    email: string;
    web: string;
    description: string;
    minDeliveryTime: number;
    blocked: number;
    entDateTime: string;
    uid: number;
}

const SupplierMaster = () => {
    const navigate = useNavigate();
    const loginData = useSelector((state: RootState) => state.loginData);

    // Refs for input fields to enable focus on validation errors
    const supplierNameRef = useRef<HTMLInputElement>(null);

    const [form, setForm] = useState({
        supplierName: "",
        isLocalSupplier: false,
        address: "",
        pin: "",
        city: "",
        state: "",
        phoneNo: "",
        fax: "",
        email: "",
        web: "",
        description: "",
        minDeliveryTime: 0,
    });

    const [items, setItems] = useState<SupplierItem[]>([
        {
            id: 1,
            name: "MedEquip Suppliers",
            isLocalSupplier: true,
            address: "789 Industrial Estate",
            pin: "560010",
            city: "Bangalore",
            state: "Karnataka",
            phoneNo: "080-22334455",
            fax: "080-22334456",
            email: "sales@medequip.com",
            web: "www.medequip.com",
            description: "Medical equipment supplier",
            minDeliveryTime: 3,
            blocked: 0,
            entDateTime: new Date().toISOString(),
            uid: 0,
        },
        {
            id: 2,
            name: "XRay Films Ltd",
            isLocalSupplier: false,
            address: "32 Medical Zone",
            pin: "560020",
            city: "Bangalore",
            state: "Karnataka",
            phoneNo: "080-33445566",
            fax: "080-33445567",
            email: "contact@xrayfilms.com",
            web: "www.xrayfilms.com",
            description: "X-Ray film supplies",
            minDeliveryTime: 7,
            blocked: 0,
            entDateTime: new Date().toISOString(),
            uid: 0,
        },
        {
            id: 3,
            name: "RadChem Solutions",
            isLocalSupplier: true,
            address: "15 Tech Boulevard",
            pin: "560030",
            city: "Chennai",
            state: "Tamil Nadu",
            phoneNo: "044-66778899",
            fax: "044-66778800",
            email: "info@radchem.com",
            web: "www.radchem.com",
            description: "Radiology chemicals",
            minDeliveryTime: 5,
            blocked: 1,
            entDateTime: new Date().toISOString(),
            uid: 0,
        },
    ]);

    const [editingId, setEditingId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [showBlocked, setShowBlocked] = useState(false);

    // Load items from localStorage on mount
    useEffect(() => {
        const savedItems = localStorage.getItem("supplierItems");
        if (savedItems) {
            setItems(JSON.parse(savedItems));
        }
    }, []);

    // Save items to localStorage whenever items change
    useEffect(() => {
        localStorage.setItem("supplierItems", JSON.stringify(items));
    }, [items]);

    const handleInputChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value, type } = e.target;
        const checked = (e.target as HTMLInputElement).checked;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleAddOrUpdate = () => {
        // Validation
        if (!form.supplierName.trim()) {
            showValidationError("Supplier name is required.");
            setTimeout(() => supplierNameRef.current?.focus(), 100);
            return;
        }

        setLoading(true);

        try {
            if (editingId !== null) {
                // Update existing item
                setItems((prevItems) =>
                    prevItems.map((item) =>
                        item.id === editingId
                            ? {
                                ...item,
                                name: form.supplierName,
                                isLocalSupplier: form.isLocalSupplier,
                                address: form.address,
                                pin: form.pin,
                                city: form.city,
                                state: form.state,
                                phoneNo: form.phoneNo,
                                fax: form.fax,
                                email: form.email,
                                web: form.web,
                                description: form.description,
                                minDeliveryTime: Number(form.minDeliveryTime),
                            }
                            : item
                    )
                );
                showSuccessToast("Supplier updated successfully!");
                setEditingId(null);
            } else {
                // Add new item
                const newItem: SupplierItem = {
                    id: items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1,
                    name: form.supplierName,
                    isLocalSupplier: form.isLocalSupplier,
                    address: form.address,
                    pin: form.pin,
                    city: form.city,
                    state: form.state,
                    phoneNo: form.phoneNo,
                    fax: form.fax,
                    email: form.email,
                    web: form.web,
                    description: form.description,
                    minDeliveryTime: Number(form.minDeliveryTime),
                    blocked: 0,
                    entDateTime: new Date().toISOString(),
                    uid: loginData.id || 0,
                };
                setItems([...items, newItem]);
                showSuccessToast("Supplier created successfully!");
            }

            // Reset form
            setForm({
                supplierName: "",
                isLocalSupplier: false,
                address: "",
                pin: "",
                city: "",
                state: "",
                phoneNo: "",
                fax: "",
                email: "",
                web: "",
                description: "",
                minDeliveryTime: 0,
            });
        } catch (error) {
            showErrorToast("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (id: number) => {
        const item = items.find((i) => i.id === id);
        if (item) {
            setForm({
                supplierName: item.name,
                isLocalSupplier: item.isLocalSupplier,
                address: item.address,
                pin: item.pin,
                city: item.city,
                state: item.state,
                phoneNo: item.phoneNo,
                fax: item.fax,
                email: item.email,
                web: item.web,
                description: item.description,
                minDeliveryTime: item.minDeliveryTime,
            });
            setEditingId(id);
        }
    };

    const handleCancelEdit = () => {
        setForm({
            supplierName: "",
            isLocalSupplier: false,
            address: "",
            pin: "",
            city: "",
            state: "",
            phoneNo: "",
            fax: "",
            email: "",
            web: "",
            description: "",
            minDeliveryTime: 0,
        });
        setEditingId(null);
    };

    const handleBlock = (id: number) => {
        setItems((prevItems) =>
            prevItems.map((item) =>
                item.id === id ? { ...item, blocked: 1 } : item
            )
        );
        showSuccessToast("Supplier blocked successfully");
    };

    const handleUnblock = (id: number) => {
        setItems((prevItems) =>
            prevItems.map((item) =>
                item.id === id ? { ...item, blocked: 0 } : item
            )
        );
        showSuccessToast("Supplier unblocked successfully");
    };

    // Filter items based on blocked status
    const activeItems = items.filter((item) => item.blocked === 0);
    const blockedItems = items.filter((item) => item.blocked === 1);

    // Search functionality for active items
    const {
        filteredData: filteredActiveItems,
        searchTerm: activeSearchTerm,
        setSearchTerm: setActiveSearchTerm,
        resultCount: activeResultCount,
        totalCount: activeTotalCount,
    } = useTableSearch({
        data: activeItems,
        searchFields: ["name", "city", "state"],
    });

    // Search functionality for blocked items
    const {
        filteredData: filteredBlockedItems,
        searchTerm: blockedSearchTerm,
        setSearchTerm: setBlockedSearchTerm,
        resultCount: blockedResultCount,
        totalCount: blockedTotalCount,
    } = useTableSearch({
        data: blockedItems,
        searchFields: ["name", "city", "state"],
    });

    return (
        <Container fluid className="p-4">
            <PageHeader
                icon={faTruck}
                title={
                    editingId
                        ? "Edit Supplier Master"
                        : "Add Supplier Master"
                }
                subtitle={
                    editingId
                        ? "Update supplier details for radiology inventory"
                        : "Create new supplier for radiology department"
                }
                badges={[
                    { label: "Active", value: activeItems.length },
                    { label: "Blocked", value: blockedItems.length },
                    { label: "Total", value: items.length },
                ]}
            />

            <Row className="mt-4">
                {/* Left Column - Form */}
                <Col md={7}>
                    <Card className="shadow-sm">
                        <Card.Body>
                            <Form>
                                {/* Row 1: Supplier Name & Local Supplier */}
                                <Row>
                                    <Col md={9}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>
                                                Supplier Name <span style={{ color: "red" }}>*</span>
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="supplierName"
                                                value={form.supplierName}
                                                onChange={handleInputChange}
                                                ref={supplierNameRef}
                                                placeholder="Enter supplier name"
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>&nbsp;</Form.Label>
                                            <Form.Check
                                                type="checkbox"
                                                id="isLocalSupplier"
                                                name="isLocalSupplier"
                                                checked={form.isLocalSupplier}
                                                onChange={handleInputChange}
                                                label="Local Supplier"
                                                style={{ marginTop: "8px" }}
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                {/* Row 2: Address & Pin */}
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Address</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="address"
                                                value={form.address}
                                                onChange={handleInputChange}
                                                placeholder="Enter address"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Pin</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="pin"
                                                value={form.pin}
                                                onChange={handleInputChange}
                                                placeholder="Enter pin code"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                {/* Row 3: City & State */}
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>City</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="city"
                                                value={form.city}
                                                onChange={handleInputChange}
                                                placeholder="Enter city"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>State</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="state"
                                                value={form.state}
                                                onChange={handleInputChange}
                                                placeholder="Enter state"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                {/* Row 4: Phone No & Fax */}
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Phone No</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="phoneNo"
                                                value={form.phoneNo}
                                                onChange={handleInputChange}
                                                placeholder="Enter phone number"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Fax</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="fax"
                                                value={form.fax}
                                                onChange={handleInputChange}
                                                placeholder="Enter fax number"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                {/* Row 5: E-mail & Web */}
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>E-mail</Form.Label>
                                            <Form.Control
                                                type="email"
                                                name="email"
                                                value={form.email}
                                                onChange={handleInputChange}
                                                placeholder="Enter email address"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Web</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="web"
                                                value={form.web}
                                                onChange={handleInputChange}
                                                placeholder="Enter website URL"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                {/* Row 6: Description & Min Delivery Time */}
                                <Row>
                                    <Col md={9}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Description</Form.Label>
                                            <Form.Control
                                                as="textarea"
                                                rows={2}
                                                name="description"
                                                value={form.description}
                                                onChange={handleInputChange}
                                                placeholder="Enter description"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={3}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Min Delivery Time</Form.Label>
                                            <div className="d-flex align-items-center">
                                                <Form.Control
                                                    type="number"
                                                    name="minDeliveryTime"
                                                    value={form.minDeliveryTime}
                                                    onChange={handleInputChange}
                                                    placeholder="0"
                                                    min="0"
                                                    step="1"
                                                />
                                                <span className="ms-2" style={{ whiteSpace: "nowrap" }}>days</span>
                                            </div>
                                        </Form.Group>
                                    </Col>
                                </Row>

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
                                            variant={editingId ? "warning" : "success"}
                                            onClick={handleAddOrUpdate}
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <Clock /> Processing...
                                                </>
                                            ) : editingId ? (
                                                <>
                                                    <PencilSquare /> Update Supplier
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle /> Create Supplier
                                                </>
                                            )}
                                        </Button>
                                        {editingId && (
                                            <Button
                                                variant="outline-secondary"
                                                onClick={handleCancelEdit}
                                            >
                                                <XCircle /> Cancel
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Right Column - Item List */}
                <Col md={5}>
                    <Card className="shadow-sm">
                        <Card.Header className="bg-light">
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <div className="d-flex align-items-center gap-2">
                                    {showBlocked ? (
                                        <ShieldX size={22} color="#dc3545" />
                                    ) : (
                                        <ListCheck size={22} color="#28a745" />
                                    )}
                                    <h5 className="mb-0">
                                        {showBlocked ? "Blocked Suppliers" : "Active Suppliers"}
                                    </h5>
                                    <span
                                        className="badge"
                                        style={{
                                            background: showBlocked ? "#dc3545" : "#28a745",
                                            fontSize: "var(--font-size-xs)",
                                            padding: "4px 8px",
                                        }}
                                    >
                                        {showBlocked
                                            ? filteredBlockedItems.length
                                            : filteredActiveItems.length}
                                    </span>
                                </div>
                                <Button
                                    variant={showBlocked ? "outline-success" : "outline-danger"}
                                    size="sm"
                                    onClick={() => setShowBlocked(!showBlocked)}
                                    style={{
                                        borderRadius: "20px",
                                        padding: "6px 16px",
                                        fontWeight: "var(--font-weight-medium)",
                                        display: "flex",
                                        alignItems: "center",
                                        gap: "6px",
                                    }}
                                >
                                    <ArrowRepeat size={16} />
                                    {showBlocked ? "Show Active" : "Show Blocked"}
                                </Button>
                            </div>

                            {/* Search Input */}
                            <SearchInput
                                searchTerm={
                                    showBlocked ? blockedSearchTerm : activeSearchTerm
                                }
                                onSearchChange={
                                    showBlocked ? setBlockedSearchTerm : setActiveSearchTerm
                                }
                                placeholder="Search suppliers by name, city, state..."
                                resultCount={
                                    showBlocked ? blockedResultCount : activeResultCount
                                }
                                totalCount={showBlocked ? blockedTotalCount : activeTotalCount}
                                showResultCount={true}
                            />
                        </Card.Header>
                        <Card.Body style={{ maxHeight: "600px", overflowY: "auto" }}>
                            <Table striped bordered hover size="sm">
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Supplier Name</th>
                                        <th>City</th>
                                        <th>Local</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(showBlocked
                                        ? filteredBlockedItems
                                        : filteredActiveItems
                                    ).length === 0 ? (
                                        <tr>
                                            <td colSpan={5} style={{ textAlign: "center" }}>
                                                {showBlocked
                                                    ? blockedSearchTerm
                                                        ? "No blocked suppliers match your search."
                                                        : "No blocked suppliers."
                                                    : activeSearchTerm
                                                        ? "No active suppliers match your search."
                                                        : "No active suppliers."}
                                            </td>
                                        </tr>
                                    ) : (
                                        (showBlocked
                                            ? filteredBlockedItems
                                            : filteredActiveItems
                                        ).map((item, idx) => (
                                            <tr
                                                key={item.id}
                                                style={{
                                                    backgroundColor:
                                                        editingId === item.id ? "#fff3cd" : "transparent",
                                                    fontWeight: editingId === item.id ? "var(--font-weight-semibold)" : "normal",
                                                    borderLeft:
                                                        editingId === item.id
                                                            ? "4px solid #ffc107"
                                                            : "none",
                                                }}
                                            >
                                                <td>{idx + 1}</td>
                                                <td>
                                                    {item.name}
                                                    {editingId === item.id && (
                                                        <span className="ms-2 badge bg-warning text-dark">
                                                            <i className="fas fa-edit me-1"></i>
                                                            Editing
                                                        </span>
                                                    )}
                                                </td>
                                                <td>{item.city || "-"}</td>
                                                <td>
                                                    {item.isLocalSupplier ? (
                                                        <span className="badge bg-success">Yes</span>
                                                    ) : (
                                                        <span className="badge bg-secondary">No</span>
                                                    )}
                                                </td>
                                                <td>
                                                    {showBlocked ? (
                                                        <Button
                                                            variant="outline-success"
                                                            size="sm"
                                                            onClick={() => handleUnblock(item.id)}
                                                        >
                                                            Unblock
                                                        </Button>
                                                    ) : (
                                                        <>
                                                            {editingId !== item.id ? (
                                                                <>
                                                                    <Button
                                                                        variant="outline-primary"
                                                                        size="sm"
                                                                        className="me-1"
                                                                        onClick={() => handleEdit(item.id)}
                                                                    >
                                                                        Edit
                                                                    </Button>
                                                                    <Button
                                                                        variant="outline-danger"
                                                                        size="sm"
                                                                        onClick={() => handleBlock(item.id)}
                                                                    >
                                                                        Block
                                                                    </Button>
                                                                </>
                                                            ) : (
                                                                <span className="text-muted fst-italic">
                                                                    Editing...
                                                                </span>
                                                            )}
                                                        </>
                                                    )}
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

export default SupplierMaster;
