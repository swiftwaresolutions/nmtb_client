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
import { faBuilding } from "@fortawesome/free-solid-svg-icons";

interface CompanyItem {
    id: number;
    name: string;
    shortName: string;
    address: string;
    pin: string;
    city: string;
    state: string;
    phoneNo: string;
    fax: string;
    email: string;
    web: string;
    description: string;
    blocked: number;
    entDateTime: string;
    uid: number;
}

const CompanyMaster = () => {
    const navigate = useNavigate();
    const loginData = useSelector((state: RootState) => state.loginData);

    // Refs for input fields to enable focus on validation errors
    const companyNameRef = useRef<HTMLInputElement>(null);

    const [form, setForm] = useState({
        companyName: "",
        shortName: "",
        address: "",
        pin: "",
        city: "",
        state: "",
        phoneNo: "",
        fax: "",
        email: "",
        web: "",
        description: "",
    });

    const [items, setItems] = useState<CompanyItem[]>([
        {
            id: 1,
            name: "Acme Medical Supplies",
            shortName: "AMS",
            address: "123 Main Street",
            pin: "560001",
            city: "Bangalore",
            state: "Karnataka",
            phoneNo: "080-12345678",
            fax: "080-12345679",
            email: "info@acmemedical.com",
            web: "www.acmemedical.com",
            description: "Medical supplies distributor",
            blocked: 0,
            entDateTime: new Date().toISOString(),
            uid: 0,
        },
        {
            id: 2,
            name: "RadiologyPro Inc",
            shortName: "RPI",
            address: "45 Tech Park",
            pin: "560002",
            city: "Bangalore",
            state: "Karnataka",
            phoneNo: "080-98765432",
            fax: "080-98765433",
            email: "contact@radiologypro.com",
            web: "www.radiologypro.com",
            description: "Radiology equipment supplier",
            blocked: 0,
            entDateTime: new Date().toISOString(),
            uid: 0,
        },
        {
            id: 3,
            name: "MedFilm Corp",
            shortName: "MFC",
            address: "78 Industrial Area",
            pin: "560003",
            city: "Chennai",
            state: "Tamil Nadu",
            phoneNo: "044-55667788",
            fax: "044-55667789",
            email: "sales@medfilm.com",
            web: "www.medfilm.com",
            description: "X-Ray films manufacturer",
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
        const savedItems = localStorage.getItem("companyItems");
        if (savedItems) {
            setItems(JSON.parse(savedItems));
        }
    }, []);

    // Save items to localStorage whenever items change
    useEffect(() => {
        localStorage.setItem("companyItems", JSON.stringify(items));
    }, [items]);

    const handleInputChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleAddOrUpdate = () => {
        // Validation
        if (!form.companyName.trim()) {
            showValidationError("Company name is required.");
            setTimeout(() => companyNameRef.current?.focus(), 100);
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
                                name: form.companyName,
                                shortName: form.shortName,
                                address: form.address,
                                pin: form.pin,
                                city: form.city,
                                state: form.state,
                                phoneNo: form.phoneNo,
                                fax: form.fax,
                                email: form.email,
                                web: form.web,
                                description: form.description,
                            }
                            : item
                    )
                );
                showSuccessToast("Company updated successfully!");
                setEditingId(null);
            } else {
                // Add new item
                const newItem: CompanyItem = {
                    id: items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1,
                    name: form.companyName,
                    shortName: form.shortName,
                    address: form.address,
                    pin: form.pin,
                    city: form.city,
                    state: form.state,
                    phoneNo: form.phoneNo,
                    fax: form.fax,
                    email: form.email,
                    web: form.web,
                    description: form.description,
                    blocked: 0,
                    entDateTime: new Date().toISOString(),
                    uid: loginData.id || 0,
                };
                setItems([...items, newItem]);
                showSuccessToast("Company created successfully!");
            }

            // Reset form
            setForm({
                companyName: "",
                shortName: "",
                address: "",
                pin: "",
                city: "",
                state: "",
                phoneNo: "",
                fax: "",
                email: "",
                web: "",
                description: "",
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
                companyName: item.name,
                shortName: item.shortName,
                address: item.address,
                pin: item.pin,
                city: item.city,
                state: item.state,
                phoneNo: item.phoneNo,
                fax: item.fax,
                email: item.email,
                web: item.web,
                description: item.description,
            });
            setEditingId(id);
        }
    };

    const handleCancelEdit = () => {
        setForm({
            companyName: "",
            shortName: "",
            address: "",
            pin: "",
            city: "",
            state: "",
            phoneNo: "",
            fax: "",
            email: "",
            web: "",
            description: "",
        });
        setEditingId(null);
    };

    const handleBlock = (id: number) => {
        setItems((prevItems) =>
            prevItems.map((item) =>
                item.id === id ? { ...item, blocked: 1 } : item
            )
        );
        showSuccessToast("Company blocked successfully");
    };

    const handleUnblock = (id: number) => {
        setItems((prevItems) =>
            prevItems.map((item) =>
                item.id === id ? { ...item, blocked: 0 } : item
            )
        );
        showSuccessToast("Company unblocked successfully");
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
        searchFields: ["name", "shortName", "city"],
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
        searchFields: ["name", "shortName", "city"],
    });

    return (
        <Container fluid className="p-4">
            <PageHeader
                icon={faBuilding}
                title={
                    editingId
                        ? "Edit Company Master"
                        : "Add Company Master"
                }
                subtitle={
                    editingId
                        ? "Update company details for radiology inventory"
                        : "Create new company for radiology department"
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
                                {/* Row 1: Company Name & Short Name */}
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>
                                                Company Name <span style={{ color: "red" }}>*</span>
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="companyName"
                                                value={form.companyName}
                                                onChange={handleInputChange}
                                                ref={companyNameRef}
                                                placeholder="Enter company name"
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Company Short Name</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="shortName"
                                                value={form.shortName}
                                                onChange={handleInputChange}
                                                placeholder="Enter short name"
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

                                {/* Row 6: Description */}
                                <Row>
                                    <Col md={12}>
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
                                                    <PencilSquare /> Update Company
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle /> Create Company
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
                                        {showBlocked ? "Blocked Companies" : "Active Companies"}
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
                                placeholder="Search companies by name, short name, city..."
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
                                        <th>Company Name</th>
                                        <th>Short Name</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(showBlocked
                                        ? filteredBlockedItems
                                        : filteredActiveItems
                                    ).length === 0 ? (
                                        <tr>
                                            <td colSpan={4} style={{ textAlign: "center" }}>
                                                {showBlocked
                                                    ? blockedSearchTerm
                                                        ? "No blocked companies match your search."
                                                        : "No blocked companies."
                                                    : activeSearchTerm
                                                        ? "No active companies match your search."
                                                        : "No active companies."}
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
                                                <td>{item.shortName}</td>
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

export default CompanyMaster;
