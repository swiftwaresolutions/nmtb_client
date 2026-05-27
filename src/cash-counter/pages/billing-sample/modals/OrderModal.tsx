import React, { useState, useEffect, useMemo } from 'react';
import { Modal, Table, Spinner, Alert, Form, InputGroup, Button } from 'react-bootstrap';
import { FaClipboardList, FaSearch, FaCheckCircle } from 'react-icons/fa';
import CashCounterApiService from '../../../../api/cash-counter/cash-counter-api-service';

const FaClipboardListIcon = FaClipboardList as any;
const FaSearchIcon = FaSearch as any;
const FaCheckCircleIcon = FaCheckCircle as any;

export interface InvestigationDetail {
  groupName: string;
  procName: string;
  unit: number;
  rate: number;
  disc: number;
  procId?: number;
  groupId?: number;
}

export interface LabDetail {
  deptName: string;
  testName: string;
  unit: number;
  rate: number;
  disc: number;
  testId?: number;
  deptId?: number;
}

export interface PharmacyDetail {
  genericName: string;
  prodsName: string;
  batchNo: string;
  units: number;
  mrp: number;
  total: number;
  prodsId?: number;
  batchId?: number;
}

export interface InvestigationOrder {
  id: number;
  orderNo: string;
  details: InvestigationDetail[];
}

export interface LabOrder {
  id: number;
  orderNo: string;
  details: LabDetail[];
}

export interface PharmacyOrder {
  id: number;
  orderNo: string;
  details: PharmacyDetail[];
}

interface OrderDetailsResponse {
  investigationOrders: InvestigationOrder[];
  labOrders: LabOrder[];
  pharmacyOrders: PharmacyOrder[];
}

export interface BillingPermissions {
  hasProcedureAccess: boolean;
  hasPharmacyAccess: boolean;
  hasLabAccess: boolean;
  hasIPAccess: boolean;
  canSaveBill: boolean;
  canOrderBill: boolean;
  canDiscount: boolean;
  canDuplicate: boolean;
}

interface OrderModalProps {
  show: boolean;
  onHide: () => void;
  patientId: string;
  visitId: string;
  onSelectInvestigationOrder?: (order: InvestigationOrder) => void;
  onSelectLabOrder?: (order: LabOrder) => void;
  onSelectPharmacyOrder?: (order: PharmacyOrder) => void;
  activeTab?: 'procedure' | 'pharmacy' | 'lab' | null;
  permissions?: BillingPermissions;
  selectedPharmacyOrderIds?: number[];
  selectedInvestigationOrderIds?: number[];
  selectedLabOrderIds?: number[];
}

