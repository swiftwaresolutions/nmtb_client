import React, { useMemo, useState } from 'react';
import { Badge, Button, Card, Col, Container, Form, Row, Table } from 'react-bootstrap';
import ReportHeader from '../../components/ReportHeader';
import '../../styles/reportStyles.css';
import { MedicalRecordsApiService, ResultWiseListItem } from '../../../api/medical-records/medical-records-api-service';
import { showErrorToast } from '../../../utils/alertUtil';
import { useTableSearch } from '../../../hooks/useTableSearch';
import SearchInput from '../../../components/SearchInput';

const apiService = new MedicalRecordsApiService();

const today = new Date().toISOString().split('T')[0];

export default function ResultWiseList() {
  const [fromDate, setFromDate] = useState<string>(today);
  const [toDate, setToDate] = useState<string>(today);
  const [resultContains, setResultContains] = useState<string>('');
  const [resultExact, setResultExact] = useState<string>('');
  const [data, setData] = useState<ResultWiseListItem[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);

  const { filteredData: searchedData, searchTerm, setSearchTerm, resultCount, totalCount } = useTableSearch({
    data,
    searchFields: ['patientName', 'opNo', 'ipNo', 'address', 'result'],
  });

  const filteredPatients = useMemo(() => {
    const contains = resultContains.trim().toLowerCase();
    const exact = resultExact.trim().toLowerCase();
    if (!contains && !exact) return searchedData;
    return searchedData.filter((patient) => {
      const resultText = (patient.result ?? '').toLowerCase();
      const containsMatch = contains ? resultText.includes(contains) : true;
      const exactMatch = exact ? resultText === exact : true;
      return containsMatch && exactMatch;
    });
  }, [searchedData, resultContains, resultExact]);

  const currentlyAdmitted = filteredPatients.filter((p) => !p.dischargeDate).length;

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      const result = await apiService.fetchResultWiseList(fromDate, toDate);
      setData(result);
      setHasSearched(true);
    } catch {
      showErrorToast('Failed to fetch result-wise patient list');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setFromDate(today);
    setToDate(today);
    setResultContains('');
    setResultExact('');
    setData([]);
    setHasSearched(false);
    setSearchTerm('');
  };

  return (
    <Container fluid className="py-4">
      <ReportHeader
        title="Result Wise Discharge Register"
        subtitle="Result-patient details between selected dates"
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
                <Form.Label className="fw-bold">Result (In Between)</Form.Label>
                <Form.Control
                  type="text"
                  value={resultContains}
                  onChange={(e) => setResultContains(e.target.value)}
                  placeholder="e.g. Recover"
                />
              </Form.Group>
            </Col>
            <Col md={3}>
              <Form.Group>
                <Form.Label className="fw-bold">Result (Exact)</Form.Label>
                <Form.Control
                  type="text"
                  value={resultExact}
                  onChange={(e) => setResultExact(e.target.value)}
                  placeholder="e.g. Recovered"
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
                <strong>Result-patient details between</strong>{' '}
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
                  <th style={{ width: '14%' }}>Result</th>
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
                      <td>{patient.result}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="text-center text-muted py-4">
                      No result-wise records found for the selected filters.
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
