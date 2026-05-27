import React, { useState, useEffect } from 'react';
import { Container, Row, Col, Card, Form, Button, InputGroup, Badge, Table } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faBuilding, faUser, faIdCard, faEdit, faSave, faTimes, faInfoCircle } from '@fortawesome/free-solid-svg-icons';
import { showValidationError, showErrorToast, showSuccessToast } from '../../../../utils/alertUtil';
import PageHeader from '../../../../components/PageHeader';
import { MedicalRecordsApiService } from '../../../../api/medical-records/medical-records-api-service';
import { useSelector } from 'react-redux';
import { RootState } from '../../../../state/store';

const CompanyUpdation: React.FC = () => {
    const apiService = new MedicalRecordsApiService();
    const loginData = useSelector((state: RootState) => state.loginData); // To trigger re-renders on global state changes if needed
    const [opNumber, setOpNumber] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [patientData, setPatientData] = useState<any>(null);
    const [selectedCompany, setSelectedCompany] = useState<string>('');
    const [referenceNo, setReferenceNo] = useState<string>('');
    const [companies, setCompanies] = useState<any[]>([]);
    const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
    const [loadingCompanies, setLoadingCompanies] = useState<boolean>(false);

    // Fetch all companies/account heads on component mount
    useEffect(() => {
        fetchCompanies();
    }, []);

    // Fetch companies from API
    const fetchCompanies = async () => {
        setLoadingCompanies(true);
        try {
            const response = await apiService.fetchAccountHeads();
            console.log('Fetched account heads:', response);
            setCompanies(Array.isArray(response) ? response : []);
        } catch (error: any) {
            console.error('Error fetching account heads:', error);
            showErrorToast('Failed to load companies');
            setCompanies([]);
        } finally {
            setLoadingCompanies(false);
        }
    };

    // Handle OP Number Search
    const handleSearchPatient = async () => {
        if (!opNumber.trim()) {
            showValidationError('Please enter OP Number');
            return;
        }

        setLoading(true);
        try {
            const response = await apiService.fetchPatientDetails(opNumber.trim());
            const patientInfo = response?.data || response;
            
            if (!patientInfo) {
                showErrorToast('Patient not found');
                setPatientData(null);
                return;
            }

            console.log('Patient details fetched:', patientInfo);
            setPatientData(patientInfo);
            setSelectedCompany(patientInfo.debitId?.toString() || '');
            showSuccessToast('Patient details loaded successfully');
        } catch (error: any) {
            console.error('Error fetching patient details:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Failed to fetch patient details';
            showErrorToast(errorMsg);
            setPatientData(null);
        } finally {
            setLoading(false);
        }
    };

    // Handle Enter key press
    const handleKeyPress = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleSearchPatient();
        }
    };

    // Handle form reset
    const handleReset = () => {
        setOpNumber('');
        setPatientData(null);
        setSelectedCompany('');
        setReferenceNo('');
        setIsSubmitting(false);
    };

    // Handle company update submission
    const handleUpdateCompany = async () => {
        if (!selectedCompany) {
            showValidationError('Please select a company');
            return;
        }

        if (!patientData?.patId) {
            showErrorToast('Invalid patient data');
            return;
        }

        if (!patientData?.lastVisitId) {
            showErrorToast('Invalid visit data');
            return;
        }

        setIsSubmitting(true);
        try {

            const uid = loginData?.id || 0;

            const payload = {
                patId: patientData.patId,
                visitId: patientData.lastVisitId,
                debitId: parseInt(selectedCompany),
                referenceNo: referenceNo.trim(),
                uid: uid
            };
            
            await apiService.updatePatientCompany(payload);
            
            showSuccessToast('Company updated successfully');
            handleReset();
        } catch (error: any) {
            console.error('Error updating company:', error);
            const errorMsg = error.response?.data?.message || error.message || 'Failed to update company';
            showErrorToast(errorMsg);
            setIsSubmitting(false);
        }
    };

    return (
        <div style={{ height: '100vh', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <PageHeader
                icon={faBuilding}
                title="Patient Company Updation"
                subtitle="Update patient company information"
                badges={[
                    { label: 'Medical Records', value: '' }
                ]}
            />

            {/* Main Content */}
            <div className="content-body" style={{ flex: 1, minHeight: 0, overflowY: 'auto'}}>
                <Container fluid>
                    <Row className="g-3">
                        {/* Left Section - Search */}
                        <Col lg={4}>
                            <Card className="shadow-sm border-0 h-100" style={{ borderLeft: '4px solid var(--page-primary-color)' }}>
                                <Card.Header className="bg-light border-0">
                                    <h6 className="mb-0 fw-bold text-dark">
                                        <FontAwesomeIcon icon={faSearch} className="me-2" />
                                        Search Patient
                                    </h6>
                                </Card.Header>
                                <Card.Body className="p-3">
                                    <Form.Group className="mb-3">
                                        <Form.Label className="fw-bold mb-2 small text-muted">
                                            Enter OP Number <span className="text-danger">*</span>
                                        </Form.Label>
                                        <InputGroup>
                                            <InputGroup.Text className="bg-white border-end-0">
                                                <FontAwesomeIcon icon={faIdCard} className="text-muted" />
                                            </InputGroup.Text>
                                            <Form.Control
                                                type="text"
                                                placeholder="e.g., 26-4"
                                                value={opNumber}
                                                onChange={(e) => setOpNumber(e.target.value)}
                                                onKeyPress={handleKeyPress}
                                                disabled={loading}
                                                className="border-start-0 ps-0"
                                                autoFocus
                                            />
                                        </InputGroup>
                                    </Form.Group>

                                    <div className="d-flex gap-2">
                                        <Button 
                                            className="theme-btn-primary w-100"
                                            onClick={handleSearchPatient}
                                            disabled={loading || !opNumber.trim()}
                                        >
                                            {loading ? (
                                                <>
                                                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                    Searching...
                                                </>
                                            ) : (
                                                <>
                                                    <FontAwesomeIcon icon={faSearch} className="me-2" />
                                                    Search Patient
                                                </>
                                            )}
                                        </Button>
                                    </div>

                                    {/* Quick Tips */}
                                    <div className="mt-4 p-3 bg-light rounded border">
                                        <div className="small text-muted mb-2">
                                            <FontAwesomeIcon icon={faInfoCircle} className="me-1" /> Quick Tips:
                                        </div>
                                        <ul className="small mb-0 ps-3">
                                            <li>Enter the patient's OP number</li>
                                            <li>Press Enter or click Search</li>
                                            <li>Select new company from dropdown</li>
                                            <li>Click Update to save changes</li>
                                        </ul>
                                    </div>
                                </Card.Body>
                            </Card>
                        </Col>

                        {/* Right Section - Patient Details & Company Update */}
                        <Col lg={8}>
                            {patientData ? (
                                <Card className="shadow-sm border-0 h-100" style={{ borderLeft: '4px solid var(--page-primary-color)' }}>
                                    <Card.Header className="bg-light border-0">
                                        <h6 className="mb-0 fw-bold text-dark">
                                            <FontAwesomeIcon icon={faUser} className="me-2" />
                                            Patient Information
                                        </h6>
                                    </Card.Header>
                                    <Card.Body className="p-3">
                                        {/* Patient Details Section */}
                                        <div className="mb-4 p-3 bg-light rounded border">
                                            <Row>
                                                <Col md={6}>
                                                    <div className="mb-2">
                                                        <span className="text-muted small">OP Number:</span>
                                                        <div className="fw-bold fs-5" style={{color: 'var(--page-secondary-color)'}}>{patientData.displayNumber || opNumber}</div>
                                                    </div>
                                                    <div className="mb-2">
                                                        <span className="text-muted small">Patient Name:</span>
                                                        <div className="fw-bold">{patientData.name} {patientData.secName}</div>
                                                    </div>
                                                    <div className="mb-2">
                                                        <span className="text-muted small">Age / Sex:</span>
                                                        <div className="fw-bold">{patientData.age} / {patientData.sex}</div>
                                                    </div>
                                                </Col>
                                                <Col md={6}>
                                                    <div className="mb-2">
                                                        <span className="text-muted small">Guardian Name:</span>
                                                        <div className="fw-bold">{patientData.gname || 'N/A'}</div>
                                                    </div>
                                                    <div className="mb-2">
                                                        <span className="text-muted small">Phone Number:</span>
                                                        <div className="fw-bold">{patientData.phone || 'N/A'}</div>
                                                    </div>
                                                    <div className="mb-2">
                                                        <span className="text-muted small">Address:</span>
                                                        <div className="fw-bold">{patientData.add1 ? `${patientData.add1}, ${patientData.village || ''}` : 'N/A'}</div>
                                                    </div>
                                                </Col>
                                            </Row>
                                            <Row className="mt-2">
                                                <Col md={6}>
                                                    <div className="mb-2">
                                                        <span className="text-muted small">Last Doctor:</span>
                                                        <div className="fw-bold">{patientData.doctorName || 'N/A'}</div>
                                                    </div>
                                                </Col>
                                                <Col md={6}>
                                                    <div className="mb-2">
                                                        <span className="text-muted small">Department:</span>
                                                        <div className="fw-bold">{patientData.departmentName || 'N/A'}</div>
                                                    </div>
                                                </Col>
                                            </Row>
                                        </div>

                                        {/* Company Update Section */}
                                        <div className="p-3 border rounded">
                                            <h6 className="fw-bold mb-3 text-dark">
                                                <FontAwesomeIcon icon={faEdit} className="me-2 text-warning" />
                                                Update Company Information
                                            </h6>
                                            
                                            <Form.Group className="mb-3">
                                                <Form.Label className="fw-bold small">
                                                    Current Company / Account Category
                                                </Form.Label>
                                                <div className="p-2 bg-light rounded border">
                                                    <Badge className="theme-badge-secondary px-3 py-2">
                                                        {patientData.debitHead || patientData.accountCategory || 'No Company Assigned'}
                                                    </Badge>
                                                </div>
                                            </Form.Group>

                                            <Form.Group className="mb-3">
                                                <Form.Label className="fw-bold small">
                                                    Select New Company <span className="text-danger">*</span>
                                                </Form.Label>
                                                <Form.Select
                                                    value={selectedCompany}
                                                    onChange={(e) => setSelectedCompany(e.target.value)}
                                                    disabled={isSubmitting || loadingCompanies}
                                                >
                                                    <option value="">-- Select Company --</option>
                                                    {companies.map((company) => (
                                                        <option key={company.headId} value={company.headId}>
                                                            {company.headName}
                                                        </option>
                                                    ))}
                                                </Form.Select>
                                                {loadingCompanies && (
                                                    <small className="text-muted mt-1 d-block">
                                                        <span className="spinner-border spinner-border-sm me-1" role="status" aria-hidden="true"></span>
                                                        Loading companies...
                                                    </small>
                                                )}
                                            </Form.Group>

                                            <Form.Group className="mb-4">
                                                <Form.Label className="fw-bold small">
                                                    Reference Number
                                                </Form.Label>
                                                <Form.Control
                                                    type="text"
                                                    placeholder="Enter reference number (optional)"
                                                    value={referenceNo}
                                                    onChange={(e) => setReferenceNo(e.target.value)}
                                                    disabled={isSubmitting}
                                                />
                                            </Form.Group>

                                            {/* Action Buttons */}
                                            <div className="d-flex gap-2 mb-5">
                                                <Button 
                                                    className="theme-btn-primary flex-grow-1"
                                                    onClick={handleUpdateCompany}
                                                    disabled={isSubmitting || !selectedCompany}
                                                >
                                                    {isSubmitting ? (
                                                        <>
                                                            <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                                            Updating...
                                                        </>
                                                    ) : (
                                                        <>
                                                            <FontAwesomeIcon icon={faSave} className="me-2" />
                                                            Update Company
                                                        </>
                                                    )}
                                                </Button>
                                                <Button 
                                                    className="theme-outline-btn-primary"
                                                    onClick={handleReset}
                                                    disabled={isSubmitting}
                                                >
                                                    <FontAwesomeIcon icon={faTimes} className="me-2" />
                                                    Reset
                                                </Button>
                                            </div>
                                        </div>
                                    </Card.Body>
                                </Card>
                            ) : (
                                <Card className="shadow-sm border-0 h-100 bg-light">
                                    <Card.Body className="d-flex align-items-center justify-content-center">
                                        <div className="text-center text-muted">
                                            <FontAwesomeIcon icon={faSearch} size="3x" className="mb-3 opacity-25" />
                                            <h5 className="mb-2">No Patient Selected</h5>
                                            <p className="mb-0 small">
                                                Enter an OP Number and click Search to view patient details
                                            </p>
                                        </div>
                                    </Card.Body>
                                </Card>
                            )}
                        </Col>
                    </Row>
                </Container>
            </div>
        </div>
    );
};

export default CompanyUpdation;
