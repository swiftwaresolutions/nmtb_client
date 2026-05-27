import React, { useState } from 'react';
import { Card, Table, Button, Form, Tabs, Tab } from 'react-bootstrap';
import { FaFileInvoiceDollar, FaCalculator, FaCheckCircle, FaListUl } from 'react-icons/fa';
import IPBillDetails from './IPBillDetails';
import { CashCounterApiService } from '../../../api/cash-counter/cash-counter-api-service';
import { useSelector } from 'react-redux';
import { RootState } from '../../../state/store';
import { showSuccessToast, showErrorToast, showWarningToast, showConfirmDialog, showLoading, closeAlert } from '../../../utils/alertUtil';

// Fix for TS2786
const FaFileInvoiceDollarIcon = FaFileInvoiceDollar as any;
const FaCalculatorIcon = FaCalculator as any;
const FaCheckCircleIcon = FaCheckCircle as any;
const FaListUlIcon = FaListUl as any;

interface ChargeItem {
  slNo: number;
  particulars: string;
  days: number;
  amount: number;
  total: number;
}

interface IPBillingProps {
  constantCharges?: any[];
  billDateTime?: string;
  showBillDate?: boolean;
  onBillDateTimeChange?: (value: string) => void;
  onShowBillDateChange?: (value: boolean) => void;
  patientId?: number;
  ipKey?: number;
  advance?: number;
  prevBalance?: number;
  accountHeadId?: number;
  ipItems?: any[]; // IP bill order details
  onRefreshIpItems?: () => Promise<void>; // Callback to refresh ipItems from database
}

