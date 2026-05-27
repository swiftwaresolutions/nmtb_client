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
    PencilSquare,
    PlusCircle,
    XCircle,
    ListCheck,
    ShieldX,
    ArrowRepeat,
} from "react-bootstrap-icons";
import PageHeader from "../../../../components/PageHeader";
import { faBarcode } from "@fortawesome/free-solid-svg-icons";

interface MaterialCodeItem {
    id: number;
    code: string;
    manufacturedDate: string;
    expiryDate: string;
    costPrice: number;
    blocked: number;
    entDateTime: string;
    uid: number;
}

const MaterialCodeMaster = () => {
    const navigate = useNavigate();
    const loginData = useSelector((state: RootState) => state.loginData);

    // Refs for input fields to enable focus on validation errors
    const codeRef = useRef<HTMLInputElement>(null);
    const manufacturedDateRef = useRef<HTMLInputElement>(null);
    const expiryDateRef = useRef<HTMLInputElement>(null);
    const costPriceRef = useRef<HTMLInputElement>(null);

    const [form, setForm] = useState({
        code: "",
        manufacturedDate: "",
        expiryDate: "",
        costPrice: 0,
    });

    const [materialCodes, setMaterialCodes] = useState<MaterialCodeItem[]>([
        {
            id: 1,
            code: "MC001",
            manufacturedDate: "2025-12-01",
            expiryDate: "2026-12-01",
            costPrice: 150.00,
            blocked: 0,
            entDateTime: new Date().toISOString(),
            uid: 0,
        },
        {
            id: 2,
            code: "MC002",
            manufacturedDate: "2025-11-15",
            expiryDate: "2026-11-15",
            costPrice: 2500.00,
            blocked: 0,
            entDateTime: new Date().toISOString(),
            uid: 0,
        },
        {
            id: 3,
            code: "MC003",
            manufacturedDate: "2025-10-20",
            expiryDate: "2030-10-20",
            costPrice: 8000.00,
            blocked: 0,
            entDateTime: new Date().toISOString(),
            uid: 0,
        },
        {
            id: 4,
            code: "MC004",
            manufacturedDate: "2025-09-10",
            expiryDate: "2026-03-10",
            costPrice: 450.00,
            blocked: 1,
            entDateTime: new Date().toISOString(),
            uid: 0,
        },
    ]);

    const [editingId, setEditingId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [showBlocked, setShowBlocked] = useState(false);

    // Load material codes from localStorage on mount
    useEffect(() => {
        const savedMaterialCodes = localStorage.getItem("materialCodes");
        if (savedMaterialCodes) {
            setMaterialCodes(JSON.parse(savedMaterialCodes));
        }
    }, []);

    // Save material codes to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem("materialCodes", JSON.stringify(materialCodes));
    }, [materialCodes]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "number" ? Number(value) : value,
        }));
    };

    const handleAddOrUpdate = () => {
        // Validation
        if (!form.code.trim()) {
            showValidationError("Material code is required.");
            setTimeout(() => codeRef.current?.focus(), 100);
            return;
        }

        if (!form.manufacturedDate) {
            showValidationError("Manufactured date is required.");
            setTimeout(() => manufacturedDateRef.current?.focus(), 100);
            return;
        }

        if (!form.expiryDate) {
            showValidationError("Expiry date is required.");
            setTimeout(() => expiryDateRef.current?.focus(), 100);
            return;
        }

        if (form.costPrice <= 0) {
            showValidationError("Cost price must be greater than 0.");
            setTimeout(() => costPriceRef.current?.focus(), 100);
            return;
        }

        // Check for duplicate code (only when adding new or code changed)
        const duplicateCode = materialCodes.find(
            (item) =>
                item.code.toLowerCase() === form.code.toLowerCase() &&
                item.id !== editingId
        );

        if (duplicateCode) {
            showValidationError("Material code already exists. Please use a different code.");
            setTimeout(() => codeRef.current?.focus(), 100);
            return;
        }

        setLoading(true);

        try {
            if (editingId !== null) {
                // Update existing material code
                setMaterialCodes((prevItems) =>
                    prevItems.map((item) =>
                        item.id === editingId
                            ? {
                                  ...item,
                                  code: form.code,
                                  manufacturedDate: form.manufacturedDate,
                                  expiryDate: form.expiryDate,
                                  costPrice: Number(form.costPrice),
                                  entDateTime: new Date().toISOString(),
                                  uid: loginData.id || 0,
                              }
                            : item
                    )
                );
                showSuccessToast("Material code updated successfully!");
                setEditingId(null);
            } else {
                // Add new material code
                const newMaterialCode: MaterialCodeItem = {
                    id:
                        materialCodes.length > 0
                            ? Math.max(...materialCodes.map((c) => c.id)) + 1
                            : 1,
                    code: form.code,
                    manufacturedDate: form.manufacturedDate,
                    expiryDate: form.expiryDate,
                    costPrice: Number(form.costPrice),
                    blocked: 0,
                    entDateTime: new Date().toISOString(),
                    uid: loginData.id || 0,
                };
                setMaterialCodes([...materialCodes, newMaterialCode]);
                showSuccessToast("Material code added successfully!");
            }

            // Reset form
            setForm({
                code: "",
                manufacturedDate: "",
                expiryDate: "",
                costPrice: 0,
            });
        } catch (error) {
            showErrorToast("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (id: number) => {
        const materialCode = materialCodes.find((item) => item.id === id);
        if (materialCode) {
            setForm({
                code: materialCode.code,
                manufacturedDate: materialCode.manufacturedDate,
                expiryDate: materialCode.expiryDate,
                costPrice: materialCode.costPrice,
            });
            setEditingId(id);
            setShowBlocked(false); // Switch to active view when editing
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setForm({
            code: "",
            manufacturedDate: "",
            expiryDate: "",
            costPrice: 0,
        });
    };

    const handleBlock = async (id: number) => {
        const result = await showConfirmDialog(
            "Are you sure you want to block this material code?",
            "Confirm Block",
            "Yes, Block",
            "Cancel"
        );

        if (!result.isConfirmed) return;

        setMaterialCodes((prevItems) =>
            prevItems.map((item) =>
                item.id === id
                    ? {
                          ...item,
                          blocked: 1,
                          entDateTime: new Date().toISOString(),
                          uid: loginData.id || 0,
                      }
                    : item
            )
        );
        showSuccessToast("Material code blocked successfully");
    };

    const handleUnblock = async (id: number) => {
        const result = await showConfirmDialog(
            "Are you sure you want to unblock this material code?",
            "Confirm Unblock",
            "Yes, Unblock",
            "Cancel"
        );

        if (!result.isConfirmed) return;

        setMaterialCodes((prevItems) =>
            prevItems.map((item) =>
                item.id === id
                    ? {
                          ...item,
                          blocked: 0,
                          entDateTime: new Date().toISOString(),
                          uid: loginData.id || 0,
                      }
                    : item
            )
        );
        showSuccessToast("Material code unblocked successfully");
    };

    const activeMaterialCodes = materialCodes.filter((item) => item.blocked === 0);
    const blockedMaterialCodes = materialCodes.filter((item) => item.blocked === 1);

    // Search functionality for active material codes
    const {
        filteredData: filteredActiveItems,
        searchTerm: activeSearchTerm,
        setSearchTerm: setActiveSearchTerm,
        resultCount: activeResultCount,
        totalCount: activeTotalCount,
    } = useTableSearch({
        data: activeMaterialCodes,
        searchFields: ["code"],
    });

    // Search functionality for blocked material codes
    const {
        filteredData: filteredBlockedItems,
        searchTerm: blockedSearchTerm,
        setSearchTerm: setBlockedSearchTerm,
        resultCount: blockedResultCount,
        totalCount: blockedTotalCount,
    } = useTableSearch({
        data: blockedMaterialCodes,
        searchFields: ["code"],
    });

    return (
        <Container fluid className="p-4">
            <PageHeader
                icon={faBarcode}
                title="Material Code Master"
                subtitle="Manage material codes for radiology inventory"
                badges={[
                    { label: "Active", value: activeMaterialCodes.length },
                    { label: "Blocked", value: blockedMaterialCodes.length },
                ]}
            />

            <Row className="mt-4">
                {/* Left Column - Form */}
                <Col md={7}>
                    <Card className="shadow-sm">
                        <Card.Header className="bg-light">
                            <h5 className="mb-0">
                                {editingId ? (
                                    <>
                                        <PencilSquare size={22} className="me-2" />
                                        Edit Material Code
                                    </>
                                ) : (
                                    <>
                                        <PlusCircle size={22} className="me-2" />
                                        Add New Material Code
                                    </>
                                )}
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <Form>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>
                                                Material Code <span style={{ color: "red" }}>*</span>
                                            </Form.Label>
                                            <Form.Control
                                                type="text"
                                                name="code"
                                                value={form.code}
                                                onChange={handleInputChange}
                                                ref={codeRef}
                                                placeholder="Enter material code"
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>
                                                Manufactured Date <span style={{ color: "red" }}>*</span>
                                            </Form.Label>
                                            <Form.Control
                                                type="date"
                                                name="manufacturedDate"
                                                value={form.manufacturedDate}
                                                onChange={handleInputChange}
                                                ref={manufacturedDateRef}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>
                                                Expiry Date <span style={{ color: "red" }}>*</span>
                                            </Form.Label>
                                            <Form.Control
                                                type="date"
                                                name="expiryDate"
                                                value={form.expiryDate}
                                                onChange={handleInputChange}
                                                ref={expiryDateRef}
                                                required
                                            />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>
                                                Cost Price <span style={{ color: "red" }}>*</span>
                                            </Form.Label>
                                            <Form.Control
                                                type="number"
                                                name="costPrice"
                                                value={form.costPrice}
                                                onChange={handleInputChange}
                                                ref={costPriceRef}
                                                placeholder="Enter cost price"
                                                min="0"
                                                step="0.01"
                                                required
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
                                            variant="success"
                                            onClick={handleAddOrUpdate}
                                            disabled={loading}
                                        >
                                            {loading ? (
                                                <>
                                                    <Clock /> Processing...
                                                </>
                                            ) : editingId ? (
                                                <>
                                                    <CheckCircle /> Update
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle /> Add
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
                                        {!editingId && (
                                            <Button
                                                variant="outline-secondary"
                                                onClick={() =>
                                                    setForm({
                                                        code: "",
                                                        manufacturedDate: "",
                                                        expiryDate: "",
                                                        costPrice: 0,
                                                    })
                                                }
                                            >
                                                <XCircle /> Clear
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            </Form>
                        </Card.Body>
                    </Card>
                </Col>

                {/* Right Column - List */}
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
                                        {showBlocked ? "Blocked Material Codes" : "Active Material Codes"}
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
                                searchTerm={showBlocked ? blockedSearchTerm : activeSearchTerm}
                                onSearchChange={
                                    showBlocked ? setBlockedSearchTerm : setActiveSearchTerm
                                }
                                placeholder="Search by code..."
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
                                        <th>Code</th>
                                        <th>Mfg Date</th>
                                        <th>Exp Date</th>
                                        <th>Cost Price</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(showBlocked
                                        ? filteredBlockedItems
                                        : filteredActiveItems
                                    ).length === 0 ? (
                                        <tr>
                                            <td colSpan={6} style={{ textAlign: "center" }}>
                                                {showBlocked
                                                    ? blockedSearchTerm
                                                        ? "No blocked material codes match your search."
                                                        : "No blocked material codes."
                                                    : activeSearchTerm
                                                    ? "No active material codes match your search."
                                                    : "No material codes found. Add a new material code to get started."}
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
                                                        editingId === item.id
                                                            ? "#fff3cd"
                                                            : "transparent",
                                                    fontWeight:
                                                        editingId === item.id ? "var(--font-weight-semibold)" : "normal",
                                                    borderLeft:
                                                        editingId === item.id
                                                            ? "4px solid #ffc107"
                                                            : "none",
                                                }}
                                            >
                                                <td>{idx + 1}</td>
                                                <td>
                                                    {item.code}
                                                    {editingId === item.id && (
                                                        <span className="ms-2 badge bg-warning text-dark">
                                                            <i className="fas fa-edit me-1"></i>
                                                            Editing
                                                        </span>
                                                    )}
                                                </td>
                                                <td>{new Date(item.manufacturedDate).toLocaleDateString('en-GB')}</td>
                                                <td>{new Date(item.expiryDate).toLocaleDateString('en-GB')}</td>
                                                <td>₹{item.costPrice.toFixed(2)}</td>
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
                                                                        className="me-2"
                                                                        onClick={() =>
                                                                            handleEdit(item.id)
                                                                        }
                                                                    >
                                                                        Edit
                                                                    </Button>
                                                                    <Button
                                                                        variant="outline-danger"
                                                                        size="sm"
                                                                        onClick={() =>
                                                                            handleBlock(item.id)
                                                                        }
                                                                    >
                                                                        Block
                                                                    </Button>
                                                                </>
                                                            ) : (
                                                                <span className="text-muted fst-italic">
                                                                    Currently editing...
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

export default MaterialCodeMaster;
