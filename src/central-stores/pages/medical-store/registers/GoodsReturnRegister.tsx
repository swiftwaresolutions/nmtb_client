import React, { useState } from 'react';
import { Form, Button, Row, Col, Card, Table, Tabs, Tab, Spinner, Modal } from 'react-bootstrap';
import { showErrorToast } from '../../../../utils/alertUtil';
import CentralStoresApiService, { GoodsReturnRegisterRecord, GoodsReturnRegisterMedicine } from '../../../../api/central-stores/central-stores-api-service';

const apiService = new CentralStoresApiService();

const GoodsReturnRegister: React.FC = () => {
  const currentDate = new Date().toISOString().split('T')[0];
  const [fromDate, setFromDate] = useState(currentDate);
  const [toDate, setToDate] = useState(currentDate);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loadingReport, setLoadingReport] = useState(false);
  const [approvedReturns, setApprovedReturns] = useState<GoodsReturnRegisterRecord[]>([]);
  const [cancelledReturns, setCancelledReturns] = useState<GoodsReturnRegisterRecord[]>([]);
  const [activeTab, setActiveTab] = useState('approved');
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedReturnDetails, setSelectedReturnDetails] = useState<GoodsReturnRegisterMedicine[]>([]);
  const [selectedReturnNo, setSelectedReturnNo] = useState<string | null>(null);

  const handleShowDetails = (medicines: GoodsReturnRegisterMedicine[], returnNo: string) => {
    setSelectedReturnDetails(medicines);
    setSelectedReturnNo(returnNo);
    setShowDetailsModal(true);
  };

  const handleCloseDetails = () => setShowDetailsModal(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setLoadingReport(true);
    try {
      const data = await apiService.fetchGoodsReturnRegister(1, fromDate, toDate);
      setApprovedReturns(data.filter(r => r.isCancelled === 0));
      setCancelledReturns(data.filter(r => r.isCancelled === 1));
    } catch (err) {
      showErrorToast('Failed to load goods return register. Please try again.');
    } finally {
      setLoadingReport(false);
      setIsSubmitting(false);
    }
  };

  const renderTable = (data: GoodsReturnRegisterRecord[], emptyMessage: string) => {
    if (loadingReport) {
      return (
        <div className="text-center my-5">
          <Spinner animation="border" role="status">
            <span className="visually-hidden">Loading...</span>
          </Spinner>
          <p className="mt-2">Loading report data...</p>
        </div>
      );
    }

    if (data.length === 0) {
      return <div className="text-center my-5 text-muted">{emptyMessage}</div>;
    }

    return (
      <Table striped bordered hover responsive size="sm" className="mt-3">
        <thead>
          <tr>
            <th>S. No</th>
            <th>Goods Return Number</th>
            <th>Supplier Name</th>
            <th>Supplier Address</th>
            <th>Total</th>
            <th>Debited Amt</th>
            <th>Amt Payable</th>
            <th>Return Amt</th>
            <th>Date</th>
            <th>User</th>
          </tr>
        </thead>
        <tbody>
          {data.map((item, index) => (
            <tr key={index}>
              <td>{index + 1}</td>
              <td>
                <Button 
                  variant="link" 
                  onClick={() => handleShowDetails(item.medicines, item.returnNo)}
                  className="p-0"
                >
                  {item.returnNo}
                </Button>
              </td>
              <td>{item.supplierName}</td>
              <td>{item.supplierAddress}</td>
              <td>{item.total.toFixed(2)}</td>
              <td>{item.debitedAmt.toFixed(2)}</td>
              <td>{item.amtPayable.toFixed(2)}</td>
              <td>{item.retAmt.toFixed(2)}</td>
              <td>{item.returnDate ? new Date(item.returnDate).toLocaleDateString() : ''}</td>
              <td>{item.userName}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    );
  };

  return (
    <div className="container-fluid">
      <Card>
        <Card.Header>
          <h3 className="card-title">Goods Return Register</h3>
        </Card.Header>
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            <Row className="mb-3 align-items-end">
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Date From</Form.Label>
                  <Form.Control
                    type="date"
                    value={fromDate}
                    onChange={(e) => setFromDate(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group>
                  <Form.Label>Date To</Form.Label>
                  <Form.Control
                    type="date"
                    value={toDate}
                    onChange={(e) => setToDate(e.target.value)}
                    required
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Button type="submit" variant="primary" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit'}
                </Button>
              </Col>
            </Row>
          </Form>
          
          <div className="mt-4">
            <Tabs
              id="goods-return-tabs"
              activeKey={activeTab}
              onSelect={(k) => setActiveTab(k || 'approved')}
              className="mb-3"
            >
              <Tab eventKey="approved" title={<span className="text-success fw-bold">Active ({approvedReturns.length})</span>}>
                {renderTable(approvedReturns, "No approved goods returns found for the selected period.")}
              </Tab>
              <Tab eventKey="cancelled" title={<span className="text-danger fw-bold">Cancelled ({cancelledReturns.length})</span>}>
                {renderTable(cancelledReturns, "No cancelled goods returns found for the selected period.")}
              </Tab>
            </Tabs>
          </div>
        </Card.Body>
      </Card>

      <Modal show={showDetailsModal} onHide={handleCloseDetails} size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Details for Goods Return: {selectedReturnNo}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Table striped bordered hover size="sm">
            <thead>
              <tr>
                <th>S. No</th>
                <th>Medicine Name</th>
                <th>HSN Code</th>
                <th>Batch No</th>
                <th>Quantity</th>
                <th>Free Return</th>
                <th>Accepted Rate</th>
                <th>MRP</th>
              </tr>
            </thead>
            <tbody>
              {selectedReturnDetails.map((detail, index) => (
                <tr key={index}>
                  <td>{index + 1}</td>
                  <td>{detail.medicineName}</td>
                  <td>{detail.hsnCode}</td>
                  <td>{detail.batchNo}</td>
                  <td>{detail.quantity}</td>
                  <td>{detail.freeReturn}</td>
                  <td>{detail.acceptedRate.toFixed(2)}</td>
                  <td>{detail.mrp.toFixed(2)}</td>
                </tr>
              ))}
            </tbody>
          </Table>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={handleCloseDetails}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default GoodsReturnRegister;
