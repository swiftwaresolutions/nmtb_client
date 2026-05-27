import React, { useState, useMemo } from 'react';
import { Container, Card, Row, Col, Form, Button, Table, Badge, Tabs, Tab } from 'react-bootstrap';
import ReportHeader from '../../components/ReportHeader';
import '../../styles/reportStyles.css';

interface ISubDisease {
  id: number;
  name: string;
  code: string;
  maleCount: number;
  femaleCount: number;
}

interface IAgeWiseData {
  ageType: string;
  count: number;
  badgeColor: string;
}

interface IPatient {
  slNo: number;
  patientName: string;
  patientNo: string;
  age: string;
  address: string;
  admissionDate: string;
  gender: string;
  ageType: string;
}

const DISEASES = [
  { id: 1, code: 'I10', name: 'Essential (primary) hypertension' },
  { id: 2, code: 'E11', name: 'Type 2 diabetes mellitus' },
  { id: 3, code: 'J06.9', name: 'Acute upper respiratory infection, unspecified' },
  { id: 4, code: 'M54.5', name: 'Low back pain' },
  { id: 5, code: 'K35', name: 'Appendicitis' },
];

const SUB_DISEASES_MAP: Record<number, ISubDisease[]> = {
  1: [
    { id: 101, name: 'Uncontrolled Hypertension', code: 'I10.1', maleCount: 24, femaleCount: 19 },
    { id: 102, name: 'Controlled Hypertension', code: 'I10.2', maleCount: 18, femaleCount: 22 },
    { id: 103, name: 'Secondary Hypertension', code: 'I10.3', maleCount: 8, femaleCount: 6 },
  ],
  2: [
    { id: 201, name: 'With Neuropathy', code: 'E11.4', maleCount: 15, femaleCount: 12 },
    { id: 202, name: 'With Retinopathy', code: 'E11.3', maleCount: 9, femaleCount: 11 },
    { id: 203, name: 'With Nephropathy', code: 'E11.2', maleCount: 7, femaleCount: 8 },
  ],
  3: [
    { id: 301, name: 'Acute Bronchitis', code: 'J06.91', maleCount: 12, femaleCount: 14 },
    { id: 302, name: 'Viral Pharyngitis', code: 'J06.92', maleCount: 8, femaleCount: 10 },
  ],
  4: [
    { id: 401, name: 'Acute Low Back Pain', code: 'M54.51', maleCount: 20, femaleCount: 18 },
    { id: 402, name: 'Chronic Low Back Pain', code: 'M54.52', maleCount: 16, femaleCount: 19 },
  ],
  5: [
    { id: 501, name: 'Acute Appendicitis', code: 'K35.9', maleCount: 11, femaleCount: 10 },
  ],
};

const DEMO_PATIENTS: IPatient[] = [
  {
    slNo: 1,
    patientName: 'Rajesh Kumar',
    patientNo: 'OP-2026-00145',
    age: '45',
    address: '123 Main St, City',
    admissionDate: '2025-12-10',
    gender: 'M',
    ageType: 'Adult',
  },
  {
    slNo: 2,
    patientName: 'Priya Singh',
    patientNo: 'OP-2026-00156',
    age: '38',
    address: '456 Oak Ave, City',
    admissionDate: '2025-12-12',
    gender: 'F',
    ageType: 'Adult',
  },
  {
    slNo: 3,
    patientName: 'Mohit Patel',
    patientNo: 'OP-2026-00167',
    age: '52',
    address: '789 Pine Rd, City',
    admissionDate: '2025-12-14',
    gender: 'M',
    ageType: 'Adult',
  },
  {
    slNo: 4,
    patientName: 'Anita Desai',
    patientNo: 'OP-2026-00178',
    age: '3',
    address: '321 Elm St, City',
    admissionDate: '2025-12-16',
    gender: 'F',
    ageType: 'Child',
  },
  {
    slNo: 5,
    patientName: 'Vikram Singh',
    patientNo: 'OP-2026-00189',
    age: '67',
    address: '654 Maple Dr, City',
    admissionDate: '2025-12-18',
    gender: 'M',
    ageType: 'Adult',
  },
  {
    slNo: 6,
    patientName: 'Deepa Nair',
    patientNo: 'OP-2026-00190',
    age: '0.5',
    address: '987 Cedar Ln, City',
    admissionDate: '2025-12-20',
    gender: 'F',
    ageType: 'Neonatal',
  },
  {
    slNo: 7,
    patientName: 'Suresh Reddy',
    patientNo: 'OP-2026-00201',
    age: '1.5',
    address: '111 Birch Ct, City',
    admissionDate: '2025-12-21',
    gender: 'M',
    ageType: 'Infant',
  },
  {
    slNo: 8,
    patientName: 'Ramesh Iyer',
    patientNo: 'OP-2026-00212',
    age: '41',
    address: '222 Ash Way, City',
    admissionDate: '2025-12-23',
    gender: 'M',
    ageType: 'Adult',
  },
];

