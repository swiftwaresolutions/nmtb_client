import React, { useState, useRef, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, InputGroup, Badge, Modal } from 'react-bootstrap';
import { FaStethoscope, FaPills, FaFlask, FaSearch, FaUser, FaTrash, FaSave, FaPrint, FaTimes, FaPlus, FaMoneyBillWave, FaCreditCard, FaExchangeAlt, FaUserMd, FaBed, FaUndo, FaCopy, FaFileInvoiceDollar, FaExternalLinkAlt } from 'react-icons/fa';
import { useSidebar } from '../../../context/SidebarContext';
import { showErrorToast, showWarningToast, showLoading, closeAlert, showSuccessToast, showConfirmDialog, showWarningModal, showErrorModal, showSuccessModal, showInfoToast } from '../../../utils/alertUtil';
import { useSelector } from 'react-redux';
import { RootState } from '../../../state/store';
import { handleNumberChange, handleNumberBlur, formatNumberDisplay } from '../../../utils/numberInputUtil';
import HttpClientWrapper from '../../../api/http-client-wrapper';
import { CashCounterApiService } from '../../../api/cash-counter/cash-counter-api-service';
import { MedicalRecordsApiService } from '../../../api/medical-records/medical-records-api-service';
import PharmacyBilling from './PharmacyBilling';
import LabBilling from './LabBilling';
import IPBilling from './IPBilling';
import ReturnBilling from './ReturnBilling';
import DueBillsModal from './components/DueBillsModal';
import AdvanceModal from './components/AdvanceModal';

// Fix for TS2786: 'Icon' cannot be used as a JSX component.
const FaStethoscopeIcon = FaStethoscope as any;
const FaPillsIcon = FaPills as any;
const FaFlaskIcon = FaFlask as any;
const FaSearchIcon = FaSearch as any;
const FaUserIcon = FaUser as any;
const FaTrashIcon = FaTrash as any;
const FaSaveIcon = FaSave as any;
const FaPrintIcon = FaPrint as any;
const FaTimesIcon = FaTimes as any;
const FaPlusIcon = FaPlus as any;
const FaMoneyBillWaveIcon = FaMoneyBillWave as any;
const FaCreditCardIcon = FaCreditCard as any;
const FaExchangeAltIcon = FaExchangeAlt as any;
const FaUserMdIcon = FaUserMd as any;
const FaBedIcon = FaBed as any;
const FaUndoIcon = FaUndo as any;
const FaCopyIcon = FaCopy as any;
const FaFileInvoiceDollarIcon = FaFileInvoiceDollar as any;
const FaExternalLinkAltIcon = FaExternalLinkAlt as any;

type BillingType = 'procedure' | 'pharmacy' | 'lab' | 'ip' | 'return' | null;

interface PatientDetails {
  patId: number,
  displayNumber: string,
  name: string,
  secName: string,
  sex: string,
  age: string,
  dob: string,
  email: string,
  phone: string,
  add1: string,
  add2: string,
  pincode: string,
  gname: string,
  guardianType: string,
  village: string,
  post: string,
  districtId: number,
  district: string,
  state: string,
  country: string,
  govIdType: string,
  govIdNo: string,
  isInOp: boolean,
  isInIp: boolean,
  isActive: boolean,
  isDead: boolean,
  statusMessage: string,
  lastVisitId: number,
  doctorId: number,
  lastVisitDate: string,
  doctorName: string,
  departmentId: number,
  departmentName: string,
  complaintName: string,
  debitId: number,
  debitHead: string,
  accountCategory: string,
  ipId: number,
  ipNo: string,
  wardName: string,
  bedNo: string,
  admitDateTime: string,
  advBalance: number,
  dueBalance: number
}

interface BillingItem {
  id: number;
  groupName?: string;
  name?: string;
  unit: number;
  cost?: number;
  discount?: number;
  total: number;
  // Procedure fields
  particularId?: number; // Procedure ID from API
  groupId?: number; // Group ID from API
  // Pharmacy fields
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
  // Lab fields
  deptName?: string;
  testName?: string;
  testId?: number;
  deptId?: number;
  rate?: number;
}

