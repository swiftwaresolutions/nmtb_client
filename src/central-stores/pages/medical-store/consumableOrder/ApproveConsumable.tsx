import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../state/store';
import { Badge, Button, Modal, Table } from 'react-bootstrap';
import '../../../../style/commonStyle.css';
import PageHeader from '../../../../components/PageHeader';
import { faClipboardCheck } from '@fortawesome/free-solid-svg-icons';
import CentralStoresApiService from '../../../../api/central-stores/central-stores-api-service';
import {
    closeAlert,
    showConfirmDialog,
    showErrorModal,
    showLoading,
    showSuccessToast,
} from '../../../../utils/alertUtil';

interface SubModuleState {
    subModId: number;
    subModName: string;
    modGroupId: number;
    modGroupName: string;
    masterId: number;
}

// Utility function to get store data from either module
const getStoreData = (): SubModuleState | null => {
    const parseStoreData = (raw: string | null): SubModuleState | null => {
        if (!raw) {
            return null;
        }

        try {
            return JSON.parse(raw) as SubModuleState;
        } catch {
            return null;
        }
    };

    const centralStoreData = parseStoreData(sessionStorage.getItem('selectedStore'));
    if (centralStoreData) {
        return centralStoreData;
    }

    return parseStoreData(sessionStorage.getItem('pharmacySubModuleData'));
};