const getAgeTypeData = (gender: string): IAgeWiseData[] => {
  const maleData = [
    { ageType: 'Neonatal', count: 2, badgeColor: 'danger' },
    { ageType: 'Infant', count: 1, badgeColor: 'warning' },
    { ageType: 'Child', count: 3, badgeColor: 'info' },
    { ageType: 'Adult', count: 12, badgeColor: 'success' },
  ];

  const femaleData = [
    { ageType: 'Neonatal', count: 1, badgeColor: 'danger' },
    { ageType: 'Infant', count: 2, badgeColor: 'warning' },
    { ageType: 'Child', count: 2, badgeColor: 'info' },
    { ageType: 'Adult', count: 10, badgeColor: 'success' },
  ];

  return gender === 'M' ? maleData : femaleData;
};

export default function IcdWiseReport() {
  const [selectedDiseaseId, setSelectedDiseaseId] = useState<number>(1);
  const [fromDate, setFromDate] = useState<string>('2025-12-01');
  const [toDate, setToDate] = useState<string>('2025-12-31');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<string>('summary');

  const subDiseases = useMemo(() => {
    return SUB_DISEASES_MAP[selectedDiseaseId] || [];
  }, [selectedDiseaseId]);

  const selectedDisease = useMemo(() => {
    return DISEASES.find((d) => d.id === selectedDiseaseId);
  }, [selectedDiseaseId]);

  const maleAgeData = useMemo(() => getAgeTypeData('M'), []);
  const femaleAgeData = useMemo(() => getAgeTypeData('F'), []);

  const malePatients = useMemo(
    () => DEMO_PATIENTS.filter((p) => p.gender === 'M'),
    []
  );

  const femalePatients = useMemo(
    () => DEMO_PATIENTS.filter((p) => p.gender === 'F'),
    []
  );

  const maleTotal = useMemo(() => maleAgeData.reduce((sum, item) => sum + item.count, 0), [maleAgeData]);
  const femaleTotal = useMemo(() => femaleAgeData.reduce((sum, item) => sum + item.count, 0), [femaleAgeData]);

  const handleSubmit = () => {
    setIsSubmitted(true);
  };

  const handleReset = () => {
    setSelectedDiseaseId(1);
    setFromDate('2025-12-01');
    setToDate('2025-12-31');
    setIsSubmitted(false);
    setActiveTab('summary');
  };

  return (
    <Container fluid className="py-4">
      <ReportHeader
        title="Age Wise Classification of Patients with Disease"
        subtitle="ICD-wise Patient Analytics"
      />

      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-bold">Select Disease Coding</Form.Label>
                <Form.Select
                  value={selectedDiseaseId}
                  onChange={(e) => setSelectedDiseaseId(Number(e.target.value))}
                >
                  {DISEASES.map((disease) => (
                    <option key={disease.id} value={disease.id}>
                      {disease.code} : {disease.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
          </Row>

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
                className="fw-bold"
              >
                Submit
              </Button>
              <Button
                variant="secondary"
                onClick={handleReset}
                className="fw-bold"
              >
                Reset
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {isSubmitted && selectedDisease && (
        <Tabs
          activeKey={activeTab}
          onSelect={(k) => setActiveTab(k || 'summary')}
          className="mb-4"
        >
          {/* Sub-Disease Summary */}
          <Tab eventKey="summary" title="Sub-Disease Summary">
            <Card className="mt-3">
              <Card.Header className="bg-dark text-white">
                <h5 className="mb-0">
                  Disease: {selectedDisease.code} - {selectedDisease.name}
                </h5>
              </Card.Header>
              <Card.Body>
                <Row className="mb-3">
                  <Col md={12}>
                    <Badge bg="info" className="fs-6">
                      Total Sub-Diseases: {subDiseases.length}
                    </Badge>
                  </Col>
                </Row>
                <div className="table-responsive">
                  <Table striped bordered hover>
                    <thead className="table-dark">
                      <tr>
                        <th style={{ width: '35%' }}>Sub Disease Name</th>
                        <th style={{ width: '15%' }}>Code</th>
                        <th style={{ width: '25%' }} className="text-center">
                          Male
                        </th>
                        <th style={{ width: '25%' }} className="text-center">
                          Female
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {subDiseases.map((subDisease) => (
                        <tr key={subDisease.id}>
                          <td>{subDisease.name}</td>
                          <td>{subDisease.code}</td>
                          <td className="text-center">
                            <Badge bg="primary">{subDisease.maleCount}</Badge>
                          </td>
                          <td className="text-center">
                            <Badge bg="danger">{subDisease.femaleCount}</Badge>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </Tab>

          {/* Male Age-Wise Classification */}
          <Tab eventKey="male" title={`Male (${maleTotal})`}>
            <Card className="mt-3">
              <Card.Header style={{ backgroundColor: '#0066cc', color: 'white' }}>
                <h5 className="mb-0">Male Death Patient Details</h5>
              </Card.Header>
              <Card.Body>
                <Row className="mb-3">
                  <Col md={12}>
                    <Badge bg="primary" className="fs-6">
                      Total Male: {maleTotal}
                    </Badge>
                  </Col>
                </Row>

                <h6 className="fw-bold mb-3">Age Type Distribution</h6>
                <div className="table-responsive mb-4">
                  <Table striped bordered hover>
                    <thead className="table-dark">
                      <tr>
                        <th style={{ width: '50%' }}>Age Type</th>
                        <th style={{ width: '50%' }} className="text-end">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {maleAgeData.map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.ageType}</td>
                          <td className="text-end">
                            <Badge bg={item.badgeColor}>{item.count}</Badge>
                          </td>
                        </tr>
                      ))}
                      <tr style={{ backgroundColor: '#222', color: '#fbfdee' }}>
                        <td className="fw-bold">Total</td>
                        <td className="text-end fw-bold" style={{ color: '#ff4444' }}>
                          {maleTotal}
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </div>

                <h6 className="fw-bold mb-3">Male Patient Details</h6>
                <div className="table-responsive">
                  <Table striped bordered hover size="sm">
                    <thead className="table-dark">
                      <tr>
                        <th style={{ width: '8%' }}>S.No</th>
                        <th style={{ width: '25%' }}>Patient Name</th>
                        <th style={{ width: '15%' }}>Patient No</th>
                        <th style={{ width: '10%' }}>Age</th>
                        <th style={{ width: '22%' }}>Address</th>
                        <th style={{ width: '20%' }}>Admission Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {malePatients.map((patient) => (
                        <tr key={patient.slNo}>
                          <td className="text-center">{patient.slNo}</td>
                          <td>{patient.patientName}</td>
                          <td>{patient.patientNo}</td>
                          <td className="text-center">{patient.age}</td>
                          <td>{patient.address}</td>
                          <td>{patient.admissionDate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </Tab>

          {/* Female Age-Wise Classification */}
          <Tab eventKey="female" title={`Female (${femaleTotal})`}>
            <Card className="mt-3">
              <Card.Header style={{ backgroundColor: '#cc0066', color: 'white' }}>
                <h5 className="mb-0">Female Death Patient Details</h5>
              </Card.Header>
              <Card.Body>
                <Row className="mb-3">
                  <Col md={12}>
                    <Badge bg="danger" className="fs-6">
                      Total Female: {femaleTotal}
                    </Badge>
                  </Col>
                </Row>

                <h6 className="fw-bold mb-3">Age Type Distribution</h6>
                <div className="table-responsive mb-4">
                  <Table striped bordered hover>
                    <thead className="table-dark">
                      <tr>
                        <th style={{ width: '50%' }}>Age Type</th>
                        <th style={{ width: '50%' }} className="text-end">
                          Total
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      {femaleAgeData.map((item, idx) => (
                        <tr key={idx}>
                          <td>{item.ageType}</td>
                          <td className="text-end">
                            <Badge bg={item.badgeColor}>{item.count}</Badge>
                          </td>
                        </tr>
                      ))}
                      <tr style={{ backgroundColor: '#222', color: '#fbfdee' }}>
                        <td className="fw-bold">Total</td>
                        <td className="text-end fw-bold" style={{ color: '#ff4444' }}>
                          {femaleTotal}
                        </td>
                      </tr>
                    </tbody>
                  </Table>
                </div>

                <h6 className="fw-bold mb-3">Female Patient Details</h6>
                <div className="table-responsive">
                  <Table striped bordered hover size="sm">
                    <thead className="table-dark">
                      <tr>
                        <th style={{ width: '8%' }}>S.No</th>
                        <th style={{ width: '25%' }}>Patient Name</th>
                        <th style={{ width: '15%' }}>Patient No</th>
                        <th style={{ width: '10%' }}>Age</th>
                        <th style={{ width: '22%' }}>Address</th>
                        <th style={{ width: '20%' }}>Admission Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {femalePatients.map((patient) => (
                        <tr key={patient.slNo}>
                          <td className="text-center">{patient.slNo}</td>
                          <td>{patient.patientName}</td>
                          <td>{patient.patientNo}</td>
                          <td className="text-center">{patient.age}</td>
                          <td>{patient.address}</td>
                          <td>{patient.admissionDate}</td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              </Card.Body>
            </Card>
          </Tab>
        </Tabs>
      )}
    </Container>
  );
}
