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
import { faBuilding } from "@fortawesome/free-solid-svg-icons";
import NonMedicalStoresApiService from "../../../../../api/central-stores/non-medical-stores-api-service";

interface CompanyItem {
    id: number;
    name: string;
    code: string;
    address: string;
    city: string;
    pin: string;
    phone: string;
    email: string;
    web: string;
    fax: string;
    state: string;
    dateTime: string;
    uid: number;
    storeId: number;
}

const CompanyMaster = () => {
    const navigate = useNavigate();
    const loginData = useSelector((state: RootState) => state.loginData);
    const companyNameRef = useRef<HTMLInputElement>(null);
    const apiService = new NonMedicalStoresApiService();

    // Get sub-module data from session storage
    const [subModuleData, setSubModuleData] = useState<any>(null);
    
    useEffect(() => {
        const storedData = sessionStorage.getItem('selectedStore');
        if (storedData) {
            setSubModuleData(JSON.parse(storedData));
        }
    }, []);

    const [form, setForm] = useState({
        companyName: "",
        code: "",
        address: "",
        city: "",
        pin: "",
        phone: "",
        email: "",
        web: "",
        fax: "",
        state: "",
    });

    const [items, setItems] = useState<CompanyItem[]>([]);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [showBlocked, setShowBlocked] = useState(false);

    useEffect(() => {
        if (subModuleData?.masterId) {
            fetchCompanies();
        }
    }, [subModuleData]);

    const fetchCompanies = async () => {
        try {
            setLoading(true);
            const data = await apiService.fetchCompaniesByStoreId(subModuleData?.masterId);
            setItems(data);
        } catch (error) {
            console.error('Error fetching companies:', error);
            showErrorToast('Failed to load companies');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ ...prev, [name]: value }));
    };

    const handleAddOrUpdate = async () => {
        if (!form.companyName.trim()) {
            showValidationError("Company name is required.");
            setTimeout(() => companyNameRef.current?.focus(), 100);
            return;
        }

        if (!subModuleData?.masterId) {
            showErrorToast("Store information is missing. Please reload the page.");
            return;
        }

        setLoading(true);
        try {
            if (editingId !== null) {
                // Update existing company
                const updateData = {
                    name: form.companyName,
                    code: form.code,
                    address: form.address,
                    city: form.city,
                    pin: form.pin,
                    phone: form.phone,
                    email: form.email,
                    web: form.web,
                    fax: form.fax,
                    state: form.state,
                    storeId: subModuleData.masterId,
                };
                await apiService.updateCompany(editingId, updateData);
                showSuccessToast("Company updated successfully!");
                setEditingId(null);
            } else {
                // Save new company
                const saveData = {
                    name: form.companyName,
                    code: form.code,
                    address: form.address,
                    city: form.city,
                    pin: form.pin,
                    phone: form.phone,
                    email: form.email,
                    web: form.web,
                    fax: form.fax,
                    state: form.state,
                    storeId: subModuleData.masterId,
                };
                await apiService.saveCompany(saveData);
                showSuccessToast("Company created successfully!");
            }
            // Reset form
            setForm({
                companyName: "",
                code: "",
                address: "",
                city: "",
                pin: "",
                phone: "",
                email: "",
                web: "",
                fax: "",
                state: "",
            });
            // Refresh list
            fetchCompanies();
        } catch (error: any) {
            console.error('Error saving company:', error);
            showErrorToast(error?.response?.data?.error || "Failed to save company. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (id: number) => {
        const item = items.find((i) => i.id === id);
        if (item) {
            setForm({
                companyName: item.name,
                code: item.code,
                address: item.address,
                city: item.city,
                pin: item.pin,
                phone: item.phone,
                email: item.email,
                web: item.web,
                fax: item.fax,
                state: item.state,
            });
            setEditingId(id);
            setTimeout(() => companyNameRef.current?.focus(), 100);
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setForm({
            companyName: "",
            code: "",
            address: "",
            city: "",
            pin: "",
            phone: "",
            email: "",
            web: "",
            fax: "",
            state: "",
        });
    };

    const handleBlock = async (id: number) => {
        try {
            setLoading(true);
            await apiService.blockCompany({ id, blockedUid: loginData.id || 0 });
            setBlockedIds([...blockedIds, id]);
            showSuccessToast("Company blocked successfully");
        } catch (error) {
            console.error('Error blocking company:', error);
            showErrorToast('Failed to block company');
        } finally {
            setLoading(false);
        }
    };

    const handleUnblock = async (id: number) => {
        try {
            setLoading(true);
            await apiService.unblockCompany({ id, uid: loginData.id || 0 });
            setBlockedIds(blockedIds.filter(blockedId => blockedId !== id));
            showSuccessToast("Company unblocked successfully");
        } catch (error) {
            console.error('Error unblocking company:', error);
            showErrorToast('Failed to unblock company');
        } finally {
            setLoading(false);
        }
    };

    const [blockedIds, setBlockedIds] = useState<number[]>([]);

    const activeItems = items.filter((i) => !blockedIds.includes(i.id));
    const blockedItems = items.filter((i) => blockedIds.includes(i.id));

    const {
        filteredData: filteredActiveItems,
        searchTerm: activeSearchTerm,
        setSearchTerm: setActiveSearchTerm,
        resultCount: activeResultCount,
        totalCount: activeTotalCount,
    } = useTableSearch({ data: activeItems, searchFields: ["name", "code", "city", "phone"] });

    const {
        filteredData: filteredBlockedItems,
        searchTerm: blockedSearchTerm,
        setSearchTerm: setBlockedSearchTerm,
        resultCount: blockedResultCount,
        totalCount: blockedTotalCount,
    } = useTableSearch({ data: blockedItems, searchFields: ["name", "code", "city", "phone"] });

    return (
        <>
                <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", minHeight: 0, overflow: "hidden" }}>
                    <PageHeader icon={faBuilding} title={editingId ? "Edit Company" : "Add Company"} subtitle="Non-Medical Store" />
                    <div className="content-body" style={{ display: "flex", flex: 1, minHeight: 0, gap: "1rem", overflowX: "hidden", overflowY: "auto" }}>
                <div style={{ display: "flex", flex: "0 0 45%", minWidth: 0, flexDirection: "column" }}>
                    <Card className="shadow-sm" style={{ padding: "2rem", background: "white", borderRadius: "10px", display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
                        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", paddingRight: "8px" }}>
                            <Form>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Company Name <span style={{ color: "red" }}>*</span></Form.Label>
                                            <Form.Control type="text" name="companyName" value={form.companyName} onChange={handleInputChange} ref={companyNameRef} placeholder="Enter company name" required />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Code</Form.Label>
                                            <Form.Control type="text" name="code" value={form.code} onChange={handleInputChange} placeholder="Enter company code" />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Form.Group className="mb-3">
                                    <Form.Label>Address</Form.Label>
                                    <Form.Control as="textarea" rows={2} name="address" value={form.address} onChange={handleInputChange} placeholder="Enter company address" />
                                </Form.Group>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>City</Form.Label>
                                            <Form.Control type="text" name="city" value={form.city} onChange={handleInputChange} placeholder="Enter city" />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>State</Form.Label>
                                            <Form.Control type="text" name="state" value={form.state} onChange={handleInputChange} placeholder="Enter state" />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>PIN Code</Form.Label>
                                            <Form.Control type="text" name="pin" value={form.pin} onChange={handleInputChange} placeholder="Enter PIN code" />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Phone</Form.Label>
                                            <Form.Control type="text" name="phone" value={form.phone} onChange={handleInputChange} placeholder="Enter phone number" />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Email</Form.Label>
                                            <Form.Control type="email" name="email" value={form.email} onChange={handleInputChange} placeholder="Enter email address" />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Website</Form.Label>
                                            <Form.Control type="text" name="web" value={form.web} onChange={handleInputChange} placeholder="Enter website URL" />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Form.Group className="mb-3">
                                    <Form.Label>Fax</Form.Label>
                                    <Form.Control type="text" name="fax" value={form.fax} onChange={handleInputChange} placeholder="Enter fax number" />
                                </Form.Group>
                            </Form>
                        </div>
                        <div className="d-flex justify-content-end gap-2 mt-4" style={{ flexShrink: 0 }}>
                            <Button variant="success" onClick={handleAddOrUpdate} disabled={loading} style={{ minWidth: "150px", fontWeight: "600" }}>
                                {loading ? <><Clock /> Saving...</> : editingId ? <><PencilSquare /> Update Company</> : <><CheckCircle /> Add Company</>}
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
                                        {showBlocked ? "Blocked Companies" : "Active Companies"}
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
                            <SearchInput searchTerm={showBlocked ? blockedSearchTerm : activeSearchTerm} onSearchChange={showBlocked ? setBlockedSearchTerm : setActiveSearchTerm} placeholder="Search companies..." resultCount={showBlocked ? blockedResultCount : activeResultCount} totalCount={showBlocked ? blockedTotalCount : activeTotalCount} showResultCount={true} />
                        </div>
                        <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
                            <Table striped bordered hover>
                                <thead style={{ position: "sticky", top: 0, backgroundColor: "#f8f9fa", zIndex: 10 }}>
                                    <tr>
                                        <th>#</th>
                                        <th>Company Name</th>
                                        <th>Code</th>
                                        <th>City</th>
                                        <th>Phone</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(showBlocked ? filteredBlockedItems : filteredActiveItems).length === 0 ? (
                                        <tr>
                                            <td colSpan={6} style={{ textAlign: "center" }}>
                                                {showBlocked ? (blockedSearchTerm ? "No blocked companies match your search." : "No blocked companies.") : activeSearchTerm ? "No active companies match your search." : "No active companies."}
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
                                                <td>{item.code}</td>
                                                <td>{item.city}</td>
                                                <td>{item.phone}</td>
                                                <td>
                                                    {showBlocked ? (
                                                        <Button variant="outline-success" size="sm" onClick={() => handleUnblock(item.id)}>Unblock</Button>
                                                    ) : (
                                                        <>
                                                            {editingId !== item.id ? (
                                                                <>
                                                                    <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleEdit(item.id)} disabled={loading}>Edit</Button>
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

export default CompanyMaster;
