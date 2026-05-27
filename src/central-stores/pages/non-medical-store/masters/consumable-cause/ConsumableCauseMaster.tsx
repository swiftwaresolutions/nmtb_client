import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Card, Button, Table, Form } from "react-bootstrap";
import { useSelector } from "react-redux";
import { RootState } from "../../../../../state/store";
import SearchInput from "../../../../../components/SearchInput";
import { useTableSearch } from "../../../../../hooks/useTableSearch";
import {
    showSuccessToast,
    showErrorToast,
    showValidationError,
} from "../../../../../utils/alertUtil";
import {
    PencilSquare,
    Clock,
    CheckCircle,
    ListCheck,
    ShieldX,
    ArrowRepeat,
} from "react-bootstrap-icons";
import PageHeader from "../../../../../components/PageHeader";
import { faQuestionCircle } from "@fortawesome/free-solid-svg-icons";

interface ConsumableCauseItem {
    id: number;
    name: string;
    description: string;
    blocked: number;
    entDateTime: string;
    uid: number;
}

const ConsumableCauseMaster = () => {
    const navigate = useNavigate();
    const loginData = useSelector((state: RootState) => state.loginData);
    const causeNameRef = useRef<HTMLInputElement>(null);

    // Get sub-module data from session storage
    const [subModuleData, setSubModuleData] = useState<any>(null);
    
    useEffect(() => {
        const storedData = sessionStorage.getItem('selectedStore');
        if (storedData) {
            setSubModuleData(JSON.parse(storedData));
        }
    }, []);

    const [form, setForm] = useState({
        causeName: "",
        description: "",
    });

    const [items, setItems] = useState<ConsumableCauseItem[]>([]);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [showBlocked, setShowBlocked] = useState(false);

    useEffect(() => {
        const savedItems = localStorage.getItem("nonMedicalConsumableCauseItems");
        if (savedItems) {
            setItems(JSON.parse(savedItems));
        }
    }, []);

    useEffect(() => {
        localStorage.setItem("nonMedicalConsumableCauseItems", JSON.stringify(items));
    }, [items]);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddOrUpdate = () => {
        if (!form.causeName.trim()) {
            showValidationError("Cause name is required.");
            setTimeout(() => causeNameRef.current?.focus(), 100);
            return;
        }

        setLoading(true);
        try {
            if (editingId !== null) {
                setItems((prevItems) =>
                    prevItems.map((item) =>
                        item.id === editingId
                            ? {
                                ...item,
                                name: form.causeName,
                                description: form.description,
                            }
                            : item
                    )
                );
                showSuccessToast("Consumable cause updated successfully!");
                setEditingId(null);
            } else {
                const newItem: ConsumableCauseItem = {
                    id: items.length > 0 ? Math.max(...items.map((i) => i.id)) + 1 : 1,
                    name: form.causeName,
                    description: form.description,
                    blocked: 0,
                    entDateTime: new Date().toISOString(),
                    uid: loginData.id || 0,
                };
                setItems([...items, newItem]);
                showSuccessToast("Consumable cause created successfully!");
            }
            setForm({
                causeName: "",
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
                causeName: item.name,
                description: item.description,
            });
            setEditingId(id);
            setTimeout(() => causeNameRef.current?.focus(), 100);
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setForm({
            causeName: "",
            description: "",
        });
    };

    const handleBlock = (id: number) => {
        setItems((prevItems) =>
            prevItems.map((item) => (item.id === id ? { ...item, blocked: 1 } : item))
        );
        showSuccessToast("Consumable cause blocked successfully");
    };

    const handleUnblock = (id: number) => {
        setItems((prevItems) =>
            prevItems.map((item) => (item.id === id ? { ...item, blocked: 0 } : item))
        );
        showSuccessToast("Consumable cause unblocked successfully");
    };

    const activeItems = items.filter((i) => i.blocked === 0);
    const blockedItems = items.filter((i) => i.blocked === 1);

    const {
        filteredData: filteredActiveItems,
        searchTerm: activeSearchTerm,
        setSearchTerm: setActiveSearchTerm,
        resultCount: activeResultCount,
        totalCount: activeTotalCount,
    } = useTableSearch({ data: activeItems, searchFields: ["name", "description"] });

    const {
        filteredData: filteredBlockedItems,
        searchTerm: blockedSearchTerm,
        setSearchTerm: setBlockedSearchTerm,
        resultCount: blockedResultCount,
        totalCount: blockedTotalCount,
    } = useTableSearch({ data: blockedItems, searchFields: ["name", "description"] });

    return (
        <>
                <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", minHeight: 0, overflow: "hidden" }}>
                    <PageHeader icon={faQuestionCircle} title={editingId ? "Edit Consumable Cause" : "Add Consumable Cause"} subtitle="Non-Medical Store" />
                    <div className="content-body" style={{ display: "flex", flex: 1, minHeight: 0, gap: "1rem", overflowX: "hidden", overflowY: "auto" }}>
                <div style={{ display: "flex", flex: "0 0 45%", minWidth: 0, flexDirection: "column" }}>
                    <Card className="shadow-sm" style={{ padding: "2rem", background: "white", borderRadius: "10px", display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
                        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", paddingRight: "8px" }}>
                            <Form>
                                <Form.Group className="mb-3">
                                    <Form.Label>Cause Name <span style={{ color: "red" }}>*</span></Form.Label>
                                    <Form.Control type="text" name="causeName" value={form.causeName} onChange={handleInputChange} ref={causeNameRef} placeholder="Enter cause name" required />
                                </Form.Group>
                                <Form.Group className="mb-3">
                                    <Form.Label>Description</Form.Label>
                                    <Form.Control as="textarea" rows={3} name="description" value={form.description} onChange={handleInputChange} placeholder="Enter cause description" />
                                </Form.Group>
                            </Form>
                        </div>
                        <div className="d-flex justify-content-end gap-2 mt-4" style={{ flexShrink: 0 }}>
                            <Button variant="success" onClick={handleAddOrUpdate} disabled={loading} style={{ minWidth: "150px", fontWeight: "600" }}>
                                {loading ? <><Clock /> Saving...</> : editingId ? <><PencilSquare /> Update Cause</> : <><CheckCircle /> Add Cause</>}
                            </Button>
                            {editingId && (
                                <Button variant="outline-secondary" onClick={handleCancelEdit} disabled={loading} style={{ minWidth: "100px" }}>
                                    Cancel
                                </Button>
                            )}
                        </div>
                    </Card>
                </div>
                <div style={{ display: "flex", flex: "0 0 55%", minWidth: 0, flexDirection: "column" }}>
                    <Card className="shadow-sm" style={{ background: "white", borderRadius: "12px", border: "1px solid #e0e0e0", display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
                        <div style={{ padding: "1.25rem 1.5rem", borderBottom: "2px solid #f0f0f0", background: "linear-gradient(to right, #f8f9fa, #ffffff)", borderTopLeftRadius: "12px", borderTopRightRadius: "12px", flexShrink: 0 }}>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <div className="d-flex align-items-center gap-2">
                                    {showBlocked ? <ShieldX size={22} color="#dc3545" /> : <ListCheck size={22} color="#28a745" />}
                                    <h5 className="mb-0" style={{ fontWeight: "600" }}>
                                        {showBlocked ? "Blocked Causes" : "Active Causes"}
                                    </h5>
                                    <span className="badge" style={{ background: showBlocked ? "#dc3545" : "#28a745", fontSize: "11px", padding: "4px 8px" }}>
                                        {showBlocked ? filteredBlockedItems.length : filteredActiveItems.length}
                                    </span>
                                </div>
                                <Button variant={showBlocked ? "outline-success" : "outline-danger"} size="sm" onClick={() => setShowBlocked(!showBlocked)} style={{ borderRadius: "20px", padding: "6px 16px", fontWeight: "500", display: "flex", alignItems: "center", gap: "6px" }}>
                                    <ArrowRepeat size={16} />
                                    {showBlocked ? "Show Active" : "Show Blocked"}
                                </Button>
                            </div>
                            <SearchInput searchTerm={showBlocked ? blockedSearchTerm : activeSearchTerm} onSearchChange={showBlocked ? setBlockedSearchTerm : setActiveSearchTerm} placeholder="Search causes..." resultCount={showBlocked ? blockedResultCount : activeResultCount} totalCount={showBlocked ? blockedTotalCount : activeTotalCount} showResultCount={true} />
                        </div>
                        <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
                            <Table striped bordered hover>
                                <thead style={{ position: "sticky", top: 0, backgroundColor: "#f8f9fa", zIndex: 10 }}>
                                    <tr>
                                        <th>#</th>
                                        <th>Cause Name</th>
                                        <th>Description</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(showBlocked ? filteredBlockedItems : filteredActiveItems).length === 0 ? (
                                        <tr>
                                            <td colSpan={4} style={{ textAlign: "center" }}>
                                                {showBlocked ? (blockedSearchTerm ? "No blocked causes match your search." : "No blocked causes.") : activeSearchTerm ? "No active causes match your search." : "No active causes."}
                                            </td>
                                        </tr>
                                    ) : (
                                        (showBlocked ? filteredBlockedItems : filteredActiveItems).map((item, idx) => (
                                            <tr key={item.id} style={{ backgroundColor: editingId === item.id ? "#fff3cd" : "transparent", fontWeight: editingId === item.id ? "600" : "normal", borderLeft: editingId === item.id ? "4px solid #ffc107" : "none" }}>
                                                <td>{idx + 1}</td>
                                                <td>
                                                    {item.name}
                                                    {editingId === item.id && <span className="ms-2 badge bg-warning text-dark"><i className="fas fa-edit me-1"></i>Editing</span>}
                                                </td>
                                                <td>{item.description}</td>
                                                <td>
                                                    {showBlocked ? (
                                                        <Button variant="outline-success" size="sm" onClick={() => handleUnblock(item.id)}>Unblock</Button>
                                                    ) : (
                                                        <>
                                                            {editingId !== item.id ? (
                                                                <>
                                                                    <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleEdit(item.id)} disabled={loading}>Edit</Button>
                                                                    <Button variant="outline-danger" size="sm" onClick={() => handleBlock(item.id)}>Block</Button>
                                                                </>
                                                            ) : (
                                                                <span className="text-muted fst-italic">Currently editing...</span>
                                                            )}
                                                        </>
                                                    )}
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </Table>
                        </div>
                    </Card>
                </div>
            </div>
        </div>
        </>
    );
};

export default ConsumableCauseMaster;
