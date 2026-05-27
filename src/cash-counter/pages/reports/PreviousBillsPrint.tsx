import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Button, Table, Modal } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { RootState } from '../../../state/store';
import PageHeader from '../../../components/PageHeader';
import { faPercentage } from '@fortawesome/free-solid-svg-icons';
import { showErrorToast, showSuccessToast } from '../../../utils/alertUtil';
import SearchInput from '../../../components/SearchInput';
import { useTableSearch } from '../../../hooks/useTableSearch';

const PreviousBillsPrint: React.FC = () => {
  const loginData = useSelector((state: RootState) => state.loginData);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any[]>([]);
  const [showPrintModal, setShowPrintModal] = useState(false);
  const [selectedBill, setSelectedBill] = useState<any>(null);
  
  const [formData, setFormData] = useState({
    fromDate: new Date().toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0],
    billType: 'all',
  });

  const {
    filteredData,
    searchTerm,
    setSearchTerm,
    resultCount,
    totalCount,
  } = useTableSearch({
    data: reportData,
    searchFields: ['patientName', 'billNo', 'uhid'],
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      // TODO: Implement API call to fetch previous bills
      // const response = await cashCounterApiService.getPreviousBills(formData);
      // setReportData(response);
      showSuccessToast('Bills loaded successfully');
    } catch (error) {
      console.error('Error loading bills:', error);
      showErrorToast('Failed to load bills');
    } finally {
      setLoading(false);
    }
  };

  const handlePrintBill = (bill: any) => {
    setSelectedBill(bill);
    setShowPrintModal(true);
  };

  const handleConfirmPrint = () => {
    // TODO: Implement print functionality
    showSuccessToast('Print command sent');
    setShowPrintModal(false);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      <PageHeader
        icon={faPercentage}
        title="Previous Bills Print"
        subtitle="Search and reprint previous bills"
      />
      
      <div className="content-body" style={{ flex: 1, overflow: 'auto', padding: '1.5rem' }}>
        <Card className="shadow-sm mb-4">
          <Card.Header className="bg-primary text-white">
            <h5 className="mb-0">Search Filters</h5>
          </Card.Header>
          <Card.Body>
            <Row>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>From Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="fromDate"
                    value={formData.fromDate}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>To Date</Form.Label>
                  <Form.Control
                    type="date"
                    name="toDate"
                    value={formData.toDate}
                    onChange={handleInputChange}
                  />
                </Form.Group>
              </Col>
              <Col md={3}>
                <Form.Group className="mb-3">
                  <Form.Label>Bill Type</Form.Label>
                  <Form.Control
                    as="select"
                    name="billType"
                    value={formData.billType}
                    onChange={handleInputChange}
                  >
                    <option value="all">All Bills</option>
                    <option value="op">OP Bills</option>
                    <option value="ip">IP Bills</option>
                    <option value="pharmacy">Pharmacy Bills</option>
                    <option value="lab">Lab Bills</option>
                  </Form.Control>
                </Form.Group>
              </Col>
              <Col md={3} className="d-flex align-items-end">
                <Button 
                  variant="primary" 
                  className="w-100 mb-3"
                  onClick={handleGenerateReport}
                  disabled={loading}
                >
                  {loading ? 'Loading...' : 'Search Bills'}
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <Card className="shadow-sm">
          <Card.Header className="bg-light">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Previous Bills</h5>
              <SearchInput
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                placeholder="Search by patient name, bill number, or UHID..."
                resultCount={resultCount}
                totalCount={totalCount}
              />
            </div>
          </Card.Header>
          <Card.Body>
            <div style={{ maxHeight: 'calc(100vh - 400px)', overflow: 'auto' }}>
              <Table striped bordered hover>
                <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f8f9fa', zIndex: 1 }}>
                  <tr>
                    <th>#</th>
                    <th>Bill No</th>
                    <th>Date</th>
                    <th>UHID</th>
                    <th>Patient Name</th>
                    <th>Bill Type</th>
                    <th>Amount</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="text-center text-muted">
                        {searchTerm ? 'No results match your search.' : 'No bills found. Please search.'}
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((item, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{item.billNo}</td>
                        <td>{item.date}</td>
                        <td>{item.uhid}</td>
                        <td>{item.patientName}</td>
                        <td>{item.billType}</td>
                        <td>{item.amount}</td>
                        <td>
                          <Button
                            variant="outline-primary"
                            size="sm"
                            onClick={() => handlePrintBill(item)}
                          >
                            <i className="fas fa-print me-1"></i>
                            Print
                          </Button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </Table>
            </div>
          </Card.Body>
        </Card>
      </div>

      {/* Print Confirmation Modal */}
      <Modal show={showPrintModal} onHide={() => setShowPrintModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Confirm Print</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedBill && (
            <div>
              <p><strong>Bill No:</strong> {selectedBill.billNo}</p>
              <p><strong>Patient:</strong> {selectedBill.patientName}</p>
              <p><strong>Amount:</strong> ₹{selectedBill.amount}</p>
              <p>Do you want to print this bill?</p>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowPrintModal(false)}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleConfirmPrint}>
            Print
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
};

export default PreviousBillsPrint;
