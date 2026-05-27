import React, { useEffect, useState } from 'react';
import { Container, Table, Card, Badge, Form, Row, Col, Button, Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faSignOutAlt, faBan, faUserMd, faBed, faCalendarAlt, faPhone } from '@fortawesome/free-solid-svg-icons';
import { useSelector } from 'react-redux';
import { MedicalRecordsApiService } from '../../../../api/medical-records/medical-records-api-service';
import { RootState } from '../../../../state/store';
import { showConfirmDialog, showErrorModal, showSuccessModal } from '../../../../utils/alertUtil';
import PageHeader from '../../../../components/PageHeader';
import { useTableSearch } from '../../../../hooks/useTableSearch';
import SearchInput from '../../../../components/SearchInput';

interface DischargePatient {
    ipId: number;
    patId: number;
    opVisitId: number;
    ipNo: string;
    opNo: string;
    patientName: string;
    age: string;
    gender: string;
    admittedWard: string;
    roomBed: string;
    address: string;
    mobileNumber: string;
    departmentName: string;
    admittedDoctorName: string;
    admitDate: string;
    ipVisitDetailId: number;
}

interface CancelBillStatus {
    otherBills: boolean;
    ipBills: boolean;
    ipBillPaid: boolean;
}

const Discharge: React.FC = () => {
    const apiService = new MedicalRecordsApiService();
    const loggedInUser = useSelector((state: RootState) => state.loginData);

    const [patients, setPatients] = useState<DischargePatient[]>([]);
    const [loading, setLoading] = useState(false);

    const { filteredData: filteredPatients, searchTerm, setSearchTerm, resultCount, totalCount } = useTableSearch<DischargePatient>({
        data: patients,
        searchFields: ['ipNo', 'opNo', 'patientName', 'admittedWard', 'admittedDoctorName', 'mobileNumber'],
    });
    const [selectedPatientDetails, setSelectedPatientDetails] = useState<any>(null);
    const [showDetailsModal, setShowDetailsModal] = useState<boolean>(false);
    const [cancelBillStatusMap, setCancelBillStatusMap] = useState<Record<number, CancelBillStatus | null>>({});

    useEffect(() => {
        loadDischargePatients();
    }, []);

    const loadDischargePatients = async () => {
        setLoading(true);
        try {
            const response = await apiService.fetchActiveIpPatients();
            const data = response?.data || response || [];

            // Map API response to component structure
            const mappedPatients: DischargePatient[] = Array.isArray(data)
                ? data.map((p: any) => ({
                    ipId: p.ipId,
                    patId: p.patId,
                    opVisitId: p.opVisitId,
                    ipNo: p.ipNo || '-',
                    opNo: p.opNo || '-',
                    patientName: p.patientName || '-',
                    age: p.age || '-',
                    gender: p.gender || '-',
                    admittedWard: p.admittedWard || '-',
                    roomBed: p.roomBed || '-',
                    address: p.address || '-',
                    mobileNumber: p.mobileNumber || '-',
                    departmentName: p.departmentName || '-',
                    admittedDoctorName: p.admittedDoctorName || '-',
                    admitDate: p.admitDate || '-',
                    ipVisitDetailId: p.ipVisitDetailId || 0,
                }))
                : [];

            const parseAdmitDate = (dateStr: string): number => {
                if (!dateStr || dateStr === '-') return 0;
                const [datePart, timePart] = dateStr.split(' ');
                const [dd, mm, yyyy] = datePart.split('-');
                const d = new Date(`${yyyy}-${mm}-${dd}T${timePart || '00:00:00'}`);
                return isNaN(d.getTime()) ? 0 : d.getTime();
            };

            const sortedPatients = [...mappedPatients].sort(
                (a, b) => parseAdmitDate(a.admitDate) - parseAdmitDate(b.admitDate)
            );

            setPatients(sortedPatients);

            const statusEntries = await Promise.all(
                mappedPatients.map(async (patient) => {
                    try {
                        const status = await apiService.fetchDetailsForIPAdmmitCancel(patient.ipId);
                        return [patient.ipId, status] as const;
                    } catch (statusError) {
                        console.error('Error checking cancel bill status:', statusError);
                        return [patient.ipId, null] as const;
                    }
                })
            );

            setCancelBillStatusMap(Object.fromEntries(statusEntries));
        } catch (error: any) {
            console.error('Error loading discharge patients:', error);
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

    const handleDischarge = (patient: DischargePatient) => {
        const confirmMessage = `OP No: ${patient.opNo}\nName: ${patient.patientName}\n\nDischarge this patient?`;

        showConfirmDialog(confirmMessage, 'Confirm Discharge', 'Yes, Discharge', 'Cancel').then(async (result) => {
            if (result.isConfirmed) {
                try {
                    // Format: yyyy-MM-dd HH:mm:ss
                    const now = new Date();
                    const year = now.getFullYear();
                    const month = String(now.getMonth() + 1).padStart(2, '0');
                    const day = String(now.getDate()).padStart(2, '0');
                    const hours = String(now.getHours()).padStart(2, '0');
                    const minutes = String(now.getMinutes()).padStart(2, '0');
                    const seconds = String(now.getSeconds()).padStart(2, '0');
                    const currentDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

                    const uid = loggedInUser?.id || 0;

                    const dischargeRequest = {
                        ipId: patient.ipId,
                        patId: patient.patId,
                        dischargeDateTime: currentDateTime,
                        uid: uid
                    };

                    await apiService.dischargePatient(dischargeRequest);

                    await showSuccessModal('Patient discharged successfully', 'Success');

                    // Reload patients list
                    loadDischargePatients();
                } catch (error: any) {
                    await showErrorModal(error?.response?.data?.message || 'Failed to discharge patient', 'Error');
                    console.error('Discharge error:', error);
                }
            }
        });
    };

    const handleCancelIpVisit = (patient: DischargePatient) => {
        const confirmMessage = `OP No: ${patient.opNo}\nName: ${patient.patientName}\n\nCancel this IP visit?`;

        showConfirmDialog(confirmMessage, 'Confirm Cancel', 'Yes, Cancel', 'No').then(async (result) => {
            if (result.isConfirmed) {
                setLoading(true);
                try {
                    await apiService.UpdateCancelIpVisit({
                        ipId: patient.ipId,
                        patId: patient.patId,
                    });

                    await showSuccessModal('IP visit cancelled successfully', 'Success');
                    loadDischargePatients();
                } catch (error: any) {
                    await showErrorModal(error?.response?.data?.message || 'Failed to cancel IP visit', 'Error');
                    console.error('Cancel IP visit error:', error);
                } finally {
                    setLoading(false);
                }
            }
        });
    };

    const renderCancelAction = (patient: DischargePatient) => {
        const status = cancelBillStatusMap[patient.ipId];

        if (!status) {
            return null;
        }

        if (status.otherBills) {
            return null;
        }

        if (!status.ipBills) {
            return (
                <Button
                    variant="link"
                    className="theme-btn-link-secondary"
                    size="sm"
                    onClick={() => handleCancelIpVisit(patient)}
                    title="Cancel/Discharge"
                >
                    <FontAwesomeIcon icon={faBan} className="me-1" />
                    Cancel
                </Button>
            );
        }

        return (
            <span className="text-warning small fw-medium">
                cancel the generated ip bil to activate the cancel btn
            </span>
        );
    };

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            {/* Header */}
            <PageHeader
                icon={faSignOutAlt}
                title="Patient Discharge"
                subtitle="Manage IP patient discharges"
                badges={[
                    { label: 'Total Patients', value: filteredPatients.length }
                ]}
            />

            <div style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column', width: '100%' }}>
            <Container fluid className="px-3 pb-3 d-flex flex-column h-100">

                {/* Search + Legend */}
                <Card className="discharge-shell-card mb-3">
                    <Card.Body className="py-2 px-3">
                        <Row className="align-items-center g-2">
                            <Col md={6}>
                                <SearchInput
                                    searchTerm={searchTerm}
                                    onSearchChange={setSearchTerm}
                                    placeholder="Search by IP No, OP No, Name, Ward, Doctor, Mobile..."
                                    resultCount={resultCount}
                                    totalCount={totalCount}
                                />
                            </Col>
                            <Col md={6} className="d-flex justify-content-end align-items-center gap-3">
                                <div className="d-flex align-items-center gap-1">
                                    <span className="discharge-legend-dot discharge-legend-paid"></span>
                                    <small className="text-muted">IP Bill Paid</small>
                                </div>
                            </Col>
                        </Row>
                    </Card.Body>
                </Card>

                {/* Patients Table */}
                <Card className="discharge-shell-card flex-grow-1" style={{ minHeight: 0 }}>
                    <Card.Body className="p-0 d-flex flex-column h-100">
                        <div style={{ flex: 1, overflowY: 'auto', minHeight: 0 }}>
                            <Table className="discharge-table mb-0" hover>
                                <thead className="discharge-thead">
                                    <tr>
                                        <th style={{ width: '44px' }}>#</th>
                                        <th>IP / OP No</th>
                                        <th>Patient</th>
                                        <th>Ward &amp; Bed</th>
                                        <th>Admit Date</th>
                                        <th>Doctor</th>
                                        <th className="text-center">Actions</th>
                                        <th className="text-center">Cancel</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {loading ? (
                                        <tr>
                                            <td colSpan={8} className="text-center py-5">
                                                <div className="spinner-border text-primary" role="status">
                                                    <span className="visually-hidden">Loading...</span>
                                                </div>
                                                <div className="text-muted mt-2 small">Loading patients...</div>
                                            </td>
                                        </tr>
                                    ) : filteredPatients.length === 0 ? (
                                        <tr>
                                            <td colSpan={8} className="text-center py-5 text-muted">
                                                <FontAwesomeIcon icon={faBed} size="2x" className="mb-2 opacity-25 d-block mx-auto" />
                                                No IP patients found
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredPatients.map((patient, index) => {
                                            const billStatus = cancelBillStatusMap[patient.ipId];
                                            const isPaid = billStatus?.ipBillPaid === true;
                                            return (
                                                <tr key={patient.ipId} className={isPaid ? 'discharge-row-paid' : ''}>
                                                    <td className="text-muted small">{index + 1}</td>
                                                    <td>
                                                        <div>
                                                            <Badge className="theme-badge-primary px-2 py-1 me-1" style={{ fontSize: 'var(--font-size-xs)' }}>{patient.ipNo}</Badge>
                                                        </div>
                                                        <div className="mt-1">
                                                            <span className="text-muted small">{patient.opNo}</span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="fw-semibold discharge-patient-name">{patient.patientName}</div>
                                                        <div className="discharge-meta mt-1">
                                                            <span>{patient.age}</span>
                                                            <span className="discharge-dot">·</span>
                                                            <span>{patient.gender}</span>
                                                            {patient.mobileNumber !== '-' && (
                                                                <>
                                                                    <span className="discharge-dot">·</span>
                                                                    <FontAwesomeIcon icon={faPhone} className="me-1" />
                                                                    <span>{patient.mobileNumber}</span>
                                                                </>
                                                            )}
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div>
                                                            <Badge className="theme-badge-secondary px-2 py-1" style={{ fontSize: 'var(--font-size-xs)' }}>
                                                                <FontAwesomeIcon icon={faBed} className="me-1" />{patient.admittedWard}
                                                            </Badge>
                                                        </div>
                                                        <div className="discharge-meta mt-1">{patient.roomBed}</div>
                                                    </td>
                                                    <td>
                                                        <div className="d-flex align-items-center gap-1">
                                                            <FontAwesomeIcon icon={faCalendarAlt} className="text-muted" size="xs" />
                                                            <span className="small">
                                                                {patient.admitDate && patient.admitDate !== '-'
                                                                    ? (() => {
                                                                        const [datePart, timePart] = patient.admitDate.split(' ');
                                                                        const [dd, mm, yyyy] = datePart.split('-');
                                                                        const parsed = new Date(`${yyyy}-${mm}-${dd}T${timePart || '00:00:00'}`);
                                                                        return isNaN(parsed.getTime())
                                                                            ? patient.admitDate
                                                                            : parsed.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
                                                                    })()
                                                                    : '-'}
                                                            </span>
                                                        </div>
                                                    </td>
                                                    <td>
                                                        <div className="d-flex align-items-center gap-1">
                                                            <FontAwesomeIcon icon={faUserMd} className="text-muted" size="xs" />
                                                            <span className="small">{patient.admittedDoctorName}</span>
                                                        </div>
                                                        <div className="discharge-meta mt-1">{patient.departmentName}</div>
                                                    </td>
                                                    <td className="text-center">
                                                        <div className="d-flex gap-2 justify-content-center">
                                                            <Button
                                                                className="theme-outline-btn-primary"
                                                                size="sm"
                                                                onClick={() => fetchPatientDetailsByOpNumber(patient.opNo)}
                                                                disabled={loading}
                                                            >
                                                                <FontAwesomeIcon icon={faSearch} className="me-1" />
                                                                View
                                                            </Button>
                                                            <Button
                                                                className="theme-btn-primary"
                                                                size="sm"
                                                                onClick={() => handleDischarge(patient)}
                                                                disabled={loading || !cancelBillStatusMap[patient.ipId]?.ipBillPaid}
                                                            >
                                                                <FontAwesomeIcon icon={faSignOutAlt} className="me-1" />
                                                                Discharge
                                                            </Button>
                                                        </div>
                                                    </td>
                                                    <td className="text-center">
                                                        {renderCancelAction(patient)}
                                                    </td>
                                                </tr>
                                            );
                                        })
                                    )}
                                </tbody>
                            </Table>
                        </div>
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
                .discharge-shell-card {
                    border: none;
                    border-radius: 10px;
                    box-shadow: var(--shadow-sm);
                }
                .discharge-thead th {
                    background-color: var(--bg-main);
                    color: var(--page-secondary-color);
                    font-size: var(--font-size-xs);
                    font-weight: var(--font-weight-semibold);
                    text-transform: uppercase;
                    letter-spacing: 0.04em;
                    padding: 0.65rem 0.85rem;
                    border-bottom: 2px solid var(--border-color);
                    white-space: nowrap;
                    position: sticky;
                    top: 0;
                    z-index: 1;
                }
                .discharge-table td {
                    padding: 0.65rem 0.85rem;
                    vertical-align: middle;
                    border-bottom: 1px solid var(--border-color);
                    font-size: var(--font-size-sm);
                }
                .discharge-table tbody tr:hover td {
                    background-color: var(--bg-main);
                }
                .discharge-row-paid td {
                    background-color: #fff0f0 !important;
                }
                .discharge-row-paid:hover td {
                    background-color: #ffe5e5 !important;
                }
                .discharge-patient-name {
                    font-size: var(--font-size-sm);
                    color: var(--text-primary);
                }
                .discharge-meta {
                    font-size: var(--font-size-xs);
                    color: var(--text-muted);
                }
                .discharge-dot {
                    margin: 0 0.25rem;
                    color: var(--border-color);
                }
                .discharge-legend-dot {
                    display: inline-block;
                    width: 12px;
                    height: 12px;
                    border-radius: 3px;
                }
                .discharge-legend-paid {
                    background-color: #fca5a5;
                }
            `}</style>
        </div>
    );
};

export default Discharge;