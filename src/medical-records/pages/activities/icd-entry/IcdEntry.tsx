import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Table, Button, Badge, Spinner, InputGroup, Form, Modal, ListGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faStethoscope, faTrash, faEye } from '@fortawesome/free-solid-svg-icons';
import { MedicalRecordsApiService, PatientsICDCode } from '../../../../api/medical-records/medical-records-api-service';
import { showErrorModal, showWarningToast, showSuccessToast } from '../../../../utils/alertUtil';
import { useTableSearch } from '../../../../hooks/useTableSearch';
import PageHeader from '../../../../components/PageHeader';
import SearchInput from '../../../../components/SearchInput';

interface ActiveIpPatient {
  ipId: number;
  patId: number;
  opVisitId: number;
  opNo: string;
  ipNo: string;
  patientName: string;
  age: string;
  gender: string;
  admittedWard: string;
  roomBed: string;
  address: string;
  admitDate: string;
}

interface IcdEntry {
  id: number;
  diseaseName: string;
  diseaseCode: string;
  diseaseId: number;
  subDiseaseId: number;
  notes: string;
}

interface IcdCodeResult {
  diseaseId: number;
  diseaseCode: string;
  diseaseName: string;
  subDiseaseId: number;
  subDiseaseCode: string | null;
  subDiseaseName: string | null;
}

