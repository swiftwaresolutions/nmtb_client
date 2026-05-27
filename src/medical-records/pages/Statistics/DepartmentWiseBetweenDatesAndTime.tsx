import React, { useMemo, useState } from 'react';
import { Badge, Button, Card, Col, Container, Form, Row, Table } from 'react-bootstrap';
import ReportHeader from '../../components/ReportHeader';
import '../../styles/reportStyles.css';
import { showValidationError } from '../../../utils/alertUtil';

interface IDepartment {
  id: number;
  name: string;
}

interface IVillage {
  id: number;
  name: string;
}

interface IDeptStatisticsRow {
  id: number;
  departmentId: number;
  villageId: number;
  opNumber: string;
  patientName: string;
  tokenRefNo: string;
  visitDate: string;
  visitTime: string;
  phoneNo: string;
  address: string;
}

const DEPARTMENTS: IDepartment[] = [
  { id: -1, name: 'Select Department' },
  { id: 0, name: 'All' },
  { id: 1, name: 'General Medicine' },
  { id: 2, name: 'Orthopedics' },
  { id: 3, name: 'ENT' },
  { id: 4, name: 'Gynecology' },
  { id: 5, name: 'Cardiology' },
];

const VILLAGES: IVillage[] = [
  { id: -1, name: 'Select Village' },
  { id: 0, name: 'All' },
  { id: 1, name: 'Poovampatty' },
  { id: 2, name: 'Nilakottai' },
  { id: 3, name: 'Batlagundu' },
  { id: 4, name: 'Natham' },
  { id: 5, name: 'Ayyampalayam' },
];

const DEMO_DEPT_STATS: IDeptStatisticsRow[] = [
  {
    id: 1,
    departmentId: 1,
    villageId: 1,
    opNumber: 'OP1001',
    patientName: 'Rajan Kumar',
    tokenRefNo: 'TK-001//REF-771',
    visitDate: '2026-03-01',
    visitTime: '09:10:00',
    phoneNo: '9842210001',
    address: 'North Street, Poovampatty',
  },
  {
    id: 2,
    departmentId: 4,
    villageId: 2,
    opNumber: 'OP1002',
    patientName: 'Meena Devi',
    tokenRefNo: 'TK-002//REF-772',
    visitDate: '2026-03-01',
    visitTime: '10:25:00',
    phoneNo: '9842210002',
    address: 'Main Road, Nilakottai',
  },
  {
    id: 3,
    departmentId: 2,
    villageId: 3,
    opNumber: 'OP1003',
    patientName: 'Suresh Babu',
    tokenRefNo: 'TK-003//REF-773',
    visitDate: '2026-03-02',
    visitTime: '11:00:00',
    phoneNo: '9842210003',
    address: 'West Car Street, Batlagundu',
  },
  {
    id: 4,
    departmentId: 3,
    villageId: 4,
    opNumber: 'OP1004',
    patientName: 'Kavitha S',
    tokenRefNo: 'TK-004//REF-774',
    visitDate: '2026-03-02',
    visitTime: '11:15:00',
    phoneNo: '9842210004',
    address: 'Market Lane, Natham',
  },
  {
    id: 5,
    departmentId: 5,
    villageId: 5,
    opNumber: 'OP1005',
    patientName: 'Murugan P',
    tokenRefNo: 'TK-005//REF-775',
    visitDate: '2026-03-03',
    visitTime: '12:10:00',
    phoneNo: '9842210005',
    address: 'East Street, Ayyampalayam',
  },
  {
    id: 6,
    departmentId: 1,
    villageId: 1,
    opNumber: 'OP1006',
    patientName: 'Anitha R',
    tokenRefNo: 'TK-006//REF-776',
    visitDate: '2026-03-03',
    visitTime: '13:35:00',
    phoneNo: '9842210006',
    address: 'Temple Road, Poovampatty',
  },
  {
    id: 7,
    departmentId: 4,
    villageId: 2,
    opNumber: 'OP1007',
    patientName: 'Lavanya M',
    tokenRefNo: 'TK-007//REF-777',
    visitDate: '2026-03-03',
    visitTime: '14:05:00',
    phoneNo: '9842210007',
    address: 'South Street, Nilakottai',
  },
];

