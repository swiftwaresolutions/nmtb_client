import React, { useState } from 'react';
import { Alert, Badge, Button, Card, Col, Container, Form, Modal, Row, Table } from 'react-bootstrap';
import ReportHeader from '../../components/ReportHeader';
import '../../styles/reportStyles.css';
import {
  MedicalRecordsApiService,
  PatientAllVisitResponse,
} from '../../../api/medical-records/medical-records-api-service';
import { showErrorToast } from '../../../utils/alertUtil';

const apiService = new MedicalRecordsApiService();

export default function PatientsAllVisit() {
  const [opNumber, setOpNumber] = useState<string>('');
  const [submittedOpNumber, setSubmittedOpNumber] = useState<string>('');
  const [patientData, setPatientData] = useState<PatientAllVisitResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [hasSearched, setHasSearched] = useState<boolean>(false);
  const [showVisitModal, setShowVisitModal] = useState<boolean>(false);

  const handleSearch = async () => {
    if (!opNumber.trim()) return;
    setIsLoading(true);
    try {
      const result = await apiService.fetchPatientsAllVisit(opNumber.trim());
      setPatientData(result);
      setSubmittedOpNumber(opNumber.trim());
      setHasSearched(true);
    } catch {
      showErrorToast('Failed to fetch patient visit details');
    } finally {
      setIsLoading(false);
    }
  };

  const handleReset = () => {
    setOpNumber('');
    setSubmittedOpNumber('');
    setPatientData(null);
    setHasSearched(false);
    setShowVisitModal(false);
  };

  const admittedCount = patientData?.visits.filter((v) => v.isAdmitted === 'Yes').length ?? 0;
  const opVisitCount = (patientData?.visits.length ?? 0) - admittedCount;

  return (
    <Container fluid className="py-4">
      <ReportHeader title="OP's All Visit Details" subtitle="Particular Patient - No. of Visits" />

      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Row className="align-items-end g-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-bold">Patient OP Number</Form.Label>
                <Form.Control
                  type="text"
                  value={opNumber}
                  onChange={(e) => setOpNumber(e.target.value)}
                  placeholder="Enter OP Number"
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                />
              </Form.Group>
            </Col>
            <Col md={4} className="d-flex gap-2">
              <Button variant="primary" className="fw-bold" onClick={handleSearch} disabled={isLoading}>
                {isLoading ? 'Loading...' : 'Submit'}
              </Button>
              <Button variant="secondary" className="fw-bold" onClick={handleReset} disabled={isLoading}>
                Reset
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {hasSearched && !patientData && (
        <Alert variant="warning" className="mb-3">
          No visit records found for OP Number <strong>{submittedOpNumber}</strong>.
        </Alert>
      )}

      {patientData && (
        <>
          <Card className="mb-3 shadow-sm">
            <Card.Body>
              <Row className="g-3">
                <Col md={3}>
                  <strong>Patient OP Number:</strong>{' '}
                  <span style={{ color: '#000080' }}>{patientData.patientInfo.opNo}</span>
                </Col>
                <Col md={3}>
                  <strong>Patient Name:</strong>{' '}
                  <span style={{ color: '#000080' }}>{patientData.patientInfo.patientName}</span>
                </Col>
                <Col md={2}>
                  <strong>Age:</strong>{' '}
                  <span style={{ color: '#000080' }}>{patientData.patientInfo.age}</span>
                </Col>
                <Col md={2}>
                  <strong>Sex:</strong>{' '}
                  <span style={{ color: '#000080' }}>{patientData.patientInfo.sex}</span>
                </Col>
                <Col md={2}>
                  <strong>DOB:</strong>{' '}
                  <span style={{ color: '#000080' }}>{patientData.patientInfo.dob}</span>
                </Col>
              </Row>
              <Row className="g-3 mt-1">
                <Col md={4}>
                  <strong>Relative Name:</strong> {patientData.patientInfo.relativeName}
                </Col>
                <Col md={2}>
                  <strong>Marital:</strong> {patientData.patientInfo.maritalStatus}
                </Col>
                <Col md={3}>
                  <strong>Phone:</strong> {patientData.patientInfo.phone}
                </Col>
                <Col md={3}>
                  <strong>Address:</strong> {patientData.patientInfo.street}, {patientData.patientInfo.area}
                </Col>
              </Row>
            </Card.Body>
          </Card>

          <Row className="mb-3">
            <Col md={3}>
              <Badge bg="primary" className="fs-6">
                Total Visits: {patientData.visits.length}
              </Badge>
            </Col>
            <Col md={3}>
              <Badge bg="warning" text="dark" className="fs-6">
                Admitted Visits: {admittedCount}
              </Badge>
            </Col>
            <Col md={3}>
              <Badge bg="success" className="fs-6">
                OP Visits: {opVisitCount}
              </Badge>
            </Col>
          </Row>

          <div className="table-responsive mb-4">
            <Table striped bordered hover className="reportTable">
              <thead className="table-dark">
                <tr>
                  <th style={{ width: '9%' }}>O. P No</th>
                  <th style={{ width: '9%' }}>IP No</th>
                  <th style={{ width: '14%' }}>Patient Name</th>
                  <th style={{ width: '9%' }}>D. O. B</th>
                  <th style={{ width: '5%' }}>Age</th>
                  <th style={{ width: '13%' }}>Relative Name</th>
                  <th style={{ width: '10%' }}>Marital Status</th>
                  <th style={{ width: '9%' }}>Phone No</th>
                  <th style={{ width: '9%' }}>Street</th>
                  <th style={{ width: '8%' }}>Area</th>
                  <th style={{ width: '9%' }}>Visit Date</th>
                </tr>
              </thead>
              <tbody>
                {patientData.visits.map((visit, index) => (
                  <tr key={index}>
                    <td className="text-center">
                      <button
                        type="button"
                        className="btn btn-link p-0 text-decoration-underline"
                        onClick={() => setShowVisitModal(true)}
                      >
                        {patientData.patientInfo.opNo}
                      </button>
                    </td>
                    <td className="text-center">{visit.ipNo || '-'}</td>
                    <td>{patientData.patientInfo.patientName}</td>
                    <td className="text-center">{patientData.patientInfo.dob}</td>
                    <td className="text-center">{patientData.patientInfo.age}</td>
                    <td>{patientData.patientInfo.relativeName}</td>
                    <td className="text-center">{patientData.patientInfo.maritalStatus}</td>
                    <td className="text-center">{patientData.patientInfo.phone}</td>
                    <td>{patientData.patientInfo.street}</td>
                    <td>{patientData.patientInfo.area}</td>
                    <td className="text-center">{patientData.patientInfo.visitDate}</td>
                  </tr>
                ))}
              </tbody>
            </Table>
          </div>
        </>
      )}

      <Modal show={showVisitModal} onHide={() => setShowVisitModal(false)} size="xl" centered>
        <Modal.Header closeButton>
          <Modal.Title>Particular Patient - No. of Visits</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {patientData && (
            <>
              <Row className="mb-3">
                <Col md={4}>
                  <strong>Patient OP Number:</strong>{' '}
                  <span style={{ color: '#000080' }}>{patientData.patientInfo.opNo}</span>
                </Col>
                <Col md={4}>
                  <strong>Patient Name:</strong>{' '}
                  <span style={{ color: '#000080' }}>{patientData.patientInfo.patientName}</span>
                </Col>
                <Col md={2}>
                  <strong>Age:</strong>{' '}
                  <span style={{ color: '#000080' }}>{patientData.patientInfo.age}</span>
                </Col>
                <Col md={2}>
                  <strong>Sex:</strong>{' '}
                  <span style={{ color: '#000080' }}>{patientData.patientInfo.sex}</span>
                </Col>
              </Row>

              <div className="table-responsive">
                <Table striped bordered hover className="reportTable">
                  <thead className="table-dark">
                    <tr>
                      <th style={{ width: '7%' }}>S No.</th>
                      <th style={{ width: '10%' }}>IP No</th>
                      <th style={{ width: '13%' }}>Major Token</th>
                      <th style={{ width: '20%' }}>Department</th>
                      <th style={{ width: '20%' }}>Doctor</th>
                      <th style={{ width: '12%' }}>Is Admitted</th>
                      <th style={{ width: '18%' }}>Diagnosis</th>
                    </tr>
                  </thead>
                  <tbody>
                    {patientData.visits.map((visit, index) => (
                      <tr key={index}>
                        <td className="text-center">{index + 1}</td>
                        <td className="text-center">{visit.ipNo || '-'}</td>
                        <td className="text-center">{visit.majorToken}</td>
                        <td>{visit.department}</td>
                        <td>{visit.doctor}</td>
                        <td className="text-center">
                          {visit.isAdmitted === 'Yes' ? (
                            <Badge bg="warning" text="dark">Yes</Badge>
                          ) : (
                            <Badge bg="success">No</Badge>
                          )}
                        </td>
                        <td>{visit.diagnosis}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowVisitModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}
