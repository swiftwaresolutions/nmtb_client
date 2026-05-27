import React, { useState, useEffect } from 'react';
import { Card, Row, Col, Form, Button, Table, Badge } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { RootState } from '../../../state/store';
import PageHeader from '../../../components/PageHeader';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { showErrorToast, showSuccessToast } from '../../../utils/alertUtil';
import SearchInput from '../../../components/SearchInput';
import { useTableSearch } from '../../../hooks/useTableSearch';

const PendingDue: React.FC = () => {
  const loginData = useSelector((state: RootState) => state.loginData);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    fromDate: new Date().toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0],
    patientType: 'all',
  });

  const {
    filteredData,
    searchTerm,
    setSearchTerm,
    resultCount,
    totalCount,
  } = useTableSearch({
    data: reportData,
    searchFields: ['patientName', 'uhid', 'billNo'],
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      // TODO: Implement API call to fetch pending due report
      // const response = await cashCounterApiService.getPendingDueReport(formData);
      // setReportData(response);
      showSuccessToast('Report generated successfully');
    } catch (error) {
      console.error('Error generating report:', error);
      showErrorToast('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      <PageHeader
        icon={faExclamationCircle}
        title="Pending Due Report"
        subtitle="Track outstanding payments and due amounts"
      />
      
      <div className="content-body" style={{ flex: 1, overflow: 'auto', padding: '1.5rem' }}>
        <Card className="shadow-sm mb-4">
          <Card.Header className="bg-primary text-white">
            <h5 className="mb-0">Report Filters</h5>
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
                  <Form.Label>Patient Type</Form.Label>
                  <Form.Control
                    as="select"
                    name="patientType"
                    value={formData.patientType}
                    onChange={handleInputChange}
                  >
                    <option value="all">All</option>
                    <option value="op">Out Patient</option>
                    <option value="ip">In Patient</option>
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
                  {loading ? 'Generating...' : 'Generate Report'}
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <Card className="shadow-sm">
          <Card.Header className="bg-light">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Pending Due Details</h5>
              <SearchInput
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                placeholder="Search by patient name, UHID, or bill number..."
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
                    <th>UHID</th>
                    <th>Patient Name</th>
                    <th>Bill No</th>
                    <th>Bill Date</th>
                    <th>Total Amount</th>
                    <th>Paid Amount</th>
                    <th>Due Amount</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="text-center text-muted">
                        {searchTerm ? 'No results match your search.' : 'No data available. Please generate report.'}
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((item, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{item.uhid}</td>
                        <td>{item.patientName}</td>
                        <td>{item.billNo}</td>
                        <td>{item.billDate}</td>
                        <td>{item.totalAmount}</td>
                        <td>{item.paidAmount}</td>
                        <td className="text-danger fw-bold">{item.dueAmount}</td>
                        <td>
                          <Badge bg="warning" text="dark">Pending</Badge>
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
    </div>
  );
};

export default PendingDue;
