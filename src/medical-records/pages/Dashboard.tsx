import React from 'react';
import { Container, Row, Col, Card } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { routerPathNames } from '../../routes/routerPathNames';

interface DashboardProps {
  moduleName?: string;
}

const MedicalRecordsDashboard: React.FC<DashboardProps> = ({ moduleName = "Medical Records" }) => {
  // Dummy recent activities
  const recentActivities = [
    { time: '10:45 AM', activity: 'New OP patient registered - Rajesh Kumar (OP-2024-001234)' },
    { time: '10:30 AM', activity: 'IP admission completed - Priya Singh (IP-2024-000456)' },
    { time: '10:15 AM', activity: 'Discharge summary completed - Amit Patel (IP-2024-000455)' },
    { time: '10:00 AM', activity: 'Room transfer - Sunita Devi (IP-2024-000452) - ICU to General Ward' },
    { time: '09:45 AM', activity: 'New OP patient registered - Mohammed Ali (OP-2024-001233)' }
  ];

  return (
    <div className="content-body">
      <Container fluid>
        {/* Page Header */}
        <Row className="mb-4">
          <Col>
          <br />
            <h2 style={{ color: 'var(--page-secondary-color)', fontWeight: '700', marginBottom: '0.5rem' }}>
              Medical Records Dashboard
            </h2>
            <p style={{ color: '#6c757d', fontSize: '1rem' }}>
              Manage patient registrations, records, and medical information
            </p>
          </Col>
        </Row>

        {/* Statistics Cards */}
        

        {/* Quick Actions */}
        <Row className="mb-4">
          <Col>
            <h5 style={{ color: 'var(--page-secondary-color)', fontWeight: 'var(--font-weight-semibold)', marginBottom: '1rem' }}>
              Quick Actions
            </h5>
          </Col>
        </Row>

        <Row className="mb-4">
          {/* Patient Registration Card */}
          <Col lg={4} md={6} className="mb-3">
            <Link to={routerPathNames.medicalRecords.registration.patient} className="text-decoration-none">
              <Card 
                className="shadow-sm border-0 h-100" 
                style={{ 
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }}
              >
                <div style={{ 
                  background: 'var(--page-primary-color)', 
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className="fas fa-user-plus" style={{ fontSize: '2.5rem', color: 'var(--page-secondary-color)' }}></i>
                </div>
                <Card.Body>
                  <h5 style={{ color: 'var(--page-secondary-color)', fontWeight: 'var(--font-weight-semibold)' }}>
                    Patient Registration
                  </h5>
                  <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                    Register new OP patients or update existing patient records with complete demographics
                  </p>
                </Card.Body>
              </Card>
            </Link>
          </Col>

          {/* In-Patient Registration Card */}
          <Col lg={4} md={6} className="mb-3">
            <Link to={routerPathNames.medicalRecords.registration.inpatient} className="text-decoration-none">
              <Card 
                className="shadow-sm border-0 h-100" 
                style={{ 
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }}
              >
                <div style={{ 
                  background: '#e74c3c', 
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className="fas fa-bed" style={{ fontSize: '2.5rem', color: '#fff' }}></i>
                </div>
                <Card.Body>
                  <h5 style={{ color: '#e74c3c', fontWeight: 'var(--font-weight-semibold)' }}>
                    In-Patient Registration
                  </h5>
                  <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                    Admit new IP patients, assign beds, and manage inpatient ward allocations
                  </p>
                </Card.Body>
              </Card>
            </Link>
          </Col>

          {/* Refile Card */}
          <Col lg={4} md={6} className="mb-3">
            <Link to={routerPathNames.medicalRecords.activities.refileOpCards} className="text-decoration-none">
              <Card 
                className="shadow-sm border-0 h-100" 
                style={{ 
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = '0 8px 16px rgba(0,0,0,0.15)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
                }}
              >
                <div style={{ 
                  background: '#3498db', 
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className="fas fa-file-alt" style={{ fontSize: '2.5rem', color: '#fff' }}></i>
                </div>
                <Card.Body>
                  <h5 style={{ color: '#3498db', fontWeight: 'var(--font-weight-semibold)' }}>
                    Refile Card
                  </h5>
                  <p className="text-muted mb-0" style={{ fontSize: '0.9rem' }}>
                    Refile patient cards and manage medical record filing activities
                  </p>
                </Card.Body>
              </Card>
            </Link>
          </Col>
        </Row>

        {/* Recent Activities */}
        
      </Container>
    </div>
  );
};

export default MedicalRecordsDashboard;