const IcdEntry = () => {
  const apiService = new MedicalRecordsApiService();

  const [patients, setPatients] = useState<ActiveIpPatient[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [selectedPatient, setSelectedPatient] = useState<ActiveIpPatient | null>(null);
  const [icdEntries, setIcdEntries] = useState<IcdEntry[]>([]);
  const [newIcdDiseaseName, setNewIcdDiseaseName] = useState('');
  const [newIcdDiseaseCode, setNewIcdDiseaseCode] = useState('');
  const [newIcdDiseaseId, setNewIcdDiseaseId] = useState(0);
  const [newIcdSubDiseaseId, setNewIcdSubDiseaseId] = useState(0);
  const [newIcdNotes, setNewIcdNotes] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [icdSearchResults, setIcdSearchResults] = useState<IcdCodeResult[]>([]);
  const [icdSearchLoading, setIcdSearchLoading] = useState(false);
  const [showIcdDropdown, setShowIcdDropdown] = useState(false);

  // View ICD modal state
  const [showViewModal, setShowViewModal] = useState(false);
  const [viewIcdData, setViewIcdData] = useState<PatientsICDCode[]>([]);
  const [viewIcdLoading, setViewIcdLoading] = useState(false);
  const [viewIcdPatient, setViewIcdPatient] = useState<ActiveIpPatient | null>(null);

  // Track which patients have existing ICD entries (ipId -> hasEntries)
  const [icdStatusMap, setIcdStatusMap] = useState<Record<number, boolean>>({});

  // Use the table search hook for filtering
  const { filteredData: searchedData, resultCount, totalCount } = useTableSearch({
    data: patients,
    searchFields: ['ipNo', 'patientName', 'admittedWard'],
  });

  // Fetch active IP patients on component mount
  useEffect(() => {
    fetchIpPatientsForIcdEntry();
  }, []);

  // Debounced ICD code search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (newIcdDiseaseName.trim().length >= 2) {
        searchIcdCodes(newIcdDiseaseName.trim());
      } else {
        setIcdSearchResults([]);
        setShowIcdDropdown(false);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [newIcdDiseaseName]);

  const fetchIpPatientsForIcdEntry = async () => {
    setLoading(true);
    try {
      const patientList = await apiService.fetchIpPatientsForICDEntry();
      setPatients(patientList);
      // Fetch ICD status for all patients in parallel
      if (patientList.length > 0) {
        const results = await Promise.allSettled(
          patientList.map((p: ActiveIpPatient) => apiService.fetchPatientsICDCode(p.ipId))
        );
        const statusMap: Record<number, boolean> = {};
        results.forEach((result, idx) => {
          const ipId = patientList[idx].ipId;
          statusMap[ipId] = result.status === 'fulfilled' && result.value.length > 0;
        });
        setIcdStatusMap(statusMap);
      }
    } catch (error) {
      console.error('Error fetching active IP patients:', error);
      await showErrorModal('Failed to load active IP patients. Please try again.', 'Error');
      setPatients([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = (value: string) => {
    setSearchTerm(value);
  };

  const handleRefresh = async () => {
    await fetchIpPatientsForIcdEntry();
    showWarningToast('Patient list refreshed');
  };

  const searchIcdCodes = async (searchTerm: string) => {
    setIcdSearchLoading(true);
    try {
      const response = await apiService.fetchIcdCode(searchTerm);
      const extractedResults = response.map((item: any) => ({
        diseaseId: Number(item.diseaseId) || 0,
        diseaseCode: item.diseaseCode ?? '',
        diseaseName: item.diseaseName ?? '',
        subDiseaseId: Number(item.subDiseaseId) || 0,
        subDiseaseCode: item.subDiseaseCode ?? null,
        subDiseaseName: item.subDiseaseName ?? null,
      }));
      setIcdSearchResults(extractedResults);
      setShowIcdDropdown(true);
    } catch (error) {
      console.error('Error searching ICD codes:', error);
      setIcdSearchResults([]);
    } finally {
      setIcdSearchLoading(false);
    }
  };

  const handleSelectIcdCode = (result: IcdCodeResult) => {
    const displayName = result.subDiseaseName ?? result.diseaseName;
    const displayCode = result.subDiseaseCode ?? result.diseaseCode;
    setNewIcdDiseaseName(displayName);
    setNewIcdDiseaseCode(displayCode);
    setNewIcdDiseaseId(result.diseaseId);
    setNewIcdSubDiseaseId(result.subDiseaseId);
    setShowIcdDropdown(false);
  };

  const handleViewIcd = async (patient: ActiveIpPatient) => {
    setViewIcdPatient(patient);
    setViewIcdData([]);
    setViewIcdLoading(true);
    setShowViewModal(true);
    try {
      const data = await apiService.fetchPatientsICDCode(patient.ipId);
      if (data.length === 0) {
        setShowViewModal(false);
        showWarningToast('No ICD entries found for this patient');
      } else {
        setViewIcdData(data);
      }
    } catch (error) {
      setShowViewModal(false);
      showErrorModal('Failed to fetch ICD entries. Please try again.', 'Error');
    } finally {
      setViewIcdLoading(false);
    }
  };

  const handleAddIcd = (patient: ActiveIpPatient) => {
    setSelectedPatient(patient);
    setIcdEntries([]);
    setNewIcdDiseaseName('');
    setNewIcdDiseaseCode('');
    setNewIcdDiseaseId(0);
    setNewIcdSubDiseaseId(0);
    setNewIcdNotes('');
    setShowModal(true);
  };

  const handleAddIcdEntry = () => {
    if (!newIcdDiseaseName.trim() || !newIcdDiseaseCode.trim() || newIcdDiseaseId <= 0) {
      showWarningToast('Please select disease name from the list');
      return;
    }
    const newEntry: IcdEntry = {
      id: icdEntries.length + 1,
      diseaseName: newIcdDiseaseName,
      diseaseCode: newIcdDiseaseCode,
      diseaseId: newIcdDiseaseId,
      subDiseaseId: newIcdSubDiseaseId,
      notes: newIcdNotes,
    };
    setIcdEntries([...icdEntries, newEntry]);
    setNewIcdDiseaseName('');
    setNewIcdDiseaseCode('');
    setNewIcdDiseaseId(0);
    setNewIcdSubDiseaseId(0);
    setNewIcdNotes('');
    setIcdSearchResults([]);
    setShowIcdDropdown(false);
  };

  const handleDeleteIcdEntry = (id: number) => {
    setIcdEntries(icdEntries.filter((entry) => entry.id !== id));
  };

  const handleSaveIcdEntries = async () => {
    if (icdEntries.length === 0) {
      showWarningToast('Please add at least one ICD entry');
      return;
    }
    if (!selectedPatient?.ipId) {
      showWarningToast('Patient information is missing');
      return;
    }
    setIsSaving(true);
    try {
      const payload = {
        ipId: selectedPatient.ipId,
        icdDetails: icdEntries.map((entry) => ({
          diseaseId: entry.diseaseId,
          subDiseaseId: entry.subDiseaseId,
          note: entry.notes || '',
        })),
      };
      await apiService.saveIcdDetails(payload);
      showSuccessToast('ICD entries saved successfully');
      setShowModal(false);
      setIcdEntries([]);
      fetchIpPatientsForIcdEntry();
    } catch (error) {
      showErrorModal('Failed to save ICD entries. Please try again.', 'Error');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Container fluid className="py-4">
      <PageHeader
        icon={faStethoscope}
        title="ICD Entry"
        subtitle="Active IP Patients"
        badges={[
          { label: 'Total Patients', value: patients.length }
        ]}
      />

      {/* Search Bar */}
      <Row className="mb-3 align-items-start">
        <Col md={12}>
          <SearchInput
            searchTerm={searchTerm}
            onSearchChange={handleSearch}
            placeholder="Search by IP #, patient name, ward, doctor..."
            resultCount={resultCount}
            totalCount={totalCount}
          />
        </Col>
      </Row>

      {/* Patient List Table */}
      <Row>
        <Col>
          <Card className="shadow-sm">
            <Card.Body className="p-0">
              {loading ? (
                <div className="d-flex justify-content-center align-items-center py-5">
                  <Spinner animation="border" role="status" className="me-2" />
                  <span className="text-muted">Loading active IP patients...</span>
                </div>
              ) : searchedData.length === 0 ? (
                <div className="text-center py-5 text-muted">
                  <p className="mb-0">No active IP patients found</p>
                </div>
              ) : (
                <div className="table-responsive">
                  <Table hover className="mb-0">
                    <thead className="bg-light">
                      <tr>
                        <th style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)' }}>IP #</th>
                        <th style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)' }}>OP #</th>
                        <th style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)' }}>Patient Name</th>
                        <th style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)' }}>Age / Gender</th>
                        <th style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)' }}>Ward / Bed</th>
                        <th style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)' }}>Admission Date</th>
                        <th style={{ fontSize: 'var(--font-size-sm)', fontWeight: 'var(--font-weight-semibold)' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {searchedData.map((patient) => (
                        <tr key={patient.ipId}>
                          <td>
                            <Badge className="theme-badge-primary">{patient.ipNo}</Badge>
                          </td>
                          <td className="small">{patient.opNo}</td>
                          <td className="small fw-bold text-dark">
                            {patient.patientName}
                          </td>
                          <td className="small">{patient.age} / {patient.gender}</td>
                          <td className="small">
                            <small className="text-muted">{patient.admittedWard}</small>
                            <br />
                            <small className="fw-bold">{patient.roomBed}</small>
                          </td>
                          <td className="small">{(() => {
                              const p = patient.admitDate?.split(/[- :]/);
                              if (!p || p.length < 5) return patient.admitDate;
                              const h = +p[3], ampm = h >= 12 ? 'PM' : 'AM', hh = h % 12 || 12;
                              return `${p[0]}/${p[1]}/${p[2].slice(2)} ${String(hh).padStart(2, '0')}:${p[4]} ${ampm}`;
                            })()}</td>
                          <td>
                            <div className="d-flex gap-2">
                              {icdStatusMap[patient.ipId] && (
                                <Button
                                  variant="outline-info"
                                  size="sm"
                                  onClick={() => handleViewIcd(patient)}
                                  title="View ICD entries"
                                >
                                  <FontAwesomeIcon icon={faEye} className="me-1" /> View
                                </Button>
                              )}
                              <Button 
                                variant="primary" 
                                size="sm" 
                                onClick={() => handleAddIcd(patient)}
                              >
                                Add ICD
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </Table>
                </div>
              )}
            </Card.Body>
          </Card>
        </Col>
      </Row>

      {/* View ICD Modal */}
      <Modal show={showViewModal} onHide={() => setShowViewModal(false)} size="lg" centered>
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="fw-bold">ICD Entries</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {viewIcdPatient && (
            <div className="mb-3 p-3 bg-light rounded">
              <Row>
                <Col md={4}>
                  <div className="small text-muted">Patient Name</div>
                  <div className="fw-bold">{viewIcdPatient.patientName}</div>
                </Col>
                <Col md={4}>
                  <div className="small text-muted">IP No</div>
                  <div className="fw-bold">{viewIcdPatient.ipNo}</div>
                </Col>
                <Col md={4}>
                  <div className="small text-muted">Ward / Bed</div>
                  <div className="fw-bold">{viewIcdPatient.admittedWard} / {viewIcdPatient.roomBed}</div>
                </Col>
              </Row>
            </div>
          )}
          {viewIcdLoading ? (
            <div className="d-flex justify-content-center align-items-center py-4">
              <Spinner animation="border" size="sm" className="me-2" />
              <span className="text-muted">Loading ICD entries...</span>
            </div>
          ) : (
            <div className="table-responsive">
              <Table hover bordered size="sm" className="mb-0">
                <thead className="bg-light">
                  <tr>
                    <th style={{ width: '50px', fontSize: 'var(--font-size-sm)' }}>S No</th>
                    <th style={{ fontSize: 'var(--font-size-sm)' }}>Disease Name</th>
                    <th style={{ fontSize: 'var(--font-size-sm)' }}>Sub Disease Name</th>
                  </tr>
                </thead>
                <tbody>
                  {viewIcdData.map((entry, idx) => (
                    <tr key={entry.diagnosisId}>
                      <td className="text-center">{idx + 1}</td>
                      <td className="fw-bold" style={{ fontSize: 'var(--font-size-sm)' }}>{entry.diseaseName}</td>
                      <td style={{ fontSize: 'var(--font-size-sm)' }}>{entry.subDiseaseName}</td>
                    </tr>
                  ))}
                </tbody>
              </Table>
            </div>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="secondary" size="sm" onClick={() => setShowViewModal(false)}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>

      {/* ICD Entry Modal */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="xl">
        <Modal.Header closeButton className="bg-light">
          <Modal.Title className="fw-bold">ICD CODE ENTRY</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {selectedPatient && (
            <>
              {/* Patient Details */}
              <div className="mb-4 p-3 bg-light rounded">
                <Row className="mb-3">
                    <Col md={4}>
                        <div className="mb-2">
                            <strong>Patient Name</strong>
                            <p className="mb-0">{selectedPatient.patientName}</p>
                        </div>
                    </Col>
                    <Col md={4}>
                        <div className="mb-2">
                            <strong>OP.No</strong>
                            <p className="mb-0">{selectedPatient.opNo}</p>
                        </div>
                    </Col>
                    <Col md={4}>
                        <div className="mb-2">
                            <strong>Sex</strong>
                            <p className="mb-0">{selectedPatient.gender} / {selectedPatient.age}</p>
                        </div>
                  </Col>
                </Row>
              </div>

              <hr />

              {/* ICD Entries Table */}
              <div className="mb-3">
                <h6 className="fw-bold mb-3">ICD Entries</h6>
                <div className="table-responsive mb-3">
                  <Table
                    hover
                    className="mb-0"
                    style={{ fontSize: 'var(--font-size-sm)' }}
                  >
                    <thead className="bg-light">
                      <tr>
                        <th style={{ width: '50px' }}>S No</th>
                        <th>Disease Name</th>
                        <th style={{ width: '120px' }}>Disease Code</th>
                        <th>Notes</th>
                        <th style={{ width: '80px' }}>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {icdEntries.length === 0 ? (
                        <tr>
                          <td colSpan={5} className="text-center text-muted py-3">
                            No ICD entries added yet
                          </td>
                        </tr>
                      ) : (
                        icdEntries.map((entry) => (
                          <tr key={entry.id}>
                            <td>{entry.id}</td>
                            <td className="fw-bold">{entry.diseaseName}</td>
                            <td>
                              <Badge bg="info">{entry.diseaseCode}</Badge>
                            </td>
                            <td>{entry.notes || '-'}</td>
                            <td>
                              <Button
                                variant="danger"
                                size="sm"
                                onClick={() => handleDeleteIcdEntry(entry.id)}
                              >
                                <FontAwesomeIcon icon={faTrash} />
                              </Button>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </Table>
                </div>

                {/* Add New ICD Entry Form */}
                <div className="p-3 bg-light rounded">
                  <h6 className="fw-bold mb-3">Add New ICD Entry</h6>
                  <Row className="mb-3">
                    <Col md={5}>
                      <Form.Group>
                        <Form.Label style={{ fontSize: 'var(--font-size-sm)' }}>
                          Disease Name
                        </Form.Label>
                        <div style={{ position: 'relative' }}>
                          <Form.Control
                            type="text"
                            value={newIcdDiseaseName}
                            onChange={(e) => {
                              setNewIcdDiseaseName(e.target.value);
                              setNewIcdDiseaseCode('');
                              setNewIcdDiseaseId(0);
                              setNewIcdSubDiseaseId(0);
                            }}
                            onFocus={() => {
                              if (icdSearchResults.length > 0) {
                                setShowIcdDropdown(true);
                              }
                            }}
                            placeholder="Enter disease name"
                            size="sm"
                          />
                          {icdSearchLoading && (
                            <div style={{
                              position: 'absolute',
                              right: '8px',
                              top: '50%',
                              transform: 'translateY(-50%)',
                            }}>
                              <Spinner animation="border" size="sm" />
                            </div>
                          )}
                          {showIcdDropdown && icdSearchResults.length > 0 && (
                            <ListGroup
                              style={{
                                position: 'absolute',
                                top: '100%',
                                left: 0,
                                right: 0,
                                zIndex: 1000,
                                maxHeight: '200px',
                                overflowY: 'auto',
                              }}
                            >
                              {icdSearchResults.map((result, idx) => (
                                <ListGroup.Item
                                  key={idx}
                                  action
                                  onClick={() => handleSelectIcdCode(result)}
                                  style={{
                                    padding: '8px 12px',
                                    fontSize: 'var(--font-size-sm)',
                                    cursor: 'pointer',
                                  }}
                                >
                                  <div className="fw-bold">
                                    {result.subDiseaseName ?? result.diseaseName}
                                  </div>
                                  <div style={{ fontSize: 'var(--font-size-xs)', color: '#666' }}>
                                    {result.subDiseaseCode ?? result.diseaseCode}
                                    {result.subDiseaseName && (
                                      <span className="ms-2 text-muted">({result.diseaseName})</span>
                                    )}
                                  </div>
                                </ListGroup.Item>
                              ))}
                            </ListGroup>
                          )}
                        </div>
                      </Form.Group>
                    </Col>
                    <Col md={3}>
                      <Form.Group>
                        <Form.Label style={{ fontSize: 'var(--font-size-sm)' }}>
                          Disease Code
                        </Form.Label>
                        <Form.Control
                          type="text"
                          value={newIcdDiseaseCode}
                          onChange={(e) => setNewIcdDiseaseCode(e.target.value)}
                          placeholder="e.g., A00.0"
                          size="sm"
                          readOnly
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group>
                        <Form.Label style={{ fontSize: 'var(--font-size-sm)' }}>
                          Notes
                        </Form.Label>
                        <Form.Control
                          type="text"
                          value={newIcdNotes}
                          onChange={(e) => setNewIcdNotes(e.target.value)}
                          placeholder="Additional notes"
                          size="sm"
                        />
                      </Form.Group>
                    </Col>
                  </Row>
                  <Button
                    variant="outline-secondary"
                    size="sm"
                    onClick={handleAddIcdEntry}
                  >
                    Add Entry
                  </Button>
                </div>
              </div>
            </>
          )}
        </Modal.Body>
        <Modal.Footer className="bg-light">
          <Button variant="secondary" onClick={() => setShowModal(false)}>
            Close
          </Button>
          <Button
            variant="primary"
            onClick={handleSaveIcdEntries}
            disabled={isSaving || icdEntries.length === 0}
          >
            {isSaving ? 'Saving...' : 'SAVE'}
          </Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
};

export default IcdEntry;