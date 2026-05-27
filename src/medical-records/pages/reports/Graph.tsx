import React, { useMemo, useState } from 'react';
import { Badge, Button, Card, Col, Container, Form, Nav, Row } from 'react-bootstrap';
import ReportHeader from '../../components/ReportHeader';
import { showValidationError } from '../../../utils/alertUtil';

type GraphTab =
  | 'department-op'
  | 'doctor-op'
  | 'general-op'
  | 'department-ip'
  | 'doctor-ip'
  | 'general-ip'
  | 'doctor-comparision';

interface NamedOption {
  id: number;
  name: string;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const departmentOptions: NamedOption[] = [
  { id: 1, name: 'General Medicine' },
  { id: 2, name: 'Orthopedics' },
  { id: 3, name: 'Pediatrics' },
  { id: 4, name: 'ENT' },
  { id: 5, name: 'Gynecology' },
  { id: 6, name: 'Cardiology' }
];

const doctorOptions: NamedOption[] = [
  { id: 1, name: 'Dr. Ravi Kumar' },
  { id: 2, name: 'Dr. Priya Nair' },
  { id: 3, name: 'Dr. Arun Das' },
  { id: 4, name: 'Dr. Leela Devi' },
  { id: 5, name: 'Dr. Manoj Singh' }
];

function hashSeed(...values: number[]) {
  return values.reduce((acc, value, index) => {
    return (acc * 31 + (value + 11) * (index + 5)) % 100000;
  }, 7);
}

export default function Graph() {
  const currentYear = new Date().getFullYear();
  const [activeTab, setActiveTab] = useState<GraphTab>('department-op');

  const yearOptions = useMemo(() => {
    const years: number[] = [];
    for (let year = 1998; year <= 2060; year++) {
      years.push(year);
    }
    return years;
  }, []);

  const [departmentId, setDepartmentId] = useState<number>(0);
  const [selectedYear, setSelectedYear] = useState<number>(currentYear);
  const [departmentGraphData, setDepartmentGraphData] = useState<number[]>([]);

  const [doctorOpId, setDoctorOpId] = useState<number>(0);
  const [doctorOpYear, setDoctorOpYear] = useState<number>(currentYear);
  const [doctorOpGraphData, setDoctorOpGraphData] = useState<number[]>([]);

  const [generalOpYear, setGeneralOpYear] = useState<number>(currentYear);
  const [generalOpGraphData, setGeneralOpGraphData] = useState<number[]>([]);

  const [departmentIpId, setDepartmentIpId] = useState<number>(departmentOptions[0].id);
  const [departmentIpYear, setDepartmentIpYear] = useState<number>(currentYear);
  const [departmentIpGraphData, setDepartmentIpGraphData] = useState<number[]>([]);

  const [doctorIpId, setDoctorIpId] = useState<number>(doctorOptions[0].id);
  const [doctorIpYear, setDoctorIpYear] = useState<number>(currentYear);
  const [doctorIpGraphData, setDoctorIpGraphData] = useState<number[]>([]);

  const [generalIpYear, setGeneralIpYear] = useState<number>(currentYear);
  const [generalIpGraphData, setGeneralIpGraphData] = useState<number[]>([]);

  const [comparisonDoctorAId, setComparisonDoctorAId] = useState<number>(doctorOptions[0].id);
  const [comparisonDoctorBId, setComparisonDoctorBId] = useState<number>(doctorOptions[1].id);
  const [comparisonYear, setComparisonYear] = useState<number>(currentYear);
  const [comparisonDoctorAData, setComparisonDoctorAData] = useState<number[]>([]);
  const [comparisonDoctorBData, setComparisonDoctorBData] = useState<number[]>([]);

  const selectedDepartment =
    departmentOptions.find((department) => department.id === departmentId)?.name || '';

  const selectedDoctorOp = doctorOptions.find((doctor) => doctor.id === doctorOpId)?.name || '';
  const selectedDepartmentIp = departmentOptions.find((department) => department.id === departmentIpId)?.name || '';
  const selectedDoctorIp = doctorOptions.find((doctor) => doctor.id === doctorIpId)?.name || '';
  const selectedComparisonDoctorA = doctorOptions.find((doctor) => doctor.id === comparisonDoctorAId)?.name || '';
  const selectedComparisonDoctorB = doctorOptions.find((doctor) => doctor.id === comparisonDoctorBId)?.name || '';

  const maxValue = Math.max(...departmentGraphData, 1);

  const buildMonthlyGraphData = (seedA: number, seedB: number) => {
    return MONTHS.map((_, monthIndex) => {
      const seed = hashSeed(seedA, seedB, monthIndex + 1);
      return (seed % 180) + 20;
    });
  };

  const renderMonthlyBars = (data: number[], barClassName = 'bg-primary') => {
    const currentMax = Math.max(...data, 1);

    return (
      <div className="d-flex align-items-end justify-content-between gap-2" style={{ minHeight: '280px' }}>
        {data.map((value, index) => {
          const barHeight = Math.max((value / currentMax) * 220, 4);
          return (
            <div key={`${MONTHS[index]}-${value}-${barClassName}`} className="d-flex flex-column align-items-center flex-fill">
              <div className="fw-semibold mb-1">{value}</div>
              <div className={`${barClassName} rounded-top w-100`} style={{ height: `${barHeight}px`, maxWidth: '44px' }} />
              <div className="mt-2 fw-semibold text-danger">{MONTHS[index]}</div>
            </div>
          );
        })}
      </div>
    );
  };

  const handleDepartmentSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (departmentId === 0) {
      showValidationError('Please select Department Name');
      return;
    }

    const counts = MONTHS.map((_, monthIndex) => {
      const seed = hashSeed(selectedYear, departmentId, monthIndex + 1);
      return (seed % 180) + 20;
    });

    setDepartmentGraphData(counts);
  };

