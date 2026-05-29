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
    <div
      className="content-body selection-area-login-theme"
      style={{
        background: 'linear-gradient(180deg, var(--sa-surface-light) 75%, var(--sa-surface-warm) 100%)',
        minHeight: '100%'
      }}
    >
      <Container fluid>
        {/* Page Header */}
        <Row className="mb-4">
          <Col>
          <br />
            <h2 style={{ color: 'var(--sa-dark)', fontWeight: 'var(--font-weight-bold)', marginBottom: '0.5rem' }}>
              Medical Records Dashboard
            </h2>
            <p style={{ color: 'var(--sa-muted)', fontSize: 'var(--font-size-base)' }}>
              Manage patient registrations, records, and medical information
            </p>
          </Col>
        </Row>

        {/* Statistics Cards */}
        

        {/* Quick Actions */}
        <Row className="mb-4">
          <Col>
            <h5 style={{ color: 'var(--primary-color)', fontWeight: 'var(--font-weight-semibold)', marginBottom: '1rem' }}>
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
                  background: 'var(--sa-white)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
              >
                <div style={{ 
                  background: 'var(--gradient-primary)', 
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className="fas fa-user-plus" style={{ fontSize: '2.5rem', color: 'var(--sa-white)' }}></i>
                </div>
                <Card.Body>
                  <h5 style={{ color: 'var(--page-secondary-color)', fontWeight: 'var(--font-weight-semibold)' }}>
                    Patient Registration
                  </h5>
                  <p className="mb-0" style={{ color: 'var(--sa-muted)', fontSize: 'var(--font-size-sm)' }}>
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
                  background: 'var(--sa-white)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
              >
                <div style={{ 
                  background: 'var(--btn-success)', 
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className="fas fa-bed" style={{ fontSize: '2.5rem', color: 'var(--sa-white)' }}></i>
                </div>
                <Card.Body>
                  <h5 style={{ color: 'var(--btn-success)', fontWeight: 'var(--font-weight-semibold)' }}>
                    In-Patient Registration
                  </h5>
                  <p className="mb-0" style={{ color: 'var(--sa-muted)', fontSize: 'var(--font-size-sm)' }}>
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
                  background: 'var(--sa-white)',
                  cursor: 'pointer',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  overflow: 'hidden'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-5px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
              >
                <div style={{ 
                  background: 'var(--color-info)', 
                  padding: '1rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <i className="fas fa-file-alt" style={{ fontSize: '2.5rem', color: 'var(--sa-white)' }}></i>
                </div>
                <Card.Body>
                  <h5 style={{ color: 'var(--color-info)', fontWeight: 'var(--font-weight-semibold)' }}>
                    Refile Card
                  </h5>
                  <p className="mb-0" style={{ color: 'var(--sa-muted)', fontSize: 'var(--font-size-sm)' }}>
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
