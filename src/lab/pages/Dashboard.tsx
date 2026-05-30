import React from 'react';
import { Card, Row, Col } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFileInvoiceDollar, 
  faTasks, 
  faDatabase, 
  faChartBar,
  faVial
} from '@fortawesome/free-solid-svg-icons';
import PageHeader from '../../components/PageHeader';

const Dashboard: React.FC = () => {
  const overviewCards = [
    {
      title: 'Billing',
      icon: faFileInvoiceDollar,
      color: 'var(--btn-primary)',
      iconBg: 'var(--primary-color-light)',
      cardBg: 'var(--bg-white)',
      description: 'Lab billing and ward requests',
      count: '2 Functions'
    },
    {
      title: 'Activities',
      icon: faTasks,
      color: 'var(--btn-success)',
      iconBg: 'var(--secondary-color)',
      cardBg: 'var(--bg-white)',
      description: 'Specimen receipt, results, verification',
      count: '6 Functions'
    },
    {
      title: 'Masters',
      icon: faDatabase,
      color: 'var(--color-info)',
      iconBg: 'var(--sidebar-bg-start)',
      cardBg: 'var(--bg-white)',
      description: 'Department, test, specimen management',
      count: '3 Categories'
    },
    {
      title: 'Reports',
      icon: faChartBar,
      color: 'var(--color-warning)',
      iconBg: 'var(--header-bg)',
      cardBg: 'var(--bg-white)',
      description: 'Test reports and collections',
      count: '7 Reports'
    }
  ];

  return (
    <div className="laboratory-dashboard" style={{
      height: '100%',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden'
    }}>

      {/* Header */}
      <PageHeader icon={faVial} title="Laboratory Dashboard" subtitle="Manage laboratory operations, test results, and reports" /> 

      {/* Content Body */}
      <div className="content-body selection-area-login-theme" style={{
        flex: 1,
        overflow: 'auto',
        width: '100%',
        background: 'linear-gradient(180deg, var(--sa-surface-light) 75%, var(--sa-surface-warm) 100%)',
        minHeight: '100%'
      }}>
        {/* Overview Cards */}
        <Row className="mb-4 p-3 pb-0">
          {overviewCards.map((card, index) => (
            <Col key={index} xs={12} sm={6} lg={3} className="mb-3">
              <Card
                className="h-100"
                style={{
                  background: card.cardBg,
                  boxShadow: 'var(--shadow-sm)',
                  border: '1px solid var(--border-color)',
                  borderRadius: 'calc(var(--border-radius-sm) * 4)',
                  borderTop: `3px solid ${card.color}`,
                  overflow: 'hidden',
                  transition: 'var(--transition-normal)'
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.transform = 'translateY(-2px)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'var(--shadow-sm)';
                }}
              >
                <Card.Body>
                  <div className="d-flex align-items-center justify-content-between mb-3">
                    <div className="d-flex align-items-center">
                    <div
                      className="icon-wrapper me-3"
                      style={{
                        backgroundColor: card.iconBg,
                        color: card.color,
                        width: '50px',
                        height: '50px',
                        borderRadius: 'calc(var(--border-radius-sm) * 2)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <FontAwesomeIcon icon={card.icon} size="lg" />
                    </div>
                    <div>
                      <h5 className="mb-0" style={{ color: 'var(--page-secondary-color)' }}>{card.title}</h5>
                      <small className="text-muted">{card.count}</small>
                    </div>
                  </div>
                    <span
                      className="px-2 py-1"
                      style={{
                        background: card.iconBg,
                        color: card.color,
                        borderRadius: 'calc(var(--border-radius-sm) * 2)',
                        fontSize: 'var(--font-size-xs)',
                        fontWeight: 'var(--font-weight-semibold)'
                      }}
                    >
                      {card.count}
                    </span>
                  </div>
                  <p className="mb-0 small" style={{ color: 'var(--text-muted)' }}>{card.description}</p>
                </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </div>
  );
};

export default Dashboard;
