import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../state/store';
import { Modal, Badge, Button, Form, Table } from 'react-bootstrap';
import '../../../../style/commonStyle.css';
import PageHeader from '../../../../components/PageHeader';
import { faClipboardCheck } from '@fortawesome/free-solid-svg-icons';
import CentralStoresApiService from '../../../../api/central-stores/central-stores-api-service';
import {
  closeAlert,
  showConfirmDialog,
  showCustomConfirmDialog,
  showErrorModal,
  showLoading,
  showSuccessToast,
  showValidationError,
  showWarningModal,
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

const formatTransferDateTime = (value?: string): string => {
  if (!value) return '-';

  // Expected backend format: dd-MM-yyyy HH:mm:ss
  const match = value.match(/^(\d{2})-(\d{2})-(\d{4})\s(\d{2}):(\d{2})(?::\d{2})?$/);
  if (!match) return value;

  const [, dd, mm, yyyy, hh, min] = match;
  const hour24 = Number(hh);
  const hour12 = hour24 % 12 === 0 ? 12 : hour24 % 12;
  const period = hour24 >= 12 ? 'PM' : 'AM';

  return `${dd}/${mm}/${yyyy} ${String(hour12).padStart(2, '0')}:${min} ${period}`;
};

interface TransferItem {
  id: number;
  medId: number;
  medicineName: string;
  genericName: string;
  batchId: number;
  batchNo: string;
  expiryDate: string;
  quantity: number;
  remarks: string;
}

interface TransferDetailItem {
  id: number;
  productId: number;
  productName: string;
  batchId: number;
  batchNo: string;
  quantity: number;
  entryDateTime: string;
}

interface TransferDetailsResponse {
  id: number;
  trNo: string;
  storeIdFrom: number;
  storeFromName: string;
  storeIdTo: number;
  storeToName: string;
  dateTimeEntry: string;
  uidEntry: number;
  entryUser: string;
  details: TransferDetailItem[];
}

interface PendingTransfer {
  transId?: number;  // Optional - backend not returning this field yet despite Swagger showing it
  noteNo: string;
  destination: string;
  dateTimeEntry: string;
  entryUser: string;
}

const ApproveTransfer: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const loginData = useSelector((state: RootState) => state.loginData);
  const [subModuleData, setSubModuleData] = useState<SubModuleState | null>(() => getStoreData());
  const centralStoresApi = new CentralStoresApiService();
  const [approvedTransfers, setApprovedTransfers] = useState<PendingTransfer[]>([]);
  const [pendingTransfers, setPendingTransfers] = useState<PendingTransfer[]>([]);
  const [selectedTransfer, setSelectedTransfer] = useState<PendingTransfer | null>(null);
  const [transferDetails, setTransferDetails] = useState<TransferDetailsResponse | null>(null);
  const [showTransferModal, setShowTransferModal] = useState(false);
  const [editingItems, setEditingItems] = useState<TransferItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [itemRemoved, setItemRemoved] = useState(false);
  
  const fetchPendingTransfers = async () => {
    try {
      const storeInfo = getStoreData();
      if (!storeInfo?.masterId) {
        showValidationError('Store context is missing. Please reselect the store.');
        navigate('/hims/central-stores', { replace: true });
        return;
      }
      
      const storeIdFrom = storeInfo.masterId; // Use masterId as store ID (same as PrepareOrder)
      
      console.log('Fetching pending transfers for store:', storeIdFrom);
      const response = await centralStoresApi.fetchAllUnapprovedTransferOrders(storeIdFrom);
      console.log('Pending transfers response:', response);
      setPendingTransfers(response);
    } catch (error) {
      console.error('Error fetching pending transfers:', error);
      showErrorModal('Failed to load pending transfers');
    }
  };

  const fetchApprovedTransfers = async () => {
    // Note: fetchAllApprovedTransferOrders endpoint does not exist
    // Only fetchAllUnapprovedTransferOrders is available
    // Keeping this function for future implementation when backend adds the endpoint
    console.log('Approved transfers endpoint not available yet');
    setApprovedTransfers([]);
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
      showValidationError('Store context is missing. Please reselect the store.');
      navigate('/hims/central-stores', { replace: true });
      return;
    }

    setSubModuleData(resolvedState);
    if (state) {
      sessionStorage.setItem('selectedStore', JSON.stringify(state));
    }
    
    // Fetch pending transfers on mount
    // Note: Only fetchAllUnapprovedTransferOrders endpoint exists
    fetchPendingTransfers();
    fetchApprovedTransfers();
  }, [loginData.authorized, location.state, navigate]);

  const handleTransferClick = async (transfer: PendingTransfer) => {
    setSelectedTransfer(transfer);
    setShowTransferModal(true);
    setLoadingDetails(true);
    setTransferDetails(null);
    setEditingItems([]);

    try {
      const transferId = transfer.transId;

      if (!transferId) {
        console.error('Transfer ID not found:', transfer);
        showErrorModal('Transfer ID not available. Cannot load details.');
        return;
      }

      const response = await centralStoresApi.fetchTransferDetailsById(transferId);
      setTransferDetails(response);

      const mappedItems: TransferItem[] = response.details.map((detail: any, index: number) => ({
        id: detail.id || index + 1,
        medId: detail.productId,
        medicineName: detail.productName,
        genericName: '',
        batchId: detail.batchId,
        batchNo: detail.batchNo,
        expiryDate: '',
        quantity: detail.quantity,
        remarks: ''
      }));

      setEditingItems(mappedItems);
      setHasUnsavedChanges(false);
    } catch (error) {
      console.error('Error fetching transfer details:', error);
      showErrorModal('Failed to load transfer details');
    } finally {
      setLoadingDetails(false);
    }
  };

  const handleCloseModal = async () => {
    if (hasUnsavedChanges) {
      const result = await showConfirmDialog(
        'You have unsaved changes. Are you sure you want to close?',
        'Unsaved Changes',
        'Yes, Discard Changes',
        'Continue Editing'
      );

      if (!result.isConfirmed) {
        return;
      }
    }

    setShowTransferModal(false);
    setSelectedTransfer(null);
    setTransferDetails(null);
    setEditingItems([]);
    setHasUnsavedChanges(false);
    setItemRemoved(false);
  };

  const handleQuantityChange = (itemId: number, newQuantity: number) => {
    setEditingItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      )
    );
    setHasUnsavedChanges(true);
  };

  const handleRemarksChange = (itemId: number, newRemarks: string) => {
    setEditingItems(prev => 
      prev.map(item => 
        item.id === itemId ? { ...item, remarks: newRemarks } : item
      )
    );
    setHasUnsavedChanges(true);
  };

  const handleDeleteItem = async (itemId: number) => {
    const result = await showConfirmDialog(
      'Are you sure you want to remove this item from the transfer?',
      'Remove Item?',
      'Yes, Remove',
      'Cancel'
    );

    if (result.isConfirmed) {
      setEditingItems(prev => prev.filter(item => item.id !== itemId));
      setHasUnsavedChanges(true);
      setItemRemoved(true);
      showSuccessToast('Item removed from transfer', 'Removed!', 1500);
    }
  };

  const handleSaveChanges = async () => {
    if (editingItems.length === 0) {
      showValidationError('Transfer must have at least one item', 'Error');
      return;
    }

    const invalidItems = editingItems.filter(item => item.quantity <= 0);
    if (invalidItems.length > 0) {
      showValidationError('All items must have quantity greater than 0', 'Error');
      return;
    }

    if (!transferDetails) {
      showErrorModal('Transfer details not available');
      return;
    }

    try {
      const transferId = transferDetails.id || selectedTransfer?.transId;

      if (!transferId) {
        showErrorModal('Transfer ID not available');
        return;
      }

      showLoading('Saving Changes...');

      const details = editingItems.map(item => ({
        productId: item.medId,
        batchId: item.batchId,
        quantity: item.quantity
      }));

      await centralStoresApi.updateTransferOrder(
        transferId,
        transferDetails.storeIdFrom,
        transferDetails.storeIdTo,
        details
      );

      closeAlert();
      showSuccessToast('Transfer changes saved successfully', 'Saved!', 2000);

      setHasUnsavedChanges(false);
      setItemRemoved(false);

      if (selectedTransfer) {
        const response = await centralStoresApi.fetchTransferDetailsById(transferId);
        setTransferDetails(response);
      }
    } catch (error: any) {
      closeAlert();
      console.error('Error saving transfer changes:', error);
      showErrorModal(error?.response?.data?.error || 'Failed to save changes');
    }
  };

  const handleApproveTransfer = async () => {
    if (editingItems.length === 0) {
      showValidationError('Cannot approve an empty transfer', 'Error');
      return;
    }

    if (!selectedTransfer) return;

    if (hasUnsavedChanges) {
      showWarningModal('Please save your changes before approving', 'Unsaved Changes');
      return;
    }

    const result = await showCustomConfirmDialog(
      'Approve Transfer?',
      `
        <p>Are you sure you want to approve this transfer?</p>
        <div class="text-start mt-3">
          <strong>Note Number:</strong> ${selectedTransfer.noteNo}<br>
          <strong>Destination:</strong> ${selectedTransfer.destination}<br>
          <strong>Date & Time:</strong> ${formatTransferDateTime(selectedTransfer.dateTimeEntry)}<br>
          <strong>Entry User:</strong> ${selectedTransfer.entryUser}
        </div>
      `,
      'question',
      '<i class="fas fa-check me-2"></i>Yes, Approve',
      'Cancel',
      'var(--btn-success)',
      'var(--btn-secondary)'
    );

    if (result.isConfirmed) {
      try {
        const transferId = selectedTransfer.transId;
        if (!transferId) {
          showErrorModal('Transfer ID not available. Cannot approve transfer.');
          return;
        }

        showLoading('Approving Transfer...');
        await centralStoresApi.approveTransferOrder(transferId, loginData.id);

        closeAlert();
        showSuccessToast('Transfer has been approved successfully', 'Approved!', 2000);

        setPendingTransfers(prev => prev.filter(transfer => transfer.noteNo !== selectedTransfer.noteNo));
        handleCloseModal();
        fetchPendingTransfers();
      } catch (error: any) {
        closeAlert();
        console.error('Error approving transfer:', error);
        showErrorModal(error?.response?.data?.error || 'Failed to approve transfer');
      }
    }
  };

  const handleRejectTransfer = async () => {
    if (!selectedTransfer) return;

    const result = await showConfirmDialog(
      `Note Number: ${selectedTransfer.noteNo}\nDestination: ${selectedTransfer.destination}\nDate & Time: ${formatTransferDateTime(selectedTransfer.dateTimeEntry)}\n\nAre you sure you want to reject this transfer?`,
      'Reject Transfer?',
      'Yes, Reject',
      'Cancel'
    );

    if (result.isConfirmed) {
      try {
        const transferId = selectedTransfer.transId;
        if (!transferId) {
          showErrorModal('Transfer ID not available. Cannot reject transfer.');
          return;
        }

        showLoading('Rejecting Transfer...');
        await centralStoresApi.cancelTransferOrder(transferId);

        closeAlert();
        showSuccessToast('Transfer has been rejected', 'Rejected!', 2000);

        setPendingTransfers(prev => prev.filter(transfer => transfer.noteNo !== selectedTransfer.noteNo));
        handleCloseModal();
        fetchPendingTransfers();
      } catch (error: any) {
        closeAlert();
        console.error('Error rejecting transfer:', error);
        showErrorModal(error?.response?.data?.error || 'Failed to reject transfer');
      }
    }
  };


  return (
    <>
      <div className="approve-transfer-screen d-flex flex-column h-100">
        <PageHeader
          icon={faClipboardCheck}
          title="Transfer Order Review & Approval"
          subtitle="Review and approve pending item transfers"
          badges={[
            { label: 'Pending', value: pendingTransfers.length.toString() }
          ]}
        />

        <div className="approve-transfer-content px-2 px-lg-3 pb-3 h-100">
          <div className="card border-0 shadow-sm approve-transfer-main-card">
            <div className="card-header approve-transfer-main-header">
              <div className="d-flex justify-content-end align-items-center">
                <Badge bg="light" text="dark" className="border">
                  Pending Transfers: {pendingTransfers.length}
                </Badge>
              </div>
            </div>

            <div className="card-body p-0 d-flex flex-column approve-transfer-main-body">
              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3 text-secondary">Loading pending transfers...</p>
                </div>
              ) : pendingTransfers.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fas fa-inbox fa-3x text-secondary mb-3"></i>
                  <h5 className="text-secondary">No Pending Transfers</h5>
                  <p className="text-secondary">All transfers have been processed</p>
                </div>
              ) : (
                <div className="approve-transfer-table-scroll">
                  <Table hover className="mb-0" style={{ minWidth: '800px' }}>
                    <thead style={{ backgroundColor: 'var(--table-header-bg)', color: 'var(--table-header-text)', position: 'sticky', top: 0, zIndex: 1 }}>
                        <tr>
                          <th className="py-3" style={{ width: '5%' }}>#</th>
                          <th className="py-3" style={{ width: '20%' }}>Note No</th>
                          <th className="py-3" style={{ width: '25%' }}>Destination</th>
                          <th className="py-3" style={{ width: '20%' }}>Date & Time</th>
                          <th className="py-3" style={{ width: '20%' }}>Entry User</th>
                          <th className="py-3 text-center" style={{ width: '10%' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                      {pendingTransfers.map((transfer, index) => (
                        <tr
                          key={transfer.noteNo}
                          className="approve-transfer-row"
                          onClick={() => handleTransferClick(transfer)}
                        >
                          <td className="align-middle">
                            <div className="rounded-circle bg-light d-inline-flex align-items-center justify-content-center"
                                 style={{ width: '32px', height: '32px' }}>
                              <span className="fw-bold text-primary">{index + 1}</span>
                            </div>
                          </td>
                          <td className="align-middle">
                            <div className="fw-bold text-body">{transfer.noteNo}</div>
                          </td>
                          <td className="align-middle">
                            <i className="fas fa-hospital me-2 text-primary"></i>
                            <span className="small">{transfer.destination}</span>
                          </td>
                          <td className="align-middle">
                            <i className="fas fa-calendar-alt me-2 text-secondary"></i>
                            <span className="text-secondary">{formatTransferDateTime(transfer.dateTimeEntry)}</span>
                          </td>
                          <td className="align-middle">
                            <i className="fas fa-user me-2 text-primary"></i>
                            <span className="small">{transfer.entryUser}</span>
                          </td>
                          <td className="align-middle text-center">
                            <Button
                              size="sm"
                              className="theme-btn-secondary"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTransferClick(transfer);
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
      </div>

      <style>{`
        .approve-transfer-screen {
          height: 100vh;
          overflow: hidden;
          background-color: var(--page-body-bg);
        }

        .approve-transfer-content {
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
        }

        .approve-transfer-main-card {
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
        }

        .approve-transfer-main-header {
          background-color: var(--page-header-bg);
          border-bottom: 1px solid var(--border-color);
        }

        .approve-transfer-main-body {
          flex: 1;
          min-height: 0;
        }

        .approve-transfer-table-scroll {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
        }

        .approve-transfer-row {
          cursor: pointer;
        }

        .approve-transfer-row:hover {
          background-color: var(--table-row-hover-bg, rgba(0, 0, 0, 0.03));
        }
      `}</style>

      {/* Transfer Details Modal */}
      <Modal show={showTransferModal} onHide={handleCloseModal} size="xl" centered backdrop="static" keyboard={false}>
        <Modal.Header closeButton className="border-0" style={{ backgroundColor: 'var(--page-header-bg)' }}>
          <Modal.Title style={{ color: 'var(--page-header-text)' }}>
            <i className="fas fa-dolly me-2"></i>
            Transfer Details - {selectedTransfer?.noteNo}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          <div className="p-3 bg-light border-bottom">
            <div className="row g-3">
              <div className="col-md-3">
                <label className="text-secondary d-block mb-1">Note Number</label>
                <div className="fw-bold fs-5" style={{color:'var(--page-secondary-color)'}}>{selectedTransfer?.noteNo}</div>
              </div>
              <div className="col-md-3">
                <label className="text-secondary d-block mb-1">Date & Time</label>
                <div className="fw-bold text-dark">{formatTransferDateTime(selectedTransfer?.dateTimeEntry)}</div>
              </div>
              <div className="col-md-3">
                <label className="text-secondary d-block mb-1">Entry User</label>
                <div className="fw-bold text-dark">
                  <i className="fas fa-user me-2" style={{color:'var(--page-secondary-color)'}}></i>
                  {selectedTransfer?.entryUser}
                </div>
              </div>
              <div className="col-md-3">
                <label className="text-secondary d-block mb-1">Transfer</label>
                <div className="fw-bold text-dark">
                  <i className="fas fa-warehouse me-2" style={{color:'var(--page-secondary-color)'}}></i>
                  {transferDetails?.storeFromName || 'Loading...'} 
                  <i className="fas fa-arrow-right mx-2" style={{color:'var(--page-secondary-color)'}}></i>
                  {transferDetails?.storeToName || 'Loading...'}
                </div>
              </div>
            </div>
          </div>

          {loadingDetails ? (
            <div className="text-center py-5">
              <div className="spinner-border text-primary" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
              <p className="mt-3 text-secondary">Loading transfer details...</p>
            </div>
          ) : editingItems.length === 0 ? (
            <div className="text-center py-5">
              <i className="fas fa-inbox fa-3x text-secondary mb-3"></i>
              <p className="text-secondary">No items in this transfer</p>
            </div>
          ) : (
            <Table className="mb-0">
              <thead style={{ backgroundColor: 'var(--page-header-bg)', color: 'var(--page-header-text)', position: 'sticky', top: 0, zIndex: 1 }}>
                <tr>
                  <th className="py-3" style={{ width: '5%' }}>#</th>
                  <th className="py-3" style={{ width: '20%' }}>Item Name</th>
                  <th className="py-3" style={{ width: '12%' }}>Batch No</th>
                  <th className="py-3" style={{ width: '12%' }} hidden>Expiry Date</th>
                  <th className="py-3" style={{ width: '10%' }}>Quantity</th>
                  <th className="py-3" style={{ width: '26%' }}>Remarks</th>
                  <th className="py-3 text-center" style={{ width: '15%' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {editingItems.map((item, index) => (
                  <tr key={item.id}>
                    <td className="align-middle">{index + 1}</td>
                    <td className="align-middle">
                      <div className="fw-medium">{item.medicineName}</div>
                      <small className="text-secondary" style={{ fontSize: '0.85em' }}>{item.genericName}</small>
                    </td>
                    <td className="align-middle">
                      <Badge bg="light" text="dark" className="border">
                        {item.batchNo}
                      </Badge>
                    </td>
                    <td className="align-middle" hidden>
                      <small className="text-secondary">
                        <i className="fas fa-calendar me-1"></i>
                        {new Date(item.expiryDate).toLocaleDateString('en-GB')}
                        
                      </small>
                    </td>
                    <td className="align-middle">
                      <Form.Control
                        type="number"
                        size="sm"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0)}
                        style={{ width: '80px' }}
                        disabled
                      />
                    </td>
                    <td className="align-middle">
                      <Form.Control
                        type="text"
                        size="sm"
                        value={item.remarks}
                        onChange={(e) => handleRemarksChange(item.id, e.target.value)}
                        placeholder="Optional remarks"
                      />
                    </td>
                    <td className="align-middle text-center">
                      {editingItems.length > 1 && (
                        <Button
                          variant="outline-danger"
                          size="sm"
                          onClick={() => handleDeleteItem(item.id)}
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
            <div>
              <Button 
                onClick={handleCloseModal}
                className="me-2 theme-outline-btn-primary"
              >
                <i className="fas fa-times me-2"></i>
                Close
              </Button>
              {hasUnsavedChanges && (
                <Badge bg="warning" text="dark" className="px-3 py-2">
                  <i className="fas fa-exclamation-triangle me-2"></i>
                  Unsaved Changes
                </Badge>
              )}
            </div>
            <div>
              <Button 
                variant="danger" 
                onClick={handleRejectTransfer}
                className="me-2"
                disabled={!selectedTransfer || loadingDetails || !transferDetails}
              >
                <i className="fas fa-times-circle me-2"></i>
                Reject
              </Button>
              {hasUnsavedChanges ? (
                <Button 
                  variant="primary" 
                  onClick={handleSaveChanges}
                  className="me-2"
                  disabled={loadingDetails || !transferDetails}
                >
                  <i className="fas fa-save me-2"></i>
                  Save Changes
                </Button>
              ) : (
                <Button 
                  onClick={handleApproveTransfer}
                  className="theme-btn-primary"
                  disabled={!selectedTransfer || loadingDetails || !transferDetails}
                >
                  <i className="fas fa-check-circle me-2"></i>
                  Approve Transfer
                </Button>
              )}
            </div>
          </div>
        </Modal.Footer>
      </Modal>
    </>
  );
};

export default ApproveTransfer;
