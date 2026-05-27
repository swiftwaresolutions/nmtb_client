import React, { useState, useMemo } from 'react';
import { Container, Card, Row, Col, Form, Button, Table, Badge, Tabs, Tab } from 'react-bootstrap';
import ReportHeader from '../../components/ReportHeader';
import '../../styles/reportStyles.css';

interface IPatient {
  slNo: number;
  patientName: string;
  patientNo: string;
  opNo: string;
  sex: string;
  doa: string;
  dod: string;
}

interface IChapterBlock {
  chapterId: number;
  chapterName: string;
  chapterCode: string;
  blockId: number;
  blockName: string;
  blockCode: string;
  patientCount: number;
}

interface IDisease {
  diseaseId: number;
  diseaseName: string;
  diseaseCode: string;
  patientCount: number;
}

interface ISubDisease {
  subDiseaseId: number;
  subDiseaseName: string;
  subDiseaseCode: string;
  patientCount: number;
}

const CHAPTER_BLOCKS_DATA: IChapterBlock[] = [
  {
    chapterId: 1,
    chapterName: 'Certain Infectious and Parasitic Diseases',
    chapterCode: 'A00-B99',
    blockId: 1,
    blockName: 'Cholera, Typhoid and Paratyphoid',
    blockCode: 'A00-A03',
    patientCount: 12,
  },
  {
    chapterId: 1,
    chapterName: 'Certain Infectious and Parasitic Diseases',
    chapterCode: 'A00-B99',
    blockId: 2,
    blockName: 'Bacterial Infections',
    blockCode: 'A04-A49',
    patientCount: 18,
  },
  {
    chapterId: 2,
    chapterName: 'Neoplasms',
    chapterCode: 'C00-D49',
    blockId: 3,
    blockName: 'Malignant Neoplasms',
    blockCode: 'C00-C97',
    patientCount: 25,
  },
  {
    chapterId: 2,
    chapterName: 'Neoplasms',
    chapterCode: 'C00-D49',
    blockId: 4,
    blockName: 'In Situ Neoplasms',
    blockCode: 'D00-D09',
    patientCount: 8,
  },
  {
    chapterId: 3,
    chapterName: 'Diseases of the Blood',
    chapterCode: 'D50-D89',
    blockId: 5,
    blockName: 'Anaemias',
    blockCode: 'D50-D64',
    patientCount: 15,
  },
];

const DISEASES_DATA: IDisease[] = [
  {
    diseaseId: 1,
    diseaseName: 'Cholera',
    diseaseCode: 'A00',
    patientCount: 5,
  },
  {
    diseaseId: 2,
    diseaseName: 'Typhoid Fever',
    diseaseCode: 'A01',
    patientCount: 7,
  },
  {
    diseaseId: 3,
    diseaseName: 'Salmonellosis',
    diseaseCode: 'A02',
    patientCount: 6,
  },
  {
    diseaseId: 4,
    diseaseName: 'Streptococcal Infection',
    diseaseCode: 'A04',
    patientCount: 8,
  },
  {
    diseaseId: 5,
    diseaseName: 'Shigellosis',
    diseaseCode: 'A05',
    patientCount: 10,
  },
];

const SUB_DISEASES_DATA: ISubDisease[] = [
  {
    subDiseaseId: 1,
    subDiseaseName: 'Cholera due to Vibrio cholerae O1',
    subDiseaseCode: 'A00.0',
    patientCount: 3,
  },
  {
    subDiseaseId: 2,
    subDiseaseName: 'Cholera due to Vibrio cholerae O139',
    subDiseaseCode: 'A00.1',
    patientCount: 2,
  },
  {
    subDiseaseId: 3,
    subDiseaseName: 'Typhoid Fever Uncomplicated',
    subDiseaseCode: 'A01.0',
    patientCount: 4,
  },
  {
    subDiseaseId: 4,
    subDiseaseName: 'Typhoid Fever with complications',
    subDiseaseCode: 'A01.1',
    patientCount: 3,
  },
];

