import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../../state/store';
import { routerPathNames } from '../../../../../routes/routerPathNames';


import { Modal, Badge, Button, Form, Table, OverlayTrigger, Popover } from 'react-bootstrap';
import '../../../../../style/commonStyle.css';
import CentralStoresApiService from '../../../../../api/central-stores/central-stores-api-service';
import { useDispatch } from 'react-redux';
import { handleError } from '../../../../../utils/errorUtil';
import PageHeader from '../../../../../components/PageHeader';
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileInvoice,faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { showConfirmDialog, showSuccessToast, showErrorToast, showValidationError, showWarningModal, showInfoModal, showCustomAlert, showSuccessModal, showCustomConfirmDialog } from '../../../../../utils/alertUtil';
import { handleNumberChange, handleNumberBlur, formatNumberDisplay } from '../../../../../utils/numberInputUtil';

interface SubModuleState {
  subModId: number;
  subModName: string;
  modGroupId: number;
  modGroupName: string;
  masterId: number;
  selectedItems?: any[];
  commonVendor?: VendorDetails;
  poNumber?: string;
  orderId?: number;
  preGoodsReceipts?: any[];
}

interface PurchaseItem {
  id: number;
  invSlNo?: number;
  preGoodsId?: number;
  orderId?: number;
  detId?: number;
  prodsId?: number;
  itemCode: string;
  itemName: string;
  genericName: string;
  batchNo: string;
  batchId?: number;
  expiryDate: string;
  quantity: number;
  pack: number;
  freeQuantity: number;
  freePack: number;
  taxOnFree: number;
  unitPrice: number;
  costPerUnit: number;
  costPerMRP: number;
  discount: number;
  discAfterTax: number;
  discWithoutTaxPer: number;
  discWithoutTaxAmtInput?: number;
  discAfterTaxAmtInput?: number;
  preDiscountInputMode?: 'percentage' | 'amount';
  postDiscountInputMode?: 'percentage' | 'amount';
  preDiscountAmount: number;
  discOnMrp: number;
  discountType?: 'percentage' | 'rupees';
  taxPercentage: number;
  vatType: number;
  taxAmount: number;
  totalAmount: number;
  manufacturer: string;
  packSize: string;
  unit: string;
  hsnCode: string;
  isSaved?: number;
}

interface VendorDetails {
  id: string;
  name: string;
  gstNo: string;
  address: string;
  contactPerson: string;
  phoneNo: string;
}

