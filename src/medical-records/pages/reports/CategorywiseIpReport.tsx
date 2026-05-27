import React, { useState } from 'react';
import { Container, Card, Row, Col, Form, Button, Table, Badge } from 'react-bootstrap';
import ReportHeader from '../../components/ReportHeader';
import '../../styles/reportStyles.css';
import { MedicalRecordsApiService, CategorywiseIpReportItem } from '../../../api/medical-records/medical-records-api-service';
import { showErrorToast } from '../../../utils/alertUtil';
import { useTableSearch } from '../../../hooks/useTableSearch';
import SearchInput from '../../../components/SearchInput';

const apiService = new MedicalRecordsApiService();

const today = new Date().toISOString().split('T')[0];

export default function CategorywiseIpReport() {
  const [fromDate, setFromDate] = useState<string>(today);
  const [toDate, setToDate] = useState<string>(today);
  const [data, setData] = useState<CategorywiseIpReportItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const { filteredData, searchTerm, setSearchTerm, resultCount, totalCount } = useTableSearch({
    data,
    searchFields: ['patientName', 'opNo', 'address', 'department', 'consultant'],
  });

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const result = await apiService.fetchCategorywiseIpReport(fromDate, toDate);
      setData(result);
      setHasSearched(true);
    } catch {
      showErrorToast('Failed to fetch category-wise IP report');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFromDate(today);
    setToDate(today);
    setData([]);
    setHasSearched(false);
    setSearchTerm('');
  };

  return (
    <Container fluid className="py-4">
      <ReportHeader
        title="Category Wise IP Report"
        subtitle="Patient Admission Report by Income Category"
      />

      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-bold">From Date</Form.Label>
                <Form.Control
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-bold">To Date</Form.Label>
                <Form.Control
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </Form.Group>
            </Col>
          </Row>

          <Row>
            <Col className="d-flex gap-2">
              <Button variant="primary" className="fw-bold" onClick={handleSubmit} disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Search'}
              </Button>
              <Button variant="secondary" className="fw-bold" onClick={handleReset} disabled={isLoading}>
                Reset
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {hasSearched && (
        <>
          <Row className="mb-3 align-items-center">
            <Col md={6}>
              <Badge bg="info" className="fs-6">
                Total Records: {filteredData.length}
              </Badge>
            </Col>
            <Col md={6}>
              <SearchInput
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                placeholder="Search by name, OP No, department..."
                resultCount={resultCount}
                totalCount={totalCount}
              />
            </Col>
          </Row>

          <div className="table-responsive mb-4">
            <Table striped bordered hover className="reportTable">
              <thead className="table-dark">
                <tr>
                  <th style={{ width: '5%' }}>S.No</th>
                  <th style={{ width: '15%' }}>Patient Name</th>
                  <th style={{ width: '10%' }}>OP No.</th>
                  <th style={{ width: '8%' }}>Age</th>
                  <th style={{ width: '15%' }}>Address</th>
                  <th style={{ width: '10%' }}>Admit Date</th>
                  <th style={{ width: '10%' }}>Discharge Date</th>
                  <th style={{ width: '12%' }}>Department</th>
                  <th style={{ width: '15%' }}>Consultant</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((patient, index) => (
                    <tr key={index}>
                      <td className="text-center">{index + 1}</td>
                      <td>{patient.patientName}</td>
                      <td className="text-center">{patient.opNo}</td>
                      <td className="text-center">{patient.age}</td>
                      <td>{patient.address}</td>
                      <td className="text-center">{patient.admitDate}</td>
                      <td className="text-center">{patient.dischargeDate}</td>
                      <td>{patient.department}</td>
                      <td>{patient.consultant}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={9} className="text-center text-muted py-4">
                      No records found for the selected date range.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>
        </>
      )}
    </Container>
  );
}
