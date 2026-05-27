import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, Table, InputGroup, Badge, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faFolder, faFolderOpen, faCheckCircle, faExclamationTriangle } from '@fortawesome/free-solid-svg-icons';
import { MedicalRecordsApiService } from '../../../../api/medical-records/medical-records-api-service';
import PageHeader from '../../../../components/PageHeader';
import { showConfirmDialog, showErrorModal, showInfoModal, showSuccessModal, showWarningModal } from '../../../../utils/alertUtil';

// TODO: Move interface to shared types file
interface OPCardPatient {
    id: number;
    displayNumber: string;
    name: string;
    lastVisitDate: string;
}

const RefileOPCards: React.FC = () => {
    const apiService = new MedicalRecordsApiService();
    
    const [patients, setPatients] = useState<OPCardPatient[]>([]);
    const [filteredPatients, setFilteredPatients] = useState<OPCardPatient[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [searchOpNumber, setSearchOpNumber] = useState<string>('');
    const [searchName, setSearchName] = useState<string>('');
    const [selectedPatients, setSelectedPatients] = useState<number[]>([]);
    const [refilingInProgress, setRefilingInProgress] = useState<boolean>(false);
    const [selectedPatientDetails, setSelectedPatientDetails] = useState<any>(null);
    const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);

    // Fetch all OP card patients on component mount
    useEffect(() => {
        fetchPatients();
    }, []);

    // Filter patients based on search criteria
    useEffect(() => {
        let filtered = patients;

        if (searchOpNumber.trim()) {
            filtered = filtered.filter(p => 
                p.displayNumber.toLowerCase().includes(searchOpNumber.toLowerCase())
            );
        }

        if (searchName.trim()) {
            filtered = filtered.filter(p => 
                p.name.toLowerCase().includes(searchName.toLowerCase())
            );
        }

        setFilteredPatients(filtered);
    }, [searchOpNumber, searchName, patients]);

    const fetchPatients = async () => {
        setLoading(true);
        try {
            const response = await apiService.fetchActiveOpPatients();
            const data = response?.data || response || [];
            
            // Map API response to component structure
            const mappedPatients: OPCardPatient[] = Array.isArray(data) ? data.map((p: any) => ({
                id: p.patientId,
                displayNumber: p.displayNumber,
                name: p.patientName,
                lastVisitDate: p.lastVisitDate
            })) : [];
            
            console.log('Active OP patients loaded:', mappedPatients);
            setPatients(mappedPatients);
            setFilteredPatients(mappedPatients);
        } catch (error: any) {
            console.error('Error fetching OP patients:', error);
            await showErrorModal(error.response?.data?.message || 'Failed to fetch OP card patients', 'Error!');
        } finally {
            setLoading(false);
        }
    };

    const fetchPatientDetailsByOpNumber = async (displayNumber: string) => {
        setLoading(true);
        try {
            const response = await apiService.fetchPatientDetails(displayNumber);
            const patientData = response?.data || response;
            
            if (patientData) {
                setSelectedPatientDetails(patientData);
                setShowDetailsModal(true);
            } else {
                await showErrorModal('Patient details not found', 'Error');
            }
        } catch (error: any) {
            console.error('Error fetching patient details:', error);
            await showErrorModal(error.response?.data?.message || 'Failed to fetch patient details', 'Error!');
        } finally {
            setLoading(false);
        }
    };

    const handleSelectPatient = (patientId: number) => {
        if (selectedPatients.includes(patientId)) {
            setSelectedPatients(selectedPatients.filter(id => id !== patientId));
        } else {
            setSelectedPatients([...selectedPatients, patientId]);
        }
    };

    const handleSelectAll = () => {
        if (selectedPatients.length === filteredPatients.length) {
            setSelectedPatients([]);
        } else {
            setSelectedPatients(filteredPatients.map(p => p.id));
        }
    };

    const handleRefileSingle = async (patientId: number, patientName: string) => {
        const result = await showConfirmDialog(
            `Are you sure you want to refile the card for ${patientName}?`,
            'Confirm Refile',
            'Yes, Refile',
            'Cancel'
        );

        if (result.isConfirmed) {
            setRefilingInProgress(true);
            try {
                const payload = {
                    patIds: [patientId],
                    uid: 1 // TODO: Get from logged-in user context
                };
                
                console.log('📁 Refiling patient:', payload);
                const response = await apiService.refileOpCards(payload);
                
                await showSuccessModal(response?.message || 'OP card refiled successfully', 'Success!');
                fetchPatients(); // Refresh the list
            } catch (error: any) {
                await showErrorModal(error.response?.data?.message || 'Failed to refile OP card', 'Error!');
            } finally {
                setRefilingInProgress(false);
            }
        }
    };

    const handleRefileSelected = async () => {
        if (selectedPatients.length === 0) {
            await showWarningModal('Please select at least one patient to refile', 'No Selection');
            return;
        }

        const result = await showConfirmDialog(
            `Are you sure you want to refile ${selectedPatients.length} selected card(s)?`,
            'Confirm Refile',
            'Yes, Refile',
            'Cancel'
        );

        if (result.isConfirmed) {
            setRefilingInProgress(true);
            try {
                const payload = {
                    patIds: selectedPatients,
                    uid: 1 // TODO: Get from logged-in user context
                };
                
                console.log('📁 Refiling selected patients:', payload);
                const response = await apiService.refileOpCards(payload);
                
                await showSuccessModal(response?.message || `${selectedPatients.length} OP card(s) refiled successfully`, 'Success!');
                setSelectedPatients([]);
                fetchPatients(); // Refresh the list
            } catch (error: any) {
                await showErrorModal(error.response?.data?.message || 'Failed to refile selected cards', 'Error!');
            } finally {
                setRefilingInProgress(false);
            }
        }
    };

    const handleRefileAll = async () => {
        if (filteredPatients.length === 0) {
            await showInfoModal('No patients available to refile', 'No Patients');
            return;
        }

        const result = await showConfirmDialog(
            `This will refile ${filteredPatients.length} OP card(s). Are you sure you want to proceed?`,
            'Confirm Refile All',
            'Yes, Refile All',
            'Cancel'
        );

        if (result.isConfirmed) {
            setRefilingInProgress(true);
            try {
                const patientIds = filteredPatients.map(p => p.id);
                const payload = {
                    patIds: patientIds,
                    uid: 1 // TODO: Get from logged-in user context
                };
                
                console.log('📁 Refiling all patients:', payload);
                const response = await apiService.refileOpCards(payload);
                
                await showSuccessModal(response?.message || `${patientIds.length} OP card(s) refiled successfully`, 'Success!');
                setSelectedPatients([]);
                fetchPatients(); // Refresh the list
            } catch (error: any) {
                await showErrorModal(error.response?.data?.message || 'Failed to refile all cards', 'Error!');
            } finally {
                setRefilingInProgress(false);
            }
        }
    };

    const handleReset = () => {
        setSearchOpNumber('');
        setSearchName('');
        setSelectedPatients([]);
        setFilteredPatients(patients);
    };

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Header */}
            <PageHeader
                icon={faFolder}
                title="Refile OP Cards"
                subtitle="Manage and refile outpatient cards"
                badges={[
                    { label: 'Total Patients', value: filteredPatients.length }
                ]}
            />

            {/* Content Body */}
            <div style={{ flex: 1, width: '100%' }}>
                <Container fluid className="px-3 pb-3">
                    {/* Search & Actions */}
                    <Card className="neat-card mb-3">
                    <Card.Body className="p-3">
                        <Row className="g-2 align-items-end">
                            <Col md={3}>
                                <Form.Group className="position-relative">
                                    <Form.Control
                                        type="text"
                                        placeholder=" "
                                        value={searchOpNumber}
                                        onChange={(e) => setSearchOpNumber(e.target.value)}
                                        style={{ height: '32px' }}
                                    />
                                    <Form.Label className="floating-label">OP Number</Form.Label>
                                </Form.Group>
                            </Col>
                            <Col md={3}>
                                <Form.Group className="position-relative">
                                    <Form.Control
                                        type="text"
                                        placeholder=" "
                                        value={searchName}
                                        onChange={(e) => setSearchName(e.target.value)}
                                        style={{ height: '32px' }}
                                    />
                                    <Form.Label className="floating-label">Patient Name</Form.Label>
                                </Form.Group>
                            </Col>
                            <Col md={2}>
                                <Button 
                                    className="theme-outline-btn-primary w-100"
                                    onClick={handleReset}
                                    style={{ height: '32px' }}
                                >
                                    Reset
                                </Button>
                            </Col>
                            <Col md={4} className="text-end">
                                <div className="d-flex gap-2 justify-content-end">
                                    <Button 
                                        className="theme-btn-primary"
                                        onClick={handleRefileSelected}
                                        disabled={selectedPatients.length === 0 || refilingInProgress}
                                        style={{ height: '32px' }}
                                    >
                                        <FontAwesomeIcon icon={faFolderOpen} className="me-2" />
                                        Refile Selected ({selectedPatients.length})
                                    </Button>
                                    <Button 
                                        className="theme-btn-primary"
                                        onClick={handleRefileAll}
                                        disabled={filteredPatients.length === 0 || refilingInProgress}
                                        style={{ height: '32px' }}
                                    >
                                        <FontAwesomeIcon icon={faCheckCircle} className="me-2" />
                                        Refile All
                                    </Button>
                                </div>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* Patients Table */}
                <Card className="neat-card">
                    <Card.Body className="p-0">
                        {loading ? (
                            <div className="text-center py-5">
                                <div className="spinner-border text-primary" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>
                                <p className="mt-3 text-muted">Loading patients...</p>
                            </div>
                        ) : filteredPatients.length === 0 ? (
                            <div className="text-center py-5 text-muted">
                                <FontAwesomeIcon icon={faExclamationTriangle} size="3x" className="mb-3 opacity-25" />
                                <p className="mb-0">No patients found</p>
                                <small>Try adjusting your search criteria</small>
                            </div>
                        ) : (
                            <div style={{ maxHeight: '65vh', overflowY: 'auto' }}>
                                <Table hover className="mb-0 align-middle">
                                    <thead className="bg-light text-muted text-uppercase small" style={{ position: 'sticky', top: 0, zIndex: 1 }}>
                                        <tr>
                                            <th className="py-3 ps-4" style={{ width: '50px' }}>
                                                <Form.Check 
                                                    type="checkbox"
                                                    checked={selectedPatients.length === filteredPatients.length && filteredPatients.length > 0}
                                                    onChange={handleSelectAll}
                                                />
                                            </th>
                                            <th className="py-3" style={{ width: '10%' }}>#</th>
                                            <th className="py-3" style={{ width: '20%' }}>OP Number</th>
                                            <th className="py-3" style={{ width: '30%' }}>Patient Name</th>
                                            <th className="py-3" style={{ width: '20%' }}>Last Visit Date</th>
                                            <th className="py-3 text-center" style={{ width: '20%' }}>Action</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {filteredPatients.map((patient, index) => (
                                            <tr key={patient.id}>
                                                <td className="ps-4">
                                                    <Form.Check 
                                                        type="checkbox"
                                                        checked={selectedPatients.includes(patient.id)}
                                                        onChange={() => handleSelectPatient(patient.id)}
                                                    />
                                                </td>
                                                <td className="fw-bold text-muted">{index + 1}</td>
                                                <td>
                                                    <Badge className="theme-badge-secondary px-3 py-2 fw-bold">
                                                        {patient.displayNumber}
                                                    </Badge>
                                                </td>
                                                <td className="fw-medium">{patient.name}</td>
                                                <td className="">
                                                    {patient.lastVisitDate || 'N/A'}
                                                </td>
                                                <td className="text-center">
                                                    <div className="d-flex gap-2 justify-content-center">
                                                        <Button 
                                                            className="theme-outline-btn-primary"
                                                            size="sm"
                                                            onClick={() => fetchPatientDetailsByOpNumber(patient.displayNumber)}
                                                            disabled={loading}
                                                        >
                                                            <FontAwesomeIcon icon={faSearch} className="me-1" />
                                                            View
                                                        </Button>
                                                        <Button 
                                                            className="theme-outline-btn-primary"
                                                            size="sm"
                                                            onClick={() => handleRefileSingle(patient.id, patient.name)}
                                                            disabled={refilingInProgress}
                                                        >
                                                            <FontAwesomeIcon icon={faFolderOpen} className="me-1" />
                                                            Refile
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
            </Container>
            </div>

            {/* Patient Details Modal */}
            <Modal show={showDetailsModal} onHide={() => setShowDetailsModal(false)} size="lg" centered backdrop="static" keyboard={false}>
                <Modal.Header closeButton className="border-bottom py-3 bg-light">
                    <Modal.Title className="h5 fw-bold">
                        <FontAwesomeIcon icon={faSearch} className="me-2 text-primary" />
                        Patient Details
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {selectedPatientDetails ? (
                        <div className="p-3">
                            <Row className="g-3">
                                <Col md={6}>
                                    <div className="border-bottom pb-2 mb-2">
                                        <small className="text-muted text-uppercase fw-bold">OP Number</small>
                                        <div className="fw-bold fs-5" style={{color: 'var(--page-secondary-color)'}}>{selectedPatientDetails.displayNumber}</div>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="border-bottom pb-2 mb-2">
                                        <small className="text-muted text-uppercase fw-bold">First Name</small>
                                        <div className="fw-medium">{selectedPatientDetails.name}</div>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="border-bottom pb-2 mb-2">
                                        <small className="text-muted text-uppercase fw-bold">Second Name</small>
                                        <div className="fw-medium">{selectedPatientDetails.secName}</div>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="border-bottom pb-2 mb-2">
                                        <small className="text-muted text-uppercase fw-bold">Guardian Name</small>
                                        <div className="fw-medium">{selectedPatientDetails.gname}</div>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="border-bottom pb-2 mb-2">
                                        <small className="text-muted text-uppercase fw-bold">Phone</small>
                                        <div className="fw-medium">{selectedPatientDetails.phone}</div>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="border-bottom pb-2 mb-2">
                                        <small className="text-muted text-uppercase fw-bold">Date of Birth</small>
                                        <div className="fw-medium">{selectedPatientDetails.dob}</div>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="border-bottom pb-2 mb-2">
                                        <small className="text-muted text-uppercase fw-bold">Sex</small>
                                        <div className="fw-medium">{selectedPatientDetails.sex}</div>
                                    </div>
                                </Col>
                                <Col md={12}>
                                    <div className="border-bottom pb-2 mb-2">
                                        <small className="text-muted text-uppercase fw-bold">Address</small>
                                        <div className="fw-medium">{selectedPatientDetails.add1}</div>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="border-bottom pb-2 mb-2">
                                        <small className="text-muted text-uppercase fw-bold">District</small>
                                        <div className="fw-medium">{selectedPatientDetails.district}</div>
                                    </div>
                                </Col>
                                <Col md={6}>
                                    <div className="border-bottom pb-2 mb-2">
                                        <small className="text-muted text-uppercase fw-bold">Pincode</small>
                                        <div className="fw-medium">{selectedPatientDetails.pincode}</div>
                                    </div>
                                </Col>
                                <Col md={12}>
                                    <div className="bg-light p-3 rounded">
                                        <div className="d-flex justify-content-between align-items-center">
                                            <div>
                                                <small className="text-muted text-uppercase fw-bold d-block mb-1">Status</small>
                                                <Badge className={selectedPatientDetails.isInOp === true ? 'theme-badge-primary me-2' : 'theme-badge-secondary me-2'}>
                                                    OP: {selectedPatientDetails.isInOp === true ? 'Active' : 'Inactive'}
                                                </Badge>
                                                <Badge className={selectedPatientDetails.isInIp === true ? 'theme-badge-primary' : 'theme-badge-secondary'}>
                                                    IP: {selectedPatientDetails.isInIp === true ? 'Active' : 'Inactive'}
                                                </Badge>
                                            </div>
                                        </div>
                                    </div>
                                </Col>
                            </Row>
                        </div>
                    ) : (
                        <div className="text-center py-5 text-muted">
                            <p>No patient details available</p>
                        </div>
                    )}
                </Modal.Body>
                <Modal.Footer className="border-top">
                    <Button className="theme-outline-btn-primary" onClick={() => setShowDetailsModal(false)}>
                        Close
                    </Button>
                </Modal.Footer>
            </Modal>

            <style>{`
                .refile-op-cards .neat-card {
                    border: none;
                    border-radius: 12px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
                }
            `}</style>
        </div>
    );
};

export default RefileOPCards;