export default function DepartmentWiseBetweenDatesAndTime() {
  const today = new Date().toISOString().split('T')[0];
  const defaultFromTime = '01:00:00';
  const defaultToTime = '23:59:00';

  const [departmentId, setDepartmentId] = useState<number>(-1);
  const [villageId, setVillageId] = useState<number>(-1);
  const [villageMode, setVillageMode] = useState<'all' | 'specific'>('all');
  const [fromDate, setFromDate] = useState<string>(today);
  const [toDate, setToDate] = useState<string>(today);
  const [timeFrom, setTimeFrom] = useState<string>(defaultFromTime);
  const [timeTo, setTimeTo] = useState<string>(defaultToTime);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const selectedDepartmentName = useMemo(() => {
    const found = DEPARTMENTS.find((department) => department.id === departmentId);
    return found ? found.name : 'Unknown';
  }, [departmentId]);

  const selectedVillageName = useMemo(() => {
    if (villageMode === 'all') {
      return 'All';
    }
    const found = VILLAGES.find((village) => village.id === villageId);
    return found ? found.name : 'Unknown';
  }, [villageId, villageMode]);

  const filteredRows = useMemo(() => {
    if (!isSubmitted) {
      return [];
    }

    const fromDateTime = new Date(`${fromDate}T${timeFrom}`);
    const toDateTime = new Date(`${toDate}T${timeTo}`);

    return DEMO_DEPT_STATS.filter((row) => {
      const rowDateTime = new Date(`${row.visitDate}T${row.visitTime}`);
      const inDepartment = departmentId === 0 || row.departmentId === departmentId;
      const inVillage = villageMode === 'all' || villageId === 0 || row.villageId === villageId;
      const inDateTime = rowDateTime >= fromDateTime && rowDateTime <= toDateTime;
      return inDepartment && inVillage && inDateTime;
    });
  }, [departmentId, villageId, villageMode, fromDate, toDate, timeFrom, timeTo, isSubmitted]);

  const filteredRowsBetweenDates = useMemo(() => {
    if (!isSubmitted) {
      return [];
    }

    const from = new Date(fromDate);
    const to = new Date(toDate);

    return DEMO_DEPT_STATS.filter((row) => {
      const rowDate = new Date(row.visitDate);
      const inDepartment = departmentId === 0 || row.departmentId === departmentId;
      const inVillage = villageMode === 'all' || villageId === 0 || row.villageId === villageId;
      const inDate = rowDate >= from && rowDate <= to;
      return inDepartment && inVillage && inDate;
    });
  }, [departmentId, villageId, villageMode, fromDate, toDate, isSubmitted]);

  const handleSubmit = () => {
    if (departmentId === -1) {
      showValidationError('Please select Department Name');
      return;
    }

    if (villageMode === 'specific' && villageId === -1) {
      showValidationError('Please select Village');
      return;
    }

    const fromDateTime = new Date(`${fromDate}T${timeFrom}`);
    const toDateTime = new Date(`${toDate}T${timeTo}`);

    if (fromDateTime > toDateTime) {
      showValidationError('Date/Time From should be less than or equal to Date/Time To');
      return;
    }

    setIsSubmitted(true);
  };

  const handleReset = () => {
    setDepartmentId(-1);
    setVillageId(-1);
    setVillageMode('all');
    setFromDate(today);
    setToDate(today);
    setTimeFrom(defaultFromTime);
    setTimeTo(defaultToTime);
    setIsSubmitted(false);
  };

  return (
    <Container fluid className="py-4">
      <ReportHeader
        title="Department Statistics Between Date & Time"
        subtitle="Department-wise OP statistics report"
      />

      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Row className="g-3">
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-bold">Department Name</Form.Label>
                <Form.Select
                  value={departmentId}
                  onChange={(e) => setDepartmentId(Number(e.target.value))}
                >
                  {DEPARTMENTS.map((department) => (
                    <option key={department.id} value={department.id}>
                      {department.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-bold">Date From</Form.Label>
                <Form.Control
                  type="date"
                  value={fromDate}
                  onChange={(e) => setFromDate(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-bold">Date To</Form.Label>
                <Form.Control
                  type="date"
                  value={toDate}
                  onChange={(e) => setToDate(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-bold">Time From</Form.Label>
                <Form.Control
                  type="time"
                  step="1"
                  value={timeFrom}
                  onChange={(e) => setTimeFrom(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-bold">Time To</Form.Label>
                <Form.Control
                  type="time"
                  step="1"
                  value={timeTo}
                  onChange={(e) => setTimeTo(e.target.value)}
                />
              </Form.Group>
            </Col>
            <Col md={4}>
              <Form.Group>
                <Form.Label className="fw-bold">Village</Form.Label>
                <div className="d-flex gap-3 mb-2">
                  <Form.Check
                    type="radio"
                    id="village-all"
                    name="village-mode"
                    label="All Villages"
                    checked={villageMode === 'all'}
                    onChange={() => setVillageMode('all')}
                  />
                  <Form.Check
                    type="radio"
                    id="village-specific"
                    name="village-mode"
                    label="Select Village"
                    checked={villageMode === 'specific'}
                    onChange={() => setVillageMode('specific')}
                  />
                </div>
                <Form.Select
                  value={villageId}
                  disabled={villageMode === 'all'}
                  onChange={(e) => setVillageId(Number(e.target.value))}
                >
                  {VILLAGES.map((village) => (
                    <option key={village.id} value={village.id}>
                      {village.name}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
            </Col>
            <Col md={4} className="d-flex align-items-end gap-2">
              <Button variant="primary" className="fw-bold" onClick={handleSubmit}>
                Submit
              </Button>
              <Button variant="secondary" className="fw-bold" onClick={handleReset}>
                Reset
              </Button>
            </Col>
          </Row>
        </Card.Body>
      </Card>

      {isSubmitted && (
        <>
          <Row className="mb-3">
            <Col md={4}>
              <Badge bg="primary" className="fs-6">
                Department: {selectedDepartmentName}
              </Badge>
            </Col>
            <Col md={3}>
              <Badge bg="info" className="fs-6">
                Village: {selectedVillageName}
              </Badge>
            </Col>
            <Col md={3}>
              <Badge bg="success" className="fs-6">
                Total: {filteredRows.length}
              </Badge>
            </Col>
          </Row>

          <Row className="mb-3">
            <Col md={6}>
              <strong>Date:</strong> {fromDate} to {toDate}
            </Col>
            <Col md={6}>
              <strong>Time:</strong> {timeFrom} to {timeTo}
            </Col>
          </Row>

          <div className="table-responsive mb-4">
            <Table striped bordered hover className="reportTable">
              <thead className="table-dark">
                <tr>
                  <th style={{ width: '8%' }}>S. No</th>
                  <th style={{ width: '18%' }}>OP Number</th>
                  <th style={{ width: '30%' }}>Patient Name</th>
                  <th style={{ width: '20%' }}>Token no/ Ref No</th>
                  <th style={{ width: '12%' }}>Date</th>
                  <th style={{ width: '12%' }}>Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredRows.length > 0 ? (
                  filteredRows.map((row, index) => (
                    <tr key={row.id}>
                      <td className="text-center">{index + 1}</td>
                      <td className="text-center">{row.opNumber}</td>
                      <td>{row.patientName}</td>
                      <td className="text-center">{row.tokenRefNo}</td>
                      <td className="text-center">{row.visitDate}</td>
                      <td className="text-center">{row.visitTime}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center text-muted py-4">
                      No records found for selected department and date/time range.
                    </td>
                  </tr>
                )}
              </tbody>
            </Table>
          </div>

          <Card className="shadow-sm border-0 mb-4">
            <Card.Header className="bg-white border-bottom fw-bold">
              Department Statistics Between Dates
            </Card.Header>
            <Card.Body className="p-0">
              <div className="table-responsive">
                <Table striped bordered hover className="reportTable mb-0">
                  <thead className="table-dark">
                    <tr>
                      <th style={{ width: '10%' }}>S. No</th>
                      <th style={{ width: '20%' }}>OP Number</th>
                      <th style={{ width: '35%' }}>Patient Name</th>
                      <th style={{ width: '15%' }}>PhNo</th>
                      <th style={{ width: '20%' }}>Address</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredRowsBetweenDates.length > 0 ? (
                      filteredRowsBetweenDates.map((row, index) => (
                        <tr key={`between-dates-${row.id}`}>
                          <td className="text-center">{index + 1}</td>
                          <td className="text-center">{row.opNumber}</td>
                          <td>{row.patientName}</td>
                          <td className="text-center">{row.phoneNo}</td>
                          <td>{row.address}</td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={5} className="text-center text-muted py-4">
                          No records found for selected department, village and date range.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </>
      )}
    </Container>
  );
}
