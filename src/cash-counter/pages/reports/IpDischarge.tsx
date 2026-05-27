import React, { useState } from 'react';
import { Card, Row, Col, Form, Button, Table, Badge } from 'react-bootstrap';
import { useSelector } from 'react-redux';
import { RootState } from '../../../state/store';
import PageHeader from '../../../components/PageHeader';
import { faExclamationCircle } from '@fortawesome/free-solid-svg-icons';
import { showErrorToast, showSuccessToast } from '../../../utils/alertUtil';
import SearchInput from '../../../components/SearchInput';
import { useTableSearch } from '../../../hooks/useTableSearch';

const IpDischarge: React.FC = () => {
  const loginData = useSelector((state: RootState) => state.loginData);
  const [loading, setLoading] = useState(false);
  const [reportData, setReportData] = useState<any[]>([]);
  
  const [formData, setFormData] = useState({
    fromDate: new Date().toISOString().split('T')[0],
    toDate: new Date().toISOString().split('T')[0],
    department: 'all',
    dischargeStatus: 'all',
  });

  const {
    filteredData,
    searchTerm,
    setSearchTerm,
    resultCount,
    totalCount,
  } = useTableSearch({
    data: reportData,
    searchFields: ['patientName', 'uhid', 'ipNo'],
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleGenerateReport = async () => {
    try {
      setLoading(true);
      // TODO: Implement API call to fetch IP discharge report
      // const response = await cashCounterApiService.getIpDischargeReport(formData);
      // setReportData(response);
      showSuccessToast('Report generated successfully');
    } catch (error) {
      console.error('Error generating report:', error);
      showErrorToast('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'discharged':
        return <Badge bg="success">Discharged</Badge>;
      case 'pending':
        return <Badge bg="warning" text="dark">Pending</Badge>;
      case 'settled':
        return <Badge bg="info">Settled</Badge>;
      default:
        return <Badge bg="secondary">{status}</Badge>;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', width: '100%' }}>
      <PageHeader
        icon={faExclamationCircle}
        title="IP Discharge Report"
        subtitle="Track inpatient discharge and settlement details"
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
              <Col md={2}>
                <Form.Group className="mb-3">
                  <Form.Label>Department</Form.Label>
                  <Form.Select
                    name="department"
                    value={formData.department}
                    onChange={handleInputChange}
                  >
                    <option value="all">All</option>
                    {/* TODO: Populate departments from API */}
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={2}>
                <Form.Group className="mb-3">
                  <Form.Label>Status</Form.Label>
                  <Form.Select
                    name="dischargeStatus"
                    value={formData.dischargeStatus}
                    onChange={handleInputChange}
                  >
                    <option value="all">All</option>
                    <option value="discharged">Discharged</option>
                    <option value="pending">Pending</option>
                    <option value="settled">Settled</option>
                  </Form.Select>
                </Form.Group>
              </Col>
              <Col md={2} className="d-flex align-items-end">
                <Button 
                  variant="primary" 
                  className="w-100 mb-3"
                  onClick={handleGenerateReport}
                  disabled={loading}
                >
                  {loading ? 'Generating...' : 'Generate'}
                </Button>
              </Col>
            </Row>
          </Card.Body>
        </Card>

        <Card className="shadow-sm">
          <Card.Header className="bg-light">
            <div className="d-flex justify-content-between align-items-center">
              <h5 className="mb-0">IP Discharge Details</h5>
              <SearchInput
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                placeholder="Search by patient name, UHID, or IP number..."
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
                    <th>IP No</th>
                    <th>UHID</th>
                    <th>Patient Name</th>
                    <th>Department</th>
                    <th>Admission Date</th>
                    <th>Discharge Date</th>
                    <th>Total Bill</th>
                    <th>Paid</th>
                    <th>Balance</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={11} className="text-center text-muted">
                        {searchTerm ? 'No results match your search.' : 'No data available. Please generate report.'}
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((item, index) => (
                      <tr key={index}>
                        <td>{index + 1}</td>
                        <td>{item.ipNo}</td>
                        <td>{item.uhid}</td>
                        <td>{item.patientName}</td>
                        <td>{item.department}</td>
                        <td>{item.admissionDate}</td>
                        <td>{item.dischargeDate}</td>
                        <td>₹{item.totalBill}</td>
                        <td>₹{item.paid}</td>
                        <td className={item.balance > 0 ? 'text-danger fw-bold' : 'text-success'}>
                          ₹{item.balance}
                        </td>
                        <td>{getStatusBadge(item.status)}</td>
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

export default IpDischarge;
