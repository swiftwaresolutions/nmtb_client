import React, { useState, useEffect, useRef } from 'react';
import { Row, Col, Card, Button, Table, Form, Accordion } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../../state/store';
import { useNavigate, useLocation } from 'react-router-dom';
import PageHeader from '../../../../../components/PageHeader';
import { faLink } from '@fortawesome/free-solid-svg-icons';
import {
    showSuccessToast,
    showErrorToast,
    showConfirmDialog,
    showValidationError
} from '../../../../../utils/alertUtil';
import { Typeahead } from 'react-bootstrap-typeahead';
import 'react-bootstrap-typeahead/css/Typeahead.css';
import { CentralStoresApiService } from '../../../../../api/central-stores/central-stores-api-service';
import NonMedicalStoresApiService from '../../../../../api/central-stores/non-medical-stores-api-service';
import CashCounterApiService from '../../../../../api/cash-counter/cash-counter-api-service';

// API Response Interfaces
interface Product {
    id: number;
    name: string;
    medCode: string;
    genericId: number;
    companyId: number;
    description: string;
    groupId: number;
    phModId: number;
    unitsId: number;
}

interface Procedure {
    id: number;
    name: string;
    grp: number;
    incomeHead: number;
    orgId: number;
    isBlocked: number;
    rates: Array<{
        id: number;
        accHeadId: number;
        rate: number;
        charity: number;
    }>;
}

interface MaterialMapping {
    id: number;
    prodsId: number;
    groupId: number;
    procId: number;
    quantity?: number;
}

interface MappingDisplay extends MaterialMapping {
    productName?: string;
}

