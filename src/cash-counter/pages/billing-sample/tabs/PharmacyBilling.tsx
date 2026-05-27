import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Modal, Row, Col, Card, Form, Button, Table, Badge } from 'react-bootstrap';
import { FaPlus, FaTrash, FaPills, FaClipboardList, FaListUl, FaHistory } from 'react-icons/fa';
import { CashCounterApiService } from '../../../../api/cash-counter/cash-counter-api-service';
import { PharmacyStoresApiService, SubModuleResponse } from '../../../../api/pharmacy-stores/pharmacy-stores-api-service';
import CentralStoresApiService from '../../../../api/central-stores/central-stores-api-service';
import { showErrorToast, showWarningToast, showWarningModal, showSuccessToast } from '../../../../utils/alertUtil';
import PharmacyTemplateModal from '../modals/PharmacyTemplateModal';
import OrderModal, { PharmacyOrder, InvestigationOrder, LabOrder, BillingPermissions } from '../modals/OrderModal';

const FaPlusIcon = FaPlus as any;
const FaTrashIcon = FaTrash as any;
const FaPillsIcon = FaPills as any;
const FaClipboardListIcon = FaClipboardList as any;
const FaListUlIcon = FaListUl as any;
const FaHistoryIcon = FaHistory as any;

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
  phOrderId?: number;
  discountPer?: number;
  discount?: number;
}

interface PharmacyBillingProps {
  items: PharmacyItem[];
  onAddItem: (item: Omit<PharmacyItem, 'id' | 'total'>) => void;
  onRemoveItem: (id: number) => void;
  patient?: any;
  medicineNameInputRef?: React.RefObject<HTMLInputElement>;
  resetTrigger?: number;
  patientId?: string;
  visitId?: string;
  permissions?: BillingPermissions;
  onSelectInvestigationOrderFromModal?: (order: InvestigationOrder) => void;
  onSelectLabOrderFromModal?: (order: LabOrder) => void;
  onRegisterOrderHandler?: (handler: (order: PharmacyOrder) => void) => void;
}

