import React, { useRef, useState, useEffect, useCallback } from 'react';
import { Row, Col, Card, Form, Button, Table, Badge, Modal, ListGroup } from 'react-bootstrap';
import { FaPlus, FaTrash, FaFlask, FaClipboardList, FaListUl, FaBoxOpen } from 'react-icons/fa';
import { CashCounterApiService } from '../../../../api/cash-counter/cash-counter-api-service';
import { showErrorToast, showWarningToast, showSuccessToast } from '../../../../utils/alertUtil';
import OrderModal, { LabOrder, InvestigationOrder, PharmacyOrder, BillingPermissions } from '../modals/OrderModal';

const FaPlusIcon = FaPlus as any;
const FaTrashIcon = FaTrash as any;
const FaFlaskIcon = FaFlask as any;
const FaClipboardListIcon = FaClipboardList as any;
const FaListUlIcon = FaListUl as any;
const FaBoxOpenIcon = FaBoxOpen as any;

interface LabItem {
  id: number;
  deptName: string;
  testName: string;
  unit: number;
  rate: number;
  discount: number;
  total: number;
  testId?: number;
  deptId?: number;
  specId?: number;
  labOrderId?: number;
}

interface LabBillingProps {
  items: LabItem[];
  onAddItem: (item: Omit<LabItem, 'id' | 'total'>) => void;
  onRemoveItem: (id: number) => void;
  selectedPatient?: { headId: number } | null;
  testNameInputRef?: React.RefObject<HTMLInputElement>;
  resetTrigger?: number;
  patientId?: string;
  visitId?: string;
  permissions?: BillingPermissions;
  onSelectInvestigationOrderFromModal?: (order: InvestigationOrder) => void;
  onSelectPharmacyOrderFromModal?: (order: PharmacyOrder) => void;
  onRegisterOrderHandler?: (handler: (order: LabOrder) => void) => void;
}

