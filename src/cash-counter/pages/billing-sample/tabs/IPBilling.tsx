import React, { useState, useEffect } from 'react';
import { Card, Table, Button, Form, Badge } from 'react-bootstrap';
import { FaFileInvoiceDollar, FaCheckCircle, FaListUl } from 'react-icons/fa';
import IPBillDetails from '../../billing/IPBillDetails';
import { CashCounterApiService } from '../../../../api/cash-counter/cash-counter-api-service';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../state/store';
import { showSuccessToast, showErrorToast, showWarningToast, showConfirmDialog, showLoading, closeAlert } from '../../../../utils/alertUtil';
import { handleNumberChange, handleNumberBlur, formatNumberDisplay } from '../../../../utils/numberInputUtil';

const FaFileInvoiceDollarIcon = FaFileInvoiceDollar as any;
const FaCheckCircleIcon = FaCheckCircle as any;
const FaListUlIcon = FaListUl as any;

const BILL_TYPE_GROUPS = [
  { label: "Registration",         types: [1],  icon: "fa-id-card" },
  { label: "Lab",                  types: [2],  icon: "fa-flask" },
  { label: "Pharmacy",             types: [3],  icon: "fa-pills" },
  { label: "Investigation",        types: [4],  icon: "fa-stethoscope" },
  { label: "Advance Collection",   types: [5],  icon: "fa-hand-holding-usd" },
  { label: "IP Bill",              types: [7],  icon: "fa-hospital" },
  { label: "Lab Return",           types: [9],  icon: "fa-undo" },
  { label: "Pharmacy Return",      types: [10], icon: "fa-undo" },
  { label: "Advance Return",       types: [11], icon: "fa-undo" },
  { label: "Due Collection",       types: [12], icon: "fa-file-invoice-dollar" },
  { label: "Investigation Return", types: [13], icon: "fa-undo" },
];

interface ChargeItem {
  slNo: number;
  particulars: string;
  days: number;
  amount: number;
  total: number;
}

interface BillingPermissions {
  hasDueAccess: boolean;
  hasAdvanceAccess: boolean;
}

interface IPBillingProps {
  billDateTime?: string;
  showBillDate?: boolean;
  onBillDateTimeChange?: (value: string) => void;
  onShowBillDateChange?: (value: boolean) => void;
  patientId?: number;
  ipKey?: number;
  admitDateTime?: string;
  advance?: number;
  prevBalance?: number;
  accountHeadId?: number;
  visitId?: number;
  permissions?: BillingPermissions;
  ipItems?: any[];
  onUpdateIpItems?: (items: any[]) => void;
}

