import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../../state/store';
import { Badge, Button, Table, Modal, Form } from 'react-bootstrap';
import '../../../../../style/commonStyle.css';
import PageHeader from '../../../../../components/PageHeader';
import { faCheckDouble } from '@fortawesome/free-solid-svg-icons';
import CentralStoresApiService from '../../../../../api/central-stores/central-stores-api-service';
import { showSuccessToast, showErrorToast, showConfirmDialog } from '../../../../../utils/alertUtil';

interface SubModuleState {
    subModId: number;
    subModName: string;
    modGroupId: number;
    modGroupName: string;
    masterId: number;
}

// Utility function to get store data from session storage
const getStoreData = (): SubModuleState | null => {
    // Try Central Stores first
    const centralStoresData = sessionStorage.getItem('selectedStore');
    if (centralStoresData) {
        return JSON.parse(centralStoresData);
    }

    // Try Pharmacy Stores
    const pharmacyData = sessionStorage.getItem('pharmacySubModuleData');
    if (pharmacyData) {
        const parsedData = JSON.parse(pharmacyData);
        // Override masterId to 1 for pharmacy data
        return { ...parsedData, masterId: parsedData.masterId ?? 0 };
    }

    return null;
};

interface ReturnDetailItem {
    id: number;
    batchId: number;
    batchNo: string;
    productName: string;
    genericName: string;
    manufacturer: string;
    expiryDate: string;
    quantity: number;
    acceptedRate: number;
    remark: string;
    freeReturn: number;
}

interface PendingGoodsReturn {
    id: number;
    returnNo: string;
    storeId: number;
    storeName: string;
    dealerId: number;
    dealerName: string;
    grnBillId: number;
    grnNumber: string;
    invoiceNo: string;
    returnDateTime: string;
    entryDateTime: string;
    uid: number;
    userName: string;
    itemCount: number;
    totalQuantity: number;
    totalValue: number;
    returnDetails: ReturnDetailItem[];
}

