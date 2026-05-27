import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, Badge, Modal } from 'react-bootstrap';
import { FaStethoscope, FaPills, FaFlask, FaSearch, FaUser, FaTrash, FaSave, FaPrint, FaBed, FaUndo, FaCopy, FaExternalLinkAlt, FaMoneyBillWave, FaCreditCard, FaExchangeAlt, FaPlus, FaFileInvoiceDollar, FaReceipt, FaKeyboard } from 'react-icons/fa';
import { useNavigate, useLocation } from 'react-router-dom';
import { routerPathNames } from '../../../routes/routerPathNames';
import { useSidebar } from '../../../context/SidebarContext';
import { showErrorToast, showWarningToast, showLoading, closeAlert, showSuccessToast, showConfirmDialog, showWarningModal, showErrorModal, showSuccessModal, showInfoToast, showValidationError } from '../../../utils/alertUtil';
import Swal from 'sweetalert2';
import { useSelector } from 'react-redux';
import { RootState } from '../../../state/store';
import { handleNumberChange, handleNumberBlur, formatNumberDisplay } from '../../../utils/numberInputUtil';
import { StorageService } from '../../../api/storage/storageService';
import HttpClientWrapper from '../../../api/http-client-wrapper';
import { CashCounterApiService } from '../../../api/cash-counter/cash-counter-api-service';
import { MedicalRecordsApiService } from '../../../api/medical-records/medical-records-api-service';
import { PharmacyStoresApiService } from '../../../api/pharmacy-stores/pharmacy-stores-api-service';
import { DueBillsModal, AdvanceModal } from './modals';
import { ProcedureBilling, PharmacyBilling, LabBilling, IPBilling, ReturnBilling } from './tabs';
import PatientSearchModal, { Patient } from '../../../components/search-modal/PatientSearchModal';
import { cashCounterMenuConfig, getBillingTabPermissions } from '../../config/menu.config';
import { laboratoryMenuConfig, getBillingTabPermissions as getLabBillingTabPermissions } from '../../../lab/config/menu.config';
import { pharmacyStoresMenuConfig, getBillingTabPermissions as getPharmacyBillingTabPermissions } from '../../../pharmacy-stores/config/menu.config';
import ReactToPrint, { useReactToPrint } from 'react-to-print';
import BillPrintContent, { BillPrintData } from '../../../components/BillPrintContent';
import BillPrintHeader from '../../../components/print/BillPrintHeader';
import { NAVY, BORDER, thStyle, tdStyle } from '../../../components/print/printTokens';
import DuplicateBillView from '../activities/DuplicateBillView';
import './BillingRedesigned.css';

// Fix for TS2786: 'Icon' cannot be used as a JSX component.
const FaStethoscopeIcon = FaStethoscope as any;
const FaPillsIcon = FaPills as any;
const FaFlaskIcon = FaFlask as any;
const FaSearchIcon = FaSearch as any;
const FaUserIcon = FaUser as any;
const FaTrashIcon = FaTrash as any;
const FaSaveIcon = FaSave as any;
const FaPrintIcon = FaPrint as any;
const FaBedIcon = FaBed as any;
const FaUndoIcon = FaUndo as any;
const FaReceiptIcon = FaReceipt as any;
const FaCopyIcon = FaCopy as any;
const FaExternalLinkAltIcon = FaExternalLinkAlt as any;
const FaMoneyBillWaveIcon = FaMoneyBillWave as any;
const FaCreditCardIcon = FaCreditCard as any;
const FaExchangeAltIcon = FaExchangeAlt as any;
const FaPlusIcon = FaPlus as any;
const FaFileInvoiceDollarIcon = FaFileInvoiceDollar as any;
const FaKeyboardIcon = FaKeyboard as any;

type BillingType = 'procedure' | 'pharmacy' | 'lab' | 'ip' | 'return' | null;

interface PatientDetails {
  patId: number;
  displayNumber: string;
  name: string;
  secName?: string;
  sex: string;
  dob: string;
  email?: string;
  phone: string;
  add1: string;
  add2: string;
  pincode?: string;
  gname?: string;
  guardianType?: string;
  village?: string;
  post?: string;
  districtId?: number;
  district?: string;
  state?: string;
  country?: string;
  govIdType?: string;
  govIdNo?: string;
  doctorId: number;
  doctorName: string;
  departmentId?: number;
  departmentName?: string;
  complaintName?: string;
  debitId: number;
  debitHead: string;
  accountCategory: string;
  isInOp: boolean;
  isInIp: boolean;
  isActive?: boolean;
  isDead?: boolean;
  lastVisitId: number;
  visitId?: number;
  ipId: number;
  admitDateTime?: string;
  wardName: string;
  bedNo: string;
  advBalance: number;
  dueBalance: number;
  age?: string;
}

interface BillingItem {
  id: number;
  groupName?: string;
  name?: string;
  unit: number;
  cost?: number;
  discount?: number;
  total: number;
  particularId?: number;
  groupId?: number;
  genericName?: string;
  medicineName?: string;
  batch?: string;
  batchId?: number;
  stock?: number;
  mrp?: number;
  prodsId?: number;
  storeId?: number;
  expiryDate?: string;
  salesPrice?: number;
  sgstPer?: number;
  cgstPer?: number;
  igstPer?: number;
  deptName?: string;
  testName?: string;
  testId?: number;
  deptId?: number;
  specId?: number;
  note?: string;
  rate?: number;
  invOrderId?: number;
  labOrderId?: number;
  phOrderId?: number;
}

