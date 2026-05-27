import React, { useState } from 'react';
import { Badge, Button, Card, Col, Container, Form, Row, Table } from 'react-bootstrap';
import ReportHeader from '../../components/ReportHeader';
import '../../styles/reportStyles.css';
import { MedicalRecordsApiService, CancerPatientsListItem } from '../../../api/medical-records/medical-records-api-service';
import { showErrorToast } from '../../../utils/alertUtil';
import { useTableSearch } from '../../../hooks/useTableSearch';
import SearchInput from '../../../components/SearchInput';

const apiService = new MedicalRecordsApiService();

const today = new Date().toISOString().split('T')[0];

export default function CancerPatientsList() {
  const [fromDate, setFromDate] = useState<string>(today);
  const [toDate, setToDate] = useState<string>(today);
  const [data, setData] = useState<CancerPatientsListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const { filteredData, searchTerm, setSearchTerm, resultCount, totalCount } = useTableSearch({
    data,
    searchFields: ['patientName', 'opNo', 'ipNo', 'guardianName', 'diagnosis'],
  });

  const currentlyAdmitted = filteredData.filter((p) => !p.dischargeDate).length;

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const result = await apiService.fetchCancerPatientsList(fromDate, toDate);
      setData(result);
      setHasSearched(true);
    } catch {
      showErrorToast('Failed to fetch cancer patients list');
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
        title="Cancer Patient Details Between Dates"
        subtitle="General Discharge Register"
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
                {isLoading ? 'Loading...' : 'Submit'}
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
          <Row className="mb-3">
            <Col md={12}>
              <h5 className="mb-2">
                <strong>Cancer Patient Details between</strong>{' '}
                <span style={{ color: '#000080' }}>{fromDate}</span> and{' '}
                <span style={{ color: '#000080' }}>{toDate}</span>
              </h5>
            </Col>
          </Row>

          <Row className="mb-3 align-items-center">
            <Col md={3}>
              <Badge bg="primary" className="fs-6">
                Total Patients: {filteredData.length}
              </Badge>
            </Col>
            <Col md={3}>
              <Badge bg="warning" text="dark" className="fs-6">
                Currently Admitted: {currentlyAdmitted}
              </Badge>
            </Col>
            <Col md={3}>
              <Badge bg="success" className="fs-6">
                Discharged: {filteredData.length - currentlyAdmitted}
              </Badge>
            </Col>
            <Col md={3}>
              <SearchInput
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                placeholder="Search by name, OP/IP No, diagnosis..."
                resultCount={resultCount}
                totalCount={totalCount}
              />
            </Col>
          </Row>

          <div className="table-responsive mb-4">
            <Table striped bordered hover className="reportTable">
              <thead className="table-dark">
                <tr>
                  <th style={{ width: '5%' }}>Sl.No</th>
                  <th style={{ width: '14%' }}>Patient Name</th>
                  <th style={{ width: '8%' }}>OP No.</th>
                  <th style={{ width: '9%' }}>IP No.</th>
                  <th style={{ width: '12%' }}>Guardian Name</th>
                  <th style={{ width: '7%' }}>Age</th>
                  <th style={{ width: '12%' }}>Address</th>
                  <th style={{ width: '9%' }}>Phone</th>
                  <th style={{ width: '9%' }}>Admit Date</th>
                  <th style={{ width: '9%' }}>Discharge Date</th>
                  <th style={{ width: '16%' }}>Diagnosis</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((patient, index) => (
                    <tr key={index}>
                      <td className="text-center">{index + 1}</td>
                      <td>{patient.patientName}</td>
                      <td className="text-center">{patient.opNo}</td>
                      <td className="text-center">{patient.ipNo}</td>
                      <td>{patient.guardianName}</td>
                      <td className="text-center">{patient.age}</td>
                      <td>{patient.address}</td>
                      <td className="text-center">{patient.phone}</td>
                      <td className="text-center">{patient.admitDate}</td>
                      <td className="text-center">
                        {patient.dischargeDate ? (
                          patient.dischargeDate
                        ) : (
                          <Badge bg="warning" text="dark">
                            Inpatient
                          </Badge>
                        )}
                      </td>
                      <td>{patient.diagnosis}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={11} className="text-center text-muted py-4">
                      No cancer patient records found for the selected date range.
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