const OrderModal: React.FC<OrderModalProps> = ({ 
  show, 
  onHide, 
  patientId, 
  visitId,
  onSelectInvestigationOrder,
  onSelectLabOrder,
  onSelectPharmacyOrder,
  activeTab,
  permissions = { hasProcedureAccess: true, hasPharmacyAccess: true, hasLabAccess: true, hasIPAccess: true },
  selectedPharmacyOrderIds = [],
  selectedInvestigationOrderIds = [],
  selectedLabOrderIds = [],
}) => {
  const themePrimary = 'var(--page-primary-color)';
  const themeSecondary = 'var(--page-secondary-color)';
  const [orderDetails, setOrderDetails] = useState<OrderDetailsResponse | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filterText, setFilterText] = useState<string>('');
  const apiService = new CashCounterApiService();

  useEffect(() => {
    if (show && patientId && visitId) {
      fetchOrderDetails();
      setFilterText(''); // Reset filter when modal opens
    }
  }, [show, patientId, visitId]);

  const fetchOrderDetails = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await apiService.fetchOrderDetails(patientId, visitId);
      // Extract numeric ID from orderNo (e.g. "INVO-14" → 14, "LAB-15" → 15, "PH-39" → 39)
      const extractId = (o: any): number => {
        if (o.id) return o.id;
        if (o.orderId) return o.orderId;
        if (o.invOrderId) return o.invOrderId;
        if (o.labOrderId) return o.labOrderId;
        if (o.phOrderId) return o.phOrderId;
        const match = (o.orderNo || '').match(/(\d+)$/);
        return match ? parseInt(match[1], 10) : 0;
      };
      const normalized: OrderDetailsResponse = {
        investigationOrders: (data.investigationOrders || []).map((o: any) => ({ ...o, id: extractId(o) })),
        labOrders: (data.labOrders || []).map((o: any) => ({ ...o, id: extractId(o) })),
        pharmacyOrders: (data.pharmacyOrders || []).map((o: any) => ({ ...o, id: extractId(o) })),
      };
      setOrderDetails(normalized);
    } catch (err) {
      setError('Failed to fetch order details');
      console.error('Error fetching order details:', err);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter orders based on search text
  const filteredOrders = useMemo(() => {
    if (!orderDetails) return null;
    
    const searchTerm = filterText.toLowerCase().trim();
    if (!searchTerm) return orderDetails;

    return {
      investigationOrders: orderDetails.investigationOrders?.filter(order => 
        order.orderNo.toLowerCase().includes(searchTerm)
      ) || [],
      labOrders: orderDetails.labOrders?.filter(order => 
        order.orderNo.toLowerCase().includes(searchTerm)
      ) || [],
      pharmacyOrders: orderDetails.pharmacyOrders?.filter(order => 
        order.orderNo.toLowerCase().includes(searchTerm)
      ) || []
    };
  }, [orderDetails, filterText]);

  const isOrderTypeVisible = (orderType: 'investigation' | 'lab' | 'pharmacy') => {
    if (!activeTab) return true;
    if (activeTab === 'procedure') return orderType === 'investigation';
    return activeTab === orderType;
  };

  const handleSelectInvestigationOrder = (order: InvestigationOrder) => {
    if (onSelectInvestigationOrder) {
      onSelectInvestigationOrder(order);
      onHide();
    }
  };

  const handleSelectLabOrder = (order: LabOrder) => {
    if (onSelectLabOrder) {
      onSelectLabOrder(order);
      onHide();
    }
  };

  const handleSelectPharmacyOrder = (order: PharmacyOrder) => {
    if (onSelectPharmacyOrder) {
      onSelectPharmacyOrder(order);
      onHide();
    }
  };

  const handleLoadAllInvestigationOrders = () => {
    if (!filteredOrders?.investigationOrders || !onSelectInvestigationOrder) return;
    filteredOrders.investigationOrders.forEach(order => {
      onSelectInvestigationOrder(order);
    });
    onHide();
  };

  const handleLoadAllLabOrders = () => {
    if (!filteredOrders?.labOrders || !onSelectLabOrder) return;
    filteredOrders.labOrders.forEach(order => {
      onSelectLabOrder(order);
    });
    onHide();
  };

  const handleLoadAllPharmacyOrders = () => {
    if (!filteredOrders?.pharmacyOrders || !onSelectPharmacyOrder) return;
    filteredOrders.pharmacyOrders.forEach(order => {
      onSelectPharmacyOrder(order);
    });
    onHide();
  };

  const handleLoadAllPermittedOrders = () => {
    // Load all order types based on permissions
    if (
      isOrderTypeVisible('investigation') &&
      permissions.hasProcedureAccess &&
      filteredOrders?.investigationOrders &&
      onSelectInvestigationOrder
    ) {
      filteredOrders.investigationOrders.forEach(order => {
        onSelectInvestigationOrder(order);
      });
    }
    if (
      isOrderTypeVisible('lab') &&
      permissions.hasLabAccess &&
      filteredOrders?.labOrders &&
      onSelectLabOrder
    ) {
      filteredOrders.labOrders.forEach(order => {
        onSelectLabOrder(order);
      });
    }
    if (
      isOrderTypeVisible('pharmacy') &&
      permissions.hasPharmacyAccess &&
      filteredOrders?.pharmacyOrders &&
      onSelectPharmacyOrder
    ) {
      filteredOrders.pharmacyOrders.forEach(order => {
        onSelectPharmacyOrder(order);
      });
    }
    onHide();
  };

  // Calculate total count of all permitted orders (only those with available handlers)
  const getTotalPermittedOrdersCount = () => {
    let count = 0;
    if (
      isOrderTypeVisible('investigation') &&
      permissions.hasProcedureAccess &&
      filteredOrders?.investigationOrders &&
      onSelectInvestigationOrder
    ) {
      count += filteredOrders.investigationOrders.length;
    }
    if (
      isOrderTypeVisible('lab') &&
      permissions.hasLabAccess &&
      filteredOrders?.labOrders &&
      onSelectLabOrder
    ) {
      count += filteredOrders.labOrders.length;
    }
    if (
      isOrderTypeVisible('pharmacy') &&
      permissions.hasPharmacyAccess &&
      filteredOrders?.pharmacyOrders &&
      onSelectPharmacyOrder
    ) {
      count += filteredOrders.pharmacyOrders.length;
    }
    return count;
  };

  // Check if there are multiple order types with available handlers
  const hasMultipleOrderTypes = () => {
    let typeCount = 0;
    if (
      isOrderTypeVisible('investigation') &&
      permissions.hasProcedureAccess &&
      filteredOrders?.investigationOrders &&
      filteredOrders.investigationOrders.length > 0 &&
      onSelectInvestigationOrder
    ) {
      typeCount++;
    }
    if (
      isOrderTypeVisible('lab') &&
      permissions.hasLabAccess &&
      filteredOrders?.labOrders &&
      filteredOrders.labOrders.length > 0 &&
      onSelectLabOrder
    ) {
      typeCount++;
    }
    if (
      isOrderTypeVisible('pharmacy') &&
      permissions.hasPharmacyAccess &&
      filteredOrders?.pharmacyOrders &&
      filteredOrders.pharmacyOrders.length > 0 &&
      onSelectPharmacyOrder
    ) {
      typeCount++;
    }
    return typeCount > 1;
  };

  const hasVisibleOrders = () => {
    if (!filteredOrders) return false;

    const hasInvestigationOrders = isOrderTypeVisible('investigation') &&
      !!filteredOrders.investigationOrders?.length;
    const hasLabOrders = isOrderTypeVisible('lab') && !!filteredOrders.labOrders?.length;
    const hasPharmacyOrders = isOrderTypeVisible('pharmacy') && !!filteredOrders.pharmacyOrders?.length;

    return hasInvestigationOrders || hasLabOrders || hasPharmacyOrders;
  };

  // Render functions for each order type
  const renderInvestigationOrders = () => {
    if (!isOrderTypeVisible('investigation')) return null;
    if (!permissions.hasProcedureAccess) return null;
    if (!filteredOrders?.investigationOrders || filteredOrders.investigationOrders.length === 0) return null;
    
    return filteredOrders.investigationOrders.map((order, orderIdx) => {
      const isAlreadySelected = selectedInvestigationOrderIds.includes(order.id);
      return (
      <div key={`inv-${orderIdx}`} className="mb-4">
        <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
          <div className="d-flex align-items-center gap-2">
            <span className="badge small theme-badge-primary">Investigation</span>
            <span className="small fw-bold">{order.orderNo}</span>
          </div>
          {onSelectInvestigationOrder && (
            isAlreadySelected ? (
              <Button
                size="sm"
                variant="success"
                disabled
                className="d-flex align-items-center gap-1"
              >
                <FaCheckCircleIcon size={12} />
                <span style={{ fontSize: '0.75rem' }}>Already Selected</span>
              </Button>
            ) : (
              <Button 
                size="sm" 
                variant="outline-success"
                onClick={() => handleSelectInvestigationOrder(order)}
                className="d-flex align-items-center gap-1"
              >
                <FaCheckCircleIcon size={12} />
                <span style={{ fontSize: '0.75rem' }}>Select</span>
              </Button>
            )
          )}
        </div>
        <Table striped bordered hover size="sm" className="mb-0">
          <thead style={{ fontSize: '0.75rem' }}>
            <tr>
              <th>Group</th>
              <th>Procedure</th>
              <th className="text-center" style={{ width: '60px' }}>Qty</th>
              <th className="text-end" style={{ width: '80px' }}>Rate</th>
              <th className="text-end" style={{ width: '80px' }}>Discount</th>
            </tr>
          </thead>
          <tbody style={{ fontSize: '0.85rem' }}>
            {order.details.map((item, idx) => (
              <tr key={idx}>
                <td className="small fw-5">{item.groupName}</td>
                <td className="small">{item.procName}</td>
                <td className="text-center small">{item.unit}</td>
                <td className="text-end small">₹{item.rate.toFixed(2)}</td>
                <td className="text-end small text-success">-₹{item.disc.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      );
    });
  };

  const renderLabOrders = () => {
    if (!isOrderTypeVisible('lab')) return null;
    if (!permissions.hasLabAccess) return null;
    if (!filteredOrders?.labOrders || filteredOrders.labOrders.length === 0) return null;
    
    return filteredOrders.labOrders.map((order, orderIdx) => {
      const isAlreadySelected = selectedLabOrderIds.includes(order.id);
      return (
      <div key={`lab-${orderIdx}`} className="mb-4">
        <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
          <div className="d-flex align-items-center gap-2">
            <span className="badge small theme-badge-primary">Lab</span>
            <span className="small fw-bold">{order.orderNo}</span>
          </div>
          {onSelectLabOrder && (
            isAlreadySelected ? (
              <Button
                size="sm"
                variant="success"
                disabled
                className="d-flex align-items-center gap-1"
              >
                <FaCheckCircleIcon size={12} />
                <span style={{ fontSize: '0.75rem' }}>Already Selected</span>
              </Button>
            ) : (
              <Button 
                size="sm" 
                variant="outline-success"
                onClick={() => handleSelectLabOrder(order)}
                className="d-flex align-items-center gap-1"
              >
                <FaCheckCircleIcon size={12} />
                <span style={{ fontSize: '0.75rem' }}>Select</span>
              </Button>
            )
          )}
        </div>
        <Table striped bordered hover size="sm" className="mb-0">
          <thead style={{ fontSize: '0.75rem' }}>
            <tr>
              <th>Department</th>
              <th>Test Name</th>
              <th className="text-center" style={{ width: '60px' }}>Qty</th>
              <th className="text-end" style={{ width: '80px' }}>Rate</th>
              <th className="text-end" style={{ width: '80px' }}>Discount</th>
            </tr>
          </thead>
          <tbody style={{ fontSize: '0.85rem' }}>
            {order.details.map((item, idx) => (
              <tr key={idx}>
                <td className="small fw-5">{item.deptName}</td>
                <td className="small">{item.testName}</td>
                <td className="text-center small">{item.unit}</td>
                <td className="text-end small">₹{item.rate.toFixed(2)}</td>
                <td className="text-end small text-success">-₹{item.disc.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      );
    });
  };

  const renderPharmacyOrders = () => {
    if (!isOrderTypeVisible('pharmacy')) return null;
    if (!permissions.hasPharmacyAccess) return null;
    if (!filteredOrders?.pharmacyOrders || filteredOrders.pharmacyOrders.length === 0) return null;
    
    return filteredOrders.pharmacyOrders.map((order, orderIdx) => {
      const isAlreadySelected = selectedPharmacyOrderIds.includes(order.id);
      return (
      <div key={`ph-${orderIdx}`} className="mb-4">
        <div className="d-flex align-items-center justify-content-between gap-2 mb-2">
          <div className="d-flex align-items-center gap-2">
            <span className="badge small theme-badge-primary">Pharmacy</span>
            <span className="small fw-bold">{order.orderNo}</span>
          </div>
          {onSelectPharmacyOrder && (
            isAlreadySelected ? (
              <Button
                size="sm"
                variant="success"
                disabled
                className="d-flex align-items-center gap-1"
              >
                <FaCheckCircleIcon size={12} />
                <span style={{ fontSize: '0.75rem' }}>Already Selected</span>
              </Button>
            ) : (
              <Button 
                size="sm" 
                variant="outline-success"
                onClick={() => handleSelectPharmacyOrder(order)}
                className="d-flex align-items-center gap-1"
              >
                <FaCheckCircleIcon size={12} />
                <span style={{ fontSize: '0.75rem' }}>Select</span>
              </Button>
            )
          )}
        </div>
        <Table striped bordered hover size="sm" className="mb-0">
          <thead>
            <tr>
              <th>Generic Name</th>
              <th>Product Name</th>
              <th className="text-center" style={{ width: '60px' }}>Batch</th>
              <th className="text-center" style={{ width: '50px' }}>Qty</th>
              <th className="text-end" style={{ width: '70px' }}>MRP</th>
              <th className="text-end" style={{ width: '80px' }}>Total</th>
            </tr>
          </thead>
          <tbody style={{ fontSize: '0.85rem' }}>
            {order.details.map((item, idx) => (
              <tr key={idx}>
                <td className="small">{item.genericName}</td>
                <td className="small fw-5">{item.prodsName}</td>
                <td className="text-center small">{item.batchNo}</td>
                <td className="text-center small">{item.units}</td>
                <td className="text-end small">₹{item.mrp.toFixed(2)}</td>
                <td className="text-end small fw-bold">₹{item.total.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
      );
    });
  };

  // Determine order of sections based on active tab
  const getOrderedSections = () => {
    const sections = [];

    if (activeTab === 'lab') {
      sections.push(renderLabOrders());
    } else if (activeTab === 'pharmacy') {
      sections.push(renderPharmacyOrders());
    } else if (activeTab === 'procedure') {
      sections.push(renderInvestigationOrders());
    } else {
      // Default order (procedure first or no activeTab)
      sections.push(renderInvestigationOrders(), renderLabOrders(), renderPharmacyOrders());
    }
    
    return sections.filter(section => section !== null);
  };

  return (
    <Modal show={show} onHide={onHide} size="lg" centered backdrop="static" keyboard={false}>
      <Modal.Header
        closeButton
        className="bg-light border-bottom"
      >
        <Modal.Title className="fw-bold d-flex align-items-center gap-2">
          <FaClipboardListIcon style={{ color: themeSecondary }} />
          Order Details
        </Modal.Title>
      </Modal.Header>
      
      {/* Filter Section */}
      {orderDetails && !isLoading && (
        <div className="p-3 bg-light border-bottom">
          <InputGroup size="sm">
            <InputGroup.Text className="bg-white">
              <FaSearchIcon style={{ color: themePrimary }} />
            </InputGroup.Text>
            <Form.Control
              type="text"
              placeholder="Filter by order number..."
              value={filterText}
              onChange={(e) => setFilterText(e.target.value)}
              className="border-start-0"
            />
            {filterText && (
              <Button 
                variant="outline-secondary" 
                onClick={() => setFilterText('')}
                style={{ borderLeft: 'none' }}
              >
                Clear
              </Button>
            )}
          </InputGroup>
        </div>
      )}

      {/* Load All Buttons Section */}
      {orderDetails && !isLoading && (
        <div className="p-3 bg-white border-bottom">
          <div className="d-flex flex-wrap align-items-center gap-2">
            <span className="small text-muted me-2">Quick Load:</span>
            
            {/* Load All Orders Button - shows if there are any permitted orders */}
            {getTotalPermittedOrdersCount() > 0 && (
              <Button 
                variant="primary" 
                size="sm"
                onClick={handleLoadAllPermittedOrders}
                className="d-flex align-items-center gap-1 fw-bold"
              >
                <FaCheckCircleIcon size={14} />
                <span>Load All Orders ({getTotalPermittedOrdersCount()})</span>
              </Button>
            )}
            
            {isOrderTypeVisible('investigation') && permissions.hasProcedureAccess && filteredOrders?.investigationOrders && filteredOrders.investigationOrders.length > 0 && onSelectInvestigationOrder && (
              <Button 
                variant="outline-primary" 
                size="sm"
                onClick={handleLoadAllInvestigationOrders}
                className="d-flex align-items-center gap-1"
              >
                <FaCheckCircleIcon size={12} />
                <span>Load All Procedure Orders ({filteredOrders.investigationOrders.length})</span>
              </Button>
            )}
            {isOrderTypeVisible('lab') && permissions.hasLabAccess && filteredOrders?.labOrders && filteredOrders.labOrders.length > 0 && onSelectLabOrder && (
              <Button 
                variant="outline-info" 
                size="sm"
                onClick={handleLoadAllLabOrders}
                className="d-flex align-items-center gap-1"
              >
                <FaCheckCircleIcon size={12} />
                <span>Load All Lab Orders ({filteredOrders.labOrders.length})</span>
              </Button>
            )}
            {isOrderTypeVisible('pharmacy') && permissions.hasPharmacyAccess && filteredOrders?.pharmacyOrders && filteredOrders.pharmacyOrders.length > 0 && onSelectPharmacyOrder && (
              <Button 
                variant="outline-success" 
                size="sm"
                onClick={handleLoadAllPharmacyOrders}
                className="d-flex align-items-center gap-1"
              >
                <FaCheckCircleIcon size={12} />
                <span>Load All Pharmacy Orders ({filteredOrders.pharmacyOrders.length})</span>
              </Button>
            )}
          </div>
        </div>
      )}

      <Modal.Body className="p-0 d-flex flex-column" style={{ maxHeight: 'calc(100vh - 180px)' }}>
        {isLoading && (
          <div className="d-flex align-items-center justify-content-center py-5">
            <Spinner animation="border" role="status" style={{ color: themePrimary }}>
              <span className="visually-hidden">Loading...</span>
            </Spinner>
          </div>
        )}

        {error && (
          <div className="p-3">
            <Alert variant="danger" className="mb-0">
              {error}
            </Alert>
          </div>
        )}

        {filteredOrders && !isLoading && (
          <>
            {/* Tables Section */}
            <div className="flex-grow-1 overflow-auto" style={{ minHeight: 0 }}>
              <div className="p-3">
                {getOrderedSections()}

                {!hasVisibleOrders() && (
                  <Alert className="mb-0" style={{ backgroundColor: themeSecondary, color: themePrimary, borderColor: themePrimary }}>
                    No order details found for this patient.
                  </Alert>
                )}
              </div>
            </div>
          </>
        )}
      </Modal.Body>
    </Modal>
  );
};

export default OrderModal;
