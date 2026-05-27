import React, { useState, useRef, useEffect } from 'react';
import { Row, Col, Card, Form, Button, Table, InputGroup, Badge } from 'react-bootstrap';
import { FaPlus, FaTrash, FaPills } from 'react-icons/fa';
import { CashCounterApiService } from '../../../api/cash-counter/cash-counter-api-service';
import { showWarningToast, showErrorToast, showWarningModal } from '../../../utils/alertUtil';

const FaPlusIcon = FaPlus as any;
const FaTrashIcon = FaTrash as any;
const FaPillsIcon = FaPills as any;

interface PharmacyItem {
  id: number;
  genericName: string;
  medicineName: string;
  batch: string;
  unit: number;
  stock: number;
  mrp: number;
  total: number;
  prodsId?: number;
  batchId?: number;
  storeId?: number;
  expiryDate?: string;
  salesPrice?: number;
  sgstPer?: number;
  cgstPer?: number;
  igstPer?: number;
  discountPer?: number;
  discount?: number;
}

interface PharmacyBillingProps {
  items: PharmacyItem[];
  onAddItem: (item: Omit<PharmacyItem, 'id' | 'total'>) => void;
  onRemoveItem: (id: number) => void;
  medicineNameInputRef?: React.RefObject<HTMLInputElement>;
  resetTrigger?: number;
}