  const handleDoctorOpSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (doctorOpId === 0) {
      showValidationError('Please select Doctor Name');
      return;
    }

    setDoctorOpGraphData(buildMonthlyGraphData(doctorOpYear, doctorOpId + 100));
  };

  const handleGeneralOpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralOpGraphData(buildMonthlyGraphData(generalOpYear, 500));
  };

  const handleDepartmentIpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDepartmentIpGraphData(buildMonthlyGraphData(departmentIpYear, departmentIpId + 700));
  };

  const handleDoctorIpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setDoctorIpGraphData(buildMonthlyGraphData(doctorIpYear, doctorIpId + 900));
  };

  const handleGeneralIpSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setGeneralIpGraphData(buildMonthlyGraphData(generalIpYear, 1100));
  };

  const handleDoctorComparisionSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (comparisonDoctorAId === comparisonDoctorBId) {
      showValidationError('Please select two different doctors for comparison');
      return;
    }

    setComparisonDoctorAData(buildMonthlyGraphData(comparisonYear, comparisonDoctorAId + 1300));
    setComparisonDoctorBData(buildMonthlyGraphData(comparisonYear, comparisonDoctorBId + 1500));
  };

  return (
    <Container fluid className="py-4">
      <ReportHeader title="Graph" subtitle="Graphical reports" />

      <Card className="shadow-sm border-0">
        <Card.Body className="pb-0">
          <Nav variant="tabs" activeKey={activeTab}>
            <Nav.Item>
              <Nav.Link eventKey="department-op" onClick={() => setActiveTab('department-op')}>
                1. Department [OP]
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="doctor-op" onClick={() => setActiveTab('doctor-op')}>
                2. Doctor [OP]
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="general-op" onClick={() => setActiveTab('general-op')}>
                3. General [OP]
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="department-ip" onClick={() => setActiveTab('department-ip')}>
                4. Department [IP]
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="doctor-ip" onClick={() => setActiveTab('doctor-ip')}>
                5. Doctor [IP]
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="general-ip" onClick={() => setActiveTab('general-ip')}>
                6. General [IP]
              </Nav.Link>
            </Nav.Item>
            <Nav.Item>
              <Nav.Link eventKey="doctor-comparision" onClick={() => setActiveTab('doctor-comparision')}>
                7. Doctor Comparision
              </Nav.Link>
            </Nav.Item>
          </Nav>
        </Card.Body>

        <Card.Body>
          {activeTab === 'department-op' && (
            <>
              <Card className="border-0 shadow-sm mb-3">
                <Card.Header className="bg-light fw-semibold">Department wise Out-Patient Graphical Report</Card.Header>
                <Card.Body>
                  <Form onSubmit={handleDepartmentSubmit}>
                    <Row className="g-3 align-items-end">
                      <Col md={5}>
                        <Form.Group>
                          <Form.Label>Department Name</Form.Label>
                          <Form.Select value={departmentId} onChange={(e) => setDepartmentId(Number(e.target.value))}>
                            <option value={0}>Select</option>
                            {departmentOptions.map((department) => (
                              <option key={department.id} value={department.id}>
                                {department.name}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={5}>
                        <Form.Group>
                          <Form.Label>Select the Year</Form.Label>
                          <Form.Select value={selectedYear} onChange={(e) => setSelectedYear(Number(e.target.value))}>
                            {yearOptions.map((year) => (
                              <option key={year} value={year}>
                                {year}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={2} className="d-grid">
                        <Button type="submit">Submit</Button>
                      </Col>
                    </Row>
                  </Form>
                </Card.Body>
              </Card>

              {departmentGraphData.length > 0 && (
                <Card className="border-0 shadow-sm">
                  <Card.Header className="d-flex justify-content-between align-items-center bg-light">
                    <span className="fw-semibold">Department wise Out Patient Graphical Report</span>
                    <Button variant="outline-primary" size="sm" onClick={() => window.print()}>
                      Print
                    </Button>
                  </Card.Header>
                  <Card.Body>
                    <Row className="mb-3 g-3">
                      <Col md={6}>
                        <Badge bg="light" text="dark" className="border">
                          Year: {selectedYear}
                        </Badge>
                      </Col>
                      <Col md={6} className="text-md-end">
                        <Badge bg="secondary">Department Name: {selectedDepartment}</Badge>
                      </Col>
                    </Row>

                    {renderMonthlyBars(departmentGraphData)}
                  </Card.Body>
                </Card>
              )}
            </>
          )}

          {activeTab === 'doctor-op' && (
            <>
              <Card className="border-0 shadow-sm mb-3">
                <Card.Header className="bg-light fw-semibold">Doctor wise Out-Patient Graphical Report</Card.Header>
                <Card.Body>
                  <Form onSubmit={handleDoctorOpSubmit}>
                    <Row className="g-3 align-items-end">
                      <Col md={5}>
                        <Form.Group>
                          <Form.Label>Doctor Name</Form.Label>
                          <Form.Select value={doctorOpId} onChange={(e) => setDoctorOpId(Number(e.target.value))}>
                            <option value={0}>Select</option>
                            {doctorOptions.map((doctor) => (
                              <option key={doctor.id} value={doctor.id}>
                                {doctor.name}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={5}>
                        <Form.Group>
                          <Form.Label>Select the Year</Form.Label>
                          <Form.Select value={doctorOpYear} onChange={(e) => setDoctorOpYear(Number(e.target.value))}>
                            {yearOptions.map((year) => (
                              <option key={`doctor-op-${year}`} value={year}>
                                {year}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={2} className="d-grid">
                        <Button type="submit">Submit</Button>
                      </Col>
                    </Row>
                  </Form>
                </Card.Body>
              </Card>

              {doctorOpGraphData.length > 0 && (
                <Card className="border-0 shadow-sm">
                  <Card.Header className="d-flex justify-content-between align-items-center bg-light">
                    <span className="fw-semibold">Doctor wise OutPatient Graphical Report</span>
                    <Button variant="outline-primary" size="sm" onClick={() => window.print()}>
                      Print
                    </Button>
                  </Card.Header>
                  <Card.Body>
                    <Row className="mb-3 g-3">
                      <Col md={6}>
                        <Badge bg="light" text="dark" className="border">
                          Year: {doctorOpYear}
                        </Badge>
                      </Col>
                      <Col md={6} className="text-md-end">
                        <Badge bg="secondary">Doctor Name: {selectedDoctorOp}</Badge>
                      </Col>
                    </Row>
                    {renderMonthlyBars(doctorOpGraphData, 'bg-success')}
                  </Card.Body>
                </Card>
              )}
            </>
          )}

          {activeTab === 'general-op' && (
            <>
              <Card className="border-0 shadow-sm mb-3">
                <Card.Header className="bg-light fw-semibold">General [OP] Graphical Report</Card.Header>
                <Card.Body>
                  <Form onSubmit={handleGeneralOpSubmit}>
                    <Row className="g-3 align-items-end">
                      <Col md={10}>
                        <Form.Group>
                          <Form.Label>Select the Year</Form.Label>
                          <Form.Select value={generalOpYear} onChange={(e) => setGeneralOpYear(Number(e.target.value))}>
                            {yearOptions.map((year) => (
                              <option key={`general-op-${year}`} value={year}>
                                {year}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={2} className="d-grid">
                        <Button type="submit">Submit</Button>
                      </Col>
                    </Row>
                  </Form>
                </Card.Body>
              </Card>

              {generalOpGraphData.length > 0 && (
                <Card className="border-0 shadow-sm">
                  <Card.Header className="d-flex justify-content-between align-items-center bg-light">
                    <span className="fw-semibold">General [OP] Graphical Report</span>
                    <Button variant="outline-primary" size="sm" onClick={() => window.print()}>
                      Print
                    </Button>
                  </Card.Header>
                  <Card.Body>
                    <Badge bg="light" text="dark" className="border mb-3">
                      Year: {generalOpYear}
                    </Badge>
                    {renderMonthlyBars(generalOpGraphData, 'bg-info')}
                  </Card.Body>
                </Card>
              )}
            </>
          )}

          {activeTab === 'department-ip' && (
            <>
              <Card className="border-0 shadow-sm mb-3">
                <Card.Header className="bg-light fw-semibold">Department wise In-Patient Graphical Report</Card.Header>
                <Card.Body>
                  <Form onSubmit={handleDepartmentIpSubmit}>
                    <Row className="g-3 align-items-end">
                      <Col md={5}>
                        <Form.Group>
                          <Form.Label>Department Name</Form.Label>
                          <Form.Select value={departmentIpId} onChange={(e) => setDepartmentIpId(Number(e.target.value))}>
                            {departmentOptions.map((department) => (
                              <option key={`ip-${department.id}`} value={department.id}>
                                {department.name}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={5}>
                        <Form.Group>
                          <Form.Label>Select the Year</Form.Label>
                          <Form.Select value={departmentIpYear} onChange={(e) => setDepartmentIpYear(Number(e.target.value))}>
                            {yearOptions.map((year) => (
                              <option key={`department-ip-${year}`} value={year}>
                                {year}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={2} className="d-grid">
                        <Button type="submit">Submit</Button>
                      </Col>
                    </Row>
                  </Form>
                </Card.Body>
              </Card>

              {departmentIpGraphData.length > 0 && (
                <Card className="border-0 shadow-sm">
                  <Card.Header className="d-flex justify-content-between align-items-center bg-light">
                    <span className="fw-semibold">Department wise In Patient Graphical Report</span>
                    <Button variant="outline-primary" size="sm" onClick={() => window.print()}>
                      Print
                    </Button>
                  </Card.Header>
                  <Card.Body>
                    <Row className="mb-3 g-3">
                      <Col md={6}>
                        <Badge bg="light" text="dark" className="border">
                          Year: {departmentIpYear}
                        </Badge>
                      </Col>
                      <Col md={6} className="text-md-end">
                        <Badge bg="secondary">Department Name: {selectedDepartmentIp}</Badge>
                      </Col>
                    </Row>
                    {renderMonthlyBars(departmentIpGraphData, 'bg-warning')}
                  </Card.Body>
                </Card>
              )}
            </>
          )}

          {activeTab === 'doctor-ip' && (
            <>
              <Card className="border-0 shadow-sm mb-3">
                <Card.Header className="bg-light fw-semibold">Doctor wise In-Patient Graphical Report</Card.Header>
                <Card.Body>
                  <Form onSubmit={handleDoctorIpSubmit}>
                    <Row className="g-3 align-items-end">
                      <Col md={5}>
                        <Form.Group>
                          <Form.Label>Doctor Name</Form.Label>
                          <Form.Select value={doctorIpId} onChange={(e) => setDoctorIpId(Number(e.target.value))}>
                            {doctorOptions.map((doctor) => (
                              <option key={`ip-doctor-${doctor.id}`} value={doctor.id}>
                                {doctor.name}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={5}>
                        <Form.Group>
                          <Form.Label>Select the Year</Form.Label>
                          <Form.Select value={doctorIpYear} onChange={(e) => setDoctorIpYear(Number(e.target.value))}>
                            {yearOptions.map((year) => (
                              <option key={`doctor-ip-${year}`} value={year}>
                                {year}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={2} className="d-grid">
                        <Button type="submit">Submit</Button>
                      </Col>
                    </Row>
                  </Form>
                </Card.Body>
              </Card>

              {doctorIpGraphData.length > 0 && (
                <Card className="border-0 shadow-sm">
                  <Card.Header className="d-flex justify-content-between align-items-center bg-light">
                    <span className="fw-semibold">Doctor wise In Patient Graphical Report</span>
                    <Button variant="outline-primary" size="sm" onClick={() => window.print()}>
                      Print
                    </Button>
                  </Card.Header>
                  <Card.Body>
                    <Row className="mb-3 g-3">
                      <Col md={6}>
                        <Badge bg="light" text="dark" className="border">
                          Year: {doctorIpYear}
                        </Badge>
                      </Col>
                      <Col md={6} className="text-md-end">
                        <Badge bg="secondary">Doctor Name: {selectedDoctorIp}</Badge>
                      </Col>
                    </Row>
                    {renderMonthlyBars(doctorIpGraphData, 'bg-danger')}
                  </Card.Body>
                </Card>
              )}
            </>
          )}

          {activeTab === 'general-ip' && (
            <>
              <Card className="border-0 shadow-sm mb-3">
                <Card.Header className="bg-light fw-semibold">General [IP] Graphical Report</Card.Header>
                <Card.Body>
                  <Form onSubmit={handleGeneralIpSubmit}>
                    <Row className="g-3 align-items-end">
                      <Col md={10}>
                        <Form.Group>
                          <Form.Label>Select the Year</Form.Label>
                          <Form.Select value={generalIpYear} onChange={(e) => setGeneralIpYear(Number(e.target.value))}>
                            {yearOptions.map((year) => (
                              <option key={`general-ip-${year}`} value={year}>
                                {year}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={2} className="d-grid">
                        <Button type="submit">Submit</Button>
                      </Col>
                    </Row>
                  </Form>
                </Card.Body>
              </Card>

              {generalIpGraphData.length > 0 && (
                <Card className="border-0 shadow-sm">
                  <Card.Header className="d-flex justify-content-between align-items-center bg-light">
                    <span className="fw-semibold">General [IP] Graphical Report</span>
                    <Button variant="outline-primary" size="sm" onClick={() => window.print()}>
                      Print
                    </Button>
                  </Card.Header>
                  <Card.Body>
                    <Badge bg="light" text="dark" className="border mb-3">
                      Year: {generalIpYear}
                    </Badge>
                    {renderMonthlyBars(generalIpGraphData, 'bg-dark')}
                  </Card.Body>
                </Card>
              )}
            </>
          )}

          {activeTab === 'doctor-comparision' && (
            <>
              <Card className="border-0 shadow-sm mb-3">
                <Card.Header className="bg-light fw-semibold">Doctor Comparision Graphical Report</Card.Header>
                <Card.Body>
                  <Form onSubmit={handleDoctorComparisionSubmit}>
                    <Row className="g-3 align-items-end">
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>Doctor A</Form.Label>
                          <Form.Select value={comparisonDoctorAId} onChange={(e) => setComparisonDoctorAId(Number(e.target.value))}>
                            {doctorOptions.map((doctor) => (
                              <option key={`comparison-a-${doctor.id}`} value={doctor.id}>
                                {doctor.name}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={4}>
                        <Form.Group>
                          <Form.Label>Doctor B</Form.Label>
                          <Form.Select value={comparisonDoctorBId} onChange={(e) => setComparisonDoctorBId(Number(e.target.value))}>
                            {doctorOptions.map((doctor) => (
                              <option key={`comparison-b-${doctor.id}`} value={doctor.id}>
                                {doctor.name}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={2}>
                        <Form.Group>
                          <Form.Label>Select the Year</Form.Label>
                          <Form.Select value={comparisonYear} onChange={(e) => setComparisonYear(Number(e.target.value))}>
                            {yearOptions.map((year) => (
                              <option key={`comparison-year-${year}`} value={year}>
                                {year}
                              </option>
                            ))}
                          </Form.Select>
                        </Form.Group>
                      </Col>
                      <Col md={2} className="d-grid">
                        <Button type="submit">Submit</Button>
                      </Col>
                    </Row>
                  </Form>
                </Card.Body>
              </Card>

              {comparisonDoctorAData.length > 0 && comparisonDoctorBData.length > 0 && (
                <Card className="border-0 shadow-sm">
                  <Card.Header className="d-flex justify-content-between align-items-center bg-light">
                    <span className="fw-semibold">Doctor Comparision Graphical Report</span>
                    <Button variant="outline-primary" size="sm" onClick={() => window.print()}>
                      Print
                    </Button>
                  </Card.Header>
                  <Card.Body>
                    <Row className="mb-3 g-3">
                      <Col md={4}><Badge bg="light" text="dark" className="border">Year: {comparisonYear}</Badge></Col>
                      <Col md={4}><Badge bg="primary">{selectedComparisonDoctorA}</Badge></Col>
                      <Col md={4} className="text-md-end"><Badge bg="success">{selectedComparisonDoctorB}</Badge></Col>
                    </Row>

                    <div className="d-flex align-items-end justify-content-between gap-2" style={{ minHeight: '280px' }}>
                      {MONTHS.map((month, index) => {
                        const maxComparison = Math.max(...comparisonDoctorAData, ...comparisonDoctorBData, 1);
                        const barA = Math.max((comparisonDoctorAData[index] / maxComparison) * 190, 4);
                        const barB = Math.max((comparisonDoctorBData[index] / maxComparison) * 190, 4);

                        return (
                          <div key={`comparison-${month}`} className="d-flex flex-column align-items-center flex-fill">
                            <div className="d-flex align-items-end justify-content-center gap-1 w-100">
                              <div className="bg-primary rounded-top" style={{ width: '16px', height: `${barA}px` }} />
                              <div className="bg-success rounded-top" style={{ width: '16px', height: `${barB}px` }} />
                            </div>
                            <div className="small mt-2 text-center">{month}</div>
                          </div>
                        );
                      })}
                    </div>
                  </Card.Body>
                </Card>
              )}
            </>
          )}
        </Card.Body>
      </Card>
    </Container>
  );
}
