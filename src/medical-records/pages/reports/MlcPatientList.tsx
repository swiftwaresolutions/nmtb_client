import React, { useState, useMemo } from 'react';
import { Container, Card, Row, Col, Form, Button, Table, Badge } from 'react-bootstrap';
import ReportHeader from '../../components/ReportHeader';
import '../../styles/reportStyles.css';

interface IMlcPatient {
  slNo: number;
  patientName: string;
  opNo: string;
  ipNo: string;
  doaDate: string;
  doaTime: string;
  dodDate: string;
  dodTime: string;
  mlcType: string;
}

const MLC_TYPES = [
  'Road Traffic Accident',
  'Fall from Height',
  'Poisoning',
  'Drowning',
  'Burns',
  'Assault',
];

const DEMO_DATA: IMlcPatient[] = [
  {
    slNo: 1,
    patientName: 'RAJESH KUMAR',
    opNo: '559380',
    ipNo: 'IP-2026-00876',
    doaDate: '2026-01-05',
    doaTime: '14:30',
    dodDate: '2026-01-09',
    dodTime: '10:15',
    mlcType: 'Road Traffic Accident',
  },
  {
    slNo: 2,
    patientName: 'PRIYA SINGH',
    opNo: '560069',
    ipNo: 'IP-2026-00887',
    doaDate: '2026-01-05',
    doaTime: '09:45',
    dodDate: '2026-01-12',
    dodTime: '11:30',
    mlcType: 'Road Traffic Accident',
  },
  {
    slNo: 3,
    patientName: 'MOHIT PATEL',
    opNo: '501471',
    ipNo: 'IP-2026-00898',
    doaDate: '2026-01-05',
    doaTime: '16:20',
    dodDate: '2026-01-06',
    dodTime: '08:00',
    mlcType: 'Fall from Height',
  },
  {
    slNo: 4,
    patientName: 'ANITA DESAI',
    opNo: '552862',
    ipNo: 'IP-2026-00909',
    doaDate: '2026-01-05',
    doaTime: '18:15',
    dodDate: '2026-01-10',
    dodTime: '14:45',
    mlcType: 'Road Traffic Accident',
  },
  {
    slNo: 5,
    patientName: 'VIKRAM SINGH',
    opNo: '547039',
    ipNo: 'IP-2026-00910',
    doaDate: '2026-01-05',
    doaTime: '12:00',
    dodDate: '2026-01-07',
    dodTime: '16:30',
    mlcType: 'Poisoning',
  },
  {
    slNo: 6,
    patientName: 'SUGANTHI',
    opNo: '550786',
    ipNo: 'IP-2026-00921',
    doaDate: '2026-01-05',
    doaTime: '10:30',
    dodDate: '2026-01-12',
    dodTime: '09:00',
    mlcType: 'Fall from Height',
  },
  {
    slNo: 7,
    patientName: 'KANSAL FATHIMA',
    opNo: '567505',
    ipNo: 'IP-2026-00932',
    doaDate: '2026-01-05',
    doaTime: '15:45',
    dodDate: '2026-01-08',
    dodTime: '12:20',
    mlcType: 'Burns',
  },
  {
    slNo: 8,
    patientName: 'MALLIKA',
    opNo: '566910',
    ipNo: 'IP-2026-00943',
    doaDate: '2026-01-05',
    doaTime: '13:15',
    dodDate: '2026-01-12',
    dodTime: '18:45',
    mlcType: 'Drowning',
  },
  {
    slNo: 9,
    patientName: 'UVARI ANTHONYAMMAL',
    opNo: '504236',
    ipNo: 'IP-2026-00954',
    doaDate: '2026-01-05',
    doaTime: '11:00',
    dodDate: '2026-01-14',
    dodTime: '10:30',
    mlcType: 'Road Traffic Accident',
  },
  {
    slNo: 10,
    patientName: 'INDHURANI',
    opNo: '551263',
    ipNo: 'IP-2026-00965',
    doaDate: '2026-01-05',
    doaTime: '17:30',
    dodDate: '2026-01-09',
    dodTime: '15:00',
    mlcType: 'Assault',
  },
  {
    slNo: 11,
    patientName: 'A. PUJA',
    opNo: '506586',
    ipNo: 'IP-2026-00976',
    doaDate: '2026-01-05',
    doaTime: '08:45',
    dodDate: '2026-01-14',
    dodTime: '13:15',
    mlcType: 'Poisoning',
  },
  {
    slNo: 12,
    patientName: 'MANIYAMMAL',
    opNo: '560567',
    ipNo: 'IP-2026-00987',
    doaDate: '2026-01-05',
    doaTime: '14:00',
    dodDate: '2026-01-14',
    dodTime: '11:45',
    mlcType: 'Road Traffic Accident',
  },
  {
    slNo: 13,
    patientName: 'NAGAJOTHY',
    opNo: '530505',
    ipNo: 'IP-2026-00998',
    doaDate: '2026-01-05',
    doaTime: '09:15',
    dodDate: '2026-01-12',
    dodTime: '16:20',
    mlcType: 'Burns',
  },
];

