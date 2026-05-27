import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';

const NonMedicalStoreDashboardHome: React.FC = () => {
  // Dummy statistics data
  const stats = [
    {
      title: 'Today Receipts',
      value: '₹48,650',
      icon: 'fas fa-box-open',
      trend: '+14.8%',
      trendUp: true,
      color: 'var(--page-primary-color)'
    },
    {
      title: 'Purchase Orders',
      value: '28',
      icon: 'fas fa-shopping-cart',
      trend: '+5 new',
      trendUp: true,
      color: '#28a745'
    },
    {
      title: 'Low Stock Items',
      value: '15',
      icon: 'fas fa-exclamation-triangle',
      trend: '+2 items',
      trendUp: false,
      color: '#dc3545'
    },
    {
      title: 'Pending Transfers',
      value: '7',
      icon: 'fas fa-sync-alt',
      trend: '-3 today',
      trendUp: true,
      color: '#ffc107'
    }
  ];

  // Dummy quick actions
  const quickActions = [
    {
      title: 'Prepare Order',
      icon: 'fas fa-file-alt',
      color: 'var(--page-primary-color)',
      description: 'Create new purchase order',
      action: () => console.log('Navigate to Prepare Order')
    },
    {
      title: 'Goods Receipt',
      icon: 'fas fa-truck',
      color: '#28a745',
      description: 'Record incoming goods',
      action: () => console.log('Navigate to Goods Receipt')
    },
    {
      title: 'Stock Register',
      icon: 'fas fa-warehouse',
      color: '#17a2b8',
      description: 'Check inventory status',
      action: () => console.log('Navigate to Stock Register')
    },
    {
      title: 'Transfer Items',
      icon: 'fas fa-dolly',
      color: '#fd7e14',
      description: 'Transfer to other stores',
      action: () => console.log('Navigate to Transfer')
    }
  ];

  // Dummy recent activities
  const recentActivities = [
    {
      id: 1,
      action: 'Purchase Order Approved',
      details: 'PO-NM-2024-0089',
      amount: '₹18,900',
      time: '20 minutes ago',
      icon: 'fas fa-check-circle',
      color: '#28a745'
    },
    {
      id: 2,
      action: 'Goods Receipt Entry',
      details: 'GRN-NM-2024-0067',
      amount: '₹24,500',
      time: '45 minutes ago',
      icon: 'fas fa-box-open',
      color: 'var(--page-primary-color)'
    },
    {
      id: 3,
      action: 'Transfer Completed',
      details: 'TR-NM-2024-0123',
      amount: '85 items',
      time: '1 hour ago',
      icon: 'fas fa-exchange-alt',
      color: '#17a2b8'
    },
    {
      id: 4,
      action: 'Stock Adjustment',
      details: 'Surgical Gloves - Size L',
      amount: '+150 boxes',
      time: '2 hours ago',
      icon: 'fas fa-sliders-h',
      color: '#fd7e14'
    },
    {
      id: 5,
      action: 'Purchase Order Created',
      details: 'PO-NM-2024-0090',
      amount: '₹32,400',
      time: '3 hours ago',
      icon: 'fas fa-file-invoice',
      color: '#6c757d'
    }
  ];

  // Dummy quick links
  const quickLinks = [
    { title: 'Approve Orders', icon: 'fas fa-thumbs-up', path: '#' },
    { title: 'View All Orders', icon: 'fas fa-list-ul', path: '#' },
    { title: 'All Stock Report', icon: 'fas fa-chart-bar', path: '#' },
    { title: 'Transfer Register', icon: 'fas fa-book', path: '#' },
    { title: 'Item Masters', icon: 'fas fa-cogs', path: '#' }
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
            color: 'var(--page-primary-color)',
            fontWeight: '700',
            fontSize: '1.75rem',
            marginBottom: '0.5rem'
          }}>
            <i className="fas fa-toolbox" style={{ marginRight: '0.75rem' }}></i>
            Non-Medical Store Dashboard
          </h2>
          <p style={{
            color: '#6c757d',
            fontSize: '0.95rem',
            marginBottom: 0
          }}>
            Welcome back! Manage your non-medical supplies and inventory.
          </p>
        </div>

        {/* Statistics Cards */}
        <Row className="g-3 mb-4">
          {stats.map((stat, index) => (
            <Col key={index} xs={12} sm={6} lg={3}>
              <Card style={{
                border: 'none',
                borderRadius: '12px',
                boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
                height: '100%',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease',
                animation: `slideUp 0.5s ease-out ${index * 0.1}s both`
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 8px 25px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 15px rgba(0,0,0,0.08)';
              }}>
                <Card.Body>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <p style={{
                        fontSize: '0.85rem',
                        color: '#6c757d',
                        marginBottom: '0.5rem',
                        fontWeight: '600'
                      }}>
                        {stat.title}
                      </p>
                      <h3 style={{
                        fontSize: '1.75rem',
                        fontWeight: '700',
                        color: '#2c3e50',
                        marginBottom: '0.5rem'
                      }}>
                        {stat.value}
                      </h3>
                      <span style={{
                        fontSize: '0.8rem',
                        color: stat.trendUp ? '#28a745' : '#dc3545',
                        fontWeight: '600'
                      }}>
                        <i className={`fas fa-arrow-${stat.trendUp ? 'up' : 'down'}`} style={{ marginRight: '0.25rem' }}></i>
                        {stat.trend}
                      </span>
                    </div>
                    <div style={{
                      width: '60px',
                      height: '60px',
                      borderRadius: '12px',
                      background: `linear-gradient(135deg, ${stat.color} 0%, ${stat.color}dd 100%)`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      boxShadow: `0 4px 15px ${stat.color}40`
                    }}>
                      <i className={stat.icon} style={{ fontSize: '1.5rem', color: 'white' }}></i>
                    </div>
                  </div>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>

        {/* Quick Actions Section */}
        <Row className="g-3 mb-4">
          <Col xs={12}>
            <h4 style={{
              color: 'var(--page-primary-color)',
              fontWeight: '700',
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
                  e.currentTarget.style.boxShadow = `0 8px 25px ${action.color}40`;
                  e.currentTarget.style.borderColor = action.color;
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
                    background: `linear-gradient(135deg, ${action.color} 0%, ${action.color}dd 100%)`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 1rem',
                    boxShadow: `0 4px 15px ${action.color}40`
                  }}>
                    <i className={action.icon} style={{ fontSize: '1.75rem', color: 'white' }}></i>
                  </div>
                  <h5 style={{
                    fontSize: '1.1rem',
                    fontWeight: '700',
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
        <Row className="g-3">
          {/* Recent Activities */}
          <Col xs={12} lg={8}>
            <Card style={{
              border: 'none',
              borderRadius: '12px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
              height: '100%'
            }}>
              <Card.Body>
                <h5 style={{
                  color: 'var(--page-primary-color)',
                  fontWeight: '700',
                  fontSize: '1.15rem',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <i className="fas fa-history" style={{ marginRight: '0.5rem' }}></i>
                  Recent Activities
                </h5>
                <div>
                  {recentActivities.map((activity, index) => (
                    <div
                      key={activity.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '1rem',
                        borderRadius: '8px',
                        marginBottom: index < recentActivities.length - 1 ? '0.75rem' : 0,
                        background: '#f8f9fa',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = '#e9ecef';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#f8f9fa';
                      }}
                    >
                      <div style={{
                        width: '45px',
                        height: '45px',
                        borderRadius: '10px',
                        background: `linear-gradient(135deg, ${activity.color} 0%, ${activity.color}dd 100%)`,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '1rem',
                        flexShrink: 0
                      }}>
                        <i className={activity.icon} style={{ color: 'white', fontSize: '1.1rem' }}></i>
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{
                          fontWeight: '600',
                          color: '#2c3e50',
                          marginBottom: '0.25rem',
                          fontSize: '0.95rem'
                        }}>
                          {activity.action}
                        </p>
                        <p style={{
                          fontSize: '0.85rem',
                          color: '#6c757d',
                          marginBottom: 0
                        }}>
                          {activity.details} • {activity.time}
                        </p>
                      </div>
                      <div style={{
                        fontWeight: '700',
                        color: activity.color,
                        fontSize: '0.95rem',
                        marginLeft: '1rem',
                        flexShrink: 0
                      }}>
                        {activity.amount}
                      </div>
                    </div>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>

          {/* Quick Links */}
          <Col xs={12} lg={4}>
            <Card style={{
              border: 'none',
              borderRadius: '12px',
              boxShadow: '0 4px 15px rgba(0,0,0,0.08)',
              height: '100%'
            }}>
              <Card.Body>
                <h5 style={{
                  color: 'var(--page-primary-color)',
                  fontWeight: '700',
                  fontSize: '1.15rem',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <i className="fas fa-link" style={{ marginRight: '0.5rem' }}></i>
                  Quick Links
                </h5>
                <div>
                  {quickLinks.map((link, index) => (
                    <a
                      key={index}
                      href={link.path}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        padding: '0.875rem 1rem',
                        borderRadius: '8px',
                        marginBottom: index < quickLinks.length - 1 ? '0.5rem' : 0,
                        background: '#f8f9fa',
                        textDecoration: 'none',
                        color: '#2c3e50',
                        transition: 'all 0.2s ease',
                        border: '1px solid transparent'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.background = 'var(--page-secondary-color)';
                        e.currentTarget.style.borderColor = 'var(--page-primary-color)';
                        e.currentTarget.style.transform = 'translateX(5px)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.background = '#f8f9fa';
                        e.currentTarget.style.borderColor = 'transparent';
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      <div style={{
                        width: '35px',
                        height: '35px',
                        borderRadius: '8px',
                        background: 'linear-gradient(135deg, var(--page-primary-color) 0%, #764ba2 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginRight: '0.875rem'
                      }}>
                        <i className={link.icon} style={{ color: 'white', fontSize: '0.9rem' }}></i>
                      </div>
                      <span style={{ fontWeight: '600', fontSize: '0.9rem' }}>
                        {link.title}
                      </span>
                    </a>
                  ))}
                </div>
              </Card.Body>
            </Card>
          </Col>
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

export default NonMedicalStoreDashboardHome;
