import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Row, Col, Card, Form, Button, Table, Badge, Modal, ListGroup } from 'react-bootstrap';
import { FaStethoscope, FaTrash, FaPlus, FaClipboardList, FaListUl, FaBoxOpen } from 'react-icons/fa';
import { CashCounterApiService } from '../../../../api/cash-counter/cash-counter-api-service';
import { showErrorToast, showWarningToast, showSuccessToast } from '../../../../utils/alertUtil';
import OrderModal, { InvestigationOrder, LabOrder, PharmacyOrder, BillingPermissions } from '../modals/OrderModal';

// Fix for TS2786: 'Icon' cannot be used as a JSX component.
const FaStethoscopeIcon = FaStethoscope as any;
const FaTrashIcon = FaTrash as any;
const FaPlusIcon = FaPlus as any;
const FaClipboardListIcon = FaClipboardList as any;
const FaListUlIcon = FaListUl as any;
const FaBoxOpenIcon = FaBoxOpen as any;

interface ProcedureItem {
  id: number;
  groupName?: string;
  name?: string;
  unit: number;
  cost?: number;
  discount?: number;
  total: number;
  particularId?: number;
  groupId?: number;
  invOrderId?: number;
}

interface ProcedureBillingProps {
  items: ProcedureItem[];
  resetTrigger?: number;
  onAddItem: (item: ProcedureItem) => void;
  onRemoveItem: (id: number) => void;
  procedureNameInputRef?: React.RefObject<HTMLInputElement>;
  patient?: any;
  accountHeads?: any[];
  patientId?: string;
  visitId?: string;
  permissions?: BillingPermissions;
  onSelectLabOrderFromModal?: (order: LabOrder) => void;
  onSelectPharmacyOrderFromModal?: (order: PharmacyOrder) => void;
  onRegisterOrderHandler?: (handler: (order: InvestigationOrder) => void) => void;
}

