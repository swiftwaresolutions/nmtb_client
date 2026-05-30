import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { routerPathNames } from '../../routes/routerPathNames';

const MedicalStoreDashboardHome: React.FC = () => {
  const navigate = useNavigate();

  // Dummy statistics data
  const stats = [
    {
      title: 'Today Goods Receipt',
      value: '₹1,25,400',
      icon: 'fas fa-truck-loading',
      trend: '+18.2%',
      trendUp: true,
      color: 'var(--page-primary-color)'
    },
    {
      title: 'Purchase Orders',
      value: '34',
      icon: 'fas fa-file-invoice',
      trend: '+6 new',
      trendUp: true,
      color: '#28a745'
    },
    {
      title: 'Low Stock Alert',
      value: '18',
      icon: 'fas fa-exclamation-circle',
      trend: '+3 items',
      trendUp: false,
      color: '#dc3545'
    },
    {
      title: 'Pending Approvals',
      value: '9',
      icon: 'fas fa-hourglass-half',
      trend: '-4 today',
      trendUp: true,
      color: '#ffc107'
    }
  ];

  // Dummy quick actions
  const quickActions = [
    {
      title: 'Prepare Order',
      icon: 'fas fa-shopping-cart',
      color: 'var(--page-primary-color)',
      description: 'Create new purchase order',
      action: () => console.log('Navigate to Prepare Order')
    },
    {
      title: 'Purchase Entry',
      icon: 'fas fa-clipboard-check',
      color: '#28a745',
      description: 'Record goods receipt',
      action: () => console.log('Navigate to Purchase Entry')
    },
    {
      title: 'Stock Register',
      icon: 'fas fa-boxes',
      color: '#17a2b8',
      description: 'View inventory levels',
      action: () => console.log('Navigate to Stock Register')
    },
    {
      title: 'Transfer Order',
      icon: 'fas fa-exchange-alt',
      color: '#fd7e14',
      description: 'Transfer items between stores',
      action: () => console.log('Navigate to Transfer Order')
    }
  ];

  // Dummy recent activities
  const recentActivities = [
    {
      id: 1,
      action: 'Purchase Order Approved',
      details: 'PO-2024-0234',
      amount: '₹45,800',
      time: '15 minutes ago',
      icon: 'fas fa-check-circle',
      color: '#28a745'
    },
    {
      id: 2,
      action: 'Goods Receipt Entry',
      details: 'GRN-2024-0156',
      amount: '₹32,500',
      time: '30 minutes ago',
      icon: 'fas fa-truck-loading',
      color: 'var(--page-primary-color)'
    },
    {
      id: 3,
      action: 'Transfer Completed',
      details: 'TR-2024-0145',
      amount: '120 items',
      time: '1 hour ago',
      icon: 'fas fa-exchange-alt',
      color: '#17a2b8'
    },
    {
      id: 4,
      action: 'Stock Adjustment',
      details: 'Paracetamol 500mg',
      amount: '+250 units',
      time: '2 hours ago',
      icon: 'fas fa-sliders-h',
      color: '#fd7e14'
    },
    {
      id: 5,
      action: 'Purchase Order Created',
      details: 'PO-2024-0235',
      amount: '₹28,900',
      time: '3 hours ago',
      icon: 'fas fa-file-alt',
      color: '#6c757d'
    }
  ];

  // Quick links
  const quickLinks = [
    { title: 'Prepare Purchase Order', icon: 'fas fa-file-alt', action: () => navigate(routerPathNames.centralStores.medicalStore.purchase.prepareOrder) },
    { title: 'Approve Purchase Order', icon: 'fas fa-clipboard-check', action: () => navigate(routerPathNames.centralStores.medicalStore.purchase.approveOrder) },
    { title: 'Purchase Entry', icon: 'fas fa-truck-loading', action: () => navigate(routerPathNames.centralStores.medicalStore.purchase.selectApprovedPO) },
    { title: 'Prepare Transfer Order', icon: 'fas fa-exchange-alt', action: () => navigate(routerPathNames.centralStores.medicalStore.transferOrder.prepareTransfer) },
    { title: 'Approve Transfer Order', icon: 'fas fa-check-circle', action: () => navigate(routerPathNames.centralStores.medicalStore.transferOrder.approveTransfer) },
    { title: 'Damage/Consumable Entry', icon: 'fas fa-box-open', action: () => navigate(routerPathNames.centralStores.medicalStore.consumableOrder.create) },
    { title: 'Damage/Consumables Approve', icon: 'fas fa-check-double', action: () => navigate(routerPathNames.centralStores.medicalStore.activities.consumableApproval) },
    { title: 'Purchase Return', icon: 'fas fa-undo', action: () => navigate(routerPathNames.centralStores.medicalStore.purchase.selectSupplierDate) }
  ];

  const quickLinkGradients = [
    'linear-gradient(135deg, var(--btn-primary) 0%, var(--color-info) 100%)',
    'linear-gradient(135deg, var(--btn-success) 0%, var(--color-warning) 100%)',
    'linear-gradient(135deg, var(--color-danger) 0%, var(--btn-primary) 100%)',
    'linear-gradient(135deg, var(--color-info) 0%, var(--sa-accent) 100%)'
  ];

  return (
    <div className="content-body selection-area-login-theme" style={{
      flex: 1,
      overflow: 'auto',
      width: '100%',
      background: 'linear-gradient(180deg, var(--sa-surface-light) 75%, var(--sa-surface-warm) 100%)',
      minHeight: '100%'
    }}>
      <Container fluid style={{ padding: '1.5rem' }}>
        {/* Page Header */}
        <div style={{
          marginBottom: '2rem'
        }}>
          <h2 style={{
            color: '#ff5e00',
            fontWeight: 'var(--font-weight-bold)',
            fontSize: 'calc(var(--font-size-3xl) * 1.16)',
            marginBottom: '0.5rem'
          }}>
            <i
              className="fas fa-hospital"
              style={{
                marginRight: '0.75rem',
                background: 'linear-gradient(135deg, #0d6efd 0%, #20c997 50%, #ff5e00 100%)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                display: 'inline-block'
              }}
            ></i>
            Medical Store Dashboard
          </h2>
          <p style={{
            color: '#000000',
            fontSize: 'var(--font-size-base)',
            marginBottom: 0
          }}>
            Welcome back! Monitor your medical store operations and inventory.
          </p>
        </div>

        {/* Statistics Cards */}
        

        {/* Quick Actions Section */}
        

        {/* Quick Links */}
        <Row className="g-3 mb-4">
          <Col xs={12}>
            <h4 style={{
              color: 'var(--page-secondary-color)',
              fontWeight: 'var(--font-weight-bold)',
              fontSize: 'var(--font-size-2xl)',
              marginBottom: '1rem'
            }}>
              <i className="fas fa-link" style={{ marginRight: '0.5rem' }}></i>
              Quick Links
            </h4>
          </Col>
          {quickLinks.map((link, index) => (
            <Col key={index} xs={12} sm={6} lg={3}>
              <div
                onClick={link.action}
                role="button"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  padding: '0.875rem 1rem',
                  borderRadius: 'calc(var(--border-radius-sm) * 2)',
                  background: 'var(--sa-card-bg)',
                  textDecoration: 'none',
                  color: 'var(--text-primary)',
                  transition: 'var(--transition-normal)',
                  border: '1px solid var(--border-color)',
                  boxShadow: 'var(--shadow-sm)',
                  cursor: 'pointer'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = 'var(--header-bg)';
                  e.currentTarget.style.borderColor = 'var(--sa-accent-soft)';
                  e.currentTarget.style.boxShadow = 'var(--sa-accent-shadow-sm)';
                  e.currentTarget.style.transform = 'translateX(4px)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'var(--sa-card-bg)';
                  e.currentTarget.style.borderColor = 'var(--border-color)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                  e.currentTarget.style.transform = 'translateX(0)';
                }}
              >
                <div style={{
                  width: '35px',
                  height: '35px',
                  borderRadius: '8px',
                  background: quickLinkGradients[index % quickLinkGradients.length],
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginRight: '0.875rem',
                  boxShadow: 'var(--sa-accent-shadow-sm)',
                  flexShrink: 0
                }}>
                  <i className={link.icon} style={{ color: 'var(--bg-white)', fontSize: 'var(--font-size-md)' }}></i>
                </div>
                <span style={{ fontWeight: 'var(--font-weight-semibold)', fontSize: 'var(--font-size-sm)' }}>
                  {link.title}
                </span>
              </div>
            </Col>
          ))}
        </Row>
      </Container>

      {/* CSS Animation */}
      <style>{`
        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
};

export default MedicalStoreDashboardHome;