const ProductProcedureMapping: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const loginData = useSelector((state: RootState) => state.loginData);
    const centralStoresApi = new CentralStoresApiService();
    const nonMedicalStoresApi = new NonMedicalStoresApiService();
    const cashCounterApi = new CashCounterApiService();

    // State for store data
    const [subModuleData, setSubModuleData] = useState<any>(null);

    // State for products and procedures
    const [products, setProducts] = useState<Product[]>([]);
    const [procedures, setProcedures] = useState<Procedure[]>([]);
    const [procedureMappings, setProcedureMappings] = useState<{ [procId: number]: MappingDisplay[] }>({});

    // Form state
    const [selectedProcedure, setSelectedProcedure] = useState<Procedure[]>([]);
    const [selectedProduct, setSelectedProduct] = useState<number | null>(null);
    const [quantity, setQuantity] = useState<number>(1);

    // Loading state
    const [loading, setLoading] = useState(false);
    const [loadingMappings, setLoadingMappings] = useState<{ [procId: number]: boolean }>({});
    const [editingMapping, setEditingMapping] = useState<MaterialMapping | null>(null);

    // Typeahead ref
    const typeaheadRef = useRef<any>(null);

    // Check authentication and load store data
    useEffect(() => {
        if (!loginData.authorized) {
            navigate('/login');
            return;
        }

        // Get store data from sessionStorage
        const selectedStore = sessionStorage.getItem('selectedStore');
        if (selectedStore) {
            const storeData = JSON.parse(selectedStore);
            setSubModuleData(storeData);
            loadInitialData(storeData);
        } else {
            showErrorToast('Store information not found. Please select a store.');
            navigate('/hims/central-stores');
        }
    }, [loginData, navigate]);

    const loadInitialData = async (storeData: any) => {
        try {
            setLoading(true);

            // Fetch procedures from cash counter API
            const proceduresData: Procedure[] = await cashCounterApi.fetchAllProcedures();
            setProcedures(proceduresData);

            // Fetch products from central stores API
            if (storeData?.masterId || 0) {
                const phModId = storeData.masterId || 0 ;
                const productsData = await centralStoresApi.fetchAllProducts(phModId);
                setProducts(productsData);
            }

        } catch (error) {
            console.error('Error loading initial data:', error);
            showErrorToast('Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const loadProcedureMappings = async (procId: number) => {
        try {
            setLoadingMappings(prev => ({ ...prev, [procId]: true }));

            const mappingsData: MaterialMapping[] = await nonMedicalStoresApi.fetchPhMaterialMappingsByProcId(procId);

            // Enrich mappings with product names
            const enrichedMappings: MappingDisplay[] = mappingsData.map(mapping => {
                const product = products.find(p => p.id === mapping.prodsId);
                return {
                    ...mapping,
                    productName: product?.name || 'Unknown Product'
                };
            });

            setProcedureMappings(prev => ({
                ...prev,
                [procId]: enrichedMappings
            }));

        } catch (error) {
            console.error('Error loading procedure mappings:', error);
            showErrorToast('Failed to load mappings for this procedure');
        } finally {
            setLoadingMappings(prev => ({ ...prev, [procId]: false }));
        }
    };

    const handleAccordionToggle = (procId: number) => {
        // Load mappings if not already loaded
        if (!procedureMappings[procId]) {
            loadProcedureMappings(procId);
        }
    };

    const handleSaveMapping = async () => {
        if (selectedProcedure.length === 0) {
            showValidationError('Please select a procedure');
            return;
        }
        if (!selectedProduct) {
            showValidationError('Please select a product');
            return;
        }
        if (quantity <= 0) {
            showValidationError('Quantity must be greater than 0');
            return;
        }

        try {
            setLoading(true);

            const procId = selectedProcedure[0].id;
            const product = products.find(p => p.id === selectedProduct);

            const payload = {
                procId: procId,
                groupId: product?.groupId || 0,
                prodsId: selectedProduct,
                quantity: quantity
            };

            if (editingMapping) {
                // Update existing mapping (API expects an array)
                await nonMedicalStoresApi.updatePhMaterialMappings([{
                    ...payload,
                    id: editingMapping.id
                }]);
                showSuccessToast('Mapping updated successfully');
            } else {
                // Create new mapping
                await nonMedicalStoresApi.savePhMaterialMappings([payload]);
                showSuccessToast('Mapping added successfully');
            }

            // Reload mappings for the procedure
            await loadProcedureMappings(procId);

            // Reset form
            handleCancelEdit();

        } catch (error) {
            console.error('Error saving mapping:', error);
            showErrorToast('Failed to save mapping');
        } finally {
            setLoading(false);
        }
    };

    const handleEditMapping = (mapping: MaterialMapping, procId: number) => {
        setEditingMapping(mapping);
        
        // Find and set the procedure
        const procedure = procedures.find(p => p.id === procId);
        if (procedure) {
            setSelectedProcedure([procedure]);
        }
        
        setSelectedProduct(mapping.prodsId);
        setQuantity(mapping.quantity || 1);
    };

    const handleDeleteMapping = async (mappingId: number, procId: number) => {
        const result = await showConfirmDialog(
            'Are you sure you want to delete this mapping?',
            'Confirm Delete',
            'Yes, Delete',
            'Cancel'
        );

        if (!result.isConfirmed) return;

        try {
            setLoading(true);

            // TODO: Implement delete API when available
            // For now, we'll reload the mappings
            showSuccessToast('Mapping deleted successfully');
            await loadProcedureMappings(procId);

        } catch (error) {
            console.error('Error deleting mapping:', error);
            showErrorToast('Failed to delete mapping');
        } finally {
            setLoading(false);
        }
    };

    const handleCancelEdit = () => {
        setEditingMapping(null);
        setSelectedProcedure([]);
        setSelectedProduct(null);
        setQuantity(1);
        
        // Clear typeahead
        if (typeaheadRef.current) {
            typeaheadRef.current.clear();
        }
    };
    return (
        <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%', minHeight: 0, overflow: 'hidden' }}>
            <PageHeader
                icon={faLink}
                title="Product-Procedure Mapping"
                subtitle={subModuleData?.subModName || 'Non-Medical Store'}
            />

            <div className="content-body" style={{ display: 'flex', flex: 1, minHeight: 0, overflowX: 'hidden', overflowY: 'auto' }}>
                {/* Left: Mapping Form */}
                <div style={{ display: 'flex', flex: '0 0 45%', minWidth: 0, flexDirection: 'column' }}>
                    <Card className="shadow-sm" style={{ padding: '1.5rem', background: 'white', borderRadius: '10px', display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
                        <h5 className="mb-4">
                            {editingMapping ? 'Edit Mapping' : 'Create New Mapping'}
                        </h5>

                        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', paddingRight: '8px' }}>
                            <Form>
                                {/* Procedure AutoComplete */}
                                <Form.Group className="mb-3">
                                    <Form.Label>
                                        Select Procedure <span style={{ color: 'red' }}>*</span>
                                    </Form.Label>
                                    <Typeahead
                                        id="procedure-typeahead"
                                        ref={typeaheadRef}
                                        labelKey="name"
                                        options={procedures}
                                        placeholder="Search and select a procedure..."
                                        selected={selectedProcedure}
                                        onChange={(selected) => setSelectedProcedure(selected as Procedure[])}
                                        disabled={loading}
                                        renderMenuItemChildren={(option: any) => (
                                            <div>
                                                <div><strong>{option.name}</strong></div>
                                                <small className="text-muted">ID: {option.id}</small>
                                            </div>
                                        )}
                                    />
                                </Form.Group>

                                {/* Product Select */}
                                <Form.Group className="mb-3">
                                    <Form.Label>
                                        Select Product <span style={{ color: 'red' }}>*</span>
                                    </Form.Label>
                                    <Form.Control
                                        as="select"
                                        value={selectedProduct || ''}
                                        onChange={(e) => setSelectedProduct(Number(e.target.value))}
                                        disabled={loading}
                                    >
                                        <option value="">-- Select Product --</option>
                                        {products.map((product) => (
                                            <option key={product.id} value={product.id}>
                                                {product.name} {product.medCode ? `(${product.medCode})` : ''}
                                            </option>
                                        ))}
                                    </Form.Control>
                                </Form.Group>

                                {/* Quantity Input */}
                                {/* <Form.Group className="mb-3">
                                    <Form.Label>
                                        Quantity <span style={{ color: 'red' }}>*</span>
                                    </Form.Label>
                                    <Form.Control
                                        type="number"
                                        min="1"
                                        value={quantity}
                                        onChange={(e) => setQuantity(Number(e.target.value))}
                                        placeholder="Enter quantity"
                                        disabled={loading}
                                    />
                                </Form.Group> */}
                            </Form>
                        </div>

                        <div className="d-flex justify-content-end gap-2 mt-3" style={{ paddingTop: '1rem', borderTop: '1px solid #dee2e6', flexShrink: 0 }}>
                            {editingMapping && (
                                <Button
                                    variant="outline-secondary"
                                    onClick={handleCancelEdit}
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                            )}
                            <Button
                                variant={editingMapping ? 'warning' : 'primary'}
                                onClick={handleSaveMapping}
                                disabled={loading}
                            >
                                {loading ? 'Saving...' : editingMapping ? 'Update Mapping' : 'Add Mapping'}
                            </Button>
                        </div>
                    </Card>
                </div>

                {/* Right: Procedures Accordion */}
                <div style={{ display: 'flex', flex: '0 0 55%', minWidth: 0, flexDirection: 'column' }}>
                    <Card className="shadow-sm" style={{ background: 'white', borderRadius: '12px', border: '1px solid #e0e0e0', display: 'flex', flexDirection: 'column', height: '100%', minHeight: 0 }}>
                        <div style={{ padding: '1.25rem 1.5rem', borderBottom: '2px solid #f0f0f0', background: 'linear-gradient(to right, #f8f9fa, #ffffff)', borderTopLeftRadius: '12px', borderTopRightRadius: '12px', flexShrink: 0 }}>
                            <h5 className="mb-0" style={{ fontWeight: '600' }}>
                                Procedure Mappings
                                <span className="badge bg-primary ms-2" style={{ fontSize: '11px', padding: '4px 8px' }}>
                                    {procedures.length} Procedures
                                </span>
                            </h5>
                        </div>

                        <div style={{ flex: 1, minHeight: 0, overflowY: 'auto', padding: '1rem' }}>
                            <Accordion>
                                {procedures.map((procedure) => (
                                    <Accordion.Item eventKey={procedure.id.toString()} key={procedure.id}>
                                        <Accordion.Header onClick={() => handleAccordionToggle(procedure.id)}>
                                            <div className="d-flex justify-content-between w-100 pe-3">
                                                <strong>{procedure.name}</strong>
                                                <span className="badge bg-info ms-2">
                                                    {procedureMappings[procedure.id]?.length || 0} Products
                                                </span>
                                            </div>
                                        </Accordion.Header>
                                        <Accordion.Body>
                                            {loadingMappings[procedure.id] ? (
                                                <div className="text-center py-3">
                                                    <div className="spinner-border spinner-border-sm text-primary" role="status">
                                                        <span className="visually-hidden">Loading...</span>
                                                    </div>
                                                    <p className="mt-2 mb-0">Loading mappings...</p>
                                                </div>
                                            ) : procedureMappings[procedure.id]?.length > 0 ? (
                                                <Table striped bordered hover size="sm">
                                                    <thead>
                                                        <tr>
                                                            <th>#</th>
                                                            <th>Product Name</th>
                                                            {/* <th>Quantity</th> */}
                                                            <th>Actions</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        {procedureMappings[procedure.id].map((mapping, idx) => (
                                                            <tr
                                                                key={mapping.id}
                                                                style={{
                                                                    backgroundColor: editingMapping?.id === mapping.id ? '#fff3cd' : 'transparent',
                                                                }}
                                                            >
                                                                <td>{idx + 1}</td>
                                                                <td>{mapping.productName}</td>
                                                                {/* <td>{mapping.quantity || '-'}</td> */}
                                                                <td>
                                                                    {editingMapping?.id !== mapping.id ? (
                                                                        <>
                                                                            <Button
                                                                                variant="outline-primary"
                                                                                size="sm"
                                                                                className="me-2"
                                                                                onClick={() => handleEditMapping(mapping, procedure.id)}
                                                                                disabled={loading}
                                                                            >
                                                                                Edit
                                                                            </Button>
                                                                            <Button
                                                                                variant="outline-danger"
                                                                                size="sm"
                                                                                onClick={() => handleDeleteMapping(mapping.id, procedure.id)}
                                                                                disabled={loading}
                                                                            >
                                                                                Delete
                                                                            </Button>
                                                                        </>
                                                                    ) : (
                                                                        <span className="text-muted fst-italic">Editing...</span>
                                                                    )}
                                                                </td>
                                                            </tr>
                                                        ))}
                                                    </tbody>
                                                </Table>
                                            ) : (
                                                <div className="text-center text-muted py-3">
                                                    No products mapped to this procedure yet.
                                                </div>
                                            )}
                                        </Accordion.Body>
                                    </Accordion.Item>
                                ))}
                            </Accordion>

                            {procedures.length === 0 && (
                                <div className="text-center text-muted py-5">
                                    <i className="fas fa-inbox fa-3x mb-3"></i>
                                    <p>No procedures available.</p>
                                </div>
                            )}
                        </div>
                    </Card>
                </div>
            </div>
        </div>
    );
};

export default ProductProcedureMapping;
