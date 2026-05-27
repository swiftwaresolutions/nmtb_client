import React, { useRef, useState, useEffect } from 'react';
import { Row, Col, Card, Form, Button, Table, InputGroup, Badge } from 'react-bootstrap';
import { FaPlus, FaTrash, FaFlask } from 'react-icons/fa';
import { CashCounterApiService } from '../../../api/cash-counter/cash-counter-api-service';
import { showErrorToast, showWarningToast } from '../../../utils/alertUtil';

const FaPlusIcon = FaPlus as any;
const FaTrashIcon = FaTrash as any;
const FaFlaskIcon = FaFlask as any;

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
}

interface LabBillingProps {
  items: LabItem[];
  onAddItem: (item: Omit<LabItem, 'id' | 'total'>) => void;
  onRemoveItem: (id: number) => void;
  selectedPatient?: { headId: number } | null;
  testNameInputRef?: React.RefObject<HTMLInputElement>;
  resetTrigger?: number;
}

const LabBilling: React.FC<LabBillingProps> = ({ items, onAddItem, onRemoveItem, selectedPatient, testNameInputRef, resetTrigger }) => {
  const cashCounterApi = new CashCounterApiService();
  
  const [newItem, setNewItem] = useState({
    deptName: '',
    testName: '',
    unit: 1,
    rate: 0,
    discount: 0,
    testId: 0,
    deptId: 0,
    isEditable: 0
  });

  // Lab test autocomplete state
  const [testSuggestions, setTestSuggestions] = useState<any[]>([]);
  const [showTestSuggestions, setShowTestSuggestions] = useState(false);
  const [testSearchTerm, setTestSearchTerm] = useState('');
  const [selectedTestIndex, setSelectedTestIndex] = useState(-1);

  // Reset form when resetTrigger changes
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
        isEditable: 0
      });
      setTestSearchTerm('');
      setTestSuggestions([]);
      setShowTestSuggestions(false);
      setSelectedTestIndex(-1);
    }
  }, [resetTrigger]);

  // Handle lab test search
  const handleTestSearch = async (searchValue: string) => {
    setTestSearchTerm(searchValue);
    setNewItem({...newItem, testName: searchValue});
    
    if (!searchValue || searchValue.length < 2) {
      setTestSuggestions([]);
      setShowTestSuggestions(false);
      return;
    }

    console.log('LabBilling - selectedPatient:', selectedPatient);
    console.log('LabBilling - selectedPatient?.headId:', selectedPatient?.headId);
    
    if (!selectedPatient?.headId) {
      console.error('LabBilling - Patient validation failed. selectedPatient:', selectedPatient);
      showWarningToast('Please select a patient first');
      return;
    }

    try {
      const tests = await cashCounterApi.fetchLabTestsForBilling(selectedPatient.headId, searchValue);
      console.log('Received lab tests:', tests);
      setTestSuggestions(tests);
      setShowTestSuggestions(tests.length > 0);
      setSelectedTestIndex(-1);
    } catch (error) {
      console.error('Error fetching lab tests:', error);
      setTestSuggestions([]);
      setShowTestSuggestions(false);
    }
  };

  // Handle test selection
  const handleTestSelect = (test: any) => {
    console.log('Selected test:', test);
    
    setNewItem({
      ...newItem,
      deptName: test.deptName || '',
      testName: test.testName || '',
      rate: test.rate || 0,
      discount: test.charity || 0,
      testId: test.testId,
      deptId: test.deptId,
      isEditable: test.isEditable ?? 0
    });

    setTestSearchTerm(test.testName || '');
    setShowTestSuggestions(false);
    setSelectedTestIndex(-1);
  };

  // Handle keyboard navigation
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
    setNewItem({ deptName: '', testName: '', unit: 1, rate: 0, discount: 0, testId: 0, deptId: 0, isEditable: 0 });
    setTestSearchTerm('');
    
    setTimeout(() => {
      testNameInputRef?.current?.focus();
    }, 100);
  };

  return (
    <Card className="neat-card" style={{height: 'calc(100vh - 250px)', display: 'flex', flexDirection: 'column'}}>
      <Card.Body className="p-0" style={{flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>
        {/* Module Details Header */}
        <div className="d-flex align-items-center px-3 py-1 bg-light border-bottom">
          <FaFlaskIcon className="me-2 text-primary" />
          <span className="text-muted fw-bold text-uppercase small letter-spacing-1">Lab Details</span>
        </div>
        {/* Item Entry */}
        <div className="p-2 bg-white border-bottom" style={{flexShrink: 0}}>
          <Row className="g-2 align-items-end">
            <Col md={2}>
              <div className="position-relative">
                <Form.Control 
                  placeholder=" "
                  value={newItem.deptName}
                  readOnly
                  style={{ height: '28px', backgroundColor: '#f8f9fa' }}
                />
                <label className="floating-label">Dept Name</label>
              </div>
            </Col>
            <Col md={4}>
              <div className="position-relative">
                <Form.Control 
                  ref={testNameInputRef}
                  placeholder=" "
                  value={testSearchTerm}
                  onChange={(e) => handleTestSearch(e.target.value)}
                  onKeyDown={handleKeyDown}
                  style={{ height: '28px' }}
                  autoComplete="off"
                />
                <label className="floating-label">Test Name</label>
                {showTestSuggestions && testSuggestions.length > 0 && (
                  <div style={{
                    position: 'absolute',
                    top: '100%',
                    left: 0,
                    right: 0,
                    backgroundColor: 'white',
                    border: '1px solid #ddd',
                    borderRadius: '4px',
                    maxHeight: '200px',
                    overflowY: 'auto',
                    zIndex: 1000,
                    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                  }}>
                    {testSuggestions.map((test, index) => (
                      <div
                        key={index}
                        onClick={() => handleTestSelect(test)}
                        style={{
                          padding: '8px 12px',
                          cursor: 'pointer',
                          backgroundColor: selectedTestIndex === index ? '#e3f2fd' : 'white',
                          borderBottom: index < testSuggestions.length - 1 ? '1px solid #f0f0f0' : 'none',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#e3f2fd';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = selectedTestIndex === index ? '#e3f2fd' : 'white';
                        }}
                      >
                        <div style={{ fontWeight: '500', fontSize: '13px', color: '#333' }}>
                          {test.testName}
                        </div>
                        <div style={{ fontSize: '11px', color: '#666' }}>
                          Dept: {test.deptName} | Rate: ₹{test.rate}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Col>
            <Col md={1} hidden>
              <div className="position-relative">
                <Form.Control 
                  type="number"
                  min="1"
                  placeholder=" "
                  value={newItem.unit}
                  onChange={(e) => setNewItem({...newItem, unit: parseInt(e.target.value) || 0})}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddClick()}
                  style={{ height: '28px' }}
                />
                <label className="floating-label">Unit</label>
              </div>
            </Col>
            <Col md={2}>
              <div className="position-relative">
                <Form.Control 
                  type="number"
                  placeholder=" "
                  value={newItem.rate}
                  readOnly={newItem.isEditable === 0}
                  className="bg-light"  
                  style={{ height: '28px', backgroundColor: '#f8f9fa' }}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddClick()}
                />
                <label className="floating-label">Rate</label>
              </div>
            </Col>
            <Col md={1}>
              <div className="position-relative">
                <Form.Control 
                  type="number"
                  placeholder=" "
                  value={newItem.discount}
                  onChange={(e) => setNewItem({...newItem, discount: parseFloat(e.target.value) || 0})}
                  onKeyDown={(e) => e.key === 'Enter' && handleAddClick()}
                  style={{ height: '28px' }}
                />
                <label className="floating-label">Disc</label>
              </div>
            </Col>
            <Col md={2}>
              <div className="d-flex gap-2">
                <div className="position-relative flex-grow-1">
                  <Form.Control 
                    type="text"
                    readOnly
                    value={((newItem.rate * newItem.unit) - newItem.discount).toFixed(2)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAddClick()}
                    className="bg-light fw-bold text-end"
                    placeholder=" "
                    tabIndex={-1}
                    style={{ height: '28px' }}
                  />
                  <label className="floating-label">Total</label>
                </div>
                <Button 
                  variant="primary"
                  onClick={handleAddClick} 
                  style={{ height: '28px', width: '28px', padding: 0, borderRadius: '0px' }}
                  className="d-flex align-items-center justify-content-center"
                >
                  <FaPlusIcon size={12} />
                </Button>
              </div>
            </Col>
          </Row>
        </div>

        {/* Items Table - Scrollable */}
        <div style={{overflowY: 'auto', flex: 1, minHeight: 0}}>
          <Table hover className="mb-0 align-middle small">
            <thead className="bg-light text-muted text-uppercase small" style={{position: 'sticky', top: 0, zIndex: 1}}>
              <tr>
                <th className="ps-4 py-2 border-0" style={{width: '5%'}}>#</th>
                <th className="py-2 border-0" style={{width: '20%'}}>Dept Name</th>
                <th className="py-2 border-0" style={{width: '35%'}}>Test Name</th>
                <th className="text-center py-2 border-0" style={{width: '10%'}} hidden>Unit</th>
                <th className="text-end py-2 border-0" style={{width: '10%'}}>Rate</th>
                <th className="text-end py-2 border-0" style={{width: '10%'}}>Discount</th>
                <th className="text-end py-2 border-0" style={{width: '10%'}}>Total</th>
                <th className="text-center py-2 border-0" style={{width: '5%'}}>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-5 text-muted border-0">
                    <div className="d-flex flex-column align-items-center">
                      <FaFlaskIcon size={32} className="mb-2 opacity-25" />
                      <p className="mb-0">No tests added yet</p>
                      <small>Add tests using the form above</small>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item, index) => (
                  <tr key={item.id}>
                    <td className="ps-4 py-2 border-bottom-0">{index + 1}</td>
                    <td className="py-2 border-bottom-0"><Badge bg="light" className="text-dark border fw-normal">{item.deptName || ''}</Badge></td>
                    <td className="fw-medium py-2 border-bottom-0">{item.testName || ''}</td>
                    <td className="text-center py-2 border-bottom-0" hidden>{item.unit || 0}</td>
                    <td className="text-end py-2 border-bottom-0">{(item.rate || 0).toFixed(2)}</td>
                    <td className="text-end text-success py-2 border-bottom-0">-{(item.discount || 0).toFixed(2)}</td>
                    <td className="text-end fw-bold py-2 border-bottom-0">{(item.total || 0).toFixed(2)}</td>
                    <td className="text-center py-2 border-bottom-0">
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
  );
};

export default LabBilling;