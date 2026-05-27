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
      color: '#3498db',
      description: 'Lab billing and ward requests',
      count: '2 Functions'
    },
    {
      title: 'Activities',
      icon: faTasks,
      color: '#e67e22',
      description: 'Specimen receipt, results, verification',
      count: '6 Functions'
    },
    {
      title: 'Masters',
      icon: faDatabase,
      color: '#9b59b6',
      description: 'Department, test, specimen management',
      count: '3 Categories'
    },
    {
      title: 'Reports',
      icon: faChartBar,
      color: '#27ae60',
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
      <div className="content-body" style={{
        flex: 1,
        overflow: 'auto',
        width: '100%',
      }}>
        {/* Overview Cards */}
        <Row className="mb-4">
          {overviewCards.map((card, index) => (
            <Col key={index} xs={12} sm={6} lg={3} className="mb-3">
              <Card className="h-100 shadow-sm border-0 hover-card">
                <Card.Body>
                  <div className="d-flex align-items-center mb-3">
                    <div
                      className="icon-wrapper me-3"
                      style={{
                        backgroundColor: `${card.color}20`,
                        color: card.color,
                        width: '50px',
                        height: '50px',
                        borderRadius: '8px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                      }}
                    >
                      <FontAwesomeIcon icon={card.icon} size="lg" />
                    </div>
                    <div>
                      <h5 className="mb-0">{card.title}</h5>
                      <small className="text-muted">{card.count}</small>
                    </div>
                  </div>
                  <p className="text-muted mb-0 small">{card.description}</p>
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
