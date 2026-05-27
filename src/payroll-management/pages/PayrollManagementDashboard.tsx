import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { routerPathNames } from '../../routes/routerPathNames';

const PayrollManagementDashboard: React.FC = () => {
  const navigate = useNavigate();

  const dashboardCards = [
    {
      title: 'Leave',
      icon: 'fa-calendar-alt',
      description: 'Manage employee leave, weekoff, applications, approvals, and duty roster',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      path: routerPathNames.payrollManagement.leaveEmployeeLeaveAssign
    },
    {
      title: 'Attendance',
      icon: 'fa-user-check',
      description: 'Attendance entry, late coming, permission entry and cancellations',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      path: routerPathNames.payrollManagement.attendanceAttendanceEntry
    },
    {
      title: 'Salary Register',
      icon: 'fa-book',
      description: 'Open, close, view salary registers and manage loan recovery',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      path: routerPathNames.payrollManagement.salaryRegisterOpen
    },
    {
      title: 'Setup',
      icon: 'fa-cogs',
      description: 'Configure salary structure, employee salary, increments and DA',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      path: routerPathNames.payrollManagement.setupSalaryStructureCreate
    },
    {
      title: 'Master',
      icon: 'fa-database',
      description: 'Master data for leave, compensatory days, dates and loan recovery',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      path: routerPathNames.payrollManagement.masterLeaveAdd
    },
    {
      title: 'Reports',
      icon: 'fa-chart-bar',
      description: 'Comprehensive reports on salary, leave, attendance, duty charts and slips',
      gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
      path: routerPathNames.payrollManagement.reportSalaryRegisterAllEmployee
    },
    {
      title: 'Exit',
      icon: 'fa-sign-out-alt',
      description: 'Return to selection area or logout',
      gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      path: routerPathNames.payrollManagement.exitSelectionArea
    }
  ];

  return (
    <Container fluid className="p-4">
      <Row className="mb-4">
        <Col>
          <h2 className="module-title">
            <i className="fas fa-money-check-alt me-2"></i>
            Payroll Management Dashboard
          </h2>
          <p className="text-muted">Payroll, Leave & Attendance Management System</p>
        </Col>
      </Row>

      <Row className="g-4">
        {dashboardCards.map((card, index) => (
          <Col key={index} xs={12} sm={6} md={4} lg={3}>
            <Card 
              className="dashboard-card h-100"
              style={{ 
                background: card.gradient,
                cursor: 'pointer',
                border: 'none',
                color: 'white',
                transition: 'transform 0.3s ease, box-shadow 0.3s ease'
              }}
              onClick={() => navigate(card.path)}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-5px)';
                e.currentTarget.style.boxShadow = '0 10px 25px rgba(0,0,0,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 4px 6px rgba(0,0,0,0.1)';
              }}
            >
              <Card.Body className="d-flex flex-column">
                <div className="text-center mb-3">
                  <i className={`fas ${card.icon} fa-3x`} style={{ opacity: 0.9 }}></i>
                </div>
                <Card.Title className="text-center mb-2" style={{ fontSize: '1.25rem', fontWeight: 600 }}>
                  {card.title}
                </Card.Title>
                <Card.Text className="text-center" style={{ fontSize: '0.9rem', opacity: 0.95 }}>
                  {card.description}
                </Card.Text>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
    </Container>
  );
};

export default PayrollManagementDashboard;