const LabBilling: React.FC<LabBillingProps> = ({ items, onAddItem, onRemoveItem, selectedPatient, testNameInputRef, resetTrigger, patientId, visitId, permissions, onSelectInvestigationOrderFromModal, onSelectPharmacyOrderFromModal, onRegisterOrderHandler }) => {
  const cashCounterApi = new CashCounterApiService();
  const [showOrderModal, setShowOrderModal] = useState(false);
  const rateInputRef = useRef<HTMLInputElement>(null);
  const codeInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const [testCodeTerm, setTestCodeTerm] = useState('');
  const [codeLoading, setCodeLoading] = useState(false);
  
  const [newItem, setNewItem] = useState({
    deptName: '',
    testName: '',
    unit: 1,
    rate: 0,
    discount: 0,
    testId: 0,
    deptId: 0,
    specId: 0,
    isEditable: 0
  });

  const [testSuggestions, setTestSuggestions] = useState<any[]>([]);
  const [showTestSuggestions, setShowTestSuggestions] = useState(false);
  const [testSearchTerm, setTestSearchTerm] = useState('');
  const [selectedTestIndex, setSelectedTestIndex] = useState(-1);
  const [showPackageModal, setShowPackageModal] = useState(false);
  const [packages, setPackages] = useState<any[]>([]);

  useEffect(() => {
    if (resetTrigger !== undefined) {
      setNewItem({
        deptName: '',
        testName: '',
        unit: 1,
        rate: 0,
        discount: 0,
        testId: 0,
        deptId: 0,
        specId: 0,
        isEditable: 0
      });
      setTestSearchTerm('');
      setTestCodeTerm('');
      setTestSuggestions([]);
      setShowTestSuggestions(false);
      setSelectedTestIndex(-1);
    }
  }, [resetTrigger]);

  const handleSelectLabOrder = useCallback(async (order: LabOrder) => {
    let addedCount = 0;
    let failedCount = 0;
    
    if (!selectedPatient?.headId) {
      showErrorToast('Patient account head not available for lab order');
      return;
    }
    
    for (const detail of order.details) {
      try {
        // Search for lab test to get proper IDs
        const tests = await cashCounterApi.fetchLabTestsForBilling(selectedPatient.headId, detail.testName || '');
        
        // Find match by test name (case-insensitive)
        const normalizedDetailName = (detail.testName || '').toLowerCase().trim();
        const test = tests.find(t => 
          (t.testName || '').toLowerCase().trim() === normalizedDetailName
        );
        
        if (!test || !test.testId || !test.deptId) {
          console.error(`Lab test not found or missing IDs: ${detail.testName}`, 'Available tests:', tests.map(t => t.testName));
          failedCount++;
          continue;
        }

        onAddItem({
          deptName: detail.deptName || test.deptName || '',
          testName: detail.testName || '',
          unit: detail.unit || 1,
          rate: detail.rate || 0,
          discount: detail.disc || 0,
          testId: test.testId,
          deptId: test.deptId,
          labOrderId: order.id || 0,
        });
        addedCount++;
      } catch (error) {
        console.error(`Error loading lab test: ${detail.testName}`, error);
        failedCount++;
      }
    }
    
    if (addedCount > 0) {
      showSuccessToast(`${addedCount} lab test(s) loaded from order ${order.orderNo}`);
    }
    if (failedCount > 0) {
      showWarningToast(`${failedCount} item(s) could not be loaded. Check console for details.`);
    }
  }, [selectedPatient, onAddItem]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        testNameInputRef?.current &&
        !testNameInputRef.current.contains(event.target as Node)
      ) {
        setShowTestSuggestions(false);
        setSelectedTestIndex(-1);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [testNameInputRef]);

  // Use ref to store latest handler to avoid infinite loop
  const handlerRef = useRef(handleSelectLabOrder);
  
  // Update ref whenever handler changes
  useEffect(() => {
    handlerRef.current = handleSelectLabOrder;
  }, [handleSelectLabOrder]);

  // Register stable wrapper function with parent only once
  useEffect(() => {
    if (onRegisterOrderHandler) {
      onRegisterOrderHandler((order: LabOrder) => handlerRef.current(order));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onRegisterOrderHandler]);

  const handleLoadPackages = async () => {
    try {
      const all = await cashCounterApi.fetchAllPackageDetails();
      const filtered = all.filter((p: any) => Number(p.isLab) === 1);
      setPackages(filtered);
      setShowPackageModal(true);
    } catch (error) {
      console.error('Error loading packages:', error);
      showErrorToast('Failed to load packages');
    }
  };

  const handlePackageSelect = async (pkg: any) => {
    const details: any[] = pkg.labDetails || [];
    if (details.length === 0) {
      showWarningToast('No lab details in this package');
      return;
    }
    if (!selectedPatient?.headId) {
      showWarningToast('Please select a patient first');
      return;
    }

    let addedCount = 0;
    let failedCount = 0;

    for (const detail of details) {
      try {
        const tests = await cashCounterApi.fetchLabTestsForBilling(selectedPatient.headId, detail.testName || '');
        const test = tests.find((t: any) => Number(t.testId) === Number(detail.id));
        if (!test || !test.deptId) {
          console.error(`Lab test not found or missing deptId for: ${detail.testName} (id: ${detail.id})`);
          failedCount++;
          continue;
        }
        onAddItem({
          deptName: test.deptName || '',
          testName: detail.testName || '',
          unit: detail.noOfTimes || 1,
          rate: detail.rate || 0,
          discount: 0,
          testId: detail.id || 0,
          deptId: test.deptId,
          specId: test.specId || 0,
        });
        addedCount++;
      } catch (error) {
        console.error(`Error loading lab test: ${detail.testName}`, error);
        failedCount++;
      }
    }

    if (addedCount > 0) {
      showSuccessToast(`Added ${addedCount} test(s) from "${pkg.packageName}"`);
    }
    if (failedCount > 0) {
      showWarningToast(`${failedCount} test(s) could not be loaded`);
    }
    setShowPackageModal(false);
  };

  const handleTestSearch = async (searchValue: string) => {
    setTestSearchTerm(searchValue);
    setNewItem({...newItem, testName: searchValue});
    
    if (!searchValue || searchValue.length < 2) {
      setTestSuggestions([]);
      setShowTestSuggestions(false);
      return;
    }
    
    if (!selectedPatient?.headId) {
      showWarningToast('Please select a patient first');
      return;
    }

    try {
      const tests = await cashCounterApi.fetchLabTestsForBilling(selectedPatient.headId, searchValue);
      setTestSuggestions(tests);
      setShowTestSuggestions(tests.length > 0);
      setSelectedTestIndex(-1);
    } catch (error) {
      console.error('Error fetching lab tests:', error);
      setTestSuggestions([]);
      setShowTestSuggestions(false);
    }
  };

  const handleTestSelect = (test: any) => {
    setNewItem({
      ...newItem,
      deptName: test.deptName || '',
      testName: test.testName || '',
      rate: test.rate || 0,
      discount: test.charity || 0,
      testId: test.testId,
      deptId: test.deptId,
      specId: test.specId || 0,
      isEditable: test.isEditable ?? 0
    });

    setTestSearchTerm(test.testName || '');
    setTestCodeTerm(test.testCode || '');
    setShowTestSuggestions(false);
    setSelectedTestIndex(-1);
    
    // Focus on rate field after test selection
    setTimeout(() => {
      rateInputRef.current?.focus();
    }, 0);
  };

  const handleCodeKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter' && e.key !== 'Tab') return;
    const code = testCodeTerm.trim();
    if (!code) return;
    if (!selectedPatient?.headId) {
      showWarningToast('Please select a patient first');
      return;
    }
    e.preventDefault();
    try {
      setCodeLoading(true);
      const tests = await cashCounterApi.fetchLabTestByCode(selectedPatient.headId, code);
      const match = tests.find((t: any) =>
        (t.testCode || '').toLowerCase().trim() === code.toLowerCase()
      );
      if (match) {
        handleTestSelect(match);
      } else {
        showWarningToast(`No test found with code "${code}"`);
        setTestCodeTerm('');
      }
    } catch (error) {
      console.error('Error fetching lab test by code:', error);
      showErrorToast('Failed to search test by code');
    } finally {
      setCodeLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showTestSuggestions || testSuggestions.length === 0) return;

    switch(e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setSelectedTestIndex(prev => 
          prev < testSuggestions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedTestIndex(prev => 
          prev > 0 ? prev - 1 : testSuggestions.length - 1
        );
        break;
      case 'Tab':
        e.preventDefault();
        if (selectedTestIndex >= 0) {
          handleTestSelect(testSuggestions[selectedTestIndex]);
        } else if (testSuggestions.length > 0) {
          handleTestSelect(testSuggestions[0]);
        }
        break;
      case 'Enter':
        e.preventDefault();
        if (selectedTestIndex >= 0) {
          handleTestSelect(testSuggestions[selectedTestIndex]);
        } else if (testSuggestions.length > 0) {
          handleTestSelect(testSuggestions[0]);
        }
        break;
      case 'Escape':
        setShowTestSuggestions(false);
        setSelectedTestIndex(-1);
        break;
    }
  };

  const handleAddClick = () => {
    if (!newItem.testName || !newItem.deptName) return;
    onAddItem(newItem);
    setNewItem({ deptName: '', testName: '', unit: 1, rate: 0, discount: 0, testId: 0, deptId: 0, specId: 0, isEditable: 0 });
    setTestSearchTerm('');
    setTestCodeTerm('');
    
    setTimeout(() => {
      codeInputRef?.current?.focus();
    }, 100);
  };

  return (
    <>
    <Card className="border-0 shadow-sm d-flex flex-column h-100" style={{minHeight: 0}}>
      <Card.Header className="bg-light p-3 border-bottom flex-shrink-0">
        <div className="d-flex align-items-center justify-content-between gap-2">
          <div className="d-flex align-items-center gap-2">
            <FaFlaskIcon style={{ color: 'var(--themePrimary)' }} />
            <span className="fw-bold small text-uppercase">Lab Details</span>
          </div>
          <div className="d-flex gap-2">
            <Button 
              size="sm" 
              onClick={() => setShowOrderModal(true)}
              title="View order details"
              className="d-flex align-items-center gap-2 theme-outline-btn-primary"
              disabled={!patientId || !visitId}
            >
              <FaListUlIcon size={14} />
              <span style={{fontSize: '0.75rem'}}>Order List</span>
            </Button>
            <Button 
              size="sm" 
              onClick={handleLoadPackages}
              title="Load packages"
              className="d-flex align-items-center gap-2 theme-outline-btn-primary"
              disabled={!selectedPatient?.headId}
            >
              <FaBoxOpenIcon size={14} />
              <span style={{fontSize: '0.75rem'}}>Package</span>
            </Button>
          </div>
        </div>
      </Card.Header>
      <Card.Body className="p-0 d-flex flex-column flex-grow-1" style={{minHeight: 0, overflow: 'hidden'}}>
        {/* Item Entry Form */}
        <div className="p-3 bg-light border-bottom flex-shrink-0">
          <div className="d-flex gap-2 align-items-start flex-wrap">
            <div className="flex-shrink-0" style={{width: '10%', minWidth: '80px'}}>
              <Form.Label style={{fontSize: '0.75rem', marginBottom: '4px', fontWeight: '500'}}>Code</Form.Label>
              <Form.Control
                ref={(el: HTMLInputElement | null) => {
                  (codeInputRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
                  if (testNameInputRef) (testNameInputRef as React.MutableRefObject<HTMLInputElement | null>).current = el;
                }}
                placeholder="Code"
                value={testCodeTerm}
                onChange={(e) => setTestCodeTerm(e.target.value)}
                onKeyDown={handleCodeKeyDown}
                size="sm"
                autoComplete="off"
                disabled={codeLoading}
              />
            </div>
            <div className="flex-grow-1" style={{minWidth: '180px', maxWidth: '25%'}}>
              <Form.Label style={{fontSize: '0.75rem', marginBottom: '4px', fontWeight: '500'}}>Test Name</Form.Label>
              <div className="position-relative">
                <Form.Control 
                  placeholder="Search test..."
                  value={testSearchTerm}
                  onChange={(e) => handleTestSearch(e.target.value)}
                  onKeyDown={handleKeyDown}
                  size="sm"
                  autoComplete="off"
                />
                {showTestSuggestions && testSuggestions.length > 0 && (
                  <div ref={suggestionsRef} style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: 'white',
                    border: '1px solid #dee2e6',
                    borderRadius: '4px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    zIndex: 1000,
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
                    marginTop: '2px'
                  }}>
                    {testSuggestions.map((test, index) => (
                      <div
                        key={index}
                        onClick={() => handleTestSelect(test)}
                        style={{
                          padding: '8px 12px',
                          cursor: 'pointer',
                          backgroundColor: selectedTestIndex === index ? 'var(--page-primary-color)' : 'white',
                          borderBottom: index < testSuggestions.length - 1 ? '1px solid #f0f0f0' : 'none',
                          fontSize: '13px'
                        }}
                        onMouseEnter={() => setSelectedTestIndex(index)}
                      >
                        <div style={{ fontWeight: '500', color: selectedTestIndex === index ? 'var(--page-secondary-color)' : '#212529' }}>
                          {test.testName}
                        </div>
                        <div style={{ fontSize: '11px', color: selectedTestIndex === index ? 'var(--page-secondary-color)' : '#6c757d', marginTop: '2px' }}>
                          {test.deptName} | Rate: ₹{test.rate} | Charity: ₹{test.charity}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex-shrink-0" style={{width: '10%', minWidth: '80px'}}>
              <Form.Label style={{fontSize: '0.75rem', marginBottom: '4px', fontWeight: '500'}}>Rate</Form.Label>
              <Form.Control 
                ref={rateInputRef}
                type="number"
                placeholder="0"
                value={newItem.rate}
                readOnly={newItem.isEditable === 0}
                className={newItem.isEditable === 0 ? 'bg-light' : ''}
                size="sm"
                onChange={(e) => setNewItem({ ...newItem, rate: parseFloat(e.target.value) || 0 })}
                onKeyDown={(e) => e.key === 'Enter' && handleAddClick()}
              />
            </div>
            <div className="flex-shrink-0" style={{width: '10%', minWidth: '75px'}}>
              <Form.Label style={{fontSize: '0.75rem', marginBottom: '4px', fontWeight: '500'}}>Discount</Form.Label>
              <Form.Control 
                type="number"
                placeholder="0"
                value={newItem.discount}
                onChange={(e) => setNewItem({...newItem, discount: parseFloat(e.target.value) || 0})}
                size="sm"
                onKeyDown={(e) => e.key === 'Enter' && handleAddClick()}
              />
            </div>
            <div className="flex-shrink-0" style={{width: '15%', minWidth: '120px'}}>
              <Form.Label style={{fontSize: '0.75rem', marginBottom: '4px', fontWeight: '500'}}>Total</Form.Label>
              <Form.Control 
                type="text"
                value={`₹${((newItem.rate * newItem.unit) - newItem.discount).toFixed(2)}`}
                readOnly
                className="bg-light fw-bold"
                size="sm"
              />
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="d-flex flex-column flex-grow-1" style={{minHeight: 0, overflow: 'auto'}}>
          <Table hover className="mb-0 align-middle" style={{fontSize: '0.75rem'}}>
            <thead className="bg-light text-muted text-uppercase sticky-top" style={{fontSize: '0.65rem', zIndex: 1}}>
              <tr>
                <th className="ps-3 py-2" style={{width: '5%'}}>#</th>
                <th className="py-2" style={{width: '15%'}}>Dept Name</th>
                <th className="py-2" style={{width: '25%'}}>Test Name</th>
                <th className="text-end py-2" style={{width: '10%'}}>Rate</th>
                <th className="text-end py-2" style={{width: '12%'}}>Discount</th>
                <th className="text-end py-2" style={{width: '12%'}}>Total</th>
                <th className="text-center py-2" style={{width: '5%'}}>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-5 text-muted">
                    <div className="d-flex flex-column align-items-center">
                      <FaFlaskIcon size={32} className="mb-2 opacity-50" />
                      <p className="small mb-0">No tests added yet</p>
                      <small>Add tests using the form above</small>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item, index) => (
                  <tr key={item.id}>
                    <td className="ps-3">{index + 1}</td>
                    <td><Badge bg="light" text="dark" className="border">{item.deptName || ''}</Badge></td>
                    <td className="fw-medium">{item.testName || ''}</td>
                    <td className="text-end">₹{(item.rate || 0).toFixed(2)}</td>
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
          <p className="text-muted text-center" style={{ fontSize: 'var(--font-size-sm)' }}>No lab packages found.</p>
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
                <span className="text-muted ms-2">({(pkg.labDetails || []).length} test(s))</span>
              </ListGroup.Item>
            ))}
          </ListGroup>
        )}
      </Modal.Body>
    </Modal>

    {/* Order Modal */}
    {patientId && visitId && (
      <OrderModal
        show={showOrderModal}
        onHide={() => setShowOrderModal(false)}
        patientId={patientId}
        visitId={visitId}
        onSelectInvestigationOrder={onSelectInvestigationOrderFromModal}
        onSelectLabOrder={handleSelectLabOrder}
        onSelectPharmacyOrder={onSelectPharmacyOrderFromModal}
        activeTab="lab"
        permissions={permissions}
        selectedLabOrderIds={items.filter((i: any) => i.labOrderId).map((i: any) => i.labOrderId as number).filter((v: number, idx: number, arr: number[]) => arr.indexOf(v) === idx)}
      />
    )}
    </>
  );
};

export default LabBilling;