const PharmacyBilling: React.FC<PharmacyBillingProps> = ({ items, onAddItem, onRemoveItem, medicineNameInputRef, resetTrigger }) => {
  const cashCounterApi = new CashCounterApiService();
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const unitInputRef = useRef<HTMLInputElement>(null);

  const [newItem, setNewItem] = React.useState({
    genericName: '',
    medicineName: '',
    batch: '',
    unit: 1,
    stock: 0,
    mrp: 0,
    prodsId: 0,
    batchId: 0,
    storeId: 1,
    expiryDate: '',
    salesPrice: 0,
    sgstPer: 0,
    cgstPer: 0,
    igstPer: 0
  });

  // Autocomplete state
  const [medicineSuggestions, setMedicineSuggestions] = useState<any[]>([]);
  const [showMedicineSuggestions, setShowMedicineSuggestions] = useState(false);
  const [medicineSearchTerm, setMedicineSearchTerm] = useState('');
  const [selectedMedicineIndex, setSelectedMedicineIndex] = useState(-1);
  const [availableBatches, setAvailableBatches] = useState<any[]>([]);

  // Helper function to get storeId from session storage with default value
  const getStoreId = (): number => {
    try {
      // First check for pharmacy module session data
      const pharmacyData = sessionStorage.getItem('pharmacySubModuleData');
      if (pharmacyData) {
        const parsedData = JSON.parse(pharmacyData);
        return parsedData.masterId || 1;
      }
      
      // Fall back to central stores/cash counter session data
      const storedData = sessionStorage.getItem('selectedStore');
      if (storedData) {
        const parsedData = JSON.parse(storedData);
        return parsedData.masterId || 1;
      }
    } catch (error) {
      console.error('Error reading storeId from session:', error);
    }
    return 1; // Default value
  };

  // Reset form when resetTrigger changes
  useEffect(() => {
    if (resetTrigger !== undefined) {
      setNewItem({
        genericName: '',
        medicineName: '',
        batch: '',
        unit: 1,
        stock: 0,
        mrp: 0,
        prodsId: 0,
        batchId: 0,
        storeId: 1,
        expiryDate: '',
        salesPrice: 0,
        sgstPer: 0,
        cgstPer: 0,
        igstPer: 0
      });
      setMedicineSearchTerm('');
      setMedicineSuggestions([]);
      setShowMedicineSuggestions(false);
      setSelectedMedicineIndex(-1);
      setAvailableBatches([]);
    }
  }, [resetTrigger]);

  const warnIfOutOfStock = (batch: any, source: string) => {
    const stockValue = Number(batch?.availableStock ?? 0);
    if (Number.isNaN(stockValue) || stockValue <= 0) {
      showWarningModal(`Stock is 0 for selected batch (${source})`);
    }
  };

  const warnIfExpired = (batch: any) => {
    if (!batch?.expiryDate) return;
    const expiryTime = new Date(batch.expiryDate).getTime();
    if (Number.isNaN(expiryTime)) return;
    if (expiryTime < Date.now()) {
      showWarningModal('medicine has expired for the selected batch');
    }
  };

  // Handle medicine search
  const handleMedicineSearch = async (searchValue: string) => {
    setMedicineSearchTerm(searchValue);
    setNewItem({...newItem, medicineName: searchValue});
    
    if (!searchValue || searchValue.length < 2) {
      setMedicineSuggestions([]);
      setShowMedicineSuggestions(false);
      return;
    }

    try {
      const phModId = 2;
      const medicines = await cashCounterApi.fetchMedicinesForBilling(phModId, searchValue);
      console.log('Received medicines:', medicines);
      setMedicineSuggestions(medicines);
      setShowMedicineSuggestions(medicines.length > 0);
      setSelectedMedicineIndex(-1);
    } catch (error) {
      console.error('Error fetching medicines:', error);
      setMedicineSuggestions([]);
      setShowMedicineSuggestions(false);
    }
  };

  // Handle medicine selection from autocomplete
  const handleMedicineSelect = async (medicine: any) => {
    console.log('Selected medicine:', medicine);
    
    if (!medicine.prodsId) {
      showErrorToast('Invalid medicine selected. Missing product ID.');
      return;
    }

    try {
      // Fetch batch details for the selected medicine
      const storeId = getStoreId();
      const batches = await cashCounterApi.fetchBatchDetailsByProdsId(medicine.prodsId, storeId);
      console.log('Received batches:', batches);
      
      if (!batches || batches.length === 0) {
        showWarningToast('No batches available for this medicine');
        return;
      }

      // Sort batches by expiry date (earliest first)
      const sortedBatches = [...batches].sort((a, b) => {
        const dateA = new Date(a.expiryDate).getTime();
        const dateB = new Date(b.expiryDate).getTime();
        return dateA - dateB;
      });

      // Store all batches for dropdown selection
      setAvailableBatches(sortedBatches);

      // Pre-select the batch that's going to expire soon (first one after sorting)
      const selectedBatch = sortedBatches[0];
      console.log('Auto-selected batch (expiring soon):', selectedBatch);
      warnIfOutOfStock(selectedBatch, 'auto-selected');
      warnIfExpired(selectedBatch);

      // Update newItem with medicine and batch details
      setNewItem({
        ...newItem,
        genericName: medicine.genericName || '',
        medicineName: medicine.prodsName || '',
        prodsId: medicine.prodsId,
        batch: selectedBatch.batchNo || '',
        batchId: selectedBatch.batchId,
        storeId: selectedBatch.storeId || 1,
        mrp: selectedBatch.mrp || 0,
        salesPrice: selectedBatch.salesPrice || 0,
        expiryDate: selectedBatch.expiryDate || '',
        sgstPer: selectedBatch.sgstPer || 0,
        cgstPer: selectedBatch.cgstPer || 0,
        igstPer: selectedBatch.igstPer || 0,
        stock: selectedBatch.availableStock || 0
      });

      setMedicineSearchTerm('');
      setShowMedicineSuggestions(false);
      setMedicineSuggestions([]);

      // Focus on unit field after selection
      setTimeout(() => {
        unitInputRef.current?.focus();
        unitInputRef.current?.select();
      }, 100);

    } catch (error) {
      console.error('Error fetching batch details:', error);
      showErrorToast('Failed to fetch batch details');
    }
  };

  // Handle keyboard navigation in suggestions
  // Handle batch selection change
  const handleBatchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedBatchId = parseInt(e.target.value);
    const selectedBatch = availableBatches.find(b => b.batchId === selectedBatchId);
    
    if (selectedBatch) {
      warnIfOutOfStock(selectedBatch, 'manual selection');
      warnIfExpired(selectedBatch);
      setNewItem({
        ...newItem,
        batch: selectedBatch.batchNo || '',
        batchId: selectedBatch.batchId,
        storeId: selectedBatch.storeId || 1,
        mrp: selectedBatch.mrp || 0,
        salesPrice: selectedBatch.salesPrice || 0,
        expiryDate: selectedBatch.expiryDate || '',
        sgstPer: selectedBatch.sgstPer || 0,
        cgstPer: selectedBatch.cgstPer || 0,
        igstPer: selectedBatch.igstPer || 0,
        stock: selectedBatch.availableStock || 0
      });
    }
  };

  const handleMedicineKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showMedicineSuggestions || medicineSuggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedMedicineIndex(prev => 
        prev < medicineSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedMedicineIndex(prev => prev > 0 ? prev - 1 : -1);
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (selectedMedicineIndex >= 0) {
        handleMedicineSelect(medicineSuggestions[selectedMedicineIndex]);
      } else if (medicineSuggestions.length > 0) {
        handleMedicineSelect(medicineSuggestions[0]);
      }
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (selectedMedicineIndex >= 0) {
        handleMedicineSelect(medicineSuggestions[selectedMedicineIndex]);
      } else if (medicineSuggestions.length > 0) {
        handleMedicineSelect(medicineSuggestions[0]);
      }
    } else if (e.key === 'Escape') {
      setShowMedicineSuggestions(false);
      setSelectedMedicineIndex(-1);
    }
  };

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node) &&
          medicineNameInputRef?.current && !medicineNameInputRef?.current.contains(event.target as Node)) {
        setShowMedicineSuggestions(false);
        setSelectedMedicineIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddClick = () => {
    if (!newItem.medicineName || !newItem.genericName) {
      showWarningToast('Please select a medicine');
      return;
    }
    if (!newItem.batch) {
      showWarningToast('Batch information is missing');
      return;
    }
    if (newItem.expiryDate) {
      const expiryTime = new Date(newItem.expiryDate).getTime();
      if (!Number.isNaN(expiryTime) && expiryTime < Date.now()) {
        showWarningModal('medicine has expired for the selected batch');
        return;
      }
    }
    if (Number(newItem.stock) <= 0) {
      showWarningModal('Stock is 0 for selected batch');
      return;
    }
    if (newItem.unit <= 0) {
      showWarningToast('Please enter a valid quantity');
      return;
    }
    
    onAddItem(newItem);
    setNewItem({ 
      genericName: '', 
      medicineName: '', 
      batch: '', 
      unit: 1, 
      stock: 0, 
      mrp: 0,
      prodsId: 0,
      batchId: 0,
      storeId: 1,
      expiryDate: '',
      salesPrice: 0,
      sgstPer: 0,
      cgstPer: 0,
      igstPer: 0
    });
    setMedicineSearchTerm('');
    setAvailableBatches([]);
    
    // Focus back on medicine input
    setTimeout(() => {
      medicineNameInputRef?.current?.focus();
    }, 100);
  };

  return (
    <Card className="neat-card" style={{height: 'calc(100vh - 250px)', display: 'flex', flexDirection: 'column'}}>
      <Card.Body className="p-0" style={{flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>
        {/* Module Details Header */}
        <div className="d-flex align-items-center px-3 py-1 bg-light border-bottom">
          <FaPillsIcon className="me-2 text-primary" />
          <span className="text-muted fw-bold text-uppercase small letter-spacing-1">Pharmacy Details</span>
        </div>
        {/* Item Entry */}
        <div className="p-2 bg-white border-bottom" style={{flexShrink: 0}}>
          <Row className="g-2 align-items-end">
            <Col md={2}>
              <div className="position-relative">
                <Form.Control 
                  placeholder=" "
                  value={newItem.genericName}
                  readOnly
                  style={{ height: '28px', backgroundColor: '#f8f9fa' }}
                />
                <label className="floating-label">Generic Name</label>
              </div>
            </Col>
            <Col md={3}>
              <div className="position-relative">
                <Form.Control 
                  ref={medicineNameInputRef}
                  placeholder=" "
                  value={medicineSearchTerm || newItem.medicineName}
                  onChange={(e) => handleMedicineSearch(e.target.value)}
                  onKeyDown={handleMedicineKeyDown}
                  autoComplete="off"
                  style={{ height: '28px' }}
                />
                <label className="floating-label">Medicine Name</label>
                {/* Autocomplete Suggestions Dropdown */}
                {showMedicineSuggestions && medicineSuggestions.length > 0 && (
                  <div
                    ref={suggestionsRef}
                    style={{
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
                      boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                    }}
                  >
                    {medicineSuggestions.map((medicine, index) => (
                      <div
                        key={index}
                        onClick={() => handleMedicineSelect(medicine)}
                        style={{
                          padding: '8px 12px',
                          cursor: 'pointer',
                          backgroundColor: selectedMedicineIndex === index ? '#e3f2fd' : 'white',
                          borderBottom: index < medicineSuggestions.length - 1 ? '1px solid #f0f0f0' : 'none',
                          transition: 'background-color 0.2s'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = '#e3f2fd';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = selectedMedicineIndex === index ? '#e3f2fd' : 'white';
                        }}
                      >
                        <div style={{ fontWeight: '500', fontSize: '13px', color: '#333' }}>
                          {medicine.prodsName}
                        </div>
                        <div style={{ fontSize: '11px', color: '#666' }}>
                          Generic: {medicine.genericName}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </Col>
            <Col md={1}>
              <div className="position-relative">
                <Form.Select
                  value={newItem.batchId || ''}
                  onChange={handleBatchChange}
                  disabled={availableBatches.length === 0}
                  style={{ height: '28px', fontSize: '12px', backgroundColor: availableBatches.length === 0 ? '#f8f9fa' : 'white' }}
                >
                  {/* <option value="">Select Batch</option> */}
                  {availableBatches.map((batch) => {
                    const isExpired = new Date(batch.expiryDate) < new Date();
                    return (
                      <option 
                        key={batch.batchId} 
                        value={batch.batchId}
                        style={{ color: isExpired ? '#dc3545' : 'inherit' }}
                      >
                        {batch.batchNo} | Exp: {new Date(batch.expiryDate).toLocaleDateString()} | MRP: {batch.salesPrice.toFixed(2)}
                      </option>
                    );
                  })}
                </Form.Select>
                <label className="floating-label-select">Batch</label>
              </div>
            </Col>
            <Col md={1}>
              <div className="position-relative">
                <Form.Control 
                  ref={unitInputRef}
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
            <Col md={1}>
              <div className="position-relative">
                <Form.Control 
                  type="number"
                  readOnly
                  placeholder=" "
                  value={newItem.stock}
                  tabIndex={-1}
                  style={{ height: '28px', backgroundColor: '#f8f9fa' }}
                />
                <label className="floating-label">Stock</label>
              </div>
            </Col>
            <Col md={2}>
              <div className="position-relative">
                <Form.Control 
                  type="number"
                  placeholder=" "
                  value={newItem.salesPrice}
                  readOnly
                  tabIndex={-1}
                  style={{ height: '28px', backgroundColor: '#f8f9fa' }}
                />
                <label className="floating-label">MRP</label>
              </div>
            </Col>
            <Col md={1}>
              <div className="position-relative">
                <Form.Control 
                  type="text"
                  readOnly
                  placeholder=" "
                  value={((newItem.salesPrice || 0) * newItem.unit).toFixed(2)}
                  className="bg-light fw-bold text-end"
                  tabIndex={-1}
                  style={{ height: '28px' }}
                />
                <label className="floating-label">Total</label>
              </div>
            </Col>
            <Col md={1}>
              <Button 
                variant="primary" 
                onClick={handleAddClick} 
                style={{ height: '28px', width: '28px', padding: 0, borderRadius: '0px' }}
                className="d-flex align-items-center justify-content-center"
              >
                <FaPlusIcon size={12} />
              </Button>
            </Col>
          </Row>
        </div>

        {/* Items Table - Scrollable */}
        <div style={{overflowY: 'auto', flex: 1, minHeight: 0}}>
          <Table hover className="mb-0 align-middle small">
            <thead className="bg-light text-muted text-uppercase small" style={{position: 'sticky', top: 0, zIndex: 1}}>
              <tr>
                <th className="ps-4 py-2 border-0" style={{width: '5%'}}>#</th>
                <th className="py-2 border-0" style={{width: '30%'}}>Medicine Name</th>
                <th className="py-2 border-0" style={{width: '10%'}}>Batch</th>
                <th className="text-center py-2 border-0" style={{width: '8%'}}>Unit</th>
                <th className="text-center py-2 border-0" style={{width: '12%'}}>Expiry</th>
                <th className="text-center py-2 border-0" style={{width: '8%'}}>Stock</th>
                <th className="text-end py-2 border-0" style={{width: '10%'}}>MRP</th>
                <th className="text-end py-2 border-0" style={{width: '12%'}}>Total</th>
                <th className="text-center py-2 border-0" style={{width: '5%'}}>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-5 text-muted border-0">
                    <div className="d-flex flex-column align-items-center">
                      <FaPillsIcon size={32} className="mb-2 opacity-25" />
                      <p className="mb-0">No medicines added yet</p>
                      <small>Add medicines using the form above</small>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item, index) => (
                  <tr key={item.id}>
                    <td className="ps-4 py-2 border-bottom-0">{index + 1}</td>
                    <td className="fw-medium py-2 border-bottom-0">{item.medicineName || ''}</td>
                    <td className="py-2 border-bottom-0"><Badge bg="light" className="text-dark border fw-normal">{item.batch || ''}</Badge></td>
                    <td className="text-center py-2 border-bottom-0">{item.unit || 0}</td>
                    <td className="text-center py-2 border-bottom-0">
                      {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="text-center py-2 border-bottom-0">{item.stock || 0}</td>
                    <td className="text-end py-2 border-bottom-0">{(item.salesPrice || 0).toFixed(2)}</td>
                    <td className="text-end fw-bold py-2 border-bottom-0">{((item.salesPrice || 0) * (item.unit || 0)).toFixed(2)}</td>
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

export default PharmacyBilling;