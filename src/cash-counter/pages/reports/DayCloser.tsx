import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Button, Table, Alert } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { RootState } from '../../../state/store';
import PageHeader from '../../../components/PageHeader';
import { faDoorClosed } from '@fortawesome/free-solid-svg-icons';
import { showErrorToast, showSuccessToast, showConfirmDialog } from '../../../utils/alertUtil';

const DayCloser: React.FC = () => {
  const loginData = useSelector((state: RootState) => state.loginData);
  const [loading, setLoading] = useState(false);
  const [dayClosureData, setDayClosureData] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleLoadDayData = async () => {
    try {
      setLoading(true);
      // TODO: Implement API call to fetch day closure data
      // const response = await cashCounterApiService.getDayClosureData(formData);
      // setDayClosureData(response);
      showSuccessToast('Day data loaded successfully');
    } catch (error) {
      console.error('Error loading day data:', error);
      showErrorToast('Failed to load day data');
    } finally {
      setLoading(false);
    }
  };

  const handleClosureDay = async () => {
    const result = await showConfirmDialog(
      'Are you sure you want to close this day? This action cannot be undone.',
      'Confirm Day Closure',
      'Yes, Close Day',
      'Cancel'
    );

    if (result.isConfirmed) {
      try {
        setLoading(true);
        // TODO: Implement API call to close the day
        // await cashCounterApiService.closureDay(formData);
        showSuccessToast('Day closed successfully');
        setDayClosureData(null);
      } catch (error) {
        console.error('Error closing day:', error);
        showErrorToast('Failed to close day');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      <PageHeader
        icon={faDoorClosed}
        title="Day Closer"
        subtitle="Close daily operations and finalize transactions"
      />
      
      <div className="content-body" style={{ flex: 1, overflow: 'auto', padding: '1.5rem' }}>
        <Card className="shadow-sm mb-4">
          <Card.Header className="bg-primary text-white">
            <h5 className="mb-0">Day Closure</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={6}>
                <Form.Group className="mb-3">
                  <Form.Label>Select Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="date"
                    value={formData.date}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={6} className="d-flex align-items-end">
                <Button 
                  variant="primary" 
                  className="w-100 mb-3"
                  onClick={handleLoadDayData}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Load Day Data'}
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        {dayClosureData && (
          <>
            <Card className="shadow-sm mb-4">
              <Card.Header className="bg-light">
                <h5 className="mb-0">Day Summary</h5>
              </Card.Header>
              <Card.Body>
                <Row>
                  <Col md={4}>
                    <div className="p-3 border rounded bg-light mb-3">
                      <h6 className="text-muted">Total Bills</h6>
                      <h3>{dayClosureData?.totalBills || 0}</h3>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="p-3 border rounded bg-light mb-3">
                      <h6 className="text-muted">Total Collection</h6>
                      <h3 className="text-success">₹{dayClosureData?.totalCollection || 0}</h3>
                    </div>
                  </Col>
                  <Col md={4}>
                    <div className="p-3 border rounded bg-light mb-3">
                      <h6 className="text-muted">Total Refunds</h6>
                      <h3 className="text-danger">₹{dayClosureData?.totalRefunds || 0}</h3>
                    </div>
                  </Col>
                </Row>

                <Table striped bordered hover className="mt-3">
                  <thead>
                    <tr>
                      <th>Payment Mode</th>
                      <th className="text-end">Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>Cash</td>
                      <td className="text-end">₹{dayClosureData?.cash || 0}</td>
                    </tr>
                    <tr>
                      <td>Card</td>
                      <td className="text-end">₹{dayClosureData?.card || 0}</td>
                    </tr>
                    <tr>
                      <td>UPI</td>
                      <td className="text-end">₹{dayClosureData?.upi || 0}</td>
                    </tr>
                    <tr className="fw-bold">
                      <td>Net Collection</td>
                      <td className="text-end text-success">₹{dayClosureData?.netCollection || 0}</td>
                    </tr>
                  </tbody>
                </Table>
              </Card.Body>
            </Card>

            <Alert variant="warning">
              <i className="fas fa-exclamation-triangle me-2"></i>
              <strong>Important:</strong> Once you close the day, no modifications can be made to today's transactions. Please ensure all entries are correct.
            </Alert>

            <div className="d-flex justify-content-center">
              <Button
                variant="danger"
                size="lg"
                onClick={handleClosureDay}
                disabled={loading}
              >
                <i className="fas fa-door-closed me-2"></i>
                Close Day
              </Button>
            </div>
          </>
        )}

        {!dayClosureData && (
          <Card className="shadow-sm">
            <Card.Body>
              <div className="text-center text-muted py-5">
                <i className="fas fa-calendar-day fa-3x mb-3"></i>
                <p>Please select a date and load day data to proceed with closure.</p>
              </div>
            </Card.Body>
          </Card>
        )}
      </div>
    </div>
  );
};

export default DayCloser;
