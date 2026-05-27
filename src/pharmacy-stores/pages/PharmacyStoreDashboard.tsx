import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { routerPathNames } from '../../routes/routerPathNames';

const PharmacyStoreDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Dummy statistics data
  const stats = [
    {
      title: 'Today Sales',
      value: '₹45,280',
      icon: 'fas fa-rupee-sign',
      trend: '+12.5%',
      trendUp: true,
      color: 'var(--page-primary-color)'
    },
    {
      title: 'Total Prescriptions',
      value: '156',
      icon: 'fas fa-prescription',
      trend: '+8.3%',
      trendUp: true,
      color: '#28a745'
    },
    {
      title: 'Low Stock Items',
      value: '23',
      icon: 'fas fa-exclamation-triangle',
      trend: '+5 items',
      trendUp: false,
      color: '#dc3545'
    },
    {
      title: 'Pending Orders',
      value: '12',
      icon: 'fas fa-clock',
      trend: '-3 orders',
      trendUp: true,
      color: '#ffc107'
    }
  ];

  // Quick actions
  const quickActions = [
    {
      title: 'Order',
      icon: 'fas fa-shopping-cart',
      color: 'var(--page-primary-color)',
      description: 'Create new billing order',
      action: () => navigate(routerPathNames.pharmacyStores.pharmacy.billing.order)
    },
    {
      title: 'Dispense Drug',
      icon: 'fas fa-pills',
      color: 'var(--page-secondary-color)',
      description: 'Process patient prescriptions',
      action: () => navigate(routerPathNames.pharmacyStores.pharmacy.activities.dispenseDrug)
    },
    {
      title: 'Sales Return',
      icon: 'fas fa-undo',
      color: '#fd7e14',
      description: 'Process pharmacy sales returns',
      action: () => navigate(routerPathNames.pharmacyStores.pharmacy.activities.salesReturn)
    }
  ];

  // Dummy recent activities
  const recentActivities = [
    {
      id: 1,
      action: 'Prescription Dispensed',
      patient: 'John Mathew',
      amount: '₹1,250',
      time: '10 minutes ago',
      icon: 'fas fa-pills',
      color: 'var(--page-primary-color)'
    },
    {
      id: 2,
      action: 'Stock Updated',
      patient: 'Paracetamol 500mg',
      amount: '+500 units',
      time: '25 minutes ago',
      icon: 'fas fa-box',
      color: '#28a745'
    },
    {
      id: 3,
      action: 'Purchase Order Created',
      patient: 'PO-2024-0156',
      amount: '₹25,000',
      time: '1 hour ago',
      icon: 'fas fa-shopping-cart',
      color: '#17a2b8'
    },
    {
      id: 4,
      action: 'Sales Return Processed',
      patient: 'Sarah Thomas',
      amount: '₹450',
      time: '2 hours ago',
      icon: 'fas fa-undo',
      color: '#fd7e14'
    },
    {
      id: 5,
      action: 'Transfer Approved',
      patient: 'TR-2024-0089',
      amount: '45 items',
      time: '3 hours ago',
      icon: 'fas fa-exchange-alt',
      color: '#6c757d'
    }
  ];

  // Dummy quick links
  const quickLinks = [
    { title: 'Batch Details', icon: 'fas fa-archive', path: '#' },
    { title: 'View Orders', icon: 'fas fa-eye', path: '#' },
    { title: 'Approve Orders', icon: 'fas fa-check-circle', path: '#' },
    { title: 'Transfer Register', icon: 'fas fa-book', path: '#' },
    { title: 'Ready Patients', icon: 'fas fa-user-check', path: '#' }
  ];

  return (
    <div style={{ 
      padding: '1.5rem',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      minHeight: '100%'
    }}>
      <Container fluid>
        {/* Page Header */}
        <div style={{
          marginBottom: '2rem'
        }}>
          <h2 style={{
            color: 'var(--page-secondary-color)',
            fontWeight: 'var(--font-weight-bold)',
            fontSize: '1.75rem',
            marginBottom: '0.5rem'
          }}>
            <i className="fas fa-tachometer-alt" style={{ marginRight: '0.75rem' }}></i>
            Pharmacy Store Dashboard
          </h2>
          <p style={{
            color: '#6c757d',
            fontSize: '0.95rem',
            marginBottom: 0
          }}>
            Welcome back! Here's what's happening in your pharmacy today.
          </p>
        </div>

        {/* Statistics Cards */}
        

        {/* Quick Actions Section */}
        <Row className="g-3 mb-4">
          <Col xs={12}>
            <h4 style={{
              color: 'var(--page-secondary-color)',
              fontWeight: 'var(--font-weight-bold)',
              fontSize: '1.25rem',
              marginBottom: '1rem'
            }}>
              <i className="fas fa-bolt" style={{ marginRight: '0.5rem' }}></i>
              Quick Actions
            </h4>
          </Col>
          {quickActions.map((action, index) => (
            <Col key={index} xs={12} sm={6} lg={3}>
              <Card
                onClick={action.action}
                style={{
                  border: 'none',
                  borderRadius: '12px',
                  boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                  cursor: 'pointer',
                  height: '100%',
                  transition: 'all 0.3s ease',
                  animation: `slideUp 0.5s ease-out ${0.4 + index * 0.1}s both`
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.18)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.08)';
                }}
              >
                <Card.Body style={{ textAlign: 'center', padding: '2rem 1.5rem' }}>
                  <div style={{
                    width: '70px',
                    height: '70px',
                    borderRadius: '50%',
                    background: action.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem',
                    boxShadow: '0 4px 15px rgba(0,0,0,0.15)'
                  }}>
                    <i className={action.icon} style={{ fontSize: '1.75rem', color: 'white' }}></i>
                  </div>
                  <h5 style={{
                    fontSize: '1.1rem',
                    fontWeight: 'var(--font-weight-bold)',
                    color: '#2c3e50',
                    marginBottom: '0.5rem'
                  }}>
                    {action.title}
                  </h5>
                  <p style={{
                    fontSize: '0.85rem',
                    color: '#6c757d',
                    marginBottom: 0
                  }}>
                    {action.description}
                  </p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Recent Activities & Quick Links */}
        
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

export default PharmacyStoreDashboard;
