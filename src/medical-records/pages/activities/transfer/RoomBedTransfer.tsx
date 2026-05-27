import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Table, Modal, Row, Col, Badge, InputGroup } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBed, faSearch, faExchangeAlt, faHospital, faUserInjured } from '@fortawesome/free-solid-svg-icons';
import { useSelector } from 'react-redux';
import { MedicalRecordsApiService } from '../../../../api/medical-records/medical-records-api-service';
import { useTableSearch } from '../../../../hooks/useTableSearch';
import SearchInput from '../../../../components/SearchInput';
import PageHeader from '../../../../components/PageHeader';
import { showConfirmDialog, showErrorModal, showInfoModal, showSuccessModal, showWarningModal } from '../../../../utils/alertUtil';
import { RootState } from '../../../../state/store';
import { current } from '@reduxjs/toolkit';

// TODO: Move interfaces to shared types file
interface IPPatient {
    id: number;
    ipId: number;
    ipNumber: string;
    opNumber: string;
    patientName: string;
    wardName: string;
    wardId: number;
    roomBedName: string;
    roomId: number;
    ipVisitId: number;
    currentRoomId: number;
    ipVisitDetailId: number;
}

interface AvailableBed {
    id: number;
    name: string;
    isOccupied: number;
}

interface Ward {
    id: number;
    name: string;
    numberOccupied: number;
    numberElements: number;
}

interface RoomBedTransferRequest {
    ipVisitId: number;
    newRoomBedId: number;
    transferReason: string;
}

