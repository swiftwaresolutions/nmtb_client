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
    ArrowRepeat,
    ListCheck,
    ShieldX,
} from "react-bootstrap-icons";
import PageHeader from "../../../../components/PageHeader";
import { faClipboardList } from "@fortawesome/free-solid-svg-icons";

interface ProcedureItem {
    id: number;
    group: string;
    particulars: string;
    rate: number;
    isEditable: number;
    blocked: number;
    entDateTime: string;
    uid: number;
}

const ProceduresConfig = () => {
    const navigate = useNavigate();
    const loginData = useSelector((state: RootState) => state.loginData);

    // Refs for input fields to enable focus on validation errors
    const groupRef = useRef<HTMLSelectElement>(null);
    const particularsRef = useRef<HTMLInputElement>(null);
    const rateRef = useRef<HTMLInputElement>(null);

    const [form, setForm] = useState({
        group: "",
        particulars: "",
        rate: "",
        isEditable: false,
    });

    // Sample groups for dropdown
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

    const [procedures, setProcedures] = useState<ProcedureItem[]>([
        {
            id: 1,
            group: "X-Ray",
            particulars: "Chest X-Ray (PA View)",
            rate: 500.00,
            isEditable: 1,
            blocked: 0,
            entDateTime: new Date().toISOString(),
            uid: 0,
        },
        {
            id: 2,
            group: "CT Scan",
            particulars: "CT Scan - Brain",
            rate: 3500.00,
            isEditable: 0,
            blocked: 0,
            entDateTime: new Date().toISOString(),
            uid: 0,
        },
        {
            id: 3,
            group: "Ultrasound",
            particulars: "Ultrasound Abdomen",
            rate: 800.00,
            isEditable: 1,
            blocked: 0,
            entDateTime: new Date().toISOString(),
            uid: 0,
        },
        {
            id: 4,
            group: "MRI",
            particulars: "MRI - Spine",
            rate: 6000.00,
            isEditable: 0,
            blocked: 1,
            entDateTime: new Date().toISOString(),
            uid: 0,
        },
    ]);

    const [editingId, setEditingId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [showBlocked, setShowBlocked] = useState(false);

    // Load procedures from localStorage on mount
    useEffect(() => {
        const savedProcedures = localStorage.getItem("radiologyProcedures");
        if (savedProcedures) {
            setProcedures(JSON.parse(savedProcedures));
        }
    }, []);

    // Save procedures to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem("radiologyProcedures", JSON.stringify(procedures));
    }, [procedures]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const target = e.target;
        const { name, type } = target;

        if (type === "checkbox") {
            const checked = (target as HTMLInputElement).checked;
            setForm((prev) => ({
                ...prev,
                [name]: checked,
            }));
        } else {
            const { value } = target;
            setForm((prev) => ({
                ...prev,
                [name]: value,
            }));
        }
    };

    const handleAddOrUpdate = () => {
        // Validation
        if (!form.group) {
            showValidationError("Please select a group.");
            setTimeout(() => groupRef.current?.focus(), 100);
            return;
        }

        if (!form.particulars.trim()) {
            showValidationError("Particulars is required.");
            setTimeout(() => particularsRef.current?.focus(), 100);
            return;
        }

        if (!form.rate || parseFloat(form.rate) <= 0) {
            showValidationError("Please enter a valid rate greater than 0.");
            setTimeout(() => rateRef.current?.focus(), 100);
            return;
        }

        setLoading(true);

        try {
            const rate = parseFloat(form.rate);

            if (editingId !== null) {
                // Update existing procedure
                setProcedures((prevProcedures) =>
                    prevProcedures.map((proc) =>
                        proc.id === editingId
                            ? {
                                  ...proc,
                                  group: form.group,
                                  particulars: form.particulars.trim(),
                                  rate,
                                  isEditable: form.isEditable ? 1 : 0,
                                  entDateTime: new Date().toISOString(),
                                  uid: loginData.id || 0,
                              }
                            : proc
                    )
                );
                showSuccessToast("Procedure updated successfully!");
                setEditingId(null);
            } else {
                // Add new procedure
                const newProcedure: ProcedureItem = {
                    id:
                        procedures.length > 0
                            ? Math.max(...procedures.map((p) => p.id)) + 1
                            : 1,
                    group: form.group,
                    particulars: form.particulars.trim(),
                    rate,
                    isEditable: form.isEditable ? 1 : 0,
                    blocked: 0,
                    entDateTime: new Date().toISOString(),
                    uid: loginData.id || 0,
                };
                setProcedures([...procedures, newProcedure]);
                showSuccessToast("Procedure added successfully!");
            }

            // Reset form
            setForm({
                group: "",
                particulars: "",
                rate: "",
                isEditable: false,
            });
        } catch (error) {
            showErrorToast("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (id: number) => {
        const procedure = procedures.find((item) => item.id === id);
        if (procedure) {
            setForm({
                group: procedure.group,
                particulars: procedure.particulars,
                rate: String(procedure.rate),
                isEditable: procedure.isEditable === 1,
            });
            setEditingId(id);
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setForm({
            group: "",
            particulars: "",
            rate: "",
            isEditable: false,
        });
    };

    const handleBlock = async (id: number) => {
        const result = await showConfirmDialog(
            "Are you sure you want to block this procedure?",
            "Confirm Block",
            "Yes, Block",
            "Cancel"
        );

        if (!result.isConfirmed) return;

        setProcedures((prevProcedures) =>
            prevProcedures.map((proc) =>
                proc.id === id
                    ? { ...proc, blocked: 1 }
                    : proc
            )
        );
        showSuccessToast("Procedure blocked successfully");
    };

    const handleUnblock = async (id: number) => {
        const result = await showConfirmDialog(
            "Are you sure you want to unblock this procedure?",
            "Confirm Unblock",
            "Yes, Unblock",
            "Cancel"
        );

        if (!result.isConfirmed) return;

        setProcedures((prevProcedures) =>
            prevProcedures.map((proc) =>
                proc.id === id ? { ...proc, blocked: 0 } : proc
            )
        );
        showSuccessToast("Procedure unblocked successfully");
    };

    // Separate active and blocked procedures
    const activeProcedures = procedures.filter((p) => p.blocked === 0);
    const blockedProcedures = procedures.filter((p) => p.blocked === 1);

    // Search functionality for active procedures
    const {
        filteredData: filteredActiveProcedures,
        searchTerm: activeSearchTerm,
        setSearchTerm: setActiveSearchTerm,
        resultCount: activeResultCount,
        totalCount: activeTotalCount,
    } = useTableSearch({
        data: activeProcedures,
        searchFields: ["group", "particulars"],
    });

    // Search functionality for blocked procedures
    const {
        filteredData: filteredBlockedProcedures,
        searchTerm: blockedSearchTerm,
        setSearchTerm: setBlockedSearchTerm,
        resultCount: blockedResultCount,
        totalCount: blockedTotalCount,
    } = useTableSearch({
        data: blockedProcedures,
        searchFields: ["group", "particulars"],
    });

    return (
        <Container fluid className="p-4">
            <PageHeader
                icon={faClipboardList}
                title="Procedures Configuration"
                subtitle="Manage radiology procedures and examinations"
                badges={[
                    { label: "Total Procedures", value: procedures.length },
                    { label: "Active", value: activeProcedures.length },
                    { label: "Blocked", value: blockedProcedures.length },
                ]}
            />

            <Row className="mt-4">
                {/* Left Column - Form */}
                <Col md={5}>
                    <Card className="shadow-sm">
                        <Card.Header className="bg-light">
                            <h5 className="mb-0">
                                {editingId ? (
                                    <>
                                        <PencilSquare size={22} className="me-2" />
                                        Edit Procedure
                                    </>
                                ) : (
                                    <>
                                        <PlusCircle size={22} className="me-2" />
                                        Add New Procedure
                                    </>
                                )}
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <Form>
                                <Form.Group className="mb-3">
                                    <Form.Label>
                                        Group <span style={{ color: "red" }}>*</span>
                                    </Form.Label>
                                    <Form.Select
                                        name="group"
                                        value={form.group}
                                        onChange={handleInputChange}
                                        ref={groupRef}
                                        required
                                    >
                                        <option value="">-- Select Group --</option>
                                        {groups.map((grp, idx) => (
                                            <option key={idx} value={grp}>
                                                {grp}
                                            </option>
                                        ))}
                                    </Form.Select>
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>
                                        Particulars <span style={{ color: "red" }}>*</span>
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="particulars"
                                        value={form.particulars}
                                        onChange={handleInputChange}
                                        ref={particularsRef}
                                        placeholder="Enter particulars"
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>
                                        Rate (₹) <span style={{ color: "red" }}>*</span>
                                    </Form.Label>
                                    <Form.Control
                                        type="number"
                                        name="rate"
                                        value={form.rate}
                                        onChange={handleInputChange}
                                        ref={rateRef}
                                        placeholder="Enter rate"
                                        required
                                        min="0.01"
                                        step="0.01"
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Check
                                        type="checkbox"
                                        id="isEditable"
                                        label="Is Editable"
                                        name="isEditable"
                                        checked={form.isEditable}
                                        onChange={handleInputChange}
                                    />
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
                                                        group: "",
                                                        particulars: "",
                                                        rate: "",
                                                        isEditable: false,
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
                <Col md={7}>
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
                                        {showBlocked ? "Blocked Procedures" : "Active Procedures"}
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
                                            ? filteredBlockedProcedures.length
                                            : filteredActiveProcedures.length}
                                    </span>
                                </div>
                                <Button
                                    variant={
                                        showBlocked ? "outline-success" : "outline-danger"
                                    }
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
                                placeholder="Search by group or particulars..."
                                resultCount={
                                    showBlocked ? blockedResultCount : activeResultCount
                                }
                                totalCount={
                                    showBlocked ? blockedTotalCount : activeTotalCount
                                }
                                showResultCount={true}
                            />
                        </Card.Header>
                        <Card.Body style={{ maxHeight: "600px", overflowY: "auto" }}>
                            <Table striped bordered hover size="sm">
                                <thead>
                                    <tr>
                                        <th style={{ width: "60px" }}>#</th>
                                        <th>Particulars</th>
                                        <th style={{ width: "120px" }}>Rate (₹)</th>
                                        <th style={{ width: "100px" }}>Editable</th>
                                        <th style={{ width: "160px" }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(showBlocked
                                        ? filteredBlockedProcedures
                                        : filteredActiveProcedures
                                    ).length === 0 ? (
                                        <tr>
                                            <td colSpan={6} style={{ textAlign: "center" }}>
                                                {showBlocked
                                                    ? blockedSearchTerm
                                                        ? "No blocked procedures match your search."
                                                        : "No blocked procedures."
                                                    : activeSearchTerm
                                                    ? "No active procedures match your search."
                                                    : "No active procedures. Add a new procedure to get started."}
                                            </td>
                                        </tr>
                                    ) : (
                                        (showBlocked
                                            ? filteredBlockedProcedures
                                            : filteredActiveProcedures
                                        ).map((proc, idx) => (
                                            <tr
                                                key={proc.id}
                                                style={{
                                                    backgroundColor:
                                                        editingId === proc.id
                                                            ? "#fff3cd"
                                                            : "transparent",
                                                    fontWeight:
                                                        editingId === proc.id ? "var(--font-weight-semibold)" : "normal",
                                                    borderLeft:
                                                        editingId === proc.id
                                                            ? "4px solid #ffc107"
                                                            : "none",
                                                }}
                                            >
                                                <td>{idx + 1}</td>
                                                <td><strong>{proc.particulars}</strong></td>
                                                <td>{proc.rate.toFixed(2)}</td>
                                                <td>
                                                    {proc.isEditable === 1 ? (
                                                        <span className="badge bg-success">
                                                            Yes
                                                        </span>
                                                    ) : (
                                                        <span className="badge bg-secondary">
                                                            No
                                                        </span>
                                                    )}
                                                </td>
                                                <td>
                                                    {showBlocked ? (
                                                        <Button
                                                            variant="outline-success"
                                                            size="sm"
                                                            onClick={() => handleUnblock(proc.id)}
                                                        >
                                                            Unblock
                                                        </Button>
                                                    ) : (
                                                        <>
                                                            {editingId !== proc.id ? (
                                                                <>
                                                                    <Button
                                                                        variant="outline-primary"
                                                                        size="sm"
                                                                        className="me-1"
                                                                        onClick={() =>
                                                                            handleEdit(proc.id)
                                                                        }
                                                                        disabled={loading}
                                                                    >
                                                                        Edit
                                                                    </Button>
                                                                    <Button
                                                                        variant="outline-danger"
                                                                        size="sm"
                                                                        onClick={() =>
                                                                            handleBlock(proc.id)
                                                                        }
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

export default ProceduresConfig;