const IPBilling: React.FC<IPBillingProps> = ({ 
  billDateTime = '',
  showBillDate = false,
  onBillDateTimeChange = () => {},
  onShowBillDateChange = () => {},
  patientId,
  ipKey,
  admitDateTime,
  advance = 0,
  prevBalance = 0,
  accountHeadId,
  visitId,
  permissions,
  ipItems = [],
  onUpdateIpItems
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
  const [bills, setBills] = useState<any[]>([]);
  const [loadingBills, setLoadingBills] = useState(false);
  const [constantCharges, setConstantCharges] = useState<any[]>([]);

  // Fetch constant charges
  const fetchConstantCharges = async (ipId: number, admitDateTimeStr: string) => {
    try {
      const dischargeDate = showBillDate && billDateTime
        ? new Date(billDateTime).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];

      const admissionDate = admitDateTimeStr
        ? new Date(admitDateTimeStr).toISOString().split('T')[0]
        : new Date().toISOString().split('T')[0];

      const response = await cashCounterApi.fetchConstantCharges(
        ipId,
        admissionDate,
        dischargeDate
      );

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

      if (response && Array.isArray(response)) {
        if (onUpdateIpItems) {
          onUpdateIpItems(response);
        }
      }
    } catch (error: any) {
      console.error('Error fetching IP bill order details:', error);
      if (onUpdateIpItems) {
        onUpdateIpItems([]);
      }
    }
  };

  const refreshIpBillOrderDetails = async () => {
    if (patientId && ipKey) {
      await fetchIpBillOrderDetails(patientId, ipKey);
    }
  };

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

  // Fetch constant charges and IP items when patient data is available
  useEffect(() => {
    if (ipKey && ipKey > 0 && patientId) {
      fetchConstantCharges(ipKey, admitDateTime || '');
      fetchIpBillOrderDetails(patientId, ipKey);
    } else {
      setConstantCharges([]);
      if (onUpdateIpItems) {
        onUpdateIpItems([]);
      }
    }
  }, [ipKey, admitDateTime, patientId]);

  // Refetch constant charges when bill date changes
  useEffect(() => {
    if (ipKey && ipKey > 0 && admitDateTime) {
      fetchConstantCharges(ipKey, admitDateTime);
    }
  }, [billDateTime, showBillDate]);

  // Fetch bills when billed details tab is active
  useEffect(() => {
    if (activeTab === 'details' && visitId && visitId > 0) {
      fetchBills();
    }
  }, [activeTab, visitId]);

  const fetchBills = async () => {
    if (!visitId || visitId === 0) {
      setBills([]);
      return;
    }

    setLoadingBills(true);
    try {
      const response = await cashCounterApi.fetchPatientOPIPBills(visitId);
      const data = Array.isArray(response) ? response : [];
      setBills(data);

      if (data.length === 0) {
        showErrorToast('No bills found for this visit');
      }
    } catch (error: any) {
      console.error('Error loading bills:', error);
      showErrorToast(error?.response?.data?.error || 'Failed to load bills');
      setBills([]);
    } finally {
      setLoadingBills(false);
    }
  };

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
          bedNo: '',
          admissionDate: '',
          charges: transformedCharges
        };
      });
    }
    
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
  
  const grandTotal = stays.reduce((acc, stay) => 
    acc + stay.charges.reduce((sum: number, item: ChargeItem) => sum + item.total, 0), 0
  );

  const handleGenerateBill = async () => {
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
        // const amount = Number(charge?.totalAmount ?? charge?.amt) || 0;
        return numberOfDays <= 0 ;
      })
    );

    if (hasInvalidChargeValues) {
      showWarningToast(
        'Cannot generate bill. Number of Days must be greater than 0 for all IP charges.',
        'Invalid Charge Values'
      );
      return;
    }

    try {
      setIsGenerating(true);
      showLoading('Generating IP Bill...');

      const details = constantCharges.flatMap((ward: any) => 
        ward.charges.map((charge: any) => ({
          particulars: String(charge.chargeName || charge.particulars || ''),
          amt: Number(charge.totalAmount) || 0,
          accHeadId: Number(charge.headId) || 0,
          headAmt: Number(charge.totalAmount) || 0,
          numberOfDays: Number(charge.days) || 0
        }))
      );

      const payload = {
        patId: Number(patientId),
        ipkey: Number(ipKey),
        amt: Number(grandTotal.toFixed(2)),
        discount: 0,
        advance: Number(advance),
        prevBalance: Number(prevBalance),
        uid: Number(loginData.id) || 0,
        isFinal: finalBillCalculation ? 1 : 0,
        isConstantChargesCalculated: calculateCharges ? 1 : 0,
        headId: Number(accountHeadId) || 1,
        details: details
      };

      const response = await cashCounterApi.generateIpBillOrder(payload);

      closeAlert();

      if (response && response.finalBillDisplay) {
        setBillIds(response);
        setBillNo(response.finalBillDisplay);
        
        await refreshIpBillOrderDetails();
        
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
        await refreshIpBillOrderDetails();
        
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

  const getPrevChargesCount = (stayIndex: number) => {
    let count = 0;
    for (let i = 0; i < stayIndex; i++) {
      count += stays[i].charges.length;
    }
    return count;
  };

  const handleChargeUpdate = (wardIndex: number, chargeIndex: number, field: 'days' | 'rate', value: number) => {
    setConstantCharges(prev => {
      const updated = [...prev];
      const ward = { ...updated[wardIndex] };
      const charges = [...ward.charges];
      const charge = { ...charges[chargeIndex] };

      if (field === 'days') {
        charge.days = value;
      } else {
        charge.rate = value;
      }
      charge.totalAmount = (Number(charge.days) || 0) * (Number(charge.rate) || 0);

      charges[chargeIndex] = charge;
      ward.charges = charges;
      updated[wardIndex] = ward;
      return updated;
    });
  };

  return (
    <div className="d-flex flex-column border-0 shadow-sm bg-white overflow-hidden" style={{ flex: 1, minHeight: 0, height: 'calc(100vh - 220px)' }}>
      
      <div className="d-flex justify-content-between align-items-center p-3 border-bottom bg-light flex-shrink-0" style={{ zIndex: 11, minHeight: '70px' }}>
        <div className="d-flex align-items-center gap-3">
          <div className="d-flex gap-2">
            <Button 
              size="sm" 
              className={`fw-bold text-uppercase theme-outline-btn-primary ${activeTab === 'billing' ? 'is-selected shadow-sm' : ''}`}
              style={{
                fontSize: 'var(--font-size-sm)',
              }}
              onClick={() => setActiveTab('billing')}
            >
              <FaFileInvoiceDollarIcon className="me-2" />
              Stay Details
            </Button>
            <Button 
              size="sm" 
              className={`fw-bold text-uppercase theme-outline-btn-primary ${activeTab === 'details' ? 'is-selected shadow-sm' : ''}`}
              style={{
                fontSize: 'var(--font-size-sm)',
              }}
              onClick={() => setActiveTab('details')}
            >
              <FaListUlIcon className="me-2" />
              Billed Details
            </Button>
          </div>
        </div>

        <div className="text-end px-3 py-2 border rounded d-flex flex-column justify-content-center" style={{ backgroundColor: 'var(--page-secondary-color)', minWidth: '240px' }}>
          <div className="text-uppercase" style={{ fontSize: 'var(--font-size-xs)', letterSpacing: '0.5px', color: 'var(--page-primary-color)' }}>Grand Total (Stay Charges)</div>
          <div style={{ color: 'var(--page-primary-color)' }} className="fw-bold h5 mb-0">₹ {grandTotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</div>
        </div>
      </div>
    
      <div className="flex-grow-1 overflow-hidden d-flex flex-column bg-white" style={{ minHeight: 0 }}>
        {activeTab === 'billing' ? (
          <div className="flex-grow-1 overflow-auto bg-white">
            <Table hover className="mb-0 align-middle" style={{ fontSize: 'var(--font-size-sm)' }}>
              <thead className="bg-light text-muted text-uppercase sticky-top" style={{ zIndex: 10, fontSize: 'var(--font-size-xs)' }}>
                <tr>
                  <th className="ps-3 py-2" style={{ width: '5%' }}>Sl No</th>
                  <th className="py-2" style={{ width: '50%' }}>Particulars</th>
                  <th className="text-center py-2" style={{ width: '12%' }}>Days</th>
                  <th className="text-end py-2" style={{ width: '16%' }}>Rate (₹)</th>
                  <th className="text-end pe-3 py-2" style={{ width: '16%' }}>Total (₹)</th>
                </tr>
              </thead>
              <tbody>
                {stays.map((stay, stayIndex) => {
                  const startSlNo = getPrevChargesCount(stayIndex) + 1;
                  return (
                    <React.Fragment key={stayIndex}>
                      <tr className="bg-light border-bottom">
                        <td colSpan={5} className="ps-3 py-2 small fw-bold" style={{ fontSize: 'var(--font-size-sm)' }}>
                          <span className="badge theme-badge-primary">{stayIndex + 1} - Ward : {stay.ward}</span>
                          
                        </td>
                      </tr>
                      {stay.charges.map((charge: ChargeItem, chargeIndex: number) => (
                        <tr key={`${stayIndex}-${chargeIndex}`} className="border-bottom">
                          <td className="ps-3 text-center">{startSlNo + chargeIndex}</td>
                          <td>{charge.particulars}</td>
                          {/* <td className="text-center fw-bold">{charge.days || '—'}</td> */}
                          {/* <td className="text-end">₹{charge.amount > 0 ? charge.amount.toFixed(2) : '0.00'}</td> */}
                          <td className="text-center">
                            <Form.Control
                              type="number"
                              value={formatNumberDisplay(charge.days)}
                              onChange={(e) => handleChargeUpdate(stayIndex, chargeIndex, 'days', handleNumberChange(e.target.value))}
                              onBlur={(e) => handleChargeUpdate(stayIndex, chargeIndex, 'days', handleNumberBlur(e.target.value))}
                              onFocus={(e) => e.target.select()}
                              min="0"
                              step="1"
                              placeholder="0"
                              disabled={constantCharges.length === 0}
                              style={{ fontSize: 'var(--font-size-sm)', width: '80px', textAlign: 'center', margin: '0 auto' }}
                            />
                          </td>
                          <td className="text-end">
                            <Form.Control
                              type="number"
                              value={formatNumberDisplay(charge.amount)}
                              onChange={(e) => handleChargeUpdate(stayIndex, chargeIndex, 'rate', handleNumberChange(e.target.value))}
                              onBlur={(e) => handleChargeUpdate(stayIndex, chargeIndex, 'rate', handleNumberBlur(e.target.value))}
                              onFocus={(e) => e.target.select()}
                              min="0"
                              step="0.01"
                              placeholder="0"
                              disabled={constantCharges.length === 0}
                              style={{ fontSize: 'var(--font-size-sm)', width: '110px', textAlign: 'right', marginLeft: 'auto' }}
                            />
                          </td>
                          <td className="text-end pe-3 fw-bold">₹{charge.total.toLocaleString(undefined, { minimumFractionDigits: 2 })}</td>
                        </tr>
                      ))}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </Table>
          </div>
        ) : (
          <div className="flex-grow-1 overflow-auto bg-white">
            {loadingBills ? (
              <div className="d-flex flex-column align-items-center justify-content-center h-100">
                <div className="spinner-border text-primary" role="status">
                  <span className="visually-hidden">Loading...</span>
                </div>
                <p className="mt-3 text-muted">Loading bills...</p>
              </div>
            ) : bills.length > 0 ? (
              <div style={{ padding: "12px 16px" }}>
                {BILL_TYPE_GROUPS.map(group => {
                  // Filter based on permissions
                  if (group.label === 'Due Collection' && permissions && !permissions.hasDueAccess) {
                    return null;
                  }
                  if ((group.label === 'Advance Collection' || group.label === 'Advance Return') && permissions && !permissions.hasAdvanceAccess) {
                    return null;
                  }
                  
                  const groupBills = bills.filter(b => group.types.includes(b.billType));
                  if (groupBills.length === 0) return null;
                  return (
                    <div key={group.label} style={{ marginBottom: "16px" }}>
                      <div style={{ padding: "5px 12px", fontSize: "0.78rem", fontWeight: 700, textTransform: "uppercase", letterSpacing: "1px", display: "flex", alignItems: "center", gap: "8px", borderRadius: "4px 4px 0 0", background: "#CBDDE9", color: "#1e3a4f", border: "1px solid #b0ccde" }}>
                        <i className={`fas ${group.icon}`}></i>
                        {group.label}
                        <span style={{ marginLeft: "auto", background: "rgba(255,255,255,0.5)", borderRadius: "12px", padding: "1px 8px", color: "#1e3a4f" }}>
                          {groupBills.length}
                        </span>
                      </div>
                      <Table className="mb-0" hover size="sm" style={{ border: "1px solid #e2e8f0", borderTop: "none" }}>
                        <thead style={{ background: "#f8fafc", fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.5px", color: "#64748b" }}>
                          <tr>
                            <th className="ps-3 py-2 border-0">#</th>
                            <th className="py-2 border-0">Bill No</th>
                            <th className="py-2 border-0">Date</th>
                            <th className="py-2 border-0">Type</th>
                            <th className="py-2 border-0">User</th>
                            <th className="py-2 border-0 text-end">Total</th>
                            <th className="py-2 border-0 text-end">Disc</th>
                            <th className="py-2 border-0 text-end">Paid</th>
                            <th className="py-2 border-0 text-end pe-3">Balance</th>
                          </tr>
                        </thead>
                        <tbody style={{ fontSize: "0.845rem" }}>
                          {groupBills.map((bill, i) => (
                            <tr key={bill.id || i} className="border-bottom" style={{ borderBottom: "1px solid #f1f5f9" }}>
                              <td className="ps-3 py-2 align-middle text-muted">{i + 1}</td>
                              <td className="py-2 align-middle"><strong>{bill.billDisplay}</strong></td>
                              <td className="py-2 align-middle text-muted small">{bill.dateTime}</td>
                              <td className="py-2 align-middle">
                                <span className={`badge ${bill.ipId !== 0 ? "bg-primary" : "bg-secondary"}`} style={{ fontSize: "0.7rem", opacity: 0.85 }}>
                                  {bill.ipId !== 0 ? "IP" : "OP"}
                                </span>
                              </td>
                              <td className="py-2 align-middle text-muted small">{bill.userName}</td>
                              <td className="py-2 align-middle text-end">₹{bill.total?.toFixed(2) || '0.00'}</td>
                              <td className="py-2 align-middle text-end text-danger">
                                {bill.totDisc > 0 ? `₹${bill.totDisc.toFixed(2)}` : <span className="text-muted">—</span>}
                              </td>
                              <td className="py-2 align-middle text-end text-success">₹{bill.paid?.toFixed(2) || '0.00'}</td>
                              <td className="py-2 align-middle text-end pe-3">
                                {bill.balance > 0 ? (
                                  <span className="text-danger fw-semibold">₹{bill.balance.toFixed(2)}</span>
                                ) : (
                                  <span className="text-success">₹0.00</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </Table>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="d-flex flex-column align-items-center justify-content-center h-100 text-muted">
                <div className="text-center p-5">
                  <i className="fas fa-file-invoice fa-3x mb-3 opacity-50"></i>
                  <p className="mb-0">No bills found for this visit</p>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="p-2 border-top bg-light flex-shrink-0" style={{ boxShadow: '0 -4px 6px -1px rgba(0, 0, 0, 0.05)', zIndex: 11 }}>
        <div className="flex-form-row align-items-start">
          <div className="flex-form-item flex-item-4">
            <div className="d-flex align-items-center gap-4 mb-2">
              <Form.Check
                type="checkbox"
                id="calc-ip"
                className="m-0"
                label={<span className="text-danger fw-bold text-uppercase" style={{ fontSize: 'var(--font-size-sm)' }}>Calculate IP Charges</span>}
                checked={calculateCharges}
                onChange={(e) => handleCalculateChargesChange(e.target.checked)}
              />

              <Form.Check
                type="checkbox"
                id="final-calc"
                className="m-0"
                label={<span className="text-danger fw-bold text-uppercase" style={{ fontSize: 'var(--font-size-sm)' }}>Final Bill Calculation</span>}
                checked={finalBillCalculation}
                onChange={(e) => handleFinalBillCalculationChange(e.target.checked)}
              />
            </div>
            
            <div className="d-flex align-items-center gap-2 border rounded px-3 py-2 bg-white shadow-sm">
              <Form.Check
                type="checkbox"
                id="date-toggle"
                checked={localShowBillDate}
                onChange={(e) => { setShowBillDate(e.target.checked); onShowBillDateChange(e.target.checked); }}
                className="m-0"
                disabled={!finalBillCalculation}
              />
              <label htmlFor="date-toggle" className="fw-bold mb-0 text-nowrap" style={{ fontSize: 'var(--font-size-sm)', cursor: 'pointer' }}>BILL DATE & TIME:</label>
              <Form.Control
                type="datetime-local"
                size="sm"
                value={localBillDateTime}
                onChange={(e) => { setBillDateTime(e.target.value); onBillDateTimeChange(e.target.value); }}
                disabled={!finalBillCalculation || !localShowBillDate}
                className="py-1 px-2"
                style={{ fontSize: 'var(--font-size-sm)', height: '32px', minWidth: '180px', maxWidth: '240px' }}
              />
            </div>
          </div>

          <div className="flex-form-item flex-item-3 d-flex align-items-end justify-content-end gap-3">
            <Button
              className="px-4 py-2 fw-bold shadow-sm d-flex align-items-center gap-2 theme-btn-primary"
              onClick={handleGenerateBill}
              disabled={ipItems.length > 0 || !!billNo || isGenerating || (!calculateCharges && !finalBillCalculation)}
              title={ipItems.length > 0 || billNo ? 'Bill exists. Cancel to generate new bill.' : (!calculateCharges && !finalBillCalculation ? 'Select Calculate IP Charges or Final Bill Calculation to enable generate.' : 'Generate IP Bill')}
              style={{ 
                fontSize: 'var(--font-size-sm)', 
                cursor: (ipItems.length > 0 || billNo || (!calculateCharges && !finalBillCalculation)) ? 'not-allowed' : 'pointer',
                borderRadius: '6px',
                transition: 'all 0.2s',
                opacity: (ipItems.length > 0 || billNo || (!calculateCharges && !finalBillCalculation)) ? 0.6 : 1,
              }}
            >
              <FaCheckCircleIcon /> {isGenerating ? 'GENERATING...' : 'GENERATE'}
            </Button>

            {(ipItems.length > 0 || billNo) && (
              <Button
                className="px-4 py-2 fw-bold shadow-sm d-flex align-items-center gap-2 theme-outline-btn-primary"
                onClick={handleCancelBill}
                disabled={isGenerating}
                title="Cancel existing bill"
                style={{ 
                  fontSize: 'var(--font-size-sm)', 
                  borderRadius: '6px',
                  transition: 'all 0.2s',
                }}
              >
                {isGenerating ? 'CANCELLING...' : 'CANCEL BILL'}
              </Button>
            )}

            {billNo && billIds && (
              <div className="d-flex flex-column animated fadeIn bg-white border rounded px-3 py-2 shadow-sm" style={{ minWidth: '200px' }}>
                <div className="text-muted fw-bold text-uppercase mb-1" style={{ fontSize: 'calc(var(--font-size-xs) * 0.846)', letterSpacing: '0.5px' }}>Generated Bills</div>
                {billIds.finalBillDisplay && (
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>Final Bill:</span>
                    <span className="fw-bold" style={{ fontSize: 'calc(var(--font-size-md) * 1.0625)', color: 'var(--page-secondary-color)' }}>{billIds.finalBillDisplay}</span>
                  </div>
                )}
                {billIds.cashBillDisplay && (
                  <div className="d-flex justify-content-between align-items-center mb-1">
                    <span className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>Cash Bill:</span>
                    <span className="fw-bold text-success" style={{ fontSize: 'calc(var(--font-size-md) * 1.0625)' }}>{billIds.cashBillDisplay}</span>
                  </div>
                )}
                {billIds.ipBillDisplay && (
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-muted" style={{ fontSize: 'var(--font-size-sm)' }}>IP Bill:</span>
                    <span className="fw-bold text-info" style={{ fontSize: 'calc(var(--font-size-md) * 1.0625)' }}>{billIds.ipBillDisplay}</span>
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