const GoodsReturnApproval: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const loginData = useSelector((state: RootState) => state.loginData);
    const [subModuleData, setSubModuleData] = useState<SubModuleState | null>(() => getStoreData());
    const centralStoresApi = new CentralStoresApiService();
    const [pendingReturns, setPendingReturns] = useState<PendingGoodsReturn[]>([]);
    const [selectedReturn, setSelectedReturn] = useState<PendingGoodsReturn | null>(null);
    const [showPreviewModal, setShowPreviewModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [approving, setApproving] = useState(false);

    // Fetch pending goods returns
    const fetchPendingReturns = async () => {
        try {
            setLoading(true);
            const storeInfo = getStoreData();
            if (!storeInfo) {
                return;
            }

            const storeId = storeInfo.masterId;

            // TODO: Replace with actual API call when backend endpoint is ready
            // const response = await centralStoresApi.fetchAllUnapprovedGoodsReturns(storeId);
            // setPendingReturns(response);

            // Temporary mock data for demonstration
            const mockData: PendingGoodsReturn[] = [
                {
                    id: 1,
                    returnNo: 'GR-2024-001',
                    storeId: storeId,
                    storeName: 'Medical Store',
                    dealerId: 101,
                    dealerName: 'ABC Pharmaceuticals',
                    grnBillId: 501,
                    grnNumber: 'GRN-2024-001',
                    invoiceNo: 'INV-2024-001',
                    returnDateTime: new Date().toISOString(),
                    entryDateTime: new Date().toISOString(),
                    uid: loginData.id,
                    userName: loginData.name,
                    itemCount: 3,
                    totalQuantity: 50,
                    totalValue: 5000,
                    returnDetails: [
                        {
                            id: 1,
                            batchId: 1001,
                            batchNo: 'BATCH001',
                            productName: 'Paracetamol 500mg',
                            genericName: 'Paracetamol',
                            manufacturer: 'ABC Pharma',
                            expiryDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
                            quantity: 20,
                            acceptedRate: 50,
                            remark: 'Damaged packaging',
                            freeReturn: 0
                        },
                        {
                            id: 2,
                            batchId: 1002,
                            batchNo: 'BATCH002',
                            productName: 'Amoxicillin 250mg',
                            genericName: 'Amoxicillin',
                            manufacturer: 'XYZ Pharma',
                            expiryDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
                            quantity: 15,
                            acceptedRate: 75,
                            remark: 'Wrong item',
                            freeReturn: 0
                        },
                        {
                            id: 3,
                            batchId: 1003,
                            batchNo: 'BATCH003',
                            productName: 'Cetirizine 10mg',
                            genericName: 'Cetirizine',
                            manufacturer: 'DEF Pharma',
                            expiryDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
                            quantity: 15,
                            acceptedRate: 30,
                            remark: 'Near expiry',
                            freeReturn: 0
                        }
                    ]
                }
            ];

            setPendingReturns(mockData);
        } catch (error) {
            showErrorToast('Failed to load pending goods returns');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!loginData.authorized) {
            navigate('/login');
            return;
        }

        const state = location.state as SubModuleState;
        if (state) {
            setSubModuleData(state);
        }

        fetchPendingReturns();
    }, [loginData, location.state, navigate]);

    const handlePreview = (returnData: PendingGoodsReturn) => {
        setSelectedReturn(returnData);
        setShowPreviewModal(true);
    };

    const handleApprove = async (returnData: PendingGoodsReturn) => {
        const confirmed = await showConfirmDialog(
            `Are you sure you want to approve this goods return?`,
            `Return No: ${returnData.returnNo}\nSupplier: ${returnData.dealerName}\nTotal Items: ${returnData.itemCount}`
        );

        if (confirmed) {
            try {
                setApproving(true);

                // TODO: Replace with actual API call when backend endpoint is ready
                // await centralStoresApi.approveGoodsReturn(returnData.id, loginData.id);

                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1000));

                showSuccessToast('Goods return approved successfully');
                fetchPendingReturns();
            } catch (error) {
                showErrorToast('Failed to approve goods return');
            } finally {
                setApproving(false);
            }
        }
    };

    const handleReject = async (returnData: PendingGoodsReturn) => {
        const confirmed = await showConfirmDialog(
            `Are you sure you want to reject this goods return?`,
            `Return No: ${returnData.returnNo}\nThis action cannot be undone.`,
            'warning'
        );

        if (confirmed) {
            try {
                setApproving(true);

                // TODO: Replace with actual API call when backend endpoint is ready
                // await centralStoresApi.rejectGoodsReturn(returnData.id, loginData.id);

                // Simulate API call
                await new Promise(resolve => setTimeout(resolve, 1000));

                showSuccessToast('Goods return rejected successfully');
                fetchPendingReturns();
            } catch (error) {
                showErrorToast('Failed to reject goods return');
            } finally {
                setApproving(false);
            }
        }
    };

    const handleApproveFromModal = () => {
        if (selectedReturn) {
            setShowPreviewModal(false);
            handleApprove(selectedReturn);
        }
    };

    return (
        <>
            <PageHeader
                icon={faCheckDouble}
                title="Goods Return Approval"
                subtitle="Review and approve pending goods returns"
                badges={[
                    { label: 'Store', value: subModuleData?.subModName || 'Not Set' }
                ]}
            />

            <div className="px-3">
                {/* Content */}
                <div className="card neat-card">
                    <div className="card-body p-0">
                        {loading ? (
                            <div className="text-center p-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <p className="mt-3 text-muted">Loading goods returns...</p>
                            </div>
                        ) : (
                            <>
                                {pendingReturns.length === 0 && (
                                    <div className="text-center p-5">
                                        <i className="fas fa-inbox fa-3x text-muted mb-3"></i>
                                        <h5 className="text-muted">No Pending Goods Returns</h5>
                                        <p className="text-muted">There are no goods returns waiting for approval.</p>
                                    </div>
                                )}

                                {pendingReturns.length > 0 && (
                                    <div style={{ maxHeight: 'calc(100vh - 280px)', overflowY: 'auto' }}>
                                        <Table hover responsive className="mb-0">
                                            <thead className="bg-light text-muted text-uppercase small" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                                                <tr>
                                                    <th style={{ width: '60px' }} className="text-center">#</th>
                                                    <th style={{ width: '150px' }}>Return No</th>
                                                    <th style={{ width: '150px' }}>GRN No</th>
                                                    <th>Supplier Name</th>
                                                    <th style={{ width: '180px' }}>Return Date</th>
                                                    <th style={{ width: '150px' }}>Entry By</th>
                                                    <th style={{ width: '100px' }} className="text-center">Items</th>
                                                    <th style={{ width: '100px' }} className="text-center">Qty</th>
                                                    <th style={{ width: '120px' }} className="text-end">Value</th>
                                                    <th style={{ width: '220px' }} className="text-center">Actions</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {pendingReturns.map((returnData, index) => (
                                                    <tr key={returnData.id}>
                                                        <td className="text-center text-muted small">{index + 1}</td>
                                                        <td>
                                                            <code className="bg-light p-1 rounded">{returnData.returnNo}</code>
                                                        </td>
                                                        <td>
                                                            <code className="bg-light p-1 rounded">{returnData.grnNumber}</code>
                                                        </td>
                                                        <td>{returnData.dealerName}</td>
                                                        <td>{new Date(returnData.returnDateTime).toLocaleString()}</td>
                                                        <td>{returnData.userName}</td>
                                                        <td className="text-center">
                                                            <Badge bg="info">{returnData.itemCount}</Badge>
                                                        </td>
                                                        <td className="text-center">
                                                            <Badge bg="secondary">{returnData.totalQuantity}</Badge>
                                                        </td>
                                                        <td className="text-end">
                                                            <strong>₹{returnData.totalValue.toFixed(2)}</strong>
                                                        </td>
                                                        <td className="text-center">
                                                            <div className="btn-group btn-group-sm" role="group">
                                                                <Button
                                                                    variant="outline-primary"
                                                                    size="sm"
                                                                    onClick={() => handlePreview(returnData)}
                                                                    title="Preview Return"
                                                                    disabled={approving}
                                                                >
                                                                    <i className="fas fa-eye"></i>
                                                                </Button>
                                                                <Button
                                                                    variant="outline-success"
                                                                    size="sm"
                                                                    onClick={() => handleApprove(returnData)}
                                                                    title="Approve"
                                                                    disabled={approving}
                                                                >
                                                                    <i className="fas fa-check"></i>
                                                                </Button>
                                                                <Button
                                                                    variant="outline-danger"
                                                                    size="sm"
                                                                    onClick={() => handleReject(returnData)}
                                                                    title="Reject"
                                                                    disabled={approving}
                                                                >
                                                                    <i className="fas fa-times"></i>
                                                                </Button>
                                                            </div>
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </Table>
                                    </div>
                                )}
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* Preview Modal */}
            <Modal 
                show={showPreviewModal} 
                onHide={() => setShowPreviewModal(false)}
                size="xl"
                centered
            >
                <Modal.Header closeButton className="bg-primary text-white">
                    <Modal.Title>
                        <i className="fas fa-eye me-2"></i>
                        Goods Return Preview - {selectedReturn?.returnNo}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedReturn && (
                        <>
                            {/* Return Details Header */}
                            <div className="row mb-4">
                                <div className="col-md-6">
                                    <table className="table table-sm table-borderless">
                                        <tbody>
                                            <tr>
                                                <th style={{ width: '40%' }}>Return No:</th>
                                                <td><strong>{selectedReturn.returnNo}</strong></td>
                                            </tr>
                                            <tr>
                                                <th>GRN Number:</th>
                                                <td>{selectedReturn.grnNumber}</td>
                                            </tr>
                                            <tr>
                                                <th>Invoice No:</th>
                                                <td>{selectedReturn.invoiceNo}</td>
                                            </tr>
                                            <tr>
                                                <th>Supplier:</th>
                                                <td>{selectedReturn.dealerName}</td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                                <div className="col-md-6">
                                    <table className="table table-sm table-borderless">
                                        <tbody>
                                            <tr>
                                                <th style={{ width: '40%' }}>Return Date:</th>
                                                <td>{new Date(selectedReturn.returnDateTime).toLocaleString()}</td>
                                            </tr>
                                            <tr>
                                                <th>Entry By:</th>
                                                <td>{selectedReturn.userName}</td>
                                            </tr>
                                            <tr>
                                                <th>Total Items:</th>
                                                <td><Badge bg="info">{selectedReturn.itemCount}</Badge></td>
                                            </tr>
                                            <tr>
                                                <th>Total Value:</th>
                                                <td><strong className="text-success">₹{selectedReturn.totalValue.toFixed(2)}</strong></td>
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Return Items Table */}
                            <div className="mb-3">
                                <h6 className="border-bottom pb-2 mb-3">Return Items</h6>
                                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                    <Table striped bordered hover size="sm" className="mb-0">
                                        <thead className="table-light">
                                            <tr>
                                                <th style={{ width: '50px' }}>#</th>
                                                <th>Product Name</th>
                                                <th>Generic Name</th>
                                                <th>Manufacturer</th>
                                                <th style={{ width: '120px' }}>Batch No</th>
                                                <th style={{ width: '120px' }}>Expiry Date</th>
                                                <th style={{ width: '80px' }} className="text-center">Qty</th>
                                                <th style={{ width: '100px' }} className="text-end">Rate</th>
                                                <th style={{ width: '100px' }} className="text-end">Amount</th>
                                                <th style={{ width: '150px' }}>Remark</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {selectedReturn.returnDetails.map((item, index) => (
                                                <tr key={item.id}>
                                                    <td className="text-center">{index + 1}</td>
                                                    <td>{item.productName}</td>
                                                    <td>{item.genericName}</td>
                                                    <td>{item.manufacturer}</td>
                                                    <td>{item.batchNo}</td>
                                                    <td>{new Date(item.expiryDate).toLocaleDateString()}</td>
                                                    <td className="text-center">
                                                        <Badge bg="secondary">{item.quantity}</Badge>
                                                    </td>
                                                    <td className="text-end">₹{item.acceptedRate.toFixed(2)}</td>
                                                    <td className="text-end">
                                                        <strong>₹{(item.quantity * item.acceptedRate).toFixed(2)}</strong>
                                                    </td>
                                                    <td>
                                                        <small className="text-muted">{item.remark || '-'}</small>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="table-light">
                                            <tr>
                                                <th colSpan={6} className="text-end">Total:</th>
                                                <th className="text-center">
                                                    <Badge bg="secondary">
                                                        {selectedReturn.returnDetails.reduce((sum, item) => sum + item.quantity, 0)}
                                                    </Badge>
                                                </th>
                                                <th></th>
                                                <th className="text-end">
                                                    <strong className="text-success">
                                                        ₹{selectedReturn.returnDetails.reduce((sum, item) => sum + (item.quantity * item.acceptedRate), 0).toFixed(2)}
                                                    </strong>
                                                </th>
                                                <th></th>
                                            </tr>
                                        </tfoot>
                                    </Table>
                                </div>
                            </div>
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowPreviewModal(false)} disabled={approving}>
                        Close
                    </Button>
                    <Button 
                        variant="success" 
                        onClick={handleApproveFromModal}
                        disabled={approving}
                    >
                        {approving ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Approving...
                            </>
                        ) : (
                            <>
                                <i className="fas fa-check me-2"></i>
                                Approve Return
                            </>
                        )}
                    </Button>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default GoodsReturnApproval;