const BillingRedesigned: React.FC = () => {
  const { collapsed, mobileOpen, closeMobileSidebar, toggleSidebar } = useSidebar();
  const navigate = useNavigate();
  const location = useLocation();
  const loginData = useSelector((state: RootState) => state.loginData);
  const moduleDetails = useSelector((state: RootState) => state.appReducer.moduleDetails);
  
 // Detect active module route for shared billing usage
  const isLabRoute = useMemo(
    () => location.pathname.startsWith(routerPathNames.laboratory.base),
    [location.pathname]
  );
  const isPharmacyRoute = useMemo(
    () => location.pathname.startsWith(routerPathNames.pharmacyStores.base),
    [location.pathname]
  );

  const duplicateRoute = useMemo(() => {
    if (isPharmacyRoute) {
      return routerPathNames.pharmacyStores.pharmacy.activities.billPhDuplicateBill;
    }
    if (isLabRoute) {
      return routerPathNames.laboratory.activities.billLabDuplicateBill;
    }
    return routerPathNames.cashCounter.activities.duplicateBill;
  }, [isLabRoute, isPharmacyRoute]);
  
  // Get permission flags using appropriate module resolver
  const permissions = useMemo(() => {
    let resolver = getBillingTabPermissions; // Default: Cash Counter
    let activeModuleId = cashCounterMenuConfig.moduleId;
    let pharmacySubModId: number | undefined;

    if (isLabRoute) {
      resolver = getLabBillingTabPermissions;
      activeModuleId = laboratoryMenuConfig.moduleId;
    } else if (isPharmacyRoute) {
      resolver = getPharmacyBillingTabPermissions;
      activeModuleId = pharmacyStoresMenuConfig.moduleId;

      const pharmacyDataStr = sessionStorage.getItem('pharmacySubModuleData');
      if (pharmacyDataStr) {
        try {
          const pharmacyData = JSON.parse(pharmacyDataStr) as { subModId?: number };
          if (typeof pharmacyData?.subModId === 'number') {
            pharmacySubModId = pharmacyData.subModId;
          }
        } catch {
          // Ignore invalid session payload and fall back to module-level permissions.
        }
      }
    }

    const activeModuleDetails = (moduleDetails ?? []).filter(
      (module) => Number(module.modId) === Number(activeModuleId)
    );

    if (isPharmacyRoute) {
      return getPharmacyBillingTabPermissions(activeModuleDetails, pharmacySubModId);
    }

    return resolver(activeModuleDetails);
  }, [moduleDetails, isLabRoute, isPharmacyRoute]);

  const [billingType, setBillingType] = useState<BillingType>(null);
  const [opNumber, setOpNumber] = useState('');
  const [patient, setPatient] = useState<PatientDetails | null>(null);
  const [loadingPatient, setLoadingPatient] = useState(false);
  const [billDateTime, setBillDateTime] = useState('');
  const [showBillDate, setShowBillDate] = useState(false);
  const httpClient = new HttpClientWrapper();
  const cashCounterApi = new CashCounterApiService();
  const medicalRecordsApi = new MedicalRecordsApiService();
  const pharmacyStoresApi = new PharmacyStoresApiService();

  const [accountHeads, setAccountHeads] = useState<any[]>([]);
  const [banks, setBanks] = useState<any[]>([]);
  const [paymentModes, setPaymentModes] = useState<any[]>([]);
  const [consultants, setConsultants] = useState<any[]>([]);
  const [selectedBank, setSelectedBank] = useState<string>('');
  const [transactionNo, setTransactionNo] = useState<string>('');

  const [procedureItems, setProcedureItems] = useState<BillingItem[]>([]);
  const [pharmacyItems, setPharmacyItems] = useState<BillingItem[]>([]);
  const [labItems, setLabItems] = useState<BillingItem[]>([]);
  const [ipItems, setIpItems] = useState<any[]>([]);
  const [resetTrigger, setResetTrigger] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showPatientModal, setShowPatientModal] = useState(false);
  const [showShortcutsModal, setShowShortcutsModal] = useState(false);
  const [showPatientSearchModal, setShowPatientSearchModal] = useState(false);

  const [discountType, setDiscountType] = useState<'rs' | 'percent'>('rs');
  const [totalDiscount, setTotalDiscount] = useState<number>(0);
  const [discountGivenBy, setDiscountGivenBy] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<'cash' | 'bank' | 'cash-bank'>('cash');
  const [bankMode, setBankMode] = useState<string>('');
  const [selectedDoctor, setSelectedDoctor] = useState('');

  const [cashAmount, setCashAmount] = useState<number>(0);
  const [bankAmount, setBankAmount] = useState<number>(0);
  const [insuranceAmount, setInsuranceAmount] = useState<number>(0);
  const [staffCreditAmount, setStaffCreditAmount] = useState<number>(0);
  const [balanceAmount, setBalanceAmount] = useState<number>(0);
  const [roundOff, setRoundOff] = useState<number>(0);

  // theme colors from CSS variables
  const themePrimary = 'var(--page-primary-color)';
  const themeSecondary = 'var(--page-secondary-color)';

  const selectedAccountHead = patient
    ? accountHeads.find((head) => head.headId === patient.debitId)
    : undefined;
  const salesType = selectedAccountHead?.salesType;
  const isStaffEnabled = salesType === 2;
  const isInsuranceEnabled = salesType !== 1 && salesType !== 2;

  const [showDueModal, setShowDueModal] = useState(false);
  const [selectedDues, setSelectedDues] = useState<number[]>([]);
  const [dueBills, setDueBills] = useState<any[]>([]);
  const [loadingDueBills, setLoadingDueBills] = useState(false);
  const [dueCollected, setDueCollected] = useState<number>(0);

  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [advanceCollectionSuccess, setAdvanceCollectionSuccess] = useState(false);
  const [advanceCollectionBillId, setAdvanceCollectionBillId] = useState<number | null>(null);
  const [advancePaymentMode, setAdvancePaymentMode] = useState<'cash' | 'bank' | 'cash-bank'>('cash');
  const [advanceBankMode, setAdvanceBankMode] = useState<string>('');
  const [advancePaymentModes, setAdvancePaymentModes] = useState<any[]>([]);
  const [advanceMode, setAdvanceMode] = useState<'collection' | 'return'>('collection');
  const [advanceCashAmount, setAdvanceCashAmount] = useState<number>(0);
  const [advanceBankAmount, setAdvanceBankAmount] = useState<number>(0);
  const [advanceSelectedBank, setAdvanceSelectedBank] = useState<string>('');
  const [advanceTransactionNo, setAdvanceTransactionNo] = useState<string>('');
  const [advanceAmount, setAdvanceAmount] = useState<number>(0);
  const [advanceHistory, setAdvanceHistory] = useState<any[]>([]);
  const [savedBillNumbers, setSavedBillNumbers] = useState<any>(null);
  const [savedOrderNumbers, setSavedOrderNumbers] = useState<any>(null);
  const [isBillSaved, setIsBillSaved] = useState<boolean>(false);

  const [isOrdering, setIsOrdering] = useState<boolean>(false);

  const [printBillDetails, setPrintBillDetails] = useState<BillPrintData | null>(null);
  const [dueHistoryPrintData, setDueHistoryPrintData] = useState<any>(null);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [showBillPopup, setShowBillPopup] = useState(false);
  const [billPopupId, setBillPopupId] = useState<number | null>(null);

  const opInputRef = useRef<HTMLInputElement>(null);
  const procedureNameInputRef = useRef<HTMLInputElement>(null);
  const medicineNameInputRef = useRef<HTMLInputElement>(null);
  const testNameInputRef = useRef<HTMLInputElement>(null);
  const isAutoCalculatingRef = useRef<boolean>(false);
  const printRef = useRef<HTMLDivElement>(null);

  // State to store order selection handlers from each tab (using state to trigger re-renders)
  const [procedureOrderHandler, setProcedureOrderHandler] = useState<((order: any) => void) | null>(null);
  const [labOrderHandler, setLabOrderHandler] = useState<((order: any) => void) | null>(null);
  const [pharmacyOrderHandler, setPharmacyOrderHandler] = useState<((order: any) => void) | null>(null);

  // Memoized callbacks for handler registration to prevent infinite loops
  const handleRegisterProcedureOrderHandler = useCallback((handler: (order: any) => void) => {
    setProcedureOrderHandler(() => handler);
  }, []);

  const handleRegisterLabOrderHandler = useCallback((handler: (order: any) => void) => {
    setLabOrderHandler(() => handler);
  }, []);

  const handleRegisterPharmacyOrderHandler = useCallback((handler: (order: any) => void) => {
    setPharmacyOrderHandler(() => handler);
  }, []);

  // Memoized onAddItem callbacks to prevent infinite loops
  const handleAddProcedureItem = useCallback((item: any) => {
    const total = (item.cost || 0) * item.unit - (item.discount || 0);
    const newItemWithId = {
      ...item,
      id: Date.now() + Math.random(),
      total: total > 0 ? total : 0,
    };
    setProcedureItems((prev) => [...prev, newItemWithId as any]);
  }, []);

  const handleAddPharmacyItem = useCallback((item: any) => {
    const total = parseFloat(((item.salesPrice || 0) * item.unit).toFixed(4));
    const newItemWithId = {
      ...item,
      id: Date.now() + Math.random(),
      total: total > 0 ? total : 0,
    };
    setPharmacyItems((prev) => [...prev, newItemWithId as any]);
  }, []);

  const handleAddLabItem = useCallback((item: any) => {
    const total = (item.rate || 0) * item.unit - (item.discount || 0);
    const newItemWithId = {
      ...item,
      id: Date.now() + Math.random(),
      total: total > 0 ? total : 0,
    };
    setLabItems((prev) => [...prev, newItemWithId as any]);
  }, []);

  // ===== FUNCTIONS FROM ORIGINAL (All Logic Preserved) =====

  const calculateAge = (dob: string): number => {
    if (!dob) return 0;
    const birthDate = new Date(dob);
    const today = new Date();
    let age = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      age--;
    }
    return age;
  };

  const getProcedureTotal = () => {
    return procedureItems.reduce((sum, item) => sum + item.total, 0);
  };

  const getProcedureDiscount = () => {
    return procedureItems.reduce((sum, item) => sum + (item.discount || 0), 0);
  };

  const getPharmacyTotal = () => {
    // Return total MRP (before discount)
    return pharmacyItems.reduce((sum, item) => sum + ((item.mrp || 0) * (item.unit || 1)), 0);
  };

  const getPharmacyDiscount = () => {
    // Calculate actual discount amount: (mrp - salesPrice) * unit
    return pharmacyItems.reduce((sum, item) => {
      const discountPerUnit = (item.mrp || 0) - (item.salesPrice || 0);
      return sum + (discountPerUnit * (item.unit || 1));
    }, 0);
  };

  const getLabTotal = () => {
    return labItems.reduce((sum, item) => sum + item.total, 0);
  };

  const getLabDiscount = () => {
    return labItems.reduce((sum, item) => sum + (item.discount || 0), 0);
  };

  const getAdditionalDiscount = () => {
    // Calculate combined total after individual discounts
    const procedureTotalAfterDiscount = getProcedureTotal();
    const pharmacyTotalAfterDiscount = pharmacyItems.reduce((sum, item) => sum + ((item.salesPrice || 0) * (item.unit || 1)), 0);
    const labTotalAfterDiscount = getLabTotal();
    // const combinedTotal = procedureTotalAfterDiscount + pharmacyTotalAfterDiscount + labTotalAfterDiscount;
    const ipTotal = ipItems.length > 0 ? ipItems.reduce((sum, item) => sum + (item.amt || 0), 0) : 0;
    const grossTotal = procedureTotalAfterDiscount + pharmacyTotalAfterDiscount + labTotalAfterDiscount + ipTotal;
    
    if (discountType === 'percent') {
      // For IP bills, percentage applies to net payable after advance (matches validation ceiling)
      const advanceBalance = ipItems.length > 0 ? Math.min(patient?.advBalance || 0, Math.round(grossTotal)) : 0;
      const discountBase = grossTotal - advanceBalance;
      return (discountBase * totalDiscount) / 100;
    }
    return totalDiscount;
  };

  const getGrandTotal = () => {
    const ipTotal = ipItems.reduce((sum, item) => sum + (item.amt || 0), 0);
    const procedureTotalAfterDiscount = getProcedureTotal();
    const pharmacyTotalAfterDiscount = pharmacyItems.reduce((sum, item) => sum + ((item.salesPrice || 0) * (item.unit || 1)), 0);
    const labTotalAfterDiscount = getLabTotal();
    const combinedTotal = procedureTotalAfterDiscount + pharmacyTotalAfterDiscount + labTotalAfterDiscount + ipTotal + dueCollected;
    return combinedTotal - getAdditionalDiscount();
  };

  const getRoundedGrandTotal = () => {
    return Math.round(getGrandTotal());
  };

  const getRoundedPayableTotal = () => {
    const roundedSubtotal = getRoundedSubtotal();
    if (patient?.isInOp === false && ipItems.length > 0) {
      const advBalance = Math.min(patient.advBalance || 0, roundedSubtotal);
      return Math.max(0, roundedSubtotal - advBalance);
    }
    return roundedSubtotal;
  };

  const getRoundOff = () => {
    return getRoundedGrandTotal() - getGrandTotal();
  };

  // Get rounded pharmacy MRP total for display and API
  const getRoundedPharmacyTotal = () => {
    return Math.round(getPharmacyTotal());
  };

  // Get rounded total discount for display and API
  const getRoundedTotalDiscount = () => {
    const totalDiscount = getProcedureDiscount() + getPharmacyDiscount() + getLabDiscount() + getAdditionalDiscount();
    return Math.round(totalDiscount);
  };

  // Get rounded subtotal (procedure + actual pharmacy + lab + ip - rounded discount, then Math.round)
  const getRoundedSubtotal = () => {
    const procedureTotal = getProcedureTotal();
    const labTotal = getLabTotal();
    const ipTotal = ipItems.reduce((sum, item) => sum + (item.amt || 0), 0);
    const roundedDiscount = getRoundedTotalDiscount();
    const subtotal = procedureTotal + getPharmacyTotal() + labTotal + ipTotal - roundedDiscount;
    return Math.round(subtotal);
  };

  // Get round off based on full subtotal rounding
  const getDisplayRoundOff = () => {
    const procedureTotal = getProcedureTotal();
    const labTotal = getLabTotal();
    const ipTotal = ipItems.reduce((sum, item) => sum + (item.amt || 0), 0);
    const roundedDiscount = getRoundedTotalDiscount();
    const subtotal = procedureTotal + getPharmacyTotal() + labTotal + ipTotal - roundedDiscount;
    return Math.round(subtotal) - subtotal;
  };

  const calculateTotal = () => {
    if (billingType === 'procedure') {
      return getProcedureTotal();
    } else if (billingType === 'pharmacy') {
      return getPharmacyTotal();
    } else if (billingType === 'lab') {
      return getLabTotal();
    }
    return 0;
  };

  // Total items count
  const getTotalItemsCount = () => {
    return procedureItems.length + pharmacyItems.length + labItems.length + ipItems.length;
  };

  // Handlers
  const handleDiscountChange = (value: string) => {
    const numValue = parseFloat(value) || 0;
    // Keep rupee discount validation aligned with final rounded payable amount.
    // Add current additional discount back to get the full maximum discountable ceiling.
    const maxDiscountAmount = getRoundedPayableTotal() + Math.round(totalDiscount);

    if (discountType === 'percent') {
      if (numValue > 100) {
        showValidationError('Discount percentage cannot exceed 100%');
        return;
      }
    } else {
      // discountType === 'rs'
      if (numValue > maxDiscountAmount) {
        showValidationError(`Discount amount (₹${numValue.toFixed(2)}) cannot exceed payable amount (₹${maxDiscountAmount.toFixed(2)})`);
        return;
      }
    }

    setTotalDiscount(numValue);
  };

  const handleRemoveItem = (id: number) => {
    switch (billingType) {
      case 'procedure':
        setProcedureItems(procedureItems.filter((item) => item.id !== id));
        break;
      case 'pharmacy':
        setPharmacyItems(pharmacyItems.filter((item) => item.id !== id));
        break;
      case 'lab':
        setLabItems(labItems.filter((item) => item.id !== id));
        break;
    }
  };

  const handleResetForm = () => {
    // Clear patient and OP number FIRST to unlock modules
    setOpNumber('');
    setPatient(null);
    setSelectedDoctor('');

    setProcedureItems([]);
    setPharmacyItems([]);
    setLabItems([]);
    setIpItems([]);
    setBillDateTime('');
    setShowBillDate(false);

    setTotalDiscount(0);
    setDiscountType('rs');
    setDiscountGivenBy('');

    setCashAmount(0);
    setBankAmount(0);
    setInsuranceAmount(0);
    setStaffCreditAmount(0);
    setBalanceAmount(0);
    setRoundOff(0);

    setPaymentMode('cash');
    const upiMode = paymentModes.find((m: any) => (m?.name || '').toString().toLowerCase() === 'upi');
    const fallbackMode = upiMode || paymentModes[0];
    setBankMode(fallbackMode?.id != null ? fallbackMode.id.toString() : '');
    setSelectedBank('');
    setTransactionNo('');

    setDueCollected(0);
    setSelectedDues([]);
    setSavedBillNumbers(null);
    setSavedOrderNumbers(null);
    setIsBillSaved(false);
    setIsOrdering(false);

    setResetTrigger((prev) => prev + 1);

    // Set billing type to first permitted tab AFTER clearing locks
    if (permissions.hasProcedureAccess) {
      setBillingType('procedure');
    } else if (permissions.hasPharmacyAccess) {
      setBillingType('pharmacy');
    } else if (permissions.hasLabAccess) {
      setBillingType('lab');
    } else if (permissions.hasIPAccess) {
      setBillingType('ip');
    }
  };

  const fetchDueBills = async (patId: number, lastVisitId: number) => {
    try {
      setLoadingDueBills(true);
      const response = await cashCounterApi.fetchDueDetails(patId);

      const mappedDueBills = (response || []).map((item: any) => {
        // Determine which bill number to show and track the type
        let billNo = '';
        let type: 'procedure' | 'lab' | 'pharmacy' | 'ip' | 'registration' | null = null;
        
        if (item.invBillNo && item.invBillNo !== '-') {
          billNo = item.invBillNo;
          type = 'procedure';
        } else if (item.labBillNo && item.labBillNo !== '-') {
          billNo = item.labBillNo;
          type = 'lab';
        } else if (item.phBillNo && item.phBillNo !== '-') {
          billNo = item.phBillNo;
          type = 'pharmacy';
        } else if (item.ipBillNo && item.ipBillNo !== '-') {
          billNo = item.ipBillNo;
          type = 'ip';
        } else if (item.recBillNo && item.recBillNo !== '-') {
          billNo = item.recBillNo;
          type = 'registration';
        }
        
        return {
          id: item.finalBillId || item.billId,  // Use finalBillId for unique cross-type identity
          billId: item.billId,  // Keep per-type bill ID for API payload
          date: item.dateTime || '',
          billNo: billNo,
          amount: item.due || 0,
          balance: item.due || 0,
          type: type,
          finalBillId: item.finalBillId || null,
          billType: item.billType || 0,
        };
      });

      // Filter dues based on permissions
      const filteredDueBills = mappedDueBills.filter((bill: any) => {
        if (bill.type === 'procedure') return permissions.hasProcedureAccess;
        if (bill.type === 'pharmacy') return permissions.hasPharmacyAccess;
        if (bill.type === 'lab') return permissions.hasLabAccess;
        if (bill.type === 'ip') return permissions.hasIPAccess;
        if (bill.type === 'registration') return permissions.hasRegistrationAccess;
        return false; // Hide bills with no type
      });

      setDueBills(filteredDueBills);
      setLoadingDueBills(false);
    } catch (error) {
      console.error('Error fetching due bills:', error);
      setDueBills([]);
      setLoadingDueBills(false);
    }
  };

  const fetchAdvancePaymentDetails = async (patId: number, lastVisitId: number) => {
    try {
      const response = await cashCounterApi.fetchAdvancePaymentDetails(patId, lastVisitId.toString());

      const mappedAdvanceHistory = (response || []).map((item: any, index: number) => ({
        id: index + 1,
        date: item.dateTime || '',
        receiptNo: item.billDisplay || '',
        amount: item.total || 0,
        used: 0,
        balance: item.total || 0,
      }));

      setAdvanceHistory(mappedAdvanceHistory);
    } catch (error) {
      console.error('Error fetching advance payment details:', error);
      setAdvanceHistory([]);
    }
  };

  const handleDuePaymentComplete = async (paymentData: any) => {
    if (!paymentData || !paymentData.selectedBillIds) {
      showErrorToast('Invalid payment data received', 'Payment Error');
      return;
    }

    try {
      setDueCollected(dueCollected + paymentData.totalAmount);
      setSelectedDues([]);
      
      // Refresh due bills to show updated list (excluding collected bills)
      if (patient?.patId && patient?.lastVisitId) {
        await fetchDueBills(patient.patId, patient.lastVisitId);
      }

      // Don't close modal or reset form - let user see bill number and manually close
    } catch (error) {
      console.error('Error processing payment:', error);
      showErrorToast('Failed to process payment', 'Payment Error');
    }
  };

  const handleAdvancePaymentModeChange = (mode: 'cash' | 'bank' | 'cash-bank') => {
    setAdvancePaymentMode(mode);
    if (mode === 'cash') {
      setAdvanceBankAmount(0);
    } else if (mode === 'bank') {
      setAdvanceCashAmount(0);
    }
    // 'cash-bank': keep both, user enters them manually
  };

  const handleSaveAdvanceCollection = async () => {
    if (!patient) {
      showErrorToast('Please search and select a patient first', 'Validation Error');
      return;
    }

    if (advanceMode === 'collection') {
      const totalAdvanceAmount = advanceCashAmount + advanceBankAmount;
      if (totalAdvanceAmount <= 0) {
        showErrorToast('Please enter advance amount', 'Validation Error');
        return;
      }
    } else {
      if (advanceAmount <= 0) {
        showErrorToast('Please enter amount', 'Validation Error');
        return;
      }
    }

    const confirmed = await showConfirmDialog(
      `Are you sure you want to ${advanceMode === 'collection' ? 'collect' : 'return'} advance?`,
      'Confirm Advance'
    );

    if (!confirmed.isConfirmed) return;

    try {
      showLoading(`${advanceMode === 'collection' ? 'Collecting' : 'Returning'} advance...`);

      const totalAdvanceAmount = advanceMode === 'collection'
        ? advanceCashAmount + advanceBankAmount
        : advanceAmount;

      let paymentModeString = 'CASH';
      if (advancePaymentMode === 'bank') {
        paymentModeString = 'BANK';
      } else if (advancePaymentMode === 'cash-bank') {
        paymentModeString = 'CASH/BANK';
      }

      const hasOpNumber = !!(patient.displayNumber || opNumber);
      const isOpPatient = patient.isInOp === true || hasOpNumber;
      const visitId = patient.lastVisitId || 0;

      const payment = {
        paymentMode: paymentModeString,
        bankId: advanceSelectedBank ? Number(advanceSelectedBank) : 0,
        transType: advancePaymentMode === 'cash' ? 0 : Number(advanceBankMode) || 0,
        refNo: advanceTransactionNo,
        total: totalAdvanceAmount,
        discount: 0,
        payable: totalAdvanceAmount,
        roundOff: 0,
        cashPaid: advanceMode === 'collection' ? advanceCashAmount : 0,
        bankPaid: advanceMode === 'collection' ? advanceBankAmount : totalAdvanceAmount,
        staffPaid: 0,
        companyPaid: 0,
        dueAmt: 0,
      };

      const payload = {
        patientId: patient.patId,
        visitId: isOpPatient ? visitId : 0,
        ipId: patient.ipId || 0,
        isOp: patient.isInOp === true ? 1 : 0,
        doctorId: patient.doctorId || 0,
        discountId: 0,
        debitId: patient.debitId,
        investigationItems: [],
        pharmacyItems: [],
        labItems: [],
        ipItems: [],
        payments: [payment],
        note: `Advance ${advanceMode === 'collection' ? 'Collection' : 'Return'}`,
        userId: loginData.id,
        systemIp: '0.0.0.0',
        isAdvance: 1,
        age: patient.age?.toString() || '',
        opNo: patient.displayNumber || opNumber,
        refDr: 0,
        placeColl: '',
        isIpFinalBill: 0
      };

      const response = await cashCounterApi.saveBilling(payload);
      closeAlert();

      showSuccessToast(`Advance ${advanceMode === 'collection' ? 'collected' : 'returned'} successfully!`);

      if (patient.patId) {
        fetchAdvancePaymentDetails(patient.patId, patient.lastVisitId || 0);
      }

      setAdvanceCollectionSuccess(true);
      setAdvanceCollectionBillId(response?.finalBillId || null);
      setAdvanceCashAmount(0);
      setAdvanceBankAmount(0);
      setAdvanceAmount(0);
      setAdvanceTransactionNo('');
      setAdvanceSelectedBank('');
    } catch (error: any) {
      closeAlert();
      console.error('Error saving advance collection:', error);

      let errorMessage = error?.response?.data?.error || error?.message || 'Failed to save advance transaction';
      errorMessage = errorMessage
        .replace(/Billing validation failed:\s*/gi, '')
        .replace(/;\s*Total paid.*$/i, '')
        .trim();

      showErrorModal(errorMessage, 'Advance Error');
    }
  };

  const handlePatientSearchSelect = (patient: Patient) => {
    // Set the OP number from the selected patient
    setOpNumber(patient.displayNumber);
    // Trigger the patient search
    setTimeout(() => {
      handleSearchPatient(patient.displayNumber);
    }, 100);
  };

  const handleSearchPatient = async (searchTerm?: string) => {
    const searchValue = searchTerm || opNumber;
    
    if (!searchValue || !searchValue.trim()) {
      showWarningToast('Please enter OP number or mobile number');
      return;
    }

    try {
      setLoadingPatient(true);
      showLoading('Loading patient details...');

      const response = await medicalRecordsApi.fetchPatientDetails(searchValue.trim());

      closeAlert();

      if (response.isDead === true) {
        showErrorToast('This patient is deceased. Billing cannot be processed.', 'Patient Expired');
        setPatient(null);
        setTimeout(() => {
          opInputRef.current?.focus();
        }, 200);
        return;
      }

      if (response.isInOp !== true && response.isInIp !== true) {
        showErrorToast('Patient not registered. Please register first.');
        setPatient(null);
        setTimeout(() => {
          opInputRef.current?.focus();
        }, 200);
        return;
      }

      if (response.isActive !== true) {
        showErrorToast('Patient is blocked. Please contact administration.');
        setPatient(null);
        setTimeout(() => {
          opInputRef.current?.focus();
        }, 200);
        return;
      }

      const visitIdToCheck = response.visitId || response.lastVisitId || 0;
      if (response.isInOp === true && visitIdToCheck === 0) {
        showWarningToast('This patient does not have an active OP visit. Please create a visit first from OPD.');
        setPatient(null);
        setTimeout(() => {
          opInputRef.current?.focus();
        }, 200);
        return;
      }

      // Look up doctor name from consultants list if not provided
      let doctorName = response.doctorName || '';
      if (!doctorName && response.doctorId && consultants.length > 0) {
        const doctor = consultants.find((c: any) => c.id === response.doctorId);
        if (doctor) {
          doctorName = doctor.name || doctor.doctorName || '';
        }
      }

      setPatient({ ...response, doctorName });
      setSelectedDoctor(doctorName);

      if (response.patId && response.lastVisitId) {
        await fetchDueBills(response.patId, response.lastVisitId);
        await fetchAdvancePaymentDetails(response.patId, response.lastVisitId);
      }

      if (response.patId && response.ipId && (billingType === 'procedure' || billingType === 'ip')) {
        try {
          const ipOrderResponse = await cashCounterApi.fetchIpBillOrderDetails(response.patId, response.ipId);
          if (ipOrderResponse && Array.isArray(ipOrderResponse)) {
            setIpItems(ipOrderResponse);
          }
        } catch (error) {
          console.error('Error fetching IP bill order details:', error);
        }
      }

      setTimeout(() => {
        procedureNameInputRef.current?.focus();
      }, 100);
    } catch (error: any) {
      closeAlert();
      const errorMsg = error?.response?.data?.error || 'Failed to load patient details';
      showErrorToast(errorMsg);
      setPatient(null);
      setTimeout(() => {
        opInputRef.current?.focus();
      }, 200);
    } finally {
      setLoadingPatient(false);
    }
  };

  const handleOpNumberKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      handleSearchPatient();
    }
  };

  const handleSaveBilling = async () => {
    if (!patient) {
      showWarningModal('Please search and select a patient first');
      return;
    }

    if (procedureItems.length === 0 && pharmacyItems.length === 0 && labItems.length === 0 && ipItems.length === 0) {
      showWarningModal('Please add at least one item to the bill');
      return;
    }

    const hasOpNumber = !!(patient.displayNumber || opNumber);
    const isOpPatient = patient.isInOp === true || hasOpNumber;
    const visitId = patient.lastVisitId || 0;

    if (isOpPatient && visitId === 0) {
      showErrorModal('Valid visit ID is required. Please ensure patient has an active OP visit.');
      return;
    }

    if (procedureItems.length > 0) {
      const invalidItems = procedureItems.filter(item => !item.particularId || item.particularId === 0);
      if (invalidItems.length > 0) {
        showErrorModal(
          `Investigation items missing procedure ID. Please re-select: ${invalidItems.map(i => i.name).join(', ')}`,
          'Invalid Items'
        );
        return;
      }
    }

    if ((paymentMode === 'bank' || paymentMode === 'cash-bank') && !transactionNo.trim()) {
      showValidationError('Transaction number is required for Bank / Split payment.');
      return;
    }

    if (balanceAmount > 0) {
      const balanceConfirm = await Swal.fire({
        title: 'Balance Pending',
        text: `There is a balance of ₹${balanceAmount.toFixed(2)}. Do you want to proceed?`,
        icon: 'question',
        showCancelButton: true,
        confirmButtonText: 'Yes, Save',
        cancelButtonText: 'Cancel',
        confirmButtonColor: 'var(--page-secondary-color)',
        cancelButtonColor: '#6c757d',
        customClass: { confirmButton: 'swal-dispense-confirm' },
        returnFocus: false,
        focusConfirm: true,
        allowEnterKey: true,
      });

      if (!balanceConfirm.isConfirmed) return;
    }

    try {
      showLoading('Saving bill...');

      // Calculate totals with rounding for pharmacy and discount
      const procedureTotalBeforeDiscount = procedureItems.reduce((sum, item) => sum + ((item.cost || 0) * item.unit), 0);
      const pharmacyTotalBeforeDiscount = getRoundedPharmacyTotal(); // Rounded pharmacy MRP total
      const labTotalBeforeDiscount = labItems.reduce((sum, item) => sum + ((item.rate || item.cost || 0) * item.unit), 0);
      const ipTotal = ipItems.reduce((sum, item) => sum + (item.amt || 0), 0);
      
      // Total = procedure + rounded pharmacy + lab + ip
      const totalBeforeDiscounts = procedureTotalBeforeDiscount + pharmacyTotalBeforeDiscount + labTotalBeforeDiscount + ipTotal;
      
      // Total discount = rounded value of all discounts
      const totalDiscountAmount = getRoundedTotalDiscount();
      
      // Payable = total - discount
      const payableAmount = totalBeforeDiscounts - totalDiscountAmount;

      const investigationItems = procedureItems.map(item => ({
        invOrderIds: item.invOrderId ? [item.invOrderId] : [],
        groupId: item.groupId || 0,
        particularId: item.particularId!,
        quantity: item.unit,
        rate: item.cost || 0,
        discount: parseFloat((item.discount || 0).toFixed(4)),
      }));

      const pharmacyItemsPayload = pharmacyItems.map(item => ({
        phOrderIds: item.phOrderId ? [item.phOrderId] : [],
        prodsId: item.prodsId || 0,
        batchId: item.batchId || 0,
        units: item.unit,
        mrp: parseFloat((item.mrp || 0).toFixed(4)),
        sp: parseFloat((item.salesPrice || 0).toFixed(4)),
        total: parseFloat(((item.mrp || 0) * (item.unit || 1)).toFixed(4)),
        discountAmt: parseFloat(((item.discount || 0) * (item.unit || 1)).toFixed(4)),
        storeId: item.storeId || 1,
        taxType: 0,
        sgstPer: parseFloat((item.sgstPer || 0).toFixed(4)),
        cgstPer: parseFloat((item.cgstPer || 0).toFixed(4)),
        igstPer: parseFloat((item.igstPer || 0).toFixed(4)),
      }));

      const labItemsPayload = labItems.map(item => ({
        labOrderIds: item.labOrderId ? [item.labOrderId] : [],
        testId: item.testId || 0,
        testName: item.testName || item.name || '',
        specId: item.specId || 0,
        deptId: item.deptId || 0,
        rate: item.rate || item.cost || 0,
        units: item.unit,
        note: '',
      }));

      const ipItemsPayload = ipItems.map((item) => ({
        particulars: item.particulars || item.particular || '',
        amt: Number(item.amt) || 0,
        accHeadId: patient.debitId || 0,
        headAmt: Number(item.headAmt) || 0,
        numberOfDays: Number(item.numberOfDays || item.days) || 0,
      }));

      let paymentModeString = 'CASH';
      if (paymentMode === 'bank') {
        paymentModeString = 'BANK';
      } else if (paymentMode === 'cash-bank') {
        paymentModeString = 'CASH/BANK';
      }

      // const advanceAdj = ipItems.length > 0 ? (patient.advBalance || 0) : 0;

      const advanceAdj = ipItems.length > 0 ? Math.min(patient.advBalance || 0, payableAmount) : 0;

      const payment = {
        paymentMode: paymentModeString,
        bankId: selectedBank ? Number(selectedBank) : 1,
        transType: paymentMode === 'cash' ? 0 : Number(bankMode) || 0,
        refNo: transactionNo,
        total: totalBeforeDiscounts,
        discount: totalDiscountAmount,
        payable: payableAmount,
        roundOff: parseFloat(getDisplayRoundOff().toFixed(4)),
        cashPaid: cashAmount,
        bankPaid: bankAmount,
        staffPaid: staffCreditAmount,
        companyPaid: insuranceAmount,
        dueAmt: balanceAmount,
        advanceAdj,
      };
      console.log('Payment bankMode:', bankMode);
      console.log('Payment payload:', payment);

      const payload = {
        patientId: patient.patId,
        visitId: isOpPatient ? visitId : 0,
        ipId: patient.ipId || 0,
        isOp: patient.isInOp === true ? 1 : 0,
        doctorId: Number(selectedDoctor) || patient.doctorId || 0,
        discountId: 0,
        debitId: patient.debitId,
        investigationItems,
        pharmacyItems: pharmacyItemsPayload,
        labItems: labItemsPayload,
        ipItems: ipItemsPayload,
        payments: [payment],
        note: '',
        userId: loginData.id,
        systemIp: '0.0.0.0',
        isAdvance: 0,
        age: patient.age?.toString() || '',
        opNo: patient.displayNumber || opNumber,
        refDr: 0,
        placeColl: '',
        isIpFinalBill: ipItems.length > 0 ? 1 : 0
      };

      const response = await cashCounterApi.saveBilling(payload);
      closeAlert();
      
      // Store bill numbers
      setSavedBillNumbers(response);
      
      // Build compact bill message for toast
      let toastMessage = 'Bill saved successfully!';
      if (response.finalBillDisplay) {
        toastMessage = `Bill No: ${response.finalBillDisplay} saved successfully!`;
      }
      
      showSuccessToast(toastMessage);
      setIsBillSaved(true);

      // If IP patient with pharmacy items, prompt to dispense medicines
      if (patient.isInIp && pharmacyItemsPayload.length > 0 && response.phBillId) {
        const dispenseConfirm = await Swal.fire({
          title: 'Dispense Medicine',
          text: 'Do you want to dispense medicine? Stock will be reduced.',
          icon: 'question',
          showCancelButton: true,
          confirmButtonText: 'Yes, Dispense',
          cancelButtonText: 'No',
          confirmButtonColor: 'var(--page-secondary-color)',
          cancelButtonColor: '#6c757d',
          customClass: { confirmButton: 'swal-dispense-confirm' },
          returnFocus: false,
        });
        if (dispenseConfirm.isConfirmed) {
          try {
            await pharmacyStoresApi.saveDispenseDrug({
              phBillId: response.phBillId,
              productDetails: pharmacyItemsPayload.map(item => ({
                storeId: item.storeId,
                prodId: item.prodsId,
                batchId: item.batchId,
                units: item.units,
              })),
            });
            showSuccessToast('Medicines dispensed successfully');
          } catch (error: any) {
            console.error('Error dispensing medicines:', error.response?.data?.message || error.message);
            const dispenseErrorMsg = error?.response?.data?.error || error?.response?.data?.message || error?.message || 'Failed to dispense medicines';
            showErrorModal(dispenseErrorMsg, 'Dispense Error');
          }
        }
      }
    } catch (error: any) {
      closeAlert();
      console.error('Error saving bill:', error);

      let errorMessage = error?.response?.data?.error || error?.message || 'Failed to save bill';

      if (errorMessage.includes('Overpayment not allowed') || errorMessage.includes('exceeds payable')) {
        const paidMatch = errorMessage.match(/paid\s+(\d+(?:\.\d+)?)/i);
        const payableMatch = errorMessage.match(/payable\s+(\d+(?:\.\d+)?)/i);

        if (paidMatch && payableMatch) {
          const paidAmount = parseFloat(paidMatch[1]);
          const payableAmount = parseFloat(payableMatch[1]);
          const excessAmount = paidAmount - payableAmount;

          errorMessage = `Payment amount exceeds bill total!\n\nBill Amount: ₹${payableAmount.toFixed(2)}\nPaid Amount: ₹${paidAmount.toFixed(2)}\nExcess: ₹${excessAmount.toFixed(2)}\n\nPlease adjust the payment to match the bill amount.`;
        } else {
          errorMessage = 'Payment amount exceeds the bill total. Please adjust the payment amounts.';
        }
      }

      errorMessage = errorMessage
        .replace(/Billing validation failed:\s*/gi, '')
        .replace(/;\s*Total paid.*$/i, '')
        .trim();

      showErrorModal(errorMessage, 'Payment Error');
    }
  };

  const handleOrderBill = async () => {
    if (!patient) {
      showWarningModal('Please search and select a patient first');
      return;
    }

    if (procedureItems.length === 0 && pharmacyItems.length === 0 && labItems.length === 0) {
      showWarningModal('Please add at least one item to create an order');
      return;
    }

    const confirmed = await showConfirmDialog(
      'Are you sure you want to create this order?',
      'Confirm Order'
    );

    if (!confirmed.isConfirmed) return;

    setIsOrdering(true);

    try {
      showLoading('Creating order...');

      const investigationItems = procedureItems.map(item => ({
        groupId: item.groupId || 0,
        particularId: item.particularId!,
        quantity: item.unit,
        rate: item.cost || 0,
        discount: item.discount || 0,
        total: item.total,
      }));

      const labItemsPayload = labItems.map(item => ({
        testId: item.testId || 0,
        testCode: '',
        deptId: item.deptId || 0,
        rate: item.rate || item.cost || 0,
        discount: item.discount || 0,
        units: item.unit,
      }));

      const pharmacyItemsPayload = pharmacyItems.map(item => ({
        prodsId: item.prodsId || 0,
        batchId: item.batchId || 0,
        units: item.unit,
        mrp: item.mrp || 0,
        sp: parseFloat((item.salesPrice || 0).toFixed(4)),
        total: item.total,
        storeId: item.storeId || 1,
      }));

      const payload = {
        patientId: patient.patId,
        visitId: patient.lastVisitId || 0,
        ipId: patient.ipId || 0,
        doctorId: Number(selectedDoctor) || patient.doctorId || 0,
        userId: loginData.id,
        systemIp: '0.0.0.0',
        remark: '',
        investigationItems,
        labItems: labItemsPayload,
        pharmacyItems: pharmacyItemsPayload,
      };

      const response = await cashCounterApi.saveUpdateOrder(payload);
      closeAlert();
      
      // Store order numbers
      setSavedOrderNumbers(response);
      
      // Build compact order message for toast
      let toastMessage = 'Order created successfully!';
      if (response.investigationOrderDisplay) {
        toastMessage = `Order: ${response.investigationOrderDisplay} created successfully!`;
      } else if (response.pharmacyOrderDisplay) {
        toastMessage = `Order: ${response.pharmacyOrderDisplay} created successfully!`;
      } else if (response.labOrderDisplay) {
        toastMessage = `Order: ${response.labOrderDisplay} created successfully!`;
      }
      
      showSuccessToast(toastMessage);
    } catch (error: any) {
      closeAlert();
      console.error('Error creating order:', error);
      const errorMessage = error?.response?.data?.error || error?.message || 'Failed to create order';
      showErrorModal(errorMessage, 'Order Error');
      setIsOrdering(false);
    }
  };

  const handleCashAmountChange = (value: number) => {
    const payableTotal = getRoundedPayableTotal();

    const totalPaid = value + bankAmount + insuranceAmount + staffCreditAmount;
    if (totalPaid > payableTotal) {
      showWarningToast(`Total payment ₹${totalPaid.toFixed(2)} exceeds bill amount ₹${payableTotal.toFixed(2)}`, 'Payment Exceeds Bill');
      return;
    }

    setCashAmount(value);
  };

  const handleBankAmountChange = (value: number) => {
    const payableTotal = getRoundedPayableTotal();

    const totalPaid = cashAmount + value + insuranceAmount + staffCreditAmount;
    if (totalPaid > payableTotal) {
      showWarningToast(`Total payment ₹${totalPaid.toFixed(2)} exceeds bill amount ₹${payableTotal.toFixed(2)}`, 'Payment Exceeds Bill');
      return;
    }

    setBankAmount(value);
  };

  const handleInsuranceAmountChange = (value: number) => {
    const payableTotal = getRoundedPayableTotal();

    if (paymentMode === 'bank') {
      const totalPaidWithoutBank = value + staffCreditAmount;
      if (totalPaidWithoutBank > payableTotal) {
        showWarningToast(`Total payment ₹${totalPaidWithoutBank.toFixed(2)} exceeds bill amount ₹${payableTotal.toFixed(2)}`, 'Payment Exceeds Bill');
        return;
      }

      setInsuranceAmount(value);
      setBankAmount(payableTotal - totalPaidWithoutBank);
      setCashAmount(0);
      return;
    }

    const totalPaidWithoutCash = bankAmount + value + staffCreditAmount;
    if (totalPaidWithoutCash > payableTotal) {
      showWarningToast(`Total payment ₹${totalPaidWithoutCash.toFixed(2)} exceeds bill amount ₹${payableTotal.toFixed(2)}`, 'Payment Exceeds Bill');
      return;
    }

    setInsuranceAmount(value);
    setCashAmount(payableTotal - totalPaidWithoutCash);
  };

  const handleStaffCreditAmountChange = (value: number) => {
    const payableTotal = getRoundedPayableTotal();

    if (paymentMode === 'bank') {
      const totalPaidWithoutBank = insuranceAmount + value;
      if (totalPaidWithoutBank > payableTotal) {
        showWarningToast(`Total payment ₹${totalPaidWithoutBank.toFixed(2)} exceeds bill amount ₹${payableTotal.toFixed(2)}`, 'Payment Exceeds Bill');
        return;
      }

      setStaffCreditAmount(value);
      setBankAmount(payableTotal - totalPaidWithoutBank);
      setCashAmount(0);
      return;
    }

    const totalPaidWithoutCash = bankAmount + insuranceAmount + value;
    if (totalPaidWithoutCash > payableTotal) {
      showWarningToast(`Total payment ₹${totalPaidWithoutCash.toFixed(2)} exceeds bill amount ₹${payableTotal.toFixed(2)}`, 'Payment Exceeds Bill');
      return;
    }

    setStaffCreditAmount(value);
    setCashAmount(payableTotal - totalPaidWithoutCash);
  };

  // Set initial billing type based on permissions
  useEffect(() => {
    if (!billingType) {
      if (permissions.hasProcedureAccess) {
        setBillingType('procedure');
      } else if (permissions.hasPharmacyAccess) {
        setBillingType('pharmacy');
      } else if (permissions.hasLabAccess) {
        setBillingType('lab');
      } else if (permissions.hasIPAccess) {
        setBillingType('ip');
      }
    }
  }, [permissions, billingType]);

  useEffect(() => {
    if (patient) {
      const roundedGrandTotal = getRoundedSubtotal();
      const calculatedRoundOff = getDisplayRoundOff();
      setRoundOff(calculatedRoundOff);

      const storageService = new StorageService();
      const roleId = storageService.getRoleId();
      isAutoCalculatingRef.current = true;
      if (patient.isInOp === true || (patient.isInOp === false && roleId === 3)) {

        // For IP patients (roleId 3), deduct advance from the collectible amount
        const advBalance = (patient.isInOp === false && ipItems.length > 0)
          ? Math.min(patient.advBalance || 0, roundedGrandTotal)
          : 0;
        const netPayable = Math.max(0, roundedGrandTotal - advBalance);
        const remainingPayable = Math.max(0, netPayable - insuranceAmount - staffCreditAmount);
        
        if (paymentMode === 'cash') {
          setCashAmount(remainingPayable);
          setBankAmount(0);
        } else if (paymentMode === 'bank') {
          setBankAmount(remainingPayable);
          setCashAmount(0);
        } else if (paymentMode === 'cash-bank') {
         const halfAmount = remainingPayable / 2;
          setCashAmount(halfAmount);
          setBankAmount(halfAmount);
        }
      } else if (patient.isInOp === false) {
        if (ipItems.length > 0) {
          // IP final bill: tally charges + due balance - advance balance
          // const advBalance = patient.advBalance || 0;
          const advBalance = Math.min(patient.advBalance || 0, roundedGrandTotal);    ///one
          const ipBalanceToCollect = Math.max(0, roundedGrandTotal - advBalance);
          setBalanceAmount(ipBalanceToCollect);
        } else {
          setBalanceAmount(roundedGrandTotal);
        }
        setCashAmount(0);
        setBankAmount(0);
      }
      setTimeout(() => {
        isAutoCalculatingRef.current = false;
      }, 0);
    }
  }, [patient, procedureItems, pharmacyItems, labItems, ipItems, totalDiscount, discountType, paymentMode]);

  useEffect(() => {
    if (patient && !isAutoCalculatingRef.current) {
      const roundedGrandTotal = getRoundedSubtotal();

      let baseTotal = roundedGrandTotal;
      if (patient.isInOp === false && ipItems.length > 0) {
        // IP final bill: deduct advance balance only
        baseTotal = roundedGrandTotal - (patient.advBalance || 0);
      }

      const balance = baseTotal - cashAmount - bankAmount - insuranceAmount - staffCreditAmount;
      const newBalance = balance > 0 ? balance : 0;
      if (newBalance !== balanceAmount) {
        setBalanceAmount(newBalance);
      }
    }
  }, [patient, procedureItems, pharmacyItems, labItems, ipItems, dueCollected, totalDiscount, discountType, cashAmount, bankAmount, insuranceAmount, staffCreditAmount, balanceAmount]);

  useEffect(() => {
    const fetchAccountHeads = async () => {
      try {
        const heads = await cashCounterApi.fetchAccountHeads();
        setAccountHeads(heads);
      } catch (error: any) {
        console.error('Error fetching account heads:', error);
        if (error?.response?.status !== 500) {
          showErrorToast('Failed to load account heads. Please try again.');
        }
      }
    };

    const fetchBanks = async () => {
      try {
        const response = await medicalRecordsApi.fetchAllBankDetails();
        setBanks(response);
        const bankOne = response.find((bank: any) => bank.id === 1);
        if (bankOne) {
          setSelectedBank('1');
        }
        const sbiBank = response.find((bank: any) => bank.name?.toLowerCase().includes('sbi'));
        const defaultAdvanceBank = sbiBank ?? (response.length > 0 ? response[0] : null);
        if (defaultAdvanceBank) setAdvanceSelectedBank(String(defaultAdvanceBank.id));
      } catch (error: any) {
        console.error('Error fetching banks:', error);
        if (error?.response?.status !== 500) {
          showErrorToast('Failed to load bank details. Please try again.');
        }
      }
    };

    const fetchConsultants = async () => {
      try {
        const response = await medicalRecordsApi.fetchAllConsultants();
        setConsultants(Array.isArray(response) ? response : []);
      } catch (error: any) {
        console.error('Error fetching consultants:', error);
        if (error?.response?.status !== 500) {
          showErrorToast('Failed to load consultants. Please try again.');
        }
      }
    };

    const fetchPaymentModes = async () => {
      try {
        const response = await medicalRecordsApi.fetchAllPaymentModes();
        const modes = Array.isArray(response) ? response : [];
        setPaymentModes(modes);

        const hasSelectedMode = modes.some(
          (mode: any) => mode?.id?.toString() === bankMode
        );

        if (!hasSelectedMode) {
          const upiMode = modes.find(
            (mode: any) => (mode?.name || '').toString().toLowerCase() === 'upi'
          );
          const fallbackMode = upiMode || modes[0];
          console.log('Fallback bank mode:', fallbackMode);
          if (fallbackMode?.id != null) {
            setBankMode(fallbackMode.id.toString());
          }
        }

        const activeModes = modes.filter((m: any) => m.isActive === 1);
        setAdvancePaymentModes(activeModes);
        const qrMode = activeModes.find((m: any) => m.name?.toLowerCase().includes('qr'));
        const defaultAdvanceMode = qrMode ?? (activeModes.length > 0 ? activeModes[0] : null);
        if (defaultAdvanceMode) setAdvanceBankMode(String(defaultAdvanceMode.id));
      } catch (error: any) {
        console.error('Error fetching payment modes:', error);
        if (error?.response?.status !== 500) {
          showErrorToast('Failed to load payment modes. Please try again.');
        }
      }
    };

    fetchAccountHeads();
    fetchBanks();
    fetchConsultants();
    fetchPaymentModes();
  }, []);

  useEffect(() => {
    const focusWithModalCheck = (attempt: number = 0) => {
      if (attempt > 10) return;
      const modalElement = document.querySelector('.modal.show');
      if (modalElement) {
        setTimeout(() => focusWithModalCheck(attempt + 1), 100);
        return;
      }

      if (patient && medicineNameInputRef.current && billingType === 'pharmacy') {
        medicineNameInputRef.current?.focus();
      } else if (patient && testNameInputRef.current && billingType === 'lab') {
        testNameInputRef.current?.focus();
      } else if (patient && procedureNameInputRef.current && billingType === 'procedure') {
        procedureNameInputRef.current?.focus();
      } else if (opInputRef.current && !patient) {
        opInputRef.current?.focus();
      }
    };

    focusWithModalCheck();
  }, [patient, billingType]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!e.altKey && !e.ctrlKey && e.key !== 'F5') return;

      // Ctrl+Enter for Save Bill
      // if (e.ctrlKey && e.key === 'Enter') {
      //   e.preventDefault();
      //   if (patient && getTotalItemsCount() > 0 && permissions.canSaveBill && !isBillSaved) {
      //     handleSaveBilling();
      //   }
      //   return;
      // }

      // F5 for Reset
      if (e.key === 'F5') {
        e.preventDefault();
        if (patient) {
          handleResetForm();
        }
        return;
      }

      if (!e.altKey) return;
      e.preventDefault();

      const key = e.key.toLowerCase();

      // Alt+S — Save Bill (works regardless of OP number)
      // if (key === 's') {
      //   if (patient && getTotalItemsCount() > 0 && permissions.canSaveBill && !isBillSaved) {
      //     handleSaveBilling();
      //   }
      //   return;
      // }

      // Alt+P — Print Bill (works only when bill is saved)
      if (key === 'p') {
        if (isBillSaved && savedBillNumbers?.finalBillId) {
          setBillPopupId(savedBillNumbers.finalBillId);
          setShowBillPopup(true);
        }
        return;
      }

      // Alt+O — Order Bill
      if (key === 'o') {
        if (patient && getTotalItemsCount() > 0 && permissions.canOrderBill && !isOrdering && !savedOrderNumbers) {
          handleOrderBill();
        }
        return;
      }

      // Alt+E — Reset Form
      if (key === 'e') {
        if (patient) {
          handleResetForm();
        }
        return;
      }

      // Tab shortcuts — disabled once OP number is entered
      if (opNumber) return;

      // Alt+H — Pharmacy tab
      if (key === 'h' && permissions.hasPharmacyAccess) {
        setBillingType('pharmacy');
        return;
      }

      // Alt+L — Lab tab
      if (key === 'l' && permissions.hasLabAccess) {
        setBillingType('lab');
        return;
      }

      // Alt+I — IP tab
      if (key === 'i' && permissions.hasIPAccess) {
        setBillingType('ip');
        return;
      }

      // Alt+R — Return tab
      if (key === 'r' && permissions.hasReturnAccess) {
        setBillingType('return');
        return;
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [patient, permissions, opNumber, isBillSaved, savedBillNumbers, isOrdering, savedOrderNumbers, procedureItems, pharmacyItems, labItems, ipItems]);

  const PRINT_PAGE_STYLE = "@page { size: 148mm 210mm portrait; margin: 5mm; } @media print { html { -webkit-print-color-adjust: exact; print-color-adjust: exact; height: 210mm; width: 148mm; overflow: hidden; } body { -webkit-print-color-adjust: exact; print-color-adjust: exact; width: 148mm; height: 210mm; overflow: hidden; margin: 0; } }";

  const closePrintModal = () => { setPrintBillDetails(null); setDueHistoryPrintData(null); };

  const handleTriggerPrint = useReactToPrint({
    content: () => printRef.current,
    pageStyle: PRINT_PAGE_STYLE,
    onAfterPrint: closePrintModal,
  });

  const handleAutoPrint = async (finalBillId: number) => {
    try {
      const response = await cashCounterApi.fetchBillViewWithType(finalBillId);
      if (response) {
        if (response.isDueHistory === true) {
          setDueHistoryPrintData(response.data);
          setPrintBillDetails(null);
        } else {
          const data = response.data ?? response;
          setPrintBillDetails({
            ...data,
            total: data.total ?? 0,
            discount: data.discount ?? 0,
            payable: data.payable ?? 0,
            paid: data.paid ?? 0,
            balance: data.balance ?? 0,
            cashItems: data.cashItems ?? [],
            pharmacyItems: data.pharmacyItems ?? [],
            labItems: data.labItems ?? [],
            ipBillItems: data.ipBillItems ?? [],
            patientName: patient ? patient.name + (patient.secName ? ' ' + patient.secName : '') : (data.patientName ?? ''),
            opNo: patient?.displayNumber || opNumber || data.opNo || '',
          } as BillPrintData);
          setDueHistoryPrintData(null);
        }
        setTimeout(() => { handleTriggerPrint(); }, 300);
      }
    } catch (error: any) {
      console.error('Error loading bill for print:', error);
      showErrorToast(error?.response?.data?.error || 'Failed to load bill for printing');
    }
  };

  return (
    <>
    <div className="d-flex flex-column h-100 p-3 bg-light" style={{ minHeight: 0 }}>
      <style>{styles}</style>

      <div className="card flex-grow-1 shadow-sm d-flex flex-column" style={{ minHeight: 0 }}>
        <div className="card-body d-flex flex-column p-0" style={{ minHeight: 0 }}>
          {/* MAIN CONTENT AREA */}
          <div className="card h-100 border-0 billing-panels-wrap" style={{ minHeight: 0 }}>
            <div className="row g-0 billing-panels-row" style={{ minHeight: 0 }}>
              {/* LEFT PANEL - Patient Info */}
              <div className="col-12 col-lg-3 d-flex flex-column border-end billing-panel" style={{ minHeight: 0 }}>
                <Card className="neat-card h-100 d-flex flex-column">
                  <Card.Header className="bg-light p-2 border-bottom">
                    <div className="d-flex align-items-center gap-2">
                      <FaUserIcon style={{ color: themePrimary }} />
                      <span className="fw-bold small">Patient Info</span>
                    </div>
                  </Card.Header>
                  <Card.Body className="p-3 billing-panel-body" style={{ minHeight: 0 }}>
                    {/* OP Search Group */}
                    <div className="mb-3">
                      <div className="d-flex gap-2">
                        <Form.Control
                          ref={opInputRef}
                          type="text"
                          placeholder="OP Number"
                          value={opNumber}
                          onChange={(e) => {
                            const value = e.target.value;
                            setOpNumber(value);
                            if (!value || value.trim() === '') {
                              handleResetForm();
                            }
                          }}
                          // onFocus={() => {
                          //   if (mobileOpen) {
                          //     closeMobileSidebar();
                          //   }
                          //   if (!collapsed) {
                          //     toggleSidebar();
                          //   }
                          // }}
                          onKeyDown={handleOpNumberKeyDown}
                          disabled={loadingPatient || patient !== null}
                          size="sm"
                          style={opNumber ? { fontWeight: 700, fontSize: '1rem', color: 'var(--page-secondary-color)' } : undefined}
                        />
                        <Button
                          onClick={() => setShowPatientSearchModal(true)}
                          disabled={loadingPatient}
                          size="sm"
                          className='theme-btn-primary'
                          style={{
                            height: '31px',
                            width: '50px',
                          }}
                        >
                          <FaSearchIcon />
                        </Button>
                      </div>
                    </div>

                    {patient ? (
                      <div className="patient-info-card">
                        <div className="patient-name fw-bold mb-3" onClick={() => setShowPatientModal(true)} style={{ cursor: 'pointer', color: themeSecondary }}>
                          {patient.name}
                          <div style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--page-secondary-color)', marginTop: '2px' }}>
                            ({patient.displayNumber})
                          </div>
                        </div>

                        <div className="info-row mb-2">
                          <span className="label">Age / Sex</span>
                          <span className="value">
                            {calculateAge(patient.dob)}Y / {patient.sex}
                          </span>
                        </div>

                        <div className="info-row mb-2">
                          <span className="label">Account</span>
                          <span className="value">{patient.debitHead}</span>
                        </div>

                        <div className="info-row mb-2">
                          <span className="label">Doctor</span>
                          <span className="value">{patient.doctorName || 'N/A'}</span>
                        </div>

                        <div className="info-row mb-2">
                          <span className="label">Status</span>
                          <Badge bg={patient.isInIp ? 'warning' : 'success'} className="px-2">
                            {patient.isInIp ? 'IP' : patient.isInOp ? 'OP' : 'N/A'}
                          </Badge>
                        </div>

                        {patient.isInIp && patient.wardName && (
                          <div className="info-row mb-2">
                            <span className="label">Ward / Bed</span>
                            <span className="value">
                              {patient.wardName} / {patient.bedNo}
                            </span>
                          </div>
                        )}

                        <hr className="my-3" />

                        <div className="balance-cards">
                          {permissions.hasDueAccess && (
                            <div className="balance-card" onClick={() => setShowDueModal(true)}>
                              <div className="balance-label">Balance</div>
                              <div className="balance-amount text-danger">₹{(patient.dueBalance || 0).toFixed(2)}</div>
                            </div>
                          )}
                          {permissions.hasAdvanceAccess && (
                            <div className="balance-card" onClick={() => setShowAdvanceModal(true)}>
                              <div className="balance-label">Advance</div>
                              <div className="balance-amount text-success">₹{(patient.advBalance || 0).toFixed(2)}</div>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <div className="text-center text-muted py-5">
                        <FaUserIcon size={32} className="mb-2 opacity-50" />
                        <p className="small">No patient selected</p>
                      </div>
                    )}
                  </Card.Body>
                </Card>
              </div>

              {/* CENTER PANEL - Billing Items (Scrollable) */}
              <div className="col-12 col-lg-6 d-flex flex-column billing-panel billing-panel-center" style={{ minHeight: 0 }}>
                {/* Billing Type Buttons */}
                <div className="mb-1">
                  <div className="d-flex gap-2 p-2 bg-light rounded">
                    {[
                      { name: 'Procedure', hasAccess: permissions.hasProcedureAccess },
                      { name: 'Pharmacy', hasAccess: permissions.hasPharmacyAccess },
                      { name: 'Lab', hasAccess: permissions.hasLabAccess },
                      { name: 'IP', hasAccess: permissions.hasIPAccess },
                      { name: 'Return', hasAccess: permissions.hasReturnAccess },
                    ]
                      .filter(tab => tab.hasAccess)
                      .map((tab) => {
                        const type = tab.name;
                        const isSelected = billingType === type.toLowerCase();
                        // Lock module switching once OP number is entered or patient is loaded
                        const isModuleLocked = (opNumber.trim() !== '' || patient !== null) && !isSelected;
                        return (
                          <Button
                            key={type}
                            size="sm"
                            className={`flex-fill theme-outline-btn-primary ${isSelected ? 'is-selected' : ''}`}
                            style={{ fontWeight: 'var(--font-weight-bold)' }}
                            onClick={() => {
                              if (isModuleLocked) {
                                showWarningToast('Cannot switch modules after entering OP number. Please reset the form first.');
                                return;
                              }
                              setBillingType(type.toLowerCase() as any);
                            }}
                            disabled={isModuleLocked}
                            title={isModuleLocked ? 'Module locked - Reset form to switch' : ''}
                          >
                            {type === 'Procedure' && <FaStethoscopeIcon className="me-1" />}
                            {type === 'Pharmacy' && <FaPillsIcon className="me-1" />}
                            {type === 'Lab' && <FaFlaskIcon className="me-1" />}
                            {type === 'IP' && <FaBedIcon className="me-1" />}
                            {type === 'Return' && <FaUndoIcon className="me-1" />}
                            {type === 'Procedure' && <>Proc<u>e</u>dure</>}
                            {type === 'Pharmacy' && <>P<u>h</u>armacy</>}
                            {type === 'Lab' && <><u>L</u>ab</>}
                            {type === 'IP' && <><u>I</u>P</>}
                            {type === 'Return' && <><u>R</u>eturn</>}
                          </Button>
                        );
                      })}
                  </div>
                </div>

                {permissions.hasProcedureAccess && (
                  <div
                    style={{
                      display: billingType === 'procedure' ? 'flex' : 'none',
                      flexDirection: 'column',
                      flex: 1,
                      minHeight: 0,
                      width: '100%',
                    }}
                  >
                    <ProcedureBilling
                      items={procedureItems as any}
                      resetTrigger={resetTrigger}
                      onAddItem={handleAddProcedureItem}
                      onRemoveItem={(id) => setProcedureItems(procedureItems.filter((item) => item.id !== id))}
                      procedureNameInputRef={procedureNameInputRef}
                      patient={patient}
                      accountHeads={accountHeads}
                      permissions={permissions}
                      onRegisterOrderHandler={handleRegisterProcedureOrderHandler}
                      onSelectLabOrderFromModal={labOrderHandler || undefined}
                      onSelectPharmacyOrderFromModal={pharmacyOrderHandler || undefined}
                    />
                  </div>
                )}

                {permissions.hasPharmacyAccess && (
                  <div
                    style={{
                      display: billingType === 'pharmacy' ? 'flex' : 'none',
                      flexDirection: 'column',
                      flex: 1,
                      minHeight: 0,
                      width: '100%',
                    }}
                  >
                    <PharmacyBilling
                      items={pharmacyItems as any}
                      resetTrigger={resetTrigger}
                      onAddItem={handleAddPharmacyItem}
                      onRemoveItem={(id) => setPharmacyItems(pharmacyItems.filter((item) => item.id !== id))}
                      patient={patient}
                      medicineNameInputRef={medicineNameInputRef}
                      permissions={permissions}
                      onRegisterOrderHandler={handleRegisterPharmacyOrderHandler}
                      onSelectInvestigationOrderFromModal={procedureOrderHandler || undefined}
                      onSelectLabOrderFromModal={labOrderHandler || undefined}
                    />
                  </div>
                )}

                {permissions.hasLabAccess && (() => {
                  let headId = null;
                  if (patient?.debitHead) {
                    const accountHead = accountHeads.find((head) => head.headName === patient.debitHead);
                    if (accountHead) {
                      headId = accountHead.headId;
                    }
                  }

                  const patientProp = headId ? { headId } : null;

                  return (
                    <div
                      style={{
                        display: billingType === 'lab' ? 'flex' : 'none',
                        flexDirection: 'column',
                        flex: 1,
                        minHeight: 0,
                        width: '100%',
                      }}
                    >
                      <LabBilling
                        items={labItems as any}
                        resetTrigger={resetTrigger}
                        onAddItem={handleAddLabItem}
                        onRemoveItem={(id) => setLabItems(labItems.filter((item) => item.id !== id))}
                        selectedPatient={patientProp}
                        testNameInputRef={testNameInputRef}
                        patientId={patient?.patId?.toString()}
                        visitId={patient?.lastVisitId?.toString()}
                        permissions={permissions}
                        onRegisterOrderHandler={handleRegisterLabOrderHandler}
                        onSelectInvestigationOrderFromModal={procedureOrderHandler || undefined}
                        onSelectPharmacyOrderFromModal={pharmacyOrderHandler || undefined}
                      />
                    </div>
                  );
                })()}

                {billingType === 'ip' && permissions.hasIPAccess && (() => {
                  let accountHeadId = null;
                  if (patient?.debitHead) {
                    const accountHead = accountHeads.find((head) => head.headName === patient.debitHead);
                    if (accountHead) {
                      accountHeadId = accountHead.headId;
                    }
                  }

                  return (
                    <IPBilling
                      key={`ip-billing-${patient?.patId || 0}-${resetTrigger}`}
                      billDateTime={billDateTime}
                      showBillDate={showBillDate}
                      onBillDateTimeChange={setBillDateTime}
                      onShowBillDateChange={setShowBillDate}
                      patientId={patient?.patId}
                      ipKey={patient?.ipId}
                      admitDateTime={patient?.admitDateTime}
                      advance={patient?.advBalance || 0}
                      prevBalance={patient?.dueBalance || 0}
                      accountHeadId={accountHeadId || undefined}
                      visitId={patient?.lastVisitId}
                      ipItems={ipItems}
                      onUpdateIpItems={setIpItems}
                      permissions={{
                        hasDueAccess: permissions.hasDueAccess,
                        hasAdvanceAccess: permissions.hasAdvanceAccess
                      }}
                    />
                  );
                })()}

                {billingType === 'return' && (
                  <ReturnBilling patient={patient} opNumber={opNumber} onPrint={(id) => handleAutoPrint(id)} />
                )}
              </div>

              {/* RIGHT PANEL - Payment Summary (Scrollable) */}
              <div className="col-12 col-lg-3 d-flex flex-column border-start billing-panel" style={{ minHeight: 0 }}>
                <Card className="neat-card h-100 d-flex flex-column">
                  <Card.Header className="bg-light p-2 border-bottom">
                    <div className="d-flex align-items-center gap-2">
                      <FaMoneyBillWaveIcon className="text-success" />
                      <span className="fw-bold small">Payment Details</span>
                    </div>
                  </Card.Header>
                  <Card.Body className="p-3 d-flex flex-column billing-panel-body">
                    {/* Financial Summary */}
                    <div className="summary-box mb-3">
                      <div className="summary-row">
                        <span>Procedure</span>
                        <span className="fw-bold">₹{getProcedureTotal().toFixed(2)}</span>
                      </div>
                      <div className="summary-row">
                        <span>Pharmacy</span>
                        <span className="fw-bold">₹{getPharmacyTotal().toFixed(2)}</span>
                      </div>
                      <div className="summary-row">
                        <span>Lab</span>
                        <span className="fw-bold">₹{getLabTotal().toFixed(2)}</span>
                      </div>
                      {ipItems.length > 0 && (
                        <div className="summary-row">
                          <span>IP</span>
                          <span className="fw-bold">₹{ipItems.reduce((sum, item) => sum + (item.amt || 0), 0).toFixed(2)}</span>
                        </div>
                      )}
                      {/* {ipItems.length > 0 && patient && (patient.advBalance || 0) > 0 && (
                        <div className="summary-row">
                          <span>Advance</span>
                          <span className="fw-bold text-success">-₹{(patient.advBalance || 0).toFixed(2)}</span>
                        </div>
                      )} */}
                      {ipItems.length > 0 && patient && (patient.advBalance || 0) > 0 && (() => {
                        const advTotal = patient.advBalance || 0;
                        const advAdjusted = Math.min(advTotal, getRoundedSubtotal());
                        const advRemaining = advTotal - advAdjusted;
                        return (
                          <>
                            <div className="summary-row">
                              <span>Advance</span>
                              <span className="fw-bold">₹{advTotal.toFixed(2)}</span>
                            </div>
                            <div className="summary-row">
                              <span>Advance Adjusted</span>
                              <span className="fw-bold text-success">-₹{advAdjusted.toFixed(2)}</span>
                            </div>
                            {advRemaining > 0 && (
                              <div className="summary-row">
                                <span>Remaining Advance</span>
                                <span className="fw-bold text-warning">₹{advRemaining.toFixed(2)}</span>
                              </div>
                            )}
                          </>
                        );
                      })()}
                      <div className="summary-row border-top pt-2">
                        <span>Discount</span>
                        <span className="fw-bold text-success">-₹{getRoundedTotalDiscount().toFixed(2)}</span>
                      </div>
                      {(() => {
                        const advAdj = ipItems.length > 0 && patient
                          // ? -(patient.advBalance || 0)
                          ? -Math.min(patient.advBalance || 0, getRoundedSubtotal())
                          : 0;
                        const roundOff = getDisplayRoundOff();
                        // Subtotal = base (pre-rounding) - advance
                        const displaySubtotal = getRoundedSubtotal() - roundOff + advAdj;
                        // Grand Total = Subtotal + Round Off = rounded base - advance
                        const displayGrandTotal = getRoundedSubtotal() + advAdj;
                        return (
                          <>
                            <div className="summary-row">
                              <span>Subtotal</span>
                              <span className="fw-bold">₹{displaySubtotal.toFixed(2)}</span>
                            </div>
                            <div className="summary-row">
                              <span>Round Off</span>
                              <span className={`fw-bold ${roundOff >= 0 ? 'text-success' : 'text-danger'}`}>
                                {roundOff >= 0 ? '+' : ''}₹{roundOff.toFixed(2)}
                              </span>
                            </div>
                            <div className="summary-row fw-bold border-top pt-2 grand-total">
                              <span>Grand Total</span>
                              <span>₹{displayGrandTotal.toFixed(2)}</span>
                            </div>
                          </>
                        );
                      })()}
                    </div>

                    {/* Discount Controls */}
                    <div className="discount-controls mb-3">
                      <div className="fw-bold mb-2">Discount</div>
                      <div className="d-flex gap-2">
                        <div className="btn-group flex-grow-1" role="group">
                          <button
                            type="button"
                            className={`btn btn-sm theme-outline-btn-secondary ${discountType === 'rs' ? 'is-selected' : ''}`}
                            onClick={() => setDiscountType('rs')}
                            disabled={!permissions.canDiscount}
                          >
                            ₹
                          </button>
                          <button
                            type="button"
                            className={`btn btn-sm theme-outline-btn-secondary ${discountType === 'percent' ? 'is-selected' : ''}`}
                            onClick={() => setDiscountType('percent')}
                            disabled={!permissions.canDiscount}
                          >
                            %
                          </button>
                        </div>
                        <Form.Control
                          type="number"
                          placeholder="0"
                          value={totalDiscount}
                          onChange={(e) => handleDiscountChange(e.target.value)}
                          size="sm"
                          style={{ width: '80px' }}
                          onFocus={(e) => e.target.select()}
                          disabled={!permissions.canDiscount}
                        />
                      </div>
                    </div>

                    {/* Payment Mode */}
                    <div className="payment-mode mb-3">
                      <div className="fw-bold mb-2">Payment Mode</div>
                      <div className="btn-group w-100" role="group">
                        <input
                          type="radio"
                          className="btn-check"
                          name="paymentMode"
                          id="paymentCash"
                          checked={paymentMode === 'cash'}
                          onChange={() => setPaymentMode('cash')}
                        />
                        <label
                          className={`btn btn-sm advance-action-btn ${paymentMode === 'cash' ? 'is-selected' : ''}`}
                          htmlFor="paymentCash"
                        >
                          Cash
                        </label>

                        <input
                          type="radio"
                          className="btn-check"
                          name="paymentMode"
                          id="paymentBank"
                          checked={paymentMode === 'bank'}
                          onChange={() => setPaymentMode('bank')}
                        />
                        <label
                          className={`btn btn-sm advance-action-btn ${paymentMode === 'bank' ? 'is-selected' : ''}`}
                          htmlFor="paymentBank"
                        >
                          Bank
                        </label>

                        <input
                          type="radio"
                          className="btn-check"
                          name="paymentMode"
                          id="paymentSplit"
                          checked={paymentMode === 'cash-bank'}
                          onChange={() => setPaymentMode('cash-bank')}
                        />
                        <label
                          className={`btn btn-sm advance-action-btn ${paymentMode === 'cash-bank' ? 'is-selected' : ''}`}
                          htmlFor="paymentSplit"
                        >
                          Split
                        </label>
                      </div>
                    </div>

                    {/* Bank Details (Conditional) */}
                    {(paymentMode === 'bank' || paymentMode === 'cash-bank') && (
                      <div className="bank-details mb-3">
                        <Form.Group className="mb-2">
                          <Form.Select
                            size="sm"
                            value={bankMode}
                            onChange={(e) => { setBankMode(e.target.value); console.log('Selected bank mode:', e.target.value); }}
                          >
                            {paymentModes.length > 0 ? (
                              paymentModes.map((mode: any) => {
                                const modeName = (mode?.name || '').toString();
                                const modeId = (mode?.id ?? '').toString();
                                return (
                                  <option key={modeId} value={modeId}>
                                    {modeName}
                                  </option>
                                );
                              })
                            ) : (
                              <>
                                <option value="upi">UPI</option>
                                <option value="card">Card</option>
                                <option value="neft">NEFT</option>
                                <option value="cheque">Cheque</option>
                              </>
                            )}
                          </Form.Select>
                        </Form.Group>
                        <Form.Group className="mb-2">
                          <Form.Control placeholder="Transaction No" size="sm" onFocus={(e) => e.target.select()} value={transactionNo} onChange={(e) => setTransactionNo(e.target.value)} />
                        </Form.Group>
                      </div>
                    )}

                    {/* Amount Inputs */}
                    <div className="amount-inputs mb-3">
                      {(paymentMode === 'cash' || paymentMode === 'cash-bank') && (
                        <div className="mb-2">
                          <Form.Label style={{fontSize: '0.75rem', marginBottom: '4px', fontWeight: '500'}}>Cash Received</Form.Label>
                          <Form.Control
                            type="number"
                            placeholder="0"
                            value={formatNumberDisplay(cashAmount)}
                            onChange={(e) => handleCashAmountChange(handleNumberChange(e.target.value))}
                            onBlur={(e) => handleCashAmountChange(handleNumberBlur(e.target.value))}
                            onFocus={(e) => e.target.select()}
                            size="sm"
                          />
                        </div>
                      )}
                      {(paymentMode === 'bank' || paymentMode === 'cash-bank') && (
                        <div className="mb-2">
                          <Form.Label style={{fontSize: '0.75rem', marginBottom: '4px', fontWeight: '500'}}>Bank Amount</Form.Label>
                          <Form.Control
                            type="number"
                            placeholder="0"
                            value={formatNumberDisplay(bankAmount)}
                            onChange={(e) => handleBankAmountChange(handleNumberChange(e.target.value))}
                            onBlur={(e) => handleBankAmountChange(handleNumberBlur(e.target.value))}
                            onFocus={(e) => e.target.select()}
                            size="sm"
                          />
                        </div>
                      )}
                      <div className="mb-2">
                        <Form.Label style={{fontSize: '0.75rem', marginBottom: '4px', fontWeight: '500'}}>Staff Credit</Form.Label>
                        <Form.Control
                          type="number"
                          placeholder="0"
                          value={formatNumberDisplay(staffCreditAmount)}
                          onChange={(e) => handleStaffCreditAmountChange(handleNumberChange(e.target.value))}
                          onBlur={(e) => handleStaffCreditAmountChange(handleNumberBlur(e.target.value))}
                          onFocus={(e) => e.target.select()}
                          disabled={!isStaffEnabled}
                          size="sm"
                        />
                      </div>
                      <div className="mb-2">
                        <Form.Label style={{fontSize: '0.75rem', marginBottom: '4px', fontWeight: '500'}}>Insurance</Form.Label>
                        <Form.Control
                          type="number"
                          placeholder="0"
                          value={formatNumberDisplay(insuranceAmount)}
                          onChange={(e) => handleInsuranceAmountChange(handleNumberChange(e.target.value))}
                          onFocus={(e) => e.target.select()}
                          onBlur={(e) => handleInsuranceAmountChange(handleNumberBlur(e.target.value))}
                          disabled={!isInsuranceEnabled}
                          size="sm"
                        />
                      </div>
                      <div>
                        <small className="text-muted" style={{fontSize: '0.65rem', marginBottom: '2px', display: 'block'}}>Balance</small>
                        <div className={`fw-bold ${balanceAmount > 0 ? 'text-danger' : 'text-success'}`} style={{fontSize: '0.875rem'}}>
                          ₹{balanceAmount.toFixed(2)}
                        </div>
                      </div>
                    </div>
                  </Card.Body>
                </Card>
              </div>
            </div>
          </div>

          {/* FOOTER BAR */}
          <div className="card border-0 mt-2">
            <div className="card-body border-top p-3">
              <div className="d-flex justify-content-between align-items-center">
                <div className="d-flex align-items-center gap-3">
                  <Button size="sm" onClick={() => setShowModal(true)} disabled={getTotalItemsCount() === 0} className=" fw-bold theme-btn-primary">
                    <FaFileInvoiceDollarIcon className="me-1" /> View Details
                  </Button>
                  <Button size="sm" onClick={() => setShowShortcutsModal(true)} className="theme-outline-btn-primary rounded-5" title="Keyboard Shortcuts">
                    <FaKeyboardIcon className="" />
                  </Button>
                  <div className="vr"></div>
                  {savedBillNumbers ? (
                    <div className="d-flex gap-2 align-items-center">
                      {savedBillNumbers.finalBillDisplay && (
                        <Badge bg="" style={{backgroundColor: '#ffcdd2', color: '#c62828', fontWeight: 'bold', fontSize: '0.85rem'}}>
                          Bill No: {savedBillNumbers.finalBillDisplay}
                        </Badge>
                      )}
                      {savedBillNumbers.cashBillDisplay && (
                        <Badge bg="" style={{backgroundColor: '#ffcdd2', color: '#c62828', fontWeight: 'bold', fontSize: '0.8rem'}}>
                          Procedure: {savedBillNumbers.cashBillDisplay}
                        </Badge>
                      )}
                      {savedBillNumbers.phBillDisplay && (
                        <Badge bg="" style={{backgroundColor: '#ffcdd2', color: '#c62828', fontWeight: 'bold', fontSize: '0.8rem'}}>
                          PH: {savedBillNumbers.phBillDisplay}
                        </Badge>
                      )}
                      {savedBillNumbers.labBillDisplay && (
                        <Badge bg="" style={{backgroundColor: '#ffcdd2', color: '#c62828', fontWeight: 'bold', fontSize: '0.8rem'}}>
                          Lab: {savedBillNumbers.labBillDisplay}
                        </Badge>
                      )}
                      {savedBillNumbers.ipBillDisplay && (
                        <Badge bg="" style={{backgroundColor: '#ffcdd2', color: '#c62828', fontWeight: 'bold', fontSize: '0.8rem'}}>
                          IP: {savedBillNumbers.ipBillDisplay}
                        </Badge>
                      )}
                    </div>
                  ) : savedOrderNumbers ? (
                    <div className="d-flex gap-2 align-items-center">
                      {savedOrderNumbers.investigationOrderDisplay && (
                        <Badge bg="" style={{backgroundColor: '#e3f2fd', color: '#1565c0', fontWeight: 'bold', fontSize: '0.8rem'}}>
                          Procedure Order: {savedOrderNumbers.investigationOrderDisplay}
                        </Badge>
                      )}
                      {savedOrderNumbers.pharmacyOrderDisplay && (
                        <Badge bg="" style={{backgroundColor: '#e3f2fd', color: '#1565c0', fontWeight: 'bold', fontSize: '0.8rem'}}>
                          PH Order: {savedOrderNumbers.pharmacyOrderDisplay}
                        </Badge>
                      )}
                      {savedOrderNumbers.labOrderDisplay && (
                        <Badge bg="" style={{backgroundColor: '#e3f2fd', color: '#1565c0', fontWeight: 'bold', fontSize: '0.8rem'}}>
                          Lab Order: {savedOrderNumbers.labOrderDisplay}
                        </Badge>
                      )}
                    </div>
                  ) : (
                    <div className="d-flex gap-3">
                      <span>
                        <strong>Items:</strong> {getTotalItemsCount()}
                      </span>
                      <span>
                        <strong>Total:</strong> <span className="fw-bold" style={{ color: themeSecondary }}>₹{getGrandTotal().toFixed(2)}</span>
                      </span>
                    </div>
                  )}
                </div>

                <div className="d-flex gap-2">
                  <Button onClick={handleResetForm} className="billing-action-btn">
                    <FaUndoIcon className="me-1" /> Reset
                  </Button>
                  {permissions.canOrderBill && (
                    
                    <Button onClick={handleOrderBill} disabled={!patient || getTotalItemsCount() === 0 || isOrdering || !!savedOrderNumbers} className="billing-action-btn">
                      <FaReceiptIcon className="me-1" /> {savedOrderNumbers ? 'Completed' : isOrdering ? 'Processing...' : 'Order Bill'}
                    </Button>
                  )}
                  {permissions.canDuplicate && (
                   <Button
                      disabled={!patient}
                      className="billing-action-btn"
                      onClick={() => navigate(duplicateRoute, { state: { opNo: opNumber } })}
                    >
                      <FaCopyIcon className="me-1" /> Duplicate
                    </Button>
                  )}
                  <Button
                    disabled={!isBillSaved || !savedBillNumbers?.finalBillId}
                    className="billing-action-btn"
                    onClick={() => {
                      if (savedBillNumbers?.finalBillId) {
                        setBillPopupId(savedBillNumbers.finalBillId);
                        setShowBillPopup(true);
                      }
                    }}
                  >
                    <FaPrintIcon className="me-1" /> Print
                  </Button>
                  {permissions.canSaveBill && (
                    <Button
                      disabled={!patient || getTotalItemsCount() === 0 || isBillSaved}
                      className="fw-bold billing-action-btn billing-save-btn"
                      onClick={handleSaveBilling}
                    >
                      <FaSaveIcon className="me-1" /> {isBillSaved ? 'Bill Saved' : 'Save Bill'}
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modals (unchanged from original) */}
      <Modal show={showPatientModal} onHide={() => setShowPatientModal(false)} centered size="lg">
        <Modal.Header closeButton className="text-white" style={{ backgroundColor: 'var(--page-primary-color)', color: 'var(--page-secondary-color)' }}>
          <Modal.Title>Patient Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {patient && (
            <div>
              <div className="text-center mb-4">
                <FaUserIcon size={50} style={{ color: themePrimary }} />
                <h5 className="fw-bold mt-2 mb-0">{patient.name} {patient.secName}</h5>
                <p className="text-muted mb-1">{patient.displayNumber}</p>
                <small className="text-muted">{patient.accountCategory || patient.debitHead}</small>
              </div>
              
              <h6 className="fw-bold mb-3 pb-2 border-bottom">Personal Information</h6>
              <Row className="g-3 mb-4">
                <Col xs={6}>
                  <div className="small text-muted mb-1">Age / Sex</div>
                  <div className="fw-bold">{calculateAge(patient.dob)} Years / {patient.sex}</div>
                </Col>
                <Col xs={6}>
                  <div className="small text-muted mb-1">Date of Birth</div>
                  <div className="fw-bold">{patient.dob ? new Date(patient.dob).toLocaleDateString('en-GB') : 'N/A'}</div>
                </Col>
                <Col xs={6}>
                  <div className="small text-muted mb-1">{patient.guardianType || 'Guardian'}</div>
                  <div className="fw-bold">{patient.gname || 'N/A'}</div>
                </Col>
                <Col xs={6}>
                  <div className="small text-muted mb-1">Phone</div>
                  <div className="fw-bold">{patient.phone || 'N/A'}</div>
                </Col>
                {patient.email && (
                  <Col xs={12}>
                    <div className="small text-muted mb-1">Email</div>
                    <div className="fw-bold">{patient.email}</div>
                  </Col>
                )}
              </Row>

              <h6 className="fw-bold mb-3 pb-2 border-bottom">Address Details</h6>
              <Row className="g-3 mb-4">
                <Col xs={12}>
                  <div className="small text-muted mb-1">Address</div>
                  <div className="fw-bold">
                    {[patient.add1, patient.add2].filter(Boolean).join(', ') || 'N/A'}
                  </div>
                </Col>
                {patient.village && (
                  <Col xs={6}>
                    <div className="small text-muted mb-1">Village</div>
                    <div className="fw-bold">{patient.village}</div>
                  </Col>
                )}
                {patient.post && (
                  <Col xs={6}>
                    <div className="small text-muted mb-1">Post Office</div>
                    <div className="fw-bold">{patient.post}</div>
                  </Col>
                )}
                {patient.district && (
                  <Col xs={6}>
                    <div className="small text-muted mb-1">District</div>
                    <div className="fw-bold">{patient.district}</div>
                  </Col>
                )}
                {patient.state && (
                  <Col xs={6}>
                    <div className="small text-muted mb-1">State</div>
                    <div className="fw-bold">{patient.state}</div>
                  </Col>
                )}
                {patient.country && (
                  <Col xs={6}>
                    <div className="small text-muted mb-1">Country</div>
                    <div className="fw-bold">{patient.country}</div>
                  </Col>
                )}
                {patient.pincode && (
                  <Col xs={6}>
                    <div className="small text-muted mb-1">Pincode</div>
                    <div className="fw-bold">{patient.pincode}</div>
                  </Col>
                )}
              </Row>

              <h6 className="fw-bold mb-3 pb-2 border-bottom">Medical Information</h6>
              <Row className="g-3 mb-3">
                <Col xs={6}>
                  <div className="small text-muted mb-1">Doctor</div>
                  <div className="fw-bold">{patient.doctorName || 'N/A'}</div>
                </Col>
                <Col xs={6}>
                  <div className="small text-muted mb-1">Department</div>
                  <div className="fw-bold">{patient.departmentName || 'N/A'}</div>
                </Col>
                {patient.complaintName && (
                  <Col xs={12}>
                    <div className="small text-muted mb-1">Complaint</div>
                    <div className="fw-bold">{patient.complaintName}</div>
                  </Col>
                )}
                {patient.govIdType && (
                  <Col xs={12}>
                    <div className="small text-muted mb-1">{patient.govIdType}</div>
                    <div className="fw-bold">{patient.govIdNo || 'N/A'}</div>
                  </Col>
                )}
              </Row>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="secondary" onClick={() => setShowPatientModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="fw-bold">
            {billingType === 'procedure'
              ? 'Procedure Items'
              : billingType === 'pharmacy'
              ? 'Pharmacy Items'
              : billingType === 'lab'
              ? 'Lab Items'
              : 'Items'}
          </Modal.Title>
        </Modal.Header>
        <Modal.Body style={{ maxHeight: '60vh', overflowY: 'auto' }}>
          <Table hover size="sm">
            <thead className="bg-light">
              <tr>
                <th>#</th>
                <th>Details</th>
                <th>Qty</th>
                <th className="text-end">Amount</th>
              </tr>
            </thead>
            <tbody>
              {billingType === 'procedure' &&
                procedureItems.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>{item.name}</td>
                    <td>{item.unit}</td>
                    <td className="text-end">₹{item.total.toFixed(2)}</td>
                  </tr>
                ))}
              {billingType === 'pharmacy' &&
                pharmacyItems.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>{item.medicineName}</td>
                    <td>{item.unit}</td>
                    <td className="text-end">₹{item.total.toFixed(2)}</td>
                  </tr>
                ))}
              {billingType === 'lab' &&
                labItems.map((item, index) => (
                  <tr key={item.id}>
                    <td>{index + 1}</td>
                    <td>{item.testName}</td>
                    <td>1</td>
                    <td className="text-end">₹{item.total.toFixed(2)}</td>
                  </tr>
                ))}
            </tbody>
            <tfoot className="bg-light fw-bold">
              <tr>
                <td colSpan={3} className="text-end">
                  Total:
                </td>
                <td className="text-end">₹{calculateTotal().toFixed(2)}</td>
              </tr>
            </tfoot>
          </Table>
        </Modal.Body>
      </Modal>

      <DueBillsModal
        show={showDueModal}
        onHide={() => setShowDueModal(false)}
        billingType={billingType}
        dueBills={dueBills}
        selectedDues={selectedDues}
        banks={banks.filter((bank) => bank.isActive === 1)}
        patientId={patient?.patId ?? undefined}
        visitId={patient?.lastVisitId}
        ipId={patient?.ipId ?? undefined}
        canDueDiscount={permissions.canDueDiscount}
        onToggleDue={(id, checked) => {
          setSelectedDues((prev) => {
            if (checked) {
              return [...prev, id];
            } else {
              return prev.filter((dueId) => dueId !== id);
            }
          });
        }}
        onPaymentComplete={(paymentData) => handleDuePaymentComplete(paymentData)}
        onPrint={(id) => { setBillPopupId(id); setShowBillPopup(true); }}
      />

      <AdvanceModal
        show={showAdvanceModal}
        onHide={() => { setShowAdvanceModal(false); setAdvanceCollectionSuccess(false); setAdvanceCollectionBillId(null); }}
        advanceMode={advanceMode}
        onChangeAdvanceMode={setAdvanceMode}
        advancePaymentMode={advancePaymentMode}
        onChangeAdvancePaymentMode={handleAdvancePaymentModeChange}
        advanceBankMode={advanceBankMode}
        onChangeAdvanceBankMode={setAdvanceBankMode}
        advancePaymentModes={advancePaymentModes}
        advanceHistory={advanceHistory}
        currentBalance={patient?.advBalance || 0}
        banks={banks}
        selectedBank={advanceSelectedBank}
        onChangeSelectedBank={setAdvanceSelectedBank}
        transactionNo={advanceTransactionNo}
        onChangeTransactionNo={setAdvanceTransactionNo}
        cashAmount={advanceCashAmount}
        onChangeCashAmount={setAdvanceCashAmount}
        bankAmount={advanceBankAmount}
        onChangeBankAmount={setAdvanceBankAmount}
        patientId={patient?.patId}
        ipId={patient?.ipId}
        visitId={patient?.lastVisitId}
        onAdvanceReturnSuccess={() => { handleResetForm(); }}
        onAdvanceCollectionSuccess={() => handleSaveAdvanceCollection()}
        collectionSuccess={advanceCollectionSuccess}
        collectionSuccessBillId={advanceCollectionBillId}
        onPrint={(id) => { setBillPopupId(id); setShowBillPopup(true); }}
      />

      <Modal show={showShortcutsModal} onHide={() => setShowShortcutsModal(false)} centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title>
            <FaKeyboardIcon className="me-2" /> Keyboard Shortcuts
          </Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="shortcuts-list">
            {permissions.canSaveBill && (
              <>
                <div className="shortcut-item mb-3">
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fw-bold">Save Bill</span>
                    <span><kbd className="shortcut-key">Ctrl + Enter</kbd> <span className="text-muted mx-1">or</span> <kbd className="shortcut-key">Alt + S</kbd></span>
                  </div>
                  <small className="text-muted d-block mt-1">Save the current billing transaction</small>
                </div>
                <hr />
              </>
            )}
            <div className="shortcut-item mb-3">
              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-bold">Print Bill</span>
                <kbd className="shortcut-key">Alt + P</kbd>
              </div>
              <small className="text-muted d-block mt-1">Print the saved bill</small>
            </div>
            {permissions.canOrderBill && (
              <div className="shortcut-item mb-3">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="fw-bold">Order Bill</span>
                  <kbd className="shortcut-key">Alt + O</kbd>
                </div>
                <small className="text-muted d-block mt-1">Submit the order bill</small>
              </div>
            )}
            <div className="shortcut-item mb-3">
              <div className="d-flex justify-content-between align-items-center">
                <span className="fw-bold">Reset Form</span>
                <span><kbd className="shortcut-key">F5</kbd> <span className="text-muted mx-1">or</span> <kbd className="shortcut-key">Alt + E</kbd></span>
              </div>
              <small className="text-muted d-block mt-1">Clear all fields and start fresh</small>
            </div>
            <hr />
            <small className="text-muted fw-semibold d-block mb-2">Tab Shortcuts (disabled after OP number entered)</small>
            {permissions.hasPharmacyAccess && (
              <div className="shortcut-item mb-2">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="fw-bold">Pharmacy Tab</span>
                  <kbd className="shortcut-key">Alt + H</kbd>
                </div>
              </div>
            )}
            {permissions.hasLabAccess && (
              <div className="shortcut-item mb-2">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="fw-bold">Lab Tab</span>
                  <kbd className="shortcut-key">Alt + L</kbd>
                </div>
              </div>
            )}
            {permissions.hasIPAccess && (
              <div className="shortcut-item mb-2">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="fw-bold">IP Tab</span>
                  <kbd className="shortcut-key">Alt + I</kbd>
                </div>
              </div>
            )}
            {permissions.hasReturnAccess && (
              <div className="shortcut-item mb-2">
                <div className="d-flex justify-content-between align-items-center">
                  <span className="fw-bold">Return Tab</span>
                  <kbd className="shortcut-key">Alt + R</kbd>
                </div>
              </div>
            )}
          </div>
        </Modal.Body>
      </Modal>

      <PatientSearchModal
        show={showPatientSearchModal}
        onHide={() => setShowPatientSearchModal(false)}
        onPatientSelect={handlePatientSearchSelect}
      />

      {/* Hidden print container - rendered off-screen, used by react-to-print */}
      <div style={{ position: 'fixed', top: '-9999px', left: '-9999px', visibility: 'hidden' }}>
        {printBillDetails && (
          <div ref={printRef}>
            <BillPrintContent bill={printBillDetails} />
          </div>
        )}
        {!printBillDetails && dueHistoryPrintData && (() => {
          const d = dueHistoryPrintData;
          const e0 = d?.originalBills?.[0];
          const col = e0?.cashItems?.[0]?.currentCollectionDetails
            ?? e0?.pharmacyItems?.[0]?.currentCollectionDetails
            ?? e0?.labItems?.[0]?.currentCollectionDetails
            ?? null;
          return (
            <div ref={printRef} style={{ fontFamily: "'Segoe UI', Arial, sans-serif", color: '#1e293b', fontSize: '11.5px', lineHeight: 1.3, border: BORDER, maxWidth: '100%', margin: '0 auto', background: '#fff' }}>
              <BillPrintHeader
                isReceipt={true}
                customBillType="Due Collection"
                patientName={e0?.originalBill?.patientName ?? ''}
                opNo={e0?.originalBill?.opNo ?? ''}
                tokenNo={0}
                billDisplay={col?.billDisplay ?? ''}
                dateTime={col?.dateTime ?? ''}
                userName={col?.userName ?? ''}
              />
              {(d.originalBills ?? []).map((entry: any, entryIdx: number) => (
                <div key={entryIdx} style={{ marginBottom: '14px' }}>
                  <div style={{ background: '#e0f2fe', padding: '3px 8px', fontSize: '0.7rem', fontWeight: 700, color: '#0369a1', display: 'flex', justifyContent: 'space-between', border: BORDER, borderBottom: 'none' }}>
                    <span>Original Bill: {entry.originalBill?.billDisplay} &nbsp;|&nbsp; {entry.originalBill?.dateTime ? new Date(entry.originalBill.dateTime).toLocaleDateString('en-IN') : ''}</span>
                    <span>Bill Total: ₹{(entry.originalBill?.total ?? 0).toFixed(2)}&nbsp;&nbsp; Coll.: ₹{([...(entry.cashItems ?? []), ...(entry.pharmacyItems ?? []), ...(entry.labItems ?? []), ...(entry.ipItems ?? [])] as any[]).reduce((s: number, g: any) => s + (g.currentCollectionDetails?.collectedAmount ?? 0), 0).toFixed(2)}</span>
                  </div>
                  {(entry.cashItems?.length ?? 0) > 0 && (
                    <div style={{ marginBottom: '6px' }}>
                      <div style={{ background: NAVY, color: '#fff', padding: '2px 8px', fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Investigation</div>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', border: BORDER, borderTop: 'none' }}>
                        <thead><tr>
                          <th style={{ ...thStyle, width: '4%' }}>#</th>
                          <th style={thStyle}>Particular</th>
                          <th style={thStyle}>Group</th>
                          <th style={{ ...thStyle, textAlign: 'center', width: '6%' }}>Qty</th>
                          <th style={{ ...thStyle, textAlign: 'right', width: '10%' }}>Rate</th>
                          <th style={{ ...thStyle, textAlign: 'right', width: '10%' }}>Disc.</th>
                          <th style={{ ...thStyle, textAlign: 'right', width: '11%', borderRight: 'none' }}>Total</th>
                        </tr></thead>
                        <tbody>
                          {entry.cashItems.flatMap((g: any) => g.itemDetails ?? []).map((item: any, idx: number) => (
                            <tr key={idx}>
                              <td style={{ ...tdStyle, color: '#94a3b8' }}>{idx + 1}</td>
                              <td style={tdStyle}>{item.particularName}</td>
                              <td style={{ ...tdStyle, color: '#64748b' }}>{item.groupName}</td>
                              <td style={{ ...tdStyle, textAlign: 'center' }}>{item.unit}</td>
                              <td style={{ ...tdStyle, textAlign: 'right' }}>₹{(item.unitRate ?? 0).toFixed(2)}</td>
                              <td style={{ ...tdStyle, textAlign: 'right', color: (item.discount ?? 0) > 0 ? '#dc2626' : '#94a3b8' }}>{(item.discount ?? 0) > 0 ? `₹${(item.discount ?? 0).toFixed(2)}` : '—'}</td>
                              <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600, borderRight: 'none' }}>₹{(item.totalRate ?? 0).toFixed(2)}</td>
                            </tr>
                          ))}
                          <tr style={{ borderTop: '1px solid #cbd5e1' }}>
                            <td colSpan={5} style={{ ...tdStyle, borderRight: 'none' }}></td>
                            <td style={{ ...tdStyle, fontWeight: 700, textAlign: 'right' }}>Sub-total</td>
                            <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 700, borderRight: 'none' }}>₹{entry.cashItems.flatMap((g: any) => g.itemDetails ?? []).reduce((s: number, i: any) => s + (i.totalRate ?? 0), 0).toFixed(2)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                  {(entry.pharmacyItems?.length ?? 0) > 0 && (
                    <div style={{ marginBottom: '6px' }}>
                      <div style={{ background: NAVY, color: '#fff', padding: '2px 8px', fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Pharmacy</div>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', border: BORDER, borderTop: 'none' }}>
                        <thead><tr>
                          <th style={{ ...thStyle, width: '4%' }}>#</th>
                          <th style={thStyle}>Product</th>
                          <th style={thStyle}>Generic</th>
                          <th style={{ ...thStyle, textAlign: 'center', width: '7%' }}>Units</th>
                          <th style={{ ...thStyle, textAlign: 'right', width: '10%' }}>MRP</th>
                          <th style={{ ...thStyle, textAlign: 'right', width: '11%', borderRight: 'none' }}>Total</th>
                        </tr></thead>
                        <tbody>
                          {entry.pharmacyItems.flatMap((g: any) => g.itemDetails ?? []).map((item: any, idx: number) => (
                            <tr key={idx}>
                              <td style={{ ...tdStyle, color: '#94a3b8' }}>{idx + 1}</td>
                              <td style={tdStyle}>{item.prodsName}</td>
                              <td style={{ ...tdStyle, color: '#64748b', fontSize: '0.75rem' }}>{item.genericName}</td>
                              <td style={{ ...tdStyle, textAlign: 'center' }}>{item.units}</td>
                              <td style={{ ...tdStyle, textAlign: 'right' }}>₹{(item.mrp ?? 0).toFixed(2)}</td>
                              <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600, borderRight: 'none' }}>₹{(item.total ?? 0).toFixed(2)}</td>
                            </tr>
                          ))}
                          <tr style={{ borderTop: '1px solid #cbd5e1' }}>
                            <td colSpan={4} style={{ ...tdStyle, borderRight: 'none' }}></td>
                            <td style={{ ...tdStyle, fontWeight: 700, textAlign: 'right' }}>Sub-total</td>
                            <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 700, borderRight: 'none' }}>₹{entry.pharmacyItems.flatMap((g: any) => g.itemDetails ?? []).reduce((s: number, i: any) => s + (i.total ?? 0), 0).toFixed(2)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                  {(entry.labItems?.length ?? 0) > 0 && (
                    <div style={{ marginBottom: '6px' }}>
                      <div style={{ background: NAVY, color: '#fff', padding: '2px 8px', fontSize: '0.62rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>Laboratory</div>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', border: BORDER, borderTop: 'none' }}>
                        <thead><tr>
                          <th style={{ ...thStyle, width: '4%' }}>#</th>
                          <th style={thStyle}>Test</th>
                          <th style={{ ...thStyle, textAlign: 'center', width: '7%' }}>Units</th>
                          <th style={{ ...thStyle, textAlign: 'right', width: '10%' }}>Rate</th>
                          <th style={{ ...thStyle, textAlign: 'right', width: '11%', borderRight: 'none' }}>Total</th>
                        </tr></thead>
                        <tbody>
                          {entry.labItems.flatMap((g: any) => g.itemDetails ?? []).map((item: any, idx: number) => (
                            <tr key={idx}>
                              <td style={{ ...tdStyle, color: '#94a3b8' }}>{idx + 1}</td>
                              <td style={tdStyle}>{item.testName}</td>
                              <td style={{ ...tdStyle, textAlign: 'center' }}>{item.units}</td>
                              <td style={{ ...tdStyle, textAlign: 'right' }}>₹{(item.rate ?? 0).toFixed(2)}</td>
                              <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 600, borderRight: 'none' }}>₹{(item.totalAmount ?? 0).toFixed(2)}</td>
                            </tr>
                          ))}
                          <tr style={{ borderTop: '1px solid #cbd5e1' }}>
                            <td colSpan={3} style={{ ...tdStyle, borderRight: 'none' }}></td>
                            <td style={{ ...tdStyle, fontWeight: 700, textAlign: 'right' }}>Sub-total</td>
                            <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 700, borderRight: 'none' }}>₹{entry.labItems.flatMap((g: any) => g.itemDetails ?? []).reduce((s: number, i: any) => s + (i.totalAmount ?? 0), 0).toFixed(2)}</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              ))}
              <div style={{ display: 'flex', alignItems: 'flex-start', marginBottom: '10px', marginTop: '10px' }}>
                <div style={{ flex: '0 0 50%' }}></div>
                <div style={{ flex: '0 0 50%', paddingLeft: '8px', fontSize: '0.85rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 4px', color: '#64748b' }}>
                    <span>Total Amount</span><span>₹{(d.totalDue ?? 0).toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '5px 4px', color: '#15803d' }}>
                    <span>Paid Amount</span><span>₹{(d.totalCollected ?? 0).toFixed(2)}</span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 4px', fontWeight: 700, color: (d.pendingAmount ?? 0) > 0 ? '#dc2626' : '#15803d' }}>
                    <span>{(d.pendingAmount ?? 0) > 0 ? 'Balance Due' : 'Settled'}</span>
                    <span style={{ fontSize: '1rem', fontWeight: 800 }}>₹{(d.pendingAmount ?? 0).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })()}
      </div>
    </div>

      {/* Bill Preview Popup */}
      {showBillPopup && billPopupId != null && (
        <div
          style={{
            position: "fixed",
            inset: 0,
            zIndex: 1060,
            background: "rgba(0,0,0,0.55)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowBillPopup(false); }}
        >
          <div
            style={{
              background: "#fff",
              borderRadius: "12px",
              boxShadow: "0 8px 40px rgba(0,0,0,0.25)",
              width: "min(700px, 96vw)",
              maxHeight: "92vh",
              overflowY: "auto",
              position: "relative",
            }}
          >
            <DuplicateBillView
              billIdProp={billPopupId}
              onClose={() => setShowBillPopup(false)}
              patientNameProp={patient ? (patient.name + (patient.secName ? ' ' + patient.secName : '')).trim() : undefined}
              opNoProp={patient?.displayNumber || opNumber || undefined}
            />
          </div>
        </div>
      )}
    </>
  );
};

export default BillingRedesigned;

const styles = `
  .neat-card {
    border: none !important;
    border-radius: 8px !important;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08) !important;
    background: white;
  }

  .form-control, .form-select {
    border-radius: 4px !important;
    border: 1px solid #cbd5e0;
    padding: 0.3rem 0.5rem !important;
    min-height: 32px !important;
    font-size: var(--font-size-sm) !important;
  }

  .form-control:focus, .form-select:focus {
    border-color: #3182ce;
    box-shadow: 0 0 0 2px rgba(49, 130, 206, 0.1);
  }

  .patient-info-card .info-row {
    display: flex;
    justify-content: space-between;
    font-size: var(--font-size-sm);
  }

  .patient-info-card .info-row .label {
    color: #718096;
    font-weight: var(--font-weight-medium);
  }

  .patient-info-card .info-row .value {
    color: #2d3748;
    font-weight: var(--font-weight-semibold);
  }

  .patient-name {
    font-size: var(--font-size-lg);
  }

  .balance-cards {
    display: flex;
    gap: 0.75rem;
  }

  .balance-card {
    flex: 1;
    padding: 0.75rem;
    background: #f7fafc;
    border-radius: 6px;
    cursor: pointer;
    transition: all 0.2s;
  }

  .balance-card:hover {
    background: #edf2f7;
    transform: translateY(-2px);
  }

  .balance-label {
    font-size: var(--font-size-xs);
    color: #718096;
    text-transform: uppercase;
    font-weight: var(--font-weight-semibold);
    margin-bottom: 0.25rem;
  }

  .balance-amount {
    font-size: var(--font-size-lg);
    font-weight: var(--font-weight-bold);
  }

  .summary-box {
    border-radius: 6px;
    padding: 0.75rem;
  }

  .summary-row {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0;
    font-size: var(--font-size-sm);
  }

  .summary-row.grand-total {
    font-size: var(--font-size-base); 
    padding: 0.75rem;
    margin: 0.5rem -0.75rem -0.75rem;
    border-bottom-left-radius: 6px;
    border-bottom-right-radius: 6px;
  }

  .sm-table {
    font-size: var(--font-size-md);
  }

  .sm-table thead {
    font-size: var(--font-size-xs);
    text-transform: uppercase;
  }

  .sticky-top {
    position: sticky;
    top: 0;
    z-index: 10;
  }

  ::-webkit-scrollbar {
    width: 6px;
    height: 6px;
  }

  ::-webkit-scrollbar-track {
    background: transparent;
  }

  ::-webkit-scrollbar-thumb {
    background: #cbd5e0;
    border-radius: 3px;
  }

  .billing-panels-wrap {
    overflow: auto;
  }

  .billing-panels-row {
    height: auto;
    overflow: visible;
  }

  .billing-panel {
    height: auto;
  }

  .billing-panel-body {
    overflow: visible;
  }

  .billing-panel-center {
    overflow: visible;
  }

  @media (min-width: 992px) {
    .billing-panels-wrap {
      overflow: hidden;
    }

    .billing-panels-row {
      height: 100%;
      overflow: hidden;
    }

    .billing-panel {
      height: 100%;
    }

    .billing-panel-body {
      overflow: auto;
      min-height: 0;
    }

    .billing-panel-center {
      overflow: hidden;
    }
  }
`;