export default function MlcPatientList() {
  const [selectedMlcType, setSelectedMlcType] = useState<string>('Road Traffic Accident');
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  const filteredData = useMemo(() => {
    if (!isSubmitted || !selectedMlcType) return [];
    return DEMO_DATA.filter((patient) => patient.mlcType === selectedMlcType);
  }, [selectedMlcType, isSubmitted]);

  const handleSubmit = () => {
    if (selectedMlcType) {
      setIsSubmitted(true);
    }
  };

  const handleReset = () => {
    setSelectedMlcType('Road Traffic Accident');
    setIsSubmitted(false);
  };

  const getMlcBadgeColor = (mlcType: string): string => {
    const colors: Record<string, string> = {
      'Road Traffic Accident': 'danger',
      'Fall from Height': 'warning',
      Poisoning: 'info',
      Drowning: 'dark',
      Burns: 'secondary',
      Assault: 'danger',
    };
    return colors[mlcType] || 'primary';
  };

  return (
    <Container fluid className="py-4">
      <ReportHeader
        title="List of MLC Patients"
        subtitle="Medico-Legal Case Patient Details"
      />

      <Card className="mb-4 shadow-sm">
        <Card.Body>
          <Row className="mb-3">
            <Col md={6}>
              <Form.Group>
                <Form.Label className="fw-bold">MLC List</Form.Label>
                <Form.Select
                  value={selectedMlcType}
                  onChange={(e) => setSelectedMlcType(e.target.value)}
                >
                  {MLC_TYPES.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </Form.Select>
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

      {isSubmitted && selectedMlcType && (
        <>
          <Row className="mb-3">
            <Col md={12}>
              <h5 className="mb-2">
                List of MLC patients -{' '}
                <span style={{ color: '#000080' }}>
                  <strong>{selectedMlcType}</strong>
                </span>
              </h5>
              <Badge bg={getMlcBadgeColor(selectedMlcType)} className="fs-6">
                Total Records: {filteredData.length}
              </Badge>
            </Col>
          </Row>

          <div className="table-responsive mb-4">
            <Table striped bordered hover className="reportTable">
              <thead className="table-dark">
                <tr>
                  <th style={{ width: '5%' }}>S.No</th>
                  <th style={{ width: '20%' }}>Patient Name</th>
                  <th style={{ width: '15%' }}>OP No.</th>
                  <th style={{ width: '15%' }}>IP No.</th>
                  <th style={{ width: '18%' }}>DOA/Time</th>
                  <th style={{ width: '18%' }}>DOD/Time</th>
                </tr>
              </thead>
              <tbody>
                {filteredData.length > 0 ? (
                  filteredData.map((patient, index) => (
                    <tr key={index}>
                      <td className="text-center">{patient.slNo}</td>
                      <td>{patient.patientName}</td>
                      <td>{patient.opNo}</td>
                      <td className="text-center">{patient.ipNo}</td>
                      <td className="text-center">
                        {patient.doaDate} / {patient.doaTime}
                      </td>
                      <td className="text-center">
                        {patient.dodDate} / {patient.dodTime}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="text-center text-muted py-4">
                      No records found for the selected MLC type.
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