const PATIENTS_DATA: IPatient[] = [
  {
    slNo: 1,
    patientName: 'RAJESH KUMAR',
    patientNo: '559380',
    opNo: 'OP-2026-00145',
    sex: 'M',
    doa: '2026-01-05',
    dod: '2026-01-09',
  },
  {
    slNo: 2,
    patientName: 'PRIYA SINGH',
    patientNo: '560069',
    opNo: 'OP-2026-00156',
    sex: 'F',
    doa: '2026-01-05',
    dod: '2026-01-12',
  },
  {
    slNo: 3,
    patientName: 'MOHIT PATEL',
    patientNo: '501471',
    opNo: 'OP-2026-00167',
    sex: 'M',
    doa: '2026-01-05',
    dod: '2026-01-06',
  },
  {
    slNo: 4,
    patientName: 'ANITA DESAI',
    patientNo: '552862',
    opNo: 'OP-2026-00178',
    sex: 'F',
    doa: '2026-01-05',
    dod: '2026-01-10',
  },
  {
    slNo: 5,
    patientName: 'VIKRAM SINGH',
    patientNo: '547039',
    opNo: 'OP-2026-00189',
    sex: 'M',
    doa: '2026-01-05',
    dod: '2026-01-07',
  },
];

export default function IcdCodeWiseReport() {
  const [activeTab, setActiveTab] = useState<string>('chapter-block');
  const [selectedChapter, setSelectedChapter] = useState<number>(1);
  const [selectedDisease, setSelectedDisease] = useState<number>(1);

  const uniqueChapters = useMemo(() => {
    const chapters: Record<number, { name: string; code: string }> = {};
    CHAPTER_BLOCKS_DATA.forEach((item) => {
      if (!chapters[item.chapterId]) {
        chapters[item.chapterId] = {
          name: item.chapterName,
          code: item.chapterCode,
        };
      }
    });
    return Object.entries(chapters).map(([id, data]) => ({
      id: parseInt(id),
      ...data,
    }));
  }, []);

  const selectedChapterData = useMemo(() => {
    return CHAPTER_BLOCKS_DATA.filter((item) => item.chapterId === selectedChapter);
  }, [selectedChapter]);

  const selectedChapterInfo = useMemo(() => {
    return CHAPTER_BLOCKS_DATA.find((item) => item.chapterId === selectedChapter);
  }, [selectedChapter]);

  const selectedDiseaseData = useMemo(() => {
    return DISEASES_DATA.find((item) => item.diseaseId === selectedDisease);
  }, [selectedDisease]);

  const totalChapterPatients = useMemo(() => {
    return selectedChapterData.reduce((sum, item) => sum + item.patientCount, 0);
  }, [selectedChapterData]);

  const handleBlockNameClick = (chapterId: number) => {
    setSelectedChapter(chapterId);
    setActiveTab('disease');
  };

  const handleDiseaseNameClick = () => {
    setActiveTab('block-code');
  };

  const handleSubDiseaseNameClick = () => {
    setActiveTab('patients');
  };

  return (
    <Container fluid className="py-4">
      <ReportHeader
        title="ICD Code Chapter & Block Wise Report"
        subtitle="Hierarchical Disease Classification Report"
      />

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k || 'chapter-block')}
        className="mb-4"
      >
        {/* Chapter & Block Summary */}
        <Tab eventKey="chapter-block" title="Chapter & Block Summary">
          <Card className="mt-3">
            <Card.Header className="bg-dark text-white">
              <h5 className="mb-0">ICD Code Chapter & Block Wise Report</h5>
            </Card.Header>
            <Card.Body>
              <div className="table-responsive">
                <Table striped bordered hover>
                  <thead className="table-dark">
                    <tr>
                      <th style={{ width: '35%' }}>Chapter Name</th>
                      <th style={{ width: '25%' }}>Block Name</th>
                      <th style={{ width: '15%' }} className="text-center">
                        Block Code
                      </th>
                      <th style={{ width: '15%' }} className="text-center">
                        No of Patients
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {CHAPTER_BLOCKS_DATA.map((item, idx) => (
                      <tr key={idx}>
                        <td>
                          <strong>{item.chapterName}</strong>
                          <br />
                          <small className="text-muted">{item.chapterCode}</small>
                        </td>
                        <td>
                          <a
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handleBlockNameClick(item.chapterId);
                            }}
                            style={{
                              cursor: 'pointer',
                              color: '#0066cc',
                              textDecoration: 'none',
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.textDecoration = 'underline';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.textDecoration = 'none';
                            }}
                          >
                            {item.blockName}
                          </a>
                        </td>
                        <td className="text-center">{item.blockCode}</td>
                        <td className="text-center">
                          <Badge bg="primary">{item.patientCount}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Tab>

        {/* Disease Wise Report */}
        <Tab eventKey="disease" title="Disease Wise Report">
          <Card className="mt-3">
            <Card.Header className="bg-dark text-white">
              <h5 className="mb-0">Disease Wise Classification Report</h5>
            </Card.Header>
            <Card.Body>
              <Row className="mb-3">
                <Col md={6}>
                  <Form.Group>
                    <Form.Label className="fw-bold">Select Chapter</Form.Label>
                    <Form.Select
                      value={selectedChapter}
                      onChange={(e) => setSelectedChapter(Number(e.target.value))}
                    >
                      {uniqueChapters.map((chapter) => (
                        <option key={chapter.id} value={chapter.id}>
                          {chapter.name} ({chapter.code})
                        </option>
                      ))}
                    </Form.Select>
                  </Form.Group>
                </Col>
              </Row>

              {selectedChapterInfo && (
                <Card className="mb-3 bg-light">
                  <Card.Body>
                    <Row>
                      <Col md={6}>
                        <p>
                          <strong>Chapter:</strong>{' '}
                          {selectedChapterInfo.chapterName}
                        </p>
                      </Col>
                      <Col md={6}>
                        <p>
                          <strong>Total Patients:</strong>{' '}
                          <Badge bg="info">{totalChapterPatients}</Badge>
                        </p>
                      </Col>
                    </Row>
                  </Card.Body>
                </Card>
              )}

              <h6 className="fw-bold mb-3">Diseases in Selected Chapter</h6>
              <div className="table-responsive">
                <Table striped bordered hover size="sm">
                  <thead className="table-dark">
                    <tr>
                      <th style={{ width: '65%' }}>Disease Name</th>
                      <th style={{ width: '15%' }}>Disease Code</th>
                      <th style={{ width: '20%' }} className="text-center">
                        No of Patients
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {DISEASES_DATA.slice(0, 3).map((disease, idx) => (
                      <tr key={idx}>
                        <td>
                          <a
                            href="#"
                            onClick={(e) => {
                              e.preventDefault();
                              handleDiseaseNameClick();
                            }}
                            style={{
                              cursor: 'pointer',
                              color: '#0066cc',
                              textDecoration: 'none',
                            }}
                            onMouseOver={(e) => {
                              e.currentTarget.style.textDecoration = 'underline';
                            }}
                            onMouseOut={(e) => {
                              e.currentTarget.style.textDecoration = 'none';
                            }}
                          >
                            {disease.diseaseName}
                          </a>
                        </td>
                        <td>{disease.diseaseCode}</td>
                        <td className="text-center">
                          <Badge bg="success">{disease.patientCount}</Badge>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Tab>

        {/* Block Code Wise Report */}
        <Tab eventKey="block-code" title="Block Code Wise Report">
          <Card className="mt-3">
            <Card.Header className="bg-dark text-white">
              <h5 className="mb-0">Block Code Wise Report</h5>
            </Card.Header>
            <Card.Body>
              {selectedChapterInfo && (
                <>
                  <Card className="mb-3 bg-light">
                    <Card.Body>
                      <Row className="mb-2">
                        <Col md={12}>
                          <p>
                            <strong>Chapter Name:</strong>{' '}
                            <span style={{ color: '#446D99' }}>
                              {selectedChapterInfo.chapterName}{' '}
                              {selectedChapterInfo.chapterCode}
                            </span>
                          </p>
                        </Col>
                      </Row>
                      <Row>
                        <Col md={12}>
                          <p>
                            <strong>Block Code Name:</strong>{' '}
                            <span style={{ color: '#446D99' }}>
                              {selectedChapterInfo.blockName}{' '}
                              {selectedChapterInfo.blockCode}
                            </span>
                          </p>
                        </Col>
                      </Row>
                    </Card.Body>
                  </Card>

                  <h6 className="fw-bold mb-3">Sub-Diseases in Block</h6>
                  <div className="table-responsive">
                    <Table striped bordered hover size="sm">
                      <thead className="table-dark">
                        <tr>
                          <th style={{ width: '70%' }}>Sub-Disease Name</th>
                          <th style={{ width: '15%' }}>Code</th>
                          <th style={{ width: '15%' }} className="text-center">
                            Patients
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {SUB_DISEASES_DATA.map((subDisease, idx) => (
                          <tr key={idx}>
                            <td>
                              <a
                                href="#"
                                onClick={(e) => {
                                  e.preventDefault();
                                  handleSubDiseaseNameClick();
                                }}
                                style={{
                                  cursor: 'pointer',
                                  color: '#0066cc',
                                  textDecoration: 'none',
                                }}
                                onMouseOver={(e) => {
                                  e.currentTarget.style.textDecoration = 'underline';
                                }}
                                onMouseOut={(e) => {
                                  e.currentTarget.style.textDecoration = 'none';
                                }}
                              >
                                {subDisease.subDiseaseName}
                              </a>
                            </td>
                            <td>{subDisease.subDiseaseCode}</td>
                            <td className="text-center">
                              <Badge bg="warning" text="dark">
                                {subDisease.patientCount}
                              </Badge>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </Table>
                  </div>
                </>
              )}
            </Card.Body>
          </Card>
        </Tab>

        {/* Patient Details */}
        <Tab eventKey="patients" title="Patient Details">
          <Card className="mt-3">
            <Card.Header className="bg-dark text-white">
              <h5 className="mb-0">Patient Details by Sub-Disease Code</h5>
            </Card.Header>
            <Card.Body>
              <Card className="mb-3 bg-light">
                <Card.Body>
                  <Row>
                    <Col md={6}>
                      <p>
                        <strong>Sub-Disease:</strong> Cholera due to Vibrio
                        cholerae O1
                      </p>
                    </Col>
                    <Col md={6}>
                      <p>
                        <strong>Code:</strong> A00.0
                      </p>
                    </Col>
                  </Row>
                </Card.Body>
              </Card>

              <h6 className="fw-bold mb-3">Patient List</h6>
              <div className="table-responsive">
                <Table striped bordered hover size="sm">
                  <thead className="table-dark">
                    <tr>
                      <th style={{ width: '8%' }}>S.No</th>
                      <th style={{ width: '28%' }}>Patient Name</th>
                      <th style={{ width: '15%' }}>Patient No</th>
                      <th style={{ width: '12%' }}>OP No</th>
                      <th style={{ width: '10%' }}>Sex</th>
                      <th style={{ width: '13%' }}>DOA</th>
                      <th style={{ width: '14%' }}>DOD</th>
                    </tr>
                  </thead>
                  <tbody>
                    {PATIENTS_DATA.map((patient) => (
                      <tr key={patient.slNo}>
                        <td className="text-center">{patient.slNo}</td>
                        <td>{patient.patientName}</td>
                        <td>{patient.patientNo}</td>
                        <td>{patient.opNo}</td>
                        <td className="text-center">
                          {patient.sex === 'M' ? (
                            <Badge bg="primary">Male</Badge>
                          ) : (
                            <Badge bg="danger">Female</Badge>
                          )}
                        </td>
                        <td className="text-center">{patient.doa}</td>
                        <td className="text-center">{patient.dod}</td>
                      </tr>
                    ))}
                  </tbody>
                </Table>
              </div>
            </Card.Body>
          </Card>
        </Tab>
      </Tabs>
    </Container>
  );
}
