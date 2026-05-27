import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
    Container,
    Row,
    Col,
    Card,
    Button,
    Alert,
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
    PlusCircle,
    XCircle,
    Clock,
    CheckCircle,
    ChevronLeft,
    ListCheck,
    ShieldX,
    ArrowRepeat,
} from "react-bootstrap-icons";
import PageHeader from "../../../../components/PageHeader";
import { faFilm } from "@fortawesome/free-solid-svg-icons";

interface InvFilm {
    id: number;
    productName: string;
    companyName: string;
    groupName: string;
    maxLevel?: number;
    minLevel?: number;
    eoq?: number;
    safetyLevel?: number;
    strength?: string;
    strengthUnit?: string;
    gm?: string;
    form?: string;
    rack?: string;
    shelf?: string;
    categoryType?: string;
    category?: string;
    usableAsLoose: boolean;
    blocked: number;
    entDateTime: string;
    uid: number;
}

const InvFilmMaster = () => {
    const navigate = useNavigate();
    const loginData = useSelector((state: RootState) => state.loginData);

    // Refs for input fields to enable focus on validation errors
    const productNameRef = useRef<HTMLInputElement>(null);
    const companyNameRef = useRef<HTMLSelectElement>(null);

    const [form, setForm] = useState({
        productName: "",
        companyName: "",
        groupName: "",
        maxLevel: "",
        minLevel: "",
        eoq: "",
        safetyLevel: "",
        strength: "",
        strengthUnit: "gm",
        gm: "",
        form: "",
        rack: "",
        shelf: "",
        categoryType: "",
        category: "",
        usableAsLoose: false,
    });

    const [items, setItems] = useState<InvFilm[]>([
        {
            id: 1,
            productName: "ANKLE BINDER LARGE",
            companyName: "Medline Industries",
            groupName: "Medical Supplies",
            maxLevel: 100,
            minLevel: 10,
            eoq: 50,
            safetyLevel: 20,
            strength: "500",
            strengthUnit: "gm",
            gm: "500",
            form: "Binder",
            rack: "A",
            shelf: "1",
            categoryType: "Consumables",
            category: "Orthopedic Supplies",
            usableAsLoose: false,
            blocked: 0,
            entDateTime: new Date().toISOString(),
            uid: loginData.id || 0,
        },
        {
            id: 2,
            productName: "ANKLE BINDER MEDIUM",
            companyName: "Cardinal Health",
            groupName: "Medical Supplies",
            maxLevel: 80,
            minLevel: 8,
            eoq: 40,
            safetyLevel: 15,
            strength: "400",
            strengthUnit: "gm",
            gm: "400",
            form: "Binder",
            rack: "A",
            shelf: "2",
            categoryType: "Consumables",
            category: "Orthopedic Supplies",
            usableAsLoose: true,
            blocked: 0,
            entDateTime: new Date().toISOString(),
            uid: loginData.id || 0,
        },
        {
            id: 3,
            productName: "KNEE BINDER",
            companyName: "3M Healthcare",
            groupName: "Medical Supplies",
            maxLevel: 60,
            minLevel: 5,
            eoq: 30,
            safetyLevel: 12,
            strength: "600",
            strengthUnit: "gm",
            gm: "600",
            form: "Binder",
            rack: "B",
            shelf: "1",
            categoryType: "Consumables",
            category: "Orthopedic Supplies",
            usableAsLoose: false,
            blocked: 1,
            entDateTime: new Date().toISOString(),
            uid: loginData.id || 0,
        },
    ]);

    const [editingId, setEditingId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [showBlocked, setShowBlocked] = useState(false);

    // Load items from localStorage on mount
    useEffect(() => {
        const savedItems = localStorage.getItem("invFilmItems");
        if (savedItems) {
            setItems(JSON.parse(savedItems));
        }
    }, []);

    // Save items to localStorage whenever items change
    useEffect(() => {
        localStorage.setItem("invFilmItems", JSON.stringify(items));
    }, [items]);

    const handleInputChange = (
        e: React.ChangeEvent<
            HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
        >
    ) => {
        const { name, value, type } = e.target;
        const checked =
            e.target instanceof HTMLInputElement ? e.target.checked : undefined;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? checked : value,
        }));
    };

    const handleAddOrUpdate = () => {
        // Validation
        if (!form.productName.trim()) {
            showValidationError("Product name is required.");
            setTimeout(() => productNameRef.current?.focus(), 100);
            return;
        }
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
                                productName: form.productName,
                                companyName: form.companyName,
                                groupName: form.groupName,
                                maxLevel: form.maxLevel ? parseInt(form.maxLevel) : undefined,
                                minLevel: form.minLevel ? parseInt(form.minLevel) : undefined,
                                eoq: form.eoq ? parseInt(form.eoq) : undefined,
                                safetyLevel: form.safetyLevel
                                    ? parseInt(form.safetyLevel)
                                    : undefined,
                                strength: form.strength,
                                strengthUnit: form.strengthUnit,
                                gm: form.gm,
                                form: form.form,
                                rack: form.rack,
                                shelf: form.shelf,
                                categoryType: form.categoryType,
                                category: form.category,
                                usableAsLoose: form.usableAsLoose,
                            }
                            : item
                    )
                );
                showSuccessToast("Product updated successfully!");
                setEditingId(null);
            } else {
                // Add new item
                const newItem: InvFilm = {
                    id: items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1,
                    productName: form.productName,
                    companyName: form.companyName,
                    groupName: form.groupName,
                    maxLevel: form.maxLevel ? parseInt(form.maxLevel) : undefined,
                    minLevel: form.minLevel ? parseInt(form.minLevel) : undefined,
                    eoq: form.eoq ? parseInt(form.eoq) : undefined,
                    safetyLevel: form.safetyLevel
                        ? parseInt(form.safetyLevel)
                        : undefined,
                    strength: form.strength,
                    strengthUnit: form.strengthUnit,
                    gm: form.gm,
                    form: form.form,
                    rack: form.rack,
                    shelf: form.shelf,
                    categoryType: form.categoryType,
                    category: form.category,
                    usableAsLoose: form.usableAsLoose,
                    blocked: 0,
                    entDateTime: new Date().toISOString(),
                    uid: loginData.id || 0,
                };
                setItems([...items, newItem]);
                showSuccessToast("Product created successfully!");
            }

            // Reset form
            setForm({
                productName: "",
                companyName: "",
                groupName: "",
                maxLevel: "",
                minLevel: "",
                eoq: "",
                safetyLevel: "",
                strength: "",
                strengthUnit: "gm",
                gm: "",
                form: "",
                rack: "",
                shelf: "",
                categoryType: "",
                category: "",
                usableAsLoose: false,
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
                productName: item.productName,
                companyName: item.companyName,
                groupName: item.groupName,
                maxLevel: item.maxLevel?.toString() || "",
                minLevel: item.minLevel?.toString() || "",
                eoq: item.eoq?.toString() || "",
                safetyLevel: item.safetyLevel?.toString() || "",
                strength: item.strength || "",
                strengthUnit: item.strengthUnit || "gm",
                gm: item.gm || "",
                form: item.form || "",
                rack: item.rack || "",
                shelf: item.shelf || "",
                categoryType: item.categoryType || "",
                category: item.category || "",
                usableAsLoose: item.usableAsLoose,
            });
            setEditingId(id);
        }
    };

    const handleCancelEdit = () => {
        setForm({
            productName: "",
            companyName: "",
            groupName: "",
            maxLevel: "",
            minLevel: "",
            eoq: "",
            safetyLevel: "",
            strength: "",
            strengthUnit: "gm",
            gm: "",
            form: "",
            rack: "",
            shelf: "",
            categoryType: "",
            category: "",
            usableAsLoose: false,
        });
        setEditingId(null);
    };

    const handleBlock = (id: number) => {
        setItems((prevItems) =>
            prevItems.map((item) =>
                item.id === id ? { ...item, blocked: 1 } : item
            )
        );
        showSuccessToast("Product blocked successfully");
        // TODO: Call API to block item on the server
        // await radiologyApiService.blockInvFilm(id);
    };

    const handleUnblock = (id: number) => {
        setItems((prevItems) =>
            prevItems.map((item) =>
                item.id === id ? { ...item, blocked: 0 } : item
            )
        );
        showSuccessToast("Product unblocked successfully");
        // TODO: Call API to unblock item on the server
        // await radiologyApiService.unblockInvFilm(id);
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
        searchFields: ["productName", "companyName"],
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
        searchFields: ["productName", "companyName"],
    });

    return (
        <Container fluid className="p-4">
            <PageHeader
                icon={faFilm}
                title={
                    editingId
                        ? "Edit Inventory/Film Master"
                        : "Add Inventory/Film Master"
                }
                subtitle={
                    editingId
                        ? "Update product details for radiology inventory"
                        : "Create new inventory/film product for radiology department"
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
                                {/* Row 1: Product Name | Company Name */}
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>
                                                Product Name <span style={{ color: "red" }}>*</span>
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="productName"
                                                value={form.productName}
                                                onChange={handleInputChange}
                                                ref={productNameRef}
                                                placeholder="Enter product name"
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>
                                                Company Name <span style={{ color: "red" }}>*</span>
                                            </Form.Label>
                                            <Form.Select
                                                as="select"
                                                name="companyName"
                                                value={form.companyName}
                                                onChange={handleInputChange}
                                                ref={companyNameRef}
                                                required
                                            >
                                                <option value="">-- Select Company --</option>
                                                <option value="Medline Industries">Medline Industries</option>
                                                <option value="Cardinal Health">Cardinal Health</option>
                                                <option value="3M Healthcare">3M Healthcare</option>
                                                <option value="GE Healthcare">GE Healthcare</option>
                                                <option value="Siemens Healthineers">Siemens Healthineers</option>
                                                <option value="Philips Healthcare">Philips Healthcare</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                {/* Row 2: Group Name | Strength */}
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Group Name</Form.Label>
                                            <Form.Select
                                                as="select"
                                                name="groupName"
                                                value={form.groupName}
                                                onChange={handleInputChange}
                                            >
                                                <option value="">-- Select Group --</option>
                                                <option value="Medical Supplies">Medical Supplies</option>
                                                <option value="Surgical Equipment">Surgical Equipment</option>
                                                <option value="Diagnostic Tools">Diagnostic Tools</option>
                                                <option value="Orthopedic Supplies">Orthopedic Supplies</option>
                                                <option value="Radiology Films">Radiology Films</option>
                                                <option value="Contrast Media">Contrast Media</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Strength</Form.Label>
                                            <div className="d-flex gap-2">
                                                <Form.Control
                                                    type="text"
                                                    name="strength"
                                                    value={form.strength}
                                                    onChange={handleInputChange}
                                                    placeholder="Enter value"
                                                    style={{ flex: 2 }}
                                                />
                                                <Form.Select
                                                    as="select"
                                                    name="strengthUnit"
                                                    value={form.strengthUnit}
                                                    onChange={handleInputChange}
                                                    style={{ flex: 1 }}
                                                >
                                                    <option value="gm">gm</option>
                                                    <option value="mg">mg</option>
                                                    <option value="ml">ml</option>
                                                    <option value="kg">kg</option>
                                                    <option value="L">L</option>
                                                </Form.Select>
                                            </div>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                {/* Row 3: Gm | Form */}
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Gm/Measurement</Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="gm"
                                                value={form.gm}
                                                onChange={handleInputChange}
                                                placeholder="Enter measurement value"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Form</Form.Label>
                                            <Form.Select
                                                as="select"
                                                name="form"
                                                value={form.form}
                                                onChange={handleInputChange}
                                            >
                                                <option value="">-- Select Form --</option>
                                                <option value="Binder">Binder</option>
                                                <option value="Tablet">Tablet</option>
                                                <option value="Capsule">Capsule</option>
                                                <option value="Liquid">Liquid</option>
                                                <option value="Injection">Injection</option>
                                                <option value="Cream">Cream</option>
                                                <option value="Ointment">Ointment</option>
                                                <option value="Film">Film</option>
                                                <option value="Plate">Plate</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                {/* Row 4: Rack | Shelf */}
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Rack</Form.Label>
                                            <Form.Select
                                                as="select"
                                                name="rack"
                                                value={form.rack}
                                                onChange={handleInputChange}
                                            >
                                                <option value="">-- Select Rack --</option>
                                                <option value="A">A</option>
                                                <option value="B">B</option>
                                                <option value="C">C</option>
                                                <option value="D">D</option>
                                                <option value="E">E</option>
                                                <option value="F">F</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Shelf</Form.Label>
                                            <Form.Select
                                                as="select"
                                                name="shelf"
                                                value={form.shelf}
                                                onChange={handleInputChange}
                                            >
                                                <option value="">-- Select Shelf --</option>
                                                <option value="1">1</option>
                                                <option value="2">2</option>
                                                <option value="3">3</option>
                                                <option value="4">4</option>
                                                <option value="5">5</option>
                                                <option value="6">6</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                {/* Row 5: Maximum Level | Minimum Level */}
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Maximum Level</Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="maxLevel"
                                                value={form.maxLevel}
                                                onChange={handleInputChange}
                                                placeholder="Enter maximum level"
                                                min="0"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Minimum Level</Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="minLevel"
                                                value={form.minLevel}
                                                onChange={handleInputChange}
                                                placeholder="Enter minimum level"
                                                min="0"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                {/* Row 6: E.O.Q | Safety Level */}
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>E.O.Q (Economic Order Quantity)</Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="eoq"
                                                value={form.eoq}
                                                onChange={handleInputChange}
                                                placeholder="Enter E.O.Q"
                                                min="0"
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Safety Level</Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="safetyLevel"
                                                value={form.safetyLevel}
                                                onChange={handleInputChange}
                                                placeholder="Enter safety level"
                                                min="0"
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                {/* Row 7: Category Type | Category */}
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Category Type</Form.Label>
                                            <Form.Select
                                                as="select"
                                                name="categoryType"
                                                value={form.categoryType}
                                                onChange={handleInputChange}
                                            >
                                                <option value="">-- Select Category Type --</option>
                                                <option value="Consumables">Consumables</option>
                                                <option value="Equipment">Equipment</option>
                                                <option value="Medicine">Medicine</option>
                                                <option value="Supplies">Supplies</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Category</Form.Label>
                                            <Form.Select
                                                as="select"
                                                name="category"
                                                value={form.category}
                                                onChange={handleInputChange}
                                            >
                                                <option value="">-- Select Category --</option>
                                                <option value="CT SCAN">CT SCAN</option>
                                                <option value="MRI">MRI</option>
                                                <option value="X-Ray">X-Ray</option>
                                                <option value="Ultrasound">Ultrasound</option>
                                                <option value="Mammography">Mammography</option>
                                                <option value="Fluoroscopy">Fluoroscopy</option>
                                                <option value="Orthopedic Supplies">Orthopedic Supplies</option>
                                                <option value="General Supplies">General Supplies</option>
                                            </Form.Select>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                {/* Row 8: Usable as Loose */}
                                <Row>
                                    <Col md={12}>
                                        <Form.Group className="mb-3">
                                            <Form.Check
                                                type="checkbox"
                                                id="usable-as-loose"
                                                label="Usable as Loose"
                                                name="usableAsLoose"
                                                checked={form.usableAsLoose}
                                                onChange={handleInputChange}
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
                                                    <PencilSquare /> Update Item
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle /> Create Item
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
                                        {showBlocked ? "Blocked Products" : "Active Products"}
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
                                placeholder="Search products by name or company..."
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
                                        <th>Product</th>
                                        <th>Company</th>
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
                                                        ? "No blocked products match your search."
                                                        : "No blocked products."
                                                    : activeSearchTerm
                                                        ? "No active products match your search."
                                                        : "No active products."}
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
                                                    {item.productName}
                                                    {editingId === item.id && (
                                                        <span className="ms-2 badge bg-warning text-dark">
                                                            <i className="fas fa-edit me-1"></i>
                                                            Editing
                                                        </span>
                                                    )}
                                                </td>
                                                <td>{item.companyName}</td>
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

export default InvFilmMaster;