const IPBilling: React.FC<IPBillingProps> = ({ 
  constantCharges = [], 
  billDateTime = '',
  showBillDate = false,
  onBillDateTimeChange = () => {},
  onShowBillDateChange = () => {},
  patientId,
  ipKey,
  advance = 0,
  prevBalance = 0,
  accountHeadId,
  ipItems = [], // IP bill order details
  onRefreshIpItems // Callback to refresh ipItems from database
}) => {
  const loginData = useSelector((state: RootState) => state.loginData);
  const cashCounterApi = new CashCounterApiService();
  const [activeTab, setActiveTab] = useState('billing');
  const [calculateCharges, setCalculateCharges] = useState(false);
  const [finalBillCalculation, setFinalBillCalculation] = useState(false);
  const [billNo, setBillNo] = useState('');
  const [billIds, setBillIds] = useState<any>(null);
  const [localShowBillDate, setShowBillDate] = useState(showBillDate);
  const [localBillDateTime, setBillDateTime] = useState(billDateTime);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleCalculateChargesChange = (checked: boolean) => {
    if (finalBillCalculation && !checked) {
      showWarningToast('Calculate IP Charges is required when Final Bill Calculation is selected.', 'Selection Required');
      return;
    }
    setCalculateCharges(checked);
  };

  const handleFinalBillCalculationChange = (checked: boolean) => {
    setFinalBillCalculation(checked);
    if (checked && !calculateCharges) {
      setCalculateCharges(true);
    }
    if (!checked) {
      setShowBillDate(false);
      onShowBillDateChange(false);
      setBillDateTime('');
      onBillDateTimeChange('');
    }
  };

  // Transform API constant charges into display format
  const stays = React.useMemo(() => {
    if (constantCharges && constantCharges.length > 0) {
      return constantCharges.map((ward, wardIndex) => {
        let slNoCounter = 1;
        const transformedCharges = ward.charges.map((charge: any, chargeIndex: number) => ({
          slNo: slNoCounter++,
          particulars: charge.chargeName,
          days: charge.days || 0,
          amount: charge.rate || 0,
          total: charge.totalAmount
        }));

        return {
          ward: ward.wardName,
          bedNo: '', // API doesn't provide bed number
          admissionDate: '', // Will be set from patient details
          charges: transformedCharges
        };
      });
    }
    
    // Fallback to mock data if no API data
    return [
      {
        ward: 'No IP Charges',
        bedNo: '',
        admissionDate: '',
        charges: [
          { slNo: 1, particulars: 'No charges available', days: 0, amount: 0.00, total: 0.00 },
        ]
      }
    ];
  }, [constantCharges]);
  
  // Calculate Grand Total from constant charges (stays)
  const grandTotal = stays.reduce((acc, stay) => 
    acc + stay.charges.reduce((sum: number, item: ChargeItem) => sum + item.total, 0), 0
  );

  const handleGenerateBill = async () => {
    // Validate required data
    if (!patientId || !ipKey) {
      showErrorToast('Patient information is missing. Please search patient first.', 'Validation Error');
      return;
    }

    if (!constantCharges || constantCharges.length === 0) {
      showErrorToast('No constant charges available. Please calculate charges first.', 'Validation Error');
      return;
    }

    const hasInvalidChargeValues = constantCharges.some((ward: any) =>
      (ward?.charges || []).some((charge: any) => {
        const numberOfDays = Number(charge?.days) || 0;
        const amount = Number(charge?.totalAmount ?? charge?.amt) || 0;
        return numberOfDays <= 0 || amount <= 0;
      })
    );

    if (hasInvalidChargeValues) {
      showWarningToast(
        'Cannot generate bill. Number of Days and Amount must be greater than 0 for all IP charges.',
        'Invalid Charge Values'
      );
      return;
    }

    try {
      setIsGenerating(true);
      showLoading('Generating IP Bill...');

      // Debug: Log the original constantCharges structure
      console.log('Original constantCharges:', JSON.stringify(constantCharges, null, 2));

      // Build details array from constant charges
      const details = constantCharges.flatMap((ward: any) => 
        ward.charges.map((charge: any) => {
          console.log('Processing charge:', charge);
          return {
            particulars: String(charge.chargeName || charge.particulars || ''),
            amt: Number(charge.totalAmount) || 0,
            accHeadId: Number(charge.headId) || 0,
            headAmt: Number(charge.totalAmount) || 0,
            numberOfDays: Number(charge.days) || 0
          };
        })
      );

      // Debug: Log the constructed details array
      console.log('Constructed details array:', JSON.stringify(details, null, 2));

      // Build request payload
      const payload = {
        patId: Number(patientId),
        ipkey: Number(ipKey), // Backend expects lowercase 'ipkey'
        amt: Number(grandTotal.toFixed(2)), // Round to 2 decimal places
        discount: 0, // TODO: Get from parent component if discount is applied
        advance: Number(advance),
        prevBalance: Number(prevBalance),
        uid: Number(loginData.id) || 0,
        isFinal: finalBillCalculation ? 1 : 0,
        isConstantChargesCalculated: calculateCharges ? 1 : 0,
        headId: Number(accountHeadId) || 1, // TEMPORARY: Default to 1 until backend adds headId to fetchPatientDetails
        details: details
      };

      console.log('Generating IP Bill with payload:', payload);
      console.log('Grand Total:', grandTotal);
      console.log('Details count:', details.length);
      console.log('Patient ID:', patientId, 'IP Key:', ipKey);

      // Call API
      const response = await cashCounterApi.generateIpBillOrder(payload);

      closeAlert();

      if (response && response.finalBillDisplay) {
        setBillIds(response);
        setBillNo(response.finalBillDisplay);
        
        // Refresh ipItems from database to reflect the newly generated bill
        if (onRefreshIpItems) {
          await onRefreshIpItems();
        }
        
        showSuccessToast('IP Bill generated successfully!', 'Success');
      } else {
        showErrorToast('Failed to generate bill. Invalid response from server.', 'Error');
      }

    } catch (error: any) {
      closeAlert();
      console.error('Error generating IP bill:', error);
      const errorMsg = error?.response?.data?.error || 'Failed to generate IP bill. Please try again.';
      showErrorToast(errorMsg, 'Error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Handle Cancel Generated Bill
  const handleCancelBill = async () => {
    if (!patientId || !ipKey) {
      showErrorToast(
        'Patient information is missing. Cannot cancel bill.',
        'Validation Error'
      );
      return;
    }

    if (ipItems.length === 0) {
      showWarningToast('No bill to cancel', 'Warning');
      return;
    }

    const result = await showConfirmDialog(
      'Are you sure you want to cancel this generated bill?',
      'Confirm Cancel',
      'Yes, Cancel Bill',
      'No'
    );

    if (!result.isConfirmed) {
      return;
    }

    try {
      setIsGenerating(true);
      showLoading('Cancelling IP Bill...');

      const response = await cashCounterApi.cancelIpBillOrder(
        Number(patientId),
        Number(ipKey)
      );

      closeAlert();

      if (response && response.success) {
        // Refresh ipItems from database to reflect cancellation
        if (onRefreshIpItems) {
          await onRefreshIpItems();
        }
        
        // Clear local bill state
        setBillNo('');
        setBillIds(null);
        
        showSuccessToast(
          response.message || 'IP Bill cancelled successfully!',
          'Success'
        );
      } else {
        showErrorToast(
          'Failed to cancel bill. Invalid response from server.',
          'Error'
        );
      }
    } catch (error: any) {
      closeAlert();
      const errorMsg =
        error?.response?.data?.error || 'Failed to cancel IP bill. Please try again.';
      showErrorToast(errorMsg, 'Error');
    } finally {
      setIsGenerating(false);
    }
  };

  // Helper to get total previous charges count for sequence numbers
  const getPrevChargesCount = (stayIndex: number) => {
    let count = 0;
    for (let i = 0; i < stayIndex; i++) {
      count += stays[i].charges.length;
    }
    return count;
  };

  return (
    <div className="d-flex flex-column neat-card bg-white overflow-hidden shadow-sm rounded" style={{ flex: 1, minHeight: 0, border: '1px solid #e2e8f0' }}>
      
      {/* 1. Header Section */}
      <div className="d-flex justify-content-between align-items-center p-2 border-bottom bg-light flex-shrink-0" style={{ zIndex: 11, minHeight: '60px' }}>
        <div className="d-flex align-items-center gap-3 h-100">
          {/* Internal Navigation Tabs as Pills for better alignment */}
          <div className="bg-white p-1 border rounded d-flex gap-1 shadow-sm">
            <Button 
              variant={activeTab === 'billing' ? 'primary' : 'white'} 
              size="sm" 
              className={`border-0 fw-bold px-3 py-1 ${activeTab === 'billing' ? 'shadow-sm' : 'text-muted'}`}
              style={{ fontSize: '0.65rem' }}
              onClick={() => setActiveTab('billing')}
            >
              STAY DETAILS
            </Button>
            <Button 
              variant={activeTab === 'details' ? 'primary' : 'white'} 
              size="sm" 
              className={`border-0 fw-bold px-3 py-1 ${activeTab === 'details' ? 'shadow-sm' : 'text-muted'}`}
              style={{ fontSize: '0.65rem' }}
              onClick={() => setActiveTab('details')}
            >
              BILLED DETAILS
            </Button>
          </div>
        </div>

        {/* Simplified Totals Block */}
        <div className="d-flex align-items-center h-100">
          <div className="text-end bg-white px-3 py-1 border rounded shadow-sm d-flex flex-column justify-content-center" style={{ minWidth: '220px', height: '42px' }}>
            <div className="text-primary fw-bold text-uppercase" style={{ fontSize: '0.55rem', letterSpacing: '0.5px', lineHeight: '1' }}>Grand Total (Stay Charges)</div>
            <div className="h4 mb-0 fw-bold text-primary" style={{ lineHeight: '1.2' }}>₹ {grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
          </div>
        </div>
      </div>
    
          {/* 2. Main Content Area - Swipeable by Tabs */}
      <div className="flex-grow-1 overflow-hidden d-flex flex-column bg-white" style={{ minHeight: 0 }}>
        {activeTab === 'billing' ? (
          <div className="flex-grow-1 overflow-auto bg-white scrollbar-thin">
            <Table hover size="sm" className="mb-0 align-middle w-100" style={{ fontSize: '0.78rem' }}>
              <thead className="bg-light text-muted text-uppercase sticky-top" style={{ zIndex: 10, fontSize: '0.7rem' }}>
                <tr>
                  <th className="ps-3 py-2" style={{ width: '60px' }}>#</th>
                  <th className="py-2">Particulars</th>
                  <th className="text-center py-2" style={{ width: '100px' }}>Days</th>
                  <th className="text-end py-2" style={{ width: '130px' }}>Rate (₹)</th>
                  <th className="text-end pe-3 py-2" style={{ width: '130px' }}>Total (₹)</th>
                </tr>
              </thead>
              <tbody>
                {/* Loop through stays and their charges */}
                {stays.map((stay, stayIndex) => {
                  const startSlNo = getPrevChargesCount(stayIndex) + 1;
                  return (
                    <React.Fragment key={stayIndex}>
                      <tr className="bg-primary bg-opacity-10 border-bottom">
                        <td colSpan={5} className="ps-3 py-1 small fw-bold text-primary" style={{ fontSize: '0.7rem' }}>
                          <span className="badge bg-primary me-2">{stayIndex + 1}</span>
                          WARD: {stay.ward}
                        </td>
                      </tr>
                      {stay.charges.map((charge: ChargeItem, chargeIndex: number) => (
                        <tr key={`${stayIndex}-${chargeIndex}`} className="border-bottom">
                          <td className="ps-3 text-center">{startSlNo + chargeIndex}</td>
                          <td>{charge.particulars}</td>
                          <td className="text-center fw-bold">{charge.days || '—'}</td>
                          <td className="text-end">{charge.amount > 0 ? charge.amount.toFixed(2) : '—'}</td>
                          <td className="text-end pe-3 fw-bold">{charge.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </Table>
          </div>
        ) : (
          <div className="flex-grow-1 overflow-auto bg-white scrollbar-thin">
            {/* IP Order Details Section */}
            {ipItems && ipItems.length > 0 ? (
              <div className="p-3">
                <div className="d-flex justify-content-between align-items-center mb-3 pb-2 border-bottom">
                  <h6 className="mb-0 text-primary fw-bold">IP Bill Order Details</h6>
                  <span className="badge bg-primary">{ipItems.length} Item{ipItems.length !== 1 ? 's' : ''}</span>
                </div>
                
                <Table hover size="sm" className="mb-0 align-middle w-100" style={{ fontSize: '0.78rem' }}>
                  <thead className="bg-light text-muted text-uppercase" style={{ fontSize: '0.7rem' }}>
                    <tr>
                      <th className="ps-3 py-2" style={{ width: '60px' }}>S.No</th>
                      <th className="py-2">Particulars</th>
                      <th className="text-center py-2" style={{ width: '100px' }}>Days</th>
                      <th className="text-end pe-3 py-2" style={{ width: '130px' }}>Amount (₹)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {ipItems.map((item, index) => (
                      <tr key={index} className="border-bottom">
                        <td className="ps-3 text-center">{item.sno || index + 1}</td>
                        <td>{item.particulars}</td>
                        <td className="text-center fw-bold">{item.numberOfDays || '—'}</td>
                        <td className="text-end pe-3 fw-bold text-primary">
                          {item.amt ? item.amt.toLocaleString('en-IN', { minimumFractionDigits: 2 }) : '0.00'}
                        </td>
                      </tr>
                    ))}
                    {/* Total Row */}
                    <tr className="bg-light border-top border-2">
                      <td colSpan={3} className="ps-3 py-2 fw-bold text-uppercase text-end">Grand Total:</td>
                      <td className="text-end pe-3 py-2 fw-bold text-primary h6 mb-0">
                        ₹ {ipItems.reduce((sum, item) => sum + (item.amt || 0), 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  </tbody>
                </Table>
              </div>
            ) : (
              <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted">
                <div className="text-center p-5">
                  <i className="fas fa-file-invoice fa-3x mb-3 opacity-50"></i>
                  <p className="mb-0">No IP bill order details available</p>
                </div>
              </div>
            )}
            
            {/* Previously Billed Details Section - Collapsible */}
            {ipItems && ipItems.length > 0 && (
              <div className="mt-4 pt-3 border-top">
                <IPBillDetails />
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. Action Area - Forced to stay at bottom with flex-shrink-0 */}
      <div className="p-2 border-top bg-light flex-shrink-0" style={{ boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.05)', zIndex: 11 }}>
        <div className="flex-form-row align-items-start">
          {/* First Column: Checkboxes and Date Picker */}
          <div className="flex-form-item flex-item-4">
            {/* Checkboxes Row */}
            <div className="d-flex align-items-center gap-4 mb-2">
              <Form.Check
                type="checkbox"
                id="calc-ip"
                className="m-0"
                label={<span className="text-danger fw-bold text-uppercase" style={{ fontSize: '0.72rem' }}>Calculate IP Charges</span>}
                checked={calculateCharges}
                onChange={(e) => handleCalculateChargesChange(e.target.checked)}
              />

              <Form.Check
                type="checkbox"
                id="final-calc"
                className="m-0"
                label={<span className="text-danger fw-bold text-uppercase" style={{ fontSize: '0.72rem' }}>Final Bill Calculation</span>}
                checked={finalBillCalculation}
                onChange={(e) => handleFinalBillCalculationChange(e.target.checked)}
              />
            </div>
            
            {/* Date Picker Section - Now in its own row for better visibility */}
            <div className="d-flex align-items-center gap-2 border rounded px-3 py-2 bg-white shadow-sm">
              <Form.Check
                type="checkbox"
                id="date-toggle"
                checked={localShowBillDate}
                onChange={(e) => { setShowBillDate(e.target.checked); onShowBillDateChange(e.target.checked); }}
                className="m-0"
                disabled={!finalBillCalculation}
              />
              <label htmlFor="date-toggle" className="fw-bold mb-0 text-nowrap" style={{ fontSize: '0.75rem', cursor: 'pointer' }}>BILL DATE & TIME:</label>
              <Form.Control
                type="datetime-local"
                size="sm"
                value={localBillDateTime}
                onChange={(e) => { setBillDateTime(e.target.value); onBillDateTimeChange(e.target.value); }}
                disabled={!finalBillCalculation || !localShowBillDate}
                className="py-1 px-2"
                style={{ fontSize: '0.75rem', height: '32px', minWidth: '180px', maxWidth: '240px' }}
              />
            </div>
          </div>

          {/* Second Column: Generate Button, Cancel Button, and Bill No Display */}
          <div className="flex-form-item flex-item-3 d-flex align-items-end justify-content-end gap-3">
            <Button
              variant="primary"
              className="px-4 py-2 fw-bold border-0 shadow-sm d-flex align-items-center gap-2"
              onClick={handleGenerateBill}
              disabled={ipItems.length > 0 || !!billNo || isGenerating || (!calculateCharges && !finalBillCalculation)}
              title={ipItems.length > 0 || billNo ? 'Bill exists. Cancel to generate new bill.' : (!calculateCharges && !finalBillCalculation ? 'Select Calculate IP Charges or Final Bill Calculation to enable generate.' : 'Generate IP Bill')}
              style={{ 
                fontSize: '0.85rem', 
                backgroundColor: (ipItems.length > 0 || billNo || (!calculateCharges && !finalBillCalculation)) ? '#cbd5e0' : '#3182ce',
                cursor: (ipItems.length > 0 || billNo || (!calculateCharges && !finalBillCalculation)) ? 'not-allowed' : 'pointer',
                borderRadius: '6px',
                transition: 'all 0.2s',
                height: '44px'
              }}
            >
              <FaCheckCircleIcon /> {isGenerating ? 'GENERATING...' : 'GENERATE'}
            </Button>

            {/* Cancel Bill Button - Only shown when bill exists */}
            {(ipItems.length > 0 || billNo) && (
              <Button
                variant="danger"
                className="px-4 py-2 fw-bold border-0 shadow-sm d-flex align-items-center gap-2"
                onClick={handleCancelBill}
                disabled={isGenerating}
                title="Cancel existing bill"
                style={{ 
                  fontSize: '0.85rem', 
                  borderRadius: '6px',
                  transition: 'all 0.2s',
                  height: '44px'
                }}
              >
                {isGenerating ? 'CANCELLING...' : 'CANCEL BILL'}
              </Button>
            )}

            {/* Bill No Display (Appears after clicking Generate) */}
            {billNo && billIds && (
              <div className="d-flex flex-column animated fadeIn bg-white border rounded px-3 py-2 shadow-sm" style={{ minWidth: '200px' }}>
                <div className="text-muted fw-bold text-uppercase mb-1" style={{ fontSize: '0.55rem', letterSpacing: '0.5px' }}>Generated Bills</div>
                {billIds.finalBillDisplay && (
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="text-muted" style={{ fontSize: '0.7rem' }}>Final Bill:</span>
                    <span className="fw-bold text-primary" style={{ fontSize: '0.85rem' }}>{billIds.finalBillDisplay}</span>
                  </div>
                )}
                {billIds.cashBillDisplay && (
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="text-muted" style={{ fontSize: '0.7rem' }}>Cash Bill:</span>
                    <span className="fw-bold text-success" style={{ fontSize: '0.85rem' }}>{billIds.cashBillDisplay}</span>
                  </div>
                )}
                {billIds.ipBillDisplay && (
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted" style={{ fontSize: '0.7rem' }}>IP Bill:</span>
                    <span className="fw-bold text-info" style={{ fontSize: '0.85rem' }}>{billIds.ipBillDisplay}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IPBilling;
