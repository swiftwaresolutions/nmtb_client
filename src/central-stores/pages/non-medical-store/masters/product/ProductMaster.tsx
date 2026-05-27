import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { Row, Col, Card, Button, Table, Form } from "react-bootstrap";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../../../../../state/store";
import SearchInput from "../../../../../components/SearchInput";
import { useTableSearch } from "../../../../../hooks/useTableSearch";
import {
    showSuccessToast,
    showErrorToast,
    showValidationError,
    showConfirmDialog,
} from "../../../../../utils/alertUtil";
import {
    PencilSquare,
    Clock,
    CheckCircle,
    ListCheck,
    ShieldX,
    ArrowRepeat,
    XCircle,
    ChevronLeft,
} from "react-bootstrap-icons";
import PageHeader from "../../../../../components/PageHeader";
import { faBox } from "@fortawesome/free-solid-svg-icons";
import { handleError } from "../../../../../utils/errorUtil";
import NonMedicalStoresApiService, {
    ProductResponse,
    GroupResponse,
    CompanyResponse,
    ProductCategoryResponse,
    ProductFormResponse,
    ProductUnitResponse,
} from "../../../../../api/central-stores/non-medical-stores-api-service";
import { routerPathNames } from "../../../../../routes/routerPathNames";

const ProductMaster = () => {
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const loginData = useSelector((state: RootState) => state.loginData);

    // Refs for input focus
    const productNameRef = useRef<HTMLInputElement>(null);
    const medCodeRef = useRef<HTMLInputElement>(null);
    const companyRef = useRef<HTMLSelectElement>(null);

    // Get sub-module data from session storage
    const [subModuleData, setSubModuleData] = useState<any>(null);

    useEffect(() => {
        const storedData = sessionStorage.getItem('selectedStore');
        if (storedData) {
            setSubModuleData(JSON.parse(storedData));
        }
    }, []);

    // Form state with all Product API fields
    const [form, setForm] = useState({
        name: "",
        medCode: "",
        genericId: 0,
        companyId: "",
        description: "",
        formId: "",
        strength: "",
        strengthUnit: "mg",
        unitsId: "",
        shelf: "",
        rack: "",
        min: "",
        max: "",
        safe: "",
        eoq: "",
        isNonStockable: "N",
        ownStock: 0,
        isactive: "Y",
        categoryId: "",
        dosageOral: "",
        dosageIm: "",
        dosageIv: "",
        schedule: "",
        strips: "",
        quantity: "",
        unitId: "",
        looseSale: "N",
        groupId: "",
        subDivId: 0,
        hsnCode: "",
    });

    const [items, setItems] = useState<ProductResponse[]>([]);
    const [groups, setGroups] = useState<GroupResponse[]>([]);
    const [companies, setCompanies] = useState<CompanyResponse[]>([]);
    const [categories, setCategories] = useState<ProductCategoryResponse[]>([]);
    const [forms, setForms] = useState<ProductFormResponse[]>([]);
    const [units, setUnits] = useState<ProductUnitResponse[]>([]);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [loading, setLoading] = useState(false);
    const [dataLoading, setDataLoading] = useState(true);
    const [showBlocked, setShowBlocked] = useState(false);

    const apiService = new NonMedicalStoresApiService();

    // Fetch data on mount
    useEffect(() => {
        if (subModuleData?.masterId) {
            fetchData();
        }
    }, [subModuleData]);

    const fetchData = async () => {
        setDataLoading(true);
        try {
            const phModId = subModuleData?.masterId || 1;
            const storeId = subModuleData?.masterId || 1;
            console.log("Fetching products with phModId:", phModId);

            // Fetch products, groups, companies, categories, forms, and units in parallel
            const [productsData, groupsData, companiesData, categoriesData, formsData, unitsData] = await Promise.all([
                apiService.fetchAllProducts(phModId),
                apiService.fetchGroupsByStoreId(storeId),
                apiService.fetchCompaniesByStoreId(storeId),
                apiService.fetchAllProductCategories(),
                apiService.fetchAllProductForms(),
                apiService.fetchAllProductUnits(),
            ]);

            console.log("Products fetched:", productsData);
            setItems(productsData || []);
            setGroups(groupsData || []);
            setCompanies(companiesData || []);
            setCategories(categoriesData || []);
            setForms(formsData || []);
            setUnits(unitsData || []);
        } catch (error) {
            console.error("Error fetching data:", error);
            handleError(dispatch, error);
            showErrorToast("Failed to load data. Please try again.");
        } finally {
            setDataLoading(false);
        }
    };

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const target = e.target;
        const { name, value, type } = target;
        setForm((prev) => ({
            ...prev,
            [name]: type === "checkbox" ? (target as HTMLInputElement).checked ? "Y" : "N" : value,
        }));
    };

    const handleAddOrUpdate = async () => {
        // Validation
        if (!form.name.trim()) {
            showValidationError("Product name is required.");
            setTimeout(() => productNameRef.current?.focus(), 100);
            return;
        }
        if (!form.medCode.trim()) {
            showValidationError("Product code is required.");
            setTimeout(() => medCodeRef.current?.focus(), 100);
            return;
        }
        if (!form.companyId) {
            showValidationError("Please select a company.");
            setTimeout(() => companyRef.current?.focus(), 100);
            return;
        }

        setLoading(true);
        try {
            const phModId = subModuleData?.masterId || 1;
            
            const payload = {
                name: form.name,
                medCode: form.medCode,
                genericId: Number(form.genericId) || 0,
                companyId: Number(form.companyId),
                description: form.description || "",
                formId: Number(form.formId) || 0,
                strength: Number(form.strength) || 0,
                unitsId: Number(form.unitId) || 0,
                shelf: Number(form.shelf) || 0,
                rack: form.rack || "",
                min: Number(form.min) || 0,
                max: Number(form.max) || 0,
                safe: Number(form.safe) || 0,
                eoq: Number(form.eoq) || 0,
                isNonStockable: form.isNonStockable === "Y" ? 1 : 0,
                ownStock: Number(form.ownStock) || 0,
                isactive: form.isactive === "Y" ? 1 : 0,
                userlog: String(loginData.id || 0),
                categoryId: Number(form.categoryId) || 0,
                action: "save",
                dosageOral: form.dosageOral || "",
                dosageIm: form.dosageIm || "",
                dosageIv: form.dosageIv || "",
                schedule: Number(form.schedule) || 0,
                strips: form.strips || "",
                quantity: Number(form.quantity) || 0,
                unitId: String(form.unitId || ""),
                looseSale: form.looseSale === "Y" ? 1 : 0,
                groupId: Number(form.groupId) || 0,
                subDivId: Number(form.subDivId) || 0,
                phModId: phModId,
                hsnCode: form.hsnCode || "",
                blockUid: 0,
                blockReason: "",
            };

            console.log("Save Product Payload:", JSON.stringify(payload, null, 2));

            if (editingId !== null) {
                // Update API - backend expects Byte (0/1) for boolean fields
                const updatePayload = {
                    name: form.name,
                    medCode: form.medCode,
                    genericId: Number(form.genericId) || 0,
                    companyId: Number(form.companyId),
                    description: form.description || "",
                    formId: Number(form.formId) || 0,
                    strength: Number(form.strength) || 0,
                    unitsId: Number(form.unitId) || 0,
                    shelf: Number(form.shelf) || 0,
                    rack: form.rack || "",
                    min: Number(form.min) || 0,
                    max: Number(form.max) || 0,
                    safe: Number(form.safe) || 0,
                    eoq: Number(form.eoq) || 0,
                    isNonStockable: form.isNonStockable === "Y" ? 1 : 0,
                    ownStock: Number(form.ownStock) || 0,
                    isactive: form.isactive === "Y" ? 1 : 0,
                    userlog: String(loginData.id || 0),
                    categoryId: Number(form.categoryId) || 0,
                    action: "update",
                    dosageOral: form.dosageOral || "",
                    dosageIm: form.dosageIm || "",
                    dosageIv: form.dosageIv || "",
                    schedule: Number(form.schedule) || 0,
                    strips: form.strips || "",
                    quantity: Number(form.quantity) || 0,
                    unitId: String(form.unitId || ""),
                    looseSale: form.looseSale === "Y" ? 1 : 0,
                    groupId: Number(form.groupId) || 0,
                    subDivId: Number(form.subDivId) || 0,
                    phModId: phModId,
                    hsnCode: form.hsnCode || "",
                    blockUid: 0,
                    blockReason: "",
                };
                console.log("Update Product Payload:", JSON.stringify(updatePayload, null, 2));
                await apiService.updateProduct(editingId, updatePayload);
                showSuccessToast("Product updated successfully!");
                setEditingId(null);
            } else {
                await apiService.saveProduct(payload);
                showSuccessToast("Product created successfully!");
            }

            // Reset form
            resetForm();
            // Refresh data
            fetchData();
        } catch (error: any) {
            console.error("Error saving product:", error);
            handleError(dispatch, error);
            showErrorToast(error?.response?.data?.error || "Failed to save product. Please try again.");
        } finally {
            setLoading(false);
        }
    };

    const resetForm = () => {
        setForm({
            name: "",
            medCode: "",
            genericId: 0,
            companyId: "",
            description: "",
            formId: "",
            strength: "",
            strengthUnit: "mg",
            unitsId: "",
            shelf: "",
            rack: "",
            min: "",
            max: "",
            safe: "",
            eoq: "",
            isNonStockable: "N",
            ownStock: 0,
            isactive: "Y",
            categoryId: "",
            dosageOral: "",
            dosageIm: "",
            dosageIv: "",
            schedule: "",
            strips: "",
            quantity: "",
            unitId: "",
            looseSale: "N",
            groupId: "",
            subDivId: 0,
            hsnCode: "",
        });
    };

    const handleEdit = (id: number) => {
        const item = items.find((i) => i.id === id);
        if (item) {
            setForm({
                name: item.name || "",
                medCode: item.medCode || "",
                genericId: item.genericId || 0,
                companyId: String(item.companyId || ""),
                description: item.description || "",
                formId: String(item.formId || ""),
                strength: String(item.strength || ""),
                strengthUnit: "mg",
                unitsId: String(item.unitsId || ""),
                shelf: String(item.shelf || ""),
                rack: item.rack || "",
                min: String(item.min || ""),
                max: String(item.max || ""),
                safe: String(item.safe || ""),
                eoq: String(item.eoq || ""),
                isNonStockable: item.isNonStockable === 1 || item.isNonStockable === "Y" ? "Y" : "N",
                ownStock: item.ownStock || 0,
                isactive: item.isactive === 1 || item.isactive === "Y" ? "Y" : "N",
                categoryId: String(item.categoryId || ""),
                dosageOral: item.dosageOral || "",
                dosageIm: item.dosageIm || "",
                dosageIv: item.dosageIv || "",
                schedule: String(item.schedule || ""),
                strips: String(item.strips || ""),
                quantity: String(item.quantity || ""),
                unitId: String(item.unitId || ""),
                looseSale: item.looseSale === 1 || item.looseSale === "Y" ? "Y" : "N",
                groupId: String(item.groupId || ""),
                subDivId: item.subDivId || 0,
                hsnCode: item.hsnCode || "",
            });
            setEditingId(id);
            setTimeout(() => productNameRef.current?.focus(), 100);
        }
    };

    const handleCancelEdit = () => {
        setEditingId(null);
        resetForm();
    };

    const handleBlock = async (id: number) => {
        const result = await showConfirmDialog(
            "Are you sure you want to block this product?",
            "Confirm Block",
            "Yes, Block",
            "Cancel"
        );
        if (!result.isConfirmed) return;

        try {
            setLoading(true);
            await apiService.blockProduct({ id, blockedUid: loginData.id || 0 });
            showSuccessToast("Product blocked successfully");
            fetchData();
        } catch (error) {
            console.error("Error blocking product:", error);
            handleError(dispatch, error);
            showErrorToast("Failed to block product");
        } finally {
            setLoading(false);
        }
    };

    const handleUnblock = async (id: number) => {
        try {
            setLoading(true);
            await apiService.unblockProduct({ id, uid: loginData.id || 0 });
            showSuccessToast("Product unblocked successfully");
            fetchData();
        } catch (error) {
            console.error("Error unblocking product:", error);
            handleError(dispatch, error);
            showErrorToast("Failed to unblock product");
        } finally {
            setLoading(false);
        }
    };

    // Filter items based on blocked status (API returns 1/0 for isactive)
    const activeItems = items.filter((item) => item.isactive === 1 || item.isactive === "Y");
    const blockedItems = items.filter((item) => item.isactive === 0 || item.isactive === "N");

    const {
        filteredData: filteredActiveItems,
        searchTerm: activeSearchTerm,
        setSearchTerm: setActiveSearchTerm,
        resultCount: activeResultCount,
        totalCount: activeTotalCount,
    } = useTableSearch({ data: activeItems, searchFields: ["name", "medCode"] });

    const {
        filteredData: filteredBlockedItems,
        searchTerm: blockedSearchTerm,
        setSearchTerm: setBlockedSearchTerm,
        resultCount: blockedResultCount,
        totalCount: blockedTotalCount,
    } = useTableSearch({ data: blockedItems, searchFields: ["name", "medCode"] });

    // Get company name helper
    const getCompanyName = (companyId: number) => {
        const company = companies.find(c => c.id === companyId);
        return company?.name || "-";
    };

    // Loading state
    if (dataLoading) {
        return (
            <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100%" }}>
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    return (
        <>
                <div style={{ display: "flex", flexDirection: "column", height: "100%", width: "100%", minHeight: 0, overflow: "hidden" }}>
                    <PageHeader 
                        icon={faBox} 
                        title={editingId ? "Edit Product" : "Add Product"} 
                        subtitle="Non-Medical Store"
                        badges={[
                            { label: "Active", value: activeItems.length },
                            { label: "Blocked", value: blockedItems.length },
                            { label: "Total", value: items.length }
                        ]}
                    />
                    <div className="content-body" style={{ display: "flex", flex: 1, minHeight: 0, gap: "1rem", overflowX: "hidden", overflowY: "auto" }}>
                        {/* Form Section - 45% */}
                        <div style={{ display: "flex", flex: "0 0 45%", minWidth: 0, flexDirection: "column" }}>
                            <Card className="shadow-sm" style={{ padding: "1.5rem", background: "white", borderRadius: "10px", display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
                                <div style={{ flex: 1, minHeight: 0, overflowY: "auto", paddingRight: "8px" }}>
                                    <Form>
                                        {/* Row 1: Name & Code */}
                                        <Row className="mb-3">
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label>Product Name <span style={{ color: "red" }}>*</span></Form.Label>
                                                    <Form.Control 
                                                        type="text" 
                                                        name="name" 
                                                        value={form.name} 
                                                        onChange={handleInputChange} 
                                                        ref={productNameRef} 
                                                        placeholder="Enter product name" 
                                                        required 
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label>Product Code <span style={{ color: "red" }}>*</span></Form.Label>
                                                    <Form.Control 
                                                        type="text" 
                                                        name="medCode" 
                                                        value={form.medCode} 
                                                        onChange={handleInputChange}
                                                        ref={medCodeRef}
                                                        placeholder="Enter product code" 
                                                        required 
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        {/* Row 2: Company & Group */}
                                        <Row className="mb-3">
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label>Company <span style={{ color: "red" }}>*</span></Form.Label>
                                                    <Form.Select 
                                                        name="companyId" 
                                                        value={form.companyId} 
                                                        onChange={handleInputChange}
                                                        ref={companyRef}
                                                        required
                                                    >
                                                        <option value="">-- Select Company --</option>
                                                        {companies.map((company) => (
                                                            <option key={company.id} value={company.id}>{company.name}</option>
                                                        ))}
                                                    </Form.Select>
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label>Group</Form.Label>
                                                    <Form.Select 
                                                        name="groupId" 
                                                        value={form.groupId} 
                                                        onChange={handleInputChange}
                                                    >
                                                        <option value="">-- Select Group --</option>
                                                        {groups.filter(g => g.isBlocked === 0).map((group) => (
                                                            <option key={group.id} value={group.id}>{group.name}</option>
                                                        ))}
                                                    </Form.Select>
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        {/* Row 3: Category & Form */}
                                        <Row className="mb-3">
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label>Category</Form.Label>
                                                    <Form.Select 
                                                        name="categoryId" 
                                                        value={form.categoryId} 
                                                        onChange={handleInputChange}
                                                    >
                                                        <option value="">-- Select Category --</option>
                                                        {categories.filter(c => c.isValid === 1).map((category) => (
                                                            <option key={category.categoryId} value={category.categoryId}>{category.name}</option>
                                                        ))}
                                                    </Form.Select>
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label>Form Type</Form.Label>
                                                    <Form.Select 
                                                        name="formId" 
                                                        value={form.formId} 
                                                        onChange={handleInputChange}
                                                    >
                                                        <option value="">-- Select Form --</option>
                                                        {forms.filter(f => f.isValid === 1).map((formItem) => (
                                                            <option key={formItem.formId} value={formItem.formId}>{formItem.name}</option>
                                                        ))}
                                                    </Form.Select>
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        {/* Row 4: Strength & Unit */}
                                        <Row className="mb-3">
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label>Strength</Form.Label>
                                                    <div className="d-flex gap-2">
                                                        <Form.Control 
                                                            type="number" 
                                                            name="strength" 
                                                            value={form.strength} 
                                                            onChange={handleInputChange}
                                                            placeholder="e.g., 500" 
                                                            style={{ flex: 2 }}
                                                        />
                                                        <Form.Select 
                                                            name="strengthUnit" 
                                                            value={form.strengthUnit} 
                                                            onChange={handleInputChange}
                                                            style={{ flex: 1 }}
                                                        >
                                                            <option value="mg">mg</option>
                                                            <option value="g">g</option>
                                                            <option value="ml">ml</option>
                                                            <option value="l">l</option>
                                                            <option value="mcg">mcg</option>
                                                            <option value="iu">IU</option>
                                                        </Form.Select>
                                                    </div>
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label>Unit</Form.Label>
                                                    <Form.Select 
                                                        name="unitId" 
                                                        value={form.unitId} 
                                                        onChange={handleInputChange}
                                                    >
                                                        <option value="">-- Select Unit --</option>
                                                        {units.filter(u => u.isValid === 1).map((unit) => (
                                                            <option key={unit.id} value={unit.id}>
                                                                {unit.name}
                                                            </option>
                                                        ))}
                                                    </Form.Select>
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        {/* Row 4: HSN Code & Schedule */}
                                        <Row className="mb-3">
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label>HSN Code</Form.Label>
                                                    <Form.Control 
                                                        type="text" 
                                                        name="hsnCode" 
                                                        value={form.hsnCode} 
                                                        onChange={handleInputChange}
                                                        placeholder="Enter HSN code" 
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label>Schedule</Form.Label>
                                                    <Form.Control 
                                                        type="number" 
                                                        name="schedule" 
                                                        value={form.schedule} 
                                                        onChange={handleInputChange}
                                                        placeholder="Schedule number" 
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        {/* Row 5: Rack & Shelf */}
                                        <Row className="mb-3">
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label>Rack</Form.Label>
                                                    <Form.Control 
                                                        type="text" 
                                                        name="rack" 
                                                        value={form.rack} 
                                                        onChange={handleInputChange}
                                                        placeholder="Rack location" 
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label>Shelf</Form.Label>
                                                    <Form.Control 
                                                        type="number" 
                                                        name="shelf" 
                                                        value={form.shelf} 
                                                        onChange={handleInputChange}
                                                        placeholder="Shelf number" 
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        {/* Row 6: Min & Max */}
                                        <Row className="mb-3">
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label>Min Stock</Form.Label>
                                                    <Form.Control 
                                                        type="number" 
                                                        name="min" 
                                                        value={form.min} 
                                                        onChange={handleInputChange}
                                                        placeholder="Minimum stock level" 
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label>Max Stock</Form.Label>
                                                    <Form.Control 
                                                        type="number" 
                                                        name="max" 
                                                        value={form.max} 
                                                        onChange={handleInputChange}
                                                        placeholder="Maximum stock level" 
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        {/* Row 7: Safe & EOQ */}
                                        <Row className="mb-3">
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label>Safe Stock</Form.Label>
                                                    <Form.Control 
                                                        type="number" 
                                                        name="safe" 
                                                        value={form.safe} 
                                                        onChange={handleInputChange}
                                                        placeholder="Safe stock level" 
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label>EOQ (Economic Order Qty)</Form.Label>
                                                    <Form.Control 
                                                        type="number" 
                                                        name="eoq" 
                                                        value={form.eoq} 
                                                        onChange={handleInputChange}
                                                        placeholder="Economic order quantity" 
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        {/* Row 8: Strips & Quantity */}
                                        <Row className="mb-3">
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label>Strips</Form.Label>
                                                    <Form.Control 
                                                        type="text" 
                                                        name="strips" 
                                                        value={form.strips} 
                                                        onChange={handleInputChange}
                                                        placeholder="Strip details" 
                                                    />
                                                </Form.Group>
                                            </Col>
                                            <Col md={6}>
                                                <Form.Group>
                                                    <Form.Label>Quantity</Form.Label>
                                                    <Form.Control 
                                                        type="number" 
                                                        name="quantity" 
                                                        value={form.quantity} 
                                                        onChange={handleInputChange}
                                                        placeholder="Quantity per unit" 
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        {/* Row 9: Description */}
                                        <Row className="mb-3">
                                            <Col md={12}>
                                                <Form.Group>
                                                    <Form.Label>Description</Form.Label>
                                                    <Form.Control 
                                                        as="textarea" 
                                                        rows={2}
                                                        name="description" 
                                                        value={form.description} 
                                                        onChange={handleInputChange}
                                                        placeholder="Product description" 
                                                    />
                                                </Form.Group>
                                            </Col>
                                        </Row>

                                        {/* Row 10: Checkboxes */}
                                        <Row className="mb-3">
                                            <Col md={12}>
                                                <div className="d-flex gap-4 flex-wrap">
                                                    <Form.Check 
                                                        type="checkbox" 
                                                        id="looseSale"
                                                        label="Allow Loose Sale"
                                                        name="looseSale"
                                                        checked={form.looseSale === "Y"}
                                                        onChange={handleInputChange}
                                                    />
                                                    <Form.Check 
                                                        type="checkbox" 
                                                        id="isNonStockable"
                                                        label="Non-Stockable"
                                                        name="isNonStockable"
                                                        checked={form.isNonStockable === "Y"}
                                                        onChange={handleInputChange}
                                                    />
                                                </div>
                                            </Col>
                                        </Row>
                                    </Form>
                                </div>
                                {/* Form Action Buttons */}
                                <div className="d-flex justify-content-end gap-2 mt-3" style={{ flexShrink: 0, paddingTop: "1rem", borderTop: "1px solid #e0e0e0" }}>
                                    <Button variant="success" onClick={handleAddOrUpdate} disabled={loading} style={{ minWidth: "150px", fontWeight: "600" }}>
                                        {loading ? <><Clock className="me-1" /> Saving...</> : editingId ? <><PencilSquare className="me-1" /> Update Product</> : <><CheckCircle className="me-1" /> Add Product</>}
                                    </Button>
                                    {editingId && (
                                        <Button variant="outline-secondary" onClick={handleCancelEdit} disabled={loading} style={{ minWidth: "100px" }}>
                                            <XCircle className="me-1" /> Cancel
                                        </Button>
                                    )}
                                </div>
                            </Card>
                        </div>

                        {/* Table Section - 55% */}
                        <div style={{ display: "flex", flex: "0 0 55%", minWidth: 0, flexDirection: "column" }}>
                            <Card className="shadow-sm" style={{ background: "white", borderRadius: "12px", border: "1px solid #e0e0e0", display: "flex", flexDirection: "column", height: "100%", minHeight: 0 }}>
                                {/* Table Header */}
                                <div style={{ padding: "1.25rem 1.5rem", borderBottom: "2px solid #f0f0f0", background: "linear-gradient(to right, #f8f9fa, #ffffff)", borderTopLeftRadius: "12px", borderTopRightRadius: "12px", flexShrink: 0 }}>
                                    <div className="d-flex justify-content-between align-items-center mb-3">
                                        <div className="d-flex align-items-center gap-2">
                                            {showBlocked ? <ShieldX size={22} color="#dc3545" /> : <ListCheck size={22} color="#28a745" />}
                                            <h5 className="mb-0" style={{ fontWeight: "600" }}>
                                                {showBlocked ? "Blocked Products" : "Active Products"}
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
                                    <SearchInput 
                                        searchTerm={showBlocked ? blockedSearchTerm : activeSearchTerm} 
                                        onSearchChange={showBlocked ? setBlockedSearchTerm : setActiveSearchTerm} 
                                        placeholder="Search by product name or code..." 
                                        resultCount={showBlocked ? blockedResultCount : activeResultCount} 
                                        totalCount={showBlocked ? blockedTotalCount : activeTotalCount} 
                                        showResultCount={true} 
                                    />
                                </div>
                                {/* Table Content */}
                                <div style={{ flex: 1, minHeight: 0, overflowY: "auto" }}>
                                    <Table striped bordered hover>
                                        <thead style={{ position: "sticky", top: 0, backgroundColor: "#f8f9fa", zIndex: 10 }}>
                                            <tr>
                                                <th style={{ width: "40px" }}>#</th>
                                                <th>Product Name</th>
                                                <th>Code</th>
                                                <th>Company</th>
                                                <th style={{ width: "150px" }}>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(showBlocked ? filteredBlockedItems : filteredActiveItems).length === 0 ? (
                                                <tr>
                                                    <td colSpan={5} style={{ textAlign: "center", padding: "2rem" }}>
                                                        {showBlocked 
                                                            ? (blockedSearchTerm ? "No blocked products match your search." : "No blocked products.") 
                                                            : (activeSearchTerm ? "No active products match your search." : "No active products.")}
                                                    </td>
                                                </tr>
                                            ) : (
                                                (showBlocked ? filteredBlockedItems : filteredActiveItems).map((item, idx) => (
                                                    <tr 
                                                        key={item.id} 
                                                        style={{ 
                                                            backgroundColor: editingId === item.id ? "#fff3cd" : "transparent", 
                                                            fontWeight: editingId === item.id ? "600" : "normal", 
                                                            borderLeft: editingId === item.id ? "4px solid #ffc107" : "none" 
                                                        }}
                                                    >
                                                        <td>{idx + 1}</td>
                                                        <td>
                                                            {item.name}
                                                            {editingId === item.id && (
                                                                <span className="ms-2 badge bg-warning text-dark">
                                                                    <PencilSquare className="me-1" size={10} />Editing
                                                                </span>
                                                            )}
                                                        </td>
                                                        <td>{item.medCode || "-"}</td>
                                                        <td>{getCompanyName(item.companyId)}</td>
                                                        <td>
                                                            {showBlocked ? (
                                                                <Button variant="outline-success" size="sm" onClick={() => handleUnblock(item.id)}>
                                                                    Unblock
                                                                </Button>
                                                            ) : (
                                                                <>
                                                                    {editingId !== item.id ? (
                                                                        <>
                                                                            <Button variant="outline-primary" size="sm" className="me-2" onClick={() => handleEdit(item.id)} disabled={loading}>
                                                                                Edit
                                                                            </Button>
                                                                            <Button variant="outline-danger" size="sm" onClick={() => handleBlock(item.id)}>
                                                                                Block
                                                                            </Button>
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

export default ProductMaster;
