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
    { title: 'Create User', path: '/system-admin/records/create-user', icon: FaUsersIcon, color: '#667eea' },
    { title: 'Add Consultant', path: '/system-admin/records/consultant/add', icon: FaUserMdIcon, color: '#f5576c' }
  ];

  const recentActivities = [
    { user: 'Admin', action: 'Created new user: Dr. Smith', time: '10 mins ago', type: 'success' },
    { user: 'Admin', action: 'Updated Department: Cardiology', time: '25 mins ago', type: 'info' },
    { user: 'Admin', action: 'Added new ward: ICU-3', time: '1 hour ago', type: 'success' },
    { user: 'System', action: 'Database backup completed', time: '2 hours ago', type: 'success' },
    { user: 'Admin', action: 'Modified user permissions', time: '3 hours ago', type: 'warning' }
  ];

  const systemAlerts = [
    { text: '5 user accounts pending activation', type: 'warning', priority: 'medium' },
    { text: 'System backup scheduled for tonight', type: 'info', priority: 'low' },
    { text: '2 inactive consultants for 30+ days', type: 'warning', priority: 'medium' }
  ];

  return (
    <Container fluid className="p-4">
      {/* Header */}
      <div className="content-header mb-4">
        <h2 className="mb-1">System Administration Dashboard</h2>
        <p className="text-muted mb-0">
          <FaClockIcon className="me-2" />
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Statistics Cards */}
      

      {/* Quick Actions */}
      <Row className="mb-4">
        <Col xs={12}>
          <Card className="border-0 shadow-sm">
            <Card.Body className="p-4">
              <h5 className="mb-3">
                <FaTasksIcon className="me-2" />
                Quick Actions
              </h5>
              <Row className="g-3">
                {quickActions.map((action, index) => (
                  <Col xs={6} md={3} key={index}>
                    <Button 
                      variant="light" 
                      className="w-100 py-3 border-0 shadow-sm"
                      style={{ 
                        backgroundColor: '#fff',
                        transition: 'all 0.2s',
                        cursor: 'pointer'
                      }}
                      onMouseOver={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
                      }}
                      onMouseOut={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = '0 1px 2px rgba(0,0,0,0.075)';
                      }}
                      onClick={() => navigate(action.path)}
                    >
                      <action.icon size={32} color={action.color} className="mb-2" />
                      <div className="fw-semibold" style={{ color: '#212529', fontSize: '0.9rem' }}>
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

      

      {/* Recent Activities */}
      
    </Container>
  );
};

export default SystemAdminDashboard;
