import React from 'react';
import { Container, Row, Col, Card, Button, Table } from 'react-bootstrap';
import { 
  FaRupeeSign, 
  FaFileInvoiceDollar, 
  FaMoneyCheckAlt, 
  FaTimesCircle,
  FaChartLine,
  FaCreditCard,
  FaMobileAlt,
  FaClock,
  FaExclamationTriangle,
  FaUserInjured,
  FaReceipt,
  FaCalendarDay
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { routerPathNames } from '../../routes/routerPathNames';

// Type casting to fix TypeScript issues with react-icons
const FaRupeeSignIcon = FaRupeeSign as any;
const FaFileInvoiceDollarIcon = FaFileInvoiceDollar as any;
const FaMoneyCheckAltIcon = FaMoneyCheckAlt as any;
const FaTimesCircleIcon = FaTimesCircle as any;
const FaChartLineIcon = FaChartLine as any;
const FaCreditCardIcon = FaCreditCard as any;
const FaMobileAltIcon = FaMobileAlt as any;
const FaClockIcon = FaClock as any;
const FaExclamationTriangleIcon = FaExclamationTriangle as any;
const FaUserInjuredIcon = FaUserInjured as any;
const FaReceiptIcon = FaReceipt as any;
const FaCalendarDayIcon = FaCalendarDay as any;

const CashCounterDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Mock data - will be replaced with API calls
  const todayStats = {
    totalCollection: 125000,
    pendingBills: 15,
    activeAdvances: 8,
    cancelledBills: 3
  };

  const collectionBreakdown = {
    cash: 65000,
    card: 35000,
    online: 20000,
    upi: 5000
  };

  const recentTransactions = [
    { id: 'BL001', patient: 'John Doe', type: 'IP Bill', amount: 15000, time: '10:30 AM', status: 'Paid' },
    { id: 'BL002', patient: 'Jane Smith', type: 'Advance', amount: 5000, time: '11:15 AM', status: 'Paid' },
    { id: 'BL003', patient: 'Mike Johnson', type: 'IP Bill', amount: 28000, time: '12:00 PM', status: 'Paid' },
    { id: 'BL004', patient: 'Sarah Williams', type: 'Return', amount: 2000, time: '02:30 PM', status: 'Refunded' },
    { id: 'BL005', patient: 'David Brown', type: 'IP Bill', amount: 45000, time: '03:45 PM', status: 'Paid' }
  ];

  const pendingTasks = [
    { text: '3 bills pending approval', type: 'warning', icon: FaExclamationTriangleIcon },
    { text: '5 advance refunds to process', type: 'info', icon: FaMoneyCheckAltIcon },
    { text: 'Day-end not completed for yesterday', type: 'danger', icon: FaClockIcon }
  ];

  const quickActions = [
    {
      title: 'Billing',
      path: routerPathNames.cashCounter.billing.opBilling,
      icon: FaFileInvoiceDollarIcon,
      iconColor: 'var(--btn-primary)',
      iconBg: 'var(--bg-white)',
      cardBg: 'var(--primary-color-light)'
    },
    {
      title: 'Order List / Cancel',
      path: routerPathNames.cashCounter.billing.CancelOrder,
      icon: FaTimesCircleIcon,
      iconColor: 'var(--color-danger)',
      iconBg: 'var(--bg-white)',
      cardBg: 'var(--secondary-color)'
    },
    {
      title: 'Duplicate Bill',
      path: routerPathNames.cashCounter.activities.duplicateBill,
      icon: FaReceiptIcon,
      iconColor: 'var(--color-info)',
      iconBg: 'var(--bg-white)',
      cardBg: 'var(--sidebar-bg-start)'
    }
  ];

  return (
    <div
      className="content-body selection-area-login-theme"
      style={{
        background: 'linear-gradient(180deg, var(--sa-surface-light) 75%, var(--sa-surface-warm) 100%)',
        minHeight: '100%'
      }}
    >
    <Container fluid className="p-4">
      {/* Header */}
      <div className="content-header mb-4">
        <h2 className="mb-1">Cash Counter Dashboard</h2>
        <p className="text-muted mb-0">
          <FaClockIcon className="me-2" />
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Statistics Cards */}
      

      {/* Quick Actions */}
      <Row className="mb-4">
        <Col xs={12}>
          <Card className="border-0" style={{ background: 'var(--bg-white)', boxShadow: 'var(--shadow-sm)' }}>
            <Card.Body className="p-4">
              <div
                className="mb-3"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '0.75rem'
                }}
              >
                <h5
                  className="mb-0"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    color: 'var(--page-secondary-color)',
                    fontWeight: 'var(--font-weight-semibold)'
                  }}
                >
                  <FaChartLineIcon className="me-2" color="var(--btn-primary)" />
                  Quick Actions
                </h5>
              </div>
              <Row className="g-3">
                {quickActions.map((action, index) => (
                  <Col xs={12} md={4} key={index}>
                    <Button 
                      variant="light" 
                      className="w-100 py-3 border-0"
                      style={{ 
                        background: action.cardBg,
                        borderRadius: 'calc(var(--border-radius-sm) * 4)',
                        boxShadow: 'var(--shadow-sm)',
                        transition: 'var(--transition-normal)',
                        cursor: 'pointer',
                        minHeight: '118px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        borderTop: `3px solid ${action.iconColor}`
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                      }}
                      onClick={() => navigate(action.path)}
                    >
                      <div
                        className="mb-2"
                        style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '50%',
                          background: action.iconBg,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          margin: '0 auto'
                        }}
                      >
                        <action.icon size={24} color={action.iconColor} />
                      </div>
                      <div className="fw-semibold" style={{ color: 'var(--page-secondary-color)', fontSize: 'var(--font-size-sm)' }}>
                        {action.title}
                      </div>
                    </Button>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      

      {/* Recent Transactions */}
      
    </Container>
    </div>
  );
};

export default CashCounterDashboard;