const formatConsumableDateTime = (value?: string): string => {
    if (!value) return '-';

    const customFormatMatch = value.match(/^(\d{2})-(\d{2})-(\d{4})\s(\d{2}):(\d{2})(?::\d{2})?$/);
    if (customFormatMatch) {
        const [, dd, mm, yyyy, hh, min] = customFormatMatch;
        const hour24 = Number(hh);
        const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
        const period = hour24 >= 12 ? 'PM' : 'AM';
        return `${dd}/${mm}/${yyyy} ${String(hour12).padStart(2, '0')}:${min} ${period}`;
    }

    const parsedDate = new Date(value);
    if (Number.isNaN(parsedDate.getTime())) {
        return value;
    }

    return parsedDate.toLocaleString('en-GB', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
};

interface ConsumableDetailItem {
    id: number;
    waysId: number;
    waysName: string;
    batchId: number;
    batchNo: string;
    productName: string;
    qty: number;
    mrp: number;
    total: number;
    discountAmt: number;
    sgstPer: number;
    cgstPer: number;
    igstPer: number;
}

interface PendingConsumable {
    id: number;
    consumableNo: string;
    storeId: number;
    storeName: string;
    openDateTime: string;
    dateTime: string;
    uid: number;
    userName: string;
    itemCount: number;
    consumableDetails: ConsumableDetailItem[];
}

const ApproveConsumable: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const loginData = useSelector((state: RootState) => state.loginData);
    const [subModuleData, setSubModuleData] = useState<SubModuleState | null>(() => getStoreData());
    const centralStoresApi = new CentralStoresApiService();
    const [pendingConsumables, setPendingConsumables] = useState<PendingConsumable[]>([]);
    const [selectedConsumable, setSelectedConsumable] = useState<PendingConsumable | null>(null);
    const [consumableDetails, setConsumableDetails] = useState<PendingConsumable | null>(null);
    const [editableDetails, setEditableDetails] = useState<ConsumableDetailItem[]>([]);
    const [hasRemovedItems, setHasRemovedItems] = useState(false);
    const [showConsumableModal, setShowConsumableModal] = useState(false);
    const [loading, setLoading] = useState(false);
    const [loadingDetails, setLoadingDetails] = useState(false);

    const getTotalQuantity = (consumable?: PendingConsumable | null) =>
        consumable?.consumableDetails?.reduce((sum, item) => sum + item.qty, 0) || 0;

    const getTotalValue = (consumable?: PendingConsumable | null) =>
        consumable?.consumableDetails?.reduce((sum, item) => sum + item.total, 0) || 0;

    const fetchPendingConsumables = async () => {
        try {
            setLoading(true);
            const storeInfo = getStoreData();
            if (!storeInfo?.masterId) {
                showErrorModal('Store information not found. Please reselect the store.', 'Error');
                navigate('/hims/central-stores', { replace: true });
                return;
            }

            const storeId = storeInfo.masterId;

            const response = await centralStoresApi.fetchAllUnapprovedConsumables(storeId);
            setPendingConsumables(response);
        } catch (error) {
            console.error('Error fetching pending consumables:', error);
            showErrorModal('Failed to load pending consumable orders', 'Error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (!loginData.authorized) {
            navigate('/login');
            return;
        }

        const state = location.state as SubModuleState | undefined;
        let resolvedState: SubModuleState | null = state ?? null;

        if (!resolvedState) {
            resolvedState = getStoreData();
        }

        if (!resolvedState?.masterId) {
            showErrorModal('Store context is missing. Please reselect the store.', 'Error');
            navigate('/hims/central-stores', { replace: true });
            return;
        }

        setSubModuleData(resolvedState);
        if (state) {
            sessionStorage.setItem('selectedStore', JSON.stringify(state));
        }

        fetchPendingConsumables();
    }, [loginData.authorized, location.state, navigate]);

    const handleConsumableClick = async (consumable: PendingConsumable) => {
        setSelectedConsumable(consumable);
        setShowConsumableModal(true);
        setLoadingDetails(true);
        setConsumableDetails(null);
        setEditableDetails([]);
        setHasRemovedItems(false);

        try {
            const response = await centralStoresApi.fetchConsumableById(consumable.id);
            setConsumableDetails(response);
            setEditableDetails(response.consumableDetails || []);
        } catch (error) {
            console.error('Error fetching consumable details:', error);
            showErrorModal('Failed to load consumable details', 'Error');
            setShowConsumableModal(false);
        } finally {
            setLoadingDetails(false);
        }
    };

    const handleCloseModal = () => {
        setShowConsumableModal(false);
        setSelectedConsumable(null);
        setConsumableDetails(null);
        setEditableDetails([]);
        setHasRemovedItems(false);
    };

    const handleRemoveDetailRow = async (detailId: number) => {
        if (editableDetails.length <= 1) {
            showErrorModal('At least one item is required in the consumable order', 'Cannot Remove');
            return;
        }

        const result = await showConfirmDialog(
            'Are you sure you want to remove this item from the consumable order?',
            'Remove Item?',
            'Yes, Remove',
            'Cancel'
        );

        if (!result.isConfirmed) {
            return;
        }

        setEditableDetails(prev => prev.filter(item => item.id !== detailId));
        setHasRemovedItems(true);
    };

    const handleSaveConsumable = async () => {
        if (!consumableDetails?.id) {
            showErrorModal('Consumable ID is not available. Please reopen the details.', 'Error');
            return;
        }

        if (editableDetails.length === 0) {
            showErrorModal('Consumable must contain at least one item', 'Validation');
            return;
        }

        const updateRequest = {
            id: consumableDetails.id,
            storeId: consumableDetails.storeId,
            uid: loginData.id,
            consumableDetails: editableDetails.map(item => ({
                id: item.id,
                waysId: item.waysId,
                batchId: item.batchId,
                qty: item.qty,
                mrp: item.mrp,
                total: item.total,
                discountAmt: item.discountAmt,
                sgstPer: item.sgstPer,
                cgstPer: item.cgstPer,
                igstPer: item.igstPer,
            })),
        };

        try {
            showLoading('Saving Consumable...');
            await centralStoresApi.updateConsumable(consumableDetails.id, updateRequest);
            closeAlert();
            showSuccessToast('Consumable updated successfully', 'Saved!', 2000);

            const refreshed = await centralStoresApi.fetchConsumableById(consumableDetails.id);
            setConsumableDetails(refreshed);
            setEditableDetails(refreshed.consumableDetails || []);
            setHasRemovedItems(false);
            fetchPendingConsumables();
        } catch (error) {
            closeAlert();
            console.error('Error updating consumable:', error);
            showErrorModal('Failed to update consumable order', 'Error');
        }
    };

    const handleApprove = async (consumable: PendingConsumable) => {
        const result = await showConfirmDialog(
            `Consumable No: ${consumable.consumableNo}\nStore: ${consumable.storeName}\nDate & Time: ${formatConsumableDateTime(consumable.dateTime)}\nTotal Items: ${consumable.itemCount}`,
            'Approve Consumable Order',
            'Yes, Approve',
            'Cancel'
        );

        if (result.isConfirmed) {
            try {
                showLoading('Approving Consumable Order...');
                await centralStoresApi.approveConsumable(consumable.id, loginData.id);

                closeAlert();
                showSuccessToast('Consumable order approved successfully', 'Approved!', 2000);

                setPendingConsumables(prev => prev.filter(item => item.id !== consumable.id));
                handleCloseModal();
                fetchPendingConsumables();
            } catch (error) {
                closeAlert();
                console.error('Error approving consumable:', error);
                showErrorModal('Failed to approve consumable order', 'Error');
            }
        }
    };

    const handleRejectConsumable = async (consumable: PendingConsumable) => {
        const result = await showConfirmDialog(
            `Consumable No: ${consumable.consumableNo}\nStore: ${consumable.storeName}\nDate & Time: ${formatConsumableDateTime(consumable.dateTime)}\nTotal Items: ${consumable.itemCount}\n\nAre you sure you want to reject this consumable order?`,
            'Reject Consumable Order',
            'Yes, Reject',
            'Cancel'
        );

        if (result.isConfirmed) {
            try {
                showLoading('Rejecting Consumable Order...');
                await centralStoresApi.cancelConsumableOrder(consumable.id);

                closeAlert();
                showSuccessToast('Consumable order rejected successfully', 'Rejected!', 2000);

                setPendingConsumables(prev => prev.filter(item => item.id !== consumable.id));
                handleCloseModal();
                fetchPendingConsumables();
            } catch (error) {
                closeAlert();
                console.error('Error rejecting consumable:', error);
                showErrorModal('Failed to reject consumable order', 'Error');
            }
        }
    };

    return (
        <>
            <div className="approve-consumable-screen d-flex flex-column h-100">
            <PageHeader
                icon={faClipboardCheck}
                title="Consumable Order Approval"
                subtitle="Review and approve pending consumable orders"
                badges={[
                    { label: 'Store', value: subModuleData?.subModName || 'Not Set' },
                    { label: 'Pending', value: pendingConsumables.length.toString() }
                ]}
            />

            <div className="approve-consumable-content px-2 px-lg-3 pb-3 h-100">
                <div className="card border-0 shadow-sm approve-consumable-main-card">
                    <div className="card-header approve-consumable-main-header">
                        <div className="d-flex justify-content-end align-items-center">
                            <Badge bg="light" text="dark" className="border">
                                Pending Consumables: {pendingConsumables.length}
                            </Badge>
                        </div>
                    </div>

                    <div className="card-body p-0 d-flex flex-column approve-consumable-main-body">
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <p className="mt-3 text-muted">Loading consumable orders...</p>
                            </div>
                        ) : pendingConsumables.length === 0 ? (
                            <div className="text-center py-5">
                                <i className="fas fa-inbox fa-3x text-secondary mb-3"></i>
                                <h5 className="text-secondary">No Pending Consumable Orders</h5>
                                <p className="text-secondary">All consumable orders have been processed</p>
                            </div>
                        ) : (
                            <div className="approve-consumable-table-scroll">
                                <Table hover className="mb-0" style={{ minWidth: '950px' }}>
                                    <thead style={{ backgroundColor: 'var(--table-header-bg)', color: 'var(--table-header-text)', position: 'sticky', top: 0, zIndex: 1 }}>
                                        <tr>
                                            <th className="py-3" style={{ width: '5%' }}>#</th>
                                            <th className="py-3" style={{ width: '18%' }}>Consumable No</th>
                                            <th className="py-3" style={{ width: '20%' }}>Date & Time</th>
                                            <th className="py-3" style={{ width: '17%' }}>Entry User</th>
                                            <th className="py-3 text-center" style={{ width: '8%' }}>Items</th>
                                            <th className="py-3 text-center" style={{ width: '10%' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pendingConsumables.map((consumable, index) => (
                                            <tr
                                                key={consumable.id}
                                                className="approve-consumable-row"
                                                onClick={() => handleConsumableClick(consumable)}
                                            >
                                                <td className="align-middle">
                                                    <div className="rounded-circle bg-light d-inline-flex align-items-center justify-content-center approve-consumable-index-badge">
                                                        <span className="fw-bold text-primary">{index + 1}</span>
                                                    </div>
                                                </td>
                                                <td className="align-middle">
                                                    <div className="fw-bold text-body">{consumable.consumableNo}</div>
                                                </td>
                                                <td className="align-middle">
                                                    <i className="fas fa-calendar-alt me-2 text-secondary"></i>
                                                    <span className="text-secondary">{formatConsumableDateTime(consumable.dateTime)}</span>
                                                </td>
                                                <td className="align-middle">
                                                    <i className="fas fa-user me-2 text-primary"></i>
                                                    <span className="small">{consumable.userName}</span>
                                                </td>
                                                <td className="align-middle text-center">
                                                    <Badge bg="info">{consumable.itemCount}</Badge>
                                                </td>
                                                <td className="align-middle text-center">
                                                    <Button
                                                        size="sm"
                                                        className="theme-btn-secondary"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleConsumableClick(consumable);
                                                        }}
                                                    >
                                                        <i className="fas fa-eye me-2"></i>
                                                        View
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </Table>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <style>{`
                .approve-consumable-screen {
                    height: 100vh;
                    overflow: hidden;
                    background-color: var(--page-body-bg);
                }

                .approve-consumable-content {
                    flex: 1;
                    min-height: 0;
                    display: flex;
                    flex-direction: column;
                }

                .approve-consumable-main-card {
                    flex: 1;
                    min-height: 0;
                    display: flex;
                    flex-direction: column;
                }

                .approve-consumable-main-header {
                    background-color: var(--page-header-bg);
                    border-bottom: 1px solid var(--border-color);
                }

                .approve-consumable-main-body {
                    flex: 1;
                    min-height: 0;
                }

                .approve-consumable-table-scroll {
                    flex: 1;
                    min-height: 0;
                    overflow-y: auto;
                }

                .approve-consumable-row {
                    cursor: pointer;
                }

                .approve-consumable-row:hover {
                    background-color: var(--table-row-hover-bg, rgba(0, 0, 0, 0.03));
                }

                .approve-consumable-index-badge {
                    width: 32px;
                    height: 32px;
                }
            `}</style>
            </div>

            <Modal show={showConsumableModal} onHide={handleCloseModal} size="xl" centered backdrop="static" keyboard={false}>
                <Modal.Header closeButton className="border-0" style={{ backgroundColor: 'var(--page-header-bg)' }}>
                    <Modal.Title style={{ color: 'var(--page-header-text)' }}>
                        <i className="fas fa-clipboard-list me-2"></i>
                        Consumable Details - {selectedConsumable?.consumableNo}
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body className="p-0">
                    <div className="p-3 bg-light border-bottom">
                        <div className="row g-3">
                            <div className="col-md-3">
                                <label className="text-secondary d-block mb-1">Consumable No</label>
                                <div className="fw-bold fs-5" style={{ color: 'var(--page-secondary-color)' }}>{selectedConsumable?.consumableNo}</div>
                            </div>
                            <div className="col-md-3">
                                <label className="text-secondary d-block mb-1">Date & Time</label>
                                <div className="fw-bold text-dark">{formatConsumableDateTime(selectedConsumable?.dateTime)}</div>
                            </div>
                            <div className="col-md-3">
                                <label className="text-secondary d-block mb-1">Entry User</label>
                                <div className="fw-bold text-dark">
                                    <i className="fas fa-user me-2" style={{ color: 'var(--page-secondary-color)' }}></i>
                                    {selectedConsumable?.userName}
                                </div>
                            </div>
                            <div className="col-md-3">
                                <label className="text-secondary d-block mb-1">Store</label>
                                <div className="fw-bold text-dark">
                                    <i className="fas fa-warehouse me-2" style={{ color: 'var(--page-secondary-color)' }}></i>
                                    {consumableDetails?.storeName || selectedConsumable?.storeName || 'Loading...'}
                                </div>
                            </div>
                        </div>
                    </div>

                    {loadingDetails ? (
                        <div className="text-center py-5">
                            <div className="spinner-border text-primary" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="mt-3 text-secondary">Loading consumable details...</p>
                        </div>
                    ) : !consumableDetails || editableDetails.length === 0 ? (
                        <div className="text-center py-5">
                            <i className="fas fa-inbox fa-3x text-secondary mb-3"></i>
                            <p className="text-secondary">No items in this consumable order</p>
                        </div>
                    ) : (
                        <Table className="mb-0">
                            <thead style={{ backgroundColor: 'var(--page-header-bg)', color: 'var(--page-header-text)', position: 'sticky', top: 0, zIndex: 1 }}>
                                <tr>
                                    <th className="py-3" style={{ width: '5%' }}>#</th>
                                    <th className="py-3" style={{ width: '22%' }}>Product</th>
                                    <th className="py-3" style={{ width: '12%' }}>Batch No</th>
                                    <th className="py-3" style={{ width: '16%' }}>Consumable Way</th>
                                    <th className="py-3 text-center" style={{ width: '10%' }}>Qty</th>
                                    <th className="py-3 text-center" style={{ width: '10%' }}>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {editableDetails.map((detail, index) => (
                                    <tr key={detail.id || `${detail.batchId}-${index}`}>
                                        <td className="align-middle">{index + 1}</td>
                                        <td className="align-middle">
                                            <div className="fw-medium">{detail.productName}</div>
                                        </td>
                                        <td className="align-middle">
                                            <Badge bg="light" text="dark" className="border">
                                                {detail.batchNo}
                                            </Badge>
                                        </td>
                                        <td className="align-middle">{detail.waysName}</td>
                                        <td className="align-middle text-center">
                                            <Badge bg="info">{detail.qty}</Badge>
                                        </td>
                                        <td className="align-middle text-center">
                                            {editableDetails.length > 1 && (
                                                <Button
                                                    variant="outline-danger"
                                                    size="sm"
                                                    onClick={() => handleRemoveDetailRow(detail.id)}
                                                >
                                                    <i className="fas fa-trash me-1"></i>
                                                    Remove
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </Table>
                    )}
                </Modal.Body>
                <Modal.Footer className="border-0 bg-light">
                    <div className="d-flex justify-content-between w-100">
                        <Button variant="outline-secondary" onClick={handleCloseModal}>
                            <i className="fas fa-times me-2"></i>
                            Close
                        </Button>
                        <div>
                            <Button
                                variant="danger"
                                className="me-2"
                                onClick={() => selectedConsumable && handleRejectConsumable(selectedConsumable)}
                                disabled={!selectedConsumable || loadingDetails || !consumableDetails}
                            >
                                <i className="fas fa-times-circle me-2"></i>
                                Reject
                            </Button>
                            {hasRemovedItems ? (
                                <Button
                                    variant="primary"
                                    onClick={handleSaveConsumable}
                                    className="theme-btn-primary"
                                    disabled={loadingDetails || !consumableDetails}
                                >
                                    <i className="fas fa-save me-2"></i>
                                    Save Consumable
                                </Button>
                            ) : (
                                <Button
                                    variant="success"
                                    onClick={() => selectedConsumable && handleApprove(selectedConsumable)}
                                    className="theme-btn-primary"
                                    disabled={!selectedConsumable || loadingDetails || !consumableDetails}
                                >
                                    <i className="fas fa-check-circle me-2"></i>
                                    Approve Consumable
                                </Button>
                            )}
                        </div>
                    </div>
                </Modal.Footer>
            </Modal>
        </>
    );
};

export default ApproveConsumable;