const PharmacyBilling: React.FC<PharmacyBillingProps> = ({
  items,
  onAddItem,
  onRemoveItem,
  patient,
  medicineNameInputRef,
  resetTrigger,
  patientId,
  visitId,
  permissions,
  onSelectInvestigationOrderFromModal,
  onSelectLabOrderFromModal,
  onRegisterOrderHandler,
}) => {
  const cashCounterApi = new CashCounterApiService();
  const centralStoresApi = new CentralStoresApiService();
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const suggestionItemRefs = useRef<Array<HTMLDivElement | null>>([]);
  const unitInputRef = useRef<HTMLInputElement>(null);
  const itemsRef = useRef(items);
  itemsRef.current = items;
  const [showOrderModal, setShowOrderModal] = useState(false);

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
    igstPer: 0,
    discountPer: 0,
    discount: 0
  });

  const [medicineSuggestions, setMedicineSuggestions] = useState<any[]>([]);
  const [showMedicineSuggestions, setShowMedicineSuggestions] = useState(false);
  const [medicineSearchTerm, setMedicineSearchTerm] = useState('');
  const [selectedMedicineIndex, setSelectedMedicineIndex] = useState(-1);
  const [availableBatches, setAvailableBatches] = useState<any[]>([]);
  const [wholesaleStock, setWholesaleStock] = useState<number | null>(null);
  const [loadingWholesaleStock, setLoadingWholesaleStock] = useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [pharmacyTemplates, setPharmacyTemplates] = useState<any[]>([]);
  const [showPrevMedModal, setShowPrevMedModal] = useState(false);
  const [prevMedHistory, setPrevMedHistory] = useState<any[]>([]);
  const [loadingPrevMed, setLoadingPrevMed] = useState(false);
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

  const [allStores, setAllStores] = useState<SubModuleResponse[]>([]);
  const [selectedStoreId, setSelectedStoreId] = useState<number>(1);

  useEffect(() => {
    const pharmacyStoresApi = new PharmacyStoresApiService();
    pharmacyStoresApi.getSubModules(3).then(stores => {
      setAllStores(stores);
      if (stores.length > 0) {
        const match = stores.find(s => s.masterId === 1);
        setSelectedStoreId(match ? 1 : stores[0].masterId);
      }
    }).catch(err => {
      console.error('Error loading pharmacy stores:', err);
    });
  }, []);

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
        igstPer: 0,
        discountPer: 0,
        discount: 0
      });
      setMedicineSearchTerm('');
      setMedicineSuggestions([]);
      setShowMedicineSuggestions(false);
      setSelectedMedicineIndex(-1);
      setAvailableBatches([]);
      setWholesaleStock(null);
      setLoadingWholesaleStock(false);
    }
  }, [resetTrigger]);

  const handleSelectPharmacyOrder = useCallback(async (order: PharmacyOrder) => {
    let addedCount = 0;
    let failedCount = 0;
    
    for (const detail of order.details) {
      try {
        // Search for medicine to get prodsId
        const medicines = await cashCounterApi.fetchMedicinesForBilling(2, detail.prodsName || '');
        
        // Find exact match by product name
        const medicine = medicines.find(m => m.prodsName === detail.prodsName);
        
        if (!medicine || !medicine.prodsId) {
          console.error(`Product not found: ${detail.prodsName}`);
          failedCount++;
          continue;
        }
        
        // Fetch batches for this product
        const storeId = selectedStoreId;
        const batches = await cashCounterApi.fetchBatchDetailsByProdsId(medicine.prodsId, storeId);
        
        if (!batches || batches.length === 0) {
          console.error(`No batches found for: ${detail.prodsName}`);
          failedCount++;
          continue;
        }
        
        // Find the matching batch by batch number
        const matchingBatch = batches.find(b => b.batchNo === detail.batchNo);
        const selectedBatch = matchingBatch || batches[0]; // Fallback to first batch if exact match not found
        
        // Add item with proper IDs
        const batchMrp = selectedBatch.mrp || detail.mrp || 0;
        const batchDiscountPer = Number(selectedBatch.discountPer || 0);
        const calculatedDiscount = (batchMrp * batchDiscountPer) / 100;
        const finalPrice = batchMrp - calculatedDiscount;
        
        onAddItem({
          genericName: detail.genericName || medicine.genericName || '',
          medicineName: medicine.prodsName || '',
          batch: selectedBatch.batchNo || '',
          unit: detail.units || 1,
          stock: Number(selectedBatch.availableStock || 0),
          mrp: batchMrp,
          prodsId: medicine.prodsId,
          batchId: selectedBatch.batchId,
          storeId: selectedBatch.storeId || 1,
          expiryDate: selectedBatch.expiryDate || '',
          salesPrice: finalPrice,
          sgstPer: Number(selectedBatch.sgstPer || 0),
          cgstPer: Number(selectedBatch.cgstPer || 0),
          igstPer: Number(selectedBatch.igstPer || 0),
          phOrderId: order.id || 0,
          discountPer: batchDiscountPer,
          discount: calculatedDiscount,
        });
        addedCount++;
      } catch (error) {
        console.error(`Error loading pharmacy item: ${detail.prodsName}`, error);
        failedCount++;
      }
    }
    
    if (addedCount > 0) {
      showSuccessToast(`${addedCount} pharmacy item(s) loaded from order ${order.orderNo}`);
    }
    if (failedCount > 0) {
      showWarningToast(`${failedCount} item(s) could not be loaded. Check console for details.`);
    }
  }, [onAddItem, selectedStoreId]);

  // Use ref to store latest handler to avoid infinite loop
  const handlerRef = useRef(handleSelectPharmacyOrder);
  
  // Update ref whenever handler changes
  useEffect(() => {
    handlerRef.current = handleSelectPharmacyOrder;
  }, [handleSelectPharmacyOrder]);

  // Register stable wrapper function with parent only once
  useEffect(() => {
    if (onRegisterOrderHandler) {
      onRegisterOrderHandler((order: PharmacyOrder) => handlerRef.current(order));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onRegisterOrderHandler]);

  const handleLoadTemplates = async () => {
    try {
      const response = await cashCounterApi.fetchPharmacyTemplates();
      const templates = response?.data || response || [];
      setPharmacyTemplates(Array.isArray(templates) ? templates : []);
      setShowTemplateModal(true);
    } catch (error) {
      console.error('Error loading templates:', error);
      showErrorToast('Failed to load pharmacy templates');
    }
  };

  const handleOpenPrevMedHistory = async () => {
    const patId = patient?.patId;
    if (!patId) return;
    setShowPrevMedModal(true);
    setLoadingPrevMed(true);
    setPrevMedHistory([]);
    try {
      const pharmacyStoresApi = new PharmacyStoresApiService();
      const data = await pharmacyStoresApi.fetchPreviousMedicineDetailsByPatId(patId);
      setPrevMedHistory(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading previous medicine history:', error);
      showErrorToast('Failed to load previous medicine history');
    } finally {
      setLoadingPrevMed(false);
    }
  };

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

  const handleMedicineSearch = async (searchValue: string) => {
    setMedicineSearchTerm(searchValue);
    setNewItem({...newItem, medicineName: searchValue});
    
    if (!searchValue || searchValue.length < 2) {
      setMedicineSuggestions([]);
      setShowMedicineSuggestions(false);
      return;
    }

    try {
      const medicines = await cashCounterApi.fetchMedicinesForBilling(2, searchValue);
      setMedicineSuggestions(medicines);
      setShowMedicineSuggestions(medicines.length > 0);
      setSelectedMedicineIndex(-1);
    } catch (error) {
      console.error('Error fetching medicines:', error);
      setMedicineSuggestions([]);
      setShowMedicineSuggestions(false);
    }
  };

  const handleMedicineSelect = async (medicine: any) => {
    if (!medicine.prodsId) {
      showErrorToast('Invalid medicine selected. Missing product ID.');
      return;
    }

    try {
      const storeId = selectedStoreId;
      const batches = await cashCounterApi.fetchBatchDetailsByProdsId(medicine.prodsId, storeId);
      
      if (!batches || batches.length === 0) {
        showWarningToast('No batches available for this medicine');
        return;
      }

      const sortedBatches = [...batches].sort((a, b) => {
        const dateA = new Date(a.expiryDate).getTime();
        const dateB = new Date(b.expiryDate).getTime();
        return dateA - dateB;
      });

      setAvailableBatches(sortedBatches);

      // Select the first batch with available stock (soonest to expire with stock)
      const selectedBatch = sortedBatches.find(batch => Number(batch.availableStock || 0) > 0) || sortedBatches[0];
      
      warnIfOutOfStock(selectedBatch, 'auto-selected');
      warnIfExpired(selectedBatch);

      const batchMrp = selectedBatch.mrp || 0;
      const batchDiscountPer = Number(selectedBatch.discountPer || 0);
      const calculatedDiscount = parseFloat(((batchMrp * batchDiscountPer) / 100).toFixed(4));
      const finalPrice = parseFloat((batchMrp - calculatedDiscount).toFixed(4));

      setNewItem({
        ...newItem,
        genericName: medicine.genericName || '',
        medicineName: medicine.prodsName || '',
        prodsId: medicine.prodsId,
        batch: selectedBatch.batchNo || '',
        batchId: selectedBatch.batchId,
        storeId: selectedBatch.storeId || 1,
        mrp: batchMrp,
        salesPrice: finalPrice,
        expiryDate: selectedBatch.expiryDate || '',
        sgstPer: selectedBatch.sgstPer || 0,
        cgstPer: selectedBatch.cgstPer || 0,
        igstPer: selectedBatch.igstPer || 0,
        stock: selectedBatch.availableStock || 0,
        discountPer: batchDiscountPer,
        discount: calculatedDiscount
      });

      setMedicineSearchTerm('');
      setShowMedicineSuggestions(false);
      setMedicineSuggestions([]);

      // Fetch wholesale store stock (storeId=2)
      setWholesaleStock(null);
      setLoadingWholesaleStock(true);
      centralStoresApi.getAvailableStockForProductByStoreId(medicine.prodsId, 2)
        .then(stock => setWholesaleStock(stock))
        .catch(() => setWholesaleStock(null))
        .finally(() => setLoadingWholesaleStock(false));

      setTimeout(() => {
        unitInputRef.current?.focus();
        unitInputRef.current?.select();
      }, 100);

    } catch (error) {
      console.error('Error fetching batch details:', error);
      showErrorToast('Failed to fetch batch details');
    }
  };

  const handleBatchChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedBatchId = parseInt(e.target.value);
    const selectedBatch = availableBatches.find(b => b.batchId === selectedBatchId);
    
    if (selectedBatch) {
      warnIfOutOfStock(selectedBatch, 'manual selection');
      warnIfExpired(selectedBatch);
      
      const batchMrp = selectedBatch.mrp || 0;
      const batchDiscountPer = Number(selectedBatch.discountPer || 0);
      const calculatedDiscount = parseFloat(((batchMrp * batchDiscountPer) / 100).toFixed(4));
      const finalPrice = parseFloat((batchMrp - calculatedDiscount).toFixed(4));
      
      setNewItem({
        ...newItem,
        batch: selectedBatch.batchNo || '',
        batchId: selectedBatch.batchId,
        storeId: selectedBatch.storeId || 1,
        mrp: batchMrp,
        salesPrice: finalPrice,
        expiryDate: selectedBatch.expiryDate || '',
        discountPer: batchDiscountPer,
        discount: calculatedDiscount,
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

  useEffect(() => {
    if (!showMedicineSuggestions || selectedMedicineIndex < 0) return;

    const activeSuggestion = suggestionItemRefs.current[selectedMedicineIndex];
    if (activeSuggestion) {
      activeSuggestion.scrollIntoView({ block: 'nearest' });
    }
  }, [selectedMedicineIndex, showMedicineSuggestions]);

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

    //// alert for quantity exceeding stock
    console.log('Checking stock vs unit:', { stock: newItem.stock, unit: newItem.unit });
        if (newItem.unit > Number(newItem.stock)) {
          showWarningToast(`Quantity (${newItem.unit}) exceeds available stock (${newItem.stock}) for the selected batch`);
          return;
        }
       // const isDuplicate = items.some(
        const isDuplicate = newItem.prodsId > 0 && itemsRef.current.some(
          item => item.prodsId === newItem.prodsId && item.batchId === newItem.batchId
        );
        if (isDuplicate) {
          showWarningToast(`${newItem.medicineName} (Batch: ${newItem.batch}) is already added to the list`);
          return;
        }
        onAddItem(newItem);
        ////////////  end of duplicate check
    
  
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
      igstPer: 0,
      discountPer: 0,
      discount: 0
    });
    setMedicineSearchTerm('');
    setAvailableBatches([]);
    
    setTimeout(() => {
      medicineNameInputRef?.current?.focus();
    }, 100);
  };

  return (
    <>
    <Card className="border-0 shadow-sm d-flex flex-column h-100" style={{minHeight: 0}}>
      <Card.Header className="bg-light p-3 border-bottom flex-shrink-0">
        <div className="d-flex align-items-center justify-content-between gap-2">
          <div className="d-flex align-items-center gap-2">
            <FaPillsIcon style={{ color: 'var(--themePrimary)' }} />
            <span className="fw-bold small text-uppercase">Pharmacy Details</span>
          </div>
          <div className="d-flex gap-2 align-items-center">
            {allStores.length > 0 && (
              <Form.Select
                size="sm"
                value={selectedStoreId}
                onChange={(e) => setSelectedStoreId(Number(e.target.value))}
                disabled={items.length > 0}
                style={{ width: '160px', fontSize: 'var(--font-size-xs)' }}
                title={items.length > 0 ? 'Remove all medicines to change store' : 'Select pharmacy store'}
              >
                {allStores.map((store:any , index: number) => (
                  <option key={index} value={store.masterId}>{store.subModName}</option>
                ))}
              </Form.Select>
            )}
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
              onClick={handleLoadTemplates}
              title="Load pharmacy templates"
              className="d-flex align-items-center gap-2 theme-outline-btn-primary"
              disabled={!patient}
            >
              <FaClipboardListIcon size={14} />
              <span style={{fontSize: '0.75rem'}}>Templates</span>
            </Button>
            <Button
              size="sm"
              onClick={handleOpenPrevMedHistory}
              title="Previous Medicine History"
              className="d-flex align-items-center gap-2 theme-outline-btn-primary"
              disabled={!patient}
            >
              <FaHistoryIcon size={14} />
            </Button>
          </div>
        </div>
      </Card.Header>
      <Card.Body className="p-0 d-flex flex-column flex-grow-1" style={{minHeight: 0, overflow: 'visible'}}>
        {/* Item Entry Form */}
        <div className="p-3 bg-light border-bottom flex-shrink-0">
          <div className="d-flex gap-2 align-items-start">
            {/* Generic Name - Hidden (will be used later) */}
            <div className="flex-shrink-0" style={{display: 'none'}}>
              <div className="position-relative">
                <Form.Control 
                  placeholder=" "
                  value={newItem.genericName}
                  readOnly
                  size="sm"
                  className="bg-light"
                />
                <label className="floating-label">Generic Name</label>
              </div>
            </div>
            <div className="flex-grow-1" style={{minWidth: '200px', maxWidth: '30%'}}>
              <Form.Label style={{fontSize: '0.75rem', marginBottom: '4px', fontWeight: '500'}}>Medicine Name</Form.Label>
              <div className="position-relative">
                <Form.Control 
                  ref={medicineNameInputRef}
                  placeholder="Search medicine..."
                  value={medicineSearchTerm || newItem.medicineName}
                  onChange={(e) => handleMedicineSearch(e.target.value)}
                  onKeyDown={handleMedicineKeyDown}
                  autoComplete="off"
                  size="sm"
                />
                {showMedicineSuggestions && medicineSuggestions.length > 0 && (
                  <div
                    ref={suggestionsRef}
                    style={{
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
                    }}
                  >
                    {medicineSuggestions.map((medicine, index) => (
                      <div
                        key={index}
                        ref={(element) => {
                          suggestionItemRefs.current[index] = element;
                        }}
                        onClick={() => handleMedicineSelect(medicine)}
                        style={{
                          padding: '8px 12px',
                          cursor: 'pointer',
                          backgroundColor: selectedMedicineIndex === index ? 'var(--page-primary-color)' : 'white',
                          borderBottom: index < medicineSuggestions.length - 1 ? '1px solid #f0f0f0' : 'none',
                          fontSize: '13px'
                        }}
                        onMouseEnter={() => setSelectedMedicineIndex(index)}
                      >
                        <div style={{ fontWeight: '500', color: selectedMedicineIndex === index ? 'var(--page-secondary-color)' : '#212529' }}>
                          {medicine.prodsName}
                        </div>
                        <div style={{ fontSize: '11px', color: selectedMedicineIndex === index ? 'var(--page-secondary-color)' : '#6c757d', marginTop: '2px' }}>
                          Generic: {medicine.genericName}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
            <div className="flex-shrink-0" style={{width: '10%', minWidth: '100px'}}>
              <Form.Label style={{fontSize: '0.75rem', marginBottom: '4px', fontWeight: '500'}}>Batch</Form.Label>
              <Form.Select
                value={newItem.batchId || ''}
                onChange={handleBatchChange}
                disabled={availableBatches.length === 0}
                size="sm"
                className={availableBatches.length === 0 ? 'bg-light' : ''}
              >
                <option value="">Select Batch</option>
                {availableBatches.map((batch, batchIdx) => {
                  const isExpired = new Date(batch.expiryDate) < new Date();
                  const stock = Number(batch.availableStock || 0);
                  return (
                    <option 
                      key={`${batch.batchId}-${batchIdx}`} 
                      value={batch.batchId}
                      style={{ color: isExpired ? '#dc3545' : stock === 0 ? '#6c757d' : 'inherit' }}
                    >
                      {batch.batchNo} - Stock: {stock} (Exp: {new Date(batch.expiryDate).toLocaleDateString()})
                    </option>
                  );
                })}
              </Form.Select>
            </div>
            <div className="flex-shrink-0" style={{width: '8%', minWidth: '50px'}}>
              <Form.Label style={{fontSize: '0.75rem', marginBottom: '4px', fontWeight: '500'}}>Unit</Form.Label>
              <Form.Control 
                ref={unitInputRef}
                type="number"
                min="1"
                placeholder="1"
                value={newItem.unit}
                onChange={(e) => setNewItem({...newItem, unit: parseInt(e.target.value) || 0})}
                onKeyDown={(e) => e.key === 'Enter' && handleAddClick()}
                size="sm"
              />
            </div>
            <div className="flex-shrink-0 d-flex flex-column" style={{width: '8%', minWidth: '60px', marginTop: '1.625rem'}}>
              <small className="text-muted" style={{fontSize: '0.65rem', marginBottom: '2px'}}>Stock</small>
              <div className="fw-bold" style={{fontSize: '0.875rem', lineHeight: '1.5'}}>{newItem.stock}</div>
            </div>
            <div className="flex-shrink-0 d-flex flex-column" style={{width: '10%', minWidth: '90px', marginTop: '1.625rem'}}>
              <small className="text-muted" style={{fontSize: '0.65rem', marginBottom: '2px'}}>MRP</small>
              <div className="fw-bold d-flex align-items-center flex-nowrap" style={{fontSize: '0.875rem', gap: '4px'}}>
                {newItem.discountPer > 0 ? (
                  <>
                    <span className="text-decoration-line-through text-muted">₹{(newItem.mrp || 0).toFixed(2)}</span>
                    <span className="text-success">₹{(newItem.salesPrice || 0).toFixed(2)}</span>
                  </>
                ) : (
                  <span>₹{(newItem.mrp || 0).toFixed(2)}</span>
                )}
              </div>
            </div>
            <div className="flex-shrink-0 d-flex flex-column" style={{width: '8%', minWidth: '70px', marginTop: '1.625rem'}}>
              <small className="text-muted" style={{fontSize: '0.65rem', marginBottom: '2px'}}>W.Stock</small>
              <div style={{display: 'inline-block'}}>
                <span style={{
                  fontSize: '0.8rem',
                  fontWeight: 700,
                  padding: '1px 6px',
                  borderRadius: '4px',
                  background: wholesaleStock !== null && wholesaleStock <= 0 ? 'var(--danger-color, #dc3545)' : 'var(--page-secondary-color)',
                  color: 'var(--page-primary-color)',
                }}>
                  {loadingWholesaleStock ? '...' : wholesaleStock !== null ? wholesaleStock : '-'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Items Table */}
        <div className="d-flex flex-column flex-grow-1" style={{minHeight: 0, overflow: 'auto'}}>
          <Table hover className="mb-0 align-middle" style={{fontSize: '0.75rem'}}>
            <thead className="bg-light text-muted text-uppercase sticky-top" style={{fontSize: '0.65rem', zIndex: 1}}>
              <tr>
                <th className="ps-3 py-2" style={{width: '5%'}}>#</th>
                <th className="py-2" style={{width: '20%'}}>Medicine Name</th>
                <th className="text-center py-2" style={{width: '12%'}}>Expiry</th>
                <th className="text-end py-2" style={{width: '10%'}}>MRP</th>
                <th className="text-center py-2" style={{width: '8%'}}>Unit</th>
                <th className="text-end py-2" style={{width: '12%'}}>MRP Total</th>
                <th className="text-end py-2" style={{width: '13%'}}>Discount</th>
                <th className="text-end py-2" style={{width: '12%'}}>Total</th>
                <th className="text-center py-2" style={{width: '7%'}}>Action</th>
              </tr>
            </thead>
            <tbody>
              {items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="text-center py-5 text-muted">
                    <div className="d-flex flex-column align-items-center">
                      <FaPillsIcon size={32} className="mb-2 opacity-50" />
                      <p className="small mb-0">No medicines added yet</p>
                      <small>Add medicines using the form above</small>
                    </div>
                  </td>
                </tr>
              ) : (
                items.map((item, index) => {
                  const totalMrp = (item.mrp || 0) * (item.unit || 0);
                  const discountAmount = ((item.mrp || 0) - (item.salesPrice || 0)) * (item.unit || 0);
                  const totalAfterDiscount = (item.salesPrice || 0) * (item.unit || 0);
                  
                  return (
                    <tr key={item.id}>
                      <td className="ps-3">{index + 1}</td>
                      <td className="fw-medium">
                        <div>{item.medicineName || ''}</div>
                        <small className="text-muted">
                          <Badge bg="light" text="dark" className="border" style={{fontSize: '0.65rem'}}>
                            {item.batch || ''}
                          </Badge>
                        </small>
                      </td>
                      <td className="text-center">
                        {item.expiryDate ? new Date(item.expiryDate).toLocaleDateString() : '-'}
                      </td>
                      <td className="text-end">₹{(item.mrp || 0).toFixed(2)}</td>
                      <td className="text-center">{item.unit || 0}</td>
                      <td className="text-end">₹{totalMrp.toFixed(2)}</td>
                      <td className="text-end">
                        {(item.discountPer || 0) > 0 ? (
                          <span className="text-success">-₹{discountAmount.toFixed(2)} ({(item.discountPer || 0).toFixed(1)}%)</span>
                        ) : (
                          <span className="text-muted">₹0.00</span>
                        )}
                      </td>
                      <td className="text-end fw-bold">₹{totalAfterDiscount.toFixed(2)}</td>
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
                  );
                })
              )}
            </tbody>
          </Table>
        </div>
      </Card.Body>
    </Card>

    {/* Template Modal */}
    <PharmacyTemplateModal
      show={showTemplateModal}
      onHide={() => setShowTemplateModal(false)}
      templates={pharmacyTemplates}
    />

    {/* Order Modal */}
    {patient && (
      <OrderModal
        show={showOrderModal}
        onHide={() => setShowOrderModal(false)}
        patientId={patient?.patId?.toString() || patientId || ''}
        visitId={patient?.lastVisitId?.toString() || visitId || ''}
        onSelectInvestigationOrder={onSelectInvestigationOrderFromModal}
        onSelectLabOrder={onSelectLabOrderFromModal}
        onSelectPharmacyOrder={handleSelectPharmacyOrder}
        activeTab="pharmacy"
        permissions={permissions}
        selectedPharmacyOrderIds={items.filter(i => i.phOrderId).map(i => i.phOrderId as number).filter((v, idx, arr) => arr.indexOf(v) === idx)}
      />
    )}

    {/* Previous Medicine History Modal */}
    <Modal show={showPrevMedModal} onHide={() => setShowPrevMedModal(false)} size="xl" centered>
      <Modal.Header closeButton className="bg-light border-bottom">
        <Modal.Title className="fw-bold d-flex align-items-center gap-2">
          <FaHistoryIcon className="text-primary" />
          Previous Medicine History
          {patient && (
            <span className="fw-normal text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>
              — {patient.name}
            </span>
          )}
        </Modal.Title>
      </Modal.Header>
      <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto', padding: 0 }}>
        {loadingPrevMed ? (
          <div className="text-center py-5 text-muted">
            <div className="spinner-border spinner-border-sm me-2" role="status" />
            Loading history...
          </div>
        ) : prevMedHistory.length === 0 ? (
          <div className="text-center py-5 text-muted">No previous medicine records found.</div>
        ) : (
          prevMedHistory.map((group: any, gi: number) => (
            <div key={gi} className="border-bottom">
              <div
                className="px-3 py-2 fw-bold"
                style={{
                  background: 'var(--bs-light)',
                  fontSize: 'var(--font-size-sm)',
                  color: 'var(--color-text)',
                  position: 'sticky',
                  top: 0,
                  zIndex: 1,
                }}
              >
                {group.date}
              </div>
              <Table size="sm" hover className="mb-0">
                <thead className="table-light text-uppercase small">
                  <tr>
                    <th>#</th>
                    <th>Date &amp; Time</th>
                    <th>Medicine Name</th>
                    <th>Batch No</th>
                    <th className="text-center">Units</th>
                    <th className="text-end">MRP</th>
                    <th className="text-end">SP</th>
                    <th className="text-end">Total</th>
                    <th className="text-end">Discount</th>
                    <th>User</th>
                  </tr>
                </thead>
                <tbody>
                  {(group.medicines || []).map((med: any, mi: number) => (
                    <tr key={mi}>
                      <td className="text-muted">{mi + 1}</td>
                      <td style={{ whiteSpace: 'nowrap', fontSize: 'var(--font-size-xs)' }}>{med.dateTime}</td>
                      <td className="fw-medium">{med.medicineName}</td>
                      <td>{med.batchNo}</td>
                      <td className="text-center">{med.units}</td>
                      <td className="text-end">₹{Number(med.mrp || 0).toFixed(2)}</td>
                      <td className="text-end">₹{Number(med.sp || 0).toFixed(2)}</td>
                      <td className="text-end fw-semibold">₹{Number(med.total || 0).toFixed(2)}</td>
                      <td className="text-end text-danger">₹{Number(med.discountAmt || 0).toFixed(2)}</td>
                      <td style={{ fontSize: 'var(--font-size-xs)' }}>{med.userName}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          ))
        )}
      </Modal.Body>
      <Modal.Footer className="bg-light py-2">
        <Button size="sm" className="theme-btn-primary" onClick={() => setShowPrevMedModal(false)}>
          Close
        </Button>
      </Modal.Footer>
    </Modal>
    </>
  );
};

export default PharmacyBilling;
