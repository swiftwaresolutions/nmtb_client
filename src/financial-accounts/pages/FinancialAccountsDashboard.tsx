import React from 'react';
import { Container, Row, Col } from 'react-bootstrap';

const FinancialAccountsDashboard: React.FC = () => {
  return (
    <div>
      <div className="content-body">
        <Container fluid>
          <Row>
            <Col lg={12}>
              <div className="card shadow-sm" style={{ padding: '2rem', background: '#fff', borderRadius: '8px' }}>
                <h3 style={{ color: '#2d465e', marginBottom: '1rem' }}>Welcome to Financial Accounts Module</h3>
                <p style={{ color: '#6c757d', fontSize: '1.1rem' }}>
                  Select a menu item from the left sidebar to manage your financial transactions, accounts, and reports.
                </p>

                {/* Quick Stats Cards */}
                <Row className="mt-4">
                  <Col md={3} className="mb-3">
                    <div style={{ 
                      padding: '1.5rem', 
                      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                      borderRadius: '8px',
                      color: '#fff'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <i className="fas fa-exchange-alt" style={{ fontSize: '2rem', marginRight: '1rem' }}></i>
                        <h4 style={{ margin: 0 }}>Transactions</h4>
                      </div>
                      <p className="mb-0" style={{ fontSize: '0.9rem', opacity: 0.9 }}>Manage all financial transactions</p>
                    </div>
                  </Col>
                  <Col md={3} className="mb-3">
                    <div style={{ 
                      padding: '1.5rem', 
                      background: 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)',
                      borderRadius: '8px',
                      color: '#fff'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <i className="fas fa-tasks" style={{ fontSize: '2rem', marginRight: '1rem' }}></i>
                        <h4 style={{ margin: 0 }}>Activities</h4>
                      </div>
                      <p className="mb-0" style={{ fontSize: '0.9rem', opacity: 0.9 }}>Reconciliation, requests & vouchers</p>
                    </div>
                  </Col>
                  <Col md={3} className="mb-3">
                    <div style={{ 
                      padding: '1.5rem', 
                      background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)',
                      borderRadius: '8px',
                      color: '#fff'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <i className="fas fa-book" style={{ fontSize: '2rem', marginRight: '1rem' }}></i>
                        <h4 style={{ margin: 0 }}>Books</h4>
                      </div>
                      <p className="mb-0" style={{ fontSize: '0.9rem', opacity: 0.9 }}>Day Book, Cash Book & Ledgers</p>
                    </div>
                  </Col>
                  <Col md={3} className="mb-3">
                    <div style={{ 
                      padding: '1.5rem', 
                      background: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)',
                      borderRadius: '8px',
                      color: '#fff'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <i className="fas fa-file-contract" style={{ fontSize: '2rem', marginRight: '1rem' }}></i>
                        <h4 style={{ margin: 0 }}>Final Accounts</h4>
                      </div>
                      <p className="mb-0" style={{ fontSize: '0.9rem', opacity: 0.9 }}>Generate financial statements</p>
                    </div>
                  </Col>
                </Row>

                {/* Additional Info */}
                <Row className="mt-4">
                  <Col md={6} className="mb-3">
                    <div style={{ 
                      padding: '1.5rem', 
                      background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
                      borderRadius: '8px',
                      color: '#fff'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <i className="fas fa-book-open" style={{ fontSize: '2rem', marginRight: '1rem' }}></i>
                        <h4 style={{ margin: 0 }}>Ledger</h4>
                      </div>
                      <p className="mb-0" style={{ fontSize: '0.9rem', opacity: 0.9 }}>View account ledgers between dates</p>
                    </div>
                  </Col>
                  <Col md={6} className="mb-3">
                    <div style={{ 
                      padding: '1.5rem', 
                      background: 'linear-gradient(135deg, #30cfd0 0%, #330867 100%)',
                      borderRadius: '8px',
                      color: '#fff'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '0.5rem' }}>
                        <i className="fas fa-cog" style={{ fontSize: '2rem', marginRight: '1rem' }}></i>
                        <h4 style={{ margin: 0 }}>Setup</h4>
                      </div>
                      <p className="mb-0" style={{ fontSize: '0.9rem', opacity: 0.9 }}>Configure account heads & settings</p>
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

export default FinancialAccountsDashboard;