const Billing: React.FC = () => {
  const { collapsed } = useSidebar();
  const loginData = useSelector((state: RootState) => state.loginData);
  const [billingType, setBillingType] = useState<BillingType>('procedure');
  const [opNumber, setOpNumber] = useState('');
  const [patient, setPatient] = useState<PatientDetails | null>(null);
  const [loadingPatient, setLoadingPatient] = useState(false);
  const [constantCharges, setConstantCharges] = useState<any[]>([]);
  const [billDateTime, setBillDateTime] = useState('');
  const [showBillDate, setShowBillDate] = useState(false);
  const httpClient = new HttpClientWrapper();
  const cashCounterApi = new CashCounterApiService();
  const medicalRecordsApi = new MedicalRecordsApiService();
  
  // Account heads for mapping
  const [accountHeads, setAccountHeads] = useState<any[]>([]);
  
  // Bank details for payment
  const [banks, setBanks] = useState<any[]>([]);
  const [selectedBank, setSelectedBank] = useState<string>('');
  const [transactionNo, setTransactionNo] = useState<string>('');
  
  // Procedure autocomplete state
  const [procedureSuggestions, setProcedureSuggestions] = useState<any[]>([]);
  const [showProcedureSuggestions, setShowProcedureSuggestions] = useState(false);
  const [procedureSearchTerm, setProcedureSearchTerm] = useState('');
  const [selectedProcedureIndex, setSelectedProcedureIndex] = useState<number>(-1);
  const unitInputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const [procedureItems, setProcedureItems] = useState<BillingItem[]>([]);
  const [pharmacyItems, setPharmacyItems] = useState<BillingItem[]>([]);
  const [labItems, setLabItems] = useState<BillingItem[]>([]);
  const [ipItems, setIpItems] = useState<any[]>([]); // IP bill order details
  const [resetTrigger, setResetTrigger] = useState(0);
  const [showModal, setShowModal] = useState(false);
  const [showPatientModal, setShowPatientModal] = useState(false);
  
  // Billing Details State
  const [discountType, setDiscountType] = useState<'rs' | 'percent'>('rs');
  const [totalDiscount, setTotalDiscount] = useState<number>(0);
  const [discountGivenBy, setDiscountGivenBy] = useState<string>('');
  const [paymentMode, setPaymentMode] = useState<'cash' | 'bank' | 'cash-bank'>('cash');
  const [bankMode, setBankMode] = useState<'upi' | 'card'>('upi');
  const [selectedDoctor, setSelectedDoctor] = useState('');
  const [patientType, setPatientType] = useState('general');
  
  // Payment Amount States
  const [cashAmount, setCashAmount] = useState<number>(0);
  const [bankAmount, setBankAmount] = useState<number>(0);
  const [insuranceAmount, setInsuranceAmount] = useState<number>(0);
  const [staffCreditAmount, setStaffCreditAmount] = useState<number>(0);
  const [balanceAmount, setBalanceAmount] = useState<number>(0);

  // payment mode disable logic starts here
  const selectedAccountHead = patient
    ? accountHeads.find((head) => head.headId === patient.debitId)
    : undefined;
  const salesType = selectedAccountHead?.salesType;
  const isStaffEnabled = salesType === 2;
  const isInsuranceEnabled = salesType !== 1 && salesType !== 2;
  // ends 
  
  // Due Modal State
  const [showDueModal, setShowDueModal] = useState(false);
  const [selectedDues, setSelectedDues] = useState<number[]>([]);

  // Due Bills State - Fetched from API
  const [dueBills, setDueBills] = useState<any[]>([]);
  const [loadingDueBills, setLoadingDueBills] = useState(false);
  const [dueCollected, setDueCollected] = useState<number>(0);

  // Advance Modal State
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [advanceAmount, setAdvanceAmount] = useState<number>(0);
  const [advancePaymentMode, setAdvancePaymentMode] = useState<'cash' | 'bank' | 'cash-bank'>('cash');
  const [advanceBankMode, setAdvanceBankMode] = useState<'upi' | 'card'>('upi');
  const [advanceMode, setAdvanceMode] = useState<'collection' | 'return'>('collection');
  const [advanceCashAmount, setAdvanceCashAmount] = useState<number>(0);
  const [advanceBankAmount, setAdvanceBankAmount] = useState<number>(0);
  const [advanceSelectedBank, setAdvanceSelectedBank] = useState<string>('');
  const [advanceTransactionNo, setAdvanceTransactionNo] = useState<string>('');

  // Advance History State
  const [advanceHistory, setAdvanceHistory] = useState<any[]>([]);
  const [loadingAdvanceHistory, setLoadingAdvanceHistory] = useState(false);

  // Fetch due bills from API
  const fetchDueBills = async (patId: number, lastVisitId: number) => {
    try {
      setLoadingDueBills(true);
      const response = await cashCounterApi.fetchDueDetails(patId);
      
      // Map API response to match DueBill interface
      const mappedDueBills = (response || []).map((item: any) => ({
        id: item.id,
        date: item.dateTime || '',
        billNo: item.billDisplay || '',
        amount: item.due || 0,
        balance: item.due || 0
      }));
      
      setDueBills(mappedDueBills);
      setLoadingDueBills(false);
    } catch (error) {
      console.error('Error fetching due bills:', error);
      setDueBills([]);
      setLoadingDueBills(false);
    }
  };

  // Fetch advance payment details from API
  const fetchAdvancePaymentDetails = async (patId: number, lastVisitId: number) => {
    try {
      setLoadingAdvanceHistory(true);
      const response = await cashCounterApi.fetchAdvancePaymentDetails(patId, lastVisitId.toString());
      
      // Map API response to match AdvanceHistoryItem interface
      const mappedAdvanceHistory = (response || []).map((item: any, index: number) => ({
        id: index + 1,
        date: item.dateTime || '',
        receiptNo: item.billDisplay || '',
        amount: item.total || 0,
        used: 0, // API doesn't provide this, set to 0 for now
        balance: item.total || 0 // If used is 0, balance equals total
      }));

      setAdvanceHistory(mappedAdvanceHistory);
      setLoadingAdvanceHistory(false);
    } catch (error) {
      console.error('Error fetching advance payment details:', error);
      setAdvanceHistory([]);
      setLoadingAdvanceHistory(false);
    }
  };

  // Handler to process payment from due bills modal
  const handleDuePaymentComplete = (paymentData: any) => {
    if (!paymentData || !paymentData.selectedBillIds) {
      showErrorToast('Invalid payment data received', 'Payment Error');
      return;
    }

    try {
      // Add the due amount to the current bill
      setDueCollected(dueCollected + paymentData.totalAmount);
      
      // Reset selected dues after successful payment
      setSelectedDues([]);
      
      // Close modal
      setShowDueModal(false);
      
      showSuccessToast(
        `₹${paymentData.totalAmount.toFixed(2)} collected via ${paymentData.paymentMode.toUpperCase()}`,
        'Payment Successful'
      );

      // Reset billing page after successful due collection
      handleResetForm();
    } catch (error) {
      console.error('Error processing payment:', error);
      showErrorToast('Failed to process payment', 'Payment Error');
    }
  };

  // Handler to save advance collection using saveBilling API
  const handleSaveAdvanceCollection = async () => {
    // Validation
    if (!patient) {
      showErrorToast('Please search and select a patient first', 'Validation Error');
      return;
    }

    // Validate advance amount
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

      // Determine payment mode string
      let paymentModeString = "CASH";
      if (advancePaymentMode === "bank") {
        paymentModeString = "BANK";
      } else if (advancePaymentMode === "cash-bank") {
        paymentModeString = "CASH/BANK";
      }

      // Calculate isOpPatient based on patient properties
      const hasOpNumber = !!(patient.displayNumber || opNumber);
      const isOpPatient = patient.isInOp === true || hasOpNumber;
      const visitId = patient.lastVisitId || 0;

      // Prepare payment
      const payment = {
        paymentMode: paymentModeString,
        bankId: advanceSelectedBank ? Number(advanceSelectedBank) : 0,
        transType: 0,
        refNo: advanceTransactionNo,
        total: totalAdvanceAmount,
        discount: 0,
        payable: totalAdvanceAmount,
        cashPaid: advanceMode === 'collection' ? advanceCashAmount : 0,
        bankPaid: advanceMode === 'collection' ? advanceBankAmount : totalAdvanceAmount,
        staffPaid: 0,
        companyPaid: 0,
        dueAmt: 0
      };

      const payload = {
        patientId: patient.patId,
        visitId: isOpPatient ? visitId : 0,
        ipId: patient.ipId || 0,
        isOp: ( patient.isInOp === true) ? 1 : 0,
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
        isAdvance: 1, // Mark as advance transaction
        age: patient.age?.toString() || '',
        opNo: patient.displayNumber || opNumber,
        refDr: 0,
        placeColl: ''
      };

      console.log('=== ADVANCE COLLECTION PAYLOAD DEBUG ===');
      console.log('Advance Mode:', advanceMode);
      console.log('Total Amount:', totalAdvanceAmount);
      console.log('Payment Mode:', paymentModeString);
      console.log('Full Payload:', JSON.stringify(payload, null, 2));
      console.log('========================================');

      const response = await cashCounterApi.saveBilling(payload);
      closeAlert();
      
      showSuccessModal(
        `Advance ${advanceMode === 'collection' ? 'collected' : 'returned'} successfully!`,
        'Success'
      );
      
      // Refresh advance history
      if (patient.patId) {
        fetchAdvancePaymentDetails(patient.patId, patient.lastVisitId || 0);
      }
      
      // Close advance modal and reset
      setShowAdvanceModal(false);
      setAdvanceCashAmount(0);
      setAdvanceBankAmount(0);
      setAdvanceAmount(0);
      setAdvanceTransactionNo('');
      setAdvanceSelectedBank('');
      
    } catch (error: any) {
      closeAlert();
      console.error('Error saving advance collection:', error);
      
      let errorMessage = error?.response?.data?.error || error?.message || 'Failed to save advance transaction';
      
      // Clean up validation errors
      errorMessage = errorMessage
        .replace(/Billing validation failed:\s*/gi, '')
        .replace(/;\s*Total paid.*$/i, '')
        .trim();
      
      showErrorModal(errorMessage, 'Advance Error');
    }
  };

  // Helper functions to get current module's data
  const getCurrentDueBills = () => {
    return dueBills;
  };

  const getTotalBalance = () => {
    return getCurrentDueBills().reduce((sum, bill) => sum + bill.balance, 0);
  };

  const getTotalAdvance = () => {
    return advanceHistory.reduce((sum, adv) => sum + adv.balance, 0);
  };
  
  // Auto-fill cash amount for OP patients, balance for IP patients
  useEffect(() => {
    if (patient) {
      // Calculate grand total inline to avoid dependency issues
      const procedureTotal = procedureItems.reduce((sum, item) => sum + item.total, 0);
      const pharmacyTotal = pharmacyItems.reduce((sum, item) => sum + item.total, 0);
      const labTotal = labItems.reduce((sum, item) => sum + item.total, 0);
      const ipTotal = ipItems.reduce((sum, item) => sum + (item.amt || 0), 0);
      
      const itemsTotal = procedureTotal + pharmacyTotal + labTotal + ipTotal;
      const grandTotal = discountType === 'percent' 
        ? itemsTotal - (itemsTotal * totalDiscount / 100)
        : itemsTotal - totalDiscount;
      
      if (patient.isInOp === true) {
        // OP patient: auto-fill based on payment mode
        if (paymentMode === 'cash') {
          setCashAmount(grandTotal);
          setBankAmount(0);
        } else if (paymentMode === 'bank') {
          setBankAmount(grandTotal);
          setCashAmount(0);
        } else if (paymentMode === 'cash-bank') {
          // For split payment, divide equally or set one to grand total and let user adjust
          const halfAmount = grandTotal / 2;
          setCashAmount(halfAmount);
          setBankAmount(halfAmount);
        }
      } else if (patient.isInOp === false) {
        // IP patient: full amount goes to balance
        setBalanceAmount(grandTotal);
        setCashAmount(0);
        setBankAmount(0);
      }
    }
  }, [patient, procedureItems, pharmacyItems, labItems, ipItems, totalDiscount, discountType, paymentMode]);

  // Re-fetch constant charges when bill date changes
  useEffect(() => {
    if (patient && patient.ipId && patient.ipId > 0 && patient.admitDateTime) {
      fetchConstantCharges(patient.ipId, patient.admitDateTime);
    }
  }, [billDateTime, showBillDate]);

  // Calculate balance based on payments
  useEffect(() => {
    if (patient) {
      // Calculate grand total inline
      const procedureTotal = procedureItems.reduce((sum, item) => sum + item.total, 0);
      const pharmacyTotal = pharmacyItems.reduce((sum, item) => sum + item.total, 0);
      const labTotal = labItems.reduce((sum, item) => sum + item.total, 0);
      const ipTotal = ipItems.reduce((sum, item) => sum + (item.amt || 0), 0);
      
      const itemsTotal = procedureTotal + pharmacyTotal + labTotal + ipTotal + dueCollected;
      const grandTotal = discountType === 'percent' 
        ? itemsTotal - (itemsTotal * totalDiscount / 100)
        : itemsTotal - totalDiscount;
      
      const balance = grandTotal - cashAmount - bankAmount - insuranceAmount - staffCreditAmount;
      setBalanceAmount(balance > 0 ? balance : 0);
    }
  }, [patient, procedureItems, pharmacyItems, labItems, ipItems, dueCollected, totalDiscount, discountType, cashAmount, bankAmount, insuranceAmount, staffCreditAmount]);

  // Handler for cash amount change with validation
  const handleCashAmountChange = (value: number) => {
    // Calculate grand total for validation
    const procedureTotal = procedureItems.reduce((sum, item) => sum + item.total, 0);
    const pharmacyTotal = pharmacyItems.reduce((sum, item) => sum + item.total, 0);
    const labTotal = labItems.reduce((sum, item) => sum + item.total, 0);
    const ipTotal = ipItems.reduce((sum, item) => sum + (item.amt || 0), 0);
    const itemsTotal = procedureTotal + pharmacyTotal + labTotal + ipTotal;
    const grandTotal = discountType === 'percent' 
      ? itemsTotal - (itemsTotal * totalDiscount / 100)
      : itemsTotal - totalDiscount;

    // Check if total payments exceed grand total
    const totalPaid = value + bankAmount + insuranceAmount + staffCreditAmount;
    if (totalPaid > grandTotal) {
      showWarningToast(`Total payment ₹${totalPaid.toFixed(2)} exceeds bill amount ₹${grandTotal.toFixed(2)}`, 'Payment Exceeds Bill');
      return;
    }

    setCashAmount(value);
  };

  // Handler for bank amount change with validation
  const handleBankAmountChange = (value: number) => {
    // Calculate grand total for validation
    const procedureTotal = procedureItems.reduce((sum, item) => sum + item.total, 0);
    const pharmacyTotal = pharmacyItems.reduce((sum, item) => sum + item.total, 0);
    const labTotal = labItems.reduce((sum, item) => sum + item.total, 0);
    const ipTotal = ipItems.reduce((sum, item) => sum + (item.amt || 0), 0);
    const itemsTotal = procedureTotal + pharmacyTotal + labTotal + ipTotal;
    const grandTotal = discountType === 'percent' 
      ? itemsTotal - (itemsTotal * totalDiscount / 100)
      : itemsTotal - totalDiscount;

    // Check if total payments exceed grand total
    const totalPaid = cashAmount + value + insuranceAmount + staffCreditAmount;
    if (totalPaid > grandTotal) {
      showWarningToast(`Total payment ₹${totalPaid.toFixed(2)} exceeds bill amount ₹${grandTotal.toFixed(2)}`, 'Payment Exceeds Bill');
      return;
    }

    setBankAmount(value);
  };

  // Handler for insurance amount change with validation
  const handleInsuranceAmountChange = (value: number) => {
    // Calculate grand total for validation
    const procedureTotal = procedureItems.reduce((sum, item) => sum + item.total, 0);
    const pharmacyTotal = pharmacyItems.reduce((sum, item) => sum + item.total, 0);
    const labTotal = labItems.reduce((sum, item) => sum + item.total, 0);
    const ipTotal = ipItems.reduce((sum, item) => sum + (item.amt || 0), 0);
    const itemsTotal = procedureTotal + pharmacyTotal + labTotal + ipTotal;
    const grandTotal = discountType === 'percent' 
      ? itemsTotal - (itemsTotal * totalDiscount / 100)
      : itemsTotal - totalDiscount;

    if (paymentMode === 'bank') {
      // In bank-only mode, adjust bank to keep total payment equal to bill amount
      const totalPaidWithoutBank = value + staffCreditAmount;
      if (totalPaidWithoutBank > grandTotal) {
        showWarningToast(`Total payment ₹${totalPaidWithoutBank.toFixed(2)} exceeds bill amount ₹${grandTotal.toFixed(2)}`, 'Payment Exceeds Bill');
        return;
      }

      setInsuranceAmount(value);
      setBankAmount(grandTotal - totalPaidWithoutBank);
      setCashAmount(0);
      return;
    }

    // For cash/cash-bank mode, adjust cash to keep total payment equal to bill amount
    const totalPaidWithoutCash = bankAmount + value + staffCreditAmount;
    if (totalPaidWithoutCash > grandTotal) {
      showWarningToast(`Total payment ₹${totalPaidWithoutCash.toFixed(2)} exceeds bill amount ₹${grandTotal.toFixed(2)}`, 'Payment Exceeds Bill');
      return;
    }

    setInsuranceAmount(value);
    setCashAmount(grandTotal - totalPaidWithoutCash);
  };

  // Handler for staff credit amount change with validation
  const handleStaffCreditAmountChange = (value: number) => {
    // Calculate grand total for validation
    const procedureTotal = procedureItems.reduce((sum, item) => sum + item.total, 0);
    const pharmacyTotal = pharmacyItems.reduce((sum, item) => sum + item.total, 0);
    const labTotal = labItems.reduce((sum, item) => sum + item.total, 0);
    const ipTotal = ipItems.reduce((sum, item) => sum + (item.amt || 0), 0);
    const itemsTotal = procedureTotal + pharmacyTotal + labTotal + ipTotal;
    const grandTotal = discountType === 'percent' 
      ? itemsTotal - (itemsTotal * totalDiscount / 100)
      : itemsTotal - totalDiscount;

    if (paymentMode === 'bank') {
      // In bank-only mode, adjust bank to keep total payment equal to bill amount
      const totalPaidWithoutBank = insuranceAmount + value;
      if (totalPaidWithoutBank > grandTotal) {
        showWarningToast(`Total payment ₹${totalPaidWithoutBank.toFixed(2)} exceeds bill amount ₹${grandTotal.toFixed(2)}`, 'Payment Exceeds Bill');
        return;
      }

      setStaffCreditAmount(value);
      setBankAmount(grandTotal - totalPaidWithoutBank);
      setCashAmount(0);
      return;
    }

    // For cash/cash-bank mode, adjust cash to keep total payment equal to bill amount
    const totalPaidWithoutCash = bankAmount + insuranceAmount + value;
    if (totalPaidWithoutCash > grandTotal) {
      showWarningToast(`Total payment ₹${totalPaidWithoutCash.toFixed(2)} exceeds bill amount ₹${grandTotal.toFixed(2)}`, 'Payment Exceeds Bill');
      return;
    }

    setStaffCreditAmount(value);
    setCashAmount(grandTotal - totalPaidWithoutCash);
  };

  // Reset form to initial state for next patient
  const handleResetForm = () => {
    // Reset patient details
    setOpNumber('');
    setPatient(null);
    setSelectedDoctor('');
    
    // Reset billing items
    setProcedureItems([]);
    setPharmacyItems([]);
    setLabItems([]);
    setIpItems([]);
    setConstantCharges([]);
    setBillDateTime('');
    setShowBillDate(false);
    
    // Reset discounts
    setTotalDiscount(0);
    setDiscountType('rs');
    setDiscountGivenBy('');
    
    // Reset payment amounts
    setCashAmount(0);
    setBankAmount(0);
    setInsuranceAmount(0);
    setStaffCreditAmount(0);
    setBalanceAmount(0);
    
    // Reset payment mode
    setPaymentMode('cash');
    setSelectedBank('');
    setTransactionNo('');
    
    // Reset due collection
    setDueCollected(0);
    setSelectedDues([]);
    
    // Reset new item form
    setNewItem({
      groupName: '',
      name: '',
      unit: 1,
      cost: 0,
      discount: 0,
      particularId: 0,
      groupId: 0,
      isEditable: 0
    });
    
    // Reset procedure search
    setProcedureSearchTerm('');
    setShowProcedureSuggestions(false);
    setProcedureSuggestions([]);

    // Trigger child item entry reset
    setResetTrigger((prev) => prev + 1);
  };
  
  // New Item State
  const [newItem, setNewItem] = useState({
    groupName: '',
    name: '',
    unit: 1,
    cost: 0,
    discount: 0,
    particularId: 0,
    groupId: 0,
    isEditable: 0
  });

  // Fetch patient details from API
  const handleSearchPatient = async () => {
    if (!opNumber || !opNumber.trim()) {
      showWarningToast('Please enter OP number or mobile number');
      return;
    }

    try {
      setLoadingPatient(true);
      showLoading('Loading patient details...');

      const response = await medicalRecordsApi.fetchPatientDetails(opNumber.trim());

      closeAlert();

      // Log the full patient response
      console.log('Patient API Response:', response);
      console.log('Patient lastVisitId:', response.lastVisitId);
      console.log('Patient isInOp:', response.isInOp);
      console.log('Patient isDead:', response.isDead);
      console.log('Patient accounts:', response.accounts); // Log accounts field for lab billing

      // Check if patient is deceased
      if (response.isDead === true) {
        showErrorToast('This patient is deceased. Billing cannot be processed.', 'Patient Expired');
        setPatient(null);
        // Focus back on OP input after error
        setTimeout(() => {
          console.log('🔄 Refocusing on OP input after deceased check');
          opInputRef.current?.focus();
        }, 200);
        return;
      }

      // Validate patient status - check if patient is registered (isInOp or isInIp should be true)
      if (response.isInOp !== true && response.isInIp !== true) {
        showErrorToast('Patient not registered. Please register first.');
        setPatient(null);
        // Focus back on OP input after error
        setTimeout(() => {
          console.log('🔄 Refocusing on OP input after registration check');
          opInputRef.current?.focus();
        }, 200);
        return;
      }

      if (response.isActive !== true) {
        showErrorToast('Patient is blocked. Please contact administration.');
        setPatient(null);
        // Focus back on OP input after error
        setTimeout(() => {
          console.log('🔄 Refocusing on OP input after blocked check');
          opInputRef.current?.focus();
        }, 200);
        return;
      }

      // Check if OP patient has visitId
      const visitIdToCheck = response.visitId || response.lastVisitId || 0;
      if (response.isInOp === true && visitIdToCheck === 0) {
        showWarningToast('This patient does not have an active OP visit. Please create a visit first from OPD.');
        setPatient(null);
        // Focus back on OP input after error
        setTimeout(() => {
          console.log('🔄 Refocusing on OP input after visitId check');
          opInputRef.current?.focus();
        }, 200);
        return;
      }

      // Set patient details
      setPatient(response);
      setSelectedDoctor(response.doctorName || '');
      
      // Fetch due bills for patient
      if (response.patId && response.lastVisitId) {
        console.log('Fetching due bills for patient...');
        console.log('Patient ID:', response.patId);
        console.log('Last Visit ID:', response.lastVisitId);
        await fetchDueBills(response.patId, response.lastVisitId);
        
        // Fetch advance payment details for patient
        console.log('Fetching advance payment details for patient...');
        await fetchAdvancePaymentDetails(response.patId, response.lastVisitId);
      }
      
      // Fetch constant charges and IP order details for IP patients
      if (response.ipId && response.ipId > 0 && response.admitDateTime) {
        console.log('IP patient detected, fetching constant charges...');
        console.log('IP ID:', response.ipId);
        console.log('Admit DateTime:', response.admitDateTime);
        await fetchConstantCharges(response.ipId, response.admitDateTime);
        
        // Fetch IP bill order details
        console.log('Fetching IP bill order details...');
        await fetchIpBillOrderDetails(response.patId, response.ipId);
      } else {
        console.log('OP patient - no constant charges to fetch');
        setConstantCharges([]);
        setIpItems([]);
      }
      
      // Focus on procedure name input after patient is loaded
      setTimeout(() => {
        procedureNameInputRef.current?.focus();
      }, 100);

    } catch (error: any) {
      closeAlert();
      console.error('Error fetching patient details:', error);
      console.log('❌ API error occurred - resetting focus to OP input');
      const errorMsg = error?.response?.data?.error || 'Failed to load patient details';
      showErrorToast(errorMsg);
      setPatient(null);
      // Focus back on OP input after error
      setTimeout(() => {
        console.log('🔄 Refocusing on OP input after API error');
        opInputRef.current?.focus();
      }, 200);
    } finally {
      setLoadingPatient(false);
    }
  };

  // Fetch constant charges for IP patients
  const fetchConstantCharges = async (ipId: number, admitDateTime: string) => {
    try {
      // Determine discharge date
      const dischargeDate = showBillDate && billDateTime 
        ? new Date(billDateTime).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];
      
      // Format admission date
      const admissionDate = new Date(admitDateTime).toISOString().split('T')[0];
      
      const response = await cashCounterApi.fetchConstantCharges(
        ipId,
        admissionDate,
        dischargeDate
      );
      
      console.log('Constant charges response:', response);
      
      if (response && Array.isArray(response)) {
        setConstantCharges(response);
      }
    } catch (error: any) {
      console.error('Error fetching constant charges:', error);
      showErrorToast('Failed to fetch IP charges');
    }
  };

  // Fetch IP bill order details
  const fetchIpBillOrderDetails = async (patId: number, ipKey: number) => {
    try {
      const response = await cashCounterApi.fetchIpBillOrderDetails(patId, ipKey);
      
      console.log('IP bill order details response:', response);
      
      if (response && Array.isArray(response)) {
        setIpItems(response);
      }
    } catch (error: any) {
      console.error('Error fetching IP bill order details:', error);
      // Don't show error toast as this might be a new patient without previous IP bills
      setIpItems([]);
    }
  };

  // Refresh IP bill order details (used after cancel operation)
  const refreshIpBillOrderDetails = async () => {
    if (patient?.patId && patient?.ipId) {
      await fetchIpBillOrderDetails(patient.patId, patient.ipId);
    }
  };

  // Handle Enter or Tab key press on OP number input
  const handleOpNumberKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === 'Tab') {
      e.preventDefault();
      handleSearchPatient();
    }
  };

  const handleProcedureKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showProcedureSuggestions || procedureSuggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedProcedureIndex(prev =>
        prev < procedureSuggestions.length - 1 ? prev + 1 : prev
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedProcedureIndex(prev => (prev > 0 ? prev - 1 : -1));
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

  // Handle procedure search
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

  // Handle procedure selection from autocomplete
  const handleProcedureSelect = (procedure: any) => {
    // Log the full procedure object to see what fields are available
    console.log('Selected procedure object:', procedure);
    
    // Try multiple possible field names for the particular ID
    const particularId = procedure.particularId || procedure.id || procedure.procId || procedure.procedureId;
    
    if (!particularId || particularId === 0) {
      console.error('No valid particularId found in procedure:', procedure);
      showErrorToast('Invalid procedure selected. Missing procedure ID. Please contact administrator.');
      return;
    }

    setNewItem({
      ...newItem,
      groupName: procedure.groupName || '',
      name: procedure.procName,
      cost: procedure.rate || 0,
      discount: procedure.charity || 0,
      particularId: particularId,
      groupId: procedure.groupId || 0,
      isEditable: procedure.isEditable ?? 0
    });
    setProcedureSearchTerm(procedure.procName);
    setShowProcedureSuggestions(false);
    setSelectedProcedureIndex(-1);
    
    // Focus on unit input after procedure selection
    setTimeout(() => {
      unitInputRef.current?.focus();
    }, 100);
  };

  // Fetch account heads and banks on mount
  useEffect(() => {
    const fetchAccountHeads = async () => {
      try {
        const heads = await cashCounterApi.fetchAccountHeads();
        console.log('Fetched account heads:', heads);
        setAccountHeads(heads);
      } catch (error: any) {
        console.error('Error fetching account heads:', error);
        // Don't show error toast if backend is not available - just log it
        // This prevents annoying popups when backend service is down
        if (error?.response?.status !== 500) {
          showErrorToast('Failed to load account heads. Please try again.');
        }
      }
    };
    
    const fetchBanks = async () => {
      try {
        const response = await medicalRecordsApi.fetchAllBankDetails();
        console.log('Fetched banks:', response);
        setBanks(response);
        // Auto-select bank with ID 1 if it exists
        const bankOne = response.find((bank: any) => bank.id === 1);
        if (bankOne) {
          setSelectedBank('1');
        }
      } catch (error: any) {
        console.error('Error fetching banks:', error);
        if (error?.response?.status !== 500) {
          showErrorToast('Failed to load bank details. Please try again.');
        }
      }
    };
    
    fetchAccountHeads();
    fetchBanks();
  }, []);

  // Close suggestions when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node) &&
          procedureNameInputRef.current && !procedureNameInputRef.current.contains(event.target as Node)) {
        setShowProcedureSuggestions(false);
        setSelectedProcedureIndex(-1);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAddItem = () => {
    if (!newItem.name) {
      showWarningToast('Please select a procedure');
      return;
    }
    
    // Validate particularId for procedure items
    if (billingType === 'procedure' && (!newItem.particularId || newItem.particularId === 0)) {
      showErrorToast('Invalid procedure selected. Please re-select from the dropdown.');
      return;
    }
    
    const total = (newItem.cost * newItem.unit) - newItem.discount;
    
    const item: BillingItem = {
      id: Date.now(),
      name: newItem.name,
      unit: newItem.unit,
      cost: newItem.cost,
      discount: newItem.discount,
      total: total > 0 ? total : 0,
      particularId: newItem.particularId,
      groupId: newItem.groupId
    };
    
    // Add groupName for procedure items
    if (billingType === 'procedure' && newItem.groupName) {
      (item as any).groupName = newItem.groupName;
    }
    
    if (billingType === 'procedure') {
      setProcedureItems([...procedureItems, item]);
    } else if (billingType === 'pharmacy') {
      setPharmacyItems([...pharmacyItems, item]);
    } else if (billingType === 'lab') {
      setLabItems([...labItems, item]);
    }
    // Reset form
    setNewItem({
      groupName: '',
      name: '',
      unit: 1,
      cost: 0,
      discount: 0,
      particularId: 0,
      groupId: 0,
      isEditable: 0
    });
    setProcedureSearchTerm('');
    
    // Focus back on procedure name input after adding item
    setTimeout(() => {
      procedureNameInputRef.current?.focus();
    }, 100);
  };

  const handleRemoveItem = (id: number) => {
    if (billingType === 'procedure') {
      setProcedureItems(procedureItems.filter(item => item.id !== id));
    } else if (billingType === 'pharmacy') {
      setPharmacyItems(pharmacyItems.filter(item => item.id !== id));
    } else if (billingType === 'lab') {
      setLabItems(labItems.filter(item => item.id !== id));
    }
  };

  const handleSaveBilling = async () => {
    // Validation
    if (!patient) {
      showWarningModal('Please search and select a patient first');
      return;
    }

    if (procedureItems.length === 0 && pharmacyItems.length === 0 && labItems.length === 0 && ipItems.length === 0) {
      showWarningModal('Please add at least one item to the bill');
      return;
    }

    // Validate visitId for OP patients
    // Consider patient as OP if they have isOp=1, isInOp=true, OR have a displayNumber (OP number)
    const hasOpNumber = !!(patient.displayNumber || opNumber);
    const isOpPatient = patient.isInOp === true || hasOpNumber;
    const visitId = patient.lastVisitId || 0;
    
    console.log('=== VISIT ID VALIDATION DEBUG ===');
    console.log('Patient displayNumber:', patient.displayNumber);
    console.log('OP Number:', opNumber);
    console.log('hasOpNumber:', hasOpNumber);
    console.log('patient.isOp:', patient.isInOp);
    console.log('patient.isInOp:', patient.isInOp);
    console.log('isOpPatient:', isOpPatient);
    console.log('patient.lastVisitId:', patient.lastVisitId);
    console.log('Final visitId:', visitId);
    console.log('================================');
    
    if (isOpPatient && visitId === 0) {
      showErrorModal('Valid visit ID is required. Please ensure patient has an active OP visit.');
      return;
    }

    // Validate investigation items have particularId
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

    // Check for balance and confirm
    if (balanceAmount > 0) {
      const balanceConfirm = await showConfirmDialog(
        `There is a balance of ₹${balanceAmount.toFixed(2)}. Do you want to proceed?`,
        'Balance Pending',
        'Yes, Save',
        'Cancel'
      );
      
      if (!balanceConfirm.isConfirmed) return;
    }

    const confirmed = await showConfirmDialog(
      'Are you sure you want to save this bill?',
      'Confirm Save'
    );

    if (!confirmed.isConfirmed) return;

    try {
      showLoading('Saving bill...');

      const grandTotal = calculateTotal();
      const totalDiscountAmount = discountType === 'rs' 
        ? totalDiscount 
        : (grandTotal * totalDiscount) / 100;
      const payableAmount = grandTotal - totalDiscountAmount;

      // Prepare investigation items (procedures)
      const investigationItems = procedureItems.map(item => ({
        groupId: item.groupId || 0,
        particularId: item.particularId!, // Use ! since we validated it's not 0 or undefined
        quantity: item.unit,
        rate: item.cost || 0,
        discount: item.discount || 0
      }));

      // Prepare pharmacy items
      const pharmacyItemsPayload = pharmacyItems.map(item => ({
        prodsId: item.prodsId || 0,
        batchId: item.batchId || 0,
        units: item.unit,
        mrp: item.salesPrice || 0,
        total: item.total,
        discountAmt: item.discount || 0,
        storeId: item.storeId || 1,
        taxType: 0,
        sgstPer: item.sgstPer || 0,
        cgstPer: item.cgstPer || 0,
        igstPer: item.igstPer || 0
      }));

      // Prepare lab items
      const labItemsPayload = labItems.map(item => ({
        testId: item.testId || 0,
        testName: item.testName || item.name || '',
        specId: 0, // You may need to add specimen selection
        deptId: item.deptId || 0,
        rate: item.rate || item.cost || 0,
        units: item.unit,
        note: ''
      }));

      // Prepare IP items
      const ipItemsPayload = ipItems.map((item) => ({
        particulars: item.particulars || item.particular || '',
        amt: Number(item.amt) || 0,
        accHeadId: patient.debitId || 0,
        headAmt: Number(item.headAmt) || 0,
        numberOfDays: Number(item.numberOfDays || item.days) || 0
      }));

      // Prepare payment - determine payment mode string
      let paymentModeString = "CASH";
      if (paymentMode === "bank") {
        paymentModeString = "BANK";
      } else if (paymentMode === "cash-bank") {
        paymentModeString = "CASH/BANK";
      }

      const payment = {
        paymentMode: paymentModeString,
        bankId: selectedBank ? Number(selectedBank) : 0,
        transType: 0,
        refNo: transactionNo,
        total: grandTotal,
        discount: totalDiscountAmount,
        payable: payableAmount,
        cashPaid: cashAmount,
        bankPaid: bankAmount,
        staffPaid: staffCreditAmount,
        companyPaid: insuranceAmount,
        dueAmt: balanceAmount
      };

      const payload = {
        patientId: patient.patId,
        visitId: isOpPatient ? visitId : 0,
        ipId: patient.ipId || 0,
        isOp: (patient.isInOp === true) ? 1 : 0,
        doctorId: Number(selectedDoctor) || patient.doctorId || 0,
        discountId: 0, // You may need to add discount person ID
        /*billType: (() => {
          // Determine billType based on which items are present
          // Priority: IP (7) > Lab (2) > Pharmacy (3) > Investigation/Procedure (4)
          if (ipItems.length > 0) return 7; // IP bill
          if (labItems.length > 0) return 2; // Lab bill
          if (pharmacyItems.length > 0) return 3; // Pharmacy bill
          if (procedureItems.length > 0) return 4; // Investigation/Procedure bill
          return 0; // Default
        })(),*/
        debitId: patient.debitId,
        investigationItems,
        pharmacyItems: pharmacyItemsPayload,
        labItems: labItemsPayload,
        ipItems: ipItemsPayload,
        payments: [payment],
        note: '',
        userId: loginData.id,
        systemIp: '0.0.0.0', // You may want to get actual IP
        isAdvance: 0,
        age: patient.age?.toString() || '',
        opNo: patient.displayNumber || opNumber,
        refDr: 0, // You may need to add referring doctor
        placeColl: '' // You may need to add place of collection
      };

      const response = await cashCounterApi.saveBilling(payload);
      closeAlert();
      
      showSuccessModal('Bill saved successfully!', 'Success');
      
      // Reset form completely for next patient
      handleResetForm();
      
    } catch (error: any) {
      closeAlert();
      console.error('Error saving bill:', error);
      
      // Parse and format error message for better user experience
      let errorMessage = error?.response?.data?.error || error?.message || 'Failed to save bill';
      
      // Clean up overpayment validation errors
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
      
      // Clean up other validation messages
      errorMessage = errorMessage
        .replace(/Billing validation failed:\s*/gi, '')
        .replace(/;\s*Total paid.*$/i, '')
        .trim();
      
      showErrorModal(errorMessage, 'Payment Error');
    }
  };

  const calculateTotal = () => {
    const ipTotal = ipItems.reduce((sum, item) => sum + (item.amt || 0), 0);
    return getProcedureTotal() + getPharmacyTotal() + getLabTotal() + ipTotal;
  };

  const getProcedureTotal = () => {
    return procedureItems.reduce((sum, item) => sum + item.total, 0);
  };

  const getProcedureDiscount = () => {
    return procedureItems.reduce((sum, item) => sum + (item.discount || 0), 0);
  };

  const getPharmacyTotal = () => {
    return pharmacyItems.reduce((sum, item) => sum + item.total, 0);
  };

  const getPharmacyDiscount = () => {
    return pharmacyItems.reduce((sum, item) => sum + (item.discount || 0), 0);
  };

  const getLabTotal = () => {
    return labItems.reduce((sum, item) => sum + item.total, 0);
  };

  const getLabDiscount = () => {
    return labItems.reduce((sum, item) => sum + (item.discount || 0), 0);
  };

  const getAdditionalDiscount = () => {
    const combinedTotal = getProcedureTotal() + getPharmacyTotal() + getLabTotal();
    if (discountType === 'percent') {
      return (combinedTotal * totalDiscount) / 100;
    }
    return totalDiscount;
  };

  const getGrandTotal = () => {
    const ipTotal = ipItems.reduce((sum, item) => sum + (item.amt || 0), 0);
    const combinedTotal = getProcedureTotal() + getPharmacyTotal() + getLabTotal() + ipTotal + dueCollected;
    return combinedTotal - getAdditionalDiscount();
  };

  // Calculate age from date of birth
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

  /* Refs for managing focus */
  /* OP Number input ref */
  const opInputRef = useRef<HTMLInputElement>(null);
  
  /* Billing type specific input refs */
  const procedureNameInputRef = useRef<HTMLInputElement>(null);
  const medicineNameInputRef = useRef<HTMLInputElement>(null);
  const testNameInputRef = useRef<HTMLInputElement>(null);
  
  /* Combined focus management - OP input initially, then shift to billing type input when patient loaded */
  useEffect(() => {
    const focusWithModalCheck = (attempt: number = 0) => {
      const isModalOpen = document.body.classList.contains('swal2-shown');
      if (isModalOpen) {
        if (attempt < 10) {
          setTimeout(() => focusWithModalCheck(attempt + 1), 100);
        }
        return;
      }

      if (!patient) {
        opInputRef.current?.focus();
        return;
      }

      console.log('⏱️ Waiting 100ms before focusing billing type input...');
      setTimeout(() => {
        if (billingType === 'procedure') {
          procedureNameInputRef.current?.focus();
        } else if (billingType === 'pharmacy') {
          medicineNameInputRef.current?.focus();
        } else if (billingType === 'lab') {
          testNameInputRef.current?.focus();
        }
      }, 100);
    };

    focusWithModalCheck();
  }, [patient, billingType]);
  /* focus ends */

  return (
    <div className="container-fluid p-2" style={{ background: '#f8f9fa', minHeight: '100vh', paddingBottom: '80px' }}>
      <style>{styles}</style>
      
      {/* Header Section */}
      

      <Row className="g-2">
        {/* Left Column: Patient & Billing Items */}
        <Col lg={8}>
          {/* Patient Search & Details */}
          <Card className="neat-card mb-1">
            <Card.Body className="p-2">
              <div className="d-flex align-items-center justify-content-between mb-2 gap-3">
                <div className="billing-type-container d-flex bg-light rounded p-1 border flex-grow-1">
                  {['Procedure', 'Pharmacy', 'Lab', 'IP', 'Return'].map((type) => (
                    <Button
                      key={type}
                      variant="link"
                      className={`billing-type-btn flex-grow-1 py-2 text-decoration-none text-center ${billingType === type.toLowerCase() ? 'active bg-white shadow-sm fw-bold text-primary' : 'text-muted'}`}
                      onClick={() => setBillingType(type.toLowerCase() as any)}
                      style={{ borderRadius: '4px', border: 'none' }}
                    >
                      {type === 'Procedure' && <FaStethoscopeIcon className="me-2" />}
                      {type === 'Pharmacy' && <FaPillsIcon className="me-2" />}
                      {type === 'Lab' && <FaFlaskIcon className="me-2" />}
                      {type === 'IP' && <FaBedIcon className="me-2" />}
                      {type === 'Return' && <FaUndoIcon className="me-2" />}
                      {type}
                    </Button>
                  ))}
                </div>

                <div className="d-flex gap-2" style={{ width: '200px' }}>
                  <div className="position-relative flex-grow-1">
                    <Form.Control
                      ref={opInputRef}
                      type="text"
                      placeholder=" "
                      value={opNumber}
                      onChange={(e) => {
                        const value = e.target.value;
                        setOpNumber(value);
                        // Reset form when OP number is cleared
                        if (!value || value.trim() === '') {
                          handleResetForm();
                        }
                      }}
                      onKeyDown={handleOpNumberKeyDown}
                      disabled={loadingPatient}
                      style={{ backgroundColor: 'white' }}
                    />
                    <label className="floating-label">OP Number</label>
                  </div>
                  <Button 
                    variant="primary" 
                    className="d-flex align-items-center justify-content-center"
                    style={{ height: '28px', width: '28px', borderRadius: '0px', padding: 0 }}
                    onClick={handleSearchPatient}
                    disabled={loadingPatient}
                  >
                    <FaSearchIcon />
                  </Button>
                </div>
              </div>

              <div className="mb-2">
                {/* Patient Details - Two Row Design */}
                <Card className="border-0 shadow-sm" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #ffffff 100%)' }}>
                  <Card.Body className="p-2">
                    <Row className="align-items-center g-2">
                      <Col md={3}>
                        <div className="d-flex align-items-center gap-2">
                          <div
                            className="d-flex align-items-center justify-content-center rounded-circle bg-white border border-primary"
                            style={{ width: '32px', height: '32px', minWidth: '32px' }}
                          >
                            <i className="fas fa-user text-primary" style={{ fontSize: '14px' }}></i>
                          </div>
                          <div className="flex-grow-1">
                            <h6
                              className="mb-0 fw-bold text-primary"
                              style={{ cursor: 'pointer', fontSize: '0.85rem' }}
                              onClick={() => setShowPatientModal(true)}
                            >
                              {patient ? patient.name : 'No Patient Selected'}
                            </h6>
                            <div className="d-flex align-items-center gap-2 mt-0">
                              <small className="text-muted" style={{ fontSize: '0.7rem' }}>
                                <i className="fas fa-id-card me-1"></i>
                                {patient ? patient.displayNumber : '---'}
                              </small>
                            </div>
                          </div>
                        </div>
                      </Col>
                      <Col md={2}>
                        <div className="d-flex align-items-center gap-2">
                          <i className="fas fa-calendar-alt text-muted" style={{ fontSize: '0.85rem' }}></i>
                          <div>
                            <small className="text-muted d-block" style={{ fontSize: '0.65rem' }}>AGE / SEX</small>
                            <span className="fw-semibold" style={{ fontSize: '0.75rem' }}>
                              {patient ? `${calculateAge(patient.dob)}Y / ${patient.sex}` : '-- / --'}
                            </span>
                          </div>
                        </div>
                      </Col>
                      <Col md={2}>
                        <div className="d-flex align-items-center gap-2">
                          <i className="fas fa-wallet text-info" style={{ fontSize: '0.85rem' }}></i>
                          <div>
                            <small className="text-muted d-block" style={{ fontSize: '0.65rem' }}>ACCOUNT</small>
                            <span className="fw-semibold" style={{ fontSize: '0.75rem' }}>
                              {patient ? patient.debitHead : '---'}
                            </span>
                          </div>
                        </div>
                      </Col>
                      <Col md={3}>
                        <div className="d-flex align-items-center gap-2">
                          <i className="fas fa-user-md text-success" style={{ fontSize: '0.85rem' }}></i>
                          <div>
                            <small className="text-muted d-block" style={{ fontSize: '0.65rem' }}>CONSULTING DOCTOR</small>
                            <span className="fw-semibold" style={{ fontSize: '0.75rem' }}>
                              {patient && patient.doctorName ? patient.doctorName : '---'}
                            </span>
                          </div>
                        </div>
                      </Col>
                      <Col md={1} className="text-end">
                        <Badge
                          bg=""
                          className="px-2 py-1"
                          style={{
                            fontSize: '0.7rem',
                            backgroundColor: 'transparent !important',
                            color: patient?.isInIp ? '#000000ff' : patient?.isInOp ? '#000000ff' : '#00050aff',
                            border: `1px solid ${patient?.isInIp ? '#020000ff' : patient?.isInOp ? '#000000ff' : '#000407ff'}`
                          }}
                        >
                          <i className={`fas ${patient?.isInIp ? 'fa-bed' : 'fa-walking'} me-1`} style={{ fontSize: '0.7rem' }}></i>
                          {patient ? (patient.isInIp ? 'IP' : patient.isInOp ? 'OP' : 'N/A') : 'N/A'}
                        </Badge>
                      </Col>
                      <Col md={1}>
                        {patient && patient.isInIp && patient.wardName && patient.bedNo ? (
                          <div className="d-flex align-items-center gap-2">
                            <i className="fas fa-hospital text-danger" style={{ fontSize: '0.85rem' }}></i>
                            <div>
                              <small className="text-muted d-block" style={{ fontSize: '0.65rem' }}>WARD / BED</small>
                              <span className="fw-bold text-danger" style={{ fontSize: '0.75rem' }}>
                                {patient.wardName} / {patient.bedNo}
                              </span>
                            </div>
                          </div>
                        ) : (
                          <div className="d-flex align-items-center gap-2">
                            <i className="fas fa-hospital text-danger" style={{ fontSize: '0.85rem' }}></i>
                            <div>
                              <small className="text-muted d-block" style={{ fontSize: '0.65rem' }}>WARD / BED</small>
                              <span className="fw-bold text-danger" style={{ fontSize: '0.75rem' }}>
                                ---
                              </span>
                            </div>
                          </div>
                        )}
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              </div>
            </Card.Body>
          </Card>

            {/* Procedure Content */}
            {billingType === 'procedure' && (
            <Card className="neat-card" style={{height: 'calc(100vh - 250px)', display: 'flex', flexDirection: 'column'}}>
              <Card.Body className="p-0" style={{flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>
                {/* Module Details Header */}
                <div className="d-flex align-items-center px-3 py-1 bg-light border-bottom">
                  <FaStethoscopeIcon className="me-2 text-primary" />
                  <span className="text-muted fw-bold text-uppercase small letter-spacing-1">Procedure Details</span>
                </div>
                {/* Item Entry */}
                <div className="p-2 bg-white border-bottom" style={{flexShrink: 0}}>
                  <Row className="g-2 align-items-center">
                    <Col md={5}>
                      <div className="position-relative">
                        <Form.Control
                          ref={procedureNameInputRef}
                          placeholder=" "
                          value={procedureSearchTerm}
                          onChange={(e) => handleProcedureSearch(e.target.value)}
                          onFocus={() => procedureSuggestions.length > 0 && setShowProcedureSuggestions(true)}
                          onKeyDown={handleProcedureKeyDown}
                          style={{ height: '28px', backgroundColor: 'white' }}
                          autoComplete="off"
                        />
                        <label className="floating-label">Procedures Name</label>
                        
                        {/* Autocomplete Dropdown */}
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
                              marginTop: '2px'
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
                                  backgroundColor: selectedProcedureIndex === index ? '#f8f9fa' : 'white'
                                }}
                                onMouseEnter={() => setSelectedProcedureIndex(index)}
                              >
                                <div style={{ fontWeight: 'var(--font-weight-medium)', color: '#212529' }}>{proc.procName}</div>
                                <div style={{ fontSize: '11px', color: '#6c757d', marginTop: '2px' }}>
                                  Group: {proc.groupName} | Rate: ₹{proc.rate} | Charity: ₹{proc.charity}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
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
                          onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                          style={{ height: '28px', backgroundColor: 'white' }}
                        />
                        <label className="floating-label">Unit</label>
                      </div>
                    </Col>
                    <Col md={2}>
                      <div className="position-relative">
                        <Form.Control 
                          type="number"
                          placeholder=" "
                          value={newItem.cost}
                          readOnly={newItem.isEditable === 0}
                          className="bg-light" 
                          onChange={(e) => setNewItem({...newItem, cost: parseFloat(e.target.value) || 0})}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                          style={{ height: '28px', backgroundColor: 'white' }}
                        />
                        <label className="floating-label">Cost</label>
                      </div>
                    </Col>
                    <Col md={1}>
                      <div className="position-relative">
                        <Form.Control 
                          type="number"
                          placeholder=" "
                          value={newItem.discount}
                          onChange={(e) => setNewItem({...newItem, discount: parseFloat(e.target.value) || 0})}
                          onKeyDown={(e) => e.key === 'Enter' && handleAddItem()}
                          style={{ height: '28px', backgroundColor: 'white' }}
                        />
                        <label className="floating-label">Disc</label>
                      </div>
                    </Col>
                    <Col md={3}>
                      <div className="d-flex gap-2 align-items-center">
                        <div className="d-flex flex-column">
                          <span style={{ fontSize: 'var(--font-size-xs)', color: '#6c757d', fontWeight: 'var(--font-weight-normal)' }}>Total</span>
                          <span style={{ fontSize: 'var(--font-size-lg)', fontWeight: 'var(--font-weight-semibold)', color: '#212529' }}>
                            ₹{((newItem.cost * newItem.unit) - newItem.discount).toFixed(2)}
                          </span>
                        </div>
                        <Button 
                          variant="primary"
                          onClick={handleAddItem} 
                          style={{ height: '28px', width: '38px', padding: 0, borderRadius: '0px' }}
                          className="d-flex align-items-center justify-content-center ms-auto"
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
                        <th className="py-2 border-0" style={{width: '15%'}}>Group Name</th>
                        <th className="py-2 border-0" style={{width: '35%'}}>Procedures Name</th>
                        <th className="text-center py-2 border-0" style={{width: '10%'}}>Unit</th>
                        <th className="text-end py-2 border-0" style={{width: '10%'}}>Cost</th>
                        <th className="text-end py-2 border-0" style={{width: '10%'}}>Discount</th>
                        <th className="text-end py-2 border-0" style={{width: '10%'}}>Total</th>
                        <th className="text-center py-2 border-0" style={{width: '5%'}}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {procedureItems.length === 0 ? (
                        <tr>
                          <td colSpan={8} className="text-center py-5 text-muted border-0">
                            <div className="d-flex flex-column align-items-center">
                              <FaStethoscopeIcon size={32} className="mb-2 opacity-25" />
                              <p className="mb-0">No procedures added yet</p>
                              <small>Add procedures using the form above</small>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        procedureItems.map((item, index) => (
                          <tr key={item.id}>
                            <td className="ps-4 py-2 border-bottom-0">{index + 1}</td>
                            <td className="py-2 border-bottom-0"><Badge bg="light" className="text-dark border fw-normal">{item.groupName || ''}</Badge></td>
                            <td className="fw-medium py-2 border-bottom-0">{item.name || ''}</td>
                            <td className="text-center py-2 border-bottom-0">{item.unit || 0}</td>
                            <td className="text-end py-2 border-bottom-0">{(item.cost || 0).toFixed(2)}</td>
                            <td className="text-end text-success py-2 border-bottom-0">-{(item.discount || 0).toFixed(2)}</td>
                            <td className="text-end fw-bold py-2 border-bottom-0">{(item.total || 0).toFixed(2)}</td>
                            <td className="text-center py-2 border-bottom-0">
                              <Button 
                                variant="link" 
                                className="text-danger p-0" 
                                onClick={() => handleRemoveItem(item.id)}
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
            )}

            {/* Pharmacy Billing */}
            {billingType === 'pharmacy' && (
              <PharmacyBilling 
                items={pharmacyItems as any}
                resetTrigger={resetTrigger}
                onAddItem={(item) => {
                  const total = (item.salesPrice || 0) * item.unit;
                  const newItemWithId = {
                    ...item,
                    id: Date.now(),
                    total: total > 0 ? total : 0
                  };
                  setPharmacyItems([...pharmacyItems, newItemWithId as any]);
                }}
                onRemoveItem={(id) => setPharmacyItems(pharmacyItems.filter(item => item.id !== id))}
                medicineNameInputRef={medicineNameInputRef}
              />
            )}

            {/* Lab Billing */}
            {billingType === 'lab' && (() => {
              console.log('=== LAB BILLING RENDER ===');
              
              // Find account head ID from the account category name (same logic as procedure autocomplete)
              let headId = null;
              if (patient?.debitHead) {
                const accountHead = accountHeads.find(head => {
                  return (
                    head.headName === patient.debitHead
                  );
                });
                
                if (accountHead) {
                  headId = accountHead.headId;
                  console.log('Found account head:', accountHead.headName, 'ID:', headId);
                } else {
                  console.log('Account head not found for:', patient.debitHead);
                }
              }
              
              const patientProp = headId ? { headId } : null;
              console.log('Billing.tsx - Final selectedPatient prop for LabBilling:', patientProp);
              console.log('=========================');
              
              return (
                <LabBilling 
                  items={labItems as any}
                  resetTrigger={resetTrigger}
                  onAddItem={(item) => {
                    const total = ((item.rate || 0) * item.unit) - (item.discount || 0);
                    const newItemWithId = {
                      ...item,
                      id: Date.now(),
                      total: total > 0 ? total : 0
                    };
                    setLabItems([...labItems, newItemWithId as any]);
                  }}
                  onRemoveItem={(id) => setLabItems(labItems.filter(item => item.id !== id))}
                  selectedPatient={patientProp}
                  testNameInputRef={testNameInputRef}
                />
              );
            })()}

            {/* IP Billing */}
            {billingType === 'ip' && (() => {
              // Find account head ID from patient's account category
              let accountHeadId = null;
              if (patient?.debitHead) {
                const accountHead = accountHeads.find(head => 
                  head.headName === patient.debitHead
                );
                if (accountHead) {
                  accountHeadId = accountHead.headId;
                  console.log('IP Billing - Found account head:', accountHead.headName, 'ID:', accountHeadId);
                }
              }
              
              return (
                <IPBilling 
                  key={`ip-billing-${resetTrigger}`}
                  constantCharges={constantCharges}
                  billDateTime={billDateTime}
                  showBillDate={showBillDate}
                  onBillDateTimeChange={setBillDateTime}
                  onShowBillDateChange={setShowBillDate}
                  patientId={patient?.patId}
                  ipKey={patient?.ipId}
                  advance={patient?.advBalance || 0}
                  prevBalance={patient?.dueBalance || 0}
                  accountHeadId={accountHeadId || undefined}
                  ipItems={ipItems}
                  onRefreshIpItems={refreshIpBillOrderDetails}
                />
              );
            })()}

            {/* Return Billing */}
            {billingType === 'return' && <ReturnBilling />}
          </Col>

          {/* RIGHT SIDE - 30% */}
          <Col md={4}>
            {billingType && (
            <Card className="neat-card" style={{height: 'calc(100vh - 70px)', display: 'flex', flexDirection: 'column'}}>
              <Card.Header className="p-0 bg-white">
                {/* Payment Details Header */}
                <div className="d-flex align-items-center px-3 py-1 bg-light border-bottom">
                  <FaMoneyBillWaveIcon className="me-2 text-success" />
                  <span className="text-muted fw-bold text-uppercase small letter-spacing-1">Payment Details</span>
                </div>
                
                {/* Patient Balance & Advance - Show if patient is selected */}
                {patient && (
                  <div className="p-2 bg-success bg-opacity-10 border-bottom">
                    <Row className="g-2">
                      <Col xs={6} onClick={() => setShowDueModal(true)} style={{cursor: 'pointer'}}>
                        <div className="d-flex justify-content-between align-items-center p-2 bg-white rounded border border-success border-opacity-25 hover-bg-light">
                          <span className="small text-muted fw-bold text-uppercase">BALANCE <FaExternalLinkAltIcon className="ms-1 text-muted" size={8} /></span>
                          <span className="fw-bold text-danger">₹{(patient.dueBalance || 0).toFixed(2)}</span>
                        </div>
                      </Col>
                      <Col xs={6} onClick={() => setShowAdvanceModal(true)} style={{cursor: 'pointer'}}>
                        <div className="d-flex justify-content-between align-items-center p-2 bg-white rounded border border-success border-opacity-25 hover-bg-light">
                          <span className="small text-muted fw-bold text-uppercase">ADVANCE <FaExternalLinkAltIcon className="ms-1 text-muted" size={8} /></span>
                          <span className="fw-bold text-success">₹{(patient.advBalance || 0).toFixed(2)}</span>
                        </div>
                      </Col>
                    </Row>
                  </div>
                )}
                
              </Card.Header>
              <Card.Body className="p-4" style={{overflowY: 'auto', flex: 1}}>
                
                {/* Financial Summary */}
                <div className="bg-light rounded-3 p-3 mb-2 border">
                  {/* Procedure Row */}
                  <div className="d-flex justify-content-between align-items-center py-1 border-bottom border-light">
                    <span className="text-muted small fw-medium">Procedure</span>
                    <div className="text-end">
                      {getProcedureDiscount() > 0 && <span className="text-success small me-2">(-₹{getProcedureDiscount().toFixed(2)})</span>}
                      <span className="fw-bold text-dark">₹{getProcedureTotal().toFixed(2)}</span>
                    </div>
                  </div>
                  
                  {/* Pharmacy Row */}
                  <div className="d-flex justify-content-between align-items-center py-1 border-bottom border-light">
                    <span className="text-muted small fw-medium">Pharmacy</span>
                    <div className="text-end">
                      {getPharmacyDiscount() > 0 && <span className="text-success small me-2">(-₹{getPharmacyDiscount().toFixed(2)})</span>}
                      <span className="fw-bold text-dark">₹{getPharmacyTotal().toFixed(2)}</span>
                    </div>
                  </div>
                  
                  {/* Lab Row */}
                  <div className="d-flex justify-content-between align-items-center py-1 border-bottom border-light">
                    <span className="text-muted small fw-medium">Lab</span>
                    <div className="text-end">
                      {getLabDiscount() > 0 && <span className="text-success small me-2">(-₹{getLabDiscount().toFixed(2)})</span>}
                      <span className="fw-bold text-dark">₹{getLabTotal().toFixed(2)}</span>
                    </div>
                  </div>

                  {/* IP Row - Only show if IP items exist */}
                  {ipItems.length > 0 && (
                    <div 
                      className="d-flex justify-content-between align-items-center py-1 border-bottom border-light"
                      style={{ backgroundColor: '#e3f2fd', cursor: 'pointer' }}
                      onClick={() => setBillingType('ip')}
                      title="Click to view IP bill details"
                    >
                      <span className="text-muted small fw-medium">IP</span>
                      <span className="fw-bold text-primary">₹{ipItems.reduce((sum, item) => sum + (item.amt || 0), 0).toFixed(2)}</span>
                    </div>
                  )}

                  {/* Due Row - Only show if due amount is collected */}
                  {dueCollected > 0 && (
                    <div className="d-flex justify-content-between align-items-center py-1 border-bottom border-light" style={{ backgroundColor: '#e8f5f3' }}>
                      <span className="text-muted small fw-medium">Due</span>
                      <span className="fw-bold text-success">₹{dueCollected.toFixed(2)}</span>
                    </div>
                  )}

                  {/* Discounts */}
                  <div className="d-flex justify-content-between align-items-center py-1 border-bottom border-light">
                    <span className="text-muted small fw-medium">Total Discount</span>
                    <span className="text-success fw-bold">-₹{(getProcedureDiscount() + getPharmacyDiscount() + getLabDiscount()).toFixed(2)}</span>
                  </div>
                  
                  <div className="mt-3">
                    <Row className="g-2">
                      <Col xs={5}>
                        <span className="text-muted small fw-bold text-uppercase">Discount</span>
                      </Col>
                      <Col xs={3}>
                        <div className="btn-group w-100" role="group">
                          <button 
                            type="button" 
                            className={`btn btn-sm btn-outline-secondary ${discountType === 'rs' ? 'active' : ''}`}
                            onClick={() => setDiscountType('rs')}
                            style={{ borderRadius: '0px', height: '28px' }}
                          >₹</button>
                          <button 
                            type="button" 
                            className={`btn btn-sm btn-outline-secondary ${discountType === 'percent' ? 'active' : ''}`}
                            onClick={() => setDiscountType('percent')}
                            style={{ borderRadius: '0px', height: '28px' }}
                          >%</button>
                        </div>
                      </Col>
                      <Col xs={4}>
                        <div className="position-relative">
                          <Form.Control 
                            type="number"
                            value={totalDiscount}
                            onChange={(e) => setTotalDiscount(parseFloat(e.target.value) || 0)}
                            placeholder=" "
                            style={{ height: '28px', backgroundColor: 'white' }}
                          />
                          <label className="floating-label">Value</label>
                        </div>
                      </Col>
                      <Col xs={5} hidden>
                        <div className="position-relative">
                          <Form.Control 
                            type="text"
                            value={discountGivenBy}
                            onChange={(e) => setDiscountGivenBy(e.target.value)}
                            placeholder=" "
                            style={{ height: '28px', backgroundColor: 'white' }}
                          />
                          <label className="floating-label">Auth By</label>
                        </div>
                      </Col>
                    </Row>
                  </div>
                  
                  <div className="d-flex justify-content-between align-items-center mt-0 pt-2 border-top border-2">
                    <span className="fw-bold text-dark h5 mb-0">Grand Total</span>
                    <span className="fw-bold h4 mb-0 text-primary">₹{getGrandTotal().toFixed(2)}</span>
                  </div>
                </div>

                {/* Payment Mode Selection */}
                <div className="mb-2">
                  <Form.Label className="small text-muted fw-bold text-uppercase mb-1">Payment Mode</Form.Label>
                  <div className="d-flex bg-light rounded p-1 border">
                    <div className="flex-grow-1">
                      <input
                        type="radio"
                        className="btn-check"
                        name="paymentMode"
                        id="paymentCash"
                        checked={paymentMode === 'cash'}
                        onChange={() => setPaymentMode('cash')}
                      />
                      <label className={`btn btn-sm w-100 border-0 rounded py-2 ${paymentMode === 'cash' ? 'bg-white shadow-sm fw-bold text-primary' : 'text-muted'}`} htmlFor="paymentCash">
                        <FaMoneyBillWaveIcon className="me-2" />Cash
                      </label>
                    </div>
                    <div className="flex-grow-1">
                      <input
                        type="radio"
                        className="btn-check"
                        name="paymentMode"
                        id="paymentBank"
                        checked={paymentMode === 'bank'}
                        onChange={() => setPaymentMode('bank')}
                      />
                      <label className={`btn btn-sm w-100 border-0 rounded py-2 ${paymentMode === 'bank' ? 'bg-white shadow-sm fw-bold text-primary' : 'text-muted'}`} htmlFor="paymentBank">
                        <FaCreditCardIcon className="me-2" />Bank
                      </label>
                    </div>
                    <div className="flex-grow-1">
                      <input
                        type="radio"
                        className="btn-check"
                        name="paymentMode"
                        id="paymentSplit"
                        checked={paymentMode === 'cash-bank'}
                        onChange={() => setPaymentMode('cash-bank')}
                      />
                      <label className={`btn btn-sm w-100 border-0 rounded py-2 ${paymentMode === 'cash-bank' ? 'bg-white shadow-sm fw-bold text-primary' : 'text-muted'}`} htmlFor="paymentSplit">
                        <FaExchangeAltIcon className="me-2" />Split
                      </label>
                    </div>
                  </div>
                </div>

                {/* Payment Details Inputs */}
                <div className="mb-4">
                  <Row className="g-3">
                    {/* Row 1: Bank Type, Bank Name, Transaction No */}
                    {(paymentMode === 'bank' || paymentMode === 'cash-bank') && (
                      <>
                        <Col xs={4}>
                          <div className="position-relative">
                            <Form.Select 
                              value={bankMode}
                              onChange={(e) => setBankMode(e.target.value as any)}
                              style={{ height: '28px' }}
                            >
                              <option value="upi">UPI</option>
                              <option value="card">Card</option>
                              <option value="neft">NEFT</option>
                              <option value="cheque">Cheque</option>
                            </Form.Select>
                            <label className="floating-label-select">Bank Type</label>
                          </div>
                        </Col>
                        <Col xs={4}>
                          <div className="position-relative">
                            <Form.Select 
                              value={selectedBank}
                              onChange={(e) => setSelectedBank(e.target.value)}
                              style={{ height: '28px' }}
                            >
                              <option value="">Select Bank</option>
                              {banks.filter(bank => bank.isActive === 1).map(bank => (
                                <option key={bank.id} value={bank.id}>{bank.name}</option>
                              ))}
                            </Form.Select>
                            <label className="floating-label-select">Bank Name</label>
                          </div>
                        </Col>
                        <Col xs={4}>
                          <div className="position-relative">
                            <Form.Control 
                              type="text" 
                              placeholder=" "
                              value={transactionNo}
                              onChange={(e) => setTransactionNo(e.target.value)}
                              style={{ height: '28px', backgroundColor: 'white' }}
                            />
                            <label className="floating-label">Trans No</label>
                          </div>
                        </Col>
                      </>
                    )}
                    
                    {/* Row 2: Cash and Bank Amount */}
                    {(paymentMode === 'cash' || paymentMode === 'cash-bank') && (
                      <Col xs={6}>
                        <div className="position-relative">
                          <Form.Control 
                            type="number"
                            placeholder="0"
                            value={formatNumberDisplay(cashAmount)}
                            onChange={(e) => handleCashAmountChange(handleNumberChange(e.target.value))}
                            onBlur={(e) => handleCashAmountChange(handleNumberBlur(e.target.value))}
                            min="0"
                            step="0.01"
                            style={{ height: '28px', backgroundColor: 'white' }}
                          />
                          <label className="floating-label">Cash Received</label>
                        </div>
                      </Col>
                    )}
                    {(paymentMode === 'bank' || paymentMode === 'cash-bank') && (
                      <Col xs={6}>
                        <div className="position-relative">
                          <Form.Control 
                            type="number"
                            placeholder="0"
                            value={formatNumberDisplay(bankAmount)}
                            onChange={(e) => handleBankAmountChange(handleNumberChange(e.target.value))}
                            onBlur={(e) => handleBankAmountChange(handleNumberBlur(e.target.value))}
                            min="0"
                            step="0.01"
                            style={{ height: '28px', backgroundColor: 'white' }}
                          />
                          <label className="floating-label">Bank Amount</label>
                        </div>
                      </Col>
                    )}
                    
                    {/* Row 3: Staff Credit and Insurance */}
                    <Col xs={6}>
                      <div className="position-relative">
                        <Form.Control 
                          type="number" 
                          placeholder="0" 
                          value={formatNumberDisplay(staffCreditAmount)}
                          onChange={(e) => handleStaffCreditAmountChange(handleNumberChange(e.target.value))}
                          onBlur={(e) => handleStaffCreditAmountChange(handleNumberBlur(e.target.value))}
                          min="0"
                          step="0.01"
                          disabled={!isStaffEnabled}
                          style={{ height: '28px', backgroundColor: 'white' }} 
                        />
                        <label className="floating-label">Staff Credit</label>
                      </div>
                    </Col>
                    <Col xs={6}>
                      <div className="position-relative">
                        <Form.Control 
                          type="number" 
                          placeholder="0" 
                          value={formatNumberDisplay(insuranceAmount)}
                          onChange={(e) => handleInsuranceAmountChange(handleNumberChange(e.target.value))}
                          onBlur={(e) => handleInsuranceAmountChange(handleNumberBlur(e.target.value))}
                          min="0"
                          step="0.01"
                          disabled={!isInsuranceEnabled}
                          style={{ height: '28px', backgroundColor: 'white' }} 
                        />
                        <label className="floating-label">Insurance</label>
                      </div>
                    </Col>
                    
                    {/* Row 4: Balance Box */}
                    <Col xs={12}>
                      <div className="position-relative">
                        <Form.Control 
                          type="number"
                          placeholder=" "
                          value={balanceAmount.toFixed(2)}
                          readOnly
                          className="fw-bold text-danger"
                          style={{ height: '28px', backgroundColor: 'white' }}
                        />
                        <label className="floating-label">Balance Amount</label>
                      </div>
                    </Col>
                  </Row>
                </div>
              </Card.Body>
            </Card>
            )}
          </Col>
        </Row>

      {/* Fixed Bottom Action Bar - Always visible */}
      {billingType && (
      <div className="bg-white  p-3 shadow-lg" style={{
        position: 'fixed', 
        bottom: 0, 
        left: collapsed ? 0 : 'var(--sidebar-width, 250px)', 
        right: 0, 
        zIndex: 1000,
        transition: 'left 0.3s ease'
      }}>
        <Container fluid>
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
              <Button variant="info" size="sm" onClick={() => setShowModal(true)} disabled={procedureItems.length === 0 && pharmacyItems.length === 0 && labItems.length === 0} className="text-white px-3 fw-bold">
                 View Details
              </Button>
               <div className="vr text-muted"></div>
               <div className="text-muted small">
                 <span className="fw-bold text-dark">Total Items:</span> {procedureItems.length + pharmacyItems.length + labItems.length}
               </div>
               <div className="vr text-muted"></div>
               <div className="text-muted small">
                 <span className="fw-bold text-dark">Total Amount:</span> <span className="text-primary fw-bold">₹{getGrandTotal().toFixed(2)}</span>
               </div>
            </div>
            <div className="d-flex gap-2">
              <Button 
                variant="outline-secondary" 
                size="sm" 
                className="px-3"
                onClick={handleResetForm}
                disabled={!patient}
              >
                <FaUndoIcon className="me-2" /> Reset
              </Button>
              <Button variant="outline-secondary" size="sm" className="px-3" disabled={!patient}>
                <FaCopyIcon className="me-2" /> Duplicate
              </Button>
              <Button variant="outline-primary" size="sm" className="px-3" disabled={!patient}>
                <FaPrintIcon className="me-2" /> Print Bill
              </Button>
              <Button 
                size="sm" 
                disabled={!patient || (procedureItems.length === 0 && pharmacyItems.length === 0 && labItems.length === 0 && ipItems.length === 0)} 
                className="px-4 fw-bold"
                style={{ backgroundColor: '#3182ce', borderColor: '#3182ce' }}
                onClick={handleSaveBilling}
              >
                <FaSaveIcon className="me-2" /> Save Bill
              </Button>
            </div>
          </div>
        </Container>
      </div>
      )}

      {/* Items Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="fw-bold text-dark">
            {billingType === 'procedure' ? 'All Procedure Items' : 
             billingType === 'pharmacy' ? 'All Pharmacy Items' : 
             billingType === 'lab' ? 'All Lab Items' : 
             billingType === 'ip' ? 'All IP Items' : 'All Items'}
          </Modal.Title>
          <div className="d-flex gap-2 ms-auto me-3">
            <Button variant="success" size="sm">
              <FaSaveIcon className="me-1" /> Order
            </Button>
            <Button variant="secondary" size="sm" onClick={() => setShowModal(false)}>
              Close
            </Button>
            <Button size="sm" style={{backgroundColor: '#3182ce', color: 'white', border: 'none'}}>
              <FaPrintIcon className="me-1" /> Print
            </Button>
          </div>
        </Modal.Header>
        <Modal.Body style={{maxHeight: '60vh', overflowY: 'auto', padding: 0}}>
          <Table hover className="mb-0" style={{fontSize: '0.85rem'}}>
            <thead className="bg-light text-muted text-uppercase" style={{position: 'sticky', top: 0, zIndex: 1, fontSize: '0.7rem'}}>
              {billingType === 'procedure' && (
                <tr>
                  <th className="py-2">#</th>
                  <th className="py-2">Group Name</th>
                  <th className="py-2">Procedure Name</th>
                  <th className="text-center py-2">Unit</th>
                  <th className="text-end py-2">Cost</th>
                  <th className="text-end py-2">Discount</th>
                  <th className="text-end py-2">Total</th>
                  <th className="text-center py-2">Action</th>
                </tr>
              )}
              {billingType === 'pharmacy' && (
                <tr>
                  <th className="py-2">#</th>
                  <th className="py-2">Generic Name</th>
                  <th className="py-2">Medicine Name</th>
                  <th className="py-2">Batch</th>
                  <th className="text-center py-2">Unit</th>
                  <th className="text-end py-2">Stock</th>
                  <th className="text-end py-2">MRP</th>
                  <th className="text-end py-2">Total</th>
                  <th className="text-center py-2">Action</th>
                </tr>
              )}
              {billingType === 'lab' && (
                <tr>
                  <th className="py-2">#</th>
                  <th className="py-2">Dept Name</th>
                  <th className="py-2">Test Name</th>
                  <th className="text-center py-2" hidden>Unit</th>
                  <th className="text-end py-2">Rate</th>
                  <th className="text-end py-2">Discount</th>
                  <th className="text-end py-2">Total</th>
                  <th className="text-center py-2">Action</th>
                </tr>
              )}
            </thead>
            <tbody>
              {billingType === 'procedure' && procedureItems.map((item, index) => (
                <tr key={item.id}>
                  <td className="py-2">{index + 1}</td>
                  <td className="py-2"><Badge bg="light" text="dark" className="border" style={{fontSize: '0.7rem'}}>{item.groupName || ''}</Badge></td>
                  <td className="fw-medium py-2">{item.name || ''}</td>
                  <td className="text-center py-2">{item.unit || 0}</td>
                  <td className="text-end py-2">₹{(item.cost || 0).toFixed(2)}</td>
                  <td className="text-end text-success py-2">-₹{(item.discount || 0).toFixed(2)}</td>
                  <td className="text-end fw-bold py-2" style={{color: '#3182ce'}}>₹{(item.total || 0).toFixed(2)}</td>
                  <td className="text-center py-2">
                    <Button 
                      variant="link" 
                      className="text-danger p-0" 
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      <FaTrashIcon size={14} />
                    </Button>
                  </td>
                </tr>
              ))}
              {billingType === 'pharmacy' && pharmacyItems.map((item, index) => (
                <tr key={item.id}>
                  <td className="py-2">{index + 1}</td>
                  <td className="fw-medium py-2">{item.genericName || ''}</td>
                  <td className="fw-medium py-2">{item.medicineName || ''}</td>
                  <td className="py-2"><Badge bg="light" text="dark" className="border" style={{fontSize: '0.7rem'}}>{item.batch || ''}</Badge></td>
                  <td className="text-center py-2">{item.unit || 0}</td>
                  <td className="text-end py-2">{(item.stock || 0)}</td>
                  <td className="text-end py-2">₹{(item.salesPrice || 0).toFixed(2)}</td>
                  <td className="text-end fw-bold py-2" style={{color: '#3182ce'}}>₹{(item.total || 0).toFixed(2)}</td>
                  <td className="text-center py-2">
                    <Button 
                      variant="link" 
                      className="text-danger p-0" 
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      <FaTrashIcon size={14} />
                    </Button>
                  </td>
                </tr>
              ))}
              {billingType === 'lab' && labItems.map((item, index) => (
                <tr key={item.id}>
                  <td className="py-2">{index + 1}</td>
                  <td className="fw-medium py-2">{item.deptName || ''}</td>
                  <td className="fw-medium py-2">{item.testName || ''}</td>
                  <td className="text-center py-2" hidden>{item.unit || 0}</td>
                  <td className="text-end py-2">₹{(item.rate || 0).toFixed(2)}</td>
                  <td className="text-end text-success py-2">-₹{(item.discount || 0).toFixed(2)}</td>
                  <td className="text-end fw-bold py-2" style={{color: '#3182ce'}}>₹{(item.total || 0).toFixed(2)}</td>
                  <td className="text-center py-2">
                    <Button 
                      variant="link" 
                      className="text-danger p-0" 
                      onClick={() => handleRemoveItem(item.id)}
                    >
                      <FaTrashIcon size={14} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
            <tfoot className="bg-light fw-bold" style={{position: 'sticky', bottom: 0}}>
              <tr>
                <td colSpan={billingType === 'pharmacy' ? 8 : 7} className="text-end py-3">Grand Total:</td>
                <td className="text-end py-3 fs-6" style={{color: '#3182ce'}}>₹{calculateTotal().toFixed(2)}</td>
              </tr>
            </tfoot>
          </Table>
        </Modal.Body>
      </Modal>

      {/* Patient Details Modal */}
      <Modal show={showPatientModal} onHide={() => setShowPatientModal(false)} centered>
        <Modal.Header closeButton className="text-white" style={{backgroundColor: '#3182ce'}}>
          <Modal.Title className="fs-5">Patient Profile</Modal.Title>
        </Modal.Header>
        <Modal.Body className="p-0">
          {patient && (
            <div>
              <div className="bg-light p-4 text-center border-bottom">
                <div className="bg-white rounded-circle shadow-sm d-inline-flex align-items-center justify-content-center mb-3" style={{width: '80px', height: '80px'}}>
                  <FaUserIcon size={40} style={{color: '#3182ce'}} />
                </div>
                <h5 className="mb-1 fw-bold">{patient.name}</h5>
                <p className="text-muted mb-2">{patient.displayNumber}</p>
                <Badge bg={patient.isInOp && !patient.isInIp ? 'success' : 'warning'} className="px-3 py-2 rounded-pill">
                  {patient.isInIp ? 'Inpatient' : patient.isInOp ? 'Outpatient' : 'N/A'}
                </Badge>
              </div>
              <div className="p-4">
                <Row className="g-4">
                  <Col xs={6}>
                    <div className="mb-1 text-muted small text-uppercase">Age / Gender</div>
                    <div className="fw-medium">{calculateAge(patient.dob)} Years / {patient.sex}</div>
                  </Col>
                  <Col xs={6}>
                    <div className="mb-1 text-muted small text-uppercase">Account Category</div>
                    <div className="fw-medium">{patient.accountCategory || 'N/A'}</div>
                  </Col>
                  <Col xs={6}>
                    <div className="mb-1 text-muted small text-uppercase">Mobile Number</div>
                    <div className="fw-medium">{patient.phone}</div>
                  </Col>
                  <Col xs={6}>
                    <div className="mb-1 text-muted small text-uppercase">Consulting Doctor</div>
                    <div className="fw-medium">{patient.doctorName}</div>
                  </Col>
                  <Col xs={12}>
                    <div className="mb-1 text-muted small text-uppercase">Address</div>
                    <div className="fw-medium">{[patient.add1, patient.add2].filter(Boolean).join(', ') || 'N/A'}</div>
                  </Col>
                </Row>
              </div>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="secondary" onClick={() => setShowPatientModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      <DueBillsModal
        show={showDueModal}
        onHide={() => setShowDueModal(false)}
        billingType={billingType}
        dueBills={getCurrentDueBills()}
        selectedDues={selectedDues}
        banks={banks.filter(bank => bank.isActive === 1)}
        patientId={patient?.patId ?? undefined}
        visitId={patient?.lastVisitId}
        ipId={patient?.ipId ?? undefined}
        onToggleDue={(id, checked) => {
          if (checked) {
            setSelectedDues([...selectedDues, id]);
          } else {
            setSelectedDues(selectedDues.filter((dueId) => dueId !== id));
          }
        }}
        onPaymentComplete={(paymentData) => handleDuePaymentComplete(paymentData)}
      />

      <AdvanceModal
        show={showAdvanceModal}
        onHide={() => setShowAdvanceModal(false)}
        advanceMode={advanceMode}
        onChangeAdvanceMode={(mode) => setAdvanceMode(mode)}
        advancePaymentMode={advancePaymentMode}
        onChangeAdvancePaymentMode={(mode) => setAdvancePaymentMode(mode)}
        advanceBankMode={advanceBankMode}
        onChangeAdvanceBankMode={(mode) => setAdvanceBankMode(mode as 'upi' | 'card')}
        advanceHistory={advanceHistory}
        banks={banks}
        selectedBank={advanceSelectedBank}
        onChangeSelectedBank={(bankId) => setAdvanceSelectedBank(bankId)}
        transactionNo={advanceTransactionNo}
        onChangeTransactionNo={(value) => setAdvanceTransactionNo(value)}
        cashAmount={advanceCashAmount}
        onChangeCashAmount={(value) => setAdvanceCashAmount(value)}
        bankAmount={advanceBankAmount}
        onChangeBankAmount={(value) => setAdvanceBankAmount(value)}
        patientId={patient?.patId}
        ipId={patient?.ipId}
        visitId={patient?.lastVisitId}
        onAdvanceReturnSuccess={() => {
          // if (patient?.patId && patient?.lastVisitId) {
          //   // Reload advance payment details
          //   fetchAdvancePaymentDetails(patient.patId, patient.lastVisitId);
          // }
          // // Reload patient details to refresh advance balance and other patient data
          // if (opNumber && opNumber.trim()) {
          //   handleSearchPatient();
          // }
          // Reset billing form
          handleResetForm();
        }}
        onAdvanceCollectionSuccess={() => handleSaveAdvanceCollection()}
      />
    </div>
  );
};

export default Billing;

// Add floating label styles
const styles = `
  /* Neat Card Design */
  .neat-card {
    border: none !important;
    border-radius: 16px !important;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.04) !important;
    background: white;
  }

  /* Form Control Styles */
  .form-control, .form-select {
    border-radius: 0px !important;
    border: 1px solid #a0aec0;
    padding: 0.1rem 0.5rem !important;
    min-height: 28px !important;
    font-size: var(--font-size-md) !important;
  }

  .form-control:focus, .form-select:focus {
    border-color: #3182ce;
    box-shadow: 0 0 0 3px rgba(49, 130, 206, 0.1);
  }

  /* Floating Label for Input */
  .floating-label {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    background: white;
    padding: 0 5px;
    color: #6c757d;
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-medium);
    pointer-events: none;
    transition: all 0.2s ease;
    z-index: 5;
  }
  
  .form-control:focus ~ .floating-label,
  .form-control:not(:placeholder-shown) ~ .floating-label {
    top: 0;
    left: 10px;
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-semibold);
    color: #3182ce;
  }
  
  /* Floating Label for Select */
  .floating-label-select {
    position: absolute;
    left: 10px;
    top: 50%;
    transform: translateY(-50%);
    background: white;
    padding: 0 5px;
    color: #6c757d;
    font-size: var(--font-size-md);
    font-weight: var(--font-weight-semibold);
    pointer-events: none;
    transition: all 0.2s ease;
    z-index: 5;
  }
  
  .form-select:focus ~ .floating-label-select,
  .form-select:not(:placeholder-shown) ~ .floating-label-select {
    top: 0;
    left: 10px;
    font-size: var(--font-size-xs);
    font-weight: var(--font-weight-semibold);
    color: #3182ce;
  }

  /* Billing Type Toggle */
  .billing-type-container {
    background: #f8f9fa;
    border-radius: 50px;
    padding: 4px;
    border: 1px solid #e9ecef;
  }
  
  .billing-type-btn {
    border-radius: 50px !important;
    font-weight: var(--font-weight-semibold);
    font-size: var(--font-size-sm);
    transition: all 0.2s ease;
    color: #6c757d;
  }
  
  .billing-type-btn.active {
    background: var(--border-color-input-focus) !important;
    color: white !important;
    box-shadow: 0 2px 4px rgba(49, 130, 206, 0.3);
  }

  /* Custom Scrollbar */
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
`;

// Inject styles
if (typeof document !== 'undefined') {
  const styleElement = document.createElement('style');
  styleElement.innerHTML = styles;
  document.head.appendChild(styleElement);
}
