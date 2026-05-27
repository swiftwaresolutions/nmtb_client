import React, { useState } from 'react';
import { Container, Card, Row, Col, Form, Button, Table, Badge } from 'react-bootstrap';
import ReportHeader from '../../components/ReportHeader';
import '../../styles/reportStyles.css';
import { MedicalRecordsApiService, MlcPatientListItem } from '../../../api/medical-records/medical-records-api-service';
import { showErrorToast } from '../../../utils/alertUtil';
import { useTableSearch } from '../../../hooks/useTableSearch';
import SearchInput from '../../../components/SearchInput';

const apiService = new MedicalRecordsApiService();

export default function MlcRegtdPatientList() {
  const today = new Date().toISOString().split('T')[0];
  const [fromDate, setFromDate] = useState<string>(today);
  const [toDate, setToDate] = useState<string>(today);
  const [data, setData] = useState<MlcPatientListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const { filteredData, searchTerm, setSearchTerm, resultCount, totalCount } = useTableSearch({
    data,
    searchFields: ['patientName', 'opNo', 'ipNo'],
  });

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const result = await apiService.fetchMlcPatientsRegistrationList(fromDate, toDate);
      setData(result);
      setHasSearched(true);
    } catch (error: any) {
      console.error('MLC Patient List fetch error:', error);
      const msg = error?.response?.data?.message || error?.message || 'Failed to fetch MLC patient list';
      showErrorToast(msg);
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
      <ReportHeader title="MLC Patients Registration" subtitle="List of MLC patients between dates" />

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
            <Col md={6} className="d-flex gap-2">
              <Button
                variant="primary"
                onClick={handleSubmit}
                disabled={isLoading}
                className="fw-bold"
              >
                {isLoading ? 'Loading...' : 'Submit'}
              </Button>
              <Button
                variant="secondary"
                onClick={handleReset}
                disabled={isLoading}
                className="fw-bold"
              >
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
                Total Records: {totalCount}
              </Badge>
            </Col>
            <Col md={6}>
              <SearchInput
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                placeholder="Search by name, OP No, IP No..."
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
                  <th style={{ width: '30%' }}>Patient Name</th>
                  <th style={{ width: '15%' }}>OP No.</th>
                  <th style={{ width: '15%' }}>IP No.</th>
                  <th style={{ width: '17%' }}>DOA Time</th>
                  <th style={{ width: '17%' }}>DOD Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((patient, index) => (
                    <tr key={index}>
                      <td className="text-center">{index + 1}</td>
                      <td>{patient.patientName}</td>
                      <td>{patient.opNo}</td>
                      <td className="text-center">{patient.ipNo ?? '-'}</td>
                      <td className="text-center">{patient.doaTime ?? '-'}</td>
                      <td className="text-center">{patient.dodTime ?? '-'}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center text-muted py-4">
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
