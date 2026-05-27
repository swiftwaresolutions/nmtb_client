import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

interface DashboardProps {
  moduleName?: string;
}

const RadiologyDashboard: React.FC<DashboardProps> = ({ moduleName = "Radiology" }) => {
  return (
    <div>
      {/* Content Body */}
      <div className="content-body">
        <Container fluid>
          <Row>
            <Col lg={12}>
              <div className="card shadow-sm" style={{ padding: '2rem', background: '#fff', borderRadius: '8px' }}>
                <h3 style={{ color: '#2d465e', marginBottom: '1rem' }}>Welcome to Radiology Module</h3>
                <p style={{ color: '#6c757d', fontSize: '1.1rem' }}>
                  Select a menu item from the left sidebar to get started.
                </p>

                {/* Quick Stats or Info Cards */}
                <Row className="mt-4">
                  <Col md={4} className="mb-3">
                    <div style={{ 
                      padding: '1.5rem', 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: '8px',
                      color: '#fff'
                    }}>
                      <h4>Investigation Orders</h4>
                      <p className="mb-0">Create and manage radiology investigation orders</p>
                    </div>
                  </Col>
                  <Col md={4} className="mb-3">
                    <div style={{ 
                      padding: '1.5rem', 
                      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                      borderRadius: '8px',
                      color: '#fff'
                    }}>
                      <h4>Scan Entry</h4>
                      <p className="mb-0">Enter scan results and generate reports</p>
                    </div>
                  </Col>
                  <Col md={4} className="mb-3">
                    <div style={{ 
                      padding: '1.5rem', 
                      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                      borderRadius: '8px',
                      color: '#fff'
                    }}>
                      <h4>Reports & Registers</h4>
                      <p className="mb-0">View investigation registers and reports</p>
                    </div>
                  </Col>
                </Row>

                <Row className="mt-2">
                  <Col md={4} className="mb-3">
                    <div style={{ 
                      padding: '1.5rem', 
                      background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                      borderRadius: '8px',
                      color: '#fff'
                    }}>
                      <h4>Purchase Orders</h4>
                      <p className="mb-0">Manage purchase orders and approvals</p>
                    </div>
                  </Col>
                  <Col md={4} className="mb-3">
                    <div style={{ 
                      padding: '1.5rem', 
                      background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                      borderRadius: '8px',
                      color: '#fff'
                    }}>
                      <h4>Stock Management</h4>
                      <p className="mb-0">Track inventory and stock levels</p>
                    </div>
                  </Col>
                  <Col md={4} className="mb-3">
                    <div style={{ 
                      padding: '1.5rem', 
                      background: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
                      borderRadius: '8px',
                      color: '#fff'
                    }}>
                      <h4>Setup & Masters</h4>
                      <p className="mb-0">Configure procedures, groups, and suppliers</p>
                    </div>
                  </Col>
                </Row>
              </div>
            </Col>
          </Row>
        </Container>
      </div>
    </div>
  );
};

export default RadiologyDashboard;
