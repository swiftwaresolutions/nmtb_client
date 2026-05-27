import React, { useMemo, useState } from 'react';
import { Badge, Button, Card, Col, Container, Form, Row, Table } from 'react-bootstrap';
import ReportHeader from '../../components/ReportHeader';
import '../../styles/reportStyles.css';
import { MedicalRecordsApiService, DiagnosisWiseListItem } from '../../../api/medical-records/medical-records-api-service';
import { showErrorToast } from '../../../utils/alertUtil';
import { useTableSearch } from '../../../hooks/useTableSearch';
import SearchInput from '../../../components/SearchInput';

const apiService = new MedicalRecordsApiService();

const today = new Date().toISOString().split('T')[0];

export default function DiagnosisWiseList() {
  const [fromDate, setFromDate] = useState<string>(today);
  const [toDate, setToDate] = useState<string>(today);
  const [diagnosisContains, setDiagnosisContains] = useState<string>('');
  const [diagnosisExact, setDiagnosisExact] = useState<string>('');
  const [data, setData] = useState<DiagnosisWiseListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const { filteredData: searchedData, searchTerm, setSearchTerm, resultCount, totalCount } = useTableSearch({
    data,
    searchFields: ['patientName', 'opNo', 'ipNo', 'address', 'diagnosis'],
  });

  const filteredPatients = useMemo(() => {
    const contains = diagnosisContains.trim().toLowerCase();
    const exact = diagnosisExact.trim().toLowerCase();
    if (!contains && !exact) return searchedData;
    return searchedData.filter((patient) => {
      const diagnosisText = (patient.diagnosis ?? '').toLowerCase();
      const containsMatch = contains ? diagnosisText.includes(contains) : true;
      const exactMatch = exact ? diagnosisText === exact : true;
      return containsMatch && exactMatch;
    });
  }, [searchedData, diagnosisContains, diagnosisExact]);

  const currentlyAdmitted = filteredPatients.filter((p) => !p.dischargeDate).length;

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const result = await apiService.fetchDiagnosisWiseList(fromDate, toDate);
      setData(result);
      setHasSearched(true);
    } catch {
      showErrorToast('Failed to fetch diagnosis-wise patient list');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFromDate(today);
    setToDate(today);
    setDiagnosisContains('');
    setDiagnosisExact('');
    setData([]);
    setHasSearched(false);
    setSearchTerm('');
  };

  return (
    <Container fluid className="py-4">
      <ReportHeader
        title="Diagnosis Wise Cancer Patient List"
        subtitle="General Discharge Register"
      />

      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Row className="mb-3">
            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-bold">From Date</Form.Label>
                <Form.Control
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-bold">To Date</Form.Label>
                <Form.Control
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-bold">Diagnosis (In Between)</Form.Label>
                <Form.Control
                  type="text"
                  value={diagnosisContains}
                  onChange={(e) => setDiagnosisContains(e.target.value)}
                  placeholder="e.g. Carcinoma"
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-bold">Diagnosis (Exact)</Form.Label>
                <Form.Control
                  type="text"
                  value={diagnosisExact}
                  onChange={(e) => setDiagnosisExact(e.target.value)}
                  placeholder="e.g. Breast Carcinoma"
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
          <Row className="mb-3">
            <Col md={12}>
              <h5 className="mb-2">
                <strong>Cancer-patient details between</strong>{' '}
                <span style={{ color: '#000080' }}>{fromDate}</span> and{' '}
                <span style={{ color: '#000080' }}>{toDate}</span>
              </h5>
            </Col>
          </Row>

          <Row className="mb-3 align-items-center">
            <Col md={3}>
              <Badge bg="primary" className="fs-6">
                Total Patients: {filteredPatients.length}
              </Badge>
            </Col>
            <Col md={3}>
              <Badge bg="warning" text="dark" className="fs-6">
                Currently Admitted: {currentlyAdmitted}
              </Badge>
            </Col>
            <Col md={3}>
              <Badge bg="success" className="fs-6">
                Discharged: {filteredPatients.length - currentlyAdmitted}
              </Badge>
            </Col>
            <Col md={3}>
              <SearchInput
                searchTerm={searchTerm}
                onSearchChange={setSearchTerm}
                placeholder="Search by name, OP/IP No..."
                resultCount={resultCount}
                totalCount={totalCount}
              />
            </Col>
          </Row>

          <div className="table-responsive mb-4" id="print_content">
            <Table striped bordered hover className="reportTable">
              <thead className="table-dark">
                <tr>
                  <th style={{ width: '6%' }}>Sl.No</th>
                  <th style={{ width: '18%' }}>Patient Name</th>
                  <th style={{ width: '10%' }}>OP No.</th>
                  <th style={{ width: '11%' }}>IP No.</th>
                  <th style={{ width: '17%' }}>Address</th>
                  <th style={{ width: '12%' }}>Admit Date</th>
                  <th style={{ width: '12%' }}>Discharge Date</th>
                  <th style={{ width: '14%' }}>Diagnosis</th>
                </tr>
              </thead>
              <tbody>
                {filteredPatients.length > 0 ? (
                  filteredPatients.map((patient, index) => (
                    <tr key={index}>
                      <td className="text-center">{index + 1}</td>
                      <td>{patient.patientName}</td>
                      <td className="text-center">{patient.opNo}</td>
                      <td className="text-center">{patient.ipNo}</td>
                      <td>{patient.address}</td>
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
                    <td colSpan={8} className="text-center text-muted py-4">
                      No diagnosis-wise records found for the selected filters.
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