const PurchaseEntry: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();
  const loginData = useSelector((state: RootState) => state.loginData);
  const centralStoresApi = new CentralStoresApiService();
  const [subModuleData, setSubModuleData] = useState<SubModuleState | null>(null);
  const [loading, setLoading] = useState(false);

  // Form States
  const [invoiceNo, setInvoiceNo] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [poNumber, setPoNumber] = useState('');
  const [selectedVendor, setSelectedVendor] = useState<VendorDetails | null>(null);
  const [showVendorDetails, setShowVendorDetails] = useState(false);
  const [remarks, setRemarks] = useState('');
  const [extraDiscount, setExtraDiscount] = useState<number>(0);
  const [surCharge, setSurCharge] = useState<number>(0);
  const [purchaseItems, setPurchaseItems] = useState<PurchaseItem[]>([]);
  const originalPurchaseItems = useRef<PurchaseItem[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);

  const fetchAndApplyBatchDiscountValue = async (index: number, batchNoValue: string) => {
    const normalizedBatchNo = (batchNoValue || '').trim();
    if (!normalizedBatchNo) return;

    try {
      const discountResponse = await centralStoresApi.fetchBatchDiscountValue(normalizedBatchNo);
      const resolvedDiscOnMrp = discountResponse ? (discountResponse.discountOnMrp ?? 0) : 0;

      setPurchaseItems(prev => prev.map((item, i) => {
        if (i !== index) return item;
        const updatedItem = { ...item, discOnMrp: resolvedDiscOnMrp };
        return calculateItemTotals(updatedItem);
      }));
    } catch (error) {
      console.error('Error fetching batch discount value:', error);
    }
  };

  const handleBatchNoBlur = (index: number, batchNoValue: string) => {
    void fetchAndApplyBatchDiscountValue(index, batchNoValue);
  };

  useEffect(() => {
    if (!loginData.authorized) {
      navigate('/login');
      return;
    }

    const state = location.state as SubModuleState;
    
    if (state) {
      setSubModuleData(state);
      
      // Pre-populate vendor if passed from prepare order
      if (state.commonVendor) {
        setSelectedVendor(state.commonVendor);
      }
      
      // Pre-populate PO number if passed
      if (state.poNumber) {
        setPoNumber(state.poNumber);
      }
      
      // Load items from pre-goods receipt API data if available
      if (state.preGoodsReceipts && state.preGoodsReceipts.length > 0) {
        
        // Filter preGoodsReceipts to only include selected items
        let receiptsToLoad = state.preGoodsReceipts;
        
        if (state.selectedItems && state.selectedItems.length > 0) {
          // Create a set of selected product names for efficient lookup
          const selectedProductNames = new Set(
            state.selectedItems.map((item: any) => item.productName.toLowerCase())
          );
          
          // Filter preGoodsReceipts to only include selected products
          receiptsToLoad = state.preGoodsReceipts.filter((receipt: any) => 
            selectedProductNames.has(receipt.productName?.toLowerCase())
          );
        }
        
        const convertedItems: PurchaseItem[] = receiptsToLoad.map((receipt: any, index: number) => ({
          id: Date.now() + index,
          invSlNo: receipt.invSlNo || index + 1,
          preGoodsId: receipt.preGoodsId || 0,
          orderId: receipt.orderId || state.orderId || 0,
          detId: receipt.detId || 0,
          prodsId: receipt.prodsId || 0,
          itemCode: receipt.productName?.substring(0, 6).toUpperCase() || '',
          itemName: receipt.productName || '',
          genericName: receipt.productName || '', // API doesn't provide separate generic name
          batchNo: (receipt.batchNo && receipt.batchNo !== '0') ? receipt.batchNo : '', // From API, treat "0" as empty
          batchId: receipt.batchId || 0,
          expiryDate: normalizeApiExpiryToMonthValue(receipt.expDate || ''), // From API, normalize for month input (YYYY-MM)
          quantity: receipt.qty || 0,
          pack: receipt.pack || 0,
          freeQuantity: receipt.free || 0,
          freePack: receipt.pack || 0,
          taxOnFree: receipt.taxOnFree || 0,
          unitPrice: receipt.cost || 0, // From API
          costPerUnit: receipt.cost || 0,
          costPerMRP: receipt.mrp || 0,
          discount: receipt.discPer || 0, // From API
          discAfterTax: receipt.discPer || 0,
          discWithoutTaxPer: receipt.discWithoutTaxPer || 0,
          discWithoutTaxAmtInput: receipt.discWithoutTaxAmt || 0,
          discAfterTaxAmtInput: 0,
          preDiscountInputMode: 'percentage' as const,
          postDiscountInputMode: 'percentage' as const,
          preDiscountAmount: receipt.discWithoutTaxAmt || 0,
          discOnMrp: receipt.discOnMrp || 0,
          discountType: 'percentage' as const,
          taxPercentage: receipt.vatPer || 0, // From API
          vatType: receipt.vatType || 0,
          taxAmount: 0, // Will be calculated
          totalAmount: 0, // Will be calculated
          manufacturer: '', // Not provided by API
          packSize: (receipt.pack && Number(receipt.pack) > 0) ? String(receipt.pack) : '1',
          unit: receipt.unit?.toString() || 'Units',
          hsnCode: (receipt.hsnCode && receipt.hsnCode !== '0') ? receipt.hsnCode : '', // From API, treat "0" as empty
          isSaved: receipt.isSaved !== undefined ? receipt.isSaved : 0 // Track save status from API
        }));
        
        // Calculate totals for each item
        const itemsWithTotals = convertedItems.map(item => calculateItemTotals(item));
        setPurchaseItems(itemsWithTotals);
        originalPurchaseItems.current = itemsWithTotals;

        // Load batch-level discount values for rows that already have a batch number.
        itemsWithTotals.forEach((item, index) => {
          if (item.batchNo && item.batchNo.trim() !== '') {
            void fetchAndApplyBatchDiscountValue(index, item.batchNo);
          }
        });
        
        if (convertedItems.length > 0) {
          showSuccessToast(`Loaded ${convertedItems.length} pending item(s) from approved purchase order.`, 'Data Loaded', 3000);
        } else {
          showInfoModal('All items in this purchase order have already been saved.', 'All Items Saved');
        }
      }
      // Fallback: Pre-populate items from selectedItems (legacy support)
      else if (state.selectedItems && state.selectedItems.length > 0) {
        const convertedItems: PurchaseItem[] = state.selectedItems.map((item: any, index: number) => ({
          id: Date.now() + index,
          invSlNo: index + 1,
          itemCode: item.productName?.substring(0, 6).toUpperCase() || '',
          itemName: item.productName || '',
          genericName: item.genericName || '',
          batchNo: '', // To be filled
          expiryDate: '', // To be filled
          quantity: item.quantity || 0,
          pack: 0,
          freeQuantity: 0, // To be filled
          freePack: 0,
          taxOnFree: 0,
          unitPrice: 0, // To be filled
          costPerUnit: 0,
          costPerMRP: 0,
          discount: 0,
          discAfterTax: 0,
          discWithoutTaxPer: 0,
          discWithoutTaxAmtInput: 0,
          discAfterTaxAmtInput: 0,
          preDiscountInputMode: 'percentage' as const,
          postDiscountInputMode: 'percentage' as const,
          preDiscountAmount: 0,
          discOnMrp: 0,
          taxPercentage: 5,
          vatType: 0,
          taxAmount: 0,
          totalAmount: 0,
          manufacturer: item.companyName || '',
          discountType: 'percentage' as const,
          packSize: (item.units && Number(item.units) > 0) ? String(item.units) : '1',
          unit: item.units || 'Tablets',
          hsnCode: ''
        }));
        setPurchaseItems(convertedItems);
      }
    }
    else {
      const storeDataStr = sessionStorage.getItem('selectedStore');
      if (storeDataStr) {
        const storeData = JSON.parse(storeDataStr) as SubModuleState;
        setSubModuleData(storeData);
      }
    }
  }, [loginData, location.state, navigate]);

  useEffect(() => {
    const disableNumberArrowStep = (event: KeyboardEvent) => {
      const target = event.target as HTMLInputElement | null;
      if (!target || target.tagName !== 'INPUT' || target.type !== 'number') {
        return;
      }

      if (event.key === 'ArrowUp' || event.key === 'ArrowDown') {
        event.preventDefault();
      }
    };

    const disableNumberWheelStep = (event: WheelEvent) => {
      const target = event.target as HTMLInputElement | null;
      if (!target || target.tagName !== 'INPUT' || target.type !== 'number') {
        return;
      }

      if (document.activeElement === target) {
        event.preventDefault();
      }
    };

    document.addEventListener('keydown', disableNumberArrowStep, true);
    document.addEventListener('wheel', disableNumberWheelStep, { passive: false, capture: true });

    return () => {
      document.removeEventListener('keydown', disableNumberArrowStep, true);
      document.removeEventListener('wheel', disableNumberWheelStep, true);
    };
  }, []);

  // Calculate item amounts when editing inline - not needed as we calculate on field change


  const handleBackToPrepare = async () => {
    const result = await showConfirmDialog('Any unsaved changes will be lost', 'Go Back?', 'Yes, Go Back', 'Stay Here');
    if (result.isConfirmed) {
      // Detect current store type from URL path
      const currentPath = location.pathname;
      const isNonMedicalStore = currentPath.includes('/non-medical-store');

      // Determine target path based on store type
      const targetPath = isNonMedicalStore
        ? routerPathNames.centralStores.nonMedicalStore.purchase.selectApprovedPO
        : routerPathNames.centralStores.medicalStore.purchase.selectApprovedPO;

      navigate(targetPath, {
        state: subModuleData
      });
    }
  };

  const navigateToSelectApprovedPO = () => {
    const currentPath = location.pathname;
    const isNonMedicalStore = currentPath.includes('/non-medical-store');

    const targetPath = isNonMedicalStore
      ? routerPathNames.centralStores.nonMedicalStore.purchase.selectApprovedPO
      : routerPathNames.centralStores.medicalStore.purchase.selectApprovedPO;

    navigate(targetPath, {
      state: subModuleData
    });
  };

  const handleQuickFill = () => {
    showCustomConfirmDialog(
      'Quick Fill Batch Details',
      `
        <div class="text-start">
          <div class="mb-3">
            <label class="form-label fw-semibold">Common Batch Number</label>
            <input type="text" id="commonBatch" class="form-control" placeholder="e.g., BATCH123">
          </div>
          <div class="mb-3">
            <label class="form-label fw-semibold">Common Expiry Date</label>
            <input type="month" id="commonExpiry" class="form-control">
          </div>
          <small class="text-muted"><i class="fas fa-info-circle"></i> This will apply to all items. You can edit individually later.</small>
        </div>
      `,
      'question',
      'Apply to All',
      'Cancel'
    ).then((result) => {
      if (!result.isConfirmed) return;

      const batch = (document.getElementById('commonBatch') as HTMLInputElement | null)?.value?.trim() || '';
      const expiry = (document.getElementById('commonExpiry') as HTMLInputElement | null)?.value || '';

      if (!batch) {
        showValidationError('Please enter batch number');
        return;
      }

      setPurchaseItems(prev => prev.map(item => ({
        ...item,
        batchNo: batch,
        expiryDate: expiry
      })));
      showSuccessToast('Batch details applied to all items', 'Applied!');
    });
  };

  const handleFieldChange = (index: number, field: keyof PurchaseItem, value: any) => {
    setPurchaseItems(prev => prev.map((item, i) => {
      if (i !== index) return item;

      // JSP validation: vatType=2 (Disc) requires a pre-tax discount value
      if (field === 'vatType' && value === 2) {
        const hasFirstDiscount = (item.discWithoutTaxPer || 0) > 0 || (item.discWithoutTaxAmtInput || 0) > 0;
        if (!hasFirstDiscount) {
          showValidationError('Enter a value in First Discount (% or Rs) before selecting Disc GST type');
          const updatedItem = { ...item, vatType: 0 };
          return calculateItemTotals(updatedItem);
        }
      }

      const updatedItem = { ...item, [field]: value };
      return calculateItemTotals(updatedItem);
    }));
  };

  const clamp = (value: number, min: number, max: number): number => {
    return Math.min(Math.max(value, min), max);
  };

  const normalizeApiExpiryToMonthValue = (rawValue: string): string => {
    if (!rawValue || rawValue.trim() === '') return '';

    const trimmedValue = rawValue.trim();

    if (/^\d{4}-\d{2}$/.test(trimmedValue)) {
      return trimmedValue;
    }

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmedValue)) {
      return trimmedValue.substring(0, 7);
    }

    if (/^\d{2}-\d{2}-\d{4}$/.test(trimmedValue)) {
      const [, month, year] = trimmedValue.split('-');
      return `${year}-${month}`;
    }

    const parsedDate = new Date(trimmedValue);
    if (!Number.isNaN(parsedDate.getTime())) {
      return parsedDate.toISOString().substring(0, 7);
    }

    return '';
  };

  const getEndOfMonthDateStr = (expiryMonth: string): string => {
    if (!expiryMonth || !/^\d{4}-\d{2}$/.test(expiryMonth)) {
      return '';
    }

    const [yearStr, monthStr] = expiryMonth.split('-');
    const year = Number(yearStr);
    const month = Number(monthStr);

    if (!year || month < 1 || month > 12) {
      return '';
    }

    const lastDay = new Date(year, month, 0).getDate();
    return `${yearStr}-${monthStr}-${String(lastDay).padStart(2, '0')}`;
  };

  const convertExpiryToPayload = (expiryMonth: string): string => {
    const endOfMonthDate = getEndOfMonthDateStr(expiryMonth);
    if (!endOfMonthDate) {
      return '';
    }

    return endOfMonthDate;
  };

  const getPreDiscountBase = (item: PurchaseItem): number => {
    return Math.max(0, (item.quantity || 0) * (item.unitPrice || 0));
  };

  const getPostDiscountBase = (item: PurchaseItem): number => {
    const calculated = calculateItemTotals(item);
    return Math.max(0, calculated.totalAmount + calculated.discAfterTax);
  };

  const handleDiscountPercentChange = (index: number, type: 'pre' | 'post', value: number) => {
    setPurchaseItems(prev => prev.map((item, i) => {
      if (i !== index) return item;

      if (type === 'pre') {
        const updatedItem = {
          ...item,
          preDiscountInputMode: 'percentage' as const,
          discWithoutTaxPer: clamp(value || 0, 0, 100)
        };
        return calculateItemTotals(updatedItem);
      }

      const updatedItem = {
        ...item,
        postDiscountInputMode: 'percentage' as const,
        discount: clamp(value || 0, 0, 100)
      };
      return calculateItemTotals(updatedItem);
    }));
  };

  const handleDiscountAmountChange = (index: number, type: 'pre' | 'post', value: number, showWarning: boolean = false) => {
    setPurchaseItems(prev => prev.map((item, i) => {
      if (i !== index) return item;

      if (type === 'pre') {
        const base = getPreDiscountBase(item);
        const rawAmount = value || 0;
        const cappedAmount = clamp(rawAmount, 0, base);

        if (showWarning && rawAmount > base) {
          showValidationError(`First discount amount cannot exceed ₹${base.toFixed(2)}. Value is capped.`);
        }

        const preDiscPercent = base > 0 ? (cappedAmount / base) * 100 : 0;
        const updatedItem = {
          ...item,
          preDiscountInputMode: 'amount' as const,
          discWithoutTaxAmtInput: parseFloat(cappedAmount.toFixed(2)),
          discWithoutTaxPer: parseFloat(preDiscPercent.toFixed(2))
        };
        return calculateItemTotals(updatedItem);
      }

      const base = getPostDiscountBase(item);
      const rawAmount = value || 0;
      const cappedAmount = clamp(rawAmount, 0, base);

      if (showWarning && rawAmount > base) {
        showValidationError(`Second discount amount cannot exceed ₹${base.toFixed(2)}. Value is capped.`);
      }

      const postDiscPercent = base > 0 ? (cappedAmount / base) * 100 : 0;
      const updatedItem = {
        ...item,
        postDiscountInputMode: 'amount' as const,
        discAfterTaxAmtInput: parseFloat(cappedAmount.toFixed(2)),
        discount: parseFloat(postDiscPercent.toFixed(2))
      };
      return calculateItemTotals(updatedItem);
    }));
  };

  const handleAddBatch = (index: number) => {
    const sourceItem = purchaseItems[index];
    const newBatchItem: PurchaseItem = {
      id: Date.now(), // Unique ID for new batch
      invSlNo: sourceItem.invSlNo,
      // Copy order-related fields from source item (required for validation)
      preGoodsId: 0,
      orderId: sourceItem.orderId || 0,
      detId: sourceItem.detId || 0,
      prodsId: sourceItem.prodsId || 0,
      batchId: 0, // New batch will have different batch ID
      itemCode: sourceItem.itemCode,
      itemName: sourceItem.itemName,
      genericName: sourceItem.genericName,
      manufacturer: sourceItem.manufacturer,
      // New batch details - empty/default values
      batchNo: '',
      expiryDate: '',
      quantity: 0,
      pack: 0,
      freeQuantity: 0,
      freePack: 0,
      taxOnFree: 0,
      unitPrice: 0,
      costPerUnit: 0,
      costPerMRP: 0,
      discount: 0,
      discAfterTax: 0,
      discWithoutTaxPer: 0,
      discWithoutTaxAmtInput: 0,
      discAfterTaxAmtInput: 0,
      preDiscountInputMode: 'percentage' as const,
      postDiscountInputMode: 'percentage' as const,
      preDiscountAmount: 0,
      discOnMrp: 0,
      taxPercentage: 12,
      vatType: 0,
      taxAmount: 0,
      totalAmount: 0,
      packSize: '1',
      unit: sourceItem.unit,
      discountType: 'percentage' as const,
      hsnCode: sourceItem.hsnCode || ''
    };
    
    // Insert new batch after the current item
    setPurchaseItems(prev => {
      const newItems = [...prev];
      newItems.splice(index + 1, 0, newBatchItem);
      return newItems;
    });
    
    showSuccessToast('New batch added for same item');
  };

  const handleDeleteItem = async (index: number) => {
    const result = await showConfirmDialog('Are you sure you want to remove this item from the purchase entry?', 'Remove Item?', 'Yes, Remove', 'Cancel');
    if (result.isConfirmed) {
      setPurchaseItems(prev => prev.filter((_, i) => i !== index));
      showSuccessToast('Item removed successfully');
    }
  };

  const calculateItemTotals = (item: PurchaseItem): PurchaseItem => {
    const packSizeNum = parseFloat(item.packSize) || 1;
    const qty = item.quantity;
    const cost = item.unitPrice;
    const mrp = item.costPerMRP;
    const taxPer = item.taxPercentage;

    // Taxable free quantity (JSP: taxable_free_qty)
    const taxableFreeQty = (item.freeQuantity > 0 && item.taxOnFree === 1) ? item.freeQuantity : 0;

    // MRP-based VAT — always computed (JSP: mrp_vat_amt)
    const tempAmt = ((qty + taxableFreeQty) * mrp) / (1 + taxPer / 100);
    const mrpVatAmt = (taxPer / 100) * tempAmt;

    const preDiscBase = qty * cost;

    // Pre-tax discount amount (JSP: disc_without_tax_value)
    let preDiscAmount = 0;
    let preDiscPercent = clamp(item.discWithoutTaxPer || 0, 0, 100);

    if ((item.preDiscountInputMode || 'percentage') === 'amount') {
      const rawPreAmount = item.discWithoutTaxAmtInput ?? item.preDiscountAmount ?? 0;
      const cappedPreAmount = clamp(rawPreAmount, 0, preDiscBase);
      preDiscAmount = cappedPreAmount;
      preDiscPercent = preDiscBase > 0 ? (cappedPreAmount / preDiscBase) * 100 : 0;
    } else {
      preDiscAmount = (preDiscPercent / 100) * preDiscBase;
    }

    // Cost total after pre-tax discount (JSP: cost_tot)
    const costTot = (qty * cost) - preDiscAmount;

    // GST/VAT calculation (JSP: calFinalAmount logic)
    let vatAmt = 0;
    if (item.vatType === 0) {
      // Cost-based: tax on (qty + taxable_free_qty) * cost (JSP calFinalAmount)
      const subTot = (qty + taxableFreeQty) * cost;
      vatAmt = (taxPer / 100) * subTot;
    } else if (item.vatType === 1) {
      // MRP-based
      vatAmt = mrpVatAmt;
    } else if (item.vatType === 2) {
      // Disc-based: tax on cost_tot (after pre-tax discount)
      vatAmt = (taxPer / 100) * costTot;
    }

    // Post-tax discount should be applied on amount after GST.
    const amountAfterTax = Math.max(0, costTot + vatAmt);
    let postDiscAmount = 0;
    let postDiscPercent = clamp(item.discount || 0, 0, 100);

    if ((item.postDiscountInputMode || 'percentage') === 'amount') {
      const rawPostAmount = item.discAfterTaxAmtInput ?? item.discAfterTax ?? 0;
      const cappedPostAmount = clamp(rawPostAmount, 0, amountAfterTax);
      postDiscAmount = cappedPostAmount;
      postDiscPercent = amountAfterTax > 0 ? (cappedPostAmount / amountAfterTax) * 100 : 0;
    } else {
      postDiscAmount = (postDiscPercent / 100) * amountAfterTax;
    }

    // Net total after pre-tax discount, GST, and post-tax discount.
    const totalAmount = Math.max(0, amountAfterTax - postDiscAmount);

    // Unit C.P = costTot / (qty * packSizeNum) (JSP logic)
    const unitCPDenominator = qty * packSizeNum;
    const costPerUnit = unitCPDenominator > 0 ? costTot / unitCPDenominator : 0;

    return {
      ...item,
      discWithoutTaxPer: parseFloat(preDiscPercent.toFixed(2)),
      discWithoutTaxAmtInput: parseFloat(preDiscAmount.toFixed(2)),
      preDiscountAmount: parseFloat(preDiscAmount.toFixed(2)),
      discount: parseFloat(postDiscPercent.toFixed(2)),
      discAfterTaxAmtInput: parseFloat(postDiscAmount.toFixed(2)),
      discAfterTax: parseFloat(postDiscAmount.toFixed(2)),
      costPerUnit: parseFloat(costPerUnit.toFixed(4)),
      taxAmount: parseFloat(vatAmt.toFixed(2)),
      totalAmount: parseFloat(totalAmount.toFixed(2))
    };
  };

  const calculateTotals = () => {
    // Gross amount before any discounts
    const subtotal = purchaseItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
    // Total discount = pre-tax discount + post-tax discount per item
    const totalDiscount = purchaseItems.reduce((sum, item) => sum + (item.preDiscountAmount || 0) + (item.discAfterTax || 0), 0);
    const totalTax = purchaseItems.reduce((sum, item) => sum + item.taxAmount, 0);
    const grandTotal = purchaseItems.reduce((sum, item) => sum + item.totalAmount, 0);
    const finalAmount = Math.round(grandTotal + surCharge - extraDiscount);

    return { subtotal, totalDiscount, totalTax, grandTotal, finalAmount };
  };

  const getBatchCount = (itemCode: string): number => {
    return purchaseItems.filter(item => item.itemCode === itemCode).length;
  };

  const handleSubmitEntry = async () => {
    if (isSaving || isConfirming) return;
    setIsSaving(true);

    if (!selectedVendor) {
      setIsSaving(false);
      showValidationError('Please select a vendor');
      return;
    }

    // Invoice number is optional for Save operation

    if (purchaseItems.length === 0) {
      setIsSaving(false);
      showValidationError('Please add at least one item');
      return;
    }

    // Validate that all items have valid orderId
    const itemsWithoutOrderId = purchaseItems.filter(item => !item.orderId || item.orderId === 0);
    if (itemsWithoutOrderId.length > 0) {
      setIsSaving(false);
      showCustomAlert(`${itemsWithoutOrderId.length} item(s) are missing valid Order ID.<br><small class="text-muted">Please ensure items are loaded from an approved purchase order.</small>`, 'Validation Error', 'error');
      console.error('Items without orderId:', itemsWithoutOrderId);
      return;
    }

    // Validate required fields for all items
    const today = new Date().toISOString().split('T')[0];
    const invalidItemsForSave: string[] = [];
    purchaseItems.forEach((item, index) => {
      const errors: string[] = [];
      
      if (!item.batchNo || item.batchNo.trim() === '') {
        errors.push('Batch No is required');
      }
      if (!item.expiryDate || item.expiryDate.trim() === '') {
        errors.push('Expiry Date is required');
      } else {
        const expiryEndDate = getEndOfMonthDateStr(item.expiryDate);
        if (!expiryEndDate) {
          errors.push('Expiry Date is invalid');
        } else if (expiryEndDate < today) {
          errors.push('Expiry Date cannot be before current date');
        }
      }
      if (!item.quantity || item.quantity <= 0) {
        errors.push('Quantity must be greater than 0');
      }
      if (!item.packSize || item.packSize.trim() === '' || parseFloat(item.packSize) <= 0) {
        errors.push('Pack is required');
      }
      if (!item.unitPrice || item.unitPrice <= 0) {
        errors.push('C.P (Cost Price) must be greater than 0');
      }
      if (!item.costPerMRP || item.costPerMRP <= 0) {
        errors.push('M.R.P must be greater than 0');
      }

      if (errors.length > 0) {
        invalidItemsForSave.push(`<strong>Item ${index + 1} (${item.itemName}):</strong><br>&nbsp;&nbsp;&nbsp;- ${errors.join('<br>&nbsp;&nbsp;&nbsp;- ')}`);
      }
    });

    if (invalidItemsForSave.length > 0) {
      setIsSaving(false);
      showCustomAlert(`<div class="text-start"><p class="mb-2">Please fix the following validation errors:</p>${invalidItemsForSave.join('<br><br>')}</div>`, 'Validation Error', 'error');
      return;
    }

    // Get storeId from sessionStorage
    const selectedStoreData = sessionStorage.getItem('selectedStore');
    if (!selectedStoreData) {
      setIsSaving(false);
      showErrorToast('Store information not found. Please select a store.');
      navigate(routerPathNames.centralStores.base);
      return;
    }
    
    const storeData = JSON.parse(selectedStoreData);
    const storeId = storeData.masterId;
    
    if (!storeId || storeId === 0) {
      setIsSaving(false);
      showErrorToast('Invalid store ID. Please select a valid store.');
      navigate(routerPathNames.centralStores.base);
      return;
    }

    const totalsForConfirm = calculateTotals();
    const result = await showConfirmDialog(
      `Vendor: ${selectedVendor.name} | Invoice: ${invoiceNo || 'Not provided'} | Items: ${purchaseItems.length} | Final Amount: ₹${totalsForConfirm.finalAmount.toFixed(2)}`,
      'Save Purchase Entry?',
      'Yes, Save',
      'Cancel'
    );

    if (result.isConfirmed) {
      try {
        setLoading(true);
        
        // Transform purchaseItems to API schema format
        const purchaseEntryData = purchaseItems.map((item, index) => ({
          preGoodsId: item.preGoodsId || 0,
          orderId: item.orderId || 0,
          detId: item.detId || 0,
          prodsId: item.prodsId || 0,
          qty: item.quantity,
          pack: (parseFloat(item.packSize) || 1),
          unit: item.quantity * (parseFloat(item.packSize) || 1),
          free: item.freeQuantity,
          freePack: (parseFloat(item.packSize) || 1),
          taxOnFree: item.taxOnFree,
          batchId: item.batchId || 0,
          batchNo: item.batchNo || '',
          expDate: convertExpiryToPayload(item.expiryDate),
          cost: item.unitPrice,
          mrp: item.costPerMRP,
          vatPer: item.taxPercentage,
          vatType: item.vatType,
          discPer: item.discount,
          discWithoutTaxPer: item.discWithoutTaxPer,
          grnId: 0, // Will be generated by backend
          hsnCode: item.hsnCode || '',
          discOnMrp: item.discOnMrp,
          invSlNo: index + 1
        }));

        // Call API to save purchase entry
        const response = await centralStoresApi.savePurchaseEntry(storeId, purchaseEntryData);
        
        setLoading(false);
        
        showSuccessToast(response.message || 'Purchase entry saved successfully');
        navigateToSelectApprovedPO();
      } catch (error) {
        setLoading(false);
        console.error('Error saving purchase entry:', error);
        handleError(dispatch, error);
        showErrorToast('Failed to save purchase entry. Please try again.');
        setIsSaving(false);
      }
    } else {
      setIsSaving(false);
    }
  };

  const handleConfirmEntry = async () => {
    if (isSaving || isConfirming) return;
    setIsConfirming(true);

    // Check if any item has isSaved=0
    const unsavedItems = purchaseItems.filter(item => item.isSaved === 0);
    if (unsavedItems.length > 0) {
      setIsConfirming(false);
      showWarningModal(`${unsavedItems.length} item(s) have not been saved yet. Please save the purchase entry first before confirming.`, 'Items Not Saved');
      return;
    }

    if (!selectedVendor) {
      setIsConfirming(false);
      showValidationError('Please select a vendor');
      return;
    }

    // Invoice number IS REQUIRED for Confirm operation
    if (!invoiceNo || !invoiceDate) {
      setIsConfirming(false);
      showValidationError('Invoice number and date are required for confirmation');
      return;
    }

    if (purchaseItems.length === 0) {
      setIsConfirming(false);
      showValidationError('Please add at least one item');
      return;
    }

    // Validate that all items have valid orderId
    const itemsWithoutOrderId = purchaseItems.filter(item => !item.orderId || item.orderId === 0);
    if (itemsWithoutOrderId.length > 0) {
      setIsConfirming(false);
      showCustomAlert(`${itemsWithoutOrderId.length} item(s) are missing valid Order ID.<br><small class="text-muted">Please ensure items are loaded from an approved purchase order.</small>`, 'Validation Error', 'error');
      return;
    }

    // Validate required fields for all items
    const today = new Date().toISOString().split('T')[0];
    const invalidItemsForConfirm: string[] = [];
    purchaseItems.forEach((item, index) => {
      const errors: string[] = [];
      
      if (!item.batchNo || item.batchNo.trim() === '') {
        errors.push('Batch No is required');
      }
      if (!item.expiryDate || item.expiryDate.trim() === '') {
        errors.push('Expiry Date is required');
      } else {
        const expiryEndDate = getEndOfMonthDateStr(item.expiryDate);
        if (!expiryEndDate) {
          errors.push('Expiry Date is invalid');
        } else if (expiryEndDate < today) {
          errors.push('Expiry Date cannot be before current date');
        }
      }
      if (!item.quantity || item.quantity <= 0) {
        errors.push('Quantity must be greater than 0');
      }
      if (!item.packSize || item.packSize.trim() === '' || parseFloat(item.packSize) <= 0) {
        errors.push('Pack is required');
      }
      if (!item.unitPrice || item.unitPrice <= 0) {
        errors.push('C.P (Cost Price) must be greater than 0');
      }
      if (!item.costPerMRP || item.costPerMRP <= 0) {
        errors.push('M.R.P must be greater than 0');
      }

      if (errors.length > 0) {
        invalidItemsForConfirm.push(`<strong>Item ${index + 1} (${item.itemName}):</strong><br>&nbsp;&nbsp;&nbsp;- ${errors.join('<br>&nbsp;&nbsp;&nbsp;- ')}`);
      }
    });

    if (invalidItemsForConfirm.length > 0) {
      setIsConfirming(false);
      showCustomAlert(`<div class="text-start"><p class="mb-2">Please fix the following validation errors:</p>${invalidItemsForConfirm.join('<br><br>')}</div>`, 'Validation Error', 'error');
      return;
    }

    // Get storeId from sessionStorage
    const selectedStoreData = sessionStorage.getItem('selectedStore');
    if (!selectedStoreData) {
      setIsConfirming(false);
      showErrorToast('Store information not found. Please select a store.');
      navigate(routerPathNames.centralStores.base);
      return;
    }
    
    const storeData = JSON.parse(selectedStoreData);
    const storeId = storeData.masterId;
    
    if (!storeId || storeId === 0) {
      setIsConfirming(false);
      showErrorToast('Invalid store ID. Please select a valid store.');
      navigate(routerPathNames.centralStores.base);
      return;
    }

    const totalsForConfirm = calculateTotals();
    const result = await showConfirmDialog(
      `Vendor: ${selectedVendor.name} | Invoice: ${invoiceNo} | Date: ${invoiceDate} | Items: ${purchaseItems.length} | Final Amount: ₹${totalsForConfirm.finalAmount.toFixed(2)}. This action will finalize the purchase entry.`,
      'Confirm Purchase Entry?',
      'Yes, Confirm',
      'Cancel'
    );

    if (result.isConfirmed) {
      try {
        setLoading(true);
        
        const totals = calculateTotals();
        
        // Transform purchaseItems to ConfirmPurchaseEntryDetail format
        const confirmEntryDetails = purchaseItems.map(item => {
          const preDiscountAmount = item.preDiscountAmount || 0;
          const postDiscountAmount = item.discAfterTax || 0;
          const taxableFreeQtyDisplay = (item.freeQuantity > 0 && item.taxOnFree === 1) ? item.freeQuantity : 0;
          const tempAmtDisplay = ((item.quantity + taxableFreeQtyDisplay) * item.costPerMRP) / (1 + item.taxPercentage / 100);
          const vatMrpDisplay = (item.taxPercentage / 100) * tempAmtDisplay;
          const unitMRP = (parseFloat(item.packSize) || 1) > 0 ? item.costPerMRP / (parseFloat(item.packSize) || 1) : 0;

          return ({
          preGoodsId: item.preGoodsId || 0,
          prodsId: item.prodsId || 0,
          batchNo: item.batchNo,
          expiryDate: convertExpiryToPayload(item.expiryDate),
          qty: item.quantity,
          pack: (parseFloat(item.packSize) || 1) ,
          freeQty: item.freeQuantity || 0,
          freePack: (parseFloat(item.packSize) || 1),
          taxOnFree: item.taxOnFree || 0,
          cost: item.unitPrice || 0,
          mrp: item.costPerMRP || 0,
          unitMrp: parseFloat(unitMRP.toFixed(2)) || 0,
          salesPrice: (() => {
            const unitMRP = (parseFloat(item.packSize) || 1) > 0 ? item.costPerMRP / (parseFloat(item.packSize) || 1) : 0;
            if (item.discountType === 'rupees') return Math.max(0, unitMRP - (item.discOnMrp || 0));
            return Math.max(0, unitMRP - (unitMRP * (item.discOnMrp || 0) / 100));
          })(),
          unitPrice: parseFloat(item.costPerUnit.toFixed(2)) || 0,
          disc: parseFloat(postDiscountAmount.toFixed(2)),
          batchDisc: item.discOnMrp,
          discPer: item.discount || 0,
          discWithoutTaxPer: item.discWithoutTaxPer || 0,
          discWithoutTaxAmt: preDiscountAmount,
          sgstPer: item.taxPercentage / 2 || 0, // Split tax for SGST
          cgstPer: item.taxPercentage / 2 || 0, // Split tax for CGST
          igstPer: 0, // Not used in current implementation
          sgstAmt: item.taxAmount / 2 || 0, // Split tax amount for SGST
          cgstAmt: item.taxAmount / 2 || 0, // Split tax amount for CGST
          igstAmt: 0, // Not used in current implementation
          tax: item.taxPercentage || 0,
          taxAmt: item.taxAmount || 0,
          taxType: item.vatType || 0,
          mrpVatAmt: parseFloat(vatMrpDisplay.toFixed(2)),
          totalAmt: parseFloat(((item.quantity * item.unitPrice) - preDiscountAmount).toFixed(2)) || 0,
          netAmt: item.totalAmount || 0,
          poDetId: item.detId || 0,
          hsnCode: item.hsnCode || ''
          });
        });

        const confirmData = {
          orderId: purchaseItems[0]?.orderId || 0,
          confirmingUserId: loginData.id,
          invoiceNo: invoiceNo,
          invoiceDate: invoiceDate,
          dealId: Number(selectedVendor.id) || 0,
          storeId: storeId,
          remark: remarks,
          total: totals.grandTotal,
          net: totals.finalAmount,
          extraDiscount: extraDiscount,
          extraCharge: surCharge,
          details: confirmEntryDetails
        };

        const response = await centralStoresApi.confirmPurchaseEntry(confirmData);
        
        setLoading(false);
        const successMessage = response?.message || 'Purchase entry confirmed successfully';
        const responseId = response?.displayId ?? 'N/A';
        const modalResult = await showSuccessModal(
          `${successMessage}<div class="mt-2">Entry ID: <mark><strong>${responseId}</strong></mark></div>`,
          'Purchase Entry Confirmed',
          'OK'
        );

        if (modalResult.isConfirmed) {
          navigateToSelectApprovedPO();
        } else {
          setIsConfirming(false);
        }
      } catch (error: any) {
        setLoading(false);
        showErrorToast(error.response?.data?.error || 'Failed to confirm purchase entry');
        setIsConfirming(false);
      }
    } else {
      setIsConfirming(false);
    }
  };

  const handleReset = async () => {
    const result = await showConfirmDialog(
      'Added batches will be removed and all item fields will be restored to their original values.',
      'Reset Items?',
      'Yes, Reset',
      'Cancel'
    );
    if (result.isConfirmed) {
      // Restore original items (removes user-added batches and resets field values)
      setPurchaseItems([...originalPurchaseItems.current]);
      setRemarks('');
      setExtraDiscount(0);
      setSurCharge(0);
      showSuccessToast('Items have been reset to original values');
    }
  };

  const totals = calculateTotals();

  return (
    <div className="pe-screen d-flex flex-column h-100">
      <PageHeader
        icon={faFileInvoice}
        title="Purchase Entry"
        subtitle="Enter invoice details and item batch information for selected purchase order"
        badges={[
          { label: 'Items', value: purchaseItems.length },
          { label: 'Final Amount', value: `₹${totals.finalAmount.toFixed(2)}` }
        ]}
      />
        <div className="pe-content px-3 pb-3 h-100">
          <div className="card flex-grow-1 shadow-sm d-flex flex-column h-100 overflow-hidden pe-main-card">
            <div className="card-header pe-main-header">
              <div className="pe-header-row">
                {/* Back */}
                <div className="pe-header-col-auto">
                  <button
                    className="theme-outline-btn-primary btn-sm"
                    onClick={handleBackToPrepare}
                    title="Back to Select Approved Purchase Order"
                  >
                    <i className="fas fa-arrow-left me-2"></i>
                    Back
                  </button>
                </div>

                {/* Vendor */}
                <div className="pe-header-col">
                  <Form.Label className="fw-semibold mb-1 d-block" style={{ fontSize: 'var(--font-size-sm)' }}>
                    <i className="fas fa-building me-1" style={{ color: 'var(--page-secondary-color)' }}></i>
                    Vendor
                  </Form.Label>
                  {selectedVendor ? (
                    <div className="d-flex align-items-center gap-2" style={{ minHeight: '32px' }}>
                      <span
                        className="fw-semibold text-truncate"
                        style={{ color: 'var(--page-secondary-color)', fontSize: 'var(--font-size-md)', cursor: 'pointer' }}
                        title={selectedVendor.name}
                        onClick={() => setShowVendorDetails(true)}
                      >
                        {selectedVendor.name}
                      </span>
                      <Badge className="theme-badge-secondary px-2 py-1" style={{ fontSize: 'var(--font-size-xs)', whiteSpace: 'nowrap' }}>
                        From PO
                      </Badge>
                    </div>
                  ) : (
                    <div className="alert alert-warning mb-0 py-1 px-2" style={{ minHeight: '32px', display: 'flex', alignItems: 'center' }}>
                      <small><i className="fas fa-exclamation-triangle me-1"></i>No vendor</small>
                    </div>
                  )}
                </div>

                {/* Invoice Number */}
                <div className="pe-header-col">
                  <Form.Label className="fw-semibold mb-1 d-block" style={{ fontSize: 'var(--font-size-sm)' }}>
                    <i className="fas fa-receipt me-1 text-danger"></i>
                    Invoice Number <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="Enter invoice number"
                    value={invoiceNo}
                    onChange={(e) => setInvoiceNo(e.target.value)}
                    size="sm"
                  />
                </div>

                {/* Invoice Date */}
                <div className="pe-header-col">
                  <Form.Label className="fw-semibold mb-1 d-block" style={{ fontSize: 'var(--font-size-sm)' }}>
                    <i className="fas fa-calendar me-1 text-danger"></i>
                    Invoice Date <span className="text-danger">*</span>
                  </Form.Label>
                  <Form.Control
                    type="date"
                    value={invoiceDate}
                    onChange={(e) => setInvoiceDate(e.target.value)}
                    size="sm"
                  />
                </div>

                {/* PO Number */}
                <div className="pe-header-col">
                  <Form.Label className="fw-semibold mb-1 d-block" style={{ fontSize: 'var(--font-size-sm)' }}>
                    <i className="fas fa-clipboard-list me-1 text-primary"></i>
                    PO Number
                  </Form.Label>
                  <Form.Control
                    type="text"
                    placeholder="PO number"
                    value={poNumber}
                    onChange={(e) => setPoNumber(e.target.value)}
                    readOnly
                    size="sm"
                  />
                </div>

                {/* Guidelines */}
                <div className="pe-header-col-auto d-flex align-items-end">
                  <OverlayTrigger
                    trigger="click"
                    placement="left"
                    rootClose
                    overlay={
                      <Popover id="purchase-guidelines-popover">
                        <Popover.Header as="h6" className="mb-0">Important Guidelines</Popover.Header>
                        <Popover.Body>
                          <ul className="mb-0 ps-3" style={{ fontSize: 'var(--font-size-sm)' }}>
                            <li className="mb-1">Ensure invoice details match the physical invoice</li>
                            <li className="mb-1">Verify batch numbers and expiry dates carefully</li>
                            <li className="mb-1">Check for damaged or expired items before entry</li>
                            <li className="mb-1">Record GST details accurately for compliance</li>
                            <li>Record free quantity separately</li>
                          </ul>
                        </Popover.Body>
                      </Popover>
                    }
                  >
                    <span
                      role="button"
                      tabIndex={0}
                      title="Important Guidelines"
                      className="d-inline-flex align-items-center justify-content-center theme-btn-primary"
                      style={{ width: '32px', height: '32px', borderRadius: '50%', cursor: 'pointer', flexShrink: 0 }}
                    >
                      <FontAwesomeIcon icon={faInfoCircle} />
                    </span>
                  </OverlayTrigger>
                </div>
              </div>
            </div>

            <div className="card-body p-0 d-flex flex-column pe-main-body">
              <div className="d-flex justify-content-between align-items-center px-3 py-2 border-bottom" style={{ backgroundColor: 'var(--page-header-bg)', color: 'var(--page-header-text)' }}>
                <h6 className="mb-0">
                  <i className="fas fa-list me-2"></i>
                  Purchase Items from Requisition
                </h6>
                <Button
                  size="sm"
                  onClick={handleQuickFill}
                  className="theme-outline-btn-primary"
                  disabled={purchaseItems.length === 0}
                  hidden
                >
                  <i className="fas fa-magic me-2"></i>
                  Quick Fill Batch Details
                </Button>
              </div>

              <div className="pe-table-scroll">
                {purchaseItems.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="fas fa-inbox fa-4x text-muted mb-3"></i>
                    <h5 className="text-muted">No Items Loaded</h5>
                    <p className="text-muted small">Please select items in purchase requisition first</p>
                    <Button 
                      className="theme-outline-btn-primary"
                      size="sm"
                      onClick={handleBackToPrepare}
                      style={{ marginTop: '0.5rem' }}
                    >
                      <i className="fas fa-arrow-left me-2"></i>
                      Go to Purchase Requisition
                    </Button>
                  </div>
                ) : (
                  <>
                  <div className="d-none d-lg-block">
                  <Table hover className="mb-0" style={{ minWidth: '3000px' }}>
                    <thead>
                      <tr>
                        <th className="py-3" style={{ width: '50px', position: 'sticky', top: 0, left: 0, backgroundColor: 'var(--table-header-bg)', color: 'var(--table-header-text)', zIndex: 3 }}>S.No</th>
                        <th className="py-3" style={{ minWidth: '200px', position: 'sticky', top: 0, left: '50px', backgroundColor: 'var(--table-header-bg)', color: 'var(--table-header-text)', zIndex: 3 }}>Medicine Name</th>
                        <th className="py-3" style={{ minWidth: '120px', position: 'sticky', top: 0, backgroundColor: 'var(--table-header-bg)', color: 'var(--table-header-text)', zIndex: 2 }}>HSN Code</th>
                        <th className="py-3" style={{ minWidth: '130px', position: 'sticky', top: 0, backgroundColor: 'var(--table-header-bg)', color: 'var(--table-header-text)', zIndex: 2 }}>Batch No <span className="text-danger">*</span></th>
                        <th className="py-3" style={{ minWidth: '120px', position: 'sticky', top: 0, backgroundColor: 'var(--table-header-bg)', color: 'var(--table-header-text)', zIndex: 2 }}>Exp. Date</th>
                        <th className="py-3" style={{ minWidth: '80px', position: 'sticky', top: 0, backgroundColor: 'var(--table-header-bg)', color: 'var(--table-header-text)', zIndex: 2 }}>Strips {/*<Badge className="theme-badge-secondary" style={{ fontSize: 'var(--font-size-xs)' }}>PO</Badge>*/}</th>
                        <th className="py-3" style={{ minWidth: '100px', position: 'sticky', top: 0, backgroundColor: 'var(--table-header-bg)', color: 'var(--table-header-text)', zIndex: 2 }}>Unit/Strip</th>
                        <th className="py-3" style={{ minWidth: '100px', position: 'sticky', top: 0, backgroundColor: 'var(--table-header-bg)', color: 'var(--table-header-text)', zIndex: 2 }}>Units</th>
                        <th className="py-3" style={{ minWidth: '80px', position: 'sticky', top: 0, backgroundColor: 'var(--table-header-bg)', color: 'var(--table-header-text)', zIndex: 2 }}>Free Strips</th>
                        <th className="py-3" style={{ minWidth: '100px', position: 'sticky', top: 0, backgroundColor: 'var(--table-header-bg)', color: 'var(--table-header-text)', zIndex: 2 }} hidden>Free Unit/Strips</th>
                        <th className="py-3" style={{ minWidth: '90px', position: 'sticky', top: 0, backgroundColor: 'var(--table-header-bg)', color: 'var(--table-header-text)', zIndex: 2 }}>Free Tax</th>
                        <th className="py-3" style={{ minWidth: '100px', position: 'sticky', top: 0, backgroundColor: 'var(--table-header-bg)', color: 'var(--table-header-text)', zIndex: 2 }}>C.P (₹) <span className="text-danger">*</span></th>
                        <th className="py-3" style={{ minWidth: '100px', position: 'sticky', top: 0, backgroundColor: 'var(--table-header-bg)', color: 'var(--table-header-text)', zIndex: 2 }}>M.R.P (₹)</th>
                        <th className="py-3" style={{ minWidth: '80px', position: 'sticky', top: 0, backgroundColor: 'var(--table-header-bg)', color: 'var(--table-header-text)', zIndex: 2 }}>Disc %</th>
                        <th className="py-3" style={{ minWidth: '100px', position: 'sticky', top: 0, backgroundColor: 'var(--table-header-bg)', color: 'var(--table-header-text)', zIndex: 2 }}>Discount (₹)</th>
                        <th className="py-3" style={{ minWidth: '110px', position: 'sticky', top: 0, backgroundColor: 'var(--table-header-bg)', color: 'var(--table-header-text)', zIndex: 2 }}>Subtotal (₹)</th>
                        <th className="py-3" style={{ minWidth: '160px', position: 'sticky', top: 0, backgroundColor: 'var(--table-header-bg)', color: 'var(--table-header-text)', zIndex: 2 }}>GST % / Type</th>
                        <th className="py-3" style={{ minWidth: '100px', position: 'sticky', top: 0, backgroundColor: 'var(--table-header-bg)', color: 'var(--table-header-text)', zIndex: 2 }}>GST Amt (₹)</th>
                        <th className="py-3" style={{ minWidth: '110px', position: 'sticky', top: 0, backgroundColor: 'var(--table-header-bg)', color: 'var(--table-header-text)', zIndex: 2 }}>GST on M.R.P (₹)</th>
                        <th className="py-3" style={{ minWidth: '80px', position: 'sticky', top: 0, backgroundColor: 'var(--table-header-bg)', color: 'var(--table-header-text)', zIndex: 2 }}>Disc %</th>
                        <th className="py-3" style={{ minWidth: '100px', position: 'sticky', top: 0, backgroundColor: 'var(--table-header-bg)', color: 'var(--table-header-text)', zIndex: 2 }}>Discount (₹)</th>
                        <th className="py-3" style={{ minWidth: '110px', position: 'sticky', top: 0, backgroundColor: 'var(--table-header-bg)', color: 'var(--table-header-text)', zIndex: 2 }}>Total (₹)</th>
                        <th className="py-3" style={{ minWidth: '120px', position: 'sticky', top: 0, backgroundColor: 'var(--table-header-bg)', color: 'var(--table-header-text)', zIndex: 2 }}>Batch Discount %</th>
                        <th className="py-3" style={{ minWidth: '100px', position: 'sticky', top: 0, backgroundColor: 'var(--table-header-bg)', color: 'var(--table-header-text)', zIndex: 2 }}>Unit C.P (₹)</th>
                        <th className="py-3" style={{ minWidth: '110px', position: 'sticky', top: 0, backgroundColor: 'var(--table-header-bg)', color: 'var(--table-header-text)', zIndex: 2 }}>Unit M.R.P (₹)</th>
                        <th className="py-3 text-center" style={{ minWidth: '160px', position: 'sticky', top: 0, backgroundColor: 'var(--table-header-bg)', color: 'var(--table-header-text)', zIndex: 2 }}>Batch Add</th>
                      </tr>
                    </thead>
                    <tbody>
                      {purchaseItems.map((item, index) => {
                        const preDiscountAmount = item.preDiscountAmount || 0;
                        const costTotDisplay = (item.quantity * item.unitPrice) - preDiscountAmount;
                        const postDiscountAmount = item.discAfterTax || 0;
                        const taxableFreeQtyDisplay = (item.freeQuantity > 0 && item.taxOnFree === 1) ? item.freeQuantity : 0;
                        const tempAmtDisplay = ((item.quantity + taxableFreeQtyDisplay) * item.costPerMRP) / (1 + item.taxPercentage / 100);
                        const vatMrpDisplay = (item.taxPercentage / 100) * tempAmtDisplay;
                        const unitMRP = (parseFloat(item.packSize) || 1) > 0 ? item.costPerMRP / (parseFloat(item.packSize) || 1) : 0;
                        
                        return (
                        <tr key={item.id}>
                          <td className="align-middle" style={{ position: 'sticky', left: 0, zIndex: 1, backgroundColor: 'white' }}>
                            {index + 1}
                          </td>
                          
                          <td className="align-middle" style={{ position: 'sticky', left: '50px', zIndex: 1, backgroundColor: 'white' }}>
                            <div className="fw-semibold">{item.itemName}</div>
                            {getBatchCount(item.itemCode) > 1 && (
                              <div className="mt-1">
                                <Badge className="theme-badge-primary text-dark">
                                  <i className="fas fa-layer-group me-1"></i>
                                  Batch {purchaseItems.filter((i, idx) => i.itemCode === item.itemCode && idx <= index).length} of {getBatchCount(item.itemCode)}
                                </Badge>
                              </div>
                            )}
                          </td>
                          
                          {/* HSN Code */}
                          <td className="align-middle">
                            <Form.Control
                              size="sm"
                              type="text"
                              placeholder="HSN Code"
                              value={item.hsnCode}
                              onChange={(e) => handleFieldChange(index, 'hsnCode', e.target.value)}
                            />
                          </td>
                          
                          {/* Batch No */}
                          <td className="align-middle">
                            <Form.Control
                              size="sm"
                              type="text"
                              placeholder="Enter batch"
                              value={item.batchNo}
                              onChange={(e) => handleFieldChange(index, 'batchNo', e.target.value)}
                              onBlur={(e) => handleBatchNoBlur(index, e.target.value)}
                              required
                            />
                          </td>
                          
                          {/* Exp. Date */}
                          <td className="align-middle">
                            <Form.Control
                              size="sm"
                              type="month"
                              value={item.expiryDate}
                              onChange={(e) => handleFieldChange(index, 'expiryDate', e.target.value)}
                            />
                          </td>
                          
                          {/* Qty - Editable */}
                          <td className="align-middle">
                            <Form.Control
                              size="sm"
                              type="number"
                              min="0"
                              step="1"
                              placeholder="0"
                              value={formatNumberDisplay(item.quantity)}
                              onChange={(e) => handleFieldChange(index, 'quantity', handleNumberChange(e.target.value))}
                              onBlur={(e) => handleFieldChange(index, 'quantity', handleNumberBlur(e.target.value))}
                              className="text-center fw-semibold"
                            />
                          </td>
                          
                          {/* Pack */}
                          <td className="align-middle">
                            <Form.Control
                              size="sm"
                              type="text"
                              placeholder="1"
                              value={item.packSize || '1'}
                              onChange={(e) => handleFieldChange(index, 'packSize', e.target.value)}
                            />
                          </td>
                          
                          {/* Units - Calculated (Qty × Pack) */}
                          <td className="align-middle">
                            <Form.Control
                              size="sm"
                              type="text"
                              value={item.quantity * (parseFloat(item.packSize) || 1)}
                              readOnly
                              className="bg-light border-0 text-center fw-semibold"
                            />
                          </td>
                          
                          {/* Free */}
                          <td className="align-middle" >
                            <Form.Control
                              size="sm"
                              type="number"
                              min="0"
                              placeholder="0"
                              value={formatNumberDisplay(item.freeQuantity)}
                              onChange={(e) => handleFieldChange(index, 'freeQuantity', handleNumberChange(e.target.value))}
                              onBlur={(e) => handleFieldChange(index, 'freeQuantity', handleNumberBlur(e.target.value))}
                            />
                          </td>
                          
                          {/* Free Strips (freePack) */}
                          <td className="align-middle" hidden>
                            <Form.Control
                              size="sm"
                              type="number"
                              min="0"
                              step="1"
                              placeholder="0"
                              value={formatNumberDisplay(item.freePack)}
                              onChange={(e) => handleFieldChange(index, 'freePack', handleNumberChange(e.target.value))}
                              onBlur={(e) => handleFieldChange(index, 'freePack', handleNumberBlur(e.target.value))}
                            />
                          </td>

                          {/* Free Tax (taxOnFree) - Yes/No */}
                          <td className="align-middle">
                            <Form.Select
                              size="sm"
                              value={item.taxOnFree}
                              onChange={(e) => handleFieldChange(index, 'taxOnFree', parseInt(e.target.value))}
                            >
                              <option value={1}>Yes</option>
                              <option value={0}>No</option>
                            </Form.Select>
                          </td>
                          
                          {/* C.P (Cost Price) */}
                          <td className="align-middle">
                            <Form.Control
                              size="sm"
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="0"
                              value={formatNumberDisplay(item.unitPrice)}
                              onChange={(e) => handleFieldChange(index, 'unitPrice', handleNumberChange(e.target.value))}
                              onBlur={(e) => handleFieldChange(index, 'unitPrice', handleNumberBlur(e.target.value))}
                              required
                            />
                          </td>
                          
                          {/* M.R.P */}
                          <td className="align-middle">
                            <Form.Control
                              size="sm"
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="0"
                              value={formatNumberDisplay(item.costPerMRP)}
                              onChange={(e) => handleFieldChange(index, 'costPerMRP', handleNumberChange(e.target.value))}
                              onBlur={(e) => handleFieldChange(index, 'costPerMRP', handleNumberBlur(e.target.value))}
                            />
                          </td>
                          
                          {/* Disc % (Pre-tax, JSP: disc_without_tax) */}
                          <td className="align-middle">
                            <Form.Control
                              size="sm"
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              placeholder="0"
                              value={formatNumberDisplay(item.discWithoutTaxPer || 0)}
                              onChange={(e) => handleDiscountPercentChange(index, 'pre', handleNumberChange(e.target.value))}
                              onBlur={(e) => handleDiscountPercentChange(index, 'pre', handleNumberBlur(e.target.value))}
                            />
                          </td>
                          
                          {/* Pre-tax Discount Amount - Editable */}
                          <td className="align-middle">
                            <Form.Control
                              size="sm"
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="0"
                              value={formatNumberDisplay(item.discWithoutTaxAmtInput || 0)}
                              onChange={(e) => handleDiscountAmountChange(index, 'pre', handleNumberChange(e.target.value))}
                              onBlur={(e) => handleDiscountAmountChange(index, 'pre', handleNumberBlur(e.target.value), true)}
                              className="bg-light border-0 fw-semibold text-danger"
                            />
                          </td>
                          
                          {/* Cost Total (after pre-tax discount, JSP: cost_tot) */}
                          <td className="align-middle">
                            <Form.Control
                              size="sm"
                              type="text"
                              value={`₹${costTotDisplay.toFixed(2)}`}
                              readOnly
                              className="bg-light border-0 fw-semibold"
                            />
                          </td>
                          
                          {/* GST % + Type (Cost/MRP/Disc) */}
                          <td className="align-middle">
                            <div className="d-flex gap-1">
                              <Form.Control
                                size="sm"
                                type="number"
                                min="0"
                                max="100"
                                step="0.01"
                                placeholder="0"
                                style={{ width: '70px' }}
                                value={formatNumberDisplay(item.taxPercentage)}
                                onChange={(e) => handleFieldChange(index, 'taxPercentage', handleNumberChange(e.target.value))}
                                onBlur={(e) => handleFieldChange(index, 'taxPercentage', handleNumberBlur(e.target.value))}
                              />
                              <Form.Select
                                size="sm"
                                style={{ width: '80px' }}
                                value={item.vatType}
                                onChange={(e) => handleFieldChange(index, 'vatType', parseInt(e.target.value))}
                              >
                                <option value={0}>Cost</option>
                                <option value={1}>MRP</option>
                                <option value={2}>Disc</option>
                              </Form.Select>
                            </div>
                          </td>

                          {/* GST Amt - Auto Calculated */}
                          <td className="align-middle">
                            <Form.Control
                              size="sm"
                              type="text"
                              value={`₹${item.taxAmount.toFixed(2)}`}
                              readOnly
                              className="bg-light border-0 fw-semibold"
                            />
                          </td>

                          {/* GST on M.R.P - Auto Calculated (JSP: vat_mrp) */}
                          <td className="align-middle">
                            <Form.Control
                              size="sm"
                              type="text"
                              value={`₹${vatMrpDisplay.toFixed(2)}`}
                              readOnly
                              className="bg-light border-0 fw-semibold text-secondary"
                            />
                          </td>
                          
                          {/* Second Disc % (Post-tax, JSP: discount) */}
                          <td className="align-middle">
                            <Form.Control
                              size="sm"
                              type="number"
                              min="0"
                              max="100"
                              step="0.01"
                              placeholder="0"
                              value={formatNumberDisplay(item.discount || 0)}
                              onChange={(e) => handleDiscountPercentChange(index, 'post', handleNumberChange(e.target.value))}
                              onBlur={(e) => handleDiscountPercentChange(index, 'post', handleNumberBlur(e.target.value))}
                            />
                          </td>
                          
                          {/* Post-tax Discount Amount - Editable */}
                          <td className="align-middle">
                            <Form.Control
                              size="sm"
                              type="number"
                              min="0"
                              step="0.01"
                              placeholder="0"
                              value={formatNumberDisplay(item.discAfterTaxAmtInput || 0)}
                              onChange={(e) => handleDiscountAmountChange(index, 'post', handleNumberChange(e.target.value))}
                              onBlur={(e) => handleDiscountAmountChange(index, 'post', handleNumberBlur(e.target.value), true)}
                              className="bg-light border-0 fw-semibold text-danger"
                            />
                          </td>
                          
                          {/* Total - Auto Calculated */}
                          <td className="align-middle">
                            <Form.Control
                              size="sm"
                              type="text"
                              value={`₹${item.totalAmount.toFixed(2)}`}
                              readOnly
                              className="border-0 fw-bold"
                              style={{ backgroundColor: 'var(--table-row-highlight-bg)' }}
                            />
                          </td>
                          
                          {/* Batch Discount (For Selling Time) */}
                          <td className="align-middle">
                            <div className="d-flex flex-column gap-1">
                              <Form.Control
                                size="sm"
                                type="number"
                                min="0"
                                step="0.01"
                                placeholder="0"
                                value={formatNumberDisplay(item.discOnMrp)}
                                onChange={(e) => handleFieldChange(index, 'discOnMrp', handleNumberChange(e.target.value))}
                                onBlur={(e) => handleFieldChange(index, 'discOnMrp', handleNumberBlur(e.target.value))}
                              />
                              <div className="/*d-flex*/ gap-2" style={{ fontSize: 'var(--font-size-xs)'}} hidden>
                                <Form.Check
                                  type="radio"
                                  id={`disc-pct-${index}`}
                                  name={`disc-type-${index}`}
                                  label="%"
                                  checked={(item.discountType || 'percentage') === 'percentage'}
                                  onChange={() => handleFieldChange(index, 'discountType', 'percentage')}
                                />
                                <Form.Check
                                  type="radio"
                                  id={`disc-rs-${index}`}
                                  name={`disc-type-${index}`}
                                  label="₹"
                                  checked={(item.discountType || 'percentage') === 'rupees'}
                                  onChange={() => handleFieldChange(index, 'discountType', 'rupees')}
                                />
                              </div>
                            </div>
                          </td>
                          
                          {/* Unit C.P - Calculated */}
                          <td className="align-middle">
                            <Form.Control
                              size="sm"
                              type="text"
                              value={`₹${item.costPerUnit.toFixed(2)}`}
                              readOnly
                              className="bg-light border-0"
                            />
                          </td>
                          
                          {/* Unit M.R.P - Calculated */}
                          <td className="align-middle">
                            <Form.Control
                              size="sm"
                              type="text"
                              value={`₹${unitMRP.toFixed(2)}`}
                              readOnly
                              className="bg-light border-0"
                            />
                          </td>
                          
                          {/* Btch Add */}
                          <td className="align-middle text-center">
                            {originalPurchaseItems.current.some(orig => orig.id === item.id) ? (
                              <Button 
                                size="sm" 
                                className="theme-outline-btn-primary"
                                onClick={() => handleAddBatch(index)}
                                title="Add Batch"
                              >
                                <i className="fas fa-plus-circle"></i>
                              </Button>
                            ) : (
                              <Button
                                size="sm"
                                variant="outline-danger"
                                onClick={() => handleDeleteItem(index)}
                                title="Remove added batch"
                              >
                                <i className="fas fa-times-circle"></i>
                              </Button>
                            )}
                          </td>
                        </tr>
                        );
                      })}
                    </tbody>
                  </Table>
                  </div>

                  <div className="d-lg-none pe-mobile-items p-2">
                    {purchaseItems.map((item, index) => {
                      const preDiscountAmount = item.preDiscountAmount || 0;
                      const costTotDisplay = (item.quantity * item.unitPrice) - preDiscountAmount;
                      const postDiscountAmount = item.discAfterTax || 0;
                      const taxableFreeQtyDisplay = (item.freeQuantity > 0 && item.taxOnFree === 1) ? item.freeQuantity : 0;
                      const tempAmtDisplay = ((item.quantity + taxableFreeQtyDisplay) * item.costPerMRP) / (1 + item.taxPercentage / 100);
                      const vatMrpDisplay = (item.taxPercentage / 100) * tempAmtDisplay;
                      const unitMRP = (parseFloat(item.packSize) || 1) > 0 ? item.costPerMRP / (parseFloat(item.packSize) || 1) : 0;
                      const isOriginalItem = originalPurchaseItems.current.some(orig => orig.id === item.id);

                      return (
                        <div key={item.id} className="card border-0 shadow-sm mb-2 pe-mobile-item-card">
                          <div className="card-body p-2">
                            <div className="d-flex justify-content-between align-items-start mb-2">
                              <div>
                                <div className="fw-semibold" style={{ fontSize: 'var(--font-size-sm)' }}>
                                  {index + 1}. {item.itemName}
                                </div>
                                {getBatchCount(item.itemCode) > 1 && (
                                  <Badge className="theme-badge-primary text-dark mt-1" style={{ fontSize: 'var(--font-size-xs)' }}>
                                    Batch {purchaseItems.filter((i, idx) => i.itemCode === item.itemCode && idx <= index).length} of {getBatchCount(item.itemCode)}
                                  </Badge>
                                )}
                              </div>
                              <div className="text-end">
                                <div style={{ fontSize: 'var(--font-size-xs)' }}>Total</div>
                                <div className="fw-bold" style={{ color: 'var(--page-secondary-color)', fontSize: 'var(--font-size-sm)' }}>₹{item.totalAmount.toFixed(2)}</div>
                              </div>
                            </div>

                            <div className="row g-2">
                              <div className="col-7">
                                <Form.Label className="mb-1" style={{ fontSize: 'var(--font-size-xs)' }}>Batch No</Form.Label>
                                <Form.Control
                                  size="sm"
                                  type="text"
                                  placeholder="Enter batch"
                                  value={item.batchNo}
                                  onChange={(e) => handleFieldChange(index, 'batchNo', e.target.value)}
                                  onBlur={(e) => handleBatchNoBlur(index, e.target.value)}
                                  required
                                />
                              </div>
                              <div className="col-5">
                                <Form.Label className="mb-1" style={{ fontSize: 'var(--font-size-xs)' }}>Exp. Date</Form.Label>
                                <Form.Control
                                  size="sm"
                                  type="month"
                                  value={item.expiryDate}
                                  onChange={(e) => handleFieldChange(index, 'expiryDate', e.target.value)}
                                />
                              </div>

                              <div className="col-4">
                                <Form.Label className="mb-1" style={{ fontSize: 'var(--font-size-xs)' }}>Strip</Form.Label>
                                <Form.Control
                                  size="sm"
                                  type="number"
                                  min="0"
                                  step="1"
                                  placeholder="0"
                                  value={formatNumberDisplay(item.quantity)}
                                  onChange={(e) => handleFieldChange(index, 'quantity', handleNumberChange(e.target.value))}
                                  onBlur={(e) => handleFieldChange(index, 'quantity', handleNumberBlur(e.target.value))}
                                />
                              </div>
                              <div className="col-4">
                                <Form.Label className="mb-1" style={{ fontSize: 'var(--font-size-xs)' }}>Unit/Strip</Form.Label>
                                <Form.Control
                                  size="sm"
                                  type="text"
                                  placeholder="1"
                                  value={item.packSize || '1'}
                                  onChange={(e) => handleFieldChange(index, 'packSize', e.target.value)}
                                />
                              </div>
                              <div className="col-4">
                                <Form.Label className="mb-1" style={{ fontSize: 'var(--font-size-xs)' }}>Units</Form.Label>
                                <Form.Control
                                  size="sm"
                                  type="text"
                                  value={item.quantity * (parseFloat(item.packSize) || 1)}
                                  readOnly
                                  className="bg-light border-0"
                                />
                              </div>

                              <div className="col-6">
                                <Form.Label className="mb-1" style={{ fontSize: 'var(--font-size-xs)' }}>C.P (₹)</Form.Label>
                                <Form.Control
                                  size="sm"
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  placeholder="0"
                                  value={formatNumberDisplay(item.unitPrice)}
                                  onChange={(e) => handleFieldChange(index, 'unitPrice', handleNumberChange(e.target.value))}
                                  onBlur={(e) => handleFieldChange(index, 'unitPrice', handleNumberBlur(e.target.value))}
                                />
                              </div>
                              <div className="col-6">
                                <Form.Label className="mb-1" style={{ fontSize: 'var(--font-size-xs)' }}>M.R.P (₹)</Form.Label>
                                <Form.Control
                                  size="sm"
                                  type="number"
                                  min="0"
                                  step="0.01"
                                  placeholder="0"
                                  value={formatNumberDisplay(item.costPerMRP)}
                                  onChange={(e) => handleFieldChange(index, 'costPerMRP', handleNumberChange(e.target.value))}
                                  onBlur={(e) => handleFieldChange(index, 'costPerMRP', handleNumberBlur(e.target.value))}
                                />
                              </div>

                              <div className="col-6">
                                <Form.Label className="mb-1" style={{ fontSize: 'var(--font-size-xs)' }}>GST %</Form.Label>
                                <Form.Control
                                  size="sm"
                                  type="number"
                                  min="0"
                                  max="100"
                                  step="0.01"
                                  placeholder="0"
                                  value={formatNumberDisplay(item.taxPercentage)}
                                  onChange={(e) => handleFieldChange(index, 'taxPercentage', handleNumberChange(e.target.value))}
                                  onBlur={(e) => handleFieldChange(index, 'taxPercentage', handleNumberBlur(e.target.value))}
                                />
                                <Form.Label className="mb-1" style={{ fontSize: 'var(--font-size-xs)' }}>GST Type</Form.Label>
                                <Form.Select
                                  size="sm"
                                  value={item.vatType}
                                  onChange={(e) => handleFieldChange(index, 'vatType', parseInt(e.target.value))}
                                >
                                  <option value={0}>Cost</option>
                                  <option value={1}>MRP</option>
                                  <option value={2}>Disc</option>
                                </Form.Select>
                              </div>

                              <div className="col-6">
                                <Form.Label className="mb-1" style={{ fontSize: 'var(--font-size-xs)' }}>GST Amt</Form.Label>
                                <Form.Control size="sm" type="text" value={`₹${item.taxAmount.toFixed(2)}`} readOnly className="bg-light border-0" />
                              </div>
                              <div className="col-6">
                                <Form.Label className="mb-1" style={{ fontSize: 'var(--font-size-xs)' }}>GST on M.R.P</Form.Label>
                                <Form.Control size="sm" type="text" value={`₹${vatMrpDisplay.toFixed(2)}`} readOnly className="bg-light border-0" />
                              </div>
                            </div>

                            <details className="mt-2 pe-mobile-advanced">
                              <summary style={{ fontSize: 'var(--font-size-sm)' }}>More fields</summary>
                              <div className="row g-2 mt-1">
                                <div className="col-6">
                                  <Form.Label className="mb-1" style={{ fontSize: 'var(--font-size-xs)' }}>HSN Code</Form.Label>
                                  <Form.Control
                                    size="sm"
                                    type="text"
                                    placeholder="HSN Code"
                                    value={item.hsnCode}
                                    onChange={(e) => handleFieldChange(index, 'hsnCode', e.target.value)}
                                  />
                                </div>
                                <div className="col-6">
                                  <Form.Label className="mb-1" style={{ fontSize: 'var(--font-size-xs)' }}>Free Tax</Form.Label>
                                  <Form.Select
                                    size="sm"
                                    value={item.taxOnFree}
                                    onChange={(e) => handleFieldChange(index, 'taxOnFree', parseInt(e.target.value))}
                                  >
                                    <option value={1}>Yes</option>
                                    <option value={0}>No</option>
                                  </Form.Select>
                                </div>

                                <div className="col-6">
                                  <Form.Label className="mb-1" style={{ fontSize: 'var(--font-size-xs)' }}>Free Qty</Form.Label>
                                  <Form.Control
                                    size="sm"
                                    type="number"
                                    min="0"
                                    placeholder="0"
                                    value={formatNumberDisplay(item.freeQuantity)}
                                    onChange={(e) => handleFieldChange(index, 'freeQuantity', handleNumberChange(e.target.value))}
                                    onBlur={(e) => handleFieldChange(index, 'freeQuantity', handleNumberBlur(e.target.value))}
                                  />
                                </div>
                                <div className="col-6" hidden>
                                  <Form.Label className="mb-1" style={{ fontSize: 'var(--font-size-xs)' }}>Free Strips</Form.Label>
                                  <Form.Control
                                    size="sm"
                                    type="number"
                                    min="0"
                                    step="1"
                                    placeholder="0"
                                    value={formatNumberDisplay(item.freePack)}
                                    onChange={(e) => handleFieldChange(index, 'freePack', handleNumberChange(e.target.value))}
                                    onBlur={(e) => handleFieldChange(index, 'freePack', handleNumberBlur(e.target.value))}
                                  />
                                </div>

                                <div className="col-6">
                                  <Form.Label className="mb-1" style={{ fontSize: 'var(--font-size-xs)' }}>1st Disc %</Form.Label>
                                  <Form.Control
                                    size="sm"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    placeholder="0"
                                    value={formatNumberDisplay(item.discWithoutTaxPer || 0)}
                                    onChange={(e) => handleDiscountPercentChange(index, 'pre', handleNumberChange(e.target.value))}
                                    onBlur={(e) => handleDiscountPercentChange(index, 'pre', handleNumberBlur(e.target.value))}
                                  />
                                </div>
                                <div className="col-6">
                                  <Form.Label className="mb-1" style={{ fontSize: 'var(--font-size-xs)' }}>2nd Disc %</Form.Label>
                                  <Form.Control
                                    size="sm"
                                    type="number"
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    placeholder="0"
                                    value={formatNumberDisplay(item.discount || 0)}
                                    onChange={(e) => handleDiscountPercentChange(index, 'post', handleNumberChange(e.target.value))}
                                    onBlur={(e) => handleDiscountPercentChange(index, 'post', handleNumberBlur(e.target.value))}
                                  />
                                </div>

                                <div className="col-6">
                                  <Form.Label className="mb-1" style={{ fontSize: 'var(--font-size-xs)' }}>1st Disc ₹</Form.Label>
                                  <Form.Control
                                    size="sm"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="0"
                                    value={formatNumberDisplay(item.discWithoutTaxAmtInput || 0)}
                                    onChange={(e) => handleDiscountAmountChange(index, 'pre', handleNumberChange(e.target.value))}
                                    onBlur={(e) => handleDiscountAmountChange(index, 'pre', handleNumberBlur(e.target.value), true)}
                                  />
                                </div>
                                <div className="col-6">
                                  <Form.Label className="mb-1" style={{ fontSize: 'var(--font-size-xs)' }}>2nd Disc ₹</Form.Label>
                                  <Form.Control
                                    size="sm"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="0"
                                    value={formatNumberDisplay(item.discAfterTaxAmtInput || 0)}
                                    onChange={(e) => handleDiscountAmountChange(index, 'post', handleNumberChange(e.target.value))}
                                    onBlur={(e) => handleDiscountAmountChange(index, 'post', handleNumberBlur(e.target.value), true)}
                                  />
                                </div>
                                <div className="col-6">
                                  <Form.Label className="mb-1" style={{ fontSize: 'var(--font-size-xs)' }}>Subtotal</Form.Label>
                                  <Form.Control size="sm" type="text" value={`₹${costTotDisplay.toFixed(2)}`} readOnly className="bg-light border-0" />
                                </div>
                                <div className="col-6">
                                  <Form.Label className="mb-1" style={{ fontSize: 'var(--font-size-xs)' }}>Batch Discount %</Form.Label>
                                  <Form.Control
                                    size="sm"
                                    type="number"
                                    min="0"
                                    step="0.01"
                                    placeholder="0"
                                    value={formatNumberDisplay(item.discOnMrp)}
                                    onChange={(e) => handleFieldChange(index, 'discOnMrp', handleNumberChange(e.target.value))}
                                    onBlur={(e) => handleFieldChange(index, 'discOnMrp', handleNumberBlur(e.target.value))}
                                  />
                                  <div className="/*d-flex*/ gap-3 mt-1" style={{ fontSize: 'var(--font-size-xs)'}} hidden>
                                    <Form.Check
                                      type="radio"
                                      id={`mob-disc-pct-${index}`}
                                      name={`mob-disc-type-${index}`}
                                      label="%"
                                      checked={(item.discountType || 'percentage') === 'percentage'}
                                      onChange={() => handleFieldChange(index, 'discountType', 'percentage')}
                                    />
                                    <Form.Check
                                      type="radio"
                                      id={`mob-disc-rs-${index}`}
                                      name={`mob-disc-type-${index}`}
                                      label="₹"
                                      checked={(item.discountType || 'percentage') === 'rupees'}
                                      onChange={() => handleFieldChange(index, 'discountType', 'rupees')}
                                    />
                                  </div>
                                </div>
                                <div className="col-6">
                                  <Form.Label className="mb-1" style={{ fontSize: 'var(--font-size-xs)' }}>Unit C.P</Form.Label>
                                  <Form.Control size="sm" type="text" value={`₹${item.costPerUnit.toFixed(2)}`} readOnly className="bg-light border-0" />
                                </div>
                                <div className="col-6">
                                  <Form.Label className="mb-1" style={{ fontSize: 'var(--font-size-xs)' }}>Unit M.R.P</Form.Label>
                                  <Form.Control size="sm" type="text" value={`₹${unitMRP.toFixed(2)}`} readOnly className="bg-light border-0" />
                                </div>
                              </div>
                            </details>

                            <div className="d-flex gap-2 mt-2">
                              {isOriginalItem ? (
                                <Button
                                  size="sm"
                                  className="theme-outline-btn-primary flex-grow-1"
                                  onClick={() => handleAddBatch(index)}
                                >
                                  <i className="fas fa-plus-circle me-1"></i>Add Batch
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline-danger"
                                  className="flex-grow-1"
                                  onClick={() => handleDeleteItem(index)}
                                >
                                  <i className="fas fa-times-circle me-1"></i>Remove Batch
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                  </>
                )}
              </div>
              {purchaseItems.length > 0 && (
                <div className="p-2 bg-light border-top">
                  <small className="text-muted">
                    <i className="fas fa-info-circle me-1"></i>
                    All fields are editable. Click <strong>Add Batch</strong> <i className="fas fa-plus-circle"></i> to add another batch for same item. Scroll right to see all fields. Required fields are marked with <span className="text-danger">*</span>
                  </small>
                </div>
              )}
            </div>
            <div className="card-footer pe-main-footer pe-footer-shell">
              <div className="d-lg-none pe-mobile-final-row mb-2">
                <span className="fw-semibold">Final Amount</span>
                <span className="fw-bold">₹{totals.finalAmount.toFixed(2)}</span>
              </div>
              <div className="pe-footer-row">
                <details className="pe-desktop-summary d-none d-lg-block mb-2">
                  <summary className="fw-semibold" style={{ fontSize: 'var(--font-size-sm)' }}>Bill Summary & Extra Calculation</summary>
                  <div className="pe-footer-row mt-2">
                    <div className="pe-footer-summary">
                      <h6 className="mb-2" style={{ color: 'var(--page-secondary-color)' }}>
                        <i className="fas fa-list-ol me-2"></i>
                        Bill Summary
                      </h6>
                      <div className="summary-box">
                        <div className="summary-row">
                          <span>Subtotal</span>
                          <span className="fw-bold">₹{totals.subtotal.toFixed(2)}</span>
                        </div>
                        <div className="summary-row">
                          <span>Discount</span>
                          <span className="fw-bold">- ₹{totals.totalDiscount.toFixed(2)}</span>
                        </div>
                        <div className="summary-row">
                          <span>Tax (GST)</span>
                          <span className="fw-bold">+ ₹{totals.totalTax.toFixed(2)}</span>
                        </div>
                        <div className="summary-row fw-bold grand-total">
                          <span>Total Amount</span>
                          <span>₹{totals.grandTotal.toFixed(2)}</span>
                        </div>
                      </div>
                      {/* Remarks hidden but value still tracked */}
                      <Form.Control
                        as="textarea"
                        rows={2}
                        placeholder="Enter any additional notes or remarks about this purchase..."
                        value={remarks}
                        onChange={(e) => setRemarks(e.target.value)}
                        hidden
                      />
                    </div>

                    <div className="pe-footer-summary">
                      <h6 className="mb-2" style={{ color: 'var(--page-secondary-color)' }}>
                        <i className="fas fa-calculator me-2"></i>
                        Extra Calculation
                      </h6>
                      <div className="summary-box">
                        <div className="summary-row mt-2">
                          <span>Extra Discount</span>
                          <Form.Control
                            size="sm"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0"
                            value={formatNumberDisplay(extraDiscount)}
                            onChange={(e) => setExtraDiscount(handleNumberChange(e.target.value))}
                            onBlur={(e) => setExtraDiscount(handleNumberBlur(e.target.value))}
                            style={{ width: '100px', textAlign: 'right' }}
                          />
                        </div>
                        <div className="summary-row">
                          <span>Extra Charge</span>
                          <Form.Control
                            size="sm"
                            type="number"
                            min="0"
                            step="0.01"
                            placeholder="0"
                            value={formatNumberDisplay(surCharge)}
                            onChange={(e) => setSurCharge(handleNumberChange(e.target.value))}
                            onBlur={(e) => setSurCharge(handleNumberBlur(e.target.value))}
                            style={{ width: '100px', textAlign: 'right' }}
                          />
                        </div>
                        <div className="summary-row fw-bold grand-total">
                          <span>Final Amount</span>
                          <span>₹{totals.finalAmount.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </details>

                <div className="d-none d-lg-flex pe-mobile-final-row pe-desktop-final-inline mb-2">
                  <span className="fw-semibold">Final Amount</span>
                  <span className="fw-bold">₹{totals.finalAmount.toFixed(2)}</span>
                </div>

                <details className="pe-mobile-summary d-lg-none mb-2">
                  <summary className="fw-semibold" style={{ fontSize: 'var(--font-size-sm)' }}>Bill Summary & Extra Calculation</summary>
                  <div className="mt-2">
                    <div className="summary-box mb-2">
                      <div className="summary-row">
                        <span>Subtotal</span>
                        <span className="fw-bold">₹{totals.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="summary-row">
                        <span>Discount</span>
                        <span className="fw-bold">- ₹{totals.totalDiscount.toFixed(2)}</span>
                      </div>
                      <div className="summary-row">
                        <span>Tax (GST)</span>
                        <span className="fw-bold">+ ₹{totals.totalTax.toFixed(2)}</span>
                      </div>
                      <div className="summary-row fw-bold grand-total">
                        <span>Total Amount</span>
                        <span>₹{totals.grandTotal.toFixed(2)}</span>
                      </div>
                    </div>

                    <div className="summary-box">
                      <div className="summary-row mt-2">
                        <span>Extra Discount</span>
                        <Form.Control
                          size="sm"
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0"
                          value={formatNumberDisplay(extraDiscount)}
                          onChange={(e) => setExtraDiscount(handleNumberChange(e.target.value))}
                          onBlur={(e) => setExtraDiscount(handleNumberBlur(e.target.value))}
                          style={{ width: '100px', textAlign: 'right' }}
                        />
                      </div>
                      <div className="summary-row">
                        <span>Extra Charge</span>
                        <Form.Control
                          size="sm"
                          type="number"
                          min="0"
                          step="0.01"
                          placeholder="0"
                          value={formatNumberDisplay(surCharge)}
                          onChange={(e) => setSurCharge(handleNumberChange(e.target.value))}
                          onBlur={(e) => setSurCharge(handleNumberBlur(e.target.value))}
                          style={{ width: '100px', textAlign: 'right' }}
                        />
                      </div>
                    </div>
                  </div>
                </details>

                {/* Action Buttons */}
                <div className="pe-footer-actions pe-mobile-sticky-actions">
                  <Button className="btn btn-light" onClick={handleReset}>
                    <i className="fas fa-redo me-2"></i>Reset
                  </Button>
                  <Button
                    className="theme-btn-primary"
                    onClick={handleSubmitEntry}
                    disabled={purchaseItems.length === 0 || !selectedVendor || loading || isSaving || isConfirming}
                  >
                    <i className="fas fa-save me-2"></i>{isSaving ? 'Saving...' : 'Save'}
                  </Button>
                  <Button
                    className="theme-btn-secondary w-100"
                    onClick={handleConfirmEntry}
                    disabled={purchaseItems.length === 0 || !selectedVendor || purchaseItems.some(item => item.isSaved === 0) || loading || isSaving || isConfirming}
                    title={purchaseItems.some(item => item.isSaved === 0) ? 'Please save the items first before confirming' : 'Confirm purchase entry'}
                  >
                    <i className="fas fa-check-double me-2"></i>{isConfirming ? 'Confirming...' : 'Confirm'}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>

      {/* Vendor Details Modal */}
      <Modal show={showVendorDetails} onHide={() => setShowVendorDetails(false)} centered backdrop="static" keyboard={false}>
        <Modal.Header closeButton className="border-0" style={{ backgroundColor: 'var(--page-header-bg)' }}>
          <Modal.Title style={{ color: 'var(--page-header-text)' }}>
            <i className="fas fa-building me-2"></i>
            Vendor Full Details
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedVendor && (
            <div>
              <div className="mb-3">
                <h5 style={{ color: 'var(--page-secondary-color)' }}>{selectedVendor.name}</h5>
                <Badge className="theme-badge-secondary">
                  <i className="fas fa-check-circle me-1"></i>
                  From Purchase Order
                </Badge>
              </div>
              <hr />
              <div className="row g-3">
                <div className="col-12">
                  <label className="text-muted small d-block mb-1">
                    <i className="fas fa-file-invoice me-1"></i>
                    GST Number
                  </label>
                  <strong className="text-dark">{selectedVendor.gstNo}</strong>
                </div>
                <div className="col-12">
                  <label className="text-muted small d-block mb-1">
                    <i className="fas fa-map-marker-alt me-1"></i>
                    Address
                  </label>
                  <span className="text-dark">{selectedVendor.address}</span>
                </div>
                <div className="col-6">
                  <label className="text-muted small d-block mb-1">
                    <i className="fas fa-user me-1"></i>
                    Contact Person
                  </label>
                  <span className="text-dark">{selectedVendor.contactPerson}</span>
                </div>
                <div className="col-6">
                  <label className="text-muted small d-block mb-1">
                    <i className="fas fa-phone me-1"></i>
                    Phone Number
                  </label>
                  <span className="text-dark">{selectedVendor.phoneNo}</span>
                </div>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="border-0 bg-light">
          <Button className="theme-outline-btn-primary" onClick={() => setShowVendorDetails(false)}>
            <i className="fas fa-times me-2"></i>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <style>{`
        input[type='number']::-webkit-outer-spin-button,
        input[type='number']::-webkit-inner-spin-button {
          -webkit-appearance: none;
          margin: 0;
        }

        input[type='number'] {
          -moz-appearance: textfield;
          appearance: textfield;
        }

        .pe-screen {
          overflow-x: hidden;
          overflow-y: auto;
          background-color: var(--page-body-bg);
        }
        .pe-content {
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
        }
        .pe-main-card {
          border: 1px solid var(--border-color);
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
        }
        .pe-main-header {
          background-color: var(--page-header-bg);
          border-bottom: 1px solid var(--border-color);
          padding: 1rem;
        }
        .pe-main-body {
          flex: 1;
          min-height: 0;
          display: flex;
          flex-direction: column;
          overflow: auto;
        }
        .pe-main-footer {
          background-color: var(--page-header-bg);
          border-top: 1px solid var(--border-color);
          padding: 1rem;
        }
        .pe-table-scroll {
          flex: 1;
          min-height: 0;
          overflow-y: auto;
          overflow-x: auto;
        }

        /* ── Purchase Entry Header flexbox ── */
        .pe-header-row {
          display: flex;
          flex-wrap: wrap;
          align-items: flex-end;
          gap: 12px;
        }
        .pe-header-col-auto {
          flex: 0 0 auto;
        }
        .pe-header-col {
          flex: 1 1 160px;
          min-width: 0;
        }

        /* ── Purchase Entry Footer flexbox ── */
        .pe-footer-row {
          display: flex;
          flex-wrap: wrap;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
        }
        .pe-footer-summary {
          flex: 0 0 300px;
          min-width: 0;
        }
        .pe-footer-actions {
          flex: 1 1 360px;
          display: flex;
          flex-direction: row;
          gap: 8px;
          align-items: stretch;
        }
        .pe-footer-actions .btn {
          flex: 1 1 0;
          margin-bottom: 0 !important;
        }
        .pe-mobile-item-card {
          border: 1px solid var(--page-primary-color);
        }
        .pe-mobile-items {
          padding-bottom: 0.75rem;
        }
        .pe-mobile-advanced summary {
          cursor: pointer;
          color: var(--page-secondary-color);
        }
        .pe-mobile-final-row {
          display: flex;
          align-items: center;
          justify-content: space-between;
          background: var(--page-primary-color);
          border: 1px solid var(--page-secondary-color);
          border-radius: 6px;
          padding: 0.5rem 0.75rem;
          color: var(--page-secondary-color);
        }
        .pe-mobile-summary summary {
          cursor: pointer;
          color: var(--page-secondary-color);
        }
        .pe-desktop-summary {
          flex: 1 1 auto;
          min-width: 0;
        }
        .pe-desktop-final-inline {
          flex: 0 0 240px;
          align-self: center;
          margin-bottom: 0 !important;
        }
        .pe-desktop-summary summary {
          cursor: pointer;
          color: var(--page-secondary-color);
          list-style-position: inside;
        }
        .pe-desktop-summary[open] + .pe-desktop-final-inline {
          display: none !important;
        }

        /* ── All mobile/tablet ≤ 991px: scroll inside component shell ── */
        @media (max-width: 991.98px) {
          /* Parent layout uses overflow:hidden, so scrolling must happen inside this component */
          .pe-screen {
            height: 100% !important;
            overflow: hidden !important;
          }
          .pe-content {
            height: 100% !important;
            overflow: hidden !important;
            flex: 1 1 auto;
            padding-left: 0.5rem;
            padding-right: 0.5rem;
            padding-bottom: 0;
          }
          .pe-main-card {
            height: 100% !important;
            overflow: hidden !important;
            flex: 1 1 auto;
            min-height: 0;
          }
          .pe-main-body {
            overflow-y: auto !important;
            overflow-x: hidden !important;
            flex: 1 1 auto;
            min-height: 0;
          }
          .pe-table-scroll {
            overflow-x: auto;
            overflow-y: visible;
            -webkit-overflow-scrolling: touch;
            flex: 1 1 auto;
            min-height: 0;
          }
          /* Keep footer in normal flow to avoid clipping/hiding last rows */
          .pe-main-footer {
            position: static;
            padding: 0.75rem;
          }
        }

        /* ── Phone ≤ 576px ── */
        @media (max-width: 576px) {
          .pe-main-card {
            border-radius: var(--border-radius-sm);
          }
          .pe-main-header {
            padding: 0.75rem !important;
          }
          .pe-header-col,
          .pe-header-col-auto {
            flex: 1 1 100%;
          }
          .pe-header-col-auto .btn,
          .pe-header-col-auto button {
            width: 100%;
          }
          .pe-header-row {
            gap: 8px;
          }
          .pe-mobile-items {
            padding: 0.5rem;
          }
          .pe-footer-row {
            align-items: stretch;
            gap: 10px;
          }
          .pe-footer-actions {
            flex: 1 1 100%;
            flex-direction: row;
            gap: 8px;
          }
          .pe-footer-actions .btn {
            flex: 1;
            margin-bottom: 0 !important;
          }
          .pe-footer-summary {
            flex: 1 1 100%;
          }
          .pe-desktop-summary {
            display: none !important;
          }
          .pe-main-footer {
            padding-bottom: calc(0.75rem + env(safe-area-inset-bottom));
          }
          .pe-mobile-sticky-actions .btn {
            font-size: var(--font-size-xs);
          }
        }

        /* ── Tablet 577px – 768px ── */
        @media (min-width: 577px) and (max-width: 768px) {
          .pe-content {
            padding-left: 0.75rem;
            padding-right: 0.75rem;
          }
          .pe-header-col {
            flex: 1 1 calc(50% - 12px);
          }
          .pe-header-col-auto {
            flex: 1 1 calc(50% - 12px);
          }
          .pe-mobile-items {
            padding-bottom: 1rem;
          }
          .pe-footer-actions {
            flex: 1 1 100%;
            flex-direction: row;
            gap: 8px;
          }
          .pe-footer-actions .btn {
            flex: 1;
            margin-bottom: 0 !important;
          }
        }

        /* ── Landscape under lg ── */
        @media (max-width: 991.98px) and (orientation: landscape) {
          .pe-main-footer {
            position: static;
          }
        }

        /* ── Bill Summary Box ── */
        .pe-footer-summary .summary-box {
          background: var(--page-primary-color);
          border: 1px solid var(--page-secondary-color);
          border-radius: 6px;
          padding: 1rem;
          font-size: var(--font-size-sm);
          color: var(--page-secondary-color);
        }
        .pe-footer-summary .summary-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 0.5rem 0;
          border-bottom: 1px solid var(--page-primary-color);
          color: var(--page-secondary-color);
        }
        .pe-footer-summary .summary-row.grand-total {
          font-size: var(--font-size-md);
          border-top: 2px solid var(--page-primary-color);
          border-bottom: none;
          padding-top: 0.75rem;
        }

        .hover-card {
          transition: all 0.3s ease;
        }
        .hover-card:hover {
          box-shadow: var(--box-shadow-primary) !important;
          transform: translateY(-2px);
        }
      `}</style>
    </div>
  );
};

export default PurchaseEntry;