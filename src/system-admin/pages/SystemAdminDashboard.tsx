import React from 'react';
import { Container, Row, Col, Card, Button, Table, Badge, ProgressBar } from 'react-bootstrap';
import { 
  FaUsersCog, 
  FaHospital, 
  FaStore, 
  FaDesktop,
  FaUsers,
  FaUserMd,
  FaBed,
  FaTasks,
  FaChartLine,
  FaClock,
  FaCheckCircle,
  FaExclamationTriangle,
  FaServer,
  FaDatabase,
  FaShieldAlt,
  FaCog
} from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';

// Type casting to fix TypeScript issues with react-icons
const FaUsersIcon = FaUsers as any;
const FaUserMdIcon = FaUserMd as any;
const FaBedIcon = FaBed as any;
const FaStoreIcon = FaStore as any;
const FaUsersCogIcon = FaUsersCog as any;
const FaHospitalIcon = FaHospital as any;
const FaDesktopIcon = FaDesktop as any;
const FaTasksIcon = FaTasks as any;
const FaChartLineIcon = FaChartLine as any;
const FaClockIcon = FaClock as any;
const FaCheckCircleIcon = FaCheckCircle as any;
const FaExclamationTriangleIcon = FaExclamationTriangle as any;
const FaServerIcon = FaServer as any;
const FaDatabaseIcon = FaDatabase as any;
const FaShieldAltIcon = FaShieldAlt as any;
const FaCogIcon = FaCog as any;

const SystemAdminDashboard: React.FC = () => {
  const navigate = useNavigate();

  // Mock data - will be replaced with API calls
  const systemStats = {
    totalUsers: 145,
    activeDepartments: 28,
    totalWards: 12,
    activeStores: 8
  };

  const systemHealth = {
    serverStatus: 'healthy',
    databaseSize: '2.4 GB',
    lastBackup: '2 hours ago',
    systemUptime: '99.8%'
  };

  const quickActions = [
    {
      title: 'Create User',
      path: '/system-admin/records/create-user',
      icon: FaUsersIcon,
      color: 'var(--btn-primary)',
      iconBg: 'var(--primary-color-light)',
      cardBg: 'var(--bg-white)',
      description: 'Create and configure system users',
      count: 'User Setup'
    },
    {
      title: 'Add Consultant',
      path: '/system-admin/records/consultant/add',
      icon: FaUserMdIcon,
      color: 'var(--btn-success)',
      iconBg: 'var(--secondary-color)',
      cardBg: 'var(--bg-white)',
      description: 'Register consultant profiles',
      count: 'Consultant'
    }
  ];


  return (
    <div className="system-admin-dashboard" style={{
      height: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>
      <div className="content-body selection-area-login-theme" style={{
        flex: 1,
        overflow: 'auto',
        width: '100%',
        background: 'linear-gradient(180deg, var(--sa-surface-light) 75%, var(--sa-surface-warm) 100%)',
        minHeight: '100%'
      }}>
      <Container fluid className="p-4">
        {/* Header */}
        <div className="content-header mb-4">
          <h2 className="mb-1" style={{ color: 'var(--page-secondary-color)' }}>System Administration Dashboard</h2>
          <p className="mb-0" style={{ color: 'var(--text-muted)' }}>
            <FaClockIcon className="me-2" />
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>

      {/* Statistics Cards */}
      

      {/* Quick Actions */}
      <Row className="mb-4 p-1 pb-0">
        <Col xs={12}>
          <Card className="border-0" style={{ background: 'var(--bg-white)', boxShadow: 'var(--shadow-sm)' }}>
            <Card.Body className="p-4">
              <h5 className="mb-3" style={{ color: 'var(--page-secondary-color)', fontWeight: 'var(--font-weight-semibold)' }}>
                <FaTasksIcon className="me-2" color="var(--btn-primary)" />
                Quick Actions
              </h5>
              <Row className="g-3">
                {quickActions.map((action, index) => (
                  <Col xs={12} sm={6} md={6} key={index}>
                    <Button 
                      variant="light" 
                      className="w-100 py-3 border-0"
                      style={{ 
                        background: action.cardBg,
                        borderRadius: 'calc(var(--border-radius-sm) * 4)',
                        boxShadow: 'var(--shadow-sm)',
                        borderTop: `3px solid ${action.color}`,
                        transition: 'var(--transition-normal)',
                        cursor: 'pointer',
                        minHeight: '118px',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'center',
                        alignItems: 'stretch'
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
                      <div className="d-flex align-items-center justify-content-between mb-2">
                        <div className="d-flex align-items-center">
                          <div
                            className="me-3"
                            style={{
                              width: '46px',
                              height: '46px',
                              borderRadius: 'calc(var(--border-radius-sm) * 2)',
                              background: action.iconBg,
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center'
                            }}
                          >
                            <action.icon size={24} color={action.color} />
                          </div>
                          <div className="text-start">
                            <div style={{ color: 'var(--page-secondary-color)', fontWeight: 'var(--font-weight-semibold)' }}>
                              {action.title}
                            </div>
                            <div style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}>
                              {action.description}
                            </div>
                          </div>
                        </div>
                        <span
                          className="px-2 py-1"
                          style={{
                            background: action.iconBg,
                            color: action.color,
                            borderRadius: 'calc(var(--border-radius-sm) * 2)',
                            fontSize: 'var(--font-size-xs)',
                            fontWeight: 'var(--font-weight-semibold)'
                          }}
                        >
                          {action.count}
                        </span>
                      </div>
                    </Button>
                  </Col>
                ))}
              </Row>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      

      {/* Recent Activities */}
      
      </Container>
      </div>
    </div>
  );
};

export default SystemAdminDashboard;