const ProcedureBilling: React.FC<ProcedureBillingProps> = ({
  items,
  resetTrigger,
  onAddItem,
  onRemoveItem,
  procedureNameInputRef,
  patient,
  accountHeads = [],
  patientId,
  visitId,
  permissions,
  onSelectLabOrderFromModal,
  onSelectPharmacyOrderFromModal,
  onRegisterOrderHandler,
}) => {
  const cashCounterApi = new CashCounterApiService();
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const unitInputRef = useRef<HTMLInputElement>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [procedureSuggestions, setProcedureSuggestions] = useState<any[]>([]);
  const [showProcedureSuggestions, setShowProcedureSuggestions] = useState(false);
  const [procedureSearchTerm, setProcedureSearchTerm] = useState('');
  const [selectedProcedureIndex, setSelectedProcedureIndex] = useState<number>(-1);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [packages, setPackages] = useState<any[]>([]);

  const [newItem, setNewItem] = useState<any>({
    groupName: '',
    name: '',
    unit: 1,
    cost: 0,
    discount: 0,
    total: 0,
    particularId: 0,
    groupId: 0,
    isEditable: 0,
  });

  const handleProcedureSearch = async (searchValue: string) => {
    setProcedureSearchTerm(searchValue);
    setNewItem({...newItem, name: searchValue});
    
    if (!searchValue || searchValue.length < 2) {
      setProcedureSuggestions([]);
      setShowProcedureSuggestions(false);
      setSelectedProcedureIndex(-1);
      return;
    }

    if (!patient?.debitHead) {
      showWarningToast('Please search patient first to determine account head');
      return;
    }

    try {
      // Find account head ID from the account category name
      const accountHead = accountHeads.find(
        head => head.headName === patient.debitHead
      );
      
      if (!accountHead) {
        console.error('Account head not found for:', patient.debitHead);
        showErrorToast('Account head not configured for this patient category');
        return;
      }
      
      const accHeadId = accountHead.headId;
      console.log('Fetching procedures for accHeadId:', accHeadId, 'debitHead:', patient.debitHead);
      const procedures = await cashCounterApi.fetchProceduresForBilling(accHeadId, searchValue);
      console.log('Received procedures:', procedures);
      setProcedureSuggestions(procedures);
      setShowProcedureSuggestions(procedures.length > 0);
      setSelectedProcedureIndex(-1);
    } catch (error) {
      console.error('Error fetching procedures:', error);
      setProcedureSuggestions([]);
      setShowProcedureSuggestions(false);
      setSelectedProcedureIndex(-1);
    }
  };

  const handleLoadPackages = async () => {
    try {
      const all = await cashCounterApi.fetchAllPackageDetails();
      const filtered = all.filter((p: any) => Number(p.isProcedure) === 1);
      setPackages(filtered);
      setShowPackageModal(true);
    } catch (error) {
      console.error('Error loading packages:', error);
      showErrorToast('Failed to load packages');
    }
  };

  const handlePackageSelect = async (pkg: any) => {
    const details: any[] = pkg.procedureDetails || [];
    if (details.length === 0) {
      showWarningToast('No procedure details in this package');
      return;
    }
    if (!patient?.debitHead) {
      showWarningToast('Please search patient first to determine account head');
      return;
    }
    const accountHead = accountHeads.find((h: any) => h.headName === patient.debitHead);
    if (!accountHead) {
      showErrorToast('Account head not configured for this patient category');
      return;
    }
    const accHeadId = accountHead.headId;

    let addedCount = 0;
    let failedCount = 0;

    for (const detail of details) {
      try {
        const procs = await cashCounterApi.fetchProceduresForBilling(accHeadId, detail.name || '');
        const proc = procs.find((p: any) => {
          const pid = Number(p.particularId || p.id || p.procId || p.procedureId || 0);
          return pid === Number(detail.id);
        });
        if (!proc) {
          console.error(`Procedure not found for: ${detail.name} (id: ${detail.id})`);
          failedCount++;
          continue;
        }
        const total = (detail.rate || 0) * (detail.noOfTimes || 1);
        onAddItem({
          id: Date.now() + Math.random(),
          groupName: proc.groupName || '',
          name: detail.name || proc.procName || '',
          unit: detail.noOfTimes || 1,
          cost: detail.rate || 0,
          discount: 0,
          total,
          particularId: Number(proc.particularId || proc.id || proc.procId || proc.procedureId || 0),
          groupId: proc.groupId || 0,
        } as any);
        addedCount++;
      } catch (error) {
        console.error(`Error loading procedure: ${detail.name}`, error);
        failedCount++;
      }
    }

    if (addedCount > 0) {
      showSuccessToast(`Added ${addedCount} procedure(s) from "${pkg.packageName}"`);
    }
    if (failedCount > 0) {
      showWarningToast(`${failedCount} procedure(s) could not be loaded`);
    }
    setShowPackageModal(false);
  };

  const handleProcedureSelect = (proc: any) => {
    const particularId = proc.particularId || proc.id || proc.procId || proc.procedureId;
    if (!particularId || particularId === 0) {
      showErrorToast('Invalid procedure selected. Missing procedure ID. Please contact administrator.');
      return;
    }

    setNewItem({
      ...newItem,
      groupName: proc.groupName || '',
      name: proc.procName,
      cost: proc.rate || 0,
      discount: proc.charity || 0,
      particularId: particularId,
      groupId: proc.groupId || 0,
      isEditable: proc.isEditable ?? 0,
    });
    setProcedureSearchTerm(proc.procName);
    setShowProcedureSuggestions(false);
    setSelectedProcedureIndex(-1);

    setTimeout(() => {
      unitInputRef.current?.focus();
    }, 100);
  };

  const handleProcedureKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showProcedureSuggestions || procedureSuggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedProcedureIndex((prev) =>
        prev < procedureSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedProcedureIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (selectedProcedureIndex >= 0) {
        handleProcedureSelect(procedureSuggestions[selectedProcedureIndex]);
      } else if (procedureSuggestions.length > 0) {
        handleProcedureSelect(procedureSuggestions[0]);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedProcedureIndex >= 0) {
        handleProcedureSelect(procedureSuggestions[selectedProcedureIndex]);
      } else if (procedureSuggestions.length > 0) {
        handleProcedureSelect(procedureSuggestions[0]);
      }
    } else if (e.key === 'Escape') {
      setShowProcedureSuggestions(false);
      setSelectedProcedureIndex(-1);
    }
  };

  const handleAddItem = () => {
    if (!newItem.name) {
      showWarningToast('Please select a procedure');
      return;
    }

    if (!newItem.particularId || newItem.particularId === 0) {
      showErrorToast('Invalid procedure selected. Please re-select from the dropdown.');
      return;
    }

    const total = (newItem.cost || 0) * newItem.unit - (newItem.discount || 0);
    const itemWithId = {
      ...newItem,
      id: Date.now(),
      total: total > 0 ? total : 0,
    };

    onAddItem(itemWithId);
    setNewItem({
      groupName: '',
      name: '',
      unit: 1,
      cost: 0,
      discount: 0,
      total: 0,
      particularId: 0,
      groupId: 0,
      isEditable: 0,
    });
    setProcedureSearchTerm('');

    setTimeout(() => {
      procedureNameInputRef?.current?.focus();
    }, 100);
  };

  const handleSelectInvestigationOrder = useCallback(async (order: InvestigationOrder) => {
    let addedCount = 0;
    let failedCount = 0;
    
    if (!patient?.debitHead) {
      showErrorToast('Patient account head not available for procedure order');
      return;
    }

    // Find account head ID
    const accountHead = accountHeads.find(head => head.headName === patient.debitHead);
    if (!accountHead) {
      showErrorToast('Account head not configured for this patient category');
      return;
    }
    
    for (const detail of order.details) {
      try {
        let particularId: number | undefined;
        let groupId = 0;
        let groupName = detail.groupName || '';

        // If the order detail already carries the procId, use it directly
        if (detail.procId && detail.procId !== 0) {
          particularId = detail.procId;
          groupId = detail.groupId || 0;
        } else {
          // Search for procedure to get proper IDs
          const procedures = await cashCounterApi.fetchProceduresForBilling(accountHead.headId, detail.procName || '');
          const normalizedDetailName = (detail.procName || '').toLowerCase().trim();

          // First try to match by name + rate + groupId to disambiguate same-named procedures
          let procedure = procedures.find(p =>
            (p.procName || '').toLowerCase().trim() === normalizedDetailName &&
            (p.rate || 0) === detail.rate &&
            (p.groupId || 0) === (detail.groupId || 0)
          );
          // Fallback: match by name + rate only
          if (!procedure) {
            procedure = procedures.find(p =>
              (p.procName || '').toLowerCase().trim() === normalizedDetailName &&
              (p.rate || 0) === detail.rate
            );
          }
          // Final fallback: first name match
          if (!procedure) {
            procedure = procedures.find(p =>
              (p.procName || '').toLowerCase().trim() === normalizedDetailName
            );
          }

          if (!procedure) {
            console.error(`Procedure not found: ${detail.procName}`);
            failedCount++;
            continue;
          }

          particularId = procedure.particularId || procedure.id || procedure.procId || procedure.procedureId;
          groupId = procedure.groupId || 0;
          groupName = procedure.groupName || groupName;
        }

        if (!particularId || particularId === 0) {
          console.error(`Procedure missing ID: ${detail.procName}`);
          failedCount++;
          continue;
        }

        const total = (detail.rate || 0) * detail.unit - (detail.disc || 0);
        const itemWithId: ProcedureItem = {
          id: Date.now() + addedCount,
          groupName: groupName,
          name: detail.procName || '',
          unit: detail.unit || 1,
          cost: detail.rate || 0,
          discount: detail.disc || 0,
          total: total > 0 ? total : 0,
          particularId: particularId,
          groupId: groupId,
          invOrderId: order.id || 0,
        };
        onAddItem(itemWithId);
        addedCount++;
      } catch (error) {
        console.error(`Error loading procedure: ${detail.procName}`, error);
        failedCount++;
      }
    }
    
    if (addedCount > 0) {
      showSuccessToast(`${addedCount} investigation item(s) loaded from order ${order.orderNo}`);
    }
    if (failedCount > 0) {
      showWarningToast(`${failedCount} item(s) could not be loaded. Check console for details.`);
    }
  }, [patient, accountHeads, onAddItem]);

  // Reset form when resetTrigger changes
  useEffect(() => {
    setNewItem({
      groupName: '',
      name: '',
      unit: 1,
      cost: 0,
      discount: 0,
      total: 0,
      particularId: 0,
      groupId: 0,
      isEditable: 0,
    });
    setProcedureSearchTerm('');
    setProcedureSuggestions([]);
    setShowProcedureSuggestions(false);
    setSelectedProcedureIndex(-1);
  }, [resetTrigger]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        procedureNameInputRef?.current &&
        !procedureNameInputRef.current.contains(event.target as Node)
      ) {
        setShowProcedureSuggestions(false);
        setSelectedProcedureIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [procedureNameInputRef]);

  // Use ref to store latest handler to avoid infinite loop
  const handlerRef = useRef(handleSelectInvestigationOrder);
  
  // Update ref whenever handler changes
  useEffect(() => {
    handlerRef.current = handleSelectInvestigationOrder;
  }, [handleSelectInvestigationOrder]);

  // Register stable wrapper function with parent only once
  useEffect(() => {
    if (onRegisterOrderHandler) {
      onRegisterOrderHandler((order: InvestigationOrder) => handlerRef.current(order));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onRegisterOrderHandler]);

  return (
    <>
    <Card className="border-0 shadow-sm d-flex flex-column h-100" style={{minHeight: 0}}>
      <Card.Header className="bg-light p-3 border-bottom flex-shrink-0">
        <div className="d-flex align-items-center justify-content-between gap-2">
          <div className="d-flex align-items-center gap-2">
            <FaStethoscopeIcon style={{ color: 'var(--themePrimary)' }} />
            <span className="fw-bold small text-uppercase">Procedure Details</span>
          </div>
          <div className="d-flex gap-2">
            <Button 
              size="sm" 
              onClick={() => setShowOrderModal(true)}
              title="View order details"
              className="d-flex align-items-center gap-2 theme-outline-btn-primary"
              disabled={!patient}
            >
              <FaListUlIcon size={14} />
              <span style={{fontSize: '0.75rem'}}>Order List</span>
            </Button>
            <Button 
              size="sm" 
              onClick={handleLoadPackages}
              title="Load packages"
              className="d-flex align-items-center gap-2 theme-outline-btn-primary"
              disabled={!patient}
            >
              <FaBoxOpenIcon size={14} />
              <span style={{fontSize: '0.75rem'}}>Package</span>
            </Button>
          </div>
        </div>
      </Card.Header>
      <Card.Body className="p-0 d-flex flex-column flex-grow-1" style={{minHeight: 0, overflow: 'visible'}}>
        {/* Item Entry Form */}
        <div className="p-3 bg-light border-bottom flex-shrink-0">
          <div className="d-flex gap-2 align-items-start flex-nowrap">
            <div className="flex-grow-1" style={{minWidth: '200px'}}>
              <Form.Label style={{fontSize: '0.75rem', marginBottom: '4px', fontWeight: '500'}}>Procedure Name</Form.Label>
              <div className="position-relative">
                <Form.Control
                  ref={procedureNameInputRef}
                  placeholder="Search procedure..."
                  value={procedureSearchTerm}
                  onChange={(e) => handleProcedureSearch(e.target.value)}
                  onKeyDown={handleProcedureKeyDown}
                  size="sm"
                />
                {showProcedureSuggestions && procedureSuggestions.length > 0 && (
                  <div
                    ref={suggestionsRef}
                    style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      maxHeight: '200px',
                      overflowY: 'auto',
                      backgroundColor: 'white',
                      border: '1px solid #dee2e6',
                      borderRadius: '4px',
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                      zIndex: 1000,
                      marginTop: '2px',
                    }}
                  >
                    {procedureSuggestions.map((proc, index) => (
                      <div
                        key={index}
                        onClick={() => handleProcedureSelect(proc)}
                        style={{
                          padding: '8px 12px',
                          cursor: 'pointer',
                          borderBottom: index < procedureSuggestions.length - 1 ? '1px solid #f0f0f0' : 'none',
                          fontSize: '13px',
                          backgroundColor: selectedProcedureIndex === index ? 'var(--page-primary-color)' : 'white',
                        }}
                        onMouseEnter={() => setSelectedProcedureIndex(index)}
                      >
                        <div style={{ fontWeight: '500', color: selectedProcedureIndex === index ? 'var(--page-secondary-color)' : '#212529' }}>{proc.procName}</div>
                        <div style={{ fontSize: '11px', color: selectedProcedureIndex === index ? 'var(--page-secondary-color)' : '#6c757d', marginTop: '2px' }}>
                          Group: {proc.groupName} | Rate: ₹{proc.rate} | Charity: ₹{proc.charity}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex-shrink-0" style={{width: '60px'}}>
              <Form.Label style={{fontSize: '0.75rem', marginBottom: '4px', fontWeight: '500'}}>Unit</Form.Label>
              <Form.Control
                ref={unitInputRef}
                type="number"
                min="1"
                placeholder="1"
                value={newItem.unit}
                onChange={(e) => setNewItem({ ...newItem, unit: parseInt(e.target.value) || 0 })}
                onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                size="sm"
              />
            </div>
            <div className="flex-shrink-0" style={{width: '80px'}}>
              <Form.Label style={{fontSize: '0.75rem', marginBottom: '4px', fontWeight: '500'}}>Cost</Form.Label>
              <Form.Control
                type="number"
                placeholder="0"
                value={newItem.cost}
                readOnly={newItem.isEditable === 0}
                className={newItem.isEditable === 0 ? 'bg-light' : ''}
                onChange={(e) => setNewItem({ ...newItem, cost: parseFloat(e.target.value) || 0 })}
                onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                size="sm"
              />
            </div>
            <div className="flex-shrink-0" style={{width: '70px'}}>
              <Form.Label style={{fontSize: '0.75rem', marginBottom: '4px', fontWeight: '500'}}>Dis</Form.Label>
              <Form.Control
                type="number"
                placeholder="0"
                value={newItem.discount}
                onChange={(e) => setNewItem({ ...newItem, discount: parseFloat(e.target.value) || 0 })}
                onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                size="sm"
              />
            </div>
            <div className="d-flex gap-2 align-items-center flex-shrink-0" style={{width: '140px'}}>
              <div className="d-flex flex-column">
                <span style={{ fontSize: 'var(--font-size-xs)', color: '#6c757d', fontWeight: 'var(--font-weight-normal)' }}>Total</span>
                <span style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: '#212529' }}>
                  ₹{((newItem.cost || 0) * newItem.unit - (newItem.discount || 0)).toFixed(2)}
                </span>
              </div>
              <Button onClick={handleAddItem} size="sm" className="px-2 flex-shrink-0 theme-outline-btn-primary ms-auto">
                <FaPlusIcon size={12} />
              </Button>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="d-flex flex-column flex-grow-1" style={{minHeight: 0, overflow: 'auto'}}>
          <Table hover striped bordered className="mb-0 align-middle" style={{fontSize: '0.75rem'}}>
            <thead className="text-uppercase sticky-top" style={{fontSize: '0.65rem', zIndex: 1}}>
              <tr>
                <th className="ps-3 py-2" style={{width: '5%'}}>#</th>
                <th className="py-2" style={{width: '15%'}}>Group</th>
                <th className="py-2" style={{width: '35%'}}>Procedure</th>
                <th className="text-center py-2" style={{width: '10%'}}>Qty</th>
                <th className="text-end py-2" style={{width: '10%'}}>Cost</th>
                <th className="text-end py-2" style={{width: '10%'}}>Discount</th>
                <th className="text-end py-2" style={{width: '10%'}}>Total</th>
                <th className="text-center py-2" style={{width: '5%'}}>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-5 text-muted">
                    <div className="d-flex flex-column align-items-center">
                      <FaStethoscopeIcon size={32} className="mb-2 opacity-50" />
                      <p className="small mb-0">No procedures added yet</p>
                      <small>Add procedures using the form above</small>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item, index) => (
                  <tr key={item.id}>
                    <td className="ps-3">{index + 1}</td>
                    <td>
                      <Badge bg="light" text="dark" className="border">
                        {item.groupName}
                      </Badge>
                    </td>
                    <td className="fw-medium">{item.name}</td>
                    <td className="text-center">{item.unit}</td>
                    <td className="text-end">₹{(item.cost || 0).toFixed(2)}</td>
                    <td className="text-end text-success">-₹{(item.discount || 0).toFixed(2)}</td>
                    <td className="text-end fw-bold">₹{(item.total || 0).toFixed(2)}</td>
                    <td className="text-center">
                      <Button
                        variant="link"
                        className="text-danger p-0"
                        onClick={() => onRemoveItem(item.id)}
                      >
                        <FaTrashIcon size={12} />
                      </Button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>

    {/* Package Modal */}
    <Modal show={showPackageModal} onHide={() => setShowPackageModal(false)} centered>
      <Modal.Header closeButton>
        <Modal.Title style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)' }}>Select Package</Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: '60vh', overflowY: 'auto' }}>
        {packages.length === 0 ? (
          <p className="text-muted text-center" style={{ fontSize: 'var(--font-size-sm)' }}>No procedure packages found.</p>
        ) : (
          <ListGroup variant="flush">
            {packages.map((pkg: any) => (
              <ListGroup.Item
                key={pkg.packageId}
                action
                onClick={() => handlePackageSelect(pkg)}
                style={{ fontSize: 'var(--font-size-sm)', cursor: 'pointer' }}
              >
                <span style={{ fontWeight: 'var(--font-weight-medium)' }}>{pkg.packageName}</span>
                <span className="text-muted ms-2">({(pkg.procedureDetails || []).length} procedure(s))</span>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Modal.Body>
    </Modal>

    {/* Order Modal */}
    {patient && (
      <OrderModal
        show={showOrderModal}
        onHide={() => setShowOrderModal(false)}
        patientId={patient.patId?.toString()}
        visitId={patient.lastVisitId?.toString()}
        onSelectInvestigationOrder={handleSelectInvestigationOrder}
        onSelectLabOrder={onSelectLabOrderFromModal}
        onSelectPharmacyOrder={onSelectPharmacyOrderFromModal}
        activeTab="procedure"
        permissions={permissions}
        selectedInvestigationOrderIds={items.filter((i: any) => i.invOrderId).map((i: any) => i.invOrderId as number).filter((v: number, idx: number, arr: number[]) => arr.indexOf(v) === idx)}
      />
    )}
    </>
  );
};

export default ProcedureBilling;
