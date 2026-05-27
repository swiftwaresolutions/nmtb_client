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
import { faLayerGroup } from "@fortawesome/free-solid-svg-icons";

interface GroupItem {
    id: number;
    name: string;
    blocked: number;
    entDateTime: string;
    uid: number;
}

const GroupMaster = () => {
    const navigate = useNavigate();
    const loginData = useSelector((state: RootState) => state.loginData);

    // Refs for input fields to enable focus on validation errors
    const groupNameRef = useRef<HTMLInputElement>(null);

    const [form, setForm] = useState({
        groupName: "",
    });

    const [items, setItems] = useState<GroupItem[]>([
        {
            id: 1,
            name: "X-Ray Films",
            blocked: 0,
            entDateTime: new Date().toISOString(),
            uid: 0,
        },
        {
            id: 2,
            name: "Contrast Media",
            blocked: 0,
            entDateTime: new Date().toISOString(),
            uid: 0,
        },
        {
            id: 3,
            name: "Medical Supplies",
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
        const savedItems = localStorage.getItem("groupItems");
        if (savedItems) {
            setItems(JSON.parse(savedItems));
        }
    }, []);

    // Save items to localStorage whenever items change
    useEffect(() => {
        localStorage.setItem("groupItems", JSON.stringify(items));
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
        if (!form.groupName.trim()) {
            showValidationError("Group name is required.");
            setTimeout(() => groupNameRef.current?.focus(), 100);
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
                                name: form.groupName,
                            }
                            : item
                    )
                );
                showSuccessToast("Group updated successfully!");
                setEditingId(null);
            } else {
                // Add new item
                const newItem: GroupItem = {
                    id: items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1,
                    name: form.groupName,
                    blocked: 0,
                    entDateTime: new Date().toISOString(),
                    uid: loginData.id || 0,
                };
                setItems([...items, newItem]);
                showSuccessToast("Group created successfully!");
            }

            // Reset form
            setForm({
                groupName: "",
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
                groupName: item.name,
            });
            setEditingId(id);
        }
    };

    const handleCancelEdit = () => {
        setForm({
            groupName: "",
        });
        setEditingId(null);
    };

    const handleBlock = (id: number) => {
        setItems((prevItems) =>
            prevItems.map((item) =>
                item.id === id ? { ...item, blocked: 1 } : item
            )
        );
        showSuccessToast("Group blocked successfully");
    };

    const handleUnblock = (id: number) => {
        setItems((prevItems) =>
            prevItems.map((item) =>
                item.id === id ? { ...item, blocked: 0 } : item
            )
        );
        showSuccessToast("Group unblocked successfully");
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
        searchFields: ["name"],
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
        searchFields: ["name"],
    });

    return (
        <Container fluid className="p-4">
            <PageHeader
                icon={faLayerGroup}
                title={
                    editingId
                        ? "Edit Group Master"
                        : "Add Group Master"
                }
                subtitle={
                    editingId
                        ? "Update group details for radiology inventory"
                        : "Create new group for radiology department"
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
                                {/* Row 1: Group Name */}
                                <Row>
                                    <Col md={12}>
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
                                                    <PencilSquare /> Update Group
                                                </>
                                            ) : (
                                                <>
                                                    <CheckCircle /> Create Group
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
                                placeholder="Search groups by name..."
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
                                        <th>Group Name</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(showBlocked
                                        ? filteredBlockedItems
                                        : filteredActiveItems
                                    ).length === 0 ? (
                                        <tr>
                                            <td colSpan={3} style={{ textAlign: "center" }}>
                                                {showBlocked
                                                    ? blockedSearchTerm
                                                        ? "No blocked groups match your search."
                                                        : "No blocked groups."
                                                    : activeSearchTerm
                                                        ? "No active groups match your search."
                                                        : "No active groups."}
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

export default GroupMaster;