const RoomBedTransfer: React.FC = () => {
    const apiService = new MedicalRecordsApiService();
    const loginData = useSelector((state: RootState) => state.loginData);
    
    const [patients, setPatients] = useState<IPPatient[]>([]);
    const [loading, setLoading] = useState(false);
    
    // Use common search pattern for patients
    const { 
        filteredData: filteredPatients, 
        searchTerm, 
        setSearchTerm, 
        resultCount, 
        totalCount 
    } = useTableSearch({
        data: patients,
        searchFields: ['ipNumber', 'opNumber', 'patientName'],
    });
    
    // Transfer Modal States
    const [showTransferModal, setShowTransferModal] = useState(false);
    const [selectedPatient, setSelectedPatient] = useState<IPPatient | null>(null);
    const [wards, setWards] = useState<Ward[]>([]);
    const [selectedWardId, setSelectedWardId] = useState<number | null>(null);
    const [availableBeds, setAvailableBeds] = useState<AvailableBed[]>([]);
    const [selectedBedId, setSelectedBedId] = useState<number | null>(null);
    const [transferReason, setTransferReason] = useState('');
    const [loadingBeds, setLoadingBeds] = useState(false);
    const [isTransferring, setIsTransferring] = useState(false);
    
    // Use common search pattern for wards
    const {
        filteredData: filteredWards,
        searchTerm: wardSearchTerm,
        setSearchTerm: setWardSearchTerm,
        resultCount: wardResultCount,
        totalCount: wardTotalCount
    } = useTableSearch({
        data: wards,
        searchFields: ['name'],
    });
    
    // Use common search pattern for beds
    const {
        filteredData: filteredBeds,
        searchTerm: bedSearchTerm,
        setSearchTerm: setBedSearchTerm,
        resultCount: bedResultCount,
        totalCount: bedTotalCount
    } = useTableSearch({
        data: availableBeds,
        searchFields: ['name'],
    });

    const [transferReasons, setTransferReasons] = useState<{ id: number; name: string }[]>([]);

    useEffect(() => {
        loadPatients();
    }, []);

    const loadPatients = async () => {
        setLoading(true);
        try {
            const response = await apiService.fetchActiveIpPatients();
            const data = response?.data || response || [];
            
            // Map API response to component structure
            const mappedPatients: IPPatient[] = Array.isArray(data) ? data.map((p: any) => ({
                id: p.patId,
                ipId: p.ipId,
                ipNumber: p.ipNo,
                opNumber: p.opNo,
                patientName: p.patientName,
                wardName: p.admittedWard,
                wardId: Number(p.wardId || p.admittedWardId || 0),
                roomBedName: p.roomBed,
                roomId: Number(p.roomId || p.roomBedId || 0),
                patType: Number(p.patType || 0),
                grpId: Number(p.grpId || 0),
                isRetained: Number(p.isRetained || 0),
                ipVisitId: p.ipId,
                currentRoomId: Number(p.currentRoomId),
                ipVisitDetailId: Number(p.ipVisitDetailId),
            })) : [];
            
            console.log('Active IP patients loaded:', mappedPatients);
            setPatients(mappedPatients);
        } catch (error: any) {
            console.error('Error loading IP patients:', error);
            await showErrorModal(error.response?.data?.message || 'Failed to load IP patients', 'Error');
        } finally {
            setLoading(false);
        }
    };

    const loadWards = async () => {
        try {
            const response = await apiService.fetchAllWards();
            const data = response || [];
            
            // Map to Ward interface
            const mappedWards: Ward[] = Array.isArray(data) ? data.map((w: any) => ({
                id: w.id,
                name: w.name || `Ward ${w.id}`,
                numberOccupied: w.numberOccupied || 0,
                numberElements: w.numberElements || 0
            })) : [];
            
            console.log('Wards loaded:', mappedWards);
            setWards(mappedWards);
        } catch (error: any) {
            console.error('Error loading wards:', error);
            await showErrorModal(error.response?.data?.message || 'Failed to load wards', 'Error');
        }
    };

    const loadTransferReasons = async () => {
        try {
            const response = await apiService.fetchAllBedTransferReasons();
            const validReasons = Array.isArray(response)
                ? response.filter((r: any) => r.isValid === 1).map((r: any) => ({ id: r.id, name: r.name }))
                : [];
            setTransferReasons(validReasons);
        } catch (error) {
            setTransferReasons([]);
        }
    };



    const handleOpenTransferModal = (patient: IPPatient) => {
        setSelectedPatient(patient);
        setShowTransferModal(true);
        setSelectedWardId(null);
        setSelectedBedId(null);
        setAvailableBeds([]);
        setTransferReason('');
        setWardSearchTerm('');
        setBedSearchTerm('');
        loadWards();
        loadTransferReasons();
    };

    const handleWardChange = async (wardId: number) => {
        setSelectedWardId(wardId);
        setSelectedBedId(null);
        setBedSearchTerm('');
        setLoadingBeds(true);
        try {
            const response = await apiService.fetchRoomBedByWardId(wardId);
            const data = response?.data || response || [];
            
            // Map to AvailableBed interface - filter only available beds (not occupied)
            // API returns rooms with roomId and name (room name)
            // isOccupied: 1 = occupied, 0 = available
            const mappedBeds: AvailableBed[] = Array.isArray(data) ? data
                .filter((room: any) => room.isOccupied !== 1) // Only available rooms (isOccupied = 0)
                .map((room: any) => ({
                    id: room.roomId || room.id,
                    name: room.name || `Room ${room.roomId || room.id}`,
                    isOccupied: room.isOccupied || 0
                })) : [];
            
            console.log('Available beds loaded for ward', wardId, ':', mappedBeds);
            setAvailableBeds(mappedBeds);
            
            if (mappedBeds.length === 0) {
                await showInfoModal('There are no available beds in this ward', 'No Available Beds');
            }
        } catch (error: any) {
            console.error('Error loading beds:', error);
            await showErrorModal(error.response?.data?.message || 'Failed to load available beds', 'Error');
        } finally {
            setLoadingBeds(false);
        }
    };

    const handleTransfer = async () => {
        if (!selectedPatient || !selectedBedId || !transferReason.trim()) {
            await showWarningModal('Please select a bed and provide a transfer reason', 'Warning');
            return;
        }

        const result = await showConfirmDialog(
            `Transfer ${selectedPatient.patientName} to the selected bed?`,
            'Confirm Transfer',
            'Yes, Transfer',
            'Cancel'
        );

        if (result.isConfirmed) {
            try {
                setIsTransferring(true);

                const now = new Date();
                const date = now.toISOString().split('T')[0];
                const time = now.toTimeString().split(' ')[0];

                const selectedReasonObj = transferReasons.find(r => String(r.id) === transferReason);

                await apiService.savePatientBedTransfer({
                    wardId: Number(selectedWardId),
                    stayId: Number(selectedPatient.ipVisitDetailId),
                    roomId: Number(selectedBedId),
                    grpId: Number(0),
                    uid: Number(loginData?.id),
                    date,
                    time,
                    isRetained: Number(0),
                    patType: Number(0),
                    oldRoom: Number(selectedPatient.currentRoomId),
                    reason: selectedReasonObj ? selectedReasonObj.id : 0,
                });

                const request: RoomBedTransferRequest = {
                    ipVisitId: selectedPatient.ipVisitId,
                    newRoomBedId: selectedBedId,
                    transferReason: transferReason.trim(),
                };

                console.log('Room/Bed transferred with request:', request);

                await showSuccessModal('Room/Bed transferred successfully', 'Success');
                setShowTransferModal(false);
                loadPatients();
            } catch (error: any) {
                await showErrorModal(error?.response?.data?.error || 'Failed to transfer room/bed', 'Error');
            } finally {
                setIsTransferring(false);
            }
        }
    };

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Header */}
            <PageHeader
                icon={faBed}
                title="Room & Bed Transfer"
                subtitle="Manage IP patient room and bed transfers"
                badges={[
                    { label: 'Total Patients', value: filteredPatients.length }
                ]}
            />

            {/* Content Body */}
            <div style={{ flex: 1, width: '100%' }}>
                <Container fluid className="px-3 pb-3">
                {/* Search Section */}
                <Card className="neat-card mb-3">
                    <Card.Body className="p-3">
                        <Row className="g-2">
                            <Col md={6}>
                                <SearchInput
                                    searchTerm={searchTerm}
                                    onSearchChange={setSearchTerm}
                                    placeholder="Search by IP No, OP No, or Patient Name..."
                                    resultCount={resultCount}
                                    totalCount={totalCount}
                                />
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* Patients Table */}
                <Card className="neat-card">
                    <Card.Body className="p-0">
                        <div style={{ maxHeight: '65vh', overflowY: 'auto' }}>
                            <Table hover responsive className="mb-0">
                                <thead style={{ position: 'sticky', top: 0, backgroundColor: '#f8f9fa', zIndex: 1 }}>
                                    <tr>
                                        <th className="py-3">IP No</th>
                                        <th className="py-3">OP No</th>
                                        <th className="py-3">Patient Name</th>
                                        <th className="py-3">Ward</th>
                                        <th className="py-3">Room/Bed</th>
                                        <th className="py-3 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={6} className="text-center py-4">
                                                <div className="spinner-border spinner-border-sm text-primary" role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                </div>
                                            </td>
                                        </tr>
                                    ) : filteredPatients.length === 0 ? (
                                        <tr>
                                            <td colSpan={6} className="text-center text-muted py-4">
                                                No IP patients found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredPatients.map((patient) => (
                                            <tr key={patient.id}>
                                                <td><Badge className="theme-badge-secondary px-2 py-1">{patient.ipNumber}</Badge></td>
                                                <td>{patient.opNumber}</td>
                                                <td className="fw-medium">{patient.patientName}</td>
                                                <td>
                                                    <Badge className="theme-badge-primary fw-normal px-2 py-1">
                                                        {patient.wardName}
                                                    </Badge>
                                                </td>
                                                <td>
                                                    <Badge className="theme-badge-secondary fw-normal px-2 py-1">
                                                        {patient.roomBedName}
                                                    </Badge>
                                                </td>
                                                <td className="text-center">
                                                    <Button
                                                        className="theme-btn-primary"
                                                        size="sm"
                                                        onClick={() => handleOpenTransferModal(patient)}
                                                    >
                                                        <FontAwesomeIcon icon={faExchangeAlt} className="me-1" />
                                                        Transfer
                                                    </Button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </Table>
                        </div>
                    </Card.Body>
                </Card>
                </Container>
            </div>

            {/* Transfer Modal */}
            <Modal show={showTransferModal} onHide={() => setShowTransferModal(false)} size="lg" centered>
                <Modal.Header closeButton className="bg-light border-bottom">
                    <div style={{ width: '100%' }}>
                        <div className="d-flex align-items-center mb-2">
                            <FontAwesomeIcon icon={faExchangeAlt} className="me-2" />
                            <span style={{ fontSize: 'var(--font-size-xl)', fontWeight: 'var(--font-weight-semibold)' }}>Transfer Room & Bed</span>
                        </div>
                        {selectedPatient && (
                            <div className="d-flex align-items-center" style={{ fontSize: '0.875rem', opacity: 0.95 }}>
                                <span className="me-3">
                                    <strong>IP:</strong> {selectedPatient.ipNumber}
                                </span>
                                <span className="me-3">
                                    <strong>Patient:</strong> {selectedPatient.patientName}
                                </span>
                                <span>
                                    <strong>Current Bed:</strong> {selectedPatient.wardName} - {selectedPatient.roomBedName}
                                </span>
                            </div>
                        )}
                    </div>
                </Modal.Header>
                <Modal.Body className="p-4">
                    {selectedPatient && (
                        <>

                            {/* Transfer Reason and Actions */}
                            <Row className="align-items-center mb-3">
                                <Col md={4}>
                                    <Form.Group>
                                        <Form.Label className="fw-bold mb-1" style={{ fontSize: '0.875rem' }}>Transfer Reason</Form.Label>
                                        <Form.Select
                                            value={transferReason}
                                            onChange={(e) => setTransferReason(e.target.value)}
                                            style={{ height: '28px', fontSize: '0.875rem' }}
                                        >
                                            <option value="">-- Select Reason --</option>
                                            {transferReasons.map((reason) => (
                                                <option key={reason.id} value={String(reason.id)}>
                                                    {reason.name}
                                                </option>
                                            ))}
                                        </Form.Select>
                                    </Form.Group>
                                </Col>
                                <Col md={8} className="text-end">
                                    <Button className="theme-outline-btn-primary me-2" onClick={() => setShowTransferModal(false)} size="sm" style={{ marginTop: '20px' }}>
                                        Cancel
                                    </Button>
                                    <Button
                                        className="theme-btn-primary"
                                        onClick={handleTransfer}
                                        disabled={!selectedBedId || isTransferring}
                                        size="sm"
                                        style={{ marginTop: '20px' }}
                                    >
                                        <FontAwesomeIcon icon={faExchangeAlt} className="me-2" />
                                        {isTransferring ? 'Transferring...' : 'Confirm Transfer'}
                                    </Button>
                                </Col>
                            </Row>

                            {/* Ward and Beds Side by Side */}
                            <Row>
                                {/* Ward Selection - Left Side */}
                                <Col md={4}>
                                    <Card className="mb-3 shadow-sm border-0">
                                        <Card.Body className="p-2">
                                            <SearchInput
                                                searchTerm={wardSearchTerm}
                                                onSearchChange={setWardSearchTerm}
                                                placeholder="Search ward..."
                                                resultCount={wardResultCount}
                                                totalCount={wardTotalCount}
                                            />
                                            <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                                <Row className="g-2 my-1">
                                                    {filteredWards.map((ward) => (
                                                        <Col xs={12} key={ward.id}>
                                                            <div
                                                                className={`ward-card ${selectedWardId === ward.id ? 'ward-card-selected' : ''}`}
                                                                onClick={() => handleWardChange(ward.id)}
                                                                style={{
                                                                    border: selectedWardId === ward.id ? `2px solid var(--page-primary-color)` : '1px solid #e2e8f0',
                                                                    borderRadius: '6px',
                                                                    padding: '8px 10px',
                                                                    cursor: 'pointer',
                                                                    transition: 'all 0.3s ease',
                                                                    backgroundColor: selectedWardId === ward.id ? 'rgba(var(--page-primary-rgb), 0.05)' : 'white',
                                                                    boxShadow: selectedWardId === ward.id ? 'var(--box-shadow-primary)' : '0 1px 3px rgba(0,0,0,0.05)'
                                                                }}
                                                            >
                                                                <div className="d-flex justify-content-between align-items-center">
                                                                    <div style={{ flex: 1 }}>
                                                                        <div className="fw-bold" style={{ fontSize: '0.875rem', color: selectedWardId === ward.id ? 'var(--page-primary-color)' : '#2d3748' }}>
                                                                            {ward.name}
                                                                        </div>
                                                                        <small className="text-muted" style={{ fontSize: '0.75rem' }}>
                                                                            Occupied: {ward.numberOccupied}/{ward.numberElements} | Free: {ward.numberElements - ward.numberOccupied}
                                                                        </small>
                                                                    </div>
                                                                    {selectedWardId === ward.id && (
                                                                        <div className="text-primary">
                                                                            <i className="fas fa-check-circle"></i>
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </Col>
                                                    ))}
                                                </Row>
                                            </div>
                                        </Card.Body>
                                    </Card>
                                </Col>

                                {/* Available Beds - Right Side */}
                                <Col md={8}>
                                    {selectedWardId && (
                                        <Card className="mb-3 shadow-sm border-0">
                                            <Card.Body className="p-2">
                                                <SearchInput
                                                    searchTerm={bedSearchTerm}
                                                    onSearchChange={setBedSearchTerm}
                                                    placeholder="Search bed..."
                                                    resultCount={bedResultCount}
                                                    totalCount={bedTotalCount}
                                                />
                                                <div style={{ maxHeight: '400px', overflowY: 'auto' }}>
                                                    {loadingBeds ? (
                                                        <div className="text-center py-3">
                                                            <div className="spinner-border spinner-border-sm text-primary" role="status">
                                                                <span className="visually-hidden">Loading...</span>
                                                            </div>
                                                            <p className="text-muted mt-2 mb-0" style={{ fontSize: '0.875rem' }}>Loading beds...</p>
                                                        </div>
                                                    ) : filteredBeds.length === 0 ? (
                                                        <div className="text-center py-3">
                                                            <FontAwesomeIcon icon={faBed} className="text-muted fs-3 mb-2" />
                                                            <p className="text-muted mb-0" style={{ fontSize: '0.875rem' }}>
                                                                {bedSearchTerm ? 'No beds match your search' : 'No beds available in this ward'}
                                                            </p>
                                                        </div>
                                                    ) : (
                                                        <Row className="g-2 my-1">
                                                            {filteredBeds.map((bed) => (
                                                                <Col md={3} key={bed.id}>
                                                        <div
                                                            className={`bed-card ${selectedBedId === bed.id ? 'bed-card-selected' : ''} ${bed.isOccupied === 1 ? 'bed-card-disabled' : ''}`}
                                                            onClick={() => bed.isOccupied === 0 && setSelectedBedId(bed.id)}
                                                                style={{
                                                                    border: selectedBedId === bed.id ? `2px solid var(--page-secondary-color)` : '1px solid #e2e8f0',
                                                                    borderRadius: '6px',
                                                                    padding: '8px',
                                                                    cursor: bed.isOccupied === 1 ? 'not-allowed' : 'pointer',
                                                                    transition: 'all 0.3s ease',
                                                                    backgroundColor: bed.isOccupied === 1 ? '#f7fafc' : (selectedBedId === bed.id ? 'rgba(var(--page-secondary-rgb), 0.05)' : 'white'),
                                                                    opacity: bed.isOccupied === 1 ? 0.5 : 1,
                                                                    boxShadow: selectedBedId === bed.id ? 'var(--box-shadow-secondary)' : '0 1px 3px rgba(0,0,0,0.05)'
                                                                }}
                                                        >
                                                            <div className="d-flex flex-column align-items-center text-center">
                                                                <FontAwesomeIcon 
                                                                    icon={faBed} 
                                                                    className={`mb-1 ${bed.isOccupied === 1 ? 'text-muted' : (selectedBedId === bed.id ? 'text-danger' : 'text-success')}`}
                                                                    style={{ fontSize: '1.25rem' }}
                                                                />
                                                                <div className="fw-bold mb-1" style={{ fontSize: 'var(--font-size-md)', color: bed.isOccupied === 1 ? '#a0aec0' : '#2d3748' }}>
                                                                    {bed.name}
                                                                </div>
                                                                <Badge 
                                                                    className={bed.isOccupied === 1 ? 'theme-badge-secondary' : 'theme-badge-primary'}
                                                                    style={{ fontSize: 'var(--font-size-xs)', padding: '2px 6px' }}
                                                                >
                                                                    {bed.isOccupied === 1 ? 'Occupied' : 'Available'}
                                                                </Badge>
                                                            </div>
                                                                </div>
                                                            </Col>
                                                        ))}
                                                    </Row>
                                                )}
                                                </div>
                                            </Card.Body>
                                        </Card>
                                    )}
                                </Col>
                            </Row>
                        </>
                    )}
                </Modal.Body>
            </Modal>

            <style>{`
                .neat-card {
                    border: none;
                    border-radius: 12px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
                }
                
                .ward-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
                }
                
                .bed-card:not(.bed-card-disabled):hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1) !important;
                }
                
                .bg-gradient {
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                }
            `}</style>
        </div>
    );
};

export default RoomBedTransfer;
