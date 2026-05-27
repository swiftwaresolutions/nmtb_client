import React, { useState } from 'react';
import { Container, Card, Row, Col, Form, Button, Table } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { RootState } from '../../../state/store';
import { faCalendarCheck, faPrint, faFileExcel } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { showErrorToast, showSuccessToast } from '../../../utils/alertUtil';
import '../../../style/commonStyle.css';

// Dummy data structure for the report
interface UserCollection {
  userName: string;
  grossCollection: number;
  cash: number;
  debitCreditCard: number;
  upiNeft: number;
  cheque: number;
  company: number;
  credit: number;
  returns: number;
  advAdjustment: number;
  charity: number;
  staffMedicalBenefit: number;
  netAmount: number;
}

interface DepartmentData {
  departmentName: string;
  users: UserCollection[];
  subTotal: UserCollection;
}

const DayEnd: React.FC = () => {
  const loginData = useSelector((state: RootState) => state.loginData);
  const [loading, setLoading] = useState(false);
  const [showReport, setShowReport] = useState(false);
  
  const [formData, setFormData] = useState({
    fromDate: '2025-01-08',
    toDate: '2025-01-10',
  });

  // Dummy data matching the provided format
  const getDummyData = (): DepartmentData[] => {
    return [
      {
        departmentName: 'RECEPTION',
        users: [
          {
            userName: 'Reception User 1',
            grossCollection: 15000,
            cash: 8000,
            debitCreditCard: 5000,
            upiNeft: 2000,
            cheque: 0,
            company: 0,
            credit: 0,
            returns: 500,
            advAdjustment: 200,
            charity: 100,
            staffMedicalBenefit: 0,
            netAmount: 14200
          },
          {
            userName: 'Reception User 2',
            grossCollection: 12000,
            cash: 7000,
            debitCreditCard: 3000,
            upiNeft: 2000,
            cheque: 0,
            company: 0,
            credit: 0,
            returns: 300,
            advAdjustment: 100,
            charity: 50,
            staffMedicalBenefit: 0,
            netAmount: 11550
          }
        ],
        subTotal: {
          userName: 'Sub Total',
          grossCollection: 27000,
          cash: 15000,
          debitCreditCard: 8000,
          upiNeft: 4000,
          cheque: 0,
          company: 0,
          credit: 0,
          returns: 800,
          advAdjustment: 300,
          charity: 150,
          staffMedicalBenefit: 0,
          netAmount: 25750
        }
      },
      {
        departmentName: 'BILLING',
        users: [
          {
            userName: 'Billing User 1',
            grossCollection: 85000,
            cash: 35000,
            debitCreditCard: 25000,
            upiNeft: 15000,
            cheque: 10000,
            company: 0,
            credit: 0,
            returns: 2000,
            advAdjustment: 1000,
            charity: 500,
            staffMedicalBenefit: 200,
            netAmount: 81300
          },
          {
            userName: 'Billing User 2',
            grossCollection: 95000,
            cash: 40000,
            debitCreditCard: 30000,
            upiNeft: 20000,
            cheque: 5000,
            company: 0,
            credit: 0,
            returns: 2500,
            advAdjustment: 1500,
            charity: 600,
            staffMedicalBenefit: 300,
            netAmount: 90100
          }
        ],
        subTotal: {
          userName: 'Sub Total',
          grossCollection: 180000,
          cash: 75000,
          debitCreditCard: 55000,
          upiNeft: 35000,
          cheque: 15000,
          company: 0,
          credit: 0,
          returns: 4500,
          advAdjustment: 2500,
          charity: 1100,
          staffMedicalBenefit: 500,
          netAmount: 171400
        }
      },
      {
        departmentName: 'PHARMACY',
        users: [
          {
            userName: 'Pharmacy User 1',
            grossCollection: 65000,
            cash: 28000,
            debitCreditCard: 20000,
            upiNeft: 12000,
            cheque: 5000,
            company: 0,
            credit: 0,
            returns: 1500,
            advAdjustment: 800,
            charity: 400,
            staffMedicalBenefit: 150,
            netAmount: 62150
          },
          {
            userName: 'Pharmacy User 2',
            grossCollection: 55000,
            cash: 24000,
            debitCreditCard: 18000,
            upiNeft: 10000,
            cheque: 3000,
            company: 0,
            credit: 0,
            returns: 1200,
            advAdjustment: 600,
            charity: 300,
            staffMedicalBenefit: 100,
            netAmount: 52800
          }
        ],
        subTotal: {
          userName: 'Sub Total',
          grossCollection: 120000,
          cash: 52000,
          debitCreditCard: 38000,
          upiNeft: 22000,
          cheque: 8000,
          company: 0,
          credit: 0,
          returns: 2700,
          advAdjustment: 1400,
          charity: 700,
          staffMedicalBenefit: 250,
          netAmount: 114950
        }
      }
    ];
  };

  const calculateGrandTotal = (departments: DepartmentData[]) => {
    return departments.reduce((acc, dept) => ({
      userName: 'Grand Total',
      grossCollection: acc.grossCollection + dept.subTotal.grossCollection,
      cash: acc.cash + dept.subTotal.cash,
      debitCreditCard: acc.debitCreditCard + dept.subTotal.debitCreditCard,
      upiNeft: acc.upiNeft + dept.subTotal.upiNeft,
      cheque: acc.cheque + dept.subTotal.cheque,
      company: acc.company + dept.subTotal.company,
      credit: acc.credit + dept.subTotal.credit,
      returns: acc.returns + dept.subTotal.returns,
      advAdjustment: acc.advAdjustment + dept.subTotal.advAdjustment,
      charity: acc.charity + dept.subTotal.charity,
      staffMedicalBenefit: acc.staffMedicalBenefit + dept.subTotal.staffMedicalBenefit,
      netAmount: acc.netAmount + dept.subTotal.netAmount,
    }), {
      userName: 'Grand Total',
      grossCollection: 0,
      cash: 0,
      debitCreditCard: 0,
      upiNeft: 0,
      cheque: 0,
      company: 0,
      credit: 0,
      returns: 0,
      advAdjustment: 0,
      charity: 0,
      staffMedicalBenefit: 0,
      netAmount: 0,
    });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // TODO: Implement actual API call
      // const response = await cashCounterApiService.getDayEndReport(formData);
      setShowReport(true);
      showSuccessToast('Report generated successfully');
    } catch (error) {
      console.error('Error generating report:', error);
      showErrorToast('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleExport = () => {
    // TODO: Implement Excel export
    showSuccessToast('Export feature coming soon');
  };

  const departments = getDummyData();
  const grandTotal = calculateGrandTotal(departments);
  const finalDayCollection = grandTotal.netAmount;

  const renderCollectionRow = (data: UserCollection, isSubTotal = false, isGrandTotal = false) => (
    <tr 
      key={data.userName}
      style={{ 
        fontWeight: (isSubTotal || isGrandTotal) ? '700' : 'normal',
        backgroundColor: isGrandTotal ? '#e3f2fd' : isSubTotal ? '#f5f5f5' : 'transparent',
        fontSize: (isSubTotal || isGrandTotal) ? '14px' : '13px'
      }}
    >
      <td>{data.userName}</td>
      <td className="text-end">₹{data.grossCollection.toFixed(2)}</td>
      <td className="text-end">₹{data.cash.toFixed(2)}</td>
      <td className="text-end">₹{data.debitCreditCard.toFixed(2)}</td>
      <td className="text-end">₹{data.upiNeft.toFixed(2)}</td>
      <td className="text-end">₹{data.cheque.toFixed(2)}</td>
      <td className="text-end">₹{data.company.toFixed(2)}</td>
      <td className="text-end">₹{data.credit.toFixed(2)}</td>
      <td className="text-end">₹{data.returns.toFixed(2)}</td>
      <td className="text-end">₹{data.advAdjustment.toFixed(2)}</td>
      <td className="text-end">₹{data.charity.toFixed(2)}</td>
      <td className="text-end">₹{data.staffMedicalBenefit.toFixed(2)}</td>
      <td className="text-end" style={{ fontWeight: '600' }}>₹{data.netAmount.toFixed(2)}</td>
    </tr>
  );

  return (
    <Container fluid className="p-4">
      {/* Filter Section */}
      <Card className="shadow-sm mb-4">
        <Card.Body>
          <Row className="align-items-end">
            <Col md={3}>
              <Form.Group>
                <Form.Label>From Date & Time</Form.Label>
                <Form.Control
                  type="date"
                  name="fromDate"
                  value={formData.fromDate}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label>To Date & Time</Form.Label>
                <Form.Control
                  type="date"
                  name="toDate"
                  value={formData.toDate}
                  onChange={handleInputChange}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Button 
                variant="primary" 
                onClick={handleGenerateReport}
                disabled={loading}
                className="me-2"
              >
                {loading ? 'Generating...' : 'Generate Report'}
              </Button>
              {showReport && (
                <>
                  <Button 
                    variant="outline-secondary" 
                    onClick={handlePrint}
                    className="me-2"
                  >
                    <FontAwesomeIcon icon={faPrint} className="me-2" />
                    Print
                  </Button>
                  <Button 
                    variant="outline-success" 
                    onClick={handleExport}
                  >
                    <FontAwesomeIcon icon={faFileExcel} className="me-2" />
                    Export
                  </Button>
                </>
              )}
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {/* Report Section */}
      {showReport && (
        <Card className="shadow-sm report-container">
          {/* Hospital Header */}
          <Card.Header className="bg-white border-0 text-center py-3" style={{ borderBottom: '2px solid #dee2e6' }}>
            <h4 className="mb-0" style={{ fontWeight: '700', color: '#2c3e50' }}>
              CHRISTIAN HOSPITAL, BERHAMPUR
            </h4>
            <h5 className="mt-2 mb-1" style={{ fontWeight: '600', color: '#34495e' }}>
              Account Details
            </h5>
            <p className="mb-0 text-muted" style={{ fontSize: '14px' }}>
              Date From {new Date(formData.fromDate).toLocaleDateString('en-GB')} 
              {' '}To{' '}
              {new Date(formData.toDate).toLocaleDateString('en-GB')}
            </p>
          </Card.Header>

          <Card.Body className="p-0">
            {/* User Wise Details Table */}
            <div style={{ overflowX: 'auto' }}>
              <Table bordered size="sm" className="mb-0" style={{ fontSize: '13px' }}>
                <thead className="bg-light">
                  <tr style={{ fontWeight: '600' }}>
                    <th colSpan={13} className="text-center bg-secondary text-white py-2">
                      User Wise Details
                    </th>
                  </tr>
                  <tr style={{ fontWeight: '600', backgroundColor: '#f8f9fa' }}>
                    <th rowSpan={2} style={{ verticalAlign: 'middle' }}>User Name</th>
                    <th colSpan={7} className="text-center">Collections</th>
                    <th colSpan={4} className="text-center">Deductions</th>
                    <th rowSpan={2} style={{ verticalAlign: 'middle' }}>Net Amount</th>
                  </tr>
                  <tr style={{ fontWeight: '600', backgroundColor: '#f8f9fa' }}>
                    <th>Gross Collection</th>
                    <th>Cash</th>
                    <th>Debit/Credit Card</th>
                    <th>UPI/NEFT</th>
                    <th>Cheque</th>
                    <th>Company</th>
                    <th>Credit</th>
                    <th>Returns</th>
                    <th>Adv. Adjustment</th>
                    <th>Charity</th>
                    <th>Staff Medical Benefit</th>
                  </tr>
                </thead>
                <tbody>
                  {departments.map((dept, deptIdx) => (
                    <React.Fragment key={deptIdx}>
                      {/* Department Header */}
                      <tr style={{ backgroundColor: '#e8f4f8' }}>
                        <td colSpan={13} style={{ fontWeight: '700', padding: '8px' }}>
                          {dept.departmentName}
                        </td>
                      </tr>
                      
                      {/* Department Users */}
                      {dept.users.map((user) => renderCollectionRow(user))}
                      
                      {/* Department Sub Total */}
                      {renderCollectionRow(dept.subTotal, true)}
                    </React.Fragment>
                  ))}

                  {/* Grand Total */}
                  {renderCollectionRow(grandTotal, false, true)}
                </tbody>
              </Table>
            </div>

            {/* Final Day Collection */}
            <div className="p-3 bg-light border-top">
              <Row>
                <Col md={6}>
                  <strong>Final Day Collection:</strong>
                  <span className="ms-3" style={{ fontSize: '18px', fontWeight: '700', color: '#2c3e50' }}>
                    ₹{finalDayCollection.toFixed(2)}
                  </span>
                </Col>
              </Row>
            </div>

            {/* Verification Footer */}
            <div className="p-4 border-top">
              <Row>
                <Col md={6} className="text-center">
                  <div style={{ marginTop: '40px', borderTop: '1px solid #000', paddingTop: '5px', display: 'inline-block', minWidth: '200px' }}>
                    Verified By
                  </div>
                </Col>
                <Col md={6} className="text-center">
                  <div style={{ marginTop: '40px', borderTop: '1px solid #000', paddingTop: '5px', display: 'inline-block', minWidth: '200px' }}>
                    Authorized By
                  </div>
                </Col>
              </Row>
            </div>
          </Card.Body>
        </Card>
      )}

      {/* Print Styles */}
      <style>{`
        @media print {
          .btn, .card:first-child {
            display: none !important;
          }
          .report-container {
            box-shadow: none !important;
            border: none !important;
          }
          body {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
          table {
            page-break-inside: auto;
          }
          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }
        }
      `}</style>
    </Container>
  );
};

export default DayEnd;
