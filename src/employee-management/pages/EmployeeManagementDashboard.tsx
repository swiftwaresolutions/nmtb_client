import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { routerPathNames } from '../../routes/routerPathNames';

const EmployeeManagementDashboard: React.FC = () => {
  const navigate = useNavigate();

  const dashboardCards = [
    {
      title: 'Recruitment',
      icon: 'fa-user-plus',
      description: 'Manage employee recruitment, training, probation, and confirmation',
      gradient: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      path: routerPathNames.employeeManagement.addEmployee
    },
    {
      title: 'Promotion',
      icon: 'fa-level-up-alt',
      description: 'Setup levels and manage employee promotions',
      gradient: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
      path: routerPathNames.employeeManagement.setupLevel
    },
    {
      title: 'Cessation Info',
      icon: 'fa-user-times',
      description: 'Manage employee cessation, resignation, and VRS',
      gradient: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
      path: routerPathNames.employeeManagement.cessation
    },
    {
      title: 'Retirement',
      icon: 'fa-user-clock',
      description: 'View retirement list and confirmations',
      gradient: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
      path: routerPathNames.employeeManagement.retirementList
    },
    {
      title: 'Reports',
      icon: 'fa-chart-bar',
      description: 'Comprehensive reports on employees, leaves, promotions, and more',
      gradient: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
      path: routerPathNames.employeeManagement.reportEmployeeAllDepartment
    },
    {
      title: 'Master',
      icon: 'fa-database',
      description: 'Manage master data: categories, departments, positions, salary heads',
      gradient: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
      path: routerPathNames.employeeManagement.masterCategoryAdd
    },
    {
      title: 'Edit Details',
      icon: 'fa-user-edit',
      description: 'Edit employee details and category-wise information',
      gradient: 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)',
      path: routerPathNames.employeeManagement.editEmployeeDetails
    },
    {
      title: 'Exit',
      icon: 'fa-sign-out-alt',
      description: 'Return to selection area or logout',
      gradient: 'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)',
      path: routerPathNames.employeeManagement.exitSelectionArea
    }
  ];

  return (
    <Container fluid className="p-4">
      <Row className="mb-4">
        <Col>
          <h2 className="module-title">
            <i className="fas fa-users me-2"></i>
            Employee Management Dashboard
          </h2>
          <p className="text-muted">HRMS - Human Resource Management System</p>
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

export default EmployeeManagementDashboard;
