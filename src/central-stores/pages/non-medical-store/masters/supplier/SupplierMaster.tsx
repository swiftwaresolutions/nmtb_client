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
    showErrorModal,
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
import { faTruck } from "@fortawesome/free-solid-svg-icons";
import NonMedicalStoresApiService from "../../../../../api/central-stores/non-medical-stores-api-service";

interface SupplierItem {
    id: number;
    name: string;
    address: string;
    city: string;
    pin: string;
    phone: string;
    openBalance: number;
    email: string;
    web: string;
    fax: string;
    supclass: string;
    state: string;
    dateTime: string;
    uid: number;
    deliveryTime: string;
    paymentTime: string;
    gstNo: string;
    storeId: number;
}

const SupplierMaster = () => {
    const navigate = useNavigate();
    const loginData = useSelector((state: RootState) => state.loginData);
    const supplierNameRef = useRef<HTMLInputElement>(null);

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
        supplierName: "",
        address: "",
        city: "",
        pin: "",
        phone: "",
        openBalance: 0,
        email: "",
        web: "",
        fax: "",
        supclass: "",
        state: "",
        deliveryTime: "",
        paymentTime: "",
        gstNo: "",
    });

    const [items, setItems] = useState<SupplierItem[]>([]);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [showBlocked, setShowBlocked] = useState(false);
    const [blockedIds, setBlockedIds] = useState<number[]>([]);

    useEffect(() => {
        if (subModuleData?.masterId) {
            fetchSuppliers();
        }
    }, [subModuleData]);

    const fetchSuppliers = async () => {
        try {
            setLoading(true);
            const data = await apiService.fetchSuppliersByStoreId(subModuleData?.masterId);
            setItems(data);
        } catch (error) {
            console.error('Error fetching suppliers:', error);
            showErrorToast('Failed to load suppliers');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setForm((prev) => ({ 
            ...prev, 
            [name]: name === 'openBalance' ? parseFloat(value) || 0 : value 
        }));
    };

    const handleAddOrUpdate = async () => {
        if (!form.supplierName.trim()) {
            showValidationError("Supplier name is required.");
            setTimeout(() => supplierNameRef.current?.focus(), 100);
            return;
        }

        setLoading(true);
        try {
            if (editingId !== null) {
                // Update existing supplier
                const updateData = {
                    name: form.supplierName,
                    address: form.address,
                    city: form.city,
                    pin: form.pin,
                    phone: form.phone,
                    openBalance: form.openBalance,
                    email: form.email,
                    web: form.web,
                    fax: form.fax,
                    supclass: form.supclass,
                    state: form.state,
                    deliveryTime: form.deliveryTime,
                    paymentTime: form.paymentTime,
                    gstNo: form.gstNo,
                    storeId: subModuleData.masterId,
                };
                await apiService.updateSupplier(editingId, updateData);
                showSuccessToast("Supplier updated successfully!");
                setEditingId(null);
                fetchSuppliers();
            } else {
                // Save new supplier
                const saveData = {
                    name: form.supplierName,
                    address: form.address,
                    city: form.city,
                    pin: form.pin,
                    phone: form.phone,
                    openBalance: form.openBalance,
                    email: form.email,
                    web: form.web,
                    fax: form.fax,
                    supclass: form.supclass,
                    state: form.state,
                    deliveryTime: form.deliveryTime,
                    paymentTime: form.paymentTime,
                    gstNo: form.gstNo,
                    storeId: subModuleData.masterId,
                };
                console.log('Saving supplier with data:', saveData);
                console.log('Data types:', {
                    openBalance: typeof saveData.openBalance,
                    storeId: typeof saveData.storeId,
                });
                await apiService.saveSupplier(saveData);
                showSuccessToast("Supplier created successfully!");
                fetchSuppliers();
            }
            setForm({
                supplierName: "",
                address: "",
                city: "",
                pin: "",
                phone: "",
                openBalance: 0,
                email: "",
                web: "",
                fax: "",
                supclass: "",
                state: "",
                deliveryTime: "",
                paymentTime: "",
                gstNo: "",
            });
        } catch (error: any) {
            console.error('Error saving supplier:', error);
            const errorMsg = error?.response?.data?.error || error?.message || "Failed to save supplier. Please try again.";
            showErrorModal(errorMsg, "Error Saving Supplier");
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (id: number) => {
        const item = items.find((i) => i.id === id);
        if (item) {
            setForm({
                supplierName: item.name,
                address: item.address,
                city: item.city,
                pin: item.pin,
                phone: item.phone,
                openBalance: item.openBalance,
                email: item.email,
                web: item.web,
                fax: item.fax,
                supclass: item.supclass,
                state: item.state,
                deliveryTime: item.deliveryTime,
                paymentTime: item.paymentTime,
                gstNo: item.gstNo,
            });
            setEditingId(id);
            setTimeout(() => supplierNameRef.current?.focus(), 100);
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        setForm({
            supplierName: "",
            address: "",
            city: "",
            pin: "",
            phone: "",
            openBalance: 0,
            email: "",
            web: "",
            fax: "",
            supclass: "",
            state: "",
            deliveryTime: "",
            paymentTime: "",
            gstNo: "",
        });
    };

    const handleBlock = async (id: number) => {
        try {
            setLoading(true);
            await apiService.blockSupplier({ id, blockedUid: loginData.id || 0 });
            setBlockedIds([...blockedIds, id]);
            showSuccessToast("Supplier blocked successfully");
        } catch (error) {
            console.error('Error blocking supplier:', error);
            showErrorToast('Failed to block supplier');
        } finally {
            setLoading(false);
        }
    };

    const handleUnblock = async (id: number) => {
        try {
            setLoading(true);
            await apiService.unblockSupplier({ id, uid: loginData.id || 0 });
            setBlockedIds(blockedIds.filter(blockedId => blockedId !== id));
            showSuccessToast("Supplier unblocked successfully");
        } catch (error) {
            console.error('Error unblocking supplier:', error);
            showErrorToast('Failed to unblock supplier');
        } finally {
            setLoading(false);
        }
    };

    const activeItems = items.filter((i) => !blockedIds.includes(i.id));
    const blockedItems = items.filter((i) => blockedIds.includes(i.id));

    const {
        filteredData: filteredActiveItems,
        searchTerm: activeSearchTerm,
        setSearchTerm: setActiveSearchTerm,
        resultCount: activeResultCount,
        totalCount: activeTotalCount,
    } = useTableSearch({ data: activeItems, searchFields: ["name", "city", "phone", "gstNo"] });

    const {
        filteredData: filteredBlockedItems,
        searchTerm: blockedSearchTerm,
        setSearchTerm: setBlockedSearchTerm,
        resultCount: blockedResultCount,
        totalCount: blockedTotalCount,
    } = useTableSearch({ data: blockedItems, searchFields: ["name", "city", "phone", "gstNo"] });

    return (
        <>
                <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", minHeight: 0, overflow: "hidden" }}>
                    <PageHeader icon={faTruck} title={editingId ? "Edit Supplier" : "Add Supplier"} subtitle="Non-Medical Store" />
                    <div className="content-body" style={{ display: "flex", flex: 1, minHeight: 0, gap: "1rem", overflowX: "hidden", overflowY: "auto" }}>
                <div style={{ display: "flex", flex: "0 0 45%", minWidth: 0, flexDirection: "column" }}>
                    <Card className="shadow-sm" style={{ padding: "2rem", background: "white", borderRadius: "10px", display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
                        <div style={{ flex: 1, minHeight: 0, overflowY: "auto", paddingRight: "8px" }}>
                            <Form>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Supplier Name <span style={{ color: "red" }}>*</span></Form.Label>
                                            <Form.Control type="text" name="supplierName" value={form.supplierName} onChange={handleInputChange} ref={supplierNameRef} placeholder="Enter supplier name" required />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>City</Form.Label>
                                            <Form.Control type="text" name="city" value={form.city} onChange={handleInputChange} placeholder="Enter city" />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>State</Form.Label>
                                            <Form.Control type="text" name="state" value={form.state} onChange={handleInputChange} placeholder="Enter state" />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>PIN Code</Form.Label>
                                            <Form.Control type="text" name="pin" value={form.pin} onChange={handleInputChange} placeholder="Enter PIN code" />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Form.Group className="mb-3">
                                    <Form.Label>Address</Form.Label>
                                    <Form.Control as="textarea" rows={2} name="address" value={form.address} onChange={handleInputChange} placeholder="Enter supplier address" />
                                </Form.Group>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Phone</Form.Label>
                                            <Form.Control type="text" name="phone" value={form.phone} onChange={handleInputChange} placeholder="Enter phone number" />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Email</Form.Label>
                                            <Form.Control type="email" name="email" value={form.email} onChange={handleInputChange} placeholder="Enter email address" />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Web</Form.Label>
                                            <Form.Control type="text" name="web" value={form.web} onChange={handleInputChange} placeholder="Enter website" />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Fax</Form.Label>
                                            <Form.Control type="text" name="fax" value={form.fax} onChange={handleInputChange} placeholder="Enter fax number" />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>GST Number</Form.Label>
                                            <Form.Control type="text" name="gstNo" value={form.gstNo} onChange={handleInputChange} placeholder="Enter GST number" />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Supplier Class</Form.Label>
                                            <Form.Control type="text" name="supclass" value={form.supclass} onChange={handleInputChange} placeholder="Enter supplier class" />
                                        </Form.Group>
                                    </Col>
                                </Row>
                                <Row>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Open Balance</Form.Label>
                                            <Form.Control type="number" name="openBalance" value={form.openBalance} onChange={handleInputChange} placeholder="Enter opening balance" />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Delivery Time</Form.Label>
                                            <Form.Control type="text" name="deliveryTime" value={form.deliveryTime} onChange={handleInputChange} placeholder="e.g., 7 days" />
                                        </Form.Group>
                                    </Col>
                                    <Col md={4}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Payment Time</Form.Label>
                                            <Form.Control type="text" name="paymentTime" value={form.paymentTime} onChange={handleInputChange} placeholder="e.g., 30 days" />
                                        </Form.Group>
                                    </Col>
                                </Row>
                            </Form>
                        </div>
                        <div className="d-flex justify-content-end gap-2 mt-4" style={{ flexShrink: 0 }}>
                            <Button variant="success" onClick={handleAddOrUpdate} disabled={loading} style={{ minWidth: "150px", fontWeight: "600" }}>
                                {loading ? <><Clock /> Saving...</> : editingId ? <><PencilSquare /> Update Supplier</> : <><CheckCircle /> Add Supplier</>}
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
                                        {showBlocked ? "Blocked Suppliers" : "Active Suppliers"}
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
                            <SearchInput searchTerm={showBlocked ? blockedSearchTerm : activeSearchTerm} onSearchChange={showBlocked ? setBlockedSearchTerm : setActiveSearchTerm} placeholder="Search suppliers..." resultCount={showBlocked ? blockedResultCount : activeResultCount} totalCount={showBlocked ? blockedTotalCount : activeTotalCount} showResultCount={true} />
                        </div>
                        <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
                            <Table striped bordered hover>
                                <thead style={{ position: "sticky", top: 0, backgroundColor: "#f8f9fa", zIndex: 10 }}>
                                    <tr>
                                        <th>#</th>
                                        <th>Supplier Name</th>
                                        <th>City</th>
                                        <th>Phone</th>
                                        <th>GST Number</th>
                                        <th>Actions</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {(showBlocked ? filteredBlockedItems : filteredActiveItems).length === 0 ? (
                                        <tr>
                                            <td colSpan={6} style={{ textAlign: "center" }}>
                                                {showBlocked ? (blockedSearchTerm ? "No blocked suppliers match your search." : "No blocked suppliers.") : activeSearchTerm ? "No active suppliers match your search." : "No active suppliers."}
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
                                                <td>{item.city}</td>
                                                <td>{item.phone}</td>
                                                <td>{item.gstNo}</td>
                                                <td>
                                                    {showBlocked ? (
                                                        <Button variant="outline-success" size="sm" onClick={() => handleUnblock(item.id)}>Unblock</Button>
                                                    ) : (
                                                        <>
                                                            {editingId !== item.id ? (
                                                                <>
                                                                    <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleEdit(item.id)} disabled={loading}>Edit</Button>
                                                                    {/* <Button variant="outline-danger" size="sm" onClick={() => handleBlock(item.id)}>Block</Button> */}
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

export default SupplierMaster;
