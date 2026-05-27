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
import { faUsers } from "@fortawesome/free-solid-svg-icons";

interface GroupItem {
    id: number;
    groupName: string;
    headName: string;
    blocked: number;
    entDateTime: string;
    uid: number;
}

const GroupsConfig = () => {
    const navigate = useNavigate();
    const loginData = useSelector((state: RootState) => state.loginData);

    // Refs for input fields to enable focus on validation errors
    const groupNameRef = useRef<HTMLInputElement>(null);
    const headNameRef = useRef<HTMLSelectElement>(null);

    const [form, setForm] = useState({
        groupName: "",
        headName: "",
    });

    // Sample head names for dropdown
    const headNames = [
        "Capital Expenditure",
        "Revenue Expenditure",
        "Medical Equipment",
        "Consumables",
        "Infrastructure",
        "Administrative",
    ];

    const [groups, setGroups] = useState<GroupItem[]>([
        {
            id: 1,
            groupName: "Radiology Consumables",
            headName: "Consumables",
            blocked: 0,
            entDateTime: new Date().toISOString(),
            uid: 0,
        },
        {
            id: 2,
            groupName: "CT Scan Materials",
            headName: "Medical Equipment",
            blocked: 0,
            entDateTime: new Date().toISOString(),
            uid: 0,
        },
        {
            id: 3,
            groupName: "X-Ray Films",
            headName: "Consumables",
            blocked: 0,
            entDateTime: new Date().toISOString(),
            uid: 0,
        },
        {
            id: 4,
            groupName: "Ultrasound Supplies",
            headName: "Revenue Expenditure",
            blocked: 1,
            entDateTime: new Date().toISOString(),
            uid: 0,
        },
    ]);

    const [editingId, setEditingId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [showBlocked, setShowBlocked] = useState(false);

    // Load groups from localStorage on mount
    useEffect(() => {
        const savedGroups = localStorage.getItem("radiologyGroups");
        if (savedGroups) {
            setGroups(JSON.parse(savedGroups));
        }
    }, []);

    // Save groups to localStorage whenever they change
    useEffect(() => {
        localStorage.setItem("radiologyGroups", JSON.stringify(groups));
    }, [groups]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value } = e.target;
        setForm((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handleAddOrUpdate = () => {
        // Validation
        if (!form.groupName.trim()) {
            showValidationError("Group name is required.");
            setTimeout(() => groupNameRef.current?.focus(), 100);
            return;
        }

        if (!form.headName) {
            showValidationError("Head name is required.");
            setTimeout(() => headNameRef.current?.focus(), 100);
            return;
        }

        setLoading(true);

        try {
            if (editingId !== null) {
                // Update existing group
                setGroups((prevGroups) =>
                    prevGroups.map((group) =>
                        group.id === editingId
                            ? {
                                  ...group,
                                  groupName: form.groupName.trim(),
                                  headName: form.headName,
                                  entDateTime: new Date().toISOString(),
                                  uid: loginData.id || 0,
                              }
                            : group
                    )
                );
                showSuccessToast("Group updated successfully!");
                setEditingId(null);
            } else {
                // Add new group
                const newGroup: GroupItem = {
                    id:
                        groups.length > 0
                            ? Math.max(...groups.map((g) => g.id)) + 1
                            : 1,
                    groupName: form.groupName.trim(),
                    headName: form.headName,
                    blocked: 0,
                    entDateTime: new Date().toISOString(),
                    uid: loginData.id || 0,
                };
                setGroups([...groups, newGroup]);
                showSuccessToast("Group added successfully!");
            }

            // Reset form
            setForm({
                groupName: "",
                headName: "",
            });
        } catch (error) {
            showErrorToast("An error occurred. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (id: number) => {
        const group = groups.find((item) => item.id === id);
        if (group) {
            setForm({
                groupName: group.groupName,
                headName: group.headName,
            });
            setEditingId(id);
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setForm({
            groupName: "",
            headName: "",
        });
    };

    const handleBlock = async (id: number) => {
        const result = await showConfirmDialog(
            "Are you sure you want to block this group?",
            "Confirm Block",
            "Yes, Block",
            "Cancel"
        );

        if (!result.isConfirmed) return;

        setGroups((prevGroups) =>
            prevGroups.map((group) =>
                group.id === id
                    ? { ...group, blocked: 1 }
                    : group
            )
        );
        showSuccessToast("Group blocked successfully");
    };

    const handleUnblock = async (id: number) => {
        const result = await showConfirmDialog(
            "Are you sure you want to unblock this group?",
            "Confirm Unblock",
            "Yes, Unblock",
            "Cancel"
        );

        if (!result.isConfirmed) return;

        setGroups((prevGroups) =>
            prevGroups.map((group) =>
                group.id === id ? { ...group, blocked: 0 } : group
            )
        );
        showSuccessToast("Group unblocked successfully");
    };

    // Separate active and blocked groups
    const activeGroups = groups.filter((g) => g.blocked === 0);
    const blockedGroups = groups.filter((g) => g.blocked === 1);

    // Search functionality for active groups
    const {
        filteredData: filteredActiveGroups,
        searchTerm: activeSearchTerm,
        setSearchTerm: setActiveSearchTerm,
        resultCount: activeResultCount,
        totalCount: activeTotalCount,
    } = useTableSearch({
        data: activeGroups,
        searchFields: ["groupName", "headName"],
    });

    // Search functionality for blocked groups
    const {
        filteredData: filteredBlockedGroups,
        searchTerm: blockedSearchTerm,
        setSearchTerm: setBlockedSearchTerm,
        resultCount: blockedResultCount,
        totalCount: blockedTotalCount,
    } = useTableSearch({
        data: blockedGroups,
        searchFields: ["groupName", "headName"],
    });

    return (
        <Container fluid className="p-4">
            <PageHeader
                icon={faUsers}
                title="Groups Configuration"
                subtitle="Manage radiology item groups"
                badges={[
                    { label: "Total Groups", value: groups.length },
                    { label: "Active", value: activeGroups.length },
                    { label: "Blocked", value: blockedGroups.length },
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
                                        Edit Group
                                    </>
                                ) : (
                                    <>
                                        <PlusCircle size={22} className="me-2" />
                                        Add New Group
                                    </>
                                )}
                            </h5>
                        </Card.Header>
                        <Card.Body>
                            <Form>
                                <Form.Group className="mb-3">
                                    <Form.Label>
                                        Group Name <span style={{ color: "red" }}>*</span>
                                    </Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="groupName"
                                        value={form.groupName}
                                        onChange={handleInputChange}
                                        ref={groupNameRef}
                                        placeholder="Enter group name"
                                        required
                                    />
                                </Form.Group>

                                <Form.Group className="mb-3">
                                    <Form.Label>
                                        Head Name <span style={{ color: "red" }}>*</span>
                                    </Form.Label>
                                    <Form.Select
                                        name="headName"
                                        value={form.headName}
                                        onChange={handleInputChange}
                                        ref={headNameRef}
                                        required
                                    >
                                        <option value="">-- Select Head Name --</option>
                                        {headNames.map((head, idx) => (
                                            <option key={idx} value={head}>
                                                {head}
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
                                                        groupName: "",
                                                        headName: "",
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
                                        {showBlocked ? "Blocked Groups" : "Active Groups"}
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
                                            ? filteredBlockedGroups.length
                                            : filteredActiveGroups.length}
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
                                placeholder="Search by group name or head name..."
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
                                        <th>Group Name</th>
                                        <th style={{ width: "180px" }}>Head Name</th>
                                        <th style={{ width: "160px" }}>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(showBlocked
                                        ? filteredBlockedGroups
                                        : filteredActiveGroups
                                    ).length === 0 ? (
                                        <tr>
                                            <td colSpan={4} style={{ textAlign: "center" }}>
                                                {showBlocked
                                                    ? blockedSearchTerm
                                                        ? "No blocked groups match your search."
                                                        : "No blocked groups."
                                                    : activeSearchTerm
                                                    ? "No active groups match your search."
                                                    : "No active groups. Add a new group to get started."}
                                            </td>
                                        </tr>
                                    ) : (
                                        (showBlocked
                                            ? filteredBlockedGroups
                                            : filteredActiveGroups
                                        ).map((group, idx) => (
                                            <tr
                                                key={group.id}
                                                style={{
                                                    backgroundColor:
                                                        editingId === group.id
                                                            ? "#fff3cd"
                                                            : "transparent",
                                                    fontWeight:
                                                        editingId === group.id ? "var(--font-weight-semibold)" : "normal",
                                                    borderLeft:
                                                        editingId === group.id
                                                            ? "4px solid #ffc107"
                                                            : "none",
                                                }}
                                            >
                                                <td>{idx + 1}</td>
                                                <td><strong>{group.groupName}</strong></td>
                                                <td>
                                                    <span className="badge bg-info" style={{ fontSize: "var(--font-size-sm)" }}>
                                                        {group.headName}
                                                    </span>
                                                </td>
                                                <td>
                                                    {showBlocked ? (
                                                        <Button
                                                            variant="outline-success"
                                                            size="sm"
                                                            onClick={() => handleUnblock(group.id)}
                                                        >
                                                            Unblock
                                                        </Button>
                                                    ) : (
                                                        <>
                                                            {editingId !== group.id ? (
                                                                <>
                                                                    <Button
                                                                        variant="outline-primary"
                                                                        size="sm"
                                                                        className="me-1"
                                                                        onClick={() =>
                                                                            handleEdit(group.id)
                                                                        }
                                                                        disabled={loading}
                                                                    >
                                                                        Edit
                                                                    </Button>
                                                                    <Button
                                                                        variant="outline-danger"
                                                                        size="sm"
                                                                        onClick={() =>
                                                                            handleBlock(group.id)
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

export default GroupsConfig;
